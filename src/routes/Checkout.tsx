import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { Field } from '../components/Field'
import { formatBRL } from '../domain/money'
import { saveOrder, UFS, validateAddress, type Address, type AddressErrors, type PaymentMethod } from '../domain/orders'
import {
  detectBrand,
  formatCardNumber,
  installmentOptions,
  isDeclinedCard,
  onlyDigits,
  validateCard,
  type CardErrors,
  type CardInput,
} from '../domain/payment'
import { formatCep, quoteShipping } from '../domain/shipping'
import { useCart } from '../state/cart'
import { useSession } from '../state/session'
import { Totals } from './CartPage'

const STEPS = ['Entrega', 'Pagamento', 'Conferência'] as const

/** Simulated acquirer latency, so the "processing" state is real and testable. */
export const PAYMENT_DELAY_MS = 1200

export function Checkout() {
  const { state, dispatch, cotacao, setCotacao, totais } = useCart()
  const { sessao } = useSession()
  const navigate = useNavigate()
  const [etapa, setEtapa] = useState(0)
  const [endereco, setEndereco] = useState<Address>({ cep: cotacao?.cep ?? '', rua: '', numero: '', complemento: '', cidade: '', uf: '' })
  const [errosEndereco, setErrosEndereco] = useState<AddressErrors>({})
  const [metodo, setMetodo] = useState<PaymentMethod>('cartao')
  const [cartao, setCartao] = useState<CardInput>({ numero: '', nome: '', validade: '', cvv: '', parcelas: 1 })
  const [errosCartao, setErrosCartao] = useState<CardErrors>({})
  const [processando, setProcessando] = useState(false)
  const [recusa, setRecusa] = useState<string | null>(null)
  const tituloRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    tituloRef.current?.focus()
  }, [etapa])

  if (state.linhas.length === 0 && !processando) return <Navigate to="/sacola" replace />

  function irParaPagamento(e: FormEvent) {
    e.preventDefault()
    const erros = validateAddress(endereco)
    const frete = quoteShipping(endereco.cep)
    if (!frete.ok) erros.cep = frete.mensagem
    setErrosEndereco(erros)
    if (Object.keys(erros).length || !frete.ok) return
    setCotacao({ ...frete.cotacao, cep: formatCep(endereco.cep) })
    setEtapa(1)
  }

  function irParaConferencia(e: FormEvent) {
    e.preventDefault()
    if (metodo === 'cartao') {
      const erros = validateCard(cartao, totais.total)
      setErrosCartao(erros)
      if (Object.keys(erros).length) return
    }
    setRecusa(null)
    setEtapa(2)
  }

  function descricaoPagamento(): string {
    if (metodo === 'pix') return 'Pix'
    if (metodo === 'boleto') return 'Boleto bancário'
    const final = onlyDigits(cartao.numero).slice(-4)
    const parcelas = cartao.parcelas === 1 ? 'à vista' : `em ${cartao.parcelas}x sem juros`
    return `Cartão ${detectBrand(cartao.numero)} final ${final}, ${parcelas}`
  }

  function confirmar() {
    setProcessando(true)
    setRecusa(null)
    window.setTimeout(() => {
      if (metodo === 'cartao' && isDeclinedCard(cartao.numero)) {
        setProcessando(false)
        setRecusa('Pagamento recusado pela operadora do cartão. Use outro cartão ou outra forma de pagamento.')
        return
      }
      const pedido = saveOrder({
        email: sessao!.email,
        linhas: state.linhas,
        totais,
        cupom: state.cupom?.codigo ?? null,
        endereco: { ...endereco, cep: formatCep(endereco.cep) },
        pagamento: { metodo, descricao: descricaoPagamento() },
      })
      dispatch({ type: 'esvaziar' })
      setCotacao(null)
      navigate(`/pedido/${pedido.numero}`, { replace: true })
    }, PAYMENT_DELAY_MS)
  }

  const parcelas = installmentOptions(totais.total)

  return (
    <div className="checkout">
      <ol className="etapas" aria-label="Etapas do pedido">
        <svg className="barbante barbante--etapas" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-10 8 Q500 44 1010 8" />
        </svg>
        {STEPS.map((nome, i) => (
          <li key={nome} className={`etapa${i === etapa ? ' etapa--atual' : ''}${i < etapa ? ' etapa--feita' : ''}`} aria-current={i === etapa ? 'step' : undefined}>
            <span className="etapa-numero">{i + 1}</span> {nome}
          </li>
        ))}
      </ol>

      <div className="checkout-corpo">
        <section className="checkout-etapa" aria-labelledby="titulo-etapa">
          <h1 id="titulo-etapa" ref={tituloRef} tabIndex={-1} className="pagina-titulo">
            {STEPS[etapa]}
          </h1>

          {etapa === 0 && (
            <form onSubmit={irParaPagamento} noValidate className="grade-form">
              <Field
                rotulo="CEP"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={9}
                value={endereco.cep}
                onChange={(e) => setEndereco({ ...endereco, cep: formatCep(e.target.value) })}
                erro={errosEndereco.cep}
                className="campo--curto"
              />
              <Field rotulo="Rua" autoComplete="address-line1" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} erro={errosEndereco.rua} className="campo--largo" />
              <Field rotulo="Número" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} erro={errosEndereco.numero} className="campo--curto" />
              <Field rotulo="Complemento (opcional)" autoComplete="address-line2" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
              <Field rotulo="Cidade" autoComplete="address-level2" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} erro={errosEndereco.cidade} />
              <div className={`campo campo--curto${errosEndereco.uf ? ' campo--erro' : ''}`}>
                <label htmlFor="uf">Estado</label>
                <select
                  id="uf"
                  value={endereco.uf}
                  onChange={(e) => setEndereco({ ...endereco, uf: e.target.value })}
                  aria-invalid={errosEndereco.uf ? true : undefined}
                  aria-describedby={errosEndereco.uf ? 'uf-erro' : undefined}
                >
                  <option value="">UF</option>
                  {UFS.map((uf) => (
                    <option key={uf}>{uf}</option>
                  ))}
                </select>
                {errosEndereco.uf && (
                  <span className="campo-erro" id="uf-erro">
                    {errosEndereco.uf}
                  </span>
                )}
              </div>
              <div className="form-acoes">
                <Link to="/sacola" className="link-botao link-botao--escuro">
                  Voltar para a sacola
                </Link>
                <button type="submit" className="botao botao--tinta botao--grande">
                  Continuar para pagamento
                </button>
              </div>
            </form>
          )}

          {etapa === 1 && (
            <form onSubmit={irParaConferencia} noValidate>
              <fieldset className="metodos">
                <legend>Forma de pagamento</legend>
                {(
                  [
                    ['cartao', 'Cartão de crédito'],
                    ['pix', 'Pix'],
                    ['boleto', 'Boleto'],
                  ] as const
                ).map(([valor, rotulo]) => (
                  <label key={valor} className="opcao-tag">
                    <input type="radio" name="metodo" value={valor} checked={metodo === valor} onChange={() => setMetodo(valor)} />
                    <span>{rotulo}</span>
                  </label>
                ))}
              </fieldset>

              {metodo === 'cartao' && (
                <div className="grade-form">
                  <Field
                    rotulo="Número do cartão"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cartao.numero}
                    onChange={(e) => setCartao({ ...cartao, numero: formatCardNumber(e.target.value) })}
                    erro={errosCartao.numero}
                    dica={onlyDigits(cartao.numero).length >= 2 ? `Bandeira: ${detectBrand(cartao.numero)}` : 'Cartões de teste: 4111 1111 1111 1111 (aprovado), 4000 0000 0000 0002 (recusado).'}
                    className="campo--largo"
                  />
                  <Field rotulo="Nome impresso no cartão" autoComplete="cc-name" value={cartao.nome} onChange={(e) => setCartao({ ...cartao, nome: e.target.value })} erro={errosCartao.nome} className="campo--largo" />
                  <Field
                    rotulo="Validade (MM/AA)"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    maxLength={5}
                    value={cartao.validade}
                    onChange={(e) => {
                      const d = onlyDigits(e.target.value).slice(0, 4)
                      setCartao({ ...cartao, validade: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d })
                    }}
                    erro={errosCartao.validade}
                    className="campo--curto"
                  />
                  <Field rotulo="CVV" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cartao.cvv} onChange={(e) => setCartao({ ...cartao, cvv: onlyDigits(e.target.value) })} erro={errosCartao.cvv} className="campo--curto" />
                  <div className="campo">
                    <label htmlFor="parcelas">Parcelas</label>
                    <select id="parcelas" value={cartao.parcelas} onChange={(e) => setCartao({ ...cartao, parcelas: Number(e.target.value) })}>
                      {parcelas.map((p) => (
                        <option key={p.parcelas} value={p.parcelas}>
                          {p.parcelas === 1 ? `À vista, ${formatBRL(p.valor)}` : `${p.parcelas}x de ${formatBRL(p.valor)} sem juros`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              {metodo === 'pix' && <p className="metodo-nota">O código Pix aparece depois de confirmar o pedido. Ele vale por 30 minutos (de mentira).</p>}
              {metodo === 'boleto' && <p className="metodo-nota">O boleto vence em 3 dias úteis. O pedido fica aguardando pagamento até lá.</p>}

              <div className="form-acoes">
                <button type="button" className="link-botao link-botao--escuro" onClick={() => setEtapa(0)}>
                  Voltar para entrega
                </button>
                <button type="submit" className="botao botao--tinta botao--grande">
                  Revisar pedido
                </button>
              </div>
            </form>
          )}

          {etapa === 2 && (
            <div className="conferencia">
              <h2>Itens</h2>
              <ul className="conferencia-itens">
                {state.linhas.map((l) => (
                  <li key={`${l.produtoId}:${l.opcao}`}>
                    {l.quantidade} × {l.nome}
                    {l.opcao ? ` (${l.opcao})` : ''} <span>{formatBRL(l.precoUnitario * l.quantidade)}</span>
                  </li>
                ))}
              </ul>
              <h2>Entrega</h2>
              <p data-testid="resumo-endereco">
                {endereco.rua}, {endereco.numero}
                {endereco.complemento ? `, ${endereco.complemento}` : ''} · {endereco.cidade}/{endereco.uf} · CEP {formatCep(endereco.cep)}
                {cotacao && ` · ${cotacao.prazoDias} dias úteis`}
              </p>
              <h2>Pagamento</h2>
              <p data-testid="resumo-pagamento">{descricaoPagamento()}</p>
              {recusa && (
                <p className="formulario-erro" role="alert">
                  {recusa}
                </p>
              )}
              <div className="form-acoes">
                <button type="button" className="link-botao link-botao--escuro" onClick={() => setEtapa(1)} disabled={processando}>
                  Mudar pagamento
                </button>
                <button type="button" className="botao botao--tinta botao--grande" onClick={confirmar} disabled={processando} aria-busy={processando}>
                  {processando ? 'Processando pagamento…' : `Confirmar pedido de ${formatBRL(totais.total)}`}
                </button>
              </div>
            </div>
          )}
        </section>

        <aside className="conta conta--checkout" aria-label="Resumo da compra">
          <h2 className="conta-titulo">Resumo</h2>
          <Totals />
        </aside>
      </div>
    </div>
  )
}
