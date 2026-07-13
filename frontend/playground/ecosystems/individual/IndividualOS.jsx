import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Command,
  LockKeyhole,
  Pencil,
  Sparkles,
  X
} from 'lucide-react';
import { DAILY_FIELDS, DAILY_FLOW, INDIVIDUAL_DOMAINS, RANGE_OPTIONS } from './config.js';
import {
  analyzeRecord,
  formatLongDate,
  getCalendarDays,
  getDomainModel,
  getIndividualModel,
  getSmartValues,
  writeRecord
} from './individualData.js';
import './individual.css';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' });
const fieldMap = new Map(DAILY_FIELDS.map((field) => [field.id, field]));

const StateCore = memo(function StateCore({ model, onRecord }) {
  const score = model.score;
  return (
    <div className="individual-state-core">
      <div className="state-orbit state-orbit-outer"><i /><i /><i /></div>
      <div className="state-orbit state-orbit-inner" />
      <div className="state-core-surface" style={{ '--state-score': `${score ?? 0}%` }}>
        <span>Estado general</span>
        <strong>{score ?? '—'}</strong>
        <small>{model.level}</small>
      </div>
      {model.pending.length ? (
        <button type="button" className="state-record-action" onClick={onRecord}>
          <span>Registrar {formatLongDate(model.pending[0])}</span><ArrowRight size={14} />
        </button>
      ) : <div className="state-complete"><Check size={13} /> Todo está al día</div>}
    </div>
  );
});

const DomainOrbit = memo(function DomainOrbit({ records, onSelect }) {
  const domains = useMemo(() => INDIVIDUAL_DOMAINS.map((domain) => ({
    ...domain,
    state: getDomainModel(records, domain.id, 30)
  })), [records]);
  return (
    <div className="domain-orbit" aria-label="Dominios de Individual">
      {domains.map((domain, index) => {
        const Icon = domain.icon;
        return (
          <button
            key={domain.id}
            type="button"
            className="domain-orb"
            style={{ '--domain-index': index }}
            onClick={() => onSelect(domain.id)}
          >
            <span className="domain-orb-icon"><Icon size={17} strokeWidth={1.25} /></span>
            <span><strong>{domain.shortTitle}</strong><small>{domain.state.score === null ? 'Preparado' : `${domain.state.score} %`}</small></span>
          </button>
        );
      })}
    </div>
  );
});

function CalendarDay({ day, onOpen }) {
  if (!day) return <div className="individual-day is-empty" aria-hidden="true" />;
  const stateClass = day.state.toLowerCase().replaceAll(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const score = day.analysis?.score ?? 0;
  return (
    <button
      type="button"
      className={`individual-day is-${stateClass}`}
      disabled={!day.canOpen}
      onClick={() => onOpen(day)}
      aria-label={`${day.day}, ${day.state}${day.analysis ? `, ${score} puntos` : ''}`}
    >
      <span className="day-number">{day.day}</span>
      <span className="day-indicator" style={{ '--day-score': `${score}%` }}>
        {day.state === 'Bloqueado' ? <LockKeyhole size={12} /> : day.analysis ? <strong>{score}</strong> : <CircleDot size={12} />}
      </span>
      <span className="day-state">{day.state}</span>
      {day.analysis ? <span className="day-level">{day.analysis.level} · {score} %</span> : null}
      {day.canOpen ? <span className="day-access">{day.record ? <Pencil size={10} /> : <ArrowRight size={10} />}</span> : null}
    </button>
  );
}

const IndividualCalendar = memo(function IndividualCalendar({ records, onOpen }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const days = useMemo(() => getCalendarDays(month, records), [month, records]);
  const moveMonth = useCallback((offset) => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1)), []);
  return (
    <section className="individual-calendar" aria-labelledby="individual-calendar-title">
      <div className="calendar-heading">
        <div><span>Memoria diaria</span><h2 id="individual-calendar-title">Cada día deja una señal.</h2></div>
        <div className="month-control">
          <button type="button" onClick={() => moveMonth(-1)} aria-label="Mes anterior"><ChevronLeft size={16} /></button>
          <strong>{monthFormatter.format(month)}</strong>
          <button type="button" onClick={() => moveMonth(1)} aria-label="Mes siguiente"><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="calendar-surface">
        <div className="weekday-row">{WEEKDAYS.map((day) => <span key={day}>{day}</span>)}</div>
        <div className="month-grid">{days.map((day, index) => <CalendarDay key={day?.key || `vacío-${index}`} day={day} onOpen={onOpen} />)}</div>
      </div>
      <div className="calendar-legend">
        {['Sin registro', 'Pendiente', 'Registrado', 'Perfecto', 'Día actual', 'Bloqueado'].map((state) => <span key={state} className={`legend-${state.toLowerCase().replaceAll(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`}><i />{state}</span>)}
      </div>
    </section>
  );
});

