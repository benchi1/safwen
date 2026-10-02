"""Génère scoring.xlsx (longlist, shortlist notée, méthode) avec formules visibles."""
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

BASE = "/home/user/safwen/recherche-produit"
HEAD = Font(bold=True, color="FFFFFF")
FILL = PatternFill("solid", fgColor="1F3A5F")
INPUT = PatternFill("solid", fgColor="FFF2CC")
WRAP = Alignment(wrap_text=True, vertical="top")


def style_header(ws, row=1):
    for c in ws[row]:
        c.font, c.fill, c.alignment = HEAD, FILL, WRAP


# --- Longlist -------------------------------------------------------------
ll = pd.read_csv(f"{BASE}/data/longlist.csv", sep=";", dtype=str).fillna("")
wb = Workbook()
ws = wb.active
ws.title = "Longlist"
cols = ["id", "produit", "pays", "part_production_mondiale", "justification",
        "prix_usine_eur", "prix_detail_FR_TTC", "poids_kg", "moq_typique",
        "c1_marge", "c2_panier", "c3_cout_rendu", "c4_colis", "c5_regime",
        "c6_moq", "c7_marche", "verdict", "motif", "source_part",
        "source_prix_usine", "source_prix_detail"]
ws.append(cols)
for _, r in ll.iterrows():
    ws.append([r[c] for c in cols])
style_header(ws)
for i, w in enumerate([6, 34, 16, 26, 44, 22, 22, 10, 18] + [14] * 7 + [10, 36, 40, 40, 40], 1):
    ws.column_dimensions[get_column_letter(i)].width = w
ws.freeze_panes = "C2"
ws.auto_filter.ref = ws.dimensions

# --- Shortlist ------------------------------------------------------------
# (id, produit, pays, prix usine €, coef coût rendu, prix TTC visé,
#  demande /25, marge /25, concurrence /20, import /15, rachat /15, justification)
SL = [
    ("A01", "Taie d'oreiller soie de mûrier 25 momme", "Chine", 13.20, 1.45, 79,
     20, 17, 9, 12, 13,
     "Demande : seul mot-clé de la shortlist avec volume réel et pic de Noël en hausse (56→87, +55 % en 4 ans, Google Trends). "
     "Concurrence : ~410 pubs Meta actives, Amazon inondé à 15-27 € (Ravmix 19 759 avis) → CAC élevé. Import : NC 6302 39 90, 12 % (TARIC). Prix usine 15 $ FOB (Xinlan/Zhigeng, data/fournisseurs_taie.csv) ; KO au critère 3 sous 76 € TTC. "
     "Rachat : cadeau Noël + extensions (masque, chouchous)."),
    ("D05", "Chapeau Panama toquilla tissé main", "Équateur", 22.00, 1.25, 139,
     14, 19, 16, 12, 6,
     "Demande : moyenne 12 (échelle lot 1), pics juin-juillet 33-43, stable/légère baisse. Concurrence : 2 pubs Meta actives (1 annonceur). "
     "Import : NC 6504 00 00, 0 % (droit tiers 0 % + préférence Équateur, TARIC). Saison courte, rachat faible."),
    ("B01", "Kimono coton imprimé au bloc (Jaipur)", "Inde", 7.50, 1.35, 79,
     12, 20, 13, 12, 9,
     "Demande : « kimono femme » moyenne 40 mais requête générique en baisse (~-40 % sur 5 ans). Concurrence : ~31 pubs Meta. "
     "Import : NC 6208 91 00 19, 12 % tiers / 9,6 % SPG Inde (TARIC). Marge très élevée (coût rendu ~13 % du TTC)."),
    ("B02", "Gants cuir d'agneau doublés", "Pakistan", 7.31, 1.25, 79,
     6, 20, 11, 12, 9,
     "Demande : libellé exact très faible (moy. 1) ; saison nov.-déc. Concurrence : ~140 pubs (surtout moto/chasse). SPG+ Pakistan."),
    ("C02", "Écharpe mohair tissée", "Afrique du Sud", 11.20, 1.25, 89,
     4, 18, 14, 13, 9,
     "Demande quasi nulle sur « écharpe mohair » ; pubs « mohair » = laine à tricoter. 0 % (accord UE-SADC). Prix usine = ESTIMATION."),
    ("C11", "Peignoir nid d'abeille coton égyptien", "Égypte", 7.00, 1.30, 69,
     8, 17, 9, 13, 10,
     "Demande faible (moy. 2) ; ~330 pubs Meta dont grandes enseignes (La Compagnie du Blanc). 0 % (accord UE-Égypte). Fondateur arabophone."),
    ("A04", "Écharpe duvet de yak", "Chine", 21.75, 1.35, 135,
     2, 18, 15, 12, 9,
     "Demande non mesurable ; aucun annonceur yak en France (niche vide = pas de demande prouvée). 12 %."),
    ("D01", "Écharpe baby alpaga", "Pérou", 15.41, 1.25, 89.90,
     5, 16, 12, 13, 9,
     "Demande « écharpe alpaga » moy. 1 ; pubs « alpaga » = surtout fil. 0 % (accord UE-Pérou)."),
    ("B07", "Chaussons feutre de laine", "Kirghizistan", 10.32, 1.30, 65,
     7, 16, 12, 10, 9,
     "Demande faible ; ~62 pubs (glerups, Shepherd of Sweden). Chaussures : étiquetage directive 94/11/CE. SPG+."),
    ("A10", "Collier perle d'eau douce argent 925", "Chine", 12.44, 1.35, 86,
     6, 18, 3, 9, 12,
     "Marché saturé : ~3 500 pubs Meta actives « perles d'eau douce ». Poinçonnage argent + REACH nickel/cadmium."),
]

