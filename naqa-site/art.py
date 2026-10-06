"""Illustrations au trait : Kaaba (lignes interrompues, cercles du tawaf) et rosace à 16 branches."""
import math
GOLD = "#B08D52"

def pts(n, R, rot=-90, cx=0, cy=0):
    return [(cx + R*math.cos(math.radians(rot + 360*i/n)), cy + R*math.sin(math.radians(rot + 360*i/n))) for i in range(n)]

def star_poly(n, k, R, rot=-90):
    p = pts(n, R, rot); seen = set(); out = []
    for i in range(n):
        if i in seen: continue
        j = i; poly = []
        while j not in seen:
            seen.add(j); poly.append(p[j]); j = (j + k) % n
        out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in poly) + "Z")
    return "".join(out)

def rosette():
    paths = []
    paths.append(f'<path d="{star_poly(8,3,96)}"/>')
    paths.append(f'<path d="{star_poly(16,5,200)}"/>')
    for r, o in ((40, 1), (124, .5), (212, .45), (300, .3)):
        paths.append(f'<circle r="{r}" opacity="{o}"/>')
    kites = []
    for i in range(16):
        a = math.radians(-90 + 22.5*i); d = math.radians(6.5)
        P = [(218, a), (258, a-d), (300, a), (258, a+d)]
        kites.append("M" + "L".join(f"{r*math.cos(t):.1f} {r*math.sin(t):.1f}" for r, t in P) + "Z")
        a2 = a + math.radians(11.25)
        Q = [(150, a2), (176, a2-math.radians(5)), (200, a2), (176, a2+math.radians(5))]
        kites.append("M" + "L".join(f"{r*math.cos(t):.1f} {r*math.sin(t):.1f}" for r, t in Q) + "Z")
    fills = f'<path d="{"".join(kites)}" fill="{GOLD}" fill-opacity=".14" stroke="none"/>'
    return (f'<svg viewBox="-320 -320 640 640" aria-hidden="true" focusable="false"><g fill="none" stroke="{GOLD}" stroke-width="1.1" stroke-linejoin="round">'
            + "".join(paths) + f'<path d="{"".join(kites)}" opacity=".9"/></g>{fills}</svg>')

def kaaba():
    G = GOLD
    L = lambda d, w=1.6, o=1, da="": f'<path d="{d}" stroke-width="{w}" opacity="{o}"' + (f' stroke-dasharray="{da}"' if da else "") + '/>'
    s = []
    # cercles du tawaf, ouverts
    for rx, ry, o, da in ((300, 66, .35, "380 60 120 40"), (236, 52, .5, "300 50 160 30"), (172, 38, .65, "260 40 90 26")):
        s.append(f'<ellipse cx="320" cy="430" rx="{rx}" ry="{ry}" stroke-width="1.2" opacity="{o}" stroke-dasharray="{da}"/>')
    # arcades du Haram à l'horizon, partielles
    arc = "".join(f"M{x} 336v-26a14 14 0 0 1 28 0v26" for x in range(10, 170, 34)) + "".join(f"M{x} 336v-26a14 14 0 0 1 28 0v26" for x in range(470, 620, 34))
    s.append(L(arc, 1, .35))
    s.append(L("M0 336H180M462 336H640", 1, .35, "60 10 30 8"))
    # minarets
    for x in (96, 548):
        s.append(L(f"M{x-7} 336V200M{x+7} 336V200M{x-11} 200h22M{x-7} 200v-14h14v14M{x} 186v-20M{x-9} 250h18", 1.1, .45))
    # la Kaaba : face avant, face latérale, toit
    s.append(L("M200 236V424", 2, 1, "150 10 40"))
    s.append(L("M200 236H362", 2))
    s.append(L("M362 236V424", 2.2))
    s.append(L("M200 424H362", 2, 1, "70 8 90"))
    s.append(L("M362 236L446 200V386L362 424", 2, 1, "120 8 200"))
    s.append(L("M200 236L284 200H446", 1.6, .8, "180 10 60"))
    # hizam (bandeau calligraphié)
    s.append(L("M200 270H362M362 270L446 234", 1.4))
    s.append(L("M200 296H362M362 296L446 260", 1.4))
    s.append(L("M206 283H356", 1.1, .8, "10 4 3 4 14 4 5 4"))
    s.append(L("M368 277L440 246", 1.1, .7, "8 4 3 4 12 4"))
    # porte
    s.append(L("M302 312h40v104h-40zM322 312v104M306 318h32", 1.3, .9))
    # plis du kiswa et socle
    s.append(L("M232 300V410M264 300V416M394 286V400M420 274V392", 1, .35, "40 12 20 10"))
    s.append(L("M194 430H362L452 392", 1.3, .6, "90 10 40 8"))
    return (f'<svg viewBox="0 120 640 400" aria-hidden="true" focusable="false"><defs><linearGradient id="kf" x1="0" y1="0" x2="0" y2="1">'
            f'<stop offset=".55" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>'
            f'<mask id="km"><rect x="0" y="120" width="640" height="400" fill="url(#kf)"/></mask></defs>'
            f'<g fill="none" stroke="{G}" stroke-linecap="round" mask="url(#km)">' + "".join(s) + '</g></svg>')

open("art/rosette.svg", "w").write(rosette())
open("art/kaaba.svg", "w").write(kaaba())
print("ok")
