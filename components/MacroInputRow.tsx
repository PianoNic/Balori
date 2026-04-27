import React from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface MacroInputRowProps {
  protein: string;
  carbs: string;
  fat: string;
  onProteinChange: (value: string) => void;
  onCarbsChange: (value: string) => void;
  onFatChange: (value: string) => void;
}

export function MacroInputRow({ protein, carbs, fat, onProteinChange, onCarbsChange, onFatChange }: MacroInputRowProps) {
  return (
    <View style={styles.row}>
      <TextInput label="Protein" value={protein} onChangeText={onProteinChange} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginRight: 4 }]} />
      <TextInput label="Carbs" value={carbs} onChangeText={onCarbsChange} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginHorizontal: 4 }]} />
      <TextInput label="Fat" value={fat} onChangeText={onFatChange} keyboardType="numeric" mode="outlined" style={[styles.flex1, { marginLeft: 4 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  flex1: { flex: 1 },
});
