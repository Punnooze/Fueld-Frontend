import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './BottomSheet.module.css'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export const BottomSheet = ({ open, onClose, title, children }: Props) => {
  // lock body scroll while open (outside-tap close handled by the overlay onClick)
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  return createPortal(
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayVisible : ''}`} onClick={onClose} />
      <div
        className={`${styles.sheet} ${open ? styles.sheetOpen : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.content}>{children}</div>
      </div>
    </>,
    document.body,
  )
}
