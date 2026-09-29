"""BeBail v2 : symbole b-signature, mot « bebail », palette Encre & Pierre."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from shapely.geometry import LineString, MultiPolygon
from shapely.ops import unary_union
import textpath as tp
from outline import centreline_points, ring_d

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logo")
P = dict(encre="#2F3BFF", ciel="#8E97FF", pierre="#ECE8E1", zinc="#56616B", nuit="#0E1126", blanc="#FFFFFF")

# b : fût + base arrondie qui file en paraphe ; maison : toit à 45° + mur droit
STROKES = ["M80 30V178C80 202 96 216 120 216H178C204 216 220 208 238 194",
           "M80 120L136 64L192 120V204"]
W = 28
STROKES_SMALL = ["M76 30V174C76 202 94 218 122 218H176C204 218 222 208 238 192",
                 "M76 122L136 62L196 122V204"]
W_SMALL = 36

def to_d(geom, tol=0.08):
    geom = geom.simplify(tol, preserve_topology=True)
    polys = geom.geoms if isinstance(geom, MultiPolygon) else [geom]
    out = []
    for p in polys:
        out.append(ring_d(p.exterior.coords)); out += [ring_d(r.coords) for r in p.interiors]
    return "".join(out)

def symbol_geom(small=False):
    ss, w = (STROKES_SMALL, W_SMALL) if small else (STROKES, W)
    return unary_union([LineString(centreline_points(s)).buffer(w / 2, cap_style=1, join_style=1, quad_segs=48) for s in ss])

def centred_symbol(small=False):
    g = symbol_geom(small); x0, y0, x1, y1 = g.bounds
    from shapely.affinity import translate
    g = translate(g, 128 - (x0 + x1) / 2, 128 - (y0 + y1) / 2 - 3)
    return g

def svg(w, h, body, title="bebail"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:g} {h:g}" width="{w:g}" height="{h:g}" role="img">'
            f'<title>{title}</title>{body}</svg>\n')

def wordmark(x, base, size, color, wght=700):
    """« bebail » en Manrope, le l redessiné : son pied file en paraphe comme le symbole."""
    gl, end = tp.glyphs("bebai", "Manrope", wght, size, x, base, -2.2 * size / 150)
    parts = [f'<path fill="{color}" d="{d}"/>' for _, d, _ in gl]
    bb = tp.bbox_of("l", "Manrope", wght, size)["l"]
    stem = bb[2] - bb[0]
    lx = end + bb[0] + stem / 2 - 1.5 * size / 150
    top = base - bb[3]
    r = 0.16 * size
    cl = (f"M{lx:.2f} {top:.2f}V{base - r - stem/2:.2f}"
          f"C{lx:.2f} {base - stem/2:.2f} {lx + r*0.4:.2f} {base - stem/2:.2f} {lx + r:.2f} {base - stem/2 - 0.02*size:.2f}"
          f"C{lx + r*1.5:.2f} {base - stem/2 - 0.04*size:.2f} {lx + r*1.9:.2f} {base - stem/2 - 0.08*size:.2f} {lx + r*2.2:.2f} {base - stem/2 - 0.13*size:.2f}")
    g = LineString(centreline_points(cl, 0.3)).buffer(stem / 2, cap_style=2, join_style=1, quad_segs=32)
    parts.append(f'<path fill="{color}" fill-rule="evenodd" d="{to_d(g, 0.03)}"/>')
    return "".join(parts), lx + r * 2.2 + stem / 2

SCHEMES = {"pierre": (P["encre"], P["nuit"]), "nuit": (P["ciel"], P["blanc"]),
           "encre": (P["blanc"], P["blanc"]), "noir": ("#000000", "#000000")}

def build():
    os.makedirs(OUT, exist_ok=True)
    gd = to_d(centred_symbol()); gs = to_d(centred_symbol(True))
    g = centred_symbol(); x0, y0, x1, y1 = g.bounds
    for name, (cs, cw) in SCHEMES.items():
        open(f"{OUT}/bebail-symbole-{name}.svg", "w").write(svg(256, 256, f'<path fill="{cs}" fill-rule="evenodd" d="{gd}"/>'))
        open(f"{OUT}/bebail-symbole-petit-{name}.svg", "w").write(svg(256, 256, f'<path fill="{cs}" fill-rule="evenodd" d="{gs}"/>'))
        size = 176; xh = 0.555 * size
        base = 128 + xh / 2 + 10
        wx = x1 + 0.2 * 256
        body, end = wordmark(wx, base, size, cw)
        w = end + 10 - (x0 - 10)
        open(f"{OUT}/bebail-horizontal-{name}.svg", "w").write(svg(round(w), 256,
            f'<g transform="translate({-(x0 - 10):.2f} 0)"><path fill="{cs}" fill-rule="evenodd" d="{gd}"/>{body}</g>'))
        size2 = 132; _, e2 = wordmark(0, 0, size2, cw)
        Wd = max(e2, 256) + 40; H = 256 + 10 + 0.74 * size2 + 30
        body2, _ = wordmark((Wd - e2) / 2, 256 + 10 + 0.74 * size2, size2, cw)
        open(f"{OUT}/bebail-empile-{name}.svg", "w").write(svg(round(Wd), round(H),
            f'<g transform="translate({(Wd-256)/2:.2f} 0)"><path fill="{cs}" fill-rule="evenodd" d="{gd}"/></g>{body2}'))
        body3, e3 = wordmark(8, 8 + 0.74 * 176, 176, cw)
        open(f"{OUT}/bebail-mot-{name}.svg", "w").write(svg(round(e3 + 10), round(0.74 * 176 + 26), body3))
    print("ok")

if __name__ == "__main__":
    build()
