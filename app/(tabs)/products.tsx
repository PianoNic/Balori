import { ProductDialog } from '@/dialogs/ProductDialog';
import type { Product } from '@/models/product';
import { deleteProduct, generateId, getProducts, saveProduct } from '@/services/storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Button, Card, FAB, Portal, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

function SwipeableProduct({ product, backgroundColor, onRemove, onAddToMeal, onEdit }: {
  product: Product;
  backgroundColor: string;
  onRemove: () => void;
  onAddToMeal: () => void;
  onEdit: () => void;
}) {
  const theme = useTheme();
  const ref = useRef<Swipeable>(null);

  const calories = product.nutriments?.energyKcal100g || 0;
  const protein = product.nutriments?.proteins100g || 0;
  const carbs = product.nutriments?.carbohydrates100g || 0;
  const fat = product.nutriments?.fat100g || 0;

  const renderLeftActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [0, 80], outputRange: [0.5, 1], extrapolate: 'clamp' });
    return (
      <View style={[styles.swipeAction, { backgroundColor: theme.colors.error }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name="delete-outline" size={24} color={theme.colors.onError} />
        </Animated.View>
      </View>
    );
  };

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({ inputRange: [-80, 0], outputRange: [1, 0.5], extrapolate: 'clamp' });
    return (
      <View style={[styles.swipeAction, styles.swipeActionRight, { backgroundColor: theme.colors.primary }]}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.colors.onPrimary} />
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={ref}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      leftThreshold={80}
      rightThreshold={80}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(direction) => {
        ref.current?.close();
        if (direction === 'left')
          onRemove();
        else
          onAddToMeal();
      }}
    >
      <Pressable style={[styles.productRow, { backgroundColor }]} onPress={onEdit}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text variant="bodyLarge" style={styles.bold} numberOfLines={1}>{product.name || 'Unnamed Product'}</Text>
          {!!product.brand && (
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{product.brand}</Text>
          )}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="bodyLarge" style={[styles.bold, { color: theme.colors.primary }]}>{calories} kcal</Text>
          <Text variant="bodySmall" style={styles.secondaryText}>
            P: {protein}g  •  C: {carbs}g  •  F: {fat}g
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function ProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const itemBackground = theme.colors.elevation.level1;
  const [products, setProducts] = useState<Product[]>([]);
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = useCallback(async () => {
    const data = await getProducts();
    if (!Array.isArray(data)) {
      setProducts([]);
      return;
    }
    setProducts([...data].sort((a, b) => (a?.name || '').localeCompare(b?.name || '')));
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRemove = async (barcode: string) => {
    await deleteProduct(barcode);
    await loadData();
  };

  const handleAddToMeal = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { barcode: product.barcode || '', productJson: JSON.stringify(product) },
    });
  };

  const handleCreate = async (values: { name: string; brand: string; kcal: string; protein: string; carbs: string; fat: string }) => {
    await saveProduct({
      barcode: `custom_${generateId()}`,
      name: values.name.trim(),
      brand: values.brand.trim() || null,
      imageUrl: null,
      nutriments: {
        energyKcal100g: parseFloat(values.kcal) || 0,
        proteins100g: parseFloat(values.protein) || null,
        carbohydrates100g: parseFloat(values.carbs) || null,
        fat100g: parseFloat(values.fat) || null,
      },
    });
    setCreateDialogVisible(false);
    await loadData();
  };

  const handleEdit = async (values: { name: string; brand: string; kcal: string; protein: string; carbs: string; fat: string }) => {
    if (editingProduct) {
      await saveProduct({
        ...editingProduct,
        name: values.name,
        brand: values.brand || null,
        nutriments: {
          ...editingProduct.nutriments,
          energyKcal100g: parseFloat(values.kcal) || 0,
          proteins100g: parseFloat(values.protein) || 0,
          carbohydrates100g: parseFloat(values.carbs) || 0,
          fat100g: parseFloat(values.fat) || 0,
        },
      });
      await loadData();
    }
    setEditingProduct(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>Products</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} saved
          </Text>
        </View>

        <View style={styles.listSection}>
          <Card style={styles.listCard} mode="contained">
            {products.length === 0 ? (
              <Text variant="bodyMedium" style={styles.empty}>No products yet</Text>
            ) : (
              products.map((product) => (
                <SwipeableProduct
                  key={product.barcode}
                  product={product}
                  backgroundColor={itemBackground}
                  onRemove={() => handleRemove(product.barcode)}
                  onAddToMeal={() => handleAddToMeal(product)}
                  onEdit={() => setEditingProduct(product)}
                />
              ))
            )}
          </Card>
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color={theme.colors.onPrimary}
        onPress={() => setCreateDialogVisible(true)}
      />

      <Portal>
        <ProductDialog
          visible={editingProduct !== null}
          title="Produkt bearbeiten"
          initial={editingProduct ? {
            name: editingProduct.name || '',
            brand: editingProduct.brand || '',
            kcal: (editingProduct.nutriments?.energyKcal100g || 0).toString(),
            protein: (editingProduct.nutriments?.proteins100g || 0).toString(),
            carbs: (editingProduct.nutriments?.carbohydrates100g || 0).toString(),
            fat: (editingProduct.nutriments?.fat100g || 0).toString(),
          } : undefined}
          onDismiss={() => setEditingProduct(null)}
          onSave={handleEdit}
        />
        <ProductDialog
          visible={createDialogVisible}
          title="Produkt erstellen"
          onDismiss={() => setCreateDialogVisible(false)}
          onSave={handleCreate}
        />
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: '6%', paddingTop: 20, marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  listSection: { paddingHorizontal: '5%' },
  listCard: { borderRadius: 28, overflow: 'hidden' },
  empty: { fontStyle: 'italic', opacity: 0.5, textAlign: 'center', paddingVertical: 20 },
  productRow: { paddingHorizontal: 20, paddingVertical: 14, flexDirection: 'row', alignItems: 'center' },
  secondaryText: { opacity: 0.7, fontSize: 13 },
  swipeAction: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', paddingLeft: 20 },
  swipeActionRight: { alignItems: 'flex-end', paddingLeft: 0, paddingRight: 20 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 30 },
});
