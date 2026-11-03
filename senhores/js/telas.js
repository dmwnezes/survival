'use strict';
/* telas, entrada, laço de desenho, música e sons do Reinado do Sertão */
const $$ = s => [...document.querySelectorAll(s)];
let MODE = 'title', SEL = null, MOVE = null, INFO = -1, BAT = null, BKIND = null, BRID = null, SPEEDX = 2, PEEK = null, DEMO = null, CUT = null, RAIDSEL = null, LORDSEL = 'coronel', DIF = 'normal';
const ICO = {};
const icoURL = k => ICO[k] || (ICO[k] = (() => { const im = gsp(k, { x2: true }), c = document.createElement('canvas'); c.width = im.width; c.height = im.height; c.getContext('2d').drawImage(im, 0, 0); return c.toDataURL(); })());

function show(name) { $$('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + name)); }
function hideAll() { show(''); }
const vis = (id, on) => document.getElementById(id).classList.toggle('hidden', !on);

/* ---------- som novo do DLC ---------- */
const S2 = {
  card: t => tone(t, 'triangle', 520, 780, 0.08, 0.08),
  place: t => { noise(t, 0.09, 0.22, 900); tone(t, 'sine', 180, 90, 0.12, 0.16); },
  lvl: t => [660, 880, 1100, 1320].forEach((f, i) => tone(t + i * 0.05, 'square', f, 0, 0.08, 0.06)),
  horn: t => { tone(t, 'sawtooth', 220, 330, 0.35, 0.1); tone(t + 0.3, 'sawtooth', 330, 0, 0.5, 0.09); },
  shot: t => noise(t, 0.03, 0.08, 5200),
  fire: t => noise(t, 0.14, 0.12, 1400),
  hit: t => tone(t, 'square', 300, 150, 0.03, 0.03),
  win: t => [523, 659, 784, 659, 1046].forEach((f, i) => tone(t + i * 0.11, 'triangle', f, 0, 0.22, 0.13)),
  lose: t => [392, 330, 262, 196].forEach((f, i) => tone(t + i * 0.16, 'sine', f, 0, 0.3, 0.14)),
  coin: t => { tone(t, 'square', 1200, 0, 0.04, 0.06); tone(t + 0.05, 'square', 1600, 0, 0.1, 0.06); },
  click: t => tone(t, 'square', 900, 0, 0.025, 0.04),
  power: t => { tone(t, 'sine', 200, 900, 0.3, 0.12); noise(t + 0.1, 0.3, 0.12, 2400); },
  steal: t => [784, 988, 1175].forEach((f, i) => tone(t + i * 0.07, 'triangle', f, 0, 0.14, 0.1)),
};
const lastS = {};
function snd(n) { if (!AC || !dsave.sound || AC.state !== 'running') return; const now = AC.currentTime; if (lastS[n] && now - lastS[n] < 0.04) return; lastS[n] = now; try { S2[n](now); } catch (e) {} }

/* ---------- música: forró de 8 bits ---------- */
const MUS = { on: false, next: 0, step: 0, track: 'plano', timer: null };
const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);
const SONGS = {
  // mixolídio em Sol: zabumba, triângulo, baixo e sanfona quadrada
  plano: { bpm: 104, mel: [67, 0, 71, 72, 74, 0, 72, 71, 69, 0, 67, 69, 71, 0, 0, 0, 67, 0, 71, 72, 74, 76, 77, 76, 74, 0, 72, 0, 71, 0, 0, 0], bass: [43, 0, 0, 50, 0, 0, 43, 0, 41, 0, 0, 48, 0, 0, 41, 0] },
  batalha: { bpm: 138, mel: [74, 74, 0, 72, 74, 0, 77, 0, 76, 74, 72, 0, 71, 0, 72, 0, 74, 74, 0, 72, 74, 0, 79, 0, 77, 76, 74, 72, 71, 0, 67, 0], bass: [43, 0, 43, 50, 0, 43, 0, 50, 41, 0, 41, 48, 0, 41, 0, 48] },
};
function musTick() {
  if (!AC || !MUS.on || !dsave.music) return;
  const S = SONGS[MUS.track], sp = 60 / S.bpm / 4;
  while (MUS.next < AC.currentTime + 0.25) {
    const t = MUS.next, s = MUS.step, m = S.mel[s % S.mel.length], b = S.bass[s % S.bass.length];
    if (s % 8 === 0 || s % 8 === 3) tone(t, 'sine', 110, 45, 0.16, 0.12); // zabumba
    if (s % 8 === 6) noise(t, 0.06, 0.06, 1800);                           // bacalhau
    noise(t, 0.02, s % 2 ? 0.015 : 0.03, 9000);                             // triângulo
    if (b) tone(t, 'triangle', NOTE(b), 0, sp * 2.6, 0.07);
    if (m) tone(t, 'square', NOTE(m), 0, sp * 1.6, MUS.track === 'batalha' ? 0.035 : 0.028);
    MUS.next += sp; MUS.step++;
  }
}
function music(track) { MUS.track = track; if (!AC) return; if (!MUS.on) { MUS.on = true; MUS.next = AC.currentTime + 0.05; MUS.step = 0; } if (!MUS.timer) MUS.timer = setInterval(musTick, 90); }
addEventListener('pointerdown', () => { audioInit(); if (AC && !MUS.timer) music(MUS.track); }, { capture: true });

/* ---------- desenho ---------- */
function curFarm() { if (MODE === 'battle' && BAT) return BAT.def.farm || R.farm; if (MODE === 'peek' && PEEK) return R.rivals[PEEK].farm; if (R && MODE !== 'title') return R.farm; return DEMO; }
let lastT = performance.now(), acc = 0;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - lastT) / 1000)); lastT = now;
  const season = R ? R.season : 'chuva';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(makeBG(season), 0, 0);
  const farm = curFarm();
  if (farm) ctx.drawImage(farmLayer(farm, MODE !== 'battle', season), 0, 0);
  if (MODE === 'plan' || MODE === 'peek') drawLabels(farm, now / 1000);
  if (MODE === 'battle' && BAT) {
    acc += dt * SPEEDX; let n = 0; while (acc > 1 / 60 && n++ < 16) { stepBattle(BAT, 1 / 60); acc -= 1 / 60; }
    drawBattle(BAT, now / 1000); updBHud();
    if (BAT.over && !BAT.shown) { BAT.shown = 1; setTimeout(battleEnd, 900); }
  }
  requestAnimationFrame(frame);
}
function drawLabels(farm, t) {
  if (!farm) return;
  for (let k = 0; k < 25; k++) {
    const tt = farm.tiles[k]; if (!tt.c || tt.c === 'casa') continue; const c = CARDS[tt.c], [x, y] = tileCen(k);
    if (c.kind === 'tropa') drawNum(fmt(tt.troops), OX + x, OY + y - 6);
    if (tt.lvl > 1 || c.kind !== 'tropa') { ctx.fillStyle = '#07060f'; ctx.fillRect(OX + x - tt.lvl * 2 - 1, OY + y + (c.kind === 'tropa' ? 3 : 4), tt.lvl * 4 + 1, 4); ctx.fillStyle = '#f2c14e'; for (let l = 0; l < tt.lvl; l++) ctx.fillRect(OX + x - tt.lvl * 2 + l * 4, OY + y + (c.kind === 'tropa' ? 4 : 5), 3, 2); }
    if (tt.bless.length) { ctx.fillStyle = '#07060f'; ctx.fillRect(OX + x + 12, OY + y - 9, 5, 5); ctx.fillStyle = '#7fb2e5'; ctx.fillRect(OX + x + 13, OY + y - 8, 3, 3); }
  }
  if (MODE !== 'plan') return;
  const pulse = 0.55 + Math.sin(t * 6) * 0.35;
  if (SEL) { const cid = selCard(); for (let k = 0; k < 25; k++) if (canPlay(R.farm, cid, k) && CARDS[cid].tipo !== 'decreto' || (CARDS[cid].tgt && canPlay(R.farm, cid, k))) drawDiamond(k, '#f2c14e', pulse); }
  if (MOVE != null) { drawDiamond(MOVE, '#ffffff', 1); for (let k = 0; k < 25; k++) if (!R.farm.tiles[k].c) drawDiamond(k, '#7fb2e5', pulse); }
  if (INFO >= 0) drawDiamond(INFO, '#ffffff', 0.9);
}

