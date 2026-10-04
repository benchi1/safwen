# 00 · Préflight des outils (P0)

Relevé du 2026-10-04 vers 15 h 35 UTC. Gate 1, phase P0.

## Hypothèses de contexte (cases vides du bloc CONTEXTE)

- Statut juridique et régime de TVA : inconnus. Les calculs seront faits en franchise ET en assujetti, la plus prudente est retenue.
- Budget total : 5 000 à 10 000 €.
- Temps disponible, stockage à Paris, CPA maximum accepté : inconnus. Hypothèse : stockage possible à Paris en petite quantité, CPA maximum = CPA seuil.
- Date : 4 octobre 2026. La période promo Amazon Prime d'octobre est en cours (badges « Early Prime Deal » visibles), donc les prix et classements Amazon de ces jours-ci sont biaisés.

## Résultat des sondes

| Sonde | Statut | Valeur témoin lue | Conséquence |
|---|---|---|---|
| Bibliothèque Meta FR, « aspirateur » | OK | « ~2,300 results », annonceurs lisibles (Amazon.fr, Cdiscount, Tineco, Kärcher, Dreame France…) | Contrôle positif réussi (> 100 attendu). Outil fiable pour la France. |
| Bibliothèque Meta US, « vacuum » | OK | « ~39,000 results » | Fiable. Le mode directQuote renvoie parfois le texte de la pub au lieu des noms d'annonceurs : le prompt de mesure doit le cadrer. |
| Google Trends (alexandria), tableau de 2 capacités | OK | 2 résultats en 1 appel, 5 crédits par capacité | Regrouper jusqu'à 10 capacités par appel. Un mot générique (« gadget » US) ne donne que du bruit (Inspector Gadget, Pokémon) : mots-clés produit uniquement. |
| Amazon.fr, page de recherche | OK | prix, nombre d'avis, badge « 50+ bought in past month » | Pas de captcha en proxy basique. Le mode directQuote est très verbeux sur Amazon (liens) : utiliser freeform avec copie exacte des valeurs. |
| Amazon.com Movers & Shakers (maison) | INVALIDE | « Sorry, there are no movers and shakers available in this category » | Source écartée. Remplacée par Best Sellers + badges « bought in past month ». |
| Amazon.com Best Sellers (maison) | OK | 30 produits avec prix, nombre d'avis, ASIN | Source de découverte et de signal D. |
| TikTok Creative Center Top Ads FR | KO | mur de connexion, 4 pubs visibles sur la page | NON MESURÉ. Compensation : recherche des vidéos TikTok publiques (firecrawl_search). |
| Temu, page de recherche FR | INVALIDE | redirection vers /fr/c.html, aucun résultat | Pas de scraping direct de la recherche Temu. |
| Temu via firecrawl_search (temu.com) | OK partiel | fiches produit trouvées avec note et nombre d'avis, prix absent de l'extrait | Prix plancher Temu = scrape de la fiche produit trouvée. |
| AliExpress FR, page de recherche | OK | prix et « vendus » lisibles (ex. 18,29 €, 70 vendus ; 24,11 €, + 2 000 vendus) | Source d'ancre de prix fiable. |
| Shopify (get-shop-info) | KO | « needs you to sign in again » | Inutile avant la gate 3. À reconnecter sur claude.ai/customize/connectors, puis nouvelle session. |
| Agent de workflow + Firecrawl (canary) | OK | outils chargés par ToolSearch, firecrawl_search : 5 résultats | Le fan-out Firecrawl par agents est possible. |

## Débit et budget

- Limite de concurrence du forfait Firecrawl : sur 5 appels simultanés, 2 ont attendu 2 à 10 s en file. Plafond retenu : 3 agents Firecrawl en vol, un seul appel à la fois par agent.
- Coûts observés : scrape avec extraction = 5 crédits, recherche de 5 résultats = 2 crédits, capacité Trends = 5 crédits.
- Consommé en P0 : 11 appels, environ 54 crédits. Budget gate 1 : environ 250 appels (1 300 à 1 500 crédits).

## Décision

Firecrawl et le contrôle positif Meta FR sont OK : la gate 1 peut continuer. TikTok Creative Center et Temu (recherche directe) sont traités en NON MESURÉ ou par contournement, jamais comme des zéros.
