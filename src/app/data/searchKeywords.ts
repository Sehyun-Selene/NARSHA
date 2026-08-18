import type { App } from './apps';

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
};

// Maps a normalized search term → one or more DB tag values (OR within the mapping)
const KEYWORD_TO_TAGS: Record<string, string[]> = {
  // Platform
  'web': ['Website'],
  'website': ['Website'],
  '웹': ['Website'],
  'ios': ['iOS'],
  'iphone': ['iOS'],
  '아이폰': ['iOS'],
  '애플': ['iOS'],
  'android': ['Android'],
  '안드로이드': ['Android'],
  '유튜브': ['youtubeChannel'],
  'youtube': ['youtubeChannel'],
  'yt': ['youtubeChannel'],
  // Price
  '무료': ['free', 'freemium'],
  'free': ['free', 'freemium'],
  '공짜': ['free', 'freemium'],
  '구독': ['subscription-only'],
  'subscription': ['subscription-only'],
  '월정액': ['subscription-only'],
  '평생': ['one-time purchase'],
  // Differentiators / strengths
  '문법': ['strength.grammar_explanation'],
  'grammar': ['strength.grammar_explanation'],
  '발음': ['strength.pronunciation'],
  'pronunciation': ['strength.pronunciation'],
  '어휘': ['strength.vocabulary_volume'],
  '단어': ['strength.vocabulary_volume'],
  'vocabulary': ['strength.vocabulary_volume'],
  'vocab': ['strength.vocabulary_volume'],
  'kpop': ['strength.kpop_kdrama_context'],
  '케이팝': ['strength.kpop_kdrama_context'],
  'k-pop': ['strength.kpop_kdrama_context'],
  'kdrama': ['strength.kpop_kdrama_context'],
  '드라마': ['strength.kpop_kdrama_context'],
  'topik': ['strength.exam_focused'],
  '토픽': ['strength.exam_focused'],
  '시험': ['strength.exam_focused'],
  '라이브': ['social.live_class_option'],
  '실시간': ['social.live_class_option'],
  'live': ['social.live_class_option'],
  '오프라인': ['ux.offline_available'],
  'offline': ['ux.offline_available'],
  '플래시카드': ['format.flashcard'],
  '단어카드': ['format.flashcard'],
  'flashcard': ['format.flashcard'],
  // Teaching languages
  'english': ['lang.english'],
  'eng': ['lang.english'],
  '영어': ['lang.english'],
  'japanese': ['lang.japanese'],
  'jp': ['lang.japanese'],
  '일본어': ['lang.japanese'],
  'chinese': ['lang.chinese'],
  'mandarin': ['lang.chinese'],
  '중국어': ['lang.chinese'],
  'vietnamese': ['lang.vietnamese'],
  '베트남어': ['lang.vietnamese'],
  'spanish': ['lang.spanish'],
  '스페인어': ['lang.spanish'],
  'french': ['lang.french'],
  '프랑스어': ['lang.french'],
  'german': ['lang.german'],
  '독일어': ['lang.german'],
  'italian': ['lang.italian'],
  '이탈리아어': ['lang.italian'],
  'portuguese': ['lang.portuguese'],
  '포르투갈어': ['lang.portuguese'],
  'russian': ['lang.russian'],
  '러시아어': ['lang.russian'],
  'arabic': ['lang.arabic'],
  '아랍어': ['lang.arabic'],
  'turkish': ['lang.turkish'],
  '터키어': ['lang.turkish'],
  'dutch': ['lang.dutch'],
  '네덜란드어': ['lang.dutch'],
  'polish': ['lang.polish'],
  '폴란드어': ['lang.polish'],
  'indonesian': ['lang.indonesian'],
  '인도네시아어': ['lang.indonesian'],
  'hindi': ['lang.hindi'],
  '힌디어': ['lang.hindi'],
  'korean': ['lang.korean'],
  '한국어': ['lang.korean'],
};

const HANGUL = /[가-힣]/;

