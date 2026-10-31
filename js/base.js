'use strict';
/* =========================================================
   VISAGEM · protótipo
   Scripts clássicos carregados em ordem pelo index.html
   (base, dados, extra, mundo, armas, jogo, desenho, telas).
   Sprites em texto, sons sintetizados, save no localStorage.
   ?speed=4 acelera o tempo para testes.
   ========================================================= */
// guarda o último erro para o jogador poder copiar e mandar
const ERR_KEY = 'visagem-err';
function logErr(msg, stack) { try { localStorage.setItem(ERR_KEY, JSON.stringify({ msg: String(msg).slice(0, 300), stack: String(stack || '').slice(0, 900), t: new Date().toISOString(), v: typeof VERSION !== 'undefined' ? VERSION : '?', ua: navigator.userAgent.slice(0, 120) })); } catch (e) {} }
addEventListener('error', e => logErr(e.message, e.error && e.error.stack));
addEventListener('unhandledrejection', e => logErr(e.reason && e.reason.message || e.reason, e.reason && e.reason.stack));
const TITLE = 'VISAGEM';
const MAPW = 9600, MAPH = 6400, RUN = 1800; // 30 minutos
const SPEED = Math.max(1, Math.min(10, +new URLSearchParams(location.search).get('speed') || 1));
const $ = s => document.querySelector(s);
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
function compact(a, f) { let j = 0; for (let i = 0; i < a.length; i++) if (f(a[i])) a[j++] = a[i]; a.length = j; }
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;

/* ---------------- save ---------------- */
const SAVE_KEY = 'visagem-save-v1';
const DEF_SAVE = { rap: 0, up: {}, chars: { vaqueiro: true }, ach: {}, best: { time: 0, kills: 0, level: 0 }, sound: true, figs: {}, prest: 0, skin: {}, pets: {}, pet: null, stats: { runs: 0, wins: 0, time: 0, kills: 0, enemies: {}, weapons: {}, wkills: {} }, cxp: {}, gold: {}, gmode: 'normal' };
let save = loadSave();
function loadSave() {
  const base = JSON.parse(JSON.stringify(DEF_SAVE));
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s) { Object.assign(base, s); base.up = s.up || {}; base.chars = Object.assign({ vaqueiro: true }, s.chars); base.ach = s.ach || {}; base.skin = s.skin || {}; base.figs = s.figs || {}; base.pets = s.pets || {}; base.stats = Object.assign({ runs: 0, wins: 0, time: 0, kills: 0, enemies: {}, weapons: {}, wkills: {} }, s.stats); base.cxp = s.cxp || {}; base.gold = s.gold || {}; if (!s.gmode && s.nightmare) base.gmode = 'pesadelo'; base.best = Object.assign({ time: 0, kills: 0, level: 0 }, s.best); } } catch (e) {}
  return base;
}
function persist() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {} }

/* ---------------- sprites ---------------- */
const PAL = { k:'#14111f', b:'#8a5a2b', B:'#5c3a1c', s:'#e0a878', S:'#b97f52', w:'#f0ead6', r:'#c8463c', y:'#f2c14e', Y:'#fff6a0',
  g:'#5f9e4a', G:'#3d6b33', u:'#3b6ea5', U:'#7fb2e5', p:'#8160a8', o:'#e8832a', e:'#ff4a3d', h:'#a4a4ba', H:'#5e5e78', c:'#d9452b', d:'#8a5236', n:'#ad9c7e', m:'#2c4566', l:'#9fe07a', x:'#2a2433', z:'#b8443a', t:'#e8d9b0', q:'#6b4a2e' };
