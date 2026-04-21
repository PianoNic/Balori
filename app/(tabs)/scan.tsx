import { StyleSheet, View } from 'react-native';
import { FAB, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={styles.content}>
        <Text variant="displaySmall" style={{ color: theme.colors.primary }}>
          Scan
        </Text>
        <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
          Scanne ein Produkt oder einen Beleg ein.
        </Text>
        
        <FAB
          icon="barcode-scan"
          label="Scanner öffnen"
          style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={() => console.log('Scanner gestartet')}
          color={theme.colors.onPrimaryContainer}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fab: {
    marginTop: 32,
  },
});