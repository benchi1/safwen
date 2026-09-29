"""Charte graphique bebail v2 (b-signature, Encre & Pierre) en une page HTML."""
import os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "v2"))
import build as B

L = "v2/logo/"
P = B.P


def inline(name, cls="", label="bebail", style=""):
    path = name if "/" in name else L + name
    s = open(path, encoding="utf-8").read()
    s = re.sub(r"<title>.*?</title>", "", s)
    s = re.sub(r'\s(width|height)="[^"]*"', "", s, count=2)
    extra = f' style="{style}"' if style else ""
    return s.replace("<svg ", f'<svg class="{cls}" aria-label="{label}"{extra} ', 1)


g = B.symbol_geom(); x0, y0, x1, y1 = g.bounds
dx, dy = 128 - (x0 + x1) / 2, 128 - (y0 + y1) / 2 - 3
fill_d = B.to_d(B.centred_symbol())

grid = "".join(f'<line x1="{i}" y1="0" x2="{i}" y2="256"/><line x1="0" y1="{i}" x2="256" y2="{i}"/>'
               for i in range(0, 257, 16))
construction = f'''
<svg class="constr" viewBox="0 0 256 256" role="img" aria-label="Construction du symbole sur une grille de 16 unités">
  <g class="grid">{grid}</g>
  <path class="fill" fill-rule="evenodd" d="{fill_d}"/>
  <g transform="translate({dx:.2f} {dy:.2f})">
    <path class="spine sp1" pathLength="1" d="{B.STROKES[0]}"/>
    <path class="spine sp2" pathLength="1" d="{B.STROKES[1]}"/>
    <circle class="pt" cx="136" cy="64" r="3.2"/><circle class="pt" cx="80" cy="120" r="3.2"/><circle class="pt" cx="192" cy="120" r="3.2"/>
    <text class="lbl" x="144" y="56">45°</text>
    <text class="lbl" x="92" y="44">fût du b</text>
    <text class="lbl" x="196" y="236">paraphe</text>
  </g>
</svg>'''

