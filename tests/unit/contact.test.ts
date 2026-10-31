import { expect, test, vi } from 'vitest';
import { validateContact, submitContact } from '../../src/scripts/contact';

test('validateContact', () => {
  expect(validateContact({ name: '', email: 'bad', message: '', kind: '' }).errors).toMatchObject({
    name: expect.any(String), email: expect.any(String), message: expect.any(String), kind: expect.any(String),
  });
  expect(validateContact({ name: 'A', email: 'a@b.co', message: 'Hi', kind: 'client' }).ok).toBe(true);
  expect(validateContact({ name: '  ', email: 'a@b.co', message: 'Hi', kind: 'client' }).ok).toBe(false);
});

function form() {
  document.body.innerHTML = `<form action="/x"><input name=name value=A><input name=email value=a@b.co><textarea name=message></textarea>
    <input type=radio name=kind value=client checked><button type=submit>Send</button><p data-status aria-live=polite></p></form>`;
  const f = document.querySelector('form')!;
  (f.elements.namedItem('message') as HTMLTextAreaElement).value = 'Hi'; // typed by the user, not a default
  return f;
}

test('failed submit keeps input and single request', async () => {
  const f = form();
  const fetchImpl = vi.fn().mockRejectedValue(new Error('offline'));
  const [r1, r2] = await Promise.all([submitContact(f, fetchImpl), submitContact(f, fetchImpl)]);
  expect(fetchImpl).toHaveBeenCalledTimes(1);
  expect([r1, r2]).toContain('error');
  expect((f.elements.namedItem('message') as HTMLTextAreaElement).value).toBe('Hi');
  expect(f.querySelector('a[href^="mailto:"]')).not.toBeNull();
  expect(f.querySelector('button')!.disabled).toBe(false);
});

test('non-2xx is an error', async () => {
  const f = form();
  expect(await submitContact(f, vi.fn().mockResolvedValue(new Response('{}', { status: 500 })))).toBe('error');
});

test('success resets form and thanks the user', async () => {
  const f = form();
  expect(await submitContact(f, vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 })))).toBe('ok');
  expect(f.querySelector('[data-status]')!.textContent).toBe('Thanks, your message is on its way.');
  expect((f.elements.namedItem('message') as HTMLTextAreaElement).value).toBe('');
});
