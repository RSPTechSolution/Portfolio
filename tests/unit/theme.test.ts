import { expect, test } from 'vitest';
import { readTheme, writeTheme } from '../../src/scripts/theme';

test('readTheme defaults to day and survives throwing storage', () => {
  expect(readTheme(null)).toBe('day');
  expect(readTheme({ getItem: () => { throw new Error('denied'); } })).toBe('day');
  expect(readTheme({ getItem: () => 'night' })).toBe('night');
  expect(readTheme({ getItem: () => 'purple' })).toBe('day');
});

test('writeTheme swallows storage errors', () =>
  expect(() => writeTheme('night', { setItem: () => { throw new Error('denied'); } })).not.toThrow());
