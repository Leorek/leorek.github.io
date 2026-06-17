import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

// Magnetic hover via GSAP quickTo — runs outside React render, no state churn.
export default function Magnetic({
  children,
  strength = 0.4,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null!)
  const xTo = useRef<ReturnType<typeof gsap.quickTo>>()
  const yTo = useRef<ReturnType<typeof gsap.quickTo>>()

  const init = () => {
    if (xTo.current) return
    xTo.current = gsap.quickTo(ref.current, 'x', { duration: 0.5, ease: 'power3.out' })
    yTo.current = gsap.quickTo(ref.current, 'y', { duration: 0.5, ease: 'power3.out' })
  }

  return (
    <span
      ref={ref}
      className={`inline-block will-change-transform ${className}`}
      onPointerEnter={init}
      onPointerMove={(e) => {
        const r = ref.current.getBoundingClientRect()
        xTo.current?.((e.clientX - (r.left + r.width / 2)) * strength)
        yTo.current?.((e.clientY - (r.top + r.height / 2)) * strength)
      }}
      onPointerLeave={() => {
        xTo.current?.(0)
        yTo.current?.(0)
      }}
    >
      {children}
    </span>
  )
}
