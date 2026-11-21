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
  // goggles (pulled down over the eyes while swimming, v1.32)
  if (!k.dive) { c.beginPath(); c.moveTo(-19, -7); c.quadraticCurveTo(0, -15, 19, -11); c.strokeStyle = '#333'; c.lineWidth = 4; c.stroke();
    rrect(c, 2, -18, 9, 8, 3); paint(c, '#8fe0ff', 2); rrect(c, 12, -18, 8, 8, 3); paint(c, '#8fe0ff', 2); }
  // face
  if (k.blink) { line(c, 2, -1, 8, -1, OUT, 2.5); line(c, 11, -1, 16, -1, OUT, 2.5); }
  else if (k.hurt) { line(c, 2, -4, 8, 0, OUT, 2.5); line(c, 2, 0, 8, -4, OUT, 2.5); line(c, 11, -4, 16, 0, OUT, 2.5); line(c, 11, 0, 16, -4, OUT, 2.5); }
  else {
    ell(c, 5, -1, 4, 5); paint(c, '#fff', 2); ell(c, 13.5, -1, 4, 5); paint(c, '#fff', 2);
    circ(c, 6.5, 0, 2.2); paint(c, OUT, 0); circ(c, 15, 0, 2.2); paint(c, OUT, 0);
  }
  if (k.dive) {
    c.beginPath(); c.moveTo(-19, 1); c.quadraticCurveTo(-4, -6, 1, -2); c.strokeStyle = '#333'; c.lineWidth = 4; c.stroke();
    for (const ex of [5, 13.5]) { ell(c, ex, -1, 6, 6.5); c.fillStyle = 'rgba(143,224,255,.45)'; c.fill(); c.strokeStyle = '#333'; c.lineWidth = 2.5; c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(2, -5, 2.5, 3); c.fillRect(10.5, -5, 2.5, 3);
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
// swimming pose (v1.32): lying flat, facing right, doggy-paddling with flutter kicks; washer pack on the back, wand clipped
// along it, goggles over the eyes. Same origin as drawKid (feet); the body lies along y = -30
function drawKidSwim(c, k) {
  const girl = k.g === 'girl', skin = SKINS[k.skin || 0], t = k.t || 0;
  const shirt = girl ? '#ff7eb6' : '#e8443a', pants = girl ? '#7c5cd6' : '#3f6fb5';
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.translate(0, -30);
  const leg = (y0, ph) => {
    const a = Math.sin(t * 13 + ph) * 0.32, fx = -14 - Math.cos(a) * 24, fy = y0 + Math.sin(a) * 24;
    limb(c, -12, y0, fx, fy, pants, 7);
    c.save(); c.translate(fx, fy); c.rotate(a); rrect(c, -9, -5, 9, 13, 4); paint(c, '#ffd23f', 2.5); c.restore();
  };
  const arm = ph => { const a = 0.6 + Math.sin(t * 8 + ph) * 0.9, hx = 13 + Math.cos(a) * 23, hy = 3 + Math.sin(a) * 20; limb(c, 12, 1, hx, hy, shirt, 6); circ(c, hx, hy, 4.5); paint(c, skin, 2); };
  leg(-3, 0); arm(Math.PI);
  rrect(c, -18, -11, 38, 22, 10); paint(c, shirt);
  if (girl) { poly(c, [-2, -11, -2, 11, -22, 14, -22, -14]); paint(c, pants, 2.5); }
  else { rrect(c, -20, -10, 20, 20, 4); paint(c, pants, 2.5); }
  line(c, -2, -6, 14, -6, pants, 3);
  rrect(c, -14, -28, 32, 17, 6); paint(c, k.wcol || '#ffc928');
  rrect(c, 18, -24, 7, 10, 3); paint(c, '#555', 2);
  circ(c, -2, -20, 4.5); paint(c, '#fff', 2); line(c, -2, -20, 1, -22, '#e33', 1.5);
  line(c, -24, -31, 16, -32, OUT, 8); line(c, -24, -31, 16, -32, '#a7adb8', 4); circ(c, 18, -32, 4.5); paint(c, nozzleColor(k.noz, t), 2);
  leg(4, Math.PI); arm(0);
  c.save(); c.translate(31, -6); c.rotate(0.12); kidHead(c, Object.assign({}, k, { dive: true, moving: true })); c.restore();
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
  garage: { w: 262, h: 202, snd: 'chime', draw(c) {
    rrect(c, 10, 60, 242, 142, 3); paint(c, '#e8d8b8'); poly(c, [0, 66, 131, 4, 262, 66]); paint(c, '#7a6a8a');
    rrect(c, 40, 92, 182, 110, 4); paint(c, '#c8ccd4'); for (let y = 104; y < 200; y += 16) line(c, 42, y, 220, y, '#9aa0ab', 3);
    rrect(c, 116, 182, 30, 6, 2); paint(c, '#666', 1.5); circ(c, 131, 40, 12); paint(c, '#bfe7ff', 2.5);
  } },
  van: { w: 232, h: 122, snd: 'honk', draw(c) {
    rrect(c, 4, 10, 224, 86, 14); paint(c, '#f6f2ea'); poly(c, [168, 14, 210, 14, 226, 50, 168, 50]); paint(c, '#bfe7ff', 2.5);
    win(c, 20, 22, 60, 30); win(c, 92, 22, 60, 30); rrect(c, 4, 64, 224, 10, 2); paint(c, '#43c46b', 2);
    txt(c, 'SUDSY', 80, 82, 14, '#2a8a4a'); wheel(c, 50, 100, 18); wheel(c, 184, 100, 18);
  } },
  fruitstand: { w: 202, h: 142, snd: 'chime', draw(c) {
    for (const x of [10, 186]) { rrect(c, x, 20, 8, 122, 2); paint(c, '#8a5a2b'); }
    for (let i = 0; i < 7; i++) { poly(c, [i * 29, 10, i * 29 + 29, 10, i * 29 + 29, 34, i * 29, 34]); paint(c, i % 2 ? '#fff' : '#43c46b', 2); }
    rrect(c, 0, 84, 202, 58, 4); paint(c, '#c98a45');
    [['#ef4a3c', 30], ['#ff9f1c', 80], ['#ffd23f', 130], ['#7ed957', 172]].forEach(([col, x]) => { for (let i = 0; i < 5; i++) { circ(c, x - 16 + (i % 3) * 14, 78 - Math.floor(i / 3) * 12, 8); paint(c, col, 2); } });
  } },
  sandbox: { w: 182, h: 62, snd: 'chime', draw(c) {
    rrect(c, 0, 26, 182, 36, 4); paint(c, '#ef4a3c'); ell(c, 91, 28, 84, 10); paint(c, '#f6dc96', 2);
    poly(c, [40, 28, 70, 0, 100, 28]); paint(c, '#f2d08a', 2); rrect(c, 130, 6, 22, 22, 4); paint(c, '#3a8cf0', 2); line(c, 152, 14, 166, 6, OUT, 3);
  } },
  gazebo: { w: 222, h: 222, snd: 'chime', draw(c) {
    poly(c, [111, 0, 0, 70, 222, 70]); paint(c, '#7fd3ff'); circ(c, 111, 2, 7); paint(c, '#ffd23f', 2);
    for (const x of [16, 70, 152, 200]) { rrect(c, x, 70, 10, 136, 2); paint(c, '#fff'); }
    rrect(c, 0, 66, 222, 10, 3); paint(c, '#fff'); rrect(c, 0, 200, 222, 22, 4); paint(c, '#d8d0c0');
    for (let x = 30; x < 200; x += 14) line(c, x, 160, x, 200, '#fff', 3); rrect(c, 20, 156, 182, 6, 2); paint(c, '#fff', 2);
  } },
  greenhouse: { w: 262, h: 182, snd: 'chime', draw(c) {
    c.beginPath(); c.moveTo(0, 182); c.lineTo(0, 80); c.quadraticCurveTo(131, -20, 262, 80); c.lineTo(262, 182); c.closePath(); paint(c, 'rgba(190,240,230,.9)');
    for (let x = 40; x < 262; x += 44) line(c, x, 182, x, 40 + Math.abs(131 - x) * 0.3, '#6aa', 3);
    for (let i = 0; i < 9; i++) { circ(c, 22 + i * 28, 160, 12); paint(c, '#43a047', 2); circ(c, 22 + i * 28, 150, 5); paint(c, ['#ff5fa2', '#ffd23f', '#ef4a3c'][i % 3], 1.5); }
  } },
  digger: { w: 282, h: 192, snd: 'honk', draw(c) {
    rrect(c, 40, 140, 170, 40, 18); paint(c, '#333'); for (let x = 60; x < 200; x += 30) { circ(c, x, 160, 10); paint(c, '#666', 2); }
    rrect(c, 60, 80, 130, 64, 6); paint(c, '#ffb627'); rrect(c, 70, 40, 70, 48, 6); paint(c, '#ffb627'); win(c, 80, 48, 50, 34);
    line(c, 180, 100, 240, 40, OUT, 16); line(c, 180, 100, 240, 40, '#ffb627', 11); line(c, 240, 40, 268, 120, OUT, 14); line(c, 240, 40, 268, 120, '#ffb627', 9);
    poly(c, [250, 120, 282, 116, 276, 150, 248, 146]); paint(c, '#777');
  } },
  mixer: { w: 262, h: 162, snd: 'honk', draw(c) {
    rrect(c, 170, 40, 88, 90, 8); paint(c, '#ef4a3c'); win(c, 196, 52, 50, 36); rrect(c, 0, 110, 262, 20, 4); paint(c, '#666');
    c.save(); c.translate(90, 72); c.rotate(-0.15); ell(c, 0, 0, 86, 46); paint(c, '#d5d9e0'); for (let i = -60; i < 70; i += 30) { c.beginPath(); c.moveTo(i, -44); c.quadraticCurveTo(i + 30, 0, i, 44); c.strokeStyle = '#ef4a3c'; c.lineWidth = 6; c.stroke(); } ell(c, 0, 0, 86, 46); paint(c, null); c.restore();
    for (const x of [40, 110, 210]) wheel(c, x, 140, 20);
  } },
  cones: { w: 122, h: 62, snd: 'chime', draw(c) {
    for (const x of [20, 61, 102]) { poly(c, [x - 16, 56, x + 16, 56, x, 0]); paint(c, '#ff7a1c'); poly(c, [x - 9, 30, x + 9, 30, x + 6, 20, x - 6, 20]); paint(c, '#fff', 0); rrect(c, x - 20, 54, 40, 8, 2); paint(c, '#ff7a1c', 2); }
  } },
  firetruck: { w: 332, h: 152, snd: 'siren', draw(c) {
    rrect(c, 2, 40, 328, 82, 10); paint(c, '#e8261c'); rrect(c, 236, 16, 90, 70, 8); paint(c, '#e8261c'); win(c, 250, 26, 64, 34);
    rrect(c, 20, 20, 200, 12, 4); paint(c, '#d5d9e0'); for (let x = 30; x < 220; x += 20) line(c, x, 20, x, 32, OUT, 2);
    rrect(c, 260, 6, 30, 12, 4); paint(c, '#4fc3f7', 2); rrect(c, 2, 92, 328, 10, 2); paint(c, '#fff', 2);
    for (const x of [60, 150, 280]) wheel(c, x, 128, 22); circ(c, 120, 70, 18); paint(c, '#ffd23f', 2.5);
  } },
  firehouse: { w: 302, h: 262, snd: 'siren', draw(c) {
    rrect(c, 0, 40, 302, 222, 3); paint(c, '#c0392b'); rrect(c, 0, 30, 302, 18, 3); paint(c, '#8a2a20');
    rrect(c, 60, 56, 182, 34, 6); paint(c, '#fff3d6'); txt(c, 'FIRE STATION', 151, 74, 20, '#c0392b');
    for (const x of [24, 162]) { c.beginPath(); c.moveTo(x, 262); c.lineTo(x, 140); c.arc(x + 58, 140, 58, Math.PI, 0); c.lineTo(x + 116, 262); c.closePath(); paint(c, '#f6f2ea'); for (let y = 150; y < 260; y += 22) line(c, x + 4, y, x + 112, y, '#c8ccd4', 3); }
  } },
  surfrack: { w: 162, h: 152, snd: 'chime', draw(c) {
    rrect(c, 0, 132, 162, 20, 3); paint(c, '#b5895a'); rrect(c, 8, 70, 8, 70, 2); paint(c, '#8a6a44'); rrect(c, 146, 70, 8, 70, 2); paint(c, '#8a6a44');
    ['#ef4a3c', '#ffd23f', '#3a8cf0', '#43c46b'].forEach((col, i) => { ell(c, 30 + i * 34, 76, 15, 72); paint(c, col); line(c, 30 + i * 34, 10, 30 + i * 34, 142, 'rgba(255,255,255,.7)', 3); });
  } },
  lifeguard: { w: 142, h: 232, snd: 'whistle', draw(c) {
    for (const [a, b] of [[20, 50], [122, 92]]) { line(c, a, 232, b, 110, OUT, 9); line(c, a, 232, b, 110, '#fff', 5); }
    rrect(c, 30, 40, 82, 74, 6); paint(c, '#ef4a3c'); win(c, 44, 52, 54, 34); poly(c, [20, 44, 71, 6, 122, 44]); paint(c, '#fff');
    rrect(c, 20, 108, 102, 12, 3); paint(c, '#c98a45'); for (let y = 140; y < 230; y += 22) line(c, 56, y, 86, y, '#c98a45', 4);
    circ(c, 71, 24, 9); paint(c, '#ef4a3c', 2); txt(c, '+', 71, 24, 14, '#fff');
  } },
  umbrella: { w: 182, h: 142, snd: 'chime', draw(c) {
    line(c, 90, 30, 100, 142, OUT, 5); line(c, 90, 30, 100, 142, '#fff', 2);
    c.beginPath(); c.moveTo(4, 56); c.quadraticCurveTo(90, -30, 176, 56); c.closePath(); paint(c, '#ff7eb6');
    for (let i = 1; i < 6; i += 2) { c.beginPath(); c.moveTo(90, 12); c.lineTo(4 + i * 28.6, 56); c.lineTo(4 + (i + 1) * 28.6, 56); c.closePath(); paint(c, '#fff', 2); }
    poly(c, [20, 140, 50, 100, 120, 100, 92, 140]); paint(c, '#3a8cf0'); for (let x = 30; x < 120; x += 14) line(c, x, 140, x + 26, 102, '#fff', 2);
  } },
  scarecrow: { w: 112, h: 202, snd: 'chime', draw(c) {
    line(c, 56, 60, 56, 202, OUT, 9); line(c, 56, 60, 56, 202, '#8a5a2b', 5); line(c, 6, 84, 106, 84, OUT, 9); line(c, 6, 84, 106, 84, '#8a5a2b', 5);
    poly(c, [26, 76, 86, 76, 92, 150, 20, 150]); paint(c, '#3a6fd8'); rrect(c, 40, 92, 14, 14, 2); paint(c, '#ef4a3c', 2);
    circ(c, 56, 44, 24); paint(c, '#f0cc5a'); circ(c, 47, 40, 3); paint(c, OUT, 0); circ(c, 65, 40, 3); paint(c, OUT, 0); c.beginPath(); c.arc(56, 50, 8, 0.3, Math.PI - 0.3); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    ell(c, 56, 22, 34, 6); paint(c, '#a0662f'); rrect(c, 40, 0, 32, 22, 6); paint(c, '#a0662f');
  } },
  haywagon: { w: 242, h: 132, snd: 'chime', draw(c) {
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2 - (i % 2); j++) { rrect(c, 14 + i * 70 + j * 0, 30 - j * 30 + 10, 68, 40, 8); paint(c, '#f0cc5a'); line(c, 18 + i * 70, 50 - j * 30 + 10, 78 + i * 70, 50 - j * 30 + 10, '#d8a83a', 2); }
    rrect(c, 0, 76, 242, 22, 3); paint(c, '#c0392b'); wheel(c, 50, 108, 22); wheel(c, 192, 108, 22);
  } },
  silo: { w: 122, h: 292, snd: 'moo', draw(c) {
    rrect(c, 10, 60, 102, 232, 4); paint(c, '#d5d9e0'); for (let y = 80; y < 290; y += 26) line(c, 12, y, 110, y, '#aab', 2);
    c.beginPath(); c.moveTo(6, 64); c.quadraticCurveTo(61, -20, 116, 64); c.closePath(); paint(c, '#c0392b'); rrect(c, 46, 120, 30, 40, 4); paint(c, '#7a4a2b', 2);
  } },
  cow: { w: 152, h: 112, snd: 'moo', draw(c) {
    for (const x of [34, 54, 100, 120]) { rrect(c, x - 6, 66, 13, 46, 4); paint(c, '#fff', 2.5); }
    ell(c, 76, 56, 58, 32); paint(c, '#fff'); ell(c, 60, 46, 16, 12); paint(c, OUT, 0); ell(c, 100, 64, 12, 9); paint(c, OUT, 0);
    ell(c, 132, 38, 20, 22); paint(c, '#fff'); ell(c, 138, 52, 14, 9); paint(c, '#ffb0c6', 2.5); poly(c, [118, 20, 112, 6, 124, 16]); paint(c, '#e8d8a8', 2); poly(c, [142, 18, 150, 4, 148, 20]); paint(c, '#e8d8a8', 2);
    circ(c, 132, 34, 3); paint(c, OUT, 0); line(c, 18, 50, 6, 74, OUT, 3);
  } },
  goal: { w: 242, h: 152, snd: 'whistle', draw(c) {
    c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; for (let x = 20; x < 230; x += 16) { c.beginPath(); c.moveTo(x, 10); c.lineTo(x + 8, 150); c.stroke(); } for (let y = 20; y < 150; y += 16) { c.beginPath(); c.moveTo(8, y); c.lineTo(234, y); c.stroke(); }
    line(c, 8, 152, 8, 6, OUT, 12); line(c, 8, 152, 8, 6, '#fff', 7); line(c, 234, 152, 234, 6, OUT, 12); line(c, 234, 152, 234, 6, '#fff', 7); line(c, 8, 6, 234, 6, OUT, 12); line(c, 8, 6, 234, 6, '#fff', 7);
    circ(c, 120, 136, 14); paint(c, '#fff'); poly(c, [120, 128, 127, 134, 124, 142, 116, 142, 113, 134]); paint(c, OUT, 0);
  } },
  bleachers: { w: 262, h: 142, snd: 'whistle', draw(c) {
    for (let i = 0; i < 4; i++) { rrect(c, i * 20, 30 + i * 28, 262 - i * 40, 14, 3); paint(c, ['#3a8cf0', '#ffd23f', '#ef4a3c', '#43c46b'][i]); }
    for (const x of [20, 130, 240]) line(c, x, 40, x, 142, '#888', 5); line(c, 0, 142, 262, 142, OUT, 4);
  } },
  helicopter: { w: 302, h: 142, snd: 'jet', draw(c) {
    line(c, 20, 6, 280, 6, OUT, 8); line(c, 20, 6, 280, 6, '#888', 4); rrect(c, 140, 6, 16, 22, 3); paint(c, '#555');
    rrect(c, 2, 56, 130, 18, 8); paint(c, '#ffb627'); poly(c, [0, 30, 14, 30, 22, 66, 6, 66]); paint(c, '#ffb627');
    ell(c, 190, 74, 84, 48); paint(c, '#ffb627'); c.beginPath(); c.moveTo(212, 34); c.quadraticCurveTo(272, 40, 270, 80); c.lineTo(212, 80); c.closePath(); paint(c, '#bfe7ff', 2.5);
    line(c, 140, 120, 140, 134, OUT, 4); line(c, 240, 120, 240, 134, OUT, 4); rrect(c, 110, 132, 160, 8, 4); paint(c, '#555');
  } },
  fueltruck: { w: 302, h: 142, snd: 'honk', draw(c) {
    rrect(c, 0, 20, 220, 90, 40); paint(c, '#d5d9e0'); txt(c, 'FUEL', 110, 64, 26, '#ef4a3c'); rrect(c, 0, 82, 220, 8, 2); paint(c, '#ef4a3c', 2);
    rrect(c, 226, 30, 72, 80, 8); paint(c, '#3a8cf0'); win(c, 240, 40, 46, 32); for (const x of [50, 160, 262]) wheel(c, x, 118, 20);
  } },
  balloonstand: { w: 152, h: 222, snd: 'pop', draw(c) {
    rrect(c, 20, 150, 112, 72, 6); paint(c, '#9b5de5'); txt(c, 'BALLOONS', 76, 186, 15, '#fff');
    const cols = ['#ef4a3c', '#ffd23f', '#3a8cf0', '#43c46b', '#ff7eb6', '#ff9f1c'];
    for (let i = 0; i < 6; i++) { const bx = 26 + (i % 3) * 50, by = 40 + Math.floor(i / 3) * 52; line(c, bx, by + 22, 76, 150, '#555', 1.5); ell(c, bx, by, 20, 24); paint(c, cols[i]); c.fillStyle = 'rgba(255,255,255,.5)'; ell(c, bx - 7, by - 8, 4, 7); c.fill(); }
  } },
  circustent: { w: 322, h: 262, snd: 'jingle', draw(c) {
    rrect(c, 20, 110, 282, 152, 3); paint(c, '#fff'); for (let x = 20; x < 300; x += 40) { c.fillStyle = '#ef4a3c'; c.fillRect(x, 112, 20, 148); } rrect(c, 20, 110, 282, 152, 3); paint(c, null);
    for (let i = 0; i < 8; i++) { poly(c, [161, 10, 10 + i * 37.75, 116, 10 + (i + 1) * 37.75, 116]); paint(c, i % 2 ? '#fff' : '#ef4a3c', 2.5); }
    line(c, 161, 10, 161, -10, OUT, 3); poly(c, [161, -10, 186, -2, 161, 6]); paint(c, '#ffd23f', 2);
    c.beginPath(); c.moveTo(126, 262); c.lineTo(161, 170); c.lineTo(196, 262); c.closePath(); paint(c, '#2a2238');
  } },
  cannon: { w: 202, h: 132, snd: 'pop', draw(c) {
    c.save(); c.translate(80, 70); c.rotate(-0.5); rrect(c, -20, -26, 150, 52, 20); paint(c, '#3a6fd8'); for (const x of [10, 60, 110]) { rrect(c, x, -28, 10, 56, 3); paint(c, '#ffd23f', 2); } c.restore();
    rrect(c, 20, 90, 140, 24, 6); paint(c, '#ef4a3c'); wheel(c, 50, 112, 20); wheel(c, 130, 112, 20);
  } },
  freightcar: { w: 292, h: 142, snd: 'train', draw(c, w, h, v) {
    rrect(c, 0, 0, 292, 110, 4); paint(c, v % 2 ? '#a0522d' : '#6d7c88'); for (let x = 20; x < 280; x += 24) line(c, x, 4, x, 106, 'rgba(0,0,0,.2)', 3);
    rrect(c, 116, 20, 60, 86, 3); paint(c, 'rgba(0,0,0,.15)', 2.5); txt(c, 'SUDSY', 146, 14, 12, '#fff');
    for (const x of [40, 80, 212, 252]) wheel(c, x, 122, 18);
  } },
  ticketbooth: { w: 162, h: 202, snd: 'bell', draw(c) {
    rrect(c, 10, 50, 142, 152, 6); paint(c, '#2fb5a8'); poly(c, [0, 56, 81, 6, 162, 56]); paint(c, '#ffd23f');
    win(c, 30, 70, 102, 60); rrect(c, 24, 136, 114, 14, 3); paint(c, '#c98a45'); rrect(c, 30, 160, 102, 30, 4); paint(c, '#fff3d6'); txt(c, 'TICKETS', 81, 176, 18, '#2a8a80');
  } },
  vending: { w: 92, h: 172, snd: 'pop', draw(c) {
    rrect(c, 0, 0, 92, 172, 8); paint(c, '#ef4a3c'); rrect(c, 10, 14, 52, 110, 4); paint(c, '#bfe7ff', 2.5);
    for (let r = 0; r < 4; r++) for (let k = 0; k < 3; k++) { rrect(c, 16 + k * 15, 22 + r * 26, 10, 18, 3); paint(c, ['#ffd23f', '#43c46b', '#3a8cf0'][k], 1.5); }
    rrect(c, 68, 20, 16, 40, 3); paint(c, '#333', 2); rrect(c, 14, 136, 64, 22, 4); paint(c, '#2a2238', 2);
  } },
  swamphut: { w: 222, h: 202, snd: 'chime', draw(c) {
    for (const x of [30, 100, 180]) { rrect(c, x, 140, 10, 62, 2); paint(c, '#5a3a2a'); }
    rrect(c, 16, 70, 190, 76, 3); paint(c, '#7a5a3a'); for (let y = 80; y < 146; y += 12) line(c, 18, y, 204, y, '#5a3a2a', 2);
    poly(c, [0, 76, 111, 0, 222, 76]); paint(c, '#4e6b2e'); rrect(c, 90, 92, 40, 54, 4); paint(c, '#2a2238'); circ(c, 50, 106, 14); paint(c, '#ffe680', 2.5);
  } },
  knight: { w: 92, h: 202, snd: 'bell', draw(c) {
    rrect(c, 6, 182, 80, 20, 4); paint(c, '#8e8a9c');
    for (const x of [30, 60]) { rrect(c, x - 9, 120, 18, 64, 5); paint(c, '#c8ccd4'); }
    rrect(c, 18, 60, 56, 66, 10); paint(c, '#c8ccd4'); rrect(c, 4, 64, 16, 50, 6); paint(c, '#c8ccd4'); rrect(c, 72, 64, 16, 50, 6); paint(c, '#c8ccd4');
    rrect(c, 24, 10, 44, 52, 16); paint(c, '#c8ccd4'); rrect(c, 30, 30, 32, 6, 2); paint(c, '#2a2238', 0); poly(c, [46, 10, 56, -12, 44, -6]); paint(c, '#ef4a3c', 2);
    line(c, 86, 40, 86, 190, OUT, 5); line(c, 86, 40, 86, 190, '#d5d9e0', 2);
  } },
  throne: { w: 142, h: 202, snd: 'bell', draw(c) {
    rrect(c, 20, 0, 102, 140, 14); paint(c, '#9b5de5'); rrect(c, 34, 14, 74, 112, 10); paint(c, '#c8a8f0', 2.5);
    rrect(c, 0, 110, 142, 40, 8); paint(c, '#ffd23f'); rrect(c, 10, 146, 20, 56, 4); paint(c, '#ffd23f'); rrect(c, 112, 146, 20, 56, 4); paint(c, '#ffd23f');
    star(c, 71, 50, 14, 5); paint(c, '#ffd23f', 2);
  } },
  // ---------------- story things (v1.31): Sunny Street area
  lemonade: { w: 170, h: 150, snd: 'chime', draw(c) {
    for (const x of [14, 150]) { rrect(c, x, 20, 8, 130, 2); paint(c, '#a0662f'); }
    rrect(c, 0, 8, 172, 24, 6); paint(c, '#ffd23f'); txt(c, 'LEMONADE', 86, 20, 17, '#e8443a');
    rrect(c, 4, 84, 162, 66, 4); paint(c, '#fff3d6'); for (let x = 4; x < 166; x += 18) { c.fillStyle = '#ffd23f'; c.fillRect(x, 86, 9, 62); } rrect(c, 4, 84, 162, 66, 4); paint(c, null, 3);
    rrect(c, 34, 46, 34, 38, 6); paint(c, 'rgba(255,240,120,.85)', 2.5); circ(c, 51, 60, 6); paint(c, '#fff27a', 2);
    for (const x of [94, 124]) { poly(c, [x, 62, x + 20, 62, x + 17, 84, x + 3, 84]); paint(c, '#fff', 2.5); rrect(c, x + 3, 68, 14, 14, 2); paint(c, '#ffe066', 0); }
    rrect(c, 54, 112, 64, 24, 5); paint(c, '#fff', 2.5); txt(c, '5¢', 86, 124, 16, '#3a6fd8');
  } },
  kiddiepool: { w: 190, h: 70, snd: 'splash', draw(c) {
    ell(c, 95, 44, 92, 24); paint(c, '#3a8cf0'); ell(c, 95, 40, 78, 16); paint(c, '#8fd8ff', 2.5);
    for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(12 + k * 30, 54, 14, 6); }
    ell(c, 130, 30, 22, 10); paint(c, '#ffd23f'); circ(c, 146, 18, 9); paint(c, '#ffd23f'); poly(c, [154, 18, 164, 20, 154, 22]); paint(c, '#ff9f1c', 2); circ(c, 148, 15, 2); paint(c, OUT, 0);
    circ(c, 50, 34, 12); paint(c, '#fff'); c.beginPath(); c.arc(50, 34, 12, 0, Math.PI); c.fillStyle = '#e8443a'; c.fill(); circ(c, 50, 34, 12); paint(c, null, 2.5);
  } },
  grill: { w: 110, h: 130, snd: 'chime', draw(c) {
    for (const [a, b] of [[30, 20], [80, 90]]) line(c, a + 10, 70, b + 10, 128, OUT, 5);
    wheel(c, 98, 120, 9);
    c.beginPath(); c.moveTo(10, 50); c.lineTo(100, 50); c.arc(55, 50, 45, 0, Math.PI); c.closePath(); paint(c, '#2e2a36');
    c.beginPath(); c.arc(55, 46, 45, Math.PI, 0); c.closePath(); paint(c, '#e8443a'); rrect(c, 46, 0, 18, 8, 3); paint(c, '#888', 2);
    rrect(c, 0, 44, 110, 8, 3); paint(c, '#c9ced6', 2.5);
    for (const x of [30, 55, 80]) { c.globalAlpha = 0.5; line(c, x, -4 + 30, x + 4, 10, '#ccc', 3); c.globalAlpha = 1; }
  } },
  birdbath: { w: 90, h: 120, snd: 'chime', draw(c) {
    rrect(c, 24, 104, 42, 16, 4); paint(c, '#c9ced6'); rrect(c, 36, 50, 18, 56, 4); paint(c, '#d5d9e0');
    c.beginPath(); c.moveTo(2, 40); c.quadraticCurveTo(45, 76, 88, 40); c.closePath(); paint(c, '#d5d9e0'); ell(c, 45, 41, 40, 7); paint(c, '#8fd8ff', 2.5);
    ell(c, 62, 28, 12, 9); paint(c, '#3a8cf0'); circ(c, 72, 20, 7); paint(c, '#3a8cf0'); poly(c, [78, 20, 86, 22, 78, 24]); paint(c, '#ff9f1c', 1.5); circ(c, 73, 18, 1.6); paint(c, OUT, 0); poly(c, [50, 26, 40, 20, 46, 32]); paint(c, '#3a8cf0', 2);
  } },
  treehouse: { w: 230, h: 310, snd: 'chime', draw(c) {
    rrect(c, 96, 140, 40, 170, 8); paint(c, '#8a5a2b');
    for (const [x, y, r] of [[60, 70, 56], [170, 64, 58], [116, 34, 50], [116, 96, 50]]) { circ(c, x, y, r); paint(c, '#43c46b'); }
    rrect(c, 54, 120, 124, 14, 3); paint(c, '#a0662f');
    rrect(c, 66, 64, 100, 58, 3); paint(c, '#e0a84a'); poly(c, [56, 68, 116, 24, 176, 68]); paint(c, '#e8443a'); win(c, 100, 80, 34, 28);
    for (const x of [40, 64]) line(c, x, 134, x, 310, OUT, 4); for (let y = 150; y < 310; y += 24) line(c, 40, y, 64, y, '#a0662f', 4);
    poly(c, [184, 80, 210, 90, 184, 100]); paint(c, '#ffd23f', 2); line(c, 184, 70, 184, 122, OUT, 3);
  } },
  mower: { w: 150, h: 90, snd: 'honk', draw(c) {
    line(c, 40, 54, 8, 4, OUT, 7); line(c, 40, 54, 8, 4, '#c9ced6', 4); line(c, 0, 6, 22, 0, OUT, 7);
    rrect(c, 30, 44, 110, 34, 12); paint(c, '#43c46b'); rrect(c, 70, 24, 44, 26, 6); paint(c, '#2e2a36'); circ(c, 92, 30, 5); paint(c, '#e8443a', 2);
    wheel(c, 46, 78, 12); wheel(c, 126, 78, 12);
    for (let k = 0; k < 5; k++) line(c, 140 + k * 2, 88, 144 + k * 2, 80 - k * 2, '#5aa83c', 2);
  } },
  redwagon: { w: 160, h: 80, snd: 'chime', draw(c) {
    line(c, 130, 50, 158, 22, OUT, 5); rrect(c, 150, 14, 10, 16, 4); paint(c, '#2e2a36', 2);
    rrect(c, 70, 4, 34, 32, 4); paint(c, '#a0662f'); circ(c, 44, 20, 16); paint(c, '#ff9f1c'); line(c, 44, 4, 44, 36, OUT, 2);
    rrect(c, 8, 30, 130, 30, 6); paint(c, '#e8443a'); txt(c, 'RADIO', 73, 45, 13, '#fff');
    wheel(c, 30, 66, 13); wheel(c, 116, 66, 13);
  } },
  toolbench: { w: 210, h: 150, snd: 'chime', draw(c) {
    rrect(c, 10, 0, 190, 70, 3); paint(c, '#d8b17a'); for (let x = 22; x < 196; x += 14) for (let y = 10; y < 66; y += 14) { circ(c, x, y, 1.6); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); }
    line(c, 40, 14, 40, 56, OUT, 6); rrect(c, 30, 8, 22, 12, 3); paint(c, '#888', 2);
    line(c, 80, 14, 90, 56, OUT, 5); line(c, 80, 14, 90, 56, '#ffd23f', 2); circ(c, 128, 34, 16); paint(c, null, 5); line(c, 160, 12, 160, 60, OUT, 5); rrect(c, 152, 40, 16, 22, 4); paint(c, '#e8443a', 2);
    rrect(c, 0, 76, 210, 16, 3); paint(c, '#a0662f'); for (const x of [10, 190]) { rrect(c, x, 90, 10, 60, 2); paint(c, '#8a5a2b'); }
    rrect(c, 30, 104, 60, 36, 4); paint(c, '#e8443a'); rrect(c, 52, 98, 16, 8, 2); paint(c, '#888', 2); rrect(c, 120, 112, 50, 28, 3); paint(c, '#3a8cf0'); txt(c, 'PAINT', 145, 126, 11, '#fff');
  } },
  motorcycle: { w: 190, h: 110, snd: 'honk', draw(c) {
    wheel(c, 34, 82, 26); wheel(c, 156, 82, 26);
    poly(c, [34, 82, 70, 46, 120, 48, 156, 82, 120, 70, 70, 72]); paint(c, '#9aa1b3');
    ell(c, 92, 46, 34, 14); paint(c, '#3a8cf0'); rrect(c, 46, 34, 40, 12, 5); paint(c, '#2e2a36');
    line(c, 128, 44, 150, 10, OUT, 6); line(c, 140, 10, 164, 8, OUT, 5); ell(c, 156, 30, 8, 10); paint(c, '#fff6a8', 2.5);
    line(c, 40, 66, 4, 60, OUT, 7); line(c, 40, 66, 4, 60, '#c9ced6', 3);
  } },
  garagesale: { w: 230, h: 140, snd: 'chime', draw(c) {
    rrect(c, 120, 0, 104, 40, 4); paint(c, '#fff'); txt(c, 'YARD SALE', 172, 20, 15, '#e8443a'); line(c, 172, 40, 172, 76, OUT, 4);
    rrect(c, 0, 76, 230, 12, 3); paint(c, '#c9ced6'); for (const x of [14, 210]) line(c, x, 88, x, 140, OUT, 5);
    rrect(c, 12, 34, 50, 42, 4); paint(c, '#ff9f1c'); rrect(c, 18, 40, 38, 28, 3); paint(c, '#bfe7ff', 2); // old TV
    circ(c, 92, 64, 12); paint(c, '#fff'); rrect(c, 104, 52, 22, 24, 3); paint(c, '#9b5de5'); txt(c, '$1', 115, 64, 11, '#fff');
    ell(c, 150, 66, 18, 10); paint(c, '#a0662f'); ell(c, 196, 60, 12, 16); paint(c, '#ff7eb6');
    rrect(c, 40, 104, 70, 36, 4); paint(c, '#d8b17a'); txt(c, 'TOYS', 75, 122, 13, '#7a4a2b');
  } },
  rv: { w: 360, h: 170, snd: 'honk', draw(c) {
    rrect(c, 0, 10, 300, 130, 16); paint(c, '#fff3d6'); rrect(c, 280, 50, 76, 90, 14); paint(c, '#fff3d6');
    rrect(c, 0, 80, 356, 14, 0); paint(c, '#ff9f1c', 0); rrect(c, 0, 96, 356, 6, 0); paint(c, '#e8443a', 0);
    rrect(c, 290, 58, 56, 30, 6); paint(c, '#bfe7ff', 2.5); for (const x of [30, 120, 200]) win(c, x, 30, 56, 38); rrect(c, 248, 30, 28, 96, 4); paint(c, '#a0662f', 2.5);
    rrect(c, 0, 10, 300, 130, 16); paint(c, null, 3); rrect(c, 40, 0, 80, 14, 4); paint(c, '#c9ced6', 2.5);
    wheel(c, 70, 144, 24); wheel(c, 290, 144, 24);
  } },
  flowerstand: { w: 200, h: 150, snd: 'chime', draw(c) {
    rrect(c, 0, 10, 200, 26, 6); paint(c, '#43c46b'); txt(c, 'FLOWERS', 100, 23, 17, '#fff'); for (const x of [10, 182]) { rrect(c, x, 34, 8, 116, 2); paint(c, '#a0662f'); }
    for (let row = 0; row < 2; row++) { const y = 72 + row * 42; rrect(c, 6, y + 20, 188, 14, 3); paint(c, '#a0662f');
      for (let k = 0; k < 5; k++) { const x = 28 + k * 36; rrect(c, x - 13, y + 2, 26, 20, 4); paint(c, ['#3a8cf0', '#ff9f1c', '#9b5de5'][(k + row) % 3], 2.5);
        for (const [dx, dy] of [[-7, -6], [6, -8], [0, -14]]) { circ(c, x + dx, y + dy, 7); paint(c, ['#ff7eb6', '#ffd23f', '#e8443a', '#fff'][(k + row * 2 + dx) & 3], 2); } } }
  } },
  newsstand: { w: 150, h: 200, snd: 'chime', draw(c) {
    rrect(c, 4, 30, 142, 170, 6); paint(c, '#2f6b4f'); poly(c, [0, 34, 20, 4, 130, 4, 150, 34]); paint(c, '#e8443a'); txt(c, 'NEWS', 75, 20, 18, '#fff');
    rrect(c, 18, 46, 114, 70, 4); paint(c, '#bfe7ff', 2.5);
    for (let k = 0; k < 3; k++) { rrect(c, 22 + k * 36, 128, 32, 40, 2); paint(c, '#fff', 2); for (let l = 0; l < 4; l++) line(c, 26 + k * 36, 140 + l * 7, 50 + k * 36, 140 + l * 7, '#999', 2); rrect(c, 24 + k * 36, 130, 28, 6, 1); paint(c, ['#e8443a', '#3a8cf0', '#ffd23f'][k], 0); }
    rrect(c, 4, 176, 142, 8, 2); paint(c, '#1f4f39', 2);
  } },
  cafe: { w: 210, h: 170, snd: 'chime', draw(c) {
    line(c, 105, 30, 105, 150, OUT, 6); line(c, 105, 30, 105, 150, '#c9ced6', 3);
    c.beginPath(); c.moveTo(10, 44); c.quadraticCurveTo(105, -16, 200, 44); c.closePath(); paint(c, '#e8443a');
    for (const x of [42, 105, 168]) { c.beginPath(); c.moveTo(x, 44); c.quadraticCurveTo(x - 10, 50, x - 21, 44); c.fillStyle = '#fff'; c.fill(); }
    ell(c, 105, 112, 56, 10); paint(c, '#fff'); line(c, 105, 120, 105, 168, OUT, 5); rrect(c, 85, 162, 40, 8, 3); paint(c, '#888', 2);
    rrect(c, 80, 92, 18, 16, 4); paint(c, '#fff', 2); rrect(c, 116, 96, 26, 10, 4); paint(c, '#e0a84a', 2);
    for (const x of [10, 176]) { rrect(c, x, 100, 24, 70, 4); paint(c, '#3a8cf0'); rrect(c, x - 4, 124, 32, 10, 3); paint(c, '#3a8cf0'); }
  } },
  busstop: { w: 170, h: 220, snd: 'honk', draw(c) {
    rrect(c, 4, 20, 162, 14, 3); paint(c, '#3a8cf0'); for (const x of [10, 152]) { rrect(c, x, 30, 8, 190, 2); paint(c, '#888'); }
    rrect(c, 18, 40, 134, 126, 4); paint(c, 'rgba(191,231,255,.55)', 2.5); rrect(c, 30, 52, 50, 70, 3); paint(c, '#ffd23f', 2); txt(c, 'ZOO!', 55, 86, 14, '#e8443a');
    rrect(c, 24, 170, 122, 12, 3); paint(c, '#a0662f'); for (const x of [34, 136]) line(c, x, 182, x, 220, OUT, 4);
    circ(c, 150, 12, 16); paint(c, '#fff'); txt(c, 'BUS', 150, 12, 11, '#3a6fd8');
  } },
  // ---------------- story things (v1.31): Sudsy School area
  guard: { w: 100, h: 200, snd: 'whistle', draw(c) {
    line(c, 80, 40, 80, 200, OUT, 6); line(c, 80, 40, 80, 200, '#ccc', 3);
    const p = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; p.push(80 + Math.cos(a) * 20, 28 + Math.sin(a) * 20); } poly(c, p); paint(c, '#e8443a'); txt(c, 'STOP', 80, 28, 11, '#fff');
    rrect(c, 28, 146, 14, 50, 4); paint(c, '#2c3e66'); rrect(c, 46, 146, 14, 50, 4); paint(c, '#2c3e66'); ell(c, 34, 196, 10, 5); paint(c, OUT, 0); ell(c, 54, 196, 10, 5); paint(c, OUT, 0);
    rrect(c, 20, 80, 50, 72, 14); paint(c, '#ff9f1c'); c.fillStyle = '#fff27a'; c.fillRect(21, 112, 48, 6); c.fillRect(40, 81, 8, 70); rrect(c, 20, 80, 50, 72, 14); paint(c, null, 3);
    limb(c, 64, 94, 78, 74, '#ff9f1c', 9); circ(c, 46, 56, 20); paint(c, SKINS[2]); rrect(c, 24, 34, 44, 12, 5); paint(c, '#2c3e66'); rrect(c, 34, 26, 26, 12, 5); paint(c, '#2c3e66');
    circ(c, 40, 56, 2.5); paint(c, OUT, 0); circ(c, 52, 56, 2.5); paint(c, OUT, 0); c.beginPath(); c.arc(46, 62, 6, 0.2, Math.PI - 0.2); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
  } },
  bikerack: { w: 210, h: 80, snd: 'bell', draw(c) {
    for (const x of [24, 66, 108, 150, 192]) { c.beginPath(); c.moveTo(x - 14, 80); c.lineTo(x - 14, 30); c.arc(x, 30, 14, Math.PI, 0); c.lineTo(x + 14, 80); c.strokeStyle = OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#c9ced6'; c.lineWidth = 4; c.stroke(); }
    for (const x of [6, 104]) { c.save(); c.translate(x, 16); OBJ.bike.draw(c); c.restore(); }
  } },
  flagpole: { w: 120, h: 300, snd: 'bell', draw(c) {
    rrect(c, 30, 272, 60, 28, 4); paint(c, '#b9bec8'); line(c, 60, 8, 60, 274, OUT, 9); line(c, 60, 8, 60, 274, '#e0e4ea', 5); circ(c, 60, 8, 7); paint(c, '#ffd23f', 2);
    c.save(); rrect(c, 64, 16, 54, 36, 2); c.clip(); c.fillStyle = '#fff'; c.fillRect(64, 16, 54, 36); c.fillStyle = '#e8443a'; for (let y = 16; y < 52; y += 10) c.fillRect(64, y, 54, 5); c.fillStyle = '#3a6fd8'; c.fillRect(64, 16, 24, 20); c.restore(); rrect(c, 64, 16, 54, 36, 2); paint(c, null, 2.5);
  } },
  lunchtable: { w: 220, h: 82, snd: 'chime', draw(c) {
    for (const x of [30, 190]) { line(c, x - 14, 82, x, 40, OUT, 6); line(c, x + 14, 82, x, 40, OUT, 6); }
    rrect(c, 8, 60, 204, 10, 4); paint(c, '#3a8cf0'); rrect(c, 0, 30, 220, 14, 5); paint(c, '#43c46b');
    circ(c, 50, 20, 9); paint(c, '#e8443a'); line(c, 50, 11, 52, 5, OUT, 2.5);
    rrect(c, 92, 2, 20, 28, 2); paint(c, '#fff'); poly(c, [92, 2, 102, -6, 112, 2]); paint(c, '#fff', 2); txt(c, 'MILK', 102, 18, 7, '#3a6fd8');
    poly(c, [140, 30, 176, 30, 158, 8]); paint(c, '#f0cc5a'); line(c, 146, 24, 170, 24, '#43c46b', 3);
  } },
  drinkfountain: { w: 80, h: 120, snd: 'splash', draw(c) {
    rrect(c, 24, 50, 32, 70, 6); paint(c, '#c9ced6'); ell(c, 40, 46, 36, 12); paint(c, '#e0e4ea'); ell(c, 40, 44, 24, 6); paint(c, '#8fd8ff', 2);
    rrect(c, 46, 30, 8, 14, 2); paint(c, '#888', 2); c.beginPath(); c.moveTo(50, 30); c.quadraticCurveTo(40, 4, 26, 38); c.strokeStyle = '#6ec6ff'; c.lineWidth = 3; c.stroke();
    circ(c, 40, 70, 5); paint(c, '#3a8cf0', 2);
  } },
  hoop: { w: 140, h: 270, snd: 'whistle', draw(c) {
    rrect(c, 10, 256, 40, 14, 4); paint(c, '#888'); line(c, 30, 60, 30, 260, OUT, 12); line(c, 30, 60, 30, 260, '#3a8cf0', 7); line(c, 30, 62, 60, 62, OUT, 8);
    rrect(c, 56, 18, 80, 58, 4); paint(c, '#fff'); rrect(c, 80, 42, 32, 24, 2); c.strokeStyle = '#e8443a'; c.lineWidth = 3; c.stroke();
    for (let k = 0; k < 5; k++) line(c, 80 + k * 8, 80, 84 + k * 6, 104, '#fff', 2.5);
    line(c, 76, 78, 120, 78, OUT, 7); line(c, 76, 78, 120, 78, '#ff7a1a', 3);
    circ(c, 112, 250, 18); paint(c, '#ff7a1a'); line(c, 94, 250, 130, 250, OUT, 2); line(c, 112, 232, 112, 268, OUT, 2);
  } },
  tetherball: { w: 100, h: 240, snd: 'pop', draw(c) {
    ell(c, 50, 234, 32, 7); paint(c, '#888'); line(c, 50, 20, 50, 236, OUT, 9); line(c, 50, 20, 50, 236, '#e0e4ea', 5);
    line(c, 50, 24, 80, 104, '#bbb', 2.5); circ(c, 80, 118, 18); paint(c, '#ffd23f'); c.beginPath(); c.arc(80, 118, 18, -0.4, 0.4); c.lineTo(80, 118); c.closePath(); paint(c, '#e8443a', 2);
  } },
  dome: { w: 230, h: 140, snd: 'chime', draw(c) {
    const cx = 115, by = 140, R = 112, H = 132, cols = ['#e8443a', '#ffd23f', '#43c46b', '#3a8cf0'];
    for (let i = 0; i <= 6; i++) { const rx = R * Math.abs(Math.cos(i * Math.PI / 6)); c.beginPath(); c.ellipse(cx, by, Math.max(1, rx), H, 0, Math.PI, TAU); c.strokeStyle = OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = cols[i % 4]; c.lineWidth = 3.5; c.stroke(); }
    for (const f of [0.35, 0.68]) { const y = by - H * f, hw = R * Math.sqrt(1 - f * f); line(c, cx - hw, y, cx + hw, y, OUT, 7); line(c, cx - hw, y, cx + hw, y, '#9b5de5', 3.5); }
  } },
  garden: { w: 230, h: 130, snd: 'chime', draw(c) {
    for (const [x, top] of [[30, 20], [78, 34], [126, 14]]) {
      line(c, x, 90, x, top, OUT, 6); line(c, x, 90, x, top, '#43c46b', 3); ell(c, x + 10, 64, 10, 5, -0.5); paint(c, '#43c46b', 2);
      star(c, x, top, 20, 10, 0.55); paint(c, '#ffd23f', 2.5); circ(c, x, top, 8); paint(c, '#7a4a2b', 2);
    }
    for (const x of [172, 206]) { line(c, x, 90, x, 44, '#a0662f', 4); ell(c, x - 4, 64, 12, 8); paint(c, '#43c46b', 2); circ(c, x + 6, 72, 7); paint(c, '#e8443a', 2); circ(c, x - 8, 56, 6); paint(c, '#e8443a', 2); }
    rrect(c, 4, 84, 222, 12, 4); paint(c, '#6b4526'); rrect(c, 0, 92, 230, 38, 4); paint(c, '#a0662f'); line(c, 2, 110, 228, 110, 'rgba(0,0,0,.2)', 2);
  } },
  hutch: { w: 160, h: 120, snd: 'chime', draw(c) {
    for (const x of [14, 136]) { rrect(c, x, 90, 10, 30, 2); paint(c, '#8a5a2b'); }
    rrect(c, 4, 30, 152, 64, 4); paint(c, '#a0662f'); poly(c, [0, 34, 80, 2, 160, 34]); paint(c, '#e8443a');
    rrect(c, 14, 42, 82, 44, 3); paint(c, '#fff');
    ell(c, 54, 74, 16, 11); paint(c, '#fff'); ell(c, 48, 56, 4, 11); paint(c, '#fff', 2); ell(c, 58, 56, 4, 11); paint(c, '#fff', 2); circ(c, 60, 70, 2); paint(c, OUT, 0); circ(c, 68, 74, 2); paint(c, '#ff7eb6', 0);
    for (let x = 24; x < 96; x += 10) line(c, x, 42, x, 86, 'rgba(90,90,90,.5)', 1.5); for (let y = 52; y < 86; y += 10) line(c, 14, y, 96, y, 'rgba(90,90,90,.5)', 1.5); rrect(c, 14, 42, 82, 44, 3); paint(c, null, 2.5);
    rrect(c, 104, 42, 42, 44, 3); paint(c, '#c68a5c', 2.5); txt(c, 'HOP', 125, 64, 12, '#fff');
  } },
  portable: { w: 310, h: 180, snd: 'bell', draw(c) {
    for (let x = 8; x < 300; x += 14) line(c, x, 150, x + 10, 180, '#c68a5c', 3); line(c, 6, 180, 304, 180, OUT, 3);
    rrect(c, 0, 30, 310, 122, 4); paint(c, '#f0e4c0'); rrect(c, -4, 22, 318, 12, 3); paint(c, '#9aa1b3');
    win(c, 26, 62, 56, 42); win(c, 228, 62, 56, 42); rrect(c, 132, 62, 46, 88, 3); paint(c, '#3a8cf0'); circ(c, 170, 108, 3); paint(c, '#ffd23f', 0);
    txt(c, 'ROOM 12', 155, 46, 15, '#3a6fd8'); rrect(c, 116, 150, 78, 10, 2); paint(c, '#888'); rrect(c, 124, 160, 62, 10, 2); paint(c, '#888');
  } },
  lostfound: { w: 130, h: 120, snd: 'chime', draw(c) {
    circ(c, 34, 38, 15); paint(c, '#ff7eb6'); circ(c, 34, 24, 6); paint(c, '#fff', 2); ell(c, 70, 36, 14, 11); paint(c, '#43c46b'); circ(c, 100, 34, 13); paint(c, '#ffd23f');
    rrect(c, 10, 40, 110, 80, 6); paint(c, '#3a8cf0'); rrect(c, 20, 52, 90, 24, 4); paint(c, '#fff', 2.5); txt(c, 'LOST & FOUND', 65, 64, 10, '#3a6fd8');
  } },
  bell: { w: 100, h: 220, snd: 'bell', draw(c) {
    line(c, 50, 50, 50, 220, OUT, 10); line(c, 50, 50, 50, 220, '#8a5a2b', 6); rrect(c, 12, 40, 76, 12, 4); paint(c, '#8a5a2b');
    c.beginPath(); c.moveTo(26, 100); c.quadraticCurveTo(30, 54, 50, 52); c.quadraticCurveTo(70, 54, 74, 100); c.closePath(); paint(c, '#ffd23f'); rrect(c, 22, 96, 56, 9, 4); paint(c, '#e0a800', 2.5);
    circ(c, 50, 110, 6); paint(c, OUT, 0); line(c, 50, 112, 64, 160, '#c68a5c', 3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(36, 66, 5, 26);
  } },
  monkeybars: { w: 250, h: 160, snd: 'chime', draw(c) {
    for (const x0 of [12, 206]) { for (const x of [x0, x0 + 32]) { line(c, x, 22, x, 160, OUT, 8); line(c, x, 22, x, 160, '#3a8cf0', 4); } for (let y = 50; y < 160; y += 28) { line(c, x0, y, x0 + 32, y, OUT, 7); line(c, x0, y, x0 + 32, y, '#ffd23f', 3); } }
    line(c, 12, 22, 238, 22, OUT, 9); line(c, 12, 22, 238, 22, '#e8443a', 5); for (let x = 60; x < 200; x += 22) { circ(c, x, 22, 5); paint(c, '#ffd23f', 2); }
  } },
  springrider: { w: 100, h: 110, snd: 'pop', draw(c) {
    ell(c, 50, 106, 30, 6); paint(c, '#888'); for (let k = 0; k < 5; k++) { ell(c, 50, 100 - k * 8, 14, 4); c.strokeStyle = OUT; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#c9ced6'; c.lineWidth = 2.5; c.stroke(); }
    ell(c, 46, 56, 34, 17); paint(c, '#ff7eb6'); poly(c, [66, 50, 76, 22, 88, 30, 80, 56]); paint(c, '#ff7eb6'); ell(c, 84, 28, 13, 10); paint(c, '#ff7eb6');
    circ(c, 86, 24, 2.5); paint(c, OUT, 0); poly(c, [78, 18, 82, 8, 86, 18]); paint(c, '#ff7eb6', 2); line(c, 72, 30, 64, 46, '#ffd23f', 5); line(c, 12, 50, 2, 64, '#ffd23f', 5);
    line(c, 74, 34, 74, 22, OUT, 4); line(c, 68, 22, 80, 22, OUT, 4);
  } },
  merrygo: { w: 210, h: 90, snd: 'jingle', draw(c) {
    for (const x of [30, 70, 140, 180]) { c.beginPath(); c.moveTo(x, 72); c.lineTo(x, 44); c.quadraticCurveTo(x, 22, 105, 22); c.strokeStyle = OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#3a8cf0'; c.lineWidth = 3.5; c.stroke(); }
    line(c, 105, 72, 105, 20, OUT, 6); circ(c, 105, 18, 9); paint(c, '#e8443a');
    rrect(c, 4, 70, 202, 14, 6); paint(c, '#ef4a3c'); ell(c, 105, 70, 100, 12); paint(c, '#ffd23f'); line(c, 105, 84, 105, 90, OUT, 6);
  } },
  playhouse: { w: 180, h: 180, snd: 'chime', draw(c) {
    rrect(c, 130, 16, 18, 40, 2); paint(c, '#a0662f'); rrect(c, 10, 70, 160, 110, 4); paint(c, '#fff3d6'); poly(c, [0, 74, 90, 8, 180, 74]); paint(c, '#9b5de5');
    c.beginPath(); c.moveTo(70, 180); c.lineTo(70, 128); c.arc(90, 128, 20, Math.PI, 0); c.lineTo(110, 180); c.closePath(); paint(c, '#43c46b'); circ(c, 102, 150, 3); paint(c, '#ffd23f', 0);
    win(c, 22, 96, 36, 30); win(c, 122, 96, 36, 30); rrect(c, 20, 126, 40, 10, 3); paint(c, '#a0662f', 2); for (const x of [28, 40, 52]) { circ(c, x, 124, 5); paint(c, '#ff7eb6', 1.5); }
  } },
  ballcart: { w: 150, h: 120, snd: 'pop', draw(c) {
    circ(c, 30, 38, 16); paint(c, '#ef4a3c'); circ(c, 62, 30, 18); paint(c, '#ff7a1a'); line(c, 44, 30, 80, 30, OUT, 2); circ(c, 96, 36, 16); paint(c, '#fff'); poly(c, [96, 30, 101, 34, 99, 40, 93, 40, 91, 34]); paint(c, OUT, 0); circ(c, 124, 40, 13); paint(c, '#ffd23f');
    rrect(c, 10, 44, 130, 56, 6); paint(c, '#c9ced6'); for (let x = 22; x < 140; x += 12) line(c, x, 46, x, 98, 'rgba(0,0,0,.25)', 2); rrect(c, 10, 44, 130, 56, 6); paint(c, null, 3);
    wheel(c, 30, 108, 11); wheel(c, 120, 108, 11);
  } },
  chalkboard: { w: 140, h: 160, snd: 'chime', draw(c) {
    line(c, 24, 160, 52, 6, OUT, 6); line(c, 116, 160, 88, 6, OUT, 6); line(c, 70, 6, 70, 160, OUT, 5);
    rrect(c, 8, 18, 124, 92, 5); paint(c, '#a0662f'); rrect(c, 16, 26, 108, 76, 3); paint(c, '#2f6b4f', 2);
    txt(c, 'ABC', 52, 46, 20, '#fff'); txt(c, '1+1=2', 70, 78, 16, '#ffd23f'); star(c, 106, 44, 9, 5, 0.5); c.strokeStyle = '#ff9fc0'; c.lineWidth = 2.5; c.stroke();
    rrect(c, 12, 108, 116, 8, 2); paint(c, '#8a5a2b', 2);
  } },
  tires: { w: 200, h: 100, snd: 'pop', draw(c) {
    const ring = (x, y, r, col) => { circ(c, x, y, r); paint(c, '#2e2a36'); circ(c, x, y, r * 0.45); paint(c, col, 2.5); };
    ring(38, 70, 30, '#ffd23f'); ring(100, 70, 30, '#43c46b'); ring(162, 70, 30, '#ff7eb6'); ring(69, 34, 27, '#3a8cf0'); ring(131, 34, 27, '#ff9f1c');
  } },
  tunnel: { w: 230, h: 100, snd: 'whistle', draw(c) {
    rrect(c, 10, 20, 210, 80, 40); paint(c, '#9b5de5'); for (let x = 46; x < 200; x += 30) line(c, x, 22, x, 98, 'rgba(0,0,0,.2)', 5);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(40, 30, 150, 8); ell(c, 210, 60, 16, 38); paint(c, '#4a2a7a');
  } },
  climbwall: { w: 150, h: 210, snd: 'chime', draw(c) {
    line(c, 20, 200, 20, 10, OUT, 6); line(c, 130, 200, 130, 10, OUT, 6);
    rrect(c, 10, 10, 130, 196, 6); paint(c, '#3a8cf0'); const cols = ['#ffd23f', '#e8443a', '#43c46b', '#ff7eb6', '#ff9f1c'];
    for (let k = 0; k < 14; k++) { ell(c, 26 + (k * 47) % 100, 26 + k * 13, 8, 6, k); paint(c, cols[k % 5], 2); }
    poly(c, [75, 10, 75, -10, 100, 0]); paint(c, '#ffd23f', 2);
  } },
  puppetshow: { w: 190, h: 210, snd: 'jingle', draw(c) {
    rrect(c, 10, 60, 170, 150, 4); paint(c, '#ef4a3c'); rrect(c, 30, 82, 130, 70, 4); paint(c, '#2a2140');
    circ(c, 95, 124, 18); paint(c, '#ffd23f'); circ(c, 89, 120, 2.5); paint(c, OUT, 0); circ(c, 101, 120, 2.5); paint(c, OUT, 0); c.beginPath(); c.arc(95, 128, 6, 0.2, Math.PI - 0.2); c.stroke(); rrect(c, 83, 140, 24, 14, 4); paint(c, '#43c46b', 2);
    poly(c, [30, 82, 62, 82, 40, 152, 30, 152]); paint(c, '#9b5de5'); poly(c, [160, 82, 128, 82, 150, 152, 160, 152]); paint(c, '#9b5de5');
    rrect(c, 20, 26, 150, 34, 8); paint(c, '#ffd23f'); txt(c, 'PUPPETS', 95, 43, 18, '#e8443a'); for (const x of [30, 160]) { line(c, x, 26, x, 6, OUT, 3); poly(c, [x, 6, x + 16, 11, x, 16]); paint(c, '#43c46b', 2); }
  } },
  pirateship: { w: 330, h: 230, snd: 'jingle', draw(c) {
    poly(c, [280, 150, 330, 226, 310, 230, 262, 156]); paint(c, '#ffd23f');
    line(c, 160, 152, 160, 10, OUT, 10); line(c, 160, 152, 160, 10, '#8a5a2b', 6); poly(c, [160, 10, 196, 18, 160, 28]); paint(c, '#2a2140', 2);
    rrect(c, 108, 36, 104, 80, 6); paint(c, '#fff'); circ(c, 160, 70, 16); paint(c, '#fff', 2.5); circ(c, 154, 68, 3); paint(c, OUT, 0); circ(c, 166, 68, 3); paint(c, OUT, 0); line(c, 150, 92, 170, 100, OUT, 3); line(c, 170, 92, 150, 100, OUT, 3);
    poly(c, [0, 146, 300, 146, 270, 226, 30, 226]); paint(c, '#a0662f'); for (let y = 166; y < 226; y += 18) line(c, 10 + (y - 146) * 0.35, y, 290 - (y - 146) * 0.35, y, 'rgba(0,0,0,.2)', 2);
    for (const x of [80, 160, 240]) { circ(c, x, 186, 11); paint(c, '#bfe7ff', 2.5); } rrect(c, -4, 138, 308, 12, 4); paint(c, '#8a5a2b');
  } },
  scoreboard: { w: 250, h: 270, snd: 'whistle', draw(c) {
    for (const x of [60, 190]) { rrect(c, x - 6, 146, 12, 124, 2); paint(c, '#888'); }
    rrect(c, 0, 10, 250, 140, 8); paint(c, '#2a2140'); txt(c, 'HOME', 62, 32, 17, '#fff'); txt(c, 'GUEST', 188, 32, 17, '#fff');
    for (const [x, n] of [[62, '3'], [188, '2']]) { rrect(c, x - 30, 46, 60, 50, 4); paint(c, '#111', 2); txt(c, n, x, 72, 40, '#ff9f1c'); }
    txt(c, '12:00', 125, 122, 24, '#43c46b'); rrect(c, 80, 0, 90, 18, 5); paint(c, '#e8443a'); txt(c, 'GO TEAM', 125, 9, 11, '#fff');
  } },
  dugout: { w: 270, h: 140, snd: 'whistle', draw(c) {
    rrect(c, 10, 22, 250, 100, 2); paint(c, '#c9ced6'); rrect(c, 0, 10, 270, 16, 4); paint(c, '#3a8cf0');
    rrect(c, 24, 72, 222, 12, 3); paint(c, '#a0662f'); for (const x of [40, 230]) line(c, x, 84, x, 112, OUT, 5);
    for (const [x, col] of [[70, '#e8443a'], [120, '#3a8cf0'], [170, '#e8443a']]) { c.beginPath(); c.arc(x, 72, 14, Math.PI, 0); c.closePath(); paint(c, col, 2.5); }
    for (const x of [204, 214]) { line(c, x, 72, x + 18, 34, OUT, 7); line(c, x, 72, x + 18, 34, '#e0a84a', 4); }
    rrect(c, 0, 110, 270, 30, 3); paint(c, '#43c46b');
  } },
  snackbar: { w: 250, h: 210, snd: 'chime', draw(c) {
    rrect(c, 0, 66, 250, 144, 4); paint(c, '#fff3d6'); rrect(c, 50, 10, 150, 36, 8); paint(c, '#ffd23f'); txt(c, 'SNACKS', 125, 28, 20, '#e8443a'); line(c, 90, 46, 90, 66, OUT, 4); line(c, 160, 46, 160, 66, OUT, 4);
    c.save(); rrect(c, -6, 62, 262, 28, 4); c.clip(); for (let x = -6; x < 256; x += 26) { c.fillStyle = (x / 26) % 2 < 1 ? '#e8443a' : '#fff'; c.fillRect(x + 6, 62, 26, 28); } c.restore(); rrect(c, -6, 62, 262, 28, 4); paint(c, null, 3);
    rrect(c, 34, 98, 182, 56, 4); paint(c, '#bfe7ff', 2.5); rrect(c, 26, 152, 198, 12, 3); paint(c, '#a0662f');
    ell(c, 80, 146, 22, 7); paint(c, '#e0a84a', 2); ell(c, 80, 142, 20, 4); paint(c, '#c0392b', 2); poly(c, [150, 124, 170, 124, 166, 152, 154, 152]); paint(c, '#3a8cf0', 2); line(c, 162, 124, 168, 110, OUT, 3);
  } },
  medalstand: { w: 220, h: 110, snd: 'jingle', draw(c) {
    rrect(c, 0, 50, 72, 60, 3); paint(c, '#c9ced6'); txt(c, '2', 36, 80, 30, '#fff'); rrect(c, 72, 20, 76, 90, 3); paint(c, '#ffd23f'); txt(c, '1', 110, 56, 36, '#fff'); rrect(c, 148, 64, 72, 46, 3); paint(c, '#c68a5c'); txt(c, '3', 184, 88, 26, '#fff');
    star(c, 110, 6, 10, 5, 0.5); paint(c, '#fff27a', 2);
  } },
  goalpost: { w: 200, h: 290, snd: 'whistle', draw(c) {
    rrect(c, 86, 220, 28, 70, 8); paint(c, '#3a8cf0');
    for (const [a, b, d, e] of [[100, 180, 100, 222], [20, 180, 180, 180], [20, 180, 20, 8], [180, 180, 180, 8]]) { line(c, a, b, d, e, OUT, 12); line(c, a, b, d, e, '#ffd23f', 7); }
    for (const x of [20, 180]) { poly(c, [x, 8, x + 16, 14, x, 20]); paint(c, '#e8443a', 2); }
  } },
  // high things
  flowerpot: { w: 60, h: 70, snd: 'chime', draw(c) {
    for (const [x, y, col] of [[18, 18, '#ff7eb6'], [32, 10, '#ffd23f'], [44, 20, '#9b5de5']]) { line(c, x, y, 30, 40, '#43c46b', 3); circ(c, x, y, 8); paint(c, col, 2); }
    poly(c, [6, 36, 54, 36, 46, 70, 14, 70]); paint(c, '#d9785a'); rrect(c, 2, 32, 56, 10, 3); paint(c, '#c0603f', 2.5);
  } },
  toolbox: { w: 80, h: 56, snd: 'chime', draw(c) {
    c.beginPath(); c.moveTo(24, 16); c.lineTo(24, 4); c.lineTo(56, 4); c.lineTo(56, 16); c.strokeStyle = OUT; c.lineWidth = 5; c.stroke();
    rrect(c, 2, 14, 76, 42, 5); paint(c, '#e8443a'); line(c, 2, 28, 78, 28, OUT, 2.5); rrect(c, 32, 24, 16, 10, 2); paint(c, '#c9ced6', 2);
  } },
  paintcans: { w: 90, h: 64, snd: 'chime', draw(c) {
    for (const [x, col, h] of [[4, '#3a8cf0', 48], [46, '#ffd23f', 40]]) { rrect(c, x, 64 - h, 40, h, 4); paint(c, '#d5d9e0'); rrect(c, x, 64 - h, 40, 12, 4); paint(c, col, 2.5); rrect(c, x + 6, 64 - h + 20, 28, 16, 2); paint(c, col, 2); }
    line(c, 66, 24, 84, 4, OUT, 5); rrect(c, 78, 0, 12, 10, 2); paint(c, '#fff', 2);
  } },
  basket: { w: 84, h: 60, snd: 'chime', draw(c) {
    c.beginPath(); c.arc(42, 26, 30, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#c68a5c'; c.lineWidth = 3; c.stroke();
    circ(c, 24, 28, 11); paint(c, '#e8443a'); circ(c, 44, 24, 11); paint(c, '#ff9f1c'); circ(c, 62, 30, 10); paint(c, '#9b5de5');
    poly(c, [4, 30, 80, 30, 70, 60, 14, 60]); paint(c, '#d8b17a'); for (let x = 16; x < 72; x += 10) line(c, x, 32, x - 2, 58, 'rgba(0,0,0,.2)', 2);
  } },
  backpack: { w: 64, h: 72, snd: 'chime', draw(c) {
    c.beginPath(); c.arc(32, 14, 11, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 5; c.stroke();
    rrect(c, 6, 12, 52, 60, 14); paint(c, '#ef4a3c'); rrect(c, 14, 42, 36, 24, 6); paint(c, '#c0302a', 2.5); line(c, 16, 26, 48, 26, OUT, 2); circ(c, 32, 50, 3); paint(c, '#ffd23f', 0);
  } },
  lunchbox: { w: 76, h: 58, snd: 'chime', draw(c) {
    c.beginPath(); c.moveTo(24, 16); c.lineTo(26, 4); c.lineTo(50, 4); c.lineTo(52, 16); c.strokeStyle = OUT; c.lineWidth = 5; c.stroke();
    rrect(c, 4, 14, 68, 44, 6); paint(c, '#43c46b'); star(c, 38, 36, 12, 5, 0.5); paint(c, '#ffd23f', 2); rrect(c, 32, 12, 12, 8, 2); paint(c, '#c9ced6', 2);
  } },
  globe: { w: 64, h: 88, snd: 'chime', draw(c) {
    ell(c, 32, 82, 22, 5); paint(c, '#a0662f'); line(c, 32, 80, 32, 64, OUT, 5);
    circ(c, 32, 36, 25); paint(c, '#3a8cf0'); ell(c, 24, 28, 10, 8, 0.4); paint(c, '#43c46b', 2); ell(c, 42, 46, 8, 6, -0.3); paint(c, '#43c46b', 2);
    c.beginPath(); c.arc(32, 36, 30, -2.4, 1.1); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke();
  } },
  ballbucket: { w: 76, h: 66, snd: 'pop', draw(c) {
    circ(c, 22, 22, 12); paint(c, '#fff'); circ(c, 42, 16, 12); paint(c, '#ffd23f'); circ(c, 58, 22, 11); paint(c, '#ef4a3c');
    poly(c, [6, 26, 70, 26, 60, 66, 16, 66]); paint(c, '#ff9f1c'); line(c, 10, 38, 66, 38, 'rgba(0,0,0,.2)', 3);
  } },
  trophy: { w: 60, h: 90, snd: 'jingle', draw(c) {
    for (const s of [-1, 1]) { c.beginPath(); c.arc(30 + s * 22, 24, 10, 0, TAU); c.strokeStyle = OUT; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#ffd23f'; c.lineWidth = 3; c.stroke(); }
    rrect(c, 14, 72, 32, 18, 3); paint(c, '#7a4a2b'); rrect(c, 24, 54, 12, 20, 2); paint(c, '#ffd23f');
    c.beginPath(); c.moveTo(10, 8); c.lineTo(50, 8); c.quadraticCurveTo(50, 58, 30, 58); c.quadraticCurveTo(10, 58, 10, 8); c.closePath(); paint(c, '#ffd23f'); star(c, 30, 28, 9, 5, 0.5); paint(c, '#fff27a', 2);
  } },
  cooler: { w: 84, h: 90, snd: 'splash', draw(c) {
    rrect(c, 8, 20, 68, 70, 12); paint(c, '#ff9f1c'); rrect(c, 4, 10, 76, 16, 6); paint(c, '#fff'); rrect(c, 8, 46, 68, 8, 0); paint(c, '#fff', 0); rrect(c, 32, 66, 20, 10, 3); paint(c, '#fff', 2);
  } },
  // ---------------- story things (v1.32): Puddle Park area
  splashpad: { w: 220, h: 150, snd: 'splash', draw(c) {
    ell(c, 110, 138, 106, 12); paint(c, '#c9ced8');
    for (const [x, col, hh] of [[40, '#3a8cf0', 70], [110, '#ffd23f', 104], [180, '#ff7eb6', 70]]) {
      c.beginPath(); c.moveTo(x, 150 - hh); c.quadraticCurveTo(x + (x < 110 ? -30 : x > 110 ? 30 : 0), 150 - hh - 40, x + (x < 110 ? -40 : x > 110 ? 40 : 0), 134); c.strokeStyle = 'rgba(140,210,255,.9)'; c.lineWidth = 6; c.stroke();
      rrect(c, x - 9, 150 - hh, 18, hh - 10, 5); paint(c, col); circ(c, x, 150 - hh, 12); paint(c, col);
    }
    poly(c, [92, 30, 128, 30, 122, 52, 98, 52]); paint(c, '#43c46b', 2.5); line(c, 110, 30, 110, 44, OUT, 3);
  } },
  hotdog: { w: 190, h: 170, snd: 'jingle', draw(c) {
    line(c, 95, 20, 95, 84, OUT, 5);
    c.beginPath(); c.moveTo(10, 40); c.quadraticCurveTo(95, -14, 180, 40); c.closePath(); paint(c, '#ffd23f');
    for (const x of [38, 95, 152]) { c.beginPath(); c.moveTo(95, 6); c.lineTo(x - 14, 38); c.lineTo(x + 14, 38); c.closePath(); paint(c, '#e8443a', 2); }
    rrect(c, 14, 84, 162, 56, 8); paint(c, '#fff'); rrect(c, 14, 84, 162, 14, 6); paint(c, '#3a8cf0', 2.5);
    rrect(c, 52, 108, 86, 22, 11); paint(c, '#e8b35a', 2.5); rrect(c, 58, 112, 74, 12, 6); paint(c, '#c0392b', 2); line(c, 64, 118, 126, 118, '#ffd23f', 2.5);
    wheel(c, 42, 150, 17); wheel(c, 148, 150, 17); line(c, 176, 100, 190, 90, OUT, 5);
  } },
  stroller: { w: 110, h: 110, snd: 'jingle', draw(c) {
    line(c, 80, 60, 104, 14, OUT, 5); rrect(c, 96, 8, 14, 9, 4); paint(c, '#555', 2);
    c.beginPath(); c.moveTo(10, 46); c.lineTo(84, 46); c.quadraticCurveTo(86, 84, 50, 84); c.quadraticCurveTo(12, 84, 10, 46); c.closePath(); paint(c, '#7fc8f0');
    c.beginPath(); c.moveTo(10, 50); c.quadraticCurveTo(10, 8, 50, 8); c.lineTo(50, 50); c.closePath(); paint(c, '#3a6fd8');
    for (let k = 1; k < 4; k++) line(c, 50 - k * 11, 12 + k * 3, 14 + k * 2, 48, '#2c58b0', 2);
    circ(c, 64, 42, 9); paint(c, '#ffdcb5', 2); c.beginPath(); c.arc(64, 44, 4, 0.3, Math.PI - 0.3); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke();
    wheel(c, 24, 96, 12); wheel(c, 76, 96, 12);
  } },
  duckhouse: { w: 110, h: 210, snd: 'quack', draw(c) {
    rrect(c, 48, 90, 14, 120, 2); paint(c, '#8a5a2b');
    rrect(c, 14, 46, 82, 52, 4); paint(c, '#ffd23f'); poly(c, [4, 50, 55, 8, 106, 50]); paint(c, '#e8443a');
    c.beginPath(); c.arc(55, 82, 15, Math.PI, 0); c.lineTo(70, 98); c.lineTo(40, 98); c.closePath(); paint(c, '#5a3a22', 2.5);
    circ(c, 56, 80, 9); paint(c, '#fff', 2); poly(c, [62, 79, 72, 81, 62, 84]); paint(c, '#ff9f1c', 1.5); circ(c, 59, 77, 1.8); c.fillStyle = OUT; c.fill();
    rrect(c, 8, 96, 94, 8, 3); paint(c, '#a0662f', 2);
  } },
  swanboat: { w: 230, h: 140, snd: 'quack', draw(c) {
    rrect(c, 20, 118, 190, 14, 4); paint(c, '#8a5a2b'); wheel(c, 50, 130, 10); wheel(c, 180, 130, 10);
    c.beginPath(); c.moveTo(10, 78); c.quadraticCurveTo(20, 122, 110, 120); c.quadraticCurveTo(190, 120, 196, 86); c.lineTo(10, 78); c.closePath(); paint(c, '#fff');
    c.beginPath(); c.moveTo(14, 80); c.quadraticCurveTo(2, 50, 30, 56); c.quadraticCurveTo(50, 60, 60, 80); paint(c, '#fff');
    c.beginPath(); c.moveTo(176, 86); c.quadraticCurveTo(170, 40, 186, 22); c.quadraticCurveTo(204, 4, 216, 24); c.quadraticCurveTo(200, 30, 196, 86); c.closePath(); paint(c, '#fff');
    poly(c, [214, 20, 228, 26, 214, 30]); paint(c, '#ff9f1c', 2); circ(c, 206, 18, 2.5); c.fillStyle = OUT; c.fill();
    rrect(c, 70, 62, 70, 24, 6); paint(c, '#3a8cf0'); line(c, 106, 62, 106, 40, OUT, 3); circ(c, 106, 36, 7); paint(c, '#43c46b', 2);
  } },
  boatrental: { w: 200, h: 210, snd: 'bell', draw(c) {
    rrect(c, 20, 70, 160, 140, 4); paint(c, '#bfe1f5'); rrect(c, 20, 140, 160, 12, 3); paint(c, '#fff', 2.5);
    poly(c, [6, 74, 100, 24, 194, 74]); paint(c, '#3a8cf0'); rrect(c, 46, 0, 108, 30, 6); paint(c, '#fff'); txt(c, 'BOATS', 100, 16, 19, '#e8443a');
    rrect(c, 40, 86, 120, 50, 4); paint(c, '#fff3d6', 2.5); txt(c, '$1', 100, 112, 22, '#43a047');
    circ(c, 150, 176, 22); paint(c, '#ff6f5a'); circ(c, 150, 176, 11); paint(c, '#bfe1f5', 2.5);
    for (const a of [0.8, 2.4, 3.9, 5.5]) { c.save(); c.translate(150 + Math.cos(a) * 16, 176 + Math.sin(a) * 16); c.rotate(a); c.fillStyle = '#fff'; c.fillRect(-4, -6, 8, 12); c.restore(); }
    for (const x of [46, 76]) { rrect(c, x, 156, 16, 50, 6); paint(c, '#ffd23f', 2); }
  } },
  footbridge: { w: 260, h: 110, snd: 'chime', draw(c) {
    c.beginPath(); c.moveTo(0, 110); c.quadraticCurveTo(130, 30, 260, 110); c.lineTo(240, 110); c.quadraticCurveTo(130, 56, 20, 110); c.closePath(); paint(c, '#c0603f');
    c.beginPath(); c.moveTo(6, 74); c.quadraticCurveTo(130, -10, 254, 74); c.strokeStyle = OUT; c.lineWidth = 8; c.stroke(); c.strokeStyle = '#e8443a'; c.lineWidth = 4; c.stroke();
    for (let k = 0; k <= 8; k++) { const x = 16 + k * 28.5, t = (x - 130) / 130, y0 = 104 - 46 * (1 - t * t), y1 = 70 - 52 * (1 - t * t); line(c, x, y0, x, y1 + 4, '#e8443a', 4); }
  } },
  frogstatue: { w: 130, h: 120, snd: 'splash', draw(c) {
    ell(c, 60, 108, 58, 12); paint(c, '#4fb548');
    c.beginPath(); c.moveTo(78, 34); c.quadraticCurveTo(118, 20, 124, 100); c.strokeStyle = 'rgba(140,210,255,.95)'; c.lineWidth = 5; c.stroke();
    ell(c, 56, 78, 36, 28); paint(c, '#43c46b'); ell(c, 56, 86, 22, 16); paint(c, '#b8e986', 2);
    for (const x of [38, 70]) { circ(c, x, 44, 12); paint(c, '#43c46b'); circ(c, x, 44, 6); paint(c, '#fff', 2); circ(c, x + 1, 44, 3); c.fillStyle = OUT; c.fill(); }
    c.beginPath(); c.arc(56, 62, 16, 0.2, Math.PI - 0.2); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke(); circ(c, 76, 34, 5); paint(c, '#ff6f8a', 2);
    for (const x of [24, 88]) { ell(c, x, 102, 14, 6); paint(c, '#43c46b', 2); }
  } },
  tulipbed: { w: 220, h: 70, snd: 'chime', draw(c) {
    for (let k = 0; k < 9; k++) { const x = 18 + k * 23, y = 14 + (k % 2) * 8, col = ['#e8443a', '#ffd23f', '#ff7eb6', '#9b5de5'][k % 4];
      line(c, x, y + 10, x, 52, '#3f8f3a', 3); ell(c, x + 6, 44, 6, 3, -0.5); c.fillStyle = '#43c46b'; c.fill();
      c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x - 4, y + 6); c.lineTo(x, y - 2); c.lineTo(x + 4, y + 6); c.lineTo(x + 8, y); c.quadraticCurveTo(x + 8, y + 16, x, y + 16); c.quadraticCurveTo(x - 8, y + 16, x - 8, y); c.closePath(); paint(c, col, 2); }
    for (let k = 0; k < 7; k++) { rrect(c, k * 32, 50, 32, 20, 2); paint(c, k % 2 ? '#c0603f' : '#d9785a', 2.5); }
  } },
  sunflowers: { w: 150, h: 220, snd: 'chime', draw(c) {
    for (const [x, y, s] of [[30, 60, 0.9], [76, 22, 1.1], [120, 74, 0.85]]) {
      line(c, x, y, x + 4, 220, '#3f8f3a', 6); ell(c, x + 14, y + 70, 14, 6, -0.4); paint(c, '#43c46b', 2);
      for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ell(c, x + Math.cos(a) * 20 * s, y + Math.sin(a) * 20 * s, 11 * s, 5 * s, a); paint(c, '#ffd23f', 2); }
      circ(c, x, y, 13 * s); paint(c, '#7a4a28', 2.5);
    }
  } },
  wheelbarrow: { w: 160, h: 90, snd: 'chime', draw(c) {
    line(c, 70, 64, 150, 48, OUT, 5); line(c, 92, 64, 104, 90, OUT, 5);
    poly(c, [4, 20, 112, 20, 96, 64, 24, 64]); paint(c, '#43c46b');
    for (const [x, col] of [[26, '#e8443a'], [50, '#ffd23f'], [76, '#ff7eb6'], [96, '#9b5de5']]) { circ(c, x, 14, 10); paint(c, col, 2); circ(c, x, 14, 3); paint(c, '#fff27a', 0); }
    wheel(c, 30, 74, 15);
  } },
  beehive: { w: 100, h: 120, snd: 'pop', draw(c) {
    for (const x of [14, 78]) rrect(c, x, 86, 8, 34, 2), paint(c, '#8a5a2b');
    rrect(c, 8, 80, 84, 10, 3); paint(c, '#a0662f');
    for (let k = 0; k < 3; k++) { rrect(c, 14, 54 - k * 22, 72, 24, 3); paint(c, k % 2 ? '#fff3d6' : '#ffd23f'); }
    poly(c, [8, 12, 50, 0, 92, 12]); paint(c, '#c0603f'); rrect(c, 40, 70, 20, 6, 3); paint(c, OUT, 0);
    for (const [x, y] of [[20, 26], [84, 40], [70, 6]]) { ell(c, x, y, 7, 5); paint(c, '#ffd23f', 2); line(c, x - 2, y - 4, x - 2, y + 4, OUT, 2); ell(c, x + 1, y - 7, 5, 3); paint(c, 'rgba(255,255,255,.8)', 1.5); }
  } },
  birdhouse: { w: 80, h: 210, snd: 'whistle', draw(c) {
    rrect(c, 34, 80, 12, 130, 2); paint(c, '#8a5a2b');
    rrect(c, 12, 34, 56, 56, 4); paint(c, '#7fc8f0'); poly(c, [2, 38, 40, 4, 78, 38]); paint(c, '#ffd23f');
    circ(c, 40, 58, 10); paint(c, '#3a2616', 2); line(c, 40, 74, 40, 84, OUT, 3);
    ell(c, 62, 30, 10, 8); paint(c, '#e8443a', 2); circ(c, 70, 24, 6); paint(c, '#e8443a', 2); poly(c, [75, 23, 82, 25, 75, 27]); paint(c, '#ff9f1c', 1.5); circ(c, 71, 22, 1.5); c.fillStyle = OUT; c.fill();
  } },
  topiary: { w: 170, h: 180, snd: 'chime', draw(c) {
    poly(c, [44, 138, 126, 138, 116, 180, 54, 180]); paint(c, '#d9785a');
    ell(c, 85, 104, 62, 40); paint(c, '#4fb548'); circ(c, 128, 64, 30); paint(c, '#4fb548');
    ell(c, 118, 18, 9, 26, -0.15); paint(c, '#4fb548'); ell(c, 140, 20, 9, 26, 0.2); paint(c, '#4fb548');
    circ(c, 24, 100, 14); paint(c, '#5fc45a'); circ(c, 136, 60, 4); c.fillStyle = OUT; c.fill(); circ(c, 152, 72, 4); paint(c, '#ff7eb6', 1.5);
    for (const [x, y] of [[60, 90], [90, 118], [104, 84]]) { c.beginPath(); c.arc(x, y, 9, 3.4, 5.6); c.strokeStyle = '#3f9a3a'; c.lineWidth = 2.5; c.stroke(); }
  } },
  rosearch: { w: 200, h: 230, snd: 'chime', draw(c) {
    c.beginPath(); c.moveTo(14, 230); c.lineTo(14, 100); c.arc(100, 100, 86, Math.PI, 0); c.lineTo(186, 230); c.strokeStyle = OUT; c.lineWidth = 14; c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.stroke();
    for (let k = 0; k < 16; k++) { const a = Math.PI + k / 15 * Math.PI, x = 100 + Math.cos(a) * 86, y = 100 + Math.sin(a) * 86; circ(c, x + (k % 2 ? 6 : -6), y, 10); paint(c, '#4fb548', 2); if (k % 2) { circ(c, x, y + 4, 7); paint(c, ['#e8443a', '#ff7eb6'][k % 4 > 1 ? 1 : 0], 2); } }
    for (const x of [14, 186]) for (let y = 130; y < 220; y += 30) { circ(c, x, y, 9); paint(c, '#4fb548', 2); circ(c, x + 3, y + 3, 5); paint(c, '#ff7eb6', 1.5); }
  } },
  gnome: { w: 60, h: 80, snd: 'chime', draw(c) {
    rrect(c, 14, 44, 32, 30, 8); paint(c, '#3a8cf0'); rrect(c, 12, 72, 14, 8, 3); paint(c, '#5a3a22', 2); rrect(c, 34, 72, 14, 8, 3); paint(c, '#5a3a22', 2);
    c.beginPath(); c.moveTo(16, 46); c.quadraticCurveTo(30, 80, 44, 46); c.closePath(); paint(c, '#fff', 2.5);
    circ(c, 30, 36, 11); paint(c, '#ffdcb5', 2.5); circ(c, 30, 40, 4); paint(c, '#ff9f8a', 1.5); poly(c, [16, 32, 30, 0, 44, 32]); paint(c, '#e8443a');
  } },
  wateringcan: { w: 70, h: 60, snd: 'splash', draw(c) {
    line(c, 50, 36, 68, 14, OUT, 7); line(c, 50, 36, 68, 14, '#43c46b', 3.5); rrect(c, 62, 8, 8, 10, 2); paint(c, '#43c46b', 2);
    rrect(c, 6, 22, 46, 38, 8); paint(c, '#43c46b'); c.beginPath(); c.arc(28, 24, 16, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke(); circ(c, 28, 40, 7); paint(c, '#ffd23f', 2);
  } },
  // ---------------- story things (v1.32): Big City area
  trafficlight: { w: 70, h: 250, snd: 'bell', draw(c) {
    rrect(c, 29, 100, 12, 150, 2); paint(c, '#55606e'); rrect(c, 18, 236, 34, 14, 3); paint(c, '#55606e', 2);
    rrect(c, 12, 0, 46, 112, 10); paint(c, '#2e2a36');
    for (const [y, col] of [[20, '#ff4a3c'], [56, '#ffd23f'], [92, '#43c46b']]) { circ(c, 35, y, 13); paint(c, col, 2.5); }
    rrect(c, 22, 150, 26, 26, 4); paint(c, '#ffd23f', 2.5); circ(c, 36, 156, 3); c.fillStyle = OUT; c.fill(); line(c, 35, 160, 33, 168, OUT, 3); line(c, 33, 168, 29, 173, OUT, 2.5); line(c, 33, 168, 38, 173, OUT, 2.5); line(c, 29, 163, 39, 164, OUT, 2.5);
  } },
  pizzeria: { w: 240, h: 220, snd: 'jingle', draw(c) {
    rrect(c, 0, 30, 240, 190, 3); paint(c, '#f2e6cf'); rrect(c, 10, 0, 220, 42, 6); paint(c, '#43a047'); txt(c, 'PIZZA', 120, 21, 26, '#fff');
    for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? '#fff' : '#e8443a'; c.fillRect(k * 30, 50, 30, 22); } rrect(c, 0, 50, 240, 22, 2); paint(c, null, 2.5);
    rrect(c, 14, 88, 120, 80, 4); paint(c, '#bfe7ff', 2.5);
    c.beginPath(); c.moveTo(74, 96); c.lineTo(46, 156); c.quadraticCurveTo(74, 164, 102, 156); c.closePath(); paint(c, '#ffd23f', 2.5);
    for (const [x, y] of [[70, 124], [62, 144], [82, 146]]) { circ(c, x, y, 5); paint(c, '#e8443a', 1.5); }
    rrect(c, 154, 96, 66, 124, 4); paint(c, '#c0603f'); circ(c, 208, 160, 4); paint(c, '#ffd23f', 1.5);
  } },
  foodtruck: { w: 300, h: 170, snd: 'honk', draw(c) {
    rrect(c, 4, 20, 230, 124, 10); paint(c, '#ff9f1c'); rrect(c, 228, 60, 68, 84, 10); paint(c, '#ff9f1c');
    rrect(c, 244, 72, 40, 34, 5); paint(c, '#bfe7ff', 2.5);
    rrect(c, 30, 42, 160, 56, 4); paint(c, '#fff3d6', 2.5); poly(c, [22, 42, 198, 42, 190, 28, 30, 28]); paint(c, '#e8443a', 2.5);
    txt(c, 'TACOS', 110, 70, 26, '#e8443a'); rrect(c, 24, 98, 172, 10, 3); paint(c, '#a0662f', 2.5);
    c.beginPath(); c.arc(118, 12, 16, Math.PI, 0); c.closePath(); paint(c, '#ffd23f'); line(c, 106, 10, 130, 10, '#43c46b', 3);
    wheel(c, 64, 146, 22); wheel(c, 246, 146, 22);
  } },
  phonebooth: { w: 80, h: 200, snd: 'bell', draw(c) {
    rrect(c, 6, 16, 68, 184, 6); paint(c, '#e8443a'); rrect(c, 2, 4, 76, 18, 6); paint(c, '#c0392b'); txt(c, 'PHONE', 40, 13, 12, '#fff');
    for (let r = 0; r < 4; r++) for (let q = 0; q < 2; q++) { rrect(c, 14 + q * 28, 32 + r * 34, 24, 28, 2); paint(c, '#bfe7ff', 2); }
    rrect(c, 14, 172, 52, 20, 3); paint(c, '#c0392b', 2);
  } },
  bikeshare: { w: 220, h: 110, snd: 'jingle', draw(c) {
    rrect(c, 0, 96, 220, 14, 4); paint(c, '#55606e');
    for (const x of [8, 112]) { c.save(); c.translate(x, 36); c.scale(0.95, 0.95); OBJ.bike.draw(c, 104, 64, 2); c.restore(); }
    for (const x of [16, 120]) { rrect(c, x, 58, 10, 40, 3); paint(c, '#43c46b', 2); }
    rrect(c, 180, 0, 34, 98, 5); paint(c, '#43c46b'); rrect(c, 186, 10, 22, 26, 3); paint(c, '#bfe7ff', 2); circ(c, 197, 60, 7); paint(c, '#fff', 2);
  } },
  parkingmeter: { w: 40, h: 110, snd: 'chime', draw(c) {
    rrect(c, 16, 50, 8, 60, 2); paint(c, '#55606e');
    rrect(c, 4, 4, 32, 50, 10); paint(c, '#9aa1ab'); rrect(c, 10, 12, 20, 16, 4); paint(c, '#fff', 2); line(c, 14, 24, 24, 16, '#e8443a', 2); rrect(c, 16, 36, 8, 10, 2); paint(c, OUT, 0);
  } },
  crane: { w: 260, h: 320, snd: 'horn', draw(c) {
    rrect(c, 40, 296, 90, 24, 4); paint(c, '#55606e');
    for (const x of [62, 96]) line(c, x, 300, x, 40, OUT, 7);
    for (let y = 300; y > 50; y -= 34) { line(c, 62, y, 96, y - 34, '#ffd23f', 4); line(c, 62, y, 96, y, '#ffd23f', 4); }
    for (const x of [62, 96]) line(c, x, 300, x, 40, '#ffd23f', 4);
    rrect(c, 0, 30, 256, 16, 3); paint(c, '#ffd23f'); for (let x = 10; x < 250; x += 24) line(c, x, 32, x + 12, 44, OUT, 2);
    rrect(c, 52, 46, 54, 34, 4); paint(c, '#e8443a'); rrect(c, 60, 52, 26, 18, 3); paint(c, '#bfe7ff', 2);
    rrect(c, 4, 14, 30, 18, 3); paint(c, '#55606e'); line(c, 210, 46, 210, 170, OUT, 2.5);
    c.beginPath(); c.arc(210, 180, 10, -0.3, Math.PI * 1.1); c.strokeStyle = OUT; c.lineWidth = 4; c.stroke();
    rrect(c, 180, 190, 60, 26, 3); paint(c, '#c98a45'); line(c, 210, 170, 186, 190, OUT, 2); line(c, 210, 170, 234, 190, OUT, 2);
  } },
  bulldozer: { w: 260, h: 150, snd: 'horn', draw(c) {
    rrect(c, 40, 50, 160, 60, 8); paint(c, '#ffd23f'); rrect(c, 110, 6, 80, 58, 8); paint(c, '#ffd23f'); rrect(c, 122, 16, 56, 34, 4); paint(c, '#bfe7ff', 2.5);
    rrect(c, 60, 30, 10, 24, 3); paint(c, '#555', 2);
    rrect(c, 36, 104, 180, 44, 22); paint(c, '#2e2a36'); for (const x of [62, 104, 146, 188]) { circ(c, x, 126, 12); paint(c, '#9aa1ab', 2); }
    line(c, 200, 90, 230, 92, OUT, 8); line(c, 200, 90, 230, 92, '#ffd23f', 4);
    c.beginPath(); c.moveTo(228, 40); c.quadraticCurveTo(248, 90, 236, 146); c.lineTo(258, 146); c.quadraticCurveTo(262, 90, 246, 40); c.closePath(); paint(c, '#9aa1ab');
  } },
  dumptruck: { w: 300, h: 160, snd: 'honk', draw(c) {
    poly(c, [6, 30, 196, 30, 186, 110, 16, 110]); paint(c, '#ff9f1c'); for (const x of [50, 100, 150]) line(c, x, 36, x - 4, 104, '#d97a0a', 4);
    for (const [x, y, rr] of [[60, 28, 22], [100, 22, 26], [146, 30, 20]]) { circ(c, x, y, rr); paint(c, '#a3784a', 2.5); }
    rrect(c, 200, 40, 92, 82, 10); paint(c, '#ff9f1c'); rrect(c, 222, 52, 56, 34, 5); paint(c, '#bfe7ff', 2.5);
    rrect(c, 10, 108, 284, 16, 4); paint(c, '#55606e');
    for (const x of [56, 120, 250]) wheel(c, x, 132, 26);
  } },
  portapotty: { w: 90, h: 170, snd: 'pop', draw(c) {
    rrect(c, 4, 24, 82, 146, 6); paint(c, '#3a8cf0'); c.beginPath(); c.moveTo(0, 28); c.quadraticCurveTo(45, -4, 90, 28); c.closePath(); paint(c, '#fff');
    rrect(c, 14, 40, 62, 122, 4); paint(c, '#5aa6f5', 2.5); rrect(c, 28, 50, 34, 12, 3); paint(c, '#43c46b', 2); txt(c, 'OPEN', 45, 57, 9, '#fff');
    for (let k = 0; k < 4; k++) line(c, 24, 76 + k * 8, 66, 76 + k * 8, '#2c58b0', 2); circ(c, 66, 110, 4); paint(c, '#fff', 2);
  } },
  pipestack: { w: 200, h: 90, snd: 'chime', draw(c) {
    for (const [x, y] of [[30, 66], [80, 66], [130, 66], [55, 26], [105, 26]]) { rrect(c, x - 26, y - 22, 120 - (x % 50), 44, 22); paint(c, '#9aa1ab'); circ(c, x - 4, y, 20); paint(c, '#d5d9e0', 2.5); circ(c, x - 4, y, 12); paint(c, '#55606e', 2); }
    rrect(c, 150, 70, 46, 20, 3); paint(c, '#c98a45');
  } },
  siteoffice: { w: 280, h: 150, snd: 'bell', draw(c) {
    for (const x of [30, 230]) { rrect(c, x, 120, 24, 30, 2); paint(c, '#c9ced8'); }
    rrect(c, 0, 20, 280, 106, 6); paint(c, '#ffd23f'); for (let x = 14; x < 270; x += 14) line(c, x, 24, x, 122, '#e8b820', 2);
    rrect(c, 20, 44, 70, 44, 3); paint(c, '#bfe7ff', 2.5); rrect(c, 190, 40, 60, 86, 3); paint(c, '#fff3d6'); circ(c, 238, 84, 4); paint(c, OUT, 0);
    rrect(c, 100, 50, 76, 30, 4); paint(c, '#fff', 2.5); txt(c, 'OFFICE', 138, 65, 15, '#e8443a');
    rrect(c, 186, 126, 68, 10, 2); paint(c, '#9aa1ab', 2);
  } },
  steamroller: { w: 240, h: 140, snd: 'horn', draw(c) {
    rrect(c, 60, 40, 130, 56, 8); paint(c, '#ffd23f'); rrect(c, 120, 0, 60, 50, 6); paint(c, '#e8443a'); rrect(c, 130, 10, 40, 24, 4); paint(c, '#bfe7ff', 2);
    rrect(c, 14, 70, 90, 70, 35); paint(c, '#9aa1ab'); line(c, 24, 104, 94, 104, '#c9ced8', 4);
    wheel(c, 184, 110, 30); line(c, 100, 76, 60, 76, OUT, 6);
  } },
  hardhat: { w: 60, h: 40, snd: 'pop', draw(c) {
    c.beginPath(); c.arc(30, 34, 24, Math.PI, 0); c.closePath(); paint(c, '#ffd23f'); rrect(c, 0, 30, 60, 10, 4); paint(c, '#ffd23f'); rrect(c, 26, 10, 8, 22, 3); paint(c, '#ffe066', 2);
  } },
  bricks: { w: 80, h: 50, snd: 'chime', draw(c) {
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3 - (r === 2 ? 1 : 0); q++) { rrect(c, 2 + q * 26 + (r % 2) * 13, 34 - r * 16, 24, 16, 2); paint(c, '#c0603f', 2.5); }
  } },
  ambulance: { w: 300, h: 150, snd: 'siren', draw(c) {
    rrect(c, 4, 10, 210, 118, 8); paint(c, '#fff'); rrect(c, 210, 46, 86, 82, 10); paint(c, '#fff'); rrect(c, 226, 56, 52, 34, 5); paint(c, '#bfe7ff', 2.5);
    c.fillStyle = '#e8443a'; c.fillRect(6, 92, 288, 12); rrect(c, 4, 10, 292, 118, 8); paint(c, null, 0);
    rrect(c, 86, 30, 50, 50, 4); paint(c, '#fff', 2.5); c.fillStyle = '#e8443a'; c.fillRect(103, 36, 16, 38); c.fillRect(92, 47, 38, 16);
    rrect(c, 230, 34, 40, 12, 4); paint(c, '#3a8cf0', 2); rrect(c, 20, 24, 50, 60, 4); paint(c, '#bfe7ff', 2.5);
    wheel(c, 64, 128, 22); wheel(c, 246, 128, 22);
  } },
  policecar: { w: 210, h: 100, snd: 'siren', draw(c) {
    c.beginPath(); c.moveTo(50, 50); c.lineTo(72, 18); c.lineTo(140, 18); c.lineTo(168, 50); c.closePath(); paint(c, '#fff');
    rrect(c, 6, 46, 198, 38, 14); paint(c, '#fff'); c.fillStyle = '#2c3e70'; c.fillRect(8, 64, 194, 18); rrect(c, 6, 46, 198, 38, 14); paint(c, null, 2.5);
    poly(c, [62, 48, 78, 24, 102, 24, 102, 48]); paint(c, '#bfe7ff', 2.5); poly(c, [110, 48, 110, 24, 136, 24, 156, 48]); paint(c, '#bfe7ff', 2.5);
    rrect(c, 84, 4, 18, 14, 4); paint(c, '#e8443a', 2); rrect(c, 104, 4, 18, 14, 4); paint(c, '#3a8cf0', 2);
    star(c, 104, 70, 8, 5); paint(c, '#ffd23f', 1.5); wheel(c, 54, 84, 16); wheel(c, 160, 84, 16);
  } },
  firedog: { w: 120, h: 110, snd: 'bark', draw(c) {
    ell(c, 60, 82, 34, 26); paint(c, '#fff'); rrect(c, 34, 88, 14, 22, 6); paint(c, '#fff', 2.5); rrect(c, 70, 88, 14, 22, 6); paint(c, '#fff', 2.5);
    c.beginPath(); c.moveTo(92, 82); c.quadraticCurveTo(116, 70, 112, 50); c.strokeStyle = OUT; c.lineWidth = 7; c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.stroke();
    circ(c, 46, 40, 24); paint(c, '#fff'); ell(c, 26, 42, 9, 16, 0.3); paint(c, OUT, 0); ell(c, 64, 30, 8, 15, -0.3); paint(c, '#2e2a36', 2);
    for (const [x, y] of [[50, 78], [72, 90], [40, 26], [60, 70]]) { circ(c, x, y, 4.5); c.fillStyle = OUT; c.fill(); }
    circ(c, 52, 38, 3); c.fillStyle = OUT; c.fill(); circ(c, 30, 50, 5); c.fill(); rrect(c, 28, 60, 40, 8, 4); paint(c, '#e8443a', 2);
    c.beginPath(); c.moveTo(22, 20); c.quadraticCurveTo(46, 2, 70, 20); c.lineTo(46, 24); c.closePath(); paint(c, '#e8443a', 2.5);
  } },
  hosereel: { w: 140, h: 120, snd: 'splash', draw(c) {
    for (const x of [20, 116]) poly(c, [x - 12, 120, x + 12, 120, x + 4, 50, x - 4, 50]), paint(c, '#e8443a');
    circ(c, 68, 60, 50); paint(c, '#c0392b'); for (let r = 44; r > 14; r -= 7) { circ(c, 68, 60, r); c.strokeStyle = r % 2 ? '#ffd23f' : '#e8b820'; c.lineWidth = 6; c.stroke(); }
    circ(c, 68, 60, 12); paint(c, '#9aa1ab', 2.5); line(c, 116, 60, 136, 110, '#ffd23f', 6); rrect(c, 128, 104, 12, 16, 3); paint(c, '#9aa1ab', 2);
  } },
  watertower: { w: 160, h: 320, snd: 'splash', draw(c) {
    for (const [a, b] of [[30, 54], [130, 106]]) line(c, a, 320, b, 150, OUT, 7);
    for (let y = 300; y > 160; y -= 46) line(c, 36, y, 124, y - 30, '#8a9099', 4);
    for (const [a, b] of [[30, 54], [130, 106]]) line(c, a, 320, b, 150, '#8a9099', 4);
    rrect(c, 10, 50, 140, 110, 14); paint(c, '#7fc8f0'); for (let x = 30; x < 140; x += 22) line(c, x, 54, x, 156, '#5aa6f5', 3);
    poly(c, [4, 54, 80, 4, 156, 54]); paint(c, '#3a6fd8'); rrect(c, 40, 88, 80, 34, 6); paint(c, '#fff', 2.5); txt(c, 'CITY', 80, 105, 20, '#3a6fd8');
  } },
  extinguisher: { w: 40, h: 70, snd: 'pop', draw(c) {
    rrect(c, 8, 18, 24, 52, 9); paint(c, '#e8443a'); rrect(c, 14, 8, 12, 12, 3); paint(c, '#333', 2); line(c, 26, 12, 38, 26, OUT, 4); rrect(c, 12, 36, 16, 14, 3); paint(c, '#fff', 2);
  } },
  puddle: { w: 86, h: 18, snd: 'chime', draw(c) {
    ell(c, 43, 10, 42, 8); c.fillStyle = 'rgba(140,190,225,.7)'; c.fill(); ell(c, 30, 6, 12, 2); c.fillStyle = 'rgba(255,255,255,.6)'; c.fill();
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
  drawSolidBase(c, s);
  if (s.kind !== 'crate' && s.kind !== 'stone') return;
  // shading: light top edge, darker lower part
  const { x, y, w, h } = s;
  c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(x + 3, y + 2, w - 6, 3);
  const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = g; c.fillRect(x + 1, y + 4, w - 2, h - 5);
}
function drawSolidBase(c, s) {
  const { x, y, w, h, kind } = s;
  if (kind === 'hurdle') { drawHurdle(c, s); return; }
  if (kind === 'cliff') { drawCliff(c, s); return; }
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
// open sewer hole in the ground (v1.11)
function drawSewerHole(c, h, t) {
  const x = h.x, w = h.w, y = GROUND;
  if (h.pit) {
    // slime pit inside the sewer: a gap in the walkway down to bubbling slime
    c.fillStyle = '#151b22'; c.fillRect(x, y - 2, w, 200);
    c.fillStyle = '#4f9a24'; c.fillRect(x + 4, y + 60, w - 8, 140);
    for (let k = 0; k < 3; k++) { const bx = x + 14 + ((k * 37 + t * 20) % (w - 28)), by = y + 60 - Math.abs(Math.sin(t * 3 + k)) * 6; circ(c, bx, by, 5); paint(c, '#9be05a', 2); }
    line(c, x + 4, y + 60, x + w - 4, y + 60, OUT, 3);
    for (const sx of [x - 6, x + w - 6]) { rrect(c, sx, y - 4, 12, 34, 3); paint(c, '#6e7a86', 2.5); }
    return;
  }
  c.fillStyle = '#1d1826'; c.fillRect(x, y - 2, w, 200);
  const g = c.createLinearGradient(0, y, 0, y + 90); g.addColorStop(0, '#3a3348'); g.addColorStop(1, '#14101c');
  c.fillStyle = g; c.fillRect(x + 6, y + 4, w - 12, 196);
  for (let yy = y + 14; yy < y + 120; yy += 22) line(c, x + 10, yy, x + w - 10, yy, 'rgba(255,255,255,.08)', 2);
  c.globalAlpha = 0.7 + Math.sin(t * 3) * 0.2; ell(c, x + w / 2, y + 70, w * 0.32, 6); c.fillStyle = '#7fb52e'; c.fill(); c.globalAlpha = 1;
  rrect(c, x - 6, y - 4, 12, 16, 3); paint(c, '#77738a', 2.5); rrect(c, x + w - 6, y - 4, 12, 16, 3); paint(c, '#77738a', 2.5);
  // manhole cover leaning to the side
  c.save(); c.translate(x + w + 26, y - 4); c.rotate(-0.25); ell(c, 0, 0, 22, 7); paint(c, '#6d7c88', 2.5); line(c, -12, 0, 12, 0, '#4b5560', 2); c.restore();
  // little warning stripes
  for (const sx of [x - 22, x + w + 10]) { rrect(c, sx, y - 26, 12, 26, 2); paint(c, '#ffd23f', 2); line(c, sx + 1, y - 18, sx + 11, y - 24, OUT, 2); line(c, sx + 1, y - 6, sx + 11, y - 12, OUT, 2); }
  if (h.sewer) {
    // sewer entrance (v1.23): striped rim, ladder going down, a big bouncing down arrow
    c.save(); rrect(c, x - 4, y - 6, w + 8, 10, 3); c.clip(); c.fillStyle = '#ffd23f'; c.fillRect(x - 4, y - 6, w + 8, 10); c.fillStyle = OUT; for (let xx = x - 10; xx < x + w + 8; xx += 18) { poly(c, [xx, y + 4, xx + 9, y - 6, xx + 17, y - 6, xx + 8, y + 4]); c.fill(); } c.restore();
    rrect(c, x - 4, y - 6, w + 8, 10, 3); paint(c, null, 2.5);
    for (const lx of [x + 18, x + 42]) line(c, lx, y + 4, lx, y + 120, '#9aa0ab', 3);
    for (let yy = y + 16; yy < y + 120; yy += 18) line(c, x + 18, yy, x + 42, yy, '#9aa0ab', 3);
    const b = Math.abs(Math.sin(t * 4)) * 14, ax = x + w / 2, ay = y - 150 + b;
    c.globalAlpha = 0.25 + 0.15 * Math.sin(t * 4); ell(c, ax, y + 30, w * 0.4, 14); c.fillStyle = '#b2ff6a'; c.fill(); c.globalAlpha = 1;
    poly(c, [ax - 16, ay, ax + 16, ay, ax + 16, ay + 36, ax + 34, ay + 36, ax, ay + 72, ax - 34, ay + 36, ax - 16, ay + 36]); paint(c, '#ffd23f', 4);
  }
}
// sewer pipe with its valve wheel on top (v1.11)
function drawPipe(c, pp, t) {
  const x = pp.x, w = pp.w, top = GROUND - pp.h, open = pp.open;
  rrect(c, x, top, w, pp.h + 4, 10); paint(c, '#7f9a8a');
  for (let yy = top + 30; yy < GROUND - 10; yy += 34) { rrect(c, x - 4, yy, w + 8, 10, 4); paint(c, '#6b8576', 2.5); }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x + 10, top + 6, 10, pp.h - 10);
  // mouth facing left
  rrect(c, x - 16, GROUND - 98, 30, 64, 10); paint(c, '#6b8576');
  ell(c, x - 14, GROUND - 66, 12, 26); paint(c, '#1d1826', 2.5);
  if (open) { ell(c, x - 16, GROUND - 50, 8, 10); c.fillStyle = G && G.L.dirt === 'slime' ? '#7fb52e' : '#7b5431'; c.fill(); }
  // valve stem and wheel
  const [vx, vy] = [x + w / 2, top - 34];
  rrect(c, vx - 6, vy, 12, 36, 3); paint(c, '#9aa0ab', 2.5);
  c.save(); c.translate(vx, vy); c.rotate(pp.ang);
  circ(c, 0, 0, 24); c.lineWidth = 9; c.strokeStyle = OUT; c.stroke(); c.lineWidth = 5; c.strokeStyle = open ? '#e8443a' : '#43c46b'; c.stroke();
  for (let k = 0; k < 3; k++) { const a = k * TAU / 3; line(c, 0, 0, Math.cos(a) * 22, Math.sin(a) * 22, OUT, 5); }
  circ(c, 0, 0, 6); paint(c, open ? '#c0302a' : '#2f9a50', 2);
  c.restore();
  if (open) {
    // progress ring while it is being turned
    const f = 1 - pp.hp / 1.6;
    if (f > 0) { c.beginPath(); c.arc(vx, vy, 33, -Math.PI / 2, -Math.PI / 2 + f * TAU); c.lineWidth = 6; c.strokeStyle = '#bfe9ff'; c.stroke(); }
    const bob = Math.sin(t * 5) * 4; poly(c, [vx - 40, vy - 30 + bob, vx - 30, vy - 18 + bob, vx - 46, vy - 16 + bob]); c.fillStyle = 'rgba(255,255,255,.8)'; c.fill();
  }
}
// spray-lift block: a yellow plate on a water piston (v1.11)
function drawLiftBlock(c, s, t, on) {
  const { x, y, w } = s, plate = 24;
  if (s.h > plate) {
    rrect(c, x + w / 2 - 18, y + plate - 4, 36, s.h - plate + 6, 4); paint(c, '#9aa0ab', 2.5);
    for (let yy = y + plate + 14; yy < GROUND - 6; yy += 26) line(c, x + w / 2 - 14, yy, x + w / 2 + 14, yy, 'rgba(0,0,0,.2)', 2);
    c.fillStyle = 'rgba(120,190,255,.35)'; c.fillRect(x + w / 2 - 6, y + plate, 12, s.h - plate);
  }
  rrect(c, x, y, w, plate, 6); paint(c, '#ffd23f');
  c.save(); rrect(c, x, y, w, plate, 6); c.clip(); c.fillStyle = '#3a8cf0'; c.fillRect(x + 24, y, w - 48, plate); c.restore();
  rrect(c, x, y, w, plate, 6); paint(c, null, 3);
  // arrow shows which way it goes next
  const cx = x + w / 2, cy = y + plate / 2, d = s.tog.up ? 1 : -1, pulse = on ? 1 + Math.sin(t * 8) * 0.15 : 1;
  c.save(); c.translate(cx, cy); c.scale(pulse, pulse * d);
  poly(c, [0, -9, -10, 4, -4, 4, -4, 9, 4, 9, 4, 4, 10, 4]); paint(c, '#fff', 2); c.restore();
  // water drop hint
  ell(c, x + 12, cy + 1, 5, 7); paint(c, '#bfe9ff', 1.5); ell(c, x + w - 12, cy + 1, 5, 7); paint(c, '#bfe9ff', 1.5);
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
  if (p.style === 'mover') {
    const vert = p.my > 0;
    if (vert) { rrect(c, p.x + p.w / 2 - 4, p.y + 14, 8, GROUND - p.y - 14, 2); c.fillStyle = 'rgba(80,90,110,.35)'; c.fill(); }
    rrect(c, p.x, p.y, p.w, 18, 6); paint(c, '#3a8cf0');
    rrect(c, p.x + 6, p.y + 3, p.w - 12, 5, 2); c.fillStyle = 'rgba(255,255,255,.45)'; c.fill();
    const cx = p.x + p.w / 2, cy = p.y + 10; c.fillStyle = '#ffd23f';
    if (vert) { poly(c, [cx - 22, cy + 4, cx - 16, cy - 4, cx - 10, cy + 4]); c.fill(); poly(c, [cx + 10, cy - 4, cx + 16, cy + 4, cx + 22, cy - 4]); c.fill(); }
    else { poly(c, [cx - 30, cy, cx - 20, cy - 6, cx - 20, cy + 6]); c.fill(); poly(c, [cx + 30, cy, cx + 20, cy - 6, cx + 20, cy + 6]); c.fill(); }
    c.globalAlpha = 0.2; ell(c, p.x + p.w / 2, GROUND + 6, p.w / 2, 5); c.fillStyle = '#000'; c.fill(); c.globalAlpha = 1;
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
  if (kind === 'sewer') {
    rrect(c, x, y - 150, 128, 88, 6); paint(c, '#ffd23f'); rrect(c, x + 6, y - 144, 116, 76, 4); paint(c, null, 2.5);
    txt(c, 'SEWER', cx - 14, y - 126, 21, OUT); txt(c, 'ENTRANCE', cx - 14, y - 102, 15, OUT);
    const b = Math.abs(Math.sin(t * 4)) * 5; c.fillStyle = '#e8443a';
    poly(c, [x + 102, y - 136 + b, x + 116, y - 136 + b, x + 116, y - 108 + b, x + 122, y - 108 + b, x + 109, y - 88 + b, x + 96, y - 108 + b, x + 102, y - 108 + b]); paint(c, '#e8443a', 2);
    rrect(c, x + 22, y - 84, 84, 12, 3); paint(c, '#77738a', 2); txt(c, 'v v v', cx, y - 78, 11, '#ffd23f');
    return;
  }
  if (kind === 'closed') {
    rrect(c, x, y - 150, 128, 88, 6); paint(c, '#ff7a1a'); rrect(c, x + 6, y - 144, 116, 76, 4); paint(c, '#fff', 2.5);
    txt(c, 'ROAD', cx, y - 124, 22, '#e8443a'); txt(c, 'CLOSED', cx, y - 98, 22, '#e8443a');
    return;
  }
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
function getBg(theme, v) {
  v = v || 0; const key = theme + v;
  if (BG_CACHE[key]) return BG_CACHE[key];
  const S = 1.25, FW = 1200, MW = 1600, H = 470;
  const far = mkCanvas(FW * S, H * S), mid = mkCanvas(MW * S, H * S);
  const f = far.getContext('2d'), m = mid.getContext('2d'); f.scale(S, S); m.scale(S, S);
  for (const k of [f, m]) { k.lineJoin = 'round'; k.lineCap = 'round'; }
  const r = rng(theme.length * 999 + 7 + v * 131);
  const hills = (k, W, y0, amp, col, n) => { k.beginPath(); k.moveTo(0, H); for (let x = 0; x <= W; x += 20) k.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(x / W * TAU * n))); k.lineTo(W, H); k.closePath(); k.fillStyle = col; k.fill(); };
  const tree = (k, x, s, col) => { rrect(k, x - 6 * s, GROUND - 60 * s, 12 * s, 60 * s, 3); paint(k, '#8a5a2b', 2); for (const [dx, dy, rr] of [[0, -90, 34], [-24, -70, 26], [24, -70, 26]]) { circ(k, x + dx * s, GROUND + dy * s, rr * s); paint(k, col, 2.5); } };
  const house = (k, x, w, h, col, roof) => { rrect(k, x, GROUND - h, w, h, 2); paint(k, col, 2); poly(k, [x - 8, GROUND - h, x + w / 2, GROUND - h - w * 0.45, x + w + 8, GROUND - h]); paint(k, roof, 2); win(k, x + w * 0.2, GROUND - h * 0.7, w * 0.25, h * 0.3); rrect(k, x + w * 0.58, GROUND - h * 0.5, w * 0.22, h * 0.5, 2); paint(k, '#7a4a2b', 2); };
  if (theme === 'street' || theme === 'park') {
    hills(f, FW, 330, 60, '#a6dd8a', 2); hills(f, FW, 380, 40, '#8ccf6c', 3);
    if (theme === 'street') for (let x = 40; x < FW; x += 170 + r() * 60) { f.globalAlpha = 0.85; house(f, x, 60, 50, ['#f6e1a6', '#bfe1f5', '#f7c6c6'][(x | 0) % 3], '#d27a62'); f.globalAlpha = 1; }
    else for (let x = 30; x < FW; x += 80 + r() * 50) { circ(f, x, 360 - r() * 20, 26 + r() * 14); f.fillStyle = '#6fbf55'; f.fill(); }
    for (let x = 60; x < MW; x += 240 + r() * 160) tree(m, x, 0.9 + r() * 0.5, theme === 'park' ? '#4fb548' : '#5cb85c');
    for (let x = 10; x < MW; x += 70 + r() * 80) { ell(m, x, GROUND - 6, 30, 18); paint(m, '#4cae4c', 2); }
    if (theme === 'park' && v === 1) { ell(f, 600, 392, 520, 26); f.fillStyle = '#7fd0f0'; f.fill(); for (const x of [380, 820]) { poly(f, [x, 384, x + 22, 384, x + 11, 350]); f.fillStyle = '#fff'; f.fill(); f.fillStyle = '#a0662f'; f.fillRect(x - 4, 384, 30, 5); } } // the lake far away (v1.32)
    if (theme === 'park' && v === 2) for (let i = 0; i < 5; i++) { f.fillStyle = ['#ff9fc0', '#ffe066', '#c9a0f0', '#ffb08a', '#ff9fc0'][i]; f.fillRect(0, 400 + i * 12, FW, 12); } // flower fields
    if (theme === 'park') for (let x = 0; x < MW; x += 30 + r() * 30) { circ(m, x, GROUND - 4 - r() * 8, 4); m.fillStyle = ['#ff5fa2', '#ffd23f', '#fff'][(x | 0) % 3]; m.fill(); }
  } else if (theme === 'city') {
    for (let x = 0; x < FW; x += 70 + r() * 40) { const h = 150 + r() * 200; f.fillStyle = ['#9db3d8', '#b0c2e2', '#8aa2cc'][(x | 0) % 3]; f.fillRect(x, GROUND - h, 64, h); f.fillStyle = 'rgba(255,255,255,.35)'; for (let y = GROUND - h + 12; y < GROUND - 20; y += 22) for (let xx = x + 8; xx < x + 56; xx += 16) f.fillRect(xx, y, 8, 10); }
    for (let x = 0; x < MW; x += 200 + r() * 80) { const h = 220 + r() * 120, w = 160 + r() * 40; rrect(m, x, GROUND - h, w, h, 2); paint(m, ['#d98b6a', '#c9a27a', '#a77fb8', '#7aa6a0'][(x | 0) % 4], 2.5); for (let y = GROUND - h + 20; y < GROUND - 70; y += 48) for (let xx = x + 16; xx < x + w - 30; xx += 44) win(m, xx, y, 28, 32); }
    if (v === 1) for (const x of [260, 900]) { f.strokeStyle = '#e8b820'; f.lineWidth = 6; f.beginPath(); f.moveTo(x, GROUND); f.lineTo(x, 90); f.moveTo(x - 60, 96); f.lineTo(x + 200, 96); f.stroke(); f.lineWidth = 2; f.beginPath(); f.moveTo(x + 160, 96); f.lineTo(x + 160, 180); f.stroke(); } // cranes over the building site (v1.32)
    if (v === 2) for (let x = 120; x < MW; x += 520) { rrect(m, x, GROUND - 200, 150, 200, 2); paint(m, '#b5503a', 2.5); for (let y = GROUND - 180; y < GROUND - 30; y += 40) for (let xx = x + 16; xx < x + 140; xx += 44) { rrect(m, xx, y, 26, 24, 2); paint(m, '#ffe680', 2); } } // brick buildings around the fire station
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
  return (BG_CACHE[key] = { far, mid, FW, MW, S, H, info: themeInfo(theme) });
}
// v = which of the 3 levels in the area: 0 morning, 1 afternoon, 2 sunset (boss level)
// world (v1.33): the level's own chapters (world.js) instead of the area's repeating background strips
function drawBackdrop(c, theme, camX, W, t, v, world) {
  v = v || 0; const info = themeInfo(theme), swamp = theme === 'swamp';
  const sky = v === 0 ? info.sky : v === 1 ? (swamp ? ['#2a3a5a', '#6a8a7a'] : [info.sky[0], '#ffe6b0']) : (swamp ? ['#2a1a40', '#9a5a7a'] : ['#ff8f7a', '#ffd38a']);
  const g = c.createLinearGradient(0, 0, 0, 470); g.addColorStop(0, sky[0]); g.addColorStop(1, sky[1]);
  c.fillStyle = g; c.fillRect(0, 0, W, 540);
  if (!swamp) { const sy = [80, 110, 170][v], sc = ['#ffe466', '#ffd040', '#ff8a3c'][v]; circ(c, W - 120, sy, v === 2 ? 50 : 40); c.fillStyle = sc; c.fill(); c.globalAlpha = 0.25; circ(c, W - 120, sy, 60); c.fill(); c.globalAlpha = 1; }
  c.fillStyle = swamp ? 'rgba(160,190,140,.35)' : v === 2 ? 'rgba(255,200,210,.85)' : 'rgba(255,255,255,.9)';
  for (let i = 0; i < 5; i++) { const x = ((i * 330 - camX * 0.05 + t * 8) % (W + 300) + W + 300) % (W + 300) - 150, y = 60 + (i * 47) % 120; ell(c, x, y, 50, 18); c.fill(); ell(c, x + 30, y - 10, 32, 18); c.fill(); }
  if (world) { drawWorldLayers(c, world, camX, W); return; }
  const bg = getBg(theme, v), tile = (img, w, par) => { const off = -((camX * par) % w + w) % w; for (let x = off; x < W; x += w) c.drawImage(img, x, 0, w, bg.H); };
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
  drawGroundDetail(c, theme, x0, W);
}
// ---------------------------------------------------------------- scenery polish (v1.18): ground details, props, ambient life
const hsh = n => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
const PAVED = { street: 1, city: 1, school: 1, airport: 1, station: 1 }, GRASSY = { park: 1, farm: 1, swamp: 1 };
function drawGroundDetail(c, theme, x0, W) {
  const inf = themeInfo(theme), step = 46;
  for (let k = Math.floor(x0 / step) - 1; k * step < x0 + W + step; k++) {
    const x = k * step, a = hsh(k), b = hsh(k + 0.37), d = hsh(k + 0.71);
    // pebbles in the soil
    if (a < 0.6) { ell(c, x + b * 30, GROUND + 34 + d * 70, 4 + a * 6, 2.5 + d * 2); c.fillStyle = 'rgba(0,0,0,.13)'; c.fill(); ell(c, x + b * 30 - 1, GROUND + 33 + d * 70, 2 + a * 3, 1.2); c.fillStyle = 'rgba(255,255,255,.14)'; c.fill(); }
    if (GRASSY[theme]) {
      if (b < 0.6) for (let j = -1; j <= 1; j++) line(c, x + d * 20 + j * 4, GROUND + 1, x + d * 20 + j * 6, GROUND - 6 - Math.abs(j - 0.5) * 3 - a * 4, theme === 'swamp' ? '#3c5a20' : '#4e9a30', 2.5);
      if (d < 0.16 && theme !== 'swamp') { line(c, x + a * 30, GROUND, x + a * 30, GROUND - 14, '#3f8a2a', 2); const fc = ['#ff6fa8', '#ffd23f', '#fff', '#b98cff'][Math.floor(b * 4)]; for (let q = 0; q < 5; q++) { circ(c, x + a * 30 + Math.cos(q * 1.26) * 4, GROUND - 14 + Math.sin(q * 1.26) * 4, 3); c.fillStyle = fc; c.fill(); } circ(c, x + a * 30, GROUND - 14, 2.2); c.fillStyle = '#f0a020'; c.fill(); }
      if (d < 0.12 && theme === 'swamp') { const mx = x + a * 30; rrect(c, mx - 2, GROUND - 9, 4, 9, 1); c.fillStyle = '#e8e0c8'; c.fill(); ell(c, mx, GROUND - 9, 7, 4); c.fillStyle = '#b8f070'; c.fill(); c.globalAlpha = 0.25; circ(c, mx, GROUND - 9, 12); c.fill(); c.globalAlpha = 1; }
    } else if (PAVED[theme]) {
      if (b < 0.18) { c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + a * 30, GROUND + 3); c.lineTo(x + a * 30 + 5, GROUND + 9); c.lineTo(x + a * 30 + 1, GROUND + 15); c.stroke(); }
      if (d < 0.1) for (let j = -1; j <= 1; j++) line(c, x + a * 30 + j * 3, GROUND + 1, x + a * 30 + j * 5, GROUND - 5 - (j === 0 ? 3 : 0), '#5aa83c', 2);
      if (a > 0.93) { ell(c, x + b * 20, GROUND + 8, 7, 2.5); c.fillStyle = 'rgba(255,255,255,.25)'; c.fill(); }
    } else if (theme === 'beach') {
      if (b < 0.14) { const sx = x + a * 30; c.beginPath(); c.moveTo(sx, GROUND + 6); c.arc(sx, GROUND + 6, 6, Math.PI, 0); c.closePath(); c.fillStyle = '#ffd0c8'; c.fill(); for (let q = -2; q <= 2; q++) line(c, sx, GROUND + 6, sx + q * 2.4, GROUND + 1, '#e89a8a', 1); }
      if (b > 0.93) { const sx = x + a * 30, sy = GROUND + 8; c.beginPath(); for (let q = 0; q < 10; q++) { const rr = q % 2 ? 2.5 : 6.5, an = q * Math.PI / 5 - Math.PI / 2; c.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); } c.closePath(); c.fillStyle = '#ff9a4a'; c.fill(); }
      if (d < 0.3) { circ(c, x + b * 40, GROUND + 4 + a * 10, 1.4); c.fillStyle = 'rgba(160,120,60,.35)'; c.fill(); }
    } else if (theme === 'carnival') {
      if (b < 0.55) { c.save(); c.translate(x + a * 40, GROUND + 4 + d * 11); c.rotate(a * 6); c.fillStyle = ['#ff6fa8', '#4fc3f7', '#ffd23f', '#7ed957'][Math.floor(d * 4)]; c.fillRect(-3, -1.5, 6, 3); c.restore(); }
      if (d > 0.9) { circ(c, x + b * 30, GROUND - 3, 3.5); c.fillStyle = '#fff6d8'; c.fill(); circ(c, x + b * 30 + 4, GROUND - 2, 3); c.fill(); }
    }
    void inf;
  }
}
// background props: decoration only, no collisions
const PROPS = { street: ['lamp', 'bush', 'bench', 'mailbox'], park: ['bush', 'bench', 'flowers', 'lamp'], city: ['lamp', 'bench', 'planter'], beach: ['umbrella', 'sandcastle', 'dunegrass'],
  farm: ['fence', 'sunflower', 'bush'], school: ['fence', 'bush', 'bench'], airport: ['cone', 'lamp', 'cone'], carnival: ['balloons', 'lamp', 'flowers'], station: ['lamp', 'bench', 'planter'], swamp: ['deadtree', 'mushrooms', 'lantern'] };
function drawProp(c, kind, x, t, seed) {
  const y = GROUND;
  if (kind === 'lamp') { rrect(c, x - 4, y - 150, 8, 150, 2); paint(c, '#55606e', 2.5); rrect(c, x - 14, y - 6, 28, 6, 2); paint(c, '#55606e', 2); c.beginPath(); c.moveTo(x, y - 150); c.quadraticCurveTo(x + 4, y - 168, x + 22, y - 164); c.strokeStyle = OUT; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#55606e'; c.lineWidth = 3; c.stroke(); poly(c, [x + 12, y - 162, x + 32, y - 162, x + 28, y - 150, x + 16, y - 150]); paint(c, '#fff3b0', 2.5); }
  else if (kind === 'bush' || kind === 'planter') {
    if (kind === 'planter') { rrect(c, x - 30, y - 30, 60, 30, 4); paint(c, '#a0662f', 2.5); }
    const by = kind === 'planter' ? y - 28 : y, col = seed < 0.5 ? '#5fb33f' : '#4e9a30';
    c.beginPath(); c.arc(x - 18, by - 14, 16, Math.PI * 0.8, Math.PI * 1.9); c.arc(x, by - 26, 18, Math.PI * 1.1, Math.PI * 1.95); c.arc(x + 18, by - 14, 16, Math.PI * 1.2, Math.PI * 2.2); c.lineTo(x - 30, by); c.closePath(); paint(c, col, 2.5);
    circ(c, x - 6, by - 28, 4); c.fillStyle = 'rgba(255,255,255,.3)'; c.fill(); if (seed > 0.6) for (let q = 0; q < 3; q++) { circ(c, x - 14 + q * 13, by - 14 - (q % 2) * 10, 3); paint(c, '#e8443a', 1.5); }
  }
  else if (kind === 'bench') { rrect(c, x - 34, y - 40, 68, 8, 3); paint(c, '#c98a45', 2.5); rrect(c, x - 34, y - 58, 68, 8, 3); paint(c, '#c98a45', 2.5); for (const dx of [-28, 24]) { rrect(c, x + dx, y - 34, 5, 34, 1); paint(c, '#55606e', 2); } }
  else if (kind === 'mailbox') { rrect(c, x - 3, y - 50, 6, 50, 1); paint(c, '#8a5a2b', 2); rrect(c, x - 16, y - 72, 32, 24, 10); paint(c, '#3a8cf0', 2.5); rrect(c, x + 12, y - 74, 4, 14, 1); paint(c, '#e8443a', 1.5); }
  else if (kind === 'flowers') { for (let q = 0; q < 5; q++) { const fx = x - 24 + q * 12, fy = y - 18 - (q % 2) * 8; line(c, fx, y, fx, fy, '#3f8a2a', 2.5); circ(c, fx, fy, 6); paint(c, ['#ff6fa8', '#ffd23f', '#b98cff', '#fff', '#ff9a4a'][(q + Math.floor(seed * 5)) % 5], 2); circ(c, fx, fy, 2); c.fillStyle = '#f0a020'; c.fill(); } }
  else if (kind === 'fence') { for (let q = 0; q < 4; q++) { poly(c, [x - 40 + q * 26, y, x - 40 + q * 26, y - 44, x - 33 + q * 26, y - 52, x - 26 + q * 26, y - 44, x - 26 + q * 26, y]); paint(c, '#f3ead8', 2); } rrect(c, x - 44, y - 36, 92, 6, 2); paint(c, '#e0d4bc', 2); rrect(c, x - 44, y - 16, 92, 6, 2); paint(c, '#e0d4bc', 2); }
  else if (kind === 'sunflower') { line(c, x, y, x + 2, y - 90, '#3f8a2a', 4); ell(c, x - 10, y - 50, 9, 4, -0.5); c.fillStyle = '#4e9a30'; c.fill(); for (let q = 0; q < 10; q++) { const an = q * 0.628 + t * 0.2; ell(c, x + 2 + Math.cos(an) * 14, y - 94 + Math.sin(an) * 14, 8, 4, an); paint(c, '#ffd23f', 1.5); } circ(c, x + 2, y - 94, 9); paint(c, '#8a5a2b', 2); }
  else if (kind === 'umbrella') { line(c, x, y, x + 6, y - 110, '#eee', 4); c.beginPath(); c.moveTo(x - 48, y - 96); c.quadraticCurveTo(x + 6, y - 150, x + 60, y - 108); c.closePath(); paint(c, seed < 0.5 ? '#ff6fa8' : '#4fc3f7', 2.5); for (const q of [-0.3, 0.3]) line(c, x + 6, y - 125, x + 6 + q * 90, y - 102, 'rgba(255,255,255,.7)', 3); }
  else if (kind === 'sandcastle') { rrect(c, x - 30, y - 30, 60, 30, 3); paint(c, '#f0cc80', 2.5); rrect(c, x - 14, y - 54, 28, 26, 3); paint(c, '#f0cc80', 2.5); for (let q = 0; q < 3; q++) { rrect(c, x - 30 + q * 24, y - 38, 12, 9, 1); paint(c, '#f0cc80', 2); } line(c, x, y - 54, x, y - 72, OUT, 2); poly(c, [x, y - 72, x + 14, y - 67, x, y - 62]); paint(c, '#e8443a', 1.5); }
  else if (kind === 'dunegrass') { for (let q = -3; q <= 3; q++) { c.beginPath(); c.moveTo(x + q * 5, y); c.quadraticCurveTo(x + q * 9, y - 30, x + q * 14 + Math.sin(t * 1.5 + q) * 3, y - 44 - Math.abs(q) * -2); c.strokeStyle = '#9ab84a'; c.lineWidth = 3; c.stroke(); } }
  else if (kind === 'cone') { poly(c, [x - 14, y - 4, x - 4, y - 44, x + 4, y - 44, x + 14, y - 4]); paint(c, '#ff8a2a', 2.5); rrect(c, x - 9, y - 30, 18, 7, 1); c.fillStyle = '#fff'; c.fill(); rrect(c, x - 18, y - 6, 36, 6, 2); paint(c, '#ff8a2a', 2); }
  else if (kind === 'balloons') { for (let q = 0; q < 3; q++) { const bx = x - 14 + q * 14 + Math.sin(t * 1.6 + q) * 3, byy = y - 110 - (q % 2) * 18; c.beginPath(); c.moveTo(x, y - 30); c.quadraticCurveTo(bx - 4, byy + 40, bx, byy + 16); c.strokeStyle = '#888'; c.lineWidth = 1.5; c.stroke(); ell(c, bx, byy, 13, 16); paint(c, ['#ff6fa8', '#4fc3f7', '#ffd23f'][q], 2); circ(c, bx - 4, byy - 5, 3); c.fillStyle = 'rgba(255,255,255,.5)'; c.fill(); } rrect(c, x - 10, y - 30, 20, 30, 3); paint(c, '#c98a45', 2); }
  else if (kind === 'deadtree') { c.lineCap = 'round'; for (const [x1, y1, x2, y2, w] of [[0, 0, 4, -110, 12], [3, -70, -26, -100, 6], [4, -90, 30, -124, 6], [-14, -86, -30, -84, 4]]) { line(c, x + x1, y + y1, x + x2, y + y2, OUT, w + 4); line(c, x + x1, y + y1, x + x2, y + y2, '#5a4a5e', w); } }
  else if (kind === 'mushrooms') { for (let q = 0; q < 3; q++) { const mx = x - 16 + q * 16, h = 14 + (q % 2) * 10; rrect(c, mx - 3, y - h, 6, h, 2); paint(c, '#e8e0c8', 1.5); ell(c, mx, y - h, 10, 6); paint(c, q === 1 ? '#c070f0' : '#b8f070', 2); } c.globalAlpha = 0.15 + Math.sin(t * 2 + seed * 6) * 0.08; circ(c, x, y - 18, 30); c.fillStyle = '#b8f070'; c.fill(); c.globalAlpha = 1; }
  else if (kind === 'lantern') { rrect(c, x - 3, y - 110, 6, 110, 2); paint(c, '#3a3040', 2); line(c, x, y - 106, x + 18, y - 106, OUT, 3); rrect(c, x + 10, y - 104, 16, 20, 4); paint(c, '#7a6a3a', 2); c.globalAlpha = 0.5 + Math.sin(t * 3 + seed * 9) * 0.2; circ(c, x + 18, y - 94, 14); c.fillStyle = '#ffe680'; c.fill(); c.globalAlpha = 1; circ(c, x + 18, y - 94, 5); c.fillStyle = '#fff6b0'; c.fill(); }
}
// small moving life in front of the backdrop
function drawAmbient(c, theme, cx, W, t) {
  const span = W + 300;
  if (theme === 'park' || theme === 'farm' || theme === 'school' || theme === 'street') {
    for (let i = 0; i < 3; i++) {
      const bx = cx - 150 + ((i * 397 + t * (24 + i * 7)) % span), by = 230 + i * 45 + Math.sin(t * 1.3 + i * 2) * 30, fl = Math.abs(Math.sin(t * 14 + i));
      const col = ['#ffd23f', '#ff9fd0', '#9fd8ff'][i];
      for (const s of [-1, 1]) { ell(c, bx + s * 6 * fl, by - 3, 6 * fl + 1, 5, s * 0.4); c.fillStyle = col; c.fill(); ell(c, bx + s * 4 * fl, by + 4, 4 * fl + 1, 3.5, s * 0.4); c.fill(); }
      line(c, bx, by - 5, bx, by + 6, OUT, 2);
    }
    if (theme !== 'street') for (let i = 0; i < 4; i++) {
      const lx = cx - 150 + ((i * 311 + t * 18) % span) + Math.sin(t * 1.7 + i) * 26, ly = ((i * 157 + t * 34) % 520) - 20;
      c.save(); c.translate(lx, ly); c.rotate(Math.sin(t * 2 + i) * 0.8); ell(c, 0, 0, 6, 3); c.fillStyle = theme === 'farm' ? '#e0a040' : '#6cc04a'; c.fill(); line(c, -6, 0, 6, 0, 'rgba(0,0,0,.25)', 1); c.restore();
    }
  } else if (theme === 'beach') {
    for (let i = 0; i < 3; i++) { const gx = cx - 150 + ((i * 433 + t * (40 + i * 9)) % span), gy = 90 + i * 30 + Math.sin(t + i) * 10, f = Math.sin(t * 6 + i) * 6; c.beginPath(); c.moveTo(gx - 14, gy + f); c.quadraticCurveTo(gx - 7, gy - 6, gx, gy); c.quadraticCurveTo(gx + 7, gy - 6, gx + 14, gy + f); c.strokeStyle = '#fff'; c.lineWidth = 3.5; c.stroke(); }
  } else if (theme === 'swamp') {
    for (let i = 0; i < 12; i++) { const fx = cx - 100 + ((i * 211 + Math.sin(t * 0.7 + i) * 60) % (W + 200)), fy = 250 + ((i * 89) % 190) + Math.sin(t * 1.9 + i * 3) * 18; c.globalAlpha = 0.4 + 0.4 * Math.abs(Math.sin(t * 2.3 + i)); circ(c, fx, fy, 6); c.fillStyle = 'rgba(220,255,120,.35)'; c.fill(); circ(c, fx, fy, 2.2); c.fillStyle = '#f4ff9a'; c.fill(); }
    c.globalAlpha = 1;
  } else if (theme === 'carnival') {
    for (let i = 0; i < 14; i++) { const fx = cx - 150 + ((i * 173 + Math.sin(t + i) * 30) % span), fy = ((i * 97 + t * (30 + i % 4 * 8)) % 500) - 10; c.save(); c.translate(fx, fy); c.rotate(t * 3 + i); c.fillStyle = ['#ff6fa8', '#4fc3f7', '#ffd23f', '#7ed957'][i % 4]; c.fillRect(-4, -2, 8, 4); c.restore(); }
  }
}
// construction barrier hurdle: striped board on two A-frame legs, blinking light on top
function drawHurdle(c, s) {
  const { x, y, w, h } = s, t = (typeof G !== 'undefined' && G) ? G.t : 0;
  for (const lx of [x + 10, x + w - 10]) { line(c, lx - 8, GROUND, lx, y + 10, OUT, 7); line(c, lx - 8, GROUND, lx, y + 10, '#e0e4ea', 4); line(c, lx + 8, GROUND, lx, y + 10, OUT, 7); line(c, lx + 8, GROUND, lx, y + 10, '#e0e4ea', 4); }
  for (const by of [y + 4, y + h * 0.55]) {
    const bh = by === y + 4 ? 18 : 12;
    rrect(c, x - 4, by, w + 8, bh, 3); c.fillStyle = '#fff'; c.fill();
    c.save(); rrect(c, x - 4, by, w + 8, bh, 3); c.clip(); c.fillStyle = '#ff7a1a';
    for (let q = x - 30; q < x + w + 20; q += 20) { poly(c, [q, by + bh, q + 10, by + bh, q + 10 + bh, by, q + bh, by]); c.fill(); }
    c.restore(); rrect(c, x - 4, by, w + 8, bh, 3); paint(c, null, 2.5);
  }
  const on = Math.floor(t * 2.5 + x * 0.01) % 2 === 0;
  rrect(c, x + w / 2 - 5, y - 6, 10, 10, 3); paint(c, '#3a3a3a', 2);
  circ(c, x + w / 2, y - 10, 6); paint(c, on ? '#ffd23f' : '#b58a1a', 2);
  if (on) { c.globalAlpha = 0.35; circ(c, x + w / 2, y - 10, 13); c.fillStyle = '#fff27a'; c.fill(); c.globalAlpha = 1; }
}
// slime tower: shoots slime blobs straight ahead; stomping its top plugs it (v1.18)
function drawTower(c, s, t) {
  const tw = s.tower, x = s.x, y = s.y, w = s.w, h = s.h, off = tw.off;
  rrect(c, x + 6, y + 26, w - 12, h - 26, 4); paint(c, off ? '#7f8a96' : '#4a5a3a');
  for (let yy = y + 44; yy < GROUND - 8; yy += 22) line(c, x + 9, yy, x + w - 9, yy, 'rgba(0,0,0,.18)', 2);
  c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(x + 12, y + 30, 6, h - 34);
  // barrel at kid height, both sides
  const by = GROUND - 55, pulse = !off && tw.charge > 0 ? 1 + tw.charge * 0.35 : 1;
  for (const d of [-1, 1]) { rrect(c, d < 0 ? x - 10 : x + w - 4, by - 13 * pulse, 14, 26 * pulse, 6); paint(c, off ? '#6d7c88' : '#3a4a2c', 2.5); ell(c, d < 0 ? x - 10 : x + w + 10, by, 4, 10 * pulse); c.fillStyle = off ? '#444' : '#9fe03a'; c.fill(); }
  // cap
  rrect(c, x, y, w, 28, 8); paint(c, off ? '#9aa0ab' : '#5f7a3a');
  if (!off) {
    for (let q = 0; q < 3; q++) { const dx = x + 14 + q * (w - 28) / 2, dl = 6 + Math.sin(t * 3 + q * 2) * 4; ell(c, dx, y + 28 + dl / 2, 4, dl / 2 + 3); c.fillStyle = '#9fe03a'; c.fill(); }
    const ex = x + w / 2; ell(c, ex - 12, y + 12, 6, 7); paint(c, '#fff', 2); ell(c, ex + 12, y + 12, 6, 7); paint(c, '#fff', 2);
    circ(c, ex - 11, y + 14, 3); c.fillStyle = OUT; c.fill(); circ(c, ex + 13, y + 14, 3); c.fill();
    line(c, ex - 20, y + 2, ex - 6, y + 7, OUT, 3); line(c, ex + 20, y + 2, ex + 6, y + 7, OUT, 3);
  } else {
    rrect(c, x + w / 2 - 16, y - 10, 32, 14, 5); paint(c, '#c98a45', 2.5);
    const ex = x + w / 2; c.beginPath(); c.arc(ex - 11, y + 14, 5, Math.PI, 0); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke(); c.beginPath(); c.arc(ex + 11, y + 14, 5, Math.PI, 0); c.stroke();
  }
}
function drawSlimeShot(c, b, t) {
  const d = Math.sign(b.vx) || 1, r = b.r * (0.6 + 0.4 * Math.max(0, b.hp / b.hp0));
  c.save(); c.translate(b.x, b.y); c.scale(d, 1);
  for (let q = 1; q <= 3; q++) { circ(c, -r - q * 7, Math.sin(t * 20 + q) * 2, r * (0.5 - q * 0.1)); c.fillStyle = 'rgba(127,181,46,.6)'; c.fill(); }
  c.beginPath(); c.moveTo(r * 1.3, 0); c.quadraticCurveTo(r * 0.8, -r, -r * 0.6, -r * 0.9); c.quadraticCurveTo(-r * 1.3, 0, -r * 0.6, r * 0.9); c.quadraticCurveTo(r * 0.8, r, r * 1.3, 0); paint(c, '#7fb52e', 2.5);
  circ(c, r * 0.3, -r * 0.25, r * 0.28); paint(c, '#fff', 1.5); circ(c, r * 0.4, -r * 0.22, r * 0.12); c.fillStyle = OUT; c.fill();
  c.restore();
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

// ---------------------------------------------------------------- sewer underground (v1.23)
function drawSewerBack(c, camX, W, t) {
  c.fillStyle = '#26303a'; c.fillRect(0, 0, W, 600);
  // far brick wall (slow parallax)
  const off = -((camX * 0.4) % 80 + 80) % 80;
  c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 2;
  for (let y = 60, row = 0; y < 470; y += 34, row++) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); for (let x = off + (row % 2) * 40; x < W + 80; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 34); c.stroke(); } }
  // arches with dark tunnels
  const aoff = -((camX * 0.4) % 420 + 420) % 420;
  for (let x = aoff; x < W + 420; x += 420) {
    c.fillStyle = '#151b22'; c.beginPath(); c.moveTo(x + 60, 470); c.lineTo(x + 60, 300); c.arc(x + 170, 300, 110, Math.PI, 0); c.lineTo(x + 280, 470); c.fill();
    c.strokeStyle = '#3a4652'; c.lineWidth = 10; c.beginPath(); c.moveTo(x + 60, 470); c.lineTo(x + 60, 300); c.arc(x + 170, 300, 110, Math.PI, 0); c.lineTo(x + 280, 470); c.stroke();
    // dripping pipe
    rrect(c, x + 320, 70, 26, 150, 6); paint(c, '#5d6b78', 3); rrect(c, x + 314, 214, 38, 14, 4); paint(c, '#4b5763', 3);
    const dy = ((t * 160 + x) % 240); c.globalAlpha = 1 - dy / 240; ell(c, x + 333, 232 + dy, 4, 6); c.fillStyle = '#9be05a'; c.fill(); c.globalAlpha = 1;
  }
  // ceiling with grates letting light in
  c.fillStyle = '#1b2229'; c.fillRect(0, 0, W, 64); c.fillStyle = '#3a4652'; c.fillRect(0, 60, W, 8);
  const goff = -((camX * 0.4) % 600 + 600) % 600;
  for (let x = goff; x < W + 600; x += 600) {
    c.globalAlpha = 0.12 + 0.04 * Math.sin(t * 2 + x); c.fillStyle = '#fff6c0'; poly(c, [x + 120, 64, x + 200, 64, x + 260, 470, x + 70, 470]); c.fill(); c.globalAlpha = 1;
    rrect(c, x + 112, 52, 96, 14, 3); paint(c, '#77738a', 2); for (let k = 0; k < 6; k++) line(c, x + 124 + k * 15, 54, x + 124 + k * 15, 64, OUT, 2);
  }
}
function drawSewerFloor(c, x0, W) {
  // stone walkway and a slime channel in front
  c.fillStyle = '#56616c'; c.fillRect(x0 - 60, GROUND, W + 120, 30);
  c.fillStyle = '#6e7a86'; c.fillRect(x0 - 60, GROUND, W + 120, 6);
  for (let x = Math.floor((x0 - 60) / 60) * 60; x < x0 + W + 60; x += 60) line(c, x, GROUND + 6, x, GROUND + 30, 'rgba(0,0,0,.25)', 2);
  c.fillStyle = '#3f7a1e'; c.fillRect(x0 - 60, GROUND + 30, W + 120, 120);
  const t = performance.now() / 1000; c.fillStyle = '#6fb52e';
  for (let x = Math.floor((x0 - 60) / 90) * 90; x < x0 + W + 90; x += 90) { ell(c, x + ((t * 20) % 90), GROUND + 44 + (x % 180 ? 6 : 0), 22, 4); c.fill(); }
  line(c, x0 - 60, GROUND + 30, x0 + W + 60, GROUND + 30, OUT, 3); line(c, x0 - 60, GROUND, x0 + W + 60, GROUND, OUT, 3);
}
function drawWorm(c, e, t) {
  // slime worm: 5 bumpy segments, rears up before spitting; faces e.dir
  const dir = e.dir || 1, rear = e.rear > 0 ? Math.sin((0.5 - e.rear) / 0.5 * Math.PI) : 0;
  c.save(); c.translate(e.x, e.y); c.scale(dir, 1);
  if (e.flash > 0) c.globalAlpha = 0.75;
  for (let k = 4; k >= 0; k--) {
    const bx = -k * 15, hump = Math.max(0, Math.sin(e.t * 5 - k * 0.9)) * 8, by = -12 - hump - (k === 0 ? rear * 30 : k === 1 ? rear * 14 : 0);
    circ(c, bx, by, k === 0 ? 15 : 13 - k); paint(c, k % 2 ? '#7cc23a' : '#8fd448', 3);
    if (k > 0) { c.globalAlpha = 0.5; circ(c, bx - 3, by - 5, 3); c.fillStyle = '#d8ff9a'; c.fill(); c.globalAlpha = e.flash > 0 ? 0.75 : 1; }
  }
  const hy = -12 - Math.max(0, Math.sin(e.t * 5)) * 8 - rear * 30;
  ell(c, 4, hy - 4, 5, 6); paint(c, '#fff', 2); circ(c, 6, hy - 3, 2.4); paint(c, OUT, 0);
  line(c, -2, hy - 16, -6, hy - 26, OUT, 2.5); circ(c, -6, hy - 27, 3); paint(c, '#ffd23f', 2);
  c.beginPath(); c.arc(9, hy + 5, rear > 0.3 ? 5 : 3, 0, Math.PI); paint(c, '#3c6416', 2);
  c.restore();
}
function heartPath(c, x, y, s) {
  c.beginPath(); c.moveTo(x, y + s * 0.9);
  c.bezierCurveTo(x - s * 1.4, y + s * 0.1, x - s * 0.9, y - s * 1.1, x, y - s * 0.35);
  c.bezierCurveTo(x + s * 0.9, y - s * 1.1, x + s * 1.4, y + s * 0.1, x, y + s * 0.9); c.closePath();
}
function drawSkyHeart(c, x, y, t, land) {
  const pul = 1 + Math.sin(t * 6) * 0.08;
  if (!land) {
    // little parachute
    c.beginPath(); c.arc(x, y - 50, 30, Math.PI, 0); c.closePath(); paint(c, '#fff', 3);
    for (const k of [-1, 0, 1]) { c.beginPath(); c.arc(x + k * 20, y - 50, 10, Math.PI, 0); c.fillStyle = k ? '#ff9fc0' : '#bfe9ff'; c.fill(); }
    for (const k of [-28, 0, 28]) line(c, x + k, y - 50, x, y - 12, OUT, 1.5);
  } else { ell(c, x, y + 22, 18, 4); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill(); }
  c.globalAlpha = 0.3 + Math.sin(t * 6) * 0.15; circ(c, x, y, 30 * pul); c.fillStyle = '#ffd0dc'; c.fill(); c.globalAlpha = 1;
  heartPath(c, x, y, 20 * pul); paint(c, '#ef3a4c', 3);
  c.globalAlpha = 0.7; ell(c, x - 8, y - 6, 4, 6); c.fillStyle = '#fff'; c.fill(); c.globalAlpha = 1;
}
function drawExitLight(c, p, t) {
  // light from the manhole above the exit lift, and a bobbing UP arrow
  c.globalAlpha = 0.18 + 0.05 * Math.sin(t * 3); c.fillStyle = '#fff6c0'; poly(c, [p.x + 10, 40, p.x + p.w - 10, 40, p.x + p.w + 20, GROUND, p.x - 20, GROUND]); c.fill(); c.globalAlpha = 1;
  if (p.y > p.y1 + 4) { const ax = p.x + p.w / 2, ay = p.y - 120 + Math.sin(t * 4) * 8; poly(c, [ax, ay, ax + 30, ay + 34, ax + 13, ay + 34, ax + 13, ay + 64, ax - 13, ay + 64, ax - 13, ay + 34, ax - 30, ay + 34]); paint(c, '#43c46b', 4); txt(c, 'UP', ax, ay + 50, 15, '#fff'); }
}

function drawCrack(c, j, t) {
  const x = j.x, y = GROUND, warn = j.st === 1;
  c.strokeStyle = OUT; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 26, y + 2); c.lineTo(x - 12, y + 8); c.lineTo(x - 4, y + 1); c.lineTo(x + 6, y + 9); c.lineTo(x + 14, y + 2); c.lineTo(x + 26, y + 6); c.stroke();
  c.globalAlpha = warn ? 0.6 + 0.4 * Math.sin(t * 30) : 0.35; ell(c, x, y + 4, 18, 4); c.fillStyle = '#9be05a'; c.fill(); c.globalAlpha = 1;
  if (warn) { const sh = Math.sin(t * 50) * 2; for (const k of [-10, 4, 14]) { circ(c, x + k + sh, y - 4 - Math.abs(Math.sin(t * 9 + k)) * 6, 4); paint(c, '#9be05a', 2); } }
}
function drawJet(c, j, t) {
  // a column of slime: rises fast, wobbles, sinks at the end
  const x = j.x, life = 1 - j.t, h = 190 * Math.min(1, life * 6) * Math.min(1, j.t * 4 + 0.15), top = GROUND - h, wob = Math.sin(t * 25) * 3;
  c.beginPath(); c.moveTo(x - 16, GROUND); c.quadraticCurveTo(x - 10 + wob, GROUND - h * 0.5, x - 12, top + 10); c.lineTo(x + 12, top + 10); c.quadraticCurveTo(x + 10 - wob, GROUND - h * 0.5, x + 16, GROUND); c.closePath(); paint(c, '#7fc23a', 3);
  circ(c, x, top + 8, 20 + Math.sin(t * 20) * 2); paint(c, '#8fd448', 3);
  c.globalAlpha = 0.6; ell(c, x - 6, top + 2, 6, 4); c.fillStyle = '#e0ffb0'; c.fill(); line(c, x - 4, GROUND - 10, x - 4, top + 30, 'rgba(224,255,176,.6)', 3); c.globalAlpha = 1;
}

// ---------------------------------------------------------------- v1.30 gadgets
// conveyor belt flush with the ground, chevrons rolling left (backwards)
function drawBelt(c, b) {
  const { x, w } = b, y = GROUND - 4;
  rrect(c, x - 14, y, w + 28, 24, 12); paint(c, '#3c4150', 3);
  c.save(); rrect(c, x, y + 3, w, 14, 4); c.clip(); c.fillStyle = '#555b6c'; c.fillRect(x, y + 3, w, 14);
  c.strokeStyle = '#ffd23f'; c.lineWidth = 3;
  for (let q = x - 40 + (40 - b.off); q < x + w + 40; q += 40) { c.beginPath(); c.moveTo(q + 8, y + 5); c.lineTo(q, y + 10); c.lineTo(q + 8, y + 15); c.stroke(); }
  c.restore();
  for (const rx of [x - 2, x + w + 2]) { circ(c, rx, y + 12, 10); paint(c, '#9aa1b3', 2.5); circ(c, rx, y + 12, 3); c.fillStyle = OUT; c.fill(); }
}
// soapy ground: little bubbles that stay where the sudsy spray hit the ground
function drawSuds(c, x, w, t) {
  c.globalAlpha = 0.7;
  for (let k = 0; k < 4; k++) { const bx = x + 5 + k * 10 + Math.sin(t * 2 + x + k) * 2, r = 3 + ((x * 7 + k * 13) % 4); circ(c, bx, GROUND - r + 1, r); c.fillStyle = 'rgba(255,255,255,.55)'; c.fill(); c.strokeStyle = 'rgba(160,210,255,.9)'; c.lineWidth = 1.2; c.stroke(); }
  c.globalAlpha = 1;
}
// swimming pool wall: white and blue tiles
function drawPoolWall(c, s) {
  const { x, y, w, h } = s;
  rrect(c, x, y, w, h + 4, 4); paint(c, '#f4fbff');
  c.save(); rrect(c, x, y, w, h, 4); c.clip();
  for (let yy = y; yy < GROUND; yy += 15) for (let xx = x + ((yy - y) / 15 % 2 ? 0 : -7); xx < x + w; xx += 15) { c.fillStyle = ((xx + yy) / 15) % 2 < 1 ? '#bfe6ff' : '#e6f6ff'; c.fillRect(xx + 1, yy + 1, 13, 13); }
  c.restore(); rrect(c, x - 4, y - 6, w + 8, 10, 4); paint(c, '#3a8cf0', 2.5);
}
// pool water, drawn over the kid so swimming looks underwater
function drawWater(c, q, t) {
  const top = q.surf, x0 = q.x, x1 = q.x + q.w;
  c.beginPath(); c.moveTo(x0, GROUND);
  for (let xx = x0; xx <= x1; xx += 10) c.lineTo(xx, top + Math.sin(t * 3 + xx * 0.05) * 4);
  c.lineTo(x1, GROUND); c.closePath();
  const g = c.createLinearGradient(0, top, 0, GROUND); g.addColorStop(0, 'rgba(90,190,255,.55)'); g.addColorStop(1, 'rgba(30,110,220,.6)'); c.fillStyle = g; c.fill();
  c.beginPath(); for (let xx = x0; xx <= x1; xx += 10) { const yy = top + Math.sin(t * 3 + xx * 0.05) * 4; xx === x0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); }
  c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.stroke();
  c.globalAlpha = 0.25; c.strokeStyle = '#fff'; c.lineWidth = 2;
  for (let k = 0; k < 5; k++) { const lx = x0 + 30 + ((k * 83 + t * 20) % (q.w - 60)), ly = top + 40 + k * 28; c.beginPath(); c.moveTo(lx, ly); c.quadraticCurveTo(lx + 15, ly - 6, lx + 30, ly); c.stroke(); }
  c.globalAlpha = 1;
}
// fire truck with a water cannon on the back deck
function drawTruck(c, T, t, P) {
  const x = T.x, w = T.w, y = GROUND, deck = y - 78;
  ell(c, x + w / 2, y + 2, w * 0.5, 7); c.fillStyle = 'rgba(0,0,0,.18)'; c.fill();
  rrect(c, x, deck, w - 66, 62, 8); paint(c, '#e8443a');
  rrect(c, x + w - 72, y - 128, 72, 112, 12); paint(c, '#e8443a');
  rrect(c, x + w - 58, y - 116, 46, 34, 6); paint(c, '#bfe7ff', 2.5);
  c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(x + w - 52, y - 112, 8, 26);
  c.fillStyle = '#fff'; c.fillRect(x + 6, deck + 28, w - 80, 8); c.fillRect(x + w - 70, y - 60, 68, 8);
  // ladder on the side
  rrect(c, x + 14, deck + 8, w - 100, 16, 3); paint(c, '#d8dde6', 2.5);
  for (let lx = x + 26; lx < x + w - 90; lx += 18) line(c, lx, deck + 9, lx, deck + 23, OUT, 2);
  // flashing lights
  const on = Math.floor(t * 4) % 2;
  rrect(c, x + w - 56, y - 140, 40, 12, 5); paint(c, '#666', 2);
  circ(c, x + w - 46, y - 134, 5); paint(c, on ? '#3a8cf0' : '#bfe7ff', 1.5); circ(c, x + w - 26, y - 134, 5); paint(c, on ? '#ffe' : '#ff5a4a', 1.5);
  rrect(c, x + w - 8, y - 40, 10, 14, 3); paint(c, '#fff27a', 2);
  for (const wx of [x + 50, x + w - 44]) { circ(c, wx, y - 16, 20); paint(c, '#2f2a3a', 3); circ(c, wx, y - 16, 8); paint(c, '#c9ced8', 2); }
  // water cannon (points where the kid aims when driving)
  const face = T.on ? P.face : 1, a = T.on ? P.aimA : -0.3, bx = (T.on ? P.x : x + 92) + face * 26, by = deck - 44;
  rrect(c, (T.on ? P.x : x + 92) - 14, deck - 30, 28, 30, 5); paint(c, '#9aa1b3', 2.5);
  c.save(); c.translate(bx, by); c.scale(face, 1); c.rotate(a);
  rrect(c, -12, -8, 58, 16, 6); paint(c, '#c9ced8', 2.5); rrect(c, 40, -10, 12, 20, 4); paint(c, '#ffd23f', 2.5);
  c.restore();
  circ(c, bx, by, 9); paint(c, '#77738a', 2.5);
  if (!T.on && T.x < T.x1 - 2) { const ay = y - 200 + Math.sin(t * 5) * 8, ax = x + w / 2; poly(c, [ax - 18, ay, ax + 18, ay, ax, ay + 24]); paint(c, '#ffd23f', 3); }
}
// fire hose from a hydrant to the kid's washer, sagging on the ground
function drawHose(c, x1, y1, P) {
  const x2 = P.x - P.face * 6, y2 = P.y - 36, mx = (x1 + x2) / 2, my = Math.min(GROUND + 4, Math.max(y1, y2) + 60);
  for (const [col, lw] of [[OUT, 11], ['#e8443a', 7]]) { c.beginPath(); c.moveTo(x1, y1); c.quadraticCurveTo(mx, my, x2, y2); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); }
  rrect(c, x1 - 6, y1 - 7, 14, 14, 3); paint(c, '#ffd23f', 2);
}

