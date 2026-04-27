export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealItem {
  id: string;
  name: string;
  amountGrams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayLog {
  date: string;
  meals: Record<MealCategory, MealItem[]>;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
