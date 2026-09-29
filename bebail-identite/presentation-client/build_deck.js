// Présentation client bebail : deux propositions d'identité (pptxgenjs)
const path = require("path");
const pptxgen = require(process.env.PPTXGEN || "pptxgenjs");
const sizes = require("./img/sizes.json");

const IMG = (f) => path.join(__dirname, "img", f);
const W = 13.333, H = 7.5, M = 0.6;
const FONT = "Arial";

// Cadre neutre du document ; chaque proposition garde ses propres couleurs
const C = {
  ink: "111418", muted: "5B6470", line: "E3E6E9", paper: "FFFFFF", soft: "F4F5F6",
  A: { nuit: "0B1116", menthe: "5FCB8E", sapin: "17754A", brume: "EEF2F0", ardoise: "8B96A3" },
  B: { encre: "2F3BFF", ciel: "8E97FF", pierre: "ECE8E1", nuit: "0E1126", zinc: "56616B" },
};

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "bebail · Identité visuelle · Deux propositions";
pres.author = "bebail";

// Image ajustée dans une boîte en conservant les proportions (centrée)
function fit(slide, file, x, y, w, h, opts = {}) {
  const [iw, ih] = sizes[file];
  const r = Math.min(w / iw, h / ih);
  const ww = iw * r, hh = ih * r;
  const ax = opts.align === "left" ? x : x + (w - ww) / 2;
  slide.addImage({ path: IMG(file), x: ax, y: y + (h - hh) / 2, w: ww, h: hh });
}
function text(slide, t, o) {
  slide.addText(t, Object.assign({ isTextBox: true, fontFace: FONT, color: C.ink, margin: 0, valign: "top" }, o));
}
function eyebrow(slide, t, x, y, color) {
  text(slide, t, { x, y, w: 8, h: 0.3, fontSize: 11, bold: true, charSpacing: 4, color });
}
function pageNum(slide, n, dark) {
  const col = typeof dark === "string" ? dark : (dark ? "8A93A0" : C.muted);
  text(slide, `bebail · identité visuelle`, { x: M, y: H - 0.45, w: 5, h: 0.25, fontSize: 9, color: col });
  text(slide, String(n).padStart(2, "0"), { x: W - M - 1, y: H - 0.45, w: 1, h: 0.25, fontSize: 9, align: "right", color: col });
}
function tile(slide, x, y, w, h, fill, line) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.18, fill: { color: fill }, line: { color: line || fill, width: 0.75 } });
}
function swatches(slide, list, x, y, w) {
  const gap = 0.18, sw = (w - gap * (list.length - 1)) / list.length;
  list.forEach(([name, hex, use], i) => {
    const xx = x + i * (sw + gap);
    tile(slide, xx, y, sw, 0.95, hex, hex.toUpperCase() === "FFFFFF" || ["ECE8E1", "EEF2F0"].includes(hex) ? "D6D9DC" : hex);
    text(slide, name, { x: xx, y: y + 1.07, w: sw, h: 0.28, fontSize: 13, bold: true });
    text(slide, "#" + hex, { x: xx, y: y + 1.35, w: sw, h: 0.24, fontSize: 10, color: C.muted, fontFace: "Courier New" });
    text(slide, use, { x: xx, y: y + 1.62, w: sw, h: 0.5, fontSize: 10, color: C.muted });
  });
}

let n = 1;

// 1 · Couverture
{
  const s = pres.addSlide(); s.background = { color: C.ink };
  eyebrow(s, "IDENTITÉ VISUELLE · SEPTEMBRE 2026", M, 0.75, "8A93A0");
  text(s, "bebail", { x: M, y: 1.25, w: 7, h: 1.3, fontSize: 72, bold: true, color: "FFFFFF" });
  text(s, "Deux propositions de logo et de charte graphique", { x: M, y: 2.6, w: 6.2, h: 1.0, fontSize: 24, color: "C9CED4" });
  text(s, "Gérer son immobilier ne devrait pas être un second métier.", { x: M, y: 5.9, w: 6.2, h: 0.4, fontSize: 13, italic: true, color: "8A93A0" });
  tile(s, 7.55, 1.25, 2.4, 2.4, C.A.nuit, "2A323B"); fit(s, "A-symbole-petit-couleur-sombre.png", 7.95, 1.65, 1.6, 1.6);
  tile(s, 10.15, 1.25, 2.4, 2.4, C.B.encre); fit(s, "B-symbole-petit-encre.png", 10.55, 1.65, 1.6, 1.6);
  text(s, "A · Signature", { x: 7.55, y: 3.85, w: 2.4, h: 0.3, fontSize: 13, bold: true, color: "FFFFFF" });
  text(s, "B · b-signature", { x: 10.15, y: 3.85, w: 2.4, h: 0.3, fontSize: 13, bold: true, color: "FFFFFF" });
  s.addNotes("Présentation des deux directions d'identité pour bebail. Montrer d'abord le brief, puis chaque proposition, puis la comparaison et la recommandation.");
  n++;
}

