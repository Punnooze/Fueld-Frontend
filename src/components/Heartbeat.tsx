interface Props {
  decaying?: boolean
  height?: number
}

// Scrolling ECG waveform — the fighter's pulse. Steady green when healthy,
// weak red when decaying.
export const Heartbeat = ({ decaying = false, height = 34 }: Props) => {
  const color = decaying ? 'var(--danger)' : 'var(--accent)'
  // one 100-wide segment: flat → QRS spike → flat, repeated for a seamless loop
  const seg = decaying
    ? 'M0 20 H44 l3 -4 l3 7 l4 -3 H100'
    : 'M0 20 H34 l3 -14 l3 24 l4 -12 l3 4 H100'
  const speed = decaying ? '3.4s' : '1.9s'

  return (
    <div style={{ width: '100%', height, overflow: 'hidden', opacity: decaying ? 0.7 : 1 }} aria-hidden>
      <svg width="100%" height={height} viewBox="0 0 200 40" preserveAspectRatio="none"
        style={{ display: 'block', filter: `drop-shadow(0 0 5px ${color})` }}>
        <g>
          <path d={seg} fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
          <path d={seg} transform="translate(100 0)" fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
          <animateTransform
            attributeName="transform" type="translate"
            from="0 0" to="-100 0" dur={speed} repeatCount="indefinite"
          />
        </g>
      </svg>
    </div>
  )
}
