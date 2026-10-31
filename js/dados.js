'use strict';
/* ---------------- dados do jogo ---------------- */
const WEAPONS = {
  chapeu:   { name: 'Chapéu de Couro', desc: 'Vai e volta como bumerangue, atravessando inimigos.', evo: 'bornal', evoName: 'Chapéu Encantado', evoDesc: 'Três chapéus maiores que vão mais longe.' },
  peixeira: { name: 'Peixeira', desc: 'Golpe rápido na direção em que você anda.', evo: 'pimenta', evoName: 'Facão do Cangaço', evoDesc: 'Golpes nas quatro direções com muito mais dano.' },
  baladeira:{ name: 'Baladeira', desc: 'Atira pedras no inimigo mais próximo.', evo: 'cordel', evoName: 'Chuva de Pedras', evoDesc: 'Leque de pedras que atravessam a multidão.' },
  sanfona:  { name: 'Sanfona', desc: 'Aura de som que fere quem chega perto.', evo: 'zabumba', evoName: 'Trio Pé-de-Serra', evoDesc: 'Aura maior e ondas sonoras que empurram tudo.' },
  fogueira: { name: 'Fogueira de São João', desc: 'Acende fogueiras no chão que queimam inimigos.', evo: 'lamparina', evoName: 'Noite de São João', evoDesc: 'Fogueiras enormes que duram mais.' },
  rojao:    { name: 'Rojão', desc: 'Foguete que explode em área.', evo: 'cafe', evoName: 'Girândola', evoDesc: 'Uma salva de rojões de uma vez só.' },
  tarrafa:  { name: 'Tarrafa', desc: 'Joga uma rede que prende os inimigos no lugar.', evo: 'gibao', evoName: 'Tarrafa de Arrasto', evoDesc: 'Redes enormes que prendem por muito mais tempo.' },
  folhetos: { name: 'Cordel Mágico', desc: 'Folhetos de cordel giram à sua volta e cortam quem encosta.', evo: 'lampiao', evoName: 'Cordel Iluminado', evoDesc: 'Mais folhetos, maiores e girando mais rápido.' },
  aboio:    { name: 'Aboio', desc: 'Grito de vaqueiro que empurra e atordoa tudo em volta.', evo: 'cachaca', evoName: 'Aboio Valente', evoDesc: 'Grito bem mais longe, forte e com atordoamento longo.' },
  galo:     { name: 'Galo de Briga', desc: 'Solta galos que correm atrás dos inimigos e bicam.', evo: 'fitinha', evoName: 'Rinha de Galos', evoDesc: 'Mais galos, mais rápidos e com bicada forte.' },
  facao:    { name: 'Facão de Mato', desc: 'Lâmina que gira em volta num arco largo.', evo: 'chinelo', evoName: 'Facão Redemoinho', evoDesc: 'Mais lâminas, mais longas e mais fortes.' },
  bodoque:  { name: 'Bodoque de Barro', desc: 'Bolinhas que deixam lama e atrasam os inimigos.', evo: 'terco', evoName: 'Bodoque do Barreiro', evoDesc: 'Mais bolinhas e lama que dura mais.' },
  matraca:  { name: 'Matraca', desc: 'Rajada barulhenta que empurra tudo à sua frente.', evo: 'cuia', evoName: 'Matraca de Quaresma', evoDesc: 'Cone mais largo, longo e forte.' },
  bumbo:    { name: 'Zabumba', desc: 'Batidas que fazem o chão tremer em ondas.', evo: 'sandalia', evoName: 'Zabumba Trovão', evoDesc: 'Ondas duplas, maiores e mais fortes.' },
  candeeiro:{ name: 'Candeeiro', desc: 'Chama lenta que explode ao acertar.', evo: 'pecoelho', evoName: 'Candeeiro da Sorte', evoDesc: 'Mais chamas, explosões maiores que deixam fogo.' },
  berimbau: { name: 'Berimbau', desc: 'Raio de som que ricocheteia entre inimigos.', evo: 'ferradura', evoName: 'Berimbau Encantado', evoDesc: 'O som pula por muito mais inimigos e bate mais forte.' },
};
const PASSIVES = {
  pimenta:   { name: 'Pimenta-de-Cheiro', desc: '+10% de dano.', max: 5 },
  lamparina: { name: 'Lamparina', desc: '+10% de área.', max: 5 },
  cordel:    { name: 'Almanaque', desc: 'Armas recarregam 8% mais rápido.', max: 5 },
  cafe:      { name: 'Café Forte', desc: '+10% de velocidade.', max: 5 },
  gibao:     { name: 'Gibão de Couro', desc: '+20 de vida máxima.', max: 5 },
  zabumba:   { name: 'Triângulo', desc: '+1 projétil nas armas.', max: 2 },
  bornal:    { name: 'Bornal', desc: 'Pega cajus de 30% mais longe.', max: 5 },
  cachaca:   { name: 'Cachaça de Alambique', desc: '+25% de dano, mas você anda meio torto.', max: 3 },
  ferradura: { name: 'Ferradura', desc: 'Mais sorte: mais comida, rapadura, baús e cartas.', max: 5 },
  lampiao:   { name: 'Lampião a Gás', desc: 'Ilumina mais longe e mostra os inimigos no minimapa.', max: 3 },
  chinelo:   { name: 'Chinelo', desc: '+12% de velocidade, mas escorrega nas curvas.', max: 3 },
  terco:     { name: 'Terço', desc: 'Cura 1 de vida a cada 10 inimigos derrotados.', max: 3 },
  pecoelho:  { name: 'Pé de Coelho', desc: '8% de chance de desviar de um ataque.', max: 4 },
  cuia:      { name: 'Cuia de Água', desc: 'Habilidade recarrega 15% mais rápido.', max: 3 },
  sandalia:  { name: 'Sandália de Couro', desc: 'Andando você deixa um rastro que machuca.', max: 4 },
  fitinha:   { name: 'Fitinha do Bonfim', desc: 'Salva você da morte uma vez na noite.', max: 1 },
};
const FOODS = [['tapioca', 20], ['cuscuz', 35], ['baiao', 50]], FOODK = new Set(['tapioca', 'cuscuz', 'baiao']);
const WMAX = 8, SLOTS = 6;
const CHARS = {
  vaqueiro:   { name: 'Vaqueiro', weapon: 'chapeu', bonus: '+20 de vida máxima', hp: 20, price: 0, ab: 'laco', abName: 'Laço', abDesc: 'Puxa os inimigos próximos e prende por 1s.', abCd: 10 },
  pescador:   { name: 'Pescador', weapon: 'peixeira', bonus: '+15% de velocidade e +20 de vida', spd: 1.15, hp: 20, price: 150, unlockTxt: 'Sobreviva 5 minutos', ab: 'mergulho', abName: 'Mergulho', abDesc: 'Some por 1,5s sem tomar dano, os inimigos perdem o rastro e ele volta espirrando água.', abCd: 7 },
  forrozeira: { name: 'Forrozeira', weapon: 'sanfona', bonus: '+10% de área', area: 1.1, price: 300, unlockTxt: 'Derrote o Lobisomem', ab: 'forro', abName: 'Forró', abDesc: 'Atordoa todos em volta por 1,2s.', abCd: 14 },
  benzedeira: { name: 'Benzedeira', weapon: 'candeeiro', bonus: 'Cura 1 de vida por segundo, +10 de vida e começa com o Terço', regen: 1, hp: 10, startPass: { terco: 1 }, price: 400, unlockTxt: 'Vença uma noite', ab: 'benzer', abName: 'Benzer', abDesc: 'Cura 35 de vida, protege por 1,5s e afasta quem está perto.', abCd: 12 },
};
const SKINS = {
  vaqueiro:   { name: 'Gibão Dourado', ach: 'amanhecer', pal: { b: '#d9a93a', B: '#9c7420' } },
  pescador:   { name: 'Pescador da Noite', ach: 'mil', pal: { u: '#8160a8', U: '#b79be0', y: '#f0ead6' } },
  forrozeira: { name: 'Vestido de Chita', ach: 'evolui', pal: { r: '#2f7fc8', w: '#f2c14e', d: '#3b2414' } },
};
for (const k in SKINS) S[k + '_skin'] = sprite(SD[k], SKINS[k].pal, { out: true, walk: true });
const SYN = {
  fogos:     { a: 'fogueira', b: 'rojao', name: 'Noite de Fogos', desc: 'Explosões do rojão deixam fogo no chão.' },
  pescaria:  { a: 'tarrafa', b: 'peixeira', name: 'Pescaria', desc: 'Peixeira dá +50% de dano em inimigos presos.' },
  forro:     { a: 'sanfona', b: 'berimbau', name: 'Roda de Forró', desc: 'Berimbau ricocheteia mais 2 vezes.' },
  vaquejada: { a: 'chapeu', b: 'aboio', name: 'Vaquejada', desc: 'Chapéu de Couro ganha +1 chapéu.' },
  galofogo:  { a: 'galo', b: 'fogueira', name: 'Galo de Fogo', desc: 'Bicadas dos galos batem 40% mais forte e às vezes pegam fogo.' },
  repente:   { a: 'folhetos', b: 'berimbau', name: 'Repente', desc: 'Berimbau ganha +1 raio e os folhetos batem 50% mais forte.' },
  acude:     { a: 'tarrafa', b: null, name: 'Pesca no Açude', desc: 'Redes que caem no açude ficam 2x maiores e prendem 50% mais.' },
};
const ENAMES = { morcego: 'Morcego', vagalume: 'Vagalume', saci: 'Saci', mula: 'Mula sem cabeça', curupira: 'Curupira', urubu: 'Urubu', lobisomem: 'Lobisomem', corposeco: 'Corpo-Seco', cuca: 'Cuca', boitata: 'Boitatá', alma: 'Alma penada', trapalhona: 'Visagem trapalhona', caipora: 'Caipora', iara: "Mãe-d'Água", cabra: 'Cabra-cabriola', muricoca: 'Muriçoca', lambisgoia: 'Lambisgoia', velha: 'Velha de branco', porca: 'Porca dos sete leitões', leitao: 'Leitão', cavaleiro: 'Cavaleiro sem cabeça', mapinguari: 'Mapinguari', paimato: 'Pai do Mato' };
const TIPS = ['Fogueira com Rojão vira Noite de Fogos.', 'Fique em cima do altar para trocar vida por poder.', 'As cruzes puxam todos os cajus do mapa.', 'A Mula e o Lobisomem piscam antes de investir: saia da frente.', 'Atravesse o rio pelas pontes: na água todo mundo fica lento.', 'Proteja os moradores do vilarejo para ganhar um baú.', 'O Coronel aceita apostas com a rapadura da noite.', 'Jogue rapadura no poço dos desejos para ganhar um presente.', 'Arma no nível 8 com o item certo pode evoluir.', 'Tarrafa no açude prende o dobro.', 'A galinha de ouro foge em zigue-zague: corte o caminho dela.', 'Estrela cadente deixa um baú onde cai.', 'Use a habilidade quando estiver cercado.', 'Cada personagem sobe de nível conforme você joga com ele.', '5.000 abates com uma arma liberam a versão dourada dela.'];
const PWK = new Set(['cang', 'sanfOuro', 'rapGrande', 'mel']);
const PETS = { gato: { name: 'Gato Preto', desc: 'Arranha o inimigo mais perto de você.', price: 150 }, prea: { name: 'Preá', desc: 'Busca os cajus longe de você.', price: 250 }, carcara: { name: 'Carcará', desc: 'Mergulha do céu e bica os inimigos.', price: 400 } };
const ROL = [
  { w: 22, t: 'Dobrou a aposta!', good: 1, f: b => { G.rap += b * 2; } },
  { w: 8, t: 'Triplicou a aposta!', good: 1, f: b => { G.rap += b * 3; } },
  { w: 14, t: 'Ganhou um Baú do Coronel!', good: 1, f: () => { G.pendingChest++; } },
  { w: 14, t: 'Prato cheio: vida toda de volta!', good: 1, f: () => { player.hp = player.maxHp; } },
  { w: 24, t: 'Perdeu a aposta!', f: () => {} },
  { w: 18, t: 'Pegadinha: chegou uma elite!', f: () => { spawnElite(); } },
];
const ALTAR = [{ k: 'furia', name: 'Fúria: +60% de dano', short: 'Fúria' }, { k: 'pressa', name: 'Pressa: +40% de velocidade', short: 'Pressa' }, { k: 'ima', name: 'Ímã gigante', short: 'Ímã' }, { k: 'couro', name: 'Couro grosso: metade do dano', short: 'Couro' }];
const ACH = {
  noite5:    { name: 'Primeira Noite', desc: 'Sobreviva 5 minutos.', reward: 'Libera o Pescador' },
  lobisomem: { name: 'Caçador de Lobisomem', desc: 'Derrote o Lobisomem.', reward: 'Libera a Forrozeira' },
  evolui:    { name: 'Evolução', desc: 'Evolua uma arma.', reward: '+30 rapaduras', rap: 30 },
  mil:       { name: 'Mil Visagens', desc: 'Derrote 1.000 inimigos numa noite.', reward: '+50 rapaduras', rap: 50 },
  amanhecer: { name: 'Amanhecer', desc: 'Sobreviva os 30 minutos da noite.', reward: '+100 rapaduras, a Benzedeira e os modos Pesadelo e Infinito', rap: 100 },
  pesadelo:  { name: 'Pesadelo Vencido', desc: 'Vença a noite no Modo Pesadelo.', reward: '+200 rapaduras', rap: 200 },
};
const SHOP = {
  vida:    { name: 'Vida', desc: '+10 de vida máxima por nível', max: 5, base: 20, ico: 'gibao' },
  forca:   { name: 'Força', desc: '+5% de dano por nível', max: 5, base: 25, ico: 'pimenta' },
  pressa:  { name: 'Pressa', desc: '+5% de velocidade por nível', max: 5, base: 20, ico: 'cafe' },
  ima:     { name: 'Ímã', desc: '+10% de alcance de coleta por nível', max: 5, base: 15, ico: 'bornal' },
  recarga: { name: 'Recarga', desc: 'Armas 3% mais rápidas por nível', max: 5, base: 30, ico: 'cordel' },
  escolha: { name: 'Escolha Extra', desc: '4 cartas ao subir de nível', max: 1, base: 120, ico: 'lamparina' },
  reviver: { name: 'Reviver', desc: 'Volta uma vez por noite com metade da vida', max: 1, base: 200, ico: 'cuscuz' },
};
const EN = {
  morcego:    { hp: 6, spd: 36, dmg: 5, xp: 1, r: 4, spr: 'morcego', col: '#8160a8' },
  vagalume:   { hp: 4, spd: 52, dmg: 4, xp: 1, r: 3, spr: 'vagalume', col: '#fff6a0' },
  saci:       { hp: 18, spd: 30, dmg: 5, xp: 2, r: 5, spr: 'saci', col: '#c8463c' },
  mula:       { hp: 34, spd: 24, dmg: 9, xp: 3, r: 7, spr: 'mula', col: '#e8832a' },
  curupira:   { hp: 26, spd: 34, dmg: 9, xp: 2, r: 5, spr: 'curupira', col: '#e8832a' },
  lambisgoia: { hp: 45, spd: 30, dmg: 7, xp: 3, r: 5, spr: 'lambisgoia', col: '#9a96aa' },
  velha:      { hp: 40, spd: 0, dmg: 0, xp: 4, r: 6, spr: 'velha', col: '#f0ead6' },
  porca:      { hp: 160, spd: 44, dmg: 7, xp: 6, r: 8, spr: 'porca', col: '#c98a7a' },
  leitao:     { hp: 14, spd: 64, dmg: 3, xp: 1, r: 4, spr: 'leitao', col: '#d99a8a' },
  cavaleiro:  { hp: 320, spd: 110, dmg: 10, xp: 8, r: 8, spr: 'cavaleiro', col: '#6e2420' },
  mapinguari: { hp: 3000, spd: 26, dmg: 16, xp: 5, r: 15, spr: 'mapinguari', boss: 1, scale: 0.95, col: '#6b4a2e' },
  paimato:    { hp: 1800, spd: 30, dmg: 18, xp: 5, r: 14, spr: 'paimato', boss: 1, scale: 0.95, col: '#3d6b33' },
  caipora:    { hp: 400, spd: 140, dmg: 14, xp: 8, r: 9, spr: 'caipora', fly: 1, col: '#e8832a' },
  iara:       { hp: 80, spd: 0, dmg: 6, xp: 5, r: 6, spr: 'iara', col: '#5fd4ff' },
  cabra:      { hp: 30, spd: 32, dmg: 5, xp: 3, r: 6, spr: 'cabra', col: '#d8d4c4' },
  muricoca:   { hp: 2, spd: 58, dmg: 1, xp: 1, r: 2, spr: 'muricoca', col: '#3a3a4a' },
  trapalhona: { hp: 20, spd: 34, dmg: 4, xp: 2, r: 5, spr: 'trapalhona', col: '#e8e4ff' },
  alma:       { hp: 30, spd: 40, dmg: 10, xp: 3, r: 5, spr: 'alma', col: '#cfe0ff' },
  pote:       { hp: 12, spd: 0, dmg: 0, xp: 0, r: 5, spr: 'pote', prop: 1, col: '#b5653a' },
  cerca:      { hp: 20, spd: 0, dmg: 0, xp: 0, r: 6, spr: 'cerca', prop: 1, col: '#8a5a2b' },
  carroca:    { hp: 45, spd: 0, dmg: 0, xp: 0, r: 8, spr: 'carroca', prop: 1, col: '#8a5a2b' },
  urubu:      { hp: 10, spd: 120, dmg: 8, xp: 1, r: 4, spr: 'urubu', fly: 1, col: '#2a2433' },
  lobisomem:  { hp: 1600, spd: 40, dmg: 12, xp: 5, r: 13, spr: 'lobisomem', boss: 1, scale: 0.85, col: '#a4a4ba' },
  corposeco:  { hp: 5000, spd: 30, dmg: 24, xp: 5, r: 13, spr: 'corposeco', boss: 1, scale: 0.9, col: '#ad9c7e' },
  cuca:       { hp: 7000, spd: 32, dmg: 24, xp: 5, r: 13, spr: 'cuca', boss: 1, scale: 0.9, col: '#5f9e4a' },
  boitata:    { hp: 9000, spd: 58, dmg: 26, xp: 5, r: 8, boss: 1, snake: 1, col: '#5fd4ff' },
  boitataSeg: { hp: 1, spd: 0, dmg: 22, xp: 0, r: 6, seg: 1, col: '#5fd4ff' },
};
const BOSSES = [
  { t: 300, type: 'lobisomem', name: 'O Lobisomem' },
  { t: 450, type: 'paimato', name: 'O Pai do Mato' },
  { t: 600, type: 'mapinguari', name: 'O Mapinguari' },
  { t: 720, type: 'corposeco', name: 'O Corpo-Seco' },
  { t: 840, type: 'cuca', name: 'A Cuca' },
  { t: 960, type: 'boitata', name: 'O Boitatá' },
];

