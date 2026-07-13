import { BarChart3, BookOpen, Brain, BriefcaseBusiness, Building2, CalendarCheck, Crosshair, Database, Droplets, Dumbbell, HeartPulse, LayoutDashboard, LineChart, Moon, PenLine, PiggyBank, Sparkles, Table2, Target } from 'lucide-react';
import { LIFE_NAV_ITEMS } from '../lib/lifeDailyCompliance.js';

const groups = [
  {
    label: 'Command',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'ceo', label: 'CEO', icon: BriefcaseBusiness }
    ]
  },
  {
    label: 'Revenue',
    items: [
      { id: 'crm', label: 'CRM', icon: Building2 },
      { id: 'calls', label: 'Cold Calling', icon: Crosshair },
      { id: 'sales-analytics', label: 'Sales Analytics', icon: BarChart3 },
      { id: 'pipeline', label: 'Pipeline', icon: LineChart },
      { id: 'finance', label: 'Finance', icon: PiggyBank }
    ]
  },
  {
    label: 'Operating',
    items: [
      { id: 'productivity', label: 'Productivity', icon: CalendarCheck },
      { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
      { id: 'personal', label: 'Personal', icon: HeartPulse },
      { id: 'objectives', label: 'Objectives', icon: Target },
      { id: 'lead-database', label: 'Databases', icon: Table2 }
    ]
  }
];

const lifeIcons = {
  dashboard: LayoutDashboard,
  'daily-compliance': CalendarCheck,
  training: Dumbbell,
  sleep: Moon,
  reading: BookOpen,
  writing: PenLine,
  meditation: Brain,
  water: Droplets,
  productivity: Crosshair,
  planning: Target,
  learning: Sparkles,
  analytics: BarChart3
};

export function Shell({ activeView, onViewChange, children, health, currentOS = 'likeli', onToggleOS, lifeActiveView = 'dashboard', onLifeViewChange }) {
  const isLifeOS = currentOS === 'life';
  const lifeGroups = LIFE_NAV_ITEMS.reduce((itemsByGroup, item) => {
    itemsByGroup[item.group] = [...(itemsByGroup[item.group] || []), item];
    return itemsByGroup;
  }, {});

  return (
    <div className={`min-h-screen overflow-x-hidden text-slate-50 ${isLifeOS ? 'bg-[#10140f]' : 'bg-void'}`}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[232px_minmax(0,1fr)]">
        <aside
          className={`border-b px-3 py-3 lg:border-b-0 lg:border-r lg:px-4 lg:py-5 ${
            isLifeOS ? 'border-emerald-100/10 bg-[#162017]' : 'border-white/10 bg-black/[0.28]'
          }`}
        >
          <div className="flex items-center justify-between gap-4 lg:block">
            <div>
              <h1 className={`${isLifeOS ? '' : 'mt-1.5'} text-xl font-semibold tracking-normal`}>
                <button type="button" onClick={onToggleOS} className="block bg-transparent p-0 text-left text-inherit hover:text-white">
                  {isLifeOS ? 'Life OS' : 'Likeli OS'}
                </button>
              </h1>
            </div>
          </div>

          {isLifeOS ? (
            <nav className="mt-5 space-y-5">
              {Object.entries(lifeGroups).map(([group, items]) => (
                <div key={group}>
                  <div className="mb-1 px-2 text-[10px] font-mono uppercase tracking-[0.16em] text-emerald-100/35">{group}</div>
                  <div className="space-y-1">
                    {items.map((item) => {
                      const Icon = lifeIcons[item.id] || LayoutDashboard;
                      const active = lifeActiveView === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => onLifeViewChange?.(item.id)}
                          className={`flex w-full min-w-0 items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] ${
                            active
                              ? 'border border-emerald-300/25 bg-emerald-300/12 text-white shadow-[0_0_30px_rgba(110,231,183,0.10)]'
                              : 'border border-transparent text-emerald-100/48 hover:border-emerald-100/10 hover:bg-emerald-100/[0.045] hover:text-emerald-50'
                          }`}
                        >
                          <Icon size={15} strokeWidth={1.9} className="shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          ) : (
            <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:mt-8 lg:block lg:space-y-5">
              {groups.map((group) => (
                <div key={group.label} className="min-w-0 lg:space-y-1">
                  <div className="mb-1 hidden px-2 text-[10px] font-mono uppercase tracking-[0.16em] text-slate-600 lg:block">{group.label}</div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = activeView === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`flex w-full min-w-0 items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] ${
                          active
                            ? 'border border-signal/20 bg-signal/[0.09] text-white shadow-glow'
                            : 'border border-transparent text-slate-400 hover:border-white/10 hover:bg-white/[0.035] hover:text-slate-100'
                        }`}
                      >
                        <Icon size={15} strokeWidth={1.9} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          )}

          {!isLifeOS ? (
            <div className="mt-7 hidden rounded-lg border border-white/10 bg-white/[0.025] p-3 lg:block">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500">
                <Database size={14} />
                Storage
              </div>
              <p className="mt-2 break-words text-[11px] leading-4 text-slate-500">
                {health?.database || 'Waiting for local database'}
              </p>
            </div>
          ) : null}
        </aside>

        <main className="min-w-0 overflow-x-hidden px-3 py-4 sm:px-5 lg:px-6 lg:py-5 xl:px-7">
          <div className="mx-auto w-full max-w-[1760px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function Header({ eyebrow, title, description, right }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-signal">{eyebrow}</div>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-normal text-white">{title}</h2>
        {description ? <p className="mt-1.5 max-w-3xl text-[13px] leading-5 text-slate-400">{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function StatCard({ label, value, detail }) {
  return (
    <div className="glass rounded-lg p-3">
      <div className="truncate text-[10px] uppercase tracking-[0.13em] text-slate-500">{label}</div>
      <div className="metric mt-2 truncate text-[1.35rem] leading-7 text-white">{value}</div>
      {detail ? <div className="mt-1 truncate text-[11px] text-slate-500">{detail}</div> : null}
    </div>
  );
}
