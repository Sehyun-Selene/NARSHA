import { useEffect, useMemo, useRef } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import EmbedFacade from '../editor/extensions/EmbedFacade';
import type { EmbedProvider } from '../editor/extensions/embed';
import { sanitizeDeskHtml } from './sanitize';

export { sanitizeDeskHtml };

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
