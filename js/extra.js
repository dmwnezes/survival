'use strict';
/* =========================================================
   Lógica do conteúdo novo. Carregado por último: o núcleo
   chama estas funções pelas tabelas de ganchos (conteudo.js).
   ========================================================= */
const ewaves = [], meteors = [];
let EXW = { forests: [], corn: [], marks: [], npcs: [] }, treeGrid = new Map(), roadSm = [], roadGrid = new Map(), pebGrid = new Map(), cornImg = [];
EN.morcego.fly = 1; EN.vagalume.fly = 1; EN.muricoca.fly = 1; // voadores passam por cima do rio e dos espinhos
EN.ilusao = { hp: 30, spd: 52, dmg: 12, xp: 0, r: 10, spr: 'anhanga', scale: 0.9, col: '#e8eeff' };
const onScr2 = (x, y, m) => Math.abs(x - player.x) < VW / 2 + m && Math.abs(y - player.y) < VH / 2 + m; // não depende da câmera (vale também na simulação)
const tdm = () => (1 + Math.min(G.time, 900) / 480 + Math.max(0, G.time - 900) / 900) * (G.nm ? 1.4 : 1);
const wsFor = id => { const w = flatW().find(x => x.id === id); if (!w) return null; const s = wstat(w.id, w.lvl, w.ev); if (w.fzB) { s.dmg *= 1.35; if (s.cd) s.cd *= 0.85; } return [w, s]; };

/* ---------------- armas novas: status ---------------- */
WB2.pilao = (l, ev) => { const s = { dmg: 18 + 5.5 * (l - 1), cd: 3.6 - 0.12 * l, n: 1 + (l >= 5) + (l >= 8), rad: 26 + 1.5 * l, root: 0.8, area: 1 }; if (ev) { s.dmg *= 1.1; s.rad *= 1.25; s.wave = 1; } return s; };
WB2.boi = (l, ev) => { const s = { dmg: 22 + 7 * (l - 1), cd: 4 - 0.15 * l, n: 1 + (l >= 4) + (l >= 7), len: 220, spd: 260, area: 1 }; if (ev) { s.dmg *= 1.25; s.len = 320; s.big = 1; } return s; };
WB2.sal = (l, ev) => { const s = { dmg: 14 + 5 * (l - 1), cd: 1.3 - 0.05 * l, n: 6 + Math.floor(l / 3), spd: 260, life: 0.26, salt: 1.25, area: 1 }; if (ev) { s.n += 3; s.life = 0.34; s.salt = 1.35; s.dmg *= 1.2; } return s; };
WB2.arapuca = (l, ev) => { const s = { dmg: 45 + 13 * (l - 1), cd: 2 - 0.08 * l, max: 3 + Math.floor(l / 3), rad: 22, root: 1.5, area: 1 }; if (ev) { s.rad *= 1.5; s.root = 2.5; s.dmg *= 1.3; s.sand = 1; s.max += 2; } return s; };
WB2.marimbondo = (l, ev) => { const s = { dmg: 2.2 + 0.6 * (l - 1), cd: 2.8 - 0.1 * l, n: 1 + Math.floor(l / 4), life: 4, r: 16, area: 1 }; if (ev) { s.life = 6; s.r *= 1.35; s.dmg *= 1.3; s.spread = 1; } return s; };
WB2.foice = (l, ev) => { const s = { dmg: 20 + 6 * (l - 1), cd: 1.8 - 0.07 * l, rad: 52 + 2 * l, arc: 1.6, exec: 0.12, area: 1 }; if (ev) { s.arc = 3.15; s.exec = 0.2; s.dmg *= 1.3; } return s; };
WB2.trovoada = (l, ev) => { const s = { dmg: 24 + 8 * (l - 1), cd: 3.4 - 0.13 * l, n: 2 + Math.floor(l / 2), rad: 14, area: 1 }; if (ev) { s.n += 2; s.rad = 24; s.dmg *= 1.1; } return s; };
WB2.piao = (l, ev) => { const s = { dmg: 3 + 1 * (l - 1), cd: 3.6 - 0.1 * l, n: 1 + Math.floor(l / 4), life: 4, pull: 40, r: 14, area: 1 }; if (ev) { s.life = 5.5; s.pull = 60; s.dmg *= 1.1; } return s; };
WB2.pipa = (l, ev) => { const s = { dmg: 7 + 2.8 * (l - 1), n: 1 + Math.floor(l / 5), len: 80, tick: 0.35, area: 1 }; if (ev) { s.len = 115; s.n += 1; s.dmg *= 1.5; } return s; };
WB2.tatu = (l, ev) => { const s = { dmg: 20 + 6 * (l - 1), n: 2 + Math.floor(l / 3), regen: 6 - 0.3 * l, area: 1 }; if (ev) { s.n += 2; s.regen *= 0.6; s.boom = 1; } return s; };
WB2.bola = (l, ev) => { const s = { dmg: 11 + 4 * (l - 1), cd: 3 - 0.1 * l, n: 1 + Math.floor(l / 3), spd: 170, life: 6, r: 4, area: 1 }; if (ev) { s.spd = 220; s.r = 6; s.n += 1; s.dmg *= 1.3; } return s; };
WB2.espelho = (l, ev) => { const s = { dmg: 5 + 1.7 * (l - 1), n: 1 + Math.floor(l / 5), len: 90 + 4 * l, tick: 0.3, spin: 1.6, area: 1 }; if (ev) { s.n += 1; s.len *= 1.3; s.dmg *= 1.4; } return s; };
WB2.pifano = (l, ev) => { const s = { dmg: 12 + 4.5 * (l - 1), cd: 1 - 0.035 * l, n: 3 + Math.floor(l / 3), spd: 150, pierce: 1, area: 1 }; if (ev) { s.n += 2; s.pierce = 3; } return s; };

/* ---------------- armas novas: disparo ---------------- */
function aimAt(R) { const t = nearest(player.x, player.y, R); return t ? Math.atan2(t.y - player.y, t.x - player.x) : Math.atan2(player.fy, player.fx); }
FIRE2.pilao = (w, s) => { for (let i = 0; i < s.n; i++) { const t = randomNear(player.x, player.y, 170); let x, y; if (t) { x = t.x; y = t.y; } else { const a = Math.random() * 6.283; x = player.x + Math.cos(a) * 70; y = player.y + Math.sin(a) * 50; } projs.push({ k: 'pilao', x, y, t: 0, T: 0.55, delay: i * 0.18, dmg: s.dmg, rad: s.rad, root: s.root, wave: s.wave, life: 1 }); } };
FIRE2.boi = (w, s) => { const base = aimAt(200); for (let i = 0; i < s.n; i++) { const a = base + (i - (s.n - 1) / 2) * 0.5; projs.push({ k: 'boi', x: player.x, y: player.y, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: s.len * s.area / s.spd, hit: new Set(), dmg: s.dmg, r: (s.big ? 13 : 9) * Math.sqrt(s.area), sc: s.big ? 2.4 : 1.8 }); } sfx('aboio'); };
FIRE2.sal = (w, s) => { const base = aimAt(130); for (let i = 0; i < s.n; i++) { const a = base + rand(-0.38, 0.38), sp = s.spd * rand(0.85, 1.1); projs.push({ k: 'chumbo', x: player.x, y: player.y - 3, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: s.life * s.area, dmg: s.dmg, salt: s.salt }); } G.shake = Math.max(G.shake, 1.5); sfx('boom'); };
FIRE2.arapuca = (w, s) => {
  if (projs.filter(p => p.k === 'arapuca').length >= s.max) return;
  const a = aimAt(220) + rand(-0.6, 0.6), r = rand(55, 105); projs.push({ k: 'arapuca', x: clamp(player.x + Math.cos(a) * r, 10, MAPW - 10), y: clamp(player.y + Math.sin(a) * r, 10, MAPH - 10), life: 25, arm: 0.4, dmg: s.dmg, rad: s.rad, root: s.root, sand: s.sand });
};
FIRE2.marimbondo = (w, s) => { for (let i = 0; i < s.n; i++) { const t = randomNear(player.x, player.y, 190); if (!t) return; projs.push({ k: 'enxame', x: player.x, y: player.y - 4, tgt: t, life: s.life, dmg: s.dmg, r: s.r * s.area, tk: 0, gen: 0, spread: s.spread }); } };
FIRE2.foice = (w, s) => {
  const fa = aimAt(s.rad * s.area + 20), R = s.rad * s.area; query(player.x, player.y, R + 12, Q);
  for (const e of Q) { if (!e.alive || e.d.prop) continue; const ex = e.x - player.x, ey = e.y - player.y, d = Math.hypot(ex, ey) || 1; if (d > R + e.r) continue; let da = Math.atan2(ey, ex) - fa; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) > s.arc) continue;
    const t = e.parent || e; if (!t.d.boss && !t.elite && t.hp - s.dmg <= t.maxHp * s.exec) { burst(e.x, e.y - 3, '#c9c9d6', 6); hurt(e, t.hp + 1, ex / d * 60, ey / d * 60, 'foice'); } else hurt(e, s.dmg, ex / d * 60, ey / d * 60, 'foice'); }
  fx.push({ k: 'foice', a: fa, r: R, arc: s.arc, life: 0.25, max: 0.25 }); sfx('swing');
};
FIRE2.trovoada = (w, s) => {
  const c = enemies.filter(e => e.alive && !e.d.prop && onScr2(e.x, e.y, 6));
  for (let i = 0; i < s.n && c.length; i++) { const e = c.splice((Math.random() * c.length) | 0, 1)[0], R = s.rad * s.area; query(e.x, e.y, R + 14, Q); for (const o of Q) if (o.alive && dist2(o.x, o.y, e.x, e.y) < (R + o.r) ** 2) hurt(o, s.dmg, undefined, undefined, 'trovoada'); fx.push({ k: 'raio', x: e.x, y: e.y, life: 0.25, max: 0.25, sd: Math.random() * 99 }); }
  G.flash = Math.max(G.flash || 0, 0.12); sfx('zap');
};
FIRE2.piao = (w, s) => { for (let i = 0; i < s.n; i++) { const t = randomNear(player.x, player.y, 150), a = Math.random() * 6.283; projs.push({ k: 'piao', x: player.x, y: player.y, tx: t ? t.x : player.x + Math.cos(a) * 70, ty: t ? t.y : player.y + Math.sin(a) * 50, wt: 0.6, life: s.life, dmg: s.dmg, pull: s.pull * s.area, r: s.r * s.area, tk: 0 }); } sfx('swing'); };
FIRE2.bola = (w, s) => { let have = projs.filter(p => p.k === 'bola').length; for (; have < s.n; have++) { const a = Math.random() * 6.283; projs.push({ k: 'bola', x: player.x, y: player.y, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: s.life, dmg: s.dmg, r: s.r * Math.sqrt(s.area), hit: new Map() }); } };
FIRE2.pifano = (w, s) => { for (let i = 0; i < s.n; i++) { const a = Math.random() * 6.283; projs.push({ k: 'nota', x: player.x, y: player.y - 4, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, spd: s.spd, life: 3, dmg: s.dmg, pierce: s.pierce, hit: new Set(), tgt: null }); } sfx('pick'); };

