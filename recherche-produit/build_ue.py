"""Génère unit-economics.xlsx : un modèle par produit (taie, Panama, kimono) + trésorerie.
Toutes les hypothèses sont en cellules jaunes modifiables ; les résultats sont des formules."""
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

BASE = "/home/user/safwen/recherche-produit"
INPUT = PatternFill("solid", fgColor="FFF2CC")
OUT = PatternFill("solid", fgColor="DDEBF7")
H = Font(bold=True, size=12)
B = Font(bold=True)

# (libellé, valeur, unité, source/méthode) — l'ordre fixe les lignes utilisées par les formules
PRODUCTS = {
    "Taie soie": dict(
        titre="Taie d'oreiller 100 % soie de mûrier 25 momme (Chine) — vendue 89 € TTC",
        fob=(15.0, "Xinlan (Shaoxing) 25 momme 14-15 $ dès 100 pcs ; Zhigeng 15-18 $ (data/fournisseurs_taie.csv)"),
        qty=(200, "2 coloris × 100 (MOQ Zhigeng 100 / Xinlan 100)"),
        poids=(0.30, "ESTIMATION : taie 25 momme ~0,15 kg + boîte cadeau, poids taxable"),
        fret=(7.0, "ESTIMATION fret aérien consolidé Chine→CDG 5-8 €/kg, à faire coter (transitaire)"),
        droit=(0.12, "TARIC 6302 39 90, droit tiers 12 % (consulté 2026-10-02)"),
        transit=(180, "ESTIMATION forfait transitaire + déclaration en douane par lot (devis à obtenir)"),
        tests=(250, "ESTIMATION rapport REACH azoïques/CMR par coloris, amorti sur le lot"),
        pack=(2.50, "ESTIMATION boîte rigide + papier de soie + carte, 1,5-3 € à 200 pcs"),
        prix=(89.0, "Positionnement 25 momme ; cœur DTC FR 55-72 €, luxe 93-125 € (data/p3_taie.md)"),
        livraison=(4.50, "Mondial Relay pro ≤1 kg (data/couts_notes.md)"),
        retour=(0.03, "ESTIMATION : produit literie, retours faibles"),
        cac=(15, 25, 35),
    ),
    "Panama": dict(
        titre="Chapeau Panama toquilla grade 3-4 (Équateur) — vendu 139 € TTC",
        fob=(27.99, "Ecuadorian Crafts grade 3-4 avec logo, MOQ 12 (data/fournisseurs_panama.csv)"),
        qty=(36, "3 modèles × 12 (MOQ 12)"),
        poids=(1.0, "ESTIMATION poids volumétrique par chapeau en carton gigogne (à coter)"),
        fret=(8.0, "ESTIMATION fret aérien Guayaquil/Quito→CDG, à faire coter"),
        droit=(0.0, "TARIC 6504 00 00 : droit tiers 0 %, préférence Équateur 0 %"),
        transit=(180, "ESTIMATION forfait transitaire + déclaration"),
        tests=(0, "Pas de test chimique obligatoire identifié (paille végétale)"),
        pack=(4.0, "ESTIMATION boîte à chapeau rigide 3-5 €"),
        prix=(139.0, "Traclet 65-190 €, MonChapeauPanama 79-139 €, Borsalino 230-270 € (data/p3_panama.md)"),
        livraison=(6.50, "ESTIMATION colis volumineux (boîte à chapeau) en point relais/Colissimo"),
        retour=(0.08, "ESTIMATION : tailles de tour de tête"),
        cac=(20, 35, 50),
    ),
    "Kimono": dict(
        titre="Kimono long coton imprimé au bloc (Jaipur, Inde) — vendu 85 € TTC — PRODUIT RECOMMANDÉ",
        fob=(6.5, "IndiaMART Jaipur ₹450-650 = 5,1-7,4 $ (Meera, Om Shiva, Bhavya) ; Moharis sur devis (data/fournisseurs_kimono.csv)"),
        qty=(120, "3 motifs × 40 (Moharis MOQ 20/motif)"),
        poids=(0.40, "ESTIMATION kimono voile coton ~0,35 kg + emballage"),
        fret=(6.0, "ESTIMATION fret aérien Jaipur/Delhi→CDG, à faire coter"),
        droit=(0.096, "TARIC 6208 91 00 19 : 12 % tiers, SPG Inde 9,6 % (exportateur REX)"),
        transit=(180, "ESTIMATION forfait transitaire + déclaration"),
        tests=(200, "ESTIMATION test azoïques EN ISO 14362-1 par lot"),
        pack=(1.50, "ESTIMATION pochette coton + étiquette"),
        prix=(85.0, "Jamini 75-100 €, Bëllemme 49 €, Cyrillus 25-50 € (data/p3_kimono.md)"),
        livraison=(4.50, "Mondial Relay pro ≤1 kg"),
        retour=(0.08, "ESTIMATION : habillement, coupe ample"),
        cac=(15, 25, 40),
    ),
}

