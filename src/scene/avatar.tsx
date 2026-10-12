import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { view } from '../lib/view-state'
import { ARCADE } from './props/arcade'
import { BOARD } from './props/cork-map'
import { coasterLead, COASTER } from './props/coaster'
import { DESK } from './props/desk'
import { kick, TURNTABLE } from './props/turntable'
import { Part, rbox } from './paint'

// Mini-Leo, after his photo: broad round face, short fade swept to one side,
// trimmed boxed beard + moustache, thick straight brows, pale-lime tee with
// a teddy-on-a-radio print, backpack hanging off the chair. He sits at the
// desk on a swivel chair and reacts to the current station.

const SKIN = '#e6b48e'
const SKIN_SHADE = '#d79f7a'
const HAIR = '#2b211b'
const FADE = '#76594a' // the short sides of a skin fade
const BEARD = '#3b2c23'
const SHIRT = '#e2eaa4'
const PANTS = '#3a4258'
const CHAIR = { x: DESK.x, z: -2.25 }
const HEAD_Y = 1.99

type Pose = 'type' | 'rest' | 'grip' | 'wave' | 'cheer'
type Look = 'camera' | Vector3

const v = (x: number, y: number, z: number) => new Vector3(x, y, z)
const LOOK = {
  monitor: v(DESK.x - 0.55, DESK.top + 0.62, -3.4),
  arcade: v(ARCADE.x, 1.8, ARCADE.z),
  turntable: v(TURNTABLE.x, TURNTABLE.top + 0.2, TURNTABLE.z),
  map: v(BOARD.x, BOARD.y, BOARD.z),
  window: v(2.6, 2.6, -4),
}

const yawTo = (p: Vector3) => Math.atan2(p.x - CHAIR.x, p.z - CHAIR.z)
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a))
const dampAngle = (from: number, to: number, l: number, dt: number) =>
  from + wrap(to - from) * (1 - Math.exp(-l * dt))

function behaviour(station: number, boosted: boolean): { face: Look; look: Look; pose: Pose } {
  switch (station) {
    case 0:
      return { face: 'camera', look: 'camera', pose: 'wave' }
    case 1:
      return { face: LOOK.monitor, look: LOOK.monitor, pose: 'type' }
    case 2:
      return { face: LOOK.arcade, look: LOOK.arcade, pose: 'grip' }
    case 3:
      return { face: LOOK.turntable, look: LOOK.turntable, pose: 'rest' }
    case 4:
      return { face: v(COASTER.x, 1, COASTER.z), look: coasterLead, pose: boosted ? 'cheer' : 'rest' }
    case 5:
      return { face: LOOK.map, look: LOOK.map, pose: 'rest' }
    default:
      return { face: LOOK.window, look: LOOK.window, pose: 'rest' }
  }
}

// [shoulderX, shoulderZ, elbowX] per side (left arm sits at +x)
const POSES: Record<Pose, { l: number[]; r: number[] }> = {
  type: { l: [-0.95, 0.12, -0.75], r: [-0.95, -0.12, -0.75] },
  rest: { l: [-0.3, 0.12, -1.25], r: [-0.3, -0.12, -1.25] },
  grip: { l: [-0.75, 0.2, -1.5], r: [-0.75, -0.2, -1.5] },
  wave: { l: [-0.3, 0.12, -1.25], r: [0, -2.55, -0.2] },
  cheer: { l: [0, 2.7, -0.25], r: [0, -2.7, -0.25] },
}

