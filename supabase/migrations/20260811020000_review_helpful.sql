-- =============================================================================
-- '유용해요' 서버 이전 (GNB PRD REQ-F / F-1)
--
-- 문제
--   지금까지 '유용해요' 카운트는 각 브라우저의 localStorage 에만 있었다. 그래서
--   사용자마다 다른 숫자가 보이고(남의 화면에는 늘 0), 브라우저를 바꾸면 사라졌다.
--   reviews.helpful_count 컬럼은 있었지만 아무도 쓰지 않았다.
--
-- 설계
--   투표는 (후기, 투표자키) 한 쌍으로 기록한다. 기본키가 그 쌍이므로 한 사람이
--   같은 후기에 두 번 반영되는 일이 없다.
--
--   투표자키 형식
--     'u:<uuid>'     로그인 사용자 (REQ-C 회원 체계 이후)
--     'a:<ip_hash>'  익명 사용자 — 서버 함수가 요청 IP 에 salt 를 섞어 해시한 값
--
--   원문 IP 는 저장하지 않는다. 해시만 남기고, 별도 정리 주기를 두지 않는 대신
--   투표 기록 자체를 보존한다(집계 근거). 빈도 제한용 IP 기록은 REQ-E-1 의
--   reviews_rate_limit 에서 24시간만 보관한다.
--
-- 주의 — 이 테이블만으로는 조작을 막지 못한다
--   투표자키는 요청자가 보낸 값이라 서버가 진위를 검증할 수 없다. 그래서 익명
--   투표는 반드시 서버 함수(api/review-helpful)를 경유해 IP 로 키를 만들어야
--   하고, 클라이언트가 임의 키로 직접 INSERT 하는 경로는 열지 않는다.
-- =============================================================================

create table if not exists public.review_helpful (
  review_id  uuid not null references public.reviews(id) on delete cascade,
  voter_key  text not null,
  created_at timestamptz not null default now(),
  primary key (review_id, voter_key)
);

create index if not exists review_helpful_review_idx on public.review_helpful (review_id);

-- reviews.helpful_count 를 트리거로 자동 갱신한다.
-- 매번 집계 쿼리를 돌리지 않기 위함이다 (목록 화면에서 후기마다 세면 비싸다).
create or replace function public.sync_helpful_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.reviews set helpful_count = helpful_count + 1 where id = new.review_id;
  elsif (tg_op = 'DELETE') then
    update public.reviews set helpful_count = greatest(0, helpful_count - 1) where id = old.review_id;
  end if;
  return null;
end;
$$;

drop trigger if exists review_helpful_sync on public.review_helpful;
create trigger review_helpful_sync
  after insert or delete on public.review_helpful
  for each row execute function public.sync_helpful_count();

alter table public.review_helpful enable row level security;

-- 읽기 — 내가 누른 후기가 무엇인지 확인할 수 있어야 화면에 반영 상태를 그린다.
-- 투표자키는 식별정보가 아니라 해시이므로 공개 조회를 허용한다.
drop policy if exists "review_helpful_read" on public.review_helpful;
create policy "review_helpful_read"
  on public.review_helpful for select
  using (true);

-- 쓰기 — 클라이언트에서 직접 넣지 못하게 둔다. 서버 함수(service_role 또는
-- 서버에서만 쓰는 경로)로만 기록한다. 임의 키 생성으로 숫자를 부풀리는 것을
-- 막기 위한 것이다.
grant select on public.review_helpful to anon, authenticated;

-- reviews.helpful_count 를 트리거가 갱신하므로, 트리거 함수가 reviews 를 고칠 수
-- 있어야 한다. security definer 로 선언해 호출자 권한과 무관하게 동작한다.
