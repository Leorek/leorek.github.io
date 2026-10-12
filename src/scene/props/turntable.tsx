import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Sprite, SpriteMaterial } from 'three'
import { view } from '../../lib/view-state'
import { canvasTexture, FONT_DISPLAY, FONT_MONO, Hotspot, INK, Part, rbox } from '../paint'

export const TURNTABLE = { x: 2.6, z: -3.38, top: 0.85 }
export const BPM = 124

/** 0..1 kick envelope, shared so other things (Leo's head) can groove too */
export function kick(time: number) {
  const beat = 60 / BPM
  return Math.exp(-((time % beat) / beat) * 7)
}

function useVinylLabel() {
  return useMemo(
    () =>
      canvasTexture(256, 256, (ctx, w, h) => {
        ctx.fillStyle = '#161321'
        ctx.fillRect(0, 0, w, h)
        for (let r = 124; r > 50; r -= 4) {
          ctx.strokeStyle = r % 8 ? '#2a2638' : '#1e1a2c'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2)
          ctx.stroke()
        }
        // label
        ctx.fillStyle = '#ff7849'
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, 46, 0, Math.PI * 2)
        ctx.fill()
        ctx.fillStyle = INK
        ctx.textAlign = 'center'
        ctx.font = `800 20px ${FONT_DISPLAY}`
        ctx.fillText('LEO', w / 2, h / 2 - 8)
        ctx.font = `600 10px ${FONT_MONO}`
        ctx.fillText('SIDE A · 124', w / 2, h / 2 + 12)
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2)
        ctx.fill()
        // a highlight streak so the spin reads
        ctx.strokeStyle = 'rgba(255,255,255,0.18)'
        ctx.lineWidth = 10
        ctx.beginPath()
        ctx.arc(w / 2, h / 2, 95, -0.5, 0.3)
        ctx.stroke()
      }).tex,
    [],
  )
}

function useNoteTexture() {
  return useMemo(
    () =>
      canvasTexture(64, 64, (ctx) => {
        ctx.font = `700 52px ${FONT_DISPLAY}`
        ctx.textAlign = 'center'
        ctx.lineWidth = 6
        ctx.strokeStyle = '#fff6e9'
        ctx.strokeText('♪', 32, 50)
        ctx.fillStyle = INK
        ctx.fillText('♪', 32, 50)
      }).tex,
    [],
  )
}

function Speaker({ x, flip = false }: { x: number; flip?: boolean }) {
  const cone = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const k = view.reduced ? 0 : kick(clock.elapsedTime)
    cone.current.scale.setScalar(1 + k * 0.14)
  })
  return (
    <group position={[x, TURNTABLE.top + 0.33, TURNTABLE.z + 0.02]} rotation-y={flip ? -0.12 : 0.12}>
      <Part color="#5a3a2a" geometry={rbox(0.46, 0.66, 0.42, 0.03)} />
      <group ref={cone} position={[0, -0.1, 0.215]}>
        <Part color={INK} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.15, 0.15, 0.02, 24]} />
        </Part>
        <Part color="#4a4560" position={[0, 0, 0.012]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.11, 0.11, 0.01, 24]} />
        </Part>
        <Part color="#ff7849" position={[0, 0, 0.02]}>
          <sphereGeometry args={[0.04, 12, 8]} />
        </Part>
      </group>
      <Part color={INK} position={[0, 0.19, 0.215]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} />
      </Part>
    </group>
  )
}

function Notes() {
  const tex = useNoteTexture()
  const group = useRef<Group>(null!)
  const mats = useMemo(() => [0, 1, 2, 3].map(() => new SpriteMaterial({ map: tex, transparent: true, depthWrite: false })), [tex])
  useFrame(({ clock }) => {
    if (view.reduced) {
      group.current.visible = false
      return
    }
    // more notes when you're at the turntable
    const near = 1 - Math.min(1, Math.abs(view.progress - 3))
    group.current.children.forEach((s, i) => {
      const t = (clock.elapsedTime * 0.28 + i / 4) % 1
      s.position.set(Math.sin(t * 7 + i * 2) * 0.25 + (i - 1.5) * 0.18, 0.2 + t * 1.3, Math.cos(t * 5 + i) * 0.1)
      ;(s as Sprite).material.opacity = Math.sin(t * Math.PI) * (0.35 + near * 0.65)
      s.scale.setScalar(0.16 + t * 0.06)
    })
  })
  return (
    <group ref={group} position={[TURNTABLE.x - 0.08, TURNTABLE.top, TURNTABLE.z]}>
      {mats.map((m, i) => (
        <sprite key={i} material={m} />
      ))}
    </group>
  )
}

