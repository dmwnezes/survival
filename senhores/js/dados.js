'use strict';
/* =========================================================
   REINADO DO SERTÃO · DLC do Visagem (estilo 9 Kings)
   dados: senhores, cartas, unidades, chefões, eventos, árvore
   ========================================================= */
const DLC_VERSION = 'v1.0';
const ANOS = 33;

// unidades de tropa (micro sprites 3-5px; hp/dmg por 10 tropas)
const UNITS = {
  vaq:    { nome: 'Vaqueiros',   hp: 30, dmg: 6, rng: 6,  spd: 18, cd: 0.9, r: ['.B.', 'bBb', '.s.', 'bbb', 'B.B'], p: { b: '#a8763e', B: '#5c3a1c', s: '#e0a878' } },
  jag:    { nome: 'Jagunços',    hp: 20, dmg: 7, rng: 40, spd: 14, cd: 1.4, r: ['.k.', 'kkk', '.s.', 'whh', 'k.k'], p: { k: '#2a2433', s: '#c9926a', w: '#d8d0bc', h: '#a4a4ba' } },
  beata:  { nome: 'Beatas',      hp: 18, dmg: 3, rng: 30, spd: 14, cd: 1.2, heal: 0.5, r: ['.w.', 'wsw', 'kkk', 'kkk', 'k.k'], p: { w: '#f0ead6', s: '#e0a878', k: '#2a2433' } },
  cang:   { nome: 'Cangaceiros', hp: 22, dmg: 8, rng: 44, spd: 16, cd: 1.3, r: ['y.y', 'bbb', '.s.', 'bbh', 'B.B'], p: { y: '#f2c14e', b: '#7a5a3a', s: '#c9926a', h: '#a4a4ba', B: '#3a2414' } },
  pesc:   { nome: 'Pescadores',  hp: 36, dmg: 5, rng: 6,  spd: 16, cd: 1.0, r: ['.y.', 'yyy', '.s.', 'uUu', 's.s'], p: { y: '#e8c870', s: '#e0a878', u: '#3b6ea5', U: '#7fb2e5' } },
  morador:{ nome: 'Moradores',   hp: 18, dmg: 4, rng: 6,  spd: 16, cd: 1.0, r: ['.y.', 'yyy', '.s.', 'www', 'u.u'], p: { y: '#d9b24a', s: '#e0a878', w: '#e8e0cc', u: '#3b6ea5' } },
  galo:   { nome: 'Galos',       hp: 12, dmg: 4, rng: 5,  spd: 30, cd: 0.6, r: ['.r.', '.ww', 'wWw', '.y.'], p: { r: '#c8463c', w: '#cfc6b0', W: '#a89e88', y: '#e8a020' } },
  saci:   { nome: 'Sacis',       hp: 16, dmg: 5, rng: 6,  spd: 30, cd: 0.7, r: ['.r.', 'rrr', '.k.', 'rkr', '.k.'], p: { r: '#d9452b', k: '#3b2414' } },
  curu:   { nome: 'Curupiras',   hp: 24, dmg: 6, rng: 6,  spd: 22, cd: 0.9, r: ['ooo', 'ogo', '.g.', 'ggg', 'g.g'], p: { o: '#e8832a', g: '#4a8a3a' } },
  alma:   { nome: 'Almas',       hp: 45, dmg: 4, rng: 6,  spd: 10, cd: 1.0, r: ['.w.', 'www', 'kwk', 'www', 'w.w'], p: { w: '#cfe0ff', k: '#2a2433' } },
  lobo:   { nome: 'Lobinhos',    hp: 34, dmg: 9, rng: 6,  spd: 26, cd: 0.8, r: ['h..h', 'hhhh', 'ehhh', '.hhh', '.h.h'], p: { h: '#8a7a6a', e: '#ffd23f' } },
  fatuo:  { nome: 'Fogos-fátuos',hp: 14, dmg: 7, rng: 36, spd: 18, cd: 1.1, burn: 0.3, r: ['.c.', 'cCc', 'cCc', '.c.'], p: { c: '#2a6cc8', C: '#5fd4ff' } },
  mula:   { nome: 'Mulas',       hp: 40, dmg: 10, rng: 7, spd: 32, cd: 1.2, charge: 0.6, r: ['oy...', 'obbbb', '.bbbb', '.b..b'], p: { o: '#e8832a', y: '#fff6a0', b: '#6b4a2e' } },
  bicho:  { nome: 'Bichos',      hp: 10, dmg: 3, rng: 5,  spd: 34, cd: 0.6, r: ['.nn.', 'nnnn', 'kn.n'], p: { n: '#a87a4a', k: '#14111f' } },
  veado:  { nome: 'Veados',      hp: 50, dmg: 8, rng: 6,  spd: 28, cd: 1.0, r: ['e..e', '.ww.', 'www.', '.www', '.w.w'], p: { e: '#e8832a', w: '#f0ead6' } },
  visagem:{ nome: 'Visagens',    hp: 30, dmg: 7, rng: 6,  spd: 16, cd: 1.0, r: ['.p.', 'ppp', 'pep', 'ppp', 'p.p'], p: { p: '#4a2f6b', e: '#ffd23f' } },
};

