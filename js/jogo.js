'use strict';
/* ---------------- entrada ---------------- */
const keys = new Set(); let joy = null;
addEventListener('keydown', e => {
  if (mode === 'cutscene') { endCut(); return; }
  if (e.code === 'Space' && mode === 'play') { e.preventDefault(); useAbility(); return; }
  keys.add(e.code);
  if ((e.code === 'Escape' || e.code === 'KeyP') && (mode === 'play' || mode === 'pause')) { mode === 'play' ? pauseGame() : resumeGame(); }
  if (mode === 'level') { const i = '12345'.indexOf(e.key); const c = $('#cards').children[i]; if (c) c.click(); }
});
addEventListener('keyup', e => keys.delete(e.code));
addEventListener('blur', () => { keys.clear(); joy = null; });
function toInternal(e) { return [e.clientX / innerWidth * VW, e.clientY / innerHeight * VH]; }
const JOYFIX = () => [46, VH - 50]; // joystick fixo: base no canto inferior esquerdo
cv.addEventListener('pointerdown', e => { if (mode !== 'play' || joy) return; const [x, y] = toInternal(e); if (save.joyFix) { const [ox, oy] = JOYFIX(); joy = { id: e.pointerId, ox, oy, x, y }; } else joy = { id: e.pointerId, ox: x, oy: y, x, y }; });
addEventListener('pointermove', e => { if (joy && e.pointerId === joy.id) { const [x, y] = toInternal(e); joy.x = x; joy.y = y; } });
const endJoy = e => { if (joy && e.pointerId === joy.id) joy = null; };
addEventListener('pointerup', endJoy); addEventListener('pointercancel', endJoy);
function inputDir() {
  let ix = 0, iy = 0;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
  if (keys.has('KeyW') || keys.has('ArrowUp')) iy -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy += 1;
  if (joy) { const dx = joy.x - joy.ox, dy = joy.y - joy.oy, l = Math.hypot(dx, dy); if (l > 2) { const k = Math.min(1, l / 18) / l; ix += dx * k; iy += dy * k; } }
  const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; }
  return [ix, iy];
}

