import styles from './BodySVG.module.css'
import type { Measurement } from '../api/measurements'

interface Props {
  latest?: Measurement | null
  heightCm?: number
}

const norm = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + (Math.min(Math.max(v, inMin), inMax) - inMin) / (inMax - inMin) * (outMax - outMin)

// Morphing torso closed path. ViewBox 0 0 200 480, center X = 100.
const buildTorso = (cO: number, wO: number, hO: number): string => {
  const f = (n: number) => n.toFixed(1)
  const rSh = 142, lSh = 58
  const rC = 138 + cO, lC = 62 - cO
  const rW = 125 + wO, lW = 75 - wO
  const rH = 136 + hO, lH = 64 - hO
  const rCr = 110, lCr = 90
  const sY = 85, cY = 122, wY = 174, hY = 218, crY = 256
  const cp = (y0: number, y1: number, t = 0.42) => y0 + (y1 - y0) * t
  const cp2 = (y0: number, y1: number, t = 0.58) => y0 + (y1 - y0) * t
  return [
    `M 92 82`,
    `C ${f(78)} 83 ${f(lSh + 3)} ${f(sY)} ${f(lSh)} ${f(sY)}`,
    `C ${f(lSh - 6)} ${f(cp(sY, cY))} ${f(lC)} ${f(cp2(sY, cY))} ${f(lC)} ${f(cY)}`,
    `C ${f(lC)} ${f(cp(cY, wY))} ${f(lW)} ${f(cp2(cY, wY))} ${f(lW)} ${f(wY)}`,
    `C ${f(lW)} ${f(cp(wY, hY))} ${f(lH)} ${f(cp2(wY, hY))} ${f(lH)} ${f(hY)}`,
    `C ${f(lH)} ${f(cp(hY, crY))} ${f(lCr)} ${f(cp2(hY, crY))} ${f(lCr)} ${f(crY)}`,
    `L ${f(rCr)} ${f(crY)}`,
    `C ${f(rCr)} ${f(cp2(hY, crY))} ${f(rH)} ${f(cp(hY, crY))} ${f(rH)} ${f(hY)}`,
    `C ${f(rH)} ${f(cp2(wY, hY))} ${f(rW)} ${f(cp(wY, hY))} ${f(rW)} ${f(wY)}`,
    `C ${f(rW)} ${f(cp2(cY, wY))} ${f(rC)} ${f(cp(cY, wY))} ${f(rC)} ${f(cY)}`,
    `C ${f(rC)} ${f(cp2(sY, cY))} ${f(rSh + 6)} ${f(cp(sY, cY))} ${f(rSh)} ${f(sY)}`,
    `C ${f(rSh - 3)} ${f(sY)} 122 82 108 82`,
    `Z`,
  ].join(' ')
}

const BODY = 'var(--bg-2)'
const STROKE = 'var(--line)'
const ACCENT = 'var(--accent)'
const MUTED = 'var(--line)'
const TEXT_MUTED = 'var(--text-low)'
const TEXT_LIT = 'var(--accent)'
const FONT = 'Inter, sans-serif'

interface AnnotationProps {
  x1: number; y1: number; x2: number; y2: number
  label: string; value?: number; anchor: 'start' | 'end'
}

const Annotation = ({ x1, y1, x2, y2, label, value, anchor }: AnnotationProps) => {
  const hasValue = value != null
  const textX = anchor === 'end' ? x2 - 3 : x2 + 3
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hasValue ? ACCENT : MUTED} strokeWidth="0.8" />
      <circle cx={x1} cy={y1} r="2" fill={hasValue ? ACCENT : MUTED} />
      <text x={textX} y={y2 - 5} fontSize="7" fill={hasValue ? TEXT_LIT : TEXT_MUTED} textAnchor={anchor} fontFamily={FONT} fontWeight="600">{label}</text>
      <text x={textX} y={y2 + 5} fontSize="8.5" fill={hasValue ? TEXT_LIT : TEXT_MUTED} textAnchor={anchor} fontFamily={FONT} fontWeight="700">
        {hasValue ? `${value}cm` : '—'}
      </text>
    </g>
  )
}

