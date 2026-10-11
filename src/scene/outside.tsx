import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Color, Group, Vector3 } from 'three'
import { palette } from '../lib/time-of-day'
import { view } from '../lib/view-state'
import { Part } from './toon'

// Everything beyond the window: sky, the Mediterranean, the seafront,
// La Farola (Málaga's lighthouse) and a Ferris wheel down the coast.

const SEA_Y = -3.6

const setColor = (c: Color, rgb: [number, number, number]) => c.setRGB(rgb[0], rgb[1], rgb[2], 'srgb')
const MOON = new Color('#eef1ff')
const bodyColor = (c: Color) =>
  palette.isSun ? setColor(c, palette.key).lerp(MOON, 0.25) : c.copy(MOON)

// ---- sky dome ---------------------------------------------------------------
const skyVertex = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    vec4 p = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * p;
  }
`
const skyFragment = /* glsl */ `
  varying vec3 vDir;
  uniform vec3 uTop, uHorizon, uGround, uBody, uBodyDir, uClouds;
  uniform float uStars, uTime, uIsSun;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
  float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash2(i), hash2(i + vec2(1, 0)), u.x), mix(hash2(i + vec2(0, 1)), hash2(i + vec2(1, 1)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; }
    return s;
  }

  void main() {
    vec3 d = normalize(vDir);
    float h = d.y;
    vec3 col = h > 0.0
      ? mix(uHorizon, uTop, smoothstep(0.0, 0.55, h))
      : mix(uHorizon, uGround, smoothstep(0.0, 0.12, -h));

    // stars (night): hashed cells, a few twinkle
    vec3 cell = floor(d * 150.0);
    float r = hash(cell);
    float tw = 0.65 + 0.35 * sin(uTime * 2.0 + r * 60.0);
    col += step(0.993, r) * smoothstep(0.04, 0.2, h) * uStars * tw;

    // flat toon clouds in a band above the horizon
    vec2 cuv = d.xz / (h + 0.18) * 1.3 + vec2(uTime * 0.006, 0.0);
    float n = fbm(cuv);
    float band = smoothstep(0.02, 0.1, h) * (1.0 - smoothstep(0.32, 0.55, h));
    float cloud = step(0.6, n) * band;
    float cloudLit = step(0.68, n) * band;
    col = mix(col, mix(uClouds, uHorizon, 0.35), cloud * 0.9);
    col = mix(col, uClouds, cloudLit * 0.9);

    // sun / moon: crisp disc + two stepped halo rings (toon bloom)
    float a = acos(clamp(dot(d, normalize(uBodyDir)), -1.0, 1.0));
    float size = mix(0.045, 0.06, uIsSun);
    col = mix(col, mix(col, uBody, 0.35), step(a, size * 3.4));
    col = mix(col, mix(col, uBody, 0.6), step(a, size * 2.0));
    col = mix(col, uBody * mix(1.05, 1.25, uIsSun), step(a, size));

    gl_FragColor = vec4(col, 1.0);
  }
