import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Header, StatCard } from './Shell.jsx';
import { formatDate, leadStatuses, money, pipelineStages, SmallTable, statusLabel } from './osUtils.jsx';

const initialLead = {
  business_name: '',
  company: '',
  sector: '',
  city: '',
  website: '',
  social_links: '',
  contact_name: '',
  contact_role: '',
  phone: '',
  whatsapp: '',
  email: '',
  status: 'new',
  priority: 'medium',
  pipeline_stage: 'Lead',
  budget: '',
  probability: '',
  next_follow_up_at: '',
  notes: '',
  objections: ''
};

export function CRM({ leads, onCreateLead, onUpdateLead }) {
  const [form, setForm] = useState(initialLead);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((lead) =>
      [lead.business_name, lead.company, lead.contact_name, lead.phone, lead.email, lead.city, lead.sector, lead.niche]
        .some((value) => String(value || '').toLowerCase().includes(needle))
    );
  }, [leads, query]);

  const metrics = useMemo(() => ({
    total: leads.length,
    interested: leads.filter((lead) => ['interested', 'meeting', 'proposal'].includes(lead.status)).length,
    won: leads.filter((lead) => ['closed', 'sale'].includes(lead.status)).length,
    forecast: leads.reduce((sum, lead) => sum + Number(lead.revenue_value || lead.budget || 0) * (Number(lead.probability || 0) / 100), 0)
  }), [leads]);

  async function submit(event) {
    event.preventDefault();
    if (!form.business_name.trim() && !form.company.trim()) return;
    await onCreateLead({
      ...form,
      business_name: form.business_name || form.company,
      company: form.company || form.business_name,
      niche: form.sector,
      instagram: form.social_links,
      revenue_value: form.budget
    });
    setForm(initialLead);
  }

  return (
    <section>
      <Header eyebrow="Likeli / CRM" title="CRM" description="Empresas, contactos, estado comercial, presupuesto y proximos seguimientos." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Empresas" value={metrics.total} detail="base comercial" />
        <StatCard label="Interesadas" value={metrics.interested} detail="senales activas" />
        <StatCard label="Ganadas" value={metrics.won} detail="clientes cerrados" />
        <StatCard label="Forecast" value={money(metrics.forecast)} detail="ponderado por probabilidad" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2">
            <Plus size={18} className="text-signal" />
            <h3 className="font-medium">Nueva empresa</h3>
          </div>
          <div className="space-y-2.5">
            <input className="field" placeholder="Nombre / empresa" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field" placeholder="Sector" value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} />
              <input className="field" placeholder="Ciudad" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <input className="field" placeholder="Web" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            <input className="field" placeholder="Redes" value={form.social_links} onChange={(e) => setForm({ ...form, social_links: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field" placeholder="Contacto" value={form.contact_name} onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
              <input className="field" placeholder="Cargo" value={form.contact_role} onChange={(e) => setForm({ ...form, contact_role: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" placeholder="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="field" placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
            </div>
            <input className="field" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {leadStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
              </select>
              <select className="field" value={form.pipeline_stage} onChange={(e) => setForm({ ...form, pipeline_stage: e.target.value })}>
                {pipelineStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" type="number" placeholder="Presupuesto" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
              <input className="field" type="number" placeholder="Probabilidad %" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} />
            </div>
            <input className="field" type="datetime-local" value={form.next_follow_up_at} onChange={(e) => setForm({ ...form, next_follow_up_at: e.target.value })} />
            <textarea className="field min-h-20 resize-none" placeholder="Notas y objeciones" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="ui-button w-full border border-signal/30 bg-signal/[0.12] font-medium text-ice hover:bg-signal/[0.18]">Crear lead</button>
          </div>
        </form>

        <div className="glass min-w-0 rounded-lg p-3">
          <input className="field mb-3" placeholder="Buscar por empresa, contacto, telefono, ciudad..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <SmallTable
            rows={visible}
            columns={[
              { key: 'business_name', label: 'Empresa' },
              { key: 'contact_name', label: 'Contacto' },
              { key: 'phone', label: 'Telefono' },
              { key: 'status', label: 'Estado', render: (lead) => <EditableSelect value={lead.status} options={leadStatuses} labeler={statusLabel} onChange={(status) => onUpdateLead(lead.id, { status })} /> },
              { key: 'pipeline_stage', label: 'Pipeline', render: (lead) => <EditableSelect value={lead.pipeline_stage || 'Lead'} options={pipelineStages} onChange={(pipeline_stage) => onUpdateLead(lead.id, { pipeline_stage })} /> },
              { key: 'budget', label: 'Budget', render: (lead) => money(lead.budget || lead.revenue_value) },
              { key: 'next_follow_up_at', label: 'Seguimiento', render: (lead) => formatDate(lead.next_follow_up_at || lead.next_call_at) }
            ]}
          />
        </div>
      </div>
    </section>
  );
}

export function CommercialPipeline({ leads, analytics, onUpdateLead }) {
  const grouped = pipelineStages.map((stage) => ({
    stage,
    leads: leads.filter((lead) => (lead.pipeline_stage || 'Lead') === stage)
  }));

  return (
    <section>
      <Header eyebrow="Likeli / Pipeline" title="Gestion Comercial" description="Kanban comercial con forecast por etapa." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pipeline total" value={money((analytics?.pipeline || []).reduce((sum, item) => sum + Number(item.value || 0), 0))} detail="valor bruto" />
        <StatCard label="Ganado" value={grouped.find((item) => item.stage === 'Ganado')?.leads.length || 0} detail="cierres" />
        <StatCard label="Propuestas" value={grouped.find((item) => item.stage === 'Propuesta')?.leads.length || 0} detail="en evaluacion" />
        <StatCard label="Negociacion" value={grouped.find((item) => item.stage === 'Negociacion')?.leads.length || 0} detail="alta intencion" />
      </div>
      <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
        {grouped.map((column) => (
          <div key={column.stage} className="glass min-h-[260px] min-w-0 rounded-lg p-3">
            <div className="mb-2.5 flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">{column.stage}</h3>
              <span className="metric text-xs text-slate-500">{column.leads.length}</span>
            </div>
            <div className="space-y-2">
              {column.leads.slice(0, 12).map((lead) => (
                <article key={lead.id} className="rounded-md border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="truncate text-sm font-medium text-white">{lead.business_name}</div>
                  <div className="mt-1 text-xs text-slate-400">{money(lead.revenue_value || lead.budget)} - {lead.probability || 0}%</div>
                  <select className="field mt-2 py-1.5 text-xs" value={lead.pipeline_stage || 'Lead'} onChange={(e) => onUpdateLead(lead.id, { pipeline_stage: e.target.value })}>
                    {pipelineStages.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditableSelect({ value, options, onChange, labeler = (value) => value }) {
  return (
    <select className="field py-1.5 text-xs" value={value || options[0]} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => <option key={option} value={option}>{labeler(option)}</option>)}
    </select>
  );
}
