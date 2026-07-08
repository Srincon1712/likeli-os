import { useMemo, useState } from 'react';
import { DAILY_COMPLIANCE_FIELDS } from '../../lib/lifeDailyCompliance.js';

export function DailyCompliancePopup({ targetDisplayDate, initialValues, onSave, onCancel, mode = 'daily' }) {
  const [values, setValues] = useState(() => createInitialValues(initialValues));
  const completeCount = DAILY_COMPLIANCE_FIELDS.filter((field) => isFieldComplete(field, values[field.id])).length;
  const isComplete = completeCount === DAILY_COMPLIANCE_FIELDS.length;

  const remainingText = useMemo(() => {
    const remaining = DAILY_COMPLIANCE_FIELDS.length - completeCount;
    return remaining === 1 ? 'Falta 1 campo' : `Faltan ${remaining} campos`;
  }, [completeCount]);

  function updateValue(field, nextValue, key) {
    setValues((currentValues) => {
      if (field.input.type === 'time-pair') {
        return {
          ...currentValues,
          [field.id]: {
            ...currentValues[field.id],
            [key]: nextValue
          }
        };
      }

      return {
        ...currentValues,
        [field.id]: nextValue
      };
    });
  }

  function handleSave() {
    if (!isComplete) return;
    onSave(values);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-3 py-4 backdrop-blur-md">
      <section className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-lg border border-emerald-100/15 bg-[#111811] shadow-2xl">
        <div className="sticky top-0 z-10 border-b border-emerald-100/10 bg-[#111811]/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">Cumplimiento Diario</div>
              <h2 className="mt-1 text-xl font-semibold tracking-normal text-white">
                {mode === 'edit' ? `Editar cumplimiento del ${targetDisplayDate}` : `Llena el cumplimiento diario del ${targetDisplayDate}`}
              </h2>
            </div>
            <div className="text-xs font-mono text-emerald-100/60">
              {isComplete ? 'Listo para guardar' : remainingText}
            </div>
          </div>
        </div>

        <div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {DAILY_COMPLIANCE_FIELDS.map((field) => (
            <div key={field.id} className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
              <div className="flex min-h-9 items-start justify-between gap-3">
                <div className="text-sm font-medium leading-5 text-emerald-50">{field.label}</div>
                {field.input.unit ? <div className="shrink-0 rounded bg-emerald-100/8 px-1.5 py-0.5 text-[10px] font-mono text-emerald-100/55">{field.input.unit}</div> : null}
              </div>

              {field.input.type === 'time-pair' ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {field.input.fields.map((timeField) => (
                    <label key={timeField.key} className="block">
                      <span className="mb-1 block text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/45">{timeField.label}</span>
                      <input
                        type="time"
                        value={values[field.id][timeField.key]}
                        onChange={(event) => updateValue(field, event.target.value, timeField.key)}
                        className="h-11 w-full rounded-md border border-emerald-100/10 bg-black/16 px-2 text-sm text-white outline-none focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/10"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={field.input.min}
                    step={field.input.step}
                    placeholder={field.input.placeholder}
                    value={values[field.id]}
                    onChange={(event) => updateValue(field, event.target.value)}
                    className="h-11 w-full rounded-md border border-emerald-100/10 bg-black/16 px-3 text-base text-white outline-none placeholder:text-emerald-100/22 focus:border-emerald-300/70 focus:ring-2 focus:ring-emerald-300/10"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-emerald-100/10 bg-[#111811]/95 px-4 py-3 backdrop-blur sm:px-5">
          {onCancel ? (
            <button type="button" onClick={onCancel} className="ui-button border border-emerald-100/10 bg-emerald-100/5 text-emerald-100/70 hover:bg-emerald-100/10 hover:text-white">
              Cancelar
            </button>
          ) : null}
          <button
            type="button"
            onClick={handleSave}
            disabled={!isComplete}
            className={`ui-button border ${
              isComplete
                ? 'border-emerald-300 bg-emerald-300 text-[#0c120c] hover:bg-emerald-200'
                : 'cursor-not-allowed border-emerald-100/10 bg-emerald-100/5 text-emerald-100/35'
            }`}
          >
            Guardar
          </button>
        </div>
      </section>
    </div>
  );
}

function createInitialValues(initialValues = {}) {
  return DAILY_COMPLIANCE_FIELDS.reduce((values, field) => {
    if (field.input.type === 'time-pair') {
      values[field.id] = {
        bedTime: initialValues[field.id]?.bedTime || '',
        wakeTime: initialValues[field.id]?.wakeTime || ''
      };
      return values;
    }

    values[field.id] = initialValues[field.id] ?? '';
    return values;
  }, {});
}

function isFieldComplete(field, value) {
  if (field.input.type === 'time-pair') {
    return Boolean(value?.bedTime && value?.wakeTime);
  }

  return value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value));
}
