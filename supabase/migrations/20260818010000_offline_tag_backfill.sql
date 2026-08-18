-- 오프라인 이용(ux.offline_available) 태그 보강
--
-- 배경: 태그가 `HTSK - application` 한 건에만 붙어 있어서, `오프라인` 으로 검색하면
-- 결과가 1건뿐이었다. 실제로 콘텐츠를 내려받아 네트워크 없이 학습할 수 있는
-- 서비스가 더 있다 — 검색 로직 문제가 아니라 큐레이션 공백이었다.
--
-- 태그의 뜻은 "오프라인 이용이 가능한가" 다 (`TAG_LONG['ux.offline_available']`).
-- 아래 다수는 유료 구간에서 열리는 기능이지만, 가능 여부를 나타내는 태그이므로 붙인다.
--
-- ⚠️ `differentiators` 는 운영자 큐레이션 필드다 (CLAUDE.md §8-2). 후기 집계로
--    자동 변경되지 않으며, 이 마이그레이션은 운영자 요청에 따른 1회성 보정이다.
--    같은 내용이 `02_seed_apps.sql` 에도 반영돼 있어 재시드해도 유지된다.
--
-- 제외한 것:
--   · 유튜브 채널 8건 — 오프라인 저장은 YouTube 의 기능이지 이 서비스의 기능이 아니다
--   · 웹 전용(TTMIK web, HTSK web, 90 Day Korean, Kimchi Reader) — 브라우저 필요
--   · 실시간 수업(Preply, 세종학당) · 대화 상대(Hello Talk) — 상대가 있어야 성립
--   · 음성 인식 기반(Pingo AI, Teuida, Hangul : Hey Korea) — 서버 판정 필요
--   · Avocards / Lingory / TOPIK ONE / Cake — 확인되지 않아 운영자 판단으로 남긴다

update public.apps
set differentiators = array_append(differentiators, 'ux.offline_available')
where id in (
  'anki',            -- 로컬 덱. 계정 없이도 완전 오프라인
  'quizlet',         -- 모바일 오프라인 학습 (유료)
  'memrise',         -- 코스 내려받기 (유료)
  'duolingo',        -- 레슨 내려받기 (Super)
  'lingodeer',       -- 코스 내려받기
  'drops',           -- 오프라인 모드 (Premium)
  'busuu',           -- 오프라인 모드 (Premium)
  'coursera',        -- 모바일 앱 강의 내려받기
  'mango-languages'  -- 유닛 내려받기
)
  -- 재실행해도 중복으로 쌓이지 않게 한다
  and not (differentiators @> array['ux.offline_available']);
