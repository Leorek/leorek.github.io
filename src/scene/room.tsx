import { useMemo } from 'react'
import { RepeatWrapping } from 'three'
import { canvasTexture, FONT_DISPLAY, FONT_MONO, INK, Part, rbox } from './toon'

// The studio shell: a cut-away room (two walls + floor) on the top floor of
// a seafront building, plus the decor that isn't a hotspot.

export const ROOM = {
  w: 10, // x: -5..5
  d: 8, // z: -4..4
  h: 4.8,
  wall: 0.3,
  window: { x0: 1.0, x1: 4.2, y0: 1.6, y1: 4.2 },
}
const BACK_Z = -ROOM.d / 2 + ROOM.wall / 2 // wall centre
const LEFT_X = -ROOM.w / 2 + ROOM.wall / 2
const WALL = '#efe2cc'
const WAINSCOT = '#3e8f86'
const CUT = '#2d2640' // the "cut" faces of the diorama
const FRAME = '#f7f1e6'

function usePlanks() {
  return useMemo(() => {
    const { tex } = canvasTexture(512, 512, (ctx, w, h) => {
      const rows = 8
      const rh = h / rows
      for (let r = 0; r < rows; r++) {
        let x = (r % 2) * -90
        while (x < w) {
          const len = 170 + ((r * 53 + x * 7) % 90)
          const tone = 0.9 + (((r * 31 + x) % 7) / 7) * 0.16
          ctx.fillStyle = `rgb(${Math.round(201 * tone)} ${Math.round(139 * tone)} ${Math.round(91 * tone)})`
          ctx.fillRect(x, r * rh, len, rh)
          ctx.fillStyle = 'rgba(60,30,20,0.55)'
          ctx.fillRect(x, r * rh, 3, rh)
          x += len
        }
        ctx.fillStyle = 'rgba(60,30,20,0.6)'
        ctx.fillRect(0, r * rh, w, 3)
      }
    })
    tex.wrapS = tex.wrapT = RepeatWrapping
    tex.repeat.set(2.4, 2)
    return tex
  }, [])
}

function Shell() {
  const planks = usePlanks()
  const { x0, x1, y0, y1 } = ROOM.window
  const H = ROOM.h
  const T = ROOM.wall
  return (
    <group>
      {/* the building under the studio */}
      <Part color="#f0cf96" position={[0, -1.95, 0]}>
        <boxGeometry args={[ROOM.w + 0.4, 3.3, ROOM.d + 0.4]} />
      </Part>
      {[-3.2, 0, 3.2].map((x) => (
        <group key={x}>
          {[-1.15, -2.65].map((y) => (
            <group key={y}>
              <Part color="#3d5a8a" position={[x, y, ROOM.d / 2 + 0.22]} outline={0.8}>
                <boxGeometry args={[1.0, 0.95, 0.06]} />
              </Part>
              <Part color={FRAME} position={[x, y - 0.55, ROOM.d / 2 + 0.3]} outline={0.8}>
                <boxGeometry args={[1.25, 0.1, 0.25]} />
              </Part>
            </group>
          ))}
        </group>
      ))}
      {[-2.4, 0.8].map((z) => (
        <Part key={z} color="#3d5a8a" position={[ROOM.w / 2 + 0.22, -1.6, z]} outline={0.8}>
          <boxGeometry args={[0.06, 1.0, 1.3]} />
        </Part>
      ))}

      {/* floor slab + planks */}
      <Part color={CUT} position={[0, -0.15, 0]}>
        <boxGeometry args={[ROOM.w, 0.3, ROOM.d]} />
      </Part>
      <mesh rotation-x={-Math.PI / 2} position={[0.15, 0.002, 0.15]} receiveShadow>
        <planeGeometry args={[ROOM.w - T, ROOM.d - T]} />
        <meshToonMaterial map={planks} color="#ffffff" />
      </mesh>

      {/* back wall, built around the window opening */}
      <Part color={WALL} position={[(-ROOM.w / 2 + x0) / 2, H / 2, BACK_Z]}>
        <boxGeometry args={[x0 + ROOM.w / 2, H, T]} />
      </Part>
      <Part color={WALL} position={[(x1 + ROOM.w / 2) / 2, H / 2, BACK_Z]}>
        <boxGeometry args={[ROOM.w / 2 - x1, H, T]} />
      </Part>
      <Part color={WALL} position={[(x0 + x1) / 2, y0 / 2, BACK_Z]}>
        <boxGeometry args={[x1 - x0, y0, T]} />
      </Part>
      <Part color={WALL} position={[(x0 + x1) / 2, (y1 + H) / 2, BACK_Z]}>
        <boxGeometry args={[x1 - x0, H - y1, T]} />
      </Part>

      {/* left wall */}
      <Part color={WALL} position={[LEFT_X, H / 2, 0]}>
        <boxGeometry args={[T, H, ROOM.d]} />
      </Part>

      {/* cut caps on top of the walls */}
      <Part color={CUT} position={[0, H + 0.04, BACK_Z]} outline={false}>
        <boxGeometry args={[ROOM.w + 0.02, 0.08, T + 0.02]} />
      </Part>
      <Part color={CUT} position={[LEFT_X, H + 0.04, 0]} outline={false}>
        <boxGeometry args={[T + 0.02, 0.08, ROOM.d + 0.02]} />
      </Part>

      {/* wainscot + skirting */}
      {/* (the window starts above the wainscot, so one strip spans the wall) */}
      <Part color={WAINSCOT} position={[T / 2, 0.55, BACK_Z + T / 2 + 0.02]} outline={false}>
        <boxGeometry args={[ROOM.w - T, 1.1, 0.04]} />
      </Part>
      <Part color={WAINSCOT} position={[LEFT_X + T / 2 + 0.02, 0.55, T / 2]} outline={false}>
        <boxGeometry args={[0.04, 1.1, ROOM.d - T]} />
      </Part>
      <Part color="#f7f1e6" position={[T / 2, 1.12, BACK_Z + T / 2 + 0.04]} outline={0.6}>
        <boxGeometry args={[ROOM.w - T, 0.06, 0.06]} />
      </Part>
      <Part color="#f7f1e6" position={[LEFT_X + T / 2 + 0.04, 1.12, T / 2]} outline={0.6}>
        <boxGeometry args={[0.06, 0.06, ROOM.d - T]} />
      </Part>
    </group>
  )
}

