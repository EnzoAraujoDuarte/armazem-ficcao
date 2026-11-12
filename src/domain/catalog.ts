export type Category = { slug: string; nome: string }

export type OptionValue = { rotulo: string; acrescimo: number }

export type Product = {
  id: number
  slug: string
  nome: string
  categoria: string
  preco: number
  estoque: number
  ilustracao: string
  resumo: string
  descricao: string
  procedencia: { inventor: string; ano: number; cidade: string }
  opcoes?: { nome: string; valores: OptionValue[] }
  destaque?: boolean
}

export type Catalog = { categorias: Category[]; produtos: Product[] }

export const PAGE_SIZE = 12

export type SortOrder = 'relevancia' | 'menor-preco' | 'maior-preco' | 'nome'

export type CatalogQuery = {
  busca: string
  categoria: string | null
  ordem: SortOrder
  soDisponiveis: boolean
  pagina: number
}

export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  const response = await fetch(`${import.meta.env.BASE_URL}api/produtos.json`, { signal })
  if (!response.ok) throw new Error(`Catálogo indisponível (HTTP ${response.status})`)
  return (await response.json()) as Catalog
}

/** Accent- and case-insensitive, so "cafe" finds "Café" and "BUSSOLA" finds "Bússola". */
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

export function filterProducts(produtos: Product[], query: CatalogQuery): Product[] {
  const termo = normalizeText(query.busca)
  const filtrados = produtos.filter((produto) => {
    if (query.categoria && produto.categoria !== query.categoria) return false
    if (query.soDisponiveis && produto.estoque === 0) return false
    if (!termo) return true
    return normalizeText(`${produto.nome} ${produto.resumo}`).includes(termo)
  })

  const ordenados = [...filtrados]
  switch (query.ordem) {
    case 'menor-preco':
      ordenados.sort((a, b) => a.preco - b.preco)
      break
    case 'maior-preco':
      ordenados.sort((a, b) => b.preco - a.preco)
      break
    case 'nome':
      ordenados.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      break
    case 'relevancia':
      break
  }
  return ordenados
}

export function paginate<T>(items: T[], pagina: number): { itens: T[]; totalPaginas: number; pagina: number } {
  const totalPaginas = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const paginaValida = Math.min(Math.max(1, pagina), totalPaginas)
  const inicio = (paginaValida - 1) * PAGE_SIZE
  return { itens: items.slice(inicio, inicio + PAGE_SIZE), totalPaginas, pagina: paginaValida }
}

export function unitPrice(produto: Product, opcao: string | null): number {
  const valor = produto.opcoes?.valores.find((v) => v.rotulo === opcao)
  return produto.preco + (valor?.acrescimo ?? 0)
}

export function serialNumber(produto: Product): string {
  return `Nº ${String(produto.id).padStart(3, '0')}`
}
