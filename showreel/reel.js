// Showreel 2026 — 15 s, 1920×1080, 128 BPM (32 temps = 15 s pile).
// Tout est une fonction pure du temps : draw(t) dessine n'importe quelle image.

const W = 1920, H = 1080, CX = W / 2, CY = H / 2;
const BPM = 128, B = 60 / BPM, DUR = 15, FPS = 60;
const C = {
  ink: '#0A0A0F', cream: '#F3EEE3', coral: '#FF4D2E', lime: '#C8FF2E',
  blue: '#2E4BFF', pink: '#FF2E9A', violet: '#7A2EFF',
};

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

// ─── maths ────────────────────────────────────────────────────────────────
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  outExpo: t => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t),
  inExpo: t => t <= 0 ? 0 : Math.pow(2, 10 * t - 10),
  inOutExpo: t => t <= 0 ? 0 : t >= 1 ? 1 : t < .5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2,
  outCubic: t => 1 - Math.pow(1 - t, 3),
  inCubic: t => t * t * t,
  inQuad: t => t * t,
  inOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  outBack: t => { const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
  outElastic: t => t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * (2 * Math.PI / 3)) + 1,
};
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const TAU = Math.PI * 2;

function bg(c, col) { c.fillStyle = col; c.fillRect(-200, -200, W + 400, H + 400); }

function layout(c, text, font, ls = 0) {
  c.font = font;
  const L = [];
  for (let i = 0; i < text.length; i++) {
    L.push({ ch: text[i], x: c.measureText(text.slice(0, i)).width + ls * i, w: c.measureText(text[i]).width });
  }
  return { L, total: c.measureText(text).width + ls * (text.length - 1) };
}

function mixHex(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(lerp(pa >> 16, pb >> 16, t)), g = Math.round(lerp(pa >> 8 & 255, pb >> 8 & 255, t)), bl = Math.round(lerp(pa & 255, pb & 255, t));
  return `rgb(${r},${g},${bl})`;
}

// ─── ressources pré-calculées ────────────────────────────────────────────
const P = mk(), T = mk(), CR = mk(), CG = mk(), CB = mk();
let GRAIN = [], VIG;
const BLOB = mk(960, 540), BLOB_ID = BLOB.getContext('2d').createImageData(960, 540);
let SHAPES = [];
let PN = 3200, PA = [], PB = [], PD = [];
let TOR = [], SPH = [];

function resample(verts, n) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i], b = verts[(i + 1) % verts.length];
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
    segs.push([a, b, l]); total += l;
  }
  const out = [];
  let si = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const d = k / n * total;
    while (acc + segs[si][2] < d) { acc += segs[si][2]; si++; }
    const [a, b, l] = segs[si];
    const u = (d - acc) / l;
    out.push([lerp(a[0], b[0], u), lerp(a[1], b[1], u)]);
  }
  return out;
}
function poly(n, r, rot = 0) {
  const v = [];
  for (let k = 0; k < n; k++) { const a = -Math.PI / 2 + rot + k * TAU / n; v.push([Math.cos(a) * r, Math.sin(a) * r]); }
  return v;
}
function star(pts, r1, r2) {
  const v = [];
  for (let k = 0; k < pts * 2; k++) { const a = -Math.PI / 2 + k * Math.PI / pts, r = k % 2 ? r2 : r1; v.push([Math.cos(a) * r, Math.sin(a) * r]); }
  return v;
}

function sampleText(text, size, step) {
  const o = mk(), x = o.getContext('2d', { willReadFrequently: true });
  x.fillStyle = '#fff'; x.font = `${size}px Anton`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, CX, CY + 16);
  const d = x.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += step) for (let xx = 0; xx < W; xx += step) if (d[(y * W + xx) * 4 + 3] > 128) pts.push([xx, y]);
  return pts;
}
function shuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function init() {
  const r = rng(7);
  // grain
  for (let k = 0; k < 6; k++) {
    const g = mk(640, 360), x = g.getContext('2d'), id = x.createImageData(640, 360);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    x.putImageData(id, 0, 0); GRAIN.push(g);
  }
  VIG = mk(); {
    const x = VIG.getContext('2d'), g = x.createRadialGradient(CX, CY, 300, CX, CY, 1150);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.5)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
  }
  // formes (même nombre de points, départ en haut → morphs propres)
  const N = 360, R = 250;
  SHAPES = [
    resample(poly(180, R), N),
    resample(poly(4, R * 1.22, Math.PI / 4), N),
    resample(poly(3, R * 1.38), N),
    resample(star(5, R * 1.35, R * 0.58), N),
    resample(poly(180, R), N),
  ];
  // particules
  const A = shuffle(sampleText('EVERY', 390, 6), r), Bt = shuffle(sampleText('FRAME', 390, 6), r);
  for (let i = 0; i < PN; i++) {
    const a = A[i % A.length], b = Bt[i % Bt.length];
    PA.push([a[0] + (r() - .5) * 4, a[1] + (r() - .5) * 4]);
    PB.push([b[0] + (r() - .5) * 4, b[1] + (r() - .5) * 4]);
    const ang = r() * TAU, rad = 250 + r() * 750;
    const ex = PB[i][0] - CX + (r() - .5) * 300, ey = PB[i][1] - CY + (r() - .5) * 300, el = Math.hypot(ex, ey) || 1;
    const u = clamp((PA[i][0] - 380) / (W - 760));
    PD.push({
      d1: r() * .35, d2: (PA[i][0] / W) * .55, d3: r() * .12, ph: r() * TAU,
      cx: CX + Math.cos(ang) * rad, cy: CY + Math.sin(ang) * rad * .6,
      ox: (r() - .5) * 700, oy: (r() - .5) * 500, ex: ex / el, ey: ey / el,
      col: r() < .08 ? 3 : Math.min(2, Math.floor(u * 3)),
    });
  }
  // 3D
  const U = 64, V = 22;
  for (let u = 0; u < U; u++) for (let v = 0; v < V; v++) {
    const a = u / U * TAU, b = v / V * TAU, R1 = 300, r1 = 115;
    TOR.push([(R1 + r1 * Math.cos(b)) * Math.cos(a), r1 * Math.sin(b), (R1 + r1 * Math.cos(b)) * Math.sin(a)]);
  }
  const n = TOR.length;
  for (let i = 0; i < n; i++) {
    const y = 1 - 2 * (i + .5) / n, rr = Math.sqrt(1 - y * y), phi = i * 2.399963;
    SPH.push([Math.cos(phi) * rr * 330, y * 330, Math.sin(phi) * rr * 330]);
  }
}

