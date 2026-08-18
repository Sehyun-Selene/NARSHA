import type { Entry } from './strings';

/**
 * 필터 칩 / 태그 라벨 전용 사전 (PRD R5.16).
 * 키는 DB 태그 **값(value)** 그대로다 — 값은 필터 쿼리 키이므로 절대 바꾸지 않는다.
 * 조회는 `i18n/index.ts` 의 `tagLabel(value, lang)` 을 쓴다.
 *
 * 한국어 라벨은 6자 이내를 원칙으로 한다 (PRD §9 R1).
 */

/** 칩에 쓰는 짧은 라벨 */
export const TAG_CHIP = {
  // ── Learning field (learning_field) ──
  // 화면에 아직 안 쓰이지만 라벨을 둔다 — 검색 사전이 이 표에서 자동 생성되므로
  // 라벨이 없으면 그 태그는 한국어로 검색되지 않는다.
  'vocabulary': { ko: '어휘',   en: 'Vocabulary' },
  'listening':  { ko: '듣기',   en: 'Listening' },
  'speaking':   { ko: '말하기', en: 'Speaking' },
  'grammar':    { ko: '문법',   en: 'Grammar' },
  'reading':    { ko: '읽기',   en: 'Reading' },
  'writing':    { ko: '쓰기',   en: 'Writing' },

  // ── Sensory / Style (감각 선호 · 접근 방식 원값) ──
  'visual':      { ko: '시각',   en: 'Visual' },
  'auditory':    { ko: '청각',   en: 'Auditory' },
  'mixed':       { ko: '복합',   en: 'Mixed' },
  'exploratory': { ko: '탐색형', en: 'Exploratory' },
  'structured':  { ko: '구조형', en: 'Structured' },

  // ── Level ────────────────────────────────────────────────────────────────
  'beginner':     { ko: '입문', en: 'Beginner' },
  'elementary':   { ko: '초급', en: 'Elementary' },
  'intermediate': { ko: '중급', en: 'Intermediate' },
  'advanced':     { ko: '고급', en: 'Advanced' },
  'all_levels':   { ko: '전체', en: 'All levels' },

  // ── Purpose ──────────────────────────────────────────────────────────────
  'topikPreparation':    { ko: 'TOPIK',    en: 'TOPIK' },
  'academic':            { ko: '학업',     en: 'Academic' },
  'businessProficiency': { ko: '비즈니스', en: 'Business' },
  'entertainment':       { ko: 'K콘텐츠',  en: 'K-Content' },

  // ── Learner type (코드는 유지, 뒤 설명만 번역) ───────────────────────────
  '가': { ko: '가 시각·탐색', en: '가 Vis·Open' },
  '나': { ko: '나 시각·구조', en: '나 Vis·Guided' },
  '다': { ko: '다 청각·탐색', en: '다 Aud·Open' },
  '라': { ko: '라 청각·구조', en: '라 Aud·Guided' },
  '마': { ko: '마 복합·탐색', en: '마 Mix·Open' },
  '바': { ko: '바 복합·구조', en: '바 Mix·Guided' },

  // ── Price ────────────────────────────────────────────────────────────────
  'free':               { ko: '무료',      en: 'Free' },
  'freemium':           { ko: '부분 유료', en: 'Free + Paid' },
  'one-time purchase':  { ko: '단건 결제', en: 'One-time' },
  'subscription-only':  { ko: '구독',      en: 'Subscription' },

  // ── Platform ─────────────────────────────────────────────────────────────
  'iOS':            { ko: 'iOS',     en: 'iOS' },
  'Android':        { ko: 'Android', en: 'Android' },
  'Website':        { ko: '웹',      en: 'Web' },
  'youtubeChannel': { ko: '유튜브',  en: 'YouTube' },

  // ── Teaching language ────────────────────────────────────────────────────
  'lang.english':             { ko: '영어',           en: 'English' },
  'lang.japanese':            { ko: '일본어',         en: 'Japanese' },
  'lang.chinese':             { ko: '중국어',         en: 'Chinese' },
  'lang.vietnamese':          { ko: '베트남어',       en: 'Vietnamese' },
  'lang.spanish':             { ko: '스페인어',       en: 'Spanish' },
  'lang.french':              { ko: '프랑스어',       en: 'French' },
  'lang.german':              { ko: '독일어',         en: 'German' },
  'lang.italian':             { ko: '이탈리아어',     en: 'Italian' },
  'lang.portuguese':          { ko: '포르투갈어',     en: 'Portuguese' },
  'lang.russian':             { ko: '러시아어',       en: 'Russian' },
  'lang.arabic':              { ko: '아랍어',         en: 'Arabic' },
  'lang.turkish':             { ko: '터키어',         en: 'Turkish' },
  'lang.dutch':               { ko: '네덜란드어',     en: 'Dutch' },
  'lang.polish':              { ko: '폴란드어',       en: 'Polish' },
  'lang.indonesian':          { ko: '인도네시아어',   en: 'Indonesian' },
  'lang.hindi':               { ko: '힌디어',         en: 'Hindi' },
  'lang.korean':              { ko: '한국어 (메타)',  en: 'Korean (meta)' },
  'lang.user_defined':        { ko: '사용자 설정',    en: 'User-defined' },
  'lang.tutor_dependent':     { ko: '튜터 설정',      en: 'Tutor-set' },
  'lang.multilingual_20plus': { ko: '20개 이상 언어', en: '20+ Languages' },

  // ── Realtime feedback ────────────────────────────────────────────────────
  'aiFeedback':    { ko: 'AI 피드백',    en: 'AI Feedback' },
  'humanFeedback': { ko: '튜터 피드백',  en: 'Human / Tutor' },
  'noFeedback':    { ko: '피드백 없음',  en: 'No Feedback' },

  // ── Learning mechanism ───────────────────────────────────────────────────
  'mechanism.active_recall':       { ko: '떠올려 복습',   en: 'Active Recall' },
  'mechanism.self_assessment':     { ko: '자가 점검',     en: 'Self-assessment' },
  'mechanism.scenario_based':      { ko: '실생활 상황',   en: 'Real-life Scenarios' },
  'mechanism.numbered_curriculum': { ko: '단계별 학습',   en: 'Step-by-step Path' },
  'mechanism.textbook_aligned':    { ko: '교재 연계',     en: 'Textbook-aligned' },
  'mechanism.topic_based':         { ko: '주제별',        en: 'Topic-based' },
  'mechanism.bite_sized_lessons':  { ko: '짧은 단위',     en: 'Bite-sized' },

  // ── Content format ───────────────────────────────────────────────────────
  'format.flashcard':              { ko: '플래시카드',   en: 'Flashcard' },
  'format.video_lecture':          { ko: '동영상 강의',  en: 'Video Lecture' },
  'format.native_speaker_clips':   { ko: '원어민 클립',  en: 'Native Clips' },
  'format.animated_lesson':        { ko: '애니메이션',   en: 'Animation' },
  'format.live_action_drama':      { ko: '실사 드라마',  en: 'Live-action Drama' },
  'format.whiteboard_explanation': { ko: '판서 강의',    en: 'Whiteboard' },
  'format.text_with_audio':        { ko: '텍스트+음성',  en: 'Text + Audio' },
  'format.handwriting_practice':   { ko: '쓰기 연습',    en: 'Handwriting' },
  'format.downloadable_pdf':       { ko: 'PDF 제공',     en: 'PDF Download' },
  'format.subtitles_dual':         { ko: '이중 자막',    en: 'Dual Subtitles' },

  // ── Instructor ───────────────────────────────────────────────────────────
  'instructor.native_speaker':  { ko: '원어민',         en: 'Native Speaker' },
  'instructor.foreign_learner': { ko: '외국인 학습자',  en: 'Foreign Learner' },
  'instructor.bilingual_tutor': { ko: '이중언어 튜터',  en: 'Bilingual Tutor' },
  'instructor.institutional':   { ko: '기관 제작',      en: 'Institutional' },
  'instructor.community_built': { ko: '커뮤니티 제작',  en: 'Community-built' },

  // ── Strength ─────────────────────────────────────────────────────────────
  'strength.grammar_explanation': { ko: '문법',        en: 'Grammar' },
  'strength.pronunciation':       { ko: '발음',        en: 'Pronunciation' },
  'strength.vocabulary_volume':   { ko: '어휘',        en: 'Vocabulary' },
  'strength.kpop_kdrama_context': { ko: 'K팝',         en: 'K-Pop' },
  'strength.exam_focused':        { ko: 'TOPIK 대비',  en: 'TOPIK Prep' },
  'strength.cultural_context':    { ko: '한국 문화',   en: 'Korean Culture' },
  'strength.real_life_phrases':   { ko: '실생활 표현', en: 'Real Phrases' },
  'strength.slang_trendy':        { ko: '신조어',      en: 'Slang & Trends' },
  'strength.formal_language':     { ko: '높임말',      en: 'Honorifics' },

  // ── Learner fit ──────────────────────────────────────────────────────────
  'fit.needs_structure': { ko: '체계 선호',     en: 'Needs Structure' },
  'fit.casual_learner':  { ko: '가벼운 학습',   en: 'Casual Learner' },
  'fit.kpop_fan':        { ko: 'K팝 팬',        en: 'K-Pop Fan' },
  'fit.career_focused':  { ko: '진학·취업',     en: 'Career Focus' },
  'fit.shy_speaker':     { ko: '말하기 부담',   en: 'Shy Speaker' },

  // ── Accessibility / UX ───────────────────────────────────────────────────
  'ux.offline_available':      { ko: '오프라인',   en: 'Offline' },
  'ux.gamification':           { ko: '게임형',     en: 'Gamification' },
  'ux.short_videos':           { ko: '숏폼',       en: 'Short Videos' },
  'ux.long_form_content':      { ko: '롱폼',       en: 'Long-form' },
  'ux.multilingual_interface': { ko: '다국어 UI',  en: 'Multilingual UI' },

  // ── Social ───────────────────────────────────────────────────────────────
  'social.live_class_option':     { ko: '실시간 수업',       en: 'Live Classes' },
  'social.community_forum':       { ko: '커뮤니티',          en: 'Community Forum' },
  'social.peer_interaction':      { ko: '학습자 교류',       en: 'Peer Interaction' },
  // 6자 원칙의 예외 — 유료 매칭이라는 의미가 훼손되지 않도록 8자를 허용한다.
  'social.companion_service_paid': { ko: '유료 학습 파트너', en: 'Companion (paid)' },

  // ── Learning pace ────────────────────────────────────────────────────────
  'pace.daily_short_session': { ko: '매일 5–15분', en: 'Daily 5–15 min' },
  'pace.deep_dive_session':   { ko: '30분 이상',   en: '30 min+ Dive' },
  'pace.flexible_pacing':     { ko: '자유 페이스', en: 'Flexible Pace' },

  // ── Content authority ────────────────────────────────────────────────────
  'authority.official_curriculum': { ko: '공식 커리큘럼', en: 'Official Curriculum' },
  'authority.expert_designed':     { ko: '전문가 설계',   en: 'Expert-designed' },
  'authority.research_backed':     { ko: '연구 기반',     en: 'Research-backed' },
} satisfies Record<string, Entry>;

