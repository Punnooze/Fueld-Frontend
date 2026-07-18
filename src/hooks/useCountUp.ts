import { useEffect, useRef, useState } from 'react'

/** Animates from the previous value to `target` with ease-out cubic. */
export function useCountUp(target: number, duration = 800): number {
  const [val, setVal] = useState(target)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (from === target) return
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(from + (target - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return val
}
