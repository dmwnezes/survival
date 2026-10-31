'use strict';
/* ---------------- desenho ---------------- */
function drawSpr(s, x, y, opt) {
  const sc = (opt && opt.sc) || 1, fl = opt && opt.flip, wh = opt && opt.white;
  const img = wh ? (fl ? s.wf : s.w) : (fl ? s.f : s.n);
  ctx.drawImage(img, Math.round(x - s.W * sc / 2), Math.round(y - s.H * sc / 2), s.W * sc, s.H * sc);
}
function longShadow(s, x, yb, sc) { // sombra da lua (alta à direita) caindo para baixo e à esquerda
  ctx.save(); ctx.globalAlpha = 0.32; ctx.translate(Math.round(x), Math.round(yb)); ctx.transform(1, 0, 0.9, -0.42, 0, 0);
  ctx.drawImage(s.k, -s.W * sc / 2, -s.H * sc, s.W * sc, s.H * sc); ctx.restore();
}
function drawPatches() {
  const cx0 = Math.max(0, ((camX - 130) / 256) | 0), cx1 = ((camX + VW + 130) / 256) | 0, cy0 = Math.max(0, ((camY - 80) / 256) | 0), cy1 = ((camY + VH + 80) / 256) | 0;
  ctx.globalAlpha = 0.55;
  for (let gx = cx0; gx <= cx1; gx++) for (let gy = cy0; gy <= cy1; gy++) { const cell = patchGrid.get(gx * 1000 + gy); if (cell) for (const p of cell) if (onScreen(p.x, p.y, p.rx)) { ctx.fillStyle = p.c; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, 0, 0, 6.283); ctx.fill(); } }
  ctx.globalAlpha = 1;
}
function drawRoads() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const r of roads) for (let i = 1; i < r.length; i++) {
    const a = r[i - 1], b = r[i];
    if (Math.max(a.x, b.x) < camX - 40 || Math.min(a.x, b.x) > camX + VW + 40 || Math.max(a.y, b.y) < camY - 40 || Math.min(a.y, b.y) > camY + VH + 40) continue;
    ctx.strokeStyle = '#2b2a45'; ctx.lineWidth = 32; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.strokeStyle = '#34324f'; ctx.lineWidth = 24; ctx.stroke();
    const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L * 6, ny = dx / L * 6;
    ctx.strokeStyle = '#2a2944'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(a.x + nx, a.y + ny); ctx.lineTo(b.x + nx, b.y + ny); ctx.moveTo(a.x - nx, a.y - ny); ctx.lineTo(b.x - nx, b.y - ny); ctx.stroke();
  }
  ctx.lineCap = 'butt';
  for (const g of graves) if (onScreen(g.x, g.y, g.r)) { ctx.fillStyle = 'rgba(120,130,170,0.08)'; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * 0.7, 0, 0, 6.283); ctx.fill(); ctx.strokeStyle = 'rgba(92,58,28,0.6)'; ctx.setLineDash([3, 5]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
}
function drawPuddles() {
  if (!(G.wet > 0.02)) return;
  ctx.fillStyle = `rgba(40,60,120,${0.35 * G.wet})`;
  const x0 = Math.floor(camX / 140) - 1, x1 = Math.floor((camX + VW) / 140) + 1, y0 = Math.floor(camY / 140) - 1, y1 = Math.floor((camY + VH) / 140) + 1;
  for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) { const h = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5; const r = h - Math.floor(h); if (r > 0.35) continue; ctx.beginPath(); ctx.ellipse(gx * 140 + r * 300 % 120, gy * 140 + r * 700 % 120, 10 + r * 30, 5 + r * 12, 0, 0, 6.283); ctx.fill(); }
}
function shadow(x, y, w) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(Math.round(x - w / 2), Math.round(y), Math.round(w), 2); }
const onScreen = (x, y, m) => x > camX - m && x < camX + VW + m && y > camY - m && y < camY + VH + m;
function drawBorder() {
  ctx.fillStyle = '#070a1a'; const B = 2000;
  ctx.fillRect(-B, -B, MAPW + 2 * B, B); ctx.fillRect(-B, MAPH, MAPW + 2 * B, B); ctx.fillRect(-B, 0, B, MAPH); ctx.fillRect(MAPW, 0, B, MAPH);
  ctx.fillStyle = '#5c3a1c';
  const xs = Math.max(0, Math.floor(camX / 20) * 20), xe = Math.min(MAPW, camX + VW + 20);
  const ys = Math.max(0, Math.floor(camY / 20) * 20), ye = Math.min(MAPH, camY + VH + 20);
  if (camY < 10) { for (let x = xs; x <= xe; x += 20) ctx.fillRect(x, -6, 2, 7); ctx.fillRect(xs, -4, xe - xs, 1); }
  if (camY + VH > MAPH - 10) { for (let x = xs; x <= xe; x += 20) ctx.fillRect(x, MAPH - 1, 2, 7); ctx.fillRect(xs, MAPH + 1, xe - xs, 1); }
  if (camX < 10) { for (let y = ys; y <= ye; y += 20) ctx.fillRect(-2, y, 2, 7); ctx.fillRect(-2, ys, 1, ye - ys); }
  if (camX + VW > MAPW - 10) { for (let y = ys; y <= ye; y += 20) ctx.fillRect(MAPW, y, 2, 7); ctx.fillRect(MAPW + 1, ys, 1, ye - ys); }
}
function drawRiver() {
  const y0 = Math.max(0, Math.floor(camY / 6) * 6 - 6), y1 = Math.min(MAPH, camY + VH + 6);
  if (riverX(camY + VH / 2) < camX - 160 || riverX(camY + VH / 2) > camX + VW + 160) return;
  for (let y = y0; y < y1; y += 6) { const x = riverX(y); ctx.fillStyle = '#2a3058'; ctx.fillRect(Math.round(x - 39), y, 78, 6); ctx.fillStyle = '#1b2c63'; ctx.fillRect(Math.round(x - 36), y, 72, 6); }
  ctx.fillStyle = 'rgba(160,190,240,0.45)'; const T = G ? G.time : 0;
  for (let y = y0; y < y1; y += 18) ctx.fillRect(Math.round(riverX(y) + Math.sin(y * 0.3 + T * 2) * 20), Math.round(y + (T * 30) % 18), 4, 1);
  for (const b of BRIDGES) { if (b < camY - 30 || b > camY + VH + 30) continue; const x = riverX(b); ctx.fillStyle = '#5c3a1c'; ctx.fillRect(Math.round(x - 48), Math.round(b - 22), 96, 44); ctx.fillStyle = '#8a5a2b'; for (let i = -44; i < 46; i += 8) ctx.fillRect(Math.round(x + i), Math.round(b - 20), 6, 40); ctx.fillStyle = '#3a2414'; ctx.fillRect(Math.round(x - 48), Math.round(b - 23), 96, 2); ctx.fillRect(Math.round(x - 48), Math.round(b + 21), 96, 2); }
}
function drawWater() {
  for (const a of acudes) { if (!onScreen(a.x, a.y, a.rx + 10)) continue;
    ctx.fillStyle = '#2a3058'; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.rx + 3, a.ry + 3, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#1b2c63'; ctx.beginPath(); ctx.ellipse(a.x, a.y, a.rx, a.ry, 0, 0, 6.283); ctx.fill();
    { const T0 = G ? G.time : 0, rx = a.x + a.rx * 0.3, ry = a.y - a.ry * 0.35; ctx.fillStyle = 'rgba(244,231,182,0.32)';
      for (let j = 0; j < 6; j++) { const w = 10 - j * 1.2 + Math.sin(T0 * 2 + j * 1.7) * 3; ctx.fillRect(Math.round(rx - w / 2 + Math.sin(T0 * 1.3 + j) * 2), Math.round(ry + j * 4), Math.max(2, Math.round(w)), 1); }
      ctx.strokeStyle = 'rgba(160,190,240,0.3)'; ctx.lineWidth = 1; for (let j = 0; j < 2; j++) { const ph = (T0 * 0.6 + j * 0.5) % 1, cx = a.x - a.rx * 0.3 + j * a.rx * 0.4, cy = a.y + a.ry * 0.2; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.ellipse(cx, cy, 3 + ph * 16, (3 + ph * 16) * 0.45, 0, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1; }
    ctx.fillStyle = 'rgba(160,190,240,0.5)'; const T = G ? G.time : 0;
    for (let i = 0; i < 6; i++) ctx.fillRect(Math.round(a.x + Math.sin(i * 2.1 + T * 0.6) * a.rx * 0.6), Math.round(a.y + Math.cos(i * 1.7) * a.ry * 0.6), 3, 1); }
}
function drawTraps() {
  for (const t of traps) { if (!onScreen(t.x, t.y, t.r + 10)) continue;
    if (t.k === 'areia') {
      ctx.fillStyle = '#5e4a32'; ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r, t.r * 0.6, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(200,170,120,0.45)'; ctx.lineWidth = 1; const a = (G ? G.time : 0) * 1.5;
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(t.x, t.y, t.r * i / 4, t.r * i / 4 * 0.6, 0, a + i, a + i + 4); ctx.stroke(); }
    } else {
      for (let i = 0; i < 9; i++) { const a = i * 2.4, r = (i % 3) * 4 + 2, x = Math.round(t.x + Math.cos(a) * r), y = Math.round(t.y + Math.sin(a) * r * 0.6);
        ctx.fillStyle = '#3d6b33'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillStyle = '#c9c9d6'; ctx.fillRect(x, y - 3, 1, 3); }
    }
  }
}
function drawWhirls() { for (const w of whirls) { if (!onScreen(w.x, w.y, 70)) continue; ctx.strokeStyle = 'rgba(200,180,140,0.38)'; ctx.lineWidth = 2; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(w.x, w.y - i * 6, 14 + i * 9, (14 + i * 9) * 0.45, 0, w.ang + i, w.ang + i + 3.6); ctx.stroke(); } } }
function drawCarts() { for (const c of carts) if (onScreen(c.x, c.y, 30)) { shadow(c.x, c.y + 7, 30); drawSpr(S.carro, c.x, c.y, { flip: c.vx > 0, sc: 1.5 }); } }
function drawPilgrims() { for (const pg of pilgrims) if (onScreen(pg.x, pg.y, 20)) { ctx.globalAlpha = 0.85; drawSpr(S.romeiro, pg.x, pg.y + Math.sin(G.time * 3 + pg.ph) * 1.5); ctx.globalAlpha = 1; } }
function drawAllies() {
  for (const w of flatW()) if (w.id === 'facao' && w.ang != null && !G.dawn) { const s2 = wstat('facao', w.lvl, w.ev), R = s2.rad * s2.area; for (let i = 0; i < s2.n; i++) { const ba = w.ang + i * 6.283 / s2.n; ctx.strokeStyle = 'rgba(240,234,214,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(player.x, player.y, R * 0.8, ba - 0.38, ba); ctx.stroke(); ctx.save(); ctx.translate(Math.round(player.x + Math.cos(ba) * R * 0.6), Math.round(player.y + Math.sin(ba) * R * 0.6)); ctx.rotate(ba + 0.78); const si = S.i_facao; ctx.drawImage(si.n, -si.W / 2, -si.H / 2); ctx.restore(); } }
  const pt = player.pet;
  if (pt) { if (pt.k !== 'carcara') shadow(pt.x, pt.y + 4, 6); drawSpr(S[pt.k], pt.x, pt.y, { flip: pt.vx < 0 }); }
  for (const c of critters) if (onScreen(c.x, c.y, 20)) { shadow(c.x, c.y + 4, 6); drawSpr(S.galinha, c.x, c.y - (Math.sin(G.time * 16) > 0 ? 1 : 0), { flip: c.vx < 0 }); }
  for (const w of flatW()) {
    if (w.id === 'folhetos' && !G.dawn) { const s = wstat('folhetos', w.lvl, w.ev); for (let i = 0; i < s.n; i++) { const a = (w.ang || 0) + i * 6.283 / s.n; drawSpr(S.folha, player.x + Math.cos(a) * s.rad, player.y + Math.sin(a) * s.rad, { sc: w.ev ? 1.6 : 1 }); } }
    if (w.id === 'galo' && w.galos) for (const g of w.galos) { shadow(g.x, g.y + 4, 6); drawSpr(S.galo, g.x, g.y - (g.peck > 0 ? 1 : 0), { flip: g.vx < 0 }); }
  }
}
function drawDecor() { const cx0 = Math.max(0, ((camX - 30) / 256) | 0), cx1 = ((camX + VW + 30) / 256) | 0, cy0 = Math.max(0, ((camY - 30) / 256) | 0), cy1 = ((camY + VH + 30) / 256) | 0;
  for (let gx = cx0; gx <= cx1; gx++) for (let gy = cy0; gy <= cy1; gy++) { const cell = decorGrid.get(gx * 1000 + gy); if (cell) for (const d of cell) if (onScreen(d.x, d.y, 20) && !nearRiver(d.x, d.y, 4) && !(acudes.length && inWater(d.x, d.y)) && !inVillage(d.x, d.y) && !inGrave(d.x, d.y) && !onRoad(d.x, d.y)) { const s = S[d.k]; if (TALL.has(d.k)) longShadow(s, d.x, d.y + s.H / 2, 1); drawSpr(s, d.x, d.y); } } }
function drawGround() {
  for (const m of muds) { if (!onScreen(m.x, m.y, m.r)) continue; ctx.globalAlpha = 0.6 * Math.min(1, m.life / 0.5); ctx.fillStyle = '#4a3624'; ctx.beginPath(); ctx.ellipse(m.x, m.y, m.r, m.r * 0.6, 0, 0, 6.283); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (const fr of fires) { if (!onScreen(fr.x, fr.y, fr.r + 10)) continue; const a = Math.min(1, fr.life / 2); ctx.globalAlpha = 0.55 * a; ctx.fillStyle = '#2a140c'; ctx.beginPath(); ctx.ellipse(fr.x, fr.y, fr.r, fr.r * 0.65, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = a;
    for (let i = 0; i < fr.r / 2; i++) { const an = Math.random() * 6.283, rr = fr.r * (0.7 + Math.random() * 0.3); ctx.fillStyle = Math.random() < 0.5 ? '#e8832a' : '#f2c14e'; ctx.fillRect(Math.round(fr.x + Math.cos(an) * rr), Math.round(fr.y + Math.sin(an) * rr * 0.65 - 2), 1, 2 + (Math.random() * 3 | 0)); } }
  ctx.globalAlpha = 1;
  for (const r of roots) { if (!onScreen(r.x, r.y, 20)) continue; const k = Math.min(1, r.t / 0.9); if (r.t < 0.9) { ctx.strokeStyle = 'rgba(92,58,28,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(r.x, r.y, 16, 9, 0, 0, 6.283); ctx.stroke(); } drawSpr(S.raiz, r.x, r.y - 3 * k, { sc: 0.5 + k * 1.3 }); }
  for (const h of honeys) { if (!onScreen(h.x, h.y, h.r)) continue; ctx.globalAlpha = 0.4 * Math.min(1, h.life / 0.6); ctx.fillStyle = '#e8a020'; ctx.beginPath(); ctx.ellipse(h.x, h.y, h.r, h.r * 0.6, 0, 0, 6.283); ctx.fill(); }
  ctx.globalAlpha = 1;
  for (const g of goos) { if (!onScreen(g.x, g.y, 30)) continue; ctx.globalAlpha = 0.55 * Math.min(1, g.life / 0.6); ctx.fillStyle = '#3f8a2e'; ctx.beginPath(); ctx.ellipse(g.x, g.y, g.r, g.r * 0.6, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#9fe07a'; ctx.fillRect(Math.round(g.x - 4), Math.round(g.y - 2), 2, 1); ctx.fillRect(Math.round(g.x + 5), Math.round(g.y + 2), 1, 1); }
  for (const m of marks) { if (!onScreen(m.x, m.y, 10)) continue; ctx.globalAlpha = Math.min(0.85, m.life / 2); ctx.fillStyle = '#c86a3a'; ctx.fillRect(Math.round(m.x - Math.sin(m.a) * 2 * m.s), Math.round(m.y + Math.cos(m.a) * 2 * m.s), 2, 1); }
  ctx.globalAlpha = 1;
  for (const s of spots) { if (!onScreen(s.x, s.y, 30)) continue;
    if (s.k === 'capela') { longShadow(S.capela, s.x, s.y + S.capela.H / 2, 1); shadow(s.x, s.y + 6, 12); drawSpr(S.capela, s.x, s.y); if (s.charge > 5) { ctx.strokeStyle = 'rgba(180,210,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(s.x, s.y + 4, 22, 0, 6.283); ctx.stroke(); } }
    else if (s.k === 'fogo') drawSpr(s.cd <= 0 && !(G.rain > 0) ? S.i_fogueira : S.cinza, s.x, s.y, { sc: 2 });
    else if (s.k === 'cruz') { shadow(s.x, s.y + 8, 8); drawSpr(S.cruz, s.x, s.y - 2 + Math.round(Math.sin(G.time * 2 + s.x) * 1.5), { sc: 1.5 }); }
    else if (s.k === 'farinha') { longShadow(S.casaFarinha, s.x, s.y + S.casaFarinha.H * 0.8, 1.6); shadow(s.x, s.y + 9, 22); ctx.globalAlpha = s.cd > 0 ? 0.6 : 1; drawSpr(S.casaFarinha, s.x, s.y, { sc: 1.6 }); ctx.globalAlpha = 1; if (s.hold > 0) { ctx.strokeStyle = '#e8d9b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 18, -1.57, -1.57 + 6.283 * s.hold / 0.6); ctx.stroke(); } }
    else if (s.k === 'poco') { shadow(s.x, s.y + 5, 14); drawSpr(S.poco, s.x, s.y, { sc: 1.6 }); if (s.hold > 0) { ctx.strokeStyle = '#a8eaff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 16, -1.57, -1.57 + 6.283 * s.hold / 0.8); ctx.stroke(); } }
    else if (s.k === 'coronel') { shadow(s.x, s.y + 7, 10); drawSpr(S.coronel, s.x, s.y); if (s.cd <= 0) { ctx.fillStyle = '#f2c14e'; ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 16, 2, 5); ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y) - 9, 2, 2); } if (s.hold > 0) { ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 14, -1.57, -1.57 + 6.283 * s.hold / 0.8); ctx.stroke(); } }
    else if (s.k === 'altar') { ctx.globalAlpha = s.cd > 0 ? 0.45 : 1; drawSpr(S.altar, s.x, s.y, { sc: 2 }); ctx.globalAlpha = 1; if (s.hold > 0) { ctx.strokeStyle = '#e05545'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(s.x, s.y, 14, -1.57, -1.57 + 6.283 * s.hold / 1.2); ctx.stroke(); } }
  }
  for (const village of villages) for (const h of village.houses) if (onScreen(h.x, h.y, 40)) { longShadow(S.casa, h.x, h.y + S.casa.H, 2); shadow(h.x, h.y + 11, 34); drawSpr(S.casa, h.x, h.y, { sc: 2 }); }
  for (const g of graves) for (const t of g.list) if (onScreen(t.x, t.y, 20)) { longShadow(S.tumulo, t.x, t.y + S.tumulo.H / 2, 1); drawSpr(S.tumulo, t.x, t.y); }
  for (const village of villages) if (village.def > 0) for (const v of village.vill) if (v.hp > 0) { shadow(v.x, v.y + 5, 7); drawSpr(S.morador, v.x, v.y); ctx.fillStyle = '#000'; ctx.fillRect(Math.round(v.x - 7), Math.round(v.y - 9), 14, 3); ctx.fillStyle = '#86d46f'; ctx.fillRect(Math.round(v.x - 6), Math.round(v.y - 8), Math.round(12 * v.hp / 60), 1); }
  for (const tr of trails) { if (!onScreen(tr.x, tr.y, 10)) continue; ctx.globalAlpha = Math.min(0.6, tr.life / 1.5); ctx.fillStyle = '#c8463c'; ctx.fillRect(Math.round(tr.x) - 2, Math.round(tr.y), 4, 2); }
  ctx.globalAlpha = 1;
  {
  }
}
function drawWarn() {
  const w = G.warn; if (!w || G.time >= w.until) return;
  const pulse = 0.5 + 0.5 * Math.sin(G.time * 12), dx = Math.cos(w.ang), dy = Math.sin(w.ang);
  const k = Math.min((VW / 2 - 16) / Math.max(1e-6, Math.abs(dx)), (VH / 2 - 16) / Math.max(1e-6, Math.abs(dy))), x = VW / 2 + dx * k, y = VH / 2 + dy * k;
  const g = ctx.createRadialGradient(x, y, 0, x, y, 90); g.addColorStop(0, `rgba(224,85,69,${0.35 * pulse})`); g.addColorStop(1, 'rgba(224,85,69,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH);
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(w.ang);
  ctx.fillStyle = `rgba(224,85,69,${0.5 + 0.5 * pulse})`; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function drawMini() { // radar da região em volta do jogador; setas na borda para o que está longe e importa
  const W = 70, H = 46, x0 = VW - W - 6, y0 = VH - H - 6, RW = 2400, RH = RW * H / W;
  const ox = clamp(player.x - RW / 2, 0, MAPW - RW), oy = clamp(player.y - RH / 2, 0, MAPH - RH), kx = W / RW, ky = H / RH;
  const mx = x => x0 + (x - ox) * kx, my = y => y0 + (y - oy) * ky, inside = (x, y) => x >= ox && x <= ox + RW && y >= oy && y <= oy + RH;
  ctx.fillStyle = 'rgba(9,12,34,0.8)'; ctx.fillRect(x0 - 1, y0 - 1, W + 2, H + 2);
  ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, W, H); ctx.clip();
  ctx.strokeStyle = 'rgba(52,50,79,0.9)'; ctx.lineWidth = 1; for (const r of roads) { ctx.beginPath(); r.forEach((p, i) => i ? ctx.lineTo(mx(p.x), my(p.y)) : ctx.moveTo(mx(p.x), my(p.y))); ctx.stroke(); }
  ctx.fillStyle = '#22356a'; for (const a2 of acudes) if (inside(a2.x, a2.y) || Math.abs(a2.x - player.x) < RW) { ctx.beginPath(); ctx.ellipse(mx(a2.x), my(a2.y), Math.max(1, a2.rx * kx), Math.max(1, a2.ry * ky), 0, 0, 6.283); ctx.fill(); }
  ctx.strokeStyle = '#22356a'; ctx.lineWidth = 2; ctx.beginPath(); for (let y = oy - 100; y <= oy + RH + 100; y += 80) { const X = mx(riverX(y)), Y = my(y); y > oy - 100 ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke(); ctx.lineWidth = 1;
  const dot = (x, y, c, sz) => { ctx.fillStyle = c; ctx.fillRect(Math.round(mx(x) - sz / 2), Math.round(my(y) - sz / 2), sz, sz); };
  for (const v of villages) { ctx.strokeStyle = v.def > 0 ? '#86d46f' : '#8a8070'; ctx.strokeRect(Math.round(mx(v.x)) - 2.5, Math.round(my(v.y)) - 2.5, 5, 5); }
  for (const g of graves) dot(g.x, g.y, '#6a6a80', 3);
  for (const s2 of spots) { if (!inside(s2.x, s2.y)) continue; const c = s2.k === 'capela' ? (s2.charge > 5 ? '#9fc4ff' : null) : s2.k === 'fogo' ? (s2.cd <= 0 && G.rain <= 0 ? '#e8832a' : null) : s2.k === 'altar' ? (s2.cd <= 0 ? '#e05545' : null) : s2.k === 'cruz' ? '#fff6a0' : s2.k === 'poco' ? (s2.cd <= 0 ? '#5fd4ff' : null) : s2.k === 'farinha' ? (s2.cd <= 0 ? '#e8d9b0' : null) : s2.k === 'coronel' ? (s2.cd <= 0 ? '#ece6d3' : null) : null; if (c) dot(s2.x, s2.y, c, 1); }
  if (player.st.lamp) for (const e of enemies) if (e.alive && !e.d.prop && !e.d.seg && inside(e.x, e.y)) dot(e.x, e.y, 'rgba(224,85,69,0.7)', 1);
  for (const it of items) if (PWK.has(it.kind)) dot(it.x, it.y, '#e86a9a', 2);
  const blink = Math.sin(G.time * 8) > 0;
  ctx.restore();
  const important = [];
  for (const it of items) if (it.kind === 'bau') important.push([it.x, it.y, '#f2c14e']);
  for (const st of stars) important.push([st.x, st.y, '#fff6a0']);
  for (const c of critters) important.push([c.x, c.y, '#f2c14e']);
  for (const e of enemies) if (e.elite && e.alive) important.push([e.x, e.y, '#c08cff']);
  const dv = defV(); if (dv) important.push([dv.x, dv.y, '#86d46f']);
  if (G.boss && G.boss.alive) important.push([G.boss.x, G.boss.y, blink ? '#ff4a3d' : '#a02a20', 1]);
  for (const [x, y, c, big] of important) {
    if (inside(x, y)) { ctx.fillStyle = c; const sz = big ? 4 : 3; ctx.fillRect(Math.round(mx(x) - sz / 2), Math.round(my(y) - sz / 2), sz, sz); continue; }
    const cx = x0 + W / 2, cy = y0 + H / 2, a2 = Math.atan2(my(y) - cy, mx(x) - cx), k = Math.min((W / 2 - 2) / Math.max(1e-6, Math.abs(Math.cos(a2))), (H / 2 - 2) / Math.max(1e-6, Math.abs(Math.sin(a2))));
    const ex = cx + Math.cos(a2) * k, ey = cy + Math.sin(a2) * k; ctx.save(); ctx.translate(ex, ey); ctx.rotate(a2); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(2.5, 0); ctx.lineTo(-2, -2); ctx.lineTo(-2, 2); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  ctx.strokeStyle = '#33408a'; ctx.strokeRect(x0 - 1.5, y0 - 1.5, W + 3, H + 3);
  ctx.strokeStyle = 'rgba(244,231,182,0.35)'; ctx.strokeRect(Math.round(mx(camX)) + 0.5, Math.round(my(camY)) + 0.5, Math.round(VW * kx), Math.round(VH * ky));
  ctx.fillStyle = '#fff'; ctx.fillRect(Math.round(mx(player.x)) - 1, Math.round(my(player.y)) - 1, 2, 2);
}
function drawPools() {
  for (const p of pools) { if (!onScreen(p.x, p.y, 40)) continue; const a = Math.min(1, p.life / 0.4);
    ctx.globalAlpha = 0.55 * a; ctx.fillStyle = '#3a160c'; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r, p.r * 0.6, 0, 0, 6.283); ctx.fill(); ctx.globalAlpha = 1;
    for (let i = 0; i < p.r / 2; i++) { const a2 = Math.random() * 6.283, r = Math.random() * p.r * 0.8; ctx.fillStyle = Math.random() < 0.5 ? '#e8832a' : '#f2c14e'; ctx.fillRect(Math.round(p.x + Math.cos(a2) * r), Math.round(p.y + Math.sin(a2) * r * 0.6 - 2), 1, 2 + (Math.random() * 2 | 0)); } }
}
function drawItems() {
  for (const it of items) { if (!onScreen(it.x, it.y, 10)) continue; const bob = Math.round(Math.sin(it.t * 4)); const s = it.kind === 'xp' ? (it.v >= 5 ? S.cajuG : S.caju) : S[it.kind];
    if (it.kind === 'bau') circle(it.x, it.y, 9, 'rgba(242,193,78,0.25)');
    else if (PWK.has(it.kind)) circle(it.x, it.y, 10, 'rgba(232,106,154,0.3)'); drawSpr(s, it.x, it.y + bob); }
}
function drawEnemies() {
  const snakes = [];
  for (const e of enemies) {
    if (e.d.snake) { snakes.push(e); continue; } if (e.d.seg) continue;
    const sc = e.sc; if (!onScreen(e.x, e.y, 20 * sc)) continue;
    let s = S[e.d.spr]; if (e.type === 'morcego' && Math.sin(e.t * 14) > 0) s = S.morcego2; if (e.type === 'urubu' && Math.sin(e.t * 9) > 0) s = S.urubu2;
    s = frameOf(s, e.t * (e.ch > 0 ? 1.8 : 1), Math.abs(e.vx) + Math.abs(e.vy) > 3);
    ctx.globalAlpha = e.type === 'alma' ? 0.75 : 1;
    if (e.type === 'trapalhona' && e.ch > 0) { ctx.save(); ctx.translate(Math.round(e.x), Math.round(e.y + 2)); ctx.rotate(1.57); ctx.drawImage(e.flash > 0 ? s.w : s.n, -s.W / 2, -s.H / 2); ctx.restore(); continue; }
    let y = e.y - (e.dance > 0 ? Math.abs(Math.sin(e.t * 12)) * 3 : 0); if (e.type === 'saci') y -= Math.abs(Math.sin(e.t * 10)) * 2;
    if (e.type === 'alma' || e.type === 'iara') y -= Math.sin(e.t * 3) * 1.5;
    if (e.enter > 0) { const k = 1 - e.enter / 1.2; ctx.globalAlpha = k; shadow(e.x, e.y + s.H * sc / 2 - 1, s.W * sc * 0.6 * k); drawSpr(s, e.x, y + e.enter * 16, { sc: sc * (0.6 + 0.4 * k) }); ctx.globalAlpha = 1; continue; }
    if (e.type === 'corposeco') { shadow(e.x, e.y + s.H * sc / 2 - 1, s.W * sc * 0.6); ctx.save(); ctx.translate(Math.round(e.x), Math.round(y + s.H * sc / 2)); ctx.rotate(Math.sin(e.t * 2) * 0.07); ctx.drawImage(e.flash > 0 ? s.w : s.n, -s.W * sc / 2, -s.H * sc, s.W * sc, s.H * sc); if (e.raged) { ctx.globalAlpha = 0.25 + 0.2 * Math.sin(e.t * 10); ctx.drawImage(s.r, -s.W * sc / 2, -s.H * sc, s.W * sc, s.H * sc); ctx.globalAlpha = 1; } ctx.restore(); continue; }
    shadow(e.x, e.y + s.H * sc / 2 - 1, s.W * sc * 0.6);
    drawSpr(s, e.x, y, { sc, flip: (e.type === 'mula' && e.vx > 0) || ((e.type === 'curupira' || e.type === 'cuca') && e.vx < 0), white: e.flash > 0 || (e.wind > 0 && Math.sin(e.t * 40) > 0) });
    if (e.raged) { const fl = (e.type === 'mula' && e.vx > 0) || ((e.type === 'curupira' || e.type === 'cuca') && e.vx < 0); ctx.globalAlpha = 0.25 + 0.2 * Math.sin(e.t * 10); ctx.drawImage(fl ? s.rf : s.r, Math.round(e.x - s.W * sc / 2), Math.round(y - s.H * sc / 2), s.W * sc, s.H * sc); ctx.globalAlpha = 1; if (Math.random() < 0.15) part(e.x + rand(-8, 8), e.y - 10, 0, -30, 0.5, '#8f97c4', 2); }
    if (e.root > 0) { ctx.strokeStyle = 'rgba(240,234,214,0.7)'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(e.x - e.r) + 0.5, Math.round(y - e.r) + 0.5, Math.round(e.r * 2), Math.round(e.r * 2)); }
  }
  ctx.globalAlpha = 1;
  for (const h of snakes) {
    for (let i = h.segs.length - 1; i >= 0; i--) { const sg = h.segs[i]; drawSpr(S.boitataSeg, sg.x, sg.y, { sc: Math.max(1.1, 1.7 - i * 0.03), white: h.flash > 0 }); }
    const hs = S.boitataHead, k = 0.8;
    ctx.save(); ctx.translate(Math.round(h.x), Math.round(h.y)); ctx.rotate(h.ang); ctx.drawImage(h.flash > 0 ? hs.w : hs.n, Math.round(-hs.W * k / 2), Math.round(-hs.H * k / 2), Math.round(hs.W * k), Math.round(hs.H * k)); ctx.restore();
  }
}
function drawPlayer() {
  const s = frameOf(S[player.spr], player.t * 1.25, player.moving), bob = 0;
  shadow(player.x, player.y + 6, 9);
  const psc = G.giant > 0 ? 1.5 : 1;
  if (G.dive > 0) { ctx.strokeStyle = 'rgba(127,178,229,0.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(player.x, player.y + 4, 8 + Math.sin(G.time * 10) * 2, 4, 0, 0, 6.283); ctx.stroke(); return; }
  if (!(player.inv > 0 && Math.floor(player.t * 20) % 2)) drawSpr(s, player.x, player.y - bob - (psc - 1) * 7, { flip: player.fx < 0, sc: psc });
  if (G.cang > 0) drawSpr(S.cang, player.x, player.y - 9 * psc - bob);
  const w = 16, x = Math.round(player.x - w / 2), y = Math.round(player.y + 9);
  ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 1, w + 2, 4); ctx.fillStyle = '#4a1414'; ctx.fillRect(x, y, w, 2);
  ctx.fillStyle = '#e05545'; ctx.fillRect(x, y, Math.max(0, Math.round(w * player.hp / player.maxHp)), 2);
}
function drawProjs() {
  for (const p of projs) {
    if (p.k === 'pedra') { ctx.fillStyle = '#000'; ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4); ctx.fillStyle = '#c9c9d6'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 2, 2); }
    else if (p.k === 'chapeu') { ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y)); ctx.rotate(Math.round(p.t * 16 / 0.785) * 0.785); const s = S.chapeu; ctx.drawImage(s.n, -s.W * p.sc / 2, -s.H * p.sc / 2, s.W * p.sc, s.H * p.sc); ctx.restore(); }
    else if (p.k === 'rojao' && p.delay <= 0) { ctx.fillStyle = '#c8463c'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3); ctx.fillStyle = '#f0ead6'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); }
    else if (p.k === 'rede' && p.delay <= 0) { ctx.strokeStyle = '#f0ead6'; ctx.lineWidth = 1; ctx.strokeRect(Math.round(p.x) - 2.5, Math.round(p.y) - 2.5, 5, 5); }
    else if (p.k === 'pocao') drawSpr(S.pocao, p.x, p.y);
    else if (p.k === 'chama') drawSpr(S.chama, p.x, p.y);
    else if (p.k === 'barro') { circle(p.x, p.y, 2.5, '#7a5a3a'); ctx.fillStyle = '#9a7a5a'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y) - 1, 1, 1); }
  }
}
function drawFx() {
  for (const f of fx) if (f.k === 'slash') {
    ctx.save(); ctx.translate(Math.round(player.x), Math.round(player.y)); ctx.rotate(Math.atan2(f.dy, f.dx));
    ctx.globalAlpha = f.life / f.max; ctx.strokeStyle = f.ev ? '#ffd27a' : '#f0ead6'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(f.reach * 0.2, 0, f.reach * 0.65, -0.95, 0.95); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(f.reach * 0.2, 0, f.reach * 0.5, -0.7, 0.7); ctx.stroke();
    ctx.restore();
  }
  for (const f of fx) if (f.k === 'net') {
    ctx.globalAlpha = Math.min(1, f.life / 0.6) * 0.35; ctx.strokeStyle = '#f0ead6'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283);
    for (let i = -f.r + 3; i < f.r; i += 6) { const h = Math.sqrt(f.r * f.r - i * i); ctx.moveTo(f.x + i, f.y - h); ctx.lineTo(f.x + i, f.y + h); ctx.moveTo(f.x - h, f.y + i); ctx.lineTo(f.x + h, f.y + i); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function drawParts(glow) {
  for (const p of parts) { if (p.glow !== glow) continue; ctx.globalAlpha = Math.min(1, p.life / p.max * 1.5); ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size); }
  ctx.globalAlpha = 1;
}
function circle(x, y, r, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill(); }
function drawGlow() {
  { const lg = ctx.createRadialGradient(player.x, player.y, 4, player.x, player.y, 34); lg.addColorStop(0, 'rgba(255,220,150,0.12)'); lg.addColorStop(1, 'rgba(255,220,150,0)'); ctx.fillStyle = lg; ctx.fillRect(player.x - 34, player.y - 34, 68, 68); }
  const sf = flatW().find(w => w.id === 'sanfona');
  if (sf && !G.dawn) { const s = wstat('sanfona', sf.lvl, sf.ev), pul = 1 + Math.sin(G.time * 6) * 0.04;
    circle(player.x, player.y, s.rad * pul, 'rgba(127,178,229,0.07)');
    ctx.strokeStyle = 'rgba(159,208,255,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(player.x, player.y, s.rad * pul, 0, 6.283); ctx.stroke(); }
  for (const e of enemies) {
    if (!onScreen(e.x, e.y, 30)) continue;
    if (e.type === 'vagalume') circle(e.x, e.y, 7, 'rgba(220,255,120,0.2)');
    else if (e.type === 'mula') circle(e.x + (e.vx > 0 ? 7 : -7), e.y - 3, 6, 'rgba(255,130,40,0.22)');
    else if (e.d.seg || e.d.snake) circle(e.x, e.y, 13, 'rgba(95,212,255,0.16)');
  }
  for (const p of pools) circle(p.x, p.y, p.r * 1.5, `rgba(255,120,30,${0.2 * Math.min(1, p.life / 0.4)})`);
  for (const f of fx) if (f.k === 'boom') { const a = f.life / f.max; circle(f.x, f.y, f.r * (1.1 - a * 0.3), `rgba(255,180,60,${0.45 * a})`); }
  for (const w of waves) { if (w.r <= 0) continue; ctx.strokeStyle = `rgba(${w.col || '159,208,255'},${0.6 * (1 - w.r / w.max)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(w.x, w.y, w.r, 0, 6.283); ctx.stroke(); }
  for (const f of fx) if (f.k === 'chain') { const a = f.life / f.max; ctx.strokeStyle = f.ev ? `rgba(255,220,120,${a})` : `rgba(170,215,255,${a})`; ctx.lineWidth = 2; ctx.beginPath(); f.pts.forEach(([x, y], i) => i ? ctx.lineTo(x + rand(-2, 2), y + rand(-2, 2)) : ctx.moveTo(x, y)); ctx.stroke(); }
  for (const f of fx) if (f.k === 'arm') { const a = f.life / f.max; ctx.strokeStyle = `rgba(200,195,220,${a})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.tx, f.ty); ctx.stroke(); }
  for (const f of fx) if (f.k === 'cone') { const a = f.life / f.max; ctx.fillStyle = `rgba(242,193,78,${0.25 * a})`; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.arc(player.x, player.y, f.r * (1.1 - a * 0.3), f.a - f.arc, f.a + f.arc); ctx.closePath(); ctx.fill(); }
  for (const pg of pilgrims) if (onScreen(pg.x, pg.y, 30)) circle(pg.x, pg.y - 3, 9, 'rgba(220,230,255,0.25)');
  for (const f of fx) if (f.k === 'laco') { ctx.strokeStyle = `rgba(200,150,90,${f.life / f.max})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(f.x, f.y); ctx.stroke(); }
  for (const f of fx) if (f.k === 'aboio') { const q = 1 - f.life / f.max; ctx.strokeStyle = `rgba(242,193,78,${1 - q})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(player.x, player.y, f.r * (0.2 + 0.8 * q), 0, 6.283); ctx.stroke(); }
  for (const s of spots) if (s.k === 'cruz' && onScreen(s.x, s.y, 40)) circle(s.x, s.y, 16, 'rgba(255,246,160,0.22)');
  for (const c of critters) if (onScreen(c.x, c.y, 30)) circle(c.x, c.y, 10, 'rgba(242,193,78,0.3)');
  for (const p of projs) if (p.k === 'chama') circle(p.x, p.y, 7, 'rgba(255,150,50,0.35)');
  for (const st of stars) { const k = Math.min(1, st.t / 1.4), sx = st.x + 140 * (1 - k), sy = st.y - 220 * (1 - k); ctx.strokeStyle = 'rgba(255,246,160,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + 30, sy - 46); ctx.stroke(); circle(sx, sy, 6, 'rgba(255,246,160,0.6)'); circle(st.x, st.y, 10 + 6 * Math.sin(G.time * 12), 'rgba(255,246,160,0.15)'); }
  if (G.finalT > 0) circle(player.x, player.y, 18 + Math.sin(G.time * 10) * 3, 'rgba(242,193,78,0.3)');
  for (const e of enemies) if (e.elite && onScreen(e.x, e.y, 30)) circle(e.x, e.y, e.r * 2.2, 'rgba(242,193,78,0.22)');
  for (const s of spots) if (onScreen(s.x, s.y, 50)) { if (s.k === 'fogo' && s.cd <= 0 && !(G.rain > 0)) circle(s.x, s.y, 30, 'rgba(255,140,40,0.25)'); if (s.k === 'capela' && s.charge > 5) circle(s.x, s.y, 26, 'rgba(180,210,255,0.14)'); }
}
function drawNum(n) {
  const k = n.crit ? 2 : 1, s = String(n.v), w = (s.length * 4 + 1) * k; let x = Math.round(n.x - w / 2); const y = Math.round(n.y - (k - 1) * 4);
  ctx.globalAlpha = Math.min(1, n.life / 0.25);
  for (const ch of s) { ctx.drawImage(n.set[ch], x, y, 5 * k, 7 * k); x += 4 * k; }
  ctx.globalAlpha = 1;
}
function drawJoy() {
  if (!joy) return; const dx = joy.x - joy.ox, dy = joy.y - joy.oy, l = Math.hypot(dx, dy), k = l > 18 ? 18 / l : 1;
  ctx.strokeStyle = 'rgba(244,231,182,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(joy.ox, joy.oy, 20, 0, 6.283); ctx.stroke();
  circle(joy.ox + dx * k, joy.oy + dy * k, 8, 'rgba(244,231,182,0.35)');
}
const lightC = document.createElement('canvas'), lightX = lightC.getContext('2d');
function nightAlpha() {
  const t = G.time; if (G.inf && t > 900) return 0.84;
  return t < 450 ? 0.7 + 0.1 * (t / 450) : t < 780 ? 0.8 : 0.8 - 0.42 * Math.min(1, (t - 780) / 120);
}
function drawLight() { // escuridão com "furos" de luz: jogador, fogueiras, explosões, chamas
  if (lightC.width !== VW || lightC.height !== VH) { lightC.width = VW; lightC.height = VH; }
  const L = lightX; L.globalCompositeOperation = 'source-over'; L.clearRect(0, 0, VW, VH);
  const a = nightAlpha() * (1 - 0.6 * (G.flash || 0));
  L.fillStyle = G.blood ? `rgba(36,0,8,${a})` : `rgba(4,6,22,${a})`; L.fillRect(0, 0, VW, VH);
  L.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r, k) => { const sx = x - camX, sy = y - camY; if (sx < -r || sy < -r || sx > VW + r || sy > VH + r) return; const g = L.createRadialGradient(sx, sy, 0, sx, sy, r); g.addColorStop(0, `rgba(0,0,0,${k})`); g.addColorStop(1, 'rgba(0,0,0,0)'); L.fillStyle = g; L.fillRect(sx - r, sy - r, r * 2, r * 2); };
  const lp = player.st.lamp || 0;
  hole(player.x, player.y, VW * 0.9, 0.55); hole(player.x, player.y, 115 + 25 * lp, 0.8);
  for (const p of pools) hole(p.x, p.y, p.r * 3.2, 0.75 * Math.min(1, p.life / 0.4));
  for (const s of spots) { if (s.k === 'fogo' && s.cd <= 0 && !(G.rain > 0)) hole(s.x, s.y, 80 + Math.sin(G.time * 9 + s.x) * 4, 0.85); else if (s.k === 'capela' && s.charge > 5) hole(s.x, s.y, 44, 0.45); else if (s.k === 'altar' && s.cd <= 0) hole(s.x, s.y - 6, 26, 0.6); else if (s.k === 'cruz') hole(s.x, s.y, 30, 0.45); }
  for (const f of fx) if (f.k === 'boom') hole(f.x, f.y, f.r * 2.6, 0.9 * f.life / f.max);
  for (const p of projs) if (p.k === 'chama' || p.k === 'rojao') hole(p.x, p.y, 26, 0.65);
  for (const e of enemies) { if (!e.alive || !onScreen(e.x, e.y, 30)) continue; if (e.type === 'vagalume') hole(e.x, e.y, 16, 0.5); else if (e.type === 'mula') hole(e.x, e.y - 3, 18, 0.5); else if (e.d.snake || e.d.seg) hole(e.x, e.y, 22, 0.55); else if (e.type === 'iara') hole(e.x, e.y, 22, 0.4); }
  for (const st of stars) hole(st.x, st.y, 50, 0.6);
  for (const fr of fires) hole(fr.x, fr.y, fr.r * 1.5, 0.8 * Math.min(1, fr.life / 2));
  for (const pg of pilgrims) hole(pg.x, pg.y, 22, 0.55);
  for (const c of carts) hole(c.x, c.y - 4, 34, 0.55);
  for (const c of critters) hole(c.x, c.y, 18, 0.5);
  if (G.dawn) hole(player.x, player.y, VW * 2, Math.min(1, G.dawn / 1.5));
  ctx.drawImage(lightC, 0, 0);
}
function drawAmbient() { // vaga-lumes e poeira flutuando
  const T = G.time; ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 16; i++) { const a = Math.max(0, Math.sin(T * 1.7 + i * 2.3)); if (a < 0.05) continue; const x = (((i * 173.3 + T * (5 + i % 4)) % (VW + 40)) + VW + 40) % (VW + 40) - 20 + Math.sin(T * 0.7 + i) * 10, y = ((i * 97.7) % VH) + Math.sin(T * 0.5 + i) * 14;
    ctx.fillStyle = `rgba(200,255,140,${a * 0.18})`; ctx.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); ctx.fillStyle = `rgba(220,255,160,${a * 0.9})`; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
  ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = 'rgba(200,190,160,0.22)';
  for (let i = 0; i < 22; i++) { const x = (((i * 61.7 - T * (3 + i % 3)) % VW) + VW) % VW, y = (((i * 37.1 + T * (2 + i % 2)) % VH) + VH) % VH; ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
}
function drawTitle() { // tela inicial: vaqueiro na fogueira, lua passando, visagens espiando
  const T = menuT, hz = Math.round(VH * 0.66);
  const sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#060919'); sky.addColorStop(1, '#1c2456'); ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, hz);
  for (let i = 0; i < 70; i++) { ctx.fillStyle = `rgba(236,230,211,${Math.max(0.06, 0.25 + 0.35 * Math.sin(T * 1.3 + i * 2.1))})`; ctx.fillRect((i * 89.7) % VW | 0, (i * 41.3) % (hz - 16) | 0, 1, 1); }
  const mt = (T * 0.006) % 1, mx = VW * (1.05 - mt * 1.1), my = 30 + Math.sin(mt * Math.PI) * -10 + 10;
  circle(mx, my, 24, 'rgba(244,231,182,0.10)'); circle(mx, my, 14, '#f4e7b6'); circle(mx - 4, my - 3, 3, '#d9c98f'); circle(mx + 5, my + 4, 2, '#d9c98f');
  const bt = (T % 13) / 13; if (bt < 0.3) drawSpr(Math.sin(T * 14) > 0 ? S.morcego2 : S.morcego, VW * (1.1 - bt * 4), my + 4 + Math.sin(bt * 30) * 5, { sc: 1.5 });
  ctx.fillStyle = '#10153a'; ctx.beginPath(); ctx.moveTo(0, hz); for (let x = 0; x <= VW + 16; x += 16) ctx.lineTo(x, hz - 22 - Math.sin(x * 0.012) * 14 - Math.sin(x * 0.031) * 6); ctx.lineTo(VW, hz); ctx.fill();
  ctx.fillStyle = '#141a40'; ctx.beginPath(); ctx.moveTo(0, hz); for (let x = 0; x <= VW + 16; x += 16) ctx.lineTo(x, hz - 8 - Math.sin(x * 0.02 + 1) * 7); ctx.lineTo(VW, hz); ctx.fill();
  ctx.fillStyle = '#121833'; ctx.fillRect(0, hz, VW, VH - hz);
  for (const [x, sc] of [[0.06, 3], [0.42, 1.6], [0.78, 2.6], [0.93, 1.8]]) drawSpr({ n: S.mandacaru.k, W: S.mandacaru.W, H: S.mandacaru.H }, VW * x, hz - S.mandacaru.H * sc / 2 + 3, { sc });
  const fx0 = Math.round(VW * 0.16), fy0 = hz + 40, fl = 1 + Math.sin(T * 13) * 0.08 + Math.sin(T * 7.3) * 0.06;
  const g = ctx.createRadialGradient(fx0, fy0, 0, fx0, fy0, 110 * fl); g.addColorStop(0, 'rgba(255,150,60,0.35)'); g.addColorStop(1, 'rgba(255,150,60,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(fx0 - 120, fy0 - 120, 240, 240); ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#5c3a1c'; ctx.fillRect(fx0 - 9, fy0 + 2, 18, 3); ctx.fillStyle = '#3a2414'; ctx.fillRect(fx0 - 7, fy0 + 4, 14, 2);
  for (const [c, w, h] of [['#c8463c', 8, 14], ['#e8832a', 6, 11], ['#f2c14e', 4, 7], ['#fff6a0', 2, 4]]) { const hh = h * fl + Math.sin(T * 17 + w) * 1.5; ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(fx0 - w, fy0 + 2); ctx.lineTo(fx0 + Math.sin(T * 9 + w) * 1.5, fy0 + 2 - hh); ctx.lineTo(fx0 + w, fy0 + 2); ctx.fill(); }
  for (let i = 0; i < 6; i++) { const ph = (T * 0.8 + i * 0.17) % 1; ctx.fillStyle = `rgba(255,200,90,${1 - ph})`; ctx.fillRect(Math.round(fx0 + Math.sin(i * 3 + T * 2) * 6 * ph), Math.round(fy0 - 6 - ph * 40), 1, 1); }
  drawSpr(S[player ? player.spr : 'vaqueiro'], fx0 + 26, fy0 - 9, { sc: 2.2, flip: true });
  for (let i = 0; i < 6; i++) { const side = i % 2, ex = side ? VW - 20 - (i * 23) % 70 : 34 + (i * 31) % 60 + VW * 0.32, ey = hz + 14 + (i * 19) % (VH - hz - 26); if (Math.sin(T * 0.9 + i * 1.9) < 0.35 || (side === 0 && ex < VW * 0.4)) continue; ctx.fillStyle = i % 3 ? '#ff4a3d' : '#f2c14e'; ctx.fillRect(Math.round(ex), Math.round(ey), 2, 2); ctx.fillRect(Math.round(ex + 6), Math.round(ey), 2, 2); }
  const v = ctx.createRadialGradient(fx0, fy0, 60, VW / 2, VH / 2, VW * 0.8); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
}
function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  if (mode === 'cutscene' && cut) { drawCut(); return; }
  const inRun = !!(G && player && mode !== 'menu' && mode !== 'chars' && mode !== 'shop' && mode !== 'ach' && mode !== 'stats' && mode !== 'figs');
  if (!inRun) { drawTitle(); return; }
  let cx, cy;
  cx = player.x; cy = player.y;
  const sh = inRun && mode === 'play' ? G.shake : 0;
  camX = Math.round(cx - VW / 2 + (Math.random() - 0.5) * sh * 2); camY = Math.round(cy - VH / 2 + (Math.random() - 0.5) * sh * 2);
  ctx.save(); ctx.translate(-camX, -camY);
  ctx.fillStyle = groundPat; ctx.fillRect(camX, camY, VW, VH);
  drawPatches(); drawBorder(); if (inRun) { drawRoads(); drawPuddles(); drawRiver(); drawWater(); drawTraps(); } drawDecor();
  if (inRun) { drawGround(); drawPools(); drawItems(); drawEnemies(); drawPilgrims(); drawCarts(); drawWhirls(); drawPlayer(); drawAllies(); drawProjs(); drawFx(); drawParts(false); }
  ctx.restore();
  drawLight();
  if (inRun) {
    ctx.save(); ctx.translate(-camX, -camY); ctx.globalCompositeOperation = 'lighter'; drawGlow(); drawParts(true); ctx.restore();
    ctx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.translate(-camX, -camY); for (const n of nums) drawNum(n); ctx.restore();
    if (G.blood) { ctx.fillStyle = 'rgba(150,10,20,0.16)'; ctx.fillRect(0, 0, VW, VH); }
    if (!G.inf && G.time > 780) { ctx.fillStyle = `rgba(255,150,80,${Math.min(1, (G.time - 780) / 120) * 0.14})`; ctx.fillRect(0, 0, VW, VH); }
    drawAmbient();
    if (G.rain > 0) { const a = Math.min(1, G.rain / 2, (30 - G.rain) / 2), T = G.time * 260; ctx.fillStyle = `rgba(20,30,60,${0.25 * a})`; ctx.fillRect(0, 0, VW, VH); ctx.strokeStyle = `rgba(160,190,240,${0.45 * a})`; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 0; i < 90; i++) { const x = (i * 97.3 + T * 0.25) % (VW + 20) - 10, y = (i * 53.7 + T) % (VH + 20) - 10; ctx.moveTo(Math.round(x), Math.round(y)); ctx.lineTo(Math.round(x - 2), Math.round(y + 6)); }
      ctx.stroke();
      ctx.strokeStyle = `rgba(180,205,245,${0.5 * a})`; for (let i = 0; i < 26; i++) { const ph = (G.time * 2.6 + i * 0.37) % 1, slot = Math.floor(G.time * 2.6 + i * 0.37), h1 = Math.sin(slot * 91.3 + i * 17.7) * 43758.5, h2 = Math.sin(slot * 12.9 + i * 78.2) * 24634.6; ctx.globalAlpha = 1 - ph; ctx.beginPath(); ctx.ellipse((h1 - Math.floor(h1)) * VW, (h2 - Math.floor(h2)) * VH, 1 + ph * 4, (1 + ph * 4) * 0.4, 0, 0, 6.283); ctx.stroke(); } ctx.globalAlpha = 1; }
    if (G.flash > 0) { ctx.fillStyle = `rgba(220,230,255,${G.flash * 0.45})`; ctx.fillRect(0, 0, VW, VH); }
    drawWarn(); drawMini();
    if (G.dawn) { ctx.fillStyle = `rgba(255,190,120,${Math.min(0.85, G.dawn / 2.6)})`; ctx.fillRect(0, 0, VW, VH); }
    if (G.hurtFlash > 0) { ctx.fillStyle = `rgba(200,40,40,${G.hurtFlash * 0.5})`; ctx.fillRect(0, 0, VW, VH); }
    drawJoy();
  }
}

/* ---------------- cenas de abertura e final ---------------- */
let cut = null;
const CUTS = {
  intro: { len: 9.5, lines: [[0, 'Era pra ser só mais uma viagem pelo sertão...'], [3.2, 'Mas a noite caiu, o cavalo fugiu e a lua ficou cheia.'], [6.4, 'Agora é aguentar até o sol nascer.']] },
  outro: { len: 8.5, lines: [[0, 'O galo cantou e o sol apontou no horizonte.'], [2.8, 'As visagens sumiram com a primeira luz.'], [5.6, 'Mais uma noite vencida no sertão.']] },
};
function startCut(kind, done) { bq.length = 0; clearTimeout(bannerT); $('#banner').classList.remove('on'); cut = { kind, t: 0, done }; mode = 'cutscene'; joy = null; hud(false); $('#cut-txt').textContent = ''; $('#cut').classList.add('on'); }
function endCut() { if (!cut) return; const d = cut.done; cut = null; $('#cut').classList.remove('on'); d(); }
function updCutText() { let t = ''; for (const [st, x] of CUTS[cut.kind].lines) if (cut.t >= st) t = x; const el = $('#cut-txt'); if (el.textContent !== t) el.textContent = t; }
function mixC(a, b, k) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)), A = p(a), B = p(b); return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',') + ')'; }
function drawCut() {
  const T = cut.t, out = cut.kind === 'outro', k = out ? Math.min(1, T / 5) : 0, hz = Math.round(VH * 0.62);
  const sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, mixC('#0d1230', '#5b6fb5', k)); sky.addColorStop(1, mixC('#212a62', '#f2a35a', k));
  ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, hz);
  if (!out) { circle(Math.round(VW * 0.78), 46, 16, '#f4e7b6'); for (let i = 0; i < 40; i++) { ctx.fillStyle = `rgba(236,230,211,${0.3 + 0.3 * Math.sin(T * 2 + i)})`; ctx.fillRect((i * 97) % VW, (i * 37) % (hz - 30), 1, 1); } }
  else circle(Math.round(VW * 0.7), Math.round(hz + 14 - k * 46), 20, '#ffd27a');
  ctx.fillStyle = mixC('#141a38', '#6b4a3a', k); ctx.beginPath(); ctx.moveTo(0, hz);
  for (let x = 0; x <= VW + 16; x += 16) ctx.lineTo(x, hz - 14 - Math.sin(x * 0.02) * 10 - Math.sin(x * 0.007) * 12);
  ctx.lineTo(VW, hz); ctx.fill();
  ctx.fillStyle = mixC('#1a2242', '#8a6a44', k); ctx.fillRect(0, hz, VW, VH - hz);
  for (const [x, sc] of [[0.12, 2], [0.3, 1.5], [0.86, 2.4], [0.64, 1.2]]) drawSpr(S.mandacaru, VW * x, hz - S.mandacaru.H * sc / 2 + 2, { sc });
  const walk = !out && T < 6, px = out ? VW * 0.45 : Math.min(VW * 0.45, -20 + T * (VW * 0.45 + 20) / 6);
  drawSpr(S[player ? player.spr : 'vaqueiro'], px, hz + 6 - (walk && Math.sin(T * 14) > 0 ? 2 : 0), { sc: 2.5 });
  if (!out && T > 4.5) for (let i = 0; i < 6; i++) { if (Math.sin(T * 3 + i * 1.7) > 0.6) continue; const ex = Math.round(VW * (0.6 + i * 0.065)), ey = hz + 20 + (i % 3) * 14; ctx.fillStyle = '#ff4a3d'; ctx.fillRect(ex, ey, 2, 2); ctx.fillRect(ex + 5, ey, 2, 2); }
  if (out) { ctx.globalAlpha = Math.max(0, 1 - T / 4); for (let i = 0; i < 5; i++) drawSpr(S.morcego, VW * (0.2 + i * 0.15) + T * 10, hz - 40 - T * (18 + i * 6), { sc: 2 }); ctx.globalAlpha = 1; }
  const v = ctx.createRadialGradient(VW / 2, VH / 2, VH * 0.3, VW / 2, VH / 2, VW * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, VW, VH);
  const fade = Math.min(1, T / 0.8, (CUTS[cut.kind].len - T) / 0.8); if (fade < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - Math.max(0, fade)})`; ctx.fillRect(0, 0, VW, VH); }
}

