import { expect, test, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { createVisibility } from '../../src/scripts/visibility';
import { curveFor } from '../../src/scripts/pose';
import { findDeployGaps } from '../../scripts/check-content';
import { submitContact } from '../../src/scripts/contact';

test('render loop stays paused off-screen after the tab becomes visible again', () => {
  const v = createVisibility();
  v.setOnScreen(false);
  v.setHidden(true);
  v.setHidden(false);
  expect(v.active()).toBe(false);
  v.setOnScreen(true);
  expect(v.active()).toBe(true);
  v.setHidden(true);
  expect(v.active()).toBe(false);
});

test('the face (front) plane is never curved; only the background is', () => {
  expect(curveFor('front', 'night')).toBe(0);
  expect(curveFor('front', 'day')).toBe(0);
  expect(curveFor('back', 'night')).toBe(0.05);
});

test('production deploy gaps: missing résumé PDFs and Formspree id block', () => {
  const gaps = findDeployGaps({ resumes: ['/resumes/a.pdf', '/resumes/b.pdf'], exists: (p) => p.endsWith('a.pdf'), formspreeId: '' });
  expect(gaps).toHaveLength(2);
  expect(gaps.join(' ')).toContain('b.pdf');
  expect(gaps.join(' ')).toContain('PUBLIC_FORMSPREE_ID');
  expect(findDeployGaps({ resumes: ['/resumes/a.pdf'], exists: () => true, formspreeId: 'xyz' })).toEqual([]);
});

test('immutable caching applies only to hashed /_astro assets', () => {
  const cfg = JSON.parse(readFileSync('vercel.json', 'utf8')) as { headers: { source: string; headers: { key: string; value: string }[] }[] };
  const immutable = cfg.headers.filter((h) => h.headers.some((x) => /immutable/.test(x.value))).map((h) => h.source);
  expect(immutable).toEqual(['/_astro/(.*)']);
});

test('a hanging contact request times out and re-enables the form', async () => {
  vi.useFakeTimers();
  document.body.innerHTML = `<form action="/x"><input name=name value=A><input name=email value=a@b.co><textarea name=message></textarea>
    <input type=radio name=kind value=client checked><button type=submit>Send</button><p data-status></p></form>`;
  const f = document.querySelector('form')!;
  (f.elements.namedItem('message') as HTMLTextAreaElement).value = 'Hi';
  const hang = vi.fn((_u: string, init: RequestInit) => new Promise<Response>((_r, rej) => init.signal?.addEventListener('abort', () => rej(new Error('aborted')))));
  const p = submitContact(f, hang as unknown as typeof fetch);
  await vi.advanceTimersByTimeAsync(15_000);
  expect(await p).toBe('error');
  expect(f.querySelector('button')!.disabled).toBe(false);
  vi.useRealTimers();
});

test('success copy makes no promise Subodh has not made', async () => {
  document.body.innerHTML = `<form action="/x"><input name=name value=A><input name=email value=a@b.co><textarea name=message></textarea>
    <input type=radio name=kind value=client checked><button type=submit>Send</button><p data-status></p></form>`;
  const f = document.querySelector('form')!;
  (f.elements.namedItem('message') as HTMLTextAreaElement).value = 'Hi';
  await submitContact(f, vi.fn().mockResolvedValue(new Response('{}', { status: 200 })));
  expect(f.querySelector('[data-status]')!.textContent).toBe('Thanks, your message is on its way.');
});
