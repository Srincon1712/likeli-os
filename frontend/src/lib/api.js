const API_URL = 'http://127.0.0.1:4040/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  health: () => request('/health'),
  analytics: (stageId) => request(`/analytics${stageId ? `?stage_id=${stageId}` : ''}`),
  stages: () => request('/stages'),
  createStage: (payload) => request('/stages', { method: 'POST', body: JSON.stringify(payload) }),
  objectives: () => request('/objectives'),
  createObjective: (payload) => request('/objectives', { method: 'POST', body: JSON.stringify(payload) }),
  updateObjective: (id, payload) => request(`/objectives/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteObjective: (id) => request(`/objectives/${id}`, { method: 'DELETE' }),
  leads: (stageId) => request(`/leads${stageId ? `?stage_id=${stageId}` : ''}`),
  importLeads: (file, stageId) => {
    const form = new FormData();
    form.append('file', file);
    if (stageId) form.append('stage_id', stageId);
    return request('/leads/import', { method: 'POST', body: form });
  },
  updateLead: (id, payload) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  createLead: (payload) => request('/leads', { method: 'POST', body: JSON.stringify(payload) }),
  leadNotes: (id) => request(`/leads/${id}/notes`),
  createLeadNote: (id, payload) => request(`/leads/${id}/notes`, { method: 'POST', body: JSON.stringify(payload) }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  deleteAllLeads: (stageId) => request(`/leads${stageId ? `?stage_id=${stageId}` : ''}`, { method: 'DELETE' }),
  logCall: (id, payload) => request(`/leads/${id}/call`, { method: 'POST', body: JSON.stringify(payload) }),
  callHistory: (leadId) => request(`/calls/history/${leadId}`),
  scripts: () => request('/scripts'),
  createScript: (payload) => request('/scripts', { method: 'POST', body: JSON.stringify(payload) }),
  updateScript: (id, payload) => request(`/scripts/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteScript: (id) => request(`/scripts/${id}`, { method: 'DELETE' }),
  deals: () => request('/deals'),
  createDeal: (payload) => request('/deals', { method: 'POST', body: JSON.stringify(payload) }),
  updateDeal: (id, payload) => request(`/deals/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: 'DELETE' }),
  finance: () => request('/finance'),
  createFinance: (payload) => request('/finance', { method: 'POST', body: JSON.stringify(payload) }),
  updateFinance: (id, payload) => request(`/finance/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteFinance: (id) => request(`/finance/${id}`, { method: 'DELETE' }),
  productivity: () => request('/productivity'),
  createProductivity: (payload) => request('/productivity', { method: 'POST', body: JSON.stringify(payload) }),
  updateProductivity: (id, payload) => request(`/productivity/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteProductivity: (id) => request(`/productivity/${id}`, { method: 'DELETE' }),
  knowledge: () => request('/knowledge'),
  createKnowledge: (payload) => request('/knowledge', { method: 'POST', body: JSON.stringify(payload) }),
  updateKnowledge: (id, payload) => request(`/knowledge/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteKnowledge: (id) => request(`/knowledge/${id}`, { method: 'DELETE' }),
  personal: () => request('/personal'),
  createPersonal: (payload) => request('/personal', { method: 'POST', body: JSON.stringify(payload) }),
  updatePersonal: (id, payload) => request(`/personal/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deletePersonal: (id) => request(`/personal/${id}`, { method: 'DELETE' })
};
