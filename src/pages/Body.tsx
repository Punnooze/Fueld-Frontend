import { useState } from 'react'
import { useMeasurements, useCreateMeasurement } from '../hooks/useMeasurements'
import { useLatestWeight, useWeight, useCreateWeight, useDeleteWeight } from '../hooks/useWeight'
import { useSettings } from '../hooks/useSettings'
import { WeightGraph } from '../components/WeightGraph'
import { BottomSheet } from '../components/BottomSheet'
import { SegmentedControl } from '../components/SegmentedControl'
import { SkeletonCard } from '../components/SkeletonCard'
import { useToast } from '../components/Toast'
import { Card } from '../components/ui/Card'
import { MetricNumber } from '../components/ui/MetricNumber'
import { InfoIcon, EditIcon, TrashIcon, ScaleIcon } from '../assets/icons'
import { calcBMI, getBMICategory, BMI_LABELS, BMI_COLORS } from '../utils/bmi'
import { estimateBodyFat } from '../utils/bodyFat'
import { today } from '../utils/dates'
import styles from './Body.module.css'

type Tab = 'measurements' | 'weight'
type WeightRange = '1M' | '3M' | '6M' | '1Y' | '2Y'
type MKey = 'neck' | 'chest' | 'waist' | 'hip' | 'rightArm' | 'leftArm' | 'forearm' | 'thigh' | 'calf'

const WEIGHT_RANGES: WeightRange[] = ['1M', '3M', '6M', '1Y', '2Y']
const TABS = [
  { value: 'measurements', label: 'Measurements' },
  { value: 'weight', label: 'Weight' },
]
const MEASUREMENT_KEYS: { key: MKey; label: string }[] = [
  { key: 'neck',     label: 'Neck'    },
  { key: 'chest',   label: 'Chest'   },
  { key: 'waist',   label: 'Waist'   },
  { key: 'hip',     label: 'Hip'     },
  { key: 'rightArm', label: 'R. Arm' },
  { key: 'leftArm',  label: 'L. Arm' },
  { key: 'forearm', label: 'Forearm' },
  { key: 'thigh',   label: 'Thigh'   },
  { key: 'calf',    label: 'Calf'    },
]

// Tiny sparkline — last N values as proportional bars
const Sparkline = ({ values }: { values: number[] }) => {
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, marginTop: 4 }}>
      {values.map((v, i) => (
        <div key={i} style={{
          width: 3,
          height: `${Math.round(((v - min) / range) * 10) + 4}px`,
          background: i === values.length - 1 ? 'var(--accent)' : 'var(--bg-3)',
          borderRadius: 2,
          flexShrink: 0,
        }} />
      ))}
    </div>
  )
}

