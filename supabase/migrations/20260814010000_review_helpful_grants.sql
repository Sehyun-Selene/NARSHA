-- =============================================================================
-- review_helpful — service_role GRANT 보강
--
-- 증상
--   배포된 api/review-helpful 에서 '유용해요' 토글이 항상 실패했다.
--     {"error":"LOOKUP_FAILED","detail":"permission denied for table review_helpful","code":"42501"}
--
-- 원인
--   20260811020000_review_helpful.sql 이 `grant select ... to anon, authenticated`
--   만 주고 service_role 을 빼먹었다. service_role 은 RLS 를 우회하지만 **GRANT 는
--   우회하지 않는다.** 이 프로젝트는 public 스키마 기본권한이 service_role 까지
--   자동으로 열려 있지 않아(apps UPDATE 때와 같은 상황), 테이블마다 명시해야 한다.
--
-- 교훈
--   RLS 정책을 썼다는 것과 접근 권한이 있다는 것은 별개다. 서버 함수가 만지는
--   테이블은 service_role GRANT 를 항상 같이 적어야 한다.
-- =============================================================================

-- 익명 투표는 서버 함수만 기록한다 (클라이언트 직접 쓰기는 계속 막힌 상태)
grant select, insert, delete on public.review_helpful to service_role;

-- 토글 직후 최신 카운트를 돌려주기 위해 서버 함수가 reviews 를 읽는다.
-- helpful_count 갱신은 security definer 트리거가 하므로 update 는 필요 없다.
grant select on public.reviews to service_role;
