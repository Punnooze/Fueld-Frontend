import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCharacter } from '../hooks/useCharacter'
import { FighterCard } from '../components/FighterCard'
import { FighterCardCombat } from '../components/FighterCardCombat'
import { FighterCardTerminal } from '../components/FighterCardTerminal'
import { RankAvatar } from '../components/RankAvatar'
import { Eyebrow } from '../components/ui/Eyebrow'
import { RANKS } from '../utils/ranks'
import { ChevronRightIcon } from '../assets/icons'

export const Variants = () => {
  const navigate = useNavigate()
  const { data: c } = useCharacter()
  const [power, setPower] = useState(0)

  const tier = Math.min(Math.floor(power), RANKS.length - 1)

  return (
    <div className="page">
      <header className="page-header between">
        <button className="btn-icon" onClick={() => navigate(-1)} aria-label="Back">
          <ChevronRightIcon width={20} height={20} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, letterSpacing: '0.3em', color: 'var(--text-mid)' }}>
          VARIANTS
        </span>
        <span style={{ width: 32 }} />
      </header>

      <div className="px stack gap-24">
        {/* ── Evolving avatar scrubber ── */}
        <section>
          <Eyebrow right={`power ${power.toFixed(2)}`}>Rank Avatar — drag to evolve</Eyebrow>
          <div className="card stack gap-16" style={{ alignItems: 'center' }}>
            <RankAvatar power={power} size={200} color="var(--accent)" />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '0.18em', color: 'var(--accent)' }}>
              {RANKS[tier].name}
            </span>
            <input
              type="range" min={0} max={RANKS.length - 1} step={0.02} value={power}
              onChange={e => setPower(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent)' }}
            />
            <div className="row" style={{ width: '100%', justifyContent: 'space-between' }}>
              {RANKS.map(r => (
                <span key={r.name} className="t-micro" style={{ color: 'var(--text-low)', fontSize: 8 }}>{r.name.slice(0, 3)}</span>
              ))}
            </div>
            <span className="t-meta" style={{ color: 'var(--text-mid)', textAlign: 'center' }}>
              Gear builds in as you approach the next rank. Decay drops your tier → gear falls off.
            </span>
          </div>
        </section>

        {!c ? (
          <div className="skeleton-row" style={{ height: 300, borderRadius: 'var(--r-card)' }} />
        ) : (
          <>
            <section>
              <Eyebrow>01 · Combat Card</Eyebrow>
              <FighterCardCombat character={c} />
            </section>
            <section>
              <Eyebrow>02 · Terminal HUD</Eyebrow>
              <FighterCardTerminal character={c} />
            </section>
            <section>
              <Eyebrow>00 · Current (Dossier)</Eyebrow>
              <FighterCard character={c} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
