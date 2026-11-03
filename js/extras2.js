'use strict';
/* =========================================================
   v3.2: loja por mapa, missões do dia, sequência sem dano,
   chefões sorteados no sertão, coqueiros, guardiões das ilhas,
   jangadas que mudam de lugar e armas douradas brilhando.
   ========================================================= */
function UP() { return MAP === 'praia' ? (save.upP = save.upP || {}) : save.up; } // melhorias da loja do mapa atual

/* ---------------- chefões sorteados no sertão ---------------- */
// o chefão sorteado herda a vida e o dano do horário em que aparece; a Besta-Fera continua fechando a noite
{ const am0 = applyMap; window.applyMap = pick => {
  am0(pick); if (MAP !== 'sertao') return;
  const slots = SERT.bosses, last = slots.length - 1;
  if (pick || !G.sb) { const t = slots.slice(0, last).map(b => b.type); for (let i = t.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [t[i], t[j]] = [t[j], t[i]]; } G.sb = t; }
  BOSSES.length = 0;
  slots.forEach((slot, i) => { if (i === last) { BOSSES.push(Object.assign({}, slot)); return; } const ty = G.sb[i], src = slots.find(b => b.type === ty); BOSSES.push({ t: slot.t, type: ty, name: src.name, mul: EN[slot.type].hp / EN[ty].hp, dmul: EN[slot.type].dmg / EN[ty].dmg }); });
}; }
{ const sb0 = spawnBoss; window.spawnBoss = b => { sb0(b); if (b.dmul && G.boss) G.boss.d = Object.assign({}, G.boss.d, { dmg: G.boss.d.dmg * b.dmul }); }; } // cópia dos dados: golpes especiais também usam o dano do horário

/* ---------------- sequência sem tomar dano ---------------- */
{ const h0 = EXH.onHit; EXH.onHit = (dmg, src) => { h0(dmg, src); if (G.streak >= 25) toast('Sequência perdida: ' + G.streak); G.streak = 0; }; }
function streakUp() {
  G.streak = (G.streak || 0) + 1; G.bestStreak = Math.max(G.bestStreak || 0, G.streak);
  const prize = { 100: 3, 250: 6, 500: 10, 1000: 20 }[G.streak]; if (prize) { G.rap += prize; banner(`Sequência de ${G.streak} sem tomar dano! +${prize} rapaduras`); sfx('win'); }
}

