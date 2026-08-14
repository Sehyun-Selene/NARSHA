import { supabase, type ReviewRow, type ReviewReplyRow } from '../../lib/supabase';
import { LearnerType } from './learnerTypes';

export type UsagePeriod =
  | 'lt1w'
  | '1w-lt1m'
  | '1m-lt3m'
  | '3m-lt6m'
  | '6m-lt1y'
  | '1y+';

export const usagePeriodLabels: Record<UsagePeriod, string> = {
  lt1w: 'Less than 1 week',
  '1w-lt1m': '1 week to less than 1 month',
  '1m-lt3m': '1 month to less than 3 months',
  '3m-lt6m': '3 months to less than 6 months',
  '6m-lt1y': '6 months to less than 1 year',
  '1y+': '1 year or more',
};

export function formatUsagePeriod(period: string): string {
  if (period in usagePeriodLabels) {
    return usagePeriodLabels[period as UsagePeriod];
  }
  const legacy: Record<string, string> = {
    '<1m': usagePeriodLabels.lt1w,
    '1-3m': usagePeriodLabels['1m-lt3m'],
    '3-6m': usagePeriodLabels['3m-lt6m'],
    '6m+': usagePeriodLabels['1y+'],
  };
  return legacy[period] ?? period;
}

export interface Review {
  id: string;
  appId: string;
  nickname: string;
  learnerType: LearnerType;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  goal: 'topik' | 'daily' | 'business' | 'culture';
  usagePeriod: UsagePeriod;
  rating: number;
  content: string;
  contentKo: string;
  imageUrls?: string[];
  createdAt: Date;
  helpfulCount: number;
  chosenStrengths?: string[];
  chosenLimits?: string[];
}

export interface ReviewReply {
  id: string;
  reviewId: string;
  body: string;
  createdAt: Date;
}

function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    appId: row.app_id,
    nickname: row.nickname,
    learnerType: row.learner_type as LearnerType,
    level: row.level as Review['level'],
    goal: row.goal as Review['goal'],
    usagePeriod: row.usage_period as UsagePeriod,
    rating: row.rating,
    content: row.content ?? '',
    contentKo: row.content_ko ?? '',
    imageUrls: row.image_urls.length > 0 ? row.image_urls : undefined,
    createdAt: new Date(row.created_at),
    helpfulCount: row.helpful_count,
    chosenStrengths: row.chosen_strengths,
    chosenLimits: row.chosen_limits,
  };
}

// ── Fetch ────────────────────────────────────────────────────────────────────

// 숨김 후기는 목록·집계 어디에도 넣지 않는다 (REQ-E / E-3). RLS 에서도 잘리지만
// 관리자 세션에서는 통과하므로, 공개 화면 쿼리는 여기서도 명시적으로 건다.
export async function getAllReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

export async function getReviewsForApp(appId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('app_id', appId)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as ReviewRow[]).map(rowToReview);
}

export async function getAverageRatingByType(
  appId: string,
  learnerType: LearnerType
): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('app_id', appId)
    .eq('learner_type', learnerType)
    .eq('is_hidden', false);

  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
  return sum / data.length;
}

export async function getOverallRating(appId: string): Promise<number> {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('app_id', appId)
    .eq('is_hidden', false);

  if (error) throw error;
  if (!data || data.length === 0) return 0;
  const sum = data.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0);
  return sum / data.length;
}

export async function getReviewCount(appId: string): Promise<number> {
  const { count, error } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('app_id', appId)
    .eq('is_hidden', false);

  if (error) throw error;
  return count ?? 0;
}

// ── Write ────────────────────────────────────────────────────────────────────

export function mapFormGoalToReviewGoal(form: string): Review['goal'] {
  switch (form) {
    case 'topik': return 'topik';
    case 'business': return 'business';
    case 'entertainment':
    case 'culture': return 'culture';
    case 'academic':
    case 'daily':
    default: return 'daily';
  }
}

export async function saveUserReview(
  input: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
): Promise<Review> {
  const payload = {
    app_id: input.appId,
    nickname: input.nickname,
    learner_type: input.learnerType,
    level: input.level,
    goal: input.goal,
    usage_period: input.usagePeriod,
    rating: input.rating,
    content: input.content || null,
    content_ko: input.contentKo || null,
    image_urls: input.imageUrls ?? [],
    chosen_strengths: input.chosenStrengths ?? [],
    chosen_limits: input.chosenLimits ?? [],
  };

  const { data, error } = await supabase
    .from('reviews')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return rowToReview(data as ReviewRow);
}

// ── Replies ──────────────────────────────────────────────────────────────────

export async function getRepliesForReview(reviewId: string): Promise<ReviewReply[]> {
  const { data, error } = await supabase
    .from('review_replies')
    .select('*')
    .eq('review_id', reviewId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data as ReviewReplyRow[]).map((r) => ({
    id: r.id,
    reviewId: r.review_id,
    body: r.body,
    createdAt: new Date(r.created_at),
  }));
}

export async function addReviewReply(
  reviewId: string,
  body: string
): Promise<ReviewReply> {
  const { data, error } = await supabase
    .from('review_replies')
    .insert({ review_id: reviewId, body: body.trim() })
    .select()
    .single();

  if (error) throw error;
  const r = data as ReviewReplyRow;
  return {
    id: r.id,
    reviewId: r.review_id,
    body: r.body,
    createdAt: new Date(r.created_at),
  };
}

