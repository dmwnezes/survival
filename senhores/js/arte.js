'use strict';
/* arte do Reinado do Sertão: pixel art isométrica no estilo do Visagem (427x240, contorno escuro) */
const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
const vnoise = (x, y, cell, s) => { const X = x / cell, Y = y / cell, i = Math.floor(X), j = Math.floor(Y), fx = X - i, fy = Y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); const a = hash(i, j, s), b = hash(i + 1, j, s), c = hash(i, j + 1, s), d = hash(i + 1, j + 1, s); return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy; };
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const rgb = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return rgb(A.map((v, i) => v + (B[i] - v) * t)); };
const sh = (a, f) => f < 0 ? mix(a, '#000000', -f) : mix(a, '#ffffff', f);
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const ramp = (cols, t, x, y) => { const p = Math.max(0, Math.min(0.9999, t)) * (cols.length - 1), b = Math.floor(p); return (p - b) > (BAYER[y & 3][x & 3] + 0.5) / 16 ? cols[b + 1] : cols[b]; };

function Cv(w, h) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
  const P = { c, g, w, h };
  P.px = (x, y, col) => { if (!col) return; g.fillStyle = col; g.fillRect(Math.floor(x), Math.floor(y), 1, 1); };
  P.rect = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.floor(x), Math.floor(y), w, h); };
  P.poly = (pts, fn) => {
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [p, q] of pts) { x0 = Math.min(x0, p); x1 = Math.max(x1, p); y0 = Math.min(y0, q); y1 = Math.max(y1, q); }
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      const X = x + 0.5, Y = y + 0.5; let ins = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > Y) !== (yj > Y) && X < (xj - xi) * (Y - yi) / (yj - yi) + xi) ins = !ins; }
      if (ins) P.px(x, y, typeof fn === 'function' ? fn(x, y) : fn);
    }
  };
  P.line = (x0, y0, x1, y1, col) => { x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy; for (;;) { P.px(x0, y0, typeof col === 'function' ? col(x0, y0) : col); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } } };
  P.img = (im, x, y, flip) => { if (flip) { g.save(); g.translate(Math.round(x) + im.width, Math.round(y)); g.scale(-1, 1); g.drawImage(im, 0, 0); g.restore(); } else g.drawImage(im, Math.round(x), Math.round(y)); };
  P.alpha = (x, y, col, a) => { g.fillStyle = col; g.globalAlpha = a; g.fillRect(Math.floor(x), Math.floor(y), 1, 1); g.globalAlpha = 1; };
  P.glow = (x, y, r, col, a, sq) => { g.save(); g.globalCompositeOperation = 'lighter'; const [R, G, B] = hex(col); for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) { const d = Math.sqrt(xx * xx + yy * yy * (sq || 2.2)) / r; if (d < 1) { const k = Math.round((1 - d) * (1 - d) * a * 8) / 8; if (k > 0) { g.fillStyle = `rgba(${R},${G},${B},${k})`; g.fillRect(Math.floor(x + xx), Math.floor(y + yy), 1, 1); } } } g.restore(); };
  P.shadow = (x, y, rx, ry, a) => { g.fillStyle = `rgba(8,6,18,${a})`; for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) if ((xx * xx) / (rx * rx) + (yy * yy) / (ry * ry) <= 1) g.fillRect(Math.floor(x + xx), Math.floor(y + yy), 1, 1); };
  P.url = () => c.toDataURL('image/png');
  return P;
}

// game sprites, same pipeline as the base game (mk + scale2x + outline)
const gsp = (key, o = {}) => { const pal = Object.assign({}, PAL, SPAL[key] || {}, o.pal || {}); let n = mk(o.rows || SD[key], pal); if (o.x2) n = scale2x(n); if (o.out !== false) n = outline(n); return n; };
const fromRows = (rows, pal, o = {}) => { let n = mk(rows, Object.assign({}, PAL, pal)); if (o.x2) n = scale2x(n); if (o.out !== false) n = outline(n); return n; };
// stamp a sprite with its bottom-centre at (x, y)
const stand = (P, im, x, y, flip) => P.img(im, x - Math.floor(im.width / 2), y - im.height + 1, flip);

/* ---------- iso building kit (drawn on its own canvas, then outlined like game sprites) ---------- */
const isoM = (cx, cy) => (u, v, z = 0) => [cx + u - v, cy + (u + v) / 2 - z];
function box(P, cx, cy, U, V, h, o, z0 = 0) {
  const m = isoM(cx, cy);
  if (o.top) P.poly([m(-U, -V, z0 + h), m(U, -V, z0 + h), m(U, V, z0 + h), m(-U, V, z0 + h)], o.top);
  P.poly([m(-U, V, z0), m(U, V, z0), m(U, V, z0 + h), m(-U, V, z0 + h)], (x, y) => { const u = x + 0.5 - cx + V, z = cy + (u + V) / 2 - (y + 0.5) - z0; return o.left(u, z, x, y); });
  P.poly([m(U, V, z0), m(U, -V, z0), m(U, -V, z0 + h), m(U, V, z0 + h)], (x, y) => { const v = cx + U - (x + 0.5), z = cy + (U + v) / 2 - (y + 0.5) - z0; return o.right(v, z, x, y); });
}
function gable(P, cx, cy, U, V, h, rh, ov, col, wallR) {
  const m = isoM(cx, cy), k = 1 + (rh + 1) / (V + ov);
  const slope = (x, y, back) => { const v = (y + 0.5 - cy - (x + 0.5 - cx) / 2 + h + rh) / (back ? (1 - (rh + 1) / (V + ov)) : k); const u = x + 0.5 - cx + v; const row = Math.floor(Math.abs(v) / 1.6); let c = back ? sh(col, -0.32) : col; if (row % 2) c = sh(c, -0.12); if ((Math.floor(u) + row * 2) % 5 === 0) c = sh(c, -0.2); if (Math.abs(v) < 0.8) c = sh(col, 0.18); return c; };
  P.poly([m(-U - ov, 0, h + rh), m(U + ov, 0, h + rh), m(U + ov, -V - ov, h - 1), m(-U - ov, -V - ov, h - 1)], (x, y) => slope(x, y, true));
  P.poly([m(U, -V, h), m(U, V, h), m(U, 0, h + rh)], (x, y) => ((x + y) % 7 === 0 ? sh(wallR, -0.1) : wallR));
  P.poly([m(-U - ov, 0, h + rh), m(U + ov, 0, h + rh), m(U + ov, V + ov, h - 1), m(-U - ov, V + ov, h - 1)], (x, y) => slope(x, y, false));
  // eave shadow line
  for (let u = -U - ov; u < U + ov; u++) { const [x, y] = m(u, V + ov, h - 1); P.px(x, y, sh(col, -0.45)); }
}
function pyramid(P, cx, cy, U, V, h, rh, ov, col) {
  const m = isoM(cx, cy), ap = m(0, 0, h + rh);
  const tex = (c) => (x, y) => (y % 2 ? sh(c, -0.1) : ((x + y) % 4 === 0 ? sh(c, 0.08) : c));
  P.poly([m(-U - ov, V + ov, h - 1), m(U + ov, V + ov, h - 1), ap], tex(col));
  P.poly([m(U + ov, V + ov, h - 1), m(U + ov, -V - ov, h - 1), ap], tex(sh(col, -0.25)));
}
const bld = (w, h, cx, cy, draw) => { const P = Cv(w, h); draw(P, cx, cy); return { im: outline(P.c), cx: cx + 1, cy: cy + 1 }; };
const placeB = (P, b, x, y) => P.img(b.im, x - b.cx, y - b.cy);

