import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Avatar, Button, Card, Dialog, Divider, List, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

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

  const [data, setData] = useState({
    calories: { current: 1240, goal: 2000, label: 'Calories', unit: 'kcal' },
    protein: { current: 45, goal: 150, label: 'Protein', unit: 'g' },
    carbs: { current: 110, goal: 250, label: 'Carbs', unit: 'g' },
    fat: { current: 30, goal: 70, label: 'Fat', unit: 'g' },
    meals: {
      breakfast: { 
        label: 'Breakfast', icon: 'coffee', calories: 450, protein: 20, carbs: 50, fat: 15,
        items: [
          { name: 'Oatmeal', amount: '80g', kcal: 350, protein: 14, carbs: 60, fat: 6 }, 
          { name: 'Banana', amount: '120g', kcal: 100, protein: 1, carbs: 23, fat: 0 }
        ]
      },
      lunch: { 
        label: 'Lunch', icon: 'food-apple', calories: 550, protein: 35, carbs: 60, fat: 12,
        items: [
          { name: 'Chicken Salad', amount: '350g', kcal: 550, protein: 35, carbs: 60, fat: 12 }
        ]
      },
      dinner: { 
        label: 'Dinner', icon: 'food-variant', calories: 0, protein: 0, carbs: 0, fat: 0,
        items: []
      },
      snack: { 
        label: 'Snack', icon: 'cookie', calories: 240, protein: 10, carbs: 20, fat: 8,
        items: [
          { name: 'Protein Bar', amount: '60g', kcal: 240, protein: 10, carbs: 20, fat: 8 }
        ]
      },
    }
  });

  const [editingType, setEditingType] = useState<any>(null);
  const [tempGoal, setTempGoal] = useState('');

  const today = new Date();
  const dateString = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today);

  const openDialog = (type: string) => {
    setEditingType(type);
    // @ts-ignore
    setTempGoal(data[type]?.goal > 0 ? data[type].goal.toString() : '');
  };

  const handleSave = () => {
    if (editingType) {
      const numGoal = parseInt(tempGoal, 10);
      setData({ ...data, 
        // @ts-ignore
        [editingType]: { ...data[editingType], goal: isNaN(numGoal) ? 0 : numGoal } 
      });
    }
    setEditingType(null);
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
              progress={data.calories.goal > 0 ? Math.min(data.calories.current / data.calories.goal, 1) : 0}
              color={theme.colors.primary} backgroundColor={theme.colors.surfaceVariant}
            >
              <Text variant="displayLarge" style={[styles.bold, { color: theme.colors.primary }]}>{data.calories.current}</Text>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {data.calories.goal > 0 ? `of ${data.calories.goal} kcal` : 'Set Goal'}
              </Text>
            </ProgressCircle>
          </Pressable>

          <View style={styles.macroRow}>
            {(['protein', 'carbs', 'fat'] as const).map((key) => (
              <Pressable key={key} onPress={() => openDialog(key)} style={styles.macroItem}>
                <ProgressCircle
                  size={macroCircleSize} 
                  strokeWidth={macroCircleSize * 0.1}
                  progress={data[key].goal > 0 ? Math.min(data[key].current / data[key].goal, 1) : 0}
                  color={theme.colors.secondary} backgroundColor={theme.colors.surfaceVariant}
                >
                  {/* HIER WURDE DAS ZIEL HINZUGEFÜGT */}
                  <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onSurface, lineHeight: 22 }]}>
                    {data[key].current}
                  </Text>
                  <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, fontSize: 10 }}>
                    {data[key].goal > 0 ? `/ ${data[key].goal}g` : 'Set'}
                  </Text>
                </ProgressCircle>
                <Text variant="labelMedium" style={styles.macroLabel}>{data[key].label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.mealsSection}>
          <Text variant="titleLarge" style={[styles.bold, styles.sectionTitle]}>Meals</Text>
          {Object.entries(data.meals).map(([key, meal]) => (
            <Card key={key} style={styles.mealCard} mode="contained">
              <List.Accordion
                title={
                  <Text variant="titleMedium" style={styles.bold} numberOfLines={1}>
                    {meal.label}
                  </Text>
                }
                description={
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, paddingTop: 2 }}>
                    P: {meal.protein}g   •   C: {meal.carbs}g   •   F: {meal.fat}g
                  </Text>
                }
                left={props => (
                  <View style={styles.mealLeftIcon}>
                    <Avatar.Icon 
                      size={44} 
                      icon={meal.icon} 
                      style={{ backgroundColor: theme.colors.primaryContainer }} 
                      color={theme.colors.onPrimaryContainer}
                    />
                  </View>
                )}
                right={props => (
                  <View style={styles.mealRightSection}>
                    <View style={styles.mealHeaderCalories}>
                       <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.primary }]}>
                         {meal.calories}
                       </Text>
                       <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>kcal</Text>
                    </View>
                    <List.Icon {...props} icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} style={{ margin: 0 }} />
                  </View>
                )}
                style={styles.accordionBase}
              >
                <View style={styles.mealExpandedContent}>
                  {meal.items.map((item, index) => (
                    <View key={index} style={styles.productContainer}>
                      <View style={styles.productRowMain}>
                        <Text variant="bodyLarge" style={styles.bold}>{item.name}</Text>
                        <Text variant="bodyLarge" style={[styles.bold, { color: theme.colors.primary }]}>{item.kcal} kcal</Text>
                      </View>
                      
                      <View style={styles.productRowSub}>
                        <Text variant="bodyMedium" style={styles.productSubText}>{item.amount}</Text>
                        <Text variant="bodyMedium" style={styles.productSubText}>
                          P: {item.protein}g  •  C: {item.carbs}g  •  F: {item.fat}g
                        </Text>
                      </View>
                      
                      {index < meal.items.length - 1 && (
                         <Divider style={styles.itemDivider} />
                      )}
                    </View>
                  ))}
                  
                  {meal.items.length === 0 && (
                    <Text variant="bodyMedium" style={styles.emptyText}>No entries yet</Text>
                  )}
                </View>
              </List.Accordion>
            </Card>
          ))}
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
