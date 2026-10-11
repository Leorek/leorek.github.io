import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Group, MathUtils, Vector3 } from 'three'
import { view } from '../lib/view-state'
import { ARCADE } from './props/arcade'
import { BOARD } from './props/cork-map'
import { coasterLead, COASTER } from './props/coaster'
import { DESK } from './props/desk'
import { kick, TURNTABLE } from './props/turntable'
import { Part, rbox } from './toon'

// Mini-Leo: short dark hair, full beard, light henley — after the avatar.
// He sits at the desk on a swivel chair and reacts to the current station.

const SKIN = '#f3cdb0'
const HAIR = '#2a211d'
const SHIRT = '#ddd0ba'
const JEANS = '#34446b'
const CHAIR = { x: DESK.x, z: -2.25 }
const HEAD_Y = 1.95

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
  rest: { l: [-0.3, 0.1, -1.25], r: [-0.3, -0.1, -1.25] },
  grip: { l: [-0.75, 0.2, -1.5], r: [-0.75, -0.2, -1.5] },
  wave: { l: [-0.3, 0.1, -1.25], r: [0, -2.55, -0.2] },
  cheer: { l: [0, 2.7, -0.25], r: [0, -2.7, -0.25] },
}

function Arm({ side, armRef }: { side: 1 | -1; armRef: React.RefObject<Group | null> }) {
  return (
    <group ref={armRef} position={[side * 0.33, 0.55, 0]}>
      <Part color={SHIRT} position={[0, -0.15, 0]} outline={0.8}>
        <capsuleGeometry args={[0.085, 0.22, 4, 10]} />
      </Part>
      <group name="elbow" position={[0, -0.32, 0]}>
        <Part color={SHIRT} position={[0, -0.13, 0]} outline={0.8}>
          <capsuleGeometry args={[0.075, 0.2, 4, 10]} />
        </Part>
        <Part color={SKIN} position={[0, -0.29, 0]} outline={0.8}>
          <sphereGeometry args={[0.075, 12, 10]} />
        </Part>
      </group>
    </group>
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
    let pitch = MathUtils.clamp(-Math.atan2(lookPos.y - HEAD_Y, flat), -0.45, 0.4)
    if (view.station === 3 && !view.reduced) pitch += kick(t) * 0.16 // groove
    head.current.rotation.y = MathUtils.damp(head.current.rotation.y, yaw, 5 * motion, dt)
    head.current.rotation.x = MathUtils.damp(head.current.rotation.x, pitch, 8 * motion, dt)

    if (view.reduced) return

    // breathing + blinking
    torso.current.scale.y = 1 + Math.sin(t * 2.2) * 0.012
    const bl = blink.current
    if (t > bl.next) {
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
      <Part color="#3b3550" position={[0, 0.32, 0]} outline={0.7}>
        <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
      </Part>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation-y={(i / 5) * Math.PI * 2}>
          <Part color="#3b3550" position={[0, 0.09, 0.2]} outline={0.6}>
            <boxGeometry args={[0.06, 0.05, 0.4]} />
          </Part>
          <Part color={HAIR} position={[0, 0.04, 0.38]} outline={0.5}>
            <sphereGeometry args={[0.045, 8, 6]} />
          </Part>
        </group>
      ))}

      <group ref={body} rotation-y={0.7}>
        {/* seat + backrest */}
        <Part color="#3b3550" position={[0, 0.6, 0]} geometry={rbox(0.64, 0.1, 0.6, 0.04)} />
        <Part color="#ff7849" position={[0, 1.08, -0.34]} rotation-x={-0.12} geometry={rbox(0.62, 0.8, 0.1, 0.05)} />
        <Part color="#3b3550" position={[0, 0.82, -0.32]} outline={0.6}>
          <boxGeometry args={[0.08, 0.4, 0.05]} />
        </Part>

        {/* legs */}
        <Part color={JEANS} position={[0, 0.74, -0.05]} geometry={rbox(0.5, 0.22, 0.4, 0.08)} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part color={JEANS} position={[s * 0.14, 0.76, 0.2]} rotation-x={Math.PI / 2} outline={0.8}>
              <capsuleGeometry args={[0.11, 0.3, 4, 10]} />
            </Part>
            <Part color={JEANS} position={[s * 0.14, 0.42, 0.4]} outline={0.8}>
              <capsuleGeometry args={[0.1, 0.32, 4, 10]} />
            </Part>
            <Part color="#2b2a33" position={[s * 0.14, 0.1, 0.47]} geometry={rbox(0.17, 0.12, 0.3, 0.05)} outline={0.8} />
          </group>
        ))}

        <group ref={torso} position={[0, 0.85, -0.05]}>
          <Part color={SHIRT} position={[0, 0.32, 0]} scale={[1.1, 1, 0.85]}>
            <capsuleGeometry args={[0.27, 0.28, 6, 14]} />
          </Part>
          {[0.56, 0.48, 0.4].map((y) => (
            <Part key={y} color="#6b5f4f" position={[0, y, 0.235]} outline={false}>
              <sphereGeometry args={[0.018, 8, 6]} />
            </Part>
          ))}
          <Part color={SKIN} position={[0, 0.69, 0]} outline={0.7}>
            <cylinderGeometry args={[0.09, 0.1, 0.14, 12]} />
          </Part>
          <Arm side={1} armRef={armL} />
          <Arm side={-1} armRef={armR} />

          <group ref={head} position={[0, 0.76, 0]}>
            <Part color={SKIN} position={[0, 0.34, 0]} scale={[1, 1.02, 0.95]}>
              <sphereGeometry args={[0.36, 24, 18]} />
            </Part>
            {/* ears */}
            {[-1, 1].map((s) => (
              <Part key={s} color={SKIN} position={[s * 0.35, 0.33, 0]} scale={[0.5, 1, 0.8]} outline={0.7}>
                <sphereGeometry args={[0.075, 10, 8]} />
              </Part>
            ))}
            {/* hair: cap + front quiff */}
            <Part color={HAIR} position={[0, 0.5, -0.06]} scale={[1.0, 0.66, 1.02]}>
              <sphereGeometry args={[0.38, 22, 14]} />
            </Part>
            <Part color={HAIR} position={[0, 0.36, -0.08]} scale={[0.98, 0.88, 0.95]} outline={false}>
              <sphereGeometry args={[0.36, 20, 14]} />
            </Part>
            <Part color={HAIR} position={[0.06, 0.68, 0.16]} scale={[1.35, 0.55, 0.95]} outline={0.8}>
              <sphereGeometry args={[0.16, 14, 10]} />
            </Part>
            {/* full beard + moustache */}
            <Part color={HAIR} position={[0, 0.14, 0.06]} scale={[1.04, 0.78, 0.95]}>
              <sphereGeometry args={[0.33, 22, 14]} />
            </Part>
            {[-1, 1].map((s) => (
              <Part
                key={s}
                color={HAIR}
                position={[s * 0.07, 0.235, 0.36]}
                rotation-z={Math.PI / 2 + s * 0.35}
                outline={0.6}
              >
                <capsuleGeometry args={[0.028, 0.09, 4, 8]} />
              </Part>
            ))}
            <Part color="#5a2e2a" position={[0, 0.17, 0.372]} rotation-z={Math.PI / 2} outline={false}>
              <capsuleGeometry args={[0.014, 0.07, 4, 6]} />
            </Part>
            {/* nose */}
            <Part color="#eab896" position={[0, 0.3, 0.35]} outline={0.6}>
              <sphereGeometry args={[0.055, 12, 10]} />
            </Part>
            {/* eyes + brows */}
            <group ref={eyes} position={[0, 0.38, 0]}>
              {[-1, 1].map((s) => (
                <group key={s}>
                  <mesh position={[s * 0.12, 0, 0.322]} scale={[0.85, 1.25, 0.5]}>
                    <sphereGeometry args={[0.045, 12, 10]} />
                    <meshBasicMaterial color="#1d1a2b" />
                  </mesh>
                  <mesh position={[s * 0.12 + 0.014, 0.018, 0.345]}>
                    <sphereGeometry args={[0.012, 6, 6]} />
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              ))}
            </group>
            {[-1, 1].map((s) => (
              <Part
                key={s}
                color={HAIR}
                position={[s * 0.13, 0.475, 0.315]}
                rotation-z={s * 0.2}
                geometry={rbox(0.14, 0.04, 0.05, 0.015)}
                outline={false}
              />
            ))}
          </group>
        </group>
      </group>
    </group>
  )
}