wb = Workbook()
wb.remove(wb.active)

ws = wb.create_sheet("Hypothèses communes")
common = [
    ("Taux de change", 0.8807, "€ par USD", "BCE 30/09/2026 : 1 € = 1,1355 USD"),
    ("TVA France", 0.20, "", "Taux normal"),
    ("Shopify Payments %", 0.015, "", "Cartes UE, https://www.shopify.com/fr/tarifs"),
    ("Shopify Payments fixe", 0.25, "€ / transaction", "idem"),
    ("Assurance fret", 0.005, "% de la valeur", "ESTIMATION usage transitaires"),
    ("Coût d'un retour (port retour)", 5.0, "€", "ESTIMATION étiquette retour Mondial Relay"),
    ("Perte sur produit retourné", 0.20, "% du coût rendu", "ESTIMATION article non revendable neuf"),
    ("Abonnement Shopify", 36, "€ / mois", "Shopify Basic mensuel"),
]
ws.append(["Paramètre", "Valeur", "Unité", "Source / méthode"])
for r in common:
    ws.append(list(r))
for row in ws.iter_rows(min_row=2, max_row=len(common) + 1, min_col=2, max_col=2):
    row[0].fill = INPUT
for c in ws[1]:
    c.font = B
ws.column_dimensions["A"].width = 32
ws.column_dimensions["C"].width = 18
ws.column_dimensions["D"].width = 70
C = "'Hypothèses communes'!"
FX, TVA, SP, SF, ASS, RET, PERTE = (f"{C}$B${i}" for i in range(2, 9))

