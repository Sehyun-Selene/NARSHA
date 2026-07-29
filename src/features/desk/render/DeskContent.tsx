import { useMemo } from 'react';
import DOMPurify from 'dompurify';

// 발행본 렌더 시 허용할 태그·속성 화이트리스트.
// Tiptap 출력(서식·목록·표·이미지) + 커스텀 구분선/인용구(data-variant)를 포함한다.
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
  'target', 'rel',
  'colspan', 'rowspan',
  // 커스텀 노드 식별
  'data-variant', 'data-align', 'data-type',
];

let hookInstalled = false;
function installAnchorHook() {
  if (hookInstalled) return;
  hookInstalled = true;
  // 모든 외부 링크에 안전 속성 강제 (PRD §6.3)
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
    // data-* 는 기본 허용(ALLOW_DATA_ATTR)이지만 명시 태그 목록과 함께 확실히 열어둔다
    ADD_ATTR: ['data-variant', 'data-align', 'target', 'loading'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  });
}

/**
 * 발행 글 본문 렌더러.
 * content_html 을 DOMPurify 로 정화한 뒤에만 dangerouslySetInnerHTML 로 출력한다.
 * .desk-prose 스코프 스타일(T5 editor.css)로 전역 Tailwind 리셋과 격리된다.
 */
export default function DeskContent({ html }: { html: string | null | undefined }) {
  const clean = useMemo(() => sanitizeDeskHtml(html ?? ''), [html]);
  return (
    <div
      className="desk-prose"
      // 정화 완료된 HTML 만 주입한다
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
