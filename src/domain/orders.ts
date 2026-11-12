import type { CartLine, CartTotals } from './cart'
import { readJSON, STORAGE_KEYS, writeJSON } from './storage'

export type PaymentMethod = 'cartao' | 'pix' | 'boleto'

export type Address = { cep: string; rua: string; numero: string; complemento: string; cidade: string; uf: string }

export type Order = {
  numero: string
  email: string
  criadoEm: string
  linhas: CartLine[]
  totais: CartTotals
  cupom: string | null
  endereco: Address
  pagamento: { metodo: PaymentMethod; descricao: string }
}

export function listOrders(email: string): Order[] {
  return readJSON<Order[]>(STORAGE_KEYS.pedidos, []).filter((p) => p.email === email)
}

export function findOrder(numero: string): Order | undefined {
  return readJSON<Order[]>(STORAGE_KEYS.pedidos, []).find((p) => p.numero === numero)
}

export function saveOrder(pedido: Omit<Order, 'numero' | 'criadoEm'>, agora = new Date()): Order {
  const pedidos = readJSON<Order[]>(STORAGE_KEYS.pedidos, [])
  const numero = `AF-${String(pedidos.length + 1).padStart(6, '0')}`
  const completo: Order = { ...pedido, numero, criadoEm: agora.toISOString() }
  writeJSON(STORAGE_KEYS.pedidos, [...pedidos, completo])
  return completo
}

export const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export type AddressErrors = Partial<Record<keyof Address, string>>

export function validateAddress(endereco: Address): AddressErrors {
  const erros: AddressErrors = {}
  if (endereco.cep.replace(/\D/g, '').length !== 8) erros.cep = 'O CEP precisa ter 8 dígitos.'
  if (endereco.rua.trim().length < 3) erros.rua = 'Digite a rua.'
  if (!/^\d+[a-zA-Z]?$|^s\/n$/i.test(endereco.numero.trim())) erros.numero = 'Digite o número (ou s/n).'
  if (endereco.cidade.trim().length < 2) erros.cidade = 'Digite a cidade.'
  if (!UFS.includes(endereco.uf)) erros.uf = 'Escolha o estado.'
  return erros
}
