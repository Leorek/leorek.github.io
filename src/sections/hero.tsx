import { profile } from '../data/site'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] items-center"
    >
      <div className="mx-auto w-full max-w-[1400px] px-5 md:px-10">
        <div className="max-w-3xl">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ember" />
            Available for product engineering work
          </p>

          <h1 className="font-display text-[15vw] font-extrabold leading-[0.85] tracking-tighter md:text-[8.5rem]">
            {profile.name}
            <span className="text-ember">.</span>
          </h1>

          <p className="mt-3 font-mono text-sm uppercase tracking-[0.3em] text-fog md:text-base">
            {profile.role}
          </p>

          <p className="mt-8 max-w-xl text-lg leading-relaxed text-bone/85 md:text-2xl md:leading-snug">
            {profile.tagline}
          </p>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-fog">
          <span className="relative flex h-9 w-5 justify-center rounded-full border border-line">
            <span className="mt-1.5 h-1.5 w-1 animate-bounce rounded-full bg-ember" />
          </span>
          Scroll
        </div>
      </div>
    </section>
  )
}
