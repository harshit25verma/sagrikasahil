// Generates every illustration in public/assets (clean individual SVGs + og-image.png).
// Run: npm run assets
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OUT = 'public/assets';
const C = { pink: '#E8C8D3', lav: '#C9BDE0', cream: '#F7F0E5', burg: '#702D3D', gold: '#C5A15B', rose: '#E79AB0', deep: '#B84B6B', sage: '#A9BF98', sage2: '#7F9C6F', skin: '#E0AE88', ink: '#241519', hair: '#17101A' };
let seed = 11;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const R = (a, b) => a + rnd() * (b - a);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const pal = [C.pink, C.rose, C.lav, C.deep, '#F6D9E0', '#B9A5D8'];
const n1 = (n) => +n.toFixed(1);
const write = (f, s) => { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const svg = (vb, inner, extra = '') => { const [, , w, h] = vb.split(' '); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}" ${extra}>${inner}</svg>`; };

/* ---------- flowers & foliage ---------- */
const bloom = (x, y, r, c = pick(pal)) => {
  let p = '';
  for (let i = 0; i < 5; i++) { const a = (i * 72 * Math.PI) / 180; p += `<circle cx="${n1(x + Math.cos(a) * r * 0.6)}" cy="${n1(y + Math.sin(a) * r * 0.6)}" r="${n1(r * 0.55)}"/>`; }
  return `<g fill="${c}" stroke="#fff" stroke-opacity=".5" stroke-width="1">${p}</g><circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r * 0.3)}" fill="${C.gold}"/>`;
};
const leaf = (x, y, l, a) => `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(l)}" ry="${n1(l / 2.6)}" transform="rotate(${n1(a)} ${n1(x)} ${n1(y)})" fill="${pick([C.sage, C.sage2])}"/>`;
const cluster = (x, y, n, sp, r) => {
  let s = '';
  for (let i = 0; i < n; i++) s += leaf(x + R(-sp, sp), y + R(-sp * 0.6, sp * 0.6), r * 1.6, R(0, 180));
  for (let i = 0; i < n; i++) s += bloom(x + R(-sp, sp), y + R(-sp * 0.6, sp * 0.6), r * R(0.7, 1.3));
  return s;
};
const petals = (n, W, H) => { let s = ''; for (let i = 0; i < n; i++) { const x = R(10, W - 10), y = R(10, H - 10); s += `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="7" ry="4" transform="rotate(${n1(R(0, 180))} ${n1(x)} ${n1(y)})" fill="${pick([C.pink, C.rose, '#F6D9E0'])}" opacity=".75"/>`; } return s; };

const pav = (x, y, s, f) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${f}" stroke="${C.gold}" stroke-opacity=".55" stroke-width="2" opacity=".85"><rect x="-70" y="-60" width="140" height="60"/><path d="M-60 -60Q-60 -112 0 -112Q60 -112 60 -60Z"/><path d="M-34 0V-34Q-34 -50 -17 -50Q0 -50 0 -34V0ZM0 0V-34Q0 -50 17 -50Q34 -50 34 -34V0Z" fill="${C.pink}"/><path d="M0 -112V-134"/><circle cx="0" cy="-138" r="5" fill="${C.gold}"/></g>`;

const arch = (cx, by, w, h) => {
  let s = `<path d="M${cx - w / 2} ${by}V${by - h * 0.6}A${w / 2} ${h * 0.4} 0 0 1 ${cx + w / 2} ${by - h * 0.6}V${by}" fill="none" stroke="${C.sage2}" stroke-width="14" stroke-linecap="round"/>`;
  for (let i = 0; i < 30; i++) {
    const t = i / 29; let x, y;
    if (t < 0.3) { x = cx - w / 2; y = by - (t / 0.3) * h * 0.6; }
    else if (t > 0.7) { x = cx + w / 2; y = by - ((1 - t) / 0.3) * h * 0.6; }
    else { const a = Math.PI * (1 - (t - 0.3) / 0.4); x = cx + Math.cos(a) * (w / 2); y = by - h * 0.6 - Math.sin(a) * h * 0.4; }
    s += leaf(x + R(-8, 8), y + R(-8, 8), 14, R(0, 180)) + bloom(x + R(-8, 8), y + R(-8, 8), R(9, 15));
  }
  return s;
};

const mandapArt = (cx, by, w, h) => {
  const L = cx - w / 2, Rr = cx + w / 2, t = by - h;
  let s = `<rect x="${L - 14}" y="${by - 14}" width="${w + 28}" height="14" rx="5" fill="${C.gold}"/>`;
  s += `<rect x="${L - 8}" y="${t + 40}" width="16" height="${h - 54}" fill="${C.gold}"/><rect x="${Rr - 8}" y="${t + 40}" width="16" height="${h - 54}" fill="${C.gold}"/>`;
  s += `<path d="M${L} ${t + 46}Q${L + 46} ${by - 110} ${L + 16} ${by - 14}L${L - 8} ${by - 14}Z" fill="${C.pink}" opacity=".92"/><path d="M${Rr} ${t + 46}Q${Rr - 46} ${by - 110} ${Rr - 16} ${by - 14}L${Rr + 8} ${by - 14}Z" fill="${C.pink}" opacity=".92"/>`;
  s += `<path d="M${L - 24} ${t + 50}Q${cx} ${t - 54} ${Rr + 24} ${t + 50}L${Rr + 12} ${t + 72}Q${cx} ${t - 10} ${L - 12} ${t + 72}Z" fill="${C.burg}" stroke="${C.gold}" stroke-width="3"/>`;
  s += `<circle cx="${cx}" cy="${t - 6}" r="9" fill="${C.gold}"/>`;
  for (let i = 0; i < 12; i++) { const x = L - 10 + (i / 11) * (w + 20); s += bloom(x, t + 62 + Math.sin((i / 11) * Math.PI) * -26 + 20, R(8, 12)); }
  for (const x of [L + 30, Rr - 30]) s += `<path d="M${x} ${t + 80}V${t + 98}" stroke="${C.gold}" stroke-width="2"/><rect x="${x - 8}" y="${t + 98}" width="16" height="26" rx="5" fill="#F5D58C" stroke="${C.gold}" stroke-width="2"/>`;
  s += cluster(L - 6, by - 20, 5, 22, 11) + cluster(Rr + 6, by - 20, 5, 22, 11);
  return s;
};

/* ---------- full-screen scenes (portrait 600x1000) ---------- */
function scene({ sunset = false, mandap = false, big = false } = {}) {
  const [a, b, c] = sunset ? ['#C9BDE0', '#F3BFCB', '#F9D9B5'] : ['#DCD2EE', '#F2D6E2', '#F7F0E5'];
  let s = `<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9CCA6"/><stop offset="1" stop-color="#8FAE7E"/></linearGradient></defs><rect width="600" height="1000" fill="url(#sk)"/>`;
  if (sunset) s += `<circle cx="300" cy="500" r="170" fill="#FFE6B8" opacity=".55"/><circle cx="300" cy="500" r="95" fill="#FFF1D0" opacity=".8"/>`;
  s += pav(95, 560, 0.8, '#F3E3DC') + pav(515, 545, 0.95, '#F3E3DC');
  for (let i = 0; i < 9; i++) s += `<circle cx="${n1(i * 80 - 10 + R(-15, 15))}" cy="${n1(R(520, 575))}" r="${n1(R(45, 70))}" fill="${C.sage2}" opacity=".33"/>`;
  s += `<path d="M0 590Q150 545 300 585T600 570V1000H0Z" fill="url(#gr)"/><path d="M250 1000L350 1000L322 610L278 610Z" fill="#F4E4D0" opacity=".85"/>`;
  for (let i = 0; i < 7; i++) { s += cluster(R(0, 230), R(600, 660), 4, 26, 10) + cluster(R(370, 600), R(600, 660), 4, 26, 10); }
  if (mandap) s += mandapArt(300, big ? 760 : 700, big ? 400 : 300, big ? 420 : 320);
  else if (big) s += arch(300, 780, 400, 540);
  else s += arch(300, 650, 130, 150);
  s += cluster(60, 930, 12, 70, 20) + cluster(545, 945, 12, 70, 20) + cluster(300, 985, 8, 150, 14);
  s += cluster(30, 30, 9, 55, 16) + cluster(570, 30, 9, 55, 16) + cluster(300, 8, 6, 120, 12);
  s += petals(18, 600, 1000);
  return svg('0 0 600 1000', s, 'preserveAspectRatio="xMidYMid slice"');
}

/* ---------- characters (viewBox 200x320, front facing, neutral stylised bodies) ---------- */
const face = () => `<rect x="88" y="138" width="24" height="30" fill="${C.skin}"/><ellipse cx="54" cy="104" rx="6" ry="9" fill="${C.skin}"/><ellipse cx="146" cy="104" rx="6" ry="9" fill="${C.skin}"/><ellipse cx="100" cy="100" rx="47" ry="50" fill="${C.skin}"/><ellipse cx="70" cy="118" rx="9" ry="6" fill="#E98C94" opacity=".35"/><ellipse cx="130" cy="118" rx="9" ry="6" fill="#E98C94" opacity=".35"/><ellipse cx="80" cy="104" rx="6" ry="8" fill="${C.ink}"/><ellipse cx="120" cy="104" rx="6" ry="8" fill="${C.ink}"/><circle cx="82" cy="101" r="2.4" fill="#fff"/><circle cx="122" cy="101" r="2.4" fill="#fff"/><path d="M68 90q12-8 24-1M108 89q12-7 24 1" stroke="${C.hair}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M100 109q-3 6 0 8" stroke="#B9835F" stroke-width="2" fill="none" stroke-linecap="round"/>`;
const smile = `<path d="M86 124Q100 142 114 124Z" fill="#B5434F"/>`;
const hand = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.skin}"/>`;
const arm = (x, fill, up) => up
  ? `<g transform="rotate(${x > 100 ? -150 : 150} ${x > 100 ? 138 : 62} 176)"><rect x="${x > 100 ? 127 : 51}" y="176" width="22" height="78" rx="11" fill="${fill}" stroke="${C.gold}" stroke-width="2"/>${hand(x > 100 ? 138 : 62, 258)}</g>`
  : `<rect x="${x}" y="172" width="24" height="84" rx="12" fill="${fill}" stroke="${C.gold}" stroke-width="2"/>${hand(x + 12, 262)}`;
