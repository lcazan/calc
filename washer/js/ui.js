'use strict';
// Super Splash: menus, saving, input and the main loop
const SAVE_KEY = 'supersplash-v1';
const SAVE_DEF = { gender: 'boy', skin: 0, hair: 0, sound: true, music: true, voice: true, diff: 'medium', coins: 0, unlocked: 1, done: [],
  up: { pressure: 0, tank: 0 }, nozzles: ['fan'], noz: 'fan', hats: ['none'], hat: 'none', colors: ['yellow'], color: 'yellow', seenIntro: false };
function loadSave() {
  const d = JSON.parse(JSON.stringify(SAVE_DEF));
  // the save is kept twice (v1.25); if the main copy is missing or broken the backup is used, so progress is never lost to a bad read
  const read = k => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : null; } catch (e) { return null; } };
  const main = read(SAVE_KEY), back = read(SAVE_KEY + '-backup');
  const s = main || back;
  if (s) { Object.assign(d, s); d.up = Object.assign({ pressure: 0, tank: 0 }, s.up || {}); }
  if (d.ver !== 2) { d.ver = 2; d.unlocked = 1; d.done = []; } // 30-level layout: old progress no longer matches
  return d;
}
let SAVE = loadSave();
function persist() { const j = JSON.stringify(SAVE); try { localStorage.setItem(SAVE_KEY, j); } catch (e) { } try { localStorage.setItem(SAVE_KEY + '-backup', j); } catch (e) { } }
// ask the browser not to clear the game's storage when space runs low
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) { }

