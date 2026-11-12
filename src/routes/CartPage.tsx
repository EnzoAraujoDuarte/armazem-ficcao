import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { paperFor } from '../components/paper'
import { QuantityStepper } from '../components/QuantityStepper'
import { Woodcut } from '../components/Woodcut'
import { lineKey, maxQuantity } from '../domain/cart'
import { validateCoupon } from '../domain/coupons'
import { formatBRL } from '../domain/money'
import { formatCep, quoteShipping } from '../domain/shipping'
import { useCart } from '../state/cart'
import { useSession } from '../state/session'

export function CartPage() {
  const { state, dispatch, totais } = useCart()
  const { sessao } = useSession()
  const navigate = useNavigate()

  if (state.linhas.length === 0) {
    return (
      <section className="sacola-vazia" aria-labelledby="titulo-sacola">
        <h1 id="titulo-sacola" className="pagina-titulo">
          Sua sacola está vazia
        </h1>
        <p>Nenhum folheto ainda. O barbante está cheio deles.</p>
        <Link to="/folhetos" className="botao botao--tinta">
          Escolher folhetos
        </Link>
      </section>
    )
  }

  return (
    <div className="sacola">
      <h1 className="pagina-titulo">Sua sacola</h1>
      <div className="sacola-corpo">
        <section className="nota" aria-label="Itens da sacola">
          <ul className="nota-linhas">
            {state.linhas.map((linha) => {
              const chave = lineKey(linha)
              return (
                <li key={chave} className="nota-linha" data-testid="linha-sacola">
                  <Link to={`/folheto/${linha.slug}`} className={`nota-miniatura papel-${paperFor(linha.produtoId)}`} tabIndex={-1} aria-hidden="true">
                    <Woodcut nome={linha.ilustracao} titulo={linha.nome} />
                  </Link>
                  <div className="nota-info">
                    <h2 className="nota-nome">
                      <Link to={`/folheto/${linha.slug}`}>{linha.nome}</Link>
                    </h2>
                    {linha.opcao && <p className="nota-opcao">{linha.opcao}</p>}
                    <p className="nota-unitario">{formatBRL(linha.precoUnitario)} cada</p>
                  </div>
                  <QuantityStepper
                    valor={linha.quantidade}
                    maximo={maxQuantity(linha.estoque)}
                    rotulo={`Quantidade de ${linha.nome}`}
                    onChange={(quantidade) => dispatch({ type: 'alterar-quantidade', chave, quantidade })}
                  />
                  <p className="nota-total" data-testid="total-linha">
                    {formatBRL(linha.precoUnitario * linha.quantidade)}
                  </p>
                  <button
                    type="button"
                    className="icone-botao"
                    onClick={() => dispatch({ type: 'remover', chave })}
                    aria-label={`Remover ${linha.nome} da sacola`}
                  >
                    <Trash2 aria-hidden="true" size={20} />
                  </button>
                </li>
              )
            })}
          </ul>
          <button type="button" className="link-botao link-botao--escuro" onClick={() => dispatch({ type: 'esvaziar' })}>
            Esvaziar sacola
          </button>
        </section>

        <aside className="conta" aria-label="Resumo da compra">
          <ShippingForm />
          <CouponForm />
          <Totals />
          {totais.faltaParaFreteGratis > 0 ? (
            <p className="frete-meta" data-testid="falta-frete-gratis">
              Faltam {formatBRL(totais.faltaParaFreteGratis)} para o frete grátis.
            </p>
          ) : (
            <p className="frete-meta frete-meta--ok">Frete grátis garantido.</p>
          )}
          <button
            type="button"
            className="botao botao--tinta botao--grande botao--largo"
            onClick={() => navigate(sessao ? '/finalizar' : '/entrar?volta=%2Ffinalizar')}
          >
            Fechar pedido
          </button>
          <Link to="/folhetos" className="continuar">
            Continuar escolhendo
          </Link>
        </aside>
      </div>
    </div>
  )
}

