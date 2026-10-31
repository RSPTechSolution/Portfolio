import { expect, test } from 'vitest';
import { formatIST } from '../../src/scripts/clock';

test('formatIST', () => expect(formatIST(new Date('2026-10-31T08:15:30Z'))).toBe('13:45:30 IST'));
test('formatIST past midnight', () => expect(formatIST(new Date('2026-10-31T19:00:05Z'))).toBe('00:30:05 IST'));
