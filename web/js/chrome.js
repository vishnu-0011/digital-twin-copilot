/**
 * Header menus (Tour, Demo, Settings) and the first-visit welcome.
 */

import { playClick } from './audio.js';

const $ = (id) => document.getElementById(id);
let deps = null; // { startTour(kind), dispatch, toast }

function closeMenus(except = null) {
  document.querySelectorAll('.hud-menu').forEach(m => {
    if (m === except) return;
    m.hidden = true;
    const btn = m.parentElement.querySelector('[aria-haspopup]');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  });
}

function wireMenu(buttonId, menuId) {
  const btn = $(buttonId), menu = $(menuId);
  if (!btn || !menu) return;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    playClick();
    const open = menu.hidden;
    closeMenus(menu);
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) menu.querySelector('button, select')?.focus();
  });
  menu.addEventListener('click', (e) => {
    // Menu items close the menu; form controls inside a row do not.
    if (e.target.closest('button[role="menuitem"]')) closeMenus();
  });
}

function showWelcome() {
  const w = $('welcome');
  if (!w) return;
  w.hidden = false;
  w.querySelector('.welcome-primary')?.focus();
}

function hideWelcome() {
  const w = $('welcome');
  if (w) w.hidden = true;
  try { localStorage.setItem('titan_welcomed', '1'); } catch { /* ignore */ }
}

export function initChrome(d) {
  deps = d;
  wireMenu('btn-tour-menu', 'menu-tour');
  wireMenu('btn-demo-menu', 'menu-demo');
  wireMenu('btn-settings', 'menu-settings');
  document.addEventListener('click', (e) => { if (!e.target.closest('.menu-wrap')) closeMenus(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenus();
    if (!$('welcome')?.hidden) hideWelcome();
  });

  $('menu-tour')?.querySelectorAll('[data-tour]').forEach(b => b.addEventListener('click', () => {
    playClick();
    deps.startTour(b.dataset.tour);
  }));

  $('btn-demo-fault')?.addEventListener('click', () => {
    playClick();
    const id = $('demo-machine').value;
    deps.dispatch('inject_fault', { machine_id: id, wear_level: 0.86 });
    deps.toast(`Demo: <b>${id}</b> aged to 86% wear. Watch the attention list.`, 'info');
    deps.plantChanged && deps.plantChanged();
    closeMenus();
  });

  document.querySelectorAll('.hud-menu [data-href]').forEach(b => b.addEventListener('click', () => {
    playClick();
    location.href = b.dataset.href;
  }));

  $('btn-welcome-again')?.addEventListener('click', () => { showWelcome(); });
  $('welcome')?.addEventListener('click', (e) => {
    const b = e.target.closest('[data-welcome]');
    if (b) {
      playClick();
      hideWelcome();
      if (b.dataset.welcome !== 'explore') deps.startTour(b.dataset.welcome);
    } else if (e.target.id === 'welcome') {
      hideWelcome();
    }
  });

  // First visit only, and not when a deep link already says what to show.
  const q = new URLSearchParams(location.search);
  let seen = false;
  try { seen = localStorage.getItem('titan_welcomed') === '1'; } catch { /* ignore */ }
  const deepLink = ['tour', 'forecast', 'view', 'machine', 'nowelcome'].some(k => q.has(k));
  if (!seen && !deepLink) setTimeout(showWelcome, 900);
}
