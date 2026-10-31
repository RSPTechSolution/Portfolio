// Role switching (spec §4). Talks to the page only through data-* hooks:
//   [data-role-btn]    buttons    [data-role-title]  role headline
//   [data-role-map]    JSON {role: text} (falls back to "all")
//   [data-role-resume] container of résumé links    [data-roles] dim when not listed
//   [data-role-list] > [data-skill]  reordered by role.skillOrder
import { roles } from '../content/data/roles';
import { ROLE_KEYS, type RoleKey } from '../content/schemas';

export function parseRole(search: string): RoleKey {
  const raw = new URLSearchParams(search).get('role');
  const key = (raw ?? '').trim().toLowerCase();
  return (ROLE_KEYS as readonly string[]).includes(key) ? (key as RoleKey) : 'all';
}

export function orderByRole<T extends { key: string }>(items: T[], order: string[]): T[] {
  const rank = (k: string) => { const i = order.indexOf(k); return i === -1 ? order.length : i; };
  return items.map((item, i) => ({ item, i })).sort((a, b) => rank(a.item.key) - rank(b.item.key) || a.i - b.i).map((x) => x.item);
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function reorderList(list: HTMLElement, order: string[]) {
  const children = [...list.querySelectorAll<HTMLElement>(':scope > [data-skill]')];
  const first = new Map(children.map((el) => [el, el.getBoundingClientRect()]));
  orderByRole(children.map((el) => ({ key: el.dataset.skill ?? '', el })), order).forEach(({ el }) => list.appendChild(el));
  if (reduced()) return;
  children.forEach((el) => {
    const a = first.get(el)!, b = el.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (dx || dy) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(.2,.7,.1,1)' });
  });
}

function renderResumes(box: HTMLElement, resumes: { href: string; label: string }[]) {
  box.replaceChildren(...resumes.map((r) => {
    const a = document.createElement('a');
    a.href = r.href;
    a.className = box.dataset.linkClass ?? 'btn';
    a.setAttribute('download', '');
    a.textContent = `↓ ${resumes.length > 1 ? r.label.replace(' résumé', '') : r.label}`;
    return a;
  }));
}

export function applyRole(key: RoleKey, opts: { push?: boolean } = {}): void {
  const role = roles.find((r) => r.key === key) ?? roles[0];
  const root = document.documentElement;
  root.dataset.role = role.key;
  document.querySelectorAll<HTMLElement>('[data-role-btn]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.roleBtn === role.key)));
  document.querySelectorAll<HTMLElement>('[data-role-title]').forEach((el) => { el.textContent = role.title; });
  document.querySelectorAll<HTMLElement>('[data-role-map]').forEach((el) => {
    const map = JSON.parse(el.dataset.roleMap ?? '{}') as Record<string, string>;
    el.textContent = map[role.key] ?? map.all ?? el.textContent;
  });
  document.querySelectorAll<HTMLElement>('[data-role-resume]').forEach((box) => renderResumes(box, role.resumes));
  document.querySelectorAll<HTMLElement>('[data-roles]').forEach((el) =>
    el.classList.toggle('is-dim', role.key !== 'all' && !(el.dataset.roles ?? '').split(' ').includes(role.key)));
  document.querySelectorAll<HTMLElement>('[data-role-list]').forEach((list) => reorderList(list, role.skillOrder));
  if (opts.push) {
    const url = new URL(location.href);
    if (role.key === 'all') url.searchParams.delete('role'); else url.searchParams.set('role', role.key);
    history.replaceState(null, '', url);
  }
  document.dispatchEvent(new CustomEvent('rolechange', { detail: { role: role.key } }));
}

export function initRoles(): void {
  document.querySelectorAll<HTMLElement>('[data-role-btn]').forEach((b) =>
    b.addEventListener('click', () => applyRole(b.dataset.roleBtn as RoleKey, { push: true })));
  applyRole(parseRole(location.search));
}
