import {
  Apple,
  Brain,
  Dumbbell,
  Footprints,
  Gauge,
  MoonStar,
  ScanHeart
} from 'lucide-react';

export const INDIVIDUAL_DOMAINS = [
  {
    id: 'sleep',
    title: 'Sueño',
    shortTitle: 'Sueño',
    icon: MoonStar,
    weight: 20,
    fieldIds: ['sleep', 'sleep_schedule', 'screens_before_sleep'],
    description: 'Recuperación, regularidad y ritmo circadiano.',
    capabilities: ['Horas', 'Regularidad', 'Calidad', 'Despertares', 'Siestas', 'Ritmo circadiano', 'Mapa semanal', 'Mapa anual']
  },
  {
    id: 'training',
    title: 'Entrenamiento',
    shortTitle: 'Entrenamiento',
    icon: Dumbbell,
    weight: 15,
    fieldIds: ['training'],
    description: 'Carga, progresión y capacidad física.',
    capabilities: ['Tipo', 'Duración', 'Volumen', 'Intensidad', 'Esfuerzo percibido', 'Cardio', 'Movilidad', 'Marcas personales']
  },
  {
    id: 'nutrition',
    title: 'Nutrición',
    shortTitle: 'Nutrición',
    icon: Apple,
    weight: 15,
    fieldIds: ['water'],
    description: 'Combustible, hidratación y balance corporal.',
    capabilities: ['Calorías', 'Proteínas', 'Carbohidratos', 'Grasas', 'Fibra', 'Frutas', 'Verduras', 'Micronutrientes']
  },
  {
    id: 'movement',
    title: 'Movimiento',
    shortTitle: 'Movimiento',
    icon: Footprints,
    weight: 8,
    fieldIds: ['walk_sun'],
    description: 'La actividad que existe fuera del entrenamiento.',
    capabilities: ['Pasos', 'Tiempo sentado', 'Caminata', 'Aire libre', 'Exposición solar', 'Escaleras', 'Actividad diaria']
  },
  {
    id: 'mental',
    title: 'Estado mental',
    shortTitle: 'Mente',
    icon: Brain,
    weight: 10,
    fieldIds: ['meditation'],
    description: 'Energía emocional, calma y claridad interior.',
    capabilities: ['Estrés', 'Ansiedad', 'Motivación', 'Calma', 'Energía', 'Satisfacción', 'Confianza', 'Reflexiones']
  },
  {
    id: 'productivity',
    title: 'Productividad',
    shortTitle: 'Productividad',
    icon: Gauge,
    weight: 22,
    fieldIds: ['deep_focus', 'reading', 'writing', 'learning', 'planning', 'social_media'],
    description: 'Atención convertida en trabajo, criterio y aprendizaje.',
    capabilities: ['Enfoque profundo', 'Lectura', 'Escritura', 'Aprendizaje', 'Planeación', 'Pantallas', 'Redes sociales', 'Concentración']
  },
  {
    id: 'biometry',
    title: 'Biometría',
    shortTitle: 'Biometría',
    icon: ScanHeart,
    weight: 0,
    fieldIds: [],
    description: 'La capa fisiológica preparada para futuras integraciones.',
    capabilities: ['Peso', 'Grasa corporal', 'Masa muscular', 'Medidas', 'Frecuencia cardíaca', 'Variabilidad cardíaca', 'Capacidad aeróbica', 'Presión']
  }
];

export const SCORE_GROUPS = [
  { id: 'sleep', label: 'Sueño', weight: 20, fields: ['sleep', 'sleep_schedule', 'screens_before_sleep'] },
  { id: 'nutrition', label: 'Nutrición', weight: 15, fields: ['water'] },
  { id: 'training', label: 'Entrenamiento', weight: 15, fields: ['training'] },
  { id: 'focus', label: 'Enfoque profundo', weight: 10, fields: ['deep_focus'] },
  { id: 'learning', label: 'Aprendizaje', weight: 10, fields: ['reading', 'writing', 'learning'] },
  { id: 'mental', label: 'Estado mental', weight: 10, fields: ['meditation'] },
  { id: 'movement', label: 'Movimiento', weight: 8, fields: ['walk_sun'] },
  { id: 'organization', label: 'Organización', weight: 7, fields: ['planning'] },
  { id: 'other', label: 'Otros', weight: 5, fields: ['social_media'] }
];

