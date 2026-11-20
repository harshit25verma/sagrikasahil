// Validates asset paths, the asset manifest, OG image size and wedding-copy spelling.
import fs from 'fs';
import path from 'path';
let bad = 0;
const fail = (m) => { console.error('✗', m); bad++; };
const MANIFEST = ['characters/sahil.svg','characters/sagrika.svg','characters/kanishka.svg','characters/yash.svg','backgrounds/title-garden.svg','backgrounds/story-garden.svg','backgrounds/game-background.svg','backgrounds/wedding-mandap.svg','backgrounds/celebration-scene.svg','backgrounds/closing-garden.svg','game/heart.svg','game/flower.svg','game/golden-blessing.svg','game/obstacle.svg','game/finish-arch.svg','decorations/floral-corner.svg','decorations/floral-divider.svg','decorations/ss-monogram.svg','decorations/gold-ornament.svg','og-image.png'];
MANIFEST.forEach((f) => fs.existsSync(`public/assets/${f}`) || fail(`missing manifest asset ${f}`));

const sources = ['index.html', ...fs.readdirSync('src').map((f) => `src/${f}`), 'scripts/build-assets.mjs'];
const re = /(?:\/assets\/|assets\/)([\w\-./]+\.(?:svg|png))/g;
for (const f of sources) { const t = fs.readFileSync(f, 'utf8'); for (const m of t.matchAll(re)) fs.existsSync(`public/assets/${m[1]}`) || fail(`${f}: broken path ${m[0]}`); }
// files referenced from JS via template/relative names
for (const m of fs.readFileSync('src/main.js', 'utf8').matchAll(/'((?:characters|backgrounds|game)\/[\w-]+\.svg)'/g)) fs.existsSync(`public/assets/${m[1]}`) || fail(`main.js: broken path ${m[1]}`);

const png = fs.readFileSync('public/assets/og-image.png');
const w = png.readUInt32BE(16), h = png.readUInt32BE(20);
(png.subarray(1, 4).toString() === 'PNG' && w === 1200 && h === 630) ? console.log(`✓ og-image.png is a real PNG, ${w}x${h}`) : fail(`og-image wrong: ${w}x${h}`);

const text = sources.filter((f) => f.endsWith('.html') || f.startsWith('src/')).map((f) => fs.readFileSync(f, 'utf8')).join('\n');
/sagrlka/i.test(text) && fail('misspelling "Sagrlka" (lowercase L) found');
for (const s of ['SATURDAY, 12 DECEMBER 2026','Reception of Baraat — 7:00 PM','Dinner — 8:00 PM','Evora Banquet','Britania Chowk, B-3,','Lawrence Road, Keshav Puram,','New Delhi - 110035, India','VIEW ON MAPS','SHARE INVITATION','REVEAL THE INVITATION','SHARE WITH FAMILY &amp; FRIENDS','VIEW WEDDING VENUE']) text.includes(s) || fail(`copy missing: ${s}`);
/RSVP/i.test(text) && fail('RSVP text found');
console.log(bad ? `\n${bad} problem(s)` : '✓ all asset paths, manifest and wedding copy OK');
process.exit(bad ? 1 : 0);
