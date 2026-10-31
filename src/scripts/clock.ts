export function formatIST(d: Date): string {
  return `${d.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour12: false })} IST`;
}

export function initClock(root: ParentNode = document): void {
  const els = [...root.querySelectorAll<HTMLElement>('[data-ist-clock]')];
  if (!els.length) return;
  const tick = () => els.forEach((el) => { el.textContent = formatIST(new Date()); });
  tick();
  setInterval(tick, 1000);
}
