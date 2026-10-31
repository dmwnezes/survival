'use strict';
/* =========================================================
   Conteúdo novo (armas, itens, chefões, inimigos, mapa).
   Só dados e sprites; a lógica fica em extra.js, ligada ao
   núcleo pelas tabelas de ganchos abaixo.
   ========================================================= */
const VERSION = 'v2.0';
const NOTES = [
  ['v2.0', 'Noite de 30 minutos, com a dificuldade subindo até o fim.',
    'Quatro chefões novos depois dos 15 minutos e um chefão secreto no Pesadelo.',
    'Chefões ganham uma segunda fase, com visual e ataque novos.',
    '13 armas novas, 13 itens novos e 3 fusões lendárias novas.',
    'Inimigos novos: Rasga-Mortalha, Tatu Assombrado, Rezadeira das Trevas, Procissão de Velas e Lobinhos de lua cheia.',
    'Eventos novos: revoada de morcegos, lua cheia, chuva de estrelas e forró na praça.',
    'Mapa com matas, carnaubais, milharais, igrejas, casarões, cata-ventos, estátuas, bodegas e moradores.',
    'Estradas redesenhadas, mais naturais.',
    'Passiva própria de cada personagem, joystick fixo opcional, sortear cartas de novo e aviso do próximo chefão.'],
];
// ganchos preenchidos em extra.js
const WB2 = {}, FIRE2 = {}, UPD2 = {}, PROJ2 = {}, DPROJ2 = {}, EB2 = {}, EXH = {};

