"""Reconstruit les candidats P1 (gate 1) à partir du journal du workflow.
Même logique que le script du workflow : fusion des preuves par groupe canonique,
exclusions en code, familles de signaux positifs, validité (2 familles ou plus)."""
import csv, json, re, sys, unicodedata
from pathlib import Path

JOURNAL = Path(sys.argv[1])
OUT = Path('/home/user/safwen/livrables')

def norm(s):
    s = unicodedata.normalize('NFD', str(s or '').lower())
    return ''.join(ch for ch in s if unicodedata.category(ch) != 'Mn')

EXCL = [
    ('deja_rejete:kimono', r'\bkimono'),
    ('deja_rejete:soie', r'(taie|oreiller|foulard|bandana|carre|scarf|pillow ?case)[^|]{0,25}(soie|silk)|(soie|silk)[^|]{0,15}(taie|oreiller|foulard|bandana|scarf|pillow)'),
    ('deja_rejete:panama', r'panama'),
    ('deja_rejete:aiguiseur', r'(rolling|roller|rouleau)[^|]{0,25}(sharpen|aiguis)|aiguiseur a rouleau'),
    ('deja_rejete:ramadan', r'ramadan'),
    ('deja_rejete:bakhoor', r'bakh?oo?r|bukhoor|bakhour'),
    ('deja_rejete:tapis_priere', r'tapis de priere|prayer (rug|mat)'),
    ('deja_rejete:cachemire', r'cachemire|cashmere'),
    ('deja_rejete:liege', r'\bliege\b|\bcork\b'),
    ('deja_rejete:vanille', r'vanill'),
    ('deja_rejete:parfum', r'parfum|perfume|fragrance|eau de toilette'),
    ('deja_rejete:gants_cuir', r'gants? en cuir|leather gloves?'),
    ('deja_rejete:echarpe', r'(echarpe|scarf|scarves)[^|]{0,25}(alpaga|alpaca|mohair|yak)|(alpaga|alpaca|mohair|yak)[^|]{0,25}(echarpe|scarf|scarves)'),
    ('deja_rejete:chaussons_feutre', r'chaussons? en feutre|felt slippers?'),
    ('deja_rejete:collier_perles', r'collier de perles?|pearl necklace'),
    ('deja_rejete:peignoir', r'peignoir|bathrobe|robe de chambre'),
    ('deja_rejete:masque_sommeil', r'masque (de sommeil|de nuit|pour dormir)|sleep(ing)? mask|eye mask'),
    ('sature:posture', r'correcteur de posture|posture corrector'),
    ('sature:led', r'ruban led|bande led|led strip|strip lights?'),
    ('sature:projecteur', r'projector|projecteur'),
    ('sature:brosse_lissante', r'brosse (lissante|chauffante)|straighten(ing|er) brush|hair straightener'),
    ('sature:massage_gun', r'pistolet de massage|massage gun|percussion massager'),
    ('sature:gourde_motivation', r'gourde[^|]{0,20}motiv|motivational (water )?bottle'),
    ('categorie_exclue:cosmetique', r'\bserum\b|moisturi[sz]er|skincare|skin care|maquillage|makeup|cosmeti|shampo|lotion|creme (visage|corps|hydratante)'),
    ('categorie_exclue:complement', r'supplement|complement alimentaire|vitamin|gumm(y|ies)|collagen|protein powder'),
    ('categorie_exclue:bebe', r'\b(baby|bebe|infant|nourrisson|newborn|toddler)\b'),
    ('us_specific', r'pick ?up truck|truck bed|tailgate|110 ?v\b|thanksgiving|4th of july'),
]

def code_exclusion(g):
    text = norm(' | '.join([g.get('name_en', ''), g.get('name_fr', ''), g.get('keyword_en', ''), g.get('aliexpress_name', '')] + list(g.get('keywords_fr') or [])))
    for rule, pat in EXCL:
        if re.search(pat, text):
            return rule
    if re.search(r'(\bhuiles?\b|\boils?\b)', text) and not re.search(r'(spray|pulveris|vaporis|dispens|distribut|filtr|pump|pompe|bottle|bouteille|flacon|skimmer|separat)', text):
        return 'deja_rejete:huiles'
    return None

