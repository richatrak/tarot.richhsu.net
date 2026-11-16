/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, matchPrecache, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<{ url: string; revision: string | null } | string> };

const manifest = self.__WB_MANIFEST;
// App shell, JS bundle (which includes all 78 card faces as SVG code and all meanings), CSS, icons.
precacheAndRoute(manifest);
cleanupOutdatedCaches();
registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

self.addEventListener('message', (event) => {
  const data = event.data as { type?: string } | undefined;
  if (data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (data?.type === 'CHECK_OFFLINE') {
    // Verify every precached file is really present (caches can be evicted).
    const urls = manifest.map((e) => (typeof e === 'string' ? e : e.url));
    Promise.all(urls.map((u) => matchPrecache(u).then((r) => !!r).catch(() => false))).then((ok) => {
      const cached = ok.filter(Boolean).length;
      event.ports[0]?.postMessage({ total: urls.length, cached });
    });
  }
});
