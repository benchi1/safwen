// اعرف دينك ونبيك — S01E01 « القلب » · réel 1080×1920
// renderFrame(t) dessine l'image à l'instant t. Rendu : node render.js
'use strict';
const W = 1080, H = 1920, FPS = 30, DUR = 89.5;
window.CONFIG = { FPS, DUR };
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');
if (location.search.includes('render')) document.body.classList.add('render');

// ---------- Palette « Kairouan » ----------
const C = {
  paper: '#EBE3D5', ink: '#15120F', indigo: '#1B2550', indigoD: '#111833',
  gold: '#C9A35B', clay: '#B4532A', cream: '#F1E8D8',
};
const M = { x: 64 };                       // marge
const MIR = { x: 540, y: 900, r: 290 };     // le miroir-cœur

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeBack = k => { const s = 1.6; k -= 1; return k * k * ((s + 1) * k + s) + 1; };
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
const win = (t, a, b, fi = .35, fo = .35) => Math.min(easeOut(ramp(t, a, a + fi)), 1 - ramp(t, b - fo, b));
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; }
const toAr = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);

function txt(s, x, y, font, color, align = 'right', dir = 'rtl', ls = 0) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.direction = dir;
  ctx.letterSpacing = ls + 'px'; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
}

// ---------- Phrases (sous-titres) ----------
const PH = (() => {
  const out = [];
  for (let i = 0; i < PHRASES.length; i++) {
    let p = { q: PHRASES[i].q, w: PHRASES[i].w.slice() };
    while (!p.q && i + 1 < PHRASES.length) {
      const n = PHRASES[i + 1], last = p.w[p.w.length - 1];
      if (n.q || p.w.length > 2 || n.w[0][1] - last[2] > .45 || p.w.length + n.w.length > 7) break;
      p.w = p.w.concat(n.w); i++;
    }
    out.push({ q: p.q, a: p.w[0][1], b: p.w[p.w.length - 1][2], w: p.w.map(([s, a, b]) => ({ s, a, b })) });
  }
  out.forEach((p, i) => { p.next = out[i + 1] ? out[i + 1].a : DUR; });
  return out;
})();
// zones où le sous-titre est remplacé par une typo plein écran
const NO_CAPS = [[0, 6.95], [9.5, 17.55], [39.95, 45.5], [65.2, 70.9], [77.9, DUR]];

