# Mission 2 : l'application à vendre au Qatar

*Recherche du 3 octobre 2026. Les sources sont dans `etude-pays.md`, `pain-points.csv` (169 plaintes, une URL par ligne), `cibles.csv` et `modele-financier.xlsx`.*

## Synthèse (2 pages)

### La recommandation
**Construire « Hader » : rappels WhatsApp en arabe et en anglais, avec liste d'attente automatique, pour les cliniques privées de Doha (dentaire, dermatologie, kinésithérapie).**

Le patient reçoit un rappel la veille, avec trois boutons. S'il annule, le créneau est proposé tout de suite aux patients en attente. Prix : de 399 à 1 490 QAR par mois. Paiement par carte via un compte Stripe français, ce qui marche sans société au Qatar.

### Pourquoi celle-là
1. **La douleur est chiffrée.**
   - Le PHCC perd 27 % de ses rendez-vous réservés (Al-Sharq, `pain-points.csv`, ligne 161).
   - Côté patients, les attentes de 3 à 6 mois chez les spécialistes publics poussent vers le privé : 17 plaintes forment la grappe santé.
   - Pour une clinique de 500 rendez-vous par mois, 10 % de no-shows au ticket de 200 QAR font 10 000 QAR perdus par mois (ESTIMATION, méthode dans `spec-mvp.md`).
2. **Les solutions existantes ne visent pas ce besoin.**
   - HeliumDoc, Tabeebak et healthandmedical.qa sont des **places de marché** : elles amènent des patients, elles ne gèrent pas le planning de la clinique.
   - Okadoc rappelle par SMS ou e-mail, et non par WhatsApp. Il est noté 3,4/5 sur 43 avis (App Store des Émirats, extrait).
   - Les outils WhatsApp génériques (Blucript, Blinkflow, Mercuri) ne sont ni localisés, ni hébergés au Qatar.
3. **On peut vendre depuis Paris.**
   - 30 cliniques réelles affichent un WhatsApp ou un téléphone public (`cibles.csv`).
   - Le pilote gratuit de 30 jours ne demande qu'un CSV.
   - WhatsApp est utilisé par 93 % des internautes du pays (enquête Northwestern Qatar, extrait).
