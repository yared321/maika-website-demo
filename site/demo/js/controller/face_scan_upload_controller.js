import {
  generateFaceScanRequestId,
  postRecording,
  resolveEndpoint,
} from "../service/service.js";
import { applyDefaultDemographics } from "./demographic_form_controller.js";
import { syncWizardNextButton } from "./wizard_nav_controller.js";
import { t } from "../i18n/index.js";

const UPLOAD_STATUS_KEYS = {
  idle: "faceScan.upload.statusIdle",
  uploading: "faceScan.upload.statusUploading",
  success: "faceScan.upload.statusSuccess",
  error: "faceScan.upload.statusError",
};

function uploadStatusLabel(mode) {
  return t(UPLOAD_STATUS_KEYS[mode] || UPLOAD_STATUS_KEYS.idle);
}

/**
 * Read arousal from an API assessment payload.
 * @param {unknown} data
 * @returns {number | null}
 */
function extractArousalFromResult(data) {
  if (!data || typeof data !== "object") return null;
  const arousal = Number(data.arousal);
  return Number.isFinite(arousal) ? arousal : null;
}

const UPLOAD_STATUS = {
  idle: "idle",
  uploading: "uploading",
  success: "success",
  error: "error",
};

/**
 * Show or hide the result-panel "Record again" control.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {boolean} show
 */
export function syncRecordAgainButton(dom, show) {
  if (!dom.btnRecordAgain) return;
  dom.btnRecordAgain.classList.toggle("hidden", !show);
}

/**
 * Mark upload as failed, surface messages, and offer Record again.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 * @param {(dom: Record<string, HTMLElement|null>, message: string) => void} setWizardError
 * @param {string} statusLabel
 * @param {string} wizardMessage
 */
function failFaceUpload(dom, state, setWizardError, statusLabel, wizardMessage) {
  state.upload.completed = false;
  setUploadUiState(dom, state, "error", statusLabel || uploadStatusLabel(UPLOAD_STATUS.error));
  setWizardError(dom, wizardMessage || statusLabel || uploadStatusLabel(UPLOAD_STATUS.error));
  syncRecordAgainButton(dom, true);
  syncFaceStepNextGate(dom, state);
}

/**
 * Update upload progress CSS variable (0-100).
 * @param {Record<string, HTMLElement|null>} dom
 * @param {number} percent
 */
function setUploadProgressFill(dom, percent) {
  if (!dom.uploadProgressTrack) return;
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  dom.uploadProgressTrack.style.setProperty("--upload-fill", `${p}%`);
}

/**
 * Apply visual upload state (idle/uploading/success/error) to UI.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 * @param {"idle"|"uploading"|"success"|"error"} mode
 * @param {string} label
 */
function setUploadUiState(dom, state, mode, label) {
  if (!dom.uploadStatusCard) return;
  stopUploadPulse(state);
  dom.uploadStatusCard.classList.remove("is-uploading", "is-success", "is-error");

  if (mode === "uploading") {
    dom.uploadStatusCard.classList.add("is-uploading");
    setUploadProgressFill(dom, 16);
    let phase = 16;
    state.upload.pulseTimer = globalThis.setInterval(() => {
      phase += 14;
      if (phase > 86) phase = 24;
      setUploadProgressFill(dom, phase);
    }, 260);
  } else if (mode === "success") {
    dom.uploadStatusCard.classList.add("is-success");
    setUploadProgressFill(dom, 100);
  } else if (mode === "error") {
    dom.uploadStatusCard.classList.add("is-error");
    setUploadProgressFill(dom, 46);
  } else {
    setUploadProgressFill(dom, 8);
  }

  if (dom.uploadStatusLabel) {
    dom.uploadStatusLabel.textContent = label || "";
  }
}

/** @deprecated Use syncWizardNextButton — kept as alias for existing call sites. */
export function syncFaceStepNextGate(dom, state) {
  syncWizardNextButton(dom, state);
}

/**
 * Stop upload progress pulse timer if active.
 * @param {Record<string, any>} state
 */
export function stopUploadPulse(state) {
  if (!state.upload.pulseTimer) return;
  globalThis.clearInterval(state.upload.pulseTimer);
  state.upload.pulseTimer = 0;
}

/**
 * Clear recorded preview UI and revoke existing blob URL.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 */
export function clearRecordedPreview(dom, state) {
  if (dom.recordedPreview) {
    dom.recordedPreview.pause();
    dom.recordedPreview.removeAttribute("src");
    dom.recordedPreview.load();
  }
  if (state.upload.recordedPreviewUrl) {
    URL.revokeObjectURL(state.upload.recordedPreviewUrl);
    state.upload.recordedPreviewUrl = "";
  }
  dom.uploadPreviewCard?.classList.add("hidden");
  setUploadUiState(dom, state, "idle", uploadStatusLabel(UPLOAD_STATUS.idle));
  syncRecordAgainButton(dom, false);
}

