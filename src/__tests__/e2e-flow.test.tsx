import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { BillDetailsScreen } from '../screens/bill-details-screen';
import { DocumentManager } from '../components/scanner/document-manager';
import { DisputeModal } from '../screens/dispute-modal';
import { evaluateLineItem } from '../services/pricing-engine';
import { saveBill, getBillById, updateDisputeStatus } from '../db/bill-repository';
import { setAppLanguage, getCurrentLanguage, isCurrentRTL } from '../i18n';

describe('End-to-End User Journey (Direction 1 UI in Regional Languages)', () => {
  beforeEach(() => {
    setAppLanguage('en');
  });

  it('runs complete patient advocacy flow from multi-page capture to translation and dispute export', async () => {
    // 1. User reviews photographed paper bill pages in DocumentScrubber
    const mockPages = [
      { id: 'page-1', pageNumber: 1, uri: 'file:///data/bill-page-1.jpg', title: 'Invoice Summary' },
      { id: 'page-2', pageNumber: 2, uri: 'file:///data/bill-page-2.jpg', title: 'Itemized Lab & Imaging' },
    ];

    const onAnalyze = jest.fn();
    const { getByText: getByTextDoc, getByLabelText } = render(
      <DocumentManager initialPages={mockPages} onAnalyze={onAnalyze} />
    );

    // Verify 2 pages displayed in DocumentScrubber
    expect(getByLabelText('Page 1')).toBeTruthy();
    expect(getByLabelText('Page 2')).toBeTruthy();
    expect(getByTextDoc(/2 Pages Photographed/i)).toBeTruthy();

    // User taps Analyze
    fireEvent.press(getByTextDoc(/Analyze Medical Bill/i));
    expect(onAnalyze).toHaveBeenCalledWith(mockPages);

    // 2. Pricing engine evaluates line items
    const evaluatedItems = [
      evaluateLineItem({
        id: 'item-1',
        code: '71260',
        rawDescription: 'CT THORAX W CONTRAST',
        chargedPrice: 1850,
      }),
      evaluateLineItem({
        id: 'item-2',
        code: '80053',
        rawDescription: 'COMP METABOLIC PANEL',
        chargedPrice: 320,
      }),
    ];

    // Save evaluated audit to SQLite repository (offline guest mode)
    await saveBill(
      {
        id: 'bill-e2e-1',
        patientName: 'Priya Sharma',
        providerName: 'Metropolitan Hospital Center',
        serviceDate: '2026-11-15',
        totalBilled: 2170,
        totalFair: 218,
        status: 'analyzed',
        disputeType: null,
        createdAt: new Date().toISOString(),
      },
      mockPages.map(p => ({ id: p.id, billId: 'bill-e2e-1', pageNumber: p.pageNumber, uri: p.uri })),
      evaluatedItems.map(i => ({
        id: i.id,
        billId: 'bill-e2e-1',
        code: i.code,
        rawDescription: i.rawDescription,
        chargedPrice: i.chargedPrice,
        fairPrice: i.fairPrice,
        multiplier: i.multiplier,
        markupSeverity: i.markupSeverity,
      }))
    );

    const saved = await getBillById('bill-e2e-1');
    expect(saved?.bill.totalBilled).toBe(2170);
    expect(saved?.items).toHaveLength(2);

    // 3. Render Direction 1 Bill Details Screen
    const onStartDispute = jest.fn();
    const { getByTestId, getByText, getAllByText } = render(
      <BillDetailsScreen
        items={evaluatedItems}
        patientName="Priya Sharma"
        providerName="Metropolitan Hospital Center"
        serviceDate="2026-11-15"
        onStartDispute={onStartDispute}
      />
    );

    // Verify Executive Summary and ComparisonMeter in English
    expect(getByText('Total Billed')).toBeTruthy();
    expect(getByText('$2,170')).toBeTruthy();
    expect(getByText('Chest CT Scan with Contrast')).toBeTruthy();
    expect(getByText('Metro Diagnostic & Imaging Center')).toBeTruthy();

    // 4. Patient taps "हिंदी" (Hindi)
    const hindiBtn = getByTestId('lang-select-hi');
    fireEvent.press(hindiBtn);
    expect(getCurrentLanguage()).toBe('hi');
    expect(isCurrentRTL()).toBe(false);

    // Dynamic translation verification
    expect(getByText('सीने का सीटी स्कैन (कंट्रास्ट सहित)')).toBeTruthy();
    expect(getAllByText('यह जांच कहाँ सस्ती उपलब्ध है').length).toBeGreaterThanOrEqual(1);

    // 5. Patient taps "اردو" (Urdu) to test Right-to-Left (RTL) mode
    const urduBtn = getByTestId('lang-select-ur');
    fireEvent.press(urduBtn);
    expect(getCurrentLanguage()).toBe('ur');
    expect(isCurrentRTL()).toBe(true);
    expect(getByText('سینے کا سی ٹی اسکین (کنٹراسٹ کے ساتھ)')).toBeTruthy();

    // 6. Patient taps "Dispute Overcharges" button
    const disputeBtn = getByText('اضافی چارجز پر اعتراض کریں');
    fireEvent.press(disputeBtn);
    expect(onStartDispute).toHaveBeenCalledTimes(1);

    // 7. Render DisputeModal & Export PDF
    const onDisputeSuccess = jest.fn();
    const { getByText: getByTextModal } = render(
      <DisputeModal
        items={evaluatedItems}
        providerName="Metropolitan Hospital Center"
        patientName="Priya Sharma"
        onClose={jest.fn()}
        onSuccess={onDisputeSuccess}
      />
    );

    // Tap Export PDF
    const exportPdfBtn = getByTextModal(/Export Legal Dispute Letter|قانونی تنازعہ خط ڈاؤن لوڈ کریں/i);
    fireEvent.press(exportPdfBtn);

    await waitFor(() => {
      expect(onDisputeSuccess).toHaveBeenCalledWith(
        expect.stringContaining('.pdf'),
        'hospital_audit'
      );
    });

    // Update dispute status in local SQLite
    await updateDisputeStatus('bill-e2e-1', 'disputed', 'hospital_audit');
    const finalBill = await getBillById('bill-e2e-1');
    expect(finalBill?.bill.status).toBe('disputed');
    expect(finalBill?.bill.disputeType).toBe('hospital_audit');
  });
});
