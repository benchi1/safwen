// Médine — Épisode 1 · Reel 1080x1920
// window.renderFrame(t) dessine l'image à l'instant t (secondes). Rendu : node render.js
'use strict';
const W = 1080, H = 1920, FPS = 30, VOFF = 0.6, DUR = 75;
window.CONFIG = { FPS, DUR };
const cv = document.getElementById('c');
let ctx = cv.getContext('2d');
if (location.search.includes('render')) document.body.classList.add('render');

// ---------- Données ----------
const v = x => x + VOFF; // temps voix -> temps vidéo
const SCENES = [
  { img: '01', t0: 0,        t1: v(7.2),   ar: 'يثرب',            fr: 'YATHRIB',                   z: [1.18, 1.04], cx: [0, 0],      cy: [0.35, 0],   fx: ['mist', 'dust'] },
  { img: '02', t0: v(7.2),   t1: v(17.2),  ar: 'الهجرة',           fr: "L'HÉGIRE · 622",            z: [1.12, 1.26], cx: [0, 0.1],    cy: [0.7, -0.6], fx: ['stars', 'dust'] },
  { img: '03', t0: v(17.2),  t1: v(25.4),  ar: 'المدينة المنوّرة', fr: 'LA VILLE ILLUMINÉE',        z: [1.04, 1.18], cx: [0, 0],      cy: [0.2, -0.1], fx: ['rays', 'dust'] },
  { img: '04', t0: v(25.4),  t1: v(29.65), ar: 'مسجد قُباء',       fr: 'QUBÂ · LA PREMIÈRE MOSQUÉE', z: [1.16, 1.06], cx: [-0.4, 0.3], cy: [0.1, 0],   fx: ['rays', 'dust'] },
  { img: '05', t0: v(29.65), t1: v(39.15), ar: 'المؤاخاة',         fr: 'LA FRATERNITÉ',             z: [1.05, 1.2],  cx: [0, -0.1],   cy: [0, 0.25],   fx: ['dust', 'lamp'] },
  { img: '06', t0: v(39.15), t1: v(49.0),  ar: 'المسجد النبوي',    fr: 'LA MOSQUÉE DU PROPHÈTE',    z: [1.22, 1.04], cx: [0, 0],      cy: [0.1, 0],    fx: ['rays', 'dust'] },
  { img: '07', t0: v(49.0),  t1: v(54.5),  ar: 'الروضة الشريفة',   fr: 'AR-RAWDAH',                 z: [1.04, 1.16], cx: [0, 0],      cy: [0.3, -0.2], fx: ['rays', 'sparkle'] },
  { img: '08', t0: v(54.5),  t1: v(61.4),  ar: 'القبة الخضراء',    fr: 'LE DÔME VERT',              z: [1.2, 1.04],  cx: [0, 0],      cy: [-0.3, 0.1], fx: ['stars', 'sparkle'] },
  { img: '03', t0: v(61.4),  t1: v(66.6),  ar: 'مدينة الرسول',     fr: 'LA VILLE DU PROPHÈTE',      z: [1.32, 1.12], cx: [0.3, -0.1], cy: [0.1, 0.2],  fx: ['rays', 'dust'] },
  { img: '09', t0: v(66.6),  t1: DUR,      ar: 'الحلقة القادمة',   fr: 'PROCHAIN ÉPISODE',          z: [1.04, 1.16], cx: [0, 0],      cy: [0.2, 0],    fx: ['dust'] },
];
const SUBS = [
  [0.08, 3.04, 'قبل أن تُسمّى المدينة… كان اسمها يثرب'],
  [3.28, 7.04, 'واحةٌ هادئة، تختبئ بين الحِرار السوداء في الحجاز'],
  [7.36, 13.04, 'في عام ٦٢٢م، يغادر النبيُّ محمدٌ ﷺ مكّةَ ليلًا'],
  [13.36, 17.12, 'هذه الرحلة… الهجرة… ستغيّر مجرى التاريخ'],
  [17.2, 19.88, 'في يثرب كانوا ينتظرونه… فاستقبلوه'],
  [19.92, 23.36, 'وصار للواحة اسمٌ جديد: المدينة المنوّرة'],
  [23.6, 25.36, 'مدينةٌ أضاءها النور'],
  [25.48, 29.6, 'وفي طريقه، في قُباء، أسّس أوّلَ مسجدٍ في الإسلام'],
  [29.68, 33.16, 'هنا فتح الأنصارُ بيوتَهم للمهاجرين من مكّة'],
  [33.2, 36.08, 'تقاسموا معهم الأرضَ والخبزَ والحياة'],
  [36.16, 39.12, 'أخوّةٌ لم ينسَها العالم'],
  [39.2, 42.38, 'وفي قلب المدينة، بنى مسجدَه بيديه الشريفتين'],
  [42.43, 44.72, 'جذوعُ نخلٍ… وطين'],
  [44.76, 48.96, 'وصلاةٌ فيه خيرٌ من ألف صلاةٍ فيما سواه، إلا المسجدَ الحرام'],
  [49.04, 54.48, 'قال ﷺ: «ما بين بيتي ومنبري روضةٌ من رياض الجنّة»'],
  [54.52, 57.2, 'واليوم، تحت القبّة الخضراء، مرقدُه الشريف ﷺ'],
  [57.28, 61.36, 'ويأتي الملايين كلَّ عامٍ ليسلّموا عليه'],
  [61.4, 63.52, 'المدينة ليست كأيّ مدينة'],
  [63.6, 65.6, 'فيها ترسّخ الإسلام'],
  [66.9, 70.8, 'الحلقة القادمة: أُحُد… «جبلٌ يحبّنا ونحبّه»'],
].map(([a, b, s]) => [v(a), v(b), s]);
const XF = 1.0;              // durée des fondus entre scènes
const END_CARD = v(70.9);    // carte de fin

