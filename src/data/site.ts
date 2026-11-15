// Fixed UI texts and default fallbacks for content managed in Sanity.

export const site = {
  studioName: "Pedro Forsberg Arkitekt",

  nav: [
    { label: "Projekt", href: "#projekt" },
    { label: "Studio", href: "#studio" },
    { label: "Kontakt", href: "#kontakt" },
  ],

  hero: {
    heading: "Byggnader som växer ur platsen.",
    dataLabelLeft: "Om mig",
  },

  aboutMe: {
    label: "Om mig",
    toolsLabel: "Verktyg",
    defaultText:
      "Arkitekt med fokus på platsanpassad gestaltning, genomtänkta materialval och hög detaljprecision — från tidiga skisser och 3D-visualisering till färdig bygghandling.",
  },

  projects: {
    sectionTitle: "Projekt",
    filterAll: "Alla",
    emptyState: "Inga projekt ännu.",
  },

  projectPage: {
    back: "Tillbaka",
    previous: "Föregående",
    next: "Nästa",
    nextProject: "Nästa projekt",
    photographer: "Fotograf",
    year: "År",
    category: "Kategori",
    galleryAria: "Bildgalleri",
    counterAria: "Bild {n} av {total}",
  },

  studio: {
    label: "Studion",
    statement:
      "Arkitektstudio som följer projektet hela vägen, från första skiss till byggledning. Färre gester, mer precision.",
    services: [
      { number: "01", name: "Projektering", body: "Förslag, bygghandlingar och bygglov." },
      { number: "02", name: "Byggledning", body: "Uppföljning på byggplatsen och kvalitetskontroll." },
      { number: "03", name: "Interiör", body: "Rum, möbler och detaljer efter mått." },
    ],
  },

  footer: {
    closing: "Mina kontakter",
    email: "pedrocforsberg99@gmail.com",
    copyright: "© Pedro Forsberg Arkitekt",
    copyEmailTooltip: "Klicka för att kopiera",
    copyEmailAria: "Kopiera e-postadressen",
    emailCopiedToast: "E-postadressen har kopierats",
    linkedinAria: "LinkedIn (öppnas i en ny flik)",
  },

  page: {
    title: "Pedro Forsberg Arkitekt — Arkitektur",
    description: "Arkitektstudio med fokus på precision och platsanpassad design.",
  },
} as const;
