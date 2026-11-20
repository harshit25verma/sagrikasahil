// Screen navigation + Google Maps + sharing
export const ORDER = ['title', 'intro', 'gameintro', 'instructions', 'game', 'complete', 'invitation', 'closing'];
const hooks = { enter: {}, leave: {} };
let current = null;

export const getCurrent = () => current;
export const on = (id, type, fn) => { (hooks[type][id] ||= []).push(fn); };

export function show(id) {
  const next = document.getElementById(`screen-${id}`);
  if (!next || id === current) return;
  const prev = current;
  if (prev) {
    hooks.leave[prev]?.forEach((f) => f(id));
    document.getElementById(`screen-${prev}`)?.classList.remove('active');
  }
  current = id;
  document.body.dataset.screen = id;
  next.classList.add('active');
  next.scrollTop = 0;
  hooks.enter[id]?.forEach((f) => f(prev));
}
export const skipToInvitation = () => show('invitation');

/* ---- Google Maps ---- */
const VENUE = 'Evora Banquet, Britania Chowk, B-3, Lawrence Road, Keshav Puram, New Delhi 110035, India';
export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE)}`;
export function openMaps() {
  const w = window.open(MAPS_URL, '_blank', 'noopener');
  if (!w) location.href = MAPS_URL; // popup blocked (some in-app browsers)
}

/* ---- Sharing ---- */
export function siteUrl() { return location.origin + location.pathname; }
export async function share() {
  const url = siteUrl();
  const text = `You're invited to celebrate the wedding of Sagrika & Sahil on 12 December 2026!\n\nJoin us for a beautiful celebration.\n\n${url}`;
  if (navigator.share) {
    try { await navigator.share({ title: 'Sagrika & Sahil | A Journey to Forever', text }); return; }
    catch (e) { if (e && e.name === 'AbortError') return; }
  }
  const wa = `https://wa.me/?text=${encodeURIComponent(text)}`;
  const w = window.open(wa, '_blank', 'noopener');
  if (!w) location.href = wa;
}
