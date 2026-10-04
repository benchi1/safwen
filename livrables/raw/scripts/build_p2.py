"""Gate 1 · P2/P3 : ajoute les mesures de l'entonnoir France à 01-candidats.csv (une ligne par preuve)
et sauvegarde les sorties d'agents dans raw/p2/. Usage : build_p2.py <journal.jsonl> <workflow.output>"""
import csv, json, sys
from pathlib import Path

JOURNAL, OUTPUT = Path(sys.argv[1]), Path(sys.argv[2])
L = Path('/home/user/safwen/livrables')
TODAY = '2026-10-04'

def load_journal(p):
    labels, res = {}, {}
    for line in p.read_text().splitlines():
        d = json.loads(line)
        if d.get('type') == 'started': labels[d['key']] = d.get('label')
        elif d.get('type') == 'result' and d.get('result') is not None: res[d['key']] = d['result']
    return {labels.get(k, k): v for k, v in res.items()}

R = load_journal(JOURNAL)
s = OUTPUT.read_text(); OUT = json.loads(s[s.find('{'):])
W = OUT['result']
(L / 'raw/p2').mkdir(parents=True, exist_ok=True)
for label, r in R.items():
    (L / f'raw/p2/{label}.json').write_text(json.dumps(r, ensure_ascii=False, indent=1))
(L / 'raw/p2/resultat_workflow.json').write_text(json.dumps(W, ensure_ascii=False, indent=1))
(L / 'raw/p2/logs.json').write_text(json.dumps(OUT.get('logs', []), ensure_ascii=False, indent=1))

rows = []
def ev(cid, fam, metric, value, unit, quote, stable_id, url, tool, query, method, status, ss, src):
    rows.append({'candidate_id': cid, 'family': fam, 'metric': metric, 'value': '' if value is None else value, 'unit': unit,
                 'quote': (quote or '')[:300], 'stable_id': stable_id or 'n/a', 'url': url or '', 'observed_at': TODAY, 'tool': tool,
                 'query_used': query or url or '', 'method': method, 'status': status, 'scrape_status': ss, 'source': src})

