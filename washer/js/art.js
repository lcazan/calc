'use strict';
// Super Splash: all drawing (characters, objects, backgrounds, map, story pictures)
const TAU = Math.PI * 2, OUT = '#2a2140';
const FONT = '"Baloo 2", "Arial Rounded MT Bold", "Trebuchet MS", sans-serif';
const SKINS = ['#ffdcbf', '#f0b98d', '#c68a5c', '#8a5a3c'];
const HAIRS = ['#5a3418', '#e0a84a', '#2a1d16', '#b5482a'];

function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function rrect(c, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function paint(c, fill, lw) {
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw !== 0) { c.lineWidth = lw || 3; c.strokeStyle = OUT; c.stroke(); }
}
function circ(c, x, y, r) { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, TAU); }
function ell(c, x, y, rx, ry, rot) { c.beginPath(); c.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, TAU); }
function poly(c, p) { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.closePath(); }
function line(c, x1, y1, x2, y2, col, lw) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
function limb(c, x1, y1, x2, y2, col, w) { line(c, x1, y1, x2, y2, OUT, w + 4); line(c, x1, y1, x2, y2, col, w); }
function rng(seed) {
  return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function txt(c, s, x, y, size, col, align) {
  c.font = `800 ${size}px ${FONT}`; c.textAlign = align || 'center'; c.textBaseline = 'middle'; c.fillStyle = col; c.fillText(s, x, y);
}
function win(c, x, y, w, h) {
  rrect(c, x, y, w, h, 3); paint(c, '#bfe7ff', 2.5);
  c.fillStyle = 'rgba(255,255,255,.65)'; c.beginPath();
  c.moveTo(x + w * 0.18, y + h - 3); c.lineTo(x + w * 0.5, y + 3); c.lineTo(x + w * 0.68, y + 3); c.lineTo(x + w * 0.36, y + h - 3); c.fill();
}
function wheel(c, x, y, r) { circ(c, x, y, r); paint(c, '#2e2a36'); circ(c, x, y, r * 0.5); paint(c, '#d5d9e0', 2); circ(c, x, y, r * 0.15); paint(c, '#888', 0); }
function star(c, x, y, r, n, inner) {
  c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i * Math.PI / n - Math.PI / 2, rr = i % 2 ? r * (inner || 0.45) : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.closePath();
}
function rainbow(t) { return `hsl(${(t * 220) % 360},90%,60%)`; }

// ---------------------------------------------------------------- kid
function kidHat(c, hat) {
  if (hat === 'cap') {
    c.beginPath(); c.arc(0, -8, 19, Math.PI, 0); c.closePath(); paint(c, '#e8443a');
    rrect(c, 8, -12, 22, 6, 3); paint(c, '#c0302a', 2.5); circ(c, 0, -27, 3); paint(c, '#fff', 2);
  } else if (hat === 'helmet') {
    c.beginPath(); c.arc(0, -8, 21, Math.PI, 0); c.closePath(); paint(c, '#d8261c');
    ell(c, -6, -7, 28, 6); paint(c, '#d8261c'); star(c, 6, -20, 7, 5); paint(c, '#ffd23f', 2);
  } else if (hat === 'cowboy') {
    ell(c, 0, -10, 32, 7); paint(c, '#a0662f'); rrect(c, -15, -34, 30, 25, 9); paint(c, '#a0662f');
    rrect(c, -15, -16, 30, 5, 2); paint(c, '#5a3418', 2);
  } else if (hat === 'wizard') {
    poly(c, [-20, -10, 20, -10, 6, -52]); paint(c, '#6a3fc0'); ell(c, 0, -10, 26, 6); paint(c, '#6a3fc0');
    star(c, 2, -28, 5, 5); paint(c, '#ffd23f', 0); star(c, -6, -16, 3.5, 5); paint(c, '#ffd23f', 0);
  } else if (hat === 'pirate') {
    c.beginPath(); c.moveTo(-26, -8); c.quadraticCurveTo(0, -46, 26, -8); c.quadraticCurveTo(0, -16, -26, -8); paint(c, '#2a2238');
    circ(c, 0, -22, 5); paint(c, '#fff', 1.5); line(c, -5, -15, 5, -13, '#fff', 2);
  } else if (hat === 'propeller') {
    c.beginPath(); c.arc(0, -8, 19, Math.PI, 0); c.closePath(); paint(c, '#43c46b');
    c.beginPath(); c.arc(0, -8, 19, Math.PI, Math.PI * 1.35); c.lineTo(0, -8); c.closePath(); paint(c, '#ef4a3c', 2);
    line(c, 0, -27, 0, -34, OUT, 3); const sp = Math.sin(performance.now() / 60);
    ell(c, 0, -35, 16 * Math.abs(sp) + 3, 3.5); paint(c, '#ffd23f', 2);
  } else if (hat === 'crown') {
    poly(c, [-17, -10, 17, -10, 19, -34, 9, -22, 0, -38, -9, -22, -19, -34]); paint(c, '#ffd23f');
    circ(c, 0, -17, 3.5); paint(c, '#e8443a', 1.5); circ(c, -10, -15, 2.5); paint(c, '#3a8cf0', 1.5); circ(c, 10, -15, 2.5); paint(c, '#43c46b', 1.5);
  }
}
function kidHead(c, k) {
  const skin = SKINS[k.skin || 0], hair = HAIRS[k.hair || 0], girl = k.g === 'girl';
  if (girl) {
    c.save(); c.translate(-15, -6); c.rotate(-0.4 + Math.sin((k.t || 0) * 9) * (k.moving ? 0.25 : 0.06));
    ell(c, -9, 8, 9, 15, 0.35); paint(c, hair, 2.5); circ(c, -1, -1, 4); paint(c, '#ff5fa2', 2); c.restore();
  }
  circ(c, -9, 2, 5); paint(c, skin, 2.5);
  circ(c, 0, 0, 19); paint(c, skin, 3);
  // hair
  c.beginPath(); c.moveTo(-19, 4); c.quadraticCurveTo(-22, -22, 0, -21); c.quadraticCurveTo(20, -21, 19, -6);
  if (girl) { c.quadraticCurveTo(12, -14, 4, -9); c.quadraticCurveTo(-4, -14, -10, -8); c.quadraticCurveTo(-14, 2, -19, 12); }
  else { c.lineTo(14, -9); c.lineTo(10, -6); c.lineTo(6, -12); c.lineTo(1, -7); c.lineTo(-5, -12); c.lineTo(-11, -5); c.lineTo(-14, 3); }
  c.closePath(); paint(c, hair, 2.5);
  // goggles
  c.beginPath(); c.moveTo(-19, -7); c.quadraticCurveTo(0, -15, 19, -11); c.strokeStyle = '#333'; c.lineWidth = 4; c.stroke();
  rrect(c, 2, -18, 9, 8, 3); paint(c, '#8fe0ff', 2); rrect(c, 12, -18, 8, 8, 3); paint(c, '#8fe0ff', 2);
  // face
  if (k.blink) { line(c, 2, -1, 8, -1, OUT, 2.5); line(c, 11, -1, 16, -1, OUT, 2.5); }
  else if (k.hurt) { line(c, 2, -4, 8, 0, OUT, 2.5); line(c, 2, 0, 8, -4, OUT, 2.5); line(c, 11, -4, 16, 0, OUT, 2.5); line(c, 11, 0, 16, -4, OUT, 2.5); }
  else {
    ell(c, 5, -1, 4, 5); paint(c, '#fff', 2); ell(c, 13.5, -1, 4, 5); paint(c, '#fff', 2);
    circ(c, 6.5, 0, 2.2); paint(c, OUT, 0); circ(c, 15, 0, 2.2); paint(c, OUT, 0);
  }
  c.beginPath(); c.arc(18, 5, 3, -1.4, 1.4); c.strokeStyle = OUT; c.lineWidth = 2.2; c.stroke();
  c.globalAlpha = 0.45; circ(c, 14, 8, 3.5); paint(c, '#ff6f8a', 0); c.globalAlpha = 1;
  if (k.hurt) { ell(c, 10, 12, 3, 4); paint(c, '#7a2030', 2); }
  else { c.beginPath(); c.arc(9, 9, 5, 0.25, Math.PI - 0.5); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke(); }
  if (k.hat && k.hat !== 'none') kidHat(c, k.hat);
}
function nozzleColor(id, t) { const n = NOZZLES[id] || NOZZLES.fan; return n.color === 'rainbow' ? rainbow(t || 0) : n.color; }
// origin = feet center, facing right. k: {g,skin,hair,hat,wcol,walk,air,aim,t,blink,hurt,noz}
function drawKid(c, k) {
  const girl = k.g === 'girl', skin = SKINS[k.skin || 0];
  const shirt = girl ? '#ff7eb6' : '#e8443a', pants = girl ? '#7c5cd6' : '#3f6fb5';
  const a = k.aim || 0.35, dx = Math.cos(a), dy = Math.sin(a);
  const sw = k.air ? 0 : Math.sin(k.walk || 0);
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  // washer pack on the back
  rrect(c, -29, -64, 18, 36, 6); paint(c, k.wcol || '#ffc928');
  rrect(c, -27, -70, 14, 7, 3); paint(c, '#555', 2);
  circ(c, -20, -50, 4.5); paint(c, '#fff', 2); line(c, -20, -50, -18, -53, '#e33', 1.5);
  // hose
  const gx = 10 - dx * 8, gy = -40 - dy * 8;
  c.beginPath(); c.moveTo(-20, -30); c.bezierCurveTo(-26, -4, gx - 24, -6, gx, gy); c.strokeStyle = '#2b2b33'; c.lineWidth = 4; c.stroke();
  // legs
  const leg = (hx, ang) => {
    const fx = hx + Math.sin(ang) * 21, fy = -24 + Math.cos(ang) * 21;
    limb(c, hx, -26, fx, fy - 3, pants, 7);
    rrect(c, fx - 6, fy - 8, 15, 9, 4); paint(c, '#ffd23f', 2.5);
  };
  if (k.air) { leg(-4, -0.55); leg(5, 0.65); } else { leg(-4, -sw * 0.55); leg(5, sw * 0.55); }
  // torso
  rrect(c, -12, -58, 24, 34, 9); paint(c, shirt);
  if (girl) { poly(c, [-10, -46, 10, -46, 15, -20, -15, -20]); paint(c, pants, 2.5); }
  else { rrect(c, -10, -46, 20, 22, 4); paint(c, pants, 2.5); rrect(c, -4, -42, 8, 6, 2); paint(c, '#5b86c9', 1.5); }
  line(c, -7, -56, -7, -46, pants, 3); line(c, 7, -56, 7, -46, pants, 3);
  // back arm to the support grip
  const sx = 10 + dx * 12, sy = -40 + dy * 12;
  limb(c, -4, -52, sx, sy, shirt, 6); circ(c, sx, sy, 4); paint(c, skin, 2);
  // wand
  const tx = 10 + dx * 30, ty = -40 + dy * 30;
  line(c, gx, gy, tx, ty, OUT, 8); line(c, gx, gy, tx, ty, '#a7adb8', 4);
  rrect(c, gx - 4, gy - 4, 8, 8, 2); paint(c, '#333', 1.5);
  circ(c, tx, ty, 4.5); paint(c, nozzleColor(k.noz, k.t), 2);
  // front arm
  limb(c, 4, -52, 10, -40, shirt, 6); circ(c, 10, -40, 4.5); paint(c, skin, 2);
  // head
  c.save(); c.translate(3, -74); kidHead(c, k); c.restore();
  c.restore();
}
function kidNozzleLocal(aim) { return [10 + Math.cos(aim) * 30, -40 + Math.sin(aim) * 30]; }

// ---------------------------------------------------------------- dirt
const DIRT = {
  mud:   { base: '#7b5431', dark: '#553519', light: '#a3784a', col: '#6b4526' },
  slime: { base: '#5f8a26', dark: '#3c6416', light: '#b2db48', col: '#6f9a2a' },
  soot:  { base: '#56565e', dark: '#34343a', light: '#80808a', col: '#4a4a52' },
  sand:  { base: '#b89a5a', dark: '#5d7a2a', light: '#e2cb8f', col: '#a88d52' }
};
function paintDirt(t, w, h, kind, r, S) {
  const D = DIRT[kind] || DIRT.mud;
  t.globalAlpha = 0.8; t.fillStyle = D.base; t.fillRect(0, 0, w, h);
  const n = Math.ceil(w * h / (700 * S * S)) + 6;
  for (let i = 0; i < n; i++) {
    t.globalAlpha = 0.25 + r() * 0.35; t.fillStyle = r() < 0.5 ? D.dark : D.light;
    ell(t, r() * w, r() * h, (4 + r() * 22) * S, (3 + r() * 14) * S, r() * 3); t.fill();
  }
  t.fillStyle = D.dark;
  for (let i = 0; i < n * 2; i++) { t.globalAlpha = 0.5; circ(t, r() * w, r() * h, (0.8 + r() * 2.2) * S); t.fill(); }
  t.strokeStyle = D.dark; t.lineCap = 'round';
  for (let i = 0; i < w / (22 * S); i++) {
    const x = r() * w, y = r() * h * 0.7, L = (10 + r() * 30) * S;
    t.globalAlpha = 0.5; t.lineWidth = (2.5 + r() * 4) * S; t.beginPath(); t.moveTo(x, y); t.lineTo(x, y + L); t.stroke();
    circ(t, x, y + L, t.lineWidth * 0.7); t.fillStyle = D.dark; t.fill();
  }
  if (kind === 'slime') {
    t.strokeStyle = D.light; t.lineWidth = 1.5 * S;
    for (let i = 0; i < n / 2; i++) { t.globalAlpha = 0.8; circ(t, r() * w, r() * h, (2 + r() * 5) * S); t.stroke(); }
  }
  if (kind === 'sand') {
    t.strokeStyle = '#4f7a22'; t.lineWidth = 3 * S;
    for (let i = 0; i < n / 3; i++) {
      const x = r() * w, y = r() * h; t.globalAlpha = 0.8; t.beginPath(); t.moveTo(x, y);
      t.bezierCurveTo(x + 8 * S, y + 6 * S, x - 6 * S, y + 14 * S, x + 4 * S, y + 22 * S); t.stroke();
    }
  }
  t.globalAlpha = 1;
}

// ---------------------------------------------------------------- objects
// draw(c, w, h, variant) in local units (0..w, 0..h), bottom = h
const OBJ = {
  car: { w: 200, h: 96, snd: 'honk', draw(c, w, h, v) {
    const cols = ['#e8443a', '#3a8cf0', '#43c46b', '#ff9f1c', '#ffd23f'], col = cols[v % 5], taxi = v === 4;
    c.beginPath(); c.moveTo(46, 46); c.lineTo(68, 14); c.lineTo(136, 14); c.lineTo(164, 46); c.closePath(); paint(c, col);
    rrect(c, 6, 42, 188, 38, 14); paint(c, col);
    poly(c, [58, 44, 74, 21, 98, 21, 98, 44]); paint(c, '#bfe7ff', 2.5);
    poly(c, [106, 44, 106, 21, 132, 21, 152, 44]); paint(c, '#bfe7ff', 2.5);
    line(c, 102, 48, 102, 76, OUT, 2.5); rrect(c, 84, 54, 12, 4, 2); paint(c, '#333', 0); rrect(c, 110, 54, 12, 4, 2); paint(c, '#333', 0);
    ell(c, 186, 55, 6, 8); paint(c, '#fff6a8', 2.5); rrect(c, 6, 50, 8, 10, 3); paint(c, '#ff5a5a', 2);
    if (taxi) {
      rrect(c, 84, 0, 36, 15, 4); paint(c, '#fff', 2.5); txt(c, 'TAXI', 102, 8, 11, '#222');
      for (let i = 0; i < 18; i++) { c.fillStyle = i % 2 ? '#222' : '#fff'; c.fillRect(20 + i * 9, 62, 9, 6); }
    }
    rrect(c, 0, 70, 30, 10, 5); paint(c, '#c9ced6', 2.5); rrect(c, 170, 70, 30, 10, 5); paint(c, '#c9ced6', 2.5);
    wheel(c, 52, 80, 16); wheel(c, 150, 80, 16);
  } },
  mailbox: { w: 54, h: 100, snd: 'chime', draw(c) {
    rrect(c, 22, 40, 10, 60, 2); paint(c, '#8a5a2b');
    c.beginPath(); c.moveTo(2, 44); c.lineTo(2, 22); c.arc(25, 22, 23, Math.PI, 0); c.lineTo(48, 44); c.closePath(); paint(c, '#3a6fd8');
    line(c, 6, 30, 44, 30, '#2c58b0', 2); rrect(c, 46, 10, 6, 24, 2); paint(c, '#e8443a', 2); rrect(c, 46, 8, 14, 9, 2); paint(c, '#e8443a', 2);
    txt(c, '12', 25, 37, 11, '#fff');
  } },
  doghouse: { w: 130, h: 112, snd: 'bark', draw(c) {
    rrect(c, 12, 44, 106, 68, 4); paint(c, '#e2913a');
    for (let y = 56; y < 110; y += 12) line(c, 14, y, 116, y, '#c47528', 2);
    poly(c, [0, 50, 65, 2, 130, 50]); paint(c, '#c0392b');
    c.beginPath(); c.moveTo(42, 112); c.lineTo(42, 76); c.arc(65, 76, 23, Math.PI, 0); c.lineTo(88, 112); c.closePath(); paint(c, '#3a2a22');
    // dog peeking
    ell(c, 65, 92, 17, 15); paint(c, '#f1d3a0'); ell(c, 50, 88, 6, 12, 0.3); paint(c, '#8a5a2b'); ell(c, 80, 88, 6, 12, -0.3); paint(c, '#8a5a2b');
    circ(c, 59, 89, 2.5); paint(c, OUT, 0); circ(c, 71, 89, 2.5); paint(c, OUT, 0); ell(c, 65, 97, 4, 3); paint(c, OUT, 0);
    rrect(c, 46, 30, 38, 14, 4); paint(c, '#fff3d6', 2); txt(c, 'REX', 65, 37, 11, '#7a3a1a');
  } },
  fence: { w: 220, h: 72, snd: 'chime', draw(c) {
    rrect(c, 0, 26, 220, 10, 2); paint(c, '#fafafa', 2.5); rrect(c, 0, 52, 220, 10, 2); paint(c, '#fafafa', 2.5);
    for (let x = 4; x < 216; x += 24) { poly(c, [x, 72, x, 12, x + 8, 2, x + 16, 12, x + 16, 72]); paint(c, '#ffffff', 2.5); }
  } },
  trash: { w: 62, h: 82, snd: 'chime', draw(c) {
    poly(c, [8, 18, 54, 18, 50, 82, 12, 82]); paint(c, '#3c9b5a');
    for (let x = 20; x < 46; x += 10) line(c, x, 24, x - 1, 76, '#2c7a44', 2.5);
    rrect(c, 2, 8, 58, 12, 5); paint(c, '#4fb36c'); rrect(c, 23, 0, 16, 9, 4); paint(c, '#4fb36c');
  } },
  house: { w: 320, h: 282, snd: 'chime', draw(c, w, h, v) {
    const walls = ['#f6e1a6', '#bfe1f5', '#f7c6c6'][v % 3];
    rrect(c, 236, 20, 30, 70, 2); paint(c, '#a5523a');
    rrect(c, 22, 112, 276, 170, 2); paint(c, walls);
    poly(c, [0, 118, 160, 8, 320, 118]); paint(c, '#c0503a');
    for (let i = 1; i < 5; i++) { const y = 8 + i * 22; line(c, 160 - i * 29, y, 160 + i * 29, y, '#9e3e2c', 2); }
    circ(c, 160, 70, 18); paint(c, '#bfe7ff', 2.5); line(c, 142, 70, 178, 70, OUT, 2); line(c, 160, 52, 160, 88, OUT, 2);
    rrect(c, 136, 182, 48, 100, 6); paint(c, '#7a4a2b'); circ(c, 174, 236, 3.5); paint(c, '#ffd23f', 1.5);
    for (const x of [50, 220]) {
      rrect(c, x - 14, 150, 14, 64, 2); paint(c, '#4a7fc0', 2); rrect(c, x + 50, 150, 14, 64, 2); paint(c, '#4a7fc0', 2);
      win(c, x, 150, 50, 64); line(c, x + 25, 150, x + 25, 214, OUT, 2);
      rrect(c, x - 4, 214, 58, 14, 3); paint(c, '#a0662f', 2);
      for (let i = 0; i < 5; i++) { circ(c, x + 4 + i * 11, 212, 5); paint(c, ['#ff5fa2', '#ffd23f', '#ff7a3c'][i % 3], 1.5); }
    }
  } },
  swing: { w: 180, h: 140, snd: 'chime', draw(c) {
    line(c, 10, 140, 34, 8, OUT, 10); line(c, 10, 140, 34, 8, '#e8443a', 6); line(c, 58, 140, 34, 8, OUT, 10); line(c, 58, 140, 34, 8, '#e8443a', 6);
    line(c, 122, 140, 146, 8, OUT, 10); line(c, 122, 140, 146, 8, '#e8443a', 6); line(c, 170, 140, 146, 8, OUT, 10); line(c, 170, 140, 146, 8, '#e8443a', 6);
    rrect(c, 26, 2, 128, 12, 5); paint(c, '#3a8cf0');
    for (const x of [72, 112]) { line(c, x - 10, 12, x - 10, 102, '#666', 2); line(c, x + 10, 12, x + 10, 102, '#666', 2); rrect(c, x - 15, 100, 30, 8, 3); paint(c, x < 90 ? '#ffd23f' : '#43c46b', 2); }
  } },
  slide: { w: 200, h: 150, snd: 'chime', draw(c) {
    line(c, 24, 150, 24, 30, OUT, 8); line(c, 56, 150, 56, 30, OUT, 8); line(c, 24, 150, 24, 30, '#3a8cf0', 4); line(c, 56, 150, 56, 30, '#3a8cf0', 4);
    for (let y = 50; y < 150; y += 20) line(c, 24, y, 56, y, '#3a8cf0', 4);
    rrect(c, 16, 22, 50, 12, 3); paint(c, '#e8443a');
    c.beginPath(); c.moveTo(60, 24); c.bezierCurveTo(110, 30, 130, 130, 196, 136); c.lineTo(196, 150); c.bezierCurveTo(124, 148, 100, 46, 60, 40); c.closePath(); paint(c, '#ffd23f');
    rrect(c, 20, 0, 42, 24, 6); paint(c, '#43c46b', 2.5);
  } },
  bench: { w: 150, h: 62, snd: 'chime', draw(c) {
    for (const x of [16, 126]) { rrect(c, x, 30, 8, 32, 2); paint(c, '#444'); }
    rrect(c, 0, 26, 150, 10, 3); paint(c, '#c47a3a'); rrect(c, 4, 2, 142, 8, 3); paint(c, '#c47a3a'); rrect(c, 4, 13, 142, 8, 3); paint(c, '#c47a3a');
    line(c, 20, 6, 20, 30, '#444', 4); line(c, 130, 6, 130, 30, '#444', 4);
  } },
  statue: { w: 112, h: 222, snd: 'quack', draw(c) {
    rrect(c, 8, 150, 96, 72, 4); paint(c, '#b9bec8'); rrect(c, 0, 140, 112, 14, 3); paint(c, '#cfd3da'); rrect(c, 0, 208, 112, 14, 3); paint(c, '#cfd3da');
    rrect(c, 24, 172, 64, 22, 4); paint(c, '#d8b45a', 2); txt(c, 'DUCK', 56, 183, 13, '#6a4a10');
    ell(c, 52, 112, 40, 28); paint(c, '#7fc0c7'); ell(c, 44, 108, 22, 12, -0.2); paint(c, '#6aaab2', 2);
    circ(c, 80, 66, 20); paint(c, '#7fc0c7'); poly(c, [96, 64, 116, 70, 96, 76]); paint(c, '#e0a03a', 2.5);
    circ(c, 86, 60, 4); paint(c, OUT, 0); poly(c, [14, 104, 0, 92, 12, 118]); paint(c, '#7fc0c7', 2.5);
  } },
  fountain: { w: 200, h: 132, snd: 'chime', draw(c) {
    c.fillStyle = 'rgba(140,210,255,.8)';
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(100, 22); c.quadraticCurveTo(100 + s * 60, 0, 100 + s * 78, 84); c.lineWidth = 6; c.strokeStyle = 'rgba(140,210,255,.85)'; c.stroke(); }
    rrect(c, 0, 84, 200, 48, 8); paint(c, '#c7ccd6'); rrect(c, 8, 80, 184, 12, 5); paint(c, '#8fd3ff', 2.5);
    rrect(c, 90, 36, 20, 50, 4); paint(c, '#c7ccd6'); ell(c, 100, 36, 34, 9); paint(c, '#c7ccd6'); ell(c, 100, 33, 26, 5); paint(c, '#8fd3ff', 2);
    for (let x = 20; x < 190; x += 36) { rrect(c, x, 100, 20, 22, 4); paint(c, '#aeb4bf', 2); }
  } },
  picnic: { w: 160, h: 72, snd: 'chime', draw(c) {
    line(c, 30, 72, 60, 16, OUT, 9); line(c, 130, 72, 100, 16, OUT, 9); line(c, 30, 72, 60, 16, '#b06c32', 5); line(c, 130, 72, 100, 16, '#b06c32', 5);
    rrect(c, 0, 46, 160, 9, 3); paint(c, '#c47a3a');
    rrect(c, 10, 10, 140, 12, 3); paint(c, '#fff');
    for (let i = 0; i < 7; i++) { c.fillStyle = '#e8443a'; c.fillRect(12 + i * 20, 11, 10, 10); }
    poly(c, [20, 22, 140, 22, 132, 34, 28, 34]); paint(c, '#fff', 2); for (let i = 0; i < 6; i++) { c.fillStyle = '#e8443a'; c.fillRect(32 + i * 18, 23, 9, 10); }
    circ(c, 60, 4, 7); paint(c, '#ff5a5a', 2); rrect(c, 90, -4, 16, 14, 3); paint(c, '#ffd23f', 2);
  } },
  shop: { w: 300, h: 262, snd: 'chime', draw(c, w, h, v) {
    const brick = ['#c96b4b', '#7c9ad6'][v % 2], sign = ['BAKERY', 'TOYS'][v % 2];
    rrect(c, 0, 0, 300, 262, 3); paint(c, brick);
    for (let y = 14; y < 100; y += 14) for (let x = (y / 14) % 2 * 18; x < 300; x += 36) { c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; c.strokeRect(x, y, 36, 14); }
    rrect(c, 40, 14, 220, 40, 8); paint(c, '#fff3d6'); txt(c, sign, 150, 35, 28, v % 2 ? '#3a6fd8' : '#c0503a');
    for (let i = 0; i < 10; i++) { c.beginPath(); c.moveTo(i * 30, 110); c.lineTo(i * 30 + 30, 110); c.lineTo(i * 30 + 30, 140); c.arc(i * 30 + 15, 140, 15, 0, Math.PI); c.closePath(); paint(c, i % 2 ? '#fff' : (v % 2 ? '#3a8cf0' : '#e8443a'), 2); }
    win(c, 20, 158, 160, 90); line(c, 100, 158, 100, 248, OUT, 2.5);
    if (v % 2) { circ(c, 50, 228, 14); paint(c, '#ff5a5a', 2); rrect(c, 120, 210, 34, 34, 4); paint(c, '#ffd23f', 2); }
    else { ell(c, 60, 236, 24, 10); paint(c, '#e0a85a', 2); ell(c, 140, 236, 20, 10); paint(c, '#f2c27a', 2); }
    rrect(c, 200, 158, 76, 104, 6); paint(c, '#6b3f22'); win(c, 212, 170, 52, 40); circ(c, 264, 222, 4); paint(c, '#ffd23f', 1.5);
  } },
  bus: { w: 340, h: 142, snd: 'bighonk', draw(c, w, h, v) {
    const col = ['#2fb5a8', '#ffb627', '#ffd23f'][v % 3];
    rrect(c, 2, 4, 336, 112, 16); paint(c, col);
    rrect(c, 2, 4, 336, 20, 12); paint(c, '#fff', 2.5); txt(c, v % 3 === 2 ? 'SCHOOL BUS' : 'SUDSY TOWN', 170, 15, 14, '#2a2140');
    for (let x = 18; x < 240; x += 46) win(c, x, 32, 38, 34);
    rrect(c, 252, 32, 34, 74, 4); paint(c, '#bfe7ff', 2.5); line(c, 269, 32, 269, 106, OUT, 2);
    win(c, 296, 32, 36, 40); ell(c, 330, 92, 6, 8); paint(c, '#fff6a8', 2);
    rrect(c, 2, 84, 336, 8, 2); paint(c, '#fff', 2);
    wheel(c, 70, 118, 22); wheel(c, 274, 118, 22);
  } },
  billboard: { w: 262, h: 162, snd: 'chime', draw(c) {
    for (const x of [50, 200]) { rrect(c, x, 100, 12, 62, 2); paint(c, '#777'); }
    rrect(c, 0, 0, 262, 112, 6); paint(c, '#fff');
    rrect(c, 8, 8, 246, 96, 4); paint(c, '#5ec8f2', 2);
    txt(c, 'SUDS', 100, 42, 40, '#fff'); txt(c, 'SODA', 100, 78, 34, '#ffd23f');
    rrect(c, 190, 24, 34, 70, 10); paint(c, '#43c46b'); rrect(c, 198, 12, 18, 14, 3); paint(c, '#e8443a', 2);
    for (let i = 0; i < 6; i++) { circ(c, 160 + (i * 37) % 80, 20 + (i * 23) % 70, 5 + i % 3 * 2); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); }
    rrect(c, -6, 108, 274, 8, 2); paint(c, '#999', 2);
  } },
  boat: { w: 262, h: 132, snd: 'horn', draw(c, w, h, v) {
    const col = v % 2 ? '#e8443a' : '#3a6fd8';
    rrect(c, 20, 104, 220, 10, 3); paint(c, '#888'); wheel(c, 70, 118, 14); wheel(c, 110, 118, 14);
    rrect(c, 90, 20, 90, 46, 8); paint(c, '#fff'); win(c, 102, 30, 28, 22); win(c, 140, 30, 28, 22);
    c.beginPath(); c.moveTo(0, 62); c.lineTo(262, 62); c.lineTo(226, 106); c.lineTo(30, 106); c.closePath(); paint(c, '#fff');
    rrect(c, 14, 74, 236, 10, 2); paint(c, col, 2); txt(c, v % 2 ? 'S.S. SUDS' : 'BUBBLES', 132, 96, 13, col);
    line(c, 135, 20, 135, 0, OUT, 4);
  } },
  lighthouse: { w: 122, h: 322, snd: 'horn', draw(c) {
    poly(c, [24, 322, 98, 322, 86, 80, 36, 80]); paint(c, '#fff');
    for (let i = 0; i < 4; i++) { const y0 = 100 + i * 56; const k0 = (y0 - 80) / 242 * 12, k1 = (y0 + 28 - 80) / 242 * 12; poly(c, [36 - k0, y0, 86 + k0, y0, 86 + k1, y0 + 28, 36 - k1, y0 + 28]); paint(c, '#e8443a', 2); }
    rrect(c, 46, 280, 30, 42, 10); paint(c, '#6b3f22');
    rrect(c, 22, 70, 78, 12, 3); paint(c, '#333'); rrect(c, 38, 30, 46, 40, 4); paint(c, '#fff6a8'); line(c, 61, 30, 61, 70, OUT, 2);
    poly(c, [32, 32, 90, 32, 61, 4]); paint(c, '#e8443a'); circ(c, 61, 4, 5); paint(c, '#333', 2);
  } },
  hut: { w: 172, h: 152, snd: 'chime', draw(c, w, h, v) {
    const col = v % 2 ? '#ff7eb6' : '#2fb5a8';
    rrect(c, 14, 50, 144, 102, 3); paint(c, '#fff');
    for (let x = 14; x < 158; x += 24) { c.fillStyle = col; c.fillRect(x, 52, 12, 98); }
    rrect(c, 14, 50, 144, 102, 3); paint(c, null);
    poly(c, [0, 56, 86, 0, 172, 56]); paint(c, '#ffd23f');
    rrect(c, 66, 92, 40, 60, 5); paint(c, '#6b3f22'); circ(c, 86, 30, 11); paint(c, '#bfe7ff', 2.5);
  } },
  icecream: { w: 262, h: 152, snd: 'jingle', draw(c, w, h, v) {
    const col = v % 2 ? '#8fd3ff' : '#ffb3d1';
    ell(c, 130, 8, 16, 10); paint(c, '#fff3f8'); poly(c, [116, 14, 144, 14, 130, 44]); paint(c, '#e0a85a');
    rrect(c, 4, 42, 254, 84, 12); paint(c, col);
    rrect(c, 24, 54, 120, 46, 6); paint(c, '#fff8e0'); txt(c, 'ICE CREAM', 84, 77, 18, '#e8443a');
    win(c, 196, 52, 52, 40); rrect(c, 4, 104, 254, 10, 3); paint(c, '#fff', 2);
    wheel(c, 60, 128, 20); wheel(c, 204, 128, 20);
  } },
  tractor: { w: 202, h: 142, snd: 'honk', draw(c, w, h, v) {
    const col = v % 2 ? '#e8443a' : '#43a047';
    rrect(c, 150, 10, 10, 50, 3); paint(c, '#555');
    rrect(c, 70, 66, 126, 44, 8); paint(c, col);
    rrect(c, 20, 18, 74, 72, 6); paint(c, col); win(c, 30, 28, 54, 36);
    rrect(c, 12, 10, 90, 12, 4); paint(c, '#ffd23f');
    circ(c, 54, 100, 42); paint(c, '#2e2a36'); circ(c, 54, 100, 22); paint(c, '#ffd23f', 2.5);
    wheel(c, 172, 120, 22);
  } },
  barn: { w: 300, h: 262, snd: 'moo', draw(c, w, h, v) {
    const col = v % 2 ? '#7c9ad6' : '#c0392b';
    poly(c, [10, 262, 10, 110, 50, 40, 150, 4, 250, 40, 290, 110, 290, 262]); paint(c, col);
    poly(c, [10, 110, 50, 40, 150, 4, 250, 40, 290, 110, 270, 110, 236, 50, 150, 20, 64, 50, 30, 110]); paint(c, '#fff', 2.5);
    rrect(c, 96, 150, 108, 112, 3); paint(c, '#fff');
    line(c, 100, 154, 200, 258, '#fff', 0); line(c, 98, 152, 202, 260, OUT, 3); line(c, 202, 152, 98, 260, OUT, 3); line(c, 150, 150, 150, 262, OUT, 3);
    rrect(c, 124, 70, 52, 46, 4); paint(c, '#3a2a22'); for (let i = 0; i < 4; i++) line(c, 128 + i * 12, 112, 134 + i * 12, 100, '#e8c24a', 3);
  } },
  pig: { w: 102, h: 72, snd: 'oink', draw(c, w, h, v) {
    const pink = v % 2 ? '#ffb0c6' : '#ffa3bd';
    for (const x of [24, 40, 64, 80]) { rrect(c, x - 5, 46, 11, 26, 4); paint(c, pink, 2.5); }
    ell(c, 50, 38, 40, 26); paint(c, pink);
    c.beginPath(); c.arc(8, 30, 6, 0, 4.5); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    circ(c, 82, 28, 20); paint(c, pink); poly(c, [70, 12, 74, -2, 82, 10]); paint(c, pink, 2.5); poly(c, [88, 10, 96, -1, 96, 14]); paint(c, pink, 2.5);
    ell(c, 96, 32, 8, 7); paint(c, '#ff7fa3', 2.5); circ(c, 94, 31, 1.6); paint(c, OUT, 0); circ(c, 99, 31, 1.6); paint(c, OUT, 0);
    circ(c, 84, 22, 2.5); paint(c, OUT, 0);
  } },
  coop: { w: 152, h: 112, snd: 'cluck', draw(c) {
    for (const x of [24, 124]) { rrect(c, x, 70, 8, 42, 2); paint(c, '#8a5a2b'); }
    poly(c, [100, 112, 70, 74, 84, 74, 114, 112]); paint(c, '#c47a3a', 2);
    rrect(c, 10, 34, 132, 42, 3); paint(c, '#e2913a'); for (let y = 44; y < 76; y += 10) line(c, 12, y, 140, y, '#c47528', 2);
    poly(c, [0, 38, 76, 0, 152, 38]); paint(c, '#7a4a2b');
    c.beginPath(); c.arc(76, 76, 16, Math.PI, 0); c.closePath(); paint(c, '#3a2a22');
    circ(c, 76, 66, 9); paint(c, '#fff'); poly(c, [84, 64, 92, 67, 84, 70]); paint(c, '#ffb627', 1.5); poly(c, [72, 58, 76, 52, 80, 58]); paint(c, '#e8443a', 1.5); circ(c, 79, 64, 1.5); paint(c, OUT, 0);
  } },
  gate: { w: 262, h: 302, snd: 'chime', draw(c) {
    for (const x of [0, 192]) {
      rrect(c, x, 40, 70, 262, 3); paint(c, '#8e8a9c');
      for (let i = 0; i < 4; i++) { rrect(c, x - 4 + i * 20, 22, 14, 22, 2); paint(c, '#8e8a9c'); }
      rrect(c, x + 24, 90, 22, 34, 10); paint(c, '#ffd23f');
    }
    rrect(c, 66, 60, 130, 242, 3); paint(c, '#a29eb0');
    c.beginPath(); c.moveTo(86, 302); c.lineTo(86, 150); c.arc(131, 150, 45, Math.PI, 0); c.lineTo(176, 302); c.closePath(); paint(c, '#2f2a3a');
    for (let x = 94; x < 176; x += 14) line(c, x, 112, x, 302, '#6b6578', 4);
    for (let y = 150; y < 300; y += 26) line(c, 88, y, 174, y, '#6b6578', 4);
    for (let y = 70; y < 300; y += 22) for (let x = 0; x < 262; x += 44) { c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; c.strokeRect(x + (y / 22 % 2) * 22, y, 44, 22); }
    line(c, 35, 22, 35, -14, OUT, 3); poly(c, [35, -14, 60, -6, 35, 2]); paint(c, '#9b5de5', 2);
    line(c, 227, 22, 227, -14, OUT, 3); poly(c, [227, -14, 252, -6, 227, 2]); paint(c, '#9b5de5', 2);
  } },
  gargoyle: { w: 102, h: 162, snd: 'chime', draw(c, w, h, v) {
    rrect(c, 6, 100, 90, 62, 3); paint(c, '#8e8a9c'); rrect(c, 0, 92, 102, 12, 3); paint(c, '#a29eb0');
    poly(c, [20, 60, -2, 22, 26, 40]); paint(c, '#9b97aa'); poly(c, [82, 60, 104, 22, 76, 40]); paint(c, '#9b97aa');
    ell(c, 51, 70, 30, 26); paint(c, '#9b97aa');
    circ(c, 51, 36, 22); paint(c, '#9b97aa'); poly(c, [34, 22, 28, 2, 42, 16]); paint(c, '#9b97aa', 2.5); poly(c, [68, 22, 74, 2, 60, 16]); paint(c, '#9b97aa', 2.5);
    circ(c, 43, 34, 5); paint(c, '#fff', 2); circ(c, 59, 34, 5); paint(c, '#fff', 2); circ(c, 44, 35, 2); paint(c, OUT, 0); circ(c, 60, 35, 2); paint(c, OUT, 0);
    c.beginPath(); c.arc(51, 44, 9, 0.2, Math.PI - 0.2); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    poly(c, [46, 50, 49, 56, 52, 50]); paint(c, '#fff', 1.5);
  } },
  cauldron: { w: 142, h: 102, snd: 'chime', draw(c) {
    for (const x of [30, 112]) { rrect(c, x - 5, 70, 10, 32, 3); paint(c, '#333'); }
    ell(c, 71, 56, 64, 42); paint(c, '#3a3446'); ell(c, 71, 20, 66, 14); paint(c, '#4a4458');
    ell(c, 71, 20, 56, 9); paint(c, '#7bd94a', 2); circ(c, 50, 14, 7); paint(c, '#9ff06a', 2); circ(c, 88, 10, 5); paint(c, '#9ff06a', 2);
    c.fillStyle = 'rgba(255,255,255,.2)'; ell(c, 40, 50, 10, 18, 0.4); c.fill();
  } },
  machine: { w: 302, h: 262, snd: 'chime', draw(c) {
    rrect(c, 20, 60, 140, 202, 10); paint(c, '#7a8a96');
    rrect(c, 34, 80, 112, 80, 6); paint(c, '#4a5560'); rrect(c, 40, 86, 100, 68, 4); paint(c, '#9fe06a', 2);
    txt(c, 'SLUDGE-O-', 90, 108, 15, '#2a2140'); txt(c, 'MATIC', 90, 130, 18, '#2a2140');
    circ(c, 60, 196, 18); paint(c, '#fff'); line(c, 60, 196, 70, 186, '#e8443a', 3); circ(c, 120, 196, 18); paint(c, '#fff'); line(c, 120, 196, 108, 188, '#e8443a', 3);
    rrect(c, 160, 120, 90, 24, 6); paint(c, '#8e9ba6'); rrect(c, 236, 120, 24, 142, 6); paint(c, '#8e9ba6');
    rrect(c, 180, 20, 110, 100, 14); paint(c, '#6d7c88'); ell(c, 235, 20, 55, 10); paint(c, '#5b8a2a');
    rrect(c, 70, 0, 22, 62, 4); paint(c, '#8e9ba6'); ell(c, 81, 4, 18, 8); paint(c, '#5b8a2a');
    line(c, 150, 230, 180, 200, OUT, 7); line(c, 150, 230, 180, 200, '#bbb', 4); circ(c, 182, 198, 8); paint(c, '#e8443a', 2.5);
    for (let i = 0; i < 6; i++) { circ(c, 28 + i * 24, 70, 3); paint(c, '#c0c8d0', 1.5); }
  } },
  sandcastle: { w: 112, h: 82, snd: 'chime', draw(c) {
    rrect(c, 0, 50, 112, 32, 4); paint(c, '#f2d08a');
    for (const [x, w, h] of [[8, 30, 46], [74, 30, 46], [34, 44, 70]]) { rrect(c, x, 82 - h, w, h, 3); paint(c, '#f2d08a'); for (let i = 0; i < 3; i++) { rrect(c, x + 2 + i * (w - 4) / 3, 76 - h, (w - 4) / 3 - 3, 8, 2); paint(c, '#f2d08a', 2); } }
    rrect(c, 48, 52, 16, 30, 8); paint(c, '#c99a50', 2); line(c, 56, 12, 56, -6, OUT, 2.5); poly(c, [56, -6, 72, 0, 56, 6]); paint(c, '#ef4a3c', 2);
  } },
  school: { w: 322, h: 262, snd: 'bell', draw(c) {
    rrect(c, 0, 90, 322, 172, 3); paint(c, '#d9785a');
    for (let y = 104; y < 250; y += 14) for (let x = (y / 14) % 2 * 16; x < 322; x += 32) { c.strokeStyle = 'rgba(0,0,0,.15)'; c.lineWidth = 2; c.strokeRect(x, y, 32, 14); }
    poly(c, [110, 92, 161, 30, 212, 92]); paint(c, '#7a4a2b'); rrect(c, 130, 50, 62, 50, 3); paint(c, '#f6e1a6');
    circ(c, 161, 70, 16); paint(c, '#fff', 2.5); line(c, 161, 70, 161, 60, OUT, 2.5); line(c, 161, 70, 169, 72, OUT, 2.5);
    rrect(c, 151, 0, 20, 30, 3); paint(c, '#f6e1a6'); circ(c, 161, 14, 6); paint(c, '#ffd23f', 2);
    rrect(c, 96, 104, 130, 30, 6); paint(c, '#fff3d6'); txt(c, 'SCHOOL', 161, 120, 22, '#3a6fd8');
    for (const x of [20, 70, 236, 286]) win(c, x - 4, 150, 36, 44);
    rrect(c, 131, 172, 60, 90, 4); paint(c, '#3a6fd8'); line(c, 161, 172, 161, 262, OUT, 2.5);
  } },
  bike: { w: 104, h: 64, snd: 'bell', draw(c) {
    for (const x of [20, 84]) { circ(c, x, 44, 19); c.strokeStyle = OUT; c.lineWidth = 5; c.stroke(); circ(c, x, 44, 3); paint(c, '#999', 1.5); }
    c.beginPath(); c.moveTo(20, 44); c.lineTo(46, 20); c.lineTo(76, 20); c.lineTo(84, 44); c.moveTo(46, 20); c.lineTo(54, 44); c.lineTo(20, 44); c.moveTo(54, 44); c.lineTo(76, 20);
    c.strokeStyle = OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#ef4a3c'; c.lineWidth = 4; c.stroke();
    rrect(c, 36, 10, 20, 7, 3); paint(c, '#333', 2); line(c, 76, 20, 72, 6, OUT, 4); line(c, 66, 6, 80, 6, OUT, 4);
    rrect(c, 80, 24, 20, 10, 3); paint(c, '#ffd23f', 2);
  } },
  seesaw: { w: 192, h: 66, snd: 'chime', draw(c) {
    poly(c, [80, 66, 96, 30, 112, 66]); paint(c, '#3a8cf0');
    c.save(); c.translate(96, 30); c.rotate(-0.15); rrect(c, -96, -6, 192, 12, 5); paint(c, '#ffd23f');
    for (const x of [-80, 80]) { line(c, x, -6, x, -24, OUT, 7); line(c, x, -6, x, -24, '#ef4a3c', 3); line(c, x - 8, -24, x + 8, -24, OUT, 5); }
    c.restore();
  } },
  plane: { w: 382, h: 162, snd: 'jet', draw(c, w, h, v) {
    const col = v % 2 ? '#ef4a3c' : '#3a8cf0';
    poly(c, [40, 70, 10, 4, 52, 4, 100, 70]); paint(c, '#fff'); rrect(c, 12, 10, 34, 10, 3); paint(c, col, 2);
    c.beginPath(); c.moveTo(30, 66); c.lineTo(320, 62); c.quadraticCurveTo(382, 70, 372, 100); c.quadraticCurveTo(360, 118, 320, 118); c.lineTo(50, 112); c.quadraticCurveTo(24, 108, 30, 66); c.closePath(); paint(c, '#fff');
    rrect(c, 40, 92, 320, 8, 3); paint(c, col, 2);
    for (let x = 90; x < 300; x += 26) { rrect(c, x, 74, 14, 12, 5); paint(c, '#bfe7ff', 2); }
    c.beginPath(); c.moveTo(336, 72); c.quadraticCurveTo(356, 70, 364, 84); c.lineTo(338, 84); c.closePath(); paint(c, '#bfe7ff', 2.5);
    poly(c, [150, 100, 230, 100, 170, 140]); paint(c, '#d5d9e0');
    for (const x of [80, 300]) { line(c, x, 116, x, 140, OUT, 5); wheel(c, x, 146, 12); }
    rrect(c, 160, 104, 46, 20, 9); paint(c, '#c9ced6', 2.5);
  } },
  tower: { w: 132, h: 302, snd: 'jet', draw(c) {
    poly(c, [44, 302, 88, 302, 82, 110, 50, 110]); paint(c, '#d5d9e0');
    for (let y = 140; y < 300; y += 40) line(c, 50, y, 84, y, '#aab', 2);
    rrect(c, 8, 60, 116, 56, 8); paint(c, '#6d7c88'); rrect(c, 16, 66, 100, 34, 4); paint(c, '#9fe3ff', 2.5);
    for (let x = 36; x < 116; x += 20) line(c, x, 66, x, 100, OUT, 2);
    rrect(c, 0, 50, 132, 14, 4); paint(c, '#4a5560'); line(c, 66, 50, 66, 10, OUT, 4); circ(c, 66, 10, 6); paint(c, '#ef4a3c', 2);
  } },
  cart: { w: 182, h: 86, snd: 'honk', draw(c) {
    rrect(c, 0, 50, 182, 16, 4); paint(c, '#8e9ba6'); wheel(c, 30, 72, 13); wheel(c, 150, 72, 13);
    const cols = ['#ef4a3c', '#43c46b', '#3a8cf0', '#ffb627'];
    [[8, 14, 50, 36], [62, 2, 42, 48], [108, 18, 64, 32]].forEach(([x, y, w, h], i) => { rrect(c, x, y, w, h, 6); paint(c, cols[i]); rrect(c, x + w / 2 - 8, y - 6, 16, 8, 3); paint(c, null, 2); });
  } },
  suitcase: { w: 66, h: 58, snd: 'chime', draw(c, w, h, v) {
    rrect(c, 22, 0, 22, 12, 4); paint(c, null, 3); rrect(c, 0, 8, 66, 50, 8); paint(c, v % 2 ? '#9b5de5' : '#ef4a3c');
    line(c, 20, 10, 20, 56, OUT, 2.5); line(c, 46, 10, 46, 56, OUT, 2.5); star(c, 33, 32, 7, 5); paint(c, '#ffd23f', 1.5);
  } },
  ferris: { w: 282, h: 262, snd: 'jingle', draw(c) {
    poly(c, [141, 110, 70, 262, 86, 262, 141, 130]); paint(c, '#9b5de5'); poly(c, [141, 110, 212, 262, 196, 262, 141, 130]); paint(c, '#9b5de5');
    circ(c, 141, 110, 100); c.strokeStyle = OUT; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#ff7eb6'; c.lineWidth = 5; c.stroke();
    circ(c, 141, 110, 66); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.stroke();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, 141, 110, 141 + Math.cos(a) * 100, 110 + Math.sin(a) * 100, '#fff', 3); }
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + 0.2, gx = 141 + Math.cos(a) * 100, gy = 110 + Math.sin(a) * 100; rrect(c, gx - 14, gy, 28, 22, 6); paint(c, ['#ef4a3c', '#43c46b', '#3a8cf0', '#ffb627'][i % 4], 2.5); }
    circ(c, 141, 110, 14); paint(c, '#ffd23f');
  } },
  carousel: { w: 252, h: 212, snd: 'jingle', draw(c) {
    rrect(c, 6, 180, 240, 32, 8); paint(c, '#ffd23f');
    for (const x of [50, 126, 202]) { line(c, x, 70, x, 182, OUT, 7); line(c, x, 70, x, 182, '#f5f5f5', 3); }
    for (const x of [50, 202]) { ell(c, x, 140, 26, 15); paint(c, '#fff'); circ(c, x + 22, 126, 10); paint(c, '#fff'); poly(c, [x + 26, 116, x + 30, 104, x + 34, 118]); paint(c, '#fff', 2); rrect(c, x - 20, 150, 7, 22, 3); paint(c, '#fff', 2); rrect(c, x + 12, 150, 7, 22, 3); paint(c, '#fff', 2); ell(c, x - 2, 132, 10, 5); paint(c, '#ef4a3c', 2); }
    for (let i = 0; i < 8; i++) { poly(c, [126, 0, i * 31.5, 72, (i + 1) * 31.5, 72]); paint(c, i % 2 ? '#fff' : '#ef4a3c', 2.5); }
    rrect(c, 0, 66, 252, 14, 6); paint(c, '#3a8cf0'); circ(c, 126, 0, 7); paint(c, '#ffd23f', 2);
  } },
  popcorn: { w: 122, h: 152, snd: 'pop', draw(c) {
    rrect(c, 8, 70, 106, 82, 4); paint(c, '#fff');
    for (let x = 8; x < 112; x += 26) { c.fillStyle = '#ef4a3c'; c.fillRect(x, 72, 13, 78); }
    rrect(c, 8, 70, 106, 82, 4); paint(c, null);
    rrect(c, 20, 26, 82, 50, 6); paint(c, '#bfe7ff');
    for (let i = 0; i < 14; i++) { circ(c, 30 + (i * 37) % 64, 52 + (i * 13) % 20, 7); paint(c, '#fff6c8', 1.5); }
    rrect(c, 0, 14, 122, 16, 6); paint(c, '#ef4a3c'); txt(c, 'POPCORN', 61, 23, 13, '#fff');
    rrect(c, 30, 100, 62, 22, 5); paint(c, '#ffd23f', 2);
  } },
  teacup: { w: 112, h: 82, snd: 'jingle', draw(c, w, h, v) {
    const col = v % 2 ? '#7fd3ff' : '#ff9ec4';
    c.beginPath(); c.arc(100, 40, 14, -1.4, 1.4); c.strokeStyle = OUT; c.lineWidth = 9; c.stroke(); c.strokeStyle = col; c.lineWidth = 5; c.stroke();
    c.beginPath(); c.moveTo(4, 12); c.lineTo(108, 12); c.quadraticCurveTo(104, 70, 56, 72); c.quadraticCurveTo(8, 70, 4, 12); c.closePath(); paint(c, col);
    ell(c, 56, 12, 52, 8); paint(c, '#fff6fa'); ell(c, 56, 78, 40, 5); paint(c, col);
    for (let i = 0; i < 4; i++) { circ(c, 24 + i * 22, 40, 5); paint(c, '#fff', 1.5); }
  } },
  train: { w: 332, h: 162, snd: 'train', draw(c) {
    rrect(c, 40, 30, 40, 50, 4); paint(c, '#333'); poly(c, [30, 30, 90, 30, 80, 14, 40, 14]); paint(c, '#333');
    rrect(c, 10, 70, 220, 64, 30); paint(c, '#2fb5a8'); for (const x of [70, 130, 190]) line(c, x, 72, x, 132, '#1f8c82', 3);
    rrect(c, 220, 20, 106, 114, 6); paint(c, '#ef4a3c'); win(c, 240, 36, 66, 40);
    rrect(c, 210, 10, 126, 16, 5); paint(c, '#333');
    poly(c, [0, 134, 10, 110, 10, 140]); paint(c, '#ffd23f', 2.5);
    circ(c, 22, 100, 9); paint(c, '#fff6a8', 2.5);
    for (const x of [60, 130, 200]) wheel(c, x, 140, 20); wheel(c, 286, 140, 20);
    rrect(c, 40, 132, 260, 6, 2); paint(c, '#c0302a', 2);
  } },
  wagon: { w: 272, h: 132, snd: 'train', draw(c, w, h, v) {
    const col = v % 2 ? '#3a6fd8' : '#43a047';
    rrect(c, 0, 4, 272, 104, 10); paint(c, col); rrect(c, 0, 0, 272, 14, 6); paint(c, '#333');
    for (let x = 20; x < 250; x += 58) win(c, x, 26, 40, 36);
    rrect(c, 0, 74, 272, 10, 2); paint(c, '#ffd23f', 2);
    for (const x of [50, 90, 182, 222]) wheel(c, x, 114, 16);
  } },
  clock: { w: 72, h: 212, snd: 'bell', draw(c) {
    rrect(c, 30, 70, 12, 140, 3); paint(c, '#2a2238'); rrect(c, 20, 196, 32, 16, 4); paint(c, '#2a2238');
    circ(c, 36, 38, 34); paint(c, '#2a2238'); circ(c, 36, 38, 27); paint(c, '#fff', 2);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; line(c, 36 + Math.cos(a) * 21, 38 + Math.sin(a) * 21, 36 + Math.cos(a) * 25, 38 + Math.sin(a) * 25, OUT, 2); }
    line(c, 36, 38, 36, 22, OUT, 3); line(c, 36, 38, 48, 42, OUT, 3);
  } },
  spinner: { w: 152, h: 142, snd: 'chime', draw(c) {
    rrect(c, 0, 92, 152, 50, 10); paint(c, '#9aa3b5'); rrect(c, 8, 86, 136, 14, 6); paint(c, '#7fd0f0', 2.5);
    for (let x = 18; x < 140; x += 30) { rrect(c, x, 106, 18, 26, 4); paint(c, '#8a93a5', 2); }
    rrect(c, 62, 30, 28, 62, 5); paint(c, '#b0b8c8'); ell(c, 76, 30, 22, 8); paint(c, '#c8d0dc');
    for (let i = 0; i < 3; i++) line(c, 64, 46 + i * 14, 88, 46 + i * 14, '#8a93a5', 2.5);
  } },
  boss: { w: 180, h: 192, count: false, draw(c) {
    ell(c, 60, 184, 24, 9); paint(c, '#4b2a6b'); ell(c, 120, 184, 24, 9); paint(c, '#4b2a6b');
    circ(c, 8, 118, 15); paint(c, '#fff'); circ(c, 172, 118, 15); paint(c, '#fff');
    c.beginPath(); c.moveTo(90, 18); c.bezierCurveTo(152, 18, 176, 112, 168, 158); c.bezierCurveTo(162, 188, 18, 188, 12, 158); c.bezierCurveTo(4, 112, 28, 18, 90, 18); paint(c, '#b8a4f2');
    ell(c, 90, 140, 50, 38); paint(c, '#ece4ff', 0);
    c.beginPath(); c.moveTo(36, 100); c.quadraticCurveTo(70, 118, 74, 176); c.lineTo(28, 168); c.quadraticCurveTo(16, 132, 36, 100); paint(c, '#6b3fa0', 2.5);
    c.beginPath(); c.moveTo(144, 100); c.quadraticCurveTo(110, 118, 106, 176); c.lineTo(152, 168); c.quadraticCurveTo(164, 132, 144, 100); paint(c, '#6b3fa0', 2.5);
    for (let i = 0; i < 3; i++) { circ(c, 78, 130 + i * 16, 3.5); paint(c, '#ffd23f', 1.5); }
    poly(c, [90, 110, 68, 100, 68, 122]); paint(c, '#e8443a', 2.5); poly(c, [90, 110, 112, 100, 112, 122]); paint(c, '#e8443a', 2.5); circ(c, 90, 110, 5); paint(c, '#c0302a', 2);
  } }
};
// solid blocks you jump on
function drawSolid(c, s) {
  const { x, y, w, h, kind } = s;
  if (kind === 'crate') {
    for (let yy = y; yy < y + h - 1; yy += 70) {
      rrect(c, x, yy, w, 70, 3); paint(c, '#c98a45'); rrect(c, x + 6, yy + 6, w - 12, 58, 2); paint(c, null, 2.5);
      line(c, x + 8, yy + 8, x + w - 8, yy + 62, OUT, 3);
    }
  } else if (kind === 'hay') {
    for (let yy = y; yy < y + h - 1; yy += 70) { rrect(c, x, yy, w, 70, 10); paint(c, '#f0cc5a'); for (let i = 1; i < 6; i++) line(c, x + 6, yy + i * 12, x + w - 6, yy + i * 12, '#d8a83a', 2); line(c, x + w * 0.3, yy, x + w * 0.3, yy + 70, '#a0662f', 3); line(c, x + w * 0.7, yy, x + w * 0.7, yy + 70, '#a0662f', 3); }
  } else if (kind === 'stone') {
    const col = s.theme === 'swamp' ? '#77738a' : '#b9b3a6';
    for (let yy = y; yy < y + h - 1; yy += 35) for (let xx = x - ((yy - y) / 35 % 2) * 17; xx < x + w; xx += 34) {
      const x0 = Math.max(x, xx), x1 = Math.min(x + w, xx + 34); rrect(c, x0, yy, x1 - x0, 35, 4); paint(c, col, 2.5);
    }
    rrect(c, x, y, w, h, 4); paint(c, null, 3);
  } else {
    c.beginPath(); c.moveTo(x, y + h); c.quadraticCurveTo(x - 4, y + 10, x + w * 0.4, y); c.quadraticCurveTo(x + w + 6, y - 4, x + w, y + h); c.closePath();
    paint(c, s.theme === 'swamp' ? '#6a6478' : '#a8a6b0'); ell(c, x + w * 0.35, y + 16, 12, 5); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill();
  }
}
function drawPlat(c, p, theme, t) {
  if (p.style === 'none') return;
  if (p.style === 'roof') {
    rrect(c, p.x, p.y, p.w, GROUND - p.y, 2); paint(c, '#8f6aa8');
    for (let y = p.y + 30; y < GROUND - 40; y += 56) for (let x = p.x + 24; x < p.x + p.w - 40; x += 66) win(c, x, y, 36, 34);
    rrect(c, p.x - 8, p.y - 4, p.w + 16, 14, 3); paint(c, '#6d4f82'); return;
  }
  if (p.style === 'lift') {
    for (const x of [p.x - 10, p.x + p.w + 2]) { rrect(c, x, p.y1 - 40, 8, GROUND - p.y1 + 40, 2); paint(c, '#9aa0ab', 2.5); }
    rrect(c, p.x - 14, p.y1 - 48, p.w + 28, 12, 4); paint(c, '#6d7c88');
    line(c, p.x + 20, p.y1 - 36, p.x + 20, p.y, '#555', 2); line(c, p.x + p.w - 20, p.y1 - 36, p.x + p.w - 20, p.y, '#555', 2);
    rrect(c, p.x, p.y, p.w, 18, 4); paint(c, '#ffd23f');
    c.save(); rrect(c, p.x, p.y, p.w, 18, 4); c.clip(); c.fillStyle = OUT; for (let x = p.x - 20; x < p.x + p.w; x += 22) { poly(c, [x, p.y + 18, x + 10, p.y, x + 20, p.y, x + 10, p.y + 18]); c.fill(); } c.restore();
    rrect(c, p.x, p.y, p.w, 18, 4); paint(c, null, 3);
    if (p.y > p.y1 + 4) { const bob = Math.sin((t || 0) * 5) * 4; poly(c, [p.x + p.w / 2, p.y - 38 + bob, p.x + p.w / 2 - 14, p.y - 20 + bob, p.x + p.w / 2 + 14, p.y - 20 + bob]); paint(c, '#43c46b', 2.5); }
    return;
  }
  if (p.style === 'float') {
    const col = { swamp: '#8e8a9c', beach: '#b5895a', farm: '#c98a45' }[theme] || '#c98a45';
    rrect(c, p.x, p.y, p.w, 16, 6); paint(c, col);
    for (let x = p.x + 24; x < p.x + p.w - 10; x += 26) line(c, x, p.y + 3, x, p.y + 13, 'rgba(0,0,0,.25)', 2);
    c.globalAlpha = 0.25; ell(c, p.x + p.w / 2, GROUND + 6, p.w / 2, 5); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
    return;
  }
  const col = { wood: '#c98a45', pier: '#b5895a', stone: '#8e8a9c' }[p.style] || '#c98a45';
  const post = p.style === 'stone' ? '#77738a' : p.style === 'pier' ? '#8a6a44' : '#9aa0ab';
  for (const x of [p.x + 14, p.x + p.w - 22]) { rrect(c, x, p.y + 10, 8, GROUND - p.y - 10, 2); paint(c, post, 2.5); }
  if (p.style === 'wood') { line(c, p.x + 18, p.y + 14, p.x + p.w - 18, GROUND - 4, '#9aa0ab', 4); }
  rrect(c, p.x, p.y, p.w, 14, 4); paint(c, col);
  for (let x = p.x + 30; x < p.x + p.w - 10; x += 30) line(c, x, p.y + 2, x, p.y + 12, 'rgba(0,0,0,.25)', 2);
}
function drawHydrant(c, x, active) {
  const y = GROUND;
  rrect(c, x - 14, y - 46, 28, 46, 6); paint(c, '#e8443a'); rrect(c, x - 18, y - 52, 36, 9, 4); paint(c, '#c0302a');
  ell(c, x, y - 52, 10, 9); paint(c, '#e8443a'); rrect(c, x - 22, y - 34, 44, 10, 4); paint(c, '#c0302a');
  rrect(c, x - 18, y - 6, 36, 6, 2); paint(c, '#c0302a', 2);
  // checkpoint flag
  line(c, x + 26, y, x + 26, y - 80, OUT, 3);
  poly(c, [x + 26, y - 80, x + 52, y - 72, x + 26, y - 64]); paint(c, active ? '#43c46b' : '#bbb', 2);
}
function drawSign(c, x, kind, t) {
  const y = GROUND;
  for (const xx of [x + 16, x + 104]) { rrect(c, xx, y - 70, 8, 70, 2); paint(c, '#8a5a2b'); }
  rrect(c, x, y - 150, 128, 88, 6); paint(c, '#a0662f'); rrect(c, x + 7, y - 143, 114, 74, 3); paint(c, '#2f6b4f', 2);
  const cx = x + 64, cy = y - 106; c.strokeStyle = '#f3f3e8'; c.fillStyle = '#f3f3e8'; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
  const arrowBox = (bx, dir) => { rrect(c, bx - 14, cy - 13, 28, 26, 4); c.stroke(); c.beginPath(); c.moveTo(bx - 7 * dir, cy); c.lineTo(bx + 7 * dir, cy); c.moveTo(bx + 1 * dir, cy - 6); c.lineTo(bx + 7 * dir, cy); c.lineTo(bx + 1 * dir, cy + 6); c.stroke(); };
  if (kind === 'move') { arrowBox(cx - 34, -1); arrowBox(cx - 2, 1); stick(c, cx + 34, cy + 16, Math.sin(t * 6)); }
  else if (kind === 'jump') { circ(c, cx - 26, cy, 16); c.stroke(); c.beginPath(); c.moveTo(cx - 26, cy + 7); c.lineTo(cx - 26, cy - 7); c.moveTo(cx - 32, cy - 2); c.lineTo(cx - 26, cy - 8); c.lineTo(cx - 20, cy - 2); c.stroke(); stick(c, cx + 26, cy + 14 - Math.abs(Math.sin(t * 3)) * 16, 0.6); }
  else if (kind === 'spray') {
    circ(c, cx - 30, cy, 16); c.stroke(); dropShape(c, cx - 30, cy, 7); c.stroke();
    stick(c, cx + 2, cy + 16, 0); c.beginPath(); c.moveTo(cx + 10, cy - 2); c.lineTo(cx + 22, cy - 2); c.stroke();
    c.setLineDash([4, 5]); c.lineDashOffset = -t * 30; c.beginPath(); c.moveTo(cx + 24, cy - 2); c.lineTo(cx + 50, cy - 10); c.stroke(); c.setLineDash([]);
  } else if (kind === 'tank') {
    rrect(c, cx - 40, cy - 2, 16, 20, 4); c.stroke(); circ(c, cx - 32, cy - 6, 6); c.stroke();
    dropShape(c, cx, cy, 9); c.stroke(); c.beginPath(); c.moveTo(cx + 26, cy + 14); c.lineTo(cx + 26, cy - 14); c.moveTo(cx + 18, cy - 6); c.lineTo(cx + 26, cy - 14); c.lineTo(cx + 34, cy - 6); c.stroke();
  } else if (kind === 'nozzle') {
    const cols = ['#36c25b', '#ef4a3c', '#f2f2f2']; for (let i = 0; i < 3; i++) { circ(c, cx - 30 + i * 30, cy, 11); c.fillStyle = cols[i]; c.fill(); c.stroke(); }
    c.fillStyle = '#f3f3e8'; c.beginPath(); c.moveTo(cx - 30, cy + 26); c.lineTo(cx - 36, cy + 18); c.lineTo(cx - 24, cy + 18); c.fill();
  }
}
function stick(c, x, y, ph) {
  c.beginPath(); c.arc(x, y - 30, 5, 0, TAU); c.stroke();
  c.beginPath(); c.moveTo(x, y - 25); c.lineTo(x, y - 10); c.lineTo(x - 6 * ph, y); c.moveTo(x, y - 10); c.lineTo(x + 6 * ph, y); c.moveTo(x - 7, y - 20); c.lineTo(x + 7, y - 20); c.stroke();
}
function dropShape(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r * 1.6); c.quadraticCurveTo(x + r * 1.1, y - r * 0.2, x + r * 0.9, y + r * 0.3); c.arc(x, y + r * 0.3, r * 0.9, 0, Math.PI); c.quadraticCurveTo(x - r * 1.1, y - r * 0.2, x, y - r * 1.6); }
function drawWall(c, x, t, melt, swamp) {
  const h = 220 * (1 - melt), w = 76;
  if (h < 2) return;
  const y = GROUND;
  c.beginPath(); c.moveTo(x - 4, y);
  for (let i = 0; i <= 10; i++) { const yy = y - h * (i / 10); c.lineTo(x + Math.sin(t * 3 + i) * 4, yy); }
  c.quadraticCurveTo(x + w / 2, y - h - 26, x + w, y - h);
  for (let i = 10; i >= 0; i--) { const yy = y - h * (i / 10); c.lineTo(x + w + Math.sin(t * 3 + i + 2) * 4, yy); }
  c.closePath(); paint(c, swamp ? '#4e7a1e' : '#6f9a2a', 3);
  c.fillStyle = 'rgba(200,255,120,.35)'; for (let i = 0; i < 5; i++) { circ(c, x + 14 + (i * 23) % 50, y - 30 - i * 38 * (1 - melt), 6 + i % 3 * 2); c.fill(); }
  if (melt < 0.4) {
    const ey = y - h + 50; ell(c, x + 26, ey, 9, 11); paint(c, '#fff', 2); ell(c, x + 50, ey, 9, 11); paint(c, '#fff', 2);
    circ(c, x + 24, ey + 2, 4); paint(c, OUT, 0); circ(c, x + 48, ey + 2, 4); paint(c, OUT, 0);
    line(c, x + 16, ey - 16, x + 32, ey - 10, OUT, 3); line(c, x + 60, ey - 16, x + 44, ey - 10, OUT, 3);
    c.beginPath(); c.arc(x + 38, ey + 32, 10, Math.PI + 0.3, -0.3); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  }
}
function drawFinish(c, x, t, open) {
  const y = GROUND;
  rrect(c, x - 4, y - 200, 10, 200, 3); paint(c, '#ddd');
  const lift = open ? 0 : 120;
  c.beginPath(); c.moveTo(x + 6, y - 196 + lift);
  for (let i = 0; i <= 8; i++) c.lineTo(x + 6 + i * 10, y - 196 + lift + Math.sin(t * 6 + i) * 4 * (i / 8));
  for (let i = 8; i >= 0; i--) c.lineTo(x + 6 + i * 10, y - 140 + lift + Math.sin(t * 6 + i) * 4 * (i / 8));
  c.closePath(); paint(c, open ? '#3a8cf0' : '#999');
  dropShape(c, x + 46, y - 166 + lift, 10); paint(c, '#fff', 2);
  circ(c, x + 1, y - 204, 7); paint(c, '#ffd23f', 2);
}
function drawSpinnerHead(c, x, y, ang, done, t) {
  if (done) {
    c.strokeStyle = 'rgba(150,215,255,.9)'; c.lineWidth = 4;
    for (const s of [-1, 1]) for (const k of [0.6, 1]) { c.beginPath(); c.moveTo(x, y - 6); c.quadraticCurveTo(x + s * 40 * k, y - 50 - Math.sin(t * 6) * 4, x + s * 62 * k, y + 50); c.stroke(); }
    if (Math.random() < 0.3) { c.globalAlpha = 0.8; star(c, x + (Math.random() - 0.5) * 80, y - 30 + Math.random() * 40, 5, 4, 0.35); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1; }
  }
  c.save(); c.translate(x, y);
  for (let i = 0; i < 4; i++) {
    const a = ang + i * Math.PI / 2, ex = Math.cos(a) * 28, ey = Math.sin(a) * 8;
    line(c, 0, 0, ex, ey, OUT, 9); line(c, 0, 0, ex, ey, done ? '#c8d0dc' : '#8a6a44', 5);
    circ(c, ex, ey, 6); paint(c, done ? '#7fd0f0' : '#6b4526', 2.5);
  }
  circ(c, 0, 0, 10); paint(c, done ? '#ffd23f' : '#5a3a20', 3);
  c.restore();
}
function drawWave(c, e, t) {
  const s = e.size, W = 120 * s, H = 96 * s;
  c.save(); c.translate(e.x, GROUND + 2); c.scale(-e.dir, 1);
  const wob = Math.sin(t * 8) * 4 * s;
  c.beginPath(); c.moveTo(W * 0.6, 0);
  c.quadraticCurveTo(W * 0.62, -H * 0.55, W * 0.15 + wob, -H);
  c.quadraticCurveTo(-W * 0.25, -H * 1.1, -W * 0.42, -H * 0.62);
  c.quadraticCurveTo(-W * 0.22, -H * 0.82, -W * 0.18, -H * 0.5);
  c.quadraticCurveTo(-W * 0.3, -H * 0.15, -W * 0.6, 0);
  c.closePath();
  const g = c.createLinearGradient(0, -H, 0, 0); g.addColorStop(0, e.flash > 0 ? '#c8e6a0' : '#9fd04a'); g.addColorStop(1, '#4f7a1a');
  paint(c, g, 3);
  c.fillStyle = 'rgba(230,255,190,.75)';
  for (let i = 0; i < 4; i++) { circ(c, -W * 0.38 + i * 12 * s, -H * 0.66 - Math.sin(t * 6 + i) * 3, (5 - i) * s + 1); c.fill(); }
  ell(c, -W * 0.02, -H * 0.62, 8 * s, 10 * s); paint(c, '#fff', 2); ell(c, W * 0.2, -H * 0.62, 8 * s, 10 * s); paint(c, '#fff', 2);
  circ(c, -W * 0.05, -H * 0.6, 3.5 * s); paint(c, OUT, 0); circ(c, W * 0.17, -H * 0.6, 3.5 * s); paint(c, OUT, 0);
  line(c, -W * 0.12, -H * 0.8, W * 0.05, -H * 0.72, OUT, 3); line(c, W * 0.3, -H * 0.8, W * 0.14, -H * 0.72, OUT, 3);
  c.beginPath(); c.arc(W * 0.08, -H * 0.36, 9 * s, 0.2, Math.PI - 0.2); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
  c.restore();
}
function drawCoin(c, x, y, t) {
  const sx = Math.abs(Math.cos(t * 5)) * 0.8 + 0.2;
  c.save(); c.translate(x, y); c.scale(sx, 1); circ(c, 0, 0, 10); paint(c, '#ffd23f', 2.5); circ(c, 0, 0, 6); paint(c, '#ffb300', 0);
  c.fillStyle = 'rgba(255,255,255,.8)'; ell(c, -3, -4, 2.5, 4, 0.5); c.fill(); c.restore();
}
function drawBlob(c, e, t, swamp) {
  const r = e.r * (0.45 + 0.55 * Math.max(0, e.hp) / (e.hp0 || 1)), x = e.x, y = e.y;
  const sq = Math.abs(Math.sin(e.hop)) * 0.15;
  c.save(); c.translate(x, y - Math.abs(Math.sin(e.hop)) * 8);
  c.beginPath(); c.moveTo(-r * 1.15, 0);
  c.bezierCurveTo(-r * 1.2, -r * (1.5 - sq), r * 1.2, -r * (1.5 - sq), r * 1.15, 0);
  for (let i = 0; i < 5; i++) c.quadraticCurveTo(r * 1.15 - (i + 0.5) * r * 0.46, 6 + (i % 2) * 4, r * 1.15 - (i + 1) * r * 0.46, 0);
  c.closePath(); paint(c, e.flash > 0 ? '#c9a07a' : (swamp ? '#5f8a26' : '#7b5431'));
  c.fillStyle = 'rgba(255,255,255,.25)'; ell(c, -r * 0.4, -r * 0.9, r * 0.25, r * 0.15, -0.5); c.fill();
  const lx = e.dir * r * 0.15;
  ell(c, lx - r * 0.35, -r * 0.65, r * 0.22, r * 0.28); paint(c, '#fff', 2); ell(c, lx + r * 0.35, -r * 0.65, r * 0.22, r * 0.28); paint(c, '#fff', 2);
  circ(c, lx - r * 0.3 + e.dir * 2, -r * 0.6, r * 0.1); paint(c, OUT, 0); circ(c, lx + r * 0.4 + e.dir * 2, -r * 0.6, r * 0.1); paint(c, OUT, 0);
  line(c, lx - r * 0.6, -r * 1.0, lx - r * 0.15, -r * 0.85, OUT, 2.5); line(c, lx + r * 0.6, -r * 1.0, lx + r * 0.15, -r * 0.85, OUT, 2.5);
  c.beginPath(); c.arc(lx, -r * 0.2, r * 0.25, Math.PI + 0.4, -0.4); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
  c.restore();
}
function drawBird(c, e, t) {
  const flap = Math.sin(t * 14 + e.x) * 0.8;
  c.save(); c.translate(e.x, e.y); c.scale(e.dir, 1);
  poly(c, [-6, -4, -30, -18 - flap * 14, -14, 2]); paint(c, e.flash > 0 ? '#8a7aa0' : '#4a3a5a', 2.5);
  ell(c, 0, 0, 22, 14); paint(c, e.flash > 0 ? '#8a7aa0' : '#4a3a5a');
  poly(c, [6, -4, 30, -18 - flap * 14, 16, 2]); paint(c, e.flash > 0 ? '#9a8ab0' : '#5a4a6a', 2.5);
  circ(c, 20, -8, 11); paint(c, e.flash > 0 ? '#8a7aa0' : '#4a3a5a'); poly(c, [28, -10, 40, -6, 28, -3]); paint(c, '#ffb627', 2);
  circ(c, 23, -11, 3.5); paint(c, '#fff', 1.5); circ(c, 24, -11, 1.6); paint(c, OUT, 0); line(c, 18, -17, 27, -14, OUT, 2.5);
  c.fillStyle = '#6f9a2a'; ell(c, -4, 13, 3, 5); c.fill();
  c.restore();
}
function drawBall(c, b, t, swamp) {
  const r = b.r * (0.6 + 0.4 * Math.max(0, b.hp / b.hp0));
  ell(c, b.x, b.y, r * (1 + Math.sin(t * 20) * 0.08), r * (1 - Math.sin(t * 20) * 0.08)); paint(c, swamp || b.slime ? '#6f9a2a' : '#7b5431', 2.5);
  c.fillStyle = 'rgba(255,255,255,.35)'; circ(c, b.x - r * 0.35, b.y - r * 0.35, r * 0.28); c.fill();
}

