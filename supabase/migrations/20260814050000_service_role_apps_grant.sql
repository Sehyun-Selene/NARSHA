-- =============================================================================
-- api/review-submit 용 service_role GRANT 보강
--
-- 증상
--   배포된 익명 후기 제출이 전부 실패했다.
--     {"error":"LOOKUP_FAILED","detail":"permission denied for table apps","code":"42501"}
--
-- 원인
--   서버 함수가 저장 전에 "그 app_id 가 실제로 있는지" 확인한다. 그 조회에 필요한
--   apps SELECT 권한을 service_role 에 주지 않았다. service_role 은 RLS 를
--   우회하지만 GRANT 는 우회하지 않는다.
--
-- 이 프로젝트에서 같은 종류의 누락이 네 번째다 (apps UPDATE, review_helpful,
-- reviews, 그리고 여기). 서버 함수가 새 표를 만지게 되면 GRANT 를 같은 커밋에
-- 함께 넣을 것.
-- =============================================================================

grant select on public.apps to service_role;
