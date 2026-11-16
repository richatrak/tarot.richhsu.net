export interface Position {
  name: string;
  meaning: string;
  /** Grid placement for the layout view (1-based CSS grid lines). */
  col?: number;
  row?: number;
  rowSpan?: number;
  /** Card is laid sideways across another (Celtic Cross position 2). */
  crossing?: boolean;
}

export interface Spread {
  id: string;
  name: string;
  summary: string;
  cols: number;
  rows: number;
  positions: Position[];
  /** Custom spreads have variable count; positions are generated. */
  custom?: boolean;
}

export const SPREADS: Spread[] = [
  {
    id: 'single',
    name: '單張牌',
    summary: '一張牌聚焦一個問題，最適合入門與日常反思。',
    cols: 1, rows: 1,
    positions: [{ name: '核心訊息', meaning: '此刻最值得你留意的主題。', col: 1, row: 1 }],
  },
  {
    id: 'ppf',
    name: '三張：過去・現在・未來',
    summary: '看見事情的來龍去脈與可能的走向。',
    cols: 3, rows: 1,
    positions: [
      { name: '過去', meaning: '影響目前狀況的經驗或根源。', col: 1, row: 1 },
      { name: '現在', meaning: '你目前所處的狀態與核心課題。', col: 2, row: 1 },
      { name: '未來', meaning: '若照目前方向走，可能發展的趨勢（並非定局）。', col: 3, row: 1 },
    ],
  },
  {
    id: 'sao',
    name: '三張：現況・行動・結果',
    summary: '偏重實際行動，幫你想下一步。',
    cols: 3, rows: 1,
    positions: [
      { name: '現況', meaning: '問題目前的樣貌。', col: 1, row: 1 },
      { name: '建議行動', meaning: '可以嘗試的態度或做法。', col: 2, row: 1 },
      { name: '可能結果', meaning: '採取該行動後可能出現的方向。', col: 3, row: 1 },
    ],
  },
  {
    id: 'choice',
    name: '二選一（5 張）',
    summary: '在兩個選項間猶豫時，比較各自的過程與走向。',
    cols: 3, rows: 3,
    positions: [
      { name: '你的現況', meaning: '做選擇時你真正的狀態與動機。', col: 2, row: 3 },
      { name: '選項 A：過程', meaning: '選擇 A 時會經歷的狀況。', col: 1, row: 2 },
      { name: '選項 B：過程', meaning: '選擇 B 時會經歷的狀況。', col: 3, row: 2 },
      { name: '選項 A：走向', meaning: '選擇 A 可能帶來的發展。', col: 1, row: 1 },
      { name: '選項 B：走向', meaning: '選擇 B 可能帶來的發展。', col: 3, row: 1 },
    ],
  },
  {
    id: 'celtic',
    name: '凱爾特十字（10 張）',
    summary: '經典的完整牌陣，適合想深入梳理的大問題。',
    cols: 4, rows: 4,
    positions: [
      { name: '現況', meaning: '問題的核心與你目前的處境。', col: 2, row: 2, rowSpan: 2 },
      { name: '挑戰', meaning: '橫跨在你面前的阻礙或助力。', col: 2, row: 2, rowSpan: 2, crossing: true },
      { name: '根基', meaning: '深層原因，或不常意識到的基礎。', col: 2, row: 4 },
      { name: '過去', meaning: '正在離開、逐漸淡去的影響。', col: 1, row: 2, rowSpan: 2 },
      { name: '意識目標', meaning: '你有意識追求或期待的事。', col: 2, row: 1 },
      { name: '近未來', meaning: '接下來一段時間可能浮現的狀況。', col: 3, row: 2, rowSpan: 2 },
      { name: '你的態度', meaning: '你看待這件事的方式與立場。', col: 4, row: 4 },
      { name: '外在環境', meaning: '他人與周遭環境的影響。', col: 4, row: 3 },
      { name: '希望與恐懼', meaning: '你內心期待或擔心的部分。', col: 4, row: 2 },
      { name: '可能走向', meaning: '綜合以上因素，事情可能的發展。', col: 4, row: 1 },
    ],
  },
  {
    id: 'custom',
    name: '自選張數',
    summary: '不用牌陣，自己決定抽幾張，依抽出順序閱讀。',
    cols: 0, rows: 0,
    positions: [],
    custom: true,
  },
];

export const CUSTOM_MAX = 78;
export const CUSTOM_DEFAULT = 3;

export function getSpread(id: string): Spread {
  return SPREADS.find((s) => s.id === id) ?? SPREADS[0];
}

/** Positions for a reading; custom spreads get numbered positions. */
export function positionsFor(spread: Spread, count: number): Position[] {
  if (!spread.custom) return spread.positions;
  return Array.from({ length: count }, (_, i) => ({
    name: `第 ${i + 1} 張`,
    meaning: '依抽出順序閱讀，留意牌與牌之間的關聯。',
  }));
}

export function countFor(spread: Spread, customCount: number): number {
  return spread.custom ? customCount : spread.positions.length;
}
