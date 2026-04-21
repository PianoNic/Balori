import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FuelScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Surface style={styles.content} elevation={0}>
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>Fuel</Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
          Hier werden Kraftstoff-Infos angezeigt.
        </Text>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'transparent' },
});
