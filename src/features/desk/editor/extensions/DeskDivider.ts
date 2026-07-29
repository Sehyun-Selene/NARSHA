import { Node, mergeAttributes } from '@tiptap/core';

export type DividerVariant =
  | 'line-short' | 'line-long' | 'bar-thick' | 'wave-v'
  | 'diamond' | 'dots' | 'slash' | 'vertical';

export const DIVIDER_VARIANTS: DividerVariant[] = [
  'line-short', 'line-long', 'bar-thick', 'wave-v', 'diamond', 'dots', 'slash', 'vertical',
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deskDivider: {
      setDeskDivider: (variant: DividerVariant) => ReturnType;
    };
  }
}

/**
 * 구분선 8종. 이미지 에셋 없이 CSS(data-variant)로만 렌더한다.
 * atom div 로 두어 ::before/::after 로 심볼형 구분선까지 표현한다.
 * 발행본: <div data-desk-divider data-variant role="separator"> → editor.css 가 스타일.
 */
export const DeskDivider = Node.create({
  name: 'deskDivider',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      variant: {
        default: 'line-long' as DividerVariant,
        parseHTML: (el) => (el.getAttribute('data-variant') as DividerVariant) || 'line-long',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-desk-divider]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-desk-divider': '', class: 'desk-hr', role: 'separator' })];
  },

  addCommands() {
    return {
      setDeskDivider:
        (variant) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { variant } }),
    };
  },
});
