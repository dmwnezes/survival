'use strict';
/* ---------------- canvas ---------------- */
const cv = $('#game'), ctx = cv.getContext('2d');
let VW = 426, VH = 240, camX = 0, camY = 0, menuT = 0;
function resize() {
  VH = 240; VW = Math.max(240, Math.round(VH * innerWidth / innerHeight));
  cv.width = VW; cv.height = VH; ctx.imageSmoothingEnabled = false; checkRotate();
}
function checkRotate() {
  const portrait = isTouch && innerHeight > innerWidth;
  $('#rotate').classList.toggle('show', portrait);
  if (portrait && mode === 'play') pauseGame();
}
let groundPat = null, decor = [], decorGrid = new Map(), patches = [], patchGrid = new Map();
function makeWorld() {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  x.fillStyle = '#1a2242'; x.fillRect(0, 0, 128, 128);
  const cols = ['#1e274b', '#161d3a', '#212c53', '#141a34'], r = mulberry(3);
  for (let i = 0; i < 900; i++) { x.fillStyle = cols[i % 4]; x.fillRect(r() * 128 | 0, r() * 128 | 0, 1 + (r() * 2 | 0), 1); }
  for (let i = 0; i < 14; i++) { const px = r() * 124 | 0, py = r() * 124 | 0; x.fillStyle = '#2a3260'; x.fillRect(px, py, 2, 2); x.fillStyle = '#121833'; x.fillRect(px + 1, py + 2, 2, 1); }
  for (let i = 0; i < 6; i++) { let px = r() * 128, py = r() * 128; x.fillStyle = '#141a33'; for (let k = 0; k < 7; k++) { x.fillRect(px | 0, py | 0, 1, 1); px += r() * 2 - 0.5; py += r() * 2 - 1; } }
  groundPat = ctx.createPattern(c, 'repeat');
  const pr = mulberry(11); patches = [];
  for (let i = 0; i < 2600; i++) patches.push({ x: pr() * MAPW, y: pr() * MAPH, rx: 30 + pr() * 90, ry: 18 + pr() * 50, c: ['#202747', '#262b48', '#1b2940', '#171d3a'][pr() * 4 | 0] });
  patchGrid = new Map(); for (const p of patches) { const key = ((p.x / 256) | 0) * 1000 + ((p.y / 256) | 0); let a = patchGrid.get(key); if (!a) patchGrid.set(key, a = []); a.push(p); }
  const rr = mulberry(7); decor = [];
  for (let i = 0; i < 17600; i++) {
    const v = rr(), k = v < 0.08 ? 'mandacaru' : v < 0.22 ? 'xique' : v < 0.4 ? 'pedra' : v < 0.45 ? 'juazeiro' : v < 0.47 ? 'carcaca' : v < 0.5 ? 'cerquinha' : v < 0.505 ? 'cruzBeira' : 'capim';
    const dx = rr() * MAPW | 0, dy = rr() * MAPH | 0;
    if (Math.abs(dx - MAPW / 2) < 40 && Math.abs(dy - MAPH / 2) < 30) continue;
    decor.push({ k, x: dx, y: dy });
  }
  for (let i = 0; i < 7000; i++) { // caatinga mais fechada perto das bordas do mapa
    const side = (rr() * 4) | 0, depth = Math.pow(rr(), 1.8) * 650, along = rr();
    const dx = side === 0 ? depth : side === 1 ? MAPW - depth : along * MAPW, dy = side === 2 ? depth : side === 3 ? MAPH - depth : along * MAPH, v = rr();
    decor.push({ k: v < 0.22 ? 'mandacaru' : v < 0.48 ? 'xique' : v < 0.62 ? 'juazeiro' : v < 0.8 ? 'pedra' : 'capim', x: dx | 0, y: dy | 0 });
  }
  decorGrid = new Map(); for (const d of decor) { const key = ((d.x / 256) | 0) * 1000 + ((d.y / 256) | 0); let a = decorGrid.get(key); if (!a) decorGrid.set(key, a = []); a.push(d); }
}

/* ---------------- estado ---------------- */
let mode = 'menu', G = null, player = null, lastChar = 'vaqueiro';
const enemies = [], projs = [], pools = [], waves = [], items = [], parts = [], nums = [], fx = [], marks = [], goos = [], spots = [], carts = [], acudes = [], traps = [], whirls = [], critters = [], honeys = [], trails = [], stars = [], roots = [], muds = [], fires = [], pilgrims = [];
const BRIDGES = [0.07, 0.19, 0.31, 0.43, 0.56, 0.68, 0.8, 0.92].map(k => k * MAPH);
let RIV = { base: 0.62, amp: 80, freq: 0.004, ph: 0 };
function riverX(y) { return MAPW * RIV.base + Math.sin(y * RIV.freq + RIV.ph) * RIV.amp; }
function rollRiver() { RIV = { base: Math.random() < 0.5 ? rand(0.24, 0.42) : rand(0.58, 0.78), amp: rand(50, 150), freq: rand(0.0018, 0.006), ph: rand(0, 6.28) }; }
function onBridge(y) { return BRIDGES.some(b => Math.abs(y - b) < 22); }
function inRiver(x, y) { return Math.abs(x - riverX(y)) < 36 && !onBridge(y); }
function nearRiver(x, y, m) { return Math.abs(x - riverX(y)) < 36 + m; }
function clvl(ch) { return Math.min(10, Math.floor(Math.sqrt((save.cxp[ch] || 0) / 40))); }
let villages = [], roads = [], graves = [];
function defV() { return villages.find(v => v.def > 0) || null; }
function inVillage(x, y, m) { return villages.some(v => dist2(x, y, v.x, v.y) < (v.r + (m || 0)) ** 2); }
function inGrave(x, y, m) { return graves.some(g => dist2(x, y, g.x, g.y) < (g.r + (m || 0)) ** 2); }
function onRoad(x, y) { return onRoad2(x, y); } // grade de trechos da estrada suavizada (extra.js)
const Q = [];
let grid = new Map(); const CELL = 24;

