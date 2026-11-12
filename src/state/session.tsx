import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { readSession, signOut, type Session } from '../domain/auth'

type SessionContextValue = { sessao: Session | null; entrar: (s: Session) => void; sair: () => void }

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(() => readSession())
  const value = useMemo(
    () => ({
      sessao,
      entrar: setSessao,
      sair: () => {
        signOut()
        setSessao(null)
      },
    }),
    [sessao],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession precisa estar dentro de <SessionProvider>')
  return ctx
}
