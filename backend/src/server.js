import cors from 'cors';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';
import { db, dbPath, migrate, nowIso } from './db/database.js';
import { analyzeCsvColumns, sanitizeCsvRecord, summarizeCsvImport } from './csvImport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const uploadsDir = path.join(rootDir, 'uploads');

migrate();

const app = express();
const port = process.env.PORT || 4040;
const upload = multer({
  dest: uploadsDir,
  limits: { fileSize: 5 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json());

const objectiveFields = ['title', 'description', 'category', 'target_value', 'current_value', 'deadline', 'status'];
const leadFields = ['business_name', 'phone', 'city', 'niche', 'instagram', 'website', 'notes', 'status', 'call_count', 'last_call_at', 'next_call_at'];

function mapObjective(row) {
  const progress = row.target_value > 0 ? Math.min(100, Math.round((row.current_value / row.target_value) * 100)) : 0;
  return { ...row, progress };
}

function listLeads(req, res) {
  const status = req.query.status;
  const rows = status
    ? db.prepare('SELECT * FROM leads WHERE status = ? ORDER BY updated_at DESC, id DESC').all(status)
    : db.prepare('SELECT * FROM leads ORDER BY updated_at DESC, id DESC').all();
  res.json(rows);
}

function deleteLead(req, res) {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.status(204).end();
}

function deleteAllLeads(_req, res) {
  const result = db.prepare('DELETE FROM leads').run();
  res.json({ deleted: result.changes });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: dbPath });
});

app.get('/api/objectives', (_req, res) => {
  const rows = db.prepare('SELECT * FROM objectives ORDER BY created_at DESC').all();
  res.json(rows.map(mapObjective));
});

app.post('/api/objectives', (req, res) => {
  const body = req.body;
  const insert = db.prepare(`
    INSERT INTO objectives (title, description, category, target_value, current_value, deadline, status, updated_at)
    VALUES (@title, @description, @category, @target_value, @current_value, @deadline, @status, @updated_at)
  `);
  const result = insert.run({
    title: body.title,
    description: body.description || '',
    category: body.category || 'General',
    target_value: Number(body.target_value || 0),
    current_value: Number(body.current_value || 0),
    deadline: body.deadline || null,
    status: body.status || 'active',
    updated_at: nowIso()
  });
  res.status(201).json(mapObjective(db.prepare('SELECT * FROM objectives WHERE id = ?').get(result.lastInsertRowid)));
});

app.patch('/api/objectives/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM objectives WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Objective not found' });

  const next = { ...current, ...req.body };
  const update = db.prepare(`
    UPDATE objectives
    SET title = @title, description = @description, category = @category,
        target_value = @target_value, current_value = @current_value,
        deadline = @deadline, status = @status, updated_at = @updated_at
    WHERE id = @id
  `);
  update.run({
    id: current.id,
    title: next.title,
    description: next.description || '',
    category: next.category || 'General',
    target_value: Number(next.target_value || 0),
    current_value: Number(next.current_value || 0),
    deadline: next.deadline || null,
    status: next.status || 'active',
    updated_at: nowIso()
  });
  res.json(mapObjective(db.prepare('SELECT * FROM objectives WHERE id = ?').get(current.id)));
});

