import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Header, StatCard } from './Shell.jsx';

export function Overview({ analytics }) {
  const calls = analytics?.calls || {};
  const objectives = analytics?.objectives || {};
  const byDay = calls.byDay?.length ? calls.byDay : [{ day: 'No data', calls: 0 }];

  return (
    <section>
      <Header
        eyebrow="Likeli / Command"
        title="Commercial Core"
        description="Estado vivo del sistema: objetivos, llamadas, conversiones y presión comercial."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total calls" value={calls.total || 0} detail="all logged outcomes" />
        <StatCard label="Conversion" value={`${calls.conversion || 0}%`} detail="closed per call" />
        <StatCard label="Objectives" value={`${objectives.overallProgress || 0}%`} detail="general progress" />
        <StatCard label="New leads" value={calls.newLeads || 0} detail="untouched queue" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="glass min-w-0 rounded-lg p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-white">Calls per day</h3>
            <span className="text-xs font-mono uppercase text-slate-500">30 day window</span>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay} margin={{ top: 10, right: 12, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="callsGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#72d5ff" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="#72d5ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0b0f14', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                <Area type="monotone" dataKey="calls" stroke="#72d5ff" strokeWidth={2} fill="url(#callsGlow)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-lg p-4">
          <h3 className="font-medium text-white">Calling analytics</h3>
          <div className="mt-4 space-y-3">
            <Bar label="Interested" value={calls.interested || 0} total={calls.total || 1} />
            <Bar label="Callbacks" value={calls.callbacks || 0} total={calls.total || 1} />
            <Bar label="Closed" value={calls.closed || 0} total={calls.total || 1} />
            <Bar label="Dead" value={calls.dead || 0} total={calls.total || 1} />
            <Bar label="No answer" value={calls.noAnswer || 0} total={calls.total || 1} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value, total }) {
  const width = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="metric text-slate-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full rounded-full bg-signal transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