const feet = (c) => `<ellipse cx="78" cy="312" rx="20" ry="9" fill="${c}"/><ellipse cx="122" cy="312" rx="20" ry="9" fill="${c}"/>`;
const bindu = `<circle cx="100" cy="82" r="3" fill="#C23A55"/>`;
const earrings = `<circle cx="53" cy="124" r="4.5" fill="${C.gold}"/><path d="M53 128v8" stroke="${C.gold}" stroke-width="3"/><circle cx="147" cy="124" r="4.5" fill="${C.gold}"/><path d="M147 128v8" stroke="${C.gold}" stroke-width="3"/>`;
const longHair = `<path d="M50 100Q40 36 100 36Q160 36 150 100L166 262Q100 284 34 262Z" fill="${C.hair}"/>`;
const frontHair = `<path d="M52 104Q46 40 100 38Q154 40 148 104Q142 66 100 64Q58 66 52 104Z" fill="${C.hair}"/><path d="M100 40V64" stroke="${C.skin}" stroke-width="3"/>`;
const locks = `<path d="M52 100Q40 170 46 240L68 240Q60 170 64 120Z" fill="${C.hair}"/><path d="M148 100Q160 170 154 240L132 240Q140 170 136 120Z" fill="${C.hair}"/>`;

const sahil = () => `${feet('#5B2A33')}<rect x="68" y="276" width="26" height="36" rx="10" fill="#EFE3CD"/><rect x="106" y="276" width="26" height="36" rx="10" fill="#EFE3CD"/>${arm(36, '#F4EAD6')}${arm(140, '#F4EAD6')}<path d="M58 166Q100 148 142 166L150 292Q100 304 50 292Z" fill="#F4EAD6" stroke="${C.gold}" stroke-width="2.5"/><path d="M58 166L90 160L96 296L52 292Z" fill="${C.burg}"/><path d="M90 160L96 296" stroke="${C.gold}" stroke-width="3" stroke-dasharray="6 4"/><g fill="${C.gold}"><circle cx="118" cy="190" r="3.5"/><circle cx="118" cy="214" r="3.5"/><circle cx="118" cy="238" r="3.5"/><circle cx="118" cy="262" r="3.5"/></g><path d="M84 158Q100 148 116 158L112 172Q100 180 88 172Z" fill="#F4EAD6" stroke="${C.gold}" stroke-width="2"/>${face()}<path d="M54 106Q56 152 100 154Q144 152 146 106Q138 130 100 128Q62 130 54 106Z" fill="${C.hair}"/><path d="M80 124Q100 114 120 124Q100 130 80 124Z" fill="${C.hair}"/><path d="M90 134Q100 146 110 134Z" fill="#B5434F"/><path d="M52 100Q44 42 100 40Q156 42 148 100Q142 72 118 66Q100 76 70 68Q56 78 52 100Z" fill="${C.hair}"/>`;

