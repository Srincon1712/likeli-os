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
  analytics: () => request('/analytics'),
  objectives: () => request('/objectives'),
  createObjective: (payload) => request('/objectives', { method: 'POST', body: JSON.stringify(payload) }),
  updateObjective: (id, payload) => request(`/objectives/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteObjective: (id) => request(`/objectives/${id}`, { method: 'DELETE' }),
  leads: () => request('/leads'),
  importLeads: (file) => {
    const form = new FormData();
    form.append('file', file);
    return request('/leads/import', { method: 'POST', body: form });
  },
  updateLead: (id, payload) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),
  deleteAllLeads: () => request('/leads', { method: 'DELETE' }),
  logCall: (id, payload) => request(`/leads/${id}/call`, { method: 'POST', body: JSON.stringify(payload) }),
  callHistory: (leadId) => request(`/calls/history/${leadId}`)
};
