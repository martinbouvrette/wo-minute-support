// CE QUI RÉPOND AU VISITEUR (10 novembre 2026).
// Les tableaux s'éveillent quand on les survole ; une souris sort parfois du bord d'une carte
// et se cache quand on approche ; un fromage attend quelque part. Tout s'éteint si l'appareil
// demande moins d'animations. Les ronds dans l'eau vivent dans ciel.js, avec la mer.
(function () {
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const survol = !calme && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const MOT = (window.WM_SOURIS && window.WM_SOURIS.mot) || '';

  // ─── Les tableaux s'éveillent quand on les regarde ───
  if (survol) document.querySelectorAll('.tableaux .tel').forEach(tel => {
    const v = tel.querySelector('video'); if (!v) return;
    tel.addEventListener('pointerenter', () => { tel.classList.add('eveille'); v.play().catch(() => {}); });
    tel.addEventListener('pointermove', e => {
      const r = tel.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      tel.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg'); tel.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
    });
    tel.addEventListener('pointerleave', () => {
      tel.classList.remove('eveille'); v.pause(); // il se rendort là où il était : le temps reprendra au prochain regard
      tel.style.setProperty('--rx', '0deg'); tel.style.setProperty('--ry', '0deg');
    });
  });

  // ─── Le son de la fanfare (seulement après un clic) ───
  let audio = null;
  function note(freq, quand, dur, vol) {
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + quand;
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(audio.destination); o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  const fanfare = () => { note(523.3, 0, 0.18, 0.07); note(659.3, 0.16, 0.18, 0.07); note(784, 0.32, 0.18, 0.07); note(1046.5, 0.48, 0.7, 0.08); };

  // ─── La souris qui nous regarde ───
  const SOURIS = `<svg class="souris" viewBox="0 0 64 48" aria-hidden="true">
    <circle cx="15" cy="15" r="11" fill="#b9b3c4"/><circle cx="15" cy="15" r="6" fill="#f2b8c6"/>
    <circle cx="49" cy="15" r="11" fill="#b9b3c4"/><circle cx="49" cy="15" r="6" fill="#f2b8c6"/>
    <ellipse cx="32" cy="31" rx="20" ry="17" fill="#d4cedd"/>
    <g class="yeux"><circle cx="25" cy="27" r="3.4" fill="#1b1830"/><circle cx="39" cy="27" r="3.4" fill="#1b1830"/>
      <circle cx="26.2" cy="25.8" r="1.1" fill="#fff"/><circle cx="40.2" cy="25.8" r="1.1" fill="#fff"/></g>
    <g class="paupieres"><rect x="20" y="22.5" width="10" height="9" rx="4" fill="#d4cedd"/><rect x="34" y="22.5" width="10" height="9" rx="4" fill="#d4cedd"/></g>
    <circle cx="32" cy="35" r="2.7" fill="#f08aa0"/>
    <g class="moustache" stroke="#8d86a0" stroke-width=".9" stroke-linecap="round"><path d="M27 35 L13 32 M27 37 L13 38 M37 35 L51 32 M37 37 L51 38"/></g>
    <ellipse cx="22" cy="46" rx="5.5" ry="3.6" fill="#d4cedd"/><ellipse cx="42" cy="46" rx="5.5" ry="3.6" fill="#d4cedd"/>
  </svg>`;
  const cachette = document.createElement('div'); cachette.className = 'cachette'; cachette.innerHTML = SOURIS;
  const souris = cachette.firstElementChild, yeux = souris.querySelector('.yeux');
  let px = -9999, py = -9999, dernierMouv = performance.now(), sortie = null, prochaine = performance.now() + 7000;

  function regarder() {
    const r = cachette.getBoundingClientRect(), cx = r.left + 32, cy = r.top + 27;
    let dx = px - cx, dy = py - cy; const d = Math.hypot(dx, dy) || 1;
    if (px < -999) { dx = 0; dy = 1; }
    yeux.style.transform = `translate(${(dx / d * 1.8).toFixed(2)}px, ${(dy / d * 1.8).toFixed(2)}px)`;
  }
  function sortir() {
    const top = (document.querySelector('header') || { offsetHeight: 64 }).offsetHeight + 50;
    const cartes = [...document.querySelectorAll('.carte')].filter(c => {
      const r = c.getBoundingClientRect(); return r.top > top && r.top < innerHeight - 80 && r.width > 200;
    });
    if (!cartes.length) { prochaine = performance.now() + 3000; return; }
    const c = cartes[Math.floor(Math.random() * cartes.length)], r = c.getBoundingClientRect();
    const x = 36 + Math.random() * Math.max(0, r.width - 136);
    if (Math.hypot(px - (r.left + x + 32), py - r.top) < 240) { prochaine = performance.now() + 2500; return; }
    cachette.style.left = x + 'px'; c.appendChild(cachette);
    souris.classList.remove('vite'); void souris.offsetWidth;
    souris.classList.add('sort'); sortie = performance.now(); regarder();
  }
  function cacher(vite) {
    souris.classList.toggle('vite', !!vite); souris.classList.remove('sort'); sortie = null;
    prochaine = performance.now() + 10000 + Math.random() * 10000;
  }
  if (!calme) {
    addEventListener('pointermove', e => {
      dernierMouv = performance.now(); px = e.clientX; py = e.clientY;
      if (!sortie) return;
      const r = cachette.getBoundingClientRect();
      if (Math.hypot(px - (r.left + 32), py - (r.top + 30)) < 170) cacher(true); else regarder();
    }, { passive: true });
    addEventListener('pointerdown', e => { px = e.clientX; py = e.clientY; dernierMouv = performance.now(); if (sortie) cacher(true); }, { passive: true });
    addEventListener('scroll', () => { dernierMouv = performance.now(); if (sortie && performance.now() - sortie > 600) cacher(true); }, { passive: true });
    setInterval(() => {
      const now = performance.now();
      if (document.hidden || window.WM_FROMAGE_TROUVE) return;
      if (!sortie && now > prochaine && now - dernierMouv > 2500) sortir();
      else if (sortie && now - sortie > 6500) cacher(false);
    }, 400);
  }

  // ─── Le fromage : quand on le trouve, la souris accourt ───
  const COUREUSE = `<svg viewBox="0 0 70 38" aria-hidden="true">
    <path d="M17 24 Q5 20 2 30" stroke="#b9b3c4" stroke-width="2" fill="none" stroke-linecap="round"/>
    <g class="pattes" fill="#b9b3c4"><rect x="24" y="29" width="4" height="7" rx="2"/><rect x="42" y="29" width="4" height="7" rx="2"/></g>
    <ellipse cx="35" cy="23" rx="19" ry="11" fill="#d4cedd"/>
    <circle cx="53" cy="19" r="9.5" fill="#d4cedd"/>
    <circle cx="49" cy="10" r="6.5" fill="#b9b3c4"/><circle cx="49" cy="10" r="3.6" fill="#f2b8c6"/>
    <circle cx="57" cy="17" r="1.8" fill="#1b1830"/><circle cx="63" cy="21" r="2" fill="#f08aa0"/>
  </svg>`;
  const fromage = document.querySelector('.fromage');
  if (fromage) fromage.addEventListener('click', () => {
    window.WM_FROMAGE_TROUVE = true; if (sortie) cacher(true);
    fromage.classList.add('mange');
    const fr = fromage.getBoundingClientRect(), cible = { x: fr.left - 60, y: fr.top + fr.height - 36 };
    const mot = document.createElement('div'); mot.className = 'mot-souris'; mot.setAttribute('role', 'status'); mot.textContent = MOT;
    document.body.appendChild(mot);
    const fin = () => {
      fanfare(); setTimeout(() => mot.classList.add('vu'), 30);
      setTimeout(() => { mot.classList.remove('vu'); setTimeout(() => mot.remove(), 600); }, 3400);
    };
    if (calme) { fromage.style.opacity = '0'; fin(); return; }
    const c = document.createElement('div'); c.className = 'coureuse'; c.innerHTML = COUREUSE; document.body.appendChild(c);
    const depart = { x: -80, y: cible.y };
    c.animate([{ transform: `translate(${depart.x}px, ${depart.y}px)` }, { transform: `translate(${cible.x}px, ${cible.y}px)` }],
      { duration: 1400, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' }).finished.then(() => {
        // trois bouchées
        let b = 0; const croque = setInterval(() => {
          b++; fromage.style.transform = `scale(${1 - b * 0.3})`; fromage.style.opacity = String(1 - b * 0.3); note(880 + b * 120, 0, 0.06, 0.05);
          if (b >= 3) {
            clearInterval(croque); fromage.style.opacity = '0'; fin();
            c.animate([{ transform: `translate(${cible.x}px, ${cible.y}px)` }, { transform: `translate(${innerWidth + 80}px, ${cible.y - 20}px)` }],
              { duration: 1100, delay: 700, easing: 'ease-in', fill: 'forwards' }).finished.then(() => c.remove());
          }
        }, 260);
      });
  });
})();
