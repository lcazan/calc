'use strict';
// Super Splash: game engine (dirt, player, spraying, enemies, boss, drawing the level)
const ART_R = 1.5, CELL = 6, PAD = 6, VIEW_OY = 36;
const In = { left: false, right: false, jump: false, spray: false, jp: false };
const view = { W: 960, S: 1, cv: null, ctx: null };
let G = null;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const pick = a => a[Math.floor(Math.random() * a.length)];
const approach = (v, t, d) => v < t ? Math.min(t, v + d) : Math.max(t, v - d);

// ---------------------------------------------------------------- dirty objects
function makeObj(type, x, baseY, v, dirt, seed) {
  const D = OBJ[type], w = D.w + PAD * 2, h = D.h + PAD * 2;
  const art = mkCanvas(w * ART_R, h * ART_R), a = art.getContext('2d');
  a.scale(ART_R, ART_R); a.translate(PAD, PAD); a.lineJoin = 'round'; a.lineCap = 'round';
  D.draw(a, D.w, D.h, v || 0);
  const o = { type, x: x - PAD, y: baseY + PAD, w, h, v, art, count: D.count !== false, done: !dirt, bounce: 0, given: 0,
    reward: clamp(Math.round(D.w * D.h / 2600), 3, 14), snd: D.snd };
  o.top = o.y - o.h; o.base = baseY; o.high = baseY < GROUND - HIGH_ABOVE;
  if (dirt) addDirt(o, dirt, seed || 1);
  return o;
}
function addDirt(o, kind, seed) {
  const cw = o.art.width, ch = o.art.height;
  const tex = mkCanvas(cw, ch), t = tex.getContext('2d');
  t.drawImage(o.art, 0, 0); t.globalCompositeOperation = 'source-atop';
  paintDirt(t, cw, ch, kind, rng(seed), ART_R); t.globalCompositeOperation = 'source-over';
  const gw = Math.ceil(o.w / CELL), gh = Math.ceil(o.h / CELL);
  const px = o.art.getContext('2d').getImageData(0, 0, cw, ch).data;
  const act = new Uint8Array(gw * gh), grid = new Float32Array(gw * gh);
  let total = 0;
  for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
    let n = 0;
    for (const [fx, fy] of [[0.5, 0.5], [0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) {
      const sx = Math.min(cw - 1, Math.floor((i + fx) * CELL * ART_R)), sy = Math.min(ch - 1, Math.floor((j + fy) * CELL * ART_R));
      if (px[(sy * cw + sx) * 4 + 3] > 60) n++;
    }
    if (n >= 3) { act[j * gw + i] = 1; grid[j * gw + i] = 1; total++; }
  }
  if (!total) { o.done = true; return; }
  const mask = mkCanvas(gw, gh), mctx = mask.getContext('2d');
  Object.assign(o, { tex, out: mkCanvas(cw, ch), mask, mctx, mimg: mctx.createImageData(gw, gh), grid, act, gw, gh, total, sum: total, rem: 1,
    dirtCol: (DIRT[kind] || DIRT.mud).col, kind, need: true, done: false });
}
function recompose(o) {
  const d = o.mimg.data, g = o.grid, act = o.act, gw = o.gw, n = gw * o.gh;
  for (let i = 0; i < n; i++) {
    let v;
    if (act[i]) v = g[i];
    else {
      v = 0; const x = i % gw;
      if (x > 0 && act[i - 1]) v = Math.max(v, g[i - 1]);
      if (x < gw - 1 && act[i + 1]) v = Math.max(v, g[i + 1]);
      if (i >= gw && act[i - gw]) v = Math.max(v, g[i - gw]);
      if (i + gw < n && act[i + gw]) v = Math.max(v, g[i + gw]);
    }
    d[i * 4 + 3] = v >= 0.62 ? 255 : (v * 1.6 * 255) | 0;
  }
  o.mctx.putImageData(o.mimg, 0, 0);
  const oc = o.out.getContext('2d');
  oc.globalCompositeOperation = 'copy'; oc.drawImage(o.tex, 0, 0);
  oc.globalCompositeOperation = 'destination-in'; oc.imageSmoothingEnabled = true;
  oc.drawImage(o.mask, 0, 0, o.gw, o.gh, 0, 0, o.gw * CELL * ART_R, o.gh * CELL * ART_R);
  oc.globalCompositeOperation = 'source-over';
  o.need = false;
}
function cleanAt(o, wx, wy, r, amt) {
  if (o.done || !o.grid) return 0;
  const lx = wx - o.x, ly = wy - o.top;
  if (lx < -r || ly < -r || lx > o.w + r || ly > o.h + r) return 0;
  const i0 = Math.max(0, Math.floor((lx - r) / CELL)), i1 = Math.min(o.gw - 1, Math.floor((lx + r) / CELL));
  const j0 = Math.max(0, Math.floor((ly - r) / CELL)), j1 = Math.min(o.gh - 1, Math.floor((ly + r) / CELL));
  const rr = (r + CELL * 0.5) ** 2, g = o.grid, act = o.act;
  let got = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const k = j * o.gw + i; if (!act[k]) continue; const v = g[k]; if (v <= 0) continue;
    const cx = (i + 0.5) * CELL - lx, cy = (j + 0.5) * CELL - ly, d2 = cx * cx + cy * cy; if (d2 > rr) continue;
    const dv = Math.min(v, amt * (1 - d2 / rr * 0.7)); g[k] = v - dv; got += dv;
  }
  if (got > 0) { o.sum -= got; o.rem = Math.max(0, o.sum / o.total); o.need = true; }
  return got;
}
function dirtyAt(o, wx, wy, r) {
  if (!o.grid) return 0;
  const lx = wx - o.x, ly = wy - o.top;
  const i0 = Math.max(0, Math.floor((lx - r) / CELL)), i1 = Math.min(o.gw - 1, Math.floor((lx + r) / CELL));
  const j0 = Math.max(0, Math.floor((ly - r) / CELL)), j1 = Math.min(o.gh - 1, Math.floor((ly + r) / CELL));
  const rr = r * r; let add = 0;
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const k = j * o.gw + i; if (!o.act[k]) continue;
    const cx = (i + 0.5) * CELL - lx, cy = (j + 0.5) * CELL - ly, d2 = cx * cx + cy * cy; if (d2 > rr) continue;
    const nv = Math.max(o.grid[k], 1 - d2 / rr * 0.4); add += nv - o.grid[k]; o.grid[k] = nv;
  }
  if (add > 0) { o.sum += add; o.rem = Math.min(1, o.sum / o.total); o.need = true; if (o.done) { o.done = false; G.cleaned--; } }
  return add;
}
function finishObj(o) {
  if (!o.grid) return;
  for (let i = 0; i < o.grid.length; i++) o.grid[i] = 0;
  o.sum = 0; o.rem = 0; o.need = true; o.done = true;
}

// ---------------------------------------------------------------- level setup
// Monster toughness: seconds of spraying = level toughness (2 s in level 1 → 7 s in the last) / gear (1 starter → 3.5 best).
// hp 1 = blob, 1.5 = slime wave, 0.6 = bird.
function gearMult() {
  const pl = SAVE.up.pressure / (PRESSURE.length - 1), nz = { fan: 0, wide: 0.33, jet: 0.66, turbo: 1 }[SAVE.noz] || 0;
  return 1 + 2.5 * (0.7 * pl + 0.3 * nz);
}
function curNozzle() { return NOZZLES[SAVE.noz] || NOZZLES.fan; }
function curPressure() { return PRESSURE[SAVE.up.pressure] || PRESSURE[0]; }
const DIFFS = { easy: 5, medium: 4, hard: 3, ultra: 1 };
function maxHearts() { return DIFFS[SAVE.diff] || 4; }
function tankMul() { return ({ easy: 1.25, medium: 1, hard: 0.75, ultra: 0.5 })[SAVE.diff] || 1; }
function tankMax() { return (TANK[SAVE.up.tank] || TANK[0]) * tankMul(); }
function newPlayer(x) {
  return { x, y: GROUND, vx: 0, vy: 0, face: 1, ground: true, coyote: 0, jbuf: 0, walk: 0, hearts: maxHearts(), inv: 0, hurtT: 0,
    tank: tankMax(), gy: GROUND, on: null, spraying: false, hitting: false, aimA: 0.35, blinkT: 2.5, blink: 0, lock: false, sputT: 0, glugT: 0, lowSaid: false };
}
function newBlob(x, range) { return { kind: 'blob', x, y: GROUND, minX: x - range, maxX: x + range, dir: -1, hp: 1, hp0: 1, r: 26, hop: Math.random() * 3, flash: 0, spd: 45, shootT: 2 + Math.random() * 2 }; }
function startLevel(L, idx, demo) {
  G = { L, idx, demo: !!demo, theme: L.theme, t: 0, objs: [], plats: [], solids: [], hydrants: [], enemies: [], balls: [], coins: [], parts: [], texts: [], puddles: [],
    cam: { x: 0, shake: 0 }, aim: { x: 0, y: 0 }, tgt: null, retarget: 0, lvlCoins: 0, cleaned: 0,
    wall: L.wall ? { x: L.wall, open: false, melt: 0 } : null, finish: L.finish || 0, boss: null, arena: null,
    done: false, respawnT: 0, checkpoint: 120, nagT: 3, kidSay: null, demoT: 0, paused: false, waveT: 12 };
  let seed = (idx + 1) * 1000;
  for (const [type, x, v, by] of L.objs) G.objs.push(makeObj(type, x, by || GROUND, v || 0, L.dirt, seed++));
  for (const [x, y, w, style, top, mx, my, mv, ph] of (L.plats || [])) G.plats.push({ x, y, w, style, y0: y, y1: top || y, wait: 0, x0: x, mx: mx || 0, my: my || 0, mv: mv || 0, ph: ph || 0 });
  for (const [kind, x, w, h] of (L.solids || [])) G.solids.push({ kind, x, y: GROUND - h, w, h, theme: L.theme });
  for (const [x, w, lo, hi] of (L.toggles || [])) G.solids.push({ kind: 'tog', x, y: GROUND - lo, w, h: lo, tog: { lo, hi, up: false } });
  G.holes = (L.holes || []).map(([x, w, sw]) => ({ x, w, sewer: !!sw, pit: !!L.sewer }));
  if (L.lift) G.plats.push({ x: L.lift[0], y: GROUND, w: L.lift[1], style: 'lift', y0: GROUND, y1: 90, wait: 0, x0: L.lift[0], mx: 0, my: 0, mv: 0, ph: 0, exit: true });
  G.pipes = (L.pipes || []).map(x => ({ x, w: 90, h: 120, open: true, hp: 1.6, spawnT: 1.5, n: 0, ang: 0, turnT: 0 }));
  for (const pp of G.pipes) G.solids.push({ kind: 'pipe', x: pp.x, y: GROUND - pp.h, w: pp.w, h: pp.h, pipe: pp });
  G.blobT = 6;
  for (const [x, w, h] of (L.towers || [])) G.solids.push({ kind: 'tower', x, y: GROUND - h, w, h, tower: { off: false, t: 1.5 + Math.random() * 1.5, charge: 0 } });
  G.hydrants = (L.hydrants || []).map(x => ({ x, active: false }));
  for (const [x, range] of (L.blobs || [])) G.enemies.push(newBlob(x, range));
  for (const [x, range] of (L.worms || [])) { const [a, b] = clipRange(x, range); G.enemies.push({ kind: 'worm', x, y: GROUND, minX: a, maxX: b, dir: Math.random() < 0.5 ? 1 : -1, hp: 0.8, hp0: 0.8, r: 22, t: Math.random() * 3, flash: 0, spitT: 2 + Math.random() * 2, rear: 0 }); }
  for (const [x, range, y] of (L.birds || [])) G.enemies.push({ kind: 'bird', req: true, x, y, y0: y, minX: x - range, maxX: x + range, dir: 1, hp: 0.6, hp0: 0.6, flash: 0, dropT: 2, r: 24, t: 0 });
  G.birdsReq = G.enemies.filter(e => e.req).length;
  G.total = G.objs.filter(o => o.count && o.grid).length + G.birdsReq + G.pipes.length;
  if (L.boss) G.arena = { x: L.boss.x, fight: L.boss.fight, started: false, L: 0 };
  G.p = newPlayer(L.startX || 120);
  In.left = In.right = In.jump = In.spray = In.jp = false;
  G.aim.x = G.p.x + 150; G.aim.y = GROUND - 60;
  G.cam.x = clamp(G.p.x - view.W * 0.4, 0, Math.max(0, L.len - view.W));
  hudReset();
}

