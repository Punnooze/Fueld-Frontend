import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCharacter } from '../hooks/useCharacter'
import { useQuests } from '../hooks/useQuests'
import { useSettings } from '../hooks/useSettings'
import { useHealthToday } from '../hooks/useHealthToday'
import { FighterCardCombat } from '../components/FighterCardCombat'
import { QuestList } from '../components/QuestList'
import { LevelUpOverlay } from '../components/LevelUpOverlay'
import { SettingsModal } from '../components/SettingsModal'
import { HealthRings } from '../components/HealthRings'
import { FAB } from '../components/FAB'
import { Reveal } from '../components/Reveal'
import { useToast } from '../components/Toast'
import type { Character } from '../api/character'
import { SettingsIcon } from '../assets/icons'
import LogoHeader from '../assets/brand/logo-header.svg?react'
import LoadingMark from '../assets/marks/loading.svg?react'
import styles from './Home.module.css'

function attitude(c: Character): string {
  if (c.decaying && c.daysSinceActive && c.daysSinceActive >= 7)
    return "You've gone soft. Rank is bleeding out. Fix it."
  if (c.decaying) return `${c.daysSinceActive} days quiet. The clock doesn't care about your reasons.`
  if (c.streak >= 30) return "30 DAYS. Most people quit at 3. You're not most people."
  if (c.streak >= 21) return "WEEK 3. NO DAYS OFF. YOU'RE BECOMING DANGEROUS."
  if (c.streak >= 7) return "One week straight. This is where most people fold. Not you."
  if (c.streak >= 1) return `Day ${c.streak}. Keep the fire lit.`
  return "Day 1 costs nothing. Day 100 costs everything you skip now."
}

export const Home = () => {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { showToast } = useToast()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const charQ = useCharacter()
  const questsQ = useQuests()
  const settingsQ = useSettings()
  const googleConnected = !!settingsQ.data?.googleHealthConnected
  const healthQ = useHealthToday(googleConnected)

  const character = charQ.data
  const quests = questsQ.data ?? []
  const settings = settingsQ.data
  const health = healthQ.data
  const isError = charQ.isError

  // wait for everything before revealing the page
  const booting =
    charQ.isLoading || questsQ.isLoading || settingsQ.isLoading ||
    (googleConnected && healthQ.isLoading)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('health') === 'connected') {
      showToast('Google Health connected')
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['health-today'] })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [qc, showToast])

  if (booting) {
    return (
      <div className={`page ${styles.page}`} style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
        <div className="stack gap-16" style={{ alignItems: 'center' }}>
          <LoadingMark width={56} height={56} style={{ animation: 'ringSpin 1.1s linear infinite', color: 'var(--accent)' }} />
          <span className="t-micro" style={{ color: 'var(--text-low)', letterSpacing: '0.24em' }}>LOADING FIGHTER</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.header}>
        <LogoHeader width={120} height={24} />
        <button className="btn-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          <SettingsIcon width={20} height={20} />
        </button>
      </header>

      <div className="px stack gap-24">
        {isError && <p style={{ color: 'var(--danger)', fontSize: 14, padding: '24px 0' }}>Couldn't load your fighter.</p>}

        {character && (
          <>
            <LevelUpOverlay character={character} />

            {/* 1. Recovery / rings */}
            {health && (health.steps || health.sleepHours || health.restingHeartRate) && (
              <Reveal delay={0}>
                <HealthRings
                  data={health}
                  stepTarget={settings?.stepTarget ?? 10000}
                  sleepTarget={settings?.sleepTarget ?? 8}
                />
              </Reveal>
            )}

            {/* 2. Fighter card → profile */}
            <Reveal delay={70}><FighterCardCombat character={character} /></Reveal>
            <Reveal delay={120}><p className={styles.attitude}>{attitude(character)}</p></Reveal>

            {/* 3. Quests */}
            <Reveal delay={170}><QuestList quests={quests} /></Reveal>
          </>
        )}
      </div>

      <FAB onClick={() => navigate('/log')} label="Log fuel" />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
