'use strict';
// Super Splash: game data (areas, level recipe, shop, nozzles, story)
const GROUND = 460;

const NOZZLES = {
  fan:   { name: 'Fan',   color: '#36c25b', r: 20, range: 1,    pow: 1 },
  jet:   { name: 'Jet',   color: '#ef4a3c', r: 11, range: 1,    pow: 1.8 },
  wide:  { name: 'Wide',  color: '#f2f2f2', r: 32, range: 0.85, pow: 0.8 },
  turbo: { name: 'Turbo', color: 'rainbow', r: 28, range: 1,    pow: 1.8 }
};
// Spray reach is the same for everyone (upgrades only add power), so high-up things need climbing.
const MAX_REACH = 300;
// Things standing this high above the ground can only be washed when the kid is up near them (feet at most CLIMB_GAP below their base).
const HIGH_ABOVE = 100, CLIMB_GAP = 85;
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
// extras (v1.30): soap needs Pressure maxed; the fire hose hooks onto red hydrants
const SOAP_COST = 200, HOSE_COST = 150;
const HATS = { none: 0, cap: 15, helmet: 25, cowboy: 30, pirate: 40, wizard: 45, propeller: 60, crown: 80 };
const HAT_NAMES = { none: 'No hat', cap: 'Cap', helmet: 'Fire helmet', cowboy: 'Cowboy hat', pirate: 'Pirate hat', wizard: 'Wizard hat', propeller: 'Propeller hat', crown: 'Crown' };
const WCOLORS = { yellow: ['#ffc928', 0], red: ['#ef4a3c', 10], blue: ['#3a8cf0', 10], green: ['#43c46b', 10], purple: ['#9b5de5', 15], pink: ['#ff7eb6', 15] };

