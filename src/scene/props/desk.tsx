import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Mesh, MeshBasicMaterial, PointLight, type Texture } from 'three'
import { palette, toggleDayNight } from '../../lib/time-of-day'
import { view } from '../../lib/view-state'
import { canvasTexture, FONT_MONO, Glow, Hotspot, INK, Part, rbox } from '../toon'

export const DESK = { x: -1.0, z: -3.15, top: 1.14 }

// ---- live-typed NestJS controller on the left monitor ------------------
const CODE = `@Controller('rides')
export class RidesController {
  constructor(private readonly rides: RidesService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const ride = await this.rides.find(id)
    if (!ride) throw new NotFoundException()
    return ride
  }

  @Post(':id/launch')
  launch(@Param('id') id: string) {
    return this.rides.launch(id, { airtime: true })
  }
}`

const KEYWORDS = new Set([
  'export', 'class', 'constructor', 'private', 'readonly', 'async', 'await',
  'const', 'if', 'throw', 'new', 'return', 'true',
])

type Tok = { text: string; color: string }
function tokenize(line: string): Tok[] {
  const out: Tok[] = []
  const re = /(@\w+)|('[^']*')|(\b[A-Za-z_]\w*\b)|(\s+)|([^\w\s])/g
  let m: RegExpExecArray | null
  while ((m = re.exec(line))) {
    const [t, deco, str, word] = m
    let color = '#d6d3e6'
    if (deco) color = '#ff9a6b'
    else if (str) color = '#9be28f'
    else if (word && KEYWORDS.has(word)) color = '#c8a2ff'
    else if (word && /^[A-Z]/.test(word)) color = '#ffd479'
    out.push({ text: t, color })
  }
  return out
}
const LINES = CODE.split('\n').map(tokenize)
const TOTAL = CODE.length

