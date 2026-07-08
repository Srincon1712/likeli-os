export const DAILY_COMPLIANCE_SCHEMA_VERSION = 2;

export const LIFE_SCORE_RING_CONFIG = {
  empty: {
    color: '#64748b',
    track: 'rgba(148, 163, 184, 0.14)',
    label: 'Sin registro'
  },
  levels: [
    { min: 0, max: 30, color: '#ef4444', label: 'Bajo' },
    { min: 30, max: 60, color: '#f97316', label: 'Normal bajo' },
    { min: 60, max: 80, color: '#eab308', label: 'Bueno' },
    { min: 80, max: 100, color: '#22c55e', label: 'Excelente' },
    { min: 100, max: Infinity, color: '#a855f7', label: 'Sobrecumplimiento' }
  ],
  track: 'rgba(16, 185, 129, 0.12)'
};

export const LIFE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', group: 'Overview' },
  { id: 'daily-compliance', label: 'Cumplimiento Diario', group: 'Core' },
  { id: 'training', label: 'Entrenamiento', group: 'Analíticas' },
  { id: 'sleep', label: 'Sueño', group: 'Analíticas' },
  { id: 'reading', label: 'Lectura', group: 'Analíticas' },
  { id: 'writing', label: 'Escritura', group: 'Analíticas' },
  { id: 'meditation', label: 'Meditación', group: 'Analíticas' },
  { id: 'water', label: 'Agua', group: 'Analíticas' },
  { id: 'productivity', label: 'Productividad', group: 'Analíticas' },
  { id: 'planning', label: 'Planeación', group: 'Analíticas' },
  { id: 'learning', label: 'Aprendizaje', group: 'Analíticas' },
  { id: 'analytics', label: 'Analíticas', group: 'Sistema' }
];

export const DAILY_COMPLIANCE_FIELDS = [
  {
    id: 'training',
    label: 'Entrenamiento',
    moduleId: 'training',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '90' },
    scoring: { direction: 'more', minimum: 30, ideal: 90, bonusLimit: 120, weight: 16 }
  },
  {
    id: 'reading',
    label: 'Lectura',
    moduleId: 'reading',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '30' },
    scoring: { direction: 'more', minimum: 10, ideal: 30, bonusLimit: 45, weight: 7 }
  },
  {
    id: 'writing',
    label: 'Escritura',
    moduleId: 'writing',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '30' },
    scoring: { direction: 'more', minimum: 10, ideal: 30, bonusLimit: 45, weight: 7 }
  },
  {
    id: 'meditation',
    label: 'Meditación',
    moduleId: 'meditation',
    input: { type: 'number', unit: 'min', min: 0, step: 1, placeholder: '10' },
    scoring: { direction: 'more', minimum: 5, ideal: 10, bonusLimit: 20, weight: 6 }
  },
  {
    id: 'sleep',
    label: 'Sueño',
    moduleId: 'sleep',
    input: { type: 'number', unit: 'h', min: 0, step: 0.25, placeholder: '7' },
    scoring: { direction: 'more', minimum: 6.5, ideal: 7, bonusLimit: 8, weight: 17 }
  },
  {
    id: 'water',
    label: 'Agua',
    moduleId: 'water',
    input: { type: 'number', unit: 'vasos', min: 0, step: 1, placeholder: '10' },
    scoring: { direction: 'more', minimum: 6, ideal: 10, bonusLimit: 12, weight: 7 }
  },
  {
    id: 'walk_sun',
    label: 'Caminar / Sol',
    moduleId: 'wellbeing',
    input: { type: 'number', unit: 'min', min: 0, step: 1, placeholder: '5' },
    scoring: { direction: 'more', minimum: 1, ideal: 5, bonusLimit: 15, weight: 5 }
  },
  {
    id: 'deep_focus',
    label: 'Deep Focus',
    moduleId: 'productivity',
    input: { type: 'number', unit: 'h', min: 0, step: 0.25, placeholder: '6' },
    scoring: { direction: 'more', minimum: 3, ideal: 6, bonusLimit: 8, weight: 16 }
  },
  {
    id: 'planning',
    label: 'Planeación',
    moduleId: 'planning',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '60' },
    scoring: { direction: 'more', minimum: 10, ideal: 60, bonusLimit: 90, weight: 6 }
  },
  {
    id: 'learning',
    label: 'Aprendizaje',
    moduleId: 'learning',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '60' },
    scoring: { direction: 'more', minimum: 10, ideal: 60, bonusLimit: 90, weight: 7 }
  },
  {
    id: 'sleep_schedule',
    label: 'Hora de dormir / despertar',
    moduleId: 'sleep',
    input: {
      type: 'time-pair',
      fields: [
        { key: 'bedTime', label: 'Dormir', placeholder: '22:30' },
        { key: 'wakeTime', label: 'Despertar', placeholder: '05:30' }
      ]
    },
    scoring: {
      direction: 'time-window',
      idealMinutes: 60,
      minimumMinutes: 120,
      failMinutes: 240,
      targetBedTime: '22:30',
      targetWakeTime: '05:30',
      weight: 9
    }
  },
  {
    id: 'screens_before_sleep',
    label: 'Pantallas antes de dormir',
    moduleId: 'sleep',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '0' },
    scoring: { direction: 'less', ideal: 0, minimum: 30, failLimit: 90, weight: 6 }
  },
  {
    id: 'social_media',
    label: 'Redes sociales',
    moduleId: 'productivity',
    input: { type: 'number', unit: 'min', min: 0, step: 5, placeholder: '15' },
    scoring: { direction: 'less', ideal: 15, minimum: null, failLimit: 90, weight: 6 }
  }
];

