# Bouteille Alveiria Prima 500 ml en 3D

Modèle construit avec Blender 4.5 (module Python `bpy`), d'après les proportions relevées sur la photo produit : diamètre du corps 1, hauteur totale 5.

| Fichier | Contenu |
|---|---|
| `model.py` | Script de modélisation, matériaux, export et rendus |
| `alveiria-prima.glb` | Modèle pour le web (verre, huile, étiquette, capsule, bouchon) |
| `prima-still.png` | Rendu Cycles 900 × 1600, fond transparent |
| `turntable/prima_000.png` … `prima_350.png` | Tour à 360°, un angle tous les 10° |
| `turntable-sheet.jpg` | Planche des 36 angles |

## Régénérer

```bash
pip install bpy==4.5.4          # Python 3.11
python model.py out glb         # export GLB
python model.py out still       # rendu fixe
python model.py out turntable   # 36 angles
```

## À affiner par un graphiste 3D

- Gravure du verre, bague de col et filetage sous le bouchon.
- Texture d'étiquette en haute définition, à partir du fichier d'impression.
- Matière exacte du bouchon (aluminium ou plastique).