const $ = id => document.getElementById(id);
const UI = (() => {
  let scene = 'none', sceneT = 0, story = null, afterStory = null, overlay = null, settingsBack = null;
  const screens = ['title', 'map', 'areaPop', 'shop', 'settings', 'pause', 'complete', 'story'];
  function show(id) {
    for (const s of screens) $(s).classList.toggle('show', s === id);
    overlay = id;
    $('hud').classList.toggle('hidden', !(scene === 'game' && G && !G.demo && (id === null || id === 'pause')));
  }
  function setScene(s) { scene = s; sceneT = 0; }
  function click() { Sfx.init(); Sfx.click(); }

  // ---------------- title (demo runs behind it)
  function demoLevel() {
    const W = view.W, x = Math.round(W * 0.2);
    return { name: 'demo', theme: 'street', dirt: 'mud', len: W, startX: x, objs: [['car', x + 95, Math.floor(Math.random() * 4)]], hydrants: [], plats: [], solids: [], blobs: [], birds: [], signs: [] };
  }
  function title() {
    setScene('game'); startLevel(demoLevel(), 0, true); show('title'); Sfx.music('calm');
  }
  function restartDemo() { if (G && G.demo) startLevel(demoLevel(), 0, true); }

  // ---------------- map
  function map() {
    setScene('map'); show('map'); Sfx.spray(false, false, 0); Sfx.music('calm'); Sfx.hush();
    $('mapCoins').textContent = SAVE.coins;
    const box = $('mapNodes'); box.innerHTML = '';
    AREAS.forEach((A, a) => {
      const [x, y] = MAP_NODES[a], open = a * 3 < SAVE.unlocked, done = [0, 1, 2].every(k => SAVE.done[a * 3 + k]);
      const cur = Math.floor((SAVE.unlocked - 1) / 3) === a && !done;
      const b = document.createElement('button');
      b.className = 'node' + (open ? '' : ' locked') + (done ? ' done' : '') + (cur ? ' next' : '');
      b.style.left = (x * 100) + '%'; b.style.top = (y * 100) + '%';
      b.innerHTML = `<span class="num">${open ? a + 1 : ''}</span><span class="lbl">${A.name}</span>`;
      b.onclick = () => { click(); if (!open) { Sfx.nope(); Sfx.say('Finish the place before this one first!'); return; } areaPop(a); };
      box.appendChild(b);
    });
  }
  function areaPop(a) {
    const A = AREAS[a]; $('apTitle').textContent = A.name; Sfx.say(A.name);
    const box = $('apLevels'); box.innerHTML = '';
    for (let k = 0; k < 3; k++) {
      const i = a * 3 + k, open = i < SAVE.unlocked, done = SAVE.done[i];
      const b = document.createElement('button');
      b.className = 'node lv' + (open ? '' : ' locked') + (done ? ' done' : '') + (k === 2 ? ' boss' : '') + (i === SAVE.unlocked - 1 ? ' next' : '');
      b.innerHTML = `<span class="num">${open && k < 2 ? k + 1 : ''}</span><span class="lbl">${LEVELS[i].name}${k === 2 ? ' (Boss!)' : ''}</span>`;
      if (k === 2 && open) { const c = mkCanvas(80, 80); c.className = 'bossic'; drawBossIcon(c); b.querySelector('.num').appendChild(c); }
      b.onclick = () => { click(); if (!open) { Sfx.nope(); Sfx.say('Finish the level before this one first!'); return; } play(i); };
      box.appendChild(b);
    }
    show('areaPop');
  }
  function drawBossIcon(cv) {
    const c = cv.getContext('2d'); c.scale(80 / 200, 80 / 200); c.translate(10, 40);
    const o = storyObj('boss', 0, 1); c.drawImage(o.art, 0, 0, o.w, o.h); c.drawImage(o.out, 0, 0, o.w, o.h); drawBossFace(c, 6, 6, { clean: 0, mood: 'angry', look: 0 });
  }
  function play(i) {
    if (i === 0 && !SAVE.seenIntro) { SAVE.seenIntro = true; persist(); return runStory('intro', () => play(0)); }
    goFull();
    if (i > 0) LEVELS[i] = buildLevel(i, (Math.random() * 2 ** 31) | 0); // new layout every play
    setScene('game'); startLevel(LEVELS[i], i, false); show(null);
    const L = LEVELS[i];
    Sfx.music('happy'); banner(L.name + (L.boss ? ': Boss!' : ''));
    Sfx.say(L.boss ? `${L.name}. Find Sir Sludgington!` : `${L.name}!` + (i === 0 ? ' Hold the blue button to spray!' : ''));
  }
  function banner(s) { const b = $('banner'); b.textContent = s; b.classList.remove('go'); void b.offsetWidth; b.classList.add('go'); }

  // ---------------- level done
  function levelDone() {
    const i = G.idx, L = G.L;
    SAVE.done[i] = true; SAVE.unlocked = Math.max(SAVE.unlocked, Math.min(LEVELS.length, i + 2)); persist();
    Sfx.music(null); Sfx.fanfare();
    const won = L.boss && L.boss.fight >= AREAS.length;
    $('cmpTitle').textContent = won ? 'You won!' : 'Squeaky Clean!';
    $('cmpCoins').textContent = '+' + G.lvlCoins;
    $('cmpTotal').textContent = SAVE.coins;
    $('cmpNext').style.display = i + 1 < LEVELS.length ? '' : 'none';
    const c = $('cmpKid').getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 200, 200);
    c.translate(100, 190); c.scale(1.8, 1.8); drawKid(c, Object.assign(kidState(), { air: true, aim: -0.9 }));
    show('complete');
    Sfx.say(won ? 'You did it! You won!' : 'Squeaky clean! Great job!');
  }
  function afterLevel(next) {
    const i = G.idx, L = G.L;
    const go = () => next && i + 1 < LEVELS.length ? play(i + 1) : map();
    if (L.boss) return L.boss.fight >= AREAS.length ? runStory(STORY.ending, map) : runStory(fleeStory(L.area), go);
    go();
  }

  // ---------------- story
  function runStory(name, then) {
    story = { pages: typeof name === 'string' ? STORY[name] : name, i: 0 }; afterStory = then;
    setScene('story'); show('story'); Sfx.music('calm'); storyPage();
  }
  function storyPage() {
    const [, text] = story.pages[story.i];
    $('storyText').textContent = text; Sfx.say(text);
    $('storyNext').textContent = story.i + 1 < story.pages.length ? 'Next ▶' : "Let's go! ▶";
  }
  function storyNext() {
    click(); story.i++;
    if (story.i >= story.pages.length) { Sfx.hush(); const f = afterStory; story = null; afterStory = null; f && f(); }
    else storyPage();
  }

  // ---------------- pause
  function pause() {
    if (scene !== 'game' || !G || G.demo || G.done) return;
    G.paused = true; In.left = In.right = In.spray = In.jump = false; Sfx.spray(false, false, 0); show('pause'); persist();
  }
  function resume() { if (G) G.paused = false; show(null); }

  // ---------------- shop
  function iconCanvas(size, fn) { const c = mkCanvas(size * 2, size * 2); c.style.width = c.style.height = size + 'px'; const x = c.getContext('2d'); x.scale(2, 2); x.lineJoin = x.lineCap = 'round'; fn(x, size); return c; }
  let shopFromGame = false;
  function shop() { click(); shopFromGame = scene === 'game' && !!G && !G.demo && !G.done && G.paused; show('shop'); renderShop(); Sfx.say('Welcome to the Washer Shop! Spend your coins on cool stuff.'); }
  function renderShop() {
    $('shopCoins').textContent = SAVE.coins;
    const pv = $('shopKid').getContext('2d'); pv.setTransform(1, 0, 0, 1, 0, 0); pv.clearRect(0, 0, 240, 300);
    pv.translate(110, 280); pv.scale(2.4, 2.4); drawKid(pv, Object.assign(kidState(), { aim: 0.1, t: performance.now() / 1000 }));
    const box = $('shopItems'); box.innerHTML = '';
    const sec = t => { const h = document.createElement('h3'); h.textContent = t; box.appendChild(h); const g = document.createElement('div'); g.className = 'grid'; box.appendChild(g); return g; };
    const item = (g, icon, name, sub, state, price, onBuy, onUse) => {
      const d = document.createElement('div'); d.className = 'item ' + state; d.appendChild(icon);
      d.insertAdjacentHTML('beforeend', `<b>${name}</b><small>${sub || ''}</small>`);
      const b = document.createElement('button');
      if (state === 'using') b.textContent = '✔ Using';
      else if (state === 'owned') b.textContent = 'Use';
      else if (state === 'max') b.textContent = 'MAX';
      else b.innerHTML = `<span class="coin"></span>${price}`;
      b.onclick = () => {
        if (state === 'owned') { click(); onUse(); persist(); renderShop(); return; }
        if (state !== 'buy') return;
        if (SAVE.coins < price) { Sfx.init(); Sfx.nope(); Sfx.say(`You need ${price - SAVE.coins} more coins. Wash more stuff!`); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
        SAVE.coins -= price; onBuy(); persist(); Sfx.init(); Sfx.buy(); renderShop();
      };
      d.appendChild(b); g.appendChild(d);
    };
    let g = sec('Nozzles');
    for (const id of NOZZLE_ORDER) {
      const n = NOZZLES[id], own = SAVE.nozzles.includes(id);
      const desc = { fan: 'Good at everything', jet: 'Thin and super strong', wide: 'Big wide spray', turbo: 'Super strong rainbow spray!' }[id];
      item(g, iconCanvas(44, (c, s) => nozzleIcon(c, s, id)), n.name, desc, SAVE.noz === id ? 'using' : own ? 'owned' : 'buy', NOZZLE_COST[id],
        () => { SAVE.nozzles.push(id); SAVE.noz = id; }, () => { SAVE.noz = id; });
    }
    g = sec('Power & water');
    const pl = SAVE.up.pressure;
    item(g, iconCanvas(44, (c, s) => gaugeIcon(c, s, pl / (PRESSURE.length - 1))), 'Pressure', `${PRESSURE[pl].psi} PSI ${pips(pl, PRESSURE.length)}`, pl >= PRESSURE.length - 1 ? 'max' : 'buy', PRESSURE_COST[pl], () => { SAVE.up.pressure++; });
    const tl = SAVE.up.tank;
    item(g, iconCanvas(44, (c, s) => tankIcon(c, s, (tl + 1) / TANK.length)), 'Water tank', `Holds ${Math.round(TANK[tl] * tankMul())} ${pips(tl, TANK.length)}`, tl >= TANK.length - 1 ? 'max' : 'buy', TANK_COST[tl], () => { SAVE.up.tank++; });
    g = sec('Hats');
    for (const id in HATS) {
      const own = SAVE.hats.includes(id);
      item(g, iconCanvas(44, (c, s) => { c.translate(s / 2, s * 0.62); c.scale(0.9, 0.9); kidHead(c, Object.assign(kidState(), { hat: id })); }), HAT_NAMES[id], '', SAVE.hat === id ? 'using' : own ? 'owned' : 'buy', HATS[id],
        () => { SAVE.hats.push(id); SAVE.hat = id; }, () => { SAVE.hat = id; });
    }
    g = sec('Washer color');
    for (const id in WCOLORS) {
      const own = SAVE.colors.includes(id);
      item(g, iconCanvas(44, (c, s) => { rrect(c, s * 0.3, s * 0.15, s * 0.4, s * 0.7, 6); paint(c, WCOLORS[id][0], 2.5); circ(c, s / 2, s * 0.4, 5); paint(c, '#fff', 2); }), id[0].toUpperCase() + id.slice(1), '', SAVE.color === id ? 'using' : own ? 'owned' : 'buy', WCOLORS[id][1],
        () => { SAVE.colors.push(id); SAVE.color = id; }, () => { SAVE.color = id; });
    }
  }
  function pips(n, max) { let s = ''; for (let i = 0; i < max; i++) s += i <= n ? '●' : '○'; return s; }
  function nozzleIcon(c, s, id) {
    const n = NOZZLES[id], col = n.color === 'rainbow' ? null : n.color;
    c.globalAlpha = 0.45; c.fillStyle = col || '#c9eeff';
    if (!col) { const g = c.createLinearGradient(s * 0.4, 0, s, 0); ['#ef4a3c', '#ffd23f', '#43c46b', '#3a8cf0', '#9b5de5'].forEach((k, i) => g.addColorStop(i / 4, k)); c.fillStyle = g; }
    const spread = n.r / 32 * s * 0.4; poly(c, [s * 0.42, s / 2 - 2, s * 0.98, s / 2 - spread, s * 0.98, s / 2 + spread, s * 0.42, s / 2 + 2]); c.fill(); c.globalAlpha = 1;
    rrect(c, s * 0.06, s * 0.4, s * 0.36, s * 0.2, 4); paint(c, '#a7adb8', 2); circ(c, s * 0.42, s / 2, s * 0.12); paint(c, col || rainbow(0.3), 2);
  }
  function gaugeIcon(c, s, f) { circ(c, s / 2, s / 2, s * 0.42); paint(c, '#fff', 2.5); const a = Math.PI * (0.8 + f * 1.4); line(c, s / 2, s / 2, s / 2 + Math.cos(a) * s * 0.32, s / 2 + Math.sin(a) * s * 0.32, '#e8443a', 3); circ(c, s / 2, s / 2, 3); paint(c, OUT, 0); }
  function tankIcon(c, s, f) { rrect(c, s * 0.25, s * 0.1, s * 0.5, s * 0.8, 8); paint(c, '#eef6ff', 2.5); c.save(); rrect(c, s * 0.25, s * 0.1, s * 0.5, s * 0.8, 8); c.clip(); c.fillStyle = '#3a9cf0'; c.fillRect(0, s * (0.9 - 0.8 * f), s, s); c.restore(); rrect(c, s * 0.25, s * 0.1, s * 0.5, s * 0.8, 8); paint(c, null, 2.5); }

  // ---------------- settings
  function settings(back) {
    click(); settingsBack = back || overlay; show('settings'); renderSettings();
  }
  function renderSettings() {
    for (const g of ['boy', 'girl']) {
      const cv = $('pick_' + g), c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
      c.translate(cv.width / 2 - 6, cv.height * 0.6); c.scale(cv.width / 60, cv.width / 60); kidHead(c, Object.assign(kidState(), { g, hat: 'none' }));
      $('pick_' + g).parentNode.classList.toggle('sel', SAVE.gender === g);
    }
    const sw = (id, list, key) => { const box = $(id); box.innerHTML = ''; list.forEach((col, i) => { const b = document.createElement('button'); b.className = 'sw' + (SAVE[key] === i ? ' sel' : ''); b.style.background = col; b.onclick = () => { click(); SAVE[key] = i; persist(); renderSettings(); }; box.appendChild(b); }); };
    sw('skinSw', SKINS, 'skin'); sw('hairSw', HAIRS, 'hair');
    for (const k of ['sound', 'music', 'voice']) $('tg_' + k).classList.toggle('on', !!SAVE[k]);
    for (const k in DIFFS) $('df_' + k).classList.toggle('sel', SAVE.diff === k);
    $('resetBtn').textContent = 'Start over'; $('resetBtn').classList.remove('warn');
  }
  function toggle(k) { SAVE[k] = !SAVE[k]; persist(); Sfx.init(); Sfx.apply(); if (k === 'voice' && SAVE.voice) Sfx.say('I will read to you!'); if (k !== 'voice' || !SAVE.voice) Sfx.click(); if (!SAVE.voice) Sfx.hush(); renderSettings(); }
  function reset() {
    const b = $('resetBtn');
    if (!b.classList.contains('warn')) { b.classList.add('warn'); b.textContent = 'Tap again to erase everything'; return; }
    const keep = { gender: SAVE.gender, skin: SAVE.skin, hair: SAVE.hair, sound: SAVE.sound, music: SAVE.music, voice: SAVE.voice, diff: SAVE.diff };
    SAVE = Object.assign(JSON.parse(JSON.stringify(SAVE_DEF)), keep); persist(); renderSettings(); Sfx.nope();
  }
  function settingsClose() {
    click(); persist();
    if (settingsBack === 'pause') show('pause'); else if (settingsBack === 'map') map(); else title();
  }

  // ---------------- HUD nozzle picker
  function drawNozzles(el) {
    el.innerHTML = '';
    if (SAVE.nozzles.length < 2) return;
    for (const id of NOZZLE_ORDER) {
      if (!SAVE.nozzles.includes(id)) continue;
      const b = document.createElement('button'); b.className = 'noz' + (SAVE.noz === id ? ' sel' : '');
      b.appendChild(iconCanvas(40, (c, s) => nozzleIcon(c, s, id)));
      b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); Sfx.init(); Sfx.click(); SAVE.noz = id; persist(); banner(NOZZLES[id].name + ' nozzle'); });
      el.appendChild(b);
    }
  }
  function drawFace() {
    const cv = $('face'), c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#8fd8ff'; c.fillRect(0, 0, cv.width, cv.height);
    c.translate(cv.width / 2 - 6, cv.height * 0.62); c.scale(cv.width / 56, cv.width / 56);
    const P = G && G.p; kidHead(c, Object.assign(kidState(), { blink: P && P.blink > 0, hurt: P && P.hurtT > 0 }));
  }

  // ---------------- input
  function bindHold(id, key) {
    const el = $(id);
    const down = e => { e.preventDefault(); Sfx.init(); In[key] = true; if (key === 'jump') In.jp = true; el.classList.add('on'); try { el.setPointerCapture(e.pointerId); } catch (x) { } };
    const up = () => { In[key] = false; el.classList.remove('on'); };
    el.addEventListener('pointerdown', down); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  const KEYS = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'jump', w: 'jump', W: 'jump', ' ': 'jump', x: 'spray', X: 'spray', j: 'spray', J: 'spray', f: 'spray', F: 'spray', Shift: 'spray' };
  function keys() {
    addEventListener('keydown', e => {
      const k = KEYS[e.key];
      if (k) { e.preventDefault(); Sfx.init(); if (k === 'jump' && !e.repeat) In.jp = true; In[k] = true; }
      if ((e.key === 'Escape' || e.key === 'p') && scene === 'game') { G && G.paused ? resume() : pause(); }
      if (e.key === 'Enter' && overlay === 'story') storyNext();
    });
    addEventListener('keyup', e => { const k = KEYS[e.key]; if (k) In[k] = false; });
    addEventListener('blur', () => { In.left = In.right = In.spray = In.jump = false; });
  }
  function goFull() {
    if (!matchMedia('(pointer:coarse)').matches) return;
    const d = document.documentElement;
    if (!document.fullscreenElement && d.requestFullscreen) d.requestFullscreen({ navigationUI: 'hide' }).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => { }); }).catch(() => { });
  }
  function resize() {
    const w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2), cv = view.cv;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); view.S = cv.height / 540; view.W = cv.width / view.S;
  }

  // ---------------- main loop
  let last = 0, faceT = 0;
  function loop(ts) {
    const dt = Math.min(0.033, Math.max(0, (ts - last) / 1000)); last = ts; sceneT += dt;
    const c = view.ctx;
    try {
      if (scene === 'game' && G) {
        if (!G.paused) update(dt);
        render();
        faceT -= dt; if (faceT <= 0 && !G.demo) { faceT = 0.1; drawFace(); }
      } else if (scene === 'map') {
        c.setTransform(view.S, 0, 0, view.S, 0, 0); c.lineJoin = c.lineCap = 'round';
        drawMap(c, view.W, 540, sceneT, SAVE.unlocked, Object.assign(kidState(), { t: sceneT }));
      } else if (scene === 'story' && story) {
        c.setTransform(view.S, 0, 0, view.S, 0, 0); c.lineJoin = c.lineCap = 'round';
        drawStoryPic(c, story.pages[story.i][0], view.W, 540, sceneT, Object.assign(kidState(), { t: sceneT }));
      }
    } catch (err) { console.error(err); }
    requestAnimationFrame(loop);
  }
  function boot() {
    buildLevels();
    view.cv = $('cv'); view.ctx = view.cv.getContext('2d');
    resize(); addEventListener('resize', () => { resize(); if (scene === 'map') map(); });
    bindHold('bL', 'left'); bindHold('bR', 'right'); bindHold('bJump', 'jump'); bindHold('bSpray', 'spray');
    keys();
    document.addEventListener('visibilitychange', () => { if (document.hidden) { pause(); persist(); Sfx.spray(false, false, 0); } });
    document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.scroll')) e.preventDefault(); }, { passive: false });
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault());
    const on = (id, f) => $(id).addEventListener('click', f);
    on('playBtn', () => { click(); goFull(); map(); });
    on('titleSet', () => settings('title'));
    on('mapHome', () => { click(); title(); });
    on('mapShop', shop);
    on('apBack', () => { click(); show('map'); });
    on('mapSet', () => settings('map'));
    on('shopBack', () => { click(); if (shopFromGame) { shopFromGame = false; resume(); hudReset(); } else { show(scene === 'map' ? 'map' : null); map(); } });
    on('hudShop', () => { pause(); if (G && G.paused) shop(); });
    on('pauseShop', shop);
    on('gear', () => { click(); pause(); });
    on('resumeBtn', () => { click(); resume(); });
    on('restartBtn', () => { click(); play(G.idx); });
    on('pauseMap', () => { click(); persist(); map(); });
    on('pauseSet', () => settings('pause'));
    on('setBack', settingsClose);
    on('pickBoy', () => { click(); SAVE.gender = 'boy'; persist(); renderSettings(); });
    on('pickGirl', () => { click(); SAVE.gender = 'girl'; persist(); renderSettings(); });
    for (const k of ['sound', 'music', 'voice']) on('tg_' + k, () => toggle(k));
    for (const k in DIFFS) on('df_' + k, () => { click(); SAVE.diff = k; persist(); if (G && G.p) { G.p.hearts = Math.min(G.p.hearts, maxHearts()); G.p.tank = Math.min(G.p.tank, tankMax()); hudReset(); } renderSettings(); });
    on('resetBtn', reset);
    on('storyNext', storyNext);
    on('storySkip', () => { click(); story.i = story.pages.length - 1; storyNext(); });
    on('cmpMap', () => { click(); afterLevel(false); });
    on('cmpShop', () => { click(); afterLevel(false); setTimeout(() => { if (overlay === 'map') shop(); }, 50); });
    on('cmpNext', () => { click(); afterLevel(true); });
    title();
    requestAnimationFrame(loop);
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
  }
  return { boot, levelDone, restartDemo, drawNozzles, get scene() { return scene; }, play, map, title };
})();
(document.fonts && document.fonts.load ? Promise.race([document.fonts.load('800 20px "Baloo 2"').catch(() => { }), new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => UI.boot());
