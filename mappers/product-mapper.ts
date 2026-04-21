import type { NutrientLevels } from '@/models/nutrient-levels';
import type { Nutriments } from '@/models/nutriments';
import type { Product } from '@/models/product';

function num(value: unknown): number | null {
  return typeof value === 'number' && !isNaN(value) ? value : null;
}

export function mapNutriments(raw: Record<string, any>): Nutriments {
  return {
    energyKcal100g: num(raw['energy-kcal_100g']),
    proteins100g: num(raw.proteins_100g),
    carbohydrates100g: num(raw.carbohydrates_100g),
    fat100g: num(raw.fat_100g),
    saturatedFat100g: num(raw['saturated-fat_100g']),
    sugars100g: num(raw.sugars_100g),
    fiber100g: num(raw.fiber_100g),
    salt100g: num(raw.salt_100g),
    sodium100g: num(raw.sodium_100g),
  };
}

export function mapNutrientLevels(raw: Record<string, any>): NutrientLevels {
  return {
    fat: raw.fat || null,
    saturatedFat: raw['saturated-fat'] || null,
    sugars: raw.sugars || null,
    salt: raw.salt || null,
  };
}

export function mapProduct(barcode: string, raw: Record<string, any>): Product {
  return {
    barcode,
    name: raw.product_name || null,
    brand: raw.brands || null,
    quantity: raw.quantity || null,
    categories: raw.categories_tags ?? [],
    imageUrl: raw.image_front_url || null,
    imageThumbnailUrl: raw.image_front_small_url || null,
    nutriments: mapNutriments(raw.nutriments ?? {}),
    nutriScore: raw.nutriscore_grade || null,
    novaGroup: num(raw.nova_group),
    nutrientLevels: mapNutrientLevels(raw.nutrient_levels ?? {}),
  };
}