// ---------- Outils ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const ramp = (t, a, b) => clamp((t - a) / (b - a));
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const GOLD = ['#FBEBB5', '#E2B65C', '#B8862E', '#F4DA92'];
function goldGrad(y0, y1) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, GOLD[0]); g.addColorStop(.45, GOLD[1]); g.addColorStop(.7, GOLD[2]); g.addColorStop(1, GOLD[3]);
  return g;
}

// sprite lumineux réutilisable
function glowSprite(r, rgb) {
  const c = document.createElement('canvas'); c.width = c.height = r * 2;
  const g = c.getContext('2d'), gr = g.createRadialGradient(r, r, 0, r, r, r);
  gr.addColorStop(0, `rgba(${rgb},1)`); gr.addColorStop(.25, `rgba(${rgb},.55)`); gr.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2); return c;
}
const SPR_GOLD = glowSprite(32, '255,214,140');
const SPR_WHITE = glowSprite(32, '255,250,235');

// grain
const GRAIN = [0, 1, 2, 3].map(i => {
  const c = document.createElement('canvas'); c.width = 360; c.height = 640;
  const g = c.getContext('2d'), d = g.createImageData(360, 640), r = rng(99 + i);
  for (let p = 0; p < d.data.length; p += 4) { const n = 128 + (r() - .5) * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = n; d.data[p + 3] = 255; }
  g.putImageData(d, 0, 0); return c;
});

// calque hors-écran pour les fondus
const LAYER = document.createElement('canvas'); LAYER.width = W; LAYER.height = H;
const LAYER_CTX = LAYER.getContext('2d');
function withCtx(c, fn) { const prev = ctx; ctx = c; try { fn(); } finally { ctx = prev; } }

// ---------- Chargement ----------
const IMGS = {};
function loadImg(k) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMGS[k] = i; res(); }; i.onerror = rej; i.src = `img/${k}.jpg`; }); }
window.__ready = (async () => {
  await Promise.all([...new Set(SCENES.map(s => s.img))].map(loadImg));
  await Promise.all([
    '700 60px Amiri', '400 40px Amiri', '700 80px Ruqaa', '500 30px Cormorant', '700 30px Cormorant', 'italic 500 40px Cormorant',
  ].map(f => document.fonts.load(f, 'المدينة Médine ﷺ')));
  await document.fonts.ready;
})();

// ---------- Couches image ----------
function drawImage(s, t) {
  const img = IMGS[s.img];
  const k = ease(clamp((t - (s.t0 - XF / 2)) / ((s.t1 + XF / 2) - (s.t0 - XF / 2))));
  const z = lerp(s.z[0], s.z[1], k);
  const sc = Math.max(W / img.width, H / img.height) * z;
  const iw = img.width * sc, ih = img.height * sc;
  const mx = (iw - W) / 2, my = (ih - H) / 2;
  const x = (W - iw) / 2 - lerp(s.cx[0], s.cx[1], k) * mx;
  const y = (H - ih) / 2 - lerp(s.cy[0], s.cy[1], k) * my;
  ctx.drawImage(img, x, y, iw, ih);
}

