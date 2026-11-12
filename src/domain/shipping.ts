export const FREE_SHIPPING_FROM = 300

export type ShippingQuote = { regiao: string; valor: number; prazoDias: number }

export type ShippingResult = { ok: true; cotacao: ShippingQuote } | { ok: false; mensagem: string }

/** Prices by the first digits of the CEP, which in Brazil map to a state or region. */
const TABLE: { prefixos: string[]; regiao: string; valor: number; prazoDias: number }[] = [
  { prefixos: ['29'], regiao: 'Espírito Santo', valor: 12.9, prazoDias: 2 },
  { prefixos: ['20', '21', '22', '23', '24', '25', '26', '27', '28'], regiao: 'Rio de Janeiro', valor: 16.9, prazoDias: 3 },
  { prefixos: ['0', '1'], regiao: 'São Paulo', valor: 18.9, prazoDias: 3 },
  { prefixos: ['3'], regiao: 'Minas Gerais', valor: 17.9, prazoDias: 4 },
  { prefixos: ['4', '5'], regiao: 'Nordeste', valor: 24.9, prazoDias: 6 },
  { prefixos: ['6'], regiao: 'Norte e Ceará', valor: 32.9, prazoDias: 9 },
  { prefixos: ['7'], regiao: 'Centro-Oeste', valor: 22.9, prazoDias: 5 },
  { prefixos: ['8', '9'], regiao: 'Sul', valor: 21.9, prazoDias: 5 },
]

export function normalizeCep(cep: string): string {
  return cep.replace(/\D/g, '')
}

export function formatCep(cep: string): string {
  const digitos = normalizeCep(cep).slice(0, 8)
  return digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos
}

export function quoteShipping(cepDigitado: string): ShippingResult {
  if (/[^\d\s-]/.test(cepDigitado)) return { ok: false, mensagem: 'O CEP só pode ter números.' }
  const cep = normalizeCep(cepDigitado)
  if (cep.length !== 8) return { ok: false, mensagem: 'O CEP precisa ter 8 dígitos.' }
  if (/^0+$/.test(cep)) return { ok: false, mensagem: 'Esse CEP não existe.' }

  const linha = TABLE.find((l) => l.prefixos.some((p) => cep.startsWith(p)))
  if (!linha) return { ok: false, mensagem: 'Não entregamos nesse CEP.' }
  return { ok: true, cotacao: { regiao: linha.regiao, valor: linha.valor, prazoDias: linha.prazoDias } }
}