function useCodeScreen() {
  return useMemo(() => {
    let typed = 0
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = '#1b1830'
      ctx.fillRect(0, 0, w, h)
      // title bar
      ctx.fillStyle = '#26223f'
      ctx.fillRect(0, 0, w, 26)
      ;['#ff6b6b', '#ffd166', '#5ad19a'].forEach((c, i) => {
        ctx.fillStyle = c
        ctx.beginPath()
        ctx.arc(16 + i * 18, 13, 5, 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.font = `500 13px ${FONT_MONO}`
      ctx.fillStyle = '#a7a3c2'
      ctx.fillText('rides.controller.ts', 80, 18)

      ctx.font = `500 15px ${FONT_MONO}`
      let left = Math.floor(typed)
      let cx = 0
      let cy = 0
      LINES.forEach((toks, li) => {
        const y = 50 + li * 16.5
        ctx.fillStyle = '#5c5880'
        ctx.fillText(String(li + 1).padStart(2, ' '), 8, y)
        let x = 40
        for (const tok of toks) {
          if (left <= 0) break
          const shown = tok.text.slice(0, left)
          left -= shown.length
          ctx.fillStyle = tok.color
          ctx.fillText(shown, x, y)
          x += ctx.measureText(shown).width
        }
        if (left > 0) left -= 1 // newline
        else if (cx === 0 && cy === 0) {
          cx = x
          cy = y
        }
      })
      // caret
      if (Math.floor(performance.now() / 450) % 2 === 0) {
        ctx.fillStyle = '#ff7849'
        ctx.fillRect(cx || 40, (cy || 50) - 12, 8, 15)
      }
    }
    const { tex, ctx, canvas } = canvasTexture(512, 320, draw)
    let acc = 0
    const update = (dt: number, speed: number) => {
      if (speed === 0) typed = TOTAL
      else typed += dt * speed
      if (typed > TOTAL + 60) typed = 0 // hold the full file a moment, then retype
      acc += dt
      if (acc < 1 / 20) return
      acc = 0
      draw(ctx, canvas.width, canvas.height)
      tex.needsUpdate = true
    }
    return { tex, update }
  }, [])
}

// ---- Postgres schema on the right monitor --------------------------------
function useSchemaScreen() {
  return useMemo(() => {
    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = '#f4efe6'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = '#e2dccf'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      const table = (x: number, y: number, name: string, cols: string[], color: string) => {
        const tw = 150
        const th = 30 + cols.length * 20
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(x, y, tw, th)
        ctx.fillStyle = color
        ctx.fillRect(x, y, tw, 26)
        ctx.strokeStyle = INK
        ctx.lineWidth = 2.5
        ctx.strokeRect(x, y, tw, th)
        ctx.fillStyle = '#ffffff'
        ctx.font = `700 14px ${FONT_MONO}`
        ctx.fillText(name, x + 10, y + 18)
        ctx.font = `500 12px ${FONT_MONO}`
        cols.forEach((c, i) => {
          ctx.fillStyle = i === 0 ? '#c0392b' : '#3b3550'
          ctx.fillText(c, x + 10, y + 46 + i * 20)
        })
      }
      ctx.strokeStyle = INK
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(170, 90)
      ctx.lineTo(240, 90)
      ctx.lineTo(240, 200)
      ctx.lineTo(320, 200)
      ctx.moveTo(170, 120)
      ctx.lineTo(200, 120)
      ctx.lineTo(200, 230)
      ctx.lineTo(90, 230)
      ctx.stroke()
      table(20, 40, 'rides', ['id uuid', 'name text', 'park_id', 'max_g real'], '#ff7849')
      table(320, 150, 'launches', ['id uuid', 'ride_id', 'riders int', 'at timestamptz'], '#2a9d8f')
      table(20, 210, 'parks', ['id uuid', 'city text'], '#5b3f9e')
      ctx.fillStyle = '#1d1a2b'
      ctx.fillRect(0, h - 24, w, 24)
      ctx.fillStyle = '#9be28f'
      ctx.font = `500 12px ${FONT_MONO}`
      ctx.fillText('● postgres  ·  3 tables  ·  query 4 ms', 12, h - 8)
    }
    return canvasTexture(512, 320, draw).tex
  }, [])
}

function Monitor({ x, rot, map }: { x: number; rot: number; map: Texture }) {
  return (
    <group position={[x, DESK.top + 0.63, -3.42]} rotation-y={rot}>
      <Part color="#2d2a3e" geometry={rbox(1.12, 0.72, 0.07, 0.03)} />
      <Glow map={map} position={[0, 0, 0.037]}>
        <planeGeometry args={[1.02, 0.62]} />
      </Glow>
      <Part color="#2d2a3e" position={[0, -0.47, -0.06]} outline={0.7}>
        <boxGeometry args={[0.09, 0.32, 0.06]} />
      </Part>
      <Part color="#2d2a3e" position={[0, -0.615, -0.02]} geometry={rbox(0.38, 0.03, 0.24, 0.012)} outline={0.7} />
    </group>
  )
}

function Steam() {
  const puffs = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (view.reduced) return
    puffs.current.children.forEach((m, i) => {
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1
      m.position.y = t * 0.45
      m.position.x = Math.sin(t * 6 + i) * 0.03
      m.scale.setScalar(0.05 * (1 - t) + 0.015)
    })
  })
  return (
    <group ref={puffs} position={[0, 0.22, 0]} visible={!view.reduced}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} scale={0.04}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function DeskLamp() {
  const bulb = useRef<Mesh>(null!)
  const light = useRef<PointLight>(null!)
  useFrame(() => {
    light.current.intensity = palette.lamp * 9
    const off = 1 - palette.lamp
    ;(bulb.current.material as MeshBasicMaterial).color.setRGB(1, 0.82 + 0.18 * off, 0.55 + 0.45 * off)
  })
  return (
    <Hotspot id="lamp" onActivate={toggleDayNight}>
      <group position={[0.28, DESK.top, -3.4]} rotation-y={-0.5}>
        <Part color="#2d2a3e" position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.15, 0.17, 0.06, 18]} />
        </Part>
        <Part color="#ff7849" position={[0, 0.32, 0.08]} rotation-x={0.45} outline={0.8}>
          <cylinderGeometry args={[0.025, 0.025, 0.6, 8]} />
        </Part>
        <Part color="#2d2a3e" position={[0, 0.58, 0.2]} outline={0.8}>
          <sphereGeometry args={[0.045, 10, 8]} />
        </Part>
        <Part color="#ff7849" position={[0, 0.66, 0.42]} rotation-x={-1.1} outline={0.8}>
          <cylinderGeometry args={[0.025, 0.025, 0.48, 8]} />
        </Part>
        <group position={[0, 0.7, 0.66]} rotation-x={0.5}>
          <Part color="#ff7849" position={[0, 0, 0]}>
            <coneGeometry args={[0.16, 0.2, 18, 1, true]} />
          </Part>
          <mesh ref={bulb} position={[0, -0.06, 0]}>
            <sphereGeometry args={[0.07, 12, 10]} />
            <meshBasicMaterial toneMapped={false} />
          </mesh>
          <pointLight ref={light} position={[0, -0.15, 0]} color="#ffb36b" distance={9} decay={1.6} />
        </group>
      </group>
    </Hotspot>
  )
}

