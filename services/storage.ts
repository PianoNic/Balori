import type { DayLog, MealCategory, MealItem, NutritionGoals } from '@/models/meal-entry';
import type { Product } from '@/models/product';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PRODUCTS: 'products',
  GOALS: 'goals',
  dayLog: (date: string) => `daylog:${date}`,
} as const;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

async function writeJSON(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ── Products ──

export async function getProducts(): Promise<Product[]> {
  return readJSON<Product[]>(KEYS.PRODUCTS, []);
}

export async function saveProduct(product: Product): Promise<void> {
  const products = await getProducts();
  const index = products.findIndex((p) => p.barcode === product.barcode);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push(product);
  }
  await writeJSON(KEYS.PRODUCTS, products);
}

export async function deleteProduct(barcode: string): Promise<void> {
  const products = await getProducts();
  await writeJSON(KEYS.PRODUCTS, products.filter((p) => p.barcode !== barcode));
}

// ── Nutrition Goals ──

const DEFAULT_GOALS: NutritionGoals = { calories: 2000, protein: 150, carbs: 250, fat: 70 };

export async function getGoals(): Promise<NutritionGoals> {
  return readJSON<NutritionGoals>(KEYS.GOALS, DEFAULT_GOALS);
}

export async function setGoals(goals: NutritionGoals): Promise<void> {
  await writeJSON(KEYS.GOALS, goals);
}

export async function setGoal(key: keyof NutritionGoals, value: number): Promise<void> {
  const goals = await getGoals();
  goals[key] = value;
  await setGoals(goals);
}

// ── Day Logs (meals) ──

function emptyMeals(): Record<MealCategory, MealItem[]> {
  return { breakfast: [], lunch: [], dinner: [], snack: [] };
}

export async function getDayLog(date?: string): Promise<DayLog> {
  const d = date ?? todayKey();
  return readJSON<DayLog>(KEYS.dayLog(d), { date: d, meals: emptyMeals() });
}

export async function addMealItem(category: MealCategory, item: MealItem, date?: string): Promise<void> {
  const log = await getDayLog(date);
  log.meals[category].push(item);
  await writeJSON(KEYS.dayLog(log.date), log);
}

export async function removeMealItem(category: MealCategory, itemId: string, date?: string): Promise<void> {
  const log = await getDayLog(date);
  log.meals[category] = log.meals[category].filter((i) => i.id !== itemId);
  await writeJSON(KEYS.dayLog(log.date), log);
}

export async function getDayTotals(date?: string) {
  const log = await getDayLog(date);
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

// ── History ──

export async function getDayLogs(days: number): Promise<DayLog[]> {
  const logs: DayLog[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    logs.push(await getDayLog(key));
  }
  return logs;
}

// ── Helpers ──

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export async function updateMealItem(category: MealCategory, updatedItem: MealItem, date?: string): Promise<void> {
  const log = await getDayLog(date);
  const items = log.meals[category];
  const index = items.findIndex(i => i.id === updatedItem.id);
  if (index !== -1) {
    items[index] = updatedItem;
    await writeJSON(KEYS.dayLog(log.date), log);
  }
}