import { 
  initDatabase, 
  saveBill, 
  getBillById, 
  getAllBills, 
  updateDisputeStatus, 
  deleteBill,
  BillRecord,
  BillItemRecord,
  BillPageRecord
} from '../db/bill-repository';

describe('Local-First SQLite Bill Repository (Guest Mode)', () => {
  beforeEach(async () => {
    await initDatabase();
  });

  it('saves and retrieves a multi-page medical bill with itemized overcharges', async () => {
    const testBill: BillRecord = {
      id: 'bill-101',
      patientName: 'Jane Doe',
      providerName: 'Memorial General Hospital',
      serviceDate: '2026-11-10',
      totalBilled: 2170,
      totalFair: 218,
      status: 'analyzed',
      disputeType: null,
      createdAt: new Date().toISOString(),
    };

    const testPages: BillPageRecord[] = [
      { id: 'p1', billId: 'bill-101', pageNumber: 1, uri: 'file:///data/page1.jpg', thumbnailUri: 'file:///data/thumb1.jpg' },
      { id: 'p2', billId: 'bill-101', pageNumber: 2, uri: 'file:///data/page2.jpg', thumbnailUri: 'file:///data/thumb2.jpg' },
    ];

    const testItems: BillItemRecord[] = [
      {
        id: 'i1',
        billId: 'bill-101',
        code: '71260',
        rawDescription: 'CT THORAX W DYE',
        chargedPrice: 1850,
        fairPrice: 190,
        multiplier: 9.74,
        markupSeverity: 'severe',
      },
      {
        id: 'i2',
        billId: 'bill-101',
        code: '80053',
        rawDescription: 'COMP METABOLIC PANEL',
        chargedPrice: 320,
        fairPrice: 28,
        multiplier: 11.4,
        markupSeverity: 'extreme',
      },
    ];

    await saveBill(testBill, testPages, testItems);

    const fetched = await getBillById('bill-101');
    expect(fetched).toBeDefined();
    expect(fetched?.bill.id).toBe('bill-101');
    expect(fetched?.bill.providerName).toBe('Memorial General Hospital');
    expect(fetched?.bill.totalBilled).toBe(2170);
    expect(fetched?.pages).toHaveLength(2);
    expect(fetched?.items).toHaveLength(2);
    expect(fetched?.items[0].code).toBe('71260');
  });

  it('updates dispute status on a bill', async () => {
    const bill: BillRecord = {
      id: 'bill-102',
      patientName: 'John Smith',
      providerName: 'County Regional Medical',
      serviceDate: '2026-10-25',
      totalBilled: 1400,
      totalFair: 350,
      status: 'analyzed',
      disputeType: null,
      createdAt: new Date().toISOString(),
    };

    await saveBill(bill, [], []);
    await updateDisputeStatus('bill-102', 'disputed', 'hospital_audit');

    const updated = await getBillById('bill-102');
    expect(updated?.bill.status).toBe('disputed');
    expect(updated?.bill.disputeType).toBe('hospital_audit');
  });

  it('lists all saved bills in reverse chronological order', async () => {
    const bills = await getAllBills();
    expect(Array.isArray(bills)).toBe(true);
    expect(bills.length).toBeGreaterThanOrEqual(2);
  });

  it('deletes a bill and cascades to pages and items', async () => {
    await deleteBill('bill-101');
    const fetched = await getBillById('bill-101');
    expect(fetched).toBeNull();
  });
});
