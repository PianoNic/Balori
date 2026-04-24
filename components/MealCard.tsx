import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Avatar, Card, Divider, IconButton, List, Text, useTheme } from 'react-native-paper';
import type { MealCategory, MealItem } from '../models/meal-entry';

interface MealCardProps {
  category: MealCategory;
  meta: { label: string; icon: string };
  items: MealItem[];
  onRemoveItem: (category: MealCategory, id: string) => void;
  onEditItem: (category: MealCategory, item: MealItem) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ category, meta, items = [], onRemoveItem, onEditItem }) => {
  const theme = useTheme();

  const mealCals = items.reduce((sum, item) => sum + item.kcal, 0);
  const mealP = items.reduce((sum, item) => sum + item.protein, 0);
  const mealC = items.reduce((sum, item) => sum + item.carbs, 0);
  const mealF = items.reduce((sum, item) => sum + item.fat, 0);

  const renderLeftActions = () => {
    return (
      <View style={[styles.deleteBackground, { backgroundColor: theme.colors.errorContainer }]}>
        <IconButton icon="delete" iconColor={theme.colors.onErrorContainer} size={24} style={{ margin: 0 }} />
      </View>
    );
  };

  return (
    <Card style={styles.mealCard} mode="contained">
      <List.Accordion
        title={<Text variant="titleMedium" style={styles.bold} numberOfLines={1}>{meta.label}</Text>}
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
              <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.primary }]}>{mealCals}</Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>kcal</Text>
            </View>
            <List.Icon icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} style={{ margin: 0 }} />
          </View>
        )}
        style={styles.accordionBase}
      >
        <View style={styles.mealExpandedContent}>
          {items.map((item, index) => (
            <View key={item.id}>
              <Swipeable
                renderLeftActions={renderLeftActions}
                overshootLeft={false}
                onSwipeableOpen={(direction) => {
                  if (direction === 'left') onRemoveItem(category, item.id);
                }}
              >
                {/* Die komplette Zeile ist jetzt ein Button (Pressable) */}
                <Pressable 
                  style={[styles.productContainer, { backgroundColor: theme.colors.surfaceVariant }]}
                  onPress={() => onEditItem(category, item)}
                >
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
                </Pressable>
              </Swipeable>
              
              {index < items.length - 1 && <Divider style={styles.itemDivider} />}
            </View>
          ))}
          
          {items.length === 0 && (
            <Text variant="bodyMedium" style={styles.emptyText}>No entries yet</Text>
          )}
        </View>
      </List.Accordion>
    </Card>
  );
};

const styles = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  mealCard: { marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  accordionBase: { backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 4 },
  mealLeftIcon: { justifyContent: 'center', marginLeft: 4 },
  mealRightSection: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  mealHeaderCalories: { alignItems: 'flex-end', marginRight: 8, justifyContent: 'center' },
  
  mealExpandedContent: { paddingHorizontal: 0, paddingBottom: 10 }, 
  productContainer: { paddingHorizontal: 20, paddingVertical: 12 }, 
  
  productRowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productRowSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productSubText: { opacity: 0.7, fontSize: 13 },
  
  itemDivider: { marginVertical: 0, opacity: 0.5, marginHorizontal: 20 },
  emptyText: { fontStyle: 'italic', opacity: 0.5, textAlign: 'center', marginTop: 12, paddingBottom: 12 },
  
  deleteBackground: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'flex-start', 
    paddingLeft: 20 
  }
});