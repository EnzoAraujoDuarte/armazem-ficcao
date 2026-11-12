import { ShoppingBag } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router'
import { useCart } from '../state/cart'
import { useFeedback } from '../state/feedback'
import { useSession } from '../state/session'

export function Header() {
  const { totais } = useCart()
  const { sessao, sair } = useSession()
  const { sacolaRef } = useFeedback()
  const navigate = useNavigate()
  const itens = totais.quantidadeItens

  return (
    <header className="letreiro">
      <Link to="/" className="marca" aria-label="Armazém Ficção, página inicial">
        <span className="marca-nome">Armazém</span>
        <span className="marca-nome marca-nome--2">Ficção</span>
      </Link>
      <nav aria-label="Principal" className="letreiro-nav">
        <NavLink to="/folhetos">Folhetos</NavLink>
        {sessao ? (
          <>
            <NavLink to="/pedidos">Meus pedidos</NavLink>
            <span className="letreiro-usuario">Olá, {sessao.nome.split(' ')[0]}</span>
            <button
              type="button"
              className="link-botao"
              onClick={() => {
                sair()
                navigate('/')
              }}
            >
              Sair
            </button>
          </>
        ) : (
          <NavLink to="/entrar">Entrar</NavLink>
        )}
        <Link
          to="/sacola"
          ref={sacolaRef}
          className="sacola-link"
          aria-label={`Sacola, ${itens} ${itens === 1 ? 'item' : 'itens'}`}
        >
          <ShoppingBag aria-hidden="true" strokeWidth={2.4} />
          <span className="sacola-rotulo">Sacola</span>
          <span className="sacola-contador" key={itens} data-testid="contador-sacola">
            {itens}
          </span>
        </Link>
      </nav>
    </header>
  )
}
