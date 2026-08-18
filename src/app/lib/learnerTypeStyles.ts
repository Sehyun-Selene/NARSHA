import type { LearnerType } from '../data/learnerTypes';

/**
 * 학습 유형 배지 색 — 단일 출처.
 *
 * 원래 `pages/home/ReviewsByType.tsx` 안에만 있었다. Discover 칩은 유형마다 색이
 * 다른데 `/methodology` 의 6유형 카드는 전부 같은 파란색이라, 같은 유형이 화면마다
 * 다른 색으로 보였다. 한 곳에서 정의해 두 화면이 같은 값을 쓴다.
 *
 * `data/learnerTypes.ts` 의 `color` 필드와는 별개다 — 그쪽은 전부 파란 계열
 * 단색이고, 여기 값은 유형을 구별하기 위한 그라데이션이다.
 */
export const LEARNER_TYPE_BADGE: Record<LearnerType, { bg: string; text: string }> = {
  '가': { bg: 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]', text: 'text-[#00344f]' },
  '나': { bg: 'bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]', text: 'text-[#1e3a8a]' },
  '다': { bg: 'bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]', text: 'text-[#4c1d95]' },
  '라': { bg: 'bg-gradient-to-br from-[#f472b6] to-[#ec4899]', text: 'text-[#831843]' },
  '마': { bg: 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]', text: 'text-[#78350f]' },
  '바': { bg: 'bg-gradient-to-br from-[#34d399] to-[#10b981]', text: 'text-[#064e3b]' },
};
