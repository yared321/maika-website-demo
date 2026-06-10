/**
 * German UI strings for the Maika demo.
 */
export default {
  meta: {
    pageTitle: "Maika – KI-Musik für deine Gesundheit",
    description:
      "Adaptive KI-Musik in Echtzeit, die Biometrie nutzt, um Stressabbau, Fokus, Erholung und Wohlbefinden zu unterstützen.",
    ogDescription:
      "KI-gestützte adaptive Musik für Stressabbau, Fokus und Erholung.",
  },

  nav: {
    brandTagline: "KI-Musik für deine Gesundheit",
    demo: "Demo",
    primaryAria: "Hauptnavigation",
    languageAria: "Sprache wählen",
    localeDe: "Deutsch",
    localeEn: "English",
  },

  landing: {
    ariaLabel: "Demo-Übersicht",
    kicker: "Live Demo",
    title: "Erlebe den Effekt von Musik auf dein Nervensystem – live in unserer Maika-Demo-Session.",
    copy:
      "Musik hören, ein kurzer Gesichtsscan, sofortiges Feedback – in wenigen Minuten.",
    points: {
      consent: "Einwilligung für Kamerazugriff",
      upload: "Automatischer Upload + Auswertung",
      result: "Ergebnisansicht",
    },
    steps: {
      step1Title: "Schritt 1",
      step1Desc: "Ausgangsmessung (Ruhe-Scan)",
      step2Title: "Schritt 2",
      step2Desc: "Musik hören",
      step3Title: "Schritt 3",
      step3Desc: "Messung während der Musik",
      step4Title: "Schritt 4",
      step4Desc: "Ergebnis ansehen",
    },
    access: {
      title: "Demo ausprobieren",
      copy: "Wähle deine Musik und starte dann den geführten Ablauf.",
      genreLabel: "Musikgenre",
      genreAria: "Musikgenre",
      genreLoading: "Genres werden geladen…",
      genreEmpty: "Keine Genres verfügbar",
      consentLabel:
        "Ich willige ein, dass mein Gesichtsscan-Video zur Berechnung meiner Biometrie verwendet wird.",
      consentNote:
        "Dein Video wird nur für deine Sitzungsergebnisse verwendet und direkt nach der Verarbeitung gelöscht.",
      cta: "Demo starten",
    },
  },

  wizard: {
    kicker: "Maika-Demo",
    back: "Zurück",
    next: "Weiter",
    nextContinue: "Fortfahren",
    nextProceedFaceScan: "Weiter zum Gesichtsscan",
    nextDone: "Fertig",
    faceScan: {
      baselineTitle: "Ausgangsmessung",
      baselineSubtitle: "Deine Ausgangsmessung in Ruhe.",
      postTitle: "Gesichtsscan",
      postSubtitle: "Scanne erneut nach dem Musikhören.",
      scanIntroTitle: "So geht's",
      instructions: {
        allowCamera:
          "Erlaube den Kamerazugriff, wenn dein Browser danach fragt.",
        centerFace:
          "Zentriere dein Gesicht im Kamerabild, bis die Statuszeile grün wird.",
        pauseWhenOut:
          "Wenn du den Zielbereich verlässt, pausiert die Aufnahme, bis du zurückkehrst.",
        holdSteady:
          "Halte still – die Aufnahme startet automatisch nach einem kurzen Countdown.",
      },
    },
    results: {
      valenceNegative: "Negativ",
      valenceNeutral: "Neutral",
      valencePositive: "Positiv",
      title: "Dein Sitzungsergebnis",
      focusScore: "Fokus-Score",
      relaxScore: "Entspannungs-Score",
      arousalScore: "Arousal-Score",
      activation: "Aktivierung",
      activationAxis: "Aktivierung",
      relaxationAxis: "Entspannung",
      beforeMusic: "Vor der Musik",
      afterMusic: "Nach der Musik",
      compareAria: "Vergleich Gesichtsscan vor und nach Musik",
      mapAria:
        "Emotionskonstellation mit Valenz auf der x-Achse und Arousal auf der y-Achse",
      completeBothScans:
        "Schließe beide Messungen ab, um den Unterschied zwischen Ausgangsmessung und nach der Musik zu sehen.",
      activationUnchanged:
        "Dein Aktivierungsniveau blieb nach der Musik fast unverändert.",
      activationHigher:
        "Deine Abschlussmessung zeigt eine höhere Aktivierung als vor der Musik. Die Musik hat dich aktiviert.",
      activationLower:
        "Deine Abschlussmessung zeigt eine niedrigere Aktivierung als vor der Musik. Die Musik hat dich entspannt.",
      modes: {
        angry: "Wütend",
        afraid: "Ängstlich",
        stressed: "Gestresst",
        annoyed: "Genervt",
        frustrated: "Frustriert",
        disappointed: "Enttäuscht",
        apathetic: "Apathisch",
        melancholic: "Melancholisch",
        sad: "Traurig",
        bored: "Gelangweilt",
        neutral: "Neutral",
        aroused: "Erregt",
        excited: "Aufgeregt",
        focused: "Konzentriert",
        happy: "Glücklich",
        pleased: "erfreut",
        content: "Zufrieden",
        relaxed: "Entspannt",
        calm: "Ruhig",
      },
    },
  },

  music: {
    playbackAria: "Musikwiedergabe",
    playPauseAria: "Abspielen oder pausieren",
    loadingAudio: "Audio wird geladen…",
    spectrumAria: "Live-Frequenzspektrum",
    volume: "Lautstärke",
    volumeAria: "Lautstärke",
    positionAria: "Wiedergabeposition",
    prevAria: "Vorheriger Titel",
    rewindAria: "10 Sekunden zurück",
    forwardAria: "10 Sekunden vor",
    nextAria: "Nächster Titel",
    defaultTitle: "Titel",
    selectPlaceholder: "— Titel wählen —",
    playSelected: "Ausgewählten Titel abspielen",
    starting: "Wiedergabe startet",
    playing: "Wird abgespielt",
    play: "Abspielen",
    unableToLoad: "Titel konnte nicht geladen werden",
    audioUnsupported: "Dein Browser unterstützt das Audio-Element nicht.",
  },

  valence: {
    title: "Wie fühlst du dich gerade?",
    copy:
      "Bewege den Schieberegler während der Aufnahme: links ist unangenehmer, rechts ist angenehmer.",
    sliderAria: "Valenz-Score von negativ bis positiv",
    veryNegative: "Sehr negativ / unangenehm",
    negative: "Negativ",
    neutral: "Neutral",
    positive: "Positiv",
    veryPositive: "Sehr positiv / angenehm",
  },

  faceScan: {
    howToRecordAria: "So nimmst du auf",
    beforeStartTitle: "Bevor du startest",
    beforeStartLighting:
      "Gutes, gleichmäßiges Licht; Kamera auf Augenhöhe; bleib still und sprich während der Aufnahme nicht.",
    beforeStartTap: "Tippe auf Kamera starten, wenn du bereit bist",
    startCamera: "Kamera starten",
    loadingDetector: "Gesichtserkennung wird geladen…",
    recordingAria: "Gesichtsaufnahme",
    recordingCompleteAria: "Aufnahme abgeschlossen",
    stepLabel: "Gesichtsscan",
    cancel: "Abbrechen",
    tryAgain: "Erneut versuchen",
    recordAgain: "Erneut aufnehmen",
    recordingFinished: "Aufnahme beendet.",
    previewTitle: "Vorschau der aufgenommenen Video",
    overlay: {
      startingCamera: "Kamera wird gestartet",
      requestingPermission: "Berechtigung wird angefragt…",
      preparingScan: "Gesichtsscan wird vorbereitet…",
      requestingAccess: "Kamerazugriff wird angefragt…",
      model: "Modell",
      camera: "Kamera",
      alignment: "Ausrichtung",
      preparingDetector:
        "Wir bereiten den Detektor im Hintergrund vor, damit der Start reibungsloser verläuft.",
      finalizingDetector:
        "Detektor wird gestartet. Das passiert einmal und dauert meist ein paar Sekunden.",
      allowCameraTip:
        "Bitte erlaube den Kamerazugriff, wenn dein Browser danach fragt.",
      cantUseCamera: "Kamera kann nicht verwendet werden",
    },
    hud: {
      qualityKicker: "Messqualität",
      defaultText:
        "Bleib still, halte das Licht gleichmäßig und zentriere dein Gesicht.",
      preparing: "Wird vorbereitet…",
      greatFraming:
        "Gute Einstellung. Halte dein Gesicht zentriert und ruhig.",
      greatSignal:
        "Gutes Signal. Halte dein Gesicht ruhig und zentriert.",
      measuring: "Wird gemessen…",
      alignmentGood:
        "Ausrichtung sieht gut aus. Bleib still für den automatischen Start.",
      almostReady: "Fast fertig…",
      moveIntoFrame: "Komm ins Bild und halte dein Gesicht zentriert.",
      adjustingPosition: "Position wird angepasst…",
      centerInGuide:
        "Zentriere dein Gesicht in der Hilfe. Wir starten automatisch, sobald die Ausrichtung stabil ist.",
      perfectAlignment: "Perfekte Ausrichtung. Aufnahme startet jetzt…",
    },
    placement: {
      lookingForFace: "Gesicht wird gesucht…",
      centerInFrame: "Zentriere dein Gesicht im Rahmen.",
      moveToCenter: "Bewege dich zur Mitte.",
      moveCloser: "Komm etwas näher.",
      moveBack: "Geh etwas zurück.",
      moveRight: "Bewege dich etwas nach rechts.",
      moveLeft: "Bewege dich etwas nach links.",
      moveDown: "Bewege dich etwas nach unten.",
      moveUp: "Bewege dich etwas nach oben.",
      guideNear: "Näher kommen",
      guideFar: "Zurückgehen",
      guideCenter: "Zur Mitte",
      guideLeft: "Nach links",
      guideRight: "Nach rechts",
      guideUp: "Nach oben",
      guideDown: "Nach unten",
      starting: "Wird gestartet…",
    },
    recording: {
      fullView: "Aufnahme — Vollansicht.",
      guideOff: "Aufnahme — Gesichtshilfe aus.",
      inProgress: "Aufnahme läuft…",
      paused: "Pausiert — zur Mitte bewegen.",
      pausedCenter: "Pausiert — zentriere dein Gesicht in der Mitte.",
      pausedCenterFrame: "Pausiert — zentriere dein Gesicht im Rahmen.",
      pausedDark: "Pausiert — zu dunkel. Mehr Licht hinzufügen.",
      tooDark: "Zu dunkel — mehr Licht auf dein Gesicht.",
      almostThere: "Fast geschafft — bleib still.",
      lookingGood: "Sieht gut aus.",
      aligned: "Gesicht ausgerichtet — bleib still.",
      pausedSuffix: " · pausiert",
    },
    models: {
      off: "Gesichtserkennung aus — Kamera läuft ohne Ausrichtung oder Gesichtspause.",
      libraryFailed:
        "face-api-Bibliothek fehlgeschlagen (Netzwerk / blockiertes Skript).",
      ready: "Gesichtserkennung bereit.",
      unavailable:
        "Detektormodelle nicht verfügbar (CDN + ./models Fallback).",
      loadFailed:
        "Gesichtserkennung konnte nicht geladen werden. Prüfe Netzwerk oder den models-Ordner, lade neu und versuche es erneut.",
    },
    upload: {
      statusIdle: "Bereit zum Hochladen und Score-Berechnung",
      statusUploading: "Video wird hochgeladen und Score wird berechnet…",
      statusSuccess: "Score berechnet. Du kannst fortfahren.",
      statusError:
        "Upload oder Score fehlgeschlagen. Nutze Erneut aufnehmen für ein neues Video oder Fortfahren, um dieses erneut zu versuchen.",
      startsAutomatically: "Upload und Score-Berechnung starten automatisch.",
      completedSuccess: "Upload zu deiner API erfolgreich abgeschlossen.",
      timedOut: "Upload-Zeitüberschreitung.",
      timedOutAfter:
        "Upload-Zeitüberschreitung nach {seconds}s. Versuche es erneut oder erhöhe FaceScanUpload.timeoutMs in service.js.",
      corsHint:
        "Wenn das anhält, prüfe, ob die API diesen Origin erlaubt (CORS) und ob du HTTPS oder localhost nutzt.",
      rejectedHttp: "Upload abgelehnt (HTTP {status}).",
      rejectedHttpDetail:
        'Upload abgelehnt (HTTP {status}).{serverHint} Server-Logs und Multipart-Feld „{fieldName}" prüfen.',
      failedHttp: "Upload fehlgeschlagen (HTTP {status}).",
      refreshRetry:
        "Lade die Seite neu, um es erneut zu versuchen, sobald das Problem behoben ist.",
      urlNotConfigured:
        "Upload-URL ist nicht konfiguriert. Setze meta face-scan-upload-url oder MAIKA_FACE_SCAN_UPLOAD_URL (siehe README).",
      setUrlHint:
        "Setze die Upload-URL und lade die Seite neu, um es erneut zu versuchen.",
      moduleMissing:
        "Upload-Modul fehlt. Lade service.js vor app.js (siehe README).",
      profileMissing:
        "Upload konnte nicht starten, weil erforderliche Profilfelder fehlen.",
      consentRequired:
        "Einwilligung zum Gesichtsscan ist vor Upload und Score-Berechnung erforderlich.",
      endpointMissing: "Upload-URL ist nicht konfiguriert.",
      networkError: "Netzwerk- oder CORS-Fehler.",
      unexpectedError: "Unerwarteter Upload-Fehler. Bitte versuche es erneut.",
    },
    errors: {
      consentBeforeScan:
        "Bitte gib deine Einwilligung, bevor du den Gesichtsscan startest. Wir nutzen das Video zur Berechnung des Arousal-Scores und löschen es danach.",
      noCameraStream: "Kein Kamerastream.",
      recorderFailed: "Recorder konnte nicht gestartet werden.",
      httpsRequired: "Kamera benötigt HTTPS oder localhost.",
      cameraBlocked:
        "Kamerazugriff wurde blockiert. Erlaube die Kamera für diese Seite und versuche es erneut.",
      noCameraFound: "Keine Kamera gefunden.",
      cameraBusy: "Die Kamera ist belegt oder konnte nicht starten.",
      cameraGeneric:
        "Kamera konnte nicht geöffnet werden. Nutze HTTPS oder localhost.",
    },
  },

  errors: {
    consentRequired:
      "Bitte stimme der Kamera-Einwilligung zu, bevor du startest.",
    genreRequired: "Wähle ein Musikgenre, um fortzufahren.",
    stepIncomplete: "Bitte schließe diesen Schritt ab, bevor du fortfährst.",
    uploadInProgress:
      "Video wird hochgeladen und Score wird berechnet. Bitte warten.",
    recordingRequired: "Nimm zuerst eine Gesichtsaufnahme auf.",
    listenRemainingOne:
      "Höre noch {remaining} Sekunde, um fortzufahren.",
    listenRemainingMany:
      "Höre noch {remaining} Sekunden, um fortzufahren.",
    valenceRequired: "Bewege den Schieberegler, um anzugeben, wie du dich fühlst, bevor du fortfährst.",
  },
};