for name, p in PRODUCTS.items():
    s = wb.create_sheet(name)
    s.column_dimensions["A"].width = 44
    s.column_dimensions["B"].width = 14
    s.column_dimensions["C"].width = 14
    s.column_dimensions["D"].width = 14
    s.column_dimensions["E"].width = 80
    s["A1"] = p["titre"]
    s["A1"].font = H
    s.append([])
    s.append(["HYPOTHÈSES (cases jaunes modifiables)", "Valeur", "", "", "Source / méthode"])
    s["A3"].font = B
    rows = [
        ("Prix FOB unitaire (USD)", "fob"), ("Quantité commandée (unités)", "qty"),
        ("Poids taxable par unité (kg)", "poids"), ("Fret aérien (€/kg)", "fret"),
        ("Droit de douane", "droit"), ("Transitaire + dédouanement (€/lot)", "transit"),
        ("Tests / conformité (€/lot)", "tests"), ("Packaging de marque (€/unité)", "pack"),
        ("Prix de vente TTC (€)", "prix"), ("Livraison client payée par la marque (€ HT)", "livraison"),
        ("Taux de retour", "retour"),
    ]
    ref = {}
    for label, key in rows:
        v, src = p[key]
        s.append([label, v, "", "", src])
        r = s.max_row
        ref[key] = f"$B${r}"
        s.cell(row=r, column=2).fill = INPUT
        if key in ("droit", "retour"):
            s.cell(row=r, column=2).number_format = "0.0%"

    s.append([])
    s.append(["COÛT RENDU FRANCE", "Total lot (€)", "Par unité (€)"])
    s.cell(row=s.max_row, column=1).font = B
    q = ref["qty"]

    def line(label, total_formula, fmt="0.00"):
        s.append([label, total_formula, f"=B{s.max_row + 1}/{q}"])
        r = s.max_row
        for col in (2, 3):
            s.cell(row=r, column=col).number_format = fmt
        return r

    r_fob = line("Marchandise (FOB × change × quantité)", f"={ref['fob']}*{FX}*{q}")
    r_fret = line("Fret aérien", f"={ref['poids']}*{ref['fret']}*{q}")
    r_ass = line("Assurance", f"=(B{r_fob}+B{r_fret})*{ASS}")
    r_cif = line("Valeur en douane (CIF)", f"=B{r_fob}+B{r_fret}+B{r_ass}")
    r_dd = line("Droits de douane", f"=B{r_cif}*{ref['droit']}")
    r_tr = line("Transitaire + dédouanement", f"={ref['transit']}")
    r_te = line("Tests / conformité", f"={ref['tests']}")
    r_pk = line("Packaging de marque", f"={ref['pack']}*{q}")
    r_cr = line("COÛT RENDU (hors TVA import, récupérable)", f"=B{r_cif}+B{r_dd}+B{r_tr}+B{r_te}+B{r_pk}")
    s.cell(row=r_cr, column=1).font = B
    s.cell(row=r_cr, column=3).fill = OUT
    r_tvai = line("TVA import à avancer (récupérée ensuite)", f"=(B{r_cif}+B{r_dd})*{TVA}")

    s.append([])
    s.append(["UNIT ECONOMICS PAR COMMANDE (1 unité)", "€"])
    s.cell(row=s.max_row, column=1).font = B

    def kv(label, formula, fmt="0.00", out=False):
        s.append([label, formula])
        r = s.max_row
        s.cell(row=r, column=2).number_format = fmt
        if out:
            s.cell(row=r, column=2).fill = OUT
            s.cell(row=r, column=1).font = B
        return r

    r_ttc = kv("Prix TTC", f"={ref['prix']}")
    r_ht = kv("Prix HT", f"=B{r_ttc}/(1+{TVA})")
    r_cu = kv("Coût rendu unitaire", f"=C{r_cr}")
    r_mb = kv("Marge brute (€)", f"=B{r_ht}-B{r_cu}")
    r_mbp = kv("Marge brute % du HT (critère ≥ 65 %)", f"=B{r_mb}/B{r_ht}", "0.0%", True)
    r_c3 = kv("Coût rendu % du TTC (critère ≤ 25 %)", f"=B{r_cu}/B{r_ttc}", "0.0%", True)
    r_fee = kv("Frais de paiement Shopify", f"=B{r_ttc}*{SP}+{SF}")
    r_liv = kv("Livraison client", f"={ref['livraison']}")
    r_ret = kv("Coût des retours (par commande)", f"={ref['retour']}*({RET}+{PERTE}*B{r_cu}+B{r_liv})")
    r_cbp = kv("CONTRIBUTION AVANT PUB (€)", f"=B{r_mb}-B{r_fee}-B{r_liv}-B{r_ret}", out=True)
    r_cbpp = kv("Contribution avant pub % du HT", f"=B{r_cbp}/B{r_ht}", "0.0%")
    r_seuil = kv("CAC SEUIL (point mort par commande, €)", f"=B{r_cbp}", out=True)
    kv("ROAS seuil (CA TTC / dépense pub)", f"=B{r_ttc}/B{r_seuil}", "0.00")

    s.append([])
    s.append(["SCÉNARIOS DE COÛT D'ACQUISITION", "CAC (€)", "Contribution après pub (€)", "% du HT"])
    s.cell(row=s.max_row, column=1).font = B
    for lab, cac in zip(("Optimiste", "Central", "Pessimiste"), p["cac"]):
        s.append([lab, cac, None, None,
                  "ESTIMATION : CAC Meta/Google DTC accessoires premium France ; à remplacer par le CAC mesuré au test"])
        r = s.max_row
        s.cell(row=r, column=2).fill = INPUT
        s.cell(row=r, column=3).value = f"=B{r_cbp}-B{r}"
        s.cell(row=r, column=4).value = f"=C{r}/B{r_ht}"
        s.cell(row=r, column=3).number_format = "0.00"
        s.cell(row=r, column=4).number_format = "0.0%"
    s.append([])
    s.append(["Lecture : si la contribution après pub est négative au CAC central, ne pas lancer sans 2e article "
              "dans le panier (bundle) ou prix plus élevé."])
    p["refs"] = dict(cr_total=f"'{name}'!B{r_cr}", tvai=f"'{name}'!B{r_tvai}")

