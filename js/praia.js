'use strict';
/* =========================================================
   Mapa 2: Praia de Jangadas (litoral do Ceará), noite de 15 min.
   Troca chefões e eventos na hora de começar (applyMap) e liga
   mar, maré, ilhas e visagens próprias pelos ganchos EXH.
   ========================================================= */
let MAP = 'sertao', WORLD = 'sertao';
const MAPS = {
  sertao: { name: 'Sertão', sub: 'Caatinga, vilarejos e as lendas do sertão. Noite de 30 minutos.', ico: 'mandacaru' },
  praia: { name: 'Praia de Jangadas', sub: 'Mar, maré, jangadas e as lendas do litoral. Noite de 15 minutos.', ico: 'coqueiro' },
};

/* ---------------- sprites ---------------- */
Object.assign(SD, {
  coqueiro: ['.g...g...g..', '..g.ggg.g...', '...ggGgg....', 'gggGgqGggg..', '..ggGqGgg...', '.g..gbg..g..', 'g....b....g.', '.....b......', '......b.....', '......b.....', '.....b......', '.....b......', '......b.....', '......b.....', '.....b......', '....bbb.....'],
  cajueiro: ['...GGGGGG.....', '.GGgGGrGGGG...', 'GGrGGGGGgGGG..', 'GGGGgGGrGGGGG.', '.GGrGGGGGGgG..', '..GGGGGgGG....', '....bbb.......', '.....bb.......', '....bbbb......'],
  capimpraia: ['.g..g.', 'g.gg.g', '.gGgg.', '..gg..'],
  conchaD: ['.ww.', 'wttw', '.ww.'],
  farol: ['...yyyy...', '..ykYYky..', '..yyyyyy..', '...hhhh...', '..hhhhhh..', '...rrrr...', '...rrrr...', '...wwww...', '...wwww...', '..rrrrrr..', '..rrrrrr..', '..wwwwww..', '..wwwwww..', '..rrrrrr..', '.rrrrrrrr.', '.wwwwwwww.', '.wwwwwwww.', '.rrrrrrrr.', 'hhhhhhhhhh', 'HHHHHHHHHH'],
  barraca: ['......yy........', '....yyyyyy......', '..yyyyyyyyyy....', 'yyyYyyyyyYyyyy..', '.b..........b...', '.b..wwww....b...', '.b..wkkw....b...', '.bbbbbbbbbbbb...', '.b..........b...'],
  barforro: ['r.y.u.g.r.y.u.g.r.', '..................', '.bbbbbbbbbbbbbbbb.', '.byyyyyyyyyyyyyyb.', '.bykkykkykkykkyyb.', '.byyyyyyyyyyyyyyb.', '.bwwwwwwwwwwwwwwb.', '.b..b........b..b.', '.b..b........b..b.'],
  casaPescador: ['..yyyyyyyyyy..', '.yyyyyyyyyyyy.', 'yyyYyyyyyyYyyy', '.wwwwwwwwwwww.', '.wbbwwwwwwbbw.', '.wbbwwbbwwbbw.', '.wwwwwbkwwwww.', '.HHHHHbbHHHHH.'],
  jangada: ['......w.........', '......ww........', '......www.......', '......wwww......', '......wwwww.....', '......bwwwww....', '......b.........', 'bbbbbbbbbbbbbbbb', 'BbBbBbBbBbBbBbBb'],
  barbatana: ['...h....', '..hh....', '.hhh....', 'uuuuuuuu'],
  peixe: ['.hh.h', 'hhhhh', '.hh.h'],
  caranguejo: ['r.r....r.r', 'rr.rrrr.rr', '.rrerrerr.', '..rrrrrr..', '.r.r..r.r.', 'r..r..r..r'],
  siri: ['u.u..u.u', '.uuuuuu.', '.ueuueu.', 'u.uuuu.u', '.u....u.'],
  afogado: ['...gggg...', '..gsssg...', '..sesse...', '..ssssss..', '...gssg...', '..uuuuuu..', '.uuguuguu.', 's.uuuuuu.s', 's.uuguuu.s', '..uuuuuu..', '..uu..uu..', '..uu..uu..', '..gs..sg..'],
  gaivota: ['ww......ww', '.www..www.', '..wwkwww..', '...wwwwy..', '....ww....'],
  gaivota2: ['..........', '..........', '..wwkwww..', 'wwwwwwwwyw', 'w...ww...w'],
  aguaviva: ['..pppp..', '.pPPPPp.', 'pPpPPpPp', 'pppppppp', '.p.p.p.p', '.p.p.p.p', 'p.p.p.p.', '.p.p.p..'],
  tubarao: ['......h.........', '.....hh.........', '.hhhhhhhhhhhh..h', 'hhkhhhhhhhhhhhhh', '.wwwwwwwwwhhh.hh', '..wwwwwww.......'],
  batatao: ['..oyo..', '.oyYyo.', 'oyYYYyo', 'oyYwYyo', 'oyYYYyo', '.oyYyo.', '..oyo..'],
  pirata: ['..kkkkkk..', '.kkkwkkkk.', '..ssssss..', '..skkssk..', '..ssssss..', '...ssss...', '.rwrwrwrw.', 'rwrwrwrwrh', 's.wrwrwr.h', 's.rwrwrw..', '..kkkkkk..', '..kk..kk..', '..kk..kk..', '..BB..BB..'],
  jangadeiro: ['..yyyyyyyy..', '.yyyyyyyyyy.', '..kssssssk..', '..ssksskss..', '..ssssssss..', '...SssssS...', '..wuwuwuwu..', '.swuwuwuwus.', '.suwuwuwuws.', '..wuwuwuwu..', '..bbbbbbbb..', '..ss....ss..', '..ss....ss..', '..SS....SS..'],
  iaramar: ['....uuuuuu......', '...uuuuuuuu.....', '..uussssssuu....', '..usesssesuu....', '..ussssssssu....', '..uussRssuuu....', '...usssssuuu....', '..uussssssuu....', '.sussggggsusu...', 's..ggggggg..s...', '...gGgggGgg.....', '....ggggggg.....', '.....ggGggg.....', '......gggggg....', '.......ggg.gg...', '......gg....gg..'],
  caboclo: ['.....kkkk.....', '....kkkkkk....', '...kkekkekk...', '...kkkkkkkk..h', '....kkwwkk...h', '..kkkkkkkkk..h', '.kkkGkkkGkkk.h', 'k.kkkkkkkkk.kh', 'k.kkkkkkkkk..h', '..kkGkkkkGk..h', '..kkkkkkkkk...', '...kkk..kkk...', '...kk....kk...', '..GGG....GGG..'],
  polvo: ['......pppppp......', '....pppppppppp....', '...ppppppppppppp..', '..pppwkppppwkppp..', '..pppwwppppwwppp..', '..pppppppppppppp..', '...pppppPPppppp...', '..pp.pp.pp.pp.pp..', '.pp..pp.pp.pp..pp.', 'pp..pp..pp..pp..pp', 'p..pp..pp..pp....p', '..pp..pp....pp....'],
  sebastiao: ['......y.y.y.......', '......yyyyy.......', '.w...........w....', '.ww.kkkkkkk.ww....', '..wkkkkkkkkkw.....', '...kkekkkekk......', '...kkkkYkkkk......', '....kkkkkkk.......', '....kkrrrkk.......', '..kkkkkkkkkkkkk...', '.kkkkkkkkkkkkkkk..', '.kkkkkkkkkkkkkkkk.', '.kkk.kkkkkkkk.kkk.', '.kk..kk....kk..kk.', '.kk..kk....kk..kk.', '.yy..yy....yy..yy.'],
  caranguejorei: ['.......y.y.y........', '.......yyyyy........', 'rr....rrrrrrr....rr.', 'rrr..rrrrrrrrr..rrr.', '.rrrrrrerrrerrrrrr..', '..rrrrrrrrrrrrrrr...', '....rrrRRRRRrrr.....', '..r.rrrrrrrrrrr.r...', '.r..r.r.....r.r..r..', 'r..r..r.....r..r..r.'],
  baleia: ['.........hhhhhhhhh......', '......hhhhhhhhhhhhhh....', '...hhhhhhhhhhhhhhhhhhh.h', '.hhhkhhhhhhhhhhhhhhhhhhh', 'hhhhhhhhhhhhhhhhhhhhhhh.', 'wwwwwwwwwwwwwwhhhhhhhh..', '.wwwwwwwwwwwwwww.hhh....', '...wwwwwwwwww...........'],
  holandes: ['..kkkkkkkkkk..', '.kkkykkkkykkk.', 'kkkkkkkkkkkkkk', '...uuuuuuuu...', '...ueuuuueu...', '...uuuuuuuu...', '....uukkuu....', '..kkkkkkkkkk..', '.kkkykkkkykkk.', 'kkkkkkkkkkkkkk', 'u.kkkkkkkkkk.u', 'u.kkkkkkkkkk.u', '..kkkkkkkkkk..', '...uuuuuuuu...', '....uuuuuu....', '.....uuuu.....', '......uu......'],
  navio: ['............h.............', '.......uuuuuhuuuuu........', '.......uuuuuhuuuuu........', '........uuuuhuuuu.........', '.........uuuhuuu..........', '....uuuuuuuuhuuuuuuu......', '.....uuuuuuuhuuuuuu.......', '......uuuuuuhuuuuu........', '............h.............', 'bbbbbbbbbbbbbbbbbbbbbbbbbb', '.bBkBBBkBBBkBBBkBBBkBBBkb.', '..bbbbbbbbbbbbbbbbbbbbbb..', '...BBBBBBBBBBBBBBBBBBBB...', '....uuu..uuu..uuu..uuu....'],
  princesa: ['...y.y.y....', '...yyyyy....', '.gggggggg...', 'ggegggeggg..', 'gggggggggggg', 'gGgGgGgGggrr', 'gggggggggg..', '.gggggggg...'],
  princesaSeg: ['..gggg..', '.gGggGg.', 'gggyyggg', 'ggyyyygg', 'ggyyyygg', 'gggyyggg', '.gGggGg.', '..gggg..'],
  i_arpao: ['.......h', '......hh', '.....hh.', '....b...', '...b....', '..b.....', '.b......', 'b.......'],
  i_redepesca: ['u.u.u.u.', '.u.u.u.u', 'u.u.u.u.', '.u.u.u.u', 'u.u.u.u.', '.u.u.u.u', 'bbbbbbbb'],
  i_remo: ['B.......', '.B......', '..b.....', '...b....', '....b...', '.....bb.', '.....bbb', '......bb'],
  i_concha: ['...w....', '..wtw...', '.wtwtw..', 'wtwtwtw.', 'wtwtwtw.', '.wtwtw..', '..www...'],
  i_mensagem: ['...kk...', '...UU...', '..UwwU..', '.UwrrwU.', '.UwwwwU.', '.UwrrwU.', '.UwwwwU.', '..UUUU..'],
  i_protetor: ['..yy....', '..ww....', '.wwww...', '.wrrw...', '.wwww...', '.wyyw...', '.wwww...', '..ww....'],
  i_chapeupalha: ['...yy...', '..yYYy..', '.yyyyyy.', 'yyrrrryy', 'yyyyyyyy'],
  i_conchasorte: ['..pppp..', '.pPpPpp.', 'pPpPpPpp', 'pppppppp', '.pPpPpp.', '..pppp..', '...pp...'],
  i_aguacoco: ['...g....', '..ggg...', '.qqqqq..', 'qqqwqqq.', 'qqqqqqq.', 'qqqqqqq.', '.qqqqq..', '..qqq...'],
});
Object.assign(SPAL, {
  coqueiro: { g: '#3d6b33', G: '#5f9e4a', b: '#8a7a5a', q: '#6b4a2e' }, cajueiro: { G: '#2f5a33', g: '#3d6b33', r: '#c8463c', b: '#6b4a2e' },
  capimpraia: { g: '#5a7a4a', G: '#3d5a33' }, conchaD: { w: '#d8ccbc', t: '#c99080' },
  farol: { y: '#f2c14e', Y: '#fff6a0', k: '#14111f', h: '#8a8aa0', H: '#5e5e78', r: '#c8463c', w: '#e8e0c8' },
  barraca: { y: '#c9a84a', Y: '#a8842a', b: '#6b4a2e', w: '#e8e0c8', k: '#c8463c' },
  barforro: { r: '#c8463c', y: '#c9a84a', u: '#3b6ea5', g: '#5f9e4a', b: '#6b4a2e', k: '#f2c14e', w: '#e8e0c8' },
  casaPescador: { y: '#c9a84a', Y: '#a8842a', w: '#c9bfa8', b: '#3a4a7a', k: '#2a2433', H: '#7a7060' },
  jangada: { w: '#e8e0c8', b: '#8a5a2b', B: '#5c3a1c' }, barbatana: { h: '#6a7a8a', u: '#a8c4d8' }, peixe: { h: '#c9d4e0' },
  caranguejo: { r: '#c8463c', e: '#fff6a0' }, siri: { u: '#4a8ab0', e: '#fff6a0' },
  afogado: { s: '#8ab0a0', u: '#2a5a6a', g: '#3d6b33', e: '#ffd23f' }, gaivota: { w: '#e8eeff', y: '#f2c14e' }, gaivota2: { w: '#e8eeff', y: '#f2c14e' },
  aguaviva: { p: '#c08cff', P: '#e8c8ff' }, tubarao: { h: '#6a7a8a', w: '#c9d4e0' }, batatao: { o: '#e8832a', y: '#f2c14e', Y: '#fff6a0', w: '#ffffff' },
  pirata: { s: '#c9926a', r: '#c8463c', w: '#e8e0c8', h: '#8a8aa0', B: '#3a2414' },
  jangadeiro: { y: '#d9b24a', u: '#3b6ea5', w: '#e8e0c8', b: '#5c3a1c' },
  iaramar: { u: '#2a6cc8', s: '#c9a888', e: '#5fd4ff', R: '#c8463c', g: '#3aa8a0', G: '#2a7a7a' },
  caboclo: { k: '#2a3a2a', G: '#3d6b33', e: '#ffd23f', h: '#8a8aa0' },
  polvo: { p: '#8a3a6a', P: '#c8463c', k: '#14111f' },
  sebastiao: { k: '#1c1622', w: '#e8e0c8', e: '#ff4a3d', y: '#f2c14e', Y: '#fff6a0', r: '#c8463c' },
  caranguejorei: { r: '#a83a32', R: '#6e2420', e: '#fff6a0', y: '#f2c14e' },
  baleia: { h: '#5a6a8a', w: '#c9d4e0', k: '#e8eeff' },
  holandes: { u: '#9ad4c8', k: '#1c2a3a', e: '#5fffd4', y: '#f2c14e' },
  navio: { u: '#9ad4c8', b: '#4a3a3a', B: '#2a2026', k: '#5fffd4', h: '#6a5a4a' },
  princesa: { g: '#3aa8a0', G: '#2a7a7a', e: '#ffd23f', y: '#f2c14e', r: '#c8463c' }, princesaSeg: { g: '#3aa8a0', G: '#2a7a7a', y: '#f2c14e' },
  i_redepesca: { u: '#c9d4e0' }, i_concha: { w: '#e8d9c8', t: '#d9a090' }, i_mensagem: { U: '#5f9e4a', r: '#3a3040' },
  i_conchasorte: { p: '#e86a9a', P: '#ffb0d0' }, i_aguacoco: { q: '#5f9e4a' },
});
{
  const big = ['iaramar', 'caboclo', 'polvo', 'sebastiao', 'caranguejorei', 'baleia', 'holandes', 'navio', 'princesa'];
  const out = ['caranguejo', 'siri', 'afogado', 'gaivota', 'gaivota2', 'aguaviva', 'tubarao', 'pirata', 'jangadeiro', 'princesaSeg', 'barbatana'];
  const walk = new Set(['afogado', 'pirata', 'jangadeiro', 'caboclo', 'sebastiao', 'holandes']);
  const mixHex = (a, b, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
  for (const k in SD) if (!S[k] && SPAL[k] !== undefined || ['peixe', 'capimpraia'].includes(k)) if (!S[k]) S[k] = sprite(SD[k], SPAL[k], { out: out.includes(k) || big.includes(k), x2: big.includes(k), walk: walk.has(k) });
  for (const k of ['i_arpao', 'i_remo', 'i_protetor', 'i_chapeupalha']) if (!S[k]) S[k] = sprite(SD[k], SPAL[k]);
  for (const k of big) { const p2 = {}; const base = Object.assign({}, PAL, SPAL[k]); for (const c in base) if (c !== '.') p2[c] = mixHex(base[c], '#c8463c', 0.4); p2.e = '#fff6a0'; S[k + '_p2'] = sprite(SD[k], p2, { out: true, x2: true, walk: walk.has(k) }); }
  S.princesaSeg_p2 = sprite(SD.princesaSeg, { g: '#c8463c', G: '#8a2a20', y: '#f2c14e' }, { out: true });
  // visuais de praia para os personagens
  S.vaqueiro_skin2 = sprite(SD.vaqueiro, { b: '#d9b24a', B: '#a8842a', r: '#3b6ea5', u: '#c9926a' }, { out: true, walk: true });
  S.pescador_skin2 = sprite(SD.pescador, { y: '#e8e0c8', u: '#c8463c', U: '#f0ead6' }, { out: true, walk: true });
  S.forrozeira_skin2 = sprite(SD.forrozeira, { r: '#3aa8a0', w: '#fff6a0', d: '#6b4a2e' }, { out: true, walk: true });
  S.benzedeira_skin2 = sprite(SD.benzedeira, { u: '#e8e0c8' }, { out: true, walk: true });
  S.jangadeiro_skin2 = sprite(SD.jangadeiro, { u: '#c8463c', y: '#e8e0c8' }, { out: true, walk: true });
}
const SKINS2 = {
  vaqueiro: { name: 'Vaqueiro de Bermuda', ach: 'praia5' }, pescador: { name: 'Pescador de Alto-Mar', ach: 'praiaboss' }, forrozeira: { name: 'Forró Pé-na-Areia', ach: 'praiaforro' },
  benzedeira: { name: 'Benzedeira de Branco', ach: 'praianoite' }, jangadeiro: { name: 'Jangadeiro de Gala', ach: 'princesa' },
};

/* ---------------- dados ---------------- */
Object.assign(WEAPONS, {
  arpao:     { name: 'Arpão', desc: 'Lança longa que atravessa vários inimigos e fisga para trás.', evo: 'conchasorte', evoName: 'Arpão do Mar Alto', evoDesc: 'Atravessa todo mundo, mais forte e com mais arpões.', map: 'praia' },
  redepesca: { name: 'Rede de Pesca', desc: 'Lança a rede num leque e puxa os inimigos para perto.', evo: 'aguacoco', evoName: 'Rede de Arrasto', evoDesc: 'Leque bem maior e puxão mais forte.', map: 'praia' },
  remo:      { name: 'Remo', desc: 'Remada pesada que arremessa e atordoa quem está perto.', evo: 'chapeupalha', evoName: 'Remo de Jangadeiro', evoDesc: 'Remadas dos dois lados, maiores e mais fortes.', map: 'praia' },
  concha:    { name: 'Concha', desc: 'Conchas que ricocheteiam de inimigo em inimigo.', evo: 'protetor', evoName: 'Concha Encantada', evoDesc: 'Mais conchas e muito mais ricochetes.', map: 'praia' },
  mensagem:  { name: 'Garrafa com Mensagem', desc: 'Garrafa arremessada que estoura numa poça que fere e atrasa.', evo: 'garrafa', evoName: 'Garrafa do Náufrago', evoDesc: 'Poças maiores, que duram mais, e mais garrafas.', map: 'praia' },
});
Object.assign(PASSIVES, {
  protetor:    { name: 'Protetor Solar', desc: 'Recebe 6% menos dano.', max: 4, map: 'praia' },
  chapeupalha: { name: 'Chapéu de Palha', desc: '+6% de velocidade e anda normal na água rasa.', max: 3, map: 'praia' },
  conchasorte: { name: 'Concha da Sorte', desc: 'Mais sorte e chance de um caju valer o dobro.', max: 4, map: 'praia' },
  aguacoco:    { name: 'Água de Coco', desc: 'Recupera 0,6 de vida por segundo.', max: 3, map: 'praia' },
});
Object.assign(SYN, {
  pescariagrande: { a: 'redepesca', b: 'tarrafa', name: 'Pescaria Grande', desc: 'Perto do mar, a rede de pesca puxa e fere o dobro.', map: 'praia' },
  arpoador:       { a: 'arpao', b: 'peixeira', name: 'Arpoador', desc: 'O arpão atravessa todos os inimigos.', map: 'praia' },
});
CHARS.jangadeiro = { name: 'Jangadeiro', weapon: 'arpao', bonus: 'Anda normal na água rasa e +20 de vida', hp: 20, price: 1500, unlockTxt: 'Vença uma noite na praia', ab: 'jangada', abName: 'Jangada', abDesc: 'Sobe na jangada por 4s: corre, não toma dano e atropela quem estiver na frente.', abCd: 13 };
CPAS.jangadeiro = 'Filho do mar: a correnteza não arrasta ele.';
S.jangadeiro.walk = S.jangadeiro.walk || null;
Object.assign(EN, {
  caranguejo: { hp: 7, spd: 40, dmg: 5, xp: 1, r: 4, spr: 'caranguejo', col: '#c8463c' },
  siri:       { hp: 4, spd: 56, dmg: 4, xp: 1, r: 3, spr: 'siri', col: '#4a8ab0' },
  gaivota:    { hp: 16, spd: 58, dmg: 6, xp: 3, r: 4, spr: 'gaivota', flap: 'gaivota2', fly: 1, col: '#e8eeff' },
  afogado:    { hp: 48, spd: 26, dmg: 9, xp: 4, r: 5, spr: 'afogado', col: '#8ab0a0' },
  batatao:    { hp: 22, spd: 56, dmg: 8, xp: 2, r: 4, spr: 'batatao', col: '#f2c14e' },
  tubarao:    { hp: 90, spd: 44, dmg: 12, xp: 4, r: 7, spr: 'tubarao', col: '#6a7a8a' },
  aguaviva:   { hp: 30, spd: 22, dmg: 7, xp: 2, r: 4, spr: 'aguaviva', sea: 1, col: '#c08cff' },
  pirata:     { hp: 240, spd: 34, dmg: 8, xp: 6, r: 5, spr: 'pirata', col: '#c8463c' },
  iaramar:      { hp: 2400, spd: 34, dmg: 13, xp: 5, r: 12, spr: 'iaramar', boss: 1, scale: 0.85, col: '#3aa8a0' },
  caboclo:      { hp: 2400, spd: 40, dmg: 14, xp: 5, r: 11, spr: 'caboclo', boss: 1, scale: 0.85, col: '#3d6b33' },
  polvo:        { hp: 2800, spd: 26, dmg: 14, xp: 5, r: 15, spr: 'polvo', boss: 1, scale: 0.9, col: '#8a3a6a' },
  sebastiao:    { hp: 2600, spd: 38, dmg: 15, xp: 5, r: 14, spr: 'sebastiao', boss: 1, scale: 0.9, col: '#1c1622' },
  caranguejorei:{ hp: 2800, spd: 36, dmg: 15, xp: 5, r: 15, spr: 'caranguejorei', boss: 1, scale: 0.9, col: '#a83a32' },
  baleia:       { hp: 3000, spd: 30, dmg: 16, xp: 5, r: 18, spr: 'baleia', boss: 1, scale: 0.85, col: '#5a6a8a' },
  holandes:     { hp: 2600, spd: 40, dmg: 14, xp: 5, r: 12, spr: 'holandes', boss: 1, fly: 1, scale: 0.85, col: '#9ad4c8' },
  navio:        { hp: 9000, spd: 22, dmg: 20, xp: 5, r: 22, spr: 'navio', boss: 1, scale: 1, col: '#9ad4c8' },
  princesa:     { hp: 32000, spd: 60, dmg: 28, xp: 5, r: 8, spr: 'princesa', boss: 1, snake: 1, segType: 'princesaSeg', headSpr: 'princesa', segSpr: 'princesaSeg', col: '#3aa8a0' },
  princesaSeg:  { hp: 1, spd: 0, dmg: 22, xp: 0, r: 6, seg: 1, col: '#3aa8a0' },
});
Object.assign(ENAMES, { caranguejo: 'Caranguejo-fantasma', siri: 'Siri', gaivota: 'Gaivota-fantasma', afogado: 'Afogado', batatao: 'Batatão', tubarao: 'Tubarão de areia', aguaviva: 'Água-viva', pirata: 'Pirata fantasma',
  iaramar: 'Iara do Mar', caboclo: "Caboclo d'Água", polvo: 'Polvo Gigante', sebastiao: 'Rei Sebastião', caranguejorei: 'Caranguejo-Rei', baleia: 'Baleia-Fantasma', holandes: 'Holandês Voador', navio: 'Navio Fantasma', princesa: 'Princesa-Serpente de Jericoacoara' });
const PFIG = ['caranguejo', 'siri', 'gaivota', 'afogado', 'batatao', 'tubarao', 'aguaviva', 'pirata', 'iaramar', 'caboclo', 'polvo', 'sebastiao', 'caranguejorei', 'baleia', 'holandes', 'navio', 'princesa'];
Object.assign(LENDAS, {
  caranguejo: 'Caranguejo que anda de lado entre as pedras e aparece aos montes na lua cheia.', siri: 'Siri azul que belisca o pé de quem anda na beira.',
  gaivota: 'Gaivota de olhos acesos que rouba o peixe dos pescadores.', afogado: 'Alma de pescador que o mar levou e que volta com a maré.',
  batatao: 'Bola de fogo que corre pela praia de madrugada e some quando alguém chega perto.', tubarao: 'Tubarão encantado que nada por baixo da areia.',
  aguaviva: 'Água-viva que brilha no escuro e queima quem encosta.', pirata: 'Marinheiros fantasmas que ainda procuram o tesouro enterrado.',
  iaramar: 'A senhora das águas salgadas, que canta para levar os pescadores.', caboclo: "O Caboclo d'Água mora no fundo e vira as canoas de quem não o respeita.",
  polvo: 'Polvo do tamanho de uma jangada, contado pelos pescadores mais velhos.', sebastiao: 'O rei encantado que vira touro negro com uma estrela na testa nas noites de São João.',
  caranguejorei: 'O rei dos mangues, de coroa de casca e garra que corta corda.', baleia: 'Baleia branca que encalhou há cem anos e ainda nada pela praia.',
  holandes: 'O capitão amaldiçoado que navega para sempre sem chegar ao porto.', navio: 'Navio de luz verde que surge na neblina antes das tempestades.',
  princesa: 'A princesa encantada sob o farol de Jericoacoara, que vira serpente.',
});
Object.assign(ACH, {
  praia5:     { name: 'Pé na Areia', desc: 'Sobreviva 5 minutos na praia.', reward: 'Visual Vaqueiro de Bermuda', rap: 0 },
  praianoite: { name: 'Amanhecer no Mar', desc: 'Vença uma noite na praia.', reward: '+150 rapaduras, o Jangadeiro e o visual Benzedeira de Branco', rap: 150, char: 'jangadeiro' },
  praiaboss:  { name: 'Navio Afundado', desc: 'Derrote o Navio Fantasma.', reward: 'Visual Pescador de Alto-Mar', rap: 0 },
  praiaforro: { name: 'Forró Pé-na-Areia', desc: 'Dance até o fim num forró da praia.', reward: 'Visual Forró Pé-na-Areia', rap: 0 },
  princesa:   { name: 'Farol Apagado', desc: 'Derrote a Princesa-Serpente no Pesadelo da praia.', reward: '+300 rapaduras e o visual Jangadeiro de Gala', rap: 300 },
});
const PB_POOL = [{ type: 'iaramar', name: 'A Iara do Mar' }, { type: 'caboclo', name: "O Caboclo d'Água" }, { type: 'polvo', name: 'O Polvo Gigante' }, { type: 'sebastiao', name: 'O Rei Sebastião' }, { type: 'caranguejorei', name: 'O Caranguejo-Rei' }, { type: 'baleia', name: 'A Baleia-Fantasma' }, { type: 'holandes', name: 'O Holandês Voador' }];
const PB_FINAL = { type: 'navio', name: 'O Navio Fantasma' }, PRAIA_SECRET = { type: 'princesa', name: 'A Princesa-Serpente' };
const SERT = { bosses: BOSSES.slice(), events: Object.assign({}, EVENTS) };
// troca chefões, eventos e duração conforme o mapa (BOSSES e EVENTS continuam os mesmos objetos)
function applyMap(pick) {
  RUN = MAP === 'praia' ? 900 : 1800; BOSSES.length = 0; for (const k in EVENTS) delete EVENTS[k];
  if (MAP !== 'praia') { BOSSES.push(...SERT.bosses); Object.assign(EVENTS, SERT.events); return; }
  if (pick || !G.pb) { const p = PB_POOL.slice(); G.pb = []; for (let i = 0; i < 4; i++) G.pb.push(p.splice((Math.random() * p.length) | 0, 1)[0].type); }
  [240, 360, 480, 630].forEach((t, i) => BOSSES.push(Object.assign({ t, mul: [0.8, 1.5, 2.4, 3.4][i] }, PB_POOL.find(b => b.type === G.pb[i])))); // o mesmo chefão fica mais forte quanto mais tarde aparece
  BOSSES.push(Object.assign({ t: 780 }, PB_FINAL)); Object.assign(EVENTS, PEVENTS);
}

/* ---------------- mar, maré e ilhas ---------------- */
let SEA = { ph: 0, ph2: 0, amp: 90 }, islands = [];
const shoreBase = x => MAPH * 0.3 + Math.sin(x * 0.0011 + SEA.ph) * SEA.amp + Math.sin(x * 0.004 + SEA.ph2) * 25;
const tideOff = () => (G ? (G.tide || 0) * 110 + (G.surge || 0) : 0);
const seaY = x => shoreBase(x) + tideOff();
function onIsland(x, y) { for (const s of islands) { const dx = (x - s.x) / s.rx, dy = (y - s.y) / s.ry; if (dx * dx + dy * dy < 1) return true; } return false; }
function depth(x, y) { return MAP !== 'praia' ? -1e9 : onIsland(x, y) ? -1 : seaY(x) - y; } // > 0 dentro do mar
const PRAIA = {};
PRAIA.newSea = () => { SEA = { ph: rand(0, 6.28), ph2: rand(0, 6.28), amp: rand(60, 120) }; islands = []; for (let i = 0, t = 0; i < 6 && t < 200; t++) { const x = rand(500, MAPW - 500), y = rand(250, shoreBase(x) - 420); if (y < 200 || islands.some(s => dist2(s.x, s.y, x, y) < 900 * 900)) continue; islands.push({ x, y, rx: rand(140, 240), ry: rand(70, 110), loot: true }); i++; } };
PRAIA.wslow = (x, y) => { const d = depth(x, y); return d <= 0 ? 1 : d > 220 ? 0.45 : 0.6; };
PRAIA.makeWorld = () => { // chão de areia e vegetação de praia (decoração fixa da noite)
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#2c3446'; x.fillRect(0, 0, 128, 128);
  const r = mulberry(5), cols = ['#323a4e', '#283042', '#36405a', '#262d3e']; for (let i = 0; i < 1100; i++) { x.fillStyle = cols[i % 4]; x.fillRect(r() * 128 | 0, r() * 128 | 0, 1, 1); }
  groundPat = ctx.createPattern(c, 'repeat');
  const pr = mulberry(13); patches = []; for (let i = 0; i < 2200; i++) patches.push({ x: pr() * MAPW, y: pr() * MAPH, rx: 30 + pr() * 90, ry: 18 + pr() * 50, c: ['#303850', '#28304a', '#2a3a48', '#343c52'][pr() * 4 | 0] });
  patchGrid = new Map(); for (const p of patches) { const key = ((p.x / 256) | 0) * 1000 + ((p.y / 256) | 0); let a = patchGrid.get(key); if (!a) patchGrid.set(key, a = []); a.push(p); }
  decor = []; const rr = mulberry(17);
  for (let i = 0; i < 15000; i++) { const dx = rr() * MAPW | 0, dy = rr() * MAPH | 0, v = rr(); if (dy < shoreBase(dx) + 140) continue; decor.push({ k: v < 0.12 ? 'coqueiro' : v < 0.18 ? 'cajueiro' : v < 0.21 ? 'carnauba' : v < 0.5 ? 'capimpraia' : v < 0.62 ? 'conchaD' : v < 0.75 ? 'pedra' : v < 0.8 ? 'xique' : 'capim', x: dx, y: dy }); }
  decorGrid = new Map(); for (const d of decor) { const key = ((d.x / 256) | 0) * 1000 + ((d.y / 256) | 0); let a = decorGrid.get(key); if (!a) decorGrid.set(key, a = []); a.push(d); }
  for (const k of ['coqueiro', 'cajueiro']) TALL.add(k);
  WORLD = 'praia';
};
const landY = (x, a, b) => shoreBase(x) + 110 + rand(a, b); // abaixo da maré cheia
PRAIA.makeSpots = () => {
  const sx = MAPW / 2, sy = landY(sx, 380, 460);
  const vil = (x, y, big, entered) => { const R = big ? 230 : 170, n = big ? 10 : 7, houses = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + rand(-0.25, 0.25), r = rand(R * 0.4, R * 0.75); houses.push({ x: x + Math.cos(a) * r, y: y + Math.sin(a) * r * 0.75 }); } villages.push({ x, y, r: R, big, houses, entered, t: 0, def: 0, vill: [], kind: 'pesc' }); };
  vil(sx, sy, true, true); player.x = sx; player.y = sy; if (player.pet) { player.pet.x = sx - 12; player.pet.y = sy + 8; }
  for (let t = 0; t < 200; t++) { const x = rand(500, MAPW - 500); if (Math.abs(x - sx) < 2600) continue; vil(x, landY(x, 300, 900), false, false); break; }
  const way = (ax, ay, bx, by) => { const pts = [], n = Math.max(6, Math.round(Math.hypot(bx - ax, by - ay) / 500)); for (let i = 0; i <= n; i++) { const k = i / n; pts.push({ x: clamp(ax + (bx - ax) * k + (i && i < n ? rand(-120, 120) : 0), 10, MAPW - 10), y: clamp(ay + (by - ay) * k + (i && i < n ? rand(-120, 120) : 0), 10, MAPH - 10) }); } roads.push(pts); };
  { const pts = []; for (let x = 0; x <= MAPW; x += 480) pts.push({ x, y: clamp(shoreBase(x) + 330 + rand(-50, 50), 10, MAPH - 10) }); roads.push(pts); }
  for (const v of villages) way(v.x, v.y, v.x + rand(-600, 600), MAPH - 20);
  way(rand(0.2, 0.8) * MAPW, shoreBase(MAPW / 2) + 330, rand(0.2, 0.8) * MAPW, MAPH);
  buildRoads(PCOL);
  const land = (m, a, b) => { for (let t = 0; t < 40; t++) { const x = rand(80, MAPW - 80), y = a == null ? rand(shoreBase(x) + 160, MAPH - 80) : landY(x, a, b); if (y > MAPH - 40 || Math.hypot(x - sx, y - sy) < 200 || inVillage(x, y, 40) || nearRiver(x, y, 30) || spots.some(s => dist2(s.x, s.y, x, y) < m * m)) continue; return [x, y]; } return null; };
  const put = (k, n, m, a, b) => { for (let i = 0; i < n; i++) { const p = land(m, a, b); if (p) spots.push(k === 'capela' ? { k, x: p[0], y: p[1], charge: 80 } : { k, x: p[0], y: p[1], cd: 0, hold: 0 }); } };
  put('capela', 10, 220); put('fogo', 18, 220); put('cruz', 16, 220); put('altar', 6, 300); put('piscina', 10, 260, 10, 70); put('jangada', 14, 300, 0, 30);
  for (const s of islands) { spots.push({ k: 'bauilha', x: s.x, y: s.y, cd: 0, hold: 0 }); }
  for (let i = 0; i < 110; i++) { const p = land(0); if (p && !onRoad2(p[0], p[1])) traps.push({ k: i < 80 ? 'espinho' : 'areia', x: p[0], y: p[1], r: i < 80 ? 14 : rand(24, 36) }); }
  // matas de coqueiro e lugares
  EXW = { forests: [], corn: [], marks: [], npcs: [] };
  const free = (m) => { for (let t = 0; t < 60; t++) { const x = rand(150, MAPW - 150), y = rand(shoreBase(x) + 200, MAPH - 150); if (inVillage(x, y, m + 40) || nearRiver(x, y, m) || onRoad2(x, y) || Math.hypot(x - sx, y - sy) < 300 || spots.some(s => dist2(s.x, s.y, x, y) < (m * 0.6 + 30) ** 2) || EXW.marks.some(k => dist2(k.x, k.y, x, y) < (m + 60) ** 2)) continue; return [x, y]; } return null; };
  for (const [k, n, m, nearSea] of [['farol', 2, 80, 1], ['igreja', 2, 60], ['barraca', 10, 40, 1], ['barforro', 4, 50, 1], ['pedraFurada', 4, 60, 1], ['ruina', 4, 40], ['catavento', 4, 30]]) for (let i = 0; i < n; i++) {
    let p = null; if (nearSea) { for (let t = 0; t < 40 && !p; t++) { const x = rand(150, MAPW - 150), y = landY(x, 40, 160); if (!inVillage(x, y, 60) && !nearRiver(x, y, 40) && !EXW.marks.some(q => dist2(q.x, q.y, x, y) < (m + 60) ** 2)) p = [x, y]; } } else p = free(m);
    if (p) EXW.marks.push({ k: k === 'barraca' ? 'barraca' : k, x: p[0], y: p[1] }); }
  for (const k of EXW.marks) if (k.k === 'barraca' || k.k === 'barforro' || k.k === 'igreja') EXW.npcs.push({ k: k.k === 'barforro' ? 'sanfoneiro' : Math.random() < 0.5 ? 'rendeira' : 'morador', x: k.x + rand(-26, 26), y: k.y + 24, line: PNPC[(Math.random() * PNPC.length) | 0] });
  for (let i = 0; i < 18; i++) { const p = free(200); if (!p) continue; const R = rand(110, 200), trees = []; for (let j = 0; j < R * R / 260; j++) { const a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * R, x = p[0] + Math.cos(a) * r, y = p[1] + Math.sin(a) * r * 0.75; if (y < shoreBase(x) + 150 || onRoad2(x, y) || nearRiver(x, y, 6)) continue; trees.push({ k: Math.random() < 0.6 ? 'coqueiro' : Math.random() < 0.6 ? 'cajueiro' : 'carnauba', x, y }); } EXW.forests.push({ x: p[0], y: p[1], r: R, trees }); }
  EXW.cliffs = []; for (let i = 0; i < 2; i++) { const x0 = rand(300, MAPW - 1500); EXW.cliffs.push([x0, x0 + rand(600, 1100)]); }
  buildExtraGrids();
};
const PCOL = ['#3a4052', '#424a5e', '#4a5268', '#3e4458', '#565e74']; // trilhas de areia batida
const PNPC = ['Pescador: "Na maré baixa a areia fica cheia de conchas!"', 'Rendeira: "Sobe numa jangada que o mar não te segura."', 'Pescador: "As ilhas lá no mar guardam baús dos antigos."', 'Barraqueira: "Peixe frito por umas rapaduras, freguês!"', 'Velho do farol: "Quando o navio verde aparece, é tempestade."'];