export function Totals() {
  const { state, totais } = useCart()
  return (
    <dl className="totais">
      <div>
        <dt>Subtotal ({totais.quantidadeItens} {totais.quantidadeItens === 1 ? 'item' : 'itens'})</dt>
        <dd data-testid="subtotal">{formatBRL(totais.subtotal)}</dd>
      </div>
      {totais.desconto > 0 && (
        <div>
          <dt>Desconto {state.cupom?.codigo}</dt>
          <dd data-testid="desconto">− {formatBRL(totais.desconto)}</dd>
        </div>
      )}
      <div>
        <dt>Frete</dt>
        <dd data-testid="frete">{totais.frete === null ? 'Informe o CEP' : totais.frete === 0 ? 'Grátis' : formatBRL(totais.frete)}</dd>
      </div>
      <div className="totais-total">
        <dt>Total</dt>
        <dd data-testid="total">{formatBRL(totais.total)}</dd>
      </div>
    </dl>
  )
}

function ShippingForm() {
  const { cotacao, setCotacao } = useCart()
  const [cep, setCep] = useState(cotacao?.cep ?? '')
  const [erro, setErro] = useState<string | null>(null)

  return (
    <form
      className="mini-form"
      onSubmit={(e) => {
        e.preventDefault()
        const resultado = quoteShipping(cep)
        if (resultado.ok) {
          setErro(null)
          setCotacao({ ...resultado.cotacao, cep: formatCep(cep) })
        } else {
          setErro(resultado.mensagem)
          setCotacao(null)
        }
      }}
    >
      <label htmlFor="cep-sacola">Calcular frete</label>
      <div className="mini-form-linha">
        <input
          id="cep-sacola"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          maxLength={9}
          onChange={(e) => setCep(e.target.value)}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? 'cep-sacola-erro' : cotacao ? 'cep-sacola-resultado' : undefined}
        />
        <button type="submit" className="botao botao--contorno">
          Calcular
        </button>
      </div>
      {erro && (
        <p className="mini-form-erro" id="cep-sacola-erro" role="alert">
          {erro}
        </p>
      )}
      {cotacao && !erro && (
        <p className="mini-form-ok" id="cep-sacola-resultado" data-testid="cotacao-frete">
          {cotacao.regiao}: {formatBRL(cotacao.valor)}, entrega em {cotacao.prazoDias} dias úteis.
        </p>
      )}
    </form>
  )
}

function CouponForm() {
  const { state, dispatch, totais } = useCart()
  const [codigo, setCodigo] = useState('')
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null)

  if (state.cupom) {
    return (
      <div className="mini-form">
        <p className="cupom-ativo" data-testid="cupom-ativo">
          Cupom <strong>{state.cupom.codigo}</strong> aplicado.
          {totais.subtotal < state.cupom.minimo && ` Ele só vale a partir de ${formatBRL(state.cupom.minimo)}, então não conta agora.`}
        </p>
        <button
          type="button"
          className="link-botao link-botao--escuro"
          onClick={() => {
            dispatch({ type: 'remover-cupom' })
            setMensagem(null)
          }}
        >
          Remover cupom
        </button>
      </div>
    )
  }

  return (
    <form
      className="mini-form"
      onSubmit={(e) => {
        e.preventDefault()
        const resultado = validateCoupon(codigo, totais.subtotal)
        setMensagem({ ok: resultado.ok, texto: resultado.mensagem })
        if (resultado.ok) {
          dispatch({ type: 'aplicar-cupom', cupom: resultado.cupom })
          setCodigo('')
        }
      }}
    >
      <label htmlFor="cupom">Cupom de desconto</label>
      <div className="mini-form-linha">
        <input
          id="cupom"
          autoCapitalize="characters"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          aria-invalid={mensagem && !mensagem.ok ? true : undefined}
          aria-describedby={mensagem ? 'cupom-mensagem' : undefined}
        />
        <button type="submit" className="botao botao--contorno">
          Aplicar
        </button>
      </div>
      {mensagem && !mensagem.ok && (
        <p className="mini-form-erro" id="cupom-mensagem" role="alert">
          {mensagem.texto}
        </p>
      )}
    </form>
  )
}
