/**
 * ShopPics AI — shot history, stored ONLY in the browser's localStorage.
 * No account, no server, no database. Clearing browser data clears history.
 *
 * Exposed as a tiny external store so React reads it with
 * useSyncExternalStore — client-safe, hydration-safe, and no
 * setState-in-effect anywhere.
 */

import { useSyncExternalStore } from 'react';
import type { StudioRec } from './heuristics';

export interface HistoryEntry {
  id: string;
  createdAt: number;
  publicId: string;
  originalFilename: string;
  width: number;
  height: number;
  bytes: number;
  /** Backdrop the seller last used for this shot */
  backdropId: string;
  /** The heuristic suggestion at upload time */
  rec: StudioRec;
}

const KEY = 'shoppics:history:v1';
const MAX_ENTRIES = 24;

const EMPTY: HistoryEntry[] = [];
let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readStorage(): HistoryEntry[] {
  if (!isBrowser()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (e): e is HistoryEntry =>
        e && typeof e.id === 'string' && typeof e.publicId === 'string' && typeof e.createdAt === 'number',
    );
  } catch {
    return EMPTY;
  }
}

function snapshot(): HistoryEntry[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function emit(): void {
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function commit(entries: HistoryEntry[]): void {
  cache = entries.slice(0, MAX_ENTRIES);
  if (isBrowser()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    } catch {
      // localStorage full or blocked — history is a convenience, never fail the app
    }
  }
  emit();
}

/** React hook: the current history, live-updating. */
export function useHistoryEntries(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

export function saveHistoryEntry(entry: HistoryEntry): void {
  commit([entry, ...snapshot().filter((e) => e.id !== entry.id)]);
}

export function removeHistoryEntry(id: string): void {
  commit(snapshot().filter((e) => e.id !== id));
}

export function updateHistoryEntry(id: string, patch: Partial<HistoryEntry>): void {
  commit(snapshot().map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)));
}

export function clearHistory(): void {
  commit([]);
}