function TrendTrace({ series }) {
  const valid = series.filter((point) => point.value !== null);
  const points = valid.map((point, index) => {
    const x = valid.length === 1 ? 50 : 4 + (index / (valid.length - 1)) * 92;
    const y = 88 - point.value * 0.72;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div className="domain-trace">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 16 H96 M4 52 H96 M4 88 H96" className="domain-grid-line" />
        {valid.length > 1 ? <polyline points={points} className="domain-trend-line" vectorEffect="non-scaling-stroke" /> : null}
      </svg>
      {!valid.length ? <span>La evolución aparecerá con tus primeras señales.</span> : null}
    </div>
  );
}

function DomainSpace({ domainId, records, onClose }) {
  const [rangeId, setRangeId] = useState('30');
  const range = RANGE_OPTIONS.find((option) => option.id === rangeId) || RANGE_OPTIONS[1];
  const model = useMemo(() => getDomainModel(records, domainId, range.days), [records, domainId, range.days]);
  const Icon = model.config.icon;
  const supportedCount = model.hasSignal ? Math.min(model.config.capabilities.length, Math.max(0, model.config.fieldIds.length)) : 0;
  return (
    <section className="individual-domain-space" aria-labelledby="domain-space-title">
      <div className="domain-space-ambient" />
      <header className="domain-space-header">
        <button type="button" onClick={onClose}><ArrowLeft size={15} /> Volver a Individual</button>
        <div><span>Individual</span><i /><strong>{model.config.title}</strong></div>
        <small>{model.hasSignal ? 'Señal activa' : 'Preparado para recibir datos'}</small>
      </header>
      <div className="domain-space-scroll">
        <main className="domain-space-content">
          <section className="domain-space-intro">
            <div className="domain-title-symbol"><Icon size={25} strokeWidth={1.2} /></div>
            <span>Dominio personal</span>
            <h1 id="domain-space-title">{model.config.title}</h1>
            <p>{model.config.description}</p>
          </section>
          <div className="range-constellation" aria-label="Periodo de observación">
            {RANGE_OPTIONS.map((option) => <button key={option.id} type="button" className={option.id === rangeId ? 'is-active' : ''} onClick={() => setRangeId(option.id)}>{option.label}</button>)}
          </div>
          <section className="domain-observatory">
            <div className="domain-state-visual">
              <div className="domain-radar-ring ring-a" /><div className="domain-radar-ring ring-b" />
              <div className="domain-state-center"><Icon size={24} /><strong>{model.score ?? '—'}</strong><span>{model.hasSignal ? 'estado observado' : 'esperando señal'}</span></div>
              {model.config.capabilities.slice(0, 6).map((item, index) => <span key={item} className="domain-radar-point" style={{ '--point-index': index }}>{item}</span>)}
            </div>
            <div className="domain-evidence">
              <div className="domain-metrics">{model.metrics.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
              <TrendTrace series={model.series} />
            </div>
          </section>
          <section className="domain-intelligence"><Sparkles size={17} /><div><span>Inteligencia contextual</span><p>{model.insight}</p></div></section>
          <section className="capability-field">
            <div><span>Profundidad del dominio</span><h2>Una arquitectura preparada para comprenderte.</h2></div>
            <div className="capability-grid">
              {model.config.capabilities.map((capability, index) => <article key={capability} className={index < supportedCount ? 'has-signal' : ''}><i /><strong>{capability}</strong><small>{index < supportedCount ? 'Señal disponible' : 'Preparado'}</small></article>)}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

function isFieldComplete(field, value) {
  if (field.type === 'time-pair') return Boolean(value?.bedTime && value?.wakeTime);
  return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
}

function FlowField({ field, value, onChange }) {
  if (field.type === 'time-pair') {
    return (
      <div className="flow-field time-pair-field">
        <div className="flow-field-label"><span>{field.label}</span><small>hora local</small></div>
        <div className="time-pair-inputs">
          <label><span>{field.bedLabel}</span><input type="time" value={value?.bedTime || ''} onChange={(event) => onChange({ ...(value || {}), bedTime: event.target.value })} /></label>
          <label><span>{field.wakeLabel}</span><input type="time" value={value?.wakeTime || ''} onChange={(event) => onChange({ ...(value || {}), wakeTime: event.target.value })} /></label>
        </div>
      </div>
    );
  }
  const shortcuts = [...new Set([0, Math.round(field.ideal / 2 * 100) / 100, field.ideal])];
  return (
    <div className="flow-field">
      <div className="flow-field-label"><span>{field.label}</span><small>{field.unit}</small></div>
      <div className="flow-number-row">
        <input type="number" inputMode="decimal" min={field.min} step={field.step} placeholder={field.hint} value={value} onChange={(event) => onChange(event.target.value)} />
        <div className="field-shortcuts">{shortcuts.map((shortcut) => <button key={shortcut} type="button" onClick={() => onChange(shortcut)}>{shortcut}</button>)}</div>
      </div>
    </div>
  );
}

function DailyFlow({ targetDate, records, onClose }) {
  const existing = records.find((record) => record.date === targetDate);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(() => getSmartValues(records, existing));
  const current = DAILY_FLOW[step];
  const fields = current.fields.map((id) => fieldMap.get(id));
  const completeCount = DAILY_FIELDS.filter((field) => isFieldComplete(field, values[field.id])).length;
  const isComplete = completeCount === DAILY_FIELDS.length;
  const preview = useMemo(() => analyzeRecord({ date: targetDate, values }), [targetDate, values]);
  const save = useCallback(() => { if (isComplete) { writeRecord(targetDate, values); onClose(); } }, [isComplete, onClose, targetDate, values]);
  const next = useCallback(() => { if (step < DAILY_FLOW.length - 1) setStep((value) => value + 1); else save(); }, [save, step]);
  const previous = useCallback(() => setStep((value) => Math.max(0, value - 1)), []);
  const update = useCallback((id, value) => setValues((currentValues) => ({ ...currentValues, [id]: value })), []);
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
        event.preventDefault();
        const inputs = [...document.querySelectorAll('.flow-fields input')];
        const currentIndex = inputs.indexOf(event.target);
        if (currentIndex >= 0 && inputs[currentIndex + 1]) inputs[currentIndex + 1].focus();
        else next();
        return;
      }
      const interactive = ['INPUT', 'BUTTON'].includes(event.target.tagName);
      if (interactive) return;
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') { event.preventDefault(); next(); }
      if (/^[1-5]$/.test(event.key)) setStep(Math.min(DAILY_FLOW.length - 1, Number(event.key) - 1));
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [next, previous]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => document.querySelector('.flow-fields input')?.focus());
    return () => cancelAnimationFrame(frame);
  }, [step]);

  return (
    <section className="daily-flow" role="dialog" aria-modal="true" aria-labelledby="daily-flow-title">
      <div className="flow-ambient" />
      <header className="flow-header">
        <button type="button" onClick={onClose}><X size={16} /> Cerrar</button>
        <div><span>Cumplimiento Diario</span><strong>{formatLongDate(targetDate)}</strong></div>
        <small>{completeCount} de {DAILY_FIELDS.length} señales</small>
      </header>
      <main className="flow-content">
        <nav className="flow-steps" aria-label="Momentos del registro">
          {DAILY_FLOW.map((item, index) => <button key={item.id} type="button" className={index === step ? 'is-active' : index < step ? 'is-complete' : ''} onClick={() => setStep(index)}><span>{index + 1}</span><strong>{item.title}</strong></button>)}
        </nav>
        <section className="flow-stage">
          <div className="flow-question"><span>Momento {step + 1} de {DAILY_FLOW.length}</span><h1 id="daily-flow-title">{current.question}</h1><p>{existing ? 'Estás ajustando una memoria ya registrada.' : 'Confirma lo habitual y modifica solamente lo que cambió.'}</p></div>
          <div className="flow-fields">{fields.map((field) => <FlowField key={field.id} field={field} value={values[field.id]} onChange={(value) => update(field.id, value)} />)}</div>
          <aside className="flow-live-score">
            <div className="live-score-ring" style={{ '--preview-score': `${preview.score}%` }}><strong>{preview.score}</strong><span>de 100</span></div>
            <div><span>Lectura provisional</span><strong>{preview.level}</strong><small>Se calcula localmente mientras respondes.</small></div>
          </aside>
        </section>
        <footer className="flow-footer">
          <div><Command size={13} /><span>Tabulador para avanzar · Flechas para cambiar momento · 1—5 para saltar</span></div>
          <div className="flow-actions">
            <button type="button" onClick={previous} disabled={step === 0}><ArrowLeft size={14} /> Anterior</button>
            <button type="button" className="flow-primary" onClick={next} disabled={step === DAILY_FLOW.length - 1 && !isComplete}>{step === DAILY_FLOW.length - 1 ? 'Guardar día' : 'Continuar'} <ArrowRight size={14} /></button>
          </div>
        </footer>
      </main>
    </section>
  );
}

