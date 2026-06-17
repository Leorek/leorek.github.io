import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  MathUtils,
  ShaderMaterial,
  Vector3,
} from 'three'
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
    vec3 p0 = vec3(position.xy, 0.0) + waveDisp(g);
    float e = 0.35;
    vec3 pX = vec3(position.x + e, position.y, 0.0) + waveDisp(g + vec2(e, 0.0));
    vec3 pY = vec3(position.x, position.y + e, 0.0) + waveDisp(g + vec2(0.0, e));
    vec3 n = normalize(cross(pX - p0, pY - p0));

    vec4 world = modelMatrix * vec4(p0, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(normalMatrix * n);
    vViewDir = cameraPosition - world.xyz;
    vWaveHeight = p0.z;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vWaveHeight;
  uniform float uTime;
  uniform vec3 uDeep, uHorizon, uMoon, uSSS, uEmber, uNight, uMoonDir;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    // fine procedural ripples perturb the normal -> fragments moonlight into glitter
    vec2 q = vWorldPos.xz * 0.7 + vec2(uTime * 0.06, uTime * 0.045);
    float e = 0.12;
    float n0 = vnoise(q) + 0.5 * vnoise(q * 2.3 + 7.0);
    float nx = vnoise(q + vec2(e, 0.0)) + 0.5 * vnoise((q + vec2(e, 0.0)) * 2.3 + 7.0);
    float ny = vnoise(q + vec2(0.0, e)) + 0.5 * vnoise((q + vec2(0.0, e)) * 2.3 + 7.0);

    vec3 N = normalize(vNormal + vec3((n0 - nx) / e, 0.0, (n0 - ny) / e) * 0.22);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(uMoonDir);
    float NdotV = clamp(dot(N, V), 0.0, 1.0);

    // Schlick fresnel for water: transparent/dark looking down, mirror at grazing
    float F0 = 0.02;
    float fres = F0 + (1.0 - F0) * pow(1.0 - NdotV, 5.0);

    // procedural reflected night sky (cheaper than planar reflection, identical read)
    vec3 R = reflect(-V, N);
    float up = smoothstep(-0.05, 0.55, R.y);
    vec3 sky = mix(uHorizon, uDeep * 0.5, up);
    float mR = max(dot(R, L), 0.0);
    sky += uMoon * pow(mR, 70.0) * 1.3;   // moon mirrored on the surface
    sky += uMoon * pow(mR, 8.0) * 0.12;   // its soft glow

    // deep absorbing body + subsurface glow lifting the moonlit crests
    float sss = smoothstep(0.25, 1.0, vWaveHeight);
    vec3 body = uDeep + uSSS * sss * 0.18;

    // fresnel blends dark depths with reflective sky -> the "wet" look
    vec3 col = mix(body, sky, fres);

    // sharp moon glints — scaled by fresnel so the sparkle lives on the moon
    // path (grazing) and the near water stays calm, not glossy
    vec3 H = normalize(V + L);
    float spec = pow(max(dot(N, H), 0.0), 340.0);
    col += uMoon * spec * 2.0 * (0.1 + fres);

    // foam only on the very tallest crests
    float foam = smoothstep(0.72, 1.0, vWaveHeight) * smoothstep(0.5, 0.85, n0);
    col += vec3(0.6, 0.68, 0.82) * foam * 0.4;

    // warm ember glow low on the far-left horizon (brand accent)
    float dist = length(vViewDir);
    float far = smoothstep(35.0, 85.0, dist);
    float emberMask = smoothstep(0.0, 45.0, -vWorldPos.x);
    col += uEmber * far * emberMask * 0.28;

    // dissolve far water into the night so the horizon is seamless
    float fade = smoothstep(28.0, 80.0, dist);
    col = mix(col, uNight, fade);

    gl_FragColor = vec4(col, 1.0);
  }
`

function Water() {
  const matRef = useRef<ShaderMaterial>(null!)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMoonDir: { value: MOON_POS.clone().normalize() },
      uDeep: { value: new Color('#04080f') },
      uHorizon: { value: new Color('#1b2c49') },
      uMoon: { value: new Color('#cdd9ff') },
      uSSS: { value: new Color('#0b4a44') },
      uEmber: { value: new Color('#ff7849') },
      uNight: { value: new Color('#06070b') },
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

// ---- moon: bright disc + soft halo (runtime canvas gradient) -----------
function useHaloTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(220,228,255,0.9)')
    g.addColorStop(0.18, 'rgba(190,205,255,0.35)')
    g.addColorStop(0.5, 'rgba(120,140,210,0.08)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new CanvasTexture(c)
  }, [])
}

function Moon() {
  const halo = useHaloTexture()
  return (
    <group position={MOON_POS.toArray()}>
      <sprite scale={[26, 26, 1]}>
        <spriteMaterial map={halo} blending={AdditiveBlending} depthWrite={false} transparent />
      </sprite>
      <mesh>
        <circleGeometry args={[2.1, 48]} />
        <meshBasicMaterial color="#eef2ff" toneMapped={false} />
      </mesh>
    </group>
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
