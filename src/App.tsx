import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
            </main>
            <BottomNav />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </PersistQueryClientProvider>
  )
}
