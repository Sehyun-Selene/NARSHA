export interface App {
  id: string;
  name: string;
  nameKo: string;
  sensory: ('visual' | 'auditory' | 'mixed')[];
  style: 'exploratory' | 'structured';
  levels: ('beginner' | 'elementary' | 'intermediate' | 'advanced')[];
  purposes: ('entertainment' | 'business' | 'academic' | 'topik')[];
  url: string;
  /** Short blurb for list cards and search. */
  description: string;
  descriptionKo: string;
  /** Short bullets for app detail hero — Korean learning only, scannable. */
  detailPoints: string[];
  detailPointsKo: string[];
  image: string;
  /** Public URL under `/public` (e.g. `/app-logos/duolingo.png`). */
  logoSrc?: string;
}

const LEVEL_ORDER = ['beginner', 'elementary', 'intermediate', 'advanced'] as const;

const LEVEL_DISPLAY_LABEL: Record<(typeof LEVEL_ORDER)[number], string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Card + detail header — derived only from `app.levels` so both screens stay in sync. */
export function getAppLevelDisplayTags(app: App): string[] {
  const normalized = LEVEL_ORDER.filter((level) => app.levels.includes(level));
  if (normalized.length === LEVEL_ORDER.length) {
    return ['All levels'];
  }
  return normalized.map((l) => LEVEL_DISPLAY_LABEL[l]);
}