/* ---------- título ---------- */
function demoFarm() { const f = newFarm('coronel'), t = f.tiles; const put = (k, c, tr, l) => { t[k].c = c; t[k].lvl = l || 1; t[k].troops = tr || 0; }; put(7, 'vaqueiros', 340, 2); put(11, 'fogueira', 0, 1); put(13, 'jaguncos', 180); put(6, 'capela'); put(17, 'roca'); put(8, 'catavento'); put(16, 'galinheiro', 90); put(18, 'vigia'); return f; }
function goTitle() {
  MODE = 'title'; R = null; vis('hud', false); vis('plan', false); vis('bhud', false); DEMO = DEMO || demoFarm();
  document.getElementById('t-cont').classList.toggle('hidden', !dsave.run);
  document.getElementById('t-foot').textContent = `${DLC_VERSION} · Glória: ${dsave.glory} · senhores liberados: ${LORD_ORDER.filter(l => dsave.unl[l]).length}/10`;
  show('title'); music('plano');
}
document.getElementById('t-new').onclick = () => { snd('click'); goLords(); };
document.getElementById('t-cont').onclick = () => { snd('click'); R = dsave.run; enterPlan(true); };
document.getElementById('t-back').onclick = () => { location.href = '../'; };
document.getElementById('t-tree').onclick = () => { snd('click'); renderTree(); show('tree'); };
document.getElementById('t-recs').onclick = () => { snd('click'); renderRecs(); show('recs'); };
document.getElementById('tree-back').onclick = document.getElementById('recs-back').onclick = () => { snd('click'); show('title'); };

