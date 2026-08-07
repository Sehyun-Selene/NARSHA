import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, X, SlidersHorizontal, SearchX } from 'lucide-react';
import SuggestServiceModal from '../components/SuggestServiceModal';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppLogoMark } from '../components/AppLogoMark';
import { fetchApps, getAppLevelDisplayTags, appDescription, appName, type App } from '../data/apps';
import { getAllReviews, type Review } from '../data/reviews';
import { applySearch } from '../data/searchKeywords';
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

const SENSORY_KEY = {
  visual:   'card.sensory.visual',
  auditory: 'card.sensory.auditory',
  mixed:    'card.sensory.mixed',
} as const;

const CHIP_OFF = "whitespace-nowrap text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]";
const CHIP_ON  = "whitespace-nowrap text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent";

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

  // Data
  const [apps, setApps] = useState<App[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Quick filters (4 axes)
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [purposeFilter, setPurposeFilter] = useState<string | null>(null);
  const [learnerTypeFilter, setLearnerTypeFilter] = useState<string | null>(null);
  const [differentiatorFilters, setDifferentiatorFilters] = useState<string[]>([]);

  // Advanced filters (groups A–M)
  const [priceFilter, setPriceFilter] = useState<string | null>(null);          // A
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);         // B
  const [teachingLangFilter, setTeachingLangFilter] = useState<string | null>(null); // C
  const [advancedTagFilters, setAdvancedTagFilters] = useState<string[]>([]);   // D–M

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
  const heroSize = 'text-[2.625rem] md:text-[2.125rem] lg:text-[3rem] xl:text-[3.625rem]';

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

  const filteredApps = apps.filter((app: App) => {
    const q = searchQuery.trim().toLowerCase();

    if (!applySearch(app, q)) return false;

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

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <div className="max-w-[1280px] mx-auto px-6 min-h-[calc(100vh-4rem)] pt-14 pb-10 flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-6 w-full">
            <h1 className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold ${heroSize} leading-[1.12] tracking-[-0.042em] text-center bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] pb-[0.1em] overflow-visible px-1`}>
              {tLines('home.hero.title').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            <div className="text-center max-w-[672px] flex flex-col gap-1">
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
            </div>
          </div>

          {/* Search + chip filters */}
          <div className="w-full max-w-[768px] flex flex-col gap-3">

            {/* Search bar */}
            <div className="relative">
              <div className="bg-[#f1f5f9] dark:bg-[#070e19] rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
                <div className="flex items-center pl-16 pr-6 py-6">
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
                  className={`absolute left-16 top-1/2 -translate-y-1/2 pointer-events-none font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#94a3b8] dark:text-[#3f4850] transition-opacity duration-300 ${placeholderVisible ? 'opacity-100' : 'opacity-0'}`}
                >
                  {placeholders[placeholderIdx]}
                </span>
              )}
            </div>

            {/* Chip filter rows (all on one line) */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">{t('home.axis.level')}</span>
                <div className="flex flex-wrap gap-1">
                  {LEVEL_CHIPS.map(value => (
                    <button key={value} onClick={() => setLevelFilter(p => p === value ? null : value)} className={levelFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">{t('home.axis.purpose')}</span>
                <div className="flex flex-wrap gap-1">
                  {PURPOSE_CHIPS.map(value => (
                    <button key={value} onClick={() => setPurposeFilter(p => p === value ? null : value)} className={purposeFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </div>
              {hasTakenSurvey && (
                <div className="flex items-center gap-2">
                  <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">{t('home.axis.type')}</span>
                  <div className="flex flex-wrap gap-1">
                    {LEARNER_TYPE_CHIPS.map(value => (
                      <button key={value} onClick={() => setLearnerTypeFilter(p => p === value ? null : value)} className={learnerTypeFilter === value ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">{t('home.axis.strengths')}</span>
                <div className="flex flex-wrap gap-1">
                  {DIFFERENTIATOR_CHIPS.map(value => (
                    <button key={value} onClick={() => setDifferentiatorFilters(p => p.includes(value) ? p.filter(x => x !== value) : [...p, value])} className={differentiatorFilters.includes(value) ? CHIP_ON : CHIP_OFF}>{tag(value)}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Filters button */}
            <div className="mt-2 pt-3 border-t border-[#e2e8f0] dark:border-[#232a36]">
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

        {/* App Grid */}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className="aspect-square bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-6 sm:p-8">
                      <AppLogoMark app={app} variant="grid" />
                    </div>
                    <div className="p-6">
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
