import { EditMealDialog } from '@/components/EditMealDialog';
import { MealCard } from '@/components/MealCard';
import { ProgressCircle } from '@/components/ProgressCircle';
import { MEAL_META } from '@/constants/meals';
import type { MealCategory, MealItem, NutritionGoals } from '@/models/meal-entry';
import { getDayLog, getDayTotals, getGoals, removeMealItem, setGoal, updateMealItem } from '@/services/storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FuelScreen() {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  
  const mainCircleSize = Math.min(screenWidth * 0.55, 280); 
  const macroCircleSize = Math.min(screenWidth * 0.22, 100);

  const [goals, setGoalsState] = useState<NutritionGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 70 });
  const [totals, setTotals] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  const [meals, setMeals] = useState<Record<MealCategory, MealItem[]>>({
    breakfast: [], lunch: [], dinner: [], snack: []
  });
  
  const [editingMacro, setEditingMacro] = useState<keyof NutritionGoals | null>(null);
  const [tempMacroValue, setTempMacroValue] = useState('');

  const [editingMeal, setEditingMeal] = useState<{ category: MealCategory, item: MealItem } | null>(null);
  const [editMealName, setEditMealName] = useState('');
  const [editMealAmount, setEditMealAmount] = useState('');
  const [editMealKcal, setEditMealKcal] = useState('');
  const [editMealProtein, setEditMealProtein] = useState('');
  const [editMealCarbs, setEditMealCarbs] = useState('');
  const [editMealFat, setEditMealFat] = useState('');

  const today = new Date();
  const dateString = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);

  const loadData = useCallback(async () => {
    const [g, t, log] = await Promise.all([getGoals(), getDayTotals(), getDayLog()]);
    setGoalsState(g);
    setTotals(t);
    setMeals(log.meals);
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openMacroDialog = (type: keyof NutritionGoals) => {
    setEditingMacro(type);
    setTempMacroValue(goals[type] > 0 ? goals[type].toString() : '');
  };

  const saveMacro = async () => {
    if (editingMacro) {
      const numGoal = parseInt(tempMacroValue, 10);
      if (!isNaN(numGoal) && numGoal > 0) {
        await setGoal(editingMacro, numGoal);
        await loadData();
      }
    }
    setEditingMacro(null);
  };

  const handleRemoveItem = async (category: MealCategory, itemId: string) => {
    await removeMealItem(category, itemId);
    await loadData();
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
      const updatedItem: MealItem = { 
        ...editingMeal.item, 
        name: editMealName, 
        amountGrams: parseFloat(editMealAmount) || 0,
        kcal: parseInt(editMealKcal, 10) || 0,
        protein: parseInt(editMealProtein, 10) || 0,
        carbs: parseInt(editMealCarbs, 10) || 0,
        fat: parseInt(editMealFat, 10) || 0,
      };
      await updateMealItem(editingMeal.category, updatedItem);
      await loadData();
    }
    setEditingMeal(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>Today</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>{dateString}</Text>
        </View>

        <View style={styles.content}>
          <Pressable onPress={() => openMacroDialog('calories')} style={styles.mainCircle}>
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
              <Pressable key={key} onPress={() => openMacroDialog(key)} style={styles.macroItem}>
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
              onEditItem={openEditMeal}
            />
          ))}
        </View>
      </ScrollView>

      <Portal>
        <Dialog visible={editingMacro !== null} onDismiss={() => setEditingMacro(null)} style={{ backgroundColor: theme.colors.surface }}>
          <Dialog.Title>Set {editingMacro} Goal</Dialog.Title>
          <Dialog.Content>
            <TextInput 
              label="Target" value={tempMacroValue} onChangeText={setTempMacroValue} 
              keyboardType="numeric" mode="outlined" 
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditingMacro(null)}>Cancel</Button>
            <Button onPress={saveMacro}>Save</Button>
          </Dialog.Actions>
        </Dialog>

        <EditMealDialog
          visible={editingMeal !== null}
          name={editMealName}
          amount={editMealAmount}
          kcal={editMealKcal}
          protein={editMealProtein}
          carbs={editMealCarbs}
          fat={editMealFat}
          onNameChange={setEditMealName}
          onAmountChange={setEditMealAmount}
          onKcalChange={setEditMealKcal}
          onProteinChange={setEditMealProtein}
          onCarbsChange={setEditMealCarbs}
          onFatChange={setEditMealFat}
          onDismiss={() => setEditingMeal(null)}
          onSave={saveMealEdit}
        />
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