/* ---------- escolha do senhor ---------- */
function goLords() {
  const g = document.getElementById('lordgrid'); g.innerHTML = '';
  for (const id of LORD_ORDER) { const b = document.createElement('button'); b.className = 'lt' + (dsave.unl[id] ? '' : ' lock') + (id === LORDSEL ? ' on' : ''); b.innerHTML = `<img src="${portraitOf(id)}" alt="">`; b.onclick = () => { snd('click'); LORDSEL = id; goLords(); }; g.appendChild(b); }
  const L = LORDS[LORDSEL], ok = dsave.unl[LORDSEL], rec = dsave.recs[LORDSEL];
  const d = document.getElementById('lorddet');
  d.innerHTML = ok ? `<div class="lname">${L.nome}</div><div><b>Passivo:</b> ${L.passivo}</div><div><b>${L.poder.nome}:</b> ${L.poder.txt}</div><div class="chips">${L.cartas.map(c => `<span class="chip">${CARDS[c].nome}</span>`).join('')}</div>
    <div style="color:var(--dim)">${rec ? `Recorde: ano ${rec.year} · ${rec.wins} vitória(s)` : 'Sem recorde ainda'}</div>
    <div class="diff"><button data-d="normal" class="${DIF === 'normal' ? 'on' : ''}">Normal</button><button data-d="pesadelo" class="${DIF === 'pesadelo' ? 'on' : ''}" ${dsave.pesadelo ? '' : 'disabled'}>Pesadelo${dsave.pesadelo ? '' : ' (vença 1 vez)'}</button></div>`
    : `<div class="lname">???</div><div>${L.secreto ? 'Derrote os oito senhores numa mesma partida, ou vença no Pesadelo.' : `Derrote ${L.nome} numa partida para jogar com ele.`}</div>`;
  $$('#lorddet .diff button').forEach(b => b.onclick = () => { if (b.disabled) return; DIF = b.dataset.d; goLords(); });
  document.getElementById('l-go').disabled = !ok;
  show('lords');
}
document.getElementById('l-back').onclick = () => { snd('click'); show('title'); };
document.getElementById('l-go').onclick = () => { snd('click'); RNG = Math.random; newRun(LORDSEL, DIF); cutscene(LORDSEL, LORDS[LORDSEL].nome, LORDS[LORDSEL].fala, () => enterPlan()); };

/* ---------- cutscene ---------- */
function cutscene(key, name, lines, done) {
  hideAll(); show('cut'); document.getElementById('cutimg').src = LORDS[key] ? portraitOf(key) : portrait(key);
  document.getElementById('cutname').textContent = name; CUT = { lines, i: 0, ch: 0, done, timer: null }; typeLine();
}
function typeLine() { const el = document.getElementById('cuttxt'); clearInterval(CUT.timer); CUT.ch = 0; const s = CUT.lines[CUT.i]; CUT.timer = setInterval(() => { CUT.ch++; el.textContent = s.slice(0, CUT.ch); if (CUT.ch % 3 === 0) snd('click'); if (CUT.ch >= s.length) clearInterval(CUT.timer); }, 28); }
function cutNext() { const s = CUT.lines[CUT.i]; if (CUT.ch < s.length) { CUT.ch = s.length; clearInterval(CUT.timer); document.getElementById('cuttxt').textContent = s; return; } if (++CUT.i < CUT.lines.length) typeLine(); else cutEnd(); }
function cutEnd() { clearInterval(CUT.timer); const d = CUT.done; CUT = null; hideAll(); d(); }
document.getElementById('cut-next').onclick = cutNext; document.getElementById('cut-skip').onclick = cutEnd;
document.getElementById('s-cut').addEventListener('pointerdown', e => { if (e.target.tagName !== 'BUTTON') cutNext(); });

