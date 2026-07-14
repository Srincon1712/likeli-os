import {
  Archive, BarChart3, BookOpen, Bot, Boxes, CalendarDays, CheckSquare,
  CircleDollarSign, Clock3, Code2, Database, FileText, Files, Folder,
  GalleryHorizontal, Image, Layers3, Link2, Map, Network, NotebookPen,
  PhoneCall, Presentation, Search, Target, TerminalSquare, UsersRound
} from 'lucide-react';

export const ACTIVE_MODULES = [
  { id: 'document', title: 'Documento', category: 'Crear', icon: FileText, views: ['Edición', 'Lectura'], description: 'Escritura enriquecida, referencias y exportación.' },
  { id: 'files', title: 'Archivos', category: 'Organizar', icon: Files, views: ['Lista', 'Cuadrícula', 'Recientes'], description: 'Almacenamiento local, vistas y clasificación.' },
  { id: 'folders', title: 'Carpetas', category: 'Organizar', icon: Folder, views: ['Árbol'], description: 'Jerarquías anidadas para recursos del proyecto.' },
  { id: 'database', title: 'Base de datos', category: 'Estructurar', icon: Database, views: ['Tabla', 'Tarjetas'], description: 'Registros, propiedades, filtros y exportación.' },
  { id: 'checklist', title: 'Lista de control', category: 'Ejecutar', icon: CheckSquare, views: ['Lista', 'Estado'], description: 'Tareas, prioridades, fechas y subtareas.' },
  { id: 'goals', title: 'Objetivos', category: 'Ejecutar', icon: Target, views: ['Órbita', 'Evolución'], description: 'Objetivos, resultados clave y progreso.' },
  { id: 'notes', title: 'Notas', category: 'Crear', icon: NotebookPen, views: ['Tarjetas', 'Flujo'], description: 'Captura inmediata que puede transformarse.' },
  { id: 'ai-tools', title: 'Inteligencia contextual', category: 'Comprender', icon: Bot, views: ['Hallazgos', 'Acciones'], description: 'Síntesis y recomendaciones desde el proyecto.' },
  { id: 'subprojects', title: 'Subproyectos', category: 'Estructurar', icon: Boxes, views: ['Constelación', 'Lista'], description: 'Jerarquía de universos relacionados.' },
  { id: 'sales', title: 'Ventas', category: 'Operar', icon: BarChart3, views: ['Registros', 'Llamadas', 'Analítica'], description: 'Base comercial, cola de llamadas y rendimiento.' }
];

export const FUTURE_MODULES = [
  { id: 'wiki', title: 'Enciclopedia', icon: BookOpen },
  { id: 'research', title: 'Investigación', icon: Search },
  { id: 'mind-map', title: 'Mapa mental', icon: Network },
  { id: 'journal', title: 'Bitácora', icon: NotebookPen },
  { id: 'calendar', title: 'Calendario', icon: CalendarDays },
  { id: 'timeline', title: 'Línea del tiempo', icon: Clock3 },
  { id: 'stages', title: 'Flujo por etapas', icon: Layers3 },
  { id: 'gallery', title: 'Galería', icon: GalleryHorizontal },
  { id: 'links', title: 'Enlaces', icon: Link2 },
  { id: 'resources', title: 'Recursos', icon: Archive },
  { id: 'bibliography', title: 'Bibliografía', icon: BookOpen },
  { id: 'people', title: 'Personas', icon: UsersRound },
  { id: 'meetings', title: 'Reuniones', icon: Presentation },
  { id: 'finances', title: 'Finanzas', icon: CircleDollarSign },
  { id: 'code', title: 'Código', icon: Code2 },
  { id: 'terminal', title: 'Terminal', icon: TerminalSquare },
  { id: 'map', title: 'Mapa', icon: Map },
  { id: 'media', title: 'Medios', icon: Image }
];

export const MODULE_CATALOG = [...ACTIVE_MODULES, ...FUTURE_MODULES.map((item) => ({
  ...item,
  category: 'Próximamente',
  views: [],
  description: 'Módulo previsto para una próxima versión.',
  locked: true
}))];

export const MODULE_CATEGORIES = ['Crear', 'Organizar', 'Estructurar', 'Ejecutar', 'Comprender', 'Operar', 'Próximamente'];
export const PROJECT_TEMPLATES = [{ id: 'empty', title: 'Espacio vacío', description: 'Sin módulos ni estructura impuesta.', icon: Layers3, modules: [] }];

export function getModuleDefinition(type) {
  return MODULE_CATALOG.find((module) => module.id === type) || ACTIVE_MODULES[0];
}

export function getTemplate() {
  return PROJECT_TEMPLATES[0];
}
