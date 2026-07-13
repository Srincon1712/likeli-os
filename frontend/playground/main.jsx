import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CircleDollarSign,
  Heart,
  Layers3,
  Lightbulb,
  Timer,
  UserRound,
  X
} from 'lucide-react';
import './styles.css';

const LIFE_AREAS = [
  { id: 'individual', title: 'Individual', description: 'Energía, cuerpo y equilibrio interior.', icon: UserRound, x: 13, y: 35, status: 'En equilibrio', progress: 78, notifications: 2 },
  { id: 'knowledge', title: 'Conocimiento', description: 'Ideas que se convierten en comprensión.', icon: Lightbulb, x: 29, y: 13, status: '3 ideas nuevas', progress: 64, notifications: 3 },
  { id: 'projects', title: 'Proyectos', description: 'Intención que se convierte en impulso.', icon: Layers3, x: 72, y: 13, status: 'En marcha', progress: 52, notifications: 1 },
  { id: 'finance', title: 'Finanzas', description: 'Una visión clara de tus recursos.', icon: CircleDollarSign, x: 87, y: 36, status: 'En orden', progress: 84, notifications: 0 },
  { id: 'relationships', title: 'Relaciones', description: 'Las personas que enriquecen tu vida.', icon: Heart, x: 79, y: 75, status: '2 momentos', progress: 71, notifications: 2 },
  { id: 'time', title: 'Tiempo', description: 'Atención colocada con intención.', icon: Timer, x: 52, y: 88, status: '6 h 42 min de enfoque', progress: 69, notifications: 0 },
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

const NeuralBackground = memo(function NeuralBackground({ pointerRef }) {
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
      if (visible && !reducedMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    paint();
    if (!reducedMotion) frame = requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [pointerRef]);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
});

const NeuralConnections = memo(function NeuralConnections({ activeId }) {
  return (
    <svg className="connection-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {LIFE_AREAS.map((area) => {
        const controlX = area.x > 50 ? 58 : 42;
        const controlY = area.y > 50 ? 59 : 41;
        const path = `M 50 50 C ${controlX} ${controlY}, ${controlX} ${controlY}, ${area.x} ${area.y}`;
        return (
          <g key={area.id}>
            <path
              className={activeId === area.id ? 'connection is-active' : 'connection'}
              d={path}
              pathLength="1"
            />
            <circle className="connection-particle" r="0.17">
              <animateMotion path={path} dur="9s" begin={`${LIFE_AREAS.indexOf(area) * -1.15}s`} repeatCount="indefinite" />
            </circle>
          </g>
        );
      })}
    </svg>
  );
});

const LifeNode = memo(function LifeNode({ area, index, active, onHover, onLeave, onSelect }) {
  const Icon = area.icon;
  return (
    <button
      className={`life-node ${active ? 'is-active' : ''}`}
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
    </button>
  );
});

const CoreNode = memo(function CoreNode({ onSelect }) {
  return (
    <button
      className="core-node"
      onClick={() => onSelect({ title: 'Núcleo', description: 'Tu vida, contemplada como un todo conectado.' })}
    >
      <span className="core-wave core-wave-one" />
      <span className="core-wave core-wave-two" />
      <span className="core-particles" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => <i key={index} style={{ '--particle-delay': `${index * -1.3}s` }} />)}
      </span>
      <span className="core-surface" />
      <span className="core-title">NÚCLEO</span>
      <span className="core-caption">Todo se conecta aquí</span>
      <span className="core-status" />
    </button>
  );
});

function DetailPanel({ area, onClose }) {
  if (!area) return null;
  const Icon = area.icon || UserRound;
  return (
    <div className="detail-scrim" onClick={onClose} role="presentation">
      <div className="detail-panel" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button className="detail-close" aria-label="Cerrar" onClick={onClose}><X size={17} /></button>
        <div className="detail-icon"><Icon size={20} strokeWidth={1.4} /></div>
        <p className="detail-label">Parte de tu vida</p>
        <h2 id="detail-title">{area.title}</h2>
        <p className="detail-description">{area.description}</p>
        <div className="detail-meta"><span>Listo para explorar</span><ArrowUpRight size={15} /></div>
      </div>
    </div>
  );
}

function App() {
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const mapRef = useRef(null);
  const ambientRef = useRef(null);
  const ecosystemRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [moment, setMoment] = useState(() => getMoment(new Date()));
  const handleLeaveArea = useCallback(() => setActiveId(null), []);
  const handleSelectArea = useCallback((area) => setSelected(area), []);
  const handleCloseDetail = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const interval = window.setInterval(() => setMoment(getMoment(new Date())), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
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
  }, []);

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
    <main className="playground-shell">
      <NeuralBackground pointerRef={pointerRef} />
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

      <section ref={ecosystemRef} className="ecosystem" aria-labelledby="ecosystem-title">
        <div className="section-heading">
          <p>Tu mundo</p>
          <h2 id="ecosystem-title">Todo lo que importa,<br />conectado.</h2>
        </div>

        <div ref={mapRef} className="life-map">
          <NeuralConnections activeId={activeId} />
          {LIFE_AREAS.map((area, index) => (
            <LifeNode
              key={area.id}
              area={area}
              index={index}
              active={activeId === area.id}
              onHover={setActiveId}
              onLeave={handleLeaveArea}
              onSelect={handleSelectArea}
            />
          ))}
          <CoreNode onSelect={handleSelectArea} />
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

      <DetailPanel area={selected} onClose={handleCloseDetail} />
    </main>
  );
}

createRoot(document.getElementById('playground-root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
