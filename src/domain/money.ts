const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatBRL(value: number): string {
  return brl.format(value).replace(/ /g, ' ')
}

/** Prices are kept in reais with two decimals; rounding at each step avoids float drift like 0.1 + 0.2. */
export function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}
