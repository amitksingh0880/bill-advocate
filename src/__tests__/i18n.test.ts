import { 
  t, 
  setAppLanguage, 
  getCurrentLanguage, 
  isCurrentRTL, 
  SUPPORTED_LANGUAGES 
} from '../i18n';

describe('Regional Language Localization Engine', () => {
  beforeEach(() => {
    setAppLanguage('en');
  });

  it('provides all 4 supported regional languages with correct metadata', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(4);
    const codes = SUPPORTED_LANGUAGES.map(l => l.code);
    expect(codes).toEqual(['en', 'hi', 'ta', 'ur']);

    const urdu = SUPPORTED_LANGUAGES.find(l => l.code === 'ur');
    expect(urdu?.isRTL).toBe(true);
    expect(urdu?.label).toBe('اردو');

    const hindi = SUPPORTED_LANGUAGES.find(l => l.code === 'hi');
    expect(hindi?.isRTL).toBe(false);
    expect(hindi?.label).toBe('हिंदी');

    const tamil = SUPPORTED_LANGUAGES.find(l => l.code === 'ta');
    expect(tamil?.isRTL).toBe(false);
    expect(tamil?.label).toBe('தமிழ்');
  });

  it('translates core medical billing keys in English', () => {
    setAppLanguage('en');
    expect(t('common.billed')).toBe('Billed Amount');
    expect(t('common.fairPrice')).toBe('Fair Cash Price');
    expect(t('common.cheaperNearby')).toBe('Where to get this cheaper');
    expect(isCurrentRTL()).toBe(false);
  });

  it('translates core medical billing keys in Hindi (हिंदी)', () => {
    setAppLanguage('hi');
    expect(getCurrentLanguage()).toBe('hi');
    expect(t('common.billed')).toBe('अस्पताल का बिल');
    expect(t('common.fairPrice')).toBe('उचित नकद मूल्य');
    expect(t('common.cheaperNearby')).toBe('यह जांच कहाँ सस्ती उपलब्ध है');
    expect(isCurrentRTL()).toBe(false);
  });

  it('translates core medical billing keys in Tamil (தமிழ்)', () => {
    setAppLanguage('ta');
    expect(getCurrentLanguage()).toBe('ta');
    expect(t('common.billed')).toBe('மருத்துவமனை கட்டணம்');
    expect(t('common.fairPrice')).toBe('நியாயமான கட்டணம்');
    expect(t('common.cheaperNearby')).toBe('இதை எங்கே மலிவாக பெறலாம்');
    expect(isCurrentRTL()).toBe(false);
  });

  it('translates core medical billing keys in Urdu (اردو) and activates RTL', () => {
    setAppLanguage('ur');
    expect(getCurrentLanguage()).toBe('ur');
    expect(t('common.billed')).toBe('ہسپتال کا بل');
    expect(t('common.fairPrice')).toBe('مناسب نقد قیمت');
    expect(t('common.cheaperNearby')).toBe('یہ ٹیسٹ کہاں سستا دستیاب ہے');
    expect(isCurrentRTL()).toBe(true);
  });

  it('supports parameter interpolation', () => {
    setAppLanguage('en');
    expect(t('dispute.potentialSavings', { amount: '$1,660' })).toBe('Potential Savings: $1,660');

    setAppLanguage('hi');
    expect(t('dispute.potentialSavings', { amount: '₹1,660' })).toBe('संभावित बचत: ₹1,660');
  });

  it('falls back to English key when translation is missing', () => {
    setAppLanguage('ta');
    expect(t('nonexistent.key')).toBe('nonexistent.key');
  });
});
