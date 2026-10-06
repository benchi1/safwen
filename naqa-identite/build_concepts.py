"""Trois pistes de logo Naqa (noir sur blanc). Symboles 256×256 + lockups."""
import math
from shapely.geometry import LineString, Polygon, Point, MultiPolygon, box
from shapely.ops import unary_union
from shapely import affinity
import glyphs as G
OUT = "concepts"

def to_d(geom, nd=2):
    polys = geom.geoms if isinstance(geom, MultiPolygon) else [geom]
    out = []
    def ring(c):
        c = list(c)[:-1]
        return "M" + "L".join(f"{x:.{nd}f} {y:.{nd}f}" for x, y in c) + "Z"
    for p in polys:
        out.append(ring(p.exterior.coords))
        for r in p.interiors: out.append(ring(r.coords))
    return "".join(out)

def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">'
            f'<title>{title}</title>{body}</svg>\n')

def arc_pts(cx, cy, r, a0, a1, n=160):
    return [(cx + r*math.cos(math.radians(a0 + (a1-a0)*i/n)), cy + r*math.sin(math.radians(a0 + (a1-a0)*i/n))) for i in range(n+1)]

# ---------- A : L'étoile aux deux pièces (deux carrés entrelacés) ----------
def sym_a():
    c, h, w, gap = 128, 78, 14, 0
    sq = [(c-h, c-h), (c+h, c-h), (c+h, c+h), (c-h, c+h), (c-h, c-h)]
    A = LineString(sq).buffer(w/2, join_style=2, mitre_limit=3)
    B = affinity.rotate(A, 45, origin=(c, c))
    la = LineString(sq); lb = affinity.rotate(la, 45, origin=(c, c))
    pts = la.intersection(lb)
    pts = sorted(list(pts.geoms), key=lambda p: math.atan2(p.y-c, p.x-c))
    g = unary_union([A, B])
    # point central : le cœur du pèlerin
    g = unary_union([g, Point(c, c).buffer(10, quad_segs=32)])
    return g

# ---------- B : La porte-N (arc outrepassé + diagonale) ----------
def sym_b():
    w = 19
    cx, cy, r = 128, 96, 62
    jx = 57                        # demi-écart des piédroits
    dy = math.sqrt(r*r - jx*jx)
    a0 = math.degrees(math.atan2(dy, -jx))          # côté gauche, sous le centre
    a1 = 360 + math.degrees(math.atan2(dy, jx))     # côté droit
    pts = [(cx-jx, 230)] + arc_pts(cx, cy, r, a0, a1)[::-1][::-1]
    # parcours : bas gauche → haut via l'arc (sens horaire en SVG) → bas droit
    arc = arc_pts(cx, cy, r, a0, a0 - (360 - (a1 - a0) + 0) , 10)
    left_top = (cx-jx, cy+dy); right_top = (cx+jx, cy+dy)
    ang_l = math.degrees(math.atan2(dy, -jx)); ang_r = math.degrees(math.atan2(dy, jx))
    arcp = arc_pts(cx, cy, r, ang_l, ang_r + 360, 200)   # passe par le haut
    outline = [(cx-jx, 232)] + arcp + [(cx+jx, 232)]
    frame = LineString(outline).buffer(w/2, cap_style=2, join_style=1)
    diag = LineString([(cx-jx, cy+dy-4), (cx+jx, 232)]).buffer(w/2, cap_style=2)
    g = unary_union([frame, diag]).intersection(box(0, 0, 256, 232))
    # étoile à huit branches au sommet de l'arc (clé de voûte)
    s = 9
    ky = cy - 22
    sq = box(cx-s, ky-s, cx+s, ky+s)
    star = unary_union([sq, affinity.rotate(sq, 45, origin=(cx, ky))])
    return unary_union([g, star])

# ---------- C : Le mot couronné (koufi + créneaux de la Mosquée) ----------
def merlon(x, y, u):
    # créneau à degrés : 3 marches
    return Polygon([(x, y), (x, y-u), (x+u*0.5, y-u), (x+u*0.5, y-2*u), (x+u, y-2*u), (x+u, y-2.8*u),
                    (x+u*1.5, y-2.8*u), (x+u*1.5, y-2*u), (x+u*2, y-2*u), (x+u*2, y-u), (x+u*2.5, y-u), (x+u*2.5, y)])

def sym_c():
    d, bb = G.shape("نقاء", "ReemKufi-2.ttf", 150, 0, 0)
    x0, y0, x1, y1 = bb
    W = x1 - x0; s = 196 / W
    tx = 128 - (x0 + W/2) * s; ty = 196 - y1 * s
    word = f'<path fill="#000" transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})" d="{d}"/>'
    top = ty + y0 * s
    u = 11; n = 4; span = 196; step = span / n
    base_y = top - 14
    band = box(30, base_y, 226, base_y + 7)
    ms = [merlon(30 + step*i + (step - 2.5*u)/2, base_y, u) for i in range(n)]
    crown = unary_union([band] + ms)
    return word + f'<path fill="#000" d="{to_d(crown)}"/>'

def centred(g):
    x0, y0, x1, y1 = g.bounds
    return affinity.translate(g, 128 - (x0+x1)/2, 128 - (y0+y1)/2 - 2)

def wordmark_lockup(sym_body, title, fname, word_font="Marcellus-1.ttf"):
    d, bb = G.shape("NAQA", word_font, 112, 0, 0, tracking=34)
    x0, y0, x1, y1 = bb
    X = 300; Y = 128 + (y1 - y0) / 2 - y1 - 18
    da, ba = G.shape("نقاء", "Amiri-1.ttf", 64, 0, 0)
    aw = ba[2] - ba[0]
    tw = x1 - x0
    ax = X - x0 + tw - aw - ba[0]   # aligné à droite sous le mot
    ay = Y + y1 + 22 - ba[1]
    body = (f"<g id='symbol'>{sym_body}</g>"
            f"<path fill='#000' transform='translate({X - x0:.2f} {Y:.2f})' d='{d}'/>"
            f"<path fill='#000' transform='translate({ax:.2f} {ay:.2f})' d='{da}'/>")
    w = math.ceil(X + tw + 16)
    open(f"{OUT}/{fname}", "w").write(svg(w, 256, body, title))

ga = centred(sym_a()); gb = centred(sym_b())
A = f'<path fill="#000" fill-rule="evenodd" d="{to_d(ga)}"/>'
B = f'<path fill="#000" fill-rule="evenodd" d="{to_d(gb)}"/>'
C = sym_c()
for k, body, t in (("a", A, "Naqa A — Étoile aux deux pièces"), ("b", B, "Naqa B — La porte"), ("c", C, "Naqa C — Le mot couronné")):
    open(f"{OUT}/{k}-symbol.svg", "w").write(svg(256, 256, body, t))
    wordmark_lockup(body, t + " lockup", f"{k}-lockup.svg")
print("ok")