/**
 * Render a recorded blob preview and reset status to idle.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 * @param {Blob} blob
 */
export function applyRecordedPreview(dom, state, blob) {
  if (!blob || !dom.recordedPreview) return;
  if (state.upload.recordedPreviewUrl) {
    URL.revokeObjectURL(state.upload.recordedPreviewUrl);
  }
  state.upload.recordedPreviewUrl = URL.createObjectURL(blob);
  dom.recordedPreview.src = state.upload.recordedPreviewUrl;
  dom.recordedPreview.load();
  dom.uploadPreviewCard?.classList.remove("hidden");
  setUploadUiState(dom, state, "idle", uploadStatusLabel(UPLOAD_STATUS.idle));
  syncRecordAgainButton(dom, false);
}

/**
 * Reset upload state flags and pending upload payload.
 * @param {Record<string, any>} state
 */
export function resetUploadState(state) {
  state.upload.isInFlight = false;
  state.upload.completed = false;
  state.upload.pendingBlob = null;
  state.upload.pendingMime = "";
  state.upload.pendingConsent = true;
}

/**
 * Upload the recorded face blob and sync UI/state from result.
 * @param {Record<string, HTMLElement|null>} dom
 * @param {Record<string, any>} state
 * @param {(dom: Record<string, HTMLElement|null>, message: string) => void} setWizardError
 * @returns {Promise<void>}
 */
export async function startFaceUpload(dom, state, setWizardError) {
  if (!state.upload.pendingBlob || state.upload.isInFlight || state.upload.completed) {
    return;
  }

  applyDefaultDemographics(state);
  const age = String(state.demographics.age || "").trim();
  const sex = String(state.demographics.gender || "").trim();
  if (!age || !sex) {
    failFaceUpload(
      dom,
      state,
      setWizardError,
      uploadStatusLabel(UPLOAD_STATUS.error),
      t("faceScan.upload.profileMissing"),
    );
    return;
  }

  if (!state.upload.pendingConsent) {
    failFaceUpload(
      dom,
      state,
      setWizardError,
      uploadStatusLabel(UPLOAD_STATUS.error),
      t("faceScan.upload.consentRequired"),
    );
    return;
  }

  const endpoint = resolveEndpoint();
  if (!endpoint) {
    failFaceUpload(
      dom,
      state,
      setWizardError,
      uploadStatusLabel(UPLOAD_STATUS.error),
      t("faceScan.upload.endpointMissing"),
    );
    return;
  }

  const scanPhase =
    state.currentStep === 0 ? "baseline" : state.currentStep === 2 ? "post" : null;

  state.upload.isInFlight = true;
  setWizardError(dom, "");
  setUploadUiState(dom, state, "uploading", uploadStatusLabel(UPLOAD_STATUS.uploading));
  syncRecordAgainButton(dom, false);
  syncFaceStepNextGate(dom, state);

  try {
    const uploadResult = await postRecording(state.upload.pendingBlob, endpoint, {
      recordedMime: state.upload.pendingMime || state.upload.pendingBlob.type || "",
      age: age,
      sex: sex,
      consent: true,
      requestId: generateFaceScanRequestId(),
    });

    if (uploadResult.ok) {
      state.upload.completed = true;
      setUploadUiState(dom, state, "success", uploadStatusLabel(UPLOAD_STATUS.success));
      syncRecordAgainButton(dom, false);
      if (uploadResult.data && typeof uploadResult.data === "object") {
        state.assessment.latestResult = uploadResult.data;
        const arousal = extractArousalFromResult(uploadResult.data);
        if (scanPhase === "baseline") {
          state.assessment.baselineArousal = arousal;
        } else if (scanPhase === "post") {
          state.assessment.postArousal = arousal;
        }
      }
      state.upload.pendingBlob = null;
      state.upload.pendingMime = "";
      setWizardError(dom, "");
      syncFaceStepNextGate(dom, state);
      if (scanPhase) {
        document.dispatchEvent(
          new CustomEvent("maika-demo:face-upload-complete", {
            detail: { scanPhase: scanPhase },
          }),
        );
      }
      return;
    }

    const message =
      uploadResult.errorMessage ||
      (uploadResult.timedOut
        ? t("faceScan.upload.timedOut")
        : uploadResult.netError
          ? t("faceScan.upload.networkError")
          : t("faceScan.upload.failedHttp", {
              status: uploadResult.status || 0,
            }));
    failFaceUpload(
      dom,
      state,
      setWizardError,
      uploadStatusLabel(UPLOAD_STATUS.error),
      message,
    );
  } catch (error) {
    failFaceUpload(
      dom,
      state,
      setWizardError,
      uploadStatusLabel(UPLOAD_STATUS.error),
      t("faceScan.upload.unexpectedError"),
    );
    console.error("Upload failed unexpectedly:", error);
  } finally {
    state.upload.isInFlight = false;
    syncFaceStepNextGate(dom, state);
  }
}
