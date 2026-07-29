import Blockquote from '@tiptap/extension-blockquote';

export type QuoteVariant =
  | 'quote-marks' | 'vertical-line' | 'speech-bubble'
  | 'line-quote' | 'postit' | 'frame';

export const QUOTE_VARIANTS: QuoteVariant[] = [
  'quote-marks', 'vertical-line', 'speech-bubble', 'line-quote', 'postit', 'frame',
];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deskBlockquote: {
      setQuoteVariant: (variant: QuoteVariant) => ReturnType;
    };
  }
}

/**
 * 인용구 6종. Blockquote 확장 + variant. CSS(data-variant)로만 스타일.
 * 발행본: <blockquote class="desk-quote" data-variant> → editor.css 가 스타일.
 */
export const DeskBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      variant: {
        default: 'vertical-line' as QuoteVariant,
        parseHTML: (el) => (el.getAttribute('data-variant') as QuoteVariant) || 'vertical-line',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant, class: 'desk-quote' }),
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setQuoteVariant:
        (variant) =>
        ({ chain, editor }) => {
          const c = chain().focus();
          if (!editor.isActive('blockquote')) c.toggleBlockquote();
          return c.updateAttributes(this.name, { variant }).run();
        },
    };
  },
});
