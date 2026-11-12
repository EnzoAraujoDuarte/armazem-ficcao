import { Link } from 'react-router'

export function NotFound({ mensagem = 'Essa página não existe. Nem de mentira.' }: { mensagem?: string }) {
  return (
    <section className="nao-encontrado" aria-labelledby="titulo-404">
      <p className="carimbo carimbo--grande" aria-hidden="true">
        404
      </p>
      <h1 id="titulo-404">Folheto não encontrado</h1>
      <p>{mensagem}</p>
      <Link to="/folhetos" className="botao botao--tinta">
        Ver todos os folhetos
      </Link>
    </section>
  )
}
