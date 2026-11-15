import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { DisputeModal } from '../screens/dispute-modal';
import { evaluateLineItem } from '../services/pricing-engine';

describe('DisputeModal Component', () => {
  const sampleItems = [
    evaluateLineItem({ id: '1', code: '71260', rawDescription: 'CT THORAX', chargedPrice: 1850 }),
  ];

  it('renders hospital audit track by default and toggles to debt validation', () => {
    const { getByText, getAllByText } = render(
      <DisputeModal items={sampleItems} providerName="City General" onClose={jest.fn()} />
    );

    expect(getByText(/Hospital Track/i)).toBeTruthy();
    expect(getAllByText(/Demand for Itemized Audit/i).length).toBeGreaterThanOrEqual(1);

    const collectionsTab = getByText('Debt Validation (FDCPA)');
    fireEvent.press(collectionsTab);

    expect(getByText(/Collections Track/i)).toBeTruthy();
    expect(getAllByText(/Notice of Cease & Desist/i).length).toBeGreaterThanOrEqual(1);
  });


  it('triggers PDF export and invokes onSuccess callback', async () => {
    const onSuccess = jest.fn();
    const { getByText } = render(
      <DisputeModal
        items={sampleItems}
        providerName="City General"
        onClose={jest.fn()}
        onSuccess={onSuccess}
      />
    );

    const exportBtn = getByText(/Export Legal Dispute Letter/i);
    fireEvent.press(exportBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(
        expect.stringContaining('.pdf'),
        'hospital_audit'
      );
    });
  });
});
