import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Header, StatCard } from './Shell.jsx';
import { formatDate, SmallTable } from './osUtils.jsx';

const initial = {
  metric_date: new Date().toISOString().slice(0, 10),
  sleep_hours: '',
  exercise_minutes: '',
  reading_minutes: '',
  weight: '',
  energy: '',
  productivity: '',
  nutrition: '',
  social_minutes: '',
  notes: ''
};

export function PersonalAnalytics({ records, analytics, onCreate }) {
  const [form, setForm] = useState(initial);
  const ordered = [...records].reverse();

  async function submit(event) {
    event.preventDefault();
    await onCreate(form);
    setForm(initial);
  }

  return (
    <section>
      <Header eyebrow="Likeli / Personal" title="Analiticas Personales" description="Sueno, ejercicio, lectura, peso, energia, productividad, nutricion y redes. Independiente del CRM." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sueno promedio" value={`${analytics?.personal?.averageSleep || 0}h`} detail="ultimos registros" />
        <StatCard label="Energia" value={`${analytics?.personal?.averageEnergy || 0}/10`} detail="promedio reciente" />
        <StatCard label="Productividad" value={`${analytics?.personal?.averageProductivity || 0}/10`} detail="promedio reciente" />
        <StatCard label="Registros" value={records.length} detail="historial personal" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><Plus size={18} className="text-signal" /><h3 className="font-medium">Nuevo registro</h3></div>
          <div className="space-y-2.5">
            <input className="field" type="date" value={form.metric_date} onChange={(e) => setForm({ ...form, metric_date: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="field" type="number" step="0.1" placeholder="Sueno h" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} />
              <input className="field" type="number" placeholder="Ejercicio min" value={form.exercise_minutes} onChange={(e) => setForm({ ...form, exercise_minutes: e.target.value })} />
              <input className="field" type="number" placeholder="Lectura min" value={form.reading_minutes} onChange={(e) => setForm({ ...form, reading_minutes: e.target.value })} />
              <input className="field" type="number" step="0.1" placeholder="Peso" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
              <input className="field" type="number" min="0" max="10" placeholder="Energia 0-10" value={form.energy} onChange={(e) => setForm({ ...form, energy: e.target.value })} />
              <input className="field" type="number" min="0" max="10" placeholder="Productividad 0-10" value={form.productivity} onChange={(e) => setForm({ ...form, productivity: e.target.value })} />
              <input className="field" type="number" placeholder="Redes min" value={form.social_minutes} onChange={(e) => setForm({ ...form, social_minutes: e.target.value })} />
              <input className="field" placeholder="Nutricion" value={form.nutrition} onChange={(e) => setForm({ ...form, nutrition: e.target.value })} />
            </div>
            <textarea className="field min-h-20 resize-none" placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="ui-button w-full border border-signal/30 bg-signal/[0.12] font-medium text-ice">Guardar</button>
          </div>
        </form>

        <div className="min-w-0 space-y-4">
          <div className="glass rounded-lg p-4">
            <h3 className="mb-4 font-medium text-white">Energia y productividad</h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordered} margin={{ top: 5, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="rgba(148,163,184,0.1)" vertical={false} />
                  <XAxis dataKey="metric_date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: '#0b0f14', border: '1px solid rgba(148,163,184,0.18)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="energy" stroke="#72d5ff" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="productivity" stroke="#b9f7ff" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="glass rounded-lg p-3">
            <SmallTable rows={records} columns={[
              { key: 'metric_date', label: 'Fecha', render: (row) => formatDate(row.metric_date) },
              { key: 'sleep_hours', label: 'Sueno' },
              { key: 'exercise_minutes', label: 'Ejercicio' },
              { key: 'reading_minutes', label: 'Lectura' },
              { key: 'weight', label: 'Peso' },
              { key: 'energy', label: 'Energia' },
              { key: 'productivity', label: 'Productividad' },
              { key: 'social_minutes', label: 'Redes' }
            ]} />
          </div>
        </div>
      </div>
    </section>
  );
}
