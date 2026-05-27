import { ArrowLeft, ArrowRight, Clipboard, MessageCircle, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header, StatCard } from './Shell.jsx';

const outcomes = [
  { id: 'no_answer', label: 'No contestó' },
  { id: 'interested', label: 'Interesado' },
  { id: 'callback', label: 'Callback' },
  { id: 'closed', label: 'Cerrado' },
  { id: 'dead', label: 'Muerto' }
];

export function ColdCalling({ leads, analytics, onImport, onLogCall, onUpdateLead }) {
  const [index, setIndex] = useState(0);
  const [nextCallAt, setNextCallAt] = useState('');
  const [note, setNote] = useState('');
  const activeLead = leads[index] || null;
  const callableLeads = useMemo(() => leads.filter((lead) => lead.status !== 'dead' && lead.status !== 'closed').length, [leads]);

  async function importFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    await onImport(file);
    event.target.value = '';
    setIndex(0);
  }

  async function log(outcome) {
    if (!activeLead) return;
    await onLogCall(activeLead.id, { outcome, next_call_at: nextCallAt || null, note });
    setNote('');
    setNextCallAt('');
    setIndex((current) => Math.min(current + 1, Math.max(leads.length - 1, 0)));
  }

  function copyPhone() {
    if (!activeLead?.phone) return;
    navigator.clipboard?.writeText(activeLead.phone);
  }

  function openWhatsApp() {
    if (!activeLead?.phone) return;
    const phone = activeLead.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
  }

  return (
    <section>
      <Header
        eyebrow="Likeli / Calling"
        title="Cold Calling System"
        description="CSV in, flashcard out. Registra la llamada, guarda el estado y pasa al siguiente lead con fricción mínima."
        right={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-signal/30 bg-signal/10 px-4 py-2.5 text-sm text-ice hover:bg-signal/15">
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

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="glass rounded-lg p-5 sm:p-7">
          {activeLead ? (
            <div>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-slate-500">
                  Lead {index + 1} / {leads.length}
                </div>
                <div className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-400">{activeLead.status}</div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/30 p-6 sm:p-8">
                <h3 className="text-3xl font-semibold tracking-normal text-white">{activeLead.business_name}</h3>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <LeadField label="Phone" value={activeLead.phone || 'No phone'} strong />
                  <LeadField label="City" value={activeLead.city || 'Unknown'} />
                  <LeadField label="Niche" value={activeLead.niche || 'Unclassified'} />
                  <LeadField label="Instagram" value={activeLead.instagram || 'None'} />
                </div>
                <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">Notes</div>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-300">{activeLead.notes || 'No notes loaded.'}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto_auto]">
                <button className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-300 hover:border-signal/30 hover:text-white" onClick={() => setIndex(Math.max(index - 1, 0))}>
                  <ArrowLeft className="mr-2 inline" size={16} />
                  Previous
                </button>
                <button className="rounded-lg border border-white/10 px-4 py-3 text-sm text-slate-300 hover:border-signal/30 hover:text-white" onClick={() => setIndex(Math.min(index + 1, leads.length - 1))}>
                  Next
                  <ArrowRight className="ml-2 inline" size={16} />
                </button>
                <button className="rounded-lg border border-white/10 p-3 text-slate-300 hover:border-signal/30 hover:text-white" onClick={copyPhone} title="Copy phone">
                  <Clipboard size={17} />
                </button>
                <button className="rounded-lg border border-white/10 p-3 text-slate-300 hover:border-signal/30 hover:text-white" onClick={openWhatsApp} title="Open WhatsApp">
                  <MessageCircle size={17} />
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-5">
                {outcomes.map((outcome) => (
                  <button key={outcome.id} onClick={() => log(outcome.id)} className="rounded-lg border border-signal/20 bg-signal/[0.08] px-3 py-3 text-sm text-ice hover:bg-signal/15">
                    {outcome.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex min-h-[520px] items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.02] text-center">
              <div>
                <div className="text-lg font-medium text-white">No leads loaded</div>
                <p className="mt-2 text-sm text-slate-400">Import a CSV with business_name, phone, city, niche, instagram, notes.</p>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="glass rounded-lg p-5">
            <h3 className="font-medium text-white">Follow-up</h3>
            <div className="mt-4 space-y-3">
              <input className="field" type="datetime-local" value={nextCallAt} onChange={(e) => setNextCallAt(e.target.value)} />
              <textarea className="field min-h-28 resize-none" placeholder="Call note" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>

          {activeLead ? (
            <div className="glass rounded-lg p-5">
              <h3 className="font-medium text-white">Lead state</h3>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <Row label="Attempts" value={activeLead.call_count} />
                <Row label="Last call" value={activeLead.last_call_at ? new Date(activeLead.last_call_at).toLocaleString() : 'None'} />
                <Row label="Next call" value={activeLead.next_call_at ? new Date(activeLead.next_call_at).toLocaleString() : 'None'} />
              </div>
              <textarea
                className="field mt-4 min-h-24 resize-none"
                value={activeLead.notes || ''}
                onChange={(e) => onUpdateLead(activeLead.id, { notes: e.target.value })}
              />
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function LeadField({ label, value, strong }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.025] p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className={`mt-2 break-words ${strong ? 'metric text-xl text-ice' : 'text-sm text-slate-200'}`}>{value}</div>
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
