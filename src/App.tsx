import { useState, useEffect, useRef, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { BottomNav } from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Variants } from './pages/Variants'
import { Today } from './pages/Today'
import { Gym } from './pages/Gym'
import { LogFood } from './pages/LogFood'
import { Foods } from './pages/Foods'
import { Body } from './pages/Body'
import { Stats } from './pages/Stats'
import styles from './App.module.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24, // keep 24h so persisted cache survives
      retry: 2,
    },
  },
})

// Persist the whole query cache to sessionStorage → survives reloads within the
// tab session, so Google/Hevy/character aren't refetched on every open.
const persister = createSyncStoragePersister({
  storage: window.sessionStorage,
  key: 'fueld-qcache',
})

// Swipe left/right between the 5 main tabs
const TABS = ['/', '/fuel', '/gym', '/body', '/stats']
const SwipeTabs = ({ children }: { children: ReactNode }) => {
  const nav = useNavigate()
  const loc = useLocation()
  const start = useRef<{ x: number; y: number } | null>(null)

  const onStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    start.current = { x: t.clientX, y: t.clientY }
  }
  const onEnd = (e: React.TouchEvent) => {
    if (!start.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.current.x
    const dy = t.clientY - start.current.y
    start.current = null
    // horizontal, decisive swipe only
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.8) return
    const i = TABS.indexOf(loc.pathname)
    if (i === -1) return
    if (dx < 0 && i < TABS.length - 1) nav(TABS[i + 1])
    else if (dx > 0 && i > 0) nav(TABS[i - 1])
  }
  return <div onTouchStart={onStart} onTouchEnd={onEnd} style={{ minHeight: '100%' }}>{children}</div>
}

const ConnectingBanner = () => {
  const [show, setShow] = useState(true)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const unsub = queryClient.getQueryCache().subscribe(event => {
      if (event.type === 'updated' && event.query.state.status === 'success') {
        setConnected(true)
        setTimeout(() => setShow(false), 800)
      }
    })
    const timer = setTimeout(() => setShow(false), 10_000)
    return () => { unsub(); clearTimeout(timer) }
  }, [])

  if (!show) return null
  return (
    <div className={`${styles.banner} ${connected ? styles.bannerConnected : ''}`}>
      {connected ? 'Connected' : 'Connecting…'}
    </div>
  )
}

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: 1000 * 60 * 60 * 24 }}
    >
      <ToastProvider>
        <BrowserRouter>
          <div className={styles.app}>
            <ConnectingBanner />
            <main className={styles.main}>
              <SwipeTabs>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/variants" element={<Variants />} />
                <Route path="/fuel" element={<Today />} />
                <Route path="/gym" element={<Gym />} />
                <Route path="/log" element={<LogFood />} />
                <Route path="/foods" element={<Foods />} />
                <Route path="/body" element={<Body />} />
                <Route path="/stats" element={<Stats />} />
              </Routes>
              </SwipeTabs>
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </PersistQueryClientProvider>
  )
}
