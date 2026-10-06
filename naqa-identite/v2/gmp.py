"""Naqaa v3 : structure « Mosquée de Paris ». Goutte + étoile, tour koufie نقاء, barres, NAQAA / IHRAM empilés."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shapely.geometry import box, Point, Polygon
from shapely.ops import unary_union
from shapely import affinity
import glyphs as G
from build_concepts import to_d, svg

U = 16
GRID = """
...#.........
...#.........
...#..#.#....
...#.........
##.#.........
#..#..###..#.
##.#..#.#..#.
...#..#.#..#.
...#########.
.............
#############
.............
#############
.............
#############
""".strip("\n").splitlines()

def kufi():
    return unary_union([box(x*U, y*U, (x+1)*U, (y+1)*U) for y, r in enumerate(GRID) for x, c in enumerate(r) if c == '#'])

def star(cx, cy, r):
    s = r/math.sqrt(2); sq = box(cx-s, cy-s, cx+s, cy+s)
    return unary_union([sq, affinity.rotate(sq, 45, origin=(cx, cy))])

def drop(cx, cy, r, h):
    """Goutte : cercle de rayon r centré (cx,cy), pointe à cy-h, tangentes exactes."""
    d = h  # distance centre → pointe
    a = math.acos(r/d)
    t1 = (cx + r*math.sin(a), cy - r*math.cos(a)); t2 = (cx - r*math.sin(a), cy - r*math.cos(a))
    tip = Polygon([(cx, cy-d), t1, (cx, cy), t2])
    return unary_union([Point(cx, cy).buffer(r, quad_segs=64), tip])

def emblem():
    # goutte au-dessus de l'alif (colonne 3), étoile en creux, filet de contour pour la lumière
    # le point du noun (colonne 11) devient la goutte
    cx = 11.5*U; r = 1.25*U; cy = 3.0*U
    dr = drop(cx, cy, r, 2.2*r)
    st = star(cx, cy + 0.05*U, 0.66*U)
    return dr.difference(st), st

def parts():
    k = kufi(); e, st = emblem()
    return k, e

def word_block(lines, font, x, top, bottom, gap_ratio=0.42):
    """Lignes empilées alignées à gauche, du haut `top` au bas `bottom`."""
    n = len(lines)
    # hauteur de capitale c telle que n*c + (n-1)*gap = H
    H = bottom - top; c = H / (n + (n-1)*gap_ratio)
    out = []; maxw = 0
    for i, t in enumerate(lines):
        d, bb = G.shape(t, font, 100, 0, 0); ch = bb[3]-bb[1]; size = 100*c/ch
        d, bb = G.shape(t, font, size, 0, 0, tracking=size*0.04)
        base = top + c*(i+1) + c*gap_ratio*i
        out.append(f'<path fill="#000" transform="translate({x-bb[0]:.2f} {base:.2f})" d="{d}"/>')
        maxw = max(maxw, bb[2]-bb[0])
    return "".join(out), maxw

def build():
    k, e = parts(); sym = unary_union([k, e])
    x0, y0, x1, y1 = sym.bounds; pad = 24
    T = lambda g: affinity.translate(g, pad-x0, pad-y0)
    kk, ee = T(k), T(e)
    # horizontal : texte du haut des points du qaf (rang 2) au bas de la dernière barre (rang 14)
    oy = pad - y0
    xt = kk.bounds[2] + 2.2*U
    txt, tw = word_block(["NAQAA", "IHRAM"], "Montserrat-2.ttf", xt, oy + 2*U, oy + 15*U)
    W = math.ceil(xt + tw + pad); H = math.ceil(kk.bounds[3] + pad)
    body = f'<path fill="#000" d="{to_d(kk)}"/><path fill="#001" d="{to_d(ee)}"/>'
    open("v2/naqaa-horizontal.svg", "w").write(svg(W, H, body + txt, "Naqaa Ihram"))
    # vertical : symbole puis texte centré
    sw = kk.bounds[2]-kk.bounds[0]
    lines = []
    yb = kk.bounds[3] + 2.0*U
    for i, t in enumerate(["NAQAA", "IHRAM"]):
        d, bb = G.shape(t, "Montserrat-2.ttf", 100, 0, 0); size = 100*(2.4*U)/(bb[3]-bb[1])
        d, bb = G.shape(t, "Montserrat-2.ttf", size, 0, 0, tracking=size*0.04)
        w = bb[2]-bb[0]; base = yb + 2.4*U*(i+1) + 1.0*U*i
        lines.append(f'<path fill="#000" transform="translate({kk.bounds[0] + sw/2 - w/2 - bb[0]:.2f} {base:.2f})" d="{d}"/>')
    Hv = math.ceil(base + pad)
    open("v2/naqaa-vertical.svg", "w").write(svg(math.ceil(kk.bounds[2] + pad), Hv, body + "".join(lines), "Naqaa Ihram"))
    # symbole seul
    sc = 224/(y1-y0); S = lambda g: affinity.translate(affinity.scale(g, sc, sc, origin=(x0, y0)), 128-(x1-x0)*sc/2-x0, 16-y0)
    open("v2/naqaa-symbole.svg", "w").write(svg(256, 256, f'<path fill="#000" d="{to_d(S(k))}"/><path fill="#001" d="{to_d(S(e))}"/>', "Naqaa symbole"))

GREEN, GOLD, WHITE, GOLD_L = "#0E4B3B", "#A6834C", "#FFFFFF", "#D2B47E"
V = {"couleur": (GREEN, GOLD), "inverse": (WHITE, GOLD_L), "noir": ("#000000", "#000000"), "blanc": (WHITE, WHITE), "or": (GOLD, GOLD)}
if __name__ == "__main__":
    build()
    for n in ["naqaa-symbole", "naqaa-horizontal", "naqaa-vertical"]:
        s = open(f"v2/{n}.svg").read()
        for k, (b, st) in V.items():
            open(f"v2/{n}-{k}.svg", "w").write(s.replace('fill="#001"', f'fill="{st}"').replace('fill="#000"', f'fill="{b}"'))
    print("ok")