function newRunState() {
  return { time: 0, kills: 0, rap: 0, adapt: 1, adaptT: 5, hpMult: 1, spawnAcc: 0, shake: 0, hurtFlash: 0, bossDone: {}, events: {}, pendingLv: 0, pendingChest: 0, revived: false, dawn: 0, boss: null,
    dmg: {}, buff: 0, confuse: 0, slow: 0, blood: false, rain: 0, rainAt: [rand(150, 330), rand(480, 660)], eliteT: 120, foodT: 8, ride: 0, fita: false, syn: {}, byEnemy: {}, warn: null, stun: 0, velhaT: 200, farinha: 0, evNext: 0, evDue: null, evCount: null, iaraT: 20, muriAcc: 0, cajuRain: 0, crAcc: 0, cajuRainT: rand(240, 360), trailT: 0, dive: 0, nm: false, inf: !!(save.gmode === 'infinito' && save.ach.amanhecer), cang: 0, cangT: 0, giant: 0, pwT: 50, henT: 180, finalT: 0, finalUsed: false, abCd: 0, altar: null, sand: false, spikeT: 0, nProps: 0, nm: !!(save.gmode === 'pesadelo' && save.ach.amanhecer) };
}
function newPlayer(ch) {
  return { char: ch, x: MAPW / 2, y: MAPH / 2, r: 5, hp: 0, maxHp: 0, inv: 0, xp: 0, level: 1, next: need(1), fx: 1, fy: 0, moving: false, t: 0,
    weapons: [{ id: CHARS[ch].weapon, lvl: 1, cd: 0.4, ev: false }], pass: Object.assign({}, CHARS[ch].startPass || {}), st: null, kx: 0, ky: 0, vx: 0, vy: 0,
    spr: SKINS[ch] && save.skin[ch] && save.ach[SKINS[ch].ach] ? ch + '_skin' : ch,
    pet: save.pet && save.pets[save.pet] ? { k: save.pet, x: MAPW / 2 - 12, y: MAPH / 2 + 8, cd: 0, t: null, dive: 0 } : null };
}
function recalc() {
  const p = player, pv = p.pass, up = save.up, ch = CHARS[p.char];
  p.st = {
    dmg: (1 + 0.05 * (save.prest || 0)) * (1 + 0.1 * (pv.pimenta || 0)) * (1 + 0.05 * (up.forca || 0)) * (1 + 0.25 * (pv.cachaca || 0)) * (1 + 0.02 * clvl(p.char)),
    luck: 1 + 0.25 * (pv.ferradura || 0),
    drunk: pv.cachaca || 0,
    slip: pv.chinelo || 0,
    lamp: pv.lampiao || 0,
    area: (1 + 0.1 * (pv.lamparina || 0)) * (ch.area || 1),
    cd: Math.pow(0.92, pv.cordel || 0) * (1 - 0.03 * (up.recarga || 0)),
    spd: (1 + 0.1 * (pv.cafe || 0)) * (1 + 0.05 * (up.pressa || 0)) * (ch.spd || 1) * (1 + 0.12 * (pv.chinelo || 0)),
    amount: pv.zabumba || 0,
    magnet: 42 * (1 + 0.3 * (pv.bornal || 0)) * (1 + 0.1 * (up.ima || 0)),
  };
  const mx = 100 + (G && G.farinha > 0 ? 30 : 0) + (ch.hp || 0) + 20 * (pv.gibao || 0) + 10 * (up.vida || 0) + 5 * Math.floor(clvl(p.char) / 2);
  if (p.maxHp) p.hp += Math.max(0, mx - p.maxHp);
  p.maxHp = mx; p.hp = Math.min(p.hp, mx);
}

/* ---------------- grade espacial ---------------- */
function buildGrid() {
  grid.clear();
  for (const e of enemies) { if (!e.alive) continue; const k = ((e.x / CELL) | 0) * 4096 + ((e.y / CELL) | 0); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(e); }
}
function query(x, y, r, out) {
  out.length = 0;
  const x0 = Math.floor((x - r) / CELL), x1 = Math.floor((x + r) / CELL), y0 = Math.floor((y - r) / CELL), y1 = Math.floor((y + r) / CELL);
  for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) { const a = grid.get(cx * 4096 + cy); if (a) for (const e of a) out.push(e); }
  return out;
}
function separate() {
  for (const arr of grid.values()) {
    const m = Math.min(arr.length, 14); if (m < 2) continue;
    for (let i = 0; i < m; i++) { const a = arr[i]; if (a.d.boss || a.d.seg || a.d.prop) continue;
      for (let j = i + 1; j < m; j++) { const b = arr[j]; if (b.d.boss || b.d.seg || b.d.prop) continue;
        const dx = b.x - a.x, dy = b.y - a.y, rr = a.r + b.r, d2 = dx * dx + dy * dy;
        if (d2 < rr * rr && d2 > 0.01) { const d = Math.sqrt(d2), o = (rr - d) * 0.5 / d; a.x -= dx * o; a.y -= dy * o; b.x += dx * o; b.y += dy * o; } } }
  }
}

/* ---------------- partículas e números ---------------- */
const partPool = []; // partículas reaproveitadas: menos lixo para o coletor no celular
function part(x, y, vx, vy, life, c, size, glow) { if (parts.length > 520) return; const p = partPool.pop() || {}; p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.life = life; p.max = life; p.c = c; p.size = size || 1; p.glow = !!glow; parts.push(p); }
function burst(x, y, c, n, glow) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = rand(15, 60); part(x, y, Math.cos(a) * s, Math.sin(a) * s, rand(0.25, 0.6), c, Math.random() < 0.3 ? 2 : 1, glow); } }
function puff(x, y, c) { burst(x, y, '#8f97c4', 6); burst(x, y, c, 4); }
function num(x, y, v, set, crit) { if (nums.length > 90) nums.shift(); const n = { x: x + rand(-3, 3), y, v: Math.max(1, Math.round(v)), life: crit ? 0.8 : 0.6, max: crit ? 0.8 : 0.6, set: set || DW, crit }; nums.push(n); return n; }

