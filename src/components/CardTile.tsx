import type { ComponentChildren } from 'preact';
import { CardBack, CardFace } from '../art/CardArt';
import { getCard } from '../data/cards';
import type { Position } from '../data/spreads';
import type { DrawnCard } from '../lib/draw';

interface Props {
  drawn: DrawnCard;
  position: Position;
  /** Delay (ms) before the flip-reveal animation; undefined = no animation. */
  revealDelay?: number;
  onSelect?: () => void;
  showLabel?: boolean;
  /** A card laid across this one (Celtic Cross #2). */
  crossing?: ComponentChildren;
  /** Extra label lines rendered under this card's label. */
  extraLabel?: ComponentChildren;
  /** Render only the card button (caller provides the wrapper). */
  bare?: boolean;
}

export function cardA11yLabel(drawn: DrawnCard, position: Position) {
  const card = getCard(drawn.cardId);
  return `第 ${drawn.order} 張，${position.name}：${card.name}，${drawn.reversed ? '逆位' : '正位'}`;
}

export function CardTile({ drawn, position, revealDelay, onSelect, showLabel = true, crossing, extraLabel, bare }: Props) {
  const card = getCard(drawn.cardId);
  const style = {
    gridColumn: position.col ? String(position.col) : undefined,
    gridRow: position.row ? `${position.row} / span ${position.rowSpan ?? 1}` : undefined,
    '--d': revealDelay !== undefined ? `${revealDelay}ms` : undefined,
  } as Record<string, string | undefined>;
  const button = (
    <button type="button" class="tile-btn" onClick={onSelect} aria-label={cardA11yLabel(drawn, position) + '。顯示牌意'}>
      <span class="badge" aria-hidden="true">{drawn.order}</span>
      <span class={`flip${revealDelay !== undefined ? ' reveal' : ''}`}>
        <span class="face back"><CardBack /></span>
        <span class={`face front${drawn.reversed ? ' is-reversed' : ''}`}><CardFace cardId={card.id} /></span>
      </span>
    </button>
  );
  if (bare) return <span style={{ '--d': style['--d'] } as Record<string, string | undefined>}>{button}</span>;
  return (
    <div
      class="tile"
      style={style}
      data-order={drawn.order}
      data-card={card.id}
      data-reversed={String(drawn.reversed)}
    >
      {button}
      {crossing}
      {showLabel && (
        <div class="tile-label" aria-hidden="true">
          <span class="pos">{position.name}</span>
          <span class={`orient ${drawn.reversed ? 'rev' : 'up'}`}>{drawn.reversed ? '逆位 ↓' : '正位 ↑'}</span>
        </div>
      )}
      {extraLabel}
    </div>
  );
}
