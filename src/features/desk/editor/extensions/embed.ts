export type EmbedProvider = 'youtube' | 'vimeo' | 'instagram' | 'tiktok';

export interface EmbedInfo {
  provider: EmbedProvider;
  id: string;          // videoId 또는 원본 경로 식별자
  url: string;         // 원본 URL
  embedUrl: string | null;   // iframe src (youtube/vimeo). ig/tiktok 은 null → 링크 카드
  thumbnail: string | null;  // 썸네일 (youtube 만 무API 제공)
}

const YT = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
const VIMEO = /vimeo\.com\/(?:video\/)?(\d+)/;
const INSTA = /instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/;
const TIKTOK = /tiktok\.com\/(?:@[\w.-]+\/video\/(\d+)|v\/(\d+))/;

/** URL 하나가 지원 임베드면 EmbedInfo, 아니면 null. */
export function parseEmbed(raw: string): EmbedInfo | null {
  const url = raw.trim();

  let m = url.match(YT);
  if (m) {
    const id = m[1];
    return {
      provider: 'youtube',
      id,
      url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    };
  }

  m = url.match(VIMEO);
  if (m) {
    return { provider: 'vimeo', id: m[1], url, embedUrl: `https://player.vimeo.com/video/${m[1]}`, thumbnail: null };
  }

  m = url.match(INSTA);
  if (m) {
    return { provider: 'instagram', id: m[1], url, embedUrl: null, thumbnail: null };
  }

  m = url.match(TIKTOK);
  if (m) {
    return { provider: 'tiktok', id: m[1] || m[2], url, embedUrl: null, thumbnail: null };
  }

  return null;
}

export const PROVIDER_LABEL: Record<EmbedProvider, string> = {
  youtube: 'YouTube',
  vimeo: 'Vimeo',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};
