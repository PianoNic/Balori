import type { Product } from '@/models/product';

function num(value: unknown): number | null {
  return typeof value === 'number' && !isNaN(value) ? value : null;
}

export function mapApiProduct(barcode: string, raw: Record<string, unknown>): Product {
  const n = (raw.nutriments as Record<string, unknown>) ?? {};
  return {
    barcode,
    name: (raw.product_name as string) || null,
    brand: (raw.brands as string) || null,
    imageUrl: (raw.image_front_url as string) || null,
    nutriments: {
      energyKcal100g: num(n['energy-kcal_100g']),
      proteins100g: num(n.proteins_100g),
      carbohydrates100g: num(n.carbohydrates_100g),
      fat100g: num(n.fat_100g),
    },
  };
}