// ---------------------------------------------------------------- boss face (drawn over the body each frame)
// x,y = top-left of the 180x192 body. st: {clean 0..1, mood, look, t, blink}
function drawBossFace(c, x, y, st) {
  const clean = st.clean, mood = st.mood;
  c.save(); c.translate(x, y); c.lineCap = 'round'; c.lineJoin = 'round';
  const L = (st.look || 0) * 4;
  for (const ex of [68, 112]) {
    ell(c, ex, 62, 13, 15); paint(c, '#fff', 2.5);
    if (mood === 'happy') { c.fillStyle = '#fff'; c.beginPath(); c.arc(ex, 66, 9, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke(); }
    else if (st.blink) line(c, ex - 9, 63, ex + 9, 63, OUT, 3);
    else { circ(c, ex + L, mood === 'hit' ? 60 : 64, mood === 'hit' ? 4 : 5.5); paint(c, OUT, 0); circ(c, ex + L - 1.5, 62, 1.5); paint(c, '#fff', 0); }
  }
  if (mood === 'happy') { c.globalAlpha = 0.5; circ(c, 52, 86, 7); paint(c, '#ff7fa3', 0); circ(c, 128, 86, 7); paint(c, '#ff7fa3', 0); c.globalAlpha = 1; }
  else if (mood !== 'hit') { line(c, 52, 42 - (mood === 'laugh' ? 2 : 0), 78, 50, OUT, 4); line(c, 128, 42 - (mood === 'laugh' ? 2 : 0), 102, 50, OUT, 4); }
  else { line(c, 54, 44, 78, 40, OUT, 4); line(c, 126, 44, 102, 40, OUT, 4); }
  // monocle
  circ(c, 112, 62, 17); c.strokeStyle = '#d8a828'; c.lineWidth = 3; c.stroke();
  c.beginPath(); c.moveTo(126, 70); c.quadraticCurveTo(140, 96, 132, 116); c.strokeStyle = '#d8a828'; c.lineWidth = 1.5; c.stroke();
  // mustache
  const mc = clean > 0.95 ? '#f5f0ff' : '#3d4a14';
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(90, 80); c.bezierCurveTo(90 + s * 16, 72, 90 + s * 34, 76, 90 + s * 38, 86);
    c.bezierCurveTo(90 + s * 40, 94, 90 + s * 30, 94, 90 + s * 32, 86); c.bezierCurveTo(90 + s * 24, 88, 90 + s * 12, 88, 90, 86); c.closePath(); paint(c, mc, 2.5);
  }
  // mouth
  if (mood === 'laugh') { c.beginPath(); c.moveTo(74, 92); c.quadraticCurveTo(90, 120, 106, 92); c.closePath(); paint(c, '#5a1a2a', 2.5); rrect(c, 80, 92, 20, 6, 2); paint(c, '#fff', 0); }
  else if (mood === 'hit') { ell(c, 90, 98, 7, 8); paint(c, '#5a1a2a', 2.5); }
  else if (mood === 'happy') { c.beginPath(); c.moveTo(72, 92); c.quadraticCurveTo(90, 116, 108, 92); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke(); }
  else { c.beginPath(); c.moveTo(78, 98); c.quadraticCurveTo(90, 92, 102, 98); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke(); }
  // top hat
  c.save(); c.translate(90, 22); c.rotate(-0.12 + (st.hatHop || 0));
  rrect(c, -28, -58, 56, 56, 4); paint(c, '#2a2238'); ell(c, 0, -2, 44, 8); paint(c, '#2a2238');
  rrect(c, -28, -18, 56, 10, 2); paint(c, clean > 0.95 ? '#9b5de5' : '#6f9a2a', 2);
  if (clean > 0.95) { star(c, 18, -13, 8, 5); paint(c, '#ffd23f', 1.5); }
  else { c.fillStyle = '#6f9a2a'; ell(c, -12, -6, 3, 7); c.fill(); ell(c, 10, -4, 2.5, 6); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.2)'; c.fillRect(-20, -54, 8, 34);
  c.restore();
  c.restore();
}

