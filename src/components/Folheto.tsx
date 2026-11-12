import { useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { serialNumber, type Product } from '../domain/catalog'
import { formatBRL } from '../domain/money'
import { useCart } from '../state/cart'
import { useFeedback } from '../state/feedback'
import { paperFor } from './paper'
import { Woodcut } from './Woodcut'

type Props = { produto: Product; inclinacao?: number; queda?: number; titulo?: 'h2' | 'h3' }

export function Folheto({ produto, inclinacao = 0, queda = 0, titulo: Titulo = 'h3' }: Props) {
  const ref = useRef<HTMLElement>(null)
  const { dispatch } = useCart()
  const { avisar, levarParaSacola } = useFeedback()
  const esgotado = produto.estoque === 0
  const opcaoPadrao = produto.opcoes?.valores[0]?.rotulo ?? null

  function comprar() {
    dispatch({
      type: 'adicionar',
      quantidade: 1,
      linha: {
        produtoId: produto.id,
        slug: produto.slug,
        nome: produto.nome,
        ilustracao: produto.ilustracao,
        opcao: opcaoPadrao,
        precoUnitario: produto.preco,
        estoque: produto.estoque,
      },
    })
    if (ref.current) levarParaSacola(ref.current)
    avisar(`${produto.nome} foi para a sacola.`, { para: '/sacola', rotulo: 'Ver sacola' })
  }

  const estilo = { '--inclinacao': `${inclinacao}deg`, '--queda': `${queda}px` } as CSSProperties
  const idTitulo = `folheto-${produto.slug}`

  return (
    <article
      ref={ref}
      className={`folheto papel-${paperFor(produto.id)}${esgotado ? ' folheto--esgotado' : ''}`}
      style={estilo}
      aria-labelledby={idTitulo}
      data-testid="folheto"
    >
      <span className="pregador" aria-hidden="true" />
      <Link to={`/folheto/${produto.slug}`} className="folheto-capa" viewTransition>
        <span className="folheto-serie">{serialNumber(produto)}</span>
        <Woodcut
          nome={produto.ilustracao}
          titulo={produto.nome}
          className="folheto-gravura"
          style={{ viewTransitionName: `gravura-${produto.slug}` }}
        />
        <Titulo className="folheto-titulo" id={idTitulo}>
          {produto.nome}
        </Titulo>
        <span className="folheto-autor">por {produto.procedencia.inventor}</span>
      </Link>
      <div className="folheto-pe">
        <span className="folheto-preco" data-testid="preco">
          {produto.opcoes ? <small>a partir de </small> : null}
          {formatBRL(produto.preco)}
        </span>
        {esgotado ? (
          <span className="selo-esgotado">Esgotado</span>
        ) : (
          <button type="button" className="botao botao--tinta" onClick={comprar} aria-label={`Comprar ${produto.nome}`}>
            Comprar
          </button>
        )}
      </div>
    </article>
  )
}
