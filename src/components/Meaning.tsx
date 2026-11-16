import { getCard, SUIT_INFO } from '../data/cards';
import type { Position } from '../data/spreads';
import type { DrawnCard } from '../lib/draw';

export function Meaning({ drawn, position, idPrefix = 'm' }: { drawn: DrawnCard; position?: Position; idPrefix?: string }) {
  const c = getCard(drawn.cardId);
  const suit = c.suit ? SUIT_INFO[c.suit] : null;
  return (
    <article class="meaning" id={`${idPrefix}-${drawn.order}`} tabIndex={-1} data-order={drawn.order}>
      <header>
        {position && <p class="m-pos"><span class="badge static">{drawn.order}</span>{position.name}<span class="m-posdesc">｜{position.meaning}</span></p>}
        <h3>
          {c.name}
          <span class={`orient ${drawn.reversed ? 'rev' : 'up'}`}>{drawn.reversed ? '逆位' : '正位'}</span>
        </h3>
        <p class="m-sub">{c.nameEn}{suit ? `・${suit.element}元素・${suit.theme}` : '・大阿爾克那'}</p>
      </header>
      <p class="m-kw"><strong>關鍵字：</strong>{drawn.reversed ? c.keywordsReversed : c.keywordsUpright}</p>
      <p>{drawn.reversed ? c.reversed : c.upright}</p>
      <p class="m-tip"><strong>反思提示：</strong>{c.tip}</p>
      {c.status === 'draft' && <p class="m-draft">牌意為初稿，尚未經人工審閱</p>}
    </article>
  );
}