/* ---------- planejamento ---------- */
function enterPlan(resume) {
  MODE = 'plan'; SEL = null; MOVE = null; INFO = -1; PEEK = null; hideAll(); vis('hud', true); vis('plan', true); vis('bhud', false); vis('tileinfo', false);
  music('plano'); renderPlan();
  const news = [];
  if (!resume && R.log && R.log.length) news.push(...R.log);
  if (R.year > 1 && (R.year - 1) % 4 === 0 && !resume) news.push(`Começou a <b>${R.season === 'seca' ? 'seca' : 'época de chuva'}</b>: ${R.season === 'seca' ? 'tropas crescem menos, fogo queima mais.' : 'tropas crescem 15% mais.'}`);
  if (R.event && !resume) { const ev = EVENTS.find(e => e.id === R.event); news.push(`<b>${ev.nome}!</b> ${ev.txt}`); }
  if (isMoon(R.year) && !resume) news.push('Noite de <b>lua cheia</b> este ano.');
  if (news.length) showNews('Ano ' + R.year, news);
}
function showNews(title, lines, then) { document.getElementById('news-t').textContent = title; document.getElementById('news').innerHTML = lines.map(l => `<div>${l}</div>`).join(''); show('news'); NEWSDONE = then || null; }
let NEWSDONE = null;
document.getElementById('news-ok').onclick = () => { snd('click'); hideAll(); const f = NEWSDONE; NEWSDONE = null; if (f) f(); };
const selCard = () => SEL ? (SEL.src === 'hand' ? R.hand[SEL.i] : R.reserve[SEL.i]) : null;
function cardHTML(cid, extra) {
  const c = CARDS[cid], cls = c.tipo === 'decreto' && c.when === 'batalha' ? 't-batalha' : c.kind === 'torre' ? 't-torre' : 't-' + c.tipo;
  return `<div class="card ${cls} r-${c.rar} ${extra || ''}"><div class="ch"><span class="cn">${c.nome}</span><span class="ct">${c.tipo === 'decreto' && c.when === 'batalha' ? 'BATALHA' : c.kind === 'torre' ? 'TORRE' : TIPON[c.tipo]}</span></div><img class="ca" src="${cardArt(cid)}" alt="" title="${c.terr ? 'Melhor em ' + TERRN[c.terr] : ''}"><div class="cd">${c.desc}</div>${c.terr && c.tipo === 'lote' ? `<span class="tr">${TERRN[c.terr]}</span>` : ''}</div>`;
}
function renderPlan() {
  document.getElementById('h-rap').textContent = R.rap; document.getElementById('rapico').src = icoURL('rapGrande');
  document.getElementById('h-casab').style.width = Math.max(0, R.casa / R.casaMax * 100) + '%'; document.getElementById('h-casa').textContent = `Casa-grande ${Math.max(0, R.casa)}/${R.casaMax}`;
  const yt = yearType(R.year), ev = R.event ? EVENTS.find(e => e.id === R.event).nome : '';
  const what = yt === 'defesa' ? `${LORDS[R.sched[R.year]] ? LORDS[R.sched[R.year]].nome + ' ataca' : 'paz'}` : yt === 'ataque' ? 'sua vez de atacar' : yt === 'boss' ? bossOf(R.year).nome + '!' : 'ano de paz';
  document.getElementById('h-year').innerHTML = `ANO ${R.year}${R.year <= ANOS ? '/' + ANOS : ''} <small>· ${what}${ev ? ' · ' + ev : ''}${isMoon(R.year) ? ' · lua cheia' : ''}</small>`;
  const tl = document.getElementById('timeline'); tl.innerHTML = '';
  for (let y = R.year; y < R.year + 9; y++) {
    const k = yearType(y), d = document.createElement('div'); let src, cls = 'ts';
    if (k === 'defesa') { const a = attackerOf(y); src = a ? portraitOf(a) : icoURL('estrela'); if (!a) cls += ' ico'; }
    else if (k === 'boss') { src = portrait(bossOf(y).id); cls += ' boss'; }
    else if (k === 'ataque') { src = icoURL('i_facao'); cls += ' ico atk'; }
    else { src = icoURL('estrela'); cls += ' ico'; }
    if (y === R.year) cls += ' now'; d.className = cls; d.title = 'Ano ' + y; d.innerHTML = `<img src="${src}" alt="">`; tl.appendChild(d);
  }
  const h = document.getElementById('hand'); h.innerHTML = '';
  R.hand.forEach((cid, i) => { const w = document.createElement('div'); w.innerHTML = cardHTML(cid, (SEL && SEL.src === 'hand' && SEL.i === i ? 'sel' : '') + (R.played ? ' used' : '')); const el = w.firstChild;
    const t = R.farm.tiles.find(tt => tt.c === cid); if (t && CARDS[cid].tipo === 'lote') el.insertAdjacentHTML('beforeend', `<span class="lv">nível ${Math.min(5, t.lvl + 1)}</span>`);
    el.onclick = () => clickCard('hand', i); h.appendChild(el); });
  const rs = document.getElementById('reserve'); rs.innerHTML = ''; const slots = 1 + (hasT('bolso') ? 1 : 0);
  for (let i = 0; i < slots; i++) { const cid = R.reserve[i], s = document.createElement('div'); s.className = 'slot' + (cid ? ' full' : '') + (SEL && SEL.src === 'res' && SEL.i === i ? ' sel' : ''); s.textContent = cid ? CARDS[cid].nome : 'vazio'; if (cid) s.onclick = () => clickCard('res', i); rs.appendChild(s); }
  const pw = document.getElementById('b-power'); document.getElementById('powimg').src = portraitOf(R.lord); const cd = document.getElementById('powcd');
  cd.textContent = R.cd > 0 ? R.cd + ' ano' + (R.cd > 1 ? 's' : '') : ''; cd.style.display = R.cd > 0 ? 'flex' : 'none'; pw.classList.toggle('ready', R.cd === 0);
  const sw = document.getElementById('b-swap'); sw.textContent = R.swaps > 0 ? `Trocar (grátis)` : 'Trocar (2)'; sw.disabled = R.played || (R.swaps <= 0 && R.rap < 2);
  document.getElementById('b-keep').disabled = !SEL || SEL.src !== 'hand';
  const hc = healCost(); const hb = document.getElementById('b-heal'); hb.textContent = `Reformar (${hc})`; hb.disabled = R.rap < hc || R.casa >= R.casaMax || R.healed;
  const stuck = !R.played && ![...R.hand, ...R.reserve].some(c => anyTile(R.farm, c));
  document.getElementById('b-end').disabled = !R.played && !stuck;
  document.getElementById('b-end').textContent = yt === 'ataque' ? 'Atacar ▸' : yt === 'paz' ? 'Fim do ano ▸' : 'Batalha ▸';
  hint();
}
const healCost = () => 6 + 2 * (R.heals || 0);
function hint() {
  let s = '';
  if (MOVE != null) s = 'Toque num lote vazio para mudar de lugar';
  else if (SEL) { const c = CARDS[selCard()]; s = c.tipo === 'lote' ? 'Toque num lote vazio (ou igual, para subir de nível)' : c.tipo === 'bencao' ? 'Toque num lote seu para abençoar' : c.tgt ? 'Toque no lote alvo' : 'Toque na carta de novo para usar'; }
  else if (!R.played) s = 'Escolha uma carta para jogar este ano';
  document.getElementById('hint').textContent = s;
}
function clickCard(src, i) {
  if (R.played && src === 'hand') { SEL = SEL && SEL.src === src && SEL.i === i ? null : { src, i }; snd('click'); renderPlan(); return; }
  if (R.played && src === 'res') { snd('click'); return; }
  snd('card'); MOVE = null; INFO = -1; vis('tileinfo', false);
  if (SEL && SEL.src === src && SEL.i === i) { const cid = selCard(), c = CARDS[cid]; if (c.tipo === 'decreto' && !c.tgt) { doPlay(-1); return; } SEL = null; }
  else SEL = { src, i };
  renderPlan();
}
function doPlay(idx) {
  const cid = selCard(), c = CARDS[cid]; if (c.tipo !== 'decreto' || c.tgt) { if (!canPlay(R.farm, cid, idx)) return; }
  const r = playCard(R.farm, cid, idx, 'player');
  if (SEL.src === 'hand') R.hand.splice(SEL.i, 1); else R.reserve.splice(SEL.i, 1);
  R.played = true; SEL = null; snd(r === 'lvl' ? 'lvl' : r === 'fx' ? 'coin' : 'place');
  if (r === 'fx' && c.when === 'batalha') flashHint('Decreto armado para a próxima batalha');
  persistRun(); renderPlan();
}
function flashHint(s) { const h = document.getElementById('hint'); h.textContent = s; clearTimeout(flashHint.t); flashHint.t = setTimeout(hint, 1800); }
function persistRun() { dsave.run = R; persistD(); }
document.getElementById('b-swap').onclick = () => { if (R.played) return; if (R.swaps > 0) R.swaps--; else { if (R.rap < 2) return; R.rap -= 2; } R.hand = drawCards(R.deck, 3); SEL = null; snd('card'); persistRun(); renderPlan(); };
document.getElementById('b-keep').onclick = () => { if (!SEL || SEL.src !== 'hand') return; const slots = 1 + (hasT('bolso') ? 1 : 0), cid = R.hand.splice(SEL.i, 1)[0]; if (R.reserve.length >= slots) R.hand.push(R.reserve.shift()); R.reserve.push(cid); SEL = null; snd('click'); persistRun(); renderPlan(); };
document.getElementById('b-heal').onclick = () => { const c = healCost(); if (R.rap < c || R.healed) return; R.rap -= c; R.heals = (R.heals || 0) + 1; R.healed = true; R.casa = Math.min(R.casaMax, R.casa + 20); snd('coin'); persistRun(); renderPlan(); };
document.getElementById('b-power').onclick = () => { snd('click'); flashHint(`${LORDS[R.lord].poder.nome}: ${LORDS[R.lord].poder.txt} ${R.cd ? '(volta em ' + R.cd + ')' : '(use na batalha)'}`); };
document.getElementById('b-pause').onclick = () => { snd('click'); pauseOpen(); };
document.getElementById('b-rivais').onclick = () => { snd('click'); openRivais(); };
cv.addEventListener('pointerdown', e => {
  if (MODE !== 'plan') return; const [x, y] = toLayout(e.clientX, e.clientY), k = pickTile(x, y);
  if (MOVE != null) { if (k >= 0 && !R.farm.tiles[k].c && R.rap >= 1) { const a = R.farm.tiles[MOVE], b = R.farm.tiles[k]; for (const f of ['c', 'lvl', 'troops', 'bless']) { const tmp = a[f]; a[f] = b[f]; b[f] = tmp; } a.bless = []; R.rap -= 1; snd('place'); persistRun(); } MOVE = null; INFO = -1; vis('tileinfo', false); renderPlan(); return; }
  if (SEL) { if (k >= 0) doPlay(k); return; }
  if (k >= 0 && R.farm.tiles[k].c) { INFO = k; showInfo(k); } else { INFO = -1; vis('tileinfo', false); }
  renderPlan();
});
function showInfo(k) {
  const t = R.farm.tiles[k], el = document.getElementById('tileinfo'); vis('tileinfo', true);
  if (t.c === 'casa') { el.innerHTML = `<b>Casa-grande</b><div>Vida ${R.casa}/${R.casaMax}. Se cair, o reinado acaba.</div><div>Atira flechas nos invasores.</div>`; return; }
  const inf = tileInfo(R.farm, k, R.year), c = inf.c, m = inf.m, pct = v => (v > 0 ? '+' : '') + Math.round(v * 100) + '%';
  const bits = []; if (m.hp) bits.push('vida ' + pct(m.hp)); if (m.dmg) bits.push('dano ' + pct(m.dmg)); if (m.spd) bits.push('vel. ' + pct(m.spd)); if (m.grow) bits.push('cresce ' + pct(m.grow)); if (m.slow) bits.push('deixa lento'); if (m.burn) bits.push('queima'); if (m.stealth) bits.push('invisível');
  el.innerHTML = `<b>${c.nome}</b> · nível ${t.lvl}<div>${TERRN[t.t]}${inf.tb > 1 ? ' (bônus de terreno)' : ''}</div>${c.kind === 'tropa' ? `<div>${fmt(t.troops)} ${UNITS[c.unit].nome.toLowerCase()} · +${fmt(c.grow * lvlMul(t.lvl) * inf.tb * growMul(R.farm, k))}/ano</div>` : ''}${inf.rap ? `<div>+${Math.round(inf.rap)} rapadura/ano</div>` : ''}${bits.length ? `<div>${bits.join(' · ')}</div>` : ''}${t.bless.length ? `<div style="color:#7fb2e5">${t.bless.map(b => CARDS[b].nome).join(', ')}</div>` : ''}<button class="btn ghost" id="b-move" ${R.rap < 1 ? 'disabled' : ''}>Mover (1)</button>`;
  document.getElementById('b-move').onclick = ev => { ev.stopPropagation(); MOVE = k; vis('tileinfo', false); snd('click'); renderPlan(); };
}