// ─── S1 · étincelle → SHOWREEL (temps 0–4) ────────────────────────────────
function s1(c, t) {
  const b = t / B;
  c.save();
  if (b < 2) {
    bg(c, C.ink);
    for (let k = 0; k < 3; k++) {
      const p = prog(b, .12 + k * .16, .95 + k * .16);
      if (p > 0 && p < 1) {
        c.strokeStyle = C.cream; c.globalAlpha = (1 - p) * .5; c.lineWidth = 2;
        c.beginPath(); c.arc(CX, CY, 24 + E.outCubic(p) * 300, 0, TAU); c.stroke();
      }
    }
    c.globalAlpha = 1;
    const appear = E.outBack(prog(b, .05, .5));
    const ant = E.inOutCubic(prog(b, .55, 1.0));
    const ln = prog(b, 1.0, 1.6), th = prog(b, 1.55, 2.0);
    c.fillStyle = C.coral;
    if (ln <= 0) {
      const r = 18 * appear;
      c.beginPath(); c.ellipse(CX, CY, r * lerp(1, .6, ant), r * lerp(1, 1.4, ant), 0, 0, TAU); c.fill();
    } else {
      const w = lerp(22, W + 300, E.outExpo(ln));
      const h = lerp(lerp(25, 6, E.outExpo(clamp(ln * 4))), H + 300, E.inOutExpo(th));
      c.beginPath(); c.roundRect(CX - w / 2, CY - h / 2, w, h, Math.min(h / 2, 12)); c.fill();
      // légendes le long du trait
      const ty = prog(b, 1.15, 1.6), fade = 1 - prog(b, 1.6, 1.8);
      if (ty > 0 && fade > 0) {
        c.globalAlpha = fade; c.fillStyle = C.cream; c.font = '500 22px Mono'; c.letterSpacing = '4px';
        const s1t = 'SHOWREEL — 2026', s2t = 'MOTION DESIGN';
        c.textAlign = 'left'; c.fillText(s1t.slice(0, Math.ceil(ty * s1t.length)), 120, CY - 40);
        c.textAlign = 'right'; c.fillText(s2t.slice(0, Math.ceil(ty * s2t.length)), W - 120, CY - 40);
        c.letterSpacing = '0px';
      }
    }
  } else {
    bg(c, C.coral);
    const z = 1 + .06 * E.outCubic(prog(b, 2, 4));
    c.translate(CX, CY); c.scale(z, z); c.translate(-CX, -CY);
    const size = 300, font = `${size}px Anton`, lay = layout(c, 'SHOWREEL', font, 8);
    c.save();
    c.beginPath(); c.rect(0, CY - 220, W, 330); c.clip();
    c.fillStyle = C.ink; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    lay.L.forEach((l, i) => {
      const p = E.outExpo(prog(b, 2.0 + i * .06, 2.0 + i * .06 + .9));
      const q = E.inExpo(prog(b, 3.62 + i * .025, 3.95 + i * .025));
      const y = CY + 100 + (1 - p) * 330 - q * 340;
      c.fillText(l.ch, CX - lay.total / 2 + l.x, y);
    });
    c.restore();
    // trait + année
    const rl = E.inOutExpo(prog(b, 2.35, 3.1)), rq = E.inExpo(prog(b, 3.6, 3.95));
    c.fillStyle = C.ink;
    c.fillRect(CX - lay.total / 2 + lay.total * rq, CY + 140, lay.total * (rl - rq), 6);
    const yp = E.outBack(prog(b, 2.75, 3.25)), yq = prog(b, 3.7, 3.95);
    if (yp > 0 && yq < 1) {
      c.save();
      c.translate(CX + lay.total / 2 - 150, CY + 250);
      c.rotate(-.08 + (1 - yp) * .5); c.scale(yp * (1 - yq), yp * (1 - yq));
      c.fillStyle = C.cream; c.font = 'italic 150px Serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      c.fillText('2026', 0, 0);
      c.restore();
    }
    c.font = '500 22px Mono'; c.letterSpacing = '4px'; c.fillStyle = C.ink;
    c.globalAlpha = prog(b, 2.4, 2.8) * (1 - prog(b, 3.6, 3.8));
    c.textAlign = 'left'; c.fillText('CLAUDE', CX - lay.total / 2, CY - 190);
    c.textAlign = 'right'; c.fillText('VOL. 01', CX + lay.total / 2, CY - 190);
    c.letterSpacing = '0px';
  }
  c.restore();
}

// ─── S2 · MOTION → EMOTION, marquee (temps 4–8) ──────────────────────────
function marquee(c, lb) {
  bg(c, C.lime);
  const open = E.outExpo(prog(lb, 1.85, 2.35)), close = E.inExpo(prog(lb, 3.3, 3.7));
  const rowH = 172, word = 'EMOTION ✺ ', rep = word.repeat(8);
  c.font = '160px Anton'; c.textBaseline = 'middle'; c.textAlign = 'left';
  const period = c.measureText(word).width;
  for (let i = 0; i < 7; i++) {
    const k = i - 3;
    const y = CY + k * rowH * open * (1 - close);
    const dir = i % 2 ? 1 : -1;
    const off = ((dir * lb * 520 + i * 211) % period + period) % period;
    c.save();
    c.translate(0, y); c.scale(1, lerp(.2, 1, open) * (1 - close * .9));
    if (k === 0) { c.fillStyle = C.ink; c.fillRect(-10, -rowH / 2 + 6, W + 20, rowH - 12); c.fillStyle = C.lime; c.fillText(rep, -off, 8); }
    else if (i % 2) { c.fillStyle = C.ink; c.fillText(rep, -off, 8); }
    else { c.strokeStyle = C.ink; c.lineWidth = 3; c.strokeText(rep, -off, 8); }
    c.restore();
  }
}

