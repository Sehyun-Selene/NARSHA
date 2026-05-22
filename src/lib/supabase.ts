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
    };
  };
};

export interface AppRow {
  id: string;
  name: string;
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
  created_at: string;
}

export interface ReviewReplyRow {
  id: string;
  review_id: string;
  body: string;
  created_at: string;
}
