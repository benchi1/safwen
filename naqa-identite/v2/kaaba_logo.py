"""Naqaa v5 : نقاء en koufi carré inscrit dans la Kaaba (carré), hizam or. NAQAA / IHRAM empilés."""
import math, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shapely.geometry import box
from shapely.ops import unary_union
from shapely import affinity
import glyphs as G
from build_concepts import to_d, svg

U = 16
# 14 × 14. 'G' = vert (kiswa + lettres), 'O' = or (hizam). Lecture droite → gauche : ن ق ا ء
GRID = """
##############
#............#
OOOOOOOOOOOOOO
#............#
#....#.......#
#....#.#.#...#
#....#.....#.#
#.##.#.###...#
#.#..#.#.#.#.#
#.##.#.#.#.#.#
#....#.#.#.#.#
#....#########
#............#
##############
""".strip("\n").splitlines()

def cells(ch):
    return unary_union([box(x*U, y*U, (x+1)*U, (y+1)*U) for y, r in enumerate(GRID) for x, c in enumerate(r) if c == ch])

def word_block(lines, font, x, top, bottom, gap_ratio=0.5, wght_track=0.06):
    n = len(lines); H = bottom-top; c = H/(n + (n-1)*gap_ratio); out = []; mw = 0
    for i, t in enumerate(lines):
        d, bb = G.shape(t, font, 100, 0, 0); size = 100*c/(bb[3]-bb[1])
        d, bb = G.shape(t, font, size, 0, 0, tracking=size*wght_track)
        base = top + c*(i+1) + c*gap_ratio*i
        out.append(f'<path fill="#002" transform="translate({x-bb[0]:.2f} {base:.2f})" d="{d}"/>'); mw = max(mw, bb[2]-bb[0])
    return "".join(out), mw

def build():
    g, o = cells('#'), cells('O')
    pad = 24; T = lambda s: affinity.translate(s, pad, pad)
    g, o = T(g), T(o); S = 14*U
    body = f'<path fill="#000" d="{to_d(g)}"/><path fill="#001" d="{to_d(o)}"/>'
    open("v2/naqaa-symbole.svg","w").write(svg(S+2*pad, S+2*pad, body, "Naqaa symbole"))
    # horizontal : la bande or (hizam) se prolonge sous forme de filet au-dessus du nom
    xt = pad + S + 1.8*U
    d, bb = G.shape("NAQAA", "Montserrat-2.ttf", 100, 0, 0); size = 100*(5.2*U)/(bb[3]-bb[1])
    d, bb = G.shape("NAQAA", "Montserrat-2.ttf", size, 0, 0, tracking=size*0.05)
    nw = bb[2]-bb[0]; nb = pad + 4*U + 5.2*U
    t1 = f'<path fill="#002" transform="translate({xt-bb[0]:.2f} {nb:.2f})" d="{d}"/>'
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", 100, 0, 0); size2 = 100*(2.2*U)/(b2[3]-b2[1])
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", size2, 0, 0)
    tr = (nw - (b2[2]-b2[0]))/4
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", size2, 0, 0, tracking=tr)
    ib = pad + 14*U
    t2 = f'<path fill="#002" transform="translate({xt-b2[0]:.2f} {ib:.2f})" d="{d2}"/>'
    rule = box(pad + S, pad + 2*U, xt + nw, pad + 3*U)
    W = math.ceil(xt + nw + pad)
    open("v2/naqaa-horizontal.svg","w").write(svg(W, S+2*pad, body + f'<path fill="#001" d="{to_d(rule)}"/>' + t1 + t2, "Naqaa Ihram"))
    # vertical : NAQAA justifié sur la largeur du carré, IHRAM espacé dessous
    d, bb = G.shape("NAQAA", "Montserrat-2.ttf", 100, 0, 0); size = 100*(3.0*U)/(bb[3]-bb[1])
    d, bb = G.shape("NAQAA", "Montserrat-2.ttf", size, 0, 0); tr = (S - (bb[2]-bb[0]))/4
    d, bb = G.shape("NAQAA", "Montserrat-2.ttf", size, 0, 0, tracking=tr)
    b1 = pad + S + 2*U + 3*U
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", 100, 0, 0); size2 = 100*(1.5*U)/(b2[3]-b2[1])
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", size2, 0, 0); tr2 = (S*0.62 - (b2[2]-b2[0]))/4
    d2, b2 = G.shape("IHRAM", "Montserrat-1.ttf", size2, 0, 0, tracking=tr2); w2 = b2[2]-b2[0]
    b2y = b1 + 1.6*U + 1.5*U
    v = (f'<path fill="#002" transform="translate({pad-bb[0]:.2f} {b1:.2f})" d="{d}"/>'
         f'<path fill="#002" transform="translate({pad+S/2-w2/2-b2[0]:.2f} {b2y:.2f})" d="{d2}"/>')
    open("v2/naqaa-vertical.svg","w").write(svg(S+2*pad, math.ceil(b2y+pad), body+v, "Naqaa Ihram"))

GREEN, GOLD, WHITE, GOLD_L, INK = "#0E4B3B", "#B08D52", "#FFFFFF", "#D9BC86", "#0E4B3B"
V = {"couleur": (GREEN, GOLD, INK), "inverse": (WHITE, GOLD_L, WHITE), "noir": ("#000", "#000", "#000"), "blanc": (WHITE, WHITE, WHITE)}
if __name__ == "__main__":
    build()
    for n in ["naqaa-symbole","naqaa-horizontal","naqaa-vertical"]:
        s = open(f"v2/{n}.svg").read()
        for k,(a,b,c) in V.items():
            open(f"v2/{n}-{k}.svg","w").write(s.replace('fill="#001"',f'fill="{b}"').replace('fill="#002"',f'fill="{c}"').replace('fill="#000"',f'fill="{a}"'))
    print("ok")
