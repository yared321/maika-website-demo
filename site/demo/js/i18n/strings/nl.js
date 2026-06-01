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
      copy: "Kies je muziek en luistertijd, en start daarna de begeleide flow.",
      genreLabel: "Muziekgenre",
      genreAria: "Muziekgenre",
      genreLoading: "Genres laden…",
      genreEmpty: "Geen genres beschikbaar",
      durationLabel: "Luistertijd",
      durationAria: "Luistertijd",
      duration2Min: "2 minuten",
      duration5Min: "5 minuten",
      duration10Min: "10 minuten",
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
    },
    results: {
      valenceNegative: "Negatief",
      valencePositive: "Positief",
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
  },
};