/* ---------------- missões do dia ---------------- */
const MIS_T = [
  { k: 'kill', type: 'morcego', name: 'morcegos', n: [250, 450] }, { k: 'kill', type: 'saci', name: 'sacis', n: [80, 160] }, { k: 'kill', type: 'mula', name: 'mulas sem cabeça', n: [40, 90] },
  { k: 'kill', type: 'caranguejo', name: 'caranguejos', n: [200, 400] }, { k: 'kill', type: 'siri', name: 'siris', n: [120, 250] }, { k: 'kill', type: 'afogado', name: 'afogados', n: [40, 90] },
  { k: 'kills', n: [1500, 3000] }, { k: 'boss', n: [2, 4] }, { k: 'bau', n: [3, 6] }, { k: 'level', n: [25, 35] },
  { k: 'time', map: 'sertao', n: [8, 14] }, { k: 'time', map: 'praia', n: [5, 10] }, { k: 'streak', n: [100, 250] },
];
function misText(m) {
  if (m.k === 'kill') return `Derrote ${m.n} ${m.name}`; if (m.k === 'kills') return `Derrote ${m.n.toLocaleString('pt-BR')} visagens`; if (m.k === 'boss') return `Derrote ${m.n} chefões`;
  if (m.k === 'bau') return `Abra ${m.n} baús`; if (m.k === 'level') return `Chegue ao nível ${m.n} numa noite`; if (m.k === 'streak') return `Faça uma sequência de ${m.n} abates sem tomar dano`;
  return `Sobreviva ${m.n} minutos ${m.map === 'praia' ? 'na praia' : 'no sertão'} numa noite`;
}
let misT = 0;
function missions() {
  if (save.daily && performance.now() - misT < 20000) return save.daily.list; misT = performance.now(); // a data só é conferida de tempos em tempos
  const day = new Date().toLocaleDateString('sv');
  if (!save.daily || save.daily.day !== day) {
    let h = 7; for (const c of day) h = (h * 31 + c.charCodeAt(0)) | 0; const r = mulberry(h), pool = MIS_T.slice(), list = [];
    while (list.length < 3) { const tp = pool.splice((r() * pool.length) | 0, 1)[0]; if (list.some(m => m.k === tp.k && tp.k !== 'kill')) continue; const n = Math.round(tp.n[0] + r() * (tp.n[1] - tp.n[0])), step = n >= 100 ? 10 : 1;
      list.push(Object.assign({}, tp, { n: Math.round(n / step) * step, prog: 0, done: false, rew: 40 + list.length * 20 })); }
    save.daily = { day, list }; persist();
  }
  return save.daily.list;
}
function misProg(kind, v, type) {
  if (!G) return;
  for (const m of missions()) { if (m.done || m.k !== kind || (m.type && m.type !== type) || (m.map && m.map !== MAP)) continue;
    m.prog = kind === 'level' || kind === 'time' || kind === 'streak' ? Math.max(m.prog, Math.floor(v)) : m.prog + v;
    if (m.prog >= m.n) { m.prog = m.n; m.done = true; save.rap += m.rew; persist(); toast(`Missão cumprida: ${misText(m)} (+${m.rew} rapaduras)`); sfx('win'); } }
}
function renderMissoes() {
  const ls = missions(); $('#mis-sub').textContent = 'Novas missões todo dia. A recompensa vai direto para a sua rapadura.';
  $('#mislist').innerHTML = ls.map(m => `<div class="panel item ${m.done ? 'done' : ''}"><div class="tx"><b>${misText(m)}</b><span>${m.done ? 'Cumprida!' : `${Math.floor(m.prog).toLocaleString('pt-BR')} de ${m.n.toLocaleString('pt-BR')}`} · ${m.rew} rapaduras</span></div><span>${m.done ? 'Feita' : ''}</span></div>`).join('');
}
{ const k0 = EXH.onKill; EXH.onKill = e => { k0(e); streakUp(); misProg('kill', 1, e.type); misProg('kills', 1); if (e.d.boss) misProg('boss', 1); misProg('streak', G.streak); }; }
{ const l0 = EXH.onLevel; EXH.onLevel = () => { l0(); misProg('level', player.level); }; }
EXH.onBau = () => misProg('bau', 1);
{ const w0 = EXH.world; EXH.world = dt => { w0(dt); G.misT = (G.misT || 0) - dt; if (G.misT <= 0) { G.misT = 1; misProg('time', G.time / 60); } }; }

/* ---------------- praia: coqueiros, guardiões e jangadas ---------------- */
EN.coqueiroP = { hp: 1e9, spd: 0, dmg: 0, xp: 0, r: 6, spr: 'coqueiro', prop: 1, tree: 1, col: '#3d6b33' };
SD.coco = ['.qq.', 'qQqq', 'qqqq', '.qq.']; S.coco = sprite(SD.coco, { q: '#6b4a2e', Q: '#a87a4a' }, { out: true });
EXH.tree = t => { if ((t.cocoT || 0) > G.time) return; t.cocoT = G.time + 18; const a = Math.random() * 6.283; drop(t.x + Math.cos(a) * 10, t.y + 8 + Math.sin(a) * 5, 'coco', 25); items[items.length - 1].food = true; burst(t.x, t.y - 6, '#5f9e4a', 6); };
{ const pp0 = placeProps; window.placeProps = () => { pp0(); if (MAP !== 'praia') return;
  for (let i = 0, t = 0; i < 70 && t < 400; t++) { const x = rand(60, MAPW - 60), y = rand(shoreBase(x) + 150, MAPH - 60); if (inVillage(x, y, 20) || nearRiver(x, y, 10) || Math.hypot(x - player.x, y - player.y) < 80) continue; spawnEnemy('coqueiroP', x, y); G.nProps++; i++; } }; }
{ const w0 = EXH.world; EXH.world = dt => { w0(dt); if (MAP !== 'praia' || G.dawn) return;
  for (const s of spots) {
    if (s.k === 'bauilha' && !s.used && !s.guard && dist2(s.x, s.y, player.x, player.y) < 300 * 300) { s.guard = true; const e = spawnEnemy(['afogado', 'pirata', 'tubarao'][(Math.random() * 3) | 0], s.x + rand(-20, 20), s.y + rand(-12, 12)); e.elite = true; e.hp = e.maxHp = e.maxHp * 10; e.r *= 1.5; e.sc = 1.6; banner('Um guardião protege o baú da ilha!'); sfx('warn'); }
    if (s.k === 'jangada') { if (s.cd > 0 && !s.moved) { s.moved = true; const x = rand(200, MAPW - 200); s.x = x; s.y = shoreBase(x) + 110 + rand(0, 30); s.cd = 60; } else if (s.cd <= 0) s.moved = false; }
  } }; }

