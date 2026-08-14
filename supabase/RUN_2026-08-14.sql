-- =============================================================================
-- NARSHA — 2026-08-14 통합 실행 스크립트
--
-- Supabase 대시보드 SQL Editor 에 이 파일 전체를 붙여넣고 한 번 실행한다.
-- 개별 마이그레이션 3개를 순서대로 합친 것이며, 모두 재실행 안전(idempotent)하다.
--   1) 20260814020000_review_reports.sql    후기 신고 + 관리자 숨김
--   2) 20260814030000_review_rate_limit.sql 작성 빈도 제한
--   3) 20260814040000_members.sql           일반회원 계정
--
-- ⚠️ 순서를 바꾸면 안 된다 — 2)가 만드는 reviews.author_id 를 3)의 정책이 참조한다.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 20260814020000_review_reports.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- =============================================================================
-- 후기 신고 + 관리자 숨김 (GNB PRD REQ-E / E-3, 결정 D10)
--
-- 방침 — 자동 숨김을 하지 않는다
--   신고가 접수돼도 후기는 계속 노출된다. 조직적 신고로 정상 후기가 내려가는
--   쪽이 스팸이 몇 시간 더 보이는 쪽보다 나쁘다. 숨김은 사람이 판단해 누른다.
--
-- 신고자 보호
--   review_reports 조회는 관리자만 가능하다. 공개되면 누가 누구를 신고했는지가
--   드러난다. 신고 삽입도 클라이언트에 열지 않는다 — 서버 함수(api/review-report)가
--   요청 IP 로 만든 키로 빈도를 판정해야 하기 때문이다 (시간당 5건).
--
-- ⚠️ service_role GRANT 를 반드시 함께 준다. service_role 은 RLS 는 우회하지만
--    GRANT 는 우회하지 않는다 (20260814010000 에서 겪은 42501).
-- =============================================================================

-- ── reviews 숨김 컬럼 ────────────────────────────────────────────────────────
-- 삭제하지 않고 숨긴다. 오판이었을 때 되돌릴 수 있어야 하고, 신고 이력과
-- 대조할 원문도 남아 있어야 한다.
alter table public.reviews add column if not exists is_hidden      boolean not null default false;
alter table public.reviews add column if not exists hidden_reason  text;
alter table public.reviews add column if not exists hidden_at      timestamptz;

-- 목록 조회가 항상 is_hidden = false 로 걸리므로 부분 인덱스가 유용하다
create index if not exists reviews_visible_idx
  on public.reviews (app_id, created_at desc)
  where is_hidden = false;

-- ── review_reports ──────────────────────────────────────────────────────────
create table if not exists public.review_reports (
  id          uuid primary key default gen_random_uuid(),
  review_id   uuid not null references public.reviews(id) on delete cascade,
  -- 로그인 신고자. 익명이면 NULL (REQ-C 회원 체계 이후 채워진다)
  reporter_id uuid references auth.users(id) on delete set null,
  -- 익명 신고의 빈도 판정용. 원문 IP 가 아니라 salt 를 섞은 해시다
  reporter_key text,
  reason      text not null check (reason in ('spam','abuse','false_info','privacy','other')),
  detail      text,
  -- 관리자 처리 표시 — 같은 신고를 두 번 검토하지 않기 위해
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists review_reports_review_idx  on public.review_reports (review_id);
create index if not exists review_reports_pending_idx on public.review_reports (created_at desc) where resolved_at is null;

alter table public.review_reports enable row level security;

-- 조회는 관리자만 (§7 RLS 표 — 신고자 노출 방지)
drop policy if exists "review_reports_admin_read" on public.review_reports;
create policy "review_reports_admin_read"
  on public.review_reports for select
  using (public.is_admin());

-- 관리자가 처리 표시를 남길 수 있어야 한다
drop policy if exists "review_reports_admin_update" on public.review_reports;
create policy "review_reports_admin_update"
  on public.review_reports for update
  using (public.is_admin()) with check (public.is_admin());

-- 삽입 정책은 두지 않는다 — 클라이언트 직접 신고 경로를 열지 않기 위함.
-- 서버 함수가 service_role 로 넣는다 (RLS 우회).
grant select, update on public.review_reports to authenticated;
grant select, insert, update on public.review_reports to service_role;

-- ── 숨김 후기는 서버에서 잘라낸다 ───────────────────────────────────────────
-- 화면 쪽 .eq('is_hidden', false) 만으로는 REST 를 직접 호출하면 읽힌다. 숨김은
-- 개인정보 노출·비방 신고에 대한 조치이므로 노출 자체를 막아야 한다.
-- 관리자는 원문을 봐야 판단할 수 있으므로 예외를 둔다.
drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_hidden = false or public.is_admin());

