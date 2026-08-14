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
