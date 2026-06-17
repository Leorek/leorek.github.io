import { useRef } from 'react'
import Reveal from '../components/reveal'
import { projects, type Project } from '../data/site'

function ProjectCard({ p, index }: { p: Project; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null!)
  const Tag = p.href ? 'a' : 'div'
  const isWorld = p.kind === 'world'

  return (
    <Reveal delay={(index % 2) * 90}>
      <Tag
        ref={ref as never}
        href={p.href || undefined}
        target={p.href ? '_blank' : undefined}
        rel={p.href ? 'noreferrer' : undefined}
        onPointerMove={(e) => {
          const r = ref.current.getBoundingClientRect()
          ref.current.style.setProperty('--mx', `${e.clientX - r.left}px`)
          ref.current.style.setProperty('--my', `${e.clientY - r.top}px`)
        }}
        className="group relative block h-full overflow-hidden rounded-2xl border border-line bg-ink-2/70 p-8 transition-colors hover:border-ember/30 md:p-10"
      >
        {/* cursor spotlight */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(380px circle at var(--mx) var(--my), rgba(255,120,73,0.10), transparent 60%)',
          }}
        />

        <div className="relative flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ember">
            {isWorld ? 'World' : 'Product'}
          </span>
          <span className="font-mono text-xs text-fog">{p.year}</span>
        </div>

        <h3 className="relative mt-6 text-2xl font-semibold tracking-tight md:text-3xl">
          {p.title}
        </h3>
        <p className="relative mt-4 max-w-[52ch] leading-relaxed text-bone/70">{p.blurb}</p>

        <div className="relative mt-7 flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span
              key={t}
              className="rounded-full border border-line px-3 py-1 font-mono text-xs text-fog"
            >
              {t}
            </span>
          ))}
        </div>

        {p.href && (
          <span className="relative mt-7 inline-flex items-center gap-2 text-sm text-bone transition-colors group-hover:text-ember">
            View
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        )}
      </Tag>
    </Reveal>
  )
}

export default function Projects() {
  return (
    <section id="work" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
      <Reveal>
        <p className="eyebrow mb-3">03 — Work</p>
        <h2 className="max-w-2xl text-4xl font-bold leading-none tracking-tighter md:text-6xl">
          Things I’ve built.
        </h2>
      </Reveal>

      {/* asymmetric 2-col: first tile spans wide on large screens */}
      <div className="mt-16 grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <div key={p.title} className={i === 0 ? 'md:col-span-2' : ''}>
            <ProjectCard p={p} index={i} />
          </div>
        ))}
      </div>
    </section>
  )
}
