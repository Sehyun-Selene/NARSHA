import type { App } from './apps';
import { TAG_CHIP, TAG_LONG } from '../i18n/tags';

/**
 * 검색어 → 앱 매칭.
 *
 * ## 구조
 *
 * 검색어는 **낱말 단위로 쪼개서 AND** 로 본다. 예전에는 입력 전체를 한 덩어리로
 * 비교했는데, 그러면 플레이스홀더로 광고하고 있는 예시가 전부 0건이 됐다 —
 * `발음 연습`, `초급 듣기`, `영어로 배우는 문법`, `유튜브 채널` 어느 것도
 * 단일 문자열로는 이름·태그와 일치하지 않는다.
 *
 * 뜻을 가진 낱말(`terms`)만 조건으로 세고, 뜻이 없는 낱말(`연습`, `배우는`,
 * `for`, `apps`)은 버린다. 조사(`영어로` → `영어`)와 복수형(`channels` →
 * `channel`)은 벗겨 본다. 뜻을 가진 낱말이 하나도 없으면 결과 0건이다 —
 * 아무 글자나 쳤을 때 전부 쏟아지지 않게 하기 위한 것이다 (§검색 노이즈).
 *
 * ## 사전
 *
 * 낱말→태그 사전은 `TAG_CHIP` / `TAG_LONG` 의 KO·EN 라벨에서 **자동으로** 만든다.
 * 태그를 추가하면 그 라벨로 바로 검색된다 — 사전을 따로 손볼 필요가 없다.
 * 라벨로 덮이지 않는 구어체·약칭만 `SYNONYMS` 에 손으로 적는다.
 */

/** 한국어 발음 표기 → 영문 서비스명 */
const PHONETIC_ALIASES: Record<string, string> = {
  '드롭스': 'drops',
  '멤라이즈': 'memrise',
  '퀴즐렛': 'quizlet',
  '프리플라이': 'preply',
  '프레플라이': 'preply',
  '코세라': 'coursera',
  '안키': 'anki',
  '케이크': 'cake',
  '헬로톡': 'hellotalk',
  '듀오': 'duolingo',
  '부수': 'busuu',
  '망고': 'mango',
  '아보카드': 'avocards',
  '링고디어': 'lingodeer',
  '핑고': 'pingo',
};

/** 낱말 → DB 태그 값 (한 낱말이 여러 태그를 가리키면 그 안에서는 OR) */
const KEYWORD_TO_TAGS: Record<string, string[]> = {};

function register(term: string, tags: string[]): void {
  const key = term.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!key) return;
  const bucket = KEYWORD_TO_TAGS[key] ?? (KEYWORD_TO_TAGS[key] = []);
  for (const tag of tags) if (!bucket.includes(tag)) bucket.push(tag);
}

// 1) 태그 라벨에서 자동 생성 — 태그를 추가하면 라벨로 바로 검색된다
for (const table of [TAG_CHIP, TAG_LONG] as Array<Record<string, { ko: string; en: string }>>) {
  for (const [value, entry] of Object.entries(table)) {
    register(entry.ko, [value]);
    register(entry.en, [value]);
  }
}

/**
 * 2) 라벨로 덮이지 않는 것만 손으로 적는다.
 *
 * · `learning_field` 값(vocabulary·listening…)은 `TAG_CHIP` 에 없다
 * · 구어체·약칭 (`토픽`, `공짜`, `과외`, `yt`)
 * · 감각/방식 값 (`visual`, `structured` …) — 칩 라벨이 `가 시각·탐색` 형태라
 *   낱말 하나로는 걸리지 않는다
 */
