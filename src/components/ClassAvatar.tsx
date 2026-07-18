interface Props {
  className: string // fighter class name
  size?: number
  color?: string
}

// Distinct stroke persona per fighter class. currentColor-driven so it themes.
export const ClassAvatar = ({ className, size = 56, color = 'currentColor' }: Props) => {
  const common = {
    width: size, height: size, viewBox: '0 0 64 64', fill: 'none',
    stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (className) {
    case 'Powerlifter':
      return (
        <svg {...common} aria-hidden>
          <circle cx="32" cy="14" r="6" />
          <path d="M32 20 V34" />
          <path d="M14 28 H50" />{/* bar */}
          <rect x="10" y="23" width="5" height="10" rx="1" />
          <rect x="49" y="23" width="5" height="10" rx="1" />
          <path d="M32 34 L22 52 M32 34 L42 52" />{/* wide stance */}
        </svg>
      )
    case 'Endurance Fighter':
      return (
        <svg {...common} aria-hidden>
          <circle cx="38" cy="14" r="6" />
          <path d="M38 20 L30 34 L40 40" />{/* leaning torso */}
          <path d="M30 34 L20 40 M40 40 L46 52 M30 40 L24 54" />{/* running legs/arm */}
          <path d="M8 20 H18 M6 30 H14 M10 40 H16" opacity="0.6" />{/* speed lines */}
        </svg>
      )
    case 'All-Rounder':
      return (
        <svg {...common} aria-hidden>
          <path d="M32 4 L38 24 L58 24 L42 37 L48 58 L32 45 L16 58 L22 37 L6 24 L26 24 Z" opacity="0.5" />
          <circle cx="32" cy="26" r="5" />
          <path d="M32 31 V42 M25 36 H39 M32 42 L27 52 M32 42 L37 52" />
        </svg>
      )
    default: // Hybrid
      return (
        <svg {...common} aria-hidden>
          <circle cx="32" cy="14" r="6" />
          <path d="M32 20 V40 M32 40 L26 54 M32 40 L38 54" />
          <path d="M32 26 L20 32" />{/* dumbbell arm */}
          <rect x="14" y="29" width="6" height="7" rx="1" />
          <path d="M32 26 L44 32" />{/* fuel arm */}
          <circle cx="46" cy="33" r="4" />
        </svg>
      )
  }
}
