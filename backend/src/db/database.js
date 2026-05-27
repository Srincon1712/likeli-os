import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const databaseDir = path.join(rootDir, 'database');
const uploadsDir = path.join(rootDir, 'uploads');

fs.mkdirSync(databaseDir, { recursive: true });
fs.mkdirSync(uploadsDir, { recursive: true });

export const dbPath = path.join(databaseDir, 'likeli.db');
export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'General',
      target_value REAL NOT NULL DEFAULT 0,
      current_value REAL NOT NULL DEFAULT 0,
      deadline TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      city TEXT DEFAULT '',
      niche TEXT DEFAULT '',
      instagram TEXT DEFAULT '',
      website TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      call_count INTEGER NOT NULL DEFAULT 0,
      last_call_at TEXT,
      next_call_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS call_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      outcome TEXT NOT NULL,
      note TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_call_events_created ON call_events(created_at);
  `);

  const leadColumns = db.prepare('PRAGMA table_info(leads)').all().map((column) => column.name);
  if (!leadColumns.includes('website')) {
    db.prepare("ALTER TABLE leads ADD COLUMN website TEXT DEFAULT ''").run();
  }
}

export function nowIso() {
  return new Date().toISOString();
}