export const apps: App[] = [
  {
    id: 'duolingo',
    name: 'Duolingo',
    nameKo: '듀오링고',
    sensory: ['visual'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://www.duolingo.com/course/ko/en/Learn-Korean',
    description: 'Bite-sized gamified lessons for Korean on web and mobile.',
    descriptionKo: '웹·모바일에서 한국어를 짧은 게임형 레슨으로 배울 수 있는 앱입니다.',
    detailPoints: [
      'Path of short Korean lessons mixing Hangul, vocabulary, and sentence patterns.',
      'Tap, listen, type, and light speaking drills with streaks for daily rhythm.',
      'Recycles material so words and basic patterns stick from zero to early elementary.',
    ],
    detailPointsKo: [
      '한글·어휘·문장 패턴을 짧은 레슨 경로로 섞어서 연습합니다.',
      '탭·듣기·타이핑·가벼운 말하기와 연속 학습일로 매일 리듬을 잡습니다.',
      '반복 노출로 초급~초중급까지 단어와 기본 패턴을 익히기 좋습니다.',
    ],
    image: 'duolingo',
    logoSrc: '/app-logos/duolingo.png',
  },
  {
    id: 'ttmik',
    name: 'TTMIK',
    nameKo: 'TTMIK',
    sensory: ['auditory'],
    style: 'exploratory',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['entertainment', 'business'],
    url: 'https://talktomeinkorean.com',
    description: 'Audio-first Korean lessons from a long-running education brand.',
    descriptionKo: '오랜 역사의 브랜드가 제공하는 듣기 중심 한국어 레슨입니다.',
    detailPoints: [
      'Level-based audio/video lessons with hosts unpacking grammar and real dialogues.',
      'PDF notes and workbooks match the episode order for review and writing.',
      'Trains listening and spoken patterns for everyday Korean, step by step from basics.',
    ],
    detailPointsKo: [
      '레벨별 오디오·영상으로 문법과 실제 대화를 풀어 줍니다.',
      '에피소드 순서에 맞춘 PDF·워크북으로 복습·쓰기를 이어 갈 수 있습니다.',
      '기초부터 일상 청해·말하기 패턴을 단계적으로 익히기에 맞습니다.',
    ],
    image: 'ttmik',
    logoSrc: '/app-logos/ttmik.png',
  },
  {
    id: 'anki',
    name: 'Anki',
    nameKo: 'Anki',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    purposes: ['academic', 'topik'],
    url: 'https://apps.ankiweb.net',
    description: 'Flashcard app that schedules reviews using spaced repetition.',
    descriptionKo: '간격 반복으로 복습 시점을 잡아 주는 플래시카드 앱입니다.',
    detailPoints: [
      'Build or import Korean decks: vocabulary, sample sentences, grammar prompts, TOPIK lists.',
      'Spaced repetition schedules each card when you are about to forget it.',
      'Daily review queue turns large word banks and patterns into a steady habit.',
    ],
    detailPointsKo: [
      '한국어 단어·예문·문법·TOPIK 단어 등을 카드로 만들거나 덱을 가져와 씁니다.',
      '간격 반복으로 “다시 볼 시점”을 자동으로 잡아 줍니다.',
      '매일 복습 큐로 어휘·패턴을 꾸준히 쌓기 좋습니다.',
    ],
    image: 'anki',
    logoSrc: '/app-logos/anki.png',
  },
  {
    id: 'lingodeer',
    name: 'LingoDeer',
    nameKo: '링고디어',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['academic'],
    url: 'https://www.lingodeer.com/en/',
    description: 'Structured app courses with clear grammar for Korean and other Asian languages.',
    descriptionKo: '한국어 등 아시아 언어용으로 문법 설명이 잘 정리된 구조형 앱 코스입니다.',
    detailPoints: [
      'Korean units explain particles, honorifics, and word order, then drill with exercises.',
      'Listening, multiple choice, and Hangul typing appear in each level.',
      'Clear grammar notes and a visible path from beginner through intermediate.',
    ],
    detailPointsKo: [
      '단원마다 조사·높임법·어순을 설명한 뒤 문제로 익힙니다.',
      '듣기·선택·한글 타이핑이 레벨마다 섞여 있습니다.',
      '문법 노트와 경로가 분명해 초급~중급까지 따라가기 쉽습니다.',
    ],
    image: 'lingodeer',
    logoSrc: '/app-logos/lingodeer.png',
  },
  {
    id: 'teuida',
    name: 'Teuida',
    nameKo: 'Teuida',
    sensory: ['visual', 'auditory'],
    style: 'exploratory',
    levels: ['elementary', 'intermediate'],
    purposes: ['business', 'entertainment'],
    url: 'https://www.teuida.net/en',
    description: 'First-person video scenarios to practice listening and speaking aloud.',
    descriptionKo: '1인칭 영상 시나리오로 듣기·말하기를 연습하는 앱입니다.',
    detailPoints: [
      'First-person Korean scenes (cafés, shops, chats); you speak your line when cued.',
      'Pronunciation feedback right after each spoken response.',
      'Builds quick listening reactions and spoken confidence for routine situations.',
    ],
    detailPointsKo: [
      '카페·가게 등 1인칭 한국어 상황에서 지시에 맞춰 말합니다.',
      '말한 직후 발음 피드백을 받습니다.',
      '일상 청해·즉답 말하기에 초점을 둡니다.',
    ],
    image: 'teuida',
    logoSrc: '/app-logos/teuida.png',
  },
  {
    id: 'king-sejong',
    name: 'King Sejong Institute',
    nameKo: '세종학당',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['academic', 'topik'],
    url: 'https://www.ksif.or.kr/index.do?lang=eng',
    description: 'Official Korean language and culture programs run under government oversight.',
    descriptionKo: '정부 산하 기관이 운영하는 공식 한국어·한국문화 교육 프로그램입니다.',
    detailPoints: [
      'Official Korean courses online and at institutes: levels, textbooks, and culture modules.',
      'Curriculum follows standardized Korean-for-foreign-learners frameworks.',
      'Structured path from basics toward intermediate with clear milestones.',
    ],
    detailPointsKo: [
      '온라인·센터에서 단계·교재·문화 모듈로 한국어를 배웁니다.',
      '외국인 대상 한국어 교육 기준에 맞춘 커리큘럼입니다.',
      '기초에서 중급 방향으로 목표가 분명한 구조입니다.',
    ],
    image: 'sejong',
    logoSrc: '/app-logos/sejong.png',
  },
  {
    id: 'memrise',
    name: 'Memrise',
    nameKo: 'Memrise',
    sensory: ['visual', 'auditory'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://www.memrise.com/courses/english/korean/',
    description: 'Vocabulary courses with short native-speaker videos and memory hooks.',
    descriptionKo: '원어민 짧은 영상과 암기 팁이 있는 어휘 중심 코스입니다.',
    detailPoints: [
      'Korean decks pair short native-speaker clips with Hangul and spaced repetition.',
      'Themes span travel, daily life, and wider vocabulary sets.',
      'Trains how Korean sounds at natural speed while locking in word recognition.',
    ],
    detailPointsKo: [
      '짧은 원어민 영상과 한글·간격 반복으로 어휘를 묶어 줍니다.',
      '여행·일상·넓은 단어 주제 코스가 있습니다.',
      '실제 속도의 발음·억양과 단어 인지를 함께 익힙니다.',
    ],
    image: 'memrise',
    logoSrc: '/app-logos/memrise.png',
  },
  {
    id: 'drops',
    name: 'Drops',
    nameKo: 'Drops',
    sensory: ['visual'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://languagedrops.com/en/',
    description: 'Five-minute, illustration-led vocabulary sessions with minimal reading.',
    descriptionKo: '5분 안에 그림·아이콘으로 어휘만 빠르게 다지는 앱입니다.',
    detailPoints: [
      'Five-minute Korean sessions: illustrated words with Hangul for food, travel, and daily topics.',
      'Swipe and match drills keep vocabulary practice fast and visual.',
      'Stacks recognition-heavy word knowledge for steady short daily study.',
    ],
    detailPointsKo: [
      '약 5분 세션으로 음식·여행·일상 등 그림·한글 어휘를 돌립니다.',
      '스와이프·매칭으로 빠르게 시각 어휘를 익힙니다.',
      '짧은 매일 학습으로 인지 위주 단어를 쌓기 좋습니다.',
    ],
    image: 'drops',
    logoSrc: '/app-logos/drops.png',
  }
];