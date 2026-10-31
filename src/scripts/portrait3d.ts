// Layered parallax 3D portrait (spec §6.2, §10).
// Two flat planes — background and subject cut-out — tilt as one card and drift
// against each other. There is no vertex displacement: the face is never deformed.
// The static <img> stays underneath as LCP image and fallback; the opaque background plane covers it.
import * as THREE from 'three';
import { clampPose, curveFor, touchPose } from './pose';
import { watchVisibility } from './visibility';
import type { Theme } from './theme';

const vertexShader = /* glsl */ `
uniform float uCurve;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z -= p.x * p.x * uCurve;   // night screen curve: background plane only (curveFor), the face plane stays flat
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform sampler2D uTex;
uniform float uMode, uTime, uReveal;
uniform vec3 uAccent;
varying vec2 vUv;
float luma(vec3 c) { return dot(c, vec3(.299, .587, .114)); }
float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main() {
  if (vUv.y > uReveal) discard;
  vec4 t4 = texture2D(uTex, vUv);
  vec3 tex = t4.rgb;
  vec3 col;
  if (uMode < 0.5) {                       // day: natural, photo is pre-graded
    col = pow(max(tex, 0.0), vec3(1.0 / 2.2));
    col += (hash(vUv * 700.0 + fract(uTime)) - 0.5) * 0.025;
  } else {                                 // night: amber CRT
    float l = luma(tex);
    vec2 off = vec2(0.002, 0.0);
    float lr = luma(texture2D(uTex, vUv + off).rgb), lb = luma(texture2D(uTex, vUv - off).rgb);
    col = uAccent * pow(l, 1.15) * 1.55 + vec3(lr - l, 0.0, lb - l) * 0.25;
    col *= 0.8 + 0.2 * sin(vUv.y * 820.0 - uTime * 6.0);
    col *= 0.97 + 0.03 * sin(uTime * 50.0);
    vec2 v = vUv - 0.5;
    col *= 1.0 - dot(v, v) * 1.4;
  }
  if (uReveal < 1.1 && vUv.y > uReveal - 0.012) col = uAccent;
  gl_FragColor = vec4(col, t4.a);
}`;

const LOOK: Record<Theme, { mode: number; accent: string }> = {
  day: { mode: 0, accent: '#ff4a1c' },
  night: { mode: 1, accent: '#ffb547' },
};

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

function load(url: string): Promise<THREE.Texture | null> {
  return new Promise((res) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));
}

export async function mountPortrait(
  frame: HTMLElement,
  src: { subject: string; bg: string },
  theme: Theme,
): Promise<{ setTheme(t: Theme): void; destroy(): void } | null> {
  if (!hasWebGL()) return null;
  const [subject, bg] = await Promise.all([load(src.subject), load(src.bg)]);
  if (!subject || !bg) return null;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  frame.appendChild(canvas);

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse });
  } catch { canvas.remove(); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);

  const shared = {
    uMode: { value: LOOK[theme].mode }, uTime: { value: 0 }, uReveal: { value: reduce ? 1.2 : 0 },
    uAccent: { value: new THREE.Color(LOOK[theme].accent) },
  };
  const backCurve = { value: curveFor('back', theme) };
  const frontCurve = { value: curveFor('front', theme) };
  const W = 1.76, H = 2.2;
  const geo = new THREE.PlaneGeometry(W, H, 64, 80);
  const material = (tex: THREE.Texture, uCurve: { value: number }) => new THREE.ShaderMaterial({ uniforms: { ...shared, uCurve, uTex: { value: tex } }, vertexShader, fragmentShader, transparent: true });
  const card = new THREE.Group();
  const back = new THREE.Mesh(geo, material(bg, backCurve));
  const front = new THREE.Mesh(geo, material(subject, frontCurve));
  back.position.z = -0.45; back.scale.setScalar(1.4);
  front.position.z = 0.05; front.scale.setScalar(1.06);   // overscan: edges never show
  front.renderOrder = 1;
  card.add(back, front);
  scene.add(card);

  let rect = frame.getBoundingClientRect();
  const render = () => renderer.render(scene, camera);
  function resize() {
    const w = frame.clientWidth, h = frame.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    camera.position.z = Math.min((H * 0.9) / 2 / f, (W * 0.9) / 2 / (f * camera.aspect));   // cover fit
    camera.updateProjectionMatrix();
    rect = frame.getBoundingClientRect();
    render();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(frame);
  const onScroll = () => { rect = frame.getBoundingClientRect(); };
  addEventListener('scroll', onScroll, { passive: true });

  const target = clampPose(0.5, 0.5);
  const onMove = (e: PointerEvent) => Object.assign(target, clampPose((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height));
  if (fine && !reduce) addEventListener('pointermove', onMove);

  const vis = watchVisibility(frame);

  function fallback() {
    renderer.setAnimationLoop(null);
    canvas.remove();
  }
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); fallback(); });

  resize();

  if (!reduce) {
    const clock = new THREE.Clock();
    const start = performance.now();
    renderer.setAnimationLoop(() => {
      if (!vis.v.active()) return;
      const t = clock.getElapsedTime();
      if (!fine) Object.assign(target, touchPose(t, -rect.top / Math.max(rect.height, 1)));
      const k = Math.min((performance.now() - start) / 2200, 1);
      shared.uReveal.value = k < 1 ? (1 - Math.pow(1 - k, 3)) * 1.02 : 1.2;
      shared.uTime.value = t;
      card.rotation.x += (target.rx - card.rotation.x) * 0.06;
      card.rotation.y += (target.ry + Math.sin(t * 0.5) * 0.015 - card.rotation.y) * 0.06;
      front.position.x += (target.fx - front.position.x) * 0.06;
      front.position.y += (target.fy + Math.sin(t * 0.8) * 0.006 - 0.006 - front.position.y) * 0.06;
      render();
    });
  }

  return {
    setTheme(t: Theme) {
      shared.uMode.value = LOOK[t].mode;
      shared.uAccent.value.set(LOOK[t].accent);
      backCurve.value = curveFor('back', t);
      frontCurve.value = curveFor('front', t);
      if (reduce) render();
    },
    destroy() {
      renderer.setAnimationLoop(null);
      ro.disconnect(); vis.stop();
      removeEventListener('pointermove', onMove);
      removeEventListener('scroll', onScroll);
      renderer.dispose(); canvas.remove();
    },
  };
}
