'use strict';
/* ---------------- HUD e telas ---------------- */
let hudCache = {};
function setText(id, v) { if (hudCache[id] !== v) { hudCache[id] = v; $(id).textContent = v; } }
function fmt(t) { t = Math.floor(t); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
function updHUD() {
  $('#xpfill').style.width = (player.xp / player.next * 100).toFixed(1) + '%';
  setText('#lvl', 'Nv ' + player.level); setText('#timer', fmt(Math.min(G.time, RUN)));
  setText('#kills', G.kills + (G.kills === 1 ? ' abate' : ' abates')); setText('#hud-rap', String(G.rap));
  const bf = G.nm ? ['Pesadelo'] : []; if (G.buff > 0) bf.push('Fogo ' + Math.ceil(G.buff) + 's'); if (G.ride > 0) bf.push('Carona ' + Math.ceil(G.ride) + 's'); if (G.confuse > 0) bf.push('Confuso'); if (G.slow > 0) bf.push('Lento');
  if (G.altar) bf.push(G.altar.short + ' ' + Math.ceil(G.altar.t) + 's'); if (G.cang > 0) bf.push('Cangaceiro ' + Math.ceil(G.cang) + 's'); if (G.inf) bf.push('Infinito'); { const dv = defV(); if (dv) bf.push('Moradores ' + Math.ceil(dv.def) + 's'); } if (G.farinha > 0) bf.push('Farinha ' + Math.ceil(G.farinha) + 's'); if (G.stun > 0) bf.push('Preso'); if (G.giant > 0) bf.push('Gigante ' + Math.ceil(G.giant) + 's'); if (G.finalT > 0) bf.push('Forma final ' + Math.ceil(G.finalT) + 's'); if (G.sand) bf.push('Areia'); if (G.moon > 0) bf.push('Lua cheia ' + Math.ceil(G.moon) + 's'); if (G.esp > 0) bf.push('Espora +' + Math.round(G.esp) + '%');
  setText('#buffs', bf.join(' '));
  const cdMax = CHARS[player.char].abCd * (1 - 0.15 * (player.pass.cuia || 0)), cdk = Math.max(0, G.abCd) / cdMax; $('#abil-cd').style.height = (cdk * 100).toFixed(0) + '%'; $('#abil').classList.toggle('cool', cdk > 0);
  const b = G.boss && G.boss.alive ? G.boss : null; $('#bossbar').style.display = b ? 'block' : 'none';
  if (b) { setText('#bossname', b.bossName); $('#bossfill').style.width = Math.max(0, b.hp / b.maxHp * 100) + '%'; }
  const nb = b || G.dawn ? null : BOSSES.find(x => !G.bossDone[x.type] && x.t > G.time); setText('#nextboss', nb && nb.t - G.time < 90 && !G.inf ? 'Chefão em ' + fmt(nb.t - G.time) : '');
}
function hud(on) { $('#hud').classList.toggle('hidden', !on); hudCache = {}; }
function refreshSlots() {
  $('#abil-name').textContent = CHARS[player.char].abName;
  const fz = new Set(); for (const fu of FUSIONS) { const A = player.weapons.find(w => w.id === fu.a && w.ev), B = player.weapons.find(w => w.id === fu.b && w.ev); if (A && B) { fz.add(fu.a); fz.add(fu.b); } }
  $('#wslots').innerHTML = player.weapons.map(w => `<div class="slot${w.ev ? ' ev' : ''}${save.gold[w.id] ? ' gold' : ''}${fz.has(w.id) ? ' fz' : ''}" title="${w.ev ? WEAPONS[w.id].evoName : WEAPONS[w.id].name}"><img src="${icon(w.id)}" alt=""><i>${w.ev ? '★' : w.lvl}</i></div>`).join('');
  $('#pslots').innerHTML = Object.entries(player.pass).map(([k, l]) => `<div class="slot${PASSIVES[k].cursed ? ' cursed' : ''}" title="${PASSIVES[k].name}"><img src="${icon(k)}" alt=""><i>${l}</i></div>`).join('');
}
function show(name) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('on', s.id === 's-' + name)); }
function hideScreens() { document.querySelectorAll('.screen').forEach(s => s.classList.remove('on')); }
let toastT = 0, bannerT = 0;
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('on'), 2400); }
const bq = [];
function banner(t) { bq.push(t); if (bq.length === 1) nextBanner(); }
function nextBanner() { const el = $('#banner'); if (!bq.length) return; el.textContent = bq[0]; el.classList.add('on'); bannerT = setTimeout(() => { el.classList.remove('on'); bq.shift(); bannerT = setTimeout(nextBanner, 300); }, 2000); }
function refreshRap() { document.querySelectorAll('.rapn').forEach(e => e.textContent = save.rap); }
function unlockAch(id) {
  if (save.ach[id]) return; save.ach[id] = true; save.rap += ACH[id].rap || 0;
  if (id === 'noite5') save.chars.pescador = true;
  if (id === 'lobisomem') save.chars.forrozeira = true;
  if (id === 'amanhecer') save.chars.benzedeira = true;
  persist(); toast('Conquista: ' + ACH[id].name); sfx('coin');
}
function goto(name) {
  sfx('ui');
  if (name === 'menu') { mode = 'menu'; hud(false); renderMenu(); }
  else if (name === 'chars') { mode = 'chars'; renderChars(); }
  else if (name === 'shop') { mode = 'shop'; renderShop(); }
  else if (name === 'ach') { mode = 'ach'; renderAch(); }
  else if (name === 'stats') { mode = 'stats'; renderStats(); }
  else if (name === 'figs') { mode = 'figs'; renderFigs(); }
  else if (name === 'notes') { mode = 'notes'; $('#notelist').innerHTML = NOTES.map(([v, ...ls]) => `<div class="panel item"><div class="tx"><b>${v}</b>${ls.map(l => `<span>• ${l}</span>`).join('')}</div></div>`).join(''); }
  refreshRap(); show(name);
}
function renderMenu() {
  const b = save.best; $('#rec').textContent = b.time ? `Recorde: ${fmt(b.time)}, nível ${b.level}, ${b.kills} abates` : 'A lua está alta. Boa sorte, cabra.';
  $('#btn-sound').textContent = save.sound ? 'Som ligado' : 'Som desligado';
  $('#tip').textContent = 'Dica: ' + TIPS[(Math.random() * TIPS.length) | 0];
  $('#ver').textContent = VERSION; $('#btn-joy').textContent = save.joyFix ? 'Joystick fixo' : 'Joystick solto';
  let er = null; try { er = JSON.parse(localStorage.getItem(ERR_KEY)); } catch (e) {}
  $('#btn-err').classList.toggle('hidden', !er);
  const d = loadRun(), bc = $('#btn-continue'); bc.classList.toggle('hidden', !d); if (d) bc.textContent = `Continuar a noite (${fmt(d.G.time)})`;
}
function renderChars() {
  const nb = $('#btn-nm'), nmOk = !!save.ach.amanhecer, gm = nmOk ? save.gmode : 'normal'; nb.classList.toggle('hidden', !nmOk);
  nb.textContent = gm === 'pesadelo' ? 'Modo Pesadelo: inimigos mais fortes, rapadura em dobro' : gm === 'infinito' ? 'Modo Infinito: a noite não acaba' : 'Modo Normal';
  nb.style.color = gm === 'pesadelo' ? 'var(--red)' : gm === 'infinito' ? 'var(--acc)' : '';
  const box = $('#charlist'); box.innerHTML = '';
  for (const id in CHARS) {
    const c = CHARS[id], ok = !!save.chars[id], el = document.createElement('div');
    const sk = SKINS[id], skOk = sk && save.ach[sk.ach], cur = !!(save.skin[id] && skOk);
    el.className = 'panel char' + (ok ? '' : ' locked');
    el.innerHTML = `<img class="cimg" src="${icon(cur ? id + '_skin' : id)}" alt=""><b>${c.name}</b><span>${WEAPONS[c.weapon].name} · nível ${clvl(id)}${clvl(id) < 10 ? '' : ' (máx.)'}</span><span>${c.bonus}</span><span>Habilidade: ${c.abName}</span><span class="pas">${CPAS[id]}</span>` +
      (ok ? `<button class="btn">Escolher</button>` : `<span class="lk">${c.unlockTxt} ou compre</span><button class="btn" ${save.rap < c.price ? 'disabled' : ''}>Comprar por ${c.price}</button>`) +
      (!ok || !sk ? '' : skOk ? `<button class="btn ghost skin">Visual: ${cur ? sk.name : 'Normal'}</button>` : `<span class="lk">${sk.name}: conquista "${ACH[sk.ach].name}"</span>`);
    const sb = el.querySelector('.skin'); if (sb) sb.onclick = () => { save.skin[id] = !cur; persist(); sfx('ui'); renderChars(); };
    el.querySelector('button').onclick = () => {
      if (ok) startRun(id);
      else if (save.rap >= c.price) { save.rap -= c.price; save.chars[id] = true; persist(); sfx('coin'); refreshRap(); renderChars(); }
    };
    box.appendChild(el);
  }
}
function renderShop() {
  const box = $('#shoplist'); box.innerHTML = '';
  const allUp = Object.keys(SHOP).every(id => (save.up[id] || 0) >= SHOP[id].max), allCh = Object.keys(CHARS).every(id => save.chars[id]), pr = save.prest || 0;
  { const el = document.createElement('div'); el.className = 'panel item' + (allUp && allCh ? '' : ' off');
    el.innerHTML = `<img src="${icon('estrela')}" alt=""><div class="tx"><b>Prestígio ${pr ? '(nível ' + pr + ')' : ''}</b><span>${pr ? `Bônus atual: +${pr * 5}% de dano e de XP. ` : ''}Com a loja completa e todos os personagens liberados, recomece a loja, os personagens, os bichinhos e a rapadura em troca de +5% de dano e de XP para sempre.</span></div><button class="btn small" ${allUp && allCh ? '' : 'disabled'}>Recomeçar</button>`;
    const bt = el.querySelector('button'); let armed = false;
    bt.onclick = () => { if (!armed) { armed = true; bt.textContent = 'Confirmar?'; setTimeout(() => { armed = false; bt.textContent = 'Recomeçar'; }, 3000); return; } save.prest = pr + 1; save.rap = 0; save.up = {}; save.chars = { vaqueiro: true }; save.pets = {}; save.pet = null; persist(); sfx('win'); toast('Prestígio ' + save.prest + '! +' + save.prest * 5 + '% de dano e XP para sempre.'); refreshRap(); renderShop(); };
    box.appendChild(el); }
  for (const id in SHOP) {
    const u = SHOP[id], l = save.up[id] || 0, max = l >= u.max, cost = u.base * (l + 1), el = document.createElement('div');
    el.className = 'panel item';
    el.innerHTML = `<img src="${icon(u.ico)}" alt=""><div class="tx"><b>${u.name}</b><span>${u.desc}</span></div><span class="pips">${'■'.repeat(l)}${'□'.repeat(u.max - l)}</span>` +
      `<button class="btn small" ${max || save.rap < cost ? 'disabled' : ''}>${max ? 'Completo' : cost}</button>`;
    el.querySelector('button').onclick = () => { if (!max && save.rap >= cost) { save.rap -= cost; save.up[id] = l + 1; persist(); sfx('coin'); refreshRap(); renderShop(); } };
    box.appendChild(el);
  }
  for (const id in PETS) {
    const pt = PETS[id], own = !!save.pets[id], on = save.pet === id, el = document.createElement('div');
    el.className = 'panel item';
    el.innerHTML = `<img src="${icon(id)}" alt=""><div class="tx"><b>Bichinho: ${pt.name}</b><span>${pt.desc}</span></div>` +
      `<button class="btn small" ${!own && save.rap < pt.price ? 'disabled' : ''}>${!own ? pt.price : on ? 'Deixar em casa' : 'Levar'}</button>`;
    el.querySelector('button').onclick = () => {
      if (!own) { if (save.rap < pt.price) return; save.rap -= pt.price; save.pets[id] = true; save.pet = id; sfx('coin'); }
      else { save.pet = on ? null : id; sfx('ui'); }
      persist(); refreshRap(); renderShop();
    };
    box.appendChild(el);
  }
}
const LENDAS = {
  morcego: 'Bichos da noite que acompanham as visagens pelo sertão.', vagalume: 'Luzinhas que, dizem, são almas pequenas procurando caminho.',
  saci: 'Menino de uma perna só e gorro vermelho que vive de pregar peças.', mula: 'Mulher amaldiçoada que vira mula de fogo nas noites de quinta para sexta.',
  curupira: 'Protetor da mata com os pés virados para trás, que confunde os caçadores.', urubu: 'Ave que ronda onde há assombração e carniça.',
  trapalhona: 'Visagem desastrada que mais atrapalha os outros do que assusta.', alma: 'Alma penada que vaga pelos vilarejos abandonados.',
  cabra: 'Cabra endiabrada das histórias de terreiro, que corre atrás de quem passa.', caipora: 'Dona da caça, montada no porco-do-mato, castiga quem caça demais.',
  iara: 'A Mãe-d\'Água canta na beira dos rios e açudes para atrair quem passa.', muricoca: 'O mosquito mais chato do sertão quando chove.',
  lambisgoia: 'Visagem alta e magra de braços compridos que alcança de longe.', velha: 'Mulher de branco que aparece na estrada e assombra com um grito.',
  porca: 'A porca encantada que sai à noite com seus sete leitões.', leitao: 'Um dos sete leitões da porca encantada.',
  cavaleiro: 'Cavaleiro que perdeu a cabeça e cavalga sem rumo nas noites escuras.', lobisomem: 'O sétimo filho homem que vira lobo nas noites de lua cheia.',
  paimato: 'Guardião antigo da floresta, que prende os intrusos com raízes.', mapinguari: 'Gigante peludo com a boca na barriga, que devora tudo pelo caminho.',
  corposeco: 'Homem tão ruim que nem a terra quis: secou e vaga assombrando.', cuca: 'A bruxa com cabeça de jacaré que pega as crianças que não dormem.',
  boitata: 'A cobra de fogo que protege os campos contra quem os queima.',
};
const iconK = {};
function iconBlack(k) { if (iconK[k]) return iconK[k]; const c = S[k].k, o = document.createElement('canvas'); o.width = c.width; o.height = c.height; const x = o.getContext('2d'); x.globalAlpha = 0.55; x.drawImage(c, 0, 0); return iconK[k] = o.toDataURL(); }
function figSpr(t) { return t === 'boitata' ? 'boitataHead' : EN[t].spr; }
function renderFigs() {
  const keys = Object.keys(LENDAS), got = keys.filter(k => save.figs[k]).length;
  $('#figs-sub').textContent = `${got} de ${keys.length} figurinhas. Derrote cada visagem pela primeira vez para liberar a dela.`;
  $('#figlist').innerHTML = keys.map(k => save.figs[k] ? `<div class="panel item"><img src="${icon(figSpr(k))}" alt="" style="width:32px;height:32px"><div class="tx"><b>${ENAMES[k] || k}</b><span>${LENDAS[k]}</span></div></div>` : `<div class="panel item off"><img src="${iconBlack(figSpr(k))}" alt="" style="width:32px;height:32px"><div class="tx"><b>???</b><span>Ainda não encontrada.</span></div></div>`).join('');
}
function renderStats() {
  const st = save.stats, top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0], n = v => Math.round(v).toLocaleString('pt-BR');
  const h = Math.floor(st.time / 3600), m = Math.floor(st.time % 3600 / 60), te = top(st.enemies), tw = top(st.weapons);
  const rows = [['Partidas', st.runs], ['Noites vencidas', st.wins], ['Tempo jogado', h ? `${h}h ${m}min` : `${m}min`], ['Inimigos derrotados', n(st.kills)],
    ['Inimigo mais derrotado', te ? `${ENAMES[te[0]] || te[0]} (${n(te[1])})` : 'Nenhum ainda'], ['Arma que mais causou dano', tw && WEAPONS[tw[0]] ? WEAPONS[tw[0]].name : 'Nenhuma ainda'],
    ['Recorde de tempo', save.best.time ? fmt(save.best.time) : 'Nenhum ainda'], ['Recorde de abates', n(save.best.kills)]];
  $('#statlist').innerHTML = rows.map(([k, v]) => `<div class="panel item"><div class="tx"><b>${v}</b><span>${k}</span></div></div>`).join('');
}
function renderAch() {
  $('#achlist').innerHTML = Object.entries(ACH).map(([id, a]) => `<div class="panel item ${save.ach[id] ? 'done' : 'off'}"><div class="tx"><b>${a.name}</b><span>${a.desc} ${a.reward}.</span></div><span>${save.ach[id] ? 'Feita' : ''}</span></div>`).join('') +
    Object.keys(WEAPONS).map(id => { const k = save.stats.wkills[id] || 0, g = save.gold[id]; return `<div class="panel item ${g ? 'done' : 'off'}"><img src="${icon(id)}" alt=""><div class="tx"><b>${WEAPONS[id].name} dourada</b><span>${Math.min(k, 5000).toLocaleString('pt-BR')} de 5.000 abates com ela. +10% de dano para sempre.</span></div><span>${g ? 'Feita' : ''}</span></div>`; }).join('');
}