export const LIFE_ANALYTIC_MODULES = {
  training: { title: 'Entrenamiento', fieldIds: ['training'] },
  sleep: { title: 'Sueño', fieldIds: ['sleep', 'sleep_schedule', 'screens_before_sleep'] },
  reading: { title: 'Lectura', fieldIds: ['reading'] },
  writing: { title: 'Escritura', fieldIds: ['writing'] },
  meditation: { title: 'Meditación', fieldIds: ['meditation'] },
  water: { title: 'Agua', fieldIds: ['water'] },
  productivity: { title: 'Productividad', fieldIds: ['deep_focus', 'social_media'] },
  planning: { title: 'Planeación', fieldIds: ['planning'] },
  learning: { title: 'Aprendizaje', fieldIds: ['learning'] },
  analytics: { title: 'Analíticas', fieldIds: DAILY_COMPLIANCE_FIELDS.map((field) => field.id) }
};

const RECORDS_KEY = 'life-os:daily-compliance:records';
function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function padDatePart(value) {
  return String(value).padStart(2, '0');
}

export function getLocalDateKey(date = new Date()) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function getPreviousLocalDateKey(date = new Date()) {
  return getLocalDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1));
}

export function formatDisplayDate(dateKey) {
  if (!dateKey) return 'Sin fecha';
  const [year, month, day] = dateKey.split('-');
  return `${day}/${month}/${year}`;
}

export function getDailyCompliancePrompt(records = loadDailyComplianceRecords()) {
  const promptDateKey = getLocalDateKey();
  const targetDateKey = getPreviousLocalDateKey();
  const hasTargetRecord = records.some((record) => record.date === targetDateKey);

  return {
    shouldShow: !hasTargetRecord,
    promptDateKey,
    targetDateKey,
    targetDisplayDate: formatDisplayDate(targetDateKey)
  };
}

export function loadDailyComplianceRecords() {
  if (!canUseStorage()) return [];

  try {
    const rawRecords = window.localStorage.getItem(RECORDS_KEY);
    const records = rawRecords ? JSON.parse(rawRecords) : [];
    return Array.isArray(records) ? sortRecords(records.map(normalizeRecord)) : [];
  } catch {
    return [];
  }
}

