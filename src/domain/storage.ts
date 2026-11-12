/** Everything the store remembers lives in the visitor's own browser, under these keys. */
export const STORAGE_KEYS = {
  carrinho: 'armazem:carrinho',
  usuarios: 'armazem:usuarios',
  sessao: 'armazem:sessao',
  pedidos: 'armazem:pedidos',
  tentativas: 'armazem:tentativas-login',
} as const

export function readJSON<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key)
  if (raw === null) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    // A hand-edited or corrupted entry should not break the store: start that entry over.
    localStorage.removeItem(key)
    return fallback
  }
}

export function writeJSON(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}
