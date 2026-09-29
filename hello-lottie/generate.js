const fs = require('fs');
const svg = fs.readFileSync(process.argv[2], 'utf8');
const [vx, vy, vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].trim().split(/\s+/).map(Number);
const flipT = 728.156005859375;            // group: scale(1,-1) translate(0,-T)  =>  y' = T - y
const W = 2584, H = 826;                   // viewBox + ~40 px padding so round caps aren't clipped
const ox = -vx + (W - vw) / 2, oy = -vy + (H - vh) / 2;
const map = ([x, y]) => [x + ox, (flipT - y) + oy];

function toShape(d) {
  const nums = t => t.trim().split(/[\s,]+/).map(Number);
  const segs = d.match(/[MC][^MC]*/g);
  const v = [], i = [], o = [];
  for (const s of segs) {
    const n = nums(s.slice(1));
    if (s[0] === 'M') { v.push(map(n)); i.push([0, 0]); o.push([0, 0]); }
    else {
      const c1 = map(n.slice(0, 2)), c2 = map(n.slice(2, 4)), p = map(n.slice(4, 6));
      const prev = v[v.length - 1];
      o[o.length - 1] = [c1[0] - prev[0], c1[1] - prev[1]];
      v.push(p); i.push([c2[0] - p[0], c2[1] - p[1]]); o.push([0, 0]);
    }
  }
  return { v, i, o, c: false };
}
const paths = [...svg.matchAll(/ d="([^"]+)"/g)].map(m => toShape(m[1]));

const FR = 60, START = 8, DRAW = 150, OP = START + DRAW + 60;
const ease = { o: { x: [0.65], y: [0] }, i: { x: [0.35], y: [1] } }; // ease-in-out

// Apple system palette: blue → indigo → purple → pink → orange
const hex = h => [1, 3, 5].map(k => parseInt(h.substr(k, 2), 16) / 255);
const stops = [[0, '#0A84FF'], [0.3, '#5E5CE6'], [0.55, '#BF5AF2'], [0.78, '#FF375F'], [1, '#FF9F0A']];
const g = stops.flatMap(([p, c]) => [p, ...hex(c)]);

const lottie = {
  v: '5.12.0', fr: FR, ip: 0, op: OP, w: W, h: H, nm: 'Hello (SF) – gradient draw-on', ddd: 0, assets: [],
  slots: { strokeWidth: { p: { a: 0, k: 60 } } },
  layers: [{
    ddd: 0, ind: 1, ty: 4, nm: 'hello', sr: 1, ip: 0, op: OP, st: 0, bm: 0,
    ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [0, 0, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 0, k: [100, 100, 100] } },
    shapes: [{
      ty: 'gr', nm: 'hello strokes', it: [
        ...paths.map((ks, n) => ({ ty: 'sh', nm: n ? 'ello' : 'h', ks: { a: 0, k: ks } })),
        { ty: 'tm', nm: 'draw-on', m: 2, o: { a: 0, k: 0 }, s: { a: 0, k: 0 },
          e: { a: 1, k: [{ t: START, s: [0], ...ease }, { t: START + DRAW, s: [100] }] } },
        { ty: 'gs', nm: 'apple gradient', o: { a: 0, k: 100 }, w: { a: 0, k: 60, sid: 'strokeWidth' },
          lc: 2, lj: 2, ml: 4, t: 1,
          s: { a: 0, k: [ox + vx, H / 2] }, e: { a: 0, k: [ox + vx + vw, H / 2] },
          g: { p: stops.length, k: { a: 0, k: g } } },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, sk: { a: 0, k: 0 }, sa: { a: 0, k: 0 } }
      ]
    }]
  }]
};
fs.writeFileSync(process.argv[3], JSON.stringify(lottie));
