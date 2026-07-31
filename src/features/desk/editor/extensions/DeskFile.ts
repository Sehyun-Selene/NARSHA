import { Node } from '@tiptap/core';

export interface DeskFileAttrs {
  url: string;
  name: string;
  size: number;
  ext: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deskFile: {
      setDeskFile: (attrs: DeskFileAttrs) => ReturnType;
    };
  }
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes < 1024) return `${bytes || 0}B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}

/**
 * 파일 첨부 다운로드 카드 (PRD §6.6). 원본 파일은 desk-media 버킷에 있고
 * 본문에는 파일명·확장자·용량만 표시하는 링크 카드를 삽입한다.
 */
export const DeskFile = Node.create({
  name: 'deskFile',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
      name: { default: null },
      size: { default: 0 },
      ext: { default: '' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-desk-file]',
        getAttrs: (el) => {
          const e = el as HTMLElement;
          return {
            url: e.getAttribute('data-url'),
            name: e.getAttribute('data-name'),
            size: Number(e.getAttribute('data-size')) || 0,
            ext: e.getAttribute('data-ext') ?? '',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { url, name, size, ext } = node.attrs as DeskFileAttrs;
    return [
      'div',
      {
        'data-desk-file': '',
        class: 'desk-file-card',
        'data-url': url,
        'data-name': name,
        'data-size': String(size ?? 0),
        'data-ext': ext,
      },
      [
        'a',
        {
          href: url,
          download: name,
          target: '_blank',
          rel: 'noopener noreferrer nofollow',
          class: 'desk-file-card-link',
        },
        ['span', { class: 'desk-file-icon', 'aria-hidden': 'true' }, '📎'],
        [
          'div',
          { class: 'desk-file-info' },
          ['span', { class: 'desk-file-name' }, name ?? ''],
          ['span', { class: 'desk-file-meta' }, `${(ext ?? '').toUpperCase()} · ${formatBytes(Number(size) || 0)}`],
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setDeskFile:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