function fxDust(t, seed, n = 55) {
  const r = rng(seed);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, sp = 18 + r() * 45, sz = 3 + r() * 11, ph = r() * 6.28, depth = r();
    const y = ((y0 - t * sp) % H + H) % H;
    const x = x0 + Math.sin(t * .4 + ph) * 30 * (1 + depth);
    ctx.globalAlpha = (.25 + .5 * depth) * (.55 + .45 * Math.sin(t * 1.7 + ph * 3));
    const d = sz * (1 + depth);
    ctx.drawImage(SPR_GOLD, x - d, y - d, d * 2, d * 2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

function fxStars(t, seed) {
  const r = rng(seed);
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 90; i++) {
    const x = r() * W, y = r() * H * .5, sz = 2 + r() * 6, ph = r() * 6.28, f = 1 + r() * 2.5;
    ctx.globalAlpha = clamp(.15 + .85 * Math.pow(.5 + .5 * Math.sin(t * f + ph), 3));
    ctx.drawImage(SPR_WHITE, x - sz, y - sz, sz * 2, sz * 2);
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
}

function fxRays(t, seed) {
  const r = rng(seed);
  const ox = W * (.35 + r() * .3), oy = -260;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 8; i++) {
    const base = -0.55 + i * .16 + r() * .05;
    const ang = Math.PI / 2 + base + Math.sin(t * .23 + i * 1.7) * .035;
    const wdt = .028 + r() * .05, len = H * 1.35;
    const a = (.07 + r() * .09) * (.65 + .35 * Math.sin(t * .6 + i * 2.1));
    const g = ctx.createLinearGradient(ox, oy, ox + Math.cos(ang) * len, oy + Math.sin(ang) * len);
    g.addColorStop(0, `rgba(255,226,160,${a * 1.6})`); g.addColorStop(.55, `rgba(255,220,150,${a})`); g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(ox, oy);
    ctx.lineTo(ox + Math.cos(ang - wdt) * len, oy + Math.sin(ang - wdt) * len);
    ctx.lineTo(ox + Math.cos(ang + wdt) * len, oy + Math.sin(ang + wdt) * len);
    ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function fxMist(t, seed) {
  const r = rng(seed);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 7; i++) {
    const y = H * (.42 + r() * .25), rw = 420 + r() * 380, sp = 10 + r() * 22, x = ((r() * W + t * sp) % (W + 2 * rw)) - rw;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rw);
    g.addColorStop(0, 'rgba(255,236,210,.16)'); g.addColorStop(1, 'rgba(255,236,210,0)');
    ctx.fillStyle = g; ctx.save(); ctx.translate(x, y); ctx.scale(1, .32); ctx.translate(-x, -y);
    ctx.fillRect(x - rw, y - rw, rw * 2, rw * 2); ctx.restore();
  }
  ctx.restore();
}

function fxLamp(t) {
  const f = .75 + .12 * Math.sin(t * 9.1) + .08 * Math.sin(t * 13.7 + 1) + .05 * Math.sin(t * 23.3);
  ctx.save(); ctx.globalCompositeOperation = 'soft-light';
  const g = ctx.createRadialGradient(W * .5, H * .52, 0, W * .5, H * .52, H * .7);
  g.addColorStop(0, `rgba(255,170,70,${.35 * f})`); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
}

function star8(x, y, R, rot = 0) {
  ctx.beginPath();
  for (let sq = 0; sq < 2; sq++) {
    for (let i = 0; i < 4; i++) {
      const a = rot + sq * Math.PI / 4 + i * Math.PI / 2;
      const px = x + Math.cos(a) * R, py = y + Math.sin(a) * R;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
}

function fxSparkle(t, seed) {
  const r = rng(seed);
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 14; i++) {
    const x = r() * W, y = H * (.1 + r() * .6), per = 2.5 + r() * 3, ph = r() * per;
    const k = ((t + ph) % per) / per, a = Math.sin(clamp(k / .25) * Math.PI);
    if (a <= 0) continue;
    const R = 10 + 18 * r();
    ctx.globalAlpha = a * .9;
    ctx.drawImage(SPR_WHITE, x - R * 1.6, y - R * 1.6, R * 3.2, R * 3.2);
    ctx.strokeStyle = 'rgba(255,245,220,.9)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x - R * 2 * a, y); ctx.lineTo(x + R * 2 * a, y); ctx.moveTo(x, y - R * 2 * a); ctx.lineTo(x, y + R * 2 * a); ctx.stroke();
  }
  ctx.restore();
}

function drawScene(s, i, t) {
  drawImage(s, t);
  for (const f of s.fx) {
    if (f === 'dust') fxDust(t, 10 + i);
    if (f === 'stars') fxStars(t, 20 + i);
    if (f === 'rays') fxRays(t, 30 + i);
    if (f === 'mist') fxMist(t, 40 + i);
    if (f === 'lamp') fxLamp(t);
    if (f === 'sparkle') fxSparkle(t, 50 + i);
  }
}

// ---------- Typo ----------
function divider(cx, y, half, a, k) {
  ctx.save(); ctx.globalAlpha = a;
  const L = half * easeOut(k);
  for (const dir of [-1, 1]) {
    const g = ctx.createLinearGradient(cx + dir * 26, 0, cx + dir * (26 + L), 0);
    g.addColorStop(0, 'rgba(240,205,130,.95)'); g.addColorStop(1, 'rgba(240,205,130,0)');
    ctx.strokeStyle = g; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + dir * 26, y); ctx.lineTo(cx + dir * (26 + L), y); ctx.stroke();
  }
  ctx.strokeStyle = GOLD[1]; ctx.lineWidth = 2; star8(cx, y, 13, k * Math.PI / 4); ctx.stroke();
  ctx.fillStyle = GOLD[0]; ctx.beginPath(); ctx.arc(cx, y, 3.5, 0, 7); ctx.fill();
  ctx.restore();
}

function textShadow(blur = 22, a = .75) { ctx.shadowColor = `rgba(0,0,0,${a})`; ctx.shadowBlur = blur; ctx.shadowOffsetY = 3; }
function noShadow() { ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0; }

function chapterLabel(s, t) {
  const tin = Math.max(s.t0 + .25, s === SCENES[0] ? 4.3 : 0);
  const kin = ramp(t, tin, tin + 1.0), kout = ramp(t, s.t1 - .55, s.t1 - .05);
  const a = easeOut(kin) * (1 - kout);
  if (a <= 0) return;
  const cx = W / 2;
  ctx.save(); ctx.globalAlpha = a;
  ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = '400 32px Amiri'; ctx.fillStyle = 'rgba(255,240,210,.85)'; textShadow(14, .7);
  ctx.fillText('سلسلة مدن النور  ·  الحلقة ١', cx, 250);
  const dy = (1 - easeOut(kin)) * 26;
  ctx.font = '700 92px Ruqaa'; ctx.fillStyle = goldGrad(280, 370); textShadow(26, .8);
  ctx.fillText(s.ar, cx, 360 + dy);
  ctx.direction = 'ltr'; ctx.font = '700 30px Cormorant';
  ctx.letterSpacing = `${lerp(22, 9, easeOut(kin))}px`;
  ctx.fillStyle = '#FFF3DC'; textShadow(12, .8);
  ctx.fillText(s.fr, cx, 418 + dy * .6);
  ctx.letterSpacing = '0px'; noShadow();
  ctx.restore();
  divider(cx, 458, 190, a, kin);
}

function wrapAr(text, maxW) {
  const words = text.split(' ');
  if (ctx.measureText(text).width <= maxW) return [text];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(' '), b = words.slice(i).join(' ');
    const m = Math.max(ctx.measureText(a).width, ctx.measureText(b).width);
    if (!best || m < best.m) best = { m, l: [a, b] };
  }
  return best.l;
}