const WALL = '#e6dfcd', WALLR = '#b6ab95', STONE = '#8a857a', ROOF = '#b5523a';
const lime = (base) => (u, z, x, y) => { let c = base; if (z < 1.6) c = '#7d776a'; else if (z < 3 && hash(x, y, 9) < 0.35) c = sh(base, -0.12); else if (hash(x, y, 4) < 0.06) c = sh(base, -0.08); return c; };

const BLD = {};
BLD.casa = bld(70, 60, 35, 44, (P, cx, cy) => {
  const U = 13, V = 8, h = 11, wins = [-9, -4.5, 4.5, 9];
  box(P, cx, cy, U, V, h, {
    left: (u, z, x, y) => { const base = lime(WALL)(u, z, x, y); if (Math.abs(u) < 1.6 && z < 7.5) return z > 6.5 ? '#3b2414' : (Math.abs(u) < 0.6 ? '#3b2414' : '#6b4a2e'); for (const w of wins) { const d = Math.abs(u - w); if (z > 4 && z < 8.5) { if (d < 1.1) return z > 7.5 ? '#3b2414' : (z < 6 ? '#f2c14e' : '#fff6a0'); if (d < 2.2) return '#3b6ea5'; } } if (z > h - 1.2) return sh(WALL, -0.15); return base; },
    right: (v, z, x, y) => { const base = lime(WALLR)(v, z, x, y); for (const w of [-4, 3]) { const d = Math.abs(v - w); if (z > 4 && z < 8.5) { if (d < 1.1) return z < 6 ? '#d99a2e' : '#f2c14e'; if (d < 2.1) return '#2c4f78'; } } if (z > h - 1.2) return sh(WALLR, -0.15); return base; },
  });
  // veranda posts on the long front face
  const m = isoM(cx, cy);
  for (const u of [-11, -6, 6, 11]) { const [x, y] = m(u, V + 2, 0); for (let z = 0; z < 8; z++) P.px(x, y - z, z > 6 ? '#3b2414' : '#e6dfcd'); P.px(x + 1, y, '#5e5a52'); }
  box(P, cx, cy, 2, 2, 5, { top: '#7a3a2a', left: () => '#a8432f', right: () => '#7a2e22' }, h + 4);
  gable(P, cx, cy, U, V, h, 7, 2, ROOF, WALLR);
  box(P, cx + 7, cy - 6, 1.5, 1.5, 6, { top: '#5e5a52', left: () => '#a8a294', right: () => '#7d776a' }, h + 3);
});
BLD.capela = bld(56, 70, 26, 56, (P, cx, cy) => {
  box(P, cx - 4, cy - 2, 9, 5, 9, { left: (u, z, x, y) => (z > 4 && z < 7 && Math.abs(((u + 9) % 6) - 3) < 1 ? '#5fa8d8' : lime(WALL)(u, z, x, y)), right: (v, z, x, y) => lime(WALLR)(v, z, x, y) });
  gable(P, cx - 4, cy - 2, 9, 5, 9, 5, 1, '#9a4632', WALLR);
  box(P, cx + 7, cy + 4, 3.5, 3.5, 21, { top: '#c9bfa8', left: (u, z, x, y) => (z > 15 && z < 18.5 && Math.abs(u) < 1 ? '#2a2433' : (z < 6 && Math.abs(u) < 1.4 ? '#5c3a1c' : lime(WALL)(u, z, x, y))), right: (v, z, x, y) => (z > 15 && z < 18.5 && Math.abs(v) < 1 ? '#2a2433' : lime(WALLR)(v, z, x, y)) });
  pyramid(P, cx + 7, cy + 4, 3.5, 3.5, 21, 6, 1, '#9a4632');
  const [x, y] = isoM(cx + 7, cy + 4)(0, 0, 27); P.line(x, y - 1, x, y - 6, '#f2c14e'); P.line(x - 2, y - 4, x + 2, y - 4, '#f2c14e');
});
const stoneTex = (base) => (u, z, x, y) => { const row = Math.floor(z / 2.5), off = row % 2 ? 2 : 0; if (z % 2.5 < 0.9 || (Math.floor(u + 20 + off) % 4 === 0)) return sh(base, -0.35); return hash(Math.floor((u + off) / 4), row, 3) < 0.4 ? sh(base, 0.12) : base; };
BLD.fogo = bld(40, 50, 20, 40, (P, cx, cy) => {
  const lt = stoneTex('#9a958a'), rt = stoneTex('#6e6a60');
  box(P, cx, cy, 5, 5, 12, { top: '#4a4038', left: (u, z, x, y) => lt(u, z, x, y), right: (v, z, x, y) => rt(v, z, x, y) });
  box(P, cx, cy, 5, 5, 2.5, { left: (u, z, x, y) => (Math.floor(u + 5) % 3 === 0 ? null : lt(u, z + 12, x, y)), right: (v, z, x, y) => (Math.floor(v + 5) % 3 === 0 ? null : rt(v, z + 12, x, y)) }, 12);
});
const flame = (P, x, y, big) => { const rows = big ? ['....e.....', '...eoe....', '..eoyoe.e.', '..oyYyoeo.', '.eoyYYyoe.', '.oyYYYYyo.', '..oyYYyo..', '...oooo...'] : ['..e...', '.eoe..', '.oyoe.', 'eyYyo.', '.oYyo.', '..oo..']; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = { e: '#ff4a3d', o: '#e8832a', y: '#f2c14e', Y: '#fff6a0' }[r[i]]; if (c) P.px(x - Math.floor(r.length / 2) + i, y - rows.length + j, c); } }); };
BLD.torre = bld(44, 60, 22, 50, (P, cx, cy) => {
  const m = isoM(cx, cy), wood = '#8a5a2b', dark = '#5c3a1c';
  const post = (u, v, c) => { const [x, y] = m(u, v, 0); P.line(x, y, x, y - 18, c); };
  post(-4, -4, dark); post(4, -4, dark);
  const [ax, ay] = m(-4, 4, 0), [bx, by] = m(4, 4, 0), [rx, ry] = m(4, -4, 0);
  P.line(ax, ay - 2, bx, by - 14, dark); P.line(ax, ay - 14, bx, by - 2, dark); P.line(bx, by - 2, rx, ry - 14, '#3b2414'); P.line(bx, by - 14, rx, ry - 2, '#3b2414');
  post(-4, 4, wood); post(4, 4, wood);
  box(P, cx, cy, 5, 5, 2, { top: '#a8763e', left: () => wood, right: () => dark }, 17);
  box(P, cx, cy, 5, 5, 3, { left: (u, z) => (Math.floor(u + 5) % 2 ? '#a8763e' : wood), right: (v, z) => (Math.floor(v + 5) % 2 ? '#6b4a2e' : dark) }, 19);
  pyramid(P, cx, cy, 5, 5, 26, 6, 1.5, '#c9a24a');
});
BLD.catavento = bld(50, 70, 22, 62, (P, cx, cy) => {
  const m = isoM(cx, cy), iron = '#7d7a86', dk = '#4a4858';
  const legs = [[-4, -4], [4, -4], [-4, 4], [4, 4]].map(([u, v]) => [m(u, v, 0), m(u * 0.25, v * 0.25, 30)]);
  for (const [[x0, y0], [x1, y1]] of legs) P.line(x0, y0, x1, y1, y0 > cy ? iron : dk);
  for (let z = 4; z < 28; z += 5) { const s = 1 - z / 40; const a = m(-4 * s, 4 * s, z), b = m(4 * s, 4 * s, z), c = m(4 * s, -4 * s, z); P.line(a[0], a[1], b[0], b[1], iron); P.line(b[0], b[1], c[0], c[1], dk); }
  const [hx, hy] = m(0, 0, 32);
  for (let k = 0; k < 12; k++) { const t = k / 12 * Math.PI * 2; P.line(hx, hy, hx + Math.cos(t) * 8, hy + Math.sin(t) * 8, k % 2 ? '#c9c9d6' : '#a4a4ba'); }
  P.line(hx, hy, hx + 9, hy + 2, dk); P.poly([[hx + 8, hy - 2], [hx + 13, hy], [hx + 8, hy + 5]], '#c8463c');
  P.px(hx, hy, '#2a2433');
  box(P, cx + 12, cy + 2, 3, 3, 5, { top: '#5fa8d8', left: (u, z) => (z > 3.5 ? '#9a958a' : '#7d776a'), right: () => '#5e5a52' });
});
BLD.poco = bld(30, 30, 15, 22, (P, cx, cy) => {
  for (let z = 0; z < 4; z++) for (let a = 0; a < 64; a++) { const t = a / 64 * Math.PI * 2, x = cx + Math.cos(t) * 6, y = cy + Math.sin(t) * 3 - z; P.px(x, y, z === 3 ? '#b0aa9c' : (Math.sin(t) > 0 ? (a % 5 ? '#8a857a' : '#5e5a52') : '#6e6a60')); }
  for (let yy = -2; yy <= 2; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx / 16 + yy * yy / 4 <= 1) P.px(cx + xx, cy - 3 + yy, yy < 0 ? '#1a2242' : '#2c4566');
  P.line(cx - 6, cy - 3, cx - 6, cy - 13, '#6b4a2e'); P.line(cx + 6, cy - 3, cx + 6, cy - 13, '#6b4a2e'); P.line(cx - 7, cy - 13, cx + 7, cy - 13, '#8a5a2b'); P.line(cx, cy - 12, cx, cy - 8, '#c9c9d6'); P.rect(cx - 1, cy - 8, 3, 2, '#8a5a2b');
});
BLD.taipa = bld(46, 44, 23, 32, (P, cx, cy) => {
  const tex = (base) => (u, z, x, y) => (z < 1.2 ? '#6b4a2e' : (Math.floor(x + y * 0.5) % 4 === 0 ? sh(base, -0.15) : (hash(x, y, 2) < 0.12 ? sh(base, 0.1) : base)));
  box(P, cx, cy, 8, 5, 7, { left: (u, z, x, y) => (Math.abs(u - 2) < 1.4 && z < 5.5 ? '#3b2414' : (Math.abs(u + 4) < 1.2 && z > 3 && z < 5.5 ? '#2a2433' : tex('#b07a52')(u, z, x, y))), right: tex('#8a5a3e') });
  gable(P, cx, cy, 8, 5, 7, 5, 2, '#c9a24a', '#8a5a3e');
});
BLD.cuca = bld(40, 66, 20, 58, (P, cx, cy) => {
  const lt = stoneTex('#5a4070'), rt = stoneTex('#3a2a4a');
  box(P, cx, cy, 5, 5, 30, { top: '#2a1c34', left: (u, z, x, y) => (z > 22 && z < 25 && Math.abs(u) < 1 ? '#9fe07a' : (z > 12 && z < 15 && Math.abs(u - 2) < 0.8 ? '#9fe07a' : lt(u, z, x, y))), right: (v, z, x, y) => (z > 22 && z < 25 && Math.abs(v) < 1 ? '#5f9e4a' : rt(v, z, x, y)) });
  box(P, cx, cy, 5, 5, 3, { left: (u, z, x, y) => (Math.floor(u + 5) % 3 === 0 ? null : lt(u, z, x, y)), right: (v, z, x, y) => (Math.floor(v + 5) % 3 === 0 ? null : rt(v, z, x, y)) }, 30);
  const [x, y] = isoM(cx, cy)(0, 0, 36); for (let yy = -3; yy <= 3; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy <= 9) P.px(x + xx, y + yy, xx * xx + yy * yy <= 2 ? '#e8ffd0' : '#9fe07a');
});

