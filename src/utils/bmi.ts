export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese'

export const calcBMI = (weight: number, heightCm: number): number => {
  const h = heightCm / 100
  return Math.round((weight / (h * h)) * 10) / 10
}

export const getBMICategory = (bmi: number): BMICategory => {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

export const BMI_LABELS: Record<BMICategory, string> = {
  underweight: 'Underweight',
  normal: 'Normal',
  overweight: 'Overweight',
  obese: 'Obese',
}

export const BMI_COLORS: Record<BMICategory, string> = {
  underweight: '#4d9fff',
  normal: '#c8f135',
  overweight: '#ff9f4d',
  obese: '#ff4d4d',
}
