export interface App {
  id: string;
  name: string;
  nameKo: string;
  sensory: ('visual' | 'auditory' | 'mixed')[];
  style: 'exploratory' | 'structured';
  levels: ('beginner' | 'elementary' | 'intermediate' | 'advanced')[];
  purposes: ('entertainment' | 'business' | 'academic' | 'topik')[];
  url: string;
  description: string;
  descriptionKo: string;
  image: string;
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
    description: 'Gamified learning paths focusing on vocabulary and basic sentence patterns.',
    descriptionKo: '어휘와 기본 문장 패턴에 중점을 둔 게임화된 학습 경로입니다.',
    image: 'duolingo'
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
    description: 'The gold standard for natural conversational Korean with structured lessons.',
    descriptionKo: '자연스러운 대화형 한국어 학습의 표준입니다.',
    image: 'ttmik'
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
    description: 'Spaced repetition system for high-efficiency vocabulary memorization.',
    descriptionKo: '고효율 어휘 암기를 위한 간격 반복 시스템입니다.',
    image: 'anki'
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
    description: 'Specifically designed for Asian languages with superior grammar explanations.',
    descriptionKo: '아시아 언어를 위해 특별히 설계된 우수한 문법 설명을 제공합니다.',
    image: 'lingodeer'
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
    description: 'Unique first-person perspective interactive speaking practice with real scenarios.',
    descriptionKo: '실제 시나리오를 활용한 독특한 1인칭 대화 연습입니다.',
    image: 'teuida'
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
    description: 'Official learning materials provided by the Korean government institute.',
    descriptionKo: '한국 정부 기관에서 제공하는 공식 학습 자료입니다.',
    image: 'sejong'
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
    description: 'Learn with natives using real-world video clips and mnemonic techniques.',
    descriptionKo: '실제 영상 클립과 암기 기법을 사용하여 원어민과 함께 배웁니다.',
    image: 'memrise'
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
    description: 'Highly visual and fast-paced vocabulary builder for short daily practice.',
    descriptionKo: '짧은 일일 연습을 위한 시각적이고 빠른 속도의 어휘 학습입니다.',
    image: 'drops'
  }
];