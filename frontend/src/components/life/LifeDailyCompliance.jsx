import { Check, ChevronLeft, ChevronRight, Edit3, Lock, RotateCcw, Square, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatDisplayDate, getLifeScoreRingVisual, getLocalDateKey, getRecordAnalysis } from '../../lib/lifeDailyCompliance.js';

const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
const monthFormatter = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' });

export function LifeDailyCompliance({ records, selectedDate, onSelectDate, onOpenDate, onDeleteDate, onClearDate }) {
  const todayKey = getLocalDateKey();
  const initialMonth = selectedDate ? dateFromKey(selectedDate) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const recordsByDate = useMemo(() => new Map(records.map((record) => [record.date, record])), [records]);
  const days = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);

  function changeMonth(offset) {
    setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  function handleDayClick(day) {
    if (!day || day.dateKey > todayKey) return;
    onSelectDate(day.dateKey);
    onOpenDate(day.dateKey);
  }

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-emerald-300">Life OS</div>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-normal text-white">Cumplimiento Diario</h2>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => changeMonth(-1)} className="ui-icon-button border border-emerald-100/10 bg-emerald-100/5 text-emerald-100/70 hover:bg-emerald-100/10 hover:text-white" aria-label="Mes anterior">
            <ChevronLeft size={17} />
          </button>
          <div className="min-w-44 text-center text-sm font-semibold capitalize text-emerald-50">{monthFormatter.format(visibleMonth)}</div>
          <button type="button" onClick={() => changeMonth(1)} className="ui-icon-button border border-emerald-100/10 bg-emerald-100/5 text-emerald-100/70 hover:bg-emerald-100/10 hover:text-white" aria-label="Mes siguiente">
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-100/10 bg-emerald-950/20 p-3">
        <div className="grid grid-cols-7 gap-2 border-b border-emerald-100/10 pb-3">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-mono uppercase tracking-[0.14em] text-emerald-100/38">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`blank-${index}`} className="min-h-24 rounded-lg border border-transparent" />;
            }

            const record = recordsByDate.get(day.dateKey);
            const analysis = record ? getRecordAnalysis(record) : null;
            const isToday = day.dateKey === todayKey;
            const isSelected = day.dateKey === selectedDate;
            const isFuture = day.dateKey > todayKey;

            return (
              <CalendarDay
                key={day.dateKey}
                day={day}
                record={record}
                analysis={analysis}
                isToday={isToday}
                isSelected={isSelected}
                isFuture={isFuture}
                onClick={() => handleDayClick(day)}
                onDelete={() => onDeleteDate(day.dateKey)}
                onClear={() => onClearDate(day.dateKey)}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-emerald-100/55">
        <LegendItem color="#64748b" label="Sin registro" />
        <LegendItem color="#ef4444" label="0-30%" />
        <LegendItem color="#f97316" label="30-60%" />
        <LegendItem color="#eab308" label="60-80%" />
        <LegendItem color="#22c55e" label="80-100%" />
        <LegendItem color="#a855f7" label="+100%" />
      </div>
    </section>
  );
}