function Arm({ side, armRef }: { side: 1 | -1; armRef: React.RefObject<Group | null> }) {
  return (
    <group ref={armRef} position={[side * 0.38, 0.55, 0]}>
      {/* short tee sleeve, then bare arm */}
      <Part color={SHIRT} position={[0, -0.07, 0]}>
        <capsuleGeometry args={[0.115, 0.08, 4, 12]} />
      </Part>
      <Part color={SKIN} position={[0, -0.19, 0]}>
        <capsuleGeometry args={[0.095, 0.18, 4, 10]} />
      </Part>
      <group name="elbow" position={[0, -0.33, 0]}>
        <Part color={SKIN} position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.087, 0.2, 4, 10]} />
        </Part>
        <Part color={SKIN} position={[0, -0.29, 0]}>
          <sphereGeometry args={[0.082, 12, 10]} />
        </Part>
      </group>
    </group>
  )
}

function Head() {
  return (
    <>
      {/* broad, round face + full cheeks */}
      <Part color={SKIN} position={[0, 0.36, 0]} scale={[1.08, 1, 0.98]}>
        <sphereGeometry args={[0.38, 28, 20]} />
      </Part>
      {[-1, 1].map((s) => (
        <Part key={s} color={SKIN} position={[s * 0.17, 0.3, 0.22]}>
          <sphereGeometry args={[0.13, 14, 10]} />
        </Part>
      ))}
      {[-1, 1].map((s) => (
        <Part key={s} color={SKIN_SHADE} position={[s * 0.405, 0.35, -0.01]} scale={[0.5, 1, 0.75]}>
          <sphereGeometry args={[0.08, 12, 8]} />
        </Part>
      ))}
      {/* hair: short fade on the sides, volume on top, swept to his right */}
      <Part color={FADE} position={[0, 0.41, -0.07]} scale={[1.09, 0.82, 1]}>
        <sphereGeometry args={[0.394, 24, 16]} />
      </Part>
      <Part color={HAIR} position={[0.01, 0.6, -0.04]} scale={[1.0, 0.46, 1.0]}>
        <sphereGeometry args={[0.37, 24, 14]} />
      </Part>
      <Part color={HAIR} position={[-0.07, 0.68, 0.2]} rotation-z={0.22} scale={[1.5, 0.4, 0.85]}>
        <sphereGeometry args={[0.17, 16, 10]} />
      </Part>
      {/* trimmed boxed beard + fuller chin, moustache, lips */}
      <Part color={BEARD} position={[0, 0.15, -0.01]} scale={[1.07, 0.52, 0.97]}>
        <sphereGeometry args={[0.385, 24, 16]} />
      </Part>
      <Part color={BEARD} position={[0, 0.07, 0.29]} scale={[0.9, 0.7, 0.6]}>
        <sphereGeometry args={[0.11, 14, 10]} />
      </Part>
      {[-1, 1].map((s) => (
        <Part key={s} color={BEARD} position={[s * 0.06, 0.255, 0.378]} rotation-z={Math.PI / 2 + s * 0.28}>
          <capsuleGeometry args={[0.026, 0.09, 4, 8]} />
        </Part>
      ))}
      <Part color="#c4846e" position={[0, 0.2, 0.388]} rotation-z={Math.PI / 2}>
        <capsuleGeometry args={[0.026, 0.08, 4, 8]} />
      </Part>
      {/* broad nose */}
      <Part color={SKIN_SHADE} position={[0, 0.31, 0.372]} scale={[1.25, 0.9, 1]}>
        <sphereGeometry args={[0.07, 14, 10]} />
      </Part>
      {/* thick straight brows */}
      {[-1, 1].map((s) => (
        <Part
          key={s}
          color={HAIR}
          position={[s * 0.14, 0.505, 0.33]}
          rotation-z={s * 0.05}
          geometry={rbox(0.16, 0.042, 0.03, 0.012)}
        />
      ))}
    </>
  )
}

