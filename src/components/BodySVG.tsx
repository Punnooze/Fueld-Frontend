import styles from './BodySVG.module.css'
import type { Measurement } from '../api/measurements'

interface Props {
  latest?: Measurement | null
  heightCm?: number
}

const norm = (v: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  outMin + (Math.min(Math.max(v, inMin), inMax) - inMin) / (inMax - inMin) * (outMax - outMin)

// Build the morphing torso closed path.
// ViewBox: 0 0 200 480. Center X = 100.
// cO = chest offset (+= wider), wO = waist offset, hO = hip offset
const buildTorso = (cO: number, wO: number, hO: number): string => {
  const f = (n: number) => n.toFixed(1)

  // Key X half-widths from center (100) at anatomical levels
  const rSh = 142,         lSh = 58         // shoulders y=85
  const rC = 138 + cO,    lC = 62 - cO      // chest y=122
  const rW = 125 + wO,    lW = 75 - wO      // waist y=174
  const rH = 136 + hO,    lH = 64 - hO      // hip y=218
  const rCr = 110,         lCr = 90          // crotch y=256

  const sY = 85, cY = 122, wY = 174, hY = 218, crY = 256

  // Each segment uses cubic bezier with control points placed at
  // 40%/60% of the Y distance — creates natural S-curves
  const cp = (y0: number, y1: number, t = 0.42) => y0 + (y1 - y0) * t
  const cp2 = (y0: number, y1: number, t = 0.58) => y0 + (y1 - y0) * t

  return [
    `M 92 82`,
    // Left neck → left shoulder
    `C ${f(78)} 83 ${f(lSh+3)} ${f(sY)} ${f(lSh)} ${f(sY)}`,
    // Left shoulder → left chest
    `C ${f(lSh-6)} ${f(cp(sY, cY))} ${f(lC)} ${f(cp2(sY, cY))} ${f(lC)} ${f(cY)}`,
    // Left chest → left waist
    `C ${f(lC)} ${f(cp(cY, wY))} ${f(lW)} ${f(cp2(cY, wY))} ${f(lW)} ${f(wY)}`,
    // Left waist → left hip
    `C ${f(lW)} ${f(cp(wY, hY))} ${f(lH)} ${f(cp2(wY, hY))} ${f(lH)} ${f(hY)}`,
    // Left hip → left crotch
    `C ${f(lH)} ${f(cp(hY, crY))} ${f(lCr)} ${f(cp2(hY, crY))} ${f(lCr)} ${f(crY)}`,
    // Across crotch
    `L ${f(rCr)} ${f(crY)}`,
    // Right crotch → right hip
    `C ${f(rCr)} ${f(cp2(hY, crY))} ${f(rH)} ${f(cp(hY, crY))} ${f(rH)} ${f(hY)}`,
    // Right hip → right waist
    `C ${f(rH)} ${f(cp2(wY, hY))} ${f(rW)} ${f(cp(wY, hY))} ${f(rW)} ${f(wY)}`,
    // Right waist → right chest
    `C ${f(rW)} ${f(cp2(cY, wY))} ${f(rC)} ${f(cp(cY, wY))} ${f(rC)} ${f(cY)}`,
    // Right chest → right shoulder
    `C ${f(rC)} ${f(cp2(sY, cY))} ${f(rSh+6)} ${f(cp(sY, cY))} ${f(rSh)} ${f(sY)}`,
    // Right shoulder → right neck
    `C ${f(rSh-3)} ${f(sY)} 122 82 108 82`,
    `Z`,
  ].join(' ')
}

const BODY = '#242424'
const STROKE = '#333'
const ACCENT = '#c8f135'
const MUTED = '#3a3a3a'
const TEXT_MUTED = '#555'
const TEXT_LIT = '#c8f135'

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
      <text x={textX} y={y2 - 5} fontSize="7" fill={hasValue ? TEXT_LIT : TEXT_MUTED} textAnchor={anchor} fontFamily="DM Sans, sans-serif" fontWeight="600">
        {label}
      </text>
      <text x={textX} y={y2 + 5} fontSize="8.5" fill={hasValue ? TEXT_LIT : TEXT_MUTED} textAnchor={anchor} fontFamily="DM Sans, sans-serif" fontWeight="700">
        {hasValue ? `${value}cm` : '—'}
      </text>
    </g>
  )
}

