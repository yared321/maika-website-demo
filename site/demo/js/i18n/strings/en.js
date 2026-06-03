/**
 * English UI strings for the Maika demo.
 */
export default {
  meta: {
    pageTitle: "Maika - AI Music for Your Health",
    description:
      "Real-time AI-powered adaptive music that uses biometrics to support stress relief, focus, recovery, and wellbeing.",
    ogDescription:
      "AI-powered adaptive music for stress relief, focus, and recovery.",
  },

  nav: {
    brandTagline: "AI music for your health",
    demo: "Demo",
    primaryAria: "Primary",
  },

  landing: {
    ariaLabel: "Demo overview",
    kicker: "Interactive demo",
    title: "Discover your emotional response to music in one guided flow.",
    copy:
      "This experience combines music listening, a short face scan, and immediate feedback on your biometric and emotional response to music.",
    points: {
      consent: "Consent before camera access",
      upload: "Auto upload + score processing",
      result: "Result view",
    },
    steps: {
      step1Title: "Step 1",
      step1Desc: "Baseline face scan",
      step2Title: "Step 2",
      step2Desc: "Listen",
      step3Title: "Step 3",
      step3Desc: "Scan your face",
      step4Title: "Step 4",
      step4Desc: "See the result",
    },
    access: {
      title: "Try the demo",
      copy: "Choose your music and listening time, then start the guided flow.",
      genreLabel: "Music genre",
      genreAria: "Music genre",
      genreLoading: "Loading genres…",
      genreEmpty: "No genres available",
      durationLabel: "Listening duration",
      durationAria: "Listening duration",
      duration2Min: "2 minutes",
      duration5Min: "5 minutes",
      duration10Min: "10 minutes",
      consentLabel:
        "I give consent to using my face-scan video to calculate my biometrics.",
      consentNote:
        "Your video is used only for your session results and will be discarded right after processing.",
      cta: "Try Demo",
    },
  },

  wizard: {
    kicker: "Maika demo",
    back: "Back",
    next: "Next",
    nextContinue: "Continue",
    nextProceedFaceScan: "Proceed to face scan",
    nextDone: "Done",
    faceScan: {
      baselineTitle: "Baseline face scan",
      baselineSubtitle: "Your baseline scan before listening to music.",
      postTitle: "Face scan",
      postSubtitle: "Scan again after listening to music.",
      scanIntroTitle: "What to do",
      instructions: {
        allowCamera: "Allow the camera when your browser prompts you.",
        centerFace:
          "Center your face in the camera view until the status line turns green.",
        pauseWhenOut:
          "If you move out of the target area, recording pauses until you move back.",
        holdSteady:
          "Hold steady—recording starts automatically after a short countdown.",
      },
    },
    results: {
      valenceNegative: "Negative",
      valenceNeutral: "Neutral",
      valencePositive: "Positive",
      title: "Your Session Result",
      focusScore: "Focus score",
      relaxScore: "Relax score",
      arousalScore: "Arousal score",
      activation: "Activation",
      activationAxis: "Activation",
      relaxationAxis: "Relaxation",
      beforeMusic: "Before music",
      afterMusic: "After music",
      compareAria: "Before and after face scan comparison",
      mapAria:
        "Emotion constellation with valence on x-axis and arousal on y-axis",
      completeBothScans:
        "Complete both face scans to see baseline vs after-music change.",
      activationUnchanged:
        "Your activation level stayed almost unchanged after music.",
      activationHigher:
        "Your after-music face scan shows higher activation than baseline.",
      activationLower:
        "Your after-music face scan shows lower activation than baseline.",
      modes: {
        angry: "Angry",
        afraid: "Afraid",
        stressed: "Stressed",
        annoyed: "Annoyed",
        frustrated: "Frustrated",
        disappointed: "Disappointed",
        apathetic: "Apathetic",
        melancholic: "Melancholic",
        sad: "Sad",
        bored: "Bored",
        neutral: "Neutral",
        aroused: "Aroused",
        excited: "Excited",
        focused: "Focused",
        happy: "Happy",
        pleased: "Pleased",
        content: "Content",
        relaxed: "Relaxed",
        calm: "Calm",
      },
    },
  },

  music: {
    playbackAria: "Music playback",
    playPauseAria: "Play or pause",
    loadingAudio: "Loading audio…",
    spectrumAria: "Live frequency spectrum",
    volume: "Volume",
    volumeAria: "Volume",
    positionAria: "Playback position",
    prevAria: "Previous track",
    rewindAria: "Rewind 10 seconds",
    forwardAria: "Forward 10 seconds",
    nextAria: "Next track",
    defaultTitle: "Song Title",
    selectPlaceholder: "— Choose a track —",
    playSelected: "Play selected track",
    starting: "Starting playback",
    playing: "Playing",
    play: "Play",
    unableToLoad: "Unable to load track",
    audioUnsupported: "Your browser does not support the audio element.",
  },

  valence: {
    title: "How do you feel right now?",
    copy:
      "Move the slider while you record: left is more unpleasant, right is more pleasant.",
    sliderAria: "Valence score from negative to positive",
    veryNegative: "Very negative / unpleasant",
    negative: "Negative",
    neutral: "Neutral",
    positive: "Positive",
    veryPositive: "Very positive / pleasant",
  },

  faceScan: {
    howToRecordAria: "How to record",
    beforeStartTitle: "Before you start",
    beforeStartLighting:
      "Good, even lighting; camera at eye level; stay still and avoid talking while recording.",
    beforeStartTap: "Tap Start camera when you are ready",
    startCamera: "Start camera",
    loadingDetector: "Loading face detector…",
    recordingAria: "Face recording",
    recordingCompleteAria: "Recording complete",
    stepLabel: "Face scan",
    cancel: "Cancel",
    tryAgain: "Try again",
    recordAgain: "Record again",
    recordingFinished: "Recording finished.",
    previewTitle: "Recorded video preview",
    overlay: {
      startingCamera: "Starting camera",
      requestingPermission: "Requesting permission…",
      preparingScan: "Preparing face scan…",
      requestingAccess: "Requesting camera access…",
      model: "Model",
      camera: "Camera",
      alignment: "Alignment",
      preparingDetector:
        "We are preparing the detector in the background for a smoother start.",
      finalizingDetector:
        "Finalizing detector startup. This is done once and usually takes a few seconds.",
      allowCameraTip: "Please allow camera access when your browser asks.",
      cantUseCamera: "Can't use the camera",
    },
    hud: {
      qualityKicker: "Measurement quality",
      defaultText: "Hold still, keep steady lighting, and center your face.",
      preparing: "Preparing…",
      greatFraming: "Great framing. Keep your face centered and steady.",
      greatSignal: "Great signal. Keep your face steady and centered.",
      measuring: "Measuring…",
      alignmentGood: "Alignment looks good. Hold still for auto start.",
      almostReady: "Almost ready…",
      moveIntoFrame: "Move into frame and keep your face centered.",
      adjustingPosition: "Adjusting position…",
      centerInGuide:
        "Center your face in the guide. We start automatically once alignment is stable.",
      perfectAlignment: "Perfect alignment. Starting recording now…",
    },
    placement: {
      lookingForFace: "Looking for your face…",
      centerInFrame: "Center your face in the frame.",
      moveToCenter: "Move to the center.",
      moveCloser: "Move slightly closer.",
      moveBack: "Move slightly back.",
      moveRight: "Move slightly to the right.",
      moveLeft: "Move slightly to the left.",
      moveDown: "Move slightly down.",
      moveUp: "Move slightly up.",
      guideNear: "Move closer",
      guideFar: "Move back",
      guideCenter: "Move to center",
      guideLeft: "Move left",
      guideRight: "Move right",
      guideUp: "Move up",
      guideDown: "Move down",
      starting: "Starting…",
    },
    recording: {
      fullView: "Recording — full view.",
      guideOff: "Recording — face guide off.",
      inProgress: "Recording…",
      paused: "Paused — move to the center.",
      pausedCenter: "Paused — center your face in the center.",
      pausedCenterFrame: "Paused — center your face in the frame.",
      pausedDark: "Paused — too dark. Add more light.",
      tooDark: "Too dark — add light on your face.",
      almostThere: "Almost there — hold still.",
      lookingGood: "Looking good.",
      aligned: "Face aligned — hold still.",
      pausedSuffix: " · paused",
    },
    models: {
      off: "Face detector off — camera runs without alignment or face-based pause.",
      libraryFailed: "face-api library failed (network / blocked script).",
      ready: "Face detector ready.",
      unavailable: "Detector models unavailable (CDN + ./models fallback).",
      loadFailed:
        "Face detector failed to load. Check network or the models folder, refresh, retry.",
    },
    upload: {
      statusIdle: "Ready to upload and calculate score",
      statusUploading: "Uploading video and calculating score…",
      statusSuccess: "Score calculated. You can continue.",
      statusError:
        "Upload or score failed. Use Record again for a new video, or Continue to retry this one.",
      startsAutomatically: "Upload and score calculation start automatically.",
      completedSuccess: "Upload to your API completed successfully.",
      timedOut: "Upload timed out.",
      timedOutAfter:
        "Upload timed out after {seconds}s. Try again or increase FaceScanUpload.timeoutMs in service.js.",
      corsHint:
        "If this persists, confirm the API allows this origin (CORS) and that you are on HTTPS or localhost.",
      rejectedHttp: "Upload rejected (HTTP {status}).",
      rejectedHttpDetail:
        'Upload rejected (HTTP {status}).{serverHint} Check server logs and multipart field "{fieldName}".',
      failedHttp: "Upload failed (HTTP {status}).",
      refreshRetry: "Refresh the page to retry when the issue is resolved.",
      urlNotConfigured:
        "Upload URL is not configured. Set meta face-scan-upload-url or MAIKA_FACE_SCAN_UPLOAD_URL (see README).",
      setUrlHint: "Set the upload URL, then refresh the page to try again.",
      moduleMissing:
        "Upload module missing. Load service.js before app.js (see README).",
      profileMissing:
        "Upload could not start because required profile fields are missing.",
      consentRequired:
        "Face-scan consent is required before upload and score calculation.",
      endpointMissing: "Upload URL is not configured.",
      networkError: "Network or CORS error.",
      unexpectedError: "Unexpected upload error. Please try again.",
    },
    errors: {
      consentBeforeScan:
        "Please provide consent before starting face scan. We use the video to calculate arousal score and then discard it.",
      noCameraStream: "No camera stream.",
      recorderFailed: "Could not start recorder.",
      httpsRequired: "Camera needs HTTPS or localhost.",
      cameraBlocked:
        "Camera access was blocked. Allow the camera for this site, then try again.",
      noCameraFound: "No camera was found.",
      cameraBusy: "The camera is busy or could not start.",
      cameraGeneric: "Could not open the camera. Use HTTPS or localhost.",
    },
  },

  errors: {
    consentRequired: "Please agree to the camera consent before starting.",
    genreRequired: "Choose a music genre to continue.",
    stepIncomplete: "Please complete this step before continuing.",
    uploadInProgress: "Uploading video and calculating score. Please wait.",
    recordingRequired: "Complete a face recording first.",
    listenRemainingOne: "Listen for {remaining} more second to continue.",
    listenRemainingMany: "Listen for {remaining} more seconds to continue.",
    valenceRequired: "Move the slider to rate how you feel before continuing.",
  },
};
