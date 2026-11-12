import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

type Aviso = { id: number; texto: string; link?: { para: string; rotulo: string } }

type FeedbackContextValue = {
  aviso: Aviso | null
  avisar: (texto: string, link?: Aviso['link']) => void
  fecharAviso: () => void
  sacolaRef: RefObject<HTMLAnchorElement | null>
  /** Drops a copy of the folheto off the string and into the bag: the store's one authored motion. */
  levarParaSacola: (origem: HTMLElement) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const sacolaRef = useRef<HTMLAnchorElement | null>(null)
  const timer = useRef<number | undefined>(undefined)

  const fecharAviso = useCallback(() => setAviso(null), [])

  const avisar = useCallback((texto: string, link?: Aviso['link']) => {
    window.clearTimeout(timer.current)
    setAviso({ id: Date.now(), texto, link })
    timer.current = window.setTimeout(() => setAviso(null), 5000)
  }, [])

  const levarParaSacola = useCallback((origem: HTMLElement) => {
    const sacola = sacolaRef.current
    if (!sacola) return
    const pularSacola = () => {
      sacola.animate(
        [{ transform: 'rotate(0)' }, { transform: 'rotate(-9deg) scale(1.08)' }, { transform: 'rotate(5deg)' }, { transform: 'rotate(0)' }],
        { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      )
    }
    if (prefersReducedMotion()) {
      pularSacola()
      return
    }
    const de = origem.getBoundingClientRect()
    const para = sacola.getBoundingClientRect()
    const fantasma = origem.cloneNode(true) as HTMLElement
    fantasma.setAttribute('aria-hidden', 'true')
    fantasma.removeAttribute('id')
    fantasma.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'))
    fantasma.classList.add('folheto-fantasma')
    Object.assign(fantasma.style, {
      position: 'fixed',
      left: `${de.left}px`,
      top: `${de.top}px`,
      width: `${de.width}px`,
      height: `${de.height}px`,
      margin: '0',
      zIndex: '60',
      pointerEvents: 'none',
      transformOrigin: '50% 0',
    })
    document.body.appendChild(fantasma)
    const dx = para.left + para.width / 2 - (de.left + de.width / 2)
    const dy = para.top + para.height / 2 - de.top
    const escala = Math.max(0.08, para.width / de.width)
    const animacao = fantasma.animate(
      [
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(0, 18px) rotate(-7deg)', opacity: 1, offset: 0.18 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.35 - 70}px) rotate(12deg) scale(0.5)`, opacity: 1, offset: 0.62 },
        { transform: `translate(${dx}px, ${dy}px) rotate(24deg) scale(${escala})`, opacity: 0.2 },
      ],
      { duration: 760, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' },
    )
    animacao.onfinish = () => {
      fantasma.remove()
      pularSacola()
    }
  }, [])

  const value = useMemo(
    () => ({ aviso, avisar, fecharAviso, sacolaRef, levarParaSacola }),
    [aviso, avisar, fecharAviso, levarParaSacola],
  )
  return <FeedbackContext.Provider value={value}>{children}</FeedbackContext.Provider>
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext)
  if (!ctx) throw new Error('useFeedback precisa estar dentro de <FeedbackProvider>')
  return ctx
}
