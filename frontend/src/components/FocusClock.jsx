import { Pause, Play, RotateCcw } from 'lucide-react';
import { formatFocusTimer, formatSessionDuration } from '../lib/focusClock.js';

export function FocusClock({ focusClock }) {
  const { sessionSeconds, today, start, pause, reset } = focusClock;
  const isComplete = today.remainingSeconds <= 0;

  return (
    <aside className="fixed right-3 top-3 z-[60] w-[172px] rounded-lg border border-white/10 bg-[#070a08]/90 p-3 text-slate-50 backdrop-blur-md">
      <div className="border-b border-white/10 pb-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Sesión</div>
        <div className="mt-1 font-mono text-sm text-slate-100">{formatSessionDuration(sessionSeconds)}</div>
      </div>

      <div className="pt-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Deep Focus</div>
        <div className="mt-1 font-mono text-lg leading-6 text-emerald-100">{formatFocusTimer(today.remainingSeconds)}</div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={start}
            disabled={today.isRunning || isComplete}
            className="grid h-8 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Iniciar"
            title="Iniciar"
          >
            <Play size={14} />
          </button>
          <button
            type="button"
            onClick={pause}
            disabled={!today.isRunning}
            className="grid h-8 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Pausar"
            title="Pausar"
          >
            <Pause size={14} />
          </button>
          <button
            type="button"
            onClick={reset}
            className="grid h-8 place-items-center rounded-md border border-white/10 bg-white/[0.035] text-slate-300 hover:bg-white/[0.07] hover:text-white"
            aria-label="Reiniciar"
            title="Reiniciar"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