// ---------------------------------------------------------------- effects
function part(x, y, vx, vy, life, size, col, type, g) { if (G.parts.length < 500) G.parts.push({ x, y, vx, vy, life, max: life, size, col, type, g: g == null ? 900 : g }); }
function splash(x, y, col, n) { for (let i = 0; i < n; i++) part(x, y, (Math.random() - 0.5) * 420, -Math.random() * 420, 0.6 + Math.random() * 0.4, 3 + Math.random() * 5, col, 'c'); }
function sparkleBurst(x, y, n, spread) { for (let i = 0; i < n; i++) part(x + (Math.random() - 0.5) * (spread || 40), y + (Math.random() - 0.5) * (spread || 40), (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300 - 80, 0.7 + Math.random() * 0.6, 5 + Math.random() * 6, Math.random() < 0.5 ? '#fff' : '#fff27a', 's', 80); }
function bubbles(x, y, n) { for (let i = 0; i < n; i++) part(x + (Math.random() - 0.5) * 60, y + (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60, -40 - Math.random() * 60, 1.2 + Math.random(), 4 + Math.random() * 7, '#fff', 'b', -20); }
function floatText(x, y, s, col, size) { G.texts.push({ x, y, s, col: col || '#fff', size: size || 26, life: 1.6, max: 1.6 }); }
function shake(n) { G.cam.shake = Math.max(G.cam.shake, n); }
function spawnCoins(x, y, n) { for (let i = 0; i < n; i++) G.coins.push({ x, y, vx: (Math.random() - 0.5) * 300, vy: -280 - Math.random() * 260, t: Math.random() }); }
// first-time clue for an item type: said once ever (kept in SAVE.hints), never again after that
function hintOnce(key, s) {
  if (G.demo) return false;
  const h = SAVE.hints || (SAVE.hints = {});
  if (h[key]) return false;
  h[key] = 1; persist(); kidSay(s, true); return true;
}
function kidSay(s, speak) { G.kidSay = { s, t: 3 }; if (speak) Sfx.say(s); }
function bossSay(s) { if (!G.boss) return; G.boss.say = s; G.boss.sayT = 3; Sfx.say(s, true); }

// ---------------------------------------------------------------- update
function update(dt) {
  G.t += dt;
  if (G.done) { updParts(dt); updCoins(dt); updCam(dt); return; }
  if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 1.6);
  if (G.exitT > 0) { G.exitT += dt * 1.8; if (G.exitT >= 1) { exitSewer(); return; } }
  updLifts(dt);
  updToggles(dt);
  updPlayer(dt);
  updSpray(dt);
  updEnemies(dt);
  updSpinners(dt);
  updWaves(dt);
  updPipes(dt);
  updTowers(dt);
  updTrickle(dt);
  updBoss(dt);
  updBalls(dt);
  updCoins(dt);
  updHeart(dt);
  updParts(dt);
  updProgress(dt);
  updCam(dt);
  if (!G.demo) hud();
}
function solidsHit(x, y) { for (const s of G.solids) if (x + 15 > s.x && x - 15 < s.x + s.w && y > s.y + 2 && y - 86 < s.y + s.h) return s; return null; }
function updLifts(dt) {
  const P = G.p;
  for (const p of G.plats) {
    if (p.style === 'mover') {
      // slides between x0 and x0+mx and/or rises from y0 to y0-my, carrying the kid standing on it
      const f = (1 - Math.cos(G.t * p.mv + p.ph)) / 2, nx = p.x0 + p.mx * f, ny = p.y0 - p.my * f;
      const on = P.on === p && G.respawnT <= 0;
      if (on) { P.x += nx - p.x; P.y = ny; P.gy = ny; }
      p.py = p.y; p.x = nx; p.y = ny;
      continue;
    }
    if (p.style !== 'lift') continue;
    const on = P.on === p && P.ground && G.respawnT <= 0;
    if (on) {
      if (p.y > p.y1) { p.y = Math.max(p.y1, p.y - (p.exit ? 160 : 100) * dt); if (p.y === p.y1) { Sfx.ding(); if (p.exit && !G.exitT) G.exitT = 0.01; } }
      p.wait = 1.5;
    } else { p.wait -= dt; if (p.wait <= 0 && p.y < p.y0) p.y = Math.min(p.y0, p.y + 100 * dt); }
    if (on) { P.y = p.y; P.gy = p.y; }
  }
}
// open sewer holes: feet over one (with a 10-unit grace at each edge) fall in
function holeAt(x, pad) { pad = pad == null ? 10 : pad; for (const h of G.holes) if (x > h.x + pad && x < h.x + h.w - pad) return h; return null; }
// free walking room around x: stops at blocks, pipes, holes and the closed slime wall
function clipRange(x, range) {
  let lo = x - range, hi = x + range;
  for (const s of G.solids) { if (s.x + s.w <= x) lo = Math.max(lo, s.x + s.w + 30); else if (s.x >= x) hi = Math.min(hi, s.x - 30); }
  for (const h of G.holes) { if (h.x + h.w <= x) lo = Math.max(lo, h.x + h.w + 30); else if (h.x >= x) hi = Math.min(hi, h.x - 30); }
  if (G.wall && !G.wall.open && G.wall.x > x) hi = Math.min(hi, G.wall.x - 30);
  lo = Math.max(lo, 40); hi = Math.min(hi, G.L.len - 40);
  return lo <= hi ? [lo, hi] : [x, x];
}
// spray-lift blocks: rise/sink at 170 u/s, carrying the kid standing on them
function updToggles(dt) {
  const P = G.p;
  for (const s of G.solids) {
    if (!s.tog) continue;
    const want = s.tog.up ? s.tog.hi : s.tog.lo;
    if (s.h === want) continue;
    s.h = approach(s.h, want, 170 * dt); s.y = GROUND - s.h;
    if (s.h === want) Sfx.ding();
    if (Math.random() < dt * 20) bubbles(s.x + s.w / 2, GROUND - 10, 1);
    if (P.onS === s && G.respawnT <= 0) { P.y = s.y; P.gy = s.y; }
  }
}
function flipToggle(s) {
  s.tog.up = !s.tog.up; Sfx.whoosh();
  floatText(s.x + s.w / 2, s.y - 110, s.tog.up ? 'Up!' : 'Down!', '#bfe9ff', 28);
  splash(s.x + s.w / 2, s.y, '#d6f1ff', 10);
}
// ---------------------------------------------------------------- sewer (v1.23)
function enterSewer(h) {
  const up = G, P = G.p; P.inHole = null; refundHeart();
  const keep = Object.assign({}, In);
  startLevel(buildSewer(up.idx, Math.floor(Math.random() * 1e9)), up.idx, false);
  Object.assign(In, keep);
  G.p = P; G.under = { surf: up, h }; G.fade = 1;
  P.x = 140; P.y = GROUND - 330; P.gy = GROUND - 330; P.vx = P.vy = 0; P.on = P.onS = null; P.ground = false;
  G.cam.x = 0; G.aim.x = P.x + 150; G.aim.y = GROUND - 60;
  Sfx.splat(); kidSay('Whoa! I fell into the sewer!', false);
}
function exitSewer() {
  const P = G.p, h = G.under.h, up = G.under.surf;
  refundHeart(); up.p = P; G = up; hudReset();
  P.x = h.x + h.w + 60; P.y = GROUND; P.gy = GROUND; P.vx = P.vy = 0; P.on = P.onS = null; P.inHole = null; P.ground = true; P.inv = 1.5;
  G.balls.length = 0; G.fade = 1; G.exitT = 0; G.prevSpray = false;
  G.cam.x = clamp(P.x - view.W * 0.42, 0, Math.max(0, G.L.len - view.W));
  splash(P.x, GROUND - 10, '#7fb52e', 14); sparkleBurst(P.x, GROUND - 60, 10); spawnCoins(P.x, GROUND - 120, 5);
  floatText(P.x, GROUND - 150, 'Back up!', '#ffd23f', 30); Sfx.buy();
}
// ---------------------------------------------------------------- falling hearts (v1.23): one for every 100 coins picked up, drops when a heart is missing
function refundHeart() { if (G && G.heart) { SAVE.heartPend = (SAVE.heartPend || 0) + 1; G.heart = null; persist(); } }
function updHeart(dt) {
  const P = G.p;
  if (!G.heart && (SAVE.heartPend || 0) > 0 && P.hearts > 0 && P.hearts < maxHearts() && G.respawnT <= 0 && !G.demo && !G.done && !G.exitT) {
    let x = P.x + P.face * 140; if (holeAt(x, -30) || x < 40 || x > G.L.len - 40) x = P.x;
    G.heart = { x, y: 0, t: 0, land: false }; SAVE.heartPend--; persist();
    Sfx.ding(); hintOnce('heart', 'A heart is falling from the sky! Grab it!');
  }
  const h = G.heart; if (!h) return;
  h.t += dt;
  if (!h.land) {
    h.y += 120 * dt; h.x += Math.sin(h.t * 2.2) * 30 * dt;
    let floor = holeAt(h.x, 0) ? GROUND + 400 : GROUND;
    for (const s of G.solids) if (h.x > s.x && h.x < s.x + s.w && s.y >= h.y - 6) floor = Math.min(floor, s.y);
    for (const p of G.plats) if (p.style !== 'roof' && h.x > p.x && h.x < p.x + p.w && p.y >= h.y - 6) floor = Math.min(floor, p.y);
    if (h.y >= floor - 22) { h.y = floor - 22; h.land = true; }
    if (h.y > GROUND + 300) { G.heart = null; SAVE.heartPend = (SAVE.heartPend || 0) + 1; return; }
  }
  if (Math.abs(P.x - h.x) < 42 && Math.abs(P.y - 45 - h.y) < 66 && G.respawnT <= 0) {
    G.heart = null; P.hearts = Math.min(maxHearts(), P.hearts + 1);
    Sfx.buy(); sparkleBurst(h.x, h.y, 14); floatText(h.x, h.y - 40, '+1 heart!', '#ff6f8a', 30);
  }
}
function holeFall() {
  const P = G.p, h = P.inHole; P.inHole = null;
  P.x = P.safeX < h.x ? h.x - 60 : h.x + h.w + 55; P.y = GROUND; P.gy = GROUND; P.vx = P.vy = 0; P.hurtT = 0.9;
  if (G.demo || P.inv > 0) return;
  P.hearts--; P.inv = 1.6;
  Sfx.hurt(); shake(8); floatText(P.x, P.y - 110, 'Ouch!', '#ffd23f', 30);
  hintOnce('holeFall', 'Yuck! I fell in the sewer! Jump over the holes!');
  if (P.hearts <= 0) { G.respawnT = 1.4; P.lock = true; Sfx.say("Oops! Let's try again!"); }
}
function fallHurt(drop) {
  const P = G.p;
  if (P.inv > 0 || G.demo || G.done) return;
  P.hearts--; P.inv = 1.4; P.hurtT = 0.35;
  Sfx.hurt(); shake(8); floatText(P.x, P.y - 110, 'Ouch!', '#ffd23f', 30);
  for (let i = 0; i < 6; i++) part(P.x, P.y - 95, (Math.random() - 0.5) * 200, -Math.random() * 120, 0.7, 7, '#fff27a', 's', 300);
  hintOnce('bigFall', 'Ouch! Big falls hurt. Climb down carefully!');
  if (P.hearts <= 0) { G.respawnT = 1.4; P.lock = true; Sfx.say("Oops! Let's try again!"); }
}
function updPlayer(dt) {
  const P = G.p;
  P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt);
  P.blinkT -= dt; if (P.blinkT < 0) { P.blink = 0.12; P.blinkT = 2 + Math.random() * 3; } P.blink = Math.max(0, P.blink - dt);
  if (G.respawnT > 0) {
    const before = G.respawnT; G.respawnT -= dt;
    if (before > 0.7 && G.respawnT <= 0.7) {
      if (G.under) { const up = G.under.surf; refundHeart(); up.p = P; up.respawnT = G.respawnT; G = up; hudReset(); }
      P.inHole = null; P.x = G.arena && G.arena.started ? G.arena.L + 90 : G.checkpoint; P.y = GROUND; P.gy = GROUND; P.on = null; P.vx = P.vy = 0; P.tank = tankMax(); P.hearts = maxHearts(); P.inv = 2; G.balls.length = 0;
      G.cam.x = clamp(P.x - view.W * 0.4, 0, Math.max(0, G.L.len - view.W)); if (G.arena && G.arena.started) G.cam.x = G.arena.L;
    }
    if (G.respawnT <= 0) P.lock = false;
    return;
  }
  const ctl = !P.lock && P.hurtT < 0.35;
  const dir = ctl && !G.demo ? (In.right ? 1 : 0) - (In.left ? 1 : 0) : 0;
  const spd = 250 * (P.spraying ? 0.62 : 1);
  if (ctl) P.vx = approach(P.vx, dir * spd, (P.ground ? 2400 : 1600) * dt);
  if (dir) P.face = dir;
  P.jbuf = In.jp ? 0.14 : Math.max(0, P.jbuf - dt); In.jp = false;
  P.coyote = P.ground ? 0.1 : Math.max(0, P.coyote - dt);
  if (ctl && P.jbuf > 0 && P.coyote > 0) { P.vy = -830; P.ground = false; P.coyote = 0; P.jbuf = 0; Sfx.jump(); }
  if (!In.jump && P.vy < -380 && !P.hurtT) P.vy = -380;
  P.vy = Math.min(P.vy + 2100 * dt, 1000);
  // x
  P.x += P.vx * dt;
  const s = solidsHit(P.x, P.y);
  if (s) { if (P.x < s.x + s.w / 2) P.x = s.x - 15.01; else P.x = s.x + s.w + 15.01; P.vx = 0; }
  if (G.wall && G.wall.melt < 0.6 && P.x > G.wall.x - 16 && P.x < G.wall.x + 60) { P.x = G.wall.x - 16; P.vx = Math.min(P.vx, 0); }
  let minX = 20, maxX = G.L.len - 20;
  if (G.arena && G.arena.started) minX = G.arena.L + 20;
  if (P.inHole) P.x = clamp(P.x, P.inHole.x + 16, P.inHole.x + P.inHole.w - 16);
  P.x = clamp(P.x, minX, maxX);
  // y
  const prevY = P.y, wasGround = P.ground, vyBefore = P.vy;
  P.y += P.vy * dt; P.ground = false; P.on = null; P.onS = null;
  if (P.inHole && P.y < GROUND - 2) P.inHole = null;
  if (P.y >= GROUND - 1 && !P.inHole && prevY <= GROUND + 1) P.inHole = holeAt(P.x);
  if (P.inHole) { if (P.y > GROUND + 120) { if (P.inHole.sewer && !G.under && !G.demo) enterSewer(P.inHole); else holeFall(); return; } }
  else if (P.y >= GROUND) { P.y = GROUND; P.vy = 0; P.ground = true; }
  if (vyBefore >= 0) {
    for (const p of G.plats) if (prevY <= Math.max(p.y, p.py == null ? p.y : p.py) + 1 && P.y >= p.y && P.x > p.x - 10 && P.x < p.x + p.w + 10) { P.y = p.y; P.vy = 0; P.ground = true; P.on = p; }
    for (const s2 of G.solids) if (prevY <= s2.y + 1 && P.y >= s2.y && P.x + 14 > s2.x && P.x - 14 < s2.x + s2.w) { P.y = s2.y; P.vy = 0; P.ground = true; P.onS = s2; }
  }
  if (P.ground && P.y === GROUND && !holeAt(P.x, -20)) P.safeX = P.x;
  if (P.ground && P.onS && P.onS.tower && !P.onS.tower.off) plugTower(P.onS);
  if (P.ground && !wasGround && P.y - (P.gy == null ? P.y : P.gy) >= 130) fallHurt(P.y - P.gy);
  if (P.ground) P.gy = P.y;
  if (P.ground && !wasGround && vyBefore > 500) { Sfx.land(); for (let i = 0; i < 4; i++) part(P.x, P.y, (Math.random() - 0.5) * 160, -Math.random() * 80, 0.35, 4, 'rgba(255,255,255,.8)', 'm', 0); }
  P.walk += Math.abs(P.vx) * dt * 0.05;
  // hydrants: refill + checkpoint
  let near = false;
  for (const h of G.hydrants) {
    if (Math.abs(P.x - h.x) < 70 && P.y > GROUND - 10) {
      near = true;
      if (!h.active) { h.active = true; G.checkpoint = h.x; Sfx.buy(); sparkleBurst(h.x + 40, GROUND - 76, 10); }
    }
  }
  if (near && P.tank < tankMax()) { P.tank = Math.min(tankMax(), P.tank + 90 * dt); P.glugT -= dt; if (P.glugT <= 0) { Sfx.glug(); P.glugT = 0.15; bubbles(P.x - P.face * 20, P.y - 50, 1); } }
  if (P.tank > tankMax() * 0.4) P.lowSaid = false;
}
function nozzleWorld() {
  const P = G.p, [lx, ly] = kidNozzleLocal(P.aimA);
  return [P.x + P.face * lx, P.y + ly];
}
function updSpray(dt) {
  const P = G.p, noz = curNozzle(), pr = curPressure();
  const want = (In.spray || G.demo) && !P.lock && G.respawnT <= 0;
  // water only comes from red hydrants
  if (want && P.tank <= 0) {
    P.sputT -= dt; if (P.sputT <= 0) { Sfx.sputter(); P.sputT = 0.5; }
    hintOnce('water', 'Out of water! Go back to a red hydrant!');
  }
  P.spraying = want && P.tank > 0;
  const hx = P.x + P.face * 10, hy = P.y - 40, R = MAX_REACH * noz.range;
  const ok = (x, y) => { const dx = (x - hx) * P.face, dy = y - hy; if (dx < 16 || dx * dx + dy * dy > R * R) return false; const a = Math.atan2(dy, dx); return a > -1.25 && a < 1.1; };
  // spray-lift block: a fresh press while standing on it moves it (going down only when nothing up here needs washing)
  const press = P.spraying && !G.prevSpray; G.prevSpray = P.spraying;
  if (press && P.ground && P.onS && P.onS.tog && (!P.onS.tog.up || !findCell(hx, hy, R, ok))) flipToggle(P.onS);
  if (!P.spraying) {
    P.hitting = false; Sfx.spray(false, false, 0);
    G.aim.x = hx + P.face * R * 0.5; G.aim.y = hy + 30; G.tgt = null;
    P.aimA = approach(P.aimA, 0.35, dt * 3);
    return;
  }
  if (!G.demo) P.tank = Math.max(0, P.tank - 7 * dt);
  // never spray behind the kid: after turning around (or a respawn) restart the stream in front
  if ((G.aim.x - hx) * P.face < 16) { G.aim.x = hx + P.face * 40; G.aim.y = hy + 10; G.tgt = null; }
  // choose a target
  G.retarget -= dt;
  let t = G.tgt;
  const valid = t && (t.k === 'ball' ? G.balls.includes(t.ref) && ok(t.ref.x, t.ref.y)
    : t.k === 'valve' ? t.ref.open && ok(...valvePos(t.ref))
    : t.k === 'tog' ? t.ref.tog.up && P.onS !== t.ref && ok(...togBase(t.ref))
    : t.k === 'en' ? t.ref.hp > 0 && ok(t.ref.x, t.ref.y - t.ref.r * 0.7)
    : t.o.grid[t.i] > 0.06 && !t.o.done && ok(t.o.x + t.cx, t.o.top + t.cy));
  if (!valid || G.retarget <= 0 || t.k === 'cell') {
    let threat = null, bs = 1e12;
    for (const b of G.balls) if (!b.mud && Math.abs(b.x - P.x) < 220 && ok(b.x, b.y)) { const s = (b.x - hx) ** 2 + (b.y - hy) ** 2; if (s < bs) { bs = s; threat = { k: 'ball', ref: b }; } }
    if (!threat) for (const pp of G.pipes) if (pp.open && ok(...valvePos(pp))) { const [vx, vy] = valvePos(pp), s = (vx - hx) ** 2 + (vy - hy) ** 2; if (s < bs) { bs = s; threat = { k: 'valve', ref: pp }; } }
    if (!threat) for (const e of G.enemies) if (e.hp > 0 && ok(e.x, e.y - e.r * 0.7)) { const s = (e.x - hx) ** 2 + (e.y - hy) ** 2; if (s < bs) { bs = s; threat = { k: 'en', ref: e }; } }
    if (threat) t = threat;
    else if (!valid || G.retarget <= 0) {
      G.needClimb = false; t = findCell(hx, hy, R, ok);
      // nothing to wash: aim at the base of a raised lift block the kid is not standing on (brings it back down)
      if (!t) for (const s2 of G.solids) if (s2.tog && s2.tog.up && P.onS !== s2 && ok(...togBase(s2))) { t = { k: 'tog', ref: s2 }; break; }
      if (!t && G.needClimb) hintOnce('climb', 'I need to climb up there to wash that!');
    }
    G.retarget = 0.25;
  }
  G.tgt = t;
  let tx, ty, sp = 650;
  if (!t) { tx = hx + P.face * R * 0.6; ty = hy + 25; }
  else if (t.k === 'cell') { tx = t.o.x + t.cx; ty = t.o.top + t.cy; }
  else if (t.k === 'valve') { [tx, ty] = valvePos(t.ref); sp = 1000; }
  else if (t.k === 'tog') { [tx, ty] = togBase(t.ref); sp = 1000; }
  else { tx = t.ref.x; ty = t.k === 'en' ? t.ref.y - t.ref.r * 0.7 : t.ref.y; sp = 1500; }
  const dx = tx - G.aim.x, dy = ty - G.aim.y, d = Math.hypot(dx, dy), stepD = sp * dt;
  if (d <= stepD) { G.aim.x = tx; G.aim.y = ty; } else { G.aim.x += dx / d * stepD; G.aim.y += dy / d * stepD; }
  // keep the stream in front and inside the reachable angle
  const adx = Math.max(16, (G.aim.x - hx) * P.face), ady = G.aim.y - hy;
  P.aimA = clamp(Math.atan2(ady, adx), -1.25, 1.1);
  // clean
  const base = 3.2 * noz.pow * pr.pow * dt, amt = base * 3.4, r = noz.r; // things wash 3.4x base; the boss uses base
  let got = 0;
  const [nzx, nzy] = nozzleWorld(), wb = waveBlocks(nzx, nzy, G.aim.x, G.aim.y);
  if (wb) { G.aim.x = wb.x; G.aim.y = GROUND - 40 * wb.size; G.tgt = { k: 'en', ref: wb }; }
  const list = wb ? [] : G.boss && G.boss.st === 'fight' ? G.objs.concat([G.boss.o]) : G.objs;
  for (const o of list) {
    if (tooLow(o)) continue;
    const g = cleanAt(o, G.aim.x, G.aim.y, r, G.boss && o === G.boss.o ? base * G.boss.armor : amt);
    if (g > 0) {
      got += g;
      if (Math.random() < 0.7) part(G.aim.x, G.aim.y, (Math.random() - 0.5) * 300 - P.face * 80, -Math.random() * 260, 0.5, 2.5 + Math.random() * 3, o.dirtCol, 'c');
      if (o === (G.boss && G.boss.o)) { G.boss.hitT = 0.25; }
      else {
        const want2 = Math.floor((1 - o.rem) * o.reward * 0.5);
        if (o.given < want2) { spawnCoins(G.aim.x, G.aim.y, want2 - o.given); o.given = want2; }
        if (o.rem < 0.05) completeObj(o);
      }
    }
  }
  for (const e of G.enemies) if (e.hp > 0 && Math.hypot(e.x - G.aim.x, e.y - e.r * 0.7 - G.aim.y) < e.r + r) { e.hp -= dt * gearMult() / (G.L.tough || 2); e.flash = 0.1; got += 0.01; }
  for (const b of G.balls) if (Math.hypot(b.x - G.aim.x, b.y - G.aim.y) < b.r + r) { b.hp -= amt; got += 0.01; }
  for (const s2 of G.solids) if (s2.tog && s2.tog.up && P.onS !== s2 && G.aim.x > s2.x - 12 && G.aim.x < s2.x + s2.w + 12 && G.aim.y > s2.y + 20 && G.aim.y < GROUND + 5) { s2.baseT = (s2.baseT || 0) + dt; got += 0.01; if (s2.baseT >= 0.5) { s2.baseT = 0; flipToggle(s2); G.tgt = null; } }
  for (const pp of G.pipes) { if (!pp.open) continue; const [vx, vy] = valvePos(pp); if (Math.hypot(vx - G.aim.x, vy - G.aim.y) < 30 + r) { pp.hp -= dt; pp.turnT = 0.15; got += 0.01; if (pp.hp <= 0) closeValve(pp); } }
  P.hitting = got > 0;
  // water spray particles
  if (Math.random() < 0.8) part(G.aim.x, G.aim.y, (Math.random() - 0.5) * 220 - P.face * 60, -Math.random() * 200, 0.4, 2 + Math.random() * 2.5, '#d6f1ff', 'c');
  if (Math.random() < 0.25) part(G.aim.x, G.aim.y, 0, -20, 0.5, r * 0.6, 'rgba(255,255,255,.5)', 'm', 0);
  Sfx.spray(true, P.hitting, SAVE.up.pressure);
}
function togBase(s) { return [s.x + s.w / 2, GROUND - 35]; }
function valvePos(pp) { return [pp.x + pp.w / 2, GROUND - pp.h - 34]; }
function closeValve(pp) {
  pp.open = false; G.cleaned++; G.tgt = null;
  const [vx, vy] = valvePos(pp);
  Sfx.ding(); setTimeout(() => Sfx.fanfare(), 200);
  sparkleBurst(vx, vy, 24, 80); spawnCoins(vx, vy, 5);
  floatText(vx, vy - 40, 'Valve closed!', '#fff', 30);
  hintOnce('valveClosed', 'Valve closed! No more monsters from that pipe!');
}
function tooLow(o) { return o.high && G.p.y > o.base + CLIMB_GAP; }
// does a slime wave stand between the nozzle and this point? (waves block the jet)
function waveBlocks(x1, y1, x2, y2) {
  for (const e of G.enemies) {
    if (e.kind !== 'wave' || e.hp <= 0) continue;
    const s = e.size, rx0 = e.x - 50 * s, rx1 = e.x + 50 * s, ry0 = GROUND - 90 * s, ry1 = GROUND;
    let t0 = 0, t1 = 1; const dx = x2 - x1, dy = y2 - y1;
    for (const [p, q] of [[-dx, x1 - rx0], [dx, rx1 - x1], [-dy, y1 - ry0], [dy, ry1 - y1]]) {
      if (p === 0) { if (q < 0) { t0 = 2; break; } continue; }
      const r = q / p; if (p < 0) { if (r > t1) { t0 = 2; break; } if (r > t0) t0 = r; } else { if (r < t0) { t0 = 2; break; } if (r < t1) t1 = r; }
    }
    if (t0 <= t1 && t0 < 0.98) return e;
  }
  return null;
}
function findCell(hx, hy, R, ok) {
  const ax = G.aim.x, ay = G.aim.y, P = G.p;
  let best = null, bs = 1e12;
  const list = G.boss && G.boss.st === 'fight' ? G.objs.concat([G.boss.o]) : G.objs;
  for (const o of list) {
    if (o.done || !o.grid) continue;
    const nx = clamp(hx, o.x, o.x + o.w), ny = clamp(hy, o.top, o.y);
    if ((nx - hx) ** 2 + (ny - hy) ** 2 > R * R) continue;
    if ((o.x + o.w - hx) * P.face < 16 && (o.x - hx) * P.face < 16) continue;
    if (tooLow(o)) { G.needClimb = true; continue; }
    for (let j = 0; j < o.gh; j++) for (let i = 0; i < o.gw; i++) {
      const k = j * o.gw + i; if (!o.act[k] || o.grid[k] <= 0.06) continue;
      const cx = (i + 0.5) * CELL, cy = (j + 0.5) * CELL, wx = o.x + cx, wy = o.top + cy;
      const s = (wx - ax) ** 2 + (wy - ay) ** 2 + 0.2 * ((wx - hx) ** 2 + (wy - hy) ** 2);
      if (s < bs && ok(wx, wy) && !waveBlocks(hx, hy, wx, wy)) { bs = s; best = { k: 'cell', o, i: k, cx, cy }; }
    }
  }
  return best;
}
function completeObj(o) {
  finishObj(o);
  o.bounce = 0.6;
  spawnCoins(o.x + o.w / 2, o.top + o.h * 0.3, Math.max(1, o.reward - o.given));
  sparkleBurst(o.x + o.w / 2, o.top + o.h / 2, 26, Math.min(o.w, 200));
  bubbles(o.x + o.w / 2, o.top + o.h / 2, 10);
  Sfx.ding(); setTimeout(() => Sfx.obj(o.snd), 250);
  if (o.type === 'puddle') o.goneAt = G.t; else floatText(o.x + o.w / 2, o.top - 10, pick(CHEERS), '#fff', 30);
  G.cleaned++;
  G.tgt = null;
}
function hurtPlayer(srcX) {
  const P = G.p;
  if (P.inv > 0 || G.done || G.respawnT > 0 || G.demo) return;
  P.hearts--; P.inv = 1.6; P.hurtT = 0.6;
  P.vx = (P.x < srcX ? -1 : 1) * 320; P.vy = -420; P.ground = false;
  Sfx.hurt(); splash(P.x, P.y - 50, DIRT[G.L.dirt].col, 12); shake(6);
  if (P.hearts <= 0) { G.respawnT = 1.4; P.lock = true; Sfx.say("Oops! Let's try again!"); }
}
function updEnemies(dt) {
  const P = G.p, swamp = (G.theme === 'swamp' || G.theme === 'sewer');
  for (const e of G.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    if (e.hp <= 0) continue;
    if (e.kind === 'wave') {
      e.size = 0.35 + 0.65 * Math.max(0, e.hp) / e.hp0; e.r = 46 * e.size; e.t += dt;
      e.x += e.dir * e.spd * dt;
      if (Math.random() < dt * 12) part(e.x - e.dir * 40 * e.size, GROUND - 10 - Math.random() * 40 * e.size, -e.dir * 40, -40, 0.6, 3 + Math.random() * 4, '#7fb52e', 'c');
      const hitSolid = G.solids.some(s => e.x > s.x - 10 && e.x < s.x + s.w + 10) || G.holes.some(h => e.x > h.x - 10 && e.x < h.x + h.w + 10) || (G.wall && !G.wall.open && Math.abs(e.x - G.wall.x - 38) < 40);
      const lo = G.arena && G.arena.started ? G.arena.L + 40 : 40, hi = G.L.len - 40;
      if (hitSolid || e.x < lo || e.x > hi) { e.dir = e.x < lo ? 1 : e.x > hi ? -1 : -e.dir; e.x += e.dir * 14; Sfx.splat(); for (let k = 0; k < 6; k++) part(e.x, GROUND - 40 * e.size, e.dir * Math.random() * 200, -Math.random() * 200, 0.5, 4, '#7fb52e', 'c'); }
      else if (Math.abs(P.x - e.x) < 52 * e.size + 12 && P.y > GROUND - 88 * e.size) hurtPlayer(e.x);
    } else if (e.kind === 'blob') {
      if (e.fall) {
        e.vy = (e.vy || 0) + 1500 * dt; e.y += e.vy * dt; e.x += (e.vx || 0) * dt;
        if (e.vx && G.solids.some(s => e.x > s.x - 20 && e.x < s.x + s.w + 20 && e.y > s.y)) { e.x -= e.vx * dt; e.vx = 0; }
        if (e.y >= GROUND) {
          if (holeAt(e.x, 0)) { if (e.y > GROUND + 80) { e.hp = 0; e.gone = true; e.noCoin = true; } continue; }
          e.y = GROUND; e.fall = false; e.vx = 0; Sfx.splat(); splash(e.x, GROUND - 6, swamp ? '#6f9a2a' : '#7b5431', 8);
          if (e.auto) [e.minX, e.maxX] = clipRange(e.x, 130);
        }
        continue;
      }
      e.hop += dt * 6; e.x += e.dir * e.spd * dt;
      if (e.x < e.minX) { e.x = e.minX; e.dir = 1; } if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
      const dx = P.x - e.x;
      if (Math.abs(dx) < 480 && Math.abs(dx) > 70 && G.respawnT <= 0 && !G.demo) {
        e.shootT -= dt;
        if (e.shootT <= 0) {
          e.shootT = Math.max(1.2, 2.2 - G.idx * 0.035) * (0.8 + Math.random() * 0.4);
          const T = 1.1, x0 = e.x, y0 = e.y - e.r * 1.3, vy = (GROUND - 30 - y0 - 0.5 * 900 * T * T) / T;
          G.balls.push({ x: x0, y: y0, vx: (P.x - x0) / T, vy, r: 11, hp: 0.3, hp0: 0.3, slime: swamp, temp: !!e.auto });
          if (G.idx >= 9 && Math.random() < 0.3) for (const f of [0.7, 1.3]) G.balls.push({ x: x0, y: y0, vx: (P.x - x0) / T * f, vy, r: 10, hp: 0.3, hp0: 0.3, slime: swamp, temp: true });
          e.dir = Math.sign(dx) || 1; e.hop = 0; Sfx.throw();
        }
      }
      if (Math.abs(dx) < e.r + 14 && P.y > e.y - e.r * 1.6 && P.y - 86 < e.y) {
        if (P.vy > 150 && P.y < e.y - e.r * 0.7) { e.hp = 0; P.vy = -560; Sfx.jump(); }
        else hurtPlayer(e.x);
      }
    } else if (e.kind === 'worm') {
      // slime worm (sewer): inches along, rears up and spits slime when the kid is near
      e.t += dt; e.rear = Math.max(0, e.rear - dt);
      if (!e.rear) { e.x += e.dir * (28 + 30 * Math.max(0, Math.sin(e.t * 5))) * dt; if (e.x < e.minX) { e.x = e.minX; e.dir = 1; } if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; } }
      const dx = P.x - e.x;
      if (Math.abs(dx) < 420 && Math.abs(dx) > 60 && G.respawnT <= 0 && !G.demo) {
        e.spitT -= dt;
        if (e.spitT <= 0) {
          e.spitT = Math.max(1.8, 3 - G.idx * 0.04) * (0.8 + Math.random() * 0.4); e.dir = Math.sign(dx) || 1; e.rear = 0.5;
          const T = 1, x0 = e.x + e.dir * 10, y0 = e.y - 46, vy = (GROUND - 30 - y0 - 0.5 * 900 * T * T) / T;
          G.balls.push({ x: x0, y: y0, vx: (P.x - x0) / T, vy, r: 10, hp: 0.3, hp0: 0.3, slime: true, temp: true }); Sfx.throw();
        }
      }
      if (Math.abs(dx) < 34 && P.y > e.y - 50 && P.y - 86 < e.y) {
        if (P.vy > 150 && P.y < e.y - 20) { e.hp = 0; P.vy = -560; Sfx.jump(); }
        else hurtPlayer(e.x);
      }
    } else {
      e.t += dt; e.x += e.dir * 70 * dt; e.y = e.y0 + Math.sin(e.t * 2) * 22;
      if (e.x < e.minX) e.dir = 1; if (e.x > e.maxX) e.dir = -1;
      e.dropT -= dt;
      if (e.dropT <= 0 && Math.abs(P.x - e.x) < 170 && G.respawnT <= 0 && !G.demo) {
        const T = Math.sqrt(2 * Math.max(40, P.y - 40 - e.y) / 900);
        G.balls.push({ x: e.x, y: e.y + 14, vx: clamp((P.x - e.x) / T, -260, 260), vy: 40, r: 12, hp: 0.3, hp0: 0.3, slime: swamp }); e.dropT = 1.5 + Math.random() * 0.5; Sfx.throw();
      }
      if (Math.abs(P.x - e.x) < 30 && Math.abs(P.y - 45 - e.y) < 50) hurtPlayer(e.x);
    }
    if (e.hp <= 0 && e.gone) continue;
    if (e.hp <= 0) {
      if (e.kind === 'blob') { const col = swamp ? '#6f9a2a' : '#7b5431'; for (let k = 0; k < 14; k++) part(e.x, e.y - 20, (Math.random() - 0.5) * 520, -150 - Math.random() * 380, 0.9, 6 + Math.random() * 7, col, 'c'); if (!G.arena || !G.arena.started) for (const dx of [-55, 0, 50]) if (!holeAt(e.x + dx, 0)) G.puddles.push({ x: e.x + dx, w: 26 + Math.random() * 20, life: 2.5, slime: swamp }); shake(3); }
      Sfx.pop(); splash(e.x, e.y - 20, e.kind === 'bird' ? '#4a3a5a' : e.kind === 'wave' || e.kind === 'worm' ? '#7fb52e' : (swamp ? '#6f9a2a' : '#7b5431'), e.kind === 'wave' ? 30 : 16); bubbles(e.x, e.y - 20, 6);
      if (!e.noCoin) { spawnCoins(e.x, e.y - 30, e.kind === 'wave' ? 4 : 2); floatText(e.x, e.y - 60, e.kind === 'wave' ? 'Wave washed!' : 'Splash!', '#bfe9ff', 24); }
    }
  }
  G.enemies = G.enemies.filter(e => e.hp > 0);
}
function updSpinners(dt) {
  for (const o of G.objs) {
    if (o.type !== 'spinner') continue;
    o.ang = (o.ang || 0) + dt * (o.done ? 1.2 : 7);
    if (o.done || G.demo) continue;
    const near = o.x + o.w > G.cam.x - 150 && o.x < G.cam.x + view.W + 150;
    if (near) hintOnce('fountain', 'That fountain is spraying mud everywhere! Wash it to make it stop!');
    o.spewT = (o.spewT == null ? 1.5 : o.spewT) - dt;
    if (o.spewT <= 0 && near) {
      o.spewT = 2.4 + Math.random() * 0.8;
      const hx = o.x + o.w / 2, hy = o.top + PAD + 30;
      for (let k = 0; k < 4; k++) { const s = k % 2 ? 1 : -1; G.balls.push({ x: hx + s * 14, y: hy, vx: s * (90 + Math.random() * 200), vy: -380 - Math.random() * 240, r: 11, hp: 0.3, hp0: 0.3, slime: G.L.dirt === 'slime', mud: true }); }
      Sfx.throw();
    }
  }
}
function updWaves(dt) {
  if (!G.L.waveEvery || G.done || G.respawnT > 0 || (G.arena && G.arena.started)) return;
  G.waveT -= dt; if (G.waveT > 0) return;
  const P = G.p, dir = -P.face, x0 = P.face > 0 ? G.cam.x + view.W + 80 : G.cam.x - 80;
  const lo = Math.min(x0, P.x), hi = Math.max(x0, P.x);
  const blocked = x0 < 100 || x0 > G.L.len - 50 || G.solids.some(s => s.x + s.w > lo && s.x < hi) || G.holes.some(h => h.x + h.w > lo && h.x < hi) || (G.wall && !G.wall.open && G.wall.x > lo && G.wall.x < hi);
  if (blocked || G.enemies.filter(e => e.kind === 'wave').length >= 3) { G.waveT = 3; return; }
  G.waveT = G.L.waveEvery * (0.8 + Math.random() * 0.5);
  G.enemies.push({ kind: 'wave', x: x0, y: GROUND, dir, spd: 85 + G.idx * 1.5, hp: 1.5, hp0: 1.5, r: 46, size: 1, flash: 0, t: 0 });
  Sfx.whoosh();
  hintOnce('wave', 'A slime wave! Spray it, or jump over it when it gets small!');
}
// sewer pipes spit mud monsters, mud and (later) slime waves until the valve is closed (v1.11)
function updPipes(dt) {
  const P = G.p, L = G.L;
  for (const pp of G.pipes) {
    pp.turnT = Math.max(0, pp.turnT - dt); pp.ang += dt * (pp.turnT > 0 ? 9 : 0);
    const mx = pp.x - 4, my = GROUND - 66;
    if (!pp.open) { if (Math.random() < dt * 6) part(mx, my + 10, -30 - Math.random() * 30, 0, 0.8, 3, '#bfe9ff', 'c'); continue; }
    if (Math.random() < dt * 8) part(mx, my + 8, -40 - Math.random() * 60, 0, 0.8, 3 + Math.random() * 3, G.L.dirt === 'slime' ? '#7fb52e' : '#7b5431', 'c');
    const near = Math.abs(P.x - pp.x) < 900;
    if (!near || G.demo || G.respawnT > 0 || G.done) continue;
    if (pp.x < G.cam.x + view.W) hintOnce('pipe', 'Monsters are coming out of that sewer pipe! Spray the valve wheel on top to close it!');
    pp.spawnT -= dt; if (pp.spawnT > 0) continue;
    pp.spawnT = (L.pipeEvery || 3) * (0.8 + Math.random() * 0.4); pp.n++;
    const alive = G.enemies.filter(e => e.pipe === pp && e.kind === 'blob').length;
    if (L.pipeWaves && pp.n % 4 === 0 && G.enemies.filter(e => e.kind === 'wave').length < 3) {
      G.enemies.push({ kind: 'wave', x: pp.x - 60, y: GROUND, dir: -1, spd: 85 + G.idx * 1.5, hp: 1.5, hp0: 1.5, r: 46, size: 1, flash: 0, t: 0, pipe: pp }); Sfx.whoosh();
    } else if (alive < (L.pipeMax || 3)) {
      const e = newBlob(mx, 0); e.y = my + 20; e.fall = true; e.vy = -300 - Math.random() * 120; e.vx = -(110 + Math.random() * 170); e.auto = true; e.pipe = pp; e.dir = -1; e.shootT = 1.5 + Math.random();
      G.enemies.push(e); Sfx.splat();
    }
    for (let k = 0; k < 2; k++) G.balls.push({ x: mx, y: my, vx: -(60 + Math.random() * 220), vy: -300 - Math.random() * 250, r: 11, hp: 0.3, hp0: 0.3, slime: G.L.dirt === 'slime', mud: true, temp: true });
    Sfx.throw();
  }
}
// slime towers fire a slime shot at kid height toward the kid; landing on top plugs them for good
function updTowers(dt) {
  const P = G.p;
  for (const s of G.solids) {
    const tw = s.tower; if (!tw || tw.off) continue;
    const cx = s.x + s.w / 2, near = Math.abs(P.x - cx) < 650;
    tw.charge = 0;
    if (!near || G.demo || G.done || G.respawnT > 0) continue;
    if (cx > G.cam.x && cx < G.cam.x + view.W) hintOnce('tower', 'A slime tower! Jump on top of it to plug it!');
    tw.t -= dt; if (tw.t < 0.5) tw.charge = (0.5 - Math.max(0, tw.t)) / 0.5;
    if (tw.t > 0) continue;
    tw.t = (G.L.towerEvery || 2.6) * (0.85 + Math.random() * 0.3);
    const d = P.x < cx ? -1 : 1;
    G.balls.push({ x: d < 0 ? s.x - 16 : s.x + s.w + 16, y: GROUND - 55, vx: d * 240, vy: 0, r: 13, hp: 0.3, hp0: 0.3, slime: true, shot: true, temp: true, src: s });
    Sfx.whoosh(); splash(d < 0 ? s.x - 12 : s.x + s.w + 12, GROUND - 55, '#7fb52e', 5);
  }
}
function plugTower(s) {
  s.tower.off = true; const P = G.p;
  P.vy = -560; P.ground = false; Sfx.pop(); setTimeout(() => Sfx.ding(), 120);
  sparkleBurst(s.x + s.w / 2, s.y, 18, 60); spawnCoins(s.x + s.w / 2, s.y - 20, 3);
  floatText(s.x + s.w / 2, s.y - 60, 'Plugged!', '#fff', 30);
  hintOnce('towerPlugged', 'I plugged the slime tower!');
}
// a steady trickle of mud monsters dropping in ahead of the kid while the slime wall is still shut
function updTrickle(dt) {
  const L = G.L, P = G.p;
  if (!L.blobEvery || G.demo || G.done || G.respawnT > 0 || (G.arena && G.arena.started) || (G.wall && G.wall.open)) return;
  G.blobT -= dt; if (G.blobT > 0) return;
  if (G.enemies.filter(e => e.trickle).length >= L.blobMax) { G.blobT = 2; return; }
  const lim = G.wall ? G.wall.x - 60 : L.len - 200;
  const okX = x => x > 120 && x < lim && !holeAt(x, -40) && !G.solids.some(s => x > s.x - 40 && x < s.x + s.w + 40) && !G.pipes.some(pp => Math.abs(x - pp.x) < 200);
  let x = null;
  for (let k = 0; k < 6 && x == null; k++) { const c = P.x + (k % 2 ? -P.face : P.face) * (240 + Math.random() * 220); if (okX(c)) x = c; }
  if (x == null) { G.blobT = 2; return; }
  G.blobT = L.blobEvery * (0.8 + Math.random() * 0.4);
  const e = newBlob(x, 0); e.y = -60; e.fall = true; e.auto = true; e.trickle = true; e.shootT = 1.5 + Math.random();
  G.enemies.push(e);
}
// monster mud that hits the ground stays as a dirty puddle you must wash (outside boss arenas)
function addPuddle(x) {
  if (G.demo) return;
  const near = G.objs.find(o => o.type === 'puddle' && Math.abs(o.x + o.w / 2 - x) < 46);
  if (near) { dirtyAt(near, clamp(x, near.x + 10, near.x + near.w - 10), GROUND - 2, 30); near.goneAt = null; return; }
  const o = makeObj('puddle', x - 43, GROUND + 2, 0, G.L.dirt, 5000 + G.objs.length);
  o.reward = 1; G.objs.push(o); G.total++;
}
function updBalls(dt) {
  const P = G.p;
  for (const b of G.balls) {
    if (!b.shot) b.vy += 900 * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.hp <= 0) { b.dead = true; for (let i = 0; i < 8; i++) part(b.x, b.y, (Math.random() - 0.5) * 240, (Math.random() - 0.5) * 240, 0.4, 3, '#d6f1ff', 'c'); Sfx.pop(); continue; }
    const arena = G.arena && G.arena.started;
    if (b.shot) {
      // tower shots fly straight until they hit a block, the shut slime wall, or get far away
      if (Math.abs(b.x - P.x) > 1100 || G.solids.some(s => s !== b.src && b.x > s.x && b.x < s.x + s.w && b.y > s.y) || (G.wall && G.wall.melt < 0.6 && b.x > G.wall.x && b.x < G.wall.x + 76)) { b.dead = true; Sfx.splat(); splash(b.x, b.y, '#6f9a2a', 8); continue; }
      if (b.x > P.x - 18 - b.r && b.x < P.x + 18 + b.r && b.y > P.y - 88 - b.r && b.y < P.y + b.r) { b.dead = true; hurtPlayer(b.x); }
      continue;
    }
    if (!arena) {
      let hit = false;
      for (const o of G.objs) if (o.type !== 'spinner' && o.grid && b.x > o.x && b.x < o.x + o.w && b.y > o.top && b.y < o.y && dirtyAt(o, b.x, b.y, 26) > 0) { hit = true; break; }
      if (hit) { b.dead = true; Sfx.splat(); splash(b.x, b.y, b.slime ? '#6f9a2a' : '#7b5431', 6); continue; }
    }
    if (b.y >= GROUND - 4 && holeAt(b.x, 0)) { if (b.y > GROUND + 60) b.dead = true; continue; }
    if (b.y >= GROUND - 4) { b.dead = true; Sfx.splat(); splash(b.x, GROUND - 4, b.slime ? '#6f9a2a' : '#7b5431', 10); if (arena || b.temp) G.puddles.push({ x: b.x, w: 40, life: 3, slime: b.slime }); else addPuddle(b.x); continue; }
    if (b.x > P.x - 18 - b.r && b.x < P.x + 18 + b.r && b.y > P.y - 88 - b.r && b.y < P.y + b.r) { b.dead = true; hurtPlayer(b.x); }
  }
  G.balls = G.balls.filter(b => !b.dead);
  for (const p of G.puddles) p.life -= dt;
  G.puddles = G.puddles.filter(p => p.life > 0);
}
function gotCoin() { SAVE.coins++; G.lvlCoins++; SAVE.heartAcc = (SAVE.heartAcc || 0) + 1; if (SAVE.heartAcc >= 100) { SAVE.heartAcc -= 100; SAVE.heartPend = Math.min(3, (SAVE.heartPend || 0) + 1); } }
function updCoins(dt) {
  const P = G.p;
  for (const c of G.coins) {
    c.t += dt;
    const dx = P.x - c.x, dy = P.y - 45 - c.y, d = Math.hypot(dx, dy);
    if (d < 34) { c.got = true; gotCoin(); Sfx.coin(); part(c.x, c.y, 0, -40, 0.3, 8, '#fff27a', 's', 0); continue; }
    if ((d < 180 || c.t > 2.5 || G.done) && c.t > 0.45) { const sp = 500 + c.t * 200; c.x += dx / d * sp * dt; c.y += dy / d * sp * dt; continue; }
    c.vy += 1200 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
    if (c.y > GROUND - 10) { c.y = GROUND - 10; c.vy *= -0.45; c.vx *= 0.7; }
  }
  G.coins = G.coins.filter(c => !c.got);
}
function updParts(dt) {
  for (const p of G.parts) { p.life -= dt; p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; }
  G.parts = G.parts.filter(p => p.life > 0);
  for (const t of G.texts) { t.life -= dt; t.y -= 40 * dt; }
  G.texts = G.texts.filter(t => t.life > 0);
  if (G.kidSay) { G.kidSay.t -= dt; if (G.kidSay.t <= 0) G.kidSay = null; }
  for (const o of G.objs) o.bounce = Math.max(0, o.bounce - dt);
}
function updProgress(dt) {
  const P = G.p;
  const birds = G.enemies.filter(e => e.req && e.hp > 0).length;
  const valves = G.pipes.filter(pp => pp.open).length;
  const left = G.objs.filter(o => o.count && o.grid && !o.done).length + birds + valves;
  G.left = left; G.birdsLeft = birds; G.valvesLeft = valves;
  if (G.demo) { if (!left) { G.demoT += dt; if (G.demoT > 2.5) UI.restartDemo(); } return; }
  const w = G.wall;
  if (w && !w.open && !left) {
    w.open = true; Sfx.melt(); sparkleBurst(w.x + 38, GROUND - 110, 30, 80);
    kidSay(G.arena ? 'The slime wall melted! Go find Sir Sludgington!' : 'All clean! The slime wall melted! Go!', true);
  }
  if (w && w.open) w.melt = Math.min(1, w.melt + dt * 0.8);
  if (w && !w.open && P.x > w.x - 150) {
    G.nagT -= dt;
    if (G.nagT <= 0) { G.nagT = 8; kidSay(valves && valves === left ? 'Close the valve on the sewer pipe!' : birds && birds === left ? (birds === 1 ? 'One more bird to wash!' : `${birds} more birds to wash!`) : left === 1 ? 'One more dirty thing to wash!' : `${left} more dirty things to wash!`, true); }
  }
  if (G.holes.some(h => h.sewer && (h.x - P.x) * P.face > 0 && Math.abs(h.x - P.x) < 420)) hintOnce('sewerIn', 'A sewer entrance! Jump in to explore, or jump over it!');
  else if (!G.under && G.holes.some(h => !h.sewer && (h.x - P.x) * P.face > 0 && Math.abs(h.x - P.x) < 320)) hintOnce('hole', 'An open sewer! Jump over it!');
  if (G.under && G.t > 1.5) hintOnce('sewer', 'Slime worms! Wash them, then ride the lift up!');
  if (G.under && G.holes.some(h => (h.x - P.x) * P.face > 0 && Math.abs(h.x - P.x) < 300)) hintOnce('slimePit', 'A slime pit! Jump over it!');
  if (G.solids.some(s => s.kind === 'hurdle' && (s.x - P.x) * P.face > 0 && s.x - P.x < 300 && s.x > P.x)) hintOnce('hurdle', 'Construction barriers! Jump over them!');
  if (G.solids.some(s => s.tog && Math.abs(s.x - P.x) < 300)) hintOnce('lift', 'A lift block! Stand on it and spray to make it go up!');
  if (G.arena && !G.arena.started && P.x > G.arena.x + 120) startBoss();
  if (!G.arena && G.finish && w && w.open && P.x > G.finish - 20) {
    if (!left) completeLevel();
    else { P.x = Math.min(P.x, G.finish - 20); G.nagT -= dt; if (G.nagT <= 0) { G.nagT = 8; kidSay('New mud puddles! Wash them all first!', true); } }
  }
}
function updCam(dt) {
  const P = G.p, c = G.cam;
  let tx = P.x - view.W * 0.42 + P.face * 50;
  if (G.arena && G.arena.started) tx = G.arena.L;
  if (G.demo) tx = 0;
  tx = clamp(tx, 0, Math.max(0, G.L.len - view.W));
  c.x += (tx - c.x) * Math.min(1, dt * 5);
  c.shake = Math.max(0, c.shake - dt * 30);
}