/* ---------- construções extras ---------- */
BLD.engenho = bld(50, 50, 25, 38, (P, cx, cy) => {
  const tex = (base) => (u, z, x, y) => (z < 1.2 ? '#6b4a2e' : (hash(x, y, 2) < 0.1 ? sh(base, 0.1) : base));
  box(P, cx - 2, cy, 9, 6, 8, { left: (u, z, x, y) => (Math.abs(u + 2) < 1.5 && z < 6 ? '#3b2414' : tex('#c9bfa8')(u, z, x, y)), right: tex('#9a907a') });
  gable(P, cx - 2, cy, 9, 6, 8, 5, 1, '#7a3a2a', '#9a907a');
  box(P, cx + 9, cy - 4, 1.5, 1.5, 22, { top: '#3a2a2a', left: stoneTex('#a8432f'), right: stoneTex('#7a2e22') });
  for (let k = 0; k < 6; k++) P.px(cx + 9 + k % 2, cy - 30 - k * 2, k < 2 ? '#9a958a' : '#6e6a60');
});
BLD.toca = bld(40, 30, 20, 22, (P, cx, cy) => {
  for (let yy = -9; yy <= 2; yy++) for (let xx = -14; xx <= 14; xx++) { const d = xx * xx / 196 + (yy + 3) * (yy + 3) / 40; if (d < 1) P.px(cx + xx, cy + yy, d > 0.75 ? '#5e5a52' : hash(xx, yy, 3) < 0.3 ? '#9a958a' : '#7d776a'); }
  for (let yy = -4; yy <= 1; yy++) for (let xx = -4; xx <= 4; xx++) if (xx * xx / 16 + yy * yy / 9 < 1) P.px(cx + xx, cy + yy, '#14111f');
  P.px(cx - 1, cy - 1, '#ffd23f'); P.px(cx + 1, cy - 1, '#ffd23f');
});
BLD.esconde = bld(44, 34, 22, 24, (P, cx, cy) => {
  for (const [ox, oy, r] of [[-8, 0, 7], [6, -2, 9], [0, 3, 5]]) for (let yy = -r; yy <= r / 2; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy * 2 < r * r) P.px(cx + ox + xx, cy + oy + yy, yy < -r / 2 ? '#a8a294' : hash(xx, yy, ox) < 0.25 ? '#6e6a60' : '#8a857a');
  for (const [ox, oy] of [[-14, 2], [13, 3], [2, -8]]) for (let yy = -3; yy <= 1; yy++) for (let xx = -3; xx <= 3; xx++) if (xx * xx + yy * yy * 2 < 9) P.px(cx + ox + xx, cy + oy + yy, hash(xx, yy, 7) < 0.4 ? '#4a7a3a' : '#3d6b33');
  P.line(cx - 2, cy - 2, cx + 3, cy - 12, '#5c3a1c'); P.rect(cx + 3, cy - 13, 5, 3, '#f2c14e'); P.px(cx + 4, cy - 12, '#c8463c');
});
BLD.encruz = bld(48, 48, 24, 34, (P, cx, cy) => {
  for (let t = -18; t <= 18; t++) for (let w = -2; w <= 2; w++) { P.px(cx + t, cy + t / 2 + w * 0.5, hash(t, w, 1) < 0.5 ? '#7a6446' : '#6b5a3e'); P.px(cx + t, cy - t / 2 + w * 0.5, hash(t, w, 2) < 0.5 ? '#7a6446' : '#6b5a3e'); }
  P.img(gsp('cruzeiro'), cx - 5, cy - 18);
});
BLD.mata = bld(50, 50, 25, 38, (P, cx, cy) => { for (const [ox, oy, k] of [[-10, -2, 'arvore'], [10, -1, 'juazeiro'], [0, 4, 'mandacaru'], [-4, -7, 'juazeiro']].sort((a, b) => a[1] - b[1])) { const im = gsp(k); P.img(im, cx + ox - Math.floor(im.width / 2), cy + oy - im.height + 2); } });
BLD.redemoinho = bld(40, 56, 20, 46, (P, cx, cy) => {
  box(P, cx, cy, 4, 4, 4, { top: '#7a6446', left: stoneTex('#9a958a'), right: stoneTex('#6e6a60') });
  for (let k = 0; k < 90; k++) { const t = k / 90, a = t * 26, r = 2 + t * 9; P.px(cx + Math.cos(a) * r, cy - 6 - t * 30 + Math.sin(a) * r * 0.3, k % 3 ? '#c9a878' : '#e8d9b8'); }
  P.rect(cx - 1, cy - 38, 3, 3, '#d9452b');
});
BLD.assombro = bld(40, 66, 20, 58, (P, cx, cy) => {
  const lt = stoneTex('#3a3450'), rt = stoneTex('#26223a');
  box(P, cx, cy, 4, 4, 26, { top: '#1a1828', left: (u, z, x, y) => (z > 18 && z < 21 && Math.abs(u) < 1 ? '#e8832a' : lt(u, z, x, y)), right: (v, z, x, y) => (z > 18 && z < 21 && Math.abs(v) < 1 ? '#a85a20' : rt(v, z, x, y)) });
  pyramid(P, cx, cy, 4, 4, 26, 8, 1, '#2a2433');
  const [x, y] = isoM(cx, cy)(0, 0, 36); P.px(x - 1, y, '#ff4a3d'); P.px(x + 1, y, '#ff4a3d');
});
const VIS = { casa: 'casa', capela: 'capela', fogo: 'fogo', torre: 'torre', catavento: 'catavento', poco: 'poco', engenho: 'engenho', toca: 'toca', esconde: 'esconde', encruz: 'encruz', mata: 'mata', redemoinho: 'redemoinho', assombro: 'assombro' };

