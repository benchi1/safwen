"""Assemble la charte graphique BeBail en une page HTML (logos SVG intégrés)."""
import re
import build_kit as K

L = "charte/logo/"


def inline(name, cls="", label="BeBail"):
    s = open(L + name if not name.startswith("charte/") else name, encoding="utf-8").read()
    s = re.sub(r"<title>.*?</title>", "", s)
    s = re.sub(r'\s(width|height)="[^"]*"', "", s, count=2)
    return s.replace("<svg ", f'<svg class="{cls}" aria-label="{label}" ', 1)


C = K.C
d_master, dx, dy, _ = K.centred()
d_small, sdx, sdy, _ = K.centred(small=True)

# Figure de construction : grille 256, contour plein en fond, ligne médiane en surimpression
grid = "".join(f'<line x1="{i}" y1="0" x2="{i}" y2="256"/><line x1="0" y1="{i}" x2="256" y2="{i}"/>'
               for i in range(0, 257, 16))
construction = f'''
<svg class="constr" viewBox="0 0 256 256" role="img" aria-label="Construction du symbole sur une grille de 16 unités">
  <g class="grid">{grid}</g>
  <g transform="translate({dx:.2f} {dy:.2f})">
    <path class="fill" fill-rule="evenodd" d="{d_master}"/>
    <path class="guide" d="M66 110L128 48L190 110"/>
    <path class="spine" pathLength="1" d="{K.MASTER}"/>
    <circle class="pt" cx="128" cy="48" r="3.2"/><circle class="pt" cx="66" cy="110" r="3.2"/>
    <circle class="pt" cx="190" cy="110" r="3.2"/>
    <text class="lbl" x="136" y="40">45°</text>
    <text class="lbl" x="22" y="228">amorce</text>
    <text class="lbl" x="206" y="226">paraphe</text>
  </g>
</svg>'''

swatches = [
    ("Nuit", C["nuit"], "11 17 22", "50 23 0 91", "Fond principal, textes sur clair", "18,9:1 sur blanc"),
    ("Menthe", C["menthe"], "95 203 142", "53 0 30 20", "Symbole et accents sur Nuit, boutons", "9,4:1 sur Nuit"),
    ("Sapin", C["sapin"], "23 117 74", "80 0 37 54", "Symbole et « Bail » sur fonds clairs", "5,7:1 sur blanc"),
    ("Brume", C["brume"], "238 242 240", "2 0 1 5", "Fonds clairs, cartes, documents", "17:1 avec Nuit"),
    ("Ardoise", C["ardoise"], "139 150 163", "15 8 0 36", "Texte secondaire sur Nuit", "6,3:1 sur Nuit"),
]
sw_html = "".join(f'''
<figure class="sw">
  <div class="chip" style="background:{h}"></div>
  <figcaption>
    <b>{n}</b>
    <button class="hex" type="button" data-copy="{h}">{h}</button>
    <dl><dt>RVB</dt><dd>{rgb}</dd><dt>CMJN</dt><dd>{cmyk}</dd><dt>Contraste</dt><dd>{cr}</dd></dl>
    <p>{use}</p>
  </figcaption>
</figure>''' for n, h, rgb, cmyk, use, cr in swatches)

misuse = [
    ("Menthe sur fond clair", f'<div class="mu-bg" style="background:#fff">{inline("bebail-symbole-couleur-sombre.svg","mu")}</div>'),
    ("Rotation", f'<div class="mu-bg dark">{inline("bebail-symbole-couleur-sombre.svg","mu rot")}</div>'),
    ("Déformation", f'<div class="mu-bg dark">{inline("bebail-symbole-couleur-sombre.svg","mu squash")}</div>'),
    ("Ombre ou effet", f'<div class="mu-bg dark">{inline("bebail-symbole-couleur-sombre.svg","mu shadow")}</div>'),
    ("Autre couleur", f'<div class="mu-bg dark">{inline("bebail-symbole-couleur-sombre.svg","mu hue")}</div>'),
    ("Cadre ajouté", f'<div class="mu-bg dark"><div class="mu-frame">{inline("bebail-symbole-couleur-sombre.svg","mu")}</div></div>'),
]
mu_html = "".join(f'<figure class="mu-item">{art}<figcaption><span class="x" aria-hidden="true">✕</span>{t}</figcaption></figure>'
                  for t, art in misuse)