// ---------------------------------------------------------------- backgrounds
const BG_CACHE = {};
function themeInfo(theme) {
  return {
    street: { sky: ['#5cc6ff', '#c9efff'], gTop: '#a7afb9', gMid: '#6cc04a', gFill: '#5aa83c', seam: '#8e96a0' },
    park:   { sky: ['#62c9ff', '#d4f3ff'], gTop: '#7ed957', gMid: '#c8925a', gFill: '#b37d47', seam: '#5fb33f' },
    city:   { sky: ['#7fb2ff', '#e2ecff'], gTop: '#b8bec7', gMid: '#4c4f58', gFill: '#3f424a', seam: '#9aa1ab' },
    beach:  { sky: ['#44c2ff', '#fff0c9'], gTop: '#f6dc96', gMid: '#efcf7f', gFill: '#e6c06c', seam: '#e0c27a' },
    farm:   { sky: ['#6fd0ff', '#fff7d6'], gTop: '#86d65a', gMid: '#a8743f', gFill: '#966534', seam: '#6ab843' },
    swamp:  { sky: ['#3b2a5a', '#7f9a6a'], gTop: '#5a7a32', gMid: '#3c4a28', gFill: '#2e3a20', seam: '#4a6a28' },
    school: { sky: ['#66c8ff', '#e0f6ff'], gTop: '#8a8f99', gMid: '#6cc04a', gFill: '#5aa83c', seam: '#767b85' },
    airport:{ sky: ['#8fd0ff', '#eef8ff'], gTop: '#9aa1ab', gMid: '#5a5e68', gFill: '#4a4e57', seam: '#848a94' },
    carnival:{ sky: ['#ff9fc0', '#ffe9b0'], gTop: '#e8c78a', gMid: '#d6ad6a', gFill: '#c49a5a', seam: '#d4b070' },
    station:{ sky: ['#9ab8e8', '#f0e6d8'], gTop: '#c4c8ce', gMid: '#7a6a5a', gFill: '#5a4e44', seam: '#ffd23f' }
  }[theme];
}
function getBg(theme) {
  if (BG_CACHE[theme]) return BG_CACHE[theme];
  const S = 1.25, FW = 1200, MW = 1600, H = 470;
  const far = mkCanvas(FW * S, H * S), mid = mkCanvas(MW * S, H * S);
  const f = far.getContext('2d'), m = mid.getContext('2d'); f.scale(S, S); m.scale(S, S);
  for (const k of [f, m]) { k.lineJoin = 'round'; k.lineCap = 'round'; }
  const r = rng(theme.length * 999 + 7);
  const hills = (k, W, y0, amp, col, n) => { k.beginPath(); k.moveTo(0, H); for (let x = 0; x <= W; x += 20) k.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(x / W * TAU * n))); k.lineTo(W, H); k.closePath(); k.fillStyle = col; k.fill(); };
  const tree = (k, x, s, col) => { rrect(k, x - 6 * s, GROUND - 60 * s, 12 * s, 60 * s, 3); paint(k, '#8a5a2b', 2); for (const [dx, dy, rr] of [[0, -90, 34], [-24, -70, 26], [24, -70, 26]]) { circ(k, x + dx * s, GROUND + dy * s, rr * s); paint(k, col, 2.5); } };
  const house = (k, x, w, h, col, roof) => { rrect(k, x, GROUND - h, w, h, 2); paint(k, col, 2); poly(k, [x - 8, GROUND - h, x + w / 2, GROUND - h - w * 0.45, x + w + 8, GROUND - h]); paint(k, roof, 2); win(k, x + w * 0.2, GROUND - h * 0.7, w * 0.25, h * 0.3); rrect(k, x + w * 0.58, GROUND - h * 0.5, w * 0.22, h * 0.5, 2); paint(k, '#7a4a2b', 2); };
  if (theme === 'street' || theme === 'park') {
    hills(f, FW, 330, 60, '#a6dd8a', 2); hills(f, FW, 380, 40, '#8ccf6c', 3);
    if (theme === 'street') for (let x = 40; x < FW; x += 170 + r() * 60) { f.globalAlpha = 0.85; house(f, x, 60, 50, ['#f6e1a6', '#bfe1f5', '#f7c6c6'][(x | 0) % 3], '#d27a62'); f.globalAlpha = 1; }
    else for (let x = 30; x < FW; x += 80 + r() * 50) { circ(f, x, 360 - r() * 20, 26 + r() * 14); f.fillStyle = '#6fbf55'; f.fill(); }
    for (let x = 60; x < MW; x += 240 + r() * 160) tree(m, x, 0.9 + r() * 0.5, theme === 'park' ? '#4fb548' : '#5cb85c');
    for (let x = 10; x < MW; x += 70 + r() * 80) { ell(m, x, GROUND - 6, 30, 18); paint(m, '#4cae4c', 2); }
    if (theme === 'park') for (let x = 0; x < MW; x += 30 + r() * 30) { circ(m, x, GROUND - 4 - r() * 8, 4); m.fillStyle = ['#ff5fa2', '#ffd23f', '#fff'][(x | 0) % 3]; m.fill(); }
  } else if (theme === 'city') {
    for (let x = 0; x < FW; x += 70 + r() * 40) { const h = 150 + r() * 200; f.fillStyle = ['#9db3d8', '#b0c2e2', '#8aa2cc'][(x | 0) % 3]; f.fillRect(x, GROUND - h, 64, h); f.fillStyle = 'rgba(255,255,255,.35)'; for (let y = GROUND - h + 12; y < GROUND - 20; y += 22) for (let xx = x + 8; xx < x + 56; xx += 16) f.fillRect(xx, y, 8, 10); }
    for (let x = 0; x < MW; x += 200 + r() * 80) { const h = 220 + r() * 120, w = 160 + r() * 40; rrect(m, x, GROUND - h, w, h, 2); paint(m, ['#d98b6a', '#c9a27a', '#a77fb8', '#7aa6a0'][(x | 0) % 4], 2.5); for (let y = GROUND - h + 20; y < GROUND - 70; y += 48) for (let xx = x + 16; xx < x + w - 30; xx += 44) win(m, xx, y, 28, 32); }
    for (let x = 100; x < MW; x += 400) { line(m, x, GROUND, x, GROUND - 160, OUT, 7); line(m, x, GROUND, x, GROUND - 160, '#556', 3); ell(m, x + 10, GROUND - 160, 16, 8); paint(m, '#ffe680', 2); }
  } else if (theme === 'beach') {
    f.fillStyle = '#3fb2d9'; f.fillRect(0, 300, FW, 200); f.fillStyle = '#62c6e6'; for (let x = 0; x < FW; x += 60) { ell(f, x + r() * 30, 320 + r() * 60, 18, 3); f.fill(); }
    for (let x = 100; x < FW; x += 350) { poly(f, [x, 300, x + 30, 300, x + 15, 250]); f.fillStyle = '#fff'; f.fill(); f.fillStyle = '#8a5a2b'; f.fillRect(x - 6, 300, 42, 8); }
    ell(f, 800, 300, 120, 30); f.fillStyle = '#6fbf55'; f.fill();
    hills(m, MW, 440, 30, '#f2d08a', 3);
    for (let x = 80; x < MW; x += 300 + r() * 150) { m.beginPath(); m.moveTo(x, GROUND); m.quadraticCurveTo(x + 10, GROUND - 110, x + 30, GROUND - 200); m.lineWidth = 14; m.strokeStyle = OUT; m.stroke(); m.lineWidth = 9; m.strokeStyle = '#a0662f'; m.stroke(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.6; ell(m, x + 30 + Math.cos(a) * 34, GROUND - 200 + Math.sin(a) * 18 + 10, 40, 10, a); paint(m, '#43a047', 2.5); } }
    for (let x = 300; x < MW; x += 500) { line(m, x, GROUND, x, GROUND - 110, OUT, 4); m.beginPath(); m.moveTo(x - 60, GROUND - 100); m.quadraticCurveTo(x, GROUND - 150, x + 60, GROUND - 100); m.closePath(); paint(m, '#ff7eb6', 2.5); }
  } else if (theme === 'farm') {
    hills(f, FW, 330, 50, '#b8e07a', 2);
    for (let i = 0; i < 6; i++) { f.fillStyle = i % 2 ? '#e8d27a' : '#9fd36a'; f.fillRect(0, 360 + i * 18, FW, 18); }
    for (const x of [300, 900]) { line(f, x, 380, x, 260, OUT, 6); line(f, x, 380, x, 260, '#fff', 3); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.3; line(f, x, 260, x + Math.cos(a) * 40, 260 + Math.sin(a) * 40, '#fff', 6); } }
    for (let x = 0; x < MW; x += 50) { rrect(m, x, GROUND - 50, 8, 50, 2); paint(m, '#c98a45', 2); } m.fillStyle = '#c98a45'; m.fillRect(0, GROUND - 42, MW, 7); m.fillRect(0, GROUND - 24, MW, 7);
    for (let x = 100; x < MW; x += 260 + r() * 100) { line(m, x, GROUND, x, GROUND - 90, '#43a047', 4); circ(m, x, GROUND - 96, 14); paint(m, '#ffd23f', 2.5); circ(m, x, GROUND - 96, 6); paint(m, '#8a5a2b', 0); }
  } else if (theme === 'school') {
    hills(f, FW, 340, 50, '#a6dd8a', 2);
    for (let x = 60; x < FW; x += 260) { f.globalAlpha = 0.8; house(f, x, 90, 60, '#e8b49a', '#b05a3a'); f.globalAlpha = 1; }
    for (let x = 60; x < MW; x += 300 + r() * 120) tree(m, x, 1 + r() * 0.3, '#5cb85c');
    for (let x = 0; x < MW; x += 24) line(m, x, GROUND, x, GROUND - 46, '#8a9099', 3); m.fillStyle = '#8a9099'; m.fillRect(0, GROUND - 46, MW, 4);
    for (const x of [500, 1300]) { line(m, x, GROUND, x, GROUND - 230, OUT, 5); line(m, x, GROUND, x, GROUND - 230, '#ddd', 2); rrect(m, x, GROUND - 228, 60, 38, 2); paint(m, '#3a8cf0', 2); star(m, x + 30, GROUND - 209, 9, 5); paint(m, '#fff', 0); }
  } else if (theme === 'airport') {
    for (let x = 0; x < FW; x += 300) { c2(f, x); }
    function c2(k, x) { k.fillStyle = '#b8c4d4'; k.beginPath(); k.moveTo(x + 20, 400); k.quadraticCurveTo(x + 120, 260, x + 220, 400); k.fill(); }
    f.fillStyle = '#c8d2de'; f.fillRect(0, 400, FW, 70);
    for (let x = 200; x < FW; x += 500) { f.save(); f.translate(x, 140); f.rotate(-0.15); f.fillStyle = 'rgba(255,255,255,.9)'; ell(f, 0, 0, 50, 8); f.fill(); poly(f, [-10, 0, 10, 0, -6, 26]); f.fill(); poly(f, [-44, 0, -36, 0, -50, -14]); f.fill(); f.restore(); }
    for (let x = 100; x < MW; x += 120) { circ(m, x, GROUND - 6, 5); paint(m, x % 240 ? '#3a8cf0' : '#ffd23f', 2); }
    for (const x of [400, 1200]) { line(m, x, GROUND, x, GROUND - 120, OUT, 4); poly(m, [x, GROUND - 120, x + 50, GROUND - 112, x + 50, GROUND - 100, x, GROUND - 96]); paint(m, '#ff7a3c', 2.5); }
    rrect(m, 700, GROUND - 160, 320, 160, 4); paint(m, '#a8b4c0'); c3(m);
    function c3(k) { k.beginPath(); k.moveTo(700, GROUND - 160); k.quadraticCurveTo(860, GROUND - 230, 1020, GROUND - 160); k.closePath(); paint(k, '#8e9ba6'); rrect(k, 740, GROUND - 110, 240, 110, 2); paint(k, '#4a5560'); }
  } else if (theme === 'carnival') {
    for (let x = 0; x < FW; x += 200 + r() * 80) { const h = 90 + r() * 60, w = 120; f.globalAlpha = 0.85; poly(f, [x, 430, x + w / 2, 430 - h, x + w, 430]); f.fillStyle = (x | 0) % 2 ? '#ff9fc0' : '#9fd8ff'; f.fill(); f.globalAlpha = 1; }
    f.fillStyle = '#e8c08a'; f.fillRect(0, 430, FW, 40);
    m.strokeStyle = OUT; m.lineWidth = 2; m.beginPath(); for (let x = 0; x <= MW; x += 200) { m.moveTo(x, 150); m.quadraticCurveTo(x + 100, 200, x + 200, 150); } m.stroke();
    for (let x = 10; x < MW; x += 25) { const yy = 150 + 50 * Math.sin(((x % 200) / 200) * Math.PI) * 0.5; poly(m, [x, yy, x + 12, yy, x + 6, yy + 16]); m.fillStyle = ['#ef4a3c', '#ffd23f', '#3a8cf0', '#43c46b'][(x / 25 | 0) % 4]; m.fill(); }
    for (let x = 150; x < MW; x += 360) { for (let i = 0; i < 3; i++) { line(m, x + i * 16, GROUND - 40, x + i * 16 - 10 + i * 10, GROUND - 150 - i * 12, '#555', 1.5); ell(m, x + i * 16 - 10 + i * 10, GROUND - 160 - i * 12, 14, 17); paint(m, ['#ef4a3c', '#ffd23f', '#9b5de5'][i], 2); } }
  } else if (theme === 'station') {
    for (let x = 0; x < FW; x += 70 + r() * 40) { const h = 100 + r() * 140; f.fillStyle = ['#b9a8c8', '#a8b8d0', '#c8b8a8'][(x | 0) % 3]; f.fillRect(x, GROUND - h - 20, 64, h + 30); }
    rrect(m, 0, GROUND - 330, MW, 26, 2); paint(m, '#7a4a2b', 3);
    for (let x = 60; x < MW; x += 260) { rrect(m, x, GROUND - 306, 14, 306, 2); paint(m, '#6d7c88', 2.5); poly(m, [x - 40, GROUND - 306, x + 54, GROUND - 306, x + 7, GROUND - 270]); paint(m, '#6d7c88', 2.5); }
    for (let x = 160; x < MW; x += 520) { rrect(m, x, GROUND - 250, 120, 34, 4); paint(m, '#2a2238'); txt(m, 'PLATFORM 9', x + 60, GROUND - 233, 15, '#ffd23f'); }
  } else {
    circ(f, 950, 110, 46); f.fillStyle = '#f2f0c2'; f.fill();
    f.fillStyle = '#2a2040';
    f.fillRect(380, 200, 420, 260); for (const [x, h] of [[360, 220], [520, 300], [700, 240], [800, 200]]) { f.fillRect(x, GROUND - h - 40, 60, h + 40); poly(f, [x - 6, GROUND - h - 40, x + 30, GROUND - h - 100, x + 66, GROUND - h - 40]); f.fill(); }
    f.fillStyle = '#ffe680'; for (let i = 0; i < 12; i++) f.fillRect(400 + (i * 97) % 380, 240 + (i * 53) % 160, 10, 16);
    hills(f, FW, 420, 30, '#3a4a2a', 3);
    for (let x = 60; x < MW; x += 260 + r() * 120) { m.lineWidth = 9; m.strokeStyle = '#3a2e2a'; m.beginPath(); m.moveTo(x, GROUND); m.lineTo(x + 6, GROUND - 160); m.moveTo(x + 4, GROUND - 100); m.lineTo(x + 40, GROUND - 140); m.moveTo(x + 5, GROUND - 130); m.lineTo(x - 30, GROUND - 170); m.stroke(); }
    for (let x = 0; x < MW; x += 40 + r() * 40) { line(m, x, GROUND, x - 6 + r() * 12, GROUND - 40 - r() * 30, '#4f6b2a', 4); }
    for (let x = 150; x < MW; x += 330) { rrect(m, x - 4, GROUND - 22, 8, 22, 3); paint(m, '#eee', 2); ell(m, x, GROUND - 24, 16, 9); paint(m, '#c0392b', 2); }
  }
  return (BG_CACHE[theme] = { far, mid, FW, MW, S, H, info: themeInfo(theme) });
}
function drawBackdrop(c, theme, camX, W, t) {
  const bg = getBg(theme), info = bg.info;
  const g = c.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, info.sky[0]); g.addColorStop(1, info.sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, 540);
  if (theme !== 'swamp') { circ(c, W - 120, 80, 40); c.fillStyle = '#ffe466'; c.fill(); c.globalAlpha = 0.25; circ(c, W - 120, 80, 56); c.fill(); c.globalAlpha = 1; }
  c.fillStyle = theme === 'swamp' ? 'rgba(160,190,140,.35)' : 'rgba(255,255,255,.9)';
  for (let i = 0; i < 5; i++) { const x = ((i * 330 - camX * 0.05 + t * 8) % (W + 300) + W + 300) % (W + 300) - 150, y = 60 + (i * 47) % 120; ell(c, x, y, 50, 18); c.fill(); ell(c, x + 30, y - 10, 32, 18); c.fill(); }
  const tile = (img, w, par) => { const off = -((camX * par) % w + w) % w; for (let x = off; x < W; x += w) c.drawImage(img, x, 0, w, bg.H); };
  tile(bg.far, bg.FW, 0.15); tile(bg.mid, bg.MW, 0.45);
}
function drawGround(c, theme, x0, W) {
  const i = themeInfo(theme);
  c.fillStyle = i.gFill; c.fillRect(x0 - 10, GROUND, W + 20, 140);
  c.fillStyle = i.gMid; c.fillRect(x0 - 10, GROUND + 18, W + 20, 34);
  c.fillStyle = i.gTop; c.fillRect(x0 - 10, GROUND, W + 20, 18);
  c.fillStyle = OUT; c.fillRect(x0 - 10, GROUND - 1, W + 20, 3);
  c.strokeStyle = i.seam; c.lineWidth = 2; c.beginPath();
  for (let x = Math.floor(x0 / 60) * 60; x < x0 + W + 60; x += 60) { c.moveTo(x, GROUND + 2); c.lineTo(x - 6, GROUND + 18); }
  c.stroke();
  if (theme === 'station') { c.fillStyle = '#ffd23f'; c.fillRect(x0 - 10, GROUND + 12, W + 20, 5); c.fillStyle = '#3a3030'; for (let x = Math.floor(x0 / 40) * 40; x < x0 + W + 40; x += 40) c.fillRect(x, GROUND + 30, 14, 26); c.fillStyle = '#9aa1ab'; c.fillRect(x0 - 10, GROUND + 34, W + 20, 6); c.fillRect(x0 - 10, GROUND + 48, W + 20, 6); }
  if (theme === 'airport') { c.fillStyle = '#fff'; for (let x = Math.floor(x0 / 160) * 160; x < x0 + W + 160; x += 160) c.fillRect(x, GROUND + 33, 80, 6); }
  if (theme === 'city') { c.fillStyle = '#ffd23f'; for (let x = Math.floor(x0 / 120) * 120; x < x0 + W + 120; x += 120) c.fillRect(x, GROUND + 33, 50, 5); }
}

