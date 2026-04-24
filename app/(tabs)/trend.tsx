import { MealCard } from '@/components/MealCard';
import { ProgressCircle } from '@/components/ProgressCircle';
import type { MealCategory, MealItem, NutritionGoals } from '@/models/meal-entry';
import { getDayLog, getDayLogs, getDayTotals, getGoals, removeMealItem, updateMealItem } from '@/services/storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const MEAL_META: Record<MealCategory, { label: string; icon: string }> = {
  breakfast: { label: 'Breakfast', icon: 'coffee' },
  lunch: { label: 'Lunch', icon: 'food-apple' },
  dinner: { label: 'Dinner', icon: 'food-variant' },
  snack: { label: 'Snack', icon: 'cookie' },
};

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let startWeekday = firstDay.getDay() - 1;
  if (startWeekday < 0) startWeekday = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; currentMonth: boolean; dateKey: string }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    days.push({ day: d, currentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ day: d, currentMonth: true, dateKey: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  const remaining = 7 - (days.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: d, currentMonth: false, dateKey: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
    }
  }

  return days;
}

function computeStreak(logs: Awaited<ReturnType<typeof getDayLogs>>): number {
  let streak = 0;
  for (const log of logs) {
    const hasEntries = Object.values(log.meals).some((items) => items.length > 0);
    if (hasEntries) streak++;
    else break;
  }
  return streak;
}