function WindowFrame() {
  const { x0, x1, y0, y1 } = ROOM.window
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2 + 0.05
  const z = BACK_Z
  const bar = 0.12
  return (
    <group>
      <Part color={FRAME} position={[x0 + bar / 2, cy, z]}>
        <boxGeometry args={[bar, y1 - y0, 0.4]} />
      </Part>
      <Part color={FRAME} position={[x1 - bar / 2, cy, z]}>
        <boxGeometry args={[bar, y1 - y0, 0.4]} />
      </Part>
      <Part color={FRAME} position={[cx, y1 - bar / 2, z]}>
        <boxGeometry args={[x1 - x0, bar, 0.4]} />
      </Part>
      <Part color={FRAME} position={[cx, y0 + 0.02, z + 0.1]}>
        <boxGeometry args={[x1 - x0 + 0.4, 0.1, 0.62]} />
      </Part>
      {/* mullions */}
      <Part color={FRAME} position={[cx, cy, z]} outline={0.7}>
        <boxGeometry args={[0.07, y1 - y0, 0.1]} />
      </Part>
      <Part color={FRAME} position={[cx, y0 + (y1 - y0) * 0.62, z]} outline={0.7}>
        <boxGeometry args={[x1 - x0, 0.07, 0.1]} />
      </Part>
      {/* curtains + rod */}
      <Part color="#3b3550" position={[cx, y1 + 0.32, z + 0.32]} rotation-z={Math.PI / 2} outline={0.7}>
        <cylinderGeometry args={[0.035, 0.035, x1 - x0 + 1.4, 8]} />
      </Part>
      {[x0 - 0.38, x1 + 0.38].map((x, side) => (
        <group key={x} position={[x, y1 + 0.32, z + 0.34]}>
          {[-0.14, 0, 0.14].map((dx, i) => (
            <Part
              key={dx}
              color={i === 1 ? '#e2603f' : '#ef7a55'}
              position={[dx, -1.75, (i % 2) * 0.05]}
              rotation-z={(side ? -1 : 1) * 0.025}
            >
              <cylinderGeometry args={[0.1, 0.14, 3.5, 10]} />
            </Part>
          ))}
        </group>
      ))}
      {/* sill plant */}
      <group position={[x0 + 0.45, y0 + 0.08, z + 0.2]}>
        <Part color="#c8643b">
          <cylinderGeometry args={[0.13, 0.1, 0.24, 12]} />
        </Part>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part
            key={i}
            color="#4caf5f"
            position={[Math.cos(i * 1.3) * 0.08, 0.2 + i * 0.03, Math.sin(i * 1.3) * 0.08]}
            scale={[0.09, 0.14, 0.09]}
            outline={0.7}
          >
            <sphereGeometry args={[1, 8, 6]} />
          </Part>
        ))}
      </group>
    </group>
  )
}

