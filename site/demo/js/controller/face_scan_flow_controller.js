/**
 * Face scan runtime flow:
 * start camera -> align -> countdown -> record -> emit blob-ready event.
 */
import * as H from "../utils/face_scan_helpers.js";
import { FaceScanFaceModel } from "../utils/face_scan_face_model.js";
import { FaceScanCameraController } from "./face_scan_camera_controller.js";
import { FaceScanRecordingController } from "./face_scan_recording_controller.js";
import { FaceScanUpload } from "../service/service.js";
import { stopMusicPlayback } from "./music_stream_controller.js";
import { t } from "../i18n/index.js";

/** Fade out background music when face recording finishes (blob ready), not when starting the camera. */
var MUSIC_FADE_MS_AFTER_RECORDING_COMPLETE = 5000;

var RECORD_TARGET_MS = 15000;
var ALIGN_INTERVAL_MS = 120;
var STABLE_HIT_COUNT = 4;
var FACE_MIN_FRAC = 0.12;
var FACE_MAX_FRAC = 0.86;
var RECORD_VIDEO_BPS_MP4 = 2200000;
var RECORD_VIDEO_BPS_WEBM = 1800000;

var MODEL_URL_CDN =
  "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
var MODEL_URL_LOCAL = "models";

var context = {
  phase: "idle",
  stream: null,
  recorder: null,
  alignTimer: null,
  recordFramingTimer: null,
  countdownTimer: 0,
  placementStableHits: 0,
  recordBudgetAccumMs: 0,
  recordBudgetLastSample: null,
  recordingFaceInGuide: false,
  recordingFramingReady: false,
  detectionInFlight: false,
};

var faceModelsReady = false;
var faceModelsLoadFailed = false;
var modelsLoadPromise = null;
var cameraDOM = null;
/** When false, consent UI is hidden and camera may start without checkbox (second scan). */
var faceScanConsentRequired = true;

/** Active camera + recording refs after successful init (for wizard landing reset). */
var faceScanFlowHandles = {
  camera: null,
  recording: null,
};

/**
 * Collect all face scan DOM elements used by the runtime flow.
 * @returns {Record<string, HTMLElement|null>}
 */
function getDomReferences() {
  return {
    panelInstructions: H.byId("panel-instructions"),
    panelScan: H.byId("panel-scan"),
    scanIntro: H.byId("scan-intro"),
    panelResult: H.byId("panel-result"),
    preview: H.byId("preview"),
    placementStatus: H.byId("placement-status"),
    scanHudStars: H.byId("scan-hud-stars"),
    scanHudText: H.byId("scan-hud-text"),
    scanHudBottom: H.byId("scan-hud-bottom"),
    scanRingArc: H.byId("scan-ring-arc"),
    modelsStatus: H.byId("models-status"),
    btnStart: H.byId("btn-start"),
    btnCancel: H.byId("btn-cancel"),
    overlayCountdown: H.byId("overlay-countdown"),
    countdownNumber: H.byId("countdown-number"),
    recordingPill: H.byId("recording-pill"),
    recordingTime: H.byId("recording-time"),
    errorMsg: H.byId("error-msg"),
    mimeHint: H.byId("mime-hint"),
    faceScanFx: H.byId("face-scan-fx"),
    faceScanClipEl: H.byId("face-scan-fx-clip"),
    faceScanTarget: H.byId("face-scan-target"),
    faceConsentCheckbox: H.byId("face-consent-checkbox"),
    scanOverlayCamera: H.byId("scan-overlay-camera"),
    scanOverlayDenied: H.byId("scan-overlay-denied"),
    scanOverlayCameraText: H.byId("scan-overlay-camera-text"),
    scanOverlayTip: H.byId("scan-overlay-tip"),
    scanStageModel: H.byId("scan-stage-model"),
    scanStageCamera: H.byId("scan-stage-camera"),
    scanStageAlign: H.byId("scan-stage-align"),
    scanOverlayDeniedText: H.byId("scan-overlay-denied-text"),
    btnCameraRetry: H.byId("btn-camera-retry"),
    btnCameraBack: H.byId("btn-camera-back"),
  };
}

/**
 * Show or hide camera consent UI (first scan only).
 * @param {boolean} required
 */
export function setFaceScanConsentRequired(required) {
  faceScanConsentRequired = required !== false;
  syncStartButtonAvailability();
}

