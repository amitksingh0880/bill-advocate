import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaProvider>
  );
}