function usePosters() {
  return useMemo(() => {
    const airtime = canvasTexture(320, 420, (ctx, w, h) => {
      const g = ctx.createLinearGradient(0, 0, 0, h)
      g.addColorStop(0, '#ffcf6b')
      g.addColorStop(1, '#ff7849')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)
      // sun
      ctx.fillStyle = '#fff3d6'
      ctx.beginPath()
      ctx.arc(w * 0.7, h * 0.36, 52, 0, Math.PI * 2)
      ctx.fill()
      // coaster silhouette
      ctx.strokeStyle = INK
      ctx.lineWidth = 9
      ctx.beginPath()
      ctx.moveTo(-10, h * 0.82)
      ctx.bezierCurveTo(w * 0.2, h * 0.82, w * 0.25, h * 0.2, w * 0.42, h * 0.22)
      ctx.bezierCurveTo(w * 0.6, h * 0.24, w * 0.58, h * 0.78, w * 0.75, h * 0.7)
      ctx.bezierCurveTo(w * 0.86, h * 0.64, w * 0.9, h * 0.5, w + 10, h * 0.55)
      ctx.stroke()
      ctx.lineWidth = 4
      for (let i = 0; i < 9; i++) {
        const x = 30 + i * 34
        ctx.beginPath()
        ctx.moveTo(x, h * 0.86)
        ctx.lineTo(x, h * (i === 3 || i === 4 ? 0.3 : 0.62))
        ctx.stroke()
      }
      ctx.fillStyle = INK
      ctx.fillRect(0, h * 0.86, w, h)
      ctx.fillStyle = '#fff3d6'
      ctx.font = `800 54px ${FONT_DISPLAY}`
      ctx.textAlign = 'center'
      ctx.fillText('AIRTIME', w / 2, h * 0.14)
      ctx.font = `600 17px ${FONT_MONO}`
      ctx.fillText('LEOLAND · RIDE OF THE YEAR', w / 2, h * 0.95)
    }).tex

    const bpm = canvasTexture(300, 390, (ctx, w, h) => {
      ctx.fillStyle = '#2a2350'
      ctx.fillRect(0, 0, w, h)
      // celtic-ish triple rings + equaliser
      ctx.strokeStyle = '#3ad0b5'
      ctx.lineWidth = 7
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 - Math.PI / 2
        ctx.beginPath()
        ctx.arc(w / 2 + Math.cos(a) * 34, h * 0.36 + Math.sin(a) * 34, 40, 0, Math.PI * 2)
        ctx.stroke()
      }
      for (let i = 0; i < 12; i++) {
        const bh = 18 + ((i * 37) % 70)
        ctx.fillStyle = i % 2 ? '#ff7849' : '#ffd166'
        ctx.fillRect(20 + i * 22, h * 0.78 - bh, 14, bh)
      }
      ctx.fillStyle = '#fff3d6'
      ctx.textAlign = 'center'
      ctx.font = `800 58px ${FONT_DISPLAY}`
      ctx.fillText('128', w / 2, h * 0.88)
      ctx.font = `600 16px ${FONT_MONO}`
      ctx.fillText('CELTIC × ELECTRONIC', w / 2, h * 0.95)
      ctx.fillText('BPM', w / 2, h * 0.1)
    }).tex

    const triskele = canvasTexture(256, 256, (ctx, w, h) => {
      ctx.fillStyle = '#f1e2c2'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#2f6b4f'
      ctx.lineWidth = 9
      ctx.lineCap = 'round'
      for (let k = 0; k < 3; k++) {
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.rotate((k / 3) * Math.PI * 2)
        ctx.beginPath()
        for (let t = 0; t < 3.2 * Math.PI; t += 0.1) {
          const r = 6 + t * 7
          const x = 40 + Math.cos(t) * r * 0.55
          const y = Math.sin(t) * r * 0.55
          if (t === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
        ctx.restore()
      }
      ctx.strokeStyle = '#8a5536'
      ctx.lineWidth = 10
      ctx.beginPath()
      ctx.arc(w / 2, h / 2, w / 2 - 12, 0, Math.PI * 2)
      ctx.stroke()
    }).tex

    return { airtime, bpm, triskele }
  }, [])
}