/**
 * Return whether the user has agreed to face scan consent.
 * @returns {boolean}
 */
function hasFaceScanConsent() {
  if (!faceScanConsentRequired) return true;
  return !!(
    cameraDOM.faceConsentCheckbox && cameraDOM.faceConsentCheckbox.checked
  );
}

/**
 * Enable or disable the start button based on detector readiness and consent.
 */
function syncStartButtonAvailability() {
  if (!cameraDOM.btnStart) return;
  var canStart =
    faceModelsReady &&
    !faceModelsLoadFailed &&
    (hasFaceScanConsent() || !faceScanConsentRequired);
  cameraDOM.btnStart.disabled = !canStart;
}

/**
 * Set the scan overlay tip text if the overlay exists.
 * @param {string} text
 */
function setScanOverlayTip(text) {
  if (!cameraDOM.scanOverlayTip) return;
  cameraDOM.scanOverlayTip.textContent = text || "";
}

/**
 * Update the quality HUD values and ring arc display.
 * @param {number|string} level
 * @param {string} text
 * @param {string} bottomText
 * @param {number|string} arcDeg
 */
function setScanHudQuality(level, text, bottomText, arcDeg) {
  var safeLevel = Math.max(1, Math.min(5, Number(level) || 1));
  if (cameraDOM.scanHudStars) {
    cameraDOM.scanHudStars.setAttribute("data-level", String(safeLevel));
  }
  if (cameraDOM.scanHudText && text) {
    cameraDOM.scanHudText.textContent = text;
  }
  if (cameraDOM.scanHudBottom && bottomText) {
    cameraDOM.scanHudBottom.textContent = bottomText;
  }
  if (cameraDOM.scanRingArc) {
    var deg = Math.max(24, Math.min(180, Number(arcDeg) || 36));
    cameraDOM.scanRingArc.style.setProperty("--arc-deg", deg + "deg");
  }
}

/**
 * Sync the HUD and overlay tip based on current face placement state.
 */
function syncScanHudFromPlacement() {
  if (!cameraDOM.placementStatus) return;
  var isGood = cameraDOM.placementStatus.classList.contains("state-good");
  var isBad = cameraDOM.placementStatus.classList.contains("state-bad");
  var phase = String(context.phase || "");
  var placementText = (cameraDOM.placementStatus.textContent || "").trim();

  if (isBad && placementText) {
    setScanOverlayTip(placementText);
  } else if (phase === "record" && isGood) {
    setScanOverlayTip(t("faceScan.hud.greatFraming"));
  }

  if (phase === "record" && isGood) {
    setScanHudQuality(
      5,
      t("faceScan.hud.greatSignal"),
      t("faceScan.hud.measuring"),
      168,
    );
    return;
  }

  if (isGood) {
    setScanHudQuality(
      4,
      t("faceScan.hud.alignmentGood"),
      t("faceScan.hud.almostReady"),
      132,
    );
    return;
  }

  if (isBad) {
    setScanHudQuality(
      2,
      t("faceScan.hud.moveIntoFrame"),
      t("faceScan.hud.adjustingPosition"),
      58,
    );
    return;
  }

  setScanHudQuality(
    3,
    t("faceScan.hud.defaultText"),
    t("faceScan.hud.preparing"),
    84,
  );
}

/**
 * Update the current camera model/align stage UI classes.
 * @param {string} stage
 */
function setScanOverlayStage(stage) {
  var stages = [
    { key: "model", el: cameraDOM.scanStageModel },
    { key: "camera", el: cameraDOM.scanStageCamera },
    { key: "align", el: cameraDOM.scanStageAlign },
  ];
  var rank =
    stage === "align" ? 3 : stage === "camera" ? 2 : stage === "model" ? 1 : 0;
  stages.forEach(function (item) {
    if (!item.el) return;
    var itemRank = item.key === "align" ? 3 : item.key === "camera" ? 2 : 1;
    item.el.classList.toggle("is-active", itemRank === rank);
    item.el.classList.toggle("is-done", itemRank < rank);
  });
}

/**
 * Run a lightweight warmup detection pass so the face detector responds faster later.
 * @returns {Promise<void>}
 */
