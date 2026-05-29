import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Star, Upload, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchAppById, type App } from '../data/apps';
import { learnerTypes, type LearnerType } from '../data/learnerTypes';
import {
  saveUserReview,
  mapFormGoalToReviewGoal,
  usagePeriodLabels,
  type UsagePeriod,
} from '../data/reviews';

// ── Tag data ──────────────────────────────────────────────────────────────────

const STRENGTH_GROUPS = [
  {
    label: 'Great for learning',
    tags: [
      { value: 'strength.grammar_explanation', label: 'Grammar Explanation' },
      { value: 'strength.pronunciation',        label: 'Pronunciation Practice' },
      { value: 'strength.vocabulary_volume',    label: 'Vocabulary Building' },
      { value: 'strength.cultural_context',     label: 'Korean Culture' },
      { value: 'strength.real_life_phrases',    label: 'Real-life Phrases' },
      { value: 'strength.slang_trendy',         label: 'Slang & Trends' },
      { value: 'strength.formal_language',      label: 'Honorifics & Formal' },
      { value: 'strength.kpop_kdrama_context',  label: 'K-Pop / K-Drama' },
      { value: 'strength.exam_focused',         label: 'TOPIK Prep' },
    ],
  },
  {
    label: 'Content format',
    tags: [
      { value: 'format.flashcard',              label: 'Flashcards' },
      { value: 'format.video_lecture',          label: 'Video Lectures' },
      { value: 'format.native_speaker_clips',   label: 'Native Speaker Clips' },
      { value: 'format.live_action_drama',      label: 'Live-action Drama' },
      { value: 'format.whiteboard_explanation', label: 'Whiteboard Lessons' },
      { value: 'format.downloadable_pdf',       label: 'Downloadable PDF' },
      { value: 'format.subtitles_dual',         label: 'Dual Subtitles' },
    ],
  },
  {
    label: 'Great for',
    tags: [
      { value: 'fit.needs_structure', label: 'Needs Structure' },
      { value: 'fit.casual_learner',  label: 'Casual Learning' },
      { value: 'fit.kpop_fan',        label: 'K-Pop / K-Culture Fans' },
      { value: 'fit.career_focused',  label: 'Career / Exam Focus' },
      { value: 'fit.shy_speaker',     label: 'Shy Speakers' },
    ],
  },
  {
    label: 'Nice to have',
    tags: [
      { value: 'ux.offline_available',          label: 'Offline Access' },
      { value: 'ux.gamification',               label: 'Gamification' },
      { value: 'ux.short_videos',               label: 'Short Videos (5–15 min)' },
      { value: 'ux.multilingual_interface',     label: 'Multilingual UI' },
      { value: 'social.live_class_option',      label: 'Live Classes' },
      { value: 'social.community_forum',        label: 'Learning Community' },
    ],
  },
];

const LIMIT_TAGS = [
  { value: 'limit.weak_in_speaking',              label: 'Weak in Speaking' },
  { value: 'limit.weak_in_writing',               label: 'Weak in Writing' },
  { value: 'limit.weak_in_advanced',              label: 'Lacks Advanced Content' },
  { value: 'limit.weak_in_grammar',               label: 'Lacks Grammar Explanation' },
  { value: 'limit.weak_in_reading',               label: 'Weak in Reading' },
  { value: 'limit.no_human_feedback',             label: 'No Human Feedback' },
  { value: 'limit.voice_recognition_unreliable',  label: 'Unreliable Voice Recognition' },
  { value: 'limit.requires_supplementary',        label: 'Best with Supplements' },
  { value: 'limit.no_certification',              label: 'No Certificate' },
];

const CHIP_OFF = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]';
const CHIP_ON  = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent';
const CHIP_LIMIT_ON = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f59e0b] text-white border-transparent';

type ReviewFieldKey = 'nickname' | 'rating' | 'content';

