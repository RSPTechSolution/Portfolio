import { expect, test } from 'vitest';
import { findUnconfirmed } from '../../scripts/check-content';

test('verify blocks, draft is info', () => {
  const r = findUnconfirmed({ aiTools: [{ name: 'Cursor', use: 'x', verify: true }], projects: [{ id: 'd1', draft: true }] });
  expect(r.blocking).toHaveLength(1);
  expect(r.blocking[0]).toContain('Cursor');
  expect(r.info).toHaveLength(1);
});

test('clean content passes', () =>
  expect(findUnconfirmed({ aiTools: [{ name: 'X', use: 'y', verify: false }], projects: [] }).blocking).toEqual([]));
