// export const estimateBodyFat = (
//   waistIn: number,
//   neckIn: number,
//   heightCm: number
// ): number | null => {
//   if (!waistIn || !neckIn || !heightCm || waistIn <= neckIn) return null

//   // Convert cm to inches
//   const cmToInches = (cm: number) => cm / 2.54

//   const height = cmToInches(heightCm)
//   console.log("waist : ", waistIn, " neck : ", neckIn, " height : ", height);
//   const bf =
//     495 /
//     (1.0324 -
//       0.19077 * Math.log10(waistIn - neckIn) +
//       0.15456 * Math.log10(height)) -
//     450

//   return Math.round(Math.max(2, Math.min(50, bf)) * 10) / 10
// }





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

  const heightIn = heightCm / 2.54

  const bf =
    495 /
    (1.0324 -
      0.19077 * Math.log10(waistIn - neckIn) +
      0.15456 * Math.log10(heightIn)) -
    450

  // clamp realistic range
  return Math.round(Math.max(5, Math.min(45, bf)) * 10) / 10
}