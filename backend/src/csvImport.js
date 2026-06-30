const columnAliases = {
  business_name: ['nombre', 'negocio', 'business_name', 'business', 'empresa', 'name'],
  phone: ['numero de celular', 'telefono', 'celular', 'numero', 'phone', 'number'],
  city: ['ciudad', 'city'],
  niche: ['tipo de negocio', 'categoria', 'niche', 'tipo', 'category'],
  instagram: ['instagram', 'ig'],
  website: ['pagina web', 'sitio web', 'website', 'web'],
  link: ['link', 'maps', 'google maps'],
  notes: ['notes', 'notas', 'descripcion', 'description'],
  rating: ['calificacion', 'rating'],
  reviews: ['numero de calificaciones', 'numero de caliificaciones', 'reviews', 'resenas']
};

const normalizedAliasMap = Object.entries(columnAliases).reduce((map, [field, aliases]) => {
  for (const alias of aliases) {
    map.set(normalizeColumnName(alias), field);
  }
  return map;
}, new Map());

export function normalizeColumnName(columnName) {
  return String(columnName ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function cleanCell(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function normalizePhoneNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length < 7) return '';
  return digits;
}

export function analyzeCsvColumns(headers) {
  const detected = {};
  const ignored = [];

  for (const header of headers) {
    const normalized = normalizeColumnName(header);
    if (!normalized) continue;

    const field = normalizedAliasMap.get(normalized);
    if (field) {
      detected[header] = field;
    } else {
      ignored.push(header);
    }
  }

  return { detected, ignored };
}

export function sanitizeCsvRecord(record, detectedColumns) {
  const mapped = {
    business_name: '',
    phone: '',
    city: '',
    niche: '',
    instagram: '',
    website: '',
    link: '',
    notes: '',
    rating: '',
    reviews: ''
  };

  let hasAnyValue = false;

  for (const [header, value] of Object.entries(record)) {
    const field = detectedColumns[header];
    const cleanValue = cleanCell(value);

    if (!cleanValue) continue;
    hasAnyValue = true;

    if (field && !mapped[field]) {
      mapped[field] = cleanValue;
    }
  }

  if (!hasAnyValue) {
    return { valid: false, reason: 'empty_row' };
  }

  if (!normalizePhoneNumber(mapped.phone)) {
    return { valid: false, reason: 'missing_phone' };
  }

  const metadata = [
    ['Google Maps', mapped.link],
    ['Rating', mapped.rating],
    ['Reviews', mapped.reviews]
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`);

  const notes = [mapped.notes, ...metadata].filter(Boolean).join('\n');

  return {
    valid: true,
    lead: {
      business_name: mapped.business_name || 'Unnamed lead',
      phone: mapped.phone,
      city: mapped.city,
      niche: mapped.niche,
      instagram: mapped.instagram,
      website: mapped.website,
      notes
    }
  };
}

export function summarizeCsvImport({ filename, detectedColumns, ignoredColumns, imported, invalidRows, duplicateRows = 0, missingPhoneRows = 0 }) {
  const detectedEntries = Object.entries(detectedColumns).map(([source, target]) => `${source} -> ${target}`);
  console.log(`[Likeli CSV] File: ${filename}`);
  console.log(`[Likeli CSV] Imported leads: ${imported}`);
  console.log(`[Likeli CSV] Detected columns: ${detectedEntries.length ? detectedEntries.join(', ') : 'none'}`);
  console.log(`[Likeli CSV] Ignored columns: ${ignoredColumns.length ? ignoredColumns.join(', ') : 'none'}`);
  console.log(`[Likeli CSV] Invalid rows: ${invalidRows}`);
  console.log(`[Likeli CSV] Missing phone rows: ${missingPhoneRows}`);
  console.log(`[Likeli CSV] Duplicate phone rows: ${duplicateRows}`);
}