const SYNONYMS: Array<[string[], string[]]> = [
  // 학습 영역·감각·방식의 정식 라벨은 `TAG_CHIP` 에 있다. 여기엔 라벨과 다른 말만 둔다.
  [['단어', '보캐', 'vocab', 'words'], ['vocabulary', 'strength.vocabulary_volume']],
  [['리스닝'], ['listening']],
  [['스피킹', '회화', 'conversation'], ['speaking']],
  [['리딩'], ['reading']],
  [['작문'], ['writing']],
  // 어휘·문법은 학습 영역과 강점 태그 양쪽을 가리켜야 한다
  [['어휘'], ['vocabulary', 'strength.vocabulary_volume']],
  [['문법', 'grammar'], ['grammar', 'strength.grammar_explanation']],
  // `형` 없이 쓰는 말
  [['탐색'], ['exploratory']],
  [['구조'], ['structured', 'fit.needs_structure']],

  // 목적·시험
  [['토픽', 'topik'], ['topikPreparation', 'strength.exam_focused']],
  [['시험', '자격증', 'exam', 'test'], ['strength.exam_focused', 'topikPreparation']],
  [['취업', '직장', '업무', 'career', 'job', 'work'], ['businessProficiency', 'fit.career_focused']],
  [['대학', '유학', 'university'], ['academic']],

  // K콘텐츠
  [['케이팝', 'k팝', 'kpop', 'k-pop'], ['strength.kpop_kdrama_context', 'entertainment']],
  [['드라마', 'k드라마', 'kdrama', 'k-drama', 'drama'], ['strength.kpop_kdrama_context', 'entertainment']],

  // 플랫폼
  [['유튜브', '채널', 'youtube', 'yt', 'channel'], ['youtubeChannel']],
  [['웹사이트', '홈페이지', 'website'], ['Website']],
  [['아이폰', '애플', 'iphone', 'apple'], ['iOS']],
  [['안드로이드', '갤럭시', 'android'], ['Android']],

  // 가격
  [['공짜', '무료', 'free'], ['free', 'freemium']],
  [['월정액', '정기결제', 'subscription'], ['subscription-only']],
  [['평생', '단건', 'onetime', 'one-time'], ['one-time purchase']],

  // 수업 형태
  [['1:1', '1대1', '일대일', '1on1', '1-on-1', 'one-on-one'], ['instructor.bilingual_tutor', 'social.live_class_option']],
  [['튜터', '튜터링', '과외', '선생님', 'tutor', 'tutoring', 'teacher'], ['instructor.bilingual_tutor', 'social.live_class_option']],
  [['라이브', '실시간', 'live'], ['social.live_class_option']],
  [['원어민', 'native'], ['instructor.native_speaker', 'format.native_speaker_clips']],

  // 기능
  [['오프라인', 'offline', '오프라인 이용', 'offline access'], ['ux.offline_available']],
  [['플래시카드', '단어카드', 'flashcard'], ['format.flashcard']],
  [['게임', '게임식', 'gamification', 'game'], ['ux.gamification']],
  [['발음', 'pronunciation'], ['strength.pronunciation']],
  [['ai', '에이아이', '인공지능'], ['aiFeedback']],
  [['첨삭', '피드백', 'feedback'], ['aiFeedback', 'humanFeedback']],
  [['실생활', '생활', '일상'], ['strength.real_life_phrases']],
  [['슬랭', '유행어', '신조어', 'slang'], ['strength.slang_trendy']],
  [['존댓말', '높임말', '격식', 'formal', 'honorific'], ['strength.formal_language']],
  [['문화', 'culture', 'cultural'], ['strength.cultural_context']],

  // 수준 — 칩 라벨은 입문/초급/중급/고급. 입문·초급은 사용자가 구분하지 않으므로 함께 본다
  [['초보', '초심자', '기초', 'basic', 'starter'], ['beginner', 'elementary']],
  [['초급', '입문', 'beginner', 'elementary'], ['beginner', 'elementary']],
];

for (const [terms, tags] of SYNONYMS) {
  for (const term of terms) register(term, tags);
}

/**
 * 뜻을 담지 않는 낱말. 조건에서 **버린다**.
 *
 * 버리지 않으면 AND 조건이 되어 결과를 죽인다 — `Free K-Pop Apps` 의 `apps` 가
 * `HTSK - application` 하나에만 걸려 0건이 됐고, `Grammar in English` 의 `in` 은
 * TTMIK 별칭 `talk to me in korean` 에 걸려 결과가 한 건으로 줄었다.
 *
 * `korean` / `한국어` 도 여기 있다. 전부 한국어 학습 서비스라 조건이 될 수 없다.
 */
