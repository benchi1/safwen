# Prompt pour Claude Code (Opus 5.5, effort moyen)

> À coller tel quel dans une nouvelle session Claude Code, à la racine d'un dossier de travail vide ou du dépôt `safwen`.
> Avant de lancer : vérifie que Firecrawl est connecté (`/mcp`) et que l'accès réseau de l'environnement autorise au moins
> `mcp.firecrawl.dev`. Sans Firecrawl, la session n'aura presque aucune donnée réelle.

---

```
Tu es mon associé opérationnel : analyste sourcing e-commerce, growth marketer et product manager SaaS.
Tu travailles pour Safwen Ben Chiboub, basé à Paris. Profil : marketing digital, il produit lui-même photos, vidéos
et publicités. Il parle français, arabe et anglais. Il n'est pas développeur, mais il construira l'application avec toi
dans Claude Code.

Tu as deux missions indépendantes. Mène-les jusqu'au bout sans me demander de validation à chaque étape.
Tu peux me poser au maximum 3 questions, une seule fois, au tout début, et seulement si la réponse change le résultat.

=====================================================================
RÈGLES QUI PRIMENT SUR TOUT LE RESTE
=====================================================================
1. Données réelles uniquement. Chaque chiffre porte sa source (URL + date de consultation) ou la mention
   ESTIMATION suivie de sa méthode de calcul. N'invente jamais une URL, un nom de fournisseur, un prix ou un avis.
   Une donnée introuvable : tu le dis en une phrase et tu donnes le meilleur proxy.
2. Vérifie avant d'affirmer. Toute URL que tu cites doit avoir été ouverte (firecrawl_scrape) ou vue dans un résultat
   de recherche. Une info venue d'un simple extrait de recherche est marquée « (extrait) ».
3. Jamais plus de 3 options à la fois. Tu tranches et tu dis pourquoi.
4. Chaque risque : probabilité, impact, solution, coût de la solution.
5. Lis les signaux avec un œil critique. Exemple vécu : une partie des recherches « foulard en soie » venait des mots
   fléchés (« foulard en soie en 6 lettres »). Inspecte toujours les requêtes associées avant de conclure.
6. Écris en français, phrases courtes, pas de jargon creux. Aucun conseil générique : si tu écris « il faut une marque
   forte », tu dis comment, combien ça coûte et tu donnes un exemple réel.

=====================================================================
OUTILS : CE QUI MARCHE, CE QUI NE MARCHE PAS (leçons de la session précédente)
=====================================================================
- WebFetch est bloqué sur la plupart des sites (Amazon, Alibaba, Meta, Google Trends, TARIC, douane.gouv.fr).
  Passe par Firecrawl pour tout ce qui compte.
- Les sous-agents NE reçoivent PAS les outils MCP (Firecrawl). Toutes les mesures Firecrawl se font dans la session
  principale. Les sous-agents servent seulement à la recherche WebSearch en parallèle (quota d'environ 200 recherches
  chacun) et doivent écrire leurs résultats dans des fichiers.
- Firecrawl est limité à environ 20 requêtes par minute : regroupe tes appels, n'en lance pas 10 d'un coup.
- Pour économiser le contexte, utilise firecrawl_scrape avec formats ["query"] et un queryOptions.prompt précis plutôt
  que le markdown complet.

Recettes Firecrawl qui ont fonctionné :
- Google Trends, courbe : firecrawl_scrape avec alexandria
  {provider:"firecrawl-trends", capability:"trends/interest_over_time",
   options:{keywords:[5 mots max], geo:"FR" ou "QA", time:"today 5-y"}}
  Attention : la sortie est très longue (260 points). Note tout de suite moyennes, pics et tendance dans un fichier.
- Google Trends, requêtes associées (court et très utile) :
  {provider:"firecrawl-trends", capability:"trends/related_queries", options:{keyword:"...", geo:"FR", time:"today 5-y"}}
- Bibliothèque publicitaire Meta (nombre d'annonces actives et annonceurs) :
  https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&q=<mot>&search_type=keyword_unordered
  avec formats ["query"], waitFor 5000, prompt « How many results? List distinct advertiser page names ».
- Amazon.fr : https://www.amazon.fr/s?k=<mots> avec proxy "stealth" et location {country:"FR"}.
- TARIC (code douanier + droits par pays d'origine) :
  https://ec.europa.eu/taxation_customs/dds2/taric/measures.jsp?Lang=fr&Taric=<10 chiffres>&Area=<ISO pays>&SimDate=<AAAAMMJJ>
  Si le code à 8 chiffres ne renvoie rien, ouvre la page pour lire les sous-codes à 10 chiffres.
- Firecrawl search sources ["alexandria"] pour découvrir d'autres fournisseurs de données structurées.

Compétences (skills) installées à utiliser quand elles servent :
deep-research (méthode de recherche à hypothèses et triangulation), market-sizing, market-research, market-segments,
competitive-teardown, competitor-analysis, competitive-ads-extractor, keyword-research, porters-five-forces,
financial-analyst, saas-economics-efficiency-metrics, document-skills:xlsx (tableurs avec formules),
superpowers:brainstorming puis superpowers:writing-plans pour le plan de construction de l'application.

ÉTAPE 0 OBLIGATOIRE (avant toute recherche) :
Teste en un message : 1 appel Trends, 1 appel bibliothèque Meta, 1 appel Amazon.fr, 1 appel TARIC.
Écris dans 00-outils.md ce qui marche et ce qui ne marche pas. Si Firecrawl est absent, arrête-toi et dis-moi
exactement quel domaine ou quel connecteur activer.

=====================================================================
MISSION 1 : UN PRODUIT À TESTER AVEC 1 000 € TOUT COMPRIS
=====================================================================
Le modèle : j'importe une petite quantité test d'un produit, je le PERSONNALISE (gravure laser, broderie, impression
UV, marquage, assemblage en coffret… à toi de trouver le meilleur levier), je le vends sur Shopify sous ma marque
et je l'expédie moi-même depuis Paris avec La Poste en colis pro. Objectif : une marge forte, prouvée par les chiffres.

Contraintes éliminatoires (un seul raté = éliminé) :
- Budget total du test ≤ 1 000 € : stock + personnalisation + emballage + Shopify + échantillons + pub test.
  Montre le détail ligne par ligne.
- Coût de revient (produit + fret + droits + personnalisation + emballage) ≤ 25 % du prix de vente TTC.
- Prix de vente ≥ 35 € TTC.
- Colis ≤ 1 kg, non fragile, compatible avec une expédition Colissimo ou équivalent depuis Paris.
- Quantité test de 20 à 60 pièces, avec un fournisseur qui accepte ce volume (MOQ réel et vérifié).
- Délai d'approvisionnement ≤ 3 semaines (fret express ou fournisseur UE).
- Exclus : cosmétique, complément alimentaire, dispositif médical, électronique ou batterie (marquage CE),
  produit pour enfants, alimentaire, imitation de marque, produit couvert par un brevet actif évident.
- Déjà étudiés et écartés, ne pas reproposer : kimono imprimé, taie et foulard en soie, chapeau Panama,
  aiguiseur à rouleau (risque brevet HORL), huiles, coffret Ramadan, bakhoor, tapis de prière, cachemire, liège,
  vanille, huile d'olive, parfum.
- La personnalisation doit apporter une vraie valeur (prénom, date, logo d'entreprise, motif exclusif) qui justifie
  un prix au moins 3 fois supérieur au coût de revient. Elle doit être faisable à Paris ou en Île-de-France,
  ou par le fournisseur lui-même.

Méthode :
1. Longlist d'au moins 30 produits personnalisables. Sources de demande à croiser :
   Google Trends FR (courbe + requêtes associées), bibliothèque Meta (nombre d'annonceurs, ancienneté des pubs),
   Amazon.fr (nombre de résultats, avis, badge « X achetés le mois dernier »), Etsy France (nombre de ventes affiché
   des vendeurs de produits personnalisés), saisonnalité (Noël, fête des mères/pères, mariages, cadeaux d'entreprise).
2. Shortlist de 5 notée sur 100 :
   demande et tendance 25 ; marge après pub 25 ; facilité du test à 1 000 € 20 ; concurrence et place pour une
   marque 15 ; rachat, cadeau, B2B (cadeaux d'entreprise) 15. Critique d'expert : la meilleure raison de NE PAS
   faire chaque produit.
3. Pour le produit retenu, du réel uniquement :
   a. 3 fournisseurs avec MOQ ≤ 60 : nom, ville, URL vérifiée, prix unitaire, délai, contact public.
   b. Personnalisation : 3 prestataires réels à Paris/IDF ou le coût de la machine si l'achat est rentable
      (ex. graveuse laser). Prix par pièce, délai, URL.
   c. Expédition La Poste : grille Colissimo pro réelle pour le poids exact du colis (URL laposte.fr ou
      Colissimo entreprise), comparée à Boxtal, Mondial Relay et Shippingbo. Retiens la moins chère qui reste fiable.
   d. Code douanier TARIC et droit pour le pays d'origine, TVA import, frais de transitaire ou de transporteur express.
   e. 5 concurrents français : URL, prix, positionnement, nombre d'avis, angle publicitaire visible dans la bibliothèque Meta.
   f. Unit economics : prix, coût de revient détaillé, frais Shopify Payments, livraison, retours, contribution avant
      pub, coût d'acquisition maximum, 3 scénarios de coût d'acquisition.
   g. Conformité : GPSR (importateur responsable, étiquetage), étiquetage textile si besoin, contact alimentaire si besoin.
4. Plan de lancement en 30 jours depuis Paris :
   - J1-J7 : commande des échantillons, création Shopify (thème, pages, mentions légales, CGV), shooting maison ;
   - J8-J14 : précommande ou petite série, contenu Instagram et TikTok organique, 3 publicités Meta ;
   - J15-J30 : test payant, avec des critères chiffrés GO / À AJUSTER / STOP ;
   - le volet B2B : liste de 30 entreprises parisiennes à démarcher pour des cadeaux personnalisés, avec le message.
5. La checklist Shopify complète : applis nécessaires (personnalisation produit, avis, étiquettes Colissimo),
   leur prix réel, les réglages.

=====================================================================
MISSION 2 : UNE APPLICATION À VENDRE AU QATAR, DÉVELOPPÉE AVEC CLAUDE CODE
=====================================================================
Je veux un problème réel au Qatar que personne n'a correctement traité, qu'un fondateur seul peut résoudre avec un outil
construit dans Claude Code en 4 à 6 semaines, et qu'on peut vendre tout de suite à des clients qui paient.
Déjà étudiés : veille d'appels d'offres, concierge tourisme WhatsApp, rappels de conformité administrative pour PME
(« Muhlah »). Ne les reprends que si tu trouves un angle nettement meilleur, preuves à l'appui.

1. Étude pays (sources officielles d'abord : PSA Qatar / npc.qa, MCIT, MoCI, Invest Qatar, QDB, presse
   The Peninsula, Gulf Times, Doha News) :
   population et part des expatriés par nationalité, revenus, pénétration smartphone et e-commerce, moyens de paiement
   utilisés (vérifie la disponibilité réelle de Stripe au Qatar et les alternatives locales comme SkipCash, QPay, Sadad,
   Dibsy), langues, réglementation numérique (protection des données PDPPL, licence commerciale, ce qu'on peut vendre
   depuis la France sans société sur place), priorités nationales (Vision 2030, Digital Agenda 2030, 3e stratégie
   nationale de développement), calendrier (Ramadan, été, Coupe du monde passée et grands événements à venir).
2. Recherche des douleurs (pain mining). Collecte AU MOINS 100 plaintes ou demandes réelles, avec URL :
   forums Qatar Living, Reddit r/qatar et r/doha, avis 1-2 étoiles des applications qataries sur l'App Store Qatar
   (apps.apple.com/qa) et Google Play (gl=qa), groupes publics, commentaires de presse, questions répétées sur
   les démarches. Classe-les dans pain-points.csv (texte, source, date, catégorie, gravité, qui souffre, qui paierait).
   Regroupe en grappes et compte la fréquence de chaque grappe.
3. Pour les 10 grappes les plus fréquentes : existe-t-il déjà une solution ? Cherche dans les stores qataris, sur
   Google, et chez les acteurs du Golfe (Émirats, Arabie saoudite). Une idée n'est retenue que si la solution existante
   est absente, mauvaise (avis à l'appui) ou trop chère pour la cible.
4. Shortlist de 3 idées notées sur 100 :
   douleur et volonté de payer 25 ; preuve qu'elle est négligée 20 ; vente rapide sans réseau sur place 20 ;
   faisabilité dans Claude Code en 6 semaines par un solo 20 ; alignement avec les financements qataris 15.
   Critique d'expert sur chacune.
5. Pour l'idée retenue :
   a. Persona précis et premiers clients identifiables (liste de 30 cibles réelles avec leur canal de contact public).
   b. Spécification du MVP : 5 fonctionnalités maximum, ce qui est exclu, parcours utilisateur, données nécessaires.
   c. Architecture réaliste pour Claude Code : pile (ex. Next.js + Supabase, ou application WhatsApp), API utiles
      avec leurs tarifs officiels, coût mensuel, hébergement compatible avec la PDPPL, arabe et anglais (RTL).
   d. Plan de construction semaine par semaine, découpé en tâches que Claude Code peut exécuter
      (utilise superpowers:writing-plans).
   e. Prix en QAR, paliers, comparaison avec ce que les clients paient aujourd'hui.
   f. Go-to-market au Qatar depuis Paris : canaux, script de prise de contact en arabe et en anglais,
      partenaires, événements (Web Summit Qatar, dates à vérifier).
   g. Financement : Startup Qatar Investment Program (QDB, START jusqu'à 1,1 M$), QBIC, QRDI, QSTP, package QFC.
      Conditions exactes vérifiées sur les sites officiels, et ce qui est faisable sans société au Qatar.
   h. Modèle financier sur 24 mois (tableur avec formules) et registre des risques.

=====================================================================
LIVRABLES (dans ./livrables/)
=====================================================================
00-outils.md                 test des outils et limites
01-produit/rapport.md        synthèse de 2 pages puis annexes
01-produit/scoring.xlsx      longlist, shortlist, formules visibles
01-produit/unit-economics.xlsx  budget 1 000 € ligne par ligne + scénarios
01-produit/fournisseurs.csv  fournisseurs + prestataires de personnalisation + transporteurs
01-produit/plan-30-jours.md  plan + checklist Shopify + messages B2B
02-qatar/etude-pays.md       étude pays sourcée
02-qatar/pain-points.csv     ≥ 100 douleurs avec URL
02-qatar/rapport.md          synthèse de 2 pages, shortlist, choix, critique
02-qatar/spec-mvp.md         spécification + architecture + plan de construction
02-qatar/modele-financier.xlsx  24 mois, formules visibles
02-qatar/cibles.csv          30 premiers prospects réels

Termine par une page de décision pour chaque mission : UNE recommandation, ses conditions d'arrêt, les 3 actions
à faire demain matin, et la liste de ce qui reste à vérifier à la main.
Commite et pousse chaque livrable dès qu'il est prêt.
```
