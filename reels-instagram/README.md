# Reel « Le tour du monde du LEAP »

Vidéo verticale 1080x1920, 56 s, pour Instagram Reels. Un moteur LEAP vole
de site en site sur une carte du monde : Corbeil-Essonnes, Casablanca,
Querétaro, Suzhou, puis Villaroche. Les pays s'allument quand il les survole.

## Commandes

```bash
npm run dev      # studio de prévisualisation
npm run check    # vérifications HyperFrames
npm run render   # rendu MP4 dans renders/
npm run render:instagram  # rendu + version allégée (~25 Mo) pour Instagram
```

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Composition racine : calques, voix off, musique, effets |
| `compositions/intro.html` | Soufflante LEAP à 18 aubes et titre |
| `compositions/carte.html` | **Généré.** Carte, caméra, moteur, fiches adresses |
| `compositions/sous-titres.html` | **Généré.** Sous-titres calés sur la voix off |
| `compositions/outro.html` | Carton de fin |
| `tools/sites.mjs` | Sites, adresses et coordonnées |
| `tools/carte.template.html` | Source de `compositions/carte.html` |
| `assets/voix/script.txt` | Texte de la voix off |

## Modifier

Sites ou animation de la carte : éditer `tools/sites.mjs` ou
`tools/carte.template.html`, puis :

```bash
(cd tools && npm install && node build-carte.mjs)
```

Voix off : éditer `assets/voix/script.txt` (et sa version phonétique
`script-tts.txt`, où « LEAP » s'écrit « Lipe » pour la prononciation), puis :

```bash
npx hyperframes tts "<texte>" -v ff_siwis -o assets/voix/v3.wav
python3 tools/build-sous-titres.py   # recale les sous-titres et régénère le bloc audio
```

Le bloc audio est écrit dans `tools/audio.generated.html` ; le recopier dans
`index.html` si les durées changent.

## Charte

Couleurs et typographie *inspirées* de l'identité Safran (bleus marine,
Inter). Remplacer par les valeurs officielles et ajouter le logo fourni par
la communication avant toute diffusion publique.

## Sources des adresses

Fiches « Locations » de safran-group.com (septembre 2026). Coordonnées GPS
approximatives, à l'échelle de la ville.
