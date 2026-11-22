# اعرف دينك ونبيك — Saison 1 : القلب

Réels Instagram 1080×1920, 60–90 s, voix en derja tunisienne, citations en arabe classique.
Ligne : purification du cœur dans la tradition de l'Occident musulman (fiqh malikite, tazkiya), sans l'afficher.
L'ancrage passe par les sources citées (Mâlik, Ibn Abî Zayd al-Qayrawânî, Sahnûn, Zarrûq) et par l'identité visuelle de Kairouan.

## Identité

| Rôle | Choix | Source |
|---|---|---|
| Logo, génériques | **Qahiri** — kufique de manuscrit, sans points (esprit du Coran bleu de Kairouan) | github.com/aliftype/qahiri (OFL) |
| Versets, hadiths | **Bouazzi Maghribi** — écriture maghrébine | github.com/aleftypefoundry/bouazzi-maghribi (OFL) |
| Derja, titres | **Firjar** (normal, Expanded, Condensed) | github.com/MestaraType/Firjar (OFL) |
| Métadonnées | **Departure Mono** | github.com/rektdeckard/departure-mono (OFL) |
| Icônes | jeu maison, grille 48, trait anguleux kufique → `icons/*.svg` | — |

Palette « Kairouan » : papier calcaire `#EBE3D5`, encre `#15120F`, indigo du Coran bleu `#1B2550`, or plat `#C9A35B`, terre cuite `#B4532A`.
Deux mondes : le papier (le raisonnement) et la nuit indigo (le Coran, le défi du soir). Le passage de l'un à l'autre se fait par un rideau à filet d'or.

## Épisodes

| # | Titre | Image centrale | Sources |
|---|---|---|---|
| 1 | **المراية** — le cœur et la tache du péché | le miroir qui se noircit puis se polit | Muslim 2564 ; Bukhârî 52 ; Tirmidhî 3334 ; Muslim 2702 ; Ibn Mâja 4252 ; Mâlik |
| 2 | **الحسد** — le feu qui ronge de l'intérieur | une flamme sous verre | Muslim 2563 « لا تحاسدوا » ; Bukhârî 13 « حتى يحب لأخيه » |
| 3 | **الكبر** — le grain d'orgueil | un atome sur une balance | Muslim 91 « مثقال ذرة من كبر » |
| 4 | **الرياء** — faire pour être vu | une ombre qui ne suit pas son corps | Bukhârî 1 « إنما الأعمال بالنيات » |
| 5 | **الغفلة** — le cœur endormi | un pouls qui s'éteint puis revient | Bukhârî 6407 « مثل الحي والميت » |
| 6 | **الغضب** — la vraie force | une corde tendue | Bukhârî 6114 « ليس الشديد بالصرعة » |
| 7 | **سوء الظن** — le soupçon | une loupe déformante | Bukhârî 6066 « إياكم والظن » |
| 8 | **حب الدنيا** — la main qui serre | un poing qui s'ouvre | Ibn Mâja 4102 « ازهد في الدنيا » |
| 9 | **القلب السليم** — finale | le miroir clair, la lumière | Coran 26:88-89 |

Chaque épisode suit la même structure : accroche (3 s), source authentique, image centrale animée, 2-3 remèdes concrets, verset en plein écran, parole d'un savant de la tradition, défi du soir, épisode suivant.

## Production

`node render.js` (images) → `python3 mix.py` (voix + sound design, sans musique) → `renders/S01E01_qalb.mp4`.
Voix : ElevenLabs « Salim » (accent tunisien). Les versets ne sont jamais lus par la synthèse : ils s'affichent dans un silence.
