/* VAGA — générateurs SVG de la marque (logo, pictos, bouteille, scènes) */
(function (g) {
  const C = {
    noir: '#191D14', olive: '#3F4B24', chetoui: '#6E7B3A', or: '#C79A3E', orClair: '#E2C27A',
    pierre: '#DCCBA6', chaux: '#F4EFE4', terre: '#9A4527', dengri: '#2C4766'
  };
  let uid = 0;
  const id = p => p + (++uid);

  /* ---------- Pictogrammes (64×64, trait) ---------- */
  const ICONS = {
    capitole: '<path d="M8 23 32 9l24 14Z"/><circle cx="32" cy="18" r="2.2"/><path d="M10 23h44v5H10z"/><path d="M16 28v20M25 28v20M39 28v20M48 28v20"/><path d="M10 48h44M7 53h50M4 58h56"/>',
    theatre: '<path d="M5 50a27 27 0 0 1 54 0"/><path d="M13 50a19 19 0 0 1 38 0"/><path d="M21 50a11 11 0 0 1 22 0"/><path d="M32 23v6M19 28l3 5M45 28l-3 5"/><path d="M3 50h58M16 57h32"/>',
    mausolee: '<path d="M24 20 32 5l8 15Z"/><path d="M22 20h20v4H22z"/><path d="M24 24v14M30 24v14M34 24v14M40 24v14"/><path d="M20 38h24v4H20z"/><path d="M18 42h28v8H18zM14 50h36v8H14z"/>',
    arc: '<path d="M8 12h48v6H8z"/><path d="M10 18v40h12V40a10 10 0 0 1 20 0v18h12V18"/><path d="M14 22v32M50 22v32"/>',
    olivier: '<path d="M32 60V40c0-6-6-8-6-14M32 44c0-6 7-7 8-13"/><ellipse cx="32" cy="20" rx="20" ry="13"/><path d="M18 18c4 2 8 1 10-2M36 15c3 3 8 3 11 1M26 26c3 1 7 0 9-3"/><path d="M22 60h20"/>',
    branche: '<path d="M8 54C24 44 40 30 56 10"/><path d="M18 47c-4-7-2-13 2-16 2 6 1 11-2 16ZM28 39c6-1 11 1 13 6-6 1-10-1-13-6ZM34 30c-3-7 0-12 4-15 1 6 0 11-4 15ZM44 22c6 0 10 3 11 8-5 0-9-3-11-8Z"/><circle cx="24" cy="51" r="3.2"/><circle cx="38" cy="38" r="3.2"/>',
    soleil: '<circle cx="32" cy="32" r="11"/><path d="M32 6v9M32 49v9M6 32h9M49 32h9M13.6 13.6l6.4 6.4M44 44l6.4 6.4M13.6 50.4 20 44M44 20l6.4-6.4"/>',
    amphore: '<path d="M26 6h12M27 6v8c0 3-11 7-11 20 0 12 9 19 16 24 7-5 16-12 16-24 0-13-11-17-11-20V6"/><path d="M27 13c-6 0-9 4-9 9M37 13c6 0 9 4 9 9"/><path d="M20 30h24"/>',
    ble: '<path d="M32 60V12"/><path d="M32 20c-6-2-8-7-8-11 5 1 8 5 8 11ZM32 20c6-2 8-7 8-11-5 1-8 5-8 11ZM32 32c-6-2-8-7-8-11 5 1 8 5 8 11ZM32 32c6-2 8-7 8-11-5 1-8 5-8 11ZM32 44c-6-2-8-7-8-11 5 1 8 5 8 11ZM32 44c6-2 8-7 8-11-5 1-8 5-8 11Z"/>',
    meule: '<circle cx="32" cy="34" r="20"/><circle cx="32" cy="34" r="5"/><path d="M32 14V4M22 4h20M14 50l-6 8h48l-6-8"/>',
    goutte: '<path d="M32 6C24 20 16 30 16 40a16 16 0 0 0 32 0c0-10-8-20-16-34Z"/><path d="M24 41c0 4 3 7 7 8"/>',
    mosaique: '<path d="M6 6h52v52H6z"/><path d="M32 10 54 32 32 54 10 32Z"/><path d="M32 22 42 32 32 42 22 32Z"/><circle cx="32" cy="32" r="3"/>'
  };
  const ICON_NAMES = {
    capitole: 'Capitole de Dougga', theatre: 'Théâtre', mausolee: 'Mausolée libyco-punique', arc: 'Arc de Septime Sévère',
    olivier: 'Olivier centenaire', branche: 'Rameau', soleil: 'Soleil de Béja', amphore: 'Amphore', ble: 'Épi de Vaga',
    meule: 'Meule de pierre', goutte: 'Goutte d’or', mosaique: 'Mosaïque'
  };
  function icon(name, color, sw) {
    return `<svg viewBox="0 0 64 64" fill="none" stroke="${color || 'currentColor'}" stroke-width="${sw || 2.2}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
  }

  /* ---------- Feuille ---------- */
  const LEAF = 'M0 0C9 -14 9 -38 0 -54C-9 -38 -9 -14 0 0Z';

  /* ---------- Emblème : arche du Capitole, soleil levant, rameaux ---------- */
  function emblemInner(ink, accent, opts) {
    opts = opts || {};
    const sun = opts.sunFill === false ? `fill="none" stroke="${accent}" stroke-width="3"` : `fill="${accent}"`;
    let rays = '';
    for (let i = 0; i < 13; i++) {
      const a = Math.PI + (Math.PI * i) / 12;
      const x1 = 100 + Math.cos(a) * 46, y1 = 120 + Math.sin(a) * 46;
      const x2 = 100 + Math.cos(a) * 60, y2 = 120 + Math.sin(a) * 60;
      rays += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    return `
      <path d="M28 236V104a72 72 0 0 1 144 0v132" fill="none" stroke="${ink}" stroke-width="4"/>
      <path d="M38 236V106a62 62 0 0 1 124 0v130" fill="none" stroke="${ink}" stroke-width="1.5"/>
      <g stroke="${accent}" stroke-width="3" stroke-linecap="round">${rays}</g>
      <circle cx="100" cy="120" r="38" ${sun}/>
      <g fill="${opts.templeFill || (opts.dark ? C.noir : C.chaux)}" stroke="${ink}" stroke-width="3" stroke-linejoin="round">
        <path d="M56 140 100 114l44 26Z"/>
        <rect x="58" y="140" width="84" height="9"/>
        <rect x="64" y="149" width="10" height="44"/><rect x="82" y="149" width="10" height="44"/>
        <rect x="108" y="149" width="10" height="44"/><rect x="126" y="149" width="10" height="44"/>
        <rect x="56" y="193" width="88" height="7"/><rect x="50" y="200" width="100" height="7"/><rect x="44" y="207" width="112" height="7"/>
      </g>
      <circle cx="100" cy="130" r="3.5" fill="${ink}"/>
      <g fill="${ink}">
        <g transform="translate(60 232) rotate(-62)"><path d="${LEAF}" transform="scale(.42)"/></g>
        <g transform="translate(72 230) rotate(-30)"><path d="${LEAF}" transform="scale(.4)"/></g>
        <g transform="translate(140 232) rotate(62)"><path d="${LEAF}" transform="scale(.42)"/></g>
        <g transform="translate(128 230) rotate(30)"><path d="${LEAF}" transform="scale(.4)"/></g>
      </g>
      <circle cx="100" cy="226" r="5" fill="${accent}"/>
      <line x1="20" y1="236" x2="180" y2="236" stroke="${ink}" stroke-width="4"/>`;
  }
  function emblem(ink, accent, opts) {
    return `<svg viewBox="0 0 200 244" role="img" aria-label="Emblème VAGA">${emblemInner(ink, accent, opts)}</svg>`;
  }

  /* ---------- Monogramme : V en deux feuilles + olive ---------- */
  function monogramInner(ink, accent) {
    return `<g fill="${ink}"><g transform="translate(50 92) rotate(-24)"><path d="${LEAF}" transform="scale(1.45)"/></g>
      <g transform="translate(50 92) rotate(24)"><path d="${LEAF}" transform="scale(1.45)"/></g></g>
      <path d="M50 92V40" stroke="${accent}" stroke-width="2.5"/>
      <ellipse cx="50" cy="30" rx="8" ry="10" fill="${accent}"/>`;
  }
  function monogram(ink, accent) {
    return `<svg viewBox="0 0 100 100" role="img" aria-label="Monogramme VAGA">${monogramInner(ink, accent)}</svg>`;
  }

  /* ---------- Sceau circulaire ---------- */
  function seal(ink, accent, bg) {
    const p = id('sealp');
    return `<svg viewBox="0 0 200 200" role="img" aria-label="Sceau VAGA">
      <circle cx="100" cy="100" r="96" fill="${bg || 'none'}" stroke="${ink}" stroke-width="2"/>
      <circle cx="100" cy="100" r="68" fill="none" stroke="${ink}" stroke-width="1.2"/>
      <defs><path id="${p}" d="M100 100m-81 0a81 81 0 1 1 162 0a81 81 0 1 1 -162 0"/></defs>
      <text font-family="Marcellus, serif" font-size="14" letter-spacing="3" fill="${ink}">
        <textPath href="#${p}" textLength="500" lengthAdjust="spacing">VAGA · BÉJA · TUNISIE · THUGGA · CHÉTOUI · MMXXVI ·</textPath></text>
      <g transform="translate(62 58) scale(.76)">${monogramInner(ink, accent)}</g>
    </svg>`;
  }

  /* ---------- Bouteille ---------- */
  function bottle(o) {
    o = Object.assign({ cuvee: 'Capitole', varietal: 'Chétoui · Récolte précoce', label: C.chaux, ink: C.noir, accent: C.or,
      cap: C.or, glass: '#1E2614', vol: '500 ml', badge: 'Cuvée' }, o || {});
    const gG = id('glass'), gC = id('cap'), gH = id('hl');
    return `<svg viewBox="0 0 220 600" role="img" aria-label="Bouteille VAGA ${o.cuvee}">
      <defs>
        <linearGradient id="${gG}" x1="0" x2="1"><stop offset="0" stop-color="${o.glass}" stop-opacity=".95"/><stop offset=".22" stop-color="#4A5528"/><stop offset=".55" stop-color="${o.glass}"/><stop offset="1" stop-color="#0B0E08"/></linearGradient>
        <linearGradient id="${gC}" x1="0" x2="1"><stop offset="0" stop-color="#8C6A24"/><stop offset=".35" stop-color="#F1D38E"/><stop offset=".6" stop-color="${o.cap}"/><stop offset="1" stop-color="#6E5019"/></linearGradient>
        <linearGradient id="${gH}" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      <ellipse cx="110" cy="594" rx="86" ry="6" fill="#000" opacity=".25"/>
      <path d="M92 70v70c0 34-50 44-50 96v340q0 14 14 14h108q14 0 14-14V236c0-52-50-62-50-96V70Z" fill="url(#${gG})"/>
      <rect x="54" y="246" width="9" height="330" rx="4.5" fill="url(#${gH})"/>
      <path d="M100 74v62c0 24-20 36-34 52" stroke="#fff" stroke-opacity=".14" stroke-width="4" fill="none"/>
      <rect x="86" y="4" width="48" height="62" rx="4" fill="url(#${gC})"/>
      ${[14, 22, 30, 38, 46, 54].map(y => `<line x1="88" x2="132" y1="${y}" y2="${y}" stroke="#5B4214" stroke-opacity=".35"/>`).join('')}
      <rect x="82" y="62" width="56" height="16" rx="2" fill="${o.ink}"/>
      <text x="110" y="74" text-anchor="middle" font-family="Marcellus, serif" font-size="8.5" letter-spacing="2.4" fill="${o.accent}">MMXXVI</text>
      <circle cx="110" cy="200" r="18" fill="${o.ink}" stroke="${o.accent}" stroke-width="1.6"/>
      <g transform="translate(98 186) scale(.24)">${monogramInner(o.accent, o.accent)}</g>
      <rect x="50" y="292" width="120" height="236" fill="${o.label}"/>
      <rect x="56" y="298" width="108" height="224" fill="none" stroke="${o.accent}" stroke-width="1"/>
      <g transform="translate(84 306) scale(.26)">${emblemInner(o.ink, o.accent, { templeFill: o.label })}</g>
      <text x="110" y="398" text-anchor="middle" font-family="Marcellus, serif" font-size="27" letter-spacing="6" fill="${o.ink}">VAGA</text>
      <text x="110" y="412" text-anchor="middle" font-family="Manrope, sans-serif" font-size="5.6" font-weight="700" letter-spacing="2" textLength="104" lengthAdjust="spacingAndGlyphs" fill="${o.ink}">HUILE D'OLIVE VIERGE EXTRA</text>
      <line x1="80" x2="140" y1="422" y2="422" stroke="${o.accent}"/>
      <text x="110" y="444" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="19" fill="${o.ink}">${o.cuvee}</text>
      <text x="110" y="458" text-anchor="middle" font-family="Manrope, sans-serif" font-size="5.4" letter-spacing="1.4" textLength="${Math.min(100, o.varietal.length * 4.6)}" lengthAdjust="spacingAndGlyphs" fill="${o.ink}">${o.varietal.toUpperCase()}</text>
      <text x="110" y="482" text-anchor="middle" font-family="Amiri, serif" font-size="9.5" fill="${o.ink}">زيت زيتون بكر ممتاز · باجة</text>
      <text x="110" y="508" text-anchor="middle" font-family="Manrope, sans-serif" font-size="5.4" letter-spacing="1.6" textLength="92" lengthAdjust="spacingAndGlyphs" fill="${o.ink}">BÉJA · TUNISIE · ${o.vol.toUpperCase()}</text>
    </svg>`;
  }

  function place(svg, x, y, w) { const h = w * 600 / 220; return svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h.toFixed(1)}" `); }

  /* ---------- Feuillage pseudo-aléatoire ---------- */
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
  function foliage(cx, cy, rx, ry, n, seed, colors) {
    const r = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r());
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      const rot = r() * 360, sc = .2 + r() * .18, col = colors[Math.floor(r() * colors.length)];
      s += `<path d="${LEAF}" fill="${col}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) scale(${sc.toFixed(2)})"/>`;
    }
    return s;
  }

  /* ---------- Scène : olivier au soleil, bouteille sur un chapiteau de Dougga ---------- */
  function sceneOlivier() {
    const gs = id('sky'), gl = id('glow');
    const leaves = ['#55652C', '#6E7B3A', '#8A9650', '#3F4B24', '#A5A86A'];
    let olives = ''; const r = rng(7);
    for (let i = 0; i < 40; i++) { const x = 250 + r() * 330, y = 90 + r() * 170; olives += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="4" ry="5.2" fill="${r() > .5 ? '#2A2416' : '#4E5A26'}"/>`; }
    return `<svg viewBox="0 0 800 520" role="img" aria-label="La bouteille VAGA posée sur un chapiteau antique, sous un olivier au soleil">
      <defs>
        <linearGradient id="${gs}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6D892"/><stop offset=".55" stop-color="#EDB866"/><stop offset="1" stop-color="#D88E4A"/></linearGradient>
        <radialGradient id="${gl}" cx=".78" cy=".26" r=".5"><stop offset="0" stop-color="#FFF4D6"/><stop offset=".25" stop-color="#FFE3A0" stop-opacity=".8"/><stop offset="1" stop-color="#FFE3A0" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="520" fill="url(#${gs})"/>
      <rect width="800" height="520" fill="url(#${gl})"/>
      <circle cx="624" cy="134" r="46" fill="#FFF3D2"/>
      <path d="M0 330C120 300 230 318 360 300S620 270 800 296V520H0Z" fill="#B88A4A" opacity=".55"/>
      <path d="M0 360C160 336 300 352 450 338S680 320 800 336V520H0Z" fill="#8A7A3E" opacity=".75"/>
      <g opacity=".5" fill="#5A6230">${foliage(90, 330, 50, 16, 40, 3, ['#5A6230', '#6E7038'])}${foliage(690, 318, 60, 18, 46, 5, ['#5A6230', '#6E7038'])}</g>
      <path d="M0 400C200 380 420 396 800 384V520H0Z" fill="#5B5A2C"/>
      <path d="M0 440C260 424 520 436 800 428V520H0Z" fill="#3E4220"/>
      <path d="M402 432c-6-60 10-90-6-140-8-26-30-40-40-62M408 300c18-30 50-38 64-70M398 330c-30-10-60-4-90-30" stroke="#3B2E1C" stroke-width="22" fill="none" stroke-linecap="round"/>
      <path d="M380 440c8-50 0-90 20-150 10-30 40-50 50-80" stroke="#55422A" stroke-width="12" fill="none" stroke-linecap="round" opacity=".7"/>
      <g>${foliage(410, 165, 240, 115, 1100, 11, leaves)}</g>
      ${olives}
      <g transform="translate(160 362)">
        <path d="M0 100h170v18H0z" fill="#C9B48A"/><path d="M14 40h142l-10 60H24Z" fill="#DCCBA6"/>
        <path d="M-6 22h182v18H-6z" fill="#E7D9B8"/><path d="M28 40c0 10 10 18 20 18s18-8 18-18M104 40c0 10 10 18 20 18s18-8 18-18" stroke="#B49C6C" stroke-width="3" fill="none"/>
        <path d="M24 62h122M30 80h110" stroke="#B49C6C" stroke-width="2"/>
      </g>
      ${place(bottle(), 191, 104, 108)}
      ${place(bottle({ cuvee: 'Théâtre', varietal: 'Chétoui · Fruité intense', label: C.olive, ink: C.chaux }), 452, 268, 66)}
      <rect width="800" height="520" fill="url(#${gl})" opacity=".55"/>
    </svg>`;
  }

  g.VAGA = { C, ICONS, ICON_NAMES, icon, emblem, emblemInner, monogram, monogramInner, seal, bottle, foliage, sceneOlivier, place, LEAF };
})(window);