// ---------------------------------------------------------------- v1.32 ponds in the ground
// big mossy rock between two ponds (too tall to jump: swim through the tunnel under it)
function drawCliff(c, s) {
  const { x, y, w, h } = s, b = GROUND + 2;
  poly(c, [x - 6, b, x + 4, y + h * 0.45, x + w * 0.18, y + 24, x + w * 0.42, y, x + w * 0.66, y + 14, x + w * 0.86, y + 40, x + w + 6, y + h * 0.5, x + w + 8, b]); paint(c, '#8f8b86', 3.5);
  poly(c, [x + w * 0.5, b, x + w * 0.56, y + h * 0.5, x + w * 0.8, y + h * 0.35, x + w + 4, y + h * 0.62, x + w + 8, b]); paint(c, '#7a7671', 2.5);
  poly(c, [x + w * 0.1, y + h * 0.42, x + w * 0.2, y + 30, x + w * 0.38, y + h * 0.28, x + w * 0.3, y + h * 0.5]); c.fillStyle = 'rgba(255,255,255,.18)'; c.fill();
  c.beginPath(); c.moveTo(x + w * 0.12, y + 46); c.quadraticCurveTo(x + w * 0.3, y - 2, x + w * 0.42, y + 4); c.quadraticCurveTo(x + w * 0.6, y + 4, x + w * 0.84, y + 46);
  c.quadraticCurveTo(x + w * 0.7, y + 30, x + w * 0.56, y + 34); c.quadraticCurveTo(x + w * 0.36, y + 24, x + w * 0.12, y + 46); paint(c, '#5fae45', 2.5);
  for (const [fx, fy, l] of [[0.3, 0.5, 30], [0.62, 0.62, 24], [0.45, 0.8, 34]]) { line(c, x + w * fx, y + h * fy, x + w * fx + 10, y + h * fy + l, 'rgba(40,30,30,.45)', 3); }
  for (let k = 0; k < 4; k++) { ell(c, x + 12 + k * (w - 24) / 3, b - 6, 18, 8); paint(c, '#4fa83a', 2); }
}
// soil under the ground strip, only drawn in levels with ponds (seen when the camera follows the kid down)
function drawUnderSoil(c, x0, W) {
  const top = GROUND + 52, g = c.createLinearGradient(0, top, 0, GROUND + 480); g.addColorStop(0, '#7a5236'); g.addColorStop(1, '#4a2f1d');
  c.fillStyle = g; c.fillRect(x0 - 10, top, W + 20, 430);
  for (let k = Math.floor(x0 / 70) - 1; k * 70 < x0 + W + 70; k++) {
    const px = k * 70 + hsh(k * 1.7) * 50, py = top + 30 + hsh(k * 2.9) * 360;
    ell(c, px, py, 7 + hsh(k) * 9, 5 + hsh(k + 1) * 5); c.fillStyle = hsh(k + 4) < 0.5 ? '#94704f' : '#5d3c25'; c.fill();
    if (hsh(k + 8) < 0.3) { c.beginPath(); c.moveTo(px, top); c.quadraticCurveTo(px + 14, top + 40, px - 6, top + 70); c.strokeStyle = '#5a3a22'; c.lineWidth = 3; c.stroke(); }
  }
}
// pond + tunnel outlines, back water (behind the kid), sandy bottoms, weeds, fish
function lakeShape(c, q) {
  if (q.top != null) { rrect(c, q.x, q.top, q.w, q.bot - q.top, 24); return; }
  const r = 70; c.beginPath(); c.moveTo(q.x, GROUND - 4); c.lineTo(q.x + 10, q.bot - r); c.quadraticCurveTo(q.x + 14, q.bot, q.x + r, q.bot);
  c.lineTo(q.x + q.w - r, q.bot); c.quadraticCurveTo(q.x + q.w - 14, q.bot, q.x + q.w - 10, q.bot - r); c.lineTo(q.x + q.w, GROUND - 4); c.closePath();
}
function drawLakesBack(c, lakes, tunnels, t, theme, x0, W) {
  const all = tunnels.concat(lakes), swamp = theme === 'swamp';
  for (const q of all) { lakeShape(c, q); c.strokeStyle = '#3a2616'; c.lineWidth = 12; c.stroke(); }
  for (const q of all) {
    lakeShape(c, q); const top = q.top != null ? q.top : q.surf, g = c.createLinearGradient(0, top, 0, q.bot);
    g.addColorStop(0, swamp ? '#5f8a5a' : '#6cc6e6'); g.addColorStop(1, swamp ? '#24402c' : '#1d5f8e'); c.fillStyle = g; c.fill();
  }
  for (const q of lakes) {
    c.fillStyle = '#4a3220'; c.fillRect(q.x + 4, GROUND - 2, q.w - 8, q.surf - GROUND + 6);
    c.save(); lakeShape(c, q); c.clip(); c.globalAlpha = 0.12; c.fillStyle = '#fff';
    for (let k = 0; k < 3; k++) { const lx = q.x + 40 + k * q.w / 3 + Math.sin(t * 0.6 + k) * 14; poly(c, [lx, q.surf, lx + 34, q.surf, lx + 80, q.bot, lx + 30, q.bot]); c.fill(); }
    c.restore(); c.globalAlpha = 1;
  }
  for (const q of all) {
    if (q.x + q.w < x0 - 60 || q.x > x0 + W + 60) continue;
    c.save(); lakeShape(c, q); c.clip();
    ell(c, q.x + q.w / 2, q.bot + 4, q.w * 0.55, 22); c.fillStyle = swamp ? '#5a5a3a' : '#e3cf94'; c.fill();
    for (let k = 0; k < q.w / 50; k++) {
      const px = q.x + 20 + k * 50 + hsh(q.x + k) * 20, hh = 30 + hsh(q.x * 0.3 + k) * 50, sw = Math.sin(t * 2 + k + q.x) * 8;
      if (hsh(q.x + k * 3.3) < 0.5) { c.beginPath(); c.moveTo(px, q.bot); c.quadraticCurveTo(px + sw, q.bot - hh * 0.5, px + sw * 1.6, q.bot - hh); c.strokeStyle = swamp ? '#3f6a22' : '#3fae55'; c.lineWidth = 5; c.stroke(); }
      else { ell(c, px, q.bot - 6, 9, 6); paint(c, hsh(k + q.x) < 0.5 ? '#9a948a' : '#c08a5a', 2); }
    }
    for (let k = 0; k < (q.top != null ? 1 : 2); k++) {
      const sp = 0.35 + hsh(q.x + k * 7) * 0.3, ph = t * sp + hsh(q.x * 1.3 + k) * 6, fx = q.x + 50 + (Math.sin(ph) * 0.5 + 0.5) * (q.w - 100);
      const fy = (q.top != null ? q.top + 40 : q.surf + 70 + k * 70) + Math.sin(t * 2 + k) * 6;
      drawFish(c, fx, fy, Math.cos(ph) > 0 ? 1 : -1, ['#ff9f1c', '#ffd23f', '#ff6f8a'][(k + Math.floor(q.x)) % 3]);
    }
    c.restore();
  }
  // reeds and cattails on the banks
  for (const q of lakes) for (const ex of [q.x - 14, q.x + q.w + 14]) {
    for (let k = -1; k <= 1; k++) { const rx = ex + k * 8, sw = Math.sin(t * 1.5 + rx) * 3; line(c, rx, GROUND, rx + sw, GROUND - 46 - k * 6, '#3f8f3a', 3); if (k !== 0) { rrect(c, rx + sw - 3, GROUND - 60 - k * 6, 7, 18, 3); paint(c, '#7a4a28', 1.5); } }
  }
}
function drawFish(c, x, y, dir, col) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  poly(c, [-14, 0, -26, -9, -26, 9]); paint(c, col, 2); ell(c, 0, 0, 16, 9); paint(c, col, 2);
  circ(c, 8, -2, 2.5); c.fillStyle = OUT; c.fill(); c.restore();
}
// water drawn over the kid: tint, rippling surface, lily pads, a duck
function drawLakesFront(c, lakes, tunnels, t, theme) {
  const swamp = theme === 'swamp';
  const tint = swamp ? 'rgba(60,110,60,.35)' : 'rgba(40,150,210,.3)';
  c.fillStyle = tint;
  for (const q of tunnels) { rrect(c, q.x, q.top, q.w, q.bot - q.top, 24); c.fill(); }
  for (const q of lakes) {
    const x0 = q.x + 4, x1 = q.x + q.w - 4;
    c.fillStyle = tint; c.save(); lakeShape(c, q); c.clip();
    c.beginPath(); c.moveTo(x0, q.bot + 10);
    for (let xx = x0; xx <= x1; xx += 10) c.lineTo(xx, q.surf + Math.sin(t * 3 + xx * 0.05) * 3);
    c.lineTo(x1, q.bot + 10); c.closePath(); c.fill();
    c.restore();
    c.beginPath(); for (let xx = x0; xx <= x1; xx += 10) { const yy = q.surf + Math.sin(t * 3 + xx * 0.05) * 3; xx === x0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); }
    c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 3; c.stroke();
    const lp = q.x + q.w * (0.2 + hsh(q.x) * 0.2); ell(c, lp, q.surf + 2, 18, 5); paint(c, '#4fb548', 2); circ(c, lp + 6, q.surf - 2, 4); paint(c, '#ff9fc0', 1.5);
    if (hsh(q.x + 3) < 0.6 && !swamp) { const dx = q.x + q.w * 0.7 + Math.sin(t * 0.4 + q.x) * q.w * 0.15, dy = q.surf - 6 + Math.sin(t * 3) * 1.5, f = Math.cos(t * 0.4 + q.x) > 0 ? 1 : -1;
      c.save(); c.translate(dx, dy); c.scale(f, 1); ell(c, 0, 0, 16, 10); paint(c, '#fff', 2.5); circ(c, 12, -12, 7); paint(c, '#fff', 2.5); poly(c, [18, -12, 26, -10, 18, -8]); paint(c, '#ff9f1c', 1.5); circ(c, 14, -14, 1.6); c.fillStyle = OUT; c.fill(); c.restore(); }
  }
}
