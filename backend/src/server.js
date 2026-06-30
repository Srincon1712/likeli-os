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
const leadFields = [
  'business_name',
  'phone',
  'city',
  'niche',
  'instagram',
  'website',
  'notes',
  'call_note',
  'callback_date',
  'status',
  'call_count',
  'last_call_at',
  'next_call_at',
  'company',
  'sector',
  'contact_name',
  'contact_role',
  'whatsapp',
  'email',
  'social_links',
  'objections',
  'budget',
  'probability',
  'last_contact_at',
  'next_follow_up_at',
  'priority',
  'pipeline_stage',
  'revenue_value'
];

const tables = {
  scripts: {
    table: 'script_library',
    fields: ['category', 'title', 'content', 'tags'],
    defaults: { category: 'script', content: '', tags: '' },
    order: 'updated_at DESC, id DESC'
  },
  deals: {
    table: 'commercial_deals',
    fields: ['lead_id', 'title', 'stage', 'value', 'probability', 'forecast_date', 'notes'],
    defaults: { lead_id: null, stage: 'Lead', value: 0, probability: 0, notes: '' },
    order: 'updated_at DESC, id DESC'
  },
  finance: {
    table: 'finance_records',
    fields: ['type', 'category', 'amount', 'record_date', 'notes'],
    defaults: { type: 'income', category: '', amount: 0, record_date: null, notes: '' },
    order: 'record_date DESC, id DESC'
  },
  productivity: {
    table: 'productivity_items',
    fields: ['type', 'title', 'status', 'priority', 'project', 'due_date', 'minutes', 'notes'],
    defaults: { type: 'task', status: 'open', priority: 'medium', project: '', due_date: null, minutes: 0, notes: '' },
    order: 'updated_at DESC, id DESC'
  },
  knowledge: {
    table: 'knowledge_items',
    fields: ['type', 'title', 'content', 'tags'],
    defaults: { type: 'playbook', content: '', tags: '' },
    order: 'updated_at DESC, id DESC'
  },
  personal: {
    table: 'personal_metrics',
    fields: ['metric_date', 'sleep_hours', 'exercise_minutes', 'reading_minutes', 'weight', 'energy', 'productivity', 'nutrition', 'social_minutes', 'notes'],
    defaults: {
      metric_date: null,
      sleep_hours: 0,
      exercise_minutes: 0,
      reading_minutes: 0,
      weight: 0,
      energy: 0,
      productivity: 0,
      nutrition: '',
      social_minutes: 0,
      notes: ''
    },
    order: 'metric_date DESC, id DESC'
  }
};

function mapObjective(row) {
  const progress = row.target_value > 0 ? Math.min(100, Math.round((row.current_value / row.target_value) * 100)) : 0;
  return { ...row, progress };
}

function pipelineStageFromOutcome(outcome, currentStage = 'Lead') {
  const map = {
    new: 'Lead',
    no_answer: 'Contacto',
    wrong_number: 'Perdido',
    not_interested: 'Perdido',
    dead: 'Perdido',
    callback: 'Contacto',
    interested: 'Interesado',
    meeting: 'Demo',
    proposal: 'Propuesta',
    closed: 'Ganado',
    sale: 'Ganado'
  };
  return map[outcome] || currentStage || 'Lead';
}

function rate(part, total) {
  return total ? Math.round((part / total) * 100) : 0;
}

function createLeadNote(leadId, content, source = 'manual', createdAt = nowIso()) {
  const cleanContent = String(content || '').trim();
  if (!cleanContent) return null;
  const result = db.prepare(`
    INSERT INTO lead_notes (lead_id, content, source, created_at)
    VALUES (?, ?, ?, ?)
  `).run(leadId, cleanContent, source, createdAt);
  return db.prepare('SELECT * FROM lead_notes WHERE id = ?').get(result.lastInsertRowid);
}

function coercePayload(body, config, current = {}) {
  const updated_at = nowIso();
  return config.fields.reduce((payload, field) => {
    const fallback = Object.prototype.hasOwnProperty.call(current, field)
      ? current[field]
      : Object.prototype.hasOwnProperty.call(config.defaults, field)
        ? config.defaults[field]
        : '';
    const value = Object.prototype.hasOwnProperty.call(body, field) ? body[field] : fallback;
    payload[field] = value === '' && field.endsWith('_date') ? null : value;
    return payload;
  }, { updated_at });
}

