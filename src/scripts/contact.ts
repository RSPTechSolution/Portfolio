// Contact form (spec §5 row 14, §9). Posts to Formspree; on failure keeps the
// user's input and offers a mailto: link. One request at a time per form.
export type ContactKind = 'recruiter' | 'client' | '';
export interface ContactData { name: string; email: string; message: string; kind: ContactKind }
type Field = keyof ContactData;

export const CONTACT_EMAIL = 'RATANP256@gmail.com';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContact(d: ContactData): { ok: boolean; errors: Partial<Record<Field, string>> } {
  const errors: Partial<Record<Field, string>> = {};
  if (!d.name.trim()) errors.name = 'Please add your name.';
  if (!EMAIL_RE.test(d.email.trim())) errors.email = 'Please add a valid email address.';
  if (!d.message.trim()) errors.message = 'Please add a short message.';
  if (d.kind !== 'recruiter' && d.kind !== 'client') errors.kind = 'Please choose recruiter or client.';
  return { ok: Object.keys(errors).length === 0, errors };
}

function read(form: HTMLFormElement): ContactData {
  const fd = new FormData(form);
  const s = (k: string) => String(fd.get(k) ?? '');
  return { name: s('name'), email: s('email'), message: s('message'), kind: s('kind') as ContactKind };
}

function setStatus(form: HTMLFormElement, text: string, withMail = false) {
  const status = form.querySelector<HTMLElement>('[data-status]');
  if (!status) return;
  status.textContent = text;
  if (withMail) {
    const a = document.createElement('a');
    a.href = `mailto:${CONTACT_EMAIL}`;
    a.textContent = CONTACT_EMAIL;
    status.append(' ', a);
  }
}

const inFlight = new WeakSet<HTMLFormElement>();

function timeoutSignal(ms: number): AbortSignal {
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

export async function submitContact(form: HTMLFormElement, fetchImpl: typeof fetch = fetch): Promise<'ok' | 'error' | 'invalid'> {
  if (inFlight.has(form)) return 'invalid';
  const data = read(form);
  const { ok, errors } = validateContact(data);
  form.querySelectorAll<HTMLElement>('[data-error-for]').forEach((el) => { el.textContent = errors[el.dataset.errorFor as Field] ?? ''; });
  if (!ok) { setStatus(form, 'Please fix the highlighted fields.'); return 'invalid'; }

  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  inFlight.add(form);
  if (button) button.disabled = true;
  setStatus(form, 'Sending…');
  try {
    const res = await fetchImpl(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: timeoutSignal(15_000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    setStatus(form, 'Thanks, your message is on its way.');
    return 'ok';
  } catch {
    setStatus(form, "Couldn't send. Email me at", true);
    return 'error';
  } finally {
    inFlight.delete(form);
    if (button) button.disabled = false;
  }
}
