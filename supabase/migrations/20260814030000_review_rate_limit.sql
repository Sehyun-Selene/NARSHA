-- =============================================================================
-- 후기 작성 빈도 제한 (GNB PRD REQ-E / E-1, 결정 D15 혼합 방식)
--
-- 두 수단을 성격에 맞게 나눠 쓴다
--   · 로그인 회원의 "앱당 1건"  → Postgres 트리거. auth.uid() 로 작성자를 확실히
--     식별할 수 있고, 항상 켜져 있어 우회가 불가능하다.
--   · 익명 작성자의 IP 기준 제한 → Vercel 서버 함수(api/review-submit). DB 는
--     요청자 IP 를 알 수 없고, 클라이언트가 보낸 IP 는 위조할 수 있다.
--
-- 원문 IP 는 저장하지 않는다. 서버 salt 를 섞은 해시만 남기고 24시간 뒤 지운다
-- (개인정보 보관 최소화 — PRD §6 수집·보관 표).
--
-- ⚠️ service_role GRANT 를 함께 준다. RLS 는 우회하지만 GRANT 는 우회하지 않는다.
-- =============================================================================

-- ── 작성자 연결 (REQ-C 회원 체계에서 채워진다) ───────────────────────────────
-- 지금은 전부 익명이라 NULL 이다. 컬럼을 먼저 두는 이유는 아래 트리거를 지금
-- 만들어 두면 회원 기능이 붙는 순간 별도 작업 없이 제한이 작동하기 때문이다.
alter table public.reviews add column if not exists author_id uuid references auth.users(id) on delete set null;

create index if not exists reviews_author_app_idx on public.reviews (author_id, app_id) where author_id is not null;

-- ── 회원: 같은 앱에 1건만 ────────────────────────────────────────────────────
create or replace function public.enforce_one_review_per_app()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- 익명 작성은 이 트리거의 대상이 아니다 (IP 판정은 서버 함수가 한다)
  if new.author_id is null then
    return new;
  end if;

  if exists (
    select 1 from public.reviews
    where author_id = new.author_id
      and app_id = new.app_id
      and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid)
  ) then
    -- 화면은 이 코드를 받아 "수정으로 유도" 안내를 띄운다
    raise exception 'REVIEW_ALREADY_EXISTS' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_one_per_app on public.reviews;
create trigger reviews_one_per_app
  before insert on public.reviews
  for each row execute function public.enforce_one_review_per_app();

-- ── 익명: IP 해시 기준 빈도 기록 ─────────────────────────────────────────────
create table if not exists public.reviews_rate_limit (
  id         uuid primary key default gen_random_uuid(),
  -- 원문 IP 가 아니라 salt 를 섞은 해시. 되돌려 IP 를 알아낼 수 없다
  ip_hash    text not null,
  app_id     text not null,
  created_at timestamptz not null default now()
);

create index if not exists reviews_rate_limit_ip_idx on public.reviews_rate_limit (ip_hash, created_at desc);

alter table public.reviews_rate_limit enable row level security;

-- 정책을 두지 않는다 — 클라이언트가 이 표를 읽거나 쓸 이유가 없다.
-- 서버 함수만 service_role 로 접근한다 (RLS 우회).
grant select, insert, delete on public.reviews_rate_limit to service_role;

-- 24시간 지난 기록은 남길 이유가 없다. 별도 스케줄러 없이 삽입 시 정리한다
-- (무료 플랜에 pg_cron 을 붙이지 않기 위한 선택. 행 수가 적어 비용도 작다).
create or replace function public.prune_reviews_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  delete from public.reviews_rate_limit where created_at < now() - interval '24 hours';
  return null;
end;
$$;

drop trigger if exists reviews_rate_limit_prune on public.reviews_rate_limit;
create trigger reviews_rate_limit_prune
  after insert on public.reviews_rate_limit
  for each statement execute function public.prune_reviews_rate_limit();

-- ── 익명 직접 INSERT 경로를 닫는다 ───────────────────────────────────────────
-- 지금까지 anon 이 reviews 에 직접 INSERT 할 수 있었다. 그 경로가 열려 있으면
-- 서버 함수의 빈도 판정을 그냥 건너뛸 수 있어 제한이 장식이 된다.
-- 익명 작성은 api/review-submit 이 service_role 로 넣는다.
revoke insert on public.reviews from anon;

drop policy if exists "reviews_public_insert" on public.reviews;

-- 로그인 회원은 자기 이름으로만 직접 INSERT 한다 (앱당 1건은 위 트리거가 검사).
create policy "reviews_member_insert" on public.reviews
  for insert to authenticated
  with check (author_id = auth.uid());

grant select, insert on public.reviews to service_role;