/* ---------------- armas contínuas ---------------- */
function segDist2(px, py, ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / L, 0, 1), x = ax + dx * t - px, y = ay + dy * t - py; return x * x + y * y; }
function beamHit(w, ax, ay, bx, by, dmg, tick, src, kx, ky) {
  query((ax + bx) / 2, (ay + by) / 2, Math.hypot(bx - ax, by - ay) / 2 + 12, Q);
  for (const e of Q) { if (!e.alive || e.d.prop) continue; if (segDist2(e.x, e.y, ax, ay, bx, by) < (e.r + 2) ** 2 && (w.hit.get(e) || -9) < G.time - tick) { w.hit.set(e, G.time); hurt(e, dmg, kx, ky, src); } }
}
UPD2.pipa = (w, s, dt) => {
  w.t = (w.t || 0) + dt; w.hit = w.hit || new Map(); w.kites = w.kites || []; const L = s.len * s.area;
  for (let i = 0; i < s.n; i++) { const a = w.t * 0.9 + i * 6.283 / s.n, k = 0.75 + 0.25 * Math.sin(w.t * 1.7 + i), x = player.x + Math.cos(a) * L * k, y = player.y + Math.sin(a) * L * 0.7 * k - 18;
    w.kites[i] = { x, y }; beamHit(w, player.x, player.y - 4, x, y, s.dmg, s.tick, 'pipa'); query(x, y, 16, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(x, y, e.x, e.y) < (e.r + 5) ** 2 && (w.hit.get(e) || -9) < G.time - s.tick) { w.hit.set(e, G.time); hurt(e, s.dmg * 2, 0, 0, 'pipa'); } }
  w.kites.length = s.n; if (w.hit.size > 600) w.hit.clear();
};
UPD2.espelho = (w, s, dt) => {
  w.ang = ((w.ang || 0) + s.spin * dt) % 6.283; w.hit = w.hit || new Map(); const L = s.len * s.area;
  for (let i = 0; i < s.n; i++) { const a = w.ang + i * 6.283 / s.n, dx = Math.cos(a), dy = Math.sin(a); beamHit(w, player.x, player.y - 3, player.x + dx * L, player.y - 3 + dy * L, s.dmg, s.tick, 'espelho', dx * 20, dy * 20); }
  if (w.hit.size > 600) w.hit.clear();
};
UPD2.tatu = (w, s, dt) => {
  if (w.plates == null) w.plates = s.n; if (w.plates > s.n) w.plates = s.n;
  if (w.plates < s.n) { w.rg = (w.rg || 0) + dt; if (w.rg >= s.regen) { w.rg = 0; w.plates++; } }
  w.ang = ((w.ang || 0) + 3 * dt) % 6.283; w.hit = w.hit || new Map();
  for (let i = 0; i < w.plates; i++) { const a = w.ang + i * 6.283 / w.plates, x = player.x + Math.cos(a) * 15, y = player.y + Math.sin(a) * 12; query(x, y, 14, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(x, y, e.x, e.y) < (e.r + 4) ** 2 && (w.hit.get(e) || -9) < G.time - 0.5) { w.hit.set(e, G.time); hurt(e, s.dmg * 0.3, Math.cos(a) * 80, Math.sin(a) * 80, 'tatu'); } }
  if (w.hit.size > 400) w.hit.clear();
};
EXH.block = (dmg, src) => {
  const ws = wsFor('tatu'); if (!ws || !(ws[0].plates > 0)) return false;
  const [w, s] = ws; w.plates--; w.rg = 0; player.inv = Math.max(player.inv, 0.35); burst(player.x, player.y, '#a4a4ba', 8); sfx('hit');
  if (src && src.alive) { const d = Math.hypot(src.x - player.x, src.y - player.y) || 1; hurt(src, s.dmg, (src.x - player.x) / d * 220, (src.y - player.y) / d * 220, 'tatu'); }
  if (s.boom) explode(player.x, player.y, 40 * s.area, s.dmg * 0.8, 'tatu');
  return true;
};

