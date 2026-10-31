// Shared role switcher for the theme samples (throwaway).
// Markup contract:
//   [data-role-btn="drupal"]      buttons that switch role
//   [data-role-title]             text replaced with the role headline
//   [data-role-resume]            <a> whose label/href follow the role
//   [data-roles="drupal php"]     items highlighted for those roles (dimmed otherwise)
//   [data-role-list] > [data-skill="drupal"]  list reordered per role (FLIP animated)
export const ROLES = {
  all:     { title: 'Backend & Drupal Engineer', resume: 'All three résumés', order: ['drupal', 'php', 'python', 'redis', 'postgres', 'mysql', 'docker', 'aws', 'search', 'react'] },
  drupal:  { title: 'Drupal Developer · D7 → D11', resume: 'Drupal Developer résumé', order: ['drupal', 'search', 'php', 'mysql', 'redis', 'docker', 'python', 'postgres', 'aws', 'react'] },
  php:     { title: 'PHP Developer', resume: 'PHP Developer résumé', order: ['php', 'drupal', 'mysql', 'redis', 'docker', 'search', 'python', 'postgres', 'aws', 'react'] },
  backend: { title: 'Backend Engineer · Python / FastAPI', resume: 'Full-Stack Backend résumé', order: ['python', 'redis', 'postgres', 'docker', 'aws', 'php', 'drupal', 'mysql', 'search', 'react'] },
};

export function initRoles({ onChange } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const list = document.querySelector('[data-role-list]');

  function flipReorder(order) {
    if (!list) return;
    const items = [...list.children];
    const first = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
    order.forEach((key) => { const el = list.querySelector(`[data-skill="${key}"]`); if (el) list.appendChild(el); });
    if (reduce) return;
    items.forEach((el) => {
      const a = first.get(el), b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (!dx && !dy) return;
      el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.1,1)' });
    });
  }

  function apply(role, push = true) {
    const r = ROLES[role] ? role : 'all';
    const data = ROLES[r];
    document.querySelectorAll('[data-role-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roleBtn === r)));
    document.querySelectorAll('[data-role-title]').forEach((el) => {
      if (el.textContent === data.title) return;
      if (reduce) { el.textContent = data.title; return; }
      el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-0.3em)' }], { duration: 180, fill: 'forwards' }).onfinish = () => {
        el.textContent = data.title;
        el.animate([{ opacity: 0, transform: 'translateY(0.3em)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'forwards' });
      };
    });
    document.querySelectorAll('[data-role-resume]').forEach((a) => { a.querySelector('span').textContent = data.resume; });
    document.querySelectorAll('[data-roles]').forEach((el) => el.classList.toggle('is-dim', r !== 'all' && !el.dataset.roles.split(' ').includes(r)));
    flipReorder(data.order);
    if (push) { const u = new URL(location); r === 'all' ? u.searchParams.delete('role') : u.searchParams.set('role', r); history.replaceState(null, '', u); }
    onChange?.(r);
  }

  document.querySelectorAll('[data-role-btn]').forEach((b) => b.addEventListener('click', () => apply(b.dataset.roleBtn)));
  apply(new URLSearchParams(location.search).get('role') || 'all', false);
  return apply;
}
