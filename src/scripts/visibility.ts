// Render only when the element is on screen AND the tab is visible.
// Two separate flags: a tab switch must not wake a loop that is scrolled away.
export function createVisibility() {
  let onScreen = true;
  let hidden = typeof document !== 'undefined' ? document.hidden : false;
  return {
    setOnScreen(v: boolean) { onScreen = v; },
    setHidden(v: boolean) { hidden = v; },
    active: () => onScreen && !hidden,
  };
}

/** Wires a visibility tracker to an element; returns the tracker and a disconnect function. */
export function watchVisibility(el: Element) {
  const v = createVisibility();
  const io = new IntersectionObserver(([e]) => v.setOnScreen(e.isIntersecting));
  io.observe(el);
  const onVis = () => v.setHidden(document.hidden);
  document.addEventListener('visibilitychange', onVis);
  return { v, stop: () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis); } };
}
