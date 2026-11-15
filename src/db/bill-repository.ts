import { getDatabase } from './database';

export interface BillRecord {
  id: string;
  patientName: string;
  providerName: string;
  serviceDate: string;
  totalBilled: number;
  totalFair: number;
  status: 'draft' | 'analyzed' | 'disputed';
  disputeType: 'hospital_audit' | 'collections_validation' | null;
  createdAt: string;
}

export interface BillPageRecord {
  id: string;
  billId: string;
  pageNumber: number;
  uri: string;
  thumbnailUri?: string;
}

export interface BillItemRecord {
  id: string;
  billId: string;
  code: string;
  rawDescription: string;
  chargedPrice: number;
  fairPrice: number;
  multiplier: number;
  markupSeverity: string;
}

export async function initDatabase(): Promise<void> {
  await getDatabase();
}

export async function saveBill(
  bill: BillRecord, 
  pages: BillPageRecord[], 
  items: BillItemRecord[]
): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO bills (id, patient_name, provider_name, service_date, total_billed, total_fair, status, dispute_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bill.id,
      bill.patientName,
      bill.providerName,
      bill.serviceDate,
      bill.totalBilled,
      bill.totalFair,
      bill.status,
      bill.disputeType,
      bill.createdAt,
    ]
  );

  for (const page of pages) {
    await db.runAsync(
      `INSERT INTO bill_pages (id, bill_id, page_number, uri, thumbnail_uri)
       VALUES (?, ?, ?, ?, ?)`,
      [page.id, page.billId, page.pageNumber, page.uri, page.thumbnailUri || page.uri]
    );
  }

  for (const item of items) {
    await db.runAsync(
      `INSERT INTO bill_items (id, bill_id, code, raw_description, charged_price, fair_price, multiplier, markup_severity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.billId,
        item.code,
        item.rawDescription,
        item.chargedPrice,
        item.fairPrice,
        item.multiplier,
        item.markupSeverity,
      ]
    );
  }
}

export async function getBillById(id: string): Promise<{
  bill: BillRecord;
  pages: BillPageRecord[];
  items: BillItemRecord[];
} | null> {
  const db = await getDatabase();
  const rawBill = await db.getFirstAsync<any>(
    `SELECT * FROM bills WHERE id = ?`,
    [id]
  );

  if (!rawBill) return null;

  const rawPages = await db.getAllAsync<any>(
    `SELECT * FROM bill_pages WHERE bill_id = ? ORDER BY page_number ASC`,
    [id]
  );

  const rawItems = await db.getAllAsync<any>(
    `SELECT * FROM bill_items WHERE bill_id = ?`,
    [id]
  );

  const bill: BillRecord = {
    id: rawBill.id,
    patientName: rawBill.patient_name,
    providerName: rawBill.provider_name,
    serviceDate: rawBill.service_date,
    totalBilled: Number(rawBill.total_billed),
    totalFair: Number(rawBill.total_fair),
    status: rawBill.status,
    disputeType: rawBill.dispute_type,
    createdAt: rawBill.created_at,
  };

  const pages: BillPageRecord[] = rawPages.map((p) => ({
    id: p.id,
    billId: p.bill_id,
    pageNumber: Number(p.page_number),
    uri: p.uri,
    thumbnailUri: p.thumbnail_uri,
  }));

  const items: BillItemRecord[] = rawItems.map((i) => ({
    id: i.id,
    billId: i.bill_id,
    code: i.code,
    rawDescription: i.raw_description,
    chargedPrice: Number(i.charged_price),
    fairPrice: Number(i.fair_price),
    multiplier: Number(i.multiplier),
    markupSeverity: i.markup_severity,
  }));

  return { bill, pages, items };
}

export async function getAllBills(): Promise<BillRecord[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM bills ORDER BY created_at DESC`
  );

  return rows.map((r) => ({
    id: r.id,
    patientName: r.patient_name,
    providerName: r.provider_name,
    serviceDate: r.service_date,
    totalBilled: Number(r.total_billed),
    totalFair: Number(r.total_fair),
    status: r.status,
    disputeType: r.dispute_type,
    createdAt: r.created_at,
  }));
}

export async function updateDisputeStatus(
  id: string,
  status: 'draft' | 'analyzed' | 'disputed',
  disputeType: 'hospital_audit' | 'collections_validation' | null
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE bills SET status = ?, dispute_type = ? WHERE id = ?`,
    [status, disputeType, id]
  );
}

export async function deleteBill(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM bills WHERE id = ?`, [id]);
}