ws2 = wb.create_sheet("Shortlist")
hdr = ["id", "produit", "pays", "prix_usine_EUR", "coef_cout_rendu", "cout_rendu_EUR",
       "prix_TTC", "prix_HT", "marge_brute_%", "cout_rendu_%_TTC", "C1 ≥65 %", "C3 ≤25 %",
       "Demande /25", "Marge /25", "Concurrence /20", "Import /15", "Rachat /15",
       "TOTAL /100", "Rang", "Justification (sources : data/*.md)"]
ws2.append(hdr)
for i, p in enumerate(SL, start=2):
    pid, name, pays, usine, coef, ttc, d, m, c, imp, r, just = p
    ws2.append([pid, name, pays, usine, coef, f"=D{i}*E{i}", ttc, f"=G{i}/1.2",
                f"=(H{i}-F{i})/H{i}", f"=F{i}/G{i}",
                f'=IF(I{i}>=0.65,"OK","KO")', f'=IF(J{i}<=0.25,"OK","KO")',
                d, m, c, imp, r, f"=SUM(M{i}:Q{i})", f"=RANK(R{i},$R$2:$R${len(SL)+1})", just])
    for col in (4, 5, 7, 13, 14, 15, 16, 17):
        ws2.cell(row=i, column=col).fill = INPUT
    ws2.cell(row=i, column=9).number_format = "0%"
    ws2.cell(row=i, column=10).number_format = "0%"
    ws2.cell(row=i, column=6).number_format = "0.00"
    ws2.cell(row=i, column=8).number_format = "0.00"
    ws2.cell(row=i, column=20).alignment = WRAP
style_header(ws2)
for i, w in enumerate([6, 36, 14, 12, 10, 11, 9, 9, 10, 10, 8, 8, 9, 9, 11, 9, 9, 10, 6, 90], 1):
    ws2.column_dimensions[get_column_letter(i)].width = w
ws2.freeze_panes = "C2"

# --- Méthode --------------------------------------------------------------
ws3 = wb.create_sheet("Méthode")
rows = [
    ["Élément", "Règle"],
    ["Coût rendu", "Prix usine × coefficient (fret + droits + transitaire + assurance). Coefficient 1,25 si droit 0 %, 1,30-1,35 si droit 12 %. Détail exact par produit dans unit-economics.xlsx."],
    ["Prix HT", "Prix TTC / 1,2 (TVA 20 %)."],
    ["Demande /25", "Google Trends France 5 ans (connecteur Firecrawl, 2026-10-02) : volume relatif sur échelle commune + tendance + régularité. Voir data/trends_notes.md."],
    ["Marge /25", "Marge brute et marge de manœuvre pour absorber un CAC Meta/Google de 15-30 € (prix élevé et coût rendu bas = note haute)."],
    ["Concurrence /20", "Nombre de pubs Meta actives France (bibliothèque publicitaire), présence d'acteurs dominants, ancre de prix Amazon.fr. Voir data/concurrence_notes.md."],
    ["Import /15", "Droit de douane TARIC, règles d'origine, réglementation produit (textile 1007/2011, chaussures 94/11/CE, bijoux/poinçon)."],
    ["Rachat /15", "Potentiel cadeau, rachat/extension de gamme, étalement saisonnier."],
    ["Cases jaunes", "Hypothèses modifiables ; les colonnes calculées et le total se mettent à jour."],
]
for r in rows:
    ws3.append(r)
style_header(ws3)
ws3.column_dimensions["A"].width = 18
ws3.column_dimensions["B"].width = 120

wb.save(f"{BASE}/scoring.xlsx")
print("scoring.xlsx écrit")
