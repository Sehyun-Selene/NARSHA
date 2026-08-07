import type { ReactNode } from 'react';

/**
 * 사전 문자열의 인라인 강조를 렌더한다.
 *   `**...**` → 강조 (기본: sky 그라디언트 굵게)
 *   `~~...~~` → 취소선 (기본: 보조색)
 *
 * 문자열에 HTML 을 넣지 않기 위한 장치다 — `dangerouslySetInnerHTML` 를 쓰지 않는다.
 */

const TOKEN = /(\*\*[^*]+\*\*|~~[^~]+~~)/g;

const DEFAULT_STRONG =
  'bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] font-extrabold';
const DEFAULT_STRIKE = 'line-through text-[#64748b] dark:text-[#8a94a6] font-normal';

export function rich(
  text: string,
  opts?: { strong?: string; strike?: string },
): ReactNode {
  const strongClass = opts?.strong ?? DEFAULT_STRONG;
  const strikeClass = opts?.strike ?? DEFAULT_STRIKE;

  return text.split(TOKEN).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <span key={i} className={strongClass}>{part.slice(2, -2)}</span>;
    }
    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <span key={i} className={strikeClass}>{part.slice(2, -2)}</span>;
    }
    return part;
  });
}
