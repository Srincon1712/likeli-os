import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Header, StatCard } from './Shell.jsx';
import { formatDate, money, SmallTable } from './osUtils.jsx';

const initial = { type: 'income', category: '', amount: '', record_date: new Date().toISOString().slice(0, 10), notes: '' };

export function Finance({ records, analytics, onCreate }) {
  const [form, setForm] = useState(initial);
  const finance = analytics?.finance || {};

  async function submit(event) {
    event.preventDefault();
    if (!form.amount) return;
    await onCreate(form);
    setForm(initial);
  }

  return (
    <section>
      <Header eyebrow="Likeli / Finance" title="Finanzas" description="Ingresos, gastos, caja, cash flow, MRR, ARR, burn rate y runway." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Ingresos" value={money(finance.income)} detail="mes actual" />
        <StatCard label="Gastos" value={money(finance.expenses)} detail="mes actual" />
        <StatCard label="Caja" value={money(finance.cash)} detail="saldo historico" />
        <StatCard label="Cash Flow" value={money(finance.cashFlow)} detail="ingresos - gastos" />
        <StatCard label="MRR" value={money(finance.mrr)} detail="manual por ahora" />
        <StatCard label="ARR" value={money(finance.arr)} detail="MRR x 12" />
        <StatCard label="Burn Rate" value={money(finance.burnRate)} detail="gasto mensual" />
        <StatCard label="Runway" value={finance.runway || 'n/a'} detail="meses estimados" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <form onSubmit={submit} className="glass rounded-lg p-4">
          <div className="mb-3 flex items-center gap-2"><Plus size={18} className="text-signal" /><h3 className="font-medium">Nuevo movimiento</h3></div>
          <div className="space-y-2.5">
            <select className="field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
            <input className="field" placeholder="Categoria" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="field" type="number" placeholder="Monto" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="field" type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} />
            <textarea className="field min-h-20 resize-none" placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="ui-button w-full border border-signal/30 bg-signal/[0.12] font-medium text-ice">Guardar</button>
          </div>
        </form>
        <div className="glass min-w-0 rounded-lg p-3">
          <SmallTable rows={records} columns={[
            { key: 'type', label: 'Tipo', render: (row) => row.type === 'income' ? 'Ingreso' : 'Gasto' },
            { key: 'category', label: 'Categoria' },
            { key: 'amount', label: 'Monto', render: (row) => money(row.amount) },
            { key: 'record_date', label: 'Fecha', render: (row) => formatDate(row.record_date) },
            { key: 'notes', label: 'Notas' }
          ]} />
        </div>
      </div>
    </section>
  );
}