/* ---------- seguir: batalha do ano ---------- */
document.getElementById('b-end').onclick = () => {
  if (!R.played && !document.getElementById('b-end').disabled) R.played = true; if (!R.played) return; snd('click'); SEL = null; INFO = -1; vis('tileinfo', false);
  const y = R.year, k = yearType(y);
  if (k === 'paz') { R.rap += 2; return afterYear(null, { won: true, kind: 'paz', rap: 2 }); }
  if (k === 'defesa') { const rid = R.sched[y]; if (!rid) return afterYear(null, { won: true, kind: 'paz' }); const r = R.rivals[rid]; if (!r.met) { r.met = true; return cutscene(rid, LORDS[rid].nome, [LORDS[rid].fala[0], 'Vim tomar a sua Casa-grande!'], () => startBattle('defesa', rid)); } return startBattle('defesa', rid); }
  if (k === 'boss') { const b = bossOf(y); return cutscene(b.id, b.nome, [b.fala], () => startBattle('boss')); }
  openRaid();
};
function openRaid() {
  RAIDSEL = null; const l = document.getElementById('raidlist'); l.innerHTML = '';
  for (const id of R.order) { const r = R.rivals[id], d = document.createElement('button'); d.className = 'riv' + (r.lives <= 0 ? ' dead' : '');
    const pw = farmPower(r.farm, rivalMul(R.year), R.year), mine = farmPower(R.farm, 1, R.year), ratio = pw / Math.max(1, mine);
    d.innerHTML = `<img src="${portraitOf(id)}" alt=""><span>${LORDS[id].nome}</span><span class="hearts">${'♥'.repeat(Math.max(0, r.lives))}</span><span style="color:${ratio > 1.2 ? '#ff8a7a' : ratio < 0.8 ? '#a8e88a' : '#f2c14e'}">${r.lives <= 0 ? 'derrotado' : ratio > 1.2 ? 'mais forte' : ratio < 0.8 ? 'mais fraco' : 'parelho'}</span>`;
    if (r.lives > 0) d.onclick = () => { snd('click'); RAIDSEL = id; $$('#raidlist .riv').forEach(x => x.classList.remove('on')); d.classList.add('on'); document.getElementById('raid-go').disabled = false; };
    l.appendChild(d); }
  document.getElementById('raid-go').disabled = true; show('raid');
}
document.getElementById('raid-rest').onclick = () => { snd('coin'); hideAll(); R.rap += 4; afterYear(null, { won: true, kind: 'paz', rap: 4 }); };
document.getElementById('raid-go').onclick = () => { if (!RAIDSEL) return; snd('click'); hideAll(); startBattle('ataque', RAIDSEL); };

