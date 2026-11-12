import { roundCents } from './money'

export type Coupon =
  | { codigo: string; tipo: 'percentual'; valor: number; minimo: number; validoAte: string | null }
  | { codigo: string; tipo: 'fixo'; valor: number; minimo: number; validoAte: string | null }
  | { codigo: string; tipo: 'frete-gratis'; minimo: number; validoAte: string | null }

export const COUPONS: Coupon[] = [
  { codigo: 'FICCAO10', tipo: 'percentual', valor: 10, minimo: 0, validoAte: null },
  { codigo: 'PRIMEIRACOMPRA', tipo: 'fixo', valor: 25, minimo: 100, validoAte: null },
  { codigo: 'FRETEGRATIS', tipo: 'frete-gratis', minimo: 150, validoAte: null },
  { codigo: 'VERAO2020', tipo: 'percentual', valor: 20, minimo: 0, validoAte: '2020-03-20' },
]

export type CouponResult =
  | { ok: true; cupom: Coupon; mensagem: string }
  | { ok: false; mensagem: string }

export function validateCoupon(codigoDigitado: string, subtotal: number, hoje: Date = new Date()): CouponResult {
  const codigo = codigoDigitado.trim().toUpperCase()
  if (!codigo) return { ok: false, mensagem: 'Digite um cupom.' }

  const cupom = COUPONS.find((c) => c.codigo === codigo)
  if (!cupom) return { ok: false, mensagem: `O cupom ${codigo} não existe.` }

  if (cupom.validoAte && hoje > new Date(`${cupom.validoAte}T23:59:59`)) {
    return { ok: false, mensagem: `O cupom ${codigo} expirou.` }
  }
  if (subtotal < cupom.minimo) {
    return { ok: false, mensagem: `O cupom ${codigo} vale para compras a partir de R$ ${cupom.minimo},00.` }
  }
  return { ok: true, cupom, mensagem: `Cupom ${codigo} aplicado.` }
}

export function couponDiscount(cupom: Coupon | null, subtotal: number): number {
  if (!cupom || subtotal < cupom.minimo) return 0
  if (cupom.tipo === 'percentual') return roundCents((subtotal * cupom.valor) / 100)
  if (cupom.tipo === 'fixo') return Math.min(cupom.valor, subtotal)
  return 0
}
