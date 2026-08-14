-- =============================================================================
-- 일반회원 계정 (GNB PRD REQ-C / C-3, 결정 D6)
--
-- `auth.users` 는 desk 저자와 공유하되 프로필은 별도 표로 분리한다.
--   · `profiles`  = desk 저자 (초대코드로만 생성)
--   · `members`   = 일반회원 (자유 가입)
-- 한 계정이 양쪽에 동시에 존재하는 경우는 없다고 가정한다. 저자 승격 시나리오가
-- 없고, desk 의 RLS 정책을 한 줄도 건드리지 않아 기존 기능이 깨질 위험이 없다.
--
-- 저자인지 일반회원인지는 어느 표에 행이 있는지로 판별한다.
-- =============================================================================

create table if not exists public.members (
  id                      uuid primary key references auth.users(id) on delete cascade,
  display_name            text not null,
  -- REQ-G. 비로그인 상태의 localStorage 값과 비교해 더 최근 것을 채택하므로
  -- 갱신 시각을 함께 둔다.
  learner_type            text,
  learner_type_updated_at timestamptz,
  created_at              timestamptz not null default now()
);

alter table public.members enable row level security;

-- 자기 행만 읽고 쓴다. 후기 카드에 뜨는 이름은 reviews.nickname 에 함께 저장되므로
-- 남의 members 행을 읽을 일이 없다.
drop policy if exists "members_select_own" on public.members;
create policy "members_select_own" on public.members
  for select using (auth.uid() = id);

drop policy if exists "members_insert_own" on public.members;
create policy "members_insert_own" on public.members
  for insert with check (auth.uid() = id);

drop policy if exists "members_update_own" on public.members;
create policy "members_update_own" on public.members
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ⚠️ GRANT 를 빼먹으면 정책이 있어도 42501 이 난다 (20260814010000 참고)
grant select, insert, update on public.members to authenticated;

-- ── 내 후기 수정·삭제 (REQ-C / C-4) ─────────────────────────────────────────
-- 익명 후기(author_id IS NULL)는 소유자를 증명할 방법이 없어 수정·삭제 대상이
-- 아니다. 로그인 작성분만 본인이 고칠 수 있다.
drop policy if exists "reviews_member_update_own" on public.reviews;
create policy "reviews_member_update_own" on public.reviews
  for update to authenticated
  using (author_id is not null and author_id = auth.uid())
  with check (author_id is not null and author_id = auth.uid());

drop policy if exists "reviews_member_delete_own" on public.reviews;
create policy "reviews_member_delete_own" on public.reviews
  for delete to authenticated
  using (author_id is not null and author_id = auth.uid());

grant delete on public.reviews to authenticated;