// ---------------------------------------------------------------- boss
function startBoss() {
  const A = G.arena; A.started = true;
  A.L = Math.max(0, G.L.len - view.W);
  const o = makeObj('boss', 0, GROUND, 0, 'slime', 999 + A.fight);
  G.boss = { o, x: G.L.len - 260, y: -260, vx: 0, vy: 0, face: -1, st: 'enter', t: 0, throwT: 2.5, jumpT: 6, blobT: 8, mood: 'angry', moodT: 0,
    say: '', sayT: 0, hitT: 0, waveT: 3, sprayedT: 0, atkT: 5, spinT: 0, armor: 1 / (1 + 0.18 * (A.fight - 1)), ground: false, clean: 0, target: bossTarget(A.fight), diff: bossDiff(A.fight), blinkT: 3, blink: 0, tx: 0 };
  G.checkpoint = A.L + 90; G.hydrants.push({ x: A.L + 60, active: true });
  Sfx.music('boss');
}
function bossAttack(b, kind, L, R) {
  const f = G.arena.fight;
  b.mood = 'laugh'; b.moodT = 1.2; Sfx.laugh();
  if (kind === 'blobs') {
    const n = 2 + Math.floor(f / 3);
    if (G.enemies.filter(e => e.kind === 'blob').length + n > 6) return;
    bossSay(pick(['Mud monsters, ATTACK!', 'Come out, my muddy friends!', 'Get the washer, blobs!']));
    for (let k = 0; k < n; k++) { const e = newBlob(L + 160 + Math.random() * (R - L - 300), 0); e.minX = L + 60; e.maxX = R - 60; e.y = -60 - k * 60; e.fall = true; G.enemies.push(e); }
  } else if (kind === 'birds') {
    const n = 3 + Math.floor(f / 3);
    if (G.enemies.filter(e => e.kind === 'bird').length + n > 7) return;
    bossSay(pick(['Birdies! Get them!', 'Here come my muddy birds!', 'Flock attack!']));
    for (let k = 0; k < n; k++) { const left = k % 2 === 0; G.enemies.push({ kind: 'bird', x: left ? L - 40 - k * 50 : R + 40 + k * 50, y: 170 + Math.random() * 70, y0: 170 + Math.random() * 70, minX: L + 40, maxX: R - 40, dir: left ? 1 : -1, hp: 0.6, hp0: 0.6, flash: 0, dropT: 1 + Math.random() * 2, r: 24, t: Math.random() * 5 }); }
  } else if (kind === 'spin') {
    bossSay(pick(['Sludge SPIN!', 'Spinny slimy time!', 'Wheee, slime everywhere!'])); b.spinT = 1.6; b.spinShot = 0;
  } else {
    bossSay(pick(['Slime bath! Ahhh!', 'A little more slime, please!', 'Ooh, fresh slime!']));
    const o = b.o; for (let k = 0; k < 4 + f; k++) dirtyAt(o, o.x + 30 + Math.random() * (o.w - 60), o.top + 30 + Math.random() * (o.h - 60), 28);
    splash(b.x, b.y - 100, '#6f9a2a', 30); Sfx.splat();
  }
}
function throwBall(b, diff) {
  const P = G.p, n = diff === 3 ? 2 : 1;
  for (let k = 0; k < n; k++) {
    const T = 1.1 + k * 0.25, tx = P.x + (k ? (Math.random() - 0.5) * 220 : 0), x0 = b.x + b.face * 60, y0 = b.y - 150;
    G.balls.push({ x: x0, y: y0, vx: (tx - x0) / T, vy: (GROUND - 30 - y0 - 0.5 * 900 * T * T) / T, r: 15, hp: 0.35, hp0: 0.35, slime: true });
  }
  Sfx.throw(); b.mood = 'laugh'; b.moodT = 0.6;
}
function updBoss(dt) {
  const b = G.boss; if (!b) return;
  const P = G.p, o = b.o, A = G.arena, L = A.L, R = G.L.len;
  b.t += dt; b.sayT -= dt; b.moodT -= dt; b.hitT -= dt;
  b.blinkT -= dt; if (b.blinkT < 0) { b.blink = 0.15; b.blinkT = 2 + Math.random() * 3; } b.blink = Math.max(0, b.blink - dt);
  if (b.st === 'enter') {
    b.vy += 1400 * dt; b.y += b.vy * dt;
    if (b.y >= GROUND) { b.y = GROUND; b.vy = 0; b.ground = true; b.st = 'intro'; b.t = 0; shake(14); Sfx.splat(); splash(b.x, GROUND - 10, '#6f9a2a', 30); bossSay(A.fight >= AREAS.length ? BOSS_FINAL_INTRO : pick(BOSS_INTRO)); Sfx.laugh(); b.mood = 'laugh'; b.moodT = 2; }
  } else if (b.st === 'intro') {
    b.face = P.x < b.x ? -1 : 1;
    if (b.t > 2.4) { b.st = 'fight'; b.t = 0; b.sayT = 2; }
  } else if (b.st === 'fight') {
    const diff = b.diff;
    b.face = P.x < b.x ? -1 : 1;
    if (b.ground) {
      if (!b.tx || Math.abs(b.tx - b.x) < 12) b.tx = L + 260 + Math.random() * Math.max(100, R - L - 380);
      b.vx = Math.sign(b.tx - b.x) * (55 + diff * 20) * (b.hitT > 0 ? 0.35 : 1);
    }
    b.waveT -= dt;
    if (b.waveT <= 0 && b.ground && G.enemies.filter(e => e.kind === 'wave').length < 2) {
      b.waveT = [0, 7, 5.5, 4.5][diff] * (0.85 + Math.random() * 0.3);
      G.enemies.push({ kind: 'wave', x: b.x + b.face * 90, y: GROUND, dir: b.face, spd: 75 + diff * 12, hp: 1.5, hp0: 1.5, r: 46, size: 1, flash: 0, t: 0 });
      Sfx.whoosh(); b.mood = 'laugh'; b.moodT = 1; if (Math.random() < 0.5) bossSay(pick(['Slime wave, GO!', 'Surf the slime!', 'Wash THAT, little washer!']));
    }
    b.sprayedT = b.hitT > 0 ? b.sprayedT + dt : Math.max(0, b.sprayedT - dt * 0.5);
    if (b.sprayedT > 2.4 && b.ground) {
      b.sprayedT = 0; const away = b.x < P.x ? -1 : 1, dest = away < 0 ? L + 160 : R - 140;
      b.vy = -820; b.ground = false; b.vx = clamp((dest - b.x) / 1.15, -460, 460); b.jumpT = Math.max(b.jumpT, 3);
      Sfx.throw(); bossSay(pick(['Missed me!', 'Too slow!', 'Wheee!'])); b.mood = 'laugh'; b.moodT = 1;
    }
    b.throwT -= dt; if (b.throwT <= 0 && b.ground && b.spinT <= 0) { throwBall(b, diff); b.throwT = [0, 2.9, 2.4, 2.0][diff] * (0.8 + Math.random() * 0.4); }
    b.jumpT -= dt; if (b.jumpT <= 0 && b.ground) { b.vy = -760; b.ground = false; b.vx = clamp((P.x - b.x) / 1.1, -300, 300); b.jumpT = 6.5 + Math.random() * 2; Sfx.throw(); }
    b.atkT -= dt;
    if (b.atkT <= 0 && b.ground && b.spinT <= 0) {
      const f = A.fight, opts = ['blobs'];
      if (f >= 2) opts.push('birds'); if (f >= 3) opts.push('spin'); if (f >= 4) opts.push('bath');
      bossAttack(b, pick(opts), L, R);
      b.atkT = Math.max(5, 10 - f * 0.5) * (0.85 + Math.random() * 0.3);
    }
    if (b.spinT > 0) {
      b.spinT -= dt; b.vx = 0; b.spinShot -= dt;
      if (b.spinShot <= 0) { b.spinShot = 0.12; const s = Math.random() < 0.5 ? -1 : 1; G.balls.push({ x: b.x + s * 60, y: b.y - 110, vx: s * (100 + Math.random() * 330), vy: -300 - Math.random() * 420, r: 12, hp: 0.3, hp0: 0.3, slime: true, mud: true }); }
    }
    if (b.hitT > 0 && b.sayT < -2.5 && Math.random() < 0.02) { bossSay(pick(BOSS_OUCH)); }
    else if (b.sayT < -6) { bossSay(pick(BOSS_TAUNTS)); if (Math.random() < 0.5) Sfx.laugh(); b.mood = 'laugh'; b.moodT = 1.2; }
    if (Math.abs(P.x - b.x) < 66 && P.y > b.y - 165 && P.y - 86 < b.y) hurtPlayer(b.x);
    b.clean = 1 - o.rem;
    if (b.clean >= b.target) {
      G.balls.length = 0;
      for (const e of G.enemies) { e.hp = 0; splash(e.x, e.y - 20, '#6f9a2a', 10); }
      G.enemies.length = 0; b.t = 0; b.vx = 0; Sfx.spray(false, false, 0);
      if (A.fight < AREAS.length) { b.st = 'flee'; bossSay(pick(BOSS_FLEE)); Sfx.laugh(); }
      else { b.st = 'defeat'; Sfx.stopMusic(); shake(10); }
    }
  } else if (b.st === 'flee') {
    b.vx = b.ground ? 0 : b.vx;
    if (b.t > 1.8 && b.ground) { b.vy = -1150; b.vx = 430; b.ground = false; Sfx.whoosh(); }
    if (b.t > 3.6) completeLevel();
  } else if (b.st === 'defeat') {
    b.vx = 0;
    if (!b.cleanedAll) {
      for (let i = 0; i < o.grid.length; i++) o.grid[i] *= Math.max(0, 1 - dt * 2);
      o.need = true; if (Math.random() < dt * 20) sparkleBurst(b.x + (Math.random() - 0.5) * 140, b.y - Math.random() * 180, 2);
      b.mood = 'hit';
      if (b.t > 2) { finishObj(o); b.cleanedAll = true; b.mood = 'happy'; b.hatHop = 0; Sfx.sparkle(); Sfx.fanfare(); sparkleBurst(b.x, b.y - 100, 60, 200); bubbles(b.x, b.y - 100, 20); spawnCoins(b.x, b.y - 120, 25); bossSay("I'm... CLEAN! And it feels WONDERFUL!"); }
    }
    if (b.t > 8) completeLevel();
  }
  if (b.st !== 'enter') {
    b.vy += 1400 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.y >= GROUND) {
      if (!b.ground && b.vy > 300) {
        shake(10); Sfx.splat(); splash(b.x, GROUND - 6, '#6f9a2a', 18);
        if (b.st === 'fight' && b.diff >= 2) for (const s of [-1, 1]) G.balls.push({ x: b.x + s * 70, y: GROUND - 40, vx: s * 170, vy: -420, r: 12, hp: 0.3, hp0: 0.3, slime: true });
      }
      b.y = GROUND; b.vy = 0; b.ground = true;
    } else b.ground = false;
    if (b.st !== 'flee') b.x = clamp(b.x, L + 100, R - 90);
  }
  o.x = b.x - o.w / 2; o.y = b.y + PAD; o.top = o.y - o.h;
  if (b.st !== 'defeat' && o.rem > 0.15 && Math.random() < dt * 5 * o.rem) part(b.x + (Math.random() - 0.5) * 120, b.y - 30 - Math.random() * 120, 0, 0, 0.8, 3 + Math.random() * 3, '#6f9a2a', 'c');
}
function completeLevel() {
  if (G.done) return;
  G.done = true; In.spray = false; Sfx.spray(false, false, 0);
  for (const c of G.coins) { if (!c.got) { gotCoin(); } } G.coins = [];
  setTimeout(() => UI.levelDone(), 600);
}