-- ── reviews 숨김 처리 권한 ──────────────────────────────────────────────────
-- 화면(운영자 대시보드)에서 authenticated 롤로 is_hidden 을 바꾼다. 판정은
-- is_admin() 이 서버에서 한다 — 화면 통제만 믿지 않는다 (CLAUDE.md §8-3).
grant update on public.reviews to authenticated;

drop policy if exists "reviews_admin_update" on public.reviews;
create policy "reviews_admin_update"
  on public.reviews for update
  using (public.is_admin()) with check (public.is_admin());

-- 서버 함수가 신고 접수 시 대상 후기의 존재를 확인한다
grant select on public.reviews to service_role;

-- ─────────────────────────────────────────────────────────────────────────────
-- 20260814030000_review_rate_limit.sql
-- ─────────────────────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 20260814040000_members.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- =============================================================================
-- 일반회원 계정 (GNB PRD REQ-C / C-3, 결정 D6)
--
-- `auth.users` 는 desk 저자와 공유하되 프로필은 별도 표로 분리한다.
--   · `profiles`  = desk 저자 (초대코드로만 생성)
--   · `members`   = 일반회원 (자유 가입)
-- 한 계정이 양쪽에 동시에 존재하는 경우는 없다고 가정한다. 저자 승격 시나리오가
-- 없고, desk 의 RLS 정책을 한 줄도 건드리지 않아 기존 기능이 깨질 위험이 없다.
--
-- 저자인지 일반회원인지는 어느 표에 행이 있는지로 판별한다.
-- =============================================================================

create table if not exists public.members (
  id                      uuid primary key references auth.users(id) on delete cascade,
  display_name            text not null,
  -- REQ-G. 비로그인 상태의 localStorage 값과 비교해 더 최근 것을 채택하므로
  -- 갱신 시각을 함께 둔다.
  learner_type            text,
  learner_type_updated_at timestamptz,
  created_at              timestamptz not null default now()
);

alter table public.members enable row level security;

-- 자기 행만 읽고 쓴다. 후기 카드에 뜨는 이름은 reviews.nickname 에 함께 저장되므로
-- 남의 members 행을 읽을 일이 없다.
drop policy if exists "members_select_own" on public.members;
create policy "members_select_own" on public.members
  for select using (auth.uid() = id);

drop policy if exists "members_insert_own" on public.members;
create policy "members_insert_own" on public.members
  for insert with check (auth.uid() = id);

drop policy if exists "members_update_own" on public.members;
create policy "members_update_own" on public.members
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ⚠️ GRANT 를 빼먹으면 정책이 있어도 42501 이 난다 (20260814010000 참고)
grant select, insert, update on public.members to authenticated;

-- ── 내 후기 수정·삭제 (REQ-C / C-4) ─────────────────────────────────────────
-- 익명 후기(author_id IS NULL)는 소유자를 증명할 방법이 없어 수정·삭제 대상이
-- 아니다. 로그인 작성분만 본인이 고칠 수 있다.
drop policy if exists "reviews_member_update_own" on public.reviews;
create policy "reviews_member_update_own" on public.reviews
  for update to authenticated
  using (author_id is not null and author_id = auth.uid())
  with check (author_id is not null and author_id = auth.uid());

drop policy if exists "reviews_member_delete_own" on public.reviews;
create policy "reviews_member_delete_own" on public.reviews
  for delete to authenticated
  using (author_id is not null and author_id = auth.uid());

grant delete on public.reviews to authenticated;

