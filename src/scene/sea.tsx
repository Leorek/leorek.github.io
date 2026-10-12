import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, ShaderMaterial, Vector3 } from 'three'
import { palette } from '../lib/time-of-day'
import { view } from '../lib/view-state'

// Painterly Mediterranean (RiME-ish). Mostly flat; the look lives in the
// fragment shader:
//  1. soft turquoise shallows → deep blue, with slow painterly colour patches
//  2. a sky sheen: fresnel reflection of the sky gradient off gentle ripples
//  3. a light path under the sun / moon: broad soft sheen + twinkling
//     sparkles in HDR, so bloom turns them into glints
//  4. soft lapping foam on the sand + a band that rolls in
//  5. haze toward the horizon

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
  uniform vec3 uShallow, uDeep, uHorizon, uTop, uFoam, uSand, uBody, uBodyDir;
  uniform float uTime, uShoreZ, uFoamAmount, uGlint;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  float ripples(vec2 p) {
    return noise(p * 0.35 + vec2(uTime * 0.05, uTime * 0.08)) + 0.5 * noise(p * 0.8 - vec2(uTime * 0.07, uTime * 0.03));
  }

  void main() {
    vec3 toCam = cameraPosition - vWorldPos;
    float dist = length(toCam);
    vec3 V = toCam / dist;
    vec2 p = vWorldPos.xz;
    float out_ = uShoreZ - vWorldPos.z; // metres out from the beach

    // gentle ripple normal (flattened with distance so it never shimmers)
    float e = 0.2;
    float h0 = ripples(p);
    vec3 N = normalize(vec3((h0 - ripples(p + vec2(e, 0.0))) * 1.6, 1.0, (h0 - ripples(p + vec2(0.0, e))) * 1.6));
    N = normalize(mix(N, vec3(0.0, 1.0, 0.0), smoothstep(25.0, 110.0, dist)));

    // 1. body colour
    float depthT = smoothstep(0.0, 20.0, out_ + (noise(p * 0.05) - 0.5) * 8.0);
    vec3 col = mix(uShallow, uDeep, depthT);
    col = mix(col, uSand, (1.0 - smoothstep(0.0, 2.8, out_)) * 0.5); // see-through shallows
    col *= 0.93 + 0.14 * noise(p * 0.11 + uTime * 0.01); // painterly patches

    // 2. sky sheen
    vec3 R = reflect(-V, N);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    vec3 sky = mix(uHorizon, uTop, pow(clamp(R.y, 0.0, 1.0), 0.55));
    col = mix(col, sky, clamp(fres, 0.0, 0.8));

    // 3. light path + sparkles (HDR)
    vec3 B = normalize(uBodyDir);
    float spec = max(dot(R, B), 0.0);
    col += uBody * (pow(spec, 40.0) * 0.55 + pow(spec, 400.0) * 1.5) * uGlint;
    vec2 g = p * vec2(1.5, 3.8);
    vec2 cell = floor(g);
    float r = hash(cell);
    float tw = pow(0.5 + 0.5 * sin(uTime * (1.5 + r * 4.0) + r * 50.0), 6.0);
    vec2 f = (fract(g) - 0.5) * vec2(1.0, 0.55);
    float sparkle = step(0.8, r) * (1.0 - smoothstep(0.0, 0.16, length(f))) * tw;
    float path = pow(spec, 6.0);
    col += uBody * sparkle * (path * 7.0 + 0.12) * uGlint * (1.0 - smoothstep(20.0, 75.0, dist));

    // 4. foam at the shore
    float x = vWorldPos.x;
    float lap = 0.6 + 0.3 * sin(x * 0.45 + uTime * 1.4) + 0.15 * sin(x * 1.3 - uTime * 0.9);
    float edge = 1.0 - smoothstep(lap - 0.35, lap + 0.2, out_);
    float roll = fract(uTime * 0.1);
    float bandAt = mix(7.0, 0.8, roll) + sin(x * 0.3 + 2.0) * 0.4;
    float band = (1.0 - smoothstep(0.0, 0.7, abs(out_ - bandAt))) * sin(roll * 3.14159) * 0.55;
    col = mix(col, uFoam, clamp(edge + band, 0.0, 1.0) * uFoamAmount);

    // 5. haze toward the horizon
    col = mix(col, uHorizon, smoothstep(70.0, 175.0, dist) * 0.7);

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const setRGB = (c: Color, rgb: [number, number, number]) => c.setRGB(rgb[0], rgb[1], rgb[2], 'srgb')
const WHITE = new Color('#ffffff')
const MOON = new Color('#dfe6ff')

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
          uTop: { value: new Color() },
          uFoam: { value: new Color() },
          uSand: { value: new Color('#f0d8aa') },
          uBody: { value: new Color() },
          uBodyDir: { value: new Vector3() },
          uFoamAmount: { value: 0.9 },
          uGlint: { value: 1 },
        },
      }),
    [],
  )
  const u = material.uniforms

  useFrame((_, dt) => {
    if (!view.reduced) u.uTime.value += dt
    setRGB(u.uShallow.value, palette.sea)
    setRGB(u.uDeep.value, palette.seaDeep)
    setRGB(u.uHorizon.value, palette.skyHorizon)
    setRGB(u.uTop.value, palette.skyTop)
    // foam: bright by day, a soft moonlit blue at night
    u.uFoam.value.copy(u.uHorizon.value).lerp(WHITE, 0.85 - palette.lamp * 0.35)
    u.uFoamAmount.value = 0.9 - palette.lamp * 0.35
    if (palette.isSun) setRGB(u.uBody.value, palette.key).lerp(WHITE, 0.3)
    else u.uBody.value.copy(MOON)
    u.uBodyDir.value.fromArray(palette.bodyDir)
    u.uGlint.value = palette.isSun ? 1 : 0.7
  })

  // spans x ∈ [-160, 160], z ∈ [-176, -16]
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, SEA_Y + 0.05, SHORE_Z - 80]} material={material}>
      <planeGeometry args={[320, 160, 160, 80]} />
    </mesh>
  )
}