function Crate() {
  const sleeves = ['#2f6b4f', '#ff4f8b', '#ffd166', '#3d5a8a', '#ff7849']
  return (
    <group position={[4.35, 0, -2.45]} rotation-y={-0.35}>
      <Part color="#c98b5b" position={[0, 0.2, 0.3]}>
        <boxGeometry args={[0.7, 0.4, 0.05]} />
      </Part>
      <Part color="#c98b5b" position={[0, 0.2, -0.3]}>
        <boxGeometry args={[0.7, 0.4, 0.05]} />
      </Part>
      <Part color="#b9784f" position={[-0.33, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.6]} />
      </Part>
      <Part color="#b9784f" position={[0.33, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.6]} />
      </Part>
      {sleeves.map((c, i) => (
        <Part
          key={c}
          color={c}
          position={[-0.22 + i * 0.11, 0.38, 0]}
          rotation-z={-0.18 + i * 0.05}
          geometry={rbox(0.03, 0.58, 0.56, 0.01)}
        />
      ))}
    </group>
  )
}

export default function Turntable() {
  const label = useVinylLabel()
  const vinyl = useRef<Group>(null!)
  useFrame((_, dt) => {
    if (!view.reduced) vinyl.current.rotation.y -= dt * 3.5
  })
  const { x, z, top } = TURNTABLE
  return (
    <Hotspot id="music">
      {/* sideboard */}
      <group position={[x, 0, z]}>
        <Part color="#b9784f" position={[0, top / 2 + 0.06, 0]} geometry={rbox(2.7, top - 0.12, 0.7, 0.03)} />
        <Part color="#2a9d8f" position={[-0.66, top / 2 + 0.06, 0.355]} geometry={rbox(1.24, top - 0.24, 0.02, 0.01)} />
        <Part color="#ffd166" position={[0.66, top / 2 + 0.06, 0.355]} geometry={rbox(1.24, top - 0.24, 0.02, 0.01)} />
        {[-1.2, 1.2].map((lx) => (
          <Part key={lx} color="#2d2640" position={[lx, 0.06, 0]}>
            <cylinderGeometry args={[0.04, 0.03, 0.12, 8]} />
          </Part>
        ))}
      </group>

      {/* turntable */}
      <group position={[x, top, z]}>
        <Part color="#e9e2d0" position={[0, 0.06, 0]} geometry={rbox(0.84, 0.12, 0.64, 0.03)} />
        <Part color="#8d99ae" position={[-0.08, 0.135, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.03, 32]} />
        </Part>
        <group ref={vinyl} position={[-0.08, 0.155, 0]}>
          <mesh>
            <cylinderGeometry args={[0.265, 0.265, 0.012, 32]} />
            <meshStandardMaterial roughness={0.9} color="#161321" />
          </mesh>
          <mesh position={[0, 0.007, 0]} rotation-x={-Math.PI / 2}>
            <circleGeometry args={[0.264, 32]} />
            <meshStandardMaterial roughness={0.9} map={label} />
          </mesh>
        </group>
        {/* tonearm */}
        <Part color="#8d99ae" position={[0.3, 0.16, -0.2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 12]} />
        </Part>
        <Part color="#d0d4dc" position={[0.2, 0.2, 0.0]} rotation-x={Math.PI / 2} rotation-z={0.5}>
          <cylinderGeometry args={[0.012, 0.012, 0.44, 6]} />
        </Part>
        <Part color={INK} position={[0.1, 0.19, 0.18]}>
          <boxGeometry args={[0.05, 0.03, 0.07]} />
        </Part>
      </group>
      <Speaker x={x - 1.0} flip />
      <Speaker x={x + 1.0} />
      <Notes />
      <Crate />
    </Hotspot>
  )
}