export function saveDailyComplianceRecord(record) {
  if (!canUseStorage()) return [record];

  const records = loadDailyComplianceRecords();
  const nextRecords = sortRecords([record, ...records.filter((item) => item.date !== record.date)]);
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function deleteDailyComplianceRecord(date) {
  if (!canUseStorage()) return [];

  const nextRecords = loadDailyComplianceRecords().filter((record) => record.date !== date);
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(nextRecords));
  return nextRecords;
}

export function clearDailyComplianceRecord(date) {
  return deleteDailyComplianceRecord(date);
}

export function createDailyComplianceRecord({ date, values, promptedOn }) {
  return {
    schemaVersion: DAILY_COMPLIANCE_SCHEMA_VERSION,
    date,
    promptedOn,
    recordedAt: new Date().toISOString(),
    values: normalizeValues(values)
  };
}

export function getFieldById(id) {
  return DAILY_COMPLIANCE_FIELDS.find((field) => field.id === id);
}

export function getRecordAnalysis(record) {
  const normalizedRecord = normalizeRecord(record);
  const fields = DAILY_COMPLIANCE_FIELDS.map((field) => {
    const rawValue = normalizedRecord.values[field.id];
    const score = calculateFieldScore(field, rawValue);

    return {
      ...score,
      id: field.id,
      label: field.label,
      moduleId: field.moduleId,
      rawValue,
      displayValue: formatFieldValue(field, rawValue),
      maxScore: field.scoring.weight
    };
  });
  const lifeScore = Math.round(fields.reduce((total, field) => total + field.score, 0));
  const maxLifeScore = DAILY_COMPLIANCE_FIELDS.reduce((total, field) => total + field.scoring.weight, 0);
  const scorePercentage = maxLifeScore ? Math.round((lifeScore / maxLifeScore) * 100) : 0;
  const percentage = clamp(scorePercentage, 0, 100);

  return {
    ...normalizedRecord,
    fields,
    lifeScore,
    maxLifeScore,
    scorePercentage,
    percentage,
    status: getDailyComplianceStatus(fields)
  };
}

export function getLifeScoreRingVisual(scorePercentage, hasRecord = true) {
  if (!hasRecord) {
    return LIFE_SCORE_RING_CONFIG.empty;
  }

  return LIFE_SCORE_RING_CONFIG.levels.find((level) => scorePercentage >= level.min && scorePercentage < level.max) || LIFE_SCORE_RING_CONFIG.levels[0];
}

export function getDashboardAnalytics(records) {
  const analyses = sortRecords(records).map(getRecordAnalysis);
  const latest = analyses[0] || null;
  const last7 = analyses.slice(0, 7);
  const last30 = analyses.slice(0, 30);
  const bestDay = getBestRecord(analyses);
  const worstDay = getWorstRecord(analyses);
  const previous = analyses[1] || null;

  return {
    latest,
    weeklyScore: sumBy(last7, 'lifeScore'),
    monthlyScore: sumBy(last30, 'lifeScore'),
    weeklyAverage: averageBy(last7, 'lifeScore'),
    monthlyAverage: averageBy(last30, 'lifeScore'),
    bestDay,
    worstDay,
    trend: latest && previous ? latest.lifeScore - previous.lifeScore : 0,
    compliancePercentage: averageBy(last7.length ? last7 : analyses, 'percentage'),
    activitySummary: DAILY_COMPLIANCE_FIELDS.map((field) => {
      const latestField = latest?.fields.find((item) => item.id === field.id);
      return {
        id: field.id,
        label: field.label,
        status: latestField?.status || 'Sin datos',
        displayValue: latestField?.displayValue || 'Sin datos',
        score: latestField?.score || 0,
        maxScore: field.scoring.weight
      };
    })
  };
}

