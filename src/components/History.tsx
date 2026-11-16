import { getCard } from '../data/cards';
import { getSpread } from '../data/spreads';
import type { Reading } from '../lib/draw';

interface Props {
  history: Reading[];
  onOpen: (r: Reading) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  saveEnabled: boolean;
}

export function History({ history, onOpen, onDelete, onClear, saveEnabled }: Props) {
  return (
    <section class="panel" aria-labelledby="hist-title">
      <h2 id="hist-title">抽牌紀錄</h2>
      <p class="muted small">
        紀錄只存在這台裝置的瀏覽器（localStorage），最多保留 100 筆。清除瀏覽器資料、使用無痕模式或換裝置都會讓紀錄消失；
        iPhone 上「加入主畫面」的 App 與 Safari 分頁的資料互不相通。需要備份請到「設定」匯出。
        {!saveEnabled && <strong> 目前已關閉儲存紀錄。</strong>}
      </p>
      {history.length === 0 ? <p>還沒有紀錄。</p> : (
        <>
          <ul class="history">
            {history.map((r) => {
              const s = getSpread(r.spreadId);
              return (
                <li key={r.id}>
                  <button type="button" class="hist-open" onClick={() => onOpen(r)}>
                    <span class="hist-date">{new Date(r.createdAt).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short' })}・{s.custom ? `自選 ${r.count} 張` : s.name}</span>
                    {r.question && <span class="hist-q">{r.question}</span>}
                    <span class="hist-cards">{r.cards.slice(0, 5).map((c) => `${getCard(c.cardId).name}${c.reversed ? '(逆)' : ''}`).join('、')}{r.cards.length > 5 ? '…' : ''}</span>
                  </button>
                  <button type="button" class="btn small" onClick={() => onDelete(r.id)} aria-label="刪除這筆紀錄">刪除</button>
                </li>
              );
            })}
          </ul>
          <button type="button" class="btn danger" onClick={() => { if (confirm('確定要清除全部抽牌紀錄嗎？此動作無法復原。')) onClear(); }}>清除全部紀錄</button>
        </>
      )}
    </section>
  );
}
