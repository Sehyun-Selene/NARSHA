import type { ReactNode } from 'react';

/**
 * 저자 전용 라우트 가드.
 *
 * T1(스켈레톤) 단계에서는 통과용 패스스루다.
 * T2 에서 useDeskAuth 를 붙여 다음을 구현한다:
 *  - loading 중 스켈레톤
 *  - 미로그인 시 /desk/login?next=... 리다이렉트
 *  - profile.is_active === false 안내 화면
 */
export default function RequireAuthor({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
