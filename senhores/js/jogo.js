'use strict';
/* lógica do Reinado do Sertão: partida, anos, cartas, rivais e batalha */
const DSAVE_KEY = 'visagem-dlc-senhores';
const DDEF = { unl: { coronel: 1 }, glory: 0, tree: {}, recs: {}, pesadelo: 0, music: 1, sound: 1, run: null, seen: {} };
let dsave = loadD();
function loadD() { try { const s = JSON.parse(localStorage.getItem(DSAVE_KEY)); if (s) return Object.assign(JSON.parse(JSON.stringify(DDEF)), s); } catch (e) {} return JSON.parse(JSON.stringify(DDEF)); }
function persistD() { try { localStorage.setItem(DSAVE_KEY, JSON.stringify(dsave)); } catch (e) {} }
const hasT = id => !!dsave.tree[id];

// geometria da fazenda (espaço de layout 427x240, igual à arte)
const GEO = { CX: 213, CY: 52, A: 24, gate: [341, 102] };
const tileTop = (i, j) => [GEO.CX + (i - j) * GEO.A, GEO.CY + (i + j) * GEO.A / 2];
const tileCen = idx => { const i = Math.floor(idx / 5), j = idx % 5, [x, y] = tileTop(i, j); return [x, y + GEO.A / 2]; };
const CASA = 12;
function neigh(idx) { const i = Math.floor(idx / 5), j = idx % 5, o = []; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a >= 0 && a < 5 && b >= 0 && b < 5) o.push(a * 5 + b); } return o; }
function pickTile(x, y) { const a = (x - GEO.CX) / GEO.A, b = (y - GEO.CY) / (GEO.A / 2), u = (a + b) / 2, v = (b - a) / 2, i = Math.floor(u), j = Math.floor(v); return i >= 0 && i < 5 && j >= 0 && j < 5 ? i * 5 + j : -1; }

