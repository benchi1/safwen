"""Convert text to SVG path data with a variable font (fontTools)."""
import functools
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import os
HERE = os.path.dirname(os.path.abspath(__file__))

@functools.lru_cache(None)
def font(name, wght):
    f = TTFont(os.path.join(HERE, "fonts", f"{name}-VF.ttf"))
    return instantiateVariableFont(f, {"wght": wght})

def glyphs(text, name="Manrope", wght=700, size=100, x=0, y=0, tracking=0, kern=None):
    """Return (list of (char, d), advance_end, bounds). y is baseline."""
    f = font(name, wght)
    upm = f["head"].unitsPerEm; s = size / upm
    cmap = f.getBestCmap(); gs = f.getGlyphSet(); hmtx = f["hmtx"]
    out = []; cx = x; kern = kern or {}
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        pen = SVGPathPen(gs)
        tp = TransformPen(pen, (s, 0, 0, -s, cx, y))
        gs[g].draw(tp)
        out.append((ch, pen.getCommands(), cx))
        cx += hmtx[g][0] * s + tracking + kern.get(i, 0)
    return out, cx - tracking

def bbox_of(text, name="Manrope", wght=700, size=100):
    f = font(name, wght); upm = f["head"].unitsPerEm; s = size/upm
    cmap = f.getBestCmap(); gs = f.getGlyphSet()
    res = {}
    for ch in set(text):
        bp = BoundsPen(gs); gs[cmap[ord(ch)]].draw(bp)
        res[ch] = tuple(v*s for v in bp.bounds) if bp.bounds else None
    return res
