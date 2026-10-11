import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector3 } from 'three'
import { palette } from '../lib/time-of-day'
import { view } from '../lib/view-state'

// Toon sea (Wind Waker-ish). Mostly flat; the look lives in the fragment:
//  1. turquoise shallows → deep blue, with one crisp "shelf" where it drops
//  2. thin, broken foam streaks that meander and drift (near water only)
//  3. a lapping foam edge on the sand + a foam band that rolls in
//  4. sun / moon glitter path: a column of horizontal dashes, strongest
//     when the body is low (sunset, moonrise), absent at noon
//  5. a crisp horizon: far water stays a shade darker than the sky

export const SEA_Y = -3.6
const SHORE_Z = -16 // where the beach meets the water

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uShoreZ;
  varying vec3 vWorldPos;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    // slow, low swell — just enough to move the silhouette
    float out_ = smoothstep(0.0, 8.0, uShoreZ - world.z);
    world.y += (sin(world.x * 0.11 + uTime * 0.5) * 0.08 + sin(world.z * 0.17 - uTime * 0.42) * 0.06) * out_;
    vWorldPos = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragment = /* glsl */ `
  varying vec3 vWorldPos;
  uniform vec3 uShallow, uDeep, uHorizon, uFoam, uSand, uBody, uBodyDir;
  uniform float uTime, uShoreZ, uFoamAmount, uGlint;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec3 toCam = cameraPosition - vWorldPos;
    float dist = length(toCam);
    vec3 V = toCam / dist;
    float out_ = uShoreZ - vWorldPos.z; // metres out from the beach
    float x = vWorldPos.x;

    // 1. body colour: shallows → shelf → deep, then haze toward the horizon
    float shelf = 9.0 + sin(x * 0.13) * 2.0 + sin(x * 0.31 + 1.7) * 0.8;
    vec3 col = out_ < shelf
      ? mix(uShallow, mix(uShallow, uDeep, 0.4), smoothstep(0.0, shelf, out_))
      : mix(uDeep, mix(uDeep, uHorizon, 0.25), 1.0 - smoothstep(shelf, shelf + 25.0, out_));
    col = mix(col, uSand, (1.0 - smoothstep(0.0, 2.2, out_)) * 0.35); // see-through shallows
    col = mix(col, mix(uDeep, uHorizon, 0.62), smoothstep(30.0, 150.0, dist));

    // 2. foam streaks: the 0.5 contour of domain-warped noise, broken into
    //    dashes — meandering Wind Waker-style lines, faded with distance
    vec2 q = vWorldPos.xz * vec2(0.16, 0.3) + vec2(uTime * 0.02, uTime * 0.035);
    vec2 warp = vec2(noise(q * 1.6 + vec2(0.0, uTime * 0.05)), noise(q * 1.6 + vec2(5.2, -uTime * 0.04)));
    float c = abs(noise(q + warp * 1.4) - 0.5);
    float line = 1.0 - smoothstep(0.018, 0.018 + fwidth(c) * 1.5, c);
    float breakup = smoothstep(0.42, 0.58, noise(q * 3.1 + 7.3 + uTime * 0.05));
    float near = 1.0 - smoothstep(18.0, 50.0, dist);
    col = mix(col, uFoam, line * breakup * near * uFoamAmount);

    // 3. shore: lapping edge + a band rolling in every ~8 s
    float lap = 0.5 + 0.3 * sin(x * 0.45 + uTime * 1.4) + 0.15 * sin(x * 1.3 - uTime * 0.9);
    float edge = 1.0 - smoothstep(lap - 0.06, lap + 0.06, out_);
    float roll = fract(uTime * 0.12);
    float bandAt = mix(6.5, 0.9, roll) + sin(x * 0.3 + 2.0) * 0.4;
    float band = (1.0 - smoothstep(0.12, 0.3, abs(out_ - bandAt))) * smoothstep(0.0, 0.15, roll) * (1.0 - roll * 0.6);
    col = mix(col, uFoam, max(edge, band * 0.85));

    // 4. glitter path under the sun / moon
    vec3 B = normalize(uBodyDir);
    vec3 R = vec3(-V.x, V.y, -V.z); // view ray mirrored on a flat sea
    float dAz = abs(atan(R.x * B.z - R.z * B.x, R.x * B.x + R.z * B.z));
    float width = 0.03 + 0.2 * smoothstep(0.0, 0.5, R.y); // tapers toward the horizon
    float inPath = (1.0 - smoothstep(width * 0.65, width, dAz)) * (1.0 - smoothstep(B.y + 0.12, B.y + 0.4, R.y));
    float core = 1.0 - smoothstep(0.0, width * 0.5, dAz);
    float dash = noise(vec2(x * 0.8, vWorldPos.z * 3.6 + uTime * 1.4)); // stretched → horizontal strokes
    float th = 0.64 - core * 0.22;
    float fw = fwidth(dash);
    col = mix(col, uBody, smoothstep(th - fw, th + fw, dash) * inPath * uGlint);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const setRGB = (c: Color, rgb: [number, number, number]) => c.setRGB(rgb[0], rgb[1], rgb[2], 'srgb')
const WHITE = new Color('#ffffff')
const MOON = new Color('#eef1ff')

export default function Sea() {
  // Built here rather than via <shaderMaterial uniforms>: R3F copies each
  // uniform object on apply, which freezes numeric values (uTime, uGlint…).
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uShoreZ: { value: SHORE_Z },
          uShallow: { value: new Color() },
          uDeep: { value: new Color() },
          uHorizon: { value: new Color() },
          uFoam: { value: new Color() },
          uSand: { value: new Color('#e9cf9b') },
          uBody: { value: new Color() },
          uBodyDir: { value: new Vector3() },
          uFoamAmount: { value: 0.8 },
          uGlint: { value: 0 },
        },
      }),
    [],
  )
  const uniforms = material.uniforms

  useFrame((_, dt) => {
    if (!view.reduced) uniforms.uTime.value += dt
    const u = uniforms
    setRGB(u.uShallow.value, palette.sea)
    setRGB(u.uDeep.value, palette.seaDeep)
    setRGB(u.uHorizon.value, palette.skyHorizon)
    // foam: bright white by day, a soft moonlit blue at night
    u.uFoam.value.copy(u.uHorizon.value).lerp(WHITE, 0.9 - palette.lamp * 0.35)
    u.uFoamAmount.value = 0.85 - palette.lamp * 0.4
    if (palette.isSun) setRGB(u.uBody.value, palette.key).lerp(WHITE, 0.35)
    else u.uBody.value.copy(MOON)
    u.uBodyDir.value.fromArray(palette.bodyDir)
    // the path only reads when the body is low; noon sun is overhead
    const low = 1 - Math.min(1, Math.max(0, (palette.bodyDir[1] - 0.15) / 0.65))
    u.uGlint.value = low * (palette.isSun ? 1 : 0.85)
  })

  // spans x ∈ [-160, 160], z ∈ [-176, -16]
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, SEA_Y + 0.05, SHORE_Z - 80]} material={material}>
      <planeGeometry args={[320, 160, 160, 80]} />
    </mesh>
  )
}