export const DAILY_FIELDS = [
  { id: 'sleep', label: 'Horas de sueño', domain: 'Descanso', type: 'number', unit: 'h', step: 0.25, min: 0, ideal: 8, direction: 'more', hint: '7,5' },
  { id: 'sleep_schedule', label: 'Horario de sueño', domain: 'Descanso', type: 'time-pair', bedLabel: 'Dormir', wakeLabel: 'Despertar', idealBed: '22:30', idealWake: '05:30' },
  { id: 'screens_before_sleep', label: 'Pantallas antes de dormir', domain: 'Descanso', type: 'number', unit: 'min', step: 5, min: 0, ideal: 0, fail: 90, direction: 'less', hint: '0' },
  { id: 'training', label: 'Entrenamiento', domain: 'Cuerpo', type: 'number', unit: 'min', step: 5, min: 0, ideal: 90, direction: 'more', hint: '60' },
  { id: 'water', label: 'Agua', domain: 'Cuerpo', type: 'number', unit: 'vasos', step: 1, min: 0, ideal: 10, direction: 'more', hint: '10' },
  { id: 'walk_sun', label: 'Caminar y sol', domain: 'Cuerpo', type: 'number', unit: 'min', step: 5, min: 0, ideal: 15, direction: 'more', hint: '15' },
  { id: 'meditation', label: 'Meditación', domain: 'Mente', type: 'number', unit: 'min', step: 1, min: 0, ideal: 10, direction: 'more', hint: '10' },
  { id: 'reading', label: 'Lectura', domain: 'Expansión', type: 'number', unit: 'min', step: 5, min: 0, ideal: 30, direction: 'more', hint: '30' },
  { id: 'writing', label: 'Escritura', domain: 'Expansión', type: 'number', unit: 'min', step: 5, min: 0, ideal: 30, direction: 'more', hint: '30' },
  { id: 'learning', label: 'Aprendizaje', domain: 'Expansión', type: 'number', unit: 'min', step: 5, min: 0, ideal: 60, direction: 'more', hint: '60' },
  { id: 'deep_focus', label: 'Enfoque profundo', domain: 'Atención', type: 'number', unit: 'h', step: 0.25, min: 0, ideal: 6, direction: 'more', hint: '4' },
  { id: 'planning', label: 'Planeación', domain: 'Atención', type: 'number', unit: 'min', step: 5, min: 0, ideal: 60, direction: 'more', hint: '30' },
  { id: 'social_media', label: 'Redes sociales', domain: 'Atención', type: 'number', unit: 'min', step: 5, min: 0, ideal: 15, fail: 120, direction: 'less', hint: '15' }
];

export const DAILY_FLOW = [
  { id: 'rest', title: 'Descanso', question: '¿Cómo recuperaste?', fields: ['sleep', 'sleep_schedule', 'screens_before_sleep'] },
  { id: 'body', title: 'Cuerpo', question: '¿Cómo cuidaste tu energía física?', fields: ['training', 'water', 'walk_sun'] },
  { id: 'mind', title: 'Mente', question: '¿Cuánto espacio interior creaste?', fields: ['meditation'] },
  { id: 'growth', title: 'Expansión', question: '¿Qué hiciste crecer?', fields: ['reading', 'writing', 'learning'] },
  { id: 'attention', title: 'Atención', question: '¿Dónde colocaste tu atención?', fields: ['deep_focus', 'planning', 'social_media'] }
];

export const RANGE_OPTIONS = [
  { id: '7', label: '7 días', days: 7 },
  { id: '30', label: '30 días', days: 30 },
  { id: '90', label: '90 días', days: 90 },
  { id: '365', label: '1 año', days: 365 },
  { id: 'all', label: 'Toda la vida', days: Infinity }
];
