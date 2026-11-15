import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { LanguageSelector } from '../components/common/language-selector';
import { getCurrentLanguage, setAppLanguage } from '../i18n';

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    setAppLanguage('en');
  });

  it('renders all language pills', () => {
    render(<LanguageSelector />);
    expect(screen.getByText('English')).toBeTruthy();
    expect(screen.getByText('हिंदी')).toBeTruthy();
    expect(screen.getByText('தமிழ்')).toBeTruthy();
    expect(screen.getByText('اردو')).toBeTruthy();
  });

  it('switches active language when tapped', () => {
    const { getByTestId } = render(<LanguageSelector />);
    const hindiButton = getByTestId('lang-select-hi');
    fireEvent.press(hindiButton);
    expect(getCurrentLanguage()).toBe('hi');

    const urduButton = getByTestId('lang-select-ur');
    fireEvent.press(urduButton);
    expect(getCurrentLanguage()).toBe('ur');
  });

});
