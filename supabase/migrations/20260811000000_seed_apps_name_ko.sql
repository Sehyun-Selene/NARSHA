-- apps.name_ko 시드 (PRD i18n R5.15)
--
-- 컬럼은 20260808000000_apps_name_ko.sql 에서 추가했고, 값이 전부 비어 있어
-- 한국어 모드에서 모든 서비스명이 영문으로 폴백하고 있었다.
--
-- 채우는 기준 — 임의 음차를 만들지 않는다 (PRD §5.5: 고유명사는 번역하지 않는다).
-- 아래 둘 중 하나에 해당하는 서비스만 채운다.
--   (1) 서비스 자신이 한국어 표기를 쓰는 경우      → 세종학당, 트이다, 씨밀레
--   (2) 한국어 표기가 이미 aliases 에 등록된 경우  → 듀오링고
--
-- 나머지는 비워 둔다. 비어 있으면 프론트엔드가 영문 name 으로 폴백하므로
-- 화면이 깨지지 않고, 통용되지 않는 음차를 노출하는 것보다 정확하다.
-- 추가로 채우고 싶은 서비스가 생기면 같은 형식으로 한 줄씩 덧붙이면 된다.

update public.apps set name_ko = '세종학당'    where id = 'king-sejong'  and name_ko is null;
update public.apps set name_ko = '트이다'      where id = 'teuida'       and name_ko is null;
update public.apps set name_ko = '씨밀레 코리안' where id = 'seemile'      and name_ko is null;
update public.apps set name_ko = '듀오링고'    where id = 'duolingo'     and name_ko is null;