function s2(c, t) {
  const lb = t / B - 4;
  c.save();
  if (lb < 2.1) {
    bg(c, C.ink);
    const size = 360, font = `${size}px Anton`;
    const A = layout(c, 'MOTION', font, 6), Bm = layout(c, 'EMOTION', font, 6);
    c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    const base = CY + 130;
    for (let i = 0; i < 6; i++) {
      const p = prog(lb, i * .06, i * .06 + .75);
      const drop = E.outBack(p);
      const xa = CX - A.total / 2 + A.L[i].x, xb = CX - Bm.total / 2 + Bm.L[i + 1].x;
      const pp = E.outBack(prog(lb, 1.0 + i * .025, 1.0 + i * .025 + .4));
      const x = lerp(xa, xb, pp);
      const y = lerp(-300, base, drop);
      const hit = Math.exp(-Math.max(0, lb - 1.0 - i * .025) * 14) * (lb > 1 ? 1 : 0);
      c.save();
      c.translate(x + A.L[i].w / 2, y);
      c.rotate((1 - drop) * .5 * (i % 2 ? 1 : -1));
      c.scale(1 - hit * .25, 1 + hit * .18);
      c.fillStyle = C.cream; c.fillText(A.L[i].ch, -A.L[i].w / 2, 0);
      c.restore();
    }
    // le E qui entre et pousse
    const e = prog(lb, .78, 1.02);
    if (e > 0) {
      const xe = CX - Bm.total / 2 + Bm.L[0].x;
      const x = lerp(-420, xe, E.inCubic(e));
      const sq = Math.exp(-Math.max(0, lb - 1.02) * 12) * (lb > 1.02 ? 1 : 0);
      c.save(); c.translate(x + Bm.L[0].w / 2, base);
      c.scale(1 + (1 - e) * .3 - sq * .2, 1 - (1 - e) * .15 + sq * .15);
      c.fillStyle = C.coral; c.fillText('E', -Bm.L[0].w / 2, 0);
      c.restore();
    }
    const cap = prog(lb, 1.35, 1.6);
    if (cap > 0) {
      c.globalAlpha = cap; c.fillStyle = C.cream; c.font = 'italic 64px Serif'; c.textAlign = 'center';
      c.fillText('same letters, one more feeling', CX, base + 120 + (1 - E.outCubic(cap)) * 30);
      c.globalAlpha = 1;
    }
    if (lb > 1.85) {
      const h = H * E.inOutExpo(prog(lb, 1.85, 2.1)) + 2;
      c.save(); c.beginPath(); c.rect(-200, CY - h / 2, W + 400, h); c.clip(); marquee(c, lb); c.restore();
    }
  } else {
    marquee(c, lb);
  }
  // iris bleu → S3
  const ir = E.inOutExpo(prog(lb, 3.5, 4.0));
  if (ir > 0) {
    c.save(); c.beginPath(); c.arc(CX, CY, ir * 1200, 0, TAU); c.clip(); s3(c, t); c.restore();
  }
  c.restore();
}

// ─── S3 · formes et morphs (temps 8–12) ──────────────────────────────────
function shapeAt(lb) {
  const k = clamp(Math.floor(lb), 0, 3);
  const p = E.inOutExpo(prog(lb, k + .5, k + 1));
  const a = SHAPES[k], b = SHAPES[k + 1];
  const pts = a.map((q, i) => [lerp(q[0], b[i][0], p), lerp(q[1], b[i][1], p)]);
  const rot = (k + p) * Math.PI / 2 + lb * .2;
  let sc = E.outBack(prog(lb, 0, .5));
  const fr = lb - Math.floor(lb);
  if (lb >= 1) sc *= 1 + .07 * Math.exp(-fr * 9);
  sc *= lerp(1, .035, E.inExpo(prog(lb, 3.45, 3.92)));
  return { pts, rot, sc };
}
function tracePts(c, s, extra = 1) {
  c.beginPath();
  s.pts.forEach((q, i) => {
    const cs = Math.cos(s.rot), sn = Math.sin(s.rot);
    const x = CX + (q[0] * cs - q[1] * sn) * s.sc * extra, y = CY + (q[0] * sn + q[1] * cs) * s.sc * extra;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  });
  c.closePath();
}
function s3(c, t) {
  const lb = t / B - 8;
  c.save();
  bg(c, C.blue);
  // grille de points
  c.fillStyle = 'rgba(243,238,227,0.16)';
  const off = (lb * 14) % 48;
  for (let y = -48; y < H + 48; y += 48) for (let x = -48; x < W + 48; x += 48) c.fillRect(x + off - 1.5, y - off * .5 - 1.5, 3, 3);
  // anneaux sur le temps
  for (let k = 1; k <= 3; k++) {
    const p = prog(lb, k, k + .9);
    if (p > 0 && p < 1) {
      c.strokeStyle = C.lime; c.lineWidth = 10 * (1 - p); c.globalAlpha = 1 - p * .6;
      c.beginPath(); c.arc(CX, CY, 260 + E.outExpo(p) * 700, 0, TAU); c.stroke();
    }
  }
  c.globalAlpha = 1;
  // traînée
  for (let j = 6; j >= 1; j--) {
    const s = shapeAt(lb - j * .045);
    c.strokeStyle = C.cream; c.lineWidth = 2.5; c.globalAlpha = (1 - j / 7) * .55;
    tracePts(c, s, 1 + j * .05); c.stroke();
  }
  c.globalAlpha = 1;
  const s = shapeAt(lb);
  c.fillStyle = C.cream; tracePts(c, s); c.fill();
  // forme imbriquée en contre-rotation
  const inner = { pts: s.pts, rot: -s.rot * 1.5, sc: s.sc * .5 };
  c.strokeStyle = C.blue; c.lineWidth = 8; tracePts(c, inner); c.stroke();
  const inner2 = { pts: s.pts, rot: s.rot * 2.2, sc: s.sc * .22 };
  c.fillStyle = C.coral; tracePts(c, inner2); c.fill();
  // satellites
  const sat = [[C.pink, 1, 0], [C.lime, -.7, 2], [C.coral, .5, 4]];
  sat.forEach(([col, sp, ph], i) => {
    const a = lb * sp * Math.PI + ph, rr = (380 + i * 40) * E.outBack(prog(lb, .2 + i * .1, .8 + i * .1)) * (1 - E.inExpo(prog(lb, 3.3, 3.8)));
    c.fillStyle = col; c.beginPath(); c.arc(CX + Math.cos(a) * rr * 1.3, CY + Math.sin(a) * rr * .55, 16, 0, TAU); c.fill();
  });
  // l'iris se referme sur un point
  const ir = E.inExpo(prog(lb, 3.35, 3.9));
  if (ir > 0) {
    c.fillStyle = C.ink; c.beginPath(); c.rect(-200, -200, W + 400, H + 400); c.arc(CX, CY, lerp(1300, 0, ir), 0, TAU); c.fill('evenodd');
    c.fillStyle = C.cream; c.beginPath(); c.arc(CX, CY, 9 * prog(lb, 3.6, 3.9), 0, TAU); c.fill();
  }
  c.restore();
}

