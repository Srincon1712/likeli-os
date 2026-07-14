import React, { lazy, memo, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Heart,
  Layers3,
  Lightbulb,
  Timer,
  UserRound
} from 'lucide-react';
import './styles.css';
import { getPendingDates, readRecords, RECORDS_EVENT } from './ecosystems/individual/pending.js';
import { PROJECTS_EVENT, readProjectCount } from './ecosystems/projects/summary.js';

const EcosystemWorld = lazy(() => import('./ecosystems/EcosystemWorld.jsx'));

const LIFE_AREAS = [
  { id: 'individual', title: 'Individual', description: 'Energía, cuerpo y equilibrio interior.', icon: UserRound, x: 13, y: 35, status: 'En equilibrio', progress: 78, notifications: 2 },
  { id: 'knowledge', title: 'Conocimiento', description: 'Ideas que se convierten en comprensión.', icon: Lightbulb, x: 29, y: 13, status: '3 ideas nuevas', progress: 64, notifications: 3 },
  { id: 'projects', title: 'Proyectos', description: 'Intención que se convierte en impulso.', icon: Layers3, x: 72, y: 13, status: 'En marcha', progress: 52, notifications: 1 },
  { id: 'finance', title: 'Finanzas', description: 'Una visión clara de tus recursos.', icon: CircleDollarSign, x: 87, y: 36, status: 'En orden', progress: 84, notifications: 0 },
  { id: 'relationships', title: 'Relaciones', description: 'Las personas que enriquecen tu vida.', icon: Heart, x: 79, y: 75, status: '2 momentos', progress: 71, notifications: 2 },
  { id: 'time', title: 'Tiempo', description: 'Atención colocada con intención.', icon: Timer, x: 52, y: 88, status: '6 h 42 min', progress: 69, notifications: 0 },
  { id: 'organization', title: 'Organización', description: 'Menos ruido. Más claridad.', icon: CalendarDays, x: 19, y: 75, status: 'En calma', progress: 91, notifications: 0 }
];

function getGreeting(hour) {
  if (hour < 12) return 'Buenos días.';
  if (hour < 18) return 'Buenas tardes.';
  return 'Buenas noches.';
}

