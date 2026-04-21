import { useState, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { getProductByBarcode } from '@/services/open-food-facts';

export default function ScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const lastScannedRef = useRef<string | null>(null);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.permissionContent}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, textAlign: 'center' }}>
            Kamerazugriff benötigt
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            Um Barcodes zu scannen, braucht Balori Zugriff auf deine Kamera.
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            Kamera freigeben
          </Button>
        </View>
      </View>
    );
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (!scanning || data === lastScannedRef.current) return;

    setScanning(false);
    lastScannedRef.current = data;

    const result = await getProductByBarcode(data);

    if (result.found && result.product) {
      router.push({ pathname: '/product-detail', params: { barcode: data, productJson: JSON.stringify(result.product) } });
    } else {
      Alert.alert(
        'Produkt nicht gefunden',
        `Barcode ${data} ist nicht in der Datenbank.`,
        [
          { text: 'Nochmal', onPress: () => { setScanning(true); lastScannedRef.current = null; } },
          { text: 'Selbst anlegen', onPress: () => router.push('/create-product') },
        ],
      );
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 2 }}>
          BALORI
        </Text>
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128'] }}
          onBarcodeScanned={scanning ? handleBarcodeScanned : undefined}
        />
        <View style={styles.overlay}>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTopLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerTopRight, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: theme.colors.primary }]} />
            <View style={[styles.corner, styles.cornerBottomRight, { borderColor: theme.colors.primary }]} />
          </View>
        </View>
      </View>

      <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 16 }}>
        Barcode in den Rahmen halten
      </Text>

      <Button
        mode="contained"
        style={[styles.createButton, { backgroundColor: theme.colors.primary }]}
        labelStyle={{ color: theme.colors.onPrimary, letterSpacing: 1 }}
        onPress={() => router.push('/create-product')}
      >
        PRODUKT SELBST ANLEGEN
      </Button>

      {!scanning && (
        <Button
          mode="text"
          onPress={() => { setScanning(true); lastScannedRef.current = null; }}
          style={styles.retryButton}
        >
          Erneut scannen
        </Button>
      )}
    </View>
  );
}

const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 16 },
  permissionContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  permissionButton: { marginTop: 24 },
  cameraContainer: { flex: 1, marginHorizontal: 24, borderRadius: 16, overflow: 'hidden' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  frame: { width: '70%', aspectRatio: 1.4, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  createButton: { alignSelf: 'center', marginTop: 24, marginBottom: 16, borderRadius: 24, paddingHorizontal: 16 },
  retryButton: { alignSelf: 'center', marginBottom: 16 },
});
