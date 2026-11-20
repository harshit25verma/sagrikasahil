// "The Journey to Forever" — a very forgiving auto-run side-scroller.
// Logic runs in a virtual 400px-tall world scaled to the canvas (DPR aware).
const H = 400, GROUND = 332, DURATION = 25, SPEED = 240, L = DURATION * SPEED, SX = 110;
const GRAV = 1700, JUMP_V = -690;
const OBST = [900, 1700, 2500, 3300, 4100, 4900]; // widely spaced, never combined

const hash = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };

export class Game {
  constructor({ canvas, images, onHud, onMessage, onSfx, onFinish }) {
    Object.assign(this, { canvas, images, onHud, onMessage, onSfx, onFinish });
    this.ctx = canvas.getContext('2d');
    this.running = false; this.paused = false;
    this.items = this.buildItems();
    this.loop = this.loop.bind(this);
    this.resize = this.resize.bind(this);
    this.jump = this.jump.bind(this);
    this.ro = new ResizeObserver(this.resize); this.ro.observe(canvas.parentElement);
    canvas.addEventListener('pointerdown', (e) => { e.preventDefault(); this.jump(); });
    window.addEventListener('keydown', (e) => { if (this.running && (e.code === 'Space' || e.code === 'ArrowUp')) { e.preventDefault(); this.jump(); } });
    this.resize();
  }

