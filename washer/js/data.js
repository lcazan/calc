'use strict';
// Super Splash: game data (areas, level recipe, shop, nozzles, story)
const GROUND = 460;

const NOZZLES = {
  fan:   { name: 'Fan',   color: '#36c25b', r: 20, range: 1,    pow: 1 },
  jet:   { name: 'Jet',   color: '#ef4a3c', r: 11, range: 1.35, pow: 1.6 },
  wide:  { name: 'Wide',  color: '#f2f2f2', r: 32, range: 0.8,  pow: 0.8 },
  turbo: { name: 'Turbo', color: 'rainbow', r: 28, range: 1.2,  pow: 1.8 }
};
const NOZZLE_ORDER = ['fan', 'jet', 'wide', 'turbo'];
const NOZZLE_COST = { jet: 20, wide: 45, turbo: 120 };
const PRESSURE = [
  { psi: 1500, pow: 1,    range: 250 },
  { psi: 2000, pow: 1.35, range: 275 },
  { psi: 2700, pow: 1.75, range: 300 },
  { psi: 3400, pow: 2.2,  range: 325 },
  { psi: 4200, pow: 2.8,  range: 350 },
  { psi: 5000, pow: 3.4,  range: 375 }
];
const PRESSURE_COST = [30, 60, 100, 150, 220];
const TANK = [100, 150, 210, 280, 360];
const TANK_COST = [20, 45, 80, 120];
const HATS = { none: 0, cap: 15, helmet: 25, cowboy: 30, pirate: 40, wizard: 45, propeller: 60, crown: 80 };
const HAT_NAMES = { none: 'No hat', cap: 'Cap', helmet: 'Fire helmet', cowboy: 'Cowboy hat', pirate: 'Pirate hat', wizard: 'Wizard hat', propeller: 'Propeller hat', crown: 'Crown' };
const WCOLORS = { yellow: ['#ffc928', 0], red: ['#ef4a3c', 10], blue: ['#3a8cf0', 10], green: ['#43c46b', 10], purple: ['#9b5de5', 15], pink: ['#ff7eb6', 15] };

// 10 areas x 3 levels. The 3rd level of each area ends with a Sir Sludgington fight.
// ground: big things on the ground; high: smaller things put up high (on blocks, ledges, floating platforms)
const AREAS = [
  { name: 'Sunny Street', theme: 'street', dirt: 'mud', block: 'crate', icon: 'house',
    ground: [['car', 0], ['house', 0], ['fence'], ['swing'], ['car', 1], ['house', 1], ['doghouse']], high: [['mailbox'], ['trash'], ['doghouse']] },
  { name: 'Puddle Park', theme: 'park', dirt: 'mud', block: 'crate', icon: 'fountain',
    ground: [['slide'], ['fountain'], ['statue'], ['swing'], ['picnic'], ['bench']], high: [['bench'], ['trash'], ['picnic']] },
  { name: 'Big City', theme: 'city', dirt: 'soot', block: 'crate', icon: 'shop',
    ground: [['shop', 0], ['bus', 0], ['car', 4], ['shop', 1], ['car', 2], ['bus', 1]], high: [['trash'], ['billboard'], ['mailbox']] },
  { name: 'Sandy Beach', theme: 'beach', dirt: 'sand', block: 'stone', icon: 'lighthouse',
    ground: [['boat', 0], ['hut', 0], ['icecream', 0], ['lighthouse'], ['boat', 1], ['icecream', 1]], high: [['sandcastle'], ['hut', 1], ['sandcastle']] },
  { name: 'Happy Farm', theme: 'farm', dirt: 'mud', block: 'hay', icon: 'barn',
    ground: [['barn', 0], ['tractor', 0], ['coop'], ['pig', 0], ['barn', 1], ['tractor', 1]], high: [['pig', 1], ['coop'], ['pig', 0]] },
  { name: 'Sudsy School', theme: 'school', dirt: 'mud', block: 'crate', icon: 'school',
    ground: [['school'], ['bus', 2], ['seesaw'], ['slide'], ['bike']], high: [['bike'], ['trash'], ['seesaw']] },
  { name: 'Busy Airport', theme: 'airport', dirt: 'soot', block: 'crate', icon: 'plane',
    ground: [['plane', 0], ['tower'], ['cart'], ['plane', 1]], high: [['suitcase'], ['cart'], ['suitcase', 1]] },
  { name: 'Carnival', theme: 'carnival', dirt: 'slime', block: 'crate', icon: 'ferris',
    ground: [['ferris'], ['carousel'], ['popcorn'], ['icecream', 0]], high: [['teacup'], ['popcorn'], ['teacup', 1]] },
  { name: 'Train Station', theme: 'station', dirt: 'soot', block: 'crate', icon: 'train',
    ground: [['train'], ['wagon', 0], ['clock'], ['bench'], ['wagon', 1]], high: [['suitcase'], ['bench'], ['suitcase', 1]] },
  { name: 'Sludge Castle', theme: 'swamp', dirt: 'slime', block: 'stone', icon: 'gate',
    ground: [['gate'], ['machine'], ['cauldron'], ['gargoyle']], high: [['gargoyle'], ['cauldron']] }
];
const LEVEL_COUNT = AREAS.length * 3;

