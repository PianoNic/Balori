import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Text, TextInput, useTheme } from 'react-native-paper';
import { MacroInputRow } from '@/components/MacroInputRow';
import { saveProduct, generateId } from '@/services/storage';
import type { Product } from '@/models/product';

interface CreateProductDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onCreated: () => void;
}

export function CreateProductDialog({ visible, onDismiss, onCreated }: CreateProductDialogProps) {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const canSave = name.trim().length > 0 && calories.trim().length > 0;

  function reset() {
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
  }

  async function handleSave() {
    const product: Product = {
      barcode: `custom_${generateId()}`,
      name: name.trim(),
      brand: null,
      imageUrl: null,
      nutriments: {
        energyKcal100g: parseFloat(calories) || 0,
        proteins100g: parseFloat(protein) || null,
        carbohydrates100g: parseFloat(carbs) || null,
        fat100g: parseFloat(fat) || null,
      },
    };
    await saveProduct(product);
    reset();
    onCreated();
  }

  function handleDismiss() {
    reset();
    onDismiss();
  }

  return (
    <Dialog visible={visible} onDismiss={handleDismiss} style={{ backgroundColor: theme.colors.surface, maxHeight: '85%' }}>
      <Dialog.Title>Produkt erstellen</Dialog.Title>
      <Dialog.Content>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput
            label="Name *"
            placeholder="e.g. Almond Butter"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.inputSpacing}
          />
          <TextInput
            label="Kalorien (per 100g) *"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
            mode="outlined"
            style={styles.inputSpacing}
          />
          <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 4, color: theme.colors.onSurfaceVariant }}>
            Makros (optional, per 100g)
          </Text>
          <MacroInputRow
            protein={protein}
            carbs={carbs}
            fat={fat}
            onProteinChange={setProtein}
            onCarbsChange={setCarbs}
            onFatChange={setFat}
          />
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={handleDismiss}>Abbrechen</Button>
        <Button onPress={handleSave} disabled={!canSave} mode="contained">Speichern</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  inputSpacing: { marginBottom: 12 },
});
