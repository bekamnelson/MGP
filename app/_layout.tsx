import { Stack } from 'expo-router';
import { GradeProvider } from '../context/GradeContext';

export default function RootLayout() {
  return (
    <GradeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: 'Barème MGP' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </GradeProvider>
  );
}