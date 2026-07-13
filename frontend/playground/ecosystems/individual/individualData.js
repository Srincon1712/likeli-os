import { DAILY_FIELDS, INDIVIDUAL_DOMAINS, SCORE_GROUPS } from './config.js';
import { dateFromKey, dateKey, getPendingDates, readRecords, RECORDS_EVENT, RECORDS_KEY, shiftDateKey, yesterdayKey } from './pending.js';

export { dateFromKey, dateKey, getPendingDates, readRecords, RECORDS_EVENT, shiftDateKey, yesterdayKey };

const fieldMap = new Map(DAILY_FIELDS.map((field) => [field.id, field]));

export function formatLongDate(key) {
  return new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(dateFromKey(key));
}

export function writeRecord(date, values) {
  const records = readRecords();
  const record = {
    schemaVersion: 2,
    date,
    promptedOn: dateKey(),
    recordedAt: new Date().toISOString(),
    values: normalizeValues(values)
  };
  const next = [record, ...records.filter((item) => item.date !== date)].sort((a, b) => b.date.localeCompare(a.date));
  window.localStorage.setItem(RECORDS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(RECORDS_EVENT));
  return next;
}

function normalizeValues(values) {
  return DAILY_FIELDS.reduce((result, field) => {
    if (field.type === 'time-pair') {
      result[field.id] = {
        bedTime: values[field.id]?.bedTime || '',
        wakeTime: values[field.id]?.wakeTime || ''
      };
    } else {
      const value = values[field.id];
      result[field.id] = value === '' || value === null || value === undefined ? '' : Number(value);
    }
    return result;
  }, {});
}

function minutes(time) {
  if (!time || !String(time).includes(':')) return null;
  const [hours, mins] = String(time).split(':').map(Number);
  return hours * 60 + mins;
}

function circularDifference(first, second) {
  const difference = Math.abs(first - second);
  return Math.min(difference, 1440 - difference);
}

function fieldAchievement(field, value) {
  if (field.type === 'time-pair') {
    if (!value?.bedTime || !value?.wakeTime) return 0;
    const deviation = (circularDifference(minutes(value.bedTime), minutes(field.idealBed)) + circularDifference(minutes(value.wakeTime), minutes(field.idealWake))) / 2;
    return Math.max(0, Math.min(1, 1 - Math.max(0, deviation - 30) / 210));
  }
  if (value === '' || value === null || value === undefined) return 0;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  if (field.direction === 'less') return Math.max(0, Math.min(1, 1 - (numeric - field.ideal) / ((field.fail || field.ideal + 1) - field.ideal)));
  return Math.max(0, Math.min(1, numeric / field.ideal));
}

export function analyzeRecord(record) {
  const groups = SCORE_GROUPS.map((group) => {
    const achievements = group.fields.map((id) => fieldAchievement(fieldMap.get(id), record?.values?.[id]));
    const ratio = achievements.length ? achievements.reduce((sum, value) => sum + value, 0) / achievements.length : 0;
    return { ...group, ratio, score: Math.round(group.weight * ratio * 10) / 10 };
  });
  const score = Math.min(100, Math.round(groups.reduce((sum, group) => sum + group.score, 0)));
  return {
    date: record.date,
    score,
    percentage: score,
    level: getLevel(score),
    status: score === 100 ? 'Perfecto' : 'Registrado',
    groups,
    values: record.values
  };
}

export function getLevel(score) {
  if (score >= 100) return 'Plenitud';
  if (score >= 85) return 'En equilibrio';
  if (score >= 70) return 'Sólido';
  if (score >= 50) return 'En construcción';
  return 'Recuperación';
}

export function getIndividualModel(records) {
  const analyses = [...records].sort((a, b) => b.date.localeCompare(a.date)).map(analyzeRecord);
  const latest = analyses[0] || null;
  const periodEnd = yesterdayKey();
  const recentStart = shiftDateKey(periodEnd, -6);
  const previousStart = shiftDateKey(periodEnd, -13);
  const previousEnd = shiftDateKey(periodEnd, -7);
  const last7 = analyses.filter((item) => item.date >= recentStart && item.date <= periodEnd);
  const average = last7.length ? Math.round(last7.reduce((sum, item) => sum + item.score, 0) / last7.length) : null;
  const previousAverage = analyses.filter((item) => item.date >= previousStart && item.date <= previousEnd);
  const previous = previousAverage.length ? Math.round(previousAverage.reduce((sum, item) => sum + item.score, 0) / previousAverage.length) : null;
  return {
    analyses,
    latest,
    score: average,
    level: average === null ? 'Esperando señal' : getLevel(average),
    trend: average !== null && previous !== null ? average - previous : null,
    pending: getPendingDates(records),
    consistency: last7.length ? Math.round((last7.length / 7) * 100) : 0
  };
}