/* ---------------- armas douradas brilhando ---------------- */
const PK2W = { pedra: 'baladeira', chapeu: 'chapeu', rojao: 'rojao', rede: 'tarrafa', chama: 'candeeiro', barro: 'bodoque', boi: 'boi', chumbo: 'sal', arapuca: 'arapuca', enxame: 'marimbondo', piao: 'piao', bola: 'bola', nota: 'pifano', pilao: 'pilao', arpao: 'arpao', concha: 'concha', garrafa2: 'mensagem' };
{ const g0 = EXH.drawGlow; EXH.drawGlow = () => { g0(); if (G.dawn) return;
  for (const p of projs) { const id = PK2W[p.k]; if (id && save.gold[id] && !(p.delay > 0)) { circle(p.x, p.y, 5 + Math.sin(G.time * 10 + p.x) * 1.5, 'rgba(255,210,63,0.45)'); if (Math.random() < 0.08) part(p.x, p.y, rand(-8, 8), rand(-14, -4), 0.4, '#ffd23f', 1, true); } }
  for (const w of flatW()) { if (!save.gold[w.id]) continue;
    if (w.id === 'galo' && w.galos) for (const g of w.galos) circle(g.x, g.y, 7, 'rgba(255,210,63,0.35)');
    if (w.id === 'pipa' && w.kites) for (const k of w.kites) circle(k.x, k.y, 7, 'rgba(255,210,63,0.4)');
    if (w.id === 'folhetos' && w.ang != null) { const s = wstat('folhetos', w.lvl, w.ev); for (let i = 0; i < s.n; i++) { const a = w.ang + i * 6.283 / s.n; circle(player.x + Math.cos(a) * s.rad, player.y + Math.sin(a) * s.rad, 6, 'rgba(255,210,63,0.4)'); } }
    if (w.id === 'sanfona') { const s = wstat('sanfona', w.lvl, w.ev); ctx.strokeStyle = 'rgba(255,210,63,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(player.x, player.y, s.rad + 2, 0, 6.283); ctx.stroke(); }
    if (w.id === 'tatu' && w.plates > 0) for (let i = 0; i < w.plates; i++) { const a = (w.ang || 0) + i * 6.283 / w.plates; circle(player.x + Math.cos(a) * 15, player.y + Math.sin(a) * 12, 5, 'rgba(255,210,63,0.4)'); }
  } }; }
NOTES.unshift(['v3.2', 'Chefões do sertão sorteados a cada noite (a Besta-Fera continua fechando a noite).', 'Missões do dia no menu, com rapadura de recompensa.', 'Loja com melhorias separadas para o sertão e para a praia.', 'Contador de sequência sem tomar dano, com prêmios em 100, 250, 500 e 1.000.', 'A habilidade do personagem fica mais forte conforme o nível dele.', 'Coqueiros da praia soltam cocos que curam quando suas armas acertam.', 'Ilhas com guardião protegendo o baú; jangadas usadas reaparecem em outro ponto da praia.', 'A tempestade apaga o farol e as fogueiras.', 'Carro de boi passa mais vezes no sertão.', 'Armas douradas brilham em ouro durante a partida.']);
NOTES.unshift(['v3.3', 'DLC Reinado do Sertão: um jogo novo no estilo 9 Kings, no botão do menu.', 'Nove senhores do folclore disputam o sertão; derrote cada um para jogar com ele.', '33 anos de cartas, lotes, bênçãos e decretos, com batalhas automáticas e chefões nos anos 11, 22 e 33.', 'Anhangá é o senhor secreto.']);
