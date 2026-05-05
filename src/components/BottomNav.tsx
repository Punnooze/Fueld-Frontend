import { NavLink } from 'react-router-dom'
import { TodayIcon, LogIcon, MealsIcon, BodyIcon, StatsIcon } from '../assets/icons'
import styles from './BottomNav.module.css'

const tabs = [
  { to: '/',      label: 'Today', Icon: TodayIcon },
  { to: '/log',   label: 'Log',   Icon: LogIcon   },
  { to: '/foods', label: 'Meals', Icon: MealsIcon  },
  { to: '/body',  label: 'Body',  Icon: BodyIcon   },
  { to: '/stats', label: 'Stats', Icon: StatsIcon  },
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