export function getCalendarDays(month, records, now = new Date()) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const today = dateKey(now);
  const yesterday = yesterdayKey(now);
  const recordMap = new Map(records.map((record) => [record.date, record]));
  const pending = new Set(getPendingDates(records, now));
  const trackingStart = records.length ? records.reduce((minimum, record) => record.date < minimum ? record.date : minimum, records[0].date) : yesterday;
  const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const total = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array.from({ length: firstWeekday }, () => null);
  for (let day = 1; day <= total; day += 1) {
    const key = dateKey(new Date(year, monthIndex, day));
    const record = recordMap.get(key);
    const analysis = record ? analyzeRecord(record) : null;
    let state = 'Sin registro';
    if (key > today) state = 'Bloqueado';
    else if (key === today) state = 'Día actual';
    else if (record) state = analysis.score === 100 ? 'Perfecto' : 'Registrado';
    else if (pending.has(key)) state = 'Pendiente';
    else if (key < trackingStart) state = 'Sin registro';
    days.push({ key, day, state, record, analysis, canOpen: Boolean(record) || pending.has(key) });
  }
  while (days.length % 7) days.push(null);
  return days;
}

function median(values) {
  if (!values.length) return '';
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round(((sorted[middle - 1] + sorted[middle]) / 2) * 100) / 100;
}

