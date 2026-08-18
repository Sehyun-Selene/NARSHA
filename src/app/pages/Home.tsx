import { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Search, X, SlidersHorizontal, SearchX, ChevronDown,
  BarChart3, Target, Fingerprint, Sparkles,
} from 'lucide-react';
import SuggestServiceModal from '../components/SuggestServiceModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppLogoMark } from '../components/AppLogoMark';
import ReviewsByType from './home/ReviewsByType';
import { fetchApps, getAppLevelDisplayTags, appDescription, appName, type App } from '../data/apps';
import { getAllReviews, isReviewSort, type Review, type ReviewSort } from '../data/reviews';
import { buildSearchPlan, matchesSearchPlan } from '../data/searchKeywords';
import { useT } from '../i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';

// ── Filter chip axes ──────────────────────────────────────────────────────────
//
// 값(value)은 DB 태그이자 필터 쿼리 키다 — 절대 바꾸지 않는다.
// 표시 라벨은 `i18n/tags.ts` 의 사전에서 언어에 맞춰 꺼낸다 (PRD R5.16).

// Quick axis 1 — Level (single-select, app.levels[])
const LEVEL_CHIPS = ['beginner', 'elementary', 'intermediate', 'advanced'];

// Quick axis 2 — Purpose (single-select, app.purposes[])
const PURPOSE_CHIPS = ['topikPreparation', 'academic', 'businessProficiency', 'entertainment'];

// Quick axis 3 — Learner type (single-select, 검사 완료 후 노출)
const LEARNER_TYPE_CHIPS = ['가', '나', '다', '라', '마', '바'];

// Quick axis 4 — 8 key differentiators (multi-select)
const DIFFERENTIATOR_CHIPS = [
  'strength.grammar_explanation',
  'strength.pronunciation',
  'strength.vocabulary_volume',
  'strength.kpop_kdrama_context',
  'strength.exam_focused',
  'social.live_class_option',
  'ux.offline_available',
  'format.flashcard',
];

// ── Advanced filter chip data (Groups A–M) ────────────────────────────────────

// Group A: Price (single-select, app.pricing[])
const PRICE_CHIPS = ['free', 'freemium', 'one-time purchase', 'subscription-only'];

// Group B: Platform (multi-select, app.platform[])
const PLATFORM_CHIPS = ['iOS', 'Android', 'Website', 'youtubeChannel'];

// Group C: Teaching Language (single-select, app.teachingLanguage[])
const TEACHING_LANG_CHIPS = [
  'lang.english', 'lang.japanese', 'lang.chinese', 'lang.vietnamese',
  'lang.spanish', 'lang.french', 'lang.german', 'lang.italian',
  'lang.portuguese', 'lang.russian', 'lang.arabic', 'lang.turkish',
  'lang.dutch', 'lang.polish', 'lang.indonesian', 'lang.hindi',
  'lang.korean', 'lang.user_defined', 'lang.tutor_dependent', 'lang.multilingual_20plus',
];

// Group D: Realtime Feedback (multi-select, app.realtimeFeedback[])
const FEEDBACK_CHIPS = ['aiFeedback', 'humanFeedback', 'noFeedback'];

// Groups E–M: all query app.differentiators[]

// Group E: Learning Mechanism
const MECHANISM_CHIPS = [
  'mechanism.active_recall',
  'mechanism.self_assessment',
  'mechanism.scenario_based',
  'mechanism.numbered_curriculum',
  'mechanism.textbook_aligned',
  'mechanism.topic_based',
  'mechanism.bite_sized_lessons',
];

// Group F: Content Format (excludes format.flashcard already in axis 4)
const FORMAT_CHIPS = [
  'format.video_lecture',
  'format.native_speaker_clips',
  'format.animated_lesson',
  'format.live_action_drama',
  'format.whiteboard_explanation',
  'format.text_with_audio',
  'format.handwriting_practice',
  'format.downloadable_pdf',
  'format.subtitles_dual',
];

// Group G: Instructor
const INSTRUCTOR_CHIPS = [
  'instructor.native_speaker',
  'instructor.foreign_learner',
  'instructor.bilingual_tutor',
  'instructor.institutional',
  'instructor.community_built',
];

// Group H: Strength Areas (excludes the 8 already in axis 4)
const STRENGTH_AREA_CHIPS = [
  'strength.cultural_context',
  'strength.real_life_phrases',
  'strength.slang_trendy',
  'strength.formal_language',
];

