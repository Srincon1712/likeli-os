import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header, StatCard } from './Shell.jsx';

const filters = [
  { id: 'all', label: 'Todos' },
  { id: 'no_answer', label: 'No contesto' },
  { id: 'interested', label: 'Interesado' },
  { id: 'callback', label: 'Callback' },
  { id: 'closed', label: 'Cerrado' },
  { id: 'dead', label: 'Muerto' }
];

export function LeadDatabase({ leads, onDeleteLead, onDeleteAllLeads }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const metrics = useMemo(() => {
    return leads.reduce(
      (acc, lead) => {
        acc.total += 1;
        if (lead.status === 'interested') acc.interested += 1;
        if (lead.status === 'callback') acc.callbacks += 1;
        if (lead.status === 'closed') acc.closed += 1;
        if (lead.status === 'dead') acc.dead += 1;
        return acc;
      },
      { total: 0, interested: 0, callbacks: 0, closed: 0, dead: 0 }
    );
  }, [leads]);

  const visibleLeads = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesFilter = filter === 'all' || lead.status === filter;
      const matchesQuery = !needle || [lead.business_name, lead.phone, lead.city, lead.niche].some((value) => String(value || '').toLowerCase().includes(needle));
      return matchesFilter && matchesQuery;
    });
  }, [leads, query, filter]);

  async function deleteLead(lead) {
    const confirmed = window.confirm(`Delete lead "${lead.business_name}"? This cannot be undone.`);
    if (!confirmed) return;
    await onDeleteLead(lead.id);
  }

  async function deleteAll() {
    const confirmation = window.prompt('Type DELETE ALL LEADS to permanently delete every lead.');
    if (confirmation !== 'DELETE ALL LEADS') return;
    await onDeleteAllLeads();
  }

  return (
    <section>
      <Header
        eyebrow="Likeli / Admin"
        title="Lead Database"
        description="Base operativa de leads importados. Busca, filtra y limpia SQLite sin tocar objetivos ni otros modulos."
        right={
          <button
            onClick={deleteAll}
            disabled={!leads.length}
            className="inline-flex items-center gap-2 rounded-lg border border-red-400/25 bg-red-400/10 px-4 py-2.5 text-sm text-red-200 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Delete All Leads
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total leads" value={metrics.total} detail="stored in SQLite" />
        <StatCard label="Interesados" value={metrics.interested} detail="active signals" />
        <StatCard label="Callbacks" value={metrics.callbacks} detail="follow-up queue" />
        <StatCard label="Cerrados" value={metrics.closed} detail="won clients" />
        <StatCard label="Muertos" value={metrics.dead} detail="removed from motion" />
      </div>

      <div className="glass mt-5 rounded-lg p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              className="field pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, city, niche"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 xl:pb-0">
            {filters.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`min-w-fit rounded-lg border px-3 py-2 text-sm ${
                  filter === item.id
                    ? 'border-signal/30 bg-signal/10 text-ice'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
          <div className="max-h-[68vh] overflow-auto">
            <table className="min-w-[1180px] w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-carbon/95 backdrop-blur">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <Th>Business</Th>
                  <Th>Phone</Th>
                  <Th>City</Th>
                  <Th>Niche</Th>
                  <Th>Instagram</Th>
                  <Th>Website</Th>
                  <Th>Status</Th>
                  <Th>Calls</Th>
                  <Th>Last call</Th>
                  <Th>Next follow-up</Th>
                  <Th>Created</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/[0.06] text-slate-300 transition-colors hover:bg-signal/[0.04]">
                    <Td strong>{lead.business_name}</Td>
                    <Td mono>{lead.phone || '-'}</Td>
                    <Td>{lead.city || '-'}</Td>
                    <Td>{lead.niche || '-'}</Td>
                    <Td>{lead.instagram || '-'}</Td>
                    <Td>
                      {lead.website ? (
                        <a href={normalizeUrl(lead.website)} target="_blank" rel="noreferrer" className="text-ice hover:text-white">
                          {lead.website}
                        </a>
                      ) : (
                        '-'
                      )}
                    </Td>
                    <Td>
                      <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs text-slate-300">{formatStatus(lead.status)}</span>
                    </Td>
                    <Td mono>{lead.call_count || 0}</Td>
                    <Td>{formatDate(lead.last_call_at)}</Td>
                    <Td>{formatDate(lead.next_call_at)}</Td>
                    <Td>{formatDate(lead.created_at)}</Td>
                    <Td>
                      <button
                        onClick={() => deleteLead(lead)}
                        className="rounded-md border border-white/10 p-2 text-slate-500 hover:border-red-400/30 hover:text-red-300"
                        title="Delete lead"
                      >
                        <Trash2 size={15} />
                      </button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!visibleLeads.length ? (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                No leads match the current search.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Th({ children }) {
  return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>;
}

function Td({ children, strong, mono }) {
  return (
    <td className={`max-w-[220px] whitespace-nowrap px-4 py-3 ${strong ? 'font-medium text-white' : ''} ${mono ? 'metric text-slate-200' : ''}`}>
      <div className="overflow-hidden text-ellipsis">{children}</div>
    </td>
  );
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function formatStatus(status) {
  const labels = {
    new: 'Nuevo',
    no_answer: 'No contesto',
    interested: 'Interesado',
    callback: 'Callback',
    closed: 'Cerrado',
    dead: 'Muerto'
  };
  return labels[status] || status || 'Nuevo';
}

function normalizeUrl(value) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