/* ---------------- projéteis novos ---------------- */
PROJ2.pilao = (p, dt) => {
  if (p.delay > 0) { p.delay -= dt; return; } p.t += dt; if (p.t < p.T) return;
  query(p.x, p.y, p.rad + 16, Q); for (const e of Q) { if (!e.alive) continue; const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1; if (d < p.rad + e.r) { const t = e.parent || e; t.root = Math.max(t.root, p.root); hurt(e, p.dmg, dx / d * 120, dy / d * 120, 'pilao'); } }
  fx.push({ k: 'boom', x: p.x, y: p.y, r: p.rad, life: 0.3, max: 0.3 }); burst(p.x, p.y, '#b8a27a', 16);
  if (p.wave) waves.push({ x: p.x, y: p.y, r: 0, max: p.rad * 2.4, dmg: p.dmg * 0.4, hit: new Set(), src: 'pilao', col: '216,170,110' });
  G.shake = Math.max(G.shake, 3); sfx('boom'); p.life = 0;
};
PROJ2.boi = (p, dt) => {
  p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, p.r + 16, Q);
  for (const e of Q) if (e.alive && !p.hit.has(e) && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) { p.hit.add(e); const sd = Math.sign((e.x - p.x) * p.vy - (e.y - p.y) * p.vx) || 1; hurt(e, p.dmg, -p.vy * 0.5 * sd, p.vx * 0.5 * sd, 'boi'); }
  if (Math.random() < 0.6) part(p.x + rand(-6, 6), p.y + rand(-6, 6), rand(-20, 20), rand(-30, -5), 0.5, ['#c8463c', '#f2c14e', '#3b6ea5', '#86d46f'][(Math.random() * 4) | 0], 1);
};
PROJ2.chumbo = (p, dt) => {
  p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, 14, Q);
  for (const e of Q) if (e.alive && dist2(p.x, p.y, e.x, e.y) < (e.r + 2) ** 2) { const t = e.parent || e; t.saltT = G.time + 4; t.saltK = p.salt; hurt(e, p.dmg, p.vx * 0.5, p.vy * 0.5, 'sal'); p.life = 0; break; }
};
PROJ2.arapuca = (p, dt) => {
  p.arm -= dt; p.life -= dt; if (p.arm > 0) return; query(p.x, p.y, 20, Q);
  if (!Q.some(e => e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (e.r + 8) ** 2)) return;
  query(p.x, p.y, p.rad + 16, Q); for (const e of Q) if (e.alive && dist2(p.x, p.y, e.x, e.y) < (p.rad + e.r) ** 2) { (e.parent || e).root = Math.max((e.parent || e).root, p.root); hurt(e, p.dmg, undefined, undefined, 'arapuca'); }
  if (p.sand) muds.push({ x: p.x, y: p.y, r: p.rad * 1.4, life: 3 });
  burst(p.x, p.y, '#8a5a2b', 12); fx.push({ k: 'net', x: p.x, y: p.y, r: p.rad, life: Math.min(1, p.root), max: Math.min(1, p.root) }); sfx('swing'); p.life = 0;
};
PROJ2.enxame = (p, dt) => {
  p.life -= dt; if (!p.tgt || !p.tgt.alive) p.tgt = nearest(p.x, p.y, 120);
  if (p.tgt) { const dx = p.tgt.x - p.x, dy = p.tgt.y - p.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 95 * dt); p.x += dx / d * st; p.y += dy / d * st; }
  p.tk -= dt; if (p.tk > 0) return; p.tk = 0.3; query(p.x, p.y, p.r + 14, Q);
  for (const e of Q) if (e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) { e.beeT = G.time + 0.6; e.beeP = p; hurt(e, p.dmg, undefined, undefined, 'marimbondo'); }
};
PROJ2.piao = (p, dt) => {
  p.life -= dt; p.wt -= dt;
  if (p.wt <= 0) { p.wt = 0.6; const t = nearest(p.x, p.y, 120); p.tx = t ? t.x + rand(-20, 20) : p.x + rand(-40, 40); p.ty = t ? t.y + rand(-20, 20) : p.y + rand(-30, 30); }
  const dx = p.tx - p.x, dy = p.ty - p.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, 70 * dt); p.x += dx / d * st; p.y += dy / d * st;
  query(p.x, p.y, p.pull + 10, Q);
  for (const e of Q) { if (!e.alive || e.d.prop || e.d.boss || e.d.seg) continue; const ex = p.x - e.x, ey = p.y - e.y, dd = Math.hypot(ex, ey) || 1; if (dd < p.pull && dd > 4) { e.x += ex / dd * 45 * dt; e.y += ey / dd * 45 * dt; } }
  p.tk -= dt; if (p.tk <= 0) { p.tk = 0.3; for (const e of Q) if (e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) hurt(e, p.dmg, undefined, undefined, 'piao'); }
};
PROJ2.bola = (p, dt) => {
  p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;
  const L = player.x - VW / 2 + 4, Rr = player.x + VW / 2 - 4, T = player.y - VH / 2 + 4, B = player.y + VH / 2 - 4;
  if (p.x < L) { p.x = L; p.vx = Math.abs(p.vx); } if (p.x > Rr) { p.x = Rr; p.vx = -Math.abs(p.vx); } if (p.y < T) { p.y = T; p.vy = Math.abs(p.vy); } if (p.y > B) { p.y = B; p.vy = -Math.abs(p.vy); }
  query(p.x, p.y, p.r + 14, Q); for (const e of Q) if (e.alive && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2 && (p.hit.get(e) || -9) < G.time - 0.4) { p.hit.set(e, G.time); hurt(e, p.dmg, p.vx * 0.2, p.vy * 0.2, 'bola'); }
};
PROJ2.nota = (p, dt) => {
  p.life -= dt; if (!p.tgt || !p.tgt.alive || p.hit.has(p.tgt)) { p.tgt = null; query(p.x, p.y, 160, Q); let bd = 1e9; for (const e of Q) if (e.alive && !e.d.prop && !p.hit.has(e)) { const d = dist2(p.x, p.y, e.x, e.y); if (d < bd) { bd = d; p.tgt = e; } } }
  if (p.tgt) { const want = Math.atan2(p.tgt.y - p.y, p.tgt.x - p.x), cur = Math.atan2(p.vy, p.vx); let da = want - cur; da = Math.atan2(Math.sin(da), Math.cos(da)); const a = cur + clamp(da, -5 * dt, 5 * dt); p.vx = Math.cos(a) * p.spd; p.vy = Math.sin(a) * p.spd; }
  p.x += p.vx * dt; p.y += p.vy * dt; query(p.x, p.y, 14, Q);
  for (const e of Q) if (e.alive && !p.hit.has(e) && dist2(p.x, p.y, e.x, e.y) < (e.r + 3) ** 2) { p.hit.add(e); hurt(e, p.dmg, p.vx * 0.15, p.vy * 0.15, 'pifano'); if (--p.pierce <= 0) { p.life = 0; break; } }
};
// projéteis inimigos: sempre vermelhos com contorno escuro
PROJ2.ebala = (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (dist2(p.x, p.y, player.x, player.y) < (player.r + 3) ** 2) { playerHit(p.dmg); p.life = 0; } };
PROJ2.pedrao = (p, dt) => {
  p.t += dt; const q = Math.min(1, p.t / p.T); p.x = p.sx + (p.tx - p.sx) * q; p.y = p.sy + (p.ty - p.sy) * q - Math.sin(Math.PI * q) * 60;
  if (q >= 1) { if (dist2(p.tx, p.ty, player.x, player.y) < 22 * 22) playerHit(p.dmg); burst(p.tx, p.ty, '#8a7a6a', 14); G.shake = Math.max(G.shake, 2); sfx('boom'); p.life = 0; }
};

