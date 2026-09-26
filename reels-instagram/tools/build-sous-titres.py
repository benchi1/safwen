"""Génère compositions/sous-titres.html et le bloc audio de index.html.

Les sous-titres sont découpés en segments courts, minutés au prorata du
nombre de caractères sur la durée réelle de chaque piste de voix off.
"""
import json, re, subprocess, pathlib

RACINE = pathlib.Path(__file__).resolve().parent.parent
DEBUTS = {"v1": 0.6, "v2": 5.4, "v3": 12.1, "v4": 17.4, "v5": 26.3, "v6": 34.6, "v7": 41.3, "v8": 50.4}
SANS_SOUS_TITRES = {"v1", "v8"}  # déjà écrits à l'écran (intro, fin)
MAX = 30

def duree(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(f)]))

def decoupe(texte):
    mots, blocs, cur = texte.split(), [], ""
    for m in mots:
        if cur and len(cur) + 1 + len(m) > MAX:
            blocs.append(cur); cur = m
        else:
            cur = f"{cur} {m}".strip()
        if re.search(r"[.:,]$", m) and len(cur) > 12:
            blocs.append(cur); cur = ""
    if cur: blocs.append(cur)
    # Ne pas finir un segment sur un petit mot : il passe au segment suivant.
    PETITS = {"du", "de", "des", "le", "la", "les", "et", "au", "à", "en", "pour", "sont", "est", "notre", "nos", "un", "une", "où"}
    for i in range(len(blocs) - 1):
        mots = blocs[i].split()
        while len(mots) > 2 and mots[-1].lower() in PETITS:
            blocs[i + 1] = f"{mots.pop()} {blocs[i + 1]}"
        blocs[i] = " ".join(mots)
    # Fusionne un dernier segment trop court.
    if len(blocs) > 1 and len(blocs[-1]) < 10 and len(blocs[-2]) + len(blocs[-1]) < 38:
        dernier = blocs.pop()
        blocs[-1] = f"{blocs[-1]} {dernier}"
    return blocs

lignes = [l.split("|", 1) for l in (RACINE / "assets/voix/script.txt").read_text().splitlines() if l]
audio, segs = [], []
for vid, texte in lignes:
    d = duree(RACINE / f"assets/voix/{vid}.wav")
    t0 = DEBUTS[vid]
    audio.append(f'      <audio id="voix-{vid}" src="assets/voix/{vid}.wav" data-start="{t0}" data-duration="{d:.2f}" data-track-index="10" data-volume="1"></audio>')
    if vid in SANS_SOUS_TITRES: continue
    blocs = decoupe(texte)
    total = sum(len(b) for b in blocs)
    t = t0
    for b in blocs:
        dt = d * len(b) / total
        segs.append({"t": round(t, 2), "d": round(dt, 2), "x": b.rstrip(",")})
        t += dt

html = (RACINE / "tools/sous-titres.template.html").read_text().replace("/*__SEGMENTS__*/[]", json.dumps(segs, ensure_ascii=False))
(RACINE / "compositions/sous-titres.html").write_text(html)
(RACINE / "tools/audio.generated.html").write_text("\n".join(audio) + "\n")
print(len(segs), "sous-titres")
for s in segs: print(s)
