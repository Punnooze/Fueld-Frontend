import { useState, useEffect } from 'react'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import { useToast } from './Toast'
import { CloseIcon, FlameIcon, InfoIcon } from '../assets/icons'
import styles from './SettingsModal.module.css'

interface Props { open: boolean; onClose: () => void }

const Field = ({ label, value, onChange, unit }: {
  label: string; value: string; unit: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="stack gap-5 flex-1">
    <label className="t-eyebrow" style={{marginBottom: 10}}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        style={{ paddingRight: unit.length > 2 ? 44 : 36 }}
        type="number" inputMode="decimal" value={value} onChange={onChange} min="0"
      />
      <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-low)', pointerEvents: 'none' }}>
        {unit}
      </span>
    </div>
  </div>
)

export const SettingsModal = ({ open, onClose }: Props) => {
  const { data: settings } = useSettings()
  const update = useUpdateSettings()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    targetCalories: '1700', targetProtein: '140',
    targetCarbs: '180',    targetFat: '60', height: '175',
  })

  useEffect(() => {
    if (settings) setForm({
      targetCalories: String(settings.targetCalories),
      targetProtein:  String(settings.targetProtein),
      targetCarbs:    String(settings.targetCarbs),
      targetFat:      String(settings.targetFat),
      height:         String(settings.height),
    })
  }, [settings])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    try {
      await update.mutateAsync({
        targetCalories: Number(form.targetCalories),
        targetProtein:  Number(form.targetProtein),
        targetCarbs:    Number(form.targetCarbs),
        targetFat:      Number(form.targetFat),
        height:         Number(form.height),
      })
      showToast('Settings saved!')
      onClose()
    } catch { showToast('Failed to save', 'error') }
  }

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`} onClick={onClose} />
      <div className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}>
        <div className={styles.handle} />

        <div className="between" style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-hi)' }}>Settings</h2>
          <button className="btn-icon" onClick={onClose}><CloseIcon width={20} height={20} /></button>
        </div>

        <div className="stack gap-20">
          {/* Targets */}
          <div className="stack gap-12">
            <div className="row gap-8">
              <FlameIcon width={14} height={14} style={{ color: 'var(--accent)' }} />
              <span className="t-eyebrow">Daily Targets</span>
            </div>
            <div className="row gap-10" style={{gap: 20}}>
              <Field label="Calories" value={form.targetCalories} onChange={set('targetCalories')} unit="kcal" />
              <Field label="Protein"  value={form.targetProtein}  onChange={set('targetProtein')}  unit="g" />
            </div>
            <div className="row gap-10" style={{gap: 20}}>
              <Field label="Carbs" value={form.targetCarbs} onChange={set('targetCarbs')} unit="g" />
              <Field label="Fat"   value={form.targetFat}   onChange={set('targetFat')}   unit="g" />
            </div>
          </div>

          {/* Body */}
          <div className="stack gap-12" style={{marginTop: 30, marginBottom: 30}}>
            <div className="row gap-8">
              <InfoIcon width={14} height={14} style={{ color: 'var(--text-mid)' }} />
              <span className="t-eyebrow">Body</span>
            </div>
            <Field label="Height" value={form.height} onChange={set('height')} unit="cm" />
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  )
}
