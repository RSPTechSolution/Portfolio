// Pointer → portrait pose (spec §6.2). Pure so it can be unit-tested without WebGL.
// The whole card tilts a little; the subject layer drifts against the background
// and never lifts above the frame bottom. Faces are never deformed.
export const MAX_RY = 0.105;
export const MAX_RX = 0.07;

export function clampPose(nx: number, ny: number): { ry: number; rx: number; fx: number; fy: number } {
  const x = Math.min(1, Math.max(0, nx)) - 0.5;
  const y = Math.min(1, Math.max(0, ny)) - 0.5;
  const ry = x * 2 * MAX_RY;
  const rx = y * 2 * MAX_RX;
  return { ry, rx, fx: ry * 0.25, fy: Math.min(0, -rx * 0.2) };
}

/** Night screen curve per layer. The subject (face) plane is always flat — spec §10. */
export function curveFor(layer: 'front' | 'back', theme: 'day' | 'night'): number {
  return layer === 'back' && theme === 'night' ? 0.05 : 0;
}

/** Touch devices have no pointer: tilt follows a slow idle sway plus scroll progress (0..1 through the hero). */
export function touchPose(t: number, scrollProgress: number) {
  const s = Math.min(1, Math.max(0, scrollProgress));
  return clampPose(0.5 + Math.sin(t * 0.35) * 0.35, 0.5 + s * 0.4 + Math.cos(t * 0.27) * 0.1);
}
