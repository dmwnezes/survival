'use strict';
/* ---------------- armas ---------------- */
function nearest(x, y, R) { let b = null, bd = R * R; for (const e of enemies) { if (!e.alive || e.d.prop) continue; const d = dist2(x, y, e.x, e.y); if (d < bd) { bd = d; b = e; } } return b; }
function randomNear(x, y, R) { query(x, y, R, Q); const c = Q.filter(e => e.alive && !e.d.prop && dist2(x, y, e.x, e.y) < R * R); return c.length ? c[(Math.random() * c.length) | 0] : null; }
function updWeapons(dt) {
  for (const w of flatW()) {
    const s = wstat(w.id, w.lvl, w.ev); if (w.fzB) { s.dmg *= 1.35; if (s.cd) s.cd *= 0.85; } // peças de uma fusão lendária
    if (w.id === 'folhetos') w.ang = ((w.ang || 0) + s.spin * dt) % 6.283;
    if (w.id === 'sanfona') {
      const R = s.rad; w.tk = (w.tk || 0) - dt;
      if (w.tk <= 0) {
        w.tk = s.tick; query(player.x, player.y, R + 16, Q);
        for (const e of Q) { if (!e.alive) continue; const dx = e.x - player.x, dy = e.y - player.y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) hurt(e, s.dmg, dx / d * 22, dy / d * 22, 'sanfona'); }
        if (Math.random() < 0.8) { const a = Math.random() * 6.283; part(player.x + Math.cos(a) * R * 0.7, player.y + Math.sin(a) * R * 0.7, 0, -18, 0.7, '#9fd0ff', 2, true); }
      }
      if (w.ev) { w.wv = (w.wv || 0) - dt; if (w.wv <= 0) { w.wv = 2; waves.push({ x: player.x, y: player.y, r: R, max: R + 90, dmg: s.dmg, hit: new Set() }); } }
      continue;
    }
    if (w.id === 'folhetos') { updFolhetos(w, s); continue; }
    if (w.id === 'facao') {
      w.ang = ((w.ang || 0) + s.spin * dt) % 6.283; w.hit = w.hit || new Map(); const R = s.rad * s.area;
      query(player.x, player.y, R + 12, Q);
      for (let i = 0; i < s.n; i++) { const ba = w.ang + i * 6.283 / s.n; for (const e of Q) { if (!e.alive || e.d.prop) continue; const ex = e.x - player.x, ey = e.y - player.y, d = Math.hypot(ex, ey); if (d > R + e.r || d < 6) continue; let da = Math.atan2(ey, ex) - ba; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < 0.38 && (w.hit.get(e) || -9) < G.time - 0.3) { w.hit.set(e, G.time); hurt(e, s.dmg, ex / d * 40, ey / d * 40, 'facao'); } } }
      if (w.hit.size > 600) w.hit.clear(); continue;
    }
    if (w.id === 'galo') { updGalos(w, s, dt); continue; }
    w.cd -= dt; if (w.cd > 0) continue; w.cd = s.cd; fire(w, s);
  }
}
function useAbility() {
  if (mode !== 'play' || !G || G.abCd > 0 || G.dawn) return;
  const c = CHARS[player.char], px = player.x, py = player.y, D = player.st.dmg; G.abCd = c.abCd * (1 - 0.15 * (player.pass.cuia || 0));
  if (c.ab === 'laco') {
    query(px, py, 130, Q); let n = 0;
    for (const e of Q.slice().sort((a, b) => dist2(a.x, a.y, px, py) - dist2(b.x, b.y, px, py))) {
      if (!e.alive || e.d.prop || n >= 12) continue; const dx = px - e.x, dy = py - e.y, d = Math.hypot(dx, dy) || 1; if (d > 130) continue;
      n++; const t = e.parent || e; t.root = Math.max(t.root, 1); if (!t.d.boss) { e.kx += dx / d * 260; e.ky += dy / d * 260; }
      fx.push({ k: 'laco', x: e.x, y: e.y, life: 0.25, max: 0.25 }); hurt(e, 15 * D);
    }
    sfx('swing');
  } else if (c.ab === 'benzer') {
    player.hp = Math.min(player.maxHp, player.hp + 35); player.inv = Math.max(player.inv, 1.5); query(px, py, 80, Q); for (const e of Q) if (e.alive && !e.d.prop && !e.d.boss) { const dx = e.x - px, dy = e.y - py, d = Math.hypot(dx, dy) || 1; if (d < 70) { e.kx += dx / d * 200; e.ky += dy / d * 200; } } fx.push({ k: 'aboio', r: 70, life: 0.45, max: 0.45 }); burst(px, py, '#86d46f', 20, true); sfx('lvl');
  } else if (c.ab === 'mergulho') {
    player.inv = Math.max(player.inv, 1.5); G.dive = 1.5;
    query(px, py, 130, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(e.x, e.y, px, py) < 120 * 120) { const t = e.parent || e; t.root = Math.max(t.root, 1.2); }
    burst(px, py, '#7fb2e5', 16); sfx('splash');
  } else {
    query(px, py, 100, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(e.x, e.y, px, py) < 90 * 90) { const t = e.parent || e; t.root = Math.max(t.root, 1.2); hurt(e, 10 * D); }
    fx.push({ k: 'aboio', r: 90, life: 0.45, max: 0.45 }); sfx('lvl');
  }
}
function updPet(dt) {
  const pt = player.pet; if (!pt) return;
  pt.cd -= dt; const P = player.st.dmg;
  let tx = player.x - player.fx * 14, ty = player.y - player.fy * 10 + (pt.k === 'carcara' ? -16 : 0);
  if (pt.k === 'gato') { const e = nearest(player.x, player.y, 70); if (e) { tx = e.x; ty = e.y; if (dist2(pt.x, pt.y, e.x, e.y) < (e.r + 6) ** 2 && pt.cd <= 0) { pt.cd = 0.8; hurt(e, 8 * P); } } }
  else if (pt.k === 'prea') {
    if (!pt.t || pt.t.dead || pt.t.mag) { let b = null, bd = 160 * 160; for (const it of items) if (it.kind === 'xp' && !it.mag) { const d = dist2(it.x, it.y, player.x, player.y); if (d > 900 && d < bd) { bd = d; b = it; } } pt.t = b; }
    if (pt.t) { tx = pt.t.x; ty = pt.t.y; if (dist2(pt.x, pt.y, tx, ty) < 36) { pt.t.mag = true; pt.t = null; } }
  }
  else if (pt.k === 'carcara' && pt.cd <= 0) { const e = randomNear(player.x, player.y, 150); if (e) { pt.cd = 2; pt.dive = 0.3; pt.dx = e.x; pt.dy = e.y; hurt(e, 15 * P); } }
  if (pt.dive > 0) { pt.dive -= dt; tx = pt.dx; ty = pt.dy; }
  const dx = tx - pt.x, dy = ty - pt.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, (pt.dive > 0 ? 400 : Math.min(130, d * 4)) * dt);
  pt.vx = dx; pt.x += dx / d * st; pt.y += dy / d * st;
}
function updFolhetos(w, s) {
  w.hit = w.hit || new Map();
  for (let i = 0; i < s.n; i++) {
    const a = (w.ang || 0) + i * 6.283 / s.n, x = player.x + Math.cos(a) * s.rad, y = player.y + Math.sin(a) * s.rad;
    query(x, y, 22, Q);
    for (const e of Q) if (e.alive && dist2(x, y, e.x, e.y) < (e.r + 5 * s.area) ** 2 && (w.hit.get(e) || -9) < G.time - 0.3) { w.hit.set(e, G.time); hurt(e, s.dmg, Math.cos(a) * 25, Math.sin(a) * 25, 'folhetos'); }
  }
  if (w.hit.size > 600) w.hit.clear();
}
function updGalos(w, s, dt) {
  w.galos = w.galos || [];
  while (w.galos.length < s.n) w.galos.push({ x: player.x + rand(-10, 10), y: player.y + rand(-10, 10), vx: 0, vy: 0, cd: 0, peck: 0, t: null });
  for (const g of w.galos) {
    g.cd -= dt; g.peck -= dt;
    if (!g.t || !g.t.alive || dist2(g.t.x, g.t.y, player.x, player.y) > 190 * 190) g.t = nearest(g.x, g.y, 150);
    const tx = g.t ? g.t.x : player.x + 10, ty = g.t ? g.t.y : player.y + 6, dx = tx - g.x, dy = ty - g.y, d = Math.hypot(dx, dy) || 1, sp = g.t ? s.spd : Math.min(s.spd, d * 3);
    g.vx = dx / d * sp; g.vy = dy / d * sp;
    if (g.t && d < g.t.r + 5) { g.vx = g.vy = 0; if (g.cd <= 0) { g.cd = s.tick; g.peck = 0.12; hurt(g.t, s.dmg, dx / d * 20, dy / d * 20, 'galo'); if (G.syn.galofogo && Math.random() < 0.25) pools.push({ x: g.t.x, y: g.t.y, r: 9, life: G.rain > 0 ? 0.5 : 1.3, max: 1.3, dmg: s.dmg * 0.3, tk: 0 }); } }
    g.x += g.vx * dt; g.y += g.vy * dt;
  }
}
function fire(w, s) {
  const px = player.x, py = player.y;
  switch (w.id) {
    case 'peixeira': {
      const fx0 = player.fx, fy0 = player.fy, dirs = [[fx0, fy0], [-fx0, -fy0], [-fy0, fx0], [fy0, -fx0]];
      const n = Math.min(4, s.n), reach = 45 * s.area, half = 13 * s.area;
      for (let i = 0; i < n; i++) {
        const [dx, dy] = dirs[i]; query(px, py, reach + 16, Q);
        for (const e of Q) { if (!e.alive) continue; const rx = e.x - px, ry = e.y - py, al = rx * dx + ry * dy, pe = Math.abs(-rx * dy + ry * dx); if (al > -6 && al < reach + e.r && pe < half + e.r) hurt(e, s.dmg * (G.syn.pescaria && (e.parent || e).root > 0 ? 1.5 : 1), dx * 45, dy * 45, 'peixeira'); }
        fx.push({ k: 'slash', dx, dy, reach, half, life: 0.16, max: 0.16, ev: w.ev });
      }
      sfx('swing'); break;
    }
    case 'baladeira': {
      const t = nearest(px, py, 230), base = t ? Math.atan2(t.y - py, t.x - px) : Math.atan2(player.fy, player.fx), sp = w.ev ? 0.28 : 0.12;
      for (let i = 0; i < s.n; i++) { const a = base + (i - (s.n - 1) / 2) * sp; projs.push({ k: 'pedra', x: px, y: py - 3, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: 1.3, dmg: s.dmg, pierce: s.pierce, hit: new Set(), r: 2.5 }); }
      sfx('shoot'); break;
    }
    case 'chapeu': {
      const t = nearest(px, py, 160), base = t ? Math.atan2(t.y - py, t.x - px) : Math.atan2(player.fy, player.fx);
      for (let i = 0; i < s.n; i++) { const a = base + i * (6.283 / s.n); projs.push({ k: 'chapeu', ax: Math.cos(a), ay: Math.sin(a), t: 0, T: s.T, R: s.r * s.area, dmg: s.dmg, hit: new Map(), sc: (w.ev ? 1.5 : 1) * Math.sqrt(s.area), x: px, y: py, life: 1 }); }
      sfx('swing'); break;
    }
    case 'fogueira': {
      for (let i = 0; i < s.n; i++) {
        const t = randomNear(px, py, 130); let x, y;
        if (t) { x = t.x; y = t.y; } else { const a = Math.random() * 6.283, r = rand(20, 60); x = px + Math.cos(a) * r; y = py + Math.sin(a) * r; }
        const dur = s.dur * (G.rain > 0 ? 0.4 : 1); // chuva apaga a fogueira mais cedo
        pools.push({ x, y, r: s.rad, life: dur, max: dur, dmg: s.dmg, tk: 0 });
      }
      break;
    }
    case 'rojao': {
      for (let i = 0; i < s.n; i++) {
        const t = randomNear(px, py, 200); let tx, ty;
        if (t) { tx = t.x; ty = t.y; } else { tx = px + player.fx * 80; ty = py + player.fy * 80; }
        projs.push({ k: 'rojao', sx: px, sy: py, tx, ty, x: px, y: py, t: 0, T: 0.55, delay: i * 0.12, dmg: s.dmg, rad: s.rad, life: 1 });
      }
      break;
    }
    case 'bodoque': {
      for (let i = 0; i < s.n; i++) { const t = i === 0 ? nearest(px, py, 200) : randomNear(px, py, 200), a = t ? Math.atan2(t.y - py, t.x - px) : Math.atan2(player.fy, player.fx) + rand(-0.3, 0.3); projs.push({ k: 'barro', x: px, y: py - 3, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: 1.3, dmg: s.dmg, mud: s.mud, r: 3, area: s.area }); }
      sfx('shoot'); break;
    }
    case 'matraca': {
      const fa = Math.atan2(player.fy, player.fx), R = s.rad * s.area; query(px, py, R + 12, Q);
      for (const e of Q) { if (!e.alive || e.d.prop) continue; const ex = e.x - px, ey = e.y - py, d = Math.hypot(ex, ey) || 1; if (d > R + e.r) continue; let da = Math.atan2(ey, ex) - fa; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < s.arc) hurt(e, s.dmg, ex / d * 160, ey / d * 160, 'matraca'); }
      fx.push({ k: 'cone', a: fa, r: R, arc: s.arc, life: 0.22, max: 0.22 }); sfx('swing'); G.shake = Math.max(G.shake, 1); break;
    }
    case 'bumbo': {
      for (let i = 0; i < s.n; i++) waves.push({ x: px, y: py, r: -i * 40, max: s.rad, dmg: s.dmg, hit: new Set(), src: 'bumbo', col: '216,170,110' });
      G.shake = Math.max(G.shake, 1.5); sfx('boom'); break;
    }
    case 'candeeiro': {
      for (let i = 0; i < s.n; i++) {
        const t = i === 0 ? nearest(px, py, 220) : randomNear(px, py, 220), a = t ? Math.atan2(t.y - py, t.x - px) : Math.random() * 6.283;
        projs.push({ k: 'chama', x: px, y: py - 4, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: 3, dmg: s.dmg, rad: s.rad, ev: w.ev });
      }
      break;
    }
    case 'aboio': {
      query(px, py, s.rad + 16, Q);
      for (const e of Q) { if (!e.alive) continue; const dx = e.x - px, dy = e.y - py, d = Math.hypot(dx, dy) || 1; if (d < s.rad + e.r) { const t = e.parent || e; t.root = Math.max(t.root, s.root); hurt(e, s.dmg, dx / d * 160, dy / d * 160, 'aboio'); } }
      fx.push({ k: 'aboio', r: s.rad, life: 0.45, max: 0.45 }); sfx('aboio'); G.shake = Math.max(G.shake, 2); break;
    }
    case 'tarrafa': {
      for (let i = 0; i < s.n; i++) {
        const t = randomNear(px, py, 160); let tx, ty;
        if (t) { tx = t.x; ty = t.y; } else { const a = Math.random() * 6.283; tx = px + Math.cos(a) * 60; ty = py + Math.sin(a) * 60; }
        projs.push({ k: 'rede', sx: px, sy: py, tx, ty, x: px, y: py, t: 0, T: 0.35, delay: i * 0.15, dmg: s.dmg, rad: s.rad, root: s.root, life: 1 });
      }
      sfx('swing'); break;
    }
    case 'berimbau': {
      for (let i = 0; i < s.n; i++) {
        let cur = i === 0 ? nearest(px, py, 170) : randomNear(px, py, 170); if (!cur) break;
        const pts = [[px, py - 4]], hit = new Set(), R = 80 * s.area;
        for (let j = 0; j <= s.b && cur; j++) {
          hit.add(cur); pts.push([cur.x, cur.y]); hurt(cur, s.dmg, undefined, undefined, 'berimbau');
          let nx = null, nd = R * R; query(cur.x, cur.y, R, Q);
          for (const e of Q) { if (!e.alive || hit.has(e)) continue; const dd = dist2(cur.x, cur.y, e.x, e.y); if (dd < nd) { nd = dd; nx = e; } }
          cur = nx;
        }
        fx.push({ k: 'chain', pts, life: 0.2, max: 0.2, ev: w.ev });
      }
      sfx('zap'); break;
    }
  }
}
function explode(x, y, R, dmg, src) {
  src = src || 'rojao';
  query(x, y, R + 16, Q);
  for (const e of Q) { if (!e.alive) continue; const dx = e.x - x, dy = e.y - y, d = Math.hypot(dx, dy) || 1; if (d < R + e.r) hurt(e, dmg, dx / d * 60, dy / d * 60, src); }
  fx.push({ k: 'boom', x, y, r: R, life: 0.3, max: 0.3 });
  if (G.syn.fogos && src === 'rojao') pools.push({ x, y, r: R * 0.6, life: G.rain > 0 ? 0.8 : 2, max: 2, dmg: dmg * 0.12, tk: 0 }); burst(x, y, '#f2c14e', 14, true); G.shake = Math.max(G.shake, 2.5); sfx('boom');
}
function updProjs(dt) {
  for (const p of projs) {
    if (p.k === 'pedra') {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, 18, Q);
      for (const e of Q) { if (!e.alive || p.hit.has(e)) continue; const rr = e.r + p.r; if (dist2(p.x, p.y, e.x, e.y) < rr * rr) { p.hit.add(e); hurt(e, p.dmg, p.vx * 0.15, p.vy * 0.15, p.src === undefined ? 'baladeira' : p.src); if (--p.pierce <= 0) { p.life = 0; break; } } }
    } else if (p.k === 'chapeu') {
      p.t += dt; const d = p.R * Math.sin(Math.PI * Math.min(1, p.t / p.T)); p.x = player.x + p.ax * d; p.y = player.y + p.ay * d; p.life = p.T - p.t;
      const hr = 5 * p.sc; query(p.x, p.y, hr + 16, Q);
      for (const e of Q) { if (!e.alive) continue; const rr = e.r + hr; if (dist2(p.x, p.y, e.x, e.y) < rr * rr && (p.hit.get(e) || -9) < G.time - 0.35) { p.hit.set(e, G.time); hurt(e, p.dmg, p.ax * 30, p.ay * 30, 'chapeu'); } }
    } else if (p.k === 'rojao') {
      if (p.delay > 0) { p.delay -= dt; p.sx = player.x; p.sy = player.y; continue; }
      p.t += dt; const q = Math.min(1, p.t / p.T);
      p.x = p.sx + (p.tx - p.sx) * q; p.y = p.sy + (p.ty - p.sy) * q - Math.sin(Math.PI * q) * 30;
      part(p.x, p.y, rand(-8, 8), rand(-8, 8), 0.3, Math.random() < 0.5 ? '#e8832a' : '#f2c14e', 1, true);
      if (q >= 1) { explode(p.tx, p.ty, p.rad, p.dmg); p.life = 0; }
    } else if (p.k === 'barro') {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, 16, Q);
      for (const e of Q) if (e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (e.r + p.r) ** 2) { hurt(e, p.dmg, p.vx * 0.12, p.vy * 0.12, 'bodoque'); muds.push({ x: p.x, y: p.y, r: 22 * p.area, life: p.mud }); p.life = 0; break; }
    } else if (p.k === 'chama') {
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, 18, Q);
      let hit = p.life <= 0; for (const e of Q) if (e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (e.r + 3) ** 2) { hit = true; break; }
      if (hit) { explode(p.x, p.y, p.rad, p.dmg, 'candeeiro'); if (p.ev) pools.push({ x: p.x, y: p.y, r: p.rad * 0.5, life: G.rain > 0 ? 0.8 : 2, max: 2, dmg: p.dmg * 0.1, tk: 0 }); p.life = 0; }
    } else if (p.k === 'rede') {
      if (p.delay > 0) { p.delay -= dt; p.sx = player.x; p.sy = player.y; continue; }
      p.t += dt; const q = Math.min(1, p.t / p.T);
      p.x = p.sx + (p.tx - p.sx) * q; p.y = p.sy + (p.ty - p.sy) * q - Math.sin(Math.PI * q) * 14;
      if (q >= 1) {
        const wet = G.syn.acude && inWater(p.tx, p.ty); if (wet) { p.rad *= 2; p.root *= 1.5; }
        query(p.tx, p.ty, p.rad + 16, Q);
        for (const e of Q) if (e.alive && dist2(p.tx, p.ty, e.x, e.y) < (p.rad + e.r) ** 2) { (e.parent || e).root = p.root; hurt(e, p.dmg, undefined, undefined, 'tarrafa'); }
        fx.push({ k: 'net', x: p.tx, y: p.ty, r: p.rad, life: p.root, max: p.root }); p.life = 0;
      }
    } else if (p.k === 'pocao') {
      p.t += dt; const q = Math.min(1, p.t / p.T);
      p.x = p.sx + (p.tx - p.sx) * q; p.y = p.sy + (p.ty - p.sy) * q - Math.sin(Math.PI * q) * 40;
      if (q >= 1) { goos.push({ x: p.tx, y: p.ty, r: 18, life: 6 }); burst(p.tx, p.ty, '#9fe07a', 10); sfx('splash'); p.life = 0; }
    }
  }
  compact(projs, p => p.life > 0);
}
function updPools(dt) {
  for (const p of pools) {
    p.life -= dt; p.tk -= dt;
    if (p.tk <= 0) { p.tk = 0.35; query(p.x, p.y, p.r + 16, Q); for (const e of Q) if (e.alive && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) hurt(e, p.dmg, undefined, undefined, 'fogueira'); }
    if (Math.random() < 0.5) part(p.x + rand(-p.r, p.r) * 0.7, p.y + rand(-p.r, p.r) * 0.5, 0, rand(-30, -12), 0.4, Math.random() < 0.5 ? '#e8832a' : '#f2c14e', 1, true);
  }
  compact(pools, p => p.life > 0);
}
function updWaves(dt) {
  for (const w of waves) {
    w.r += 150 * dt; query(w.x, w.y, w.r + 16, Q);
    for (const e of Q) { if (!e.alive || w.hit.has(e)) continue; const dx = e.x - w.x, dy = e.y - w.y, d = Math.hypot(dx, dy) || 1; if (Math.abs(d - w.r) < 6 + e.r) { w.hit.add(e); hurt(e, w.dmg, dx / d * 70, dy / d * 70, w.src || 'sanfona'); } }
  }
  compact(waves, w => w.r < w.max);
}
function updFx(dt) {
  for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.96; p.vy *= 0.96; p.life -= dt; }
  compact(parts, p => p.life > 0);
  for (const n of nums) { n.y -= 18 * dt; n.life -= dt; } compact(nums, n => n.life > 0);
  for (const f of fx) f.life -= dt; compact(fx, f => f.life > 0);
}