// Per-key card with delta + sparkline
const MeasurementCell = ({
  label, current, prev, history, unit
}: {
  label: string; current?: number; prev?: number; history: number[]; unit: 'cm' | 'in'
}) => {
  const convert = (val: number) => unit === 'in' ? val / 2.54 : val

  const displayCurrent = current != null ? convert(current) : null
  const displayPrev = prev != null ? convert(prev) : null
  const displayHistory = history.map(convert)

  const delta = displayCurrent != null && displayPrev != null ? +(displayCurrent - displayPrev).toFixed(1) : null
  // For waist/hip decrease is good (success), for muscle measurements increase is good
  const isReductionKey = label === 'Waist' || label === 'Hip'
  const deltaGood = delta !== null && (isReductionKey ? delta < 0 : delta > 0)
  const deltaColor = delta === null || delta === 0 ? 'var(--text-low)'
    : deltaGood ? 'var(--success)' : 'var(--text-mid)'

  return (
    <Card padding={12} style={{ minHeight: 80, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span className="t-eyebrow">{label}</span>
      <div className="row gap-4" style={{ alignItems: 'baseline' }}>
        <MetricNumber size="sm" color={displayCurrent != null ? 'var(--text-hi)' : 'var(--text-dim)'}>
          {displayCurrent != null ? +displayCurrent.toFixed(1) : '—'}
        </MetricNumber>
        {displayCurrent != null && (
          <span style={{ fontSize: 10, color: 'var(--text-low)' }}>{unit}</span>
        )}
      </div>
      {delta !== null && (
        <span style={{ fontSize: 10, color: deltaColor, lineHeight: 1 }}>
          {delta > 0 ? '▲' : delta < 0 ? '▼' : '▬'} {Math.abs(delta)} {unit}
        </span>
      )}
      <Sparkline values={displayHistory.slice(-5)} />
    </Card>
  )
}

export const Body = () => {
  const [tab, setTab]                   = useState<Tab>('measurements')
  const [unit, setUnit]                 = useState<'cm' | 'in'>('in')
  const [weightRange, setWeightRange]   = useState<WeightRange>('3M')
  const [measureSheet, setMeasureSheet] = useState(false)
  const [weightSheet, setWeightSheet]   = useState(false)
  const [editHeight, setEditHeight]     = useState(false)
  const [heightInput, setHeightInput]   = useState('')
  const [measureForm, setMeasureForm]   = useState<Record<string, string>>({})
  const [weightInput, setWeightInput]   = useState('')
  const [weightDate, setWeightDate]     = useState(today())
  const [measureDate, setMeasureDate]   = useState(today())

  const { data: allMeasurements = [], isLoading: loadingM } = useMeasurements()
  const { data: latestWeight, isLoading: loadingW }         = useLatestWeight()
  const { data: settings }                                  = useSettings()
  const { data: weightHistory = [], isLoading: loadingWH } = useWeight(weightRange)
  const createMeasurement = useCreateMeasurement()
  const createWeight      = useCreateWeight()
  const deleteWeight      = useDeleteWeight()
  const { showToast }     = useToast()

  const height  = settings?.height ?? 175
  const bmi     = latestWeight ? calcBMI(latestWeight.weight, height) : null
  const bmiCat  = bmi ? getBMICategory(bmi) : null

  // Build per-key history sorted oldest→newest
  const sorted = [...allMeasurements].sort((a, b) => {
    const d = a.date.localeCompare(b.date)
    return d !== 0 ? d : a.id.localeCompare(b.id)
  })

  const historyFor = (key: MKey): number[] =>
    sorted.map(m => m[key]).filter((v): v is number => v != null)

  const currentFor = (key: MKey): number | undefined => {
    const hist = historyFor(key)
    return hist.length > 0 ? hist[hist.length - 1] : undefined
  }

  const prevFor = (key: MKey): number | undefined => {
    const hist = historyFor(key)
    return hist.length > 1 ? hist[hist.length - 2] : undefined
  }

  const cw = currentFor('waist')
  const cn = currentFor('neck')
  const bodyFat = cw && cn
    ? estimateBodyFat(cw / 2.54, cn / 2.54, height)
    : null

  // Completeness
  const trackedCount = MEASUREMENT_KEYS.filter(({ key }) => currentFor(key) != null).length
  const lastLoggedDate = allMeasurements.length > 0
    ? new Date(sorted[sorted.length - 1].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  const handleLogMeasurement = async () => {
    const payload: Record<string, unknown> = { date: measureDate }
    MEASUREMENT_KEYS.forEach(({ key }) => {
      const val = parseFloat(measureForm[key] ?? '')
      if (!isNaN(val) && val > 0) {
        payload[key] = unit === 'in' ? +(val * 2.54).toFixed(1) : +(val).toFixed(1)
      }
    })
    try {
      await createMeasurement.mutateAsync(payload as Parameters<typeof createMeasurement.mutateAsync>[0])
      showToast('Measurements saved!')
      setMeasureSheet(false)
      setMeasureForm({})
    } catch (err: any) { 
      const msg = err?.response?.data?.message || err?.message || 'Failed to save'
      showToast(`Error: ${msg}`, 'error') 
    }
  }

  const handleLogWeight = async () => {
    const w = parseFloat(weightInput)
    if (!w || w <= 0) return
    try {
      await createWeight.mutateAsync({ weight: w, date: weightDate })
      showToast('Weight logged!')
      setWeightSheet(false)
      setWeightInput('')
    } catch { showToast('Failed to save', 'error') }
  }

  const months: Record<WeightRange, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24 }
  const filteredHistory = weightHistory.filter(e => {
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months[weightRange])
    return new Date(e.date) >= cutoff
  })
  const sortedWeightHistory = [...filteredHistory].sort((a, b) => b.date.localeCompare(a.date))
  const weights = filteredHistory.map(e => e.weight)
  const minWeight = weights.length ? Math.min(...weights) : null
  const maxWeight = weights.length ? Math.max(...weights) : null

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="t-h1">Body</h1>
      </header>

      <div style={{ padding: '0 var(--page-x) 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <SegmentedControl options={TABS} value={tab} onChange={v => setTab(v as Tab)} />
        </div>
        {tab === 'measurements' && (
          <button 
            className="btn-ghost"
            style={{ fontFamily: 'var(--font-mono)', fontSize: 13, height: 32, padding: '0 12px' }}
            onClick={() => setUnit(unit === 'cm' ? 'in' : 'cm')}
          >
            {unit.toUpperCase()}
          </button>
        )}
      </div>

      {/* ── MEASUREMENTS TAB ── */}
      {tab === 'measurements' && (
        <div className="stack gap-12 px">
          {loadingM ? (
            <>
              <SkeletonCard height={80} />
              <SkeletonCard height={300} />
            </>
          ) : (
            <>
              {/* Summary / status card */}
              <Card padding={16}>
                <div className="between">
                  <div className="stack gap-6">
                    <span className="t-eyebrow">Last Logged</span>
                    <MetricNumber size="sm" color={lastLoggedDate ? 'var(--text-hi)' : 'var(--text-dim)'}>
                      {lastLoggedDate ?? 'Never'}
                    </MetricNumber>
                  </div>
                  <div className="stack gap-6" style={{ alignItems: 'flex-end' }}>
                    <span className="t-eyebrow">Tracked</span>
                    <div className="row gap-4" style={{ alignItems: 'baseline' }}>
                      <MetricNumber size="sm" color="var(--accent)">{trackedCount}</MetricNumber>
                      <span style={{ fontSize: 12, color: 'var(--text-low)' }}>/ 9</span>
                    </div>
                  </div>
                </div>
                {/* Completeness dots */}
                <div className="row gap-4" style={{ marginTop: 12 }}>
                  {MEASUREMENT_KEYS.map(({ key, label }) => (
                    <div
                      key={key}
                      title={label}
                      style={{
                        flex: 1,
                        height: 4,
                        borderRadius: 2,
                        background: currentFor(key) != null ? 'var(--accent)' : 'var(--bg-3)',
                        transition: 'background 0.3s var(--ease)',
                      }}
                    />
                  ))}
                </div>
              </Card>

              {/* Body fat card */}
              {bodyFat != null && (
                <Card padding={14}>
                  <div className="between">
                    <div className="stack gap-2">
                      <span className="t-eyebrow">Body Fat%</span>
                      <MetricNumber size="lg" color="var(--accent)">~{bodyFat}%</MetricNumber>
                    </div>
                    <button className="btn-icon" title="Estimated using the US Navy circumference method">
                      <InfoIcon width={18} height={18} />
                    </button>
                  </div>
                </Card>
              )}

              {/* Measurement grid with history */}
              {allMeasurements.length === 0 ? (
                <div className="empty-state">
                  <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-hi)' }}>
                    No measurements yet
                  </p>
                  <p className="t-meta" style={{ maxWidth: 260 }}>
                    Log your first entry to start tracking progress over time.
                  </p>
                </div>
              ) : (
                <div className={styles.measureGrid}>
                  {MEASUREMENT_KEYS.map(({ key, label }) => (
                    <MeasurementCell
                      key={key}
                      label={label}
                      current={currentFor(key)}
                      prev={prevFor(key)}
                      history={historyFor(key)}
                      unit={unit}
                    />
                  ))}
                </div>
              )}

              <button className="btn-primary" onClick={() => setMeasureSheet(true)}>
                + LOG MEASUREMENTS
              </button>
            </>
          )}
        </div>
      )}

      {/* ── WEIGHT TAB ── */}
      {tab === 'weight' && (
        <div className="stack gap-12 px">
          {loadingW ? <SkeletonCard height={110} /> : (
            <Card padding={20}>
              <div className="row gap-12" style={{ marginBottom: 10 }}>
                <ScaleIcon width={20} height={20} style={{ color: 'var(--text-mid)', flexShrink: 0 }} />
                {latestWeight ? (
                  <div className="row gap-6" style={{ alignItems: 'baseline' }}>
                    <MetricNumber size="xl" color="var(--accent)">{latestWeight.weight}</MetricNumber>
                    <span style={{ fontSize: 18, color: 'var(--text-mid)' }}>kg</span>
                  </div>
                ) : (
                  <MetricNumber size="lg" color="var(--text-dim)">—</MetricNumber>
                )}
              </div>

              {bmi && bmiCat && (
                <span style={{
                  display: 'inline-block', fontSize: 13, fontWeight: 600,
                  border: `1px solid ${BMI_COLORS[bmiCat]}40`,
                  borderRadius: 8, padding: '4px 10px',
                  color: BMI_COLORS[bmiCat], marginBottom: 10,
                }}>
                  BMI {bmi} — {BMI_LABELS[bmiCat]}
                </span>
              )}

              <div className="row gap-6">
                <span className="t-meta">Height:</span>
                {editHeight ? (
                  <div className="row gap-6">
                    <input
                      className="input"
                      style={{ width: 70, padding: '6px 8px', height: 36, fontSize: 14 }}
                      type="number" inputMode="decimal"
                      value={heightInput}
                      onChange={e => setHeightInput(e.target.value)}
                      placeholder={String(height)}
                      autoFocus
                    />
                    <button
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}
                      onClick={() => setEditHeight(false)}
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <button
                    className="row gap-4"
                    style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-hi)' }}
                    onClick={() => { setHeightInput(String(height)); setEditHeight(true) }}
                  >
                    {height}cm <EditIcon width={13} height={13} />
                  </button>
                )}
              </div>
            </Card>
          )}

          {/* Range selector */}
          <div className="row gap-6">
            {WEIGHT_RANGES.map(r => (
              <button
                key={r}
                className={`btn-ghost flex-1 ${r === weightRange ? styles.rangeActive : ''}`}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}
                onClick={() => setWeightRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {loadingWH ? <SkeletonCard height={200} /> : <WeightGraph data={filteredHistory} />}

          {minWeight != null && maxWeight != null && (
            <div className="row gap-8">
              {([['Min', `${minWeight}kg`], ['Max', `${maxWeight}kg`], ['Entries', String(filteredHistory.length)]] as const).map(([label, val]) => (
                <Card key={label} padding={10} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                  <span className="t-eyebrow">{label}</span>
                  <MetricNumber size="sm">{val}</MetricNumber>
                </Card>
              ))}
            </div>
          )}

          {sortedWeightHistory.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <p className="t-meta">No weight entries in this range</p>
            </div>
          ) : (
            <div className="stack gap-6">
              {sortedWeightHistory.slice(0, 20).map(e => (
                <Card key={e.id} padding={0} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 12px 12px 16px' }}>
                  <div className="stack gap-2">
                    <MetricNumber size="sm">{e.weight} kg</MetricNumber>
                    <span className="t-micro" style={{ color: 'var(--text-mid)' }}>
                      {new Date(e.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <button
                    className="btn-danger"
                    onClick={async () => { await deleteWeight.mutateAsync(e.id); showToast('Deleted') }}
                  >
                    <TrashIcon width={14} height={14} />
                  </button>
                </Card>
              ))}
            </div>
          )}

          <button className="btn-primary" onClick={() => setWeightSheet(true)}>
            + LOG WEIGHT
          </button>
        </div>
      )}

      {/* ── Log Measurements sheet ── */}
      <BottomSheet open={measureSheet} onClose={() => setMeasureSheet(false)} title="Log Measurements">
        <div className="stack gap-12">
          <div className={styles.measureInputGrid}>
            {MEASUREMENT_KEYS.map(({ key, label }) => (
              <div key={key} className="stack gap-4">
                <label className="t-eyebrow">{label}</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    style={{ paddingRight: 28, fontFamily: 'var(--font-mono)', fontSize: 15 }}
                    type="number" inputMode="decimal"
                    placeholder={currentFor(key) != null ? String(+(unit === 'in' ? currentFor(key)! / 2.54 : currentFor(key)!).toFixed(1)) : '—'}
                    min="0"
                    value={measureForm[key] ?? ''}
                    onChange={e => setMeasureForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  <span style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 10, color: 'var(--text-low)', pointerEvents: 'none',
                  }}>{unit}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="between">
            <label className="t-eyebrow">Date</label>
            <input type="date" value={measureDate} max={today()} onChange={e => setMeasureDate(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleLogMeasurement} disabled={createMeasurement.isPending}>
            {createMeasurement.isPending ? 'Saving…' : 'Save Measurements'}
          </button>
        </div>
      </BottomSheet>

      {/* ── Log Weight sheet ── */}
      <BottomSheet open={weightSheet} onClose={() => setWeightSheet(false)} title="Log Weight">
        <div className="stack gap-12">
          <input
            className="input input-mono"
            type="number" inputMode="decimal" placeholder="0.0"
            value={weightInput} onChange={e => setWeightInput(e.target.value)} autoFocus
          />
          <div className="between">
            <label className="t-eyebrow">Date</label>
            <input type="date" value={weightDate} max={today()} onChange={e => setWeightDate(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleLogWeight} disabled={createWeight.isPending}>
            {createWeight.isPending ? 'Saving…' : 'Save Weight'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
