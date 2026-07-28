// =============================================================================
// admin-invites — 초대코드 발급 · 목록 · 회수 (운영자 전용)
//
// ⚠️ 인증 방식에 관한 중요한 변경
//    기존 운영자 페이지는 VITE_ADMIN_PASSWORD(클라이언트 번들에 그대로 포함되는 값)로
//    보호되어 있다. 초대코드 발급은 계정 생성 권한과 직결되므로 그 수준으로는 부족하다.
//    이 함수는 **Supabase Auth 로 로그인한 profiles.role = 'admin' 계정의 JWT** 를 요구한다.
//
//    운영자 계정 만들기 (최초 1회, Supabase 대시보드에서):
//      1) Authentication → Users → Add user 로 팀 계정 생성
//      2) SQL Editor 에서
//           insert into public.profiles (id, handle, display_name, role)
//           values ('<생성된 user id>', 'narsha-team', 'NARSHA Team', 'admin');
//
// 배포
//   supabase functions deploy admin-invites
//
// 요청 (Authorization: Bearer <운영자 access_token>)
//   POST { action: 'create', label, participant_type?, expires_in_days? }
//   POST { action: 'list' }
//   POST { action: 'revoke', id }
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateCode, hashCode, json, corsHeaders } from '../_shared/util.ts';

const SITE_URL =
  Deno.env.get('SITE_URL') ?? 'https://narsha-mvp-ver2.vercel.app';

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(origin) });
  }
  if (req.method !== 'POST') {
    return json({ error: 'METHOD_NOT_ALLOWED' }, 405, origin);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'UNAUTHORIZED' }, 401, origin);

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  // ── 운영자 확인 ────────────────────────────────────────────────────────────
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) {
    return json({ error: 'UNAUTHORIZED' }, 401, origin);
  }

  const { data: profile } = await admin
    .from('profiles')
    .select('id, role')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    return json({ error: 'FORBIDDEN' }, 403, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'INVALID_BODY' }, 400, origin);
  }

  // ── create ─────────────────────────────────────────────────────────────────
  if (body.action === 'create') {
    const label = String(body.label ?? '').trim();
    if (!label) return json({ error: 'LABEL_REQUIRED' }, 400, origin);

    const participantType =
      body.participant_type === 'creator_partner'
        ? 'creator_partner'
        : 'co_creator';

    const days = Number(body.expires_in_days ?? 30);
    const expiresAt = new Date(
      Date.now() + Math.max(1, Math.min(365, days)) * 24 * 60 * 60 * 1000,
    );

    // 해시 충돌 시 재시도
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateCode();
      const codeHash = await hashCode(code);

      const { data, error } = await admin
        .from('invite_codes')
        .insert({
          code_hash: codeHash,
          label,
          participant_type: participantType,
          expires_at: expiresAt.toISOString(),
        })
        .select('id, label, participant_type, expires_at, created_at')
        .single();

      if (!error && data) {
        const joinUrl = `${SITE_URL}/desk/join?code=${encodeURIComponent(code)}`;
        return json(
          {
            ok: true,
            // 원본 코드는 이 응답에서 딱 한 번만 노출된다. DB 에는 해시만 남는다.
            code,
            join_url: joinUrl,
            invite: data,
            // 운영자가 그대로 복사해 개별 전달할 안내 문안
            message_ko:
              `안녕하세요! 「나의 한국어 책상」 계정을 만들어 주세요.\n` +
              `${joinUrl}\n` +
              `(${expiresAt.toISOString().slice(0, 10)}까지 사용 가능한 1회용 링크입니다.)`,
            message_en:
              `Hello! Please create your account for Korean Desks of the World.\n` +
              `${joinUrl}\n` +
              `(One-time link, valid until ${expiresAt.toISOString().slice(0, 10)}.)`,
          },
          200,
          origin,
        );
      }
    }

    return json({ error: 'CODE_GENERATION_FAILED' }, 500, origin);
  }

  // ── list ───────────────────────────────────────────────────────────────────
  if (body.action === 'list') {
    const { data, error } = await admin
      .from('invite_codes')
      .select(
        'id, label, participant_type, expires_at, used_by, used_at, revoked, created_at,' +
          ' profiles:used_by (handle, display_name)',
      )
      .order('created_at', { ascending: false });

    if (error) return json({ error: 'LIST_FAILED' }, 500, origin);

    const now = Date.now();
    const invites = (data ?? []).map((row) => ({
      ...row,
      status: row.revoked
        ? 'revoked'
        : row.used_by
          ? 'used'
          : new Date(row.expires_at).getTime() < now
            ? 'expired'
            : 'active',
    }));

    return json({ ok: true, invites }, 200, origin);
  }

  // ── revoke ─────────────────────────────────────────────────────────────────
  if (body.action === 'revoke') {
    const id = String(body.id ?? '');
    if (!id) return json({ error: 'ID_REQUIRED' }, 400, origin);

    const { error } = await admin
      .from('invite_codes')
      .update({ revoked: true })
      .eq('id', id)
      .is('used_by', null);

    if (error) return json({ error: 'REVOKE_FAILED' }, 500, origin);
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'UNKNOWN_ACTION' }, 400, origin);
});