// 2 · Ce que nous avons retenu
{
  const s = pres.addSlide(); s.background = { color: C.paper };
  eyebrow(s, "LE BRIEF", M, 0.6, C.muted);
  text(s, "Ce que nous avons retenu", { x: M, y: 0.95, w: 9, h: 0.8, fontSize: 36, bold: true });
  tile(s, M, 2.05, 5.4, 3.9, C.soft, C.line);
  text(s, "« Gérer son immobilier ne devrait pas être un second métier. »", { x: M + 0.4, y: 2.45, w: 4.6, h: 2.2, fontSize: 26, bold: true });
  text(s, "La promesse de bebail.com, point de départ de l'identité.", { x: M + 0.4, y: 5.0, w: 4.6, h: 0.6, fontSize: 12, color: C.muted });
  const rows = [
    ["Pour qui", "Les propriétaires bailleurs d'aujourd'hui : LMNP, location courte durée et baux longue durée."],
    ["Ce que fait bebail", "Contrats, quittances, signature électronique, comptabilité et copilote IA, dans un seul espace."],
    ["Ce que la marque doit inspirer", "Sérénité, simplicité, fiabilité juridique, modernité."],
  ];
  rows.forEach(([h, b], i) => {
    const y = 2.05 + i * 1.3;
    s.addShape(pres.shapes.OVAL, { x: 6.55, y: y + 0.05, w: 0.42, h: 0.42, fill: { color: C.ink } });
    text(s, String(i + 1), { x: 6.55, y: y + 0.05, w: 0.42, h: 0.42, fontSize: 13, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
    text(s, h, { x: 7.2, y, w: 5.5, h: 0.35, fontSize: 16, bold: true });
    text(s, b, { x: 7.2, y: y + 0.4, w: 5.5, h: 0.75, fontSize: 13, color: C.muted });
  });
  text(s, "À éviter dans le secteur : immeubles génériques, clés, toit posé sur une coche, bulle de chat, bleu bancaire.", { x: M, y: 6.3, w: 12, h: 0.35, fontSize: 12, color: C.muted, italic: true });
  pageNum(s, n++, false);
  s.addNotes("Rappeler la cible et la promesse. Insister sur les clichés du secteur que les deux propositions évitent.");
}

// 3 · Deux directions
{
  const s = pres.addSlide(); s.background = { color: C.paper };
  eyebrow(s, "VUE D'ENSEMBLE", M, 0.6, C.muted);
  text(s, "Deux directions, deux niveaux de changement", { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 36, bold: true });
  const cw = (W - 2 * M - 0.4) / 2;
  tile(s, M, 2.05, cw, 3.0, C.A.nuit); fit(s, "A-horizontal-couleur-sombre.png", M + 0.6, 2.55, cw - 1.2, 2.0);
  tile(s, M + cw + 0.4, 2.05, cw, 3.0, C.B.pierre, "D9D3C8"); fit(s, "B-horizontal-pierre.png", M + cw + 1.0, 2.55, cw - 1.2, 2.0);
  text(s, "A · Signature, l'évolution", { x: M, y: 5.3, w: cw, h: 0.4, fontSize: 18, bold: true });
  text(s, "Garde le vert menthe du site. Une maison tracée d'un seul trait qui finit en paraphe.", { x: M, y: 5.75, w: cw, h: 0.7, fontSize: 13, color: C.muted });
  text(s, "B · b-signature, la rupture", { x: M + cw + 0.4, y: 5.3, w: cw, h: 0.4, fontSize: 18, bold: true });
  text(s, "Nouvelle palette encre et pierre. Un b dont la panse est une maison et le pied un paraphe.", { x: M + cw + 0.4, y: 5.75, w: cw, h: 0.7, fontSize: 13, color: C.muted });
  pageNum(s, n++, false);
  s.addNotes("A prolonge l'univers actuel du site. B repart de l'initiale et change la palette : plus distinctif, mais demande de recolorer le site.");
}

// Séquence commune à chaque proposition
function proposal(p) {
  // Intercalaire
  {
    const s = pres.addSlide(); s.background = { color: p.sectionBg };
    text(s, p.letter, { x: M, y: 0.9, w: 3, h: 2.4, fontSize: 160, bold: true, color: p.sectionAccent });
    eyebrow(s, "PROPOSITION " + p.letter, M, 3.6, p.sectionAccent);
    text(s, p.name, { x: M, y: 3.95, w: 6.3, h: 1.0, fontSize: 48, bold: true, color: "FFFFFF" });
    text(s, p.oneLiner, { x: M, y: 5.05, w: 6.0, h: 1.0, fontSize: 18, color: p.sectionSub });
    fit(s, p.sectionSymbol, 7.4, 1.0, 5.3, 5.3);
    pageNum(s, n++, p.sectionSub);
    s.addNotes(p.notesSection);
  }
  // L'idée
  {
    const s = pres.addSlide(); s.background = { color: C.paper };
    eyebrow(s, "PROPOSITION " + p.letter + " · L'IDÉE", M, 0.6, p.accent);
    text(s, p.ideaTitle, { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 36, bold: true });
    s.addImage({ path: IMG(p.construction), x: M, y: 1.95, w: 4.7, h: 4.7 });
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.95, w: 4.7, h: 4.7, fill: { type: "none" }, line: { color: C.line, width: 0.75 } });
    const x = 6.0, tw = W - M - x;
    text(s, p.ideaLead, { x, y: 2.0, w: tw, h: 0.9, fontSize: 16, color: C.ink });
    const runs = [];
    p.points.forEach(([b, t], i) => {
      runs.push({ text: b + " ", options: { bold: true, bullet: true } });
      runs.push({ text: t, options: { breakLine: i < p.points.length - 1 } });
    });
    s.addText(runs, { isTextBox: true, x, y: 3.05, w: tw, h: 2.6, fontFace: FONT, fontSize: 15, color: C.ink, paraSpaceAfter: 16, valign: "top", margin: 0 });
    text(s, p.ideaNote, { x, y: 5.9, w: tw, h: 0.7, fontSize: 12, color: C.muted, italic: true });
    pageNum(s, n++, false);
    s.addNotes(p.notesIdea);
  }
  // Logo & couleurs
  {
    const s = pres.addSlide(); s.background = { color: C.paper };
    eyebrow(s, "PROPOSITION " + p.letter + " · LOGO ET COULEURS", M, 0.6, p.accent);
    text(s, p.paletteTitle, { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 36, bold: true });
    const cw = (W - 2 * M - 0.4) / 2;
    tile(s, M, 1.95, cw, 2.2, p.darkBg); fit(s, p.lockDark, M + 0.6, 2.3, cw - 1.2, 1.5);
    tile(s, M + cw + 0.4, 1.95, cw, 2.2, p.lightBg, "D6D9DC"); fit(s, p.lockLight, M + cw + 1.0, 2.3, cw - 1.2, 1.5);
    swatches(s, p.palette, M, 4.45, W - 2 * M);
    pageNum(s, n++, false);
    s.addNotes(p.notesPalette);
  }
  // En situation
  {
    const s = pres.addSlide(); s.background = { color: C.soft };
    eyebrow(s, "PROPOSITION " + p.letter + " · EN SITUATION", M, 0.6, p.accent);
    text(s, "Site, appli, réseaux, papeterie", { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 36, bold: true });
    fit(s, p.mockups, M, 1.9, W - 2 * M, 5.0);
    pageNum(s, n++, false);
    s.addNotes(p.notesMock);
  }
}

