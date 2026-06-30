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
    const confirmation = window.prompt('Type DELETE STAGE LEADS to permanently delete every lead in this stage.');
    if (confirmation !== 'DELETE STAGE LEADS') return;
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
            className="ui-button border border-red-400/25 bg-red-400/10 text-red-200 hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
            Delete Stage Leads
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

      <div className="glass mt-4 rounded-lg p-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={17} />
            <input
              className="field pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, city, niche"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {filters.map((item) => (
              <button
                key={item.id}
                onClick={() => setFilter(item.id)}
                className={`rounded-md border px-2.5 py-1.5 text-xs ${
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

        <div className="mt-3 overflow-hidden rounded-lg border border-white/10">
          <div className="max-h-[68vh] overflow-y-auto overflow-x-hidden">
            <table className="data-table">
              <thead className="sticky top-0 z-10 bg-carbon/95 backdrop-blur">
                <tr className="border-b border-white/10">
                  <Th>Business</Th>
                  <Th>Phone</Th>
                  <Th className="hidden md:table-cell">City</Th>
                  <Th className="hidden lg:table-cell">Niche</Th>
                  <Th className="hidden 2xl:table-cell">Instagram</Th>
                  <Th className="hidden xl:table-cell">Website</Th>
                  <Th>Status</Th>
                  <Th className="hidden sm:table-cell">Calls</Th>
                  <Th className="hidden xl:table-cell">Last call</Th>
                  <Th className="hidden lg:table-cell">Next</Th>
                  <Th className="hidden 2xl:table-cell">Created</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {visibleLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-white/[0.06] text-slate-300 transition-colors hover:bg-signal/[0.04]">
                    <Td strong>{lead.business_name}</Td>
                    <Td mono>{lead.phone || '-'}</Td>
                    <Td className="hidden md:table-cell">{lead.city || '-'}</Td>
                    <Td className="hidden lg:table-cell">{lead.niche || '-'}</Td>
                    <Td className="hidden 2xl:table-cell">{lead.instagram || '-'}</Td>
                    <Td className="hidden xl:table-cell">
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
                    <Td className="hidden sm:table-cell" mono>{lead.call_count || 0}</Td>
                    <Td className="hidden xl:table-cell">{formatDate(lead.last_call_at)}</Td>
                    <Td className="hidden lg:table-cell">{formatDate(lead.next_call_at)}</Td>
                    <Td className="hidden 2xl:table-cell">{formatDate(lead.created_at)}</Td>
                    <Td>
                      <button
                        onClick={() => deleteLead(lead)}
                        className="ui-icon-button border border-white/10 text-slate-500 hover:border-red-400/30 hover:text-red-300"
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

function Th({ children, className = '' }) {
  return <th className={className}>{children}</th>;
}

function Td({ children, strong, mono, className = '' }) {
  return (
    <td className={`${className} ${strong ? 'font-medium text-white' : ''} ${mono ? 'metric text-slate-200' : ''}`}>
      <div className="truncate-cell">{children}</div>
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