const STOPWORDS = new Set([
  // 영어 기능어·범용어
  'a', 'an', 'the', 'and', 'or', 'for', 'in', 'on', 'of', 'to', 'with',
  'by', 'at', 'my', 'me', 'i', 'you', 'is', 'are',
  'best', 'good', 'top', 'new', 'recommend', 'recommended', 'recommendation',
  'app', 'apps', 'application', 'applications', 'service', 'services',
  'korean', 'learn', 'learning', 'learner', 'study', 'studying', 'studies',
  'practice', 'practise', 'course', 'courses', 'class', 'classes', 'lesson', 'lessons',
  // 한국어 기능어·범용어
  '한국어', '앱', '어플', '어플리케이션', '서비스', '사이트',
  '공부', '학습', '연습', '배우기', '배우는', '배울', '익히기',
  '추천', '좋은', '최고', '인기', '위한', '하는', '할', '것', '거', '좀',
  '강의', '수업',
]);

const HANGUL = /[가-힣]/;

/** 검색어 뒤에 붙는 조사. 벗긴 형태가 뜻을 가질 때만 벗긴다 */
const PARTICLES = [
  '으로써', '으로', '로', '에서', '에게', '에', '의', '를', '을', '은', '는',
  '이', '가', '와', '과', '도', '만', '부터', '까지', '처럼', '보다', '하고',
];

/**
 * 서비스 이름·별칭 매칭.
 *
 * 로마자는 **낱말 시작**에서만 맞춘다 — `duo` → Duolingo 는 되고, `r` → Korean 은
 * 안 된다. 예전에 `includes` 였을 때는 한 글자만 쳐도 결과가 쏟아졌다.
 *
 * 한글은 단어 경계가 공백으로 드러나지 않아(`한국어능력시험`) 두 글자 이상이면
 * 부분 일치를 허용하고, 한 글자는 시작 일치만 본다.
 */
function matchesName(text: string | null | undefined, term: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();

  if (HANGUL.test(term)) {
    return term.length >= 2 ? t.includes(term) : t.startsWith(term);
  }

  return t
    .split(/[^a-z0-9]+/)
    .some(word => word.length > 0 && word.startsWith(term));
}

/** 태그 값을 낱말로 쪼개 정확히 일치하는지 본다 (`lang.english` → `english`) */
function matchesTag(tag: string | null | undefined, term: string): boolean {
  if (!tag) return false;
  if (tag.toLowerCase() === term) return true;
  for (const part of tag.split(/[._-]/)) {
    if (part.toLowerCase() === term) return true;
    const words = part
      .replace(/([a-z0-9])([A-Z])/g, '$1|$2')
      .split('|')
      .map(w => w.toLowerCase());
    if (words.some(w => w === term)) return true;
  }
  return false;
}

/**
 * 매칭에 쓰는 태그 전체.
 *
 * ⚠️ `limitations` 는 넣지 않는다. 넣으면 `grammar` 로 검색했을 때
 * `limit.weak_in_grammar` 가 걸려 **문법 설명이 부족한 앱**이 결과에 올라온다.
 * 약점은 상세 화면에서 보여 줄 정보이지 검색 조건이 아니다.
 */
function appTags(app: App): string[] {
  return [
    ...app.learningField,
    ...app.levels,
    ...app.purposes,
    ...app.pricing,
    ...app.platform,
    ...app.teachingLanguage,
    ...app.realtimeFeedback,
    ...app.differentiators,
    app.sensory,
    app.style,
    app.learnerTypeCode,
  ].filter(Boolean) as string[];
}

/** 낱말 하나가 이 앱에 걸리는지 */
function matchesTerm(app: App, term: string): boolean {
  const phonetic = PHONETIC_ALIASES[term];
  if (phonetic) {
    if (
      app.name.toLowerCase().includes(phonetic) ||
      app.aliases.some(a => a.toLowerCase().includes(phonetic))
    ) return true;
  }

  const mapped = KEYWORD_TO_TAGS[term];
  if (mapped) {
    const tags = appTags(app);
    if (mapped.some(m => tags.includes(m))) return true;
  }

  // 이름은 KO/EN 양쪽을 다 본다 — EN 화면에서 `듀오링고`를 쳐도 Duolingo 가
  // 나와야 하고, 그 반대도 마찬가지다 (PRD R5.18).
  if (
    matchesName(app.name, term) ||
    matchesName(app.nameKo, term) ||
    app.aliases.some(a => matchesName(a, term))
  ) return true;

  return appTags(app).some(tag => matchesTag(tag, term));
}

