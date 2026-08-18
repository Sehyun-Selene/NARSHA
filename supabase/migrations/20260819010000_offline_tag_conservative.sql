-- 오프라인 태그 — 확인되지 않은 것을 걷어낸다
--
-- 앞선 마이그레이션(20260818010000)에서 9개 서비스에 `ux.offline_paid_only` 를
-- 붙였지만, 그 판단의 근거는 각 서비스의 **유료 구간 구성에 대한 기억**이었다.
-- 요금제는 자주 바뀌고, 확인되지 않은 태그는 학습자에게 틀린 정보를 준다.
-- 방침: 확실하지 않으면 붙이지 않는다.
--
-- 남기는 것 (근거가 저장소 안에 있는 것만):
--   · anki             — 무료·오프라인. 계정도 결제도 없이 로컬 덱으로 동작
--   · htsk-application — 시드 설명이 "오프라인에서도 전체 문법 커리큘럼을 사용할 수
--                        있습니다" 다. 운영자가 등록 시점에 확인한 내용이며,
--                        앱 자체가 단건 결제이므로 유료 값에 둔다
--
-- 되돌리는 것 — 확인 후 다시 붙일 대상:
--   quizlet · memrise · duolingo · drops · busuu · lingodeer ·
--   mango-languages · coursera
--
-- ⚠️ `differentiators` 는 운영자 큐레이션 필드다 (CLAUDE.md §8-2).

update public.apps
set differentiators = array_remove(differentiators, 'ux.offline_paid_only')
where id in (
  'quizlet',
  'memrise',
  'duolingo',
  'drops',
  'busuu',
  'lingodeer',
  'mango-languages',
  'coursera'
);