proposal({
  letter: "A", name: "Signature", accent: C.A.sapin,
  sectionBg: C.A.nuit, sectionAccent: C.A.menthe, sectionSub: "B7C0C8", sectionSymbol: "A-symbole-couleur-sombre.png",
  oneLiner: "Une maison tracée d'un seul trait qui finit en paraphe : le bail signé.",
  ideaTitle: "Le bail signé devient un chez-soi",
  construction: "A-construction.png",
  ideaLead: "Un geste humain plutôt qu'un pictogramme : le symbole se dessine sans lever le stylo.",
  points: [["Un trait continu :", "un seul outil, un seul espace."], ["Un toit à 45° :", "construit sur une grille de 16 unités."], ["Un paraphe final :", "la signature électronique et la confiance."], ["Des extrémités arrondies :", "la sérénité promise aux propriétaires."]],
  ideaNote: "Une coupe simplifiée existe pour les très petites tailles (favicon, icônes système).",
  paletteTitle: "Menthe sur nuit, dans la continuité du site",
  darkBg: C.A.nuit, lightBg: "FFFFFF", lockDark: "A-horizontal-couleur-sombre.png", lockLight: "A-horizontal-couleur-clair.png",
  palette: [["Nuit", C.A.nuit, "Fond principal"], ["Menthe", C.A.menthe, "Symbole et accents sur fond sombre"], ["Sapin", C.A.sapin, "Symbole sur fond clair"], ["Brume", C.A.brume, "Fonds clairs, documents"], ["Ardoise", C.A.ardoise, "Texte secondaire sur Nuit"]],
  mockups: "A-maquettes.png",
  notesSection: "Proposition A : on garde l'univers actuel (fond sombre, vert menthe) et on remplace l'icône d'immeuble par un signe propre à bebail.",
  notesIdea: "Expliquer le geste : amorce, murs, toit, paraphe. Le paraphe renvoie à la signature électronique, point fort du produit.",
  notesPalette: "Le vert menthe manque de contraste sur blanc : sur fond clair, on passe au vert Sapin.",
  notesMock: "Montrer la cohérence : icône d'appli, onglet, réseaux, cartes de visite.",
});