// 10 areas x 3 levels. The 3rd level of each area ends with a Sir Sludgington fight.
// ground: big things on the ground; high: smaller things put up high (on blocks, ledges, floating platforms)
const AREAS = [
  { name: 'Sunny Street', theme: 'street', dirt: 'mud', block: 'crate', icon: 'house', scenes: [
    // story: a walk down a sunny morning street
    { name: 'Sunny Street', story: true, ground: [['house', 0], ['mailbox'], ['car', 0], ['doghouse'], ['fence'], ['lemonade'], ['house', 2], ['kiddiepool'], ['grill'], ['birdbath'], ['car', 3], ['treehouse'], ['mower'], ['house', 1], ['redwagon'], ['trash'], ['bike'], ['car', 2]],
      high: [['flowerpot'], ['mailbox'], ['trash'], ['bike']] },
    // story: Saturday on Garage Lane: fixing, tinkering, a yard sale, a camper getting ready for a trip
    { name: 'Garage Lane', story: true, ground: [['garage'], ['car', 1], ['toolbench'], ['motorcycle'], ['hoop'], ['garagesale'], ['van'], ['redwagon'], ['rv'], ['boat', 0], ['house', 1], ['grill'], ['car', 2], ['mower'], ['doghouse'], ['fence'], ['mailbox'], ['bike']],
      high: [['toolbox'], ['paintcans'], ['bike'], ['trash']] },
    // story: shops at the corner: bus stop, newspapers, fruit, flowers, a cafe, the market
    { name: 'Corner Market', story: true, ground: [['busstop'], ['bus', 0], ['newsstand'], ['shop', 0], ['fruitstand'], ['flowerstand'], ['cafe'], ['shop', 1], ['vending'], ['bench'], ['car', 4], ['trash'], ['mailbox'], ['car', 2]],
      high: [['basket'], ['flowerpot'], ['trash'], ['bench']] } ] },
  { name: 'Puddle Park', theme: 'park', dirt: 'mud', block: 'crate', icon: 'fountain', scenes: [
    { name: 'Playground', ground: [['slide'], ['swing'], ['seesaw'], ['sandbox']], high: [['bench'], ['trash']] },
    { name: 'Duck Pond', ground: [['fountain'], ['statue'], ['boat', 0], ['bench']], high: [['picnic'], ['bench']] },
    { name: 'Flower Garden', ground: [['gazebo'], ['greenhouse'], ['picnic']], high: [['bench'], ['picnic']] } ] },
  { name: 'Big City', theme: 'city', dirt: 'soot', block: 'crate', icon: 'shop', scenes: [
    { name: 'Downtown', ground: [['shop', 1], ['bus', 0], ['car', 4], ['bus', 1]], high: [['billboard'], ['trash']] },
    { name: 'Construction Site', ground: [['digger'], ['mixer'], ['cones']], high: [['cones'], ['trash']] },
    { name: 'Fire Station', ground: [['firehouse'], ['firetruck'], ['car', 4]], high: [['trash'], ['mailbox']] } ] },
  { name: 'Sandy Beach', theme: 'beach', dirt: 'sand', block: 'stone', icon: 'lighthouse', scenes: [
    { name: 'Boardwalk', ground: [['hut', 0], ['icecream', 0], ['surfrack'], ['hut', 1]], high: [['sandcastle'], ['umbrella']] },
    { name: 'Harbor', ground: [['boat', 0], ['lighthouse'], ['boat', 1]], high: [['hut', 1], ['sandcastle']] },
    { name: 'Sand Dunes', ground: [['lifeguard'], ['umbrella'], ['icecream', 1]], high: [['sandcastle'], ['umbrella']] } ] },
  { name: 'Happy Farm', theme: 'farm', dirt: 'mud', block: 'hay', icon: 'barn', scenes: [
    { name: 'Barnyard', ground: [['barn', 0], ['coop'], ['pig', 0], ['barn', 1]], high: [['pig', 1], ['coop']] },
    { name: 'Corn Fields', ground: [['tractor', 0], ['scarecrow'], ['haywagon'], ['tractor', 1]], high: [['pig', 0], ['coop']] },
    { name: 'Orchard', ground: [['silo'], ['cow'], ['haywagon']], high: [['cow'], ['pig', 1]] } ] },
  { name: 'Sudsy School', theme: 'school', dirt: 'mud', block: 'crate', icon: 'school', scenes: [
    // story: arriving at school in the morning, then walking all around the schoolyard
    { name: 'Schoolyard', story: true, ground: [['guard'], ['car', 1], ['bus', 2], ['bikerack'], ['flagpole'], ['school'], ['bench'], ['lunchtable'], ['drinkfountain'], ['hoop'], ['tetherball'], ['dome'], ['garden'], ['hutch'], ['portable'], ['lostfound'], ['greenhouse'], ['vending'], ['clock'], ['statue'], ['trash'], ['van'], ['picnic'], ['car', 3], ['icecream', 0], ['mailbox'], ['bike'], ['fence'], ['bell'], ['playhouse'], ['bleachers'], ['cones']],
      high: [['backpack'], ['lunchbox'], ['globe'], ['ballbucket'], ['bike'], ['trash']] },
    // story: the bell rings and everyone runs out to play
    { name: 'Recess', story: true, ground: [['bell'], ['drinkfountain'], ['slide'], ['swing'], ['springrider'], ['seesaw'], ['sandbox'], ['merrygo'], ['monkeybars'], ['tunnel'], ['tires'], ['climbwall'], ['pirateship'], ['playhouse'], ['chalkboard'], ['ballcart'], ['puppetshow'], ['balloonstand'], ['popcorn'], ['picnic'], ['bench'], ['gazebo'], ['fountain'], ['garden'], ['dome'], ['hoop'], ['trash'], ['fence'], ['lostfound'], ['lunchtable'], ['tetherball'], ['hutch']],
      high: [['lunchbox'], ['ballbucket'], ['backpack'], ['globe'], ['trash'], ['bike']] },
    // story: game day at the sports field
    { name: 'Sports Field', story: true, ground: [['bus', 2], ['bleachers'], ['goal'], ['scoreboard'], ['snackbar'], ['dugout'], ['cones'], ['medalstand'], ['goalpost'], ['ballcart'], ['bench'], ['van'], ['drinkfountain'], ['trash'], ['fence']],
      high: [['trophy'], ['cooler'], ['ballbucket'], ['backpack']] } ] },
  { name: 'Busy Airport', theme: 'airport', dirt: 'soot', block: 'crate', icon: 'plane', scenes: [
    { name: 'Runway', ground: [['plane', 0], ['tower'], ['plane', 1]], high: [['suitcase'], ['cart']] },
    { name: 'Hangar', ground: [['helicopter'], ['fueltruck'], ['helicopter']], high: [['cart'], ['suitcase', 1]] },
    { name: 'Terminal', ground: [['cart'], ['bus', 0], ['vending']], high: [['suitcase'], ['suitcase', 1]] } ] },
  { name: 'Carnival', theme: 'carnival', dirt: 'slime', block: 'crate', icon: 'ferris', scenes: [
    { name: 'Big Rides', ground: [['ferris'], ['carousel'], ['teacup', 0]], high: [['teacup', 1], ['popcorn']] },
    { name: 'Game Alley', ground: [['popcorn'], ['balloonstand'], ['icecream', 0]], high: [['teacup'], ['popcorn']] },
    { name: 'Big Top', ground: [['circustent'], ['cannon'], ['balloonstand']], high: [['popcorn'], ['teacup', 1]] } ] },
  { name: 'Train Station', theme: 'station', dirt: 'soot', block: 'crate', icon: 'train', scenes: [
    { name: 'Platform 9', ground: [['train'], ['wagon', 0], ['bench'], ['clock']], high: [['suitcase'], ['bench']] },
    { name: 'Freight Yard', ground: [['freightcar', 0], ['freightcar', 1], ['wagon', 1]], high: [['suitcase', 1], ['cones']] },
    { name: 'Ticket Hall', ground: [['ticketbooth'], ['vending'], ['clock']], high: [['bench'], ['suitcase']] } ] },
  { name: 'Sludge Castle', theme: 'swamp', dirt: 'slime', block: 'stone', icon: 'gate', scenes: [
    { name: 'Stinky Swamp', ground: [['swamphut'], ['cauldron'], ['gargoyle']], high: [['cauldron'], ['gargoyle']] },
    { name: 'Castle Gate', ground: [['gate'], ['knight'], ['knight']], high: [['gargoyle'], ['cauldron']] },
    { name: 'Throne Room', ground: [['machine'], ['throne'], ['knight']], high: [['gargoyle'], ['cauldron']] } ] }
];
const LEVEL_COUNT = AREAS.length * 3;