/* ---------------- laço principal ---------------- */
function update(dt) {
  G.time += dt;
  let [ix, iy] = inputDir();
  if (G.stun > 0) { ix = 0; iy = 0; }
  if (G.confuse > 0) { ix = -ix; iy = -iy; }
  if (player.st.drunk && (ix || iy)) { const a = (Math.sin(player.t * 2.3) * 0.22 + Math.sin(player.t * 5.1) * 0.08) * player.st.drunk, c = Math.cos(a), sn = Math.sin(a); [ix, iy] = [ix * c - iy * sn, ix * sn + iy * c]; }
  const l = Math.hypot(ix, iy);
  player.moving = l > 0.05; if (player.moving) { player.fx = ix / l; player.fy = iy / l; }
  const sp = 62 * player.st.spd * (G.slow > 0 ? 0.5 : 1) * (G.rain > 0 ? 0.8 : 1) * (G.ride > 0 ? 1.5 : 1) * (G.sand ? 0.45 : 1) * (onRoad(player.x, player.y) ? 1.25 : 1) * (G.giant > 0 ? 1.3 : 1) * (G.altar && G.altar.k === 'pressa' ? 1.4 : 1) * (1 + (G.esp || 0) / 100);
  const rsp = sp * (inRiver(player.x, player.y) && player.char !== 'pescador' ? 0.4 : 1);
  if (player.st.slip) { const k = Math.min(1, 6 / (1 + player.st.slip * 0.6) * dt); player.vx += (ix * rsp - player.vx) * k; player.vy += (iy * rsp - player.vy) * k; } // chinelo escorrega
  else { player.vx = ix * rsp; player.vy = iy * rsp; }
  player.x = clamp(player.x + (player.vx + player.kx) * dt, 8, MAPW - 8); player.y = clamp(player.y + (player.vy + player.ky) * dt, 8, MAPH - 8);
  const kd = Math.max(0, 1 - 8 * dt); player.kx *= kd; player.ky *= kd;
  updWorld(dt);
  player.inv -= dt; player.t += dt;
  director(dt);
  updEnemies(dt);
  compact(enemies, e => e.alive);
  buildGrid(); separate();
  if (!G.dawn) { updWeapons(dt); updPet(dt); }
  updProjs(dt); updPools(dt); updWaves(dt); updItems(dt); updFx(dt);
  G.shake = Math.max(0, G.shake - dt * 12); G.hurtFlash -= dt;
  G.saveT = (G.saveT || 15) - dt; if (G.saveT <= 0) { G.saveT = 15; saveRun(); }
  if (G.time >= 300) unlockAch('noite5');
  if (G.kills >= 1000) unlockAch('mil');
  if (G.time >= RUN && !G.dawn && !G.inf) {
    if (G.nm && !G.secretDone) { // Pesadelo: o Anhangá guarda o amanhecer
      if (!G.secret) { G.secret = 1; spawnBoss(SECRET_BOSS); banner('A noite ainda não acabou...'); }
      else if (!(G.boss && G.boss.alive)) { G.secretDone = true; unlockAch('anhanga'); startDawn(); }
    } else startDawn();
  }
  if (G.dawn) { G.dawn += dt; if (G.dawn > 2.6 && mode === 'play') startCut('outro', () => endRun(true)); }
  if (G.pendingChest > 0 && mode === 'play' && !G.dawn) openChest();
  else if (G.pendingLv > 0 && mode === 'play' && !G.dawn) openLevel();
}
function startDawn() {
  G.dawn = 0.001; goos.length = 0; marks.length = 0; G.rain = 0; sfx('win'); banner('O sol está nascendo!');
  for (const e of enemies) if (e.alive) { e.alive = false; burst(e.x, e.y, '#f2c14e', 3, true); }
  G.boss = null;
}
function updWorld(dt) {
  EXH.world(dt);
  G.buff -= dt; G.confuse -= dt; G.rain -= dt; G.ride -= dt; G.slow = 0; G.abCd -= dt; G.giant -= dt; G.finalT -= dt;
  const regen = CHARS[player.char].regen; if (regen && !G.dawn) player.hp = Math.min(player.maxHp, player.hp + regen * dt);
  if (player.pass.sandalia && player.moving) { G.trailT -= dt; if (G.trailT <= 0) { G.trailT = 0.2; trails.push({ x: player.x, y: player.y + 5, life: 1.5, tk: 0 }); } }
  for (const tr of trails) { tr.life -= dt; tr.tk -= dt; if (tr.tk <= 0) { tr.tk = 0.4; query(tr.x, tr.y, 18, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(e.x, e.y, tr.x, tr.y) < (8 + e.r) ** 2) hurt(e, 4 * player.pass.sandalia * player.st.dmg); } }
  compact(trails, tr => tr.life > 0);
  G.iaraT -= dt;
  if (G.iaraT <= 0 && !G.dawn) { G.iaraT = 8; for (const a of acudes) { const dx = player.x - a.x, dy = player.y - a.y, d = Math.hypot(dx, dy) || 1; if (d < a.rx + 220 && d > a.rx * 0.5 && !enemies.some(e => e.alive && e.type === 'iara')) { const ex = a.x + dx / d * a.rx * 0.85, ey = a.y + dy / d * a.ry * 0.85; spawnEnemy('iara', ex, ey); toast("A Mãe-d'Água está cantando: fuja da beira!"); G.iaraT = 40; break; } } }
  if (G.cajuRain > 0) { G.cajuRain -= dt; G.crAcc += 6 * dt; while (G.crAcc >= 1) { G.crAcc -= 1; const x = clamp(player.x + rand(-160, 160), 10, MAPW - 10), y = clamp(player.y + rand(-110, 110), 10, MAPH - 10); drop(x, y, 'xp', 2); part(x, y - 30, 0, 70, 0.4, '#c8463c', 2); } }
  for (const st of stars) { st.t += dt; if (st.t >= 1.4) { st.done = true; drop(st.x, st.y, 'bau', 1); burst(st.x, st.y, '#fff6a0', 30, true); G.shake = Math.max(G.shake, 3); sfx('boom'); } }
  compact(stars, st => !st.done);
  G.stun = Math.max(0, (G.stun || 0) - dt);
  for (const r of roots) { r.t += dt; if (!r.hit && r.t >= 0.9) { r.hit = true; if (dist2(r.x, r.y, player.x, player.y) < 18 * 18 && player.inv <= 0) { G.stun = Math.max(G.stun, 1); toast('As raízes do Pai do Mato te prenderam!'); } } }
  compact(roots, r => r.t < 2.6);
  for (const m of muds) m.life -= dt; compact(muds, m => m.life > 0);
  for (const fr of fires) {
    fr.t += dt; fr.life -= G.rain > 0 ? dt * 6 : dt; fr.r = Math.min(fr.max || 120, 10 + fr.t * 8); fr.tk -= dt;
    if (fr.tk <= 0) { fr.tk = 0.5; const rr = fr.r * 0.9; if (dist2(fr.x, fr.y, player.x, player.y) < rr * rr) playerHit(2.5); query(fr.x, fr.y, fr.r + 10, Q); for (const e of Q) if (e.alive && !e.d.boss && dist2(fr.x, fr.y, e.x, e.y) < rr * rr) hurt(e, 15); }
  }
  compact(fires, fr => fr.life > 0);
  for (const pg of pilgrims) { pg.x += pg.vx * dt; pg.y += pg.vy * dt; pg.life -= dt; if (dist2(pg.x, pg.y, player.x, player.y) < 30 * 30 && player.hp < player.maxHp) { player.hp = Math.min(player.maxHp, player.hp + 5 * dt / 3); if (Math.random() < 0.05) part(player.x + rand(-5, 5), player.y, 0, -25, 0.6, '#cfe0ff', 1, true); } }
  compact(pilgrims, pg => pg.life > 0);
  if (G.farinha > 0) { G.farinha -= dt; if (G.farinha <= 0) recalc(); }
  if (!G.dawn && inGrave(player.x, player.y)) { G.graveT = (G.graveT || 0) - dt; if (G.graveT <= 0) { G.graveT = 2.5; for (let i = 0; i < 1; i++) { const [x, y] = edgePos(); spawnEnemy('alma', x, y); } } }
  for (const village of villages) if (village.def > 0) {
    village.def -= dt;
    const alive = village.vill.filter(v => v.hp > 0).length;
    if (!alive) { village.def = 0; toast('Os moradores foram levados pelas almas...'); sfx('die'); }
    else if (village.def <= 0) { drop(village.x, village.y, 'bau', 1); if (village.big) drop(village.x - 14, village.y, 'bau', 1); drop(village.x + 10, village.y, 'rap', (village.big ? 8 : 5) * alive); toast(village.big ? 'Moradores salvos! O vilarejo grande deixou dois baús.' : 'Moradores salvos! O vilarejo deixou um baú.'); sfx('win'); }
  }
  G.wet = clamp((G.wet || 0) + (G.rain > 0 ? dt / 8 : -dt / 40), 0, 1);
  if (G.rain > 0) { G.boltT = (G.boltT == null ? 4 : G.boltT) - dt; if (G.boltT <= 0) { G.boltT = rand(4, 9); G.flash = 1; sfx('thunder'); } }
  G.flash = Math.max(0, (G.flash || 0) - dt * 4);
  if (G.dive > 0) { G.dive -= dt; if (G.dive <= 0) { query(player.x, player.y, 76, Q); for (const e of Q) if (e.alive && dist2(e.x, e.y, player.x, player.y) < (60 + e.r) ** 2) hurt(e, 35 * player.st.dmg, (e.x - player.x) * 4, (e.y - player.y) * 4); fx.push({ k: 'boom', x: player.x, y: player.y, r: 60, life: 0.3, max: 0.3 }); burst(player.x, player.y, '#7fb2e5', 24); sfx('splash'); } }
  if (!G.finalUsed && flatW().length >= SLOTS && player.weapons.every(w => w.ev)) { G.finalUsed = true; G.finalT = 30; banner('FORMA FINAL!'); sfx('win'); G.shake = 6; }
  if (G.cang > 0) {
    G.cang -= dt; G.cangT -= dt;
    if (G.cangT <= 0) { G.cangT = 0.35; const o = G.time * 2, dmg = 12 * player.st.dmg; for (let i = 0; i < 8; i++) { const a = o + i * 0.785; projs.push({ k: 'pedra', x: player.x, y: player.y - 3, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 1.2, dmg, pierce: 2, hit: new Set(), r: 2.5, src: null }); } sfx('shoot'); }
  }
  for (const h of honeys) h.life -= dt;
  compact(honeys, h => h.life > 0);
  for (const c of critters) {
    c.life -= dt; c.turn -= dt;
    const away = Math.atan2(c.y - player.y, c.x - player.x);
    if (c.turn <= 0) { c.turn = 0.6; c.ang = away + rand(-1.2, 1.2); }
    c.vx = Math.cos(c.ang) * 55; c.x = clamp(c.x + c.vx * dt, 10, MAPW - 10); c.y = clamp(c.y + Math.sin(c.ang) * 55 * dt, 10, MAPH - 10);
    if (Math.random() < 0.3) part(c.x, c.y, rand(-8, 8), rand(-15, -5), 0.4, '#fff6a0', 1, true);
    if (dist2(c.x, c.y, player.x, player.y) < 81) { c.life = 0; c.caught = true; for (let i = 0; i < 6; i++) drop(c.x + rand(-10, 10), c.y + rand(-10, 10), 'rap', 3 + (Math.random() * 2 | 0)); toast('Pegou a galinha de ouro!'); sfx('win'); burst(c.x, c.y, '#f2c14e', 24, true); }
    else if (c.life <= 0) toast('A galinha de ouro fugiu.');
  }
  compact(critters, c => c.life > 0);
  if (G.altar) { G.altar.t -= dt; if (G.altar.t <= 0) G.altar = null; }
  G.sand = inSand(player.x, player.y);
  G.spikeT -= dt;
  if (G.spikeT <= 0) {
    G.spikeT = 0.5;
    for (const t of traps) { if (t.k !== 'espinho') continue;
      if (dist2(t.x, t.y, player.x, player.y) < t.r * t.r) playerHit(6);
      query(t.x, t.y, t.r + 10, Q); for (const e of Q) if (e.alive && !e.d.prop && !e.d.fly && dist2(t.x, t.y, e.x, e.y) < (t.r + e.r) ** 2) hurt(e, 8); }
  }
  for (const w of whirls) {
    w.x += w.vx * dt; w.y += w.vy * dt; w.life -= dt; w.ang += dt * 8;
    query(w.x, w.y, 56, Q);
    for (const e of Q) { if (!e.alive || e.d.boss || e.d.prop || e.d.seg) continue; const dx = e.x - w.x, dy = e.y - w.y, d = Math.hypot(dx, dy) || 1; if (d < 50) { e.kx += (-dy / d * 220 + dx / d * 60 + w.vx) * dt * 4; e.ky += (dx / d * 220 + dy / d * 60 + w.vy) * dt * 4; } }
    for (const p of projs) if (p.k === 'pedra' && dist2(p.x, p.y, w.x, w.y) < 2500) { const c = Math.cos(3 * dt), sn = Math.sin(3 * dt); [p.vx, p.vy] = [p.vx * c - p.vy * sn, p.vx * sn + p.vy * c]; }
    if (Math.random() < 0.8) { const a = Math.random() * 6.283, r = Math.random() * 40; part(w.x + Math.cos(a) * r, w.y + Math.sin(a) * r * 0.6, -Math.sin(a) * 60, Math.cos(a) * 30 - 10, 0.5, '#b8a27a', 1); }
  }
  compact(whirls, w => w.life > 0);
  if (spots.some(s => s.used)) compact(spots, s => !s.used);
  for (const village of villages) if (!G.dawn && dist2(village.x, village.y, player.x, player.y) < village.r * village.r) {
    if (!village.entered && !defV()) { village.entered = true; village.def = village.big ? 40 : 30; banner(`Proteja os moradores por ${village.def}s!`); sfx('warn'); spawnElite(); village.vill = Array.from({ length: village.big ? 6 : 3 }, (_, i) => ({ x: village.x + (i % 3 - 1) * 22, y: village.y + 8 + Math.floor(i / 3) * 18, hp: 60 })); }
    if (village.def <= 0) continue;
    village.t -= dt;
    if (village.t <= 0) { village.t = 2.5; for (let i = 0; i < 3; i++) { const [x, y] = edgePos(); spawnEnemy('alma', x, y); } }
  }
  for (const c of carts) {
    c.x += c.vx * dt; c.life -= dt; if (c.x < 10 || c.x > MAPW - 10) c.life = 0;
    query(c.x, c.y, 30, Q);
    for (const e of Q) if (e.alive && !c.hit.has(e) && Math.abs(e.x - c.x) < 16 + e.r && Math.abs(e.y - c.y) < 7 + e.r) { c.hit.add(e); hurt(e, 150, Math.sign(c.vx) * 80, (e.y - c.y) * 6); }
    if (!c.used && Math.abs(player.x - c.x) < 19 && Math.abs(player.y - c.y) < 11) { c.used = true; G.ride = 8; toast('Carona no carro de boi: +50% de velocidade por 8s'); sfx('lvl'); }
  }
  compact(carts, c => c.life > 0);
  for (const g of goos) { g.life -= dt; if (dist2(g.x, g.y, player.x, player.y) < g.r * g.r * 0.6) G.slow = 1; }
  compact(goos, g => g.life > 0);
  for (const m of marks) m.life -= dt; // pegadas só de enfeite: inverter controles confundia demais
  compact(marks, m => m.life > 0);
  for (const s of spots) {
    const d2 = dist2(s.x, s.y, player.x, player.y);
    if (s.k === 'capela') {
      if (d2 < 22 * 22 && s.charge > 0 && player.hp < player.maxHp) { const h = Math.min(6 * dt, s.charge, player.maxHp - player.hp); player.hp += h; s.charge -= h; if (Math.random() < 0.3) part(player.x + rand(-6, 6), player.y + 4, 0, -20, 0.6, '#b4d2ff', 1, true); }
      else s.charge = Math.min(80, s.charge + dt);
    } else if (s.k === 'fogo') {
      s.cd -= dt;
      if (s.cd <= 0 && G.rain <= 0 && d2 < 14 * 14) { s.cd = 90; G.buff = 20; toast('Fogo de São João: +30% de dano por 20s'); burst(s.x, s.y, '#f2c14e', 18, true); sfx('lvl'); }
    } else if (s.k === 'cruz') {
      if (d2 < 12 * 12) { s.used = true; for (const it of items) if (it.kind === 'xp') { it.mag = true; it.fast = true; it.sp = Math.max(it.sp, 250); } toast('A cruz puxou todos os cajus do mapa!'); burst(s.x, s.y, '#fff6a0', 30, true); sfx('win'); }
    } else if (s.k === 'farinha') {
      s.cd -= dt;
      if (s.cd <= 0 && d2 < 16 * 16) { s.hold += dt; if (s.hold >= 0.6) { s.hold = 0; s.cd = 150; G.farinha = 60; recalc(); player.hp = Math.min(player.maxHp, player.hp + 30); toast('Casa de farinha: +30 de vida máxima por 60s'); burst(s.x, s.y, '#e8d9b0', 16); sfx('lvl'); } } else s.hold = 0;
    } else if (s.k === 'poco') {
      s.cd -= dt;
      if (s.cd <= 0 && d2 < 14 * 14) {
        s.hold += dt;
        if (s.hold >= 0.8) {
          s.hold = 0;
          if (G.rap < 5) { s.cd = 3; toast('O poço pede 5 rapaduras da noite.'); }
          else {
            G.rap -= 5; s.cd = 60; burst(s.x, s.y, '#a8eaff', 16, true); sfx('coin');
            const ws = player.weapons.filter(w => !w.ev && w.lvl < WMAX), ps = Object.keys(player.pass).filter(k => player.pass[k] < PASSIVES[k].max), r = Math.random();
            if (r < 0.35 && ws.length) { const w = ws[(Math.random() * ws.length) | 0]; w.lvl++; refreshSlots(); toast('O poço subiu ' + WEAPONS[w.id].name + ' para o nível ' + w.lvl + '!'); }
            else if (r < 0.6 && ps.length) { const k = ps[(Math.random() * ps.length) | 0]; player.pass[k]++; recalc(); refreshSlots(); toast('O poço melhorou ' + PASSIVES[k].name + '!'); }
            else if (r < 0.8) { player.hp = player.maxHp; toast('O poço encheu sua vida!'); }
            else { drop(s.x + 14, s.y, [...PWK][(Math.random() * PWK.size) | 0], 1); toast('O poço jogou um poder pra fora!'); }
          }
        }
      } else s.hold = 0;
    } else if (s.k === 'coronel') {
      s.cd -= dt;
      if (s.cd <= 0 && d2 < 16 * 16) { s.hold += dt; if (s.hold >= 0.8) { s.hold = 0; openRoleta(s); } } else s.hold = 0;
    } else if (s.k === 'altar') {
      s.cd -= dt;
      if (s.cd <= 0 && d2 < 14 * 14 && player.hp > 35) {
        s.hold += dt;
        if (s.hold >= 1.2) { s.hold = 0; s.cd = 120; player.hp -= 30; const b = ALTAR[(Math.random() * ALTAR.length) | 0]; G.altar = { k: b.k, t: 40, short: b.short }; toast('Altar: ' + b.name + ' por 40s (custou 30 de vida)'); burst(s.x, s.y, '#c8463c', 20, true); sfx('boss'); }
      } else s.hold = 0;
    }
  }
}
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (mode === 'play') { for (let i = 0; i < SPEED && mode === 'play'; i++) update(dt); if (mode === 'play') updHUD(); }
  else if (mode === 'cutscene' && cut) { cut.t += dt; updCutText(); if (cut.t > CUTS[cut.kind].len) endCut(); }
  else menuT += dt;
  render();
  requestAnimationFrame(frame);
}