function registerCrud(resource, config) {
  app.get(`/api/${resource}`, (_req, res) => {
    const rows = db.prepare(`SELECT * FROM ${config.table} ORDER BY ${config.order}`).all();
    res.json(rows);
  });

  app.post(`/api/${resource}`, (req, res) => {
    const payload = coercePayload(req.body, config);
    if (config.fields.includes('title') && !String(payload.title || '').trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const fields = [...config.fields, 'updated_at'];
    const columns = fields.join(', ');
    const values = fields.map((field) => `@${field}`).join(', ');
    const result = db.prepare(`INSERT INTO ${config.table} (${columns}) VALUES (${values})`).run(payload);
    res.status(201).json(db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(result.lastInsertRowid));
  });

  app.patch(`/api/${resource}/:id`, (req, res) => {
    const current = db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Record not found' });
    const payload = { ...coercePayload(req.body, config, current), id: current.id };
    const assignments = [...config.fields, 'updated_at'].map((field) => `${field} = @${field}`).join(', ');
    db.prepare(`UPDATE ${config.table} SET ${assignments} WHERE id = @id`).run(payload);
    res.json(db.prepare(`SELECT * FROM ${config.table} WHERE id = ?`).get(current.id));
  });

  app.delete(`/api/${resource}/:id`, (req, res) => {
    db.prepare(`DELETE FROM ${config.table} WHERE id = ?`).run(req.params.id);
    res.status(204).end();
  });
}

function listLeads(req, res) {
  const status = req.query.status;
  const stageId = Number(req.query.stage_id);
  const filters = [];
  const params = [];
  if (status) {
    filters.push('status = ?');
    params.push(status);
  }
  if (stageId) {
    filters.push('stage_id = ?');
    params.push(stageId);
  }
  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM leads ${where} ORDER BY next_follow_up_at IS NULL, next_follow_up_at ASC, updated_at DESC, id DESC`).all(...params);
  res.json(rows);
}

function deleteLead(req, res) {
  db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  res.status(204).end();
}

function deleteAllLeads(req, res) {
  const stageId = Number(req.query.stage_id);
  const result = stageId
    ? db.prepare('DELETE FROM leads WHERE stage_id = ?').run(stageId)
    : db.prepare('DELETE FROM leads').run();
  res.json({ deleted: result.changes });
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: dbPath });
});

Object.entries(tables).forEach(([resource, config]) => registerCrud(resource, config));

app.get('/api/stages', (_req, res) => {
  const rows = db.prepare(`
    SELECT lead_stages.*, COUNT(leads.id) AS lead_count
    FROM lead_stages
    LEFT JOIN leads ON leads.stage_id = lead_stages.id
    GROUP BY lead_stages.id
    ORDER BY lead_stages.id DESC
  `).all();
  res.json(rows);
});

app.post('/api/stages', (req, res) => {
  const nextNumber = db.prepare('SELECT COUNT(*) AS count FROM lead_stages').get().count + 1;
  const name = String(req.body.name || '').trim() || `Etapa ${nextNumber}`;
  const result = db.prepare('INSERT INTO lead_stages (name) VALUES (?)').run(name);
  res.status(201).json(db.prepare('SELECT *, 0 AS lead_count FROM lead_stages WHERE id = ?').get(result.lastInsertRowid));
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

app.get('/api/leads/:id/notes', (req, res) => {
  const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const rows = db.prepare('SELECT * FROM lead_notes WHERE lead_id = ? ORDER BY created_at ASC, id ASC').all(req.params.id);
  res.json(rows);
});

app.post('/api/leads/:id/notes', (req, res) => {
  const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });
  const note = createLeadNote(lead.id, req.body.content || req.body.note, req.body.source || 'manual');
  if (!note) return res.status(400).json({ error: 'Note content is required' });
  res.status(201).json(note);
});

app.post('/api/leads', (req, res) => {
  const body = req.body;
  const stage = body.stage_id
    ? db.prepare('SELECT id FROM lead_stages WHERE id = ?').get(body.stage_id)
    : db.prepare('SELECT id FROM lead_stages ORDER BY id DESC LIMIT 1').get();
  const payload = {
    business_name: body.business_name || body.company || 'Unnamed lead',
    phone: body.phone || '',
    city: body.city || '',
    niche: body.niche || body.sector || '',
    instagram: body.instagram || '',
    website: body.website || '',
    notes: body.notes || '',
    call_note: body.call_note || '',
    callback_date: body.callback_date || null,
    status: body.status || 'new',
    call_count: Number(body.call_count || 0),
    last_call_at: body.last_call_at || null,
    next_call_at: body.next_call_at || null,
    company: body.company || body.business_name || '',
    sector: body.sector || body.niche || '',
    contact_name: body.contact_name || '',
    contact_role: body.contact_role || '',
    whatsapp: body.whatsapp || body.phone || '',
    email: body.email || '',
    social_links: body.social_links || '',
    objections: body.objections || '',
    budget: Number(body.budget || 0),
    probability: Number(body.probability || 0),
    last_contact_at: body.last_contact_at || null,
    next_follow_up_at: body.next_follow_up_at || body.next_call_at || null,
    priority: body.priority || 'medium',
    pipeline_stage: body.pipeline_stage || 'Lead',
    revenue_value: Number(body.revenue_value || body.budget || 0),
    stage_id: stage?.id || null,
    updated_at: nowIso()
  };
  const fields = [...leadFields, 'stage_id', 'updated_at'];
  const columns = fields.join(', ');
  const values = fields.map((field) => `@${field}`).join(', ');
  const result = db.prepare(`INSERT INTO leads (${columns}) VALUES (${values})`).run(payload);
  res.status(201).json(db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid));
});

app.post('/api/leads/import', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'CSV file is required' });

  const requestedStageId = Number(req.body.stage_id);
  const stage = requestedStageId
    ? db.prepare('SELECT id FROM lead_stages WHERE id = ?').get(requestedStageId)
    : db.prepare('SELECT id FROM lead_stages ORDER BY id DESC LIMIT 1').get();
  if (!stage) return res.status(400).json({ error: 'Lead stage not found' });

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
    INSERT INTO leads (business_name, phone, city, niche, instagram, website, notes, stage_id, updated_at)
    VALUES (@business_name, @phone, @city, @niche, @instagram, @website, @notes, @stage_id, @updated_at)
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

      insert.run({ ...parsed.lead, stage_id: stage.id, updated_at: nowIso() });
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
        instagram = @instagram, website = @website, notes = @notes, call_note = @call_note, callback_date = @callback_date, status = @status, call_count = @call_count,
        last_call_at = @last_call_at, next_call_at = @next_call_at, company = @company, sector = @sector, contact_name = @contact_name,
        contact_role = @contact_role, whatsapp = @whatsapp, email = @email, social_links = @social_links, objections = @objections,
        budget = @budget, probability = @probability, last_contact_at = @last_contact_at, next_follow_up_at = @next_follow_up_at,
        priority = @priority, pipeline_stage = @pipeline_stage, revenue_value = @revenue_value, updated_at = @updated_at
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
    call_note: next.call_note || '',
    callback_date: next.callback_date || null,
    status: next.status || 'new',
    call_count: Number(next.call_count || 0),
    last_call_at: next.last_call_at || null,
    next_call_at: next.next_call_at || null,
    company: next.company || next.business_name || '',
    sector: next.sector || next.niche || '',
    contact_name: next.contact_name || '',
    contact_role: next.contact_role || '',
    whatsapp: next.whatsapp || next.phone || '',
    email: next.email || '',
    social_links: next.social_links || '',
    objections: next.objections || '',
    budget: Number(next.budget || 0),
    probability: Number(next.probability || 0),
    last_contact_at: next.last_contact_at || next.last_call_at || null,
    next_follow_up_at: next.next_follow_up_at || next.next_call_at || null,
    priority: next.priority || 'medium',
    pipeline_stage: next.pipeline_stage || 'Lead',
    revenue_value: Number(next.revenue_value || next.budget || 0),
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
  const note = String(req.body.note || '').trim();
  const callbackDate = req.body.callback_date || nextCallAt || null;
  const durationSeconds = Number(req.body.duration_seconds || 0);
  const callTime = nowIso();

  const saveCall = db.transaction(() => {
    db.prepare('INSERT INTO call_events (lead_id, outcome, note, duration_seconds, created_at) VALUES (?, ?, ?, ?, ?)').run(lead.id, outcome, note, durationSeconds, callTime);
    createLeadNote(lead.id, note, 'call', callTime);
    db.prepare(`
      UPDATE leads
      SET status = ?, call_count = call_count + 1, last_call_at = ?, next_call_at = ?, callback_date = ?, call_note = ?,
          last_contact_at = ?, next_follow_up_at = ?, pipeline_stage = ?, updated_at = ?
      WHERE id = ?
    `).run(outcome, callTime, nextCallAt, callbackDate, note, callTime, nextCallAt, pipelineStageFromOutcome(outcome, lead.pipeline_stage), callTime, lead.id);
    return db.prepare('SELECT * FROM leads WHERE id = ?').get(lead.id);
  });

  res.json(saveCall());
});

app.get('/api/calls/history/:leadId', (req, res) => {
  const rows = db.prepare('SELECT * FROM call_events WHERE lead_id = ? ORDER BY created_at DESC').all(req.params.leadId);
  res.json(rows);
});

app.get('/api/analytics', (req, res) => {
  const stageId = Number(req.query.stage_id);
  const leadWhere = stageId ? 'WHERE stage_id = ?' : '';
  const leadParams = stageId ? [stageId] : [];
  const callJoinWhere = stageId ? 'JOIN leads ON leads.id = call_events.lead_id WHERE leads.stage_id = ?' : '';
  const objectiveRows = db.prepare('SELECT * FROM objectives').all().map(mapObjective);
  const totalObjectives = objectiveRows.length;
  const completedObjectives = objectiveRows.filter((item) => item.status === 'completed' || item.progress >= 100).length;
  const overallProgress = totalObjectives
    ? Math.round(objectiveRows.reduce((sum, item) => sum + item.progress, 0) / totalObjectives)
    : 0;

  const leadCounts = db.prepare(`SELECT status, COUNT(*) as count FROM leads ${leadWhere} GROUP BY status`).all(...leadParams);
  const statusCounts = Object.fromEntries(leadCounts.map((row) => [row.status, row.count]));
  const callsTotal = db.prepare(`SELECT COUNT(*) as count FROM call_events ${callJoinWhere}`).get(...leadParams).count;
  const callOutcomes = db.prepare(`
    SELECT call_events.outcome, COUNT(*) as count
    FROM call_events
    ${callJoinWhere}
    GROUP BY call_events.outcome
  `).all(...leadParams);
  const outcomeCounts = Object.fromEntries(callOutcomes.map((row) => [row.outcome, row.count]));
  const leadsTotal = db.prepare(`SELECT COUNT(*) as count FROM leads ${leadWhere}`).get(...leadParams).count;
  const contacted = callsTotal;
  const conversations = (outcomeCounts.interested || 0) + (outcomeCounts.callback || 0) + (outcomeCounts.meeting || 0) + (outcomeCounts.proposal || 0) + (outcomeCounts.closed || 0) + (outcomeCounts.sale || 0);
  const interested = (statusCounts.interested || 0) + (statusCounts.callback || 0) + (statusCounts.meeting || 0) + (statusCounts.proposal || 0);
  const meetings = (statusCounts.meeting || 0) + (statusCounts.proposal || 0) + (statusCounts.closed || 0) + (statusCounts.sale || 0);
  const proposals = (statusCounts.proposal || 0) + (statusCounts.closed || 0) + (statusCounts.sale || 0);
  const won = (statusCounts.closed || 0) + (statusCounts.sale || 0);
  const responded = (statusCounts.interested || 0) + (statusCounts.callback || 0) + won;
  const conversion = rate(won, callsTotal);
  const responseRate = rate(responded, callsTotal);
  const callsByDay = db.prepare(`
    SELECT * FROM (
      SELECT substr(call_events.created_at, 1, 10) as day, COUNT(*) as calls
      FROM call_events
      ${callJoinWhere}
      GROUP BY day
      ORDER BY day DESC
      LIMIT 30
    )
    ORDER BY day ASC
  `).all(...leadParams);

  const monthlyCompleted = db.prepare(`
    SELECT COUNT(*) as count FROM objectives
    WHERE (status = 'completed' OR current_value >= target_value)
    AND substr(updated_at, 1, 7) = substr(CURRENT_TIMESTAMP, 1, 7)
  `).get().count;

  const pipeline = db.prepare(`
    SELECT pipeline_stage AS stage, COUNT(*) AS count, SUM(COALESCE(revenue_value, budget, 0)) AS value
    FROM leads
    ${leadWhere}
    GROUP BY pipeline_stage
  `).all(...leadParams);
  const avgDuration = db.prepare(`SELECT AVG(duration_seconds) AS value FROM call_events ${callJoinWhere}`).get(...leadParams).value || 0;
  const monthRevenue = db.prepare(`
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
           COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expenses
    FROM finance_records
    WHERE substr(record_date, 1, 7) = substr(CURRENT_TIMESTAMP, 1, 7)
  `).get();
  const cash = db.prepare(`
    SELECT COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) AS amount
    FROM finance_records
  `).get().amount;
  const openTasks = db.prepare("SELECT COUNT(*) AS count FROM productivity_items WHERE status != 'done'").get().count;
  const deepWorkMinutes = db.prepare(`
    SELECT COALESCE(SUM(minutes), 0) AS minutes
    FROM productivity_items
    WHERE type = 'deep_work' AND substr(updated_at, 1, 7) = substr(CURRENT_TIMESTAMP, 1, 7)
  `).get().minutes;
  const personalAverage = db.prepare(`
    SELECT AVG(energy) AS energy, AVG(productivity) AS productivity, AVG(sleep_hours) AS sleep
    FROM personal_metrics
    WHERE metric_date >= date('now', '-14 days')
  `).get();

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
    },
    sales: {
      funnel: [
        { stage: 'Leads', count: leadsTotal },
        { stage: 'Contactados', count: contacted },
        { stage: 'Conversaciones', count: conversations },
        { stage: 'Interesados', count: interested },
        { stage: 'Reuniones', count: meetings },
        { stage: 'Propuestas', count: proposals },
        { stage: 'Ventas', count: won }
      ],
      rates: {
        contactRate: rate(contacted, leadsTotal),
        interestedRate: rate(interested, contacted),
        meetingRate: rate(meetings, interested),
        proposalRate: rate(proposals, meetings),
        closeRate: rate(won, proposals || contacted)
      },
      revenue: monthRevenue.income,
      callsPerHour: 0,
      averageDurationSeconds: Math.round(avgDuration),
      salesThisWeek: db.prepare(`
        SELECT COUNT(*) AS count
        FROM call_events
        WHERE outcome IN ('closed', 'sale') AND created_at >= date('now', '-7 days')
      `).get().count
    },
    pipeline,
    finance: {
      income: monthRevenue.income,
      expenses: monthRevenue.expenses,
      cash,
      cashFlow: monthRevenue.income - monthRevenue.expenses,
      mrr: monthRevenue.income,
      arr: monthRevenue.income * 12,
      burnRate: monthRevenue.expenses,
      runway: monthRevenue.expenses ? Math.round((cash / monthRevenue.expenses) * 10) / 10 : null
    },
    productivity: {
      openTasks,
      deepWorkMinutes,
      activeObjectives: objectiveRows.filter((item) => item.status === 'active').length
    },
    personal: {
      averageEnergy: Math.round(personalAverage.energy || 0),
      averageProductivity: Math.round(personalAverage.productivity || 0),
      averageSleep: Math.round((personalAverage.sleep || 0) * 10) / 10
    }
  });
});

app.listen(port, () => {
  console.log(`Likeli OS backend running at http://127.0.0.1:${port}`);
});
