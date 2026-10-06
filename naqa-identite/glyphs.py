"""Texte → chemins SVG (fontTools + HarfBuzz pour l'arabe)."""
import functools, os
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
HERE = os.path.dirname(os.path.abspath(__file__))

@functools.lru_cache(None)
def _font(name):
    p = os.path.join(HERE, "fonts", name)
    blob = hb.Blob.from_file_path(p)
    return TTFont(p), hb.Font(hb.Face(blob))

def shape(text, name, size, x=0, y=0, tracking=0, rtl=False):
    """Retourne (d, (xmin, ymin, xmax, ymax)). y = ligne de base."""
    tt, f = _font(name)
    upm = tt["head"].unitsPerEm; s = size / upm
    buf = hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(f, buf, {"kern": True, "liga": True})
    gs = tt.getGlyphSet(); order = tt.getGlyphOrder()
    cx = x; ds = []; bp = BoundsPen(gs); boxes = []
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        g = order[info.codepoint]
        ox = cx + pos.x_offset * s; oy = y - pos.y_offset * s
        pen = SVGPathPen(gs); gs[g].draw(TransformPen(pen, (s, 0, 0, -s, ox, oy)))
        ds.append(pen.getCommands())
        b = BoundsPen(gs); gs[g].draw(b)
        if b.bounds:
            x0, y0, x1, y1 = b.bounds
            boxes.append((ox + x0*s, oy - y1*s, ox + x1*s, oy - y0*s))
        cx += pos.x_advance * s + tracking
    bb = (min(b[0] for b in boxes), min(b[1] for b in boxes), max(b[2] for b in boxes), max(b[3] for b in boxes))
    return "".join(ds), bb
