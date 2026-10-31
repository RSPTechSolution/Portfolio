// Project filter chips with FLIP (spec §5 row 9).
export type ProjectFilter = 'all' | 'drupal' | 'backend' | 'ai' | 'vibe-coded';

export function filterProjects<T extends { tags: string[] }>(items: T[], filter: ProjectFilter): T[] {
  return filter === 'all' ? items : items.filter((i) => i.tags.includes(filter));
}

export function initProjectFilter(root: HTMLElement): void {
  const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const cards = [...root.querySelectorAll<HTMLElement>('[data-tags]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const f = chip.dataset.filter as ProjectFilter;
    chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    const show = new Set(filterProjects(cards.map((el) => ({ el, tags: (el.dataset.tags ?? '').split(' ') })), f).map((x) => x.el));
    cards.forEach((c) => { c.hidden = !show.has(c); });
    if (reduce) return;
    cards.filter((c) => !c.hidden).forEach((c) => {
      const a = first.get(c)!, b = c.getBoundingClientRect();
      const fromHidden = a.width === 0;
      c.animate(fromHidden
        ? [{ opacity: 0, transform: 'scale(.96)' }, { opacity: 1, transform: 'none' }]
        : [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }],
      { duration: 500, easing: 'cubic-bezier(.2,.7,.1,1)' });
    });
  }));
}
