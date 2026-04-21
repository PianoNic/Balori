import { mapProduct } from '@/mappers/product-mapper';
import type { ProductResult } from '@/models/product';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

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
