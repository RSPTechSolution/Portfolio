// Expand switches for service modules (spec §5 row 11).
export function initToggles(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>('.switch[aria-expanded]').forEach((sw) => sw.addEventListener('click', () => {
    const open = sw.getAttribute('aria-expanded') !== 'true';
    sw.setAttribute('aria-expanded', String(open));
    sw.closest('[data-module]')?.classList.toggle('open', open);
  }));
}
