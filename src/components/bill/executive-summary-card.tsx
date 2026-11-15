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
  Text 
} from '@amitsingh0880/cnnative-ui';
import { t } from '../../i18n';

export interface ExecutiveSummaryProps {
  totalCharged: number;
  totalFair: number;
  totalSavings: number;
  averageMultiplier: number;
}

export function ExecutiveSummaryCard({
  totalCharged,
  totalFair,
  totalSavings,
  averageMultiplier,
}: ExecutiveSummaryProps) {
  return (
    <Card className="w-full bg-slate-900 border-slate-800 text-white" style={styles.card}>
      <CardHeader>
        <View style={styles.badgeRow}>
          <Badge variant="destructive">
            {`${averageMultiplier.toFixed(1)}x Avg Markup`}
          </Badge>
          <Badge variant="outline" className="border-emerald-500 text-emerald-400">
            {`Potential Savings: $${totalSavings.toLocaleString()}`}
          </Badge>
        </View>
        <CardTitle className="text-white text-2xl font-bold">
          Hospital Bill Audit
        </CardTitle>
        <CardDescription className="text-slate-400">
          Evaluated against regional median Medicare and direct cash self-pay rates.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Total Billed
            </Text>
            <Text className="text-3xl font-bold text-rose-400">
              {`$${totalCharged.toLocaleString()}`}
            </Text>
          </View>

          <View style={styles.dividerVertical} />

          <View style={styles.metricBox}>
            <Text className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
              Fair Price
            </Text>
            <Text className="text-3xl font-bold text-emerald-400">
              {`$${totalFair.toLocaleString()}`}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 16,
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
  },
  dividerVertical: {
    width: 1,
    height: 48,
    backgroundColor: '#334155',
    marginHorizontal: 12,
  },
});
