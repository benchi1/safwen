# 03 · Gate 1 : résultat

Relevé du 2026-10-04. Méthode et preuves : `00-outils.md`, `01-candidats.csv` (une ligne par preuve), `02-top10.md`.

## Verdict : NO-GO strict

109 produits trouvés aux US, 50 mesurés en France, 12 passés au crible économique. **Aucun ne passe les 5 critères éliminatoires** (panier ≥ 45 €, prix ≥ 4 × coût livré, marge HT ≥ 65 %, contribution ≥ 25 €, ROAS seuil ≤ 1,8) avec un coût fournisseur estimé prudemment à 85 % du prix AliExpress. La règle du prompt s'applique : pas de produit faible présenté comme gagnant.

Ce qui n'a pas tourné, faute de crédit d'utilisation : le coût fournisseur réel (CJ), le prix des concurrents français, les avis, les brevets, et la red team indépendante. Les 3 produits ci-dessous ne sont donc **pas validés**. Ce sont les plus proches du seuil, avec la condition chiffrée qui les débloque.

## 1. Masseur cou et épaules chauffant à pétrissage, sans fil
- Problème : Nuque et épaules raides après le bureau ou le téléphone, envie d'un massage type kiné à la maison
- 3 premières secondes : L'appareil drapé sur les épaules serre comme deux mains, la personne se relâche visiblement
- Preuves : Amazon US « 1 000+ achetés le mois dernier » et 5 200 avis ; pub Meta US active depuis 276 jours ; 1 seul annonceur vu en France (5 résultats Meta FR).
- Économie (estimation) : prix visé 129,90 € ; coût livré estimé 26,85 € ; contribution 82,95 € ; marge HT 71 % ; **ROAS seuil 1,95 (il faut ≤ 1,8)**. Seul critère raté.
- **Se débloque si** le coût livré fournisseur est **≤ 21,70 €** par unité. Et si 129,90 € tient face aux prix français : à vérifier.
- Risques : prix plancher AliExpress 31,59 € (24 % de notre prix), donc offre exclusive obligatoire ; aucune allégation santé (sinon dispositif médical) ; batterie lithium : certificats CE et UN38.3 du fournisseur ; 800 g.

## 2. Visseuse / tournevis électrique sans fil avec coffret d'embouts
- Problème : Monter des meubles en kit et faire les petits travaux d'appartement sans perceuse lourde ni poignet douloureux
- 3 premières secondes : Montage d'un meuble en kit : la vis rentre en 2 secondes au lieu de 30 tours de poignet
- Preuves : Amazon US « 5 000+ achetés le mois dernier » et 15 700 avis ; 4 annonceurs vus en France (22 résultats).
- Économie (estimation) : prix visé 64,90 € ; coût livré estimé 13,08 € ; contribution 35,72 € ; marge HT 63 % ; ROAS seuil 2,26 ; multiple 3,55.
- **Se débloque si** le coût livré, différenciation comprise, est **≤ 9,30 €**.
- Risques : batterie lithium (CE, filière DEEE), prix plancher AliExpress 15,39 €.

## 3. Ceinture à cliquet sans trous
- Problème : Avoir une ceinture ajustée au cran près, sans trous qui s'abîment.
- 3 premières secondes : Clic-clic : la boucle s'ajuste au millimètre, sans trou visible.
- Preuves : Amazon US « 8 000+ achetés le mois dernier » et 51 600 avis ; 2 annonceurs vus en France (37 résultats).
- Économie (estimation) : prix visé 39,90 € ; contribution 24,22 € (il faut 25 €) ; ROAS seuil 2,05.
- **Se débloque si** le coût livré est ≤ 4,50 € à 39,90 €, ou ≤ 5,45 € avec un prix de 44,90 €.
- Risque majeur : la même ceinture est à 5,29 € sur AliExpress (13 % de notre prix). Sans vraie marque ni coffret cadeau, la comparaison tue la conversion.

## Ce qu'il faut faire maintenant (gratuit)
1. Demander un devis « livré France » pour ces 3 produits : CJ Dropshipping, un agent 1688, et un fournisseur avec stock UE. Le seuil de coût est donné plus haut pour chacun.
2. Noter à la main le prix de 2 ou 3 concurrents français pour le masseur. Est-ce que 129,90 € tient ?
3. M'envoyer les devis. Le recalcul prend une minute, et on passe en gate 2 sur ceux qui passent.

**GATE 1 TERMINÉE : NO-GO strict, 3 candidats à débloquer par devis. J'attends les devis ou « GO GATE 2 » sur l'un d'eux.**
