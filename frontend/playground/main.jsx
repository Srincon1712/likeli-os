import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowUpRight, CalendarDays, CircleDollarSign, Command, Heart, Layers3, Lightbulb, Network, Orbit, Search, Sparkles, Timer, UserRound, X } from 'lucide-react';
import './styles.css';

const systems = [
  { id: 'individual', title: 'Individual', eyebrow: 'SELF', description: 'Energy, body and inner signal.', icon: UserRound, x: 13, y: 34, status: 'Balanced', progress: 78, notifications: 2 },
  { id: 'knowledge', title: 'Knowledge', eyebrow: 'MIND', description: 'Ideas becoming understanding.', icon: Lightbulb, x: 29, y: 12, status: '3 new threads', progress: 64, notifications: 3 },
  { id: 'projects', title: 'Projects', eyebrow: 'CREATE', description: 'From intention to momentum.', icon: Layers3, x: 73, y: 14, status: 'In flow', progress: 52, notifications: 1 },
  { id: 'finance', title: 'Finance', eyebrow: 'RESOURCE', description: 'A clear view of your runway.', icon: CircleDollarSign, x: 87, y: 38, status: 'On track', progress: 84, notifications: 0 },
  { id: 'relationships', title: 'Relationships', eyebrow: 'CONNECT', description: 'The people who make life rich.', icon: Heart, x: 79, y: 76, status: '2 moments', progress: 71, notifications: 2 },
  { id: 'time', title: 'Time', eyebrow: 'RHYTHM', description: 'Your attention, intentionally placed.', icon: Timer, x: 53, y: 90, status: '06:42 focused', progress: 69, notifications: 0 },
  { id: 'organization', title: 'Organization', eyebrow: 'ORDER', description: 'Less noise. More signal.', icon: CalendarDays, x: 20, y: 76, status: 'Quiet', progress: 91, notifications: 0 }
];

function NeuralBackground({ pointer, activeId }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef(pointer);
  const activeRef = useRef(activeId);
  const nodes = useMemo(() => Array.from({ length: 90 }, (_, index) => ({
    x: ((index * 47) % 1000) / 1000,
    y: ((index * 83 + 17) % 1000) / 1000,
    r: 0.5 + ((index * 13) % 10) / 10,
    speed: 0.00008 + ((index * 7) % 5) * 0.00002,
    phase: index * 0.7
  })), []);

  useEffect(() => { pointerRef.current = pointer; }, [pointer]);
  useEffect(() => { activeRef.current = activeId; }, [activeId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frame;
    let width = 0;
    let height = 0;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    const draw = (time) => {
      const pulse = time * 0.001;
      const p = pointerRef.current;
      context.clearRect(0, 0, width, height);
      const points = nodes.map((node) => {
        const driftX = Math.sin(pulse * node.speed * 5000 + node.phase) * 10;
        const driftY = Math.cos(pulse * node.speed * 4200 + node.phase) * 8;
        return { ...node, px: node.x * width + driftX, py: node.y * height + driftY };
      });
      context.lineWidth = 0.45;
      points.forEach((point, index) => {
        points.slice(index + 1, index + 5).forEach((target) => {
          const dx = target.px - point.px;
          const dy = target.py - point.py;
          const distance = Math.hypot(dx, dy);
          if (distance > 175) return;
          const cursorDistance = Math.hypot(point.px - p.x, point.py - p.y);
          const alpha = Math.max(0.025, 0.11 - distance / 2200) + Math.max(0, 0.06 - cursorDistance / 700);
          context.strokeStyle = `rgba(77, 177, 218, ${alpha})`;
          context.beginPath();
          context.moveTo(point.px, point.py);
          context.quadraticCurveTo((point.px + target.px) / 2 + Math.sin(pulse + index) * 8, (point.py + target.py) / 2 + Math.cos(pulse + index) * 8, target.px, target.py);
          context.stroke();
        });
      });
      points.forEach((point, index) => {
        const cursorDistance = Math.hypot(point.px - p.x, point.py - p.y);
        const glow = Math.max(0, 1 - cursorDistance / 220);
        context.fillStyle = `rgba(133, 220, 247, ${0.14 + glow * 0.22})`;
        context.beginPath();
        context.arc(point.px, point.py, point.r + glow * 1.5, 0, Math.PI * 2);
        context.fill();
        if (index % 7 === Math.floor((pulse * 0.45 + index) % 7)) {
          context.fillStyle = 'rgba(189, 243, 255, 0.65)';
          context.beginPath();
          context.arc(point.px, point.py, point.r + 1.4, 0, Math.PI * 2);
          context.fill();
        }
      });
      if (activeRef.current) {
        const halo = context.createRadialGradient(p.x, p.y, 0, p.x, p.y, 260);
        halo.addColorStop(0, 'rgba(74, 192, 231, 0.045)');
        halo.addColorStop(1, 'rgba(74, 192, 231, 0)');
        context.fillStyle = halo;
        context.fillRect(0, 0, width, height);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [nodes]);

  return <canvas ref={canvasRef} className="neural-canvas" aria-hidden="true" />;
}

function NeuralConnections({ activeId }) {
  return <svg className="connection-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    {systems.map((system, index) => {
      const active = activeId === system.id;
      const cx = system.x > 50 ? 57 : 43;
      const cy = system.y > 50 ? 58 : 42;
      return <path key={system.id} className={active ? 'connection connection-active' : 'connection'} d={`M 50 50 C ${cx} ${cy}, ${cx} ${cy}, ${system.x} ${system.y}`} style={{ animationDelay: `${index * 0.35}s` }} />;
    })}
  </svg>;
}