/* ---------------- inimigos ---------------- */
function spawnEnemy(type, x, y) {
  const d = EN[type];
  const hm = (d.prop ? 1 : 1.8) * (d.boss ? (0.75 + 0.35 * G.adapt) * (1 + Math.max(0, G.time - 600) / 600) : d.seg || d.prop ? 1 : G.hpMult * (0.85 + 0.15 * G.adapt)) * (G.blood && !d.seg ? 1.3 : 1) * (G.nm && !d.seg ? (d.boss ? 1.5 : 1.6) : 1);
  const e = { type, d, x, y, vx: 0, vy: 0, kx: 0, ky: 0, hp: d.hp * hm, r: d.r, spd: d.spd * (d.boss ? 1 : rand(0.88, 1.12)) * (G.blood ? 1.1 : 1), flash: 0, t: Math.random() * 9, cc: rand(1, 4), ch: 0, cdx: 0, cdy: 0, ang: 0, alive: true, root: 0, sc: d.scale || 1 };
  e.maxHp = e.hp; enemies.push(e); return e;
}
// Sempre fora da tela e dentro do mapa: o inimigo nasce escondido e entra caminhando.
function edgePos(ang) {
  const R = Math.hypot(VW, VH) / 2 + 12;
  for (let i = 0; i < 24; i++) {
    const a = ang != null && i < 8 ? ang + rand(-0.4, 0.4) : Math.random() * 6.283;
    const x = player.x + Math.cos(a) * R, y = player.y + Math.sin(a) * R;
    if (x > 4 && x < MAPW - 4 && y > 4 && y < MAPH - 4) return [x, y];
  }
  const a = Math.atan2(MAPH / 2 - player.y, MAPW / 2 - player.x); // rumo ao centro do mapa sempre cabe
  return [player.x + Math.cos(a) * R, player.y + Math.sin(a) * R];
}
function spawnElite() {
  const [x, y] = edgePos(), e = spawnEnemy(pickType(G.time / 60), x, y);
  e.elite = true; e.hp = e.maxHp = e.maxHp * 10; e.r *= 1.5; e.sc = 1.6; e.spd *= 0.9;
}
function spawnFlock() {
  const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), R = Math.hypot(VW, VH) / 2 + 12, n = Math.round(9 + G.time / 90);
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * 14, x = player.x - dx * R - dy * o + rand(-6, 6), y = player.y - dy * R + dx * o + rand(-6, 6);
    if (x < 4 || x > MAPW - 4 || y < 4 || y > MAPH - 4) continue;
    const e = spawnEnemy('urubu', x, y); e.cdx = dx; e.cdy = dy; e.life = (2 * R + 40) / e.spd;
  }
  banner('Revoada de urubus!');
}
function spawnFood() {
  let near = 0; for (const it of items) if (it.food && dist2(it.x, it.y, player.x, player.y) < 400 * 400) near++;
  if (near >= 5) return;
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * 6.283, r = rand(110, 320), x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r;
    if (x < 20 || x > MAPW - 20 || y < 20 || y > MAPH - 20) continue;
    const f = FOODS[Math.random() < 0.15 ? 2 : Math.random() < 0.5 ? 1 : 0];
    drop(x, y, f[0], f[1]); items[items.length - 1].food = true; return;
  }
}
function makeSpots() {
  const place = (k, n) => { for (let i = 0; i < n; i++) { let x, y, t = 0;
    do { x = 80 + Math.random() * (MAPW - 160); y = 80 + Math.random() * (MAPH - 160); } while (t++ < 30 && (Math.hypot(x - MAPW / 2, y - MAPH / 2) < 160 || nearRiver(x, y, 30) || inVillage(x, y, 40) || inGrave(x, y, 40) || spots.some(s => dist2(s.x, s.y, x, y) < 220 * 220)));
    spots.push(k === 'capela' ? { k, x, y, charge: 80 } : { k, x, y, cd: 0, hold: 0 }); } };
  for (const big of [false, true]) for (let t = 0; t < 200; t++) {
    const R = big ? 250 : 170, x = 400 + Math.random() * (MAPW - 800), y = 400 + Math.random() * (MAPH - 800);
    if (Math.hypot(x - MAPW / 2, y - MAPH / 2) < 800 || nearRiver(x, y, R + 60) || villages.some(v => dist2(x, y, v.x, v.y) < 2200 * 2200)) continue;
    const n = big ? 12 : 7, houses = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rand(-0.25, 0.25), r = rand(R * 0.35, R * 0.75); houses.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.75 }); }
    villages.push({ x, y, r: R, big, houses, entered: false, t: 0, def: 0, vill: [] }); break;
  }
  for (let i = 0, t = 0; i < 2 && t < 300; t++) {
    const x = 300 + Math.random() * (MAPW - 600), y = 300 + Math.random() * (MAPH - 600);
    if (Math.hypot(x - MAPW / 2, y - MAPH / 2) < 600 || nearRiver(x, y, 220) || inVillage(x, y, 300) || graves.some(g => dist2(x, y, g.x, g.y) < 1500 * 1500)) continue;
    const gl = []; for (let k = 0; k < 22; k++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * 130; gl.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.7 }); }
    graves.push({ x, y, r: 160, list: gl, t: 0 }); i++;
  }
  const way = (ax, ay, bx, by) => { const pts = [], n = Math.max(6, Math.round(Math.hypot(bx - ax, by - ay) / 500)); for (let i = 0; i <= n; i++) { const k = i / n; pts.push({ x: clamp(ax + (bx - ax) * k + (i && i < n ? rand(-160, 160) : 0), 10, MAPW - 10), y: clamp(ay + (by - ay) * k + (i && i < n ? rand(-160, 160) : 0), 10, MAPH - 10) }); } roads.push(pts); };
  way(0, rand(0.2, 0.8) * MAPH, MAPW, rand(0.2, 0.8) * MAPH); way(rand(0.2, 0.8) * MAPW, 0, rand(0.2, 0.8) * MAPW, MAPH);
  for (const v of villages) way(MAPW / 2, MAPH / 2, v.x, v.y);
  buildRoads();
  const free = (x, y, m) => Math.hypot(x - MAPW / 2, y - MAPH / 2) > 160 && !inVillage(x, y, m) && !inGrave(x, y, m);
  place('capela', 20); place('fogo', 36); place('altar', 14); place('coronel', 8); place('cruz', 32); place('poco', 10); place('farinha', 8);
  for (let i = 0; i < 160; i++) { const k = i < 110 ? 'espinho' : 'areia', x = 60 + Math.random() * (MAPW - 120), y = 60 + Math.random() * (MAPH - 120); if (free(x, y, 40) && !nearRiver(x, y, 40)) traps.push({ k, x, y, r: k === 'espinho' ? 14 : rand(26, 40) }); }
  for (let i = 0, t = 0; i < 22 && t < 1500; t++) {
    const rx = rand(50, 80), ry = rand(30, 45), x = 120 + Math.random() * (MAPW - 240), y = 100 + Math.random() * (MAPH - 200);
    if (Math.hypot(x - MAPW / 2, y - MAPH / 2) < 220 || nearRiver(x, y, rx + 20) || spots.some(s => dist2(s.x, s.y, x, y) < (rx + 30) ** 2) || acudes.some(a => dist2(a.x, a.y, x, y) < 260 * 260)) continue;
    acudes.push({ x, y, rx, ry }); i++;
  }
  makeExtraWorld();
}
function placeProps() {
  G.nProps = 0;
  for (let i = 0; i < 480; i++) {
    const x = 40 + Math.random() * (MAPW - 80), y = 40 + Math.random() * (MAPH - 80);
    if (Math.hypot(x - MAPW / 2, y - MAPH / 2) < 120 || inWater(x, y) || nearRiver(x, y, 10)) continue;
    const r = Math.random(); spawnEnemy(r < 0.5 ? 'pote' : r < 0.85 ? 'cerca' : 'carroca', x, y); G.nProps++;
  }
}
function propLoot(e) {
  const L = player.st.luck, r = Math.random();
  if (e.type === 'pote') { for (let i = 0; i < 4; i++) drop(e.x + rand(-6, 6), e.y + rand(-6, 6), 'xp', 2); if (r < 0.15 * L) drop(e.x, e.y, 'rap', 2); }
  else if (e.d.neutral) { const f = FOODS[e.type === 'jumento' ? 1 : 0]; drop(e.x, e.y, f[0], f[1]); items[items.length - 1].food = true; }
  else if (e.type === 'cerca') { if (r < 0.35 * L) { const f = FOODS[Math.random() < 0.5 ? 0 : 1]; drop(e.x, e.y, f[0], f[1]); } else drop(e.x, e.y, 'xp', 3); }
  else { drop(e.x, e.y, 'rap', 3 + (Math.random() * 3 | 0)); if (r < 0.5 * L) drop(e.x + 6, e.y, 'baiao', 50); }
}
function spawnCaipora() {
  const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), R = Math.hypot(VW, VH) / 2 + 20;
  const x = clamp(player.x - dx * R, 10, MAPW - 10), y = clamp(player.y - dy * R + rand(-30, 30), 10, MAPH - 10);
  const e = spawnEnemy('caipora', x, y); e.cdx = dx; e.cdy = dy; e.life = (2 * R + 60) / e.spd; e.hitSet = new Set();
  banner('A Caipora vem aí!');
}
function spawnStar() {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * 6.283, r = rand(180, 380), x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r;
    if (x < 30 || x > MAPW - 30 || y < 30 || y > MAPH - 30 || inRiver(x, y) || inWater(x, y)) continue;
    stars.push({ x, y, t: 0 }); banner('Estrela cadente!'); return;
  }
}
function spawnPower() {
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * 6.283, r = rand(140, 320), x = player.x + Math.cos(a) * r, y = player.y + Math.sin(a) * r;
    if (x < 20 || x > MAPW - 20 || y < 20 || y > MAPH - 20) continue;
    drop(x, y, [...PWK][(Math.random() * PWK.size) | 0], 1); return;
  }
}
function powerUp(k) {
  sfx('win');
  if (k === 'cang') { G.cang = 15; toast('Chapéu de cangaceiro: tiros pra todo lado por 15s!'); }
  else if (k === 'sanfOuro') {
    for (const e of enemies) if (e.alive && !e.d.prop && Math.abs(e.x - player.x) < VW / 2 + 20 && Math.abs(e.y - player.y) < VH / 2 + 20) { const t = e.parent || e, d = t.d.boss ? 2 : 5; t.root = Math.max(t.root, d); e.dance = d; }
    toast('Sanfona dourada: todo mundo dançando forró!');
  }
  else if (k === 'rapGrande') { player.hp = player.maxHp; G.giant = 8; toast('Rapadura gigante: vida cheia, maior e mais rápido!'); }
  else { honeys.push({ x: player.x, y: player.y, r: 75, life: 8 }); toast('Garrafa de mel: os inimigos grudaram!'); }
}
function inHoney(x, y) { for (const h of honeys) if (dist2(x, y, h.x, h.y) < h.r * h.r) return true; return false; }
function inSand(x, y) { for (const t of traps) if (t.k === 'areia' && dist2(x, y, t.x, t.y) < t.r * t.r) return true; return false; }
function spawnWhirl() {
  const a = Math.random() * 6.283, R = Math.hypot(VW, VH) / 2 + 30, x = player.x - Math.cos(a) * R + rand(-40, 40), y = player.y - Math.sin(a) * R + rand(-40, 40);
  whirls.push({ x, y, vx: Math.cos(a) * 55, vy: Math.sin(a) * 55, life: (2 * R + 80) / 55, ang: 0 });
  banner('Redemoinho!');
}
function inWater(x, y) { for (const a of acudes) { const dx = (x - a.x) / a.rx, dy = (y - a.y) / a.ry; if (dx * dx + dy * dy < 1) return true; } return false; }
function spawnCart() {
  const dir = Math.random() < 0.5 ? 1 : -1, R = VW / 2 + 30, y = clamp(player.y + rand(-50, 50), 20, MAPH - 20), x = clamp(player.x - dir * R, 20, MAPW - 20);
  carts.push({ x, y, vx: dir * 70, life: (2 * R + 60) / 70, hit: new Set(), used: false });
  banner('Lá vem o carro de boi!');
}
function pickType(m) {
  const w = [['morcego', Math.max(2, 10 - m)], ['vagalume', m > 0.5 ? 4 : 0], ['saci', m >= 2 ? 1.6 + m * 0.25 : 0], ['mula', m >= 4 ? 0.5 + (m - 4) * 0.4 : 0], ['curupira', m >= 3 ? 1 + m * 0.12 : 0], ['trapalhona', m >= 1.5 ? 1.2 : 0], ['cabra', m >= 3 ? 0.4 + (m - 3) * 0.1 : 0], ['lambisgoia', m >= 5 ? 0.35 + (m - 5) * 0.04 : 0], ['coruja', m >= 6 ? 0.6 + (m - 6) * 0.05 : 0], ['tatu', m >= 8 ? 0.5 + (m - 8) * 0.05 : 0], ['rezadeira', m >= 10 && enemies.filter(e => e.type === 'rezadeira').length < 3 ? 0.3 : 0]];
  let tot = 0; for (const x of w) tot += x[1]; let r = Math.random() * tot;
  for (const x of w) { r -= x[1]; if (r <= 0) return x[0]; } return 'morcego';
}
function spawnBoss(b) {
  const [x, y] = edgePos(G.warn ? G.warn.ang : undefined); let e;
  if (b.type === 'boitata') {
    e = spawnEnemy('boitata', x, y); e.segs = []; let prev = e;
    for (let i = 0; i < 18; i++) { const s = spawnEnemy('boitataSeg', x, y); s.parent = e; s.prev = prev; s.idx = i; e.segs.push(s); prev = s; }
  } else e = spawnEnemy(b.type, x, y);
  e.bossName = b.name; G.boss = e; e.enter = 1.2;
  banner(b.name + ' apareceu!'); sfx('boss'); G.shake = 5;
}
// Diretor de eventos: um evento grande por vez, com folga entre eles, nunca perto de chefão, chuva ou defesa do vilarejo.
const EVENTS = {
  carro:   { first: 90,  every: [110, 150], run: () => spawnCart() },
  estrela: { first: 125, every: [95, 130], run: () => spawnStar() },
  vento:   { first: 160, every: [90, 120], run: () => spawnWhirl() },
  galinha: { first: 185, every: [160, 220], run: () => spawnHen() },
  urubus:  { first: 205, every: [100, 140], run: () => spawnFlock() },
  chuva:   { first: 230, every: [240, 320], max: 5, hold: 36, run: () => { G.rain = 30; pools.length = 0; banner('Chuva no sertão!'); } },
  caipora: { first: 250, every: [120, 160], run: () => spawnCaipora() },
  cajus:   { first: 280, every: [240, 330], run: () => { G.cajuRain = 10; banner('Chuva de cajus!'); } },
  mulas:   { first: 450, every: [260, 320], max: 5, run: () => stampede() },
  horda:   { first: 140, every: [75, 105], run: () => spawnFormation() },
  romaria: { first: 300, every: [180, 240], run: () => spawnPilgrims() },
  porca:   { first: 330, every: [150, 200], run: () => spawnPorca() },
  incendio:{ first: 360, every: [200, 260], run: () => spawnFire() },
  cavaleiro:{ first: 420, every: [130, 170], run: () => spawnCavaleiro() },
};
const EVENT_GAP = 25;
function eventBlocked(t) {
  return t < G.evNext || G.rain > 0 || (!G.inf && t > RUN - 15) || (G.boss && G.boss.alive) || defV() || BOSSES.some(b => t > b.t - 22 && t < b.t + 4) || (G.inf && t >= RUN && (t - RUN) % 150 > 128);
}
function runEvents(t) {
  if (!G.evDue) { G.evDue = {}; G.evCount = {}; for (const k in EVENTS) G.evDue[k] = EVENTS[k].first + rand(-10, 10); }
  if (eventBlocked(t)) return;
  let pick = null;
  for (const k in EVENTS) if (t >= G.evDue[k] && (!pick || G.evDue[k] < G.evDue[pick])) pick = k;
  if (!pick) return;
  const ev = EVENTS[pick]; ev.run();
  G.evCount[pick] = (G.evCount[pick] || 0) + 1;
  G.evDue[pick] = ev.max && G.evCount[pick] >= ev.max ? Infinity : t + rand(ev.every[0], ev.every[1]);
  G.evNext = t + (ev.hold || EVENT_GAP);
}
function spawnFormation() {
  const kind = ['roda', 'paredao', 'v'][(Math.random() * 3) | 0], R = Math.hypot(VW, VH) / 2 + 24, m = G.time / 60;
  if (kind === 'roda') { const n = 22 + Math.round(m); for (let i = 0; i < n; i++) { const a = i / n * 6.283, x = player.x + Math.cos(a) * R, y = player.y + Math.sin(a) * R; if (x > 4 && y > 4 && x < MAPW - 4 && y < MAPH - 4) spawnEnemy(m > 4 ? 'vagalume' : 'morcego', x, y); } banner('Cercados!'); return; }
  const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), n = 16 + Math.round(m);
  for (let i = 0; i < n; i++) {
    const o = (i - (n - 1) / 2) * 16, back = kind === 'v' ? Math.abs(o) * 0.8 : 0, x = player.x - dx * (R + back) - dy * o, y = player.y - dy * (R + back) + dx * o;
    if (x < 4 || y < 4 || x > MAPW - 4 || y > MAPH - 4) continue;
    const e = spawnEnemy(pickType(m), x, y); e.march = 5; e.cdx = dx; e.cdy = dy;
  }
  banner(kind === 'v' ? 'Bando em V!' : 'Paredão de visagens!');
}
function spawnPorca() {
  const a = Math.random() * 6.283, [x, y] = edgePos(a); spawnEnemy('porca', x, y);
  for (let i = 0; i < 7; i++) { const [lx, ly] = edgePos(a); const e = spawnEnemy('leitao', lx, ly); e.idx = i; }
  banner('A Porca dos sete leitões!');
}
function spawnCavaleiro() { const [x, y] = edgePos(); const e = spawnEnemy('cavaleiro', x, y); e.elite = true; banner('O Cavaleiro sem cabeça!'); sfx('warn'); }
function spawnFire() {
  for (let i = 0; i < 10; i++) { const a = Math.random() * 6.283, x = player.x + Math.cos(a) * 230, y = player.y + Math.sin(a) * 160; if (x < 60 || y < 60 || x > MAPW - 60 || y > MAPH - 60 || inRiver(x, y) || inWater(x, y)) continue; fires.push({ x, y, r: 10, t: 0, life: 26, tk: 0 }); banner('Fogo no mato!'); return; }
}
function spawnPilgrims() {
  const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), R = Math.hypot(VW, VH) / 2 + 20, sx = player.x - dx * R + (-dy) * 40, sy = player.y - dy * R + dx * 40;
  for (let i = 0; i < 12; i++) pilgrims.push({ x: sx - dx * i * 20, y: sy - dy * i * 20, vx: dx * 30, vy: dy * 30, life: (2 * R + 260) / 30, ph: i });
  banner('Romaria de almas: chegue perto para se curar');
}
function spawnHen() { const a = Math.random() * 6.283; critters.push({ x: clamp(player.x + Math.cos(a) * 150, 20, MAPW - 20), y: clamp(player.y + Math.sin(a) * 100, 20, MAPH - 20), ang: a, turn: 0, life: 25, vx: 0 }); banner('Uma galinha de ouro apareceu!'); }
function stampede() {
  banner('Estouro de mulas!'); const a = Math.random() * 6.283;
  for (let i = 0; i < 10; i++) { const [x, y] = edgePos(a); const e = spawnEnemy('mula', x, y); const dx = player.x - x, dy = player.y - y, d = Math.hypot(dx, dy) || 1; e.ch = 2.4; e.cdx = dx / d; e.cdy = dy / d; e.cc = 4; }
}
function director(dt) {
  if (G.dawn) return;
  const t = G.time, m = t / 60;
  G.adaptT -= dt;
  if (G.adaptT <= 0) {
    G.adaptT = 5; const hr = player.hp / player.maxHp; // só a vida decide: travar pelo nível deixava o jogador sem XP
    if (hr > 0.8) G.adapt = Math.min(1.8, G.adapt + 0.04);
    else if (hr < 0.45) G.adapt = Math.max(0.65, G.adapt - 0.12);
  }
  // curva esticada para a noite de 30 min: sobe sem parar até o amanhecer
  G.hpMult = 1 + t / 200 + (t / 450) ** 2;
  const ramp = Math.min(1, 0.75 + t / 160), cap = Math.min(560, 50 + t / 2.2 + (t / 300) ** 2 * 25), rate = Math.min(40, 2 + t / 26 + (t / 300) ** 2 * 1.5) * G.adapt * ramp * (G.nm ? 1.3 : 1) * (1 + 0.12 * (player.pass.olhogordo || 0)); // começo ágil, mas com inimigos fracos
  G.spawnAcc = Math.min(5, G.spawnAcc + rate * dt);
  while (G.spawnAcc >= 1 && enemies.length - G.nProps < cap) { G.spawnAcc -= 1; const [x, y] = edgePos(); spawnEnemy(pickType(m), x, y); }
  const sw = Math.floor(t / 60);
  if (sw >= 1 && !G.events['s' + sw]) {
    G.events['s' + sw] = 1; const a = Math.random() * 6.283, n = Math.round((8 + m * 3.5) * G.adapt);
    for (let i = 0; i < n; i++) { const [x, y] = edgePos(a); spawnEnemy('vagalume', x, y); }
  }
  if (!G.blood && t >= 1380) { G.blood = true; banner('Lua de sangue!'); }
  for (const b of BOSSES) {
    if (t >= b.t - 5 && !G.events['w' + b.type]) { G.events['w' + b.type] = 1; G.warn = { ang: Math.random() * 6.283, until: b.t }; banner(b.name + ' se aproxima...'); sfx('warn'); }
    if (t >= b.t && !G.bossDone[b.type]) { G.bossDone[b.type] = 1; spawnBoss(b); }
  }
  if (G.rain > 0) { G.muriAcc += 1.2 * dt; while (G.muriAcc >= 6 && enemies.filter(e => e.type === 'muricoca').length < 36) { G.muriAcc -= 6; /* limite: eram 150 por chuva */ const a = Math.random() * 6.283; for (let i = 0; i < 6; i++) { const [x, y] = edgePos(a); spawnEnemy('muricoca', x, y); } } }
  if (G.inf && t >= RUN) { const k = Math.floor((t - RUN) / 150); if (!G.events['ib' + k]) { G.events['ib' + k] = 1; const b = BOSSES[k % BOSSES.length]; spawnBoss(b); G.boss.hp = G.boss.maxHp = G.boss.maxHp * (1 + (t - RUN) / 300); } }
  if (t >= G.pwT) { G.pwT = t + rand(45, 65) / player.st.luck; spawnPower(); }
  if (t >= G.velhaT) { G.velhaT = t + rand(90, 130); const sd = Math.random() < 0.5 ? 1 : -1, x = clamp(player.x + player.fx * 170 - player.fy * 70 * sd, 20, MAPW - 20), y = clamp(player.y + player.fy * 120 + player.fx * 70 * sd, 20, MAPH - 20); if (!inRiver(x, y)) spawnEnemy('velha', x, y); }
  if (t >= G.eliteT) { G.eliteT = t + rand(40, 60) * Math.max(0.45, 1 - t / 1200); spawnElite(); }
  runEvents(t);
  G.foodT -= dt;
  if (G.foodT <= 0) { G.foodT = rand(16, 26) / player.st.luck; spawnFood(); }
}
function updEnemies(dt) {
  const px = player.x, py = player.y, dm = (1 + Math.min(G.time, 900) / 480 + Math.max(0, G.time - 900) / 900) * Math.min(1, 0.6 + G.time / 150) * (G.nm ? 1.4 : 1);
  for (const e of enemies) {
    if (!e.alive) continue;
    if (e.d.prop) { if (e.d.neutral) EXH.wander(e, dt); e.flash -= dt; continue; }
    if (e.enter > 0) { e.enter -= dt; e.t += dt; if (Math.random() < 0.7) part(e.x + rand(-14, 14), e.y + 10, rand(-20, 20), rand(-25, -5), 0.5, '#b8a27a', 2); continue; }
    e.t += dt; e.flash -= dt;
    if (e.d.seg) {
      const p = e.prev, dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1;
      if (d > 7) { e.x = p.x - dx / d * 7; e.y = p.y - dy / d * 7; }
    } else {
      let tx = px, ty = py;
      const dv = e.type === 'alma' ? defV() : null; if (dv) { let bv = null, bd = 1e12; for (const v of dv.vill) if (v.hp > 0) { const dd = dist2(v.x, v.y, e.x, e.y); if (dd < bd) { bd = dd; bv = v; } } if (bv) { tx = bv.x; ty = bv.y; if (bd < 100) bv.hp -= 10 * dt; } }
      const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy) || 1;
      let vx = dx / d * e.spd, vy = dy / d * e.spd;
      switch (e.type) {
        case 'morcego': vx += Math.cos(e.t * 6) * 12; vy += Math.sin(e.t * 5) * 12; break;
        case 'saci':
          if (e.wind > 0) { e.wind -= dt; vx = vy = 0; break; }
          e.cc -= dt;
          if (e.cc <= 0) { e.cc = rand(4, 6); if (d > 45) { puff(e.x, e.y, '#c8463c'); const a = Math.random() * 6.283, r = rand(100, 125); e.x = clamp(px + Math.cos(a) * r, 4, MAPW - 4); e.y = clamp(py + Math.sin(a) * r, 4, MAPH - 4); puff(e.x, e.y, '#c8463c'); sfx('tp'); e.wind = 0.4; } }
          break;
        case 'mula':
          // aviso de 0,55s (para, pisca e levanta poeira) antes de disparar
          if (e.wind > 0) { e.wind -= dt; vx = vy = 0; if (Math.random() < 0.5) part(e.x, e.y + 5, rand(-12, 12), rand(-8, -2), 0.3, '#b8a27a', 1); if (e.wind <= 0) { e.ch = 1; e.cdx = dx / d; e.cdy = dy / d; } }
          else if (e.ch > 0) { e.ch -= dt; vx = e.cdx * 115; vy = e.cdy * 115; if (Math.random() < 0.4) part(e.x + e.cdx * 7, e.y - 3, rand(-10, 10), rand(-20, -5), 0.3, '#e8832a', 1, true); }
          else { e.cc -= dt; if (e.cc <= 0 && d < 160 && d > 50) { e.wind = 0.55; e.cc = rand(3.5, 5); } }
          break;
        case 'lobisomem':
          if (e.wind > 0) { e.wind -= dt; vx = vy = 0; if (e.wind <= 0) { e.ch = 0.6; e.cdx = dx / d; e.cdy = dy / d; G.shake = Math.max(G.shake, 2); } }
          else if (e.ch > 0) { e.ch -= dt; vx = e.cdx * 165; vy = e.cdy * 165; }
          else { e.cc -= dt; if (e.cc <= 0) { e.wind = 0.6; e.cc = 4.5; } }
          break;
        case 'corposeco':
          e.cc -= dt;
          if (e.cc <= 0) { e.cc = 3.5; puff(e.x, e.y, '#ad9c7e'); for (let i = 0; i < 5; i++) { const [x, y] = edgePos(); spawnEnemy('morcego', x, y); } }
          break;
        case 'curupira':
          e.cc -= dt;
          if (e.ch > 0) { e.ch -= dt; vx = -dx / d * 62; vy = -dy / d * 62; e.mk = (e.mk || 0) - dt; if (e.mk <= 0) { e.mk = 0.16; marks.push({ x: e.x, y: e.y + 4, life: 9, a: Math.atan2(vy, vx), s: (e.s = -(e.s || 1)) }); } }
          else if (e.cc <= 0 && d < 140) { e.ch = 1.6; e.cc = rand(5, 7); }
          break;
        case 'trapalhona':
          e.cc -= dt;
          if (e.ch > 0) { e.ch -= dt; vx = vy = 0; }
          else { vx += Math.sin(e.t * 3.1) * 20; vy += Math.cos(e.t * 2.3) * 20; if (e.cc <= 0) { e.cc = rand(2, 4); e.ch = 1; } }
          e.bump = (e.bump || 0) - dt;
          if (e.bump <= 0) { e.bump = 0.6; query(e.x, e.y, 14, Q); for (const o of Q) if (o !== e && o.alive && !o.d.prop && !o.d.boss && !o.d.seg && dist2(o.x, o.y, e.x, e.y) < 100) hurt(o, 6); }
          break;
        case 'caipora':
          vx = e.cdx * e.spd; vy = e.cdy * e.spd; e.life -= dt; if (e.life <= 0) e.alive = false;
          query(e.x, e.y, 18, Q); for (const o of Q) if (o !== e && o.alive && !o.d.prop && !o.d.boss && !o.d.seg && !e.hitSet.has(o) && dist2(o.x, o.y, e.x, e.y) < 196) { e.hitSet.add(o); hurt(o, 40, e.cdx * 120 - (o.y - e.y) * 3, e.cdy * 120 + (o.x - e.x) * 3); }
          if (Math.random() < 0.5) part(e.x - e.cdx * 10, e.y + 6, rand(-10, 10), rand(-12, -2), 0.4, '#b8a27a', 1);
          break;
        case 'iara':
          vx = vy = 0; e.life = (e.life == null ? 12 : e.life) - dt;
          if (e.life <= 0) { e.alive = false; burst(e.x, e.y, '#5fd4ff', 14); }
          if (d < 160 && !G.dawn) { player.x -= dx / d * 24 * dt; player.y -= dy / d * 24 * dt; if (Math.random() < 0.08) part(e.x + rand(-6, 6), e.y - 10, rand(-8, 8), -20, 0.9, '#a8eaff', 1, true); }
          break;
        case 'cabra':
          if (e.wind > 0) { e.wind -= dt; vx = vy = 0; if (e.wind <= 0) { e.ch = 0.45; e.cdx = dx / d; e.cdy = dy / d; } }
          else if (e.ch > 0) { e.ch -= dt; vx = e.cdx * 160; vy = e.cdy * 160; }
          else { e.cc -= dt; if (e.cc <= 0 && d < 70) { e.wind = 0.6; e.cc = rand(3.5, 5); } }
          break;
        case 'lambisgoia':
          e.cc -= dt;
          if (e.wind > 0) { e.wind -= dt; vx = vy = 0; if (e.wind <= 0) { fx.push({ k: 'arm', x: e.x, y: e.y - 6, tx: px, ty: py, life: 0.2, max: 0.2 }); if (d < 70) playerHit(e.d.dmg * dm); } }
          else if (e.cc <= 0 && d < 66 && d > 20) { e.wind = 0.6; e.cc = 3.2; }
          break;
        case 'velha':
          vx = vy = 0;
          if (d < 55 && !G.dawn) { e.alive = false; G.stun = Math.max(G.stun || 0, 0.6); toast('A Velha de branco gritou!'); burst(e.x, e.y, '#f0ead6', 20, true); sfx('warn'); G.shake = Math.max(G.shake, 3); }
          break;
        case 'leitao':
          if (d > 90) { const side = e.idx % 2 ? 1 : -1, ox = px + (-dy / d) * side * 80, oy = py + (dx / d) * side * 80, ddx = ox - e.x, ddy = oy - e.y, dd = Math.hypot(ddx, ddy) || 1; vx = ddx / dd * e.spd; vy = ddy / dd * e.spd; }
          break;
        case 'cavaleiro':
          e.ang = (e.ang || Math.atan2(e.y - py, e.x - px)) + 1.5 * dt; e.cc -= dt;
          if (e.ch > 0) { e.ch -= dt; vx = e.cdx * 165; vy = e.cdy * 165; }
          else if (e.wind > 0) { e.wind -= dt; vx = vy = 0; if (e.wind <= 0) { e.ch = 0.55; e.cdx = dx / d; e.cdy = dy / d; } }
          else { const tx2 = px + Math.cos(e.ang) * 90, ty2 = py + Math.sin(e.ang) * 90, ddx = tx2 - e.x, ddy = ty2 - e.y, dd = Math.hypot(ddx, ddy) || 1; vx = ddx / dd * e.spd; vy = ddy / dd * e.spd; if (e.cc <= 0 && d < 120) { e.wind = 0.65; e.cc = 4.5; } }
          if (Math.random() < 0.4) part(e.x, e.y + 6, rand(-10, 10), rand(-15, -4), 0.35, '#e8832a', 1, true);
          break;
        case 'mapinguari':
          e.cc -= dt;
          if (e.cc <= 0) { e.cc = 3; let eat = 0; query(e.x, e.y, 50, Q); for (const o of Q) if (o !== e && o.alive && !o.d.boss && !o.d.prop && !o.d.seg && dist2(o.x, o.y, e.x, e.y) < 45 * 45) { o.alive = false; eat++; burst(o.x, o.y, '#6b4a2e', 4); } if (eat) { const heal = e.maxHp * Math.min(0.1, 0.015 * eat); e.hp = Math.min(e.maxHp, e.hp + heal); num(e.x, e.y - 20, heal, DG); sfx('splash'); } }
          break;
        case 'paimato':
          e.cc -= dt;
          if (e.cc <= 0 && !G.dawn) { e.cc = 5.5; for (let i = 0; i < 2; i++) roots.push({ x: clamp(px + rand(-55, 55) + player.fx * 30, 10, MAPW - 10), y: clamp(py + rand(-40, 40) + player.fy * 30, 10, MAPH - 10), t: 0 }); }
          break;
        case 'muricoca': vx += Math.sin(e.t * 9) * 30; vy += Math.cos(e.t * 8) * 30; break;
        case 'urubu': vx = e.cdx * e.spd; vy = e.cdy * e.spd; e.life -= dt; if (e.life <= 0) e.alive = false; break;
        case 'cuca':
          e.cc -= dt;
          if (e.cc <= 0) { e.cc = 2.6; for (let i = 0; i < 3; i++) { const tx = px + rand(-30, 30) + player.fx * 20 * i, ty = py + rand(-30, 30) + player.fy * 20 * i; projs.push({ k: 'pocao', sx: e.x, sy: e.y - 10, tx, ty, x: e.x, y: e.y, t: 0, T: 0.9 + i * 0.12, life: 1 }); } }
          break;
        case 'boitata': {
          const want = Math.atan2(dy, dx); let da = want - e.ang;
          while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
          e.ang += clamp(da, -2.4 * dt, 2.4 * dt);
          const a = e.ang + Math.sin(e.t * 4) * 0.6; vx = Math.cos(a) * e.spd; vy = Math.sin(a) * e.spd;
          if (Math.random() < 0.7) part(e.x, e.y, rand(-15, 15), rand(-15, 15), 0.4, Math.random() < 0.5 ? '#5fd4ff' : '#a8eaff', 2, true);
          break;
        }
        default: if (EB2[e.type]) { const v = EB2[e.type](e, dt, dx, dy, d, px, py, dm); if (v) { vx = v[0]; vy = v[1]; } }
      }
      if (e.d.boss && e.raged) EXH.p2(e, dt);
      if (e.march > 0) { e.march -= dt; const sp = Math.max(45, e.spd); vx = e.cdx * sp; vy = e.cdy * sp; }
      if (muds.length && !e.d.boss && muds.some(m => dist2(m.x, m.y, e.x, e.y) < m.r * m.r)) { vx *= 0.45; vy *= 0.45; }
      if (G.rain > 0) { vx *= 0.8; vy *= 0.8; }
      if (!e.d.fly && inWater(e.x, e.y)) { vx *= 0.5; vy *= 0.5; }
      if (!e.d.fly && inSand(e.x, e.y)) { vx *= 0.3; vy *= 0.3; }
      if (!e.d.fly && inRiver(e.x, e.y)) { vx *= 0.35; vy *= 0.35; }
      if (honeys.length && !e.d.boss && inHoney(e.x, e.y)) { vx *= 0.05; vy *= 0.05; }
      if (e.dance > 0) e.dance -= dt;
      if (e.root > 0) { e.root -= dt; const k = e.d.boss ? 0.5 : 0; vx *= k; vy *= k; }
      e.vx = vx; e.vy = vy;
      e.x += (vx + e.kx) * dt; e.y += (vy + e.ky) * dt;
      const k = Math.max(0, 1 - 10 * dt); e.kx *= k; e.ky *= k;
      if (e.d.fly && (e.x < 4 || e.x > MAPW - 4 || e.y < 4 || e.y > MAPH - 4)) e.alive = false;
      e.x = clamp(e.x, 4, MAPW - 4); e.y = clamp(e.y, 4, MAPH - 4);
    }
    const rr = e.r + player.r;
    if (!e.hide && dist2(px, py, e.x, e.y) < rr * rr) {
      const hp0 = player.hp; playerHit(e.d.dmg * dm * (e.elite ? 1.5 : 1), e);
      if (player.hp < hp0 && ((e.type === 'cabra' && e.ch > 0) || e.type === 'caipora')) { const d = Math.hypot(px - e.x, py - e.y) || 1; player.kx += (px - e.x) / d * 150; player.ky += (py - e.y) / d * 150; if (e.type === 'cabra') e.ch = 0; }
    }
  }
}
function deathFx(e) {
  const x = e.x, y = e.y;
  switch (e.type) {
    case 'morcego': case 'urubu': for (let i = 0; i < 7; i++) part(x + rand(-3, 3), y, rand(-10, 10), rand(-26, -8), rand(0.4, 0.8), i % 2 ? '#5e5e78' : '#8f97c4', 2); break;
    case 'alma': case 'trapalhona': for (let i = 0; i < 9; i++) part(x + rand(-4, 4), y + rand(-3, 3), rand(-4, 4), rand(-48, -25), rand(0.5, 0.9), '#cfe0ff', 1, true); break;
    case 'mula': case 'caipora': for (let i = 0; i < 14; i++) part(x, y, rand(-40, 40), rand(-65, -10), rand(0.4, 0.8), Math.random() < 0.5 ? '#e8832a' : '#f2c14e', Math.random() < 0.4 ? 2 : 1, true); break;
    case 'saci': burst(x, y, '#c8463c', 8); part(x, y - 6, rand(-20, 20), -70, 0.9, '#c8463c', 3); break;
    case 'vagalume': case 'muricoca': burst(x, y, '#fff6a0', 6, true); break;
    case 'curupira': for (let i = 0; i < 9; i++) part(x, y, rand(-30, 30), rand(-30, 5), rand(0.4, 0.8), Math.random() < 0.5 ? '#5f9e4a' : '#e8832a', 1); break;
    case 'cabra': for (let i = 0; i < 8; i++) part(x, y, rand(-30, 30), rand(-30, 10), 0.6, '#d8d4c4', 2); break;
    default: burst(x, y, e.d.col, e.d.boss ? 40 : 6, false);
  }
}
function hurt(e, dmg, kx, ky, src) {
  const t = e.parent || e; if (!t.alive || !e.alive || e.hide) return;
  let crit = false; dmg = EXH.hurtMul(t, dmg);
  if (src) { t.lastSrc = src; if (save.gold[src]) dmg *= 1.1; if (Math.random() < 0.05 + 0.02 * (player.pass.ferradura || 0) + EXH.critChance()) { dmg *= EXH.critMul(); crit = true; } }
  if (src) G.dmg[src] = (G.dmg[src] || 0) + dmg;
  t.hp -= dmg; e.flash = 0.08; t.flash = 0.08;
  if (t.d.boss && !t.raged && t.hp > 0 && t.hp < t.maxHp * 0.5) { t.raged = true; t.spd *= 1.2; banner(t.bossName + ' ficou furioso!'); G.shake = Math.max(G.shake, 5); burst(t.x, t.y, '#ff3b2e', 24, true); }
  if (!t.d.boss && !t.d.prop && kx !== undefined) { const kb = t.elite ? 0.25 : 1; e.kx += kx * kb; e.ky += ky * kb; }
  // números agrupados: golpes seguidos no mesmo inimigo somam no mesmo número
  const ln = e.ln; if (!crit && ln && ln.life > ln.max - 0.25 && nums.includes(ln)) { ln.v += Math.max(1, Math.round(dmg)); ln.x = e.x; ln.y = Math.min(ln.y, e.y - e.r - 3); } else { const n = num(e.x, e.y - e.r - 3, dmg, crit ? DY : DW, crit); if (!crit) e.ln = n; }
  if (crit) { for (let i = 0; i < 5; i++) part(e.x, e.y - 3, rand(-50, 50), rand(-60, -10), 0.35, i % 2 ? '#fff6a0' : '#f2c14e', 1, true); sfx('crit'); } else sfx('hit');
  if (t.hp <= 0) kill(t);
}
function kill(e) {
  if (!e.alive) return; e.alive = false;
  if (e.d.prop) { G.nProps--; burst(e.x, e.y, e.d.col, 10); propLoot(e); return; }
  G.kills++; G.byEnemy[e.type] = (G.byEnemy[e.type] || 0) + 1; EXH.onKill(e);
  if (LENDAS[e.type] && !save.figs[e.type]) { save.figs[e.type] = true; persist(); toast('Nova figurinha: ' + (ENAMES[e.type] || e.type)); }
  if (player.pass.terco && G.kills % 10 === 0) player.hp = Math.min(player.maxHp, player.hp + player.pass.terco);
  if (e.lastSrc && WEAPONS[e.lastSrc]) { const wk = save.stats.wkills, c = wk[e.lastSrc] = (wk[e.lastSrc] || 0) + 1; if (c >= 5000 && !save.gold[e.lastSrc]) { save.gold[e.lastSrc] = true; persist(); toast(WEAPONS[e.lastSrc].name + ' dourada liberada: +10% de dano para sempre!'); refreshSlots(); } }
  deathFx(e);
  if (e.d.boss) {
    if (e.segs) for (const s of e.segs) { s.alive = false; burst(s.x, s.y, '#5fd4ff', 4, true); }
    for (let i = 0; i < 26; i++) drop(e.x + rand(-26, 26), e.y + rand(-26, 26), 'xp', 6);
    drop(e.x, e.y, 'rap', 10); drop(e.x + 8, e.y, 'cuscuz', 40); drop(e.x - 8, e.y, 'bau', 1);
    if (e.type === 'lobisomem') unlockAch('lobisomem');
    if (LENDAS[e.type] && !save.figs[e.type]) { save.figs[e.type] = true; persist(); toast('Nova figurinha: ' + (ENAMES[e.type] || e.type)); }
    if (G.boss === e) G.boss = null;
    G.evNext = Math.max(G.evNext || 0, G.time + 12); // respiro depois do chefão
    banner(e.bossName + ' caiu!'); G.shake = 6; sfx('boom');
  } else {
    drop(e.x, e.y, 'xp', e.d.xp * 1.8 * (G.blood ? 2 : 1) * (inGrave(e.x, e.y) ? 2 : 1)); // vida ×1,8 → XP ×1,8: mesmo ritmo de níveis
    if (e.elite) { drop(e.x + 6, e.y, 'bau', 1); burst(e.x, e.y, '#f2c14e', 20, true); }
    const r = Math.random(), L = player.st.luck;
    if (r < 0.004 * L) drop(e.x, e.y, 'cuscuz', 30); else if (r < 0.012 * L) drop(e.x, e.y, 'rap', 1);
  }
}

