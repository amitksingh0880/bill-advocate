import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Badge } from '@amitsingh0880/cnnative-ui';
import { 
  SUPPORTED_LANGUAGES, 
  getCurrentLanguage, 
  setAppLanguage, 
  subscribeLanguageChange, 
  SupportedLanguage 
} from '../../i18n';

export interface LanguageSelectorProps {
  compact?: boolean;
}

export function LanguageSelector({ compact = false }: LanguageSelectorProps) {
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(getCurrentLanguage());

  useEffect(() => {
    return subscribeLanguageChange((lang) => {
      setSelectedLang(lang);
    });
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setAppLanguage(code);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SUPPORTED_LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          return (
            <Button
              key={lang.code}
              variant={isSelected ? 'default' : 'outline'}
              size={compact ? 'sm' : 'default'}
              onPress={() => handleSelect(lang.code)}
              style={[

                styles.button,
                isSelected ? styles.selectedButton : styles.unselectedButton,
              ]}
              testID={`lang-select-${lang.code}`}
            >
              {lang.nativeLabel}
            </Button>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    minWidth: 72,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  selectedButton: {
    backgroundColor: '#0f172a',
  },
  unselectedButton: {
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
  },
});
