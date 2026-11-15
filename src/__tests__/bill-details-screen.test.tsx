import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { BillDetailsScreen } from '../screens/bill-details-screen';
import { evaluateLineItem } from '../services/pricing-engine';
import { setAppLanguage } from '../i18n';

describe('BillDetailsScreen (Direction 1 UI)', () => {
  const sampleItems = [
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
  ];

  beforeEach(() => {
    setAppLanguage('en');
  });

  it('renders executive summary with total charged and fair amounts', () => {
    render(<BillDetailsScreen items={sampleItems} onStartDispute={jest.fn()} />);

    expect(screen.getByText('Total Billed')).toBeTruthy();
    expect(screen.getByText('$2,170')).toBeTruthy();
    expect(screen.getByText('Fair Price')).toBeTruthy();
    expect(screen.getByText('$218')).toBeTruthy();
    expect(screen.getByText(/Potential Savings: \$1,952/i)).toBeTruthy();
  });

  it('renders ComparisonMeter and procedure cards for line items', () => {
    render(<BillDetailsScreen items={sampleItems} onStartDispute={jest.fn()} />);

    expect(screen.getByText('Chest CT Scan with Contrast')).toBeTruthy();
    expect(screen.getByText('Comprehensive Metabolic Panel (CMP)')).toBeTruthy();
    expect(screen.getByText(/9.7x Markup/i)).toBeTruthy();
  });

  it('renders alternative providers using ComparisonRow', () => {
    render(<BillDetailsScreen items={sampleItems} onStartDispute={jest.fn()} />);

    expect(screen.getAllByText('Where to get this cheaper').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Metro Diagnostic & Imaging Center')).toBeTruthy();
    expect(screen.getByText('Certified Regional Lab Network')).toBeTruthy();
  });

  it('switches to Hindi dynamically updating procedure titles and headers', () => {
    const { getByTestId, getByText, getAllByText } = render(
      <BillDetailsScreen items={sampleItems} onStartDispute={jest.fn()} />
    );

    const hindiBtn = getByTestId('lang-select-hi');
    fireEvent.press(hindiBtn);

    expect(getByText('सीने का सीटी स्कैन (कंट्रास्ट सहित)')).toBeTruthy();
    expect(getAllByText('यह जांच कहाँ सस्ती उपलब्ध है').length).toBeGreaterThanOrEqual(1);
  });


  it('triggers onStartDispute when dispute button is pressed', () => {
    const onDispute = jest.fn();
    const { getByText } = render(
      <BillDetailsScreen items={sampleItems} onStartDispute={onDispute} />
    );

    const disputeBtn = getByText('Dispute Overcharges');
    fireEvent.press(disputeBtn);
    expect(onDispute).toHaveBeenCalledTimes(1);
  });
});