// Builds one level from the recipe. Needs OBJ (art.js) for object widths, so it runs after art.js has loaded.
// Level shape: objs [type,x,variant,baseY], solids [kind,x,w,h], plats [x,y,w,style,(liftTopY)], blobs [x,range], birds [x,range,y]
function buildLevel(i) {
  const a = Math.floor(i / 3), k = i % 3, A = AREAS[a], r = rng(i * 7919 + 13), boss = k === 2;
  const d = i / (LEVEL_COUNT - 1);
  const L = { name: A.name + ' ' + (k + 1), area: a, step: k, theme: A.theme, dirt: A.dirt, objs: [], solids: [], plats: [], hydrants: [], blobs: [], birds: [], signs: [] };
  const blk = A.block;
  let gc = Math.floor(r() * 7), hc = Math.floor(r() * 3), x = 300;
  const W = t => OBJ[t].w;
  const flat = [];
  const ground = () => {
    const n = d > 0.45 && r() < 0.6 ? 2 : 1;
    for (let j = 0; j < n; j++) { const [t, v] = A.ground[gc++ % A.ground.length]; const x0 = x; L.objs.push([t, x, v || 0]); x += W(t) + 80 + Math.floor(r() * 60); flat.push([x0, x - 60]); }
  };
  const high = () => A.high[hc++ % A.high.length];
  const stairs = (steps) => {
    const [t, v] = high(), top = Math.max(W(t) + 40, 170), h = steps * 70;
    for (let s = 1; s < steps; s++) L.solids.push([blk, x + (s - 1) * 70, 70, s * 70]);
    const tx = x + (steps - 1) * 70;
    L.solids.push([blk, tx, top, h]);
    L.objs.push([t, tx + (top - W(t)) / 2, v || 0, GROUND - h]);
    for (let s = steps - 1; s >= 1; s--) L.solids.push([blk, tx + top + (steps - 1 - s) * 70, 70, s * 70]);
    x = tx + top + (steps - 1) * 70 + 110;
  };
  const lift = () => {
    const [t, v] = high(), ly = GROUND - (d > 0.5 ? 250 : 220), lw = 110, ledge = W(t) + 60;
    L.plats.push([x, GROUND - 20, lw, 'lift', ly]);
    const lx = x + lw + 12;
    L.plats.push([lx, ly, ledge, 'wood']);
    L.objs.push([t, lx + 30, v || 0, ly]);
    const sx = lx + ledge + 6;
    L.solids.push([blk, sx, 70, 140], [blk, sx + 70, 70, 70]);
    x = sx + 140 + 110;
  };
  const hops = () => {
    const [t, v] = high(), pw = 120, tw = Math.max(W(t) + 40, 150);
    L.plats.push([x, 370, pw, 'float'], [x + 170, 295, pw, 'float'], [x + 340, 220, tw, 'float']);
    L.objs.push([t, x + 340 + (tw - W(t)) / 2, v || 0, 220]);
    const ex = x + 340 + tw + 50;
    L.plats.push([ex, 295, pw, 'float'], [ex + 170, 370, pw, 'float']);
    x = ex + 170 + pw + 110;
  };
  const hydrant = () => { L.hydrants.push(x - 40); x += 60; };
  let plan;
  if (i === 0) {
    L.signs.push([70, 'move'], [240, 'spray']); x = 420;
    plan = ['g', 'g', 'H', 'jump', 's2', 'g', 'g', 'H', 'g'];
  } else {
    const climbs = ['s3'];
    if (i >= 2) climbs.push('lift');
    if (i >= 4) climbs.push('hops');
    const n = boss ? 3 : 5 + Math.round(d * 3);
    plan = ['g'];
    for (let s = 1; s < n; s++) plan.push(s % 2 ? climbs[Math.floor(r() * climbs.length)] : 'g');
    if (i === 2) plan[1] = 'lift';
    if (i === 4) plan[1] = 'hops';
    plan.splice(2, 0, 'H'); if (plan.length > 6) plan.splice(6, 0, 'H');
  }
  for (const p of plan) {
    if (p === 'g') ground();
    else if (p === 'H') {
      if (i !== 0) hydrant();
      else if (!L.signs.some(s => s[1] === 'tank')) { L.hydrants.push(x + 20); L.signs.push([x + 90, 'tank']); x += 250; }
      else { L.hydrants.push(x + 20); x += 120; }
    }
    else if (p === 'jump') { L.signs.push([x, 'jump']); x += 170; }
    else if (p === 's2') stairs(2);
    else if (p === 's3') stairs(3);
    else if (p === 'lift') lift();
    else if (p === 'hops') hops();
  }
  if (i === 3 && !L.signs.length) L.signs.push([120, 'nozzle']);
  // enemies on flat stretches only
  const nb = i === 0 ? 1 : 1 + Math.floor(d * 3) + (r() < 0.5 ? 1 : 0);
  for (let j = 0; j < nb && flat.length; j++) { const [x0, x1] = flat[(j * 3 + 1) % flat.length]; if (x0 > 500) L.blobs.push([Math.round((x0 + x1) / 2), Math.max(40, Math.min(130, (x1 - x0) / 2))]); }
  const nbird = d > 0.2 ? 1 + Math.floor(d * 2) : 0;
  for (let j = 0; j < nbird; j++) L.birds.push([Math.round(700 + (x - 900) * (j + 0.5) / nbird), 180, 190 + Math.floor(r() * 50)]);
  L.wall = x + 40;
  if (boss) { L.boss = { fight: a + 1, x: L.wall + 120 }; L.len = L.boss.x + 1100; }
  else { L.finish = L.wall + 200; L.len = L.finish + 160; }
  return L;
}
const LEVELS = [];
function buildLevels() { LEVELS.length = 0; for (let i = 0; i < LEVEL_COUNT; i++) LEVELS.push(buildLevel(i)); }

