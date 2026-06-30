export const leadStatuses = [
  'new',
  'researching',
  'called',
  'no_answer',
  'callback',
  'interested',
  'meeting',
  'proposal',
  'closed',
  'lost',
  'wrong_number',
  'not_interested'
];

export const pipelineStages = ['Lead', 'Contacto', 'Interesado', 'Demo', 'Propuesta', 'Negociacion', 'Ganado', 'Perdido'];

export function money(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export function statusLabel(value) {
  const labels = {
    new: 'Nuevo',
    researching: 'Investigando',
    called: 'Llamado',
    no_answer: 'No contesta',
    callback: 'Callback',
    interested: 'Interesado',
    meeting: 'Reunion',
    proposal: 'Propuesta',
    closed: 'Ganado',
    sale: 'Venta',
    lost: 'Perdido',
    dead: 'Perdido',
    wrong_number: 'Numero incorrecto',
    not_interested: 'No interesado'
  };
  return labels[value] || value || 'Nuevo';
}

export function SmallTable({ columns, rows, empty = 'No records yet.' }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10">
      <div className="max-h-[58vh] overflow-y-auto overflow-x-hidden">
        <table className="data-table">
          <thead className="sticky top-0 z-10 bg-carbon/95">
            <tr className="border-b border-white/10">
              {columns.map((column) => (
                <th key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-white/[0.06] text-slate-300 hover:bg-signal/[0.04]">
                {columns.map((column) => (
                  <td key={column.key}>
                    <div className="truncate-cell">{column.render ? column.render(row) : row[column.key] || '-'}</div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? <div className="px-6 py-10 text-center text-sm text-slate-400">{empty}</div> : null}
      </div>
    </div>
  );
}
