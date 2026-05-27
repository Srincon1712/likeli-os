import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Header, StatCard } from './Shell.jsx';

const initialForm = {
  title: '',
  description: '',
  category: 'Sales',
  target_value: '',
  current_value: '',
  deadline: '',
  status: 'active'
};

export function Objectives({ objectives, analytics, onCreate, onUpdate, onDelete }) {
  const [form, setForm] = useState(initialForm);

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    await onCreate(form);
    setForm(initialForm);
  }

  return (
    <section>
      <Header
        eyebrow="Likeli / Tracker"
        title="Objectives"
        description="Medibles, fríos y persistentes. Cada objetivo alimenta el estado operativo de Likeli."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Completed" value={analytics?.completed || 0} detail="objective locks" />
        <StatCard label="Overall progress" value={`${analytics?.overallProgress || 0}%`} detail="weighted average" />
        <StatCard label="This month" value={analytics?.monthlyCompleted || 0} detail="completed this month" />
        <StatCard label="Active" value={analytics?.active || 0} detail="currently running" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[380px_1fr]">
        <form onSubmit={submit} className="glass rounded-lg p-5">
          <div className="mb-4 flex items-center gap-2">
            <Plus size={18} className="text-signal" />
            <h3 className="font-medium">New objective</h3>
          </div>
          <div className="space-y-3">
            <input className="field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className="field min-h-24 resize-none" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="field" type="number" placeholder="Target" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
              <input className="field" type="number" placeholder="Current" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} />
            </div>
            <input className="field" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <button className="w-full rounded-lg border border-signal/30 bg-signal/[0.12] px-4 py-3 text-sm font-medium text-ice hover:bg-signal/[0.18]">
              Create objective
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {objectives.map((objective) => (
            <ObjectiveCard key={objective.id} objective={objective} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
          {!objectives.length ? <div className="glass rounded-lg p-8 text-center text-sm text-slate-400">No objectives yet.</div> : null}
        </div>
      </div>
    </section>
  );
}

function ObjectiveCard({ objective, onUpdate, onDelete }) {
  const progress = Math.min(100, objective.progress || 0);

  return (
    <article className="glass rounded-lg p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-medium text-white">{objective.title}</h3>
            <span className="rounded-md border border-white/10 px-2 py-1 text-[11px] uppercase text-slate-400">{objective.category}</span>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-400">{objective.description || 'No description'}</p>
        </div>
        <button onClick={() => onDelete(objective.id)} className="rounded-md border border-white/10 p-2 text-slate-500 hover:border-red-400/30 hover:text-red-300">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span className="metric">{objective.current_value} / {objective.target_value}</span>
          <span className="metric text-ice">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
          <div className="h-full rounded-full bg-signal shadow-[0_0_18px_rgba(114,213,255,0.45)] transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_120px]">
        <input
          className="field"
          type="number"
          value={objective.current_value}
          onChange={(e) => onUpdate(objective.id, { current_value: e.target.value })}
        />
        <input
          className="field"
          type="date"
          value={objective.deadline || ''}
          onChange={(e) => onUpdate(objective.id, { deadline: e.target.value })}
        />
        <select className="field" value={objective.status} onChange={(e) => onUpdate(objective.id, { status: e.target.value })}>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </article>
  );
}
