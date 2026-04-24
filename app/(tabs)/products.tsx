import type { Product } from '@/models/product';
import { deleteProduct, getProducts, saveProduct } from '@/services/storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Button, Card, Dialog, Divider, FAB, IconButton, Portal, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editKcal, setEditKcal] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFat, setEditFat] = useState('');
  const loadData = useCallback(async () => {
    try {
      const data = await getProducts();
      
      if (!Array.isArray(data)) {
        setProducts([]);
        return;
      }

      const sortedData = [...data].sort((a, b) => {
        const nameA = a?.name || '';
        const nameB = b?.name || '';
        return nameA.localeCompare(nameB);
      });
      
      setProducts(sortedData);
    } catch (error) {
      console.error('Fehler beim Laden der Produkte:', error);
      setProducts([]);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const handleRemoveProduct = async (barcode: string) => {
    if (!barcode) return;
    await deleteProduct(barcode);
    await loadData();
  };

  const handleAddToMeal = (product: Product) => {
    router.push({ 
      pathname: '/product-detail', 
      params: { 
        barcode: product.barcode || '', 
        productJson: JSON.stringify(product) 
      } 
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name || '');
    setEditBrand(product.brand || '');
    setEditKcal((product.nutriments?.['energy-kcal_100g'] || 0).toString());
    setEditProtein((product.nutriments?.proteins_100g || 0).toString());
    setEditCarbs((product.nutriments?.carbohydrates_100g || 0).toString());
    setEditFat((product.nutriments?.fat_100g || 0).toString());
  };

  const saveProductEdit = async () => {
    if (editingProduct) {
      const updatedProduct: Product = {
        ...editingProduct,
        name: editName,
        brand: editBrand,
        nutriments: {
          ...editingProduct.nutriments,
          'energy-kcal_100g': parseFloat(editKcal) || 0,
          proteins_100g: parseFloat(editProtein) || 0,
          carbohydrates_100g: parseFloat(editCarbs) || 0,
          fat_100g: parseFloat(editFat) || 0,
        }
      };
      await saveProduct(updatedProduct);
      await loadData();
    }
    setEditingProduct(null);
  };

  const renderLeftActions = () => {
    return (
      <View style={[styles.swipeActionLeft, { backgroundColor: theme.colors.errorContainer }]}>
        <IconButton icon="delete" iconColor={theme.colors.onErrorContainer} size={28} style={{ margin: 0 }} />
        <Text variant="labelLarge" style={{ color: theme.colors.onErrorContainer, marginLeft: 8 }}>Löschen</Text>
      </View>
    );
  };

  const renderRightActions = () => {
    return (
      <View style={[styles.swipeActionRight, { backgroundColor: theme.colors.primary }]}>
        <Text variant="labelLarge" style={{ color: theme.colors.onPrimary, marginRight: 8 }}>Eintragen</Text>
        <IconButton icon="plus-circle" iconColor={theme.colors.onPrimary} size={28} style={{ margin: 0 }} />
      </View>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text variant="displaySmall" style={[styles.bold, { color: theme.colors.onBackground }]}>My Products</Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            {products.length} {products.length === 1 ? 'Item' : 'Items'} saved
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Card style={styles.listCard} mode="contained">
            {products.length === 0 ? (
              <View style={styles.emptyState}>
                <IconButton icon="database-search" size={48} iconColor={theme.colors.onSurfaceVariant} />
                <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22 }}>
                  Keine Produkte gespeichert.{"\n"}Scanne neue Produkte oder lege sie manuell über das + an.
                </Text>
              </View>
            ) : (
              products.map((product, index) => {
                if (!product) return null;
                
                const pKcal = product.nutriments?.['energy-kcal_100g'] || 0;
                const pPro = product.nutriments?.proteins_100g || 0;
                const pCarbs = product.nutriments?.carbohydrates_100g || 0;
                const pFat = product.nutriments?.fat_100g || 0;
                
                const safeKey = product.barcode || `temp-${index}`;

                return (
                  <View key={safeKey}>
                    <Swipeable
                      renderLeftActions={renderLeftActions}
                      renderRightActions={renderRightActions}
                      overshootLeft={false}
                      overshootRight={false}
                      onSwipeableOpen={(direction) => {
                        if (direction === 'left' && product.barcode) {
                          handleRemoveProduct(product.barcode);
                        } else if (direction === 'right') {
                          handleAddToMeal(product);
                        }
                      }}
                    >
                      <Pressable 
                        style={[styles.productContainer, { backgroundColor: theme.colors.surfaceVariant }]}
                        onPress={() => openEditDialog(product)}
                      >
                        <View style={styles.productRowMain}>
                          <View style={{ flex: 1, paddingRight: 16 }}>
                            <Text variant="bodyLarge" style={styles.bold} numberOfLines={1}>{product.name || 'Unnamed Product'}</Text>
                            {!!product.brand && (
                              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{product.brand}</Text>
                            )}
                          </View>
                          <Text variant="bodyLarge" style={[styles.bold, { color: theme.colors.primary }]}>
                            {pKcal} kcal
                          </Text>
                        </View>
                        
                        <View style={styles.productRowSub}>
                          <Text variant="bodyMedium" style={styles.productSubText}>per 100g/ml</Text>
                          <Text variant="bodyMedium" style={styles.productSubText}>
                            P: {pPro}g  •  C: {pCarbs}g  •  F: {pFat}g
                          </Text>
                        </View>
                      </Pressable>
                    </Swipeable>
                    {index < products.length - 1 && <Divider style={styles.itemDivider} />}
                  </View>
                );
              })
            )}
          </Card>
        </ScrollView>

        {/* Floating Action Button */}
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color={theme.colors.onPrimary}
          onPress={() => router.push('/create-product')}
        />

        <Portal>
          {/* Dialog: Produkt bearbeiten */}
          <Dialog visible={editingProduct !== null} onDismiss={() => setEditingProduct(null)} style={{ backgroundColor: theme.colors.surface, maxHeight: '85%' }}>
            <Dialog.Title>Produkt bearbeiten</Dialog.Title>
            <Dialog.Content>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TextInput label="Name" value={editName} onChangeText={setEditName} mode="outlined" style={styles.inputSpacing} />
                <TextInput label="Marke (optional)" value={editBrand} onChangeText={setEditBrand} mode="outlined" style={styles.inputSpacing} />
                
                <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 4, color: theme.colors.onSurfaceVariant }}>
                  Nährwerte pro 100g/ml
                </Text>

                <TextInput label="Kalorien (kcal)" value={editKcal} onChangeText={setEditKcal} keyboardType="numeric" mode="outlined" style={styles.inputSpacing} />

                <View style={styles.inputRow}>
                  <TextInput label="Protein (g)" value={editProtein} onChangeText={setEditProtein} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginRight: 4 }]} />
                  <TextInput label="Carbs (g)" value={editCarbs} onChangeText={setEditCarbs} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginHorizontal: 4 }]} />
                  <TextInput label="Fat (g)" value={editFat} onChangeText={setEditFat} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginLeft: 4 }]} />
                </View>
              </ScrollView>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setEditingProduct(null)}>Abbrechen</Button>
              <Button onPress={saveProductEdit} mode="contained">Speichern</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: '6%', paddingTop: 20, marginBottom: 20 },
  bold: { fontWeight: 'bold' },
  scrollContent: { paddingHorizontal: '5%', paddingBottom: 100 }, 
  listCard: { borderRadius: 28, overflow: 'hidden', paddingVertical: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, paddingHorizontal: 20 },
  
  productContainer: { paddingHorizontal: 20, paddingVertical: 14 }, 
  productRowMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  productRowSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productSubText: { opacity: 0.7, fontSize: 13 },
  itemDivider: { marginVertical: 0, opacity: 0.5, marginHorizontal: 20 },
  
  swipeActionLeft: {
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    flexDirection: 'row',
    paddingLeft: 20 
  },
  swipeActionRight: {
    flex: 1, 
    justifyContent: 'flex-end', 
    alignItems: 'center', 
    flexDirection: 'row',
    paddingRight: 20 
  },
  
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 30,
  },
  inputSpacing: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flex1: { flex: 1 }
});