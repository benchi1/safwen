(function(){
const $ = s => document.querySelector(s);
const ROS = document.querySelector('.hero .ros') ? document.querySelector('.hero .ros').innerHTML : '';
const BASE_TITLE = "Naqaa Ihram · Ihram 100 % coton d'Égypte pour la Omra et le Hajj";
const BASE_DESC = "Ihram homme, enfant et telekung en pur coton d'Égypte : doux, respirant, sans frottement. Livraison offerte en 3 jours ou express 24 h. Guides Omra.";
const fmtDate = d => new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric'});

/* ---------- SEO : titre, description, données structurées ---------- */
function setMeta(title, desc, ld){
  document.title = title;
  let m = document.querySelector('meta[name="description"]');
  if(!m){ m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
  m.content = desc;
  let s = document.getElementById('ld');
  if(!s){ s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(ld);
}
const ORG = {"@type":"Organization","name":"Naqaa Ihram","url":"https://naqaaihram.com"};
const HOME_LD = {"@context":"https://schema.org","@graph":[ORG,
  {"@type":"Product","name":"Naqaa Ihram","description":"Ihram homme 2 pièces en coton d'Égypte, ceinture, pochette et carte de la talbiya.","brand":{"@type":"Brand","name":"Naqaa"},
   "offers":{"@type":"Offer","price":"39.90","priceCurrency":"EUR","availability":"https://schema.org/InStock","shippingDetails":{"@type":"OfferShippingDetails","shippingRate":{"@type":"MonetaryAmount","value":"0","currency":"EUR"}}}}]};

/* ---------- cartes d'articles ---------- */
const card = a => `<a class="jcard" href="#j-${a.slug}">
  <div class="jcover"><span class="ar" lang="ar">${a.ar}</span></div>
  <div class="b"><span class="c">${a.cat}</span><h3>${a.title}</h3><p>${a.meta.split('. ')[0]}.</p><span class="m">${a.min} min de lecture</span></div></a>`;
$('#jteaser').innerHTML = ARTICLES.slice(0, 3).map(card).join('');

let filter = 'Tous';
function renderJournal(){
  const cats = ['Tous', ...new Set(ARTICLES.map(a => a.cat))];
  const list = ARTICLES.filter(a => filter === 'Tous' || a.cat === filter);
  $('#v-journal').innerHTML = `
  <header class="jhead"><div class="ros" aria-hidden="true">${ROS}</div><div class="wrap">
    <p class="crumb"><a href="#top">Accueil</a> / Journal</p>
    <h1 class="j-h1">Le journal de la <em>Omra</em></h1>
    <p class="lede" style="margin-top:16px">Guides pratiques pour préparer votre Omra : rites, ihram, miqat, Rawdah, lieux à visiter et valise.</p>
    <div class="jfilters" role="group" aria-label="Filtrer par thème">${cats.map(c => `<button aria-pressed="${c === filter}" data-cat="${c}">${c}</button>`).join('')}</div>
  </div></header>
  <section><div class="wrap"><div class="jgrid">${list.map(card).join('')}</div></div></section>`;
  setMeta("Journal de la Omra : guides pratiques · Naqaa Ihram",
    "Comment faire la Omra, mettre l'ihram, réserver la Rawdah sur Nusuk, miqat depuis la France, lieux à visiter : tous nos guides pour préparer votre Omra.",
    {"@context":"https://schema.org","@type":"Blog","name":"Journal de la Omra","publisher":ORG,
     "blogPost":ARTICLES.map(a => ({"@type":"BlogPosting","headline":a.title,"url":"https://naqaaihram.com/blogs/journal/" + a.slug}))});
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-cat]'); if(!b) return;
  filter = b.dataset.cat; renderJournal();
});

function renderArticle(a){
  const toc = [...a.body.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(m => `<a href="#j-${a.slug}" data-to="${m[1]}">${m[2]}</a>`).join('');
  const related = ARTICLES.filter(x => x.slug !== a.slug).slice(0, 3);
  $('#v-article').innerHTML = `
  <header class="jhead"><div class="ros" aria-hidden="true">${ROS}</div><div class="wrap">
    <p class="crumb"><a href="#top">Accueil</a> / <a href="#journal">Journal</a> / ${a.cat}</p>
    <h1 class="j-h1" style="max-width:20ch">${a.title}</h1>
    <p class="ameta"><span>Par l'équipe Naqaa</span><span>${fmtDate(a.date)}</span><span>${a.min} min de lecture</span></p>
  </div></header>
  <div class="wrap awrap">
    <nav class="toc" aria-label="Sommaire"><p>Sommaire</p>${toc}</nav>
    <article class="prose">
      ${a.body}
      <aside class="acta"><img src="img/ihram-packshot.jpg" alt="Ihram Naqaa">
        <div><h3>Partez avec un ihram qui ne vous trahit pas.</h3><p>100 % coton d'Égypte, ceinture et carte de la talbiya incluses. Livraison offerte en 3 jours, express en 24 h.</p>
        <a class="btn" href="#collection">Découvrir Naqaa Ihram</a></div></aside>
      <section class="afaq faq"><h2>Questions fréquentes</h2>${a.faq.map(f => `<details><summary>${f[0]}</summary><p>${f[1]}</p></details>`).join('')}</section>
      <div class="kw" aria-label="Mots-clés">${a.kw.map(k => `<span>${k}</span>`).join('')}</div>
    </article>
  </div>
  <section class="pattern"><div class="wrap"><div class="head"><p class="kicker">À lire ensuite</p><h2>Continuer la <em>préparation</em></h2></div><div class="jgrid">${related.map(card).join('')}</div></div></section>`;
  setMeta(a.title + " · Naqaa Ihram", a.meta, {"@context":"https://schema.org","@graph":[
    {"@type":"Article","headline":a.title,"description":a.meta,"datePublished":a.date,"author":ORG,"publisher":ORG,"keywords":a.kw.join(', '),"inLanguage":"fr-FR"},
    {"@type":"FAQPage","mainEntity":a.faq.map(f => ({"@type":"Question","name":f[0],"acceptedAnswer":{"@type":"Answer","text":f[1]}}))},
    {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Accueil"},{"@type":"ListItem","position":2,"name":"Journal"},{"@type":"ListItem","position":3,"name":a.title}]}]});
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-to]'); if(!t) return;
  e.preventDefault(); const el = document.getElementById(t.dataset.to); el && el.scrollIntoView({behavior:'smooth'});
});

/* ---------- routeur ---------- */
function show(v){ ['home','journal','article'].forEach(k => $('#v-' + k).hidden = k !== v); }
function route(){
  const h = location.hash.slice(1);
  if(h === 'journal'){ show('journal'); renderJournal(); window.scrollTo(0, 0); return; }
  if(h.startsWith('j-')){
    const a = ARTICLES.find(x => x.slug === h.slice(2));
    if(a){ show('article'); renderArticle(a); window.scrollTo(0, 0); return; }
  }
  const wasHome = !$('#v-home').hidden;
  show('home'); setMeta(BASE_TITLE, BASE_DESC, HOME_LD);
  const el = h && document.getElementById(h);
  if(el) setTimeout(() => el.scrollIntoView({behavior: wasHome ? 'smooth' : 'auto'}), 0);
  else if(!wasHome || h === 'top') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();

/* ---------- 3D ---------- */
const FEATS = [
  ["Éponge de coton d'Égypte", "Fibre extra-longue, tissage éponge dense : elle absorbe la sueur et laisse la peau au sec, même à 40 °C."],
  ["Ourlets plats", "Des bords finis à plat, sans couture épaisse : rien ne frotte à l'intérieur des cuisses pendant le sa'i."],
  ["Ceinture porte-documents", "Elle tient l'izar sans serrer et garde passeport, carte et téléphone contre vous."],
  ["Pochette en coton", "Pour le voyage aller, puis pour ranger votre ihram au retour. Votre prénom peut y être gravé."],
  ["Carte de la talbiya", "En arabe, en phonétique et en français, pour la réciter dès le miqat."]
];
$('#feats').innerHTML = FEATS.map((f, i) => `<li><button data-f="${i}" aria-current="${i === 0}"><span class="n">${i + 1}</span><span><b>${f[0]}</b><span class="t">${f[1]}</span></span></button></li>`).join('');
let active = 0;
function setActive(i){
  active = i;
  document.querySelectorAll('[data-f]').forEach(b => b.setAttribute('aria-current', +b.dataset.f === i));
  document.querySelectorAll('.hs').forEach(h => h.classList.toggle('on', +h.dataset.h === i));
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-f],[data-h]'); if(!b) return;
  setActive(+(b.dataset.f ?? b.dataset.h));
});

function init3D(){
  const T = window.THREE, stage = $('#stage');
  if(!T || !T.OrbitControls) return;
  let renderer;
  try { renderer = new T.WebGLRenderer({antialias:true, alpha:true}); } catch(e){ return; }
  $('#stageFb').remove();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.outputEncoding = T.sRGBEncoding;
  stage.prepend(renderer.domElement);
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(5.6, 4.6, 6.8);
  const controls = new T.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .45, 0); controls.enableDamping = true; controls.dampingFactor = .08;
  controls.enablePan = false; controls.enableZoom = false;
  controls.minPolarAngle = .35; controls.maxPolarAngle = 1.32;
  controls.autoRotate = !reduce; controls.autoRotateSpeed = 1.1;
  controls.addEventListener('start', () => { $('#hint').style.opacity = 0; });

  scene.add(new T.HemisphereLight(0xffffff, 0xd8c7a2, .9));
  const sun = new T.DirectionalLight(0xffffff, .8); sun.position.set(4, 8, 5); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, {left:-4, right:4, top:4, bottom:-4, near:1, far:20}); sun.shadow.radius = 6;
  scene.add(sun);
  const fill = new T.DirectionalLight(0xfff1d6, .35); fill.position.set(-5, 3, -3); scene.add(fill);

  const tex = (w, h, draw, rep) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4;
    if(rep){ t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep, rep); }
    return t;
  };
  const terry = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#FBFAF6'; g.fillRect(0, 0, w, h);
    for(let i = 0; i < 14000; i++){
      g.fillStyle = `rgba(${150 + Math.random()*40},${140 + Math.random()*30},${120 + Math.random()*20},${.06 + Math.random()*.12})`;
      g.beginPath(); g.arc(Math.random()*w, Math.random()*h, .6 + Math.random()*1.4, 0, 7); g.fill();
    }
  }, 1.4);
  const cloth = new T.MeshStandardMaterial({map:terry, roughness:.95, metalness:0});

  function slab(w, d, t, r){
    const s = new T.Shape(), x = -w/2, y = -d/2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
    s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new T.ExtrudeGeometry(s, {depth:Math.max(.02, t - .12), bevelEnabled:true, bevelThickness:.06, bevelSize:.06, bevelSegments:5, curveSegments:10});
    g.rotateX(-Math.PI/2); g.computeBoundingBox(); g.translate(0, -g.boundingBox.min.y, 0);
    return g;
  }
  const mesh = (g, m) => { const o = new T.Mesh(g, m); o.castShadow = o.receiveShadow = true; return o; };

  const izar = new T.Group(), rida = new T.Group();
  izar.add(mesh(slab(2.5, 1.7, .17, .14), cloth)); const iz2 = mesh(slab(2.48, 1.68, .17, .14), cloth); iz2.position.y = .17; izar.add(iz2);
  rida.add(mesh(slab(2.44, 1.66, .17, .14), cloth)); const ri2 = mesh(slab(2.42, 1.64, .17, .14), cloth); ri2.position.y = .17; rida.add(ri2);
  rida.position.set(.03, .34, -.02); rida.rotation.y = .035;

  const bandTex = tex(256, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#072833'); gr.addColorStop(1, '#0F6E78');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#C9A764'; g.fillRect(14, 0, 4, h); g.fillRect(w - 18, 0, 4, h);
    g.save(); g.translate(w/2, h/2); g.rotate(-Math.PI/2); g.fillStyle = '#F3E6C4';
    g.font = '600 64px Outfit, Jost, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('NAQAA', 0, 0); g.restore();
  });
  const band = mesh(new T.BoxGeometry(.46, .74, 1.9), new T.MeshStandardMaterial({map:bandTex, roughness:.6}));
  band.position.set(.55, .36, 0);

  const beltTex = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#F6F3EC'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,150,130,.35)';
    for(let x = 0; x < w; x += 8){ g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
  const belt = mesh(new T.CylinderGeometry(.34, .34, .44, 48), new T.MeshStandardMaterial({map:beltTex, roughness:.8}));
  belt.rotation.x = Math.PI/2; belt.position.set(1.85, .34, .95);

  const linen = tex(256, 256, (g, w, h) => {
    g.fillStyle = '#E9DEC6'; g.fillRect(0, 0, w, h);
    for(let i = 0; i < 3000; i++){ g.fillStyle = `rgba(120,100,70,${Math.random()*.12})`; g.fillRect(Math.random()*w, Math.random()*h, 2 + Math.random()*6, 1); }
  }, 1);
  const pouch = mesh(slab(1.0, .72, .26, .12), new T.MeshStandardMaterial({map:linen, roughness:1}));
  pouch.position.set(-1.95, 0, 1.0); pouch.rotation.y = .32;

  const cardTex = tex(512, 340, (g, w, h) => {
    g.fillStyle = '#FBF6EA'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#B08D52'; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28); g.lineWidth = 1; g.strokeRect(24, 24, w - 48, h - 48);
    g.fillStyle = '#0B3846'; g.textAlign = 'center'; g.direction = 'rtl';
    g.font = '46px Amiri, serif'; g.fillText('لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ', w/2, h/2 - 10);
    g.direction = 'ltr'; g.fillStyle = '#8A6A35'; g.font = '600 22px Jost, sans-serif'; g.fillText('T A L B I Y A', w/2, h/2 + 60);
  });
  const cream = new T.MeshStandardMaterial({color:0xFBF6EA, roughness:.7});
  const card = mesh(new T.BoxGeometry(1.0, .02, .66), [cream, cream, new T.MeshStandardMaterial({map:cardTex, roughness:.7}), cream, cream, cream]);
  card.position.set(-.45, .7, .25); card.rotation.y = -.18;

  const ground = new T.Mesh(new T.PlaneGeometry(16, 16), new T.ShadowMaterial({opacity:.13}));
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true;
  scene.add(izar, rida, band, belt, pouch, card, ground);

  // positions plié / ouvert
  const parts = [
    [rida, {y:.34}, {y:1.25}], [band, {y:.36, x:.55}, {y:2.05, x:.55}],
    [card, {y:.7, x:-.45}, {y:2.6, x:-.2}], [belt, {x:1.85}, {x:2.45}], [pouch, {x:-1.95}, {x:-2.55}]
  ];
  let open = 0, openTarget = 0;
  // points d'information, attachés aux objets
  const anchor = (parent, x, y, z) => { const o = new T.Object3D(); o.position.set(x, y, z); parent.add(o); return o; };
  const anchors = [anchor(rida, -.6, .36, -.25), anchor(izar, -1.2, .2, .82), anchor(scene, 0, 0, 0), anchor(pouch, 0, .3, 0), anchor(scene, 0, 0, 0)];
  anchors[2] = belt; anchors[4] = card;
  const dots = anchors.map((_, i) => {
    const b = document.createElement('button'); b.className = 'hs' + (i === 0 ? ' on' : ''); b.dataset.h = i; b.textContent = i + 1;
    b.setAttribute('aria-label', FEATS[i][0]); stage.appendChild(b); return b;
  });

  function size(){
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  size(); new ResizeObserver(size).observe(stage);

  document.querySelectorAll('.ctrl button').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.v; $('#hint').style.opacity = 0;
    if(v === 'rot'){ controls.autoRotate = !controls.autoRotate; b.setAttribute('aria-pressed', controls.autoRotate); return; }
    openTarget = v === 'eclate' ? 1 : 0;
    document.querySelectorAll('.ctrl [data-v="plie"],.ctrl [data-v="eclate"]').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));

  const v = new T.Vector3(); let running = false;
  function frame(){
    if(!running) return;
    open += (openTarget - open) * .07;
    parts.forEach(([o, a, b]) => { for(const k in a) o.position[k] = a[k] + (b[k] - a[k]) * open; });
    card.rotation.x = -.55 * open; rida.rotation.z = .06 * open;
    controls.update(); renderer.render(scene, camera);
    const w = stage.clientWidth, h = stage.clientHeight;
    anchors.forEach((a, i) => {
      a.getWorldPosition(v);
      if(i === 2) v.y += .38; if(i === 4) v.y += .05;
      v.project(camera);
      dots[i].style.transform = `translate(${(v.x * .5 + .5) * w}px, ${(-v.y * .5 + .5) * h}px)`;
    });
    requestAnimationFrame(frame);
  }
  new IntersectionObserver(([en]) => { const was = running; running = en.isIntersecting; if(running && !was) frame(); }).observe(stage);
}
if(document.readyState === 'complete') init3D(); else window.addEventListener('load', init3D);
})();
