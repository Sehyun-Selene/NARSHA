-- =============================================================================
-- 운영자 태그 검토 알림 뷰 (CLAUDE.md §8-2)
--
-- 문제
--   `data/adminAlerts.ts` 가 `tag_boost_suggestions` · `tag_accuracy_checks` 를
--   조회하는데 이 뷰들이 DB 에 만들어진 적이 없다. 그래서 운영자 대시보드는
--   열 때마다 조회에 실패하고 "Failed to load alerts." 를 띄웠다. 태그 검토
--   기능이 처음부터 동작한 적이 없다.
--
-- 방침 — 알림만 띄운다. 자동 반영은 하지 않는다 (CLAUDE.md §8-2)
--   후기 집계로 운영자 큐레이션 필드(apps.differentiators)를 자동으로 바꾸지
--   않는다. 후기 조작에 그대로 노출되고, 임계값이 정확하다는 근거도 없다.
--   실제 반영은 대시보드에서 운영자가 클릭할 때만 일어난다.
--
-- 임계값은 `src/app/lib/alertThresholds.ts` 와 같은 값이어야 한다.
--   보강 제안:   후기 10건 이상 & 지지율 30% 이상 & 아직 태그에 없음
--   정확성 검토: 후기 10건 이상 & 지지율 10% 이하 & 이미 태그에 있음
-- =============================================================================

-- 앱별 후기 수 — 숨김 후기는 제외한다 (REQ-E / E-3)
create or replace view public.app_review_totals as
  select app_id, count(*)::int as total_reviews
  from public.reviews
  where is_hidden = false
  group by app_id;

-- 앱 × 강점태그별 지지 수
create or replace view public.app_tag_support as
  select
    r.app_id,
    tag,
    count(*)::int as supporter_count
  from public.reviews r
  cross join lateral unnest(r.chosen_strengths) as tag
  where r.is_hidden = false
  group by r.app_id, tag;

-- ── 보강 제안 ───────────────────────────────────────────────────────────────
-- 학습자들이 자주 꼽는데 운영자 큐레이션에는 빠져 있는 태그
create or replace view public.tag_boost_suggestions as
  select
    a.id                                                as app_id,
    a.name                                              as app_name,
    s.tag                                               as suggested_tag,
    s.supporter_count,
    t.total_reviews,
    round(100.0 * s.supporter_count / t.total_reviews, 1) as supporter_pct,
    a.differentiators                                   as current_tags
  from public.app_tag_support s
  join public.app_review_totals t on t.app_id = s.app_id
  join public.apps a              on a.id     = s.app_id
  where t.total_reviews >= 10
    and 100.0 * s.supporter_count / t.total_reviews >= 30
    and not (s.tag = any(a.differentiators))
    -- 운영자가 이미 판단해 치운 알림은 쿨다운 동안 다시 띄우지 않는다
    and not exists (
      select 1 from public.dismissed_alerts d
      where d.alert_type = 'boost_suggestion'
        and d.app_id = a.id
        and d.tag = s.tag
        and (d.expires_at is null or d.expires_at > now())
    );

-- ── 정확성 검토 ─────────────────────────────────────────────────────────────
-- 운영자가 붙여 둔 태그인데 학습자들은 거의 꼽지 않는 것
create or replace view public.tag_accuracy_checks as
  select
    a.id                                                       as app_id,
    a.name                                                     as app_name,
    tag                                                        as current_tag,
    coalesce(s.supporter_count, 0)                             as supporter_count,
    t.total_reviews,
    round(100.0 * coalesce(s.supporter_count, 0) / t.total_reviews, 1) as supporter_pct
  from public.apps a
  cross join lateral unnest(a.differentiators) as tag
  join public.app_review_totals t on t.app_id = a.id
  left join public.app_tag_support s on s.app_id = a.id and s.tag = tag
  where t.total_reviews >= 10
    and 100.0 * coalesce(s.supporter_count, 0) / t.total_reviews <= 10
    and not exists (
      select 1 from public.dismissed_alerts d
      where d.alert_type = 'accuracy_check'
        and d.app_id = a.id
        and d.tag = tag
        and (d.expires_at is null or d.expires_at > now())
    );

-- ── 권한 ────────────────────────────────────────────────────────────────────
-- 이 뷰들은 운영자 대시보드에서만 쓴다. anon 에는 열지 않는다.
-- 뷰는 기본이 security definer 처럼 동작하므로(정의자 권한), 하위 표의 RLS 를
-- 우회한다. 그래서 조회 자체를 authenticated 로 제한한다.
grant select on public.app_review_totals    to authenticated;
grant select on public.app_tag_support      to authenticated;
grant select on public.tag_boost_suggestions to authenticated;
grant select on public.tag_accuracy_checks   to authenticated;

revoke all on public.app_review_totals     from anon;
revoke all on public.app_tag_support       from anon;
revoke all on public.tag_boost_suggestions from anon;
revoke all on public.tag_accuracy_checks   from anon;
