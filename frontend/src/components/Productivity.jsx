import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Header, StatCard } from './Shell.jsx';
import { Objectives } from './Objectives.jsx';
import { formatDate, SmallTable } from './osUtils.jsx';

const initial = { type: 'task', title: '', status: 'open', priority: 'medium', project: '', due_date: '', minutes: '', notes: '' };

export function Productivity({ items, analytics, objectives, objectiveAnalytics, onCreate, onUpdate, objectiveActions }) {
  const [form, setForm] = useState(initial);

  async function submit(event) {
    event.preventDefault();
    if (!form.title.trim()) return;
    await onCreate(form);
    setForm(initial);
  }

  return (
    <section>
      <Header eyebrow="Likeli / Productivity" title="Productividad" description="Inbox, tareas, proyectos, calendario, prioridades, time tracking, deep work y objetivos." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inbox" value={items.filter((item) => item.type === 'inbox' && item.status !== 'done').length} detail="capturas abiertas" />
        <StatCard label="Tareas" value={items.filter((item) => item.type === 'task' && item.status !== 'done').length} detail="pendientes" />
        <StatCard label="Deep work" value={`${Math.round((analytics?.productivity?.deepWorkMinutes || 0) / 60)}h`} detail="mes actual" />
        <StatCard label="Objetivos" value={`${objectiveAnalytics?.overallProgress || 0}%`} detail="reutiliza Objectives" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><Plus size={18} className="text-signal" /><h3 className="font-medium">Nuevo item</h3></div>
          <div className="space-y-2.5">
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="inbox">Inbox</option>
              <option value="task">Tarea</option>
              <option value="project">Proyecto</option>
              <option value="calendar">Calendario</option>
              <option value="deep_work">Deep work</option>
              <option value="habit">Habito</option>
            </select>
            <input className="field" placeholder="Titulo" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="field" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
              <select className="field" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="open">Abierta</option>
                <option value="doing">En curso</option>
                <option value="done">Hecha</option>
              </select>
            </div>
            <input className="field" placeholder="Proyecto" value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <input className="field" type="number" placeholder="Minutos" value={form.minutes} onChange={(e) => setForm({ ...form, minutes: e.target.value })} />
            </div>
            <textarea className="field min-h-20 resize-none" placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="ui-button w-full border border-signal/30 bg-signal/[0.12] font-medium text-ice">Guardar</button>
          </div>
        </form>
        <div className="glass min-w-0 rounded-lg p-3">
          <SmallTable rows={items} columns={[
            { key: 'type', label: 'Tipo' },
            { key: 'title', label: 'Titulo' },
            { key: 'priority', label: 'Prioridad' },
            { key: 'status', label: 'Estado', render: (row) => <select className="field py-1.5 text-xs" value={row.status} onChange={(e) => onUpdate(row.id, { status: e.target.value })}><option value="open">Abierta</option><option value="doing">En curso</option><option value="done">Hecha</option></select> },
            { key: 'project', label: 'Proyecto' },
            { key: 'due_date', label: 'Fecha', render: (row) => formatDate(row.due_date) },
            { key: 'minutes', label: 'Min' }
          ]} />
        </div>
      </div>

      <div className="mt-6">
        <Objectives
          objectives={objectives}
          analytics={objectiveAnalytics}
          onCreate={objectiveActions.onCreate}
          onUpdate={objectiveActions.onUpdate}
          onDelete={objectiveActions.onDelete}
        />
      </div>
    </section>
  );
}