function warmupDetector() {
  if (typeof globalThis.faceapi === "undefined") return Promise.resolve();
  var opts = FaceScanFaceModel.getDetectorOptions();
  if (!opts) return Promise.resolve();
  var warmupCanvas = document.createElement("canvas");
  warmupCanvas.width = 160;
  warmupCanvas.height = 120;
  return globalThis.faceapi
    .detectSingleFace(warmupCanvas, opts)
    .then(function () {})
    .catch(function () {});
}

/**
 * Phones / touch layouts use the lighter TinyFaceDetector; desktop uses SSD when available.
 * @returns {boolean}
 */
function preferTinyFaceDetector() {
  var coarse =
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(pointer: coarse)").matches;
  var narrow =
    typeof globalThis.innerWidth === "number" && globalThis.innerWidth < 768;
  return coarse || narrow;
}

/**
 * Display a visible error message inside the scan flow UI.
 * @param {string} text
 */
function showError(text) {
  cameraDOM.errorMsg.textContent = text;
  cameraDOM.errorMsg.classList.remove("hidden");
}

/**
 * Hide any visible scan flow error message.
 */
function hideError() {
  cameraDOM.errorMsg.classList.add("hidden");
  cameraDOM.errorMsg.textContent = "";
}

/**
 * Initialize face detector model loading and update step availability.
 * @returns {Promise<void>}
 */
function bootstrapModels() {
  if (modelsLoadPromise) return modelsLoadPromise;
  faceModelsReady = false;
  faceModelsLoadFailed = false;
  syncStartButtonAvailability();

  FaceScanFaceModel.setConfig({
    kind: preferTinyFaceDetector() ? "tiny" : "ssd",
    weightsCdn: MODEL_URL_CDN,
    weightsLocal: MODEL_URL_LOCAL,
    ssd: { minConfidence: 0.35 },
    tiny: { inputSize: 224, scoreThreshold: 0.35 },
  });

  var kind = String(FaceScanFaceModel.getConfig().kind || "tiny").toLowerCase();
  if (kind === "none" || kind === "off") {
    cameraDOM.modelsStatus.textContent = t("faceScan.models.off");
    cameraDOM.modelsStatus.classList.remove("hint", "failed");
    cameraDOM.modelsStatus.classList.add("hint", "ready");
    faceModelsReady = true;
    faceModelsLoadFailed = false;
    setScanOverlayStage("model");
    syncStartButtonAvailability();
    modelsLoadPromise = Promise.resolve();
    return modelsLoadPromise;
  }

  if (typeof faceapi === "undefined") {
    cameraDOM.modelsStatus.textContent = t("faceScan.models.libraryFailed");
    cameraDOM.modelsStatus.classList.add("failed");
    faceModelsLoadFailed = true;
    syncStartButtonAvailability();
    modelsLoadPromise = Promise.reject(new Error("faceapi_undefined"));
    return modelsLoadPromise;
  }

  modelsLoadPromise = FaceScanFaceModel.load()
    .then(function () {
      return warmupDetector().then(function () {
        cameraDOM.modelsStatus.textContent = t("faceScan.models.ready");
        cameraDOM.modelsStatus.classList.remove("hint", "failed");
        cameraDOM.modelsStatus.classList.add("hint", "ready");
        faceModelsReady = true;
        faceModelsLoadFailed = false;
        setScanOverlayStage("model");
        syncStartButtonAvailability();
      });
    })
    .catch(function () {
      cameraDOM.modelsStatus.textContent = t("faceScan.models.unavailable");
      cameraDOM.modelsStatus.classList.add("failed");
      faceModelsLoadFailed = true;
      faceModelsReady = false;
      syncStartButtonAvailability();
    });
  return modelsLoadPromise;
}

/**
 * Open the scan panel and request camera access (shared by manual and auto start).
 * @param {object} camera
 */
function openScanPanelAndRequestCamera(camera) {
  if (cameraDOM.btnStart) cameraDOM.btnStart.disabled = true;
  cameraDOM.panelInstructions.classList.add("hidden");
  cameraDOM.panelScan.classList.remove("hidden");
  if (cameraDOM.scanIntro) {
    cameraDOM.scanIntro.classList.remove("hidden");
    cameraDOM.scanIntro.hidden = false;
  }
  hideError();
  waitForModelsThenOpenCamera(camera);
}

/**
 * Start the camera flow from the intro panel after validating consent.
 */
