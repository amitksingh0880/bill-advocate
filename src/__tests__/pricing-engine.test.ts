import { 
  findBenchmark, 
  evaluateLineItem, 
  calculateBillTotals, 
  getLocalizedProcedureName 
} from '../services/pricing-engine';
import { setAppLanguage } from '../i18n';

describe('Pricing Engine & Alternative Benchmarks', () => {
  beforeEach(() => {
    setAppLanguage('en');
  });

  it('looks up a benchmark by CPT code (71260 - Chest CT Scan)', () => {
    const benchmark = findBenchmark('71260');
    expect(benchmark).toBeDefined();
    expect(benchmark?.names.en).toBe('Chest CT Scan with Contrast');
    expect(benchmark?.fairCashMedian).toBe(190);
    expect(benchmark?.alternatives.length).toBeGreaterThan(0);
  });

  it('returns localized procedure names for all 4 regional languages', () => {
    const benchmark = findBenchmark('71260');
    expect(benchmark).toBeDefined();

    setAppLanguage('en');
    expect(getLocalizedProcedureName(benchmark!)).toBe('Chest CT Scan with Contrast');

    setAppLanguage('hi');
    expect(getLocalizedProcedureName(benchmark!)).toBe('सीने का सीटी स्कैन (कंट्रास्ट सहित)');

    setAppLanguage('ta');
    expect(getLocalizedProcedureName(benchmark!)).toBe('மார்பு CT ஸ்கேன் (கான்ட்ராஸ்ட் உடன்)');

    setAppLanguage('ur');
    expect(getLocalizedProcedureName(benchmark!)).toBe('سینے کا سی ٹی اسکین (کنٹراسٹ کے ساتھ)');
  });

  it('evaluates line item overcharges and classifies severity correctly', () => {
    // Charged $1,850 when fair price is $190 (~9.7x markup)
    const evaluated = evaluateLineItem({
      id: 'item-1',
      code: '71260',
      rawDescription: 'CT THORAX W DYE',
      chargedPrice: 1850,
    });

    expect(evaluated.chargedPrice).toBe(1850);
    expect(evaluated.fairPrice).toBe(190);
    expect(evaluated.multiplier).toBeCloseTo(9.74, 1);
    expect(evaluated.markupSeverity).toBe('severe');
    expect(evaluated.potentialSavings).toBe(1660);
    expect(evaluated.alternatives.length).toBeGreaterThanOrEqual(1);

    // Verify alternative option has required fields
    const alt = evaluated.alternatives[0];
    expect(alt.name).toBeTruthy();
    expect(alt.price).toBeLessThan(evaluated.chargedPrice);
    expect(alt.priceType).toBeTruthy();
  });

  it('gracefully handles procedures without exact benchmark match', () => {
    const evaluated = evaluateLineItem({
      id: 'item-custom',
      code: '99999',
      rawDescription: 'MISC EMERGENCY SUPPLIES',
      chargedPrice: 350,
    });

    expect(evaluated.fairPrice).toBe(350);
    expect(evaluated.multiplier).toBe(1.0);
    expect(evaluated.markupSeverity).toBe('fair');
    expect(evaluated.potentialSavings).toBe(0);
    expect(evaluated.alternatives).toHaveLength(0);
  });

  it('calculates total bill breakdown across multiple line items', () => {
    const items = [
      evaluateLineItem({ id: '1', code: '71260', rawDescription: 'CT SCAN', chargedPrice: 1850 }),
      evaluateLineItem({ id: '2', code: '80053', rawDescription: 'COMP METABOLIC PANEL', chargedPrice: 320 }),
      evaluateLineItem({ id: '3', code: 'J0696', rawDescription: 'CEFTRIAXONE 1G INJ', chargedPrice: 140 }),
    ];

    const totals = calculateBillTotals(items);
    expect(totals.totalCharged).toBe(1850 + 320 + 140);
    expect(totals.totalFair).toBeLessThan(totals.totalCharged);
    expect(totals.totalSavings).toBe(totals.totalCharged - totals.totalFair);
    expect(totals.averageMultiplier).toBeGreaterThan(1);
  });
});