# --- Trésorerie (produit recommandé) -------------------------------------
t = wb.create_sheet("Trésorerie kimono")
t.column_dimensions["A"].width = 52
t.column_dimensions["B"].width = 14
t.column_dimensions["C"].width = 70
t["A1"] = "Besoin de trésorerie — lancement kimono (90 jours)"
t["A1"].font = H
tr = PRODUCTS["Kimono"]["refs"]
items = [
    ("Stock + import (coût rendu du 1er lot)", f"={tr['cr_total']}", "Feuille « Kimono »"),
    ("TVA import avancée (récupérée sous 1-3 mois)", f"={tr['tvai']}", "Feuille « Kimono »"),
    ("Échantillons 5 fournisseurs (~15 $ pièce + DHL Inde)", 200, "ESTIMATION"),
    ("Test pré-commande (pub + page)", 750, "Budget test 500-1 000 € (rapport §Phase 4)"),
    ("Création société (micro/SASU) + immatriculation", 300, "ESTIMATION frais annonce légale + greffe"),
    ("Shopify 3 mois + thème + applis", 250, "36 €/mois × 3 + thème/app"),
    ("Marque : nom, logo, dépôt INPI 1 classe", 450, "INPI 190 € (1 classe) + recherche d antériorité 50 € (legalplace.fr/guides/prix-depot-marque-inpi, 2026) + identité visuelle faite par le fondateur ~210 €"),
    ("Shooting / contenu (fait par le fondateur)", 150, "Accessoires, fonds"),
    ("Pub de lancement J45-J90", 2500, "ESTIMATION ~100 commandes × CAC central 25 €"),
    ("Réassort 2e lot (2 motifs gagnants × 40)", 1100, "ESTIMATION 80 × coût rendu ~13,6 € ; seulement si critères du test atteints"),
    ("Adhésion Refashion + Triman", 50, "ESTIMATION petite structure"),
    ("Réserve imprévus (10 %)", None, "10 % du total ci-dessus"),
]
t.append([])
t.append(["Poste", "€", "Source / méthode"])
for c in t[3]:
    c.font = B
start = t.max_row + 1
for lab, v, src in items:
    t.append([lab, v, src])
    if isinstance(v, (int, float)):
        t.cell(row=t.max_row, column=2).fill = INPUT
end = t.max_row
t.cell(row=end, column=2).value = f"=0.1*SUM(B{start}:B{end-1})"
t.append(["TOTAL BESOIN DE TRÉSORERIE", f"=SUM(B{start}:B{end})"])
t.cell(row=t.max_row, column=1).font = B
t.cell(row=t.max_row, column=2).fill = OUT
for r in range(start, t.max_row + 1):
    t.cell(row=r, column=2).number_format = "#,##0"

wb.save(f"{BASE}/unit-economics.xlsx")
print("unit-economics.xlsx écrit")
