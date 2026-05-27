import { Crosshair, Database, LineChart, Table2, Target } from 'lucide-react';

const items = [
  { id: 'overview', label: 'Overview', icon: LineChart },
  { id: 'objectives', label: 'Objectives', icon: Target },
  { id: 'calls', label: 'Cold Calling', icon: Crosshair },
  { id: 'lead-database', label: 'Lead Database', icon: Table2 }
];

export function Shell({ activeView, onViewChange, children, health }) {
  return (
    <div className="min-h-screen bg-void text-slate-50">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-white/10 bg-black/[0.35] px-4 py-4 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.24em] text-signal">Private System</div>
              <h1 className="mt-2 text-2xl font-semibold tracking-normal">Likeli OS</h1>
            </div>
            <div className="hidden rounded-md border border-signal/20 bg-signal/5 px-2.5 py-1 text-[11px] font-mono text-ice lg:inline-flex">
              LOCAL
            </div>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto lg:mt-10 lg:block lg:space-y-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex min-w-fit items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                    active
                      ? 'border border-signal/25 bg-signal/10 text-white shadow-glow'
                      : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.04] hover:text-slate-100'
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 lg:block">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500">
              <Database size={14} />
              Storage
            </div>
            <p className="mt-3 break-words text-xs leading-5 text-slate-400">
              {health?.database || 'Waiting for local database'}
            </p>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}

export function Header({ eyebrow, title, description, right }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-signal">{eyebrow}</div>
        <h2 className="mt-2 text-3xl font-semibold tracking-normal text-white">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function StatCard({ label, value, detail }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="metric mt-3 text-3xl text-white">{value}</div>
      {detail ? <div className="mt-2 text-xs text-slate-400">{detail}</div> : null}
    </div>
  );
}
