"""Naqa v2 : نقاء en koufi carré + étoile, lockups bilingues."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shapely.geometry import box, Polygon
from shapely.ops import unary_union
from shapely import affinity
import glyphs as G
from build_concepts import to_d, svg

# Grille : '#' = trait, '.' = vide. Lecture droite → gauche : ن ق ا ء
GRID = """
...#.........
...#.........
...#.........
...#..#.#....
...#.......#.
...#.........
##.#..###..#.
#..#..#.#..#.
##.#..#.#..#.
...#########.
.............
#############
.............
#############
""".strip("\n").splitlines()

def kufi(u=1.0, grid=GRID):
    cells = [box(x*u, y*u, (x+1)*u, (y+1)*u) for y, row in enumerate(grid) for x, c in enumerate(row) if c == '#']
    return unary_union(cells)

def star(cx, cy, r):
    s = r / math.sqrt(2)
    sq = box(cx-s, cy-s, cx+s, cy+s)
    return unary_union([sq, affinity.rotate(sq, 45, origin=(cx, cy))])

if __name__ == "__main__":
    g = kufi(16)
    x0, y0, x1, y1 = g.bounds
    g = affinity.translate(g, 128-(x0+x1)/2, 128-(y0+y1)/2)
    open("v2/explo-1.svg", "w").write(svg(256, 256, f'<path fill="#000" d="{to_d(g)}"/>', "explo"))
    print("ok")

STAR_ONLY = False
def symbol(u=16, star_gap=1.0):
    g = kufi(u)
    if STAR_ONLY == 'body': return g
    # étoile au sommet de l'alif, comme un minaret
    ax = 3.5*u
    st = star(ax, -star_gap*u - 1.15*u, 1.15*u)
    if STAR_ONLY == 'star': return st
    return unary_union([g, st])

def place(g, cx, cy, h):
    x0, y0, x1, y1 = g.bounds; s = h/(y1-y0)
    g = affinity.scale(g, s, s, origin=(0, 0))
    x0, y0, x1, y1 = g.bounds
    return affinity.translate(g, cx-(x0+x1)/2, cy-(y0+y1)/2)

def word(text, cap_h, x, base, font="Jost-2.ttf", track_em=0.18):
    # taille telle que la hauteur de capitale = cap_h
    d, bb = G.shape(text, font, 100, 0, 0)
    ch = bb[3]-bb[1]; size = 100*cap_h/ch
    d, bb = G.shape(text, font, size, 0, 0, tracking=size*track_em)
    return f'<path fill="#000" transform="translate({x-bb[0]:.2f} {base:.2f})" d="{d}"/>', bb[2]-bb[0]

U = 16
STAR_FILL = "#001"
def parts():
    global STAR_ONLY
    STAR_ONLY = 'body'; b = symbol(U); STAR_ONLY = 'star'; st = symbol(U); STAR_ONLY = False
    return b, st

def P(g, fill="#000"):
    return f'<path fill="{fill}" d="{to_d(g)}"/>'

def lockups():
    b, st = parts(); sym = unary_union([b, st])
    x0, y0, x1, y1 = sym.bounds
    # symbole seul
    sc = 224/(y1-y0)
    T = lambda g: affinity.translate(affinity.scale(g, sc, sc, origin=(x0, y0)), 128-(x1-x0)*sc/2-x0, 16-y0)
    open("v2/naqa-symbole.svg","w").write(svg(256,256,P(T(b))+P(T(st),STAR_FILL),"Naqa symbole"))
    pad = 24
    T = lambda g: affinity.translate(g, pad-x0, pad-y0)
    bb_, st_ = T(b), T(st); R = bb_.bounds[2]
    top3 = pad - y0 + 3*U; base9 = pad - y0 + 10*U
    GAP = 2*U
    w, ww = word("NAQA", base9-top3, R + GAP, base9)
    xr = R + GAP + ww
    bars = unary_union([box(bb_.bounds[0], pad-y0+11*U, xr, pad-y0+12*U), box(bb_.bounds[0], pad-y0+13*U, xr, pad-y0+14*U)])
    W = math.ceil(xr + pad); H = math.ceil(bb_.bounds[3] + pad)
    open("v2/naqa-horizontal.svg","w").write(svg(W, H, P(unary_union([bb_, bars]))+P(st_,STAR_FILL)+w, "Naqa horizontal"))
    # vertical
    bw = bb_.bounds[2]-bb_.bounds[0]
    d, bb = G.shape("NAQA", "Jost-2.ttf", 100, 0, 0)
    size = 100*(2.6*U)/(bb[3]-bb[1]); d, bb = G.shape("NAQA", "Jost-2.ttf", size, 0, 0)
    tr = (bw - (bb[2]-bb[0]))/3
    d, bb = G.shape("NAQA", "Jost-2.ttf", size, 0, 0, tracking=tr)
    base = bb_.bounds[3] + 1.8*U + 2.6*U
    w2 = f'<path fill="#000" transform="translate({bb_.bounds[0]-bb[0]:.2f} {base:.2f})" d="{d}"/>'
    open("v2/naqa-vertical.svg","w").write(svg(math.ceil(bb_.bounds[2]+pad), math.ceil(base+pad), P(bb_)+P(st_,STAR_FILL)+w2, "Naqa vertical"))

if __name__ == "__main__":
    lockups(); print("lockups ok")