for label, r in R.items():
    if label.startswith('comp3'):
        for x in r['results']:
            for e in x['evidence']:
                ev(x['candidate_id'], e['family'], e['metric'], e['value'], e['unit'], e['quote'], e['stable_id'], e['url'], e['tool'], e['query_used'], e['method'], e['status'], e['scrape_status'], label)
    if label.startswith('e1-'):
        for x in r['results']:
            for sr in x['searches']:
                ev(x['candidate_id'], 'O', 'meta_fr_results', sr['results_n'], 'résultats', sr['results_text'], 'n/a', sr['url'], 'firecrawl_scrape', sr['query'] + ' [' + sr['search_type'] + ']', 'freeform', 'MESURÉ' if sr['scrape_status'] == 'ok' else 'INVALIDE', sr['scrape_status'], label)
            ev(x['candidate_id'], 'O', 'meta_fr_advertisers_distinct', x['advertisers_distinct'], 'annonceurs (cartes vues' + (', lot partiel' if x['partial_lot'] else '') + ')',
               ' | '.join(f"{a['name']} {a['started']} ID {a['library_id']} {a['domain']}" for a in x['advertisers'][:6]), 'n/a', x['best_url'], 'firecrawl_scrape', x['best_query'], 'freeform', 'ESTIMATION' if x['status'] == 'MESURÉ' else x['status'], 'ok' if x['status'] == 'MESURÉ' else 'error', label)
            for a in x['advertisers']:
                ev(x['candidate_id'], 'O', 'meta_fr_ad', a['days'], 'jours', f"{a['name']} — Started running on {a['started']} — Library ID {a['library_id']} — {a['domain']}", a['library_id'], x['best_url'], 'firecrawl_scrape', x['best_query'], 'freeform', 'MESURÉ', 'ok', label)
    if label.startswith('e2-'):
        for x in r['results']:
            a, z, t = x['aliexpress'], x['amazon_fr'], x['temu']
            ev(x['candidate_id'], 'O', 'aliexpress_min_price_eur', a['min_price_eur'], '€' + ('' if a['identical'] else ' (non identique)'), a['price_quote'], 'n/a', a['url'], 'firecrawl_scrape', a['url'], 'freeform', 'MESURÉ' if a['scrape_status'] == 'ok' and a['min_price_eur'] is not None else ('INVALIDE' if a['scrape_status'] != 'ok' else 'NON MESURÉ'), a['scrape_status'], label)
            ev(x['candidate_id'], 'D', 'aliexpress_sold', a['max_sold_n'], 'vendus', a['sold_quote'], 'n/a', a['url'], 'firecrawl_scrape', a['url'], 'freeform', 'MESURÉ' if a['max_sold_n'] is not None else 'NON MESURÉ', a['scrape_status'], label)
            ev(x['candidate_id'], 'D', 'amazon_fr_price_eur', z['price_eur'], '€' + (' (identique)' if z['identical'] else ' (proche)') + (' promo Prime' if z['prime_badge'] else ''), z['price_quote'], z['asin'], z['url'], 'firecrawl_scrape', z['url'], 'freeform', 'MESURÉ' if z['price_eur'] is not None else 'NON MESURÉ', z['scrape_status'], label)
            ev(x['candidate_id'], 'D', 'amazon_fr_ratings', z['ratings_n'], 'avis', z['ratings_quote'], z['asin'], z['url'], 'firecrawl_scrape', z['url'], 'freeform', 'MESURÉ' if z['ratings_n'] is not None else 'NON MESURÉ', z['scrape_status'], label)
            ev(x['candidate_id'], 'D', 'amazon_fr_bought_past_month', z['bought_n'], 'achats/mois (badge)', z['bought_quote'], z['asin'], z['url'], 'firecrawl_scrape', z['url'], 'freeform', 'MESURÉ' if z['bought_n'] is not None else 'NON MESURÉ', z['scrape_status'], label)
            ev(x['candidate_id'], 'O', 'temu_price_eur', t['price_eur'], '€' + (' (fiche trouvée)' if t['found'] else ' (non trouvé)'), t['quote'], 'n/a', t['url'], 'firecrawl_search', 'temu.com', 'search_snippet', 'MESURÉ' if t['price_eur'] is not None else 'NON MESURÉ', t['scrape_status'], label)
            ev(x['candidate_id'], '-', 'target_price_eur', x['target_price_eur'], '€ TTC visé', x['target_rationale'], 'n/a', '', 'agent', '', 'freeform', 'ESTIMATION', 'ok', label)
            ev(x['candidate_id'], '-', 'differentiation', x['differentiation_cost_eur'], '€/unité', x['differentiation'], 'n/a', '', 'agent', '', 'freeform', 'ESTIMATION', 'ok', label)
    if label == 'e3-trends':
        for x in r['results']:
            for se in x['series']:
                vals = se['values']
                ev(x['candidate_id'], 'D', 'trends_fr_12m', round(sum(vals) / len(vals), 2) if vals else None, f"moyenne indice ({len(vals)} points, {x['first_date']} → {x['last_date']})",
                   ', '.join(str(v) for v in vals[-10:]), 'n/a', 'https://trends.google.com/trends/explore?geo=FR&q=' + se['keyword'].replace(' ', '%20'), 'firecrawl_scrape alexandria', se['keyword'], 'alexandria', x['status'], 'ok' if x['status'] == 'MESURÉ' else 'error', label)
    if label.startswith('e4-'):
        cid = r['candidate_id']
        m = r['meta_us']; ev(cid, 'O', 'meta_us_exact_advertisers', m['advertisers_distinct'], f"annonceurs ({m['results_text']}), plus ancienne {m['oldest_days']} j", m['oldest_quote'], 'n/a', m['url'], 'firecrawl_scrape', m['url'], 'freeform', m['status'], m['scrape_status'], label)
        i = r['meta_fr_inactive']; ev(cid, 'O', 'meta_fr_inactive_advertisers', i['advertisers_past_distinct'], f"annonceurs passés ({i['results_text']})", i['note'], 'n/a', i['url'], 'firecrawl_scrape', i['url'], 'freeform', i['status'], i['scrape_status'], label)
        a = r['amazon_us']; ev(cid, 'D', 'amazon_us_rating', a['rating'], f"/5 ({a['ratings_n']} avis ; 1★ {a['star_pct_1']} % 2★ {a['star_pct_2']} % 3★ {a['star_pct_3']} %)", (a['customers_say'] or '')[:200], a['asin'], a['url'], 'firecrawl_scrape', a['url'], 'freeform', a['status'], a['scrape_status'], label)
        for t in a['critical_excerpts'][:3]: ev(cid, 'S', 'amazon_us_critical_review', None, 'extrait', t, a['asin'], a['url'], 'firecrawl_scrape', a['url'], 'freeform', a['status'], a['scrape_status'], label)
        c = r['cj']; ev(cid, '-', 'cj_price_usd', c['price_usd'], '$ ' + ('(connexion requise)' if c['login_required'] else '') + ' entrepôts : ' + ', '.join(c['warehouses']), c['price_quote'], 'n/a', c['url'], 'firecrawl_scrape', c['url'], 'freeform', c['status'], c['scrape_status'], label)
        f = r['fr_competitor']; ev(cid, 'O', 'fr_competitor_price_eur', f['price_eur'], f"€ ({f['domain']}) offres : {f['offers']} ; avis : {f['reviews_shown']} ; panier actif : {f['cart_active']}", f['price_quote'], 'n/a', f['url'], 'firecrawl_scrape', f['url'], 'freeform', f['status'], f['scrape_status'], label)
        p = r['patents']; ev(cid, '-', 'patents_risk', None, p['risk'], ' | '.join(f"{x['number']} {x['title']}" for x in p['results'][:3]) + ' — ' + p['note'], 'n/a', 'https://patents.google.com', 'firecrawl_search', p['query'], 'search_snippet', 'ESTIMATION', 'ok', label)
        k = r['tiktok_fr']; ev(cid, 'S', 'tiktok_fr_videos', k['fr_videos'], 'vidéos FR (vues max ' + str(k['max_views_n']) + ')', ' | '.join(k['urls'][:3]), 'n/a', '', 'firecrawl_search', k['query'], 'search_snippet', k['status'], 'ok' if k['status'] == 'MESURÉ' else 'error', label)
        q = r['seasonality']; ev(cid, 'D', 'trends_fr_5y', round(sum(q['values']) / len(q['values']), 2) if q['values'] else None, f"moyenne indice 5 ans ({len(q['values'])} points, {q['first_date']} → {q['last_date']})", ', '.join(str(v) for v in q['values'][-8:]), 'n/a', '', 'firecrawl_scrape alexandria', q['keyword'], 'alexandria', q['status'], 'ok' if q['status'] == 'MESURÉ' else 'error', label)
        for vb in r['verbatims']: ev(cid, 'S', 'verbatim_client', None, 'verbatim', vb['text'], 'n/a', vb['url'], 'firecrawl', vb['url'], 'freeform', 'MESURÉ', 'ok', label)

