import { expect, test } from 'vitest';
import { touchPose, MAX_RX, MAX_RY } from '../../src/scripts/pose';
import { MOBILE_LAYOUT } from '../../src/scripts/clay-layouts';

test.each([[0, 0], [3.7, 0.4], [100, 1], [12, 5], [-4, -2]])('touchPose(t=%d, scroll=%d) stays inside the pose limits', (t, s) => {
  const p = touchPose(t, s);
  expect(Math.abs(p.ry)).toBeLessThanOrEqual(MAX_RY);
  expect(Math.abs(p.rx)).toBeLessThanOrEqual(MAX_RX);
  expect(p.fy).toBeLessThanOrEqual(0);
});

test('touchPose sways over time', () => expect(touchPose(0, 0).ry).not.toBeCloseTo(touchPose(3, 0).ry, 3));

test('mobile clay layout is small and stays inside a narrow viewport', () => {
  expect(MOBILE_LAYOUT.length).toBeLessThanOrEqual(4);
  MOBILE_LAYOUT.forEach(([, , x]) => expect(Math.abs(x)).toBeLessThanOrEqual(1.6));
});
