import { StyleSheet } from 'react-native';
import { Surface, Text, Button, useTheme } from 'react-native-paper';
import { router } from 'expo-router';

export default function ModalScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium">Modal</Text>
      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
        This is a modal screen.
      </Text>
      <Button mode="text" onPress={() => router.back()} style={styles.button}>Go back</Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  button: { marginTop: 16 },
});
