import type { CSSProperties, ReactNode } from 'react'

/*
 * Hand-authored woodcut (xilogravura) illustrations for every invented product.
 * Ink is var(--tinta); the white of the cut wood is var(--papel), so each print takes
 * the colour of the folheto it is printed on. The #xilo filter (in InkFilters) roughens
 * every edge the way a hand-inked block does.
 */

const INK = 'var(--tinta)'
const CUT = 'var(--papel)'

function Ground({ y = 120 }: { y?: number }) {
  return (
    <g>
      <path d={`M0 ${y} Q30 ${y - 5} 62 ${y} T120 ${y - 2} T160 ${y} V140 H0 Z`} fill={INK} />
      {[12, 34, 58, 81, 104, 127, 148].map((x, i) => (
        <path key={x} d={`M${x} ${y + 7 + (i % 2) * 4} l9 -2`} stroke={CUT} strokeWidth="1.6" strokeLinecap="round" />
      ))}
    </g>
  )
}

function Sun({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2
    const a1 = a - 0.11
    const a2 = a + 0.11
    const inner = r + 3
    const outer = r + (i % 2 ? 7 : 11)
    return `M${x + Math.cos(a1) * inner} ${y + Math.sin(a1) * inner} L${x + Math.cos(a) * outer} ${y + Math.sin(a) * outer} L${x + Math.cos(a2) * inner} ${y + Math.sin(a2) * inner}Z`
  })
  return (
    <g fill={INK}>
      <circle cx={x} cy={y} r={r} />
      <path d={rays.join(' ')} />
      <path d={`M${x - r / 2} ${y - 1} q${r / 2} -4 ${r} 0`} stroke={CUT} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </g>
  )
}

