// NOTE: All Swedish texts are PROVISIONAL — please have a native speaker review
// before publishing.

export const site = {
  studioName: "Pedro Forsberg Arkitekt",

  nav: [
    { label: "Projekt", href: "#projekt" },
    { label: "Studio", href: "#studio" },
    { label: "Kontakt", href: "#kontakt" },
  ],

  hero: {
    heading: "Byggnader som växer ur platsen.",
    dataLabelLeft: "Utvalda projekt",
    // dataLabelRight is built dynamically: `${total} projekt`
  },

  projects: {
    sectionTitle: "Projekt",
    filterAll: "Alla",
  },

  studio: {
    label: "Studion",
    statement: "Arkitektstudio som följer projektet hela vägen, från första skiss till byggledning. Färre gester, mer precision.",
    services: [
      { number: "01", name: "Projektering", body: "Förslag, bygghandlingar och bygglov." },
      { number: "02", name: "Byggledning", body: "Uppföljning på byggplatsen och kvalitetskontroll." },
      { number: "03", name: "Interiör", body: "Rum, möbler och detaljer efter mått." },
    ],
  },

  footer: {
    closing: "Hör av dig om ditt projekt.",
    email: "hej@exempel.se",
    copyright: "© Pedro Forsberg Arkitekt",
    socials: [
      { label: "Instagram", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
  },

  page: {
    title: "Pedro Forsberg Arkitekt — Arkitektur",
    description: "Arkitektstudio med fokus på precision och platsanpassad design.",
  },
} as const;
