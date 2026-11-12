import { roundCents } from './money'

export type CardBrand = 'Visa' | 'Mastercard' | 'Amex' | 'Desconhecida'

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function luhnIsValid(numero: string): boolean {
  const digitos = onlyDigits(numero)
  if (digitos.length < 13 || digitos.length > 19) return false
  let soma = 0
  for (let i = 0; i < digitos.length; i++) {
    let d = Number(digitos[digitos.length - 1 - i])
    if (i % 2 === 1) {
      d *= 2
      if (d > 9) d -= 9
    }
    soma += d
  }
  return soma % 10 === 0
}

export function detectBrand(numero: string): CardBrand {
  const d = onlyDigits(numero)
  if (/^4/.test(d)) return 'Visa'
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(d)) return 'Mastercard'
  if (/^3[47]/.test(d)) return 'Amex'
  return 'Desconhecida'
}

export function formatCardNumber(value: string): string {
  return onlyDigits(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
}

export type CardInput = { numero: string; nome: string; validade: string; cvv: string; parcelas: number }

export type CardErrors = Partial<Record<keyof CardInput, string>>

export function validateCard(cartao: CardInput, total: number, hoje: Date = new Date()): CardErrors {
  const erros: CardErrors = {}

  if (!luhnIsValid(cartao.numero)) erros.numero = 'Número de cartão inválido.'

  if (cartao.nome.trim().split(/\s+/).length < 2) erros.nome = 'Digite o nome como está no cartão.'

  const validade = /^(\d{2})\/(\d{2})$/.exec(cartao.validade.trim())
  if (!validade) {
    erros.validade = 'Use o formato MM/AA.'
  } else {
    const mes = Number(validade[1])
    const ano = 2000 + Number(validade[2])
    if (mes < 1 || mes > 12) erros.validade = 'Mês inválido.'
    else if (ano < hoje.getFullYear() || (ano === hoje.getFullYear() && mes < hoje.getMonth() + 1)) {
      erros.validade = 'Cartão vencido.'
    }
  }

  const tamanhoCvv = detectBrand(cartao.numero) === 'Amex' ? 4 : 3
  if (!new RegExp(`^\\d{${tamanhoCvv}}$`).test(cartao.cvv)) erros.cvv = `O CVV tem ${tamanhoCvv} dígitos.`

  if (!installmentOptions(total).some((o) => o.parcelas === cartao.parcelas)) {
    erros.parcelas = 'Parcelamento indisponível para esse valor.'
  }
  return erros
}

export const MIN_INSTALLMENT = 20
export const MAX_INSTALLMENTS = 6

/** Interest-free up to 6x, as long as each installment is at least R$ 20,00. */
export function installmentOptions(total: number): { parcelas: number; valor: number }[] {
  const opcoes = [{ parcelas: 1, valor: total }]
  for (let n = 2; n <= MAX_INSTALLMENTS; n++) {
    const valor = roundCents(total / n)
    if (valor < MIN_INSTALLMENT) break
    opcoes.push({ parcelas: n, valor })
  }
  return opcoes
}

/** Simulated acquirer: these test numbers always come back declined. */
const DECLINED_CARDS = new Set(['4000000000000002'])

export function isDeclinedCard(numero: string): boolean {
  return DECLINED_CARDS.has(onlyDigits(numero))
}
