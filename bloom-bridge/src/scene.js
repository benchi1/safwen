// Bloom Bridge : quatre coupes de géométrie émissive dans un vide noir,
// reliées par des pics de bloom. Tout est fonction pure du temps t (secondes),
// ce qui permet à HyperFrames de rendre n'importe quelle image dans n'importe quel ordre.
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

const W = 1080;
const H = 1920;
const ASPECT = W / H;

// Pics de bloom (ponts) et fin.
const P1 = 3.6;
const P2 = 6.8;
const P3 = 9.6;
export const DURATION = 15.6;

// ---------- utilitaires temps ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (x) => x * x * (3 - 2 * x);
const inOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inCubic = (x) => x * x * x;
// Dépassement fractionnaire : masse et inertie, léger rebond avant l'arrêt.
const outBack = (x, s = 1.05) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const hfov = (deg) => (2 * Math.atan(Math.tan((deg * Math.PI) / 360) / ASPECT) * 180) / Math.PI;

function flare(t) {
  let f = 0;
  for (const p of [P1, P2, P3]) f += Math.exp(-Math.pow((t - p) / 0.3, 2));
  return f;
}

// ---------- GLSL commun ----------
// Rampe iridescente unique : indigo → violet → magenta → rouge-orangé → ambre → crème.
const RAMP = /* glsl */ `
vec3 ramp(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c0 = vec3(0.045, 0.016, 0.26);
  vec3 c1 = vec3(0.30, 0.06, 1.00);
  vec3 c2 = vec3(1.00, 0.04, 0.42);
  vec3 c3 = vec3(1.00, 0.14, 0.03);
  vec3 c4 = vec3(1.00, 0.50, 0.06);
  vec3 c5 = vec3(1.00, 0.90, 0.72);
  float s = t * 5.0;
  if (s < 1.0) return mix(c0, c1, s);
  if (s < 2.0) return mix(c1, c2, s - 1.0);
  if (s < 3.0) return mix(c2, c3, s - 2.0);
  if (s < 4.0) return mix(c3, c4, s - 3.0);
  return mix(c4, c5, s - 4.0);
}
`;

const VERT = /* glsl */ `
varying vec3 vLocal;
varying vec3 vNLocal;
varying vec3 vWorld;
varying vec3 vNWorld;
varying vec2 vUv;
void main() {
  vLocal = position;
  vNLocal = normal;
  vUv = uv;
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  vNWorld = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * w;
}
`;

const HEAD = /* glsl */ `
uniform float uTime;
uniform float uGlow;
varying vec3 vLocal;
varying vec3 vNLocal;
varying vec3 vWorld;
varying vec3 vNWorld;
varying vec2 vUv;
${RAMP}
float fresnel() {
  vec3 V = normalize(cameraPosition - vWorld);
  return 1.0 - clamp(abs(dot(normalize(vNWorld), V)), 0.0, 1.0);
}
`;

const shared = { uTime: { value: 0 }, uGlow: { value: 1 } };

function emissive(frag, uniforms = {}, extra = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uTime: shared.uTime, uGlow: shared.uGlow },
    vertexShader: VERT,
    fragmentShader: HEAD + frag,
    ...extra,
  });
}

