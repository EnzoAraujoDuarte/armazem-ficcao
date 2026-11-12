import { X } from 'lucide-react'
import { Link } from 'react-router'
import { useFeedback } from '../state/feedback'

export function Toast() {
  const { aviso, fecharAviso } = useFeedback()
  return (
    <div className="aviso-area" role="status" aria-live="polite">
      {aviso && (
        <div className="aviso" key={aviso.id}>
          <p>{aviso.texto}</p>
          {aviso.link && (
            <Link to={aviso.link.para} onClick={fecharAviso}>
              {aviso.link.rotulo}
            </Link>
          )}
          <button type="button" className="aviso-fechar" onClick={fecharAviso} aria-label="Fechar aviso">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
