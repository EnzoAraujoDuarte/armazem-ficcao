import { ChevronLeft } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { CatalogGate } from '../components/CatalogGate'
import { paperFor } from '../components/paper'
import { QuantityStepper } from '../components/QuantityStepper'
import { Woodcut } from '../components/Woodcut'
import { lineKey, maxQuantity } from '../domain/cart'
import { serialNumber, unitPrice, type Catalog, type Product } from '../domain/catalog'
import { formatBRL } from '../domain/money'
import { useCart } from '../state/cart'
import { useFeedback } from '../state/feedback'
import { NotFound } from './NotFound'

export function ProductPage() {
  const { slug } = useParams()
  return (
    <CatalogGate esqueleto={1}>
      {(catalogo: Catalog) => {
        const produto = catalogo.produtos.find((p) => p.slug === slug)
        if (!produto) return <NotFound mensagem="Esse folheto não está em nenhum barbante." />
        const categoria = catalogo.categorias.find((c) => c.slug === produto.categoria)
        return <ProductDetail key={produto.id} produto={produto} categoria={categoria?.nome ?? ''} />
      }}
    </CatalogGate>
  )
}

function ProductDetail({ produto, categoria }: { produto: Product; categoria: string }) {
  const { state, dispatch } = useCart()
  const { avisar, levarParaSacola } = useFeedback()
  const capaRef = useRef<HTMLDivElement>(null)
  const [opcao, setOpcao] = useState<string | null>(produto.opcoes?.valores[0]?.rotulo ?? null)
  const [quantidade, setQuantidade] = useState(1)

  const naSacola = state.linhas.find((l) => lineKey(l) === lineKey({ produtoId: produto.id, opcao }))?.quantidade ?? 0
  const limite = maxQuantity(produto.estoque)
  const disponivel = Math.max(0, limite - naSacola)
  const preco = unitPrice(produto, opcao)
  const esgotado = produto.estoque === 0

  function comprar() {
    dispatch({
      type: 'adicionar',
      quantidade,
      linha: {
        produtoId: produto.id,
        slug: produto.slug,
        nome: produto.nome,
        ilustracao: produto.ilustracao,
        opcao,
        precoUnitario: preco,
        estoque: produto.estoque,
      },
    })
    if (capaRef.current) levarParaSacola(capaRef.current)
    avisar(`${quantidade} × ${produto.nome}${opcao ? ` (${opcao})` : ''} foi para a sacola.`, { para: '/sacola', rotulo: 'Ver sacola' })
    setQuantidade(1)
  }

  return (
    <article className="folheto-aberto" aria-labelledby="titulo-produto">
      <Link to="/folhetos" className="voltar">
        <ChevronLeft aria-hidden="true" size={18} strokeWidth={2.6} /> Todos os folhetos
      </Link>
      <div className="folheto-aberto-paginas">
        <div ref={capaRef} className={`folheto-aberto-capa papel-${paperFor(produto.id)}`}>
          <span className="folheto-serie">{serialNumber(produto)}</span>
          <Woodcut nome={produto.ilustracao} titulo={produto.nome} className="folheto-gravura folheto-gravura--grande" style={{ viewTransitionName: `gravura-${produto.slug}` }} />
          <p className="folheto-aberto-categoria">{categoria}</p>
        </div>
        <div className="folheto-aberto-miolo">
          <h1 id="titulo-produto" className="produto-titulo">
            {produto.nome}
          </h1>
          <p className="produto-resumo">{produto.resumo}</p>
          <p className="produto-descricao">{produto.descricao}</p>

          <dl className="bilhete" aria-label="Procedência">
            <div>
              <dt>Inventor</dt>
              <dd>{produto.procedencia.inventor}</dd>
            </div>
            <div>
              <dt>Ano</dt>
              <dd>{produto.procedencia.ano}</dd>
            </div>
            <div>
              <dt>Origem</dt>
              <dd>{produto.procedencia.cidade}</dd>
            </div>
          </dl>

          <p className="produto-preco" data-testid="preco-produto">
            {formatBRL(preco)}
          </p>

          {produto.opcoes && (
            <fieldset className="opcoes">
              <legend>{produto.opcoes.nome}</legend>
              {produto.opcoes.valores.map((valor) => (
                <label key={valor.rotulo} className="opcao-tag">
                  <input
                    type="radio"
                    name="opcao"
                    value={valor.rotulo}
                    checked={opcao === valor.rotulo}
                    onChange={() => {
                      setOpcao(valor.rotulo)
                      setQuantidade(1)
                    }}
                  />
                  <span>
                    {valor.rotulo}
                    {valor.acrescimo > 0 && <small> + {formatBRL(valor.acrescimo)}</small>}
                  </span>
                </label>
              ))}
            </fieldset>
          )}

          {esgotado ? (
            <p className="selo-esgotado selo-esgotado--grande" role="status">
              Esgotado. Não dá para comprar este folheto agora.
            </p>
          ) : (
            <div className="compra">
              {disponivel > 0 ? (
                <>
                  <QuantityStepper valor={Math.min(quantidade, disponivel)} maximo={disponivel} onChange={setQuantidade} rotulo="Quantidade" />
                  <button type="button" className="botao botao--tinta botao--grande" onClick={comprar}>
                    Adicionar à sacola
                  </button>
                </>
              ) : (
                <p className="aviso-limite" role="status">
                  Você já tem o máximo permitido deste folheto na sacola.
                </p>
              )}
              <p className="estoque" data-testid="estoque">
                {produto.estoque <= 5 ? `Só restam ${produto.estoque} no estoque.` : `${produto.estoque} no estoque.`}
                {' '}Limite de {limite} por pedido.
                {naSacola > 0 && ` ${naSacola} já na sacola.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
