import type { Lang } from '../../../app/lib/useLang';

/**
 * §3.2 확정 소개 문안. 로그인 모달과 /desk 피드 헤더에서 동일하게 사용한다.
 * n(활성 저자 수)이 null 이면 숫자를 생략한 문장으로 폴백한다.
 */
export function introCopy(n: number | null, lang: Lang): string {
  if (lang === 'ko') {
    const who = n && n > 0 ? `한국어 학습자 ${n}인이` : '한국어 학습자들이';
    return `「나의 한국어 책상」은 2026 국민공공외교 사업의 일환으로 만들어진 기록 공간으로, 인도네시아와 필리핀의 ${who} 자신의 학습 여정을 직접 기록하는 곳입니다. 누구나 이들의 학습 여정을 읽어보고 함께할 수 있습니다.`;
  }
  const who = n && n > 0 ? `${n} Korean-language learners` : 'Korean-language learners';
  return `Korean Desks of the World is an archive created as part of the 2026 Korean Public Diplomacy Project, where ${who} in Indonesia and the Philippines record their own learning journeys. Anyone is welcome to read along and join them.`;
}

export const DESK_TITLE = {
  ko: '나의 한국어 책상',
  en: 'Korean Desks of the World',
} as const;

export const READ_NO_LOGIN = {
  ko: '읽기에는 로그인이 필요하지 않습니다',
  en: 'No login needed to read',
} as const;
