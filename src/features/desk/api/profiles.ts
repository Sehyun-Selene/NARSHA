import { supabase } from '../../../lib/supabase';
import type { Profile } from '../types';

/** handle 로 프로필 조회. 없으면 null. (공개 읽기 가능) */
export async function getProfileByHandle(handle: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .maybeSingle();

  if (error) throw error;
  return (data as Profile) ?? null;
}

/** 활성 저자 목록 (피드 헤더 아바타 · 필터용). 최신 가입 순. */
export async function listActiveAuthors(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_active', true)
    .in('role', ['author', 'admin'])
    .order('created_at', { ascending: true });

  if (error) throw error;
  // 운영자(narsha-team 등)는 피드 저자 리스트에서 제외한다
  return (data as Profile[]).filter((p) => p.role === 'author');
}

/**
 * 활성 저자 수. §3.2 소개 문안의 {N} 렌더용.
 * 조회 실패나 0이면 null 을 반환해 호출측이 숫자 생략 문장으로 폴백한다.
 */
export async function countActiveAuthors(): Promise<number | null> {
  const { count, error } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('role', 'author');

  if (error || !count) return null;
  return count;
}
