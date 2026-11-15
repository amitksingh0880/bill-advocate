import React from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  Badge, 
  Separator, 
  Text,
  ComparisonMeter,
  ComparisonRow,
} from '@amitsingh0880/cnnative-ui';
import { EvaluatedLineItem, findBenchmark, getLocalizedProcedureName } from '../../services/pricing-engine';
import { t, getCurrentLanguage } from '../../i18n';

export interface OverchargeItemCardProps {
  item: EvaluatedLineItem;
}

export function OverchargeItemCard({ item }: OverchargeItemCardProps) {
  const currentLang = getCurrentLanguage();
  const benchmark = findBenchmark(item.code);
  const localizedTitle = benchmark 
    ? getLocalizedProcedureName(benchmark, currentLang) 
    : item.rawDescription;

  const severityVariant = 
    item.markupSeverity === 'extreme' || item.markupSeverity === 'severe'
      ? 'destructive'
      : item.markupSeverity === 'moderate'
      ? 'secondary'
      : 'outline';

  return (
    <Card className="w-full mb-4 border-slate-200 shadow-sm" style={styles.card}>
      <CardHeader>
        <View style={styles.headerRow}>
          <Badge variant={severityVariant}>
            {`${item.multiplier.toFixed(1)}x Markup`}
          </Badge>
          <Text className="text-xs font-mono text-slate-500">
            {`CPT ${item.code}`}
          </Text>
        </View>
        <CardTitle className="text-lg font-bold text-slate-900 mt-1">
          {localizedTitle}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 font-mono">
          {`Statement: "${item.rawDescription}"`}
        </CardDescription>
      </CardHeader>

      <CardContent style={styles.content}>
        {/* ComparisonMeter from @amitsingh0880/cnnative-ui */}
        <ComparisonMeter
          value={item.chargedPrice}
          benchmark={item.fairPrice}
          labels={{
            valueLabel: t('common.billed'),
            benchmarkLabel: t('common.fairPrice'),
          }}
          formatValue={(val) => `$${val.toLocaleString()}`}
        />

        {/* Alternative Providers "Where is this cheaper?" */}
        {item.alternatives.length > 0 && (
          <View style={styles.alternativesSection}>
            <Separator style={styles.separator} />
            <Text className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              {t('common.cheaperNearby')}
            </Text>

            <View style={styles.alternativesList}>
              {item.alternatives.map((alt, idx) => {
                const deltaSavings = Math.max(0, item.chargedPrice - alt.price);
                const subtitle = alt.distanceMiles 
                  ? t('common.milesAway', { distance: String(alt.distanceMiles) })
                  : alt.type === 'online_pharmacy' ? t('common.directOnline') : t('common.cashSelfPay');

                return (
                  <ComparisonRow
                    key={`${alt.name}-${idx}`}
                    title={alt.name}
                    subtitle={subtitle}
                    price={`$${alt.price.toLocaleString()}`}
                    priceSubtext={alt.priceType}
                    badgeText={alt.badge}
                    deltaText={deltaSavings > 0 ? `Save $${deltaSavings.toLocaleString()}` : undefined}
                    style={styles.comparisonRow}
                  />
                );
              })}
            </View>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    gap: 12,
  },
  alternativesSection: {
    marginTop: 8,
  },
  separator: {
    marginBottom: 10,
  },
  alternativesList: {
    gap: 8,
  },
  comparisonRow: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
