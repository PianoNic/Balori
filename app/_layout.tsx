import { baloriTheme } from '@/constants/theme';
import {
  Epilogue_400Regular,
  Epilogue_500Medium,
  Epilogue_600SemiBold,
  Epilogue_700Bold,
} from '@expo-google-fonts/epilogue';
import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';

SplashScreen.preventAutoHideAsync();

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: baloriTheme.colors.background,
    card: baloriTheme.colors.elevation.level1,
    text: baloriTheme.colors.onBackground,
    border: baloriTheme.colors.outlineVariant,
    primary: baloriTheme.colors.primary,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Epilogue_400Regular,
    Epilogue_500Medium,
    Epilogue_600SemiBold,
    Epilogue_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded)
      SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded)
    return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={baloriTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="product-detail" options={{ headerShown: false }} />
            <Stack.Screen name="create-product" options={{ presentation: 'modal', headerShown: false }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}