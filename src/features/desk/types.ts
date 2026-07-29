// 「나의 한국어 책상」 도메인 타입.
// DB Row 형태는 src/lib/supabase.ts 에 정의(기존 apps/reviews 컨벤션)하고,
// 여기서는 앱 코드가 쓰기 좋은 별칭·파생 타입만 둔다.

import type {
  ProfileRow,
  DeskPostRow,
  DeskPostRevisionRow,
  DeskMediaRow,
  DeskFeedRow,
  DeskDoc,
  DeskRole,
  DeskParticipantType,
  DeskPostStatus,
  DeskLang,
} from '../../lib/supabase';

export type {
  DeskDoc,
  DeskRole,
  DeskParticipantType,
  DeskPostStatus,
  DeskLang,
};

export type Profile = ProfileRow;
export type DeskPost = DeskPostRow;
export type DeskPostRevision = DeskPostRevisionRow;
export type DeskMedia = DeskMediaRow;
export type DeskFeedItem = DeskFeedRow;

export type Country = 'ID' | 'PH';

export const COUNTRY_LABEL: Record<string, { ko: string; en: string }> = {
  ID: { ko: '인도네시아', en: 'Indonesia' },
  PH: { ko: '필리핀', en: 'Philippines' },
};

/** 크리에이터 파트너 배지 표시 대상인지. */
export function isPartner(p: { participant_type: DeskParticipantType }): boolean {
  return p.participant_type === 'creator_partner';
}