export default function TrendScreen() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const macroCircleSize = Math.min(screenWidth * 0.22, 100);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [goals, setGoalsState] = useState<NutritionGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 70 });
  const [meals, setMeals] = useState<Record<MealCategory, MealItem[]>>({ breakfast: [], lunch: [], dinner: [], snack: [] });
  const [streak, setStreak] = useState(0);
  const [editingMeal, setEditingMeal] = useState<{ category: MealCategory; item: MealItem } | null>(null);
  const [editMealName, setEditMealName] = useState('');
  const [editMealAmount, setEditMealAmount] = useState('');
  const [editMealKcal, setEditMealKcal] = useState('');
  const [editMealProtein, setEditMealProtein] = useState('');
  const [editMealCarbs, setEditMealCarbs] = useState('');
  const [editMealFat, setEditMealFat] = useState('');

  const loadDay = useCallback(async (date: string) => {
    const [t, log, g] = await Promise.all([getDayTotals(date), getDayLog(date), getGoals()]);
    setTotals(t);
    setMeals(log.meals);
    setGoalsState(g);
  }, []);

  const loadStreak = useCallback(async () => {
    const logs = await getDayLogs(60);
    setStreak(computeStreak(logs));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDay(selectedDate);
      loadStreak();
    }, [selectedDate, loadDay, loadStreak])
  );

  const handleRemoveItem = async (category: MealCategory, itemId: string) => {
    await removeMealItem(category, itemId, selectedDate);
    await loadDay(selectedDate);
  };

  const openEditMeal = (category: MealCategory, item: MealItem) => {
    setEditingMeal({ category, item });
    setEditMealName(item.name);
    setEditMealAmount(item.amountGrams?.toString() || '0');
    setEditMealKcal(item.kcal.toString());
    setEditMealProtein(item.protein.toString());
    setEditMealCarbs(item.carbs.toString());
    setEditMealFat(item.fat.toString());
  };

  const saveMealEdit = async () => {
    if (editingMeal) {
      await updateMealItem(editingMeal.category, {
        ...editingMeal.item,
        name: editMealName,
        amountGrams: parseFloat(editMealAmount) || 0,
        kcal: parseInt(editMealKcal, 10) || 0,
        protein: parseInt(editMealProtein, 10) || 0,
        carbs: parseInt(editMealCarbs, 10) || 0,
        fat: parseInt(editMealFat, 10) || 0,
      }, selectedDate);
      await loadDay(selectedDate);
    }
    setEditingMeal(null);
  };

  const calendarDays = getCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>
            Trend
          </Text>
        </View>

        <Surface style={[styles.streakCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={0}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.primary }]}>
            {streak}
          </Text>
          <View>
            <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onBackground }]}>
              {streak === 1 ? 'Day Streak' : 'Days Streak'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Keep logging to build your streak
            </Text>
          </View>
        </Surface>

        <Surface style={[styles.calendarCard, { backgroundColor: theme.colors.elevation.level2 }]} elevation={0}>
          <View style={styles.calendarHeader}>
            <IconButton icon="chevron-left" onPress={prevMonth} iconColor={theme.colors.primary} size={20} />
            <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onBackground }]}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <IconButton icon="chevron-right" onPress={nextMonth} iconColor={theme.colors.primary} size={20} />
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAYS.map((d) => (
              <View key={d} style={styles.weekdayCell}>
                <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontWeight: 'bold' }}>
                  {d}
                </Text>
              </View>
            ))}
          </View>

          {Array.from({ length: calendarDays.length / 7 }, (_, row) => (
            <View key={row} style={styles.calendarRow}>
              {calendarDays.slice(row * 7, row * 7 + 7).map((item, idx) => {
                const isSelected = item.dateKey === selectedDate;
                const isToday = item.dateKey === todayKey;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setSelectedDate(item.dateKey)}
                    style={[
                      styles.dayCell,
                      isSelected && { backgroundColor: theme.colors.primary, borderRadius: 10 },
                      isToday && !isSelected && { borderWidth: 1.5, borderColor: theme.colors.primary, borderRadius: 10 },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: isSelected
                          ? theme.colors.onPrimary
                          : item.currentMonth
                            ? theme.colors.onBackground
                            : theme.colors.onSurfaceVariant,
                        fontWeight: isToday || isSelected ? 'bold' : 'normal',
                        opacity: item.currentMonth ? 1 : 0.3,
                      }}
                    >
                      {item.day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </Surface>

        <View style={styles.nutritionSection}>
          <Pressable>
            <ProgressCircle
              size={macroCircleSize * 1.6}
              strokeWidth={macroCircleSize * 0.12}
              progress={goals.calories > 0 ? Math.min(totals.calories / goals.calories, 1) : 0}
              color={theme.colors.primary}
              backgroundColor={theme.colors.surfaceVariant}
            >
              <Text variant="headlineSmall" style={[styles.bold, { color: theme.colors.primary }]}>
                {totals.calories}
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {goals.calories > 0 ? `of ${goals.calories} kcal` : 'Set Goal'}
              </Text>
            </ProgressCircle>
          </Pressable>

          <View style={styles.macroRow}>
            {(['protein', 'carbs', 'fat'] as const).map((key) => (
              <View key={key} style={styles.macroItem}>
                <ProgressCircle
                  size={macroCircleSize}
                  strokeWidth={macroCircleSize * 0.1}
                  progress={goals[key] > 0 ? Math.min(totals[key] / goals[key], 1) : 0}
                  color={theme.colors.secondary}
                  backgroundColor={theme.colors.surfaceVariant}
                >
                  <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onSurface, lineHeight: 22 }]}>
                    {totals[key]}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
                    {goals[key] > 0 ? `/ ${goals[key]}g` : 'Set'}
                  </Text>
                </ProgressCircle>
                <Text variant="labelMedium" style={styles.macroLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.mealsSection}>
          <Text variant="titleLarge" style={[styles.bold, styles.sectionTitle]}>Meals</Text>
          {(Object.keys(MEAL_META) as MealCategory[]).map((category) => (
            <MealCard
              key={category}
              category={category}
              meta={MEAL_META[category]}
              items={meals[category]}
              onRemoveItem={handleRemoveItem}
              onEditItem={openEditMeal}
            />
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={editingMeal !== null} onDismiss={() => setEditingMeal(null)} style={{ backgroundColor: theme.colors.surface, maxHeight: '80%' }}>
          <Dialog.Title>Eintrag bearbeiten</Dialog.Title>
          <Dialog.Content>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput label="Name" value={editMealName} onChangeText={setEditMealName} mode="outlined" style={styles.inputSpacing} />
              <View style={styles.inputRow}>
                <TextInput label="Menge (g/ml)" value={editMealAmount} onChangeText={setEditMealAmount} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginRight: 4 }]} />
                <TextInput label="Kalorien (kcal)" value={editMealKcal} onChangeText={setEditMealKcal} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginLeft: 4 }]} />
              </View>
              <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 4, color: theme.colors.onSurfaceVariant }}>Makros (g)</Text>
              <View style={styles.inputRow}>
                <TextInput label="Protein" value={editMealProtein} onChangeText={setEditMealProtein} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginRight: 4 }]} />
                <TextInput label="Carbs" value={editMealCarbs} onChangeText={setEditMealCarbs} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginHorizontal: 4 }]} />
                <TextInput label="Fat" value={editMealFat} onChangeText={setEditMealFat} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginLeft: 4 }]} />
              </View>
            </ScrollView>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditingMeal(null)}>Abbrechen</Button>
            <Button onPress={saveMealEdit}>Speichern</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: '6%', paddingTop: 20, marginBottom: 20 },
  bold: { fontWeight: 'bold' },

  streakCard: {
    marginHorizontal: '5%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  calendarCard: {
    marginHorizontal: '5%',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
    marginBottom: 24,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingHorizontal: 4,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  calendarRow: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  dayCell: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },

  nutritionSection: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: '8%',
    marginTop: 32,
  },
  macroItem: { alignItems: 'center' },
  macroLabel: { marginTop: 8, fontWeight: '600' },

  mealsSection: { paddingHorizontal: '5%' },
  sectionTitle: { marginBottom: 16, marginLeft: 8 },
  inputSpacing: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flex1: { flex: 1 },
});
