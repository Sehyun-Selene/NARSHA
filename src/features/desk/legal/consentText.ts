// 가입·발행 동의 문안의 단일 소스.
// 화면에 표시하는 텍스트와 DB 스냅샷(snapshot_text)이 서로 다른 곳에서
// 따로 관리되면 어긋나기 쉬워, 여기 한 곳에서만 문구를 정의하고
// DeskJoin·PublishModal·redeem-invite 요청이 전부 이 값을 참조한다.
//
// ⚠️ 문안을 수정하면 CONSENT_VERSION 을 반드시 올릴 것 (법무 검토 §7.3 —
// "동의한 문안의 버전"을 특정할 수 있어야 분쟁 시 증빙이 된다).
// 2026-08-14 — 저작권 항목에 활용 주체를 명시하도록 개정.
// 기존 문안은 "나르샤 팀이 ... 사용"으로만 적혀 있어, 지원협약에 따라 외교부·
// 운영사무국이 사업결과물을 활용하는 부분이 기록된 동의에 담기지 않았다.
// 실제로는 저자에게 사전 고지되는 내용이므로, 고지 범위와 기록을 일치시킨다.
// (개정 시점에 실제 저자 계정이 없어 재동의가 필요하지 않았다.)
export const CONSENT_VERSION = 'draft-2026-08-14';

export type ConsentKey = 'termsPrivacy' | 'copyrightLicense' | 'mediaRights';

export const CONSENT_TEXT: Record<ConsentKey, { ko: string; en: string }> = {
  termsPrivacy: {
    ko: '이용약관 및 개인정보처리방침에 동의합니다.',
    en: 'I agree to the Terms of Service and Privacy Policy.',
  },
  copyrightLicense: {
    ko: '내가 쓴 글의 저작권은 나에게 있습니다. 나르샤 팀과 이 사업의 관리기관(외교부·운영사무국)이 사업의 홍보·백서·영상 제작을 위해 내 글의 전부 또는 일부를 사용하는 것에 동의합니다.',
    en: 'I keep the copyright to what I write. I agree that the NARSHA team and this project\'s administering bodies (the Ministry of Foreign Affairs and the operating office) may use all or part of my posts for the project\'s promotion, white paper, and video production.',
  },
  mediaRights: {
    ko: '내가 올리는 사진과 영상은 직접 촬영했거나 사용 허락을 받은 것이며, 다른 사람이 나오는 경우 그 사람의 동의를 받았습니다.',
    en: 'The photos and videos I upload are my own or properly licensed. If other people appear in them, I have their permission.',
  },
};

/** 게시물 발행 시 재확인하는 저작권 문안 (§6.7 · 매 글마다 반복). */
export const PUBLISH_COPYRIGHT_TEXT = {
  ko: '이 글에 사용한 사진·영상·음원은 직접 촬영했거나 사용 허락을 받았습니다.',
  en: 'The photos, videos, and audio used in this post are my own or properly licensed.',
} as const;