const sagrika = () => `${longHair}<path d="M62 206L138 206L176 306L24 306Z" fill="${C.burg}"/><path d="M27 294Q100 314 173 294L176 306Q100 322 24 306Z" fill="${C.gold}"/><g fill="${C.gold}" opacity=".8"><circle cx="70" cy="250" r="3"/><circle cx="100" cy="270" r="3"/><circle cx="130" cy="250" r="3"/><circle cx="100" cy="230" r="3"/></g>${arm(40, C.burg)}${arm(136, C.burg)}<path d="M62 168Q100 150 138 168L142 214L58 214Z" fill="${C.burg}" stroke="${C.gold}" stroke-width="2"/><path d="M64 164L96 160L152 252L120 264Z" fill="${C.pink}" stroke="${C.gold}" stroke-width="2"/>${face()}${smile}${earrings}${frontHair}${locks}<path d="M100 56V68" stroke="${C.gold}" stroke-width="2"/><circle cx="100" cy="72" r="4.5" fill="${C.gold}"/>${bindu}`;

const kanishka = () => `<path d="M50 100Q40 36 100 36Q160 36 150 100L164 232Q150 246 138 232Q126 246 114 232L86 232Q74 246 62 232Q50 246 36 232Z" fill="${C.hair}"/>${feet('#9C86C4')}<path d="M54 240L146 240L168 306L32 306Z" fill="#B7A8D6"/><path d="M34 296Q100 314 166 296L168 306L32 306Z" fill="${C.gold}"/>${arm(36, C.lav)}<path d="M62 168Q100 150 138 168L146 250L54 250Z" fill="${C.lav}" stroke="${C.gold}" stroke-width="2"/>${arm(138, C.lav, true)}<path d="M64 164L96 160L148 250L112 262Z" fill="#E4DCF2" stroke="${C.gold}" stroke-width="2"/>${face()}${smile}${earrings}${frontHair}<path d="M52 100Q42 150 50 200L66 200Q60 150 64 120Z" fill="${C.hair}"/><path d="M148 100Q158 150 150 200L134 200Q140 150 136 120Z" fill="${C.hair}"/>${bindu}`;

