import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppLogoMark } from '../components/AppLogoMark';
import { fetchApps, getAppLevelDisplayTags, type App } from '../data/apps';
import { getAllReviews, type Review } from '../data/reviews';
import { applySearch } from '../data/searchKeywords';

// ── Placeholder rotation ──────────────────────────────────────────────────────

const PLACEHOLDERS = [
  "e.g. TOPIK Intermediate...",
  "e.g. Pronunciation Practice...",
  "e.g. Free K-Pop Apps...",
  "e.g. Duolingo...",
  "e.g. Listening for Beginners...",
  "e.g. Grammar in English...",
  "e.g. YouTube Channels...",
  "e.g. 1-on-1 Tutoring...",
];

// ── Quick filter chip axes ────────────────────────────────────────────────────

const LEVEL_CHIPS = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'elementary',   label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced',     label: 'Advanced' },
];

const PURPOSE_CHIPS = [
  { value: 'topikPreparation',    label: 'TOPIK' },
  { value: 'academic',            label: 'Academic' },
  { value: 'businessProficiency', label: 'Business' },
  { value: 'entertainment',       label: 'K-Content' },
];

const LEARNER_TYPE_CHIPS = [
  { value: '가', label: '가 Vis·Open'   },
  { value: '나', label: '나 Vis·Guided' },
  { value: '다', label: '다 Aud·Open'   },
  { value: '라', label: '라 Aud·Guided' },
  { value: '마', label: '마 Mix·Open'   },
  { value: '바', label: '바 Mix·Guided' },
];

// Axis 4 — 8 key differentiators (multi-select)
const DIFFERENTIATOR_CHIPS = [
  { value: 'strength.grammar_explanation',  label: 'Grammar'      },
  { value: 'strength.pronunciation',        label: 'Pronunciation' },
  { value: 'strength.vocabulary_volume',    label: 'Vocabulary'   },
  { value: 'strength.kpop_kdrama_context',  label: 'K-Pop'        },
  { value: 'strength.exam_focused',         label: 'TOPIK Prep'   },
  { value: 'social.live_class_option',      label: 'Live Classes' },
  { value: 'ux.offline_available',          label: 'Offline'      },
  { value: 'format.flashcard',              label: 'Flashcard'    },
];

// ── Advanced filter chip data (Groups A–M) ────────────────────────────────────

// Group A: Price (single-select, app.pricing[])
const PRICE_CHIPS = [
  { value: 'free',               label: 'Free'         },
  { value: 'freemium',           label: 'Free + Paid'  },
  { value: 'one-time purchase',  label: 'One-time'     },
  { value: 'subscription-only', label: 'Subscription' },
];

// Group B: Platform (multi-select, app.platform[])
const PLATFORM_CHIPS = [
  { value: 'iOS',            label: 'iOS'     },
  { value: 'Android',        label: 'Android' },
  { value: 'Website',        label: 'Web'     },
  { value: 'youtubeChannel', label: 'YouTube' },
];

// Group C: Teaching Language (single-select, app.teachingLanguage[])
const TEACHING_LANG_CHIPS = [
  { value: 'lang.english',             label: 'English'      },
  { value: 'lang.japanese',            label: 'Japanese'     },
  { value: 'lang.chinese',             label: 'Chinese'      },
  { value: 'lang.vietnamese',          label: 'Vietnamese'   },
  { value: 'lang.spanish',             label: 'Spanish'      },
  { value: 'lang.french',              label: 'French'       },
  { value: 'lang.german',              label: 'German'       },
  { value: 'lang.italian',             label: 'Italian'      },
  { value: 'lang.portuguese',          label: 'Portuguese'   },
  { value: 'lang.russian',             label: 'Russian'      },
  { value: 'lang.arabic',              label: 'Arabic'       },
  { value: 'lang.turkish',             label: 'Turkish'      },
  { value: 'lang.dutch',               label: 'Dutch'        },
  { value: 'lang.polish',              label: 'Polish'       },
  { value: 'lang.indonesian',          label: 'Indonesian'   },
  { value: 'lang.hindi',               label: 'Hindi'        },
  { value: 'lang.korean',              label: 'Korean (meta)'},
  { value: 'lang.user_defined',        label: 'User-defined' },
  { value: 'lang.tutor_dependent',     label: 'Tutor-set'    },
  { value: 'lang.multilingual_20plus', label: '20+ Languages'},
];