/* ---------- tela ---------- */
let VW = 427, VH = 240, OX = 0, OY = 0;
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
function resizeView() {
  const a = innerWidth / innerHeight;
  if (a >= 427 / 240) { VH = 240; VW = Math.round(240 * a); } else { VW = 427; VH = Math.round(427 / a); }
  cv.width = VW; cv.height = VH; ctx.imageSmoothingEnabled = false; OX = Math.floor((VW - 427) / 2); OY = Math.floor((VH - 240) / 2); BGC = {}; LAYERC = {};
}
const toLayout = (cx, cy) => [cx / innerWidth * VW - OX, cy / innerHeight * VH - OY];

/* ---------- fundo (chão, açude, cerca, mata) ---------- */
let BGC = {};
const WALLX = 196, WALLY = 6;
const wallY = x => WALLY + Math.abs(x - WALLX) * 0.5;
const lakeF = (x, y) => { const dx = (x - 30) / 96, dy = (y - 222) / 40; return dx * dx + dy * dy - 1 + (vnoise(x, y, 14, 8) - 0.5) * 0.5; };
function makeBG(season) {
  const key = season + VW + 'x' + VH; if (BGC[key]) return BGC[key];
  const P = Cv(VW, VH), g = P.g, rnd = mulberry(7), seca = season === 'seca';
  const img = g.createImageData(VW, VH), d = img.data;
  const grass = seca ? ['#3e3f2a', '#45452d', '#4d4c31', '#555334', '#5d5a38', '#66613c'] : ['#343f2a', '#3a462d', '#414d31', '#485435', '#4f5b39', '#57623d'];
  const dry = ['#4a4632', '#524d36', '#5a543a', '#635b3e', '#6b6242', '#746a47'];
  for (let y = 0; y < VH; y++) for (let x = 0; x < VW; x++) {
    const v = vnoise(x, y, 26, 1) * 0.55 + vnoise(x, y, 7, 2) * 0.3 + hash(x, y, 3) * 0.3, dr = vnoise(x, y, 46, 5);
    const pal = dr > (seca ? 0.5 : 0.62) ? dry : grass; const [r, gg, b] = hex(pal[Math.max(0, Math.min(5, Math.floor(v * 5.2 - 0.4)))]), k = (y * VW + x) * 4; d[k] = r; d[k + 1] = gg; d[k + 2] = b; d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0); g.translate(OX, OY);
  const X0 = -OX, X1 = VW - OX, Y0 = -OY, Y1 = VH - OY;
  for (let y = Math.max(Y0, 150); y < Y1; y++) for (let x = X0; x < 160; x++) {
    const f = lakeF(x, y) + (seca ? 0.35 : 0); if (f > 0.12) continue;
    if (f > 0.03) { P.px(x, y, hash(x, y, 1) < 0.5 ? '#9a5a3a' : '#8a4e32'); continue; }
    if (f > -0.04) { P.px(x, y, '#b08a5a'); continue; }
    let c = ramp(['#4a7aa0', '#3a6a90', '#2c5378', '#23415f', '#1c3550'], Math.min(1, -f * 2.2), x, y); if (hash(Math.floor(x / 5), y, 4) < 0.05 && y % 3 === 0) c = '#8ab8da'; P.px(x, y, c);
  }
  for (let t = 0; t <= 1; t += 0.004) { const x = 341 + (300 - 341) * t, y = 104 + (118 - 104) * t; for (let yy = -3; yy <= 3; yy++) for (let xx = -6; xx <= 6; xx++) { if (xx * xx / 36 + yy * yy / 9 > 1 + (hash(Math.floor(x + xx), Math.floor(y + yy), 7) - 0.5) * 0.6) continue; const h = hash(Math.floor(x + xx), Math.floor(y + yy), 2); P.px(x + xx, y + yy, h < 0.3 ? '#7a6446' : h < 0.85 ? '#6b5a3e' : '#8a7452'); } }
  for (let n = 0; n < 700; n++) { const x = Math.floor(X0 + rnd() * (X1 - X0)), y = Math.floor(Y0 + rnd() * (Y1 - Y0)); if (lakeF(x, y) < 0.15) continue; const r = rnd();
    if (r < 0.55) { const c = rnd() < 0.5 ? (seca ? '#7a7a48' : '#6a7a44') : '#2c3624'; P.px(x, y, c); P.px(x - 1, y - 1, c); P.px(x + 1, y - 1, c); if (rnd() < 0.5) P.px(x, y - 2, c); }
    else if (r < 0.75) { P.px(x, y, '#7d776a'); P.px(x + 1, y, '#5e5a52'); P.px(x, y - 1, '#a8a294'); }
    else if (r < 0.85) { P.px(x, y, seca ? '#c9a24a' : '#f2c14e'); P.px(x, y + 1, '#3e5530'); }
    else { P.px(x, y, '#8a7a52'); P.px(x + 1, y + 1, '#8a7a52'); P.px(x + 2, y + 1, '#6b5a3e'); } }
  // cerca de pedra com porteira
  const capCol = x => (hash(x, 1, 5) < 0.5 ? '#9a958a' : '#a8a294');
  for (let x = X0; x < X1; x++) { if (x >= 330 && x < 352) continue;
    const yb = Math.round(wallY(x)) + 9, left = x < WALLX, base = left ? '#8a857a' : '#6e6a60';
    for (let z = 0; z < 9; z++) { const row = Math.floor(z / 3), along = x + row * 3 + (left ? 0 : 1); let c = base; if (z % 3 === 2 || along % 6 === 0) c = sh(base, -0.42); else if (hash(Math.floor(along / 6), row, 3) < 0.35) c = sh(base, 0.14); else if (hash(Math.floor(along / 6), row, 8) < 0.15) c = '#5f7a4a'; P.px(x, yb - z, c); }
    for (let t = 1; t <= 4; t++) P.px(x, yb - 8 - t, t === 4 ? '#2a2826' : capCol(x + t));
    P.alpha(x, yb + 1, '#08061a', 0.45); P.alpha(x, yb + 2, '#08061a', 0.25); }
  for (const gx of [330, 352]) { const yb = Math.round(wallY(gx)) + 9; box(P, gx, yb, 2, 2, 16, { top: '#a8a294', left: stoneTex('#8a857a'), right: stoneTex('#6e6a60') }); }
  // árvores: mata atrás da cerca e caatinga em volta
  const FAR = [{ g: '#2a4a30', G: '#335a36' }, { g: '#24402a', G: '#2c4c30' }, { g: '#1f3826', G: '#26422a' }, { g: '#1a3022', G: '#203826' }];
  const DRY = { g: '#5a5a32', G: '#6b6a3a' }, objs = [];
  const treeAt = (x, y, near, far) => { const r = rnd(), big = near && rnd() < 0.55, fp = far !== undefined ? FAR[far] : (seca && rnd() < 0.6 ? DRY : null); let im;
    if (r < 0.3) im = gsp('mandacaru', { x2: big, pal: far !== undefined ? { g: sh(fp.G, 0.1), G: fp.g } : null }); else if (r < 0.8) im = gsp(rnd() < 0.5 || far === undefined ? 'juazeiro' : 'arvore', { x2: big, pal: fp }); else if (r < 0.9) im = gsp('xique', { x2: big }); else im = gsp('carnauba', { pal: fp && { g: fp.g, G: fp.G } });
    objs.push({ y, f: () => { P.shadow(x, y, Math.ceil(im.width * 0.32), 2, 0.35); stand(P, im, x, y + 1, rnd() < 0.5); } }); };
  for (let row = 0; row < 4; row++) for (let x = X0 - 6 + row * 4; x < X1 + 10; x += 7 + Math.floor(rnd() * 6)) { const y = wallY(x) - 3 - row * 9 - rnd() * 6; if (y < Y0 + 3) continue; treeAt(x, y, row === 0 && rnd() < 0.3, row); }
  for (let n = 0, made = 0; n < 1400 && made < 40 + Math.floor((X1 - X0 - 427) / 8); n++) {
    const x = X0 + rnd() * (X1 - X0 + 20) - 10, y = Y0 + rnd() * (Y1 - Y0 + 10);
    const a = (x - GEO.CX) / GEO.A, b = (y - GEO.CY) / (GEO.A / 2), u = (a + b) / 2, v = (b - a) / 2; if (u > -1.3 && u < 6.3 && v > -1.3 && v < 6.3) continue;
    if (lakeF(x, y) < 0.3 || y < wallY(x) + 30) continue; if (x > 250 && x < 400 && y > 90 && y < 150) continue;
    treeAt(x, y, true); made++;
  }
  objs.sort((p, q) => p.y - q.y).forEach(o => o.f());
  return (BGC[key] = P.c);
}