proposal({
  letter: "B", name: "b-signature", accent: C.B.encre,
  sectionBg: C.B.encre, sectionAccent: "FFFFFF", sectionSub: "DDE0FF", sectionSymbol: "B-symbole-encre.png",
  oneLiner: "L'initiale, la maison et la signature, en un trait.",
  ideaTitle: "Un b qui loge, un pied qui signe",
  construction: "B-construction.png",
  ideaLead: "bebail part de sa propre initiale : on lit la lettre, puis la maison, puis le paraphe.",
  points: [["Le fût du b", "dépasse le toit : la lettre se lit en premier."], ["La panse est un logement,", "toit à 45° exacts."], ["Le pied file en paraphe :", "la signature, la valeur juridique."], ["Le « l » du nom", "reprend le même paraphe : nom et symbole se répondent."]],
  ideaNote: "Le nom s'écrit « bebail », en minuscules et d'une seule couleur. Le tracé s'anime pour le chargement et la confirmation « Bail signé ».",
  paletteTitle: "Des murs de pierre, une signature à l'encre",
  darkBg: C.B.nuit, lightBg: C.B.pierre, lockDark: "B-horizontal-nuit.png", lockLight: "B-horizontal-pierre.png",
  palette: [["Encre", C.B.encre, "Logo, boutons, liens"], ["Pierre", C.B.pierre, "Fond principal clair"], ["Nuit", C.B.nuit, "Texte, mode sombre"], ["Ciel", C.B.ciel, "L'encre sur fond sombre"], ["Zinc", C.B.zinc, "Texte secondaire"]],
  mockups: "B-maquettes.png",
  notesSection: "Proposition B : une rupture. Nouvelle palette et nouveau symbole bâti sur l'initiale.",
  notesIdea: "Montrer comment le b, la maison et le paraphe se superposent. Le mot bebail reprend le paraphe dans son l.",
  notesPalette: "Palette tirée de l'immeuble parisien : pierre des façades, zinc des toits, encre du stylo. Dosage : 60 % pierre, 30 % nuit, 10 % encre.",
  notesMock: "Le b fonctionne seul comme icône d'appli, avatar et favicon.",
});