/**
 * 서비스 이름·별칭 매칭.
 *
 * 이전에는 `name.includes(query)` 였다. 문자열 아무 위치나 일치시키므로
 * `r` 한 글자가 Korean·Drops·Coursera 에 모두 걸려, 의미 없는 입력에도 결과가
 * 쏟아졌다. 검색이 아니라 필터가 안 되는 상태였다.
 *
 * 로마자는 **단어 시작**에서만 맞춘다 — `duo` → Duolingo 는 되고,
 * `r` → Korean 은 안 된다.
 *
 * 한글은 단어 경계가 공백으로 드러나지 않아(`한국어능력시험`) 단어 시작만 보면
 * 놓치는 게 많다. 그래서 두 글자 이상이면 부분 일치를 허용하고, 한 글자는
 * 시작 일치만 본다.
 */
function matchesName(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();

  if (HANGUL.test(query)) {
    return query.length >= 2 ? t.includes(query) : t.startsWith(query);
  }

  return t
    .split(/[^a-z0-9]+/)
    .some(word => word.length > 0 && word.startsWith(query));
}

export function matchesTag(tag: string | null | undefined, query: string): boolean {
  if (!tag) return false;
  const lower = tag.toLowerCase();
  if (lower === query) return true;
  const parts = tag.split(/[._-]/);
  for (const part of parts) {
    if (part.toLowerCase() === query) return true;
    const words = part
      .replace(/([a-z0-9])([A-Z])/g, '$1|$2')
      .split('|')
      .map(w => w.toLowerCase());
    if (words.some(w => w === query)) return true;
  }
  return false;
}

export function applySearch(app: App, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  // Korean phonetic alias → English app name
  const phoneticTarget = PHONETIC_ALIASES[normalizedQuery];
  if (phoneticTarget) {
    if (
      app.name.toLowerCase().includes(phoneticTarget) ||
      app.aliases.some(a => a.toLowerCase().includes(phoneticTarget))
    ) return true;
  }

  // Keyword → one-or-more DB tag values (OR within mapping)
  const mappedTags = KEYWORD_TO_TAGS[normalizedQuery];
  if (mappedTags) {
    const allAppTags: string[] = [
      ...app.learningField,
      ...app.levels,
      ...app.purposes,
      ...app.pricing,
      ...app.platform,
      ...app.teachingLanguage,
      ...app.realtimeFeedback,
      ...app.differentiators,
      ...app.limitations,
      app.sensory,
      app.style,
      app.learnerTypeCode,
    ].filter(Boolean);
    if (mappedTags.some(mt => allAppTags.includes(mt))) return true;
  }

  // Direct exact-word tag matching across all DB fields.
  // 이름은 KO/EN 양쪽을 다 본다 — EN 화면에서 `듀오링고`를 쳐도 Duolingo 가
  // 나와야 하고, 그 반대도 마찬가지다 (PRD R5.18).
  return (
    matchesName(app.name, normalizedQuery) ||
    matchesName(app.nameKo, normalizedQuery) ||
    app.aliases.some(a => matchesName(a, normalizedQuery)) ||
    app.learningField.some(f => matchesTag(f, normalizedQuery)) ||
    app.levels.some(l => matchesTag(l, normalizedQuery)) ||
    app.purposes.some(p => matchesTag(p, normalizedQuery)) ||
    app.pricing.some(p => matchesTag(p, normalizedQuery)) ||
    app.platform.some(p => matchesTag(p, normalizedQuery)) ||
    app.teachingLanguage.some(l => matchesTag(l, normalizedQuery)) ||
    app.realtimeFeedback.some(f => matchesTag(f, normalizedQuery)) ||
    app.differentiators.some(d => matchesTag(d, normalizedQuery)) ||
    app.limitations.some(l => matchesTag(l, normalizedQuery)) ||
    matchesTag(app.sensory, normalizedQuery) ||
    matchesTag(app.style, normalizedQuery) ||
    (app.learnerTypeCode ? matchesTag(app.learnerTypeCode, normalizedQuery) : false)
  );
}