function need(l) { return 5 + Math.round(l * 3.5 + l * l * 0.05 + Math.max(0, l - 25) ** 2 * 0.3); } // níveis altos custam mais: o XP abundante do fim da noite não dispara o poder

/* status base das armas por nível */
function wbase(id, l, ev) {
  let s;
  switch (id) {
    case 'chapeu':    s = { dmg: 12 + 4 * (l - 1), cd: 1.7 - 0.08 * l, n: 1 + (l >= 4) + (l >= 7), r: 70 + 3 * l, T: 1.1, area: 1 }; if (ev) { s.n += 2; s.dmg *= 1.5; s.r *= 1.3; } break;
    case 'peixeira':  s = { dmg: 10 + 3.4 * (l - 1), cd: 0.9 - 0.035 * l, n: 2 + (l >= 4) + (l >= 7), area: 1 + 0.06 * (l - 1) }; if (ev) { s.n = 4; s.dmg *= 1.7; s.area *= 1.3; } break;
    case 'baladeira': s = { dmg: 10 + 3.2 * (l - 1), cd: 0.95 - 0.04 * l, n: 1 + Math.floor(l / 3), pierce: 1 + (l >= 5), spd: 190, area: 1 }; if (ev) { s.n += 3; s.pierce = 4; s.dmg *= 1.4; } break;
    case 'sanfona':   s = { dmg: 8 + 3.6 * (l - 1), tick: 0.45, rad: 26 + 3.5 * l, area: 1 }; if (ev) { s.rad *= 1.3; s.dmg *= 1.2; } break;
    case 'fogueira':  s = { dmg: 4 + 1.6 * (l - 1), cd: 3 - 0.15 * l, n: 1 + Math.floor(l / 3), rad: 13 + l, dur: 3, area: 1 }; if (ev) { s.rad *= 1.6; s.dur = 4.5; s.n += 2; } break;
    case 'rojao':     s = { dmg: 16 + 3.6 * (l - 1), cd: 2.6 - 0.1 * l, n: 1 + Math.floor(l / 5), rad: 26 + 1.5 * l, area: 1 }; if (ev) { s.n += 1; s.rad *= 1.25; s.dmg *= 1.15; } break;
    case 'folhetos':  s = { dmg: 10 + 3.6 * (l - 1), n: 2 + Math.floor(l / 3), rad: 34 + 2 * l, spin: 2.6 + 0.1 * l, area: 1 }; if (ev) { s.n += 2; s.dmg *= 1.8; s.spin *= 1.3; s.rad *= 1.25; } break;
    case 'aboio':     s = { dmg: 13 + 5.5 * (l - 1), cd: 6.2 - 0.3 * l, rad: 55 + 4 * l, root: 0.6 + 0.05 * l, area: 1 }; if (ev) { s.rad *= 1.35; s.root += 0.8; s.dmg *= 1.4; } break;
    case 'galo':      s = { dmg: 14 + 5.5 * (l - 1), n: 1 + Math.floor(l / 3), spd: 110 + 3 * l, tick: 0.32, area: 1 }; if (ev) { s.n += 1; s.dmg *= 1.4; s.spd *= 1.25; } break;
    case 'facao':     s = { dmg: 10 + 3.4 * (l - 1), n: 1 + Math.floor(l / 4), rad: 38 + 2 * l, spin: 4 + 0.15 * l, area: 1 }; if (ev) { s.n += 1; s.dmg *= 1.5; s.rad *= 1.2; } break;
    case 'bodoque':   s = { dmg: 14 + 4.5 * (l - 1), cd: 0.95 - 0.04 * l, n: 1 + Math.floor(l / 3), spd: 170, mud: 2.5 + 0.15 * l, area: 1 }; if (ev) { s.n += 1; s.mud *= 1.5; s.dmg *= 1.3; } break;
    case 'matraca':   s = { dmg: 20 + 6 * (l - 1), cd: 1.7 - 0.06 * l, rad: 78 + 3 * l, arc: 0.7, area: 1 }; if (ev) { s.rad *= 1.3; s.arc = 0.8; s.dmg *= 1.4; } break;
    case 'bumbo':     s = { dmg: 7 + 2 * (l - 1), cd: 2.8 - 0.1 * l, n: 1, rad: 60 + 5 * l, area: 1 }; if (ev) { s.n = 2; s.rad *= 1.4; s.dmg *= 1.4; } break;
    case 'candeeiro': s = { dmg: 14 + 2.4 * (l - 1), cd: 2.2 - 0.08 * l, n: 1 + Math.floor(l / 5), rad: 28 + 2 * l, spd: 95, area: 1 }; if (ev) { s.n += 1; s.rad *= 1.4; } break;
    case 'tarrafa':   s = { dmg: 9 + 3.2 * (l - 1), cd: 3.2 - 0.12 * l, n: 1 + Math.floor(l / 4), rad: 22 + 1.5 * l, root: 1.4 + 0.08 * l, area: 1 }; if (ev) { s.rad *= 1.5; s.root += 1.2; s.n += 1; } break;
    case 'berimbau':  s = { dmg: 7.5 + 2.3 * (l - 1), cd: 1.3 - 0.05 * l, n: 1 + Math.floor(l / 5), b: 2 + Math.floor(l / 3), area: 1 }; if (ev) { s.b += 4; s.dmg *= 1.25; } break;
    default: s = WB2[id](l, ev);
  }
  return s;
}
function wstat(id, l, ev) {
  const s = wbase(id, l, ev), P = player.st;
  s.dmg *= P.dmg * (G && G.buff > 0 ? 1.3 : 1) * (G && G.altar && G.altar.k === 'furia' ? 1.6 : 1) * (G && G.finalT > 0 ? 1.5 : 1); if (s.cd) s.cd = Math.max(0.15, s.cd * P.cd * (G && G.finalT > 0 ? 0.5 : 1));
  s.area *= P.area; if (s.rad) s.rad *= P.area;
  if (s.n && id !== 'sanfona') s.n += P.amount;
  if (G && G.syn) { if (id === 'berimbau' && G.syn.forro) s.b += 2; if (id === 'chapeu' && G.syn.vaquejada) s.n += 1; if (id === 'berimbau' && G.syn.repente) s.n += 1; if (id === 'folhetos' && G.syn.repente) s.dmg *= 1.5; if (id === 'galo' && G.syn.galofogo) s.dmg *= 1.4; }
  if (ev === 'a' && id === 'peixeira') { s.area *= 1.15; s.dmg *= 1.3; } // as 4 direções já estão no máximo
  if (ev === 'a') { s.area *= 1.3; if (s.rad) s.rad *= 1.3; if (s.r) s.r *= 1.3; if (s.n && id !== 'sanfona') s.n += 1; if (s.b) s.b += 2; s.dmg *= 0.9; }
  else if (ev === 'f') s.dmg *= 1.45;
  return s;
}
function wupDesc(id, l) {
  const a = wbase(id, l, false), b = wbase(id, l + 1, false), out = [];
  if (b.n > a.n) out.push(id === 'peixeira' ? '+1 direção de golpe' : id === 'folhetos' ? '+1 folheto' : id === 'galo' ? '+1 galo' : '+1 projétil');
  if (b.pierce > a.pierce) out.push('atravessa mais um inimigo');
  if (b.b > a.b) out.push('+1 ricochete');
  out.push(`+${Math.round(b.dmg - a.dmg)} de dano`);
  if ((b.rad || 0) > (a.rad || 0) || (b.r || 0) > (a.r || 0)) out.push('alcance maior');
  else if (b.cd && b.cd < a.cd) out.push('recarga mais rápida');
  return out.slice(0, 2).join(', ').replace(/^./, c => c.toUpperCase()) + '.';
}

