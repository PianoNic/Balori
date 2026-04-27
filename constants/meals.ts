import type { MealCategory } from '@/models/meal-entry';

export const MEAL_META: Record<MealCategory, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: 'coffee' },
  lunch: { label: 'Lunch', icon: 'food-apple' },
  dinner: { label: 'Dinner', icon: 'food-variant' },
  snack: { label: 'Snack', icon: 'cookie' },
};