// ---------------------------------------------------------------- world map
const MAP_NODES = [[0.09, 0.74], [0.17, 0.40], [0.27, 0.72], [0.36, 0.38], [0.46, 0.70], [0.55, 0.36], [0.64, 0.70], [0.73, 0.38], [0.82, 0.72], [0.91, 0.36]];
const MAP_ICONS = {};
function mapIcon(type) { return MAP_ICONS[type] || (MAP_ICONS[type] = makeObj(type, 0, GROUND, 0, null, 1)); }
function drawMap(c, W, H, t, unlocked, k) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4fc3f7'); g.addColorStop(1, '#2a8fd4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 30; i++) { ell(c, (i * 173 + t * 6) % W, (i * 97) % H, 14, 2.5); c.fill(); }
  c.beginPath(); c.moveTo(W * 0.03, H * 0.9);
  c.bezierCurveTo(W * 0.0, H * 0.3, W * 0.2, H * 0.17, W * 0.45, H * 0.2); c.bezierCurveTo(W * 0.75, H * 0.1, W * 1.0, H * 0.12, W * 0.98, H * 0.5);
  c.bezierCurveTo(W * 0.99, H * 0.97, W * 0.6, H * 0.97, W * 0.4, H * 0.95); c.bezierCurveTo(W * 0.2, H * 0.99, W * 0.05, H * 0.99, W * 0.03, H * 0.9); c.closePath();
  paint(c, '#8fd16a', 4);
  ell(c, W * 0.91, H * 0.36, W * 0.07, H * 0.17); c.fillStyle = '#5a7a32'; c.fill();
  ell(c, W * 0.36, H * 0.42, W * 0.06, H * 0.12); c.fillStyle = '#f6dc96'; c.fill();
  c.setLineDash([10, 10]); c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath();
  MAP_NODES.forEach(([x, y], i) => { if (i === 0) c.moveTo(x * W, y * H); else { const [px, py] = MAP_NODES[i - 1]; c.quadraticCurveTo((px + x) / 2 * W, (py + y) / 2 * H + (i % 2 ? -0.08 : 0.08) * H, x * W, y * H); } });
  c.stroke(); c.setLineDash([]);
  AREAS.forEach((A, i) => {
    const o = mapIcon(A.icon), [x, y] = MAP_NODES[i], sc = 52 / Math.max(o.h, o.w * 0.6) * H / 540;
    c.drawImage(o.art, x * W - o.w * sc / 2, y * H - 36 * H / 540 - o.h * sc, o.w * sc, o.h * sc);
  });
  const ai = Math.min(Math.floor((unlocked - 1) / 3), AREAS.length - 1), [kx, ky] = MAP_NODES[ai], s = H / 540;
  c.save(); c.translate(kx * W - 64 * s, ky * H + 30 * s); c.scale(0.7 * s, 0.7 * s); drawKid(c, Object.assign({}, k, { walk: t * 3, aim: 0.4 })); c.restore();
}
function house2(c, x, y, s) { rrect(c, x, y - 30 * s, 40 * s, 30 * s, 2); paint(c, '#f6e1a6', 2); poly(c, [x - 5 * s, y - 30 * s, x + 20 * s, y - 52 * s, x + 45 * s, y - 30 * s]); paint(c, '#c0503a', 2); }