`

function Sky() {
  const uniforms = useMemo(
    () => ({
      uTop: { value: new Color() },
      uHorizon: { value: new Color() },
      uGround: { value: new Color() },
      uBody: { value: new Color() },
      uClouds: { value: new Color() },
      uBodyDir: { value: new Vector3() },
      uStars: { value: 0 },
      uTime: { value: 0 },
      uIsSun: { value: 1 },
    }),
    [],
  )
  useFrame((_, dt) => {
    setColor(uniforms.uTop.value, palette.skyTop)
    setColor(uniforms.uHorizon.value, palette.skyHorizon)
    setColor(uniforms.uGround.value, palette.skyGround)
    setColor(uniforms.uClouds.value, palette.clouds)
    bodyColor(uniforms.uBody.value)
    uniforms.uBodyDir.value.fromArray(palette.bodyDir)
    uniforms.uStars.value = palette.stars
    uniforms.uIsSun.value = palette.isSun ? 1 : 0
    if (!view.reduced) uniforms.uTime.value += dt
  })
  return (
    <mesh renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[180, 48, 24]} />
      <shaderMaterial
        side={BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={skyVertex}
        fragmentShader={skyFragment}
      />
    </mesh>
  )
}

// ---- toon sea (Gerstner waves from the previous hero, cel-shaded) ----------
const seaVertex = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  varying vec2 vLocal;
  uniform float uTime;

  vec3 waveDisp(vec2 g) {
    vec3 d = vec3(0.0);
    { vec2 dir = normalize(vec2( 1.0,  0.6)); float a=0.38,fr=0.35,sp=0.9,Q=0.55;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    { vec2 dir = normalize(vec2(-0.7,  1.0)); float a=0.22,fr=0.6,sp=1.1,Q=0.5;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    { vec2 dir = normalize(vec2( 0.2, -1.0)); float a=0.11,fr=1.1,sp=1.4,Q=0.4;
      float f = fr*dot(dir,g) + uTime*sp; d.xy += Q*a*dir*cos(f); d.z += a*sin(f); }
    return d;
  }

  void main() {
    vec2 g = position.xy;
    // the plane is rotated so world z = -local y: local y = -80 is the shore
    vec2 local = vec2(position.x, -position.y);
    float calm = 1.0 - smoothstep(55.0, 80.0, local.y);
    vec3 p0 = vec3(g, 0.0) + waveDisp(g) * calm;
    float e = 0.4;
    vec3 pX = vec3(g + vec2(e, 0.0), 0.0) + waveDisp(g + vec2(e, 0.0)) * calm;
    vec3 pY = vec3(g + vec2(0.0, e), 0.0) + waveDisp(g + vec2(0.0, e)) * calm;
    vec3 n = normalize(cross(pX - p0, pY - p0));
    vec4 world = modelMatrix * vec4(p0, 1.0);
    vWorldPos = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * n);
    vHeight = p0.z;
    vLocal = local;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`
const seaFragment = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vHeight;
  varying vec2 vLocal;
  uniform vec3 uSea, uDeep, uHorizon, uBody, uBodyDir;
  uniform float uTime, uGlint;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(cameraPosition - vWorldPos);
    float dist = length(cameraPosition - vWorldPos);

    // two-tone body: troughs deep, crests light
    float crest = step(0.05, vHeight + (noise(vWorldPos.xz * 0.6) - 0.5) * 0.25);
    vec3 col = mix(uDeep, uSea, 0.35 + 0.45 * crest);

    // banded fresnel toward the horizon
    float fres = 1.0 - max(dot(N, V), 0.0);
    col = mix(col, uHorizon, step(0.82, fres) * 0.45);

    // glitter path under the sun / moon: hard-edged glints
    vec3 R = reflect(-V, N);
    float s = dot(R, normalize(uBodyDir));
    float sparkle = step(0.6, noise(vWorldPos.xz * 3.0 + uTime * 0.8));
    col = mix(col, uBody, step(0.992, s) * sparkle * uGlint);
    col = mix(col, mix(col, uBody, 0.35), step(0.96, s) * uGlint * 0.6);

    // foam: crest caps + a lapping line at the shore
    float caps = step(0.34, vHeight + noise(vWorldPos.xz * 1.4 + uTime * 0.3) * 0.18);
    float shoreY = 80.0 - 1.4 - sin(vLocal.x * 0.35 + uTime * 1.2) * 0.6;
    float shore = step(shoreY, vLocal.y) + step(shoreY - 2.6, vLocal.y) * step(vLocal.y, shoreY - 1.9);
    vec3 foam = mix(uHorizon, vec3(1.0), 0.55 + 0.4 * uGlint);
    col = mix(col, foam, clamp(caps * 0.85 + shore, 0.0, 1.0));

    // melt into the sky at the horizon
    col = mix(col, uHorizon, smoothstep(55.0, 150.0, dist));
    gl_FragColor = vec4(col, 1.0);
  }
