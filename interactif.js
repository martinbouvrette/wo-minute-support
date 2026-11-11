// LES TROIS BLOCS QU'ON TOUCHE (10 novembre 2026).
// B — le même temps, trois façons ; A — essaie-le, ici ; C — pour quel moment ?
// Les textes vivent dans la page (window.WM_TEXTES), le code est le même pour les deux langues.
(function () {
  const T = window.WM_TEXTES;
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cl = v => Math.min(1, Math.max(0, v));
  const lisse = v => { v = cl(v); return v * v * (3 - 2 * v); };
  const mixc = (a, b, f) => a.map((x, i) => x + (b[i] - x) * f);
  const rgba = (c, a = 1) => `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
  const hh = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const PALETTES = {
    corail:  { puce: '#ef8a5a', haut: [104,150,205], horizon: [247,196,146], mer: [70,108,150], voile: [239,138,90] },
    lavande: { puce: '#b58ce6', haut: [118,118,198], horizon: [228,186,222], mer: [82,80,150],  voile: [186,146,232] },
    menthe:  { puce: '#5fc9a2', haut: [84,160,176],  horizon: [214,234,196], mer: [48,118,128], voile: [96,206,164] },
    soleil:  { puce: '#f2c14e', haut: [96,148,214],  horizon: [250,222,150], mer: [52,98,156],  voile: [242,193,78] },
  };
  const NUIT = { haut: [10,14,46], horizon: [52,44,96], mer: [12,18,48] };

  // Le petit tableau : un voilier qui traverse pendant que le soleil se couche ; le phare s'allume à la fin.
  function tableau(cv, p, t, pal, fini) {
    const dpr = Math.min(2, devicePixelRatio || 1), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const k = Math.pow(cl(p), 1.3) * 0.92, hz = H * 0.6;
    const haut = mixc(pal.haut, NUIT.haut, k), hor = mixc(pal.horizon, NUIT.horizon, k), mer = mixc(pal.mer, NUIT.mer, k);
    let g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, rgba(haut)); g.addColorStop(1, rgba(hor));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 1);
    const nuit = lisse((p - 0.62) / 0.3);
    for (let i = 0; nuit > 0 && i < 60; i++) {
      ctx.fillStyle = `rgba(255,255,240,${nuit * (0.5 + 0.5 * Math.sin(t * 2 + i))})`;
      ctx.beginPath(); ctx.arc(hh(i) * W, hh(i * 3.1) * hz * 0.85, 0.6 + hh(i * 7) * 1.1, 0, 7); ctx.fill();
    }
    const R = Math.min(W, H) * 0.075, sx = W * 0.32, sy = H * 0.16 + (hz + R * 1.2 - H * 0.16) * lisse(p);
    const halo = ctx.createRadialGradient(sx, sy, R * 0.5, sx, sy, R * 4);
    halo.addColorStop(0, 'rgba(255,200,130,.45)'); halo.addColorStop(1, 'rgba(255,200,130,0)');
    ctx.fillStyle = halo; ctx.fillRect(sx - R * 4, sy - R * 4, R * 8, R * 8);
    ctx.fillStyle = 'rgb(255,204,132)'; ctx.beginPath(); ctx.arc(sx, sy, R, 0, 7); ctx.fill();
    ctx.fillStyle = rgba(mixc(haut, [20,20,40], 0.55));
    ctx.beginPath(); ctx.moveTo(W * 0.66, hz);
    for (let x = W * 0.66; x <= W; x += 6) ctx.lineTo(x, hz - H * 0.05 * Math.sin((x - W * 0.66) / (W * 0.34) * Math.PI));
    ctx.lineTo(W, hz); ctx.fill();
    g = ctx.createLinearGradient(0, hz, 0, H); g.addColorStop(0, rgba(mixc(mer, hor, 0.25))); g.addColorStop(1, rgba(mixc(mer, [0,0,0], 0.35)));
    ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
    const sc = W / 520;
    for (let r = 0; r < 12; r++) {
      const f = r / 12, y = hz + 5 + (H - hz) * f * f + f * 8, pas = (22 + f * 60) * sc, dec = (t * (8 + f * 18) * sc + r * 31) % pas;
      ctx.strokeStyle = rgba(mixc(hor, [255,255,255], 0.4), 0.14 + 0.28 * f); ctx.lineWidth = 1 + f * 1.8;
      for (let x = -pas + dec; x < W + pas; x += pas) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + pas * 0.25, y - 2 - f * 4, x + pas * 0.5, y); ctx.stroke(); }
    }
    const refA = 0.5 * (1 - lisse(p / 0.85));
    for (let i = 0; refA > 0.01 && i < 16; i++) {
      const y = hz + 4 + (H - hz) * (i / 16), l = (8 + 24 * hh(i * 3)) * sc * (1 + i / 14);
      ctx.fillStyle = `rgba(255,236,190,${refA * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.7))})`; ctx.fillRect(sx - l / 2, y, l, 2);
    }
    const px = W * 0.9, pb = hz - H * 0.035;
    ctx.fillStyle = 'rgba(240,235,225,.92)'; ctx.fillRect(px - 3 * sc, pb - 26 * sc, 6 * sc, 26 * sc);
    ctx.fillStyle = 'rgba(200,70,60,.9)'; ctx.fillRect(px - 3 * sc, pb - 18 * sc, 6 * sc, 5 * sc);
    if (fini) {
      const a = 0.6 + 0.4 * Math.sin(t * 2.4), gl = ctx.createRadialGradient(px, pb - 28 * sc, 0, px, pb - 28 * sc, 70 * sc);
      gl.addColorStop(0, `rgba(255,232,160,${a})`); gl.addColorStop(1, 'rgba(255,232,160,0)');
      ctx.fillStyle = gl; ctx.fillRect(px - 70 * sc, pb - 98 * sc, 140 * sc, 140 * sc);
    }
    const bx = W * (0.08 + 0.7 * cl(p)) + 3 * Math.sin(t * 0.8), by = hz + (H - hz) * 0.22 + 2 * Math.sin(t * 1.4);
    ctx.save(); ctx.translate(bx, by); ctx.scale(sc * 1.25, sc * 1.25); ctx.rotate(0.03 * Math.sin(t * 1.1));
    ctx.fillStyle = 'rgba(18,16,32,.92)';
    ctx.beginPath(); ctx.moveTo(-30, -6); ctx.lineTo(32, -6); ctx.quadraticCurveTo(22, 6, -22, 4); ctx.closePath(); ctx.fill();
    ctx.fillRect(-1, -62, 2.4, 56);
    ctx.fillStyle = rgba(pal.voile, .95); ctx.beginPath(); ctx.moveTo(1, -60); ctx.lineTo(1, -10); ctx.lineTo(28, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(246,236,216,.9)'; ctx.beginPath(); ctx.moveTo(-2, -54); ctx.lineTo(-2, -12); ctx.lineTo(-24, -12); ctx.closePath(); ctx.fill();
    if (nuit > 0.2) { ctx.fillStyle = `rgba(255,214,140,${nuit})`; ctx.beginPath(); ctx.arc(28, -16, 3, 0, 7); ctx.fill(); }
    ctx.restore();
  }

  // Le son : une note par cran, une cloche à la fin — jamais avant un geste du visiteur.
  let audio = null;
  function note(freq, dur = 0.25, vol = 0.08) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime;
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(audio.destination); o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  const GAMME = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3, 587.3, 659.3, 784.0, 880.0, 1046.5, 1174.7];
  const cloche = () => { [523.3, 659.3, 784.0].forEach((f, i) => setTimeout(() => note(f, 1.4, 0.07), i * 180)); };

  // Ne dessiner que ce qu'on voit.
  const visibles = new Set();
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? visibles.add(e.target) : visibles.delete(e.target)));
  const temps = now => calme ? 0 : now / 1000;

  // ─── B — Le même temps, trois façons ───
  (function () {
    const cv = document.getElementById('b-scene'); if (!cv) return;
    const ch = document.getElementById('b-chiffres'), secteur = document.getElementById('b-secteur');
    const q = document.getElementById('b-question'), go = document.getElementById('b-go');
    const crans = document.getElementById('b-crans');
    for (let i = 0; i < 60; i++) {
      const a = i / 60 * 2 * Math.PI, l = i % 5 ? 6 : 13, w = i % 5 ? 1.2 : 2.6;
      const x1 = 100 + 92 * Math.sin(a), y1 = 100 - 92 * Math.cos(a), x2 = 100 + (92 - l) * Math.sin(a), y2 = 100 - (92 - l) * Math.cos(a);
      crans.insertAdjacentHTML('beforeend', `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#3a3a3a" stroke-width="${w}"/>`);
    }
    // Le disque rouge : ce qui reste, de midi vers la gauche.
    function disque(f) {
      const R = 80;
      if (f >= 0.999) return `M100 ${100 - R} A${R} ${R} 0 1 0 100 ${100 + R} A${R} ${R} 0 1 0 100 ${100 - R} Z`;
      if (f <= 0.001) return '';
      const a = f * 2 * Math.PI, x = 100 - R * Math.sin(a), y = 100 - R * Math.cos(a);
      return `M100 100 L100 ${100 - R} A${R} ${R} 0 ${a > Math.PI ? 1 : 0} 0 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
    }
    const TOTAL = 20; let debut = null, fini = false;
    go.onclick = () => { debut = performance.now(); fini = false; q.textContent = ''; go.textContent = T.b.relancer; note(392, 0.3); };
    io.observe(cv);
    function boucle(now) {
      const e = debut === null ? 0 : (now - debut) / 1000, p = Math.min(1, e / TOTAL), s = Math.ceil(TOTAL * (1 - p));
      ch.textContent = '0:' + String(s).padStart(2, '0');
      secteur.setAttribute('d', disque(1 - p));
      if (debut !== null && e > 10 && e < 13) q.textContent = T.b.milieu;
      if (debut !== null && p >= 1 && !fini) { fini = true; q.textContent = T.b.fin; cloche(); }
      if (visibles.has(cv)) tableau(cv, p, temps(now), PALETTES.corail, fini);
      requestAnimationFrame(boucle);
    }
    requestAnimationFrame(boucle);
  })();

  // ─── A — Essaie-le, ici ───
  (function () {
    const cv = document.getElementById('a-scene'); if (!cv) return;
    const arc = document.getElementById('a-arc'), txt = document.getElementById('a-min');
    const rond = document.getElementById('a-rond'), reste = document.getElementById('a-reste'), fin = document.getElementById('a-fin');
    const go = document.getElementById('a-go'), anneau = document.getElementById('a-anneau');
    const C = 2 * Math.PI * 88, Cr = 2 * Math.PI * 24;
    arc.setAttribute('stroke-dasharray', C); reste.setAttribute('stroke-dasharray', Cr);
    const crans = document.getElementById('a-crans');
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * 2 * Math.PI;
      crans.insertAdjacentHTML('beforeend', `<circle cx="${(110 + 88 * Math.sin(a)).toFixed(1)}" cy="${(110 - 88 * Math.cos(a)).toFixed(1)}" r="2.5" fill="rgba(255,255,255,.55)"/>`);
    }
    let minutes = 3, pal = PALETTES.corail, etat = 'pret', ecoule = 0, dernier = 0;
    const DUREE_MINUTE = 5; // secondes : la démo est accélérée, et le dit à l'écran
    function poser(m, son) {
      m = Math.max(1, Math.min(12, m));
      if (m !== minutes && son) note(GAMME[m - 1]);
      minutes = m; txt.textContent = m; arc.setAttribute('stroke-dashoffset', C * (1 - m / 12));
      anneau.setAttribute('aria-valuenow', m);
    }
    poser(3);
    function depuisPointeur(e) {
      const r = anneau.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      let a = Math.atan2(x, -y); if (a < 0) a += 2 * Math.PI;
      poser(Math.ceil(a / (2 * Math.PI) * 12) || 12, true);
    }
    const libre = () => etat !== 'marche' && etat !== 'pause';
    let tient = false;
    anneau.addEventListener('pointerdown', e => { if (!libre()) return; tient = true; anneau.setPointerCapture(e.pointerId); depuisPointeur(e); });
    anneau.addEventListener('pointermove', e => { if (tient) depuisPointeur(e); });
    anneau.addEventListener('pointerup', () => tient = false);
    anneau.addEventListener('keydown', e => {
      if (!libre()) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { poser(minutes + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { poser(minutes - 1, true); e.preventDefault(); }
    });
    document.getElementById('a-moins').onclick = () => libre() && poser(minutes - 1, true);
    document.getElementById('a-plus').onclick = () => libre() && poser(minutes + 1, true);
    const zone = document.getElementById('a-couleurs');
    Object.entries(PALETTES).forEach(([cle, p]) => {
      const b = document.createElement('button'); b.className = 'puce-c' + (cle === 'corail' ? ' choisie' : '');
      b.style.background = p.puce; b.setAttribute('aria-label', T.a.couleurs[cle]);
      b.onclick = () => { pal = p; arc.setAttribute('stroke', p.puce); zone.querySelectorAll('.puce-c').forEach(x => x.classList.remove('choisie')); b.classList.add('choisie'); };
      zone.appendChild(b);
    });
    function iconePause(enPause) {
      document.getElementById('a-icone-pause').style.display = enPause ? 'none' : '';
      document.getElementById('a-icone-jouer').style.display = enPause ? '' : 'none';
      rond.setAttribute('aria-label', enPause ? T.a.reprendre : T.a.pause);
    }
    go.onclick = () => {
      if (!libre()) { etat = 'pret'; ecoule = 0; rond.classList.remove('vu'); go.textContent = T.a.parti; fin.classList.remove('vu'); return; }
      etat = 'marche'; ecoule = 0; dernier = performance.now(); fin.classList.remove('vu');
      rond.classList.add('vu'); iconePause(false); go.textContent = T.a.recommencer; note(392, 0.3);
    };
    rond.onclick = () => {
      if (etat === 'marche') { etat = 'pause'; iconePause(true); }
      else if (etat === 'pause') { etat = 'marche'; dernier = performance.now(); iconePause(false); }
    };
    io.observe(cv);
    function boucle(now) {
      if (etat === 'marche') { ecoule += (now - dernier) / 1000; dernier = now; }
      const p = etat === 'pret' ? 0 : Math.min(1, ecoule / (minutes * DUREE_MINUTE));
      if (etat === 'marche' && p >= 1) { etat = 'fini'; rond.classList.remove('vu'); fin.classList.add('vu'); go.textContent = T.a.parti; cloche(); }
      reste.setAttribute('stroke-dashoffset', Cr * p);
      if (visibles.has(cv)) tableau(cv, p, temps(now), pal, etat === 'fini');
      requestAnimationFrame(boucle);
    }
    requestAnimationFrame(boucle);
  })();

  // ─── C — Pour quel moment ? ───
  (function () {
    const zone = document.getElementById('c-moments'); if (!zone) return;
    const v = document.getElementById('c-video');
    function montrer(i) {
      const m = T.c[i];
      zone.querySelectorAll('button').forEach((b, j) => { b.classList.toggle('choisi', i === j); b.setAttribute('aria-pressed', i === j); });
      v.poster = `/scenes/${m.video}.jpg`; v.src = `/scenes/${m.video}.mp4`;
      if (!calme) v.play().catch(() => {});
      document.getElementById('c-tableau').innerHTML = m.tableau;
      document.getElementById('c-duree').textContent = m.duree;
      document.getElementById('c-gestes').innerHTML = m.gestes.map(g => `<li>${g}</li>`).join('');
    }
    T.c.forEach((m, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = m.nom; b.onclick = () => montrer(i); zone.appendChild(b); });
    montrer(0);
  })();
})();
