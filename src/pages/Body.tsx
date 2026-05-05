import { useState } from 'react'
import { useLatestMeasurements, useCreateMeasurement } from '../hooks/useMeasurements'
import { useLatestWeight, useWeight, useCreateWeight, useDeleteWeight } from '../hooks/useWeight'
import { useSettings } from '../hooks/useSettings'
import { BodySVG } from '../components/BodySVG'
import { WeightGraph } from '../components/WeightGraph'
import { BottomSheet } from '../components/BottomSheet'
import { SkeletonCard } from '../components/SkeletonCard'
import { useToast } from '../components/Toast'
import { calcBMI, getBMICategory, BMI_LABELS, BMI_COLORS } from '../utils/bmi'
import { estimateBodyFat } from '../utils/bodyFat'
import { today } from '../utils/dates'
import styles from './Body.module.css'

type Tab = 'measurements' | 'weight'
type WeightRange = '1M' | '3M' | '6M' | '1Y' | '2Y'

const WEIGHT_RANGES: WeightRange[] = ['1M', '3M', '6M', '1Y', '2Y']

const MEASUREMENT_KEYS = [
  { key: 'neck',     label: 'Neck' },
  { key: 'chest',    label: 'Chest' },
  { key: 'waist',    label: 'Waist' },
  { key: 'hip',      label: 'Hip' },
  { key: 'rightArm', label: 'R. Arm' },
  { key: 'leftArm',  label: 'L. Arm' },
  { key: 'forearm',  label: 'Forearm' },
  { key: 'thigh',    label: 'Thigh' },
  { key: 'calf',     label: 'Calf' },
] as const

type MKey = typeof MEASUREMENT_KEYS[number]['key']

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
  </svg>
)

