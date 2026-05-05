import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'

const TodayIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

const LogIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="16"/>
    <line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)

const FoodsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
  </svg>
)

const BodyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v8"/>
    <path d="M8 9l4 1 4-1"/>
    <path d="M10 22l2-7 2 7"/>
  </svg>
)

const StatsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
)

const tabs = [
  { to: '/',      label: 'Today', Icon: TodayIcon },
  { to: '/log',   label: 'Log',   Icon: LogIcon },
  { to: '/foods', label: 'Meals', Icon: FoodsIcon },
  { to: '/body',  label: 'Body',  Icon: BodyIcon },
  { to: '/stats', label: 'Stats', Icon: StatsIcon },
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
        <Icon />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
)