Object.assign(SD, {
  // ícones das armas novas
  i_pilao: ['....bb..', '...bb...', '..bb....', '.Bb.....', 'bbbbbbb.', '.bBBBb..', '.bbbbb..', '..BBB...'],
  i_boi: ['w......w', 'ww....ww', '.kkkkkk.', '.kekkek.', '.kkkkkk.', '..kyyk..', '..rprp..', '.yryryr.'],
  i_sal: ['........', '.w.w....', 'hhhhhhb.', 'kkkkhbbb', '......bb', '.......b', 'w.w.w...', '.w.w....'],
  i_arapuca: ['...b....', '..b.b...', '..bbb...', '.b.b.b..', '.bbbbb..', 'b.b.b.b.', 'bbbbbbb.', 'B.....B.'],
  i_marimbondo: ['..y..y..', '...nn...', '..nqnn..', '.nnnnqn.', '.nqnnnn.', '..nnqn..', 'y..nn..y', '........'],
  i_foice: ['..hhhh..', '.h....h.', 'h......b', '......b.', '.....b..', '....b...', '...b....', '..b.....'],
  i_trovoada: ['..hhhh..', '.hhhhhh.', 'hhhhhhhh', '.HHyHHH.', '...yy...', '..yy....', '...y....', '..y.....'],
  i_piao: ['...ww...', '..rrrr..', '.ryyyyr.', 'rrrrrrrr', '.uuuuuu.', '..uuuu..', '...hh...', '...h....'],
  i_pipa: ['...r....', '..ryr...', '.ryyyr..', 'rrrrrrr.', '.ryyyr..', '..ryr...', '...r.w..', '....w.ww'],
  i_tatu: ['........', '..hhhh..', '.hHhHhh.', 'hhHhHhHh', 'hHhHhHhh', '.hhhhhh.', '.k.kk.k.', '........'],
  i_bola: ['..wwww..', '.wrwwrw.', 'wwwrrwww', 'wrwwwwrw', 'wrwwwwrw', 'wwwrrwww', '.wrwwrw.', '..wwww..'],
  i_espelho: ['..yyyy..', '.yUUUwy.', 'yUUUwUUy', 'yUUwUUUy', 'yUwUUUUy', '.yUUUUy.', '..yyyy..', '...bb...'],
  i_pifano: ['.......y', '......y.', '.....bb.', '....kb.y', '...bb..y', '..kb...y', '.bb.....', 'bb......'],
  // ícones dos itens novos
  i_patua: ['..b..b..', '...bb...', '...b....', '..rrrr..', '.rrrrrr.', '.rryrrr.', '.rrrrrr.', '..rrrr..'],
  i_rape: ['........', '.hhhhhh.', 'hyyyyyyh', 'hHHHHHHh', 'hbbbbbbh', 'hbbqbbbh', '.hhhhhh.', '........'],
  i_olhogordo: ['........', '..pppp..', '.pwwwwp.', 'pwwrrwwp', 'pwrkkrwp', 'pwwrrwwp', '.pwwwwp.', '..pppp..'],
  i_rede: ['b......b', 'b......b', 'bw....wb', 'b.wwww.b', 'b.rwrw.b', 'b..ww..b', 'b......b', 'B......B'],
  i_garrafa: ['...kk...', '...ww...', '..wrrw..', '.wyyyyw.', '.woooow.', '.wuuuuw.', '.wrrrrw.', '..wwww..'],
  i_rosario: ['..bbbb..', '.b....b.', 'b......b', 'b......b', '.b....b.', '..b..b..', '...hh...', '..hhhh..'],
  i_espora: ['........', 'h.......', 'hh......', '.hhhhh..', '....hhy.', '....hyYy', '.....yy.', '........'],
  i_cacua: ['b......b', '.b....b.', 'bbbbbbbb', 'bqbqbqbb', 'bbbbbbbb', 'bqbqbqbb', '.bbbbbb.', '........'],
  i_chocalho: ['...bb...', '..b..b..', '.hhhhhh.', '.hHHHHh.', '.hHHHHh.', 'hhHHHHhh', 'hhhhhhhh', '...kk...'],
  i_salgrosso: ['........', '...w....', '..wwh...', '.wwhww..', '.whwwhw.', 'wwwhwwww', 'bbbbbbbb', '.BBBBBB.'],
  i_jandaira: ['..BBBB..', '..wwww..', '.wyyyyw.', 'wyYyyyyw', 'wyyyyyyw', 'wyyyyyyw', '.wyyyyw.', '..wwww..'],
  i_lenco: ['rrrrrrrr', '.rrwrrr.', '..rrrr..', '...rr...', '..r..r..', '.r....r.', '........', '........'],
  i_moeda: ['..yyyy..', '.yYYYYy.', 'yYyyyyYy', 'yYykkyYy', 'yYykkyYy', 'yYyyyyYy', '.yYYYYy.', '..yyyy..'],
  // chefões novos
  fulozinha: ['.....kkkkkk.....', '....kykkkkrk....', '...kkkkkkkkkk...', '..kkksssssskkk..', '..kkksYssYskkk..', '..kkkssssssskk..', '.kkkkksSSskkkkk.', '.kkkgggggggkkkk.', 'kkkggGgggGggkkkk', 'kkkgggggggggkkk.', 'kk.sggggggggs.kk', 'k..sgGgggGggs..k', 'k...gggggggg...k', 'k..ggggggggggg..', '...gggGgggGggg..', '..gggggggggggggg', '....ss.....ss...', '...SS......SS...'],
  cabecadecuia: ['.....bbbbbbbb.....', '...bbbbbbbbbbbb...', '..bbBbbbbbbbbBbb..', '.bbbbbbbbbbbbbbbb.', '.BBBBBBBBBBBBBBBB.', '.sssssssssssssssss', 'ssskksssssssskksss', 'sssekssssssssekss.', 'sssssssssssssssss.', 'ssssssssSSsssssss.', '.ssssssSSSSssssss.', '.sssskkkkkkkkssss.', '..ssskwwwwwwksss..', '...sskkkkkkkkss...', '....ssssssssss....', '......SSSSSS......'],
  labatut: ['.......hhhhhh.......', '.....hhhhhhhhhh.....', '....hhhssssssshhh...', '...hhsswwwwwssshh...', '...hsswweekwwsshh...', '...hsswweeewwsshh...', '...hssswwwwwsssh....', '....hssssssssssh....', '....hsskkkkkkssh....', '.....sskwkwkkss.....', '..nnnnssssssssnnnn..', '.nnnnnnnnnnnnnnnnnn.', 'nnsnnnnnnnnnnnnnnsnn', 'ns.nnnnNNNNnnnnnn.sn', 's..nnnnnnnnnnnnnn..b', 's..nnnnnnnnnnnnnn.bb', '...NNNNNNNNNNNNNN.bb', '...nnnnn....nnnnn.b.', '...nnnn......nnnn...', '..SSSSS......SSSSS..'],
  bestafera: ['..y..............y....', '..yy............yy....', '...yy..kkkkkk..yy.....', '....kkkkkkkkkkkk......', '...kkkekkkkkkekkk.....', '...kkkkkkkkkkkkkk.....', '....kkkkrrrrkkkk......', '.....kkkrkkrkkk.......', '..hh..kkkkkkkk..hh....', '.h..kkkkkkkkkkkk..h...', 'h..kkkkkkkkkkkkkkk.h..', '..kkkkKkkkkkkKkkkkk...', '.kkkkkkkkkkkkkkkkkkk..', '.kkkk.kkkkkkkkk.kkkk..', '.kkk...kkkkkkk...kkk..', '.kk.....kk..kk....kk..', '.oo.....kk..kk....oo..', '........oo..oo........'],
  anhanga: ['.y.y............y.y.', '..yy.y........y.yy..', '...yyy........yyy...', '....yy.wwwwww.yy....', '......wwwwwwwww.....', '.....wwewwwwewww....', '.....wwwwwwwwww.....', '......wwwwkkww......', '.......wwwwww.......', '.....wwwwwwwwwwwww..', '....wwwwwwwwwwwwwwww', '...wwwUwwwwwwwwUwww.', '...wwwwwwwwwwwwwwww.', '....wwwwwwwwwwwwww..', '....ww.ww....ww.ww..', '....ww.ww....ww.ww..', '....ww.ww....ww.ww..', '....UU.UU....UU.UU..'],
  // inimigos novos
  coruja: ['..w....w..', '.wwwwwwww.', 'wwYkwwkYww', 'wwwwyywwww', '.wwwwwwww.', 'wwwwwwwwww', 'w.wwwwww.w', '...y..y...'],
  coruja2: ['ww......ww', 'www.ww.www', 'wwYkwwkYww', '.wwwyywww.', '..wwwwww..', '..wwwwww..', '...wwww...', '...y..y...'],
  tatu: ['...hhhhh..', '..hHhHhHh.', '.hhHhHhHhh', 'khHhHhHhhh', '.hhhhhhhh.', '..k.k.k.k.'],
  monte: ['...BBB...', '.BBbBBB..', 'BBBBBbBB.'],
  rezadeira: ['...kkkk...', '..kkkkkk..', '..kssssk..', '..ksesesk.', '..kssssk..', '...kssk...', '..kkkkkk..', '.kkkkkkkk.', 'kkhkkkkhkk', 'kk.kkkk.kk', 's..khkk..s', '...kkkk...', '...kkkk...', '...k..k...'],
  beata: ['..wwww..', '.wwwwww.', '.wssssw.', '.wskskw.', '.wssssw.', '..wwww.y', '.wwwwwwY', 'wwwwwwwb', 'wwwwwwwb', '.wwwwww.', '.wwwwww.', '..w..w..'],
  cuia: ['.bbbbbb.', 'bbbbbbbb', 'BBBBBBBB', 'sksssks.', 'ssssssss', '.skkkks.', '..ssss..'],
  bode: ['.h.h......', '.hhh......', 'wwkw......', 'wwww.wwww.', '.wwwwwwwww', '..wwwwwwww', '..w.w..w.w', '..k.k..k.k'],
  jumento: ['.h.h........', '.hhh........', 'hhkh........', 'hhhh........', '.hhhhhhhhhh.', '..hhhhhhhhhh', '..hhhhhhhhhh', '..hHh...hHh.', '..h.h...h.h.', '..k.k...k.k.'],
  // mapa
  igreja: ['.........y..........', '........yyy.........', '.........y..........', '........www.........', '.......wwwww........', '.......wkwkw........', '.......wwwww........', '......wwwwwww.......', '.....rrrrrrrrr......', '....rrrrrrrrrrr.....', '...rrrrrrrrrrrrr....', '..wwwwwwwwwwwwwww...', '..wwuuwwwwwwwuuww...', '..wwuuwwwwwwwuuww...', '..wwwwwwwbwwwwwww...', '..wwwwwwbbbwwwwww...', '..wwwwwwbkbwwwwww...', '..wwwwwwbkbwwwwww...', '..HHHHHHbbbHHHHHH...', '.ttttttttttttttttt..'],
  casarao: ['....rrrrrrrrrrrrrrrrrr....', '...rrrrrrrrrrrrrrrrrrrr...', '..rrrrrrrrrrrrrrrrrrrrrr..', '.rrrrrrrrrrrrrrrrrrrrrrrr.', '..wwwwwwwwwwwwwwwwwwwwww..', '..wuwwuwwuwwwwwuwwuwwuww..', '..wuwwuwwuwwwwwuwwuwwuww..', '..wwwwwwwwwwbbbwwwwwwwww..', '..b.b.b.b.wwbkbww.b.b.b...', '..b.b.b.b.wwbkbww.b.b.b...', '..HHHHHHHHHHbbbHHHHHHHHH..', '.tttttttttttttttttttttttt.'],
  catavento: ['.....H......', '....H.H.....', '....H.H.....', '...H...H....', '...HHHHH....', '...H...H....', '..H.....H...', '..HHHHHHH...', '..H.....H...', '.H.......H..', '.H.......H..', 'H.........H.', 'bbbbbbbbbbbb'],
  estatua: ['...hhhh...', '..hhhhhh..', '.hhhhhhhh.', '...hHHh...', '...hhhh...', '..hhhhhh..', '.hhhhhhhh.', '.h.hhhh.h.', '...hhhh...', '...h..h...', '...h..h...', '..HH..HH..', '.HHHHHHHH.', '.hhhhhhhh.', '.hHHHHHHh.', '.hhhhhhhh.', 'HHHHHHHHHH'],
  cruzeiro: ['....b....', '....b....', '....B....', 'bbbbbbbbb', 'BBBBbBBBB', '....b....', '....B....', '....b....', '....B....', '....b....', '....B....', '...bbb...', '..hhhhh..', '.hhhhhhh.', 'hhhhhhhhh', 'HHHHHHHHH'],
  pedraFurada: ['......hhhhhhhhh.......', '....hhhhHhhhhhhhh.....', '...hhHhhhhhhhhHhhh....', '..hhhhhh.....hhhhhh...', '..hhhhh.......hhhhh...', '.hhHhh.........hhHhh..', '.hhhhh.........hhhhh..', '.hhhh...........hhhh..', 'hhHhh...........hhHhh.', 'hhhhh...........hhhhh.', 'HHHHH...........HHHHH.'],
  bodega: ['..rrrrrrrrrrrr..', '.rrrrrrrrrrrrrr.', 'rrrrrrrrrrrrrrrr', '.yyyyyyyyyyyyyy.', '.ykkykkkkkkykky.', '.yyyyyyyyyyyyyy.', '.yybbbbyybbbbyy.', '.yybkkbyybkkbyy.', '.yybkkbyybkkbyy.', '.yybbbbyybbbbyy.', '.HHHHHHHHHHHHHH.', 'tt............tt'],
  ruina: ['..w.........w...', '.ww.....w...ww..', '.ww....ww...www.', '.www...ww..wwww.', '.wwww..www.wwww.', '.wHww..wHw.wwHw.', '.wwww..www.wwww.', '.HHHH..HHH.HHHH.', '..t..t...t...t..'],
  carnauba: ['g....g....g.', '.g..ggg..g..', '..gggGggg...', 'gggGgggGggg.', '..ggGggGgg..', '.g..ggg..g..', 'g....b....g.', '.....b......', '.....b......', '.....bB.....', '.....Bb.....', '.....b......', '.....bB.....', '.....Bb.....', '.....b......', '.....bB.....', '.....Bb.....', '.....b......', '....bbB.....', '....BBB.....'],
  arvore: ['....GGGGGG....', '..GGGgGGGGGG..', '.GGgGGGGGgGGG.', 'GGGGGGgGGGGGGG', 'GgGGGGGGGGgGGG', 'GGGGgGGGGGGGGG', '.GGGGGGGgGGGG.', '..GGGGGGGGGG..', '....GG.bGG....', '......bb......', '......bb......', '......bb......', '.....bbbb.....'],
  milho: ['..g..', '.g.g.', '..gy.', '.ggy.', 'g.g..', '..g.g', '.gg..', '..gy.', '.g.g.', '..g..', '..g..', '..G..'],
  sanfoneiro: ['...bbbbbb...', '.bbbbbbbbbb.', '..kssssssk..', '..ssksskss..', '..ssssssss..', '...SssssS...', '..rrrrrrrr..', '.srwkwkwkrs.', '.srkwkwkwrs.', '..rwkwkwkr..', '..uuuuuuuu..', '..uu....uu..', '..uu....uu..', '..BB....BB..'],
  rendeira: ['...kkkkkk...', '..kkkkkkkk..', '..kssssssk..', '..ssksskss..', '..ssssssss..', '...SssssS...', '..pppppppp..', '.spppppppps.', '.swwwwwwwws.', '..wywywyww..', '..pppppppp..', '..pppppppp..', '...ss..ss...', '...BB..BB...'],
  menino: ['..kkkk..', '.kkkkkk.', '.ssssss.', '.sksksS.', '.ssssss.', '..rrrr..', '.srrrrs.', '..uuuu..', '..u..u..', '..B..B..'],
});
Object.assign(SPAL, {
  fulozinha: { k: '#1c1622', s: '#9a6a4a', S: '#7a4a32', Y: '#ffd23f', g: '#3d6b33', G: '#2a4a26', y: '#f2c14e', r: '#e86a9a' },
  cabecadecuia: { b: '#2a1c14', B: '#4a3220', s: '#b08060', S: '#8a5a3a', e: '#ff4a3d', w: '#f0ead6', k: '#1c1214' },
  labatut: { n: '#5a4a3a', N: '#3a2e24', h: '#3a3640', s: '#9a7a5a', S: '#6a4a32', e: '#ff3b2e', w: '#f0ead6', k: '#14111f', b: '#6b4a2e' },
  bestafera: { k: '#1c1622', K: '#3a2a3a', e: '#ff4a3d', y: '#d9c98f', h: '#8a8aa0', r: '#c8463c', o: '#e8832a' },
  anhanga: { y: '#c9c9d6', w: '#e8eeff', e: '#ff6a2a', U: '#7fb2e5', k: '#3a3a5a' },
  coruja: { w: '#e8e4d8', Y: '#ffd23f', y: '#c9a84a' }, coruja2: { w: '#e8e4d8', Y: '#ffd23f', y: '#c9a84a' },
  tatu: { h: '#8a7a6a', H: '#6a5a4a' }, monte: { B: '#5c4a32', b: '#7a6448' },
  rezadeira: { k: '#2a2433', s: '#c9b8a0', e: '#9fe07a', h: '#c9c9d6' },
  beata: { w: '#4a4060', s: '#c9b8a0', y: '#fff6a0', Y: '#f2c14e', b: '#f0ead6', k: '#14111f' },
  cuia: { b: '#2a1c14', B: '#4a3220', s: '#b08060', k: '#1c1214' },
  bode: { w: '#d8d4c4', h: '#8a7a6a' }, jumento: { h: '#8a8a9a', H: '#6a6a7a' },
  igreja: { w: '#c9bfa8', r: '#7a3a2a', u: '#f2c14e', H: '#7a7060', t: '#5a5248', y: '#f2c14e', b: '#5c3a1c' },
  casarao: { w: '#c9bfa8', r: '#7a3a2a', u: '#3a4a7a', H: '#7a7060', t: '#5a5248', b: '#5c3a1c' },
  catavento: { H: '#8a8aa0', b: '#5c3a1c' },
  estatua: { h: '#9a9aae', H: '#6a6a80' }, cruzeiro: { h: '#8a8aa0', H: '#5e5e78' },
  pedraFurada: { h: '#8a7a6a', H: '#5a4a3a' },
  bodega: { y: '#c9a84a', r: '#7a3a2a', H: '#7a7060', t: '#5a5248', k: '#f2c14e' },
  ruina: { w: '#7a7060', H: '#4a4440', t: '#5a5248' },
  carnauba: { g: '#3d6b33', G: '#5f9e4a', b: '#8a7a5a', B: '#6a5a4a' },
  arvore: { G: '#2a4a30', g: '#3d6b33' },
  milho: { g: '#4a7a3a', y: '#d9b24a', G: '#2f5a33' },
  rendeira: { p: '#3b6ea5' },
  i_olhogordo: { p: '#8160a8' }, i_garrafa: { w: '#c9d4f0' }, i_espelho: { U: '#a8d4ff', w: '#ffffff' },
});
const OUT2 = ['fulozinha', 'cabecadecuia', 'labatut', 'bestafera', 'anhanga', 'coruja', 'coruja2', 'tatu', 'rezadeira', 'beata', 'cuia', 'bode', 'jumento', 'sanfoneiro', 'rendeira', 'menino'];
const X2b = new Set(['fulozinha', 'cabecadecuia', 'labatut', 'bestafera', 'anhanga']);
const WALK2 = new Set(['fulozinha', 'labatut', 'bestafera', 'anhanga', 'tatu', 'rezadeira', 'beata', 'bode', 'jumento', 'menino']);
for (const k of ['i_pilao', 'i_boi', 'i_sal', 'i_arapuca', 'i_marimbondo', 'i_foice', 'i_trovoada', 'i_piao', 'i_pipa', 'i_tatu', 'i_bola', 'i_espelho', 'i_pifano', 'i_patua', 'i_rape', 'i_olhogordo', 'i_rede', 'i_garrafa', 'i_rosario', 'i_espora', 'i_cacua', 'i_chocalho', 'i_salgrosso', 'i_jandaira', 'i_lenco', 'i_moeda',
  'fulozinha', 'cabecadecuia', 'labatut', 'bestafera', 'anhanga', 'coruja', 'coruja2', 'tatu', 'monte', 'rezadeira', 'beata', 'cuia', 'bode', 'jumento', 'igreja', 'casarao', 'catavento', 'estatua', 'cruzeiro', 'pedraFurada', 'bodega', 'ruina', 'carnauba', 'arvore', 'milho', 'sanfoneiro', 'rendeira', 'menino'])
  S[k] = sprite(SD[k], SPAL[k], { out: OUT2.includes(k), x2: X2b.has(k), walk: WALK2.has(k) });
