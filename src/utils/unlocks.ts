export interface Unlock {
  level: number
  title: string
  desc: string
}

// Features / cosmetics earned as you climb. Motivating goals, shown on Home.
export const UNLOCKS: Unlock[] = [
  { level: 2, title: 'Combat Log', desc: 'Full XP history feed' },
  { level: 3, title: 'Weekly Quests', desc: 'Bigger 7-day objectives' },
  { level: 5, title: 'Rank: Soldier', desc: 'First promotion + insignia' },
  { level: 7, title: 'Pulsing Flame', desc: 'Streak fire starts to breathe' },
  { level: 10, title: 'Boss Quests', desc: '30-day war campaigns' },
  { level: 14, title: 'Crowned Streak', desc: 'Flame earns a crown' },
  { level: 15, title: 'Rank: Warrior', desc: 'Third-tier insignia' },
  { level: 25, title: 'Rank: Elite', desc: 'Apex-track insignia' },
  { level: 30, title: 'Gold Flame', desc: 'Streak burns gold' },
  { level: 40, title: 'Rank: Master', desc: 'Sixth-tier insignia' },
  { level: 60, title: 'Rank: Apex', desc: 'The predator mark' },
]

export const nextUnlock = (level: number): Unlock | undefined =>
  UNLOCKS.find(u => u.level > level)
