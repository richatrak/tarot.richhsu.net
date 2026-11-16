import { useEffect, useRef, useState } from 'preact/hooks';
import { CARDS } from '../data/cards';
import { checkOffline, isIOS, isStandalone, onOfflineState, retryOffline, type OfflineState } from '../lib/pwa';
import { exportData, importData, type Settings } from '../lib/storage';

interface Props {
  settings: Settings;
  onSettings: (s: Settings) => void;
  onClearAll: () => void;
  onImported: () => void;
}

export function OfflineText({ s }: { s: OfflineState }) {
  switch (s.kind) {
    case 'ready': return <>離線資源已就緒（{s.cached}/{s.total}）</>;
    case 'partial': return <>離線資源不完整（{s.cached}/{s.total}）</>;
    case 'preparing': return <>離線資源準備中…</>;
    case 'unsupported': return <>此瀏覽器不支援離線功能</>;
    default: return <>{s.message}</>;
  }
}

export function SettingsView({ settings, onSettings, onClearAll, onImported }: Props) {
  const [off, setOff] = useState<OfflineState>({ kind: 'preparing' });
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { checkOffline(); return onOfflineState(setOff); }, []);
  const reviewed = CARDS.filter((c) => c.status === 'reviewed').length;

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `tarot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const doImport = async (f: File) => {
    try {
      const n = importData(await f.text());
      setMsg(`已匯入 ${n} 筆新紀錄。`);
      onImported();
    } catch (e) {
      setMsg('匯入失敗：' + (e as Error).message);
    }
  };

  return (
    <>
      <section class="panel" aria-labelledby="set-title">
        <h2 id="set-title">設定</h2>
        <label class="switch">
          <input type="checkbox" checked={settings.reversals} onChange={(e) => onSettings({ ...settings, reversals: (e.target as HTMLInputElement).checked })} />
          <span>抽牌包含逆位（每張 50% 機率）</span>
        </label>
        <label class="switch">
          <input type="checkbox" checked={settings.saveHistory} onChange={(e) => onSettings({ ...settings, saveHistory: (e.target as HTMLInputElement).checked })} />
          <span>在本機儲存抽牌紀錄與問題</span>
        </label>
      </section>

      <section class="panel" aria-labelledby="data-title">
        <h2 id="data-title">資料與隱私</h2>
        <p>這個 App 不需要登入、不追蹤、不把任何資料傳到伺服器。你的問題、紀錄和今日一牌只存在這台裝置的瀏覽器裡。</p>
        <div class="actions left">
          <button type="button" class="btn" onClick={doExport}>匯出備份（JSON）</button>
          <button type="button" class="btn" onClick={() => fileRef.current?.click()}>匯入備份</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) doImport(f); (e.target as HTMLInputElement).value = ''; }} />
          <button type="button" class="btn danger" onClick={() => { if (confirm('確定要清除本 App 在這台裝置上的所有資料（紀錄、問題、今日一牌、設定）嗎？')) { onClearAll(); setMsg('已清除所有本機資料。'); } }}>清除所有本機資料</button>
        </div>
        {msg && <p role="status">{msg}</p>}
      </section>

      <section class="panel" aria-labelledby="off-title">
        <h2 id="off-title">離線使用</h2>
        <p><strong><OfflineText s={off} /></strong></p>
        {(off.kind === 'partial' || off.kind === 'error') && <button type="button" class="btn" onClick={retryOffline}>重新下載離線資源</button>}
        <p class="muted small">第一次在有網路時開啟並看到「已就緒」後，就能在沒有網路時開啟、抽牌、看牌意。系統空間不足時，瀏覽器可能會清掉快取，此時只要連網開啟一次即可恢復。</p>
        {isIOS() && !isStandalone() && (
          <div class="tip-box">
            <strong>iPhone／iPad 加到主畫面：</strong>在 Safari 點「分享」→「加入主畫面」。加入後請<strong>從主畫面圖示連網開啟一次</strong>，等這裡顯示「已就緒」——主畫面 App 和 Safari 的離線資料是分開的。
          </div>
        )}
        {!isIOS() && !isStandalone() && <p class="muted small">Android Chrome／桌面 Chrome、Edge：可從網址列或選單選擇「安裝應用程式」。</p>}
      </section>

      <section class="panel" aria-labelledby="about-title">
        <h2 id="about-title">關於</h2>
        <p>塔羅在這裡是<strong>自我反思的工具</strong>：牌意幫你換個角度思考，不代表確定的預測，也不能取代醫療、法律、財務或心理專業意見。若你正經歷情緒上的困難，可以撥打衛福部安心專線 1925（24 小時）。</p>
        <p class="muted small">牌組：標準 78 張（22 張大阿爾克那、56 張小阿爾克那），採 RWS 編號（力量 8、正義 11）。抽牌使用 Web Crypto 安全亂數與 Fisher–Yates 洗牌。</p>
        <p class="muted small">牌面：本專案以程式繪製的原創幾何符號示意圖，非插畫完成版。牌意：原創初稿，已審閱 {reviewed}/{CARDS.length} 張。</p>
        <p class="muted small">版本 {__APP_VERSION__}</p>
      </section>
    </>
  );
}
