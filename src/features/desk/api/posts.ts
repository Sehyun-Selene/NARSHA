import { supabase, type DeskPostRow } from '../../../lib/supabase';
import type { DeskFeedItem, DeskPost, Profile } from '../types';
import { getProfileByHandle } from './profiles';

export type FeedSort = 'latest' | 'popular';

export interface FeedFilters {
  country?: 'ID' | 'PH' | null;
  handle?: string | null; // 특정 저자만
  tag?: string | null;
  sort?: FeedSort;
}

export interface FeedPage {
  items: DeskFeedItem[];
  nextCursor: string | null; // null 이면 마지막 페이지
}

export const FEED_PAGE_SIZE = 12;

/**
 * 공개 피드. desk_feed 뷰에서 조회한다 (RLS: 발행+비숨김+활성저자).
 * 커서:
 *  - latest  → 마지막 항목의 published_at (keyset)
 *  - popular → offset 정수 문자열 (view_count 정렬은 keyset 이 부적합)
 */
export async function getFeed(
  filters: FeedFilters,
  cursor: string | null = null,
): Promise<FeedPage> {
  const sort = filters.sort ?? 'latest';

  let q = supabase.from('desk_feed').select('*');
  if (filters.country) q = q.eq('country', filters.country);
  if (filters.handle) q = q.eq('handle', filters.handle);
  if (filters.tag) q = q.contains('tags', [filters.tag]);

  if (sort === 'popular') {
    const offset = cursor ? parseInt(cursor, 10) : 0;
    q = q
      .order('view_count', { ascending: false })
      .order('published_at', { ascending: false })
      .range(offset, offset + FEED_PAGE_SIZE - 1);
    const { data, error } = await q;
    if (error) throw error;
    const items = (data as DeskFeedItem[]) ?? [];
    return {
      items,
      nextCursor: items.length === FEED_PAGE_SIZE ? String(offset + FEED_PAGE_SIZE) : null,
    };
  }

  // latest — keyset on published_at desc
  q = q.order('published_at', { ascending: false }).limit(FEED_PAGE_SIZE);
  if (cursor) q = q.lt('published_at', cursor);
  const { data, error } = await q;
  if (error) throw error;
  const items = (data as DeskFeedItem[]) ?? [];
  const last = items[items.length - 1];
  return {
    items,
    nextCursor: items.length === FEED_PAGE_SIZE && last?.published_at ? last.published_at : null,
  };
}

export interface DeskPostWithAuthor {
  post: DeskPost;
  author: Profile;
}

/**
 * handle + slug 로 글 상세 조회.
 * 저자 프로필을 먼저 찾고(→ 404 판정), 그 author_id 로 글을 읽는다.
 * RLS 가 draft/hidden 을 걸러주므로 방문자에겐 발행본만 반환된다
 * (본인·운영자는 자신의 정책으로 추가 열람 가능).
 */
export async function getPostByHandleSlug(
  handle: string,
  slug: string,
): Promise<DeskPostWithAuthor | null> {
  const author = await getProfileByHandle(handle);
  if (!author) return null;

  const { data, error } = await supabase
    .from('desk_posts')
    .select('*')
    .eq('author_id', author.id)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { post: data as DeskPostRow as DeskPost, author };
}

/** 조회수 증가 — 세션당 1회 (sessionStorage 중복 방지). */
export async function incrementViewOncePerSession(postId: string): Promise<void> {
  const key = `desk-viewed-${postId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage 불가 환경이면 그냥 1회 호출
  }
  await supabase.rpc('increment_desk_post_view', { p_post_id: postId });
}
