import { mapApiProduct } from '../mappers/product-mapper';

describe('product-mapper', () => {
  it('sollte ein valides API Objekt korrekt mappen (Positivtest)', () => {
    const rawApiData = {
      product_name: 'Haferflocken',
      brands: 'BioBrand',
      image_front_url: 'https://example.com/image.png',
      nutriments: {
        'energy-kcal_100g': 370,
        'proteins_100g': 13.5,
        'carbohydrates_100g': 58.7,
        'fat_100g': 7.0,
      }
    };

    const result = mapApiProduct('7613036239933', rawApiData);

    expect(result.barcode).toBe('7613036239933');
    expect(result.name).toBe('Haferflocken');
    expect(result.brand).toBe('BioBrand');
    expect(result.nutriments.energyKcal100g).toBe(370);
    expect(result.nutriments.proteins100g).toBe(13.5);
  });

  it('sollte mit fehlenden oder falschen Datentypen fehlerfrei umgehen (Negativtest)', () => {
    const rawApiData = {
      product_name: '', 
      nutriments: {
        'energy-kcal_100g': 'ungültig', 
        'proteins_100g': null,
      }
    };

    const result = mapApiProduct('12345', rawApiData);

    expect(result.name).toBeNull();
    expect(result.brand).toBeNull();
    expect(result.nutriments.energyKcal100g).toBeNull(); 
    expect(result.nutriments.proteins100g).toBeNull();
  });
});