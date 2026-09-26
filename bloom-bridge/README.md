# Bloom Bridge

Motion graphics vertical 1080x1920, 30 fps, 15,6 s. Géométrie émissive dans
un vide noir, quatre coupes reliées par des pics de bloom (pas de coupe franche).

Réalisé en 3D temps réel (Three.js + UnrealBloom) et rendu par HyperFrames,
d'après la fiche « Motion Graphics — Bloom Bridge ».

## Commandes

```bash
npm install
npm run build    # recompile src/ vers assets/vendor/bloom-bridge.js
npm run check    # vérifications HyperFrames
npm run render   # build + rendu MP4 dans renders/
```

## Découpage

| Coupe | Temps | Optique | Action |
| --- | --- | --- | --- |
| 1 | 0 → 3,6 s | 47°, fixe | Chevron biseauté immobile au tiers bas, sphère iridescente qui monte du coin haut gauche ; le dégradé du chevron glisse bleu → magenta → or à son passage |
| 2 | 3,6 → 6,8 s | 63°, poussée lente | Panneau arrondi qui balaie depuis le bas gauche, liseré crème → ambre → magenta → violet ; la poussée s'arrête quand le rayon d'angle occupe un tiers de la largeur du cadre |
| 3 | 6,8 → 9,6 s | 47°, verrouillé | Pilule au contour néon, intérieur noir absolu, bloom violet qui pulse derrière |
| 4 | 9,6 → 15,6 s | 84°, orbite | Huit tuiles en anneau, recomposition en colonne, défilement vers le haut, une seule tuile reste au centre pendant que le bloom s'éteint |

Chaque pont (3,6 s, 6,8 s, 9,6 s) passe par un pic de bloom.

## Arbitrages sur les quatre conflits de la fiche

1. **Fond** : noir avec léger relevé violet au centre, noir absolu aux bords.
2. **Caméra** : seules les coupes 2 (poussée) et 4 (orbite) bougent ; 1 et 3 sont fixes.
3. **Glyphes** : huit marques géométriques (disque, triangle, chevron, plus, carré, losange, anneau, barre).
4. **Coupe 4** : les trois temps sont conservés, sur 6 s au lieu de 2.

## Éclairage

Aucune lumière dans la scène : chaque matériau est un shader émissif qui lit
la même rampe indigo → violet → magenta → rouge-orangé → ambre → crème.
Tonemapping ACES pour que les hautes lumières roulent vers le crème.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition HyperFrames, timeline qui pilote le temps de la scène |
| `src/scene.js` | Scène 3D, shaders, post-traitement, animation fonction de t |
| `assets/vendor/bloom-bridge.js` | **Généré** par `npm run build` |
