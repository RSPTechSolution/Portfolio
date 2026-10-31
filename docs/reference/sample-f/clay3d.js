// Shared floating clay / rubber 3D objects for the hybrid samples (throwaway).
// Mixes soft blobs with hardware parts (knobs, keycaps, sliders, LEDs).
import * as THREE from 'three';

function knob(mat, accent) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.7, 0.5, 64), mat);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.56, 0.12, 64), mat);
  cap.position.y = 0.3;
  const mark = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.34), accent);
  mark.position.set(0, 0.38, 0.22);
  g.add(body, cap, mark);
  return g;
}
function keycap(mat) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.42, 4, 1), mat);
  base.rotation.y = Math.PI / 4;
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
  top.scale.y = 0.25; top.position.y = 0.2;
  g.add(base, top);
  return g;
}
function led(color) {
  return new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 32), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.6, roughness: 0.3 }));
}

const BUILDERS = {
  torus: (m) => new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.4, 48, 96), m),
  sphere: (m) => new THREE.Mesh(new THREE.SphereGeometry(0.8, 64, 64), m),
  capsule: (m) => new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.2, 16, 48), m),
  blob: (m) => new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 8), m),
  cone: (m) => new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.2, 64), m),
  knot: (m) => new THREE.Mesh(new THREE.TorusKnotGeometry(0.5, 0.18, 160, 32), m),
  knob: (m, a) => knob(m, a),
  key: (m) => keycap(m),
};

// layout entries: [type, paletteIndex, x, y, z, scale?]
export function createClay(canvas, { palette, layout, rubber = false, accent = '#ffb547', ledColor = '#7cf2b0' }) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 10;
  const hemi = new THREE.HemisphereLight('#ffffff', '#c9b9a6', 1.8);
  const key = new THREE.DirectionalLight('#fff3e2', 2.4); key.position.set(4, 6, 6);
  const rim = new THREE.DirectionalLight(accent, 0); rim.position.set(-6, -2, -3);
  scene.add(hemi, key, rim);

  const accentMat = new THREE.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.6 });
  const mats = [];
  const makeMat = (c) => {
    const m = new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.8, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.6, clearcoat: 0.15 });
    m.userData.target = new THREE.Color(c);
    mats.push(m);
    return m;
  };
  const objects = layout.map(([type, ci, x, y, z, s = 1], i) => {
    const o = type === 'led' ? led(ledColor) : BUILDERS[type](makeMat(palette[ci]), accentMat);
    o.userData = { base: new THREE.Vector3(x, y, z), seed: i * 1.7, ci, s: coarse ? s * 0.7 : s };
    o.position.set(x, y, z);
    o.rotation.set(Math.random() * 2, Math.random() * 3, Math.random());
    o.scale.setScalar(o.userData.s);
    scene.add(o);
    return o;
  });

  function setLook(nextPalette, nextRubber) {
    objects.forEach((o) => o.traverse((n) => {
      if (n.material && mats.includes(n.material)) n.material.userData.target.set(nextPalette[o.userData.ci]);
    }));
    rubber = nextRubber;
  }
  setLook(palette, rubber);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const mouse = { x: 0, y: 0 };
  if (fine) addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; });
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  const clock = new THREE.Clock();
  const start = performance.now();
  function frame(snap) {
    const t = clock.getElapsedTime(), sy = scrollY / innerHeight;
    const k = reduce ? 1 : Math.min((performance.now() - start) / 1400, 1);
    const pop = k === 1 ? 1 : 1 + Math.sin(k * Math.PI * 2.5) * (1 - k) * 0.6 - (1 - k);   // elastic-ish intro
    objects.forEach((o) => {
      const { base, seed, s } = o.userData;
      o.scale.setScalar(Math.max(pop, 0) * s);
      o.position.x = base.x + mouse.x * (1 + (seed % 3) * 0.3);
      o.position.y = base.y + Math.sin(t * 0.8 + seed) * 0.22 - mouse.y * 1.1 + sy * (seed % 2 ? 1.6 : -1.2);
      o.rotation.x += 0.003; o.rotation.y += 0.004;
    });
    const f = snap ? 1 : 0.06;
    const r = rubber ? 0.35 : 0.8, cc = rubber ? 0.8 : 0.15, sh = rubber ? 0 : 1;
    mats.forEach((m) => {
      m.color.lerp(m.userData.target, f);
      m.roughness += (r - m.roughness) * f; m.clearcoat += (cc - m.clearcoat) * f; m.sheen += (sh - m.sheen) * f;
    });
    hemi.intensity += ((rubber ? 0.7 : 1.8) - hemi.intensity) * f;
    rim.intensity += ((rubber ? 3 : 0) - rim.intensity) * f;
    renderer.render(scene, camera);
  }
  if (reduce) { frame(true); return { setLook: (p, rb) => { setLook(p, rb); frame(true); } }; }
  renderer.setAnimationLoop(() => visible && frame(false));
  return { setLook };
}