app.delete('/api/objectives/:id', (req, res) => {
  db.prepare('DELETE FROM objectives WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

app.get('/api/leads', listLeads);
app.get('/leads', listLeads);

app.post('/api/leads/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

  const content = fs.readFileSync(req.file.path, 'utf8');
  let headers = [];
  const records = parse(content, {
    columns: (columns) => {
      headers = columns;
      return columns;
    },
    skip_empty_lines: true,
    trim: true,
    bom: true
  });
  const { detected, ignored } = analyzeCsvColumns(headers);

  const insert = db.prepare(`
    INSERT INTO leads (business_name, phone, city, niche, instagram, website, notes, updated_at)
    VALUES (@business_name, @phone, @city, @niche, @instagram, @website, @notes, @updated_at)
  `);

  const result = db.transaction((rows) => {
    let imported = 0;
    let invalidRows = 0;

    for (const row of rows) {
      const parsed = sanitizeCsvRecord(row, detected);
      if (!parsed.valid) {
        invalidRows += 1;
        continue;
      }

      insert.run({ ...parsed.lead, updated_at: nowIso() });
      imported += 1;
    }

    return { imported, invalidRows };
  })(records);

  summarizeCsvImport({
    filename: req.file.originalname,
    detectedColumns: detected,
    ignoredColumns: ignored,
    imported: result.imported,
    invalidRows: result.invalidRows
  });

  res.status(201).json({
    imported: result.imported,
    invalidRows: result.invalidRows,
    detectedColumns: detected,
    ignoredColumns: ignored,
    filename: req.file.originalname
  });
});

app.patch('/api/leads/:id', (req, res) => {
  const current = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Lead not found' });

  const next = { ...current, ...req.body };
  const update = db.prepare(`
    UPDATE leads
    SET business_name = @business_name, phone = @phone, city = @city, niche = @niche,
        instagram = @instagram, website = @website, notes = @notes, status = @status, call_count = @call_count,
        last_call_at = @last_call_at, next_call_at = @next_call_at, updated_at = @updated_at
    WHERE id = @id
  `);
  update.run({
    id: current.id,
    business_name: next.business_name,
    phone: next.phone || '',
    city: next.city || '',
    niche: next.niche || '',
    instagram: next.instagram || '',
    website: next.website || '',
    notes: next.notes || '',
    status: next.status || 'new',
    call_count: Number(next.call_count || 0),
    last_call_at: next.last_call_at || null,
    next_call_at: next.next_call_at || null,
    updated_at: nowIso()
  });
  res.json(db.prepare('SELECT * FROM leads WHERE id = ?').get(current.id));
});

app.delete('/api/leads/:id', deleteLead);
app.delete('/leads/:id', deleteLead);
app.delete('/api/leads', deleteAllLeads);
app.delete('/leads', deleteAllLeads);

app.post('/api/leads/:id/call', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  const outcome = req.body.outcome || 'no_answer';
  const nextCallAt = req.body.next_call_at || null;
  const note = req.body.note || '';
  const callTime = nowIso();

  const saveCall = db.transaction(() => {
    db.prepare('INSERT INTO call_events (lead_id, outcome, note, created_at) VALUES (?, ?, ?, ?)').run(lead.id, outcome, note, callTime);
    db.prepare(`
      UPDATE leads
      SET status = ?, call_count = call_count + 1, last_call_at = ?, next_call_at = ?, updated_at = ?
      WHERE id = ?
    `).run(outcome, callTime, nextCallAt, callTime, lead.id);
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
  });

  res.json(saveCall());
});

app.get('/api/calls/history/:leadId', (req, res) => {
  const rows = db.prepare('SELECT * FROM call_events WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.leadId);
  res.json(rows);
});

app.get('/api/analytics', (_req, res) => {
  const objectiveRows = db.prepare('SELECT * FROM objectives').all().map(mapObjective);
  const totalObjectives = objectiveRows.length;
  const completedObjectives = objectiveRows.filter((item) => item.status === 'completed' || item.progress >= 100).length;
  const overallProgress = totalObjectives
    ? Math.round(objectiveRows.reduce((sum, item) => sum + item.progress, 0) / totalObjectives)
    : 0;

  const leadCounts = db.prepare('SELECT status, COUNT(*) as count FROM leads GROUP BY status').all();
  const statusCounts = Object.fromEntries(leadCounts.map((row) => [row.status, row.count]));
  const callsTotal = db.prepare('SELECT COUNT(*) as count FROM call_events').get().count;
  const responded = (statusCounts.interested || 0) + (statusCounts.callback || 0) + (statusCounts.closed || 0);
  const conversion = callsTotal ? Math.round(((statusCounts.closed || 0) / callsTotal) * 100) : 0;
  const responseRate = callsTotal ? Math.round((responded / callsTotal) * 100) : 0;
  const callsByDay = db.prepare(`
    SELECT * FROM (
      SELECT substr(created_at, 1, 10) as day, COUNT(*) as calls
      FROM call_events
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    )
    ORDER BY day ASC
  `).all();

  const monthlyCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM objectives
    WHERE (status = 'completed' OR current_value >= target_value)
    AND substr(updated_at, 1, 7) = substr(CURRENT_TIMESTAMP, 1, 7)
  `).get().count;

  res.json({
    objectives: {
      total: totalObjectives,
      completed: completedObjectives,
      overallProgress,
      monthlyCompleted,
      active: objectiveRows.filter((item) => item.status === 'active').length
    },
    calls: {
      total: callsTotal,
      responseRate,
      conversion,
      interested: statusCounts.interested || 0,
      callbacks: statusCounts.callback || 0,
      closed: statusCounts.closed || 0,
      dead: statusCounts.dead || 0,
      noAnswer: statusCounts.no_answer || 0,
      newLeads: statusCounts.new || 0,
      byDay: callsByDay
    }
  });
});

app.listen(port, () => {
  console.log(`Likeli OS backend running at http://127.0.0.1:${port}`);
});