/* ---------- camada da fazenda (lotes, construções, multidões) ---------- */
let LAYERC = {};
const TERRC = { agua: '#2c5378', pedra: '#6e6a60', mata: '#3e5530' };
function crowdPts(idx, unit, troops, cx, cy) {
  const i = Math.floor(idx / 5), j = idx % 5, A = GEO.A, dens = Math.max(0.28, Math.min(1, 0.25 + Math.log10(troops + 1) / 3.2)), pts = [];
  for (let y = cy - A / 2 + 3; y <= cy + A / 2; y += 3) for (let x = cx - A + 2 + ((y - cy + 60) % 6 ? 2 : 0); x <= cx + A - 2; x += 4) {
    const a = (x - GEO.CX) / A, b = (y - GEO.CY) / (A / 2), u = (a + b) / 2 - i, v = (b - a) / 2 - j; if (u > 0.1 && u < 0.9 && v > 0.1 && v < 0.92 && hash(x, y, 13) < dens) pts.push([x, y, unit, hash(x, y, 15) < 0.5]); }
  return pts;
}
function crowdImg(pts, cx, cy) { const T = Cv(80, 50); for (const [x, y, t, f] of pts.sort((a, b) => a[1] - b[1])) { const u = UNITS[t], h = u.r.length; u.r.forEach((row, jj) => { for (let ii = 0; ii < row.length; ii++) { const c = u.p[row[ii]]; if (c) T.px((f ? x + 1 - ii + (row.length - 3) : x - 1 + ii) - cx + 40, y - h + 1 + jj - cy + 25, c); } }); } return outline(T.c); }
function farmLayer(farm, crowds, season) {
  const key = JSON.stringify(farm.tiles.map(t => [t.t, t.c, t.lvl, Math.round(Math.log2(t.troops + 1) * 2), t.bless.length])) + crowds + season + VW + VH;
  if (LAYERC.key === key && LAYERC.lord === farm.lord) return LAYERC.c;
  const P = Cv(VW, VH); P.g.translate(OX, OY); const A = GEO.A;
  for (let k = 0; k < 25; k++) {
    const t = farm.tiles[k], i = Math.floor(k / 5), j = k % 5, [tx, ty] = tileTop(i, j), c = t.c && t.c !== 'casa' ? CARDS[t.c] : null;
    for (let r = 0; r < A; r++) { const hw = r < A / 2 ? 2 * (r + 1) : 2 * (A - r); for (let x = tx - hw; x < tx + hw; x++) { const y = ty + r; let col = null;
      if (c && c.kind === 'tropa' && crowds) col = hash(x, y, 11) < 0.5 ? '#3e3526' : '#463c2a';
      else if (c && c.vis === 'roca') col = (Math.floor((x - tx) / 2 + (y - ty)) % 3 === 0) ? '#3a3020' : '#5a4a30';
      else if (t.t === 'agua' && !c) { const dx = (x - tx) / (A * 0.62), dy = (y - ty - A / 2) / (A * 0.3); const f = dx * dx + dy * dy; col = f < 0.6 ? ramp(['#3a6a90', '#2c5378', '#23415f'], 1 - f / 0.6, x, y) : f < 0.8 ? '#b08a5a' : null; }
      else if (t.t === 'pedra' && !c) col = hash(x, y, 21) < 0.5 ? '#5a5648' : null;
      else if (t.t === 'mata' && !c) col = hash(x, y, 22) < 0.45 ? '#2f4a2a' : null;
      if (col) P.px(x, y, col); } }
  }
  P.g.globalAlpha = 0.55;
  for (let n = 0; n <= 5; n++) for (let m = 0; m < 5 * A / 2; m++) { const [ax, ay] = tileTop(n, 0), [bx, by] = tileTop(0, n);
    P.px(ax - 2 * m - 1, ay + m, '#e8d9b8'); P.px(ax - 2 * m - 2, ay + m, '#e8d9b8'); P.px(bx + 2 * m, by + m, '#e8d9b8'); P.px(bx + 2 * m + 1, by + m, '#e8d9b8'); }
  P.g.globalAlpha = 1;
  const objs = [];
  for (let k = 0; k < 25; k++) {
    const t = farm.tiles[k], [cx, cy] = tileCen(k), c = t.c && t.c !== 'casa' ? CARDS[t.c] : null;
    if (!t.c) { if (t.t === 'pedra') objs.push({ y: cy, f: () => { for (const [dx, dy] of [[-8, -2], [6, 1], [0, 4]]) { P.px(cx + dx, cy + dy, '#a8a294'); P.px(cx + dx + 1, cy + dy, '#7d776a'); P.px(cx + dx, cy + dy + 1, '#5e5a52'); P.px(cx + dx + 1, cy + dy + 1, '#5e5a52'); P.px(cx + dx - 1, cy + dy + 1, '#7d776a'); } } });
      if (t.t === 'mata') objs.push({ y: cy, f: () => { stand(P, gsp('xique'), cx - 8, cy); stand(P, gsp('juazeiro'), cx + 6, cy + 3); } }); continue; }
    if (t.c === 'casa') { objs.push({ y: cy + 6, f: () => { placeB(P, BLD.casa, cx, cy + 2); P.glow(cx - 8, cy - 2, 9, '#f2c14e', 0.25); } }); continue; }
    if (c.kind === 'tropa') { if (crowds) { const im = crowdImg(crowdPts(k, c.unit, t.troops, cx, cy), cx, cy); objs.push({ y: cy + 5, f: () => P.img(im, cx - 41, cy - 26) }); } continue; }
    if (c.vis === 'roca') { objs.push({ y: cy + 4, f: () => { for (let y = cy - A / 2 + 3; y <= cy + A / 2 - 2; y += 3) for (let x = cx - A + 4; x <= cx + A - 4; x += 3) { const a = (x - GEO.CX) / A, b = (y - GEO.CY) / (A / 2), u = (a + b) / 2 - Math.floor(k / 5), v = (b - a) / 2 - k % 5; if (u > 0.1 && u < 0.9 && v > 0.1 && v < 0.9) { P.px(x, y, '#3d6b33'); P.px(x, y - 1, '#5f9e4a'); P.px(x + 1, y - 2, '#5f9e4a'); P.px(x, y - 3, '#4a7a3a'); if (hash(x, y, 3) < 0.6) P.px(x - 1, y - 2, '#d9b24a'); } } } }); continue; }
    const b = BLD[VIS[c.vis]]; if (b) objs.push({ y: cy + 6, f: () => { placeB(P, b, cx, cy + 2); if (c.vis === 'fogo') { flame(P, cx + 1, cy - 13, true); P.glow(cx, cy - 16, 20, '#e8832a', 0.45); } } });
  }
  objs.sort((a, b) => a.y - b.y).forEach(o => o.f());
  LAYERC = { key, lord: farm.lord, c: P.c };
  return P.c;
}

