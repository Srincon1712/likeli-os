export const RECORDS_KEY = 'life-os:daily-compliance:records';
export const RECORDS_EVENT = 'life-os:daily-compliance-updated';

function pad(value) {
  return String(value).padStart(2, '0');
}

export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function dateFromKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function shiftDateKey(key, offset) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + offset);
  return dateKey(date);
}

export function yesterdayKey(now = new Date()) {
  return dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

export function readRecords() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECORDS_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((record) => record?.date && record?.values).sort((a, b) => b.date.localeCompare(a.date))
      : [];
  } catch {
    return [];
  }
}

export function getPendingDates(records = readRecords(), now = new Date()) {
  const end = yesterdayKey(now);
  const recorded = new Set(records.map((record) => record.date));
  const oldest = records.length ? records.reduce((minimum, record) => record.date < minimum ? record.date : minimum, records[0].date) : end;
  const start = oldest > end ? end : oldest;
  const pending = [];
  for (let cursor = start; cursor <= end; cursor = shiftDateKey(cursor, 1)) {
    if (!recorded.has(cursor)) pending.push(cursor);
  }
  return pending.sort((a, b) => b.localeCompare(a));
}
