/**
 * 중앙 사전 — KO/EN 을 쌍으로 묶어 한쪽 언어만 추가하는 실수를 타입으로 막는다 (PRD R5.2).
 * 여러 줄 카피는 `Entry[]` 로 두고 컴포넌트에서 줄 단위로 렌더링한다 (R5.3).
 *
 * 강조 표기 — 값 안의 `**...**` 는 액센트 강조, `~~...~~` 는 취소선으로 렌더된다.
 * `i18n/rich.tsx` 가 처리하므로 문자열에 HTML 을 넣지 않는다.
 */
export type Entry = { ko: string; en: string };

export const DICT = {
  // ── 내비게이션 ────────────────────────────────────────────────────────────
  'nav.discover':      { ko: '서비스 찾기',      en: 'Discover' },
  'nav.desk':          { ko: '나의 한국어 책상', en: 'Korean Desks' },
  'nav.surveyLong':    { ko: '학습 유형 검사',   en: 'Want to know your Learning Type?' },
  'nav.survey':        { ko: '학습 유형 검사',   en: 'Learning Type Test' },
  'nav.menu':          { ko: '메뉴',             en: 'Menu' },
  'nav.openMenu':      { ko: '메뉴 열기',        en: 'Open menu' },
  'nav.closeMenu':     { ko: '메뉴 닫기',        en: 'Close menu' },
  'nav.toggleTheme':   { ko: '테마 전환',        en: 'Toggle theme' },
  'nav.langKo':        { ko: '한국어',           en: '한국어' },
  'nav.langEn':        { ko: 'English',          en: 'English' },

  // ── 푸터 ──────────────────────────────────────────────────────────────────
  'footer.tagline':     { ko: '© 2026 NARSHA. The Scholarly Architect.', en: '© 2026 NARSHA. The Scholarly Architect.' },
  'footer.about':       { ko: '소개',              en: 'About' },
  'footer.faq':         { ko: '자주 묻는 질문',    en: 'FAQ' },
  'footer.methodology': { ko: '방법론',            en: 'Methodology' },
  'footer.privacy':     { ko: '개인정보처리방침',  en: 'Privacy' },
  'footer.terms':       { ko: '이용약관',          en: 'Terms' },
  'footer.suggest':     { ko: '서비스 제안하기',   en: 'Suggest a Service' },

  // ── 서비스 제안 (플로팅 버튼 + 모달) ──────────────────────────────────────
  'suggest.bubble':          { ko: '없는 서비스가 있나요? 추천해주세요!', en: 'Missing a service? Suggest one!' },
  'suggest.tooltip':         { ko: '서비스 제안하기',                    en: 'Suggest a service' },
  'suggest.title':           { ko: '서비스 제안하기',                    en: 'Suggest a Service' },
  'suggest.subtitle':        { ko: '나르샤에 없는 좋은 학습 자원을 알고 계신가요?', en: "Know a great resource that's not on NARSHA?" },
  'suggest.nameLabel':       { ko: '서비스 이름',        en: 'Service Name' },
  'suggest.namePlaceholder': { ko: '예: Korean with Vinnie', en: 'e.g. Korean with Vinnie' },
  'suggest.urlLabel':        { ko: '웹사이트 주소',      en: 'Website URL' },
  'suggest.optional':        { ko: '(선택)',             en: '(optional)' },
  'suggest.whyLabel':        { ko: '추천하는 이유는 무엇인가요?', en: 'Why recommend it?' },
  'suggest.whyHint':         { ko: '최대 3개',           en: 'up to 3' },
  'suggest.selectedCount':   { ko: '개 선택됨',          en: 'selected' },
  'suggest.noneOfAbove':     { ko: '해당 없음',          en: 'None of the above' },
  'suggest.customPlaceholder': { ko: '추천 이유를 적어주세요...', en: "Tell us why you'd recommend it..." },
  'suggest.emailLabel':      { ko: '이메일',             en: 'Your Email' },
  'suggest.emailHint':       { ko: '(선택 — 등록되면 알려드립니다)', en: "(optional — we'll reply if we add it)" },
  'suggest.emailPlaceholder': { ko: 'you@example.com',   en: 'you@example.com' },
  'suggest.cancel':          { ko: '취소',               en: 'Cancel' },
  'suggest.submit':          { ko: '제안 보내기',        en: 'Submit Suggestion' },
  'suggest.submitting':      { ko: '보내는 중…',         en: 'Submitting…' },
  'suggest.errName':         { ko: '서비스 이름을 입력해주세요.', en: 'Please enter the service name.' },
  'suggest.errUrl':          { ko: '올바른 주소를 입력해주세요 (https:// 또는 www.)', en: 'Please enter a valid URL (https:// or www.)' },
  'suggest.errEmail':        { ko: '올바른 이메일 주소를 입력해주세요.', en: 'Please enter a valid email address.' },
  'suggest.maxTags':         { ko: '이유는 최대 3개까지 선택할 수 있습니다.', en: 'Up to 3 strengths can be selected.' },
  'suggest.duplicate':       { ko: '방금 제안한 서비스입니다. 5분 뒤에 다시 시도해주세요.', en: 'You just suggested this! Please wait 5 minutes before resubmitting.' },
  'suggest.success':         { ko: '제안 감사합니다! 곧 검토하겠습니다.', en: "Thanks for the suggestion! We'll review it soon." },
  'suggest.fail':            { ko: '전송에 실패했습니다. 다시 시도해주세요.', en: 'Failed to submit. Please try again.' },

  // ── 메인 히어로 (PRD §3) ──────────────────────────────────────────────────
  // 줄바꿈 위치를 디자인이 정한다 — KO 3행, EN 4행.
  // 언어마다 행 수가 달라 빈 문자열로 자리를 비우고, 렌더링 시 걸러낸다 (R3.1).
  'home.hero.title': [
    { ko: '당신에게 필요한',     en: 'Find' },
    { ko: '한국어 학습 서비스를', en: 'the Korean' },
    { ko: '찾아보세요',          en: 'learning service' },
    { ko: '',                    en: 'you need' },
  ],
  // 2행은 정보량 없는 슬로건이라 걷어내고, 그 자리를 안내 페이지 진입점으로 쓴다
  // (GNB PRD REQ-B). 1행만 남긴다.
  'home.hero.sub': [
    { ko: '“학습 유형 검사부터 학습 서비스 검색까지”', en: '“From learning-type test to the right service”' },
  ],
  'home.hero.linkAbout':  { ko: 'NARSHA는 어떤 팀인가요 →', en: 'Who we are →' },
  'home.hero.linkMethod': { ko: '학습유형은 어떻게 만들었나요 →', en: 'How we built the test →' },

  // ── 메인 검색창 회전 플레이스홀더 ─────────────────────────────────────────
  'home.placeholders': [
    { ko: '예: TOPIK 중급...',        en: 'e.g. TOPIK Intermediate...' },
    { ko: '예: 발음 연습...',         en: 'e.g. Pronunciation Practice...' },
    { ko: '예: 무료 K팝 앱...',       en: 'e.g. Free K-Pop Apps...' },
    { ko: '예: 듀오링고...',          en: 'e.g. Duolingo...' },
    { ko: '예: 초급 듣기...',         en: 'e.g. Listening for Beginners...' },
    { ko: '예: 영어로 배우는 문법...', en: 'e.g. Grammar in English...' },
    { ko: '예: 유튜브 채널...',       en: 'e.g. YouTube Channels...' },
    { ko: '예: 1:1 튜터링...',        en: 'e.g. 1-on-1 Tutoring...' },
  ],

  // ── 메인 필터 축·그룹 헤딩 ────────────────────────────────────────────────
  'home.axis.level':      { ko: '수준',      en: 'Level' },
  'home.axis.purpose':    { ko: '목적',      en: 'Purpose' },
  'home.axis.type':       { ko: '유형',      en: 'Type' },
  'home.axis.strengths':  { ko: '강점',      en: 'Strengths' },

  'home.adv.open':        { ko: '상세 필터',                 en: 'Advanced Filters' },
  'home.adv.hint':        { ko: '(가격, 플랫폼, 언어…)',      en: '(price, platform, language…)' },
  'home.adv.title':       { ko: '상세 필터',                 en: 'Advanced Filters' },
  'home.adv.learnerType': { ko: '학습 유형',                 en: 'Learner Type' },
  'home.adv.takeTest':    { ko: '검사하러 가기 →',           en: 'Take the test →' },
  'home.adv.price':       { ko: '가격',                      en: 'Price' },
  'home.adv.platform':    { ko: '플랫폼',                    en: 'Platform' },
  'home.adv.teachingLang':{ ko: '수업 언어',                 en: 'Teaching Language' },
  'home.adv.feedback':    { ko: '실시간 피드백',             en: 'Realtime Feedback' },
  'home.adv.mechanism':   { ko: '학습 방식',                 en: 'Learning Mechanism' },
  'home.adv.format':      { ko: '콘텐츠 형식',               en: 'Content Format' },
  'home.adv.instructor':  { ko: '강사',                      en: 'Instructor' },
  'home.adv.strengthArea':{ ko: '강점 영역',                 en: 'Strength Areas' },
  'home.adv.fit':         { ko: '학습자 성향',               en: 'Learner Fit' },
  'home.adv.ux':          { ko: '접근성·사용성',             en: 'Accessibility & UX' },
  'home.adv.social':      { ko: '커뮤니티 기능',             en: 'Social Features' },
  'home.adv.pace':        { ko: '학습 호흡',                 en: 'Learning Pace' },
  'home.adv.authority':   { ko: '콘텐츠 신뢰도',             en: 'Content Authority' },
  'home.adv.reset':       { ko: '초기화',                    en: 'Reset' },
  'home.adv.viewResults': { ko: '결과 보기',                 en: 'View results' },

  // ── 메인 상태·에러·CTA ────────────────────────────────────────────────────
  'home.results':          { ko: '결과',        en: 'Results' },
  'home.clearAll':         { ko: '전체 해제',   en: 'Clear all' },
  'home.errorTitle':       { ko: '서비스를 불러오지 못했습니다', en: "Couldn't load services" },
  'home.errorBody':        { ko: '네트워크 또는 서버 문제가 발생했습니다. 다시 시도해주세요.', en: 'A network or server issue occurred. Please try again.' },
  'home.retry':            { ko: '다시 시도',   en: 'Retry' },
  'home.emptyTitle':       { ko: '검색 결과가 없습니다', en: 'No results found' },
  'home.emptyBody':        { ko: '찾으시는 서비스가 나르샤에 없나요?', en: "Can't find the service you're looking for on NARSHA?" },
  'home.emptySuggest':     { ko: '서비스 제안하기 →', en: 'Suggest a Service →' },
  'home.emptyFaq':         { ko: '자주 묻는 질문 보기 →', en: 'Read the FAQ →' },
  'home.searchLabel':      { ko: '한국어 학습 서비스 검색', en: 'Search Korean learning services' },

  // ── 앱 카드 태그 ──────────────────────────────────────────────────────────
  'card.sensory.visual':      { ko: '시각',   en: 'Visual' },
  'card.sensory.auditory':    { ko: '청각',   en: 'Auditory' },
  'card.sensory.mixed':       { ko: '복합',   en: 'Mixed' },
  'card.style.exploratory':   { ko: '탐색형', en: 'Exploratory' },
  'card.style.structured':    { ko: '구조형', en: 'Structured' },
  'card.reviewCount.one':     { ko: '후기 1개', en: '1 review' },
  'card.reviewCount.other':   { ko: '후기 {n}개', en: '{n} reviews' },

  // ── 404 ───────────────────────────────────────────────────────────────────
  'notfound.title': { ko: '페이지를 찾을 수 없습니다', en: 'Page Not Found' },
  'notfound.body':  { ko: '요청하신 페이지가 존재하지 않거나 이동되었습니다.', en: "The page you're looking for doesn't exist or has been moved." },
  'notfound.back':  { ko: '홈으로 돌아가기', en: 'Back to Home' },

  // ── 문서 타이틀 (PRD §6.4) ────────────────────────────────────────────────
  'title.about':       { ko: '소개',                 en: 'About' },
  'title.faq':         { ko: '자주 묻는 질문',       en: 'FAQ' },
  'title.survey':      { ko: '학습 유형 검사',       en: 'Learning Type Test' },
  'title.desk':        { ko: '나의 한국어 책상',     en: 'Korean Desks' },
  'title.methodology': { ko: '방법론',               en: 'Methodology' },
  'title.privacy':     { ko: '개인정보처리방침',     en: 'Privacy Policy' },
  'title.terms':       { ko: '이용약관',             en: 'Terms of Service' },
  'title.notfound':    { ko: '페이지를 찾을 수 없습니다', en: 'Page Not Found' },

  // ══ About 페이지 (PRD §4.3) ═══════════════════════════════════════════════

  // 0 · Hero
  'about.hero.eyebrow': { ko: 'ABOUT NARSHA', en: 'ABOUT NARSHA' },
  'about.hero.head':    { ko: '한국어 학습에 날개를 달다.', en: 'Wings for Your Korean Learning Journey.' },
  'about.hero.lead':    {
    ko: '나르샤는 전 세계에 흩어진 한국어 학습 자원을 한곳에 모아, 학습자가 자신에게 맞는 길을 찾도록 돕는 플랫폼입니다.',
    en: "NARSHA brings the world's scattered Korean learning resources into one place, so every learner can find the path that fits them.",
  },

  // 1 · Mission
  'about.mission.eyebrow': { ko: '01 · MISSION', en: '01 · MISSION' },
  'about.mission.head':    { ko: '~~흩어진 자원을~~ **하나의 지도로.**', en: '~~Scattered resources~~ **into one map.**' },
  'about.mission.lead':    { ko: '우리는 한국어 학습자가 더 이상 헤매지 않도록 돕습니다.', en: 'We help Korean learners stop wandering.' },
  'about.mission.body': [
    { ko: '한국어 학습 시장은 이미 충분한 콘텐츠를 가지고 있습니다.', en: 'The Korean learning market already has enough content.' },
    { ko: '부족한 것은 콘텐츠가 아니라, 학습자가 그 속에서 길을 찾을 방법입니다.', en: "What's missing isn't content — it's a way for learners to find their path through it." },
    { ko: '나르샤는 파편화된 한국어 학습 시장을 연결하는 단 하나의 플랫폼이 되겠습니다.', en: 'NARSHA aims to be the single platform that connects a fragmented Korean learning market.' },
  ],

  // 2 · Problem
  'about.problem.eyebrow': { ko: '02 · PROBLEM', en: '02 · PROBLEM' },
  'about.problem.head': [
    { ko: '넘쳐나는 학습 자원이', en: 'Abundant resources,' },
    { ko: '제대로 이용되지 못합니다', en: 'underused by learners' },
  ],
  'about.problem.lead': {
    ko: '대부분 초급 단계에 머무는 온라인 한국어 학습자들. 그 이유는 무엇일까요?',
    en: 'Most online Korean learners stall at the beginner level. Why?',
  },
  'about.problem.c1.title': { ko: '정보 부족', en: 'Information Gap' },
  'about.problem.c1.body':  {
    ko: 'K-MOOC 한국어 강좌는 2021년 105개에서 2025년 478개로 폭증했지만, 자신의 수준과 목표에 맞는 자원을 선별해주는 가이드는 전무합니다.',
    en: 'K-MOOC Korean courses grew from 105 in 2021 to 478 in 2025 — yet there is no guide that helps learners select resources matching their level and goals.',
  },
  'about.problem.c2.title': { ko: '낮은 지속성', en: 'Low Retention' },
  'about.problem.c2.body':  {
    ko: '시행착오 기반 자원 탐색이 학습 피로와 중도 포기의 악순환을 만듭니다. 짜여진 커리큘럼은 개인 목표와 어긋나고, 학습 자율성이 낮아집니다.',
    en: 'Trial-and-error resource hunting breeds fatigue and drop-off. Fixed curricula drift from personal goals and erode learner autonomy.',
  },
  'about.problem.c3.title': { ko: '학습 관리 부재', en: 'No Learning Management' },
  'about.problem.c3.body':  {
    ko: '온라인 학습은 학습 관리가 철저히 이루어지지 못해, 학습자가 자원을 최대한으로 활용하지 못합니다.',
    en: 'Online learning rarely comes with real progress management, so learners never get full value from the resources they find.',
  },

  // 3 · Market Research
  'about.research.eyebrow': { ko: '03 · MARKET RESEARCH', en: '03 · MARKET RESEARCH' },
  'about.research.head':    { ko: '30개국 90명 학습자에게 직접 물었습니다', en: 'We asked 90 learners across 30 countries' },
  'about.research.lead':    { ko: '자체 설문조사로 검증된 시장의 목소리', en: 'Market signals verified by our own survey' },
  'about.research.m1':      { ko: '응답자',        en: 'Respondents' },
  'about.research.m2':      { ko: '참여 국가',     en: 'Countries' },
  'about.research.m3':      { ko: '앱 사용률',     en: 'Use learning apps' },
  'about.research.m4':      { ko: '복수 앱 병행률', en: 'Use multiple apps' },
  'about.research.m5':      { ko: '올인원 수요',   en: 'Want an all-in-one' },
  'about.research.keyLabel':{ ko: '핵심 발견',     en: 'Key finding' },
  'about.research.keyBody': {
    ko: '어떤 단일 앱도 학습자에게 충분하지 않으며, 사용자의 압도적 다수가 통합된 솔루션을 원하고 있습니다.',
    en: 'No single app is enough, and the overwhelming majority of learners want an integrated solution.',
  },

  // 4 · Vision
  'about.vision.eyebrow': { ko: '04 · VISION', en: '04 · VISION' },
  'about.vision.head': [
    { ko: '한국어 학습을 시작하는',              en: 'The **first stop** for everyone' },
    { ko: '모든 사람의 **첫 번째 목적지**가 되는 것.', en: 'who starts learning Korean.' },
  ],
  'about.vision.bigLabel': { ko: '전 세계 한국어 학습자가 가장 먼저 찾는 플랫폼', en: 'The platform every Korean learner turns to first' },
  'about.vision.body': [
    {
      ko: '학습자들이 “한국어를 배우고 싶다”고 생각했을 때 가장 먼저 떠오르는 이름. 흩어져 있던 학습 자원·후기·커리큘럼·피드백이 하나의 생태계로 연결된 공간.',
      en: 'The name that comes to mind the moment someone thinks, “I want to learn Korean” — a space where scattered resources, reviews, curricula, and feedback connect into one ecosystem.',
    },
    {
      ko: '우리는 한국어 교육 시장의 기본 인프라가 되는 것을 목표합니다.',
      en: 'Our goal is to become the foundational infrastructure of Korean language education.',
    },
  ],
  'about.vision.big':   { ko: '4,000만', en: '40M' },
  'about.vision.s1.value': { ko: '4,000만', en: '40M' },
  'about.vision.s1':    { ko: '전 세계 한국어 학습자', en: 'Korean learners worldwide' },
  'about.vision.s2.value': { ko: '43만', en: '430K' },
  'about.vision.s2':    { ko: 'TOPIK 응시자 (2024) · 4년간 2배 증가', en: 'TOPIK test-takers (2024) · 2× in 4 years' },
  'about.vision.s3.value': { ko: '72%', en: '72%' },
  'about.vision.s3':    { ko: '디지털 도구 사용', en: 'Use digital learning tools' },

  // 5 · Values
  'about.values.eyebrow': { ko: '05 · VALUES', en: '05 · VALUES' },
  'about.values.head':    { ko: '우리가 일하는 네 가지 원칙', en: 'Four principles we work by' },
  'about.values.v1.title': { ko: '학습자 중심', en: 'Learner First' },
  'about.values.v1.body':  {
    ko: '모든 결정은 학습자에게 실제로 도움이 되는가를 기준으로 합니다. 플랫폼의 편의나 수익이 아닌, 학습자의 성장이 최우선입니다.',
    en: 'Every decision is measured by whether it genuinely helps learners. The growth of the learner — not platform convenience or revenue — comes first.',
  },
  'about.values.v2.title': { ko: '열린 큐레이션', en: 'Open Curation' },
  'about.values.v2.body':  {
    ko: '콘텐츠를 독점하지 않습니다. 외부 자원을 투명하게 연결하고, 학습자가 직접 선택할 수 있도록 돕습니다.',
    en: "We don't monopolize content. We transparently connect external resources and help learners make their own choices.",
  },
  'about.values.v3.title': { ko: '데이터로 증명', en: 'Evidence-Based' },
  'about.values.v3.body':  {
    ko: '직감이 아닌 실제 학습자의 목소리와 데이터로 제품을 만듭니다. 30개국 90명의 학습자 설문조사가 첫걸음입니다.',
    en: 'We build with real learner voices and data, not intuition. A survey of 90 learners from 30 countries was our first step.',
  },
  'about.values.v4.title': { ko: '사람과 기술의 균형', en: 'Human × AI' },
  'about.values.v4.body':  {
    ko: '기술은 효율을 제공하지만, 학습의 본질은 사람과 사람의 연결에 있습니다. 전문가의 큐레이션과 AI의 보조가 함께 작동합니다.',
    en: 'Technology provides efficiency, but the essence of learning lies in human connection. Expert curation and AI assistance work together.',
  },

  // 7 · CTA
  'about.cta.tagline':   { ko: '나에게 맞는 한국어 학습, 지금 시작하세요.', en: 'Start learning Korean, your way.' },
  'about.cta.primary':   { ko: '학습 유형 검사 시작하기 →', en: 'Take the Learning Type Test →' },
  'about.cta.secondary': { ko: '문의하기', en: 'Contact Us' },
  'about.cta.faq':       { ko: '궁금한 점이 있으신가요? 자주 묻는 질문 보기 →', en: 'Have a question? Read the FAQ →' },

  // ══ FAQ 페이지 (PRD §4.5) ═════════════════════════════════════════════════
  'faq.hero.eyebrow': { ko: 'FAQ', en: 'FAQ' },
  'faq.hero.head':    { ko: '자주 묻는 질문', en: 'Frequently Asked Questions' },
  'faq.hero.lead':    {
    ko: '나르샤를 쓰면서 가장 많이 나오는 질문들을 모았습니다.',
    en: 'The questions we hear most often about using NARSHA.',
  },

  'faq.cat.all':     { ko: '전체',           en: 'All' },
  'faq.cat.service': { ko: '서비스',         en: 'Service' },
  'faq.cat.survey':  { ko: '학습 유형 검사', en: 'Learning Type Test' },
  'faq.cat.listing': { ko: '서비스 등록',    en: 'Listing' },
  'faq.cat.review':  { ko: '후기',           en: 'Reviews' },

  'faq.q.what.q': { ko: '나르샤는 어떤 서비스인가요?', en: 'What is NARSHA?' },
  'faq.q.what.a': {
    ko: '나르샤는 전 세계에 흩어진 한국어 학습 앱·웹사이트·강의를 한곳에 모아, 학습자가 자신의 수준·목적·학습 성향에 맞는 서비스를 찾도록 돕는 플랫폼입니다. 검색·비교·후기·학습 유형 검사를 제공합니다.',
    en: 'NARSHA gathers Korean learning apps, websites, and courses from around the world in one place, so learners can find services that match their level, goals, and learning style. We provide search, comparison, reviews, and a learning-type test.',
  },
  'faq.q.pricing.q': { ko: '이용료가 있나요?', en: 'Is NARSHA free to use?' },
  'faq.q.pricing.a': {
    ko: '나르샤의 검색, 비교, 학습 유형 검사, 후기 열람은 모두 무료입니다. 다만 나르샤에서 소개하는 개별 학습 서비스의 이용료는 각 서비스 정책에 따릅니다.',
    en: "Search, comparison, the learning-type test, and reading reviews on NARSHA are all free. Fees for the individual learning services we list follow each service's own policy.",
  },
  'faq.q.teach.q': { ko: '나르샤가 직접 한국어를 가르치나요?', en: 'Does NARSHA teach Korean directly?' },
  'faq.q.teach.a': {
    ko: '아니요. 나르샤는 콘텐츠를 직접 제작하지 않습니다. 이미 존재하는 좋은 학습 자원을 투명하게 연결하고, 학습자가 직접 선택할 수 있도록 돕는 것이 저희의 역할입니다.',
    en: "No. NARSHA doesn't produce content. Our role is to transparently connect the good learning resources that already exist and help learners choose for themselves.",
  },
  'faq.q.testWhat.q': { ko: '학습 유형 검사는 무엇을 알려주나요?', en: 'What does the learning-type test tell me?' },
  'faq.q.testWhat.a': {
    ko: '10문항으로 감각 선호(시각·청각·복합)와 학습 방식(탐색형·구조형)을 파악해 6가지 유형 중 하나를 알려드립니다. 이 유형은 어떤 형태의 학습 자원이 나에게 잘 맞는지 판단하는 기준이 됩니다.',
    en: 'Ten questions identify your sensory preference (visual, auditory, or mixed) and your learning approach (exploratory or structured), then place you in one of six types. That type becomes a reference point for judging which kinds of learning resources suit you.',
  },
  'faq.q.testUse.q': { ko: '검사 결과는 어떻게 활용되나요?', en: 'How is my test result used?' },
  'faq.q.testUse.a': {
    ko: '검사를 마치면 메인 페이지에 ‘유형’ 필터가 열리고, 결과에 맞는 서비스를 우선적으로 확인할 수 있습니다. 결과는 브라우저에 저장되며 언제든 다시 검사할 수 있습니다.',
    en: 'Once you finish the test, a "Type" filter opens on the home page so you can check services matching your result first. The result is stored in your browser, and you can retake the test any time.',
  },
  'faq.q.criteria.q': { ko: '어떤 기준으로 서비스를 선정하나요?', en: 'How do you decide which services to list?' },
  'faq.q.criteria.a': {
    ko: '학습자 접근성, 콘텐츠의 명확한 학습 목표, 지속적인 운영 여부를 기준으로 검토합니다. 특정 서비스로부터 대가를 받고 노출 순위를 조정하지 않습니다.',
    en: "We look at learner accessibility, whether the content has clear learning goals, and whether the service is actively maintained. We don't take payment from any service in exchange for adjusting where it appears.",
  },
  'faq.q.listMine.q': { ko: '제 서비스를 등록하고 싶어요.', en: "I'd like to list my service." },
  'faq.q.listMine.a': {
    ko: '푸터 또는 화면 우측 하단의 ‘서비스 제안하기’ 버튼으로 알려주세요. 검토 후 등록해 드립니다.',
    en: 'Let us know through the "Suggest a Service" button in the footer or at the bottom right of the screen. We\'ll review it and add it.',
  },
  'faq.q.whoReview.q': { ko: '후기는 누가 쓸 수 있나요?', en: 'Who can write a review?' },
  'faq.q.whoReview.a': {
    ko: '해당 서비스를 실제로 사용해 본 학습자라면 누구나 작성할 수 있습니다. 후기는 작성자의 언어 그대로 표시되며, 나르샤가 내용을 임의로 수정하지 않습니다.',
    en: 'Anyone who has actually used the service can write one. Reviews appear in the language the writer used, and NARSHA does not edit their content.',
  },

  'faq.link.survey':  { ko: '학습 유형 검사 하러 가기 →', en: 'Take the learning-type test →' },
  'faq.link.suggest': { ko: '서비스 제안하기 →',          en: 'Suggest a service →' },
  'faq.link.reviews': { ko: '후기 둘러보기 →',            en: 'Browse reviews →' },

  'faq.cta.head':    { ko: '원하는 답을 찾지 못하셨나요?', en: "Didn't find what you were looking for?" },
  'faq.cta.contact': { ko: '문의하기', en: 'Contact Us' },

  // ── 학습 유형 검사 안내 (SurveyIntro) ────────────────────────────────────
  // 후기 작성 화면도 유형 미검사 시 이 화면을 렌더하므로 문자열을 공유한다.
  'survey.eyebrow':   { ko: '학습 유형 검사', en: 'Learning type assessment' },
  'survey.intro.title': { ko: '시작하기 전에', en: 'Before you start' },
  'survey.intro.lead': {
    ko: '나르샤는 후기에 작성자의 **학습 유형**을 함께 표시합니다. 나와 비슷한 방식으로 공부하는 사람의 후기를 찾을 수 있게 하기 위해서예요. 이 짧은 검사로 후기를 쓰거나 읽기 전에 내 유형을 정해 둡니다.',
    en: 'NARSHA tags reviews by **learner type** so readers can find voices that match how they study. This quick check sets your type before you write or browse reviews.',
  },
  'survey.intro.why.title': { ko: '왜 묻나요', en: 'Why we ask' },
  'survey.intro.why.body': {
    ko: '여섯 가지 유형이 있어요. 후기에 유형을 붙여 비슷한 학습자끼리 경험을 비교할 수 있게 합니다.',
    en: 'Six profiles; we label your reviews so similar learners can compare notes.',
  },
  'survey.intro.expect.title': { ko: '무엇을 하나요', en: 'What to expect' },
  // {n} 은 문항 수로 치환된다
  'survey.intro.expect.body': {
    ko: '짧은 문항 {n}개, 5점 동의 척도예요. 정답은 없습니다.',
    en: '{n} short items, five-point agree scale — no wrong answers.',
  },
  'survey.intro.time.title': { ko: '소요 시간', en: 'Time' },
  'survey.intro.time.body': {
    ko: '대부분 **2분 이내**에 끝냅니다.',
    en: 'Most finish in **under two minutes**.',
  },
  'survey.intro.start': { ko: '시작하기', en: 'START' },
  'survey.intro.back':  { ko: '홈으로 돌아가기', en: 'Back to home' },

  // ── 검사 문항 화면 (Survey) ──────────────────────────────────────────────
  'survey.q.title':    { ko: '학습 유형 검사', en: 'Learning Type Test' },
  'survey.q.phase':    { ko: '검사 진행 중', en: 'Assessment Phase' },
  // {i} 현재 문항 번호, {n} 전체 문항 수
  'survey.q.counter':  { ko: '{n}문항 중 {i}번', en: 'Question {i} of {n}' },
  'survey.q.percent':  { ko: '{p}% 완료', en: '{p}% Complete' },
  'survey.q.disagree': { ko: '전혀 아니다', en: 'Strongly Disagree' },
  'survey.q.agree':    { ko: '매우 그렇다', en: 'Strongly Agree' },
  'survey.q.backIntro': { ko: '안내로 돌아가기', en: 'Back to intro' },
  'survey.q.prev':     { ko: '이전', en: 'Previous' },
  'survey.q.next':     { ko: '다음', en: 'Continue' },
  'survey.q.done':     { ko: '완료', en: 'Complete' },

  // ── 검사 결과 (SurveyResult) ─────────────────────────────────────────────
  'survey.r.title':    { ko: '나의 학습 유형', en: 'Your Learner Type' },
  'survey.r.subtitle': { ko: '검사가 끝났어요', en: 'Assessment Complete' },
  'survey.r.detected': { ko: '판정된 학습 유형', en: 'Detected Learner Type' },
  // {t} 유형 코드(가~바), {name} 유형 이름
  'survey.r.typeLine': { ko: '{t}형 · {name}', en: 'Type {t}: {name}' },
  'survey.r.pattern':  { ko: '감각 선호', en: 'Learning Pattern' },
  'survey.r.style':    { ko: '접근 방식', en: 'Learning Style' },
  'survey.r.visual':   { ko: '시각', en: 'Visual' },
  'survey.r.auditory': { ko: '청각', en: 'Auditory' },
  'survey.r.mixed':    { ko: '복합 (시각 + 청각)', en: 'Mixed (Visual + Auditory)' },
  'survey.r.exploratory': { ko: '탐색형', en: 'Exploratory' },
  'survey.r.structured':  { ko: '구조형', en: 'Structured' },
  'survey.r.insight.title': { ko: '이 결과를 어떻게 쓰나요', en: 'How to use this result' },
  // 이름 뒤에 조사를 붙이지 않는다 — 받침 유무에 따라 '이/가'가 달라져 깨진다.
  'survey.r.insight.body': {
    ko: '메인 화면의 ‘유형’ 필터가 **{name}** 기준으로 설정됐어요. 나와 같은 유형의 학습자가 남긴 후기를 먼저 확인해 보세요. 결과는 브라우저에 저장되며 언제든 다시 검사할 수 있어요.',
    en: 'The “type” filter on the home screen is now set to **{name}**. Start with reviews left by learners of the same type. Your result is saved in this browser, and you can retake the test any time.',
  },
  'survey.r.writeReview': { ko: '후기 작성하기', en: 'Write Your Review' },
  'survey.r.explore':     { ko: '서비스 둘러보기', en: 'Explore Resources' },

  // ── 후기 작성 (ReviewWrite) ──────────────────────────────────────────────
  'review.redirecting': { ko: '앱 페이지로 이동 중…', en: 'Redirecting to app page…' },
  'review.badgeNote': {
    ko: '이 유형 배지가 후기 옆에 함께 표시됩니다. 같은 방식으로 공부하는 학습자가 후기를 찾는 데 도움이 돼요.',
    en: 'This type badge appears next to your review, helping learners who study the same way find it.',
  },
  'review.nickname':    { ko: '닉네임', en: 'Nickname' },
  'review.nicknamePh':  { ko: '표시할 이름을 입력하세요', en: 'Enter your display name' },
  'review.context':     { ko: '학습 상황', en: 'Learning Context' },
  'review.level':       { ko: '학습 수준', en: 'Learning Level' },
  'review.level.beginner':     { ko: '입문 (TOPIK I)', en: 'Beginner (TOPIK I)' },
  'review.level.elementary':   { ko: '초급 (TOPIK II)', en: 'Elementary (TOPIK II)' },
  'review.level.intermediate': { ko: '중급 (TOPIK III–IV)', en: 'Intermediate (TOPIK III-IV)' },
  'review.level.advanced':     { ko: '고급 (TOPIK V–VI)', en: 'Advanced (TOPIK V-VI)' },
  'review.usage':       { ko: '사용 기간', en: 'Usage Period' },
  'review.usage.lt1w':     { ko: '1주 미만', en: 'Less than 1 week' },
  'review.usage.1w-lt1m':  { ko: '1주~1개월 미만', en: '1 week to less than 1 month' },
  'review.usage.1m-lt3m':  { ko: '1~3개월 미만', en: '1 month to less than 3 months' },
  'review.usage.3m-lt6m':  { ko: '3~6개월 미만', en: '3 months to less than 6 months' },
  'review.usage.6m-lt1y':  { ko: '6개월~1년 미만', en: '6 months to less than 1 year' },
  'review.usage.1y+':      { ko: '1년 이상', en: '1 year or more' },
  'review.purpose':     { ko: '학습 목적', en: 'Learning Purpose' },
  'review.purpose.entertainment': { ko: '취미·콘텐츠', en: 'Entertainment' },
  'review.purpose.business':      { ko: '비즈니스', en: 'Business Proficiency' },
  'review.purpose.academic':      { ko: '학업·연구', en: 'Academic Research' },
  'review.purpose.topik':         { ko: 'TOPIK 대비', en: 'TOPIK Preparation' },
  'review.strengths.q':  { ko: '이 서비스의 강점은 무엇인가요?', en: "What are this service's strengths?" },
  'review.limits.q':     { ko: '아쉬운 점은 무엇인가요?', en: 'What could be improved?' },
  // {max} 최대 선택 수, {sel} 현재 선택 수(0이면 표시하지 않는다)
  'review.pickHint':     { ko: '(최대 {max}개{sel}, 선택)', en: '(up to {max}{sel}, optional)' },
  'review.pickHint.sel': { ko: ' · {n}개 선택', en: ' · {n} selected' },
  'review.tagGroup.learning': { ko: '학습에 좋은 점', en: 'Great for learning' },
  'review.tagGroup.format':   { ko: '콘텐츠 형식', en: 'Content format' },
  'review.tagGroup.fit':      { ko: '이런 학습자에게', en: 'Great for' },
  'review.tagGroup.nice':     { ko: '있으면 좋은 점', en: 'Nice to have' },
  'review.contentPh': {
    ko: '커리큘럼의 깊이, 문화적 맥락, 실제로 도움이 된 점을 적어 주세요…',
    en: "Describe the curriculum's depth, cultural nuances, and pedagogical effectiveness…",
  },
  'review.submit':      { ko: '후기 등록', en: 'Submit Review' },
  'review.submitting':  { ko: '등록 중…', en: 'Submitting…' },
  'review.err.nickname': { ko: '닉네임을 입력해 주세요.', en: 'Please enter a nickname.' },
  'review.err.rating':   { ko: '별점을 선택해 주세요.', en: 'Please select a star rating.' },
  'review.err.content':  { ko: '후기 내용을 입력해 주세요.', en: 'Please enter your review.' },
  'review.err.submit':   { ko: '등록에 실패했어요. 잠시 후 다시 시도해 주세요.', en: 'Failed to submit review. Please try again.' },
  'review.limitStrength': { ko: '강점은 최대 3개까지 선택할 수 있어요.', en: 'Up to 3 strengths can be selected.' },
  'review.limitLimit':    { ko: '아쉬운 점은 최대 2개까지 선택할 수 있어요.', en: 'Up to 2 limitations can be selected.' },

  'review.done':      { ko: '후기가 등록됐어요!', en: 'Review Submitted!' },
  'review.back':      { ko: '← {name}(으)로 돌아가기', en: '← Back to {name}' },
  'review.pageTitle': { ko: '내 경험을 나눠 주세요', en: 'Share Your Journey' },
  'review.pageLead': {
    ko: '내가 겪은 것을 적어 두면, 같은 길을 고민하는 학습자가 선택하기 쉬워집니다.',
    en: 'Help others navigate their Korean learning path with an editorial perspective.',
  },
  'review.step1': { ko: '작성자 정보', en: 'Identity Verification' },
  'review.step2': { ko: '학습 상황', en: 'Learning Context' },
  'review.step3': { ko: '후기 작성', en: 'The Critique' },
  'review.rating':  { ko: '별점', en: 'Your Rating' },
  'review.content': { ko: '후기 내용', en: 'Your Review' },

  // ── Discover 이중 보기 (GNB PRD REQ-A) ───────────────────────────────────
  'home.view.apps': { ko: '앱으로 보기', en: 'By app' },
  'home.view.type': { ko: '학습유형별로 보기', en: 'By learning type' },

  // 유형별 보기 — 기존 /reviews 화면을 Discover 안으로 옮긴 것
  'rbt.allTypes': { ko: '전체 유형', en: 'All Types' },
  'rbt.type':     { ko: '{t}형', en: 'Type {t}' },
  'rbt.empty':    { ko: '이 조건에 맞는 후기가 없어요.', en: 'No reviews found for this filter.' },
  'rbt.helpful':  { ko: '유용해요', en: 'Helpful' },
  'rbt.helpfulFailed': { ko: '반영에 실패했어요. 잠시 후 다시 시도해 주세요.', en: 'Could not record that. Please try again shortly.' },
  'rbt.level':    { ko: '수준: {v}', en: 'Level: {v}' },
  // 필터 계승 안내 (D11). {n} 조건을 만족하는 앱 수
  'rbt.filterNotice':  { ko: '현재 필터 조건에 해당하는 앱 {n}개의 후기만 보고 있어요', en: 'Showing reviews from {n} apps matching your filters' },
  'rbt.clearFilters':  { ko: '필터 해제', en: 'Clear filters' },
  'rbt.emptyFiltered': { ko: '조건에 맞는 후기가 없어요. 필터를 조정해 보세요.', en: 'No reviews match your filters. Try adjusting them.' },

  // ── 후기 정렬 (GNB PRD REQ-F / F-2) ──────────────────────────────────────
  // '유용해요순'은 helpful_count 가 서버에 실제로 쌓이는 F-1 이후에 추가한다 —
  // 지금 넣으면 값이 항상 0 이라 아무 일도 하지 않는 선택지가 된다.
  'sort.label':     { ko: '정렬', en: 'Sort' },
  'sort.recent':    { ko: '최신순', en: 'Latest' },
  'sort.helpful':   { ko: '유용해요순', en: 'Most helpful' },
  'sort.ratingHigh': { ko: '평점 높은순', en: 'Highest rated' },
  'sort.ratingLow':  { ko: '평점 낮은순', en: 'Lowest rated' },

  // ── 일반회원 로그인·가입 (GNB PRD REQ-C / C-3) ───────────────────────────
  'member.login':          { ko: '로그인', en: 'Log in' },
  'member.logout':         { ko: '로그아웃', en: 'Log out' },
  'member.signup':         { ko: '가입하기', en: 'Sign up' },
  'member.loginTitle':     { ko: '로그인', en: 'Log in' },
  'member.signupTitle':    { ko: '회원 가입', en: 'Create an account' },
  'member.google':         { ko: 'Google로 계속하기', en: 'Continue with Google' },
  'member.or':             { ko: '또는', en: 'or' },
  'member.email':          { ko: '이메일', en: 'Email' },
  'member.password':       { ko: '비밀번호', en: 'Password' },
  'member.passwordHint':   { ko: '8자 이상', en: 'At least 8 characters' },
  'member.displayName':    { ko: '표시할 이름', en: 'Display name' },
  'member.displayNameHint': { ko: '후기에 이 이름이 표시돼요.', en: 'This name appears on your reviews.' },
  // 링크 두 개를 문장 사이에 끼워 넣어야 해서 앞·중간·뒤 세 조각으로 나눈다.
  // 문자열에 HTML 을 넣지 않는 규칙(§4)을 지키면서 링크를 살리기 위한 분할이다.
  'member.consentPre':  { ko: '', en: 'I agree to the ' },
  'member.consentMid':  { ko: '과 ', en: ' and ' },
  'member.consentPost': { ko: '에 동의합니다.', en: '.' },
  'member.toSignup':       { ko: '계정이 없으신가요? 가입하기', en: "Don't have an account? Sign up" },
  'member.toLogin':        { ko: '이미 계정이 있으신가요? 로그인', en: 'Already have an account? Log in' },
  'member.forgot':         { ko: '비밀번호를 잊으셨나요?', en: 'Forgot your password?' },
  'member.resetSent':      { ko: '비밀번호 재설정 메일을 보냈어요.', en: 'Password reset email sent.' },
  'member.welcome':        { ko: '로그인했어요.', en: 'You are logged in.' },
  'member.signedUp':       { ko: '가입이 완료됐어요.', en: 'Your account is ready.' },
  'member.confirmEmail':   { ko: '메일로 보낸 확인 링크를 눌러 주세요.', en: 'Please click the confirmation link we emailed you.' },
  'member.myReviews':      { ko: '내 후기', en: 'My reviews' },

  // 오류 문구 — 서버·SDK 가 주는 코드값을 사람이 읽을 문장으로 바꾼다
  'member.err.EMAIL_INVALID':            { ko: '이메일 주소를 확인해 주세요.', en: 'Please check your email address.' },
  'member.err.PASSWORD_TOO_SHORT':       { ko: '비밀번호는 8자 이상이어야 해요.', en: 'Password must be at least 8 characters.' },
  'member.err.DISPLAY_NAME_REQUIRED':    { ko: '표시할 이름을 입력해 주세요.', en: 'Please enter a display name.' },
  'member.err.EMAIL_ALREADY_REGISTERED': { ko: '이미 가입된 이메일이에요. 로그인해 주세요.', en: 'This email is already registered. Please log in.' },
  'member.err.INVALID_CREDENTIALS':      { ko: '이메일 또는 비밀번호가 맞지 않아요.', en: 'Email or password is incorrect.' },
  'member.err.EMAIL_NOT_CONFIRMED':      { ko: '메일로 보낸 확인 링크를 먼저 눌러 주세요.', en: 'Please confirm your email first.' },
  'member.err.CONSENT_REQUIRED':         { ko: '약관과 개인정보처리방침에 동의해 주세요.', en: 'Please agree to the Terms and Privacy Policy.' },
  'member.err.SIGNUP_FAILED':            { ko: '가입에 실패했어요. 잠시 후 다시 시도해 주세요.', en: 'Sign-up failed. Please try again.' },
  'member.err.SIGNIN_FAILED':            { ko: '로그인에 실패했어요. 잠시 후 다시 시도해 주세요.', en: 'Log-in failed. Please try again.' },
  'member.err.OAUTH_FAILED':             { ko: 'Google 로그인을 시작할 수 없었어요.', en: 'Could not start Google sign-in.' },
  'member.err.UNKNOWN':                  { ko: '문제가 생겼어요. 잠시 후 다시 시도해 주세요.', en: 'Something went wrong. Please try again.' },

  // ── 학습유형 계정 동기화 (GNB PRD REQ-G) ─────────────────────────────────
  // 유형이 조용히 바뀌면 사용자가 "왜 다른 유형이 뜨지" 하고 혼란스러워한다
  'ltype.pulled': { ko: '계정에 저장된 학습유형({t})을 적용했어요.', en: 'Applied the learner type saved to your account ({t}).' },
  'ltype.pushed': { ko: '학습유형({t})을 계정에 저장했어요.', en: 'Saved your learner type ({t}) to your account.' },

  // ── 열람 게이팅 (GNB PRD REQ-C / C-1) ────────────────────────────────────
  'gate.moreReviews':  { ko: '이 앱의 후기 {n}개가 더 있어요', en: '{n} more reviews for this app' },
  'gate.loginToRead':  { ko: '로그인하고 모두 보기', en: 'Log in to read all' },
  'gate.noAccount':    { ko: '계정이 없으신가요? 가입하기', en: "Don't have an account? Sign up" },
  'gate.typeBanner':   { ko: '로그인하면 후기 전문을 볼 수 있어요', en: 'Log in to read full reviews' },

  // ── 후기 작성자 신원 (GNB PRD REQ-C / C-2) ───────────────────────────────
  'write.identity':      { ko: '작성자', en: 'Posting as' },
  'write.asMember':      { ko: '로그인하고 작성', en: 'Post with my account' },
  'write.asAnon':        { ko: '닉네임으로 작성', en: 'Post with a nickname' },
  'write.memberBenefit': { ko: '내가 쓴 후기를 한곳에서 모아 보고, 수정·삭제할 수 있어요.', en: 'See all your reviews in one place, and edit or delete them.' },
  'write.loginFirst':    { ko: '로그인이 필요해요', en: 'Log in to continue' },

  // ── 내 후기 (GNB PRD REQ-C / C-4) ────────────────────────────────────────
  'my.title':        { ko: '내 후기', en: 'My reviews' },
  'my.empty':        { ko: '아직 작성한 후기가 없어요.', en: 'You have not written any reviews yet.' },
  'my.emptyHint':    { ko: '서비스를 찾아 첫 후기를 남겨 보세요.', en: 'Find a service and write your first review.' },
  'my.browse':       { ko: '서비스 찾아보기', en: 'Browse services' },
  'my.edit':         { ko: '수정', en: 'Edit' },
  'my.delete':       { ko: '삭제', en: 'Delete' },
  'my.save':         { ko: '저장', en: 'Save' },
  'my.cancel':       { ko: '취소', en: 'Cancel' },
  'my.deleteConfirm': { ko: '이 후기를 삭제할까요? 되돌릴 수 없어요.', en: 'Delete this review? This cannot be undone.' },
  'my.deleted':      { ko: '후기를 삭제했어요.', en: 'Review deleted.' },
  'my.saved':        { ko: '후기를 수정했어요.', en: 'Review updated.' },
  'my.loginNeeded':  { ko: '내 후기를 보려면 로그인해 주세요.', en: 'Please log in to see your reviews.' },
  'my.anonNote':     { ko: '닉네임으로 쓴 후기는 여기에 나오지 않아요. 작성자를 확인할 방법이 없기 때문이에요.', en: 'Reviews posted with a nickname do not appear here — there is no way to verify who wrote them.' },

  // ── 후기 신고 (GNB PRD REQ-E / E-3) ──────────────────────────────────────
  'report.open':          { ko: '신고하기', en: 'Report' },
  'report.menu':          { ko: '더보기', en: 'More' },
  'report.title':         { ko: '이 후기를 신고합니다', en: 'Report this review' },
  'report.lead':          { ko: '접수된 신고는 운영자가 직접 확인합니다. 신고만으로 후기가 바로 내려가지는 않습니다.', en: 'Reports are reviewed by our team. A report alone does not remove a review.' },
  'report.reasonLabel':   { ko: '사유', en: 'Reason' },
  'report.reason.spam':       { ko: '스팸·광고', en: 'Spam or advertising' },
  'report.reason.abuse':      { ko: '욕설·비방', en: 'Abusive language' },
  'report.reason.false_info': { ko: '허위 정보', en: 'False information' },
  'report.reason.privacy':    { ko: '개인정보 노출', en: 'Personal information exposed' },
  'report.reason.other':      { ko: '기타', en: 'Other' },
  'report.detailLabel':   { ko: '자세한 내용 (선택)', en: 'Details (optional)' },
  'report.detailPh':      { ko: '어떤 점이 문제인지 적어 주세요.', en: 'Tell us what the problem is.' },
  'report.submit':        { ko: '신고 접수', en: 'Submit report' },
  'report.cancel':        { ko: '취소', en: 'Cancel' },
  'report.done':          { ko: '신고가 접수됐습니다. 확인 후 처리하겠습니다.', en: 'Report received. We will review it.' },
  'report.already':       { ko: '이미 신고한 후기예요.', en: 'You already reported this review.' },
  'report.rateLimited':   { ko: '신고가 너무 잦습니다. 잠시 후 다시 시도해 주세요.', en: 'Too many reports. Please try again later.' },
  'report.failed':        { ko: '신고 접수에 실패했어요.', en: 'Could not submit the report.' },
  'report.reasonRequired': { ko: '사유를 선택해 주세요.', en: 'Please choose a reason.' },

  // ── 후기 입력 검증 (GNB PRD REQ-E / E-2) ─────────────────────────────────
  'review.err.nicknameLen': { ko: '닉네임은 2~20자로 입력해 주세요.', en: 'Nickname must be 2–20 characters.' },
  'review.err.contentMin':  { ko: '후기는 20자 이상 적어 주세요.', en: 'Please write at least 20 characters.' },
  'review.err.contentMax':  { ko: '후기는 2,000자까지 쓸 수 있어요.', en: 'Reviews can be up to 2,000 characters.' },
  'review.err.duplicate':   { ko: '이 서비스에 같은 내용의 후기가 이미 있어요.', en: 'A review with the same text already exists for this service.' },
  // 빈도 제한 (REQ-E / E-1). 몇 건까지인지 알려 줘야 사용자가 다시 시도할 시점을 안다
  'review.err.rateHour':    { ko: '후기는 한 시간에 3건까지 쓸 수 있어요. 잠시 후 다시 시도해 주세요.', en: 'You can post up to 3 reviews per hour. Please try again later.' },
  'review.err.rateSameApp': { ko: '같은 서비스에는 24시간에 한 번만 후기를 쓸 수 있어요.', en: 'You can review the same service once per 24 hours.' },
  'review.err.serverConfig': { ko: '후기 저장 기능이 아직 준비되지 않았어요. 운영자에게 알려 주세요.', en: 'Review submission is not configured yet. Please let us know.' },
  'review.err.alreadyReviewed': { ko: '이 서비스에는 이미 후기를 남겼어요. 「내 후기」에서 수정할 수 있어요.', en: 'You already reviewed this service. You can edit it in My reviews.' },
  // {n} 현재 글자 수, {max} 상한
  'review.counter': { ko: '{n} / {max}자', en: '{n} / {max}' },

  // ── 내 학습유형 필터 (GNB PRD REQ-F / F-3) ───────────────────────────────
  // {t} 유형 코드(가~바)
  'myType.only':      { ko: '나와 같은 유형({t}형)의 후기만 보기', en: 'Only reviews from my type ({t})' },
  'myType.showAll':   { ko: '전체 후기 보기', en: 'Show all reviews' },
  'myType.takeTest':  { ko: '학습 유형 검사하고 나와 맞는 후기 보기 →', en: 'Take the test to see reviews from learners like you →' },
  'myType.evalOnly':  { ko: '{t}형만', en: 'Type {t} only' },
  'myType.evalBasisType': { ko: '{t}형 후기 {n}건 기준', en: 'Based on {n} reviews from type {t}' },
  'myType.evalBasisAll':  { ko: '전체 후기 {n}건 기준', en: 'Based on {n} reviews' },
  'myType.evalLimits':    { ko: ' · 아쉬운 점 응답 {n}건', en: ' · {n} noted weak points' },
  'myType.learnerReviews': { ko: '학습자 평가', en: 'Learner Reviews' },

  // ── 앱 상세 (i18n PRD §7 Phase 2 잔여) ───────────────────────────────────
  'app.officialSite':  { ko: '공식 사이트', en: 'Official Website' },
  'app.ratingByType':  { ko: '학습유형별 평점', en: 'Rating by Learner Type' },
  'app.ratingByTypeSub': {
    ko: '유형에 따라 이 서비스를 어떻게 평가했는지 보여줍니다.',
    en: 'How different archetypes perceive this resource.',
  },
  'app.viewChart':     { ko: '분석 차트 보기', en: 'View Analysis Chart' },
  'app.curatedBy':     { ko: 'NARSHA 큐레이션', en: 'Curated by NARSHA' },
  'app.filterReviews': { ko: '후기 필터', en: 'Filter Reviews' },
  'app.writeReview':   { ko: '후기 쓰기', en: 'Write Review' },
  'app.allTypes':      { ko: '전체 유형', en: 'All Types' },
} satisfies Record<string, Entry | Entry[]>;

export type StringKey = keyof typeof DICT;
