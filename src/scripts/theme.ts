// Day/night mode (spec §6.1). State lives on html[data-theme]; listeners get
// a `themechange` CustomEvent with detail { theme }.
export type Theme = 'day' | 'night';
export const THEME_KEY = 'sk-theme';

export function readTheme(storage: Pick<Storage, 'getItem'> | null): Theme {
  try { return storage?.getItem(THEME_KEY) === 'night' ? 'night' : 'day'; } catch { return 'day'; }
}

export function writeTheme(t: Theme, storage: Pick<Storage, 'setItem'> | null): void {
  try { storage?.setItem(THEME_KEY, t); } catch { /* storage blocked: theme still applies for this visit */ }
}

export function safeStorage(): Storage | null {
  try { return window.localStorage; } catch { return null; }
}

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'night' ? 'night' : 'day';
}

function paint(t: Theme) {
  const root = document.documentElement;
  root.dataset.theme = t;
  document.querySelectorAll<HTMLElement>('[data-power]').forEach((b) => {
    b.setAttribute('aria-pressed', String(t === 'night'));
    b.setAttribute('aria-label', t === 'night' ? 'Switch to day shift' : 'Switch to night shift');
  });
  document.querySelectorAll<HTMLElement>('[data-power-label]').forEach((el) => { el.textContent = t === 'night' ? 'Night shift' : 'Day shift'; });
  writeTheme(t, safeStorage());
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: t } }));
}

let running: Promise<void> | null = null;
let latest: Theme | null = null;

async function transition(t: Theme, from?: { x: number; y: number }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce || !from) { paint(t); return; }
  const end = Math.hypot(Math.max(from.x, innerWidth - from.x), Math.max(from.y, innerHeight - from.y));
  const vt = document.startViewTransition(() => paint(t));
  try {
    await vt.ready;
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${from.x}px ${from.y}px)`, `circle(${end}px at ${from.x}px ${from.y}px)`] },
      { duration: 900, easing: 'cubic-bezier(.7,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
    );
    await vt.finished;
  } catch { /* transition skipped: paint already ran */ }
}

/** Serialised: while a transition runs, only the most recent request is applied afterwards. */
export function setTheme(t: Theme, from?: { x: number; y: number }): Promise<void> {
  latest = t;
  if (running) return running;
  running = (async () => {
    while (latest !== null && latest !== currentTheme()) {
      const next = latest;
      await transition(next, from);
    }
    latest = null;
    running = null;
  })();
  return running;
}

/** Target of the next toggle: the pending request if any, else the current theme. */
export function toggleTheme(from?: { x: number; y: number }): Promise<void> {
  const base = latest ?? currentTheme();
  return setTheme(base === 'day' ? 'night' : 'day', from);
}
