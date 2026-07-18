import { NavLink } from 'react-router-dom'
import { TrophyIcon, ForkIcon, DumbbellIcon, BodyIcon, StatsIcon } from '../assets/icons'
import styles from './BottomNav.module.css'

const tabs = [
  { to: '/',      label: 'Home', Icon: TrophyIcon   },
  { to: '/fuel',  label: 'Fuel', Icon: ForkIcon     },
  { to: '/gym',   label: 'Gym',  Icon: DumbbellIcon },
  { to: '/body',  label: 'Body', Icon: BodyIcon     },
  { to: '/stats', label: 'Stats', Icon: StatsIcon   },
]

export const BottomNav = () => (
  <nav className={styles.nav}>
    {tabs.map(({ to, label, Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
      >
        {({ isActive }) => (
          <>
            {isActive && <span className={styles.indicator} />}
            <Icon width={20} height={20} />
            <span className={styles.label}>{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
)
