'use strict';
// Super Splash: sound effects, music and read-aloud, all made in the browser (no sound files)
const Sfx = (() => {
  let ac = null, master, sfxG, musG, noiseBuf, spray = null;
  const on = () => !!ac && ac.state === 'running';
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
    sfxG = ac.createGain(); sfxG.connect(master); musG = ac.createGain(); musG.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // spray loop: hiss + splatter, kept running with volume 0
    const src = ac.createBufferSource(); src.buffer = noiseBuf; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 0.7;
    const g = ac.createGain(); g.gain.value = 0;
    const src2 = ac.createBufferSource(); src2.buffer = noiseBuf; src2.loop = true; src2.playbackRate.value = 0.7;
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 600;
    const g2 = ac.createGain(); g2.gain.value = 0;
    src.connect(bp); bp.connect(g); g.connect(sfxG); src2.connect(lp); lp.connect(g2); g2.connect(sfxG);
    src.start(); src2.start();
    spray = { bp, g, g2 };
    apply();
  }
  function apply() {
    if (!ac) return;
    sfxG.gain.value = SAVE.sound ? 1 : 0;
    musG.gain.value = SAVE.music ? 0.22 : 0;
  }
  function tone(f, dur, type, vol, when, f2, dest, filt) {
    if (!on()) return;
    const t = ac.currentTime + (when || 0);
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = o;
    if (filt) { const fl = ac.createBiquadFilter(); fl.type = filt[0]; fl.frequency.value = filt[1]; fl.Q.value = filt[2] || 1; o.connect(fl); n = fl; }
    n.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, freq, type, when, q, dest) {
    if (!on()) return;
    const t = ac.currentTime + (when || 0);
    const s = ac.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = 0.8 + Math.random() * 0.4;
    const f = ac.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq || 1000; f.Q.value = q || 1;
    const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || sfxG); s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }
  let combo = 0, comboT = 0;
  const S = {
    init, apply,
    spray(onOff, hitting, psiLvl) {
      if (!spray) return; const t = ac.currentTime;
      spray.g.gain.setTargetAtTime(onOff ? 0.16 : 0, t, 0.04);
      spray.g2.gain.setTargetAtTime(onOff && hitting ? 0.35 + Math.random() * 0.25 : 0, t, 0.03);
      spray.bp.frequency.setTargetAtTime(1500 + psiLvl * 250 - (hitting ? 300 : 0), t, 0.05);
    },
    jump() { tone(300, 0.18, 'square', 0.08, 0, 720); },
    land() { noise(0.08, 0.25, 220, 'lowpass'); },
    coin() {
      const now = performance.now(); combo = now - comboT < 600 ? Math.min(combo + 1, 14) : 0; comboT = now;
      const p = 988 * Math.pow(1.04, combo); tone(p, 0.07, 'square', 0.07); tone(p * 1.5, 0.16, 'square', 0.07, 0.06);
    },
    ding() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, 0.35, 'triangle', 0.16, i * 0.07)); for (let i = 0; i < 5; i++) tone(2500 + Math.random() * 2000, 0.12, 'sine', 0.05, 0.3 + i * 0.05); },
    honk() { for (const w of [0, 0.22]) { tone(420, 0.16, 'square', 0.09, w, null, null, ['lowpass', 1800]); tone(530, 0.16, 'square', 0.09, w, null, null, ['lowpass', 1800]); } },
    bighonk() { tone(220, 0.55, 'sawtooth', 0.12, 0, null, null, ['lowpass', 1200]); tone(277, 0.55, 'sawtooth', 0.12, 0, null, null, ['lowpass', 1200]); },
    bark() { for (const w of [0, 0.25]) { noise(0.12, 0.4, 900, 'bandpass', w, 2); tone(520, 0.13, 'sawtooth', 0.14, w, 260, null, ['lowpass', 1500]); } },
    oink() { for (const w of [0, 0.28]) tone(320, 0.22, 'sawtooth', 0.18, w, 170, null, ['bandpass', 900, 3]); },
    moo() { tone(150, 0.9, 'sawtooth', 0.16, 0, 120, null, ['lowpass', 700]); },
    quack() { for (const w of [0, 0.22]) tone(720, 0.14, 'sawtooth', 0.14, w, 480, null, ['bandpass', 1200, 4]); },
    cluck() { [0, 0.1, 0.2].forEach((w, i) => tone(800 + i * 120, 0.07, 'square', 0.07, w, 600, null, ['bandpass', 1400, 3])); },
    horn() { tone(110, 1.0, 'sawtooth', 0.14, 0, null, null, ['lowpass', 600]); tone(165, 1.0, 'sawtooth', 0.1, 0, null, null, ['lowpass', 600]); },
    jingle() { [784, 988, 1175, 988, 784].forEach((f, i) => tone(f, 0.18, 'triangle', 0.12, i * 0.12)); },
    chime() { },
    siren() { for (let i = 0; i < 3; i++) { tone(700, 0.22, 'square', 0.06, i * 0.44, 950, null, ['lowpass', 2000]); tone(950, 0.22, 'square', 0.06, i * 0.44 + 0.22, 700, null, ['lowpass', 2000]); } },
    whistle() { tone(2400, 0.12, 'sine', 0.12, 0, 2600); tone(2400, 0.3, 'sine', 0.12, 0.16, 2200); },
    bell() { for (let i = 0; i < 4; i++) { tone(1320, 0.12, 'triangle', 0.12, i * 0.09); tone(1980, 0.1, 'sine', 0.05, i * 0.09); } },
    jet() { noise(1.0, 0.25, 900, 'bandpass', 0, 0.6); tone(300, 1.0, 'sawtooth', 0.05, 0, 900, null, ['lowpass', 1500]); },
    train() { tone(392, 0.5, 'sawtooth', 0.09, 0, null, null, ['lowpass', 1400]); tone(494, 0.5, 'sawtooth', 0.09, 0, null, null, ['lowpass', 1400]); tone(587, 0.5, 'sawtooth', 0.07, 0, null, null, ['lowpass', 1400]); },
    hurt() { tone(520, 0.35, 'square', 0.1, 0, 160); },
    pop() { tone(220, 0.14, 'sine', 0.3, 0, 900); noise(0.15, 0.3, 500, 'lowpass'); },
    splat() { noise(0.25, 0.4, 420, 'lowpass', 0, 0.8); tone(160, 0.2, 'sine', 0.25, 0, 60); },
    throw() { tone(420, 0.25, 'sine', 0.22, 0, 120); },
    glug() { tone(300 + Math.random() * 250, 0.09, 'sine', 0.14, 0, 500 + Math.random() * 200); },
    sputter() { noise(0.05, 0.2, 1200, 'bandpass', 0, 2); noise(0.05, 0.2, 900, 'bandpass', 0.08, 2); },
    click() { tone(900, 0.05, 'square', 0.05); },
    buy() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.15, 'square', 0.07, i * 0.06)); },
    nope() { tone(220, 0.2, 'square', 0.08, 0, 180); tone(180, 0.25, 'square', 0.08, 0.15, 140); },
    whoosh() { noise(0.6, 0.35, 400, 'bandpass', 0, 1.5); tone(200, 0.6, 'sine', 0.1, 0, 1200); },
    laugh() { [270, 250, 230, 210].forEach((f, i) => { tone(f, 0.14, 'sawtooth', 0.16, i * 0.17, f * 0.85, null, ['bandpass', 1000, 2]); }); },
    melt() { for (let i = 0; i < 6; i++) tone(500 - i * 60, 0.15, 'sine', 0.12, i * 0.08, 300 - i * 30); },
    fanfare() { [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.62], [1047, 0.78]].forEach(([f, w]) => { tone(f, w > 0.7 ? 0.6 : 0.16, 'square', 0.08, w); tone(f / 2, w > 0.7 ? 0.6 : 0.16, 'triangle', 0.1, w); }); },
    sparkle() { for (let i = 0; i < 8; i++) tone(1800 + Math.random() * 2500, 0.15, 'sine', 0.05, i * 0.06); },
    obj(name) { (S[name] || S.chime)(); }
  };

  // ---------------- music: tiny step sequencer
  const SONGS = {
    happy: { bpm: 126, root: 0,
      mel: [72, 0, 76, 79, 76, 0, 72, 74, 77, 0, 76, 74, 72, 0, 69, 0, 71, 0, 74, 79, 77, 76, 74, 0, 72, 74, 76, 0, 72, 0, 0, 0],
      bass: [48, 53, 55, 48], drums: true },
    calm: { bpm: 96, mel: [72, 0, 0, 76, 0, 0, 79, 0, 77, 0, 0, 76, 0, 0, 74, 0, 74, 0, 0, 77, 0, 0, 76, 0, 72, 0, 0, 0, 0, 0, 0, 0], bass: [48, 53, 55, 48], drums: false },
    boss: { bpm: 152,
      mel: [69, 0, 72, 69, 76, 0, 74, 72, 72, 0, 69, 72, 77, 0, 76, 74, 74, 0, 71, 74, 79, 0, 77, 76, 76, 75, 76, 79, 76, 0, 71, 0],
      bass: [45, 41, 43, 40], drums: true }
  };
  let song = null, step = 0, nextT = 0, timer = null;
  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
  function mnote(f, t, dur, type, vol) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(musG); o.start(t); o.stop(t + dur + 0.05);
  }
  function mdrum(t, kind) {
    if (kind === 'k') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); o.connect(g); g.connect(musG); o.start(t); o.stop(t + 0.2); return; }
    const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = kind === 'h' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'h' ? 7000 : 1800;
    const g = ac.createGain(); const d = kind === 'h' ? 0.04 : 0.12; g.gain.setValueAtTime(kind === 'h' ? 0.12 : 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(f); f.connect(g); g.connect(musG); s.start(t, Math.random()); s.stop(t + d + 0.02);
  }
  function tick() {
    if (!song || !on()) return;
    const spb = 60 / song.bpm / 2; // eighth notes
    while (nextT < ac.currentTime + 0.15) {
      const i = step % 32, m = song.mel[i];
      if (m) mnote(mtof(m), nextT, spb * 1.6, 'square', 0.05);
      if (i % 2 === 0) { const b = song.bass[Math.floor(i / 8) % 4]; mnote(mtof(b - (i % 4 === 2 ? -7 : 0)), nextT, spb * 1.8, 'triangle', 0.16); }
      if (song.drums) { if (i % 4 === 0) mdrum(nextT, 'k'); if (i % 4 === 2) mdrum(nextT, 's'); mdrum(nextT, 'h'); }
      step++; nextT += spb;
    }
  }
  S.music = function (name) {
    if (!ac) return;
    const s = SONGS[name] || null; if (s === song) return;
    song = s; step = 0; nextT = ac.currentTime + 0.1;
    if (!timer) timer = setInterval(tick, 40);
  };
  S.stopMusic = function () { song = null; };

  // ---------------- read aloud
  let voice = null;
  function pickVoice() {
    const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    // most natural first (v1.30): downloaded Premium/Enhanced voices (iPhone/Mac), Microsoft "Natural" (Edge), then the usual good ones
    const en = vs.filter(v => /^en[-_]?(US|GB|AU|CA)?/i.test(v.lang));
    const rank = [/premium/i, /enhanced|natural|neural/i, /^(Ava|Zoe|Evan|Nathan|Joelle|Noelle)\b/, /Google US English/, /Samantha|Aria|Jenny|Karen|Daniel/];
    voice = null;
    for (const re of rank) { voice = en.find(v => re.test(v.name) && /en-US/i.test(v.lang)) || en.find(v => re.test(v.name)); if (voice) break; }
    voice = voice || en[0] || null;
  }
  if (window.speechSynthesis) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  S.say = function (text, villain) {
    if (!SAVE.voice || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); if (voice) u.voice = voice;
      u.rate = villain ? 0.95 : 0.9; u.pitch = villain ? 0.5 : 1.15; u.volume = 1;
      speechSynthesis.speak(u);
    } catch (e) { }
  };
  S.hush = function () { if (window.speechSynthesis) speechSynthesis.cancel(); };
  return S;
})();
