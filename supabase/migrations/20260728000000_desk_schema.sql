-- =============================================================================
-- 「나의 한국어 책상 / Korean Desks of the World」 스키마
-- NARSHA-MVP-ver2 · 2026 국민공공외교사업 플랫폼 트랙
--
-- 적용 방법
--   A. Supabase 대시보드 → SQL Editor 에 전체 붙여넣기 후 Run
--   B. 또는  supabase db push  (supabase/migrations/ 에 이 파일을 둔 상태에서)
--
-- 전제
--   기존 테이블 apps / reviews / review_replies / suggested_services 와 충돌하지 않음.
--   이 파일은 재실행해도 안전하도록(idempotent) 작성됨.
-- =============================================================================

create extension if not exists "pgcrypto" with schema extensions;

-- -----------------------------------------------------------------------------
-- 1. profiles — 계정 프로필 (auth.users 1:1)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,

  handle            text not null unique,
  display_name      text not null,
  display_name_en   text,

  country           text,                    -- 'ID' | 'PH' | ...
  city              text,
  bio               text,
  bio_en            text,
  avatar_url        text,
  channel_url       text,                    -- 크리에이터 파트너 본인 채널

  role              text not null default 'author',       -- 'author' | 'admin'
  participant_type  text not null default 'co_creator',   -- 'co_creator' | 'creator_partner'

  is_active         boolean not null default true,
  storage_used      bigint  not null default 0,           -- bytes
  handle_changed_at timestamptz,                          -- handle 변경 1회 제한

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint profiles_role_chk
    check (role in ('author', 'admin')),
  constraint profiles_participant_type_chk
    check (participant_type in ('co_creator', 'creator_partner')),
  constraint profiles_handle_format_chk
    check (handle ~ '^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$'),
  constraint profiles_handle_reserved_chk
    check (handle not in (
      'admin','administrator','api','app','apps','about','auth','desk','help',
      'join','login','logout','manage','me','new','narsha','null','privacy',
      'reviews','root','settings','signup','support','survey','system','terms',
      'undefined','user','users','write','www'
    ))
);

comment on column public.profiles.handle is
  '개인 책상 URL 식별자. /desk/@{handle}. 저자가 직접 지정, 가입 후 1회 변경 가능.';

-- -----------------------------------------------------------------------------
-- 2. desk_posts — 글
-- -----------------------------------------------------------------------------
create table if not exists public.desk_posts (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid not null references public.profiles(id) on delete cascade,

  slug          text not null,
  title         text not null default '',
  summary       text,
  cover_url     text,

  content_json  jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  content_html  text,
  content_text  text,

  tags          text[] not null default '{}',
  lang          text not null default 'ko',   -- ko | en | id | tl

  status        text not null default 'draft', -- draft | published | hidden
  is_hidden     boolean not null default false, -- 운영자 강제 숨김
  hidden_reason text,

  view_count    integer not null default 0,

  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint desk_posts_status_chk check (status in ('draft','published','hidden')),
  constraint desk_posts_lang_chk   check (lang in ('ko','en','id','tl')),
  constraint desk_posts_tags_len_chk
    check (array_length(tags, 1) is null or array_length(tags, 1) <= 5),
  constraint desk_posts_author_slug_uniq unique (author_id, slug)
);

create index if not exists desk_posts_feed_idx
  on public.desk_posts (published_at desc)
  where status = 'published' and is_hidden = false;

create index if not exists desk_posts_author_idx
  on public.desk_posts (author_id, status, published_at desc);

create index if not exists desk_posts_tags_idx
  on public.desk_posts using gin (tags);

-- -----------------------------------------------------------------------------
-- 3. desk_post_revisions — 서버 임시저장 스냅샷 (글당 최대 20개)
-- -----------------------------------------------------------------------------
create table if not exists public.desk_post_revisions (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid not null references public.desk_posts(id) on delete cascade,
  title        text,
  content_json jsonb not null,
  created_at   timestamptz not null default now()
);

