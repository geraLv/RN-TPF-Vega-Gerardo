import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Photographic Notes' }} />
        <Stack.Screen name="create" options={{ title: 'New Note' }} />
        <Stack.Screen name="note/[id]" options={{ title: 'Note Details' }} />
        <Stack.Screen name="edit/[id]" options={{ title: 'Edit Note' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
