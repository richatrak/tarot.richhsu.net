import { useState } from 'preact/hooks';
import { CardBack } from '../art/CardArt';
import { drawCards } from '../lib/draw';
import { loadDaily, localDateKey, saveDaily, type DailyCard as Daily } from '../lib/storage';
import { CardTile } from './CardTile';
import { Meaning } from './Meaning';

const POS = { name: '今日一牌', meaning: '今天可以放在心上的提醒。' };

export function DailyCard({ reversals }: { reversals: boolean }) {
  const today = localDateKey();
  const [daily, setDaily] = useState<Daily | null>(() => {
    const d = loadDaily();
    return d && d.date === today ? d : null;
  });
  const [justDrawn, setJustDrawn] = useState(false);
  const [open, setOpen] = useState(false);

  const reveal = () => {
    const [card] = drawCards(1, reversals);
    const d: Daily = { date: today, card, revealed: true };
    saveDaily(d);
    setDaily(d);
    setJustDrawn(true);
    setOpen(true);
  };

  return (
    <section class="panel daily" aria-labelledby="daily-title">
      <h2 id="daily-title">今日一牌</h2>
      <div class="daily-body">
        {daily ? (
          <>
            <div class="daily-card">
              <CardTile drawn={daily.card} position={POS} revealDelay={justDrawn ? 0 : undefined} onSelect={() => setOpen((o) => !o)} />
            </div>
            <div class="daily-text">
              <p class="muted small">{today}・每天一張，當天重新整理不會改變。</p>
              {open ? <Meaning drawn={daily.card} idPrefix="daily" /> : (
                <button type="button" class="btn" onClick={() => setOpen(true)}>看今日牌意</button>
              )}
            </div>
          </>
        ) : (
          <>
            <button type="button" class="daily-card daily-back" onClick={reveal} aria-label="翻開今日一牌">
              <CardBack />
            </button>
            <div class="daily-text">
              <p>今天還沒翻牌。深呼吸一下，想想今天最想關照的事，然後點牌翻開。</p>
              <button type="button" class="btn primary" onClick={reveal}>翻開今日一牌</button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
