// LE CIEL QUI DÉFILE : la page fait ce que fait l'app. Le fond est le vrai voilier
// de Wo Minute (estampe.js), et la lecture de la page en est la durée.
(function(){
  const cv = document.getElementById('ciel'), ctx = cv.getContext('2d');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const survol = !calme && matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (survol) document.documentElement.classList.add('survol');
  let W = 0, H = 0, dpr = 1;
  function taille(){ dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', taille); taille();
  // Le fond EST le voilier de l'app (estampe.js) : en descendant, le temps passe comme
  // dans le minuteur — l'après-midi, le couchant, le phare, la lune, la nuit ; au bas de
  // la page, la voile s'abaisse et la lanterne s'allume. C'est fini.
  // Le grain du papier est posé une fois, en calque, par-dessus le ciel.
  try {
    const url = WMEstampe.grain().toDataURL();
    [['soft-light', 0.9], ['multiply', 0.1]].forEach(([mode, op]) => {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;inset:0;z-index:-1;pointer-events:none;background:url(${url}) 0 0/128px 128px repeat;mix-blend-mode:${mode};opacity:${op}`;
      cv.after(d);
    });
  } catch (e) {}
  const cl = v => Math.min(1, Math.max(0, v));
  let pLisse = 0, yHorizon = innerHeight * 0.46;
  // DES RONDS DANS L'EAU : la souris qui passe sur la mer (ou un doigt qui la touche) y laisse des ondes.
  const ondes = []; let derniere = { x: -999, y: -999 };
  const surLaMer = (e) => e.clientY > yHorizon + 4 && !e.target.closest('.carte, header, .appareil, .chiffres-ouv, a, button, details, .autre-langue');
  function onde(x, y, force) { if (calme) return; if (ondes.length > 40) ondes.shift(); ondes.push({ x, y, t: performance.now() / 1000, f: force }); }
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || !surLaMer(e)) return;
    const dx = e.clientX - derniere.x, dy = e.clientY - derniere.y;
    if (dx * dx + dy * dy < 1800) return;
    derniere = { x: e.clientX, y: e.clientY }; onde(e.clientX, e.clientY, 0.55);
  }, { passive: true });
  addEventListener('pointerdown', e => { if (surLaMer(e)) onde(e.clientX, e.clientY, 1); }, { passive: true });

  function dessiner(t){
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pCible = cl(scrollY / max);
    pLisse += (pCible - pLisse) * (calme ? 1 : 0.08);
    const now = calme ? 0 : t / 1000;
    const r = WMEstampe.dessiner(ctx, W, H, { p: pLisse, t: now, papier: false });
    yHorizon = r.yH;
    // Les ondes : des ellipses qui s'élargissent, aplaties vers l'horizon ; la nuit, elles prennent la lumière de la lune.
    const tn = performance.now() / 1000;
    for (let i = ondes.length - 1; i >= 0; i--) {
      const o = ondes[i], age = tn - o.t;
      if (age > 3.2) { ondes.splice(i, 1); continue; }
      const persp = 0.3 + 0.7 * cl((o.y - r.yH) / (H - r.yH));
      for (let k = 0; k < 3; k++) {
        const a2 = age - k * 0.38; if (a2 <= 0) continue;
        const rr = a2 * 64 * persp * (0.7 + o.f * 0.5), al = (1 - age / 3.2) * (0.45 - k * 0.1) * (0.6 + o.f * 0.4);
        ctx.strokeStyle = pLisse > 0.8 ? `rgba(255,240,205,${al})` : `rgba(255,255,255,${al})`; ctx.lineWidth = 1.5 - k * 0.3;
        ctx.beginPath(); ctx.ellipse(o.x, o.y, rr, rr * 0.26, 0, 0, 7); ctx.stroke();
      }
    }
    if (!calme) requestAnimationFrame(dessiner);
  }
  requestAnimationFrame(dessiner);
  if (calme) addEventListener('scroll', () => requestAnimationFrame(dessiner), { passive: true });

  // Les cartes apparaissent quand on arrive à elles ; les films jouent quand on les voit.
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('vu');
  }), { threshold: 0.12 });
  document.querySelectorAll('.apparait').forEach(el => io.observe(el));
  const films = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    // À la souris, les films de la grille dorment jusqu'à ce qu'on les survole (surprises.js).
    if (survol && v.closest('.tableaux')) { if (!e.isIntersecting) v.pause(); return; }
    if (e.isIntersecting && !calme) { v.play().catch(() => {}); } else { v.pause(); }
  }), { threshold: 0.25 });
  document.querySelectorAll('video').forEach(v => films.observe(v));
})();