// ─── S4 · particules EVERY → FRAME (temps 12–16) ─────────────────────────
function ppos(i, lb) {
  const d = PD[i], a = PA[i], b = PB[i];
  let x, y;
  if (lb < 2.2) {
    const p = E.outExpo(prog(lb, d.d1, d.d1 + 1.15)), q = 1 - p;
    x = q * q * CX + 2 * q * p * d.cx + p * p * a[0]; y = q * q * CY + 2 * q * p * d.cy + p * p * a[1];
  } else if (lb < 3.5) {
    const s = 2.2 + d.d2, p = E.inOutCubic(prog(lb, s, s + .75)), q = 1 - p;
    const mx = (a[0] + b[0]) / 2 + d.ox, my = (a[1] + b[1]) / 2 + d.oy;
    x = q * q * a[0] + 2 * q * p * mx + p * p * b[0]; y = q * q * a[1] + 2 * q * p * my + p * p * b[1];
  } else {
    const p = E.inExpo(prog(lb, 3.5 + d.d3, 4.0));
    x = b[0] + d.ex * p * 2000; y = b[1] + d.ey * p * 2000;
  }
  return [x + Math.sin(lb * 7 + d.ph) * 1.3, y + Math.cos(lb * 6 + d.ph) * 1.3];
}
function s4(c, t) {
  const lb = t / B - 12;
  c.save();
  bg(c, C.ink);
  const g = c.createRadialGradient(CX, CY, 0, CX, CY, 900);
  g.addColorStop(0, 'rgba(122,46,255,0.22)'); g.addColorStop(1, 'rgba(122,46,255,0)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const pc = P.getContext('2d');
  pc.setTransform(1, 0, 0, 1, 0, 0); pc.globalCompositeOperation = 'source-over'; pc.clearRect(0, 0, W, H);
  pc.globalCompositeOperation = 'lighter';
  const cols = [C.coral, C.pink, C.violet, C.lime];
  const dots = cols.map(() => new Path2D()), lines = cols.map(() => new Path2D());
  for (let i = 0; i < PN; i++) {
    const [x, y] = ppos(i, lb), [px, py] = ppos(i, lb - .05), k = PD[i].col;
    dots[k].rect(x - 1.7, y - 1.7, 3.4, 3.4);
    if (Math.abs(x - px) + Math.abs(y - py) > 6) { lines[k].moveTo(px, py); lines[k].lineTo(x, y); }
  }
  pc.lineWidth = 2.2;
  cols.forEach((col, k) => { pc.fillStyle = col; pc.fill(dots[k]); pc.strokeStyle = col; pc.stroke(lines[k]); });
  c.globalCompositeOperation = 'lighter';
  c.filter = 'blur(12px)'; c.globalAlpha = .85; c.drawImage(P, 0, 0);
  c.filter = 'none'; c.globalAlpha = 1; c.drawImage(P, 0, 0);
  c.globalCompositeOperation = 'source-over';
  const cap = prog(lb, .9, 1.3) * (1 - prog(lb, 3.4, 3.6));
  if (cap > 0) {
    c.globalAlpha = cap; c.fillStyle = C.lime; c.font = '500 22px Mono'; c.letterSpacing = '5px'; c.textAlign = 'center';
    c.fillText(`${PN} PARTICLES  ·  1 IDEA`, CX, H - 190);
    c.letterSpacing = '0px';
  }
  c.restore();
}

// ─── S5 · espace 3D (temps 16–20) ────────────────────────────────────────
function s5(c, t) {
  const lb = t / B - 16;
  c.save();
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#06050D'); g.addColorStop(.58, '#1C0B3F'); g.addColorStop(.62, '#2A0E4A'); g.addColorStop(1, '#06050D');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  c.translate(CX, CY); c.rotate(Math.sin(lb * 1.1) * .035); c.translate(-CX, -CY);
  const f = 1000, D = 1300;
  const proj = (x, y, z) => { const s = f / (z + D); return [CX + x * s, CY + y * s, s]; };
  // sol
  const ga = prog(lb, 0, .7);
  const gy = 470, scroll = (lb * B * 1100) % 250;
  c.strokeStyle = C.lime; c.lineWidth = 1.6;
  for (let k = 0; k < 40; k++) {
    const z = k * 250 - scroll - 700;
    if (z < -D + 90) continue;
    const p1 = proj(-6000, gy, z), p2 = proj(6000, gy, z);
    c.globalAlpha = ga * .4 * clamp(1 - z / 9000) * clamp((z + D - 90) / 300);
    c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
  }
  c.globalAlpha = ga * .22;
  for (let xg = -6000; xg <= 6000; xg += 250) {
    const p1 = proj(xg, gy, -D + 100), p2 = proj(xg, gy, 9500);
    c.beginPath(); c.moveTo(p1[0], p1[1]); c.lineTo(p2[0], p2[1]); c.stroke();
  }
  c.globalAlpha = 1;
  const hz = proj(0, gy, 9500)[1];
  const hg = c.createRadialGradient(CX, hz, 0, CX, hz, 900);
  hg.addColorStop(0, 'rgba(255,46,154,0.35)'); hg.addColorStop(1, 'rgba(255,46,154,0)');
  c.fillStyle = hg; c.fillRect(0, hz - 400, W, 800);
  // nuage de points : tore → sphère liquide
  const ent = E.outExpo(prog(lb, 0, 1.1));
  const zoff = lerp(5000, 0, ent);
  const m = E.inOutExpo(prog(lb, 1.9, 2.5));
  const ry = lb * 1.15 - (1 - ent) * 5, rx = .5 + Math.sin(lb * 1.3) * .25;
  const cyr = Math.cos(ry), syr = Math.sin(ry), cxr = Math.cos(rx), sxr = Math.sin(rx);
  const fr = lb - Math.floor(lb), br = 1 + (lb >= 1 ? .07 * Math.exp(-fr * 8) : 0);
  const wob = prog(lb, 2.4, 2.9) * (1 - prog(lb, 3.5, 3.9));
  const pts = [];
  for (let i = 0; i < TOR.length; i++) {
    const a = TOR[i], s = SPH[i];
    const w = 1 + .12 * wob * Math.sin(s[1] * .025 + lb * 9) * Math.cos(s[0] * .02 - lb * 5);
    let x = lerp(a[0], s[0] * w, m) * br, y = lerp(a[1], s[1] * w, m) * br, z = lerp(a[2], s[2] * w, m) * br;
    const x1 = x * cyr + z * syr, z1 = -x * syr + z * cyr;
    const y1 = y * cxr - z1 * sxr, z2 = y * sxr + z1 * cxr;
    pts.push([x1, y1 - 60, z2 + zoff, z2]);
  }
  pts.sort((p, q) => q[2] - p[2]);
  // anneau de texte
  const RT = 'MOTION • DESIGN • TYPE • SPACE • CODE • RHYTHM • ';
  const n = RT.length, tilt = .34, roll = -.12;
  const ring = [];
  for (let i = 0; i < n; i++) {
    const vis = E.outBack(prog(lb, .4 + i / n * .9, .4 + i / n * .9 + .3));
    if (vis <= 0) continue;
    const a = i / n * TAU - lb * .75;
    const pos = aa => {
      let x = Math.cos(aa) * 620, y = 0, z = Math.sin(aa) * 620;
      const y1 = y * Math.cos(tilt) - z * Math.sin(tilt), z1 = y * Math.sin(tilt) + z * Math.cos(tilt);
      const x2 = x * Math.cos(roll) - y1 * Math.sin(roll), y2 = x * Math.sin(roll) + y1 * Math.cos(roll);
      return [x2, y2 - 60, z1 + zoff];
    };
    const p = pos(a), p2 = pos(a + .01);
    ring.push({ ch: RT[i], p, p2, vis });
  }
  const drawRing = back => {
    c.font = '700 54px SG'; c.textAlign = 'center'; c.textBaseline = 'middle';
    ring.forEach(r => {
      const isBack = r.p[2] - zoff > 0;
      if (isBack !== back) return;
      const a = proj(...r.p), b2 = proj(...r.p2);
      const dx = b2[0] - a[0], dy = b2[1] - a[1];
      c.save(); c.translate(a[0], a[1]);
      c.rotate(Math.atan(dy / (dx || 1e-6)));
      c.scale(a[2] * r.vis * Math.sign(dx || 1), a[2] * r.vis);
      c.globalAlpha = back ? .35 : 1;
      c.fillStyle = back ? C.pink : C.lime;
      c.fillText(r.ch, 0, 0);
      c.restore();
    });
    c.globalAlpha = 1;
  };
  drawRing(true);
  for (const p of pts) {
    const pr = proj(p[0], p[1], p[2]);
    const depth = clamp((p[3] + 400) / 800);
    c.fillStyle = mixHex(C.cream, C.violet, depth);
    if (depth < .35) c.fillStyle = mixHex(C.coral, C.cream, depth / .35);
    c.beginPath(); c.arc(pr[0], pr[1], Math.max(.6, 4.6 * pr[2]), 0, TAU); c.fill();
  }
  drawRing(false);
  c.restore();
}

// ─── S6 · design d'information (temps 20–24) ─────────────────────────────
function chartY(x, X0, X1, base, h) {
  const u = (x - X0) / (X1 - X0);
  return base - (.1 + .64 * u + .11 * Math.sin(u * 9) + .05 * Math.sin(u * 23)) * h;
}
function s6(c, t) {
  const lb = t / B - 20;
  c.save();
  bg(c, C.cream);
  c.strokeStyle = 'rgba(10,10,15,0.07)'; c.lineWidth = 1;
  for (let k = 0; k <= 12; k++) { const x = 140 + k * 1640 / 12; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  c.fillStyle = C.ink; c.font = '500 20px Mono'; c.letterSpacing = '4px'; c.textBaseline = 'alphabetic';
  c.textAlign = 'left'; c.fillText('BY THE NUMBERS', 140, 135);
  c.textAlign = 'right'; c.fillText('FIG. 05 — SHOWREEL/26', 1780, 135);
  c.letterSpacing = '0px';
  c.fillRect(140, 160, 1640 * E.outExpo(prog(lb, -.4, .5)), 3);
  const cols = [
    { from: 0, to: 900, label: 'FRAMES', desc: 'drawn one by one' },
    { from: 0, to: 60, label: 'FPS', desc: 'silky, obviously' },
    { from: 100, to: 0, label: 'PLUGINS', desc: 'just a canvas & math' },
  ];
  cols.forEach((col, i) => {
    const x0 = 140 + i * 560, s = .1 + i * .3;
    const rise = E.outExpo(prog(lb, s, s + .55)), cp = E.outExpo(prog(lb, s, s + 1.4));
    const val = Math.round(lerp(col.from, col.to, cp));
    c.save(); c.beginPath(); c.rect(x0 - 20, 200, 560, 340); c.clip();
    c.fillStyle = i === 2 ? C.coral : C.ink; c.font = '300px Anton'; c.textAlign = 'left';
    c.fillText(String(val), x0 - 6, 520 + (1 - rise) * 340);
    c.restore();
    c.globalAlpha = rise; c.textAlign = 'left';
    c.fillStyle = C.coral; c.font = '700 30px SG'; c.letterSpacing = '8px'; c.fillText(col.label, x0, 582);
    c.letterSpacing = '0px';
    c.fillStyle = 'rgba(10,10,15,0.6)'; c.font = '500 24px SG'; c.fillText(col.desc, x0, 622);
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(10,10,15,0.1)'; c.fillRect(x0, 655, 480 * rise, 8);
    c.fillStyle = C.ink; c.fillRect(x0, 655, 480 * val / Math.max(col.from, col.to), 8);
    if (i) { c.fillStyle = 'rgba(10,10,15,0.25)'; c.fillRect(x0 - 36, 230, 2, 440 * E.outExpo(prog(lb, s - .1, s + .5))); }
  });
  // courbe
  const X0 = 140, X1 = 1780, base = 975, ht = 200;
  const p = E.inOutCubic(prog(lb, .6, 3.0)), xe = X0 + (X1 - X0) * p;
  c.fillStyle = 'rgba(10,10,15,0.3)'; c.fillRect(X0, base, (X1 - X0) * E.outExpo(prog(lb, .4, 1.2)), 2);
  c.font = '500 16px Mono'; c.textAlign = 'center';
  for (let k = 0; k <= 15; k++) {
    const x = X0 + k * (X1 - X0) / 15;
    c.globalAlpha = .45 * prog(lb, .4 + k * .04, .7 + k * .04);
    c.fillText(String(k).padStart(2, '0'), x, base + 30);
  }
  c.globalAlpha = 1;
  if (p > 0) {
    const path = new Path2D();
    path.moveTo(X0, chartY(X0, X0, X1, base, ht));
    for (let x = X0; x <= xe; x += 6) path.lineTo(x, chartY(x, X0, X1, base, ht));
    path.lineTo(xe, chartY(xe, X0, X1, base, ht));
    const area = new Path2D(path); area.lineTo(xe, base); area.lineTo(X0, base); area.closePath();
    c.fillStyle = 'rgba(255,77,46,0.16)'; c.fill(area);
    c.strokeStyle = C.coral; c.lineWidth = 5; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(path);
    const ye = chartY(xe, X0, X1, base, ht);
    const fr = (lb % 1);
    c.strokeStyle = C.coral; c.lineWidth = 3; c.globalAlpha = 1 - fr;
    c.beginPath(); c.arc(xe, ye, 12 + fr * 40, 0, TAU); c.stroke(); c.globalAlpha = 1;
    c.fillStyle = C.coral; c.beginPath(); c.arc(xe, ye, 12, 0, TAU); c.fill();
    const tag = `t=${(p * 15).toFixed(2)}s`;
    c.font = '500 18px Mono'; c.textAlign = 'left';
    const tw = c.measureText(tag).width, tx = Math.min(xe + 22, 1880 - tw - 20);
    c.fillStyle = C.ink; c.fillRect(tx, ye - 58, tw + 20, 32);
    c.fillStyle = C.cream; c.fillText(tag, tx + 10, ye - 36);
  }
  // l'encre sort du point → S7
  const q = E.inExpo(prog(lb, 3.45, 4.0));
  if (q > 0) { c.fillStyle = C.ink; c.beginPath(); c.arc(X1, chartY(X1, X0, X1, base, ht), q * 2400, 0, TAU); c.fill(); }
  c.restore();
}

// ─── S7 · liquide puis coupes glitch (temps 24–28) ───────────────────────
const CUTS = [
  ['TYPE', C.coral, C.ink], ['SHAPE', C.ink, C.lime], ['SPACE', C.blue, C.cream], ['TIME', C.lime, C.ink],
  ['RHYTHM', C.pink, C.ink], ['COLOR', C.ink, C.coral], ['DEPTH', C.violet, C.cream], ['FEEL', C.cream, C.ink],
];
function s7(c, t) {
  const lb = t / B - 24;
  c.save();
  if (lb < 2) {
    bg(c, C.ink);
    // metaballs calculés au pixel (960×540), couche RGBA transparente
    const grow = E.outBack(prog(lb, 0, .6)) * (1 - E.inExpo(prog(lb, 1.7, 2)));
    const pulse = 1 + .16 * Math.exp(-(lb % 1) * 7);
    const blobs = [];
    for (let j = 0; j < 10; j++) {
      blobs.push([
        480 + Math.sin(lb * (1.0 + j * .21) * 1.8 + j * 2.1) * (80 + j * 30),
        270 + Math.cos(lb * (1.2 + j * .17) * 1.6 + j * 1.3) * (44 + j * 14),
        (28 + (j % 3) * 16) * grow * pulse]);
    }
    blobs.push([480, 270, 70 * grow * pulse]);
    const bw = 960, bh = 540, id = BLOB_ID, d = id.data;
    const ang = lb * 1.3, ca = Math.cos(ang), sa = Math.sin(ang);
    const stops = [[255, 77, 46], [255, 46, 154], [122, 46, 255]];
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      let f = 0, gx = 0, gy = 0;
      for (let k = 0; k < blobs.length; k++) {
        const dx = x - blobs[k][0], dy = y - blobs[k][1], r = blobs[k][2], d2 = dx * dx + dy * dy + 1, v = r * r / d2;
        f += v; gx += v * dx / d2; gy += v * dy / d2;
      }
      const i = (y * bw + x) * 4;
      const a = clamp((f - 1) / (2 * Math.hypot(gx, gy) + 1e-6) + .5);
      if (a <= 0) { d[i + 3] = 0; continue; }
      const u = clamp(((x - 480) * ca + (y - 270) * sa) / 900 + .5) * 2, k0 = Math.min(1, Math.floor(u)), fu = u - k0;
      const hl = clamp((f - 1) * .5) * 38;
      d[i] = lerp(stops[k0][0], stops[k0 + 1][0], fu) + hl; d[i + 1] = lerp(stops[k0][1], stops[k0 + 1][1], fu) + hl; d[i + 2] = lerp(stops[k0][2], stops[k0 + 1][2], fu) + hl;
      d[i + 3] = a * 255;
    }
    const bx = BLOB.getContext('2d'); bx.putImageData(id, 0, 0);
    c.imageSmoothingQuality = 'high';
    c.drawImage(BLOB, 0, 0, W, H);
    // texte : crème hors des gouttes, encre dedans
    const lay = layout(c, 'FLUID', '420px Anton', 10);
    const txt = (cx2, col) => {
      cx2.setTransform(1, 0, 0, 1, 0, 0); cx2.globalCompositeOperation = 'source-over'; cx2.clearRect(0, 0, W, H);
      cx2.font = '420px Anton'; cx2.letterSpacing = '0px'; cx2.fillStyle = col; cx2.textBaseline = 'middle'; cx2.textAlign = 'left';
      lay.L.forEach((l, i) => {
        const p = E.outExpo(prog(lb, .25 + i * .06, .85 + i * .06)), q = E.inExpo(prog(lb, 1.7 + i * .03, 1.98));
        cx2.save(); cx2.translate(CX - lay.total / 2 + l.x + l.w / 2, CY + 20 + (1 - p) * 120 - q * 120);
        cx2.scale(1, p * (1 - q)); cx2.fillText(l.ch, -l.w / 2, 0); cx2.restore();
      });
    };
    const tA = T.getContext('2d'), tB = CR.getContext('2d');
    txt(tA, C.cream); tA.globalCompositeOperation = 'destination-out'; tA.drawImage(BLOB, 0, 0, W, H);
    txt(tB, C.ink); tB.globalCompositeOperation = 'destination-in'; tB.drawImage(BLOB, 0, 0, W, H);
    c.drawImage(T, 0, 0); c.drawImage(CR, 0, 0);
    c.globalCompositeOperation = 'source-over';
  } else {
    const k = Math.min(7, Math.floor((lb - 2) * 2)), u = (lb - 2) * 2 - k;
    const [word, bgc, fg] = CUTS[k];
    bg(c, bgc);
    c.strokeStyle = fg; c.fillStyle = fg;
    if (k % 3 === 0) {
      c.globalAlpha = .3; c.lineWidth = 3;
      c.beginPath(); c.arc(CX, CY, 440 + u * 60, 0, TAU); c.stroke();
      c.setLineDash([30, 22]); c.lineDashOffset = -u * 200;
      c.beginPath(); c.arc(CX, CY, 500 + u * 60, 0, TAU); c.stroke(); c.setLineDash([]);
    } else if (k % 3 === 1) {
      c.globalAlpha = .14; c.lineWidth = 26;
      for (let x = -H; x < W + H; x += 80) { c.beginPath(); c.moveTo(x + u * 160, 0); c.lineTo(x + u * 160 - H, H); c.stroke(); }
    } else {
      c.globalAlpha = .35; c.lineWidth = 3;
      for (let y = 90; y < H; y += 150) for (let x = 90; x < W; x += 150) {
        const s = 12 * E.outBack(clamp(u * 3 - (x + y) / 3000));
        c.beginPath(); c.moveTo(x - s, y); c.lineTo(x + s, y); c.moveTo(x, y - s); c.lineTo(x, y + s); c.stroke();
      }
    }
    c.globalAlpha = 1;
    c.font = '440px Anton'; c.textAlign = 'center'; c.textBaseline = 'middle';
    const w = c.measureText(word).width, s = Math.min(1, 1600 / w) * lerp(1.18, 1, E.outExpo(u));
    c.save(); c.translate(CX, CY + 20); c.scale(s, s); c.fillText(word, 0, 0); c.restore();
    c.font = '500 22px Mono'; c.letterSpacing = '4px'; c.textAlign = 'left';
    c.fillText(`${String(k + 1).padStart(2, '0')}/08`, 140, CY - 250);
    c.letterSpacing = '0px';
    const fl = E.inExpo(prog(lb, 3.72, 4));
    if (fl > 0) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(-200, -200, W + 400, H + 400); }
  }
  c.restore();
}

