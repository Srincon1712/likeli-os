import { useEffect, useMemo, useState } from 'react';
import { getLocalDateKey } from './lifeDailyCompliance.js';

export const FOCUS_CLOCK_DAILY_GOAL_SECONDS = 6 * 60 * 60;
export const FOCUS_CLOCK_STORAGE_KEY = 'life-os:focus-clock:v1';

const emptyStore = {
  days: {}
};

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage);
}

function nowMs() {
  return Date.now();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createDayState(dateKey = getLocalDateKey()) {
  return {
    date: dateKey,
    remainingSeconds: FOCUS_CLOCK_DAILY_GOAL_SECONDS,
    accumulatedSeconds: 0,
    isRunning: false,
    lastTickAt: null
  };
}

export function loadFocusClockStore() {
  if (!canUseStorage()) return emptyStore;

  try {
    const parsedStore = JSON.parse(window.localStorage.getItem(FOCUS_CLOCK_STORAGE_KEY) || 'null');
    if (!parsedStore?.days || typeof parsedStore.days !== 'object') return emptyStore;
    return reconcileStore(parsedStore);
  } catch {
    return emptyStore;
  }
}

export function saveFocusClockStore(store) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(FOCUS_CLOCK_STORAGE_KEY, JSON.stringify(store));
}

export function getFocusDayState(store, dateKey = getLocalDateKey()) {
  return store.days[dateKey] || createDayState(dateKey);
}

export function getFocusAccumulatedSecondsForDate(store, dateKey) {
  return getFocusDayState(reconcileStore(store), dateKey).accumulatedSeconds;
}

export function getFocusAccumulatedHoursForDate(store, dateKey) {
  return Math.round((getFocusAccumulatedSecondsForDate(store, dateKey) / 3600) * 100) / 100;
}

export function formatSessionDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')} h ${String(minutes).padStart(2, '0')} min`;
}

export function formatFocusTimer(totalSeconds) {
  const seconds = clamp(Math.ceil(totalSeconds), 0, FOCUS_CLOCK_DAILY_GOAL_SECONDS);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function useFocusClock() {
  const sessionStartedAt = useMemo(() => nowMs(), []);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [store, setStore] = useState(() => ensureToday(loadFocusClockStore()));
  const todayKey = getLocalDateKey();
  const today = getFocusDayState(store, todayKey);

  useEffect(() => {
    const sessionInterval = window.setInterval(() => {
      setSessionSeconds(Math.floor((nowMs() - sessionStartedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(sessionInterval);
  }, [sessionStartedAt]);

  useEffect(() => {
    saveFocusClockStore(store);
  }, [store]);

  useEffect(() => {
    const focusInterval = window.setInterval(() => {
      setStore((currentStore) => ensureToday(reconcileStore(currentStore)));
    }, 1000);

    return () => window.clearInterval(focusInterval);
  }, []);

  function start() {
    setStore((currentStore) => {
      const nextStore = ensureToday(reconcileStore(currentStore));
      const currentToday = getFocusDayState(nextStore, getLocalDateKey());
      if (currentToday.remainingSeconds <= 0) return nextStore;

      return updateDay(nextStore, currentToday.date, {
        ...currentToday,
        isRunning: true,
        lastTickAt: nowMs()
      });
    });
  }

  function pause() {
    setStore((currentStore) => {
      const nextStore = ensureToday(reconcileStore(currentStore));
      const currentToday = getFocusDayState(nextStore, getLocalDateKey());
      return updateDay(nextStore, currentToday.date, {
        ...currentToday,
        isRunning: false,
        lastTickAt: null
      });
    });
  }

  function reset() {
    setStore((currentStore) => updateDay(ensureToday(reconcileStore(currentStore)), getLocalDateKey(), createDayState(getLocalDateKey())));
  }

  return {
    sessionSeconds,
    store,
    today,
    start,
    pause,
    reset,
    getAccumulatedHoursForDate: (dateKey) => getFocusAccumulatedHoursForDate(store, dateKey)
  };
}

function reconcileStore(store) {
  const safeStore = store?.days ? store : emptyStore;
  const todayKey = getLocalDateKey();
  const reconciledDays = Object.entries(safeStore.days).reduce((days, [dateKey, dayState]) => {
    const normalizedDay = normalizeDayState(dateKey, dayState);

    if (!normalizedDay.isRunning) {
      days[dateKey] = normalizedDay;
      return days;
    }

    if (dateKey !== todayKey) {
      days[dateKey] = {
        ...normalizedDay,
        isRunning: false,
        lastTickAt: null
      };
      return days;
    }

    const elapsedSeconds = normalizedDay.lastTickAt ? Math.floor((nowMs() - normalizedDay.lastTickAt) / 1000) : 0;
    const consumedSeconds = clamp(elapsedSeconds, 0, normalizedDay.remainingSeconds);
    const nextRemainingSeconds = normalizedDay.remainingSeconds - consumedSeconds;

    days[dateKey] = {
      ...normalizedDay,
      remainingSeconds: nextRemainingSeconds,
      accumulatedSeconds: clamp(normalizedDay.accumulatedSeconds + consumedSeconds, 0, FOCUS_CLOCK_DAILY_GOAL_SECONDS),
      isRunning: nextRemainingSeconds > 0,
      lastTickAt: nextRemainingSeconds > 0 ? nowMs() : null
    };
    return days;
  }, {});

  return { days: reconciledDays };
}

function ensureToday(store) {
  const todayKey = getLocalDateKey();
  if (store.days[todayKey]) return store;
  return updateDay(store, todayKey, createDayState(todayKey));
}

function normalizeDayState(dateKey, dayState = {}) {
  return {
    date: dateKey,
    remainingSeconds: clamp(Number(dayState.remainingSeconds ?? FOCUS_CLOCK_DAILY_GOAL_SECONDS), 0, FOCUS_CLOCK_DAILY_GOAL_SECONDS),
    accumulatedSeconds: clamp(Number(dayState.accumulatedSeconds ?? 0), 0, FOCUS_CLOCK_DAILY_GOAL_SECONDS),
    isRunning: Boolean(dayState.isRunning),
    lastTickAt: dayState.lastTickAt || null
  };
}

function updateDay(store, dateKey, dayState) {
  return {
    days: {
      ...store.days,
      [dateKey]: dayState
    }
  };
}
