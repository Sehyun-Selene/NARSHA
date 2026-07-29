import { Node, mergeAttributes, nodePasteRule } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import EmbedFacade from './EmbedFacade';
import { parseEmbed, type EmbedProvider } from './embed';

// 붙여넣기 감지용 — 지원 4개 호스트 URL
const EMBED_URL_RE =
  /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?\S+|embed\/\S+|shorts\/\S+)|youtu\.be\/\S+|vimeo\.com\/\S+|instagram\.com\/(?:p|reel|tv)\/\S+|tiktok\.com\/\S+)/g;

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    deskEmbed: {
      setDeskEmbed: (url: string) => ReturnType;
    };
  }
}

/**
 * 외부 영상 임베드 노드 (façade). YouTube·Vimeo·Instagram·TikTok URL 을
 * 붙여넣으면 자동 변환된다. 저장 HTML 은 iframe 없는 placeholder div 라
 * DOMPurify 를 통과하고, 발행본에서 React 로 하이드레이션된다.
 */
export const DeskEmbed = Node.create({
  name: 'deskEmbed',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      provider: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-provider'),
        renderHTML: (attrs) => (attrs.provider ? { 'data-provider': attrs.provider } : {}),
      },
      url: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-url'),
        renderHTML: (attrs) => (attrs.url ? { 'data-url': attrs.url } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-desk-embed]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-desk-embed': '', class: 'desk-embed' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeView);
  },

  addCommands() {
    return {
      setDeskEmbed:
        (url: string) =>
        ({ commands }) => {
          const info = parseEmbed(url);
          if (!info) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { provider: info.provider, url: info.url },
          });
        },
    };
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: EMBED_URL_RE,
        type: this.type,
        getAttributes: (match) => {
          const info = parseEmbed(match[0]);
          return info ? { provider: info.provider, url: info.url } : false;
        },
      }),
    ];
  },
});

function EmbedNodeView({ node }: NodeViewProps) {
  const provider = node.attrs.provider as EmbedProvider;
  const url = node.attrs.url as string;
  return (
    <NodeViewWrapper className="desk-embed-nv my-4">
      <div contentEditable={false}>
        {provider && url ? <EmbedFacade provider={provider} url={url} /> : null}
      </div>
    </NodeViewWrapper>
  );
}
