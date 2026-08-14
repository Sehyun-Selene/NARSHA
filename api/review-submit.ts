import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * 익명 후기 제출 (GNB PRD REQ-E / E-1 · E-2, 결정 D15).
 *
 * 왜 서버를 경유하는가
 *   빈도 제한을 IP 로 판정해야 한다. DB 는 요청자 IP 를 모르고, 클라이언트가 보낸
 *   IP 는 위조할 수 있다. 그래서 실제 IP 를 볼 수 있는 여기서 판정한다.
 *   마이그레이션 20260814030000 이 anon 의 reviews INSERT 권한을 회수했으므로
 *   익명 작성 경로는 이 함수 하나뿐이다.
 *
 * 제한 (익명)
 *   · 동일 IP 시간당 3건
 *   · 동일 IP + 동일 앱 24시간당 1건
 *
 * 입력 검증은 클라이언트에도 있지만 여기서 다시 한다 — 클라이언트 검증은
 * 개발자 도구로 건너뛸 수 있어 방어로 셈할 수 없다 (E-2).
 *
 * 로그인 회원 제출은 이 함수를 쓰지 않는다. 클라이언트가 직접 INSERT 하고
 * `reviews_one_per_app` 트리거가 앱당 1건을 검사한다.
 *
 * 필요한 환경변수 (Vercel — VITE_ 접두사 금지)
 *   REVIEW_IP_SALT · SUPABASE_SERVICE_ROLE_KEY · VITE_SUPABASE_URL
 */

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = { status: (code: number) => Res; json: (body: unknown) => void };

const PER_HOUR = 3;
const PER_APP_HOURS = 24;

const CONTENT_MIN = 20;
const CONTENT_MAX = 2000;
const NICKNAME_MIN = 2;
const NICKNAME_MAX = 20;

const LEVELS = ['beginner', 'elementary', 'intermediate', 'advanced'];
const GOALS = ['topik', 'daily', 'business', 'culture'];
const USAGE_PERIODS = ['lt1w', '1w-lt1m', '1m-lt3m', '3m-lt6m', '6m-lt1y', '1y+'];

const MAX_STRENGTHS = 3;
const MAX_LIMITS = 2;

function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  return (raw ?? '').split(',')[0].trim() || 'unknown';
}

/** 태그 배열 정리 — 개수 상한을 넘기거나 빈 값이 섞여 들어오는 것을 막는다. */
function cleanTags(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0))].slice(0, max);
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
    | Record<string, unknown>
    | undefined;

  const appId = String(body?.appId ?? '').trim();
  const nickname = String(body?.nickname ?? '').trim();
  const content = String(body?.content ?? '').trim();
  const learnerType = String(body?.learnerType ?? '').trim();
  const level = String(body?.level ?? '');
  const goal = String(body?.goal ?? '');
  const usagePeriod = String(body?.usagePeriod ?? '');
  const rating = Number(body?.rating);

  // ── 입력 검증 (E-2) ────────────────────────────────────────────────────────
  if (!appId) { res.status(400).json({ ok: false, error: 'APP_ID_REQUIRED' }); return; }
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    res.status(400).json({ ok: false, error: 'NICKNAME_INVALID' }); return;
  }
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ ok: false, error: 'RATING_INVALID' }); return;
  }
  if (content.length < CONTENT_MIN) { res.status(400).json({ ok: false, error: 'CONTENT_TOO_SHORT' }); return; }
  if (content.length > CONTENT_MAX) { res.status(400).json({ ok: false, error: 'CONTENT_TOO_LONG' }); return; }
  if (!learnerType) { res.status(400).json({ ok: false, error: 'LEARNER_TYPE_REQUIRED' }); return; }
  if (!LEVELS.includes(level)) { res.status(400).json({ ok: false, error: 'LEVEL_INVALID' }); return; }
  if (!GOALS.includes(goal)) { res.status(400).json({ ok: false, error: 'GOAL_INVALID' }); return; }
  if (!USAGE_PERIODS.includes(usagePeriod)) { res.status(400).json({ ok: false, error: 'USAGE_PERIOD_INVALID' }); return; }

  const ipHash = 'a:' + createHash('sha256').update(salt + clientIp(req)).digest('hex').slice(0, 32);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

  // 대상 앱이 실제로 있는지 — 없는 app_id 로 행을 만들지 못하게 한다
  const appRow = await supabase.from('apps').select('id').eq('id', appId).maybeSingle();
  if (appRow.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: appRow.error.message, code: appRow.error.code });
    return;
  }
  if (!appRow.data) { res.status(404).json({ ok: false, error: 'APP_NOT_FOUND' }); return; }

  // ── 빈도 제한 (E-1) ────────────────────────────────────────────────────────
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const dayAgo = new Date(Date.now() - PER_APP_HOURS * 60 * 60 * 1000).toISOString();

  const hourly = await supabase
    .from('reviews_rate_limit')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', hourAgo);

  if (hourly.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: hourly.error.message, code: hourly.error.code });
    return;
  }
  if ((hourly.count ?? 0) >= PER_HOUR) {
    res.status(429).json({ ok: false, error: 'RATE_LIMITED_HOURLY' });
    return;
  }

  const sameApp = await supabase
    .from('reviews_rate_limit')
    .select('id')
    .eq('ip_hash', ipHash)
    .eq('app_id', appId)
    .gte('created_at', dayAgo)
    .limit(1);

  if (sameApp.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: sameApp.error.message, code: sameApp.error.code });
    return;
  }
  if ((sameApp.data?.length ?? 0) > 0) {
    res.status(429).json({ ok: false, error: 'RATE_LIMITED_SAME_APP' });
    return;
  }

  // ── 중복 본문 (E-2) ────────────────────────────────────────────────────────
  const dup = await supabase
    .from('reviews')
    .select('id')
    .eq('app_id', appId)
    .eq('content', content)
    .limit(1);

  if (dup.error) {
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: dup.error.message, code: dup.error.code });
    return;
  }
  if ((dup.data?.length ?? 0) > 0) {
    res.status(409).json({ ok: false, error: 'DUPLICATE_CONTENT' });
    return;
  }

  // ── 저장 ───────────────────────────────────────────────────────────────────
  const ins = await supabase
    .from('reviews')
    .insert({
      app_id: appId,
      nickname,
      learner_type: learnerType,
      level,
      goal,
      usage_period: usagePeriod,
      rating,
      content,
      content_ko: null,
      image_urls: [],
      chosen_strengths: cleanTags(body?.chosenStrengths, MAX_STRENGTHS),
      chosen_limits: cleanTags(body?.chosenLimits, MAX_LIMITS),
    })
    .select('id')
    .single();

  if (ins.error) {
    res.status(500).json({ ok: false, error: 'INSERT_FAILED', detail: ins.error.message, code: ins.error.code });
    return;
  }

  // 빈도 기록은 저장이 성공한 뒤에 남긴다. 먼저 남기면 저장 실패한 시도가
  // 사용자의 한도를 잡아먹는다.
  const mark = await supabase.from('reviews_rate_limit').insert({ ip_hash: ipHash, app_id: appId });
  if (mark.error) {
    // 후기는 이미 저장됐다. 기록 실패로 사용자에게 실패를 알리면 중복 작성을 부른다.
    console.error('rate limit mark failed', mark.error.message);
  }

  res.status(200).json({ ok: true, id: ins.data.id });
}
