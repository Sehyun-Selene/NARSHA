-- ============================================================
-- NARSHA MVP — Apps Seed Data (from Database_narsha_v1.csv)
-- Run AFTER 01_schema.sql
-- ============================================================

insert into apps (
  id, name, aliases, learning_field, learning_type, sensory, style, learner_type_code,
  level, purpose, pricing, teaching_language, realtime_feedback,
  differentiators, limitations, platform, url, description, description_ko, logo_src
) values

-- 1. Anki
(
  'anki', 'Anki', '{}',
  array['vocabulary'],
  '가 Visual Exploratory', 'visual', 'exploratory', '가',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['free','one-time purchase'],
  array['lang.user_defined'],
  array['noFeedback'],
  array['mechanism.active_recall','mechanism.self_assessment','authority.research_backed','format.flashcard','strength.vocabulary_volume','ux.offline_available'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://apps.ankiweb.net',
  'Flashcard app that schedules reviews using spaced repetition.',
  '간격 반복으로 복습 시점을 잡아 주는 플래시카드 앱입니다.',
  '/app-logos/anki.png'
),

-- 2. 세종학당
(
  'king-sejong', '세종학당', array['sejong','king sejong','king sejong institute','ksi'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '바 Mixed Structured', 'mixed', 'structured', '바',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['free'],
  array['lang.korean'],
  array['aiFeedback','humanFeedback'],
  array['authority.official_curriculum','instructor.institutional','social.live_class_option','strength.cultural_context','format.downloadable_pdf'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://www.ksif.or.kr/index.do?lang=eng',
  'Official Korean language and culture programs run under government oversight.',
  '정부 산하 기관이 운영하는 공식 한국어·한국문화 교육 프로그램입니다.',
  '/app-logos/sejong.png'
),

-- 3. Teuida
(
  'teuida', 'Teuida(트이다)', array['teuida','트이다'],
  array['listening','speaking'],
  '라 Auditory Structured', 'auditory', 'structured', '라',
  array['beginner','elementary','intermediate'],
  array['entertainment'],
  array['freemium'],
  array['lang.english','lang.vietnamese'],
  array['aiFeedback'],
  array['mechanism.scenario_based','format.live_action_drama','strength.pronunciation','fit.shy_speaker','strength.real_life_phrases'],
  array['limit.voice_recognition_unreliable'],
  array['Android','iOS'],
  'https://www.teuida.net/en',
  'First-person video scenarios to practice listening and speaking aloud.',
  '1인칭 영상 시나리오로 듣기·말하기를 연습하는 앱입니다.',
  '/app-logos/teuida.png'
),

-- 4. Memrise
(
  'memrise', 'Memrise', '{}',
  array['listening','speaking','vocabulary'],
  '바 Mixed Structured', 'mixed', 'structured', '바',
  array['beginner','elementary','intermediate'],
  array['academic','entertainment'],
  array['freemium'],
  array['lang.english','lang.multilingual_20plus'],
  array['aiFeedback'],
  array['format.native_speaker_clips','strength.real_life_phrases','mechanism.bite_sized_lessons','ux.gamification','fit.casual_learner'],
  array['limit.weak_in_grammar'],
  array['Android','Website','iOS'],
  'https://www.memrise.com/courses/english/korean/',
  'Vocabulary courses with short native-speaker videos and memory hooks.',
  '원어민 짧은 영상과 암기 팁이 있는 어휘 중심 코스입니다.',
  '/app-logos/memrise.png'
),

-- 5. seemile Korean
(
  'seemile', 'seemile Korean(씨밀레)', array['seemile','씨밀레'],
  array['grammar','reading','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['academic'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','strength.grammar_explanation'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Structured grammar and vocabulary lessons by a native Korean instructor on YouTube.',
  '원어민 강사가 진행하는 체계적인 문법·어휘 유튜브 강의입니다.',
  null
),

-- 6. KoreanClass101
(
  'koreanclass101', 'KoreanClass101', array['korean class 101','kc101'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '바 Mixed Structured', 'mixed', 'structured', '바',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','strength.cultural_context','social.companion_service_paid','strength.real_life_phrases'],
  array['limit.requires_supplementary'],
  array['youtubeChannel'],
  null,
  'Bite-sized Korean lessons on YouTube covering all levels and real-life topics.',
  '모든 레벨과 실생활 주제를 다루는 유튜브 한국어 레슨입니다.',
  null
),

-- 7. Korean Unnie
(
  'korean-unnie', 'Korean Unnie', '{}',
  array['grammar','listening','vocabulary'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary','intermediate'],
  array['academic','entertainment'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Native Korean speaker breaking down grammar and vocab in an approachable style.',
  '원어민 언니가 친근한 방식으로 문법과 어휘를 풀어주는 채널입니다.',
  null
),

-- 8. Sweet and Tasty TV
(
  'sweet-and-tasty-tv', 'Sweet and Tasty TV', '{}',
  array['listening','vocabulary'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary'],
  array['entertainment'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','ux.short_videos'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Short fun videos for learning everyday Korean vocabulary and expressions.',
  '일상 어휘와 표현을 짧고 재미있는 영상으로 배울 수 있는 채널입니다.',
  null
),

-- 9. GO! Billy Korean
(
  'go-billy-korean', 'GO! Billy Korean', array['billy korean','go billy','billy'],
  array['grammar','listening','reading','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['academic','topikPreparation'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.foreign_learner','strength.grammar_explanation','format.whiteboard_explanation','ux.long_form_content','pace.deep_dive_session'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'In-depth Korean grammar explanations by a fluent foreign learner on YouTube.',
  '외국인 학습자 출신 강사가 화이트보드로 문법을 심층 설명하는 채널입니다.',
  null
),

-- 10. Your Korean Friend Hailey
(
  'your-korean-friend-hailey', 'Your Korean Friend Hailey', '{}',
  array['grammar','speaking','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner'],
  array['academic','entertainment'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','ux.short_videos'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Short, beginner-friendly Korean lessons from a native speaker.',
  '원어민이 진행하는 짧고 초보자 친화적인 한국어 레슨 채널입니다.',
  null
),

-- 11. Prof. Yoon's Korean Class
(
  'prof-yoons-korean-class', 'Prof. Yoon''s Korean Class', '{}',
  array['grammar','reading','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['academic'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','strength.grammar_explanation'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Academic-style Korean grammar and reading lessons by Professor Yoon.',
  '윤 교수의 학술적 스타일 한국어 문법·읽기 강의 채널입니다.',
  null
),

-- 12. Motivate Korean
(
  'motivate-korean', 'Motivate Korean', '{}',
  array['listening','speaking','vocabulary'],
  '다 Auditory Exploratory', 'auditory', 'exploratory', '다',
  array['intermediate','advanced'],
  array['academic','entertainment'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'Intermediate-to-advanced Korean listening and speaking content on YouTube.',
  '중고급 학습자를 위한 한국어 청취·말하기 콘텐츠 채널입니다.',
  null
),

-- 13. TTMIK - website
(
  'ttmik-website', 'TTMIK - website', array['talk to me in korean','ttmik web'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','entertainment'],
  array['freemium'],
  array['lang.english'],
  array['noFeedback'],
  array['format.text_with_audio','mechanism.numbered_curriculum','format.downloadable_pdf','instructor.native_speaker','social.companion_service_paid'],
  array[]::text[],
  array['Website'],
  'https://talktomeinkorean.com',
  'Structured Korean lessons with audio, PDF notes, and workbooks by TTMIK.',
  'TTMIK의 오디오·PDF 노트·워크북이 갖춰진 체계적 한국어 레슨 사이트입니다.',
  '/app-logos/ttmik.png'
),

-- 14. TTMIK - youtube
(
  'ttmik-youtube', 'TTMIK - youtube', array['talk to me in korean','ttmik youtube'],
  array['listening','vocabulary'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary','intermediate'],
  array['entertainment'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.native_speaker','strength.cultural_context','strength.real_life_phrases','fit.casual_learner'],
  array[]::text[],
  array['youtubeChannel'],
  null,
  'TTMIK YouTube channel — cultural insights and real-life Korean for casual learners.',
  '일상 한국어와 문화 콘텐츠를 담은 TTMIK 유튜브 채널입니다.',
  null
),

-- 15. LingoDeer
(
  'lingodeer', 'LingoDeer', '{}',
  array['grammar','listening','reading','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['academic','entertainment','topikPreparation'],
  array['freemium'],
  array['lang.english','lang.chinese','lang.japanese','lang.spanish','lang.french','lang.german','lang.portuguese','lang.vietnamese','lang.russian','lang.indonesian','lang.italian','lang.turkish','lang.hindi','lang.arabic','lang.polish'],
  array['noFeedback'],
  array['strength.grammar_explanation','mechanism.numbered_curriculum','authority.expert_designed','fit.needs_structure','ux.multilingual_interface'],
  array['limit.weak_in_advanced'],
  array['Android','Website','iOS'],
  'https://www.lingodeer.com/en/',
  'Structured app courses with clear grammar explanations for Korean and other Asian languages.',
  '한국어 등 아시아 언어용으로 문법 설명이 잘 정리된 구조형 앱 코스입니다.',
  '/app-logos/lingodeer.png'
),

-- 16. Duolingo
(
  'duolingo', 'Duolingo', array['듀오링고','duo'],
  array['reading','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary'],
  array['entertainment'],
  array['freemium'],
  array['lang.english','lang.japanese','lang.spanish','lang.chinese','lang.french','lang.german','lang.italian','lang.portuguese'],
  array['noFeedback'],
  array['ux.gamification','mechanism.bite_sized_lessons','pace.daily_short_session','fit.casual_learner','ux.multilingual_interface'],
  array['limit.weak_in_advanced','limit.weak_in_grammar'],
  array['Android','Website','iOS'],
  'https://www.duolingo.com/course/ko/en/Learn-Korean',
  'Bite-sized gamified lessons for Korean on web and mobile.',
  '웹·모바일에서 한국어를 짧은 게임형 레슨으로 배울 수 있는 앱입니다.',
  '/app-logos/duolingo.png'
),

-- 17. Drops
(
  'drops', 'Drops', '{}',
  array['vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['entertainment'],
  array['freemium'],
  array['lang.english','lang.multilingual_20plus'],
  array['noFeedback'],
  array['mechanism.bite_sized_lessons','pace.daily_short_session','format.flashcard','fit.casual_learner'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://languagedrops.com/en/',
  'Five-minute, illustration-led vocabulary sessions with minimal reading.',
  '5분 안에 그림·아이콘으로 어휘만 빠르게 다지는 앱입니다.',
  '/app-logos/drops.png'
),

-- 18. Hangul : Hey Korea
(
  'hangul-hey-korea', 'Hangul : Hey Korea', array['hangul','hey korea'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '가 Visual Exploratory', 'visual', 'exploratory', '가',
  array['beginner','elementary','intermediate'],
  array['entertainment','topikPreparation'],
  array['freemium'],
  array['lang.english','lang.vietnamese'],
  array['aiFeedback'],
  array['strength.pronunciation','fit.casual_learner'],
  array[]::text[],
  array['Android','iOS'],
  null,
  'All-in-one Korean learning app with pronunciation feedback and AI-assisted review.',
  'AI 발음 피드백과 종합 학습 기능을 갖춘 한국어 앱입니다.',
  null
),

-- 19. Coursera
(
  'coursera', 'Coursera', '{}',
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','intermediate'],
  array['academic'],
  array['freemium'],
  array['lang.english'],
  array['noFeedback'],
  array['authority.expert_designed','instructor.institutional','format.video_lecture','pace.deep_dive_session','social.companion_service_paid'],
  array['limit.requires_supplementary'],
  array['Android','Website','iOS'],
  'https://www.coursera.org',
  'University-level Korean courses with structured video lectures and certificates.',
  '대학 강의 수준의 체계적인 한국어 코스와 수료증을 제공합니다.',
  null
),

-- 20. Cake
(
  'cake', 'Cake', '{}',
  array['listening','speaking','vocabulary'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary','intermediate','advanced'],
  array['entertainment'],
  array['freemium'],
  array['lang.english','lang.multilingual_20plus'],
  array['aiFeedback'],
  array['format.native_speaker_clips','strength.kpop_kdrama_context','strength.real_life_phrases','mechanism.bite_sized_lessons','pace.daily_short_session'],
  array['limit.requires_supplementary'],
  array['Android','Website','iOS'],
  'https://mycake.me',
  'Short clips from K-pop and K-drama to learn real-life Korean naturally.',
  'K-팝·드라마 클립으로 실생활 한국어를 자연스럽게 익히는 앱입니다.',
  null
),

-- 21. Kimchi Reader
(
  'kimchi-reader', 'Kimchi Reader', '{}',
  array['reading','vocabulary'],
  '가 Visual Exploratory', 'visual', 'exploratory', '가',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','entertainment'],
  array['subscription-only'],
  array['lang.english'],
  array['noFeedback'],
  array['strength.vocabulary_volume','format.text_with_audio'],
  array[]::text[],
  array['Android','Website'],
  null,
  'Korean reading platform with graded texts and built-in vocabulary support.',
  '수준별 한국어 읽기 자료와 내장 어휘 지원을 제공하는 플랫폼입니다.',
  null
),

-- 22. Lingory
(
  'lingory', 'Lingory', '{}',
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['topikPreparation'],
  array['freemium'],
  array['lang.english'],
  array['noFeedback'],
  array['strength.exam_focused','fit.career_focused'],
  array[]::text[],
  array['Android','iOS'],
  null,
  'TOPIK-focused Korean learning app for exam preparation and career goals.',
  'TOPIK 시험 준비와 취업 목표를 위한 한국어 학습 앱입니다.',
  null
),

-- 23. Preply
(
  'preply', 'Preply', '{}',
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','businessProficiency','entertainment','topikPreparation'],
  array['subscription-only'],
  array['lang.tutor_dependent'],
  array['humanFeedback'],
  array['social.live_class_option','instructor.bilingual_tutor','pace.flexible_pacing','fit.career_focused','strength.pronunciation'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://preply.com',
  'Live 1-on-1 Korean tutoring with bilingual tutors for all goals.',
  '이중 언어 튜터와 함께하는 1:1 화상 한국어 수업으로 모든 목표에 대응합니다.',
  null
),

-- 24. Busuu
(
  'busuu', 'Busuu', '{}',
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary'],
  array['academic','businessProficiency'],
  array['freemium'],
  array['lang.english','lang.japanese','lang.spanish','lang.italian','lang.french','lang.arabic','lang.dutch','lang.chinese','lang.turkish','lang.russian','lang.german','lang.portuguese','lang.polish'],
  array['humanFeedback'],
  array['mechanism.numbered_curriculum','social.peer_interaction','strength.grammar_explanation','fit.needs_structure','ux.multilingual_interface'],
  array['limit.weak_in_advanced'],
  array['Android','Website','iOS'],
  'https://www.busuu.com',
  'Structured Korean courses with peer feedback and grammar focus.',
  '동료 피드백과 문법 중심의 체계적인 한국어 코스입니다.',
  null
),

-- 25. 90 Day Korean
(
  '90-day-korean', '90 Day Korean', array['90day korean','ninety day korean','90일 한국어'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate'],
  array['businessProficiency','entertainment'],
  array['subscription-only'],
  array['lang.english'],
  array['humanFeedback'],
  array['mechanism.numbered_curriculum','fit.casual_learner','social.community_forum'],
  array['limit.weak_in_advanced'],
  array['Website'],
  'https://www.90daykorean.com',
  'Structured 90-day Korean program for conversational fluency.',
  '회화 유창성을 위한 90일 구조화 한국어 프로그램입니다.',
  null
),

-- 26. Quizlet
(
  'quizlet', 'Quizlet', '{}',
  array['grammar','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['freemium'],
  array['lang.user_defined'],
  array['aiFeedback'],
  array['format.flashcard','mechanism.active_recall','mechanism.topic_based','social.community_forum','strength.vocabulary_volume'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://quizlet.com',
  'Flashcard platform with active recall and AI-assisted study sets for Korean.',
  '능동 회상과 AI 학습 세트로 한국어를 공부하는 플래시카드 플랫폼입니다.',
  null
),

-- 27. HTSK - website
(
  'htsk-website', 'HTSK - website', array['how to study korean','htsk web'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['free'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.foreign_learner','strength.grammar_explanation','mechanism.numbered_curriculum','ux.long_form_content','pace.deep_dive_session'],
  array[]::text[],
  array['Website'],
  'https://www.howtostudykorean.com',
  'Free comprehensive Korean grammar website with numbered units from beginner to advanced.',
  '초급부터 고급까지 번호 단원으로 구성된 무료 한국어 문법 종합 사이트입니다.',
  null
),

-- 28. HTSK - application
(
  'htsk-application', 'HTSK - application', array['how to study korean','htsk app'],
  array['grammar','listening','reading','speaking','vocabulary','writing'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['academic','topikPreparation'],
  array['one-time purchase'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.foreign_learner','strength.grammar_explanation','mechanism.numbered_curriculum','ux.offline_paid_only'],
  array[]::text[],
  array['Android','iOS'],
  null,
  'HTSK mobile app — full Korean grammar curriculum available offline.',
  'HTSK 모바일 앱으로 오프라인에서도 전체 문법 커리큘럼을 사용할 수 있습니다.',
  null
),

-- 29. Mango Languages
(
  'mango-languages', 'Mango Languages', '{}',
  array['speaking','vocabulary'],
  '라 Auditory Structured', 'auditory', 'structured', '라',
  array['beginner','elementary'],
  array['businessProficiency','entertainment'],
  array['subscription-only'],
  array['lang.english'],
  array['noFeedback'],
  array['instructor.institutional','fit.career_focused'],
  array[]::text[],
  array['Android','Website','iOS'],
  'https://mangolanguages.com',
  'Conversation-focused Korean lessons often available free through public libraries.',
  '공공 도서관을 통해 무료로 이용 가능한 경우가 많은 회화 중심 한국어 앱입니다.',
  null
),

-- 30. Avocards
(
  'avocards', 'Avocards', '{}',
  array['vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['beginner','elementary','intermediate','advanced'],
  array['entertainment'],
  array['freemium'],
  array['lang.english'],
  array['noFeedback'],
  array['format.flashcard'],
  array[]::text[],
  array['Android','iOS'],
  null,
  'Simple flashcard app for building Korean vocabulary on mobile.',
  '모바일에서 한국어 어휘를 쌓기 위한 심플한 플래시카드 앱입니다.',
  null
),

-- 31. TOPIK ONE
(
  'topik-one', 'TOPIK ONE', array['topik 1','topik one','토픽 원'],
  array['grammar','listening','reading','vocabulary'],
  '나 Visual Structured', 'visual', 'structured', '나',
  array['intermediate','advanced'],
  array['topikPreparation'],
  array['freemium'],
  array['lang.english'],
  array['noFeedback'],
  array['strength.exam_focused','fit.career_focused'],
  array[]::text[],
  array['iOS'],
  null,
  'TOPIK exam preparation app with practice tests and grammar drills.',
  'TOPIK 모의고사와 문법 드릴을 제공하는 시험 준비 앱입니다.',
  null
),

-- 32. Pingo AI
(
  'pingo-ai', 'Pingo AI', '{}',
  array['speaking'],
  '다 Auditory Exploratory', 'auditory', 'exploratory', '다',
  array['beginner','elementary','intermediate','advanced'],
  array['businessProficiency','entertainment'],
  array['freemium'],
  array['lang.english','lang.multilingual_20plus'],
  array['aiFeedback'],
  array['strength.pronunciation','fit.shy_speaker','mechanism.scenario_based','strength.real_life_phrases','pace.flexible_pacing'],
  array['limit.voice_recognition_unreliable'],
  array['Android','iOS'],
  null,
  'AI conversation partner for Korean speaking practice with pronunciation feedback.',
  'AI 대화 파트너와 발음 피드백으로 한국어 말하기를 연습하는 앱입니다.',
  null
),

-- 33. Hello Talk
(
  'hello-talk', 'Hello Talk', array['hello talk'],
  array['reading','speaking','writing'],
  '마 Mixed Exploratory', 'mixed', 'exploratory', '마',
  array['beginner','elementary','intermediate','advanced'],
  array['businessProficiency','entertainment'],
  array['freemium'],
  array[]::text[],
  array['humanFeedback'],
  array['social.peer_interaction','instructor.community_built','strength.real_life_phrases','strength.slang_trendy','fit.shy_speaker'],
  array['limit.requires_supplementary'],
  array['Android','Website','iOS'],
  null,
  'Language exchange community for practicing Korean with native speakers.',
  '원어민과 함께 한국어를 연습하는 언어 교환 커뮤니티 앱입니다.',
  null
)

on conflict (id) do update set
  name              = excluded.name,
  aliases           = excluded.aliases,
  learning_field    = excluded.learning_field,
  learning_type     = excluded.learning_type,
  sensory           = excluded.sensory,
  style             = excluded.style,
  learner_type_code = excluded.learner_type_code,
  level             = excluded.level,
  purpose           = excluded.purpose,
  pricing           = excluded.pricing,
  teaching_language = excluded.teaching_language,
  realtime_feedback = excluded.realtime_feedback,
  differentiators   = excluded.differentiators,
  limitations       = excluded.limitations,
  platform          = excluded.platform,
  url               = excluded.url,
  description       = excluded.description,
  description_ko    = excluded.description_ko,
  logo_src          = excluded.logo_src;