export default function Avatar() {
  const body = useRef<Group>(null!)
  const torso = useRef<Group>(null!)
  const head = useRef<Group>(null!)
  const eyes = useRef<Group>(null!)
  const armL = useRef<Group>(null)
  const armR = useRef<Group>(null)
  const camera = useThree((s) => s.camera)
  const blink = useRef({ next: 2, until: 0 })

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const boosted = performance.now() - view.coasterLaunch < 4500
    const b = behaviour(view.station, boosted)
    const facePos = b.face === 'camera' ? camera.position : b.face
    const lookPos = b.look === 'camera' ? camera.position : b.look

    // swivel the chair (+Leo) toward the station
    const motion = view.reduced ? 1000 : 1
    body.current.rotation.y = dampAngle(body.current.rotation.y, yawTo(facePos), 3.2 * motion, dt)

    // head follows the look target within neck limits
    const yaw = MathUtils.clamp(wrap(yawTo(lookPos) - body.current.rotation.y), -0.9, 0.9)
    const flat = Math.hypot(lookPos.x - CHAIR.x, lookPos.z - CHAIR.z)
    // (looking down is capped so his eyes stay visible under the brows)
    let pitch = MathUtils.clamp(-Math.atan2(lookPos.y - HEAD_Y, flat), -0.45, 0.22)
    if (view.station === 3 && !view.reduced) pitch += kick(t) * 0.16 // groove
    head.current.rotation.y = MathUtils.damp(head.current.rotation.y, yaw, 5 * motion, dt)
    head.current.rotation.x = MathUtils.damp(head.current.rotation.x, pitch, 8 * motion, dt)

    if (view.reduced) return

    // breathing + blinking
    torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012
    const bl = blink.current
    // (skipped on very slow frames, where a 0.12 s blink would freeze shut)
    if (t > bl.next && dt < 0.1) {
      bl.until = t + 0.12
      bl.next = t + 2.5 + Math.random() * 3
    }
    eyes.current.scale.y = t < bl.until ? 0.12 : 1

    // arms
    const pose = POSES[b.pose]
    ;([
      [armL.current, pose.l, 1],
      [armR.current, pose.r, -1],
    ] as const).forEach(([arm, [sx, sz, ex], side]) => {
      if (!arm) return
      const elbow = arm.getObjectByName('elbow')!
      let ex2 = ex
      let ez = 0
      if (b.pose === 'type') ex2 += Math.sin(t * 16 + side * 1.7) * 0.08
      if (b.pose === 'wave' && side === -1) ez = Math.sin(t * 8) * 0.45
      if (b.pose === 'cheer') ez = side * Math.sin(t * 10) * 0.15
      arm.rotation.x = MathUtils.damp(arm.rotation.x, sx, 6, dt)
      arm.rotation.z = MathUtils.damp(arm.rotation.z, sz, 6, dt)
      elbow.rotation.x = MathUtils.damp(elbow.rotation.x, ex2, 8, dt)
      elbow.rotation.z = MathUtils.damp(elbow.rotation.z, ez, 8, dt)
    })
  })

  return (
    <group position={[CHAIR.x, 0, CHAIR.z]}>
      {/* chair base (doesn't swivel) */}
      <Part color="#3b3550" position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
      </Part>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * Math.PI * 2}>
          <Part color="#3b3550" position={[0, 0.09, 0.2]}>
            <boxGeometry args={[0.06, 0.05, 0.4]} />
          </Part>
          <Part color="#22202b" position={[0, 0.04, 0.38]}>
            <sphereGeometry args={[0.045, 8, 6]} />
          </Part>
        </group>
      ))}

      <group ref={body} rotation-y={0.7}>
        {/* seat + backrest + his backpack hanging off the back */}
        <Part color="#3b3550" position={[0, 0.6, 0]} geometry={rbox(0.7, 0.1, 0.62, 0.04)} />
        <Part color="#e0714f" position={[0, 1.08, -0.34]} rotation-x={-0.12} geometry={rbox(0.66, 0.8, 0.1, 0.05)} />
        <Part color="#3b3550" position={[0, 0.82, -0.32]}>
          <boxGeometry args={[0.08, 0.4, 0.05]} />
        </Part>
        <group position={[0, 1.0, -0.52]} rotation-x={-0.12}>
          <Part color="#1f1f26" geometry={rbox(0.46, 0.56, 0.22, 0.09)} />
          <Part color="#26262e" position={[0, -0.12, -0.12]} geometry={rbox(0.34, 0.22, 0.06, 0.04)} />
          {[-1, 1].map((x) => (
            <Part key={x} color="#1f1f26" position={[x * 0.13, 0.36, 0.1]} geometry={rbox(0.05, 0.22, 0.16, 0.02)} />
          ))}
        </group>

        {/* legs */}
        <Part color={PANTS} position={[0, 0.74, -0.05]} geometry={rbox(0.58, 0.24, 0.44, 0.09)} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part color={PANTS} position={[s * 0.16, 0.76, 0.2]} rotation-x={Math.PI / 2}>
              <capsuleGeometry args={[0.13, 0.3, 4, 12]} />
            </Part>
            <Part color={PANTS} position={[s * 0.16, 0.42, 0.4]}>
              <capsuleGeometry args={[0.11, 0.32, 4, 10]} />
            </Part>
            <Part color="#2b2a33" position={[s * 0.16, 0.1, 0.47]} geometry={rbox(0.18, 0.12, 0.3, 0.05)} />
          </group>
        ))}

        <group ref={torso} position={[0, 0.85, -0.05]}>
          {/* broad torso + a bit of belly, crew-neck tee */}
          <Part color={SHIRT} position={[0, 0.33, 0]} scale={[1.15, 1, 0.95]}>
            <capsuleGeometry args={[0.32, 0.26, 8, 16]} />
          </Part>
          <Part color={SHIRT} position={[0, 0.2, 0.08]} scale={[1.12, 0.9, 0.9]}>
            <sphereGeometry args={[0.28, 18, 14]} />
          </Part>
          <Part color="#d3db92" position={[0, 0.655, 0.02]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.12, 0.026, 8, 20]} />
          </Part>
          {/* the print: a sleepy teddy on an old radio */}
          <group position={[0.02, 0.42, 0.302]}>
            <Part color="#3b3a40" geometry={rbox(0.2, 0.06, 0.02, 0.01)} shadows={false} />
            <Part color="#e3a33a" position={[0.02, 0.055, 0.004]} scale={[1.7, 0.75, 0.35]} shadows={false}>
              <sphereGeometry args={[0.045, 12, 8]} />
            </Part>
            <Part color="#e3a33a" position={[-0.07, 0.07, 0.006]} scale={[1, 1, 0.4]} shadows={false}>
              <sphereGeometry args={[0.033, 10, 8]} />
            </Part>
          </group>
          <Part color={SKIN} position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.12, 0.13, 0.14, 14]} />
          </Part>
          <Arm side={1} armRef={armL} />
          <Arm side={-1} armRef={armR} />

          <group ref={head} position={[0, 0.78, 0]}>
            <Head />
            {/* eyes: soft white + dark brown iris, own group so they can blink */}
            <group ref={eyes} position={[0, 0.41, 0]}>
              {[-1, 1].map((s) => (
                <group key={s} position={[s * 0.135, 0, 0]}>
                  <mesh position={[0, 0, 0.356]} scale={[1.15, 0.9, 0.4]}>
                    <sphereGeometry args={[0.056, 16, 12]} />
                    <meshStandardMaterial color="#f6efe6" roughness={0.6} />
                  </mesh>
                  <mesh position={[s * -0.004, -0.002, 0.374]} scale={[1, 1, 0.45]}>
                    <sphereGeometry args={[0.033, 14, 10]} />
                    <meshBasicMaterial color="#2b1d16" />
                  </mesh>
                  <mesh position={[0.012, 0.012, 0.388]}>
                    <sphereGeometry args={[0.009, 8, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              ))}
            </group>
          </group>
        </group>
      </group>
    </group>
  )
}