/* ---------- números em pixel ---------- */
const DOT = (() => { const c = document.createElement('canvas'); c.width = 3; c.height = 3; const x = c.getContext('2d'); x.fillStyle = '#000'; x.fillRect(0, 0, 3, 3); x.fillStyle = '#fff'; x.fillRect(1, 1, 1, 1); return c; })();
function drawNum(str, x, y, set) { set = set || DW; const w = [...str].reduce((s, ch) => s + (ch === '.' ? 2 : 4), 1); let px = Math.round(x - w / 2); for (const ch of str) { if (ch === '.') { ctx.drawImage(DOT, px, y + 4); px += 2; } else if (set[ch]) { ctx.drawImage(set[ch], px, y); px += 4; } } }

/* ---------- destaque de lote ---------- */
const DIAM = {};
function diamond(col) { if (DIAM[col]) return DIAM[col]; const A = GEO.A, P = Cv(2 * A + 2, A + 2); for (let m = 0; m < A / 2; m++) for (const [x, y] of [[A - 2 * m, m], [A - 2 * m - 1, m], [A + 1 + 2 * m, m], [A + 2 + 2 * m, m], [1 + 2 * m, A / 2 + m], [2 + 2 * m, A / 2 + m], [2 * A - 2 * m, A / 2 + m], [2 * A - 2 * m + 1, A / 2 + m]]) P.px(x, y + 1, col); return (DIAM[col] = P.c); }
function drawDiamond(k, col, a) { const [tx, ty] = tileTop(Math.floor(k / 5), k % 5), d = diamond(col); ctx.globalAlpha = a == null ? 1 : a; ctx.drawImage(d, OX + tx - GEO.A - 1, OY + ty - 1); ctx.globalAlpha = 1; }

/* ---------- unidades de batalha ---------- */
function outlineC(c, col) { const o = document.createElement('canvas'); o.width = c.width + 2; o.height = c.height + 2; const x = o.getContext('2d'); for (const [dx, dy] of [[0, 1], [2, 1], [1, 0], [1, 2]]) x.drawImage(c, dx, dy); x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, o.width, o.height); x.globalCompositeOperation = 'source-over'; x.drawImage(c, 1, 1); return o; }
const USPR = {};
function uspr(unit, side, fr, flip) {
  const key = unit + side + fr + (flip ? 1 : 0); if (USPR[key]) return USPR[key];
  const u = UNITS[unit], pal = Object.assign({}, u.p), rows = fr ? (walkRows(u.r) || [u.r, u.r])[fr - 1] : u.r;
  let c = outlineC(mk(rows, pal), side ? '#4a0c18' : '#07060f'); if (flip) c = xform(c, 1);
  return (USPR[key] = c);
}
const BOSSIMG = {};
const bossImg = (spr, flip) => BOSSIMG[spr + flip] || (BOSSIMG[spr + flip] = flip ? xform(gsp(spr, { x2: true }), 1) : gsp(spr, { x2: true }));

