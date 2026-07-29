import { supabase } from '../../../lib/supabase';
import type { DeskParticipantType } from '../types';

// Edge Function 베이스 URL. 명시 env 가 없으면 Supabase URL 에서 파생한다.
// (redeem-invite 는 --no-verify-jwt 로 공개 배포되지만 게이트웨이가 apikey 를 요구한다.)
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const FUNCTIONS_BASE =
  (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL as string | undefined)?.replace(/\/$/, '') ||
  `${(import.meta.env.VITE_SUPABASE_URL as string)?.replace(/\/$/, '')}/functions/v1`;

async function callFn<T>(name: string, body: unknown): Promise<{ ok: boolean; data: T }> {
  const res = await fetch(`${FUNCTIONS_BASE}/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
    body: JSON.stringify(body),
  });
  let data: T;
  try {
    data = (await res.json()) as T;
  } catch {
    data = {} as T;
  }
  return { ok: res.ok, data };
}

export type ValidateResult =
  | { ok: true; participantType: DeskParticipantType }
  | { ok: false; error: string };

/** 가입 폼을 보이기 전 코드만 확인 (1단계). */
export async function validateInvite(code: string): Promise<ValidateResult> {
  try {
    const { ok, data } = await callFn<{ ok?: boolean; participant_type?: DeskParticipantType; error?: string }>(
      'redeem-invite',
      { action: 'validate', code },
    );
    if (ok && data.ok) {
      return { ok: true, participantType: data.participant_type ?? 'co_creator' };
    }
    return { ok: false, error: data.error ?? 'CODE_INVALID' };
  } catch {
    return { ok: false, error: 'NETWORK' };
  }
}

export interface RedeemPayload {
  code: string;
  email: string;
  password: string;
  display_name: string;
  display_name_en?: string;
  handle: string;
  country?: string;
  city?: string;
  bio?: string;
  channel_url?: string;
}

export type RedeemResult =
  | { ok: true; handle: string }
  | { ok: false; error: string };

/** 코드 소진 + 계정 생성 (최종 제출). 성공 후 클라이언트가 signInWithPassword 한다. */
export async function redeemInvite(payload: RedeemPayload): Promise<RedeemResult> {
  try {
    const { ok, data } = await callFn<{ ok?: boolean; handle?: string; error?: string }>(
      'redeem-invite',
      { action: 'redeem', ...payload },
    );
    if (ok && data.ok) {
      return { ok: true, handle: data.handle ?? payload.handle };
    }
    return { ok: false, error: data.error ?? 'SIGNUP_FAILED' };
  } catch {
    return { ok: false, error: 'NETWORK' };
  }
}

// =============================================================================
// T9 — 운영자 (admin-invites). 운영자 access_token 을 Bearer 로 전송한다.
// =============================================================================

async function callAdminFn<T>(body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  const { data: sess } = await supabase.auth.getSession();
  const token = sess.session?.access_token;
  const res = await fetch(`${FUNCTIONS_BASE}/admin-invites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: ANON,
      Authorization: `Bearer ${token ?? ANON}`,
    },
    body: JSON.stringify(body),
  });
  let data: T;
  try { data = (await res.json()) as T; } catch { data = {} as T; }
  return { ok: res.ok, status: res.status, data };
}

export interface CreatedInvite {
  code: string;
  join_url: string;
  message_ko: string;
  message_en: string;
  invite: { id: string; label: string; participant_type: DeskParticipantType; expires_at: string; created_at: string };
}

export async function adminCreateInvite(input: {
  label: string;
  participantType: DeskParticipantType;
  expiresInDays: number;
}): Promise<CreatedInvite> {
  const { ok, data } = await callAdminFn<CreatedInvite & { error?: string }>({
    action: 'create',
    label: input.label,
    participant_type: input.participantType,
    expires_in_days: input.expiresInDays,
  });
  if (!ok) throw new Error((data as { error?: string }).error ?? 'CREATE_FAILED');
  return data;
}

export type InviteStatus = 'active' | 'used' | 'expired' | 'revoked';

export interface InviteRow {
  id: string;
  label: string | null;
  participant_type: DeskParticipantType;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  revoked: boolean;
  created_at: string;
  status: InviteStatus;
  profiles: { handle: string; display_name: string } | null;
}

export async function adminListInvites(): Promise<InviteRow[]> {
  const { ok, data } = await callAdminFn<{ invites?: InviteRow[]; error?: string }>({ action: 'list' });
  if (!ok) throw new Error(data.error ?? 'LIST_FAILED');
  return data.invites ?? [];
}

export async function adminRevokeInvite(id: string): Promise<void> {
  const { ok, data } = await callAdminFn<{ error?: string }>({ action: 'revoke', id });
  if (!ok) throw new Error(data.error ?? 'REVOKE_FAILED');
}
