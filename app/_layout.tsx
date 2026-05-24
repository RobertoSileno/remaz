import { AuthProvider } from '@/contexts/auth-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="recover" />
        <Stack.Screen name="home" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="receipt" />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="orders" />
        <Stack.Screen name="profile" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
