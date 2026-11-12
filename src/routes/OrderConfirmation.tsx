import { Link, useParams } from 'react-router'
import { formatBRL } from '../domain/money'
import { findOrder } from '../domain/orders'
import { useSession } from '../state/session'
import { NotFound } from './NotFound'

function pixCode(numero: string, total: number): string {
  return `00020126ARMAZEMFICCAO${numero.replace('-', '')}5204000053039865406${total.toFixed(2)}5802BR6304FAKE`
}

export function OrderConfirmation() {
  const { numero = '' } = useParams()
  const { sessao } = useSession()
  const pedido = findOrder(numero)
  if (!pedido || pedido.email !== sessao?.email) return <NotFound mensagem="Não achamos esse pedido na sua conta." />

  const pago = pedido.pagamento.metodo === 'cartao'
  return (
    <div className="pedido-varal">
      <svg className="barbante" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 10 Q500 34 1010 10" />
      </svg>
      <span className="pregador pregador--esq" aria-hidden="true" />
      <span className="pregador pregador--dir" aria-hidden="true" />
      <section className="pedido papel-amarelo" aria-labelledby="titulo-pedido">
        <div className="pedido-cabeca">
          <h1 id="titulo-pedido">Pedido {pedido.numero}</h1>
          <p className={`carimbo carimbo--pedido${pago ? '' : ' carimbo--aguardando'}`} data-testid="carimbo">
            {pago ? 'Pago' : 'Aguardando pagamento'}
          </p>
        </div>
        <p className="pedido-sub">Obrigado pela compra imaginária. Nada vai chegar, mas o pedido ficou registrado.</p>

        <dl className="pedido-dados">
          <div>
            <dt>Total</dt>
            <dd data-testid="total-pedido">{formatBRL(pedido.totais.total)}</dd>
          </div>
          <div>
            <dt>Pagamento</dt>
            <dd>{pedido.pagamento.descricao}</dd>
          </div>
          <div>
            <dt>Entrega em</dt>
            <dd>
              {pedido.endereco.rua}, {pedido.endereco.numero} · {pedido.endereco.cidade}/{pedido.endereco.uf}
            </dd>
          </div>
        </dl>

        {pedido.pagamento.metodo === 'pix' && (
          <div className="pix">
            <label htmlFor="pix-copia-cola">Pix copia e cola</label>
            <input id="pix-copia-cola" readOnly value={pixCode(pedido.numero, pedido.totais.total)} />
          </div>
        )}
        {pedido.pagamento.metodo === 'boleto' && (
          <p className="metodo-nota">
            Linha digitável: 00190.00009 01234.567893 00000.000000 0 {pedido.numero.replace('AF-', '')}
          </p>
        )}

        <ul className="pedido-itens">
          {pedido.linhas.map((l) => (
            <li key={`${l.produtoId}:${l.opcao}`}>
              {l.quantidade} × {l.nome}
              {l.opcao ? ` (${l.opcao})` : ''}
            </li>
          ))}
        </ul>
        <div className="form-acoes">
          <Link to="/pedidos" className="link-botao link-botao--escuro">
            Ver meus pedidos
          </Link>
          <Link to="/folhetos" className="botao botao--tinta">
            Voltar ao barbante
          </Link>
        </div>
      </section>
    </div>
  )
}
