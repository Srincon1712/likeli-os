export const PROJECTS_KEY = 'life-os:projects:v2';
export const PROJECTS_EVENT = 'life-os:projects-updated';

export function readProjectCount() {
  if (typeof window === 'undefined') return 0;
  try {
    const projects = JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || '[]');
    return Array.isArray(projects) ? projects.length : 0;
  } catch {
    return 0;
  }
}
