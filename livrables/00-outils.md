# 00 · Test des outils (3 octobre 2026)

Test fait dans la session principale avant toute recherche. Firecrawl est présent et fonctionne.

| Outil | Requête testée | Résultat | Verdict |
|---|---|---|---|
| Google Trends (Firecrawl `firecrawl-trends`, `trends/related_queries`) | « cadeau personnalisé », FR, 5 ans | 25 requêtes « top » + 9 « rising » renvoyées. Ex. : « cadeau personnalisé homme » = 100, « cadeau couple personnalisé » +80 % | OK, 5 crédits/appel |
| Bibliothèque Meta (URL + `formats:["query"]`) | « planche à découper personnalisée », FR | « No ads match » : la requête à 4 mots est trop longue | Piège : utiliser 1-2 mots |
| Bibliothèque Meta (2e essai) | « gravure personnalisée », FR, `waitFor 8000` | ~220 résultats, annonceurs listés avec date de début (Free Vibes, xTool, Belvans, Babycrabe…) | OK avec mots courts et waitFor 8000 |
| Amazon.fr (`proxy:"stealth"`, `location FR`) | « planche a decouper personnalisee » | « over 6 000 results », prix, notes, avis, badge « 50+ bought in past month » | OK, mais page rendue en anglais (en-gb) et file d'attente de concurrence (~5 s) |
| Etsy France (`proxy:"stealth"`) | même requête | 798 résultats, boutique, prix, note et nombre d'avis de la **boutique** | OK. Attention : Etsy affiche les avis de la boutique, pas les ventes de l'annonce |
| TARIC (URL measures.jsp) | 4419110000, origine CN, 03/10/2026 | « Planches à pain, à hacher… en bambou », droit tiers 0 % | OK |

## Limites constatées
- Meta : une requête longue renvoie zéro. Toujours tester 1-2 mots clés et noter « 0 » seulement après deux formulations.
- Etsy : le chiffre visible sous l'annonce est le nombre d'avis de la boutique (ex. KDOMAGIC 2k), pas un volume de ventes du produit. On le note comme proxy de taille du vendeur.
- Amazon : rendu en anglais même avec location FR ; les prix restent en euros et valides pour amazon.fr.
- Firecrawl : la concurrence est plafonnée (attente de 5 s observée à 4 appels simultanés). Je groupe par 3-4.
- Sous-agents : pas d'accès à Firecrawl. Ils font la recherche WebSearch et écrivent dans des fichiers ; toutes les mesures chiffrées (Trends, Meta, Amazon, Etsy, TARIC) sont faites ici.

## Leçons apprises pendant la session (à reprendre la prochaine fois)
- **Contrairement à la note de départ, les sous-agents avaient accès à Firecrawl** et partageaient le même quota que la session principale. Résultat : des erreurs « Rate limit exceeded » (environ 15 requêtes par minute au total). Il faut soit leur interdire Firecrawl dès le lancement, soit leur réserver une plage.
- Sans Firecrawl, les sous-agents n'ont pas pu lire Reddit, Qatar Living, l'App Store ni la presse qatarie : WebFetch est bloqué par le proxy. D'où 156 plaintes sur 169 au statut « extrait ».
- Deux sous-agents ont été coupés par la limite de session de l'API. Leurs fichiers partiels ont été récupérés et complétés à la main.
- Trends `interest_over_time` sur 12 mois (53 points) coûte beaucoup moins de contexte que sur 5 ans (261 points). Garder un mot ancre identique dans chaque lot pour comparer les lots.
- LibreOffice ne démarre pas dans ce conteneur : les formules des tableurs ont été vérifiées par un recalcul en Python.
- Le tarif WhatsApp par pays n'est publié que dans un CSV Meta, illisible via Firecrawl.