function startCameraFromIntro(camera) {
  if (!hasFaceScanConsent()) {
    showError(t("faceScan.errors.consentBeforeScan"));
    if (cameraDOM.faceConsentCheckbox) cameraDOM.faceConsentCheckbox.focus();
    syncStartButtonAvailability();
    return;
  }
  openScanPanelAndRequestCamera(camera);
}

/**
 * Skip intro/consent and start the camera immediately (second scan after music).
 */
export function autoStartFaceScanDirectly() {
  if (!cameraDOM || !faceScanFlowHandles.camera) return;
  if (!faceModelsLoadFailed && (faceModelsReady || modelsLoadPromise)) {
    openScanPanelAndRequestCamera(faceScanFlowHandles.camera);
    return;
  }
  bootstrapModels()
    .catch(function () {})
    .finally(function () {
      if (!faceScanFlowHandles.camera || faceModelsLoadFailed) return;
      openScanPanelAndRequestCamera(faceScanFlowHandles.camera);
    });
}

/**
 * Wait for the model pipeline to be ready, then request camera access.
 */
function waitForModelsThenOpenCamera(camera) {
  cameraDOM.scanOverlayCamera.classList.remove("hidden");
  cameraDOM.scanOverlayDenied.classList.add("hidden");
  cameraDOM.scanOverlayCameraText.textContent = t("faceScan.overlay.preparingScan");
  setScanOverlayStage("model");
  setScanOverlayTip(t("faceScan.overlay.finalizingDetector"));

  if (faceModelsLoadFailed) {
    cameraDOM.scanOverlayCamera.classList.add("hidden");
    cameraDOM.scanOverlayDenied.classList.remove("hidden");
    cameraDOM.scanOverlayDeniedText.textContent = t("faceScan.models.loadFailed");
    syncStartButtonAvailability();
    return;
  }

  if (faceModelsReady) {
    cameraDOM.scanOverlayCameraText.textContent = t("faceScan.overlay.requestingAccess");
    setScanOverlayStage("camera");
    setScanOverlayTip(t("faceScan.overlay.allowCameraTip"));
    if (camera) camera.requestCameraAndStartAlignment();
    return;
  }

  Promise.resolve(modelsLoadPromise || bootstrapModels())
    .then(function () {
      if (faceModelsLoadFailed) {
        throw new Error("face_models_failed");
      }
      cameraDOM.scanOverlayCameraText.textContent = t("faceScan.overlay.requestingAccess");
      setScanOverlayStage("camera");
      setScanOverlayTip(t("faceScan.overlay.allowCameraTip"));
      if (camera) camera.requestCameraAndStartAlignment();
    })
    .catch(function () {
      cameraDOM.scanOverlayCamera.classList.add("hidden");
      cameraDOM.scanOverlayDenied.classList.remove("hidden");
      cameraDOM.scanOverlayDeniedText.textContent = t("faceScan.models.loadFailed");
      syncStartButtonAvailability();
    });
}

/**
 * Update the hint text after recording upload completion or failure.
 * @param {string} baseTxt
 * @param {object} uploadResult
 * @param {boolean} endpointConfigured
 */
function applyRecordingOutcomeHint(baseTxt, uploadResult, endpointConfigured) {
  var parts = [baseTxt + "."];
  if (!endpointConfigured) {
    showError(t("faceScan.upload.urlNotConfigured"));
    parts.push(t("faceScan.upload.setUrlHint"));
    cameraDOM.mimeHint.textContent = parts.join(" ");
    return;
  }
  if (uploadResult.ok) {
    hideError();
    parts.push(t("faceScan.upload.completedSuccess"));
    cameraDOM.mimeHint.textContent = parts.join(" ");
    return;
  }
  if (uploadResult.timedOut) {
    var timeoutSec = Math.round(
      ((FaceScanUpload && FaceScanUpload.timeoutMs) || 120000) / 1000,
    );
    showError(t("faceScan.upload.timedOutAfter", { seconds: timeoutSec }));
  } else if (uploadResult.netError) {
    showError(
      (uploadResult.errorMessage ? uploadResult.errorMessage + " " : "") +
        t("faceScan.upload.corsHint"),
    );
  } else {
    var serverHint = uploadResult.errorMessage
      ? " " + uploadResult.errorMessage
      : "";
    showError(
      t("faceScan.upload.rejectedHttpDetail", {
        status: uploadResult.status,
        serverHint: serverHint,
        fieldName:
          FaceScanUpload && FaceScanUpload.fieldName
            ? FaceScanUpload.fieldName
            : "video",
      }),
    );
  }
  parts.push(t("faceScan.upload.refreshRetry"));
  cameraDOM.mimeHint.textContent = parts.join(" ");
}