function subtitle(t) {
  for (let n = 0; n < SUBS.length; n++) {
    const [a, b, s] = SUBS[n];
    const nextA = n + 1 < SUBS.length ? SUBS[n + 1][0] - .05 : Infinity;
    const outEnd = Math.min(b + .3, nextA), outStart = Math.min(b + .05, outEnd - .12);
    if (t < a - .05 || t > outEnd) continue;
    const kin = ramp(t, a - .05, a + .3), kout = ramp(t, outStart, outEnd);
    const al = easeOut(kin) * (1 - kout);
    if (al <= 0) continue;
    ctx.save();
    ctx.globalAlpha = al;
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '700 62px Amiri';
    const lines = wrapAr(s, 900), lh = 104;
    const y0 = 1430 - (lines.length - 1) * lh / 2 + (1 - easeOut(kin)) * 16;
    lines.forEach((ln, i) => {
      const y = y0 + i * lh;
      textShadow(24, .9); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(ln, W / 2, y + 2);
      textShadow(10, .6); ctx.fillStyle = '#FFF8EA'; ctx.fillText(ln, W / 2, y);
    });
    noShadow();
    ctx.restore();
  }
}

function intro(t) {
  const kin = ramp(t, .35, 1.6), kout = ramp(t, 3.6, 4.3);
  const a = easeOut(kin) * (1 - kout);
  if (a <= 0) return;
  const cx = W / 2, cy = 830;
  ctx.save(); ctx.globalAlpha = a;
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const R = 250 * (.85 + .15 * easeOut(kin));
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
  g.addColorStop(0, 'rgba(255,215,140,.35)'); g.addColorStop(1, 'rgba(255,215,140,0)');
  ctx.fillStyle = g; ctx.fillRect(cx - R * 1.6, cy - R * 1.6, R * 3.2, R * 3.2);
  ctx.restore();
  ctx.strokeStyle = 'rgba(240,205,130,.55)'; ctx.lineWidth = 2;
  star8(cx, cy, R, t * .08); ctx.stroke();
  ctx.strokeStyle = 'rgba(240,205,130,.3)'; star8(cx, cy, R * .82, -t * .06); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, R * 1.04, 0, 7); ctx.strokeStyle = 'rgba(240,205,130,.25)'; ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.direction = 'rtl';
  ctx.font = '400 40px Amiri'; ctx.fillStyle = '#FFF0D2'; textShadow(16, .8);
  ctx.fillText('سلسلة مدن النور', cx, cy - 150);
  ctx.font = '700 150px Ruqaa'; ctx.fillStyle = goldGrad(cy - 110, cy + 40); textShadow(34, .85);
  const s = .94 + .06 * easeOut(kin);
  ctx.save(); ctx.translate(cx, cy + 20); ctx.scale(s, s); ctx.fillText('المدينة المنوّرة', 0, 0); ctx.restore();
  ctx.direction = 'ltr'; ctx.font = '700 58px Cormorant'; ctx.letterSpacing = `${lerp(40, 22, easeOut(kin))}px`;
  ctx.fillStyle = '#FFF4DE'; textShadow(16, .85);
  ctx.fillText('MÉDINE', cx + 11, cy + 120);
  ctx.font = 'italic 500 38px Cormorant'; ctx.letterSpacing = '3px'; ctx.fillStyle = GOLD[0];
  ctx.fillText('Épisode 1', cx, cy + 175);
  ctx.letterSpacing = '0px'; noShadow();
  ctx.restore();
  divider(cx, cy + 210, 160, a, kin);
}

