// LE VRAI VOILIER DE L'APP, POUR LE SITE (10 novembre 2026).
// Port fidèle de VaguesView.swift (Wo Minute 2.0) : les quatre heures de l'estampe
// et leurs dix encres, le fondu par la TEINTE, le ciel bokashi, les nuages en bandes,
// les îles, les pins, le phare (72 %), la lune (80 %), les vagues gravées, la houle,
// le reflet du soleil, le voilier qui dérive puis affale (90 %) et allume sa lanterne
// (93 %), la grève et son écume, le grain du papier. Même maquette : 360 × 640.
// Ce qui n'y est pas (encore) : dauphins, oiseaux, poissons volants, barque, baleine,
// coquillages, étoile filante — les apparitions minutées du minuteur.
(function () {
  const cl = v => Math.min(1, Math.max(0, v));
  const frac = v => v - Math.floor(v);
  const hh = n => frac(Math.sin(n * 127.1 + 311.7) * 43758.5453);

  // ─── Une couleur en teinte-saturation-luminosité (comme TeinteHSB) ───
  function depuisRGB(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d > 0) {
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h /= 6; if (h < 0) h += 1;
    }
    return { h, s: mx === 0 ? 0 : d / mx, b: mx };
  }
  const depuisHex = x => depuisRGB(((x >> 16) & 255) / 255, ((x >> 8) & 255) / 255, (x & 255) / 255);
  function rgb(c) {
    const h = frac(c.h) * 6, s = c.s, v = c.b, i = Math.floor(h), f = h - i;
    const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
    const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
  const col = (c, a = 1) => { const [r, g, b] = rgb(c); return `rgba(${r},${g},${b},${a})`; };
  const lum = (c, d) => ({ h: c.h, s: c.s, b: cl(c.b + d) });
  function vers(a, o, f) {
    let dh = o.h - a.h; if (dh > 0.5) dh -= 1; if (dh < -0.5) dh += 1;
    return { h: frac(a.h + dh * f), s: a.s + (o.s - a.s) * f, b: a.b + (o.b - a.b) * f };
  }

  // Quatre heures, de l'après-midi à la nuit tombée.
  // Ordre : haut, milieu, horizon, soleil, mer, fond, îles lointaines, île proche, voile, encre.
  const NOMS = ['haut', 'milieu', 'horizon', 'soleil', 'mer', 'fond', 'loin', 'proche', 'voile', 'encre'];
  const HEURES = [
    [0.0,  [0x86AAC4, 0xCDD8CF, 0xF1E3BD, 0xFFF3CF, 0x6593A6, 0x2E586F, 0xA3B6B9, 0x6C878B, 0xEFE4C8, 0x2A3140]],
    [0.5,  [0x6D8FB1, 0xE8CA96, 0xF6B36B, 0xFFD47C, 0x6F8999, 0x334F69, 0xB59B8B, 0x7A6D72, 0xF3CF98, 0x2B2733]],
    [0.82, [0x3C4B7A, 0xD88878, 0xEF8A4C, 0xF2603B, 0x6B5F7B, 0x2A3251, 0x8D6B7C, 0x574862, 0xF09A62, 0x1F1A2A]],
    [1.0,  [0x1B2143, 0x463C69, 0xB25E5A, 0xC4443A, 0x2E3457, 0x131932, 0x3B385A, 0x282644, 0x5A4A62, 0x0F0E1C]],
  ].map(([p, v]) => [p, v.map(depuisHex)]);
  function heure(p) {
    let i = 0;
    while (i < HEURES.length - 2 && p > HEURES[i + 1][0]) i++;
    const [pa, a] = HEURES[i], [pb, b] = HEURES[i + 1], f = cl((p - pa) / (pb - pa));
    const C = {}; NOMS.forEach((n, k) => C[n] = vers(a[k], b[k], f)); return C;
  }

  // ─── Le grain du papier : bruit, fibres, veines du bois (calculé une fois) ───
  let papier = null;
  function grain() {
    if (papier) return papier;
    const n = 256, c = document.createElement('canvas'); c.width = c.height = n;
    const x = c.getContext('2d'), img = x.createImageData(n, n);
    let s = 0x7F4A7C15 | 0;
    const alea = () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 10000) / 10000; };
    for (let i = 0; i < n * n; i++) {
      const v = Math.min(255, Math.max(0, 128 + (alea() - 0.5) * 34));
      img.data[i * 4] = v; img.data[i * 4 + 1] = v; img.data[i * 4 + 2] = v * 0.97; img.data[i * 4 + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    x.lineWidth = 0.5; x.strokeStyle = 'rgba(255,255,255,.18)';
    for (let i = 0; i < 110; i++) {
      const px = alea() * n, py = alea() * n, a = alea() * Math.PI, l = 4 + alea() * 14;
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
    }
    x.strokeStyle = 'rgba(0,0,0,.07)';
    for (let y = 0; y < n; y += 2 + alea() * 5) {
      x.beginPath(); x.moveTo(0, y);
      for (let px = 16; px <= n; px += 16) x.lineTo(px, y + Math.sin(px * 0.02 + y) * 1.5);
      x.stroke();
    }
    return (papier = c);
  }

  // ─── Où est le voilier, selon l'avancée (il entre par la droite, dérive vers son mouillage) ───
  function bateauX(p, W, u) {
    const xDepart = 1 + 70 * u / W, xEntree = 0.92, xFin = 0.60, entree = 0.05;
    if (p < entree) { const pe = p / entree; return xDepart + (xEntree - xDepart) * (1 - (1 - pe) * (1 - pe)); }
    return xEntree + (xFin - xEntree) * cl((p - entree) / (1 - entree));
  }

  // ─── Le voilier de l'estampe (jonque) : proue à gauche ───
  function jonque(ctx, x, y, rot, s, C, voile, lift, lant) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(-s, s);
    const ink = col(C.encre);
    ctx.strokeStyle = ink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(0, -122); ctx.stroke();
    const bot = -16, top = bot - 100 * lift, bel = 6 * lift, mid = (top + bot) / 2;
    const v = new Path2D();
    v.moveTo(-36, top); v.lineTo(36, top); v.quadraticCurveTo(36 + bel, mid, 36, bot);
    v.lineTo(-36, bot); v.quadraticCurveTo(-36 + bel, mid, -36, top); v.closePath();
    const g = ctx.createLinearGradient(-36, 0, 36, 0); g.addColorStop(0, col(lum(voile, -0.07))); g.addColorStop(1, col(lum(voile, 0.04)));
    ctx.fillStyle = g; ctx.fill(v);
    ctx.save(); ctx.clip(v);
    ctx.strokeStyle = col(C.encre, 0.22); ctx.lineWidth = 1; ctx.beginPath();
    for (let i = -24; i <= 24; i += 12) { ctx.moveTo(i, top); ctx.quadraticCurveTo(i + bel * 0.6, mid, i, bot); }
    ctx.stroke(); ctx.restore();
    ctx.strokeStyle = col(C.encre, 0.7); ctx.lineWidth = 1.1; ctx.stroke(v);
    ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, top); ctx.lineTo(40, top); ctx.stroke();
    if (lift < 1) { ctx.fillStyle = col(lum(voile, -0.12)); ctx.fillRect(-38, bot - 2, 76, 2 + 6 * (1 - lift)); }
    ctx.fillStyle = ink; ctx.beginPath();
    ctx.moveTo(-54, -6); ctx.quadraticCurveTo(0, -2, 58, -14); ctx.lineTo(50, -4); ctx.quadraticCurveTo(10, 10, -44, 6); ctx.closePath(); ctx.fill();
    ctx.fillRect(-50, -14, 16, 9);
    if (lant > 0) {
      ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-44, -12); ctx.lineTo(-44, -32); ctx.lineTo(-52, -32); ctx.stroke();
      const gl = ctx.createRadialGradient(-52, -26, 0, -52, -26, 30);
      gl.addColorStop(0, `rgba(255,209,120,${0.6 * lant})`); gl.addColorStop(1, 'rgba(255,209,120,0)');
      ctx.fillStyle = gl; ctx.beginPath(); ctx.ellipse(-52, -26, 30, 30, 0, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,227,166,${lant})`; ctx.fillRect(-55, -30, 6, 8);
    }
    ctx.restore();
  }

  function bande(ctx, x, y, len, th) {
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + len * 0.5, y - th, x + len, y);
    ctx.quadraticCurveTo(x + len * 0.5, y + th * 0.4, x, y); ctx.fill();
  }

  /**
   * Dessine l'estampe dans ctx, sur W × H (pixels CSS).
   * o.p : l'avancée 0…1 · o.t : secondes réelles (vagues, nuages, tangage)
   * o.accent : [r,g,b] 0…255 qui teinte la voile · o.papier : poser le grain (défaut oui)
   */
  function dessiner(ctx, W, H, o) {
    const p = cl(o.p || 0), now = o.t || 0;
    const u = Math.min(W / 360, H / 640);
    const C = heure(p);
    const acc = depuisRGB(...(o.accent || [239, 138, 90]).map(v => v / 255));
    const voile = vers(C.voile, { h: acc.h, s: Math.min(0.38, Math.max(C.voile.s, acc.s * 0.5)), b: C.voile.b }, 0.35);
    const yH = 0.46 * H, shoreY = H - 26 * u;

    // Ciel, en dégradé ; le haut s'assombrit comme un bokashi imprimé.
    let g = ctx.createLinearGradient(0, 0, 0, yH);
    g.addColorStop(0, col(C.haut)); g.addColorStop(0.58, col(C.milieu)); g.addColorStop(1, col(C.horizon));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, yH + 1);
    g = ctx.createLinearGradient(0, 0, 0, yH * 0.35); g.addColorStop(0, col(C.encre, 0.3)); g.addColorStop(1, col(C.encre, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, yH * 0.35);

    // Les premières étoiles, à la nuit tombante.
    if (p > 0.84) {
      const v = (p - 0.84) / 0.16;
      for (let i = 0; i < 26; i++) {
        const a = cl(v * 1.6 - hh(i * 3.3) * 0.6); if (a <= 0) continue;
        ctx.fillStyle = `rgba(255,245,219,${a * 0.85})`;
        ctx.fillRect(hh(i * 1.7) * W, hh(i * 9.1) * yH * 0.55, 1.6 * u, 1.6 * u);
      }
    }

    // Le soleil, disque plat ; il touche l'horizon puis s'y couche pile à la fin.
    const sR = 27 * u, sX = 0.34 * W, sY = H * 0.15 + (yH + sR * 1.1 - H * 0.15) * p;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, yH); ctx.clip();
    g = ctx.createRadialGradient(sX, sY, sR * 0.8, sX, sY, sR * 3.2);
    g.addColorStop(0, col(C.soleil, 0.35)); g.addColorStop(1, col(C.soleil, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, yH);
    ctx.fillStyle = col(lum({ h: C.soleil.h, s: Math.min(1, C.soleil.s + 0.12), b: C.soleil.b }, 0.06));
    ctx.beginPath(); ctx.arc(sX, sY, sR, 0, 7); ctx.fill();
    // La lune se lève derrière les îles, à partir de 80 %.
    if (p > 0.8) {
      const q = (p - 0.8) / 0.2, mR = 13 * u, mX = 0.80 * W, mY = yH + mR - (yH + mR - H * 0.20) * q;
      g = ctx.createRadialGradient(mX, mY, mR, mX, mY, mR * 3.2);
      g.addColorStop(0, 'rgba(255,245,217,.22)'); g.addColorStop(1, 'rgba(255,245,217,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mX, mY, mR * 3.2, 0, 7); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(mX, mY, mR, 0, 7); ctx.clip();
      ctx.fillStyle = 'rgb(255,242,209)'; ctx.beginPath();
      ctx.rect(mX - mR - 2, mY - mR - 2, 2 * mR + 4, 2 * mR + 4);
      ctx.ellipse(mX + mR * 0.55, mY - mR * 0.22, mR, mR, 0, 0, 7);
      ctx.fill('evenodd'); ctx.restore();
    }
    // Nuages en longues bandes, qui passent devant le soleil.
    for (let i = 0; i < 3; i++) {
      const cy = yH * (0.30 + 0.17 * i), len = W * (0.55 + 0.12 * i);
      const cx = (frac(now * 0.004 * (1 + i * 0.4) + i * 0.41) * 1.6 - 0.3) * W, th = (6 + 3 * i) * u;
      ctx.fillStyle = col(lum(vers(C.milieu, C.soleil, (0.2 + 0.2 * i) * (1 - p)), 0.03 + 0.04 * p), 0.8);
      bande(ctx, cx, cy, len, th);
      ctx.fillStyle = col(C.horizon, 0.55 * (1 - 0.6 * p));
      bande(ctx, cx + len * 0.12, cy + th * 0.5, len * 0.7, th * 0.45);
    }
    ctx.restore();

    // Les îles : au loin à droite, une plus proche à gauche, avec ses pins.
    const hLoin = q => Math.max(0, 16 * Math.sin(q * Math.PI) * (0.7 + 0.3 * Math.sin(q * 9)) + 6 * Math.sin(q * 23) * Math.sin(q * Math.PI)) * u;
    ctx.fillStyle = col(C.loin); ctx.beginPath(); ctx.moveTo(W * 0.5, yH);
    for (let x = W * 0.5; x <= W + 3; x += 3) ctx.lineTo(x, yH - hLoin((x - W * 0.5) / (W * 0.5)));
    ctx.lineTo(W, yH + 1); ctx.closePath(); ctx.fill();
    // Le phare : une tour pâle le jour, qui s'allume à 72 % et respire lentement.
    const fX = 0.86 * W, fBase = yH - hLoin(0.72) + u;
    ctx.fillStyle = col(lum(C.milieu, 0.12)); ctx.fillRect(fX - 1.8 * u, fBase - 11 * u, 3.6 * u, 11 * u);
    ctx.fillStyle = col(C.encre); ctx.fillRect(fX - 2.4 * u, fBase - 13 * u, 4.8 * u, 2.4 * u);
    if (p > 0.72) {
      const a = cl((p - 0.72) / 0.03) * (0.65 + 0.35 * Math.sin(2 * Math.PI * now / 6));
      g = ctx.createRadialGradient(fX, fBase - 9 * u, 0, fX, fBase - 9 * u, 18 * u);
      g.addColorStop(0, `rgba(255,219,140,${0.85 * a})`); g.addColorStop(1, 'rgba(255,219,140,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fX, fBase - 9 * u, 18 * u, 0, 7); ctx.fill();
      ctx.fillStyle = `rgba(255,219,140,${a})`; ctx.fillRect(fX - 1.6 * u, fBase - 10.5 * u, 3.2 * u, 3 * u);
      for (let j = 0; j < 6; j++) {
        ctx.fillStyle = `rgba(255,219,140,${a * 0.5 * (1 - j / 6)})`;
        ctx.fillRect(fX - 1.2 * u + 1.5 * u * Math.sin(now * 2 + j), yH + (3 + 5 * j) * u, 2.4 * u, 1.6 * u);
      }
    }
    const hProche = q => 34 * Math.pow(1 - q, 0.8) * (0.85 + 0.15 * Math.sin(q * 14)) * u;
    ctx.fillStyle = col(C.proche); ctx.beginPath(); ctx.moveTo(-2, yH + 1);
    for (let x = 0; x <= W * 0.26; x += 3) ctx.lineTo(x, yH - hProche(x / (W * 0.26)));
    ctx.lineTo(W * 0.26, yH + 1); ctx.closePath(); ctx.fill();
    ctx.fillStyle = col(lum(C.proche, -0.06)); ctx.beginPath();
    for (const [fx, hp] of [[0.10, 14], [0.17, 11], [0.24, 9]]) {
      const px = fx * W, base = yH - hProche(fx / 0.26) + 2 * u, ht = hp * u;
      ctx.moveTo(px - ht * 0.4, base); ctx.lineTo(px, base - ht); ctx.lineTo(px + ht * 0.4, base); ctx.closePath();
    }
    ctx.fill();

    // La mer, et le liseré clair de l'horizon.
    g = ctx.createLinearGradient(0, yH, 0, H); g.addColorStop(0, col(C.mer)); g.addColorStop(1, col(C.fond));
    ctx.fillStyle = g; ctx.fillRect(0, yH, W, H - yH);
    ctx.fillStyle = col(C.horizon, 0.45); ctx.fillRect(0, yH, W, 2.5 * u);

    // Reflet du soleil en traits brisés ; il s'éteint quand le disque passe sous l'horizon.
    const refl = cl((yH - sY + sR) / (2 * sR)), basReflet = yH + (shoreY - yH) * 0.62;
    for (let yy = yH + 3 * u; yy < basReflet; yy += 5 * u) {
      const f = (yy - yH) / (basReflet - yH);
      const w = sR * (1.2 - 0.6 * f) * (0.55 + 0.45 * Math.sin(now * 1.7 + (yy / u) * 0.37));
      const a = (1 - f) * (0.85 * refl + 0.22 * (1 - refl));
      if (a > 0.02) {
        const gap = w * 0.3 * (0.5 + 0.5 * Math.sin(now * 2.3 + yy));
        ctx.fillStyle = col(lum(C.soleil, 0.05), a);
        ctx.fillRect(sX - w, yy, w - gap / 2, 2 * u); ctx.fillRect(sX + gap / 2, yy, w - gap / 2, 2 * u);
      }
    }

    // Les vagues gravées : rangées de petits traits courbes, serrées au loin, larges devant.
    const clair = col(vers(lum({ h: C.mer.h, s: C.mer.s * 0.7, b: C.mer.b }, 0.2), C.horizon, 0.2), 0.7);
    const sombre = col(C.fond, 0.55), profondeur = shoreY - yH - 4 * u;
    ctx.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const f = (i + 0.5) / 24, y = yH + 4 * u + profondeur * Math.pow(f, 1.75), s = 0.3 + 1.7 * f, sp = 40 * s * u;
      const base = now * 5 * s * u + hh(i) * sp * 7, idx = Math.floor(base / sp), off = base - idx * sp;
      const pc = new Path2D(), ps = new Path2D();
      for (let k = 0; off + (k - 1) * sp < W + sp; k++) {
        const x0 = off + (k - 1) * sp, id = k - idx;
        const hl = 13 * s * u * (0.55 + 0.8 * hh(i * 31 + id * 7)), y0 = y + 0.8 * s * u * Math.sin(now * 1.3 + id + i);
        pc.moveTo(x0, y0); pc.quadraticCurveTo(x0 + hl / 2, y0 - 2 * s * u, x0 + hl, y0);
        const x2 = x0 + sp * 0.5, h2 = hl * 0.7;
        ps.moveTo(x2, y0 + 1.5 * s * u); ps.quadraticCurveTo(x2 + h2 / 2, y0 - 0.5 * s * u, x2 + h2, y0 + 1.5 * s * u);
      }
      ctx.lineWidth = Math.max(0.6, 1.1 * s * u);
      ctx.strokeStyle = clair; ctx.stroke(pc); ctx.strokeStyle = sombre; ctx.stroke(ps);
    }

    // La houle : toutes les 2 secondes, une crête claire part de l'horizon et vient mourir sur la grève.
    const crete = { h: C.mer.h, s: C.mer.s * 0.6, b: C.mer.b };
    for (let k = Math.floor((now - 9) / 2); k <= Math.floor(now / 2); k++) {
      const naissance = k * 2, age = now - naissance;
      if (age < 0 || age > 9) continue;
      const q = age / 9, y = yH + 4 * u + profondeur * Math.pow(q, 1.75), s = 0.3 + 1.7 * q, sp = 40 * s * u;
      const off = (now * 5 * s * u + frac(naissance * 0.37) * sp) % sp;
      const pa = new Path2D();
      for (let x0 = off - sp; x0 < W + sp; x0 += sp) { const hl = 22 * s * u; pa.moveTo(x0, y); pa.quadraticCurveTo(x0 + hl / 2, y - 2.6 * s * u, x0 + hl, y); }
      ctx.strokeStyle = col(vers(lum(crete, 0.3), C.horizon, 0.25), 0.15 + 0.5 * q * q); ctx.lineWidth = 1.5 * s * u; ctx.stroke(pa);
    }

    // Un second voilier, au loin, pour la profondeur.
    jonque(ctx, W * (0.80 - 0.06 * p), yH + 6 * u + 0.6 * u * Math.sin(now * 1.1), 0.01 * Math.sin(now * 0.8), 0.26 * u, C, voile, 1, 0);

    // Le voilier : il dérive vers son mouillage ; à la fin, la voile s'abaisse et la lanterne s'allume.
    if (o.bateau !== false) {
      const bx = bateauX(p, W, u) * W, by = yH + (shoreY - yH) * 0.33 + 1.8 * u * Math.sin(now * 1.25);
      const lift = p < 0.9 ? 1 : Math.max(0.22, 1 - (p - 0.9) / 0.1 * 0.78), lant = cl((p - 0.93) / 0.05);
      for (let j = 0; j < 6; j++) {
        ctx.fillStyle = col(C.encre, 0.35 * (1 - j / 6));
        ctx.fillRect(bx - 42 * u + 3 * u * Math.sin(now * 2 + j), by + (7 + 5 * j) * u, 84 * u * (1 - j * 0.09), 2 * u);
      }
      if (lant > 0) for (let j = 0; j < 9; j++) {
        ctx.fillStyle = `rgba(255,204,120,${lant * 0.6 * (1 - j / 9)})`;
        ctx.fillRect(bx + 52 * u - 2 * u + 2 * u * Math.sin(now * 2.4 + j), by + (8 + 6 * j) * u, 4 * u, 2.5 * u);
      }
      jonque(ctx, bx, by, 0.03 * Math.sin(now * 0.95), u, C, voile, lift, lant);
    }

    // La grève : une bande de sable au premier plan, frangée d'écume.
    const sable = vers({ h: 0.09, s: 0.28, b: 0.86 - 0.55 * p }, C.horizon, 0.18);
    const greve = new Path2D(), ecume = new Path2D();
    greve.moveTo(0, H + 1);
    for (let x = 0; x <= W + 6; x += 6) {
      const ye = shoreY + 4 * u * Math.sin((x / W) * Math.PI * 5 + now * 2 + 3);
      greve.lineTo(x, ye); x === 0 ? ecume.moveTo(x, ye) : ecume.lineTo(x, ye);
    }
    greve.lineTo(W + 6, H + 1); greve.closePath();
    g = ctx.createLinearGradient(0, shoreY, 0, H); g.addColorStop(0, col(sable)); g.addColorStop(1, col(lum(sable, -0.12)));
    ctx.fillStyle = g; ctx.fill(greve);
    ctx.strokeStyle = `rgba(255,255,255,${0.45 - 0.2 * p})`; ctx.lineWidth = 1.5 * u; ctx.stroke(ecume);

    // Le papier : lumière douce, puis un voile de multiplication.
    if (o.papier !== false) {
      const pat = ctx.createPattern(grain(), 'repeat');
      pat.setTransform(new DOMMatrix().scale(0.5));
      ctx.save();
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = 0.9; ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.1; ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
    return { yH, shoreY, u };
  }

  window.WMEstampe = { dessiner, grain };
})();
