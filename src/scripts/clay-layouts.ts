// Floating-object layouts in world units (camera z = 10, fov 40).
export type ClayKind = 'torus' | 'sphere' | 'blob' | 'knob' | 'key' | 'led';
export type ClayItem = [kind: ClayKind, paletteIndex: number, x: number, y: number, z: number, scale?: number];

export const HERO_LAYOUT: ClayItem[] = [
  ['torus', 0, -5.4, 2.8, -2, 0.9], ['knob', 4, 5.4, 3, -2], ['sphere', 1, 0.8, -3.7, -2, 0.8],
  ['key', 2, -5.2, -2.6, -1], ['blob', 3, 6, -2.4, -1, 0.75], ['led', 0, -1.4, 3.9, -3],
];

// Portrait screens show roughly ±1.7 world units horizontally: keep four objects at the edges,
// above the headline and below the photo, so they never sit on top of text.
export const MOBILE_LAYOUT: ClayItem[] = [
  ['torus', 0, -1.6, 3.45, -2, 0.6], ['knob', 4, 1.6, 3.1, -2, 0.55],
  ['sphere', 1, 1.5, -3.4, -2, 0.6], ['key', 2, -1.5, -3.2, -1, 0.6],
];
