// Colour-inverting cursor (spec §6.4). Only for fine pointers without reduced motion.
import { gsap } from 'gsap';

export type CursorMode = 'view' | 'link' | 'dot';

export function cursorMode(target: Element | null): CursorMode {
  if (!target) return 'dot';
  if (target.closest('[data-view]')) return 'view';
  if (target.closest('a, button, [role="button"], input, textarea, label, select')) return 'link';
  return 'dot';
}

export function initCursor(): void {
  const el = document.getElementById('cursor');
  const ok = matchMedia('(hover: hover) and (pointer: fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!el || !ok) return;
  document.documentElement.classList.add('has-cursor');
  const label = document.createElement('span');
  label.textContent = 'VIEW';
  el.replaceChildren(label);
  const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3' });
  addEventListener('pointermove', (e) => {
    xTo(e.clientX); yTo(e.clientY);
    el.dataset.mode = cursorMode(e.target as Element | null);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { el.dataset.mode = 'hidden'; });
}
