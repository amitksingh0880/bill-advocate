import { I18nManager } from 'react-native';
import en from './translations/en.json';
import hi from './translations/hi.json';
import ta from './translations/ta.json';
import ur from './translations/ur.json';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'ur';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  isRTL: boolean;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', isRTL: false },
  { code: 'hi', label: 'हिंदी', nativeLabel: 'हिंदी', isRTL: false },
  { code: 'ta', label: 'தமிழ்', nativeLabel: 'தமிழ்', isRTL: false },
  { code: 'ur', label: 'اردو', nativeLabel: 'اردو', isRTL: true },
];


const dictionaries: Record<SupportedLanguage, any> = {
  en,
  hi,
  ta,
  ur,
};

let currentLanguage: SupportedLanguage = 'en';

type LanguageChangeListener = (lang: SupportedLanguage, isRTL: boolean) => void;
const listeners = new Set<LanguageChangeListener>();

export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage;
}

export function isCurrentRTL(): boolean {
  return currentLanguage === 'ur';
}

export function setAppLanguage(lang: SupportedLanguage): void {
  currentLanguage = lang;
  const isRTL = lang === 'ur';

  try {
    if (I18nManager && typeof I18nManager.forceRTL === 'function') {
      I18nManager.forceRTL(isRTL);
      if (typeof I18nManager.allowRTL === 'function') {
        I18nManager.allowRTL(isRTL);
      }
    }
  } catch {
    // In node/test environments without full native I18nManager
  }

  listeners.forEach((listener) => listener(lang, isRTL));
}

export function subscribeLanguageChange(listener: LanguageChangeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function t(key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  
  // Try current language
  let currentVal = dictionaries[currentLanguage];
  for (const k of keys) {
    if (currentVal && typeof currentVal === 'object' && k in currentVal) {
      currentVal = currentVal[k];
    } else {
      currentVal = undefined;
      break;
    }
  }

  // Fallback to English if not found
  if (currentVal === undefined) {
    let fallbackVal = dictionaries['en'];
    for (const k of keys) {
      if (fallbackVal && typeof fallbackVal === 'object' && k in fallbackVal) {
        fallbackVal = fallbackVal[k];
      } else {
        fallbackVal = undefined;
        break;
      }
    }
    currentVal = fallbackVal;
  }

  if (typeof currentVal !== 'string') {
    return key;
  }

  // Interpolate parameters {{param}}
  if (params) {
    return Object.entries(params).reduce((str, [paramKey, paramVal]) => {
      return str.replace(new RegExp(`{{\\s*${paramKey}\\s*}}`, 'g'), paramVal);
    }, currentVal);
  }

  return currentVal;
}