const yash = () => `${feet('#4A3A2E')}<rect x="68" y="270" width="26" height="42" rx="10" fill="#EFE3CD"/><rect x="106" y="270" width="26" height="42" rx="10" fill="#EFE3CD"/>${arm(36, '#2E3A66')}${arm(138, '#2E3A66', true)}<path d="M58 166Q100 150 142 166L152 284L48 284Z" fill="#2E3A66" stroke="${C.gold}" stroke-width="2.5"/><path d="M84 158Q100 150 116 158L110 176Q100 184 90 176Z" fill="#2E3A66" stroke="${C.gold}" stroke-width="2"/><path d="M100 176V284" stroke="${C.gold}" stroke-width="2"/><g fill="${C.gold}"><circle cx="100" cy="196" r="3"/><circle cx="100" cy="222" r="3"/><circle cx="100" cy="248" r="3"/></g>${face()}${smile}<path d="M52 100Q44 40 100 38Q156 40 148 100Q142 70 112 62Q82 72 58 80Q54 88 52 100Z" fill="${C.hair}"/>`;

const chars = { sahil, sagrika, kanishka, yash };

/* ---------- write everything ---------- */
for (const [k, fn] of Object.entries(chars)) write(`characters/${k}.svg`, svg('0 0 200 320', fn()));

write('backgrounds/title-garden.svg', scene({ big: true }));
write('backgrounds/story-garden.svg', scene());
write('backgrounds/celebration-scene.svg', scene({ mandap: true, big: true }));
write('backgrounds/closing-garden.svg', scene({ sunset: true, big: true }));

