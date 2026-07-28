// =============================================================================
// redeem-invite — 초대코드 검증 및 계정 생성 (공개 엔드포인트)
//
// 클라이언트는 invite_codes 테이블에 직접 접근할 수 없다. 코드 검증과 계정 생성은
// 오직 이 함수에서만 이루어지며, service_role 키는 런타임 환경변수로만 주입된다.
//
// 배포
//   supabase functions deploy redeem-invite --no-verify-jwt
//   supabase secrets set INVITE_CODE_PEPPER="$(openssl rand -hex 32)"
//   supabase secrets set ALLOWED_ORIGINS="https://narsha-mvp-ver2.vercel.app,http://localhost:5173"
//
// 요청
//   POST { action: 'validate', code }
//   POST { action: 'redeem',   code, email, password,
//          display_name, display_name_en?, handle, country, city?, bio? }
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { hashCode, hashIp, json, corsHeaders, validateHandle } from '../_shared/util.ts';

const RATE_LIMIT_PER_HOUR = 10;

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  }

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'INVALID_BODY' }, 400, origin);
  }

  const ipHash = await hashIp(req);

  // ── rate limit ─────────────────────────────────────────────────────────────
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('invite_redeem_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('attempted_at', since);

  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'RATE_LIMITED' }, 429, origin);
  }

  const logAttempt = (succeeded: boolean) =>
    admin.from('invite_redeem_attempts').insert({ ip_hash: ipHash, succeeded });

  // ── 코드 조회 ──────────────────────────────────────────────────────────────
  const rawCode = (body.code ?? '').trim().toUpperCase();
  if (!rawCode) {
    await logAttempt(false);
    return json({ error: 'CODE_REQUIRED' }, 400, origin);
  }

  let codeHash: string;
  try {
    codeHash = await hashCode(rawCode);
  } catch {
    return json({ error: 'SERVER_MISCONFIGURED' }, 500, origin);
  }

  const { data: invite } = await admin
    .from('invite_codes')
    .select('id, participant_type, expires_at, used_by, revoked')
    .eq('code_hash', codeHash)
    .maybeSingle();

  if (!invite || invite.revoked) {
    await logAttempt(false);
    return json({ error: 'CODE_INVALID' }, 400, origin);
  }
  if (invite.used_by) {
    await logAttempt(false);
    return json({ error: 'CODE_ALREADY_USED' }, 400, origin);
  }
  if (new Date(invite.expires_at) < new Date()) {
    await logAttempt(false);
    return json({ error: 'CODE_EXPIRED' }, 400, origin);
  }

  // ── action: validate ───────────────────────────────────────────────────────
  // 가입 폼을 보여주기 전에 코드만 확인하는 단계
  if (body.action === 'validate') {
    await logAttempt(true);
    return json(
      { ok: true, participant_type: invite.participant_type },
      200,
      origin,
    );
  }

  // ── action: redeem ─────────────────────────────────────────────────────────
  const email = (body.email ?? '').trim().toLowerCase();
  const password = body.password ?? '';
  const handle = (body.handle ?? '').trim().toLowerCase();
  const displayName = (body.display_name ?? '').trim();

  if (!email || !email.includes('@')) {
    await logAttempt(false);
    return json({ error: 'EMAIL_INVALID' }, 400, origin);
  }
  if (password.length < 8) {
    await logAttempt(false);
    return json({ error: 'PASSWORD_TOO_SHORT' }, 400, origin);
  }
  if (!displayName) {
    await logAttempt(false);
    return json({ error: 'DISPLAY_NAME_REQUIRED' }, 400, origin);
  }

  const handleError = validateHandle(handle);
  if (handleError) {
    await logAttempt(false);
    return json({ error: handleError }, 400, origin);
  }

  const { data: taken } = await admin
    .from('profiles')
    .select('id')
    .eq('handle', handle)
    .maybeSingle();

  if (taken) {
    await logAttempt(false);
    return json({ error: 'HANDLE_TAKEN' }, 409, origin);
  }

  // 초대받은 사람만 도달하는 경로이므로 이메일 확인 단계를 건너뛴다.
  // (해외 학습자 대상 확인 메일 미수신 리스크 회피. 비밀번호 재설정은 메일로 가능.)
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !created?.user) {
    await logAttempt(false);
    const already = createError?.message?.toLowerCase().includes('already');
    return json(
      { error: already ? 'EMAIL_ALREADY_REGISTERED' : 'SIGNUP_FAILED' },
      400,
      origin,
    );
  }

  const userId = created.user.id;

  const { error: profileError } = await admin.from('profiles').insert({
    id: userId,
    handle,
    display_name: displayName,
    display_name_en: body.display_name_en?.trim() || null,
    country: body.country?.trim() || null,
    city: body.city?.trim() || null,
    bio: body.bio?.trim() || null,
    channel_url: body.channel_url?.trim() || null,
    role: 'author',
    participant_type: invite.participant_type,
  });

  if (profileError) {
    // 프로필 생성 실패 시 방금 만든 계정을 되돌린다
    await admin.auth.admin.deleteUser(userId);
    await logAttempt(false);
    return json({ error: 'PROFILE_CREATE_FAILED' }, 500, origin);
  }

  // 코드 소진 처리 (동시 요청 대비: used_by 가 아직 비어 있을 때만 갱신)
  const { data: consumed } = await admin
    .from('invite_codes')
    .update({ used_by: userId, used_at: new Date().toISOString() })
    .eq('id', invite.id)
    .is('used_by', null)
    .select('id')
    .maybeSingle();

  if (!consumed) {
    // 다른 요청이 먼저 코드를 소진함 → 롤백
    await admin.from('profiles').delete().eq('id', userId);
    await admin.auth.admin.deleteUser(userId);
    await logAttempt(false);
    return json({ error: 'CODE_ALREADY_USED' }, 409, origin);
  }

  await logAttempt(true);

  // 클라이언트는 이 응답을 받은 뒤 signInWithPassword 로 로그인한다
  return json({ ok: true, handle }, 200, origin);
});
