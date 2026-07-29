// handle 클라이언트 검증 — Edge Function 의 validateHandle 과 규칙을 일치시킨다
// (supabase/functions/_shared/util.ts). 서버가 최종 판정하되, 여기서 즉시 피드백한다.

import { supabase } from '../../../lib/supabase';

const HANDLE_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/; // 3~20자

export const RESERVED_HANDLES = new Set([
  'admin', 'administrator', 'api', 'app', 'apps', 'about', 'auth', 'desk',
  'help', 'join', 'login', 'logout', 'manage', 'me', 'new', 'narsha', 'null',
  'privacy', 'reviews', 'root', 'settings', 'signup', 'support', 'survey',
  'system', 'terms', 'undefined', 'user', 'users', 'write', 'www',
]);

export type HandleError = 'HANDLE_FORMAT' | 'HANDLE_RESERVED' | null;

export function validateHandleClient(handle: string): HandleError {
  if (!HANDLE_RE.test(handle)) return 'HANDLE_FORMAT';
  if (RESERVED_HANDLES.has(handle)) return 'HANDLE_RESERVED';
  return null;
}

/** 영문 이름 등에서 기본 handle 후보를 만든다. */
export function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20);
}

/** 중복 시 대안 3개 제안 (rina → rina2 · rina-jkt · rina-kr). */
export function suggestHandles(base: string): string[] {
  const b = slugifyHandle(base) || 'desk';
  const trim = (s: string) => s.slice(0, 20).replace(/-$/, '');
  return [trim(`${b}2`), trim(`${b}-jkt`), trim(`${b}-kr`)].filter(
    (h) => validateHandleClient(h) === null,
  );
}

/** profiles 공개 읽기로 실시간 중복 확인. 사용 가능하면 true. */
export async function isHandleAvailable(handle: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();
  if (error) return true; // 조회 실패는 서버 최종 검증에 맡긴다
  return !data;
}
