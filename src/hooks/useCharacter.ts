import { useQuery } from '@tanstack/react-query'
import { getCharacter, getRecords, type Character } from '../api/character'

export const CHARACTER_KEY = ['character']

export const useRecords = () =>
  useQuery({ queryKey: ['records'], queryFn: getRecords, staleTime: 5 * 60_000 })

// ponytail: TEMP rank preview. Set PREVIEW_TIER to 0..6 to force-view a rank,
// or null to use the real DB rank. Applied via `select` so it transforms even
// cached data instantly (no refetch). REMOVE before shipping.
const PREVIEW_TIER: number | null = null
const RANKS = [
  { name: 'RECRUIT', minLevel: 1 }, { name: 'SOLDIER', minLevel: 5 },
  { name: 'VETERAN', minLevel: 10 }, { name: 'WARRIOR', minLevel: 15 },
  { name: 'ELITE', minLevel: 25 }, { name: 'MASTER', minLevel: 40 },
  { name: 'APEX', minLevel: 60 },
]
const titleFor = (l: number) =>
  l < 5 ? 'THE UNTESTED' : l < 10 ? 'THE IRON APPRENTICE' : l < 15 ? 'THE GRINDER'
  : l < 25 ? 'THE RELENTLESS' : l < 40 ? 'THE DANGEROUS' : l < 60 ? 'THE UNBROKEN'
  : 'THE APEX PREDATOR'

const preview = (c: Character): Character => {
  if (PREVIEW_TIER == null) return c
  const r = RANKS[PREVIEW_TIER]
  const level = r.minLevel + 2
  return { ...c, rankTier: PREVIEW_TIER, rank: r.name, level, title: titleFor(level) }
}

export const useCharacter = () =>
  useQuery({ queryKey: CHARACTER_KEY, queryFn: getCharacter, staleTime: 60_000, select: preview })
