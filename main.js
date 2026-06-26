import * as THREE from 'three';

const container = document.querySelector('.hero-right');
if (!container) throw new Error('No .hero-right found');

const W = container.clientWidth;
const H = container.clientHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W, H);
renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:1;';
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const mouse = new THREE.Vector2(0.5, 0.5);
const targetMouse = new THREE.Vector2(0.5, 0.5);

container.addEventListener('mousemove', e => {
  const r = container.getBoundingClientRect();
  targetMouse.set(
    (e.clientX - r.left) / r.width,
    1 - (e.clientY - r.top) / r.height
  );
});

container.addEventListener('mouseleave', () => {
  targetMouse.set(0.5, 0.5);
});

const vertShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragShader = `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform vec2  uResolution;
  varying vec2  vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ *ns.x + ns.yyyy;
    vec4 y  = y_ *ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * snoise(p);
      p  = p * 2.1 + vec3(1.7, 9.2, 3.4);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;

    vec2 mDist = uv - uMouse;
    float mLen = length(mDist);
    float mInfluence = smoothstep(0.5, 0.0, mLen) * 0.18;
    vec2 warpedUv = uv + normalize(mDist + 0.001) * mInfluence;

    float t = uTime * 0.09;

    vec3 p1 = vec3(warpedUv * 2.2, t);
    vec3 p2 = vec3(warpedUv * 1.6 + vec2(3.1, 1.7), t * 0.7);

    float n1 = fbm(p1);
    float n2 = fbm(p2 + vec3(n1 * 1.2));
    float n3 = fbm(vec3(warpedUv * 3.0 + vec2(n2 * 0.8), t * 0.5));

    float ink = fbm(vec3(warpedUv * 2.5 + vec2(n2 * 0.6, n1 * 0.6), t * 0.6));

    ink = ink * 0.5 + 0.5;

    float edge = smoothstep(0.38, 0.62, ink);
    float soft = smoothstep(0.30, 0.70, ink);

    vec3 inkColor    = vec3(0.04, 0.03, 0.05);
    vec3 midColor    = vec3(0.07, 0.055, 0.09);
    vec3 surfaceColor= vec3(0.10, 0.09, 0.13);
    vec3 glowColor   = vec3(0.16, 0.13, 0.20);

    vec3 col = mix(inkColor, midColor, soft);
    col = mix(col, surfaceColor, edge * 0.6);
    col += glowColor * pow(edge, 3.0) * 0.35;

    float shimmer = snoise(vec3(uv * 8.0, t * 2.0)) * 0.5 + 0.5;
    col += vec3(0.05, 0.04, 0.07) * shimmer * edge * 0.15;

    float vignette = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.6);
    col *= mix(0.85, 1.0, vignette);

    gl_FragColor = vec4(col, 1.0);
  }
`;

const geometry = new THREE.PlaneGeometry(2, 2);
const material = new THREE.ShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragShader,
  uniforms: {
    uTime:       { value: 0 },
    uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
    uResolution: { value: new THREE.Vector2(W, H) },
  },
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  mouse.lerp(targetMouse, 0.04);
  material.uniforms.uTime.value  = clock.getElapsedTime();
  material.uniforms.uMouse.value.copy(mouse);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  const W2 = container.clientWidth;
  const H2 = container.clientHeight;
  renderer.setSize(W2, H2);
  material.uniforms.uResolution.value.set(W2, H2);
});