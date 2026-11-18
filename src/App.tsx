import { useEffect, useState } from 'preact/hooks';
import { DeckContext } from './art/decks';
import { History } from './components/History';
import { Home } from './components/Home';
import { ReadingView } from './components/ReadingView';
import { OfflineText, SettingsView } from './components/SettingsView';
import { CUSTOM_DEFAULT, countFor, getSpread } from './data/spreads';
import { createReading, type Reading } from './lib/draw';
import { applyUpdate, onNeedRefresh, onOfflineState, type OfflineState } from './lib/pwa';
import * as store from './lib/storage';

type View = 'home' | 'reading' | 'history' | 'settings';
const VIEWS: View[] = ['home', 'reading', 'history', 'settings'];

function viewFromHash(): View {
  const v = location.hash.replace('#/', '') as View;
  return VIEWS.includes(v) ? v : 'home';
}

export function App() {
  const [view, setView] = useState<View>(viewFromHash);
  const [settings, setSettingsState] = useState(store.loadSettings);
  const [question, setQuestionState] = useState(store.loadDraftQuestion);
  const [spreadId, setSpreadId] = useState('ppf');
  const [customCount, setCustomCount] = useState(CUSTOM_DEFAULT);
  const [reading, setReading] = useState<Reading | null>(null);
  const [fromHistory, setFromHistory] = useState(false);
  const [saved, setSaved] = useState<boolean | null>(null);
  const [history, setHistory] = useState(store.loadHistory);
  const [offline, setOffline] = useState<OfflineState>({ kind: 'preparing' });
  const [needRefresh, setNeedRefresh] = useState(false);

  useEffect(() => onOfflineState(setOffline), []);
  useEffect(() => onNeedRefresh(setNeedRefresh), []);
  useEffect(() => {
    const h = () => setView(viewFromHash());
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, []);
  // A reading only lives in memory; if the page reloads on #/reading, go home.
  const shown: View = view === 'reading' && !reading ? 'home' : view;

  const go = (v: View) => { if (location.hash !== `#/${v}`) location.hash = `#/${v}`; setView(v); };
  const setSettings = (s: store.Settings) => { setSettingsState(s); store.saveSettings(s); };
  const setQuestion = (q: string) => { setQuestionState(q); store.saveDraftQuestion(q); };

  const draw = () => {
    const spread = getSpread(spreadId);
    const r = createReading(spread, countFor(spread, customCount), question, settings.reversals);
    setReading(r);
    setFromHistory(false);
    if (settings.saveHistory) {
      setSaved(store.addToHistory(r));
      setHistory(store.loadHistory());
    } else setSaved(null);
    go('reading');
  };

  const navItems: [View, string][] = [['home', '抽牌'], ['history', '紀錄'], ['settings', '設定・說明']];

  return (
    <DeckContext.Provider value={settings.deck}>
      <a class="skip" href="#main">跳到主要內容</a>
      <header class="top">
        <h1><button type="button" class="brand" onClick={() => go('home')} aria-label="心富塔羅 Richly，回到首頁">心富塔羅<span class="brand-en" aria-hidden="true">Richly</span></button></h1>
        <nav aria-label="主選單">
          {navItems.map(([v, label]) => (
            <button type="button" key={v} class={`nav${shown === v || (v === 'home' && shown === 'reading' && !fromHistory) || (v === 'history' && shown === 'reading' && fromHistory) ? ' active' : ''}`}
              aria-current={shown === v ? 'page' : undefined} onClick={() => go(v)}>{label}</button>
          ))}
        </nav>
        <button type="button" class={`offline-pill ${offline.kind}`} onClick={() => go('settings')} title="離線狀態">
          <span class="dot" aria-hidden="true" /><span class="pill-text"><OfflineText s={offline} /></span>
        </button>
      </header>

      {needRefresh && (
        <div class="update-bar" role="status">
          有新版本可用。
          <button type="button" class="btn small primary" onClick={applyUpdate}>立即更新</button>
          <button type="button" class="btn small" onClick={() => setNeedRefresh(false)}>稍後</button>
        </div>
      )}

      <main id="main">
        {shown === 'home' && (
          <Home settings={settings} onSettings={setSettings} question={question} onQuestion={setQuestion}
            spreadId={spreadId} onSpread={setSpreadId} customCount={customCount} onCustomCount={setCustomCount} onDraw={draw} />
        )}
        {shown === 'reading' && reading && (
          <ReadingView reading={reading} animate={!fromHistory} saved={fromHistory ? null : saved}
            onRedraw={fromHistory ? undefined : draw}
            onBack={() => go(fromHistory ? 'history' : 'home')}
            backLabel={fromHistory ? '回到紀錄' : '換個牌陣或問題'} />
        )}
        {shown === 'history' && (
          <History history={history} saveEnabled={settings.saveHistory}
            onOpen={(r) => { setReading(r); setFromHistory(true); go('reading'); }}
            onDelete={(id) => { store.deleteFromHistory(id); setHistory(store.loadHistory()); }}
            onClear={() => { store.clearHistory(); setHistory([]); }} />
        )}
        {shown === 'settings' && (
          <SettingsView settings={settings} onSettings={setSettings} onImported={() => setHistory(store.loadHistory())}
            onClearAll={() => {
              store.clearAll();
              setSettingsState(store.loadSettings());
              setQuestionState('');
              setHistory([]);
            }} />
        )}
      </main>
      <footer class="foot">僅供自我反思與娛樂參考，不構成任何專業建議。</footer>
    </DeckContext.Provider>
  );
}
