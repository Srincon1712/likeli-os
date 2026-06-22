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
    CREATE TABLE IF NOT EXISTS lead_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

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
      call_note TEXT DEFAULT '',
      callback_date TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      call_count INTEGER NOT NULL DEFAULT 0,
      last_call_at TEXT,
      next_call_at TEXT,
      stage_id INTEGER,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (stage_id) REFERENCES lead_stages(id)
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

  let initialStage = db.prepare('SELECT id FROM lead_stages ORDER BY id ASC LIMIT 1').get();
  if (!initialStage) {
    const result = db.prepare("INSERT INTO lead_stages (name) VALUES ('Etapa 1')").run();
    initialStage = { id: Number(result.lastInsertRowid) };
  }

  const leadColumns = db.prepare('PRAGMA table_info(leads)').all().map((column) => column.name);
  if (!leadColumns.includes('website')) {
    db.prepare("ALTER TABLE leads ADD COLUMN website TEXT DEFAULT ''").run();
  }
  if (!leadColumns.includes('call_note')) {
    db.prepare("ALTER TABLE leads ADD COLUMN call_note TEXT DEFAULT ''").run();
  }
  if (!leadColumns.includes('callback_date')) {
    db.prepare("ALTER TABLE leads ADD COLUMN callback_date TEXT").run();
  }
  if (!leadColumns.includes('stage_id')) {
    db.prepare('ALTER TABLE leads ADD COLUMN stage_id INTEGER REFERENCES lead_stages(id)').run();
  }

  db.prepare('UPDATE leads SET stage_id = ? WHERE stage_id IS NULL').run(initialStage.id);
  db.exec('CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id)');
}

export function nowIso() {
  return new Date().toISOString();
}