export const Body = () => {
  const [tab, setTab] = useState<Tab>('measurements')
  const [weightRange, setWeightRange] = useState<WeightRange>('3M')
  const [measureSheet, setMeasureSheet] = useState(false)
  const [weightSheet, setWeightSheet] = useState(false)
  const [editHeight, setEditHeight] = useState(false)
  const [heightInput, setHeightInput] = useState('')
  const [measureForm, setMeasureForm] = useState<Record<string, string>>({})
  const [weightInput, setWeightInput] = useState('')
  const [weightDate, setWeightDate] = useState(today())
  const [measureDate, setMeasureDate] = useState(today())

  const { data: latest, isLoading: loadingM } = useLatestMeasurements()
  const { data: latestWeight, isLoading: loadingW } = useLatestWeight()
  const { data: settings } = useSettings()
  const { data: weightHistory = [], isLoading: loadingWH } = useWeight(weightRange)
  const createMeasurement = useCreateMeasurement()
  const createWeight = useCreateWeight()
  const deleteWeight = useDeleteWeight()
  const { showToast } = useToast()

  const height = settings?.height ?? 175

  const bmi = latestWeight ? calcBMI(latestWeight.weight, height) : null
  const bmiCat = bmi ? getBMICategory(bmi) : null

  const bodyFat = latest?.waist && latest?.neck
    ? estimateBodyFat(latest.waist, latest.neck, height)
    : null

  const handleLogMeasurement = async () => {
    const payload: Record<string, unknown> = { date: measureDate }
    MEASUREMENT_KEYS.forEach(({ key }) => {
      const val = parseFloat(measureForm[key] ?? '')
      if (!isNaN(val) && val > 0) payload[key] = val
    })
    try {
      await createMeasurement.mutateAsync(payload as Parameters<typeof createMeasurement.mutateAsync>[0])
      showToast('Measurements saved!')
      setMeasureSheet(false)
      setMeasureForm({})
    } catch {
      showToast('Failed to save', 'error')
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
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  const filteredHistory = weightHistory.filter(e => {
    const months: Record<WeightRange, number> = { '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '2Y': 24 }
    const cutoff = new Date()
    cutoff.setMonth(cutoff.getMonth() - months[weightRange])
    return new Date(e.date) >= cutoff
  })

  const sortedHistory = [...filteredHistory].sort((a, b) => b.date.localeCompare(a.date))
  const weights = filteredHistory.map(e => e.weight)
  const minWeight = weights.length ? Math.min(...weights) : null
  const maxWeight = weights.length ? Math.max(...weights) : null

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Body</h1>
      </header>

      <div className={styles.segmented}>
        <button className={`${styles.seg} ${tab === 'measurements' ? styles.segActive : ''}`}
          onClick={() => setTab('measurements')}>Measurements</button>
        <button className={`${styles.seg} ${tab === 'weight' ? styles.segActive : ''}`}
          onClick={() => setTab('weight')}>Weight</button>
      </div>

      {tab === 'measurements' && (
        <div className={styles.content}>
          {loadingM ? (
            <div className={styles.svgWrap}><SkeletonCard height={300} /></div>
          ) : (
            <>
              <div className={styles.svgWrap}>
                <BodySVG latest={latest} heightCm={height} />
                {!latest && (
                  <p className={styles.svgPrompt}>Log your measurements to see your body map</p>
                )}
              </div>

              {bodyFat != null && (
                <div className={styles.chip}>
                  <span className={styles.chipMain}>~{bodyFat}% body fat (estimate)</span>
                  <span className={styles.chipSub}>US Navy method</span>
                </div>
              )}

              <div className={styles.grid}>
                {MEASUREMENT_KEYS.map(({ key, label }) => (
                  <div key={key} className={styles.gridCell}>
                    <span className={styles.gridLabel}>{label}</span>
                    <span className={styles.gridVal} style={{ color: latest?.[key as MKey] != null ? 'var(--text)' : 'var(--text-muted)' }}>
                      {latest?.[key as MKey] != null ? `${latest[key as MKey]}cm` : '—'}
                    </span>
                  </div>
                ))}
              </div>

              <button className={styles.addBtn} onClick={() => setMeasureSheet(true)}>
                + Log Measurements
              </button>
            </>
          )}
        </div>
      )}

      {tab === 'weight' && (
        <div className={styles.content}>
          {loadingW ? (
            <SkeletonCard height={110} />
          ) : (
            <div className={styles.weightCard}>
              <div className={styles.weightMain}>
                <span className={styles.weightNum}>
                  {latestWeight ? `${latestWeight.weight}` : '—'}
                </span>
                <span className={styles.weightUnit}>kg</span>
              </div>

              {bmi && bmiCat && (
                <span className={styles.bmiChip} style={{ color: BMI_COLORS[bmiCat], borderColor: BMI_COLORS[bmiCat] + '40' }}>
                  BMI {bmi} — {BMI_LABELS[bmiCat]}
                </span>
              )}

              <div className={styles.heightRow}>
                <span className={styles.heightLabel}>Height: </span>
                {editHeight ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input
                      className={styles.heightInput}
                      type="number" inputMode="decimal"
                      value={heightInput}
                      onChange={e => setHeightInput(e.target.value)}
                      placeholder={String(height)}
                      autoFocus
                    />
                    <button className={styles.heightSave} onClick={() => setEditHeight(false)}>
                      Done
                    </button>
                  </div>
                ) : (
                  <button className={styles.heightEdit} onClick={() => { setHeightInput(String(height)); setEditHeight(true) }}>
                    {height}cm <PencilIcon />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className={styles.rangeRow}>
            {WEIGHT_RANGES.map(r => (
              <button key={r} className={`${styles.rangeBtn} ${weightRange === r ? styles.rangeBtnActive : ''}`}
                onClick={() => setWeightRange(r)}>
                {r}
              </button>
            ))}
          </div>

          {loadingWH ? <SkeletonCard height={200} /> : <WeightGraph data={filteredHistory} />}

          {minWeight != null && maxWeight != null && (
            <div className={styles.statRow}>
              <div className={styles.stat}><span className={styles.statLabel}>Min</span><span className={styles.statVal}>{minWeight}kg</span></div>
              <div className={styles.stat}><span className={styles.statLabel}>Max</span><span className={styles.statVal}>{maxWeight}kg</span></div>
              <div className={styles.stat}><span className={styles.statLabel}>Entries</span><span className={styles.statVal}>{filteredHistory.length}</span></div>
            </div>
          )}

          <div className={styles.historyList}>
            {sortedHistory.slice(0, 20).map(e => (
              <div key={e.id} className={styles.historyRow}>
                <div>
                  <span className={styles.historyWeight}>{e.weight} kg</span>
                  <span className={styles.historyDate}>{new Date(e.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <button className={styles.deleteBtn} onClick={async () => {
                  await deleteWeight.mutateAsync(e.id)
                  showToast('Deleted')
                }}>
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          <button className={styles.addBtn} onClick={() => setWeightSheet(true)}>
            + Log Weight
          </button>
        </div>
      )}

      {/* Log Measurements sheet */}
      <BottomSheet open={measureSheet} onClose={() => setMeasureSheet(false)} title="Log Measurements">
        <div className={styles.sheetForm}>
          <div className={styles.measureGrid}>
            {MEASUREMENT_KEYS.map(({ key, label }) => (
              <div key={key} className={styles.measureField}>
                <label className={styles.measureLabel}>{label}</label>
                <div className={styles.measureInputWrap}>
                  <input
                    className={styles.measureInput}
                    type="number" inputMode="decimal" placeholder="—" min="0"
                    value={measureForm[key] ?? ''}
                    onChange={e => setMeasureForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                  <span className={styles.measureUnit}>in</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.dateRow}>
            <label className={styles.measureLabel}>Date</label>
            <input className={styles.dateInput} type="date" value={measureDate}
              max={today()} onChange={e => setMeasureDate(e.target.value)} />
          </div>
          <button className={styles.saveBtn} onClick={handleLogMeasurement} disabled={createMeasurement.isPending}>
            {createMeasurement.isPending ? 'Saving…' : 'Save Measurements'}
          </button>
        </div>
      </BottomSheet>

      {/* Log Weight sheet */}
      <BottomSheet open={weightSheet} onClose={() => setWeightSheet(false)} title="Log Weight">
        <div className={styles.sheetForm}>
          <input
            className={styles.bigInput}
            type="number" inputMode="decimal"
            placeholder="0.0"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            autoFocus
          />
          <div className={styles.dateRow}>
            <label className={styles.measureLabel}>Date</label>
            <input className={styles.dateInput} type="date" value={weightDate}
              max={today()} onChange={e => setWeightDate(e.target.value)} />
          </div>
          <button className={styles.saveBtn} onClick={handleLogWeight} disabled={createWeight.isPending}>
            {createWeight.isPending ? 'Saving…' : 'Save Weight'}
          </button>
        </div>
      </BottomSheet>
    </div>
  )
}