function common(values) {
  const frequency = new Map();
  values.filter(Boolean).forEach((value) => frequency.set(value, (frequency.get(value) || 0) + 1));
  return [...frequency.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

export function getSmartValues(records, existing) {
  if (existing?.values) return normalizeValues(existing.values);
  const recent = records.slice(0, 14);
  return DAILY_FIELDS.reduce((values, field) => {
    if (field.type === 'time-pair') {
      values[field.id] = {
        bedTime: common(recent.map((record) => record.values?.[field.id]?.bedTime)),
        wakeTime: common(recent.map((record) => record.values?.[field.id]?.wakeTime))
      };
    } else {
      const history = recent.map((record) => numericRecordValue(record, field.id)).filter((value) => value !== null);
      values[field.id] = history.length >= 2 ? median(history) : '';
    }
    return values;
  }, {});
}

function average(records, fieldId) {
  const values = records.map((record) => numericRecordValue(record, fieldId)).filter((value) => value !== null);
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function formatAverage(value, unit, digits = 0) {
  return value === null ? '—' : `${value.toFixed(digits)} ${unit}`;
}

export function getDomainModel(records, domainId, rangeDays = 30) {
  const config = INDIVIDUAL_DOMAINS.find((domain) => domain.id === domainId) || INDIVIDUAL_DOMAINS[0];
  const end = yesterdayKey();
  const start = Number.isFinite(rangeDays) ? shiftDateKey(end, -(rangeDays - 1)) : null;
  const scoped = (start ? records.filter((record) => record.date >= start && record.date <= end) : records).sort((a, b) => b.date.localeCompare(a.date));
  const scores = scoped.map((record) => {
    const values = config.fieldIds.map((id) => fieldAchievement(fieldMap.get(id), record.values?.[id]));
    return { date: record.date, value: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) : null };
  }).reverse();
  const valid = scores.map((item) => item.value).filter((value) => value !== null);
  const score = valid.length ? Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length) : null;
  const metrics = domainMetrics(config.id, scoped);
  return {
    config,
    score,
    series: scores,
    metrics,
    hasSignal: config.fieldIds.some((id) => scoped.some((record) => record.values?.[id] !== '' && record.values?.[id] !== undefined)),
    insight: buildDomainInsight(config.id, scoped)
  };
}

function domainMetrics(id, records) {
  if (id === 'sleep') return [
    ['Promedio', formatAverage(average(records, 'sleep'), 'h', 1)],
    ['Pantallas', formatAverage(average(records, 'screens_before_sleep'), 'min')],
    ['Regularidad', scheduleRegularity(records)]
  ];
  if (id === 'training') return [
    ['Promedio', formatAverage(average(records, 'training'), 'min')],
    ['Carga acumulada', formatAverage(sum(records, 'training'), 'min')],
    ['Días activos', `${countPositive(records, 'training')} días`]
  ];
  if (id === 'nutrition') return [['Hidratación', formatAverage(average(records, 'water'), 'vasos', 1)], ['Calorías', 'Sin señal'], ['Proteína', 'Sin señal']];
  if (id === 'movement') return [['Aire libre', formatAverage(average(records, 'walk_sun'), 'min')], ['Días activos', `${countPositive(records, 'walk_sun')} días`], ['Pasos', 'Sin señal']];
  if (id === 'mental') return [['Meditación', formatAverage(average(records, 'meditation'), 'min')], ['Energía', 'Sin señal'], ['Estrés', 'Sin señal']];
  if (id === 'productivity') return [['Enfoque', formatAverage(average(records, 'deep_focus'), 'h', 1)], ['Aprendizaje', formatAverage(activityMinutes(records), 'min')], ['Redes', formatAverage(average(records, 'social_media'), 'min')]];
  return [['Peso', 'Sin señal'], ['Variabilidad cardíaca', 'Sin señal'], ['Capacidad aeróbica', 'Sin señal']];
}

function sum(records, id) {
  const values = records.map((record) => numericRecordValue(record, id)).filter((value) => value !== null);
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function countPositive(records, id) {
  return records.filter((record) => (numericRecordValue(record, id) || 0) > 0).length;
}

function activityMinutes(records) {
  if (!records.length) return null;
  return records.reduce((total, record) => total + ['reading', 'writing', 'learning'].reduce((day, id) => day + (numericRecordValue(record, id) || 0), 0), 0) / records.length;
}

function scheduleRegularity(records) {
  const bedtimes = records.map((record) => minutes(record.values?.sleep_schedule?.bedTime)).filter((value) => value !== null);
  if (bedtimes.length < 2) return 'Aprendiendo';
  const anchor = bedtimes[0];
  const deviation = bedtimes.reduce((sumValue, value) => sumValue + circularDifference(value, anchor), 0) / bedtimes.length;
  return deviation <= 30 ? 'Muy estable' : deviation <= 60 ? 'Estable' : 'Variable';
}

function correlation(records, first, second) {
  const pairs = records.map((record) => [numericRecordValue(record, first), numericRecordValue(record, second)]).filter(([a, b]) => a !== null && b !== null);
  if (pairs.length < 7) return null;
  const avgA = pairs.reduce((sumValue, pair) => sumValue + pair[0], 0) / pairs.length;
  const avgB = pairs.reduce((sumValue, pair) => sumValue + pair[1], 0) / pairs.length;
  let numerator = 0; let varianceA = 0; let varianceB = 0;
  pairs.forEach(([a, b]) => { const da = a - avgA; const db = b - avgB; numerator += da * db; varianceA += da * da; varianceB += db * db; });
  const denominator = Math.sqrt(varianceA * varianceB);
  return denominator ? numerator / denominator : null;
}

function numericRecordValue(record, id) {
  const raw = record.values?.[id];
  if (raw === '' || raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function buildDomainInsight(id, records) {
  const pair = id === 'sleep' ? ['sleep', 'deep_focus', 'descanso', 'enfoque']
    : id === 'training' ? ['training', 'reading', 'entrenamiento', 'lectura']
      : id === 'nutrition' ? ['water', 'deep_focus', 'hidratación', 'enfoque']
        : id === 'mental' ? ['meditation', 'social_media', 'calma', 'uso de redes']
          : id === 'productivity' ? ['social_media', 'deep_focus', 'uso de redes', 'enfoque']
            : ['walk_sun', 'sleep', 'movimiento', 'descanso'];
  const value = correlation(records, pair[0], pair[1]);
  if (value === null) return 'El sistema necesita siete días comparables para descubrir un patrón real.';
  const direction = value >= 0 ? 'avanzan juntos' : 'se mueven en direcciones opuestas';
  return `Tu ${pair[2]} y tu ${pair[3]} ${direction}. Relación observada: ${value >= 0 ? '+' : ''}${value.toFixed(2)}.`;
}
