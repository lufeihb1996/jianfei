export type Gender = 'male' | 'female';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Ingredient {
  name: string;
  weight: string;
  calories: number;
}

export interface FoodAnalysisResult {
  food_name: string;
  emoji: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: Ingredient[];
  ai_advice: string;
  confidence: number;
}

export interface UserProfile {
  gender: Gender;
  age: number;
  height_cm: number;
  weight_kg: number;
  target_weight_kg: number;
  activity_level: number; // 1.2, 1.375, 1.55, 1.725
  target_deficit_kcal: number;
  openrouter_key: string;
  preferred_model: string;
}

export interface MealRecord {
  id: string;
  meal_type: MealType;
  food_name: string;
  emoji: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  ingredients: Ingredient[];
  ai_advice: string;
  eaten_at: string;
}
