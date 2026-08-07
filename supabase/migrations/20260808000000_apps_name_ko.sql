-- apps.name_ko — 서비스의 한국어 표기명.
--
-- 프론트엔드의 `nameKo` 는 `description_ko` 를 읽고 있었다. 한국어 *이름*
-- 자리에 한국어 *설명* 전체가 들어가 검색 매칭과 카드 표기가 어긋난다.
-- 이름 전용 컬럼을 두고 코드가 이쪽을 읽도록 바꾼다.
--
-- 값이 비면 프론트엔드가 영문 `name` 으로 폴백하므로, 시드는 한국어 표기가
-- 실제로 통용되는 서비스부터 채워 넣으면 된다 (예: 세종학당, 듀오링고).

alter table apps add column if not exists name_ko text;

comment on column apps.name_ko is
  '서비스의 한국어 표기명. 비어 있으면 프론트엔드가 name(영문)으로 폴백한다.';
