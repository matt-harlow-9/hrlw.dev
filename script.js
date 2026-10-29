/* hrlw.dev desktop behaviour. Progressive enhancement: the page works without this file. */
(() => {
  'use strict';

  const root = document.documentElement;
  const wide = matchMedia('(min-width: 701px)');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const wins = [...document.querySelectorAll('.win')];
  const chips = document.getElementById('chips');
  const menubar = document.querySelector('.menubar');
  const statusbar = document.querySelector('.statusbar');
  let z = 10;

  const isDesktop = () => wide.matches;
  const iconFor = (win) => document.querySelector(`.icons a[href="#${win.id}"]`);

  /* ---- clamp a window inside the visible desktop area ---- */
  function clamp(win) {
    if (!isDesktop() || win.hidden) return;
    const top = menubar.offsetHeight;
    const maxX = Math.max(0, innerWidth - win.offsetWidth);
    const maxY = Math.max(top, innerHeight - statusbar.offsetHeight - win.offsetHeight);
    place(win, Math.min(Math.max(0, num(win, '--x')), maxX), Math.min(Math.max(top, num(win, '--y') + top), maxY) - top);
  }
  const num = (win, v) => parseFloat(win.style.getPropertyValue(v)) || 0;
  function place(win, x, y) {
    win.style.setProperty('--x', x + 'px');
    win.style.setProperty('--y', y + 'px');
  }

  /* ---- stacking, open, close, minimise ---- */
  function front(win) {
    win.style.zIndex = ++z;
    wins.forEach((w) => w.classList.toggle('active', w === win));
  }
  function open(win, focus = true) {
    win.hidden = false;
    removeChip(win);
    clamp(win);
    front(win);
    if (focus) win.focus({ preventScroll: !isDesktop() ? false : true });
  }
  function close(win, returnFocus = true) {
    win.hidden = true;
    removeChip(win);
    win.classList.remove('active');
    const next = wins.filter((w) => !w.hidden).sort((a, b) => b.style.zIndex - a.style.zIndex)[0];
    if (next) front(next);
    const icon = iconFor(win);
    if (returnFocus && icon) icon.focus();
  }
  function minimise(win) {
    win.hidden = true;
    win.classList.remove('active');
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.dataset.for = win.id;
    chip.textContent = win.querySelector('.wintitle').textContent;
    chip.setAttribute('aria-label', 'Restore ' + chip.textContent);
    chip.addEventListener('click', () => open(win));
    chips.append(chip);
    const next = wins.filter((w) => !w.hidden)[0];
    if (next) front(next);
    chip.focus();
  }
  function removeChip(win) {
    chips.querySelectorAll(`[data-for="${win.id}"]`).forEach((c) => c.remove());
  }

  /* ---- set up each window ---- */
  wins.forEach((win, i) => {
    place(win, +win.dataset.x || 170, +win.dataset.y || 64);
    win.style.zIndex = ++z;

    const btns = win.querySelector('.winbtns');
    btns.append(
      button('_', 'Minimise ' + win.querySelector('.wintitle').textContent, 'min', () => minimise(win)),
      button('x', 'Close ' + win.querySelector('.wintitle').textContent, 'close', () => close(win))
    );

    win.addEventListener('pointerdown', () => front(win));
    win.addEventListener('focusin', () => front(win));
    win.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(win);
      } else if (e.target === win && isDesktop() && e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 48 : 16;
        const dx = { ArrowLeft: -step, ArrowRight: step }[e.key] || 0;
        const dy = { ArrowUp: -step, ArrowDown: step }[e.key] || 0;
        place(win, num(win, '--x') + dx, num(win, '--y') + dy);
        clamp(win);
      }
    });

    initDrag(win);
    if (win.hasAttribute('data-tabs')) initTabs(win);
  });

  function button(label, aria, cls, fn) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'winbtn ' + cls;
    b.textContent = label;
    b.setAttribute('aria-label', aria);
    b.addEventListener('click', fn);
    return b;
  }

  /* ---- dragging by the title bar (pointer events) ---- */
  function initDrag(win) {
    const bar = win.querySelector('.titlebar');
    let dx = 0, dy = 0, id = null;
    bar.addEventListener('pointerdown', (e) => {
      if (!isDesktop() || e.button !== 0 || e.target.closest('button')) return;
      id = e.pointerId;
      const r = win.getBoundingClientRect();
      dx = e.clientX - r.left;
      dy = e.clientY - r.top;
      bar.setPointerCapture(id);
      win.classList.add('dragging');
    });
    bar.addEventListener('pointermove', (e) => {
      if (e.pointerId !== id) return;
      const top = menubar.offsetHeight;
      place(win, e.clientX - dx, e.clientY - dy - top);
      clamp(win);
    });
    const end = (e) => {
      if (e.pointerId !== id) return;
      id = null;
      win.classList.remove('dragging');
    };
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  }

  /* ---- tabs: built from the .panel blocks inside a window ---- */
  function initTabs(win) {
    const body = win.querySelector('.winbody');
    const panels = [...body.querySelectorAll('.panel')];
    if (panels.length < 2) return;
    body.classList.add('tabbed');
    const list = document.createElement('div');
    list.className = 'tabbar';
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', 'Welcome sections');
    const tabs = panels.map((p, i) => {
      const t = document.createElement('button');
      t.type = 'button';
      t.className = 'tab';
      t.id = `${win.id}-tab${i}`;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', `${win.id}-panel${i}`);
      t.textContent = p.dataset.tab;
      p.id = `${win.id}-panel${i}`;
      p.setAttribute('role', 'tabpanel');
      p.setAttribute('aria-labelledby', t.id);
      t.addEventListener('click', () => select(i));
      t.addEventListener('keydown', (e) => {
        const n = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') select(0, true);
        else if (e.key === 'End') select(tabs.length - 1, true);
        else if (n) { e.preventDefault(); select((i + n + tabs.length) % tabs.length, true); }
      });
      list.append(t);
      return t;
    });
    function select(n, focus) {
      tabs.forEach((t, i) => {
        t.setAttribute('aria-selected', String(i === n));
        t.tabIndex = i === n ? 0 : -1;
        panels[i].hidden = i !== n;
      });
      if (focus) tabs[n].focus();
    }
    panels[0].before(list);
    select(0);
  }

  /* ---- icon links that point at windows ---- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const win = document.getElementById(a.getAttribute('href').slice(1));
    if (!win || !win.classList.contains('win')) return;
    a.addEventListener('click', (e) => {
      if (isDesktop()) e.preventDefault();
      open(win, true);
    });
  });

  /* ---- Trash easter egg ---- */
  const trash = document.getElementById('trash');
  trash.hidden = true;
  const jokes = [
    'Emptied! It was already empty, but it feels good.',
    'Still empty. The trash is very clean today.',
    'You have emptied the trash 3 times. It is starting to ask questions.',
    'A single lost semicolon floats by. You let it go.',
    'The trash is empty. Really. Go touch some grass.',
  ];
  let jn = 0;
  document.getElementById('trash-btn').addEventListener('click', () => {
    document.getElementById('trash-msg').textContent = jokes[jn++ % jokes.length];
  });

  /* ---- clock ---- */
  const clock = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    clock.dateTime = d.toISOString();
  };
  tick();
  setInterval(tick, 15000);

  /* ---- keep everything on screen ---- */
  const reclamp = () => wins.forEach(clamp);
  addEventListener('resize', reclamp);
  wide.addEventListener('change', reclamp);
  reclamp();
  front(wins[0]);
})();
