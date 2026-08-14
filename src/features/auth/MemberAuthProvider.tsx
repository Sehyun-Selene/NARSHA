import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase, type MemberRow } from '../../lib/supabase';
import { tNow } from '../../app/i18n';
import { MemberAuthContext, type MemberAuthValue } from './useMemberAuth';
import { syncLearnerType } from './learnerTypeSync';

/**
 * 일반회원 세션 유지 (GNB PRD REQ-C / C-3).
 *
 * desk 의 AuthProvider 와 나란히 마운트된다. 같은 Supabase 세션을 구독하지만
 * 조회하는 표가 다르다(`members` vs `profiles`) — desk 코드를 건드리지 않기 위해
 * 합치지 않았다 (결정 D6).
 *
 * Google 로그인으로 처음 들어온 계정에는 `members` 행이 없다. OAuth 는 가입 폼을
 * 거치지 않기 때문이다. 그래서 세션이 잡히는 시점에 행이 없으면 여기서 만든다.
 */
/**
 * 학습유형 동기화는 세션당 한 번만 돌린다 (REQ-G).
 * `onAuthStateChange` 는 토큰 갱신 때도 발화하므로, 막지 않으면 몇 분마다
 * 같은 토스트가 다시 뜬다.
 */
const syncedUsers = new Set<string>();

async function syncLearnerTypeOnce(userId: string): Promise<void> {
  if (syncedUsers.has(userId)) return;
  syncedUsers.add(userId);
  try {
    const r = await syncLearnerType(userId);
    if (r.action === 'pulled') toast.info(tNow('ltype.pulled').replace('{t}', r.type));
    else if (r.action === 'pushed') toast.success(tNow('ltype.pushed').replace('{t}', r.type));
  } catch {
    // 동기화 실패는 조용히 넘긴다 — 로컬 값이 살아 있어 사용에 지장이 없다
  }
}

export default function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<MemberRow | null>(null);
  const [loading, setLoading] = useState(true);

  // 조회 응답이 늦게 도착했을 때 이미 다른 사용자로 바뀐 결과를 버리기 위한 기준값
  const currentUserId = useRef<string | null>(null);

  const loadMember = useCallback(async (s: Session | null) => {
    const userId = s?.user.id ?? null;
    if (!userId) {
      setMember(null);
      return;
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (currentUserId.current !== userId) return;
    if (error) {
      setMember(null);
      return;
    }
    if (data) {
      setMember(data as MemberRow);
      void syncLearnerTypeOnce(userId);
      return;
    }

    // 행이 없는 경우는 둘 중 하나다.
    //   (a) desk 저자로 로그인함 → members 행을 만들면 안 된다
    //   (b) Google 로그인으로 처음 들어온 일반회원 → 여기서 행을 만든다
    const { data: authorRow } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (currentUserId.current !== userId) return;
    if (authorRow) {
      setMember(null);
      return;
    }

    // 표시명은 OAuth 프로필에서 가져오고, 없으면 이메일 앞부분을 쓴다.
    // 빈 문자열이 되면 not null 제약에 걸리므로 최종 폴백을 둔다.
    const meta = s?.user.user_metadata ?? {};
    const fallbackName =
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      (typeof meta.name === 'string' && meta.name.trim()) ||
      (s?.user.email ?? '').split('@')[0] ||
      'Learner';

    const { data: created, error: createError } = await supabase
      .from('members')
      .insert({ id: userId, display_name: fallbackName.slice(0, 40) })
      .select('*')
      .single();

    if (currentUserId.current !== userId) return;
    setMember(createError ? null : (created as MemberRow));
    if (!createError) void syncLearnerTypeOnce(userId);
  }, []);

  const refreshMember = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    await loadMember(data.session);
  }, [loadMember]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    currentUserId.current = null;
    setSession(null);
    setMember(null);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      const s = data.session;
      currentUserId.current = s?.user.id ?? null;
      setSession(s);
      await loadMember(s);
      if (active) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      currentUserId.current = s?.user.id ?? null;
      setSession(s);
      void loadMember(s);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [loadMember]);

  const value: MemberAuthValue = {
    loading,
    session,
    user: session?.user ?? null,
    member,
    refreshMember,
    signOut,
  };

  return <MemberAuthContext.Provider value={value}>{children}</MemberAuthContext.Provider>;
}