// lote: kind tropa|torre|eco · bênção: mod (no lote) e aura (vizinhos) · decreto: fx (plano|batalha)
const CARDS = {
  // ---------- comuns (todo senhor tem) ----------
  roca:       { nome: 'Roça de Milho', tipo: 'lote', kind: 'eco', rar: 'comum', rap: 1, aura: { grow: 0.15 }, vis: 'roca', terr: 'agua', desc: '+1 rapadura por ano. Vizinhos crescem 15% mais.' },
  poco:       { nome: 'Poço', tipo: 'lote', kind: 'eco', rar: 'comum', aura: { grow: 0.25 }, vis: 'poco', terr: 'agua', desc: 'Vizinhos crescem 25% mais por ano.' },
  vigia:      { nome: 'Torre de Vigia', tipo: 'lote', kind: 'torre', rar: 'comum', tower: { dmg: 6, cd: 1.0, rng: 74, proj: 'flecha' }, vis: 'torre', terr: 'pedra', desc: 'Atira flechas no inimigo mais perto.' },
  catavento:  { nome: 'Catavento', tipo: 'lote', kind: 'eco', rar: 'comum', rap: 2, vis: 'catavento', terr: 'pedra', desc: '+2 rapaduras por ano.' },
  taipa:      { nome: 'Casa de Taipa', tipo: 'lote', kind: 'tropa', rar: 'comum', unit: 'morador', t0: 12, grow: 3, terr: 'terra', desc: 'Moradores: baratos e numerosos.' },
  galinheiro: { nome: 'Galinheiro', tipo: 'lote', kind: 'tropa', rar: 'comum', unit: 'galo', t0: 10, grow: 4, terr: 'terra', desc: 'Galos rápidos que bicam sem parar.' },
  fitinha:    { nome: 'Fitinha do Bonfim', tipo: 'bencao', rar: 'comum', mod: { hp: 0.2, dmg: 0.2 }, ico: 'i_fitinha', desc: 'Lote: +20% vida e dano.' },
  gibao:      { nome: 'Gibão de Couro', tipo: 'bencao', rar: 'comum', mod: { hp: 0.4 }, ico: 'i_gibao', desc: 'Lote: +40% vida.' },
  feira:      { nome: 'Dia de Feira', tipo: 'decreto', rar: 'comum', when: 'plano', fx: 'rap5', ico: 'rapGrande', desc: 'Ganhe 5 rapaduras agora.' },
  forro:      { nome: 'Forró na Praça', tipo: 'decreto', rar: 'rara', when: 'plano', fx: 'forro', ico: 'i_sanfona', desc: 'Todos os lotes de tropa ganham +12% tropas.' },
  reforma:    { nome: 'Reforma', tipo: 'decreto', rar: 'lendaria', when: 'plano', tgt: 'lote', fx: 'lvlup', ico: 'i_pilao', desc: 'Sobe 1 nível de um lote.' },
  // ---------- O Coronel ----------
  vaqueiros:  { nome: 'Curral de Vaqueiros', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'coronel', unit: 'vaq', t0: 14, grow: 4, terr: 'terra', desc: 'Vaqueiros fortes no corpo a corpo.' },
  jaguncos:   { nome: 'Jagunços', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'coronel', unit: 'jag', t0: 10, grow: 3, terr: 'pedra', desc: 'Atiram de longe com espingarda.' },
  engenho:    { nome: 'Engenho', tipo: 'lote', kind: 'eco', rar: 'rara', dono: 'coronel', rap: 2, aura: { hp: 0.15 }, vis: 'engenho', terr: 'agua', desc: '+2 rapaduras. Vizinhos +15% vida.' },
  mutirao:    { nome: 'Mutirão', tipo: 'decreto', rar: 'comum', dono: 'coronel', when: 'plano', tgt: 'lote', fx: 'mutirao', ico: 'i_foice', desc: 'Um lote de tropa ganha +40% tropas.' },
  // ---------- A Rezadeira ----------
  beatas:     { nome: 'Beatas', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'rezadeira', unit: 'beata', t0: 10, grow: 3, terr: 'terra', desc: 'Rezam de longe e curam aliados.' },
  capela:     { nome: 'Capela', tipo: 'lote', kind: 'eco', rar: 'rara', dono: 'rezadeira', rap: 1, aura: { hp: 0.25 }, vis: 'capela', terr: 'pedra', desc: '+1 rapadura. Vizinhos +25% vida.' },
  aguabenta:  { nome: 'Água Benta', tipo: 'bencao', rar: 'comum', dono: 'rezadeira', mod: { hp: 0.3 }, aura: { hp: 0.1 }, ico: 'i_garrafa', desc: 'Lote +30% vida, vizinhos +10%.' },
  terco:      { nome: 'Terço', tipo: 'bencao', rar: 'rara', dono: 'rezadeira', aura: { dmg: 0.15 }, ico: 'i_terco', desc: 'Vizinhos do lote: +15% dano.' },
  // ---------- O Cangaceiro ----------
  bando:      { nome: 'Bando', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'cangaceiro', unit: 'cang', t0: 10, grow: 3, terr: 'pedra', desc: 'Cangaceiros de rifle papo-amarelo.' },
  esconderijo:{ nome: 'Esconderijo', tipo: 'lote', kind: 'eco', rar: 'rara', dono: 'cangaceiro', aura: { dmg: 0.12, rng: 0.2 }, vis: 'esconde', terr: 'pedra', desc: 'Vizinhos: +12% dano e +20% alcance.' },
  papoamarelo:{ nome: 'Papo-Amarelo', tipo: 'bencao', rar: 'rara', dono: 'cangaceiro', mod: { dmg: 0.4 }, ico: 'i_espora', desc: 'Lote: +40% dano.' },
  saque:      { nome: 'Saque', tipo: 'decreto', rar: 'comum', dono: 'cangaceiro', when: 'plano', fx: 'saque', ico: 'i_moeda', desc: 'Ganhe 8 rapaduras agora.' },
  // ---------- A Rainha Cuca ----------
  caldeirao:  { nome: 'Caldeirão', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'cuca', unit: 'curu', t0: 12, grow: 4, terr: 'mata', desc: 'Curupiras saem do caldeirão.' },
  cemiterio:  { nome: 'Cemitério', tipo: 'lote', kind: 'tropa', rar: 'rara', dono: 'cuca', unit: 'alma', t0: 8, grow: 3, terr: 'terra', desc: 'Almas lentas e muito resistentes.' },
  pocao:      { nome: 'Poção Verde', tipo: 'bencao', rar: 'comum', dono: 'cuca', mod: { slow: 0.3 }, ico: 'pocao', desc: 'Golpes do lote deixam o inimigo lento.' },
  sonopesado: { nome: 'Sono Pesado', tipo: 'decreto', rar: 'rara', dono: 'cuca', when: 'batalha', fx: 'sono', ico: 'i_rede', desc: 'Batalha: o inimigo dorme 3 segundos.' },
  // ---------- O Rei Saci ----------
  sacis:      { nome: 'Sacis', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'saci', unit: 'saci', t0: 12, grow: 4, terr: 'mata', desc: 'Rápidos e cheios de truque.' },
  redemoinho: { nome: 'Redemoinho', tipo: 'lote', kind: 'torre', rar: 'rara', dono: 'saci', tower: { dmg: 4, cd: 1.6, rng: 62, proj: 'vento', area: 18 }, vis: 'redemoinho', terr: 'terra', desc: 'Torre: vento que acerta vários.' },
  gorro:      { nome: 'Gorro Vermelho', tipo: 'bencao', rar: 'comum', dono: 'saci', mod: { spd: 0.3, dmg: 0.2 }, ico: 'chapeu', desc: 'Lote: +30% velocidade e +20% dano.' },
  traquinagem:{ nome: 'Traquinagem', tipo: 'decreto', rar: 'rara', dono: 'saci', when: 'plano', fx: 'traquinagem', ico: 'i_piao', desc: 'Rouba 2 rapaduras de cada rival vivo.' },
  // ---------- O Lobisomem ----------
  matilha:    { nome: 'Matilha', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'lobisomem', unit: 'lobo', t0: 10, grow: 3, terr: 'mata', desc: 'Lobinhos fortes e rápidos.' },
  toca:       { nome: 'Toca', tipo: 'lote', kind: 'eco', rar: 'comum', dono: 'lobisomem', aura: { hp: 0.15, dmg: 0.1 }, vis: 'toca', terr: 'mata', desc: 'Vizinhos: +15% vida e +10% dano.' },
  luacheia:   { nome: 'Lua Cheia', tipo: 'bencao', rar: 'rara', dono: 'lobisomem', mod: { dmg: 0.15, moon: 0.35 }, ico: 'estrela', desc: 'Lote +15% dano; +50% em ano de lua cheia.' },
  cacada:     { nome: 'Caçada', tipo: 'decreto', rar: 'comum', dono: 'lobisomem', when: 'batalha', fx: 'cacada', ico: 'i_espora', desc: 'Batalha: seu corpo a corpo +30% velocidade e dano.' },
  // ---------- O Boitatá ----------
  fogueira:   { nome: 'Fogueira', tipo: 'lote', kind: 'torre', rar: 'comum', dono: 'boitata', tower: { dmg: 7, cd: 1.2, rng: 66, proj: 'brasa', area: 10, burn: 0.4 }, vis: 'fogo', terr: 'pedra', desc: 'Torre: brasas que queimam em área.' },
  fatuo:      { nome: 'Fogo-Fátuo', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'boitata', unit: 'fatuo', t0: 10, grow: 3, terr: 'agua', desc: 'Chamas azuis que atiram de longe.' },
  brasa:      { nome: 'Brasa Viva', tipo: 'bencao', rar: 'comum', dono: 'boitata', mod: { burn: 0.35 }, ico: 'i_fogueira', desc: 'Golpes do lote queimam o inimigo.' },
  queimada:   { nome: 'Queimada', tipo: 'decreto', rar: 'rara', dono: 'boitata', when: 'batalha', fx: 'queimada', ico: 'i_rojao', desc: 'Batalha: fogo na entrada do inimigo.' },
  // ---------- A Mula sem cabeça ----------
  tropel:     { nome: 'Tropel', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'mula', unit: 'mula', t0: 8, grow: 3, terr: 'terra', desc: 'Mulas que atropelam na investida.' },
  encruzilhada:{ nome: 'Encruzilhada', tipo: 'lote', kind: 'eco', rar: 'comum', dono: 'mula', aura: { grow: 0.2, spd: 0.1 }, vis: 'encruz', terr: 'terra', desc: 'Vizinhos crescem 20% mais e correm 10% mais.' },
  ferradura:  { nome: 'Ferradura', tipo: 'bencao', rar: 'comum', dono: 'mula', mod: { hp: 0.3, charge: 0.3 }, ico: 'i_ferradura', desc: 'Lote +30% vida e investida mais forte.' },
  quinta:     { nome: 'Quinta-feira', tipo: 'decreto', rar: 'rara', dono: 'mula', when: 'batalha', fx: 'quinta', ico: 'chama', desc: 'Batalha: suas tropas +50% nesta luta.' },
  // ---------- A Caipora ----------
  bichos:     { nome: 'Bichos da Mata', tipo: 'lote', kind: 'tropa', rar: 'comum', dono: 'caipora', unit: 'bicho', t0: 18, grow: 5, terr: 'mata', desc: 'Um enxame de bichos rápidos.' },
  matafechada:{ nome: 'Mata Fechada', tipo: 'lote', kind: 'eco', rar: 'rara', dono: 'caipora', aura: { hp: 0.1 }, vis: 'mata', terr: 'mata', desc: 'Vira mata os lotes vazios em volta.' },
  fumo:       { nome: 'Fumo de Rolo', tipo: 'bencao', rar: 'comum', dono: 'caipora', mod: { stealth: 1, dmg: 0.1 }, ico: 'i_rape', desc: 'Lote invisível nos 4 primeiros segundos.' },
  trilha:     { nome: 'Trilha Perdida', tipo: 'decreto', rar: 'comum', dono: 'caipora', when: 'batalha', fx: 'trilha', ico: 'folha', desc: 'Batalha: inimigo 35% mais lento por 8s.' },
  // ---------- Anhangá (secreto) ----------
  veado:      { nome: 'Veado Branco', tipo: 'lote', kind: 'tropa', rar: 'lendaria', dono: 'anhanga', unit: 'veado', t0: 9, grow: 3, terr: 'mata', desc: 'Veados encantados, fortes e rápidos.' },
  assombracao:{ nome: 'Assombração', tipo: 'lote', kind: 'torre', rar: 'lendaria', dono: 'anhanga', tower: { dmg: 9, cd: 1.4, rng: 76, proj: 'assombro', fear: 1 }, vis: 'assombro', terr: 'mata', desc: 'Torre: o alvo fica com medo.' },
  olhofogo:   { nome: 'Olho de Fogo', tipo: 'bencao', rar: 'lendaria', dono: 'anhanga', mod: { dmg: 0.5, hp: 0.2 }, ico: 'i_olhogordo', desc: 'Lote: +50% dano e +20% vida.' },
  visao:      { nome: 'Visão', tipo: 'decreto', rar: 'lendaria', dono: 'anhanga', when: 'plano', fx: 'visao', ico: 'i_espelho', desc: 'Compre 3 cartas a mais agora.' },
};
for (const k in CARDS) CARDS[k].id = k;
const COMMON = ['roca', 'poco', 'vigia', 'catavento', 'taipa', 'galinheiro', 'fitinha', 'gibao', 'feira', 'forro', 'reforma'];