export default function IndividualOS({ system, records, closing, onClose }) {
  const model = useMemo(() => getIndividualModel(records), [records]);
  const [domainId, setDomainId] = useState(null);
  const [recordDate, setRecordDate] = useState(null);
  const openPriorityDate = useCallback(() => setRecordDate(model.pending[0]), [model.pending]);
  const openDay = useCallback((day) => setRecordDate(day.key), []);
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;
      if (recordDate) setRecordDate(null);
      else if (domainId) setDomainId(null);
      else onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [domainId, onClose, recordDate]);
  return (
    <section
      className={`ecosystem-world individual-os ${closing ? 'is-closing' : ''}`}
      style={{ '--world-origin-x': `${system.x ?? 13}%`, '--world-origin-y': `${system.y ?? 35}%` }}
      aria-labelledby="individual-title"
    >
      <div className="world-ambient individual-ambient" />
      <header className="world-header">
        <button type="button" className="world-back" onClick={onClose}><ArrowLeft size={16} /> Volver al mapa</button>
        <div className="world-location"><span>Núcleo</span><i /><strong>Individual</strong></div>
        <div className="world-source"><span className={records.length ? 'source-live' : ''} />Cumplimiento Diario · {records.length} registros</div>
      </header>
      <div className="world-scroll individual-scroll">
        <main className="individual-content">
          <section className="individual-intro">
            <span>Representación personal</span>
            <h1 id="individual-title">Individual</h1>
            <p>Una lectura viva de cómo estás, cómo evolucionas y qué merece tu atención.</p>
            {model.pending.length ? <button type="button" className="pending-pill" onClick={openPriorityDate}><i />{model.pending.length} {model.pending.length === 1 ? 'día pendiente' : 'días pendientes'}<ArrowRight size={13} /></button> : null}
          </section>
          <section className="individual-command" aria-label="Centro de estado personal">
            <div className="command-fiber fiber-one" /><div className="command-fiber fiber-two" />
            <StateCore model={model} onRecord={openPriorityDate} />
            <DomainOrbit records={records} onSelect={setDomainId} />
          </section>
          <section className="individual-snapshot">
            <article><span>Última lectura</span><strong>{model.latest?.score ?? '—'}</strong><small>{model.latest ? formatLongDate(model.latest.date) : 'Aún no hay memoria'}</small></article>
            <article><span>Consistencia reciente</span><strong>{model.consistency} %</strong><small>Registros de los últimos siete días</small></article>
            <article><span>Evolución</span><strong>{model.trend === null ? 'Aprendiendo' : `${model.trend >= 0 ? '+' : ''}${model.trend}`}</strong><small>Frente al periodo anterior</small></article>
          </section>
          <section className="individual-insight"><Sparkles size={17} /><div><span>Lectura del sistema</span><h2>{model.pending.length ? 'Tu memoria tiene espacios por completar.' : 'Tu memoria diaria está completa.'}</h2><p>{model.pending.length ? 'Comienza por el día más reciente. El sistema reconstruirá las tendencias sin pedirte información en otro lugar.' : 'Cada dominio está sincronizado con una única fuente de verdad.'}</p></div></section>
          <IndividualCalendar records={records} onOpen={openDay} />
        </main>
      </div>
      {domainId ? <DomainSpace domainId={domainId} records={records} onClose={() => setDomainId(null)} /> : null}
      {recordDate ? <DailyFlow key={recordDate} targetDate={recordDate} records={records} onClose={() => setRecordDate(null)} /> : null}
    </section>
  );
}