const SD = {
  vaqueiro:['....bbbb....','...bBBBBb...','.bbbbbbbbbb.','..kssssssk..','..ssksskss..','..ssssssss..','...SssssS...','..bbbrrbbb..','.sbbbbbbbbs.','.sbbbbbbbbs.','..BBBBBBBB..','..uu....uu..','..uu....uu..','..BB....BB..'],
  pescador:['...yyyyyy...','.yyyyyyyyyy.','..kssssssk..','..ssksskss..','..ssssssss..','...SssssS...','..uuuUUuuu..','.suuuuuuuus.','.suUuuuuUus.','..uuuuuuuu..','..wwwwwwww..','..ss....ss..','..ss....ss..','..SS....SS..'],
  forrozeira:['...dddddy...','..ddddddyy..','..dssssssd..','..ssksskss..','..ssssssss..','..dSssssSd..','..rrrwwrrr..','.srrrrrrrrs.','.srwrwrwrrs.','..rrrrrrrr..','.rwrwrwrwrw.','..rrrrrrrr..','...ss..ss...','...BB..BB...'],
  morcego:['p........p','pp..pp..pp','ppppeepppp','.pppppppp.','..p....p..'],
  morcego2:['..........','...pppp...','ppppeepppp','pppppppppp','p.p....p.p'],
  vagalume:['..yy..','.yYYy.','yYYYYy','yYYYYy','.yYYy.','..yy..'],
  saci:['....rr....','...rrrr...','..rrrrrr..','..dddddd..','..dwddwd..','..dddddd..','...dddd...','..rrrrrr..','.ddrrrrdd.','.d.rrrr.d.','....dd....','....dd....','....dd....','...ddd....'],
  mula:['oy..............','yoyo............','.oyobbbbbbbbbb..','..bbbbbbbbbbbbbB','..bbbbbbbbbbbbb.','..bbbbbbbbbbbbb.','..BB.BB...BB.BB.','..BB.BB...BB.BB.','..kk.kk...kk.kk.'],
  lobisomem:['......bbbbbbbb......','.....bBBBBBBBBb.....','...bbbbbbbbbbbbbb...','....hh.hhhhhh.hh....','....hhhhhhhhhhhh....','...hhhehhhhhhehhh...','...hhhhhhhhhhhhhh...','....hhhhssssshhh....','....hhhwsssswhhh....','.....hhwwwwwwhh.....','...rrrhhhhhhhhrrr...','..rrrrrhhhhhhrrrrr..','.hrrRrrrhhhhrrrRrrh.','hhrrrRrrrrrrrrRrrrhh','hh.rrrRrrrrrrRrrr.hh','w..rrrrrrrrrrrrrr..w','...HHHHHHHHHHHHHH...','...hhhhhh..hhhhhh...','...hhhhh....hhhhh...','...hhhh......hhhh...','..wwhhh......hhhww..'],
  corposeco:['......yyyyyy......','....yyyyyyyyyy....','..yyyYyyyyyyYyyy..','.....nnnnnnnn.....','.....neennnee.....','.....nnnnnnnn.....','.x...nkknnkkn..x..','xxx...nnnnnn..xxx.','bbbbbbbbbbbbbbbbbb','BBrrrrrrrrrrrrrrBB','y.rrRrrrrrrrRrr..y','y.rrrrRrrrrRrrr..y','..rrrrrrrrrrrrr...','...rrrrbbrrrrr....','...y.rrbbrr.y.....','......bbbb........','......bbbb........','......bbbb........','.....BBBBBB.......'],
  caju:['..G..','.ccc.','ccccc','ccccc','.ccc.','..B..'],
  rap:['.yyyyy.','ybbbbbB','ybbbbbB','.BBBBB.'],
  cuscuz:['..yyy..','.yyyyy.','yyyoyyy','wwwwwww'],
  chapeu:['.bbbbbb.','bBBBBBBb','bbbbbbbb'],
  mandacaru:['....gG....','....gG....','.g..gG....','.gG.gG..g.','.gG.gG.gG.','.gGggG.gG.','..ggggggG.','....gGgg..','....gG....','....gG....','....gG....','...BBBB...'],
  xique:['..g...','g.g.g.','gGgGg.','.ggg..','..G...'],
  pedra:['.HHHH.','HhhhhH','HhhHHH','.HHHH.'],
  capim:['m.m.m','mGmGm','.GGG.'],
  i_peixeira:['......hw','.....hw.','....hw..','...hw...','..Bh....','.bB.....','bB......','B.......'],
  i_baladeira:['B.....B.','bk...kb.','.bk.kb..','..bbb...','...b....','...b....','...B....','...B....'],
  i_chapeu:['........','...bb...','..bBBb..','..bBBb..','bbbbbbbb','.bbbbbb.'],
  i_sanfona:['kkkkkkkk','rwrwrwrw','rwrwrwrw','rwrwrwrw','rwrwrwrw','kkkkkkkk'],
  i_fogueira:['...o....','..oyo...','.oyyyo..','.oyryo..','..rrr...','.BbBbB..','BBbBbBB.'],
  i_rojao:['......rr','.....rrr','....rrr.','...wrr..','..ww....','.o......','oy......','y.......'],
  i_pimenta:['....g...','...g....','..rrr...','.rrrr...','.rrr....','rrr.....','rr......','r.......'],
  i_lamparina:['...y....','...o....','...k....','..hhh...','.hhhhh..','.hhhhh..','..hhh...'],
  i_cordel:['kkkkkkkk','..k..k..','.wwwwww.','.wkkkkw.','.wwwwww.','.wkwkww.','.wwwwww.'],
  i_cafe:['..w.w...','...w.w..','wwwwww..','wBBBBwww','wBBBBw.w','wBBBBww.','wwwwww..'],
  i_gibao:['.b....b.','bbb..bbb','bbbbbbbb','.bbyybb.','.bbbbbb.','.bbbbbb.','.BBBBBB.'],
  i_zabumba:['...h....','..h.h...','..h.h...','.h...h..','.h...h..','hhhhhhh.','......k.'],
  i_bumbo:['.wwwwww.','wwwwwwww','rrrrrrrr','ryryryry','rrrrrrrr','.wwwwww.'],
  i_candeeiro:['...y....','..yoy...','...o....','..hhh...','.hBBBh..','hhhhhhh.','..hhh...'],
  i_chinelo:['.bbbb...','bbBBbb..','bBkkBb..','bBBBBb..','bBBBBb..','.bBBb...','..bb....'],
  i_terco:['..hhh...','.h...h..','h.....h.','.h...h..','..hhh...','...y....','..yyy...','...y....'],
  i_pecoelho:['.ww.ww..','.ww.ww..','.wwwww..','wwwwwww.','wwkwkww.','.wwwww..','..y.y...'],
  i_cuia:['........','..uuuu..','.uUUUUu.','bBBBBBBb','.bBBBBb.','..bbbb..'],
  i_sandalia:['.bbbbb..','bBBBBBb.','bB.y.Bb.','bBBBBBb.','bBBBBBb.','.bbbbb..'],
  chama:['.y.','yoy','.o.'],
  caipora:['..oo..........','.oooo.........','.osso.........','..ss..nnnnnnn.','.gggnnnnnnnnnn','.gggnnnnnnnnnk','..gnnnnnnnnnw.','...nn.nn.nn.n.','...kk.kk.kk.k.'],
  iara:['...cccc...','..cccccc..','..cssssc..','..skssks..','..ssssss..','c.ssrrss.c','cc.gggg.cc','.cggggggc.','..gggggg..','.uuuuuuuu.','uuUuuUuuuu','.uuuuuuuu.'],
  cabra:['h.......h.','hh.....hh.','.wwwwwww..','.wkwwwkw..','..wwwww...','..wwwwwwwww','...wwwwwwww','...ww.ww.ww','...kk.kk.kk'],
  muricoca:['k.k','.k.','k.k'],
  poco:['.hhhhhhhh.','h........h','hBBBBBBBBh','hhhhhhhhhh','hHhHhHhHhh','hhhhhhhhhh','.HHHHHHHH.'],
  estrela:['...y...','..yYy..','yyYYYyy','.yYYYy.','.yy.yy.','y.....y'],
  morador:['..bbbb..','.bbbbbb.','..ssss..','..sksk..','..ssss..','.rrrrrr.','srrrrrrs','..uuuu..','..u..u..','..k..k..'],
  benzedeira:['...wwwwww...','..wwwwwwww..','..wssssssw..','..wsksskw...','..wssssssw..','...wSssSw...','..uuuuuuuu..','.suuuuuuuus.','.suuuyuuuus.','..uuuuuuuu..','.uuuuuuuuuu.','..uuuuuuuu..','...ss..ss...','...BB..BB...'],
  i_bornal:['..b..b..','...bb...','..b..b..','.bbbbbb.','bBBBBBBb','bBByyBBb','bBBBBBBb','.bbbbbb.'],
  urubu:['x........x','xx..zz..xx','xxxxzzxxxx','.xxxxxxxx.','..x....x..'],
  urubu2:['..........','....zz....','xxxxzzxxxx','xxxxxxxxxx','x.x....x.x'],
  curupira:['..oooo......','.oooooo.....','ooooooooo...','oosssssso...','.osskssks...','..sssssss...','...SsssS....','..gggggg....','.sggggggs...','.sgGggGgs...','..gGgGgg....','...ss..ss...','..ss..ss....','.SS..SS.....'],
  cuca:['..c.....hhhhhh......','.ckc...hhhhhhhh.....','..b...hhGGGGGGhh....','..b..hhGgeggegGhh...','..b..hGggggggggggggg','..b..hGgggwgwgwgwggg','..b..hhGgggggggggg..','..b...hhGggggggh....','..b..pppppppppppp...','..b.ppppPPPPPPpppp..','..gGppppPPPPPPpppppp','..b.ppppPPPPPPppp.gg','..b..pppppppppppp...','..b.pppppppppppppp..','..b.pppppppppppppp..','..bpppppppppppppppp.','..b..GG........GG...'],
  boitataHead:['..c..c..c.....','.cCccCccCc....','cCbbbbbbbbc...','cbbbbbbbbwbb..','bbbbbbbbbbbbb.','bbbbbbbbbbbbbb','bbbbbbbbbbbbcc','cbbbbbbbbbbbb.','.cbbbbbbbbbb..','..ccbbbbcc....'],
  boitataSeg:['..cCCc..','.cbbbbc.','cbbCbbbc','cbbbbbbc','cbbbbCbc','cbbbbbbc','.cbbbbc.','..cccc..'],
  capela:['.....y......','....yyy.....','.....y......','....www.....','...wwwww....','..wwwwwww...','.wwwwwwwww..','wwwwwwwwwww.','.whhwwwhhw..','.whhwBwhhw..','.wwwwBwwww..','.wwwBBBwww..','.wwwBBBwww..','.HHHHHHHHH..'],
  cinza:['........','........','...H....','..HhH...','.BHHHB..','.BdBdB..','BBdBdBB.'],
  bau:['.bbbbbbbb.','bByyyyyyBb','bBBBBBBBBb','kkkkyykkkk','bbbbyybbbb','bBBBBBBBBb','bBBBBBBBBb','bbbbbbbbbb'],
  tapioca:['.wwwwww.','wwtwwtww','wwwrrwww','wtwwwwtw','.wwwwww.'],
  baiao:['..qqqqq..','.qqgqqqq.','qqqqqyqqq','wqqqqqqqw','.wwwwwww.','..wwwww..'],
  pocao:['.k.','lll','lll'],
  trapalhona:['..wwww..','.wwwwww.','wkwwwkw.','wwwwwwww','wwwppwww','wwwppwww','wwwwwwww','w.w..w.w'],
  coronel:['...kkkk.....','..kkkkkk....','kkkkkkkkkk..','..ssssss....','..skssks....','..sBBBBs....','...ssss.....','.wwwwwwww...','wwwwrwwwww..','swwwrwwwws..','s.wwwwwww.s.','..wwwwwww...','..kk...kk...','..kk...kk...'],
  cruz:['...bb...','...bb...','bbbbbbbb','bbbbbbbb','...bb...','...bb...','...bb...','...bb...','..BBBB..'],
  cang:['...yy...','..ybby..','.ybbbby.','ybbybbby','yyyyyyyy'],
  rapGrande:['.yyyyyyyy.','ybbbbbbbbB','ybbbbbbbbB','ybbbbbbbbB','ybbbbbbbbB','.BBBBBBBB.'],
  mel:['..BB..','.wyyw.','wyyyyw','wyYyyw','wyyyyw','.wwww.'],
  gato:['k...k...','kk.kk...','kkkkk...','kekek..k','kkkkk..k','.kkkkkkk','.kkkkkk.','.k.k.k.k'],
  prea:['..nn....','.nnnnn..','nknnnnn.','nnnnnnnn','.nnnnnnn','..n..n..'],
  carcara:['...kk...','..kwwk..','..kwek..','.kkkkkk.','kkkkkkkk','k.kkkk.k','...yy...'],
  juazeiro:['.....gggggg.....','...gggGgggggg...','..ggGggggGgggg..','.gggggggggggGgg.','ggGgggGgggggggg.','gggggggggGggggGg','.gggGgggggggggg.','..ggggggGgggg...','....gg.BB.gg....','.......BB.......','.......BB.......','......BBBB......'],
  carcaca:['w........w','ww......ww','.wwwwwwww.','..wkwwkw..','..wwwwww..','...wkkw...','....ww....'],
  cerquinha:['b....b....b...','bbbbbbbbbbbbbb','b....b....b...','bbbbbbbbbbbbbb','b....b....b...','B....B....B...'],
  cruzBeira:['...h...','...h...','.hhhhh.','...h...','...h...','.r.h.y.','ryrhyry','HHHHHHH'],
  lambisgoia:['...hhhh...','..hhhhhh..','..hekkeh..','..hhhhhh..','...hkkh...','...wwww...','.hwwwwwwh.','h.wwwwww.h','h.wwwwww.h','h..wwww..h','k..wwww..k','...wwww...','...wwww...','...w..w...','...w..w...','..ww..ww..'],
  velha:['..wwwwww..','.wwwwwwww.','.wsssssw..','.wskssksw.','.wsssssw..','..wsssw...','..wwwwww..','.wwwwwwww.','wwwwwwwwww','wwwwwwwwww','.wwwwwwww.','.wwwwwwww.','..wwwwww..','...w..w...'],
  porca:['..p.......p...','.ppppppppppp..','ppppppppppppp.','pkpppppppppppp','PPpppppppppppp','.ppppppppppppp','..pp.pp..pp.pp','..pp.pp..pp.pp','..kk.kk..kk.kk'],
  leitao:['.ppppp.','ppppppp','kpppppp','.pp.pp.','.kk.kk.'],
  cavaleiro:['......kk........','.....kkkk.......','.....rrrr.......','....rrrrrr......','....rrrrrr......','...hkkkkkkh.....','..kkkkkkkkkkkkk.','.kkkkkkkkkkkkkkk','kkkkkkkkkkkkkkk.','.kkkkkkkkkkkkk..','..kk.kk..kk.kk..','..kk.kk..kk.kk..','..hh.hh..hh.hh..'],
  mapinguari:['......nnnnnnnn......','....nnnnnnnnnnnn....','...nnnnnnnnnnnnnn...','...nnnnneennnnnnn...','..nnnnnnnnnnnnnnnn..','..NnnnnnnnnnnnnnnN..','.NNnnnnnnnnnnnnnnNN.','NN.nnnnnnnnnnnnnn.NN','N..nnnnnkkkkknnnn..N','w..nnnnkwwwwwknnn..w','...nnnnkrrrrrknnn...','...nnnnnkkkkknnnn...','...nnnnnnnnnnnnnn...','...NNNNNNNNNNNNNN...','...nnnn......nnnn...','...nnnn......nnnn...','..NNNNN......NNNNN..'],
  paimato:['.....gggggggg.....','...ggGggggggGgg...','..gggggggGggggggg.','.ggGgggggggggGggg.','..gggggGgggggggg..','....bbbbbbbbbb....','....bbebbbbebb....','....bbbbbbbbbb....','...bbbbkkkkbbbb...','.bbbbbbbbbbbbbbbb.','b..bbbbbbbbbbbb..b','b...bbbbbbbbbb...b','g...bbbbbbbbbb...g','....bbbbBBbbbb....','....bbbb..bbbb....','...bbbb....bbbb...','..BBBB......BBBB..'],
  raiz:['....bb....','...bbbb...','.b.bbbb.b.','bb.bbbb.bb','.bbbbbbbb.','..bbbbbb..'],
  romeiro:['..y..','.www.','.wsw.','wwwww','.www.','.w.w.'],
  i_facao:['.......h','......hh','.....hh.','....hh..','...hh...','.bhh....','bBb.....','Bb......'],
  i_bodoque:['b.....b.','.b...b..','..bbb...','...b....','...b....','.nn.....','nnn.....','.n......'],
  i_matraca:['..bbbb..','.bBBBBb.','bBhhhhBb','bBhhhhBb','.bBBBBb.','...bb...','...bb...','...BB...'],
  tumulo:['..hhh..','.hhhhh.','hhkhkhh','hhhkhhh','hhhkhhh','hhhhhhh','hhhhhhh','HHHHHHH'],
  casaFarinha:['..k...........','..kk..rrrrrr..','..kkrrrrrrrrrr','..rrrrrrrrrrrr','.wwwwwwwwwwww.','.wwBBwwwwwBBw.','.wwBBwwwwwBBw.','.wwwwwBBBwwww.','.wwwwwBkBwwww.','.HHHHHBBBHHHH.','tt.........tt.','tt.........tt.'],
  pote:['..BB..','.bbbb.','bbbbbb','bBbbBb','bbbbbb','.bbbb.'],
  cerca:['b..b..b.','bbbbbbbb','b..b..b.','bbbbbbbb','b..b..b.','B..B..B.'],
  carroca:['..bbbbbbbb..','.bBBBBBBBBb.','bbbbbbbbbbbb','.BBB.BBB.BBB','..k......k..','.khk....khk.','..k......k..'],
  alma:['..wwww..','.wwwwww.','wwkwwkww','wwwwwwww','wwwkkwww','wwwwwwww','w.ww.ww.','..w..w..'],
  casa:['......rrrrrr......','....rrrrrrrrrr....','..rrrrrrrrrrrrrr..','rrrrrrrrrrrrrrrrrr','.wwwwwwwwwwwwwwww.','.wwkkwwwwwwwkkwww.','.wwkkwwwwwwwkkwww.','.wwwwwwBBBwwwwwww.','.wwwwwwBkBwwwwwww.','.wHwwwwBkBwwwwHww.','.wwwwwwBkBwwwwwww.','.HHHHHHBBBHHHHHHH.'],
  altar:['...y....','...o....','..hhhh..','.hHHHHh.','.hHrrHh.','hhhhhhhh','HHHHHHHH'],
  folha:['wwwww','wkkkw','wwwww','wkwkw','wwwww'],
  galo:['..rr....','.rwwr...','.wkwwo..','..wwww.g','.wwwwwgg','wwwwwww.','.wwwww..','..y.y...'],
  carro:['..........bbbbbbbbbbb.','.ww.......bBBBBBBBBBb.','wnnn......bbbbbbbbbbb.','nnnnnnnnn.bBBBBBBBBBb.','nnnnnnnnnbbbbbbbbbbbb.','.nnnnnnnn..BBBBBBBBB..','.n.n..n.n..kk.....kk..','.n.n..n.n.khhk...khhk.','...........kk.....kk..'],
  i_folhetos:['.wwwww..','.wkkkw..','wwwwwww.','wkwkwkw.','wwwwwww.','wkkkwkw.','wwwwwww.'],
  i_aboio:['......y.','.bb..y..','bBBb..y.','bbbbb.y.','.ssss.y.','..ss.y..','.ssss.y.'],
  i_lampiao:['...kk...','..hhhh..','..hYYh..','.hYyyYh.','.hYyyYh.','..hYYh..','..hhhh..','.HHHHHH.'],
  i_fitinha:['......rr','.....rr.','....uu..','...uu...','..yy....','.yy.....','gg......','g.......'],
  i_tarrafa:['...w....','..w.w...','.wwwww..','w.w.w.w.','wwwwwww.','w.w.w.w.','.hhhhh..'],
  i_berimbau:['..b.....','.b.w....','b..w....','b..w....','b..w....','yy.w....','yyw.....','.b......'],
  i_cachaca:['...BB...','...ww...','...ww...','..wyyw..','.wyyyyw.','.wyBByw.','.wyyyyw.','.wwwwww.'],
  i_ferradura:['hk....kh','hh....hh','hh....hh','hh....hh','.hh..hh.','..hhhh..'],
};
function mk(rows, pal) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (r[i] !== '.' && col) { x.fillStyle = col; x.fillRect(i, j, 1, 1); } } });
  return c;
}
function xform(c, flip, color) {
  const f = document.createElement('canvas'); f.width = c.width; f.height = c.height; const x = f.getContext('2d');
  if (flip) { x.translate(c.width, 0); x.scale(-1, 1); }
  x.drawImage(c, 0, 0);
  if (color) { x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = color === true ? '#fff' : color; x.fillRect(0, 0, c.width, c.height); }
  return f;
}
function outline(c) {
  const o = document.createElement('canvas'); o.width = c.width + 2; o.height = c.height + 2; const x = o.getContext('2d');
  for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) x.drawImage(c, dx, dy);
  x.globalCompositeOperation = 'source-in'; x.fillStyle = '#07060f'; x.fillRect(0, 0, o.width, o.height);
  x.globalCompositeOperation = 'source-over'; x.drawImage(c, 1, 1); return o;
}
function scale2x(c) { // Scale2x: dobra a resolução arredondando as diagonais (mais detalhe nos chefões)
  const w = c.width, h = c.height, src = c.getContext('2d').getImageData(0, 0, w, h).data, o = document.createElement('canvas'); o.width = w * 2; o.height = h * 2;
  const ox = o.getContext('2d'), out = ox.createImageData(w * 2, h * 2), d = out.data;
  const px = (x, y) => { x = clamp(x, 0, w - 1); y = clamp(y, 0, h - 1); const i = (y * w + x) * 4; return (src[i] << 24 | src[i + 1] << 16 | src[i + 2] << 8 | src[i + 3]) >>> 0; };
  const put = (x, y, v) => { const i = (y * w * 2 + x) * 4; d[i] = v >>> 24; d[i + 1] = v >>> 16 & 255; d[i + 2] = v >>> 8 & 255; d[i + 3] = v & 255; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const E = px(x, y), B = px(x, y - 1), D = px(x - 1, y), F = px(x + 1, y), H = px(x, y + 1);
    const ok = B !== H && D !== F;
    put(x * 2, y * 2, ok && D === B ? D : E); put(x * 2 + 1, y * 2, ok && B === F ? F : E);
    put(x * 2, y * 2 + 1, ok && D === H ? D : E); put(x * 2 + 1, y * 2 + 1, ok && H === F ? F : E);
  }
  ox.putImageData(out, 0, 0); return o;
}
function walkRows(rows) { // 2 quadros: grupos de pernas alternados sobem 1 pixel
  const h = rows.length, L = h >= 12 ? 3 : 2, w = Math.max(...rows.map(r => r.length)), cols = [];
  for (let x = 0; x < w; x++) cols.push(rows.slice(h - L).some(r => r[x] && r[x] !== '.'));
  const groups = []; let g = -1; for (let x = 0; x < w; x++) { if (cols[x] && (x === 0 || !cols[x - 1])) groups.push([]); if (cols[x]) groups[groups.length - 1].push(x); }
  if (groups.length < 2) return null;
  const frame = par => rows.map((r, j) => { if (j < h - L) return r; const a = r.padEnd(w, '.').split(''); groups.forEach((gr, gi) => { if (gi % 2 !== par) return; for (const x of gr) a[x] = j + 1 < h ? (rows[j + 1][x] || '.') : '.'; }); return a.join(''); });
  return [frame(0), frame(1)];
}
function finish(n) { return { n, f: xform(n, 1), w: xform(n, 0, true), wf: xform(n, 1, true), k: xform(n, 0, '#000'), r: xform(n, 0, '#ff3b2e'), rf: xform(n, 1, '#ff3b2e'), W: n.width, H: n.height }; }
function sprite(rows, palOver, opt) {
  const pal = palOver ? Object.assign({}, PAL, palOver) : PAL, o = opt || {};
  const build = r => { let n = mk(r, pal); if (o.x2) n = scale2x(n); if (o.out) n = outline(n); return finish(n); };
  const s = build(rows);
  if (o.walk) { const fr = walkRows(rows); if (fr) s.walk = [build(fr[0]), s, build(fr[1]), s]; }
  return s;
}
const OUT = new Set(['lambisgoia', 'velha', 'porca', 'leitao', 'cavaleiro', 'mapinguari', 'paimato', 'vaqueiro', 'pescador', 'forrozeira', 'benzedeira', 'morcego', 'morcego2', 'vagalume', 'saci', 'mula', 'lobisomem', 'corposeco', 'cuca', 'boitataHead', 'boitataSeg', 'curupira', 'urubu', 'urubu2', 'trapalhona', 'alma', 'cabra', 'caipora', 'iara', 'coronel', 'gato', 'prea', 'carcara', 'galo', 'morador']);
const X2 = new Set(['lobisomem', 'corposeco', 'cuca', 'boitataHead', 'mapinguari', 'paimato']);
const WALK = new Set(['lambisgoia', 'porca', 'leitao', 'cavaleiro', 'mapinguari', 'paimato', 'vaqueiro', 'pescador', 'forrozeira', 'benzedeira', 'lobisomem', 'cuca', 'curupira', 'cabra', 'mula', 'caipora', 'morador', 'gato', 'prea']);
const TALL = new Set(['mandacaru', 'juazeiro', 'cruzBeira', 'cerquinha']);
function frameOf(s, t, moving) { return s.walk && moving ? s.walk[Math.floor(t * 8) % 4] : s; }
const S = {};
// paletas próprias dos chefões (designs L1, C3, K1 e B3)
const SPAL = {
  lobisomem: { h: '#8a7a6a', H: '#5a4c40', e: '#ffd23f', r: '#a83a32', R: '#6e2420', s: '#2a1c1c' },
  corposeco: { y: '#d9b24a', Y: '#a8842a', n: '#ad9c7e', e: '#e05545', x: '#2a2433', r: '#6e2420', R: '#4a1a18' },
  cuca: { h: '#c9c9d6', p: '#4a2f6b', P: '#6f4f99', e: '#ffd23f', c: '#f0ead6' },
  boitataHead: { c: '#5fd4ff', C: '#a8eaff', b: '#2a6cc8', w: '#ffffff' },
  boitataSeg: { c: '#5fd4ff', C: '#a8eaff', b: '#2a6cc8' },
  pote: { b: '#b5653a', B: '#7a3f22' },
  tumulo: { h: '#7a7a90', H: '#4a4a60' },
  lambisgoia: { h: '#9a96aa', w: '#3a3450' },
  velha: { s: '#d8d0c0', w: '#f0ead6' },
  porca: { p: '#c98a7a', P: '#a0605a' }, leitao: { p: '#d99a8a' },
  cavaleiro: { k: '#1c1a2a', r: '#6e2420', h: '#e8832a' },
  mapinguari: { n: '#6b4a2e', N: '#4a3220', e: '#ffd23f' },
  paimato: { b: '#6b4a2e', B: '#4a3220', g: '#3d6b33', G: '#5f9e4a', e: '#ffd23f' },
  raiz: { b: '#5c3a1c' }, romeiro: { w: '#e8eeff', s: '#c9d4f0' }, i_bodoque: { n: '#7a5a3a' },
  casaFarinha: { r: '#7a3a2a', w: '#c9bfa8', H: '#7a7060', t: '#e8d9b0', k: '#3a3a4a' },
  juazeiro: { g: '#2f5a33', G: '#3d6b33' },
  carcaca: { w: '#cfc8b4' },
  cruzBeira: { h: '#8a8aa0', H: '#5e5e78' },
  i_zabumba: { h: '#c9c9d6' },
  caipora: { o: '#e8832a', n: '#4a3a2a', g: '#3d6b33' },
  iara: { c: '#3a2a1a', u: '#2a6cc8', U: '#5fd4ff', g: '#5f9e4a' },
  cabra: { h: '#8a7a6a', w: '#d8d4c4' },
  muricoca: { k: '#3a3a4a' },
  poco: { h: '#8a8aa0', H: '#5e5e78' },
  benzedeira: { u: '#3b6ea5' },
  trapalhona: { w: '#e8e4ff', p: '#e86a9a' },
  mel: { y: '#e8a020', Y: '#fff6a0' },
  gato: { k: '#3a3a4a', e: '#9fe07a' },
  prea: { n: '#a87a4a' },
  carcara: { k: '#4a3a2a', e: '#ffd23f' },
  alma: { w: '#cfe0ff' },
  casa: { r: '#7a3a2a', w: '#c9bfa8', H: '#7a7060' },
  altar: { h: '#8a8aa0', H: '#5e5e78' },
};
for (const k in SD) S[k] = sprite(SD[k], SPAL[k], { out: OUT.has(k), x2: X2.has(k), walk: WALK.has(k) });
S.galinha = sprite(SD.galo, { w: '#f2c14e', r: '#c8463c' }, { out: true });
S.sanfOuro = sprite(SD.i_sanfona, { r: '#f2c14e', w: '#fff6a0' });
S.cajuG = sprite(SD.caju, { c: '#f2c14e' });
const icoCache = {};
function icon(k) { if (icoCache[k]) return icoCache[k]; const s = S['i_' + k] || S[k]; return icoCache[k] = s.n.toDataURL(); }

