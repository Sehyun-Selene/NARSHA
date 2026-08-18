-- 일반회원 표시명 중복 금지
--
-- 표시명은 후기에 작성자로 붙는다 (`reviews.nickname`). 같은 이름이 둘이면 후기를
-- 읽는 사람이 같은 사람의 글로 읽는다 — 신뢰가 걸린 정보라 유일해야 한다.
--
-- 대소문자를 구분하지 않는다. `Selene` 과 `selene` 은 화면에서 같은 사람으로 읽힌다.

-- ── 1. 기존 중복 정리 ────────────────────────────────────────────────────────
-- 제약을 걸기 전에 이미 있는 중복을 없애야 한다. 먼저 만든 계정이 이름을 유지하고,
-- 나중에 만든 계정에 `-2`, `-3` 을 붙인다. 본인이 `내 후기` 화면에서 바꿀 수 있다.
with ranked as (
  select
    id,
    display_name,
    row_number() over (partition by lower(display_name) order by created_at, id) as rn
  from public.members
)
update public.members m
set display_name = left(m.display_name, 36) || '-' || r.rn
from ranked r
where m.id = r.id
  and r.rn > 1;

-- ── 2. 유일 제약 ─────────────────────────────────────────────────────────────
create unique index if not exists members_display_name_lower_key
  on public.members (lower(display_name));

-- ── 3. 사용 가능 여부 조회 함수 ──────────────────────────────────────────────
-- `members` 는 자기 행만 읽을 수 있어서(members_select_own) 클라이언트가 직접
-- 중복을 확인할 수 없다. 그래서 **불린 하나만** 돌려주는 함수를 둔다 — 남의 이름을
-- 읽을 수는 없고 "쓸 수 있는지"만 알 수 있다.
--
-- 가입 화면에서 쓰므로 `anon` 에도 실행 권한을 준다. 이름 하나씩 찔러 보는 것은
-- 막지 않지만, 표시명은 공개 후기에 이미 드러나는 값이라 새로 새는 정보가 없다.
create or replace function public.display_name_available(candidate text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    length(btrim(candidate)) > 0
    and not exists (
      select 1 from public.members
      where lower(display_name) = lower(btrim(candidate))
    );
$$;

revoke all on function public.display_name_available(text) from public;
grant execute on function public.display_name_available(text) to anon, authenticated;
