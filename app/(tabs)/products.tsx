import React, { useState, useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Button, IconButton, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { getProducts, deleteProduct } from '@/services/storage';
import type { Product } from '@/models/product';

export default function ProductsScreen() {
  const theme = useTheme();
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = useCallback(async () => {
    setProducts(await getProducts());
  }, []);

  useFocusEffect(useCallback(() => { loadProducts(); }, [loadProducts]));

  const handleTap = (product: Product) => {
    router.push({
      pathname: '/product-detail',
      params: { barcode: product.barcode, productJson: JSON.stringify(product) },
    });
  };

  const handleDelete = async (barcode: string) => {
    await deleteProduct(barcode);
    await loadProducts();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>
            Products
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            {products.length} {products.length === 1 ? 'product' : 'products'} saved
          </Text>
        </View>

        {products.length === 0 && (
          <View style={styles.emptyState}>
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
              No products yet
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 4, opacity: 0.7 }}>
              Scan a barcode or create a product manually
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/create-product')}
              style={styles.addButton}
              icon="plus"
            >
              CREATE PRODUCT
            </Button>
          </View>
        )}

        <View style={styles.list}>
          {products.map((product) => (
            <Pressable key={product.barcode} onPress={() => handleTap(product)}>
              <Surface style={[styles.card, { backgroundColor: theme.colors.elevation.level2 }]} elevation={0}>
                <View style={styles.cardContent}>
                  <View style={{ flex: 1 }}>
                    <Text variant="titleMedium" style={[styles.bold, { color: theme.colors.onBackground }]}>
                      {product.name ?? 'Unknown'}
                    </Text>
                    {product.brand && (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{product.brand}</Text>
                    )}
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                      {product.nutriments.energyKcal100g ?? 0} kcal
                      {product.nutriments.proteins100g !== null && `  •  P: ${product.nutriments.proteins100g}g`}
                      {product.nutriments.carbohydrates100g !== null && `  •  C: ${product.nutriments.carbohydrates100g}g`}
                      {product.nutriments.fat100g !== null && `  •  F: ${product.nutriments.fat100g}g`}
                    </Text>
                  </View>
                  <IconButton
                    icon="delete-outline"
                    iconColor={theme.colors.error}
                    size={20}
                    onPress={() => handleDelete(product.barcode)}
                    style={{ margin: 0 }}
                  />
                </View>
              </Surface>
            </Pressable>
          ))}
        </View>

        {products.length > 0 && (
          <Button
            mode="contained-tonal"
            onPress={() => router.push('/create-product')}
            style={styles.bottomAddButton}
            icon="plus"
          >
            ADD PRODUCT
          </Button>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: '6%', paddingTop: 20, marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  addButton: { marginTop: 24, borderRadius: 24 },
  list: { paddingHorizontal: '5%', gap: 10 },
  card: { borderRadius: 16, padding: 16 },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  bottomAddButton: { alignSelf: 'center', marginTop: 24, borderRadius: 24 },
});