// Comparaison
{
  const s = pres.addSlide(); s.background = { color: C.paper };
  eyebrow(s, "COMPARAISON", M, 0.6, C.muted);
  text(s, "Côte à côte", { x: M, y: 0.95, w: 12, h: 0.8, fontSize: 36, bold: true });
  const hd = (t, fill, color) => ({ text: t, options: { bold: true, fill: { color: fill }, color, fontSize: 14 } });
  const rows = [
    ["Idée", "Maison et signature", "Initiale, maison et signature"],
    ["Lisibilité à 16 px", "Correcte avec la coupe simplifiée", "Très bonne : le b reste net"],
    ["Distinction dans le secteur", "Bonne ; le vert sur noir est courant en tech", "Forte ; encre et pierre inédites dans la gestion locative"],
    ["Continuité avec le site", "Totale : reprend le vert actuel", "Faible : couleurs du site à reprendre"],
    ["Effort de mise en place", "Faible", "Moyen : boutons, visuels, captures"],
    ["Potentiel (animation, icônes)", "Bon", "Très bon : tracé animé, icônes au même trait"],
  ];
  const body = rows.map(([a, b, c]) => [
    { text: a, options: { bold: true, color: C.ink } },
    { text: b, options: { color: C.ink } },
    { text: c, options: { color: C.ink } },
  ]);
  s.addTable([[hd("Critère", C.soft, C.ink), hd("A · Signature", C.A.nuit, "FFFFFF"), hd("B · b-signature", C.B.encre, "FFFFFF")], ...body], {
    x: M, y: 1.95, w: W - 2 * M, colW: [3.0, 4.56, 4.57], fontFace: FONT, fontSize: 13, valign: "middle",
    border: { type: "solid", pt: 0.75, color: C.line }, rowH: 0.62, margin: [0.08, 0.14, 0.08, 0.14],
  });
  pageNum(s, n++, false);
  s.addNotes("Les deux sont solides. A minimise le changement ; B maximise la distinction et la mémorisation.");
}

// Recommandation
{
  const s = pres.addSlide(); s.background = { color: C.ink };
  eyebrow(s, "NOTRE RECOMMANDATION", M, 0.6, "8A93A0");
  text(s, "B · b-signature", { x: M, y: 0.95, w: 7, h: 0.9, fontSize: 44, bold: true, color: "FFFFFF" });
  s.addText([
    { text: "Le seul signe du secteur qui réunit l'initiale, le logement et la signature.", options: { bullet: true, breakLine: true } },
    { text: "Une palette que personne n'utilise dans la gestion locative.", options: { bullet: true, breakLine: true } },
    { text: "Le b tient seul : icône d'appli, favicon, avatar, animation.", options: { bullet: true } },
  ], { isTextBox: true, x: M, y: 2.05, w: 6.6, h: 2.0, fontFace: FONT, fontSize: 16, color: "E6E8EA", paraSpaceAfter: 10, valign: "top", margin: 0 });
  text(s, "Si la priorité est de ne pas toucher au site actuel, la proposition A reste une évolution solide.", { x: M, y: 4.2, w: 6.4, h: 0.7, fontSize: 13, italic: true, color: "8A93A0" });
  tile(s, 8.0, 0.95, 4.73, 3.9, C.B.encre); fit(s, "B-symbole-encre.png", 8.9, 1.35, 2.95, 3.1);
  eyebrow(s, "PROCHAINES ÉTAPES", M, 5.15, "8A93A0");
  const steps = ["Choix de la direction", "Ajustements", "Livraison des fichiers", "Recherche INPI et dépôt"];
  const sw = (W - 2 * M - 0.3 * 3) / 4;
  steps.forEach((t, i) => {
    const x = M + i * (sw + 0.3);
    tile(s, x, 5.5, sw, 1.0, "1C2127", "2A313A");
    text(s, String(i + 1), { x: x + 0.25, y: 5.62, w: 0.5, h: 0.4, fontSize: 18, bold: true, color: C.B.ciel });
    text(s, t, { x: x + 0.25, y: 6.02, w: sw - 0.4, h: 0.35, fontSize: 13, bold: true, color: "FFFFFF" });
  });
  s.addNotes("Recommander B, tout en laissant A comme option à faible coût. Rappeler qu'une recherche d'antériorité est nécessaire avant tout dépôt.");
}

const out = path.join(__dirname, "bebail-propositions-identite.pptx");
pres.writeFile({ fileName: out }).then(() => console.log("écrit", out));