/* ---------------- eventos da praia ---------------- */
const strikes = [], boats = [], shoals = [], pships = [], pools2 = [];
const PEVENTS = {
  gaivotas:   { first: 70, every: [90, 130], run: () => { const a = Math.random() * 6.283, dx = Math.cos(a), dy = Math.sin(a), R = Math.hypot(VW, VH) / 2 + 12, n = 14 + Math.round(G.time / 60); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 14, x = player.x - dx * R - dy * o, y = player.y - dy * R + dx * o; if (x < 4 || y < 4 || x > MAPW - 4 || y > MAPH - 4) continue; const e = spawnEnemy('gaivota', x, y); e.spd = 130; e.march = (2 * R) / 130; e.cdx = dx; e.cdy = dy; } banner('Revoada de gaivotas!'); } },
  pescaria:   { first: 110, every: [120, 160], run: () => { for (let i = 0; i < 8; i++) { const x = clamp(player.x + rand(-220, 220), 20, MAPW - 20); shoals.push({ x, y: seaY(x) - rand(20, 120), life: 25, ph: Math.random() * 6 }); } banner('Pescaria da madrugada: pegue os cardumes na água rasa'); } },
  forro:      { first: 150, every: [150, 200], run: () => { const b = EXW.marks.filter(k => k.k === 'barforro').sort((p, q) => dist2(p.x, p.y, player.x, player.y) - dist2(q.x, q.y, player.x, player.y))[0]; if (b && dist2(b.x, b.y, player.x, player.y) < 700 * 700) { G.stage = { x: b.x, y: b.y + 34, life: 34, in: 0, done: false }; banner('Forró pé-na-areia no bar! Fique no círculo'); } else spawnForro(); } },
  tempestade: { first: 200, every: [180, 240], max: 3, hold: 30, run: () => { G.rain = 26; G.storm = 26; banner('Tempestade no mar!'); sfx('thunder'); } },
  barcos:     { first: 260, every: [150, 200], run: () => { const dir = Math.random() < 0.5 ? 1 : -1, x0 = player.x - dir * (VW / 2 + 40); for (let i = 0; i < 6; i++) { const x = x0 - dir * i * 30; boats.push({ x, y: 0, vx: dir * 32, life: (VW + 260) / 32 }); } banner('Procissão de barcos: chegue perto da beira para se curar'); } },
  ressaca:    { first: 340, every: [200, 260], run: () => { G.surgeT = 20; banner('Ressaca! O mar avança sobre a areia'); sfx('splash'); } },
  reveillon:  { first: 420, every: [200, 260], run: () => { G.fogos = 12; G.fogosT = 0; banner('Fogos de réveillon na praia!'); } },
  pirata:     { first: 500, every: [170, 220], run: () => { const dir = Math.random() < 0.5 ? 1 : -1; pships.push({ x: player.x - dir * (VW / 2 + 80), dir, life: (VW + 260) / 45, cd: 1.5 }); for (let i = 0; i < 4; i++) { const [x, y] = edgePos(); spawnEnemy('pirata', x, y).orb = i % 2 ? 1 : -1; } banner('Navio pirata! Fuja das balas de canhão'); sfx('warn'); } },
};

