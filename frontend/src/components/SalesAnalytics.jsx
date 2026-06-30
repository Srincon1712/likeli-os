import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Header, StatCard } from './Shell.jsx';
import { money } from './osUtils.jsx';

export function SalesAnalytics({ analytics }) {
  const sales = analytics?.sales || {};
  const rates = sales.rates || {};
  const calls = analytics?.calls || {};

  return (
    <section>
      <Header eyebrow="Likeli / Analytics" title="Analiticas de Ventas" description="Funnel outbound, ratios de conversion y productividad del canal de llamadas." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Llamadas" value={calls.total || 0} detail="eventos registrados" />
        <StatCard label="Contact rate" value={`${rates.contactRate || 0}%`} detail="contactados / leads" />
        <StatCard label="Interested rate" value={`${rates.interestedRate || 0}%`} detail="interesados / contactados" />
        <StatCard label="Meeting rate" value={`${rates.meetingRate || 0}%`} detail="reuniones / interesados" />
        <StatCard label="Proposal rate" value={`${rates.proposalRate || 0}%`} detail="propuestas / reuniones" />
        <StatCard label="Close rate" value={`${rates.closeRate || 0}%`} detail="ventas / propuestas" />
        <StatCard label="Revenue" value={money(sales.revenue)} detail="mes actual" />
        <StatCard label="Duracion media" value={`${sales.averageDurationSeconds || 0}s`} detail="llamadas logueadas" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="glass min-w-0 rounded-lg p-4">
          <h3 className="mb-4 font-medium text-white">Funnel comercial</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sales.funnel || []} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="stage" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip contentStyle={{ background: '#0b0f14', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="#72d5ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-lg p-4">
          <h3 className="font-medium text-white">Cadencia</h3>
          <div className="mt-3 space-y-3">
            <Metric label="Llamadas / hora" value={sales.callsPerHour || 0} />
            <Metric label="Ventas por semana" value={sales.salesThisWeek || 0} />
            <Metric label="No contesta" value={calls.noAnswer || 0} />
            <Metric label="Callbacks" value={calls.callbacks || 0} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }) {
  return (
    <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="metric text-white">{value}</span>
    </div>
  );
}