function Decor() {
  const posters = usePosters()
  const wallZ = BACK_Z + ROOM.wall / 2
  const wallX = LEFT_X + ROOM.wall / 2
  return (
    <group>
      {/* posters above the desk */}
      <group position={[-2.05, 3.4, wallZ + 0.03]} rotation-z={0.035}>
        <Part color={INK} geometry={rbox(1.02, 1.32, 0.04, 0.02)} />
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.94, 1.24]} />
          <meshToonMaterial map={posters.airtime} />
        </mesh>
      </group>
      <group position={[-0.6, 3.3, wallZ + 0.03]} rotation-z={-0.04}>
        <Part color={INK} geometry={rbox(0.92, 1.18, 0.04, 0.02)} />
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[0.84, 1.1]} />
          <meshToonMaterial map={posters.bpm} />
        </mesh>
      </group>

      {/* bodhrán hanging on the left wall */}
      <group position={[wallX + 0.08, 2.75, 2.55]} rotation-z={Math.PI / 2}>
        <Part color="#8a5536">
          <cylinderGeometry args={[0.46, 0.46, 0.12, 28]} />
        </Part>
        <mesh position={[0, 0.062, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.42, 28]} />
          <meshToonMaterial map={posters.triskele} />
        </mesh>
      </group>
      <Part color="#6b4228" position={[wallX + 0.16, 2.3, 3.15]} rotation-x={0.5} outline={0.7}>
        <capsuleGeometry args={[0.025, 0.42, 4, 8]} />
      </Part>

      {/* floating shelf by the arcade */}
      <group position={[wallX + 0.22, 3.65, -1.75]}>
        <Part color="#8a5536" geometry={rbox(0.42, 0.08, 1.7, 0.02)} />
        {['#ff7849', '#2a9d8f', '#ffd166', '#5b3f9e', '#e9e2d0', '#3d5a8a'].map((c, i) => (
          <Part
            key={c}
            color={c}
            position={[0, 0.24 + (i % 3) * 0.02, -0.65 + i * 0.13]}
            rotation-x={i === 5 ? 0.25 : 0}
            outline={0.7}
            geometry={rbox(0.3, 0.42 + (i % 3) * 0.05, 0.11, 0.015)}
          />
        ))}
        {/* tiny trophy */}
        <group position={[0, 0.04, 0.55]}>
          <Part color="#e8b93a" position={[0, 0.06, 0]} outline={0.7}>
            <cylinderGeometry args={[0.1, 0.12, 0.08, 12]} />
          </Part>
          <Part color="#e8b93a" position={[0, 0.25, 0]} outline={0.7}>
            <cylinderGeometry args={[0.12, 0.05, 0.22, 12]} />
          </Part>
        </group>
      </group>

      {/* rug */}
      <Part color="#2a9d8f" position={[0.4, 0.015, 0.7]} scale={[2.6, 1, 1.75]} outline={false}>
        <cylinderGeometry args={[1, 1, 0.03, 48]} />
      </Part>
      <Part color="#ff7849" position={[0.4, 0.02, 0.7]} scale={[2.2, 1, 1.42]} outline={false}>
        <cylinderGeometry args={[1, 1, 0.03, 48]} />
      </Part>
      <Part color="#2a9d8f" position={[0.4, 0.025, 0.7]} scale={[2.05, 1, 1.3]} outline={false}>
        <cylinderGeometry args={[1, 1, 0.03, 48]} />
      </Part>

      {/* beanbag */}
      <group position={[-3.3, 0, 2.6]} rotation-y={0.6}>
        <Part color="#e85d3f" position={[0, 0.38, 0]} scale={[0.85, 0.42, 0.8]}>
          <sphereGeometry args={[1, 20, 14]} />
        </Part>
        <Part color="#e85d3f" position={[0, 0.72, -0.42]} scale={[0.72, 0.42, 0.34]}>
          <sphereGeometry args={[1, 18, 12]} />
        </Part>
      </group>

      {/* monstera between desk and sideboard */}
      <group position={[0.92, 0, -3.25]}>
        <Part color="#c8643b" position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.3, 0.24, 0.6, 16]} />
        </Part>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = i * 1.05
          return (
            <group key={i} position={[0, 0.6, 0]} rotation-y={a}>
              <Part color="#2f6b3c" position={[0.18, 0.45, 0]} rotation-z={-0.35} outline={0.6}>
                <cylinderGeometry args={[0.015, 0.02, 0.9, 5]} />
              </Part>
              <Part
                color={i % 2 ? '#3f9b52' : '#4caf5f'}
                position={[0.4, 0.95 + (i % 3) * 0.12, 0]}
                rotation-z={-0.6}
                scale={[0.36, 0.05, 0.3]}
                outline={0.8}
              >
                <sphereGeometry args={[1, 12, 8]} />
              </Part>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export default function Room() {
  return (
    <>
      <Shell />
      <WindowFrame />
      <Decor />
    </>
  )
}