`

function Sea() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSea: { value: new Color() },
      uDeep: { value: new Color() },
      uHorizon: { value: new Color() },
      uBody: { value: new Color() },
      uBodyDir: { value: new Vector3() },
      uGlint: { value: 1 },
    }),
    [],
  )
  useFrame((_, dt) => {
    if (!view.reduced) uniforms.uTime.value += dt
    setColor(uniforms.uSea.value, palette.sea)
    setColor(uniforms.uDeep.value, palette.seaDeep)
    setColor(uniforms.uHorizon.value, palette.skyHorizon)
    bodyColor(uniforms.uBody.value)
    uniforms.uBodyDir.value.fromArray(palette.bodyDir)
    uniforms.uGlint.value = Math.min(1, palette.bodyDir[1] * 4 + 0.2)
  })
  // plane spans z ∈ [-176, -16]; vLocal.y = 80 at the shoreline
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, SEA_Y + 0.05, -96]}>
      <planeGeometry args={[320, 160, 200, 110]} />
      <shaderMaterial uniforms={uniforms} vertexShader={seaVertex} fragmentShader={seaFragment} />
    </mesh>
  )
}

// ---- seafront --------------------------------------------------------------
function Palm({ position, scale = 1, lean = 0 }: { position: [number, number, number]; scale?: number; lean?: number }) {
  const leaves = useMemo(() => Array.from({ length: 7 }, (_, i) => (i / 7) * Math.PI * 2), [])
  return (
    <group position={position} scale={scale} rotation-z={lean}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Part
          key={i}
          color={i % 2 ? '#8a5a3c' : '#a06a45'}
          position={[i * 0.06, 0.5 + i * 0.95, 0]}
          outline={0.8}
        >
          <cylinderGeometry args={[0.2 - i * 0.02, 0.24 - i * 0.02, 1.0, 8]} />
        </Part>
      ))}
      <group position={[0.3, 5.1, 0]}>
        {leaves.map((a) => (
          <group key={a} rotation-y={a}>
            <Part color="#3f9b52" position={[1.1, -0.3, 0]} rotation-z={-0.45} scale={[1.5, 0.12, 0.42]} outline={0.8}>
              <sphereGeometry args={[1, 10, 6]} />
            </Part>
          </group>
        ))}
        <Part color="#6b4a2f" outline={0.8}>
          <sphereGeometry args={[0.35, 10, 8]} />
        </Part>
      </group>
    </group>
  )
}

function Lighthouse() {
  const beam = useRef<Group>(null!)
  const glass = useRef<{ color: Color }>(null!)
  useFrame((_, dt) => {
    if (!view.reduced) beam.current.rotation.y += dt * 0.9
    beam.current.visible = palette.lamp > 0.4
    glass.current.color.setRGB(1, 0.85, 0.5).multiplyScalar(0.5 + palette.lamp * 0.8)
  })
  return (
    <group position={[14, SEA_Y, -36]} scale={1.35}>
      {/* breakwater */}
      <Part color="#9a8f86" position={[-6, 0.4, 0]} outline={0.8}>
        <boxGeometry args={[14, 0.8, 1.6]} />
      </Part>
      {/* tower (La Farola is short and whitewashed) */}
      <Part color="#f4efe6" position={[0, 0.8 + 1.4, 0]} outline={0.8}>
        <boxGeometry args={[2.4, 2.8, 2.4]} />
      </Part>
      <Part color="#f4efe6" position={[0, 3.6 + 1.8, 0]} outline={0.8}>
        <cylinderGeometry args={[0.7, 0.85, 3.6, 12]} />
      </Part>
      <Part color="#3b3a4a" position={[0, 7.45, 0]} outline={0.8}>
        <cylinderGeometry args={[0.9, 0.9, 0.18, 12]} />
      </Part>
      <mesh position={[0, 8.0, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.9, 12]} />
        <meshBasicMaterial ref={glass as never} toneMapped={false} />
      </mesh>
      <Part color="#c0392b" position={[0, 8.75, 0]} outline={0.8}>
        <coneGeometry args={[0.7, 0.7, 12]} />
      </Part>
      <group ref={beam} position={[0, 8.0, 0]}>
        <mesh position={[9, 0, 0]} rotation-z={Math.PI / 2}>
          <coneGeometry args={[1.4, 18, 16, 1, true]} />
          <meshBasicMaterial color="#ffe7a8" transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

function FerrisWheel() {
  const wheel = useRef<Group>(null!)
  const cabins = useMemo(() => Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2), [])
  const lights = useRef<{ color: Color }>(null!)
  useFrame((_, dt) => {
    if (view.reduced) return
    wheel.current.rotation.z += dt * 0.08
    wheel.current.children.forEach((c) => {
      if (c.userData.cabin) c.rotation.z = -wheel.current.rotation.z
    })
    lights.current.color.set(palette.lamp > 0.4 ? '#ffd27a' : '#e8e2d6')
  })
  return (
    <group position={[-5.5, SEA_Y, -30]} rotation-y={0.35}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0, s * 0.6]}>
          <Part color="#e8e2d6" position={[-1.6, 3.3, 0]} rotation-z={-0.42} outline={0.8}>
            <boxGeometry args={[0.25, 7.2, 0.25]} />
          </Part>
          <Part color="#e8e2d6" position={[1.6, 3.3, 0]} rotation-z={0.42} outline={0.8}>
            <boxGeometry args={[0.25, 7.2, 0.25]} />
          </Part>
        </group>
      ))}
      <group ref={wheel} position={[0, 6.6, 0]}>
        <mesh>
          <torusGeometry args={[4.2, 0.12, 8, 48]} />
          <meshBasicMaterial ref={lights as never} toneMapped={false} />
        </mesh>
        {cabins.map((a) => (
          <group key={a} rotation-z={a}>
            <Part color="#e8e2d6" position={[0, 2.1, 0]} outline={0.6}>
              <boxGeometry args={[0.08, 4.2, 0.08]} />
            </Part>
          </group>
        ))}
        {cabins.map((a, i) => (
          <group key={`c${a}`} position={[Math.cos(a) * 4.2, Math.sin(a) * 4.2, 0]} userData={{ cabin: true }}>
            <Part color={['#ff7849', '#2a9d8f', '#ffd166'][i % 3]} position={[0, -0.45, 0]} outline={0.8}>
              <boxGeometry args={[0.6, 0.6, 0.6]} />
            </Part>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function Outside() {
  return (
    <>
      <Sky />
      <Sea />
      {/* beach + promenade between the building and the sea */}
      <Part color="#e9cf9b" position={[0, SEA_Y - 0.25, -10]} outline={false}>
        <boxGeometry args={[320, 0.5, 13]} />
      </Part>
      <Part color="#d8cfc4" position={[0, SEA_Y - 0.2, 14]} outline={false}>
        <boxGeometry args={[320, 0.5, 35]} />
      </Part>
      <Palm position={[-7, SEA_Y, -7.5]} scale={1.05} lean={0.05} />
      <Palm position={[-4.6, SEA_Y, -10]} scale={0.95} lean={-0.06} />
      <Palm position={[8.2, SEA_Y, -7]} scale={1.1} lean={0.04} />
      <Palm position={[13, SEA_Y, -9.5]} scale={0.9} lean={-0.05} />
      <Lighthouse />
      <FerrisWheel />
      {/* a hint of the coast curving west */}
      <Part color="#6f7fa6" position={[70, SEA_Y, -120]} scale={[40, 7, 14]} outline={false}>
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </Part>
    </>
  )
}