export function getModuleAnalytics(records, moduleId) {
  const moduleConfig = LIFE_ANALYTIC_MODULES[moduleId] || LIFE_ANALYTIC_MODULES.analytics;
  const analyses = sortRecords(records).map(getRecordAnalysis);
  const fieldIds = moduleConfig.fieldIds;
  const rows = analyses.map((record) => {
    const fields = record.fields.filter((field) => fieldIds.includes(field.id));
    const maxScore = sumBy(fields, 'maxScore');
    const score = Math.round(sumBy(fields, 'score'));
    const percentage = maxScore ? clamp(Math.round((score / maxScore) * 100), 0, 100) : 0;

    return {
      date: record.date,
      fields,
      score,
      maxScore,
      percentage
    };
  });
  const bestDay = getBestRecord(rows, 'score');
  const worstDay = getWorstRecord(rows, 'score');
  const latest = rows[0] || null;
  const previous = rows[1] || null;
  const distribution = {
    ideal: rows.reduce((total, row) => total + row.fields.filter((field) => field.status === 'Cumplimiento ideal').length, 0),
    minimum: rows.reduce((total, row) => total + row.fields.filter((field) => field.status === 'Cumplimiento mínimo').length, 0),
    notMet: rows.reduce((total, row) => total + row.fields.filter((field) => field.status === 'No cumplido').length, 0)
  };

  return {
    title: moduleConfig.title,
    fieldIds,
    rows,
    latest,
    dailyEvolution: rows.slice(0, 14).reverse(),
    weeklyScore: sumBy(rows.slice(0, 7), 'score'),
    monthlyScore: sumBy(rows.slice(0, 30), 'score'),
    average: averageBy(rows, 'score'),
    averagePercentage: averageBy(rows, 'percentage'),
    bestDay,
    worstDay,
    trend: latest && previous ? latest.score - previous.score : 0,
    distribution,
    compliance: averageBy(rows, 'percentage')
  };
}

export function formatTrend(value) {
  if (value > 0) return `+${value}`;
  return String(value);
}

export function formatFieldValue(field, value) {
  if (field.input.type === 'time-pair') {
    if (!value?.bedTime || !value?.wakeTime) return 'Sin datos';
    return `${value.bedTime} / ${value.wakeTime}`;
  }

  if (value === '' || value === null || value === undefined || Number.isNaN(Number(value))) return 'Sin datos';
  return `${Number(value)} ${field.input.unit}`;
}

function calculateFieldScore(field, value) {
  const { scoring } = field;

  if (scoring.direction === 'time-window') {
    return calculateTimeWindowScore(scoring, value);
  }

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return { score: 0, status: 'No cumplido' };
  }

  if (scoring.direction === 'less') {
    return calculateLessIsBetterScore(scoring, numericValue);
  }

  return calculateMoreIsBetterScore(scoring, numericValue);
}

function calculateMoreIsBetterScore(scoring, value) {
  const { minimum, ideal, bonusLimit, weight } = scoring;
  const cappedValue = clamp(value, 0, bonusLimit);
  const baseRatio = clamp(cappedValue / ideal, 0, 1);
  const bonusRatio = cappedValue > ideal ? clamp((cappedValue - ideal) / (bonusLimit - ideal || 1), 0, 1) : 0;
  const score = weight * baseRatio + weight * 0.1 * bonusRatio;

  return {
    score: Math.round(score * 10) / 10,
    status: value >= ideal ? 'Cumplimiento ideal' : value >= minimum ? 'Cumplimiento mínimo' : 'No cumplido'
  };
}

function calculateLessIsBetterScore(scoring, value) {
  const { ideal, minimum, failLimit, weight } = scoring;
  if (value <= ideal) {
    return { score: weight, status: 'Cumplimiento ideal' };
  }

  if (minimum !== null && value <= minimum) {
    const progress = 1 - (value - ideal) / (minimum - ideal || 1);
    return {
      score: Math.round(weight * (0.6 + progress * 0.4) * 10) / 10,
      status: 'Cumplimiento mínimo'
    };
  }

  const decayStart = minimum ?? ideal;
  const decay = 1 - clamp((value - decayStart) / (failLimit - decayStart || 1), 0, 1);
  return {
    score: Math.round(weight * 0.6 * decay * 10) / 10,
    status: minimum === null && value <= ideal ? 'Cumplimiento ideal' : 'No cumplido'
  };
}

