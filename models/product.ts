import type { Nutriments } from './nutriments';

export interface Product {
  barcode: string;
  name: string | null;
  brand: string | null;
  imageUrl: string | null;
  nutriments: Nutriments;
}

export interface ProductResult {
  found: boolean;
  barcode: string;
  product: Product | null;
}
