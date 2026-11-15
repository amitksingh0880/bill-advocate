import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from '../app/index';

describe('App Smoke Test with @amitsingh0880/cnnative-ui', () => {
  it('renders app root with library Card, Badge, and Direction 1 breakdown', () => {
    render(<App />);
    expect(screen.getByText('BillAdvocate')).toBeTruthy();
    expect(screen.getByText('Hospital Bill Audit')).toBeTruthy();
    expect(screen.getByText('Chest CT Scan with Contrast')).toBeTruthy();
    expect(screen.getByText('Dispute Overcharges')).toBeTruthy();
  });
});
