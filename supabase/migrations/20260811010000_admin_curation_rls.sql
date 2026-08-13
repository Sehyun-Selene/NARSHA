-- =============================================================================
-- 운영자 큐레이션 쓰기 권한 (GNB PRD REQ-H / §4.8 H-3)
--
-- 배경
--   운영자 대시보드는 앱의 차별점 태그를 추가·제거한다(`apps.differentiators`).
--   그런데 `apps` 에는 어떤 롤에도 UPDATE 권한이 없어서, 이 동작은 지금까지
--   42501 (permission denied) 로 실패해 왔다. 화면에는 버튼이 있지만 눌러도
--   반영되지 않는 상태였다.
--
--   REQ-H 로 대시보드 인증이 anon → Supabase Auth(authenticated) 로 바뀌었으므로,
--   이 시점에 권한을 올바른 형태로 열어 둔다.
--
-- 설계
--   테이블 접근(GRANT)은 authenticated 에 열고, 실제 허용 여부는 RLS 로 좁힌다.
--   GRANT 만으로는 로그인한 저자 누구나 앱을 고칠 수 있게 되므로 RLS 가 필수다.
--   관리자 판정은 이미 있는 `public.is_admin()` 을 재사용한다 — profiles.role 을
--   서버에서 확인하는 함수이고, desk 정책들이 이미 이걸 쓴다 (판정 기준 단일화).
--
--   화면 통제(비밀 경로·로그인 폼)는 편의 장치일 뿐이고, 실제 방어선은 여기다.
-- =============================================================================

-- 테이블 접근만 연다. 어떤 행을 고칠 수 있는지는 아래 정책이 정한다.
grant update on public.apps to authenticated;

-- 운영자만 앱 정보를 수정할 수 있다.
drop policy if exists "apps_admin_update" on public.apps;
create policy "apps_admin_update"
  on public.apps for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 알림 dismiss 기록도 운영자 전용으로 좁힌다.
-- 기존에는 MVP 편의로 로그인 사용자 전체에 열려 있어, 저자가 운영자의 검토
-- 알림을 지울 수 있었다.
drop policy if exists "dismissed_alerts_all" on public.dismissed_alerts;
drop policy if exists "dismissed_alerts_admin" on public.dismissed_alerts;
create policy "dismissed_alerts_admin"
  on public.dismissed_alerts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 확인용 메모
--   · suggested_services 는 INSERT 만 열려 있고 SELECT 는 어떤 롤에도 없다.
--     제보자 이메일이 API 로 노출되지 않는 상태가 의도된 것이다 (팀은 Supabase
--     대시보드에서 직접 열람). 그대로 둔다.
--   · reviews 의 is_hidden / review_reports 는 REQ-E 에서 신설되므로 그때 함께
--     운영자 전용 정책을 만든다.