// Group I: Learner Fit
const FIT_CHIPS = [
  'fit.needs_structure',
  'fit.casual_learner',
  'fit.kpop_fan',
  'fit.career_focused',
  'fit.shy_speaker',
];

// Group J: Accessibility / UX (excludes ux.offline_available already in axis 4)
const UX_CHIPS = [
  'ux.gamification',
  'ux.short_videos',
  'ux.long_form_content',
  'ux.multilingual_interface',
];

// Group K: Social (excludes social.live_class_option already in axis 4)
const SOCIAL_CHIPS = [
  'social.community_forum',
  'social.peer_interaction',
  'social.companion_service_paid',
];

// Group L: Learning Pace
const PACE_CHIPS = ['pace.daily_short_session', 'pace.deep_dive_session', 'pace.flexible_pacing'];

// Group M: Content Authority
const AUTHORITY_CHIPS = [
  'authority.official_curriculum',
  'authority.expert_designed',
  'authority.research_backed',
];

// Groups D–M in order — used for AND-between-groups filtering
const ADV_TAG_GROUPS = [
  FEEDBACK_CHIPS,
  MECHANISM_CHIPS,
  FORMAT_CHIPS,
  INSTRUCTOR_CHIPS,
  STRENGTH_AREA_CHIPS,
  FIT_CHIPS,
  UX_CHIPS,
  SOCIAL_CHIPS,
  PACE_CHIPS,
  AUTHORITY_CHIPS,
];

// ── Misc constants ────────────────────────────────────────────────────────────

const LEARNER_TYPE_MAP: Record<string, { sensory: string[]; style: string }> = {
  '가': { sensory: ['visual'], style: 'exploratory' },
  '나': { sensory: ['visual'], style: 'structured' },
  '다': { sensory: ['auditory'], style: 'exploratory' },
  '라': { sensory: ['auditory'], style: 'structured' },
  '마': { sensory: ['visual', 'auditory', 'mixed'], style: 'exploratory' },
  '바': { sensory: ['visual', 'auditory', 'mixed'], style: 'structured' },
};

/** 빠른 필터 축 — 서랍 손잡이 순서와 아이콘. `type` 은 검사 완료 후에만 노출된다. */
const AXES = [
  { key: 'level',     labelKey: 'home.axis.level',     Icon: BarChart3 },
  { key: 'purpose',   labelKey: 'home.axis.purpose',   Icon: Target },
  { key: 'type',      labelKey: 'home.axis.type',      Icon: Fingerprint },
  { key: 'strengths', labelKey: 'home.axis.strengths', Icon: Sparkles },
] as const;

const SENSORY_KEY = {
  visual:   'card.sensory.visual',
  auditory: 'card.sensory.auditory',
  mixed:    'card.sensory.mixed',
} as const;

const CHIP_OFF = "whitespace-nowrap text-[11px] px-1.5 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]";
const CHIP_ON  = "whitespace-nowrap text-[11px] px-1.5 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent";

