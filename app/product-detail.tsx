import { useState } from 'react';
import { ScrollView, View, StyleSheet, Image } from 'react-native';
import { Text, Button, Chip, useTheme, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Product } from '@/models/product';

type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';

const MEAL_OPTIONS: { key: MealCategory; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'BREAKFAST', icon: 'weather-sunset-up' },
  { key: 'lunch', label: 'LUNCH', icon: 'weather-sunny' },
  { key: 'dinner', label: 'DINNER', icon: 'weather-night' },
  { key: 'snack', label: 'SNACK', icon: 'cookie' },
];

const PORTION_OPTIONS = [100, 50, 150];

export default function ProductDetailScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ barcode: string; productJson: string }>();
  const product: Product = JSON.parse(params.productJson ?? '{}');

  const [portionGrams, setPortionGrams] = useState(100);
  const [selectedMeal, setSelectedMeal] = useState<MealCategory>('breakfast');

  const factor = portionGrams / 100;
  const n = product.nutriments;

  function scaleValue(val: number | null): string {
    if (val === null) return '–';
    return Math.round(val * factor).toString();
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <IconButton icon="arrow-left" iconColor={theme.colors.onBackground} onPress={() => router.back()} style={styles.backButton} />

      <ScrollView contentContainerStyle={styles.content}>
        {product.imageUrl && (
          <View style={[styles.imageContainer, { backgroundColor: theme.colors.elevation.level2 }]}>
            <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
            <View style={styles.imageOverlay}>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>VERIFIED PRODUCT</Text>
              <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
                {product.name ?? 'Unbekanntes Produkt'}
              </Text>
              {product.brand && (
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{product.brand}</Text>
              )}
            </View>
          </View>
        )}

        {!product.imageUrl && (
          <View style={[styles.noImageContainer, { backgroundColor: theme.colors.elevation.level2 }]}>
            <Text variant="headlineMedium" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {product.name ?? 'Unbekanntes Produkt'}
            </Text>
            {product.brand && (
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{product.brand}</Text>
            )}
          </View>
        )}

        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          PORTION SIZE — {portionGrams}g
        </Text>
        <View style={styles.portionRow}>
          <Chip
            onPress={() => setPortionGrams(100)}
            style={[styles.portionChip, { backgroundColor: portionGrams === 100 ? theme.colors.primary : theme.colors.elevation.level2 }]}
            textStyle={{ color: portionGrams === 100 ? theme.colors.onPrimary : theme.colors.onSurface }}
          >
            100g
          </Chip>
          <Chip
            onPress={() => setPortionGrams(portionGrams + 50)}
            style={[styles.portionChip, { backgroundColor: theme.colors.elevation.level2 }]}
            textStyle={{ color: theme.colors.onSurface }}
          >
            +50g
          </Chip>
          <Chip
            onPress={() => setPortionGrams(portionGrams + 150)}
            style={[styles.portionChip, { backgroundColor: theme.colors.elevation.level2 }]}
            textStyle={{ color: theme.colors.onSurface }}
          >
            +150g
          </Chip>
        </View>

        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          MEAL
        </Text>
        <View style={styles.mealGrid}>
          {MEAL_OPTIONS.map(({ key, label, icon }) => (
            <Button
              key={key}
              mode={selectedMeal === key ? 'contained' : 'contained-tonal'}
              icon={icon}
              onPress={() => setSelectedMeal(key)}
              style={styles.mealButton}
              labelStyle={{ fontSize: 11 }}
              buttonColor={selectedMeal === key ? theme.colors.primary : theme.colors.elevation.level2}
              textColor={selectedMeal === key ? theme.colors.onPrimary : theme.colors.onSurface}
            >
              {label}
            </Button>
          ))}
        </View>

        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>
          NUTRITION FACTS
        </Text>

        <View style={styles.nutritionGrid}>
          <View style={[styles.nutritionSquare, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>ENERGY</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {scaleValue(n.energyKcal100g)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>kcal</Text>
          </View>
          <View style={[styles.nutritionSquare, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>PROTEIN</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {scaleValue(n.proteins100g)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>g</Text>
          </View>
          <View style={[styles.nutritionSquare, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>CARBS</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {scaleValue(n.carbohydrates100g)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>g</Text>
          </View>
          <View style={[styles.nutritionSquare, { backgroundColor: theme.colors.elevation.level1 }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>FAT</Text>
            <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, fontWeight: 'bold' }}>
              {scaleValue(n.fat100g)}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>g</Text>
          </View>
        </View>
      </ScrollView>

      <Button
        mode="contained"
        icon="plus"
        onPress={() => {
          // TODO: persist to MMKV storage
          router.back();
        }}
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary, letterSpacing: 1, fontWeight: 'bold' }}
      >
        HINZUFÜGEN
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { position: 'absolute', top: 48, left: 8, zIndex: 1 },
  content: { padding: 24, paddingTop: 48 },
  imageContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 24, height: 220 },
  productImage: { width: '100%', height: '100%' },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: 'rgba(0,0,0,0.5)' },
  noImageContainer: { borderRadius: 16, padding: 24, marginBottom: 24 },
  sectionLabel: { marginBottom: 12, letterSpacing: 1 },
  portionRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  portionChip: { borderRadius: 20 },
  mealGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  mealButton: { borderRadius: 12, flex: 1, minWidth: '45%' },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  nutritionSquare: { width: '47%', aspectRatio: 1, borderRadius: 12, padding: 16, justifyContent: 'center', alignItems: 'center' },
  addButton: { marginHorizontal: 24, marginBottom: 24, borderRadius: 24, paddingVertical: 4 },
});
