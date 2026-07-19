import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSettings, useUpdateSettings } from '../hooks/useSettings'
import { useSyncHevy } from '../hooks/useSync'
import { useToast } from './Toast'
import { enablePush, testPush } from '../api/push'
import { CloseIcon, FlameIcon, InfoIcon, DumbbellIcon, RefreshIcon } from '../assets/icons'
import styles from './SettingsModal.module.css'

interface Props { open: boolean; onClose: () => void }

const API_URL = import.meta.env.VITE_API_URL || 'https://fueld-server.onrender.com'

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
  const hevySync = useSyncHevy()
  const qc = useQueryClient()
  const { showToast } = useToast()

  const [form, setForm] = useState({
    targetCalories: '1700', targetProtein: '140',
    targetCarbs: '180',    targetFat: '60', height: '175',
    characterName: '', hevyApiKey: '',
    stepTarget: '10000', sleepTarget: '8',
  })

  useEffect(() => {
    if (settings) setForm({
      targetCalories: String(settings.targetCalories),
      targetProtein:  String(settings.targetProtein),
      targetCarbs:    String(settings.targetCarbs),
      targetFat:      String(settings.targetFat),
      height:         String(settings.height),
      characterName:  settings.characterName ?? '',
      hevyApiKey:     settings.hevyApiKey ?? '',
      stepTarget:     String(settings.stepTarget ?? 10000),
      sleepTarget:    String(settings.sleepTarget ?? 8),
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
        characterName:  form.characterName.trim() || undefined,
        hevyApiKey:     form.hevyApiKey.trim() || undefined,
        stepTarget:     Number(form.stepTarget),
        sleepTarget:    Number(form.sleepTarget),
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
          <div className="stack gap-12" style={{marginTop: 30}}>
            <div className="row gap-8">
              <InfoIcon width={14} height={14} style={{ color: 'var(--text-mid)' }} />
              <span className="t-eyebrow">Body</span>
            </div>
            <Field label="Height" value={form.height} onChange={set('height')} unit="cm" />
            <div className="row gap-10" style={{ gap: 20 }}>
              <Field label="Step Goal" value={form.stepTarget} onChange={set('stepTarget')} unit="" />
              <Field label="Sleep Goal" value={form.sleepTarget} onChange={set('sleepTarget')} unit="h" />
            </div>
          </div>

          {/* Fighter + integrations */}
          <div className="stack gap-12" style={{ marginTop: 30, marginBottom: 30 }}>
            <div className="row gap-8">
              <DumbbellIcon width={14} height={14} style={{ color: 'var(--accent)' }} />
              <span className="t-eyebrow">Fighter</span>
            </div>
            <div className="stack gap-5">
              <label className="t-eyebrow" style={{ marginBottom: 10 }}>Callsign</label>
              <input className="input" type="text" placeholder="FIGHTER" maxLength={16}
                value={form.characterName} onChange={set('characterName')} />
            </div>
            <div className="stack gap-5">
              <label className="t-eyebrow" style={{ marginBottom: 10 }}>Hevy API Key</label>
              <input className="input" type="password" placeholder="paste from hevy.com → Developer"
                value={form.hevyApiKey} onChange={set('hevyApiKey')} autoComplete="off" />
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                Enables Sync Hevy — pulls your lifts, awards XP + PRs.
              </span>
              <button
                className="btn-ghost"
                style={{ height: 44, justifyContent: 'center', gap: 8 }}
                disabled={hevySync.isPending || !settings?.hevyApiKey}
                onClick={() => hevySync.mutate(undefined, {
                  onSuccess: r => showToast(`Synced ${r.synced} · +${r.xpEarned} XP${r.newPRs.length ? ` · ${r.newPRs.length} PR` : ''}`),
                  onError: () => showToast('Hevy sync failed', 'error'),
                })}
              >
                <RefreshIcon width={14} height={14} className={hevySync.isPending ? styles.spin : ''} />
                {hevySync.isPending ? 'Syncing…' : 'Sync Hevy Now'}
              </button>
            </div>

            <div className="stack gap-5">
              <label className="t-eyebrow" style={{ marginBottom: 10 }}>Google Health</label>
              <button
                className="btn-ghost"
                style={{ height: 48, justifyContent: 'center' }}
                onClick={() => { window.location.href = `${API_URL}/health/auth` }}
              >
                {settings?.googleHealthConnected ? '✓ Connected — Reconnect' : 'Connect Google Health'}
              </button>
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                Pulls steps, sleep, HRV, resting heart rate & weight.
              </span>
              {settings?.googleHealthConnected && (
                <button
                  className="btn-ghost"
                  style={{ height: 44, justifyContent: 'center', gap: 8 }}
                  onClick={() => { qc.invalidateQueries({ queryKey: ['health-today'] }); showToast('Refreshing health data') }}
                >
                  <RefreshIcon width={14} height={14} /> Refresh Health Data
                </button>
              )}
            </div>

            <div className="stack gap-5">
              <label className="t-eyebrow" style={{ marginBottom: 10 }}>Notifications</label>
              <button
                className="btn-ghost"
                style={{ height: 48, justifyContent: 'center' }}
                onClick={async () => {
                  const r = await enablePush()
                  showToast(
                    r === 'ok' ? 'Notifications enabled'
                    : r === 'denied' ? 'Permission denied'
                    : r === 'unsupported' ? 'Install the app first (Add to Home Screen)'
                    : 'Could not enable',
                    r === 'ok' ? 'success' : 'error',
                  )
                }}
              >
                Enable Notifications
              </button>
              <button
                className="btn-ghost"
                style={{ height: 44, justifyContent: 'center' }}
                onClick={async () => { await testPush(); showToast('Test sent') }}
              >
                Send Test
              </button>
              <span className="t-micro" style={{ color: 'var(--text-low)' }}>
                Nightly reminder ~10:30pm + PR/streak alerts. Works only when installed to Home Screen.
              </span>
            </div>
          </div>

          <button className="btn-primary" onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </div>
    </>
  )
}
