import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, HueSaturation, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import {
  AdditiveBlending,
  Color,
  DirectionalLight,
  DoubleSide,
  Fog,
  Group,
  HemisphereLight,
  Matrix4,
  Mesh,
  ShaderMaterial,
  Vector3,
} from 'three'
import { palette } from '../lib/time-of-day'
import { view } from '../lib/view-state'
import Avatar from './avatar'
import CameraRig from './camera-rig'
import Outside from './outside'
import Arcade from './props/arcade'
import Coaster from './props/coaster'
import CorkMap from './props/cork-map'
import Desk from './props/desk'
import Turntable from './props/turntable'
import Room, { ROOM } from './room'

const mobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
// ?q=high | ?q=low pins the quality tier (otherwise: device guess +
// PerformanceMonitor); ?dpr=1 pins the pixel ratio. Handy for capture/debug.
const params = new URLSearchParams(location.search)
const forced = params.get('q')
const forcedDpr = Number(params.get('dpr')) || null

// ---- light -----------------------------------------------------------------
// Warm key from the sun/moon through the window; the hemisphere's sky colour
// is lavender/periwinkle, so whatever the key doesn't reach goes cool and
// coloured (the RiME/Sorolla shadow), never flat grey.
function Lights() {
  const hemi = useRef<HemisphereLight>(null!)
  const key = useRef<DirectionalLight>(null!)
  const fill = useRef<DirectionalLight>(null!)
  const scene = useThree((s) => s.scene)
  const fog = useMemo(() => new Fog('#f4e6c8', 45, 260), [])
  useEffect(() => {
    scene.fog = fog
    return () => {
      scene.fog = null
    }
  }, [scene, fog])

  useFrame(() => {
    hemi.current.color.setRGB(...palette.hemiSky, 'srgb')
    hemi.current.groundColor.setRGB(...palette.hemiGround, 'srgb')
    hemi.current.intensity = palette.hemiIntensity

    const [x, y, z] = palette.bodyDir
    key.current.position.set(x * 30, y * 30, z * 30)
    key.current.color.setRGB(...palette.key, 'srgb')
    key.current.intensity = palette.keyIntensity * Math.min(1, 0.25 + y * 2.5)

    fill.current.intensity = palette.fill
    fill.current.color.setRGB(...palette.hemiGround, 'srgb')
    fog.color.setRGB(...palette.skyHorizon, 'srgb')
  })

  const shadowSize = mobile ? 1024 : 2048
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={key}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-radius={5}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      {/* warm bounce from the front, keeps faces readable from the camera */}
      <directionalLight ref={fill} position={[10, 6, 12]} />
    </>
  )
}

// ---- light shafts through the window ---------------------------------------
// A few soft additive quads running from the window along the light
// direction, each turned to face the camera around its own axis.
const shaftVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const shaftFragment = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uColor;
  uniform float uIntensity, uTime, uSeed;
  void main() {
    float across = pow(sin(3.14159 * vUv.x), 2.0);
    float along = pow(vUv.y, 1.8); // strongest at the window
    float drift = 0.8 + 0.2 * sin(uTime * 0.6 + uSeed * 9.0 + vUv.y * 4.0);
    gl_FragColor = vec4(uColor, across * along * drift * uIntensity);
  }
