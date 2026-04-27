import { render } from '@testing-library/react-native';
import React from 'react';
import { PaperProvider } from 'react-native-paper';
import { MealCard } from '../components/MealCard';

describe('<MealCard />', () => {
  it('rendert eine MealCard mit Items korrekt (Snapshot)', () => {
    const items = [
      { id: '1', name: 'Haferflocken', amountGrams: 80, kcal: 296, protein: 11, carbs: 47, fat: 6 },
      { id: '2', name: 'Banane', amountGrams: 120, kcal: 107, protein: 1, carbs: 27, fat: 0 },
    ];

    const { toJSON } = render(
      <PaperProvider>
        <MealCard
          category="breakfast"
          meta={{ label: 'Breakfast', icon: 'coffee' }}
          items={items}
          onRemoveItem={() => {}}
        />
      </PaperProvider>
    );

    expect(toJSON()).toMatchSnapshot();
  });
});
