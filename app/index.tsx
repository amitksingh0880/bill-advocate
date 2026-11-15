import React, { useState } from 'react';
import { View, StyleSheet, Modal, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';



import { DocumentManager } from '../src/components/scanner/document-manager';
import { BillDetailsScreen } from '../src/screens/bill-details-screen';
import { DisputeModal } from '../src/screens/dispute-modal';
import { evaluateLineItem, EvaluatedLineItem } from '../src/services/pricing-engine';
import { DocumentPage, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '@amitsingh0880/cnnative-ui';
import { t } from '../src/i18n';

type AppStep = 'home' | 'scanner' | 'breakdown';

const SAMPLE_PAGES: DocumentPage[] = [
  { id: 'p1', pageNumber: 1, uri: 'file:///sample/page1.jpg', title: 'Summary Statement' },
  { id: 'p2', pageNumber: 2, uri: 'file:///sample/page2.jpg', title: 'Itemized Radiology & Labs' },
];

const DEFAULT_ITEMS: EvaluatedLineItem[] = [
  evaluateLineItem({
    id: 'item-1',
    code: '71260',
    rawDescription: 'CT THORAX W DYE',
    chargedPrice: 1850,
  }),
  evaluateLineItem({
    id: 'item-2',
    code: '80053',
    rawDescription: 'COMP METABOLIC PANEL',
    chargedPrice: 320,
  }),
  evaluateLineItem({
    id: 'item-3',
    code: 'J0696',
    rawDescription: 'CEFTRIAXONE 1G INJ',
    chargedPrice: 140,
  }),
];

const defaultMetrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 0, height: 0 },
};

export default function App() {
  const [step, setStep] = useState<AppStep>('breakdown');
  const [items, setItems] = useState<EvaluatedLineItem[]>(DEFAULT_ITEMS);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const handleAnalyzePages = (pages: DocumentPage[]) => {
    setItems(DEFAULT_ITEMS);
    setStep('breakdown');
  };

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics || defaultMetrics}>
      <View style={styles.webWrapper}>
        <SafeAreaView style={styles.container}>

        {step === 'home' && (
          <View style={styles.homeContainer}>
            <Card>
              <CardHeader>
                <View style={styles.badgeRow}>
                  <Badge variant="secondary">Direction 1 UI</Badge>
                  <Badge variant="outline">Verified Library</Badge>
                </View>
                <CardTitle>BillAdvocate</CardTitle>
                <CardDescription>Medical Billing Defense & Patient Advocacy</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" onPress={() => setStep('scanner')}>
                  Scan Medical Bill
                </Button>
              </CardContent>
            </Card>
          </View>
        )}

        {step === 'scanner' && (
          <View style={styles.screenPadding}>
            <DocumentManager
              initialPages={SAMPLE_PAGES}
              onAnalyze={handleAnalyzePages}
              onCancel={() => setStep('breakdown')}
            />
          </View>
        )}

        {step === 'breakdown' && (
          <BillDetailsScreen
            items={items}
            providerName="Metropolitan General Hospital"
            patientName="Jane Doe"
            serviceDate="November 12, 2026"
            onStartDispute={() => setShowDisputeModal(true)}
            onBack={() => setStep('scanner')}
          />
        )}

        {/* 1-Click Dual-Track Dispute Generator Modal */}
        <Modal
          visible={showDisputeModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowDisputeModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <DisputeModal
              items={items}
              providerName="Metropolitan General Hospital"
              patientName="Jane Doe"
              onClose={() => setShowDisputeModal(false)}
              onSuccess={() => setShowDisputeModal(false)}
            />
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );

}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: '#f8fafc',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh' as any,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: '#e2e8f0',
        }
      : {}),
  },
  homeContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  screenPadding: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
});
