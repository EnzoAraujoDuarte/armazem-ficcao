import type { Product } from '../domain/catalog'
import { Folheto } from './Folheto'

const TILTS = [-2.4, 1.6, -1.1, 2.2, -1.7, 1.2]
const SAG_PX = 28

/**
 * A string of folhetos. The string sags like a real one, so each folheto hangs
 * lower the closer it is to the middle (parabola 4t(1-t)).
 */
export function Varal({ produtos, rolavel = false, titulo }: { produtos: Product[]; rolavel?: boolean; titulo?: 'h2' | 'h3' }) {
  const n = produtos.length
  return (
    <div className={`varal${rolavel ? ' varal--rolavel' : ''}`}>
      <div className="varal-trilho">
      <svg className="barbante" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true">
        <path d="M-10 6 Q500 62 1010 6" />
      </svg>
      <ul className="varal-lista" style={{ ['--colunas' as string]: n }}>
        {produtos.map((produto, i) => {
          const t = n === 1 ? 0.5 : (i + 0.5) / n
          return (
            <li key={produto.id}>
              <Folheto produto={produto} inclinacao={TILTS[(produto.id + i) % TILTS.length]} queda={4 * t * (1 - t) * SAG_PX} titulo={titulo} />
            </li>
          )
        })}
      </ul>
      </div>
    </div>
  )
}
