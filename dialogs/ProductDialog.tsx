import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Text, TextInput, useTheme } from 'react-native-paper';
import { MacroInputRow } from '@/components/MacroInputRow';

interface ProductDialogProps {
  visible: boolean;
  title: string;
  initial?: {
    name: string;
    brand: string;
    kcal: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  onDismiss: () => void;
  onSave: (values: { name: string; brand: string; kcal: string; protein: string; carbs: string; fat: string }) => void;
}

export function ProductDialog({ visible, title, initial, onDismiss, onSave }: ProductDialogProps) {
  const theme = useTheme();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  useEffect(() => {
    if (visible && initial) {
      setName(initial.name);
      setBrand(initial.brand);
      setKcal(initial.kcal);
      setProtein(initial.protein);
      setCarbs(initial.carbs);
      setFat(initial.fat);
    }
    if (visible && !initial) {
      setName('');
      setBrand('');
      setKcal('');
      setProtein('');
      setCarbs('');
      setFat('');
    }
  }, [visible, initial]);

  const canSave = name.trim().length > 0;

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: theme.colors.surface, maxHeight: '85%' }}>
      <Dialog.Title>{title}</Dialog.Title>
      <Dialog.Content>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput label="Name" value={name} onChangeText={setName} mode="outlined" style={styles.inputSpacing} />
          <TextInput label="Marke (optional)" value={brand} onChangeText={setBrand} mode="outlined" style={styles.inputSpacing} />
          <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 4, color: theme.colors.onSurfaceVariant }}>
            Nährwerte pro 100g/ml
          </Text>
          <TextInput label="Kalorien (kcal)" value={kcal} onChangeText={setKcal} keyboardType="numeric" mode="outlined" style={styles.inputSpacing} />
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
        <Button onPress={onDismiss}>Abbrechen</Button>
        <Button onPress={() => onSave({ name, brand, kcal, protein, carbs, fat })} disabled={!canSave} mode="contained">Speichern</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  inputSpacing: { marginBottom: 12 },
});
