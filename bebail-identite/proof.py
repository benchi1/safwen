import cairosvg, io, sys
from PIL import Image
def r(fn, h=None, w=None, bg=None):
    png = cairosvg.svg2png(url=fn, output_height=h, output_width=w, background_color=bg)
    return Image.open(io.BytesIO(png)).convert("RGBA")
L = "charte/logo/"
canvas = Image.new("RGB", (1500, 1100), "#F5F3EE")
def paste(im, x, y, bg=None):
    if bg:
        box = Image.new("RGB", (im.width + 40, im.height + 40), bg); box.paste(im, (20, 20), im); canvas.paste(box, (x, y))
    else: canvas.paste(im, (x, y), im)
paste(r(L+"bebail-symbole-noir.svg", 256), 20, 20, "#FFFFFF")
paste(r(L+"bebail-symbole-petit-noir.svg", 256), 330, 20, "#FFFFFF")
x = 640
for s in (64, 32, 24, 16):
    paste(r(L+"bebail-symbole-noir.svg", s), x, 40, "#FFFFFF"); paste(r(L+"bebail-symbole-petit-noir.svg", s), x, 160, "#FFFFFF"); x += s + 60
paste(r(L+"bebail-horizontal-couleur-clair.svg", 120), 20, 340, "#FFFFFF")
paste(r(L+"bebail-horizontal-couleur-sombre.svg", 120), 20, 510, "#0B1116")
paste(r(L+"bebail-empile-couleur-sombre.svg", 300), 20, 690, "#0B1116")
paste(r(L+"bebail-empile-couleur-clair.svg", 300), 420, 690, "#FFFFFF")
paste(r(L+"bebail-symbole-petit-couleur-sombre.svg", 180), 840, 690, "#0B1116")
canvas.save(sys.argv[1] if len(sys.argv) > 1 else "renders/proof.png")