/* ---------------- subir de nível ---------------- */
const FUSIONS = [
  { a: 'sanfona', b: 'bumbo', id: 'forrotrovao', name: 'Forró Trovejante' },
  { a: 'rojao', b: 'candeeiro', id: 'ceusaojoao', name: 'Céu de São João' },
  { a: 'chapeu', b: 'facao', id: 'vaqueirolendario', name: 'Vaqueiro Lendário' },
  { a: 'berimbau', b: 'matraca', id: 'rodacapoeira', name: 'Roda de Capoeira' },
  { a: 'galo', b: 'folhetos', id: 'terreiro', name: 'Terreiro Encantado' },
  { a: 'peixeira', b: 'tarrafa', id: 'pescarialenda', name: 'Pescaria Lendária' },
  { a: 'baladeira', b: 'bodoque', id: 'chuvadebarro', name: 'Chuva de Barro' },
];
for (const fu of FUSIONS) { WEAPONS[fu.id] = { name: fu.name, desc: 'Fusão lendária de ' + WEAPONS[fu.a].name + ' e ' + WEAPONS[fu.b].name + '.', fusion: true, evo: null }; S['i_' + fu.id] = S['i_' + fu.a] || S[fu.a]; }
function flatW() { const out = []; for (const w of player.weapons) { if (w.fz) for (const p of w.parts) { p.fzB = true; out.push(p); } else out.push(w); } return out; }
function hasW(id) { return flatW().some(w => w.id === id); }
function refreshSyn(silent) {
  for (const k in SYN) { const on = hasW(SYN[k].a) && (!SYN[k].b || hasW(SYN[k].b)); if (on && !G.syn[k] && !silent) { toast('Sinergia: ' + SYN[k].name + '!'); sfx('win'); } G.syn[k] = on; }
}
function rollOptions() {
  const p = player, pool = [];
  for (const w of p.weapons) { const W = WEAPONS[w.id]; if (!w.ev && w.lvl >= WMAX && p.pass[W.evo]) pool.push({ k: 'evo', id: w.id, path: 'a' }, { k: 'evo', id: w.id, path: 'f' }); }
  for (const w of p.weapons) if (w.lvl < WMAX && !w.ev) pool.push({ k: 'wup', id: w.id, w: 3 });
  if (p.weapons.length < SLOTS) for (const id in WEAPONS) if (!WEAPONS[id].fusion && !hasW(id)) pool.push({ k: 'wnew', id, w: 2 });
  for (const fu of FUSIONS) { const A = p.weapons.find(w => w.id === fu.a && w.ev), B = p.weapons.find(w => w.id === fu.b && w.ev); if (A && B) pool.push({ k: 'fuse', f: fu }); }
  const pc = Object.keys(p.pass).length;
  for (const id in PASSIVES) { const l = p.pass[id] || 0; if (l > 0 && l < PASSIVES[id].max) pool.push({ k: 'pup', id, w: 2 }); else if (l === 0 && pc < SLOTS) pool.push({ k: 'pnew', id, w: 1.5 }); }
  const n = (save.up.escolha ? 4 : 3) + (Math.random() < 0.1 * (p.pass.ferradura || 0) ? 1 : 0), out = pool.filter(o => o.k === 'evo' || o.k === 'fuse'), rest = pool.filter(o => o.k !== 'evo' && o.k !== 'fuse');
  while (out.length < n && rest.length) {
    let tot = 0; for (const o of rest) tot += o.w; let r = Math.random() * tot, i = 0;
    for (; i < rest.length - 1; i++) { r -= rest[i].w; if (r <= 0) break; }
    out.push(rest.splice(i, 1)[0]);
  }
  if (!out.length) out.push({ k: 'cura' }, { k: 'rap' });
  return out;
}
function cardHTML(o) {
  let ico, name, tag, desc;
  if (o.k === 'fuse') return `<img class="ci" src="${icon(o.f.a)}" alt=""><span class="ct">Fusão lendária</span><b>${o.f.name}</b><span class="cd">Junta ${WEAPONS[o.f.a].name} e ${WEAPONS[o.f.b].name} num espaço só, 35% mais fortes. Libera um espaço de arma.</span>`;
  if (o.k === 'wnew' || o.k === 'wup' || o.k === 'evo') {
    const W = WEAPONS[o.id], w = player.weapons.find(x => x.id === o.id); ico = icon(o.id);
    if (o.k === 'wnew') { name = W.name; tag = 'Nova arma'; desc = W.desc; const sy = Object.values(SYN).find(x => (x.a === o.id && (!x.b || hasW(x.b))) || (x.b === o.id && hasW(x.a))); if (sy) desc += ' Sinergia: ' + sy.name + '.'; }
    else if (o.k === 'wup') { name = W.name; tag = `Nível ${w.lvl + 1}`; desc = wupDesc(o.id, w.lvl); }
    else { name = W.evoName; tag = o.path === 'a' ? 'Evolução: Área' : 'Evolução: Força'; desc = W.evoDesc + (o.path === 'a' ? ' Caminho da área: mais alcance e quantidade.' : ' Caminho da força: muito mais dano.'); }
  } else if (o.k === 'pnew' || o.k === 'pup') {
    const P = PASSIVES[o.id], l = player.pass[o.id] || 0; ico = icon(o.id); name = P.name; tag = o.k === 'pnew' ? 'Novo item' : `Nível ${l + 1}`; desc = P.desc;
    const evoOf = Object.keys(WEAPONS).find(k => WEAPONS[k].evo === o.id && player.weapons.find(w => w.id === k && !w.ev));
    if (evoOf && o.k === 'pnew') desc += ` Combina com ${WEAPONS[evoOf].name}.`;
  } else if (o.k === 'cura') { ico = icon('cuscuz'); name = 'Cuscuz'; tag = 'Cura'; desc = 'Recupera 30 de vida.'; }
  else { ico = icon('rap'); name = 'Rapadura'; tag = 'Moeda'; desc = '+5 rapaduras.'; }
  return `<img class="ci" src="${ico}" alt=""><span class="ct">${tag}</span><b>${name}</b><span class="cd">${desc}</span>`;
}
function openLevel(again) {
  mode = 'level'; joy = null; if (!again) sfx('lvl');
  const rr = $('#btn-reroll'), cost = 3 + 2 * (G.rerolls || 0); rr.textContent = `Sortear de novo (${cost} rapaduras da noite)`; rr.disabled = G.rap < cost;
  const box = $('#cards'); box.innerHTML = '';
  rollOptions().forEach((o, i) => {
    const b = document.createElement('button'); b.className = 'card ' + (o.k === 'evo' || o.k === 'fuse' ? 'evo' : o.k === 'wnew' || o.k === 'wup' ? 'k-arma' : o.k === 'pnew' || o.k === 'pup' ? 'k-item' : 'k-cura');
    b.innerHTML = cardHTML(o) + (isTouch ? '' : `<span class="k">tecla ${i + 1}</span>`); b.onclick = () => choose(o); box.appendChild(b);
  });
  show('level');
}
function reroll() { const cost = 3 + 2 * (G.rerolls || 0); if (mode !== 'level' || G.rap < cost) return; G.rap -= cost; G.rerolls = (G.rerolls || 0) + 1; sfx('coin'); openLevel(true); }
function choose(o) {
  if (mode !== 'level') return; sfx('ui'); const p = player;
  if (o.k === 'wnew') { p.weapons.push({ id: o.id, lvl: 1, cd: 0.2, ev: false }); refreshSyn(); }
  else if (o.k === 'wup') p.weapons.find(w => w.id === o.id).lvl++;
  else if (o.k === 'evo') { p.weapons.find(w => w.id === o.id).ev = o.path; unlockAch('evolui'); }
  else if (o.k === 'fuse') { const A = p.weapons.find(w => w.id === o.f.a), B = p.weapons.find(w => w.id === o.f.b); p.weapons = p.weapons.filter(w => w !== A && w !== B); p.weapons.push({ id: o.f.id, fz: true, parts: [A, B], lvl: WMAX, ev: 'L', cd: 0 }); banner(o.f.name + '!'); G.shake = 5; }
  else if (o.k === 'pnew' || o.k === 'pup') { p.pass[o.id] = (p.pass[o.id] || 0) + 1; recalc(); }
  else if (o.k === 'cura') p.hp = Math.min(p.maxHp, p.hp + 30);
  else G.rap += 5;
  G.pendingLv--; refreshSlots();
  if (G.pendingLv > 0) openLevel(); else { hideScreens(); mode = 'play'; last = performance.now(); }
}

