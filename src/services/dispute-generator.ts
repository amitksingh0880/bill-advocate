import { EvaluatedLineItem, calculateBillTotals } from './pricing-engine';

export type DisputeTrack = 'hospital_audit' | 'collections_validation';

export interface DisputePayload {
  patientName: string;
  patientAddress?: string;
  providerName: string;
  accountNumber: string;
  dateOfService: string;
  items: EvaluatedLineItem[];
}

export interface DisputeLetterResult {
  track: DisputeTrack;
  title: string;
  content: string;
  recipient: string;
  date: string;
}

export function generateHospitalAuditDispute(payload: DisputePayload): DisputeLetterResult {
  const totals = calculateBillTotals(payload.items);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const content = `
${dateStr}

TO: Patient Financial Services / Billing Compliance
${payload.providerName}

RE: Formal Notice of Billing Dispute, Demand for Itemized Audit, and IRC Section 501(r) Assistance Application
Patient Name: ${payload.patientName}
Account / Invoice Number: ${payload.accountNumber}
Date(s) of Service: ${payload.dateOfService}

Dear Billing Administrator:

I am writing to formally dispute the charges on the above-referenced account pursuant to applicable federal and state patient protection statutes. The total amount billed on this account is $${totals.totalCharged.toLocaleString()}. 

Based on an independent healthcare benchmark audit comparing these charges to prevailing regional Medicare baseline rates and fair cash self-pay rates, the fair market cash valuation of these services is $${totals.totalFair.toLocaleString()}, reflecting an unjustifiable disputed markup of $${totals.totalSavings.toLocaleString()} (an average multiplier of ${totals.averageMultiplier.toFixed(1)}x over fair value).

SPECIFIC DEMANDS FOR ACTION:
1. ITEMIZED AND CODED STATEMENT: Pursuant to federal billing transparency standards and state consumer protection acts, I demand an itemized, plain-language statement detailing every HCPCS/CPT code, revenue code, unit count, and pharmacy NDC billed to this encounter.
2. CMS PRICE TRANSPARENCY DISCLOSURE: In accordance with the CMS Hospital Price Transparency Rule (45 CFR § 180), provide written documentation of the standard machine-readable cash rate and minimum negotiated commercial rate for each service listed.
3. CHARITY CARE / FINANCIAL ASSISTANCE REVIEW: If your facility operates as a tax-exempt 501(c)(3) hospital, I hereby request a formal application and evaluation under your Internal Revenue Code Section 501(r) Financial Assistance Policy (FAP). Please hold all collection proceedings and extraordinary collection actions (ECAs) while this application is processed.

Please consider this account officially in active dispute. Do not forward this account to third-party collection agencies or report any adverse information to credit reporting bureaus while this audit is pending.

Sincerely,

${payload.patientName}
${payload.patientAddress || '[Patient Address on File]'}
`.trim();

  return {
    track: 'hospital_audit',
    title: 'Formal Notice of Billing Dispute & Demand for Itemized Audit',
    content,
    recipient: payload.providerName,
    date: dateStr,
  };
}

