import { expect, test } from 'vitest';
import { clampPose } from '../../src/scripts/pose';

test.each([[0, 0], [1, 1], [0.5, 0.5], [1, 0], [-3, 7]])('clampPose(%d,%d) stays in bounds', (x, y) => {
  const p = clampPose(x, y);
  expect(Math.abs(p.ry)).toBeLessThanOrEqual(0.105);
  expect(Math.abs(p.rx)).toBeLessThanOrEqual(0.07);
  expect(Math.abs(p.fx)).toBeLessThanOrEqual(0.0263);
  expect(p.fy).toBeLessThanOrEqual(0);
});

test('centre is neutral', () => {
  const p = clampPose(0.5, 0.5);
  expect([p.ry, p.rx, p.fx, p.fy].map((v) => Math.abs(v))).toEqual([0, 0, 0, 0]);
});

test('right edge tilts right', () => expect(clampPose(1, 0.5).ry).toBeCloseTo(0.105));
