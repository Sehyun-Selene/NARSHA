import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * 후기 신고 접수 (GNB PRD REQ-E / E-3).
 *
 * 왜 서버를 경유하는가
 *   1) 빈도 제한을 IP 로 판정해야 한다 (시간당 5건). IP 는 브라우저가 알 수 없다.
 *   2) review_reports 는 신고자가 드러나는 테이블이라 조회를 관리자로 묶었고,
 *      삽입 정책도 두지 않았다. 클라이언트에 쓰기를 열면 빈도 제한이 무의미해진다.
 *
 * 접수만 하고 후기는 계속 노출한다 — 자동 숨김 없음 (결정 D10).
 *
 * 필요한 환경변수 (Vercel — VITE_ 접두사 금지)
 *   REVIEW_IP_SALT · SUPABASE_SERVICE_ROLE_KEY · VITE_SUPABASE_URL
 */

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { status: (code: number) => Res; json: (body: unknown) => void };

const REASONS = ['spam', 'abuse', 'false_info', 'privacy', 'other'] as const;
const RATE_LIMIT_PER_HOUR = 5;
const DETAIL_MAX = 500;

function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw ?? '').split(',')[0].trim() || 'unknown';
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const salt = process.env.REVIEW_IP_SALT;
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!salt || !url || !serviceKey) {
    res.status(500).json({ ok: false, error: 'SERVER_NOT_CONFIGURED' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { reviewId?: string; reason?: string; detail?: string }
    | undefined;

  const reviewId = body?.reviewId?.trim();
  const reason = body?.reason;
  const detail = (body?.detail ?? '').trim();

  if (!reviewId) {
    res.status(400).json({ ok: false, error: 'REVIEW_ID_REQUIRED' });
    return;
  }
  if (!reason || !(REASONS as readonly string[]).includes(reason)) {
    res.status(400).json({ ok: false, error: 'REASON_INVALID' });
    return;
  }
  if (detail.length > DETAIL_MAX) {
    res.status(400).json({ ok: false, error: 'DETAIL_TOO_LONG' });
    return;
  }

  const reporterKey = 'a:' + createHash('sha256').update(salt + clientIp(req)).digest('hex').slice(0, 32);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // ── 빈도 제한 ──────────────────────────────────────────────────────────────
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const recent = await supabase
    .from('review_reports')
    .select('id', { count: 'exact', head: true })
    .eq('reporter_key', reporterKey)
    .gte('created_at', since);

  if (recent.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: recent.error.message, code: recent.error.code });
    return;
  }
  if ((recent.count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    res.status(429).json({ ok: false, error: 'RATE_LIMITED' });
    return;
  }

  // 없는 후기 id 로 표를 채우지 못하게 막는다
  const target = await supabase.from('reviews').select('id').eq('id', reviewId).maybeSingle();
  if (target.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: target.error.message, code: target.error.code });
    return;
  }
  if (!target.data) {
    res.status(404).json({ ok: false, error: 'REVIEW_NOT_FOUND' });
    return;
  }

  // 같은 사람이 같은 후기를 반복 신고해도 건수만 늘 뿐 판단이 흔들리면 안 되므로,
  // 동일 (후기, 신고자) 조합은 한 건으로 유지한다.
  const dup = await supabase
    .from('review_reports')
    .select('id')
    .eq('review_id', reviewId)
    .eq('reporter_key', reporterKey)
    .maybeSingle();

  if (dup.data) {
    res.status(200).json({ ok: true, duplicate: true });
    return;
  }

  const ins = await supabase.from('review_reports').insert({
    review_id: reviewId,
    reporter_key: reporterKey,
    reason,
    detail: detail || null,
  });

  if (ins.error) {
    res.status(500).json({ ok: false, error: 'INSERT_FAILED', detail: ins.error.message, code: ins.error.code });
    return;
  }

  res.status(200).json({ ok: true });
}