function computeRating(reviews: Review[], appId: string): number {
  const appReviews = reviews.filter(r => r.appId === appId);
  if (appReviews.length === 0) return 0;
  return appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  useDocumentTitle();
  const { t, tLines, tag, lang } = useT();
  const placeholders = tLines('home.placeholders');

  // 보기 전환 (REQ-A / A-2). URL 쿼리와 동기화해 링크 공유·뒤로가기가 동작한다.
  const [searchParams, setSearchParams] = useSearchParams();
  const view: 'apps' | 'type' = searchParams.get('view') === 'type' ? 'type' : 'apps';
  const setView = (next: 'apps' | 'type') => {
    const params = new URLSearchParams(searchParams);
    if (next === 'apps') params.delete('view');
    else params.set('view', 'type');
    setSearchParams(params, { replace: false });
    // 히어로는 그대로 두고 아래 콘텐츠만 바뀌므로, 탭 위치로 스크롤을 맞춘다
    requestAnimationFrame(() => {
      document.getElementById('discover-views')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  };

  // 후기 정렬도 URL 에 남긴다 (REQ-F / F-2) — 정렬 상태까지 링크로 공유된다
  const sortParam = searchParams.get('sort');
  const reviewSort: ReviewSort = isReviewSort(sortParam) ? sortParam : 'recent';
  const setReviewSort = (next: ReviewSort) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'recent') params.delete('sort');
    else params.set('sort', next);
    setSearchParams(params, { replace: true });
  };

  // Data
  const [apps, setApps] = useState<App[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Quick filters (4 axes)
  /**
   * 검색어는 URL 에 둔다 (?q=).
   *   · 좌상단 로고는 "/" 로 이동한다 — 쿼리가 사라지므로 검색이 자동으로 초기화된다.
   *     컴포넌트 state 에 두면 같은 경로라 리마운트가 없어 검색어가 그대로 남는다.
   *   · 검색 결과 링크를 그대로 공유할 수 있게 되는 이점도 있다.
   * view·sort 도 같은 방식으로 URL 에 있다.
   */
  /**
   * ⚠️ 입력값의 주인은 로컬 state 다. URL 은 거울로만 쓴다.
   *
   * 예전에는 input 의 `value` 를 `searchParams.get('q')` 에서 바로 읽었다.
   * 그러면 글자마다 `setSearchParams` → 라우터 내비게이션 → 리렌더가 돌고, 그
   * 과정에서 value 가 재할당된다. 영문은 티가 안 나지만 **한글은 IME 조합이
   * 끊겨 자모가 중복 입력된다** ("영어로" → "ㅇ여영ㅇ어얼로"). value 를 로컬
   * state 로 두면 사용자가 친 값과 항상 같아서 React 가 DOM value 를 건드리지 않는다.
   */
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');

  // 우리가 URL 에 마지막으로 써 넣은 값. 외부 변경(로고 클릭·뒤로가기)과 구분한다
  const pushedQuery = useRef(searchQuery);

  // state → URL
  useEffect(() => {
    if (searchQuery === (searchParams.get('q') ?? '')) return;
    const params = new URLSearchParams(searchParams);
    if (searchQuery) params.set('q', searchQuery);
    else params.delete('q');
    pushedQuery.current = searchQuery;
    // replace — 글자마다 히스토리가 쌓이면 뒤로가기가 먹통이 된다
    setSearchParams(params, { replace: true });
  }, [searchQuery]);

  // URL → state. 우리가 쓴 값이 아닐 때만 되돌린다 (로고로 `/` 이동, 뒤로가기, 링크 진입)
  const urlQuery = searchParams.get('q') ?? '';
  useEffect(() => {
    if (urlQuery === pushedQuery.current) return;
    pushedQuery.current = urlQuery;
    setSearchQuery(urlQuery);
  }, [urlQuery]);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [purposeFilter, setPurposeFilter] = useState<string | null>(null);
  const [learnerTypeFilter, setLearnerTypeFilter] = useState<string | null>(null);
  const [differentiatorFilters, setDifferentiatorFilters] = useState<string[]>([]);

  // Advanced filters (groups A–M)
  const [priceFilter, setPriceFilter] = useState<string | null>(null);          // A
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);         // B
  const [teachingLangFilter, setTeachingLangFilter] = useState<string | null>(null); // C
  const [advancedTagFilters, setAdvancedTagFilters] = useState<string[]>([]);   // D–M

  /** 펼쳐 둔 빠른 필터 축. 한 번에 하나만 연다 — 서랍 하나씩 여는 느낌. */
  const [openAxis, setOpenAxis] = useState<string | null>(null);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [hasTakenSurvey, setHasTakenSurvey] = useState(false);

  // Placeholder rotation
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  // KO/EN 모두 같은 크기를 쓴다 — 언어를 바꿔도 히어로가 화면에서 차지하는
  // 비율이 달라지지 않게 하기 위함이다. 각 값은 컨테이너 여백(px-6 + h1 px-1)을
  // 뺀 실제 가용 폭 안에서 EN 한 줄이 줄바꿈되지 않는 최대 크기를 브라우저로
  // 직접 재서 정했다(여유 폭 몇 px 남김). KO 두 줄도 같은 값에서 md 이상은
  // 줄 안 꺾이는 것을 확인했다 — 768px 미만은 원래도 두 줄 이상으로 흐른다.
  const heroSize = 'text-[clamp(2rem,9vw,3rem)] md:text-[3.5rem] lg:text-[2.5rem] xl:text-[4rem]';

  useEffect(() => {
    setHasTakenSurvey(!!localStorage.getItem('narsha-learner-type'));
  }, []);

  const loadData = () => {
    setLoading(true);
    setLoadError(false);
    Promise.all([fetchApps(), getAllReviews()])
      .then(([appsData, reviewsData]) => {
        setApps(appsData);
        setReviews(reviewsData);
      })
      .catch((err) => {
        console.error(err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    setPlaceholderVisible(true);
    let timerId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setPlaceholderVisible(false);
      timerId = setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % placeholders.length);
        setPlaceholderVisible(true);
      }, 300);
    }, 1500);
    return () => { clearInterval(intervalId); clearTimeout(timerId); };
  }, [searchQuery]);

  // ── Filtered results ────────────────────────────────────────────────────────

  // 검색 계획은 낱말 사전을 한 번만 훑으면 되므로 앱 목록·검색어가 바뀔 때만 다시 만든다
  const searchPlan = useMemo(() => buildSearchPlan(searchQuery, apps), [searchQuery, apps]);

  const filteredApps = apps.filter((app: App) => {
    if (!matchesSearchPlan(app, searchPlan)) return false;

    if (levelFilter && !app.levels.includes(levelFilter)) return false;
    if (purposeFilter && !app.purposes.includes(purposeFilter)) return false;

    if (learnerTypeFilter) {
      const t = LEARNER_TYPE_MAP[learnerTypeFilter];
      if (t && !(t.sensory.includes(app.sensory) && app.style === t.style)) return false;
    }

    if (differentiatorFilters.length > 0 &&
        !differentiatorFilters.some(df => app.differentiators.includes(df))) return false;

    if (priceFilter && !app.pricing.includes(priceFilter)) return false;

    if (platformFilters.length > 0 &&
        !platformFilters.some(pf => app.platform.includes(pf))) return false;

    if (teachingLangFilter && !app.teachingLanguage.includes(teachingLangFilter)) return false;

    // Groups D–M: AND between groups, OR within group
    for (const group of ADV_TAG_GROUPS) {
      const groupValues = group;
      const selected = advancedTagFilters.filter(t => groupValues.includes(t));
      if (selected.length > 0 &&
          !selected.some(t => app.realtimeFeedback.includes(t) || app.differentiators.includes(t))
      ) return false;
    }

    return true;
  });

  // ── Filter helpers ──────────────────────────────────────────────────────────

  const clearAllFilters = () => {
    setLevelFilter(null);
    setPurposeFilter(null);
    setLearnerTypeFilter(null);
    setDifferentiatorFilters([]);
    setPriceFilter(null);
    setPlatformFilters([]);
    setTeachingLangFilter(null);
    setAdvancedTagFilters([]);
  };

  const clearAdvancedFilters = () => {
    setPriceFilter(null);
    setPlatformFilters([]);
    setTeachingLangFilter(null);
    setAdvancedTagFilters([]);
    if (!hasTakenSurvey) setLearnerTypeFilter(null);
  };

  const advancedFilterCount =
    (priceFilter ? 1 : 0) +
    platformFilters.length +
    (teachingLangFilter ? 1 : 0) +
    advancedTagFilters.length +
    (!hasTakenSurvey && learnerTypeFilter ? 1 : 0);

  /** 서랍이 닫혀 있어도 선택 개수는 손잡이에 보여야 한다. */
  const axisCounts: Record<string, number> = {
    level:     levelFilter ? 1 : 0,
    purpose:   purposeFilter ? 1 : 0,
    type:      learnerTypeFilter ? 1 : 0,
    strengths: differentiatorFilters.length,
  };

  const toggleAdvTag = (tag: string) =>
    setAdvancedTagFilters(prev =>
      prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]
    );

  const activeFilterChips = [
    ...(levelFilter ? [{ key: 'level', label: tag(levelFilter), onRemove: () => setLevelFilter(null) }] : []),
    ...(purposeFilter ? [{ key: 'purpose', label: tag(purposeFilter), onRemove: () => setPurposeFilter(null) }] : []),
    ...(learnerTypeFilter ? [{ key: 'type', label: tag(learnerTypeFilter), onRemove: () => setLearnerTypeFilter(null) }] : []),
    ...differentiatorFilters.map(df => ({ key: df, label: tag(df), onRemove: () => setDifferentiatorFilters(p => p.filter(x => x !== df)) })),
    ...(priceFilter ? [{ key: 'price', label: tag(priceFilter), onRemove: () => setPriceFilter(null) }] : []),
    ...platformFilters.map(pf => ({ key: `plat-${pf}`, label: tag(pf), onRemove: () => setPlatformFilters(p => p.filter(x => x !== pf)) })),
    ...(teachingLangFilter ? [{ key: 'tlang', label: tag(teachingLangFilter), onRemove: () => setTeachingLangFilter(null) }] : []),
    ...advancedTagFilters.map(tagValue => ({ key: `adv-${tagValue}`, label: tag(tagValue), onRemove: () => setAdvancedTagFilters(p => p.filter(x => x !== tagValue)) })),
  ];

  // 유형별 보기에 조건을 물려줄지 판단한다 (D11). 검색어도 조건에 포함된다.
  // activeFilterChips 보다 뒤에 두어야 한다 — const 는 호이스팅되지 않는다.
  const hasActiveConditions = activeFilterChips.length > 0 || searchQuery.trim().length > 0;
  // 검색 중이면 히어로를 접고 결과를 검색창 바로 아래로 올린다
  const searching = searchQuery.trim().length > 0;

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero — 좌: 문구 / 우: 검색+필터. 둘을 나란히 두면 헤딩 줄 수가
            언어마다 달라져도 검색바 위치가 밀리지 않는다. */}
        {/*
          검색을 시작하면 히어로를 접는다 (사용자 요청).
          히어로가 화면을 꽉 채우고 있어서, 검색어를 쳐도 결과가 스크롤 아래에
          있어 "검색이 되는지 안 되는지" 를 알 수 없었다. 검색 중에는 문구를
          걷어내고 검색창을 위로 올려 결과가 바로 이어 보이게 한다.
        */}
        <div
          className={`max-w-[1280px] mx-auto px-6 flex items-center transition-all duration-500 ease-out ${
            searching ? 'py-6 lg:min-h-0' : 'py-14 lg:min-h-[calc(100vh-4rem)]'
          }`}
        >
          {/* 2열 분할은 lg 부터. 이 폭에서는 영어 칩이 두 줄로 흐르지만,
              칩은 기본이 접힌 상태라 펼쳤을 때만 보인다. 패널 자리를 두 줄
              기준으로 미리 비워 둬서 줄 수가 변해도 위쪽은 안 움직인다. */}
          <div
            className={`w-full grid grid-cols-1 gap-10 lg:gap-14 items-center transition-all duration-500 ease-out ${
              searching ? 'lg:grid-cols-1' : 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]'
            }`}
          >

          {/*
            히어로 문구 접힘/펼침.
            max-height 를 큰 값으로 전환하면 실제 높이에 도달한 뒤에도 애니메이션이
            남아 중간에 끊긴 것처럼 보인다. grid-template-rows 0fr↔1fr 는 내용 높이를
            기준으로 보간되어 양방향 모두 매끄럽다.
          */}
          <div
            className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-in-out ${
              searching ? 'grid-rows-[0fr] opacity-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100'
            }`}
            aria-hidden={searching}
          >
          <div className="min-h-0 flex flex-col items-center lg:items-start gap-6 w-full text-center lg:text-left lg:pl-6">
            <h1 className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold ${heroSize} leading-[1.08] tracking-[-0.042em] bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] pb-[0.1em] overflow-visible`}>
              {tLines('home.hero.title').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            <div className="max-w-[480px] flex flex-col gap-1">
              {tLines('home.hero.sub').map((line, i) => (
                <p
                  key={i}
                  className={i === 0
                    ? "font-['Inter:Medium',sans-serif] font-medium text-[18px] leading-[28px] text-[#1e293b] dark:text-[#dce3f3]"
                    : "font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2]"}
                >
                  {line}
                </p>
              ))}

              {/*
                안내 페이지 진입점 (REQ-B). 첫 방문자가 "학습 유형이 뭔데?", "누가
                어떤 근거로 만들었나?" 를 물을 곳이 푸터뿐이었다. 검사 CTA 와
                경쟁하지 않도록 버튼이 아닌 텍스트 링크로 둔다.
              */}
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5">
                <Link
                  to="/about"
                  className="text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  {t('home.hero.linkAbout')}
                </Link>
                <Link
                  to="/methodology"
                  className="text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  {t('home.hero.linkMethod')}
                </Link>
              </div>
            </div>
          </div>
          </div>

          {/*
            Search + chip filters.
            검색 중에는 가로 배치로 바꾼다 (사용자 요청) — 검색창이 화면 폭을 다 쓰면
            아래 앱 카드가 잘려 보인다. 검색창을 필요한 만큼만 두고 남는 폭에 필터
            손잡이를 나란히 놓는다.
          */}
          <div
            className={`w-full gap-3 transition-all duration-500 ease-out ${
              searching ? 'flex flex-col lg:flex-row lg:items-start lg:gap-6' : 'flex flex-col'
            }`}
          >

            {/* Search bar */}
            <div className={`relative transition-all duration-500 ease-out ${searching ? 'lg:flex-1 lg:min-w-[320px]' : 'w-full'}`}>
              {/*
                다크에서 배경(#070e19)이 페이지 배경(#0c141f)과 거의 같아 검색창이
                묻혔다. 한 단계 밝은 표면 + 보더로 경계를 만들고, 포커스 시 sky 링을
                준다. 그림자만으로는 어두운 배경에서 형태가 드러나지 않는다.
              */}
              <div className="bg-[#f1f5f9] dark:bg-[#1e293b] rounded-[12px] border-2 border-[#94a3b8] dark:border-[#35708f] shadow-[0px_20px_40px_-16px_rgba(15,23,42,0.28)] dark:shadow-[0px_20px_40px_-16px_rgba(0,0,0,0.7)] overflow-hidden transition-colors focus-within:border-[#0ea5e9] dark:focus-within:border-[#8ecdff]">
                <div className={`flex items-center pl-16 pr-6 transition-all duration-500 ease-out ${searching ? 'py-4' : 'py-6'}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    aria-label={t('home.searchLabel')}
                    className="w-full bg-transparent font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] outline-none"
                  />
                </div>
              </div>
              <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <Search className="w-[18px] h-[18px] text-[#0ea5e9] dark:text-[#8ecdff]" />
              </div>
              {!searchQuery && (
                <span
                  aria-hidden="true"
                  className={`absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#94a3b8] dark:text-[#64748b] transition-opacity duration-300 ${placeholderVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                  {placeholders[placeholderIdx]}
                </span>
              )}
            </div>

            {/*
              축 이름만 서랍 손잡이처럼 늘어놓고, 누른 축의 칩만 아래에 펼친다.
              칩 96개를 한 번에 보여주면 글자가 너무 많아 지저분해 보인다.
              mt-8 은 검색바 그림자(아래로 25px 번짐)를 피하기 위한 간격이다.
            */}
            <div className={`flex flex-col gap-2 transition-all duration-500 ease-out ${searching ? 'mt-0 lg:shrink-0' : 'mt-8'}`}>
              <div className={searching ? 'grid grid-cols-2 gap-2' : 'flex flex-wrap gap-2'}>
                {AXES.filter(axis => axis.key !== 'type' || hasTakenSurvey).map(axis => {
                  const open = openAxis === axis.key;
                  const count = axisCounts[axis.key];
                  return (
                    <button
                      key={axis.key}
                      type="button"
                      aria-expanded={open}
                      aria-controls="axis-panel"
                      onClick={() => setOpenAxis(prev => (prev === axis.key ? null : axis.key))}
                      className={`flex items-center gap-1.5 text-[13px] pl-3 pr-2.5 py-1.5 rounded-full border transition-all font-['Manrope:Medium',sans-serif] font-medium ${
                        open || count > 0
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent'
                          : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]'
                      }`}
                    >
                      <axis.Icon className="w-[14px] h-[14px]" aria-hidden="true" />
                      {t(axis.labelKey)}
                      {count > 0 && (
                        <span className="bg-white/25 dark:bg-black/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                          {count}
                        </span>
                      )}
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-[13px] h-[13px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/*
                히어로는 세로 중앙 정렬이라 우측 컬럼이 커지면 전체가 위로 밀린다.
                패널 자리를 미리 비워 둬서 열고 닫아도 검색바·손잡이가 안 움직이게 한다.
                2열 정렬(lg 이상)에서만 필요하다 — 그 아래는 중앙 정렬이 걸리지 않는다.

                lg 는 컬럼이 좁아 영어 칩이 두 줄까지 흐르므로 두 줄(83px) 기준,
                xl 은 모든 축이 한 줄(51px)로 들어가므로 한 줄 기준으로 잡는다.
                칩을 더 추가해 줄 수가 늘면 이 값도 같이 올려야 한다.
              */}
              <div className={searching ? '' : 'lg:min-h-[84px] xl:min-h-[52px]'}>
              {openAxis && (
                <div
                  id="axis-panel"
                  className="rounded-[12px] border border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#151c27] px-4 py-3 flex flex-wrap gap-1.5"
                >
                  {openAxis === 'level' && LEVEL_CHIPS.map(value => (
                    <button key={value} onClick={() => setLevelFilter(p => p === value ? null : value)} className={levelFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                  {openAxis === 'purpose' && PURPOSE_CHIPS.map(value => (
                    <button key={value} onClick={() => setPurposeFilter(p => p === value ? null : value)} className={purposeFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                  {openAxis === 'type' && LEARNER_TYPE_CHIPS.map(value => (
                    <button key={value} onClick={() => setLearnerTypeFilter(p => p === value ? null : value)} className={learnerTypeFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                  {openAxis === 'strengths' && DIFFERENTIATOR_CHIPS.map(value => (
                    <button key={value} onClick={() => setDifferentiatorFilters(p => p.includes(value) ? p.filter(x => x !== value) : [...p, value])} className={differentiatorFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Advanced Filters button */}
            <div
              className={
                searching
                  ? 'lg:pl-4 lg:shrink-0 lg:border-l border-[#e2e8f0] dark:border-[#232a36]'
                  : 'mt-2 pt-3 border-t border-[#e2e8f0] dark:border-[#232a36]'
              }
            >
              <button
                onClick={() => setShowAdvancedFilters(true)}
                className="flex items-center gap-1.5 text-[13px] text-[#64748b] dark:text-[#8a94a6] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors"
              >
                <SlidersHorizontal className="w-[13px] h-[13px]" />
                {t('home.adv.open')}
                {advancedFilterCount > 0 && (
                  <span className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {advancedFilterCount}
                  </span>
                )}
                <span className="text-[#94a3b8] dark:text-[#3f4850]">{t('home.adv.hint')}</span>
              </button>
            </div>

          </div>
          </div>
        </div>

        {/* 보기 전환 (REQ-A) — 서비스 탐색과 후기 열람은 하나의 과업이므로 한 화면에 둔다 */}
        <div id="discover-views" className="max-w-[1280px] mx-auto px-6 pt-2 pb-6 scroll-mt-20">
          <div className="inline-flex gap-1 rounded-full bg-[#f1f5f9] dark:bg-[#232a36] p-1">
            {(['apps', 'type'] as const).map(v => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                className={`px-4 py-2 rounded-full text-[13px] font-bold transition-colors ${
                  view === v
                    ? 'bg-white dark:bg-[#151c27] text-[#0ea5e9] dark:text-[#8ecdff] shadow-sm'
                    : 'text-[#64748b] dark:text-[#8a94a6] hover:text-[#1e293b] dark:hover:text-[#dce3f3]'
                }`}
              >
                {t(v === 'apps' ? 'home.view.apps' : 'home.view.type')}
              </button>
            ))}
          </div>
        </div>

        {view === 'type' ? (
          <div className="max-w-[1280px] mx-auto px-6 pb-24">
            <ReviewsByType
              // 검색어·필터를 계승한다 (D11). 조건이 없으면 null 로 넘겨 전건을 보여준다.
              appIds={hasActiveConditions ? filteredApps.map(a => a.id) : null}
              filteredAppCount={filteredApps.length}
              onClearFilters={() => { clearAllFilters(); setSearchQuery(''); }}
              sort={reviewSort}
              onSortChange={setReviewSort}
            />
          </div>
        ) : (
        /* App Grid */
        <div className="max-w-[1280px] mx-auto px-6 pb-24">
          {activeFilterChips.length > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-[#64748b] dark:text-[#bec7d2] mr-1">{t('home.results')}: {filteredApps.length}</span>
              {activeFilterChips.map(chip => (
                <button key={chip.key} onClick={chip.onRemove} className="flex items-center gap-1 bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[12px] px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity">
                  {chip.label}<X className="w-3 h-3" />
                </button>
              ))}
              <button onClick={clearAllFilters} className="text-[12px] text-[#94a3b8] dark:text-[#3f4850] hover:text-[#64748b] dark:hover:text-[#8a94a6] transition-colors">{t('home.clearAll')}</button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <SearchX className="w-12 h-12 text-[#94a3b8] dark:text-[#3f4850]" />
              <div>
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-1">{t('home.errorTitle')}</p>
                <p className="text-[14px] text-[#64748b] dark:text-[#bec7d2]">{t('home.errorBody')}</p>
              </div>
              <button
                onClick={loadData}
                className="mt-2 bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[14px] px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                {t('home.retry')}
              </button>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <SearchX className="w-12 h-12 text-[#94a3b8] dark:text-[#3f4850]" />
              <div>
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-1">{t('home.emptyTitle')}</p>
                <p className="text-[14px] text-[#64748b] dark:text-[#bec7d2]">{t('home.emptyBody')}</p>
              </div>
              <button
                onClick={() => setShowSuggestModal(true)}
                className="mt-2 bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[14px] px-6 py-2.5 rounded-full hover:opacity-90 transition-opacity"
              >
                {t('home.emptySuggest')}
              </button>
              <Link
                to="/faq"
                className="text-[13px] text-[#0ea5e9] dark:text-[#8ecdff] hover:underline"
              >
                {t('home.emptyFaq')}
              </Link>
            </div>
          ) : (
            /* 좁은 창에서 1열이면 카드 하나가 폭을 다 차지하고, 정사각 이미지 때문에
               세로도 그만큼 커져 화면을 넘긴다. 단계를 촘촘히 두고 로고 높이에 상한. */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredApps.map(app => {
                const rating = computeRating(reviews, app.id);
                const reviewCount = reviews.filter(r => r.appId === app.id).length;
                return (
                  <Link key={app.id} to={`/apps/${app.id}`} className="group relative bg-[#ffffff] dark:bg-[#151c27] rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:hover:border-[#8ecdff] transition-all">
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1 max-w-[75%]">
                      {getAppLevelDisplayTags(app).map(level => (
                        <span key={level} className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[10px] tracking-[1px] uppercase px-3 py-1 rounded-full">{tag(level)}</span>
                      ))}
                    </div>
                    <div className="aspect-square max-h-[220px] bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-6 sm:p-8">
                      <AppLogoMark app={app} variant="grid" />
                    </div>
                    <div className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.5px]">{appName(app, lang)}</h3>
                        {rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#fbbf24]">★</span>
                            <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#8ecdff]">{rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-4 line-clamp-2">{appDescription(app, lang)}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">{t(SENSORY_KEY[app.sensory])}</span>
                        <span className="bg-[#ddd6fe] dark:bg-[#2e1f4a] text-[#8b5cf6] dark:text-[#c4b5fd] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">{app.style === 'exploratory' ? t('card.style.exploratory') : t('card.style.structured')}</span>
                        {reviewCount > 0 && (
                          <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">
                            {reviewCount === 1
                              ? t('card.reviewCount.one')
                              : t('card.reviewCount.other').replace('{n}', String(reviewCount))}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
        )}
      </main>

      <Footer />

      <SuggestServiceModal open={showSuggestModal} onClose={() => setShowSuggestModal(false)} />

      {/* ── Advanced Filters Drawer ────────────────────────────────────────────── */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdvancedFilters(false)} />
          <div className="relative w-[380px] h-full bg-[#ffffff] dark:bg-[#151c27] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] dark:border-[#232a36] shrink-0">
              <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t('home.adv.title')}</h2>
              <button onClick={() => setShowAdvancedFilters(false)} className="text-[#94a3b8] dark:text-[#3f4850] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Learner Type (shown only before survey is taken) */}
              {!hasTakenSurvey && (
                <section>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850]">{t('home.adv.learnerType')}</p>
                    <a href="/survey" className="text-[10px] text-[#0ea5e9] dark:text-[#8ecdff] hover:underline">{t('home.adv.takeTest')}</a>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {LEARNER_TYPE_CHIPS.map(value => (
                      <button key={value} onClick={() => setLearnerTypeFilter(p => p === value ? null : value)} className={learnerTypeFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                    ))}
                  </div>
                </section>
              )}

              {/* A: Price */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.price')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_CHIPS.map(value => (
                    <button key={value} onClick={() => setPriceFilter(p => p === value ? null : value)} className={priceFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* B: Platform */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.platform')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_CHIPS.map(value => (
                    <button key={value} onClick={() => setPlatformFilters(p => p.includes(value) ? p.filter(x => x !== value) : [...p, value])} className={platformFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* C: Teaching Language */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.teachingLang')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEACHING_LANG_CHIPS.map(value => (
                    <button key={value} onClick={() => setTeachingLangFilter(p => p === value ? null : value)} className={teachingLangFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* D: Feedback */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.feedback')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* E: Mechanism */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.mechanism')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {MECHANISM_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* F: Format */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.format')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* G: Instructor */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.instructor')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {INSTRUCTOR_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* H: Strength Areas */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.strengthArea')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {STRENGTH_AREA_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* I: Learner Fit */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.fit')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {FIT_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* J: UX / Accessibility */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.ux')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {UX_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* K: Social */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.social')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* L: Pace */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.pace')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {PACE_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

              {/* M: Authority */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">{t('home.adv.authority')}</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUTHORITY_CHIPS.map(value => (
                    <button key={value} onClick={() => toggleAdvTag(value)} className={advancedTagFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] dark:border-[#232a36] shrink-0">
              <button onClick={clearAdvancedFilters} className="text-[13px] text-[#64748b] dark:text-[#8a94a6] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors">
                {t('home.adv.reset')}
              </button>
              <button onClick={() => setShowAdvancedFilters(false)} className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[14px] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
                {t('home.adv.viewResults')} ({filteredApps.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
