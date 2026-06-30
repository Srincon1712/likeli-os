import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Header, StatCard } from './Shell.jsx';
import { money } from './osUtils.jsx';

export function Dashboard({ analytics, leads, productivityItems }) {
  const calls = analytics?.calls || {};
  const finance = analytics?.finance || {};
  const objectives = analytics?.objectives || {};
  const productivity = analytics?.productivity || {};
  const today = new Date().toISOString().slice(0, 10);
  const callsToday = calls.byDay?.find((item) => item.day === today)?.calls || 0;
  const priorityTasks = productivityItems.filter((item) => item.status !== 'done' && item.priority === 'high').slice(0, 5);
  const followUps = leads.filter((lead) => lead.next_follow_up_at || lead.next_call_at).slice(0, 5);

  return (
    <section>
      <Header
        eyebrow="Likeli / Command Center"
        title="Dashboard"
        description="Resumen operativo del negocio: ventas, caja, llamadas, objetivos y foco diario."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos del mes" value={money(finance.income)} detail="registros financieros" />
        <StatCard label="Clientes activos" value={calls.closed || 0} detail="leads ganados" />
        <StatCard label="Caja" value={money(finance.cash)} detail="ingresos menos gastos" />
        <StatCard label="Llamadas hoy" value={callsToday} detail={`${calls.total || 0} historicas`} />
        <StatCard label="Reuniones" value={analytics?.sales?.funnel?.find((item) => item.stage === 'Reuniones')?.count || 0} detail="desde pipeline comercial" />
        <StatCard label="Tareas prioritarias" value={priorityTasks.length} detail={`${productivity.openTasks || 0} abiertas`} />
        <StatCard label="Pipeline" value={money((analytics?.pipeline || []).reduce((sum, item) => sum + Number(item.value || 0), 0))} detail="forecast potencial" />
        <StatCard label="Objetivos" value={`${objectives.overallProgress || 0}%`} detail="avance promedio" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="glass min-w-0 rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-white">Llamadas recientes</h3>
            <span className="text-xs font-mono uppercase text-slate-500">30 dias</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calls.byDay?.length ? calls.byDay : [{ day: 'Sin datos', calls: 0 }]} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0b0f14', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="calls" stroke="#72d5ff" strokeWidth={2} fill="rgba(114,213,255,0.18)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <aside className="space-y-4">
          <PanelList title="Seguimientos" items={followUps.map((lead) => `${lead.business_name} - ${lead.next_follow_up_at || lead.next_call_at}`)} />
          <PanelList title="Prioridades" items={priorityTasks.map((item) => item.title)} />
        </aside>
      </div>
    </section>
  );
}

export function CEODashboard({ analytics }) {
  const finance = analytics?.finance || {};
  const productivity = analytics?.productivity || {};

  return (
    <section>
      <Header
        eyebrow="Likeli / Strategy"
        title="CEO Dashboard"
        description="Vista ejecutiva para tomar decisiones: caja, pipeline, objetivos, horas y automatizacion."
      />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos" value={money(finance.income)} detail="mes actual" />
        <StatCard label="Clientes" value={analytics?.calls?.closed || 0} detail="ganados registrados" />
        <StatCard label="Pipeline" value={money((analytics?.pipeline || []).reduce((sum, item) => sum + Number(item.value || 0), 0))} detail="valor ponderable" />
        <StatCard label="Caja" value={money(finance.cash)} detail={`runway: ${finance.runway || 'n/a'} meses`} />
        <StatCard label="Objetivos" value={`${analytics?.objectives?.overallProgress || 0}%`} detail="avance promedio" />
        <StatCard label="Horas trabajadas" value={`${Math.round((productivity.deepWorkMinutes || 0) / 60)}h`} detail="deep work mensual" />
        <StatCard label="Automatizacion" value="Preparado" detail="estructura API y datos lista" />
        <StatCard label="Metricas generales" value={`${analytics?.calls?.responseRate || 0}%`} detail="contact response rate" />
      </div>

      <div className="glass mt-4 rounded-lg p-4">
        <h3 className="font-medium text-white">Lectura estrategica</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Insight label="Comercial" value={`${analytics?.sales?.rates?.closeRate || 0}% close rate`} />
          <Insight label="Finanzas" value={`${money(finance.cashFlow)} cash flow`} />
          <Insight label="Personal" value={`${analytics?.personal?.averageEnergy || 0}/10 energia`} />
        </div>
      </div>
    </section>
  );
}

function PanelList({ title, items }) {
  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-medium text-white">{title}</h3>
      <div className="mt-3 space-y-2">
        {items.length ? items.map((item) => <div key={item} className="truncate rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2 text-[13px] text-slate-300">{item}</div>) : <div className="text-sm text-slate-500">Sin datos pendientes.</div>}
      </div>
    </div>
  );
}

function Insight({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1.5 truncate text-base font-medium text-white">{value}</div>
    </div>
  );
}