def is_positive(e):
    return (e.get('status') == 'MESURÉ' and e.get('scrape_status') == 'ok' and e.get('metric') != 'absent'
            and not (isinstance(e.get('value'), (int, float)) and e.get('value') == 0))

def load(journal):
    labels, results = {}, {}
    for line in journal.read_text().splitlines():
        d = json.loads(line)
        if d.get('type') == 'started':
            labels[d['key']] = d.get('label')
        elif d.get('type') == 'result':
            results[d['key']] = d.get('result')
    by_label = {}
    for k, r in results.items():
        if r is not None:
            by_label[labels.get(k, k)] = r
    return by_label

def main():
    R = load(JOURNAL)
    (OUT / 'raw/p1').mkdir(parents=True, exist_ok=True)
    for label, r in R.items():
        (OUT / f'raw/p1/{label}.json').write_text(json.dumps(r, ensure_ascii=False, indent=1))
    raws = {}
    for label, r in R.items():
        if isinstance(r, dict) and 'candidates' in r:
            for i, c in enumerate(r['candidates']):
                raws[f"{r['agent']}#{i}"] = dict(c, ref=f"{r['agent']}#{i}", agent=r['agent'])
    groups = {}
    for g in (R.get('canon') or {}).get('groups', []):
        groups[g['canonical_id']] = dict(g, members=list(g['members']))
    c2 = R.get('canon2')
    if c2:
        for ng in c2['new_groups']:
            groups.setdefault(ng['canonical_id'], dict(ng, members=[]))
        for a in c2['assignments']:
            if a['canonical_id'] in groups and a['ref'] in raws:
                groups[a['canonical_id']]['members'].append(a['ref'])
    extra = {}
    for label, r in R.items():
        if label.startswith('comp') and isinstance(r, dict):
            for x in r.get('results', []):
                if x['candidate_id'] in groups:
                    extra.setdefault(x['candidate_id'], []).extend(dict(e, _from=label) for e in x['evidence'])
    for gid, g in groups.items():
        ev = []
        for m in g['members']:
            for e in (raws.get(m) or {}).get('evidence', []):
                ev.append(dict(e, _from=m))
        ev += extra.get(gid, [])
        g['evidence'] = ev
        g['code_excluded'] = code_exclusion(g)
        g['families'] = sorted({e['family'] for e in ev if is_positive(e)})
        g['alive'] = not g.get('excluded_by') and not g['code_excluded']
        g['valid'] = g['alive'] and len(g['families']) >= 2
        prices = [raws[m]['us_price_usd'] for m in g['members'] if m in raws and isinstance(raws[m].get('us_price_usd'), (int, float))]
        g['us_price_usd'] = min(prices) if prices else None
    (OUT / 'raw/p1/groups.json').write_text(json.dumps(groups, ensure_ascii=False, indent=1))
    cols = ['candidate_id', 'name_fr', 'name_en', 'category', 'statut_candidat', 'familles', 'family', 'metric', 'value', 'unit', 'quote',
            'stable_id', 'url', 'observed_at', 'tool', 'query_used', 'method', 'status', 'scrape_status', 'contradiction', 'source']
    with open(OUT / '01-candidats.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        for gid, g in sorted(groups.items(), key=lambda kv: (not kv[1]['valid'], not kv[1]['alive'], kv[0])):
            st = 'VALIDE' if g['valid'] else ('1 famille' if g['alive'] else 'EXCLU:' + (g.get('excluded_by') or g['code_excluded']))
            for e in g['evidence'] or [{}]:
                w.writerow({'candidate_id': gid, 'name_fr': g['name_fr'], 'name_en': g['name_en'], 'category': g['category'],
                            'statut_candidat': st, 'familles': ''.join(g['families']),
                            **{k: e.get(k, '') for k in ['family', 'metric', 'value', 'unit', 'quote', 'stable_id', 'url', 'observed_at',
                                                         'tool', 'query_used', 'method', 'status', 'scrape_status']},
                            'contradiction': '', 'source': e.get('_from', '')})
    v = [g for g in groups.values() if g['valid']]
    print(f"groupes={len(groups)} valides={len(v)} un_seul={sum(1 for g in groups.values() if g['alive'] and not g['valid'])} exclus={sum(1 for g in groups.values() if not g['alive'])}")
    print('raws', len(raws), 'refs non classées', [r for r in raws if not any(r in g['members'] for g in groups.values())])

main()
