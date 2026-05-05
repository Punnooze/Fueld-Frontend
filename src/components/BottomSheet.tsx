import { useEffect, useRef } from 'react'
import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const BottomSheet = ({ open, onClose, title, children }: Props) => {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: TouchEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('touchstart', handler)
    return () => document.removeEventListener('touchstart', handler)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`} onClick={onClose} />
      <div className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`} ref={sheetRef}>
        <div className={styles.handle} />
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.content}>{children}</div>
      </div>
    </>
  )
}
