// BeBail — film motion design 9:16, 58 s, 30 i/s, 120 BPM (116 temps).
// draw(t) est une fonction pure du temps : n'importe quelle image se rend seule.
// Zone sûre Reels : contenu important entre y≈250 et y≈1560.

const W = 1080, H = 1920, CX = W / 2;
const BPM = 120, B = 60 / BPM, DUR = 58, FPS = 30;
window.CONFIG = { W, H, FPS, DUR };

const C = {
  bg: '#06100C', surf: '#0D1914', surf2: '#122219', line: 'rgba(214,255,232,0.10)',
  text: '#EEF3EF', muted: '#8A9A92', mint: '#3EE89A', mint2: '#1FC7A0', mintSoft: '#A6F5CD',
  amber: '#FF8A4C', paper: '#F4F7F4', inkP: '#0B1712', inkMuted: '#6B7A72',
};

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const LYR = mk();

// ─── maths ────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: t => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  spring: t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.exp(-6 * t) * Math.cos(9 * t),
};
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ─── typographie ──────────────────────────────────────────────────────────
const STY = {
  w: s => ({ font: `700 ${s}px Geist`, col: C.text, ls: -.035 * s }),
  m: s => ({ font: `700 ${s}px Geist`, col: C.muted, ls: -.035 * s }),
  g: s => ({ font: `700 ${s}px Geist`, col: C.mint, ls: -.035 * s }),
  s: s => ({ font: `italic ${s * 1.2}px Serif`, col: C.mint, ls: -.01 * s }),
  a: s => ({ font: `italic ${s * 1.2}px Serif`, col: C.amber, ls: -.01 * s }),
};
function segWidths(c, segs, size) {
  return segs.map(([txt, st]) => { const s = STY[st](size); c.font = s.font; c.letterSpacing = s.ls + 'px'; return c.measureText(txt).width; });
}
function drawSegs(c, segs, x, y, size, align = 'left') {
  const ws = segWidths(c, segs, size), tot = ws.reduce((a, b) => a + b, 0);
  let xx = align === 'center' ? x - tot / 2 : x;
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  segs.forEach(([txt, st], i) => { const s = STY[st](size); c.font = s.font; c.letterSpacing = s.ls + 'px'; c.fillStyle = s.col; c.fillText(txt, xx, y); xx += ws[i]; });
  c.letterSpacing = '0px';
  return tot;
}
// titre ligne par ligne, chaque ligne sort d'un masque
function title(c, lines, x, y, size, lh, lb, t0, align = 'left', stagger = .22) {
  lines.forEach((segs, i) => {
    const p = E.outExpo(prog(lb, t0 + i * stagger, t0 + i * stagger + 1.4));
    if (p <= 0) return;
    const yy = y + i * lh;
    c.save();
    c.beginPath(); c.rect(0, yy - size * 1.15, W, size * 1.5); c.clip();
    drawSegs(c, segs, x, yy + (1 - p) * size * 1.3, size, align);
    c.restore();
  });
}
function label(c, text, x, y, lb, t0, align = 'left', col = C.mint) {
  const p = prog(lb, t0, t0 + .9);
  if (p <= 0) return;
  const n = Math.ceil(p * text.length);
  c.font = '500 26px Mono'; c.letterSpacing = '7px'; c.textBaseline = 'alphabetic';
  const full = c.measureText(text).width;
  const x0 = align === 'center' ? x - full / 2 : x;
  c.textAlign = 'left'; c.fillStyle = col;
  c.fillText(text.slice(0, n), x0, y);
  if (p < 1) { const w = c.measureText(text.slice(0, n)).width; c.fillRect(x0 + w + 2, y - 22, 14, 26); }
  c.letterSpacing = '0px';
}
function txt(c, s, x, y, font, col, align = 'left', ls = 0) {
  c.font = font; c.fillStyle = col; c.textAlign = align; c.textBaseline = 'alphabetic'; c.letterSpacing = ls + 'px';
  c.fillText(s, x, y); c.letterSpacing = '0px';
}

// ─── primitives UI ────────────────────────────────────────────────────────
function card(c, x, y, w, h, r, { fill = C.surf, stroke = C.line, glow = 0, lw = 2 } = {}) {
  if (glow > 0) { c.save(); c.shadowColor = `rgba(62,232,154,${.35 * glow})`; c.shadowBlur = 70 * glow; c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.restore(); }
  c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.beginPath(); c.roundRect(x + lw / 2, y + lw / 2, w - lw, h - lw, r); c.stroke(); }
}
function pill(c, x, y, text, { font = '600 26px Geist', fill = C.surf2, col = C.text, stroke = C.line, padX = 26, h = 60, align = 'left' } = {}) {
  c.font = font; c.letterSpacing = '0px';
  const w = c.measureText(text).width + padX * 2, x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  card(c, x0, y - h / 2, w, h, h / 2, { fill, stroke });
  c.fillStyle = col; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(text, x0 + padX, y + 2);
  c.textBaseline = 'alphabetic';
  return w;
}
function strokeP(c, path, len, p) { if (p <= 0) return; c.setLineDash([len * p, len + 10]); c.stroke(path); c.setLineDash([]); }