/* ---------------- roleta do coronel ---------------- */
let rolSpot = null, rolTimer = 0;
function openRoleta(sp) {
  mode = 'roleta'; joy = null; rolSpot = sp;
  $('#rol-wheel').textContent = 'Quanto você aposta?'; $('#rol-sub').textContent = `Você tem ${G.rap} rapaduras nesta noite.`;
  $('#rol-exit').disabled = false; renderBets(false); show('roleta');
}
function renderBets(lock) {
  const box = $('#rol-bets'); box.innerHTML = '';
  for (const b of [10, 25, 50]) { const el = document.createElement('button'); el.className = 'btn'; el.style.minWidth = '130px'; el.textContent = 'Apostar ' + b; el.disabled = lock || G.rap < b; el.onclick = () => spinRoleta(b); box.appendChild(el); }
}
function spinRoleta(b) {
  if (G.rap < b) return;
  G.rap -= b; rolSpot.cd = 90; renderBets(true); $('#rol-exit').disabled = true; sfx('ui');
  let tot = 0; for (const o of ROL) tot += o.w; let r = Math.random() * tot, res = ROL[ROL.length - 1];
  for (const o of ROL) { r -= o.w; if (r <= 0) { res = o; break; } }
  const start = performance.now(); clearInterval(rolTimer);
  rolTimer = setInterval(() => {
    if (performance.now() - start < 1600) { $('#rol-wheel').textContent = ROL[(Math.random() * ROL.length) | 0].t; sfx('pick'); return; }
    clearInterval(rolTimer); res.f(b); $('#rol-wheel').textContent = res.t;
    $('#rol-sub').textContent = `Agora você tem ${G.rap} rapaduras nesta noite.`; sfx(res.good ? 'win' : 'die');
    $('#rol-exit').disabled = false; $('#rol-exit').focus();
  }, 80);
}