function drawBattle(B, t) {
  const ents = B.ents.filter(e => e.hp > 0).sort((a, b) => a.y - b.y);
  for (const e of ents) {
    const x = Math.round(OX + e.x), y = Math.round(OY + e.y);
    if (e.boss) { const im = bossImg(e.spr, e.side === 1); ctx.fillStyle = 'rgba(8,6,18,.4)'; ctx.fillRect(x - 12, y - 1, 24, 3); ctx.drawImage(im, x - Math.floor(im.width / 2), y - im.height + 1); continue; }
    const moving = e.tgt ? Math.hypot(e.tgt.x - e.x, (e.tgt.y - e.y) * 2) > e.rng + 1 : true, fr = moving ? 1 + (Math.floor(e.step) % 2) : 0;
    const flip = e.tgt ? e.tgt.x < e.x : e.side === 1;
    const im = uspr(e.unit, e.side, fr, flip);
    if (e.stealth > 0) ctx.globalAlpha = 0.4;
    ctx.drawImage(im, x - Math.floor(im.width / 2), y - im.height + 1);
    ctx.globalAlpha = 1;
    if (e.st.stun > 0 && (Math.floor(t * 4) % 2)) { ctx.fillStyle = '#cfe0ff'; ctx.fillRect(x + 1, y - im.height - 2, 2, 1); ctx.fillRect(x + 2, y - im.height - 3, 1, 1); }
    if (e.st.burn > 0 && (Math.floor(t * 10 + e.x) % 3 === 0)) { ctx.fillStyle = '#e8832a'; ctx.fillRect(x, y - im.height, 1, 1); }
  }
  for (const p of B.projs) {
    const x = Math.round(OX + p.x), y = Math.round(OY + p.y);
    if (p.kind === 'brasa') { ctx.fillStyle = '#e8832a'; ctx.fillRect(x - 1, y - 1, 2, 2); ctx.fillStyle = '#fff6a0'; ctx.fillRect(x, y - 1, 1, 1); }
    else if (p.kind === 'flecha') { ctx.fillStyle = '#e8d9b8'; ctx.fillRect(x - 1, y, 3, 1); }
    else if (p.kind === 'vento') { ctx.fillStyle = '#e8d9b8'; for (let k = 0; k < 4; k++) ctx.fillRect(x + Math.round(Math.cos(t * 12 + k * 1.6) * 3), y + Math.round(Math.sin(t * 12 + k * 1.6) * 1.5), 1, 1); }
    else if (p.kind === 'assombro') { ctx.fillStyle = '#e8832a'; ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillStyle = '#2a2433'; ctx.fillRect(x, y - 1, 1, 1); }
    else { ctx.fillStyle = p.kind === 'azul' ? '#5fd4ff' : p.kind === 'reza' ? '#9fe07a' : '#fff6a0'; ctx.fillRect(x, y, 2, 1); }
  }
  for (const f of B.fx) {
    const x = Math.round(OX + (f.x || 0)), y = Math.round(OY + (f.y || 0)), k = f.t;
    if (f.k === 'puff') { ctx.fillStyle = 'rgba(216,200,168,' + (k * 1.5).toFixed(2) + ')'; for (let a = 0; a < 6; a++) ctx.fillRect(x + Math.round(Math.cos(a) * (6 - k * 10)), y - 2 + Math.round(Math.sin(a) * (3 - k * 5)), 1, 1); }
    else if (f.k === 'boom') { ctx.fillStyle = k > 0.2 ? '#fff6a0' : '#e8832a'; const r = Math.round((0.35 - k) * 30); for (let a = 0; a < 12; a++) ctx.fillRect(x + Math.round(Math.cos(a / 12 * 6.28) * r), y + Math.round(Math.sin(a / 12 * 6.28) * r * 0.5), 1, 1); }
    else if (f.k === 'swirl') { ctx.fillStyle = '#e8d9b8'; for (let a = 0; a < 10; a++) ctx.fillRect(x + Math.round(Math.cos(a + k * 20) * (4 + a)), y + Math.round(Math.sin(a + k * 20) * (2 + a / 2)), 1, 1); }
    else if (f.k === 'spark') { ctx.fillStyle = '#fff6a0'; ctx.fillRect(x, y, 1, 1); ctx.fillRect(x - 1, y + 1, 3, 1); }
    else if (f.k === 'heal') { ctx.fillStyle = '#9fe07a'; ctx.fillRect(x, y - 1, 1, 3); ctx.fillRect(x - 1, y, 3, 1); }
    else if (f.k === 'ring') { ctx.fillStyle = f.c; const r = Math.round((0.8 - k) * 70); for (let a = 0; a < 40; a++) ctx.fillRect(x + Math.round(Math.cos(a / 40 * 6.28) * r), y + Math.round(Math.sin(a / 40 * 6.28) * r * 0.5), 1, 1); }
    else if (f.k === 'line') { ctx.fillStyle = f.c; for (let xx = 0; xx < VW; xx += 2) if (hash(xx, Math.floor(k * 20), 1) < 0.7) ctx.fillRect(xx, OY + f.y + Math.round(Math.sin(xx * 0.2 + k * 10) * 3), 1, 2); }
  }
  const ns = B.nums.slice(-36);
  for (const n of ns) if (n.v >= 1) drawNum(String(Math.round(n.v)), OX + n.x, Math.round(OY + n.y) - 6, n.side ? DW : DY);
}

