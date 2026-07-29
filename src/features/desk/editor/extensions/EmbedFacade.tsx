import { useState } from 'react';
import { parseEmbed, PROVIDER_LABEL, type EmbedProvider } from './embed';

/**
 * 외부 영상 임베드 façade.
 * youtube/vimeo: 썸네일(또는 provider 배지) → 클릭 시 iframe 로드 (초기 로드 비용 회피).
 * instagram/tiktok: iframe 대신 원본으로 여는 링크 카드.
 * 편집 화면 NodeView 와 발행본 하이드레이션에서 공용.
 */
export default function EmbedFacade({
  provider,
  url,
  interactive = true,
}: {
  provider: EmbedProvider;
  url: string;
  interactive?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const info = parseEmbed(url);
  const embedUrl = info?.embedUrl ?? null;
  const thumbnail = info?.thumbnail ?? null;

  const shell =
    'relative w-full overflow-hidden rounded-[12px] border border-[#e2e8f0] dark:border-[#232a36] bg-[#0c141f]';

  // iframe 로드됨
  if (loaded && embedUrl) {
    return (
      <div className={shell} style={{ aspectRatio: '16 / 9' }}>
        <iframe
          src={`${embedUrl}?autoplay=1`}
          title={PROVIDER_LABEL[provider]}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
          style={{ border: 0 }}
        />
      </div>
    );
  }

  // iframe 지원 provider → 썸네일/플레이 façade
  if (embedUrl) {
    return (
      <button
        type="button"
        onClick={() => interactive && setLoaded(true)}
        className={`${shell} block group`}
        style={{ aspectRatio: '16 / 9' }}
        aria-label={`${PROVIDER_LABEL[provider]} 영상 재생`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[#8ecdff] text-[14px]">{PROVIDER_LABEL[provider]}</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex items-center justify-center w-14 h-14 rounded-full bg-black/60 text-white text-[22px] group-hover:bg-black/75 transition-colors">▶</span>
        </span>
      </button>
    );
  }

  // instagram/tiktok → 링크 카드
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="flex items-center gap-3 rounded-[12px] border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] p-4 hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors no-underline"
    >
      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff] text-[18px]">▶</span>
      <span className="min-w-0">
        <span className="block text-[14px] font-medium text-[#1e293b] dark:text-[#dce3f3]">{PROVIDER_LABEL[provider]}</span>
        <span className="block text-[12px] text-[#94a3b8] truncate">{url}</span>
      </span>
    </a>
  );
}
