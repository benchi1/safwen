import sys; sys.path.insert(0, ".")
from outline import outline
from shapely.geometry import LineString
V = {
 "v1": ["M80 32V176C80 202 98 216 124 216C162 216 192 200 192 164V120L136 64L80 120"],
 "v2": ["M80 32V176C80 202 98 216 124 216H176C202 216 216 210 236 200", "M80 120L136 64L192 120V214"],
 "v3": ["M80 32V176C80 202 98 216 124 216C162 216 192 200 192 164V120L136 64L80 120", "M150 238C180 238 208 234 236 226"],
 "v4": ["M52 212C68 212 80 202 80 184V32", "M80 120L136 64L192 120V164C192 200 164 216 132 216C108 216 92 206 86 196C112 222 180 228 236 204"],
}
for k, strokes in V.items():
    ds = [outline(s, 26)[0] for s in strokes]
    body = "".join(f'<path fill="#000" fill-rule="evenodd" d="{d}"/>' for d in ds)
    open(f"v2/explo/{k}.svg","w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">{body}</svg>')