/* ---------------- baú do coronel ---------------- */
let chestTimer = 0;
function rollChest() {
  const p = player, L = p.st.luck * (1 + 0.25 * (p.pass.moeda || 0)), r = Math.random(), n = r < 0.05 * L ? 3 : r < 0.3 * L ? 2 : 1, out = [];
  for (let i = 0; i < n; i++) {
    const evo = p.weapons.find(w => !w.ev && w.lvl >= WMAX && p.pass[WEAPONS[w.id].evo] && !out.some(o => o.w === w));
    if (evo) { out.push({ k: 'evo', w: evo }); continue; }
    const ws = p.weapons.filter(w => !w.ev && w.lvl + out.filter(o => o.w === w).length < WMAX);
    if (ws.length) { out.push({ k: 'wup', w: ws[(Math.random() * ws.length) | 0] }); continue; }
    const ps = Object.keys(p.pass).filter(k => p.pass[k] + out.filter(o => o.p === k).length < PASSIVES[k].max);
    if (ps.length) { out.push({ k: 'pup', p: ps[(Math.random() * ps.length) | 0] }); continue; }
    out.push({ k: 'rap' });
  }
  return out;
}
function applyChest(o) {
  if (o.k === 'evo') { unlockAch('evolui'); return { ico: icon(o.w.id), name: WEAPONS[o.w.id].evoName, sub: 'Escolha o caminho:', evo: true, pick: o.w }; }
  if (o.k === 'wup') { o.w.lvl++; return { ico: icon(o.w.id), name: WEAPONS[o.w.id].name, sub: 'Nível ' + o.w.lvl }; }
  if (o.k === 'pup') { player.pass[o.p]++; recalc(); return { ico: icon(o.p), name: PASSIVES[o.p].name, sub: 'Nível ' + player.pass[o.p] }; }
  G.rap += 15; return { ico: icon('rap'), name: 'Rapadura', sub: '+15 rapaduras' };
}
function openChest() {
  mode = 'chest'; joy = null; G.pendingChest--;
  const res = rollChest().map(applyChest); refreshSlots();
  const box = $('#chest-slots'), btn = $('#btn-chest'), pool = Object.keys(WEAPONS).concat(Object.keys(PASSIVES)).map(icon);
  btn.disabled = true;
  box.innerHTML = res.map(() => '<div class="cslot"><div class="cbox"><img alt=""></div><b>&nbsp;</b><span>&nbsp;</span></div>').join('');
  const els = [...box.children], start = performance.now();
  show('chest'); sfx('coin'); clearInterval(chestTimer);
  chestTimer = setInterval(() => {
    const t = performance.now() - start;
    els.forEach((el, i) => {
      if (el.dataset.done) return;
      if (t < 1100 + i * 450) { el.querySelector('img').src = pool[(Math.random() * pool.length) | 0]; sfx('pick'); return; }
      const r = res[i]; el.dataset.done = 1; el.classList.toggle('evo', !!r.evo);
      el.querySelector('img').src = r.ico; el.querySelector('b').textContent = r.name; el.querySelector('span').textContent = r.sub; sfx(r.evo ? 'win' : 'lvl');
      if (r.pick) { el.dataset.wait = 1; const row = document.createElement('div'); row.className = 'row'; row.style.gap = '6px';
        for (const [pth, lab] of [['a', 'Área'], ['f', 'Força']]) { const bt = document.createElement('button'); bt.className = 'btn small'; bt.style.minWidth = '0'; bt.textContent = lab; bt.onclick = () => { r.pick.ev = pth; delete el.dataset.wait; row.remove(); el.querySelector('span').textContent = 'Evolução: ' + lab + '!'; refreshSlots(); sfx('ui'); if (els.every(x => x.dataset.done && !x.dataset.wait)) { btn.disabled = false; btn.focus(); } }; row.appendChild(bt); }
        el.appendChild(row); }
    });
    if (els.every(e => e.dataset.done)) { clearInterval(chestTimer); if (els.every(e => !e.dataset.wait)) { btn.disabled = false; btn.focus(); } }
  }, 70);
}

