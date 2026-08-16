-- =============================================================================
-- 시연용 후기 시드 (임시 데이터)
--
-- 목적
--   게이팅(4번째부터 블러)·정렬 4종·유형 필터·신고를 실제 화면에서 확인하려면
--   후기가 어느 정도 있어야 한다. 현재 DB에는 테스트 후기 2건뿐이라 아무것도
--   보이지 않는다.
--
-- 하는 일
--   1) 기존 후기 전부 삭제 (테스트 데이터)
--   2) 시연용 후기 12건 생성 — anki 6건 / duolingo 3건 / ttmik-website 3건
--
-- 지우는 방법 (시연이 끝나면)
--   delete from public.reviews where nickname like 'demo-%';
--
-- ⚠️ 임시 데이터다. 실제 학습자 후기가 쌓이기 시작하면 반드시 지울 것.
--    닉네임을 전부 'demo-' 로 시작하게 만든 이유가 이것이다 — 한 줄로 골라낼 수 있다.
-- =============================================================================

-- ── 1) 기존 테스트 후기 삭제 ────────────────────────────────────────────────
-- review_replies 는 외래키가 on delete cascade 라 함께 지워진다.
delete from public.reviews;

-- ── 2) 시연용 후기 ─────────────────────────────────────────────────────────
-- created_at 을 서로 다르게 둔다. 최신순 정렬이 실제로 동작하는지 보려면
-- 시각이 달라야 한다.
-- helpful_count 도 다르게 둔다 — '유용해요순' 정렬 확인용.
-- 학습유형(가~바)을 섞는다 — 유형 필터 확인용.

insert into public.reviews
  (app_id, nickname, learner_type, level, goal, usage_period, rating, content,
   chosen_strengths, chosen_limits, helpful_count, created_at)
values
  -- ── anki 6건 (게이팅 확인: 3건 공개 + "3개 더 있어요" 오버레이) ──
  ('anki', 'demo-mina', '가', 'intermediate', 'topik', '6m-lt1y', 5,
   '단어 외우는 데는 이만한 게 없어요. 매일 20분씩 반복하니까 TOPIK 어휘 파트 점수가 확실히 올랐습니다.',
   '{strength.vocabulary_volume,format.flashcard}', '{limit.weak_in_speaking}', 12,
   now() - interval '1 day'),

  ('anki', 'demo-tomas', '나', 'beginner', 'daily', '1m-lt3m', 4,
   '처음에는 설정이 복잡해서 헤맸는데 익숙해지니 편합니다. 다만 초보자에게는 진입 장벽이 조금 있어요.',
   '{format.flashcard,ux.offline_available}', '{limit.requires_supplementary}', 8,
   now() - interval '3 days'),

  ('anki', 'demo-yuki', '다', 'advanced', 'business', '1y+', 5,
   '업무에서 쓰는 표현을 직접 카드로 만들어 쓰고 있습니다. 자유도가 높아서 오래 쓸수록 좋아지는 앱이에요.',
   '{strength.vocabulary_volume,ux.offline_available}', '{limit.no_human_feedback}', 21,
   now() - interval '5 days'),

  ('anki', 'demo-lena', '라', 'elementary', 'culture', '3m-lt6m', 3,
   '반복 학습에는 좋지만 발음 연습이 전혀 안 됩니다. 다른 앱이랑 같이 써야 효과가 있어요.',
   '{format.flashcard}', '{limit.weak_in_speaking,limit.voice_recognition_unreliable}', 5,
   now() - interval '8 days'),

  ('anki', 'demo-pablo', '마', 'intermediate', 'daily', '6m-lt1y', 4,
   '무료인데 기능이 정말 많습니다. 카드 만드는 데 시간이 걸리는 게 유일한 단점이에요.',
   '{ux.offline_available,format.flashcard}', '{limit.requires_supplementary}', 15,
   now() - interval '12 days'),

  ('anki', 'demo-aisha', '바', 'beginner', 'topik', 'lt1w', 2,
   '아직 며칠밖에 안 썼는데 화면이 예쁘지 않고 처음 시작하기가 어렵습니다. 조금 더 써봐야 알 것 같아요.',
   '{}', '{limit.weak_in_grammar}', 1,
   now() - interval '15 days'),

  -- ── duolingo 3건 (후기 3건 이하 → 오버레이가 뜨지 않아야 한다) ──
  ('duolingo', 'demo-sofia', '가', 'beginner', 'daily', '1m-lt3m', 4,
   '게임처럼 되어 있어서 매일 열게 됩니다. 습관 만들기에는 정말 좋은 앱이라고 생각해요.',
   '{ux.gamification,ux.short_videos}', '{limit.weak_in_advanced}', 9,
   now() - interval '2 days'),

  ('duolingo', 'demo-hugo', '나', 'elementary', 'culture', '3m-lt6m', 3,
   '초반에는 재미있는데 중급으로 갈수록 배울 게 부족해집니다. 문법 설명이 거의 없는 것도 아쉬워요.',
   '{ux.gamification}', '{limit.weak_in_grammar,limit.weak_in_advanced}', 6,
   now() - interval '6 days'),

  ('duolingo', 'demo-nadia', '다', 'beginner', 'daily', 'lt1w', 5,
   '한국어를 처음 시작했는데 부담 없이 따라갈 수 있었어요. 매일 알림이 와서 빼먹지 않게 됩니다.',
   '{ux.gamification,ux.multilingual_interface}', '{}', 3,
   now() - interval '10 days'),

  -- ── ttmik-website 3건 ──
  ('ttmik-website', 'demo-marco', '라', 'intermediate', 'daily', '6m-lt1y', 5,
   '설명이 정말 친절합니다. 실제 대화에서 쓰는 표현을 배울 수 있어서 만족하며 쓰고 있어요.',
   '{strength.real_life_phrases,strength.grammar_explanation}', '{}', 18,
   now() - interval '4 days'),

  ('ttmik-website', 'demo-chen', '마', 'advanced', 'business', '1y+', 4,
   '중고급 자료가 많아서 오래 쓰기 좋습니다. 다만 유료 결제를 해야 제대로 활용할 수 있어요.',
   '{strength.grammar_explanation,format.downloadable_pdf}', '{limit.no_certification}', 11,
   now() - interval '9 days'),

  ('ttmik-website', 'demo-emma', '바', 'elementary', 'topik', '1w-lt1m', 4,
   '팟캐스트 형식이라 이동하면서 듣기 좋아요. 다만 시험 대비용으로는 조금 부족한 느낌입니다.',
   '{format.native_speaker_clips,strength.real_life_phrases}', '{limit.no_certification}', 7,
   now() - interval '14 days');

-- ── 확인 ───────────────────────────────────────────────────────────────────
select app_id, count(*) as 후기수
from public.reviews
group by app_id
order by 후기수 desc;
