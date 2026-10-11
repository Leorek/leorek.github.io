import { useEffect, useState, useSyncExternalStore } from 'react'
import { useLang } from '../content/use-lang'
import { STATIONS } from '../lib/stations'
import { formatHour, subscribeTime, toggleDayNight, world } from '../lib/time-of-day'
import { subscribeStation, view } from '../lib/view-state'

function useStation() {
  return useSyncExternalStore(subscribeStation, () => view.station)
}
function useDark() {
  return useSyncExternalStore(subscribeTime, () => world.isDark)
}

function Clock() {
  const { t } = useLang()
  const [time, setTime] = useState(() => formatHour(world.hour))
  useEffect(() => {
    const id = setInterval(() => setTime(formatHour(world.hour)), 250)
    return () => clearInterval(id)
  }, [])
  return (
    <span className="clock" title="Europe/Madrid">
      {t.ui.clock} · {time}
    </span>
  )
}

function SunMoon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" fill="currentColor" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <rect key={a} x="11" y="1.5" width="2" height="4" rx="1" fill="currentColor" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  )
}

export default function Nav() {
  const { t, lang, setLang } = useLang()
  const station = useStation()
  const dark = useDark()
  const [open, setOpen] = useState(false)

  const links = STATIONS.slice(1).map((s, k) => (
    <a
      key={s.id}
      href={`#${s.id}`}
      aria-current={station === k + 1 ? 'location' : undefined}
      onClick={() => setOpen(false)}
    >
      {t.nav[s.id]}
    </a>
  ))

  return (
    <header className="nav" data-ui>
      <a href="#hello" className="logo" aria-label="Leo — home">
        LEO<span>.</span>
      </a>

      <nav className="nav-links" aria-label="Sections">
        {links}
      </nav>

      <div className="nav-tools">
        <Clock />
        <button
          type="button"
          className="icon-btn"
          onClick={toggleDayNight}
          aria-label={dark ? t.ui.toDay : t.ui.toNight}
          title={dark ? t.ui.toDay : t.ui.toNight}
        >
          <SunMoon dark={!dark} />
        </button>
        <button
          type="button"
          className="icon-btn lang-btn"
          onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          aria-label={t.ui.langSwitch}
          title={t.ui.langSwitch}
        >
          {lang === 'en' ? 'ES' : 'EN'}
        </button>
        <button
          type="button"
          className="icon-btn menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? t.ui.close : t.ui.menu}
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Sections">
          {links}
        </nav>
      )}
    </header>
  )
}