S.lobinho = sprite(SD.lobisomem, Object.assign({}, SPAL.lobisomem, { h: '#6a6a80', H: '#4a4a60' }), { out: true, walk: true });
// segunda fase dos chefões: mesma forma, cores em brasa
const P2PAL = { lobisomem: { h: '#5a2a2a', H: '#3a1a1a', e: '#fff6a0' }, paimato: { g: '#7a2a20', G: '#a83a32', e: '#fff6a0' }, mapinguari: { n: '#4a1e14', N: '#2a120c', e: '#fff6a0' },
  corposeco: { n: '#6a5a4a', y: '#8a2a20', e: '#fff6a0' }, cuca: { p: '#6e2420', P: '#a83a32', g: '#2f5a33', e: '#fff6a0' }, fulozinha: { g: '#6e2420', G: '#4a1a18', Y: '#fff6a0' },
  cabecadecuia: { s: '#8a4a3a', S: '#6a2a20', e: '#fff6a0' }, labatut: { n: '#4a2a20', N: '#2a1610', e: '#fff6a0' }, bestafera: { k: '#3a0c10', K: '#6e2420', e: '#fff6a0' }, anhanga: { w: '#ffc9a8', U: '#ff6a2a', e: '#ffffff' } };
for (const k in P2PAL) S[k + '_p2'] = sprite(SD[k], Object.assign({}, SPAL[k] || {}, P2PAL[k]), { out: true, x2: true, walk: WALK.has(k) || WALK2.has(k) });
S.boitataHead_p2 = sprite(SD.boitataHead, { c: '#ff8a3a', C: '#ffd27a', b: '#c8463c', w: '#fff6a0' }, { out: true, x2: true });
S.boitataSeg_p2 = sprite(SD.boitataSeg, { c: '#ff8a3a', C: '#ffd27a', b: '#c8463c' }, { out: true });

