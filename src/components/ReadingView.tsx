import { useEffect, useRef } from 'preact/hooks';
import { getSpread, positionsFor } from '../data/spreads';
import type { Reading } from '../lib/draw';
import { CardTile } from './CardTile';
import { Meaning } from './Meaning';

interface Props {
  reading: Reading;
  animate: boolean;
  onRedraw?: () => void;
  onBack: () => void;
  backLabel: string;
  saved?: boolean | null;
}

const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ReadingView({ reading, animate, onRedraw, onBack, backLabel, saved }: Props) {
  const spread = getSpread(reading.spreadId);
  const positions = positionsFor(spread, reading.count);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    window.scrollTo({ top: 0 });
  }, [reading.id]);

  const step = Math.min(140, 2200 / reading.cards.length);
  const useAnim = animate && !reduceMotion();

  const select = (order: number) => {
    const el = document.getElementById(`m-${order}`);
    if (!el) return;
    el.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
    el.focus({ preventScroll: true });
    el.classList.remove('flash');
    void el.offsetWidth;
    el.classList.add('flash');
  };

  const isLayout = !spread.custom;
  const date = new Date(reading.createdAt);

  return (
    <section class="reading" aria-labelledby="reading-title">
      <div class="reading-head">
        <h2 id="reading-title" tabIndex={-1} ref={headingRef}>{spread.custom ? `自選 ${reading.count} 張` : spread.name}</h2>
        <p class="muted small">
          {date.toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short' })}
          ・逆位{reading.reversalsEnabled ? '開啟' : '關閉'}
          {saved === false && '・未能儲存到本機紀錄'}
        </p>
        {reading.question && <blockquote class="question">你的問題：{reading.question}</blockquote>}
      </div>

      <p class="sr-only" aria-live="polite">已抽出 {reading.cards.length} 張牌，下方依序列出每張牌的位置與牌意。</p>

      <div
        class={`layout ${isLayout ? `spread-${spread.id}` : 'free'}`}
        style={isLayout ? { gridTemplateColumns: `repeat(${spread.cols}, var(--cw))`, gridTemplateRows: `repeat(${spread.rows}, auto)`, '--cols': spread.cols } as Record<string, string | number> : undefined}
      >
        {reading.cards.map((d, i) => {
          const pos = positions[d.positionIndex];
          if (pos.crossing) return null; // rendered on top of the card it crosses
          // Celtic Cross: the crossing card (#2) shares the cell of the card at the same col/row.
          const crossIdx = isLayout ? positions.findIndex((p, j) => p.crossing && j !== d.positionIndex && p.col === pos.col && p.row === pos.row) : -1;
          const cross = crossIdx >= 0 ? reading.cards.find((c) => c.positionIndex === crossIdx) : undefined;
          const delay = (k: number) => (useAnim ? Math.round(k * step) : undefined);
          return (
            <CardTile
              key={`${reading.id}-${d.order}`}
              drawn={d}
              position={pos}
              revealDelay={delay(i)}
              onSelect={() => select(d.order)}
              crossing={cross && (
                <div class="tile crossing" data-order={cross.order} data-card={cross.cardId} data-reversed={String(cross.reversed)}>
                  <CardTile drawn={cross} position={positions[crossIdx]} revealDelay={delay(cross.order - 1)} onSelect={() => select(cross.order)} showLabel={false} bare />
                </div>
              )}
              extraLabel={cross && (
                <div class="tile-label cross-label" aria-hidden="true">
                  <span class="pos"><span class="mini-badge">{cross.order}</span>{positions[crossIdx].name}（橫放）</span>
                  <span class={`orient ${cross.reversed ? 'rev' : 'up'}`}>{cross.reversed ? '逆位 ↓' : '正位 ↑'}</span>
                </div>
              )}
            />
          );
        })}
      </div>

      <div class="actions">
        {onRedraw && <button type="button" class="btn primary" onClick={onRedraw}>重新洗牌再抽一次</button>}
        <button type="button" class="btn" onClick={onBack}>{backLabel}</button>
      </div>

      <h2 class="list-title">逐張解讀</h2>
      <p class="muted small">點上方的牌可以跳到對應的說明。牌意是反思的起點，不是對未來的保證。</p>
      <div class="meanings">
        {reading.cards.map((d) => <Meaning key={d.order} drawn={d} position={positions[d.positionIndex]} />)}
      </div>

      <div class="actions">
        {onRedraw && <button type="button" class="btn primary" onClick={onRedraw}>重新洗牌再抽一次</button>}
        <button type="button" class="btn" onClick={onBack}>{backLabel}</button>
      </div>
    </section>
  );
}
