"""Génère les symboles et lockups des pistes BeBail (noir sur blanc)."""
import math, sys
import textpath as tp
OUT = "concepts"

def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img">'
            f'<title>{title}</title>{body}</svg>\n')

def circle_cw(cx, cy, r):
    return f"M{cx} {cy-r}A{r} {r} 0 1 1 {cx} {cy+r}A{r} {r} 0 1 1 {cx} {cy-r}Z"

# --- A : Maison-b ------------------------------------------------------------
def sym_a():
    stem = "M52 24H92V232H52Z"                       # sens horaire
    bowl = circle_cw(150, 154, 78)
    # comptoir en forme de maison, sens anti-horaire (trou en nonzero)
    house = "M118 148L118 188L182 188L182 148L150 116Z"  # anti-horaire
    return f'<path transform="translate(-12 0)" fill="#000" fill-rule="nonzero" d="{stem}{bowl}{house}"/>'

# --- B : Façade B ------------------------------------------------------------
def sym_b():
    upper = "M48 24H152A52 52 0 0 1 152 128H48Z"
    lower = "M48 120H160A56 56 0 0 1 160 232H48Z"
    win = "M92 108H152V82A30 30 0 0 0 92 82Z"      # anti-horaire = trou
    door = "M92 204H164V176A36 36 0 0 0 92 176Z"
    return f'<path transform="translate(-4 0)" fill="#000" fill-rule="nonzero" d="{upper}{lower}{win}{door}"/>'

# --- C : Signature-maison (monoline) -----------------------------------------
def sym_c():
    d = ("M40 208C58 208 68 198 68 180V116L128 56L188 116V172"
         "C188 206 168 224 148 216C124 206 138 172 168 180C196 188 210 208 236 204")
    return f'<path transform="translate(-10 -12)" fill="none" stroke="#000" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="{d}"/>'

def wordmark(x, base, size, wght=700, font="Manrope", tracking=-2):
    gl, end = tp.glyphs("BeBail", font, wght, size, x, base, tracking)
    return "".join(f'<path fill="#000" d="{d}"/>' for _, d, _ in gl), end

SYMS = {"a": sym_a, "b": sym_b, "c": sym_c}
for k, f in SYMS.items():
    open(f"{OUT}/{k}-symbol.svg", "w").write(svg(256, 256, f(), f"BeBail piste {k.upper()}"))
    # lockup : symbole 256 + mot-symbole, hauteur de capitale ≈ 0,44 du symbole
    size = 158
    body, end = wordmark(300, 128 + 0.72 * size / 2, size)
    w = math.ceil(end + 16)
    open(f"{OUT}/{k}-lockup.svg", "w").write(svg(w, 256, f"<g id='symbol'>{f()}</g><g id='wordmark'>{body}</g>", f"BeBail lockup {k.upper()}"))
print("ok")
