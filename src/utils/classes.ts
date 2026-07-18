export interface ClassTheme {
  name: string
  color: string
  dim: string
  blurb: string
  perk: string
}

// Each fighter class has its own identity colour + persona.
export const CLASS_THEMES: Record<string, ClassTheme> = {
  Powerlifter: {
    name: 'Powerlifter',
    color: '#FF6B4A',
    dim: 'rgba(255,107,74,0.14)',
    blurb: 'Gym-dominant. You live under the bar.',
    perk: 'Volume multipliers hit harder — heavy sessions pay more XP.',
  },
  Hybrid: {
    name: 'Hybrid',
    color: '#C8F135',
    dim: 'rgba(200,241,53,0.14)',
    blurb: 'Iron and fuel in balance. The complete fighter.',
    perk: 'No weak side. Steady XP from every discipline.',
  },
  'Endurance Fighter': {
    name: 'Endurance Fighter',
    color: '#3DD6C4',
    dim: 'rgba(61,214,196,0.14)',
    blurb: 'Nutrition-disciplined. Built to outlast.',
    perk: 'Streaks run deeper — consistency bonuses compound.',
  },
  'All-Rounder': {
    name: 'All-Rounder',
    color: '#F2C94C',
    dim: 'rgba(242,201,76,0.16)',
    blurb: 'Everything logged, nothing skipped.',
    perk: 'Mastery of all — quests across every category count double toward class.',
  },
}

export const getClassTheme = (name: string): ClassTheme =>
  CLASS_THEMES[name] ?? CLASS_THEMES.Hybrid