// ---------- Textures ----------
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function fbm(w, h, seed, scales) {
  const r = rng(seed), out = new Float32Array(w * h);
  for (const [cell, amp] of scales) {
    const gw = Math.ceil(w / cell) + 2, gh = Math.ceil(h / cell) + 2, g = new Float32Array(gw * gh);
    for (let i = 0; i < g.length; i++) g[i] = r();
    for (let y = 0; y < h; y++) {
      const fy = y / cell, iy = fy | 0, ty = fy - iy, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const fx = x / cell, ix = fx | 0, tx = fx - ix, sx = tx * tx * (3 - 2 * tx);
        const a = g[iy * gw + ix], b = g[iy * gw + ix + 1], c2 = g[(iy + 1) * gw + ix], d = g[(iy + 1) * gw + ix + 1];
        out[y * w + x] += amp * lerp(lerp(a, b, sx), lerp(c2, d, sx), sy);
      }
    }
  }
  return out;
}
function texture(hex, seed, mottle, grain, fibers) {
  const w = 540, h = 960, c = makeCanvas(w, h), g = c.getContext('2d');
  const n = parseInt(hex.slice(1), 16), R = n >> 16, G = (n >> 8) & 255, B = n & 255;
  const f = fbm(w, h, seed, [[180, .6], [60, .3], [14, .1]]), r = rng(seed + 7);
  const d = g.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const v = (f[i] - .5) * mottle + (r() - .5) * grain;
    d.data[i * 4] = R + v; d.data[i * 4 + 1] = G + v; d.data[i * 4 + 2] = B + v * .9; d.data[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  if (fibers) {
    g.globalAlpha = .07; g.strokeStyle = '#6b5a40'; g.lineWidth = .6;
    for (let i = 0; i < 260; i++) {
      const x = r() * w, y = r() * h, a = r() * 6.28, l = 6 + r() * 26;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
    }
  }
  return c;
}
const TEX_PAPER = texture(C.paper, 3, 16, 14, true);
const TEX_NIGHT = texture(C.indigo, 11, 22, 10, false);
const GRAIN = [0, 1, 2].map(i => {
  const c = makeCanvas(360, 640), g = c.getContext('2d'), d = g.createImageData(360, 640), r = rng(50 + i);
  for (let p = 0; p < d.data.length; p += 4) { const v = 128 + (r() - .5) * 200; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});

// ---------- Saleté du miroir (encre) ----------
const DS = 600, DC = DS / 2;
const DIRT = makeCanvas(DS, DS), DCTX = DIRT.getContext('2d');
const DIMG = DCTX.createImageData(DS, DS);
function rankNorm(a) {
  const idx = Array.from(a.keys()).sort((i, j) => a[i] - a[j]), out = new Float32Array(a.length);
  idx.forEach((k, r) => out[k] = r / (a.length - 1)); return out;
}
const N_COVER = rankNorm(fbm(DS, DS, 21, [[120, .55], [40, .3], [10, .15]]));
const N_CLEAN = (() => {
  const f = fbm(DS, DS, 33, [[90, .6], [30, .3], [8, .1]]), a = new Float32Array(DS * DS);
  for (let y = 0; y < DS; y++) for (let x = 0; x < DS; x++) {
    const r = Math.hypot(x - DC, y - DC) / DC; a[y * DS + x] = .6 * r + .4 * f[y * DS + x];
  }
  return rankNorm(a);
})();
const INKV = (() => { const f = fbm(DS, DS, 44, [[50, .7], [6, .3]]); return f; })();

const BLOBS = (() => {
  const r = rng(5), out = [{ x: 40, y: -60, r: 46, t: 24.72, seed: 1 }];
  const N = 64;
  for (let i = 0; i < N; i++) {
    const a = r() * 6.28, d = Math.sqrt(r()) * (MIR.r - 30);
    out.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: 16 + r() * 34 + i * .5, t: 31.9 + 4.6 * Math.pow(i / N, .62), seed: i + 2 });
  }
  return out;
})();
function blobPath(b, sc) {
  const r = rng(b.seed * 97), k1 = 2 + (r() * 2 | 0), k2 = 5 + (r() * 3 | 0), p1 = r() * 6, p2 = r() * 6;
  const P = new Path2D();
  for (let i = 0; i <= 56; i++) {
    const a = i / 56 * 6.283, rr = b.r * sc * (1 + .11 * Math.sin(k1 * a + p1) + .05 * Math.sin(k2 * a + p2) + .03 * Math.sin(13 * a + p2));
    const x = DC + b.x + Math.cos(a) * rr, y = DC + b.y + Math.sin(a) * rr;
    i ? P.lineTo(x, y) : P.moveTo(x, y);
  }
  P.closePath();
  for (let j = 0; j < 4; j++) {
    const a = r() * 6.28, d = b.r * sc * (1.3 + r() * .7), s = (2 + r() * 5) * sc;
    P.moveTo(DC + b.x + Math.cos(a) * d + s, DC + b.y + Math.sin(a) * d);
    P.arc(DC + b.x + Math.cos(a) * d, DC + b.y + Math.sin(a) * d, s, 0, 6.283);
  }
  return P;
}
// couverture (rān) puis nettoyage (توبة، استغفار، ذكر، نور)
const kCover = t => 1.1 * ease(ramp(t, 34.3, 37.1));
const cClean = t => 1.1 * (
  .12 * ease(ramp(t, 48.84, 49.7)) + .13 * ease(ramp(t, 52.76, 53.95)) + .42 * ease(ramp(t, 58.84, 61.6)) +
  .26 * ease(ramp(t, 62.9, 65.1)) + .07 * ease(ramp(t, 71, 74.5)));

function renderDirt(t) {
  DCTX.clearRect(0, 0, DS, DS);
  const k = kCover(t) - .06, c = cClean(t) - .06;
  if (k > -.05 && c < 1.04) {
    const d = DIMG.data;
    for (let y = 0; y < DS; y++) for (let x = 0; x < DS; x++) {
      const i = y * DS + x, j = i * 4;
      const cov = 1 - ss(k - .045, k + .045, N_COVER[i]);
      const keep = ss(c - .035, c + .035, N_CLEAN[i]);
      const a = cov * keep;
      const v = 16 + (INKV[i] - .5) * 22;
      d[j] = v + 4; d[j + 1] = v + 2; d[j + 2] = v; d[j + 3] = a * 255;
    }
    DCTX.putImageData(DIMG, 0, 0);
  }
  if (t < 37.4) {
    DCTX.fillStyle = C.ink;
    for (const b of BLOBS) {
      if (t < b.t) continue;
      let sc = easeBack(ramp(t, b.t, b.t + .32));
      let a = 1;
      if (b === BLOBS[0]) { const kk = ease(ramp(t, 28.7, 29.75)); a = 1 - kk; sc *= 1 - .35 * kk; }
      if (a <= 0) continue;
      DCTX.globalAlpha = a; DCTX.fill(blobPath(b, sc)); DCTX.globalAlpha = 1;
    }
  }
}

