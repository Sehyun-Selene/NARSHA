import { useEffect, useMemo, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import DOMPurify from 'dompurify';
import EmbedFacade from '../editor/extensions/EmbedFacade';
import type { EmbedProvider } from '../editor/extensions/embed';

// 발행본 렌더 시 허용할 태그·속성 화이트리스트.
// Tiptap 출력(서식·목록·표·이미지) + 커스텀 구분선/인용구(data-variant) + 임베드 placeholder(div)를 포함한다.
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'div',
  'h2', 'h3', 'h4',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'sub', 'sup',
  'ul', 'ol', 'li',
  'blockquote', 'hr',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'style',
  'target', 'rel', 'loading', 'role',
  'colspan', 'rowspan',
  // 커스텀 노드 식별
  'data-variant', 'data-align', 'data-type',
  // 외부 영상 임베드 placeholder
  'data-desk-embed', 'data-provider', 'data-url',
];

let hookInstalled = false;
function installAnchorHook() {
  if (hookInstalled) return;
  hookInstalled = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
    if (node.tagName === 'IMG') {
      node.setAttribute('loading', 'lazy');
    }
  });
}

/** content_html 을 화이트리스트로 정화한다. 저장 시·렌더 시 모두 사용. */
export function sanitizeDeskHtml(html: string): string {
  installAnchorHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['data-variant', 'data-align', 'target', 'loading'],
    // iframe 등은 저장 HTML 에 두지 않는다. 임베드는 placeholder → 런타임 하이드레이션.
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  });
}

/**
 * 발행 글 본문 렌더러.
 * content_html 을 DOMPurify 로 정화한 뒤에만 dangerouslySetInnerHTML 로 출력하고,
 * .desk-embed placeholder 를 EmbedFacade(iframe façade)로 하이드레이션한다.
 */
export default function DeskContent({ html }: { html: string | null | undefined }) {
  const clean = useMemo(() => sanitizeDeskHtml(html ?? ''), [html]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const nodes = el.querySelectorAll<HTMLElement>('div.desk-embed[data-provider][data-url]');
    const roots: Root[] = [];
    nodes.forEach((n) => {
      const provider = n.getAttribute('data-provider') as EmbedProvider;
      const url = n.getAttribute('data-url');
      if (!provider || !url) return;
      n.innerHTML = '';
      const root = createRoot(n);
      root.render(<EmbedFacade provider={provider} url={url} />);
      roots.push(root);
    });
    return () => {
      // 렌더 도중 동기 unmount 경고 회피
      roots.forEach((r) => setTimeout(() => r.unmount(), 0));
    };
  }, [clean]);

  return (
    <div
      ref={containerRef}
      className="desk-prose"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
