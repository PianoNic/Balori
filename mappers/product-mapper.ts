import type { Product } from '@/models/product';

function toNumber(rawValue: unknown): number | null {
  return typeof rawValue === 'number' && !isNaN(rawValue) ? rawValue : null;
}

export function mapApiProduct(barcode: string, raw: Record<string, unknown>): Product {
  const rawNutriments = (raw.nutriments as Record<string, unknown>) ?? {};
  return {
    barcode,
    name: (raw.product_name as string) || null,
    imageUrl: (raw.image_front_url as string) || null,
    nutriments: {
      energyKcal100g: toNumber(rawNutriments['energy-kcal_100g']),
      proteins100g: toNumber(rawNutriments.proteins_100g),
      carbohydrates100g: toNumber(rawNutriments.carbohydrates_100g),
      fat100g: toNumber(rawNutriments.fat_100g),
    },
  };
}
