import DOMPurify from 'dompurify';

// 발행본 렌더/저장 시 허용할 태그·속성 화이트리스트.
// Tiptap 출력(서식·목록·표·이미지) + 커스텀 구분선/인용구(data-variant) + 임베드 placeholder(div).
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
  'target', 'rel', 'loading', 'role', 'download',
  'colspan', 'rowspan',
  'data-variant', 'data-align', 'data-type',
  'data-desk-embed', 'data-provider', 'data-url',
];

let hookInstalled = false;
function installHook() {
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

/** content_html 을 화이트리스트로 정화한다. 발행 저장 시·렌더 시 모두 사용. */
export function sanitizeDeskHtml(html: string): string {
  installHook();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ADD_ATTR: ['data-variant', 'data-align', 'target', 'loading'],
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
  });
}
