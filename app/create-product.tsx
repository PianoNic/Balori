import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Button, Surface, Text, TextInput, useTheme } from 'react-native-paper';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveProduct, generateId } from '@/services/storage';
import type { Product } from '@/models/product';

export default function CreateProductScreen() {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const canSave = name.trim().length > 0 && calories.trim().length > 0;

  async function handleSave() {
    const product: Product = {
      barcode: `custom_${generateId()}`,
      name: name.trim(),
      brand: null,
      quantity: null,
      categories: [],
      imageUrl: null,
      imageThumbnailUrl: null,
      nutriments: {
        energyKcal100g: parseFloat(calories) || 0,
        proteins100g: parseFloat(protein) || null,
        carbohydrates100g: parseFloat(carbs) || null,
        fat100g: parseFloat(fat) || null,
        saturatedFat100g: null,
        sugars100g: null,
        fiber100g: null,
        salt100g: null,
        sodium100g: null,
      },
      nutriScore: null,
      novaGroup: null,
      nutrientLevels: { fat: null, saturatedFat: null, sugars: null, salt: null },
    };
    await saveProduct(product);
    router.replace({
      pathname: '/product-detail',
      params: { barcode: product.barcode, productJson: JSON.stringify(product) },
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header style={{ backgroundColor: theme.colors.background }} statusBarHeight={0}>
        <Appbar.Action icon="close" onPress={() => router.back()} />
        <Appbar.Content title="BALORI" titleStyle={styles.appbarTitle} />
        <Appbar.Action icon="close" style={{ opacity: 0 }} />
      </Appbar.Header>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
          Create Product
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 24 }}>
          Add a custom food item to your database.
        </Text>

        <Surface style={[styles.section, { backgroundColor: theme.colors.elevation.level2 }]} elevation={0}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            REQUIRED INFO
          </Text>
          <TextInput
            label="Name *"
            placeholder="e.g. Almond Butter"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Calories (per 100g) *"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            mode="outlined"
            right={<TextInput.Affix text="KCAL" />}
            style={styles.input}
          />
        </Surface>

        <Surface style={[styles.section, { backgroundColor: theme.colors.elevation.level2 }]} elevation={0}>
          <Text variant="labelLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            MACRONUTRIENTS{' '}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>(optional, per 100g)</Text>
          </Text>
          <Surface style={styles.macroRow} elevation={0}>
            <TextInput
              label="CARBS"
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="g" />}
              style={styles.macroInput}
            />
            <TextInput
              label="PROTEIN"
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="g" />}
              style={styles.macroInput}
            />
            <TextInput
              label="FAT"
              value={fat}
              onChangeText={setFat}
              keyboardType="numeric"
              mode="outlined"
              right={<TextInput.Affix text="g" />}
              style={styles.macroInput}
            />
          </Surface>
        </Surface>

        <Button
          mode="contained"
          icon="content-save"
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveButton, { backgroundColor: canSave ? theme.colors.primary : theme.colors.surfaceDisabled }]}
          labelStyle={{ color: canSave ? theme.colors.onPrimary : theme.colors.onSurfaceDisabled, letterSpacing: 1, fontWeight: 'bold' }}
        >
          SPEICHERN
        </Button>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  appbarTitle: { fontWeight: 'bold', letterSpacing: 2, textAlign: 'center' },
  content: { padding: 24 },
  title: { fontWeight: 'bold' },
  section: { borderRadius: 16, padding: 20, marginBottom: 20 },
  sectionTitle: { fontWeight: 'bold', letterSpacing: 1, marginBottom: 16 },
  input: { marginBottom: 12 },
  macroRow: { flexDirection: 'row', gap: 8, backgroundColor: 'transparent' },
  macroInput: { flex: 1 },
  saveButton: { marginTop: 4, marginBottom: 24, borderRadius: 24, paddingVertical: 4 },
});
