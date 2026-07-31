-- =============================================================================
-- 기존(레거시) 테이블에 authenticated 롤 GRANT 보정
--
-- 문제
--   apps / reviews / review_replies / suggested_services / dismissed_alerts 는
--   anon 롤에만 권한이 있고 authenticated 롤에는 GRANT 가 없었다.
--   그래서 「나의 한국어 책상」 계정으로 로그인하면(= JWT role 이 authenticated)
--   홈 화면 앱 목록·리뷰 조회가 전부 403 (42501 permission denied) 로 실패했다.
--   비로그인 방문자는 anon 이라 정상 → "가끔 목록이 안 뜬다"로 관찰됨.
--
--   저자 10인이 로그인한 상태로 사이트를 쓰므로 오픈 전 필수 수정.
--
-- 주의
--   GRANT 는 "테이블 접근 가능 여부"만 연다. 어떤 행을 볼지는 기존 RLS 정책이
--   그대로 통제한다. 아래는 익명 사용자가 이미 갖고 있던 것과 동일 수준을
--   로그인 사용자에게도 부여하는 것이다.
-- =============================================================================

-- 읽기 — 앱 카탈로그·리뷰는 공개 정보
grant select on public.apps            to authenticated;
grant select on public.reviews         to authenticated;
grant select on public.review_replies  to authenticated;

-- 쓰기 — 로그인 사용자도 리뷰·서비스 제안을 남길 수 있어야 한다
grant insert on public.reviews            to authenticated;
grant insert on public.suggested_services to authenticated;

-- 운영자 대시보드 알림 dismiss 상태 (RLS: MVP 단계 all 허용)
grant select, insert, update, delete on public.dismissed_alerts to authenticated;

-- 시퀀스가 있는 테이블 대비 (bigserial 등)
grant usage, select on all sequences in schema public to authenticated;
