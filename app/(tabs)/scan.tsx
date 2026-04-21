import { useState, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, useTheme, Surface, Portal, Dialog } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { getProductByBarcode } from '@/services/open-food-facts';

export default function ScanScreen() {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [notFoundBarcode, setNotFoundBarcode] = useState<string | null>(null);
  const lastScannedRef = useRef<string | null>(null);

  useFocusEffect(useCallback(() => {
    setScanning(true);
    lastScannedRef.current = null;
  }, []));

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Surface style={styles.permissionContent} elevation={0}>
          <Text variant="headlineSmall" style={{ color: theme.colors.onBackground, textAlign: 'center' }}>
            Kamerazugriff benötigt
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
            Um Barcodes zu scannen, braucht Balori Zugriff auf deine Kamera.
          </Text>
          <Button mode="contained" onPress={requestPermission} style={styles.permissionButton}>
            Kamera freigeben
          </Button>
        </Surface>
      </Surface>
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
      setNotFoundBarcode(data);
    }
  }

  function dismissNotFound() {
    setNotFoundBarcode(null);
    setScanning(true);
    lastScannedRef.current = null;
  }

  return (
    <Surface style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={styles.header} elevation={0}>
        <Text variant="titleLarge" style={{ color: theme.colors.primary, fontWeight: 'bold', letterSpacing: 2 }}>
          BALORI
        </Text>
      </Surface>

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

      <Portal>
        <Dialog visible={notFoundBarcode !== null} onDismiss={dismissNotFound}>
          <Dialog.Title>Produkt nicht gefunden</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Barcode {notFoundBarcode} ist nicht in der Datenbank.</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={dismissNotFound}>OK</Button>
            <Button onPress={() => { setNotFoundBarcode(null); router.push('/create-product'); }}>
              Selbst anlegen
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Surface>
  );
}

const CORNER_SIZE = 30;
const CORNER_WIDTH = 4;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 16, backgroundColor: 'transparent' },
  permissionContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'transparent' },
  permissionButton: { marginTop: 24 },
  cameraContainer: { flex: 1, marginHorizontal: 24, borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  frame: { width: '70%', aspectRatio: 1.4, position: 'relative', backgroundColor: 'transparent' },
  corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, backgroundColor: 'transparent' },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH },
  cornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH },
  createButton: { alignSelf: 'center', marginTop: 24, marginBottom: 16, borderRadius: 24, paddingHorizontal: 16 },
});