/* ---------------- desenho dos projéteis e aliados ---------------- */
DPROJ2.pilao = p => { if (p.delay > 0) return; const k = Math.min(1, p.t / p.T); ctx.strokeStyle = `rgba(242,193,78,${0.3 + 0.5 * k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rad, p.rad * 0.6, 0, 0, 6.283); ctx.stroke(); drawSpr(S.i_pilao, p.x, p.y - (1 - k) * 110 - 6, { sc: 2.5 }); };
DPROJ2.boi = p => { shadow(p.x, p.y + 6 * p.sc / 1.8, 8 * p.sc); drawSpr(S.i_boi, p.x, p.y - Math.abs(Math.sin(p.life * 18)) * 2, { sc: p.sc, flip: p.vx < 0 }); };
DPROJ2.chumbo = p => { ctx.fillStyle = '#14111f'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3); ctx.fillStyle = '#f0ead6'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); };
DPROJ2.arapuca = p => { ctx.globalAlpha = p.arm > 0 ? 0.5 : 1; drawSpr(S.i_arapuca, p.x, p.y, { sc: 1.4 }); ctx.globalAlpha = 1; };
DPROJ2.enxame = p => { for (let i = 0; i < 7; i++) { const a = G.time * 9 + i * 0.9, r = p.r * (0.3 + 0.4 * Math.abs(Math.sin(G.time * 3 + i))); ctx.fillStyle = i % 2 ? '#14111f' : '#f2c14e'; ctx.fillRect(Math.round(p.x + Math.cos(a) * r), Math.round(p.y + Math.sin(a * 1.3) * r * 0.6), 2, 1); } };
DPROJ2.piao = p => { ctx.strokeStyle = 'rgba(200,180,140,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.x, p.y + 3, p.r, p.r * 0.45, 0, G.time * 9, G.time * 9 + 4); ctx.stroke(); drawSpr(S.i_piao, p.x, p.y, { sc: 1.6, flip: Math.floor(G.time * 20) % 2 === 0 }); };
DPROJ2.bola = p => drawSpr(S.i_bola, p.x, p.y, { sc: p.r / 4 });
DPROJ2.nota = p => { const x = Math.round(p.x), y = Math.round(p.y); ctx.fillStyle = '#14111f'; ctx.fillRect(x - 2, y - 1, 4, 3); ctx.fillRect(x + 1, y - 5, 2, 5); ctx.fillStyle = '#f2c14e'; ctx.fillRect(x - 1, y, 2, 1); ctx.fillRect(x + 1, y - 4, 1, 4); ctx.fillRect(x + 2, y - 4, 1, 1); };
DPROJ2.ebala = p => { const x = Math.round(p.x), y = Math.round(p.y); circle(x, y, 3.5, '#14111f'); circle(x, y, 2.5, '#ff3b2e'); ctx.fillStyle = '#ffd27a'; ctx.fillRect(x - 1, y - 1, 1, 1); };
DPROJ2.pedrao = p => { const k = Math.min(1, p.t / p.T); ctx.strokeStyle = `rgba(255,59,46,${0.4 + 0.5 * k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(p.tx, p.ty, 20, 12, 0, 0, 6.283); ctx.stroke(); ctx.fillStyle = `rgba(255,59,46,${0.15 * k})`; ctx.fill(); drawSpr(S.pedra, p.x, p.y, { sc: 2 }); };
EXH.drawAllies = () => {
  if (G.dawn) return;
  for (const w of flatW()) {
    if (w.id === 'pipa' && w.kites) for (const k of w.kites) { ctx.strokeStyle = 'rgba(240,234,214,0.55)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(player.x, player.y - 4); ctx.quadraticCurveTo((player.x + k.x) / 2, (player.y + k.y) / 2 + 10, k.x, k.y); ctx.stroke(); drawSpr(S.i_pipa, k.x, k.y, { sc: 1.3 }); }
    if (w.id === 'tatu' && w.plates > 0) for (let i = 0; i < w.plates; i++) { const a = (w.ang || 0) + i * 6.283 / w.plates; drawSpr(S.i_tatu, player.x + Math.cos(a) * 15, player.y + Math.sin(a) * 12, { sc: 0.9 }); }
  }
  if (G.stage) { const st = G.stage; drawSpr(S.sanfoneiro, st.x, st.y - 4, { flip: Math.sin(G.time * 4) > 0 }); }
};
EXH.drawFx = () => {
  for (const f of fx) if (f.k === 'foice') { const a = f.life / f.max; ctx.save(); ctx.translate(Math.round(player.x), Math.round(player.y)); ctx.rotate(f.a); ctx.globalAlpha = a; ctx.strokeStyle = '#c9c9d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, f.r * 0.8, -f.arc * (1.2 - a * 0.2), f.arc * (1.2 - a * 0.2)); ctx.stroke(); ctx.strokeStyle = '#8160a8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 0, f.r * 0.65, -f.arc, f.arc); ctx.stroke(); ctx.restore(); }
  for (const f of fx) if (f.k === 'cura') { const q = 1 - f.life / f.max; ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#9fe07a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r * q, f.r * q * 0.6, 0, 0, 6.283); ctx.stroke(); }
  ctx.globalAlpha = 1;
};
EXH.drawGlow = () => {
  if (!G.dawn) for (const w of flatW()) if (w.id === 'espelho' && w.ang != null) { const s = wstat('espelho', w.lvl, w.ev), L = s.len * s.area; for (let i = 0; i < s.n; i++) { const a = w.ang + i * 6.283 / s.n, x2 = player.x + Math.cos(a) * L, y2 = player.y - 3 + Math.sin(a) * L; ctx.strokeStyle = 'rgba(160,200,255,0.22)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(player.x, player.y - 3); ctx.lineTo(x2, y2); ctx.stroke(); ctx.strokeStyle = 'rgba(230,240,255,0.7)'; ctx.lineWidth = 1; ctx.stroke(); } }
  for (const f of fx) if (f.k === 'raio') { const a = f.life / f.max; ctx.strokeStyle = `rgba(220,230,255,${a})`; ctx.lineWidth = 2; ctx.beginPath(); let x = f.x + 30, y = f.y - 150; ctx.moveTo(x, y); for (let i = 1; i <= 6; i++) { x = f.x + (30 * (6 - i) / 6) + Math.sin(f.sd + i * 2.7) * 8; y = f.y - 150 + i * 25; ctx.lineTo(x, y); } ctx.stroke(); circle(f.x, f.y, 14 * a, `rgba(200,220,255,${0.5 * a})`); }
  for (const p of projs) if (p.k === 'ebala') circle(p.x, p.y, 6, 'rgba(255,60,40,0.3)');
  for (const m of meteors) { const k = Math.min(1, m.t / 1.2), sx = m.x + 90 * (1 - k), sy = m.y - 160 * (1 - k); ctx.strokeStyle = 'rgba(255,200,120,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 18, sy - 32); ctx.stroke(); circle(sx, sy, 4, 'rgba(255,220,150,0.8)'); }
  for (const e of enemies) if (e.type === 'beata' && onScreen(e.x, e.y, 20)) circle(e.x + 3, e.y - 5, 5, 'rgba(255,220,120,0.35)');
  for (const e of enemies) if (e.type === 'rezadeira' && onScreen(e.x, e.y, 20)) circle(e.x, e.y, 9, 'rgba(160,230,120,0.15)');
  if (G.stage) { const st = G.stage; circle(st.x, st.y + 6, 46, `rgba(242,193,78,${0.08 + 0.04 * Math.sin(G.time * 6)})`); }
};
EXH.lightHoles = hole => {
  for (const e of enemies) if (e.type === 'beata' && e.alive) hole(e.x + 3, e.y - 5, 20, 0.5);
  for (const m of meteors) hole(m.x, m.y, 30, 0.4 * Math.min(1, m.t));
  for (const k of EXW.marks) if (k.k === 'igreja') hole(k.x, k.y - 6, 60, 0.45); else if (k.k === 'bodega') hole(k.x, k.y, 50, k.cd > 0 ? 0.25 : 0.55);
  if (G.stage) hole(G.stage.x, G.stage.y, 70, 0.6);
  for (const f of fx) if (f.k === 'raio') hole(f.x, f.y, 50, 0.8 * f.life / f.max);
};

/* ---------------- itens novos ---------------- */
EXH.hurtMul = (t, dmg) => {
  if (t.saltT > G.time) dmg *= t.saltK || 1.25;
  const ch = player.pass.chocalho; if (ch && (t.elite || t.d.boss)) dmg *= 1 + 0.12 * ch;
  return dmg;
};
EXH.critChance = () => 0.04 * (player.pass.rape || 0);
EXH.critMul = () => 2 + 0.4 * (player.pass.lenco || 0);
EXH.onHit = (dmg, src) => { // depois do dano ao jogador
  const pv = player.pass;
  if (pv.garrafa) { muds.push({ x: player.x, y: player.y, r: 30 + 10 * pv.garrafa, life: 2.5 }); burst(player.x, player.y, '#d9b24a', 8); }
  if (pv.salgrosso && src && src.alive && !src.d.prop) { const d = Math.hypot(src.x - player.x, src.y - player.y) || 1; hurt(src, 10 * pv.salgrosso * player.st.dmg, (src.x - player.x) / d * 200, (src.y - player.y) / d * 200); }
  if (pv.patua && player.hp > 0 && player.hp < player.maxHp * 0.3 && (G.patuaT || 0) <= G.time) { G.patuaT = G.time + 40 - 6 * pv.patua; player.inv = Math.max(player.inv, 2); toast('O patuá protegeu você!'); burst(player.x, player.y, '#c8463c', 16, true); }
};
EXH.dmgIn = (dmg, src) => src && player.char === 'vaqueiro' ? dmg * 0.9 : dmg;
EXH.xpMul = () => (1 + 0.15 * (player.pass.olhogordo || 0)) * (1 + 0.08 * (player.pass.cacua || 0)) * (G.moon > 0 ? 1.5 : 1);
EXH.foodMul = () => (1 + 0.3 * (player.pass.jandaira || 0)) * (player.char === 'benzedeira' ? 1.5 : 1);
EXH.onLevel = () => {
  if (player.pass.jandaira) player.hp = Math.min(player.maxHp, player.hp + 5);
  if (player.char === 'forrozeira') waves.push({ x: player.x, y: player.y, r: 0, max: 80, dmg: 8 * player.st.dmg, hit: new Set(), src: null, col: '232,106,154' });
};
EXH.onKill = e => {
  const pv = player.pass;
  if (pv.espora) { G.esp = Math.min(3.75 * pv.espora, (G.esp || 0) + 1); G.espT = 3; }
  if (pv.moeda && G.kills % 30 === 0) G.rap += pv.moeda;
  if (e.beeT > G.time && e.beeP && projs.filter(p => p.k === 'enxame').length < 14) { const b = e.beeP; if (b.spread || (b.gen < 1 && Math.random() < 0.5)) projs.push({ k: 'enxame', x: e.x, y: e.y, tgt: null, life: 2.5, dmg: b.dmg, r: b.r * 0.85, tk: 0, gen: b.gen + 1, spread: b.spread && b.gen < 2 }); }
};

/* ---------------- inimigos novos ---------------- */
EB2.coruja = (e, dt, dx, dy, d) => {
  e.cc -= dt;
  if (e.ch > 0) { e.ch -= dt; return [e.cdx * 170, e.cdy * 170]; }
  if (e.cc <= 0 && d < 110) { e.ch = 0.5; e.cdx = dx / d; e.cdy = dy / d; e.cc = rand(2.5, 4); }
  return [dx / d * e.spd + Math.cos(e.t * 4) * 18, dy / d * e.spd + Math.sin(e.t * 3) * 18];
};
EB2.tatu = (e, dt, dx, dy, d) => {
  e.cc -= dt;
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { e.ch = 0.3; e.cdx = dx / d; e.cdy = dy / d; } return [0, 0]; }
  if (e.ch > 0) { e.ch -= dt; return [e.cdx * 150, e.cdy * 150]; }
  if (e.hide) { if (Math.random() < 0.5) part(e.x + rand(-3, 3), e.y + 2, rand(-10, 10), rand(-14, -4), 0.35, '#7a6448', 1); if (d < 26 || e.cc <= 0) { e.hide = false; e.wind = 0.35; e.cc = rand(3, 5); burst(e.x, e.y, '#7a6448', 8); } return [dx / d * 85, dy / d * 85]; }
  if (e.cc <= 0 && d > 60) { e.hide = true; e.cc = 2.5; burst(e.x, e.y, '#7a6448', 8); }
  return null;
};
EB2.rezadeira = (e, dt, dx, dy, d) => {
  e.cc -= dt;
  if (e.cc <= 0) { e.cc = 3; query(e.x, e.y, 76, Q); let n = 0; for (const o of Q) if (o !== e && o.alive && !o.d.boss && !o.d.prop && !o.d.seg && o.hp < o.maxHp && dist2(o.x, o.y, e.x, e.y) < 70 * 70) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * 0.12); n++; } if (n) fx.push({ k: 'cura', x: e.x, y: e.y, r: 70, life: 0.5, max: 0.5 }); }
  if (d < 100) return [-dx / d * e.spd, -dy / d * e.spd];
  if (d < 140) return [Math.cos(e.t) * 10, Math.sin(e.t) * 10];
  return null;
};
EB2.beata = (e, dt) => {
  if (!(e.orbit > 0)) return null;
  e.orbit -= dt; e.oa += 0.55 * dt; e.oR = Math.max(75, e.oR - 6 * dt);
  const tx = player.x + Math.cos(e.oa) * e.oR, ty = player.y + Math.sin(e.oa) * e.oR * 0.8, ddx = tx - e.x, ddy = ty - e.y, dd = Math.hypot(ddx, ddy) || 1;
  return [ddx / dd * Math.min(130, dd * 4), ddy / dd * Math.min(130, dd * 4)];
};
EB2.lobinho = (e, dt, dx, dy, d) => [dx / d * e.spd + Math.sin(e.t * 5) * 10, dy / d * e.spd + Math.cos(e.t * 5) * 10];
EB2.ilusao = (e, dt) => { e.life = (e.life == null ? 8 : e.life) - dt; if (e.life <= 0) { e.alive = false; burst(e.x, e.y, '#e8eeff', 10, true); } return null; };
EXH.wander = (e, dt) => { // bodes e jumentos andam à toa
  e.cc -= dt; if (e.cc <= 0) { e.cc = rand(1.5, 3.5); const a = Math.random() * 6.283, s = Math.random() < 0.4 ? 0 : rand(10, 22); e.vx = Math.cos(a) * s; e.vy = Math.sin(a) * s; }
  if (dist2(e.x, e.y, player.x, player.y) < 40 * 40) { const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy) || 1; e.vx = dx / d * 40; e.vy = dy / d * 40; }
  e.x = clamp(e.x + (e.vx || 0) * dt, 10, MAPW - 10); e.y = clamp(e.y + (e.vy || 0) * dt, 10, MAPH - 10); e.t += dt;
};

/* ---------------- chefões novos ---------------- */
function bossShoot(e, n, sp, off) { const dm = 6 * (1 + G.time / 600) * (G.nm ? 1.4 : 1); for (let i = 0; i < n; i++) { const a = off + i * 6.283 / n; projs.push({ k: 'ebala', x: e.x, y: e.y - 4, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4, dmg: dm }); } sfx('shoot'); }
EXH.p2 = (e, dt) => { // segunda fase de qualquer chefão: rajada em roda
  if (e.d.snake || e.type === 'anhanga') return;
  e.p2T = (e.p2T == null ? 2 : e.p2T) - dt; if (e.p2T <= 0) { e.p2T = 4.5; bossShoot(e, 10, 70, e.t); }
};
EB2.fulozinha = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt;
  if (e.vanish > 0) { e.vanish -= dt; if (e.vanish <= 0) { const a = Math.random() * 6.283; e.x = clamp(px + Math.cos(a) * 70, 10, MAPW - 10); e.y = clamp(py + Math.sin(a) * 55, 10, MAPH - 10); e.lash = 0.55; puff(e.x, e.y, '#3d6b33'); sfx('tp'); } return [0, 0]; }
  if (e.lash > 0) { e.lash -= dt; if (e.lash <= 0) { for (let i = 0; i < 5; i++) { const a = Math.atan2(dy, dx) + (i - 2) * 0.3; fx.push({ k: 'arm', x: e.x, y: e.y - 6, tx: e.x + Math.cos(a) * 80, ty: e.y + Math.sin(a) * 80, life: 0.25, max: 0.25 }); } if (d < 80) playerHit(e.d.dmg * 0.8 * dm); if (e.raged) for (let i = 0; i < 3; i++) { const [x, y] = edgePos(); spawnEnemy('curupira', x, y); } } return [0, 0]; }
  if (e.cc <= 0) { e.cc = e.raged ? 3.5 : 5; e.vanish = 1.1; puff(e.x, e.y, '#3d6b33'); }
  return [dx / d * e.spd + Math.cos(e.t * 4) * 30, dy / d * e.spd + Math.sin(e.t * 3.3) * 30];
};
EB2.cabecadecuia = (e, dt, dx, dy, d) => {
  e.sp = (e.sp == null ? 5 : e.sp) - dt; if (e.sp <= 0) { e.sp = 8; for (let i = 0; i < 3; i++) spawnEnemy('cuia', e.x + rand(-12, 12), e.y + rand(-12, 12)); sfx('splash'); }
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { e.ch = 1.4; e.cdx = dx / d; e.cdy = dy / d; } return [0, 0]; }
  if (e.ch > 0) { e.ch -= dt; e.pk = (e.pk || 0) - dt; if (e.pk <= 0) { e.pk = 0.15; goos.push({ x: e.x, y: e.y + 6, r: 14, life: 5, c: 1 }); } const sp = e.raged ? 190 : 150; return [e.cdx * sp, e.cdy * sp]; }
  e.cc -= dt; if (e.cc <= 0) { e.wind = 0.6; e.cc = 3.2; }
  return null;
};
EB2.labatut = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt; if (e.cc <= 0) { e.cc = e.raged ? 2.8 : 4; ewaves.push({ x: e.x, y: e.y + 10, r: 0, max: 190, spd: 110, hit: false, dmg: e.d.dmg * 0.5 * dm }); G.shake = Math.max(G.shake, 4); sfx('boom'); e.stomp = 0.25; }
  e.rk = (e.rk == null ? 2 : e.rk) - dt; if (e.rk <= 0) { e.rk = e.raged ? 2 : 3; for (let i = 0; i < 2; i++) { const tx = px + player.fx * 30 * (i + 1) + rand(-20, 20), ty = py + player.fy * 30 * (i + 1) + rand(-20, 20); projs.push({ k: 'pedrao', sx: e.x, sy: e.y - 20, tx, ty, x: e.x, y: e.y, t: 0, T: 1.1 + i * 0.15, life: 1, dmg: 14 * dm }); } }
  if (e.stomp > 0) { e.stomp -= dt; return [0, 0]; }
  return null;
};
EB2.bestafera = (e, dt, dx, dy, d, px, py, dm) => {
  e.bt = (e.bt == null ? 4 : e.bt) - dt; if (e.bt <= 0) { e.bt = 6; for (let i = 0; i < 6; i++) { const [x, y] = edgePos(); spawnEnemy('morcego', x, y); } }
  if (e.raged) { e.chainA = (e.chainA || 0) + 2.2 * dt; for (let i = 0; i < 2; i++) { const a = e.chainA + i * Math.PI, bx = e.x + Math.cos(a) * 90, by = e.y + Math.sin(a) * 90; if (segDist2(px, py, e.x, e.y, bx, by) < 36) playerHit(e.d.dmg * 0.5 * dm); } }
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { e.ch = 0.8; e.cdx = dx / d; e.cdy = dy / d; G.shake = Math.max(G.shake, 2); } return [0, 0]; }
  if (e.ch > 0) { e.ch -= dt; e.ft = (e.ft || 0) - dt; if (e.ft <= 0 && !(G.rain > 0)) { e.ft = 0.12; fires.push({ x: e.x, y: e.y + 6, r: 8, t: 0, life: 4, tk: 0.3, max: 14 }); } return [e.cdx * 210, e.cdy * 210]; }
  e.cc -= dt; if (e.cc <= 0) { e.wind = 0.5; e.cc = e.raged ? 3 : 4; }
  return null;
};
EB2.anhanga = (e, dt, dx, dy, d, px, py) => {
  e.cc -= dt; e.sh = (e.sh == null ? 2 : e.sh) - dt;
  if (e.sh <= 0) { e.sh = e.raged ? 2 : 3; bossShoot(e, e.raged ? 16 : 12, e.raged ? 85 : 70, e.t); }
  if (e.cc <= 0) { e.cc = 4; puff(e.x, e.y, '#e8eeff'); const a = Math.random() * 6.283; e.x = clamp(px + Math.cos(a) * 95, 10, MAPW - 10); e.y = clamp(py + Math.sin(a) * 75, 10, MAPH - 10); puff(e.x, e.y, '#e8eeff'); sfx('tp'); for (let i = 0; i < (e.raged ? 3 : 2); i++) { const b = Math.random() * 6.283; spawnEnemy('ilusao', clamp(px + Math.cos(b) * 95, 10, MAPW - 10), clamp(py + Math.sin(b) * 75, 10, MAPH - 10)); } }
  return null;
};

