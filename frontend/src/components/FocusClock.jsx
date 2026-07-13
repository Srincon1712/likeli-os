import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronUp, GripHorizontal, Pause, Play, RotateCcw } from 'lucide-react';
import { formatFocusTimer, formatSessionDuration } from '../lib/focusClock.js';

const FOCUS_CLOCK_POSITION_KEY = 'life-os:focus-clock-position:v1';
const FOCUS_CLOCK_EXPANDED_KEY = 'life-os:focus-clock-expanded:v1';
const CLOCK_EDGE_GAP = 12;
const CLOCK_FALLBACK_WIDTH = 172;
const CLOCK_FALLBACK_HEIGHT = 154;

export function FocusClock({ focusClock }) {
  const { sessionSeconds, today, start, pause, reset } = focusClock;
  const isComplete = today.remainingSeconds <= 0;
  const clockRef = useRef(null);
  const dragRef = useRef(null);
  const [position, setPosition] = useState(() => getInitialClockPosition());
  const [isExpanded, setIsExpanded] = useState(() => readClockExpanded());
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setPosition((currentPosition) => clampClockPosition(currentPosition, clockRef.current));
  }, [isExpanded]);

  useEffect(() => {
    function handleResize() {
      setPosition((currentPosition) => {
        const nextPosition = clampClockPosition(currentPosition, clockRef.current);
        saveClockPosition(nextPosition);
        return nextPosition;
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    function handlePointerMove(event) {
      if (!dragRef.current) return;

      const nextPosition = clampClockPosition(
        {
          x: event.clientX - dragRef.current.offsetX,
          y: event.clientY - dragRef.current.offsetY
        },
        clockRef.current
      );
      dragRef.current.latestPosition = nextPosition;
      setPosition(nextPosition);
    }

    function handlePointerUp() {
      if (dragRef.current?.latestPosition) {
        saveClockPosition(dragRef.current.latestPosition);
      }
      dragRef.current = null;
      setIsDragging(false);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  function handleDragStart(event) {
    if (event.button !== undefined && event.button !== 0) return;

    const rect = clockRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top,
      latestPosition: position
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function toggleExpanded() {
    setIsExpanded((currentValue) => {
      const nextValue = !currentValue;
      saveClockExpanded(nextValue);
      return nextValue;
    });
  }

  return (
    <aside
      ref={clockRef}
      className="fixed z-[60] w-[172px] rounded-lg border border-white/10 bg-[#070a08]/90 p-2 text-slate-50 shadow-2xl shadow-black/30 backdrop-blur-md"
      style={{ left: position.x, top: position.y }}
    >
      <div className="flex items-center gap-1">
        <button
          type="button"
          className="grid h-7 w-8 touch-none place-items-center rounded-md text-slate-500 hover:bg-white/[0.04] hover:text-slate-300"
          onPointerDown={handleDragStart}
          aria-label="Mover reloj"
          title="Mover reloj"
        >
          <GripHorizontal size={16} />
        </button>

        <button
          type="button"
          className="flex h-7 min-w-0 flex-1 items-center justify-between gap-2 rounded-md border border-white/10 bg-white/[0.035] px-2 text-slate-300 hover:bg-white/[0.07] hover:text-white"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Plegar reloj' : 'Desplegar reloj'}
          title={isExpanded ? 'Plegar reloj' : 'Desplegar reloj'}
        >
          <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.14em]">Reloj</span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {isExpanded ? (
        <div className="mt-2">
          <div className="border-b border-white/10 pb-2">
            <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-slate-500">Sesion</div>
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
        </div>
      ) : null}
    </aside>
  );
}

function getInitialClockPosition() {
  if (typeof window === 'undefined') {
    return { x: CLOCK_EDGE_GAP, y: CLOCK_EDGE_GAP };
  }

  const storedPosition = readClockPosition();
  if (storedPosition) {
    return clampClockPosition(storedPosition);
  }

  return clampClockPosition({
    x: window.innerWidth - CLOCK_FALLBACK_WIDTH - CLOCK_EDGE_GAP,
    y: CLOCK_EDGE_GAP
  });
}

function readClockPosition() {
  try {
    const value = window.localStorage.getItem(FOCUS_CLOCK_POSITION_KEY);
    const parsedValue = value ? JSON.parse(value) : null;
    if (!Number.isFinite(parsedValue?.x) || !Number.isFinite(parsedValue?.y)) {
      return null;
    }
    return parsedValue;
  } catch {
    return null;
  }
}

function saveClockPosition(position) {
  try {
    window.localStorage.setItem(FOCUS_CLOCK_POSITION_KEY, JSON.stringify(position));
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}

function readClockExpanded() {
  try {
    return window.localStorage.getItem(FOCUS_CLOCK_EXPANDED_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveClockExpanded(isExpanded) {
  try {
    window.localStorage.setItem(FOCUS_CLOCK_EXPANDED_KEY, String(isExpanded));
  } catch {
    // localStorage can be unavailable in restricted browser contexts.
  }
}

function clampClockPosition(position, element) {
  if (typeof window === 'undefined') return position;

  const rect = element?.getBoundingClientRect();
  const width = rect?.width || CLOCK_FALLBACK_WIDTH;
  const height = rect?.height || CLOCK_FALLBACK_HEIGHT;
  const maxX = Math.max(CLOCK_EDGE_GAP, window.innerWidth - width - CLOCK_EDGE_GAP);
  const maxY = Math.max(CLOCK_EDGE_GAP, window.innerHeight - height - CLOCK_EDGE_GAP);

  return {
    x: clamp(position.x, CLOCK_EDGE_GAP, maxX),
    y: clamp(position.y, CLOCK_EDGE_GAP, maxY)
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
