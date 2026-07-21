import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacter } from '../hooks/useCharacter'
import { useXp } from '../hooks/useXp'
import { FighterCardCombat } from '../components/FighterCardCombat'
import { BadgeGrid } from '../components/BadgeGrid'
import { CharacterPanels } from '../components/CharacterPanels'
import { SettingsModal } from '../components/SettingsModal'
import { Reveal } from '../components/Reveal'
import { ChevronRightIcon, SettingsIcon } from '../assets/icons'

export const Profile = () => {
  const navigate = useNavigate()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { data: c, isLoading } = useCharacter()
  const { data: events = [] } = useXp(100)

  return (
    <div className="page">
      <header className="page-header between" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(10,11,10,0.82)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--line-soft)' }}>
        <button className="btn-icon" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronRightIcon width={20} height={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.3em', color: 'var(--text-mid)' }}>PROFILE</span>
        <button className="btn-icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          <SettingsIcon width={20} height={20} />
        </button>
      </header>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {isLoading || !c ? (
        <div className="px" style={{ marginTop: 16 }}>
          <div className="skeleton-row" style={{ height: 300, borderRadius: 'var(--r-card)' }} />
        </div>
      ) : (
        <div className="px stack gap-24" style={{ marginTop: 16 }}>
          <Reveal><FighterCardCombat character={c} /></Reveal>
          <Reveal><BadgeGrid events={events} /></Reveal>
          <CharacterPanels character={c} events={events} />
        </div>
      )}
    </div>
  )
}