create index if not exists desk_post_revisions_post_idx
  on public.desk_post_revisions (post_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 4. desk_media — 업로드 파일 원장 (쿼터 계산 · 고아 파일 정리)
-- -----------------------------------------------------------------------------
create table if not exists public.desk_media (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references public.profiles(id) on delete cascade,
  post_id    uuid references public.desk_posts(id) on delete set null,
  kind       text not null,             -- image | video | file | avatar
  path       text not null unique,      -- storage object path
  bytes      bigint not null,
  mime       text,
  created_at timestamptz not null default now(),

  constraint desk_media_kind_chk check (kind in ('image','video','file','avatar'))
);

create index if not exists desk_media_owner_idx on public.desk_media (owner_id);
create index if not exists desk_media_post_idx  on public.desk_media (post_id);

-- -----------------------------------------------------------------------------
-- 5. invite_codes — 초대코드 (1인 1코드, 1회용)
--    ※ 원본 코드는 저장하지 않는다. Edge Function 이 pepper 를 섞어 SHA-256 해시.
--    ※ anon / authenticated 는 이 테이블에 접근할 수 없다 (RLS 정책 없음 = 전면 차단).
-- -----------------------------------------------------------------------------
create table if not exists public.invite_codes (
  id         uuid primary key default gen_random_uuid(),
  code_hash  text not null unique,
  label      text,                       -- 발급 대상 메모 (예: 'Jakarta co-creator #2')
  participant_type text not null default 'co_creator',
  expires_at timestamptz not null,
  used_by    uuid references public.profiles(id) on delete set null,
  used_at    timestamptz,
  revoked    boolean not null default false,
  created_at timestamptz not null default now(),

  constraint invite_codes_participant_type_chk
    check (participant_type in ('co_creator','creator_partner'))
);

-- 리딤 시도 rate limit
create table if not exists public.invite_redeem_attempts (
  id           bigserial primary key,
  ip_hash      text not null,
  succeeded    boolean not null default false,
  attempted_at timestamptz not null default now()
);

create index if not exists invite_redeem_attempts_idx
  on public.invite_redeem_attempts (ip_hash, attempted_at desc);

-- =============================================================================
-- 6. 헬퍼 함수 · 트리거
-- =============================================================================

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

drop trigger if exists desk_posts_touch_updated_at on public.desk_posts;
create trigger desk_posts_touch_updated_at
  before update on public.desk_posts
  for each row execute function public.touch_updated_at();

-- 현재 로그인 사용자가 "글을 쓸 수 있는 활성 저자"인지.
-- SECURITY DEFINER 로 두어 profiles RLS 재귀를 피한다.
create or replace function public.is_active_author()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('author','admin')
      and p.is_active
  );
$$;

create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- 조회수 증가 (RLS 우회 필요 → SECURITY DEFINER RPC)
create or replace function public.increment_desk_post_view(p_post_id uuid)
returns void language sql security definer
set search_path = public as $$
  update public.desk_posts
     set view_count = view_count + 1
   where id = p_post_id
     and status = 'published'
     and is_hidden = false;
$$;

grant execute on function public.increment_desk_post_view(uuid) to anon, authenticated;

-- 스토리지 사용량 자동 집계
create or replace function public.sync_storage_used()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.profiles
       set storage_used = storage_used + new.bytes
     where id = new.owner_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.profiles
       set storage_used = greatest(0, storage_used - old.bytes)
     where id = old.owner_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists desk_media_sync_storage on public.desk_media;
create trigger desk_media_sync_storage
  after insert or delete on public.desk_media
  for each row execute function public.sync_storage_used();

-- 리비전 20개 초과분 정리
create or replace function public.prune_desk_post_revisions()
returns trigger language plpgsql as $$
begin
  delete from public.desk_post_revisions
   where post_id = new.post_id
     and id not in (
       select id from public.desk_post_revisions
        where post_id = new.post_id
        order by created_at desc
        limit 20
     );
  return null;
end;
$$;

