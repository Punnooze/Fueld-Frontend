import { createContext, useContext, useState, useCallback, useRef } from 'react'
import styles from './Toast.module.css'

interface ToastMessage {
  id: number
  text: string
  type: 'success' | 'error'
}

interface ToastContextValue {
  showToast: (text: string, type?: 'success' | 'error') => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} })

export const useToast = () => useContext(ToastContext)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const counterRef = useRef(0)

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    const id = ++counterRef.current
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 2500)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className={styles.container}>
        {toasts.map(t => (
          <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