// ─── S8 · signature (temps 28–32) ────────────────────────────────────────
function s8(c, t) {
  const lb = t / B - 28;
  c.save();
  bg(c, C.ink);
  const z = 1 + .04 * E.outCubic(prog(lb, 0, 4));
  c.translate(CX, CY); c.scale(z, z); c.translate(-CX, -CY);
  const font = 'italic 300px Serif', lay = layout(c, 'Claude', font, 0);
  const tx = CX - lay.total / 2 - 24, by = CY + 60;
  c.save(); c.beginPath(); c.rect(tx - 80, by - 300, lay.total + 200, 385); c.clip();
  c.fillStyle = C.cream; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  lay.L.forEach((l, i) => {
    const p = E.outExpo(prog(lb, .08 + i * .07, .08 + i * .07 + .9));
    c.fillText(l.ch, tx + l.x, by + (1 - p) * 330);
  });
  c.restore();
  // le point du début revient, et devient le point final
  const dx = tx + lay.total + 30, dr = 22, land = by - dr;
  if (lb > 1.5) {
    let y, sx = 1, sy = 1;
    if (lb < 2) { const p = E.inQuad(prog(lb, 1.5, 2)); y = lerp(-80, land, p); sy = 1 + .35 * p; sx = 1 - .15 * p; }
    else if (lb < 2.5) { const p = prog(lb, 2, 2.5); y = land - Math.sin(Math.PI * p) * 90; }
    else y = land;
    const s1i = lb >= 2 ? Math.exp(-(lb - 2) * 18) : 0, s2i = lb >= 2.5 ? Math.exp(-(lb - 2.5) * 16) * .5 : 0;
    const sq = s1i + s2i;
    if (lb >= 2) { sx = 1 + sq * .6; sy = 1 - sq * .45; }
    c.fillStyle = C.coral;
    c.beginPath(); c.ellipse(dx, y + dr * (1 - sy), dr * sx, dr * sy, 0, 0, TAU); c.fill();
    [2, 2.5].forEach((tt, j) => {
      const p = prog(lb, tt, tt + .8);
      if (p > 0 && p < 1) {
        c.strokeStyle = C.coral; c.lineWidth = 3 * (1 - p); c.globalAlpha = 1 - p;
        c.beginPath(); c.ellipse(dx, land + dr, 30 + E.outCubic(p) * (160 - j * 60), (30 + E.outCubic(p) * (160 - j * 60)) * .3, 0, 0, TAU); c.stroke();
        c.globalAlpha = 1;
      }
    });
  }
  // filet + titre
  const rw = 660 * E.inOutExpo(prog(lb, .6, 1.3));
  c.fillStyle = C.coral; c.fillRect(CX - rw / 2, by + 75, rw, 3);
  const title = 'MOTION DESIGNER';
  c.font = '700 44px SG'; c.letterSpacing = '18px'; c.textAlign = 'left'; c.textBaseline = 'alphabetic';
  const tw = c.measureText(title).width - 18, n = Math.floor(prog(lb, .9, 1.6) * title.length);
  c.fillStyle = C.cream; c.fillText(title.slice(0, n), CX - tw / 2, by + 150);
  if (lb > .9 && lb < 2.2 && (n < title.length || Math.floor(lb * 4) % 2 === 0)) {
    const cw = c.measureText(title.slice(0, n)).width;
    c.fillStyle = C.lime; c.fillRect(CX - tw / 2 + cw, by + 112, 22, 44);
  }
  c.letterSpacing = '3px'; c.font = '500 20px Mono'; c.textAlign = 'center';
  c.fillStyle = C.cream; c.globalAlpha = .5 * prog(lb, 1.7, 2.3);
  c.fillText('SHOWREEL 2026  ·  15 s  ·  900 FRAMES  ·  0 KEYFRAMES', CX, H - 120);
  c.globalAlpha = 1; c.letterSpacing = '0px';
  c.restore();
  const fl = 1 - E.outCubic(prog(lb, 0, .45));
  if (fl > 0) { c.fillStyle = `rgba(255,255,255,${fl})`; c.fillRect(0, 0, W, H); }
  const fo = prog(lb, 3.82, 4);
  if (fo > 0) { c.fillStyle = `rgba(0,0,0,${fo})`; c.fillRect(0, 0, W, H); }
}

