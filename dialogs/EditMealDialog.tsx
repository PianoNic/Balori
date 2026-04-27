import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, Text, TextInput, useTheme } from 'react-native-paper';
import { MacroInputRow } from '@/components/MacroInputRow';

interface EditMealDialogProps {
  visible: boolean;
  name: string;
  amount: string;
  kcal: string;
  protein: string;
  carbs: string;
  fat: string;
  onNameChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onKcalChange: (value: string) => void;
  onProteinChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  onFatChange: (value: string) => void;
  onDismiss: () => void;
  onSave: () => void;
}

export function EditMealDialog({
  visible, name, amount, kcal, protein, carbs, fat,
  onNameChange, onAmountChange, onKcalChange, onProteinChange, onCarbsChange, onFatChange,
  onDismiss, onSave,
}: EditMealDialogProps) {
  const theme = useTheme();

  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={{ backgroundColor: theme.colors.surface, maxHeight: '80%' }}>
      <Dialog.Title>Eintrag bearbeiten</Dialog.Title>
      <Dialog.Content>
        <ScrollView showsVerticalScrollIndicator={false}>
          <TextInput label="Name" value={name} onChangeText={onNameChange} mode="outlined" style={styles.inputSpacing} />
          <View style={styles.inputRow}>
            <TextInput label="Menge (g/ml)" value={amount} onChangeText={onAmountChange} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginRight: 4 }]} />
            <TextInput label="Kalorien (kcal)" value={kcal} onChangeText={onKcalChange} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginLeft: 4 }]} />
          </View>
          <Text variant="labelLarge" style={{ marginTop: 8, marginBottom: 4, color: theme.colors.onSurfaceVariant }}>Makros (g)</Text>
          <MacroInputRow
            protein={protein}
            carbs={carbs}
            fat={fat}
            onProteinChange={onProteinChange}
            onCarbsChange={onCarbsChange}
            onFatChange={onFatChange}
          />
        </ScrollView>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Abbrechen</Button>
        <Button onPress={onSave}>Speichern</Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  inputSpacing: { marginBottom: 12 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flex1: { flex: 1 },
});
