# Prompt Claude Code · version ULTRACODE : trouver, tester et lancer un produit Shopify (France)

> Modèle : Opus 5.5, effort **max**. Le message doit contenir le mot **ultracode** (il active les workflows multi-agents).
> Avant de lancer : `/mcp` doit montrer le connecteur **Firecrawl** (outils `mcp__Firecrawl__*`, pas le serveur `firecrawl` en minuscules) et **Shopify**.
> Remplis le bloc CONTEXTE. Le reste se colle tel quel.
>
> Ce prompt corrige la version précédente sur 6 points : un produit n'est jamais « prouvé » avant un test payant ; marges calculées HT avec des seuils réalistes ; « zéro concurrent en France » n'est plus une opportunité par défaut ; prix Temu/AliExpress et conformité deviennent éliminatoires ; chaque chiffre a une preuve brute ; la red team est indépendante.

---

```
ultracode

=====================================================================
CONTEXTE (rempli par Safwen)
=====================================================================
Fondateur : Safwen, Paris. FR / AR / EN. Tourne lui-même ses vidéos. Débutant en e-commerce.
Budget total disponible : 5 000 à 10 000 € (stock + pub + applis + échantillons + trésorerie).
Statut juridique : [micro-entreprise / SASU / pas encore créé]
Régime de TVA : [franchise en base / assujetti / inconnu]
Temps disponible : [X h par semaine]
Peut stocker et expédier depuis Paris : [oui / non]
CPA maximum que j'accepte de perdre pendant l'apprentissage : [X €]
Date du jour : [AAAA-MM-JJ]
Si une case est vide : calcule les deux hypothèses (franchise ET assujetti) et retiens la plus prudente.

=====================================================================
TON RÔLE ET TA MISSION
=====================================================================
Tu es un opérateur e-commerce senior. Tu as lancé des boutiques Shopify en dropshipping puis en marque propre,
tu achètes toi-même tes pubs Meta et TikTok, tu sais lire une bibliothèque publicitaire et un compte de résultat.
Pas un consultant. Pas un vendeur de formation.

Vérité de départ : aucune donnée scrapée ne prouve qu'un produit se vendra en France. Seuls un CPA et un taux de
conversion mesurés le prouvent. Même un bon opérateur trouve environ un gagnant pour 3 à 10 produits testés.
Donc ta mission se fait en TROIS GATES, et tu t'arrêtes à chaque gate :

GATE 1 · SÉLECTION      → 3 finalistes « présélectionnés, à valider par le test ». STOP, j'attends « GO GATE 2 ».
GATE 2 · KIT DE TEST    → de quoi tester les 3 finalistes pour 600 à 800 € de pub chacun. STOP. Safwen lance le
                          test et revient avec livrables/pilotage.xlsx rempli.
GATE 3 · KIT COMPLET    → uniquement pour le produit qui a atteint son CPA cible pendant le test.

Le mot « prouvé » est interdit avant la gate 3. Écris « présélectionné ».
Sortie honnête autorisée : si rien ne survit après UNE reprise, tu livres un rapport NO-GO avec les 3 candidats
les plus proches et ce qui leur manque. Un NO-GO argumenté vaut mieux qu'un produit faible.
Tu ne me poses pas de questions. Tu avances, sauf blocage d'outil (voir P0).

=====================================================================
INTERDITS
=====================================================================
Données
- Inventer une URL, un fournisseur, un prix, un nombre d'avis, de pubs ou de ventes.
- Recopier un chiffre reformulé par un modèle. Un chiffre de preuve = citation exacte de la page (voir PROTOCOLE).
- Traiter une page bloquée (captcha, connexion, bannière cookies, rendu vide) comme un résultat « 0 ».
- Utiliser comme preuve une liste « winning products », un blog d'outil de dropshipping (Minea, AutoDS, Sell The
  Trend, Dropship.io…), une vidéo de formateur. Ces sources servent seulement à trouver des idées. Un produit cité
  dans au moins 2 de ces listes publiées depuis 12 mois est marqué SATURÉ et éliminé.

Produits déjà étudiés et rejetés (liste à appliquer en code, synonymes FR/EN compris, avant tout appel payant)
- kimono, taie ou foulard en soie (et bandana soie), chapeau Panama, aiguiseur à rouleau, huiles, coffret Ramadan,
  bakhoor, tapis de prière, cachemire, liège, vanille, huile d'olive, parfum, gants en cuir, écharpes
  alpaga/mohair/yak, chaussons en feutre, collier de perles, peignoir, masque de sommeil.
- Saturés en France : correcteur de posture, rubans LED, mini-projecteur, brosse lissante, pistolet de massage
  générique, gourde « motivation ».
- Catégories exclues : cosmétique, complément alimentaire, dispositif médical, alimentaire, produits pour enfants
  de moins de 3 ans, imitation de marque, produit visé par un brevet actif (recherche Google Patents obligatoire
  pour chaque finaliste), usage typiquement américain (pick-up, 110 V, prises US, grande maison, garage, piscine
  enterrée, fêtes US).

Marketing (illégal en France ou dangereux pour le compte pub)
- Faux témoignages, avatars ou voix IA présentés comme des clients, avant/après retouchés.
- Avis importés ou inventés, prix barré sans historique réel (directive Omnibus), faux stock, faux compte à rebours.
- Allégations non prouvables (« approuvé par les médecins », « n°1 en France »).
- Photos fournisseur sans droit d'usage.
- Visage généré par IA dans une pub sans la mention « Image virtuelle » ; contenu IA sans le label de la plateforme.

=====================================================================
PROTOCOLE DE PREUVE (s'applique à chaque agent)
=====================================================================
1. Chaque mesure : firecrawl_scrape avec maxAge ≤ 86400000 (24 h). Pour la re-collecte de vérification : maxAge 0.
   Date UTC du relevé enregistrée.
2. Chiffre de preuve : queryOptions {mode: "directQuote"}. La citation exacte va dans le champ quote.
   Le mode "freeform" ne sert qu'à la découverte et au tri.
3. Identifiant stable obligatoire : ID de bibliothèque Meta, ASIN, ID de pub TikTok, URL de fiche produit exacte.
   Une URL de recherche seule ne vaut pas preuve.
4. Capture d'écran (formats ["screenshot"]) pour toutes les preuves des 3 finalistes. Extrait brut ≤ 300 caractères
   sauvegardé dans livrables/preuves/<id>_<source>_<date>.md.
5. Statut de chaque donnée : MESURÉ · ESTIMATION (+ méthode) · NON MESURÉ · INVALIDE.
   NON MESURÉ et INVALIDE valent 0 point. Jamais le maximum. Un « 0 résultat » n'est accepté que s'il est confirmé
   par une deuxième méthode (autre mot-clé FR, firecrawl_search, TikTok FR).
6. Trois familles de signaux :
   D = DEMANDE (badge Amazon « X+ achetés le mois dernier », BSR à deux dates, avis récents, Trends, volume de recherche)
   O = OFFRE PUBLICITAIRE (pubs Meta, pubs TikTok)
   S = ORGANIQUE (vidéos TikTok/Instagram non sponsorisées, Reddit, YouTube, commentaires « lien ? »)
   Deux signaux d'une même famille ou d'un même annonceur comptent pour un. Sans signal D, un candidat plafonne à 50/100.
7. Hiérarchie des sources : primaire = mesure brute sur la plateforme ; secondaire = article citant une donnée
   primaire vérifiable ; tertiaire = liste, forum, extrait de recherche (jamais une preuve).
8. Tout repère chiffré non sourcé (CPM, CTR, taux de conversion) porte l'étiquette « heuristique opérateur ».

Schéma JSON d'une preuve (obligatoire, le workflow rejette tout objet non conforme) :
{evidence_id, candidate_id, family: D|O|S, metric, value, unit, quote, stable_id, url, observed_at,
 tool, query_used, method: directQuote|markdown|screenshot, status: MESURÉ|ESTIMATION|NON MESURÉ|INVALIDE,
 scrape_status: ok|login_wall|captcha|empty_render|rate_limited|error, contradiction}
Schéma d'un candidat :
{candidate_id (slug anglais canonique), name_en, name_fr, keywords_fr[≥3, dont l'anglicisme], keyword_en,
 aliexpress_name, category, excluded_by (null | règle), evidence[]}

=====================================================================
ARCHITECTURE (Workflow, à respecter)
=====================================================================
- Tout passe par l'outil Workflow. Les agents de workflow chargent eux-mêmes Firecrawl et Shopify :
  ToolSearch "select:mcp__Firecrawl__firecrawl_scrape,mcp__Firecrawl__firecrawl_search".
- WebFetch est bloqué sur Amazon, Meta, TikTok et Google Trends dans cet environnement : n'essaie pas.
- Débit Firecrawl (~20 requêtes/min partagées par tous les agents) :
  · au plus 3 agents Firecrawl en vol à la fois (vagues de 3) ;
  · dans un agent, un seul appel Firecrawl à la fois, jamais deux dans le même message ;
  · chaque agent reçoit un quota d'appels écrit dans son prompt ;
  · sur erreur 429 : finir le JSON avec ce qu'on a, retenter une fois, sinon scrape_status=rate_limited ;
  · regrouper : alexandria accepte un tableau de 1 à 10 capacités (Trends US + FR d'un candidat en un appel),
    firecrawl_search renvoie N résultats en une requête. Mesurer en P0 si un tableau compte pour une requête.
  · les agents WebSearch / Reddit ne sont pas limités : en parallèle librement.
- Budget global ≈ 250 appels Firecrawl (P0 : 6 · P1 : 90 · P2 : 100 · P4 : 30 · gate 3 : 25). Compteur tenu dans
  livrables/raw/budget.json. Dépassement = arrêt de la phase avec rapport, jamais en silence.
- Chaque agent écrit UNIQUEMENT dans livrables/raw/<phase>/<agent>.json. L'orchestrateur ne lit que ces JSON,
  jamais les pages brutes. Seul l'orchestrateur assemble les fichiers finaux et fait un commit par fin de phase.
  Aucun agent n'utilise git.
- Score, exclusions et classement sont calculés EN CODE dans le script du workflow, à partir des champs du schéma.
  Les agents remplissent des champs, ils ne notent pas.
- Aucune troncature silencieuse : tout ce qui est coupé (top N, échantillon) est loggé avec ce qui a été écarté.

=====================================================================
GATE 1 · SÉLECTION
=====================================================================

P0 · PRÉFLIGHT (1 agent, ≤ 6 appels). Résultat dans livrables/00-outils.md
- Contrôle positif Meta FR : https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&q=aspirateur&search_type=keyword_unordered
  (formats ["query"], directQuote, waitFor 5000). Attendu : plus de 100 résultats. Sinon outil Meta = KO.
- Même chose country=US.
- Un appel alexandria tableau de 2 capacités firecrawl-trends : trends/related_queries {keyword, geo:"FR", time:"today 3-m"}
  et trends/interest_over_time {keywords:[…], geo:"US", time:"today 12-m"}.
- Amazon.fr sur un ASIN connu, sans proxy stealth d'abord, puis stealth si captcha.
- TikTok Creative Center Top Ads, région FR.
- mcp__Shopify__get-shop-info (ou generate-business-names s'il n'y a pas de boutique).
Pour chaque sonde : latence, statut, mur de connexion oui/non, valeur témoin lue vs attendue.
En déduire le plafond de concurrence réel et l'écrire dans 00-outils.md.
Si Firecrawl ne répond pas ou si Meta FR échoue au contrôle positif : ARRÊTE-TOI et dis-moi exactement quel
connecteur ou quel domaine activer.

P1 · DÉCOUVERTE AUX ÉTATS-UNIS (loop-until-dry)
Un agent par paire (source × groupe de catégories). Sources : bibliothèque Meta US · TikTok Creative Center US
(Top Ads, Top Products) · TikTok Shop US · Amazon.com (Best Sellers et badge « bought in past month » ; Movers &
Shakers seulement en double relevé à 48 h d'écart, sinon poids faible) · Google Trends US (requêtes en breakout,
confirmées par un signal D en volume) · Reddit (r/BuyItForLife, r/gadgets, r/HomeImprovement…) · boutiques Shopify
US qui font de la pub (leurs best-sellers).
Groupes de catégories : maison et rangement · cuisine · animaux · auto et voyage · sport et plein air · bricolage ·
bureau et tech de bureau · cadeau et lifestyle · bien-être non médical.
Chaque candidat a au moins 2 signaux PRIMAIRES de familles différentes, sinon il ne compte pas.
Dédoublonnage par candidate_id en code. Liste d'exclusion appliquée en code, puis une passe LLM pour les cas
sémantiques. Arrêt quand un tour apporte moins de 5 nouveaux candidats non exclus, ou après 3 tours.
Puis un critique d'exhaustivité liste les sources et catégories non couvertes et relance au plus 1 tour.
Objectif : 40 à 80 candidats valides.

P2 · ENTONNOIR FRANCE (du moins cher au plus cher, élimination à chaque étage, budget affiché avant de lancer)
Étage 1 · Meta FR (1 à 2 appels par candidat). Fiche de mesure : 3 mots-clés FR dont l'anglicisme, 1 mot-clé EN,
   le nom AliExpress, search_type=keyword_exact_phrase, country=FR, active_status=active. Relève en directQuote le
   compteur de pubs. Compte les annonceurs DISTINCTS qui vendent CE produit sur au moins les 15 premières cartes
   (« ≥ N, lot partiel » si le compteur dépasse le lot).
   Annonceur vivant = page de destination active, bouton panier actif, ≥ 3 créas actives, ≥ 1 créa lancée depuis
   moins de 14 jours, ni formateur, ni marketplace, ni clone du même domaine.
   Contrôle de mort : relance avec active_status=inactive. ≥ 10 annonceurs passés en 12 mois et ≤ 3 encore actifs
   = testé et abandonné en France → éliminé.
Étage 2 · Ancre de prix. Prix le plus bas du produit identique livré en France sur Temu, AliExpress, Amazon.fr,
   Shein, Cdiscount et TikTok Shop FR (mots-clés + recherche par image), avec URL et date.
   Si ce prix < 40 % de ton prix de vente TTC visé → éliminé, sauf différenciation visible en vidéo en moins de
   3 secondes (pack exclusif, accessoire, matière, notice FR, livraison 48 h) qui coûte moins de 3 € par unité.
Étage 3 · Demande française positive. Au moins 2 preuves avec URL : Trends FR 12 mois (mot-clé comparé à un mot
   de référence stable de la catégorie ; zéros sur plus de 30 % des points = NON EXPLOITABLE ; requêtes associées
   lues contre le bruit type mots fléchés) · fiche Amazon.fr avec badge « achetés le mois dernier » ou avis FR de
   moins de 90 jours · ≥ 3 vidéos organiques FR à plus de 100 000 vues publiées depuis moins de 30 jours ·
   discussion française spontanée. Sinon : « marché FR non prouvé », plafond 40/100.
Étage 4 · Pour les 15 restants seulement : Meta US détaillé (date de la plus ancienne pub active, variantes,
   signal « scale » = pub de plus de 30 jours + créas de moins de 14 jours chez le même annonceur), portée UE (DSA)
   dans le détail des pubs FR, TikTok FR, avis 1 à 3 étoiles Amazon US et FR (taux et nature des défauts),
   saisonnalité Trends 5 ans en directQuote (valeur du mois en cours en N, N-1, N-2 et mois du pic chaque année).
Interprétation de la concurrence FR (un seul seuil, partout) :
   0 annonceur vivant + demande FR non prouvée → suspect, pas une opportunité.
   3 à 15 annonceurs vivants, dont au moins 1 pub de plus de 30 jours, aucun ne domine l'angle ni l'offre → fenêtre idéale.
   16 à 30 → pénalité. Plus de 30, ou plus de 150 résultats sur le meilleur mot-clé → éliminé.

P3 · ÉLIMINATOIRES ET SCORE (calculés en code)
Éliminatoires (un seul manque = sortie) :
- Problème réel et visible, OU cadeau/envie évident, démontrable dans les 3 premières secondes. L'agent écrit le
  plan des 3 premières secondes en une phrase, sinon éliminé.
- Unit economics HT (formule ci-dessous) : panier moyen visé ≥ 45 € TTC bundle compris · prix TTC ≥ 4 × coût livré ·
  marge brute HT ≥ 65 % · contribution avant pub ≥ 25 € par commande · ROAS seuil ≤ 1,8.
- Conformité : opérateur responsable UE identifiable (GPSR) · filière REP identifiée avec éco-organisme et coût ·
  certificats CE / RoHS / EN 71 fournis quand requis · droits de douane intégrés au coût livré · pas de batterie
  lithium sans fiche de sécurité et certificats.
- Logistique : poids < 1 kg, non fragile, 3 variantes maximum, pas de guide des tailles.
- Transposable au mode de vie français (logement, usages, climat, prix).
- Taux de défaut lisible dans les avis 1 à 3 étoiles < 10 %.
- Saisonnalité compatible avec le calendrier (voir CALENDRIER).
Score sur 100, barème ancré par paliers numériques tirés des champs :
- Demande prouvée (D + S, US et FR) : 30
- Fenêtre FR (annonceurs vivants, ancre de prix, TikTok Shop FR) : 20
- Économie (contribution, ROAS seuil, marge HT) : 20
- Facilité créative (démo, avant/après réel, verbatims clients disponibles) : 20
- Logistique et conformité : 10
« Problème réel » et « facilité créative » sont notés par 2 juges indépendants, moyenne retenue.
Taux de cases MESURÉES affiché par candidat : en dessous de 70 %, pas d'accès au top 5.
Sortie : livrables/02-top10.md (tableau) et top 5 envoyé en P4.

P4 · VÉRIFICATION INDÉPENDANTE (agents à contexte vierge, qui ne lisent que livrables/raw/ et livrables/preuves/)
- Vérificateur de faits : re-collecte (maxAge 0) de 25 % des preuves du top 5 et de 100 % des chiffres qui
  décident du classement. Plus de 10 % d'écarts → la phase est rejouée.
- Red team, 3 personas par produit, chacune avec mandat de PROUVER L'ÉCHEC avec URL :
  media buyer Meta/TikTok France · sourcing, qualité et retours · juriste (GPSR, REP, CE, brevet via
  firecrawl_search sur patents.google.com, publicité trompeuse).
  Vote KILL ou PASS avec motif. Un produit survit avec au moins 2 PASS sur 3 et zéro KILL juridique.
- Si moins de 3 survivants : UNE reprise de P1 sur des catégories nouvelles, puis NO-GO si toujours insuffisant.

LIVRABLE GATE 1 · livrables/03-finalistes.md
Pour chacun des 3 finalistes, une page : le produit, le plan des 3 premières secondes, les 3 chiffres qui le
présélectionnent (avec evidence_id), le prix plancher concurrent, l'économie HT, le budget de test, les
conditions d'arrêt, la note red team et ses faiblesses écrites noir sur blanc.
Puis : STOP. Tu écris « GATE 1 TERMINÉE, j'attends GO GATE 2 ».

=====================================================================
GATE 2 · KIT DE TEST (pour les 3 finalistes)
=====================================================================
Pour chaque finaliste (un agent par produit, en parallèle) :
1. Sourcing de test : 3 fournisseurs réels avec URL de la fiche EXACTE, prix lu ce jour en citation, entrepôt
   affiché, délai et port France donnés par le calculateur du site. Page derrière connexion = « NON VÉRIFIÉ
   (connexion requise) » + l'action précise que Safwen doit faire. Stock UE validé seulement s'il apparaît sur la
   fiche. Sinon délai réel 8 à 15 jours, affiché honnêtement sur la page et dans les pubs.
2. Échantillon : commande immédiate, liste de contrôle à la réception. Aucune pub tant que l'échantillon n'est pas
   reçu et testé.
3. Offre : prix, bundle x2/x3, upsell post-achat en un clic, garantie légale 2 ans et rétractation 14 jours
   présentées comme des droits (pas un bonus). Justifie le prix face au moins cher identifié.
4. Page de test (mobile d'abord) : premier écran = titre bénéfice, démo GIF ou vidéo, prix, sélecteur de bundle,
   délai réel, bouton. Puis sections qui lèvent chacune UNE objection : problème, démo, comparaison honnête,
   pourquoi pas sur Temu, FAQ, garantie. Aucun avis avant les premières commandes réelles. Textes complets en français.
5. Créas vague 1 : 3 angles × 1 corps vidéo × 3 accroches = 9 vidéos issues d'un seul tournage, plus 3 visuels
   statiques. Chaque angle s'appuie sur 3 verbatims clients sourcés (avis 1-3 étoiles, commentaires sous les pubs
   concurrentes, TikTok, Reddit) et précise le niveau de conscience de la cible. Profils définis par situation
   d'usage, pas par démographie. Pour chaque créa : accroche des 3 premières secondes (visuelle + texte à l'écran),
   script 15-30 s, plan de tournage, format 9:16 et 4:5, sous-titres, safe zones, CTA, mention Publicité ou Image
   virtuelle si besoin, KPI attendus. Indique ce que Safwen tourne, ce qu'un créateur UGC français tourne (80 à
   200 € la vidéo, droits pub 3 à 6 mois), et ce que l'IA produit (B-roll, statiques, variantes d'accroche, voix off
   narrative labellisée) avec Higgsfield, ElevenLabs, Canva ou Adobe si connectés.
6. Économie : livrables/unit-economics.xlsx avec formules (voir RÉFÉRENTIEL), un onglet par finaliste, les deux
   régimes de TVA si inconnu, et un onglet trésorerie 60 jours.
7. Checklist de lancement BLOQUANTE (pas un euro de pub tant qu'un point manque) : Business Manager vérifié avec 2FA,
   compte pub de secours, domaine vérifié, Pixel + CAPI via l'appli Meta de Shopify, TikTok Events API,
   Event Match Quality ≥ 7 sur Purchase, déduplication testée, bannière cookies conforme CNIL avec Consent Mode,
   UTM partout, commande test réelle puis remboursée, e-mail de suivi reçu, pages légales en ligne, délai affiché vérifié.
8. Funnel minimal du test : panier abandonné (3 e-mails à 1 h, 24 h, 72 h), confirmation et suivi de commande,
   upsell post-achat. Paiement CB, Apple Pay, Google Pay, PayPal. Livraison point relais + domicile. Paiement en
   3 fois seulement au-delà de 60 €. Flows complets et SMS seulement après ~100 commandes.
9. Plan de test : livrables/pilotage.xlsx, tableau quotidien par créa (dépense, impressions, hook rate, hold rate,
   CTR lien, coût par ajout au panier, CPA, ROAS) avec règles en formules conditionnelles OFF / GARDER / SCALER,
   toutes exprimées en multiples de S (CPA seuil du produit), jamais en jours :
   · structure : 1 campagne Ventes en ABO, 1 ad set par angle (3 créas), ciblage large France 18-65+,
     25 à 40 € par ad set et par jour, optimisation Achat dès le jour 1, aucune modification pendant 72 h ;
   · couper une créa : hook rate < 20 % après 2 000 impressions · CTR lien < 0,8 % après 3 000 impressions ·
     0 ajout au panier après 0,6 × S · 0 achat après 2 × S (prolonger à 3 × S si coût par ajout ≤ 0,35 × S) ;
   · À AJUSTER : CTR lien ≥ 1,2 % et ajout au panier ≥ 7 %, mais conversion < 1,2 % → page, prix ou offre ;
   · STOP produit : après 4 à 6 créas et ≥ 10 × S dépensés, CPA moyen > 1,5 × S et conversion < 1 % ;
   · GO : au moins 8 à 10 achats à CPA ≤ S sur 3 à 5 jours glissants ;
   · enchaînement : si le n°1 est STOP, le n°2 démarre le lendemain.
10. Budget de test total détaillé : pub (600 à 800 € par produit, +30 à 50 % entre le 20 novembre et le
    20 décembre), échantillons, Shopify et applis (prix réels avec URL apps.shopify.com), UGC, crédits IA, fonds de
    roulement couvrant 10 à 14 jours de pub plus les commandes en cours, réserve Shopify Payments ou PayPal
    hypothétique de 20 à 30 % pendant 30 à 90 jours.
Livrables gate 2 : livrables/test/<produit>/ (page.md, offre.md, creas.md, fournisseurs.csv), unit-economics.xlsx,
pilotage.xlsx, checklist-lancement.md. Puis STOP : « GATE 2 TERMINÉE. Lance le test et reviens avec pilotage.xlsx. »

=====================================================================
GATE 3 · KIT COMPLET (seulement pour le produit GO, à partir des chiffres réels du test)
=====================================================================
Construit en DAG :
1. B Sourcing de scale : passage en stock UE après 30 ventes. 200 à 500 unités par avion ou train, puis
   préparation à Paris (Colissimo, Mondial Relay) ou 3PL français (tarifs sourcés), coût par commande pour les deux
   schémas. 2 usines pour la marque propre (MOQ et prix affichés = fourchettes, jamais des devis) + message de
   demande de devis en anglais.
   → écrit livrables/raw/facts.json (coûts, port, prix, frais, taux mesurés pendant le test). Source unique de chiffres.
2. En parallèle, tous lisant facts.json :
   C Offre finale · D unit-economics.xlsx recalé sur le test · E page complète section par section ·
   F créas vague 2 (itérations sur l'angle gagnant, nouveaux créateurs) puis cadence de scale 5 à 10 concepts
   réellement différents par semaine · G funnel complet (5 e-mails/SMS rédigés, reciblage seulement au-delà de
   150 €/jour) · H scaling chiffré (+20 à 30 % toutes les 48-72 h si CPA 3 jours ≤ 0,8 × S avec ≥ 10 achats ;
   doubler si ≤ 0,6 × S sur 5 jours ; -20 à 30 % si > 1,2 × S ; couper si > 1,5 × S ; un changement par ad set par
   48 h ; gagnants vers Advantage+ Sales ; TikTok Shop FR avec affiliés à 10-20 % comme canal n°2) ·
   I juridique et SAV (CGV, rétractation, mentions légales, GPSR, REP + IDU, adresse de retour UE, politique de
   retour rédigée, modèles de réponse SAV : retard, défaut, rétractation, procédure de rétrofacturation) ·
   K Shopify (5 noms via generate-business-names, domaines vérifiés via generate-domain-names, fiche produit en
   brouillon, rien publié sans mon accord).
3. J Plan 30 jours, jour par jour la première semaine, budget total détaillé.
4. Vérificateur de cohérence (code + agent) : chaque chiffre de chaque fichier comparé à facts.json.
5. Critique d'exhaustivité : checklist A à K, relance l'agent fautif.
Livrable : livrables/04-kit-complet.md, qui commence par une page de décision : le produit, pourquoi lui, les 3
chiffres du test qui le prouvent, le budget de scale, les conditions d'arrêt, les 3 actions de demain matin.

=====================================================================
RÉFÉRENTIEL
=====================================================================
Unit economics (tout en HT, formules visibles dans l'xlsx) :
  Prix HT = Prix TTC / 1,2 (si assujetti ; en franchise, le prix encaissé est le prix TTC mais la TVA payée sur
  les achats et sur la pub n'est pas récupérable)
  Coût livré = coût produit + transport + droits et frais de douane (inclure le droit forfaitaire UE sur les colis
  de moins de 150 € s'il s'applique à la date du jour : vérifie la règle et cite la source) + emballage
  Contribution = Prix HT − coût livré − frais de paiement − remboursements/défauts (% du CA) − applis par commande
  S = CPA seuil = contribution · ROAS seuil = Prix TTC / S · CPA cible = 0,7 × S
  Ajouter : TVA sur la dépense pub (autoliquidée, non récupérable en franchise) et frais de localisation Meta en
  France (vérifier le taux en vigueur, avec source).
Repères Meta France hors Q4 (heuristique opérateur, à recalibrer après ~1 000 € dépensés) :
  CPM 7-14 € · CTR lien ≥ 1 % · CPC lien ≤ 1 € · hook rate ≥ 25 % · hold rate ≥ 15 % · ajout au panier ≥ 7 % des
  sessions · conversion 1,8-2,5 % · paiement initié → achat ≥ 45 % · LCP < 2,5 s · 6 applis maximum sur la page.
Repères TikTok France (heuristique opérateur) : CPM 5-10 € · vues 2 s ≥ 35 % · vues 6 s ≥ 15 % · CTR ≥ 0,8 % ·
  conversion souvent 20 à 40 % sous Meta.
Calendrier : on est début octobre. Deux options seulement, choisis et justifie :
  (a) produit à angle cadeau, stock UE (livraison ≤ 4 jours), test bouclé avant le 10-15 novembre, date limite de
      commande pour Noël affichée ;
  (b) produit non saisonnier, préparation maintenant, test lancé après le 5 janvier quand le CPM baisse.
  Fenêtre restante = durée estimée de la tendance − délai d'approvisionnement UE.

=====================================================================
FORMAT DE SORTIE
=====================================================================
livrables/00-outils.md          préflight, plafond de débit, budget d'appels consommé
livrables/01-candidats.csv      tous les candidats et leurs preuves (schéma ci-dessus, une ligne par preuve)
livrables/02-top10.md           tableau noté, taux de cases mesurées, éliminations motivées
livrables/03-finalistes.md      gate 1
livrables/test/…                gate 2
livrables/unit-economics.xlsx   gates 2 et 3
livrables/pilotage.xlsx         gate 2
livrables/04-kit-complet.md     gate 3
livrables/preuves/              extraits bruts et captures
livrables/raw/                  JSON des agents, budget.json, facts.json
Français, phrases courtes, aucun jargon creux. Un commit par fin de phase, fait par l'orchestrateur.
```