  buildItems() {
    const list = [];
    for (let i = 0, d = 520; d < 5500; i++, d += 175) {
      const type = ['heart', 'heart', 'flower', 'heart', 'blessing'][i % 5];
      list.push({ type, x: d, y: GROUND - 70 - (Math.sin(i * 0.9) * 0.5 + 0.5) * 80, got: false, ph: i });
    }
    return list;
  }

  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(r.width * dpr); this.canvas.height = Math.round(r.height * dpr);
    this.scale = this.canvas.height / H; this.W = this.canvas.width / this.scale;
    this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    if (this.running) this.draw();
  }

  reset() {
    Object.assign(this, { t: 0, s: 0, y: 0, vy: 0, grounded: true, buffer: 0, inv: 0, hearts: 0, shake: 0, done: false, doneT: 0, msgT: 0, nearShown: false, parts: [] });
    this.items.forEach((i) => (i.got = false));
  }

  start() {
    this.reset(); this.running = true; this.paused = false; this.last = performance.now();
    this.resize(); this.onMessage('Let’s make our way to forever!', 2200);
    cancelAnimationFrame(this.raf); this.raf = requestAnimationFrame(this.loop);
  }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
  pause() { if (this.running && !this.done) this.paused = true; }
  resume() { this.paused = false; this.last = performance.now(); }

  jump() {
    if (!this.running || this.paused || this.done) return;
    this.buffer = 0.18; // jump buffering: taps slightly early still count
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.max(0, Math.min(0.05, (ts - this.last) / 1000)); this.last = ts;
    if (!this.paused) this.update(dt);
    this.draw();
    this.raf = requestAnimationFrame(this.loop);
  }

  update(dt) {
    if (!this.done) {
      this.t += dt; this.s = Math.min(1, this.t / DURATION) * L;
      if (this.t >= DURATION) { this.done = true; this.s = L; this.burst(SX + 50, GROUND - 90, 26); this.onSfx('finish'); }
    } else { this.doneT += dt; if (this.doneT > 1.4) { this.stop(); this.onFinish(); return; } }

    this.buffer = Math.max(0, this.buffer - dt); this.inv = Math.max(0, this.inv - dt); this.shake = Math.max(0, this.shake - dt); this.msgT = Math.max(0, this.msgT - dt);
    if (this.buffer > 0 && this.grounded && !this.done) { this.vy = JUMP_V; this.grounded = false; this.buffer = 0; this.onSfx('jump'); }
    if (!this.grounded) { this.vy += GRAV * dt; this.y += this.vy * dt; if (this.y >= 0) { this.y = 0; this.vy = 0; this.grounded = true; } }

    const wx = this.s + SX, feet = -this.y; // world x of Sahil, height above ground
    if (!this.done) {
      for (const ox of OBST) { // very forgiving hitbox: narrow, and only low to the ground
        if (this.inv <= 0 && Math.abs(ox + 24 - wx) < 26 && feet < 26) { this.inv = 1.1; this.shake = 0.25; this.onSfx('hit'); this.burst(SX, GROUND - 20, 6, '#E8C8D3'); }
      }
      for (const it of this.items) {
        if (it.got) continue;
        const dx = it.x - wx, dy = it.y - (GROUND - 60 + this.y);
        if (dx * dx + dy * dy < 46 * 46) {
          it.got = true; this.hearts++; this.burst(it.x - this.s, it.y, 8, it.type === 'blessing' ? '#C5A15B' : '#E8628A');
          this.onSfx(it.type === 'heart' ? 'heart' : 'flower');
          if (this.msgT <= 0) { this.msgT = 1.8; this.onMessage(it.type === 'heart' ? 'Spreading the love!' : 'A blessing collected!', 1400); }
        }
      }
      if (!this.nearShown && this.t / DURATION > 0.86) { this.nearShown = true; this.onMessage('The altar is just ahead!', 2200); }
    }
    this.parts.forEach((p) => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt; p.life -= dt; });
    this.parts = this.parts.filter((p) => p.life > 0);
    this.onHud({ hearts: this.hearts, remaining: Math.max(0, Math.ceil(DURATION - this.t)), progress: Math.min(1, this.t / DURATION) });
  }

  burst(x, y, n, color = '#C5A15B') {
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; this.parts.push({ x, y, vx: Math.cos(a) * (60 + hash(i + n) * 90), vy: Math.sin(a) * (60 + hash(i * 3) * 90) - 60, life: 0.8 + hash(i) * 0.5, c: color }); }
  }

  drawImg(name, x, y, w, h) { const i = this.images[name]; if (i) this.ctx.drawImage(i, x, y, w, h); }

  draw() {
    const c = this.ctx, W = this.W, s = this.s;
    c.save();
    if (this.shake > 0) c.translate(Math.sin(this.t * 90) * 3, 0);
    c.clearRect(-10, -10, W + 20, H + 20);
    // sky + distant garden (seamless tile, slow parallax)
    const bg = this.images.bg;
    if (bg) { const tw = 1200; let x = -((s * 0.2) % tw); for (; x < W; x += tw) c.drawImage(bg, x, 0, tw, H); }
    else { c.fillStyle = '#F2D6E2'; c.fillRect(0, 0, W, H); }
    // mid layer: flowering hedges
    const hp = 150, off = s * 0.55, first = Math.floor(off / hp);
    for (let i = first - 1; i < first + W / hp + 2; i++) {
      const x = i * hp - off, hh = 38 + hash(i) * 24;
      c.fillStyle = hash(i + 9) > 0.5 ? '#9DB88C' : '#8FAE7E'; c.beginPath(); c.ellipse(x + hp / 2, GROUND - 4, hp * 0.62, hh, 0, Math.PI, 0); c.fill();
      for (let k = 0; k < 4; k++) { c.fillStyle = ['#E8C8D3', '#E79AB0', '#C9BDE0', '#F6D9E0'][Math.floor(hash(i * 7 + k) * 4)]; c.beginPath(); c.arc(x + 25 + hash(i + k) * (hp - 50), GROUND - hh * (0.35 + hash(k + i * 3) * 0.55), 6, 0, 6.3); c.fill(); }
    }
    // ground
    const g = c.createLinearGradient(0, GROUND - 6, 0, H); g.addColorStop(0, '#A9C597'); g.addColorStop(1, '#86A877');
    c.fillStyle = g; c.fillRect(0, GROUND - 6, W, H - GROUND + 6);
    c.fillStyle = '#F4E4D0'; c.fillRect(0, GROUND + 6, W, 26);
    c.fillStyle = 'rgba(197,161,91,.55)'; for (let x = -((s % 60)); x < W; x += 60) c.fillRect(x, GROUND + 18, 28, 3);
    c.fillStyle = '#E8C8D3'; for (let x = -((s * 1) % 90); x < W; x += 90) { c.beginPath(); c.arc(x + 20, GROUND + 36 + hash(x) * 4, 3, 0, 6.3); c.fill(); }

    // finish arch + Sagrika
    const ax = L + SX - 60 - s;
    if (ax < W + 200) { this.drawImg('arch', ax - 40, GROUND - 262, 300 * 0.78, 340 * 0.78); this.drawImg('sagrika', ax + 150, GROUND - 128, 80, 128); }
    // obstacles
    for (const ox of OBST) { const x = ox - s; if (x > -80 && x < W + 80) this.drawImg('obstacle', x, GROUND - 52, 56, 56); }
    // collectibles
    for (const it of this.items) {
      if (it.got) continue; const x = it.x - s; if (x < -40 || x > W + 40) continue;
      const y = it.y + Math.sin(this.t * 3 + it.ph) * 5, sz = it.type === 'heart' ? 34 : 38;
      c.fillStyle = 'rgba(255,255,255,.3)'; c.beginPath(); c.arc(x, y, sz * 0.68, 0, 6.3); c.fill();
      this.drawImg(it.type, x - sz / 2, y - sz / 2, sz, sz);
    }
    // Sahil
    const run = this.grounded && !this.done ? Math.abs(Math.sin(this.t * 11)) * 5 : 0, sy = GROUND - 118 + this.y - run;
    c.fillStyle = 'rgba(112,45,61,.18)'; c.beginPath(); c.ellipse(SX, GROUND + 2, 28 - (-this.y) / 10, 6, 0, 0, 6.3); c.fill();
    c.save(); c.translate(SX, sy + 118); c.rotate(this.grounded ? Math.sin(this.t * 11) * 0.04 : -0.1);
    if (this.inv > 0 && Math.floor(this.inv * 12) % 2) c.globalAlpha = 0.45;
    this.drawImg('sahil', -37, -118, 74, 118); c.restore();
    // particles
    for (const p of this.parts) { c.globalAlpha = Math.max(0, Math.min(1, p.life)); c.fillStyle = p.c; c.beginPath(); c.arc(p.x, p.y, 3.5, 0, 6.3); c.fill(); }
    c.globalAlpha = 1; c.restore();
  }
}
