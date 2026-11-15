import { CREATE_BILLS_TABLE, CREATE_BILL_PAGES_TABLE, CREATE_BILL_ITEMS_TABLE } from './schema';

export interface DatabaseAdapter {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params?: any[]): Promise<{ rowsAffected: number; lastInsertRowId: number }>;
  getAllAsync<T = any>(sql: string, params?: any[]): Promise<T[]>;
  getFirstAsync<T = any>(sql: string, params?: any[]): Promise<T | null>;
}

class InMemoryDatabaseAdapter implements DatabaseAdapter {
  private tables: Record<string, any[]> = {
    bills: [],
    bill_pages: [],
    bill_items: [],
  };

  async execAsync(sql: string): Promise<void> {
    // Schema initialized
  }

  async runAsync(sql: string, params: any[] = []): Promise<{ rowsAffected: number; lastInsertRowId: number }> {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('INSERT INTO BILLS')) {
      const [id, patient_name, provider_name, service_date, total_billed, total_fair, status, dispute_type, created_at] = params;
      this.tables.bills = this.tables.bills.filter(b => b.id !== id);
      this.tables.bills.push({ id, patient_name, provider_name, service_date, total_billed, total_fair, status, dispute_type, created_at });
      return { rowsAffected: 1, lastInsertRowId: this.tables.bills.length };
    }
    if (trimmed.startsWith('INSERT INTO BILL_PAGES')) {
      const [id, bill_id, page_number, uri, thumbnail_uri] = params;
      this.tables.bill_pages.push({ id, bill_id, page_number, uri, thumbnail_uri });
      return { rowsAffected: 1, lastInsertRowId: this.tables.bill_pages.length };
    }
    if (trimmed.startsWith('INSERT INTO BILL_ITEMS')) {
      const [id, bill_id, code, raw_description, charged_price, fair_price, multiplier, markup_severity] = params;
      this.tables.bill_items.push({ id, bill_id, code, raw_description, charged_price, fair_price, multiplier, markup_severity });
      return { rowsAffected: 1, lastInsertRowId: this.tables.bill_items.length };
    }
    if (trimmed.startsWith('UPDATE BILLS SET STATUS')) {
      const [status, dispute_type, id] = params;
      const b = this.tables.bills.find(b => b.id === id);
      if (b) {
        b.status = status;
        b.dispute_type = dispute_type;
      }
      return { rowsAffected: 1, lastInsertRowId: 0 };
    }
    if (trimmed.startsWith('DELETE FROM BILLS WHERE ID')) {
      const [id] = params;
      this.tables.bills = this.tables.bills.filter(b => b.id !== id);
      this.tables.bill_pages = this.tables.bill_pages.filter(p => p.bill_id !== id);
      this.tables.bill_items = this.tables.bill_items.filter(i => i.bill_id !== id);
      return { rowsAffected: 1, lastInsertRowId: 0 };
    }
    return { rowsAffected: 0, lastInsertRowId: 0 };
  }

  async getAllAsync<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.includes('FROM BILLS')) {
      return [...this.tables.bills] as T[];
    }
    if (trimmed.includes('FROM BILL_PAGES WHERE BILL_ID')) {
      const [billId] = params;
      return this.tables.bill_pages.filter(p => p.bill_id === billId) as T[];
    }
    if (trimmed.includes('FROM BILL_ITEMS WHERE BILL_ID')) {
      const [billId] = params;
      return this.tables.bill_items.filter(i => i.bill_id === billId) as T[];
    }
    return [];
  }

  async getFirstAsync<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.getAllAsync<T>(sql, params);
    if (rows.length === 0) return null;
    if (params.length > 0) {
      const [billId] = params;
      const match = (rows as any[]).find(r => r.id === billId);
      return (match as T) || null;
    }
    return rows[0] as T;
  }

}

let dbInstance: DatabaseAdapter | null = null;

export async function getDatabase(): Promise<DatabaseAdapter> {
  if (dbInstance) return dbInstance;

  try {
    const SQLite = require('expo-sqlite');
    if (SQLite && typeof SQLite.openDatabaseAsync === 'function') {
      const db = await SQLite.openDatabaseAsync('bill_advocate.db');
      await db.execAsync(CREATE_BILLS_TABLE);
      await db.execAsync(CREATE_BILL_PAGES_TABLE);
      await db.execAsync(CREATE_BILL_ITEMS_TABLE);
      dbInstance = db;
      return db;

    }
  } catch {
    // Fall back to InMemory adapter for test runner or when native sqlite is absent
  }

  const fallback = new InMemoryDatabaseAdapter();
  await fallback.execAsync(CREATE_BILLS_TABLE);
  await fallback.execAsync(CREATE_BILL_PAGES_TABLE);
  await fallback.execAsync(CREATE_BILL_ITEMS_TABLE);
  dbInstance = fallback;
  return fallback;

}