// Group D: Realtime Feedback (multi-select, app.realtimeFeedback[])
const FEEDBACK_CHIPS = [
  { value: 'aiFeedback',    label: 'AI Feedback'    },
  { value: 'humanFeedback', label: 'Human / Tutor'  },
  { value: 'noFeedback',    label: 'No Feedback'    },
];

// Groups E–M: all query app.differentiators[]

// Group E: Learning Mechanism
const MECHANISM_CHIPS = [
  { value: 'mechanism.active_recall',       label: 'Active Recall'       },
  { value: 'mechanism.self_assessment',     label: 'Self-assessment'     },
  { value: 'mechanism.scenario_based',      label: 'Real-life Scenarios' },
  { value: 'mechanism.numbered_curriculum', label: 'Step-by-step Path'   },
  { value: 'mechanism.textbook_aligned',    label: 'Textbook-aligned'    },
  { value: 'mechanism.topic_based',         label: 'Topic-based'         },
  { value: 'mechanism.bite_sized_lessons',  label: 'Bite-sized'          },
];

// Group F: Content Format (excludes format.flashcard already in axis 4)
const FORMAT_CHIPS = [
  { value: 'format.video_lecture',          label: 'Video Lecture'      },
  { value: 'format.native_speaker_clips',   label: 'Native Clips'       },
  { value: 'format.animated_lesson',        label: 'Animation'          },
  { value: 'format.live_action_drama',      label: 'Live-action Drama'  },
  { value: 'format.whiteboard_explanation', label: 'Whiteboard'         },
  { value: 'format.text_with_audio',        label: 'Text + Audio'       },
  { value: 'format.handwriting_practice',   label: 'Handwriting'        },
  { value: 'format.downloadable_pdf',       label: 'PDF Download'       },
  { value: 'format.subtitles_dual',         label: 'Dual Subtitles'     },
];

// Group G: Instructor
const INSTRUCTOR_CHIPS = [
  { value: 'instructor.native_speaker',   label: 'Native Speaker'    },
  { value: 'instructor.foreign_learner',  label: 'Foreign Learner'   },
  { value: 'instructor.bilingual_tutor',  label: 'Bilingual Tutor'   },
  { value: 'instructor.institutional',    label: 'Institutional'     },
  { value: 'instructor.community_built',  label: 'Community-built'   },
];

// Group H: Strength Areas (excludes the 8 already in axis 4)
const STRENGTH_AREA_CHIPS = [
  { value: 'strength.cultural_context',  label: 'Korean Culture'  },
  { value: 'strength.real_life_phrases', label: 'Real Phrases'    },
  { value: 'strength.slang_trendy',      label: 'Slang & Trends'  },
  { value: 'strength.formal_language',   label: 'Honorifics'      },
];

// Group I: Learner Fit
const FIT_CHIPS = [
  { value: 'fit.needs_structure', label: 'Needs Structure'   },
  { value: 'fit.casual_learner',  label: 'Casual Learner'    },
  { value: 'fit.kpop_fan',        label: 'K-Pop Fan'         },
  { value: 'fit.career_focused',  label: 'Career Focus'      },
  { value: 'fit.shy_speaker',     label: 'Shy Speaker'       },
];

// Group J: Accessibility / UX (excludes ux.offline_available already in axis 4)
const UX_CHIPS = [
  { value: 'ux.gamification',         label: 'Gamification'    },
  { value: 'ux.short_videos',         label: 'Short Videos'    },
  { value: 'ux.long_form_content',    label: 'Long-form'       },
  { value: 'ux.multilingual_interface', label: 'Multilingual UI' },
];

// Group K: Social (excludes social.live_class_option already in axis 4)
const SOCIAL_CHIPS = [
  { value: 'social.community_forum',         label: 'Community Forum'     },
  { value: 'social.peer_interaction',        label: 'Peer Interaction'    },
  { value: 'social.companion_service_paid',  label: 'Companion (paid)'    },
];

// Group L: Learning Pace
const PACE_CHIPS = [
  { value: 'pace.daily_short_session', label: 'Daily 5–15 min'  },
  { value: 'pace.deep_dive_session',   label: '30 min+ Dive'    },
  { value: 'pace.flexible_pacing',     label: 'Flexible Pace'   },
];