// wedding-mandap (landscape 600x450, used as invitation art)
{
  let s = `<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9DFF2"/><stop offset="1" stop-color="#F7E6DD"/></linearGradient></defs><rect width="600" height="450" fill="url(#m)"/>${pav(90, 270, 0.7, '#F3E3DC')}${pav(520, 262, 0.8, '#F3E3DC')}<path d="M0 300Q150 270 300 295T600 290V450H0Z" fill="#B9CCA6" opacity=".8"/>${mandapArt(300, 420, 330, 360)}${cluster(40, 400, 10, 50, 16)}${cluster(560, 400, 10, 50, 16)}${petals(10, 600, 450)}`;
  write('backgrounds/wedding-mandap.svg', svg('0 0 600 450', s, 'preserveAspectRatio="xMidYMid slice"'));
}
// game-background: seamless tile (period 400, 3 periods = 1200x400)
{
  let s = `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D5CAEA"/><stop offset=".6" stop-color="#F2D6E2"/><stop offset="1" stop-color="#F7EBE0"/></linearGradient></defs><rect width="1200" height="400" fill="url(#g)"/>`;
  for (let p = 0; p < 3; p++) {
    const o = p * 400;
    s += pav(o + 110, 235, 0.55, '#F3E3DC') + `<circle cx="${o + 300}" cy="230" r="46" fill="${C.sage2}" opacity=".3"/><circle cx="${o + 360}" cy="250" r="34" fill="${C.sage2}" opacity=".25"/><circle cx="${o + 40}" cy="250" r="34" fill="${C.sage2}" opacity=".25"/>`;
    s += `<path d="M${o} 400V288Q${o + 100} 262 ${o + 200} 288T${o + 400} 288V400Z" fill="#B9CCA6" opacity=".85"/>`;
    s += `<path d="M${o + 250} 288V215" stroke="${C.sage2}" stroke-width="8"/>` + cluster(o + 250, 210, 4, 18, 9) + `<path d="M${o + 330} 288V235" stroke="${C.sage2}" stroke-width="8"/>` + cluster(o + 330, 230, 3, 14, 8);
  }
  write('backgrounds/game-background.svg', svg('0 0 1200 400', s, 'preserveAspectRatio="none"'));
}

/* game objects */
write('game/heart.svg', svg('0 0 64 64', `<path d="M32 56C10 40 4 28 4 19A14 14 0 0 1 32 15A14 14 0 0 1 60 19C60 28 54 40 32 56Z" fill="#E8628A" stroke="#fff" stroke-width="3"/><ellipse cx="20" cy="22" rx="6" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 20 22)"/>`));
write('game/flower.svg', svg('0 0 64 64', bloom(32, 32, 26, '#F4B6C8') + `<circle cx="32" cy="32" r="6" fill="${C.gold}"/>`));
{
  let p = ''; for (let i = 0; i < 8; i++) p += `<ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(${i * 45} 32 32)" fill="${C.gold}" stroke="#fff3c9" stroke-width="1.5"/>`;
  write('game/golden-blessing.svg', svg('0 0 64 64', `${p}<circle cx="32" cy="32" r="10" fill="${C.burg}" stroke="#fff3c9" stroke-width="2"/><circle cx="29" cy="29" r="3" fill="#fff" opacity=".6"/>`));
}
write('game/obstacle.svg', svg('0 0 64 64', `${cluster(32, 22, 4, 12, 8)}<path d="M14 30H50L45 60H19Z" fill="#C97B63"/><rect x="11" y="26" width="42" height="8" rx="3" fill="#D98E76"/><path d="M16 44H48" stroke="${C.gold}" stroke-width="2.5"/>`));
write('game/finish-arch.svg', svg('0 0 300 340', mandapArt(150, 332, 240, 300)));

