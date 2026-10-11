import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { copy, type Copy, type Lang } from './i18n'

const STORAGE_KEY = 'leo:lang'

// Stored choice > browser language > English.
function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'es') return stored
  } catch {
    /* storage blocked — fall through */
  }
  return navigator.language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

type Ctx = { lang: Lang; t: Copy; setLang: (l: Lang) => void }
const LangContext = createContext<Ctx | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = copy[lang].meta.title
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      /* non-critical */
    }
  }

  return <LangContext.Provider value={{ lang, t: copy[lang], setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>')
  return ctx
}