files = [
    ("logo/bebail-horizontal-*.svg", "Logo horizontal, 4 déclinaisons couleur"),
    ("logo/bebail-empile-*.svg", "Logo empilé"),
    ("logo/bebail-symbole-*.svg", "Symbole seul (dès 24 px)"),
    ("logo/bebail-symbole-petit-*.svg", "Coupe petite taille (16 à 24 px)"),
    ("logo/bebail-mot-*.svg", "Mot-symbole seul"),
    ("icones/favicon.svg · favicon.ico", "Favicon sur tuile Nuit"),
    ("icones/icon-192/512.png · apple-touch-icon.png", "Icônes d'appli et PWA"),
    ("icones/site.webmanifest · head-snippet.html", "Intégration web prête à copier"),
    ("presentation.html · planches/", "Présentation et maquettes"),
]
files_html = "".join(f"<tr><td><code>{f}</code></td><td>{d}</td></tr>" for f, d in files)

html = f'''<title>Charte BeBail</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Mise en page : colonne éditoriale de 1080 px, sections séparées par le trait-paraphe */
:root {{
  --nuit: {C["nuit"]}; --menthe: {C["menthe"]}; --sapin: {C["sapin"]}; --brume: {C["brume"]}; --ardoise: {C["ardoise"]};
  --bg: #F7F9F8; --surface: #FFFFFF; --fg: #0B1116; --muted: #56616C; --line: #DCE3E0; --accent: var(--sapin);
  --grid: #E3E9E6;
  --display: "Manrope", "Segoe UI", system-ui, sans-serif;
  --body: "Manrope", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: light;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: #0B1116; --surface: #111A21; --fg: #EEF2F0; --muted: #8B96A3; --line: #1E2A33; --accent: var(--menthe);
  --grid: #16212A; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: #0B1116; --surface: #111A21; --fg: #EEF2F0; --muted: #8B96A3; --line: #1E2A33; --accent: var(--menthe);
  --grid: #16212A; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--fg); font: 400 16px/1.6 var(--body); margin: 0; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-inline: 20px; padding-block: 0 80px; }}
h1, h2, h3 {{ font-family: var(--display); text-wrap: balance; margin: 0; letter-spacing: -0.02em; }}
h2 {{ font-size: clamp(26px, 4vw, 36px); font-weight: 800; }}
h3 {{ font-size: 18px; font-weight: 700; }}
p {{ margin: 0; max-width: 64ch; }}
.eyebrow {{ font: 500 12px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }}
.muted {{ color: var(--muted); }}
section {{ display: grid; gap: 24px; padding-block: 56px; border-top: 1px solid var(--line); }}
.head {{ display: grid; gap: 10px; }}

/* Hero : toujours sur Nuit, c'est l'univers de la marque */
.hero {{ background: var(--nuit); color: #EEF2F0; border-radius: 0 0 28px 28px; padding: 64px 20px 56px;
  display: grid; gap: 28px; justify-items: start; }}
.hero .in {{ max-width: 1040px; width: 100%; margin: 0 auto; display: grid; gap: 28px; }}
.hero .logo {{ width: min(460px, 100%); height: auto; }}
.hero h1 {{ font-size: clamp(30px, 5vw, 52px); font-weight: 800; max-width: 18ch; line-height: 1.08; }}
.hero h1 em {{ font-style: normal; color: var(--menthe); }}
.hero p {{ color: #B7C0C8; font-size: 18px; }}
.hero .eyebrow {{ color: var(--menthe); }}

/* Idée */
.idea {{ display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 32px; align-items: center; }}
.constr {{ width: 100%; max-width: 440px; height: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 20px; }}
.constr .grid line {{ stroke: var(--grid); stroke-width: .6; }}
.constr .fill {{ fill: var(--fg); opacity: .09; }}
.constr .guide {{ fill: none; stroke: var(--muted); stroke-width: .8; stroke-dasharray: 3 3; }}
.constr .spine {{ fill: none; stroke: var(--accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 1; stroke-dashoffset: 0; }}
.constr.play .spine {{ animation: draw 2.2s cubic-bezier(.6,.05,.3,1) both; }}
@keyframes draw {{ from {{ stroke-dashoffset: 1; }} to {{ stroke-dashoffset: 0; }} }}
.constr .pt {{ fill: var(--accent); }}
.constr .lbl {{ font: 500 8px var(--mono); fill: var(--muted); }}
.idea ul {{ margin: 0; padding-left: 18px; display: grid; gap: 8px; }}
.btn {{ font: 500 13px var(--mono); color: var(--fg); background: transparent; border: 1px solid var(--line);
  border-radius: 999px; padding: 8px 14px; cursor: pointer; justify-self: start; }}
.btn:hover {{ border-color: var(--accent); }}
.btn:focus-visible, .hex:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}

/* Versions */
.versions {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.v {{ border-radius: 18px; padding: 36px 28px; display: grid; place-items: center; min-height: 190px; border: 1px solid var(--line); }}
.v svg {{ width: 100%; max-width: 300px; height: auto; max-height: 150px; }}
.v.sym svg {{ max-width: 120px; }}
.v.light {{ background: #FFFFFF; }} .v.brume {{ background: var(--brume); }} .v.dark {{ background: var(--nuit); border-color: #1E2A33; }}
.v.sapin {{ background: var(--sapin); border-color: var(--sapin); }}
.cap {{ font: 500 12px var(--mono); color: var(--muted); letter-spacing: .04em; margin-top: 8px; }}
.vcell {{ display: grid; }}

/* Couleurs */
.swatches {{ display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 14px; }}
.sw {{ margin: 0; display: grid; gap: 12px; align-content: start; }}
.chip {{ aspect-ratio: 4/5; max-width: 100%; border-radius: 16px; border: 1px solid var(--line); }}
.sw b {{ font: 700 17px var(--display); display: block; }}
.hex {{ font: 500 13px var(--mono); color: var(--accent); background: none; border: 0; padding: 0; cursor: copy; }}
.sw dl {{ display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; margin: 6px 0; font: 400 12px var(--mono); color: var(--muted);
  font-variant-numeric: tabular-nums; }}
.sw dt {{ opacity: .75; }} .sw dd {{ margin: 0; }}
.sw p {{ font-size: 13px; color: var(--muted); }}
.ratio {{ display: grid; grid-template-columns: 3fr 2fr 1fr; height: 18px; border-radius: 999px; overflow: hidden; max-width: 560px; }}
.note {{ font-size: 14px; color: var(--muted); }}

/* Typo */
.type {{ display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr); gap: 16px; }}
.card {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 28px; display: grid; gap: 14px; align-content: start; min-width: 0; }}
.spec {{ font: 400 12px var(--mono); color: var(--muted); }}
.s1 {{ font: 800 44px/1.05 var(--display); letter-spacing: -0.03em; }}
.s2 {{ font: 700 24px/1.2 var(--display); letter-spacing: -0.01em; }}
.s3 {{ font: 400 16px/1.6 var(--body); color: var(--muted); }}
.s4 {{ font: 500 12px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }}
.mono-big {{ font: 500 30px/1.2 var(--mono); letter-spacing: -0.02em; }}

/* Règles */
.rules {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.clear {{ position: relative; background: var(--nuit); border-radius: 18px; padding: 28px; display: grid; place-items: center; }}
.clear .box {{ position: relative; padding: 22px; outline: 1.5px dashed rgba(95,203,142,.55); }}
.clear .box svg {{ width: 260px; max-width: 100%; height: auto; display: block; outline: 1px solid rgba(238,242,240,.18); }}
.clear .x {{ position: absolute; font: 500 12px var(--mono); color: var(--menthe); }}
.sizes {{ display: flex; flex-wrap: wrap; align-items: flex-end; gap: 22px; }}
.sizes div {{ display: grid; gap: 8px; justify-items: center; }}
.sizes svg {{ height: auto; display: block; }}

/* Déclinaisons */
.decl {{ display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }}
.tile {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 22px; display: grid; gap: 14px; align-content: start; min-width: 0; }}
.appicon {{ width: 96px; height: 96px; border-radius: 22px; background: var(--nuit); display: grid; place-items: center; box-shadow: 0 6px 18px rgba(11,17,22,.18); }}
.appicon svg {{ width: 74px; height: 74px; }}
.tab {{ display: flex; align-items: center; gap: 8px; background: var(--bg); border: 1px solid var(--line); border-radius: 10px 10px 0 0;
  padding: 8px 12px; font-size: 13px; max-width: 240px; }}
.tab svg {{ width: 16px; height: 16px; flex: none; }}
.receipt {{ background: #fff; color: #0B1116; border-radius: 12px; padding: 18px; display: grid; gap: 10px; border: 1px solid #DCE3E0; font-size: 12px; }}
.receipt svg {{ width: 120px; height: auto; }}
.receipt .row {{ display: flex; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }}
.receipt .sig {{ border-top: 1px solid #DCE3E0; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; color: #56616C; }}
.receipt .sig svg {{ width: 34px; }}
.mock {{ width: 100%; height: auto; border-radius: 16px; border: 1px solid var(--line); display: block; }}

/* Motif paraphe */
.flourish {{ display: block; width: 180px; height: 22px; }}
.flourish path {{ fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round; }}
.headline-demo {{ font: 800 clamp(26px, 4vw, 40px)/1.1 var(--display); letter-spacing: -0.03em; }}

/* À éviter */
.misuse {{ display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 12px; }}
.mu-item {{ margin: 0; display: grid; gap: 8px; }}
.mu-bg {{ aspect-ratio: 1; max-width: 100%; border-radius: 14px; display: grid; place-items: center; border: 1px solid var(--line); }}
.mu-bg.dark {{ background: var(--nuit); }}
.mu {{ width: 64%; height: auto; }}
.mu.rot {{ transform: rotate(-18deg); }} .mu.squash {{ transform: scaleX(1.45) scaleY(.8); }}
.mu.shadow {{ filter: drop-shadow(4px 6px 0 #E2574C) drop-shadow(0 0 10px #5FCB8E); }}
.mu.hue {{ filter: hue-rotate(160deg); }}
.mu-frame {{ width: 70%; aspect-ratio: 1; border: 3px solid #5FCB8E; border-radius: 50% 50% 8px 8px; display: grid; place-items: center; }}
.mu-frame .mu {{ width: 80%; }}
.mu-item figcaption {{ font-size: 12px; color: var(--muted); display: flex; gap: 6px; align-items: baseline; }}
.mu-item .x {{ color: #D9544A; font-weight: 700; }}

/* Voix */
.voice {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.voice .card p {{ font-size: 15px; }}
.do {{ color: var(--accent); font: 500 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }}
.dont {{ color: #D9544A; font: 500 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }}

table {{ border-collapse: collapse; width: 100%; font-size: 14px; }}
td {{ padding: 10px 12px 10px 0; border-bottom: 1px solid var(--line); vertical-align: top; }}
td code {{ font: 400 13px var(--mono); color: var(--accent); word-break: break-word; }}
.tablewrap {{ overflow-x: auto; }}
footer {{ padding-top: 32px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--line); }}
.toast {{ position: fixed; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
  background: var(--fg); color: var(--bg); font: 500 13px var(--mono); padding: 8px 14px; border-radius: 999px; }}

@media (max-width: 860px) {{
  .idea, .type, .rules, .voice {{ grid-template-columns: minmax(0,1fr); }}
  .swatches {{ grid-template-columns: repeat(2, minmax(0,1fr)); }}
  .decl {{ grid-template-columns: minmax(0,1fr); }}
  .misuse {{ grid-template-columns: repeat(3, minmax(0,1fr)); }}
}}
@media (max-width: 520px) {{ .versions {{ grid-template-columns: minmax(0,1fr); }} .s1 {{ font-size: 34px; }} }}
@media (prefers-reduced-motion: reduce) {{ .constr.play .spine {{ animation: none; }} }}
</style>

<header class="hero">
  <div class="in">
    <span class="eyebrow">Charte graphique · v1.0</span>
    {inline("bebail-horizontal-couleur-sombre.svg", "logo")}
    <h1>Une maison, un seul trait, <em>une signature.</em></h1>
    <p>Le symbole BeBail se dessine sans lever le stylo : l'amorce, les murs, le toit, puis le paraphe qui conclut le bail. C'est la promesse de la plateforme en un geste : tout réuni, réglé et signé.</p>
  </div>
</header>

<main class="wrap">

<section id="idee">
  <div class="head"><span class="eyebrow">01 · L'idée</span><h2>Le bail signé devient un chez-soi</h2></div>
  <div class="idea">
    <div style="display:grid;gap:12px">
      {construction}
      <button class="btn" type="button" id="replay">Rejouer le tracé</button>
    </div>
    <div style="display:grid;gap:16px">
      <p>La catégorie de la gestion locative répète les mêmes signes : immeubles, clés, toits posés sur une coche. BeBail se distingue par un geste humain plutôt qu'un pictogramme.</p>
      <ul>
        <li><b>Un trait continu</b> pour la simplicité : un seul outil, un seul espace.</li>
        <li><b>Le toit à 45° exacts</b>, construit sur une grille de 16 unités, pour la rigueur juridique.</li>
        <li><b>Le paraphe final</b> pour la signature électronique et la confiance.</li>
        <li><b>Des extrémités arrondies</b> pour la sérénité promise aux propriétaires.</li>
      </ul>
      <p class="note">Le symbole est dessiné comme une ligne de 26 unités d'épaisseur, puis vectorisé en formes pleines : il s'imprime, se brode et se découpe sans surprise.</p>
    </div>
  </div>
</section>

<section id="versions">
  <div class="head"><span class="eyebrow">02 · Versions du logo</span><h2>Quatre assemblages, deux univers</h2>
  <p class="muted">Sur fond sombre, le symbole et « Bail » passent en Menthe. Sur fond clair, ils passent en Sapin. Le logo horizontal est la version principale.</p></div>
  <div class="versions">
    <div class="vcell"><div class="v dark">{inline("bebail-horizontal-couleur-sombre.svg")}</div><span class="cap">Horizontal · sur Nuit (principal)</span></div>
    <div class="vcell"><div class="v light">{inline("bebail-horizontal-couleur-clair.svg")}</div><span class="cap">Horizontal · sur clair</span></div>
    <div class="vcell"><div class="v dark">{inline("bebail-empile-couleur-sombre.svg")}</div><span class="cap">Empilé · formats carrés et verticaux</span></div>
    <div class="vcell"><div class="v brume">{inline("bebail-empile-couleur-clair.svg")}</div><span class="cap">Empilé · sur Brume</span></div>
    <div class="vcell"><div class="v light">{inline("bebail-horizontal-noir.svg")}</div><span class="cap">Une couleur · noir (fax, tampon, gravure)</span></div>
    <div class="vcell"><div class="v sapin">{inline("bebail-horizontal-blanc.svg")}</div><span class="cap">Une couleur · blanc sur couleur ou photo</span></div>
    <div class="vcell"><div class="v dark sym">{inline("bebail-symbole-couleur-sombre.svg")}</div><span class="cap">Symbole seul · avatar, icône, filigrane</span></div>
    <div class="vcell"><div class="v light">{inline("bebail-mot-couleur-clair.svg")}</div><span class="cap">Mot-symbole seul · quand le symbole est déjà présent</span></div>
  </div>
</section>

<section id="couleurs">
  <div class="head"><span class="eyebrow">03 · Couleurs</span><h2>La nuit, et le vert de la sérénité</h2>
  <p class="muted">Menthe reprend le vert déjà présent sur bebail.com. Il manque de contraste sur blanc (2:1) : sur fond clair, il cède la place à Sapin. Cliquez un code pour le copier.</p></div>
  <div class="swatches">{sw_html}</div>
  <div style="display:grid;gap:8px">
    <div class="ratio" aria-label="Proportions : Nuit 60 %, Brume 30 %, vert 10 %"><span style="background:var(--nuit)"></span><span style="background:var(--brume)"></span><span style="background:var(--menthe)"></span></div>
    <p class="note">Dosage : 60 % Nuit, 30 % Brume ou blanc, 10 % de vert. Le vert signale ce qui compte (action, succès, marque), il ne remplit jamais de grandes surfaces. Les valeurs CMJN sont des conversions à faire valider par l'imprimeur sur épreuve.</p>
  </div>
</section>

<section id="typo">
  <div class="head"><span class="eyebrow">04 · Typographie</span><h2>Deux familles, libres de droits</h2></div>
  <div class="type">
    <div class="card">
      <span class="spec">Manrope · ExtraBold 800 · Bold 700 · Regular 400 · licence OFL</span>
      <div class="s1">Gérer son immobilier ne devrait pas être un second métier.</div>
      <div class="s2">Quittances automatiques, chaque mois.</div>
      <p class="s3">Contrats, quittances, documents, finances et suivi locataire réunis dans une seule plateforme. Titres en ExtraBold avec un interlettrage de −2 à −3 %, texte courant en Regular 16 px, interligne 1,6.</p>
    </div>
    <div class="card">
      <span class="spec">JetBrains Mono · Medium 500 · licence OFL</span>
      <div class="s4">Votre copilote intelligent</div>
      <div class="mono-big">3,99 €/mois</div>
      <p class="s3">Réservée aux étiquettes en capitales espacées (+18 %), aux montants, dates et références de documents. Elle évoque la précision et l'horodatage des signatures.</p>
    </div>
  </div>
  <p class="note">Le mot-symbole « BeBail » est dessiné à partir de Manrope 760, avec un interlettrage resserré, puis vectorisé : ne le recomposez pas au clavier, utilisez les fichiers fournis.</p>
</section>

<section id="regles">
  <div class="head"><span class="eyebrow">05 · Règles d'usage</span><h2>Zone de protection et tailles minimales</h2></div>
  <div class="rules">
    <div class="card" style="gap:16px">
      <h3>Zone de protection</h3>
      <div class="clear"><div class="box">{inline("bebail-horizontal-couleur-sombre.svg")}<span class="x" style="top:3px;left:50%">x</span><span class="x" style="left:6px;top:42%">x</span></div></div>
      <p class="muted" style="font-size:14px">x = hauteur du toit (de la faîtière à l'avant-toit). Aucun texte ni bord d'image n'entre dans cet espace.</p>
    </div>
    <div class="card" style="gap:16px">
      <h3>Tailles minimales</h3>
      <div class="sizes">
        <div>{inline("bebail-symbole-noir.svg").replace("<svg ", '<svg style="width:48px" ', 1)}<span class="cap">Symbole ≥ 24 px</span></div>
        <div>{inline("bebail-symbole-petit-noir.svg").replace("<svg ", '<svg style="width:20px" ', 1)}<span class="cap">Coupe petite 16–24 px</span></div>
        <div>{inline("bebail-horizontal-noir.svg").replace("<svg ", '<svg style="width:120px" ', 1)}<span class="cap">Horizontal ≥ 96 px · 25 mm</span></div>
      </div>
      <p class="muted" style="font-size:14px">En dessous de 24 px, utilisez la coupe petite taille : trait plus épais et boucle plus ouverte, pour que le paraphe ne se referme pas. Elle sert au favicon et aux icônes système.</p>
    </div>
  </div>
</section>

<section id="elements">
  <div class="head"><span class="eyebrow">06 · Élément graphique</span><h2>Le paraphe comme soulignement</h2>
  <p class="muted">La queue du symbole se détache pour souligner un mot clé, jamais plus d'une fois par écran ou par page.</p></div>
  <div class="card" style="gap:6px">
    <div class="headline-demo">Votre bail, signé en deux minutes.</div>
    <svg class="flourish" viewBox="0 0 180 22" aria-hidden="true"><path d="M4 12C40 12 58 6 84 8C110 10 128 18 176 12"/></svg>
  </div>
</section>

<section id="declinaisons">
  <div class="head"><span class="eyebrow">07 · Déclinaisons</span><h2>Du favicon à la quittance</h2></div>
  <div class="decl">
    <div class="tile"><h3>Icône d'appli</h3>
      <div class="appicon">{inline("bebail-symbole-petit-couleur-sombre.svg")}</div>
      <p class="muted" style="font-size:13px">Tuile Nuit, symbole Menthe à 72 % de la tuile. Fichiers 180, 192 et 512 px, plus une version adaptative (maskable).</p></div>
    <div class="tile"><h3>Onglet et favicon</h3>
      <div class="tab">{inline("charte/icones/favicon.svg")}<span>BeBail · Tableau de bord</span></div>
      <p class="muted" style="font-size:13px">Le favicon garde sa tuile Nuit pour rester lisible sur les onglets clairs comme sombres.</p></div>
    <div class="tile"><h3>Quittance de loyer</h3>
      <div class="receipt">
        {inline("bebail-horizontal-couleur-clair.svg")}
        <div class="row"><span>Quittance · octobre 2026</span><span>Réf. Q-014</span></div>
        <div class="row"><span>Loyer hors charges</span><span>780,00 €</span></div>
        <div class="row"><span>Provision sur charges</span><span>65,00 €</span></div>
        <div class="row"><b>Total réglé</b><b>845,00 €</b></div>
        <div class="sig"><span>Signé électroniquement · horodaté</span>{inline("bebail-symbole-couleur-clair.svg")}</div>
      </div></div>
  </div>
  <img class="mock" src="planches/maquettes.png" alt="Maquettes : site web, icône d'appli, onglet de navigateur, profil social, cartes de visite et carte de paiement BeBail">
</section>

<section id="eviter">
  <div class="head"><span class="eyebrow">08 · À éviter</span><h2>Ce que le logo ne supporte pas</h2></div>
  <div class="misuse">{mu_html}</div>
</section>

<section id="voix">
  <div class="head"><span class="eyebrow">09 · Ton</span><h2>Parler comme un voisin compétent</h2></div>
  <div class="voice">
    <div class="card"><span class="do">On écrit</span>
      <p>« Votre quittance d'octobre est partie. Rien à faire. »</p>
      <p>« 1 mois offert, sans carte bancaire. »</p>
      <p class="muted" style="font-size:14px">Phrases courtes, vouvoiement, bénéfice concret, chiffres réels.</p></div>
    <div class="card"><span class="dont">On évite</span>
      <p>« Révolutionnez votre expérience locative grâce à notre solution disruptive. »</p>
      <p class="muted" style="font-size:14px">Jargon, promesses vagues, anglicismes gratuits, points d'exclamation en série.</p></div>
  </div>
</section>

<section id="fichiers">
  <div class="head"><span class="eyebrow">10 · Fichiers</span><h2>Ce qui est livré</h2>
  <p class="muted">Tout se trouve dans le dossier <code>bebail-identite/charte/</code> du dépôt. Chaque logo existe en quatre déclinaisons : couleur-clair, couleur-sombre, noir, blanc.</p></div>
  <div class="tablewrap"><table>{files_html}</table></div>
  <p class="note">Avant dépôt de marque, faites faire une recherche d'antériorité (INPI, EUIPO) : cette charte ne remplace pas une vérification juridique.</p>
</section>

<footer>BeBail · Charte graphique v1.0 · septembre 2026</footer>
</main>
<div class="toast" id="toast" hidden></div>

<script>
(function () {{
  var fig = document.querySelector('.constr');
  document.getElementById('replay').addEventListener('click', function () {{
    fig.classList.remove('play'); void fig.getBoundingClientRect(); fig.classList.add('play');
  }});
  var toast = document.getElementById('toast'), t;
  function say(msg) {{ toast.textContent = msg; toast.hidden = false; clearTimeout(t); t = setTimeout(function () {{ toast.hidden = true; }}, 1600); }}
  document.querySelectorAll('[data-copy]').forEach(function (b) {{
    b.addEventListener('click', function () {{
      var v = b.getAttribute('data-copy');
      try {{
        navigator.clipboard.writeText(v).then(function () {{ say(v + ' copié'); }}, function () {{ say('Sélectionnez ' + v + ' pour le copier'); }});
      }} catch (e) {{ say('Sélectionnez ' + v + ' pour le copier'); }}
    }});
  }});
}})();
</script>
'''
open("charte/charte-bebail-v1.html", "w", encoding="utf-8").write(html)
print("ok", len(html) // 1024, "Ko")