/**
 * 앱 상세·운영자 화면에서 쓰는 서술형 라벨.
 * 칩보다 길게 풀어 쓴다 — 좁은 칩이 아니라 목록·배지에 놓이기 때문이다.
 */
export const TAG_LONG = {
  'strength.grammar_explanation': { ko: '문법 설명',            en: 'Grammar Explanation' },
  'strength.pronunciation':       { ko: '발음 연습',            en: 'Pronunciation Practice' },
  'strength.vocabulary_volume':   { ko: '어휘 확장',            en: 'Vocabulary Building' },
  'strength.cultural_context':    { ko: '한국 문화',            en: 'Korean Culture' },
  'strength.real_life_phrases':   { ko: '실생활 표현',          en: 'Real-life Phrases' },
  'strength.slang_trendy':        { ko: '신조어·유행어',        en: 'Slang & Trends' },
  'strength.formal_language':     { ko: '높임말·격식체',        en: 'Honorifics & Formal' },
  'strength.kpop_kdrama_context': { ko: 'K팝·K드라마',          en: 'K-Pop / K-Drama' },
  'strength.exam_focused':        { ko: 'TOPIK 대비',           en: 'TOPIK Prep' },
  'format.flashcard':             { ko: '플래시카드',           en: 'Flashcards' },
  'format.video_lecture':         { ko: '동영상 강의',          en: 'Video Lectures' },
  'format.native_speaker_clips':  { ko: '원어민 클립',          en: 'Native Speaker Clips' },
  'format.live_action_drama':     { ko: '실사 드라마',          en: 'Live-action Drama' },
  'format.whiteboard_explanation': { ko: '판서 강의',           en: 'Whiteboard Lessons' },
  'format.downloadable_pdf':      { ko: 'PDF 다운로드',         en: 'Downloadable PDF' },
  'format.subtitles_dual':        { ko: '이중 자막',            en: 'Dual Subtitles' },
  'fit.needs_structure':          { ko: '체계적인 학습 선호',   en: 'Needs Structure' },
  'fit.casual_learner':           { ko: '가벼운 학습',          en: 'Casual Learning' },
  'fit.kpop_fan':                 { ko: 'K팝·한국 문화 팬',     en: 'K-Pop / K-Culture Fans' },
  'fit.career_focused':           { ko: '진학·취업 목적',       en: 'Career / Exam Focus' },
  'fit.shy_speaker':              { ko: '말하기가 부담되는 학습자', en: 'Shy Speakers' },
  'ux.offline_available':         { ko: '오프라인 이용',        en: 'Offline Access' },
  'ux.gamification':              { ko: '게임형 학습',          en: 'Gamification' },
  'ux.short_videos':              { ko: '짧은 영상 (5–15분)',   en: 'Short Videos (5–15 min)' },
  'ux.multilingual_interface':    { ko: '다국어 인터페이스',    en: 'Multilingual UI' },
  'social.live_class_option':     { ko: '실시간 수업',          en: 'Live Classes' },
  'social.community_forum':       { ko: '학습 커뮤니티',        en: 'Learning Community' },
  // Limitations
  'limit.weak_in_speaking':             { ko: '말하기 연습 부족',       en: 'Weak in Speaking' },
  'limit.weak_in_writing':              { ko: '쓰기 연습 부족',         en: 'Weak in Writing' },
  'limit.weak_in_advanced':             { ko: '고급 콘텐츠 부족',       en: 'Lacks Advanced Content' },
  'limit.weak_in_grammar':              { ko: '문법 설명 부족',         en: 'Lacks Grammar Explanation' },
  'limit.weak_in_reading':              { ko: '읽기 연습 부족',         en: 'Weak in Reading' },
  'limit.no_human_feedback':            { ko: '사람 피드백 없음',       en: 'No Human Feedback' },
  'limit.voice_recognition_unreliable': { ko: '음성 인식 정확도 낮음',  en: 'Unreliable Voice Recognition' },
  'limit.requires_supplementary':       { ko: '보조 자료 병행 필요',    en: 'Best with Supplements' },
  'limit.no_certification':             { ko: '수료증 없음',            en: 'No Certificate' },
} satisfies Record<string, Entry>;

export type TagKey = keyof typeof TAG_CHIP;
export type TagLongKey = keyof typeof TAG_LONG;
