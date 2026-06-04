/**
 * Dutch UI strings for the Maika demo.
 */
export default {
  meta: {
    pageTitle: "Maika - AI-muziek voor je gezondheid",
    description:
      "Adaptieve AI-muziek in realtime die biometrie gebruikt voor stressverlichting, focus, herstel en welzijn.",
    ogDescription:
      "AI-gestuurde adaptieve muziek voor stressverlichting, focus en herstel.",
  },

  nav: {
    brandTagline: "AI-muziek voor je gezondheid",
    demo: "Demo",
    primaryAria: "Primair",
  },

  landing: {
    ariaLabel: "Demo-overzicht",
    kicker: "Interactieve demo",
    title: "Ontdek je emotionele reactie op muziek in één begeleide flow.",
    copy:
      "Deze ervaring combineert muziek luisteren, een korte gezichtsscan en directe feedback over je biometrische en emotionele reactie op muziek.",
    points: {
      consent: "Toestemming vóór cameratoegang",
      upload: "Automatisch uploaden + scoreverwerking",
      result: "Resultatenweergave",
    },
    steps: {
      step1Title: "Stap 1",
      step1Desc: "Basis gezichtsscan",
      step2Title: "Stap 2",
      step2Desc: "Luisteren",
      step3Title: "Stap 3",
      step3Desc: "Scan je gezicht",
      step4Title: "Stap 4",
      step4Desc: "Bekijk het resultaat",
    },
    access: {
      title: "Probeer de demo",
      copy: "Kies je muziek en start daarna de begeleide flow.",
      genreLabel: "Muziekgenre",
      genreAria: "Muziekgenre",
      genreLoading: "Genres laden…",
      genreEmpty: "Geen genres beschikbaar",
      consentLabel:
        "Ik geef toestemming om mijn gezichtsscan-video te gebruiken voor het berekenen van mijn biometrie.",
      consentNote:
        "Je video wordt alleen gebruikt voor je sessieresultaten en wordt direct na verwerking verwijderd.",
      cta: "Demo proberen",
    },
  },

  wizard: {
    kicker: "Maika-demo",
    back: "Terug",
    next: "Volgende",
    nextContinue: "Doorgaan",
    nextProceedFaceScan: "Doorgaan naar gezichtsscan",
    nextDone: "Klaar",
    faceScan: {
      baselineTitle: "Basis gezichtsscan",
      baselineSubtitle: "Je basisscan vóór het luisteren naar muziek.",
      postTitle: "Gezichtsscan",
      postSubtitle: "Scan opnieuw na het luisteren naar muziek.",
      scanIntroTitle: "Wat je moet doen",
      instructions: {
        allowCamera: "Sta cameratoegang toe wanneer je browser daarom vraagt.",
        centerFace:
          "Centreer je gezicht in het camerabeeld tot de statusregel groen wordt.",
        pauseWhenOut:
          "Als je buiten het doelgebied beweegt, pauzeert de opname tot je terug beweegt.",
        holdSteady:
          "Blijf stil zitten—de opname start automatisch na een korte aftelling.",
      },
    },
    results: {
      valenceNegative: "Negatief",
      valenceNeutral: "Neutraal",
      valencePositive: "Positief",
      title: "Jouw sessieresultaat",
      focusScore: "Focusscore",
      relaxScore: "Ontspanningsscore",
      arousalScore: "Arousalscore",
      activation: "Activatie",
      activationAxis: "Activatie",
      relaxationAxis: "Ontspanning",
      beforeMusic: "Vóór muziek",
      afterMusic: "Na muziek",
      compareAria: "Vergelijking gezichtsscan vóór en na muziek",
      mapAria:
        "Emotieconstellatie met valentie op de x-as en arousal op de y-as",
      completeBothScans:
        "Voltooi beide gezichtsscans om het verschil tussen basis en na muziek te zien.",
      activationUnchanged:
        "Je activatieniveau veranderde nauwelijks na de muziek.",
      activationHigher:
        "Je gezichtsscan na muziek toont hogere activatie dan de basis.",
      activationLower:
        "Je gezichtsscan na muziek toont lagere activatie dan de basis.",
      modes: {
        angry: "Boos",
        afraid: "Bang",
        stressed: "Gestrest",
        annoyed: "Geïrriteerd",
        frustrated: "Gefrustreerd",
        disappointed: "Teleurgesteld",
        apathetic: "Apathisch",
        melancholic: "Melancholisch",
        sad: "Verdrietig",
        bored: "Verveeld",
        neutral: "Neutraal",
        aroused: "Opgewonden",
        excited: "Enthousiast",
        focused: "Gefocust",
        happy: "Blij",
        pleased: "Tevreden",
        content: "Content",
        relaxed: "Ontspannen",
        calm: "Kalm",
      },
    },
  },

  music: {
    playbackAria: "Muziekafspelen",
    playPauseAria: "Afspelen of pauzeren",
    loadingAudio: "Audio laden…",
    spectrumAria: "Live frequentiespectrum",
    volume: "Volume",
    volumeAria: "Volume",
    positionAria: "Afspeelpositie",
    prevAria: "Vorig nummer",
    rewindAria: "10 seconden terug",
    forwardAria: "10 seconden vooruit",
    nextAria: "Volgend nummer",
    defaultTitle: "Nummer",
    selectPlaceholder: "— Kies een nummer —",
    playSelected: "Gekozen nummer afspelen",
    starting: "Afspelen starten",
    playing: "Bezig met afspelen",
    play: "Afspelen",
    unableToLoad: "Nummer kan niet worden geladen",
    audioUnsupported: "Je browser ondersteunt het audio-element niet.",
  },

  valence: {
    title: "Hoe voel je je nu?",
    copy:
      "Beweeg de schuifbalk tijdens het opnemen: links is onaangenamer, rechts is aangenamer.",
    sliderAria: "Valentiescore van negatief naar positief",
    veryNegative: "Zeer negatief / onaangenaam",
    negative: "Negatief",
    neutral: "Neutraal",
    positive: "Positief",
    veryPositive: "Zeer positief / aangenaam",
  },

  faceScan: {
    howToRecordAria: "Hoe op te nemen",
    beforeStartTitle: "Voordat je begint",
    beforeStartLighting:
      "Goed, gelijkmatig licht; camera op ooghoogte; blijf stil en praat niet tijdens de opname.",
    beforeStartTap: "Tik op Camera starten wanneer je klaar bent",
    startCamera: "Camera starten",
    loadingDetector: "Gezichtsdetector laden…",
    recordingAria: "Gezichtsopname",
    recordingCompleteAria: "Opname voltooid",
    stepLabel: "Gezichtsscan",
    cancel: "Annuleren",
    tryAgain: "Opnieuw proberen",
    recordAgain: "Opnieuw opnemen",
    recordingFinished: "Opname voltooid.",
    previewTitle: "Voorbeeld van opgenomen video",
    overlay: {
      startingCamera: "Camera starten",
      requestingPermission: "Toestemming vragen…",
      preparingScan: "Gezichtsscan voorbereiden…",
      requestingAccess: "Cameratoegang vragen…",
      model: "Model",
      camera: "Camera",
      alignment: "Uitlijning",
      preparingDetector:
        "We bereiden de detector op de achtergrond voor voor een soepelere start.",
      finalizingDetector:
        "Detector wordt gestart. Dit gebeurt eenmalig en duurt meestal een paar seconden.",
      allowCameraTip:
        "Sta cameratoegang toe wanneer je browser daarom vraagt.",
      cantUseCamera: "Camera kan niet worden gebruikt",
    },
    hud: {
      qualityKicker: "Meetkwaliteit",
      defaultText:
        "Blijf stil, houd het licht stabiel en centreer je gezicht.",
      preparing: "Voorbereiden…",
      greatFraming:
        "Goede kadrering. Houd je gezicht gecentreerd en stabiel.",
      greatSignal:
        "Goed signaal. Houd je gezicht stabiel en gecentreerd.",
      measuring: "Meten…",
      alignmentGood:
        "Uitlijning ziet er goed uit. Blijf stil voor automatische start.",
      almostReady: "Bijna klaar…",
      moveIntoFrame: "Ga in beeld en houd je gezicht gecentreerd.",
      adjustingPosition: "Positie aanpassen…",
      centerInGuide:
        "Centreer je gezicht in de gids. We starten automatisch zodra de uitlijning stabiel is.",
      perfectAlignment: "Perfecte uitlijning. Opname start nu…",
    },
    placement: {
      lookingForFace: "Je gezicht zoeken…",
      centerInFrame: "Centreer je gezicht in het kader.",
      moveToCenter: "Ga naar het midden.",
      moveCloser: "Kom iets dichterbij.",
      moveBack: "Ga iets naar achteren.",
      moveRight: "Ga iets naar rechts.",
      moveLeft: "Ga iets naar links.",
      moveDown: "Ga iets naar beneden.",
      moveUp: "Ga iets naar boven.",
      guideNear: "Kom dichterbij",
      guideFar: "Ga naar achteren",
      guideCenter: "Ga naar het midden",
      guideLeft: "Ga naar links",
      guideRight: "Ga naar rechts",
      guideUp: "Ga omhoog",
      guideDown: "Ga omlaag",
      starting: "Starten…",
    },
    recording: {
      fullView: "Opname — volledig beeld.",
      guideOff: "Opname — gezichtsgids uit.",
      inProgress: "Opnemen…",
      paused: "Gepauzeerd — ga naar het midden.",
      pausedCenter: "Gepauzeerd — centreer je gezicht in het midden.",
      pausedCenterFrame: "Gepauzeerd — centreer je gezicht in het kader.",
      pausedDark: "Gepauzeerd — te donker. Voeg meer licht toe.",
      tooDark: "Te donker — voeg licht toe op je gezicht.",
      almostThere: "Bijna klaar — blijf stil.",
      lookingGood: "Ziet er goed uit.",
      aligned: "Gezicht uitgelijnd — blijf stil.",
      pausedSuffix: " · gepauzeerd",
    },
    models: {
      off: "Gezichtsdetector uit — camera draait zonder uitlijning of gezichtspauze.",
      libraryFailed:
        "face-api-bibliotheek mislukt (netwerk / geblokkeerd script).",
      ready: "Gezichtsdetector gereed.",
      unavailable:
        "Detectormodellen niet beschikbaar (CDN + ./models fallback).",
      loadFailed:
        "Gezichtsdetector kon niet worden geladen. Controleer netwerk of de models-map, ververs en probeer opnieuw.",
    },
    upload: {
      statusIdle: "Klaar om te uploaden en score te berekenen",
      statusUploading: "Video uploaden en score berekenen…",
      statusSuccess: "Score berekend. Je kunt doorgaan.",
      statusError:
        "Upload of score mislukt. Gebruik Opnieuw opnemen voor een nieuwe video, of Doorgaan om deze opnieuw te proberen.",
      startsAutomatically: "Upload en scoreberekening starten automatisch.",
      completedSuccess: "Upload naar je API is geslaagd.",
      timedOut: "Upload time-out.",
      timedOutAfter:
        "Upload time-out na {seconds}s. Probeer opnieuw of verhoog FaceScanUpload.timeoutMs in service.js.",
      corsHint:
        "Als dit aanhoudt, controleer of de API deze origin toestaat (CORS) en of je HTTPS of localhost gebruikt.",
      rejectedHttp: "Upload geweigerd (HTTP {status}).",
      rejectedHttpDetail:
        'Upload geweigerd (HTTP {status}).{serverHint} Controleer serverlogs en multipart-veld "{fieldName}".',
      failedHttp: "Upload mislukt (HTTP {status}).",
      refreshRetry:
        "Ververs de pagina om opnieuw te proberen wanneer het probleem is opgelost.",
      urlNotConfigured:
        "Upload-URL is niet geconfigureerd. Stel meta face-scan-upload-url of MAIKA_FACE_SCAN_UPLOAD_URL in (zie README).",
      setUrlHint:
        "Stel de upload-URL in en ververs de pagina om opnieuw te proberen.",
      moduleMissing:
        "Uploadmodule ontbreekt. Laad service.js vóór app.js (zie README).",
      profileMissing:
        "Upload kon niet starten omdat verplichte profielvelden ontbreken.",
      consentRequired:
        "Toestemming voor gezichtsscan is vereist vóór upload en scoreberekening.",
      endpointMissing: "Upload-URL is niet geconfigureerd.",
      networkError: "Netwerk- of CORS-fout.",
      unexpectedError: "Onverwachte uploadfout. Probeer het opnieuw.",
    },
    errors: {
      consentBeforeScan:
        "Geef toestemming voordat je de gezichtsscan start. We gebruiken de video om de arousalscore te berekenen en verwijderen deze daarna.",
      noCameraStream: "Geen camerastream.",
      recorderFailed: "Recorder kon niet worden gestart.",
      httpsRequired: "Camera vereist HTTPS of localhost.",
      cameraBlocked:
        "Cameratoegang is geblokkeerd. Sta de camera toe voor deze site en probeer opnieuw.",
      noCameraFound: "Geen camera gevonden.",
      cameraBusy: "De camera is bezet of kon niet starten.",
      cameraGeneric:
        "Camera kon niet worden geopend. Gebruik HTTPS of localhost.",
    },
  },

  errors: {
    consentRequired: "Geef toestemming voor de camera voordat je start.",
    genreRequired: "Kies een muziekgenre om door te gaan.",
    stepIncomplete: "Voltooi deze stap voordat je doorgaat.",
    uploadInProgress: "Video wordt geüpload en score wordt berekend. Even geduld.",
    recordingRequired: "Maak eerst een gezichtsopname.",
    listenRemainingOne: "Luister nog {remaining} seconde om door te gaan.",
    listenRemainingMany: "Luister nog {remaining} seconden om door te gaan.",
    valenceRequired: "Beweeg de schuifregelaar om aan te geven hoe je je voelt voor je verdergaat.",
  },
};
