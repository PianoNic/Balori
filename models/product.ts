import type { NutrientLevels } from './nutrient-levels';
import type { Nutriments } from './nutriments';

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
  nutrientLevels: NutrientLevels;
}

export type ProductResult =
  | { found: true; product: Product }
  | { found: false; barcode: string };
