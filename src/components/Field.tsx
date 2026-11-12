import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; dica?: ReactNode }

export function Field({ rotulo, erro, dica, className, ...input }: Props) {
  const id = useId()
  const idErro = `${id}-erro`
  const idDica = `${id}-dica`
  const descricao = [erro ? idErro : null, dica ? idDica : null].filter(Boolean).join(' ') || undefined
  return (
    <div className={`campo${erro ? ' campo--erro' : ''}${className ? ` ${className}` : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      <input id={id} aria-invalid={erro ? true : undefined} aria-describedby={descricao} {...input} />
      {dica && !erro && (
        <span className="campo-dica" id={idDica}>
          {dica}
        </span>
      )}
      {erro && (
        <span className="campo-erro" id={idErro}>
          {erro}
        </span>
      )}
    </div>
  )
}
