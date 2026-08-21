import { UserProfile } from '@/types';

/**
 * 科学计算基础代谢率 (Mifflin-St Jeor 公式)
 */
export function calculateBMR(gender: 'male' | 'female', weightKg: number, heightCm: number, age: number): number {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  } else {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
  }
}

/**
 * 计算全天总消耗能量 (TDEE = BMR * 活动系数)
 */
export function calculateTDEE(bmr: number, activityLevel: number): number {
  return Math.round(bmr * activityLevel);
}

/**
 * 根据当前时间（一天24小时流逝进度）计算实时已消耗的自然代谢
 */
export function calculateLiveBurnedCalories(tdee: number): number {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const fractionOfDay = (hours * 60 + minutes) / (24 * 60);
  
  return Math.round(tdee * fractionOfDay);
}

export const DEFAULT_PROFILE: UserProfile = {
  gender: 'male',
  age: 26,
  height_cm: 175,
  weight_kg: 68.5,
  target_weight_kg: 62.0,
  activity_level: 1.375,
  target_deficit_kcal: 400,
  openrouter_key: '',
  preferred_model: 'google/gemini-2.5-flash'
};
