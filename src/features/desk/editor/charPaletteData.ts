// 문자표 데이터 (PRD §6.6) — 외부 라이브러리 없이 자체 카테고리 팔레트.
export interface CharCategory {
  key: string;
  labelKo: string;
  labelEn: string;
  chars: string[];
}

export const CHAR_CATEGORIES: CharCategory[] = [
  {
    key: 'jamo',
    labelKo: '한글 자모',
    labelEn: 'Hangul',
    chars: [
      'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
      'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
      'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
      'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
    ],
  },
  {
    key: 'punct',
    labelKo: '문장부호',
    labelEn: 'Punctuation',
    chars: [
      '·', '‥', '…', '˚', '˙', '„', '“', '”', '‘', '’',
      '《', '》', '〈', '〉', '「', '」', '『', '』', '【', '】',
      '〔', '〕', '§', '¶', '‡', '†', '№', '☆', '★', '○',
      '●', '◎', '◇', '◆', '□', '■', '△', '▲', '▽', '▼',
    ],
  },
  {
    key: 'arrow',
    labelKo: '화살표',
    labelEn: 'Arrows',
    chars: [
      '→', '←', '↑', '↓', '↔', '↕', '⇒', '⇐', '⇑', '⇓',
      '⇔', '⇕', '➔', '➜', '↗', '↘', '↙', '↖', '⤴', '⤵',
    ],
  },
  {
    key: 'math',
    labelKo: '수학·단위',
    labelEn: 'Math & Units',
    chars: [
      '±', '×', '÷', '≠', '≒', '≤', '≥', '∞', '√', '∑',
      '∫', '°', '′', '″', '㎜', '㎝', '㎞', '㎎', '㎏', '㎡',
      '㎥', '℃', '℉', '％', '₩', '＄', '€', '¥',
    ],
  },
  {
    key: 'bracket',
    labelKo: '괄호·괘선',
    labelEn: 'Brackets & Rules',
    chars: [
      '(', ')', '[', ']', '{', '}', '〔', '〕', '「', '」',
      '『', '』', '‐', '‑', '‒', '–', '—', '⁓', '~', '｜', '‖',
    ],
  },
  {
    key: 'circled',
    labelKo: '원문자·번호',
    labelEn: 'Circled & Numbers',
    chars: [
      '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
      '⑪', '⑫', 'Ⓐ', 'Ⓑ', 'Ⓒ', '⒜', '⒝', '⒞',
      '㉠', '㉡', '㉢', 'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ',
    ],
  },
];

const RECENT_KEY = 'desk-charpalette-recent';
const RECENT_MAX = 12;

export function getRecentChars(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? arr.filter((c): c is string => typeof c === 'string').slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function pushRecentChar(char: string): string[] {
  const next = [char, ...getRecentChars().filter((c) => c !== char)].slice(0, RECENT_MAX);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
  return next;
}
