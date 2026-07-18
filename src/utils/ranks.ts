// Mirrors backend src/character/character.constants.ts
export const RANKS = [
  { name: 'RECRUIT', minLevel: 1 },
  { name: 'SOLDIER', minLevel: 5 },
  { name: 'VETERAN', minLevel: 10 },
  { name: 'WARRIOR', minLevel: 15 },
  { name: 'ELITE', minLevel: 25 },
  { name: 'MASTER', minLevel: 40 },
  { name: 'APEX', minLevel: 60 },
] as const

export const CLASSES = ['Powerlifter', 'Hybrid', 'Endurance Fighter', 'All-Rounder'] as const

// Per-rank identity colour, escalating steel → gold as you climb.
export const RANK_COLORS = [
  '#9BA199', // RECRUIT — steel
  '#7FB069', // SOLDIER — olive
  '#4FA3C9', // VETERAN — steel blue
  '#C8F135', // WARRIOR — lime
  '#B06BFF', // ELITE — violet
  '#FF8A3D', // MASTER — ember
  '#FFC93C', // APEX — gold
] as const

export const rankColor = (tier: number): string =>
  RANK_COLORS[Math.max(0, Math.min(tier, RANK_COLORS.length - 1))]

/**
 * Continuous progression scalar (0..RANKS.length) for the evolving avatar.
 * = decay-adjusted rank tier + fraction of the way to the next rank's level.
 * Decay lowers rankTier → power drops → gear is shed.
 */
export function rankPower(level: number, rankTier: number): number {
  const curMin = RANKS[rankTier]?.minLevel ?? 1
  const nextMin = RANKS[rankTier + 1]?.minLevel ?? curMin + 20
  const frac = Math.max(0, Math.min(1, (level - curMin) / (nextMin - curMin)))
  return rankTier + frac
}

export const CLASS_BLURB: Record<string, string> = {
  Powerlifter: 'Gym-dominant. You live under the bar.',
  Hybrid: 'Iron and fuel in balance. The complete fighter.',
  'Endurance Fighter': 'Nutrition-disciplined. Built to outlast.',
  'All-Rounder': 'Everything logged, nothing skipped.',
}
