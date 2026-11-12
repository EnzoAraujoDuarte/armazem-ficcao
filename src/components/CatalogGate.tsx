import type { ReactNode } from 'react'
import type { Catalog } from '../domain/catalog'
import { useCatalog } from '../state/catalog'

/** Renders the loading and failure states once, so every page that needs the catalog behaves the same. */
export function CatalogGate({ children, esqueleto = 4 }: { children: (catalogo: Catalog) => ReactNode; esqueleto?: number }) {
  const estado = useCatalog()
  if (estado.status === 'carregando') {
    return (
      <div className="carregando" role="status" aria-label="Carregando folhetos">
        {Array.from({ length: esqueleto }, (_, i) => (
          <span key={i} className="folheto-esqueleto" aria-hidden="true" />
        ))}
      </div>
    )
  }
  if (estado.status === 'erro') {
    return (
      <div className="falha" role="alert">
        <h2>O vento levou os folhetos.</h2>
        <p>Não conseguimos carregar o catálogo agora. {estado.mensagem}.</p>
        <button type="button" className="botao botao--tinta" onClick={estado.tentarDeNovo}>
          Tentar de novo
        </button>
      </div>
    )
  }
  return <>{children(estado.catalogo)}</>
}