# fusion avec le CSV P1
P1 = [r for r in csv.DictReader(open(L / '01-candidats.csv', encoding='utf-8')) if r.get('phase', 'P1') in ('P1', '', None)]
for r in P1: r['statut_candidat'] = r['statut_candidat'].split(' → ')[0]
names = {r['candidate_id']: (r['name_fr'], r['name_en'], r['category']) for r in P1}
cands = json.load(open(L / 'raw/p2/candidats_p2.json'))
for cid, c in cands.items(): names.setdefault(cid, (c['name_fr'], c['name_en'], c['category']))
status = {r['id']: ('ÉLIMINÉ : ' + r['eliminated']) if r['eliminated'] else f"P2 étage {r['stage']} · score {r['score']}" for r in W['rows']}
cols = ['evidence_id', 'phase', 'candidate_id', 'name_fr', 'name_en', 'category', 'statut_candidat', 'familles', 'family', 'metric', 'value', 'unit', 'quote',
        'stable_id', 'url', 'observed_at', 'tool', 'query_used', 'method', 'status', 'scrape_status', 'contradiction', 'source']
out = []
for r in P1:
    st = r['statut_candidat']
    if r['candidate_id'] in status: st = st + ' → ' + status[r['candidate_id']]
    out.append(dict({k: r.get(k, '') for k in cols}, phase='P1', statut_candidat=st))
for r in rows:
    n = names.get(r['candidate_id'], ('', '', ''))
    out.append(dict(r, phase='P2', name_fr=n[0], name_en=n[1], category=n[2], statut_candidat=status.get(r['candidate_id'], ''), familles='', contradiction=''))
for i, r in enumerate(out, 1): r['evidence_id'] = f'E{i:04d}'
with open(L / '01-candidats.csv', 'w', newline='', encoding='utf-8') as f:
    w = csv.DictWriter(f, fieldnames=cols); w.writeheader(); w.writerows(out)
print('lignes P1', len(P1), 'lignes P2', len(rows), 'total', len(out))
