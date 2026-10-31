// Floating clay/rubber objects behind the hero (spec §6.3).
// Day: matte clay. Night: glossy rubber with an amber rim light. Materials lerp on theme change.
import * as THREE from 'three';
import { hasWebGL } from './portrait3d';
import { watchVisibility } from './visibility';
import type { Theme } from './theme';

import type { ClayItem, ClayKind } from './clay-layouts';
export { HERO_LAYOUT, MOBILE_LAYOUT } from './clay-layouts';

const PALETTE: Record<Theme, string[]> = {
  day: ['#ff4a1c', '#f6c445', '#a8c69f', '#f4b6a6', '#151411'],
  night: ['#ffb547', '#ff5a36', '#3a362f', '#2a2722', '#ede4d4'],
};
const ACCENT = '#ffb547';

function build(kind: ClayKind, mat: THREE.Material, accent: THREE.Material): THREE.Object3D {
  switch (kind) {
    case 'torus': return new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.4, 48, 96), mat);
    case 'sphere': return new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), mat);
    case 'blob': return new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 8), mat);
    case 'led': return new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#7cf2b0', emissive: '#7cf2b0', emissiveIntensity: 1.6, roughness: 0.3 }));
    case 'knob': {
      const g = new THREE.Group();
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 64), mat);
      const mark = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.34), accent);
      cap.position.y = 0.3; mark.position.set(0, 0.38, 0.22);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.5, 64), mat), cap, mark);
      return g;
    }
    case 'key': {
      const g = new THREE.Group();
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.42, 4, 1), mat);
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      base.rotation.y = Math.PI / 4; top.scale.y = 0.25; top.position.y = 0.2;
      g.add(base, top);
      return g;
    }
  }
}

export function mountClay(canvas: HTMLCanvasElement, layout: ClayItem[], theme: Theme): { setTheme(t: Theme): void; destroy(): void } | null {
  if (!hasWebGL()) return null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let renderer: THREE.WebGLRenderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse }); } catch { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 10;
  const hemi = new THREE.HemisphereLight('#ffffff', '#c9b9a6', 1.8);
  const key = new THREE.DirectionalLight('#fff3e2', 2.4); key.position.set(4, 6, 6);
  const rim = new THREE.DirectionalLight(ACCENT, 0); rim.position.set(-6, -2, -3);
  scene.add(hemi, key, rim);

  const accent = new THREE.MeshStandardMaterial({ color: ACCENT, emissive: ACCENT, emissiveIntensity: 0.6 });
  const mats: { m: THREE.MeshPhysicalMaterial; ci: number; target: THREE.Color }[] = [];
  const objects = layout.map(([kind, ci, x, y, z, s = 1], i) => {
    const m = new THREE.MeshPhysicalMaterial({ color: PALETTE[theme][ci], roughness: 0.8, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.6, clearcoat: 0.15 });
    mats.push({ m, ci, target: new THREE.Color(PALETTE[theme][ci]) });
    const o = build(kind, m, accent);
    o.userData = { base: new THREE.Vector3(x, y, z), seed: i * 1.7, s: coarse ? s * 0.7 : s };
    o.position.set(x, y, z);
    o.rotation.set(i * 0.7, i * 1.1, i * 0.3);
    scene.add(o);
    return o;
  });
  let rubber = theme === 'night';

  const render = () => renderer.render(scene, camera);
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); frame(true);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const mouse = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
  if (fine && !reduce) addEventListener('pointermove', onMove, { passive: true });
  const vis = watchVisibility(canvas);

  const clock = new THREE.Clock();
  const start = performance.now();
  function frame(snap: boolean) {
    const t = clock.getElapsedTime(), sy = scrollY / innerHeight;
    const k = reduce ? 1 : Math.min((performance.now() - start) / 1400, 1);
    const pop = k === 1 ? 1 : Math.max(0, 1 + Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.6 - (1 - k));
    objects.forEach((o) => {
      const { base, seed, s } = o.userData as { base: THREE.Vector3; seed: number; s: number };
      o.scale.setScalar(pop * s);
      o.position.x = base.x + mouse.x * (1 + (seed % 3) * 0.3);
      o.position.y = base.y + (reduce ? 0 : Math.sin(t * 0.8 + seed) * 0.22) - mouse.y * 1.1 + sy * (seed % 2 ? 1.6 : -1.2);
      if (!reduce) { o.rotation.x += 0.003; o.rotation.y += 0.004; }
    });
    const f = snap ? 1 : 0.06;
    const r = rubber ? 0.35 : 0.8, cc = rubber ? 0.8 : 0.15, sh = rubber ? 0 : 1;
    mats.forEach(({ m, target }) => {
      m.color.lerp(target, f);
      m.roughness += (r - m.roughness) * f; m.clearcoat += (cc - m.clearcoat) * f; m.sheen += (sh - m.sheen) * f;
    });
    hemi.intensity += ((rubber ? 0.7 : 1.8) - hemi.intensity) * f;
    rim.intensity += ((rubber ? 3 : 0) - rim.intensity) * f;
    render();
  }
  resize();
  if (!reduce) renderer.setAnimationLoop(() => { if (vis.v.active()) frame(false); });

  return {
    setTheme(t: Theme) {
      rubber = t === 'night';
      mats.forEach((x) => x.target.set(PALETTE[t][x.ci]));
      if (reduce) frame(true);
    },
    destroy() {
      renderer.setAnimationLoop(null); ro.disconnect(); vis.stop();
      removeEventListener('pointermove', onMove);
      renderer.dispose();
    },
  };
}
