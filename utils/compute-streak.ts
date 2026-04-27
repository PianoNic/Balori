import type { DayLog } from '@/models/meal-entry';

export function computeStreak(logs: DayLog[]): number {
  let streak = 0;
  for (const log of logs) {
    const hasEntries = Object.values(log.meals).some((items) => items.length > 0);
    if (hasEntries)
      streak++;
    else
      break;
  }
  return streak;
}
