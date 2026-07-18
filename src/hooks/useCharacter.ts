import { useQuery } from '@tanstack/react-query'
import { getCharacter } from '../api/character'

export const CHARACTER_KEY = ['character']

export const useCharacter = () =>
  useQuery({ queryKey: CHARACTER_KEY, queryFn: getCharacter, staleTime: 15_000 })
