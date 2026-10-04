"""Gate 1 : génère 02-top10.md et les données des finalistes (raw/p2/finalistes_data.json)
à partir de la sortie du workflow P2-P4 et du journal. Usage : build_report.py <journal> <workflow.output>"""
import csv, json, sys
from pathlib import Path
L = Path('/home/user/safwen/livrables')
def load_journal(p):
    labels, res = {}, {}
    for line in Path(p).read_text().splitlines():
        d = json.loads(line)
        if d.get('type') == 'started': labels[d['key']] = d.get('label')
        elif d.get('type') == 'result' and d.get('result') is not None: res[d['key']] = d['result']
    return {labels.get(k, k): v for k, v in res.items()}
R = load_journal(sys.argv[1])
s = Path(sys.argv[2]).read_text(); OUT = json.loads(s[s.find('{'):]); W = OUT['result']
C = json.load(open(L / 'raw/p2/candidats_p2.json'))
E1 = {x['candidate_id']: x for k, v in R.items() if k.startswith('e1-') for x in v['results']}
E2 = {x['candidate_id']: x for k, v in R.items() if k.startswith('e2-') for x in v['results']}
E4 = {v['candidate_id']: v for k, v in R.items() if k.startswith('e4-')}
ev = list(csv.DictReader(open(L / '01-candidats.csv', encoding='utf-8')))
def eid(cid, metric):
    for r in ev:
        if r['candidate_id'] == cid and r['metric'] == metric and r['status'] in ('MESURÉ', 'ESTIMATION') and r['value'] not in ('', 'None'):
            return r['evidence_id']
    return '—'
def fmt(x, nd=2):
    if x is None or x == '': return '—'
    if isinstance(x, float): return f"{x:.{nd}f}".replace('.', ',')
    return str(x)
rows = W['rows']
ranked = [r for r in rows if not r['eliminated']]
elim = [r for r in rows if r['eliminated']]
verdict = W.get('verdict', {})
lines = []
lines.append('# 02 · Top 10 noté, éliminations et red team (gate 1)\n')
lines.append(f"Relevé du 2026-10-04. Score sur 100 calculé en code à partir des mesures (barème du prompt). Détail : D = demande /30, F = fenêtre France /20, É = économie /20, C = facilité créative /20 (2 juges), L = logistique et conformité /10.\n")
lines.append('## Classement (candidats non éliminés)\n')
lines.append('| # | Produit | Score | D | F | É | C | L | Annonceurs FR | Prix visé | Prix plancher public | Contribution HT | ROAS seuil | Cases mesurées | Étage | P4 |')
lines.append('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
for i, r in enumerate(ranked[:10], 1):
    e = r['econ'] if isinstance(r['econ'], dict) else {}
    d = r['detail']; v = verdict.get(r['id'])
    p4 = ('SURVIT' if v['survive'] else 'TUÉ') + f" ({v['pass']}/3 PASS{', KILL juridique' if v['legalKill'] else ''}{', vérif. ' + str(v['fact_fails']) + ' écart(s)' if v['fact_checks'] else ''})" if v else '—'
    lines.append(f"| {i} | {r['fr']} | **{r['score']}** | {d['demande']} | {d['fenetre']} | {d['economie']} | {d['creatif']} | {d['logistique']} | {fmt(r['fr_advertisers'])} ({r['fr_results'] or '?'}) | {fmt(e.get('P'))} € | {fmt(e.get('minPub'))} € | {fmt(e.get('S'))} € | {fmt(e.get('roas'))} | {fmt(r['measured_pct'])} % | {r['stage']} | {p4} |")
    if r['caps']: lines.append(f"|  | ↳ plafond : {' ; '.join(r['caps'])} |" + ' |' * 14)
lines.append('\n## Éliminés pendant l\'entonnoir\n')
for r in elim:
    lines.append(f"- **{r['fr']}** (`{r['id']}`) : {r['eliminated']}")
for x in W.get('eliminated_before_stage2', []):
    lines.append(f"- `{x['id']}` : {x['why']}")
lines.append('\n## Red team et vérification (P4)\n')
for cid, v in verdict.items():
    lines.append(f"### {C.get(cid, {}).get('name_fr', cid)} — {'SURVIT' if v['survive'] else 'TUÉ'}")
    for vt in v['votes']:
        if vt.get('vote') == 'NON RENDU': lines.append(f"- {vt['who']} : vote non rendu"); continue
        evs = ' ; '.join(f"[{x['url'][:80]}] « {x['quote'][:140]} »" for x in vt.get('evidence', [])[:2])
        lines.append(f"- **{vt['who']}** : {vt['vote']} ({vt.get('severity')}, échec {vt.get('failure_probability')}) — {vt.get('motive')} Parade : {vt.get('parade')} ({fmt(vt.get('parade_cost_eur'))} €). Preuves : {evs or 'aucune'}")
    lines.append(f"- Vérificateur de faits : {v['fact_checks']} contrôles, {v['fact_fails']} écart(s) hors tolérance.")
(L / '02-top10.md').write_text('\n'.join(lines) + '\n')
fin = {cid: {'cand': C.get(cid), 'row': next((r for r in rows if r['id'] == cid), None), 'e1': E1.get(cid), 'e2': E2.get(cid), 'e4': E4.get(cid), 'verdict': verdict.get(cid),
             'evidence_ids': {m: eid(cid, m) for m in ['meta_fr_results', 'meta_fr_advertisers_distinct', 'aliexpress_min_price_eur', 'temu_price_eur', 'amazon_fr_price_eur', 'amazon_fr_ratings', 'amazon_fr_bought_past_month', 'amazon_us_rating', 'cj_price_usd', 'fr_competitor_price_eur', 'trends_fr_12m', 'trends_fr_5y', 'tiktok_fr_videos', 'meta_us_exact_advertisers', 'meta_fr_inactive_advertisers', 'amazon_us_ratings', 'amazon_us_bought_past_month', 'meta_us_ad', 'amazon_us_rank']}}
       for cid in (W.get('finalists') or []) + [c for c in (W.get('top5b') or []) if c not in (W.get('finalists') or [])]}
(L / 'raw/p2/finalistes_data.json').write_text(json.dumps(fin, ensure_ascii=False, indent=1))
print('finalistes', W.get('finalists'), 'top5b', W.get('top5b'))