/* ---------------- salvar a noite ---------------- */
const RUN_KEY = 'visagem-run-v1';
function saveRun() {
  if (!G || !player || G.dawn || !['play', 'pause', 'level', 'chest'].includes(mode)) return;
  const data = { v: 1, G: Object.assign({}, G, { boss: null }), boss: G.boss && G.boss.alive ? { type: G.boss.type, f: G.boss.hp / G.boss.maxHp } : null,
    ex: EXW, p: { char: player.char, spr: player.spr, x: player.x, y: player.y, hp: player.hp, xp: player.xp, level: player.level, next: player.next, weapons: player.weapons.map(w => w.fz ? { id: w.id, lvl: w.lvl, ev: w.ev, fz: true, parts: w.parts.map(p => ({ id: p.id, lvl: p.lvl, ev: p.ev })) } : { id: w.id, lvl: w.lvl, ev: w.ev }), pass: player.pass },
    spots, acudes, traps, villages, roads, graves, riv: RIV, items: items.filter(i => i.kind !== 'xp').map(i => ({ x: i.x, y: i.y, kind: i.kind, v: i.v, food: !!i.food })) };
  try { localStorage.setItem(RUN_KEY, JSON.stringify(data)); } catch (e) {}
}
function loadRun() { try { const d = JSON.parse(localStorage.getItem(RUN_KEY)); return d && d.v === 1 && d.p && CHARS[d.p.char] ? d : null; } catch (e) { return null; } }
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (e) {} }
function resumeRun() {
  const d = loadRun(); if (!d) return;
  audioInit(); resetLists(); lastChar = d.p.char;
  G = Object.assign(newRunState(), d.G, { boss: null });
  player = newPlayer(d.p.char);
  Object.assign(player, { spr: d.p.spr, x: d.p.x, y: d.p.y, xp: d.p.xp, level: d.p.level, next: d.p.next, pass: d.p.pass, weapons: d.p.weapons.map(w => Object.assign({ cd: 0.5 }, w, w.parts ? { parts: w.parts.map(p => Object.assign({ cd: 0.5 }, p)) } : {})) });
  recalc(); player.hp = Math.min(player.maxHp, d.p.hp);
  spots.push(...d.spots); acudes.push(...d.acudes); traps.push(...(d.traps || [])); villages = d.villages || (d.village ? [d.village] : []); roads = d.roads || []; graves = d.graves || []; if (d.riv) RIV = d.riv; buildRoads();
  if (d.ex) { EXW = d.ex; buildExtraGrids(); } else makeExtraWorld();
  placeProps();
  for (const i of d.items) { drop(i.x, i.y, i.kind, i.v); items[items.length - 1].food = i.food; }
  if (d.boss) { spawnBoss(BOSSES.concat(SECRET_BOSS).find(x => x.type === d.boss.type)); G.boss.hp = G.boss.maxHp * d.boss.f; }
  refreshSlots(); refreshSyn(true); hud(true); mode = 'play'; pauseGame();
}

