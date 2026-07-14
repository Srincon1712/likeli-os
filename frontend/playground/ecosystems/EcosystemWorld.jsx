import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  Brain,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Heart,
  Layers3,
  Lightbulb,
  Network,
  Sparkles,
  Timer,
  UserRound,
  Waves,
  X
} from 'lucide-react';
import { getEcosystem } from './config.js';
import { deriveEcosystemModel, loadDailyRecords } from './dailySource.js';
import './ecosystems.css';

const SYSTEM_ICONS = {
  core: Activity,
  individual: UserRound,
  knowledge: Lightbulb,
  projects: Layers3,
  finance: CircleDollarSign,
  relationships: Heart,
  time: Timer,
  organization: CalendarDays
};

const IndividualOS = React.lazy(() => import('./individual/IndividualOS.jsx'));
const ProjectsOS = React.lazy(() => import('./projects/ProjectsOS.jsx'));

function useDailyRecords() {
  const [records, setRecords] = useState(loadDailyRecords);
  useEffect(() => {
    const refresh = () => setRecords(loadDailyRecords());
    const handleVisibility = () => { if (!document.hidden) refresh(); };
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    window.addEventListener('life-os:daily-compliance-updated', refresh);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.removeEventListener('life-os:daily-compliance-updated', refresh);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);
  return records;
}

const SignalTrace = memo(function SignalTrace({ series }) {
  const points = series.filter((point) => point.value !== null);
  const polyline = points.map((point, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 42 - (point.value / 100) * 34;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="signal-trace" aria-label="Evolución de los últimos registros">
      <div className="trace-heading"><span>Evolución</span><small>{points.length ? `${points.length} señales` : 'Sin señal'}</small></div>
      <svg viewBox="0 0 100 48" preserveAspectRatio="none" aria-hidden="true">
        <path className="trace-grid" d="M0 12 H100 M0 25 H100 M0 38 H100" />
        {points.length > 1 ? <polyline className="trace-line" points={polyline} vectorEffect="non-scaling-stroke" /> : null}
        {points.map((point, index) => {
          const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
          const y = 42 - (point.value / 100) * 34;
          return <circle key={`${point.date}-${index}`} className="trace-point" cx={x} cy={y} r="0.85" />;
        })}
      </svg>
    </div>
  );
});

function CoreVisual({ model }) {
  const signals = ['Sueño', 'Movimiento', 'Lectura', 'Calma', 'Enfoque', 'Planificación'];
  return (
    <div className="world-visual core-visual">
      <div className="visual-orbit orbit-one" />
      <div className="visual-orbit orbit-two" />
      <div className="daily-heart"><Activity size={25} strokeWidth={1.25} /><strong>{model.score ?? '—'}</strong><span>señal diaria</span></div>
      {signals.map((signal) => <span key={signal} className="signal-satellite">{signal}</span>)}
    </div>
  );
}

function IndividualVisual({ model }) {
  const signals = [
    ['Sueño', model.metrics[0]?.value],
    ['Movimiento', model.metrics[1]?.value],
    ['Enfoque', model.metrics[2]?.value],
    ['Calma', 'Meditación'],
    ['Nutrición', 'Sin señal'],
    ['Energía', model.score === null ? '—' : `${model.score} %`]
  ];
  return (
    <div className="world-visual individual-visual">
      <div className="person-field"><UserRound size={34} strokeWidth={1.15} /><span>Estado integrado</span><strong>{model.score ?? '—'}</strong></div>
      <div className="body-ring body-ring-one" /><div className="body-ring body-ring-two" />
      {signals.map(([label, value]) => <div key={label} className="body-signal"><span>{label}</span><small>{value}</small></div>)}
    </div>
  );
}

function KnowledgeVisual({ model }) {
  const nodes = [
    { x: 50, y: 50, label: 'Comprensión', size: 7 },
    { x: 23, y: 25, label: 'Lectura', size: 4 },
    { x: 76, y: 22, label: 'Cursos', size: 3.5 },
    { x: 18, y: 72, label: 'Ideas', size: 3.2 },
    { x: 79, y: 72, label: 'Conceptos', size: 4.2 },
    { x: 50, y: 84, label: 'Escritura', size: 3.4 },
    { x: 49, y: 15, label: 'Investigación', size: 3 }
  ];
  return (
    <div className="world-visual knowledge-visual">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {nodes.slice(1).map((node) => <path key={node.label} className="knowledge-link" d={`M50 50 Q${(node.x + 50) / 2 + (node.y > 50 ? 3 : -3)} ${(node.y + 50) / 2} ${node.x} ${node.y}`} />)}
        {nodes.map((node, index) => <g key={node.label} className="knowledge-node" style={{ '--node-delay': `${index * -1.2}s` }}><circle cx={node.x} cy={node.y} r={node.size} /><text x={node.x} y={node.y + node.size + 5} textAnchor="middle">{node.label}</text></g>)}
      </svg>
      <div className="knowledge-readout"><Brain size={16} /><span>{model.score === null ? 'Construyendo memoria' : `${model.score} % de ritmo cognitivo`}</span></div>
    </div>
  );
}

function ProjectsVisual({ model }) {
  const stages = [
    { label: 'Visión', value: model.metrics[1]?.value || '—' },
    { label: 'Decisión', value: model.score === null ? '—' : `${model.score} %` },
    { label: 'Ejecución', value: model.metrics[0]?.value || '—' }
  ];
  return (
    <div className="world-visual projects-visual">
      <div className="project-axis" />
      {stages.map((stage) => (
        <div key={stage.label} className="project-stage">
          <span className="stage-orb" /><strong>{stage.label}</strong><small>{stage.value}</small>
        </div>
      ))}
      <div className="project-flow"><i /><i /><i /></div>
      <p>La atención se convierte en avance</p>
    </div>
  );
}

function FinanceVisual({ model }) {
  return (
    <div className="world-visual finance-visual">
      <div className="finance-ring ring-patrimony"><span>Patrimonio</span></div>
      <div className="finance-ring ring-flow"><span>Flujo</span></div>
      <div className="finance-ring ring-reserve"><span>Reserva</span></div>
      <div className="finance-center"><CircleDollarSign size={25} strokeWidth={1.2} /><strong>{model.hasSignal && model.metrics[0]?.value !== '—' ? model.metrics[0].value : 'Sin señal'}</strong></div>
      <div className="money-stream stream-one"><i /><i /></div><div className="money-stream stream-two"><i /><i /></div>
    </div>
  );
}

function RelationshipsVisual() {
  const people = [
    { label: 'Familia', x: 50, y: 13, size: 'large' },
    { label: 'Amigos', x: 81, y: 33, size: 'medium' },
    { label: 'Socios', x: 76, y: 76, size: 'small' },
    { label: 'Clientes', x: 25, y: 76, size: 'small' },
    { label: 'Mentores', x: 18, y: 33, size: 'medium' }
  ];
  return (
    <div className="world-visual relationships-visual">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {people.map((person) => <path key={person.label} className="human-link" d={`M50 50 Q${person.x > 50 ? 61 : 39} ${person.y > 50 ? 60 : 40} ${person.x} ${person.y}`} />)}
      </svg>
      <div className="human-center"><UserRound size={25} /><span>Tú</span></div>
      {people.map((person, index) => <div key={person.label} className={`human-node ${person.size}`} style={{ left: `${person.x}%`, top: `${person.y}%`, '--human-delay': `${index * -1.4}s` }}><Heart size={12} /><span>{person.label}</span></div>)}
    </div>
  );
}

function TimeVisual({ model }) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const rotation = (minutes / 1440) * 360;
  return (
    <div className="world-visual time-visual">
      <div className="time-dial"><div className="time-progress" style={{ '--day-progress': `${rotation}deg` }} /><div className="time-hand" style={{ transform: `rotate(${rotation}deg)` }} /><Clock3 size={24} /><strong>{model.metrics[0]?.value || '—'}</strong><span>tiempo intencional</span></div>
      <div className="time-segment segment-focus">Enfoque</div><div className="time-segment segment-care">Cuidado</div><div className="time-segment segment-growth">Crecimiento</div>
    </div>
  );
}

function OrganizationVisual({ model }) {
  return (
    <div className="world-visual organization-visual">
      <div className="capture-stream">{Array.from({ length: 7 }, (_, index) => <i key={index} style={{ '--capture-delay': `${index * -0.9}s` }} />)}</div>
      <div className="clarity-core"><Waves size={25} /><strong>{model.coverage || '—'}</strong><span>claridad</span></div>
      <div className="organization-path"><span>Capturar</span><i /><span>Aclarar</span><i /><span>Ordenar</span></div>
    </div>
  );
}

function WorldVisual({ type, model }) {
  if (type === 'individual') return <IndividualVisual model={model} />;
  if (type === 'knowledge') return <KnowledgeVisual model={model} />;
  if (type === 'projects') return <ProjectsVisual model={model} />;
  if (type === 'finance') return <FinanceVisual model={model} />;
  if (type === 'relationships') return <RelationshipsVisual model={model} />;
  if (type === 'time') return <TimeVisual model={model} />;
  if (type === 'organization') return <OrganizationVisual model={model} />;
  return <CoreVisual model={model} />;
}

const ClusterField = memo(function ClusterField({ clusters, onSelect }) {
  return (
    <section className="cluster-section" aria-labelledby="cluster-title">
      <div className="cluster-heading"><div><span>Capas del ecosistema</span><h2 id="cluster-title">Explora por relaciones, no por carpetas.</h2></div><Network size={19} strokeWidth={1.25} /></div>
      <div className="cluster-field">
        {clusters.map((cluster, index) => (
          <article key={cluster.title} className="cluster" style={{ '--cluster-delay': `${index * -1.7}s` }}>
            <span className="cluster-pulse" />
            <h3>{cluster.title}</h3>
            <div>{cluster.items.map((item) => <button key={item} type="button" onClick={() => onSelect({ cluster: cluster.title, title: item })}>{item}</button>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
});

function ModuleLens({ module, hasData, onClose }) {
  if (!module) return null;
  return (
    <aside className="module-lens" aria-live="polite">
      <div className="lens-orbit"><span /><i /></div>
      <div className="lens-copy">
        <span>{module.cluster}</span>
        <h2>{module.title}</h2>
        <p>{hasData ? 'Esta lente ya puede relacionarse con tu memoria diaria.' : 'Esta lente se activará desde una señal del Cumplimiento Diario, sin entradas duplicadas.'}</p>
      </div>
      <div className="lens-state"><i className={hasData ? 'is-live' : ''} />{hasData ? 'Señal disponible' : 'Esperando señal'}</div>
      <button type="button" className="lens-close" aria-label="Cerrar lente" onClick={onClose}><X size={15} /></button>
    </aside>
  );
}

export default function EcosystemWorld({ system, onClose }) {
  const config = getEcosystem(system.id);
  const Icon = SYSTEM_ICONS[config.id] || Activity;
  const records = useDailyRecords();
  const model = useMemo(() => deriveEcosystemModel(records, config.id), [records, config.id]);
  const [closing, setClosing] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef(0);
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    closeTimerRef.current = window.setTimeout(onClose, 480);
  }, [onClose]);
  const closeLens = useCallback(() => setActiveModule(null), []);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    if (config.id === 'individual' || config.id === 'projects') return undefined;
    const handleKey = (event) => { if (event.key === 'Escape') close(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [close, config.id]);

  if (config.id === 'individual') {
    return (
      <React.Suspense fallback={<div className="world-loading"><span />Construyendo tu estado…</div>}>
        <IndividualOS system={system} records={records} closing={closing} onClose={close} />
      </React.Suspense>
    );
  }

  if (config.id === 'projects') {
    return (
      <React.Suspense fallback={<div className="world-loading"><span />Construyendo tus universos…</div>}>
        <ProjectsOS system={system} closing={closing} onClose={close} />
      </React.Suspense>
    );
  }

  return (
    <section
      className={`ecosystem-world world-${config.visual} ${closing ? 'is-closing' : ''}`}
      style={{ '--world-origin-x': `${system.x ?? 50}%`, '--world-origin-y': `${system.y ?? 50}%` }}
      aria-labelledby="world-title"
    >
      <div className="world-ambient" aria-hidden="true" />
      <header className="world-header">
        <button type="button" className="world-back" onClick={close}><ArrowLeft size={16} /> Volver al mapa</button>
        <div className="world-location"><span>Núcleo</span><i /> <strong>{config.title}</strong></div>
        <div className="world-source"><span className={model.hasData ? 'source-live' : ''} />Cumplimiento Diario · {model.days || 0} registros</div>
      </header>

      <div className="world-scroll">
        <main className="world-content">
          <section className="world-intro">
            <div className="world-symbol"><Icon size={23} strokeWidth={1.25} /></div>
            <p>{config.eyebrow}</p>
            <h1 id="world-title">{config.title}</h1>
            <span>{config.description}</span>
          </section>

          <section className="world-observatory" aria-label={`Observatorio de ${config.title}`}>
            <WorldVisual type={config.visual} model={model} />
            <div className="world-readouts">
              <div className="readout-score"><span>Estado del sistema</span><strong>{model.score === null ? '—' : `${model.score} %`}</strong><small>{model.score !== null ? 'Derivado de tus últimos registros' : model.hasSignal ? 'Señales disponibles; índice en preparación' : 'Esperando una señal propia'}</small></div>
              <div className="metric-constellation">
                {model.metrics.map((item, index) => <article key={item.label} style={{ '--metric-delay': `${index * -1.4}s` }}><span>{item.label}</span><strong>{item.value}</strong><small>{item.detail}</small></article>)}
              </div>
              <SignalTrace series={model.series} />
            </div>
          </section>

          <section className="context-insight">
            <div className="insight-icon"><Sparkles size={17} strokeWidth={1.25} /></div>
            <div><span>Inteligencia contextual</span><h2>{model.insight.value}</h2><p>{model.insight.text}</p></div>
            <div className="insight-signal"><i /><i /><i /><i /><i /></div>
          </section>

          <ClusterField clusters={config.clusters} onSelect={setActiveModule} />
        </main>
      </div>
      <ModuleLens module={activeModule} hasData={model.hasSignal} onClose={closeLens} />
    </section>
  );
}