Object.assign(WEAPONS, {
  pilao:      { name: 'Pilão', desc: 'Um pilão gigante cai do céu, atordoa e espalha os inimigos.', evo: 'cacua', evoName: 'Pilão do Gigante', evoDesc: 'Pilões maiores, mais fortes e com onda de choque.' },
  boi:        { name: 'Boi-Bumbá', desc: 'O boi dança em disparada e atropela tudo pelo caminho.', evo: 'chocalho', evoName: 'Boi-Bumbá Estrela', evoDesc: 'Mais bois, maiores e que vão mais longe.' },
  sal:        { name: 'Espingarda de Sal', desc: 'Leque curto de sal grosso: empurra e deixa o inimigo salgado, tomando mais dano.', evo: 'salgrosso', evoName: 'Bacamarte de Sal', evoDesc: 'Mais chumbo, mais alcance e o sal arde ainda mais.' },
  arapuca:    { name: 'Arapuca', desc: 'Arma armadilhas no chão que fecham em quem pisa.', evo: 'garrafa', evoName: 'Arapuca de Areia', evoDesc: 'Armadilhas maiores que soltam areia e prendem mais tempo.' },
  marimbondo: { name: 'Casa de Marimbondo', desc: 'Enxame que persegue um inimigo e pica; se ele cair, o enxame se espalha.', evo: 'jandaira', evoName: 'Enxame Arretado', evoDesc: 'Enxames maiores, que duram mais e se espalham sempre.' },
  foice:      { name: 'Foice do Roçado', desc: 'Corte largo que acaba na hora com quem está quase caindo.', evo: 'lenco', evoName: 'Foice da Meia-Noite', evoDesc: 'Corte em volta inteira, mais forte e que acaba com mais gente.' },
  trovoada:   { name: 'Trovoada', desc: 'Raios caem em visagens espalhadas pela tela.', evo: 'rosario', evoName: 'Trovoada Bendita', evoDesc: 'Muito mais raios, que estouram em área.' },
  piao:       { name: 'Pião', desc: 'Pião que rodopia pelo chão puxando e moendo os inimigos.', evo: 'espora', evoName: 'Pião Sem Fim', evoDesc: 'Piões que puxam de mais longe, giram por mais tempo e moem mais.' },
  pipa:       { name: 'Pipa', desc: 'Pipa no céu: a linha corta quem atravessa.', evo: 'moeda', evoName: 'Pipa Gigante', evoDesc: 'Linhas mais longas e mais pipas no céu.' },
  tatu:       { name: 'Casco de Tatu', desc: 'Placas que giram colado em você, bloqueiam golpes e devolvem a pancada.', evo: 'patua', evoName: 'Casco Encantado', evoDesc: 'Mais placas, que voltam mais rápido e estouram ao quebrar.' },
  bola:       { name: 'Bola de Meia', desc: 'Bola que quica nas bordas da tela acertando todo mundo.', evo: 'rede', evoName: 'Bola de Couro', evoDesc: 'Mais bolas, maiores e mais rápidas.' },
  espelho:    { name: 'Espelho da Lua', desc: 'Reflete a lua num raio que gira à sua volta.', evo: 'rape', evoName: 'Espelho da Lua Cheia', evoDesc: 'Dois raios, mais longos e mais fortes.' },
  pifano:     { name: 'Pífano', desc: 'Notas musicais que perseguem os inimigos.', evo: 'olhogordo', evoName: 'Banda de Pífanos', evoDesc: 'Mais notas, que atravessam vários inimigos.' },
});
Object.assign(PASSIVES, {
  patua:     { name: 'Patuá', desc: 'Com a vida abaixo de 30%, protege você por 2s (recarga de 40s, menos 6s por nível).', max: 3 },
  rape:      { name: 'Rapé', desc: '+4% de chance de golpe crítico.', max: 5 },
  olhogordo: { name: 'Olho Gordo', desc: 'Amaldiçoado: +15% de dano e de XP, mas 12% mais inimigos.', max: 3, cursed: true },
  rede:      { name: 'Rede de Dormir', desc: 'Parado por 1s, recupera 1,5 de vida por segundo.', max: 4 },
  garrafa:   { name: 'Garrafa de Areia', desc: 'Ao levar dano, solta areia que deixa os inimigos lentos.', max: 3 },
  rosario:   { name: 'Rosário', desc: 'De tempos em tempos, uma bênção fere todas as visagens da tela.', max: 4 },
  espora:    { name: 'Espora', desc: 'Cada abate dá velocidade por 3s (acumula até +15%).', max: 4 },
  cacua:     { name: 'Caçuá', desc: 'Cajus valem 8% a mais.', max: 5 },
  chocalho:  { name: 'Chocalho', desc: '+12% de dano em elites e chefões.', max: 4 },
  salgrosso: { name: 'Sal Grosso', desc: 'Quem encosta em você leva dano e é empurrado.', max: 4 },
  jandaira:  { name: 'Mel de Jandaíra', desc: 'Comidas curam 30% a mais e cada nível subido cura 5 de vida.', max: 3 },
  lenco:     { name: 'Lenço Vermelho', desc: 'Golpes críticos causam +40% de dano.', max: 4 },
  moeda:     { name: 'Moeda Furada', desc: 'A cada 30 abates ganha rapadura (1 por nível) e os baús ficam mais generosos.', max: 3 },
});
Object.assign(EN, {
  coruja:     { hp: 22, spd: 62, dmg: 7, xp: 2, r: 4, spr: 'coruja', fly: 1, col: '#e8e4d8' },
  tatu:       { hp: 60, spd: 40, dmg: 8, xp: 3, r: 5, spr: 'tatu', col: '#8a7a6a' },
  rezadeira:  { hp: 90, spd: 24, dmg: 6, xp: 5, r: 5, spr: 'rezadeira', col: '#9fe07a' },
  beata:      { hp: 40, spd: 30, dmg: 6, xp: 2, r: 4, spr: 'beata', col: '#f2c14e' },
  lobinho:    { hp: 45, spd: 50, dmg: 7, xp: 3, r: 5, spr: 'lobinho', scale: 0.55, col: '#6a6a80' },
  cuia:       { hp: 120, spd: 78, dmg: 8, xp: 3, r: 5, spr: 'cuia', col: '#b08060' },
  bode:       { hp: 14, spd: 0, dmg: 0, xp: 0, r: 5, spr: 'bode', prop: 1, neutral: 1, col: '#d8d4c4' },
  jumento:    { hp: 22, spd: 0, dmg: 0, xp: 0, r: 6, spr: 'jumento', prop: 1, neutral: 1, col: '#8a8a9a' },
  fulozinha:  { hp: 9000, spd: 64, dmg: 22, xp: 5, r: 11, spr: 'fulozinha', boss: 1, scale: 0.8, col: '#3d6b33' },
  cabecadecuia: { hp: 11000, spd: 34, dmg: 26, xp: 5, r: 14, spr: 'cabecadecuia', boss: 1, scale: 0.85, col: '#b08060' },
  labatut:    { hp: 14000, spd: 24, dmg: 30, xp: 5, r: 16, spr: 'labatut', boss: 1, scale: 0.95, col: '#5a4a3a' },
  bestafera:  { hp: 16000, spd: 44, dmg: 30, xp: 5, r: 15, spr: 'bestafera', boss: 1, scale: 0.9, col: '#c8463c' },
  anhanga:    { hp: 22000, spd: 46, dmg: 32, xp: 5, r: 14, spr: 'anhanga', boss: 1, scale: 0.9, col: '#e8eeff' },
});
BOSSES.push(
  { t: 1020, type: 'fulozinha', name: 'A Comadre Fulozinha' },
  { t: 1260, type: 'cabecadecuia', name: 'O Cabeça de Cuia' },
  { t: 1500, type: 'labatut', name: 'O Labatut' },
  { t: 1680, type: 'bestafera', name: 'A Besta-Fera' },
);
const SECRET_BOSS = { t: RUN, type: 'anhanga', name: 'O Anhangá' };
Object.assign(ENAMES, { coruja: 'Rasga-Mortalha', tatu: 'Tatu Assombrado', rezadeira: 'Rezadeira das Trevas', beata: 'Procissão de Velas', lobinho: 'Lobinho', cuia: 'Cuia', fulozinha: 'Comadre Fulozinha', cabecadecuia: 'Cabeça de Cuia', labatut: 'Labatut', bestafera: 'Besta-Fera', anhanga: 'Anhangá', bode: 'Bode', jumento: 'Jumento' });
// passiva própria de cada personagem
const CPAS = {
  vaqueiro: 'Gibão de vaqueiro: toma 10% menos dano de contato.',
  pescador: 'Pé na água: não fica lento no rio nem nos açudes.',
  forrozeira: 'Xote: ao subir de nível, uma onda empurra os inimigos em volta.',
  benzedeira: 'Reza forte: comidas curam 50% a mais.',
};
TIPS.push('Arapuca no caminho dos inimigos pega muita gente de uma vez.', 'A Rezadeira cura as outras visagens: derrube ela primeiro.', 'Na lua cheia aparecem lobinhos, mas o XP rende mais.', 'Fique no círculo do forró para ganhar força.', 'Na bodega dá para trocar rapadura da noite por comida.', 'Pisou no milharal, sumiu: as visagens também se escondem lá.', 'A Espingarda de Sal deixa o inimigo tomando mais dano.');
