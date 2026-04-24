import { createMMKV } from 'react-native-mmkv';
import type { Product } from '@/models/product';
import type { MealCategory, MealItem, DayLog, NutritionGoals } from '@/models/meal-entry';

const mmkv = createMMKV({ id: 'balori' });

const KEYS = {
  PRODUCTS: 'products',
  GOALS: 'goals',
  dayLog: (date: string) => `daylog:${date}`,
} as const;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function readJSON<T>(key: string, fallback: T): T {
  const raw = mmkv.getString(key);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

function writeJSON(key: string, value: unknown): void {
  mmkv.set(key, JSON.stringify(value));
}

// ── Products ──

export function getProducts(): Product[] {
  return readJSON<Product[]>(KEYS.PRODUCTS, []);
}

export function getProductByBarcode(barcode: string): Product | undefined {
  return getProducts().find((p) => p.barcode === barcode);
}

export function saveProduct(product: Product): void {
  const products = getProducts();
  const index = products.findIndex((p) => p.barcode === product.barcode);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  writeJSON(KEYS.PRODUCTS, products);
}

export function deleteProduct(barcode: string): void {
  writeJSON(KEYS.PRODUCTS, getProducts().filter((p) => p.barcode !== barcode));
}

// ── Nutrition Goals ──

const DEFAULT_GOALS: NutritionGoals = { calories: 2000, protein: 150, carbs: 250, fat: 70 };

export function getGoals(): NutritionGoals {
  return readJSON<NutritionGoals>(KEYS.GOALS, DEFAULT_GOALS);
}

export function setGoals(goals: NutritionGoals): void {
  writeJSON(KEYS.GOALS, goals);
}

export function setGoal(key: keyof NutritionGoals, value: number): void {
  const goals = getGoals();
  goals[key] = value;
  setGoals(goals);
}

// ── Day Logs (meals) ──

function emptyMeals(): Record<MealCategory, MealItem[]> {
  return { breakfast: [], lunch: [], dinner: [], snack: [] };
}

export function getDayLog(date?: string): DayLog {
  const d = date ?? todayKey();
  return readJSON<DayLog>(KEYS.dayLog(d), { date: d, meals: emptyMeals() });
}

export function addMealItem(category: MealCategory, item: MealItem, date?: string): void {
  const log = getDayLog(date);
  log.meals[category].push(item);
  writeJSON(KEYS.dayLog(log.date), log);
}

export function removeMealItem(category: MealCategory, itemId: string, date?: string): void {
  const log = getDayLog(date);
  log.meals[category] = log.meals[category].filter((i) => i.id !== itemId);
  writeJSON(KEYS.dayLog(log.date), log);
}

export function getDayTotals(date?: string) {
  const log = getDayLog(date);
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const items of Object.values(log.meals)) {
    for (const item of items) {
      calories += item.kcal;
      protein += item.protein;
      carbs += item.carbs;
      fat += item.fat;
    }
  }
  return { calories, protein, carbs, fat };
}

export function getMealTotals(category: MealCategory, date?: string) {
  const log = getDayLog(date);
  const items = log.meals[category];
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const item of items) {
    calories += item.kcal;
    protein += item.protein;
    carbs += item.carbs;
    fat += item.fat;
  }
  return { calories, protein, carbs, fat };
}

// ── History ──

export function getDayLogs(days: number): DayLog[] {
  const logs: DayLog[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    logs.push(getDayLog(key));
  }
  return logs;
}

// ── Helpers ──

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function clearAll(): void {
  mmkv.clearAll();
}