drop trigger if exists desk_post_revisions_prune on public.desk_post_revisions;
create trigger desk_post_revisions_prune
  after insert on public.desk_post_revisions
  for each row execute function public.prune_desk_post_revisions();

-- handle 은 1회만 변경 가능
create or replace function public.enforce_handle_change_limit()
returns trigger language plpgsql as $$
begin
  if new.handle is distinct from old.handle then
    if old.handle_changed_at is not null then
      raise exception 'handle can only be changed once';
    end if;
    new.handle_changed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_handle_change_limit on public.profiles;
create trigger profiles_handle_change_limit
  before update on public.profiles
  for each row execute function public.enforce_handle_change_limit();

-- 발행 시 published_at 자동 기록
create or replace function public.stamp_published_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists desk_posts_stamp_published_at on public.desk_posts;
create trigger desk_posts_stamp_published_at
  before insert or update on public.desk_posts
  for each row execute function public.stamp_published_at();

-- =============================================================================
-- 7. RLS
-- =============================================================================

alter table public.profiles               enable row level security;
alter table public.desk_posts             enable row level security;
alter table public.desk_post_revisions    enable row level security;
alter table public.desk_media             enable row level security;
alter table public.invite_codes           enable row level security;
alter table public.invite_redeem_attempts enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
-- 프로필은 공개 정보 (이메일은 auth.users 에만 있으므로 여기서 노출되지 않음)
drop policy if exists "profiles: public read" on public.profiles;
create policy "profiles: public read"
  on public.profiles for select using (true);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT / DELETE 정책 없음 → 계정 생성·삭제는 service_role(Edge Function)만 가능

-- 저자가 스스로 권한 관련 컬럼을 바꾸지 못하게 한다
create or replace function public.jwt_role()
returns text language plpgsql stable as $$
declare
  claims text := nullif(current_setting('request.jwt.claims', true), '');
begin
  if claims is null then
    -- SQL Editor · 마이그레이션 등 PostgREST 를 거치지 않는 경로
    return 'service_role';
  end if;
  return coalesce(claims::jsonb ->> 'role', 'anon');
exception when others then
  return 'anon';
end;
$$;

create or replace function public.protect_profile_privileged_columns()
returns trigger language plpgsql as $$
begin
  if public.jwt_role() = 'service_role' then
    return new;
  end if;

  new.role             := old.role;
  new.is_active        := old.is_active;
  new.storage_used     := old.storage_used;
  new.participant_type := old.participant_type;
  return new;
end;
$$;

drop trigger if exists profiles_protect_privileged on public.profiles;
create trigger profiles_protect_privileged
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_columns();

-- ── desk_posts ──────────────────────────────────────────────────────────────
drop policy if exists "desk_posts: public read published" on public.desk_posts;
create policy "desk_posts: public read published"
  on public.desk_posts for select
  using (status = 'published' and is_hidden = false);

drop policy if exists "desk_posts: author read own" on public.desk_posts;
create policy "desk_posts: author read own"
  on public.desk_posts for select
  using (auth.uid() = author_id);

drop policy if exists "desk_posts: admin read all" on public.desk_posts;
create policy "desk_posts: admin read all"
  on public.desk_posts for select
  using (public.is_admin());

drop policy if exists "desk_posts: author insert own" on public.desk_posts;
create policy "desk_posts: author insert own"
  on public.desk_posts for insert
  with check (auth.uid() = author_id and public.is_active_author());

drop policy if exists "desk_posts: author update own" on public.desk_posts;
create policy "desk_posts: author update own"
  on public.desk_posts for update
  using (auth.uid() = author_id and public.is_active_author())
  with check (auth.uid() = author_id);

drop policy if exists "desk_posts: admin update" on public.desk_posts;
create policy "desk_posts: admin update"
  on public.desk_posts for update
  using (public.is_admin());

drop policy if exists "desk_posts: author delete own" on public.desk_posts;
create policy "desk_posts: author delete own"
  on public.desk_posts for delete
  using (auth.uid() = author_id);

