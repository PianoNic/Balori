import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Avatar, Card, List, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { MealCategory, MealItem } from '../models/meal-entry';

interface MealCardProps {
  category: MealCategory;
  meta: { label: string; icon: string };
  items: MealItem[];
  onRemoveItem: (category: MealCategory, id: string) => void;
  onEditItem?: (category: MealCategory, item: MealItem) => void;
}

function SwipeableRow({ item, bg, onRemove, onEdit }: {
  item: MealItem;
  bg: string;
  onRemove: () => void;
  onEdit?: () => void;
}) {
  const theme = useTheme();
  const ref = useRef<Swipeable>(null);

  const renderLeftActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.5, 1], extrapolate: 'clamp' });
    return (
      <View style={[styles.deleteAction, { backgroundColor: theme.colors.error }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.onError} />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={ref}
      renderLeftActions={renderLeftActions}
      leftThreshold={80}
      overshootLeft={false}
      onSwipeableOpen={() => { ref.current?.close(); onRemove(); }}
    >
      <Pressable onPress={onEdit} style={[styles.item, { backgroundColor: bg }]}>
        <View style={styles.itemTop}>
          <Text variant="bodyLarge" style={styles.bold}>{item.name}</Text>
          <Text variant="bodyLarge" style={[styles.bold, { color: theme.colors.primary }]}>{item.kcal} kcal</Text>
        </View>
        <View style={styles.itemBottom}>
          <Text variant="bodyMedium" style={styles.secondaryText}>{item.amountGrams}g</Text>
          <Text variant="bodyMedium" style={styles.secondaryText}>
            P: {item.protein}g  •  C: {item.carbs}g  •  F: {item.fat}g
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export const MealCard: React.FC<MealCardProps> = ({ category, meta, items = [], onRemoveItem, onEditItem }) => {
  const theme = useTheme();
  const itemBackground = theme.colors.elevation.level1;

  const totalCalories = items.reduce((sum, item) => sum + item.kcal, 0);
  const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
  const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);
  const totalFat = items.reduce((sum, item) => sum + item.fat, 0);

  return (
    <Card style={styles.card} mode="contained">
      <List.Accordion
        title={<Text variant="titleMedium" style={styles.bold} numberOfLines={1}>{meta.label}</Text>}
        description={
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, paddingTop: 2 }}>
            P: {totalProtein}g   •   C: {totalCarbs}g   •   F: {totalFat}g
          </Text>
        }
        left={() => (
          <View style={styles.iconWrap}>
            <Avatar.Icon size={44} icon={meta.icon}
              style={{ backgroundColor: theme.colors.primaryContainer }}
              color={theme.colors.onPrimaryContainer}
            />
          </View>
        )}
        right={(props: { isExpanded?: boolean }) => (
          <View style={styles.rightSection}>
            <View style={styles.calSection}>
              <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.primary }]}>{totalCalories}</Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>kcal</Text>
            </View>
            <List.Icon icon={props.isExpanded ? 'chevron-up' : 'chevron-down'} style={{ margin: 0 }} />
          </View>
        )}
        style={styles.accordion}
      >
        {items.map((item) => (
          <SwipeableRow
            key={item.id}
            item={item}
            bg={itemBackground}
            onRemove={() => onRemoveItem(category, item.id)}
            onEdit={onEditItem ? () => onEditItem(category, item) : undefined}
          />
        ))}
      </List.Accordion>
      {items.length === 0 && (
        <Text variant="bodyMedium" style={styles.empty}>No entries yet</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  card: { marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  accordion: { backgroundColor: 'transparent', paddingVertical: 10, paddingHorizontal: 4 },
  iconWrap: { justifyContent: 'center', marginLeft: 4 },
  rightSection: { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  calSection: { alignItems: 'flex-end', marginRight: 8, justifyContent: 'center' },
  item: { paddingHorizontal: 20, paddingVertical: 14 },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  secondaryText: { opacity: 0.7, fontSize: 13 },
  empty: { fontStyle: 'italic', opacity: 0.5, textAlign: 'center', paddingVertical: 20 },
  deleteAction: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20 },
});
