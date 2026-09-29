"""Charte BeBail : symbole Signature finalisé, lockups et déclinaisons couleur."""
import math, os
import textpath as tp
from outline import outline
OUT = "charte/logo"; os.makedirs(OUT, exist_ok=True)

C = dict(nuit="#0B1116", menthe="#5FCB8E", sapin="#17754A", brume="#EEF2F0", ardoise="#8B96A3", blanc="#FFFFFF")

# Ligne médiane du symbole (grille 256, toit à 45° exacts)
MASTER = ("M36 204C56 204 66 194 66 176V110L128 48L190 110V176"
          "C190 214 168 234 144 230C118 226 112 194 132 180C152 166 180 176 194 194C206 208 220 210 240 202")
# Coupe petite taille : trait plus épais, boucle plus ouverte, amorce raccourcie
SMALL = ("M40 202C58 202 64 192 64 176V112L128 48L192 112V172"
         "C192 218 164 238 138 230C110 222 108 186 132 172C156 158 186 172 198 192C208 208 222 210 236 204")
W_MASTER, W_SMALL = 26, 34

def svg(w, h, body, title, vb=None):
    vb = vb or f"0 0 {w:g} {h:g}"
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" width="{w:g}" height="{h:g}" role="img">'
            f'<title>{title}</title>{body}</svg>\n')

def symbol_d(small=False):
    return outline(SMALL if small else MASTER, W_SMALL if small else W_MASTER)

def centred(small=False):
    d, (x0, y0, x1, y1) = symbol_d(small)
    dx = 128 - (x0 + x1) / 2; dy = 128 - (y0 + y1) / 2 - 4   # centre optique légèrement haut
    return d, dx, dy, (x0, y0, x1, y1)

WM = dict(font="Manrope", wght=760, tracking=-3)
def wordmark(x, base, size, c_be, c_bail):
    gl, end = tp.glyphs("BeBail", WM["font"], WM["wght"], size, x, base, WM["tracking"] * size / 150)
    parts = []
    for i, (ch, d, _) in enumerate(gl):
        parts.append(f'<path fill="{c_be if i < 2 else c_bail}" d="{d}"/>')
    return "".join(parts), end

SCHEMES = {  # nom: (symbole, "Be", "Bail", fond d'aperçu)
    "couleur-clair": (C["sapin"], C["nuit"], C["sapin"]),
    "couleur-sombre": (C["menthe"], C["blanc"], C["menthe"]),
    "noir": (C["nuit"], C["nuit"], C["nuit"]),
    "blanc": (C["blanc"], C["blanc"], C["blanc"]),
}

def sym_group(color, small=False, scale=1, tx=0, ty=0):
    d, dx, dy, _ = centred(small)
    return (f'<g id="symbole" transform="translate({tx:g} {ty:g}) scale({scale:g}) translate({dx:.2f} {dy:.2f})">'
            f'<path fill="{color}" fill-rule="evenodd" d="{d}"/></g>')

def build():
    files = []
    for name, (cs, cb, cl) in SCHEMES.items():
        # symbole
        for small in (False, True):
            fn = f"{OUT}/bebail-symbole{'-petit' if small else ''}-{name}.svg"
            open(fn, "w").write(svg(256, 256, sym_group(cs, small), "BeBail"))
        # horizontal : symbole 256, capitale ≈ 0,42 × 256 ; alignée sur le corps de la maison
        size = 150; cap = 0.72 * size
        body, end = wordmark(0, 0, size, cb, cl)
        _, dx, dy, (x0, y0, x1, y1) = centred()
        sym_right = x1 + dx
        gap = 0.22 * 256
        base = 128 + cap / 2 + 6
        wx = sym_right + gap
        body, end = wordmark(wx, base, size, cb, cl)
        left = x0 + dx
        w = end + 8 - left + 8
        g = f'<g transform="translate({-left + 8:.2f} 0)">{sym_group(cs)}<g id="mot">{body}</g></g>'
        open(f"{OUT}/bebail-horizontal-{name}.svg", "w").write(svg(round(w), 256, g, "BeBail"))
        # empilé : symbole au-dessus, mot centré dessous
        size2 = 118; cap2 = 0.72 * size2
        _, e2 = wordmark(0, 0, size2, cb, cl)
        W = max(e2, 256) + 48
        sx = (W - 256) / 2
        H = 256 + 24 + cap2 + 40
        body2, _ = wordmark((W - e2) / 2, 256 + 24 + cap2, size2, cb, cl)
        g2 = f'{sym_group(cs, tx=sx)}<g id="mot">{body2}</g>'
        open(f"{OUT}/bebail-empile-{name}.svg", "w").write(svg(round(W), round(H), g2, "BeBail"))
        # mot-symbole seul
        size3 = 150; body3, e3 = wordmark(8, 8 + cap + 0, size3, cb, cl)
        open(f"{OUT}/bebail-mot-{name}.svg", "w").write(svg(round(e3 + 8), round(cap + 16), body3, "BeBail"))
    print("ok")

if __name__ == "__main__":
    build()
