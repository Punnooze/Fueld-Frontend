import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useCharacter } from '../hooks/useCharacter'
import { useQuests } from '../hooks/useQuests'
import { useSettings } from '../hooks/useSettings'
import { useHealthToday } from '../hooks/useHealthToday'
import { useWeightJourney } from '../hooks/useWeight'
import { FighterCardCombat } from '../components/FighterCardCombat'
import { QuestList } from '../components/QuestList'
import { LevelUpOverlay } from '../components/LevelUpOverlay'
import { StreakBreakOverlay } from '../components/StreakBreakOverlay'
import { SettingsModal } from '../components/SettingsModal'
import { HealthRings } from '../components/HealthRings'
import { HealthStats } from '../components/HealthStats'
import { TodayTrainingCard } from '../components/TodayTraining'
import { Eyebrow } from '../components/ui/Eyebrow'
import { FAB } from '../components/FAB'
import { Reveal } from '../components/Reveal'
import { RankInsignia } from '../components/RankInsignia'
import { useToast } from '../components/Toast'
import type { Character } from '../api/character'
import { rankColor } from '../utils/ranks'
import { SettingsIcon, ScaleIcon } from '../assets/icons'
import LogoHeader from '../assets/brand/logo-header.svg?react'
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
  const journeyQ = useWeightJourney()

  const character = charQ.data
  const quests = questsQ.data ?? []
  const settings = settingsQ.data
  const health = healthQ.data
  const isError = charQ.isError

  // wait for everything before revealing the page
  const booting =
    // true || // ponytail: TEMP force loader for preview — remove
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
        <span style={{
          fontFamily: 'var(--font-mega)', fontSize: 88, fontWeight: 600,
          letterSpacing: '0.02em', color: 'var(--text-hi)', lineHeight: 1,
          animation: 'breathe 2.4s var(--ease) infinite',
        }}>
          FUEL<span style={{ color: 'var(--accent)' }}>D</span>
        </span>
      </div>
    )
  }

  return (
    <div className={`page ${styles.page}`}>
      <header className={styles.header}>
        <LogoHeader width={120} height={24} />
        <div className="row gap-10">
          {character && (() => {
            const rc = rankColor(character.rankTier)
            const t = character.rankTier
            const glow = 5 + t * 3.5
            const a = Math.round((0.22 + t * 0.1) * 255).toString(16).padStart(2, '0')
            return (
              <button
                className={styles.avatarBtn}
                onClick={() => navigate('/profile')}
                aria-label="Profile"
                style={{
                  borderColor: rc,
                  background: `radial-gradient(circle, ${rc}22, var(--bg-2) 70%)`,
                  boxShadow: `0 0 ${glow}px ${rc}${a}, inset 0 0 ${4 + t}px ${rc}22`,
                }}
              >
                <RankInsignia tier={character.rankTier} size={24} color={rc} />
              </button>
            )
          })()}
          <button className="btn-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
            <SettingsIcon width={20} height={20} />
          </button>
        </div>
      </header>

      <div className="px stack gap-20" style={{ gap: 28 }}>
        {isError && <p style={{ color: 'var(--danger)', fontSize: 14, padding: '24px 0' }}>Couldn't load your fighter.</p>}

        {character && (() => {
          const rc = rankColor(character.rankTier)
          return (
            <>
              <LevelUpOverlay character={character} />
              <StreakBreakOverlay character={character} />

              {/* 1. Fighter card */}
              <Reveal delay={0}><FighterCardCombat character={character} /></Reveal>
              <Reveal delay={50}><p className={styles.attitude} style={{ borderLeftColor: rc }}>{attitude(character)}</p></Reveal>

              {/* 2. Google Health — recovery + vitals */}
              {health && (health.steps || health.sleepHours || health.restingHeartRate) && (
                <Reveal delay={90}>
                  <HealthRings data={health} stepTarget={settings?.stepTarget ?? 10000} sleepTarget={settings?.sleepTarget ?? 8} accent={rc} />
                </Reveal>
              )}
              {/* 2a. Today's training — above resting HR / HRV vitals */}
              <Reveal delay={110}>
                <section>
                  <Eyebrow>Today's Training</Eyebrow>
                  <TodayTrainingCard />
                </section>
              </Reveal>

              {/* 3. Resting HR / HRV / cardio / weight vitals */}
              {health && (health.restingHeartRate || health.hrv || health.weightKg) && (
                <Reveal delay={120}><HealthStats data={health} accent={rc} /></Reveal>
              )}

              {/* 2b. Goal-weight journey (only when a goal is set) — below HR/HRV */}
              {journeyQ.data && (
                <Reveal delay={135}>
                  <button className="card" onClick={() => navigate('/body')}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: 18, borderLeft: `3px solid ${rc}`, border: `1px solid ${rc}2e` }}>
                    <div className="between" style={{ marginBottom: 12, alignItems: 'center' }}>
                      <span className="row gap-8" style={{ alignItems: 'center' }}>
                        <ScaleIcon width={15} height={15} style={{ color: rc }} />
                        <span className="t-eyebrow">{journeyQ.data.reached ? '🎯 Goal Reached' : `Journey to ${journeyQ.data.goalWeight}kg`}</span>
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: rc }}>{journeyQ.data.pct}%</span>
                    </div>

                    <div className="row" style={{ alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
                      <span style={{ fontFamily: 'var(--font-mega)', fontSize: 34, fontWeight: 600, color: 'var(--text-hi)', lineHeight: 0.9 }}>{journeyQ.data.currentWeight}</span>
                      <span style={{ fontSize: 14, color: 'var(--text-low)' }}>kg</span>
                      <span className="t-micro" style={{ marginLeft: 6, color: 'var(--text-low)' }}>· {Math.max(0, journeyQ.data.remainingKg)}kg to {journeyQ.data.losing ? 'lose' : 'gain'}</span>
                    </div>

                    <div style={{ height: 10, borderRadius: 'var(--r-pill)', background: 'var(--bg-3)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.max(journeyQ.data.pct, 1.5)}%`, background: rc, borderRadius: 'var(--r-pill)',
                        boxShadow: `0 0 12px ${rc}`, transition: 'width 700ms var(--ease)' }} />
                    </div>

                    <div className="between" style={{ marginTop: 8 }}>
                      <span className="t-micro" style={{ color: 'var(--text-low)' }}>{journeyQ.data.startWeight}kg start</span>
                      <span className="t-micro" style={{ color: rc }}>+{Math.floor(journeyQ.data.bestKg) * 150} XP earned</span>
                      <span className="t-micro" style={{ color: 'var(--text-low)' }}>{journeyQ.data.goalWeight}kg goal</span>
                    </div>
                  </button>
                </Reveal>
              )}

              {/* 4. Daily quests */}
              <Reveal delay={180}><QuestList quests={quests} accent={rc} types={['daily']} /></Reveal>

              {/* 5. Weekly + boss quests */}
              <Reveal delay={210}><QuestList quests={quests} accent={rc} types={['weekly', 'boss']} showSummary={false} /></Reveal>
            </>
          )
        })()}
      </div>

      <FAB onClick={() => navigate('/log')} label="Log fuel" />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