swatches = [
    ("Encre", P["encre"], "47 59 255", "82 77 0 0", "Logo, boutons, liens. Jamais en grand aplat de texte.", "6,6:1 sur blanc · 5,4:1 sur Pierre"),
    ("Pierre", P["pierre"], "236 232 225", "0 2 5 7", "Fond principal clair, documents, quittances.", "15:1 avec Nuit"),
    ("Nuit", P["nuit"], "14 17 38", "63 55 0 85", "Texte principal, fond du mode sombre.", "17:1 sur Pierre"),
    ("Ciel", P["ciel"], "142 151 255", "44 41 0 0", "L'encre en mode sombre : logo et liens sur Nuit.", "7,1:1 sur Nuit"),
    ("Zinc", P["zinc"], "86 97 107", "20 9 0 58", "Texte secondaire, légendes, bordures fortes.", "5,1:1 sur Pierre"),
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

mu = [
    ("Encre sur Nuit", f'<div class="mu-bg" style="background:{P["nuit"]}">{inline("bebail-symbole-pierre.svg","mu")}</div>'),
    ("Rotation", f'<div class="mu-bg">{inline("bebail-symbole-pierre.svg","mu rot")}</div>'),
    ("Déformation", f'<div class="mu-bg">{inline("bebail-symbole-pierre.svg","mu squash")}</div>'),
    ("Dégradé ou ombre", f'<div class="mu-bg">{inline("bebail-symbole-pierre.svg","mu shadow")}</div>'),
    ("Autre couleur", f'<div class="mu-bg">{inline("bebail-symbole-pierre.svg","mu hue")}</div>'),
    ("Nom recomposé", '<div class="mu-bg"><span class="mu-type">BeBail</span></div>'),
]
mu_html = "".join(f'<figure class="mu-item">{a}<figcaption><span class="x" aria-hidden="true">✕</span>{t}</figcaption></figure>' for t, a in mu)

files = [
    ("v2/logo/bebail-horizontal-*.svg", "Logo horizontal : pierre, nuit, encre (blanc), noir"),
    ("v2/logo/bebail-empile-*.svg", "Logo empilé"),
    ("v2/logo/bebail-symbole-*.svg", "Symbole seul, dès 24 px"),
    ("v2/logo/bebail-symbole-petit-*.svg", "Coupe petite taille, 16 à 24 px"),
    ("v2/logo/bebail-mot-*.svg", "Mot « bebail » seul"),
    ("v2/logo/bebail-trace-anime-*.svg", "Tracé animé : chargement, confirmation de signature"),
    ("v2/icones/favicon.svg · favicon.ico", "Favicon sur tuile Encre"),
    ("v2/icones/icon-192/512.png · apple-touch-icon.png · maskable-512.png", "Icônes d'appli et PWA"),
    ("v2/icones/site.webmanifest · head-snippet.html", "Intégration web prête à copier"),
    ("v2/presentation.html · v2/planches/", "Présentation et maquettes"),
]
files_html = "".join(f"<tr><td><code>{f}</code></td><td>{d}</td></tr>" for f, d in files)

anim_css = f'''
.trace .s {{ fill: none; stroke: currentColor; stroke-width: {B.W}; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 0; }}
.trace.play .s1 {{ animation: t1 1.1s cubic-bezier(.55,.05,.35,1) both; }}
.trace.play .s2 {{ animation: t2 1.6s cubic-bezier(.55,.05,.35,1) both; }}
@keyframes t1 {{ 0% {{ stroke-dashoffset: 1; opacity: 0; }} 4% {{ opacity: 1; }} 100% {{ stroke-dashoffset: 0; }} }}
@keyframes t2 {{ 0%, 55% {{ stroke-dashoffset: 1; opacity: 0; }} 58% {{ opacity: 1; }} 100% {{ stroke-dashoffset: 0; }} }}
'''
trace_svg = (f'<svg class="trace" viewBox="0 0 256 256" aria-label="Tracé du symbole bebail"><g transform="translate({dx:.2f} {dy:.2f})">'
             f'<path class="s s1" pathLength="1" d="{B.STROKES[0]}"/><path class="s s2" pathLength="1" d="{B.STROKES[1]}"/></g></svg>')

html = f'''<title>Charte bebail</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700;800&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* Mise en page : colonne de 1080 px sur Pierre ; l'encre ne sert qu'aux signes qui comptent */
:root {{
  --encre: {P["encre"]}; --ciel: {P["ciel"]}; --pierre: {P["pierre"]}; --nuit: {P["nuit"]}; --zinc: {P["zinc"]};
  --bg: {P["pierre"]}; --surface: #F7F5F1; --fg: {P["nuit"]}; --muted: {P["zinc"]}; --line: #D9D3C8; --accent: {P["encre"]};
  --grid: #E2DDD3; --danger: #C8412F;
  --display: "Manrope", "Segoe UI", system-ui, sans-serif;
  --mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, monospace;
  color-scheme: light;
}}
@media (prefers-color-scheme: dark) {{ :root:not([data-theme="light"]) {{
  --bg: {P["nuit"]}; --surface: #151936; --fg: #ECE8E1; --muted: #9AA3AD; --line: #262B4A; --accent: {P["ciel"]};
  --grid: #1C2143; --danger: #FF8A78; color-scheme: dark; }} }}
:root[data-theme="dark"] {{
  --bg: {P["nuit"]}; --surface: #151936; --fg: #ECE8E1; --muted: #9AA3AD; --line: #262B4A; --accent: {P["ciel"]};
  --grid: #1C2143; --danger: #FF8A78; color-scheme: dark; }}
* {{ box-sizing: border-box; }}
body {{ background: var(--bg); color: var(--fg); font: 400 16px/1.6 var(--display); margin: 0; }}
.wrap {{ max-width: 1080px; margin: 0 auto; padding-inline: 20px; padding-block: 0 80px; }}
h1, h2, h3 {{ text-wrap: balance; margin: 0; letter-spacing: -0.025em; }}
h2 {{ font-size: clamp(26px, 4vw, 38px); font-weight: 800; line-height: 1.1; }}
h3 {{ font-size: 18px; font-weight: 700; }}
p {{ margin: 0; max-width: 64ch; }}
code {{ font-family: var(--mono); font-size: .9em; }}
.eyebrow {{ font: 500 12px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }}
.muted {{ color: var(--muted); }}
section {{ display: grid; gap: 24px; padding-block: 56px; border-top: 1px solid var(--line); }}
.head {{ display: grid; gap: 10px; }}
.note {{ font-size: 14px; color: var(--muted); }}

/* Hero : toujours Pierre + Encre, l'univers principal de la marque */
.hero {{ background: {P["pierre"]}; color: {P["nuit"]}; padding: 56px 20px 64px; border-bottom: 1px solid #D9D3C8; }}
.hero .in {{ max-width: 1040px; margin: 0 auto; display: grid; grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); gap: 32px; align-items: center; }}
.hero .copy {{ display: grid; gap: 24px; justify-items: start; }}
.hero .logo {{ width: min(360px, 100%); height: auto; }}
.hero h1 {{ font-size: clamp(32px, 5.2vw, 58px); font-weight: 800; line-height: 1.04; max-width: 15ch; }}
.hero h1 em {{ font-style: normal; color: {P["encre"]}; }}
.hero p {{ color: #3E4751; font-size: 18px; }}
.hero .eyebrow {{ color: {P["encre"]}; }}
.hero .stage {{ background: {P["encre"]}; color: #fff; border-radius: 28px; aspect-ratio: 1; max-width: 100%; display: grid; place-items: center; position: relative; }}
.hero .stage .trace {{ width: 62%; height: auto; }}
.replay {{ position: absolute; right: 14px; bottom: 14px; font: 500 12px var(--mono); color: #fff; background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.35); border-radius: 999px; padding: 7px 12px; cursor: pointer; }}
.replay:hover {{ background: rgba(255,255,255,.24); }}
.replay:focus-visible, .hex:focus-visible, .btn:focus-visible {{ outline: 2px solid var(--accent); outline-offset: 2px; }}
{anim_css}

/* Idée */
.idea {{ display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 32px; align-items: center; }}
.constr {{ width: 100%; max-width: 440px; height: auto; background: var(--surface); border: 1px solid var(--line); border-radius: 20px; }}
.constr .grid line {{ stroke: var(--grid); stroke-width: .6; }}
.constr .fill {{ fill: var(--fg); opacity: .08; }}
.constr .spine {{ fill: none; stroke: var(--accent); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }}
.constr .pt {{ fill: var(--accent); }}
.constr .lbl {{ font: 500 8px var(--mono); fill: var(--muted); }}
.idea ul {{ margin: 0; padding-left: 18px; display: grid; gap: 8px; }}

/* Versions */
.versions {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.vcell {{ display: grid; gap: 8px; }}
.v {{ border-radius: 18px; padding: 36px 28px; display: grid; place-items: center; min-height: 190px; border: 1px solid var(--line); }}
.v svg {{ width: 100%; max-width: 300px; height: auto; max-height: 150px; }}
.v.sym svg {{ max-width: 120px; }}
.v.pierre {{ background: {P["pierre"]}; border-color: #D9D3C8; }} .v.blanc {{ background: #fff; border-color: #E4E0D8; }}
.v.nuit {{ background: {P["nuit"]}; border-color: #262B4A; }} .v.encre {{ background: {P["encre"]}; border-color: {P["encre"]}; }}
.cap {{ font: 500 12px var(--mono); color: var(--muted); letter-spacing: .03em; }}

/* Couleurs */
.swatches {{ display: grid; grid-template-columns: repeat(5, minmax(0,1fr)); gap: 14px; }}
.sw {{ margin: 0; display: grid; gap: 12px; align-content: start; min-width: 0; }}
.chip {{ aspect-ratio: 4/5; max-width: 100%; border-radius: 16px; border: 1px solid var(--line); }}
.sw b {{ font: 700 17px var(--display); display: block; }}
.hex {{ font: 500 13px var(--mono); color: var(--accent); background: none; border: 0; padding: 0; cursor: copy; }}
.sw dl {{ display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; margin: 6px 0; font: 400 12px var(--mono); color: var(--muted); font-variant-numeric: tabular-nums; }}
.sw dd {{ margin: 0; }}
.sw p {{ font-size: 13px; color: var(--muted); }}
.story {{ display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 12px; }}
.story div {{ border-top: 3px solid; padding-top: 10px; font-size: 14px; }}
.story b {{ display: block; font-size: 15px; }}
.ratio {{ display: grid; grid-template-columns: 60fr 30fr 10fr; height: 18px; border-radius: 999px; overflow: hidden; max-width: 560px; border: 1px solid var(--line); }}

/* Typo */
.type {{ display: grid; grid-template-columns: minmax(0,1.4fr) minmax(0,1fr); gap: 16px; }}
.card {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 28px; display: grid; gap: 14px; align-content: start; min-width: 0; }}
.spec {{ font: 400 12px var(--mono); color: var(--muted); }}
.s1 {{ font: 800 44px/1.05 var(--display); letter-spacing: -0.035em; }}
.s2 {{ font: 700 24px/1.2 var(--display); letter-spacing: -0.015em; }}
.s3 {{ font: 400 16px/1.6 var(--display); color: var(--muted); }}
.s4 {{ font: 500 12px/1 var(--mono); letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }}
.mono-big {{ font: 500 30px/1.2 var(--mono); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }}

/* Règles */
.rules {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.clear {{ background: {P["pierre"]}; border: 1px solid #D9D3C8; border-radius: 18px; padding: 28px; display: grid; place-items: center; }}
.clear .box {{ position: relative; padding: 24px; outline: 1.5px dashed rgba(47,59,255,.55); }}
.clear .box svg {{ width: 260px; max-width: 100%; height: auto; display: block; outline: 1px solid rgba(14,17,38,.14); }}
.clear .x {{ position: absolute; font: 500 12px var(--mono); color: {P["encre"]}; }}
.sizes {{ display: flex; flex-wrap: wrap; align-items: flex-end; gap: 22px; }}
.sizes div {{ display: grid; gap: 8px; justify-items: center; }}
.sizes svg {{ height: auto; display: block; color: var(--fg); }}

/* Déclinaisons */
.decl {{ display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; }}
.tile {{ background: var(--surface); border: 1px solid var(--line); border-radius: 18px; padding: 22px; display: grid; gap: 14px; align-content: start; min-width: 0; }}
.appicon {{ width: 96px; height: 96px; border-radius: 22px; background: {P["encre"]}; display: grid; place-items: center; box-shadow: 0 8px 20px rgba(47,59,255,.28); }}
.appicon svg {{ width: 64px; height: 64px; }}
.loader {{ width: 96px; height: 96px; border-radius: 22px; background: {P["nuit"]}; color: {P["ciel"]}; display: grid; place-items: center; }}
.loader .trace {{ width: 64px; height: 64px; }}
.receipt {{ background: #fff; color: {P["nuit"]}; border-radius: 12px; padding: 18px; display: grid; gap: 10px; border: 1px solid #E4E0D8; font-size: 12px; }}
.receipt > svg {{ width: 110px; height: auto; }}
.receipt .row {{ display: flex; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }}
.receipt .sig {{ border-top: 1px solid #E4E0D8; padding-top: 10px; display: flex; justify-content: space-between; align-items: center; color: {P["zinc"]}; gap: 8px; }}
.receipt .sig svg {{ width: 30px; flex: none; }}
.mock {{ width: 100%; height: auto; border-radius: 16px; border: 1px solid var(--line); display: block; }}
.btn-demo {{ display: inline-flex; align-items: center; gap: 8px; background: {P["encre"]}; color: #fff; font: 700 15px var(--display); border-radius: 999px; padding: 12px 20px; }}
.btn-ghost {{ display: inline-flex; background: transparent; color: var(--fg); font: 700 15px var(--display); border-radius: 999px; padding: 11px 19px; border: 1px solid var(--line); }}
.row-btns {{ display: flex; flex-wrap: wrap; gap: 10px; }}

/* Élément graphique */
.flourish {{ display: block; width: 190px; height: 24px; }}
.flourish path {{ fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round; }}
.headline-demo {{ font: 800 clamp(26px, 4vw, 42px)/1.1 var(--display); letter-spacing: -0.035em; }}

/* À éviter */
.misuse {{ display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 12px; }}
.mu-item {{ margin: 0; display: grid; gap: 8px; align-content: start; }}
.mu-bg {{ aspect-ratio: 1; max-width: 100%; border-radius: 14px; display: grid; place-items: center; border: 1px solid #D9D3C8; background: {P["pierre"]}; }}
.mu {{ width: 62%; height: auto; }}
.mu.rot {{ transform: rotate(-18deg); }} .mu.squash {{ transform: scaleX(1.45) scaleY(.8); }}
.mu.shadow {{ filter: drop-shadow(4px 6px 0 #FF7A59) drop-shadow(0 0 12px #8E97FF); }}
.mu.hue {{ filter: hue-rotate(120deg); }}
.mu-type {{ font: 800 22px Georgia, serif; color: {P["encre"]}; }}
.mu-item figcaption {{ font-size: 12px; color: var(--muted); display: flex; gap: 6px; align-items: baseline; }}
.mu-item .x {{ color: var(--danger); font-weight: 700; }}

/* Voix */
.voice {{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px; }}
.do {{ color: var(--accent); font: 500 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }}
.dont {{ color: var(--danger); font: 500 12px var(--mono); letter-spacing: .12em; text-transform: uppercase; }}

table {{ border-collapse: collapse; width: 100%; font-size: 14px; }}
td {{ padding: 10px 12px 10px 0; border-bottom: 1px solid var(--line); vertical-align: top; }}
td code {{ color: var(--accent); word-break: break-word; }}
.tablewrap {{ overflow-x: auto; }}
footer {{ padding-top: 32px; font-size: 13px; color: var(--muted); border-top: 1px solid var(--line); }}
.toast {{ position: fixed; left: 50%; bottom: calc(20px + env(safe-area-inset-bottom, 0px)); transform: translateX(-50%);
  background: var(--fg); color: var(--bg); font: 500 13px var(--mono); padding: 8px 14px; border-radius: 999px; }}

@media (max-width: 860px) {{
  .hero .in, .idea, .type, .rules, .voice {{ grid-template-columns: minmax(0,1fr); }}
  .hero .stage {{ max-width: 360px; }}
  .swatches {{ grid-template-columns: repeat(2, minmax(0,1fr)); }}
  .story {{ grid-template-columns: repeat(2, minmax(0,1fr)); }}
  .decl {{ grid-template-columns: minmax(0,1fr); }}
  .misuse {{ grid-template-columns: repeat(3, minmax(0,1fr)); }}
}}
@media (max-width: 520px) {{ .versions {{ grid-template-columns: minmax(0,1fr); }} .s1 {{ font-size: 34px; }} }}
@media (prefers-reduced-motion: reduce) {{ .trace.play .s {{ animation: none; }} }}
</style>

<header class="hero">
  <div class="in">
    <div class="copy">
      <span class="eyebrow">Charte graphique · v2.0</span>
      {inline("bebail-horizontal-pierre.svg", "logo")}
      <h1>L'initiale, la maison et la signature, <em>en un trait.</em></h1>
      <p>Le b de bebail abrite un logement, et son pied file en paraphe comme au bas d'un bail. Encre sur pierre : la couleur du stylo sur celle des façades.</p>
    </div>
    <div class="stage">{trace_svg}<button class="replay" type="button" data-replay>Rejouer le tracé</button></div>
  </div>
</header>

<main class="wrap">

<section id="idee">
  <div class="head"><span class="eyebrow">01 · L'idée</span><h2>Un b qui loge, un pied qui signe</h2></div>
  <div class="idea">
    {construction}
    <div style="display:grid;gap:16px">
      <p>La gestion locative répète les mêmes signes : immeubles, clés, toits posés sur une coche. bebail part de sa propre initiale.</p>
      <ul>
        <li><b>Le fût du b</b> dépasse le toit : on lit la lettre avant la maison.</li>
        <li><b>La panse est un logement</b>, toit à 45° exacts, sur une grille de 16 unités.</li>
        <li><b>Le pied file en paraphe</b> : la signature électronique, la valeur juridique.</li>
        <li><b>Un seul trait de 28 unités</b>, extrémités arrondies, pour la sérénité.</li>
      </ul>
      <p class="note">Le pied du « l » dans le mot « bebail » reprend le même paraphe : le nom et le symbole se répondent.</p>
    </div>
  </div>
</section>

<section id="versions">
  <div class="head"><span class="eyebrow">02 · Versions du logo</span><h2>Quatre fonds, un seul geste</h2>
  <p class="muted">La version principale est le logo horizontal en Encre sur Pierre. Sur Nuit, le symbole passe en Ciel. Sur Encre, tout passe en blanc.</p></div>
  <div class="versions">
    <div class="vcell"><div class="v pierre">{inline("bebail-horizontal-pierre.svg")}</div><span class="cap">Horizontal · Encre sur Pierre (principal)</span></div>
    <div class="vcell"><div class="v nuit">{inline("bebail-horizontal-nuit.svg")}</div><span class="cap">Horizontal · mode sombre</span></div>
    <div class="vcell"><div class="v encre">{inline("bebail-empile-encre.svg")}</div><span class="cap">Empilé · blanc sur Encre</span></div>
    <div class="vcell"><div class="v blanc">{inline("bebail-empile-pierre.svg")}</div><span class="cap">Empilé · sur blanc</span></div>
    <div class="vcell"><div class="v blanc">{inline("bebail-horizontal-noir.svg")}</div><span class="cap">Une couleur · noir (tampon, gravure, fax)</span></div>
    <div class="vcell"><div class="v nuit sym">{inline("bebail-symbole-nuit.svg")}</div><span class="cap">Symbole seul · avatar, filigrane</span></div>
    <div class="vcell"><div class="v pierre">{inline("bebail-mot-pierre.svg")}</div><span class="cap">Mot seul · quand le symbole est déjà présent</span></div>
    <div class="vcell"><div class="v encre sym">{inline("bebail-symbole-encre.svg")}</div><span class="cap">Symbole blanc sur Encre · icônes, pastilles</span></div>
  </div>
</section>

<section id="couleurs">
  <div class="head"><span class="eyebrow">03 · Couleurs</span><h2>Des murs de pierre, un toit de zinc, une signature à l'encre</h2>
  <p class="muted">Une palette tirée de l'immeuble parisien et du geste de signer. Cliquez un code pour le copier.</p></div>
  <div class="swatches">{sw_html}</div>
  <div class="story">
    <div style="border-color:{P["pierre"]}"><b>Pierre</b>les façades, le calme</div>
    <div style="border-color:{P["zinc"]}"><b>Zinc</b>les toits, la solidité</div>
    <div style="border-color:{P["encre"]}"><b>Encre</b>la signature, l'action</div>
    <div style="border-color:{P["nuit"]}"><b>Nuit</b>le texte, la sérénité du soir</div>
  </div>
  <div style="display:grid;gap:8px">
    <div class="ratio" aria-label="Proportions : Pierre 60 %, Nuit 30 %, Encre 10 %"><span style="background:{P["pierre"]}"></span><span style="background:{P["nuit"]}"></span><span style="background:{P["encre"]}"></span></div>
    <p class="note">Dosage : 60 % Pierre ou blanc, 30 % Nuit (texte), 10 % Encre. L'encre est vive : elle signale l'action et la marque, jamais de grands aplats derrière du texte long. Les CMJN sont des conversions à valider par l'imprimeur sur épreuve.</p>
  </div>
</section>

<section id="typo">
  <div class="head"><span class="eyebrow">04 · Typographie</span><h2>Deux familles, libres de droits</h2></div>
  <div class="type">
    <div class="card">
      <span class="spec">Manrope · ExtraBold 800 · Bold 700 · Regular 400 · licence OFL</span>
      <div class="s1">Gérer son immobilier ne devrait pas être un second métier.</div>
      <div class="s2">Quittances automatiques, chaque mois.</div>
      <p class="s3">Contrats, quittances, documents, finances et suivi locataire réunis dans une seule plateforme. Titres en ExtraBold, interlettrage de −2 à −3,5 %. Texte courant en Regular 16 px, interligne 1,6.</p>
    </div>
    <div class="card">
      <span class="spec">JetBrains Mono · Medium 500 · licence OFL</span>
      <div class="s4">Votre copilote intelligent</div>
      <div class="mono-big">3,99 €/mois</div>
      <p class="s3">Étiquettes en capitales espacées (+18 %), montants, dates, références de documents. La précision de l'horodatage.</p>
    </div>
  </div>
  <p class="note">Le mot « bebail » s'écrit toujours en minuscules et d'une seule couleur. Il est dessiné à partir de Manrope 700 avec un « l » redessiné : utilisez les fichiers fournis, ne le recomposez pas au clavier.</p>
</section>

<section id="regles">
  <div class="head"><span class="eyebrow">05 · Règles d'usage</span><h2>Zone de protection et tailles minimales</h2></div>
  <div class="rules">
    <div class="card" style="gap:16px">
      <h3>Zone de protection</h3>
      <div class="clear"><div class="box">{inline("bebail-horizontal-pierre.svg")}<span class="x" style="top:4px;left:50%">x</span><span class="x" style="left:7px;top:42%">x</span></div></div>
      <p class="muted" style="font-size:14px">x = hauteur du toit, de la faîtière à l'avant-toit. Rien n'entre dans cet espace.</p>
    </div>
    <div class="card" style="gap:16px">
      <h3>Tailles minimales</h3>
      <div class="sizes">
        <div>{inline("bebail-symbole-noir.svg", style="width:48px").replace("#000000","currentColor")}<span class="cap">Symbole ≥ 24 px</span></div>
        <div>{inline("bebail-symbole-petit-noir.svg", style="width:20px").replace("#000000","currentColor")}<span class="cap">Coupe petite 16–24 px</span></div>
        <div>{inline("bebail-horizontal-noir.svg", style="width:120px").replace("#000000","currentColor")}<span class="cap">Horizontal ≥ 96 px · 25 mm</span></div>
      </div>
      <p class="muted" style="font-size:14px">Sous 24 px, la coupe petite taille prend le relais : trait plus épais, panse plus large. Elle sert au favicon et aux icônes système.</p>
    </div>
  </div>
</section>

<section id="elements">
  <div class="head"><span class="eyebrow">06 · Éléments graphiques</span><h2>Le paraphe, le tracé, le bouton</h2>
  <p class="muted">Le paraphe souligne un mot clé, une fois par écran au plus. Le tracé animé accompagne le chargement et la confirmation « Bail signé ».</p></div>
  <div class="card" style="gap:18px">
    <div style="display:grid;gap:4px">
      <div class="headline-demo">Votre bail, signé en deux minutes.</div>
      <svg class="flourish" viewBox="0 0 190 24" aria-hidden="true"><path d="M4 14C44 14 70 16 104 15C136 14 160 12 184 4"/></svg>
    </div>
    <div class="row-btns"><span class="btn-demo">Essai gratuit</span><span class="btn-ghost">Découvrir l'assistant IA</span></div>
  </div>
</section>

<section id="declinaisons">
  <div class="head"><span class="eyebrow">07 · Déclinaisons</span><h2>Du favicon à la quittance</h2></div>
  <div class="decl">
    <div class="tile"><h3>Icône d'appli</h3>
      <div class="appicon">{inline("bebail-symbole-petit-encre.svg")}</div>
      <p class="muted" style="font-size:13px">Symbole blanc sur tuile Encre. Fichiers 180, 192 et 512 px, plus une version adaptative (maskable).</p></div>
    <div class="tile"><h3>Chargement</h3>
      <div class="loader">{trace_svg.replace('class="trace"', 'class="trace" data-loop')}</div>
      <p class="muted" style="font-size:13px">Le tracé se dessine en 1,6 s, en Ciel sur Nuit ou en Encre sur Pierre. Fichiers SVG animés fournis.</p></div>
    <div class="tile"><h3>Quittance de loyer</h3>
      <div class="receipt">
        {inline("bebail-horizontal-pierre.svg")}
        <div class="row"><span>Quittance · octobre 2026</span><span>Réf. Q-014</span></div>
        <div class="row"><span>Loyer hors charges</span><span>780,00 €</span></div>
        <div class="row"><span>Provision sur charges</span><span>65,00 €</span></div>
        <div class="row"><b>Total réglé</b><b>845,00 €</b></div>
        <div class="sig"><span>Signé électroniquement · horodaté</span>{inline("bebail-symbole-pierre.svg")}</div>
      </div></div>
  </div>
  <img class="mock" src="planches/maquettes-v2.png" alt="Maquettes bebail : site web, icône d'appli, onglet de navigateur, profil social, cartes de visite et carte de paiement">
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
  <p class="muted">Tout se trouve dans <code>bebail-identite/v2/</code> du dépôt. Chaque logo existe en quatre versions : pierre (couleur sur clair), nuit (mode sombre), encre (blanc), noir.</p></div>
  <div class="tablewrap"><table>{files_html}</table></div>
  <p class="note">Avant dépôt de marque, faites faire une recherche d'antériorité (INPI, EUIPO). Cette charte ne remplace pas une vérification juridique.</p>
</section>

<footer>bebail · Charte graphique v2.0 · septembre 2026</footer>
</main>
<div class="toast" id="toast" hidden></div>

<script>
(function () {{
  var hero = document.querySelector('.stage .trace');
  function play(el) {{ el.classList.remove('play'); void el.getBoundingClientRect(); el.classList.add('play'); }}
  document.querySelector('[data-replay]').addEventListener('click', function () {{ play(hero); }});
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var loop = document.querySelector('[data-loop]');
  if (loop && !reduce) setInterval(function () {{ play(loop); }}, 3200);
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
open("charte/charte-bebail.html", "w", encoding="utf-8").write(html)
print("ok", len(html) // 1024, "Ko")
