const PAPERS = ['amarelo', 'rosa', 'verde', 'celeste', 'laranja'] as const

export type Paper = (typeof PAPERS)[number]

/** Each folheto keeps the same paper colour everywhere it appears. */
export function paperFor(produtoId: number): Paper {
  return PAPERS[(produtoId - 1) % PAPERS.length]
}
