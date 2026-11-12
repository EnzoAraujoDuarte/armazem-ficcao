import type { ChangeEvent, FormEvent } from 'react'
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { Field } from '../components/Field'
import { signUp, type SignUpErrors, type SignUpInput } from '../domain/auth'
import { useSession } from '../state/session'
import { safeReturnPath } from './SignIn'

export function SignUp() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { entrar } = useSession()
  const [dados, setDados] = useState<SignUpInput>({ nome: '', email: '', senha: '', confirmacao: '' })
  const [erros, setErros] = useState<SignUpErrors>({})

  const alterar = (campo: keyof SignUpInput) => (e: ChangeEvent<HTMLInputElement>) =>
    setDados((d) => ({ ...d, [campo]: e.target.value }))

  async function enviar(e: FormEvent) {
    e.preventDefault()
    const resultado = await signUp(dados)
    if (!resultado.ok) {
      setErros(resultado.erros)
      return
    }
    entrar(resultado.sessao)
    navigate(safeReturnPath(params.get('volta')), { replace: true })
  }

  return (
    <section className="formulario-folheto papel-verde" aria-labelledby="titulo-cadastro">
      <h1 id="titulo-cadastro">Criar conta</h1>
      <form onSubmit={enviar} noValidate>
        <Field rotulo="Nome" autoComplete="name" value={dados.nome} onChange={alterar('nome')} erro={erros.nome} />
        <Field rotulo="E-mail" type="email" autoComplete="email" value={dados.email} onChange={alterar('email')} erro={erros.email} />
        <Field
          rotulo="Senha"
          type="password"
          autoComplete="new-password"
          value={dados.senha}
          onChange={alterar('senha')}
          erro={erros.senha}
          dica="Mínimo de 8 caracteres, com letras e números."
        />
        <Field
          rotulo="Confirmar senha"
          type="password"
          autoComplete="new-password"
          value={dados.confirmacao}
          onChange={alterar('confirmacao')}
          erro={erros.confirmacao}
        />
        <button type="submit" className="botao botao--tinta botao--grande botao--largo">
          Criar conta
        </button>
      </form>
      <p>
        Já tem conta? <Link to="/entrar">Entrar</Link>
      </p>
    </section>
  )
}
