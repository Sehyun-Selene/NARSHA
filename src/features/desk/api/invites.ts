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
