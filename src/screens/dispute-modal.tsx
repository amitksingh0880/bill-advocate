import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Button, 
  Badge, 
  Separator, 
  Text 
} from '@amitsingh0880/cnnative-ui';
import { DisputeTrack, DisputePayload, generateHospitalAuditDispute, generateCollectionsValidationDispute } from '../services/dispute-generator';
import { exportDisputePdf } from '../services/pdf-service';
import { EvaluatedLineItem } from '../services/pricing-engine';
import { t } from '../i18n';

export interface DisputeModalProps {
  items: EvaluatedLineItem[];
  providerName: string;
  patientName?: string;
  accountNumber?: string;
  dateOfService?: string;
  onClose: () => void;
  onSuccess?: (uri: string, track: DisputeTrack) => void;
}

export function DisputeModal({
  items,
  providerName,
  patientName = 'Jane Doe',
  accountNumber = 'ACC-984712',
  dateOfService = 'November 10, 2026',
  onClose,
  onSuccess,
}: DisputeModalProps) {
  const [activeTrack, setActiveTrack] = useState<DisputeTrack>('hospital_audit');
  const [isExporting, setIsExporting] = useState(false);

  const payload: DisputePayload = {
    patientName,
    providerName,
    accountNumber,
    dateOfService,
    items,
  };

  const currentDispute = activeTrack === 'hospital_audit'
    ? generateHospitalAuditDispute(payload)
    : generateCollectionsValidationDispute(payload);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const uri = await exportDisputePdf({ track: activeTrack, payload });
      onSuccess?.(uri, activeTrack);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <View style={styles.topRow}>
          <Badge variant={activeTrack === 'hospital_audit' ? 'secondary' : 'destructive'}>
            {activeTrack === 'hospital_audit' ? 'Hospital Track' : 'Collections Track'}
          </Badge>
          <Button variant="ghost" size="sm" onPress={onClose}>
            {t('common.cancel')}
          </Button>
        </View>
        <CardTitle>{t('dispute.disputeLetterTitle')}</CardTitle>
        <CardDescription>
          Select dispute routing based on who sent this bill.
        </CardDescription>
      </CardHeader>

      <CardContent style={styles.content}>
        {/* Track Selector Tabs using library Button */}
        <View style={styles.tabBar}>
          <Button
            variant={activeTrack === 'hospital_audit' ? 'default' : 'outline'}
            size="sm"
            style={styles.tabBtn}
            onPress={() => setActiveTrack('hospital_audit')}
          >
            Hospital Audit & 501(r)
          </Button>
          <Button
            variant={activeTrack === 'collections_validation' ? 'default' : 'outline'}
            size="sm"
            style={styles.tabBtn}
            onPress={() => setActiveTrack('collections_validation')}
          >
            Debt Validation (FDCPA)
          </Button>
        </View>

        <Separator />

        {/* Letter Preview Box */}
        <View style={styles.letterPreviewBox}>
          <Text className="font-bold text-sm text-slate-900 mb-1">
            {currentDispute.title}
          </Text>
          <Text className="text-xs text-slate-500 mb-2">
            {`Recipient: ${currentDispute.recipient}`}
          </Text>
          <ScrollView style={styles.scrollPreview}>
            <Text className="text-xs text-slate-700 font-mono leading-relaxed">
              {currentDispute.content}
            </Text>
          </ScrollView>
        </View>
      </CardContent>

      <CardFooter style={styles.footer}>
        <Button variant="outline" onPress={onClose}>
          {t('common.back')}
        </Button>
        <Button 
          variant="default" 
          disabled={isExporting} 
          onPress={handleExport}
          style={styles.exportBtn}
        >
          {t('common.exportPdf')}
        </Button>
      </CardFooter>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  content: {
    gap: 12,
  },
  tabBar: {
    flexDirection: 'row',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
  },
  letterPreviewBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    maxHeight: 260,
  },
  scrollPreview: {
    maxHeight: 180,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  exportBtn: {
    minWidth: 160,
  },
});