export const BodySVG = ({ latest }: Props) => {
  const waist = latest?.waist
  const hip = latest?.hip
  const chest = latest?.chest

  const wO = waist ? norm(waist, 60, 110, -15, 25) : 0
  const hO = hip   ? norm(hip,   70, 120, -10, 20) : 0
  const cO = chest ? norm(chest, 75, 130, -10, 20) : 0

  const torsoPath = buildTorso(cO, wO, hO)

  // Dynamic body edge X values for annotation line endpoints
  const lChestX = 62 - cO
  const lWaistX = 75 - wO
  const lHipX   = 64 - hO

  // Right arm outer edge (static rect x=146+16=162)
  // Right thigh outer (static rect x=109+22=131)

  return (
    <svg
      viewBox="0 0 200 480"
      className={styles.svg}
      aria-label="Body illustration"
    >
      {/* Head */}
      <ellipse cx="100" cy="34" rx="20" ry="25" fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* Neck */}
      <path d="M 92 57 L 108 57 L 106 82 L 94 82 Z" fill={BODY} />

      {/* Torso — morphing */}
      <path
        className={styles.torso}
        d={torsoPath}
        fill={BODY}
        stroke={STROKE}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Left upper arm */}
      <rect x="37" y="84" width="16" height="72" rx="8" fill={BODY} stroke={STROKE} strokeWidth="1"
            transform="rotate(-10 45 84)" />
      {/* Left forearm */}
      <rect x="30" y="158" width="14" height="64" rx="7" fill={BODY} stroke={STROKE} strokeWidth="1"
            transform="rotate(-7 37 158)" />

      {/* Right upper arm */}
      <rect x="147" y="84" width="16" height="72" rx="8" fill={BODY} stroke={STROKE} strokeWidth="1"
            transform="rotate(10 155 84)" />
      {/* Right forearm */}
      <rect x="156" y="158" width="14" height="64" rx="7" fill={BODY} stroke={STROKE} strokeWidth="1"
            transform="rotate(7 163 158)" />

      {/* Left thigh */}
      <rect x="68" y="258" width="24" height="90" rx="11" fill={BODY} stroke={STROKE} strokeWidth="1" />
      {/* Left shin */}
      <rect x="70" y="350" width="20" height="88" rx="9" fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* Right thigh */}
      <rect x="108" y="258" width="24" height="90" rx="11" fill={BODY} stroke={STROKE} strokeWidth="1" />
      {/* Right shin */}
      <rect x="110" y="350" width="20" height="88" rx="9" fill={BODY} stroke={STROKE} strokeWidth="1" />

      {/* ── Left side annotations ── */}
      <Annotation x1={92} y1={68} x2={28} y2={68} label="Neck" value={latest?.neck} anchor="end" />
      <Annotation x1={lChestX} y1={122} x2={28} y2={122} label="Chest" value={latest?.chest} anchor="end" />
      <Annotation x1={lWaistX} y1={174} x2={28} y2={174} label="Waist" value={latest?.waist} anchor="end" />
      <Annotation x1={lHipX}   y1={218} x2={28} y2={218} label="Hip" value={latest?.hip} anchor="end" />

      {/* ── Right side annotations ── */}
      <Annotation x1={162} y1={116} x2={172} y2={116} label="Arm" value={latest?.rightArm} anchor="start" />
      <Annotation x1={166} y1={192} x2={172} y2={192} label="Forearm" value={latest?.forearm} anchor="start" />
      <Annotation x1={132} y1={296} x2={172} y2={296} label="Thigh" value={latest?.thigh} anchor="start" />
      <Annotation x1={130} y1={392} x2={172} y2={392} label="Calf" value={latest?.calf} anchor="start" />
    </svg>
  )
}
