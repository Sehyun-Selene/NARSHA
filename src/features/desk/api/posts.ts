import { supabase, type DeskPostRow } from '../../../lib/supabase';
import type { DeskFeedItem, DeskPost, Profile } from '../types';
import { getProfileByHandle } from './profiles';
import { CONSENT_VERSION } from '../legal/consentText';

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

// =============================================================================
// T8 — 저장 · 발행 · 관리
// =============================================================================

import { sanitizeDeskHtml } from '../render/sanitize';

/** 6자 해시 (base36). */
function hash6(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => (b % 36).toString(36)).join('');
}

/** 제목 슬러그화 + 6자 해시. 한글/빈 제목은 post-{해시} 로 폴백. */
export function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return base ? `${base}-${hash6()}` : `post-${hash6()}`;
}

async function requireUid(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  const uid = data.user?.id;
  if (!uid) throw new Error('NOT_AUTHENTICATED');
  return uid;
}

export interface DraftInput {
  id?: string;
  title: string;
  contentJson: unknown;
  contentHtml?: string;
  contentText?: string;
}

/** 서버 임시저장 upsert. 신규면 draft 로 생성(슬러그 발급), 기존이면 내용만 갱신(상태 유지). */
export async function saveDraft(input: DraftInput): Promise<{ id: string; slug: string }> {
  const uid = await requireUid();

  if (!input.id) {
    const slug = generateSlug(input.title);
    const { data, error } = await supabase
      .from('desk_posts')
      .insert({
        author_id: uid,
        slug,
        title: input.title,
        content_json: input.contentJson,
        content_html: input.contentHtml ?? null,
        content_text: input.contentText ?? null,
        status: 'draft',
      })
      .select('id, slug')
      .single();
    if (error) throw error;
    return { id: data.id, slug: data.slug };
  }

  const { data, error } = await supabase
    .from('desk_posts')
    .update({
      title: input.title,
      content_json: input.contentJson,
      content_html: input.contentHtml ?? null,
      content_text: input.contentText ?? null,
    })
    .eq('id', input.id)
    .select('id, slug')
    .single();
  if (error) throw error;
  return { id: data.id, slug: data.slug };
}

/** 리비전 스냅샷 삽입 (트리거가 20개 초과분 정리). */
export async function addRevision(postId: string, title: string, contentJson: unknown): Promise<void> {
  const { error } = await supabase
    .from('desk_post_revisions')
    .insert({ post_id: postId, title, content_json: contentJson });
  if (error) throw error;
}

export interface RevisionMeta {
  id: string;
  title: string | null;
  created_at: string;
}

export async function listRevisions(postId: string): Promise<RevisionMeta[]> {
  const { data, error } = await supabase
    .from('desk_post_revisions')
    .select('id, title, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as RevisionMeta[]) ?? [];
}

export async function getRevisionContent(id: string): Promise<{ title: string | null; content_json: unknown }> {
  const { data, error } = await supabase
    .from('desk_post_revisions')
    .select('title, content_json')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export interface PublishInput {
  id: string;
  title: string;
  contentJson: unknown;
  contentHtml: string;
  contentText: string;
  coverUrl: string | null;
  summary: string;
  tags: string[];
  visibility: 'public' | 'private';
  /** 발행 시 저작권 재확인 기록용 (법무 검토 §7.3). */
  copyrightConsent: { lang: 'ko' | 'en'; text: string };
}

/** 발행. content_html 은 DOMPurify 정화 후 저장. 공개 범위 → status 매핑. */
export async function publishPost(input: PublishInput): Promise<{ slug: string }> {
  const uid = await requireUid();
  const cleanHtml = sanitizeDeskHtml(input.contentHtml);
  const { data, error } = await supabase
    .from('desk_posts')
    .update({
      title: input.title,
      content_json: input.contentJson,
      content_html: cleanHtml,
      content_text: input.contentText,
      cover_url: input.coverUrl,
      summary: input.summary || null,
      tags: input.tags,
      status: input.visibility === 'public' ? 'published' : 'draft',
    })
    .eq('id', input.id)
    .select('slug')
    .single();
  if (error) throw error;

  // 저작권 재확인 기록 (실패해도 발행 자체는 막지 않되, 콘솔에 남긴다 — 발행 완료 후의
  // 부가 기록이라 여기서 막으면 저자가 이미 통과한 체크박스 때문에 발행을 못 하게 된다)
  const { error: consentError } = await supabase.from('desk_consents').insert({
    user_id: uid,
    post_id: input.id,
    consent_type: 'publish_copyright',
    version: CONSENT_VERSION,
    lang: input.copyrightConsent.lang,
    agreed: true,
    snapshot_text: input.copyrightConsent.text,
  });
  if (consentError) console.error('발행 저작권 동의 기록 실패:', consentError);
  return { slug: data.slug };
}

/** 내 글 전체(임시저장+발행). 관리 화면용. */
export async function listMyPosts(): Promise<DeskPost[]> {
  const uid = await requireUid();
  const { data, error } = await supabase
    .from('desk_posts')
    .select('*')
    .eq('author_id', uid)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data as DeskPostRow[]) as DeskPost[];
}

/** 발행↔임시저장 전환 (저자 본인 비공개 전환 등). */
export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<void> {
  const { error } = await supabase.from('desk_posts').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('desk_posts').delete().eq('id', id);
  if (error) throw error;
}

// ── 운영자 글 관리 (admin RLS: read all / moderation 트리거 허용) ──────────────
export async function adminListAllPosts(): Promise<DeskPost[]> {
  const { data, error } = await supabase
    .from('desk_posts')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (error) throw error;
  return (data as DeskPostRow[]) as DeskPost[];
}

export async function adminSetHidden(id: string, hidden: boolean, reason?: string): Promise<void> {
  const { error } = await supabase
    .from('desk_posts')
    .update({ is_hidden: hidden, hidden_reason: hidden ? (reason ?? null) : null })
    .eq('id', id);
  if (error) throw error;
}
