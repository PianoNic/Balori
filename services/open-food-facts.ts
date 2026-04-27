import type { ProductResult } from '@/models/product';
import { mapApiProduct } from './mappers';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

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

  return {
    found: true,
    barcode,
    product: mapApiProduct(barcode, data.product),
  };
}
