import { useEffect, useRef } from 'react'
import type { Settings } from '../api/settings'
import { useSyncHevy, useSyncHealth } from '../hooks/useSync'
import { useToast } from './Toast'
import { RefreshIcon, DumbbellIcon, HeartIcon } from '../assets/icons'
import styles from './SyncBar.module.css'

export const SyncBar = ({ settings }: { settings?: Settings }) => {
  const hevy = useSyncHevy()
  const health = useSyncHealth()
  const { showToast } = useToast()
  const autoFired = useRef(false)

  const hevyConnected = !!settings?.hevyApiKey
  const healthConnected = !!settings?.googleHealthConnected

  // Auto-pull on load once settings say a source is connected.
  useEffect(() => {
    if (autoFired.current || !settings) return
    autoFired.current = true
    if (hevyConnected) hevy.mutate(undefined, { onError: () => {} })
    if (healthConnected) health.mutate(undefined, { onError: () => {} })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings])

  const runHevy = () => {
    if (!hevyConnected) return showToast('Add your Hevy API key in Settings first', 'error')
    hevy.mutate(undefined, {
      onSuccess: r => showToast(`Hevy synced · ${r.synced} sessions · +${r.xpEarned} XP`),
      onError: () => showToast('Hevy sync failed', 'error'),
    })
  }
  const runHealth = () => {
    if (!healthConnected) return showToast('Connect Google Health in Settings first', 'error')
    health.mutate(undefined, {
      onSuccess: () => showToast('Health data synced'),
      onError: () => showToast('Health sync failed', 'error'),
    })
  }

  return (
    <div className={styles.bar}>
      <button className={styles.btn} onClick={runHevy} data-on={hevyConnected}>
        <DumbbellIcon width={16} height={16} />
        <span>Sync Hevy</span>
        <RefreshIcon width={14} height={14} className={hevy.isPending ? styles.spin : ''} />
      </button>
      <button className={styles.btn} onClick={runHealth} data-on={healthConnected}>
        <HeartIcon width={16} height={16} />
        <span>Sync Health</span>
        <RefreshIcon width={14} height={14} className={health.isPending ? styles.spin : ''} />
      </button>
    </div>
  )
}