function calculateTimeWindowScore(scoring, value) {
  if (!value?.bedTime || !value?.wakeTime) {
    return { score: 0, status: 'No cumplido', detail: 'Sin horarios' };
  }

  const bedDiff = getCircularMinuteDiff(value.bedTime, scoring.targetBedTime);
  const wakeDiff = getCircularMinuteDiff(value.wakeTime, scoring.targetWakeTime);
  const averageDiff = (bedDiff + wakeDiff) / 2;
  const scoreRatio = 1 - clamp((averageDiff - scoring.idealMinutes) / (scoring.failMinutes - scoring.idealMinutes || 1), 0, 1);
  const score = scoring.weight * (averageDiff <= scoring.idealMinutes ? 1 : scoreRatio);

  return {
    score: Math.round(score * 10) / 10,
    status: averageDiff <= scoring.idealMinutes ? 'Cumplimiento ideal' : averageDiff <= scoring.minimumMinutes ? 'Cumplimiento mínimo' : 'No cumplido',
    detail: `${Math.round(averageDiff)} min de variacion`
  };
}

function getCircularMinuteDiff(timeA, timeB) {
  const diff = Math.abs(timeToMinutes(timeA) - timeToMinutes(timeB));
  return Math.min(diff, 1440 - diff);
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
}

function getDailyComplianceStatus(fields) {
  if (!fields.length) return 'Sin datos';
  const idealCount = fields.filter((field) => field.status === 'Cumplimiento ideal').length;
  const minimumCount = fields.filter((field) => field.status === 'Cumplimiento mínimo').length;
  const completionRatio = (idealCount + minimumCount) / fields.length;

  if (idealCount === fields.length) return 'Cumplimiento ideal';
  if (completionRatio >= 0.75) return 'Cumplimiento alto';
  if (completionRatio >= 0.5) return 'Cumplimiento medio';
  if (completionRatio > 0) return 'Cumplimiento bajo';
  return 'No cumplido';
}

function normalizeRecord(record) {
  if (record?.values) {
    return {
      schemaVersion: record.schemaVersion || DAILY_COMPLIANCE_SCHEMA_VERSION,
      date: record.date,
      promptedOn: record.promptedOn,
      recordedAt: record.recordedAt,
      values: normalizeValues(record.values)
    };
  }

  return {
    schemaVersion: DAILY_COMPLIANCE_SCHEMA_VERSION,
    date: record?.date,
    promptedOn: record?.promptedOn,
    recordedAt: record?.recordedAt,
    values: {}
  };
}

function normalizeValues(values = {}) {
  return DAILY_COMPLIANCE_FIELDS.reduce((normalizedValues, field) => {
    if (field.input.type === 'time-pair') {
      normalizedValues[field.id] = {
        bedTime: values[field.id]?.bedTime || '',
        wakeTime: values[field.id]?.wakeTime || ''
      };
      return normalizedValues;
    }

    const value = values[field.id];
    normalizedValues[field.id] = value === '' || value === null || value === undefined ? '' : Number(value);
    return normalizedValues;
  }, {});
}

function sumBy(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}

function averageBy(items, key) {
  if (!items.length) return 0;
  return Math.round(sumBy(items, key) / items.length);
}

function getBestRecord(records, key = 'lifeScore') {
  if (!records.length) return null;
  return records.reduce((best, record) => (record[key] > best[key] ? record : best), records[0]);
}

function getWorstRecord(records, key = 'lifeScore') {
  if (!records.length) return null;
  return records.reduce((worst, record) => (record[key] < worst[key] ? record : worst), records[0]);
}

function sortRecords(records) {
  return [...records].filter((record) => record.date).sort((a, b) => b.date.localeCompare(a.date));
}