/* ---------------- fluxo da partida ---------------- */
function resetLists() { for (const a of [enemies, projs, pools, waves, items, parts, nums, fx, marks, goos, spots, carts, acudes, traps, whirls, critters, honeys, trails, stars, roots, muds, fires, pilgrims]) a.length = 0; villages = []; roads = []; graves = []; grid.clear(); EXH.reset(); bq.length = 0; clearTimeout(bannerT); $('#banner').classList.remove('on'); }
function startRun(ch) {
  audioInit(); lastChar = ch; resetLists(); clearRun();
  G = newRunState(); player = newPlayer(ch); rollRiver(); recalc(); player.hp = player.maxHp; makeSpots(); placeProps(); refreshSyn(true);
  refreshSlots(); hideScreens(); hud(true); mode = 'play'; last = performance.now();
  if (!save.introSeen) { save.introSeen = true; persist(); startCut('intro', () => { hud(true); mode = 'play'; last = performance.now(); }); }
  if (isTouch && !document.fullscreenElement && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().then(() => screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {})).catch(() => {});
  }
}
function pauseGame() {
  if (mode !== 'play') return; mode = 'pause'; joy = null;
  const n1 = v => v.toFixed(1).replace('.', ',');
  $('#pause-build').innerHTML = player.weapons.map(w => {
    if (w.fz) return `<div class="panel item"><img src="${icon(w.id)}" alt=""><div class="tx"><b>${WEAPONS[w.id].name} (lendária)</b><span>${w.parts.map(p => WEAPONS[p.id].evoName).join(' + ')}, 35% mais fortes.</span></div></div>`;
    const s = wstat(w.id, w.lvl, w.ev), W = WEAPONS[w.id], bits = ['dano ' + Math.round(s.dmg)];
    if (s.cd) bits.push('a cada ' + n1(s.cd) + 's');
    if (s.n && w.id !== 'sanfona') bits.push(s.n + (w.id === 'galo' ? ' galos' : w.id === 'folhetos' ? ' folhetos' : 'x'));
    if (s.b) bits.push(s.b + ' ricochetes');
    if (s.root) bits.push('prende ' + n1(s.root) + 's');
    if (s.rad || s.r) bits.push('alcance ' + Math.round(s.rad || s.r));
    const evo = w.ev ? 'Evoluída.' : `Evolui no nível ${WMAX} com ${PASSIVES[W.evo].name} (${player.pass[W.evo] ? 'você tem' : 'falta'}).`;
    return `<div class="panel item"><img src="${icon(w.id)}" alt=""><div class="tx"><b>${w.ev ? W.evoName + (w.ev === 'a' ? ' (Área)' : w.ev === 'f' ? ' (Força)' : '') : W.name} (nível ${w.lvl})</b><span>${bits.join(', ')}</span><span>${evo}</span></div></div>`;
  }).join('') + Object.entries(player.pass).map(([k, l]) => `<div class="panel item"><img src="${icon(k)}" alt=""><div class="tx"><b>${PASSIVES[k].name} (nível ${l}/${PASSIVES[k].max})</b><span>${PASSIVES[k].desc}</span></div></div>`).join('') +
    Object.entries(SYN).filter(([k]) => G.syn[k]).map(([, x]) => `<div class="panel item"><div class="tx"><b>Sinergia: ${x.name}</b><span>${x.desc}</span></div></div>`).join('') +
    FUSIONS.filter(fu => player.weapons.some(w => w.id === fu.a) && player.weapons.some(w => w.id === fu.b)).map(fu => { const ok = player.weapons.some(w => w.id === fu.a && w.ev) && player.weapons.some(w => w.id === fu.b && w.ev); return `<div class="panel item"><img src="${icon(fu.a)}" alt=""><div class="tx"><b>Fusão: ${fu.name}</b><span>${ok ? 'Pronta! Aparece nas cartas ao subir de nível.' : 'Evolua ' + WEAPONS[fu.a].name + ' e ' + WEAPONS[fu.b].name + ' para fundir as duas.'}</span></div></div>`; }).join('');
  show('pause');
}
function resumeGame() { if (mode !== 'pause') return; hideScreens(); mode = 'play'; last = performance.now(); audioInit(); }
function endRun(win) {
  if (mode === 'over' || !G) return; mode = 'over'; joy = null;
  const t = G.inf ? G.time : Math.min(G.time, RUN), earned = (Math.floor(G.kills / 40) + Math.floor(t / 60) * 2 + G.rap) * (G.nm ? 2 : 1);
  save.rap += earned; const b = save.best;
  b.time = Math.max(b.time, Math.min(t, RUN)); if (G.inf) b.inf = Math.max(b.inf || 0, t); save.cxp[player.char] = (save.cxp[player.char] || 0) + Math.round(t / 6 + G.kills / 50); b.kills = Math.max(b.kills, G.kills); b.level = Math.max(b.level, player.level);
  const st = save.stats; st.runs++; if (win) st.wins++; st.time += t; st.kills += G.kills;
  for (const k in G.byEnemy) st.enemies[k] = (st.enemies[k] || 0) + G.byEnemy[k];
  for (const k in G.dmg) st.weapons[k] = (st.weapons[k] || 0) + G.dmg[k];
  clearRun();
  if (win) unlockAch('amanhecer');
  if (win && G.nm) unlockAch('pesadelo');
  persist();
  $('#over-title').textContent = win ? 'O sol nasceu!' : 'A visagem te pegou';
  const dz = $('#over-dance'); dz.classList.toggle('hidden', !win); if (win) dz.src = icon(player.spr);
  $('#tip').textContent = 'Dica: ' + TIPS[(Math.random() * TIPS.length) | 0];
  $('#over-sub').textContent = G.inf ? `Você aguentou ${fmt(t)} no Modo Infinito. Recorde: ${fmt(save.best.inf || t)}.` : win ? (G.nm ? 'Você atravessou o pesadelo inteiro e venceu o Anhangá.' : 'Você atravessou a noite inteira.') : 'Ainda faltavam ' + fmt(RUN - t) + ' para o amanhecer.';
  $('#over-stats').innerHTML = `<span>Tempo</span><span>${fmt(t)}</span><span>Nível</span><span>${player.level}</span><span>Abates</span><span>${G.kills}</span><span>Rapaduras ganhas</span><span>${earned}</span>`;
  const dm = Object.entries(G.dmg).filter(([k]) => WEAPONS[k]).sort((a, b) => b[1] - a[1]), mx = dm.length ? dm[0][1] : 1;
  const fmtN = v => v >= 1000 ? (v / 1000).toFixed(1).replace('.', ',') + ' mil' : String(Math.round(v));
  $('#over-dmg').innerHTML = dm.length ? '<div class="dh">Dano por arma</div>' + dm.map(([k, v]) => { const w = player.weapons.find(x => x.id === k);
    return `<div class="drow"><img src="${icon(k)}" alt=""><span class="dn">${w && w.ev ? WEAPONS[k].evoName : WEAPONS[k].name}</span><span class="db"><i style="width:${(v / mx * 100).toFixed(1)}%"></i></span><span class="dv">${fmtN(v)}</span></div>`; }).join('') : '';
  sfx(win ? 'win' : 'die'); hud(false); bq.length = 0; clearTimeout(bannerT); $('#banner').classList.remove('on'); show('over');
}

