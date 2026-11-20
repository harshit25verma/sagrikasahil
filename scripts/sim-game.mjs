// Headless engine test (no browser): runs the whole 25s game with a mocked canvas.
const noop = () => {};
const ctx = new Proxy({}, { get: (t, k) => (k === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop), set: () => true });
globalThis.performance ??= { now: () => Date.now() };
globalThis.window = { devicePixelRatio: 2, addEventListener: noop };
globalThis.ResizeObserver = class { observe() {} };
let t = 0; globalThis.requestAnimationFrame = (f) => { globalThis.__next = f; return 1; }; globalThis.cancelAnimationFrame = noop;
const { Game } = await import('../src/game.js');
const run = (strategy) => new Promise((resolve) => {
  const canvas = { width: 0, height: 0, getContext: () => ctx, addEventListener: noop, parentElement: { getBoundingClientRect: () => ({ width: 390, height: 292 }) } };
  const img = new Proxy({}, { get: () => ({}) }); 
  const log = { msgs: [], sfx: {}, maxHud: null };
  const g = new Game({ canvas, images: img, onHud: (h) => (log.maxHud = h), onMessage: (m) => log.msgs.push(m), onSfx: (n) => { if (n === 'jump' && strategy === 'never-tap') console.log('JUMP at t=', g.t.toFixed(2), 'buffer', g.buffer); log.sfx[n] = (log.sfx[n] || 0) + 1; }, onFinish: () => resolve({ ...log, t: g.t, hearts: g.hearts }) });
  g.start(); let ts = 0;
  for (let i = 0; i < 3000 && g.running; i++) { ts += 16.67; if (strategy === 'spam' && i % 20 === 0) g.jump(); globalThis.__next(ts); }
  if (g.running) resolve({ error: 'did not finish', t: g.t });
});
for (const s of ['never-tap', 'spam']) console.log(s, JSON.stringify(await run(s)));
