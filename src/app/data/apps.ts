import { supabase, type AppRow } from '../../lib/supabase';

export interface App {
  id: string;
  name: string;
  /** Legacy Korean display name — used for search and card display */
  nameKo: string;
  aliases: string[];
  learningField: string[];
  sensory: 'visual' | 'auditory' | 'mixed';
  style: 'exploratory' | 'structured';
  learnerTypeCode: string;
  levels: string[];
  purposes: string[];
  pricing: string[];
  teachingLanguage: string[];
  realtimeFeedback: string[];
  differentiators: string[];
  limitations: string[];
  platform: string[];
  url?: string;
  description: string;
  descriptionKo: string;
  /** Detail hero bullets — only available for apps originally in the static dataset */
  detailPoints?: string[];
  detailPointsKo?: string[];
  image?: string;
  logoSrc?: string;
}

const LEVEL_ORDER = ['beginner', 'elementary', 'intermediate', 'advanced'] as const;

const LEVEL_DISPLAY_LABEL: Record<(typeof LEVEL_ORDER)[number], string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export function getAppLevelDisplayTags(app: App): string[] {
  const normalized = LEVEL_ORDER.filter((level) => app.levels.includes(level));
  if (normalized.length === LEVEL_ORDER.length) {
    return ['All levels'];
  }
  return normalized.map((l) => LEVEL_DISPLAY_LABEL[l]);
}

/** Map a Supabase AppRow to the frontend App interface */
export function rowToApp(row: AppRow): App {
  return {
    id: row.id,
    name: row.name,
    nameKo: row.description_ko ?? row.name,
    aliases: row.aliases,
    learningField: row.learning_field,
    sensory: (row.sensory ?? 'mixed') as App['sensory'],
    style: (row.style ?? 'exploratory') as App['style'],
    learnerTypeCode: row.learner_type_code ?? '',
    levels: row.level,
    purposes: row.purpose,
    pricing: row.pricing,
    teachingLanguage: row.teaching_language,
    realtimeFeedback: row.realtime_feedback,
    differentiators: row.differentiators,
    limitations: row.limitations,
    platform: row.platform,
    url: row.url ?? undefined,
    description: row.description ?? row.name,
    descriptionKo: row.description_ko ?? row.name,
    logoSrc: row.logo_src ?? undefined,
  };
}

/** Fetch all apps from Supabase, ordered by name */
export async function fetchApps(): Promise<App[]> {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('name');

  if (error) throw error;
  return (data as AppRow[]).map(rowToApp);
}

/** Fetch a single app by id */
export async function fetchAppById(id: string): Promise<App | null> {
  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return rowToApp(data as AppRow);
}

// ── Static detail content for original 8 apps ───────────────────────────────
// These detail bullets are not stored in the DB; they live here for the detail page.

const staticDetailContent: Record<string, { detailPoints: string[]; detailPointsKo: string[]; image: string }> = {
  duolingo: {
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
  },
  'ttmik-website': {
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
  },
  anki: {
    detailPoints: [
      'Build or import Korean decks: vocabulary, sample sentences, grammar prompts, TOPIK lists.',
      'Spaced repetition schedules each card when you are about to forget it.',
      'Daily review queue turns large word banks and patterns into a steady habit.',
    ],
    detailPointsKo: [
      '한국어 단어·예문·문법·TOPIK 단어 등을 카드로 만들거나 덱을 가져와 씁니다.',
      '간격 반복으로 "다시 볼 시점"을 자동으로 잡아 줍니다.',
      '매일 복습 큐로 어휘·패턴을 꾸준히 쌓기 좋습니다.',
    ],
    image: 'anki',
  },
  lingodeer: {
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
  },
  teuida: {
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
  },
  'king-sejong': {
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
  },
  memrise: {
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
  },
  drops: {
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
  },
};

/** Merge static detail content into an App returned from Supabase */
export function enrichAppWithStaticContent(app: App): App {
  const extra = staticDetailContent[app.id];
  if (!extra) return app;
  return { ...app, ...extra };
}