export default function Desk() {
  const code = useCodeScreen()
  const schema = useSchemaScreen()

  useFrame((_, dt) => {
    // types fast while you're looking at the desk, idles otherwise
    const atDesk = Math.abs(view.progress - 1) < 0.5
    code.update(dt, view.reduced ? 0 : atDesk ? 26 : 8)
  })

  const { x, z, top } = DESK
  return (
    <group>
      <Hotspot id="work">
        <group position={[x, 0, z]}>
          {/* top + frame */}
          <Part color="#b9784f" position={[0, top - 0.04, 0]} geometry={rbox(3.1, 0.08, 1.05, 0.025)} />
          <Part color="#8a5536" position={[1.45, (top - 0.08) / 2, 0]} outline={0.8}>
            <boxGeometry args={[0.08, top - 0.08, 0.9]} />
          </Part>
          {/* drawer unit */}
          <Part color="#c98b5b" position={[-1.15, (top - 0.08) / 2, 0]} geometry={rbox(0.7, top - 0.08, 0.95, 0.02)} />
          {[0.25, 0.55, 0.85].map((y) => (
            <Part key={y} color="#2d2a3e" position={[-1.15, y, 0.49]} outline={false}>
              <boxGeometry args={[0.22, 0.04, 0.03]} />
            </Part>
          ))}
        </group>
        <Monitor x={-1.58} rot={0.14} map={code.tex} />
        <Monitor x={-0.42} rot={-0.14} map={schema} />
        {/* keyboard + mouse */}
        <Part color="#3b3550" position={[-1.0, top + 0.025, -2.93]} geometry={rbox(0.95, 0.045, 0.3, 0.015)} />
        <Part color="#ece6da" position={[-1.0, top + 0.05, -2.93]} outline={false}>
          <boxGeometry args={[0.86, 0.01, 0.22]} />
        </Part>
        <Part color="#3b3550" position={[-0.3, top + 0.03, -2.92]} scale={[0.07, 0.035, 0.11]} outline={0.7}>
          <sphereGeometry args={[1, 12, 10]} />
        </Part>
        {/* mug */}
        <group position={[0.05, top, -3.0]}>
          <Part color="#ff7849" position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.075, 0.07, 0.18, 16]} />
          </Part>
          <Part color="#ff7849" position={[0.085, 0.09, 0]} rotation-y={Math.PI / 2} outline={0.6}>
            <torusGeometry args={[0.045, 0.014, 8, 16]} />
          </Part>
          <Steam />
        </group>
      </Hotspot>
      <DeskLamp />
    </group>
  )
}