export default function ReviewWrite() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp] = useState<App | null>(null);
  const [learnerType, setLearnerType] = useState<LearnerType | null>(null);
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState<'beginner' | 'elementary' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<'topik' | 'daily' | 'business' | 'culture'>('daily');
  const [usagePeriod, setUsagePeriod] = useState<UsagePeriod>('lt1w');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [chosenStrengths, setChosenStrengths] = useState<string[]>([]);
  const [chosenLimits, setChosenLimits] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<Set<number>>(new Set([0]));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ReviewFieldKey, string>>>({});
  const [scrollToField, setScrollToField] = useState<ReviewFieldKey | null>(null);

  const nicknameBlockRef = useRef<HTMLDivElement>(null);
  const ratingBlockRef = useRef<HTMLDivElement>(null);
  const contentBlockRef = useRef<HTMLDivElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedType = localStorage.getItem('narsha-learner-type') as LearnerType | null;
    if (!savedType) {
      localStorage.setItem('narsha-return-app-id', id ?? '');
      navigate('/survey');
      return;
    }
    setLearnerType(savedType);
  }, [navigate, id]);

  useEffect(() => {
    if (!id) return;
    fetchAppById(id).then(setApp).catch(console.error);
  }, [id]);

  useEffect(() => {
    if (!scrollToField) return;
    const blockRefs: Record<ReviewFieldKey, React.RefObject<HTMLDivElement | null>> = {
      nickname: nicknameBlockRef,
      rating: ratingBlockRef,
      content: contentBlockRef,
    };
    const el = blockRefs[scrollToField].current;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (scrollToField === 'nickname') {
      nicknameInputRef.current?.focus();
    } else if (scrollToField === 'content') {
      contentTextareaRef.current?.focus();
    } else if (scrollToField === 'rating') {
      const firstStar = ratingBlockRef.current?.querySelector('button');
      (firstStar as HTMLButtonElement | undefined)?.focus();
    }
    setScrollToField(null);
  }, [scrollToField]);

  if (!app || !learnerType) {
    return null;
  }

  const typeInfo = learnerTypes[learnerType];

  const toggleStrength = (tag: string) => {
    if (chosenStrengths.includes(tag)) {
      setChosenStrengths(p => p.filter(t => t !== tag));
    } else {
      if (chosenStrengths.length >= 3) {
        toast.info('Up to 3 strengths can be selected.');
        return;
      }
      setChosenStrengths(p => [...p, tag]);
    }
  };

  const toggleLimit = (tag: string) => {
    if (chosenLimits.includes(tag)) {
      setChosenLimits(p => p.filter(t => t !== tag));
    } else {
      if (chosenLimits.length >= 2) {
        toast.info('Up to 2 limitations can be selected.');
        return;
      }
      setChosenLimits(p => [...p, tag]);
    }
  };

  const toggleGroup = (idx: number) =>
    setOpenGroups(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: Partial<Record<ReviewFieldKey, string>> = {};
    if (!nickname.trim()) errors.nickname = 'Please enter a nickname.';
    if (rating < 1) errors.rating = 'Please select a star rating.';
    if (!content.trim()) errors.content = 'Please enter your review.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const order: ReviewFieldKey[] = ['nickname', 'rating', 'content'];
      const firstInvalid = order.find((key) => errors[key]);
      if (firstInvalid) setScrollToField(firstInvalid);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      await saveUserReview({
        appId: app.id,
        nickname: nickname.trim(),
        learnerType,
        level,
        goal: mapFormGoalToReviewGoal(goal),
        usagePeriod,
        rating,
        content: content.trim(),
        contentKo: '',
        chosenStrengths,
        chosenLimits,
      });
      setSubmitted(true);
      setTimeout(() => navigate(`/apps/${app.id}`), 2000);
    } catch (err) {
      console.error(err);
      setFieldErrors({ content: 'Failed to submit review. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center mx-auto mb-6 shadow-[0px_0px_40px_0px_rgba(142,205,255,0.4)]">
            <Check className="w-12 h-12 text-[#00344f]" />
          </div>
          <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[36px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
            Review Submitted!
          </h2>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2]">
            Redirecting to app page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-16">
          <div className="mb-12">
            <Link
              to={`/apps/${app.id}`}
              className="inline-flex items-center gap-2 font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] mb-4 transition-colors"
            >
              ← Back to {app.name}
            </Link>

            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] leading-[56px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px] mb-4">
              Share Your Journey
            </h1>

            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2]">
              Help others navigate their Korean learning path with an editorial perspective.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Step 1: Identity Verification */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">1</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  Identity Verification
                </h2>
              </div>

              <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-8 border border-[#e2e8f0] dark:border-[#232a36]">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                    <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] text-[#00344f]">
                      {learnerType}
                    </span>
                  </div>
                  <div>
                    <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
                      Detected Learner Type
                    </div>
                    <h3 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                      Type {learnerType}: {typeInfo.name}
                    </h3>
                  </div>
                </div>

                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-6">
                  Your learning patterns suggest a high affinity for cinematic content and wisdom-based curriculum. This badge will appear next to your review.
                </p>

                <div ref={nicknameBlockRef}>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Nickname <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
                  </label>
                  <input
                    ref={nicknameInputRef}
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      if (fieldErrors.nickname) {
                        setFieldErrors((prev) => { const n = { ...prev }; delete n.nickname; return n; });
                      }
                    }}
                    placeholder="Enter your display name"
                    aria-invalid={Boolean(fieldErrors.nickname)}
                    aria-describedby={fieldErrors.nickname ? 'review-nickname-error' : undefined}
                    className={`w-full bg-[#ffffff] dark:bg-[#151c27] border rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff] ${
                      fieldErrors.nickname
                        ? 'border-[#ef4444] dark:border-[#f87171] ring-1 ring-[#ef4444]/40'
                        : 'border-[#e2e8f0] dark:border-[#232a36]'
                    }`}
                  />
                  {fieldErrors.nickname && (
                    <p id="review-nickname-error" className="mt-2 text-[14px] text-[#ef4444] dark:text-[#f87171] font-['Inter:Regular',sans-serif]">
                      {fieldErrors.nickname}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Learning Context */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">2</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  Learning Context
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Learning Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as typeof level)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    <option value="beginner">Beginner (TOPIK I)</option>
                    <option value="elementary">Elementary (TOPIK II)</option>
                    <option value="intermediate">Intermediate (TOPIK III-IV)</option>
                    <option value="advanced">Advanced (TOPIK V-VI)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Usage Period
                  </label>
                  <select
                    value={usagePeriod}
                    onChange={(e) => setUsagePeriod(e.target.value as UsagePeriod)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    {(Object.keys(usagePeriodLabels) as UsagePeriod[]).map((key) => (
                      <option key={key} value={key}>{usagePeriodLabels[key]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Learning Purpose
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'entertainment', label: 'Entertainment' },
                      { value: 'business', label: 'Business Proficiency' },
                      { value: 'academic', label: 'Academic Research' },
                      { value: 'topik', label: 'TOPIK Preparation' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value as typeof goal)}
                        className={`px-6 py-3 rounded-[8px] font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                          goal === option.value
                            ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                            : 'bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: The Critique */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">3</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  The Critique
                </h2>
              </div>

              <div className="space-y-6">
                <div ref={ratingBlockRef} className="mb-6">
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3 text-center">
                    Overall Rating <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
                  </label>
                  <div
                    className={`flex items-center justify-center gap-4 rounded-[12px] py-2 px-2 ${
                      fieldErrors.rating ? 'ring-2 ring-[#ef4444]/50 dark:ring-[#f87171]/50' : ''
                    }`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRating(star);
                          if (fieldErrors.rating) {
                            setFieldErrors((prev) => { const n = { ...prev }; delete n.rating; return n; });
                          }
                        }}
                        className="transition-transform hover:scale-110 p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ea5e9] dark:focus-visible:ring-[#8ecdff]"
                      >
                        <Star
                          className={`pointer-events-none w-12 h-12 ${
                            star <= rating
                              ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]'
                              : 'text-[#cbd5e1] dark:text-[#3f4850]'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {fieldErrors.rating && (
                    <p className="mt-2 text-center text-[14px] text-[#ef4444] dark:text-[#f87171] font-['Inter:Regular',sans-serif]">
                      {fieldErrors.rating}
                    </p>
                  )}
                </div>

                {/* Strength tags */}
                <div className="space-y-3">
                  <div>
                    <p className="font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3]">
                      What are this service's strengths?{' '}
                      <span className="font-normal text-[#64748b] dark:text-[#bec7d2]">
                        (up to 3{chosenStrengths.length > 0 ? ` · ${chosenStrengths.length} selected` : ''}, optional)
                      </span>
                    </p>
                  </div>
                  {STRENGTH_GROUPS.map((group, idx) => (
                    <div key={group.label} className="border border-[#e2e8f0] dark:border-[#232a36] rounded-[12px] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleGroup(idx)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#f8fafc] dark:bg-[#1e293b] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36] transition-colors"
                      >
                        <span className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3]">
                          {group.label}
                          {group.tags.filter(t => chosenStrengths.includes(t.value)).length > 0 && (
                            <span className="ml-2 bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              {group.tags.filter(t => chosenStrengths.includes(t.value)).length}
                            </span>
                          )}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[#64748b] dark:text-[#8a94a6] transition-transform ${openGroups.has(idx) ? 'rotate-180' : ''}`} />
                      </button>
                      {openGroups.has(idx) && (
                        <div className="px-4 py-3 flex flex-wrap gap-1.5">
                          {group.tags.map(tag => (
                            <button
                              key={tag.value}
                              type="button"
                              onClick={() => toggleStrength(tag.value)}
                              className={chosenStrengths.includes(tag.value) ? CHIP_ON : CHIP_OFF}
                            >
                              {tag.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Limit tags */}
                <div>
                  <p className="font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    What could be improved?{' '}
                    <span className="font-normal text-[#64748b] dark:text-[#bec7d2]">
                      (up to 2{chosenLimits.length > 0 ? ` · ${chosenLimits.length} selected` : ''}, optional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIMIT_TAGS.map(tag => (
                      <button
                        key={tag.value}
                        type="button"
                        onClick={() => toggleLimit(tag.value)}
                        className={chosenLimits.includes(tag.value) ? CHIP_LIMIT_ON : CHIP_OFF}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={contentBlockRef}>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Your Review <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
                  </label>
                  <textarea
                    ref={contentTextareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      if (fieldErrors.content) {
                        setFieldErrors((prev) => { const n = { ...prev }; delete n.content; return n; });
                      }
                    }}
                    placeholder="Describe the curriculum's depth, cultural nuances, and pedagogical effectiveness..."
                    rows={6}
                    aria-invalid={Boolean(fieldErrors.content)}
                    aria-describedby={fieldErrors.content ? 'review-content-error' : undefined}
                    className={`w-full bg-[#ffffff] dark:bg-[#151c27] border rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff] resize-none ${
                      fieldErrors.content
                        ? 'border-[#ef4444] dark:border-[#f87171] ring-1 ring-[#ef4444]/40'
                        : 'border-[#e2e8f0] dark:border-[#232a36]'
                    }`}
                  />
                  {fieldErrors.content && (
                    <p id="review-content-error" className="mt-2 text-[14px] text-[#ef4444] dark:text-[#f87171] font-['Inter:Regular',sans-serif]">
                      {fieldErrors.content}
                    </p>
                  )}
                </div>

                <div className="border-2 border-dashed border-[#cbd5e1] dark:border-[#3f4850] rounded-[12px] p-12 text-center hover:border-[#0ea5e9] dark:hover:border-[#8ecdff] transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-[#94a3b8] dark:text-[#64748b] mx-auto mb-4" />
                  <div className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
                    Upload Photo
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                    Showcase your progress or curriculum notes
                  </div>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              {Object.keys(fieldErrors).length > 0 && (
                <div className="mb-4 rounded-[8px] border border-[#fecaca] dark:border-[#7f1d1d]/60 bg-[#fef2f2] dark:bg-[#1c1214] px-4 py-3" role="alert">
                  <p className="font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#b91c1c] dark:text-[#f87171] mb-2">
                    Please complete the following.
                  </p>
                  <ul className="list-disc list-inside space-y-1 font-['Inter:Regular',sans-serif] text-[14px] text-[#dc2626] dark:text-[#fca5a5]">
                    {fieldErrors.nickname && <li>{fieldErrors.nickname}</li>}
                    {fieldErrors.rating && <li>{fieldErrors.rating}</li>}
                    {fieldErrors.content && <li>{fieldErrors.content}</li>}
                  </ul>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] px-8 py-5 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>

              <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-[#64748b] dark:text-[#bec7d2] text-center mt-4">
                By submitting, you agree to our Editorial Guidelines and content moderation policies.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
