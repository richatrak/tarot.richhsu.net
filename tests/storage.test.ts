import { beforeEach, describe, expect, it } from 'vitest';
import * as store from '../src/lib/storage';
import { createReading } from '../src/lib/draw';
import { getSpread } from '../src/data/spreads';

class MemStorage {
  m = new Map<string, string>();
  getItem(k: string) { return this.m.get(k) ?? null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  get length() { return this.m.size; }
}

beforeEach(() => {
  const s = new MemStorage();
  // Object.keys(localStorage) must list keys, so proxy them as own props.
  (globalThis as any).localStorage = new Proxy(s, {
    ownKeys: () => [...s.m.keys()],
    getOwnPropertyDescriptor: (_t, k) => (s.m.has(k as string) ? { enumerable: true, configurable: true, value: s.m.get(k as string) } : undefined),
    get: (t, k) => { const v = (t as any)[k]; return typeof v === 'function' ? v.bind(t) : v; },
  });
});

describe('storage', () => {
  it('defaults: reversals on, history on, anime deck', () => {
    expect(store.loadSettings()).toEqual({ reversals: true, saveHistory: true, deck: 'anime' });
  });
  it('settings saved before the deck option existed keep their values and get the default deck', () => {
    localStorage.setItem('tarot.v1.settings', '{"reversals":false,"saveHistory":true}');
    expect(store.loadSettings()).toEqual({ reversals: false, saveHistory: true, deck: 'anime' });
  });
  it('an unknown deck falls back to the default; a valid choice round-trips', () => {
    localStorage.setItem('tarot.v1.settings', '{"reversals":true,"saveHistory":false,"deck":"vintage"}');
    expect(store.loadSettings()).toEqual({ reversals: true, saveHistory: false, deck: 'anime' });
    store.saveSettings({ ...store.DEFAULT_SETTINGS, deck: 'flat' });
    expect(store.loadSettings().deck).toBe('flat');
  });
  it('saves question with reading; delete and clear work', () => {
    const r = createReading(getSpread('ppf'), 3, '我該怎麼做？', true);
    store.addToHistory(r);
    expect(store.loadHistory()[0].question).toBe('我該怎麼做？');
    store.deleteFromHistory(r.id);
    expect(store.loadHistory()).toHaveLength(0);
    store.addToHistory(r);
    store.saveDraftQuestion('草稿');
    store.clearAll();
    expect(store.loadHistory()).toHaveLength(0);
    expect(store.loadDraftQuestion()).toBe('');
  });
  it('caps history and round-trips export/import', () => {
    for (let i = 0; i < store.HISTORY_LIMIT + 5; i++) store.addToHistory(createReading(getSpread('single'), 1, String(i), true));
    expect(store.loadHistory()).toHaveLength(store.HISTORY_LIMIT);
    const dump = JSON.stringify(store.exportData());
    store.clearAll();
    expect(store.importData(dump)).toBe(store.HISTORY_LIMIT);
    expect(store.importData(dump)).toBe(0); // dedupe
    expect(() => store.importData('{"x":1}')).toThrow();
  });
  it('survives corrupted JSON', () => {
    localStorage.setItem('tarot.v1.history', '{oops');
    expect(store.loadHistory()).toEqual([]);
  });
});