function startBattle(kind, rid) {
  BAT = yearBattle(kind, rid); BKIND = kind; BRID = rid || null; MODE = 'battle'; acc = 0;
  vis('hud', false); vis('plan', false); vis('bhud', true); hideAll(); music('batalha'); snd('horn');
  const ps = sideOf(BAT, 'player'), other = kind === 'boss' ? bossOf(R.year) : null;
  const sideInfo = s => s === ps ? { nome: LORDS[R.lord].nome, img: portraitOf(R.lord) } : other ? { nome: other.nome, img: portrait(other.id) } : { nome: LORDS[rid].nome, img: portraitOf(rid) };
  const a = sideInfo(ps), b = sideInfo(1 - ps);
  document.getElementById('bn0').textContent = a.nome; document.getElementById('bpi0').src = a.img; document.getElementById('bn1').textContent = b.nome; document.getElementById('bpi1').src = b.img;
  document.getElementById('byear').textContent = 'ANO ' + R.year;
  BAT.ui = { ps };
  const bp = document.getElementById('b-bpow'); bp.textContent = LORDS[R.lord].poder.nome; bp.disabled = R.cd > 0;
  const bd = document.getElementById('b-bdec'); bd.innerHTML = '';
  R.reserve.forEach((cid, i) => { const c = CARDS[cid]; if (c.tipo !== 'decreto' || c.when !== 'batalha') return; const b2 = document.createElement('button'); b2.className = 'btn red'; b2.textContent = c.nome; b2.onclick = () => { if (BAT.over) return; useBattleFx(BAT, ps, c.fx); R.reserve.splice(R.reserve.indexOf(cid), 1); b2.remove(); snd('power'); }; bd.appendChild(b2); });
  $$('#spd button').forEach(b2 => b2.classList.toggle('on', +b2.dataset.s === SPEEDX));
}
$$('#spd button').forEach(b => b.onclick = () => { SPEEDX = +b.dataset.s; $$('#spd button').forEach(x => x.classList.toggle('on', x === b)); snd('click'); });
document.getElementById('b-bpow').onclick = () => { if (!BAT || BAT.over || R.cd > 0) return; useBattleFx(BAT, BAT.ui.ps, LORDS[R.lord].poder.fx); R.cd = powerCd(); BAT.powerUsed[BAT.ui.ps] = true; document.getElementById('b-bpow').disabled = true; snd('power'); };
let lastKills = 0, lastProj = 0;
function updBHud() {
  const ps = BAT.ui.ps, p0 = powerLeft(BAT, ps) / Math.max(1, BAT.init[ps]), p1 = powerLeft(BAT, 1 - ps) / Math.max(1, BAT.init[1 - ps]);
  document.getElementById('bb0').style.width = Math.min(100, p0 * 100) + '%'; document.getElementById('bb1').style.width = Math.min(100, p1 * 100) + '%';
  document.getElementById('btime').textContent = Math.max(0, 50 - Math.floor(BAT.t)) + 's';
  const k = BAT.kills[0] + BAT.kills[1]; if (k > lastKills) { snd('hit'); lastKills = k; }
  if (BAT.projs.length > lastProj) snd(BAT.projs[BAT.projs.length - 1].kind === 'brasa' ? 'fire' : 'shot'); lastProj = BAT.projs.length;
}
function battleEnd() {
  const out = settleBattle(BAT, BKIND, BRID); lastKills = 0;
  const t = document.getElementById('res-t'), b = document.getElementById('res-b'), ch = document.getElementById('res-choice'); ch.innerHTML = '';
  snd(out.won ? 'win' : 'lose');
  const foe = BKIND === 'boss' ? bossOf(R.year).nome : LORDS[BRID].nome;
  if (BKIND === 'ataque') { t.textContent = out.won ? 'Vitória!' : 'O ataque falhou'; b.innerHTML = out.won ? `${foe} perdeu uma vida. +${out.rap} rapaduras.${out.defeated ? `<br><b style="color:var(--acc)">${foe} foi derrotado!</b>` : ''}<br>Escolha uma carta para roubar:` : `${foe} segurou a fazenda dele.`; }
  else { t.textContent = out.won ? 'A fazenda resistiu!' : 'Invadiram a fazenda'; b.innerHTML = out.won ? `${foe} recuou. +${out.rap} rapaduras.` : `A Casa-grande perdeu ${out.casaLost} de vida.`; }
  const okb = document.getElementById('res-ok');
  if (out.steal) { okb.classList.add('hidden'); out.steal.forEach(cid => { const w = document.createElement('div'); w.innerHTML = cardHTML(cid); const el = w.firstChild; el.onclick = () => { R.deck.push(cid); snd('steal'); okb.classList.remove('hidden'); ch.innerHTML = ''; b.innerHTML += `<br>${CARDS[cid].nome} entrou no seu baralho.`; }; ch.appendChild(el); }); }
  else okb.classList.remove('hidden');
  if (out.defeated && !dsave.unl[BRID]) { dsave.unl[BRID] = 1; b.innerHTML += `<br>Agora você pode jogar com ${foe}!`; }
  if (alive().length === 0 && !dsave.unl.anhanga) { dsave.unl.anhanga = 1; b.innerHTML += '<br><b style="color:var(--acc)">Anhangá, o senhor secreto, foi liberado!</b>'; }
  persistD();
  show('res'); RESOUT = out;
}
let RESOUT = null;
document.getElementById('res-ok').onclick = () => { snd('click'); hideAll(); afterYear(BAT, RESOUT); };
function afterYear(B, out) {
  BAT = null; vis('bhud', false); R.healed = false;
  const e = endYear(out && out.won ? 'win' : 'loss');
  if (e === 'segue') return enterPlan();
  endRun(e);
}
function endRun(e) {
  MODE = 'title'; vis('hud', false); vis('plan', false);
  const won = e === 'vitoria', def = R.stats.defeated.length;
  const glory = Math.round((Math.min(R.year, 60) + 4 * def + (won ? 25 : 0)) * (R.dif === 'pesadelo' ? 1.5 : 1));
  dsave.glory += glory;
  const rec = dsave.recs[R.lord] || { year: 0, wins: 0, best: 0 }; rec.year = Math.max(rec.year, R.year); if (won) rec.wins++; rec.best = Math.max(rec.best, Math.round(farmPower(R.farm, 1, R.year))); dsave.recs[R.lord] = rec;
  if (won && !dsave.pesadelo) dsave.pesadelo = 1;
  if (won && R.dif === 'pesadelo') dsave.unl.anhanga = 1;
  document.getElementById('end-t').textContent = won ? 'O sertão é seu!' : e === 'fim' ? 'O reinado sobreviveu' : 'A Casa-grande caiu';
  document.getElementById('end-b').innerHTML = `${LORDS[R.lord].nome} · ano ${R.year} · ${def} senhor(es) derrotado(s) · ${R.stats.wins} vitórias<br>+${glory} de glória para a Árvore do Engenho${won && dsave.pesadelo === 1 && R.dif === 'normal' ? '<br>Modo Pesadelo liberado!' : ''}`;
  document.getElementById('end-inf').classList.toggle('hidden', !won);
  if (!won) dsave.run = null; persistD();
  show('end'); snd(won ? 'win' : 'lose');
}
document.getElementById('end-inf').onclick = () => { R.infinite = true; R.year++; startYear(); snd('click'); enterPlan(); };
document.getElementById('end-ok').onclick = () => { snd('click'); dsave.run = null; persistD(); goTitle(); };

