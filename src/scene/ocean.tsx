import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { CanvasTexture, Color, MathUtils, ShaderMaterial, Vector3 } from 'three'
import { view } from '../lib/view-state'

const reduced =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MOON_POS = new Vector3(7, 6, -34)

// ---- Gerstner-wave water (no textures) ---------------------------------
const vertex = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vWaveHeight;
  varying float vShore;
  uniform float uTime;

  vec3 waveDisp(vec2 g) {
    vec3 d = vec3(0.0);
    { vec2 dir = normalize(vec2( 1.0,  0.6)); float a=0.55,fr=0.35,sp=0.9,Q=0.55;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    { vec2 dir = normalize(vec2(-0.7,  1.0)); float a=0.32,fr=0.6,sp=1.1,Q=0.5;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    { vec2 dir = normalize(vec2( 0.2, -1.0)); float a=0.16,fr=1.1,sp=1.4,Q=0.4;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    { vec2 dir = normalize(vec2(-1.0, -0.35)); float a=0.09,fr=1.9,sp=1.7,Q=0.35;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    return d;
  }

  void main() {
    vec2 g = position.xy;
    // world z = -local y; shore = 0 far out -> 1 near the camera (the beach)
    float shore = smoothstep(-45.0, 12.0, -position.y);
    float damp = 1.0 - smoothstep(0.6, 0.95, shore);   // flatten waves onto the sand
    vec3 p0 = vec3(position.xy, 0.0) + waveDisp(g) * damp;
    float e = 0.35;
    vec3 pX = vec3(position.x + e, position.y, 0.0) + waveDisp(g + vec2(e, 0.0)) * damp;
    vec3 pY = vec3(position.x, position.y + e, 0.0) + waveDisp(g + vec2(0.0, e)) * damp;
    vec3 n = normalize(cross(pX - p0, pY - p0));

    vec4 world = modelMatrix * vec4(p0, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(normalMatrix * n);
    vViewDir = cameraPosition - world.xyz;
    vWaveHeight = p0.z;
    vShore = shore;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vWaveHeight;
  varying float vShore;
  uniform float uTime, uAbsorb, uWaterLevel, uSeabedNear, uSeabedDeep;
  uniform vec3 uDeep, uHorizon, uMoon, uSSS, uEmber, uNight, uMoonDir, uDeepWater;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.02; a *= 0.5; }
    return s;
  }

  // warm moonlit sand (used for the exposed beach and the seabed under water)
  vec3 sandBase(vec2 p) {
    float dune = fbm(p * 0.12);
    vec3 s = mix(vec3(0.26, 0.22, 0.16), vec3(0.66, 0.56, 0.40), dune); // warm beige
    s += vnoise(p * 2.6) * 0.08;                          // grain
    float ripple = sin(p.x * 1.1 + fbm(p * 0.3) * 5.0) * 0.5 + 0.5;
    s *= 0.84 + 0.16 * ripple;                            // sandbar ripples
    return s;
  }
  // animated caustics: bright threads where two drifting noise fields meet
  float caustics(vec2 p) {
    vec2 cp = p * 0.55;
    float c1 = vnoise(cp + vec2(uTime * 0.10, uTime * 0.07));
    float c2 = vnoise(cp * 1.7 - vec2(uTime * 0.09, uTime * 0.12));
    return pow(max(0.0, 1.0 - abs(c1 - c2) * 3.5), 4.0);
  }

  void main() {
    // fine procedural ripples perturb the normal -> fragments moonlight into glitter
    vec2 q = vWorldPos.xz * 0.7 + vec2(uTime * 0.06, uTime * 0.045);
    float e = 0.12;
    float n0 = vnoise(q) + 0.5 * vnoise(q * 2.3 + 7.0);
    float nx = vnoise(q + vec2(e, 0.0)) + 0.5 * vnoise((q + vec2(e, 0.0)) * 2.3 + 7.0);
    float ny = vnoise(q + vec2(0.0, e)) + 0.5 * vnoise((q + vec2(0.0, e)) * 2.3 + 7.0);

    vec3 N = normalize(vNormal + vec3((n0 - nx) / e, 0.0, (n0 - ny) / e) * 0.16);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uMoonDir);
    float NdotV = clamp(dot(N, V), 0.0, 1.0);
    float dist = length(vViewDir);

    // seabed rises above the waterline near the camera -> exposed beach
    float seabedY = mix(uSeabedDeep, uSeabedNear, vShore);
    float depth = uWaterLevel - seabedY;     // >0 underwater, <0 dry beach

    vec3 col;

    if (depth < 0.0) {
      // --- exposed beach: dry sand darkening to wet sand at the waterline ---
      vec3 dry = sandBase(vWorldPos.xz);
      float wet = smoothstep(-0.5, 0.0, depth);
      col = mix(dry, dry * 0.55, wet);
      col += uMoon * pow(wet, 2.0) * 0.06;   // faint sheen on the wet sand
    } else {
      // --- water: see through to the seabed, absorb with depth, reflect sky ---
      float F0 = 0.02;
      float fres = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

      vec3 Rr = refract(-V, N, 0.75);        // air -> water (ior ~1.33)
      vec3 under;
      if (Rr.y < -0.02) {
        float t = (seabedY - vWorldPos.y) / Rr.y;
        vec2 hit = (vWorldPos + Rr * t).xz;
        float fog = 1.0 - exp(-t * uAbsorb); // Beer-Lambert
        vec3 sand = sandBase(hit) + vec3(0.62, 0.6, 0.5) * caustics(hit) * 0.32 * (1.0 - fog);
        under = mix(sand, uDeepWater, clamp(fog, 0.0, 1.0));
      } else {
        under = uDeepWater;
      }
      under += uSSS * smoothstep(0.35, 1.0, vWaveHeight) * 0.12; // crest scatter

      vec3 R = reflect(-V, N);
      vec3 sky = mix(uHorizon, uDeep, smoothstep(-0.05, 0.6, R.y));
      col = mix(under, sky, fres);

      // moon reflection: broad luminous column under crisp sparse glints
      vec3 H = normalize(V + L);
      float ndh = max(dot(N, H), 0.0);
      float column = pow(ndh, 22.0) * 0.28;
      float glints = pow(ndh, 220.0) * 1.4;
      col += uMoon * (column + glints * (0.25 + fres));

      // crest foam + breaking foam at the shoreline
      float crestFoam = smoothstep(0.74, 1.0, vWaveHeight) * smoothstep(0.5, 0.85, n0);
      float shoreFoam = (1.0 - smoothstep(0.0, 0.4, depth)) * (0.5 + 0.5 * n0);
      col += vec3(0.7, 0.76, 0.85) * (crestFoam * 0.35 + shoreFoam * 0.5);

      // warm ember glow low on the far-left horizon (brand accent)
      float far = smoothstep(35.0, 85.0, dist);
      col += uEmber * far * smoothstep(0.0, 45.0, -vWorldPos.x) * 0.22;
    }

    // dissolve the far sea into the night so the horizon is seamless
    col = mix(col, uNight, smoothstep(30.0, 82.0, dist));

    gl_FragColor = vec4(col, 1.0);
  }
`

function Water() {
  const matRef = useRef<ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMoonDir: { value: MOON_POS.clone().normalize() },
      uDeep: { value: new Color('#08131f') },
      uHorizon: { value: new Color('#26395c') },
      uMoon: { value: new Color('#dfe6ff') },
      uSSS: { value: new Color('#1c5a52') },
      uDeepWater: { value: new Color('#0a2f38') },
      uEmber: { value: new Color('#ff7849') },
      uNight: { value: new Color('#06070b') },
      uWaterLevel: { value: -1.3 },
      uSeabedNear: { value: 0.8 },
      uSeabedDeep: { value: -9.0 },
      uAbsorb: { value: 0.28 },
    }),
    [],
  )

  useFrame((_, dt) => {
    if (!reduced) uniforms.uTime.value += dt
  })

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -1.3, 0]}>
      <planeGeometry args={[160, 160, 220, 220]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

// ---- moon: crisp disc + soft glow baked into ONE billboarded sprite ----
// (a single sprite always faces the camera, so there's no disc/halo seam)
function useMoonTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const ctx = c.getContext('2d')!
    // outer glow
    const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    g.addColorStop(0, 'rgba(223,230,255,0.55)')
    g.addColorStop(0.16, 'rgba(200,212,255,0.28)')
    g.addColorStop(0.42, 'rgba(120,140,210,0.07)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
    // crisp moon disc with a soft anti-aliased edge
    const disc = ctx.createRadialGradient(256, 256, 0, 256, 256, 92)
    disc.addColorStop(0, 'rgba(238,242,255,1)')
    disc.addColorStop(0.82, 'rgba(232,238,255,1)')
    disc.addColorStop(1, 'rgba(232,238,255,0)')
    ctx.fillStyle = disc
    ctx.beginPath()
    ctx.arc(256, 256, 92, 0, Math.PI * 2)
    ctx.fill()
    const tex = new CanvasTexture(c)
    tex.anisotropy = 4
    return tex
  }, [])
}

function Moon() {
  const tex = useMoonTexture()
  return (
    <sprite position={MOON_POS.toArray()} scale={[13, 13, 1]}>
      <spriteMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}

// ---- camera: mouse parallax + recede on scroll -------------------------
function CameraRig() {
  const { camera } = useThree()
  useFrame((_, dt) => {
    // scroll-driven only — no mouse parallax
    camera.position.x = MathUtils.damp(camera.position.x, 0, 2.5, dt)
    camera.position.y = MathUtils.damp(camera.position.y, 3 + view.scroll * 5.5, 2.5, dt)
    camera.lookAt(0, 0.4 - view.scroll * 3.2, -6)
  })
  return null
}

export default function Ocean() {
  return (
    <>
      <CameraRig />
      <Stars radius={120} depth={50} count={reduced ? 0 : 280} factor={3} fade speed={0.4} />
      <Moon />
      <Water />
    </>
  )
}
