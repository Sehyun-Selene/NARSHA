-- =============================================================================
-- 오류 제보 창구
--
-- 목적
--   사용자가 "이게 안 돼요" 를 알릴 곳이 없었다. 서비스 제안(suggested_services)은
--   성격이 완전히 달라 같은 표에 섞으면 운영이 어려워진다 — 제안은 큐레이션
--   후보이고, 오류는 고쳐야 할 결함이다. 표를 나눈다.
--
-- 자동 수집 항목
--   발생 화면 URL 과 브라우저 정보를 함께 받는다. 이게 없으면 "안 돼요" 한 줄로는
--   재현할 수 없어 제보가 사실상 쓸모없어진다.
--
-- 개인정보
--   이메일은 선택이다. 회신을 원하는 사람만 남긴다.
--   user_agent 는 기기·브라우저 식별에 쓰이는 값이므로 개인정보처리방침에 명시한다.
-- =============================================================================

create table if not exists public.bug_reports (
  id          uuid primary key default gen_random_uuid(),
  -- 무엇이 잘못됐는지 (필수)
  description text not null,
  -- 회신용. 원하지 않으면 비워 둔다
  reporter_email text,
  -- 재현에 필요한 맥락 (클라이언트가 자동으로 채운다)
  page_url    text,
  user_agent  text,
  -- 운영자 처리 표시
  resolved_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists bug_reports_pending_idx
  on public.bug_reports (created_at desc) where resolved_at is null;

alter table public.bug_reports enable row level security;

-- 제보는 누구나 넣을 수 있다. 로그인을 요구하면 정작 로그인이 깨졌을 때 제보를 못 한다.
drop policy if exists "bug_reports_public_insert" on public.bug_reports;
create policy "bug_reports_public_insert"
  on public.bug_reports for insert
  with check (true);

-- 조회·처리는 운영자만. 제보에는 이메일이 담길 수 있어 공개하면 안 된다.
drop policy if exists "bug_reports_admin_read" on public.bug_reports;
create policy "bug_reports_admin_read"
  on public.bug_reports for select
  using (public.is_admin());

drop policy if exists "bug_reports_admin_update" on public.bug_reports;
create policy "bug_reports_admin_update"
  on public.bug_reports for update
  using (public.is_admin()) with check (public.is_admin());

-- ⚠️ GRANT 를 빼먹으면 정책이 있어도 42501 이 난다. 이 프로젝트에서 네 번 겪었다.
grant insert on public.bug_reports to anon;
grant insert, select, update on public.bug_reports to authenticated;
grant insert, select, update on public.bug_reports to service_role;
