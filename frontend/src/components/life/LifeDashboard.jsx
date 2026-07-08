import { DAILY_COMPLIANCE_FIELDS, formatDisplayDate, formatTrend, getDashboardAnalytics } from '../../lib/lifeDailyCompliance.js';

export function LifeDashboard({ records }) {
  const analytics = getDashboardAnalytics(records);
  const latest = analytics.latest;

  return (
    <section>
      <div className="mb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">Life OS</div>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-normal text-white">Dashboard</h2>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-4">
          <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/45">Life Score del día</div>
          <div className="mt-3 flex items-end gap-3">
            <div className="text-6xl font-semibold leading-none text-white">{latest?.lifeScore ?? 0}</div>
            <div className="pb-2 text-sm text-emerald-100/55">/ {latest?.maxLifeScore ?? totalMaxScore()}</div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-emerald-100/10">
            <div className="h-full rounded-full bg-emerald-300" style={{ width: `${latest?.percentage || 0}%` }} />
          </div>
          <div className="mt-3 text-sm text-emerald-100/65">
            {latest ? `${formatDisplayDate(latest.date)} · ${latest.status}` : 'Sin registros diarios.'}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricCard label="Life Score semanal" value={analytics.weeklyScore} />
          <MetricCard label="Life Score mensual" value={analytics.monthlyScore} />
          <MetricCard label="Promedio semanal" value={analytics.weeklyAverage} />
          <MetricCard label="Promedio mensual" value={analytics.monthlyAverage} />
          <MetricCard label="Mejor día" value={analytics.bestDay?.lifeScore ?? 0} detail={analytics.bestDay ? formatDisplayDate(analytics.bestDay.date) : 'Sin datos'} />
          <MetricCard label="Peor día" value={analytics.worstDay?.lifeScore ?? 0} detail={analytics.worstDay ? formatDisplayDate(analytics.worstDay.date) : 'Sin datos'} />
          <MetricCard label="Tendencia" value={formatTrend(analytics.trend)} />
          <MetricCard label="Cumplimiento general" value={`${analytics.compliancePercentage}%`} />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/45">Resumen rápido</div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {analytics.activitySummary.map((item) => (
            <div key={item.id} className="rounded-md border border-emerald-100/8 bg-black/10 px-2.5 py-2">
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm text-emerald-50">{item.label}</span>
                <span className="text-xs text-emerald-100/55">{item.displayValue}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100/10">
                <div className="h-full rounded-full bg-emerald-300/80" style={{ width: `${item.maxScore ? Math.min(100, (item.score / item.maxScore) * 100) : 0}%` }} />
              </div>
              <div className="mt-1 text-[11px] text-emerald-100/45">{item.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <div className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
      <div className="truncate text-[10px] font-mono uppercase tracking-[0.13em] text-emerald-100/45">{label}</div>
      <div className="mt-2 truncate text-2xl font-semibold text-white">{value}</div>
      {detail ? <div className="mt-1 truncate text-xs text-emerald-100/45">{detail}</div> : null}
    </div>
  );
}

function totalMaxScore() {
  return DAILY_COMPLIANCE_FIELDS.reduce((total, field) => total + field.scoring.weight, 0);
}
