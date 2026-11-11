// LE CIEL QUI DÉFILE : la page fait ce que fait l'app. En descendant, le
// temps passe — l'après-midi, le couchant, la nuit, ses étoiles et son aurore,
// puis l'aube au bas de la page. Une mer à l'estampe, un voilier qui traverse.
(function(){
  const cv = document.getElementById('ciel'), ctx = cv.getContext('2d');
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1;
  function taille(){ dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', taille); taille();
  const hh = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
  const cl = v => Math.min(1, Math.max(0, v));
  const lisse = v => { v = cl(v); return v * v * (3 - 2 * v); };
  const mix = (a, b, f) => a.map((x, i) => x + (b[i] - x) * f);
  const rgb = c => `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
  // Les heures du ciel : [haut, horizon, mer]
  const heures = [
    [0.00, [104,150,205], [247,214,168], [70,108,150]],
    [0.22, [88,96,170],   [246,150,104], [62,70,120]],
    [0.40, [40,40,96],    [176,96,122],  [34,36,80]],
    [0.58, [10,14,46],    [28,36,82],    [12,18,48]],
    [0.82, [6,9,32],      [22,32,72],    [8,14,40]],
    [1.00, [92,110,180],  [246,186,156], [70,84,140]],
  ];
  function heure(p){
    for (let i = 0; i < heures.length - 1; i++) {
      const a = heures[i], b = heures[i + 1];
      if (p <= b[0]) { const f = lisse((p - a[0]) / (b[0] - a[0])); return [mix(a[1], b[1], f), mix(a[2], b[2], f), mix(a[3], b[3], f)]; }
    }
    const z = heures[heures.length - 1]; return [z[1], z[2], z[3]];
  }
  let pLisse = 0;
  function dessiner(t){
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const pCible = cl(scrollY / max);
    pLisse += (pCible - pLisse) * (calme ? 1 : 0.08);
    const p = pLisse, now = calme ? 0 : t / 1000;
    const hz = H * 0.66;
    const [haut, horizon, mer] = heure(p);
    // Le ciel.
    let g = ctx.createLinearGradient(0, 0, 0, hz);
    g.addColorStop(0, rgb(haut)); g.addColorStop(1, rgb(horizon));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 1);
    // Les étoiles, puis l'aurore.
    const nuit = lisse((p - 0.42) / 0.14) * (1 - lisse((p - 0.9) / 0.08));
    if (nuit > 0) {
      for (let i = 0; i < 160; i++) {
        const x = hh(i * 1.3) * W, y = hh(i * 2.9) * hz * 0.92, r = (0.5 + hh(i * 4.1) * 1.2) * (0.7 + 0.3 * Math.sin(now * (1 + hh(i)) + i));
        ctx.fillStyle = `rgba(255,255,245,${0.85 * nuit})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      const ef = (now / 6) % 1;
      if (ef < 0.08 && p > 0.5 && p < 0.88) {
        const a = ef / 0.08, x = W * (0.2 + 0.5 * a), y = H * (0.1 + 0.1 * a);
        const gr = ctx.createLinearGradient(x, y, x - 90, y - 26);
        gr.addColorStop(0, `rgba(255,255,255,${0.9 * nuit})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = gr; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 90, y - 26); ctx.stroke();
      }
      const aurore = lisse((p - 0.64) / 0.08) * (1 - lisse((p - 0.86) / 0.06));
      if (aurore > 0) {
        for (let b = 0; b < 4; b++) {
          ctx.beginPath();
          for (let x = 0; x <= W; x += 10) {
            const y = H * (0.14 + 0.06 * b) + 26 * Math.sin(x / 140 + now * 0.35 + b) + 12 * Math.sin(x / 47 + now * 0.6);
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.strokeStyle = b % 2 ? `rgba(120,255,190,${0.16 * aurore})` : `rgba(150,120,255,${0.12 * aurore})`;
          ctx.lineWidth = 34 - b * 4; ctx.stroke();
        }
      }
    }
    // Le soleil qui se couche, la lune qui monte, le soleil de l'aube.
    const soleilY = hz - H * 0.48 * (1 - lisse(p / 0.4)) + H * 0.06;
    const astre = (x, y, r, c, halo) => {
      const gh = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * 4);
      gh.addColorStop(0, `rgba(${c},${halo})`); gh.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = gh; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
      ctx.fillStyle = `rgb(${c})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    };
    const R = Math.min(W, H) * 0.06;
    if (p < 0.45) astre(W * 0.3, soleilY, R, '255,196,120', 0.45);
    const lune = lisse((p - 0.5) / 0.15) * (1 - lisse((p - 0.92) / 0.06));
    if (lune > 0) { ctx.globalAlpha = lune; astre(W * 0.76, hz - H * 0.42 * lune, R * 0.7, '255,248,224', 0.25); ctx.globalAlpha = 1; }
    const aube = lisse((p - 0.9) / 0.1);
    if (aube > 0) astre(W * 0.62, hz + H * 0.05 - H * 0.14 * aube, R, '255,210,150', 0.5 * aube);
    // Les îles au loin.
    ctx.fillStyle = rgb(mix(haut, [20, 20, 40], 0.55));
    ctx.beginPath(); ctx.moveTo(0, hz);
    for (let x = 0; x <= W * 0.36; x += 8) ctx.lineTo(x, hz - H * 0.05 * Math.sin(x / (W * 0.36) * Math.PI) - 6 * Math.sin(x / 30));
    ctx.lineTo(W * 0.36, hz); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W * 0.62, hz);
    for (let x = W * 0.62; x <= W; x += 8) ctx.lineTo(x, hz - H * 0.025 * Math.sin((x - W * 0.62) / (W * 0.38) * Math.PI));
    ctx.lineTo(W, hz); ctx.closePath(); ctx.fill();
    // Le phare, qui s'allume à la nuit.
    const px = W * 0.88, pb = hz - H * 0.02;
    ctx.fillStyle = 'rgba(240,235,225,0.9)'; ctx.fillRect(px - 3, pb - 22, 6, 22);
    if (nuit > 0.1) {
      const a = Math.sin(now * 1.4) * 0.5 + 0.5;
      const gl = ctx.createRadialGradient(px, pb - 24, 0, px, pb - 24, 40);
      gl.addColorStop(0, `rgba(255,230,160,${0.8 * nuit * a})`); gl.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = gl; ctx.fillRect(px - 40, pb - 64, 80, 80);
    }
    // La mer et ses vagues gravées.
    g = ctx.createLinearGradient(0, hz, 0, H);
    g.addColorStop(0, rgb(mix(mer, horizon, 0.25))); g.addColorStop(1, rgb(mix(mer, [0, 0, 0], 0.35)));
    ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
    const clair = rgb(mix(horizon, [255, 255, 255], 0.4));
    for (let r = 0; r < 18; r++) {
      const f = r / 18, y = hz + 6 + (H - hz) * f * f * 1.0 + f * 12;
      const pas = 26 + f * 70, dec = (now * (8 + f * 20) + r * 37) % pas;
      ctx.strokeStyle = r % 3 === 0 ? `rgba(255,255,255,${0.12 + 0.2 * f})` : clair.replace('rgb', 'rgba').replace(')', `,${0.16 + 0.3 * f})`);
      ctx.lineWidth = 1 + f * 2.2;
      for (let x = -pas + dec; x < W + pas; x += pas) {
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + pas * 0.25, y - 2 - f * 5, x + pas * 0.5, y); ctx.stroke();
      }
    }
    // Le chemin de lumière de l'astre sur l'eau.
    const refX = p < 0.45 ? W * 0.3 : (aube > 0 ? W * 0.62 : W * 0.76);
    const refA = p < 0.45 ? 0.5 * (1 - lisse((p - 0.3) / 0.15)) : Math.max(lune * 0.4, aube * 0.5);
    if (refA > 0.01) {
      for (let i = 0; i < 26; i++) {
        const y = hz + 4 + (H - hz) * (i / 26), l = (10 + 30 * hh(i * 3)) * (1 + i / 20);
        const a = 0.5 + 0.5 * Math.sin(now * 3 + i * 1.7);
        ctx.fillStyle = `rgba(255,236,190,${refA * a * (1 - i / 30)})`;
        ctx.fillRect(refX - l / 2 + 6 * Math.sin(now + i), y, l, 2);
      }
    }
    // Le voilier qui traverse au fil de la lecture, sa lanterne la nuit.
    const bx = W * (0.08 + 0.84 * p) + 4 * Math.sin(now * 0.7), by = hz + (H - hz) * 0.16 + 2 * Math.sin(now * 1.3);
    const s = Math.max(0.7, Math.min(1.4, W / 900));
    ctx.save(); ctx.translate(bx, by); ctx.scale(s, s); ctx.rotate(0.03 * Math.sin(now * 1.1));
    ctx.fillStyle = 'rgba(18,16,32,0.92)';
    ctx.beginPath(); ctx.moveTo(-30, -6); ctx.lineTo(32, -6); ctx.quadraticCurveTo(22, 6, -22, 4); ctx.closePath(); ctx.fill();
    ctx.fillRect(-1, -62, 2.4, 56);
    ctx.fillStyle = 'rgba(239,138,90,0.95)';
    ctx.beginPath(); ctx.moveTo(1, -60); ctx.lineTo(1, -10); ctx.lineTo(28, -12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(246,236,216,0.9)';
    ctx.beginPath(); ctx.moveTo(-2, -54); ctx.lineTo(-2, -12); ctx.lineTo(-24, -12); ctx.closePath(); ctx.fill();
    if (nuit > 0.2) { ctx.fillStyle = `rgba(255,214,140,${nuit})`; ctx.beginPath(); ctx.arc(28, -16, 3.2, 0, 7); ctx.fill(); }
    ctx.restore();
    // Les oiseaux de l'après-midi.
    if (p < 0.3) {
      ctx.strokeStyle = `rgba(30,30,50,${0.6 * (1 - p / 0.3)})`; ctx.lineWidth = 1.6;
      for (let o = 0; o < 4; o++) {
        const ox = ((now * 22 + o * 90) % (W + 120)) - 60, oy = H * (0.22 + 0.03 * (o % 2)), b = Math.sin(now * 7 + o) * 5;
        ctx.beginPath(); ctx.moveTo(ox - 8, oy - b); ctx.quadraticCurveTo(ox - 3, oy - 3, ox, oy); ctx.quadraticCurveTo(ox + 3, oy - 3, ox + 8, oy - b); ctx.stroke();
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
    if (e.isIntersecting && !calme) { v.play().catch(() => {}); } else { v.pause(); }
  }), { threshold: 0.25 });
  document.querySelectorAll('video').forEach(v => films.observe(v));
})();
