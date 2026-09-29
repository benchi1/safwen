"""Contour d'un trait (ligne médiane SVG) → path rempli, via shapely."""
from svgpathtools import parse_path
from shapely.geometry import LineString, Polygon, MultiPolygon
from shapely.ops import unary_union

def centreline_points(d, step=0.5):
    p = parse_path(d); pts = []
    for seg in p:
        n = max(2, int(seg.length() / step))
        for i in range(n + (1 if seg is p[-1] else 0)):
            z = seg.point(i / n); pts.append((z.real, z.imag))
    return pts

def ring_d(coords):
    c = list(coords)[:-1]
    return "M" + "L".join(f"{x:.2f} {y:.2f}".replace(".00", "") for x, y in c) + "Z"

def outline(d, width, tol=0.08):
    g = LineString(centreline_points(d)).buffer(width / 2, cap_style=1, join_style=1, quad_segs=48)
    g = g.simplify(tol, preserve_topology=True)
    polys = g.geoms if isinstance(g, MultiPolygon) else [g]
    out = []
    for poly in polys:
        out.append(ring_d(poly.exterior.coords))
        for r in poly.interiors: out.append(ring_d(r.coords))
    return "".join(out), g.bounds