let R = null; // partida atual
let RNG = Math.random;
const pick = a => a[Math.floor(RNG() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(RNG() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function newFarm(lord) {
  const tiles = []; for (let k = 0; k < 25; k++) tiles.push({ t: 'terra', c: null, lvl: 0, troops: 0, bless: [] });
  tiles[CASA].c = 'casa'; tiles[CASA].lvl = 1;
  const free = shuffle([...Array(25).keys()].filter(k => k !== CASA));
  ['agua', 'agua', 'agua', 'pedra', 'pedra', 'pedra', 'mata', 'mata', 'mata'].forEach((t, n) => tiles[free[n]].t = t);
  return { lord, tiles };
}
function buildDeck(lord) { const d = []; for (const c of LORDS[lord].cartas) d.push(c, c); for (const c of COMMON) d.push(c); return d; }

/* ---------- partida ---------- */
function newRun(lord, dif) {
  const rivals = {};
  for (const id of LORD_ORDER) if (id !== lord && !LORDS[id].secreto) rivals[id] = { id, lives: 3, farm: newFarm(id), deck: buildDeck(id), rap: 3, cd: 0, armed: [], met: false };
  const casaMax = Math.round(100 * (1 + 0.15 * ['casa1', 'casa2', 'casa3'].filter(hasT).length));
  R = { v: 1, lord, dif, year: 1, rap: 3 + (hasT('rap1') ? 2 : 0) + (hasT('rap2') ? 2 : 0), casaMax, casa: casaMax, farm: newFarm(lord), deck: buildDeck(lord), hand: [], reserve: [], swaps: 0, played: false,
    cd: 0, rivals, order: shuffle(Object.keys(rivals)), rr: 0, sched: {}, season: 'chuva', event: null, mods: {}, armed: [], log: [], stats: { wins: 0, losses: 0, kills: 0, defeated: [] }, infinite: false, over: false };
  if (hasT('primeiro')) { const t = R.farm.tiles, k = [6, 8, 16, 18].find(n => !t[n].c); placeLot(R.farm, k, LORDS[lord].cartas[0], R); }
  startYear();
  return R;
}
const isMoon = y => y % 4 === 0;
const seasonOf = y => Math.floor((y - 1) / 4) % 2 ? 'seca' : 'chuva';
function yearType(y) { if (CHEFES[y] || (y > ANOS && (y - ANOS) % 5 === 0)) return 'boss'; if (y === 1) return 'paz'; return y % 2 === 0 ? 'defesa' : 'ataque'; }
function bossOf(y) { if (CHEFES[y]) return Object.assign({ scale: 1 }, CHEFES[y]); const k = (y - ANOS) / 5; return Object.assign({}, CHEFES[33], { scale: 1 + 0.6 * k, nome: 'O Pai do Mato · ' + (k + 1) + 'ª volta' }); }
const alive = () => Object.values(R.rivals).filter(r => r.lives > 0);
function attackerOf(y) {
  if (R.sched[y] && R.rivals[R.sched[y]].lives > 0) return R.sched[y];
  const al = R.order.filter(id => R.rivals[id].lives > 0); if (!al.length) return null;
  // fila circular estável entre os vivos (previsão para a linha do tempo)
  let n = 0; for (let k = R.year; k < y; k++) if (yearType(k) === 'defesa' && !(R.sched[k])) n++;
  return al[(R.rr + n) % al.length];
}
function rivalMul(y) { const p = R.dif === 'pesadelo'; return (p ? 1.08 : 0.8) + y * (p ? 0.016 : 0.006); }

function startYear() {
  const y = R.year;
  R.season = seasonOf(y); R.event = null; R.played = false; R.mods.grow = 0;
  if (y > 2 && RNG() < 0.2) { R.event = pick(EVENTS).id; applyEventNow(R.event); }
  R.swaps = 1 + (hasT('troca') ? 1 : 0);
  R.hand = drawCards(R.deck, 3);
  for (let n = 0; n < 12 && !R.hand.some(c => anyTile(R.farm, c)); n++) R.hand = drawCards(R.deck, 3);
  if (yearType(y) === 'defesa') { const a = attackerOf(y); if (a) { R.sched[y] = a; R.rr++; } }
  for (const r of alive()) rivalPlay(r);
  dsave.run = R; persistD();
}
function applyEventNow(id) { if (id === 'saojoao') R.rap += 6; if (id === 'romaria') R.casa = Math.min(R.casaMax, R.casa + 15); }
function drawCards(deck, n, exclude) {
  const pool = deck.slice(), out = [];
  while (out.length < n && pool.length) {
    let tot = 0; for (const c of pool) tot += RARW[CARDS[c].rar];
    let r = RNG() * tot, k = 0; for (; k < pool.length - 1; k++) { r -= RARW[CARDS[pool[k]].rar]; if (r <= 0) break; }
    const c = pool.splice(k, 1)[0]; if (!out.includes(c) || pool.every(p => out.includes(p))) out.push(c);
  }
  return out;
}

/* ---------- regras dos lotes ---------- */
const lvlMul = l => 1 + 0.6 * (l - 1);
function terrB(farm, idx) { const t = farm.tiles[idx], c = CARDS[t.c]; let b = 1; if (c && c.terr === t.t) b += 0.3; if (farm.lord === 'caipora' && t.t === 'mata') b += 0.5; return b; }
function modsOf(farm, idx, ctx) {
  const m = { hp: 0, dmg: 0, spd: 0, rng: 0, grow: 0, slow: 0, burn: 0, stealth: 0, charge: 0, moon: 0 };
  const bm = farm.lord === 'rezadeira' ? 2 : 1, t = farm.tiles[idx];
  for (const b of t.bless) { const c = CARDS[b]; if (c.mod) for (const k in c.mod) m[k] += c.mod[k] * (k === 'stealth' ? 1 : bm); }
  for (const n of neigh(idx)) { const nt = farm.tiles[n]; if (!nt.c || nt.c === 'casa') continue; const nc = CARDS[nt.c]; const mul = lvlMul(nt.lvl) * 0.5 + 0.5;
    if (nc.aura) for (const k in nc.aura) m[k] += nc.aura[k] * mul;
    for (const b of nt.bless) { const bc = CARDS[b]; if (bc.aura) for (const k in bc.aura) m[k] += bc.aura[k] * bm; } }
  if (ctx && isMoon(ctx.year) && m.moon) m.dmg += m.moon;
  return m;
}
function growMul(farm, idx) {
  let g = 1 + modsOf(farm, idx).grow;
  if (R) { if (R.season === 'chuva') g *= 1.15; else g *= 0.9; if (R.event === 'chuvaboa') g *= 1.25; }
  if (farm === (R && R.farm)) g *= 1 + 0.1 * ['grow1', 'grow2'].filter(hasT).length;
  return g;
}
function placeLot(farm, idx, cid, run) {
  const t = farm.tiles[idx], c = CARDS[cid];
  if (t.c === cid && t.lvl < 5) { const old = lvlMul(t.lvl); t.lvl++; if (c.kind === 'tropa') t.troops = t.troops * lvlMul(t.lvl) / old + c.t0; return 'lvl'; }
  t.c = cid; t.lvl = 1; t.troops = c.kind === 'tropa' ? c.t0 * terrB(farm, idx) : 0;
  if (cid === 'matafechada') for (const n of neigh(idx)) if (!farm.tiles[n].c) farm.tiles[n].t = 'mata';
  return 'new';
}
// onde uma carta pode ir
function anyTile(farm, cid) { const c = CARDS[cid]; if (c.tipo === 'decreto' && !c.tgt) return true; for (let k = 0; k < 25; k++) if (canPlay(farm, cid, k)) return true; return false; }
function canPlay(farm, cid, idx) {
  const c = CARDS[cid], t = farm.tiles[idx]; if (idx < 0) return false;
  if (c.tipo === 'lote') return idx !== CASA && (!t.c || (t.c === cid && t.lvl < 5));
  if (c.tipo === 'bencao') return !!t.c && t.c !== 'casa' && t.bless.length < 3;
  if (c.tipo === 'decreto') { if (!c.tgt) return true; if (c.fx === 'mutirao') return t.c && CARDS[t.c] && CARDS[t.c].kind === 'tropa'; return t.c && t.c !== 'casa' && t.lvl < 5; }
  return false;
}
function playCard(farm, cid, idx, who) {
  const c = CARDS[cid];
  if (c.tipo === 'lote') return placeLot(farm, idx, cid);
  if (c.tipo === 'bencao') { farm.tiles[idx].bless.push(cid); return 'bless'; }
  const t = idx >= 0 ? farm.tiles[idx] : null, rv = who && who !== 'player' ? who : null;
  switch (c.fx) {
    case 'rap5': rv ? rv.rap += 5 : R.rap += 5; break;
    case 'saque': rv ? rv.rap += 8 : R.rap += 8; break;
    case 'forro': for (const tt of farm.tiles) if (tt.c && CARDS[tt.c] && CARDS[tt.c].kind === 'tropa') tt.troops *= 1.12; break;
    case 'mutirao': t.troops *= 1.4; break;
    case 'lvlup': { const old = lvlMul(t.lvl); t.lvl++; if (CARDS[t.c].kind === 'tropa') t.troops *= lvlMul(t.lvl) / old; break; }
    case 'traquinagem': if (!rv) for (const r of alive()) { const g = Math.min(2, r.rap); r.rap -= g; R.rap += g; } else { R.rap = Math.max(0, R.rap - 2); rv.rap += 2; } break;
    case 'visao': if (!rv) R.hand.push(...drawCards(R.deck, 3).filter(x => x !== 'visao')); break;
    default: if (c.when === 'batalha') (rv ? rv.armed : R.armed).push(c.fx);
  }
  return 'fx';
}
function tileInfo(farm, idx, year) {
  const t = farm.tiles[idx]; if (!t.c) return null;
  if (t.c === 'casa') return { kind: 'casa' };
  const c = CARDS[t.c], m = modsOf(farm, idx, { year }), tb = terrB(farm, idx);
  return { c, m, tb, lvl: t.lvl, troops: t.troops, rap: (c.rap || 0) ? (c.rap * lvlMul(t.lvl) * tb + (farm.lord === 'coronel' ? 1 : 0)) : 0 };
}
function rapIncome(farm) {
  if (R && R.event === 'gafanhoto') return 0;
  let s = 0; for (let k = 0; k < 25; k++) { const t = farm.tiles[k]; if (!t.c || t.c === 'casa') continue; const c = CARDS[t.c]; if (c.rap) s += Math.round(c.rap * lvlMul(t.lvl) * terrB(farm, k)) + (farm.lord === 'coronel' ? 1 : 0); }
  return s;
}
function growFarm(farm, mul) { for (let k = 0; k < 25; k++) { const t = farm.tiles[k]; if (!t.c || t.c === 'casa') continue; const c = CARDS[t.c]; if (c.kind === 'tropa') t.troops += c.grow * lvlMul(t.lvl) * terrB(farm, k) * growMul(farm, k) * (mul || 1); } }
function farmPower(farm, mul, year) {
  let p = 0; for (let k = 0; k < 25; k++) { const t = farm.tiles[k]; if (!t.c || t.c === 'casa') continue; const c = CARDS[t.c], m = modsOf(farm, k, { year });
    if (c.kind === 'tropa') { const u = UNITS[c.unit]; p += t.troops * Math.sqrt(u.hp * (1 + m.hp) * u.dmg * (1 + m.dmg)) / 10; }
    if (c.kind === 'torre') p += c.tower.dmg * lvlMul(t.lvl) * (1 + m.dmg) / c.tower.cd * (1 + 0.1 * year) * 3; }
  return p * (mul || 1);
}

/* ---------- IA dos rivais ---------- */
function rivalPlay(r) {
  const hand = drawCards(r.deck, 3), f = r.farm; let best = null;
  const empties = [...Array(25).keys()].filter(k => !f.tiles[k].c);
  for (const cid of hand) {
    const c = CARDS[cid];
    if (c.tipo === 'lote') {
      const same = [...Array(25).keys()].find(k => f.tiles[k].c === cid && f.tiles[k].lvl < 5);
      if (same !== undefined) { const s = 3 + f.tiles[same].lvl * 0.3; if (!best || s > best.s) best = { s, cid, idx: same }; continue; }
      if (!empties.length) continue;
      const idx = empties.slice().sort((a, b) => (f.tiles[b].t === c.terr) - (f.tiles[a].t === c.terr) || dCen(a) - dCen(b))[0];
      const s = (c.kind === 'tropa' ? 2.6 : c.kind === 'torre' ? 2.2 : (R.year < 10 ? 2 : 1)) + (f.tiles[idx].t === c.terr ? 0.4 : 0) + RNG() * 0.3;
      if (!best || s > best.s) best = { s, cid, idx };
    } else if (c.tipo === 'bencao') {
      const tro = [...Array(25).keys()].filter(k => f.tiles[k].c && f.tiles[k].c !== 'casa' && f.tiles[k].bless.length < 3).sort((a, b) => f.tiles[b].troops - f.tiles[a].troops)[0];
      if (tro !== undefined) { const s = 2.1 + RNG() * 0.3; if (!best || s > best.s) best = { s, cid, idx: tro }; }
    } else {
      let idx = -1; if (c.tgt) { idx = [...Array(25).keys()].filter(k => canPlay(f, cid, k)).sort((a, b) => f.tiles[b].troops - f.tiles[a].troops)[0]; if (idx === undefined) continue; }
      const s = 1.4 + RNG() * 0.5; if (!best || s > best.s) best = { s, cid, idx };
    }
  }
  if (best) playCard(f, best.cid, best.idx, r);
}
const dCen = k => Math.abs(Math.floor(k / 5) - 2) + Math.abs(k % 5 - 2);

/* ---------- fim do ano ---------- */
function endYear(res) {
  const y = R.year; R.log = [];
  growFarm(R.farm, 1);
  for (const r of alive()) growFarm(r.farm, 1);
  const inc = 2 + rapIncome(R.farm); R.rap += inc; R.log.push(`+${inc} rapaduras de renda`);
  // brigas entre os outros senhores
  const al = alive();
  if (y > 6 && al.length > 2) {
    const fights = Math.max(1, Math.floor(al.length / 4));
    for (let n = 0; n < fights; n++) { const [a, b] = shuffle(alive().slice()).slice(0, 2); if (!a || !b || RNG() > 0.55) continue;
      const pa = farmPower(a.farm, 1, y) * (0.75 + RNG() * 0.5), pb = farmPower(b.farm, 1, y) * (0.75 + RNG() * 0.5), lo = pa < pb ? a : b, hi = lo === a ? b : a;
      lo.lives--; R.log.push(`${LORDS[hi.id].nome} venceu ${LORDS[lo.id].nome}` + (lo.lives <= 0 ? ' e tomou as terras dele!' : '')); }
  }
  if (yearType(y) === 'boss') for (const r of alive()) if (farmPower(r.farm, rivalMul(y), y) < 60 + y * 9) { r.lives--; R.log.push(`${bossOf(y).nome} castigou ${LORDS[r.id].nome}`); }
  if (R.cd > 0) R.cd--;
  for (const r of alive()) if (r.cd > 0) r.cd--;
  if (R.casa <= 0) return 'derrota';
  if (y === ANOS && !R.infinite) return res === 'win' ? 'vitoria' : 'fim';
  R.year++; startYear(); return 'segue';
}
const powerCd = () => 3 - (hasT('fe') ? 1 : 0);

/* ---------- batalha ---------- */
// def/att: { farm?, lord, mul, boss?, who: 'player'|rivalId|'boss' }
function makeBattle(def, att, year) {
  const B = { t: 0, year, ents: [], towers: [], projs: [], fx: [], nums: [], over: null, def, att, casaMax: 0, casa: 0, buffs: [{}, {}], log: [], powerUsed: [false, false], kills: [0, 0] };
  const lordOf = s => (s ? att : def).lord;
  const spawnLot = (side, farm, k, mul, at) => {
    const t = farm.tiles[k], c = CARDS[t.c], u = UNITS[c.unit], m = modsOf(farm, k, { year }), tb = terrB(farm, k);
    let troops = t.troops * mul; if (farm.lord === 'lobisomem' && isMoon(year)) troops *= 1.5;
    const n = Math.max(1, Math.min(14, Math.ceil(Math.sqrt(troops) * 0.9))), per = troops / n;
    const L = lordOf(side), rngB = (u.rng > 12 && L === 'cangaceiro') ? 1.25 : 1;
    const [cx, cy] = at || tileCen(k);
    for (let q = 0; q < n; q++) {
      const hp = u.hp * (1 + m.hp) * per / 10 * (tb > 1 ? 1 + (tb - 1) * 0.5 : 1);
      B.ents.push({ side, unit: c.unit, x: cx + (RNG() - 0.5) * (at ? 30 : 26), y: cy + (RNG() - 0.5) * (at ? 16 : 10), hx: cx, hy: cy, hp, max: hp,
        dmg: u.dmg * (1 + m.dmg) * per / 10 * rngB * (tb > 1 ? 1 + (tb - 1) * 0.5 : 1), rng: u.rng * (1 + m.rng), spd: u.spd * (1 + m.spd) * (L === 'saci' ? 1.3 : 1),
        cd: u.cd, t: RNG() * u.cd, tgt: null, rt: 0, slow: m.slow, burn: m.burn + (u.burn || 0), heal: u.heal || 0, charge: (u.charge || 0) + m.charge + (L === 'mula' ? 0.4 : 0), first: true,
        stealth: m.stealth ? 4 : 0, st: { slow: 0, burn: 0, stun: 0, fear: 0, bdmg: 0 }, step: RNG() * 10, troops: per });
    }
  };
  const towerMul = (L) => (L === 'boitata' ? 1.3 : 1) * (R && R.season === 'seca' ? 1.1 : 0.9) * (R && R.event === 'eclipse' ? 0.7 : 1);
  // defensor: tropas e torres no lugar
  if (def.farm) {
    const f = def.farm;
    for (let k = 0; k < 25; k++) { const t = f.tiles[k]; if (!t.c || t.c === 'casa') continue; const c = CARDS[t.c];
      if (c.kind === 'tropa') spawnLot(0, f, k, def.mul);
      if (c.kind === 'torre') { const [x, y] = tileCen(k), m = modsOf(f, k, { year }); B.towers.push(Object.assign({ x, y: y - 14, k, t: RNG() }, c.tower, { dmg: c.tower.dmg * lvlMul(t.lvl) * terrB(f, k) * (1 + m.dmg) * (1 + 0.1 * year) * towerMul(def.lord) * (def.who === 'player' && hasT('arsenal') ? 1.15 : 1) * (def.who === 'player' ? 1 : def.mul) })); } }
    const [cx, cy] = tileCen(CASA);
    B.towers.push({ x: cx, y: cy - 16, k: CASA, t: 0, dmg: (5 + 0.6 * year) * (def.who === 'player' ? 1 : def.mul), cd: 1.1, rng: 72, proj: 'flecha', casa: 1 });
    const defHp = B.ents.reduce((s, e) => s + e.max, 0);
    B.casaMax = B.casa = Math.max(200, defHp * 0.45) + year * 20;
  }
  // atacante: entra pela porteira
  const [gx, gy] = GEO.gate;
  if (att.boss) {
    const b = att.boss, s = b.scale * (R.dif === 'pesadelo' ? 1.5 : 1), hp = b.hp * s;
    B.ents.push({ side: 1, unit: 'boss', spr: b.spr, x: gx - 6, y: gy + 10, hx: gx, hy: gy, hp, max: hp, dmg: b.dmg * s, rng: 10, spd: 9, cd: 1.3, t: 0, tgt: null, rt: 0, area: 16, slow: 0, burn: 0, heal: 0, charge: 0, first: false, stealth: 0, st: { slow: 0, burn: 0, stun: 0, fear: 0, bdmg: 0 }, step: 0, troops: 0, boss: 1 });
    const minF = { farm: { lord: 'boss', tiles: Array.from({ length: 25 }, (_, n) => ({ c: n ? null : 'min', t: 'terra', lvl: 1, troops: (14 + 6 * year) * s, bless: [] })) } };
    CARDS.min = CARDS.min || { kind: 'tropa', unit: 'visagem', t0: 1, grow: 0 };
    for (let w = 0; w < 3; w++) spawnLot(1, minF.farm, 0, 1 / 3, [gx - 10 - w * 8, gy + 14 + w * 6]);
  } else {
    const f = att.farm;
    for (let k = 0; k < 25; k++) { const t = f.tiles[k]; if (!t.c || t.c === 'casa' || CARDS[t.c].kind !== 'tropa') continue; spawnLot(1, f, k, att.mul, [gx - 18 - RNG() * 24, gy + 4 + RNG() * 26]); }
  }
  // limite de entidades para o celular
  for (const side of [0, 1]) { const es = B.ents.filter(e => e.side === side && !e.boss); if (es.length > 170) { const keep = 170 / es.length; const kill = new Set(es.filter(() => RNG() > keep)); const lost = [...kill].reduce((s, e) => s + e.max, 0), gain = 1 + lost / es.filter(e => !kill.has(e)).reduce((s, e) => s + e.max, 0); B.ents = B.ents.filter(e => !kill.has(e)); for (const e of B.ents) if (e.side === side && !e.boss) { e.hp *= gain; e.max *= gain; e.dmg *= gain; } } }
  B.init = [0, 1].map(s => B.ents.filter(e => e.side === s).reduce((a, e) => a + e.max * e.dmg, 0));
  B.lords = [def.lord, att.lord];
  // decretos armados no plano disparam aos 2s
  B.armed = [[...(def.who === 'player' ? R.armed : def.who !== 'boss' && R.rivals[def.who] ? R.rivals[def.who].armed : [])], [...(att.who === 'player' ? R.armed : att.who !== 'boss' && R.rivals[att.who] ? R.rivals[att.who].armed : [])]];
  if (def.lord === 'cuca' || att.lord === 'cuca') B.cucaSide = def.lord === 'cuca' ? 0 : 1;
  return B;
}
const sideOf = (B, who) => (B.def.who === who ? 0 : B.att.who === who ? 1 : -1);
function hurt(B, e, dmg, src) {
  if (e.hp <= 0) return;
  e.hp -= dmg; B.nums.push({ x: e.x, y: e.y - 6, v: dmg, t: 0.7, side: e.side });
  if (e.hp <= 0) { B.kills[1 - e.side]++; B.fx.push({ k: 'puff', x: e.x, y: e.y, t: 0.4 });
    if (B.lords[1 - e.side] === 'anhanga' && !e.boss && RNG() < 0.12) { const u = UNITS.veado; B.ents.push(Object.assign({}, e, { side: 1 - e.side, unit: 'veado', hp: e.max * 0.6, max: e.max * 0.6, dmg: e.dmg, spd: u.spd, rng: 6, st: { slow: 0, burn: 0, stun: 0, fear: 0, bdmg: 0 }, tgt: null, boss: 0 })); } }
}
function applyHit(B, a, e, dmg) {
  let d = dmg * (1 + (B.buffs[a.side].dmg || 0)) * (1 - (B.buffs[a.side].weak || 0));
  if (a.first && a.charge) { d *= 1 + a.charge; } a.first = false;
  if (a.area) { for (const o of B.ents) if (o.side !== a.side && o.hp > 0 && dist2(o.x, o.y, e.x, e.y) < a.area * a.area) hurt(B, o, d * (o === e ? 1 : 0.6)); }
  else hurt(B, e, d);
  if (a.slow) e.st.slow = Math.max(e.st.slow, 2); if (a.burn) { e.st.burn = 3; e.st.bdmg = Math.max(e.st.bdmg, d * a.burn / 3); }
}
function useBattleFx(B, side, fx) {
  const foes = B.ents.filter(e => e.side !== side && e.hp > 0), mine = B.ents.filter(e => e.side === side && e.hp > 0);
  const cen = foes.length ? [foes.reduce((s, e) => s + e.x, 0) / foes.length, foes.reduce((s, e) => s + e.y, 0) / foes.length] : GEO.gate;
  const timed = (k, v, s, who) => { B.buffs[who][k] = v; B.buffs[who][k + 'T'] = s; };
  switch (fx) {
    case 'ordem': timed('dmg', 0.4, 8, side); break;
    case 'reza': for (const e of mine) e.hp = Math.min(e.max, e.hp + e.max * 0.5); B.fx.push({ k: 'ring', x: tileCen(CASA)[0], y: tileCen(CASA)[1], t: 0.8, c: '#9fe07a' }); break;
    case 'emboscada': { const ref = mine.length ? mine : foes, avg = ref.reduce((s, e) => s + e.max, 0) / Math.max(1, ref.length), dm = ref.reduce((s, e) => s + e.dmg, 0) / Math.max(1, ref.length); const [bx, by] = side === 1 ? tileCen(CASA) : GEO.gate;
      for (let q = 0; q < 10; q++) B.ents.push({ side, unit: 'cang', x: bx + (RNG() - 0.5) * 40, y: by + (RNG() - 0.5) * 20, hx: bx, hy: by, hp: avg, max: avg, dmg: dm, rng: 44, spd: 16, cd: 1.3, t: RNG(), tgt: null, rt: 0, slow: 0, burn: 0, heal: 0, charge: 0, first: false, stealth: 0, st: { slow: 0, burn: 0, stun: 0, fear: 0, bdmg: 0 }, step: 0, troops: 0 }); break; }
    case 'sono': for (const e of foes) e.st.stun = Math.max(e.st.stun, 4); break;
    case 'redemoinho': for (const e of foes) { if (dist2(e.x, e.y, cen[0], cen[1]) < 60 * 60) { hurt(B, e, e.max * 0.15); const dx = e.x - cen[0], dy = e.y - cen[1], d = Math.hypot(dx, dy) || 1; e.x += dx / d * 18; e.y += dy / d * 9; } } B.fx.push({ k: 'ring', x: cen[0], y: cen[1], t: 0.8, c: '#c9a878' }); break;
    case 'uivo': for (const e of foes) e.st.fear = Math.max(e.st.fear, 3); timed('dmg', 0.2, 5, side); break;
    case 'rastro': for (const e of foes) if (Math.abs(e.y - cen[1]) < 22) { hurt(B, e, e.max * 0.25); e.st.burn = 3; e.st.bdmg = e.max * 0.02; } B.fx.push({ k: 'line', y: cen[1], t: 1, c: '#5fd4ff' }); break;
    case 'galope': timed('spd', 0.8, 5, side); for (const e of mine) { e.first = true; e.charge = Math.max(e.charge, 0.4); } break;
    case 'bichos': { const [bx, by] = side === 0 ? tileCen(CASA) : GEO.gate, avg = 8 + B.year * 2; for (let q = 0; q < 15; q++) B.ents.push({ side, unit: 'bicho', x: bx + (RNG() - 0.5) * 50, y: by + (RNG() - 0.5) * 25, hx: bx, hy: by, hp: avg * 2.5, max: avg * 2.5, dmg: avg * 0.6, rng: 5, spd: 34, cd: 0.6, t: RNG(), tgt: null, rt: 0, slow: 0, burn: 0, heal: 0, charge: 0, first: false, stealth: 0, st: { slow: 0, burn: 0, stun: 0, fear: 0, bdmg: 0 }, step: 0, troops: 0 }); break; }
    case 'assombro': timed('weak', 0.35, 10, 1 - side); break;
    case 'cacada': timed('dmg', 0.3, 10, side); timed('spd', 0.3, 10, side); break;
    case 'queimada': for (const e of foes) if (dist2(e.x, e.y, cen[0], cen[1]) < 45 * 45) { hurt(B, e, e.max * 0.3); e.st.burn = 3; e.st.bdmg = e.max * 0.03; } B.fx.push({ k: 'ring', x: cen[0], y: cen[1], t: 0.8, c: '#e8832a' }); break;
    case 'quinta': for (const e of mine) { e.hp *= 1.5; e.max *= 1.5; e.dmg *= 1.5; } break;
    case 'trilha': for (const e of foes) e.st.slow = Math.max(e.st.slow, 8); B.buffs[1 - side].slowX = 0.35; B.buffs[1 - side].slowXT = 8; break;
  }
  B.log.push({ side, fx, t: B.t });
}
function stepBattle(B, dt) {
  if (B.over) return;
  B.t += dt;
  for (const s of [0, 1]) { const b = B.buffs[s]; for (const k of Object.keys(b)) if (k.endsWith('T')) { b[k] -= dt; if (b[k] <= 0) { delete b[k]; delete b[k.slice(0, -1)]; } } }
  // decretos armados e poderes da IA
  if (B.t > 2 && !B.armedDone) { B.armedDone = 1; for (const s of [0, 1]) for (const fx of B.armed[s]) useBattleFx(B, s, fx); }
  for (const s of [0, 1]) { const who = s ? B.att.who : B.def.who; if (who !== 'player' && who !== 'boss' && !B.powerUsed[s] && B.t > 3 && R.rivals[who] && R.rivals[who].cd === 0) { B.powerUsed[s] = true; R.rivals[who].cd = 3; useBattleFx(B, s, LORDS[who].poder.fx); } }
  const ents = B.ents, [cx, cy] = tileCen(CASA);
  for (const e of ents) {
    if (e.hp <= 0) continue;
    const st = e.st; if (e.stealth > 0) e.stealth -= dt;
    if (st.burn > 0) { st.burn -= dt; hurt(B, e, st.bdmg * dt); if (e.hp <= 0) continue; }
    if (st.stun > 0) { st.stun -= dt; continue; }
    if (st.slow > 0) st.slow -= dt; if (st.fear > 0) st.fear -= dt;
    e.rt -= dt;
    if (e.rt <= 0 || !e.tgt || e.tgt.hp <= 0) {
      e.rt = 0.25 + RNG() * 0.1; let best = null, bd = e.side === 0 ? 110 * 110 : 75 * 75;
      if (e.heal && RNG() < 0.5) { for (const o of ents) if (o.side === e.side && o !== e && o.hp > 0 && o.hp < o.max * 0.8) { const d = dist2(e.x, e.y, o.x, o.y); if (d < 40 * 40) { best = o; bd = d; break; } } if (best) { e.tgt = best; e.healing = 1; } }
      if (!best) { e.healing = 0; for (const o of ents) if (o.side !== e.side && o.hp > 0 && !(o.stealth > 0)) { const d = dist2(e.x, e.y, o.x, o.y); if (d < bd) { bd = d; best = o; } } e.tgt = best; }
    }
    let tx, ty, reach;
    if (e.tgt) { tx = e.tgt.x; ty = e.tgt.y; reach = e.rng + (e.tgt.boss ? 8 : 0); }
    else if (e.side === 1 && B.def.farm) { tx = cx; ty = cy; reach = e.rng + 8; }
    else { tx = e.hx; ty = e.hy; reach = 4; }
    const dx = tx - e.x, dy = (ty - e.y) * 2, d = Math.hypot(dx, dy);
    if (d > reach) {
      let sp = e.spd * (1 + (B.buffs[e.side].spd || 0)); if (st.slow > 0) sp *= 0.6; if (B.cucaSide !== undefined && B.cucaSide !== e.side) sp *= 0.8; if (B.buffs[e.side].slowXT) sp *= 1 - B.buffs[e.side].slowX;
      e.x += dx / d * sp * dt; e.y += dy / d * sp * dt * 0.5; e.step += dt * sp * 0.4;
    } else if (st.fear <= 0) {
      e.t -= dt;
      if (e.t <= 0) { e.t = e.cd;
        if (e.healing && e.tgt) { e.tgt.hp = Math.min(e.tgt.max, e.tgt.hp + e.dmg * 1.5); B.fx.push({ k: 'heal', x: e.tgt.x, y: e.tgt.y - 6, t: 0.4 }); }
        else if (e.tgt) { if (e.rng > 12) B.projs.push({ x: e.x, y: e.y - 3, tgt: e.tgt, src: e, kind: e.unit === 'fatuo' ? 'azul' : e.unit === 'beata' ? 'reza' : 'bala', spd: 140, dmg: e.dmg }); else applyHit(B, e, e.tgt, e.dmg); }
        else if (e.side === 1 && B.def.farm) { B.casa -= e.dmg * (1 + (B.buffs[1].dmg || 0)); B.fx.push({ k: 'spark', x: cx + (RNG() - 0.5) * 16, y: cy - 6 - RNG() * 10, t: 0.3 }); }
      }
    }
  }
  // separação leve
  for (let a = 0; a < ents.length; a++) { const e = ents[a]; if (e.hp <= 0) continue; for (let b = a + 1; b < ents.length; b++) { const o = ents[b]; if (o.hp <= 0) continue; const dx = o.x - e.x, dy = o.y - e.y; if (dx > 3 || dx < -3 || dy > 2 || dy < -2) continue; const p = 0.5; if (dx >= 0) { e.x -= p; o.x += p; } else { e.x += p; o.x -= p; } } }
  // torres
  for (const tw of B.towers) { tw.t -= dt; if (tw.t > 0) continue; let best = null, bd = tw.rng * tw.rng; for (const o of ents) if (o.side === 1 && o.hp > 0) { const d = dist2(tw.x, tw.y + 10, o.x, o.y); if (d < bd) { bd = d; best = o; } } if (best) { tw.t = tw.cd; B.projs.push({ x: tw.x, y: tw.y, sx: tw.x, sy: tw.y, tx: best.x, ty: best.y, tgt: best, kind: tw.proj, arc: tw.proj === 'brasa' || tw.proj === 'flecha', dmg: tw.dmg, area: tw.area || 0, burn: tw.burn || 0, fear: tw.fear || 0, t: 0, dur: Math.sqrt(bd) / 110 + 0.15, side: 0 }); } }
  // projéteis
  for (const p of B.projs) {
    if (p.dur) { p.t += dt; const k = Math.min(1, p.t / p.dur); if (p.tgt && p.tgt.hp > 0) { p.tx = p.tgt.x; p.ty = p.tgt.y; } p.x = p.sx + (p.tx - p.sx) * k; p.y = p.sy + (p.ty - p.sy) * k - (p.arc ? Math.sin(k * Math.PI) * 26 : 0);
      if (k >= 1) { p.done = 1; const hit = p.area ? ents.filter(o => o.side === 1 && o.hp > 0 && dist2(o.x, o.y, p.tx, p.ty) < p.area * p.area) : (p.tgt && p.tgt.hp > 0 ? [p.tgt] : []);
        for (const o of hit) { hurt(B, o, p.dmg * (o === p.tgt ? 1 : 0.6)); if (p.burn) { o.st.burn = 3; o.st.bdmg = p.dmg * p.burn / 3; } if (p.fear) o.st.fear = 1.5; }
        if (p.area) B.fx.push({ k: p.kind === 'vento' ? 'swirl' : 'boom', x: p.tx, y: p.ty, t: 0.35 }); } }
    else { const tg = p.tgt; if (!tg || tg.hp <= 0) { p.done = 1; continue; } const dx = tg.x - p.x, dy = tg.y - 3 - p.y, d = Math.hypot(dx, dy); if (d < 4) { p.done = 1; applyHit(B, p.src, tg, p.dmg); } else { p.x += dx / d * p.spd * dt; p.y += dy / d * p.spd * dt; } }
  }
  compact(B.projs, p => !p.done);
  for (const f of B.fx) f.t -= dt; compact(B.fx, f => f.t > 0);
  for (const n of B.nums) { n.t -= dt; n.y -= dt * 12; } compact(B.nums, n => n.t > 0);
  if (B.ents.length > 600) compact(B.ents, e => e.hp > 0);
  // fim
  const liv = [0, 0]; for (const e of ents) if (e.hp > 0) liv[e.side]++;
  if (!liv[1]) B.over = 'def';
  else if (B.def.farm && B.casa <= 0) B.over = 'att';
  else if (!liv[0] && !B.def.farm) B.over = 'att';
  else if (B.t > 50) B.over = (!liv[0] || B.casa < B.casaMax * 0.5) ? 'att' : 'def';
}
const powerLeft = (B, s) => B.ents.reduce((a, e) => a + (e.side === s && e.hp > 0 ? e.hp * e.dmg : 0), 0);
function quickBattle(B) { let n = 0; while (!B.over && n++ < 60 * 70) stepBattle(B, 1 / 30); if (!B.over) B.over = 'def'; return B.over; }

// monta a batalha do ano para o jogador
function yearBattle(kind, rivalId) {
  const y = R.year, pl = { farm: R.farm, lord: R.lord, mul: 1, who: 'player' };
  if (kind === 'boss') return makeBattle(pl, { lord: 'boss', boss: bossOf(y), who: 'boss', mul: 1 }, y);
  const r = R.rivals[rivalId], rv = { farm: r.farm, lord: r.id, mul: rivalMul(y), who: r.id };
  return kind === 'defesa' ? makeBattle(pl, rv, y) : makeBattle(rv, pl, y);
}
// aplica o resultado; devolve resumo
function settleBattle(B, kind, rivalId) {
  const pside = sideOf(B, 'player'), won = (B.over === 'def') === (pside === 0), out = { won, kind, rivalId, casaLost: 0, rap: 0, steal: null, defeated: false };
  R.armed = []; if (rivalId && R.rivals[rivalId]) R.rivals[rivalId].armed = [];
  R.stats.kills += B.kills[pside];
  if (kind === 'defesa' || kind === 'boss') {
    if (won) { out.rap = kind === 'boss' ? 8 : 3; R.stats.wins++; }
    else { const frac = Math.max(0, Math.min(1, powerLeft(B, 1) / Math.max(1, B.init[1]))); out.casaLost = Math.round((kind === 'boss' ? 22 : 10) + (kind === 'boss' ? 30 : 22) * frac + (B.casa <= 0 ? 6 : 0)); R.casa -= out.casaLost; R.stats.losses++; }
  } else if (kind === 'ataque') {
    if (won) { const r = R.rivals[rivalId]; r.lives--; out.rap = 5; R.stats.wins++;
      out.steal = shuffle(LORDS[rivalId].cartas.slice()).slice(0, 3);
      if (r.lives <= 0) { out.defeated = true; R.stats.defeated.push(rivalId); } }
    else R.stats.losses++;
  }
  R.rap += out.rap;
  return out;
}
