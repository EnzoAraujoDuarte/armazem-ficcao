import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { CartProvider } from '../state/cart'
import { CatalogProvider } from '../state/catalog'
import { FeedbackProvider } from '../state/feedback'
import { SessionProvider } from '../state/session'
import { Header } from './Header'
import { Toast } from './Toast'
import { InkFilters } from './Woodcut'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export function Layout() {
  return (
    <SessionProvider>
      <CatalogProvider>
        <CartProvider>
          <FeedbackProvider>
            <ScrollToTop />
            <InkFilters />
            <a className="pular" href="#conteudo">Pular para o conteúdo</a>
            <Header />
            <main id="conteudo" tabIndex={-1}>
              <Outlet />
            </main>
            <footer className="rodape">
              <p>
                <strong>Armazém Ficção</strong> é uma loja de mentira: nenhum produto existe, nada é cobrado e nada é
                entregue. Seus dados ficam só neste navegador.
              </p>
              <p>
                Projeto da disciplina Qualidade e Teste de Software · <Link to="/folhetos">Ver todos os folhetos</Link>
              </p>
            </footer>
            <Toast />
          </FeedbackProvider>
        </CartProvider>
      </CatalogProvider>
    </SessionProvider>
  )
}