/**
 * Same as Cancel: stop streams, panels, overlays, blob bridge.
 * Safe to call from demo wizard when exiting the flow.
 */
export function resetFaceScanFlowForLanding() {
  if (!cameraDOM) return;
  setFaceScanConsentRequired(true);
  resetUiToStart(faceScanFlowHandles.camera, faceScanFlowHandles.recording);
  if (cameraDOM.faceConsentCheckbox) {
    cameraDOM.faceConsentCheckbox.checked = false;
  }
  syncStartButtonAvailability();
}

/**
 * Return to the face-scan intro so the user can capture a new video
 * (e.g. after upload rejected for low quality).
 */
export function restartFaceScanForNewRecording() {
  if (!cameraDOM) return;
  resetUiToStart(faceScanFlowHandles.camera, faceScanFlowHandles.recording);
  syncStartButtonAvailability();
  if (faceScanFlowHandles.camera && !faceScanConsentRequired) {
    autoStartFaceScanDirectly();
  }
}

/**
 * Reset the camera/recording flow UI back to the start page.
 */
function resetUiToStart(camera, recording) {
  if (recording) recording.teardownRecordingPill();
  if (camera) camera.stopStream();
  if (camera) camera.cancelCountdown();
  cameraDOM.panelInstructions.classList.remove("hidden");
  cameraDOM.panelScan.classList.add("hidden");
  cameraDOM.panelResult.classList.add("hidden");
  if (cameraDOM.scanIntro) {
    cameraDOM.scanIntro.classList.add("hidden");
    cameraDOM.scanIntro.hidden = true;
  }
  if (camera) camera.hideScanCameraStates();
  cameraDOM.overlayCountdown.hidden = true;
  cameraDOM.overlayCountdown.classList.add("hidden");
  hideError();
  setScanOverlayStage("model");
  setScanOverlayTip(t("faceScan.overlay.preparingDetector"));
  syncStartButtonAvailability();
  document.dispatchEvent(new CustomEvent("maika-demo:face-scan-blob-cleared"));
}

/**
 * Return true when required DOM elements for face scan flow are present.
 * @returns {boolean}
 */
function hasRequiredDom() {
  return !!(
    cameraDOM.btnStart &&
    cameraDOM.btnCancel &&
    cameraDOM.btnCameraRetry &&
    cameraDOM.btnCameraBack &&
    cameraDOM.preview
  );
}

/**
 * Build the recording controller instance.
 * @returns {object}
 */
function createRecordingController(getCamera, onResetUi) {
  return FaceScanRecordingController.create({
    ctx: context,
    getCamera: function () {
      return getCamera();
    },
    elements: {
      preview: cameraDOM.preview,
      placementStatus: cameraDOM.placementStatus,
      recordingPill: cameraDOM.recordingPill,
      recordingTime: cameraDOM.recordingTime,
      panelScan: cameraDOM.panelScan,
      panelResult: cameraDOM.panelResult,
      mimeHint: cameraDOM.mimeHint,
    },
    config: {
      recordTargetMs: RECORD_TARGET_MS,
      recordVideoBpsMp4: RECORD_VIDEO_BPS_MP4,
      recordVideoBpsWebm: RECORD_VIDEO_BPS_WEBM,
    },
    bridges: {
      showError: showError,
      hideError: hideError,
      applyRecordingOutcomeHint: applyRecordingOutcomeHint,
      resetUiToStart: function () {
        onResetUi();
      },
      deferAssessUpload: true,
      onRecordingBlobReady: function (blob, recordedMime, baseTxt) {
        void stopMusicPlayback({
          fadeOutMs: MUSIC_FADE_MS_AFTER_RECORDING_COMPLETE,
        });
        document.dispatchEvent(
          new CustomEvent("maika-demo:face-scan-blob-ready", {
            detail: {
              blob: blob,
              recordedMime: recordedMime,
              baseTxt: baseTxt,
              consentGiven: hasFaceScanConsent(),
            },
          }),
        );
        if (cameraDOM.mimeHint) {
          cameraDOM.mimeHint.textContent =
            baseTxt + t("faceScan.upload.startsAutomatically");
        }
      },
    },
  });
}

