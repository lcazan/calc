'use strict';
// Super Splash: per-level worlds (v1.33). Every level walks through its own chapters (WORLD[scene name]): each chapter
// has its own background buildings/trees/etc. (mid layer, parallax 0.45), far scenery (0.15), ground style and props.
// Items get random looks when the level starts (houses never the same); layers are drawn into 800-wide chunks on demand.
const WCH = 800, FH = 400; // chunk width (layer units); far horizon line
const wpick = (r, a) => a[Math.floor(r() * a.length)];
const wrr = (r, a, b) => a + r() * (b - a);
const WALLS = ['#f6e1a6', '#bfe1f5', '#f7c6c6', '#cfe8b8', '#e8d0f0', '#ffd8a8', '#f4f4f4', '#d8e6f0', '#f0b8a0', '#fff1c1'];
const ROOFS = ['#d27a62', '#7a6a8a', '#5a7ab0', '#4a8a5a', '#b05a3a', '#6a5a4a', '#c0392b', '#3f5f7a'];
const DOORS = ['#e8443a', '#3a6fd8', '#43a047', '#ffd23f', '#8a5a2b', '#9b5de5', '#ff7eb6'];
const BRIGHT = ['#e8443a', '#3a8cf0', '#43c46b', '#ffd23f', '#ff9f1c', '#ff7eb6', '#9b5de5'];
// window grid helper
function wgrid(c, x, y, cols, rows, ww, wh, gx, gy, lit) {
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = x + i * (ww + gx), wy = y + j * (wh + gy);
    if (lit) { rrect(c, wx, wy, ww, wh, 2); paint(c, hsh(wx * 0.37 + wy) < 0.4 ? '#ffe680' : '#bfe7ff', 2); } else win(c, wx, wy, ww, wh);
  }
}
function roofTri(c, x, y, w, h, col) { poly(c, [x - 10, y, x + w / 2, y - h, x + w + 10, y]); paint(c, col, 2.5); }
function flag(c, x, y, h, col) { line(c, x, y, x, y - h, OUT, 3); poly(c, [x, y - h, x + 30, y - h + 9, x, y - h + 18]); paint(c, col, 2); }
function bgTree(c, x, s, col, kind) {
  const G = GROUND;
  if (kind === 'pine') { rrect(c, x - 5 * s, G - 26 * s, 10 * s, 26 * s, 2); paint(c, '#8a5a2b', 2); for (let k = 0; k < 3; k++) { poly(c, [x - (44 - k * 10) * s, G - (22 + k * 34) * s, x, G - (80 + k * 34) * s, x + (44 - k * 10) * s, G - (22 + k * 34) * s]); paint(c, col, 2); } return; }
  if (kind === 'birch') { rrect(c, x - 5 * s, G - 90 * s, 10 * s, 90 * s, 3); paint(c, '#f4f4f4', 2); for (let k = 1; k < 5; k++) line(c, x - 4 * s, G - k * 18 * s, x + 2 * s, G - k * 18 * s, OUT, 2); ell(c, x, G - 110 * s, 34 * s, 44 * s); paint(c, col, 2); return; }
  if (kind === 'willow') { rrect(c, x - 7 * s, G - 70 * s, 14 * s, 70 * s, 3); paint(c, '#8a5a2b', 2); c.beginPath(); c.moveTo(x - 60 * s, G - 20 * s); c.quadraticCurveTo(x - 60 * s, G - 140 * s, x, G - 140 * s); c.quadraticCurveTo(x + 60 * s, G - 140 * s, x + 60 * s, G - 20 * s);
    for (let k = 6; k >= -6; k--) c.lineTo(x + k * 10 * s, G - (k % 2 ? 26 : 40) * s); c.closePath(); paint(c, col, 2); return; }
  rrect(c, x - 6 * s, G - 60 * s, 12 * s, 60 * s, 3); paint(c, '#8a5a2b', 2);
  for (const [dx, dy, r0] of [[0, -92, 34], [-24, -70, 26], [24, -70, 26]]) { circ(c, x + dx * s, G + dy * s, r0 * s); paint(c, col, 2); }
  if (kind === 'fruit') for (let k = 0; k < 7; k++) { circ(c, x + (hsh(x + k) - 0.5) * 60 * s, G - (60 + hsh(x * 2 + k) * 50) * s, 4.5 * s); paint(c, k % 3 ? '#e8443a' : '#ff9f1c', 1.5); }
}
// ---------------------------------------------------------------- background items: make(r) -> params incl. w; draw(c, x, p)
const BGI = {
  // ---- neighborhoods
  house: { make(r) {
    const two = r() < 0.45, hw = Math.round(wrr(r, 130, 200));
    return { hw, w: hw + (r() < 0.3 ? 76 : 0), h: two ? wrr(r, 125, 155) : wrr(r, 80, 105), two, wall: wpick(r, WALLS), roof: wpick(r, ROOFS), door: wpick(r, DOORS), rt: Math.floor(r() * 4),
      chim: r() < 0.5, porch: r() < 0.4, shut: r() < 0.5 ? wpick(r, DOORS) : null, box: r() < 0.4, fence: r() < 0.35, dl: r() < 0.5, round: r() < 0.2 }; },
    draw(c, x, p) {
      const G = GROUND, w = p.hw, h = p.h, top = G - h;
      if (p.w > w) { rrect(c, x + w - 4, G - 74, 78, 74, 2); paint(c, p.wall, 2.5); poly(c, [x + w - 10, G - 74, x + w + 35, G - 104, x + w + 80, G - 74]); paint(c, p.roof, 2.5); rrect(c, x + w + 6, G - 60, 58, 60, 2); paint(c, '#e8e8e8', 2); for (let k = 1; k < 5; k++) line(c, x + w + 8, G - 60 + k * 12, x + w + 62, G - 60 + k * 12, '#b8b8b8', 2); }
      if (p.chim) { rrect(c, x + w * 0.68, top - w * 0.36, 18, w * 0.3, 2); paint(c, '#b05a3a', 2.5); }
      if (p.rt === 0) roofTri(c, x, top, w, w * 0.42, p.roof);
      else if (p.rt === 1) { poly(c, [x - 10, top, x + w * 0.22, top - 48, x + w * 0.78, top - 48, x + w + 10, top]); paint(c, p.roof, 2.5); }
      else if (p.rt === 2) { rrect(c, x - 8, top - 16, w + 16, 18, 3); paint(c, p.roof, 2.5); }
      else { poly(c, [x - 10, top, x + 6, top - 38, x + w / 2, top - 60, x + w - 6, top - 38, x + w + 10, top]); paint(c, p.roof, 2.5); }
      rrect(c, x, top, w, h, 2); paint(c, p.wall, 2.5);
      if (p.round && p.rt !== 2) { circ(c, x + w / 2, top - 18, 9); paint(c, '#bfe7ff', 2); }
      const dx = p.dl ? x + 18 : x + w - 50, cols = Math.max(1, Math.floor((w - 60) / 46));
      for (let row = 0; row < (p.two ? 2 : 1); row++) for (let i = 0; i < cols; i++) {
        const wx = (p.dl ? x + 62 : x + 14) + i * 46, wy = top + 16 + row * 56; if (row === 0 && p.two === false && Math.abs(wx - dx) < 30) continue;
        win(c, wx, wy, 30, 32); if (p.shut) { rrect(c, wx - 9, wy, 7, 32, 2); paint(c, p.shut, 1.5); rrect(c, wx + 32, wy, 7, 32, 2); paint(c, p.shut, 1.5); }
        if (p.box && row === (p.two ? 1 : 0)) { rrect(c, wx - 2, wy + 32, 34, 7, 2); paint(c, '#a0662f', 1.5); for (let q = 0; q < 4; q++) { circ(c, wx + 3 + q * 8, wy + 30, 3); c.fillStyle = BRIGHT[(q + i) % 7]; c.fill(); } }
      }
      rrect(c, dx, G - 50, 30, 50, 3); paint(c, p.door, 2.5); circ(c, dx + 23, G - 25, 2.5); c.fillStyle = '#ffd23f'; c.fill();
      if (p.porch) { rrect(c, dx - 16, G - 64, 62, 8, 2); paint(c, p.roof, 2); line(c, dx - 10, G - 56, dx - 10, G, OUT, 3); line(c, dx + 40, G - 56, dx + 40, G, OUT, 3); }
      if (p.fence) for (let fx = x - 6; fx < x + w + 4; fx += 13) { poly(c, [fx, G, fx, G - 26, fx + 4.5, G - 31, fx + 9, G - 26, fx + 9, G]); paint(c, '#fff', 1.5); }
    } },
  tree: { make(r) { const s = wrr(r, 0.8, 1.35), kind = wpick(r, ['round', 'round', 'pine', 'birch']); return { w: Math.round((kind === 'pine' ? 90 : 84) * s), s, kind, col: wpick(r, ['#4fb548', '#5cb85c', '#3f9a3a', '#6fc24a']) }; },
    draw(c, x, p) { bgTree(c, x + p.w / 2, p.s, p.col, p.kind); } },
  fruittree: { make(r) { const s = wrr(r, 0.9, 1.2); return { w: Math.round(84 * s), s }; }, draw(c, x, p) { bgTree(c, x + p.w / 2, p.s, '#4fb548', 'fruit'); } },
  willow: { make(r) { const s = wrr(r, 0.9, 1.3); return { w: Math.round(124 * s), s }; }, draw(c, x, p) { bgTree(c, x + p.w / 2, p.s, '#7cc24a', 'willow'); } },
  hedge: { make(r) { return { w: Math.round(wrr(r, 80, 170)), h: wrr(r, 28, 48), col: wpick(r, ['#4cae4c', '#3f9a3a']) }; },
    draw(c, x, p) { rrect(c, x, GROUND - p.h, p.w, p.h + 4, p.h / 2); paint(c, p.col, 2.5); for (let k = 12; k < p.w - 8; k += 22) { c.beginPath(); c.arc(x + k, GROUND - p.h + 12, 8, 3.4, 5.9); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 2; c.stroke(); } } },
  picket: { make(r) { return { w: Math.round(wrr(r, 120, 220)), col: wpick(r, ['#fff', '#fff', '#f3e3c3']) }; },
    draw(c, x, p) { c.fillStyle = p.col; rrect(c, x, GROUND - 22, p.w, 6, 2); paint(c, p.col, 1.5); for (let fx = x; fx < x + p.w - 4; fx += 14) { poly(c, [fx, GROUND, fx, GROUND - 34, fx + 5, GROUND - 40, fx + 10, GROUND - 34, fx + 10, GROUND]); paint(c, p.col, 1.5); } } },
  lamppost: { w: 30, draw(c, x) { rrect(c, x + 12, GROUND - 160, 6, 160, 2); paint(c, '#55606e', 2); ell(c, x + 15, GROUND - 166, 14, 8); paint(c, '#ffe680', 2); } },
  mailboxes: { w: 60, draw(c, x) { for (let k = 0; k < 2; k++) { rrect(c, x + 8 + k * 28, GROUND - 50, 5, 50, 1); paint(c, '#8a5a2b', 1.5); rrect(c, x + k * 28, GROUND - 66, 22, 18, 7); paint(c, BRIGHT[k + 1], 2); } } },
  playset: { make(r) { return { w: 190, col: wpick(r, BRIGHT) }; }, draw(c, x, p) {
    const G = GROUND; for (const [a, b] of [[x + 10, x + 40], [x + 120, x + 90]]) line(c, a, G, b, G - 120, OUT, 5); line(c, x + 36, G - 118, x + 96, G - 118, OUT, 6);
    for (const sx of [52, 78]) { line(c, x + sx, G - 116, x + sx, G - 40, '#666', 2); rrect(c, x + sx - 9, G - 42, 18, 6, 2); paint(c, p.col, 1.5); }
    rrect(c, x + 120, G - 90, 46, 90, 3); paint(c, '#ffd23f', 2); poly(c, [x + 112, G - 90, x + 143, G - 120, x + 174, G - 90]); paint(c, p.col, 2); c.beginPath(); c.moveTo(x + 166, G - 70); c.quadraticCurveTo(x + 186, G - 30, x + 192, G); c.strokeStyle = OUT; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#3a8cf0'; c.lineWidth = 5; c.stroke(); } },
  shelter: { make(r) { return { w: 200, col: wpick(r, ['#c0392b', '#3a6fd8', '#43a047']) }; }, draw(c, x, p) {
    const G = GROUND; for (const px of [x + 20, x + 176]) { rrect(c, px, G - 96, 8, 96, 2); paint(c, '#8a5a2b', 2); } poly(c, [x - 6, G - 92, x + 100, G - 140, x + 206, G - 92]); paint(c, p.col, 2.5);
    rrect(c, x + 46, G - 34, 108, 8, 2); paint(c, '#c98a45', 2); line(c, x + 60, G - 26, x + 56, G, OUT, 3); line(c, x + 140, G - 26, x + 144, G, OUT, 3); } },
  gate: { make(r, C) { return { w: 210, s: C.sign || 'PARK', col: wpick(r, ['#43a047', '#3a6fd8', '#8a5a2b']) }; }, draw(c, x, p) {
    const G = GROUND; for (const px of [x + 10, x + 172]) { rrect(c, px, G - 170, 28, 170, 3); paint(c, '#b9b3a6', 2.5); rrect(c, px - 4, G - 178, 36, 12, 3); paint(c, '#9a948a', 2); }
    c.beginPath(); c.arc(x + 105, G - 120, 80, Math.PI * 1.1, Math.PI * 1.9); c.strokeStyle = OUT; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#6d6a66'; c.lineWidth = 5; c.stroke();
    rrect(c, x + 50, G - 214, 110, 34, 6); paint(c, p.col, 2.5); txt(c, p.s, x + 105, G - 197, 18, '#fff'); } },
  flowerbed: { make(r) { return { w: Math.round(wrr(r, 140, 220)), seed: r() }; }, draw(c, x, p) {
    ell(c, x + p.w / 2, GROUND - 6, p.w / 2, 14); paint(c, '#7a5236', 2); for (let k = 0; k < p.w / 14; k++) { const fx = x + 8 + k * 14, fy = GROUND - 18 - hsh(p.seed + k) * 14; line(c, fx, GROUND - 6, fx, fy, '#3f8f3a', 2); circ(c, fx, fy, 5); paint(c, BRIGHT[(k + Math.floor(p.seed * 7)) % 7], 1.5); } } },
  greenhouse_bg: { w: 220, draw(c, x) { const G = GROUND; c.beginPath(); c.moveTo(x, G); c.lineTo(x, G - 90); c.quadraticCurveTo(x + 110, G - 170, x + 220, G - 90); c.lineTo(x + 220, G); c.closePath(); c.fillStyle = 'rgba(200,240,255,.75)'; c.fill(); c.strokeStyle = OUT; c.lineWidth = 2.5; c.stroke();
    for (let k = 1; k < 6; k++) line(c, x + k * 36, G, x + k * 36, G - 90 - Math.sin(k / 6 * Math.PI) * 60, '#fff', 3); for (let k = 0; k < 8; k++) { circ(c, x + 20 + k * 26, G - 20, 9); paint(c, '#4fb548', 1.5); } } },
  topiaryrow: { make(r) { return { w: 180, s: Math.floor(r() * 3) }; }, draw(c, x) { const G = GROUND; for (let k = 0; k < 3; k++) { const px = x + 30 + k * 60; rrect(c, px - 14, G - 24, 28, 24, 3); paint(c, '#d9785a', 2); if (k % 2) { circ(c, px, G - 50, 22); paint(c, '#3f9a3a', 2); circ(c, px, G - 82, 14); paint(c, '#3f9a3a', 2); } else { poly(c, [px - 20, G - 26, px, G - 100, px + 20, G - 26]); paint(c, '#3f9a3a', 2); } } } },
  boathouse: { make(r) { return { w: 220, col: wpick(r, ['#c0392b', '#3a6fd8', '#2e7d5a']) }; }, draw(c, x, p) {
    const G = GROUND; rrect(c, x, G - 110, 220, 110, 2); paint(c, p.col, 2.5); for (let k = 10; k < 220; k += 14) line(c, x + k, G - 108, x + k, G - 2, 'rgba(0,0,0,.15)', 2);
    roofTri(c, x, G - 110, 220, 60, '#f4f4f4'); c.beginPath(); c.arc(x + 110, G - 30, 44, Math.PI, 0); c.lineTo(x + 154, G); c.lineTo(x + 66, G); c.closePath(); paint(c, '#2a2140', 2); txt(c, 'BOATS', x + 110, G - 140, 15, OUT); } },
  reeds: { w: 70, draw(c, x) { for (let k = 0; k < 6; k++) { const rx = x + 8 + k * 11; line(c, rx, GROUND, rx + (k % 2 ? 4 : -4), GROUND - 50 - (k % 3) * 12, '#3f8f3a', 3); if (k % 2) { rrect(c, rx + 1, GROUND - 66 - (k % 3) * 12, 7, 18, 3); paint(c, '#7a4a28', 1.5); } } } },
  // ---- town and city
  shop: { make(r, C) { return { w: Math.round(wrr(r, 170, 230)), h: wrr(r, 150, 210), wall: wpick(r, ['#e8b49a', '#f6e1a6', '#bfe1f5', '#d98b6a', '#cfe8b8', '#f7c6c6']), aw: wpick(r, BRIGHT), s: wpick(r, C.signs || ['BAKERY', 'TOYS', 'BOOKS', 'PETS', 'SHOES', 'SWEETS', 'DELI', 'HATS', 'GIFTS', 'MUSIC']), up: r() < 0.6 }; },
    draw(c, x, p) {
      const G = GROUND, top = G - p.h; rrect(c, x, top, p.w, p.h, 2); paint(c, p.wall, 2.5); rrect(c, x - 4, top - 10, p.w + 8, 14, 3); paint(c, '#8a7a6a', 2);
      if (p.up) wgrid(c, x + 18, top + 14, Math.floor((p.w - 20) / 50), 1, 30, 30, 20, 0);
      const sy = G - 112; rrect(c, x + 16, sy - 30, p.w - 32, 26, 5); paint(c, '#fff', 2); txt(c, p.s, x + p.w / 2, sy - 17, 15, p.aw === '#ffd23f' ? '#c08a00' : p.aw);
      for (let k = 0; k < p.w / 22; k++) { c.fillStyle = k % 2 ? '#fff' : p.aw; c.fillRect(x + k * 22, sy, 22, 18); } rrect(c, x, sy, p.w, 18, 2); paint(c, null, 2);
      rrect(c, x + 14, G - 86, p.w - 70, 66, 3); paint(c, '#bfe7ff', 2.5); for (let k = 0; k < 3; k++) { rrect(c, x + 24 + k * 26, G - 40, 18, 18, 3); paint(c, BRIGHT[(k * 3 + p.s.length) % 7], 1.5); }
      rrect(c, x + p.w - 48, G - 80, 34, 80, 3); paint(c, '#8a5a2b', 2.5);
    } },
  apartment: { make(r) { return { w: Math.round(wrr(r, 150, 220)), h: wrr(r, 240, 340), col: wpick(r, ['#d98b6a', '#c9a27a', '#a77fb8', '#7aa6a0', '#e8b49a', '#9db3d8']), esc: r() < 0.4, tank: r() < 0.35, lit: r() < 0.3 }; },
    draw(c, x, p) {
      const G = GROUND, top = G - p.h; if (p.tank) { rrect(c, x + p.w - 60, top - 46, 36, 34, 4); paint(c, '#a0662f', 2); line(c, x + p.w - 56, top - 12, x + p.w - 56, top, OUT, 3); line(c, x + p.w - 28, top - 12, x + p.w - 28, top, OUT, 3); }
      rrect(c, x, top, p.w, p.h, 2); paint(c, p.col, 2.5); rrect(c, x - 4, top - 8, p.w + 8, 12, 2); paint(c, 'rgba(0,0,0,.2)', 2);
      const cols = Math.floor((p.w - 16) / 44), rows = Math.floor((p.h - 70) / 50); wgrid(c, x + (p.w - cols * 44 + 14) / 2, top + 18, cols, rows, 30, 34, 14, 16, p.lit);
      rrect(c, x + p.w / 2 - 20, G - 52, 40, 52, 3); paint(c, '#5a3a22', 2.5);
      if (p.esc) for (let k = 0; k < rows; k++) { const y = top + 56 + k * 50; line(c, x + 8, y, x + 60, y, OUT, 3); line(c, x + 8, y - 22, x + 60, y - 22, OUT, 1.5); line(c, x + 14, y, x + 54, y - 50 + 22, OUT, 2); }
    } },
  office: { make(r) { return { w: Math.round(wrr(r, 140, 200)), h: wrr(r, 320, 420), col: wpick(r, ['#6fa8d8', '#7fc0c8', '#8a9ad8', '#9ab8c8']) }; },
    draw(c, x, p) { const G = GROUND, top = G - p.h; rrect(c, x, top, p.w, p.h, 3); paint(c, p.col, 2.5); for (let y = top + 14; y < G - 50; y += 26) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 8, y, p.w - 16, 14); }
      for (let k = 1; k < 4; k++) line(c, x + k * p.w / 4, top + 6, x + k * p.w / 4, G - 50, 'rgba(0,0,0,.18)', 2); rrect(c, x + p.w / 2 - 30, G - 50, 60, 50, 3); paint(c, '#bfe7ff', 2.5); line(c, x + p.w / 2, top, x + p.w / 2, top - 40, OUT, 3); circ(c, x + p.w / 2, top - 42, 4); paint(c, '#ff4a3c', 1.5); } },
  hoarding: { make(r) { return { w: Math.round(wrr(r, 200, 300)), seed: r() }; }, draw(c, x, p) {
    const G = GROUND; rrect(c, x, G - 80, p.w, 80, 2); paint(c, '#2e7d5a', 2.5); for (let k = 0; k < p.w / 80 - 0.5; k++) { const px = x + 14 + k * 80; rrect(c, px, G - 68, 60, 46, 3); paint(c, BRIGHT[(k + Math.floor(p.seed * 7)) % 7], 2); txt(c, ['DIG!', 'BUILD', 'WOW', 'NEW!'][(k + Math.floor(p.seed * 4)) % 4], px + 30, G - 45, 13, '#fff'); }
    for (let k = 0; k <= p.w; k += 40) line(c, x + k, G - 80, x + k, G - 86, OUT, 3); } },
  girders: { make(r) { return { w: Math.round(wrr(r, 200, 260)), fl: 4 + Math.floor(r() * 3), done: 1 + Math.floor(r() * 2) }; }, draw(c, x, p) {
    const G = GROUND, fh = 60, top = G - p.fl * fh; for (let k = 0; k < p.done; k++) { rrect(c, x, G - (k + 1) * fh, p.w, fh, 0); paint(c, '#c9b8a0', 2); wgrid(c, x + 16, G - (k + 1) * fh + 14, Math.floor(p.w / 48), 1, 28, 30, 20, 0); }
    for (let k = 0; k <= 4; k++) line(c, x + k * p.w / 4, G - p.done * fh, x + k * p.w / 4, top, '#e8b820', 6); for (let f = p.done; f <= p.fl; f++) line(c, x - 4, G - f * fh, x + p.w + 4, G - f * fh, '#e8b820', 6);
    for (let f = p.done; f < p.fl; f++) for (let k = 0; k < 4; k++) if ((f + k) % 2) line(c, x + k * p.w / 4, G - f * fh, x + (k + 1) * p.w / 4, G - (f + 1) * fh, '#d09a10', 3);
    flag(c, x + p.w - 10, top, 30, '#e8443a'); } },
  dirtpile: { make(r) { return { w: Math.round(wrr(r, 110, 170)), h: wrr(r, 40, 70) }; }, draw(c, x, p) { c.beginPath(); c.moveTo(x, GROUND); c.quadraticCurveTo(x + p.w / 2, GROUND - p.h * 2, x + p.w, GROUND); c.closePath(); paint(c, '#a3784a', 2.5); for (let k = 0; k < 5; k++) { circ(c, x + p.w * (0.25 + k * 0.12), GROUND - p.h * 0.5 + (k % 2) * 8, 4); c.fillStyle = '#7b5431'; c.fill(); } } },
  bigcrane: { w: 260, draw(c, x) { const G = GROUND; for (const dx of [40, 66]) line(c, x + dx, G, x + dx, G - 330, '#e8b820', 5); for (let y = G; y > G - 330; y -= 26) line(c, x + 40, y, x + 66, y - 26, '#e8b820', 3);
    line(c, x, G - 330, x + 260, G - 330, '#e8b820', 7); rrect(c, x + 34, G - 330, 38, 26, 3); paint(c, '#e8443a', 2); line(c, x + 220, G - 328, x + 220, G - 200, OUT, 2); rrect(c, x + 196, G - 200, 48, 20, 2); paint(c, '#9aa1ab', 2); rrect(c, x, G - 340, 30, 20, 2); paint(c, '#55606e', 2); } },
  firestation_bg: { w: 330, draw(c, x) { const G = GROUND; rrect(c, x, G - 210, 330, 210, 2); paint(c, '#b5503a', 2.5); for (let y = G - 200; y < G; y += 14) line(c, x + 2, y, x + 328, y, 'rgba(0,0,0,.1)', 1.5);
    rrect(c, x + 230, G - 290, 70, 90, 2); paint(c, '#b5503a', 2.5); poly(c, [x + 222, G - 290, x + 265, G - 326, x + 308, G - 290]); paint(c, '#6a5a4a', 2.5); circ(c, x + 265, G - 254, 16); paint(c, '#ffd23f', 2);
    rrect(c, x + 40, G - 196, 180, 30, 4); paint(c, '#fff', 2.5); txt(c, 'FIRE STATION 7', x + 130, G - 181, 15, '#e8443a');
    for (let k = 0; k < 3; k++) { rrect(c, x + 20 + k * 100, G - 150, 86, 150, 4); paint(c, '#e8443a', 2.5); for (let q = 1; q < 4; q++) { rrect(c, x + 28 + k * 100, G - 150 + q * 34, 70, 24, 2); paint(c, '#bfe7ff', 1.5); } } } },
  police_bg: { w: 260, draw(c, x) { const G = GROUND; rrect(c, x, G - 180, 260, 180, 2); paint(c, '#9db3d8', 2.5); rrect(c, x + 60, G - 172, 140, 28, 4); paint(c, '#2c3e70', 2); txt(c, 'POLICE', x + 130, G - 158, 17, '#fff');
    wgrid(c, x + 20, G - 132, 5, 1, 30, 34, 16, 0); rrect(c, x + 104, G - 70, 52, 70, 3); paint(c, '#2c3e70', 2.5); for (const lx of [x + 92, x + 168]) { circ(c, lx, G - 80, 7); paint(c, '#3a8cf0', 2); } } },
  hospital_bg: { w: 300, draw(c, x) { const G = GROUND; rrect(c, x, G - 260, 300, 260, 2); paint(c, '#f4f4f4', 2.5); wgrid(c, x + 20, G - 230, 6, 3, 30, 34, 16, 18); rrect(c, x + 110, G - 300, 80, 44, 4); paint(c, '#fff', 2.5); c.fillStyle = '#e8443a'; c.fillRect(x + 142, G - 296, 16, 36); c.fillRect(x + 132, G - 286, 36, 16);
    rrect(c, x + 90, G - 64, 120, 64, 3); paint(c, '#bfe7ff', 2.5); rrect(c, x + 80, G - 80, 140, 18, 3); paint(c, '#e8443a', 2); txt(c, 'HOSPITAL', x + 150, G - 71, 13, '#fff'); } },
  plaza: { w: 220, draw(c, x) { const G = GROUND; ell(c, x + 110, G - 10, 100, 14); paint(c, '#b9b3a6', 2.5); rrect(c, x + 60, G - 34, 100, 26, 6); paint(c, '#8fd8ff', 2.5); rrect(c, x + 100, G - 90, 20, 60, 4); paint(c, '#b9b3a6', 2);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + 110, G - 92); c.quadraticCurveTo(x + 110 + s * 40, G - 120, x + 110 + s * 50, G - 34); c.strokeStyle = 'rgba(140,210,255,.9)'; c.lineWidth = 4; c.stroke(); } } },
  // ---- school
  school_bg: { w: 440, draw(c, x) { const G = GROUND; rrect(c, x, G - 200, 440, 200, 2); paint(c, '#c96f55', 2.5); for (let y = G - 190; y < G; y += 14) line(c, x + 2, y, x + 438, y, 'rgba(0,0,0,.09)', 1.5);
    rrect(c, x + 160, G - 270, 120, 80, 2); paint(c, '#c96f55', 2.5); roofTri(c, x + 160, G - 270, 120, 46, '#6a5a4a'); circ(c, x + 220, G - 236, 22); paint(c, '#fff', 2.5); line(c, x + 220, G - 236, x + 220, G - 252, OUT, 3); line(c, x + 220, G - 236, x + 232, G - 236, OUT, 3);
    flag(c, x + 220, G - 316, 40, '#3a8cf0'); rrect(c, x + 130, G - 184, 180, 30, 5); paint(c, '#fff', 2.5); txt(c, 'SUDSY SCHOOL', x + 220, G - 169, 17, '#c0392b');
    wgrid(c, x + 20, G - 140, 3, 2, 30, 34, 14, 18); wgrid(c, x + 308, G - 140, 3, 2, 30, 34, 14, 18);
    rrect(c, x + 180, G - 110, 80, 110, 4); paint(c, '#3a6fd8', 2.5); line(c, x + 220, G - 108, x + 220, G, OUT, 2.5); for (let k = 0; k < 3; k++) { rrect(c, x + 150 - k * 6, G - 8 + k * 0, 140 + k * 12, 8, 2); paint(c, '#b9b3a6', 2); } } },
  classwing: { make(r) { return { w: Math.round(wrr(r, 260, 320)), seed: r() }; }, draw(c, x, p) {
    const G = GROUND; rrect(c, x, G - 130, p.w, 130, 2); paint(c, '#e8b49a', 2.5); rrect(c, x - 6, G - 140, p.w + 12, 14, 3); paint(c, '#6a5a4a', 2);
    for (let k = 0; k < Math.floor((p.w - 20) / 60); k++) { const wx = x + 16 + k * 60; win(c, wx, G - 112, 44, 50); for (let q = 0; q < 2; q++) { rrect(c, wx + 6 + q * 18, G - 104, 12, 12, 1); c.fillStyle = BRIGHT[(k * 2 + q + Math.floor(p.seed * 7)) % 7]; c.fill(); } }
    rrect(c, x + p.w - 46, G - 60, 32, 60, 3); paint(c, '#ffd23f', 2.5); } },
  chainfence: { make(r) { return { w: Math.round(wrr(r, 200, 280)) }; }, draw(c, x, p) { const G = GROUND; c.strokeStyle = 'rgba(120,128,140,.8)'; c.lineWidth = 1.5; c.beginPath();
    for (let k = 0; k < p.w; k += 10) { c.moveTo(x + k, G); c.lineTo(x + k + 10, G - 80); c.moveTo(x + k + 10, G); c.lineTo(x + k, G - 80); } c.stroke(); line(c, x, G - 80, x + p.w, G - 80, '#8a9099', 4); for (let k = 0; k <= p.w; k += 70) line(c, x + k, G, x + k, G - 84, '#6d7480', 5); } },
  busparked: { w: 240, draw(c, x) { const G = GROUND; rrect(c, x, G - 96, 240, 80, 12); paint(c, '#ffc928', 2.5); wgrid(c, x + 14, G - 86, 5, 1, 28, 26, 10, 0); c.fillStyle = OUT; c.fillRect(x + 4, G - 50, 232, 4); txt(c, 'SCHOOL BUS', x + 110, G - 36, 13, OUT); for (const wx of [x + 50, x + 190]) { circ(c, wx, G - 14, 14); paint(c, '#2e2a36', 2); } } },
  bleachers_bg: { w: 260, draw(c, x) { const G = GROUND; for (let k = 0; k < 5; k++) { rrect(c, x + k * 20, G - 20 - k * 22, 260 - k * 40, 10, 2); paint(c, '#c9ced8', 2); for (let q = 0; q < (220 - k * 40) / 16; q++) if (hsh(x + q * 3 + k) < 0.6) { circ(c, x + k * 20 + 12 + q * 16, G - 30 - k * 22, 6); c.fillStyle = BRIGHT[(q + k) % 7]; c.fill(); } }
    for (const lx of [x + 10, x + 250]) line(c, lx, G, lx, G - 120, '#8a9099', 4); } },
  goalframe: { w: 150, draw(c, x) { const G = GROUND; rrect(c, x, G - 80, 150, 80, 0); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1; for (let k = 0; k < 150; k += 12) { c.beginPath(); c.moveTo(x + k, G - 80); c.lineTo(x + k, G); c.stroke(); } for (let k = 0; k < 80; k += 12) { c.beginPath(); c.moveTo(x, G - 80 + k); c.lineTo(x + 150, G - 80 + k); c.stroke(); }
    line(c, x, G, x, G - 80, '#fff', 6); line(c, x, G - 80, x + 150, G - 80, '#fff', 6); line(c, x + 150, G - 80, x + 150, G, '#fff', 6); } },
  gardenbed: { make(r) { return { w: Math.round(wrr(r, 150, 200)), seed: r() }; }, draw(c, x, p) { const G = GROUND; rrect(c, x, G - 34, p.w, 34, 3); paint(c, '#a0662f', 2.5);
    for (let k = 0; k < p.w / 24 - 1; k++) { const px = x + 16 + k * 24, t = (k + Math.floor(p.seed * 3)) % 3; if (t === 0) { circ(c, px, G - 46, 9); paint(c, '#e8443a', 1.5); } else if (t === 1) { for (let q = -1; q <= 1; q++) line(c, px, G - 34, px + q * 6, G - 62, '#43a047', 3); } else { circ(c, px, G - 44, 10); paint(c, '#7ed957', 1.5); } line(c, px, G - 34, px, G - 40, '#3f8f3a', 2); } } },
  scarecrow_bg: { w: 70, draw(c, x) { const G = GROUND; line(c, x + 35, G, x + 35, G - 110, '#8a5a2b', 5); line(c, x + 5, G - 80, x + 65, G - 80, '#8a5a2b', 4); rrect(c, x + 20, G - 90, 30, 34, 4); paint(c, '#3a8cf0', 2); circ(c, x + 35, G - 104, 13); paint(c, '#f0cc5a', 2); poly(c, [x + 18, G - 112, x + 52, G - 112, x + 35, G - 132]); paint(c, '#8a5a2b', 2); } },
};
Object.assign(BGI, {
  // ---- beach and harbor
  palm: { make(r) { return { w: 90, s: wrr(r, 0.85, 1.2), lean: wrr(r, -0.15, 0.2) }; }, draw(c, x, p) { const G = GROUND, bx = x + 45, tx = bx + p.lean * 120 * p.s, ty = G - 200 * p.s;
    c.beginPath(); c.moveTo(bx, G); c.quadraticCurveTo(bx + p.lean * 40, G - 100 * p.s, tx, ty); c.strokeStyle = OUT; c.lineWidth = 15; c.stroke(); c.strokeStyle = '#a0662f'; c.lineWidth = 10; c.stroke();
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.55; c.beginPath(); c.moveTo(tx, ty); c.quadraticCurveTo(tx + Math.cos(a) * 40 * p.s, ty + Math.sin(a) * 30 * p.s - 10, tx + Math.cos(a) * 66 * p.s, ty + Math.sin(a) * 20 * p.s + 26); c.strokeStyle = OUT; c.lineWidth = 12; c.stroke(); c.strokeStyle = '#43a047'; c.lineWidth = 8; c.stroke(); }
    for (const d of [-8, 6]) { circ(c, tx + d, ty + 8, 7); paint(c, '#8a5a2b', 1.5); } } },
  beachhut: { make(r) { return { w: Math.round(wrr(r, 90, 115)), col: wpick(r, BRIGHT) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x, G - 100, p.w, 100, 2); paint(c, '#fff', 2.5); for (let k = 0; k < p.w; k += 18) { c.fillStyle = p.col; c.fillRect(x + k + 1, G - 98, 9, 97); }
    rrect(c, x, G - 100, p.w, 100, 2); paint(c, null, 2.5); roofTri(c, x, G - 100, p.w, 34, p.col); rrect(c, x + p.w / 2 - 16, G - 62, 32, 62, 3); paint(c, '#fff3d6', 2); } },
  boardshop: { make(r) { return { w: Math.round(wrr(r, 170, 220)), col: wpick(r, ['#7fd0f0', '#ffd8a8', '#f7c6c6', '#cfe8b8']), aw: wpick(r, BRIGHT), s: wpick(r, ['SURF', 'TAFFY', 'SHELLS', 'KITES', 'FRIES', 'SNACKS', 'TOYS']) }; },
    draw(c, x, p) { const G = GROUND; rrect(c, x, G - 150, p.w, 150, 2); paint(c, p.col, 2.5); rrect(c, x + 14, G - 146, p.w - 28, 30, 5); paint(c, '#fff', 2); txt(c, p.s, x + p.w / 2, G - 131, 17, p.aw);
      c.beginPath(); c.moveTo(x - 6, G - 92); for (let k = 0; k <= p.w + 12; k += 20) c.arc(x - 6 + k + 10, G - 92, 10, Math.PI, 0, true); c.lineTo(x + p.w + 6, G - 110); c.lineTo(x - 6, G - 110); c.closePath(); paint(c, p.aw, 2);
      rrect(c, x + 16, G - 80, p.w - 32, 46, 3); paint(c, '#bfe7ff', 2.5); rrect(c, x + 10, G - 34, p.w - 20, 10, 2); paint(c, '#a0662f', 2); } },
  pier_bg: { w: 300, draw(c, x) { const G = GROUND; for (let k = 0; k < 7; k++) { rrect(c, x + 10 + k * 44, G - 60, 10, 60, 2); paint(c, '#7a5236', 2); } rrect(c, x, G - 70, 300, 14, 2); paint(c, '#c98a55', 2.5); for (let k = 0; k <= 300; k += 30) line(c, x + k, G - 70, x + k, G - 96, OUT, 3); line(c, x, G - 92, x + 300, G - 92, OUT, 3); circ(c, x + 250, G - 110, 14); paint(c, '#ff6f5a', 2); circ(c, x + 250, G - 110, 7); paint(c, '#c9efff', 2); } },
  waterstrip: { make(r, C, w) { return { w }; }, draw(c, x, p) { const G = GROUND; c.fillStyle = '#3fb2d9'; c.fillRect(x, G - 60, p.w, 62); c.fillStyle = '#62c6e6'; for (let k = 0; k < p.w; k += 50) { ell(c, x + k + 20, G - 40 + (k % 3) * 10, 16, 3); c.fill(); } line(c, x, G - 60, x + p.w, G - 60, '#9fe0f5', 3); } },
  boatmoored: { make(r) { return { w: Math.round(wrr(r, 150, 200)), col: wpick(r, BRIGHT), sail: r() < 0.5 }; }, draw(c, x, p) { const G = GROUND - 40; poly(c, [x, G - 30, x + p.w, G - 30, x + p.w - 20, G, x + 20, G]); paint(c, p.col, 2.5); rrect(c, x + 8, G - 34, p.w - 16, 8, 2); paint(c, '#fff', 2);
    if (p.sail) { line(c, x + p.w / 2, G - 30, x + p.w / 2, G - 150, OUT, 4); poly(c, [x + p.w / 2 + 4, G - 146, x + p.w / 2 + 4, G - 40, x + p.w - 10, G - 40]); paint(c, '#fff', 2); } else { rrect(c, x + p.w * 0.35, G - 70, p.w * 0.35, 40, 4); paint(c, '#fff', 2); win(c, x + p.w * 0.4, G - 62, 20, 18); } } },
  warehouse: { make(r) { return { w: Math.round(wrr(r, 240, 300)), col: wpick(r, ['#9aa1ab', '#b5503a', '#5a7ab0', '#7aa6a0']), n: 1 + Math.floor(r() * 9) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x, G - 150, p.w, 150, 2); paint(c, p.col, 2.5); for (let k = 8; k < p.w; k += 12) line(c, x + k, G - 148, x + k, G - 2, 'rgba(0,0,0,.14)', 2);
    poly(c, [x - 6, G - 150, x + p.w / 2, G - 186, x + p.w + 6, G - 150]); paint(c, '#6d7480', 2.5); rrect(c, x + p.w / 2 - 60, G - 110, 120, 110, 3); paint(c, '#ffd23f', 2.5); for (let k = 1; k < 6; k++) line(c, x + p.w / 2 - 58, G - 110 + k * 18, x + p.w / 2 + 58, G - 110 + k * 18, '#d8a820', 2); txt(c, String(p.n), x + 30, G - 130, 22, '#fff'); } },
  dockcrane: { w: 180, draw(c, x) { const G = GROUND; for (const dx of [20, 120]) { line(c, x + dx, G, x + dx + 20, G - 200, OUT, 8); line(c, x + dx, G, x + dx + 20, G - 200, '#e8443a', 5); } rrect(c, x + 20, G - 230, 140, 34, 3); paint(c, '#e8443a', 2.5); line(c, x + 150, G - 216, x + 180, G - 260, OUT, 6); line(c, x + 60, G - 196, x + 60, G - 120, OUT, 2); rrect(c, x + 36, G - 120, 50, 30, 2); paint(c, '#3a8cf0', 2); } },
  fishstall: { make(r) { return { w: 170, col: wpick(r, ['#3a8cf0', '#43a047', '#e8443a']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 60, 150, 60, 3); paint(c, '#fff', 2.5); for (let k = 0; k < 5; k++) { ell(c, x + 30 + k * 28, G - 66, 12, 6); paint(c, ['#9ad0e8', '#ff9f8a', '#c9ced8'][k % 3], 1.5); }
    for (const px of [x + 14, x + 152]) line(c, px, G - 60, px, G - 130, OUT, 4); c.beginPath(); c.moveTo(x, G - 120); for (let k = 0; k <= 170; k += 17) c.lineTo(x + k, G - (k / 17 % 2 ? 140 : 120)); c.lineTo(x + 170, G - 120); c.closePath(); paint(c, p.col, 2.5); txt(c, 'FISH', x + 85, G - 88, 16, p.col); } },
  dune: { make(r) { return { w: Math.round(wrr(r, 200, 320)), h: wrr(r, 50, 100) }; }, draw(c, x, p) { const G = GROUND; c.beginPath(); c.moveTo(x, G); c.quadraticCurveTo(x + p.w * 0.4, G - p.h * 2, x + p.w, G); c.closePath(); paint(c, '#f2d08a', 2.5);
    for (let k = 0; k < 4; k++) { const gx = x + p.w * (0.25 + k * 0.15); for (let q = -2; q <= 2; q++) line(c, gx, G - p.h * 0.7, gx + q * 5, G - p.h * 0.7 - 22, '#7ab048', 2.5); } } },
  umbrellaset: { make(r) { return { w: 130, col: wpick(r, BRIGHT), t: wpick(r, BRIGHT) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 6, 90, 8, 3); paint(c, p.t, 2); line(c, x + 70, G, x + 76, G - 110, '#eee', 4);
    c.beginPath(); c.moveTo(x + 16, G - 96); c.quadraticCurveTo(x + 76, G - 150, x + 130, G - 104); c.closePath(); paint(c, p.col, 2.5); for (let k = 0; k < 3; k++) line(c, x + 76, G - 122, x + 30 + k * 40, G - 100, 'rgba(255,255,255,.6)', 2); } },
  cliffs: { make(r) { return { w: Math.round(wrr(r, 220, 300)), h: wrr(r, 170, 240) }; }, draw(c, x, p) { const G = GROUND; poly(c, [x, G, x + 20, G - p.h * 0.7, x + p.w * 0.3, G - p.h, x + p.w * 0.65, G - p.h * 0.9, x + p.w - 10, G - p.h * 0.5, x + p.w, G]); paint(c, '#c99a6a', 2.5);
    for (let k = 1; k < 4; k++) line(c, x + 20, G - p.h * k / 4, x + p.w - 20, G - p.h * k / 4 + 10, 'rgba(120,80,40,.35)', 3); c.beginPath(); c.moveTo(x + 22, G - p.h * 0.7); c.quadraticCurveTo(x + p.w * 0.3, G - p.h - 14, x + p.w * 0.65, G - p.h * 0.9); c.strokeStyle = '#7ab048'; c.lineWidth = 8; c.stroke(); } },
  lifehut: { w: 100, draw(c, x) { const G = GROUND; for (const dx of [12, 82]) line(c, x + dx, G, x + dx + (dx < 50 ? 10 : -10), G - 80, OUT, 5); rrect(c, x + 10, G - 130, 80, 52, 3); paint(c, '#ff6f5a', 2.5); poly(c, [x + 2, G - 130, x + 50, G - 156, x + 98, G - 130]); paint(c, '#fff', 2.5); rrect(c, x + 24, G - 120, 52, 22, 3); paint(c, '#bfe7ff', 2); flag(c, x + 92, G - 156, 30, '#ffd23f'); } },
  // ---- farm
  barn_bg: { make(r) { return { w: 230, col: wpick(r, ['#c0392b', '#b5503a', '#a03a2a']) }; }, draw(c, x, p) { const G = GROUND; poly(c, [x, G, x, G - 110, x + 30, G - 160, x + 115, G - 196, x + 200, G - 160, x + 230, G - 110, x + 230, G]); paint(c, p.col, 2.5);
    c.beginPath(); c.moveTo(x - 6, G - 108); c.lineTo(x + 30, G - 162); c.lineTo(x + 115, G - 200); c.lineTo(x + 200, G - 162); c.lineTo(x + 236, G - 108); c.strokeStyle = '#fff'; c.lineWidth = 6; c.stroke();
    rrect(c, x + 75, G - 100, 80, 100, 2); paint(c, p.col, 2.5); line(c, x + 75, G - 100, x + 155, G, '#fff', 4); line(c, x + 155, G - 100, x + 75, G, '#fff', 4); rrect(c, x + 75, G - 100, 80, 100, 2); paint(c, null, 2.5); rrect(c, x + 100, G - 160, 30, 30, 2); paint(c, '#fff3d6', 2.5); } },
  silo_bg: { w: 76, draw(c, x) { const G = GROUND; rrect(c, x, G - 220, 76, 220, 4); paint(c, '#c9ced8', 2.5); for (let y = G - 200; y < G; y += 24) line(c, x + 2, y, x + 74, y, '#9aa1ab', 2); c.beginPath(); c.arc(x + 38, G - 220, 38, Math.PI, 0); c.closePath(); paint(c, '#9aa1ab', 2.5); } },
  windmill_bg: { w: 130, draw(c, x) { const G = GROUND, cx = x + 65, cy = G - 210; for (const [a, b] of [[x + 40, cx - 6], [x + 90, cx + 6]]) line(c, a, G, b, cy + 10, '#8a9099', 4); for (let y = G - 30; y > cy + 30; y -= 40) line(c, x + 42 + (G - y) * 0.11, y, x + 88 - (G - y) * 0.11, y - 30, '#8a9099', 2);
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; line(c, cx, cy, cx + Math.cos(a) * 46, cy + Math.sin(a) * 46, '#f4f4f4', 6); } circ(c, cx, cy, 46); c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); circ(c, cx, cy, 8); paint(c, '#e8443a', 2); poly(c, [cx + 8, cy, cx + 60, cy - 10, cx + 60, cy + 10]); paint(c, '#e8443a', 2); } },
  railfence: { make(r) { return { w: Math.round(wrr(r, 180, 260)) }; }, draw(c, x, p) { const G = GROUND; for (let k = 0; k <= p.w; k += 60) { rrect(c, x + k, G - 56, 9, 56, 2); paint(c, '#a0662f', 2); } for (const y of [G - 46, G - 26]) { rrect(c, x, y, p.w + 9, 7, 2); paint(c, '#c98a45', 2); } } },
  cow_bg: { make(r) { return { w: 100, f: r() < 0.5 ? 1 : -1 }; }, draw(c, x, p) { const G = GROUND; c.save(); c.translate(x + 50, G); c.scale(p.f, 1); for (const dx of [-28, -14, 16, 28]) line(c, dx, -30, dx, 0, OUT, 6); ell(c, 0, -42, 40, 22); paint(c, '#fff', 2.5); ell(c, -10, -46, 12, 9); c.fillStyle = OUT; c.fill(); ell(c, 18, -36, 9, 7); c.fill();
    ell(c, 42, -56, 15, 13); paint(c, '#fff', 2.5); ell(c, 50, -50, 9, 7); paint(c, '#ffb3c1', 2); circ(c, 40, -60, 2.5); c.fillStyle = OUT; c.fill(); c.restore(); } },
  hayroll: { make(r) { return { w: Math.round(wrr(r, 100, 160)) }; }, draw(c, x, p) { const G = GROUND; for (let k = 0; k < p.w / 52 - 0.5; k++) { circ(c, x + 28 + k * 52, G - 26, 26); paint(c, '#f0cc5a', 2.5); circ(c, x + 28 + k * 52, G - 26, 14); c.strokeStyle = '#d8a83a'; c.lineWidth = 2; c.stroke(); } } },
  cornrow: { make(r) { return { w: Math.round(wrr(r, 180, 260)) }; }, draw(c, x, p) { const G = GROUND; for (let k = 0; k < p.w; k += 16) { const h = 100 + hsh(x + k) * 30; line(c, x + k + 8, G, x + k + 8, G - h, '#5a9a2a', 4); ell(c, x + k + 2, G - h * 0.6, 10, 4, -0.6); c.fillStyle = '#6fb53a'; c.fill(); ell(c, x + k + 12, G - h * 0.5, 7, 12); paint(c, '#ffd23f', 1.5); line(c, x + k + 8, G - h, x + k + 14, G - h - 10, '#e8c060', 2); } } },
  pumpkins: { make(r) { return { w: Math.round(wrr(r, 130, 180)) }; }, draw(c, x, p) { const G = GROUND; for (let k = 0; k < p.w / 36 - 0.5; k++) { const px = x + 20 + k * 36, s = 0.7 + hsh(x + k) * 0.5; ell(c, px, G - 14 * s, 18 * s, 14 * s); paint(c, '#ff9f1c', 2); line(c, px, G - 27 * s, px + 3, G - 34 * s, '#3f8f3a', 3); } } },
  farmstand_bg: { make(r) { return { w: 170, s: wpick(r, ['FRESH EGGS', 'APPLES', 'PIES', 'HONEY', 'CORN']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 50, 150, 50, 2); paint(c, '#c98a45', 2.5); for (let k = 0; k < 5; k++) { rrect(c, x + 20 + k * 28, G - 64, 22, 16, 3); paint(c, '#a0662f', 1.5); for (let q = 0; q < 3; q++) { circ(c, x + 25 + k * 28 + q * 6, G - 66, 4); c.fillStyle = ['#e8443a', '#ffd23f', '#ff9f1c', '#7ed957', '#fff'][k]; c.fill(); } }
    for (const px of [x + 14, x + 152]) line(c, px, G - 50, px, G - 120, OUT, 4); roofTri(c, x + 8, G - 116, 154, 26, '#e8443a'); rrect(c, x + 30, G - 104, 110, 24, 4); paint(c, '#fff', 2); txt(c, p.s, x + 85, G - 92, 13, '#c0392b'); } },
  coop_bg: { w: 120, draw(c, x) { const G = GROUND; rrect(c, x, G - 70, 110, 60, 2); paint(c, '#f2e6cf', 2.5); roofTri(c, x, G - 70, 110, 34, '#c0392b'); line(c, x + 10, G - 10, x + 10, G, OUT, 4); line(c, x + 100, G - 10, x + 100, G, OUT, 4); rrect(c, x + 40, G - 54, 26, 30, 10); paint(c, '#5a3a22', 2); line(c, x + 66, G - 24, x + 100, G, '#a0662f', 4); } },
  // ---- airport
  terminal_bg: { make(r) { return { w: 380, s: wpick(r, ['TERMINAL A', 'TERMINAL B', 'TERMINAL C', 'GATES 1-9']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x, G - 170, 380, 170, 4); paint(c, '#d8e0ea', 2.5); c.beginPath(); c.moveTo(x - 8, G - 170); c.quadraticCurveTo(x + 190, G - 230, x + 388, G - 170); c.closePath(); paint(c, '#9aa8b8', 2.5);
    rrect(c, x + 14, G - 150, 352, 100, 4); paint(c, '#7fc0e8', 2.5); for (let k = 1; k < 8; k++) line(c, x + 14 + k * 44, G - 150, x + 14 + k * 44, G - 50, '#fff', 3); rrect(c, x + 120, G - 196, 140, 26, 5); paint(c, '#2c3e70', 2); txt(c, p.s, x + 190, G - 183, 14, '#ffd23f'); } },
  ctower_bg: { w: 110, draw(c, x) { const G = GROUND; poly(c, [x + 35, G, x + 42, G - 240, x + 68, G - 240, x + 75, G]); paint(c, '#d8e0ea', 2.5); poly(c, [x + 10, G - 240, x + 100, G - 240, x + 110, G - 290, x, G - 290]); paint(c, '#7fc0e8', 2.5); rrect(c, x + 4, G - 302, 102, 14, 3); paint(c, '#9aa8b8', 2); line(c, x + 55, G - 302, x + 55, G - 336, OUT, 3); circ(c, x + 55, G - 338, 5); paint(c, '#ff4a3c', 1.5); } },
  hangar_bg: { make(r) { return { w: 310, n: 1 + Math.floor(r() * 6), col: wpick(r, ['#c9ced8', '#b8c4d4', '#d8d0c0']) }; }, draw(c, x, p) { const G = GROUND; c.beginPath(); c.moveTo(x, G); c.lineTo(x, G - 120); c.quadraticCurveTo(x + 155, G - 230, x + 310, G - 120); c.lineTo(x + 310, G); c.closePath(); paint(c, p.col, 2.5);
    for (let k = 1; k < 9; k++) line(c, x + k * 34, G - 2, x + k * 34, G - 120 - Math.sin(k / 9 * Math.PI) * 90, 'rgba(0,0,0,.12)', 2); rrect(c, x + 40, G - 130, 230, 130, 2); paint(c, '#6d7480', 2.5); txt(c, 'HANGAR ' + p.n, x + 155, G - 150, 18, OUT); } },
  plane_bg: { make(r) { return { w: 300, col: wpick(r, ['#e8443a', '#3a8cf0', '#43a047', '#ff9f1c']) }; }, draw(c, x, p) { const G = GROUND - 16; rrect(c, x + 20, G - 60, 260, 44, 22); paint(c, '#fff', 2.5); poly(c, [x + 24, G - 54, x + 4, G - 120, x + 40, G - 120, x + 80, G - 54]); paint(c, p.col, 2.5);
    poly(c, [x + 120, G - 30, x + 190, G - 30, x + 150, G + 4, x + 110, G + 4]); paint(c, '#d8e0ea', 2); for (let k = 0; k < 8; k++) { circ(c, x + 100 + k * 18, G - 44, 4); paint(c, '#7fc0e8', 1.5); } c.fillStyle = p.col; c.fillRect(x + 30, G - 30, 240, 6); line(c, x + 140, G + 4, x + 140, G + 14, OUT, 3); line(c, x + 260, G - 18, x + 260, G + 14, OUT, 3); circ(c, x + 140, G + 14, 6); paint(c, '#2e2a36', 2); circ(c, x + 260, G + 14, 6); paint(c, '#2e2a36', 2); } },
  fueltank_bg: { w: 140, draw(c, x) { const G = GROUND; rrect(c, x, G - 100, 140, 100, 12); paint(c, '#f4f4f4', 2.5); c.fillStyle = '#e8443a'; c.fillRect(x + 2, G - 60, 136, 14); rrect(c, x, G - 100, 140, 100, 12); paint(c, null, 2.5); txt(c, 'FUEL', x + 70, G - 78, 18, '#e8443a'); } },
  windsock: { w: 60, draw(c, x) { const G = GROUND; line(c, x + 10, G, x + 10, G - 130, OUT, 4); poly(c, [x + 10, G - 130, x + 58, G - 122, x + 58, G - 110, x + 10, G - 104]); paint(c, '#ff9f1c', 2); line(c, x + 26, G - 127, x + 26, G - 107, '#fff', 4); line(c, x + 42, G - 125, x + 42, G - 109, '#fff', 4); } },
  jetbridge: { w: 180, draw(c, x) { const G = GROUND; rrect(c, x, G - 130, 180, 40, 6); paint(c, '#c9ced8', 2.5); for (let k = 1; k < 5; k++) line(c, x + k * 36, G - 128, x + k * 36, G - 92, '#9aa1ab', 2); rrect(c, x + 120, G - 90, 18, 90, 3); paint(c, '#9aa1ab', 2); for (const wx of [x + 116, x + 142]) { circ(c, wx, G - 8, 8); paint(c, '#2e2a36', 2); } } },
  // ---- carnival
  tentc: { make(r) { return { w: Math.round(wrr(r, 120, 160)), a: wpick(r, BRIGHT), b: wpick(r, ['#fff', '#ffd23f']) }; }, draw(c, x, p) { const G = GROUND, w = p.w; rrect(c, x + 8, G - 80, w - 16, 80, 2); paint(c, p.b, 2.5); for (let k = 0; k < w - 16; k += 24) { c.fillStyle = p.a; c.fillRect(x + 8 + k, G - 78, 12, 78); }
    rrect(c, x + 8, G - 80, w - 16, 80, 2); paint(c, null, 2.5); poly(c, [x, G - 78, x + w / 2, G - 150, x + w, G - 78]); paint(c, p.a, 2.5); flag(c, x + w / 2, G - 150, 26, p.b === '#fff' ? '#ffd23f' : '#fff'); } },
  ferris_bg: { w: 280, draw(c, x) { const G = GROUND, cx = x + 140, cy = G - 170, R = 125; line(c, cx - 70, G, cx, cy, OUT, 7); line(c, cx + 70, G, cx, cy, OUT, 7);
    circ(c, cx, cy, R); c.strokeStyle = OUT; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#ff7eb6'; c.lineWidth = 3; c.stroke(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; line(c, cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R, '#9b5de5', 2); rrect(c, cx + Math.cos(a) * R - 11, cy + Math.sin(a) * R, 22, 18, 5); paint(c, BRIGHT[k % 7], 2); } circ(c, cx, cy, 12); paint(c, '#ffd23f', 2); } },
  coaster_bg: { w: 320, draw(c, x) { const G = GROUND; c.beginPath(); c.moveTo(x, G - 40); c.bezierCurveTo(x + 60, G - 240, x + 110, G - 240, x + 150, G - 80); c.bezierCurveTo(x + 180, G + 10, x + 220, G - 180, x + 320, G - 60); c.strokeStyle = OUT; c.lineWidth = 9; c.stroke(); c.strokeStyle = '#e8443a'; c.lineWidth = 5; c.stroke();
    for (let k = 20; k < 320; k += 30) line(c, x + k, G, x + k, G - 40 - Math.abs(Math.sin(k / 50)) * 120, '#c9ced8', 3); for (let k = 0; k < 3; k++) { rrect(c, x + 66 + k * 22, G - 222 + k * 6, 20, 14, 4); paint(c, BRIGHT[k + 2], 2); } } },
  booth: { make(r) { return { w: 160, col: wpick(r, BRIGHT), s: wpick(r, ['RING TOSS', 'DUCKS', 'DARTS', 'HOOPS', 'BALLOONS', 'FISHING', 'BOTTLES']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 6, G - 110, 148, 110, 2); paint(c, '#fff3d6', 2.5); rrect(c, x + 16, G - 84, 128, 50, 3); paint(c, '#6a3a8a', 2);
    for (let k = 0; k < 5; k++) { circ(c, x + 32 + k * 24, G - 66, 9); paint(c, BRIGHT[(k + 1) % 7], 1.5); circ(c, x + 32 + k * 24, G - 46, 7); paint(c, BRIGHT[(k + 4) % 7], 1.5); } rrect(c, x + 6, G - 34, 148, 12, 2); paint(c, p.col, 2);
    c.beginPath(); c.moveTo(x, G - 108); for (let k = 0; k <= 160; k += 20) c.arc(x + k + 10, G - 108, 10, Math.PI, 0, true); c.lineTo(x + 160, G - 130); c.lineTo(x, G - 130); c.closePath(); paint(c, p.col, 2); rrect(c, x + 20, G - 156, 120, 26, 5); paint(c, '#fff', 2); txt(c, p.s, x + 80, G - 143, 13, '#c0392b'); } },
  foodstall: { make(r) { return { w: 150, col: wpick(r, BRIGHT), s: wpick(r, ['CORN DOGS', 'COTTON CANDY', 'LEMONADE', 'PRETZELS', 'NACHOS', 'CANDY APPLES']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 70, 130, 70, 3); paint(c, p.col, 2.5); rrect(c, x + 20, G - 60, 110, 30, 3); paint(c, '#fff3d6', 2);
    for (const px of [x + 14, x + 136]) line(c, px, G - 70, px, G - 120, OUT, 4); poly(c, [x, G - 116, x + 75, G - 150, x + 150, G - 116]); paint(c, '#fff', 2.5); for (let k = 0; k < 6; k++) { poly(c, [x + 75, G - 150, x + k * 25, G - 116, x + k * 25 + 12, G - 116]); c.fillStyle = p.col; c.fill(); } txt(c, p.s, x + 75, G - 45, p.s.length > 9 ? 10 : 12, '#c0392b'); } },
  lights: { make(r, C, w) { return { w }; }, draw(c, x, p) { c.strokeStyle = OUT; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < p.w; k += 120) { c.moveTo(x + k, 150); c.quadraticCurveTo(x + k + 60, 200, x + k + 120, 150); } c.stroke();
    for (let k = 0; k < p.w; k += 20) { const y = 150 + 50 * Math.sin((k % 120) / 120 * Math.PI) * 0.5; circ(c, x + k, y + 4, 5); c.fillStyle = BRIGHT[(k / 20) % 7]; c.fill(); } } },
  bigtop_bg: { w: 440, draw(c, x) { const G = GROUND; rrect(c, x + 20, G - 150, 400, 150, 2); paint(c, '#fff', 2.5); for (let k = 0; k < 400; k += 40) { c.fillStyle = '#e8443a'; c.fillRect(x + 20 + k, G - 148, 20, 148); } rrect(c, x + 20, G - 150, 400, 150, 2); paint(c, null, 2.5);
    c.beginPath(); c.moveTo(x, G - 148); c.quadraticCurveTo(x + 120, G - 190, x + 220, G - 290); c.quadraticCurveTo(x + 320, G - 190, x + 440, G - 148); c.closePath(); paint(c, '#e8443a', 2.5); for (let k = 1; k < 6; k++) line(c, x + 220, G - 288, x + k * 73, G - 150, '#fff', 4);
    flag(c, x + 220, G - 290, 40, '#ffd23f'); c.beginPath(); c.arc(x + 220, G - 50, 50, Math.PI, 0); c.lineTo(x + 270, G); c.lineTo(x + 170, G); c.closePath(); paint(c, '#2a2140', 2.5); } },
  circuswagon: { make(r) { return { w: 190, col: wpick(r, BRIGHT) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 120, 170, 90, 6); paint(c, p.col, 2.5); for (let k = 0; k < 6; k++) line(c, x + 30 + k * 26, G - 112, x + 30 + k * 26, G - 38, '#ffd23f', 4);
    rrect(c, x + 4, G - 130, 182, 14, 4); paint(c, '#ffd23f', 2); for (const wx of [x + 44, x + 146]) { circ(c, wx, G - 22, 22); paint(c, '#ffd23f', 2.5); for (let k = 0; k < 8; k++) line(c, wx, G - 22, wx + Math.cos(k * 0.78) * 20, G - 22 + Math.sin(k * 0.78) * 20, OUT, 2); } } },
  // ---- train station
  canopy: { make(r, C, w) { return { w }; }, draw(c, x, p) { const G = GROUND; for (let k = 40; k < p.w; k += 220) { rrect(c, x + k, G - 230, 14, 230, 2); paint(c, '#6d7c88', 2); poly(c, [x + k - 40, G - 230, x + k + 54, G - 230, x + k + 7, G - 196]); paint(c, '#6d7c88', 2); }
    rrect(c, x, G - 252, p.w, 24, 2); paint(c, '#7a4a28', 2.5); for (let k = 160; k < p.w; k += 520) { rrect(c, x + k, G - 196, 120, 34, 4); paint(c, '#2a2238', 2); txt(c, 'PLATFORM ' + (9 + Math.floor(k / 520)), x + k + 60, G - 179, 13, '#ffd23f'); } } },
  stationbldg: { w: 380, draw(c, x) { const G = GROUND; rrect(c, x, G - 220, 380, 220, 2); paint(c, '#b5503a', 2.5); for (let y = G - 210; y < G; y += 14) line(c, x + 2, y, x + 378, y, 'rgba(0,0,0,.09)', 1.5);
    rrect(c, x + 150, G - 300, 80, 90, 2); paint(c, '#b5503a', 2.5); roofTri(c, x + 150, G - 300, 80, 36, '#3f5f7a'); circ(c, x + 190, G - 262, 24); paint(c, '#fff', 2.5); line(c, x + 190, G - 262, x + 190, G - 278, OUT, 3); line(c, x + 190, G - 262, x + 200, G - 256, OUT, 3);
    rrect(c, x + 110, G - 206, 160, 28, 4); paint(c, '#2a2238', 2); txt(c, 'STATION', x + 190, G - 192, 16, '#ffd23f');
    for (let k = 0; k < 5; k++) { const ax = x + 22 + k * 72; c.beginPath(); c.moveTo(ax, G - 20); c.lineTo(ax, G - 130); c.arc(ax + 24, G - 130, 24, Math.PI, 0); c.lineTo(ax + 48, G - 20); c.closePath(); paint(c, k === 2 ? '#5a3a22' : '#bfe7ff', 2.5); } } },
  traincar_bg: { make(r) { return { w: 270, col: wpick(r, ['#3a6fd8', '#2e7d5a', '#c0392b', '#7a4a8a']) }; }, draw(c, x, p) { const G = GROUND - 12; rrect(c, x, G - 110, 270, 100, 10); paint(c, p.col, 2.5); rrect(c, x - 4, G - 118, 278, 14, 6); paint(c, '#55606e', 2); wgrid(c, x + 18, G - 94, 6, 1, 28, 32, 12, 0); c.fillStyle = '#ffd23f'; c.fillRect(x + 2, G - 48, 266, 6);
    for (const wx of [x + 40, x + 80, x + 190, x + 230]) { circ(c, wx, G, 12); paint(c, '#2e2a36', 2); } } },
  containers: { make(r) { return { w: Math.round(wrr(r, 150, 200)), n: 1 + Math.floor(r() * 3), seed: r() }; }, draw(c, x, p) { const G = GROUND; for (let k = 0; k < p.n; k++) { const col = BRIGHT[(k + Math.floor(p.seed * 7)) % 7], y = G - (k + 1) * 60, dx = k % 2 ? 14 : 0; rrect(c, x + dx, y, p.w - 14, 58, 2); paint(c, col, 2.5); for (let q = 10; q < p.w - 20; q += 12) line(c, x + dx + q, y + 4, x + dx + q, y + 54, 'rgba(0,0,0,.16)', 2); } } },
  signalpost: { w: 40, draw(c, x) { const G = GROUND; rrect(c, x + 16, G - 180, 8, 180, 2); paint(c, '#55606e', 2); rrect(c, x + 6, G - 190, 28, 60, 6); paint(c, '#2e2a36', 2); circ(c, x + 20, G - 174, 8); paint(c, '#ff4a3c', 1.5); circ(c, x + 20, G - 146, 8); paint(c, '#43c46b', 1.5); } },
  rrtower: { w: 110, draw(c, x) { const G = GROUND; for (const dx of [20, 90]) line(c, x + dx, G, x + dx, G - 130, OUT, 5); line(c, x + 20, G - 40, x + 90, G - 120, '#6d7480', 3); rrect(c, x, G - 220, 110, 96, 10); paint(c, '#a0662f', 2.5); for (let k = 1; k < 4; k++) line(c, x + 2, G - 220 + k * 24, x + 108, G - 220 + k * 24, OUT, 2); poly(c, [x - 4, G - 220, x + 55, G - 250, x + 114, G - 220]); paint(c, '#55606e', 2.5); line(c, x + 100, G - 160, x + 130, G - 130, OUT, 4); } },
  // interiors: a full-height wall behind the chapter (covers the sky)
  hallwall: { make(r, C, w) { return { w, col: C.wallcol || '#e8dcc8' }; }, draw(c, x, p) { c.fillStyle = p.col; c.fillRect(x, 0, p.w, GROUND); c.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 30; y < GROUND; y += 60) c.fillRect(x, y, p.w, 3); c.fillStyle = '#a89878'; c.fillRect(x, GROUND - 50, p.w, 50); line(c, x, GROUND - 50, x + p.w, GROUND - 50, OUT, 2.5); } },
  archwin: { w: 150, draw(c, x) { const G = GROUND; c.beginPath(); c.moveTo(x + 10, G - 60); c.lineTo(x + 10, G - 260); c.arc(x + 75, G - 260, 65, Math.PI, 0); c.lineTo(x + 140, G - 60); c.closePath(); const g = c.createLinearGradient(0, G - 330, 0, G - 60); g.addColorStop(0, '#7fc8f0'); g.addColorStop(1, '#d8f0ff'); c.fillStyle = g; c.fill(); c.strokeStyle = OUT; c.lineWidth = 3; c.stroke();
    line(c, x + 75, G - 325, x + 75, G - 60, '#6d6a66', 4); for (let y = G - 240; y > G - 330; y -= 70) line(c, x + 10, y + 70, x + 140, y + 70, '#6d6a66', 4); } },
  bigclock: { w: 160, draw(c, x) { const G = GROUND; line(c, x + 80, 0, x + 80, G - 330, OUT, 4); circ(c, x + 80, G - 270, 60); paint(c, '#fff', 4); circ(c, x + 80, G - 270, 52); c.strokeStyle = '#c9a050'; c.lineWidth = 4; c.stroke(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; line(c, x + 80 + Math.cos(a) * 42, G - 270 + Math.sin(a) * 42, x + 80 + Math.cos(a) * 48, G - 270 + Math.sin(a) * 48, OUT, 3); } line(c, x + 80, G - 270, x + 80, G - 306, OUT, 4); line(c, x + 80, G - 270, x + 104, G - 260, OUT, 4); } },
  boardsign: { w: 220, draw(c, x) { const G = GROUND; rrect(c, x, G - 300, 220, 110, 6); paint(c, '#2a2238', 3); txt(c, 'DEPARTURES', x + 110, G - 284, 14, '#ffd23f', 'center'); for (let k = 0; k < 4; k++) { txt(c, ['SUDSVILLE', 'BUBBLE BAY', 'MUDTOWN', 'SOAPY HILL'][k], x + 16, G - 262 + k * 18, 11, '#fff', 'left'); txt(c, ['9:05', '9:20', '9:45', '10:10'][k], x + 204, G - 262 + k * 18, 11, '#7ed957', 'right'); } line(c, x + 60, G - 300, x + 60, G - 340, OUT, 3); line(c, x + 160, G - 300, x + 160, G - 340, OUT, 3); } },
  kiosk: { make(r) { return { w: 150, col: wpick(r, BRIGHT), s: wpick(r, ['NEWS', 'COFFEE', 'TICKETS', 'DONUTS', 'FLOWERS']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 110, 130, 110, 4); paint(c, p.col, 2.5); rrect(c, x + 20, G - 96, 110, 44, 3); paint(c, '#fff3d6', 2); rrect(c, x + 4, G - 130, 142, 24, 5); paint(c, '#fff', 2.5); txt(c, p.s, x + 75, G - 118, 14, OUT); } },
  // ---- swamp and castle
  deadtree_bg: { make(r) { return { w: 110, s: wrr(r, 0.9, 1.4) }; }, draw(c, x, p) { const G = GROUND, s = p.s, bx = x + 55; for (const [x1, y1, x2, y2, w] of [[0, 0, 4, -150, 16], [3, -90, -36, -136, 8], [4, -120, 40, -168, 8], [-20, -116, -44, -112, 5], [26, -146, 46, -150, 5]]) { line(c, bx + x1 * s, G + y1 * s, bx + x2 * s, G + y2 * s, OUT, w * s + 4); line(c, bx + x1 * s, G + y1 * s, bx + x2 * s, G + y2 * s, '#5a4a3a', w * s); } } },
  bogwillow: { make(r) { return { w: 140, s: wrr(r, 0.9, 1.2) }; }, draw(c, x, p) { bgTree(c, x + 70, p.s, '#5a7a32', 'willow'); for (let k = 0; k < 6; k++) line(c, x + 30 + k * 16, GROUND - 110 * p.s, x + 30 + k * 16, GROUND - 40 - (k % 3) * 20, '#8aa060', 2); } },
  hutstilts: { w: 170, draw(c, x) { const G = GROUND; for (const dx of [24, 70, 120, 150]) line(c, x + dx, G, x + dx, G - 60, '#5a4a3a', 7); rrect(c, x + 10, G - 140, 150, 82, 3); paint(c, '#7a6a4a', 2.5); poly(c, [x, G - 138, x + 85, G - 196, x + 170, G - 138]); paint(c, '#5a5a3a', 2.5); rrect(c, x + 30, G - 120, 30, 30, 3); paint(c, '#ffe680', 2); rrect(c, x + 100, G - 128, 34, 70, 3); paint(c, '#3a2a1a', 2); } },
  bogpool: { make(r) { return { w: Math.round(wrr(r, 140, 220)) }; }, draw(c, x, p) { ell(c, x + p.w / 2, GROUND - 4, p.w / 2, 12); paint(c, '#5f7a3a', 2.5); for (let k = 0; k < 3; k++) { circ(c, x + p.w * (0.3 + k * 0.2), GROUND - 8, 4 + k); c.strokeStyle = '#b2db48'; c.lineWidth = 2; c.stroke(); } } },
  castlewall: { make(r, C, w) { return { w }; }, draw(c, x, p) { const G = GROUND, top = G - 170; c.fillStyle = '#8d8a96'; c.fillRect(x, top, p.w, 170); for (let k = 0; k < p.w; k += 40) { rrect(c, x + k, top - 26, 24, 28, 2); paint(c, '#8d8a96', 2.5); }
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let y = top + 24; y < G; y += 26) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + p.w, y); c.stroke(); for (let k = (y / 26 % 2) * 30; k < p.w; k += 60) { c.beginPath(); c.moveTo(x + k, y - 26); c.lineTo(x + k, y); c.stroke(); } } line(c, x, top, x + p.w, top, OUT, 3); } },
  castletower: { make(r) { return { w: 120, col: wpick(r, ['#e8443a', '#3a6fd8', '#9b5de5', '#ffd23f']) }; }, draw(c, x, p) { const G = GROUND; rrect(c, x + 10, G - 300, 100, 300, 2); paint(c, '#9a96a2', 2.5); for (let k = 0; k < 4; k++) { rrect(c, x + 10 + k * 26, G - 318, 18, 20, 2); paint(c, '#9a96a2', 2); }
    poly(c, [x + 4, G - 318, x + 60, G - 400, x + 116, G - 318]); paint(c, p.col, 2.5); flag(c, x + 60, G - 400, 30, '#ffd23f'); for (const y of [G - 250, G - 170]) { c.beginPath(); c.moveTo(x + 48, y + 34); c.lineTo(x + 48, y + 10); c.arc(x + 60, y + 10, 12, Math.PI, 0); c.lineTo(x + 72, y + 34); c.closePath(); paint(c, '#ffe680', 2); } } },
  gatehouse: { w: 260, draw(c, x) { const G = GROUND; rrect(c, x, G - 250, 260, 250, 2); paint(c, '#9a96a2', 2.5); for (let k = 0; k < 7; k++) { rrect(c, x + k * 38, G - 272, 24, 24, 2); paint(c, '#9a96a2', 2); }
    c.beginPath(); c.moveTo(x + 70, G); c.lineTo(x + 70, G - 120); c.arc(x + 130, G - 120, 60, Math.PI, 0); c.lineTo(x + 190, G); c.closePath(); paint(c, '#2a2140', 2.5); for (let k = 0; k < 6; k++) line(c, x + 80 + k * 20, G - 170, x + 80 + k * 20, G - 60, '#6d6a66', 4); for (let y = G - 160; y < G - 60; y += 25) line(c, x + 74, y, x + 186, y, '#6d6a66', 3);
    rrect(c, x + 100, G - 220, 60, 30, 4); paint(c, '#c0392b', 2); star(c, x + 130, G - 205, 10, 5); paint(c, '#ffd23f', 1.5); } },
  stonewall: { make(r, C, w) { return { w }; }, draw(c, x, p) { c.fillStyle = '#5a5668'; c.fillRect(x, 0, p.w, GROUND); c.strokeStyle = 'rgba(0,0,0,.22)'; c.lineWidth = 2; for (let y = 30; y < GROUND; y += 30) { c.beginPath(); c.moveTo(x, y); c.lineTo(x + p.w, y); c.stroke(); for (let k = (y / 30 % 2) * 35; k < p.w; k += 70) { c.beginPath(); c.moveTo(x + k, y - 30); c.lineTo(x + k, y); c.stroke(); } } } },
  banner: { make(r) { return { w: 80, col: wpick(r, ['#c0392b', '#3a6fd8', '#6a3a8a', '#2e7d5a']) }; }, draw(c, x, p) { const G = GROUND; line(c, x, G - 350, x + 80, G - 350, '#c9a050', 5); poly(c, [x + 10, G - 350, x + 70, G - 350, x + 70, G - 160, x + 40, G - 186, x + 10, G - 160]); paint(c, p.col, 2.5); star(c, x + 40, G - 280, 16, 5); paint(c, '#ffd23f', 2); } },
  pillar: { w: 70, draw(c, x) { const G = GROUND; rrect(c, x + 12, G - 380, 46, 380, 2); paint(c, '#8d8a96', 2.5); rrect(c, x, G - 396, 70, 20, 3); paint(c, '#9a96a2', 2.5); rrect(c, x, G - 20, 70, 20, 3); paint(c, '#9a96a2', 2.5); for (let k = 1; k < 3; k++) line(c, x + 12 + k * 15, G - 376, x + 12 + k * 15, G - 22, 'rgba(0,0,0,.15)', 2); } },
  torch: { w: 40, draw(c, x) { const G = GROUND; rrect(c, x + 14, G - 200, 12, 40, 3); paint(c, '#5a4a3a', 2); ell(c, x + 20, G - 214, 12, 18); paint(c, '#ff9f1c', 2); ell(c, x + 20, G - 208, 6, 10); c.fillStyle = '#ffe680'; c.fill(); } },
  stainedglass: { w: 130, draw(c, x) { const G = GROUND; c.beginPath(); c.moveTo(x + 10, G - 120); c.lineTo(x + 10, G - 280); c.arc(x + 65, G - 280, 55, Math.PI, 0); c.lineTo(x + 120, G - 120); c.closePath(); paint(c, '#3a6fd8', 3); c.save(); c.clip();
    for (let k = 0; k < 14; k++) { poly(c, [x + (k % 4) * 30, G - 340 + Math.floor(k / 4) * 60, x + (k % 4) * 30 + 40, G - 330 + Math.floor(k / 4) * 60, x + (k % 4) * 30 + 20, G - 280 + Math.floor(k / 4) * 60]); c.fillStyle = BRIGHT[k % 7]; c.globalAlpha = 0.8; c.fill(); c.globalAlpha = 1; c.strokeStyle = OUT; c.lineWidth = 2; c.stroke(); } c.restore(); } },
});
// ---------------------------------------------------------------- far layer: continuous bases (span a chapter) and small far things (no outlines, pale)
const FAR = {
  hills: { draw(c, x, p) { const W = p.w; for (const [y0, amp, col, n] of [[330, 60, p.c1 || '#a6dd8a', 0.004], [380, 40, p.c2 || '#8ccf6c', 0.007]]) { c.beginPath(); c.moveTo(x, 470); for (let u = x; u <= x + W + 20; u += 20) c.lineTo(u, y0 - amp * (0.5 + 0.5 * Math.sin(u * n * 3.14))); c.lineTo(x + W + 20, 470); c.closePath(); c.fillStyle = col; c.fill(); } } },
  sea: { draw(c, x, p) { c.fillStyle = '#3fb2d9'; c.fillRect(x, 300, p.w + 2, 170); c.fillStyle = '#62c6e6'; for (let u = Math.ceil(x / 60) * 60; u < x + p.w; u += 60) { ell(c, u + hsh(u) * 30, 320 + hsh(u + 1) * 60, 18, 3); c.fill(); } c.fillStyle = '#f2d08a'; c.fillRect(x, 440, p.w + 2, 30); } },
  fields: { draw(c, x, p) { FAR.hills.draw(c, x, { w: p.w, c1: '#b8e07a', c2: '#a6d870' }); for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#e8d27a' : '#9fd36a'; c.fillRect(x, 360 + i * 18, p.w + 2, 18); } } },
  skyline: { draw(c, x, p) { for (let u = Math.floor(x / 70) * 70; u < x + p.w; u += 70) { const h = 120 + hsh(u * 0.13) * 220; c.fillStyle = ['#9db3d8', '#b0c2e2', '#8aa2cc'][Math.floor(hsh(u) * 3)]; c.fillRect(u, 460 - h, 62, h); c.fillStyle = 'rgba(255,255,255,.35)'; for (let y = 470 - h; y < 440; y += 22) for (let q = 8; q < 54; q += 16) c.fillRect(u + q, y, 8, 10); } } },
  airfield: { draw(c, x, p) { FAR.hills.draw(c, x, { w: p.w, c1: '#b8d8a0', c2: '#a8c890' }); c.fillStyle = '#c8d2de'; c.fillRect(x, 400, p.w + 2, 70); c.fillStyle = '#fff'; for (let u = Math.ceil(x / 80) * 80; u < x + p.w; u += 80) c.fillRect(u, 430, 40, 4); } },
  fair: { draw(c, x, p) { FAR.hills.draw(c, x, { w: p.w, c1: '#f0c8d8', c2: '#e8b8c8' }); c.fillStyle = '#e8c08a'; c.fillRect(x, 430, p.w + 2, 40); } },
  swamp: { draw(c, x, p) { FAR.hills.draw(c, x, { w: p.w, c1: '#4a5a3a', c2: '#3a4a2a' }); c.fillStyle = 'rgba(190,210,170,.25)'; for (let u = Math.floor(x / 160) * 160; u < x + p.w; u += 160) { ell(c, u + 80, 390, 110, 16); c.fill(); } } },
  // small far things
  f_house: { make(r) { return { w: 64, col: wpick(r, WALLS), roof: wpick(r, ROOFS), h: wrr(r, 36, 56) }; }, draw(c, x, p) { c.globalAlpha = 0.85; c.fillStyle = p.col; c.fillRect(x, FH - p.h, 60, p.h); c.fillStyle = p.roof; poly(c, [x - 6, FH - p.h, x + 30, FH - p.h - 26, x + 66, FH - p.h]); c.fill(); c.fillStyle = '#bfe7ff'; c.fillRect(x + 10, FH - p.h + 10, 12, 12); c.fillRect(x + 38, FH - p.h + 10, 12, 12); c.globalAlpha = 1; } },
  f_trees: { make(r) { return { w: 90, n: 2 + Math.floor(r() * 3), col: wpick(r, ['#6fbf55', '#5cb048', '#7ccb60']) }; }, draw(c, x, p) { c.fillStyle = p.col; for (let k = 0; k < p.n; k++) { circ(c, x + 20 + k * 22, FH - 16 - (k % 2) * 10, 22); c.fill(); } } },
  f_pines: { make(r) { return { w: 80 }; }, draw(c, x) { c.fillStyle = '#4f9a50'; for (let k = 0; k < 3; k++) { poly(c, [x + k * 24, FH, x + 14 + k * 24, FH - 60 - (k % 2) * 16, x + 28 + k * 24, FH]); c.fill(); } } },
  f_steeple: { w: 60, draw(c, x) { c.fillStyle = '#f4f4f4'; c.fillRect(x + 10, FH - 70, 40, 70); poly(c, [x + 8, FH - 70, x + 30, FH - 130, x + 52, FH - 70]); c.fillStyle = '#d27a62'; c.fill(); c.fillStyle = '#aaa'; c.fillRect(x + 29, FH - 146, 2, 18); } },
  f_watertower: { w: 60, draw(c, x) { c.fillStyle = '#b8c8d8'; c.fillRect(x + 14, FH - 60, 4, 60); c.fillRect(x + 42, FH - 60, 4, 60); ell(c, x + 30, FH - 74, 26, 18); c.fill(); } },
  f_tower: { make(r) { return { w: 70, h: wrr(r, 230, 330), col: wpick(r, ['#8aa2cc', '#9db3d8', '#7f98c4']) }; }, draw(c, x, p) { c.fillStyle = p.col; c.fillRect(x, 460 - p.h, 60, p.h); c.fillRect(x + 28, 460 - p.h - 40, 4, 40); c.fillStyle = 'rgba(255,255,255,.4)'; for (let y = 470 - p.h; y < 440; y += 18) c.fillRect(x + 6, y, 48, 6); } },
  f_crane: { w: 150, draw(c, x) { c.strokeStyle = '#e8b820'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 30, 460); c.lineTo(x + 30, 140); c.moveTo(x - 10, 146); c.lineTo(x + 150, 146); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(x + 120, 146); c.lineTo(x + 120, 220); c.stroke(); } },
  f_boat: { make(r) { return { w: 60, col: wpick(r, ['#fff', '#ffe0e0', '#e0f0ff']) }; }, draw(c, x, p) { const y = 330 + hsh(x) * 60; c.fillStyle = p.col; poly(c, [x, y, x + 30, y, x + 15, y - 40]); c.fill(); c.fillStyle = '#8a5a2b'; c.fillRect(x - 6, y, 42, 6); } },
  f_island: { w: 220, draw(c, x) { ell(c, x + 110, 304, 110, 24); c.fillStyle = '#6fbf55'; c.fill(); c.fillStyle = '#5cb048'; circ(c, x + 80, 288, 18); c.fill(); circ(c, x + 120, 282, 22); c.fill(); } },
  f_lighthouse: { w: 50, draw(c, x) { const y = 300; c.fillStyle = '#fff'; poly(c, [x + 10, y, x + 16, y - 90, x + 34, y - 90, x + 40, y]); c.fill(); c.fillStyle = '#e8443a'; c.fillRect(x + 13, y - 60, 24, 14); c.fillRect(x + 15, y - 90, 20, 10); c.fillStyle = '#ffe680'; c.fillRect(x + 17, y - 106, 16, 16); } },
  f_barn: { w: 80, draw(c, x) { c.globalAlpha = 0.85; c.fillStyle = '#c0392b'; poly(c, [x, FH, x, FH - 40, x + 40, FH - 66, x + 80, FH - 40, x + 80, FH]); c.fill(); c.fillStyle = '#fff'; c.fillRect(x + 30, FH - 30, 20, 30); c.globalAlpha = 1; } },
  f_silo: { w: 34, draw(c, x) { c.fillStyle = '#c9ced8'; c.fillRect(x, FH - 90, 30, 90); circ(c, x + 15, FH - 90, 15); c.fill(); } },
  f_windmill: { w: 70, draw(c, x) { c.strokeStyle = '#fff'; c.lineWidth = 6; c.beginPath(); c.moveTo(x + 35, FH); c.lineTo(x + 35, FH - 120); c.stroke(); c.lineWidth = 5; c.beginPath(); for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3; c.moveTo(x + 35, FH - 120); c.lineTo(x + 35 + Math.cos(a) * 36, FH - 120 + Math.sin(a) * 36); } c.stroke(); } },
  f_ferris: { w: 150, draw(c, x) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; circ(c, x + 75, FH - 90, 70); c.stroke(); c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.moveTo(x + 75, FH - 90); c.lineTo(x + 75 + Math.cos(a) * 70, FH - 90 + Math.sin(a) * 70); } c.moveTo(x + 40, FH); c.lineTo(x + 75, FH - 90); c.lineTo(x + 110, FH); c.stroke(); } },
  f_tent: { make(r) { return { w: 110, col: wpick(r, ['#ff9fc0', '#9fd8ff', '#ffe08a', '#c8f0a0']) }; }, draw(c, x, p) { c.globalAlpha = 0.85; c.fillStyle = p.col; poly(c, [x, 430, x + 55, 430 - wrr(() => hsh(x), 70, 120), x + 110, 430]); c.fill(); c.globalAlpha = 1; } },
  f_ctower: { w: 50, draw(c, x) { c.fillStyle = '#c8d2de'; c.fillRect(x + 18, FH - 130, 14, 130); c.fillStyle = '#7fc0e8'; c.fillRect(x + 4, FH - 156, 42, 26); } },
  f_hangar: { w: 140, draw(c, x) { c.fillStyle = '#b8c4d4'; c.beginPath(); c.moveTo(x, FH + 10); c.quadraticCurveTo(x + 70, FH - 120, x + 140, FH + 10); c.fill(); } },
  f_castle: { w: 260, draw(c, x) { c.fillStyle = '#2a2040'; c.fillRect(x + 20, 220, 220, 240); for (const [dx, h] of [[0, 260], [100, 330], [200, 270]]) { c.fillRect(x + dx, 460 - h, 60, h); poly(c, [x + dx - 6, 460 - h, x + dx + 30, 400 - h, x + dx + 66, 460 - h]); c.fill(); } c.fillStyle = '#ffe680'; for (let k = 0; k < 8; k++) c.fillRect(x + 40 + (k * 61) % 180, 250 + (k * 37) % 150, 9, 14); } },
  f_deadtree: { w: 60, draw(c, x) { c.strokeStyle = '#2e3a20'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 30, FH + 10); c.lineTo(x + 32, FH - 90); c.moveTo(x + 31, FH - 50); c.lineTo(x + 10, FH - 80); c.moveTo(x + 32, FH - 70); c.lineTo(x + 54, FH - 96); c.stroke(); } },
  f_mount: { w: 300, draw(c, x) { c.fillStyle = '#b8c8e0'; poly(c, [x, 380, x + 150, 200, x + 300, 380]); c.fill(); c.fillStyle = '#fff'; poly(c, [x + 115, 234, x + 150, 200, x + 185, 234, x + 160, 226, x + 150, 240]); c.fill(); } },
  f_bigtop: { w: 200, draw(c, x) { c.globalAlpha = 0.8; c.fillStyle = '#ff8f8f'; poly(c, [x, 430, x + 100, 300, x + 200, 430]); c.fill(); c.globalAlpha = 1; } },
  f_coaster: { w: 220, draw(c, x) { c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, 420); c.bezierCurveTo(x + 40, 250, x + 90, 250, x + 120, 380); c.bezierCurveTo(x + 150, 450, x + 180, 300, x + 220, 400); c.stroke(); } },
};
// ---------------------------------------------------------------- ground styles (top band, middle band, fill, seam, detail theme for drawGroundDetail, extra decoration)
const GSTY = {
  sidewalk: { top: '#a7afb9', mid: '#6cc04a', fill: '#5aa83c', seam: '#8e96a0', det: 'street' },
  lawn: { top: '#7ed957', mid: '#c8925a', fill: '#b37d47', seam: '#5fb33f', det: 'park' },
  mulch: { top: '#c98a55', mid: '#a8743f', fill: '#8a5a2b', seam: '#b07a45', det: 'x', ex: 'chips' },
  gravel: { top: '#d8cfc0', mid: '#c8925a', fill: '#b37d47', seam: '#bdb3a2', det: 'x', ex: 'dots' },
  road: { top: '#b8bec7', mid: '#4c4f58', fill: '#3f424a', seam: '#9aa1ab', det: 'street', ex: 'dash' },
  site: { top: '#c9a06a', mid: '#a8743f', fill: '#8a5a2b', seam: '#b8905a', det: 'x', ex: 'dots' },
  boardwalk: { top: '#c98a55', mid: '#efcf7f', fill: '#e6c06c', seam: '#8a5a2b', det: 'x', ex: 'planks' },
  sand: { top: '#f6dc96', mid: '#efcf7f', fill: '#e6c06c', seam: '#e0c27a', det: 'beach' },
  dock: { top: '#9a7a5a', mid: '#3a8cc0', fill: '#2a6a98', seam: '#6a4a2a', det: 'x', ex: 'planks' },
  farm: { top: '#86d65a', mid: '#a8743f', fill: '#966534', seam: '#6ab843', det: 'farm' },
  dirt: { top: '#c9a06a', mid: '#a8743f', fill: '#966534', seam: '#b08a55', det: 'farm' },
  schoolwalk: { top: '#8a8f99', mid: '#6cc04a', fill: '#5aa83c', seam: '#767b85', det: 'school' },
  blacktop: { top: '#5a5f68', mid: '#45484f', fill: '#3a3d44', seam: '#6a6f78', det: 'street', ex: 'games' },
  sport: { top: '#5fc44a', mid: '#4caf3a', fill: '#7a5236', seam: '#4fb03a', det: 'park', ex: 'line' },
  track: { top: '#d9653b', mid: '#5fc44a', fill: '#7a5236', seam: '#c0552f', det: 'x', ex: 'lanes' },
  tarmac: { top: '#9aa1ab', mid: '#5a5e68', fill: '#4a4e57', seam: '#848a94', det: 'airport', ex: 'white' },
  carnival: { top: '#e8c78a', mid: '#d6ad6a', fill: '#c49a5a', seam: '#d4b070', det: 'carnival' },
  platform: { top: '#c4c8ce', mid: '#7a6a5a', fill: '#5a4e44', seam: '#ffd23f', det: 'station', ex: 'rails' },
  railyard: { top: '#9a948a', mid: '#7a6a5a', fill: '#5a4e44', seam: '#8a847a', det: 'x', ex: 'rails' },
  hall: { top: '#e8dcc8', mid: '#c8b89a', fill: '#a89878', seam: '#c0b090', det: 'x', ex: 'tiles' },
  swamp: { top: '#5a7a32', mid: '#3c4a28', fill: '#2e3a20', seam: '#4a6a28', det: 'swamp' },
  cobble: { top: '#8d8a86', mid: '#6d6a66', fill: '#4d4a46', seam: '#77736e', det: 'x', ex: 'stones' },
  throne: { top: '#9a96a2', mid: '#6d6a76', fill: '#4d4a56', seam: '#86828e', det: 'x', ex: 'carpet' },
};
// ---------------------------------------------------------------- chapters: g ground, fb far base, f far things, m mid things (random order, never the same twice in a row),
// lm landmark (placed mid-chapter), u spanning things drawn first (wall, water, lights, canopy), p props, gap between mid things
const CH = {
  // Sunny Street
  homes: { g: 'sidewalk', fb: 'hills', f: ['f_house', 'f_trees', 'f_house', 'f_steeple'], m: ['house', 'house', 'house', 'tree', 'hedge', 'mailboxes'], p: ['lamp', 'bush', 'mailbox', 'flowers'] },
  gardens: { g: 'sidewalk', fb: 'hills', f: ['f_house', 'f_trees', 'f_watertower'], m: ['house', 'house', 'flowerbed', 'tree', 'picket', 'gardenbed'], p: ['flowers', 'bush', 'mailbox'] },
  pocketpark: { g: 'lawn', fb: 'hills', f: ['f_trees', 'f_house', 'f_trees'], m: ['tree', 'tree', 'hedge', 'flowerbed'], lm: 'playset', p: ['bench', 'flowers', 'bush'] },
  garages: { g: 'sidewalk', fb: 'hills', f: ['f_house', 'f_trees', 'f_pines'], m: ['house', 'house', 'tree', 'hedge', 'dirtpile'], p: ['bush', 'mailbox', 'lamp'] },
  lakeside: { g: 'lawn', fb: 'hills', f: ['f_pines', 'f_trees', 'f_mount'], u: ['waterstrip'], m: ['tree', 'willow', 'reeds', 'tree'], lm: 'boathouse', p: ['bush', 'bench'] },
  busstop: { g: 'road', fb: 'skyline', f: ['f_tower'], m: ['shop', 'apartment', 'tree', 'lamppost'], p: ['lamp', 'bench', 'planter'] },
  shops: { g: 'road', fb: 'hills', f: ['f_house', 'f_steeple', 'f_trees'], m: ['shop', 'shop', 'shop', 'lamppost', 'tree'], p: ['planter', 'lamp', 'bench'] },
  market: { g: 'cobble', fb: 'hills', f: ['f_house', 'f_steeple'], m: ['fishstall', 'farmstand_bg', 'shop', 'tree'], p: ['planter', 'flowers', 'bench'] },
  // Puddle Park
  parkgate: { g: 'lawn', fb: 'hills', f: ['f_trees', 'f_trees', 'f_watertower'], m: ['tree', 'tree', 'hedge', 'flowerbed'], lm: 'gate', sign: 'PUDDLE PARK', p: ['bench', 'flowers', 'lamp'] },
  play: { g: 'mulch', fb: 'hills', f: ['f_trees', 'f_house'], m: ['playset', 'tree', 'shelter', 'tree'], p: ['bench', 'bush'] },
  picnic: { g: 'lawn', fb: 'hills', f: ['f_trees', 'f_pines'], m: ['shelter', 'tree', 'tree', 'hedge'], p: ['bench', 'flowers', 'bush'] },
  pondside: { g: 'lawn', fb: 'hills', f: ['f_trees', 'f_pines', 'f_steeple'], u: ['waterstrip'], m: ['willow', 'reeds', 'tree', 'reeds', 'willow'], lm: 'boathouse', p: ['bench', 'bush', 'flowers'] },
  gardengate: { g: 'gravel', fb: 'hills', f: ['f_trees', 'f_house'], m: ['hedge', 'flowerbed', 'topiaryrow', 'tree'], lm: 'gate', sign: 'GARDENS', p: ['flowers', 'bench'] },
  flowerbeds: { g: 'gravel', fb: 'hills', f: ['f_trees', 'f_windmill'], m: ['flowerbed', 'flowerbed', 'hedge', 'topiaryrow', 'tree'], p: ['flowers', 'sunflower', 'bench'] },
  glasshouses: { g: 'gravel', fb: 'hills', f: ['f_trees'], m: ['greenhouse_bg', 'gardenbed', 'tree', 'flowerbed'], p: ['flowers', 'bush'] },
  // Big City
  downtown: { g: 'road', fb: 'skyline', f: ['f_tower', 'f_tower'], m: ['apartment', 'shop', 'office', 'shop', 'lamppost'], p: ['lamp', 'planter', 'bench'] },
  cityplaza: { g: 'cobble', fb: 'skyline', f: ['f_tower'], m: ['tree', 'office', 'apartment', 'tree'], lm: 'plaza', p: ['bench', 'planter', 'lamp'] },
  offices: { g: 'road', fb: 'skyline', f: ['f_tower', 'f_crane'], m: ['office', 'office', 'apartment', 'lamppost'], p: ['lamp', 'planter'] },
  sitefence: { g: 'site', fb: 'skyline', f: ['f_crane', 'f_tower'], m: ['hoarding', 'hoarding', 'dirtpile', 'apartment'], p: ['cone', 'lamp'] },
  girders: { g: 'site', fb: 'skyline', f: ['f_crane', 'f_crane', 'f_tower'], m: ['girders', 'dirtpile', 'girders', 'hoarding'], lm: 'bigcrane', p: ['cone', 'cone'] },
  firehq: { g: 'road', fb: 'skyline', f: ['f_tower'], m: ['apartment', 'tree', 'lamppost'], lm: 'firestation_bg', p: ['lamp', 'bench'] },
  helpers: { g: 'road', fb: 'skyline', f: ['f_tower'], m: ['police_bg', 'hospital_bg', 'tree', 'lamppost', 'apartment'], p: ['lamp', 'planter'] },
  // Sandy Beach
  boardwalk: { g: 'boardwalk', fb: 'sea', f: ['f_boat', 'f_island', 'f_boat'], m: ['boardshop', 'boardshop', 'palm', 'beachhut'], p: ['umbrella', 'dunegrass'] },
  pier: { g: 'boardwalk', fb: 'sea', f: ['f_boat', 'f_lighthouse', 'f_boat'], m: ['palm', 'beachhut', 'boardshop'], lm: 'pier_bg', p: ['umbrella', 'sandcastle'] },
  docks: { g: 'dock', fb: 'sea', f: ['f_boat', 'f_lighthouse', 'f_island'], u: ['waterstrip'], m: ['boatmoored', 'boatmoored', 'warehouse', 'fishstall'], lm: 'dockcrane', p: ['lamp'] },
  marina: { g: 'dock', fb: 'sea', f: ['f_boat', 'f_boat', 'f_island'], u: ['waterstrip'], m: ['boatmoored', 'boatmoored', 'boatmoored', 'palm'], p: ['lamp'] },
  dunes: { g: 'sand', fb: 'sea', f: ['f_boat', 'f_island'], m: ['dune', 'dune', 'umbrellaset', 'palm'], p: ['dunegrass', 'sandcastle'] },
  beachday: { g: 'sand', fb: 'sea', f: ['f_boat', 'f_boat'], m: ['umbrellaset', 'umbrellaset', 'palm', 'beachhut'], lm: 'lifehut', p: ['sandcastle', 'umbrella'] },
  bluffs: { g: 'sand', fb: 'sea', f: ['f_lighthouse', 'f_boat'], m: ['cliffs', 'dune', 'palm'], p: ['dunegrass'] },
  // Happy Farm
  farmyard: { g: 'farm', fb: 'fields', f: ['f_barn', 'f_silo', 'f_trees'], m: ['house', 'tree', 'railfence', 'coop_bg'], lm: 'barn_bg', p: ['fence', 'sunflower', 'bush'] },
  pasture: { g: 'farm', fb: 'fields', f: ['f_barn', 'f_windmill', 'f_trees'], m: ['cow_bg', 'railfence', 'cow_bg', 'tree', 'hayroll'], p: ['fence', 'bush'] },
  corn: { g: 'dirt', fb: 'fields', f: ['f_silo', 'f_windmill'], m: ['cornrow', 'cornrow', 'scarecrow_bg', 'cornrow'], p: ['sunflower', 'fence'] },
  harvest: { g: 'dirt', fb: 'fields', f: ['f_barn', 'f_silo'], m: ['hayroll', 'pumpkins', 'railfence', 'hayroll'], lm: 'windmill_bg', p: ['sunflower', 'fence'] },
  orchard: { g: 'farm', fb: 'fields', f: ['f_trees', 'f_barn'], m: ['fruittree', 'fruittree', 'fruittree', 'railfence'], p: ['bush', 'fence'] },
  farmshop: { g: 'farm', fb: 'fields', f: ['f_silo', 'f_barn'], m: ['farmstand_bg', 'fruittree', 'silo_bg', 'pumpkins'], lm: 'barn_bg', p: ['sunflower', 'fence'] },
  // Sudsy School
  dropoff: { g: 'schoolwalk', fb: 'hills', f: ['f_house', 'f_trees'], m: ['busparked', 'busparked', 'tree', 'lamppost'], p: ['bush', 'lamp'] },
  schoolfront: { g: 'schoolwalk', fb: 'hills', f: ['f_trees', 'f_watertower'], m: ['tree', 'hedge', 'flowerbed'], lm: 'school_bg', p: ['bush', 'bench', 'flowers'] },
  classrooms: { g: 'schoolwalk', fb: 'hills', f: ['f_trees', 'f_house'], m: ['classwing', 'tree', 'classwing', 'hedge'], p: ['bush', 'bench'] },
  schoolgarden: { g: 'lawn', fb: 'hills', f: ['f_trees'], m: ['gardenbed', 'gardenbed', 'greenhouse_bg', 'tree'], p: ['flowers', 'sunflower'] },
  playyard: { g: 'blacktop', fb: 'hills', f: ['f_trees', 'f_house'], m: ['chainfence', 'playset', 'chainfence', 'tree'], p: ['bench', 'bush'] },
  bigfield: { g: 'sport', fb: 'hills', f: ['f_trees', 'f_pines'], m: ['bleachers_bg', 'goalframe', 'chainfence', 'tree'], p: ['fence', 'bench'] },
  trackside: { g: 'track', fb: 'hills', f: ['f_trees', 'f_watertower'], m: ['bleachers_bg', 'chainfence', 'tree'], p: ['bench', 'fence'] },
  // Busy Airport
  apron: { g: 'tarmac', fb: 'airfield', f: ['f_ctower', 'f_hangar', 'f_trees'], m: ['plane_bg', 'windsock', 'fueltank_bg', 'plane_bg'], p: ['cone', 'lamp'] },
  towerside: { g: 'tarmac', fb: 'airfield', f: ['f_hangar', 'f_trees'], m: ['plane_bg', 'windsock'], lm: 'ctower_bg', p: ['cone'] },
  hangars: { g: 'tarmac', fb: 'airfield', f: ['f_ctower', 'f_trees'], m: ['hangar_bg', 'fueltank_bg', 'hangar_bg', 'windsock'], p: ['cone', 'cone', 'lamp'] },
  terminal: { g: 'tarmac', fb: 'airfield', f: ['f_ctower', 'f_hangar'], m: ['jetbridge', 'plane_bg', 'tree'], lm: 'terminal_bg', p: ['lamp', 'bench', 'planter'] },
  // Carnival
  fairgate: { g: 'carnival', fb: 'fair', f: ['f_ferris', 'f_tent', 'f_coaster'], u: ['lights'], m: ['tentc', 'foodstall', 'tentc'], lm: 'gate', sign: 'CARNIVAL', p: ['balloons', 'lamp'] },
  rides: { g: 'carnival', fb: 'fair', f: ['f_tent', 'f_coaster', 'f_tent'], u: ['lights'], m: ['tentc', 'foodstall', 'coaster_bg'], lm: 'ferris_bg', p: ['balloons', 'lamp', 'flowers'] },
  midway: { g: 'carnival', fb: 'fair', f: ['f_ferris', 'f_tent'], u: ['lights'], m: ['booth', 'booth', 'foodstall', 'booth'], p: ['balloons', 'lamp'] },
  circus: { g: 'carnival', fb: 'fair', f: ['f_tent', 'f_ferris'], m: ['circuswagon', 'tentc', 'circuswagon'], lm: 'bigtop_bg', p: ['balloons', 'flowers'] },
  // Train Station
  depot: { g: 'platform', fb: 'skyline', f: ['f_tower', 'f_steeple'], m: ['tree', 'lamppost'], lm: 'stationbldg', p: ['lamp', 'bench'] },
  platforms: { g: 'platform', fb: 'skyline', f: ['f_tower'], u: ['canopy'], m: ['traincar_bg', 'traincar_bg', 'signalpost', 'kiosk'], p: ['bench', 'lamp'] },
  freight: { g: 'railyard', fb: 'hills', f: ['f_silo', 'f_crane', 'f_pines'], m: ['containers', 'containers', 'warehouse', 'signalpost'], lm: 'rrtower', p: ['cone'] },
  ticket: { g: 'hall', fb: 'skyline', f: [], u: ['hallwall'], m: ['archwin', 'kiosk', 'archwin', 'boardsign'], lm: 'bigclock', p: ['bench', 'planter'] },
  // Sludge Castle
  bog: { g: 'swamp', fb: 'swamp', f: ['f_deadtree', 'f_deadtree', 'f_castle'], m: ['deadtree_bg', 'bogwillow', 'bogpool', 'deadtree_bg', 'reeds'], p: ['deadtree', 'mushrooms', 'lantern'] },
  bogvillage: { g: 'swamp', fb: 'swamp', f: ['f_deadtree', 'f_castle'], m: ['hutstilts', 'bogwillow', 'deadtree_bg', 'bogpool'], p: ['lantern', 'mushrooms'] },
  ramparts: { g: 'cobble', fb: 'swamp', f: ['f_deadtree', 'f_castle'], u: ['castlewall'], m: ['castletower', 'torch', 'banner'], p: ['lantern'] },
  gateway: { g: 'cobble', fb: 'swamp', f: ['f_castle'], u: ['castlewall'], m: ['castletower', 'torch'], lm: 'gatehouse', p: ['lantern'] },
  greathall: { g: 'throne', fb: 'swamp', f: [], u: ['stonewall'], m: ['pillar', 'banner', 'torch', 'stainedglass', 'pillar', 'banner'], p: ['lantern'] },
};
// scene name -> its chapters in walking order
const WORLD = {
  'Sunny Street': ['homes', 'gardens', 'homes', 'pocketpark', 'homes', 'gardens'],
  'Garage Lane': ['garages', 'homes', 'garages', 'gardens', 'lakeside'],
  'Corner Market': ['homes', 'busstop', 'shops', 'market', 'shops'],
  'Playground': ['parkgate', 'play', 'picnic', 'play', 'picnic'],
  'Duck Pond': ['parkgate', 'pondside', 'picnic', 'pondside', 'pondside'],
  'Flower Garden': ['gardengate', 'flowerbeds', 'glasshouses', 'flowerbeds'],
  'Downtown': ['shops', 'downtown', 'cityplaza', 'offices', 'downtown'],
  'Construction Site': ['downtown', 'sitefence', 'girders', 'sitefence', 'girders'],
  'Fire Station': ['downtown', 'firehq', 'helpers', 'downtown'],
  'Boardwalk': ['beachday', 'boardwalk', 'pier', 'boardwalk', 'beachday'],
  'Harbor': ['boardwalk', 'docks', 'marina', 'docks', 'bluffs'],
  'Sand Dunes': ['dunes', 'beachday', 'bluffs', 'dunes'],
  'Barnyard': ['farmyard', 'pasture', 'farmyard', 'pasture', 'harvest'],
  'Corn Fields': ['corn', 'harvest', 'corn', 'pasture', 'corn'],
  'Orchard': ['orchard', 'farmshop', 'orchard', 'harvest'],
  'Schoolyard': ['dropoff', 'schoolfront', 'classrooms', 'schoolgarden', 'playyard', 'bigfield'],
  'Recess': ['classrooms', 'playyard', 'schoolgarden', 'playyard', 'bigfield'],
  'Sports Field': ['dropoff', 'bigfield', 'trackside', 'bigfield'],
  'Runway': ['terminal', 'apron', 'towerside', 'apron', 'apron'],
  'Hangar': ['apron', 'hangars', 'towerside', 'hangars'],
  'Terminal': ['terminal', 'apron', 'terminal', 'towerside'],
  'Big Rides': ['fairgate', 'rides', 'midway', 'rides', 'rides'],
  'Game Alley': ['midway', 'midway', 'rides', 'midway', 'circus'],
  'Big Top': ['midway', 'circus', 'rides', 'circus'],
  'Platform 9': ['depot', 'platforms', 'platforms', 'freight', 'platforms'],
  'Freight Yard': ['platforms', 'freight', 'freight', 'freight', 'depot'],
  'Ticket Hall': ['depot', 'ticket', 'ticket', 'platforms'],
  'Stinky Swamp': ['bog', 'bogvillage', 'bog', 'bogvillage', 'bog'],
  'Castle Gate': ['bog', 'ramparts', 'gateway', 'ramparts', 'gateway'],
  'Throne Room': ['gateway', 'greathall', 'greathall', 'greathall'],
};
// ---------------------------------------------------------------- building a level's world
function buildWorld(L, W) {
  const chs = WORLD[L.name]; if (!chs) return null;
  const r = rng(Math.floor(Math.random() * 1e9)), n = chs.length, len = L.len, off = W * 0.42;
  const world = { tick: 0, made: 0, ch: [], ground: [], far: { par: 0.15, S: 1, items: [], cache: new Map() }, mid: { par: 0.45, S: 1.25, items: [], cache: new Map() } };
  const span = (x, par, i) => i === 0 ? 0 : x * par + off;
  const end = (x, par, i) => i === n - 1 ? len * par + W + 100 : x * par + off;
  const add = (layer, lib, k, x, C, w) => { const def = lib[k], p = def.make ? def.make(r, C, w) : {}; layer.items.push({ lib, k, x, w: w || p.w || def.w, p }); return w || p.w || def.w; };
  chs.forEach((key, i) => {
    const C = CH[key], x0 = i * len / n, x1 = (i + 1) * len / n;
    world.ch.push({ x0, x1, C }); world.ground.push([x0, x1, C.g]);
    // far: base, then small far things
    let a = span(x0, 0.15, i), b = end(x1, 0.15, i);
    add(world.far, FAR, C.fb, a, C, b - a);
    for (let u = a + wrr(r, 0, 80); C.f.length && u < b - 40;) u += add(world.far, FAR, wpick(r, C.f), u, C) + wrr(r, 40, 170);
    // mid: spanning things, landmark in the middle, the rest in random order
    a = span(x0, 0.45, i); b = end(x1, 0.45, i);
    for (const k of (C.u || [])) add(world.mid, BGI, k, a, C, b - a);
    const lmAt = C.lm ? (a + b) / 2 - 150 : Infinity; let lm = !C.lm, last = '';
    for (let u = a + wrr(r, 10, 60); u < b - 60;) {
      let k;
      if (!lm && u >= lmAt - 200) { k = C.lm; lm = true; }
      else { do k = wpick(r, C.m); while (C.m.length > 1 && k === last); }
      last = k; u += add(world.mid, BGI, k, u, C) + wrr(r, 16, 60);
    }
  });
  return world;
}
function worldChapter(world, x) { for (const ch of world.ch) if (x < ch.x1) return ch; return world.ch[world.ch.length - 1]; }
// one 800-wide piece of a layer, drawn the first time it is needed (at most one extra piece per frame ahead of time)
function layerChunk(world, Ly, k, must) {
  let cv = Ly.cache.get(k);
  if (cv) { cv.used = world.tick; return cv; }
  if (!must && world.made > 0) return null;
  world.made++;
  cv = mkCanvas(WCH * Ly.S, 470 * Ly.S); const c = cv.getContext('2d');
  c.scale(Ly.S, Ly.S); c.translate(-k * WCH, 0); c.lineJoin = 'round'; c.lineCap = 'round';
  const a = k * WCH - 90, b = (k + 1) * WCH + 90;
  for (const it of Ly.items) if (it.x < b && it.x + it.w > a) it.lib[it.k].draw(c, it.x, Object.assign({ w: it.w }, it.p));
  cv.used = world.tick; Ly.cache.set(k, cv);
  if (Ly.cache.size > 6) { let old = null; for (const [kk, v] of Ly.cache) if (!old || v.used < old[1].used) old = [kk, v]; Ly.cache.delete(old[0]); }
  return cv;
}
function drawWorldLayers(c, world, camX, W) {
  world.tick++; world.made = 0;
  for (const Ly of [world.far, world.mid]) {
    const u0 = camX * Ly.par, k0 = Math.floor(u0 / WCH), k1 = Math.floor((u0 + W) / WCH), base = Math.round(-u0);
    for (let k = k0; k <= k1; k++) c.drawImage(layerChunk(world, Ly, k, true), base + k * WCH, 0, WCH, 470);
    layerChunk(world, Ly, k1 + 1, false);
  }
}
// ground: each chapter's own style, with its decorations
function groundExtra(c, ex, a, b) {
  const G = GROUND, from = s => Math.floor(a / s) * s;
  if (ex === 'dash') { c.fillStyle = '#ffd23f'; for (let x = from(120); x < b; x += 120) c.fillRect(x, G + 33, 50, 5); }
  else if (ex === 'white') { c.fillStyle = '#fff'; for (let x = from(160); x < b; x += 160) c.fillRect(x, G + 33, 80, 6); }
  else if (ex === 'rails') { c.fillStyle = '#ffd23f'; c.fillRect(a, G + 12, b - a, 5); c.fillStyle = '#3a3030'; for (let x = from(40); x < b; x += 40) c.fillRect(x, G + 30, 14, 26); c.fillStyle = '#9aa1ab'; c.fillRect(a, G + 34, b - a, 6); c.fillRect(a, G + 48, b - a, 4); }
  else if (ex === 'chips' || ex === 'dots') { for (let x = from(14); x < b; x += 14) { const h = hsh(x * 0.31); c.fillStyle = ex === 'chips' ? (h < 0.5 ? '#e0a870' : '#7a4a28') : (h < 0.5 ? '#fff' : '#9a948a'); c.fillRect(x + h * 8, G + 4 + hsh(x) * 10, ex === 'chips' ? 7 : 3, 3); } }
  else if (ex === 'planks') { for (let x = from(32); x < b; x += 32) { line(c, x, G + 1, x, G + 18, 'rgba(60,30,10,.45)', 2); circ(c, x + 6, G + 9, 1.5); c.fillStyle = '#5a3a22'; c.fill(); } }
  else if (ex === 'games') { for (let x = from(260); x < b; x += 260) for (let q = 0; q < 4; q++) { c.fillStyle = ['#ffd23f', '#fff', '#3a8cf0', '#ff7eb6'][q]; c.fillRect(x + q * 26, G + 5, 20, 7); } }
  else if (ex === 'line') { c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(a, G + 7, b - a, 3); }
  else if (ex === 'lanes') { c.fillStyle = '#fff'; c.fillRect(a, G + 5, b - a, 2); c.fillRect(a, G + 11, b - a, 2); }
  else if (ex === 'tiles') { for (let x = from(24); x < b; x += 24) { c.fillStyle = (x / 24) % 2 ? '#d8c8a8' : '#f4ecdc'; c.fillRect(x, G + 1, 24, 17); } }
  else if (ex === 'stones') { for (let x = from(22); x < b; x += 22) { ell(c, x + 11, G + 9, 9, 6); c.fillStyle = hsh(x) < 0.5 ? '#9a968e' : '#827e78'; c.fill(); c.strokeStyle = 'rgba(0,0,0,.2)'; c.lineWidth = 1.5; c.stroke(); } }
  else if (ex === 'carpet') { c.fillStyle = '#b0302a'; c.fillRect(a, G + 1, b - a, 16); c.fillStyle = '#e8c050'; c.fillRect(a, G + 1, b - a, 3); c.fillRect(a, G + 14, b - a, 3); }
}
function drawWorldGround(c, world, x0, W) {
  for (const [a, b, g] of world.ground) {
    if (b < x0 - 20 || a > x0 + W + 20) continue;
    const st = GSTY[g], s0 = Math.max(a, x0 - 10), s1 = Math.min(b, x0 + W + 10);
    c.save(); c.beginPath(); c.rect(s0, GROUND - 60, s1 - s0, 220); c.clip();
    c.fillStyle = st.fill; c.fillRect(s0, GROUND, s1 - s0, 140);
    c.fillStyle = st.mid; c.fillRect(s0, GROUND + 18, s1 - s0, 34);
    c.fillStyle = st.top; c.fillRect(s0, GROUND, s1 - s0, 18);
    c.strokeStyle = st.seam; c.lineWidth = 2; c.beginPath();
    for (let x = Math.floor(s0 / 60) * 60; x < s1 + 60; x += 60) { c.moveTo(x, GROUND + 2); c.lineTo(x - 6, GROUND + 18); }
    c.stroke();
    if (st.ex) groundExtra(c, st.ex, s0, s1);
    c.fillStyle = OUT; c.fillRect(s0, GROUND - 1, s1 - s0, 3);
    drawGroundDetail(c, st.det, s0, s1 - s0);
    c.restore();
  }
}
