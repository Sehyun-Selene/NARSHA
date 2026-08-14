import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { MemberRow } from '../../lib/supabase';

/**
 * 일반회원 세션 컨텍스트 (GNB PRD REQ-C / C-3).
 *
 * desk 저자 인증(`features/desk/auth`)과 **분리**돼 있다. `auth.users` 는 공유하지만
 * 프로필이 담긴 표가 다르다 — 저자는 `profiles`, 일반회원은 `members`.
 * desk 쪽 RLS 정책과 코드를 한 줄도 건드리지 않기 위한 구조다 (결정 D6).
 *
 * Context 와 hook 을 Provider 파일과 나눠 둔 이유는 desk 와 같다 — 같은 파일에
 * 두면 Fast Refresh 가 Provider 를 통째로 다시 만들어 세션이 끊긴다.
 */

export interface MemberAuthValue {
  /** 세션·회원 조회가 모두 끝났는지. 게이팅 판정을 이 값으로 지연시킨다 */
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** 이 계정의 members 행. desk 저자로 로그인한 경우 null 이다 */
  member: MemberRow | null;
  refreshMember: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const MemberAuthContext = createContext<MemberAuthValue | null>(null);

export function useMemberAuth(): MemberAuthValue {
  const v = useContext(MemberAuthContext);
  if (!v) throw new Error('useMemberAuth must be used inside <MemberAuthProvider>');
  return v;
}
