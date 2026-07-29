import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import type { Profile } from '../types';
import { DeskAuthContext, type DeskAuthValue } from './useDeskAuth';

/**
 * 「나의 한국어 책상」 세션 컨텍스트.
 * supabase.auth.onAuthStateChange 를 구독해 session/user/profile 을 유지한다.
 * App.tsx 에서 <RouterProvider> 를 감싼다.
 *
 * 기존 리뷰·설문의 localStorage 익명 방식은 건드리지 않는다 — 이 컨텍스트는
 * /desk 영역에서만 사용된다 (이원 구조).
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 최신 세션 유저 id 를 ref 로 들고 있어, 프로필 조회 응답이 늦게 와도
  // 이미 로그아웃/전환된 경우 stale 결과를 무시한다.
  const currentUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // 조회 도중 유저가 바뀌었으면 버린다
    if (currentUserId.current !== userId) return;
    if (error) {
      setProfile(null);
      return;
    }
    setProfile((data as Profile) ?? null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(currentUserId.current);
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // onAuthStateChange 가 상태를 정리하지만, 즉시 반영을 위해 선반영
    currentUserId.current = null;
    setSession(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    let active = true;

    // 1) 초기 세션
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const s = data.session;
      currentUserId.current = s?.user.id ?? null;
      setSession(s);
      await loadProfile(s?.user.id ?? null);
      if (active) setLoading(false);
    });

    // 2) 이후 변경 구독
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      currentUserId.current = s?.user.id ?? null;
      setSession(s);
      // 프로필은 비동기로 갱신 (구독 콜백은 동기로 짧게 유지)
      void loadProfile(s?.user.id ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value: DeskAuthValue = {
    session,
    user: session?.user ?? null,
    profile,
    loading,
    refreshProfile,
    signOut,
  };

  return <DeskAuthContext.Provider value={value}>{children}</DeskAuthContext.Provider>;
}