/* ---------- rivais (espiar) ---------- */
function openRivais(sel) {
  MODE = 'peek'; PEEK = sel || PEEK || R.order.find(id => R.rivals[id].lives > 0) || R.order[0];
  vis('hud', false); vis('plan', false);
  const l = document.getElementById('rivlist'); l.innerHTML = '';
  for (const id of R.order) { const r = R.rivals[id], d = document.createElement('button'); d.className = 'riv' + (r.lives <= 0 ? ' dead' : '') + (id === PEEK ? ' on' : ''); d.innerHTML = `<img src="${portraitOf(id)}" alt=""><span>${LORDS[id].nome}</span><span class="hearts">${r.lives > 0 ? '♥'.repeat(r.lives) : 'derrotado'}</span>`; d.onclick = () => { snd('click'); openRivais(id); }; l.appendChild(d); }
  const L = LORDS[PEEK], r = R.rivals[PEEK];
  document.getElementById('rivdet').innerHTML = `<div style="font-size:1.3em;color:var(--moon)">${L.nome}</div><div><b style="color:var(--acc);font-weight:400">Passivo:</b> ${L.passivo}</div><div><b style="color:var(--acc);font-weight:400">${L.poder.nome}:</b> ${L.poder.txt}</div><div style="color:var(--dim)">Força: ${fmt(farmPower(r.farm, rivalMul(R.year), R.year))} · a sua: ${fmt(farmPower(R.farm, 1, R.year))}</div>`;
  show('rivais');
}
document.getElementById('riv-close').onclick = () => { snd('click'); MODE = 'plan'; PEEK = null; hideAll(); vis('hud', true); vis('plan', true); renderPlan(); };