const LORDS = {
  coronel:   { nome: 'O Coronel', spr: 'coronel', cor: '#f2c14e', tema: 'coronel', cartas: ['vaqueiros', 'jaguncos', 'engenho', 'mutirao'],
    passivo: 'Lotes de renda dão +1 rapadura.', poder: { nome: 'Ordem do Coronel', txt: 'Suas tropas +40% dano por 8s.', fx: 'ordem' },
    fala: ['Essa terra é minha desde o tempo do meu avô.', 'Oito senhores querem o sertão.', 'Que venham. A Casa-grande não cai.'] },
  rezadeira: { nome: 'A Rezadeira', spr: 'rezadeira', cor: '#9fe07a', tema: 'rezadeira', cartas: ['beatas', 'capela', 'aguabenta', 'terco'],
    passivo: 'Bênçãos valem o dobro.', poder: { nome: 'Reza Forte', txt: 'Cura metade da vida de todas as suas tropas.', fx: 'reza' },
    fala: ['Com ramo de arruda eu tiro qualquer quebranto.', 'Mas tem senhor nessa terra que só reza não resolve.'] },
  cangaceiro:{ nome: 'O Cangaceiro', spr: 'cangaceiro', cor: '#d8b060', tema: 'cangaceiro', cartas: ['bando', 'esconderijo', 'papoamarelo', 'saque'],
    passivo: 'Tropas de longe +25% dano.', poder: { nome: 'Emboscada', txt: 'Um bando aparece atrás do inimigo.', fx: 'emboscada' },
    fala: ['Mulher rendeira, olê mulher renda...', 'O bando tá pronto. O sertão vai ser nosso.'] },
  cuca:      { nome: 'A Rainha Cuca', spr: 'cuca', cor: '#9fe07a', tema: 'cuca', cartas: ['caldeirao', 'cemiterio', 'pocao', 'sonopesado'],
    passivo: 'Inimigos ficam 20% mais lentos.', poder: { nome: 'Sono Pesado', txt: 'O inimigo dorme 4 segundos.', fx: 'sono' },
    fala: ['Dorme, nenê, que a Cuca vem pegar...', 'Meu caldeirão já está fervendo.'] },
  saci:      { nome: 'O Rei Saci', spr: 'saci', cor: '#d9452b', tema: 'saci', cartas: ['sacis', 'redemoinho', 'gorro', 'traquinagem'],
    passivo: 'Suas tropas correm 30% mais.', poder: { nome: 'Redemoinho', txt: 'Empurra e machuca os inimigos.', fx: 'redemoinho' },
    fala: ['Hihihi! Quem roubou seu cachimbo?', 'Num pulo só eu tomo o seu sertão.'] },
  lobisomem: { nome: 'O Lobisomem', spr: 'lobisomem', cor: '#a4a4ba', tema: 'lobisomem', cartas: ['matilha', 'toca', 'luacheia', 'cacada'],
    passivo: 'Ano de lua cheia (a cada 4): tropas +50%.', poder: { nome: 'Uivo', txt: 'O inimigo para de atacar por 3s.', fx: 'uivo' },
    fala: ['Sétimo filho homem... a sina caiu em mim.', 'Quando a lua enche, ninguém me segura.'] },
  boitata:   { nome: 'O Boitatá', spr: 'boitataHead', cor: '#5fd4ff', tema: 'boitataHead', cartas: ['fogueira', 'fatuo', 'brasa', 'queimada'],
    passivo: 'Torres +30% dano.', poder: { nome: 'Rastro de Fogo', txt: 'Uma faixa de fogo corta o campo.', fx: 'rastro' },
    fala: ['Quem bota fogo na mata me acorda.', 'E eu acordei com fome.'] },
  mula:      { nome: 'A Mula sem cabeça', spr: 'mula', cor: '#e8832a', tema: 'mula', cartas: ['tropel', 'encruzilhada', 'ferradura', 'quinta'],
    passivo: 'Primeiro golpe de cada tropa +40% dano.', poder: { nome: 'Galope', txt: 'Suas tropas +80% velocidade e nova investida.', fx: 'galope' },
    fala: ['Toda quinta pra sexta eu galopo.', 'Ferradura no chão é aviso: saia da frente.'] },
  caipora:   { nome: 'A Caipora', spr: 'caipora', cor: '#86d46f', tema: 'caipora', cartas: ['bichos', 'matafechada', 'fumo', 'trilha'],
    passivo: 'Lotes na mata +50%.', poder: { nome: 'Bichos da Mata', txt: 'Um bando de bichos sai da mata.', fx: 'bichos' },
    fala: ['Quem caça sem pedir licença se perde na mata.', 'Os bichos lutam comigo.'] },
  anhanga:   { nome: 'Anhangá', spr: 'anhanga', cor: '#f0ead6', tema: 'anhanga', secreto: 1, cartas: ['veado', 'assombracao', 'olhofogo', 'visao'],
    passivo: 'Inimigos que caem às vezes viram seus aliados.', poder: { nome: 'Assombro', txt: 'O inimigo perde 35% do dano por 10s.', fx: 'assombro' },
    fala: ['Eu sou o protetor da caça.', 'Vocês brigaram tanto pelo sertão...', 'agora ele é meu.'] },
};
const LORD_ORDER = ['coronel', 'rezadeira', 'cangaceiro', 'cuca', 'saci', 'lobisomem', 'boitata', 'mula', 'caipora', 'anhanga'];