// icônes au trait (centrées en x,y, taille s)
function icDashed(c, x, y, r, rot, col) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = 3.5; c.setLineDash([r * .42, r * .36]);
  c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.restore();
}
function icCheck(c, x, y, r, p, col = C.mint, fillBg = false) {
  c.save(); c.strokeStyle = col; c.lineWidth = 3.5; c.lineCap = 'round'; c.lineJoin = 'round';
  if (fillBg) { c.fillStyle = 'rgba(62,232,154,0.14)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  const pc = new Path2D(); pc.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU); strokeP(c, pc, TAU * r, E.outCubic(prog(p, 0, .6)));
  const pk = new Path2D(); pk.moveTo(x - r * .42, y + r * .02); pk.lineTo(x - r * .1, y + r * .34); pk.lineTo(x + r * .45, y - r * .3);
  strokeP(c, pk, r * 1.35, E.outCubic(prog(p, .35, 1)));
  c.restore();
}
function icDoc(c, x, y, s, col, p = 1) {
  const w = s * .72, h = s, f = s * .26;
  const path = new Path2D();
  path.moveTo(x - w / 2, y - h / 2); path.lineTo(x + w / 2 - f, y - h / 2); path.lineTo(x + w / 2, y - h / 2 + f); path.lineTo(x + w / 2, y + h / 2); path.lineTo(x - w / 2, y + h / 2); path.closePath();
  path.moveTo(x + w / 2 - f, y - h / 2); path.lineTo(x + w / 2 - f, y - h / 2 + f); path.lineTo(x + w / 2, y - h / 2 + f);
  path.moveTo(x - w * .25, y); path.lineTo(x + w * .25, y); path.moveTo(x - w * .25, y + h * .2); path.lineTo(x + w * .12, y + h * .2);
  c.save(); c.strokeStyle = col; c.lineWidth = s * .07; c.lineJoin = 'round'; c.lineCap = 'round'; strokeP(c, path, s * 5, p); c.restore();
}
function icLock(c, x, y, s, col) {
  c.save(); c.strokeStyle = col; c.lineWidth = s * .08; c.lineCap = 'round';
  c.beginPath(); c.roundRect(x - s * .38, y - s * .08, s * .76, s * .56, s * .1); c.stroke();
  c.beginPath(); c.arc(x, y - s * .1, s * .24, Math.PI, 0); c.lineTo(x + s * .24, y - s * .08); c.moveTo(x - s * .24, y - s * .1); c.lineTo(x - s * .24, y - s * .08); c.stroke();
  c.beginPath(); c.moveTo(x, y + s * .12); c.lineTo(x, y + s * .26); c.stroke();
  c.restore();
}
function shieldPath(x, y, s) {
  const p = new Path2D();
  p.moveTo(x, y - s * .5);
  p.bezierCurveTo(x + s * .22, y - s * .36, x + s * .36, y - s * .36, x + s * .42, y - s * .36);
  p.bezierCurveTo(x + s * .44, y + s * .05, x + s * .3, y + s * .34, x, y + s * .5);
  p.bezierCurveTo(x - s * .3, y + s * .34, x - s * .44, y + s * .05, x - s * .42, y - s * .36);
  p.bezierCurveTo(x - s * .36, y - s * .36, x - s * .22, y - s * .36, x, y - s * .5);
  return p;
}
function icShield(c, x, y, s, col, p = 1) {
  c.save(); c.strokeStyle = col; c.lineWidth = s * .075; c.lineJoin = 'round'; c.lineCap = 'round';
  strokeP(c, shieldPath(x, y, s), s * 3.2, p);
  const k = new Path2D(); k.moveTo(x - s * .15, y); k.lineTo(x - s * .03, y + s * .12); k.lineTo(x + s * .17, y - s * .1);
  strokeP(c, k, s * .6, prog(p, .6, 1)); c.restore();
}
function icFolder(c, x, y, s, col) {
  c.save(); c.strokeStyle = col; c.lineWidth = s * .08; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(x - s * .45, y + s * .35); c.lineTo(x - s * .45, y - s * .35); c.lineTo(x - s * .12, y - s * .35); c.lineTo(x, y - s * .22); c.lineTo(x + s * .45, y - s * .22); c.lineTo(x + s * .45, y + s * .35); c.closePath(); c.stroke();
  c.restore();
}
function icClockDoc(c, x, y, s, col) {
  icDoc(c, x - s * .08, y, s * .9, col);
  c.save(); c.fillStyle = C.surf2; c.strokeStyle = col; c.lineWidth = s * .07;
  c.beginPath(); c.arc(x + s * .22, y + s * .24, s * .22, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(x + s * .22, y + s * .13); c.lineTo(x + s * .22, y + s * .25); c.lineTo(x + s * .31, y + s * .3); c.stroke();
  c.restore();
}
function icBuilding(c, x, y, s, col) {
  c.save(); c.strokeStyle = col; c.lineWidth = s * .08; c.lineJoin = 'round';
  c.beginPath(); c.roundRect(x - s * .36, y - s * .42, s * .5, s * .84, s * .06); c.stroke();
  c.beginPath(); c.moveTo(x + s * .14, y - s * .1); c.lineTo(x + s * .4, y - s * .1); c.lineTo(x + s * .4, y + s * .42); c.stroke();
  c.fillStyle = col;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) c.fillRect(x - s * .24 + k * s * .18, y - s * .28 + r * s * .2, s * .08, s * .08);
  c.restore();
}
function icEuro(c, x, y, s, col) { txt(c, '€', x, y + s * .3, `700 ${s * .8}px Geist`, col, 'center'); }
function icPlane(c, x, y, s, col, rot = 0) {
  c.save(); c.translate(x, y); c.rotate(rot); c.strokeStyle = col; c.lineWidth = s * .08; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-s * .45, -s * .05); c.lineTo(s * .45, -s * .4); c.lineTo(s * .1, s * .45); c.lineTo(-s * .05, s * .05); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(-s * .05, s * .05); c.lineTo(s * .45, -s * .4); c.stroke();
  c.restore();
}
function icBell(c, x, y, s, col) {
  c.save(); c.strokeStyle = col; c.lineWidth = s * .08; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath(); c.moveTo(x - s * .34, y + s * .22); c.quadraticCurveTo(x - s * .26, y + s * .08, x - s * .26, y - s * .08);
  c.arc(x, y - s * .08, s * .26, Math.PI, 0); c.quadraticCurveTo(x + s * .26, y + s * .08, x + s * .34, y + s * .22); c.closePath(); c.stroke();
  c.beginPath(); c.moveTo(x - s * .08, y + s * .34); c.lineTo(x + s * .08, y + s * .34); c.stroke();
  c.restore();
}
function cursor(c, x, y, press = 0) {
  c.save(); c.translate(x, y); const s = 1 - press * .15; c.scale(s, s);
  c.shadowColor = 'rgba(0,0,0,0.45)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
  c.fillStyle = '#fff'; c.strokeStyle = C.bg; c.lineWidth = 3; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(0, 0); c.lineTo(0, 52); c.lineTo(13, 40); c.lineTo(23, 62); c.lineTo(32, 58); c.lineTo(22, 37); c.lineTo(39, 37); c.closePath();
  c.fill(); c.shadowColor = 'transparent'; c.stroke(); c.restore();
}
function ripple(c, x, y, p, col = C.mint, r0 = 10, r1 = 90) {
  if (p <= 0 || p >= 1) return;
  c.save(); c.strokeStyle = col; c.globalAlpha = 1 - p; c.lineWidth = 4 * (1 - p);
  c.beginPath(); c.arc(x, y, lerp(r0, r1, E.outCubic(p)), 0, TAU); c.stroke(); c.restore();
}

// ─── le signe BeBail : un « b » dont la panse est une porte ───────────────
function markPaths(x, y, s) {
  const u = s / 100, stem = new Path2D(), bowl = new Path2D();
  stem.moveTo(x + (34 - 50) * u, y + (20 - 50) * u); stem.lineTo(x + (34 - 50) * u, y + (78 - 50) * u);
  bowl.moveTo(x + (34 - 50) * u, y + (78 - 50) * u); bowl.lineTo(x + (66 - 50) * u, y + (78 - 50) * u); bowl.lineTo(x + (66 - 50) * u, y + (58 - 50) * u);
  bowl.arc(x, y + (58 - 50) * u, 16 * u, 0, Math.PI, true); bowl.lineTo(x + (34 - 50) * u, y + (78 - 50) * u);
  return { stem, bowl, u };
}
function mark(c, x, y, s, { tile = 1, draw = 1, rot = 0, dot = 1, glow = 0 } = {}) {
  c.save(); c.translate(x, y); c.rotate(rot); c.translate(-x, -y);
  if (glow > 0) {
    const g = c.createRadialGradient(x, y, 0, x, y, s * 1.6);
    g.addColorStop(0, `rgba(62,232,154,${.35 * glow})`); g.addColorStop(1, 'rgba(62,232,154,0)');
    c.fillStyle = g; c.fillRect(x - s * 2, y - s * 2, s * 4, s * 4);
  }
  const ts = s * tile, r = Math.min(ts / 2, s * .3);
  const g = c.createLinearGradient(x - ts / 2, y - ts / 2, x + ts / 2, y + ts / 2);
  g.addColorStop(0, C.mint); g.addColorStop(1, C.mint2);
  c.fillStyle = g; c.beginPath(); c.roundRect(x - ts / 2, y - ts / 2, ts, ts, r); c.fill();
  if (draw > 0) {
    const { stem, bowl, u } = markPaths(x, y, s);
    c.strokeStyle = C.bg; c.lineWidth = 12 * u; c.lineCap = 'round'; c.lineJoin = 'round';
    strokeP(c, stem, 58 * u, E.outCubic(prog(draw, 0, .45)));
    strokeP(c, bowl, 140 * u, E.inOutCubic(prog(draw, .3, 1)));
    if (dot > 0) { c.fillStyle = C.bg; c.beginPath(); c.arc(x, y + 14 * u, 4.5 * u * E.outBack(dot), 0, TAU); c.fill(); }
  }
  c.restore();
}
function wordmark(c, x, y, size, lb, t0, align = 'center') {
  const s = STY.w(size), parts = 'bebail'.split('');
  c.font = s.font; c.letterSpacing = s.ls + 'px';
  const tot = c.measureText('bebail').width + size * .22;
  let xx = align === 'center' ? x - tot / 2 : x;
  c.save(); c.beginPath(); c.rect(0, y - size * 1.05, W, size * 1.35); c.clip();
  c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  parts.forEach((ch, i) => {
    const p = E.outExpo(prog(lb, t0 + i * .06, t0 + i * .06 + 1.2));
    c.font = s.font; c.letterSpacing = s.ls + 'px'; c.fillStyle = C.text;
    const pre = c.measureText('bebail'.slice(0, i)).width;
    c.fillText(ch, xx + pre, y + (1 - p) * size * 1.2);
  });
  const pd = E.spring(prog(lb, t0 + .6, t0 + 1.6));
  c.fillStyle = C.mint; c.beginPath();
  c.arc(xx + c.measureText('bebail').width + size * .12, y - size * .08, size * .085 * pd, 0, TAU); c.fill();
  c.restore(); c.letterSpacing = '0px';
}