/**
 * 검색 계획.
 *   · `active === false` — 검색어가 비어 있다. 모든 앱을 통과시킨다
 *   · `terms.length === 0` + `unknown` — 못 알아본 낱말만 있다. 결과 0건
 *   · `terms.length === 0` + `!unknown` — 전부 불용어(`korean`, `앱 추천`). 조건 없음
 */
export type SearchPlan = { active: boolean; terms: string[]; unknown: boolean };

/** 낱말 하나를 뜻이 통하는 형태로 정규화한다. 못 알아보면 `null` */
function resolveToken(token: string, apps: App[]): string | null {
  const candidates = [token];

  // 복수형 — `channels` → `channel`
  if (/[a-z]s$/.test(token) && token.length > 2) candidates.push(token.slice(0, -1));

  // 조사 — `영어로` → `영어`. 남는 부분이 두 글자 이상일 때만
  if (HANGUL.test(token)) {
    for (const particle of PARTICLES) {
      if (token.length > particle.length + 1 && token.endsWith(particle)) {
        candidates.push(token.slice(0, -particle.length));
        break;
      }
    }
  }

  for (const c of candidates) {
    if (!c || STOPWORDS.has(c)) continue;
    if (KEYWORD_TO_TAGS[c] || PHONETIC_ALIASES[c]) return c;
    if (apps.some(app => matchesTerm(app, c))) return c;
  }
  return null;
}

/**
 * 검색어를 낱말로 쪼개 계획을 만든다.
 *
 * 두 낱말짜리 라벨(`부분 유료`, `쓰기 연습`)이 있어서 앞에서부터 두 낱말씩 먼저
 * 맞춰 보고, 안 되면 한 낱말로 본다.
 */
export function buildSearchPlan(rawQuery: string, apps: App[]): SearchPlan {
  const q = rawQuery.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!q) return { active: false, terms: [], unknown: false };

  const tokens = q.split(' ');
  const terms: string[] = [];
  // 불용어가 아니면서 뜻도 못 알아본 낱말이 있었는지. 있으면 결과 0건이 맞다
  let unknown = false;

  for (let i = 0; i < tokens.length; i += 1) {
    if (i + 1 < tokens.length) {
      const pair = `${tokens[i]} ${tokens[i + 1]}`;
      if (KEYWORD_TO_TAGS[pair]) {
        terms.push(pair);
        i += 1;
        continue;
      }
    }
    if (STOPWORDS.has(tokens[i])) continue;
    const resolved = resolveToken(tokens[i], apps);
    if (!resolved) { unknown = true; continue; }
    if (!terms.includes(resolved)) terms.push(resolved);
  }

  return { active: true, terms, unknown };
}

/**
 * 라벨이 없어서 **한국어로 검색되지 않는** 태그 값을 찾아낸다.
 *
 * 검색 사전이 `TAG_CHIP`/`TAG_LONG` 라벨에서 자동 생성되므로, 라벨 없는 태그는
 * 영문 값으로만 걸린다. 태그를 새로 만들고 라벨을 잊는 것이 유일한 구멍이라
 * 개발 중에 콘솔로 알려 준다 (`data/apps.ts` 의 `fetchApps` 에서 호출).
 */
export function tagsMissingLabels(apps: App[]): string[] {
  const missing = new Set<string>();
  for (const app of apps) {
    for (const tag of appTags(app)) {
      // 학습유형 코드(가~바)는 칩 라벨이 `가 시각·탐색` 형태라 별도 취급이다
      if (/^[가-바]$/.test(tag)) continue;
      const labelled = Object.values(KEYWORD_TO_TAGS).some(v => v.includes(tag));
      if (!labelled) missing.add(tag);
    }
  }
  return [...missing].sort();
}

/** 계획의 모든 낱말을 만족해야 통과 (AND) */
export function matchesSearchPlan(app: App, plan: SearchPlan): boolean {
  if (!plan.active) return true;
  // 조건이 없을 때 — 못 알아본 낱말 때문이면 0건, 불용어뿐이면 전체
  if (plan.terms.length === 0) return !plan.unknown;
  return plan.terms.every(term => matchesTerm(app, term));
}
