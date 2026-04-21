import type { ProductResult } from '@/models/product';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

function num(value: unknown): number | null {
  return typeof value === 'number' && !isNaN(value) ? value : null;
}

export async function getProductByBarcode(barcode: string): Promise<ProductResult> {
  const url = `${BASE_URL}/${encodeURIComponent(barcode)}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    return { found: false, barcode, product: null };
  }

  const data = await response.json();

  if (data.status !== 1 || !data.product) {
    return { found: false, barcode, product: null };
  }

  const raw = data.product;
  const n = raw.nutriments ?? {};
  const levels = raw.nutrient_levels ?? {};

  return {
    found: true,
    barcode,
    product: {
      barcode,
      name: raw.product_name || null,
      brand: raw.brands || null,
      quantity: raw.quantity || null,
      categories: raw.categories_tags ?? [],
      imageUrl: raw.image_front_url || null,
      imageThumbnailUrl: raw.image_front_small_url || null,
      nutriments: {
        energyKcal100g: num(n['energy-kcal_100g']),
        proteins100g: num(n.proteins_100g),
        carbohydrates100g: num(n.carbohydrates_100g),
        fat100g: num(n.fat_100g),
        saturatedFat100g: num(n['saturated-fat_100g']),
        sugars100g: num(n.sugars_100g),
        fiber100g: num(n.fiber_100g),
        salt100g: num(n.salt_100g),
        sodium100g: num(n.sodium_100g),
      },
      nutriScore: raw.nutriscore_grade || null,
      novaGroup: num(raw.nova_group),
      nutrientLevels: {
        fat: levels.fat || null,
        saturatedFat: levels['saturated-fat'] || null,
        sugars: levels.sugars || null,
        salt: levels.salt || null,
      },
    },
  };
}
