import { Node } from '@tiptap/core';

export interface DeskDateCardAttrs {
  date: string; // ISO yyyy-MM-dd
  endDate: string | null;
  label: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deskDateCard: {
      setDeskDateCard: (attrs: DeskDateCardAttrs) => ReturnType;
    };
  }
}

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

/** yyyy-MM-dd → "2026.08.14 (목)" (KST 자정 기준, 타임존 이슈 없이 문자열로만 계산). */
function formatKo(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dow = WEEKDAY_KO[new Date(y, m - 1, d).getDay()];
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${dow})`;
}

/** 카드에 표시할 전체 텍스트 (날짜[~종료일] · 라벨). */
export function formatDateCardText(attrs: DeskDateCardAttrs): string {
  const range = attrs.endDate && attrs.endDate !== attrs.date
    ? `${formatKo(attrs.date)} ~ ${formatKo(attrs.endDate)}`
    : formatKo(attrs.date);
  return attrs.label ? `${range} · ${attrs.label}` : range;
}

/**
 * 일정(날짜) 카드 (PRD §6.6). react-day-picker 로 고른 날짜/기간을
 * "2026.08.14 (목) · 오늘의 한국어 공부" 형태 카드로 삽입한다.
 */
export const DeskDateCard = Node.create({
  name: 'deskDateCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      date: { default: null },
      endDate: { default: null },
      label: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-desk-date]',
        getAttrs: (el) => {
          const e = el as HTMLElement;
          return {
            date: e.getAttribute('data-date'),
            endDate: e.getAttribute('data-end-date') || null,
            label: e.getAttribute('data-label') || null,
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const attrs = node.attrs as DeskDateCardAttrs;
    return [
      'div',
      {
        'data-desk-date': '',
        class: 'desk-date-card',
        'data-date': attrs.date,
        'data-end-date': attrs.endDate ?? '',
        'data-label': attrs.label ?? '',
      },
      ['span', { class: 'desk-date-card-icon', 'aria-hidden': 'true' }, '📅'],
      ['span', { class: 'desk-date-card-text' }, formatDateCardText(attrs)],
    ];
  },

  addCommands() {
    return {
      setDeskDateCard:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
