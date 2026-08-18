-- 오프라인 태그 — 무료/유료 분리를 되돌린다
--
-- 20260818010000 에서 `ux.offline_paid_only` 를 만들고, 원래 `ux.offline_available`
-- 로 분류돼 있던 `HTSK - application` 을 그쪽으로 옮겼다. 그런데 그 앱의 태그는
-- 등록 시점에 운영자가 이미 확인해 붙인 값이었다 — 요금 구조를 근거로 내가 재분류할
-- 대상이 아니었다 (CLAUDE.md §8-2: 운영자 큐레이션 필드).
--
-- 되돌린 뒤 `ux.offline_paid_only` 를 쓰는 앱이 없으므로 값 자체를 없앤다.
-- 라벨(`TAG_CHIP`/`TAG_LONG`)과 상세 필터 칩도 함께 제거했다.
--
-- 결과 — `오프라인` 태그가 붙은 앱 2건:
--   · anki             — 새로 붙였다. 무료·오프라인이고 저장소 밖 근거가 필요 없다
--   · htsk-application — 원래대로. 시드 설명에 오프라인 이용이 명시돼 있다

update public.apps
set differentiators = array_append(differentiators, 'ux.offline_available')
where id = 'htsk-application'
  and not (differentiators @> array['ux.offline_available']);

update public.apps
set differentiators = array_remove(differentiators, 'ux.offline_paid_only')
where differentiators @> array['ux.offline_paid_only'];
