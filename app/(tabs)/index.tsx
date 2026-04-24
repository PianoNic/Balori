import React, { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Button, Card, Dialog, Divider, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';
import { getDayLog, getDayTotals, getGoals, setGoal, removeMealItem } from '@/services/storage';
import type { MealCategory, MealItem } from '@/models/meal-entry';

const ProgressCircle = ({ size, progress, strokeWidth, color, backgroundColor, children }: any) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={backgroundColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.absoluteCenter}>{children}</View>
    </View>
  );
};

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

  const [goals, setGoalsState] = useState(getGoals());
  const [totals, setTotals] = useState(getDayTotals());
  const [meals, setMeals] = useState(getDayLog().meals);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [tempGoal, setTempGoal] = useState('');

  useFocusEffect(
    useCallback(() => {
      setGoalsState(getGoals());
      setTotals(getDayTotals());
      setMeals(getDayLog().meals);
    }, [])
  );

  const today = new Date();
  const dateString = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);

  const openDialog = (type: string) => {
    setEditingType(type);
    setTempGoal(goals[type as keyof typeof goals]?.toString() ?? '');
  };

  const handleSave = () => {
    if (editingType) {
      const numGoal = parseInt(tempGoal, 10);
      if (!isNaN(numGoal) && numGoal > 0) {
        setGoal(editingType as keyof typeof goals, numGoal);
        setGoalsState(getGoals());
      }
    }
    setEditingType(null);
  };

  const handleRemoveItem = (category: MealCategory, itemId: string) => {
    removeMealItem(category, itemId);
    setTotals(getDayTotals());
    setMeals(getDayLog().meals);
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
                <Text variant="labelMedium" style={styles.macroLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.mealsSection}>
          <Text variant="titleLarge" style={[styles.bold, styles.sectionTitle]}>Meals</Text>
          {(Object.keys(MEAL_META) as MealCategory[]).map((category) => {
            const meta = MEAL_META[category];
            const items = meals[category];
            const mealCals = items.reduce((s, i) => s + i.kcal, 0);
            const mealP = items.reduce((s, i) => s + i.protein, 0);
            const mealC = items.reduce((s, i) => s + i.carbs, 0);
            const mealF = items.reduce((s, i) => s + i.fat, 0);
            return (
            <Card key={category} style={styles.mealCard} mode="contained">
              <List.Accordion
                title={
                  <Text variant="titleMedium" style={styles.bold} numberOfLines={1}>
                    {meta.label}
                  </Text>
                }
                description={
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, paddingTop: 2 }}>
                    P: {mealP}g   •   C: {mealC}g   •   F: {mealF}g
                  </Text>
                }
                left={() => (
                  <View style={styles.mealLeftIcon}>
                    <Avatar.Icon
                      size={44}
                      icon={meta.icon}
                      style={{ backgroundColor: theme.colors.primaryContainer }}
                      color={theme.colors.onPrimaryContainer}
                    />
                  </View>
                )}
                right={(props: { isExpanded?: boolean }) => (
                  <View style={styles.mealRightSection}>
                    <View style={styles.mealHeaderCalories}>
                       <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.primary }]}>
                         {mealCals}
                       </Text>
                       <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>kcal</Text>
                    </View>
                    <List.Icon icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} style={{ margin: 0 }} />
                  </View>
                )}
                style={styles.accordionBase}
              >
                <View style={styles.mealExpandedContent}>
                  {items.map((item: MealItem, index: number) => (
                    <Pressable key={item.id} onLongPress={() => handleRemoveItem(category, item.id)} style={styles.productContainer}>
                      <View style={styles.productRowMain}>
                        <Text variant="bodyLarge" style={styles.bold}>{item.name}</Text>
                        <Text variant="bodyLarge" style={[styles.bold, { color: theme.colors.primary }]}>{item.kcal} kcal</Text>
                      </View>
                      <View style={styles.productRowSub}>
                        <Text variant="bodyMedium" style={styles.productSubText}>{item.amountGrams}g</Text>
                        <Text variant="bodyMedium" style={styles.productSubText}>
                          P: {item.protein}g  •  C: {item.carbs}g  •  F: {item.fat}g
                        </Text>
                      </View>
                      {index < items.length - 1 && (
                         <Divider style={styles.itemDivider} />
                      )}
                    </Pressable>
                  ))}
                  {items.length === 0 && (
                    <Text variant="bodyMedium" style={styles.emptyText}>No entries yet</Text>
                  )}
                </View>
              </List.Accordion>
            </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* NEUES POP-UP STYLING ÜBERNOMMEN */}
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
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%', 
    paddingHorizontal: '8%',
    flexWrap: 'wrap' 
  },
  macroItem: { alignItems: 'center' },
  macroLabel: { marginTop: 8, fontWeight: '600' },
  absoluteCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  
  mealsSection: { paddingHorizontal: '5%' },
  sectionTitle: { marginBottom: 16, marginLeft: 8 },
  mealCard: { marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  
  accordionBase: { backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 4 },
  
  mealLeftIcon: { justifyContent: 'center', marginLeft: 4 },
  mealRightSection: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  mealHeaderCalories: { alignItems: 'flex-end', marginRight: 8, justifyContent: 'center' },
  
  mealExpandedContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 8 },
  
  productContainer: { marginBottom: 4 },
  productRowMain: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 4 
  },
  productRowSub: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  productSubText: {
    opacity: 0.7,
    fontSize: 13,
  },
  itemDivider: { 
    marginVertical: 12,
    opacity: 0.5 
  },
  
  emptyText: { fontStyle: 'italic', opacity: 0.5, textAlign: 'center', marginTop: 8 }
});
