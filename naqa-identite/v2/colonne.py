"""Naqaa v6 : colonne koufie نقاء + étoile + barres, texte empilé. Esprit Mosquée de Paris, signes propres à Naqaa."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shapely.geometry import box
from shapely.ops import unary_union
from shapely import affinity
import glyphs as G
from build_concepts import to_d, svg

U = 16
ROWS = [
"#.###....",
"#.#.....#",
"#.###....",
"#.......#",
"#..#.#..#",
"#.......#",
"#..###..#",
"#..#.#..#",
"#..#.#..#",
"#..#.#..#",
"#########",
".........",
"#########",
".........",
"#########",
".........",
"#########",
]
def kufi():
    return unary_union([box(x*U, y*U, (x+1)*U, (y+1)*U) for y, r in enumerate(ROWS) for x, c in enumerate(r) if c == '#'])

def star(cx, cy, r):
    s = r/math.sqrt(2); sq = box(cx-s, cy-s, cx+s, cy+s)
    return unary_union([sq, affinity.rotate(sq, 45, origin=(cx, cy))])

def symbol():
    st = star(4.5*U, -2.1*U, 1.5*U)
    return kufi(), st

def lockup(font, name, lines=("NAQAA", "IHRAM"), track=0.02):
    k, st = symbol(); g = unary_union([k, st]); x0, y0, x1, y1 = g.bounds; pad = 24
    T = lambda s: affinity.translate(s, pad-x0, pad-y0)
    k, st = T(k), T(st); oy = pad - y0
    body = f'<path fill="#000" d="{to_d(k)}"/><path fill="#001" d="{to_d(st)}"/>'
    # texte : du haut du rang 3 au bas de la dernière barre (rang 16)
    top, bot = oy + 4*U, oy + 17*U; n = len(lines); gr = 0.42
    c = (bot-top)/(n + (n-1)*gr); xt = k.bounds[2] + 1.9*U; out = []; mw = 0
    for i, t in enumerate(lines):
        d, bb = G.shape(t, font, 100, 0, 0); size = 100*c/(bb[3]-bb[1])
        d, bb = G.shape(t, font, size, 0, 0, tracking=size*track)
        base = top + c*(i+1) + c*gr*i
        out.append(f'<path fill="#002" transform="translate({xt-bb[0]:.2f} {base:.2f})" d="{d}"/>'); mw = max(mw, bb[2]-bb[0])
    W = math.ceil(xt + mw + pad); H = math.ceil(k.bounds[3] + pad)
    open(f"v2/{name}.svg", "w").write(svg(W, H, body + "".join(out), "Naqaa Ihram"))
    open(f"v2/naqaa6-symbole.svg", "w").write(svg(math.ceil(k.bounds[2]+pad), H, body, "Naqaa symbole"))

PALETTE = {"petrole": ("#0F6E78", "#0F6E78", "#0B3846")}
if __name__ == "__main__":
    for f, n in (("Outfit600.ttf", "naqaa6-outfit"),):
        lockup(f, n)
        s = open(f"v2/{n}.svg").read()
        a, b, c = PALETTE["petrole"]
        open(f"v2/{n}-couleur.svg", "w").write(s.replace('fill="#001"', f'fill="{b}"').replace('fill="#002"', f'fill="{c}"').replace('fill="#000"', f'fill="{a}"'))
    print("ok")
