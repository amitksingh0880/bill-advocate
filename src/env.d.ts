/// <reference types="nativewind/types" />
/// <reference types="react-native-css-interop/types" />
/// <reference types="jest" />

declare module 'lucide-react-native' {
  import * as React from 'react';
  export interface LucideProps {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
    style?: any;
    testID?: string;
  }
  export type Icon = React.FC<LucideProps>;
  export const Check: Icon;
  export const RefreshCw: Icon;
  export const Fingerprint: Icon;
  export const ScanFace: Icon;
  export const Star: Icon;
  export const ChevronDown: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const MoreHorizontal: Icon;
  export const X: Icon;
  export const Plus: Icon;
  const anyIcon: Icon;
  export default anyIcon;
}