/* números em pixel 3x5 com contorno */
const DIG = { '0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001001001001','8':'111101111101111','9':'111101111001111' };
function digits(color) {
  const out = {};
  for (const k in DIG) {
    const c = document.createElement('canvas'); c.width = 5; c.height = 7; const x = c.getContext('2d'); const b = DIG[k];
    x.fillStyle = '#000'; for (let i = 0; i < 15; i++) if (b[i] === '1') x.fillRect(i % 3, (i / 3) | 0, 3, 3);
    x.fillStyle = color; for (let i = 0; i < 15; i++) if (b[i] === '1') x.fillRect(i % 3 + 1, ((i / 3) | 0) + 1, 1, 1);
    out[k] = c;
  }
  return out;
}
const DW = digits('#ffffff'), DY = digits('#f2c14e'), DG = digits('#86d46f');

function moonImg() {
  const c = document.createElement('canvas'); c.width = c.height = 28; const x = c.getContext('2d');
  for (let j = 0; j < 28; j++) for (let i = 0; i < 28; i++) {
    const d = Math.hypot(i - 13.5, j - 13.5);
    if (d < 12.5) { x.fillStyle = d > 11 ? '#d9c98f' : '#f4e7b6'; x.fillRect(i, j, 1, 1); }
  }
  x.fillStyle = '#d9c98f'; [[8, 9, 3], [16, 15, 4], [17, 7, 2], [9, 18, 2]].forEach(([a, b, r]) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) x.fillRect(a + i, b + j, 1, 1); });
  return c.toDataURL();
}

