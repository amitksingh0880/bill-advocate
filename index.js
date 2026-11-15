import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import './src/global.css';
import App from './app/index';

const defaultMetrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

function Root() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics || defaultMetrics}>
      <App />
    </SafeAreaProvider>
  );
}

registerRootComponent(Root);
