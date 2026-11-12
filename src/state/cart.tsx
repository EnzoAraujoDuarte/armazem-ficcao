import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { cartReducer, computeTotals, type CartAction, type CartState, type CartTotals } from '../domain/cart'
import type { ShippingQuote } from '../domain/shipping'
import { readJSON, STORAGE_KEYS, writeJSON } from '../domain/storage'

type CartContextValue = {
  state: CartState
  dispatch: (action: CartAction) => void
  cotacao: (ShippingQuote & { cep: string }) | null
  setCotacao: (cotacao: (ShippingQuote & { cep: string }) | null) => void
  totais: CartTotals
}

const CartContext = createContext<CartContextValue | null>(null)

const EMPTY: CartState = { linhas: [], cupom: null }

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, EMPTY, () => readJSON(STORAGE_KEYS.carrinho, EMPTY))
  const [cotacao, setCotacao] = useState<CartContextValue['cotacao']>(null)

  useEffect(() => {
    writeJSON(STORAGE_KEYS.carrinho, state)
  }, [state])

  // Another tab changing the cart should not leave this one stale.
  useEffect(() => {
    const reler = () => dispatch({ type: 'carregar', state: readJSON(STORAGE_KEYS.carrinho, EMPTY) })
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.carrinho) reler()
    }
    window.addEventListener('storage', onStorage)
    // A change another tab made between this tab's first render and now fired no event here.
    reler()
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const totais = useMemo(() => computeTotals(state, cotacao), [state, cotacao])
  const value = useMemo(() => ({ state, dispatch, cotacao, setCotacao, totais }), [state, cotacao, totais])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart precisa estar dentro de <CartProvider>')
  return ctx
}
