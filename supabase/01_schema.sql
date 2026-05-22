-- ============================================================
-- NARSHA MVP — Supabase Schema
-- Run in Supabase Studio > SQL Editor
-- ============================================================

-- ── apps ────────────────────────────────────────────────────
create table if not exists apps (
  id                text primary key,
  name              text not null,
  aliases           text[] not null default '{}',
  learning_field    text[] not null default '{}',
  learning_type     text,             -- e.g. "가 Visual Exploratory"
  sensory           text,             -- visual | auditory | mixed
  style             text,             -- exploratory | structured
  learner_type_code text,             -- 가 | 나 | 다 | 라 | 마 | 바
  level             text[] not null default '{}',
  purpose           text[] not null default '{}',
  pricing           text[] not null default '{}',
  teaching_language text[] not null default '{}',
  realtime_feedback text[] not null default '{}',
  differentiators   text[] not null default '{}',
  limitations       text[] not null default '{}',
  platform          text[] not null default '{}',
  url               text,
  description       text,
  description_ko    text,
  logo_src          text,
  created_at        timestamptz not null default now()
);

-- ── reviews ─────────────────────────────────────────────────
create table if not exists reviews (
  id               uuid primary key default gen_random_uuid(),
  app_id           text references apps(id) on delete cascade,
  nickname         text not null,
  learner_type     text not null,
  level            text not null,
  goal             text not null,
  usage_period     text not null,
  rating           numeric(2,1) not null check (rating >= 1 and rating <= 5),
  content          text,
  content_ko       text,
  image_urls       text[] not null default '{}',
  helpful_count    integer not null default 0,
  chosen_strengths text[] not null default '{}',
  chosen_limits    text[] not null default '{}',
  created_at       timestamptz not null default now()
);

-- ── review_replies ───────────────────────────────────────────
create table if not exists review_replies (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid references reviews(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);

-- ── indexes ─────────────────────────────────────────────────
create index if not exists reviews_app_id_idx on reviews(app_id);
create index if not exists reviews_learner_type_idx on reviews(learner_type);
create index if not exists review_replies_review_id_idx on review_replies(review_id);

-- ── RLS (Row Level Security) ─────────────────────────────────
alter table apps enable row level security;
alter table reviews enable row level security;
alter table review_replies enable row level security;

-- apps: anyone can read
create policy "apps_public_read" on apps
  for select using (true);

-- reviews: anyone can read and insert
create policy "reviews_public_read" on reviews
  for select using (true);

create policy "reviews_public_insert" on reviews
  for insert with check (true);

-- review_replies: anyone can read and insert
create policy "review_replies_public_read" on review_replies
  for select using (true);

create policy "review_replies_public_insert" on review_replies
  for insert with check (true);