// ---------------------------------------------------------------- drawing
function render() {
  const c = view.ctx, W = view.W;
  c.setTransform(view.S, 0, 0, view.S, 0, 0);
  const sh = G.cam.shake, sx = (Math.random() - 0.5) * sh, sy = (Math.random() - 0.5) * sh;
  const cx = Math.round(G.cam.x);
  c.save(); c.translate(0, -VIEW_OY);
  if (G.under) drawSewerBack(c, cx, W, G.t); else drawBackdrop(c, G.theme, cx, W, G.t, G.L.bgv || 0);
  c.translate(-cx + sx, sy);
  c.lineJoin = 'round'; c.lineCap = 'round';
  if (G.under) drawSewerFloor(c, cx, W); else drawGround(c, G.theme, cx, W);
  const vis = (x, w) => x + w > cx - 50 && x < cx + W + 50;
  for (const h of G.holes) if (vis(h.x, h.w)) drawSewerHole(c, h, G.t);
  if (!G.under) drawScenery(c, cx, W);
  for (const [x, k] of (G.L.signs || [])) if (vis(x, 130)) drawSign(c, x, k, G.t);
  for (const p of G.plats) if (vis(p.x, p.w)) drawPlat(c, p, G.theme, G.t);
  for (const p of G.puddles) { c.globalAlpha = Math.min(1, p.life); ell(c, p.x, GROUND + 4, p.w, 7); c.fillStyle = p.slime ? '#6f9a2a' : '#6b4526'; c.fill(); c.globalAlpha = 1; }
  for (const o of G.objs) {
    if (!vis(o.x, o.w)) continue;
    const fade = o.type === 'puddle' && o.done ? 1 - (G.t - (o.goneAt || -9)) : 1;
    if (fade <= 0) continue;
    if (o.need) recompose(o);
    if (o.type !== 'puddle' && fade === 1) { ell(c, o.x + o.w / 2, o.y + 2, o.w * 0.44, 6); c.fillStyle = 'rgba(0,0,0,.13)'; c.fill(); }
    const b = o.bounce > 0 ? Math.sin(o.bounce * 18) * o.bounce * 0.12 : 0;
    c.save(); c.globalAlpha = fade; c.translate(o.x + o.w / 2, o.y); c.scale(1 - b * 0.5, 1 + b); c.translate(-o.w / 2, -o.h);
    c.drawImage(o.art, 0, 0, o.w, o.h);
    if (o.grid && !(o.done && !o.need)) c.drawImage(o.out, 0, 0, o.w, o.h);
    c.restore();
    if (o.grid && !o.done && o.count && o.type !== 'puddle') stink(c, o.x + o.w / 2, o.top + 4, G.t + o.x);
    else if (o.done && Math.random() < 0.02) part(o.x + Math.random() * o.w, o.top + Math.random() * o.h, 0, -10, 0.6, 6, '#fff', 's', 0);
  }
  for (const s of G.solids) if (vis(s.x - 40, s.w + 40)) { if (s.pipe) drawPipe(c, s.pipe, G.t); else if (s.tower) drawTower(c, s, G.t); else if (s.tog) drawLiftBlock(c, s, G.t, G.p.onS === s); else drawSolid(c, s); }
  for (const h of G.hydrants) if (vis(h.x - 30, 90)) drawHydrant(c, h.x, h.active);
  if (G.wall && vis(G.wall.x, 80)) drawWall(c, G.wall.x, G.t, G.wall.melt, (G.theme === 'swamp' || G.theme === 'sewer'));
  if (G.finish && vis(G.finish - 10, 100)) drawFinish(c, G.finish, G.t, G.wall ? G.wall.open : true);
  for (const k of G.coins) drawCoin(c, k.x, k.y, k.t);
  if (G.heart) drawSkyHeart(c, G.heart.x, G.heart.y, G.heart.t, G.heart.land);
  for (const p of G.plats) if (p.exit && vis(p.x, p.w)) drawExitLight(c, p, G.t);
  for (const o of G.objs) if (o.type === 'spinner' && vis(o.x, o.w)) drawSpinnerHead(c, o.x + o.w / 2, o.top + PAD + 30, o.ang || 0, o.done, G.t);
  for (const e of G.enemies) if (e.kind === 'blob' && !e.fall) { ell(c, e.x, e.y + 2, e.r * 1.1, 5); c.fillStyle = 'rgba(0,0,0,.15)'; c.fill(); }
  for (const e of G.enemies) { if (e.kind === 'blob') drawBlob(c, e, G.t, (G.theme === 'swamp' || G.theme === 'sewer')); else if (e.kind === 'wave') drawWave(c, e, G.t); else if (e.kind === 'worm') drawWorm(c, e, G.t); else drawBird(c, e, G.t); }
  if (G.boss) drawBoss(c);
  for (const b of G.balls) if (b.shot) drawSlimeShot(c, b, G.t); else drawBall(c, b, G.t, (G.theme === 'swamp' || G.theme === 'sewer'));
  if (G.p.ground && !G.p.inHole) { ell(c, G.p.x, G.p.y + 2, 24, 5); c.fillStyle = 'rgba(0,0,0,.16)'; c.fill(); }
  if (G.p.y > GROUND + 1 && G.p.inHole) { const h = G.p.inHole; c.save(); c.beginPath(); c.rect(cx - 100, -400, W + 200, GROUND + 400); c.rect(h.x, GROUND, h.w, 300); c.clip(); drawPlayer(c); c.restore(); }
  else drawPlayer(c);
  drawStream(c);
  drawParts(c);
  for (const t of G.texts) { c.globalAlpha = Math.min(1, t.life * 1.5); outlinedText(c, t.s, t.x, t.y, t.size, t.col); c.globalAlpha = 1; }
  if (G.kidSay) bubble(c, G.p.x, G.p.y - 120, G.kidSay.s, false);
  if (G.boss && G.boss.sayT > 0) bubble(c, G.boss.x, G.boss.y - 250, G.boss.say, true);
  c.restore();
  if (!G.demo) { edgeArrow(c, W); if (G.p.tank < tankMax() * 0.2) waterArrow(c, W); }
  const fa = Math.max(G.fade || 0, Math.min(1, G.exitT || 0));
  if (fa > 0) { c.fillStyle = `rgba(20,16,28,${fa})`; c.fillRect(0, 0, W, 540); }
  if (G.respawnT > 0) {
    const a = G.respawnT > 0.7 ? (1.4 - G.respawnT) / 0.7 : G.respawnT / 0.7;
    c.fillStyle = `rgba(255,255,255,${clamp(a, 0, 1)})`; c.fillRect(0, 0, W, 540);
    c.globalAlpha = clamp(a, 0, 1); outlinedText(c, 'Oops! Try again!', W / 2, 270, 54, '#3a8cf0'); c.globalAlpha = 1;
  }
}
// background props (seeded by slot + level, skipped near holes, hydrants, signs, the wall and the finish) and ambient life
function drawScenery(c, cx, W) {
  const list = PROPS[G.theme] || [], slot = 300;
  for (let k = Math.floor((cx - 250) / slot); k * slot < cx + W + 100; k++) {
    if (hsh(k * 3.1 + G.idx) < 0.3 || !list.length) continue;
    const px = k * slot + 40 + hsh(k + 9.3) * 180;
    if (px < 140 || px > G.L.len - 60) continue;
    if (G.holes.some(h => px > h.x - 60 && px < h.x + h.w + 60) || G.hydrants.some(h => Math.abs(px - h.x) < 100)) continue;
    if ((G.L.signs || []).some(([sx]) => px > sx - 50 && px < sx + 180) || (G.wall && Math.abs(px - G.wall.x - 38) < 90) || (G.finish && Math.abs(px - G.finish) < 90)) continue;
    drawProp(c, list[Math.floor(hsh(k + 5.7) * list.length)], px, G.t, hsh(k + 2.2));
  }
  drawAmbient(c, G.theme, cx, W, G.t);
}
function stink(c, x, y, t) {
  c.strokeStyle = 'rgba(110,140,40,.55)'; c.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    const ph = (t * 0.8 + i * 0.33) % 1; c.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
    c.beginPath(); for (let k = 0; k <= 6; k++) { const yy = y - ph * 40 - k * 5, xx = x + i * 18 + Math.sin(k * 1.3 + t * 4) * 4; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
  }
  c.globalAlpha = 1;
  const fx = x + Math.sin(t * 3) * 24, fy = y - 24 + Math.sin(t * 7) * 8; circ(c, fx, fy, 2.5); c.fillStyle = OUT; c.fill();
  c.fillStyle = 'rgba(255,255,255,.7)'; ell(c, fx - 2, fy - 3, 2.5, 1.5); c.fill();
}
function kidState() {
  return { g: SAVE.gender, skin: SAVE.skin, hair: SAVE.hair, hat: SAVE.hat, wcol: WCOLORS[SAVE.color][0], noz: SAVE.noz, t: G ? G.t : 0 };
}
function drawPlayer(c) {
  const P = G.p;
  if (P.inv > 0 && Math.floor(P.inv * 12) % 2 && G.respawnT <= 0) return;
  c.save(); c.translate(P.x, P.y); c.scale(P.face, 1);
  const k = kidState(); k.walk = P.walk; k.air = !P.ground; k.aim = P.aimA; k.blink = P.blink > 0; k.hurt = P.hurtT > 0; k.moving = Math.abs(P.vx) > 10;
  drawKid(c, k);
  c.restore();
}
function drawStream(c) {
  const P = G.p; if (!P.spraying) return;
  const [nx, ny] = nozzleWorld(), hx = G.aim.x, hy = G.aim.y, noz = curNozzle(), r = noz.r;
  const ang = Math.atan2(hy - ny, hx - nx), px = -Math.sin(ang), py = Math.cos(ang);
  c.globalAlpha = 0.35; c.fillStyle = noz.color === 'rainbow' ? rainbow(G.t) : '#c9eeff';
  c.beginPath(); c.moveTo(nx + px * 2, ny + py * 2); c.lineTo(hx + px * r * 0.8, hy + py * r * 0.8); c.lineTo(hx - px * r * 0.8, hy - py * r * 0.8); c.lineTo(nx - px * 2, ny - py * 2); c.fill();
  c.globalAlpha = 1;
  line(c, nx, ny, hx, hy, 'rgba(255,255,255,.95)', 3 + noz.pow * 1.4);
  c.setLineDash([6, 14]); c.lineDashOffset = -G.t * 900; line(c, nx, ny, hx, hy, noz.color === 'rainbow' ? rainbow(G.t + 0.5) : 'rgba(110,195,255,.95)', 3); c.setLineDash([]);
  c.globalAlpha = 0.55; circ(c, hx, hy, r * (0.6 + Math.random() * 0.3)); c.fillStyle = '#eefaff'; c.fill(); c.globalAlpha = 1;
}
function drawBoss(c) {
  const b = G.boss, o = b.o;
  if (b.y < -300 || b.x > G.L.len + 300) return;
  if (o.need) recompose(o);
  const sq = b.ground ? 1 + Math.sin(G.t * 5) * 0.02 : 1, spx = b.spinT > 0 ? Math.max(0.25, Math.abs(Math.cos(G.t * 16))) : 1;
  c.save(); c.translate(b.x, b.y + PAD); c.scale(spx, sq); c.translate(-o.w / 2, -o.h);
  c.drawImage(o.art, 0, 0, o.w, o.h);
  if (!o.done || o.need) c.drawImage(o.out, 0, 0, o.w, o.h);
  c.restore();
  const mood = b.st === 'defeat' && b.cleanedAll ? 'happy' : b.hitT > 0 ? 'hit' : b.moodT > 0 ? b.mood : (b.st === 'flee' ? 'hit' : 'angry');
  c.save(); c.translate(b.x, b.y + PAD); c.scale(spx, sq); c.translate(-o.w / 2, -o.h);
  drawBossFace(c, PAD, PAD, { clean: b.cleanedAll ? 1 : 1 - o.rem, mood, look: b.face, t: G.t, blink: b.blink > 0, hatHop: b.cleanedAll ? Math.sin(G.t * 6) * 0.1 : 0 });
  c.restore();
}
function drawParts(c) {
  for (const p of G.parts) {
    const a = clamp(p.life / p.max, 0, 1);
    c.globalAlpha = a;
    if (p.type === 'c') { circ(c, p.x, p.y, p.size); c.fillStyle = p.col; c.fill(); }
    else if (p.type === 's') { star(c, p.x, p.y, p.size * (0.5 + a * 0.5), 4, 0.35); c.fillStyle = p.col; c.fill(); }
    else if (p.type === 'm') { circ(c, p.x, p.y, p.size * (1.6 - a)); c.fillStyle = p.col; c.fill(); }
    else if (p.type === 'b') { circ(c, p.x, p.y, p.size); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.5; c.stroke(); c.fillStyle = 'rgba(200,240,255,.25)'; c.fill(); }
  }
  c.globalAlpha = 1;
}
function outlinedText(c, s, x, y, size, col) {
  c.font = `800 ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineWidth = size / 5; c.strokeStyle = OUT; c.lineJoin = 'round'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y);
}
function bubble(c, x, y, s, villain) {
  c.font = `800 20px ${FONT}`;
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (c.measureText(t).width > 230 && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur);
  const w = Math.max(...lines.map(l => c.measureText(l).width)) + 28, h = lines.length * 24 + 18;
  const bx = clamp(x - w / 2, G.cam.x + 8, G.cam.x + view.W - w - 8), by = Math.max(110, y - h);
  rrect(c, bx, by, w, h, 14); paint(c, villain ? '#e6f5c8' : '#fff', 3);
  c.beginPath(); c.moveTo(clamp(x, bx + 20, bx + w - 20) - 10, by + h - 1); c.lineTo(clamp(x, bx + 20, bx + w - 20), by + h + 16); c.lineTo(clamp(x, bx + 20, bx + w - 20) + 10, by + h - 1); paint(c, villain ? '#e6f5c8' : '#fff', 0);
  lines.forEach((l, i) => txt(c, l, bx + w / 2, by + 21 + i * 24, 20, villain ? '#3c5a10' : OUT));
}
function waterArrow(c, W) {
  const P = G.p, cx = G.cam.x, bob = Math.sin(G.t * 6) * 6;
  let best = null, bd = 1e9;
  for (const h of G.hydrants) { const d = Math.abs(h.x - P.x); if (d < bd) { bd = d; best = h; } }
  if (!best) return;
  if (best.x > cx - 10 && best.x < cx + W + 10) {
    const x = best.x - cx, y = GROUND - VIEW_OY - 120 + bob;
    poly(c, [x - 16, y, x + 16, y, x, y + 22]); paint(c, '#3a8cf0', 3); dropShape(c, x, y - 20, 9); paint(c, '#8fd8ff', 2.5);
    return;
  }
  const left = best.x < cx, x = left ? 46 : W - 110, y = 200 + bob, d = left ? -1 : 1;
  rrect(c, x - 34, y - 30, 68, 60, 18); paint(c, 'rgba(255,255,255,.95)', 3);
  c.beginPath(); c.moveTo(x - 4 * d, y - 14); c.lineTo(x + 22 * d, y); c.lineTo(x - 4 * d, y + 14); c.closePath(); paint(c, '#3a8cf0', 3);
  dropShape(c, x - 14 * d, y, 8); paint(c, '#8fd8ff', 2.5);
}
function edgeArrow(c, W) {
  if (!G.left || G.boss) return;
  const cx = G.cam.x;
  let best = null, bd = 1e9;
  for (const o of G.objs) if (o.count && o.grid && !o.done) { const ox = o.x + o.w / 2, d = Math.abs(ox - G.p.x); if (d < bd) { bd = d; best = { x: ox }; } }
  for (const e of G.enemies) if (e.req && e.hp > 0) { const d = Math.abs(e.x - G.p.x); if (d < bd) { bd = d; best = { x: e.x }; } }
  for (const pp of G.pipes) if (pp.open) { const d = Math.abs(pp.x - G.p.x); if (d < bd) { bd = d; best = { x: pp.x + pp.w / 2 }; } }
  if (!best) return;
  const ox = best.x;
  if (ox > cx - 20 && ox < cx + W + 20) return;
  const left = ox < cx, x = left ? 46 : W - 110, y = 300 + Math.sin(G.t * 5) * 6;
  c.save(); c.translate(x + (left ? -1 : 1) * Math.sin(G.t * 6) * 6, y);
  rrect(c, -34, -30, 68, 60, 18); paint(c, 'rgba(255,255,255,.9)', 3);
  c.beginPath(); const d = left ? -1 : 1; c.moveTo(-14 * d, -14); c.lineTo(14 * d, 0); c.lineTo(-14 * d, 14); c.closePath(); paint(c, '#6f9a2a', 3);
  c.restore();
}

// ---------------------------------------------------------------- HUD (DOM)
const hudCache = {};
function hudReset() { for (const k in hudCache) delete hudCache[k]; }
function hudSet(id, key, val, fn) { if (hudCache[key] === val) return; hudCache[key] = val; fn(document.getElementById(id), val); }
function hud() {
  const P = G.p;
  hudSet('hearts', 'h', P.hearts, (el, v) => { el.innerHTML = Array.from({ length: maxHearts() }, (_, i) => i).map(i => `<span class="heart${i < v ? '' : ' off'}"></span>`).join(''); });
  hudSet('coinN', 'c', SAVE.coins, (el, v) => { el.textContent = v; el.parentNode.classList.remove('pop'); void el.offsetWidth; el.parentNode.classList.add('pop'); });
  const tankPct = Math.round(P.tank / tankMax() * 100);
  hudSet('tankFill', 't', tankPct + '', (el, v) => { el.style.height = parseInt(v) + '%'; el.parentNode.classList.toggle('low', parseInt(v) < 20); });
  let prog, label; const G0 = G; if (G.under) G = G.under.surf;
  if (G.boss && G.boss.st !== 'enter') { prog = Math.min(1, G.boss.clean / G.boss.target); label = 'boss'; }
  else { let s = (G.birdsReq || 0) - (G.birdsLeft || 0) + G.pipes.length - (G.valvesLeft || 0); for (const o of G.objs) if (o.count && o.grid) s += 1 - o.rem; prog = G.total ? s / G.total : 1; label = `${G.total - G.left}/${G.total}`; }
  hudSet('progFill', 'p', Math.round(prog * 200), (el, v) => { el.style.width = (v / 2) + '%'; });
  G = G0;
  hudSet('progTxt', 'pl', label, (el, v) => { el.textContent = v === 'boss' ? 'Sir Sludgington' : v; document.getElementById('prog').classList.toggle('boss', v === 'boss'); });
  hudSet('nozzles', 'n', SAVE.noz + SAVE.nozzles.join(), UI.drawNozzles);
}
