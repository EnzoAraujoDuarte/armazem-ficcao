import { Minus, Plus } from 'lucide-react'

type Props = { valor: number; maximo: number; onChange: (valor: number) => void; rotulo: string }

export function QuantityStepper({ valor, maximo, onChange, rotulo }: Props) {
  return (
    <div className="quantidade" role="group" aria-label={rotulo}>
      <button type="button" onClick={() => onChange(valor - 1)} disabled={valor <= 1} aria-label="Diminuir quantidade">
        <Minus aria-hidden="true" size={16} strokeWidth={3} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={maximo}
        value={valor}
        aria-label="Quantidade"
        onChange={(e) => {
          const numero = Number(e.target.value)
          if (Number.isFinite(numero) && numero >= 1) onChange(Math.min(numero, maximo))
        }}
      />
      <button type="button" onClick={() => onChange(valor + 1)} disabled={valor >= maximo} aria-label="Aumentar quantidade">
        <Plus aria-hidden="true" size={16} strokeWidth={3} />
      </button>
    </div>
  )
}
