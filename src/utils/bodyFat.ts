export const estimateBodyFat = (
  waistIn: number,
  neckIn: number,
  heightCm: number
): number | null => {
  if (
    !waistIn ||
    !neckIn ||
    !heightCm ||
    waistIn <= neckIn ||
    waistIn < 20 ||
    neckIn < 10 ||
    heightCm < 100
  ) return null

  // Convert inches → cm (formula expects cm)
  const IN_TO_CM = 2.54
  const waistCm = waistIn * IN_TO_CM
  const neckCm = neckIn * IN_TO_CM

  // US Navy formula (direct % version)
  const bf =
    86.010 * Math.log10(waistCm - neckCm) -
    70.041 * Math.log10(heightCm) +
    36.76

  // Clamp + round
  return Math.round(Math.max(5, Math.min(45, bf)) * 10) / 10
}