// ── 후기 정렬 (GNB PRD REQ-F / F-2) ─────────────────────────────────────────
// 앱 상세와 Discover 유형별 보기가 같은 기준을 써야 하므로 데이터 계층에 둔다.

export type ReviewSort = 'recent' | 'helpful' | 'ratingHigh' | 'ratingLow';

export const REVIEW_SORTS: ReviewSort[] = ['recent', 'helpful', 'ratingHigh', 'ratingLow'];

export function isReviewSort(v: string | null): v is ReviewSort {
  return v === 'recent' || v === 'helpful' || v === 'ratingHigh' || v === 'ratingLow';
}

/**
 * 원본 배열을 건드리지 않고 정렬된 새 배열을 돌려준다.
 *
 * `helpfulOf` — '유용해요' 카운트를 화면이 따로 들고 있을 때 쓴다. 토글 직후에는
 * 서버가 준 최신 값이 페이지 state 에 있고 `review.helpfulCount` 는 조회 시점
 * 값이라 어긋난다. 넘기지 않으면 조회 시점 값으로 정렬한다.
 */
export function sortReviews<T extends { rating: number; createdAt: Date; helpfulCount: number }>(
  list: T[],
  sort: ReviewSort,
  helpfulOf?: (item: T) => number,
): T[] {
  const byRecent = (a: T, b: T) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  const helpful = (item: T) => helpfulOf?.(item) ?? item.helpfulCount;
  return list.slice().sort((a, b) => {
    if (sort === 'helpful') return helpful(b) - helpful(a) || byRecent(a, b);
    if (sort === 'ratingHigh') return b.rating - a.rating || byRecent(a, b);
    if (sort === 'ratingLow') return a.rating - b.rating || byRecent(a, b);
    return byRecent(a, b);
  });
}

/**
 * 같은 앱에 같은 본문의 후기가 이미 있는지 (GNB PRD REQ-E / E-2 중복 제출 차단).
 *
 * 본문 해시 컬럼을 새로 두지 않고 본문 자체를 비교한다 — 마이그레이션 없이
 * 목적을 달성할 수 있고, 후기 물량이 적은 MVP 단계에서는 비용도 무의미하다.
 * 클라이언트 검증이므로 우회할 수 있다. 실제 차단은 E-1 의 서버 판정이 담당한다.
 */
export async function hasDuplicateReview(appId: string, content: string): Promise<boolean> {
  const body = content.trim();
  if (!body) return false;
  const { data, error } = await supabase
    .from('reviews')
    .select('id')
    .eq('app_id', appId)
    .eq('content', body)
    .limit(1);
  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

// ── '유용해요' 서버 연동 (GNB PRD REQ-F / F-1) ──────────────────────────────
// 투표자키는 서버가 요청 IP 로 만든다. 클라이언트가 키를 만들면 임의로 찍어
// 숫자를 부풀릴 수 있으므로, 모든 쓰기는 api/review-helpful 을 경유한다.

const HELPFUL_ENDPOINT = '/api/review-helpful';
const HELPFUL_LOCAL_KEY = 'review-helpful';            // 구 방식(브라우저 전용) 기록
const HELPFUL_MIGRATED_KEY = 'review-helpful-migrated'; // 이관 완료 표시

async function callHelpful<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch(HELPFUL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({ ok: false }));
  if (!res.ok || !json?.ok) throw new Error(json?.error ?? 'HELPFUL_FAILED');
  return json as T;
}

/** 이 브라우저(=IP)가 누른 후기 id 목록. */
export async function fetchMyHelpful(reviewIds: string[]): Promise<string[]> {
  if (reviewIds.length === 0) return [];
  const r = await callHelpful<{ marked: string[] }>({ action: 'mine', reviewIds });
  return r.marked;
}

/** 토글하고 갱신된 카운트를 돌려준다. */
export async function toggleHelpful(reviewId: string): Promise<{ marked: boolean; count: number }> {
  return callHelpful<{ marked: boolean; count: number }>({ action: 'toggle', reviewId });
}

/**
 * 브라우저에만 있던 기존 '유용해요' 기록을 서버로 1회 이관한다 (D14).
 *
 * 살릴 수 있는 만큼만 살린다 — 다시 방문하지 않는 사용자의 기록은 그 브라우저
 * 안에만 있어 회수할 방법이 없다. 지금은 각자 자기가 누른 숫자만 보이는 구조라
 * 사용자가 체감하는 손실은 사실상 없다.
 */
export async function migrateLocalHelpful(): Promise<void> {
  try {
    if (localStorage.getItem(HELPFUL_MIGRATED_KEY)) return;
    const raw = localStorage.getItem(HELPFUL_LOCAL_KEY);
    if (!raw) { localStorage.setItem(HELPFUL_MIGRATED_KEY, '1'); return; }
    const parsed = JSON.parse(raw) as Record<string, { userMarked?: boolean }>;
    const ids = Object.entries(parsed).filter(([, v]) => v?.userMarked).map(([id]) => id);
    if (ids.length > 0) await callHelpful({ action: 'migrate', reviewIds: ids });
    localStorage.setItem(HELPFUL_MIGRATED_KEY, '1');
  } catch {
    // 실패하면 다음 방문에 다시 시도한다 — 플래그를 남기지 않는다
  }
}
