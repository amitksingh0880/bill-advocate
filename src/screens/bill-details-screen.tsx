import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { 
  Button, 
  Card, 
  Text,
  Badge,
} from '@amitsingh0880/cnnative-ui';
import { LanguageSelector } from '../components/common/language-selector';
import { ExecutiveSummaryCard } from '../components/bill/executive-summary-card';
import { OverchargeItemCard } from '../components/bill/overcharge-item-card';
import { EvaluatedLineItem, calculateBillTotals } from '../services/pricing-engine';
import { t, subscribeLanguageChange, isCurrentRTL, SupportedLanguage } from '../i18n';

export interface BillDetailsScreenProps {
  items: EvaluatedLineItem[];
  patientName?: string;
  providerName?: string;
  serviceDate?: string;
  onStartDispute: () => void;
  onBack?: () => void;
}

export function BillDetailsScreen({
  items,
  patientName = 'Guest Patient',
  providerName = 'Regional Health Center',
  serviceDate = 'November 2026',
  onStartDispute,
  onBack,
}: BillDetailsScreenProps) {
  const [, setLangTick] = useState(0);
  const rtl = isCurrentRTL();

  useEffect(() => {
    return subscribeLanguageChange(() => {
      // Re-render when language switches
      setLangTick((prev) => prev + 1);
    });
  }, []);

  const totals = calculateBillTotals(items);

  return (
    <View style={[styles.root, rtl && styles.rtlRoot]}>
      {/* Pinned Language Selector & Header */}
      <View style={styles.headerBar}>
        <View style={styles.titleRow}>
          <Text className="text-xl font-bold text-slate-900">
            {t('common.appName')}
          </Text>
          <Badge variant="outline">
            {t('common.guestMode')}
          </Badge>
        </View>
        <LanguageSelector compact />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Executive Summary Card */}
        <ExecutiveSummaryCard
          totalCharged={totals.totalCharged}
          totalFair={totals.totalFair}
          totalSavings={totals.totalSavings}
          averageMultiplier={totals.averageMultiplier}
        />

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text className="text-base font-bold text-slate-800">
            {`Itemized Billing Audit (${items.length} items)`}
          </Text>
          <Text className="text-xs text-slate-500">
            {`Provider: ${providerName}`}
          </Text>
        </View>

        {/* List of Overcharge Cards with ComparisonMeter and ComparisonRow */}
        {items.map((item) => (
          <OverchargeItemCard key={item.id} item={item} />
        ))}
      </ScrollView>

      {/* Floating Action Footer */}
      <View style={styles.footerBar}>
        {onBack && (
          <Button variant="outline" onPress={onBack} style={styles.backBtn}>
            {t('common.back')}
          </Button>
        )}
        <Button 
          variant="default" 
          onPress={onStartDispute}
          style={styles.disputeBtn}
        >
          {t('common.disputeOvercharges')}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  rtlRoot: {
    // React Native handles RTL through I18nManager
  },

  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scrollBody: {
    padding: 16,
    paddingBottom: 96,
    gap: 16,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: -4,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  backBtn: {
    minWidth: 80,
  },
  disputeBtn: {
    flex: 1,
  },
});
