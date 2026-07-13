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
  { id: 'individual', title: 'Individual', description: 'Energy, body and inner balance.', icon: UserRound, x: 13, y: 35, status: 'Balanced', progress: 78, notifications: 2 },
  { id: 'knowledge', title: 'Knowledge', description: 'Ideas becoming understanding.', icon: Lightbulb, x: 29, y: 13, status: '3 new threads', progress: 64, notifications: 3 },
  { id: 'projects', title: 'Projects', description: 'Intention becoming momentum.', icon: Layers3, x: 72, y: 13, status: 'In flow', progress: 52, notifications: 1 },
  { id: 'finance', title: 'Finance', description: 'A clear view of your resources.', icon: CircleDollarSign, x: 87, y: 36, status: 'On track', progress: 84, notifications: 0 },
  { id: 'relationships', title: 'Relationships', description: 'The people who make life rich.', icon: Heart, x: 79, y: 75, status: '2 moments', progress: 71, notifications: 2 },
  { id: 'time', title: 'Time', description: 'Attention, intentionally placed.', icon: Timer, x: 52, y: 88, status: '6h 42m focused', progress: 69, notifications: 0 },
  { id: 'organization', title: 'Organization', description: 'Less noise. More clarity.', icon: CalendarDays, x: 19, y: 75, status: 'Quiet', progress: 91, notifications: 0 }
];

function getGreeting(hour) {
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

function getMoment(date) {
  return {
    greeting: getGreeting(date.getHours()),
    time: new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date),
    date: new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date)
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
      const points = nodes.map((node) => ({
        ...node,
        px: node.x * width + Math.sin(time * 0.00008 + node.phase) * 3,
        py: node.y * height + Math.cos(time * 0.00007 + node.phase) * 2.5
      }));

      context.lineWidth = 0.4;
      points.forEach((point, index) => {
        points.slice(index + 1, index + 3).forEach((target) => {
          const distance = Math.hypot(target.px - point.px, target.py - point.py);
          if (distance > 210) return;
          context.strokeStyle = `rgba(107, 179, 204, ${Math.max(0.018, 0.065 - distance / 4400)})`;
          context.beginPath();
          context.moveTo(point.px, point.py);
          context.quadraticCurveTo(
            (point.px + target.px) / 2,
            (point.py + target.py) / 2 + Math.sin(index) * 4,
            target.px,
            target.py
          );
          context.stroke();
        });
      });

      points.forEach((point) => {
        const cursorDistance = Math.hypot(point.px - pointer.x, point.py - pointer.y);
        const response = Math.max(0, 1 - cursorDistance / 180);
        context.fillStyle = `rgba(164, 218, 234, ${0.08 + response * 0.1})`;
        context.beginPath();
        context.arc(point.px, point.py, point.radius + response * 0.5, 0, Math.PI * 2);
        context.fill();
      });
    }

    function draw(time) {
      if (!visible) return;
      if (time - lastPaint > 32) {
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
        return (
          <path
            key={area.id}
            className={activeId === area.id ? 'connection is-active' : 'connection'}
            d={`M 50 50 C ${controlX} ${controlY}, ${controlX} ${controlY}, ${area.x} ${area.y}`}
          />
        );
      })}
    </svg>
  );
});

const LifeNode = memo(function LifeNode({ area, active, onHover, onLeave, onSelect }) {
  const Icon = area.icon;
  return (
    <button
      className={`life-node ${active ? 'is-active' : ''}`}
      style={{ left: `${area.x}%`, top: `${area.y}%`, '--progress': `${area.progress}%` }}
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
      onClick={() => onSelect({ title: 'Core', description: 'Your life, seen as one connected whole.' })}
    >
      <span className="core-surface" />
      <span className="core-title">CORE</span>
      <span className="core-caption">Everything connects here</span>
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
        <button className="detail-close" aria-label="Close" onClick={onClose}><X size={17} /></button>
        <div className="detail-icon"><Icon size={20} strokeWidth={1.4} /></div>
        <p className="detail-label">Part of your life</p>
        <h2 id="detail-title">{area.title}</h2>
        <p className="detail-description">{area.description}</p>
        <div className="detail-meta"><span>Ready to explore</span><ArrowUpRight size={15} /></div>
      </div>
    </div>
  );
}

function App() {
  const pointerRef = useRef({ x: -1000, y: -1000 });
  const mapRef = useRef(null);
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
      <div className="ambient-light" aria-hidden="true" />

      <header className="topbar">
        <a href="/" className="back-link"><ArrowLeft size={15} /> Dashboard</a>
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
        <div className="scroll-cue" aria-hidden="true"><span />Your life, in one view</div>
      </section>

      <section ref={ecosystemRef} className="ecosystem" aria-labelledby="ecosystem-title">
        <div className="section-heading">
          <p>Your world</p>
          <h2 id="ecosystem-title">Everything that matters,<br />connected.</h2>
        </div>

        <div ref={mapRef} className="life-map">
          <NeuralConnections activeId={activeId} />
          {LIFE_AREAS.map((area) => (
            <LifeNode
              key={area.id}
              area={area}
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
            <p>Today</p>
            <h3>Momentum is building.</h3>
            <span>Projects are moving with less resistance.</span>
          </article>
          <article>
            <p>Focus</p>
            <h3>6h 42m</h3>
            <span>Intentional time today</span>
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