/* ---------------- eventos novos ---------------- */
Object.assign(EVENTS, {
  morcegada: { first: 170, every: [120, 160], run: () => spawnMorcegada() },
  forro:     { first: 260, every: [210, 270], run: () => spawnForro() },
  luacheia:  { first: 400, every: [320, 400], max: 3, hold: 12, run: () => { G.moon = 40; G.moonAcc = 0; banner('Lua cheia! Lobinhos à solta, mas o XP rende mais'); sfx('warn'); } },
  procissao: { first: 520, every: [200, 260], run: () => spawnProcissao() },
  meteoros:  { first: 600, every: [220, 280], run: () => { G.met = 12; G.metT = 0.5; banner('Chuva de estrelas: saia de baixo!'); } },
});
function spawnMorcegada() {
  const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), R = Math.hypot(VW, VH) / 2 + 12, n = 22 + Math.round(G.time / 90), off = rand(-40, 40);
  for (let i = 0; i < n; i++) { const o = off + (i % 3 - 1) * 8, back = Math.floor(i / 3) * 10, x = player.x - dx * (R + back) - dy * o, y = player.y - dy * (R + back) + dx * o; if (x < 4 || y < 4 || x > MAPW - 4 || y > MAPH - 4) continue; const e = spawnEnemy('morcego', x, y); e.spd = 150; e.march = (2 * R + back) / 150; e.cdx = dx; e.cdy = dy; }
  banner('Revoada de morcegos!');
}
function spawnProcissao() {
  const n = 16, a0 = Math.random() * 6.283;
  for (let i = 0; i < n; i++) { const a = a0 + i * 6.283 / n, x = player.x + Math.cos(a) * 170, y = player.y + Math.sin(a) * 136; if (x < 4 || y < 4 || x > MAPW - 4 || y > MAPH - 4) continue; const e = spawnEnemy('beata', x, y); e.orbit = 12; e.oa = a; e.oR = 170; }
  banner('Procissão de velas: elas te cercam!'); sfx('warn');
}
function spawnForro() {
  for (let i = 0; i < 10; i++) { const a = Math.random() * 6.283, x = player.x + Math.cos(a) * 120, y = player.y + Math.sin(a) * 80; if (x < 60 || y < 60 || x > MAPW - 60 || y > MAPH - 60 || inRiver(x, y) || inWater(x, y)) continue; G.stage = { x, y, life: 30, in: 0, done: false }; banner('Forró na praça! Fique no círculo para ganhar força'); return; }
}