// ─── fond : encre + aurores ───────────────────────────────────────────────
let GRAIN = [];
function background(t) {
  const b = t / B;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  const chaos = prog(b, 10, 14) * (1 - prog(b, 23, 26));
  const orbs = [
    [300 + Math.sin(t * .35) * 180, 380 + Math.cos(t * .27) * 140, 820, [62, 232, 154], .20 * (1 - chaos * .8)],
    [820 + Math.cos(t * .3) * 160, 1500 + Math.sin(t * .22) * 180, 900, [31, 199, 160], .16 * (1 - chaos * .6)],
    [540 + Math.sin(t * .5) * 260, 1000 + Math.cos(t * .4) * 300, 760, [255, 138, 76], .20 * chaos],
    [CX, 820, 700, [62, 232, 154], .25 * prog(b, 26, 27) * (1 - prog(b, 33, 34.5)) + .22 * prog(b, 102, 104)],
  ];
  const kick = b >= 34 && b < 102 ? 1 + .45 * Math.exp(-(b % 1) * 5) : 1;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, r, [R, G, Bl], a0] of orbs) {
    const a = a0 * kick;
    if (a <= 0) continue;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${R},${G},${Bl},${a})`); g.addColorStop(1, `rgba(${R},${G},${Bl},0)`);
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(214,255,232,0.045)';
  const off = (t * 6) % 54;
  for (let y = -54; y < H + 54; y += 54) for (let x = 0; x < W + 54; x += 54) ctx.fillRect(x - 1.5, y + off - 1.5, 3, 3);
}

// ─── S1 · le constat (temps 0–10) ─────────────────────────────────────────
function s1(c, lb) {
  label(c, 'LE CONSTAT', 90, 560, lb, .2);
  const lines = [[['Gérer son', 'w']], [['immobilier', 'w']], [['ne devrait pas', 'w']], [['être un', 'm']], [['second métier.', 'a']]];
  title(c, lines, 90, 720, 112, 128, lb, .6, 'left', .32);
  // soulignement manuscrit
  const p = E.inOutCubic(prog(lb, 3.2, 4.2));
  if (p > 0) {
    const path = new Path2D(), y0 = 720 + 4 * 128 + 34;
    path.moveTo(96, y0);
    for (let x = 96; x <= 820; x += 12) path.lineTo(x, y0 + Math.sin(x * .035) * 7 - (x - 96) * .02);
    c.strokeStyle = C.amber; c.lineWidth = 7; c.lineCap = 'round'; strokeP(c, path, 800, p);
  }
}

// ─── S2 · la dispersion (temps 10–26) ─────────────────────────────────────
const CHAOS = [
  ['Excel partout, données dispersées', -40, 540, -4],
  ['Quittances rédigées à la main', 60, 720, 3],
  ['Airbnb, Booking et baux séparés', -60, 900, -2],
  ['Comptabilité LMNP qui s’accumule', 50, 1080, 4],
  ['Factures éparpillées dans les emails', -30, 1260, -3],
  ['Zéro visibilité sur la rentabilité', 60, 1440, 2],
];
const CHIPS = ['.xlsx', 'RE: loyer', '.pdf', 'Drive', '@', 'Relance', 'Booking', '.docx', 'Facture', 'Airbnb', '.csv', 'Diagnostic', 'Excel', 'Impayé ?', 'Mail', 'Scan'];
let CHIPD = [];
function s2(c, lb) {
  const suck = E.inExpo(prog(lb, 12.2, 14.8));
  const SX = CX, SY = 820;
  const jit = prog(lb, 5, 8) * 4;
  // étiquettes flottantes
  c.font = '500 24px Mono';
  CHIPD.forEach((d, i) => {
    const a = E.spring(prog(lb, d.t0, d.t0 + 1.2));
    if (a <= 0) return;
    let x = d.x + Math.sin(lb * d.sp + d.ph) * 40, y = d.y + Math.cos(lb * d.sp * .8 + d.ph) * 30 - lb * 6;
    x = lerp(x, SX, suck); y = lerp(y, SY, suck);
    c.save(); c.translate(x, y); c.rotate(d.rot + suck * 3); c.scale(a * (1 - suck), a * (1 - suck)); c.globalAlpha = .75;
    pill(c, 0, 0, CHIPS[i], { font: '500 24px Mono', fill: 'rgba(18,34,25,0.9)', col: i % 3 ? C.muted : C.amber, stroke: 'rgba(255,138,76,0.28)', h: 52, padX: 20, align: 'center' });
    c.restore();
  });
  // cartes
  CHAOS.forEach(([text, dx, y0, rot], i) => {
    const p = E.spring(prog(lb, .4 + i * 1.05, 1.6 + i * 1.05));
    if (p <= 0) return;
    const w = 820, h = 124;
    let x = CX + dx + Math.sin(lb * 9 + i * 3) * jit, y = y0 + Math.sin(lb * 1.6 + i) * 6 + (1 - p) * 60 + Math.cos(lb * 11 + i) * jit;
    x = lerp(x, SX, suck); y = lerp(y, SY, suck);
    c.save(); c.translate(x, y);
    c.rotate((rot + Math.sin(lb * 1.1 + i * 2) * .6) * Math.PI / 180 + suck * (i % 2 ? 2 : -2));
    const sc = lerp(.7, 1, p) * (1 - suck); c.scale(sc, sc); c.globalAlpha = clamp(p * 1.5);
    card(c, -w / 2, -h / 2, w, h, 30, { fill: 'rgba(13,25,20,0.96)', stroke: 'rgba(255,138,76,0.22)' });
    icDashed(c, -w / 2 + 62, 0, 20, lb * .8 + i, C.amber);
    txt(c, text, -w / 2 + 110, 11, '500 34px Geist', C.text);
    if (i === 4) {
      const n = Math.floor(lerp(3, 99, E.inCubic(prog(lb, 5.5, 9))));
      const s = n >= 99 ? '99+' : String(n);
      pill(c, w / 2 - 10, -h / 2 + 4, s, { font: '700 26px Geist', fill: C.amber, col: C.bg, stroke: null, h: 48, padX: 16, align: 'center' });
    }
    c.restore();
  });
  // voile + mots
  const env = prog(lb, 7.8, 8.3) * (1 - prog(lb, 11.8, 12.3));
  if (env > 0) {
    c.fillStyle = `rgba(6,16,12,${.8 * env})`; c.fillRect(0, 0, W, H);
    const words = [['Trop d’outils.', 8.1], ['Trop d’onglets.', 9.4], ['Trop de temps.', 10.7]];
    words.forEach(([w, t0], k) => {
      const pin = E.outExpo(prog(lb, t0, t0 + .7)), pout = k < 2 ? E.inCubic(prog(lb, t0 + 1.1, t0 + 1.3)) : E.inCubic(prog(lb, 11.8, 12.2));
      if (pin <= 0 || pout >= 1) return;
      c.save(); c.globalAlpha = pin * (1 - pout);
      const s = lerp(1.25, 1, pin) + pout * .15; c.translate(CX, 900); c.scale(s, s);
      const [a, rest] = [w.split(' ')[0], w.slice(w.indexOf(' '))];
      drawSegs(c, [[a, 'w'], [rest, 'a']], 0, 0, 120, 'center');
      c.restore();
    });
  }
  // le point
  const dp = prog(lb, 14.2, 14.8);
  if (dp > 0) {
    const col = lb < 15 ? C.amber : C.mint;
    const pulse = 1 + .25 * Math.exp(-Math.max(0, lb - 15) * 6) * (lb > 15 ? 1 : 0);
    c.fillStyle = col; c.beginPath(); c.arc(SX, SY, 14 * E.outBack(dp) * pulse, 0, TAU); c.fill();
    ripple(c, SX, SY, prog(lb, 15, 15.9), C.mint, 14, 120);
  }
  label(c, 'AVANT', 90, 330, lb, .1, 'left', C.amber);
}

// ─── S3 · révélation (temps 26–34) ────────────────────────────────────────
function s3(c, lb) {
  const y = 780, S = 250;
  const p = E.spring(prog(lb, 0, 1.3));
  const tile = lerp(28 / S, 1, p);
  mark(c, CX, y, S, { tile, draw: prog(lb, .5, 1.6), dot: prog(lb, 1.4, 1.9), rot: lerp(-.5, 0, E.outExpo(prog(lb, 0, 1.2))), glow: prog(lb, .3, 1.5) * (1 + .15 * Math.sin(lb * 3)) });
  ripple(c, CX, y, prog(lb, .9, 2.2), C.mint, 140, 420);
  label(c, 'GESTION LOCATIVE · TOUT-EN-UN', CX, 480, lb, 2.4, 'center');
  wordmark(c, CX, 1110, 170, lb, 1.3);
  title(c, [[['La gestion locative,', 'm']], [['enfin sereine.', 's']]], CX, 1250, 64, 86, lb, 2.2, 'center', .25);
}

// ─── S4 · cockpit propriétaire (temps 34–50) ──────────────────────────────
function s4(c, lb) {
  label(c, 'COCKPIT PROPRIÉTAIRE', 70, 300, lb, 0);
  title(c, [[['Tous vos biens.', 'w']], [['Un seul écran.', 's']]], 70, 420, 92, 104, lb, .2);
  const pin = E.spring(prog(lb, 1, 2.3));
  if (pin <= 0) return;
  const px = 70, pw = 940, ph = 930;
  const py = 640 + (1 - pin) * 300 + Math.sin(lb * .9) * 6;
  c.save(); c.globalAlpha = clamp(pin * 1.4);
  card(c, px, py, pw, ph, 44, { fill: 'rgba(13,25,20,0.97)', glow: .8 });
  // en-tête
  mark(c, px + 62, py + 64, 48);
  txt(c, 'Vue d’ensemble', px + 104, py + 76, '600 32px Geist', C.text);
  txt(c, 'OCT. 2026', px + pw - 40, py + 74, '500 22px Mono', C.muted, 'right', 3);
  // KPI
  const kw = (pw - 90) / 2, ky = py + 124;
  const k1 = E.outExpo(prog(lb, 1.6, 2.6)), k2 = E.outExpo(prog(lb, 1.9, 2.9));
  const bump = E.outExpo(prog(lb, 6.5, 7.4));
  [[px + 30, k1], [px + 60 + kw, k2]].forEach(([x, k], i) => {
    if (k <= 0) return;
    c.save(); c.globalAlpha *= k; c.translate(0, (1 - k) * 30);
    card(c, x, ky, kw, 200, 30, { fill: C.surf2 });
    if (i === 0) {
      txt(c, 'Loyers encaissés', x + 36, ky + 52, '500 24px Geist', C.muted);
      const v = lerp(0, 12480, E.outExpo(prog(lb, 1.8, 3.4))) + 1150 * bump;
      txt(c, fmt(v) + ' €', x + 36, ky + 130, '700 64px Geist', C.text, 'left', -2);
      txt(c, '+8,2 % vs sept.', x + 36, ky + 174, '600 22px Geist', C.mint);
    } else {
      txt(c, 'Taux d’occupation', x + 36, ky + 52, '500 24px Geist', C.muted);
      const occ = lerp(0, 92, E.outExpo(prog(lb, 2, 3.4))) + 8 * bump;
      txt(c, Math.round(occ) + ' %', x + 36, ky + 130, '700 64px Geist', C.text, 'left', -2);
      txt(c, (bump > .5 ? 12 : 11) + ' / 12 lots loués', x + 36, ky + 174, '500 22px Geist', C.muted);
      const rx = x + kw - 88, ry = ky + 100;
      c.lineWidth = 14; c.lineCap = 'round';
      c.strokeStyle = 'rgba(214,255,232,0.1)'; c.beginPath(); c.arc(rx, ry, 52, 0, TAU); c.stroke();
      c.strokeStyle = C.mint; c.beginPath(); c.arc(rx, ry, 52, -Math.PI / 2, -Math.PI / 2 + TAU * occ / 100); c.stroke();
    }
    c.restore();
  });
  // graphique
  const cy = py + 350, ch = 270, cp = E.outExpo(prog(lb, 2.2, 3.2));
  if (cp > 0) {
    c.save(); c.globalAlpha *= cp;
    card(c, px + 30, cy, pw - 60, ch, 30, { fill: C.surf2 });
    txt(c, 'Revenus 2026', px + 66, cy + 52, '500 24px Geist', C.muted);
    txt(c, 'MENSUEL', px + pw - 66, cy + 50, '500 20px Mono', C.muted, 'right', 3);
    const vals = [.42, .5, .47, .58, .62, .6, .7, .74, .69, .8, .86, .96], months = 'JFMAMJJASOND';
    const bx0 = px + 70, bw = 46, gap = (pw - 140 - bw * 12) / 11;
    vals.forEach((v, i) => {
      const g = E.spring(prog(lb, 2.4 + i * .07, 3.4 + i * .07));
      const h = 150 * v * g, x = bx0 + i * (bw + gap), yb = cy + ch - 56;
      const gr = c.createLinearGradient(0, yb - 150, 0, yb);
      gr.addColorStop(0, i === 9 ? C.mintSoft : C.mint); gr.addColorStop(1, 'rgba(62,232,154,0.15)');
      c.fillStyle = i === 9 ? gr : 'rgba(62,232,154,0.55)';
      if (i === 9) c.fillStyle = gr;
      if (h > 1) { c.beginPath(); c.roundRect(x, yb - h, bw, h, 10); c.fill(); }
      txt(c, months[i], x + bw / 2, yb + 36, '500 20px Mono', C.muted, 'center');
    });
    c.restore();
  }
  // liste des biens
  const rows = [['Appartement · Lyon 6e', 'Bail meublé', 0], ['Studio · Bordeaux', 'Bail mobilité', 0], ['T3 · Nantes', 'Colocation', 1]];
  rows.forEach(([n, sub, pending], i) => {
    const r = E.spring(prog(lb, 3 + i * .25, 4.2 + i * .25));
    if (r <= 0) return;
    const ry = py + 650 + i * 94;
    c.save(); c.globalAlpha *= clamp(r * 1.3); c.translate((1 - r) * 80, 0);
    card(c, px + 30, ry, pw - 60, 82, 24, { fill: C.surf2, stroke: null });
    icBuilding(c, px + 80, ry + 41, 38, C.mint);
    txt(c, n, px + 124, ry + 38, '600 27px Geist', C.text);
    txt(c, sub, px + 124, ry + 66, '500 19px Mono', C.muted, 'left', 1);
    const paid = !pending || lb > 6.6;
    const flip = pending ? E.spring(prog(lb, 6.6, 7.4)) : 1;
    c.save(); c.translate(px + pw - 60, ry + 41);
    if (pending) c.scale(paid ? lerp(.6, 1, flip) : 1, paid ? lerp(.6, 1, flip) : 1);
    pill(c, 0, 0, paid ? 'Payé' : 'En attente', { font: '600 22px Geist', fill: paid ? 'rgba(62,232,154,0.16)' : 'rgba(255,138,76,0.16)', col: paid ? C.mint : C.amber, stroke: null, h: 44, padX: 18, align: 'right' });
    c.restore();
    if (pending) ripple(c, px + pw - 110, ry + 41, prog(lb, 6.6, 7.6), C.mint, 20, 120);
    c.restore();
  });
  // notification
  const tn = E.spring(prog(lb, 6.2, 7)) * (1 - E.inCubic(prog(lb, 9.5, 10.2)));
  if (tn > 0) {
    c.save(); c.globalAlpha *= clamp(tn * 1.3);
    const tw = 760, tx = px + (pw - tw) / 2, ty = py - 60 + tn * 80;
    card(c, tx, ty, tw, 96, 48, { fill: '#163324', stroke: 'rgba(62,232,154,0.45)', glow: .6 });
    c.fillStyle = C.mint; c.beginPath(); c.arc(tx + 50, ty + 48, 26, 0, TAU); c.fill();
    icBell(c, tx + 50, ty + 48, 30, C.bg);
    txt(c, 'Loyer reçu · T3 Nantes', tx + 96, ty + 44, '600 26px Geist', C.text);
    txt(c, '+1 150 € · il y a 2 s', tx + 96, ty + 74, '500 20px Mono', C.mintSoft);
    c.restore();
  }
  c.restore();
}

// ─── S5 · contrats & signature (temps 50–66) ──────────────────────────────
function sigPath(x0, y0, p) {
  const path = new Path2D(), n = Math.floor(260 * p);
  for (let k = 0; k <= n; k++) {
    const t = k / 260, a = t * TAU * 6.5;
    const amp = 26 * (1 - Math.abs(t - .35) * .9) * (t < .12 ? t / .12 : 1);
    const x = x0 + t * 440 - 18 * Math.sin(a), y = y0 - amp * Math.cos(a) * (1 + .4 * Math.sin(t * 9)) + t * 10;
    k ? path.lineTo(x, y) : path.moveTo(x, y);
  }
  if (p > .95) { path.moveTo(x0 - 10, y0 + 34); path.quadraticCurveTo(x0 + 250, y0 + 20 + 26 * (1 - prog(p, .95, 1)), x0 + 480 * prog(p, .95, 1), y0 + 30); }
  return path;
}
function s5(c, lb) {
  label(c, 'CONTRATS & SIGNATURE', 70, 300, lb, 0);
  title(c, [[['Des contrats conformes,', 'w']], [['prêts à signer.', 's']]], 70, 415, 78, 92, lb, .2);
  // types de bail
  const chips = [['Bail meublé', 'Bail nu', 'Bail mobilité'], ['LMNP', 'SCI', 'Colocation']];
  const dim = 1 - .55 * E.outCubic(prog(lb, 3.8, 4.6));
  let target = null;
  chips.forEach((row, ri) => {
    c.font = '600 27px Geist';
    const ws = row.map(s => c.measureText(s).width + 52 + 44), gap = 16;
    const tot = ws.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
    let x = CX - tot / 2;
    row.forEach((s, k) => {
      const i = ri * 3 + k, p = E.spring(prog(lb, 1 + i * .12, 2 + i * .12));
      const yy = 590 + ri * 86, sel = ri === 0 && k === 0 && lb > 3;
      if (sel) target = [x + ws[k] / 2, yy];
      if (p > 0) {
        c.save(); c.globalAlpha = clamp(p * 1.4) * (sel ? 1 : dim); c.translate(x + ws[k] / 2, yy); const sp = sel ? 1 - .08 * Math.exp(-(lb - 3) * 10) : 1; c.scale(p * sp, p * sp);
        card(c, -ws[k] / 2, -34, ws[k], 68, 34, { fill: sel ? C.mint : C.surf, stroke: sel ? null : C.line });
        icDoc(c, -ws[k] / 2 + 42, 0, 30, sel ? C.bg : C.mint);
        txt(c, s, -ws[k] / 2 + 70, 10, '600 27px Geist', sel ? C.bg : C.text);
        c.restore();
      }
      x += ws[k] + gap;
    });
  });
  // curseur
  const cm = prog(lb, 2.1, 3), cOut = prog(lb, 3.4, 4.2);
  if (cm > 0 && cOut < 1) {
    const tx = 250, ty = 600, e = E.inOutCubic(cm);
    const x = lerp(860, tx, e) + E.inCubic(cOut) * 700, y = lerp(1400, ty, e) + E.inCubic(cOut) * 400;
    ripple(c, tx, ty - 5, prog(lb, 3, 3.7), C.mint, 10, 80);
    cursor(c, x, y, Math.exp(-Math.abs(lb - 3) * 12));
  }
  // document
  const dp = E.spring(prog(lb, 3.9, 5.1));
  if (dp <= 0) return;
  const dx = 100, dw = 880, dh = 780, dy = 790 + (1 - dp) * 900;
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = 60; c.shadowOffsetY = 20;
  c.fillStyle = C.paper; c.beginPath(); c.roundRect(dx, dy, dw, dh, 30); c.fill();
  c.restore();
  txt(c, 'Contrat de location meublée', dx + 50, dy + 82, '700 38px Geist', C.inkP, 'left', -1);
  txt(c, 'RÉF. BB-2026-0142 · CONFORME LOI ALUR', dx + 50, dy + 122, '500 19px Mono', C.inkMuted, 'left', 2);
  c.fillStyle = 'rgba(11,23,18,0.1)'; c.fillRect(dx + 50, dy + 150, dw - 100, 2);
  const fields = [['BAILLEUR', 'SCI Les Tilleuls'], ['LOCATAIRE', 'Camille Martin'], ['ADRESSE DU BIEN', '12 rue des Lilas, Lyon 6e'], ['LOYER MENSUEL', '890 € charges comprises']];
  fields.forEach(([l, v], k) => {
    const fy = dy + 205 + k * 92, t0 = 5 + k * .75, p = prog(lb, t0, t0 + .7);
    txt(c, l, dx + 50, fy, '500 18px Mono', C.inkMuted, 'left', 2);
    c.fillStyle = 'rgba(11,23,18,0.12)'; c.fillRect(dx + 50, fy + 50, dw - 100, 2);
    if (p > 0) {
      const n = Math.ceil(p * v.length);
      c.fillStyle = C.mint2; c.fillRect(dx + 50, fy + 50, (dw - 100) * E.outCubic(p), 3);
      txt(c, v.slice(0, n), dx + 50, fy + 40, '600 30px Geist', C.inkP);
      if (p < 1) { c.font = '600 30px Geist'; c.fillStyle = C.mint2; c.fillRect(dx + 52 + c.measureText(v.slice(0, n)).width, fy + 12, 3, 34); }
    }
  });
  // texte fantôme
  c.fillStyle = 'rgba(11,23,18,0.08)';
  [[570, .9], [598, .75]].forEach(([oy, w]) => { c.beginPath(); c.roundRect(dx + 50, dy + oy, (dw - 100) * w, 12, 6); c.fill(); });
  // signature
  const sy = dy + 630;
  txt(c, 'SIGNATURE DU LOCATAIRE', dx + 50, sy, '500 18px Mono', C.inkMuted, 'left', 2);
  c.save(); c.strokeStyle = 'rgba(11,23,18,0.25)'; c.lineWidth = 2; c.setLineDash([10, 8]);
  c.beginPath(); c.roundRect(dx + 50, sy + 18, dw - 100, 110, 18); c.stroke(); c.restore();
  const sp = E.inOutCubic(prog(lb, 8.2, 10));
  if (sp > 0) { c.strokeStyle = C.inkP; c.lineWidth = 4.5; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(sigPath(dx + 110, sy + 76, sp)); }
  // tampon
  const st = E.spring(prog(lb, 10.3, 11.1));
  if (st > 0) {
    const cx = dx + dw - 200, cy = dy + 600;
    ripple(c, cx, cy, prog(lb, 10.4, 11.4), C.mint2, 60, 300);
    c.save(); c.translate(cx, cy); c.rotate(-.12); const s = lerp(2, 1, clamp(st)) * (st > 1 ? st : 1); c.scale(s, s); c.globalAlpha = clamp(st * 1.5);
    card(c, -170, -58, 340, 116, 22, { fill: C.mint, stroke: null });
    icCheck(c, -112, 0, 30, 1, C.bg);
    txt(c, 'SIGNÉ', -66, 4, '700 40px Geist', C.bg, 'left', 1);
    txt(c, 'eIDAS · 14:32', -66, 36, '500 18px Mono', C.bg, 'left', 1);
    c.restore();
    // confettis
    const r = rng(5), cf = prog(lb, 10.3, 12.5);
    if (cf > 0 && cf < 1) for (let k = 0; k < 40; k++) {
      const a = r() * TAU, v = 300 + r() * 500, tt = cf * 1.2;
      const x = cx + Math.cos(a) * v * tt, y = cy + Math.sin(a) * v * tt + 700 * tt * tt;
      c.save(); c.translate(x, y); c.rotate(tt * 10 * (r() - .5)); c.globalAlpha = 1 - cf;
      c.fillStyle = k % 3 ? C.mint : C.mintSoft; c.fillRect(-7, -3, 14, 6); c.restore();
    }
  }
  const tn = E.spring(prog(lb, 11.4, 12.2));
  if (tn > 0) {
    c.save(); c.globalAlpha = clamp(tn * 1.4); c.translate(CX, dy - 50); c.scale(tn, tn);
    pill(c, 0, 0, 'Contrat signé en 3 minutes', { font: '600 28px Geist', fill: '#163324', col: C.mint, stroke: 'rgba(62,232,154,0.45)', h: 70, padX: 34, align: 'center' });
    c.restore();
  }
}

// ─── S6 · quittances automatiques (temps 66–82) ───────────────────────────
function s6(c, lb) {
  label(c, 'AUTOMATISATION', 70, 300, lb, 0);
  title(c, [[['Vos quittances,', 'w']], [['générées et envoyées', 's']], [['automatiquement.', 'w']]], 70, 410, 76, 90, lb, .2);
  const nx = 110, nw = 860, nh = 160, ys = [690, 940, 1190];
  const nodes = [
    ['Loyer reçu', 'VIREMENT C. MARTIN · +890 €', 'euro', 1.4],
    ['Quittance PDF générée', 'QUITTANCE-OCT-2026.PDF', 'doc', 3.1],
    ['Envoyée au locataire', 'PAR EMAIL · 09:02', 'plane', 4.8],
  ];
  const loop = lb >= 7 ? (lb - 7) % 1 : -1;
  // connecteurs
  for (let k = 0; k < 2; k++) {
    const x = nx + 80, y0 = ys[k] + nh, y1 = ys[k + 1];
    const a = prog(lb, nodes[k][3] + .2, nodes[k][3] + .6);
    if (a <= 0) continue;
    c.strokeStyle = 'rgba(214,255,232,0.15)'; c.lineWidth = 3; c.setLineDash([6, 8]);
    c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + (y1 - y0) * a); c.stroke(); c.setLineDash([]);
    const f = E.inOutCubic(prog(lb, nodes[k][3] + .6, nodes[k + 1][3]));
    c.strokeStyle = C.mint; c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + (y1 - y0) * f); c.stroke();
    const dots = [];
    if (f > 0 && f < 1) dots.push(f);
    if (loop >= 0) { const q = prog(loop, k * .4, k * .4 + .4); if (q > 0 && q < 1) dots.push(E.inOutCubic(q)); }
    dots.forEach(q => {
      const yy = y0 + (y1 - y0) * q;
      const g = c.createRadialGradient(x, yy, 0, x, yy, 30); g.addColorStop(0, 'rgba(166,245,205,0.9)'); g.addColorStop(1, 'rgba(62,232,154,0)');
      c.fillStyle = g; c.fillRect(x - 30, yy - 30, 60, 60);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x, yy, 6, 0, TAU); c.fill();
    });
  }
  nodes.forEach(([t, sub, ic, t0], k) => {
    const p = E.spring(prog(lb, t0, t0 + 1.1));
    if (p <= 0) return;
    const y = ys[k];
    const flash = loop >= 0 ? Math.exp(-Math.abs(loop - k * .4) * 12) : 0;
    c.save(); c.globalAlpha = clamp(p * 1.4); c.translate(nx + nw / 2, y + nh / 2); c.scale(lerp(.9, 1, p), lerp(.9, 1, p)); c.translate(-(nx + nw / 2), -(y + nh / 2));
    card(c, nx, y, nw, nh, 36, { fill: C.surf, stroke: `rgba(62,232,154,${.18 + .5 * flash})`, glow: flash });
    const ix = nx + 80, iy = y + nh / 2;
    c.fillStyle = 'rgba(62,232,154,0.14)'; c.beginPath(); c.arc(ix, iy, 46, 0, TAU); c.fill();
    if (ic === 'euro') icEuro(c, ix, iy, 52, C.mint);
    if (ic === 'doc') icDoc(c, ix, iy, 46, C.mint, E.outCubic(prog(lb, t0, t0 + 1)));
    if (ic === 'plane') {
      const fl = prog(lb, t0 + .6, t0 + 1.8);
      if (fl < 1) {
        const e = E.inCubic(fl);
        icPlane(c, ix + e * 900, iy - e * 380 - Math.sin(fl * Math.PI) * 40, 46, C.mint, -e * .4);
        if (fl > 0) { c.strokeStyle = 'rgba(62,232,154,0.4)'; c.lineWidth = 3; c.setLineDash([4, 10]); c.beginPath(); c.moveTo(ix, iy); c.quadraticCurveTo(ix + e * 450, iy - e * 100, ix + e * 900, iy - e * 380); c.stroke(); c.setLineDash([]); }
      }
      if (fl > .8) icPlane(c, ix, iy, 46 * E.outBack(prog(lb, t0 + 1.8, t0 + 2.4)), C.mint);
    }
    txt(c, t, nx + 160, y + 72, '600 34px Geist', C.text, 'left', -.5);
    txt(c, sub, nx + 160, y + 114, '500 20px Mono', C.muted, 'left', 2);
    if (k === 1) {
      const bp = E.inOutCubic(prog(lb, t0 + .3, t0 + 1.4));
      c.fillStyle = 'rgba(214,255,232,0.08)'; c.fillRect(nx + 160, y + 134, nw - 290, 5);
      c.fillStyle = C.mint; c.fillRect(nx + 160, y + 134, (nw - 290) * bp, 5);
    }
    icCheck(c, nx + nw - 70, iy, 26, prog(lb, t0 + (k === 2 ? 1.7 : 1.2), t0 + (k === 2 ? 2.4 : 1.9)), C.mint, true);
    c.restore();
  });
  // les mois qui défilent
  const mp = prog(lb, 6.2, 7);
  if (mp > 0) {
    const months = ['OCT', 'NOV', 'DÉC', 'JAN', 'FÉV', 'MARS', 'AVR', 'MAI', 'JUIN', 'JUIL', 'AOÛT', 'SEPT', 'OCT', 'NOV'];
    const off = Math.max(0, lb - 7) * 170;
    c.save(); c.globalAlpha = mp;
    c.beginPath(); c.rect(70, 1400, 940, 110); c.clip();
    months.forEach((m, i) => {
      const x = 110 + i * 170 - off;
      if (x < -200 || x > W) return;
      const done = x < 540;
      card(c, x, 1420, 150, 70, 35, { fill: done ? 'rgba(62,232,154,0.14)' : C.surf, stroke: done ? 'rgba(62,232,154,0.4)' : C.line });
      txt(c, m + (done ? ' ✓' : ''), x + 75, 1465, '600 24px Geist', done ? C.mint : C.muted, 'center');
    });
    c.restore();
    const g = c.createLinearGradient(70, 0, 1010, 0);
    g.addColorStop(0, C.bg); g.addColorStop(.12, 'rgba(6,16,12,0)'); g.addColorStop(.88, 'rgba(6,16,12,0)'); g.addColorStop(1, C.bg);
    c.fillStyle = g; c.globalAlpha = mp; c.fillRect(60, 1400, 960, 110); c.globalAlpha = 1;
    txt(c, 'TEMPS PASSÉ CE MOIS-CI : 0 MIN', CX, 1560, '500 24px Mono', C.mintSoft, 'center', 4);
    c.globalAlpha = 1;
  }
}

// ─── S7 · preuves juridiques (temps 82–94) ────────────────────────────────
function s7(c, lb) {
  label(c, 'PREUVES JURIDIQUES', 70, 300, lb, 0);
  title(c, [[['Signé, horodaté,', 'w']], [['opposable.', 's']]], 70, 415, 92, 104, lb, .2);
  const sx = CX, sy = 740, S = 240;
  const g = c.createRadialGradient(sx, sy, 0, sx, sy, 300);
  g.addColorStop(0, `rgba(62,232,154,${.28 * prog(lb, .8, 1.8) * (1 + .2 * Math.sin(lb * 4))})`); g.addColorStop(1, 'rgba(62,232,154,0)');
  c.fillStyle = g; c.fillRect(sx - 300, sy - 300, 600, 600);
  c.save(); c.strokeStyle = 'rgba(62,232,154,0.35)'; c.lineWidth = 2; c.setLineDash([3, 14]);
  const rp = E.outExpo(prog(lb, .6, 1.8));
  c.translate(sx, sy); c.rotate(lb * .3);
  c.beginPath(); c.arc(0, 0, 175 * rp, 0, TAU); c.stroke();
  c.rotate(-lb * .7); c.setLineDash([40, 20]); c.globalAlpha = .5; c.beginPath(); c.arc(0, 0, 205 * rp, 0, TAU); c.stroke();
  c.restore();
  icShield(c, sx, sy, S * lerp(.8, 1, E.spring(prog(lb, .4, 1.6))), C.mint, E.inOutCubic(prog(lb, .4, 1.8)));
  const rows = [
    ['shield', 'Valeur probante', 'Signature électronique conforme eIDAS'],
    ['audit', 'Audit trail', 'Horodatage opposable en cas de litige'],
    ['folder', 'Archivage légal', 'Conservé toute la durée légale'],
    ['lock', 'Données sécurisées', 'AES-256 · TLS 1.3 · UE · RGPD'],
  ];
  rows.forEach(([ic, t, sub], k) => {
    const p = E.spring(prog(lb, 2 + k * .45, 3.1 + k * .45));
    if (p <= 0) return;
    const y = 970 + k * 142;
    c.save(); c.globalAlpha = clamp(p * 1.4); c.translate((1 - p) * -120, 0);
    card(c, 80, y, 920, 122, 32, { fill: C.surf });
    const ix = 150, iy = y + 61;
    c.fillStyle = 'rgba(62,232,154,0.12)'; c.beginPath(); c.roundRect(ix - 38, iy - 38, 76, 76, 22); c.fill();
    if (ic === 'shield') icShield(c, ix, iy, 44, C.mint);
    if (ic === 'audit') icClockDoc(c, ix, iy, 44, C.mint);
    if (ic === 'folder') icFolder(c, ix, iy, 44, C.mint);
    if (ic === 'lock') icLock(c, ix, iy, 46, C.mint);
    txt(c, t, 220, y + 54, '600 32px Geist', C.text, 'left', -.5);
    txt(c, sub, 220, y + 92, '500 24px Geist', C.muted);
    c.restore();
  });
}

// ─── S8 · avant / après (temps 94–102) ────────────────────────────────────
function s8(c, lb) {
  label(c, 'AVANT / APRÈS', 70, 290, lb, 0);
  title(c, [[['De la dispersion', 'w']], [['à la sérénité.', 's']]], 70, 405, 92, 104, lb, .15);
  const av = ['Excel + Drive + emails', 'Saisie manuelle répétitive', 'Recherches dans 5 dossiers', 'Visibilité approximative'];
  const ap = ['Une seule plateforme', 'Workflows automatisés', 'Coffre-fort centralisé et indexé', 'Cockpit clair en temps réel'];
  const a = E.spring(prog(lb, .4, 1.5)), fade = 1 - .5 * prog(lb, 3, 3.8);
  if (a > 0) {
    c.save(); c.globalAlpha = clamp(a * 1.4) * fade; c.translate(0, (1 - a) * 60);
    card(c, 70, 560, 940, 390, 40, { fill: C.surf });
    txt(c, 'AVANT', 130, 640, '500 24px Mono', C.muted, 'left', 6);
    av.forEach((s, k) => {
      const y = 715 + k * 64;
      icDashed(c, 150, y - 10, 18, lb * .6 + k, C.muted);
      txt(c, s, 196, y, '500 32px Geist', C.muted);
      const st = E.inOutCubic(prog(lb, 2.4 + k * .15, 3 + k * .15));
      if (st > 0) { c.font = '500 32px Geist'; c.fillStyle = C.amber; c.fillRect(190, y - 12, (c.measureText(s).width + 12) * st, 3); }
    });
    c.restore();
  }
  const b = E.spring(prog(lb, 3, 4.1));
  if (b > 0) {
    c.save(); c.globalAlpha = clamp(b * 1.4); c.translate(0, (1 - b) * 80);
    card(c, 70, 990, 940, 420, 40, { fill: '#0F2019', stroke: 'rgba(62,232,154,0.45)', glow: 1 });
    txt(c, 'APRÈS BEBAIL', 130, 1072, '500 24px Mono', C.mint, 'left', 6);
    ap.forEach((s, k) => {
      const y = 1150 + k * 70, p = prog(lb, 3.4 + k * .2, 4.2 + k * .2);
      if (p <= 0) return;
      icCheck(c, 150, y - 11, 20, p, C.mint);
      c.save(); c.globalAlpha *= clamp(p * 2); txt(c, s, 196 + (1 - E.outCubic(p)) * 30, y, '500 32px Geist', C.text); c.restore();
    });
    c.restore();
  }
}

// ─── S9 · appel à l'action (temps 102–116) ────────────────────────────────
function s9(c, lb) {
  const y = 700, S = 220;
  mark(c, CX, y, S, { tile: E.spring(prog(lb, 0, 1.1)), draw: prog(lb, .3, 1.3), dot: prog(lb, 1.1, 1.6), glow: prog(lb, .2, 1.4) });
  wordmark(c, CX, 1010, 160, lb, .9);
  title(c, [[['La gestion locative,', 'm']], [['enfin sereine.', 's']]], CX, 1130, 58, 80, lb, 1.6, 'center', .2);
  const bp = E.spring(prog(lb, 2.6, 3.7));
  if (bp > 0) {
    const by = 1330, press = Math.exp(-Math.abs(lb - 5) * 10) * .08;
    c.save(); c.translate(CX, by); const s = bp * (1 - press); c.scale(s, s);
    c.shadowColor = 'rgba(62,232,154,0.55)'; c.shadowBlur = 60 + 30 * Math.sin(lb * 3);
    c.fillStyle = C.mint; c.beginPath(); c.roundRect(-270, -62, 540, 124, 62); c.fill();
    c.shadowColor = 'transparent';
    txt(c, 'Essai gratuit', -30, 14, '600 42px Geist', C.bg, 'center', -.5);
    c.strokeStyle = C.bg; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
    const ax = 150 + Math.max(0, Math.sin(lb * Math.PI)) * 8;
    c.beginPath(); c.moveTo(ax - 22, 0); c.lineTo(ax + 18, 0); c.moveTo(ax + 2, -16); c.lineTo(ax + 18, 0); c.lineTo(ax + 2, 16); c.stroke();
    c.restore();
    ripple(c, CX + 40, by + 10, prog(lb, 5, 6), C.mintSoft, 20, 320);
  }
  const cm = prog(lb, 3.8, 4.9), co = prog(lb, 5.6, 6.6);
  if (cm > 0 && co < 1) {
    const e = E.inOutCubic(cm);
    cursor(c, lerp(900, CX + 40, e) + E.inCubic(co) * 600, lerp(1650, 1340, e) + E.inCubic(co) * 300, Math.exp(-Math.abs(lb - 5) * 12));
  }
  const up = prog(lb, 3.4, 4.2);
  if (up > 0) { c.save(); c.globalAlpha = up; txt(c, 'bebail.com', CX, 1500, '500 36px Mono', C.text, 'center', 4); c.restore(); }
}

// ─── montage ──────────────────────────────────────────────────────────────
const SCENES = [
  [0, 10, 1.3, s1], [10, 26, 0, s2], [26, 34, 1.4, s3], [34, 50, 1.4, s4], [50, 66, 1.4, s5],
  [66, 82, 1.4, s6], [82, 94, 1.4, s7], [94, 102, 1.4, s8], [102, 116, 0, s9],
];
function draw(t) {
  const b = t / B;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
  background(t);
  const sc = SCENES.find(s => b >= s[0] && b < s[1]) || SCENES[SCENES.length - 1];
  const lb = b - sc[0];
  const lc = LYR.getContext('2d');
  lc.setTransform(1, 0, 0, 1, 0, 0); lc.globalAlpha = 1; lc.globalCompositeOperation = 'source-over'; lc.filter = 'none';
  lc.clearRect(0, 0, W, H);
  sc[3](lc, lb);
  // whip-pan : la scène sortante file vers le haut, l'entrante arrive d'en bas, avec traînée de flou
  const ex = sc[2] ? E.inExpo(prog(b, sc[1] - .7, sc[1])) : 0;
  const idx = SCENES.indexOf(sc);
  const en = idx > 0 && SCENES[idx - 1][2] ? 1 - E.outExpo(prog(lb, 0, .8)) : 0;
  const off = -ex * 900 + en * 900, smear = ex * 260 + en * 260;
  const push = 1 + .035 * E.outCubic(prog(lb, 0, sc[1] - sc[0]));
  ctx.save();
  ctx.translate(CX, H / 2); ctx.scale(push, push); ctx.translate(-CX, -H / 2);
  if (smear > 2) {
    const n = 7;
    for (let k = 0; k < n; k++) {
      ctx.globalAlpha = (1 - Math.max(ex, en) * .5) / n * 1.6;
      ctx.drawImage(LYR, 0, off + (k / (n - 1) - .5) * smear * (en > 0 ? -1 : 1));
    }
  } else ctx.drawImage(LYR, 0, off);
  ctx.restore();
  // éclat menthe au moment de la coupe
  const cut = Math.max(ex, en);
  if (cut > .05) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const y = H / 2 + (ex > 0 ? (1 - ex) * H * .6 : -(1 - en) * H * .6);
    const g = ctx.createLinearGradient(0, y - 220, 0, y + 220);
    g.addColorStop(0, 'rgba(62,232,154,0)'); g.addColorStop(.5, `rgba(62,232,154,${.28 * cut})`); g.addColorStop(1, 'rgba(62,232,154,0)');
    ctx.fillStyle = g; ctx.fillRect(0, y - 220, W, 440);
    ctx.restore();
  }
  // grain
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07;
  ctx.drawImage(GRAIN[Math.floor(t * FPS) % GRAIN.length], 0, 0, W, H); ctx.restore();
  // fin
  const fo = prog(t, DUR - .5, DUR);
  if (fo > 0) { ctx.fillStyle = `rgba(6,16,12,${fo})`; ctx.fillRect(0, 0, W, H); }
}

function init() {
  const r = rng(11);
  for (let k = 0; k < 5; k++) {
    const g = mk(360, 640), x = g.getContext('2d'), id = x.createImageData(360, 640);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); GRAIN.push(g);
  }
  CHIPD = CHIPS.map((_, i) => ({ x: 80 + r() * 920, y: 380 + r() * 1250, sp: .5 + r() * .8, ph: r() * TAU, rot: (r() - .5) * .5, t0: 1.5 + i * .4 }));
}

window.__ready = (async () => {
  await Promise.all(['700 40px Geist', '600 40px Geist', '500 40px Geist', '500 20px Mono', 'italic 60px Serif'].map(f => document.fonts.load(f)));
  init(); draw(0); return true;
})();
window.renderFrame = t => draw(t);

if (!location.search.includes('render')) {
  window.__ready.then(() => {
    const audio = document.getElementById('a');
    let t0 = null;
    const loop = now => { if (t0 === null) t0 = now; draw(((now - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    document.body.addEventListener('click', () => { audio.currentTime = 0; audio.play(); t0 = null; });
    requestAnimationFrame(loop);
  });
} else document.body.classList.add('render');
