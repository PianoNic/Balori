import { computeStreak } from '../utils/compute-streak';
import type { DayLog } from '../models/meal-entry';

function makeDayLog(date: string, hasFood: boolean): DayLog {
  const emptyMeals = { breakfast: [], lunch: [], dinner: [], snack: [] };
  if (!hasFood)
    return { date, meals: emptyMeals };

  return {
    date,
    meals: {
      ...emptyMeals,
      lunch: [{ id: '1', name: 'Test', amountGrams: 100, kcal: 200, protein: 10, carbs: 20, fat: 5 }],
    },
  };
}

describe('computeStreak', () => {
  it('zählt aufeinanderfolgende Tage mit Einträgen (Positivtest)', () => {
    const logs = [
      makeDayLog('2026-04-27', true),
      makeDayLog('2026-04-26', true),
      makeDayLog('2026-04-25', true),
      makeDayLog('2026-04-24', false),
    ];

    expect(computeStreak(logs)).toBe(3);
  });

  it('gibt 0 zurück wenn keine Einträge vorhanden sind (Negativtest)', () => {
    const logs = [
      makeDayLog('2026-04-27', false),
      makeDayLog('2026-04-26', false),
    ];

    expect(computeStreak(logs)).toBe(0);
  });
});