// ---------- Monde « papier » et monde « nuit » ----------
function frameUI(t, fg, chapter) {
  ctx.save();
  txt('اعرف دينك ونبيّك', W - M.x, 236, '500 30px Firjar', fg, 'right');
  txt('S01 — E01', M.x, 236, '24px DMono', fg, 'left', 'ltr', 2);
  ctx.globalAlpha = .3; ctx.fillStyle = fg; ctx.fillRect(M.x, 262, W - 2 * M.x, 1.5); ctx.globalAlpha = 1;
  ctx.globalAlpha = .25; ctx.fillRect(M.x, 1588, W - 2 * M.x, 1.5); ctx.globalAlpha = 1;
  ctx.fillRect(M.x, 1587, (W - 2 * M.x) * t / DUR, 3.5);
  const s = Math.floor(t), tc = `${String(s / 60 | 0).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  txt(`${tc} / 01:29`, M.x, 1630, '22px DMono', rgba(fg === C.ink ? C.ink : C.cream, .7), 'left', 'ltr', 1);
  txt(chapter, W - M.x, 1630, '500 26px Firjar', rgba(fg === C.ink ? C.ink : C.cream, .7), 'right');
  ctx.restore();
}

const SECTIONS = [
  { a: 6.95, b: 17.5, idx: 'H', title: 'حديث شريف', sub: 'رواه مسلم', icon: 'book' },
  { a: 17.5, b: 36.85, idx: 'A', title: 'القلب = مراية', sub: 'كل ذنب نكتة', icon: 'mirror' },
  { a: 36.85, b: 45.5, idx: 'B', title: 'الرّان', sub: 'كي تتغطّى المراية', icon: 'drop' },
  { a: 45.5, b: 47.9, idx: '?', title: 'كيفاش نصقلها؟', sub: 'ثلاثة أبواب', icon: 'mirror' },
  { a: 47.9, b: 54.45, idx: '01', title: 'التّوبة', sub: 'الرّجوع', icon: 'tawba' },
  { a: 54.45, b: 61.9, idx: '02', title: 'الاستغفار', sub: 'مية مرّة في النّهار', icon: 'beads' },
  { a: 61.9, b: 70.9, idx: '03', title: 'الذّكر', sub: 'باش يطمئنّ القلب', icon: 'dhikr' },
  { a: 70.9, b: 77.9, idx: 'M', title: 'الإمام مالك', sub: 'إمام دار الهجرة', icon: 'nur' },
];
function header(t, fg) {
  for (const s of SECTIONS) {
    if (t < s.a - .1 || t > s.b + .1) continue;
    const kin = easeOut(ramp(t, s.a, s.a + .6)), kout = ramp(t, s.b - .3, s.b);
    const a = kin * (1 - kout);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a;
    // index en mono
    txt(s.idx, M.x, 432, '96px DMono', fg, 'left', 'ltr');
    // titre révélé par masque
    ctx.save();
    ctx.beginPath(); ctx.rect(W - M.x - 820 * kin, 300, 820 * kin, 140); ctx.clip();
    txt(s.title, W - M.x, 402, '700 72px Firjar', fg, 'right');
    ctx.restore();
    txt(s.sub, W - M.x, 452, '300 30px FirjarX', rgba(fg === C.ink ? C.ink : C.cream, .62), 'right');
    ctx.font = '700 72px Firjar'; ctx.direction = 'rtl';
    const tw = ctx.measureText(s.title).width;
    drawIcon(ctx, s.icon, W - M.x - tw - 52, 378, 52, fg === C.ink ? C.clay : C.gold, 3.2, ramp(t, s.a + .2, s.a + 1.1));
    ctx.restore();
  }
}

// texte révélé mot à mot (RTL), retourne la hauteur
function wordFlow(words, t, font, maxW, cx, cy, lh, colorOf, opts = {}) {
  ctx.font = font; ctx.direction = 'rtl'; ctx.textAlign = 'right';
  const sp = ctx.measureText(' ').width;
  const lines = [[]]; let lw = 0;
  for (const w of words) {
    const ww = ctx.measureText(w.s).width;
    if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push({ ...w, ww }); lw += ww + sp;
  }
  const y0 = cy - (lines.length - 1) * lh / 2;
  lines.forEach((ln, li) => {
    const tot = ln.reduce((s, w) => s + w.ww, 0) + sp * (ln.length - 1);
    let x = cx + tot / 2;
    for (const w of ln) {
      const k = opts.pre ? 1 : easeOut(ramp(t, w.a - .05, w.a + .25));
      const ghost = opts.ghost ?? .18;
      ctx.globalAlpha = (ghost + (1 - ghost) * k) * (opts.alpha ?? 1);
      ctx.fillStyle = colorOf(w, k);
      const dy = (1 - k) * (opts.rise ?? 10);
      ctx.fillText(w.s, x, y0 + li * lh + dy);
      if (opts.mark) opts.mark(w, x, y0 + li * lh, k);
      x -= w.ww + sp;
    }
  });
  ctx.globalAlpha = 1;
  return lines.length * lh;
}

function captions(t, fg) {
  if (NO_CAPS.some(([a, b]) => t > a && t < b)) return;
  for (const p of PH) {
    const end = Math.min(p.b + .35, p.next - .02);
    if (t < p.a - .12 || t > end) continue;
    const a = Math.min(easeOut(ramp(t, p.a - .12, p.a + .15)), 1 - ramp(t, end - .15, end));
    const quote = p.q;
    ctx.save();
    if (quote) {
      txt('رواه ابن ماجه', W / 2, 1338, '300 26px FirjarX', rgba(fg === C.ink ? C.ink : C.cream, .6 * a), 'center');
    }
    wordFlow(p.w, t, quote ? '96px Maghribi' : '700 60px Firjar', 900, W / 2, quote ? 1430 : 1420, 92,
      (w, k) => quote ? C.indigo : fg, { alpha: a, ghost: .22, rise: 8 });
    ctx.restore();
  }
}

function glass(t, fg, alpha = 1) {
  const { x, y, r } = MIR;
  const p = ease(ramp(t, 17.55, 19.3));
  ctx.save(); ctx.globalAlpha = alpha;
  // verre
  ctx.save(); ctx.globalAlpha = alpha * p;
  const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  g.addColorStop(0, fg === C.ink ? '#F7F2EA' : '#26305E'); g.addColorStop(.55, fg === C.ink ? '#E6DCCB' : '#1A2147'); g.addColorStop(1, fg === C.ink ? '#D7CBB6' : '#151B3C');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
  ctx.restore();
  // contour
  ctx.strokeStyle = fg; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * p); ctx.stroke();
  // anneaux, graduations (100 = le chapelet)
  ctx.globalAlpha = alpha * .35 * p; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(x, y, r + 26, 0, 6.283); ctx.stroke();
  for (let i = 0; i < 100; i++) {
    const a = -Math.PI / 2 + i / 100 * 6.283, l = i % 10 ? 8 : 18;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r + 40), y + Math.sin(a) * (r + 40));
    ctx.lineTo(x + Math.cos(a) * (r + 40 + l), y + Math.sin(a) * (r + 40 + l)); ctx.stroke();
  }
  ctx.globalAlpha = alpha * .5 * p;
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r + 72), y + Math.sin(a) * (r + 72));
    ctx.lineTo(x + Math.cos(a) * (r + 110), y + Math.sin(a) * (r + 110)); ctx.stroke();
  }
  ctx.globalAlpha = alpha * p;
  txt('FIG.01', x - r - 40, y - r - 4, '20px DMono', rgba(fg === C.ink ? C.ink : C.cream, .6), 'left', 'ltr', 1);
  txt('R = ∞', x + r + 40, y + r + 30, '20px DMono', rgba(fg === C.ink ? C.ink : C.cream, .45), 'right', 'ltr', 1);
  ctx.restore();
}

function sweep(t, a, dur) {
  const k = ramp(t, a, a + dur); if (k <= 0 || k >= 1) return;
  const { x, y, r } = MIR;
  ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, 6.283); ctx.clip();
  ctx.translate(x, y); ctx.rotate(-.7);
  const px = lerp(-r * 1.6, r * 1.6, ease(k));
  const g = ctx.createLinearGradient(px - 90, 0, px + 90, 0);
  g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.75)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.fillRect(-r * 2, -r * 2, r * 4, r * 4);
  ctx.restore();
}

function mirrorScene(t) {
  if (t < 17.5 || t > 78.2) return;
  const { x, y, r } = MIR;
  glass(t, C.ink);
  // saleté
  if (t > 24.1) {
    renderDirt(t);
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, 6.283); ctx.clip();
    ctx.drawImage(DIRT, x - DC, y - DC); ctx.restore();
  }
  // la goutte qui tombe
  if (t > 24.0 && t < 24.75) {
    const k = ease(ramp(t, 24.0, 24.72));
    drawIcon(ctx, 'drop', x + 40, lerp(330, y - 70, k), 46, C.ink, 3, 1);
    ctx.save(); ctx.translate(x + 40, lerp(330, y - 70, k)); ctx.fillStyle = C.ink;
    ctx.fill(new Path2D('M0 -19 L11 0 L11 8 L5 17 L-5 17 L-11 8 L-11 0 Z')); ctx.restore();
  }
  // onde d'impact
  for (const tt of [24.72]) {
    const k = ramp(t, tt, tt + .9); if (k <= 0 || k >= 1) continue;
    ctx.save(); ctx.strokeStyle = rgba(C.ink, 1 - k); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + 40, y - 60, 46 + k * 140, 0, 6.283); ctx.stroke(); ctx.restore();
  }
  // étiquette « نكتة » + source
  const a1 = win(t, 24.9, 28.7, .4, .4);
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1; ctx.strokeStyle = C.clay; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 90, y - 90); ctx.lineTo(x + 200, y - 200); ctx.lineTo(x + 360, y - 200); ctx.stroke();
    txt('نكتة كحلة', x + 360, y - 214, '700 34px Firjar', C.clay, 'right');
    txt('N° 001', x + 210, y - 176, '20px DMono', C.clay, 'left', 'ltr', 1);
    ctx.restore();
  }
  const a2 = win(t, 22.4, 30.8, .5, .5);
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2 * .7;
    drawIcon(ctx, 'book', M.x + 18, y + r + 76, 30, C.ink, 3);
    txt('رواه التّرمذي · حسن صحيح', M.x + 44, y + r + 86, '300 26px FirjarX', C.ink, 'left');
    ctx.restore();
  }
  // compteur de taches
  const a3 = win(t, 31.9, 37.0, .3, .5);
  if (a3 > 0) {
    const n = BLOBS.filter(b => b !== BLOBS[0] && t >= b.t).length;
    ctx.save(); ctx.globalAlpha = a3;
    ctx.strokeStyle = C.clay; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + r * .72, y - r * .72); ctx.lineTo(x + r + 40, y - r - 40); ctx.lineTo(x + r + 120, y - r - 40); ctx.stroke();
    txt(String(n).padStart(3, '0'), x + r + 120, y - r - 54, '44px DMono', C.clay, 'right', 'ltr');
    ctx.restore();
  }
  // reflets après chaque polissage
  sweep(t, 29.6, 1.1); sweep(t, 53.9, .9); sweep(t, 61.5, 1.0); sweep(t, 65.0, .8); sweep(t, 73.8, 1.2);
  // chapelet : 100 grains
  const bv = Math.max(win(t, 54.6, 70.9, .6, .4), win(t, 70.9, 77.9, .01, .5) * .6);
  if (bv > 0) {
    const lit = Math.floor(100 * ease(ramp(t, 58.84, 61.6)));
    ctx.save(); ctx.globalAlpha = bv;
    for (let i = 0; i < 100; i++) {
      const a = -Math.PI / 2 - i / 100 * 6.283, bx = x + Math.cos(a) * (r + 49), by = y + Math.sin(a) * (r + 49);
      ctx.save(); ctx.translate(bx, by); ctx.rotate(a + Math.PI / 4);
      if (i < lit) { ctx.fillStyle = i === lit - 1 ? C.clay : C.indigo; ctx.fillRect(-5, -5, 10, 10); }
      else { ctx.strokeStyle = rgba(C.ink, .35); ctx.lineWidth = 1.2; ctx.strokeRect(-4, -4, 8, 8); }
      ctx.restore();
    }
    if (t > 58.5) {
      const a4 = win(t, 58.6, 62.2, .3, .4);
      ctx.globalAlpha = bv * a4;
      txt(String(lit).padStart(3, '0'), M.x, y + r + 96, '64px DMono', C.indigo, 'left', 'ltr');
      txt('مرّة', M.x + 150, y + r + 92, '700 34px Firjar', C.indigo, 'left');
      txt('رواه مسلم', W - M.x, y + r + 92, '300 26px FirjarX', rgba(C.ink, .6), 'right');
    }
    ctx.restore();
  }
  // ذكر : ondes
  if (t > 62.6 && t < 66) {
    ctx.save(); ctx.strokeStyle = C.indigo;
    for (let j = 0; j < 6; j++) {
      const k = ((t - 62.6) * .9 - j * .35); if (k < 0 || k > 1) continue;
      ctx.globalAlpha = (1 - k) * .8; ctx.lineWidth = 2.5 * (1 - k) + .5;
      ctx.beginPath(); ctx.arc(x, y, 40 + k * (r + 160), 0, 6.283); ctx.stroke();
    }
    ctx.restore();
  }
  // نور
  const nl = ease(ramp(t, 75.1, 77.0)) * (1 - ramp(t, 77.7, 78.2));
  if (nl > 0) {
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r - 1.5, 0, 6.283); ctx.clip();
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 1.1 * nl + 1);
    g.addColorStop(0, 'rgba(255,248,228,1)'); g.addColorStop(.35, 'rgba(250,232,190,.75)'); g.addColorStop(1, 'rgba(250,232,190,0)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.globalAlpha = nl;
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4, r0 = r + 70, r1 = r0 + 70 * nl;
      ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1); ctx.stroke();
    }
    ctx.fillStyle = C.ink; ctx.fillRect(x - 6, y - 6, 12, 12);
    ctx.restore();
  }
}

// ---- accroche ----
function hook(t) {
  const out = ease(ramp(t, 6.55, 7.05));
  if (out >= 1) return;
  ctx.save(); ctx.translate(0, -out * 120); ctx.globalAlpha = 1 - out;
  const words = PH[0].w;
  ctx.font = '800 168px FirjarC'; ctx.direction = 'rtl';
  const l1 = words.slice(0, 2), l2 = words.slice(2);
  const draw = (ln, y, last) => {
    const sp = 36, ws = ln.map(w => ctx.measureText(w.s).width);
    let xx = W / 2 + (ws.reduce((a, b) => a + b, 0) + sp * (ln.length - 1)) / 2;
    ln.forEach((w, i) => {
      const k = easeBack(ramp(t, w.a - .06, w.a + .3));
      ctx.save(); ctx.beginPath(); ctx.rect(xx - ws[i] - 10, y - 190, ws[i] + 20, 230); ctx.clip();
      txt(w.s, xx, y + (1 - k) * 170, '800 168px FirjarC', last && i === ln.length - 1 ? C.clay : C.ink, 'right');
      ctx.restore(); xx -= ws[i] + sp;
    });
  };
  draw(l1, 690, false); draw(l2, 870, true);
  // « موش … » barrés
  [[1, 1070], [2, 1170], [3, 1270]].forEach(([pi, y]) => {
    const raw = PHRASES[pi]; if (!raw) return;
    const p = { a: raw.w[0][1], b: raw.w[raw.w.length - 1][2], w: raw.w.map(([s]) => ({ s })) };
    const k = easeOut(ramp(t, p.a - .05, p.a + .3)); if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= k;
    const s = p.w.map(w => w.s).join(' ').replace('…', '').replace('.', '');
    txt(s, W / 2, y, '300 64px FirjarX', C.ink, 'center');
    ctx.font = '300 64px FirjarX'; const tw = ctx.measureText(s).width;
    const ks = ease(ramp(t, p.b - .1, p.b + .35));
    ctx.fillStyle = C.clay; ctx.fillRect(W / 2 + tw / 2 + 20 - (tw + 40) * ks, y - 24, (tw + 40) * ks, 5);
    ctx.restore();
  });
  ctx.restore();
}

// ---- hadith 1 au centre ----
function hadith1(t) {
  const a = win(t, 9.3, 17.6, .4, .45);
  if (a <= 0) return;
  const ws = PH.filter(p => p.q && p.a < 20).flatMap(p => p.w);
  ctx.save();
  wordFlow(ws, t, '104px Maghribi', 880, W / 2, 900, 150, (w, k) => /قلوب/.test(w.s) ? C.indigo : C.ink, {
    alpha: a, ghost: .14, rise: 14,
    mark: (w, x, y, k) => {
      ctx.save(); ctx.font = '104px Maghribi'; const ww = ctx.measureText(w.s).width;
      if (/صُوَر|أموال/.test(w.s)) { const ks = ease(ramp(t, 13.3, 13.8)); ctx.fillStyle = C.clay; ctx.globalAlpha = a; ctx.fillRect(x - ww * ks, y - 30, ww * ks, 5); }
      if (/قلوب/.test(w.s)) {
        const ks = ease(ramp(t, 15.3, 16.1)); ctx.strokeStyle = C.indigo; ctx.lineWidth = 3; ctx.globalAlpha = a;
        ctx.beginPath(); ctx.ellipse(x - ww / 2, y - 20, ww / 2 + 30, 70, -.06, Math.PI, Math.PI + 6.283 * ks); ctx.stroke();
      }
      ctx.restore();
    }
  });
  ctx.restore();
}

function paperWorld(t) {
  ctx.drawImage(TEX_PAPER, 0, 0, W, H);
  const chapter = t < 17.5 ? 'المدخل' : t < 45.5 ? 'القلب · المراية' : t < 70.9 ? 'العلاج' : 'النّور';
  frameUI(t, C.ink, chapter);
  header(t, C.ink);
  hook(t);
  hadith1(t);
  mirrorScene(t);
  captions(t, C.ink);
}

// ---- versets ----
const V1 = 'كَلَّا بَلْ رَانَ عَلَىٰ قُلُوبِهِم مَّا كَانُوا يَكْسِبُونَ';
const V2 = 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ';
function verse(t, text, ref, a0, a1) {
  const a = win(t, a0, a1, .5, .5); if (a <= 0) return;
  const words = text.split(' ').map((s, i) => ({ s, a: a0 + .5 + i * .32 }));
  ctx.save();
  // cadre : coins anguleux
  ctx.globalAlpha = a; ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
  const bx = 120, by = 660, bw = W - 240, bh = 520, L = 60;
  for (const [cx, cy, sx, sy] of [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]]) {
    ctx.beginPath(); ctx.moveTo(cx, cy + sy * L); ctx.lineTo(cx, cy); ctx.lineTo(cx + sx * L, cy); ctx.stroke();
    ctx.fillStyle = C.gold; ctx.fillRect(cx + sx * 10 - 4, cy + sy * 10 - 4, 8, 8);
  }
  txt('قال تعالى', W / 2, 600, '300 30px FirjarX', rgba(C.cream, .7 * a), 'center');
  wordFlow(words, t, '112px Maghribi', 780, W / 2, 920, 170, () => C.cream, { alpha: a, ghost: 0, rise: 20 });
  txt(ref, W / 2, 1260, '500 32px Firjar', C.gold, 'center');
  ctx.restore();
}

function nightWorld(t) {
  ctx.drawImage(TEX_NIGHT, 0, 0, W, H);
  const outro = t > 81.2;
  frameUI(t, C.cream, outro ? 'الحلقة ١ · القلب' : t > 77 ? 'التّحدّي' : 'القرآن');
  verse(t, V1, 'سورة المطفّفين · الآية ١٤', 40.1, 45.5);
  verse(t, V2, 'سورة الرّعد · الآية ٢٨', 65.3, 70.9);
  // le défi du soir
  const a = win(t, 77.9, 81.5, .5, .4);
  if (a > 0) {
    const { x, y } = MIR, r = 230;
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = C.cream; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(x, y - 40, r, 0, 6.283); ctx.stroke();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y - 40, r, 0, 6.283); ctx.clip();
    ctx.fillStyle = rgba(C.cream, .07); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgba(C.cream, .9); ctx.beginPath(); ctx.arc(x + r * .55, y - 40 - r * .45, 26, 0, 6.283); ctx.fill();
    ctx.fillStyle = TEX_NIGHT ? C.indigo : '#000'; ctx.beginPath(); ctx.arc(x + r * .55 + 12, y - 40 - r * .45 - 6, 24, 0, 6.283); ctx.fill();
    ctx.restore();
    drawIcon(ctx, 'eye', x, y - 40, 120, C.gold, 2.5, ramp(t, 79.9, 80.8));
    const l1 = PH.find(p => p.w[0].s.startsWith('اللّيلة'));
    if (l1) wordFlow(l1.w, t, '300 58px FirjarX', 900, W / 2, 1160, 80, () => C.cream, { ghost: .2, alpha: a });
    const k = easeBack(ramp(t, 80.0, 80.45));
    ctx.save(); ctx.translate(W / 2, 1320); ctx.scale(.85 + .15 * k, .85 + .15 * k); ctx.globalAlpha = a * clamp(k);
    txt('شوف مرايتك', 0, 0, '800 150px FirjarC', C.cream, 'center'); ctx.restore();
    ctx.restore();
  }
  // générique de fin
  const o = easeOut(ramp(t, 81.3, 82.3));
  if (o > 0) {
    ctx.save(); ctx.globalAlpha = o * (1 - ramp(t, DUR - .5, DUR));
    const s = .92 + .08 * o;
    ctx.font = '150px Qahiri'; ctx.direction = 'rtl';
    const fit = Math.min(1, 880 / ctx.measureText('اعرف دينك ونبيك').width);
    ctx.save(); ctx.translate(W / 2, 760); ctx.scale(s * fit, s * fit);
    txt('اعرف دينك ونبيك', 0, 0, '150px Qahiri', C.gold, 'center'); ctx.restore();
    txt('اعرف دينك ونبيّك', W / 2, 880, '500 46px Firjar', C.cream, 'center');
    ctx.fillStyle = rgba(C.cream, .35); ctx.fillRect(W / 2 - 220 * o, 940, 440 * o, 1.5);
    txt('S01 · E01', W / 2, 1000, '26px DMono', rgba(C.cream, .7), 'center', 'ltr', 3);
    const k2 = easeOut(ramp(t, 83.4, 84.0));
    ctx.globalAlpha *= k2;
    txt('الحلقة الجاية', W / 2, 1160, '300 36px FirjarX', rgba(C.cream, .75), 'center');
    const k3 = easeBack(ramp(t, 84.7, 85.2));
    ctx.save(); ctx.translate(W / 2 + 40, 1300); ctx.scale(.8 + .2 * k3, .8 + .2 * k3);
    txt('الحسد', 0, 0, '800 140px FirjarC', C.clay, 'center'); ctx.restore();
    ctx.font = '800 140px FirjarC'; const tw = ctx.measureText('الحسد').width;
    drawIcon(ctx, 'flame', W / 2 + 40 - tw / 2 - 70, 1255, 76, C.clay, 3.5, ramp(t, 84.7, 85.7));
    ctx.restore();
  }
}

// rideau papier → nuit (1 = nuit)
const CURT = [[39.85, 40.5, 1], [44.95, 45.55, 0], [65.12, 65.7, 1], [70.35, 70.95, 0], [77.65, 78.45, 1]];
function curtain(t) {
  let v = 0;
  for (const [a, b, to] of CURT) { if (t >= b) v = to; else if (t > a) { const k = ease(ramp(t, a, b)); v = to ? k : 1 - k; break; } }
  return v;
}

window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const cu = curtain(t);
  if (cu < 1) paperWorld(t);
  if (cu > 0) {
    const yy = H * cu;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yy); ctx.clip(); nightWorld(t); ctx.restore();
    if (cu < 1) { ctx.fillStyle = C.gold; ctx.fillRect(0, yy - 2, W, 4); }
  }
  // grain
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .06;
  ctx.drawImage(GRAIN[Math.floor(t * FPS) % 3], 0, 0, W, H); ctx.restore();
  // ouverture
  const fin = 1 - ramp(t, 0, .45);
  if (fin > 0) { ctx.fillStyle = rgba(C.ink, fin); ctx.fillRect(0, 0, W, H); }
};

window.__ready = (async () => {
  await Promise.all(['16px Qahiri', '16px Maghribi', '700 16px Firjar', '500 16px Firjar', '300 16px Firjar', '300 16px FirjarX', '800 16px FirjarC', '16px DMono']
    .map(f => document.fonts.load(f, 'اعرف دينك S01')));
  await document.fonts.ready;
})();

if (!location.search.includes('render')) {
  window.__ready.then(() => { const t0 = performance.now(); const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); }; loop(); });
}
