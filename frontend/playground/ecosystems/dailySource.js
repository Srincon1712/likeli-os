const RECORDS_KEY = 'life-os:daily-compliance:records';

const KNOWN_FIELDS = [
  'training', 'reading', 'writing', 'meditation', 'sleep', 'water', 'walk_sun',
  'deep_focus', 'planning', 'learning', 'sleep_schedule', 'screens_before_sleep', 'social_media'
];

const FIELD_RULES = {
  training: { ideal: 90, direction: 'more' },
  reading: { ideal: 30, direction: 'more' },
  writing: { ideal: 30, direction: 'more' },
  meditation: { ideal: 10, direction: 'more' },
  sleep: { ideal: 7.5, direction: 'range', min: 6.5, max: 9 },
  water: { ideal: 10, direction: 'more' },
  walk_sun: { ideal: 15, direction: 'more' },
  deep_focus: { ideal: 6, direction: 'more' },
  planning: { ideal: 45, direction: 'more' },
  learning: { ideal: 60, direction: 'more' },
  screens_before_sleep: { ideal: 0, fail: 90, direction: 'less' },
  social_media: { ideal: 15, fail: 120, direction: 'less' }
};

const SYSTEM_FIELDS = {
  core: ['sleep', 'training', 'reading', 'writing', 'meditation', 'water', 'walk_sun', 'deep_focus', 'planning', 'learning', 'screens_before_sleep', 'social_media'],
  individual: ['sleep', 'training', 'water', 'meditation', 'walk_sun', 'deep_focus', 'social_media'],
  knowledge: ['reading', 'writing', 'learning'],
  projects: ['deep_focus', 'planning', 'social_media'],
  finance: ['net_worth', 'income', 'expenses'],
  relationships: ['meaningful_contacts', 'social_time', 'important_moments'],
  time: ['deep_focus', 'training', 'reading', 'writing', 'meditation', 'planning', 'learning'],
  organization: ['planning', 'social_media']
};

export function loadDailyRecords() {
  try {
    const records = JSON.parse(window.localStorage.getItem(RECORDS_KEY) || '[]');
    return Array.isArray(records)
      ? records.filter((record) => record?.date && record?.values).sort((a, b) => b.date.localeCompare(a.date))
      : [];
  } catch {
    return [];
  }
}

function numericValue(record, field) {
  const value = Number(record?.values?.[field]);
  return Number.isFinite(value) ? value : null;
}

function hasFieldValue(record, field) {
  const value = record?.values?.[field];
  if (value && typeof value === 'object') return Boolean(value.bedTime || value.wakeTime);
  return value !== '' && value !== null && value !== undefined;
}

