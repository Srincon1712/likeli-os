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
      duration_seconds INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lead_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'manual',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS script_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL DEFAULT 'script',
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tags TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS commercial_deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER,
      title TEXT NOT NULL,
      stage TEXT NOT NULL DEFAULT 'Lead',
      value REAL NOT NULL DEFAULT 0,
      probability REAL NOT NULL DEFAULT 0,
      forecast_date TEXT,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS finance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'income',
      category TEXT DEFAULT '',
      amount REAL NOT NULL DEFAULT 0,
      record_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS productivity_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'task',
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      priority TEXT NOT NULL DEFAULT 'medium',
      project TEXT DEFAULT '',
      due_date TEXT,
      minutes INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS knowledge_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL DEFAULT 'playbook',
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      tags TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS personal_metrics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      sleep_hours REAL NOT NULL DEFAULT 0,
      exercise_minutes INTEGER NOT NULL DEFAULT 0,
      reading_minutes INTEGER NOT NULL DEFAULT 0,
      weight REAL NOT NULL DEFAULT 0,
      energy INTEGER NOT NULL DEFAULT 0,
      productivity INTEGER NOT NULL DEFAULT 0,
      nutrition TEXT DEFAULT '',
      social_minutes INTEGER NOT NULL DEFAULT 0,
      notes TEXT DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_call_events_created ON call_events(created_at);
    CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_created ON lead_notes(lead_id, created_at);
  `);

  let initialStage = db.prepare('SELECT id FROM lead_stages ORDER BY id ASC LIMIT 1').get();
  if (!initialStage) {
    const result = db.prepare("INSERT INTO lead_stages (name) VALUES ('Etapa 1')").run();
    initialStage = { id: Number(result.lastInsertRowid) };
  }

  const leadColumns = db.prepare('PRAGMA table_info(leads)').all().map((column) => column.name);
  const addLeadColumn = (name, definition) => {
    if (!leadColumns.includes(name)) db.prepare(`ALTER TABLE leads ADD COLUMN ${name} ${definition}`).run();
  };
  addLeadColumn('website', "TEXT DEFAULT ''");
  addLeadColumn('call_note', "TEXT DEFAULT ''");
  addLeadColumn('callback_date', 'TEXT');
  addLeadColumn('stage_id', 'INTEGER REFERENCES lead_stages(id)');
  addLeadColumn('company', "TEXT DEFAULT ''");
  addLeadColumn('sector', "TEXT DEFAULT ''");
  addLeadColumn('contact_name', "TEXT DEFAULT ''");
  addLeadColumn('contact_role', "TEXT DEFAULT ''");
  addLeadColumn('whatsapp', "TEXT DEFAULT ''");
  addLeadColumn('email', "TEXT DEFAULT ''");
  addLeadColumn('social_links', "TEXT DEFAULT ''");
  addLeadColumn('objections', "TEXT DEFAULT ''");
  addLeadColumn('budget', 'REAL NOT NULL DEFAULT 0');
  addLeadColumn('probability', 'REAL NOT NULL DEFAULT 0');
  addLeadColumn('last_contact_at', 'TEXT');
  addLeadColumn('next_follow_up_at', 'TEXT');
  addLeadColumn('priority', "TEXT NOT NULL DEFAULT 'medium'");
  addLeadColumn('pipeline_stage', "TEXT NOT NULL DEFAULT 'Lead'");
  addLeadColumn('revenue_value', 'REAL NOT NULL DEFAULT 0');

  const callColumns = db.prepare('PRAGMA table_info(call_events)').all().map((column) => column.name);
  if (!callColumns.includes('duration_seconds')) {
    db.prepare('ALTER TABLE call_events ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 0').run();
  }

  db.prepare('UPDATE leads SET stage_id = ? WHERE stage_id IS NULL').run(initialStage.id);
  db.exec('CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage_id)');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_pipeline_stage ON leads(pipeline_stage);
    CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
    CREATE INDEX IF NOT EXISTS idx_deals_stage ON commercial_deals(stage);
    CREATE INDEX IF NOT EXISTS idx_finance_records_type ON finance_records(type);
    CREATE INDEX IF NOT EXISTS idx_productivity_type ON productivity_items(type);
    CREATE INDEX IF NOT EXISTS idx_knowledge_type ON knowledge_items(type);
    CREATE INDEX IF NOT EXISTS idx_personal_metrics_date ON personal_metrics(metric_date);
  `);

  db.exec(`
    INSERT INTO lead_notes (lead_id, content, source, created_at)
    SELECT leads.id, leads.notes, 'legacy', COALESCE(leads.created_at, CURRENT_TIMESTAMP)
    FROM leads
    WHERE TRIM(COALESCE(leads.notes, '')) != ''
    AND NOT EXISTS (
      SELECT 1 FROM lead_notes
      WHERE lead_notes.lead_id = leads.id
      AND lead_notes.content = leads.notes
      AND lead_notes.source = 'legacy'
    );

    INSERT INTO lead_notes (lead_id, content, source, created_at)
    SELECT call_events.lead_id, call_events.note, 'call', call_events.created_at
    FROM call_events
    WHERE TRIM(COALESCE(call_events.note, '')) != ''
    AND NOT EXISTS (
      SELECT 1 FROM lead_notes
      WHERE lead_notes.lead_id = call_events.lead_id
      AND lead_notes.content = call_events.note
      AND lead_notes.created_at = call_events.created_at
      AND lead_notes.source = 'call'
    );
  `);

  const scriptCount = db.prepare('SELECT COUNT(*) AS count FROM script_library').get().count;
  if (!scriptCount) {
    const insertScript = db.prepare(`
      INSERT INTO script_library (category, title, content, tags, updated_at)
      VALUES (@category, @title, @content, @tags, @updated_at)
    `);
    const updated_at = nowIso();
    [
      {
        category: 'script',
        title: 'Apertura B2B corta',
        content: 'Hola, soy Sebastian de Likeli. Trabajo con empresas de servicios para generar oportunidades comerciales mediante prospeccion outbound. Te llamo rapido: queria validar si hoy tienen un proceso activo para conseguir reuniones B2B.',
        tags: 'cold calling, apertura'
      },
      {
        category: 'objection',
        title: 'No tengo tiempo',
        content: 'Perfecto, justamente por eso soy breve. Si no tiene sentido en 20 segundos, cierro la llamada. Estamos ayudando a empresas a llenar pipeline sin depender solo de referidos.',
        tags: 'objecion, tiempo'
      },
      {
        category: 'closing',
        title: 'Cierre a reunion',
        content: 'Tiene sentido que lo revisemos con calma. Te propongo una reunion de 20 minutos esta semana para ver si hay encaje y revisar numeros.',
        tags: 'cierre, reunion'
      }
    ].forEach((item) => insertScript.run({ ...item, updated_at }));
  }
}

export function nowIso() {
  return new Date().toISOString();
}
