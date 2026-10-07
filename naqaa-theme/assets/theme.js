(function () {
  'use strict';
  var N = window.Naqaa || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- argent ---------- */
  function money(cents) {
    var fmt = N.money || '{{amount_with_comma_separator}} €';
    var v = (cents / 100).toFixed(2);
    var comma = v.replace('.', ',');
    var noDec = Math.round(cents / 100).toString();
    return fmt.replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, comma)
              .replace(/\{\{\s*amount_no_decimals\s*\}\}/, noDec)
              .replace(/\{\{\s*amount\s*\}\}/, v)
              .replace(/<[^>]*>/g, '');
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(t) { var el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('is-on'); clearTimeout(toast.h); toast.h = setTimeout(function () { el.classList.remove('is-on'); }, 2600); }

  /* ---------- en-tête, menu, scrim ---------- */
  var header = $('[data-header]');
  if (header) window.addEventListener('scroll', function () { header.classList.toggle('is-scrolled', window.scrollY > 10); }, { passive: true });
  var scrim = $('[data-scrim]'), mnav = $('#mobile-nav'), drawer = $('#cart-drawer');
  function closeAll() {
    if (mnav) { mnav.classList.remove('is-open'); mnav.setAttribute('aria-hidden', 'true'); }
    if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
    $$('.modal.is-open').forEach(function (m) { m.classList.remove('is-open'); m.setAttribute('aria-hidden', 'true'); });
    if (scrim) scrim.classList.remove('is-on');
    document.body.classList.remove('is-locked');
    $$('[data-menu-open]').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  }
  function lock() { if (scrim) scrim.classList.add('is-on'); document.body.classList.add('is-locked'); }
  $$('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', function () { mnav.classList.add('is-open'); mnav.setAttribute('aria-hidden', 'false'); b.setAttribute('aria-expanded', 'true'); lock(); });
  });
  if (scrim) scrim.addEventListener('click', closeAll);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  /* ---------- modales ---------- */
  document.addEventListener('click', function (e) {
    var o = e.target.closest('[data-modal-open]');
    if (o) { var m = document.getElementById(o.getAttribute('data-modal-open')); if (m) { m.classList.add('is-open'); m.setAttribute('aria-hidden', 'false'); lock(); var x = $('[data-modal-close]', m); if (x) x.focus(); } }
    if (e.target.closest('[data-modal-close]') || e.target.classList.contains('modal')) closeAll();
  });

  /* ---------- panier ---------- */
  function fetchCart() { return fetch((N.routes ? N.routes.cart : '/cart') + '.js', { headers: { Accept: 'application/json' } }).then(function (r) { return r.json(); }); }
  function setCount(n) { $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.setAttribute('data-count', n); }); }
  function renderCart(cart) {
    setCount(cart.item_count);
    var lines = $('[data-cart-lines]'), foot = $('[data-cart-foot]');
    if (!lines) return;
    if (!cart.item_count) {
      lines.innerHTML = '<div class="drawer__empty"><p class="lede">Votre panier est vide.</p><a class="btn" href="' + ((N.routes && N.routes.root) || '/') + 'collections/all">Découvrir la collection</a></div>';
      if (foot) foot.hidden = true;
      return;
    }
    var html = cart.items.map(function (it, i) {
      var props = '';
      if (it.properties) Object.keys(it.properties).forEach(function (k) { if (it.properties[k] && k.charAt(0) !== '_') props += '<span>' + esc(k) + ' : ' + esc(it.properties[k]) + '</span>'; });
      var img = it.image ? it.image.replace(/(\.[a-z]+)(\?|$)/i, '_200x$1$2') : '';
      return '<div class="line">' +
        '<a href="' + esc(it.url) + '">' + (img ? '<img src="' + esc(img) + '" alt="" width="80" height="100" loading="lazy">' : '') + '</a>' +
        '<div class="line__i"><b>' + esc(it.product_title.split('·')[0].trim()) + '</b>' +
        (it.variant_title ? '<span>' + esc(it.variant_title) + '</span>' : '') + props +
        '<div class="line__qty"><button type="button" data-line="' + (i + 1) + '" data-qty-to="' + (it.quantity - 1) + '" aria-label="Retirer un">−</button><output>' + it.quantity + '</output><button type="button" data-line="' + (i + 1) + '" data-qty-to="' + (it.quantity + 1) + '" aria-label="Ajouter un">+</button></div>' +
        '<button type="button" class="line__rm" data-line="' + (i + 1) + '" data-qty-to="0">Retirer</button></div>' +
        '<span class="line__p price">' + money(it.final_line_price) + '</span></div>';
    }).join('');
    // vente croisée : un produit de la famille absent du panier
    var inCart = cart.items.map(function (it) { return it.handle; });
    var sug = (N.upsell || []).filter(function (p) { return p.available && inCart.indexOf(p.handle) === -1; })[0];
    if (sug) {
      html += '<div class="drawer__up upsell"><p class="upsell__title">Il part avec vous ?</p><div class="upsell__item">' +
        (sug.img ? '<img src="' + esc(sug.img) + '" alt="" width="64" height="80" loading="lazy">' : '<span></span>') +
        '<div><b>' + esc(sug.title) + '</b><span>' + money(sug.price) + '</span></div>' +
        '<button type="button" data-quick-add="' + sug.id + '">Ajouter</button></div></div>';
    }
    lines.innerHTML = html;
    if (foot) {
      foot.hidden = false;
      var st = $('[data-cart-subtotal]'), tt = $('[data-cart-total]');
      if (st) st.textContent = money(cart.items_subtotal_price);
      if (tt) tt.textContent = money(cart.total_price);
    }
  }
  function openCart() {
    if (!drawer) { window.location.href = (N.routes && N.routes.cart) || '/cart'; return; }
    fetchCart().then(renderCart);
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); lock();
    setTimeout(function () { drawer.focus(); }, 50);
  }
  function addItems(items) {
    return fetch(((N.routes && N.routes.cartAdd) || '/cart/add') + '.js', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: items })
    }).then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); });
  }
  $$('[data-cart-open]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); openCart(); }); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-close]')) { closeAll(); return; }
    var q = e.target.closest('[data-quick-add]');
    if (q) {
      e.preventDefault(); q.disabled = true;
      addItems([{ id: +q.getAttribute('data-quick-add'), quantity: 1 }]).then(function () { q.disabled = false; toast('Ajouté au panier'); openCart(); })
        .catch(function (err) { q.disabled = false; toast((err && err.description) || "Impossible d'ajouter ce produit."); });
      return;
    }
    var m = e.target.closest('[data-add-many]');
    if (m) {
      e.preventDefault(); m.disabled = true;
      var ids = m.getAttribute('data-add-many').split(',').filter(Boolean).map(function (id) { return { id: +id, quantity: 1 }; });
      addItems(ids).then(function () { m.disabled = false; openCart(); }).catch(function () { m.disabled = false; toast("Un des produits n'est pas disponible."); });
      return;
    }
    var l = e.target.closest('[data-qty-to]');
    if (l && drawer && drawer.contains(l)) {
      fetch(((N.routes && N.routes.cartChange) || '/cart/change') + '.js', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: +l.getAttribute('data-line'), quantity: Math.max(0, +l.getAttribute('data-qty-to')) })
      }).then(function (r) { return r.json(); }).then(renderCart);
    }
  });

  /* ---------- onglets ---------- */
  $$('[data-tabs]').forEach(function (list) {
    var section = list.parentNode;
    $$('[data-tab]', list).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-tab]', list).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('[data-panel]', section).forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== b.getAttribute('data-tab'); });
      });
    });
  });

  /* ---------- apparition au défilement ---------- */
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove('is-pending'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top > window.innerHeight) { el.classList.add('is-pending'); io.observe(el); }
    });
  }

  /* ---------- sommaire des articles ---------- */
  var toc = $('[data-toc]'), prose = $('[data-prose]');
  if (toc && prose) {
    var hs = $$('h2', prose);
    if (hs.length < 2) toc.hidden = true;
    hs.forEach(function (h, i) {
      if (!h.id) h.id = 'part-' + (i + 1);
      var a = document.createElement('a'); a.href = '#' + h.id; a.textContent = h.textContent; toc.appendChild(a);
    });
  }

  /* ================= FICHE PRODUIT ================= */
  $$('[data-product-section]').forEach(function (sec) {
    var jsonEl = $('[data-product-json]', sec);
    if (!jsonEl) return;
    var product = JSON.parse(jsonEl.textContent);
    var form = $('form[id^="product-form-"]', sec);
    var idInput = $('[data-variant-id]', sec);
    var atc = $('[data-atc]', sec), atcLabel = $('[data-atc-label]', sec), atcPrice = $('[data-atc-price]', sec);
    var priceEl = $('[data-price]', sec);
    var slides = $('[data-slides]', sec);
    var thumbs = $$('[data-thumb]', sec), dots = $$('.gallery__dots span', sec);

    function current() {
      var sel = $$('fieldset.opt', sec).map(function (fs) { var c = $('input:checked', fs); return c ? c.value : null; });
      return product.variants.filter(function (v) { return v.options.every(function (o, i) { return sel[i] == null || o === sel[i]; }); })[0];
    }
    function goTo(i) {
      if (!slides) return;
      slides.scrollTo({ left: slides.clientWidth * i, behavior: 'smooth' });
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function update() {
      var v = current();
      $$('fieldset.opt', sec).forEach(function (fs, i) { var c = $('input:checked', fs); var lbl = $('[data-option-label="' + i + '"]', sec); if (lbl && c) lbl.textContent = c.value; });
      if (!v) { if (atc) { atc.disabled = true; atcLabel.textContent = 'Indisponible'; } return; }
      idInput.value = v.id;
      if (priceEl) priceEl.textContent = money(v.price);
      if (atcPrice) atcPrice.textContent = '· ' + money(v.price);
      if (atc) { atc.disabled = !v.available; atcLabel.textContent = v.available ? 'Ajouter au panier' : 'Épuisé'; }
      var sv = $('[data-sticky-variant]', sec), sp = $('[data-sticky-price]', sec);
      if (sv) sv.textContent = v.title === 'Default Title' ? '' : v.title;
      if (sp) sp.textContent = money(v.price);
      if (v.featured_media && slides) {
        var idx = $$('.gallery__slide', slides).findIndex(function (s) { return s.getAttribute('data-media-id') == v.featured_media.id; });
        if (idx > -1) goTo(idx);
      }
      try { var u = new URL(location.href); u.searchParams.set('variant', v.id); history.replaceState(null, '', u.toString()); } catch (e) {}
    }
    $$('input[data-opt]', sec).forEach(function (i) { i.addEventListener('change', update); });

    thumbs.forEach(function (t) { t.addEventListener('click', function () { goTo(+t.getAttribute('data-thumb')); }); });
    if (slides) slides.addEventListener('scroll', function () {
      var i = Math.round(slides.scrollLeft / Math.max(1, slides.clientWidth));
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      thumbs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }, { passive: true });

    $$('[data-qty]', sec).forEach(function (b) {
      b.addEventListener('click', function () { var inp = $('input[name="quantity"]', sec); inp.value = Math.max(1, Math.min(20, (+inp.value || 1) + (+b.getAttribute('data-qty')))); });
    });
    var gt = $('[data-gift-toggle]', sec), gx = $('[data-gift-text]', sec);
    if (gt && gx) gt.addEventListener('change', function () { gx.hidden = !gt.checked; gx.disabled = !gt.checked; if (gt.checked) gx.focus(); });

    function submit(e) {
      if (e) e.preventDefault();
      if (!atc || atc.disabled) return;
      atc.classList.add('is-loading'); atc.disabled = true;
      var fd = new FormData(form);
      fetch(((N.routes && N.routes.cartAdd) || '/cart/add') + '.js', { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
        .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw j; return j; }); })
        .then(function () { atc.classList.remove('is-loading'); atc.disabled = false; openCart(); })
        .catch(function (err) { atc.classList.remove('is-loading'); atc.disabled = false; toast((err && err.description) || "Impossible d'ajouter ce produit."); });
    }
    if (form) form.addEventListener('submit', submit);

    // barre d'achat fixe
    var sticky = $('[data-sticky-atc]', sec);
    if (sticky && atc && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        var show = !ents[0].isIntersecting && ents[0].boundingClientRect.top < 0;
        sticky.classList.toggle('is-on', show); sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      }).observe(atc);
      var sb = $('[data-sticky-add]', sticky);
      if (sb) sb.addEventListener('click', function () { submit(); });
    }

    // estimation de livraison et compte à rebours
    var std = $('[data-eta-std]', sec), exp = $('[data-eta-exp]', sec);
    var fmt = function (d) { return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }); };
    function addBusiness(d, n) { var x = new Date(d); while (n > 0) { x.setDate(x.getDate() + 1); if (x.getDay() !== 0 && x.getDay() !== 6) n--; } return x; }
    function tick() {
      var now = new Date(), cut = new Date(now); cut.setHours(13, 0, 0, 0);
      var biz = now.getDay() !== 0 && now.getDay() !== 6;
      var shipDay = (biz && now < cut) ? now : addBusiness(now, 1);
      if (std) std.textContent = 'Livrée entre le ' + fmt(addBusiness(shipDay, 2)).replace(/^\w+ /, '') + ' et le ' + fmt(addBusiness(shipDay, 3)).replace(/^\w+ /, '');
      if (exp) {
        var del = addBusiness(shipDay, 1);
        if (biz && now < cut) {
          var ms = cut - now, h = Math.floor(ms / 3.6e6), m = Math.floor(ms % 3.6e6 / 6e4);
          exp.innerHTML = 'Commandez dans <span class="eta__count">' + (h ? h + ' h ' : '') + m + ' min</span> pour la recevoir ' + (del.getDate() === new Date(now.getTime() + 864e5).getDate() ? 'demain' : fmt(del));
        } else {
          exp.textContent = 'Livrée ' + fmt(del);
        }
      }
    }
    tick(); setInterval(tick, 30000);
  });

  /* rafraîchit le compteur au chargement (retour arrière navigateur) */
  window.addEventListener('pageshow', function () { fetchCart().then(function (c) { setCount(c.item_count); }).catch(function () {}); });
})();
