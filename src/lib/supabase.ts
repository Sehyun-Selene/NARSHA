import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      apps: { Row: AppRow };
      reviews: { Row: ReviewRow };
      review_replies: { Row: ReviewReplyRow };
      review_reports: { Row: ReviewReportRow };
      profiles: { Row: ProfileRow };
      desk_posts: { Row: DeskPostRow };
      desk_post_revisions: { Row: DeskPostRevisionRow };
      desk_media: { Row: DeskMediaRow };
    };
    Views: {
      desk_feed: { Row: DeskFeedRow };
    };
  };
};

export interface AppRow {
  id: string;
  name: string;
  /** 한국어 표기명. 마이그레이션 20260808000000 으로 추가됐고, 비어 있을 수 있다. */
  name_ko?: string | null;
  aliases: string[];
  learning_field: string[];
  learning_type: string | null;
  sensory: string | null;
  style: string | null;
  learner_type_code: string | null;
  level: string[];
  purpose: string[];
  pricing: string[];
  teaching_language: string[];
  realtime_feedback: string[];
  differentiators: string[];
  limitations: string[];
  platform: string[];
  url: string | null;
  description: string | null;
  description_ko: string | null;
  logo_src: string | null;
  created_at: string;
}

export interface ReviewRow {
  id: string;
  app_id: string;
  nickname: string;
  learner_type: string;
  level: string;
  goal: string;
  usage_period: string;
  rating: number;
  content: string | null;
  content_ko: string | null;
  image_urls: string[];
  helpful_count: number;
  chosen_strengths: string[];
  chosen_limits: string[];
  /** 운영자 숨김 (REQ-E / E-3). 공개 조회는 RLS 와 쿼리 양쪽에서 걸러진다 */
  is_hidden: boolean;
  hidden_reason: string | null;
  hidden_at: string | null;
  created_at: string;
}

export interface ReviewReportRow {
  id: string;
  review_id: string;
  reporter_id: string | null;
  reporter_key: string | null;
  reason: string;
  detail: string | null;
  resolved_at: string | null;
  created_at: string;
}

export interface ReviewReplyRow {
  id: string;
  review_id: string;
  body: string;
  created_at: string;
}

export interface SuggestedServiceRow {
  id: string;
  service_name: string;
  service_url: string | null;
  recommended_strengths: string[];
  custom_reason: string | null;
  reporter_email: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// ── 「나의 한국어 책상」 테이블 (20260728000000_desk_schema.sql) ────────────────

/** Tiptap 문서 JSON (source of truth). */
export type DeskDoc = { type?: string; content?: DeskDoc[]; [key: string]: unknown };

export type DeskRole = 'author' | 'admin';
export type DeskParticipantType = 'co_creator' | 'creator_partner';
export type DeskPostStatus = 'draft' | 'published' | 'hidden';
export type DeskLang = 'ko' | 'en' | 'id' | 'tl';

export interface ProfileRow {
  id: string;
  handle: string;
  display_name: string;
  display_name_en: string | null;
  country: string | null;         // 'ID' | 'PH' | ...
  city: string | null;
  bio: string | null;
  bio_en: string | null;
  avatar_url: string | null;
  channel_url: string | null;     // 크리에이터 파트너 채널
  role: DeskRole;
  participant_type: DeskParticipantType;
  is_active: boolean;
  storage_used: number;           // bytes
  handle_changed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeskPostRow {
  id: string;
  author_id: string;
  slug: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  content_json: DeskDoc;
  content_html: string | null;
  content_text: string | null;
  tags: string[];
  lang: DeskLang;
  status: DeskPostStatus;
  is_hidden: boolean;
  hidden_reason: string | null;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeskPostRevisionRow {
  id: string;
  post_id: string;
  title: string | null;
  content_json: DeskDoc;
  created_at: string;
}

export interface DeskMediaRow {
  id: string;
  owner_id: string;
  post_id: string | null;
  kind: 'image' | 'video' | 'file' | 'avatar';
  path: string;
  bytes: number;
  mime: string | null;
  created_at: string;
}

/** public.desk_feed 뷰 — 발행 글 + 저자 공개 정보 조인 (익명 읽기 가능). */
export interface DeskFeedRow {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  cover_url: string | null;
  tags: string[];
  lang: DeskLang;
  view_count: number;
  published_at: string | null;
  handle: string;
  display_name: string;
  display_name_en: string | null;
  country: string | null;
  city: string | null;
  avatar_url: string | null;
  participant_type: DeskParticipantType;
}
