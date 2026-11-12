import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Field } from '../components/Field'
import { DEMO_USER, signIn } from '../domain/auth'
import { useSession } from '../state/session'

/** Only same-site paths are accepted as a return destination, never a full URL. */
function safeReturnPath(volta: string | null): string {
  return volta && volta.startsWith('/') && !volta.startsWith('//') ? volta : '/'
}

export function SignIn() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { entrar } = useSession()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [bloqueadoAte, setBloqueadoAte] = useState<number | null>(null)
  const [agora, setAgora] = useState(() => Date.now())
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    if (!bloqueadoAte) return
    const id = window.setInterval(() => setAgora(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [bloqueadoAte])

  const segundosRestantes = bloqueadoAte ? Math.max(0, Math.ceil((bloqueadoAte - agora) / 1000)) : 0
  const bloqueado = segundosRestantes > 0

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    setEnviando(true)
    const resultado = await signIn(email, senha, Date.now())
    setEnviando(false)
    if (resultado.ok) {
      entrar(resultado.sessao)
      navigate(safeReturnPath(params.get('volta')), { replace: true })
      return
    }
    setErro(resultado.mensagem)
    setBloqueadoAte(resultado.bloqueadoAte)
    setAgora(Date.now())
  }

  return (
    <section className="formulario-folheto papel-celeste" aria-labelledby="titulo-entrar">
      <h1 id="titulo-entrar">Entrar</h1>
      {params.get('volta') && <p className="formulario-motivo">Entre na sua conta para fechar o pedido.</p>}
      <form onSubmit={enviar} noValidate>
        <Field rotulo="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field rotulo="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        {erro && !bloqueado && (
          <p className="formulario-erro" role="alert">
            {erro}
          </p>
        )}
        {bloqueado && (
          <p className="formulario-erro" role="alert" data-testid="bloqueio">
            Conta bloqueada por excesso de tentativas. Tente de novo em {segundosRestantes} s.
          </p>
        )}
        <button type="submit" className="botao botao--tinta botao--grande botao--largo" disabled={bloqueado || enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p className="formulario-demo">
        Conta de demonstração: <strong>{DEMO_USER.email}</strong> / <strong>{DEMO_USER.senha}</strong>
      </p>
      <p>
        Ainda não tem conta? <Link to={`/cadastro${params.get('volta') ? `?volta=${encodeURIComponent(params.get('volta')!)}` : ''}`}>Criar conta</Link>
      </p>
    </section>
  )
}

export { safeReturnPath }