function CalendarDay({ day, record, analysis, isToday, isSelected, isFuture, onClick, onDelete, onClear }) {
  const ring = getLifeScoreRingVisual(analysis?.scorePercentage || 0, Boolean(record));
  const fillPercentage = record ? Math.max(analysis.scorePercentage, 2) : 100;
  const progressDegrees = Math.min(fillPercentage, 100) * 3.6;
  const ringBackground = `conic-gradient(${ring.color} ${progressDegrees}deg, ${record ? 'rgba(16, 185, 129, 0.10)' : ring.track} 0deg)`;
  const tooltip = record ? getTooltipSummary(analysis) : null;

  return (
    <div
      className={`group relative min-h-24 rounded-lg border p-2 transition ${
        isFuture
          ? 'cursor-not-allowed border-emerald-100/5 bg-black/8 text-emerald-100/20'
          : 'border-emerald-100/10 bg-black/12 text-emerald-50 hover:border-emerald-200/30 hover:bg-emerald-100/[0.055]'
      } ${isToday ? 'border-emerald-300/70 bg-emerald-300/10 shadow-[0_0_34px_rgba(110,231,183,0.12)]' : ''} ${
        isSelected ? 'ring-2 ring-emerald-300/50' : ''
      }`}
    >
      <button type="button" onClick={onClick} disabled={isFuture} className="block w-full text-left disabled:cursor-not-allowed">
        <div className="flex items-start justify-between gap-2">
          <div className="grid h-12 w-12 place-items-center rounded-full p-[3px]" style={{ background: isFuture ? 'rgba(148, 163, 184, 0.08)' : ringBackground }}>
            <div className={`grid h-full w-full place-items-center rounded-full ${isToday ? 'bg-[#192719]' : 'bg-[#111811]'}`}>
              <span className="text-sm font-semibold">{day.dayNumber}</span>
            </div>
          </div>

          <div className="mt-0.5">
            {isFuture ? (
              <Lock size={15} className="text-emerald-100/25" />
            ) : record ? (
              <Check size={16} className="text-emerald-300" />
            ) : (
              <Square size={15} className="text-slate-400" />
            )}
          </div>
        </div>

        <div className="mt-3 min-h-6 text-xs">
          {record ? (
            <>
              <div className="font-mono text-emerald-50">{analysis.lifeScore} LS</div>
              <div className="text-emerald-100/45">{analysis.scorePercentage}%</div>
            </>
          ) : isFuture ? (
            <div className="text-emerald-100/22">Bloqueado</div>
          ) : (
            <div className="text-emerald-100/38">Sin registro</div>
          )}
        </div>
      </button>

      {record ? (
        <div className="mt-2 flex gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
          <button type="button" onClick={onClick} className="grid h-7 w-7 place-items-center rounded-md border border-emerald-100/10 bg-emerald-100/5 text-emerald-100/65 hover:bg-emerald-100/10 hover:text-white" aria-label="Editar">
            <Edit3 size={13} />
          </button>
          <button type="button" onClick={onDelete} className="grid h-7 w-7 place-items-center rounded-md border border-red-300/15 bg-red-400/5 text-red-100/65 hover:bg-red-400/10 hover:text-white" aria-label="Eliminar">
            <Trash2 size={13} />
          </button>
          <button type="button" onClick={onClear} className="grid h-7 w-7 place-items-center rounded-md border border-amber-200/15 bg-amber-300/5 text-amber-100/70 hover:bg-amber-300/10 hover:text-white" aria-label="Vaciar registro" title="Vaciar registro">
            <RotateCcw size={13} />
          </button>
        </div>
      ) : null}

      {isToday ? <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-emerald-300" /> : null}
      {tooltip ? <DayTooltip summary={tooltip} /> : null}
    </div>
  );
}

function DayTooltip({ summary }) {
  return (
    <div className="pointer-events-none absolute left-2 top-16 z-20 hidden w-64 rounded-lg border border-emerald-100/12 bg-[#0d140d] p-3 text-xs shadow-2xl group-hover:block">
      <div className="font-semibold text-white">{summary.date}</div>
      <div className="mt-1 text-emerald-100/65">Life Score: {summary.lifeScore} · {summary.percentage}%</div>
      <div className="text-emerald-100/45">{summary.status}</div>
      <div className="mt-3 space-y-1">
        {summary.fields.map((field) => (
          <div key={field.label} className="flex justify-between gap-3">
            <span className="text-emerald-100/58">{field.label}</span>
            <span className="text-emerald-50">{field.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-md border border-emerald-100/8 bg-black/10 px-2 py-1">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  );
}

function getTooltipSummary(analysis) {
  const highlightIds = ['training', 'sleep', 'deep_focus'];

  return {
    date: formatDisplayDate(analysis.date),
    lifeScore: analysis.lifeScore,
    percentage: analysis.scorePercentage,
    status: analysis.status,
    fields: highlightIds.map((fieldId) => {
      const field = analysis.fields.find((item) => item.id === fieldId);
      return {
        label: field?.label || fieldId,
        value: field?.displayValue || 'Sin datos'
      };
    })
  };
}

function getCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstDay.getDay() + 6) % 7;
  const days = Array.from({ length: firstWeekday }, () => null);

  for (let dayNumber = 1; dayNumber <= totalDays; dayNumber += 1) {
    days.push({
      dayNumber,
      dateKey: getDateKey(year, month, dayNumber)
    });
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function getDateKey(year, monthIndex, dayNumber) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
}

function dateFromKey(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}
