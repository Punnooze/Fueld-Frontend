import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BottomNav } from './components/BottomNav'
import { ToastProvider } from './components/Toast'
import { Today } from './pages/Today'
import { LogFood } from './pages/LogFood'
import { Foods } from './pages/Foods'
import { Body } from './pages/Body'
import { Stats } from './pages/Stats'
import styles from './App.module.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 2 } },
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
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <div className={styles.app}>
            <ConnectingBanner />
            <main className={styles.main}>
              <Routes>
                <Route path="/" element={<Today />} />
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
    </QueryClientProvider>
  )
}
