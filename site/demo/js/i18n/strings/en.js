/**
 * English UI strings for the Maika demo.
 * Add sibling files (e.g. de.js) and register them in ../index.js for more locales.
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
    },
    results: {
      valenceNegative: "Negative",
      valencePositive: "Positive",
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
  },
};