// Builds one level from the recipe. Needs OBJ (art.js) for object widths, so it runs after art.js has loaded.
// Level shape: objs [type,x,variant,baseY], solids [kind,x,w,h], plats [x,y,w,style,(liftTopY)], blobs [x,range], birds [x,range,y]
// seed: a new one each time a level is played (ui.js play) -> same ingredients, new order; level 1 is always the fixed tutorial
function buildLevel(i, seed) {
  const a = Math.floor(i / 3), k = i % 3, A = AREAS[a], SC = A.scenes[k], r = rng(i === 0 || seed == null ? i * 7919 + 13 : seed), boss = k === 2;
  const d = i / (LEVEL_COUNT - 1);
  const L = { name: SC.name, area: a, step: k, bgv: k, tough: 2 + 5 * i / (LEVEL_COUNT - 1), theme: A.theme, dirt: A.dirt, objs: [], solids: [], plats: [], hydrants: [], blobs: [], birds: [], signs: [], holes: [], toggles: [], pipes: [], towers: [], belts: [], pools: [], birdZones: [], infest: [], puddles: [] };
  const blk = A.block;
  let gc = SC.story ? 0 : Math.floor(r() * 7), hc = SC.story ? 0 : Math.floor(r() * 3), x = 300; // story scenes (v1.31) walk their list in order
  const W = t => OBJ[t].w;
  const flat = [];
  const ground = () => {
    const n = d > 0.45 && r() < 0.6 ? 2 : 1;
    for (let j = 0; j < n; j++) { const [t, v] = SC.ground[gc++ % SC.ground.length]; const x0 = x; L.objs.push([t, x, v || 0]); x += W(t) + 80 + Math.floor(r() * 60); flat.push([x0, x - 60]); }
  };
  const high = () => SC.high[hc++ % SC.high.length];
  // block stairs; outside the tutorial the shape varies: 2-4 steps, narrow or wide steps, and sometimes floating steps down
  const stairs = (steps) => {
    let sw = 70, floatDown = false;
    if (i > 0) { steps = 2 + Math.floor(r() * 3); sw = r() < 0.5 ? 70 : 100; floatDown = r() < 0.4; }
    const [t, v] = high(), top = Math.max(W(t) + 40, 170), h = steps * 70;
    for (let s = 1; s < steps; s++) L.solids.push([blk, x + (s - 1) * sw, sw, s * 70]);
    const tx = x + (steps - 1) * sw;
    L.solids.push([blk, tx, top, h]);
    L.objs.push([t, tx + (top - W(t)) / 2, v || 0, GROUND - h]);
    if (floatDown) {
      const fx = tx + top + 40;
      L.plats.push([fx, GROUND - Math.round(h * 0.62), 110, 'float'], [fx + 170, GROUND - Math.round(h * 0.3), 110, 'float']);
      x = fx + 170 + 110 + 110;
    } else {
      for (let s = steps - 1; s >= 1; s--) L.solids.push([blk, tx + top + (steps - 1 - s) * sw, sw, s * 70]);
      x = tx + top + (steps - 1) * sw + 110;
    }
  };
  // Mario-style run: a sewer pit with 2-4 platforms sliding left and right over it (v1.17)
  const movers = () => {
    const n = Math.min(4, 2 + (d > 0.35 ? 1 : 0) + (d > 0.7 ? 1 : 0) + (r() < 0.3 ? 1 : 0)), pw = 120, gap = 230, amp = 60 + Math.round(d * 30);
    const spd = 1.7 + d * 0.7, opp = d > 0.25, px = x + 40;
    for (let j = 0; j < n; j++) {
      const y = GROUND - (j % 2 ? 110 : 70) - (d > 0.5 && j === n - 1 ? 40 : 0);
      L.plats.push([px + 10 + j * gap, y, pw, 'mover', 0, amp, 0, spd, opp && j % 2 ? Math.PI : 0]);
    }
    const pitW = 10 + (n - 1) * gap + pw + 50;
    L.holes.push([px, pitW]);
    x = px + pitW + 90;
  };
  // two elevator platforms going up and down by themselves, with a high ledge between them (v1.17)
  const elev = () => {
    const [t, v] = high(), ew = 110, ly = GROUND - 230, ledge = W(t) + 60;
    L.plats.push([x, GROUND - 20, ew, 'mover', 0, 0, 210, 1.3, 0]);
    const lx = x + ew + 12;
    L.plats.push([lx, ly, ledge, 'wood']);
    L.objs.push([t, lx + 30, v || 0, ly]);
    L.plats.push([lx + ledge + 12, GROUND - 20, ew, 'mover', 0, 0, 210, 1.3, Math.PI]);
    x = lx + ledge + 12 + ew + 110;
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
  // spray-lift block next to a column too tall to jump: stand on it, spray, ride up (v1.11)
  const tog = () => {
    const [t, v] = high(), tw = 110, cw = Math.max(W(t) + 40, 150);
    L.toggles.push([x, tw, 24, 180]);
    const cx = x + tw;
    L.solids.push([blk, cx, cw, 210]);
    L.objs.push([t, cx + (cw - W(t)) / 2, v || 0, GROUND - 210]);
    L.solids.push([blk, cx + cw, 70, 140], [blk, cx + cw + 70, 70, 70]);
    x = cx + cw + 140 + 110;
  };
  const hole = () => { x += 50; const w = 80 + Math.floor(r() * 25); L.holes.push([x, w]); x += w + 70; };
  // sewer entrance (v1.23): a wide hole with a SEWER ENTRANCE sign; falling in leads to an underground level
  const sewerIn = () => { x += 200; L.signs.push([x - 165, 'sewer']); L.holes.push([x, 130, 1]); x += 130 + 90; };
  const pipe = () => { x += 260; L.pipes.push(x); x += 90 + 130; };
  // slime tower (v1.18): 80-110 tall (under the 130 fall-damage drop, v1.30), shoots slime at kid height; stomp its top to plug it
  const tower = () => { x += 90; L.towers.push([x, 70, 80 + Math.round(r() * 30)]); x += 70 + 150; };
  // monster scale by difficulty (easy ×0.5, medium ×0.75, hard ×1, ultra ×2; v1.21)
  const mm = i === 0 ? 1 : ({ easy: 0.5, medium: 0.75, hard: 1, ultra: 2 })[typeof SAVE !== 'undefined' && SAVE.diff] || 0.75;
  // bird alley (v1.30): up to 10 birds fly in one after another over this stretch
  const birdZone = () => { const x0 = x; ground(); ground(); L.birdZones.push([x0, x, Math.min(10, Math.max(3, Math.round((6 + d * 5) * mm)))]); };
  // conveyor belt (v1.30): runs backwards at walking speed; jump while walking to get across; mud monsters keep coming from its right end
  const belt = () => { x += 80; const w = 520 + Math.round(d * 200); L.belts.push([x, w, Math.round((2.6 - d) / mm * 10) / 10]); x += w + 90; };
  // swimming pool (v1.30): steps up, a tiled wall, water with 1-2 hearts at the bottom, wall and steps down
  const pool = () => {
    L.solids.push([blk, x, 70, 70], [blk, x + 70, 70, 140], ['poolwall', x + 140, 30, 200]);
    const ix = x + 170, iw = 380;
    L.pools.push([ix, iw]);
    for (let k = 0, n = r() < 0.5 ? 1 : 2; k < n; k++) L.pools[L.pools.length - 1].push(ix + Math.round(iw * (n === 1 ? 0.5 : 0.3 + 0.4 * k)));
    L.solids.push(['poolwall', ix + iw, 30, 200], [blk, ix + iw + 30, 70, 140], [blk, ix + iw + 100, 70, 70]);
    x = ix + iw + 170 + 110;
  };
  // infested stretch (v1.30): dozens of mud monsters and slime puddles; a fire truck to drive (or hydrants for the fire hose), road closed at the end
  const infest = () => {
    const truck = r() < 0.6, x0 = x + 60;
    if (truck) { L.objs.push(['firehouse', x0, 0]); const tx = x0 + W('firehouse') + 30; L.truck = [tx, 0]; x = tx + 300; } // the truck waits at a fire station (v1.31) else { L.hydrants.push(x0 + 40); x = x0 + 160; }
    const a = x;
    for (let k = 0; k < 5; k++) { ground(); if (!truck && k === 2) { L.hydrants.push(x - 20); x += 60; } }
    const b = x, nb = Math.max(8, Math.round((truck ? 30 + d * 12 : 16 + d * 8) * mm));
    L.infest.push([a, b, nb]);
    for (let k = 0, np = 5 + Math.round(d * 5); k < np; k++) L.puddles.push(Math.round(a + 60 + (b - a - 120) * (k + r() * 0.6) / np));
    x += 40; L.solids.push(['hurdle', x, 64, 70]);
    if (truck) L.truck[1] = x - 280;
    L.signs.push([x - 170, 'closed']);
    x += 64 + 150;
  };
  // construction barriers in a row, like hurdles: jump over them (v1.19)
  const hurdles = () => { x += 60; for (let j = 0, n = 2 + (d > 0.5 ? 1 : 0) + (r() < 0.3 ? 1 : 0); j < n; j++) { L.solids.push(['hurdle', x, 64, 50 + Math.round(r() * 20)]); x += 64 + 170 + Math.round(r() * 60); } x += 20; };
  const spinner = () => { L.objs.push(['spinner', x, 0]); x += W('spinner') + 90; };
  let plan;
  if (i === 0) {
    L.signs.push([70, 'move'], [240, 'spray']); x = 420;
    plan = ['g', 'g', 'H', 'jump', 's2', 'g', 'g', 'H', 's2', 'g', 'g', 's3', 'g', 'O', 'g', 'H', 'tog', 'g'];
  } else {
    // the level's ingredients (v1.12): every gadget from level 2 on, more of them later
    const feats = boss
      ? ['O', 'tog', 'M', 'K', 'B', ['s3', 'lift', 'hops'][Math.floor(r() * 3)]].concat(i >= 5 ? ['P'] : [])
      : ['F', 'P', 'tog', 'M', 'K', 'B'];
    if (!boss) {
      for (let h = 0, nh = 2 + Math.round(d * 1.4); h < nh; h++) feats.push('O');
      if (d > 0.5) feats.push('tog'); if (d > 0.6) feats.push('P');
      if (d > 0.4) feats.push('M'); if (d > 0.2) feats.push('E'); if (d > 0.3) feats.push('K'); if (d > 0.65) feats.push('K'); if (d > 0.35) feats.push('B');
      const climbs = ['s3', 'lift', 'hops'];
      for (let c = 0, nc = 1 + Math.round(d * 2); c < nc; c++) feats.push(climbs[Math.floor(r() * 3)]);
      if (r() < 0.75) feats.push('S');
      if (i >= 2 && r() < 0.5) feats.push('Y');
      if (i >= 2 && r() < 0.55) feats.push('C');
      if (r() < 0.45) feats.push('W');
      if (i >= 3 && r() < 0.45) feats.push('X');
    }
    // shuffle, then never the same gadget twice in a row
    for (let j = feats.length - 1; j > 0; j--) { const m = Math.floor(r() * (j + 1)); [feats[j], feats[m]] = [feats[m], feats[j]]; }
    for (let j = 1; j < feats.length; j++) if (feats[j] === feats[j - 1]) { const m = feats.findIndex((f, q) => q > j && f !== feats[j] && f !== feats[j - 2]); if (m > 0) [feats[j], feats[m]] = [feats[m], feats[j]]; }
    plan = ['g'];
    feats.forEach((f, j) => { plan.push(f); if (r() < 0.6 || j === feats.length - 1) plan.push('g'); if (j % 3 === 0) plan.push('H'); });
  }
  for (const p of plan) {
    if (p === 'g') ground();
    else if (p === 'F') spinner();
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
    else if (p === 'tog') tog();
    else if (p === 'O') hole();
    else if (p === 'S') sewerIn();
    else if (p === 'P') pipe();
    else if (p === 'M') movers();
    else if (p === 'E') elev();
    else if (p === 'K') tower();
    else if (p === 'B') hurdles();
    else if (p === 'Y') birdZone();
    else if (p === 'C') belt();
    else if (p === 'W') pool();
    else if (p === 'X') infest();
  }
  if (i === 3 && !L.signs.length) L.signs.push([120, 'nozzle']);
  // enemies on flat stretches only
  // difficulty scales monster counts: easy ×0.5, medium ×0.75, hard ×1, ultra ×2 (v1.21)
  const nb = i === 0 ? 2 : Math.max(1, Math.round((4 + Math.floor(d * 7) + (r() < 0.5 ? 1 : 0)) * mm));
  for (let j = 0; j < nb && flat.length; j++) { const [x0, x1] = flat[Math.floor(j * flat.length / nb)]; if (x0 > 500 && !L.infest.some(([a, b]) => x0 >= a && x0 < b)) L.blobs.push([Math.round((x0 + x1) / 2) + ((j * 37) % 60) - 30, Math.max(40, Math.min(130, (x1 - x0) / 2))]); }
  const nbird = i < 1 ? 0 : Math.max(1, Math.round((2 + Math.floor(d * 5)) * mm));
  for (let j = 0; j < nbird; j++) L.birds.push([Math.round(700 + (x - 900) * (j + 0.5) / nbird), 180, 190 + Math.floor(r() * 50)]);
  // infested stretches: dozens of slow-shooting monsters (flag 1)
  for (const [a, b, n] of L.infest) for (let j = 0; j < n; j++) L.blobs.push([Math.round(a + 40 + (b - a - 80) * (j + r()) / n), 50 + Math.round(r() * 50), 1]);
  if (i > 0) L.hydrants.unshift(60);
  L.waveEvery = i >= 1 ? Math.round(32 - d * 16) : 0;
  // mud monsters keep dropping in while the slime wall is shut (v1.11)
  L.blobEvery = i === 0 ? 0 : Math.round((10 - d * 5.5) / mm * 10) / 10; L.blobMax = Math.max(1, Math.round((2 + Math.round(d * 3)) * mm));
  L.pipeEvery = Math.round((3.2 - 1.4 * d) / mm * 10) / 10; L.pipeMax = Math.max(1, Math.round((3 + (d > 0.5 ? 1 : 0)) * mm)); L.pipeWaves = i >= 9;
  L.towerEvery = Math.round((3 - 1.4 * d) * 10) / 10;
  L.wall = x + 40;
  if (boss) { L.boss = { fight: a + 1, x: L.wall + 120 }; L.len = L.boss.x + 1100; }
  else { L.finish = L.wall + 200; L.len = L.finish + 160; }
  return L;
}
// underground sewer level (v1.23): slime worms, a few blobs, slime pits, crates, and a lift up at the end
function buildSewer(i, seed) {
  const r = rng(seed), d = i / (LEVEL_COUNT - 1);
  const mm = ({ easy: 0.5, medium: 0.75, hard: 1, ultra: 2 })[typeof SAVE !== 'undefined' && SAVE.diff] || 0.75;
  const L = { name: 'Sewer', theme: 'sewer', dirt: 'slime', tough: 2 + 5 * d, objs: [], solids: [], plats: [], holes: [], hydrants: [240], blobs: [], birds: [], worms: [], signs: [],
    waveEvery: 0, blobEvery: 0, towerEvery: 3, startX: 140, sewer: true };
  let x = 520; const flat = [];
  for (let k = 0, n = 3 + Math.floor(r() * 2); k < n; k++) {
    flat.push([x, x + 240]); x += 260;
    const f = r();
    if (f < 0.4) { L.holes.push([x, 90 + Math.floor(r() * 20)]); x += 200; }
    else if (f < 0.7) { L.solids.push(['stone', x, 70, 70]); if (r() < 0.5) L.solids.push(['stone', x + 70, 70, 140], ['stone', x + 140, 70, 70]); x += 300; }
    else { L.plats.push([x, GROUND - 80, 110, 'wood'], [x + 170, GROUND - 125, 110, 'wood'], [x + 340, GROUND - 80, 110, 'wood']); x += 470; }
  }
  flat.push([x, x + 300]); x += 340;
  const nw = Math.max(1, Math.round((3 + Math.floor(d * 4)) * mm));
  for (let j = 0; j < nw; j++) { const [a, b] = flat[j % flat.length]; L.worms.push([Math.round(a + (b - a) * (0.3 + 0.4 * ((j * 0.37) % 1))), 90]); }
  if (d > 0.3) { const [a, b] = flat[1 % flat.length]; L.blobs.push([Math.round((a + b) / 2), 80]); }
  // slime-jet cracks (v1.25): 2 per walkway stretch, none near the start/hydrant or on the exit lift
  L.cracks = [];
  for (const [a, b] of flat) for (let k = 0; k < 2; k++) { const cx = Math.round(a + 40 + r() * (b - a - 80)); if (cx > 360 && !L.cracks.some(q => Math.abs(q - cx) < 90)) L.cracks.push(cx); }
  L.lift = [x, 130]; L.len = x + 150;
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
function bossTarget(f) { return f >= AREAS.length ? 0.93 : 0.55 + 0.035 * (f - 1); }
function bossDiff(f) { return f <= 3 ? 1 : f <= 7 ? 2 : 3; }

const BOSS_TAUNTS = ['Mwa-ha-ha! Mud is marvelous!', 'Slime time!', "You'll never clean me!", 'Catch this, little washer!', 'Dirt is delightful!', 'Messy is the best!'];
const BOSS_OUCH = ['Stop! That tickles!', 'Eek! Water!', 'Not the bubbles!', 'I was dirty on purpose!'];
const BOSS_INTRO = ['You again?! Try to clean THIS!', 'Back for more? Mwa-ha-ha!', 'I made this place extra muddy for you!', 'You will never wash me!'];
const BOSS_FINAL_INTRO = 'Welcome to my castle! Now get SLIMED!';
const BOSS_FLEE = ["Curses! You'll never catch me!", 'Too clean! Too clean! I must run!', 'I need more mud! Bye-bye!'];
const CHEERS = ['Squeaky clean!', 'Sparkly!', 'Wow!', 'Shiny!', 'So clean!'];
