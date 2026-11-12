import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { fetchCatalog, type Catalog } from '../domain/catalog'

type CatalogState =
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string; tentarDeNovo: () => void }
  | { status: 'pronto'; catalogo: Catalog }

const CatalogContext = createContext<CatalogState | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [tentativa, setTentativa] = useState(0)
  const [state, setState] = useState<CatalogState>({ status: 'carregando' })
  const tentarDeNovo = useCallback(() => setTentativa((t) => t + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'carregando' })
    fetchCatalog(controller.signal)
      .then((catalogo) => setState({ status: 'pronto', catalogo }))
      .catch((erro: unknown) => {
        if (controller.signal.aborted) return
        setState({ status: 'erro', mensagem: erro instanceof Error ? erro.message : String(erro), tentarDeNovo })
      })
    return () => controller.abort()
  }, [tentativa, tentarDeNovo])

  return <CatalogContext.Provider value={state}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogState {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog precisa estar dentro de <CatalogProvider>')
  return ctx
}
