// Sites Safran Aircraft Engines affichés sur la carte.
// Adresses : fiches « Locations » de safran-group.com (vérifiées en septembre 2026).
// Les coordonnées sont approximatives (échelle ville / zone industrielle).

export const SITES = [
  {
    id: "corbeil",
    ville: "Corbeil-Essonnes",
    pays: "France",
    iso: "250",
    nom: "Safran Aircraft Engines · Évry-Corbeil",
    adresse: ["Route Henri Auguste Desbruères", "91000 Corbeil-Essonnes, France"],
    lonlat: [2.445, 48.618],
  },
  {
    id: "casablanca",
    ville: "Casablanca",
    pays: "Maroc",
    iso: "504",
    nom: "Safran Aircraft Engine Services Morocco",
    adresse: ["BP 124 · Aéroport Mohammed V · Nouaceur", "CP 27000 Casablanca, Maroc"],
    lonlat: [-7.59, 33.37],
  },
  {
    id: "queretaro",
    ville: "Querétaro",
    pays: "Mexique",
    iso: "484",
    nom: "Safran Aircraft Engines Mexico",
    adresse: [
      "Carretera Estatal 200 Querétaro-Tequisquiapan Km 22.5",
      "Parque Aeroespacial · 76120 Colón, Qro., Mexique",
    ],
    lonlat: [-100.19, 20.62],
  },
  {
    id: "suzhou",
    ville: "Suzhou",
    pays: "Chine",
    iso: "156",
    nom: "Safran Aircraft Engines · Suzhou",
    adresse: ["No. 70 Qi Ming Road · Suzhou Industrial Park", "215126 Jiangsu, Chine"],
    lonlat: [120.73, 31.33],
  },
  {
    id: "villaroche",
    ville: "Villaroche",
    pays: "France",
    iso: "250",
    nom: "Safran Aircraft Engines · Villaroche",
    adresse: ["Rond-point René Ravaud · Réau", "77550 Moissy-Cramayel, France"],
    lonlat: [2.66, 48.605],
  },
];

// Autres sites affichés sans escale.
export const AUTRES_SITES = [
  { id: "gennevilliers", ville: "Gennevilliers", lonlat: [2.27, 48.93] },
  { id: "creusot", ville: "Le Creusot", lonlat: [4.43, 46.8] },
  { id: "chatellerault", ville: "Châtellerault", lonlat: [0.55, 46.84] },
];