-- 저자가 운영자 숨김을 되돌리거나 조회수를 조작하지 못하게 한다
create or replace function public.protect_desk_post_moderation()
returns trigger language plpgsql as $$
begin
  if public.jwt_role() = 'service_role' or public.is_admin() then
    return new;
  end if;

  new.is_hidden     := old.is_hidden;
  new.hidden_reason := old.hidden_reason;
  new.view_count    := old.view_count;
  return new;
end;
$$;

drop trigger if exists desk_posts_protect_moderation on public.desk_posts;
create trigger desk_posts_protect_moderation
  before update on public.desk_posts
  for each row execute function public.protect_desk_post_moderation();

-- ── desk_post_revisions ─────────────────────────────────────────────────────
drop policy if exists "revisions: owner all" on public.desk_post_revisions;
create policy "revisions: owner all"
  on public.desk_post_revisions for all
  using (
    exists (select 1 from public.desk_posts p
             where p.id = post_id and p.author_id = auth.uid())
  )
  with check (
    exists (select 1 from public.desk_posts p
             where p.id = post_id and p.author_id = auth.uid())
  );

-- ── desk_media ──────────────────────────────────────────────────────────────
drop policy if exists "media: public read" on public.desk_media;
create policy "media: public read"
  on public.desk_media for select using (true);

drop policy if exists "media: owner insert" on public.desk_media;
create policy "media: owner insert"
  on public.desk_media for insert
  with check (auth.uid() = owner_id and public.is_active_author());

drop policy if exists "media: owner delete" on public.desk_media;
create policy "media: owner delete"
  on public.desk_media for delete
  using (auth.uid() = owner_id);

-- ── invite_codes / invite_redeem_attempts ───────────────────────────────────
-- 정책을 만들지 않는다 → anon·authenticated 접근 전면 차단.
-- service_role(Edge Function)만 RLS 를 우회해 접근한다.

-- =============================================================================
-- 8. Storage
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit)
values ('desk-media', 'desk-media', true, 52428800)   -- 50MB
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit;

drop policy if exists "desk-media: public read" on storage.objects;
create policy "desk-media: public read"
  on storage.objects for select
  using (bucket_id = 'desk-media');

-- 경로 규칙:  desk/{auth.uid()}/{images|videos|files|avatar}/{uuid}.{ext}
drop policy if exists "desk-media: owner write" on storage.objects;
create policy "desk-media: owner write"
  on storage.objects for insert
  with check (
    bucket_id = 'desk-media'
    and (storage.foldername(name))[1] = 'desk'
    and (storage.foldername(name))[2] = auth.uid()::text
    and public.is_active_author()
  );

drop policy if exists "desk-media: owner update" on storage.objects;
create policy "desk-media: owner update"
  on storage.objects for update
  using (
    bucket_id = 'desk-media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

drop policy if exists "desk-media: owner delete" on storage.objects;
create policy "desk-media: owner delete"
  on storage.objects for delete
  using (
    bucket_id = 'desk-media'
    and (storage.foldername(name))[2] = auth.uid()::text
  );

-- =============================================================================
-- 9. 공개 피드용 뷰
-- =============================================================================
-- security_invoker = on → 뷰를 통해서도 기저 테이블의 RLS 가 그대로 적용된다
create or replace view public.desk_feed
with (security_invoker = on) as
select
  p.id,
  p.slug,
  p.title,
  p.summary,
  p.cover_url,
  p.tags,
  p.lang,
  p.view_count,
  p.published_at,
  pr.handle,
  pr.display_name,
  pr.display_name_en,
  pr.country,
  pr.city,
  pr.avatar_url,
  pr.participant_type
from public.desk_posts p
join public.profiles pr on pr.id = p.author_id
where p.status = 'published'
  and p.is_hidden = false
  and pr.is_active;

grant select on public.desk_feed to anon, authenticated;

-- =============================================================================
-- 끝
-- =============================================================================
