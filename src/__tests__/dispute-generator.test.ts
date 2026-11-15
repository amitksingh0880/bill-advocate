import { 
  generateDisputeLetterHtml, 
  generateHospitalAuditDispute, 
  generateCollectionsValidationDispute,
  DisputePayload 
} from '../services/dispute-generator';
import { evaluateLineItem } from '../services/pricing-engine';

describe('Dual-Track Legal Dispute Generator', () => {
  const samplePayload: DisputePayload = {
    patientName: 'Jane Doe',
    patientAddress: '123 Pine St, Dallas, TX 75001',
    providerName: 'Memorial Regional Medical Center',
    accountNumber: 'ACC-984712',
    dateOfService: 'November 10, 2026',
    items: [
      evaluateLineItem({
        id: '1',
        code: '71260',
        rawDescription: 'CT THORAX W DYE',
        chargedPrice: 1850,
      }),
      evaluateLineItem({
        id: '2',
        code: '80053',
        rawDescription: 'COMP METABOLIC PANEL',
        chargedPrice: 320,
      }),
    ],
  };

  it('generates Hospital Audit & 501(r) Charity Care letter with statutory citations', () => {
    const letter = generateHospitalAuditDispute(samplePayload);
    expect(letter.title).toBe('Formal Notice of Billing Dispute & Demand for Itemized Audit');
    expect(letter.content).toContain('Internal Revenue Code Section 501(r)');
    expect(letter.content).toContain('CMS Hospital Price Transparency Rule (45 CFR § 180)');
    expect(letter.content).toContain('Jane Doe');
    expect(letter.content).toContain('ACC-984712');
    expect(letter.content).toContain('$2,170'); // Total billed
    expect(letter.content).toContain('$218');   // Fair price
    expect(letter.content).toContain('$1,952'); // Disputed markup
  });

  it('generates FDCPA Section 809(b) 30-day debt validation freeze notice', () => {
    const letter = generateCollectionsValidationDispute(samplePayload);
    expect(letter.title).toBe('Formal Dispute and Notice of Cease & Desist Under FDCPA 15 U.S.C. § 1692g');
    expect(letter.content).toContain('Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b)');
    expect(letter.content).toContain('suspend all collection activities');
    expect(letter.content).toContain('credit reporting');
    expect(letter.content).toContain('ACC-984712');
  });

  it('compiles clean, printable HTML document with itemized markup table', () => {
    const html = generateDisputeLetterHtml('hospital_audit', samplePayload);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('71260');
    expect(html).toContain('Chest CT Scan with Contrast');
    expect(html).toContain('$1,850');
    expect(html).toContain('$190');
    expect(html).toContain('Memorial Regional Medical Center');
  });
});
