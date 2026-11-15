export const CREATE_BILLS_TABLE = `
  CREATE TABLE IF NOT EXISTS bills (
    id TEXT PRIMARY KEY,
    patient_name TEXT,
    provider_name TEXT,
    service_date TEXT,
    total_billed REAL NOT NULL,
    total_fair REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    dispute_type TEXT,
    created_at TEXT NOT NULL
  );
`;

export const CREATE_BILL_PAGES_TABLE = `
  CREATE TABLE IF NOT EXISTS bill_pages (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    page_number INTEGER NOT NULL,
    uri TEXT NOT NULL,
    thumbnail_uri TEXT,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );
`;

export const CREATE_BILL_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS bill_items (
    id TEXT PRIMARY KEY,
    bill_id TEXT NOT NULL,
    code TEXT NOT NULL,
    raw_description TEXT NOT NULL,
    charged_price REAL NOT NULL,
    fair_price REAL NOT NULL,
    multiplier REAL NOT NULL,
    markup_severity TEXT NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
  );
`;