function endCard(t) {
  const kin = ramp(t, END_CARD, END_CARD + 1.2);
  const a = easeOut(kin) * (1 - ramp(t, DUR - .8, DUR - .1));
  if (a <= 0) return;
  const cx = W / 2, cy = 860;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(10,5,15,.35)'; ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center'; ctx.direction = 'rtl';
  ctx.font = '400 44px Amiri'; ctx.fillStyle = '#FFF0D2'; textShadow(16, .8);
  ctx.fillText('الحلقة ٢', cx, cy - 170);
  ctx.font = '700 210px Ruqaa'; ctx.fillStyle = goldGrad(cy - 160, cy + 40); textShadow(36, .9);
  const s = .9 + .1 * easeOut(kin);
  ctx.save(); ctx.translate(cx, cy + 20); ctx.scale(s, s); ctx.fillText('أُحُد', 0, 0); ctx.restore();
  ctx.direction = 'ltr'; ctx.font = 'italic 500 48px Cormorant'; ctx.fillStyle = '#FFF4DE'; textShadow(14, .85);
  ctx.fillText('Épisode 2 · Ouhoud, la montagne qui nous aime', cx, cy + 115);
  noShadow();
  ctx.restore();
  divider(cx, cy + 165, 200, a, kin);
  // bouton
  const kb = easeOut(ramp(t, END_CARD + .7, END_CARD + 1.6)) * a;
  if (kb > 0) {
    ctx.save(); ctx.globalAlpha = kb;
    const bw = 560, bh = 104, bx = cx - bw / 2, by = cy + 250 + (1 - kb) * 20;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 52);
    ctx.fillStyle = 'rgba(20,12,6,.55)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = goldGrad(by, by + bh); ctx.stroke();
    ctx.textBaseline = 'middle';
    ctx.font = '700 44px Amiri'; ctx.direction = 'rtl'; const wA = ctx.measureText('تابعونا').width;
    ctx.font = '700 34px Cormorant'; ctx.direction = 'ltr'; ctx.letterSpacing = '4px'; const wF = ctx.measureText('ABONNE-TOI').width;
    const gap = 60, x0 = cx - (wA + gap + wF) / 2, ym = by + bh / 2;
    ctx.textAlign = 'left'; ctx.fillStyle = '#FFF4DE'; ctx.fillText('ABONNE-TOI', x0, ym + 2);
    ctx.letterSpacing = '0px';
    ctx.fillStyle = GOLD[1]; star8(x0 + wF + gap / 2, ym, 9, 0); ctx.fill();
    ctx.direction = 'rtl'; ctx.font = '700 44px Amiri'; ctx.textAlign = 'right'; ctx.fillStyle = GOLD[0];
    ctx.fillText('تابعونا', x0 + wF + gap + wA, ym + 4);
    ctx.restore();
  }
}

