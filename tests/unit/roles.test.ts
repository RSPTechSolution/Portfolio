import { expect, test } from 'vitest';
import { parseRole, orderByRole } from '../../src/scripts/roles';

test.each([
  ['?role=drupal', 'drupal'],
  ['?role=DRUPAL', 'drupal'],
  ['?role=%20php%20', 'php'],
  ['?role=<script>', 'all'],
  ['?role=ai&role=php', 'ai'],
  ['', 'all'],
])('parseRole(%s)', (q, r) => expect(parseRole(q)).toBe(r));

test('orderByRole keeps unknown keys at end in original order', () =>
  expect(orderByRole([{ key: 'x' }, { key: 'b' }, { key: 'a' }], ['a', 'b']).map((i) => i.key)).toEqual(['a', 'b', 'x']));
