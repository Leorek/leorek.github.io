import Reveal from '../components/reveal'
import { stacks } from '../data/site'

export default function Skills() {
  return (
    <section id="skills" className="mx-auto max-w-[1400px] px-5 py-28 md:px-10 md:py-40">
      <Reveal>
        <p className="eyebrow mb-3">02 — How</p>
        <h2 className="max-w-2xl text-4xl font-bold leading-none tracking-tighter md:text-6xl">
          Two stacks,
          <br />
          one way of thinking.
        </h2>
      </Reveal>

      <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
        {stacks.map((stack, i) => (
          <Reveal key={stack.key} delay={i * 120}>
            <div className="h-full bg-ink-2 p-8 md:p-12">
              <div className="mb-8 flex items-baseline justify-between">
                <h3 className="text-2xl font-semibold tracking-tight">{stack.title}</h3>
                <span className="font-mono text-xs uppercase tracking-widest text-ember">
                  {stack.note}
                </span>
              </div>
              <ul className="divide-y divide-line/70">
                {stack.items.map((item, j) => (
                  <li
                    key={item}
                    className="group flex items-center gap-4 py-3 text-lg text-bone/80 transition-colors hover:text-bone"
                  >
                    <span className="font-mono text-xs text-fog">
                      {String(j + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px flex-1 bg-line transition-colors group-hover:bg-ember/40" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
