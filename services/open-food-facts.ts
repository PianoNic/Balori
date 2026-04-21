const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

export interface Nutriments {
  energyKcal100g: number | null;
  proteins100g: number | null;
  carbohydrates100g: number | null;
  fat100g: number | null;
  saturatedFat100g: number | null;
  sugars100g: number | null;
  fiber100g: number | null;
  salt100g: number | null;
  sodium100g: number | null;
}

export interface Product {
  barcode: string;
  name: string | null;
  brand: string | null;
  quantity: string | null;
  categories: string[];
  imageUrl: string | null;
  imageThumbnailUrl: string | null;
  nutriments: Nutriments;
  nutriScore: string | null;
  novaGroup: number | null;
  nutrientLevels: {
    fat: string | null;
    saturatedFat: string | null;
    sugars: string | null;
    salt: string | null;
  };
}

export type ProductResult =
  | { found: true; product: Product }
  | { found: false; barcode: string };

function num(value: unknown): number | null {
  return typeof value === 'number' && !isNaN(value) ? value : null;
}

function mapProduct(barcode: string, raw: Record<string, any>): Product {
  const n = raw.nutriments ?? {};
  const levels = raw.nutrient_levels ?? {};

  return {
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
  };
}

export async function getProductByBarcode(barcode: string): Promise<ProductResult> {
  const url = `${BASE_URL}/${encodeURIComponent(barcode)}.json`;
  const response = await fetch(url);

  if (!response.ok) {
    return { found: false, barcode };
  }

  const data = await response.json();

  if (data.status !== 1 || !data.product) {
    return { found: false, barcode };
  }

  return { found: true, product: mapProduct(barcode, data.product) };
}
