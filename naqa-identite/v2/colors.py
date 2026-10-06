"""Déclinaisons : vert + étoile or, blanc + étoile or clair, noir, blanc."""
GREEN, GOLD, WHITE, GOLD_L = "#0E4B3B", "#A6834C", "#FFFFFF", "#D2B47E"
V = {"couleur": (GREEN, GOLD), "inverse": (WHITE, GOLD_L), "noir": ("#000000", "#000000"), "blanc": (WHITE, WHITE)}
for name in ["naqa-symbole", "naqa-horizontal", "naqa-vertical"]:
    s = open(f"v2/{name}.svg").read()
    for k, (body, star) in V.items():
        open(f"v2/{name}-{k}.svg", "w").write(s.replace('fill="#001"', f'fill="{star}"').replace('fill="#000"', f'fill="{body}"'))
print("ok")