function getMoment(date) {
  return {
    greeting: getGreeting(date.getHours()),
    time: new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(date),
    date: new Intl.DateTimeFormat('es-CO', { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
  };
}

const NeuralBackground = memo(function NeuralBackground({ pointerRef, paused }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { alpha: true });
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nodes = Array.from({ length: 42 }, (_, index) => ({
      x: ((index * 47) % 1000) / 1000,
      y: ((index * 83 + 17) % 1000) / 1000,
      radius: 0.45 + ((index * 13) % 7) / 10,
      phase: index * 0.73
    }));
    const edges = nodes.flatMap((_, index) => [
      [index, (index + 1) % nodes.length],
      [index, (index + 2) % nodes.length]
    ]);
    const particles = Array.from({ length: 9 }, (_, index) => ({
      edge: (index * 11) % edges.length,
      phase: index / 9,
      speed: 0.000018 + (index % 3) * 0.000003
    }));
    const pointX = new Float32Array(nodes.length);
    const pointY = new Float32Array(nodes.length);
    let frame = 0;
    let lastPaint = 0;
    let width = 0;
    let height = 0;
    let visible = !document.hidden;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function paint(time = 0) {
      context.clearRect(0, 0, width, height);
      const pointer = pointerRef.current;
      const breath = 0.86 + Math.sin(time * 0.00022) * 0.14;

      nodes.forEach((node, index) => {
        pointX[index] = node.x * width + Math.sin(time * 0.00008 + node.phase) * 3;
        pointY[index] = node.y * height + Math.cos(time * 0.00007 + node.phase) * 2.5;
      });

      context.lineWidth = 0.4;
      edges.forEach(([from, to], edgeIndex) => {
        const fromX = pointX[from];
        const fromY = pointY[from];
        const toX = pointX[to];
        const toY = pointY[to];
        const distance = Math.hypot(toX - fromX, toY - fromY);
        if (distance > 210) return;
        const cursorDistance = Math.hypot((fromX + toX) / 2 - pointer.x, (fromY + toY) / 2 - pointer.y);
        const cursorLight = Math.max(0, 1 - cursorDistance / 230) * 0.055;
        context.strokeStyle = `rgba(107, 179, 204, ${(Math.max(0.018, 0.058 - distance / 5200) + cursorLight) * breath})`;
        context.beginPath();
        context.moveTo(fromX, fromY);
        context.quadraticCurveTo((fromX + toX) / 2, (fromY + toY) / 2 + Math.sin(edgeIndex) * 4, toX, toY);
        context.stroke();
      });

      nodes.forEach((node, index) => {
        const cursorDistance = Math.hypot(pointX[index] - pointer.x, pointY[index] - pointer.y);
        const response = Math.max(0, 1 - cursorDistance / 180);
        context.fillStyle = `rgba(164, 218, 234, ${(0.065 + response * 0.1) * breath})`;
        context.beginPath();
        context.arc(pointX[index], pointY[index], node.radius + response * 0.5, 0, Math.PI * 2);
        context.fill();
      });

      particles.forEach((particle) => {
        const [from, to] = edges[particle.edge];
        const fromX = pointX[from];
        const fromY = pointY[from];
        const toX = pointX[to];
        const toY = pointY[to];
        if (Math.hypot(toX - fromX, toY - fromY) > 210) return;
        const progress = (particle.phase + time * particle.speed) % 1;
        const inverse = 1 - progress;
        const controlX = (fromX + toX) / 2;
        const controlY = (fromY + toY) / 2 + Math.sin(particle.edge) * 4;
        const x = inverse * inverse * fromX + 2 * inverse * progress * controlX + progress * progress * toX;
        const y = inverse * inverse * fromY + 2 * inverse * progress * controlY + progress * progress * toY;
        context.fillStyle = `rgba(190, 229, 239, ${Math.sin(progress * Math.PI) * 0.38})`;
        context.beginPath();
        context.arc(x, y, 1.05, 0, Math.PI * 2);
        context.fill();
      });
    }

    function draw(time) {
      if (!visible) return;
      if (time - lastPaint > 16) {
        paint(time);
        lastPaint = time;
      }
      frame = requestAnimationFrame(draw);
    }

    function handleVisibility() {
      visible = !document.hidden;
      cancelAnimationFrame(frame);
      if (visible && !reducedMotion && !paused) frame = requestAnimationFrame(draw);
    }

    resize();
    paint();
    if (!reducedMotion && !paused) frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [paused, pointerRef]);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
});

