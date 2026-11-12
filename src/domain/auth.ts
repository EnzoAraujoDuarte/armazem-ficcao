import { readJSON, STORAGE_KEYS, writeJSON } from './storage'

export type User = { nome: string; email: string; senhaHash: string }
export type Session = { nome: string; email: string }

export const DEMO_USER = { nome: 'Cliente Demonstração', email: 'demo@armazem.test', senha: 'ficcao123' }

export const MAX_ATTEMPTS = 3
export const LOCK_SECONDS = 30

async function sha256(texto: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto))
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function loadUsers(): Promise<User[]> {
  const usuarios = readJSON<User[]>(STORAGE_KEYS.usuarios, [])
  if (!usuarios.some((u) => u.email === DEMO_USER.email)) {
    usuarios.push({ nome: DEMO_USER.nome, email: DEMO_USER.email, senhaHash: await sha256(DEMO_USER.senha) })
    writeJSON(STORAGE_KEYS.usuarios, usuarios)
  }
  return usuarios
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export type SignUpInput = { nome: string; email: string; senha: string; confirmacao: string }
export type SignUpErrors = Partial<Record<keyof SignUpInput, string>>

export function validateSignUp(dados: SignUpInput): SignUpErrors {
  const erros: SignUpErrors = {}
  if (dados.nome.trim().length < 3) erros.nome = 'Digite seu nome (mínimo 3 letras).'
  if (!EMAIL_PATTERN.test(dados.email.trim())) erros.email = 'Digite um e-mail válido.'
  if (dados.senha.length < 8) erros.senha = 'A senha precisa ter pelo menos 8 caracteres.'
  else if (!/[a-zA-Z]/.test(dados.senha) || !/\d/.test(dados.senha)) erros.senha = 'Use letras e números na senha.'
  if (dados.confirmacao !== dados.senha) erros.confirmacao = 'As senhas não são iguais.'
  return erros
}

export async function signUp(dados: SignUpInput): Promise<{ ok: true; sessao: Session } | { ok: false; erros: SignUpErrors }> {
  const erros = validateSignUp(dados)
  if (Object.keys(erros).length) return { ok: false, erros }

  const email = dados.email.trim().toLowerCase()
  const usuarios = await loadUsers()
  if (usuarios.some((u) => u.email === email)) return { ok: false, erros: { email: 'Já existe uma conta com esse e-mail.' } }

  usuarios.push({ nome: dados.nome.trim(), email, senhaHash: await sha256(dados.senha) })
  writeJSON(STORAGE_KEYS.usuarios, usuarios)
  const sessao = { nome: dados.nome.trim(), email }
  writeJSON(STORAGE_KEYS.sessao, sessao)
  return { ok: true, sessao }
}

type Attempts = Record<string, { falhas: number; bloqueadoAte: number | null }>

export type SignInResult =
  | { ok: true; sessao: Session }
  | { ok: false; mensagem: string; bloqueadoAte: number | null }

export async function signIn(emailDigitado: string, senha: string, agora = Date.now()): Promise<SignInResult> {
  const email = emailDigitado.trim().toLowerCase()
  const tentativas = readJSON<Attempts>(STORAGE_KEYS.tentativas, {})
  const registro = tentativas[email] ?? { falhas: 0, bloqueadoAte: null }

  if (registro.bloqueadoAte && agora < registro.bloqueadoAte) {
    return { ok: false, mensagem: 'Conta bloqueada por excesso de tentativas.', bloqueadoAte: registro.bloqueadoAte }
  }
  if (registro.bloqueadoAte && agora >= registro.bloqueadoAte) {
    registro.falhas = 0
    registro.bloqueadoAte = null
  }

  const usuario = (await loadUsers()).find((u) => u.email === email)
  if (usuario && usuario.senhaHash === (await sha256(senha))) {
    delete tentativas[email]
    writeJSON(STORAGE_KEYS.tentativas, tentativas)
    const sessao = { nome: usuario.nome, email: usuario.email }
    writeJSON(STORAGE_KEYS.sessao, sessao)
    return { ok: true, sessao }
  }

  registro.falhas += 1
  if (registro.falhas >= MAX_ATTEMPTS) registro.bloqueadoAte = agora + LOCK_SECONDS * 1000
  tentativas[email] = registro
  writeJSON(STORAGE_KEYS.tentativas, tentativas)

  const restantes = MAX_ATTEMPTS - registro.falhas
  return {
    ok: false,
    mensagem: registro.bloqueadoAte
      ? 'Conta bloqueada por excesso de tentativas.'
      : `E-mail ou senha incorretos. ${restantes === 1 ? 'Resta 1 tentativa' : `Restam ${restantes} tentativas`}.`,
    bloqueadoAte: registro.bloqueadoAte,
  }
}

export function readSession(): Session | null {
  return readJSON<Session | null>(STORAGE_KEYS.sessao, null)
}

export function signOut(): void {
  localStorage.removeItem(STORAGE_KEYS.sessao)
}