/* ---------------- mundo novo: atualização ---------------- */
EXH.world = dt => {
  const pv = player.pass;
  if (pv.rede && !player.moving && !G.dawn) { G.stillT = (G.stillT || 0) + dt; if (G.stillT > 1 && player.hp < player.maxHp) { player.hp = Math.min(player.maxHp, player.hp + 1.5 * pv.rede * dt); if (Math.random() < 0.05) part(player.x + rand(-5, 5), player.y, 0, -20, 0.6, '#86d46f', 1, true); } } else G.stillT = 0;
  if (pv.rosario && !G.dawn) { G.rosT = (G.rosT == null ? 6 : G.rosT) - dt; if (G.rosT <= 0) { G.rosT = 20 - 3 * pv.rosario; const D = 25 * pv.rosario * player.st.dmg; for (const e of enemies) if (e.alive && !e.d.prop && onScr2(e.x, e.y, 0)) hurt(e, D); fx.push({ k: 'aboio', r: 160, life: 0.6, max: 0.6 }); G.flash = Math.max(G.flash || 0, 0.3); sfx('lvl'); } }
  if (G.espT > 0) { G.espT -= dt; if (G.espT <= 0) G.esp = 0; }
  if (G.moon > 0) { G.moon -= dt; G.moonAcc = (G.moonAcc || 0) + dt * (1 + G.time / 600); while (G.moonAcc >= 1) { G.moonAcc -= 1; if (enemies.length - G.nProps < 560 && enemies.filter(e => e.type === 'lobinho').length < 40) { const [x, y] = edgePos(); spawnEnemy('lobinho', x, y); } } }
  if (G.met > 0 && !G.dawn) { G.metT -= dt; if (G.metT <= 0) { G.metT = 0.6; G.met--; const x = clamp(player.x + rand(-110, 110) + player.fx * 40, 20, MAPW - 20), y = clamp(player.y + rand(-80, 80) + player.fy * 30, 20, MAPH - 20); meteors.push({ x, y, t: 0 }); } }
  for (const m of meteors) { m.t += dt; if (m.t >= 1.2) { m.done = true; query(m.x, m.y, 46, Q); const D = 80 * (1 + G.time / 600); for (const e of Q) if (e.alive && !e.d.prop && dist2(m.x, m.y, e.x, e.y) < (30 + e.r) ** 2) hurt(e, D); if (dist2(m.x, m.y, player.x, player.y) < 26 * 26) playerHit(12 * tdm() / 2); for (let i = 0; i < 3; i++) drop(m.x + rand(-8, 8), m.y + rand(-8, 8), 'xp', 3); fx.push({ k: 'boom', x: m.x, y: m.y, r: 30, life: 0.3, max: 0.3 }); burst(m.x, m.y, '#ffd27a', 16, true); G.shake = Math.max(G.shake, 2.5); sfx('boom'); } }
  compact(meteors, m => !m.done);
  for (const w of ewaves) { w.r += w.spd * dt; if (!w.hit && player.inv <= 0 && Math.abs(Math.hypot(player.x - w.x, player.y - w.y) - w.r) < 7) { w.hit = true; playerHit(w.dmg); } }
  compact(ewaves, w => w.r < w.max);
  if (G.stage) { const st = G.stage; st.life -= dt; const inside = dist2(st.x, st.y, player.x, player.y) < 46 * 46;
    if (inside && !st.done) { st.in += dt; if (Math.random() < 0.2) part(st.x + rand(-30, 30), st.y - 10, 0, -25, 0.8, '#f2c14e', 1, true); if (st.in >= 8) { st.done = true; G.buff = Math.max(G.buff, 30); player.hp = Math.min(player.maxHp, player.hp + 30); toast('Forró arretado: +30% de dano por 30s e +30 de vida'); sfx('win'); burst(player.x, player.y, '#e86a9a', 24, true); } }
    query(st.x, st.y, 52, Q); for (const e of Q) if (e.alive && !e.d.boss && !e.d.prop && dist2(e.x, e.y, st.x, st.y) < 46 * 46) e.dance = Math.max(e.dance || 0, 0.3);
    if (Math.random() < 0.15) part(st.x + rand(-8, 8), st.y - 14, rand(-10, 10), -22, 1, '#f0ead6', 1, true);
    if (st.life <= 0) G.stage = null; }
  // bodes e jumentos de passagem
  G.animT = (G.animT == null ? 30 : G.animT) - dt;
  if (G.animT <= 0 && !G.dawn) { G.animT = rand(35, 55); let near = 0; for (const e of enemies) if (e.d.neutral && dist2(e.x, e.y, player.x, player.y) < 500 * 500) near++; if (near < 4) { const [x, y] = edgePos(); const k = Math.random() < 0.6 ? 'bode' : 'jumento', n = k === 'bode' ? 3 : 1; for (let i = 0; i < n; i++) { spawnEnemy(k, clamp(x + rand(-14, 14), 10, MAPW - 10), clamp(y + rand(-14, 14), 10, MAPH - 10)); G.nProps++; } } }
  for (const k of EXW.marks) if (k.k === 'bodega') { k.cd = (k.cd || 0) - dt; const d2 = dist2(k.x, k.y + 10, player.x, player.y);
    if (k.cd <= 0 && d2 < 20 * 20) { k.hold = (k.hold || 0) + dt; if (k.hold >= 0.8) { k.hold = 0; if (G.rap < 8) { k.cd = 3; toast('A bodega pede 8 rapaduras da noite.'); } else { G.rap -= 8; k.cd = 60; player.hp = Math.min(player.maxHp, player.hp + 50); toast('Bodega: baião de dois! +50 de vida'); sfx('coin'); burst(player.x, player.y, '#86d46f', 12, true); } } } else k.hold = 0; }
  for (const n of EXW.npcs) if (!n.said && dist2(n.x, n.y, player.x, player.y) < 34 * 34) { n.said = true; toast(n.line); }
};

