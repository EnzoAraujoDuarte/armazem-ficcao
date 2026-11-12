import { couponDiscount, type Coupon } from './coupons'
import { roundCents } from './money'
import { FREE_SHIPPING_FROM, type ShippingQuote } from './shipping'

export type CartLine = {
  produtoId: number
  slug: string
  nome: string
  ilustracao: string
  opcao: string | null
  precoUnitario: number
  quantidade: number
  estoque: number
}

export type CartState = { linhas: CartLine[]; cupom: Coupon | null }

export type CartAction =
  | { type: 'adicionar'; linha: Omit<CartLine, 'quantidade'>; quantidade: number }
  | { type: 'alterar-quantidade'; chave: string; quantidade: number }
  | { type: 'remover'; chave: string }
  | { type: 'aplicar-cupom'; cupom: Coupon }
  | { type: 'remover-cupom' }
  | { type: 'esvaziar' }
  | { type: 'carregar'; state: CartState }

export const MAX_PER_LINE = 10

export function lineKey(linha: Pick<CartLine, 'produtoId' | 'opcao'>): string {
  return `${linha.produtoId}:${linha.opcao ?? ''}`
}

/** A line can never hold more than the stock, nor more than the per-order cap. */
export function maxQuantity(estoque: number): number {
  return Math.min(estoque, MAX_PER_LINE)
}

function clamp(quantidade: number, estoque: number): number {
  return Math.min(Math.max(1, Math.floor(quantidade)), maxQuantity(estoque))
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'adicionar': {
      const chave = lineKey(action.linha)
      const existente = state.linhas.find((l) => lineKey(l) === chave)
      if (existente) {
        return {
          ...state,
          linhas: state.linhas.map((l) =>
            lineKey(l) === chave ? { ...l, quantidade: clamp(l.quantidade + action.quantidade, l.estoque) } : l,
          ),
        }
      }
      return {
        ...state,
        linhas: [...state.linhas, { ...action.linha, quantidade: clamp(action.quantidade, action.linha.estoque) }],
      }
    }
    case 'alterar-quantidade':
      return {
        ...state,
        linhas: state.linhas.map((l) =>
          lineKey(l) === action.chave ? { ...l, quantidade: clamp(action.quantidade, l.estoque) } : l,
        ),
      }
    case 'remover': {
      const linhas = state.linhas.filter((l) => lineKey(l) !== action.chave)
      return { linhas, cupom: linhas.length ? state.cupom : null }
    }
    case 'aplicar-cupom':
      return { ...state, cupom: action.cupom }
    case 'remover-cupom':
      return { ...state, cupom: null }
    case 'esvaziar':
      return { linhas: [], cupom: null }
    case 'carregar':
      return action.state
  }
}

export type CartTotals = {
  quantidadeItens: number
  subtotal: number
  desconto: number
  frete: number | null
  freteGratis: boolean
  total: number
  faltaParaFreteGratis: number
}

export function computeTotals(state: CartState, cotacao: ShippingQuote | null): CartTotals {
  const quantidadeItens = state.linhas.reduce((soma, l) => soma + l.quantidade, 0)
  const subtotal = roundCents(state.linhas.reduce((soma, l) => soma + l.precoUnitario * l.quantidade, 0))
  const desconto = couponDiscount(state.cupom, subtotal)
  const cupomDeFrete = state.cupom?.tipo === 'frete-gratis' && subtotal >= state.cupom.minimo
  const freteGratis = subtotal >= FREE_SHIPPING_FROM || cupomDeFrete
  const frete = cotacao ? (freteGratis ? 0 : cotacao.valor) : null
  const total = roundCents(subtotal - desconto + (frete ?? 0))
  const faltaParaFreteGratis = Math.max(0, roundCents(FREE_SHIPPING_FROM - subtotal))
  return { quantidadeItens, subtotal, desconto, frete, freteGratis, total, faltaParaFreteGratis }
}