/* ---------- arte das cartas e retratos ---------- */
const ARTC = {};
function cardArt(cid) {
  if (ARTC[cid]) return ARTC[cid];
  const c = CARDS[cid], P = Cv(64, 48);
  const sky = c.tipo === 'lote' ? (c.kind === 'torre' ? ['#0a0d22', '#141a38', '#2a2440', '#3a2a3a'] : ['#2a3050', '#5a4a6a', '#a8665a', '#e09a6a']) : c.tipo === 'bencao' ? ['#0d1a34', '#16284a', '#22406a', '#2f5a8a'] : c.when === 'batalha' ? ['#1a0810', '#2a0c14', '#4a1418', '#6a2020'] : ['#0a2418', '#123a24', '#1f5a34', '#2f7a44'];
  for (let y = 0; y < 48; y++) for (let x = 0; x < 64; x++) P.px(x, y, ramp(sky, y / 34, x, y));
  const r = mulberry(cid.length * 7 + cid.charCodeAt(0)); for (let k = 0; k < 10; k++) P.px(r() * 64, r() * 20, '#f4efe0');
  if (c.tipo === 'lote') {
    for (let x = 0; x < 64; x++) { const gy = 34 + Math.round(vnoise(x, 0, 9, cid.length) * 3); for (let y = gy; y < 48; y++) P.px(x, y, hash(x, y, 2) < 0.25 ? '#3a3020' : '#4a4030'); }
    if (c.kind === 'tropa') { const T = Cv(32, 24), u = UNITS[c.unit]; for (let row = 0; row < 3; row++) for (let q = 0; q < 6; q++) { const x = 4 + q * 5 + (row % 2) * 2, y = 10 + row * 5; u.r.forEach((rr, jj) => { for (let ii = 0; ii < rr.length; ii++) { const cc = u.p[rr[ii]]; if (cc) T.px(x - 1 + ii, y - u.r.length + 1 + jj, cc); } }); } const o = outline(T.c); P.g.drawImage(o, 0, 0, o.width, o.height, -2, 4, o.width * 2, o.height * 2); }
    else if (c.vis === 'roca') { for (let y = 36; y < 48; y += 3) for (let x = (y % 2) * 2; x < 64; x += 4) { const h = 3 + Math.floor((y - 34) / 4); for (let z = 0; z < h; z++) P.px(x, y - z, z === h - 1 ? '#5f9e4a' : '#3d6b33'); P.px(x + 1, y - h + 1, '#d9b24a'); } }
    else { const b = BLD[VIS[c.vis]]; if (b) placeB(P, b, 32, 42); if (c.vis === 'fogo') { flame(P, 33, 29, true); P.glow(32, 26, 16, '#e8832a', 0.5, 1.4); } }
  } else {
    P.glow(32, 24, 22, c.tipo === 'bencao' ? '#7fb2e5' : c.when === 'batalha' ? '#e05545' : '#9fe07a', 0.35, 1);
    const ic = gsp(c.ico, { x2: true }); P.img(ic, 32 - Math.floor(ic.width / 2), 24 - Math.floor(ic.height / 2));
    for (const [x, y] of [[8, 8], [56, 10], [14, 38], [52, 36]]) { P.px(x, y, '#fff6a0'); P.px(x - 1, y, sky[3]); P.px(x + 1, y, sky[3]); }
  }
  return (ARTC[cid] = P.url());
}
const THEMES = {
  coronel: { sky: ['#1a2242', '#3a3a5a', '#8a5a5a', '#d08a5a'], gnd: '#5a4a30', prop: 'casa' },
  rezadeira: { sky: ['#0d1230', '#1a2242', '#2a2a4a', '#3a3a5a'], gnd: '#3a3640', prop: 'velas' },
  cangaceiro: { sky: ['#2a2040', '#5a3a4a', '#a85a3a', '#e8a050'], gnd: '#6b5a3e', prop: 'mandacaru' },
  cuca: { sky: ['#0d1a1a', '#14302a', '#1f4a34', '#2f6a44'], gnd: '#2a3a2a', prop: 'caldeirao' },
  saci: { sky: ['#1a1230', '#3a2040', '#6a2a3a', '#a83a32'], gnd: '#4a3a2a', prop: 'redemoinho' },
  lobisomem: { sky: ['#06081a', '#0d1230', '#1a2242', '#2a3460'], gnd: '#26303a', prop: 'lua' },
  boitataHead: { sky: ['#060a1a', '#0a1430', '#14285a', '#1f4a8a'], gnd: '#1a2a3a', prop: 'fogofatuo' },
  mula: { sky: ['#1a0a10', '#3a1414', '#6a2014', '#a83a14'], gnd: '#3a2414', prop: 'brasas' },
  caipora: { sky: ['#0a1a10', '#12301a', '#1f4a24', '#2f6a30'], gnd: '#24361e', prop: 'mata' },
  anhanga: { sky: ['#0a0a12', '#1a1424', '#2a1a2a', '#4a2a2a'], gnd: '#2a2428', prop: 'lua' },
  mapinguari: { sky: ['#0a1408', '#14240f', '#22381a', '#2f4a22'], gnd: '#2a2418', prop: 'mata' },
  corposeco: { sky: ['#14100a', '#2a2014', '#4a3420', '#6a4a28'], gnd: '#3a2a1a', prop: 'mandacaru' },
  paimato: { sky: ['#06120a', '#0c2412', '#163a1c', '#205024'], gnd: '#1a2a14', prop: 'mata' },
};
const PORTC = {};
function portrait(key) {
  if (PORTC[key]) return PORTC[key];
  const th = THEMES[key], W = 40, H = 44, P = Cv(W, H), r = mulberry(key.length * 31);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) P.px(x, y, ramp(th.sky, y / 34, x, y));
  if (th.prop === 'lua') { for (let yy = -6; yy <= 6; yy++) for (let xx = -6; xx <= 6; xx++) if (xx * xx + yy * yy <= 36) P.px(29 + xx, 9 + yy, (xx + 2) * (xx + 2) + (yy - 1) * (yy - 1) < 9 ? '#d8d4c4' : '#f4efe0'); P.glow(29, 9, 14, '#7fb2e5', 0.3, 1); }
  for (let k = 0; k < 10; k++) P.px(r() * W, r() * 20, th.prop === 'mata' || th.prop === 'caldeirao' ? '#9fe07a' : '#f4efe0');
  for (let x = 0; x < W; x++) { const g = 33 + Math.round(vnoise(x, 0, 6, key.length) * 3); for (let y = g; y < H; y++) P.px(x, y, y === g ? sh(th.gnd, 0.2) : (hash(x, y, 2) < 0.2 ? sh(th.gnd, -0.15) : th.gnd)); }
  if (th.prop === 'casa') stand(P, gsp('casarao'), 30, 34);
  if (th.prop === 'mandacaru') { stand(P, gsp('mandacaru'), 6, 35); stand(P, gsp('mandacaru'), 35, 34); }
  if (th.prop === 'mata') { stand(P, gsp('arvore'), 5, 35); stand(P, gsp('arvore'), 36, 34); }
  if (th.prop === 'velas') for (const x of [5, 9, 31, 35]) { P.rect(x, 29, 1, 4, '#f0ead6'); P.px(x, 28, '#f2c14e'); P.px(x, 27, '#fff6a0'); P.glow(x, 27, 5, '#f2c14e', 0.4, 1); }
  if (th.prop === 'caldeirao') { P.rect(3, 29, 9, 5, '#14111f'); P.rect(4, 28, 7, 1, '#3a3a4a'); for (const x of [5, 7, 9]) P.px(x, 27, '#9fe07a'); P.px(7, 25, '#9fe07a'); P.glow(7, 27, 8, '#9fe07a', 0.4, 1); }
  if (th.prop === 'redemoinho') for (let k = 0; k < 40; k++) { const t = k / 40, a = t * 18; P.px(32 + Math.cos(a) * (2 + t * 6), 33 - t * 22, '#c9a878'); }
  if (th.prop === 'fogofatuo' || th.prop === 'brasas') for (let k = 0; k < 7; k++) { const x = 3 + r() * 34, y = 8 + r() * 22, c = th.prop === 'brasas' ? '#e8832a' : '#5fd4ff'; P.px(x, y, c); P.glow(x, y, 4, c, 0.5, 1); }
  const sprk = key === 'boitataHead' ? 'boitataHead' : (LORDS[key] ? LORDS[key].spr : key);
  let im = gsp(sprk, { x2: true }); if (im.height > 40 || im.width > 40) im = gsp(sprk);
  stand(P, im, 20, 39);
  return (PORTC[key] = P.url());
}
const portraitOf = id => portrait(id === 'boitata' ? 'boitataHead' : id);