/* ---------------- mundo novo: geração ---------------- */
function catmull(pts, step) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)], n = Math.max(2, Math.ceil(Math.hypot(p2.x - p1.x, p2.y - p1.y) / step));
    for (let j = 0; j < n; j++) { const t = j / n, t2 = t * t, t3 = t2 * t; out.push({ x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3), y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3) }); } }
  out.push(pts[pts.length - 1]); return out;
}
function buildRoads() {
  roadSm = roads.map(r => { const pts = catmull(r, 22); for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; pts[i].nx = -dy / L; pts[i].ny = dx / L; pts[i].w = 1 + 0.18 * Math.sin(i * 0.37) + 0.1 * Math.sin(i * 1.13); } return pts; });
  roadGrid = new Map(); pebGrid = new Map(); const rr = mulberry(91);
  const add = (m, key, v) => { let a = m.get(key); if (!a) m.set(key, a = []); a.push(v); };
  for (const pts of roadSm) {
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], seg = [a.x, a.y, b.x, b.y]; const cs = new Set([((a.x / 64) | 0) * 1000 + ((a.y / 64) | 0), ((b.x / 64) | 0) * 1000 + ((b.y / 64) | 0)]); for (const c of cs) for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) add(roadGrid, c + ox * 1000 + oy, seg); }
    for (let i = 0; i < pts.length; i++) for (let k = 0; k < 2; k++) { const p = pts[i], o = (rr() * 2 - 1) * 12 * p.w, x = p.x + p.nx * o + rr() * 8, y = p.y + p.ny * o + rr() * 8; add(pebGrid, ((x / 256) | 0) * 1000 + ((y / 256) | 0), { x, y, c: rr() < 0.5 ? '#3d3a58' : '#252438', s: rr() < 0.2 ? 2 : 1 }); }
    pts.box = []; for (let i = 0; i < pts.length; i += 16) { const ch = pts.slice(i, i + 17); pts.box.push([i, Math.min(...ch.map(p => p.x)) - 24, Math.max(...ch.map(p => p.x)) + 24, Math.min(...ch.map(p => p.y)) - 24, Math.max(...ch.map(p => p.y)) + 24]); }
  }
}
function onRoad2(x, y) { const a = roadGrid.get(((x / 64) | 0) * 1000 + ((y / 64) | 0)); if (!a) return false; for (const s of a) if (segDist2(x, y, s[0], s[1], s[2], s[3]) < 225) return true; return false; }
const NPC_LINES = { rendeira: 'Rendeira: "Oxe, menino, não para não! As visagens tão rondando."', sanfoneiro: 'Sanfoneiro: "Quando tem forró na praça, as visagens dançam também!"', menino: 'Menino: "Vi a Cuca lá pras bandas do açude!"', morador: 'Morador: "A bodega vende baião de dois por umas rapaduras."' };
function makeExtraWorld() {
  EXW = { forests: [], corn: [], marks: [], npcs: [] };
  const busy = (x, y, m) => Math.hypot(x - MAPW / 2, y - MAPH / 2) < 260 || nearRiver(x, y, m) || inVillage(x, y, m + 40) || inGrave(x, y, m) || inWater(x, y) || acudes.some(a => dist2(a.x, a.y, x, y) < (a.rx + m) ** 2) || spots.some(s => dist2(s.x, s.y, x, y) < (m * 0.6 + 30) ** 2) || EXW.marks.some(k => dist2(k.x, k.y, x, y) < (m + 60) ** 2);
  const spot = (m, tries) => { for (let t = 0; t < (tries || 60); t++) { const x = 150 + Math.random() * (MAPW - 300), y = 150 + Math.random() * (MAPH - 300); if (!busy(x, y, m) && !onRoad2(x, y)) return [x, y]; } return null; };
  for (const [k, n, m] of [['igreja', 3, 60], ['casarao', 4, 70], ['catavento', 8, 30], ['estatua', 3, 30], ['cruzeiro', 5, 25], ['pedraFurada', 4, 50], ['bodega', 6, 40], ['ruina', 8, 40]]) for (let i = 0; i < n; i++) { const p = spot(m); if (p) EXW.marks.push({ k, x: p[0], y: p[1] }); }
  for (const k of EXW.marks) if (k.k === 'bodega' || k.k === 'casarao' || k.k === 'igreja') { const nk = ['rendeira', 'sanfoneiro', 'menino', 'morador'][(Math.random() * 4) | 0]; EXW.npcs.push({ k: nk, x: k.x + rand(-30, 30), y: k.y + 26, line: NPC_LINES[nk] }); }
  for (let i = 0; i < 16; i++) { const p = spot(220, 80); if (!p) continue; const R = rand(110, 210), trees = [], pal = Math.random() < 0.35 ? 'carnauba' : null;
    for (let j = 0; j < R * R / 170; j++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R, x = p[0] + Math.cos(a) * r, y = p[1] + Math.sin(a) * r * 0.75; if (onRoad2(x, y) || nearRiver(x, y, 6) || inWater(x, y)) continue; trees.push({ k: pal || (Math.random() < 0.55 ? 'arvore' : Math.random() < 0.5 ? 'juazeiro' : 'mandacaru'), x, y }); }
    EXW.forests.push({ x: p[0], y: p[1], r: R, trees }); }
  for (let i = 0; i < 9; i++) { const p = spot(150, 80); if (!p) continue; const w = rand(150, 260), h = rand(90, 150); EXW.corn.push({ x: p[0] - w / 2, y: p[1] - h / 2, w, h }); }
  buildExtraGrids();
}
function buildExtraGrids() {
  treeGrid = new Map(); for (const f of EXW.forests) for (const t of f.trees) { const key = ((t.x / 256) | 0) * 1000 + ((t.y / 256) | 0); let a = treeGrid.get(key); if (!a) treeGrid.set(key, a = []); a.push(t); }
  for (const a of treeGrid.values()) a.sort((p, q) => p.y - q.y);
  cornImg = EXW.corn.map(c => { const cv2 = document.createElement('canvas'); cv2.width = Math.ceil(c.w) + 6; cv2.height = Math.ceil(c.h) + 14; const x = cv2.getContext('2d'), r = mulberry(Math.round(c.x + c.y)), s = S.milho.n;
    for (let yy = 0; yy < c.h; yy += 7) for (let xx = 0; xx < c.w; xx += 6) { if (r() < 0.08) continue; x.drawImage(s, Math.round(xx + r() * 3), Math.round(yy + r() * 3)); } return cv2; });
}
function inCorn(x, y) { for (const c of EXW.corn) if (x > c.x && x < c.x + c.w && y > c.y && y < c.y + c.h) return true; return false; }