function average(records, field, limit = 7) {
  const values = records.slice(0, limit).map((record) => numericValue(record, field)).filter((value) => value !== null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreField(value, field) {
  if (value === null || !FIELD_RULES[field]) return null;
  const rule = FIELD_RULES[field];
  if (rule.direction === 'less') return Math.max(0, Math.min(100, 100 - ((value - rule.ideal) / (rule.fail - rule.ideal)) * 100));
  if (rule.direction === 'range') {
    if (value >= rule.min && value <= rule.max) return 100;
    return Math.max(0, 100 - Math.min(Math.abs(value - rule.min), Math.abs(value - rule.max)) * 24);
  }
  return Math.max(0, Math.min(100, (value / rule.ideal) * 100));
}

function scoreRecord(record, fields) {
  const scores = fields.map((field) => scoreField(numericValue(record, field), field)).filter((score) => score !== null);
  return scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
}

function format(value, unit, digits = 0) {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(digits)}${unit ? ` ${unit}` : ''}`;
}

function metric(label, value, detail) {
  return { label, value, detail };
}

function intentionalMinutes(record) {
  const values = record?.values || {};
  return (Number(values.deep_focus) || 0) * 60
    + ['training', 'reading', 'writing', 'meditation', 'walk_sun', 'planning', 'learning']
      .reduce((total, field) => total + (Number(values[field]) || 0), 0);
}

function correlation(records, firstField, secondField) {
  const pairs = records.map((record) => [numericValue(record, firstField), numericValue(record, secondField)])
    .filter(([first, second]) => first !== null && second !== null);
  if (pairs.length < 4) return null;
  const firstAverage = pairs.reduce((sum, pair) => sum + pair[0], 0) / pairs.length;
  const secondAverage = pairs.reduce((sum, pair) => sum + pair[1], 0) / pairs.length;
  let numerator = 0;
  let firstVariance = 0;
  let secondVariance = 0;
  pairs.forEach(([first, second]) => {
    const firstDelta = first - firstAverage;
    const secondDelta = second - secondAverage;
    numerator += firstDelta * secondDelta;
    firstVariance += firstDelta * firstDelta;
    secondVariance += secondDelta * secondDelta;
  });
  const denominator = Math.sqrt(firstVariance * secondVariance);
  return denominator ? numerator / denominator : null;
}

function contextualInsight(records, id) {
  const relationships = {
    core: ['sleep', 'deep_focus', 'Tu descanso y tu enfoque profundo'],
    individual: ['sleep', 'deep_focus', 'Tu descanso y tu enfoque profundo'],
    knowledge: ['training', 'reading', 'Tu entrenamiento y tu lectura'],
    projects: ['social_media', 'deep_focus', 'El uso de redes y tu enfoque profundo'],
    time: ['planning', 'deep_focus', 'Tu planificación y tu enfoque profundo'],
    organization: ['planning', 'social_media', 'Tu planificación y el tiempo en redes']
  };
  if (!relationships[id]) return { value: 'Señal pendiente', text: 'Este ecosistema necesita campos propios dentro del Cumplimiento Diario para descubrir patrones reales.' };
  const [first, second, label] = relationships[id];
  const value = correlation(records, first, second);
  if (value === null) return { value: 'Aprendiendo', text: 'Completa al menos cuatro registros diarios para que el sistema pueda relacionar estas señales.' };
  const strength = Math.abs(value) >= 0.65 ? 'fuerte' : Math.abs(value) >= 0.35 ? 'moderada' : 'suave';
  const direction = value >= 0 ? 'se mueven en la misma dirección' : 'se mueven en direcciones opuestas';
  return { value: `${value >= 0 ? '+' : ''}${value.toFixed(2)}`, text: `${label} muestran una relación ${strength}: ${direction}.` };
}

function futureMetrics(records, fields) {
  return fields.map(([field, label, unit]) => metric(label, format(average(records, field), unit), 'Pendiente de señal diaria'));
}

export function deriveEcosystemModel(records, id) {
  const recent = records.slice(0, 14);
  const fields = SYSTEM_FIELDS[id] || [];
  const hasSignal = records.some((record) => fields.some((field) => hasFieldValue(record, field)));
  const series = recent.slice().reverse().map((record) => ({ date: record.date, value: scoreRecord(record, fields) }));
  const validScores = series.map((point) => point.value).filter((value) => value !== null);
  const score = validScores.length ? Math.round(validScores.reduce((sum, value) => sum + value, 0) / validScores.length) : null;
  const coverage = records.length
    ? Math.round(records.slice(0, 7).reduce((total, record) => total + KNOWN_FIELDS.filter((field) => {
      const value = record.values?.[field];
      return value !== '' && value !== null && value !== undefined && (typeof value !== 'object' || value.bedTime || value.wakeTime);
    }).length / KNOWN_FIELDS.length, 0) / Math.min(records.length, 7) * 100)
    : 0;
  let metrics;

  if (id === 'individual') {
    metrics = [
      metric('Sueño', format(average(records, 'sleep'), 'h', 1), 'Promedio de 7 días'),
      metric('Entrenamiento', format(average(records, 'training'), 'min'), 'Promedio diario'),
      metric('Enfoque profundo', format(average(records, 'deep_focus'), 'h', 1), 'Promedio diario')
    ];
  } else if (id === 'knowledge') {
    metrics = [
      metric('Lectura', format(average(records, 'reading'), 'min'), 'Promedio diario'),
      metric('Escritura', format(average(records, 'writing'), 'min'), 'Promedio diario'),
      metric('Aprendizaje', format(average(records, 'learning'), 'min'), 'Promedio diario')
    ];
  } else if (id === 'projects') {
    metrics = [
      metric('Enfoque profundo', format(average(records, 'deep_focus'), 'h', 1), 'Capacidad de ejecución'),
      metric('Planificación', format(average(records, 'planning'), 'min'), 'Dirección diaria'),
      metric('Redes sociales', format(average(records, 'social_media'), 'min'), 'Fricción potencial')
    ];
  } else if (id === 'finance') {
    metrics = futureMetrics(records, [['net_worth', 'Patrimonio', ''], ['income', 'Ingresos', ''], ['expenses', 'Gastos', '']]);
  } else if (id === 'relationships') {
    metrics = futureMetrics(records, [['meaningful_contacts', 'Contactos significativos', ''], ['social_time', 'Tiempo compartido', 'min'], ['important_moments', 'Momentos', '']]);
  } else if (id === 'time') {
    const minutes = records.slice(0, 7).map(intentionalMinutes).filter((value) => value > 0);
    const dailyMinutes = minutes.length ? minutes.reduce((sum, value) => sum + value, 0) / minutes.length : null;
    metrics = [
      metric('Tiempo intencional', dailyMinutes === null ? '—' : `${Math.floor(dailyMinutes / 60)} h ${Math.round(dailyMinutes % 60)} min`, 'Promedio diario'),
      metric('Enfoque profundo', format(average(records, 'deep_focus'), 'h', 1), 'Promedio diario'),
      metric('Planificación', format(average(records, 'planning'), 'min'), 'Promedio diario')
    ];
  } else if (id === 'organization') {
    metrics = [
      metric('Cobertura diaria', records.length ? `${coverage} %` : '—', 'Señales registradas'),
      metric('Planificación', format(average(records, 'planning'), 'min'), 'Tiempo de claridad'),
      metric('Días observados', records.length ? String(records.length) : '—', 'Memoria disponible')
    ];
  } else {
    metrics = [
      metric('Integridad', records.length ? `${coverage} %` : '—', 'Cobertura de 7 días'),
      metric('Registros', records.length ? String(records.length) : '—', 'Días en memoria'),
      metric('Última señal', records[0]?.date || '—', 'Cumplimiento Diario')
    ];
  }

  return {
    score,
    coverage,
    days: records.length,
    hasData: records.length > 0,
    hasSignal,
    series,
    metrics,
    insight: contextualInsight(records, id)
  };
}
