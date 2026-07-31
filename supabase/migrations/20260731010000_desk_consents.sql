-- =============================================================================
-- 「나의 한국어 책상」 동의 기록 (법무 검토 §7.3)
--
-- 배경: 가입 동의 체크박스가 지금까지 클라이언트 화면 상태로만 존재하고
-- 서버·DB 어디에도 남지 않았다. 학습자가 해외 거주라 서면 동의서를 받을 수
-- 없으므로, 온라인 동의 기록이 유일한 증빙이 되어야 한다. 이 마이그레이션은
-- 그 기록을 남기기 위한 테이블을 추가한다.
--
-- 저장 항목(법무 자료 §7.3 권고 반영): 동의 시각, 동의 문안 버전, 항목별
-- 동의 여부, 실제 표시된 문안 스냅샷, 사용자 ID, 표시 언어.
-- =============================================================================

create table public.desk_consents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  post_id       uuid references public.desk_posts(id) on delete set null, -- 발행 시 저작권 재확인용(선택)
  consent_type  text not null,        -- 'terms_privacy' | 'copyright_license' | 'media_rights' | 'publish_copyright'
  version       text not null,        -- 동의 시점 문안 버전 식별자 (features/desk/legal/consentText.ts 참고)
  lang          text not null,        -- 'ko' | 'en' — 어떤 언어로 표시된 문안에 동의했는지
  agreed        boolean not null default true,
  snapshot_text text not null,        -- 동의 시점에 실제로 표시된 문안 원문
  created_at    timestamptz not null default now()
);

create index desk_consents_user_idx on public.desk_consents (user_id, consent_type, created_at desc);

alter table public.desk_consents enable row level security;

-- 본인 동의 기록만 조회 가능 (분쟁 시 본인이 자기 동의 이력을 확인할 수 있어야 한다)
create policy "author read own consents"
  on public.desk_consents for select
  using (auth.uid() = user_id);

-- 발행 시 저작권 재확인은 클라이언트(authenticated)에서 직접 기록한다.
-- 가입 시 3종 동의는 redeem-invite Edge Function(service_role)에서 기록한다.
create policy "author insert own consents"
  on public.desk_consents for insert
  with check (auth.uid() = user_id);

-- GRANT — 이 프로젝트는 신규 테이블에 authenticated/service_role 기본 권한이
-- 자동 부여되지 않는 것이 반복 확인되어(과거 3건) 명시적으로 부여한다.
grant select, insert on public.desk_consents to authenticated;
grant select, insert, update, delete on public.desk_consents to service_role;
