import { createBrowserRouter } from 'react-router'
import { Layout } from './components/Layout'
import { RequireSession } from './components/RequireSession'
import { CartPage } from './routes/CartPage'
import { Catalog } from './routes/Catalog'
import { Checkout } from './routes/Checkout'
import { Home } from './routes/Home'
import { NotFound } from './routes/NotFound'
import { OrderConfirmation } from './routes/OrderConfirmation'
import { Orders } from './routes/Orders'
import { ProductPage } from './routes/ProductPage'
import { SignIn } from './routes/SignIn'
import { SignUp } from './routes/SignUp'

export const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: 'folhetos', element: <Catalog /> },
        { path: 'folheto/:slug', element: <ProductPage /> },
        { path: 'sacola', element: <CartPage /> },
        { path: 'entrar', element: <SignIn /> },
        { path: 'cadastro', element: <SignUp /> },
        {
          element: <RequireSession />,
          children: [
            { path: 'finalizar', element: <Checkout /> },
            { path: 'pedidos', element: <Orders /> },
            { path: 'pedido/:numero', element: <OrderConfirmation /> },
          ],
        },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') },
)
