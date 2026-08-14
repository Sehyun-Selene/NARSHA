import { supabase } from '../../lib/supabase';

/**
 * 후기 신고 · 관리자 숨김 (GNB PRD REQ-E / E-3, 결정 D10).
 *
 * 신고 접수는 서버 함수를 경유한다 — 빈도 제한을 요청 IP 로 판정해야 하고,
 * `review_reports` 에는 클라이언트 삽입 정책을 두지 않았기 때문이다.
 * 반면 목록 조회와 숨김 처리는 관리자 세션의 RLS(`public.is_admin()`)로
 * 통제되므로 클라이언트에서 직접 한다.
 */

export const REPORT_REASONS = ['spam', 'abuse', 'false_info', 'privacy', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

const REPORT_ENDPOINT = '/api/review-report';

/** 신고 접수. `duplicate` 는 이미 이 사람이 같은 후기를 신고했다는 뜻이다. */
export async function submitReport(input: {
  reviewId: string;
  reason: ReportReason;
  detail?: string;
}): Promise<{ duplicate: boolean }> {
  const res = await fetch(REPORT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({ ok: false }));
  if (!res.ok || !json?.ok) throw new Error(json?.error ?? 'REPORT_FAILED');
  return { duplicate: Boolean(json.duplicate) };
}

// ── 관리자 화면 ─────────────────────────────────────────────────────────────

export interface ReportedReview {
  reviewId: string;
  appId: string;
  nickname: string;
  content: string;
  createdAt: Date;
  isHidden: boolean;
  hiddenReason: string | null;
  /** 이 후기에 접수된 신고 건수 */
  reportCount: number;
  /** 사유별 건수 — 무엇이 문제로 지목됐는지 한눈에 보이게 */
  reasons: Record<string, number>;
  /** 자유 입력 사유 모음 (빈 값 제외) */
  details: string[];
  latestReportAt: Date;
}

interface ReportRow {
  id: string;
  review_id: string;
  reason: string;
  detail: string | null;
  created_at: string;
  resolved_at: string | null;
}

/**
 * 신고된 후기를 후기 단위로 묶어서 돌려준다.
 *
 * 신고 행을 그대로 나열하면 같은 후기가 여러 줄로 흩어져 판단이 어렵다.
 * 관리자가 보는 단위는 "이 후기를 숨길지"이므로 후기로 접는다.
 */
export async function fetchReportedReviews(includeResolved = false): Promise<ReportedReview[]> {
  let q = supabase
    .from('review_reports')
    .select('id, review_id, reason, detail, created_at, resolved_at')
    .order('created_at', { ascending: false });

  if (!includeResolved) q = q.is('resolved_at', null);

  const { data, error } = await q;
  if (error) throw error;

  const rows = (data ?? []) as ReportRow[];
  if (rows.length === 0) return [];

  const reviewIds = [...new Set(rows.map((r) => r.review_id))];

  // 관리자 세션이라 RLS 의 is_admin() 분기를 타므로 숨긴 후기 원문도 읽힌다
  const { data: reviewData, error: reviewError } = await supabase
    .from('reviews')
    .select('id, app_id, nickname, content, content_ko, created_at, is_hidden, hidden_reason')
    .in('id', reviewIds);

  if (reviewError) throw reviewError;

  const byId = new Map(
    (reviewData ?? []).map((r: Record<string, unknown>) => [r.id as string, r]),
  );

  const grouped = new Map<string, ReportedReview>();
  for (const row of rows) {
    const review = byId.get(row.review_id);
    if (!review) continue; // 후기가 삭제된 경우

    let entry = grouped.get(row.review_id);
    if (!entry) {
      entry = {
        reviewId: row.review_id,
        appId: (review.app_id as string) ?? '',
        nickname: (review.nickname as string) ?? '',
        content: ((review.content as string) || (review.content_ko as string) || '').trim(),
        createdAt: new Date(review.created_at as string),
        isHidden: Boolean(review.is_hidden),
        hiddenReason: (review.hidden_reason as string) ?? null,
        reportCount: 0,
        reasons: {},
        details: [],
        latestReportAt: new Date(row.created_at),
      };
      grouped.set(row.review_id, entry);
    }

    entry.reportCount += 1;
    entry.reasons[row.reason] = (entry.reasons[row.reason] ?? 0) + 1;
    if (row.detail) entry.details.push(row.detail);
    const at = new Date(row.created_at);
    if (at > entry.latestReportAt) entry.latestReportAt = at;
  }

  // 신고가 많이 몰린 것부터 — 판단이 급한 순서
  return [...grouped.values()].sort(
    (a, b) => b.reportCount - a.reportCount || b.latestReportAt.getTime() - a.latestReportAt.getTime(),
  );
}

/** 후기 숨김 / 복구. 판정은 RLS 의 `is_admin()` 이 서버에서 한다. */
export async function setReviewHidden(
  reviewId: string,
  hidden: boolean,
  reason?: string,
): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .update({
      is_hidden: hidden,
      hidden_reason: hidden ? (reason?.trim() || null) : null,
      hidden_at: hidden ? new Date().toISOString() : null,
    })
    .eq('id', reviewId);

  if (error) throw error;
}

/** 검토 완료 표시. 후기를 숨기든 그대로 두든, 다시 목록에 뜨지 않게 한다. */
export async function resolveReports(reviewId: string): Promise<void> {
  const { error } = await supabase
    .from('review_reports')
    .update({ resolved_at: new Date().toISOString() })
    .eq('review_id', reviewId)
    .is('resolved_at', null);

  if (error) throw error;
}
