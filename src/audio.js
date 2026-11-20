// Original synthesised audio (Web Audio API). Starts muted; the context is only created
// after an explicit tap on the sound toggle, so mobile autoplay rules are respected.
let ctx = null, master = null, musicBus = null, timer = null, step = 0, nextT = 0;
let muted = true;
const listeners = new Set();

const PROG = [[261.63, 329.63, 392.0], [220.0, 261.63, 329.63], [174.61, 220.0, 261.63], [196.0, 246.94, 293.66]];
const PATTERN = [0, 1, 2, 1, 2, 1, 0, 2];

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(master);
  } catch { ctx = null; }
  return ctx;
}

function tone(freq, t, dur, { type = 'sine', vol = 0.15, bus } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(bus || master);
  o.start(t); o.stop(t + dur + 0.05);
}

function schedule() {
  if (!ctx || muted) return;
  while (nextT < ctx.currentTime + 0.8) {
    const ch = PROG[Math.floor(step / 8) % PROG.length];
    tone(ch[PATTERN[step % 8]] * 2, nextT, 1.3, { type: 'triangle', vol: 0.09, bus: musicBus });
    if (step % 8 === 0) ch.forEach((f) => tone(f, nextT, 3.2, { vol: 0.03, bus: musicBus }));
    if (step % 4 === 2) tone(ch[2] * 4, nextT + 0.2, 0.9, { vol: 0.022, bus: musicBus });
    nextT += 0.42; step++;
  }
}

export function isMuted() { return muted; }
export function onChange(fn) { listeners.add(fn); }

export async function setMuted(m) {
  muted = m;
  if (!m) {
    if (!ensure()) { muted = true; listeners.forEach((f) => f(muted, false)); return; } // graceful fallback: no audio support
    try { await ctx.resume(); } catch { /* ignore */ }
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.8, ctx.currentTime, 0.4);
    nextT = ctx.currentTime + 0.1;
    clearInterval(timer); timer = setInterval(schedule, 250); schedule();
  } else if (ctx) {
    master.gain.setTargetAtTime(0, ctx.currentTime, 0.25); // fade out
    clearInterval(timer);
  }
  listeners.forEach((f) => f(muted, true));
}
export const toggle = () => setMuted(!muted);

// Soften the music on the formal invitation
export function quiet(on) { if (ctx && musicBus) musicBus.gain.setTargetAtTime(on ? 0.3 : 0.55, ctx.currentTime, 0.5); }

export function suspend(hidden) {
  if (!ctx) return;
  if (hidden) ctx.suspend().catch(() => {}); else if (!muted) ctx.resume().catch(() => {});
}

const arp = (notes, gap, opts) => { const t = ctx.currentTime; notes.forEach((f, i) => tone(f, t + i * gap, opts.d || 0.5, opts)); };
export function sfx(name) {
  if (muted || !ctx) return;
  try {
    const t = ctx.currentTime;
    switch (name) {
      case 'tap': tone(660, t, 0.12, { type: 'triangle', vol: 0.12 }); break;
      case 'start': arp([523, 659, 784, 1047], 0.09, { type: 'triangle', vol: 0.13, d: 0.5 }); break;
      case 'heart': arp([880, 1175], 0.07, { vol: 0.12, d: 0.35 }); break;
      case 'flower': arp([988, 1319], 0.08, { vol: 0.11, d: 0.5 }); tone(1976, t + 0.08, 0.4, { vol: 0.03 }); break;
      case 'jump': {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.setValueAtTime(330, t); o.frequency.exponentialRampToValueAtTime(560, t + 0.18);
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.1, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25); break;
      }
      case 'hit': tone(220, t, 0.18, { type: 'triangle', vol: 0.09 }); break;
      case 'finish': arp([523, 659, 784, 1047, 1319, 1568], 0.13, { type: 'triangle', vol: 0.13, d: 1.1 }); break;
      case 'reveal': arp([523, 659, 784, 988, 1175, 1319, 1568, 2093], 0.11, { vol: 0.1, d: 1.4 }); break;
      default: break;
    }
  } catch { /* never let audio break the experience */ }
}
