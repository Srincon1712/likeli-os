import React from 'react';
import { moduleSummary } from './moduleSummary.js';

const LazyModuleRenderer = React.lazy(() => import('./ProjectModules.jsx').then((module) => ({ default: module.ModuleRenderer })));

export function ModuleRenderer(props) {
  return <React.Suspense fallback={<div className="module-loading"><span />Preparando el espacio…</div>}><LazyModuleRenderer {...props} /></React.Suspense>;
}

export { moduleSummary };