/* ---------------- som ---------------- */
let AC = null, master = null, noiseBuf = null; const lastSfx = {};
function audioInit() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); master = AC.createGain(); master.gain.value = 0.32; master.connect(AC.destination); } catch (e) { AC = null; }
}
function tone(t, type, f1, f2, dur, vol) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f1, t);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
}
function noise(t, dur, vol, freq) {
  if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate * 0.5, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const s = AC.createBufferSource(); s.buffer = noiseBuf; const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
  const g = AC.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur);
}
const SFX = {
  hit: t => noise(t, 0.05, 0.22, 2600),
  crit: t => { noise(t, 0.06, 0.25, 4200); tone(t, 'square', 1760, 2400, 0.06, 0.05); },
  pick: t => tone(t, 'square', 880, 1320, 0.05, 0.06),
  lvl: t => [523, 659, 784, 1046].forEach((f, i) => tone(t + i * 0.07, 'square', f, 0, 0.12, 0.1)),
  hurt: t => tone(t, 'sawtooth', 220, 90, 0.18, 0.16),
  boom: t => { noise(t, 0.35, 0.4, 900); tone(t, 'sine', 120, 40, 0.3, 0.25); },
  swing: t => noise(t, 0.07, 0.1, 5200),
  shoot: t => tone(t, 'square', 620, 300, 0.05, 0.04),
  boss: t => { tone(t, 'sawtooth', 90, 55, 0.9, 0.22); tone(t + 0.12, 'sawtooth', 70, 45, 0.9, 0.18); },
  die: t => tone(t, 'square', 400, 60, 0.8, 0.18),
  win: t => [392, 523, 659, 784, 1046].forEach((f, i) => tone(t + i * 0.12, 'triangle', f, 0, 0.3, 0.14)),
  tp: t => tone(t, 'sine', 300, 1200, 0.12, 0.06),
  coin: t => { tone(t, 'square', 988, 0, 0.05, 0.07); tone(t + 0.06, 'square', 1319, 0, 0.12, 0.07); },
  ui: t => tone(t, 'square', 660, 0, 0.04, 0.05),
  zap: t => { tone(t, 'square', 1400, 500, 0.08, 0.05); tone(t + 0.02, 'triangle', 300, 900, 0.1, 0.05); },
  splash: t => noise(t, 0.2, 0.2, 700),
  thunder: t => { noise(t, 1.1, 0.4, 260); tone(t, 'sine', 55, 28, 1, 0.22); },
  warn: t => { tone(t, 'sine', 110, 0, 0.6, 0.18); tone(t + 0.7, 'sine', 110, 0, 0.6, 0.18); },
  aboio: t => { tone(t, 'sawtooth', 196, 294, 0.35, 0.12); tone(t + 0.3, 'sawtooth', 294, 220, 0.4, 0.1); },
};
const SFX_GAP = { crit: 0.08, aboio: 0.3, zap: 0.06, splash: 0.1, hit: 0.045, pick: 0.035, boom: 0.08, swing: 0.06, shoot: 0.05, tp: 0.1 };
function sfx(name) {
  if (!AC || !save.sound || AC.state !== 'running') return;
  const now = AC.currentTime; if (lastSfx[name] && now - lastSfx[name] < (SFX_GAP[name] || 0.02)) return;
  lastSfx[name] = now; try { SFX[name](now); } catch (e) {}
}