function GlassPanel({ children, className = '' }) { return <div className={`glass-panel ${className}`}>{children}</div>; }

function LifeNode({ system, active, onHover, onLeave, onSelect }) {
  const Icon = system.icon;
  return <button className={`life-node ${active ? 'is-active' : ''}`} style={{ left: `${system.x}%`, top: `${system.y}%` }} onMouseEnter={() => onHover(system.id)} onMouseLeave={onLeave} onFocus={() => onHover(system.id)} onBlur={onLeave} onClick={() => onSelect(system)}>
    <span className="node-icon"><Icon size={17} strokeWidth={1.5} /></span>
    <span className="node-copy"><span className="node-eyebrow">{system.eyebrow}</span><span className="node-title">{system.title}</span><span className="node-status">{system.status}</span></span>
    {system.notifications > 0 && <span className="notification-dot">{system.notifications}</span>}
    <span className="node-progress" style={{ '--progress': `${system.progress}%` }} />
  </button>;
}

function CoreNode({ booted, onSelect }) {
  return <button className={`core-node ${booted ? 'is-booted' : ''}`} onClick={() => onSelect({ title: 'LIKELI Core', description: 'Your life, seen as one connected system.' })}>
    <span className="core-ring core-ring-one" /><span className="core-ring core-ring-two" /><span className="core-orbit"><Orbit size={14} /></span>
    <span className="core-label">LIKELI</span><span className="core-title">CORE</span><span className="core-caption">life operating system</span><span className="core-pulse" />
  </button>;
}

function App() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [activeId, setActiveId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [booted, setBooted] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setBooted(true), 180); return () => clearTimeout(timer); }, []);
  useEffect(() => { const move = (event) => setPointer({ x: event.clientX, y: event.clientY }); window.addEventListener('pointermove', move, { passive: true }); return () => window.removeEventListener('pointermove', move); }, []);
  const cameraStyle = { transform: `translate3d(${(pointer.x / window.innerWidth - 0.5) * -8}px, ${(pointer.y / window.innerHeight - 0.5) * -5}px)` };
  return <main className="playground-shell">
    <NeuralBackground pointer={pointer} activeId={activeId} />
    <div className="ambient ambient-left" /><div className="ambient ambient-right" />
    <section className="hud" style={cameraStyle}>
      <header className="topbar">
        <div className="brand-lockup"><div className="brand-mark"><Network size={16} /></div><div><div className="brand-name">LIKELI</div><div className="brand-subtitle">human operating system</div></div></div>
        <div className="system-state"><span className="state-dot" />all systems present <span className="state-divider" /> <span className="mono">07:42</span></div>
        <div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={17} /></button><button className="icon-button" aria-label="Command menu"><Command size={17} /></button><div className="avatar">S</div></div>
      </header>
      <div className="intro"><div className="kicker"><Sparkles size={13} /> MORNING SYNTHESIS <span className="kicker-line" /></div><h1>Good morning, Sebastian.</h1><p>Your life is in motion. Here is the signal.</p></div>
      <div className="orbit-stage" style={cameraStyle}>
        <NeuralConnections activeId={activeId} />
        <div className="stage-grid" />
        {systems.map((system) => <LifeNode key={system.id} system={system} active={activeId === system.id} onHover={setActiveId} onLeave={() => setActiveId(null)} onSelect={setSelected} />)}
        <CoreNode booted={booted} onSelect={setSelected} />
      </div>
      <div className="bottom-deck"><GlassPanel className="signal-panel"><div className="panel-heading"><span className="panel-label"><Activity size={13} /> LIVE SIGNAL</span><span className="panel-time">just now</span></div><p>Momentum is building around <span>Projects</span>. Your best next move is already close.</p><div className="signal-wave"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></GlassPanel><GlassPanel className="focus-panel"><div className="panel-heading"><span className="panel-label"><Timer size={13} /> FOCUS WINDOW</span><span className="panel-time">TODAY</span></div><div className="focus-readout"><strong>06<span>:</span>42</strong><div><span>deep focus</span><small>82% of intention</small></div></div><div className="focus-track"><span /></div></GlassPanel><div className="footer-note"><span className="pulse-icon" /> neural map synced<br /><span className="muted">move through your systems</span></div></div>
    </section>
    {selected && <div className="detail-scrim" onClick={() => setSelected(null)}><GlassPanel className="detail-panel" ><button className="detail-close" aria-label="Close" onClick={() => setSelected(null)}><X size={17} /></button><div className="detail-orb"><Sparkles size={18} /></div><span className="node-eyebrow">SYSTEM ONLINE</span><h2>{selected.title}</h2><p>{selected.description}</p><div className="detail-meta"><span>exploration mode</span><ArrowUpRight size={14} /></div></GlassPanel></div>}
  </main>;
}

createRoot(document.getElementById('playground-root')).render(<React.StrictMode><App /></React.StrictMode>);