// ─── caméra, post-prod, habillage ────────────────────────────────────────
const IMP = [[2, 9], [4, 14], [5, 7], [8, 11], [9, 4], [10, 4], [11, 4], [12, 12], [16, 12], [20, 9], [24, 10], [26, 6], [28, 16], [30, 7]];
function camera(t) {
  let x = 0, y = 0, r = 0, s = 0, ch = 0;
  for (const [bb, st] of IMP) {
    const dt = t - bb * B;
    if (dt < 0 || dt > .7) continue;
    const e = Math.exp(-dt * 11) * st;
    x += Math.sin(dt * 93 + bb) * e; y += Math.cos(dt * 81 + bb * 2) * e;
    r += Math.sin(dt * 57 + bb) * e * .0009; s += e * .0022; ch += e * .9;
  }
  const b = t / B;
  let slices = 0;
  if (b >= 26 && b < 28) {
    const u = (b - 26) * 2 % 1;
    ch += 34 * Math.pow(1 - u, 3); slices = u < .35 ? 1 - u / .35 : 0;
  }
  return { x, y, r, s: 1 + s, ch, slices };
}

function chroma(a, slices, t) {
  const tc = T.getContext('2d');
  tc.globalCompositeOperation = 'copy'; tc.drawImage(cv, 0, 0);
  [[CR, '#f00'], [CG, '#0f0'], [CB, '#00f']].forEach(([cn, col]) => {
    const x = cn.getContext('2d');
    x.globalCompositeOperation = 'copy'; x.drawImage(T, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = col; x.fillRect(0, 0, W, H);
  });
  ctx.save();
  ctx.globalCompositeOperation = 'copy'; ctx.drawImage(CG, 0, 0);
  ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(CR, -a, a * .15); ctx.drawImage(CB, a, -a * .15);
  ctx.restore();
  if (slices > 0) {
    tc.drawImage(cv, 0, 0);
    const r = rng(Math.floor(t * 30) + 11);
    for (let k = 0; k < 7; k++) {
      const y = r() * H, h = 12 + r() * 110, dx = (r() - .5) * 260 * slices;
      ctx.drawImage(T, 0, y, W, h, dx, y, W, h);
    }
  }
}

const SECTIONS = [[4, '01 — KINETIC TYPE'], [8, '02 — SHAPE & MORPH'], [12, '03 — PARTICLES'], [16, '04 — 3D SPACE'], [20, '05 — INFO DESIGN'], [24, '06 — LIQUID'], [26, '07 — CUTS & GLITCH']];
function hud(t) {
  const b = t / B, vis = prog(b, 4, 4.4) * (1 - prog(b, 27.7, 28));
  if (vis <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = 'difference'; ctx.globalAlpha = vis * .85;
  ctx.fillStyle = '#fff'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
  const m = 48, l = 26;
  [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => {
    ctx.beginPath(); ctx.moveTo(x, y + sy * l); ctx.lineTo(x, y); ctx.lineTo(x + sx * l, y); ctx.stroke();
  });
  ctx.font = '500 18px Mono'; ctx.letterSpacing = '2px'; ctx.textBaseline = 'middle';
  ctx.textAlign = 'left'; ctx.fillText('CLAUDE — SHOWREEL ’26', m + 42, m + 10);
  ctx.textAlign = 'right'; ctx.fillText('1920×1080 · 60 FPS · 128 BPM', W - m - 42, m + 10);
  const fr = Math.round(t * FPS), pad = n => String(n).padStart(2, '0');
  ctx.fillText(`00:00:${pad(Math.floor(fr / FPS))}:${pad(fr % FPS)}`, W - m - 42, H - m - 10);
  const beat = Math.floor(b) % 4;
  for (let k = 0; k < 4; k++) {
    const x = W - m - 290 + k * 18, y = H - m - 17;
    k === beat ? ctx.fillRect(x, y, 12, 12) : ctx.strokeRect(x + 1, y + 1, 10, 10);
  }
  let sec = SECTIONS[0];
  for (const s of SECTIONS) if (b >= s[0]) sec = s;
  const n = Math.ceil(prog(b, sec[0], sec[0] + .7) * sec[1].length);
  ctx.textAlign = 'left'; ctx.fillText(sec[1].slice(0, n), m + 42, H - m - 10);
  ctx.restore();
}

function draw(t) {
  const b = t / B;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  const cam = camera(t);
  ctx.translate(CX + cam.x, CY + cam.y); ctx.rotate(cam.r); ctx.scale(cam.s, cam.s); ctx.translate(-CX, -CY);
  if (b < 4) s1(ctx, t);
  else if (b < 8) s2(ctx, t);
  else if (b < 12) s3(ctx, t);
  else if (b < 16) s4(ctx, t);
  else if (b < 20) {
    s5(ctx, t);
    const w = E.inOutExpo(prog(b, 19.35, 20));
    if (w > 0) {
      const e = lerp(-700, W + 900, w);
      ctx.save();
      ctx.beginPath(); ctx.moveTo(-700, -200); ctx.lineTo(e + 300, -200); ctx.lineTo(e - 300, H + 200); ctx.lineTo(-700, H + 200); ctx.closePath();
      ctx.clip(); s6(ctx, t); ctx.restore();
      ctx.fillStyle = C.coral; ctx.beginPath();
      ctx.moveTo(e + 300, -200); ctx.lineTo(e + 380, -200); ctx.lineTo(e - 220, H + 200); ctx.lineTo(e - 300, H + 200); ctx.fill();
    }
  }
  else if (b < 24) s6(ctx, t);
  else if (b < 28) s7(ctx, t);
  else s8(ctx, t);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.filter = 'none';
  if (cam.ch > 1) chroma(cam.ch, cam.slices, t);
  hud(t);
  ctx.drawImage(VIG, 0, 0);
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .09;
  ctx.drawImage(GRAIN[Math.floor(t * FPS) % GRAIN.length], 0, 0, W, H);
  ctx.restore();
}

// ─── démarrage ───────────────────────────────────────────────────────────
window.__ready = (async () => {
  await Promise.all(['100px Anton', '500 20px SG', '700 20px SG', 'italic 100px Serif', '500 20px Mono'].map(f => document.fonts.load(f)));
  init();
  draw(0);
  return true;
})();
window.renderFrame = t => draw(t);

if (!location.search.includes('render')) {
  window.__ready.then(() => {
    const audio = document.getElementById('a');
    let t0 = null;
    const loop = now => {
      if (t0 === null) t0 = now;
      const t = ((now - t0) / 1000) % DUR;
      draw(t);
      requestAnimationFrame(loop);
    };
    document.body.addEventListener('click', () => { audio.currentTime = 0; audio.play(); t0 = null; });
    requestAnimationFrame(loop);
  });
} else document.body.classList.add('render');
