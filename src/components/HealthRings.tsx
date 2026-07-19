import type { HealthToday } from '../api/sync'
import { RingProgress } from './RingProgress'
import { useCountUp } from '../hooks/useCountUp'

interface Props {
  data: HealthToday
  stepTarget: number
  sleepTarget: number
  accent?: string // rank colour — threaded subtly through the chrome
}

const STEP_COLOR = 'var(--accent)'
const SLEEP_COLOR = '#5A9EFF' // azure — complements lime, off the green family
const clamp = (n: number) => Math.max(0, Math.min(1, n))

// Recovery = weighted blend of sleep vs goal, HRV, and resting HR (lower better).
function recovery(data: HealthToday, sleepTarget: number) {
  const parts: { w: number; v: number }[] = []
  if (data.sleepHours != null) parts.push({ w: 0.4, v: clamp(data.sleepHours / sleepTarget) })
  if (data.hrv != null) parts.push({ w: 0.4, v: clamp(data.hrv / 70) })
  if (data.restingHeartRate != null) parts.push({ w: 0.2, v: 1 - clamp((data.restingHeartRate - 45) / 35) })
  if (!parts.length) return null
  const wsum = parts.reduce((s, p) => s + p.w, 0)
  return Math.round((parts.reduce((s, p) => s + p.v * p.w, 0) / wsum) * 100)
}

function status(score: number): { word: string; color: string } {
  if (score >= 85) return { word: 'PRIMED', color: '#C8F135' }   // lime
  if (score >= 70) return { word: 'READY', color: '#4FC97A' }    // green
  if (score >= 50) return { word: 'STEADY', color: '#F2C94C' }   // amber
  if (score >= 30) return { word: 'STRAINED', color: '#FF8A3D' } // orange
  return { word: 'DEPLETED', color: '#FF5A5F' }                  // red
}

export const HealthRings = ({ data, stepTarget, sleepTarget, accent = 'var(--accent)' }: Props) => {
  const steps = data.steps ?? 0
  const sleep = data.sleepHours ?? 0
  const stepsUp = Math.round(useCountUp(steps, 900))
  const sleepUp = useCountUp(sleep, 900)

  const score = recovery(data, sleepTarget)
  const scoreUp = Math.round(useCountUp(score ?? 0, 1000))
  const st = status(score ?? 0)

  const tick = (pos: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
    const b: React.CSSProperties = { position: 'absolute', width: 12, height: 12, borderColor: accent, borderStyle: 'solid', borderWidth: 0, opacity: 0.55 }
    const m = 10
    if (pos === 'tl') return { ...b, top: m, left: m, borderTopWidth: 1, borderLeftWidth: 1 }
    if (pos === 'tr') return { ...b, top: m, right: m, borderTopWidth: 1, borderRightWidth: 1 }
    if (pos === 'bl') return { ...b, bottom: m, left: m, borderBottomWidth: 1, borderLeftWidth: 1 }
    return { ...b, bottom: m, right: m, borderBottomWidth: 1, borderRightWidth: 1 }
  }

  return (
    <div className="card" style={{ padding: '28px 20px', position: 'relative', border: `1px solid ${accent}2e` }}>
      {(['tl', 'tr', 'bl', 'br'] as const).map(p => <span key={p} style={tick(p)} />)}
      {/* eyebrow */}
      <div className="row" style={{ justifyContent: 'center', marginBottom: 6 }}>
        <span className="t-micro" style={{ color: accent, opacity: 0.7, letterSpacing: '0.28em', textTransform: 'uppercase' }}>◆ Today ◆</span>
      </div>
      {/* Rings — first, thick */}
      <div className="row" style={{ justifyContent: 'space-around', padding: '8px 0 4px' }}>
        <div className="stack gap-8" style={{ alignItems: 'center' }}>
          <RingProgress progress={steps / stepTarget} size={134} strokeWidth={26} color={STEP_COLOR} loopArrow animate>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 30, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.9 }}>{stepsUp.toLocaleString()}</span>
            <span className="t-micro" style={{ color: 'var(--text-low)' }}>/ {(stepTarget / 1000).toFixed(0)}k</span>
          </RingProgress>
          <span className="t-micro" style={{ color: STEP_COLOR, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Steps</span>
        </div>
        <div className="stack gap-8" style={{ alignItems: 'center' }}>
          <RingProgress progress={sleep / sleepTarget} size={134} strokeWidth={26} color={SLEEP_COLOR} loopArrow animate>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 30, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.9 }}>
              {sleepUp.toFixed(1)}<span style={{ fontSize: 15 }}>h</span>
            </span>
            <span className="t-micro" style={{ color: 'var(--text-low)' }}>/ {sleepTarget}h</span>
          </RingProgress>
          <span className="t-micro" style={{ color: SLEEP_COLOR, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Sleep</span>
        </div>
      </div>

      {/* Recovery score */}
      {score != null && (
        <>
          <div style={{ height: 1, background: 'var(--line)', margin: '18px 0 14px' }} />
          <div className="between" style={{ marginBottom: 8 }}>
            <span className="t-eyebrow">Recovery</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11, letterSpacing: '0.16em', color: st.color }}>{st.word}</span>
          </div>
          <div className="row" style={{ alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 48, fontWeight: 600, color: st.color, lineHeight: 0.8 }}>{scoreUp}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--text-low)' }}>/ 100</span>
          </div>
          <div style={{ height: 6, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden', marginTop: 8 }}>
            <div style={{ height: '100%', width: `${scoreUp}%`, background: st.color, borderRadius: 'var(--r-pill)', boxShadow: `0 0 10px ${st.color}`, transition: 'width 900ms var(--ease)' }} />
          </div>
        </>
      )}
    </div>
  )
}
