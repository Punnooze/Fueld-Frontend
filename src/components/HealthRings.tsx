import type { HealthToday } from '../api/sync'
import { RingProgress } from './RingProgress'
import { useCountUp } from '../hooks/useCountUp'

interface Props {
  data: HealthToday
  stepTarget: number
  sleepTarget: number
  accent?: string
}

const clamp = (n: number) => Math.max(0, Math.min(1, n))

function recovery(data: HealthToday, sleepTarget: number) {
  const parts: { w: number; v: number }[] = []
  if (data.sleepHours != null) parts.push({ w: 0.4, v: clamp(data.sleepHours / sleepTarget) })
  if (data.hrv != null) parts.push({ w: 0.4, v: clamp(data.hrv / 70) })
  if (data.restingHeartRate != null) parts.push({ w: 0.2, v: 1 - clamp((data.restingHeartRate - 45) / 35) })
  if (!parts.length) return null
  const wsum = parts.reduce((s, p) => s + p.w, 0)
  return Math.round((parts.reduce((s, p) => s + p.v * p.w, 0) / wsum) * 100)
}

const word = (s: number) =>
  s >= 85 ? 'PRIMED' : s >= 70 ? 'READY' : s >= 50 ? 'STEADY' : s >= 30 ? 'STRAINED' : 'DEPLETED'

export const HealthRings = ({ data, stepTarget, sleepTarget, accent = 'var(--accent)' }: Props) => {
  const steps = data.steps ?? 0
  const sleep = data.sleepHours ?? 0
  const stepsUp = Math.round(useCountUp(steps, 900))
  const sleepUp = useCountUp(sleep, 900)
  const score = recovery(data, sleepTarget)
  const scoreUp = Math.round(useCountUp(score ?? 0, 1000))

  return (
    <div className="card" style={{ padding: '28px 18px', border: `1px solid ${accent}2e` }}>
      <div className="row" style={{ gap: 14 }}>
        {/* recovery score — hero of the card */}
        {score != null && (
          <div className="stack gap-2" style={{ alignItems: 'center', minWidth: 92 }}>
            <span style={{ fontFamily: 'var(--font-mega)', fontSize: 52, fontWeight: 600, color: accent, lineHeight: 0.8 }}>{scoreUp}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 10, letterSpacing: '0.14em', color: accent }}>{word(score)}</span>
            <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.1em' }}>RECOVERY</span>
          </div>
        )}
        {/* rings */}
        <div className="row" style={{ flex: 1, justifyContent: 'space-around' }}>
          <div className="stack gap-6" style={{ alignItems: 'center' }}>
            <RingProgress progress={steps / stepTarget} size={92} strokeWidth={16} color={accent} loopArrow animate>
              <span style={{ fontFamily: 'var(--font-mega)', fontSize: 22, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.9 }}>{(stepsUp / 1000).toFixed(1)}k</span>
            </RingProgress>
            <span className="t-micro" style={{ color: 'var(--text-mid)', letterSpacing: '0.12em' }}>STEPS</span>
          </div>
          <div className="stack gap-6" style={{ alignItems: 'center' }}>
            <RingProgress progress={sleep / sleepTarget} size={92} strokeWidth={16} color={accent} loopArrow animate>
              <span style={{ fontFamily: 'var(--font-mega)', fontSize: 22, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.9 }}>{sleepUp.toFixed(1)}<span style={{ fontSize: 12 }}>h</span></span>
            </RingProgress>
            <span className="t-micro" style={{ color: 'var(--text-mid)', letterSpacing: '0.12em' }}>SLEEP</span>
          </div>
        </div>
      </div>
    </div>
  )
}