// Halo additif : c'est la lumière des objets qui baigne l'air (bloom « dans » la profondeur).
function glowSprite(color, size) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(...color) }, uI: { value: 1 }, uGlow: shared.uGlow },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uI; uniform float uGlow; varying vec2 vUv;
      void main(){
        float r = length(vUv - 0.5) * 2.0;
        float g = exp(-r * r * 5.5) * (1.0 - smoothstep(0.8, 1.0, r)) * 0.3;
        gl_FragColor = vec4(uColor * g * uI * uGlow, 1.0);
      }`,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), mat);
  m.renderOrder = 10;
  return m;
}

// Tube lumineux le long d'un contour plan fermé.
function outlineTube(points2d, radius, mat) {
  const pts = points2d.map(([x, y]) => new THREE.Vector3(x, y, 0));
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 720, radius, 16, true), mat);
}

function roundedRectPoints(hw, hh, r, n = 48) {
  const out = [];
  const corners = [
    [hw - r, hh - r, 0],
    [-hw + r, hh - r, Math.PI / 2],
    [-hw + r, -hh + r, Math.PI],
    [hw - r, -hh + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  }
  return out;
}

function roundedRectShape(hw, hh, r) {
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.quadraticCurveTo(hw, -hh, hw, -hh + r);
  s.lineTo(hw, hh - r);
  s.quadraticCurveTo(hw, hh, hw - r, hh);
  s.lineTo(-hw + r, hh);
  s.quadraticCurveTo(-hw, hh, -hw, hh - r);
  s.lineTo(-hw, -hh + r);
  s.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return s;
}

export function createScene(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x000000, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(hfov(47), ASPECT, 0.05, 200);

  // ================= COUPE 1 : chevron + sphère =================
  const cut1 = new THREE.Group();
  scene.add(cut1);

  const chevShape = new THREE.Shape();
  chevShape.moveTo(0, 1.0);
  chevShape.lineTo(2.0, -1.0);
  chevShape.lineTo(1.45, -1.55);
  chevShape.lineTo(0, -0.06);
  chevShape.lineTo(-1.45, -1.55);
  chevShape.lineTo(-2.0, -1.0);
  chevShape.closePath();
  const chevGeo = new THREE.ExtrudeGeometry(chevShape, {
    depth: 0.45,
    bevelEnabled: true,
    bevelThickness: 0.2,
    bevelSize: 0.16,
    bevelSegments: 8,
    curveSegments: 12,
  });
  chevGeo.center();
  chevGeo.computeVertexNormals();
  const chevMat = emissive(
    /* glsl */ `
    uniform float uShift;
    uniform float uHeat;
    void main() {
      // Dégradé interne : bleu électrique → magenta → or, qui glisse quand la sphère passe.
      vec3 blue = vec3(0.04, 0.22, 1.0);
      vec3 mag = vec3(1.0, 0.05, 0.5);
      vec3 gold = vec3(1.0, 0.6, 0.1);
      float g = clamp(uShift * 1.25 - 0.2 + (vLocal.y + 1.3) * 0.16 + vLocal.x * 0.05, 0.0, 1.0);
      vec3 c = g < 0.5 ? mix(blue, mag, g * 2.0) : mix(mag, gold, g * 2.0 - 1.0);
      float bevel = 1.0 - abs(normalize(vNLocal).z);
      float f = fresnel();
      float I = 0.45 + 1.5 * bevel + 0.7 * f;
      vec3 col = c * I * (0.8 + 0.6 * uHeat);
      col = mix(col, ramp(1.0) * I, clamp(bevel * f * uHeat * 0.6, 0.0, 1.0));
      gl_FragColor = vec4(col * uGlow, 1.0);
    }`,
    { uShift: { value: 0 }, uHeat: { value: 0.5 } },
  );
  const chevron = new THREE.Mesh(chevGeo, chevMat);
  chevron.position.set(0, -4.4, 0);
  chevron.rotation.x = -0.12;
  cut1.add(chevron);

  const chevPool = glowSprite([0.3, 0.06, 1.0], 12);
  chevPool.position.set(0, -4.4, -1.2);
  cut1.add(chevPool);
  const chevHaze = glowSprite([0.25, 0.05, 0.8], 8);
  chevHaze.position.set(0, -4.2, 2.5);
  cut1.add(chevHaze);

  const sphereMat = emissive(/* glsl */ `
    void main() {
      float f = fresnel();
      vec3 n = normalize(vNLocal);
      float band = 0.5 + 0.5 * sin(dot(n, normalize(vec3(0.35, 1.0, 0.2))) * 7.0 + uTime * 0.6);
      float travel = 0.12 * sin(vWorld.x * 0.45 + vWorld.y * 0.3 - uTime * 1.3);
      float t = 0.06 + 0.72 * pow(f, 1.3) + 0.22 * band * f + travel;
      float I = 0.18 + 2.4 * pow(f, 1.6) + 0.5 * band * f;
      gl_FragColor = vec4(ramp(t) * I * uGlow, 1.0);
    }`);
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(3.0, 160, 120), sphereMat);
  cut1.add(sphere);
  const sphereHalo = glowSprite([0.45, 0.06, 0.7], 13);
  cut1.add(sphereHalo);

  // ================= COUPE 2 : panneau arrondi =================
  const cut2 = new THREE.Group();
  scene.add(cut2);
  const PANEL_R = 1.0;
  const panel = new THREE.Group();
  cut2.add(panel);
  const panelBodyGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.5, 2.5, PANEL_R), {
    depth: 0.25,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 4,
    curveSegments: 32,
  });
  panelBodyGeo.translate(0, 0, -0.31);
  const panelBody = new THREE.Mesh(
    panelBodyGeo,
    emissive(/* glsl */ `
      void main() {
        float f = fresnel();
        vec3 col = ramp(0.08) * (0.015 + 0.05 * f);
        gl_FragColor = vec4(col * uGlow, 1.0);
      }`),
  );
  panel.add(panelBody);
  const rimMat = emissive(
    /* glsl */ `
    uniform float uReveal;
    uniform float uDim;
    void main() {
      // Le liseré brûle crème → ambre → magenta → violet le long du contour.
      float s = fract(vUv.x + uTime * 0.09);
      float tri = abs(s * 2.0 - 1.0);
      float t = 0.22 + 0.78 * tri;
      float f = fresnel();
      float I = 3.2 + 1.8 * f;
      float on = smoothstep(uReveal, uReveal - 0.25, abs(fract(vUv.x - 0.62) - 0.5) * 2.0);
      gl_FragColor = vec4(ramp(t) * I * mix(0.12, 1.0, on) * uDim * uGlow, 1.0);
    }`,
    { uReveal: { value: 1.3 }, uDim: { value: 1 } },
  );
  const rim = outlineTube(roundedRectPoints(1.5, 2.5, PANEL_R), 0.04, rimMat);
  panel.add(rim);
  const panelGlow = glowSprite([0.9, 0.12, 0.35], 11);
  panelGlow.position.z = -1.5;
  panel.add(panelGlow);
  const panelHaze = glowSprite([0.5, 0.12, 0.45], 7);
  cut2.add(panelHaze);

  // ================= COUPE 3 : pilule + pulsation =================
  const cut3 = new THREE.Group();
  scene.add(cut3);
  const PILL_HW = 2.3;
  const PILL_R = 0.62;
  const pill = new THREE.Group();
  cut3.add(pill);
  const pillMat = emissive(/* glsl */ `
    void main() {
      float s = 0.5 + 0.5 * sin(vUv.x * 6.2831 - uTime * 0.9);
      float t = 0.2 + 0.72 * s;
      gl_FragColor = vec4(ramp(t) * (3.4 + 1.5 * s) * uGlow, 1.0);
    }`);
  pill.add(outlineTube(roundedRectPoints(PILL_HW, PILL_R, PILL_R - 0.0001), 0.028, pillMat));
  const pillCore = new THREE.Mesh(
    new THREE.ShapeGeometry(roundedRectShape(PILL_HW - 0.03, PILL_R - 0.03, PILL_R - 0.031), 48),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  pillCore.position.z = -0.01;
  pill.add(pillCore);
  const pillBloom = glowSprite([0.36, 0.05, 1.0], 9);
  pillBloom.position.z = -2.0;
  cut3.add(pillBloom);

  // ================= COUPE 4 : huit tuiles =================
  const cut4 = new THREE.Group();
  scene.add(cut4);
  const TILE = 1.15;
  const tileGeo = new RoundedBoxGeometry(TILE, TILE, 0.34, 5, 0.13);
  const tileFrag = /* glsl */ `
    uniform float uHeat;
    uniform float uGlyph;
    float sdSeg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
    float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
    float glyph(vec2 p) {
      float g = uGlyph;
      float w = 0.055;
      if (g < 0.5) return max(length(p) - 0.27, 0.0);                                   // disque
      if (g < 1.5) return max(min(min(sdSeg(p, vec2(0.0, 0.33), vec2(0.3, -0.22)),
                                       sdSeg(p, vec2(0.3, -0.22), vec2(-0.3, -0.22))),
                                   sdSeg(p, vec2(-0.3, -0.22), vec2(0.0, 0.33))) - w, 0.0); // triangle
      if (g < 2.5) return max(min(sdSeg(p, vec2(-0.3, -0.13), vec2(0.0, 0.17)),
                                  sdSeg(p, vec2(0.0, 0.17), vec2(0.3, -0.13))) - w * 1.3, 0.0); // chevron
      if (g < 3.5) return max(min(sdSeg(p, vec2(-0.3, 0.0), vec2(0.3, 0.0)),
                                  sdSeg(p, vec2(0.0, -0.3), vec2(0.0, 0.3))) - w, 0.0);       // plus
      if (g < 4.5) return max(abs(sdBox(p, vec2(0.25))) - w, 0.0);                        // carré
      if (g < 5.5) { vec2 q = mat2(0.7071, -0.7071, 0.7071, 0.7071) * p;
                     return max(abs(sdBox(q, vec2(0.22))) - w, 0.0); }                     // losange
      if (g < 6.5) return max(abs(length(p) - 0.27) - w, 0.0);                            // anneau
      return max(sdSeg(p, vec2(-0.3, 0.0), vec2(0.3, 0.0)) - 0.075, 0.0);                 // barre
    }
    void main() {
      vec3 hb = vec3(${(TILE / 2).toFixed(3)}, ${(TILE / 2).toFixed(3)}, 0.17);
      vec3 a = abs(vLocal) / hb;
      float m1 = max(max(a.x, a.y), a.z);
      float m3 = min(min(a.x, a.y), a.z);
      float m2 = a.x + a.y + a.z - m1 - m3;
      float rimE = smoothstep(0.72, 0.97, m2);
      float f = fresnel();
      vec3 col = ramp(0.08) * 0.02;
      col += ramp(0.22 + 0.78 * uHeat) * rimE * (0.7 + 2.2 * uHeat) * (0.6 + 0.5 * f);
      if (vNLocal.z > 0.6) {
        float d = glyph(vLocal.xy / hb.x);
        float core = smoothstep(0.03, 0.0, d);
        float halo = exp(-d * 16.0) * 0.5;
        col += ramp(0.45 + 0.55 * uHeat) * (core * (1.0 + 1.8 * uHeat) + halo * (0.35 + 0.6 * uHeat));
      }
      gl_FragColor = vec4(col * uGlow, 1.0);
    }`;
  const tiles = [];
  for (let i = 0; i < 8; i++) {
    const m = new THREE.Mesh(tileGeo, emissive(tileFrag, { uHeat: { value: 0.5 }, uGlyph: { value: i } }));
    cut4.add(m);
    tiles.push(m);
  }
  const tilesGlow = glowSprite([0.4, 0.07, 0.9], 12);
  cut4.add(tilesGlow);
  const tilesHaze = glowSprite([0.8, 0.3, 0.3], 6);
  cut4.add(tilesHaze);

  // ================= Post-traitement =================
  const target = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(scene, camera));
  // Bloom large, seuil bas : il déborde bien au-delà des silhouettes.
  const bloom = new UnrealBloomPass(new THREE.Vector2(W, H), 0.8, 0.9, 0.08);
  composer.addPass(bloom);

  // Pont de bloom + masque intérieur de la pilule (reste noir absolu).
  const bridge = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uFlare: { value: 0 },
      uFlareColor: { value: new THREE.Color() },
      uMaskOn: { value: 0 },
      uPillC: { value: new THREE.Vector2() },
      uPillHalf: { value: 0 },
      uPillR: { value: 0 },
      uRes: { value: new THREE.Vector2(W, H) },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; uniform float uFlare; uniform vec3 uFlareColor;
      uniform float uMaskOn; uniform vec2 uPillC; uniform float uPillHalf; uniform float uPillR; uniform vec2 uRes;
      varying vec2 vUv;
      void main(){
        vec3 col = texture2D(tDiffuse, vUv).rgb;
        vec2 px = vUv * uRes;
        vec2 p = abs(px - uPillC) - vec2(uPillHalf, 0.0);
        float d = length(max(p, vec2(0.0))) + min(max(p.x, p.y), 0.0) - uPillR;
        float inside = smoothstep(-2.0, -22.0, d);
        vec2 q = (vUv - 0.5) * vec2(1.0, uRes.y / uRes.x);
        float wash = exp(-dot(q, q) * 2.2);
        col = col * (1.0 + 1.5 * uFlare) + uFlareColor * uFlare * (wash * 1.6 + 0.12);
        col *= 1.0 - 0.97 * inside * uMaskOn;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  composer.addPass(bridge);
  composer.addPass(new OutputPass());

  // Vide noir : léger relevé violet au centre, noir absolu aux bords.
  const finish = new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse; varying vec2 vUv;
      void main(){
        vec3 col = texture2D(tDiffuse, vUv).rgb;
        vec2 q = (vUv - 0.5) * vec2(1.0, 1.35);
        float r = length(q) * 2.0;
        float vig = 1.0 - smoothstep(0.8, 1.5, r);
        vec3 lift = vec3(0.022, 0.008, 0.045) * exp(-r * r * 1.4);
        col = col * vig + lift * (1.0 - clamp(dot(col, vec3(0.33)), 0.0, 1.0));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  composer.addPass(finish);

  const v = new THREE.Vector3();
  function toPx(x, y, z) {
    v.set(x, y, z).project(camera);
    return [(v.x * 0.5 + 0.5) * W, (v.y * 0.5 + 0.5) * H];
  }
  function face(obj) {
    obj.quaternion.copy(camera.quaternion);
  }

  function setCamera(fovH, x, y, z, tx, ty, tz) {
    camera.fov = hfov(fovH);
    camera.position.set(x, y, z);
    camera.lookAt(tx, ty, tz);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }

  function render(t) {
    t = clamp(t, 0, DURATION);
    const fl = flare(t);
    const endFade = lerp(1, 0.42, smooth(prog(t, 14.2, 15.6)));
    shared.uTime.value = t;
    shared.uGlow.value = (1 + 3.0 * fl) * endFade;
    bloom.strength = (0.8 + 1.6 * fl) * lerp(1, 0.6, smooth(prog(t, 14.2, 15.6)));

    cut1.visible = t < P1;
    cut2.visible = t >= P1 && t < P2;
    cut3.visible = t >= P2 && t < P3;
    cut4.visible = t >= P3;
    bridge.uniforms.uMaskOn.value = 0;

    const nearest = [P1, P2, P3].reduce((a, b) => (Math.abs(t - b) < Math.abs(t - a) ? b : a));
    const bridgeT = nearest === P1 ? 0.3 : nearest === P2 ? 0.55 : 0.22;
    const rc = rampJS(bridgeT);
    bridge.uniforms.uFlare.value = fl;
    bridge.uniforms.uFlareColor.value.setRGB(rc[0], rc[1], rc[2]);

    if (cut1.visible) {
      // 47°, neutre, fixe. Le chevron ne bouge pas ; la sphère monte du coin haut gauche.
      setCamera(47, 0, 0, 10, 0, 0, 0);
      const s = prog(t, 0, 3.3);
      const e = outBack(s, 0.6);
      sphere.position.set(lerp(-7.5, 0.0, e), lerp(9.8, 2.2, outCubic(s)), -3.2);
      sphere.rotation.set(0.25, t * 0.35, 0.1);
      sphereHalo.position.copy(sphere.position).setZ(-4.5);
      face(sphereHalo);
      sphereHalo.material.uniforms.uI.value = 0.55;
      const pass = smooth(prog(sphere.position.x, -6.5, 0.2));
      chevMat.uniforms.uShift.value = pass;
      chevMat.uniforms.uHeat.value = 0.45 + 0.55 * pass;
      chevPool.material.uniforms.uI.value = 0.75 + 0.25 * pass;
      chevHaze.material.uniforms.uI.value = 0.18;
      face(chevPool);
      face(chevHaze);
    }

    if (cut2.visible) {
      // 63°, poussée lente, arrêt complet. À la fin, le rayon d'angle occupe 1/3 de la largeur du cadre.
      const push = inOutCubic(prog(t, 4.0, 6.4));
      const dEnd = (3 * PANEL_R) / (2 * Math.tan((63 * Math.PI) / 360));
      setCamera(63, 0, 0, lerp(5.6, dEnd, push), 0, 0, 0);
      const sw = prog(t, P1 - 0.05, 5.1);
      const e = outBack(sw, 0.9);
      panel.position.set(lerp(-5.0, 0, e), lerp(-7.5, 0, e), 0);
      panel.rotation.set(0, 0, lerp(0.55, 0, e));
      rimMat.uniforms.uReveal.value = lerp(0.1, 1.35, outCubic(prog(t, P1 - 0.1, 4.6)));
      rimMat.uniforms.uDim.value = lerp(1, 0.4, push);
      panelGlow.material.uniforms.uI.value = lerp(0.5, 0.15, push);
      panelHaze.position.set(0, -3.2, -0.8);
      panelHaze.material.uniforms.uI.value = 0.5;
      face(panelGlow);
      face(panelHaze);
    }

    if (cut3.visible) {
      // 47°, verrouillé. Intérieur noir absolu ; bloom violet qui pulse derrière.
      setCamera(47, 0, 0, 8, 0, 0, 0);
      const k = prog(t, P2 - 0.05, 7.6);
      const sc = lerp(0.9, 1, outBack(k, 1.2));
      pill.scale.setScalar(sc);
      const pulse = prog(t, 7.3, 9.3);
      const bs = pulse <= 0 ? 0.6 : lerp(0.6, 1.0, outBack(pulse, 1.6));
      pillBloom.scale.setScalar(bs * 1.15);
      pillBloom.material.uniforms.uI.value = 0.35 + 0.65 * Math.sin(Math.PI * clamp(pulse * 1.4)) + 0.25 * outCubic(pulse);
      face(pillBloom);
      const [cx, cy] = toPx(0, 0, 0);
      const [ex] = toPx((PILL_HW - PILL_R) * sc, 0, 0);
      const [, ry] = toPx(0, PILL_R * sc, 0);
      bridge.uniforms.uMaskOn.value = smooth(prog(t, P2 + 0.05, P2 + 0.45)) * (1 - smooth(prog(t, P3 - 0.45, P3 - 0.1)));
      bridge.uniforms.uPillC.value.set(cx, cy);
      bridge.uniforms.uPillHalf.value = ex - cx;
      bridge.uniforms.uPillR.value = ry - cy;
    }

    if (cut4.visible) {
      // 84°, grand angle, orbite. Trois temps : orbite, recomposition en colonne, défilement puis effondrement.
      const tau = t - P3;
      const camA = 0.55 * outCubic(prog(tau, 0, 2.6)) - 0.2;
      const R = 4.9;
      const camY = lerp(1.9, 0.0, inOutCubic(prog(tau, 1.6, 3.4)));
      setCamera(84, Math.sin(camA) * R, camY, Math.cos(camA) * R, 0, 0, 0);

      const ringA = 1.45 * outCubic(prog(tau, 0, 2.6)) + 0.35 * tau;
      const reflowStart = 2.3;
      const scrollStart = 3.7;
      const rise = prog(tau, 0, 0.9);
      const ringR = lerp(1.8, 2.35, outBack(rise, 1.4));
      for (let i = 0; i < 8; i++) {
        const tile = tiles[i];
        const a = ringA + (i * Math.PI * 2) / 8;
        const ringPos = new THREE.Vector3(Math.sin(a) * ringR, 0, Math.cos(a) * ringR);
        const ringRot = a;

        // Colonne sur l'axe vertical, face caméra (orientation de fin d'orbite).
        const camEnd = 0.35;
        const colY = (3.5 - i) * 1.32;
        const r = outBack(prog(tau, reflowStart + i * 0.06, reflowStart + 0.9 + i * 0.06), 1.1);
        const pos = ringPos.clone().lerp(new THREE.Vector3(0, colY, 0), r);
        let rot = lerp(ringRot, camEnd + Math.round((ringRot - camEnd) / (Math.PI * 2)) * Math.PI * 2, r);

        // Défilement vers le haut ; les tuiles passent devant la caméra, une seule reste au centre.
        const sp = prog(tau, scrollStart, 5.6);
        let scale = 1;
        if (i === 7) {
          pos.y += (0 - colY) * outBack(sp, 1.0);
        } else {
          const up = inCubic(sp);
          pos.y += 4.62 * outCubic(sp) + (7 - i) * 3.4 * up;
          pos.x += Math.sin(camEnd) * 2.6 * up;
          pos.z += Math.cos(camEnd) * 2.6 * up;
          scale = 1 - 0.0 * up;
        }
        tile.position.copy(pos);
        tile.rotation.set(0, rot, 0);
        tile.scale.setScalar(scale * lerp(0.85, 1, outBack(rise, 1.2)));
        const dist = tile.position.distanceTo(camera.position);
        tile.material.uniforms.uHeat.value = 0.88 * clamp((7.2 - dist) / 4.2);
      }
      tilesGlow.position.set(0, 0, 0);
      face(tilesGlow);
      tilesGlow.position.addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), 3.0);
      tilesGlow.material.uniforms.uI.value = 0.4;
      face(tilesHaze);
      tilesHaze.position.copy(camera.position).addScaledVector(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion), 2.2);
      tilesHaze.material.uniforms.uI.value = 0.05;
    }

    composer.render();
  }

  return { render, renderer };
}

// Même rampe que le GLSL, côté JS, pour la teinte des ponts.
function rampJS(t) {
  const c = [
    [0.045, 0.016, 0.26],
    [0.3, 0.06, 1.0],
    [1.0, 0.04, 0.42],
    [1.0, 0.14, 0.03],
    [1.0, 0.5, 0.06],
    [1.0, 0.9, 0.72],
  ];
  const s = clamp(t) * 5;
  const i = Math.min(4, Math.floor(s));
  const k = s - i;
  return [0, 1, 2].map((j) => lerp(c[i][j], c[i + 1][j], k));
}
