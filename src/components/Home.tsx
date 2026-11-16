import { CUSTOM_MAX, SPREADS, countFor, getSpread } from '../data/spreads';
import type { Settings } from '../lib/storage';
import { DailyCard } from './DailyCard';

interface Props {
  settings: Settings;
  onSettings: (s: Settings) => void;
  question: string;
  onQuestion: (q: string) => void;
  spreadId: string;
  onSpread: (id: string) => void;
  customCount: number;
  onCustomCount: (n: number) => void;
  onDraw: () => void;
}

export function Home(p: Props) {
  const spread = getSpread(p.spreadId);
  const count = countFor(spread, p.customCount);
  const clamp = (n: number) => Math.max(1, Math.min(CUSTOM_MAX, Math.round(n) || 1));

  return (
    <>
      <DailyCard reversals={p.settings.reversals} />

      <section class="panel" aria-labelledby="ask-title">
        <h2 id="ask-title">你想問什麼？</h2>
        <p class="muted small">可以留白。寫下問題能幫助你聚焦；只會存在這台裝置的瀏覽器裡。</p>
        <div class="question-box">
          <textarea
            id="question"
            rows={2}
            maxLength={200}
            placeholder="例如：最近工作上，我該留意什麼？"
            value={p.question}
            onInput={(e) => p.onQuestion((e.target as HTMLTextAreaElement).value)}
            aria-label="你想問的問題"
          />
          {p.question && <button type="button" class="btn small" onClick={() => p.onQuestion('')}>清除問題</button>}
        </div>
      </section>

      <section class="panel" aria-labelledby="spread-title">
        <h2 id="spread-title">選擇牌陣</h2>
        <div class="spreads" role="radiogroup" aria-labelledby="spread-title">
          {SPREADS.map((s) => (
            <label class={`spread-opt${s.id === p.spreadId ? ' selected' : ''}`} key={s.id}>
              <input type="radio" name="spread" value={s.id} checked={s.id === p.spreadId} onChange={() => p.onSpread(s.id)} />
              <span class="spread-name">{s.name}</span>
              <span class="spread-sum">{s.summary}</span>
              {!s.custom && <span class="spread-pos">{s.positions.map((x, i) => `${i + 1}. ${x.name}`).join('　')}</span>}
            </label>
          ))}
        </div>

        {spread.custom && (
          <div class="stepper" role="group" aria-label="自選抽牌張數">
            <button type="button" class="btn icon" aria-label="減少一張" onClick={() => p.onCustomCount(clamp(p.customCount - 1))} disabled={p.customCount <= 1}>−</button>
            <label>
              <span class="sr-only">張數</span>
              <input type="number" inputMode="numeric" min={1} max={CUSTOM_MAX} value={p.customCount}
                onChange={(e) => p.onCustomCount(clamp(Number((e.target as HTMLInputElement).value)))} />
            </label>
            <span>張</span>
            <button type="button" class="btn icon" aria-label="增加一張" onClick={() => p.onCustomCount(clamp(p.customCount + 1))} disabled={p.customCount >= CUSTOM_MAX}>+</button>
            <span class="muted small">（1–{CUSTOM_MAX}）</span>
          </div>
        )}

        <label class="switch">
          <input type="checkbox" checked={p.settings.reversals} onChange={(e) => p.onSettings({ ...p.settings, reversals: (e.target as HTMLInputElement).checked })} />
          <span>包含逆位（每張 50% 機率）</span>
        </label>
      </section>

      <div class="draw-bar">
        <button type="button" class="btn primary big" id="draw" onClick={p.onDraw}>洗牌並抽 {count} 張</button>
      </div>
    </>
  );
}
