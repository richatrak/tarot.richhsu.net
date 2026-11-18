import type { DrawnCard, Reading } from './draw';

/**
 * Everything stays in this browser's localStorage. Nothing is sent anywhere.
 * Clearing site data, private mode, switching device/browser, or (on iOS) using
 * the home-screen app vs Safari — each has its own storage — means data can be lost.
 */
const PREFIX = 'tarot.v1.';
const K_SETTINGS = PREFIX + 'settings';
const K_HISTORY = PREFIX + 'history';
const K_DAILY = PREFIX + 'daily';
const K_DRAFT = PREFIX + 'draft';

export const HISTORY_LIMIT = 100;

/** Card face artwork the user can switch between (see src/art/decks.ts). */
export const DECKS = ['anime', 'flat'] as const;
export type Deck = (typeof DECKS)[number];

export interface Settings {
  reversals: boolean;
  saveHistory: boolean;
  deck: Deck;
}
export const DEFAULT_SETTINGS: Settings = { reversals: true, saveHistory: true, deck: 'anime' };

export interface DailyCard {
  date: string; // YYYY-MM-DD in local time
  card: DrawnCard;
  revealed: boolean;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // quota exceeded, storage disabled, etc.
  }
}
function remove(key: string) {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

export function loadSettings(): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(K_SETTINGS, {}) };
  // Settings saved before the deck option existed have no deck; one from another version may name an unknown deck.
  if (!DECKS.includes(s.deck)) s.deck = DEFAULT_SETTINGS.deck;
  return s;
}
export const saveSettings = (s: Settings) => write(K_SETTINGS, s);

export const loadHistory = (): Reading[] => {
  const h = read<Reading[]>(K_HISTORY, []);
  return Array.isArray(h) ? h : [];
};
export function addToHistory(r: Reading): boolean {
  const next = [r, ...loadHistory().filter((x) => x.id !== r.id)].slice(0, HISTORY_LIMIT);
  return write(K_HISTORY, next);
}
export function deleteFromHistory(id: string) {
  write(K_HISTORY, loadHistory().filter((x) => x.id !== id));
}
export const clearHistory = () => remove(K_HISTORY);

export const loadDaily = (): DailyCard | null => read<DailyCard | null>(K_DAILY, null);
export const saveDaily = (d: DailyCard) => write(K_DAILY, d);

export const loadDraftQuestion = (): string => read<string>(K_DRAFT, '');
export const saveDraftQuestion = (q: string) => (q ? write(K_DRAFT, q) : remove(K_DRAFT));

/** Remove every key this app wrote. */
export function clearAll() {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k));
  } catch { /* ignore */ }
}

export function localDateKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export interface ExportFile {
  app: 'tarot-reflection';
  version: 1;
  exportedAt: string;
  settings: Settings;
  history: Reading[];
}
export function exportData(): ExportFile {
  return { app: 'tarot-reflection', version: 1, exportedAt: new Date().toISOString(), settings: loadSettings(), history: loadHistory() };
}
/** Merge imported history (dedupe by id). Returns number of readings added. */
export function importData(json: string): number {
  const data = JSON.parse(json) as Partial<ExportFile>;
  if (data.app !== 'tarot-reflection' || !Array.isArray(data.history)) throw new Error('檔案格式不符');
  const valid = data.history.filter((r) => r && typeof r.id === 'string' && Array.isArray(r.cards));
  const existing = loadHistory();
  const ids = new Set(existing.map((r) => r.id));
  const added = valid.filter((r) => !ids.has(r.id));
  const merged = [...existing, ...added].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, HISTORY_LIMIT);
  if (!write(K_HISTORY, merged)) throw new Error('儲存空間不足');
  return added.length;
}