const STORY = {
  intro: [
    ['town', 'This is Sudsy Town, the sparkliest town in the world!'],
    ['boss', 'But oh no! Here comes Sir Sludgington. He LOVES mud and slime!'],
    ['splat', 'SPLAT! He slimed the whole town. Cars, houses, even the doghouse!'],
    ['hero', 'Grab your pressure washer! Wash the town clean and catch Sir Sludgington!']
  ],
  ending: [
    ['end1', 'You did it! Sir Sludgington is squeaky clean! "I never knew clean felt so nice!" he said.'],
    ['end2', "Now he's called Sir Sparklington, and he helps keep Sudsy Town sparkly. THE END!"]
  ]
};
const FLEE_TEXT = ['Sir Sludgington got away! He ran to {n}. After him!', 'He got away again! Now he is making a mess at {n}!', "He's a little cleaner, but he ran off to {n}! Let's go!"];
function fleeStory(a) {
  const next = AREAS[a + 1];
  return [['flee:' + next.theme + ':' + bossTarget(a + 1).toFixed(2), FLEE_TEXT[a % FLEE_TEXT.length].replace('{n}', next.name)]];
}
// how clean he must get before he runs away (fight 1..10)
function bossTarget(f) { return f >= AREAS.length ? 0.93 : 0.2 + 0.05 * (f - 1); }
function bossDiff(f) { return f <= 3 ? 1 : f <= 7 ? 2 : 3; }

const BOSS_TAUNTS = ['Mwa-ha-ha! Mud is marvelous!', 'Slime time!', "You'll never clean me!", 'Catch this, little washer!', 'Dirt is delightful!', 'Messy is the best!'];
const BOSS_OUCH = ['Stop! That tickles!', 'Eek! Water!', 'Not the bubbles!', 'I was dirty on purpose!'];
const BOSS_INTRO = ['You again?! Try to clean THIS!', 'Back for more? Mwa-ha-ha!', 'I made this place extra muddy for you!', 'You will never wash me!'];
const BOSS_FINAL_INTRO = 'Welcome to my castle! Now get SLIMED!';
const BOSS_FLEE = ["Curses! You'll never catch me!", 'Too clean! Too clean! I must run!', 'I need more mud! Bye-bye!'];
const CHEERS = ['Squeaky clean!', 'Sparkly!', 'Wow!', 'Shiny!', 'So clean!'];