/* ---------------- visagens da praia ---------------- */
PRAIA.pick = m => {
  const w = [['caranguejo', Math.max(2, 10 - 1.2 * m)], ['siri', m > 0.5 ? 4 : 0], ['gaivota', m >= 2 ? 1 + 0.3 * m : 0], ['afogado', m >= 3 ? 0.8 + 0.3 * m : 0], ['batatao', m >= 4 && enemies.filter(e => e.type === 'batatao').length < 12 ? 0.4 + 0.08 * m : 0], ['tubarao', m >= 6 && enemies.filter(e => e.type === 'tubarao').length < 6 ? 0.5 + 0.1 * m : 0]];
  let tot = 0; for (const x of w) tot += x[1]; let r = Math.random() * tot; for (const x of w) { r -= x[1]; if (r <= 0) return x[0]; } return 'caranguejo';
};
EB2.caranguejo = (e, dt, dx, dy, d) => { const s = Math.sin(e.t * 3 + e.cc); return [dx / d * e.spd * 0.6 - dy / d * s * e.spd, dy / d * e.spd * 0.6 + dx / d * s * e.spd]; };
EB2.siri = (e, dt, dx, dy, d) => [dx / d * e.spd + Math.sin(e.t * 9) * 16, dy / d * e.spd + Math.cos(e.t * 8) * 16];
EB2.gaivota = EB2.coruja;
EB2.batatao = (e, dt, dx, dy, d) => { if (Math.random() < 0.4) part(e.x, e.y, rand(-8, 8), rand(-8, 8), 0.3, '#f2c14e', 1, true); return [dx / d * e.spd + Math.cos(e.t * 6) * 28, dy / d * e.spd + Math.sin(e.t * 5) * 28]; };
EB2.tubarao = EB2.tatu;
EB2.pirata = EB2.cangaceiro;
EB2.aguaviva = (e, dt, dx, dy, d) => {
  if (depth(e.x, e.y) <= 0) { e.dry = (e.dry || 0) + dt; if (e.dry > 3) { e.alive = false; burst(e.x, e.y, '#c08cff', 10, true); } return [0, 0]; } e.dry = 0;
  e.cc -= dt; if (e.cc <= 0) { e.cc = 3; if (d < 34) playerHit(e.d.dmg * 0.8); fx.push({ k: 'cura', x: e.x, y: e.y, r: 34, life: 0.4, max: 0.4 }); }
  const nx = e.x + dx / d * 10, ny = e.y + dy / d * 10; return depth(nx, ny) > 0 ? [dx / d * e.spd, dy / d * e.spd + Math.sin(e.t * 2) * 6] : [0, 0];
};
const PDM = () => tdm();
EB2.iaramar = (e, dt, dx, dy, d, px, py, dm) => {
  if (d < 200 && !G.dawn) { player.x -= dx / d * 16 * dt; player.y -= dy / d * 16 * dt; }
  e.cc -= dt; if (e.cc <= 0) { e.cc = e.raged ? 3 : 4.5; ewaves.push({ x: e.x, y: e.y, r: 0, max: 200, spd: 100, hit: false, dmg: e.d.dmg * 0.5 * dm }); for (let i = 0; i < 3; i++) { const [x, y] = edgePos(); spawnEnemy('afogado', x, y); } sfx('splash'); }
  return null;
};
EB2.caboclo = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt;
  if (e.vanish > 0) { e.vanish -= dt; if (e.vanish <= 0) { const a = Math.random() * 6.283; e.x = clamp(px + Math.cos(a) * 90, 10, MAPW - 10); e.y = clamp(py + Math.sin(a) * 70, 10, MAPH - 10); puff(e.x, e.y, '#3aa8a0'); const a0 = Math.atan2(py - e.y, px - e.x), D = 8 * (1 + G.time / 400); for (let i = -1; i <= 1; i++) projs.push({ k: 'ebala', x: e.x, y: e.y - 4, vx: Math.cos(a0 + i * 0.2) * 150, vy: Math.sin(a0 + i * 0.2) * 150, life: 2.5, dmg: D }); sfx('shoot'); } return [0, 0]; }
  if (e.cc <= 0) { e.cc = e.raged ? 3.5 : 5; e.vanish = 1; burst(e.x, e.y, '#3aa8a0', 14); sfx('splash'); }
  return null;
};
EB2.polvo = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt; if (e.cc <= 0) { e.cc = e.raged ? 2.6 : 3.5; for (let i = 0; i < 3; i++) strikes.push({ x: clamp(px + rand(-50, 50) + player.fx * 30, 10, MAPW - 10), y: clamp(py + rand(-40, 40) + player.fy * 30, 10, MAPH - 10), t: 0, T: 1, r: 18, dmg: e.d.dmg * 0.6 * dm, stun: 0.4, k: 'tent' }); }
  e.ink = (e.ink == null ? 4 : e.ink) - dt; if (e.ink <= 0) { e.ink = 7; for (let i = 0; i < 4; i++) goos.push({ x: e.x + rand(-60, 60), y: e.y + rand(-40, 40), r: 22, life: 6, c: 3 }); }
  return null;
};
EB2.sebastiao = (e, dt, dx, dy, d) => {
  e.sm = (e.sm == null ? 3 : e.sm) - dt; if (e.sm <= 0) { e.sm = 7; for (let i = 0; i < 4; i++) { const [x, y] = edgePos(); spawnEnemy('afogado', x, y); } }
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { e.ch = 0.75; e.cdx = dx / d; e.cdy = dy / d; G.shake = Math.max(G.shake, 2); } return [0, 0]; }
  if (e.ch > 0) { e.ch -= dt; if (Math.random() < 0.5) part(e.x, e.y + 8, rand(-15, 15), rand(-15, -4), 0.4, '#b8a27a', 2); return [e.cdx * 190, e.cdy * 190]; }
  e.cc -= dt; if (e.cc <= 0) { e.wind = 0.55; e.cc = e.raged ? 2.8 : 3.8; }
  return null;
};
EB2.caranguejorei = (e, dt, dx, dy, d, px, py, dm) => {
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { fx.push({ k: 'arm', x: e.x, y: e.y, tx: px, ty: py, life: 0.25, max: 0.25 }); if (d < 80) playerHit(e.d.dmg * 0.9 * dm); } return [0, 0]; }
  if (e.ch > 0) { e.ch -= dt; return [e.cdx * 170, e.cdy * 170]; }
  e.cc -= dt; if (e.cc <= 0) { e.cc = e.raged ? 2.2 : 3; if (d < 75) e.wind = 0.5; else { const sd = Math.random() < 0.5 ? 1 : -1; e.ch = 0.6; e.cdx = (dx / d * 0.5 - dy / d * sd); e.cdy = (dy / d * 0.5 + dx / d * sd); } }
  return null;
};
EB2.baleia = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt;
  if (e.hide) { if (Math.random() < 0.6) part(e.x + rand(-20, 20), e.y, rand(-10, 10), rand(-20, -5), 0.4, '#a8c4d8', 2); if (e.cc <= 0 || d < 20) { e.hide = false; e.cc = 3.5; ewaves.push({ x: e.x, y: e.y, r: 0, max: 160, spd: 120, hit: false, dmg: e.d.dmg * 0.6 * dm }); G.shake = Math.max(G.shake, 4); sfx('boom'); burst(e.x, e.y, '#a8c4d8', 24); } return [dx / d * 120, dy / d * 120]; }
  e.sp = (e.sp == null ? 1.5 : e.sp) - dt; if (e.sp <= 0) { e.sp = e.raged ? 1.8 : 2.4; projs.push({ k: 'pedrao', sx: e.x, sy: e.y - 20, tx: px + rand(-40, 40), ty: py + rand(-30, 30), x: e.x, y: e.y, t: 0, T: 1.1, life: 1, dmg: 9 * dm, agua: 1 }); }
  if (e.cc <= 0) { e.hide = true; e.cc = 2.5; }
  return null;
};
EB2.holandes = (e, dt, dx, dy, d, px, py) => {
  e.sh = (e.sh == null ? 2 : e.sh) - dt; if (e.sh <= 0) { e.sh = e.raged ? 2.2 : 3; bossShoot(e, 12, 75, e.t); }
  e.sm = (e.sm == null ? 5 : e.sm) - dt; if (e.sm <= 0) { e.sm = 8; for (let i = 0; i < 3; i++) { const [x, y] = edgePos(); spawnEnemy('pirata', x, y).orb = i % 2 ? 1 : -1; } }
  e.cc -= dt; if (e.cc <= 0) { e.cc = 6; puff(e.x, e.y, '#9ad4c8'); const a = Math.random() * 6.283; e.x = clamp(px + Math.cos(a) * 110, 10, MAPW - 10); e.y = clamp(py + Math.sin(a) * 80, 10, MAPH - 10); puff(e.x, e.y, '#9ad4c8'); sfx('tp'); }
  return [dx / d * e.spd + Math.cos(e.t * 2) * 20, dy / d * e.spd + Math.sin(e.t * 2) * 20];
};
EB2.navio = (e, dt, dx, dy, d, px, py, dm) => {
  e.cc -= dt; if (e.cc <= 0) { e.cc = e.raged ? 1.8 : 2.5; for (let i = 0; i < 5; i++) projs.push({ k: 'pedrao', sx: e.x, sy: e.y - 10, tx: px + rand(-70, 70), ty: py + rand(-50, 50), x: e.x, y: e.y, t: 0, T: 1 + i * 0.12, life: 1, dmg: 13 * dm }); sfx('boom'); }
  e.sm = (e.sm == null ? 4 : e.sm) - dt; if (e.sm <= 0) { e.sm = 9; for (let i = 0; i < 4; i++) spawnEnemy('pirata', e.x + rand(-30, 30), e.y + rand(-20, 20)).orb = i % 2 ? 1 : -1; }
  return null;
};
EB2.princesa = (e, dt, dx, dy) => {
  const want = Math.atan2(dy, dx); let da = want - e.ang; while (da > Math.PI) da -= 6.283; while (da < -Math.PI) da += 6.283;
  e.ang += clamp(da, -2.6 * dt, 2.6 * dt); const a = e.ang + Math.sin(e.t * 4) * 0.6;
  e.sh = (e.sh == null ? 2 : e.sh) - dt; if (e.sh <= 0) { e.sh = e.raged ? 2 : 3; bossShoot(e, 10, 80, e.t); }
  if (Math.random() < 0.6) part(e.x, e.y, rand(-15, 15), rand(-15, 15), 0.4, Math.random() < 0.5 ? '#3aa8a0' : '#f2c14e', 2, true);
  return [Math.cos(a) * e.spd, Math.sin(a) * e.spd];
};
{ const sb0 = spawnBoss; window.spawnBoss = b => { sb0(b); if (b.mul && G.boss) G.boss.hp = G.boss.maxHp = G.boss.maxHp * b.mul; }; }
{ const ok0 = EXH.onKill; EXH.onKill = e => { ok0(e); if (e.type === 'navio') unlockAch('praiaboss'); if (e.type === 'pirata') drop(e.x, e.y, 'rap', 3); }; }

