import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '../types';

export interface DeskAuthValue {
  /** Supabase 세션. 비로그인 시 null. */
  session: Session | null;
  user: User | null;
  /** profiles 행. 로그인했지만 아직 로드 중이거나 프로필 미생성이면 null. */
  profile: Profile | null;
  /** 초기 세션·프로필 확인이 끝나기 전까지 true. */
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const DeskAuthContext = createContext<DeskAuthValue | null>(null);

export function useDeskAuth(): DeskAuthValue {
  const ctx = useContext(DeskAuthContext);
  if (!ctx) {
    throw new Error('useDeskAuth 는 <AuthProvider> 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
