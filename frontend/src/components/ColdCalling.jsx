import { ArrowLeft, ArrowRight, Clipboard, Clock, MessageCircle, Upload } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Header, StatCard } from './Shell.jsx';
import { statusLabel } from './osUtils.jsx';
import { api } from '../lib/api.js';

const outcomes = [
  { id: 'no_answer', label: 'No contesto', shortcut: 'Space' },
  { id: 'interested', label: 'Interesado', shortcut: 'Q' },
  { id: 'callback', label: 'Callback', shortcut: 'W', callback: true },
  { id: 'meeting', label: 'Reunion', shortcut: 'E' },
  { id: 'closed', label: 'Venta', shortcut: 'R' },
  { id: 'wrong_number', label: 'Numero incorrecto', shortcut: 'T' },
  { id: 'not_interested', label: 'No interesado', shortcut: 'Y' }
];

export function ColdCalling({ leads, analytics, scripts = [], onImport, onLogCall, onUpdateLead }) {
  const [index, setIndex] = useState(0);
  const [nextCallAt, setNextCallAt] = useState('');
  const [note, setNote] = useState('');
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('note');
  const [pendingOutcome, setPendingOutcome] = useState(null);
  const [modalNote, setModalNote] = useState('');
  const [modalCallbackDate, setModalCallbackDate] = useState('');
  const [manualNote, setManualNote] = useState('');
  const [leadNotes, setLeadNotes] = useState([]);
  const modalRef = useRef(null);
  const activeLead = leads[index] || null;

  const callableLeads = useMemo(
    () => leads.filter((lead) => !['dead', 'closed', 'sale', 'lost', 'not_interested', 'wrong_number'].includes(lead.status)).length,
    [leads]
  );
  const priorityQueue = useMemo(() => {
    const priority = { high: 0, medium: 1, low: 2 };
    return [...leads].sort((a, b) => (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1));
  }, [leads]);

  useEffect(() => {
    setStartedAt(Date.now());
    setElapsed(0);
  }, [activeLead?.id]);

  useEffect(() => {
    let cancelled = false;
    async function loadNotes() {
      if (!activeLead?.id) {
        setLeadNotes([]);
        return;
      }
      try {
        const notes = await api.leadNotes(activeLead.id);
        if (!cancelled) setLeadNotes(notes);
      } catch {
        if (!cancelled) setLeadNotes([]);
      }
    }
    loadNotes();
    return () => {
      cancelled = true;
    };
  }, [activeLead?.id]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (startedAt) setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    if (modalOpen && modalRef.current) {
      const field = modalRef.current.querySelector('textarea, input');
      if (field) field.focus();
    }
  }, [modalOpen]);

  useEffect(() => {
    function handler(event) {
      if (modalOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setModalOpen(false);
        }
        if (event.key === 'Enter' && pendingOutcome) {
          event.preventDefault();
          submitModal();
        }
        return;
      }
      if (isTyping()) return;
      if (event.key === 'ArrowRight') setIndex((current) => Math.min(current + 1, Math.max(leads.length - 1, 0)));
      if (event.key === 'ArrowLeft') setIndex((current) => Math.max(current - 1, 0));
      const key = event.key.toLowerCase();
      if (key === ' ') openModalFor('no_answer');
      if (key === 'q') openModalFor('interested');
      if (key === 'w') openModalFor('callback');
      if (key === 'e') openModalFor('meeting');
      if (key === 'r') openModalFor('closed');
      if (key === 't') openModalFor('wrong_number');
      if (key === 'y') openModalFor('not_interested');
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [leads.length, modalOpen, modalType, modalNote, modalCallbackDate, pendingOutcome, activeLead, elapsed]);

  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    await onImport(file);
    event.target.value = '';
    setIndex(0);
  }

  function isTyping() {
    const element = document.activeElement;
    if (!element) return false;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(element.tagName) || element.isContentEditable;
  }

  function openModalFor(outcome) {
    setPendingOutcome(outcome);
    setModalNote('');
    setModalCallbackDate('');
    setModalType(outcome === 'callback' ? 'callback' : 'note');
    setModalOpen(true);
  }

  async function saveCall(outcome, payload = {}) {
    if (!activeLead) return;
    await onLogCall(activeLead.id, {
      outcome,
      next_call_at: payload.next_call_at || nextCallAt || null,
      callback_date: payload.callback_date || null,
      note: payload.note ?? note,
      duration_seconds: elapsed
    });
    setNote('');
    setNextCallAt('');
    setModalNote('');
    setModalCallbackDate('');
    setModalOpen(false);
    setIndex((current) => Math.min(current + 1, Math.max(leads.length - 1, 0)));
  }

  function submitModal() {
    if (!pendingOutcome) return;
    if (modalType === 'callback') {
      saveCall(pendingOutcome, { next_call_at: modalCallbackDate, callback_date: modalCallbackDate, note: modalNote });
      return;
    }
    saveCall(pendingOutcome, { note: modalNote });
  }

  async function addManualNote() {
    if (!activeLead?.id || !manualNote.trim()) return;
    const note = await api.createLeadNote(activeLead.id, { content: manualNote, source: 'manual' });
    setLeadNotes((items) => [...items, note]);
    setManualNote('');
  }

  function copyPhone() {
    if (!activeLead?.phone) return;
    navigator.clipboard?.writeText(activeLead.phone);
  }

  function openWhatsApp() {
    if (!activeLead?.phone && !activeLead?.whatsapp) return;
    const phone = String(activeLead.whatsapp || activeLead.phone).replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section>
      <Header
        eyebrow="Likeli / Calling"
        title="Cold Calling Center"
        description="Cola priorizada, vista de llamada, cronometro, botones rapidos, notas, seguimientos, scripts y objeciones."
        right={
          <label className="ui-button cursor-pointer border border-signal/30 bg-signal/10 text-ice hover:bg-signal/15">
            <Upload size={16} />
            Import CSV
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={importFile} />
          </label>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Calls" value={analytics?.total || 0} detail="logged events" />
        <StatCard label="Response" value={`${analytics?.responseRate || 0}%`} detail="positive contact" />
        <StatCard label="Interested" value={analytics?.interested || 0} detail="active signal" />
        <StatCard label="Callbacks" value={analytics?.callbacks || 0} detail="scheduled return" />
        <StatCard label="Closed" value={analytics?.closed || 0} detail="clients" />
        <StatCard label="Callable" value={callableLeads} detail="open queue" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_320px]">
        <aside className="glass min-w-0 rounded-lg p-3">
          <h3 className="font-medium text-white">Cola de llamadas</h3>
          <div className="mt-3 max-h-[66vh] space-y-1.5 overflow-y-auto overflow-x-hidden">
            {priorityQueue.slice(0, 18).map((lead) => (
              <button
                key={lead.id}
                onClick={() => setIndex(Math.max(0, leads.findIndex((item) => item.id === lead.id)))}
                className={`w-full rounded-md border px-2.5 py-2 text-left text-xs ${activeLead?.id === lead.id ? 'border-signal/30 bg-signal/10 text-white' : 'border-white/10 bg-white/[0.03] text-slate-400'}`}
              >
                <div className="truncate font-medium">{lead.business_name}</div>
                <div className="mt-1 truncate">{lead.priority || 'medium'} - {statusLabel(lead.status)}</div>
              </button>
            ))}
          </div>
        </aside>

        <div className="glass min-w-0 rounded-lg p-4">
          {activeLead ? (
            <div>
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">Lead {index + 1} / {leads.length}</div>
                <div className="flex items-center gap-2 rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-400">
                  <Clock size={14} />
                  {formatElapsed(elapsed)} - {statusLabel(activeLead.status)}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/25 p-4">
                <h3 className="truncate text-2xl font-semibold tracking-normal text-white">{activeLead.business_name}</h3>
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <LeadField label="Phone" value={activeLead.phone || 'No phone'} strong />
                  <LeadField label="City" value={activeLead.city || 'Unknown'} />
                  <LeadField label="Sector" value={activeLead.sector || activeLead.niche || 'Unclassified'} />
                  <LeadField label="Contacto" value={activeLead.contact_name || 'No contact'} />
                </div>
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Notes / Objeciones</div>
                  <p className="mt-2 max-h-24 overflow-y-auto whitespace-pre-line text-[13px] leading-5 text-slate-300">{[activeLead.notes, activeLead.objections].filter(Boolean).join('\n') || 'No notes loaded.'}</p>
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                <button className="ui-button border border-white/10 text-slate-300 hover:border-signal/30 hover:text-white" onClick={() => setIndex(Math.max(index - 1, 0))}>
                  <ArrowLeft className="mr-2 inline" size={16} /> Previous
                </button>
                <button className="ui-button border border-white/10 text-slate-300 hover:border-signal/30 hover:text-white" onClick={() => setIndex(Math.min(index + 1, leads.length - 1))}>
                  Next <ArrowRight className="ml-2 inline" size={16} />
                </button>
                <button className="ui-icon-button border border-white/10 text-slate-300 hover:border-signal/30 hover:text-white" onClick={copyPhone} title="Copy phone">
                  <Clipboard size={17} />
                </button>
                <button className="ui-icon-button border border-white/10 text-slate-300 hover:border-signal/30 hover:text-white" onClick={openWhatsApp} title="Open WhatsApp">
                  <MessageCircle size={17} />
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {outcomes.map((outcome) => (
                  <button
                    key={outcome.id}
                    onClick={() => openModalFor(outcome.id)}
                    className="ui-button border border-signal/20 bg-signal/[0.08] text-ice hover:bg-signal/15"
                  >
                    <span>{outcome.label}</span>
                    <span className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-mono text-slate-300">
                      {outcome.shortcut}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] text-center">
              <div>
                <div className="text-lg font-medium text-white">No leads loaded</div>
                <p className="mt-2 text-sm text-slate-400">Importa un CSV o crea leads desde CRM.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-lg p-4">
            <h3 className="font-medium text-white">Follow-up</h3>
            <div className="mt-3 space-y-2.5">
              <input className="field" type="datetime-local" value={nextCallAt} onChange={(e) => setNextCallAt(e.target.value)} />
              <textarea className="field min-h-20 resize-none" placeholder="Call note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {activeLead ? (
            <div className="glass rounded-lg p-4">
              <h3 className="font-medium text-white">Lead state</h3>
              <div className="mt-3 space-y-2.5 text-sm text-slate-400">
                <Row label="Attempts" value={activeLead.call_count} />
                <Row label="Last call" value={activeLead.last_call_at ? new Date(activeLead.last_call_at).toLocaleString() : 'None'} />
                <Row label="Next call" value={activeLead.next_call_at ? new Date(activeLead.next_call_at).toLocaleString() : 'None'} />
              </div>
              <div className="mt-3 space-y-2">
                <textarea className="field min-h-20 resize-none" placeholder="Agregar nota al historial" value={manualNote} onChange={(e) => setManualNote(e.target.value)} />
                <button className="ui-button w-full border border-white/10 text-slate-300 hover:border-signal/30 hover:text-white" onClick={addManualNote}>
                  Agregar nota
                </button>
              </div>
              <div className="mt-3 max-h-56 space-y-2 overflow-y-auto overflow-x-hidden">
                {leadNotes.map((item) => (
                  <div key={item.id} className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
                    <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-slate-500">{new Date(item.created_at).toLocaleString()}</div>
                    <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-300">{item.content}</p>
                  </div>
                ))}
                {!leadNotes.length ? <div className="text-xs text-slate-500">Sin historial de notas.</div> : null}
              </div>
            </div>
          ) : null}

          <div className="glass rounded-lg p-4">
            <h3 className="font-medium text-white">Scripts</h3>
            <div className="mt-3 max-h-72 space-y-2 overflow-y-auto overflow-x-hidden">
              {scripts.map((script) => (
                <details key={script.id} className="rounded-md border border-white/10 bg-white/[0.03] p-3">
                  <summary className="cursor-pointer text-sm text-white">{script.title}</summary>
                  <p className="mt-2 whitespace-pre-line text-xs leading-5 text-slate-400">{script.content}</p>
                </details>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div ref={modalRef} className="glass relative z-10 w-full max-w-lg rounded-lg p-4">
            <h3 className="mb-3 text-lg font-medium text-white">{modalType === 'callback' ? 'Schedule callback' : 'Add call note'}</h3>
            <div className="space-y-3">
              {modalType === 'callback' ? (
                <div>
                  <label className="text-sm text-slate-400">Fecha y hora de callback</label>
                  <input className="field mt-1 w-full" type="datetime-local" value={modalCallbackDate} onChange={(e) => setModalCallbackDate(e.target.value)} />
                </div>
              ) : null}
              <div>
                <label className="text-sm text-slate-400">Nota opcional</label>
                <textarea className="field mt-1 w-full min-h-20 resize-none" value={modalNote} onChange={(e) => setModalNote(e.target.value)} />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button className="ui-button border border-white/10 text-slate-300" onClick={() => setModalOpen(false)}>Cerrar</button>
                <button className="ui-button bg-signal text-white" onClick={submitModal}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function LeadField({ label, value, strong }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-1.5 truncate ${strong ? 'metric text-lg text-ice' : 'text-sm text-slate-200'}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] pb-2">
      <span>{label}</span>
      <span className="metric text-right text-slate-200">{value}</span>
    </div>
  );
}

function formatElapsed(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}:${rest}`;
}
