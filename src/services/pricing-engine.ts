import benchmarksData from '../data/seed-benchmarks.json';
import { getCurrentLanguage, SupportedLanguage } from '../i18n';

export interface AlternativeOption {
  name: string;
  type: 'standalone_clinic' | 'online_pharmacy' | 'regional_lab';
  distanceMiles?: number;
  price: number;
  priceType: 'Cash Self-Pay' | 'Direct Online';
  badge?: string;
}

export interface PricingBenchmark {
  code: string;
  codeType: 'CPT' | 'HCPCS' | 'REV';
  names: {
    en: string;
    hi: string;
    ta: string;
    ur: string;
  };
  category: 'Imaging' | 'Pharmacy' | 'Emergency' | 'Laboratory' | 'Facility';
  cmsMedicareBase: number;
  fairCashMedian: number;
  alternatives: AlternativeOption[];
}

export type MarkupSeverity = 'fair' | 'mild' | 'moderate' | 'severe' | 'extreme';

export interface EvaluatedLineItem {
  id: string;
  code: string;
  rawDescription: string;
  localizedName: string;
  chargedPrice: number;
  fairPrice: number;
  multiplier: number;
  markupSeverity: MarkupSeverity;
  potentialSavings: number;
  alternatives: AlternativeOption[];
}

const benchmarkMap = new Map<string, PricingBenchmark>();
(benchmarksData as PricingBenchmark[]).forEach((item) => {
  benchmarkMap.set(item.code.toUpperCase(), item);
});

export function findBenchmark(code: string): PricingBenchmark | undefined {
  if (!code) return undefined;
  return benchmarkMap.get(code.trim().toUpperCase());
}

export function getLocalizedProcedureName(
  benchmark: PricingBenchmark, 
  lang: SupportedLanguage = getCurrentLanguage()
): string {
  if (benchmark.names && benchmark.names[lang]) {
    return benchmark.names[lang];
  }
  return benchmark.names?.en || benchmark.code;
}

export function determineMarkupSeverity(multiplier: number): MarkupSeverity {
  if (multiplier <= 1.25) return 'fair';
  if (multiplier <= 2.5) return 'mild';
  if (multiplier <= 5.0) return 'moderate';
  if (multiplier <= 10.0) return 'severe';
  return 'extreme';
}

export function evaluateLineItem(item: {
  id: string;
  code: string;
  rawDescription: string;
  chargedPrice: number;
}): EvaluatedLineItem {
  const benchmark = findBenchmark(item.code);
  const fairPrice = benchmark ? benchmark.fairCashMedian : item.chargedPrice;
  const multiplier = fairPrice > 0 ? item.chargedPrice / fairPrice : 1.0;
  const potentialSavings = Math.max(0, item.chargedPrice - fairPrice);
  const markupSeverity = determineMarkupSeverity(multiplier);
  const localizedName = benchmark 
    ? getLocalizedProcedureName(benchmark) 
    : item.rawDescription;

  return {
    id: item.id,
    code: item.code,
    rawDescription: item.rawDescription,
    localizedName,
    chargedPrice: item.chargedPrice,
    fairPrice,
    multiplier,
    markupSeverity,
    potentialSavings,
    alternatives: benchmark?.alternatives || [],
  };
}

export function calculateBillTotals(items: EvaluatedLineItem[]): {
  totalCharged: number;
  totalFair: number;
  totalSavings: number;
  averageMultiplier: number;
} {
  if (!items || items.length === 0) {
    return { totalCharged: 0, totalFair: 0, totalSavings: 0, averageMultiplier: 1.0 };
  }

  const totalCharged = items.reduce((acc, curr) => acc + curr.chargedPrice, 0);
  const totalFair = items.reduce((acc, curr) => acc + curr.fairPrice, 0);
  const totalSavings = Math.max(0, totalCharged - totalFair);
  const averageMultiplier = totalFair > 0 ? totalCharged / totalFair : 1.0;

  return {
    totalCharged: Math.round(totalCharged * 100) / 100,
    totalFair: Math.round(totalFair * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    averageMultiplier: Math.round(averageMultiplier * 100) / 100,
  };
}
