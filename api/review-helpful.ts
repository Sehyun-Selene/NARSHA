import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * '유용해요' 토글 (GNB PRD REQ-F / F-1).
 *
 * 왜 서버를 경유하는가
 *   투표자키를 클라이언트가 만들면 임의로 새 키를 찍어 숫자를 부풀릴 수 있다.
 *   요청 IP 는 브라우저가 알 수 없으므로, IP 를 볼 수 있는 서버에서 키를 만든다.
 *   원문 IP 는 저장하지 않고 salt 를 섞은 해시만 쓴다.
 *
 * 배포 위치
 *   저장소 루트의 `api/` 는 Vercel 이 서버리스 함수로 자동 인식한다. 프런트엔드와
 *   같은 파이프라인으로 배포되므로 Supabase Edge Function 처럼 배포가 갈라지지 않는다.
 *
 * 필요한 환경변수 (Vercel — VITE_ 접두사를 붙이면 안 된다. 번들에 노출된다)
 *   REVIEW_IP_SALT              IP 해시용 비밀 salt (긴 무작위 문자열)
 *   SUPABASE_SERVICE_ROLE_KEY   review_helpful 쓰기용. 클라이언트 직접 쓰기를 막았기 때문
 *   (URL 은 프런트와 공유되는 VITE_SUPABASE_URL 을 그대로 쓴다)
 */

type Req = { method?: string; body?: unknown; headers: Record<string, string | string[] | undefined> };
type Res = {
  status: (code: number) => Res;
  json: (body: unknown) => void;
};

function clientIp(req: Req): string {
  const fwd = req.headers['x-forwarded-for'];
  const raw = Array.isArray(fwd) ? fwd[0] : fwd;
  // x-forwarded-for 는 "client, proxy1, proxy2" 형태 — 맨 앞이 실제 요청자다
  return (raw ?? '').split(',')[0].trim() || 'unknown';
}

const MIGRATE_LIMIT = 500;

export default async function handler(req: Req, res: Res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const salt = process.env.REVIEW_IP_SALT;
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!salt || !url || !serviceKey) {
    // 환경변수가 없으면 조용히 실패하지 않고 상태를 알린다 — 설정 누락을 숨기면
    // "왜 안 눌리지" 로 시간을 잃는다.
    res.status(500).json({ ok: false, error: 'SERVER_NOT_CONFIGURED' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
    | { action?: 'toggle' | 'mine' | 'migrate'; reviewId?: string; reviewIds?: string[] }
    | undefined;

  const voterKey = 'a:' + createHash('sha256').update(salt + clientIp(req)).digest('hex').slice(0, 32);
  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const action = body?.action ?? 'toggle';

  // 이 IP 가 누른 후기 목록 — 화면에 반영 상태를 그리기 위해 필요하다.
  // 투표자키를 서버에서만 만들기 때문에 클라이언트가 스스로 알 수 없다.
  if (action === 'mine') {
    const ids = (body?.reviewIds ?? []).slice(0, 200);
    if (ids.length === 0) { res.status(200).json({ ok: true, marked: [] }); return; }
    const q = await supabase
      .from('review_helpful')
      .select('review_id')
      .eq('voter_key', voterKey)
      .in('review_id', ids);
    if (q.error) { res.status(500).json({ ok: false, error: 'LOOKUP_FAILED' }); return; }
    res.status(200).json({ ok: true, marked: q.data.map(r => r.review_id) });
    return;
  }

  // 브라우저에만 있던 기존 기록을 1회 이관한다 (D14).
  // 기본키가 (후기, 투표자키) 라서 중복 이관은 자동으로 무시된다. 조작된 요청으로
  // 대량 쓰기가 발생하는 것만 막기 위해 개수 상한을 둔다.
  if (action === 'migrate') {
    const ids = [...new Set(body?.reviewIds ?? [])].slice(0, MIGRATE_LIMIT);
    if (ids.length === 0) { res.status(200).json({ ok: true, migrated: 0 }); return; }
    // 존재하지 않는 후기 id 는 조용히 버린다
    const exists = await supabase.from('reviews').select('id').in('id', ids);
    if (exists.error) { res.status(500).json({ ok: false, error: 'LOOKUP_FAILED' }); return; }
    const rows = exists.data.map(r => ({ review_id: r.id, voter_key: voterKey }));
    if (rows.length > 0) {
      const ins = await supabase.from('review_helpful').upsert(rows, { onConflict: 'review_id,voter_key', ignoreDuplicates: true });
      if (ins.error) { res.status(500).json({ ok: false, error: 'INSERT_FAILED' }); return; }
    }
    res.status(200).json({ ok: true, migrated: rows.length });
    return;
  }

  const reviewId = body?.reviewId;
  if (!reviewId) {
    res.status(400).json({ ok: false, error: 'REVIEW_ID_REQUIRED' });
    return;
  }

  // 이미 눌렀으면 취소, 아니면 추가 (토글)
  const existing = await supabase
    .from('review_helpful')
    .select('review_id')
    .eq('review_id', reviewId)
    .eq('voter_key', voterKey)
    .maybeSingle();

  if (existing.error) {
    // 코드값만 돌려주면 원인을 좁힐 수 없다 (키 오류·권한·스키마가 모두 같은 코드로 보인다).
    // Postgres 가 준 메시지를 그대로 실어 보낸다 — 비밀값은 담기지 않는다.
    res.status(500).json({ ok: false, error: 'LOOKUP_FAILED', detail: existing.error.message, code: existing.error.code });
    return;
  }

  if (existing.data) {
    const del = await supabase
      .from('review_helpful')
      .delete()
      .eq('review_id', reviewId)
      .eq('voter_key', voterKey);
    if (del.error) { res.status(500).json({ ok: false, error: 'DELETE_FAILED' }); return; }
  } else {
    const ins = await supabase.from('review_helpful').insert({ review_id: reviewId, voter_key: voterKey });
    // 동시 요청으로 이미 들어간 경우(기본키 충돌)는 성공으로 본다
    if (ins.error && ins.error.code !== '23505') {
      res.status(500).json({ ok: false, error: 'INSERT_FAILED', detail: ins.error.message, code: ins.error.code });
      return;
    }
  }

  // 트리거가 갱신한 최신 카운트를 돌려준다 — 클라이언트가 따로 세지 않게
  const after = await supabase.from('reviews').select('helpful_count').eq('id', reviewId).maybeSingle();

  res.status(200).json({
    ok: true,
    marked: !existing.data,
    count: after.data?.helpful_count ?? 0,
  });
}
