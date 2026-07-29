import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

export type ImageAlign = 'left' | 'center' | 'right' | 'full';

/**
 * DeskImage — 기본 Image 확장.
 *  - align: left | center | right | full  (data-align 으로 출력, editor.css 가 스타일)
 *  - caption: figcaption 텍스트
 * 발행본은 figure(+figcaption) 로 렌더되어 DOMPurify 화이트리스트(figure/figcaption/data-align)에 대응한다.
 */
export const DeskImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (el) => el.getAttribute('data-align') || 'center',
        renderHTML: (attrs) => ({ 'data-align': attrs.align }),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-caption') || '',
        renderHTML: (attrs) => (attrs.caption ? { 'data-caption': attrs.caption } : {}),
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const align = node.attrs.align || 'center';
    const caption = node.attrs.caption as string;
    const imgAttrs = mergeAttributes(HTMLAttributes, { 'data-align': align, loading: 'lazy' });
    if (caption) {
      return ['figure', { 'data-align': align, class: 'desk-figure' }, ['img', imgAttrs], ['figcaption', {}, caption]];
    }
    return ['img', imgAttrs];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});

const ALIGNS: ImageAlign[] = ['left', 'center', 'right', 'full'];
const ALIGN_LABEL: Record<ImageAlign, string> = { left: '좌', center: '중', right: '우', full: '전체' };

function ImageNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const align = (node.attrs.align as ImageAlign) || 'center';
  const caption = (node.attrs.caption as string) || '';
  const src = node.attrs.src as string;

  return (
    <NodeViewWrapper
      className="desk-image-nv"
      data-align={align}
      style={{ outline: selected ? '2px solid #8ecdff' : 'none', borderRadius: 12 }}
    >
      {/* 정렬 컨트롤 */}
      <div contentEditable={false} className="flex gap-1 mb-1 justify-center" style={{ opacity: selected ? 1 : 0.35 }}>
        {ALIGNS.map((a) => (
          <button
            key={a}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => updateAttributes({ align: a })}
            className={[
              'px-2 py-0.5 rounded text-[11px]',
              align === a ? 'bg-[#0ea5e9] text-white' : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b]',
            ].join(' ')}
          >
            {ALIGN_LABEL[a]}
          </button>
        ))}
      </div>

      <img src={src} alt={caption} data-align={align} style={{ maxWidth: '100%', borderRadius: 12, display: 'block' }} />

      {/* 캡션 입력 */}
      <input
        contentEditable={false}
        value={caption}
        onChange={(e) => updateAttributes({ caption: e.target.value })}
        placeholder="캡션 (선택) · Caption"
        className="mt-1 w-full text-center bg-transparent border-none outline-none text-[13px] text-[#64748b] dark:text-[#94a3b8] placeholder:text-[#cbd5e1]"
      />
    </NodeViewWrapper>
  );
}