/* ---------- pausa ---------- */
function pauseOpen() { document.getElementById('p-sound').textContent = 'Som: ' + (dsave.sound ? 'sim' : 'não'); document.getElementById('p-music').textContent = 'Música: ' + (dsave.music ? 'sim' : 'não'); show('pause'); }
document.getElementById('p-cont').onclick = () => { snd('click'); hideAll(); };
document.getElementById('p-sound').onclick = () => { dsave.sound = dsave.sound ? 0 : 1; persistD(); pauseOpen(); };
document.getElementById('p-music').onclick = () => { dsave.music = dsave.music ? 0 : 1; persistD(); if (dsave.music && AC) MUS.next = AC.currentTime + 0.05; pauseOpen(); };
document.getElementById('p-quit').onclick = () => { snd('click'); persistRun(); goTitle(); };

/* ---------- árvore e recordes ---------- */
function renderTree() {
  document.getElementById('tree-g').textContent = `Glória: ${dsave.glory} · ganhe glória em cada reinado`;
  const el = document.getElementById('tree'); el.innerHTML = '';
  for (const n of TREE) { const own = hasT(n.id), req = !n.req || hasT(n.req), can = !own && req && dsave.glory >= n.custo, b = document.createElement('button');
    b.className = 'node' + (own ? ' own' : can ? ' can' : !req ? ' lock' : ''); b.innerHTML = `<b>${n.nome}</b><span>${n.txt}</span><span style="color:${own ? 'var(--green)' : 'var(--acc)'}">${own ? 'comprado' : n.custo + ' de glória' + (req ? '' : ' · precisa de ' + TREE.find(x => x.id === n.req).nome)}</span>`;
    b.onclick = () => { if (!can) return; dsave.glory -= n.custo; dsave.tree[n.id] = 1; persistD(); snd('coin'); renderTree(); }; el.appendChild(b); }
}
function renderRecs() { document.getElementById('recs').innerHTML = '<tr><th>Senhor</th><th>Melhor ano</th><th>Vitórias</th><th>Força máx.</th></tr>' + LORD_ORDER.filter(l => dsave.unl[l]).map(l => { const r = dsave.recs[l] || { year: '-', wins: 0, best: '-' }; return `<tr><td>${LORDS[l].nome}</td><td>${r.year}</td><td>${r.wins}</td><td>${typeof r.best === 'number' ? fmt(r.best) : r.best}</td></tr>`; }).join(''); }

/* ---------- início ---------- */
addEventListener('resize', resizeView);
resizeView(); goTitle(); requestAnimationFrame(frame);