const CHEFES = {
  11: { id: 'mapinguari', nome: 'O Mapinguari', spr: 'mapinguari', hp: 1100, dmg: 22, fala: 'Um rugido sacode a mata. O Mapinguari desceu da serra!' },
  22: { id: 'corposeco', nome: 'O Corpo-Seco', spr: 'corposeco', hp: 3800, dmg: 40, fala: 'A terra rejeitou o Corpo-Seco. Ele quer a sua!' },
  33: { id: 'paimato', nome: 'O Pai do Mato', spr: 'paimato', hp: 9500, dmg: 70, fala: 'O Pai do Mato veio cobrar o sertão inteiro!' },
};

const EVENTS = [
  { id: 'chuvaboa', nome: 'Chuva Boa', txt: 'Todas as tropas crescem 25% mais este ano.' },
  { id: 'saojoao', nome: 'São João', txt: 'Fogueira e forró: +6 rapaduras.' },
  { id: 'gafanhoto', nome: 'Praga de Gafanhoto', txt: 'Lotes de renda não rendem este ano.' },
  { id: 'romaria', nome: 'Romaria', txt: 'Os romeiros consertam a Casa-grande: +15 de vida.' },
  { id: 'vaquejada', nome: 'Vaquejada', txt: 'Vaqueiros e mulas: +20% tropas.' },
  { id: 'eclipse', nome: 'Eclipse', txt: 'Na escuridão, todas as torres -30% este ano.' },
];

