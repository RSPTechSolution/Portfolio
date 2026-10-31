// Shared 3D portrait for the theme samples (throwaway).
// Loads ./photo.jpg (falls back to a placeholder) onto a displaced plane and
// renders it in one of three looks: halftone print, posterised duotone, amber CRT.
// Optional ./photo-depth.jpg (white = near) gives real depth; otherwise an
// approximate head/shoulders depth is used.
import * as THREE from 'three';

const vertexShader = /* glsl */`
uniform float uDepth, uTime, uHover, uCurve, uHasDepth;
uniform vec2 uMouse, uHead;
uniform sampler2D uDepthMap;
varying vec2 vUv;
varying float vZ;
void main(){
  vUv = uv;
  vec3 p = position;
  float z;
  if (uHasDepth > 0.5) {
    z = texture2D(uDepthMap, uv).r;
  } else {
    vec2 h = (uv - uHead) * vec2(2.4, 2.5);
    float head = 1.0 - smoothstep(0.0, 0.5, length(h));
    float body = smoothstep(uHead.y - 0.14, uHead.y - 0.4, uv.y) * (1.0 - smoothstep(0.1, 0.5, abs(uv.x - uHead.x)));
    z = head * 0.9 + body * 0.45;
  }
  z += sin(uv.y * 16.0 + uTime * 1.4) * 0.012;
  float md = distance(uv, uMouse);
  z += exp(-md * md * 90.0) * 0.35 * uHover;
  float edge = smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x) * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
  p.z += z * uDepth * edge;
  p.z -= p.x * p.x * uCurve;
  vZ = z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}`;

const fragmentShader = /* glsl */`
precision highp float;
uniform sampler2D uTex;
uniform float uMode, uTime, uReveal, uHover;
uniform vec2 uMouse;
uniform vec3 uInk, uPaper, uAccent;
varying vec2 vUv;
varying float vZ;
float luma(vec3 c){ return dot(c, vec3(.299, .587, .114)); }
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
void main(){
  if (vUv.y > uReveal) discard;
  vec4 t4 = texture2D(uTex, vUv);
  vec3 tex = t4.rgb;
  float l = luma(tex);
  vec3 col; float a = 1.0;
  float md = distance(vUv, uMouse);

  if (uMode < 0.5) {               // halftone print
    float ang = 0.785;
    mat2 r = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
    vec2 cell = fract(r * (vUv * vec2(64.0, 80.0))) - 0.5;
    float rad = sqrt(clamp(1.0 - l, 0.0, 1.0)) * 0.64 + exp(-md * md * 120.0) * 0.12 * uHover;
    float d = smoothstep(rad, rad - 0.14, length(cell));
    col = mix(uInk, uAccent, step(0.996, hash(floor(r * (vUv * vec2(64.0, 80.0))))));
    a = d;
  } else if (uMode < 1.5) {        // posterised duotone
    float t = l + (hash(vUv * 900.0 + uTime) - 0.5) * 0.06;
    col = mix(uInk, uAccent, smoothstep(0.30, 0.34, t));
    a = 1.0 - smoothstep(0.62, 0.66, t);   // highlights drop out to the page
    col = mix(col, uPaper, 1.0 - a);
  } else if (uMode > 2.5) {        // natural, warm-graded with film grain
    col = pow(max(tex, 0.0), vec3(1.0 / 2.2));
    col += (hash(vUv * 700.0 + fract(uTime)) - 0.5) * 0.025;
  } else {                         // amber CRT
    vec2 off = vec2(0.002, 0.0);
    float lr = luma(texture2D(uTex, vUv + off).rgb);
    float lb = luma(texture2D(uTex, vUv - off).rgb);
    col = uAccent * pow(l, 1.15) * 1.55 + vec3(lr - l, 0.0, lb - l) * 0.25;
    col *= 0.8 + 0.2 * sin(vUv.y * 820.0 - uTime * 6.0);
    col *= 0.97 + 0.03 * sin(uTime * 50.0);
    vec2 v = vUv - 0.5;
    col *= 1.0 - dot(v, v) * 1.4;
    col += uAccent * exp(-md * md * 60.0) * 0.18 * uHover;
  }

  // scanning reveal edge
  if (uReveal < 1.1 && vUv.y > uReveal - 0.012) { col = uAccent; a = 1.0; }
  gl_FragColor = vec4(col, a * t4.a);
}`;

function placeholderTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 640;
  const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 0, 640);
  bg.addColorStop(0, '#f2f2f2'); bg.addColorStop(1, '#d6d6d6');
  g.fillStyle = bg; g.fillRect(0, 0, 512, 640);
  g.fillStyle = '#2e2e2e';
  g.beginPath(); g.ellipse(256, 680, 240, 210, 0, Math.PI, 0); g.fill();
  g.fillStyle = '#7a7a7a'; g.fillRect(214, 380, 84, 110);
  const hg = g.createRadialGradient(226, 240, 20, 256, 270, 160);
  hg.addColorStop(0, '#d9d9d9'); hg.addColorStop(1, '#555');
  g.fillStyle = hg; g.beginPath(); g.ellipse(256, 270, 112, 140, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#161616'; g.beginPath(); g.ellipse(256, 185, 122, 78, 0, Math.PI, 0); g.fill();
  g.font = '500 20px monospace'; g.fillStyle = 'rgba(0,0,0,.6)'; g.textAlign = 'center';
  g.fillText('PLACEHOLDER — add photo.jpg', 256, 40);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function loadTexture(url) {
  return new Promise((res) => new THREE.TextureLoader().load(url, (t) => { t.colorSpace = THREE.SRGBColorSpace; res(t); }, undefined, () => res(null)));
}

export async function createPortrait(canvas, opts = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(max-width: 768px), (pointer: coarse)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !coarse });
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);

  const uniforms = {
    uTex: { value: placeholderTexture() },
    uDepthMap: { value: null }, uHasDepth: { value: 0 },
    uDepth: { value: reduce ? (opts.depth ?? 0.45) : 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uHover: { value: 0 },
    uHead: { value: new THREE.Vector2(...(opts.head ?? [0.47, 0.68])) },
    uTime: { value: 0 }, uReveal: { value: reduce ? 1.2 : 0 },
    uMode: { value: { halftone: 0, duotone: 1, crt: 2, natural: 3 }[opts.mode ?? 'halftone'] },
    uCurve: { value: opts.curve ?? 0 },
    uInk: { value: new THREE.Color(opts.ink ?? '#1d3fbb') },
    uPaper: { value: new THREE.Color(opts.paper ?? '#f3efe6') },
    uAccent: { value: new THREE.Color(opts.accent ?? '#ff5b2e') },
  };
  const W = 1.76, H = 2.2;
  const mesh = new THREE.Group();   // rotated as one card
  scene.add(mesh);
  const geo = new THREE.PlaneGeometry(W, H, 160, 200);
  const front = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true }));
  mesh.add(front);
  let back = null;

  // Layered mode: a flat background plane behind a flat cut-out of the subject.
  // Depth comes from parallax between layers, so the face is never deformed.
  const [subject, bgTex] = opts.layers ? await Promise.all([loadTexture('./photo-subject.png'), loadTexture('./photo-bg.png')]) : [null, null];
  if (subject && bgTex) {
    uniforms.uTex.value = subject;
    opts.depth = 0;
    const bgUniforms = { ...uniforms, uTex: { value: bgTex } };   // shares every other uniform
    back = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: bgUniforms, vertexShader, fragmentShader, transparent: true }));
    back.position.z = -0.45; back.scale.setScalar(1.4);
    front.position.z = 0.05; front.scale.setScalar(1.06);   // overscan so edges never show
    mesh.add(back);
    front.renderOrder = 1;
  } else {
    const [photo, depth] = await Promise.all([loadTexture('./photo.png').then((t) => t || loadTexture('./photo.jpg')), loadTexture('./photo-depth.jpg')]);
    if (photo) uniforms.uTex.value = photo;
    if (depth) { uniforms.uDepthMap.value = depth; uniforms.uHasDepth.value = 1; }
  }

  let rect = canvas.getBoundingClientRect();
  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const f = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const m = opts.fit ?? 1.1;   // <1 = overscan (cover), >1 = margin
    camera.position.z = opts.fit && opts.fit < 1
      ? Math.min((H * m) / 2 / f, (W * m) / 2 / (f * camera.aspect))
      : Math.max((H * m) / 2 / f, (W * m) / 2 / (f * camera.aspect));
    camera.updateProjectionMatrix();
    rect = canvas.getBoundingClientRect();
    renderer.render(scene, camera);
  }
  new ResizeObserver(resize).observe(canvas);
  addEventListener('scroll', () => { rect = canvas.getBoundingClientRect(); }, { passive: true });
  resize();

  const target = { rx: 0, ry: 0, hover: 0 };
  if (!coarse) {
    addEventListener('pointermove', (e) => {
      const nx = (e.clientX - rect.left) / rect.width, ny = (e.clientY - rect.top) / rect.height;
      const k = back ? 0.35 : 1;   // layered card tilts gently
      target.ry = (nx - 0.5) * 0.6 * k; target.rx = (ny - 0.5) * 0.4 * k;
      const inside = nx > 0 && nx < 1 && ny > 0 && ny < 1;
      target.hover = inside ? 1 : 0;
      if (inside) uniforms.uMouse.value.set(nx, 1 - ny);
    });
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  const api = { uniforms, mesh, front, get back() { return back; }, render: () => renderer.render(scene, camera) };
  if (reduce) { renderer.render(scene, camera); return api; }

  const clock = new THREE.Clock();
  const start = performance.now();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = clock.getElapsedTime();
    const k = Math.min((performance.now() - start) / 2200, 1);
    const ease = 1 - Math.pow(1 - k, 3);
    uniforms.uReveal.value = k < 1 ? ease * 1.02 : 1.2;
    uniforms.uDepth.value = ease * (opts.depth ?? 0.45);
    uniforms.uTime.value = t;
    uniforms.uHover.value += (target.hover - uniforms.uHover.value) * 0.08;
    mesh.rotation.x += (target.rx - mesh.rotation.x) * 0.06;
    mesh.rotation.y += (target.ry + Math.sin(t * 0.5) * (back ? 0.015 : 0.04) - mesh.rotation.y) * 0.06;
    if (back) {   // extra parallax: subject drifts against the background
      front.position.x += (target.ry * 0.25 - front.position.x) * 0.06;
      front.position.y += (Math.min(0, -target.rx * 0.2) + Math.sin(t * 0.8) * 0.006 - 0.006 - front.position.y) * 0.06;   // never lifts above the frame bottom
    }
    renderer.render(scene, camera);
  });
  return api;
}
