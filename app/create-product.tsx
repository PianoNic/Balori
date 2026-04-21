import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

export default function CreateProductScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ color: theme.colors.onBackground }}>Create Product</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