// Group M: Content Authority
const AUTHORITY_CHIPS = [
  { value: 'authority.official_curriculum', label: 'Official Curriculum' },
  { value: 'authority.expert_designed',     label: 'Expert-designed'     },
  { value: 'authority.research_backed',     label: 'Research-backed'     },
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

// ── Label lookups ─────────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = Object.fromEntries(LEVEL_CHIPS.map(c => [c.value, c.label]));
const PURPOSE_LABELS: Record<string, string> = Object.fromEntries(PURPOSE_CHIPS.map(c => [c.value, c.label]));
const LEARNER_TYPE_LABELS: Record<string, string> = Object.fromEntries(LEARNER_TYPE_CHIPS.map(c => [c.value, c.label]));
const DIFFERENTIATOR_LABELS: Record<string, string> = Object.fromEntries(DIFFERENTIATOR_CHIPS.map(c => [c.value, c.label]));
const PRICE_LABELS: Record<string, string> = Object.fromEntries(PRICE_CHIPS.map(c => [c.value, c.label]));
const PLATFORM_LABELS: Record<string, string> = Object.fromEntries(PLATFORM_CHIPS.map(c => [c.value, c.label]));

// Combined label map for all advanced filter tags (groups C–M)
const ADVANCED_TAG_LABELS: Record<string, string> = Object.fromEntries([
  ...TEACHING_LANG_CHIPS,
  ...FEEDBACK_CHIPS,
  ...MECHANISM_CHIPS,
  ...FORMAT_CHIPS,
  ...INSTRUCTOR_CHIPS,
  ...STRENGTH_AREA_CHIPS,
  ...FIT_CHIPS,
  ...UX_CHIPS,
  ...SOCIAL_CHIPS,
  ...PACE_CHIPS,
  ...AUTHORITY_CHIPS,
].map(c => [c.value, c.label]));

// ── Misc constants ────────────────────────────────────────────────────────────

const LEARNER_TYPE_MAP: Record<string, { sensory: string[]; style: string }> = {
  '가': { sensory: ['visual'], style: 'exploratory' },
  '나': { sensory: ['visual'], style: 'structured' },
  '다': { sensory: ['auditory'], style: 'exploratory' },
  '라': { sensory: ['auditory'], style: 'structured' },
  '마': { sensory: ['visual', 'auditory', 'mixed'], style: 'exploratory' },
  '바': { sensory: ['visual', 'auditory', 'mixed'], style: 'structured' },
};

const CHIP_OFF = "whitespace-nowrap text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]";
const CHIP_ON  = "whitespace-nowrap text-[11px] px-2 py-1 rounded-full border transition-all cursor-pointer font-['Manrope:Medium',sans-serif] font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent";

function computeRating(reviews: Review[], appId: string): number {
  const appReviews = reviews.filter(r => r.appId === appId);
  if (appReviews.length === 0) return 0;
  return appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function Home() {
  // Data
  const [apps, setApps] = useState<App[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Placeholder rotation
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);

  useEffect(() => {
    Promise.all([fetchApps(), getAllReviews()])
      .then(([appsData, reviewsData]) => {
        setApps(appsData);
        setReviews(reviewsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery) return;
    setPlaceholderVisible(true);
    let timerId: ReturnType<typeof setTimeout>;
    const intervalId = setInterval(() => {
      setPlaceholderVisible(false);
      timerId = setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % PLACEHOLDERS.length);
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
      const groupValues = group.map(c => c.value);
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
  };

  const advancedFilterCount =
    (priceFilter ? 1 : 0) +
    platformFilters.length +
    (teachingLangFilter ? 1 : 0) +
    advancedTagFilters.length;

  const toggleAdvTag = (tag: string) =>
    setAdvancedTagFilters(prev =>
      prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]
    );

  const activeFilterChips = [
    ...(levelFilter ? [{ key: 'level', label: LEVEL_LABELS[levelFilter], onRemove: () => setLevelFilter(null) }] : []),
    ...(purposeFilter ? [{ key: 'purpose', label: PURPOSE_LABELS[purposeFilter], onRemove: () => setPurposeFilter(null) }] : []),
    ...(learnerTypeFilter ? [{ key: 'type', label: LEARNER_TYPE_LABELS[learnerTypeFilter], onRemove: () => setLearnerTypeFilter(null) }] : []),
    ...differentiatorFilters.map(df => ({ key: df, label: DIFFERENTIATOR_LABELS[df], onRemove: () => setDifferentiatorFilters(p => p.filter(x => x !== df)) })),
    ...(priceFilter ? [{ key: 'price', label: PRICE_LABELS[priceFilter], onRemove: () => setPriceFilter(null) }] : []),
    ...platformFilters.map(pf => ({ key: `plat-${pf}`, label: PLATFORM_LABELS[pf], onRemove: () => setPlatformFilters(p => p.filter(x => x !== pf)) })),
    ...(teachingLangFilter ? [{ key: 'tlang', label: ADVANCED_TAG_LABELS[teachingLangFilter], onRemove: () => setTeachingLangFilter(null) }] : []),
    ...advancedTagFilters.map(t => ({ key: `adv-${t}`, label: ADVANCED_TAG_LABELS[t], onRemove: () => setAdvancedTagFilters(p => p.filter(x => x !== t)) })),
  ];

  // ── JSX ─────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <div className="max-w-[1280px] mx-auto px-6 min-h-[calc(100vh-4rem)] pt-14 pb-10 flex flex-col items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-6 w-full">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(2.625rem,5vw+1.125rem,5.375rem)] leading-[1.12] tracking-[-0.042em] text-center bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] pb-[0.1em] overflow-visible px-1">
              Find your path to fluency.
            </h1>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2] text-center max-w-[672px]">
              Discover, compare, and master Korean with our architecturally curated<br />
              database of the world's best language resources.
            </p>
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
                  {PLACEHOLDERS[placeholderIdx]}
                </span>
              )}
            </div>

            {/* Chip filter rows (all on one line) */}
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">Level</span>
                <div className="flex flex-wrap gap-1">
                  {LEVEL_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => setLevelFilter(p => p === chip.value ? null : chip.value)} className={levelFilter === chip.value ? CHIP_ON : CHIP_OFF}>{chip.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">Purpose</span>
                <div className="flex flex-wrap gap-1">
                  {PURPOSE_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => setPurposeFilter(p => p === chip.value ? null : chip.value)} className={purposeFilter === chip.value ? CHIP_ON : CHIP_OFF}>{chip.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">Type</span>
                <div className="flex flex-wrap gap-1">
                  {LEARNER_TYPE_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => setLearnerTypeFilter(p => p === chip.value ? null : chip.value)} className={learnerTypeFilter === chip.value ? CHIP_ON : CHIP_OFF}>{chip.label}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="min-w-[58px] text-[11px] text-[#94a3b8] dark:text-[#3f4850] text-right shrink-0">Strengths</span>
                <div className="flex flex-wrap gap-1">
                  {DIFFERENTIATOR_CHIPS.map(chip => (
                    <button key={chip.value} onClick={() => setDifferentiatorFilters(p => p.includes(chip.value) ? p.filter(x => x !== chip.value) : [...p, chip.value])} className={differentiatorFilters.includes(chip.value) ? CHIP_ON : CHIP_OFF}>{chip.label}</button>
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
                Advanced Filters
                {advancedFilterCount > 0 && (
                  <span className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {advancedFilterCount}
                  </span>
                )}
                <span className="text-[#94a3b8] dark:text-[#3f4850]">(price, platform, language…)</span>
              </button>
            </div>

          </div>
        </div>

        {/* App Grid */}
        <div className="max-w-[1280px] mx-auto px-6 pb-24">
          {activeFilterChips.length > 0 && (
            <div className="mb-6 flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-[#64748b] dark:text-[#bec7d2] mr-1">Results: {filteredApps.length}</span>
              {activeFilterChips.map(chip => (
                <button key={chip.key} onClick={chip.onRemove} className="flex items-center gap-1 bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[12px] px-2.5 py-1 rounded-full hover:opacity-80 transition-opacity">
                  {chip.label}<X className="w-3 h-3" />
                </button>
              ))}
              <button onClick={clearAllFilters} className="text-[12px] text-[#94a3b8] dark:text-[#3f4850] hover:text-[#64748b] dark:hover:text-[#8a94a6] transition-colors">Clear all</button>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredApps.map(app => {
                const rating = computeRating(reviews, app.id);
                const reviewCount = reviews.filter(r => r.appId === app.id).length;
                return (
                  <Link key={app.id} to={`/apps/${app.id}`} className="group relative bg-[#ffffff] dark:bg-[#151c27] rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:hover:border-[#8ecdff] transition-all">
                    <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1 max-w-[75%]">
                      {getAppLevelDisplayTags(app).map(label => (
                        <span key={label} className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[10px] tracking-[1px] uppercase px-3 py-1 rounded-full">{label}</span>
                      ))}
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-6 sm:p-8">
                      <AppLogoMark app={app} variant="grid" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.5px]">{app.name}</h3>
                        {rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[#fbbf24]">★</span>
                            <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#8ecdff]">{rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-4 line-clamp-2">{app.description}</p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">{app.sensory.charAt(0).toUpperCase() + app.sensory.slice(1)}</span>
                        <span className="bg-[#ddd6fe] dark:bg-[#2e1f4a] text-[#8b5cf6] dark:text-[#c4b5fd] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">{app.style === 'exploratory' ? 'Exploratory' : 'Structured'}</span>
                        {reviewCount > 0 && (
                          <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
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

      {/* ── Advanced Filters Drawer ────────────────────────────────────────────── */}
      {showAdvancedFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAdvancedFilters(false)} />
          <div className="relative w-[380px] h-full bg-[#ffffff] dark:bg-[#151c27] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#e2e8f0] dark:border-[#232a36] shrink-0">
              <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">Advanced Filters</h2>
              <button onClick={() => setShowAdvancedFilters(false)} className="text-[#94a3b8] dark:text-[#3f4850] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* A: Price */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Price</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRICE_CHIPS.map(c => (
                    <button key={c.value} onClick={() => setPriceFilter(p => p === c.value ? null : c.value)} className={priceFilter === c.value ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* B: Platform */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Platform</p>
                <div className="flex flex-wrap gap-1.5">
                  {PLATFORM_CHIPS.map(c => (
                    <button key={c.value} onClick={() => setPlatformFilters(p => p.includes(c.value) ? p.filter(x => x !== c.value) : [...p, c.value])} className={platformFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* C: Teaching Language */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Teaching Language</p>
                <div className="flex flex-wrap gap-1.5">
                  {TEACHING_LANG_CHIPS.map(c => (
                    <button key={c.value} onClick={() => setTeachingLangFilter(p => p === c.value ? null : c.value)} className={teachingLangFilter === c.value ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* D: Feedback */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Realtime Feedback</p>
                <div className="flex flex-wrap gap-1.5">
                  {FEEDBACK_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* E: Mechanism */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Learning Mechanism</p>
                <div className="flex flex-wrap gap-1.5">
                  {MECHANISM_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* F: Format */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Content Format</p>
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* G: Instructor */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Instructor</p>
                <div className="flex flex-wrap gap-1.5">
                  {INSTRUCTOR_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* H: Strength Areas */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Strength Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {STRENGTH_AREA_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* I: Learner Fit */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Learner Fit</p>
                <div className="flex flex-wrap gap-1.5">
                  {FIT_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* J: UX / Accessibility */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Accessibility & UX</p>
                <div className="flex flex-wrap gap-1.5">
                  {UX_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* K: Social */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Social Features</p>
                <div className="flex flex-wrap gap-1.5">
                  {SOCIAL_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* L: Pace */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Learning Pace</p>
                <div className="flex flex-wrap gap-1.5">
                  {PACE_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

              {/* M: Authority */}
              <section>
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#94a3b8] dark:text-[#3f4850] mb-2">Content Authority</p>
                <div className="flex flex-wrap gap-1.5">
                  {AUTHORITY_CHIPS.map(c => (
                    <button key={c.value} onClick={() => toggleAdvTag(c.value)} className={advancedTagFilters.includes(c.value) ? CHIP_ON : CHIP_OFF}>{c.label}</button>
                  ))}
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e2e8f0] dark:border-[#232a36] shrink-0">
              <button onClick={clearAdvancedFilters} className="text-[13px] text-[#64748b] dark:text-[#8a94a6] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors">
                Reset
              </button>
              <button onClick={() => setShowAdvancedFilters(false)} className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[14px] px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity">
                View results ({filteredApps.length})
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
