import { Navigate, Outlet, useLocation } from 'react-router'
import { useSession } from '../state/session'

export function RequireSession() {
  const { sessao } = useSession()
  const location = useLocation()
  if (!sessao) {
    return <Navigate to={`/entrar?volta=${encodeURIComponent(location.pathname)}`} replace />
  }
  return <Outlet />
}
