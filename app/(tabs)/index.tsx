import type { MealCategory, MealItem, NutritionGoals } from '@/models/meal-entry';
import { getDayLog, getDayTotals, getGoals, removeMealItem, setGoal } from '@/services/storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MealCard } from '../../components/MealCard';
import { ProgressCircle } from '../../components/ProgressCircle';

export default function FuelScreen() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  
  const mainCircleSize = Math.min(screenWidth * 0.55, 280); 
  const macroCircleSize = Math.min(screenWidth * 0.22, 100);

  const MEAL_META: Record<MealCategory, { label: string; icon: string }> = {
    breakfast: { label: 'Breakfast', icon: 'coffee' },
    lunch: { label: 'Lunch', icon: 'food-apple' },
    dinner: { label: 'Dinner', icon: 'food-variant' },
    snack: { label: 'Snack', icon: 'cookie' },
  };

  const [goals, setGoalsState] = useState<NutritionGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 70 });
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [meals, setMeals] = useState<Record<MealCategory, MealItem[]>>({
    breakfast: [], lunch: [], dinner: [], snack: []
  });
  
  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState('');

  const loadData = useCallback(async () => {
    const [g, t, log] = await Promise.all([getGoals(), getDayTotals(), getDayLog()]);
    setGoalsState(g);
    setTotals(t);
    setMeals(log.meals);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const today = new Date();
  const dateString = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);

  const openDialog = (type: string) => {
    setEditingType(type);
    setTempGoal(goals[type as keyof typeof goals]?.toString() ?? '');
  };

  const handleSave = async () => {
    if (editingType) {
      const numGoal = parseInt(tempGoal, 10);
      if (!isNaN(numGoal) && numGoal > 0) {
        await setGoal(editingType as keyof typeof goals, numGoal);
        setGoalsState(await getGoals());
      }
    }
    setEditingType(null);
  };

  const handleRemoveItem = async (category: MealCategory, itemId: string) => {
    await removeMealItem(category, itemId);
    setTotals(await getDayTotals());
    setMeals((await getDayLog()).meals);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>Today</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>{dateString}</Text>
        </View>

        <View style={styles.content}>
          <Pressable onPress={() => openDialog('calories')} style={styles.mainCircle}>
            <ProgressCircle
              size={mainCircleSize}
              strokeWidth={mainCircleSize * 0.08}
              progress={goals.calories > 0 ? Math.min(totals.calories / goals.calories, 1) : 0}
              color={theme.colors.primary} backgroundColor={theme.colors.surfaceVariant}
            >
              <Text variant="displayLarge" style={[styles.bold, { color: theme.colors.primary }]}>{totals.calories}</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {goals.calories > 0 ? `of ${goals.calories} kcal` : 'Set Goal'}
              </Text>
            </ProgressCircle>
          </Pressable>

          <View style={styles.macroRow}>
            {(['protein', 'carbs', 'fat'] as const).map((key) => (
              <Pressable key={key} onPress={() => openDialog(key)} style={styles.macroItem}>
                <ProgressCircle
                  size={macroCircleSize}
                  strokeWidth={macroCircleSize * 0.1}
                  progress={goals[key] > 0 ? Math.min(totals[key] / goals[key], 1) : 0}
                  color={theme.colors.secondary} backgroundColor={theme.colors.surfaceVariant}
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
              </Pressable>
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
            />
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={editingType !== null} onDismiss={() => setEditingType(null)} style={{ backgroundColor: theme.colors.surface }}>
          <Dialog.Title>Set {editingType} Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput 
              label="Target" 
              value={tempGoal} 
              onChangeText={setTempGoal} 
              keyboardType="numeric" 
              mode="outlined" 
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditingType(null)}>Cancel</Button>
            <Button onPress={handleSave}>Save</Button>
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
  content: { alignItems: 'center', paddingBottom: 40 },
  mainCircle: { marginBottom: 40 },
  macroRow: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    width: '100%', paddingHorizontal: '8%', flexWrap: 'wrap' 
  },
  macroItem: { alignItems: 'center' },
  macroLabel: { marginTop: 8, fontWeight: '600' },
  mealsSection: { paddingHorizontal: '5%' },
  sectionTitle: { marginBottom: 16, marginLeft: 8 },
});