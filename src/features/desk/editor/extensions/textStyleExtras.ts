import { Extension } from '@tiptap/core';
import '@tiptap/extension-text-style';

// Tiptap 공식 패키지엔 글자크기·자간 확장이 없어 textStyle 마크에 속성을 얹는
// 방식(공식 문서가 권장하는 패턴)으로 직접 구현한다. Color/Highlight 와 동일하게
// <span style="..."> 로 렌더되어 DOMPurify 화이트리스트(style 속성 허용)를 그대로 통과한다.

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (size: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    letterSpacing: {
      setLetterSpacing: (value: string) => ReturnType;
      unsetLetterSpacing: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (value: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
  }
}

/** 글자 크기 (§6.6: 11/13/15/16/19/24/28/30/34pt). */
export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (el) => el.style.fontSize || null,
            renderHTML: (attrs) => (attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize: null }).run(),
    };
  },
});

/** 자간 (§6.6: 좁게/기본/넓게). */
export const LetterSpacing = Extension.create({
  name: 'letterSpacing',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          letterSpacing: {
            default: null,
            parseHTML: (el) => el.style.letterSpacing || null,
            renderHTML: (attrs) => (attrs.letterSpacing ? { style: `letter-spacing: ${attrs.letterSpacing}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLetterSpacing:
        (value) =>
        ({ chain }) =>
          chain().setMark('textStyle', { letterSpacing: value }).run(),
      unsetLetterSpacing:
        () =>
        ({ chain }) =>
          chain().setMark('textStyle', { letterSpacing: null }).run(),
    };
  },
});

/** 줄간격 (§6.6: 1.0/1.2/1.5/1.8/2.0) — 문단·헤딩 블록 속성. */
export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (el) => (el as HTMLElement).style.lineHeight || null,
            renderHTML: (attrs) => (attrs.lineHeight ? { style: `line-height: ${attrs.lineHeight}` } : {}),
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight:
        (value) =>
        ({ commands, state }) => {
          const { selection } = state;
          const types = this.options.types as string[];
          let ok = true;
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (types.includes(node.type.name)) {
              ok = ok && commands.updateAttributes(node.type.name, { lineHeight: value });
            }
          });
          // 선택 영역이 비어있으면(커서만) 현재 블록에 적용
          if (selection.empty) {
            const node = selection.$from.parent;
            if (types.includes(node.type.name)) {
              return commands.updateAttributes(node.type.name, { lineHeight: value });
            }
          }
          return ok;
        },
      unsetLineHeight:
        () =>
        ({ commands }) => {
          const types = this.options.types as string[];
          return types.every((t) => commands.updateAttributes(t, { lineHeight: null }));
        },
    };
  },
});
