// US Navy method — all measurements in cm
export const estimateBodyFat = (
  waist: number,
  neck: number,
  heightCm: number
): number | null => {
  if (!waist || !neck || !heightCm || waist <= neck) return null
  const bf = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(heightCm)) - 450
  return Math.round(Math.max(2, Math.min(50, bf)) * 10) / 10
}
