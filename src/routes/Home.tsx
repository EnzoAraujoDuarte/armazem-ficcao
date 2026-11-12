import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { CatalogGate } from '../components/CatalogGate'
import { Varal } from '../components/Varal'
import { FREE_SHIPPING_FROM } from '../domain/shipping'
import { formatBRL } from '../domain/money'

export function Home() {
  return (
    <>
      <section className="banca" aria-labelledby="titulo-banca">
        <div className="banca-texto">
          <h1 id="titulo-banca" className="banca-titulo">
            Objetos que não existem, vendidos com toda a seriedade.
          </h1>
          <p className="banca-sub">
            Vinte invenções capixabas impressas em folheto de cordel. Escolha uma no barbante e leve para a sacola.
          </p>
          <p className="banca-aviso">
            Loja fictícia para fins de estudo: nenhum produto existe e nada é cobrado.
          </p>
        </div>
        <CatalogGate esqueleto={5}>
          {(catalogo) => (
            <Varal produtos={catalogo.produtos.filter((p) => p.destaque).slice(0, 5)} rolavel titulo="h2" />
          )}
        </CatalogGate>
        <Link to="/folhetos" className="banca-todos">
          Ver os 20 folhetos <ArrowRight aria-hidden="true" size={20} strokeWidth={2.6} />
        </Link>
      </section>

      <section className="regras" aria-labelledby="titulo-regras">
        <h2 id="titulo-regras">Combinado da banca</h2>
        <ul className="regras-lista">
          <li>
            <strong>Frete grátis</strong> a partir de {formatBRL(FREE_SHIPPING_FROM)}. Abaixo disso, o valor sai pelo CEP.
          </li>
          <li>
            <strong>Até 10 unidades</strong> de cada folheto por pedido, e nunca mais que o estoque.
          </li>
          <li>
            <strong>Cupom da casa:</strong> FICCAO10 dá 10% de desconto. Só um cupom por compra.
          </li>
          <li>
            <strong>Pagamento de mentirinha:</strong> cartão, Pix ou boleto, todos simulados.
          </li>
        </ul>
      </section>
    </>
  )
}