// ---------- Image complète ----------
window.renderFrame = function (t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

  // scènes + fondus (le fondu porte aussi sur les effets via un calque)
  SCENES.forEach((s, i) => {
    const a0 = s.t0 - XF / 2, a1 = s.t1 + XF / 2;
    if (t < a0 || t > a1) return;
    const al = i > 0 ? ease(ramp(t, a0, a0 + XF)) : 1;
    if (al < 1) {
      LAYER_CTX.setTransform(1, 0, 0, 1, 0, 0); LAYER_CTX.clearRect(0, 0, W, H);
      withCtx(LAYER_CTX, () => drawScene(s, i, t));
      ctx.save(); ctx.globalAlpha = al; ctx.drawImage(LAYER, 0, 0); ctx.restore();
    } else drawScene(s, i, t);
  });

  // éclat doré aux transitions
  for (let i = 1; i < SCENES.length; i++) {
    const d = t - SCENES[i].t0, k = Math.exp(-(d * d) / (2 * .28 * .28));
    if (k < .01) continue;
    ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = .45 * k;
    const g = ctx.createRadialGradient(W * .5, H * .38, 0, W * .5, H * .38, H * .75);
    g.addColorStop(0, 'rgba(255,220,150,1)'); g.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  // étalonnage : vignette + dégradés de lisibilité
  let g = ctx.createRadialGradient(W / 2, H * .48, H * .28, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  g = ctx.createLinearGradient(0, 0, 0, 620);
  g.addColorStop(0, 'rgba(5,4,12,.72)'); g.addColorStop(1, 'rgba(5,4,12,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 620);
  g = ctx.createLinearGradient(0, 1150, 0, H);
  g.addColorStop(0, 'rgba(5,4,12,0)'); g.addColorStop(.45, 'rgba(5,4,12,.62)'); g.addColorStop(1, 'rgba(5,4,12,.85)');
  ctx.fillStyle = g; ctx.fillRect(0, 1150, W, H - 1150);

  // grain
  ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = .07;
  ctx.drawImage(GRAIN[Math.floor(t * FPS) % 4], 0, 0, W, H); ctx.restore();

  // textes
  const cur = SCENES.find(s => t >= s.t0 && t < s.t1) || SCENES[SCENES.length - 1];
  if (t < END_CARD) chapterLabel(cur, t);
  intro(t);
  subtitle(t);
  endCard(t);

  // fondus d'ouverture et de fermeture
  const fin = 1 - ramp(t, 0, .7);
  if (fin > 0) { ctx.fillStyle = `rgba(0,0,0,${fin})`; ctx.fillRect(0, 0, W, H); }
  const fout = ramp(t, DUR - .6, DUR);
  if (fout > 0) { ctx.fillStyle = `rgba(0,0,0,${fout})`; ctx.fillRect(0, 0, W, H); }
};

// aperçu navigateur
if (!location.search.includes('render')) {
  window.__ready.then(() => {
    const t0 = performance.now();
    const loop = () => { renderFrame(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); };
    loop();
  });
}
