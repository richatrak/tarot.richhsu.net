import { registerSW } from 'virtual:pwa-register';

export type OfflineState =
  | { kind: 'unsupported' }
  | { kind: 'preparing' }
  | { kind: 'ready'; cached: number; total: number }
  | { kind: 'partial'; cached: number; total: number }
  | { kind: 'error'; message: string };

type Listener = (s: OfflineState) => void;
let state: OfflineState = { kind: 'preparing' };
let needRefresh = false;
const listeners = new Set<Listener>();
const refreshListeners = new Set<(b: boolean) => void>();
let updateSW: ((reload?: boolean) => Promise<void>) | null = null;
let registration: ServiceWorkerRegistration | undefined;

function set(s: OfflineState) {
  state = s;
  listeners.forEach((l) => l(s));
}

export function onOfflineState(l: Listener) {
  listeners.add(l);
  l(state);
  return () => listeners.delete(l);
}
export function onNeedRefresh(l: (b: boolean) => void) {
  refreshListeners.add(l);
  l(needRefresh);
  return () => refreshListeners.delete(l);
}

export async function checkOffline(): Promise<void> {
  if (!('serviceWorker' in navigator)) return set({ kind: 'unsupported' });
  // `ready` resolves once this page's registration has an *active* worker
  // (on first install the worker is still installing/precaching for a moment).
  const reg = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<undefined>((r) => setTimeout(() => r(undefined), 20000)),
  ]);
  const sw = reg?.active;
  if (!sw) return set({ kind: navigator.onLine ? 'preparing' : 'error', message: '尚未完成離線準備，請連網開啟一次' } as OfflineState);
  const result = await new Promise<{ total: number; cached: number } | null>((resolve) => {
    const ch = new MessageChannel();
    const t = setTimeout(() => resolve(null), 5000);
    ch.port1.onmessage = (e) => { clearTimeout(t); resolve(e.data); };
    sw.postMessage({ type: 'CHECK_OFFLINE' }, [ch.port2]);
  });
  if (!result) return set({ kind: 'error', message: '無法確認離線資源狀態' });
  set(result.cached === result.total && result.total > 0
    ? { kind: 'ready', ...result }
    : { kind: 'partial', ...result });
}

/** Ask the browser to re-run install (re-download missing files). */
export async function retryOffline() {
  set({ kind: 'preparing' });
  try {
    await registration?.update();
  } catch (e) {
    set({ kind: 'error', message: '更新失敗，請確認網路後再試' });
    return;
  }
  setTimeout(checkOffline, 1500);
}

export function applyUpdate() {
  updateSW?.(true);
}

export function initPWA() {
  if (!('serviceWorker' in navigator)) return set({ kind: 'unsupported' });
  updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg;
      checkOffline();
      // Check for new versions hourly while the app stays open.
      if (reg) setInterval(() => { if (navigator.onLine) reg.update().catch(() => {}); }, 60 * 60 * 1000);
    },
    onOfflineReady() { checkOffline(); },
    onNeedRefresh() {
      needRefresh = true;
      refreshListeners.forEach((l) => l(true));
    },
    onRegisterError(err) {
      set({ kind: 'error', message: '離線功能註冊失敗：' + String(err?.message ?? err) });
    },
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => checkOffline());
}

/** True when launched from the home screen / installed. */
export function isStandalone(): boolean {
  return matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
}
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
