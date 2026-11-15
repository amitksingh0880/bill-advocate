import '@testing-library/jest-native/extend-expect';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    GestureHandlerRootView: ({ children, style, ...props }) => React.createElement(View, { ...props, style }, children),
    Swipeable: ({ children }) => children,
    DrawerLayout: ({ children }) => children,
    State: {},
    PanGestureHandler: ({ children }) => children,
    TapGestureHandler: ({ children }) => children,
    FlingGestureHandler: ({ children }) => children,
    ForceTouchGestureHandler: ({ children }) => children,
    LongPressGestureHandler: ({ children }) => children,
    PinchGestureHandler: ({ children }) => children,
    RotationGestureHandler: ({ children }) => children,
  };
});

// Mock react-native-reanimated
const createAnimationMock = () => {
  const handler = {
    get: (target, prop) => {
      if (prop === 'build') return () => ({});
      return (...args) => new Proxy({}, handler);
    }
  };
  return new Proxy({}, handler);
};

jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    default: {
      createAnimatedComponent: (c) => c,
      View: ({ children, style, ...props }) => React.createElement(View, { ...props, style }, children),
      Text: ({ children, style, ...props }) => React.createElement(Text, { ...props, style }, children),
    },
    useAnimatedStyle: (fn) => fn(),
    useSharedValue: (val) => ({ value: val }),
    useReducedMotion: () => false,
    useAnimatedRef: () => ({ current: null }),
    runOnJS: (fn) => fn,
    runOnUI: (fn) => fn,
    interpolateColor: (val, input, output) => output[0],
    withRepeat: (val) => val,

    withTiming: (val, config, cb) => {
      if (cb) cb(true);
      return val;
    },
    withSpring: (val, config, cb) => {
      if (cb) cb(true);
      return val;
    },
    withDelay: (delay, animation) => animation,
    Easing: {
      linear: (t) => t,
      ease: (t) => t,
      quad: (t) => t,
      cubic: (t) => t,
      bezier: () => (t) => t,
    },
    FadeIn: createAnimationMock(),
    FadeInUp: createAnimationMock(),
    FadeInDown: createAnimationMock(),
    FadeOut: createAnimationMock(),
    FadeOutUp: createAnimationMock(),
    FadeOutDown: createAnimationMock(),
    ZoomIn: createAnimationMock(),
    ZoomOut: createAnimationMock(),
    SlideInRight: createAnimationMock(),
    SlideInLeft: createAnimationMock(),
    SlideOutRight: createAnimationMock(),
    SlideOutLeft: createAnimationMock(),
  };
});

// Proxy-based mock for lucide-react-native
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === '__esModule') return true;
        const MockIcon = (props) => React.createElement(Text, { testID: `icon-${String(prop)}`, ...props }, String(prop));
        MockIcon.displayName = String(prop);
        return MockIcon;
      },
    }
  );
});

// Mock expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}), { virtual: true });

jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    BlurView: ({ children, style, ...props }) => React.createElement(View, { ...props, style }, children),
  };
}, { virtual: true });

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn().mockResolvedValue({ uri: 'file:///data/dispute-letter.pdf' }),
}), { virtual: true });

jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, style, ...props }) => React.createElement(View, { ...props, style }, children),
  };
}, { virtual: true });

jest.mock('expo-sharing', () => ({

  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}), { virtual: true });

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn().mockResolvedValue(true),
  isEnrolledAsync: jest.fn().mockResolvedValue(true),
  authenticateAsync: jest.fn().mockResolvedValue({ success: true }),
  supportedAuthenticationTypesAsync: jest.fn().mockResolvedValue([1, 2]),
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2 },
}), { virtual: true });

jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn(),
  EventEmitter: jest.fn(),
}), { virtual: true });