/* ---------------- jogador ---------------- */
function playerHit(dmg, src) {
  if (player.inv > 0 || mode !== 'play' || G.dawn) return;
  if (player.pass.pecoelho && Math.random() < 0.08 * player.pass.pecoelho) { player.inv = 0.3; burst(player.x, player.y, '#f0ead6', 6); return; }
  if (EXH.block(dmg, src)) return;
  player.hp -= EXH.dmgIn(dmg, src) * (G.altar && G.altar.k === 'couro' ? 0.5 : 1) * (G.finalT > 0 ? 0.5 : 1); player.inv = 0.6; G.shake = Math.max(G.shake, 3); G.hurtFlash = 0.25; sfx('hurt');
  EXH.onHit(dmg, src);
  if (player.hp <= 0) {
    if (player.pass.fitinha && !G.fita) { G.fita = true; player.hp = player.maxHp * 0.3; player.inv = 2; toast('A fitinha do Bonfim arrebentou!'); burst(player.x, player.y, '#f2c14e', 24, true); }
    else if (save.up.reviver && !G.revived) {
      G.revived = true; player.hp = player.maxHp * 0.5; player.inv = 2; toast('Você levantou de novo!');
      for (const e of enemies) if (e.alive && !e.d.boss && !e.d.seg && dist2(e.x, e.y, player.x, player.y) < 90 * 90) kill(e);
      burst(player.x, player.y, '#f4e7b6', 30, true);
    } else { player.hp = 0; endRun(false); }
  }
}
function drop(x, y, kind, v) {
  if (kind === 'xp' && items.length > 420) { const it = items[(Math.random() * items.length) | 0]; if (it.kind === 'xp') { it.v += v; return; } }
  items.push({ x, y, kind, v, mag: false, sp: 0, dead: false, t: Math.random() * 6 });
}
function updItems(dt) {
  const M = player.st.magnet * (G.altar && G.altar.k === 'ima' ? 3 : 1);
  for (const it of items) {
    if (it.dead) continue; it.t += dt;
    const dx = player.x - it.x, dy = player.y - it.y, d = Math.hypot(dx, dy) || 1;
    if (!it.mag && d < M) it.mag = true;
    if (it.mag) { it.sp = Math.min(it.fast ? 1100 : 340, it.sp + (it.fast ? 1500 : 520) * dt); const st = Math.min(d, it.sp * dt); it.x += dx / d * st; it.y += dy / d * st; }
    if (d < 7) { it.dead = true; collect(it); }
  }
  compact(items, i => !i.dead);
}
function collect(it) {
  if (it.kind === 'xp') { addXp(it.v); sfx('pick'); }
  else if (it.kind === 'rap') { G.rap += it.v; sfx('coin'); num(player.x, player.y - 12, it.v, DY); }
  else if (it.kind === 'bau') { G.pendingChest++; sfx('coin'); }
  else if (PWK.has(it.kind)) powerUp(it.kind);
  else { const v = it.v * EXH.foodMul(), h = Math.min(v, player.maxHp - player.hp); player.hp += h; sfx('coin'); num(player.x, player.y - 12, v, DG); }
}
function addXp(v) { player.xp += v * (1 + 0.05 * (save.prest || 0)) * EXH.xpMul(); while (player.xp >= player.next) { player.xp -= player.next; player.level++; player.next = need(player.level); G.pendingLv++; EXH.onLevel(); } }

