import { ScrollView, StyleSheet } from 'react-native';
import { Text, Card, Chip, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const theme = useTheme();
  const subtextStyle = { color: theme.colors.onSurfaceVariant, marginTop: 8 };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="displaySmall" style={styles.title}>Explore</Text>

        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <Text variant="titleMedium">Featured</Text>
            <Text variant="bodyMedium" style={subtextStyle}>
              Discover new content and explore what Balori has to offer.
            </Text>
          </Card.Content>
          <Card.Actions>
            <Chip icon="arrow-right" onPress={() => {}}>View more</Chip>
          </Card.Actions>
        </Card>

        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium">Categories</Text>
            <Text variant="bodyMedium" style={subtextStyle}>
              Browse by category to find exactly what you need.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium">Trending</Text>
            <Text variant="bodyMedium" style={subtextStyle}>
              See what's popular right now.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24 },
  title: { marginBottom: 16 },
  card: { marginBottom: 12 },
});