/**
 * Build the camera controller instance.
 * @returns {object}
 */
function createCameraController(recording) {
  return FaceScanCameraController.create({
    ctx: context,
    elements: {
      preview: cameraDOM.preview,
      placementStatus: cameraDOM.placementStatus,
      scanOverlayCamera: cameraDOM.scanOverlayCamera,
      scanOverlayDenied: cameraDOM.scanOverlayDenied,
      scanOverlayCameraText: cameraDOM.scanOverlayCameraText,
      scanOverlayDeniedText: cameraDOM.scanOverlayDeniedText,
      faceScanFx: cameraDOM.faceScanFx,
      faceScanClipEl: cameraDOM.faceScanClipEl,
      faceScanTarget: cameraDOM.faceScanTarget,
      overlayCountdown: cameraDOM.overlayCountdown,
      countdownNumber: cameraDOM.countdownNumber,
    },
    config: {
      alignIntervalMs: ALIGN_INTERVAL_MS,
      stableHitCount: STABLE_HIT_COUNT,
      faceMinFrac: FACE_MIN_FRAC,
      faceMaxFrac: FACE_MAX_FRAC,
      recordTargetMs: RECORD_TARGET_MS,
      faceMinMeanLuminance: H.DEFAULT_FACE_MIN_MEAN_LUMINANCE,
    },
    bridges: {
      hideError: hideError,
      onCameraReady: function () {
        setScanOverlayStage("align");
        setScanOverlayTip(t("faceScan.hud.centerInGuide"));
      },
      onCountdownDone: function () {
        setScanOverlayStage("align");
        setScanOverlayTip(t("faceScan.hud.perfectAlignment"));
        if (!recording) return Promise.resolve();
        return recording.beginRecording();
      },
    },
  });
}

/**
 * Attach all UI event handlers used by the face scan flow.
 */
function bindFaceScanEvents(camera, recording) {
  cameraDOM.btnStart.addEventListener("click", function () {
    startCameraFromIntro(camera);
  });

  cameraDOM.btnCameraRetry.addEventListener("click", function () {
    hideError();
    if (camera) camera.requestCameraAndStartAlignment();
  });

  cameraDOM.btnCameraBack.addEventListener("click", function () {
    if (camera) camera.hideScanCameraStates();
    if (camera) camera.stopStream();
    cameraDOM.panelScan.classList.add("hidden");
    if (cameraDOM.scanIntro) {
      cameraDOM.scanIntro.classList.add("hidden");
      cameraDOM.scanIntro.hidden = true;
    }
    cameraDOM.panelInstructions.classList.remove("hidden");
    hideError();
    syncStartButtonAvailability();
  });

  cameraDOM.btnCancel.addEventListener("click", function () {
    if (camera) camera.cancelCountdown();
    if (context.recorder && context.recorder.state === "recording") {
      if (recording) recording.abortRecordingDiscard();
      return;
    }
    resetUiToStart(camera, recording);
  });

  if (cameraDOM.faceConsentCheckbox) {
    cameraDOM.faceConsentCheckbox.addEventListener("change", function () {
      hideError();
      syncStartButtonAvailability();
    });
  }
}

/**
 * Observe placement text/state changes and sync the quality HUD.
 */
function initPlacementObserver() {
  if (!cameraDOM.placementStatus) return;
  var placementObserver = new MutationObserver(function () {
    syncScanHudFromPlacement();
  });
  placementObserver.observe(cameraDOM.placementStatus, {
    attributes: true,
    childList: true,
    characterData: true,
    subtree: true,
  });
  syncScanHudFromPlacement();
}

/**
 * Initialize the face scan flow and wire event handlers.
 */
export function initFaceScanFlow() {
  "use strict";

  cameraDOM = getDomReferences();
  var camera = null;
  var recording = null;

  if (!hasRequiredDom()) return;

  recording = createRecordingController(
    function () {
      return camera;
    },
    function () {
      resetUiToStart(camera, recording);
    },
  );
  camera = createCameraController(recording);
  faceScanFlowHandles.camera = camera;
  faceScanFlowHandles.recording = recording;
  bindFaceScanEvents(camera, recording);
  initPlacementObserver();

  bootstrapModels().catch(function () {
    // Failure state is already reflected in UI via cameraDOM.modelsStatus / faceModelsLoadFailed.
  });
}
