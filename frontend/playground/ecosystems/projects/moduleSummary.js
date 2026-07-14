export function moduleSummary(module) {
  const content = module.content || {};
  if (module.type === 'document') {
    const holder = document.createElement('div'); holder.innerHTML = content.html || '';
    return `${(holder.textContent || '').split(/\s+/).filter(Boolean).length} palabras · versión ${content.revision || 1}`;
  }
  if (module.type === 'files') return `${content.files?.length || 0} archivos · ${content.trash?.length || 0} en papelera`;
  if (module.type === 'folders') return `${content.folders?.length || 0} carpetas conectadas`;
  if (module.type === 'database') return `${content.rows?.length || 0} registros · ${content.columns?.length || 0} propiedades`;
  if (module.type === 'checklist') return `${content.items?.filter((item) => item.done).length || 0} de ${content.items?.length || 0} completadas`;
  if (module.type === 'goals') return `${content.goals?.length || 0} objetivos activos`;
  if (module.type === 'notes') return `${content.notes?.length || 0} notas capturadas`;
  if (module.type === 'ai-tools') return `${content.findings?.length || 0} hallazgos guardados`;
  if (module.type === 'subprojects') return `${content.projectIds?.length || 0} universos conectados`;
  if (module.type === 'sales') return `${content.leads?.length || 0} prospectos · ${content.calls?.length || 0} llamadas`;
  return 'Próximamente';
}