export const BodySVG = ({ latest }: Props) => {
  const m = latest

  // torso morph
  const wO = m?.waist ? norm(m.waist, 60, 110, -15, 25) : 0
  const hO = m?.hip ? norm(m.hip, 70, 120, -10, 20) : 0
  const cO = m?.chest ? norm(m.chest, 75, 130, -10, 20) : 0
  const torsoPath = buildTorso(cO, wO, hO)

  // limb widths scale to their own measurement (left/right independent)
  const uaL = m?.leftArm ? norm(m.leftArm, 24, 46, 12, 24) : 16
  const uaR = m?.rightArm ? norm(m.rightArm, 24, 46, 12, 24) : 16
  const faW = m?.forearm ? norm(m.forearm, 20, 36, 9, 17) : 13
  const thW = m?.thigh ? norm(m.thigh, 44, 78, 18, 32) : 24
  const shW = m?.calf ? norm(m.calf, 28, 52, 13, 23) : 19
  const neckW = m?.neck ? norm(m.neck, 32, 46, 11, 20) : 16

  // centers (match original layout)
  const uaLc = 45, uaRc = 155, faLc = 37, faRc = 163
  const thLc = 80, thRc = 120

  const lChestX = 62 - cO, lWaistX = 75 - wO, lHipX = 64 - hO

  return (
    <svg viewBox="0 0 200 480" className={styles.svg} aria-label="Body illustration">
      {/* Head */}
      <ellipse cx="100" cy="34" rx="20" ry="25" fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* Neck — width scales with neck measurement */}
      <path d={`M ${100 - neckW / 2} 57 L ${100 + neckW / 2} 57 L ${100 + neckW / 2 - 2} 82 L ${100 - neckW / 2 + 2} 82 Z`} fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* Torso — morphing */}
      <path className={styles.torso} d={torsoPath} fill={BODY} stroke={STROKE} strokeWidth="1" strokeLinejoin="round" />

      {/* Left arm */}
      <rect className={styles.limb} x={uaLc - uaL / 2} y="84" width={uaL} height="72" rx={uaL / 2} fill={BODY} stroke={STROKE} strokeWidth="1" transform={`rotate(-10 ${uaLc} 88)`} />
      <rect className={styles.limb} x={faLc - faW / 2} y="158" width={faW} height="64" rx={faW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" transform={`rotate(-7 ${faLc} 158)`} />
      {/* Right arm */}
      <rect className={styles.limb} x={uaRc - uaR / 2} y="84" width={uaR} height="72" rx={uaR / 2} fill={BODY} stroke={STROKE} strokeWidth="1" transform={`rotate(10 ${uaRc} 88)`} />
      <rect className={styles.limb} x={faRc - faW / 2} y="158" width={faW} height="64" rx={faW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" transform={`rotate(7 ${faRc} 158)`} />

      {/* Left leg */}
      <rect className={styles.limb} x={thLc - thW / 2} y="258" width={thW} height="90" rx={thW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" />
      <rect className={styles.limb} x={thLc - shW / 2} y="350" width={shW} height="88" rx={shW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" />
      {/* Right leg */}
      <rect className={styles.limb} x={thRc - thW / 2} y="258" width={thW} height="90" rx={thW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" />
      <rect className={styles.limb} x={thRc - shW / 2} y="350" width={shW} height="88" rx={shW / 2} fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* Left annotations */}
      <Annotation x1={100 - neckW / 2} y1={68} x2={28} y2={68} label="Neck" value={m?.neck} anchor="end" />
      <Annotation x1={lChestX} y1={122} x2={28} y2={122} label="Chest" value={m?.chest} anchor="end" />
      <Annotation x1={lWaistX} y1={174} x2={28} y2={174} label="Waist" value={m?.waist} anchor="end" />
      <Annotation x1={lHipX} y1={218} x2={28} y2={218} label="Hip" value={m?.hip} anchor="end" />

      {/* Right annotations — endpoints track the scaled limbs */}
      <Annotation x1={uaRc + uaR / 2} y1={116} x2={178} y2={116} label="Arm" value={m?.rightArm} anchor="start" />
      <Annotation x1={faRc + faW / 2} y1={192} x2={178} y2={192} label="Forearm" value={m?.forearm} anchor="start" />
      <Annotation x1={thRc + thW / 2} y1={296} x2={178} y2={296} label="Thigh" value={m?.thigh} anchor="start" />
      <Annotation x1={thRc + shW / 2} y1={392} x2={178} y2={392} label="Calf" value={m?.calf} anchor="start" />
    </svg>
  )
}
