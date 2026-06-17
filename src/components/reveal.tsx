import { createElement, useEffect, useRef, type ReactNode } from 'react'

// Lightweight reveal — toggles .is-in via IntersectionObserver.
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: keyof JSX.IntrinsicElements
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      { threshold: 0.18 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return createElement(
    as,
    { ref, className: `reveal ${className}`, style: { transitionDelay: `${delay}ms` } },
    children,
  )
}