function Stars({ points }: { points: [number, number, number?][] }) {
  return (
    <g fill={INK}>
      {points.map(([x, y, s = 4]) => (
        <path key={`${x}-${y}`} d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3}Z`} />
      ))}
    </g>
  )
}

/** Parallel gouge marks cut into a solid ink area. */
function Gouges({ lines, width = 1.8 }: { lines: string[]; width?: number }) {
  return (
    <g stroke={CUT} strokeWidth={width} strokeLinecap="round" fill="none">
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  )
}

const PRINTS: Record<string, ReactNode> = {
  'guarda-chuva': (
    <>
      <path d="M22 44 L80 12 L138 44" stroke={INK} strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M58 34 q4 -10 14 -8 q6 -8 16 -2 q10 -2 12 8 q6 2 4 8 h-46 q-6 -2 0 -6z" fill={INK} />
      <Gouges lines={['M66 34 q6 -4 12 -2', 'M82 31 q6 -3 10 0']} width={1.4} />
      <g stroke={INK} strokeWidth="2.4" strokeLinecap="round">
        <path d="M66 48 l-3 7" /><path d="M78 48 l-3 7" /><path d="M90 48 l-3 7" /><path d="M72 58 l-3 6" /><path d="M85 58 l-3 6" />
      </g>
      <path d="M30 86 Q80 40 130 86 Q120 80 113 86 Q105 79 96 86 Q88 79 80 86 Q72 79 64 86 Q55 79 47 86 Q40 80 30 86Z" fill={INK} />
      <Gouges lines={['M80 52 L80 84', 'M80 52 Q62 64 56 84', 'M80 52 Q98 64 104 84', 'M80 52 Q50 62 40 82', 'M80 52 Q110 62 120 82']} />
      <path d="M80 86 V116 q0 9 -9 9 q-8 0 -8 -8" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
      <Ground y={128} />
    </>
  ),
  relogio: (
    <>
      <Sun x={132} y={24} r={8} />
      <circle cx="44" cy="30" r="12" fill={INK} />
      <circle cx="116" cy="30" r="12" fill={INK} />
      <Gouges lines={['M38 26 q5 -5 11 -2', 'M110 26 q5 -5 11 -2']} width={1.5} />
      <circle cx="80" cy="70" r="44" fill={INK} />
      <circle cx="80" cy="70" r="34" fill={CUT} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        return <line key={i} x1={80 + Math.cos(a) * 27} y1={70 + Math.sin(a) * 27} x2={80 + Math.cos(a) * 32} y2={70 + Math.sin(a) * 32} stroke={INK} strokeWidth={i % 3 === 0 ? 4 : 2} />
      })}
      <path d="M80 70 L80 46" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M80 70 L62 82" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <circle cx="80" cy="70" r="4" fill={INK} />
      <path d="M52 112 l-8 12 M108 112 l8 12" stroke={INK} strokeWidth="6" strokeLinecap="round" />
      <Ground y={128} />
    </>
  ),
  caneca: (
    <>
      <path d="M62 14 q-8 10 0 20 q8 10 0 20" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M80 8 q-8 10 0 20 q8 10 0 20" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M98 14 q-8 10 0 20 q8 10 0 20" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M44 58 H112 V108 q0 14 -14 14 H58 q-14 0 -14 -14Z" fill={INK} />
      <path d="M112 68 q24 0 24 18 q0 18 -24 18" stroke={INK} strokeWidth="9" fill="none" />
      <Gouges lines={['M52 70 V108', 'M60 66 V112', 'M100 70 q4 14 0 30', 'M70 84 h22', 'M70 92 h16']} />
      <circle cx="81" cy="80" r="7" fill="none" stroke={CUT} strokeWidth="2" />
      <path d="M81 76 v4 l3 2" stroke={CUT} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <Ground y={124} />
    </>
  ),
  gaveta: (
    <>
      <path d="M100 18 a14 14 0 1 0 12 22 a11 11 0 1 1 -12 -22z" fill={INK} />
      <Stars points={[[62, 20, 5], [42, 38, 3.5], [128, 52, 4], [82, 40, 3]]} />
      <path d="M28 70 H132 V124 H28Z" fill={INK} />
      <path d="M20 58 H122 L132 70 H28Z" fill={INK} />
      <path d="M38 62 H114 V80 H38Z" fill={CUT} stroke={INK} strokeWidth="4" />
      <path d="M56 70 q20 -14 40 0" stroke={INK} strokeWidth="3" fill="none" strokeDasharray="2 5" strokeLinecap="round" />
      <Gouges lines={['M36 92 H124', 'M36 108 H124', 'M78 98 v4', 'M78 114 v4', 'M34 86 l6 -4', 'M118 120 l6 -4']} />
      <path d="M36 124 v8 M124 124 v8" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  chave: (
    <>
      <path d="M96 14 H140 V122 H96Z" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="7 6" />
      <circle cx="104" cy="70" r="3" fill={INK} />
      <g transform="rotate(-28 70 76)">
        <circle cx="34" cy="76" r="22" fill={INK} />
        <circle cx="34" cy="76" r="9" fill={CUT} />
        <path d="M54 70 H128 V82 H54Z" fill={INK} />
        <path d="M104 82 V96 H112 V82 M118 82 V92 H126 V82" fill={INK} stroke={INK} strokeWidth="2" />
        <Gouges lines={['M20 64 q8 -8 18 -6', 'M62 76 H120', 'M22 90 q8 6 18 4']} />
      </g>
      <Ground y={130} />
    </>
  ),
  lampada: (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI + (i / 8) * Math.PI
        return <path key={i} d={`M${80 + Math.cos(a) * 50} ${62 + Math.sin(a) * 50} L${80 + Math.cos(a) * 64} ${62 + Math.sin(a) * 64}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />
      })}
      <path d="M80 22 a34 34 0 0 1 22 60 q-6 6 -6 16 H64 q0 -10 -6 -16 a34 34 0 0 1 22 -60z" fill={INK} />
      <path d="M70 92 q0 -18 10 -30 q10 12 10 30" stroke={CUT} strokeWidth="2.4" fill="none" />
      <Gouges lines={['M64 38 q-10 10 -8 24', 'M70 32 q-6 4 -8 8']} />
      <path d="M64 102 H96 M66 110 H94 M70 118 H90" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M74 126 H86" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </>
  ),
  mapa: (
    <>
      <path d="M16 30 L56 18 L104 30 L144 18 V112 L104 124 L56 112 L16 124Z" fill={INK} />
      <path d="M56 18 V112 M104 30 V124" stroke={CUT} strokeWidth="2.4" />
      <path d="M28 104 q14 -30 34 -18 t30 -22 t26 -26" stroke={CUT} strokeWidth="3" fill="none" strokeDasharray="5 6" strokeLinecap="round" />
      <path d="M116 30 l12 12 M128 30 l-12 12" stroke={CUT} strokeWidth="4" strokeLinecap="round" />
      <Gouges lines={['M24 46 q8 -4 16 0', 'M68 92 q8 4 18 0', 'M114 92 q10 -4 18 2', 'M70 46 h14']} width={1.6} />
      <path d="M26 82 l6 -10 l6 10z M36 86 l5 -8 l5 8z" fill={CUT} />
    </>
  ),
  regua: (
    <>
      <Sun x={30} y={26} r={9} />
      <g transform="rotate(-14 80 80)">
        <path d="M8 66 H152 V92 H8Z" fill={INK} />
        {Array.from({ length: 15 }, (_, i) => (
          <path key={i} d={`M${16 + i * 9.4} 66 v${i % 5 === 0 ? 14 : 8}`} stroke={CUT} strokeWidth="2" />
        ))}
      </g>
      <g transform="translate(96 26)">
        <path d="M0 34 q0 -24 22 -24 q18 0 18 18 q0 14 -14 14 q-10 0 -10 -9 q0 -7 7 -7" fill="none" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M-14 36 H40 q4 0 4 4 H-18 q0 -4 4 -4z" fill={INK} />
        <path d="M-14 36 q-8 -10 -4 -18 M-10 36 q-2 -12 4 -16" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      </g>
      <Ground y={126} />
    </>
  ),
  cadeira: (
    <>
      <path d="M48 16 H100 V74 H48Z" fill={INK} />
      <Gouges lines={['M56 22 V70', 'M66 22 V70', 'M82 22 V70', 'M92 22 V70']} />
      <path d="M40 74 H112 V86 H40Z" fill={INK} />
      <path d="M48 86 V126 M104 86 V126 M50 108 H102" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <g stroke={INK} strokeWidth="1.6" fill="none">
        <path d="M112 30 L148 18 M112 30 L150 40 M112 30 L140 60 M112 30 L124 66" />
        <path d="M120 27 q4 6 3 12 q-2 6 -8 8 M128 24 q6 10 4 20 q-4 10 -12 13 M138 21 q8 14 4 28 q-4 12 -14 16" />
      </g>
      <circle cx="132" cy="50" r="3.5" fill={INK} />
      <Ground y={128} />
    </>
  ),
  pote: (
    <>
      <path d="M50 22 H110 V34 H50Z" fill={INK} />
      <Gouges lines={['M56 28 H104']} width={1.4} />
      <path d="M56 34 H104 q16 6 16 24 V108 q0 16 -16 16 H56 q-16 0 -16 -16 V58 q0 -18 16 -24z" fill={INK} />
      <path d="M52 64 q20 -12 34 0 t30 0 M52 82 q14 -10 28 0 t34 -2 M54 100 q20 -10 32 0 t26 0" stroke={CUT} strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M48 52 q-2 18 0 36" stroke={CUT} strokeWidth="2" fill="none" />
      <path d="M126 40 q10 -6 20 0 M130 52 q8 -4 16 0 M14 46 q8 -6 18 0" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      <Ground y={130} />
    </>
  ),
  bule: (
    <>
      <path d="M86 6 q-6 8 0 16 q6 8 0 16" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="74" cy="40" r="6" fill={INK} />
      <path d="M50 52 q24 -14 48 0Z" fill={INK} />
      <path d="M40 66 q34 -18 68 0 q14 24 0 50 H40 q-14 -26 0 -50z" fill={INK} />
      <path d="M104 72 q24 -6 36 -26 q6 4 2 10 q-10 26 -34 36" fill={INK} />
      <path d="M36 74 q-20 6 -16 24 q4 14 20 12" stroke={INK} strokeWidth="7" fill="none" />
      <Gouges lines={['M48 74 q-6 18 2 36', 'M58 70 q-4 22 2 42', 'M68 86 q8 -6 16 0 q8 6 16 0', 'M70 98 q8 -6 16 0 q8 6 14 0']} />
      <Ground y={124} />
    </>
  ),
  borracha: (
    <>
      <path d="M22 18 H118 q10 0 10 10 V54 q0 10 -10 10 H64 l-14 14 V64 H32 q-10 0 -10 -10 V28 q0 -10 10 -10z" fill={INK} />
      <path d="M36 32 H86 M36 44 H70" stroke={CUT} strokeWidth="4" strokeLinecap="round" />
      <path d="M92 32 h8 M104 44 h4 M76 44 h6" stroke={CUT} strokeWidth="4" strokeLinecap="round" strokeDasharray="2 4" />
      <g transform="rotate(-18 96 98)">
        <path d="M52 84 H140 V112 H52Z" fill={INK} />
        <path d="M52 84 H86 V112 H52Z" fill={CUT} stroke={INK} strokeWidth="3" />
        <Gouges lines={['M94 92 H132', 'M94 102 H124']} />
      </g>
      <g fill={INK}>
        <circle cx="34" cy="108" r="3" /><circle cx="44" cy="116" r="2.4" /><circle cx="26" cy="118" r="2" /><circle cx="52" cy="124" r="2.6" />
      </g>
      <Ground y={130} />
    </>
  ),
  sino: (
    <>
      <path d="M74 10 h12 v10 h-12z" fill={INK} />
      <path d="M80 18 q-30 0 -32 40 q-2 30 -16 44 H128 q-14 -14 -16 -44 q-2 -40 -32 -40z" fill={INK} />
      <Gouges lines={['M62 40 q-6 20 -6 44', 'M70 32 q-4 10 -4 20', 'M40 96 H120']} />
      <circle cx="80" cy="112" r="9" fill={INK} />
      <path d="M22 50 q-8 14 0 28 M12 44 q-12 20 0 40 M138 50 q8 14 0 28 M148 44 q12 20 0 40" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
      <Ground y={128} />
    </>
  ),
  bussola: (
    <>
      <circle cx="68" cy="72" r="50" fill={INK} />
      <circle cx="68" cy="72" r="40" fill={CUT} />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        return <line key={i} x1={68 + Math.cos(a) * 34} y1={72 + Math.sin(a) * 34} x2={68 + Math.cos(a) * (i % 4 === 0 ? 26 : 30)} y2={72 + Math.sin(a) * (i % 4 === 0 ? 26 : 30)} stroke={INK} strokeWidth="2.6" />
      })}
      <path d="M68 72 L100 50 L74 78Z" fill={INK} />
      <path d="M68 72 L36 94 L62 66Z" fill="none" stroke={INK} strokeWidth="2.4" />
      <circle cx="68" cy="72" r="5" fill={INK} />
      <path d="M68 16 v-6 M60 10 h16" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <g transform="translate(118 22)">
        <path d="M0 0 H30 V60 H0Z" fill={INK} />
        <path d="M2 20 H28 M6 8 v6 M6 28 v10" stroke={CUT} strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <Ground y={130} />
    </>
  ),
  termometro: (
    <>
      <path d="M86 26 q2 -14 18 -14 q8 -10 22 -4 q16 0 16 14 q10 4 6 14 H84 q-8 -4 2 -10z" fill={INK} />
      <Gouges lines={['M96 26 q10 -6 20 -2', 'M118 18 q8 -2 14 4']} width={1.6} />
      <path d="M104 40 l-8 14 h10 l-8 16" stroke={INK} strokeWidth="4" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M128 42 l-4 10 M140 42 l-4 10 M116 44 l-3 8" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M44 14 a12 12 0 0 1 24 0 V86 a22 22 0 1 1 -24 0z" fill={INK} />
      <path d="M52 18 V92" stroke={CUT} strokeWidth="5" strokeLinecap="round" />
      <path d="M52 50 V92" stroke={INK} strokeWidth="5" />
      {[24, 34, 44, 54, 64, 74].map((y) => (
        <path key={y} d={`M68 ${y} h8`} stroke={INK} strokeWidth="3" />
      ))}
      <Ground y={128} />
    </>
  ),
  tesoura: (
    <>
      <path d="M86 14 H146 q8 0 8 8 V54 q0 8 -8 8 H122 l-10 12 V62 H86 q-8 0 -8 -8 V22 q0 -8 8 -8z" fill={INK} />
      <path d="M94 30 H136 M94 44 H120" stroke={CUT} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M118 6 l-10 72" stroke={CUT} strokeWidth="3" strokeDasharray="4 3" />
      <g transform="rotate(-30 64 86)">
        <path d="M60 82 L130 72 L132 78 L64 92Z" fill={INK} />
        <path d="M60 90 L128 104 L126 110 L58 98Z" fill={INK} />
        <circle cx="38" cy="78" r="15" fill="none" stroke={INK} strokeWidth="8" />
        <circle cx="38" cy="104" r="15" fill="none" stroke={INK} strokeWidth="8" />
        <circle cx="62" cy="90" r="4" fill={CUT} />
      </g>
      <Ground y={130} />
    </>
  ),
  escada: (
    <>
      <Stars points={[[30, 20, 6], [128, 14, 5], [146, 44, 3.5], [104, 30, 3], [20, 54, 3.5]]} />
      <path d="M56 128 L70 18 M104 128 L90 18" stroke={INK} strokeWidth="8" strokeLinecap="round" />
      {[110, 88, 66, 44, 26].map((y, i) => (
        <path key={y} d={`M${58 + (110 - y) * 0.13} ${y} H${102 - (110 - y) * 0.13}`} stroke={INK} strokeWidth={7 - i * 0.4} strokeLinecap="round" />
      ))}
      <Gouges lines={['M60 116 l6 -50', 'M98 116 l-6 -50']} width={1.4} />
      <Ground y={128} />
    </>
  ),
  peixe: (
    <>
      <circle cx="80" cy="66" r="52" fill="none" stroke={INK} strokeWidth="3" strokeDasharray="6 7" />
      <path d="M36 66 q24 -30 64 0 q-40 30 -64 0z" fill={INK} />
      <path d="M98 66 l26 -18 v36z" fill={INK} />
      <circle cx="50" cy="62" r="4" fill={CUT} />
      <Gouges lines={['M62 52 q6 14 0 28', 'M72 52 q6 14 0 28', 'M82 54 q5 12 0 24', 'M106 58 l10 -4 M106 74 l10 4']} />
      <g fill="none" stroke={INK} strokeWidth="2.4">
        <circle cx="30" cy="40" r="4" /><circle cx="24" cy="26" r="2.8" /><circle cx="34" cy="16" r="2" />
      </g>
      <Ground y={130} />
    </>
  ),
  saleiro: (
    <>
      <path d="M58 22 q22 -12 44 0 V34 H58Z" fill={INK} />
      <g fill={CUT}>
        <circle cx="70" cy="26" r="2" /><circle cx="80" cy="23" r="2" /><circle cx="90" cy="26" r="2" />
      </g>
      <path d="M58 34 H102 L110 118 q0 6 -6 6 H56 q-6 0 -6 -6z" fill={INK} />
      <Gouges lines={['M62 44 l-4 66', 'M70 44 l-2 70', 'M64 70 H100', 'M64 80 H102']} />
      <g fill={INK}>
        <rect x="118" y="20" width="4" height="4" transform="rotate(20 120 22)" />
        <rect x="128" y="34" width="4" height="4" transform="rotate(40 130 36)" />
        <rect x="114" y="44" width="3.4" height="3.4" />
        <rect x="134" y="52" width="4" height="4" transform="rotate(10 136 54)" />
      </g>
      <path d="M18 40 q6 -8 14 0 q6 8 14 0 M18 58 q6 -8 14 0 q6 8 14 0" stroke={INK} strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <Ground y={130} />
    </>
  ),
  vela: (
    <>
      <path d="M118 12 l-14 26 h14 l-12 26" stroke={INK} strokeWidth="5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M72 18 q14 18 6 32 q-4 8 -12 8 q-10 0 -10 -12 q0 -14 16 -28z" fill={INK} />
      <path d="M70 34 q4 8 0 16" stroke={CUT} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M68 58 v8" stroke={INK} strokeWidth="3" />
      <path d="M52 66 H86 V118 H52Z" fill={INK} />
      <path d="M52 66 q6 10 10 0 q4 14 10 0 q6 8 14 0" fill={CUT} stroke={INK} strokeWidth="2" />
      <Gouges lines={['M60 80 V112', 'M78 84 V110']} />
      <path d="M34 118 H104 q4 0 4 4 v4 H30 v-4 q0 -4 4 -4z" fill={INK} />
      <Ground y={130} />
    </>
  ),
}

export function InkFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <filter id="xilo" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="ruido" />
        <feDisplacementMap in="SourceGraphic" in2="ruido" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

export function Woodcut({ nome, titulo, className, style }: { nome: string; titulo: string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 160 140" role="img" aria-label={`Xilogravura: ${titulo}`} className={className} style={style}>
      <g filter="url(#xilo)">{PRINTS[nome] ?? PRINTS.mapa}</g>
    </svg>
  )
}
