/* VAGA v2 : symbole « Soleil de Dougga », logotype, pictogrammes */
(function (root) {
  const C = {
    dengri: '#1E3A5F', nuit: '#13202F', chaux: '#F5F1E8', huile: '#C9C63C',
    terre: '#B0472A', pierre: '#E4D5B3', encre: '#15181D'
  };
  let n = 0; const uid = p => p + '-' + (++n);

  /* Symbole « Soleil de Dougga » : un disque solaire coupé par l'entablement et les colonnes du Capitole */
  /* entablement horizontal + trois entrecolonnements : le soleil se lève derrière le Capitole */
  const TEMPLE = 'M0 52h100v5H0Z M28 57h6v43h-6Z M47 57h6v43h-6Z M66 57h6v43h-6Z';
  function symbolInner(fg, x, y, s) {
    const m = uid('m');
    return `<g transform="translate(${x || 0} ${y || 0}) scale(${s || 1})"><mask id="${m}" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><path d="${TEMPLE}" fill="#000"/></mask>
      <circle cx="50" cy="50" r="46" fill="${fg}" mask="url(#${m})"/></g>`;
  }
  function symbol(fg) { return `<svg viewBox="0 0 100 100" role="img" aria-label="Symbole VAGA">${symbolInner(fg)}</svg>`; }

  /* Logotype : V, A sans barre (le fronton) avec une olive, G géométrique */
  const V = '0,0 10.5,0 24,38 37.5,0 48,0 29,60 19,60';
  const A = '19,0 29,0 48,60 37.5,60 24,20 10.5,60 0,60';
  function wordInner(fg, olive, x, y, s) {
    const o = olive || fg;
    return `<g transform="translate(${x || 0} ${y || 0}) scale(${s || 1})">
      <polygon points="${V}" fill="${fg}"/>
      <g transform="translate(64 0)"><polygon points="${A}" fill="${fg}"/><circle cx="24" cy="46" r="5.4" fill="${o}"/></g>
      <path d="M179.1 14.3A25.5 25.5 0 1 0 184.1 34.4H163" fill="none" stroke="${fg}" stroke-width="9.5"/>
      <g transform="translate(206 0)"><polygon points="${A}" fill="${fg}"/><circle cx="24" cy="46" r="5.4" fill="${o}"/></g>
    </g>`;
  }
  const WORD_W = 254;
  function wordmark(fg, olive) { return `<svg viewBox="-2 -2 258 64" role="img" aria-label="VAGA">${wordInner(fg, olive)}</svg>`; }

  /* Signature verticale */
  function lockupV(fg, olive, sub) {
    return `<svg viewBox="0 0 260 250" role="img" aria-label="VAGA, huile d'olive, Béja Tunisie">
      ${symbolInner(fg, 80, 0, 1)}
      ${wordInner(fg, olive, 3, 136, 1)}
      <text x="130" y="236" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-stretch="125%" font-weight="600" font-size="11.5" letter-spacing="4.2" fill="${sub || fg}">HUILE D'OLIVE · BÉJA</text>
    </svg>`;
  }
  /* Signature horizontale */
  function lockupH(fg, olive) {
    return `<svg viewBox="0 0 400 100" role="img" aria-label="VAGA">
      ${symbolInner(fg, 0, 0, 1)}
      <line x1="122" y1="16" x2="122" y2="84" stroke="${fg}" stroke-width="1.5" opacity=".5"/>
      ${wordInner(fg, olive, 144, 20, 1)}
    </svg>`;
  }

  /* Pictogrammes pleins, même géométrie que le symbole (grille 48) */
  const ICONS = {
    capitole: ['Capitole', '<path d="M6 18 24 6l18 12Z M6 20h36v4H6Z M9 26h5v14H9Z M17.5 26h5v14h-5Z M25.5 26h5v14h-5Z M34 26h5v14h-5Z M4 42h40v4H4Z"/>'],
    theatre: ['Théâtre', '<path d="M2 38A22 22 0 0 1 46 38h-6a16 16 0 0 0-32 0Z M12 38a12 12 0 0 1 24 0h-5a7 7 0 0 0-14 0Z M4 41h40v4H4Z"/>'],
    mausolee: ['Mausolée', '<path d="M24 2 31 14H17Z M16 15h16v3H16Z M17 19h3v10h-3Z M22.5 19h3v10h-3Z M28 19h3v10h-3Z M14 30h20v4H14Z M11 35h26v5H11Z M8 41h32v5H8Z"/>'],
    arc: ['Arc de Sévère', '<path d="M6 6h36v6H6Z M8 12h32v34H30V30a6 6 0 0 0-12 0v16H8Z"/>'],
    olive: ['Olive', '<ellipse cx="24" cy="28" rx="12" ry="15"/><path d="M24 13V5M24 9c5-6 12-6 16-4-4 5-10 6-16 4Z"/>'],
    soleil: ['Soleil', '<circle cx="24" cy="30" r="12"/><path d="M2 42h44v4H2Z M23 4h2v8h-2Z M8 12l1.4-1.4 5.6 5.6-1.4 1.4Z M40 12l-1.4-1.4-5.6 5.6 1.4 1.4Z"/>'],
    goutte: ['Goutte', '<path d="M24 3C17 15 10 23 10 31a14 14 0 0 0 28 0c0-8-7-16-14-28Z"/>'],
    epi: ['Épi de Vaga', '<path d="M23 14h2v32h-2Z M24 6c3 3 3 7 0 10-3-3-3-7 0-10Z M23 18c-6 0-9-3-10-7 6 0 9 3 10 7Z M25 18c6 0 9-3 10-7-6 0-9 3-10 7Z M23 27c-6 0-9-3-10-7 6 0 9 3 10 7Z M25 27c6 0 9-3 10-7-6 0-9 3-10 7Z M23 36c-6 0-9-3-10-7 6 0 9 3 10 7Z M25 36c6 0 9-3 10-7-6 0-9 3-10 7Z"/>'],
    amphore: ['Amphore', '<path d="M18 3h12v4h-2v5c7 4 11 10 11 18 0 7-6 13-15 17-9-4-15-10-15-17 0-8 4-14 11-18V7h-2Z"/>'],
    meule: ['Meule', '<path d="M24 6a18 18 0 1 1 0 36 18 18 0 0 1 0-36Zm0 13a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" fill-rule="evenodd"/>'],
    feuille: ['Feuille', '<path d="M24 46C10 34 10 14 24 2c14 12 14 32 0 44Z"/>'],
    tunisie: ['Béja · Tunisie', '<path d="M24 4c-6 0-11 5-11 11 0 9 11 20 11 20s11-11 11-20c0-6-5-11-11-11Zm0 7a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" fill-rule="evenodd"/><path d="M8 42h32v4H8Z"/>']
  };
  function icon(k, fg) { return `<svg viewBox="0 0 48 48" fill="${fg || 'currentColor'}" aria-hidden="true">${ICONS[k][1]}</svg>`; }

  /* Motif : arcades de soleils levants, rangs décalés, une olive entre chaque soleil */
  function pattern(bg, fg, accent) {
    const p = uid('pat');
    return `<svg width="100%" height="100%" aria-hidden="true"><defs><pattern id="${p}" width="80" height="80" patternUnits="userSpaceOnUse">
      <rect width="80" height="80" fill="${bg}"/>
      <path d="M8 36a32 32 0 0 1 64 0Z M-32 76a32 32 0 0 1 64 0Z M48 76a32 32 0 0 1 64 0Z" fill="${fg}"/>
      <path d="M0 36h80v4H0Z M0 76h80v4H0Z" fill="${fg}"/>
      <circle cx="0" cy="28" r="4" fill="${accent}"/><circle cx="80" cy="28" r="4" fill="${accent}"/><circle cx="40" cy="68" r="4" fill="${accent}"/>
    </pattern></defs><rect width="100%" height="100%" fill="url(#${p})"/></svg>`;
  }

  root.VAGA2 = { C, TEMPLE, symbol, symbolInner, wordmark, wordInner, WORD_W, lockupV, lockupH, ICONS, icon, pattern };
  if (typeof module !== 'undefined') module.exports = root.VAGA2;
})(typeof window !== 'undefined' ? window : globalThis);
