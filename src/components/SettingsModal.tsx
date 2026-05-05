import { useState, useEffect } from 'react'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import { useToast } from './Toast'
import styles from './SettingsModal.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

export const SettingsModal = ({ open, onClose }: Props) => {
  const { data: settings } = useSettings()
  const update = useUpdateSettings()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    targetCalories: '1700',
    targetProtein: '140',
    targetCarbs: '180',
    targetFat: '60',
    height: '175',
  })

  useEffect(() => {
    if (settings) {
      setForm({
        targetCalories: String(settings.targetCalories),
        targetProtein: String(settings.targetProtein),
        targetCarbs: String(settings.targetCarbs),
        targetFat: String(settings.targetFat),
        height: String(settings.height),
      })
    }
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
        targetProtein: Number(form.targetProtein),
        targetCarbs: Number(form.targetCarbs),
        targetFat: Number(form.targetFat),
        height: Number(form.height),
      })
      showToast('Settings saved!')
      onClose()
    } catch {
      showToast('Failed to save', 'error')
    }
  }

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`} onClick={onClose} />
      <div className={`${styles.modal} ${open ? styles.modalOpen : ''}`}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeBtn} onClick={onClose}><XIcon /></button>
        </div>

        <div className={styles.body}>
          <p className={styles.sectionLabel}>Daily Targets</p>
          <div className={styles.row}>
            <Field label="Calories" value={form.targetCalories} onChange={set('targetCalories')} unit="kcal" />
            <Field label="Protein" value={form.targetProtein} onChange={set('targetProtein')} unit="g" />
          </div>
          <div className={styles.row}>
            <Field label="Carbs" value={form.targetCarbs} onChange={set('targetCarbs')} unit="g" />
            <Field label="Fat" value={form.targetFat} onChange={set('targetFat')} unit="g" />
          </div>

          <p className={styles.sectionLabel} style={{ marginTop: 20 }}>Body</p>
          <Field label="Height" value={form.height} onChange={set('height')} unit="cm" />

          <button className={styles.saveBtn} onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}

const Field = ({
  label, value, onChange, unit,
}: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  unit: string
}) => (
  <div className={styles.field}>
    <label className={styles.fieldLabel}>{label}</label>
    <div className={styles.inputWrap}>
      <input
        className={styles.input}
        type="number"
        inputMode="decimal"
        value={value}
        onChange={onChange}
        min="0"
      />
      <span className={styles.unit}>{unit}</span>
    </div>
  </div>
)