/* ---------------- mundo novo: desenho ---------------- */
EXH.drawRoads = () => {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const f of EXW.forests) if (onScreen(f.x, f.y, f.r + 20)) { ctx.fillStyle = 'rgba(16,30,34,0.45)'; ctx.beginPath(); ctx.ellipse(f.x, f.y, f.r + 14, (f.r + 14) * 0.75, 0, 0, 6.283); ctx.fill(); }
  const passes = [[40, 'rgba(26,34,66,0.55)'], [34, '#242845'], [28, '#2d2c4a'], [20, '#353250']];
  for (const pts of roadSm) for (const [i0, x0, x1, y0, y1] of pts.box) {
    if (x1 < camX || x0 > camX + VW || y1 < camY || y0 > camY + VH) continue;
    const i1 = Math.min(pts.length - 1, i0 + 16);
    for (const [wd, c] of passes) { ctx.strokeStyle = c; ctx.lineWidth = wd; ctx.beginPath(); for (let i = i0; i <= i1; i++) { const p = pts[i]; i === i0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y); } ctx.stroke(); }
    ctx.strokeStyle = 'rgba(20,22,40,0.55)'; ctx.lineWidth = 2;
    for (const sd of [-5.5, 5.5]) { ctx.beginPath(); for (let i = i0; i <= i1; i++) { const p = pts[i]; i === i0 ? ctx.moveTo(p.x + p.nx * sd * p.w, p.y + p.ny * sd * p.w) : ctx.lineTo(p.x + p.nx * sd * p.w, p.y + p.ny * sd * p.w); } ctx.stroke(); }
  }
  ctx.lineCap = 'butt'; ctx.lineJoin = 'miter';
  const cx0 = Math.max(0, ((camX - 10) / 256) | 0), cx1 = ((camX + VW + 10) / 256) | 0, cy0 = Math.max(0, ((camY - 10) / 256) | 0), cy1 = ((camY + VH + 10) / 256) | 0;
  for (let gx = cx0; gx <= cx1; gx++) for (let gy = cy0; gy <= cy1; gy++) { const a = pebGrid.get(gx * 1000 + gy); if (a) for (const p of a) if (onScreen(p.x, p.y, 2)) { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, 1); } }
};
EXH.drawTrees = () => {
  const cx0 = Math.max(0, ((camX - 40) / 256) | 0), cx1 = ((camX + VW + 40) / 256) | 0, cy0 = Math.max(0, ((camY - 40) / 256) | 0), cy1 = ((camY + VH + 40) / 256) | 0;
  for (let gy = cy0; gy <= cy1; gy++) for (let gx = cx0; gx <= cx1; gx++) { const a = treeGrid.get(gx * 1000 + gy); if (a) for (const t of a) if (onScreen(t.x, t.y, 30)) { const s = S[t.k]; longShadow(s, t.x, t.y + s.H / 2, 1); drawSpr(s, t.x, t.y); } }
};
EXH.drawGround = () => {
  for (const k of EXW.marks) { if (!onScreen(k.x, k.y, 70)) continue; const s = S[k.k], sc = k.k === 'igreja' || k.k === 'casarao' || k.k === 'catavento' ? 2 : 1.6;
    longShadow(s, k.x, k.y + s.H * sc / 2, sc); shadow(k.x, k.y + s.H * sc / 2 - 1, s.W * sc * 0.8); drawSpr(s, k.x, k.y, { sc });
    if (k.k === 'catavento') { const cx = k.x, cy = k.y - s.H * sc / 2 - 2, a0 = G.time * 2.5; ctx.strokeStyle = '#a4a4ba'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = a0 + i * 1.047; ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11); } ctx.stroke(); ctx.fillStyle = '#f2c14e'; ctx.fillRect(cx - 1, cy - 1, 2, 2); }
    if (k.k === 'bodega' && k.hold > 0) { ctx.strokeStyle = '#86d46f'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(k.x, k.y + 10, 16, -1.57, -1.57 + 6.283 * k.hold / 0.8); ctx.stroke(); } }
  for (const n of EXW.npcs) if (onScreen(n.x, n.y, 20)) { shadow(n.x, n.y + 6, 8); drawSpr(S[n.k], n.x, n.y - (Math.sin(G.time * 2 + n.x) > 0.6 ? 1 : 0)); }
  for (const m of meteors) { const k = Math.min(1, m.t / 1.2); ctx.strokeStyle = `rgba(255,59,46,${0.4 + 0.5 * k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(m.x, m.y, 26, 15, 0, 0, 6.283); ctx.stroke(); ctx.fillStyle = `rgba(255,59,46,${0.18 * k})`; ctx.fill(); }
  for (const w of ewaves) { ctx.strokeStyle = `rgba(255,80,50,${0.7 * (1 - w.r / w.max)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(w.x, w.y, w.r, w.r * 0.6, 0, 0, 6.283); ctx.stroke(); }
  if (G.stage) { const st = G.stage; ctx.strokeStyle = `rgba(242,193,78,${0.5 + 0.3 * Math.sin(G.time * 6)})`; ctx.setLineDash([4, 4]); ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(st.x, st.y + 6, 46, 28, 0, 0, 6.283); ctx.stroke(); ctx.setLineDash([]);
    const fl = ['#c8463c', '#f2c14e', '#3b6ea5', '#86d46f']; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; ctx.fillStyle = fl[i % 4]; ctx.fillRect(Math.round(st.x + Math.cos(a) * 46), Math.round(st.y + 6 + Math.sin(a) * 28 - 6), 2, 3); }
    if (!st.done) { ctx.fillStyle = '#000'; ctx.fillRect(Math.round(st.x - 15), Math.round(st.y - 22), 30, 3); ctx.fillStyle = '#f2c14e'; ctx.fillRect(Math.round(st.x - 14), Math.round(st.y - 21), Math.round(28 * Math.min(1, st.in / 8)), 1); } }
};
EXH.drawTop = () => { // milharal por cima de quem está dentro; correntes da Besta-Fera
  EXW.corn.forEach((c, i) => { if (c.x > camX + VW + 10 || c.x + c.w < camX - 10 || c.y > camY + VH + 14 || c.y + c.h < camY - 14) return; const inside = player.x > c.x && player.x < c.x + c.w && player.y > c.y && player.y < c.y + c.h; ctx.globalAlpha = inside ? 0.5 : 0.95; ctx.drawImage(cornImg[i], Math.round(c.x), Math.round(c.y - 8)); });
  ctx.globalAlpha = 1;
  for (const e of enemies) if (e.type === 'bestafera' && e.raged && e.alive) { ctx.strokeStyle = '#8a8aa0'; ctx.lineWidth = 2; ctx.setLineDash([3, 2]); for (let i = 0; i < 2; i++) { const a = (e.chainA || 0) + i * Math.PI; ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + Math.cos(a) * 90, e.y + Math.sin(a) * 90); ctx.stroke(); } ctx.setLineDash([]); }
};
EXH.miniDots = (dot, inside) => { for (const k of EXW.marks) if (inside(k.x, k.y) && (k.k === 'bodega' || k.k === 'igreja')) dot(k.x, k.y, k.k === 'bodega' ? (k.cd > 0 ? '#5a6a50' : '#86d46f') : '#c9bfa8', 2); for (const c of EXW.corn) if (inside(c.x, c.y)) { dot(c.x + c.w / 2, c.y + c.h / 2, '#4a6a3a', 2); } };
EXH.reset = () => { ewaves.length = 0; meteors.length = 0; };

/* ---------------- dados que dependem de telas.js ---------------- */
Object.assign(LENDAS, {
  coruja: 'A coruja rasga-mortalha, cujo grito parece pano rasgando, anuncia desgraça.', tatu: 'Tatu encantado que cava por baixo da terra e aparece onde ninguém espera.',
  rezadeira: 'Rezadeira que trocou a reza boa pela ruim e cura as visagens.', beata: 'Procissão de almas com velas acesas que passa à meia-noite.',
  lobinho: 'Filhotes que aparecem quando a lua cheia clareia o sertão.', cuia: 'Cabecinha que sai do rio atrás do Cabeça de Cuia.',
  fulozinha: 'A Comadre Fulozinha protege a mata com seu assobio e seus cabelos compridos.', cabecadecuia: 'Pescador amaldiçoado que vive no rio Parnaíba com uma cabeça enorme.',
  labatut: 'Gigante de um olho só que ronda as serras do Ceará nas noites escuras.', bestafera: 'A Besta-Fera arrasta correntes e cavalga pelas estradas na sexta-feira.',
  anhanga: 'O Anhangá, veado branco de olhos de fogo, guardião dos bichos e das matas.',
});

ACH.anhanga = { name: 'Guardião das Matas', desc: 'Derrote o Anhangá no fim do Modo Pesadelo.', reward: '+300 rapaduras', rap: 300 };
for (const fu of [{ a: 'trovoada', b: 'espelho', id: 'tempestadeprata', name: 'Tempestade de Prata' }, { a: 'marimbondo', b: 'pipa', id: 'ceumarimbondo', name: 'Céu de Marimbondos' }, { a: 'sal', b: 'foice', id: 'colheitasalgada', name: 'Colheita Salgada' }]) {
  FUSIONS.push(fu); WEAPONS[fu.id] = { name: fu.name, desc: 'Fusão lendária de ' + WEAPONS[fu.a].name + ' e ' + WEAPONS[fu.b].name + '.', fusion: true, evo: null }; S['i_' + fu.id] = S['i_' + fu.a];
}
