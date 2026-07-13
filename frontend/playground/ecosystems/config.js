export const ECOSYSTEMS = {
  core: {
    id: 'core',
    title: 'Núcleo diario',
    eyebrow: 'Fuente de verdad',
    description: 'El punto donde tu día se convierte en señal para todo el sistema.',
    visual: 'core',
    clusters: [
      { title: 'Cuerpo', items: ['Sueño', 'Entrenamiento', 'Agua', 'Aire libre'] },
      { title: 'Mente', items: ['Meditación', 'Lectura', 'Escritura', 'Aprendizaje'] },
      { title: 'Atención', items: ['Enfoque profundo', 'Planificación', 'Pantallas', 'Redes sociales'] }
    ]
  },
  individual: {
    id: 'individual',
    title: 'Individual',
    eyebrow: 'Representación personal',
    description: 'Una lectura viva de tu cuerpo, tu mente, tu energía y tus hábitos.',
    visual: 'individual',
    clusters: [
      { title: 'Vitalidad', items: ['Energía', 'Sueño', 'Nutrición', 'Agua', 'Peso', 'Mediciones'] },
      { title: 'Movimiento', items: ['Entrenamiento', 'Rutinas', 'Aire libre'] },
      { title: 'Mente', items: ['Meditación', 'Estado emocional', 'Hábitos'] },
      { title: 'Expansión', items: ['Lectura', 'Escritura', 'Aprendizaje', 'Enfoque profundo'] },
      { title: 'Entorno digital', items: ['Redes sociales', 'Pantallas'] }
    ]
  },
  knowledge: {
    id: 'knowledge',
    title: 'Conocimiento',
    eyebrow: 'Cerebro extendido',
    description: 'Lo que consumes, conectas, comprendes y conviertes en criterio.',
    visual: 'knowledge',
    clusters: [
      { title: 'Estudio', items: ['Libros', 'Cursos', 'Universidad', 'Idiomas'] },
      { title: 'Exploración', items: ['Investigación', 'Artículos', 'Videos', 'Documentación'] },
      { title: 'Captura', items: ['Notas', 'Ideas', 'Conceptos', 'Tarjetas de memoria'] },
      { title: 'Síntesis', items: ['Mapa de aprendizaje', 'Conexiones', 'Conocimiento adquirido'] }
    ]
  },
  projects: {
    id: 'projects',
    title: 'Proyectos',
    eyebrow: 'Ecosistema creativo',
    description: 'La distancia entre una visión y su forma real, vista como movimiento.',
    visual: 'projects',
    clusters: [
      { title: 'Dirección', items: ['Visión', 'Objetivos', 'Estado', 'Riesgos'] },
      { title: 'Memoria', items: ['Documentos', 'Ideas', 'Decisiones', 'Aprendizajes'] },
      { title: 'Ejecución', items: ['Cronología', 'Tareas', 'Recursos'] },
      { title: 'Contexto', items: ['Personas', 'Finanzas'] }
    ]
  },
  finance: {
    id: 'finance',
    title: 'Finanzas',
    eyebrow: 'Centro financiero',
    description: 'Recursos, decisiones y futuro económico contemplados como un mismo flujo.',
    visual: 'finance',
    clusters: [
      { title: 'Posición', items: ['Patrimonio', 'Activos', 'Pasivos'] },
      { title: 'Movimiento', items: ['Ingresos', 'Gastos', 'Flujo de caja', 'Historial'] },
      { title: 'Crecimiento', items: ['Inversiones', 'Empresas', 'Distribución'] },
      { title: 'Dirección', items: ['Objetivos', 'Presupuestos', 'Proyecciones'] }
    ]
  },
  relationships: {
    id: 'relationships',
    title: 'Relaciones',
    eyebrow: 'Mapa humano',
    description: 'Las personas, los momentos y la atención que sostienen tu mundo humano.',
    visual: 'relationships',
    clusters: [
      { title: 'Círculos', items: ['Familia', 'Amigos', 'Socios', 'Profesores'] },
      { title: 'Red', items: ['Contactos', 'Clientes', 'Nuevas conexiones'] },
      { title: 'Ritmo', items: ['Frecuencia', 'Recordatorios', 'Interacciones'] },
      { title: 'Memoria', items: ['Momentos importantes', 'Cronología'] }
    ]
  },
  time: {
    id: 'time',
    title: 'Tiempo',
    eyebrow: 'Ritmo de vida',
    description: 'No un calendario: la forma visible que toma tu atención.',
    visual: 'time',
    clusters: [
      { title: 'Escalas', items: ['Día', 'Semana', 'Mes', 'Año'] },
      { title: 'Estructura', items: ['Eventos', 'Rutinas', 'Bloques', 'Planificación'] },
      { title: 'Dirección', items: ['Objetivos', 'Balance'] },
      { title: 'Observación', items: ['Uso del tiempo', 'Historial'] }
    ]
  },
  organization: {
    id: 'organization',
    title: 'Organización',
    eyebrow: 'Cerebro operativo',
    description: 'Un espacio de captura inmediata que convierte ruido en claridad.',
    visual: 'organization',
    clusters: [
      { title: 'Captura', items: ['Bandeja de entrada', 'Ideas', 'Notas rápidas', 'Capturas'] },
      { title: 'Claridad', items: ['Pendientes', 'Decisiones', 'Prioridades'] },
      { title: 'Memoria', items: ['Archivos', 'Referencias'] }
    ]
  }
};

export function getEcosystem(id) {
  return ECOSYSTEMS[id] || ECOSYSTEMS.core;
}
