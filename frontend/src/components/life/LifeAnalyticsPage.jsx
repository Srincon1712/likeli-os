import { formatDisplayDate, formatTrend, getModuleAnalytics } from '../../lib/lifeDailyCompliance.js';

export function LifeAnalyticsPage({ records, moduleId }) {
  const analytics = getModuleAnalytics(records, moduleId);

  return (
    <section>
      <div className="mb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">Analíticas</div>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-normal text-white">{analytics.title}</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Promedio" value={analytics.average} />
        <MetricCard label="Cumplimiento" value={`${analytics.compliance}%`} />
        <MetricCard label="Mejor día" value={analytics.bestDay?.score ?? 0} detail={analytics.bestDay ? formatDisplayDate(analytics.bestDay.date) : 'Sin datos'} />
        <MetricCard label="Peor día" value={analytics.worstDay?.score ?? 0} detail={analytics.worstDay ? formatDisplayDate(analytics.worstDay.date) : 'Sin datos'} />
        <MetricCard label="Evolución semanal" value={analytics.weeklyScore} />
        <MetricCard label="Evolución mensual" value={analytics.monthlyScore} />
        <MetricCard label="Tendencia" value={formatTrend(analytics.trend)} />
        <MetricCard label="Registros" value={analytics.rows.length} />
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
          <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/45">Evolución diaria</div>
          {analytics.dailyEvolution.length ? (
            <div className="space-y-2">
              {analytics.dailyEvolution.map((row) => (
                <div key={row.date} className="grid grid-cols-[86px_minmax(0,1fr)_48px] items-center gap-3">
                  <div className="text-xs text-emerald-100/50">{formatDisplayDate(row.date)}</div>
                  <div className="h-2 overflow-hidden rounded-full bg-emerald-100/10">
                    <div className="h-full rounded-full bg-emerald-300" style={{ width: `${row.percentage}%` }} />
                  </div>
                  <div className="text-right text-xs font-mono text-emerald-50">{row.score}</div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        <div className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
          <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/45">Distribucion</div>
          <DistributionRow label="Ideal" value={analytics.distribution.ideal} />
          <DistributionRow label="Mínimo" value={analytics.distribution.minimum} />
          <DistributionRow label="No cumplido" value={analytics.distribution.notMet} />
        </div>
      </div>

      <div className="mt-3 rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/45">Detalle por registro</div>
        {analytics.rows.length ? (
          <div className="space-y-2">
            {analytics.rows.map((row) => (
              <div key={row.date} className="rounded-md border border-emerald-100/8 bg-black/10 p-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium text-white">{formatDisplayDate(row.date)}</div>
                  <div className="text-sm font-mono text-emerald-100">{row.score}/{row.maxScore}</div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {row.fields.map((field) => (
                    <div key={field.id} className="flex min-w-0 justify-between gap-3 text-xs">
                      <span className="truncate text-emerald-100/65">{field.label}</span>
                      <span className="shrink-0 text-emerald-100/45">{field.displayValue} · {field.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
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

function DistributionRow({ label, value }) {
  return (
    <div className="mb-2 flex items-center justify-between rounded-md border border-emerald-100/8 bg-black/10 px-2.5 py-2">
      <span className="text-sm text-emerald-100/70">{label}</span>
      <span className="font-mono text-sm text-white">{value}</span>
    </div>
  );
}

function EmptyState() {
  return <div className="rounded-md border border-emerald-100/8 bg-black/10 p-3 text-sm text-emerald-100/55">Sin registros diarios.</div>;
}
