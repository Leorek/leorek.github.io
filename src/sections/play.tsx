import Reveal from '../components/reveal'
import { interests } from '../data/site'

function Band({ reverse = false }: { reverse?: boolean }) {
  const row = [...interests, ...interests]
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div
        className="flex shrink-0 items-center gap-10 pr-10"
        style={{ animation: `marquee ${reverse ? 38 : 44}s linear infinite${reverse ? ' reverse' : ''}` }}
      >
        {row.map((it, i) => (
          <span key={i} className="flex shrink-0 items-baseline gap-3">
            <span className="text-4xl font-semibold tracking-tight text-bone/90 md:text-6xl">
              {it.label}
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-ember">
              {it.note}
            </span>
            <span className="text-3xl text-line">/</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Play() {
  return (
    <section id="play" className="py-28 md:py-40">
      <div className="mx-auto mb-14 max-w-[1400px] px-5 md:px-10">
        <Reveal>
          <p className="eyebrow mb-3">04 — Off the clock</p>
          <h2 className="max-w-2xl text-4xl font-bold leading-none tracking-tighter md:text-6xl">
            What fuels the work.
          </h2>
        </Reveal>
      </div>

      <div className="space-y-6">
        <Band />
        <Band reverse />
      </div>
    </section>
  )
}