/* ---------------- ligações da interface ---------------- */
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { audioInit(); goto(b.dataset.go); }));
$('#btn-sound').onclick = () => { audioInit(); save.sound = !save.sound; persist(); renderMenu(); sfx('ui'); };
$('#cut').onclick = endCut;
$('#rol-exit').onclick = () => { if (mode !== 'roleta') return; clearInterval(rolTimer); if (rolSpot) rolSpot.cd = Math.max(rolSpot.cd, 5); hideScreens(); mode = 'play'; last = performance.now(); };
$('#abil').onclick = useAbility;
$('#pausebtn').onclick = () => { pauseGame(); saveRun(); };
$('#btn-nm').onclick = () => { const m = ['normal', 'pesadelo', 'infinito']; save.gmode = m[(m.indexOf(save.gmode) + 1) % 3]; persist(); sfx('ui'); renderChars(); };
$('#btn-reroll').onclick = reroll;
$('#btn-joy').onclick = () => { save.joyFix = !save.joyFix; persist(); sfx('ui'); renderMenu(); };
$('#btn-err').onclick = () => { let t = ''; try { const er = JSON.parse(localStorage.getItem(ERR_KEY)); t = `Visagem ${er.v} ${er.t}\n${er.msg}\n${er.stack}\n${er.ua}`; } catch (e) {} const done = () => { toast('Erro copiado. Pode colar numa mensagem.'); try { localStorage.removeItem(ERR_KEY); } catch (e) {} renderMenu(); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => { if (navigator.share) navigator.share({ text: t }).then(done, () => {}); }); else if (navigator.share) navigator.share({ text: t }).then(done, () => {}); };
$('#btn-chest').onclick = () => { if (mode !== 'chest') return; sfx('ui'); hideScreens(); mode = 'play'; last = performance.now(); };
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {});
  // quando uma versão nova do jogo assume, recarrega uma vez (fora de partida)
  let swReloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (!swReloaded && (mode === 'menu' || mode === 'chars')) { swReloaded = true; location.reload(); } });
}
let installEvt = null;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; $('#btn-install').classList.remove('hidden'); });
$('#btn-install').onclick = async () => { if (!installEvt) return; installEvt.prompt(); await installEvt.userChoice; installEvt = null; $('#btn-install').classList.add('hidden'); };
$('#btn-resume').onclick = resumeGame;
$('#btn-quit').onclick = () => endRun(false);
$('#btn-again').onclick = () => startRun(lastChar);
document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseGame(); saveRun(); } });
addEventListener('pagehide', saveRun);
$('#btn-continue').onclick = () => { sfx('ui'); resumeRun(); };
addEventListener('resize', resize);
document.querySelectorAll('img[data-ico]').forEach(i => i.src = icon(i.dataset.ico));
$('#moon').src = moonImg(); $('#title').textContent = TITLE;
window.__game = { trails, stars, critters, honeys, spots, items, carts, acudes, traps, whirls, get village() { return villages[0]; }, get villages() { return villages; }, get roads() { return roads; }, get graves() { return graves; }, get projs() { return projs; }, get G() { return G; }, get player() { return player; }, get mode() { return mode; }, enemies, startRun, addXp: v => addXp(v) };

resize(); makeWorld(); renderMenu(); refreshRap(); show('menu');
setInterval(() => { if (mode === 'menu') $('#tip').textContent = 'Dica: ' + TIPS[(Math.random() * TIPS.length) | 0]; }, 7000);
requestAnimationFrame(frame);
