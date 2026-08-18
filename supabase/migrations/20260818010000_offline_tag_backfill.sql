-- 오프라인 이용 태그 정비 — 무료/유료 두 값으로 분리 + 누락 보강
--
-- 배경 1: 태그가 `HTSK - application` 한 건에만 붙어 있어서 `오프라인` 검색 결과가
--         1건뿐이었다. 실제로 콘텐츠를 내려받아 학습할 수 있는 서비스가 더 있다.
-- 배경 2: 그런데 대부분은 **결제해야 열리는 기능**이다. 하나의 태그로 묶으면
--         "무료로 오프라인 되는 줄 알고 받았다가 결제 화면을 보는" 결과가 된다.
--         그래서 값을 둘로 나눈다.
--
--   ux.offline_available  — 무료 구간에서 오프라인 이용 가능
--   ux.offline_paid_only  — 결제해야 오프라인 이용 가능 (신규)
--
-- 검색 `오프라인` 은 두 값을 모두 잡고, 카드에 붙는 칩이 어느 쪽인지 알려 준다.
-- 필터에서는 4번 축의 `오프라인`(무료)과 상세 필터의 `오프라인(유료)`로 갈린다.
--
-- ⚠️ `differentiators` 는 운영자 큐레이션 필드다 (CLAUDE.md §8-2). 후기 집계로
--    자동 변경되지 않으며, 이 마이그레이션은 운영자 요청에 따른 1회성 보정이다.
--    같은 내용이 `02_seed_apps.sql` 에도 반영돼 있어 재시드해도 유지된다.

-- ── 1. 무료 구간에서 오프라인 ────────────────────────────────────────────────
-- Anki 만 해당한다. 계정도 결제도 없이 로컬 덱으로 완전히 동작한다.
update public.apps
set differentiators = array_append(differentiators, 'ux.offline_available')
where id in ('anki')
  and not (differentiators @> array['ux.offline_available']);

-- ── 2. 결제해야 오프라인 ─────────────────────────────────────────────────────
update public.apps
set differentiators = array_append(differentiators, 'ux.offline_paid_only')
where id in (
  'quizlet',          -- 오프라인 학습은 Plus 전용
  'memrise',          -- 코스 내려받기는 유료
  'duolingo',         -- 레슨 내려받기는 Super
  'drops',            -- 오프라인 모드는 Premium
  'busuu',            -- 오프라인 모드는 Premium
  'lingodeer',        -- 코스 자체가 구독
  'mango-languages',  -- 유닛 내려받기는 구독
  'coursera',         -- 앱 내려받기는 수강 등록 후
  'htsk-application'  -- 앱 자체가 단건 결제
)
  and not (differentiators @> array['ux.offline_paid_only']);

-- ── 3. HTSK 앱은 무료 태그에서 뺀다 ──────────────────────────────────────────
-- 앱을 사야 쓸 수 있으므로 "무료로 오프라인" 이 아니다. 위에서 유료 값으로 옮겼다.
update public.apps
set differentiators = array_remove(differentiators, 'ux.offline_available')
where id = 'htsk-application';
