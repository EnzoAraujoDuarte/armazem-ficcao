import { Link } from 'react-router'
import { formatBRL } from '../domain/money'
import { listOrders } from '../domain/orders'
import { useSession } from '../state/session'

export function Orders() {
  const { sessao } = useSession()
  const pedidos = listOrders(sessao!.email).slice().reverse()
  return (
    <section className="pedidos" aria-labelledby="titulo-pedidos">
      <h1 id="titulo-pedidos" className="pagina-titulo">
        Meus pedidos
      </h1>
      {pedidos.length === 0 ? (
        <div className="vazio">
          <p>Você ainda não fez nenhum pedido.</p>
          <Link to="/folhetos" className="botao botao--tinta">
            Escolher folhetos
          </Link>
        </div>
      ) : (
        <table className="tabela-pedidos">
          <caption className="visualmente-oculto">Pedidos feitos neste navegador</caption>
          <thead>
            <tr>
              <th scope="col">Pedido</th>
              <th scope="col">Data</th>
              <th scope="col">Itens</th>
              <th scope="col">Situação</th>
              <th scope="col" className="numero">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p) => (
              <tr key={p.numero}>
                <th scope="row">
                  <Link to={`/pedido/${p.numero}`}>{p.numero}</Link>
                </th>
                <td>{new Date(p.criadoEm).toLocaleDateString('pt-BR')}</td>
                <td>{p.totais.quantidadeItens}</td>
                <td>{p.pagamento.metodo === 'cartao' ? 'Pago' : 'Aguardando pagamento'}</td>
                <td className="numero">{formatBRL(p.totais.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
