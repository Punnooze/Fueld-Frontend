import { useState } from 'react'
import { useWorkoutsRange } from '../hooks/useWorkouts'
import { BottomSheet } from './BottomSheet'
import { useHealthToday } from '../hooks/useHealthToday'
import { useSettings } from '../hooks/useSettings'
import { Eyebrow } from './ui/Eyebrow'
import { DumbbellIcon, FlameIcon, HeartIcon, FootprintIcon, ChevronRightIcon, BikeIcon, SportIcon, RunIcon } from '../assets/icons'
import { today, fmtClock } from '../utils/dates'
import type { CardioSession } from '../api/sync'
import styles from './TodayTraining.module.css'

const cardioLabel = (s: CardioSession) =>
  s.name || (s.type ? s.type.charAt(0) + s.type.slice(1).toLowerCase() : 'Cardio')

const cardioIcon = (type = '') => {
  const t = type.toUpperCase()
  if (/BIK|CYCL|SPIN/.test(t)) return BikeIcon
  if (/SPORT|BALL|SOCCER|TENNIS|BASKET/.test(t)) return SportIcon
  if (/RUN|JOG/.test(t)) return RunIcon
  if (/WALK|HIK/.test(t)) return FootprintIcon
  return HeartIcon
}

const Time = ({ iso }: { iso?: string | null }) => {
  const t = fmtClock(iso)
  if (!t) return null
  return (
    <span className="t-micro" style={{ marginLeft: 'auto', color: 'var(--text-low)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>{t}</span>
  )
}

const Metric = ({ value, unit, label }: { value: string | number | null | undefined; unit?: string; label: string }) => (
  <div className="stack gap-2" style={{ alignItems: 'center', flex: 1 }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-hi)' }}>
      {value ?? '—'}{value != null && unit ? <span style={{ fontSize: 11, color: 'var(--text-low)' }}>{unit}</span> : ''}
    </span>
    <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</span>
  </div>
)

// ponytail: TEMP preview a date (e.g. '2026-07-19'); null = real today. REMOVE.
const PREVIEW_DATE: string | null = null

function useToday() {
  const t = PREVIEW_DATE ?? today()
  const { data: settings } = useSettings()
  const { data: workouts = [] } = useWorkoutsRange(t, t)
  const { data: health } = useHealthToday(!!settings?.googleHealthConnected, PREVIEW_DATE ?? undefined)
  return { workouts, health }
}

// Full section for the GYM tab
export const TodayTraining = () => {
  const { workouts, health } = useToday()
  const sessions = health?.cardioSessions ?? []
  // fallback to the old merged block if backend hasn't sent per-session data yet
  const cardioFallback = !sessions.length && health?.cardioMinutes ? health : null

  return (
    <section>
      <Eyebrow>Today's Training</Eyebrow>
      {workouts.length === 0 && !sessions.length && !cardioFallback ? (
        <div className="card" style={{ padding: 18, textAlign: 'center' }}>
          <p className="t-meta" style={{ color: 'var(--text-mid)' }}>Rest day — nothing logged yet.</p>
        </div>
      ) : (
        <div className="stack gap-8">
          {workouts.map(w => (
            <div key={w.id} className={styles.card}>
              <div className="row gap-8" style={{ marginBottom: 12 }}>
                <div className={styles.icon}><DumbbellIcon width={18} height={18} /></div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{w.type}</span>
                <Time iso={w.startedAt} />
              </div>
              <div className="row">
                <Metric value={w.totalVolume > 0 ? w.totalVolume.toLocaleString() : null} unit="kg" label="Volume" />
                <Metric value={w.duration ?? null} unit="min" label="Duration" />
                {w.prs.length > 0 && <Metric value={w.prs.length} label="PRs" />}
              </div>
            </div>
          ))}
          {sessions.map((s, i) => {
            const Icon = cardioIcon(s.type)
            return (
              <div key={s.startTime ?? i} className={styles.card} style={{ borderColor: '#5A9EFF44' }}>
                <div className="row gap-8" style={{ marginBottom: 12 }}>
                  <div className={styles.icon} style={{ color: '#5A9EFF' }}><Icon width={18} height={18} /></div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>{cardioLabel(s)}</span>
                  <Time iso={s.startTime} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', rowGap: 12 }}>
                  {[
                    { v: s.durationMin, u: 'min', l: 'Duration' },
                    { v: s.activeZoneMinutes, u: 'min', l: 'Zone Min' },
                    { v: s.calories, u: 'kcal', l: 'Calories' },
                    { v: s.distanceKm, u: 'km', l: 'Distance' },
                    { v: s.avgHr, u: 'bpm', l: 'Avg HR' },
                  ].filter(m => m.v != null).map(m => (
                    <Metric key={m.l} value={m.v} unit={m.u} label={m.l} />
                  ))}
                </div>
              </div>
            )
          })}
          {cardioFallback && (
            <div className={styles.card} style={{ borderColor: '#5A9EFF44' }}>
              <div className="row gap-8" style={{ marginBottom: 12 }}>
                <div className={styles.icon} style={{ color: '#5A9EFF' }}><FlameIcon width={18} height={18} /></div>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-hi)' }}>Cardio</span>
              </div>
              <div className="row">
                <Metric value={cardioFallback.cardioMinutes ?? null} unit="min" label="Duration" />
                <Metric value={cardioFallback.activeZoneMinutes ?? null} label="Active Zone" />
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// HOME → one compact row per activity; tap opens a full-detail bottom sheet
type MiniRow = { key: string; Icon: typeof HeartIcon; name: string; sub: string; detail: React.ReactNode }

// full-bleed hero: bold color-block — solid tint fill, icon in a frosted chip
const Hero = ({ Icon, name, kicker, time, tint, ink }: { Icon: typeof HeartIcon; name: string; kicker?: string; time?: string | null; tint: string; ink: string }) => (
  <div style={{
    margin: '-4px -20px 4px', padding: '22px 20px', minHeight: 190, position: 'relative', overflow: 'hidden',
    display: 'flex', alignItems: 'center', gap: 16, background: tint,
  }}>
    {/* tone-on-tone ghost icon for depth */}
    <Icon width={200} height={200} style={{ position: 'absolute', right: -30, bottom: -40, color: ink, opacity: 0.08 }} />
    <div style={{
      flexShrink: 0, width: 66, height: 66, borderRadius: 20, display: 'grid', placeItems: 'center',
      background: `color-mix(in srgb, ${ink} 12%, transparent)`, color: ink,
      boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${ink} 18%, transparent)`,
    }}>
      <Icon width={34} height={34} />
    </div>
    <div className="stack" style={{ gap: 3, minWidth: 0 }}>
      {kicker && <span className="t-micro" style={{ color: ink, opacity: 0.7, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{kicker}</span>}
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: ink, lineHeight: 1, letterSpacing: '-0.01em' }}>{name}</span>
      {time && <span className="t-micro" style={{ color: ink, opacity: 0.7, marginTop: 2, fontFamily: 'var(--font-mono)' }}>{time}</span>}
    </div>
  </div>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="between" style={{ padding: '10px 0', borderTop: '1px solid var(--line)' }}>
    <span className="t-micro" style={{ color: 'var(--text-low)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{value}</span>
  </div>
)

const workoutDetail = (w: { type: string; totalVolume: number; duration?: number; intensity: string; prs: string[]; exercises: string[]; note?: string; startedAt?: string }) => (
  <div className="stack gap-16">
    <Hero Icon={DumbbellIcon} name={w.type} kicker="Strength" time={fmtClock(w.startedAt)} tint="var(--accent)" ink="var(--accent-ink)" />
    <div className="row">
      <Metric value={w.totalVolume > 0 ? w.totalVolume.toLocaleString() : null} unit="kg" label="Volume" />
      <Metric value={w.duration ?? null} unit="min" label="Duration" />
      {w.prs.length > 0 && <Metric value={w.prs.length} label="PRs" />}
    </div>
    <div className="stack">
      <DetailRow label="Intensity" value={w.intensity} />
      <DetailRow label="Exercises" value={String(w.exercises.length)} />
    </div>
    {w.exercises.length > 0 && (
      <div className="stack gap-8">
        {w.exercises.map((ex, i) => (
          <div key={i} className="row gap-8" style={{ fontSize: 14, color: 'var(--text-mid)' }}>
            <div className={styles.icon} style={{ width: 26, height: 26 }}><DumbbellIcon width={14} height={14} /></div>
            <span>{ex}</span>
          </div>
        ))}
      </div>
    )}
    {w.note && <p className="t-meta" style={{ color: 'var(--text-mid)' }}>{w.note}</p>}
  </div>
)

const cardioDetail = (s: CardioSession) => {
  const Icon = cardioIcon(s.type)
  const typeLabel = s.type ? s.type.charAt(0) + s.type.slice(1).toLowerCase() : 'Cardio'
  return (
    <div className="stack gap-16">
      <Hero Icon={Icon} name={cardioLabel(s)} kicker="Cardio" time={fmtClock(s.startTime)} tint="#5A9EFF" ink="#0A0F1E" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', rowGap: 16 }}>
        {[
          { v: s.durationMin, u: 'min', l: 'Duration' },
          { v: s.activeZoneMinutes, u: 'min', l: 'Zone Min' },
          { v: s.calories, u: 'kcal', l: 'Calories' },
          { v: s.distanceKm, u: 'km', l: 'Distance' },
          { v: s.avgHr, u: 'bpm', l: 'Avg HR' },
        ].filter(m => m.v != null).map(m => <Metric key={m.l} value={m.v} unit={m.u} label={m.l} />)}
      </div>
      <div className="stack">
        <DetailRow label="Activity" value={typeLabel} />
        {s.distanceKm != null && s.durationMin ? <DetailRow label="Avg Pace" value={`${(s.durationMin / s.distanceKm).toFixed(1)} min/km`} /> : null}
      </div>
    </div>
  )
}

export const TodayTrainingCard = () => {
  const { workouts, health } = useToday()
  const sessions = health?.cardioSessions ?? []
  const [open, setOpen] = useState<MiniRow | null>(null)

  const rows: MiniRow[] = []
  workouts.forEach(w =>
    rows.push({
      key: w.id, Icon: DumbbellIcon, name: w.type,
      sub: [fmtClock(w.startedAt) || null, w.totalVolume > 0 ? `${(w.totalVolume / 1000).toFixed(1)}t` : null, w.duration ? `${w.duration}min` : null].filter(Boolean).join(' · '),
      detail: workoutDetail(w),
    }),
  )
  sessions.forEach((s, i) =>
    rows.push({
      key: s.startTime ?? `c${i}`, Icon: cardioIcon(s.type), name: cardioLabel(s),
      sub: [fmtClock(s.startTime) || null, s.durationMin != null ? `${s.durationMin}min` : null, s.activeZoneMinutes != null ? `${s.activeZoneMinutes} zone` : null, s.calories != null ? `${s.calories}kcal` : null].filter(Boolean).join(' · '),
      detail: cardioDetail(s),
    }),
  )
  if (!rows.length && health?.cardioMinutes)
    rows.push({ key: 'cardio', Icon: HeartIcon, name: 'Cardio', sub: `${health.cardioMinutes}min`, detail: <div className="row"><Metric value={health.cardioMinutes} unit="min" label="Duration" /></div> })

  const Row = ({ row, active }: { row?: MiniRow; active: boolean }) => {
    const Icon = row?.Icon ?? DumbbellIcon
    return (
      <button className={styles.mini} onClick={() => row && setOpen(row)} disabled={!row}>
        <div className={styles.icon} style={{ color: active ? 'var(--accent)' : 'var(--text-low)' }}>
          <Icon width={18} height={18} />
        </div>
        <div className="stack gap-2 flex-1 min-w-0" style={{ textAlign: 'left' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: active ? 'var(--text-hi)' : 'var(--text-mid)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row?.name ?? 'Rest day'}</span>
          {row?.sub && <span className="t-micro" style={{ color: 'var(--text-low)' }}>{row.sub}</span>}
        </div>
        <ChevronRightIcon width={16} height={16} style={{ color: 'var(--text-low)' }} />
      </button>
    )
  }

  if (!rows.length) return <Row active={false} />

  return (
    <>
      <div className="stack gap-8">
        {rows.map(r => <Row key={r.key} row={r} active />)}
      </div>
      <BottomSheet open={!!open} onClose={() => setOpen(null)}>
        {open?.detail}
      </BottomSheet>
    </>
  )
}
