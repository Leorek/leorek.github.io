import { useEffect, useState } from 'react'
import type Lenis from 'lenis'
import Magnetic from './magnetic'

const LINKS = [
  { id: 'skills', label: 'Skills' },
  { id: 'play', label: 'Play' },
  { id: 'contact', label: 'Contact' },
]

function goto(id: string) {
  const target = document.getElementById(id)
  if (!target) return
  const lenis = (window as unknown as { __lenis?: Lenis }).__lenis
  if (lenis) lenis.scrollTo(target, { offset: -40 })
  else target.scrollIntoView({ behavior: 'smooth' })
}

export default function Nav() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max > 0 ? window.scrollY / max : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 md:px-10">
        <button
          onClick={() => goto('top')}
          className="font-mono text-sm tracking-[0.2em] text-bone transition-colors hover:text-ember"
        >
          LEO<span className="text-ember">.</span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-line/70 bg-ink-2/60 px-2 py-1.5 backdrop-blur-md md:flex">
          {LINKS.map((l) => (
            <Magnetic key={l.id} strength={0.25}>
              <button
                onClick={() => goto(l.id)}
                className="rounded-full px-3.5 py-1.5 text-sm text-fog transition-colors hover:text-bone"
              >
                {l.label}
              </button>
            </Magnetic>
          ))}
        </nav>

        <Magnetic>
          <button
            onClick={() => goto('contact')}
            className="rounded-full border border-ember/40 px-4 py-2 text-sm text-bone transition-colors hover:bg-ember hover:text-ink active:scale-[0.97]"
          >
            Let’s talk
          </button>
        </Magnetic>
      </div>

      {/* scroll progress hairline */}
      <div
        className="h-px origin-left bg-ember/80"
        style={{ transform: `scaleX(${progress})` }}
      />
    </header>
  )
}