/* decorations */
{
  let s = `<path d="M4 4Q4 180 10 296M4 4Q180 4 296 10" fill="none" stroke="${C.gold}" stroke-width="2"/>`;
  for (let i = 0; i < 8; i++) { const t = i / 7, r = 20 - t * 10; s += leaf(24 + i * 34, 22 + R(-6, 10), r * 1.5, R(-30, 30)) + leaf(22 + R(-6, 10), 24 + i * 34, r * 1.5, R(60, 120)); }
  for (let i = 0; i < 8; i++) { const t = i / 7, r = 21 - t * 12; s += bloom(26 + i * 34, 24 + R(-4, 12), r) + (i ? bloom(24 + R(-4, 12), 26 + i * 34, r) : ''); }
  s += bloom(50, 50, 24, C.rose) + bloom(78, 38, 15, C.lav);
  write('decorations/floral-corner.svg', svg('0 0 300 300', s));
}
write('decorations/floral-divider.svg', svg('0 0 400 40', `<path d="M10 20H170M230 20H390" stroke="${C.gold}" stroke-width="2"/><path d="M200 31C186 22 180 16 180 11A6 6 0 0 1 200 9A6 6 0 0 1 220 11C220 16 214 22 200 31Z" fill="${C.burg}"/>${bloom(160, 20, 7, C.pink)}${bloom(240, 20, 7, C.lav)}${bloom(142, 20, 5, C.rose)}${bloom(258, 20, 5, C.rose)}`));
write('decorations/gold-ornament.svg', svg('0 0 240 40', `<g fill="none" stroke="${C.gold}" stroke-width="2.4" stroke-linecap="round"><path d="M10 20H92Q104 20 108 12Q112 4 120 12Q128 20 132 12M228 20H148Q136 20 132 28Q128 36 120 28Q112 20 108 28"/><path d="M120 12V28"/></g><circle cx="120" cy="20" r="4" fill="${C.gold}"/>`));
{
  let ring = ''; for (let i = 0; i < 26; i++) { const a = (i / 26) * Math.PI * 2; ring += leaf(150 + Math.cos(a) * 118, 150 + Math.sin(a) * 118, 13, (a * 180) / Math.PI + 90) + bloom(150 + Math.cos(a) * 118, 150 + Math.sin(a) * 118, i % 3 === 0 ? 12 : 8, pal[i % pal.length]); }
  const f = `font-family="Cormorant Garamond, Georgia, serif" font-style="italic" text-anchor="middle"`;
  write('decorations/ss-monogram.svg', svg('0 0 300 300', `<circle cx="150" cy="150" r="104" fill="${C.cream}" stroke="${C.gold}" stroke-width="3"/><circle cx="150" cy="150" r="96" fill="none" stroke="${C.gold}" stroke-width="1" opacity=".7"/>${ring}<text x="118" y="158" ${f} font-size="104" fill="${C.burg}">S</text><text x="182" y="202" ${f} font-size="104" fill="${C.burg}">S</text><text x="150" y="182" ${f} font-size="46" fill="${C.gold}">&amp;</text>`));
}

/* OG image 1200x630 */
{
  const ch = (k, x, y, h) => `<svg x="${x}" y="${y}" width="${(h * 200) / 320}" height="${h}" viewBox="0 0 200 320">${chars[k]()}</svg>`;
  let s = `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F3D6E0"/><stop offset=".55" stop-color="#F7F0E5"/><stop offset="1" stop-color="#DCD2EE"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/>`;
  s += cluster(30, 30, 9, 70, 22) + cluster(1170, 40, 9, 70, 22) + cluster(40, 610, 10, 90, 24) + cluster(1170, 610, 10, 90, 24) + petals(16, 1200, 630);
  s += `<rect x="22" y="22" width="1156" height="586" rx="22" fill="none" stroke="${C.gold}" stroke-width="3"/>`;
  s += ch('sahil', 90, 150, 420) + ch('sagrika', 290, 150, 420);
  s += `<svg x="760" y="40" width="170" height="170" viewBox="0 0 300 300">${fs.readFileSync(path.join(OUT, 'decorations/ss-monogram.svg'), 'utf8').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  const ff = 'font-family="Cormorant Garamond, Georgia, serif"';
  s += `<text x="845" y="270" text-anchor="middle" ${ff} font-size="26" letter-spacing="6" fill="${C.burg}" textLength="470" lengthAdjust="spacingAndGlyphs">A JOURNEY TO FOREVER</text>`;
  s += `<text x="850" y="372" text-anchor="middle" ${ff} font-style="italic" font-weight="600" font-size="66" fill="${C.burg}">Sagrika &amp; Sahil</text>`;
  s += `<path d="M640 410H1050" stroke="${C.gold}" stroke-width="3"/><path d="M845 425C835 418 830 413 830 409A5 5 0 0 1 845 408A5 5 0 0 1 860 409C860 413 855 418 845 425Z" fill="${C.burg}"/>`;
  s += `<text x="845" y="490" text-anchor="middle" ${ff} font-size="40" letter-spacing="4" fill="${C.burg}" textLength="420" lengthAdjust="spacingAndGlyphs">12 December 2026</text>`;
  s += `<text x="845" y="540" text-anchor="middle" ${ff} font-size="26" letter-spacing="4" fill="${C.gold}" textLength="300" lengthAdjust="spacingAndGlyphs">NEW DELHI, INDIA</text>`;
  await sharp(Buffer.from(svg('0 0 1200 630', s))).png().toFile(path.join(OUT, 'og-image.png'));
}
console.log('assets written to', OUT);
