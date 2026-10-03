# Spécification MVP : « Hader » (حاضر, « présent »)

*Nom de travail, à vérifier : disponibilité du nom, de la marque au Qatar et du domaine. Rappels WhatsApp et liste d'attente pour cliniques privées au Qatar. Arabe et anglais.*

## 1. Persona et premiers clients

**Persona : Rania, 34 ans, responsable des opérations d'une clinique dentaire indépendante à Al Sadd.**
- La clinique compte 3 dentistes, 2 fauteuils et 2 réceptionnistes.
- Rania est expatriée et parle anglais et arabe.
- La veille de chaque journée, l'accueil appelle ou envoie un WhatsApp à la main à 20-25 patients depuis le téléphone de la clinique.
- Les patients qui ne viennent pas laissent des trous qu'on ne remplit pas : la liste d'attente vit dans un cahier.
- Rania achète seule tout outil sous 1 000 QAR par mois. Au-delà, il faut l'accord du propriétaire, souvent un médecin associé.

**Ce que coûte le problème aujourd'hui (ESTIMATION, méthode explicite)**
- Rendez-vous : 500 par mois.
- No-shows : 10 % est une hypothèse prudente pour le privé. Le PHCC public en perd 27 % (Al-Sharq, voir `pain-points.csv`, ligne 161). Cela fait 50 rendez-vous perdus.
- Ticket moyen supposé : 200 QAR. Les consultations de dermatologie esthétique démarrent à 80 QAR sur HeliumDoc (extrait). Perte : **10 000 QAR par mois**.
- Temps de l'accueil : 1 à 2 heures par jour de rappels, soit environ 20 % d'un poste. Le salaire moyen du secteur privé est de 7 789 QAR par mois (section 1 de l'étude pays), donc **environ 1 500 QAR par mois**.

**Premiers clients** : `cibles.csv` liste 30 cliniques réelles avec leur canal public (WhatsApp, téléphone, Instagram). Les 21 cliniques en priorité A sont indépendantes ou de taille moyenne : décision rapide.

## 2. Le MVP : 5 fonctionnalités, pas une de plus

1. **Import du planning**
   - Fichier CSV ou Excel exporté du logiciel de la clinique, ou saisie rapide.
   - Option : synchronisation d'un agenda Google.
   - Les champs : prénom, téléphone, date et heure, praticien, langue (ar/en).
   - **Aucun motif médical.**
2. **Rappels WhatsApp automatiques**
   - Envoi à J-1 (18 h) et à H-3, en arabe ou en anglais.
   - Modèles « utility » validés par Meta.
   - Trois boutons : *Je confirme* / *Je ne peux pas venir* / *Changer l'heure*.
3. **Liste d'attente qui remplit les trous**
   - Dès qu'un patient annule, le créneau est proposé aux patients en attente pour ce praticien.
   - Le premier qui répond « oui » le prend, et l'accueil est prévenu.
4. **Tableau de bord accueil**
   - Planning du jour avec statut (confirmé, annulé, sans réponse).
   - Liste « à appeler » : les sans-réponse à H-3.
   - Compteur mensuel : no-shows évités, créneaux remplis, QAR récupérés.
5. **Compte clinique et abonnement**
   - Création du compte, numéro WhatsApp de la clinique, modèles de messages.
   - Paiement par carte en QAR (Stripe) ; facture en arabe et en anglais.

**Exclu du MVP**
- Prise de rendez-vous en ligne par les patients : HeliumDoc et Tabeebak le font déjà.
- Intégration native avec un dossier médical.
- Paiement des consultations, téléconsultation.
- Chatbot IA libre. Les réponses hors boutons sont transférées à l'accueil.
- Application mobile : la clinique utilise le web, le patient utilise WhatsApp.
- SMS : prévu seulement en repli, en version 2.

## 3. Parcours utilisateur

**Clinique**
1. Inscription : e-mail, nom de la clinique, langue de l'interface.
2. Connexion du numéro WhatsApp Business via l'inscription intégrée (Embedded Signup) de Meta.
3. Choix des modèles AR/EN, puis import du planning de demain (CSV).
4. Hader envoie les rappels à 18 h. Le lendemain matin, le tableau de bord montre qui a confirmé, qui a annulé et quels créneaux ont été remplis par la liste d'attente.
5. Fin du mois : rapport « 14 no-shows évités = 2 800 QAR ». Le renouvellement se fait seul.

**Patient**
1. Reçoit : « مرحباً سارة، تذكير بموعدك غداً الساعة 10:30 مع د. أحمد في عيادة … » [Confirmer] [Annuler] [Changer].
2. Annule. Hader écrit au premier patient en liste d'attente : « Un créneau s'est libéré demain à 10:30. Le voulez-vous ? » [Oui] [Non].

## 4. Données nécessaires et conformité PDPPL

**Données stockées**
- Clinique : nom, adresse, praticiens, numéro WhatsApp.
- Patient : prénom, téléphone, langue, date et heure, praticien, statut.
- Pas de nom de famille obligatoire, pas de motif, pas de diagnostic.

**Rôles**
- La clinique est responsable du traitement. Hader est sous-traitant, avec un contrat de traitement (DPA) signé à l'inscription.

**Hébergement**
- **Google Cloud, région Doha (me-central1)**. La région existe (étude pays, section 5.2). Les données restent au Qatar, ce qui couvre les attentes des clients du secteur santé.

**Durée de conservation**
- Rendez-vous supprimés à J+30. Seules les statistiques agrégées sont gardées.

**Point juridique à faire valider**
- Un rendez-vous chez un dentiste révèle une information de santé, donc une « donnée de nature spéciale » (article 16 de la PDPPL, autorisation préalable).
- Question à poser à un avocat qatari avant la vente : l'autorisation détenue par la clinique couvre-t-elle son sous-traitant ? Budget prévu : 1 500 € (modèle financier, M2).

## 5. Architecture pour Claude Code

| Brique | Choix | Pourquoi |
|---|---|---|
| Application | **Next.js (App Router) + TypeScript**, `next-intl` pour l'arabe et l'anglais, `dir="rtl"` automatique | Un seul code pour l'interface et l'API ; RTL natif |
| Base de données | **PostgreSQL sur Cloud SQL, région me-central1 (Doha)**, ORM Drizzle | Données au Qatar ; Supabase n'a pas de région Qatar |
| Exécution | **Cloud Run (me-central1)** ; **Cloud Scheduler** toutes les 5 min pour les envois | Paiement à l'usage, rien à administrer |
| Messagerie | **WhatsApp Cloud API (Meta) en direct**, webhook pour les réponses à boutons | Pas d'intermédiaire, donc pas de marge de revendeur |
| Paiement | **Stripe Billing**, compte France, prix en QAR | Stripe n'ouvre pas de compte au Qatar, mais un compte français encaisse les cartes qataries Visa et Mastercard (étude pays, section 3) |
| Authentification | Lien magique par e-mail (Auth.js + Resend) | Pas de mot de passe à gérer |
| Import | CSV et Excel via `papaparse` / `xlsx`, avec assistant d'association des colonnes | Marche avec n'importe quel logiciel de clinique |

**API et tarifs officiels**
- **WhatsApp Cloud API** : facturation par message. Le Qatar est sorti de « Rest of Middle East » le 1er juillet 2026 et ses tarifs utility et authentication ont augmenté. Le montant exact est dans le CSV officiel de https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing (consulté le 03/10/2026).
- **Changement au 1er octobre 2026** : les messages utility envoyés pendant une fenêtre de service ouverte deviennent payants. Hypothèse du modèle : **0,02 $ par message, ESTIMATION**.
- **Stripe** : 3,25 % + 0,25 € par carte hors EEE, et 2 % de conversion si l'on facture en QAR (extraits).

**Coût mensuel de fonctionnement (ESTIMATION)**
- Cloud Run + Cloud SQL au plus petit palier : environ 90 €.
- Outils (abonnement Claude, domaine, e-mail) : environ 130 €.
- WhatsApp : environ 18 € par clinique et par mois (500 rendez-vous × 2 messages × 0,02 $).

## 6. Plan de construction : 6 semaines, découpé pour Claude Code

*La compétence `superpowers:writing-plans` n'est pas installée dans cette session. J'ai repris son format : tâches courtes, fichiers nommés, test d'abord, un commit par tâche. Chaque tâche se colle telle quelle dans Claude Code.*

**Semaine 1 : socle**
1. « Crée un projet Next.js 15 TypeScript nommé `hader` avec Tailwind, `next-intl` (ar, en), une mise en page qui bascule `dir="rtl"` en arabe, et un test Playwright qui vérifie `dir=rtl` sur `/ar`. »
2. « Ajoute Drizzle + PostgreSQL, avec les tables `clinics`, `practitioners`, `patients` (prénom, téléphone E.164, langue), `appointments` (statut : scheduled, confirmed, cancelled, no_reply, filled), `waitlist_entries` et `message_logs`. Écris les migrations et un script de seed. »
3. « Ajoute l'authentification par lien magique (Auth.js + Resend) et une page d'inscription de la clinique. »

**Semaine 2 : import du planning**

4. « Crée `/app/[locale]/import` : dépôt d'un CSV ou d'un XLSX, association des colonnes (prénom, téléphone, date, heure, praticien, langue), aperçu des 10 premières lignes, validation des téléphones qataris (+974, 8 chiffres) et création des rendez-vous. Ajoute des tests unitaires du parseur. »
5. « Ajoute une saisie rapide d'un rendez-vous et la vue "Planning du jour" avec les statuts. »

**Semaine 3 : WhatsApp**

6. « Intègre la WhatsApp Cloud API : un module `lib/whatsapp.ts` avec `sendTemplate(to, template, lang, params, buttons)`. Ajoute la route webhook `/api/whatsapp/webhook` (vérification du token, signature, traitement des boutons) et une table `message_logs`. Teste avec des payloads Meta enregistrés. »
7. « Écris les 4 modèles utility (rappel J-1, rappel H-3, offre de créneau, confirmation) en arabe et en anglais, dans un fichier `templates.ts` prêt à soumettre à Meta. »
8. « Crée le job `/api/cron/send-reminders` appelé par Cloud Scheduler : il sélectionne les rendez-vous à J-1 18 h et à H-3 et envoie les messages, sans doublon (clé d'idempotence). »

**Semaine 4 : liste d'attente et tableau de bord**

9. « À l'annulation d'un rendez-vous, propose le créneau aux patients de la liste d'attente du même praticien, un par un, avec 15 minutes pour répondre. Le premier "oui" prend le créneau. Tests sur les cas de course. »
10. « Crée le tableau de bord : compteurs du mois (confirmés, annulés, no-shows évités, créneaux remplis, QAR récupérés = créneaux remplis × ticket moyen paramétrable) et liste "à appeler". »

**Semaine 5 : paiement et conformité**

11. « Intègre Stripe Billing : 3 prix en QAR (399, 799, 1 490 par mois), essai gratuit de 30 jours sans carte, portail client, webhook de statut. La facture affiche l'arabe et l'anglais. »
12. « Ajoute les pages légales AR/EN : CGU, politique de confidentialité PDPPL, DPA à accepter à l'inscription. Ajoute un job de purge qui supprime les rendez-vous de plus de 30 jours. »

**Semaine 6 : mise en production et pilotes**

13. « Écris le Dockerfile, le déploiement Cloud Run en me-central1, Cloud SQL en me-central1, les secrets dans Secret Manager et Cloud Scheduler toutes les 5 min. Ajoute un script `deploy.sh`. »
14. « Ajoute Sentry et une page `/status`, puis un test de bout en bout : import, rappel simulé, annulation, créneau rempli. »
15. Démarrage de 3 cliniques pilotes à partir de la liste `cibles.csv`.

## 7. Prix en QAR

| Palier | Prix mensuel | Pour qui | Contenu |
|---|---|---|---|
| Solo | **399 QAR** | 1 praticien | rappels J-1 et H-3, jusqu'à 400 rendez-vous par mois |
| Clinique | **799 QAR** | 2 à 6 praticiens | + liste d'attente, tableau de bord, 1 500 rendez-vous |
| Groupe | **1 490 QAR** | plusieurs sites | + multi-numéros, rapport mensuel par site, 4 000 rendez-vous |

- **Annuel** : 2 mois offerts, payable par virement.
- **Comparaison** :
  - temps de l'accueil passé aux rappels : environ 1 500 QAR par mois (ESTIMATION ci-dessus) ;
  - rendez-vous perdus : environ 10 000 QAR par mois ;
  - le palier Clinique se rembourse avec 4 créneaux remplis par mois au ticket de 200 QAR.
- **Ce que facturent les plateformes de réservation** (HeliumDoc, Tabeebak) : non publié, introuvable. C'est à demander en appelant comme clinique prospect.

## 8. Go-to-market depuis Paris

**Canaux, dans l'ordre**
1. WhatsApp direct aux 21 cliniques de priorité A de `cibles.csv`, avec une vidéo de démo de 40 secondes en arabe et en anglais.
2. Instagram : les cliniques y publient leurs offres, on commente et on envoie un message privé.
3. LinkedIn : les responsables d'opérations des polycliniques.
4. Web Summit Qatar, du 31 janvier au 3 février 2027 au DECC : rencontres sur place avec les pilotes et le dossier Startup Qatar.

**Offre d'entrée.** Pilote gratuit de 30 jours. On ne demande rien d'autre que le CSV du planning de demain.

**Script WhatsApp en anglais**
> Hello, I'm Safwen. I built a small tool for clinics in Doha: it sends your patients a WhatsApp reminder the day before, in Arabic or English, with "Confirm / Cancel / Reschedule" buttons, and offers cancelled slots to your waiting list automatically. Clinics usually lose 1 in 10 appointments to no-shows. Can I set it up free for 30 days on your clinic's number? It takes 15 minutes, you only send me tomorrow's schedule. Here is a 40-second demo: [lien]

**Script WhatsApp en arabe**
> مرحباً، أنا صفوان. طوّرت أداة بسيطة للعيادات في الدوحة: ترسل لمرضاكم تذكيراً على واتساب قبل الموعد بيوم، بالعربية أو الإنجليزية، مع أزرار «تأكيد / إلغاء / تغيير الموعد»، وتعرض المواعيد الملغاة تلقائياً على قائمة الانتظار. هل تسمحون لي بتفعيلها مجاناً لمدة 30 يوماً على رقم العيادة؟ الإعداد يستغرق 15 دقيقة، ويكفي أن ترسلوا لي جدول مواعيد الغد. هذا فيديو قصير للتوضيح: [lien]

**Partenaires à approcher**
- Revendeurs de logiciels de clinique locaux.
- Agences marketing santé à Doha, qui gèrent l'Instagram des cliniques.
- Programme Startup Qatar, une fois le MVP en ligne.
