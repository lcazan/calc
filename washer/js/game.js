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
  o.top = o.y - o.h;
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
function curNozzle() { return NOZZLES[SAVE.noz] || NOZZLES.fan; }
function curPressure() { return PRESSURE[SAVE.up.pressure] || PRESSURE[0]; }
function tankMax() { return TANK[SAVE.up.tank] || TANK[0]; }
function newPlayer(x) {
  return { x, y: GROUND, vx: 0, vy: 0, face: 1, ground: true, coyote: 0, jbuf: 0, walk: 0, hearts: 3, inv: 0, hurtT: 0,
    tank: tankMax(), gy: GROUND, on: null, spraying: false, hitting: false, aimA: 0.35, blinkT: 2.5, blink: 0, lock: false, sputT: 0, glugT: 0, lowSaid: false };
}
function newBlob(x, range) { return { kind: 'blob', x, y: GROUND, minX: x - range, maxX: x + range, dir: -1, hp: 1, r: 26, hop: Math.random() * 3, flash: 0, spd: 45 }; }
function startLevel(L, idx, demo) {
  G = { L, idx, demo: !!demo, theme: L.theme, t: 0, objs: [], plats: [], solids: [], hydrants: [], enemies: [], balls: [], coins: [], parts: [], texts: [], puddles: [],
    cam: { x: 0, shake: 0 }, aim: { x: 0, y: 0 }, tgt: null, retarget: 0, lvlCoins: 0, cleaned: 0,
    wall: L.wall ? { x: L.wall, open: false, melt: 0 } : null, finish: L.finish || 0, boss: null, arena: null,
    done: false, respawnT: 0, checkpoint: 120, nagT: 3, kidSay: null, demoT: 0, paused: false, waveT: 12 };
  let seed = (idx + 1) * 1000;
  for (const [type, x, v, by] of L.objs) G.objs.push(makeObj(type, x, by || GROUND, v || 0, L.dirt, seed++));
  G.total = G.objs.filter(o => o.count && o.grid).length;
  for (const [x, y, w, style, top] of (L.plats || [])) G.plats.push({ x, y, w, style, y0: y, y1: top || y, wait: 0 });
  for (const [kind, x, w, h] of (L.solids || [])) G.solids.push({ kind, x, y: GROUND - h, w, h, theme: L.theme });
  G.hydrants = (L.hydrants || []).map(x => ({ x, active: false }));
  for (const [x, range] of (L.blobs || [])) G.enemies.push(newBlob(x, range));
  for (const [x, range, y] of (L.birds || [])) G.enemies.push({ kind: 'bird', x, y, y0: y, minX: x - range, maxX: x + range, dir: 1, hp: 1, flash: 0, dropT: 2, r: 24, t: 0 });
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
function kidSay(s, speak) { G.kidSay = { s, t: 3 }; if (speak) Sfx.say(s); }
function bossSay(s) { if (!G.boss) return; G.boss.say = s; G.boss.sayT = 3; Sfx.say(s, true); }

// ---------------------------------------------------------------- update
function update(dt) {
  G.t += dt;
  if (G.done) { updParts(dt); updCoins(dt); updCam(dt); return; }
  updLifts(dt);
  updPlayer(dt);
  updSpray(dt);
  updEnemies(dt);
  updSpinners(dt);
  updWaves(dt);
  updBoss(dt);
  updBalls(dt);
  updCoins(dt);
  updParts(dt);
  updProgress(dt);
  updCam(dt);
  if (!G.demo) hud();
}
function solidsHit(x, y) { for (const s of G.solids) if (x + 15 > s.x && x - 15 < s.x + s.w && y > s.y + 2 && y - 86 < s.y + s.h) return s; return null; }
function updLifts(dt) {
  const P = G.p;
  for (const p of G.plats) {
    if (p.style !== 'lift') continue;
    const on = P.on === p && P.ground && G.respawnT <= 0;
    if (on) {
      if (p.y > p.y1) { p.y = Math.max(p.y1, p.y - 100 * dt); if (p.y === p.y1) Sfx.ding(); }
      p.wait = 1.5;
    } else { p.wait -= dt; if (p.wait <= 0 && p.y < p.y0) p.y = Math.min(p.y0, p.y + 100 * dt); }
    if (on) { P.y = p.y; P.gy = p.y; }
  }
}
function fallHurt(drop) {
  const P = G.p;
  if (P.inv > 0 || G.demo || G.done) return;
  P.hearts--; P.inv = 1.4; P.hurtT = 0.35;
  Sfx.hurt(); shake(8); floatText(P.x, P.y - 110, 'Ouch!', '#ffd23f', 30);
  for (let i = 0; i < 6; i++) part(P.x, P.y - 95, (Math.random() - 0.5) * 200, -Math.random() * 120, 0.7, 7, '#fff27a', 's', 300);
  if (!G.fallSaid) { G.fallSaid = true; kidSay('Ouch! Big falls hurt. Climb down carefully!', true); }
  if (P.hearts <= 0) { G.respawnT = 1.4; P.lock = true; Sfx.say("Oops! Let's try again!"); }
}
function updPlayer(dt) {
  const P = G.p;
  P.inv = Math.max(0, P.inv - dt); P.hurtT = Math.max(0, P.hurtT - dt);
  P.blinkT -= dt; if (P.blinkT < 0) { P.blink = 0.12; P.blinkT = 2 + Math.random() * 3; } P.blink = Math.max(0, P.blink - dt);
  if (G.respawnT > 0) {
    const before = G.respawnT; G.respawnT -= dt;
    if (before > 0.7 && G.respawnT <= 0.7) {
      P.x = G.arena && G.arena.started ? G.arena.L + 90 : G.checkpoint; P.y = GROUND; P.gy = GROUND; P.on = null; P.vx = P.vy = 0; P.hearts = 3; P.inv = 2; G.balls.length = 0;
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
  P.x = clamp(P.x, minX, maxX);
  // y
  const prevY = P.y, wasGround = P.ground, vyBefore = P.vy;
  P.y += P.vy * dt; P.ground = false; P.on = null;
  if (P.y >= GROUND) { P.y = GROUND; P.vy = 0; P.ground = true; }
  if (vyBefore >= 0) {
    for (const p of G.plats) if (prevY <= p.y + 1 && P.y >= p.y && P.x > p.x - 10 && P.x < p.x + p.w + 10) { P.y = p.y; P.vy = 0; P.ground = true; P.on = p; }
    for (const s2 of G.solids) if (prevY <= s2.y + 1 && P.y >= s2.y && P.x + 14 > s2.x && P.x - 14 < s2.x + s2.w) { P.y = s2.y; P.vy = 0; P.ground = true; }
  }
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
  if (P.tank <= 0 && !P.refill) { P.refill = true; Sfx.sputter(); if (!P.lowSaid) { P.lowSaid = true; kidSay('Out of water! Refilling... Red hydrants fill you up fast!', true); } }
  if (P.refill) {
    P.tank = Math.min(tankMax(), P.tank + 22 * dt); if (P.tank >= tankMax() * 0.35) P.refill = false;
    P.sputT -= dt; if (want && P.sputT <= 0) { Sfx.sputter(); P.sputT = 0.5; }
  }
  P.spraying = want && !P.refill && P.tank > 0;
  const hx = P.x + P.face * 10, hy = P.y - 40, R = pr.range * noz.range;
  const ok = (x, y) => { const dx = (x - hx) * P.face, dy = y - hy; if (dx < 16 || dx * dx + dy * dy > R * R) return false; const a = Math.atan2(dy, dx); return a > -1.25 && a < 1.1; };
  if (!P.spraying) {
    P.hitting = false; Sfx.spray(false, false, 0);
    if (!want && !P.refill) P.tank = Math.min(tankMax(), P.tank + 9 * dt);
    G.aim.x = hx + P.face * R * 0.5; G.aim.y = hy + 30; G.tgt = null;
    P.aimA = approach(P.aimA, 0.35, dt * 3);
    return;
  }
  P.tank = Math.max(0, P.tank - 7 * dt);
  // never spray behind the kid: after turning around (or a respawn) restart the stream in front
  if ((G.aim.x - hx) * P.face < 16) { G.aim.x = hx + P.face * 40; G.aim.y = hy + 10; G.tgt = null; }
  // choose a target
  G.retarget -= dt;
  let t = G.tgt;
  const valid = t && (t.k === 'ball' ? G.balls.includes(t.ref) && ok(t.ref.x, t.ref.y)
    : t.k === 'en' ? t.ref.hp > 0 && ok(t.ref.x, t.ref.y - t.ref.r * 0.7)
    : t.o.grid[t.i] > 0.06 && !t.o.done && ok(t.o.x + t.cx, t.o.top + t.cy));
  if (!valid || G.retarget <= 0 || t.k === 'cell') {
    let threat = null, bs = 1e12;
    for (const b of G.balls) if (!b.mud && Math.abs(b.x - P.x) < 220 && ok(b.x, b.y)) { const s = (b.x - hx) ** 2 + (b.y - hy) ** 2; if (s < bs) { bs = s; threat = { k: 'ball', ref: b }; } }
    if (!threat) for (const e of G.enemies) if (e.hp > 0 && ok(e.x, e.y - e.r * 0.7)) { const s = (e.x - hx) ** 2 + (e.y - hy) ** 2; if (s < bs) { bs = s; threat = { k: 'en', ref: e }; } }
    if (threat) t = threat;
    else if (!valid || G.retarget <= 0) t = findCell(hx, hy, R, ok);
    G.retarget = 0.25;
  }
  G.tgt = t;
  let tx, ty, sp = 650;
  if (!t) { tx = hx + P.face * R * 0.6; ty = hy + 25; }
  else if (t.k === 'cell') { tx = t.o.x + t.cx; ty = t.o.top + t.cy; }
  else { tx = t.ref.x; ty = t.k === 'en' ? t.ref.y - t.ref.r * 0.7 : t.ref.y; sp = 1500; }
  const dx = tx - G.aim.x, dy = ty - G.aim.y, d = Math.hypot(dx, dy), stepD = sp * dt;
  if (d <= stepD) { G.aim.x = tx; G.aim.y = ty; } else { G.aim.x += dx / d * stepD; G.aim.y += dy / d * stepD; }
  // keep the stream in front and inside the reachable angle
  const adx = Math.max(16, (G.aim.x - hx) * P.face), ady = G.aim.y - hy;
  P.aimA = clamp(Math.atan2(ady, adx), -1.25, 1.1);
  // clean
  const amt = 3.2 * noz.pow * pr.pow * dt, r = noz.r;
  let got = 0;
  const list = G.boss && G.boss.st === 'fight' ? G.objs.concat([G.boss.o]) : G.objs;
  for (const o of list) {
    const g = cleanAt(o, G.aim.x, G.aim.y, r, amt);
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
  for (const e of G.enemies) if (e.hp > 0 && Math.hypot(e.x - G.aim.x, e.y - e.r * 0.7 - G.aim.y) < e.r + r) { e.hp -= amt * 1.1; e.flash = 0.1; got += 0.01; }
  for (const b of G.balls) if (Math.hypot(b.x - G.aim.x, b.y - G.aim.y) < b.r + r) { b.hp -= amt; got += 0.01; }
  P.hitting = got > 0;
  // water spray particles
  if (Math.random() < 0.8) part(G.aim.x, G.aim.y, (Math.random() - 0.5) * 220 - P.face * 60, -Math.random() * 200, 0.4, 2 + Math.random() * 2.5, '#d6f1ff', 'c');
  if (Math.random() < 0.25) part(G.aim.x, G.aim.y, 0, -20, 0.5, r * 0.6, 'rgba(255,255,255,.5)', 'm', 0);
  Sfx.spray(true, P.hitting, SAVE.up.pressure);
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
    for (let j = 0; j < o.gh; j++) for (let i = 0; i < o.gw; i++) {
      const k = j * o.gw + i; if (!o.act[k] || o.grid[k] <= 0.06) continue;
      const cx = (i + 0.5) * CELL, cy = (j + 0.5) * CELL, wx = o.x + cx, wy = o.top + cy;
      const s = (wx - ax) ** 2 + (wy - ay) ** 2 + 0.2 * ((wx - hx) ** 2 + (wy - hy) ** 2);
      if (s < bs && ok(wx, wy)) { bs = s; best = { k: 'cell', o, i: k, cx, cy }; }
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
  floatText(o.x + o.w / 2, o.top - 10, pick(CHEERS), '#fff', 30);
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
  const P = G.p, swamp = G.theme === 'swamp';
  for (const e of G.enemies) {
    e.flash = Math.max(0, e.flash - dt);
    if (e.hp <= 0) continue;
    if (e.kind === 'wave') {
      e.size = 0.35 + 0.65 * Math.max(0, e.hp) / e.hp0; e.r = 46 * e.size; e.t += dt;
      e.x += e.dir * e.spd * dt;
      if (Math.random() < dt * 12) part(e.x - e.dir * 40 * e.size, GROUND - 10 - Math.random() * 40 * e.size, -e.dir * 40, -40, 0.6, 3 + Math.random() * 4, '#7fb52e', 'c');
      const hitSolid = G.solids.some(s => e.x > s.x - 10 && e.x < s.x + s.w + 10) || (G.wall && !G.wall.open && Math.abs(e.x - G.wall.x - 38) < 40);
      if (hitSolid) { e.hp = 0; e.noCoin = true; }
      else if (e.x < G.cam.x - 300 || e.x > G.cam.x + view.W + 400) { e.hp = 0; e.gone = true; }
      else if (Math.abs(P.x - e.x) < 52 * e.size + 12 && P.y > GROUND - 88 * e.size) hurtPlayer(e.x);
    } else if (e.kind === 'blob') {
      e.hop += dt * 6; e.x += e.dir * e.spd * dt;
      if (e.x < e.minX) { e.x = e.minX; e.dir = 1; } if (e.x > e.maxX) { e.x = e.maxX; e.dir = -1; }
      const dx = P.x - e.x;
      if (Math.abs(dx) < e.r + 14 && P.y > e.y - e.r * 1.6 && P.y - 86 < e.y) {
        if (P.vy > 150 && P.y < e.y - e.r * 0.7) { e.hp = 0; P.vy = -560; Sfx.jump(); }
        else hurtPlayer(e.x);
      }
    } else {
      e.t += dt; e.x += e.dir * 70 * dt; e.y = e.y0 + Math.sin(e.t * 2) * 22;
      if (e.x < e.minX) e.dir = 1; if (e.x > e.maxX) e.dir = -1;
      e.dropT -= dt;
      if (e.dropT <= 0 && Math.abs(P.x - e.x) < 90) { G.balls.push({ x: e.x, y: e.y + 14, vx: 0, vy: 40, r: 12, hp: 0.3, hp0: 0.3, slime: swamp }); e.dropT = 3.5; Sfx.throw(); }
      if (Math.abs(P.x - e.x) < 30 && Math.abs(P.y - 45 - e.y) < 50) hurtPlayer(e.x);
    }
    if (e.hp <= 0 && e.gone) continue;
    if (e.hp <= 0) {
      Sfx.pop(); splash(e.x, e.y - 20, e.kind === 'bird' ? '#4a3a5a' : e.kind === 'wave' ? '#7fb52e' : (swamp ? '#6f9a2a' : '#7b5431'), e.kind === 'wave' ? 30 : 16); bubbles(e.x, e.y - 20, 6);
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
    if (near && !G.spinSaid) { G.spinSaid = true; kidSay('That fountain is spraying mud everywhere! Wash it to make it stop!', true); }
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
  const blocked = x0 < 100 || x0 > G.L.len - 50 || G.solids.some(s => s.x + s.w > lo && s.x < hi) || (G.wall && !G.wall.open && G.wall.x > lo && G.wall.x < hi);
  if (blocked) { G.waveT = 3; return; }
  G.waveT = G.L.waveEvery * (0.8 + Math.random() * 0.5);
  G.enemies.push({ kind: 'wave', x: x0, y: GROUND, dir, spd: 85 + G.idx * 1.5, hp: 5, hp0: 5, r: 46, size: 1, flash: 0, t: 0 });
  Sfx.whoosh();
  if (!G.waveSaid) { G.waveSaid = true; kidSay('A slime wave! Spray it, or jump over it when it gets small!', true); }
}
function updBalls(dt) {
  const P = G.p;
  for (const b of G.balls) {
    b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.hp <= 0) { b.dead = true; for (let i = 0; i < 8; i++) part(b.x, b.y, (Math.random() - 0.5) * 240, (Math.random() - 0.5) * 240, 0.4, 3, '#d6f1ff', 'c'); Sfx.pop(); continue; }
    if (b.mud) {
      let hit = false;
      for (const o of G.objs) if (o.type !== 'spinner' && o.grid && b.x > o.x && b.x < o.x + o.w && b.y > o.top && b.y < o.y && dirtyAt(o, b.x, b.y, 26) > 0) { hit = true; break; }
      if (hit) { b.dead = true; Sfx.splat(); splash(b.x, b.y, b.slime ? '#6f9a2a' : '#7b5431', 6); continue; }
    }
    if (b.y >= GROUND - 4) { b.dead = true; Sfx.splat(); splash(b.x, GROUND - 4, b.slime ? '#6f9a2a' : '#7b5431', 10); G.puddles.push({ x: b.x, w: 40, life: 3, slime: b.slime }); continue; }
    if (b.x > P.x - 18 - b.r && b.x < P.x + 18 + b.r && b.y > P.y - 88 - b.r && b.y < P.y + b.r) { b.dead = true; hurtPlayer(b.x); }
  }
  G.balls = G.balls.filter(b => !b.dead);
  for (const p of G.puddles) p.life -= dt;
  G.puddles = G.puddles.filter(p => p.life > 0);
}
function updCoins(dt) {
  const P = G.p;
  for (const c of G.coins) {
    c.t += dt;
    const dx = P.x - c.x, dy = P.y - 45 - c.y, d = Math.hypot(dx, dy);
    if (d < 34) { c.got = true; SAVE.coins++; G.lvlCoins++; Sfx.coin(); part(c.x, c.y, 0, -40, 0.3, 8, '#fff27a', 's', 0); continue; }
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
  const left = G.objs.filter(o => o.count && o.grid && !o.done).length;
  G.left = left;
  if (G.demo) { if (!left) { G.demoT += dt; if (G.demoT > 2.5) UI.restartDemo(); } return; }
  const w = G.wall;
  if (w && !w.open && !left) {
    w.open = true; Sfx.melt(); sparkleBurst(w.x + 38, GROUND - 110, 30, 80);
    kidSay(G.arena ? 'The slime wall melted! Go find Sir Sludgington!' : 'All clean! The slime wall melted! Go!', true);
  }
  if (w && w.open) w.melt = Math.min(1, w.melt + dt * 0.8);
  if (w && !w.open && P.x > w.x - 150) {
    G.nagT -= dt;
    if (G.nagT <= 0) { G.nagT = 8; kidSay(left === 1 ? 'One more dirty thing to wash!' : `${left} more dirty things to wash!`, true); }
  }
  if (G.arena && !G.arena.started && P.x > G.arena.x + 120) startBoss();
  if (!G.arena && G.finish && w && w.open && P.x > G.finish - 20) completeLevel();
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
    say: '', sayT: 0, hitT: 0, ground: false, clean: 0, target: bossTarget(A.fight), diff: bossDiff(A.fight), blinkT: 3, blink: 0, tx: 0 };
  G.checkpoint = A.L + 90; G.hydrants.push({ x: A.L + 60, active: true });
  Sfx.music('boss');
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
    b.throwT -= dt; if (b.throwT <= 0 && b.ground) { throwBall(b, diff); b.throwT = [0, 2.9, 2.4, 2.0][diff] * (0.8 + Math.random() * 0.4); }
    b.jumpT -= dt; if (b.jumpT <= 0 && b.ground) { b.vy = -760; b.ground = false; b.vx = clamp((P.x - b.x) / 1.1, -300, 300); b.jumpT = 6.5 + Math.random() * 2; Sfx.throw(); }
    if (diff >= 2) {
      b.blobT -= dt;
      if (b.blobT <= 0) { b.blobT = 11; if (G.enemies.filter(e => e.kind === 'blob').length < 2) { const e = newBlob(b.x + b.face * 70, 0); e.minX = L + 60; e.maxX = R - 60; e.dir = b.face; G.enemies.push(e); Sfx.pop(); } }
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
  for (const c of G.coins) { if (!c.got) { SAVE.coins++; G.lvlCoins++; } } G.coins = [];
  setTimeout(() => UI.levelDone(), 600);
}

// ---------------------------------------------------------------- drawing
function render() {
  const c = view.ctx, W = view.W;
  c.setTransform(view.S, 0, 0, view.S, 0, 0);
  const sh = G.cam.shake, sx = (Math.random() - 0.5) * sh, sy = (Math.random() - 0.5) * sh;
  const cx = Math.round(G.cam.x);
  c.save(); c.translate(0, -VIEW_OY);
  drawBackdrop(c, G.theme, cx, W, G.t);
  c.translate(-cx + sx, sy);
  c.lineJoin = 'round'; c.lineCap = 'round';
  drawGround(c, G.theme, cx, W);
  const vis = (x, w) => x + w > cx - 50 && x < cx + W + 50;
  for (const [x, k] of (G.L.signs || [])) if (vis(x, 130)) drawSign(c, x, k, G.t);
  for (const p of G.plats) if (vis(p.x, p.w)) drawPlat(c, p, G.theme, G.t);
  for (const p of G.puddles) { c.globalAlpha = Math.min(1, p.life); ell(c, p.x, GROUND + 4, p.w, 7); c.fillStyle = p.slime ? '#6f9a2a' : '#6b4526'; c.fill(); c.globalAlpha = 1; }
  for (const o of G.objs) {
    if (!vis(o.x, o.w)) continue;
    if (o.need) recompose(o);
    const b = o.bounce > 0 ? Math.sin(o.bounce * 18) * o.bounce * 0.12 : 0;
    c.save(); c.translate(o.x + o.w / 2, o.y); c.scale(1 - b * 0.5, 1 + b); c.translate(-o.w / 2, -o.h);
    c.drawImage(o.art, 0, 0, o.w, o.h);
    if (o.grid && !(o.done && !o.need)) c.drawImage(o.out, 0, 0, o.w, o.h);
    c.restore();
    if (o.grid && !o.done && o.count) stink(c, o.x + o.w / 2, o.top + 4, G.t + o.x);
    else if (o.done && Math.random() < 0.02) part(o.x + Math.random() * o.w, o.top + Math.random() * o.h, 0, -10, 0.6, 6, '#fff', 's', 0);
  }
  for (const s of G.solids) if (vis(s.x, s.w)) drawSolid(c, s);
  for (const h of G.hydrants) if (vis(h.x - 30, 90)) drawHydrant(c, h.x, h.active);
  if (G.wall && vis(G.wall.x, 80)) drawWall(c, G.wall.x, G.t, G.wall.melt, G.theme === 'swamp');
  if (G.finish && vis(G.finish - 10, 100)) drawFinish(c, G.finish, G.t, G.wall ? G.wall.open : true);
  for (const k of G.coins) drawCoin(c, k.x, k.y, k.t);
  for (const o of G.objs) if (o.type === 'spinner' && vis(o.x, o.w)) drawSpinnerHead(c, o.x + o.w / 2, o.top + PAD + 30, o.ang || 0, o.done, G.t);
  for (const e of G.enemies) { if (e.kind === 'blob') drawBlob(c, e, G.t, G.theme === 'swamp'); else if (e.kind === 'wave') drawWave(c, e, G.t); else drawBird(c, e, G.t); }
  if (G.boss) drawBoss(c);
  for (const b of G.balls) drawBall(c, b, G.t, G.theme === 'swamp');
  drawPlayer(c);
  drawStream(c);
  drawParts(c);
  for (const t of G.texts) { c.globalAlpha = Math.min(1, t.life * 1.5); outlinedText(c, t.s, t.x, t.y, t.size, t.col); c.globalAlpha = 1; }
  if (G.kidSay) bubble(c, G.p.x, G.p.y - 120, G.kidSay.s, false);
  if (G.boss && G.boss.sayT > 0) bubble(c, G.boss.x, G.boss.y - 250, G.boss.say, true);
  c.restore();
  if (!G.demo) edgeArrow(c, W);
  if (G.respawnT > 0) {
    const a = G.respawnT > 0.7 ? (1.4 - G.respawnT) / 0.7 : G.respawnT / 0.7;
    c.fillStyle = `rgba(255,255,255,${clamp(a, 0, 1)})`; c.fillRect(0, 0, W, 540);
    c.globalAlpha = clamp(a, 0, 1); outlinedText(c, 'Oops! Try again!', W / 2, 270, 54, '#3a8cf0'); c.globalAlpha = 1;
  }
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
  const sq = b.ground ? 1 + Math.sin(G.t * 5) * 0.02 : 1;
  c.save(); c.translate(b.x, b.y + PAD); c.scale(1, sq); c.translate(-o.w / 2, -o.h);
  c.drawImage(o.art, 0, 0, o.w, o.h);
  if (!o.done || o.need) c.drawImage(o.out, 0, 0, o.w, o.h);
  c.restore();
  const mood = b.st === 'defeat' && b.cleanedAll ? 'happy' : b.hitT > 0 ? 'hit' : b.moodT > 0 ? b.mood : (b.st === 'flee' ? 'hit' : 'angry');
  c.save(); c.translate(b.x, b.y + PAD); c.scale(1, sq); c.translate(-o.w / 2, -o.h);
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
function edgeArrow(c, W) {
  if (!G.left || G.boss) return;
  const cx = G.cam.x;
  let best = null, bd = 1e9;
  for (const o of G.objs) if (o.count && o.grid && !o.done) { const ox = o.x + o.w / 2, d = Math.abs(ox - G.p.x); if (d < bd) { bd = d; best = o; } }
  if (!best) return;
  const ox = best.x + best.w / 2;
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
  hudSet('hearts', 'h', P.hearts, (el, v) => { el.innerHTML = [0, 1, 2].map(i => `<span class="heart${i < v ? '' : ' off'}"></span>`).join(''); });
  hudSet('coinN', 'c', SAVE.coins, (el, v) => { el.textContent = v; el.parentNode.classList.remove('pop'); void el.offsetWidth; el.parentNode.classList.add('pop'); });
  const tankPct = Math.round(P.tank / tankMax() * 100);
  hudSet('tankFill', 't', tankPct + (P.refill ? 'r' : ''), (el, v) => { el.style.height = parseInt(v) + '%'; el.parentNode.classList.toggle('low', parseInt(v) < 20 || !!P.refill); });
  let prog, label;
  if (G.boss && G.boss.st !== 'enter') { prog = Math.min(1, G.boss.clean / G.boss.target); label = 'boss'; }
  else { let s = 0; for (const o of G.objs) if (o.count && o.grid) s += 1 - o.rem; prog = G.total ? s / G.total : 1; label = `${G.total - G.left}/${G.total}`; }
  hudSet('progFill', 'p', Math.round(prog * 200), (el, v) => { el.style.width = (v / 2) + '%'; });
  hudSet('progTxt', 'pl', label, (el, v) => { el.textContent = v === 'boss' ? 'Sir Sludgington' : v; document.getElementById('prog').classList.toggle('boss', v === 'boss'); });
  hudSet('nozzles', 'n', SAVE.noz + SAVE.nozzles.join(), UI.drawNozzles);
}
