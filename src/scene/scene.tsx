import { Canvas } from '@react-three/fiber'
import { Suspense, useEffect } from 'react'
import Ocean from './ocean'
import { bindViewListeners } from '../lib/view-state'

export default function Scene() {
  useEffect(() => bindViewListeners(), [])

  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 3, 11], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Ocean />
        </Suspense>
      </Canvas>
    </div>
  )
}