function normalizeVector(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

function getRoundedRectAnchor(center, width, height, radius, target) {
  const direction = normalizeVector(target.x - center.x, target.y - center.y);
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const horizontalDistance = Math.abs(direction.x) > 0.0001 ? halfWidth / Math.abs(direction.x) : Infinity;
  const verticalDistance = Math.abs(direction.y) > 0.0001 ? halfHeight / Math.abs(direction.y) : Infinity;
  let distance = Math.min(horizontalDistance, verticalDistance);
  let localX = direction.x * distance;
  let localY = direction.y * distance;
  let normal;

  if (Math.abs(localX) > halfWidth - radius && Math.abs(localY) > halfHeight - radius) {
    const corner = {
      x: Math.sign(localX) * (halfWidth - radius),
      y: Math.sign(localY) * (halfHeight - radius)
    };
    const projection = direction.x * corner.x + direction.y * corner.y;
    const discriminant = Math.max(0, projection * projection - (corner.x * corner.x + corner.y * corner.y - radius * radius));
    distance = projection + Math.sqrt(discriminant);
    localX = direction.x * distance;
    localY = direction.y * distance;
    normal = normalizeVector(localX - corner.x, localY - corner.y);
  } else if (horizontalDistance < verticalDistance) {
    normal = { x: Math.sign(localX), y: 0 };
  } else {
    normal = { x: 0, y: Math.sign(localY) };
  }

  return {
    point: { x: center.x + localX, y: center.y + localY },
    outward: normal
  };
}

const CONNECTION_BENDS = {
  individual: -0.018,
  knowledge: 0.026,
  projects: -0.022,
  finance: 0.016,
  relationships: -0.022,
  time: 0.018,
  organization: 0.024
};

function createConnectionPath(coreCenter, coreRadius, cardCenter, cardRect, areaId) {
  const direction = normalizeVector(cardCenter.x - coreCenter.x, cardCenter.y - coreCenter.y);
  const start = {
    x: coreCenter.x + direction.x * (coreRadius + 1),
    y: coreCenter.y + direction.y * (coreRadius + 1)
  };
  const anchor = getRoundedRectAnchor(cardCenter, cardRect.width, cardRect.height, 20, coreCenter);
  const end = anchor.point;
  const distance = Math.hypot(end.x - start.x, end.y - start.y);
  const normal = { x: -direction.y, y: direction.x };
  const bend = distance * (CONNECTION_BENDS[areaId] || 0);
  const midpoint = {
    x: (start.x + end.x) / 2 + normal.x * bend,
    y: (start.y + end.y) / 2 + normal.y * bend
  };
  const tangent = {
    x: direction.x * Math.min(52, distance * 0.18),
    y: direction.y * Math.min(52, distance * 0.18)
  };
  const startHandle = Math.min(74, distance * 0.28);
  const endHandle = Math.min(64, distance * 0.24);
  const firstControl = {
    x: start.x + direction.x * startHandle,
    y: start.y + direction.y * startHandle
  };
  const secondControl = { x: midpoint.x - tangent.x, y: midpoint.y - tangent.y };
  const thirdControl = { x: midpoint.x + tangent.x, y: midpoint.y + tangent.y };
  const fourthControl = {
    x: end.x + anchor.outward.x * endHandle,
    y: end.y + anchor.outward.y * endHandle
  };
  const number = (value) => value.toFixed(2);

  return {
    path: `M ${number(start.x)} ${number(start.y)} C ${number(firstControl.x)} ${number(firstControl.y)}, ${number(secondControl.x)} ${number(secondControl.y)}, ${number(midpoint.x)} ${number(midpoint.y)} C ${number(thirdControl.x)} ${number(thirdControl.y)}, ${number(fourthControl.x)} ${number(fourthControl.y)}, ${number(end.x)} ${number(end.y)}`,
    end
  };
}

const NeuralConnections = memo(function NeuralConnections({ activeId, mapRef }) {
  const [geometry, setGeometry] = useState({ width: 0, height: 0, connections: [] });

  useLayoutEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    function measure() {
      const mapRect = map.getBoundingClientRect();
      const core = map.querySelector('[data-core]');
      if (!core || window.matchMedia('(max-width: 700px)').matches) {
        setGeometry({ width: mapRect.width, height: mapRect.height, connections: [] });
        return;
      }
      const coreRect = core.getBoundingClientRect();
      const coreCenter = {
        x: coreRect.left - mapRect.left + coreRect.width / 2,
        y: coreRect.top - mapRect.top + coreRect.height / 2
      };
      const connections = LIFE_AREAS.map((area) => {
        const card = map.querySelector(`[data-area-id="${area.id}"]`);
        if (!card) return null;
        const cardRect = card.getBoundingClientRect();
        const cardCenter = {
          x: cardRect.left - mapRect.left + cardRect.width / 2,
          y: cardRect.top - mapRect.top + cardRect.height / 2
        };
        return {
          id: area.id,
          ...createConnectionPath(coreCenter, coreRect.width / 2, cardCenter, cardRect, area.id)
        };
      }).filter(Boolean);
      setGeometry({ width: mapRect.width, height: mapRect.height, connections });
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(map);
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [mapRef]);

  if (!geometry.connections.length) return null;

  return (
    <svg className="connection-layer" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
      {geometry.connections.map((connection, index) => {
        const active = activeId === connection.id;
        return (
          <g key={connection.id} className={active ? 'connection-group is-active' : 'connection-group'}>
            <path className="fiber-halo" d={connection.path} pathLength="1" vectorEffect="non-scaling-stroke" />
            <path className="connection" d={connection.path} pathLength="1" vectorEffect="non-scaling-stroke" />
            <circle className="connection-anchor" cx={connection.end.x} cy={connection.end.y} r="2.2" vectorEffect="non-scaling-stroke" />
            <circle className="connection-particle" r="1.15">
              <animateMotion path={connection.path} dur="10s" begin={`${index * -1.35}s`} repeatCount="indefinite" />
            </circle>
            <circle className="connection-particle connection-particle-active" r="1.65">
              <animateMotion path={connection.path} dur="4.8s" begin={`${index * -0.55}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
});

const LifeNode = memo(function LifeNode({ area, index, active, notifications, onHover, onLeave, onSelect }) {
  const Icon = area.icon;
  return (
    <button
      className={`life-node ${active ? 'is-active' : ''}`}
      data-area-id={area.id}
      style={{
        left: `${area.x}%`,
        top: `${area.y}%`,
        '--progress': `${area.progress}%`,
        '--reveal-delay': `${610 + index * 90}ms`,
        '--card-delay': `${index * -1.15}s`,
        '--progress-delay': `${index * -0.8}s`
      }}
      onMouseEnter={() => onHover(area.id)}
      onMouseLeave={onLeave}
      onFocus={() => onHover(area.id)}
      onBlur={onLeave}
      onClick={() => onSelect(area)}
    >
      <span className="node-icon"><Icon size={18} strokeWidth={1.45} /></span>
      <span className="node-copy">
        <span className="node-title">{area.title}</span>
        <span className="node-status">{area.status}</span>
      </span>
      <span className="node-progress" />
      {notifications > 0 ? <span className="node-notification" aria-label={`${notifications} días pendientes`}>{notifications > 99 ? '99+' : notifications}</span> : null}
    </button>
  );
});

const CoreNode = memo(function CoreNode({ active, onSelect }) {
  return (
    <button
      className={`core-node ${active ? 'is-related' : ''}`}
      data-core
      onClick={() => onSelect({ id: 'core', title: 'Núcleo', description: 'Tu vida, contemplada como un todo conectado.', x: 50, y: 50 })}
    >
      <span className="core-wave core-wave-one" />
      <span className="core-wave core-wave-two" />
      <span className="core-particles" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <i key={index} style={{ '--particle-delay': `${index * -1.3}s` }} />)}
      </span>
      <span className="core-orbit" aria-hidden="true"><i /><i /><i /></span>
      <span className="core-inner-ring" />
      <span className="core-surface" />
      <span className="core-title">NÚCLEO</span>
      <span className="core-caption">Todo se conecta aquí</span>
      <span className="core-status" />
    </button>
  );
});

function App() {
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const mapRef = useRef(null);
  const ambientRef = useRef(null);
  const ecosystemRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [moment, setMoment] = useState(() => getMoment(new Date()));
  const [individualPending, setIndividualPending] = useState(() => getPendingDates(readRecords()).length);
  const [projectCount, setProjectCount] = useState(readProjectCount);
  const lifeAreas = useMemo(() => LIFE_AREAS.map((area) => area.id === 'individual' ? {
    ...area,
    status: individualPending ? `${individualPending} ${individualPending === 1 ? 'día pendiente' : 'días pendientes'}` : 'Todo al día',
    progress: individualPending ? 0 : 100
  } : area.id === 'projects' ? {
    ...area,
    status: projectCount ? `${projectCount} ${projectCount === 1 ? 'universo activo' : 'universos activos'}` : 'Sin proyectos',
    progress: projectCount ? 100 : 0
  } : area), [individualPending, projectCount]);
  const handleLeaveArea = useCallback(() => setActiveId(null), []);
  const handleSelectArea = useCallback((area) => setSelected(area), []);
  const handleCloseDetail = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const interval = window.setInterval(() => setMoment(getMoment(new Date())), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const refreshProjects = () => setProjectCount(readProjectCount());
    window.addEventListener(PROJECTS_EVENT, refreshProjects);
    window.addEventListener('storage', refreshProjects);
    return () => {
      window.removeEventListener(PROJECTS_EVENT, refreshProjects);
      window.removeEventListener('storage', refreshProjects);
    };
  }, []);

  useEffect(() => {
    const refreshPending = () => setIndividualPending(getPendingDates(readRecords()).length);
    const interval = window.setInterval(refreshPending, 60_000);
    window.addEventListener('storage', refreshPending);
    window.addEventListener(RECORDS_EVENT, refreshPending);
    window.addEventListener('focus', refreshPending);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', refreshPending);
      window.removeEventListener(RECORDS_EVENT, refreshPending);
      window.removeEventListener('focus', refreshPending);
    };
  }, []);

  useEffect(() => {
    if (!selected) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [selected]);

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
      target?.closest('.ecosystem')?.classList.add('is-visible');
      target?.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (selected) return undefined;
    let pendingFrame = 0;
    function handlePointer(event) {
      pointerRef.current.x = event.clientX;
      pointerRef.current.y = event.clientY;
      if (pendingFrame || !mapRef.current) return;
      pendingFrame = requestAnimationFrame(() => {
        const x = (pointerRef.current.x / window.innerWidth - 0.5) * -3;
        const y = (pointerRef.current.y / window.innerHeight - 0.5) * -2;
        mapRef.current?.style.setProperty('--camera-x', `${x}px`);
        mapRef.current?.style.setProperty('--camera-y', `${y}px`);
        mapRef.current?.style.setProperty('--reflection-x', `${-x * 2.6}px`);
        mapRef.current?.style.setProperty('--reflection-y', `${-y * 2.6}px`);
        ambientRef.current?.style.setProperty('--ambient-x', `${-x * 3}px`);
        ambientRef.current?.style.setProperty('--ambient-y', `${-y * 3}px`);
        pendingFrame = 0;
      });
    }
    window.addEventListener('pointermove', handlePointer, { passive: true });
    return () => {
      cancelAnimationFrame(pendingFrame);
      window.removeEventListener('pointermove', handlePointer);
    };
  }, [selected]);

  useEffect(() => {
    const section = ecosystemRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.16 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <main className={`playground-shell ${selected ? 'has-active-world' : ''}`}>
      <NeuralBackground pointerRef={pointerRef} paused={Boolean(selected)} />
      <div ref={ambientRef} className="ambient-light" aria-hidden="true" />

      <header className="topbar">
        <a href="/" className="back-link"><ArrowLeft size={15} /> Panel principal</a>
        <div className="topbar-moment">
          <span>{moment.date}</span>
          <time>{moment.time}</time>
          <span className="avatar">S</span>
        </div>
      </header>

      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <p>{moment.greeting}</p>
          <h1 id="welcome-title">Sebastian.</h1>
        </div>
        <div className="scroll-cue" aria-hidden="true"><span />Tu vida, en una sola mirada</div>
      </section>

      <section id="ecosistema" ref={ecosystemRef} className="ecosystem" aria-labelledby="titulo-ecosistema">
        <div className="section-heading">
          <p>Tu mundo</p>
          <h2 id="titulo-ecosistema">Todo lo que importa,<br />conectado.</h2>
        </div>

        <div ref={mapRef} className="life-map">
          <NeuralConnections activeId={activeId} mapRef={mapRef} />
          {lifeAreas.map((area, index) => (
            <LifeNode
              key={area.id}
              area={area}
              index={index}
              active={activeId === area.id}
              notifications={area.id === 'individual' ? individualPending : 0}
              onHover={setActiveId}
              onLeave={handleLeaveArea}
              onSelect={handleSelectArea}
            />
          ))}
          <CoreNode active={Boolean(activeId)} onSelect={handleSelectArea} />
        </div>

        <div className="quiet-summary">
          <article>
            <p>Hoy</p>
            <h3>El impulso está creciendo.</h3>
            <span>Tus proyectos avanzan con menos resistencia.</span>
          </article>
          <article>
            <p>Enfoque</p>
            <h3>6 h 42 min</h3>
            <span>Tiempo intencional de hoy</span>
          </article>
        </div>
      </section>

      {selected ? (
        <Suspense fallback={<div className="world-loading"><span />Entrando al sistema…</div>}>
          <EcosystemWorld system={selected} onClose={handleCloseDetail} />
        </Suspense>
      ) : null}
    </main>
  );
}

createRoot(document.getElementById('playground-root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