/* ---------------- armas e itens da praia ---------------- */
WB2.arpao = (l, ev) => { const s = { dmg: 40 + 14 * (l - 1), cd: 1.6 - 0.06 * l, n: 1 + Math.floor(l / 4), spd: 300, pierce: 3 + Math.floor(l / 3), area: 1 }; if (ev) { s.pierce = 99; s.dmg *= 1.4; s.n += 1; } return s; };
WB2.redepesca = (l, ev) => { const s = { dmg: 17 + 6 * (l - 1), cd: 2.8 - 0.1 * l, rad: 70 + 3 * l, arc: 1.1, pull: 150, area: 1 }; if (ev) { s.arc = 1.8; s.rad *= 1.25; s.dmg *= 1.4; s.pull = 220; } return s; };
WB2.remo = (l, ev) => { const s = { dmg: 30 + 9 * (l - 1), cd: 2.2 - 0.08 * l, rad: 46 + 2 * l, kb: 260, stun: 0.4, area: 1 }; if (ev) { s.dmg *= 1.4; s.rad *= 1.25; s.both = 1; } return s; };
WB2.concha = (l, ev) => { const s = { dmg: 20 + 7 * (l - 1), cd: 2 - 0.07 * l, n: 3 + Math.floor(l / 3), spd: 170, b: 2 + Math.floor(l / 4), area: 1 }; if (ev) { s.n += 3; s.b += 3; } return s; };
WB2.mensagem = (l, ev) => { const s = { dmg: 4.2 + 1.5 * (l - 1), cd: 2.6 - 0.09 * l, n: 1 + Math.floor(l / 4), rad: 26 + 1.5 * l, dur: 3, area: 1 }; if (ev) { s.rad *= 1.4; s.dur = 4.5; s.n += 1; } return s; };
const nearSea = () => depth(player.x, player.y) > -200;
FIRE2.arpao = (w, s) => { const base = aimAt(240); for (let i = 0; i < s.n; i++) { const a = base + (i - (s.n - 1) / 2) * 0.15; projs.push({ k: 'arpao', x: player.x, y: player.y - 3, vx: Math.cos(a) * s.spd, vy: Math.sin(a) * s.spd, life: 0.9 * s.area, dmg: s.dmg, pierce: G.syn.arpoador ? 99 : s.pierce, hit: new Set() }); } sfx('shoot'); };
FIRE2.redepesca = (w, s) => { const fa = aimAt(s.rad * s.area + 20), R = s.rad * s.area, k = G.syn.pescariagrande && nearSea() ? 2 : 1; query(player.x, player.y, R + 12, Q);
  for (const e of Q) { if (!e.alive || e.d.prop) continue; const ex = e.x - player.x, ey = e.y - player.y, d = Math.hypot(ex, ey) || 1; if (d > R + e.r) continue; let da = Math.atan2(ey, ex) - fa; da = Math.atan2(Math.sin(da), Math.cos(da)); if (Math.abs(da) < s.arc) hurt(e, s.dmg * k, -ex / d * s.pull * k, -ey / d * s.pull * k, 'redepesca'); }
  fx.push({ k: 'redep', a: fa, r: R, arc: s.arc, life: 0.3, max: 0.3 }); sfx('swing'); };