4. **Un solo peut le construire en 6 semaines** : 15 tâches Claude Code, détaillées dans `spec-mvp.md`.
5. **C'est aligné avec les financements.**
   - HealthTech et B2B SaaS sont des secteurs prioritaires du Startup Qatar Investment Program (START, jusqu'à 1,1 M$).
   - La NDS3 vise « l'efficacité et l'utilisation » du système de santé.

### Les chiffres du modèle (24 mois, `modele-financier.xlsx`)
- **Clients** : 57 cliniques actives à M24, avec 3 % de churn mensuel et un prix moyen de 699 QAR.
- **Revenu récurrent mensuel** : environ 9 750 € à M24.
- **Marge brute** : environ 84 %, après WhatsApp et Stripe.
- **Rentabilité** : résultat mensuel positif dès M6, **mais sans aucune rémunération du fondateur**.
- **Besoin de trésorerie maximal** : environ 5 500 €. Il comprend le voyage au Web Summit et 1 500 € de conseil juridique.
- **Scénario défavorable** (retenue à la source de 5 %) : passer la cellule B20 de l'onglet Hypotheses à 0,05.

### Critique d'expert : la meilleure raison de ne pas le faire
**Les données de santé.**
- Pour la loi qatarie (PDPPL, article 16), un rendez-vous chez le dentiste est une donnée de « nature spéciale ». Son traitement exige une autorisation préalable.
- Si l'autorisation de la clinique ne couvre pas son sous-traitant, chaque vente devient un dossier administratif.
- S'y ajoute un risque concurrentiel : HeliumDoc ou Tabeebak peuvent ajouter des rappels WhatsApp en un trimestre.
- **Parade.** Valider le point juridique avant d'écrire une ligne de code (1 500 €). Héberger à Doha. Ne stocker ni motif ni nom de famille. Se positionner comme l'outil de la clinique, celui qui ne lui « vole » pas ses patients.

### Ce que vous faites demain matin
1. **Envoyer le script WhatsApp** (anglais et arabe, dans `spec-mvp.md`) aux 5 premières cliniques de priorité A de `cibles.csv`, pour décrocher 3 pilotes avant d'avoir codé. Une maquette Figma suffit pour la démo.
2. **Réserver une consultation avec un cabinet d'avocats à Doha** sur la question : « Un sous-traitant SaaS qui stocke prénom, téléphone et heure de rendez-vous d'une clinique doit-il obtenir sa propre autorisation au titre de l'article 16 ? »
3. **Télécharger le CSV officiel des tarifs WhatsApp de Meta** et remplacer l'estimation de 0,02 $ par le vrai tarif utility du Qatar dans le modèle financier.

### Conditions d'arrêt
- **STOP** si, sur 30 cliniques contactées, moins de 3 acceptent un pilote gratuit.
- **STOP** si l'avocat confirme qu'une autorisation propre est requise et qu'elle prend plus de 3 mois.
- **STOP** si, après 60 jours de pilote, moins de 2 cliniques sur 3 passent en payant, ou si le taux de confirmation des rappels est inférieur à 60 %.

### À vérifier à la main
- Le tarif utility WhatsApp exact pour le Qatar (CSV Meta).
- Le nombre de cliniques privées autorisées (jeu de données data.gov.qa, non ouvert).
- La forme du financement START (fonds propres ou subvention) et l'obligation de relocalisation : à demander à Startup Qatar.
- Que les cartes Himyan (réseau NAPS uniquement) ne passent pas par Stripe. Prévoir le virement SWIFT annuel.
- Le régime de retenue à la source (« Trusted Entity ») pour un SaaS français.

---

## Annexe A : les grappes de douleurs (169 plaintes, 157 URL distinctes)

**Statut des preuves.**
- 13 lignes viennent de pages ouvertes : avis App Store de Metrash, Nar'aakom et Hukoomi.
- 156 sont des extraits de recherche, faute d'accès direct à Reddit et à Qatar Living depuis l'environnement.
- Les dates des fils Reddit n'ont pas pu être lues.

| # | Grappe | Nb | Gravité moy. /5 | Exemples |
|---|---|---|---|---|
| 1 | Démarches résidence et documents (QID, visas, Metrash, Hukoomi) | 31 | 3,3 | Hukoomi 3,2/5 (23 notes) ; erreurs de sécurité Metrash |
| 2 | Créer et gérer une PME | 24 | 3,5 | « impossible d'obtenir mon QID avec ma propre société » ; agents à 3 000-5 000 $ |
| 3 | Salaires, RH et main-d'œuvre | 22 | 4,2 | retards de salaire, amendes WPS de 2 000 à 6 000 QAR par salarié |
| 4 | Santé : accès et rendez-vous | 17 | 3,5 | 27 % de no-shows au PHCC ; Nar'aakom 2,8/5 |
| 5 | Logement et loyers | 14 | 3,6 | chèques de loyer perdus, cautions retenues |
| 6 | Voiture et circulation | 13 | 2,6 | permis, Istimara, amendes |
| 7 | École et université | 13 | 3,5 | listes d'attente, frais |
| 8 | Banque et paiements | 11 | 2,9 | ouverture de compte, cartes |
| 9 | Livraison et restaurants | 10 | 2,7 | commissions de 20 à 30 % pour les restaurants |
| 10 | Facturation, impayés et fiscalité | 7 | 4,3 | e-facturation attendue au 1er janvier 2027 ; impayés de sous-traitants |
| 11 | Télécom et services publics | 7 | 3,1 | facturation Ooredoo |

## Annexe B : existe-t-il déjà une solution ? (10 premières grappes)

| Grappe | Solution existante (preuve) | Verdict |
|---|---|---|
| 1. Démarches résidence | État : Metrash, Hukoomi (apps mal notées, mais monopole public) ; agences PRO | Non adressable par un tiers (rappels de conformité = « Muhlah », déjà étudié) |
| 2. Créer une PME | Single Window du MoCI (en ligne, https://www.moci.gov.qa/en/e-services) ; frais publics d'environ 2 200 à 3 200 QAR (Qatar Living) ; offres d'agents à 2 050 QAR (Feamish, Instagram) | Le prix s'est effondré : pas négligé |
| 3. Salaires, RH | 8 logiciels de paie WPS comparés pour le Qatar (HONO) ; outil gratuit de création de fichier SIF chez QNB ; plateforme publique « Moawen » pour le personnel domestique | Couvert |
| **4. Santé** | Places de marché HeliumDoc, Tabeebak, healthandmedical.qa ; Okadoc (SMS/e-mail, 3,4/5) ; outils WhatsApp génériques non localisés | **Partiel : aucun outil côté clinique, en arabe, hébergé au Qatar, avec liste d'attente. RETENU** |
| 5. Logement | TenancyOS (« gestion des chèques post-datés, baux Tawtheeq »), Andalus | Couvert |
| 6. Voiture | État (Metrash) | Non adressable |
| 7. École | Guides (iSchoolAdvisor, Wathim, Qatar Living), guide MoEHE 2026 | Volonté de payer faible côté parents |
| 8. Banque | Banques réglementées | Hors de portée |
| 9. Livraison | Talabat, Snoonu ; liens de paiement WhatsApp Sadad ; agences web | Saturé |
| 10. Facturation | Loi d'e-facturation approuvée le 6 mai 2026, application attendue au 1er janvier 2027 (EY) ; spécifications techniques non publiées (Flick) ; éditeurs déjà positionnés : ClearTax, Flick, RTC Suite, Wafeq | Trop tôt, trop concurrentiel |

## Annexe C : shortlist notée sur 100

| Idée | Douleur et volonté de payer /25 | Preuve qu'elle est négligée /20 | Vente rapide sans réseau /20 | Faisable en 6 semaines /20 | Financements qataris /15 | **Total** |
|---|---|---|---|---|---|---|
| **A. Hader : rappels WhatsApp et liste d'attente pour cliniques** | 20 | 12 | 14 | 17 | 13 | **76** |
| B. Kit conformité et vitrine bilingue pour vendeurs Instagram/WhatsApp (décision MoCI n° 25 de 2026) | 13 | 11 | 16 | 16 | 8 | 64 |
| C. Facturation bilingue « prête e-facturation 2027 » pour PME | 16 | 7 | 8 | 8 | 12 | 51 |

**Critiques**
- **A.** Voir plus haut : données de santé, et risque que les places de marché ajoutent WhatsApp.
- **B.** La décision n° 25 de 2026 oblige depuis le 16 mars 2026 tout vendeur Instagram ou WhatsApp à détenir une licence e-commerce, sans exemption pour les activités à domicile (Crowell, Dentons, TBC). Les consommateurs se méfient aussi des pages Instagram (« Instagram businesses scam », r/qatar). Mais les clients ont un budget minuscule (la licence à domicile coûte 300 QAR par an), le besoin de conformité se règle une seule fois, et des cabinets vendent déjà la licence.
- **C.** Les PME n'entreront que dans des phases ultérieures et les spécifications ne sont pas publiées : on construirait à l'aveugle contre Zoho, Odoo et Wafeq. À revoir en 2027, quand la Direction générale des impôts (GTA) publiera le format.

## Annexe D : registre des risques
Voir l'onglet « Risques » de `modele-financier.xlsx`. Chaque risque y a sa probabilité, son impact, sa solution et le coût de la solution. Les trois principaux :
- **données de santé** : probabilité forte, impact fort, 1 500 € de conseil ;
- **méfiance envers un vendeur à distance** : probabilité forte, impact fort, 2 200 € de voyage ;
- **concurrence des places de marché** : probabilité forte, impact moyen, 0 €.

## Annexe E : financement réaliste
- Depuis Paris, on peut **candidater** au Startup Qatar Investment Program (START, jusqu'à 1,1 M$, par tranches) et au QRDI TDG, en s'engageant à créer une société au Qatar si l'on est retenu.
- On ne peut pas entrer dans QSTP XLR8, réservé aux résidents.
- Séquence conseillée :
  1. 10 cliniques payantes ;
  2. dossier START déposé sur F6S ;
  3. entretien au Web Summit (31 janvier - 3 février 2027) ;
  4. licence QFC (500 $ + 5 000 $ par an) au moment de la relocalisation.
