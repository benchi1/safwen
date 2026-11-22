// Jeu d'icônes maison « اعرف دينك ونبيك » — grille 48×48, trait anguleux d'inspiration kufique.
// s = tracé (stroke), f = forme pleine (fill). Exportées aussi en SVG dans icons/.
const ICONS = {
  // نكتة — la goutte d'encre
  drop:   { s: 'M24 5 L35 24 L35 32 L29 41 L19 41 L13 32 L13 24 Z' },
  // توبة — le retour
  tawba:  { s: 'M36 6 L36 36 L12 36 L12 15 M5 22 L12 15 L19 22' },
  // استغفار — le chapelet
  beads:  { s: 'M24 34 L24 44', f: 'M22 4h4v4h-4z M32.1 8.2l2.8 2.8-2.8 2.8-2.8-2.8z M36 18h4v4h-4z M32.1 26.2l2.8 2.8-2.8 2.8-2.8-2.8z M22 30h4v4h-4z M15.9 26.2l2.8 2.8-2.8 2.8-2.8-2.8z M8 18h4v4H8z M15.9 8.2l2.8 2.8-2.8 2.8-2.8-2.8z M21 42h6v4h-6z' },
  // ذكر — les ondes imbriquées
  dhikr:  { s: 'M24 4 L44 24 L24 44 L4 24 Z M24 14 L34 24 L24 34 L14 24 Z', f: 'M22 22h4v4h-4z' },
  // نور — la lumière
  nur:    { s: 'M24 4 L24 15 M24 33 L24 44 M4 24 L15 24 M33 24 L44 24 M10 10 L17 17 M31 31 L38 38 M38 10 L31 17 M17 31 L10 38', f: 'M21 21h6v6h-6z' },
  // القلب — le miroir
  mirror: { s: 'M42 24 A18 18 0 1 1 6 24 A18 18 0 1 1 42 24 M24 2 L24 8 M24 40 L24 46 M2 24 L8 24 M40 24 L46 24', f: 'M30 15h3v3h-3z' },
  // حسد — la flamme
  flame:  { s: 'M24 3 L33 15 L30 21 L37 27 L35 42 L13 42 L11 31 L18 22 L19 30 L25 25 L22 15 Z' },
  // شوف — l'œil
  eye:    { s: 'M3 24 L15 13 L33 13 L45 24 L33 35 L15 35 Z', f: 'M21 21h6v6h-6z' },
  // رواية / مصدر — le livre
  book:   { s: 'M24 10 L24 42 M24 10 L6 6 L6 38 L24 42 L42 38 L42 6 Z' },
};

// dessine une icône centrée en (x,y), taille en px ; p = progression du tracé (0..1)
function drawIcon(c, name, x, y, size, color, lw = 3, p = 1) {
  const ic = ICONS[name]; if (!ic) return;
  const k = size / 48;
  c.save();
  c.translate(x - size / 2, y - size / 2); c.scale(k, k);
  c.strokeStyle = color; c.fillStyle = color;
  c.lineWidth = lw; c.lineCap = 'square'; c.lineJoin = 'miter';
  if (ic.s) {
    const P = new Path2D(ic.s), L = 320;
    if (p < 1) { c.setLineDash([L, L]); c.lineDashOffset = L * (1 - p); }
    c.stroke(P); c.setLineDash([]);
  }
  if (ic.f && p > .6) { c.globalAlpha *= Math.min(1, (p - .6) / .4); c.fill(new Path2D(ic.f)); }
  c.restore();
}
