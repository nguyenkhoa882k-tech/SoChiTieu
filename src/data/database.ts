import SQLite from 'react-native-sqlite-storage';
import { Transaction, TransactionInput } from '@/types/transaction';

SQLite.enablePromise(true);

const DB_NAME = 'sochitieu.db';
const TABLE_NAME = 'transactions';

const createTableSql = `
  CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('income','expense')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    wallet TEXT,
    tags TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`;

const mapRow = (row: any): Transaction => ({
  id: row.id,
  amount: row.amount,
  type: row.type,
  category: row.category,
  date: row.date,
  note: row.note ?? undefined,
  wallet: row.wallet ?? undefined,
  tags: row.tags ? JSON.parse(row.tags) : undefined,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
});

async function openDb() {
  return SQLite.openDatabase({ name: DB_NAME, location: 'default' });
}

export async function ensureDatabase() {
  const db = await openDb();
  await db.executeSql(createTableSql);
  return db;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const db = await ensureDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM ${TABLE_NAME} ORDER BY date DESC, id DESC`,
  );
  const rows: Transaction[] = [];
  for (let i = 0; i < result.rows.length; i += 1) {
    rows.push(mapRow(result.rows.item(i)));
  }
  return rows;
}

export async function insertTransaction(
  input: TransactionInput,
): Promise<Transaction> {
  const db = await ensureDatabase();
  const nowIso = new Date().toISOString();
  const tagsJson = JSON.stringify(input.tags ?? []);
  const [result] = await db.executeSql(
    `INSERT INTO ${TABLE_NAME} (amount,type,category,date,note,wallet,tags,createdAt,updatedAt)
     VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      input.amount,
      input.type,
      input.category,
      input.date,
      input.note ?? null,
      input.wallet ?? null,
      tagsJson,
      nowIso,
      nowIso,
    ],
  );

  const insertId = result.insertId ?? 0;
  return {
    id: insertId,
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    note: input.note,
    wallet: input.wallet,
    tags: input.tags,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export async function deleteTransaction(id: number) {
  const db = await ensureDatabase();
  await db.executeSql(`DELETE FROM ${TABLE_NAME} WHERE id = ?`, [id]);
}

/**
 * Delete all transactions from database
 */
export async function clearAllTransactions() {
  const db = await ensureDatabase();
  await db.executeSql(`DELETE FROM ${TABLE_NAME}`);
}

export async function updateTransaction(
  id: number,
  updates: Partial<TransactionInput>,
): Promise<Transaction | null> {
  const db = await ensureDatabase();
  const current = await db.executeSql(
    `SELECT * FROM ${TABLE_NAME} WHERE id = ?`,
    [id],
  );

  if (!current[0]?.rows.length) {
    return null;
  }

  const row = mapRow(current[0].rows.item(0));
  const merged: Transaction = {
    ...row,
    ...updates,
    updatedAt: new Date().toISOString(),
  } as Transaction;

  await db.executeSql(
    `UPDATE ${TABLE_NAME}
     SET amount=?, type=?, category=?, date=?, note=?, wallet=?, tags=?, updatedAt=?
     WHERE id=?`,
    [
      merged.amount,
      merged.type,
      merged.category,
      merged.date,
      merged.note ?? null,
      merged.wallet ?? null,
      JSON.stringify(merged.tags ?? []),
      merged.updatedAt,
      id,
    ],
  );

  return merged;
}

export async function seedDemoDataIfNeeded() {
  const db = await ensureDatabase();
  const [result] = await db.executeSql(
    `SELECT COUNT(*) as count FROM ${TABLE_NAME}`,
  );
  const count = result.rows.item(0)?.count ?? 0;

  // Không seed dữ liệu mẫu nữa - người dùng tự thêm
  // Database sẽ trống ban đầu
  return count;
}