// ---------------------------------------------------------------- story pictures
function drawStoryPic(c, id, W, H, t, k) {
  const s = H / 540; c.save(); c.scale(s, s); const w = W / s;
  let theme = { town: 'street', boss: 'swamp', splat: 'street', hero: 'park', end1: 'swamp', end2: 'street' }[id], fleeClean = 0;
  if (id.startsWith('flee:')) { const p = id.split(':'); theme = p[1]; fleeClean = +p[2]; id = 'flee'; }
  drawBackdrop(c, theme, 200, w, t); drawGround(c, theme, 0, w);
  const obj = (type, x, dirtFrac, v) => {
    const o = storyObj(type, v || 0, dirtFrac); c.drawImage(o.art, x - o.w / 2, GROUND - o.h + 6, o.w, o.h); if (o.out) c.drawImage(o.out, x - o.w / 2, GROUND - o.h + 6, o.w, o.h);
  };
  const boss = (x, scale, clean, mood) => {
    const o = storyObj('boss', 0, 1 - clean); c.save(); c.translate(x, GROUND); c.scale(scale, scale); c.translate(-o.w / 2, -o.h + 6);
    c.drawImage(o.art, 0, 0, o.w, o.h); if (o.out && clean < 1) c.drawImage(o.out, 0, 0, o.w, o.h);
    drawBossFace(c, 6, 6, { clean, mood, look: -1, t }); c.restore();
  };
  const kid = (x, scale, aim) => { c.save(); c.translate(x, GROUND); c.scale(scale, scale); drawKid(c, Object.assign({}, k, { aim: aim || 0.3, t })); c.restore(); };
  if (id === 'town') { obj('house', w * 0.4, 0); obj('car', w * 0.72, 0, 1); sparkles(c, w, t); }
  else if (id === 'boss') { boss(w * 0.5, 1.6, 0, 'laugh'); }
  else if (id === 'splat') { obj('house', w * 0.38, 1); obj('car', w * 0.7, 1, 1); boss(w * 0.12, 0.9, 0, 'laugh'); }
  else if (id === 'hero') {
    kid(w * 0.35, 2.2, -0.2); const [nx, ny] = kidNozzleLocal(-0.2);
    c.strokeStyle = 'rgba(190,235,255,.9)'; c.lineWidth = 10; c.beginPath(); c.moveTo(w * 0.35 + nx * 2.2, GROUND + ny * 2.2); c.lineTo(w * 0.95, GROUND - 260); c.stroke(); sparkles(c, w, t);
  }
  else if (id === 'flee') { boss(w * 0.7, 1, Math.round(fleeClean * 20) / 20, 'hit'); kid(w * 0.2, 1.3); }
  else if (id === 'end1') { boss(w * 0.62, 1.3, 1, 'happy'); kid(w * 0.3, 1.5); sparkles(c, w, t); }
  else if (id === 'end2') {
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(w * 0.5, GROUND + 60, 420 - i * 22, Math.PI, 0); c.strokeStyle = ['#ef4a3c', '#ff9f1c', '#ffd23f', '#43c46b', '#3a8cf0', '#9b5de5'][i]; c.lineWidth = 22; c.stroke(); }
    boss(w * 0.62, 1.1, 1, 'happy'); kid(w * 0.36, 1.4); sparkles(c, w, t);
  }
  c.restore();
}
function sparkles(c, w, t) {
  for (let i = 0; i < 14; i++) { const x = (i * 137) % w, y = 60 + (i * 71) % 300, a = 0.5 + 0.5 * Math.sin(t * 4 + i); c.globalAlpha = a; star(c, x, y, 10 * a + 4, 4, 0.3); c.fillStyle = '#fff'; c.fill(); }
  c.globalAlpha = 1;
}
const STORY_OBJ = {};
function storyObj(type, v, dirtFrac) {
  const key = type + v + ':' + dirtFrac.toFixed(2);
  if (STORY_OBJ[key]) return STORY_OBJ[key];
  const o = makeObj(type, 0, GROUND, v, dirtFrac > 0 ? (type === 'boss' ? 'slime' : 'mud') : null, 77);
  if (o.grid && dirtFrac < 1) { const r = rng(5); for (let i = 0; i < o.grid.length; i++) if (Math.floor(i / o.gw) / o.gh + (r() - 0.5) * 0.15 > dirtFrac) o.grid[i] = 0; recompose(o); }
  else if (o.grid) recompose(o);
  return (STORY_OBJ[key] = o);
}