FIRE2.remo = (w, s) => { w.side = -(w.side || 1); const fa = aimAt(s.rad * s.area + 20), R = s.rad * s.area; query(player.x, player.y, R + 12, Q);
  for (const e of Q) { if (!e.alive || e.d.prop) continue; const ex = e.x - player.x, ey = e.y - player.y, d = Math.hypot(ex, ey) || 1; if (d > R + e.r) continue; let da = Math.atan2(ey, ex) - fa; da = Math.atan2(Math.sin(da), Math.cos(da)); if (s.both || da * w.side >= -0.3) { const t = e.parent || e; t.root = Math.max(t.root, s.stun); hurt(e, s.dmg, ex / d * s.kb, ey / d * s.kb, 'remo'); } }
  fx.push({ k: 'remo', a: fa, side: s.both ? 0 : w.side, r: R, life: 0.22, max: 0.22 }); G.shake = Math.max(G.shake, 1.5); sfx('swing'); };
FIRE2.concha = (w, s) => { for (let i = 0; i < s.n; i++) { const t = i === 0 ? nearest(player.x, player.y, 200) : randomNear(player.x, player.y, 200); if (!t) return; projs.push({ k: 'concha', x: player.x, y: player.y - 3, tgt: t, spd: s.spd, life: 3, dmg: s.dmg, b: s.b, hit: new Set() }); } sfx('pick'); };
FIRE2.mensagem = (w, s) => { for (let i = 0; i < s.n; i++) { const t = randomNear(player.x, player.y, 180), a = Math.random() * 6.283; projs.push({ k: 'garrafa2', sx: player.x, sy: player.y, tx: t ? t.x : player.x + Math.cos(a) * 70, ty: t ? t.y : player.y + Math.sin(a) * 50, x: player.x, y: player.y, t: 0, T: 0.6, delay: i * 0.15, dmg: s.dmg, rad: s.rad, dur: s.dur, life: 1 }); } };
PROJ2.arpao = (p, dt) => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; query(p.x, p.y, 16, Q); for (const e of Q) if (e.alive && !p.hit.has(e) && dist2(p.x, p.y, e.x, e.y) < (e.r + 3) ** 2) { p.hit.add(e); hurt(e, p.dmg, -p.vx * 0.25, -p.vy * 0.25, 'arpao'); if (--p.pierce <= 0) { p.life = 0; break; } } };
PROJ2.concha = (p, dt) => {
  p.life -= dt; if (!p.tgt || !p.tgt.alive) { p.tgt = null; query(p.x, p.y, 130, Q); let bd = 1e9; for (const e of Q) if (e.alive && !e.d.prop && !p.hit.has(e)) { const d = dist2(p.x, p.y, e.x, e.y); if (d < bd) { bd = d; p.tgt = e; } } if (!p.tgt) { p.life = 0; return; } }
  const dx = p.tgt.x - p.x, dy = p.tgt.y - p.y, d = Math.hypot(dx, dy) || 1, st = Math.min(d, p.spd * dt); p.x += dx / d * st; p.y += dy / d * st; p.ang = (p.ang || 0) + dt * 14;
  if (d < p.tgt.r + 3) { p.hit.add(p.tgt); hurt(p.tgt, p.dmg, dx / d * 30, dy / d * 30, 'concha'); p.tgt = null; if (--p.b < 0) p.life = 0; }
};
PROJ2.garrafa2 = (p, dt) => {
  if (p.delay > 0) { p.delay -= dt; p.sx = player.x; p.sy = player.y; return; } p.t += dt; const q = Math.min(1, p.t / p.T); p.x = p.sx + (p.tx - p.sx) * q; p.y = p.sy + (p.ty - p.sy) * q - Math.sin(Math.PI * q) * 30;
  if (q >= 1) { pools2.push({ x: p.tx, y: p.ty, r: p.rad, life: p.dur, max: p.dur, dmg: p.dmg, tk: 0 }); muds.push({ x: p.tx, y: p.ty, r: p.rad, life: p.dur }); burst(p.tx, p.ty, '#7fb2e5', 10); sfx('splash'); if (Math.random() < 0.12) drop(p.tx, p.ty, 'xp', 8); p.life = 0; }
};
DPROJ2.arpao = p => { const a = Math.atan2(p.vy, p.vx), x = p.x, y = p.y; ctx.strokeStyle = '#8a5a2b'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x - Math.cos(a) * 12, y - Math.sin(a) * 12); ctx.lineTo(x, y); ctx.stroke(); ctx.fillStyle = '#c9c9d6'; ctx.fillRect(Math.round(x + Math.cos(a) * 2) - 1, Math.round(y + Math.sin(a) * 2) - 1, 2, 2); };
DPROJ2.concha = p => { ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(p.ang || 0); ctx.drawImage(S.i_concha.n, -4, -4); ctx.restore(); };
DPROJ2.garrafa2 = p => { if (p.delay > 0) return; drawSpr(S.i_mensagem, p.x, p.y, { sc: 0.8 }); };
{ const f0 = EXH.drawFx; EXH.drawFx = () => { f0();
  for (const f of fx) if (f.k === 'redep') { const a = f.life / f.max; ctx.globalAlpha = a; ctx.strokeStyle = '#c9d4e0'; ctx.lineWidth = 1; for (let r = f.r * 0.4; r <= f.r * (1.1 - a * 0.2); r += 8) { ctx.beginPath(); ctx.arc(player.x, player.y, r, f.a - f.arc, f.a + f.arc); ctx.stroke(); } for (let k = -2; k <= 2; k++) { const b = f.a + k * f.arc / 2; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(player.x + Math.cos(b) * f.r, player.y + Math.sin(b) * f.r); ctx.stroke(); } }
  for (const f of fx) if (f.k === 'remo') { const a = f.life / f.max, s0 = f.side >= 0 ? -0.3 : -Math.PI / 2 - 0.4, s1 = f.side <= 0 ? 0.3 : Math.PI / 2 + 0.4; ctx.globalAlpha = a; ctx.strokeStyle = '#a8784a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(player.x, player.y, f.r * 0.75, f.a + (f.side === 0 ? -1.6 : s0), f.a + (f.side === 0 ? 1.6 : s1)); ctx.stroke(); }
  for (const s of strikes) { const k = Math.min(1, s.t / s.T); ctx.globalAlpha = 1; ctx.strokeStyle = `rgba(255,59,46,${0.4 + 0.5 * k})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.r, s.r * 0.6, 0, 0, 6.283); ctx.stroke(); }
  ctx.globalAlpha = 1; }; }
{ const hm0 = EXH.dmgIn; EXH.dmgIn = (dmg, src) => hm0(dmg, src) * (1 - 0.06 * (player.pass.protetor || 0)); }
{ const xm0 = EXH.xpMul; EXH.xpMul = () => xm0() * (Math.random() < 0.05 * (player.pass.conchasorte || 0) ? 2 : 1); }
{ const rc0 = recalc; window.recalc = function () { rc0(); const pv = player.pass; player.st.spd *= 1 + 0.06 * (pv.chapeupalha || 0); player.st.luck *= 1 + 0.15 * (pv.conchasorte || 0); }; }

/* ---------------- mundo da praia: atualização ---------------- */
const freeWater = () => player.char === 'jangadeiro' || player.pass.chapeupalha || G.boat > 0;
PRAIA.playerWater = dt => { // devolve o fator de velocidade e aplica a correnteza
  const d = depth(player.x, player.y); if (d <= 0) return G.boat > 0 ? 1.6 : 1;
  const deep = d > 220; if (G.boat > 0) return 1.6;
  if (player.char !== 'jangadeiro') { const k = (deep ? 26 : 10) + (G.surge > 60 ? 18 : 0); player.y = clamp(player.y - k * dt, 8, MAPH - 8); player.x = clamp(player.x + Math.sin(G.time * 0.5) * k * 0.6 * dt, 8, MAPW - 8); }
  return deep ? 0.45 : freeWater() ? 1 : 0.6;
};
EXH.praia = dt => {
  G.tide = Math.sin(G.time * 6.283 / 150);
  if (G.surgeT > 0) { G.surgeT -= dt; G.surge = Math.min(260, (G.surge || 0) + 160 * dt); } else G.surge = Math.max(0, (G.surge || 0) - 80 * dt);
  const pv = player.pass; if (pv.aguacoco && !G.dawn) player.hp = Math.min(player.maxHp, player.hp + 0.6 * pv.aguacoco * dt);
  if (G.boat > 0) { G.boat -= dt; query(player.x, player.y, 24, Q); for (const e of Q) if (e.alive && !e.d.prop && !e.d.boss && (e.boatT || 0) < G.time && dist2(e.x, e.y, player.x, player.y) < (e.r + 12) ** 2) { e.boatT = G.time + 0.6; hurt(e, 60 * player.st.dmg, player.fx * 150, player.fy * 150); } }
  if (G.time >= 300) unlockAch('praia5');
  if (G.stage && G.stage.done) unlockAch('praiaforro');
  // maré baixa: conchas, rapadura e às vezes um baú na areia descoberta
  if (G.tide < -0.9 && !G.lowDone) { G.lowDone = true; for (let i = 0; i < 12; i++) { const x = clamp(player.x + rand(-300, 300), 20, MAPW - 20), y = shoreBase(x) - rand(0, 90); drop(x, y, i === 0 && Math.random() < 0.3 ? 'bau' : i < 3 ? 'rap' : 'xp', i < 3 ? 2 : 4); } toast('Maré baixa: a areia descoberta está cheia de conchas!'); }
  if (G.tide > 0) G.lowDone = false;
  // visagens que o mar traz na maré cheia, e a Mãe-d'Água na beira
  if (!G.dawn && G.tide > 0.3) { G.seaAcc = (G.seaAcc || 0) + dt * (0.3 + G.time / 600); while (G.seaAcc >= 1) { G.seaAcc -= 1; const x = clamp(player.x + (Math.random() < 0.5 ? -1 : 1) * (VW / 2 + rand(10, 60)), 10, MAPW - 10), sy = seaY(x); if (Math.abs(sy - player.y) < 260 && enemies.length - G.nProps < 560) spawnEnemy(Math.random() < 0.5 ? 'aguaviva' : Math.random() < 0.6 ? 'afogado' : 'caranguejo', x, sy - rand(10, 80)); } }
  G.iaraT2 = (G.iaraT2 == null ? 60 : G.iaraT2) - dt; if (G.iaraT2 <= 0 && !G.dawn && Math.abs(seaY(player.x) - player.y) < 220) { G.iaraT2 = rand(50, 70); spawnEnemy('iara', player.x + rand(-80, 80), seaY(player.x) - 20); toast("A Mãe-d'Água está cantando: fuja da beira!"); }
  // pegadas na areia
  if (player.moving && depth(player.x, player.y) < -6 && !(G.boat > 0)) { G.stepT = (G.stepT || 0) - dt; if (G.stepT <= 0) { G.stepT = 0.16; marks.push({ x: player.x, y: player.y + 5, life: 5, a: Math.atan2(player.fy, player.fx), s: (G.stepS = -(G.stepS || 1)), c: 'rgba(18,22,36,0.8)' }); } }
  // sons do mar
  G.waveS = (G.waveS || 2) - dt; if (G.waveS <= 0) { G.waveS = rand(2.5, 5); if (Math.abs(seaY(player.x) - player.y) < 450) sfx('onda'); }
  G.gullS = (G.gullS || 8) - dt; if (G.gullS <= 0) { G.gullS = rand(7, 14); sfx('gaivota'); }
  // eventos em andamento
  if (G.storm > 0 && !G.dawn) { G.storm -= dt; G.stT = (G.stT || 0) - dt; if (G.stT <= 0) { G.stT = 1.1; strikes.push({ x: clamp(player.x + rand(-150, 150), 10, MAPW - 10), y: clamp(player.y + rand(-100, 100), 10, MAPH - 10), t: 0, T: 0.9, r: 22, dmg: 10 * tdm() / 2, edmg: 100 * (1 + G.time / 400), k: 'raio' }); } }
  for (const s of strikes) { s.t += dt; if (s.t >= s.T) { s.done = true; if (dist2(s.x, s.y, player.x, player.y) < s.r * s.r) { playerHit(s.dmg); if (s.stun) G.stun = Math.max(G.stun, s.stun); }
    if (s.k === 'raio') { query(s.x, s.y, s.r + 14, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(e.x, e.y, s.x, s.y) < (s.r + e.r) ** 2) hurt(e, s.edmg); fx.push({ k: 'raio', x: s.x, y: s.y, life: 0.25, max: 0.25, sd: Math.random() * 99 }); G.flash = Math.max(G.flash || 0, 0.5); sfx('thunder'); } else { burst(s.x, s.y, '#8a3a6a', 12); G.shake = Math.max(G.shake, 2); } } }
  compact(strikes, s => !s.done);
  for (const b of boats) { b.x += b.vx * dt; b.y = seaY(b.x) - 26; b.life -= dt; if (dist2(b.x, b.y, player.x, player.y) < 40 * 40 && player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + 5 * dt / 3); }
  compact(boats, b => b.life > 0);
  for (const s of shoals) { s.life -= dt; s.y = Math.min(s.y, seaY(s.x) - 10); if (dist2(s.x, s.y, player.x, player.y) < 16 * 16) { s.life = 0; drop(player.x, player.y, 'cuscuz', 30); items[items.length - 1].food = true; drop(player.x + 6, player.y, 'xp', 5); sfx('splash'); burst(s.x, s.y, '#c9d4e0', 8); } }
  compact(shoals, s => s.life > 0);
  for (const sh of pships) { sh.x += sh.dir * 45 * dt; sh.y = seaY(sh.x) - 110; sh.life -= dt; sh.cd -= dt; if (sh.cd <= 0) { sh.cd = 2; projs.push({ k: 'pedrao', sx: sh.x, sy: sh.y, tx: player.x + rand(-40, 40), ty: player.y + rand(-30, 30), x: sh.x, y: sh.y, t: 0, T: 1.2, life: 1, dmg: 12 * tdm() / 2 }); sfx('boom'); } }
  compact(pships, s => s.life > 0);
  for (const p of pools2) { p.life -= dt; p.tk -= dt; if (p.tk <= 0) { p.tk = 0.4; query(p.x, p.y, p.r + 14, Q); for (const e of Q) if (e.alive && !e.d.prop && dist2(p.x, p.y, e.x, e.y) < (p.r + e.r) ** 2) hurt(e, p.dmg, undefined, undefined, 'mensagem'); } }
  compact(pools2, p => p.life > 0);
  // lugares da praia
  for (const s of spots) { const d2 = dist2(s.x, s.y, player.x, player.y);
    if (s.k === 'piscina') { if (d2 < 22 * 22 && player.hp < player.maxHp) { player.hp = Math.min(player.maxHp, player.hp + 4 * dt); if (Math.random() < 0.2) part(player.x + rand(-5, 5), player.y, 0, -18, 0.6, '#7fb2e5', 1, true); } }
    else if (s.k === 'jangada') { s.cd -= dt; if (s.cd <= 0 && d2 < 16 * 16) { s.cd = 70; G.boat = 12; toast('De jangada: mais rápido, a água não segura e atropela as visagens por 12s'); sfx('splash'); } }
    else if (s.k === 'bauilha') { if (!s.used && d2 < 18 * 18) { s.hold += dt; if (s.hold >= 1) { s.used = true; drop(s.x, s.y, 'bau', 1); drop(s.x + 10, s.y, 'rap', 8); toast('Baú da ilha!'); sfx('win'); burst(s.x, s.y, '#f2c14e', 20, true); } } else s.hold = 0; } }
};
SFX.onda = t => noise(t, 1.5, 0.1, 480);
SFX.gaivota = t => { tone(t, 'sine', 1900, 1250, 0.14, 0.035); tone(t + 0.2, 'sine', 1750, 1150, 0.18, 0.035); };
{ const w0 = EXH.world; EXH.world = dt => { w0(dt); if (MAP === 'praia') EXH.praia(dt); }; }
{ const r0 = EXH.reset; EXH.reset = () => { r0(); strikes.length = boats.length = shoals.length = pships.length = pools2.length = 0; }; }
PRAIA.jangadaAb = (AP) => { const T = 4 * (AP || 1); G.boat = T; player.inv = Math.max(player.inv, T); burst(player.x, player.y, '#7fb2e5', 16); sfx('splash'); };

/* ---------------- mundo da praia: desenho ---------------- */
PRAIA.drawSea = () => {
  const T = G.time, x0 = Math.floor(camX / 6) * 6, x1 = camX + VW + 6;
  for (let x = x0; x < x1; x += 6) { // areia molhada, mar raso e fundo, em faixas de pixel como o rio
    const sy = Math.round(seaY(x + 3)), sb = Math.round(shoreBase(x + 3) + 110); if (sy < camY - 10 && sb < camY) continue;
    ctx.fillStyle = 'rgba(20,28,44,0.55)'; ctx.fillRect(x, sy, 6, Math.max(0, sb - sy + 6));
    if (sy < camY) continue; const top = camY - 2;
    ctx.fillStyle = '#0c2440'; ctx.fillRect(x, top, 6, Math.max(0, sy - 220 - top));
    ctx.fillStyle = '#123a5c'; ctx.fillRect(x, Math.max(top, sy - 220), 6, Math.max(0, Math.min(160, sy - 60 - Math.max(top, sy - 220))));
    ctx.fillStyle = '#1b5470'; ctx.fillRect(x, Math.max(top, sy - 60), 6, Math.max(0, sy - Math.max(top, sy - 60)));
    ctx.fillStyle = '#bfe4f0'; ctx.fillRect(x, sy - 2 + Math.round(Math.sin(T * 2 + x * 0.05) * 2), 6, 2);
    if (((x / 6) | 0) % 3 === 0) { ctx.fillStyle = 'rgba(190,228,240,0.35)'; ctx.fillRect(x, sy - 14 - Math.round(((T * 18 + x * 0.7) % 40)), 4, 1); }
  }
  ctx.fillStyle = 'rgba(160,200,230,0.35)'; for (let i = 0; i < 40; i++) { const wx = camX + ((i * 97.3 + T * 8) % (VW + 20)) - 10, sy = seaY(wx); const wy = camY + (i * 53.1) % Math.max(1, sy - camY - 30); if (wy < sy - 30) ctx.fillRect(Math.round(wx), Math.round(wy), 5, 1); }
  { const mx = camX + VW * 0.74, sy = seaY(mx); for (let y = Math.max(camY, 0); y < sy - 8; y += 3) { const w = 6 + Math.sin(y * 0.3 + T * 3) * 4 + (sy - y) * 0.01; ctx.fillStyle = `rgba(244,231,182,${0.18 + 0.12 * Math.sin(y * 0.7 + T * 5)})`; ctx.fillRect(Math.round(mx - w / 2 + Math.sin(y * 0.11 + T) * 3), y, Math.max(2, Math.round(w)), 1); } }
  for (const s of islands) { if (!onScreen(s.x, s.y, s.rx + 20)) continue; ctx.fillStyle = 'rgba(190,228,240,0.5)'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.rx + 4 + Math.sin(T * 2) * 2, s.ry + 3, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#3a4258'; ctx.beginPath(); ctx.ellipse(s.x, s.y, s.rx, s.ry, 0, 0, 6.283); ctx.fill(); for (let i = 0; i < 5; i++) drawSpr(S.coqueiro, s.x + Math.cos(i * 1.3) * s.rx * 0.5, s.y + Math.sin(i * 2.1) * s.ry * 0.4); }
  if (EXW.cliffs) for (const [a, b] of EXW.cliffs) for (let x = Math.max(a, x0); x < Math.min(b, x1); x += 6) { const y = Math.round(shoreBase(x) + 128), h = 20 + Math.round(Math.sin(x * 0.03) * 4); if (y > camY + VH || y + h < camY) continue; const cols = ['#a8503a', '#c9883a', '#e8d0a0', '#8a4a6a', '#c96a3a']; for (let k = 0; k < 5; k++) { ctx.fillStyle = cols[(k + ((x / 30) | 0)) % 5]; ctx.fillRect(x, y + k * h / 5, 6, Math.ceil(h / 5)); } ctx.fillStyle = '#3d6b33'; ctx.fillRect(x, y - 2, 6, 2); }
};
{ const g0 = EXH.drawGround; EXH.drawGround = () => {
  if (MAP === 'praia') {
    for (const p of pools2) if (onScreen(p.x, p.y, p.r)) { ctx.globalAlpha = 0.5 * Math.min(1, p.life / 0.5); ctx.fillStyle = '#2a6cc8'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1; }
    for (const s of spots) { if (!onScreen(s.x, s.y, 30)) continue;
      if (s.k === 'piscina') { ctx.fillStyle = '#5a5a70'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 20, 12, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#2a7aa0'; ctx.beginPath(); ctx.ellipse(s.x, s.y, 16, 9, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(200,240,255,0.6)'; ctx.fillRect(Math.round(s.x - 5 + Math.sin(G.time * 2) * 3), Math.round(s.y - 2), 4, 1); }
      else if (s.k === 'jangada') { ctx.globalAlpha = s.cd > 0 ? 0.35 : 1; shadow(s.x, s.y + 8, 22); drawSpr(S.jangada, s.x, s.y, { sc: 1.5 }); ctx.globalAlpha = 1; }
      else if (s.k === 'bauilha' && !s.used) { drawSpr(S.bau, s.x, s.y); if (s.hold > 0) { ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 12, -1.57, -1.57 + 6.283 * s.hold); ctx.stroke(); } } }
    for (const s of shoals) if (onScreen(s.x, s.y, 20)) for (let i = 0; i < 4; i++) drawSpr(S.peixe, s.x + Math.cos(G.time * 3 + i * 1.6 + s.ph) * 7, s.y + Math.sin(G.time * 4 + i) * 3, { flip: Math.sin(G.time * 3 + i) > 0 });
    for (const b of boats) if (onScreen(b.x, b.y, 30)) { drawSpr(S.jangada, b.x, b.y, { sc: 1.2, flip: b.vx < 0 }); ctx.fillStyle = '#fff6a0'; ctx.fillRect(Math.round(b.x) - 1, Math.round(b.y) - 14, 2, 3); }
    for (const sh of pships) if (onScreen(sh.x, sh.y, 60)) drawSpr(S.navio, sh.x, sh.y, { sc: 0.55, flip: sh.dir < 0 });
    if (G.boat > 0) { shadow(player.x, player.y + 8, 22); drawSpr(S.jangada, player.x, player.y + 3, { sc: 1.4, flip: player.fx < 0 }); }
  }
  g0();
}; }
{ const gl0 = EXH.drawGlow; EXH.drawGlow = () => { gl0(); if (MAP !== 'praia') return;
  for (const k of EXW.marks) if (k.k === 'farol' && onScreen(k.x, k.y, 400) && !(G.storm > 0)) { const a = G.time * 0.8, lx = k.x, ly = k.y - 34; ctx.fillStyle = 'rgba(255,240,180,0.12)'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx + Math.cos(a - 0.12) * 320, ly + Math.sin(a - 0.12) * 200); ctx.lineTo(lx + Math.cos(a + 0.12) * 320, ly + Math.sin(a + 0.12) * 200); ctx.closePath(); ctx.fill(); circle(lx, ly, 6, 'rgba(255,240,180,0.6)'); }
  for (const e of enemies) if ((e.type === 'aguaviva' || e.type === 'batatao') && onScreen(e.x, e.y, 20)) circle(e.x, e.y, 8, e.type === 'batatao' ? 'rgba(255,170,60,0.35)' : 'rgba(200,140,255,0.3)');
  for (const b of boats) circle(b.x, b.y - 13, 6, 'rgba(255,240,160,0.4)'); }; }
{ const l0 = EXH.lightHoles; EXH.lightHoles = hole => { l0(hole); if (MAP !== 'praia') return;
  for (const k of EXW.marks) if (k.k === 'farol') { if (G.storm > 0) continue; hole(k.x, k.y - 34, 50, 0.8); const a = G.time * 0.8; for (let i = 1; i <= 4; i++) hole(k.x + Math.cos(a) * 60 * i, k.y - 34 + Math.sin(a) * 38 * i, 22 + i * 6, 0.35); } else if (k.k === 'barraca' || k.k === 'barforro') hole(k.x, k.y, 46, 0.5);
  for (const e of enemies) if ((e.type === 'aguaviva' || e.type === 'batatao') && e.alive && onScreen(e.x, e.y, 20)) hole(e.x, e.y, 18, 0.45);
  for (const b of boats) hole(b.x, b.y - 13, 26, 0.55); for (const sh of pships) hole(sh.x, sh.y, 40, 0.4); }; }
PRAIA.mini = (mx, my, ox, oy, RW, RH) => { ctx.fillStyle = '#163a5c'; ctx.beginPath(); ctx.moveTo(mx(ox - 50), my(oy - 50)); for (let x = ox - 50; x <= ox + RW + 100; x += 100) ctx.lineTo(mx(x), my(seaY(x))); ctx.lineTo(mx(ox + RW + 100), my(oy - 50)); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#3a4258'; for (const s of islands) { ctx.beginPath(); ctx.ellipse(mx(s.x), my(s.y), Math.max(1, s.rx * (70 / RW)), Math.max(1, s.ry * (70 / RW)), 0, 0, 6.283); ctx.fill(); } };
{ const m0 = EXH.miniDots; EXH.miniDots = (dot, inside) => { m0(dot, inside); if (MAP !== 'praia') return; for (const s of spots) if (inside(s.x, s.y) && ((s.k === 'jangada' && s.cd <= 0) || (s.k === 'bauilha' && !s.used) || s.k === 'piscina')) dot(s.x, s.y, s.k === 'jangada' ? '#e8e0c8' : s.k === 'bauilha' ? '#f2c14e' : '#7fb2e5', 2); for (const k of EXW.marks) if (inside(k.x, k.y) && k.k === 'farol') dot(k.x, k.y, '#fff6a0', 2); }; }
const PHASES_P = [[2, 14, 26], [2, 12, 30], [2, 20, 28], [14, 12, 28]];
{ const nc0 = EXH.nightCol; EXH.nightCol = a => { if (MAP !== 'praia') return nc0(a); const c = PHASES_P[EXH.phase()]; return `rgba(${c[0]},${c[1]},${c[2]},${a * 0.92})`; }; }
{ const b0 = EXH.drawRoads; EXH.drawRoads = () => { b0(); }; }
