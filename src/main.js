import './style.css';
import * as nav from './navigation.js';
import * as audio from './audio.js';
import { Game } from './game.js';

const $ = (s) => document.querySelector(s);
const A = (p) => `${import.meta.env.BASE_URL}assets/${p}`;

/* falling petals (skipped for reduced motion) */
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const box = $('#petals');
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('i');
    p.style.cssText = `left:${Math.random() * 100}%;--s:${9 + Math.random() * 10}px;--d:${10 + Math.random() * 9}s;--delay:${-Math.random() * 14}s;--x:${(Math.random() - 0.5) * 120}px`;
    box.appendChild(p);
  }
}

/* sound toggle (starts muted; context is created only on this tap) */
const soundBtn = $('#sound');
audio.onChange((muted) => {
  soundBtn.setAttribute('aria-pressed', String(!muted));
  soundBtn.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
});
soundBtn.addEventListener('click', () => { audio.toggle().then(() => audio.sfx('tap')); });

/* game */
const files = { sahil: 'characters/sahil.svg', sagrika: 'characters/sagrika.svg', bg: 'backgrounds/game-background.svg', heart: 'game/heart.svg', flower: 'game/flower.svg', blessing: 'game/golden-blessing.svg', obstacle: 'game/obstacle.svg', arch: 'game/finish-arch.svg' };
const loadImg = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
const imagesReady = Promise.all(Object.entries(files).map(async ([k, f]) => [k, await loadImg(A(f))])).then(Object.fromEntries);

const hudHearts = $('#hud-hearts'), hudTime = $('#hud-time'), hudFill = $('#hud-fill'), hudMark = $('#hud-marker'), prog = $('#progress'), toast = $('#toast'), overlay = $('#pause-overlay'), pauseBtn = $('#pause');
let toastTimer, lastHud = {};
const hud = ({ hearts, remaining, progress }) => {
  if (hearts !== lastHud.hearts) hudHearts.textContent = hearts;
  if (remaining !== lastHud.remaining) hudTime.textContent = `00:${String(remaining).padStart(2, '0')}`;
  const pct = Math.round(progress * 1000) / 10;
  if (pct !== lastHud.pct) { hudFill.style.width = `${pct}%`; hudMark.style.left = `${pct}%`; prog.setAttribute('aria-valuenow', String(Math.round(pct))); }
  lastHud = { hearts, remaining, pct };
};
const message = (text, ms = 1500) => { toast.textContent = text; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), ms); };

let game = null;
imagesReady.then((images) => {
  game = new Game({ canvas: $('#game-canvas'), images, onHud: hud, onMessage: message, onSfx: audio.sfx, onFinish: () => nav.show('complete') });
  if (nav.getCurrent() === 'game') startGame();
});
function setPaused(p) {
  if (!game || !game.running) return;
  p ? game.pause() : game.resume();
  overlay.classList.toggle('hidden', !p);
  pauseBtn.setAttribute('aria-label', p ? 'Resume game' : 'Pause game');
}
function startGame() { lastHud = {}; toast.classList.remove('show'); overlay.classList.add('hidden'); game.start(); audio.sfx('start'); }

nav.on('game', 'enter', () => { if (game) startGame(); });
nav.on('game', 'leave', () => { game?.stop(); overlay.classList.add('hidden'); });
nav.on('complete', 'enter', () => audio.sfx('finish'));
nav.on('invitation', 'enter', (prev) => {
  audio.quiet(true);
  if (prev !== 'closing') audio.sfx('reveal');
  [...$('.invite').children].filter((c) => !c.classList.contains('corner')).forEach((c, i) => c.style.setProperty('--i', i));
});
nav.on('invitation', 'leave', () => audio.quiet(false));

/* clicks */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-go],[data-skip],[data-action]');
  if (!el) return;
  audio.sfx('tap');
  if (el.dataset.go) nav.show(el.dataset.go);
  else if (el.hasAttribute('data-skip')) nav.skipToInvitation();
  else if (el.dataset.action === 'maps') nav.openMaps();
  else if (el.dataset.action === 'share') nav.share();
  else if (el.dataset.action === 'resume') setPaused(false);
});
pauseBtn.addEventListener('click', () => setPaused(!game?.paused));

/* pause when the tab/app is hidden */
document.addEventListener('visibilitychange', () => {
  audio.suspend(document.hidden);
  if (document.hidden && nav.getCurrent() === 'game') setPaused(true);
});

/* block page scroll/zoom gestures inside the game viewport */
$('#game-box').addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

window.addEventListener('error', () => {}); // never surface errors to guests
nav.show('title');
