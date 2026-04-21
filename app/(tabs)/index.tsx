import { StyleSheet } from 'react-native';
import { Text, Button, Surface, useTheme } from 'react-native-paper';

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="displaySmall" style={styles.title}>
        Balori
      </Text>
      <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
        Home Screen
      </Text>
      <Button mode="contained" onPress={() => {}} style={styles.button}>
        Get Started
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});
