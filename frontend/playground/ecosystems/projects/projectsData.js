import { getModuleDefinition } from './config.js';
import { PROJECTS_EVENT, PROJECTS_KEY } from './summary.js';

const HISTORY_LIMIT = 40;
const LEGACY_SALES_TYPES = new Set(['commercial-relations', 'commercial-flow', 'commercial-calls', 'metrics']);

export function createId(prefix = 'item') {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${id}`;
}

function now() {
  return new Date().toISOString();
}

function salesContent() {
  return {
    leads: [],
    calls: [],
    scripts: [],
    view: 'Registros',
    filters: { query: '', status: 'all' }
  };
}

function moduleContent(type) {
  if (type === 'document') return { html: '', comments: [], attachments: [], revision: 1 };
  if (type === 'files') return { files: [], trash: [], tags: [], sort: 'recent' };
  if (type === 'folders') return { folders: [] };
  if (type === 'database') return { columns: [{ id: createId('column'), title: 'Nombre', type: 'Texto' }], rows: [], filters: [], groupBy: '' };
  if (type === 'checklist') return { items: [] };
  if (type === 'goals') return { goals: [] };
  if (type === 'notes') return { notes: [] };
  if (type === 'ai-tools') return { findings: [], lastRun: null };
  if (type === 'subprojects') return { projectIds: [] };
  if (type === 'sales') return salesContent();
  return { text: '' };
}

function migrateLegacyModule(module) {
  if (!LEGACY_SALES_TYPES.has(module.type)) return module;
  const content = salesContent();
  if (module.type === 'commercial-relations') content.leads = module.content?.people || [];
  if (module.type === 'commercial-calls') content.calls = module.content?.calls || [];
  return { ...module, type: 'sales', title: 'Ventas', view: 'Registros', content };
}

function normalizeSalesContent(content) {
  const priorities = { high: 'alta', medium: 'media', low: 'baja' };
  const stages = { Lead: 'Prospecto', Demo: 'Demostración', Negociacion: 'Negociación' };
  return {
    ...content,
    leads: (content.leads || []).map((lead) => ({
      ...lead,
      priority: priorities[lead.priority] || lead.priority || 'media',
      pipeline_stage: stages[lead.pipeline_stage] || lead.pipeline_stage || 'Prospecto'
    }))
  };
}

function normalizeModule(raw, index) {
  const migrated = migrateLegacyModule(raw);
  const definition = getModuleDefinition(migrated.type);
  const base = createModule(definition.id, index);
  const content = { ...moduleContent(definition.id), ...(migrated.content || {}) };
  return {
    ...base,
    ...migrated,
    width: Math.max(240, Number(migrated.width) || base.width),
    height: Math.max(160, Number(migrated.height) || base.height),
    minimized: Boolean(migrated.minimized),
    maximized: false,
    groupId: migrated.groupId || null,
    zIndex: Number(migrated.zIndex) || index + 1,
    locked: Boolean(definition.locked),
    content: definition.id === 'sales' ? normalizeSalesContent(content) : content
  };
}

function normalizeProject(project) {
  const modules = (Array.isArray(project.modules) ? project.modules : []).map(normalizeModule);
  const deduped = modules.filter((module, index) => module.type !== 'sales' || modules.findIndex((candidate) => candidate.type === 'sales') === index);
  return {
    id: project.id || createId('project'),
    title: project.title || 'Proyecto sin nombre',
    description: project.description || '',
    createdAt: project.createdAt || now(),
    updatedAt: project.updatedAt || project.createdAt || now(),
    templateId: 'empty',
    modules: deduped,
    relations: Array.isArray(project.relations) ? project.relations : [],
    activity: Array.isArray(project.activity) ? project.activity : [],
    history: Array.isArray(project.history) ? project.history : []
  };
}

export function loadProjects() {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizeProject).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  window.dispatchEvent(new CustomEvent(PROJECTS_EVENT));
  return projects;
}

export function createModule(type, index = 0) {
  const definition = getModuleDefinition(type);
  const column = index % 3;
  const row = Math.floor(index / 3);
  return {
    id: createId('module'), type, title: definition.title,
    x: 44 + column * 340, y: 76 + row * 260, width: 310, height: 220,
    view: definition.views[0] || '', parentId: null, groupId: null,
    pinned: false, hidden: false, minimized: false, maximized: false,
    zIndex: index + 1, locked: Boolean(definition.locked),
    createdAt: now(), updatedAt: now(), content: moduleContent(type)
  };
}

export function createProject({ title, description = '' }) {
  const created = now();
  const project = normalizeProject({
    id: createId('project'), title: title.trim() || 'Proyecto sin nombre',
    description: description.trim(), createdAt: created, updatedAt: created,
    modules: [], relations: [], history: [],
    activity: [{ id: createId('activity'), at: created, label: 'Espacio creado desde cero' }]
  });
  return saveProjects([project, ...loadProjects()]);
}

function snapshot(project) {
  return { title: project.title, description: project.description, modules: structuredClone(project.modules), relations: structuredClone(project.relations) };
}

export function updateProject(projectId, reason, updater, options = {}) {
  const projects = loadProjects();
  const index = projects.findIndex((project) => project.id === projectId);
  if (index < 0) return projects;
  const current = projects[index];
  const changedAt = now();
  const draft = structuredClone(current);
  const changed = updater(draft) || draft;
  const history = options.history === false ? current.history : [{ id: createId('version'), at: changedAt, label: reason, actor: 'Tú', snapshot: snapshot(current) }, ...current.history].slice(0, HISTORY_LIMIT);
  const activity = options.activity === false ? current.activity : [{ id: createId('activity'), at: changedAt, label: reason }, ...current.activity].slice(0, 40);
  projects[index] = { ...changed, updatedAt: options.touch === false ? current.updatedAt : changedAt, history, activity };
  return saveProjects(projects.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
}

export function deleteProject(projectId) {
  return saveProjects(loadProjects().filter((project) => project.id !== projectId));
}

export function addModule(projectId, type) {
  const definition = getModuleDefinition(type);
  if (definition.locked) return loadProjects();
  return updateProject(projectId, `Módulo añadido: ${definition.title}`, (project) => {
    project.modules.push(createModule(type, project.modules.length));
    return project;
  });
}

export function updateModule(projectId, moduleId, reason, changes, options) {
  return updateProject(projectId, reason, (project) => {
    project.modules = project.modules.map((module) => module.id === moduleId
      ? { ...module, ...(typeof changes === 'function' ? changes(module) : changes), updatedAt: now() }
      : module);
    return project;
  }, options);
}

export function duplicateModule(projectId, moduleId) {
  return updateProject(projectId, 'Módulo duplicado', (project) => {
    const source = project.modules.find((module) => module.id === moduleId);
    if (source) project.modules.push({ ...structuredClone(source), id: createId('module'), title: `${source.title} — copia`, x: source.x + 32, y: source.y + 32, pinned: false, minimized: false, maximized: false, zIndex: project.modules.length + 1, createdAt: now() });
    return project;
  });
}

export function removeModule(projectId, moduleId) {
  return updateProject(projectId, 'Módulo eliminado', (project) => {
    project.modules = project.modules.filter((module) => module.id !== moduleId).map((module) => module.parentId === moduleId ? { ...module, parentId: null } : module);
    project.relations = project.relations.filter((relation) => relation.from !== moduleId && relation.to !== moduleId);
    return project;
  });
}

export function restoreVersion(projectId, versionId) {
  const project = loadProjects().find((item) => item.id === projectId);
  const version = project?.history.find((item) => item.id === versionId);
  if (!version) return loadProjects();
  return updateProject(projectId, `Versión restaurada: ${version.label}`, (draft) => ({ ...draft, ...structuredClone(version.snapshot) }));
}

export function searchProjects(projects, query) {
  const needle = query.trim().toLocaleLowerCase('es');
  if (!needle) return [];
  const results = [];
  projects.forEach((project) => {
    if (`${project.title} ${project.description}`.toLocaleLowerCase('es').includes(needle)) results.push({ id: project.id, projectId: project.id, kind: 'Proyecto', title: project.title, detail: project.description || 'Proyecto' });
    project.modules.forEach((module) => {
      const haystack = `${module.title} ${module.type} ${JSON.stringify(module.content)}`.toLocaleLowerCase('es');
      if (haystack.includes(needle)) results.push({ id: module.id, projectId: project.id, moduleId: module.id, kind: 'Módulo', title: module.title, detail: project.title });
    });
  });
  return results.slice(0, 40);
}

export function projectInsight(project) {
  if (!project.modules.length) return 'Este universo no impone ninguna estructura. Añade una sola pieza cuando la necesites.';
  const relations = project.relations.length;
  const isolated = project.modules.filter((module) => !project.relations.some((relation) => relation.from === module.id || relation.to === module.id)).length;
  if (isolated > 2) return `${isolated} módulos aún están aislados. Relacionarlos puede revelar contexto compartido sin duplicar información.`;
  return `${project.modules.length} piezas activas y ${relations} conexiones forman la arquitectura actual del proyecto.`;
}