`
const SHAFTS = [
  { x: 1.55, y: 3.6, w: 0.55, seed: 0.1 },
  { x: 2.3, y: 2.6, w: 0.85, seed: 0.4 },
  { x: 3.05, y: 3.3, w: 0.6, seed: 0.7 },
  { x: 3.75, y: 2.3, w: 0.45, seed: 0.9 },
]
const SHAFT_LEN = 6.5

function LightShafts() {
  const group = useRef<Group>(null!)
  const camera = useThree((s) => s.camera)
  const mats = useMemo(
    () =>
      SHAFTS.map(
        (s) =>
          new ShaderMaterial({
            vertexShader: shaftVertex,
            fragmentShader: shaftFragment,
            transparent: true,
            depthWrite: false,
            blending: AdditiveBlending,
            side: DoubleSide,
            uniforms: {
              uColor: { value: new Color() },
              uIntensity: { value: 0 },
              uTime: { value: 0 },
              uSeed: { value: s.seed },
            },
          }),
      ),
    [],
  )
  const tmp = useMemo(
    () => ({ dir: new Vector3(), up: new Vector3(), x: new Vector3(), n: new Vector3(), m: new Matrix4() }),
    [],
  )

  useFrame((_, dt) => {
    const [bx, by, bz] = palette.bodyDir
    const { dir, up, x, n, m } = tmp
    dir.set(-bx, -by, -bz).normalize() // the way the light travels (into the room)
    const strength = Math.max(0, Math.min(1, by * 3)) * (palette.isSun ? 0.055 : 0.04) * palette.keyIntensity
    group.current.visible = strength > 0.005
    group.current.children.forEach((child, i) => {
      const s = SHAFTS[i]
      const mesh = child as Mesh
      // centre = origin on the window + half a shaft along the light
      mesh.position.set(s.x, s.y, -ROOM.d / 2 + ROOM.wall).addScaledVector(dir, SHAFT_LEN / 2)
      up.copy(dir).negate() // local +y points back to the window / sun
      n.subVectors(camera.position, mesh.position)
      n.addScaledVector(up, -n.dot(up)).normalize()
      x.crossVectors(up, n).normalize()
      mesh.quaternion.setFromRotationMatrix(m.makeBasis(x, up, n))
      const u = mats[i].uniforms
      u.uColor.value.setRGB(...palette.key, 'srgb')
      // fade out when the camera is right inside a shaft (no hard quad edges in your face)
      u.uIntensity.value = strength * Math.min(1, Math.max(0, (camera.position.distanceTo(mesh.position) - 2) / 3))
      if (!view.reduced) u.uTime.value += dt
    })
  })

  return (
    <group ref={group}>
      {SHAFTS.map((s, i) => (
        <mesh key={s.seed} material={mats[i]} renderOrder={2}>
          <planeGeometry args={[s.w, SHAFT_LEN]} />
        </mesh>
      ))}
    </group>
  )
}

// ---- post ------------------------------------------------------------------
function Post({ high }: { high: boolean }) {
  return high ? (
    <EffectComposer multisampling={4}>
      <N8AO halfRes aoRadius={0.5} distanceFalloff={0.5} intensity={2.2} color="#3a2d5c" quality="medium" />
      <Bloom mipmapBlur intensity={0.75} luminanceThreshold={0.85} luminanceSmoothing={0.3} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <HueSaturation saturation={0.18} />
      <Vignette offset={0.3} darkness={0.4} />
    </EffectComposer>
  ) : (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.65} luminanceThreshold={0.9} luminanceSmoothing={0.3} resolutionScale={0.5} />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      <HueSaturation saturation={0.18} />
      <Vignette offset={0.3} darkness={0.38} />
    </EffectComposer>
  )
}

/** Signals the first rendered frames so the canvas can fade in. */
function Ready({ onReady }: { onReady: () => void }) {
  const gl = useThree((s) => s.gl)
  const frames = useRef(0)
  useFrame(() => {
    if (frames.current++ === 3) onReady()
  })
  useEffect(() => {
    gl.domElement.setAttribute('aria-hidden', 'true')
  }, [gl])
  return null
}

export default function Scene() {
  const [high, setHigh] = useState(forced ? forced === 'high' : !mobile)
  const [dpr, setDpr] = useState(forcedDpr ?? (mobile ? 1.5 : 1.75))
  const [ready, setReady] = useState(false)

  return (
    <div className={`scene-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <Canvas
        flat
        shadows="percentage"
        dpr={dpr}
        camera={{ position: [16, 11, 17], fov: 34, near: 0.1, far: 500 }}
        gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
        eventSource={document.body}
        eventPrefix="client"
      >
        {!forced && (
          <PerformanceMonitor
            onDecline={() => {
              setDpr(1)
              setHigh(false)
            }}
          />
        )}
        <Lights />
        <LightShafts />
        <Outside />
        <Room />
        <Desk />
        <Arcade />
        <Turntable />
        <Coaster />
        <CorkMap />
        <Avatar />
        <CameraRig />
        <Post high={high} />
        <Ready onReady={() => setReady(true)} />
      </Canvas>
    </div>
  )
}
