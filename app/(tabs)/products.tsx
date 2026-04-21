import { ScrollView, StyleSheet } from 'react-native';
import { Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProductsScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text variant="displaySmall" style={[styles.title, { color: theme.colors.primary }]}>
          Produkte
        </Text>
        
        <List.Section>
          <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>Deine Inventur</List.Subheader>
          <List.Item
            title="Beispiel Produkt 1"
            description="Beschreibung oder Preis"
            left={props => <List.Icon {...props} icon="package-variant" />}
          />
          <Divider />
          <List.Item
            title="Beispiel Produkt 2"
            description="Beschreibung oder Preis"
            left={props => <List.Icon {...props} icon="package-variant" />}
          />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    marginLeft: 8,
  },
});