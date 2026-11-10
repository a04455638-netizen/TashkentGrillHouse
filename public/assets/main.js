/* Tashkent Grill House: one opening (the logo draws itself, the fire lights, the plates are served),
   one scroll scene (the plov platter turns through its parts), quiet motion everywhere else. */
(function () {
  var root = document.documentElement;
  var reduced = root.classList.contains('rm');
  window.__tgh = true;

  var hdr = document.querySelector('[data-hdr]');

  /* ---------- Sections menu, below 1061px ---------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var setNav = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    hdr.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', function () { setNav(toggle.getAttribute('aria-expanded') !== 'true'); });
  document.getElementById('hdrNav').addEventListener('click', function (e) { if (e.target.closest('a')) setNav(false); });
  document.addEventListener('click', function (e) { if (!hdr.contains(e.target)) setNav(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && hdr.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });

  /* ---------- Solid header once scrolled; phone directions bar after the hero ---------- */
  // The bar steps aside for the plov scene and at the address, where the same buttons are on screen.
  var mcta = document.querySelector('[data-mcta]');
  var heroEl = document.querySelector('.hero');
  var plovEl = document.querySelector('[data-plov]');
  var visitEl = document.getElementById('visit');
  var queued = false;
  function onScroll() {
    queued = false;
    var vh = window.innerHeight;
    var p = plovEl.getBoundingClientRect();
    var pastHero = heroEl.getBoundingClientRect().bottom < vh * 0.4;
    var inPlov = !reduced && p.top < vh * 0.6 && p.bottom > vh * 0.4;
    var atVisit = visitEl.getBoundingClientRect().top < vh * 0.8;
    hdr.classList.toggle('is-solid', window.scrollY > 24);
    mcta.classList.toggle('is-on', pastHero && !inPlov && !atVisit);
  }
  onScroll();
  window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);

  if (!window.gsap) { root.classList.remove('intro', 'intro-quick'); return; }
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger, window.DrawSVGPlugin);
  var ST = window.ScrollTrigger;
  var mobile = window.matchMedia('(max-width: 760px)');

  /* ---------- Opening ---------- */
  var logo = document.getElementById('heroLogo');
  var C = 310.5; // centre of the 621 viewBox
  var q = function (sel) { return logo.querySelectorAll(sel); };
  // Draw the rosette around the clock, starting at twelve.
  var rosette = Array.prototype.slice.call(q('.lg-rosette path')).map(function (p) {
    var b = p.getBBox();
    var a = Math.atan2(b.y + b.height / 2 - C, b.x + b.width / 2 - C) + Math.PI / 2;
    return { p: p, a: (a + Math.PI * 2) % (Math.PI * 2) };
  }).sort(function (x, y) { return x.a - y.a; }).map(function (o) { return o.p; });

  var heroPlates = Array.prototype.slice.call(document.querySelectorAll('.hero [data-plate-in]'));
  var served = [
    { x: 260, y: 220, r: -80 },   // plov from the bottom right
    { x: 240, y: -160, r: 70 },   // shashlik from the top right
    { x: -260, y: 200, r: 90 },   // lagman from the bottom left
    { x: -220, y: -160, r: -70 }, // samsa from the top left
  ];

  function startLoops() {
    if (reduced) return;
    var spins = [];
    document.querySelectorAll('.hero [data-spin]').forEach(function (el, i) {
      spins.push(gsap.to(el, { rotation: (i % 2 ? -360 : 360), duration: [110, 70, 90, 80][i] || 90, repeat: -1, ease: 'none' }));
    });
    ST.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: function (self) { spins.forEach(function (t) { self.isActive ? t.resume() : t.pause(); }); } });
    document.querySelectorAll('.logo').forEach(flicker);
    sparks();
    // With a mouse, the table leans a little toward the cursor; nearer plates move more.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      var depth = [18, 12, 14, 9];
      var movers = heroPlates.map(function (el, i) {
        return { x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }), d: depth[i] || 10 };
      });
      document.querySelector('.hero').addEventListener('pointermove', function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        movers.forEach(function (m) { m.x(-nx * m.d * 2); m.y(-ny * m.d * 2); });
      });
    }
    gsap.to('.logo .lg-ember', { opacity: 0.4, scale: 0.9, transformOrigin: '50% 70%', duration: 1.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  }

  // The flame never repeats itself: each lick is a new random shape.
  function flicker(svg) {
    var flame = svg.querySelector('.lg-flame');
    if (!flame) return;
    (function lick() {
      gsap.to(flame, {
        scaleY: gsap.utils.random(0.9, 1.1), scaleX: gsap.utils.random(0.95, 1.05), skewX: gsap.utils.random(-4, 4),
        svgOrigin: '314 248', duration: gsap.utils.random(0.12, 0.3), ease: 'sine.inOut', onComplete: lick,
      });
    })();
  }

  // Embers rise off the logo's grill while the hero is on screen.
  function sparks() {
    var cv = document.querySelector('[data-sparks]');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var list = [], last = 0, acc = 0, src = { x: 0, y: 0, w: 0 }, ceil = 0, on = true;
    function size() {
      var r = cv.getBoundingClientRect();
      cv.width = r.width * dpr; cv.height = r.height * dpr;
      var l = logo.getBoundingClientRect();
      src = { x: l.left - r.left + l.width * 0.506, y: l.top - r.top + l.height * 0.22, w: l.width * 0.16 };
      // Embers die out before they reach the header.
      ceil = hdr.offsetHeight + 8 - (r.top + window.scrollY);
    }
    size();
    window.addEventListener('resize', size);
    ST.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onToggle: function (s) { on = s.isActive; if (on) requestAnimationFrame(tick); } });
    function tick(t) {
      if (!on) return;
      var dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
      acc += dt * 22;
      while (acc > 1) {
        acc -= 1;
        list.push({ x: src.x + (Math.random() - 0.5) * src.w, y: src.y + Math.random() * 6, vx: (Math.random() - 0.5) * 14, vy: -(26 + Math.random() * 46), life: 0, max: 1.3 + Math.random() * 1.6, s: 0.8 + Math.random() * 1.6, h: 22 + Math.random() * 18 });
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.globalCompositeOperation = 'lighter';
      for (var i = list.length - 1; i >= 0; i--) {
        var p = list[i];
        p.life += dt;
        if (p.life > p.max) { list.splice(i, 1); continue; }
        p.vx += Math.sin((t / 1000) * 2 + p.h) * 6 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y < ceil) { list.splice(i, 1); continue; }
        var a = Math.sin(Math.PI * p.life / p.max) * 0.85 * Math.min(1, (p.y - ceil) / 60);
        ctx.fillStyle = 'hsla(' + p.h + ',100%,' + (62 + p.s * 6) + '%,' + a + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function opening(quick) {
    rosette.forEach(function (p) { p.setAttribute('vector-effect', 'non-scaling-stroke'); });
    var tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        root.classList.remove('intro', 'intro-quick');
        try { sessionStorage.setItem('tgh-intro', '1'); } catch (e) {}
        startLoops();
      },
    });
    tl.set(rosette, { stroke: '#d3ba74', strokeWidth: 1.5, drawSVG: '0%', fillOpacity: 0 })
      .to(rosette, { drawSVG: '100%', duration: 1.25, stagger: 0.05, ease: 'power2.inOut' }, 0.15)
      .to(rosette, { fillOpacity: 1, duration: 0.7, stagger: 0.025, ease: 'power1.out' }, 1.0)
      .to(rosette, { strokeWidth: 0, duration: 0.5 }, 1.5)
      .fromTo(q('.lg-bowl, .lg-cut'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 1.0)
      .fromTo(q('.lg-ember'), { autoAlpha: 0, scale: 0.3, transformOrigin: '50% 70%' }, { autoAlpha: 0.7, scale: 1, duration: 0.9 }, 1.15)
      .fromTo(q('.lg-flame'), { autoAlpha: 0, scaleY: 0, svgOrigin: '314 248' }, { autoAlpha: 1, scaleY: 1, duration: 0.75, ease: 'back.out(2.2)' }, 1.2)
      .set(q('.lg-word'), { autoAlpha: 1 }, 1.4)
      .fromTo(q('.lg-word path'), { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.05 }, 1.4)
      .fromTo(q('.lg-sub, .lg-flower'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 1.8)
      .fromTo(q('.lg-ring'), { autoAlpha: 0, rotation: -28, svgOrigin: C + ' ' + C }, { autoAlpha: 1, rotation: 0, duration: 1.1 }, 1.8)
      .fromTo(heroPlates, {
        autoAlpha: 0, scale: 0.86,
        x: function (i) { return served[i].x; }, y: function (i) { return served[i].y; }, rotation: function (i) { return served[i].r; },
      }, { autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: 0, duration: 1.3, stagger: 0.1, ease: 'expo.out' }, 2.0)
      .fromTo('[data-hero-copy]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.09 }, 2.2)
      .fromTo(hdr, { autoAlpha: 0, y: -14 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 2.4);
    if (quick) tl.timeScale(2.6);
    // A visitor who starts scrolling is not kept waiting for the opening.
    var hurry = function () { if (tl.isActive()) tl.timeScale(Math.max(tl.timeScale(), 3.5)); };
    window.addEventListener('wheel', hurry, { passive: true, once: true });
    window.addEventListener('touchmove', hurry, { passive: true, once: true });
    // A keyboard visitor needs the header and buttons now, so the opening ends at once.
    window.addEventListener('keydown', function () { if (tl.isActive()) tl.progress(1); }, { once: true });
    window.__tghIntro = tl;
  }

  if (root.classList.contains('intro') || root.classList.contains('intro-quick')) {
    opening(root.classList.contains('intro-quick'));
  } else {
    startLoops();
  }

  if (reduced) return;

  /* ---------- Hero parallax on the way out ---------- */
  var out = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.4 };
  gsap.to('.plate--plov', { yPercent: -16, xPercent: -4, ease: 'none', scrollTrigger: out });
  gsap.to('.plate--shashlik', { yPercent: -40, ease: 'none', scrollTrigger: out });
  gsap.to('.plate--lagman', { yPercent: -10, xPercent: -10, ease: 'none', scrollTrigger: out });
  gsap.to('.plate--samsa', { yPercent: -55, ease: 'none', scrollTrigger: out });
  if (!mobile.matches) gsap.to('.hero__center', { yPercent: 12, autoAlpha: 0.35, ease: 'none', scrollTrigger: { trigger: '.hero', start: '30% top', end: 'bottom top', scrub: 0.4 } });

  /* ---------- Plov: the platter turns through its parts ---------- */
  // Where each part sits on the platter photo, as a fraction of its radius (x right, y down).
  var parts = { rice: [-0.04, 0.72], carrot: [0.58, 0.15], meat: [-0.33, 0.08], garlic: [0.03, -0.06], chickpea: [0.18, -0.24], egg: [0.38, -0.62] };
  var stage = document.querySelector('[data-plov-stage]');
  var plate = document.querySelector('[data-plov-plate]');
  var halo = stage.querySelector('.plov__halo');
  var pin = document.querySelector('[data-plov-pin]');
  var stepsEl = document.querySelector('[data-plov-steps]');
  var items = Array.prototype.slice.call(stepsEl.children);
  stepsEl.style.setProperty('--steps', items.length);
  var deg = 180 / Math.PI;

  // Rotation that brings part i under the pin, always turning the same way.
  function targets(pointer) {
    var prev = null;
    return items.map(function (li) {
      var p = parts[li.dataset.k];
      var r = Math.hypot(p[0], p[1]);
      var rot = pointer - Math.atan2(p[1], p[0]) * deg;
      if (prev !== null) { while (rot > prev - 25) rot -= 360; while (rot < prev - 335) rot += 360; }
      prev = rot;
      return { rot: rot, r: r };
    });
  }

  var plan = [];
  var current = -1;
  function layout() { plan = targets(mobile.matches ? -38 : -12); }
  layout();
  mobile.addEventListener('change', function () { layout(); ST.refresh(); });

  var setPlate = gsap.quickSetter(plate, 'rotation', 'deg');
  var setHalo = gsap.quickSetter(halo, 'rotation', 'deg');
  var ease = gsap.parseEase('power2.inOut');

  function render(progress) {
    var n = plan.length;
    var f = Math.min(progress * n, n - 0.0001);
    var i = Math.floor(f);
    var local = f - i;
    // Turn during the first half of each step, hold for the second half so the eye can land.
    var k = ease(Math.min(1, local / 0.5));
    var from = i === 0 ? { rot: plan[0].rot + 50, r: plan[0].r } : plan[i - 1];
    var to = plan[i];
    var rot = from.rot + (to.rot - from.rot) * (i === 0 ? ease(Math.min(1, progress * n / 0.5)) : k);
    setPlate(rot);
    setHalo(-rot * 0.35);
    var radius = stage.offsetWidth / 2;
    var pointer = (mobile.matches ? -38 : -12) / deg;
    var hold = local > 0.45 || (i === 0 && local > 0.35);
    var px = Math.cos(pointer) * to.r * radius;
    var py = Math.sin(pointer) * to.r * radius;
    gsap.set(pin, { x: px, y: py, autoAlpha: hold ? 1 : 0, overwrite: true });
    if (i !== current) {
      current = i;
      items.forEach(function (li, j) { li.classList.toggle('is-on', j === i); });
      stepsEl.style.setProperty('--step', i + 1); // the phone's progress line
    }
    // A gold line runs from the pin to the active line of the list; phones have the list below instead.
    var lead = 0, angle = 0;
    if (hold && !mobile.matches) {
      var s = stage.getBoundingClientRect();
      var name = items[i].querySelector('b').getBoundingClientRect();
      var dx = items[i].getBoundingClientRect().left - 14 - (s.left + radius + px);
      var dy = name.top + name.height / 2 - (s.top + radius + py);
      if (dx > 40) { lead = Math.hypot(dx, dy) - 27; angle = Math.atan2(dy, dx); }
    }
    pin.style.setProperty('--lead', lead + 'px');
    pin.style.setProperty('--lead-a', angle + 'rad');
  }

  ST.create({
    trigger: '[data-plov]', start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onUpdate: function (self) { render(self.progress); },
    onRefresh: function (self) { render(self.progress); },
  });
  gsap.set(pin, { autoAlpha: 0 });
  gsap.fromTo(plate, { scale: 0.86 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.plov', start: 'top bottom', end: 'top top', scrub: 0.5 } });

  /* ---------- Menu: plates are set down turning, then keep a slow turn ---------- */
  document.querySelectorAll('[data-dish]').forEach(function (dish, i) {
    var spin = dish.querySelector('[data-spin]');
    var inner = dish.querySelector('[data-plate-in]');
    var loop = gsap.to(spin, { rotation: (i % 2 ? -360 : 360), duration: 60 + i * 7, repeat: -1, ease: 'none', paused: true });
    gsap.fromTo(inner, { rotation: -110, scale: 0.8, autoAlpha: 0 }, {
      rotation: 0, scale: 1, autoAlpha: 1, duration: 1.2, ease: 'expo.out', delay: (i % 3) * 0.08,
      scrollTrigger: { trigger: dish, start: 'top 85%', once: true },
    });
    ST.create({ trigger: dish, start: 'top bottom', end: 'bottom top', onToggle: function (self) { self.isActive ? loop.play() : loop.pause(); } });
    dish.addEventListener('mouseenter', function () { gsap.to(loop, { timeScale: 9, duration: 0.5, ease: 'power2.out' }); });
    dish.addEventListener('mouseleave', function () { gsap.to(loop, { timeScale: 1, duration: 1.2, ease: 'power2.out' }); });
  });
  gsap.fromTo('.menu__watermark', { rotation: -20 }, { rotation: 40, ease: 'none', scrollTrigger: { trigger: '.menu', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Fire band drifts with the scroll ---------- */
  gsap.fromTo('[data-fire]', { xPercent: 0 }, { xPercent: -34, ease: 'none', scrollTrigger: { trigger: '.fire', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- Headings rise once, nothing else fades ---------- */
  document.querySelectorAll('.chef h2, .hall h2, .visit h2, .menu__head h2, .plov h2').forEach(function (h) {
    gsap.from(h, { y: 35, autoAlpha: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });
  gsap.from('.chef__kazan', { scale: 0.6, rotation: -40, autoAlpha: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.chef__media', start: 'top 70%', once: true } });

  /* ---------- Footer entrance reveal ---------- */
  var footerEl = document.querySelector('.ftr, .site-footer');
  if (footerEl) {
    var cols = footerEl.querySelectorAll('.ftr-col, .ftr__col, .ftr-bottom, .ftr__bottom');
    if (cols.length) {
      gsap.from(cols, {
        y: 25,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: footerEl, start: 'top 92%', once: true }
      });
    }
  }

  window.addEventListener('load', function () { ST.refresh(); });
})();