// árvore permanente (glória ganha a cada partida)
const TREE = [
  { id: 'casa1', nome: 'Casa Forte I', txt: '+15% vida da Casa-grande', custo: 10 },
  { id: 'rap1', nome: 'Rapadura Guardada I', txt: 'Começa com +2 rapaduras', custo: 10 },
  { id: 'grow1', nome: 'Colheita I', txt: 'Tropas crescem +10%', custo: 15 },
  { id: 'casa2', nome: 'Casa Forte II', txt: '+15% vida da Casa-grande', custo: 20, req: 'casa1' },
  { id: 'arsenal', nome: 'Arsenal', txt: 'Torres +15% dano', custo: 20, req: 'grow1' },
  { id: 'rap2', nome: 'Rapadura Guardada II', txt: 'Começa com +2 rapaduras', custo: 20, req: 'rap1' },
  { id: 'troca', nome: 'Mão Cheia', txt: '+1 troca grátis por ano', custo: 35, req: 'rap2' },
  { id: 'grow2', nome: 'Colheita II', txt: 'Tropas crescem +10%', custo: 30, req: 'grow1' },
  { id: 'primeiro', nome: 'Primeiro Ano', txt: 'Começa com um lote de tropa já posto', custo: 30, req: 'casa2' },
  { id: 'casa3', nome: 'Casa Forte III', txt: '+15% vida da Casa-grande', custo: 40, req: 'casa2' },
  { id: 'fe', nome: 'Fé', txt: 'Poder do senhor volta 1 ano antes', custo: 50, req: 'arsenal' },
  { id: 'bolso', nome: 'Bolso Fundo', txt: '+1 espaço de reserva', custo: 60, req: 'troca' },
];

const RARW = { comum: 1, rara: 0.55, lendaria: 0.22 };
const RARN = { comum: 'Comum', rara: 'Rara', lendaria: 'Lendária' };
const TIPON = { lote: 'LOTE', bencao: 'BÊNÇÃO', decreto: 'DECRETO' };
const TERRN = { terra: 'Terra', agua: 'Água', pedra: 'Pedra', mata: 'Mata' };
const fmt = n => Math.round(n).toLocaleString('pt-BR');