export function generateCollectionsValidationDispute(payload: DisputePayload): DisputeLetterResult {
  const totals = calculateBillTotals(payload.items);
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const content = `
${dateStr}

TO: Collections Department / Compliance Officer
${payload.providerName}

RE: Formal Dispute and Notice of Cease & Desist Under FDCPA 15 U.S.C. § 1692g
Patient / Consumer Name: ${payload.patientName}
Alleged Account Reference: ${payload.accountNumber}
Original Healthcare Provider: ${payload.providerName}
Date(s) of Service: ${payload.dateOfService}

Dear Sir / Madam:

This letter is formal notice that I am exercising my rights under the Fair Debt Collection Practices Act (FDCPA), 15 U.S.C. § 1692g(b), to formally dispute the validity of the alleged debt of $${totals.totalCharged.toLocaleString()} in its entirety.

Pursuant to 15 U.S.C. § 1692g(b), you are required to immediately suspend all collection activities until you obtain and mail verification of the debt, including:
1. A complete breakdown of all underlying clinical charges, itemized CPT/HCPCS codes, and original hospital contracts.
2. Written authorization proving assignment or ownership of the specific debt.
3. Proof that the medical facility complied with hospital financial assistance requirements prior to referral.

Furthermore, please be advised that under 15 U.S.C. § 1692e(8), communicating or threatening to communicate false credit information, including failing to report that a disputed debt is disputed, is a direct statutory violation. You may not report this account to any credit reporting agency (Equifax, Experian, TransUnion) as undisputed or delinquent.

Govern yourself accordingly.

Sincerely,

${payload.patientName}
${payload.patientAddress || '[Patient Address on File]'}
`.trim();

  return {
    track: 'collections_validation',
    title: 'Formal Dispute and Notice of Cease & Desist Under FDCPA 15 U.S.C. § 1692g',
    content,
    recipient: payload.providerName,
    date: dateStr,
  };
}

export function generateDisputeLetterHtml(track: DisputeTrack, payload: DisputePayload): string {
  const letter = track === 'hospital_audit' 
    ? generateHospitalAuditDispute(payload) 
    : generateCollectionsValidationDispute(payload);
  const totals = calculateBillTotals(payload.items);

  const rows = payload.items.map((item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-family: monospace;">${item.code}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">
        <strong>${item.localizedName}</strong><br/>
        <span style="font-size: 11px; color: #64748b;">${item.rawDescription}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #e11d48; font-weight: 600;">$${item.chargedPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #059669; font-weight: 600;">$${item.fairPrice.toLocaleString()}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">${item.multiplier.toFixed(1)}x</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${letter.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #0f172a; padding: 36px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 20px; color: #0f172a; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px; }
    .header-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px; margin-bottom: 20px; }
    .header-box p { margin: 4px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th { background: #0f172a; color: white; padding: 10px; text-align: left; font-size: 12px; }
    .totals-box { background: #f1f5f9; padding: 12px; border-radius: 6px; text-align: right; margin-bottom: 20px; font-size: 14px; }
    .statute-alert { background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px; margin: 16px 0; font-size: 12px; color: #9f1239; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 13px; line-height: 1.6; }
  </style>
</head>
<body>
  <h1>${letter.title}</h1>
  
  <div class="header-box">
    <p><strong>Provider / Facility:</strong> ${payload.providerName}</p>
    <p><strong>Patient Name:</strong> ${payload.patientName}</p>
    <p><strong>Account / Claim ID:</strong> ${payload.accountNumber}</p>
    <p><strong>Date of Service:</strong> ${payload.dateOfService}</p>
    <p><strong>Date of Notice:</strong> ${letter.date}</p>
  </div>

  <div class="statute-alert">
    <strong>STATUTORY RESERVATION OF RIGHTS:</strong> This claim is under formal legal audit. Any collection efforts or adverse credit reporting without providing full itemized verification and price transparency disclosures violates state and federal consumer statutes.
  </div>

  <h3>Itemized Billing & Valuation Benchmark Audit</h3>
  <table>
    <thead>
      <tr>
        <th>Code</th>
        <th>Description</th>
        <th style="text-align: right;">Hospital Charged</th>
        <th style="text-align: right;">Fair Cash Median</th>
        <th style="text-align: right;">Markup</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="totals-box">
    Total Billed: <strong style="color: #e11d48;">$${totals.totalCharged.toLocaleString()}</strong> | 
    Fair Market Value: <strong style="color: #059669;">$${totals.totalFair.toLocaleString()}</strong> | 
    Disputed Overcharge: <strong>$${totals.totalSavings.toLocaleString()}</strong>
  </div>

  <pre>${letter.content}</pre>
</body>
</html>
  `.trim();
}
