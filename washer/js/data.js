'use strict';
// Super Splash: game data (levels, shop, nozzles)
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
  { psi: 2000, pow: 1.35, range: 280 },
  { psi: 2700, pow: 1.75, range: 310 },
  { psi: 3400, pow: 2.2,  range: 340 },
  { psi: 4200, pow: 2.8,  range: 370 }
];
const PRESSURE_COST = [30, 60, 100, 150];
const TANK = [100, 150, 210, 280];
const TANK_COST = [20, 45, 80];
const HATS = { none: 0, cap: 15, helmet: 25, cowboy: 30, wizard: 40, crown: 60 };
const HAT_NAMES = { none: 'No hat', cap: 'Cap', helmet: 'Fire helmet', cowboy: 'Cowboy hat', wizard: 'Wizard hat', crown: 'Crown' };
const WCOLORS = { yellow: ['#ffc928', 0], red: ['#ef4a3c', 10], blue: ['#3a8cf0', 10], green: ['#43c46b', 10], purple: ['#9b5de5', 15], pink: ['#ff7eb6', 15] };

// objs: [type, x, variant, baseY]   solids: [kind, x, w, h]   plats: [x, y, w, style]
// blobs: [x, range]   birds: [x, range, y]
const LEVELS = [
  { name: 'Sunny Street', theme: 'street', dirt: 'mud', len: 3600, wall: 3300, finish: 3480,
    signs: [[70, 'move'], [240, 'spray'], [1030, 'tank'], [1190, 'jump']],
    objs: [['mailbox', 420], ['car', 560, 0], ['trash', 880], ['fence', 1450], ['doghouse', 1740], ['house', 2150], ['swing', 2650], ['car', 2960, 1]],
    solids: [['crate', 1340, 70, 70], ['crate', 2530, 70, 70]],
    plats: [], hydrants: [980, 2890], blobs: [[2020, 110]], birds: [] },
  { name: 'Puddle Park', theme: 'park', dirt: 'mud', len: 4300, wall: 3100, boss: { fight: 1, x: 3200 },
    signs: [[150, 'nozzle']],
    objs: [['bench', 300], ['slide', 520], ['picnic', 900], ['statue', 1420], ['trash', 1690, 0, 340], ['fountain', 1900], ['swing', 2350], ['bench', 2700], ['trash', 2930]],
    solids: [['rock', 1250, 90, 60]],
    plats: [[1620, 340, 200, 'wood']], hydrants: [800, 2600], blobs: [[1150, 110], [2200, 120]], birds: [] },
  { name: 'Big City', theme: 'city', dirt: 'soot', len: 4400, wall: 4000, finish: 4200,
    signs: [],
    objs: [['shop', 250, 0], ['car', 650, 4], ['bus', 1050], ['billboard', 1920, 0, 230], ['shop', 2300, 1], ['car', 2950, 2], ['trash', 3300], ['bus', 3550, 1]],
    solids: [['crate', 1500, 70, 70], ['crate', 1570, 70, 140]],
    plats: [[260, GROUND - 150, 280, 'none'], [2310, GROUND - 150, 280, 'none'], [1700, 330, 170, 'wood'], [1900, 230, 300, 'roof']],
    hydrants: [950, 3450], blobs: [[2700, 150]], birds: [[1300, 250, 200], [3100, 250, 190]] },
  { name: 'Sandy Beach', theme: 'beach', dirt: 'sand', len: 4400, wall: 3200, boss: { fight: 2, x: 3300 },
    signs: [],
    objs: [['hut', 250, 0], ['boat', 520], ['icecream', 1150], ['lighthouse', 1650], ['hut', 1880, 1, 340], ['boat', 2350, 1], ['icecream', 2950, 1]],
    solids: [['rock', 1500, 90, 60]],
    plats: [[1850, 340, 240, 'pier']], hydrants: [850, 2850], blobs: [[1000, 110], [2700, 120]], birds: [[2200, 300, 180]] },
  { name: 'Happy Farm', theme: 'farm', dirt: 'mud', len: 4200, wall: 3700, finish: 3900,
    signs: [],
    objs: [['barn', 250], ['pig', 650], ['tractor', 950], ['coop', 1500], ['pig', 1750, 1, 340], ['barn', 2300, 1], ['pig', 2700], ['tractor', 2950, 1], ['coop', 3350]],
    solids: [['hay', 1250, 90, 60], ['hay', 1340, 90, 120]],
    plats: [[1700, 340, 200, 'wood']], hydrants: [850, 2850], blobs: [[1950, 150], [3250, 110]], birds: [[2200, 300, 190]] },
  { name: 'Sludge Castle', theme: 'swamp', dirt: 'slime', len: 4300, wall: 3050, boss: { fight: 3, x: 3200 },
    signs: [],
    objs: [['gargoyle', 250], ['cauldron', 450], ['gate', 950], ['gargoyle', 1700, 1, 240], ['machine', 2000], ['cauldron', 2550], ['gargoyle', 2850]],
    solids: [['rock', 1300, 90, 60]],
    plats: [[1450, 340, 180, 'stone'], [1650, 240, 200, 'stone']], hydrants: [700, 2750], blobs: [[850, 110], [2450, 130]], birds: [[1900, 260, 170], [2900, 250, 200]] }
];

const STORY = {
  intro: [
    ['town', 'This is Sudsy Town, the sparkliest town in the world!'],
    ['boss', 'But oh no! Here comes Sir Sludgington. He LOVES mud and slime!'],
    ['splat', 'SPLAT! He slimed the whole town. Cars, houses, even the doghouse!'],
    ['hero', 'Grab your pressure washer! Wash the town clean and catch Sir Sludgington!']
  ],
  flee1: [['flee1', 'Sir Sludgington got away! He ran to the Big City. After him!']],
  flee2: [['flee2', "He's getting cleaner! He ran home to his Sludge Castle in the swamp. Let's go!"]],
  ending: [
    ['end1', 'You did it! Sir Sludgington is squeaky clean! "I never knew clean felt so nice!" he said.'],
    ['end2', "Now he's called Sir Sparklington, and he helps keep Sudsy Town sparkly. THE END!"]
  ]
};

const BOSS_TAUNTS = ['Mwa-ha-ha! Mud is marvelous!', 'Slime time!', "You'll never clean me!", 'Catch this, little washer!', 'Dirt is delightful!'];
const BOSS_OUCH = ['Stop! That tickles!', 'Eek! Water!', 'Not the bubbles!', 'I was dirty on purpose!'];
const BOSS_INTRO = ['You again?! Try to clean THIS!', 'Back for more? Mwa-ha-ha!', 'Welcome to my castle! Now get SLIMED!'];
const BOSS_FLEE = ["Curses! You'll never catch me!", 'Too clean! Too clean! I must run!'];
const CHEERS = ['Squeaky clean!', 'Sparkly!', 'Wow!', 'Shiny!', 'So clean!'];
