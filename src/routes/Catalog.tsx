import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { CatalogGate } from '../components/CatalogGate'
import { Varal } from '../components/Varal'
import {
  filterProducts,
  paginate,
  type Catalog as CatalogData,
  type CatalogQuery,
  type Product,
  type SortOrder,
} from '../domain/catalog'

const SORT_LABELS: Record<SortOrder, string> = {
  relevancia: 'Mais relevantes',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
  nome: 'Nome (A–Z)',
}

function readQuery(params: URLSearchParams): CatalogQuery {
  const ordem = params.get('ordem') as SortOrder | null
  return {
    busca: params.get('busca') ?? '',
    categoria: params.get('categoria'),
    ordem: ordem && ordem in SORT_LABELS ? ordem : 'relevancia',
    soDisponiveis: params.get('disponiveis') === '1',
    pagina: Number(params.get('pagina') ?? '1') || 1,
  }
}

const MOBILE = '(max-width: 640px)'

/** On a phone the filters start folded, so the first folheto is in the first screen. */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(MOBILE).matches)
  useEffect(() => {
    const consulta = window.matchMedia(MOBILE)
    const mudar = () => setMobile(consulta.matches)
    consulta.addEventListener('change', mudar)
    return () => consulta.removeEventListener('change', mudar)
  }, [])
  return mobile
}

/** How many folhetos fit on one string at the current width. */
function useColumns() {
  const ref = useRef<HTMLDivElement>(null)
  const [colunas, setColunas] = useState(3)
  // Layout effect: measure before the first paint, so a phone never flashes three columns.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = (largura: number) => setColunas(Math.max(1, Math.min(4, Math.floor(largura / 230))))
    medir(el.clientWidth)
    const observer = new ResizeObserver(([entrada]) => medir(entrada.contentRect.width))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, colunas }
}

function chunk<T>(itens: T[], tamanho: number): T[][] {
  const linhas: T[][] = []
  for (let i = 0; i < itens.length; i += tamanho) linhas.push(itens.slice(i, i + tamanho))
  return linhas
}

export function Catalog() {
  return (
    <div className="catalogo">
      <h1 className="pagina-titulo">Todos os folhetos</h1>
      <CatalogGate esqueleto={6}>{(catalogo) => <CatalogBody catalogo={catalogo} />}</CatalogGate>
    </div>
  )
}

function CatalogBody({ catalogo }: { catalogo: CatalogData }) {
  const [params, setParams] = useSearchParams()
  const query = readQuery(params)
  const [busca, setBusca] = useState(query.busca)
  const { ref, colunas } = useColumns()
  const mobile = useIsMobile()

  const filtrados = filterProducts(catalogo.produtos, query)
  const pagina = paginate<Product>(filtrados, query.pagina)

  function atualizar(mudancas: Record<string, string | null>) {
    const proximo = new URLSearchParams(params)
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === null || valor === '') proximo.delete(chave)
      else proximo.set(chave, valor)
    }
    if (!('pagina' in mudancas)) proximo.delete('pagina')
    // Synchronous so the controlled radios and checkbox never flash back to their old state.
    setParams(proximo, { flushSync: true })
  }

  const categoriaAtual = catalogo.categorias.find((c) => c.slug === query.categoria)

  return (
    <div className="catalogo-corpo">
      <aside className="tabuleta" aria-label="Filtros">
        <details className="tabuleta-dobra" open={!mobile} key={String(mobile)}>
          <summary>
            Filtrar e ordenar
            <ChevronDown aria-hidden="true" size={22} strokeWidth={2.6} className="tabuleta-seta" />
          </summary>
          <div className="tabuleta-campos">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault()
                atualizar({ busca: busca.trim() })
              }}
            >
              <label htmlFor="busca" className="tabuleta-rotulo">
                Buscar folheto
              </label>
              <div className="busca">
                <input
                  id="busca"
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="ex.: chuva, café, silêncio"
                />
                <button type="submit" className="botao botao--tinta">
                  Buscar
                </button>
              </div>
            </form>

            <fieldset className="tabuleta-grupo">
              <legend className="tabuleta-rotulo">Categoria</legend>
              <label className="opcao-radio">
                <input
                  type="radio"
                  name="categoria"
                  checked={!query.categoria}
                  onChange={() => atualizar({ categoria: null })}
                />
                Todas
              </label>
              {catalogo.categorias.map((categoria) => (
                <label className="opcao-radio" key={categoria.slug}>
                  <input
                    type="radio"
                    name="categoria"
                    checked={query.categoria === categoria.slug}
                    onChange={() => atualizar({ categoria: categoria.slug })}
                  />
                  {categoria.nome}
                </label>
              ))}
            </fieldset>

            <div className="tabuleta-grupo">
              <label htmlFor="ordem" className="tabuleta-rotulo">
                Ordenar por
              </label>
              <select
                id="ordem"
                value={query.ordem}
                onChange={(e) =>
                  atualizar({
                    ordem: e.target.value === 'relevancia' ? null : e.target.value,
                  })
                }
              >
                {Object.entries(SORT_LABELS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </div>

            <label className="opcao-check">
              <input
                type="checkbox"
                checked={query.soDisponiveis}
                onChange={(e) => atualizar({ disponiveis: e.target.checked ? '1' : null })}
              />
              Só o que tem em estoque
            </label>
          </div>
        </details>
      </aside>

      <section className="catalogo-resultados" aria-labelledby="contagem" ref={ref}>
        <p id="contagem" className="contagem" aria-live="polite">
          {filtrados.length === 1 ? '1 folheto' : `${filtrados.length} folhetos`}
          {categoriaAtual ? ` em ${categoriaAtual.nome}` : ''}
          {query.busca ? ` para “${query.busca}”` : ''}
        </p>

        {filtrados.length === 0 ? (
          <div className="vazio">
            <h2>Nenhum folheto no barbante.</h2>
            <p>Nada combina com essa busca. Tente outra palavra ou limpe os filtros.</p>
            <button
              type="button"
              className="botao botao--contorno"
              onClick={() => {
                setBusca('')
                setParams(new URLSearchParams())
              }}
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          chunk(pagina.itens, colunas).map((linha) => <Varal key={linha.map((p) => p.id).join('-')} produtos={linha} />)
        )}

        {pagina.totalPaginas > 1 && (
          <nav className="paginas" aria-label="Paginação">
            {Array.from({ length: pagina.totalPaginas }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className="pagina-botao"
                aria-current={n === pagina.pagina ? 'page' : undefined}
                aria-label={`Página ${n}`}
                onClick={() => {
                  atualizar({ pagina: n === 1 ? null : String(n) })
                  window.scrollTo({ top: 0 })
                }}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </section>
    </div>
  )
}
