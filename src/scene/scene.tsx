import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { DirectionalLight, HemisphereLight } from 'three'
import { palette } from '../lib/time-of-day'
import Avatar from './avatar'
import CameraRig from './camera-rig'
import Outside from './outside'
import Arcade from './props/arcade'
import Coaster from './props/coaster'
import CorkMap from './props/cork-map'
import Desk from './props/desk'
import Turntable from './props/turntable'
import Room from './room'

const mobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

function Lights() {
  const hemi = useRef<HemisphereLight>(null!)
  const key = useRef<DirectionalLight>(null!)
  const fill = useRef<DirectionalLight>(null!)

  useFrame(() => {
    const [r, g, b] = palette.hemiSky
    hemi.current.color.setRGB(r, g, b, 'srgb')
    hemi.current.groundColor.setRGB(...palette.hemiGround, 'srgb')
    hemi.current.intensity = palette.hemiIntensity

    // sun / moon through the window; fades as it nears the horizon
    const [x, y, z] = palette.bodyDir
    key.current.position.set(x * 30, y * 30, z * 30)
    key.current.color.setRGB(...palette.key, 'srgb')
    key.current.intensity = palette.keyIntensity * Math.min(1, 0.25 + y * 2.5)

    fill.current.intensity = palette.fill
  })

  const shadowSize = mobile ? 1024 : 2048
  return (
    <>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={key}
        castShadow
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      <directionalLight ref={fill} position={[10, 7, 12]} color="#fff4e6" />
    </>
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
  const [dpr, setDpr] = useState(mobile ? 1.5 : 1.75)
  const [ready, setReady] = useState(false)

  return (
    <div className={`scene-canvas ${ready ? 'is-ready' : ''}`} aria-hidden="true">
      <Canvas
        flat
        shadows="percentage"
        dpr={dpr}
        camera={{ position: [16, 11, 17], fov: 34, near: 0.1, far: 500 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        eventSource={document.body}
        eventPrefix="client"
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(mobile ? 1.5 : 1.75)} />
        <Lights />
        <Outside />
        <Room />
        <Desk />
        <Arcade />
        <Turntable />
        <Coaster />
        <CorkMap />
        <Avatar />
        <CameraRig />
        <Ready onReady={() => setReady(true)} />
      </Canvas>
    </div>
  )
}
