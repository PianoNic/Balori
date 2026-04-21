import { StyleSheet } from 'react-native';
import { Card, Surface, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrendScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <Surface style={styles.content} elevation={0}>
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>Trends</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Verbrauchsanalyse</Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              Sobald Daten verfügbar sind, erscheinen hier deine Statistiken.
            </Text>
          </Card.Content>
        </Card>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 24, backgroundColor: 'transparent' },
  title: { marginBottom: 24 },
  card: { marginTop: 8 },
});
