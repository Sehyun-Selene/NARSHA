import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Star, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchAppById, type App } from '../data/apps';
import { learnerTypes, type LearnerType } from '../data/learnerTypes';
import {
  saveUserReview,
  reviewSubmitErrorKey,
  mapFormGoalToReviewGoal,
  hasDuplicateReview,
  usagePeriodLabels,
  type UsagePeriod,
} from '../data/reviews';
import { useT } from '../i18n';
import type { StringKey } from '../i18n';

// ── Tag data ──────────────────────────────────────────────────────────────────
// 칩 라벨은 여기서 들고 있지 않는다 — 값(value)만 두고 표시 시점에 `tagLabel()` 로
// 조회한다. 라벨을 여기에 복제하면 i18n/tags.ts 와 두 곳이 어긋난다.

const STRENGTH_GROUPS = [
  {
    labelKey: 'review.tagGroup.learning',
    values: [
      'strength.grammar_explanation',
      'strength.pronunciation',
      'strength.vocabulary_volume',
      'strength.cultural_context',
      'strength.real_life_phrases',
      'strength.slang_trendy',
      'strength.formal_language',
      'strength.kpop_kdrama_context',
      'strength.exam_focused',
    ],
  },
  {
    labelKey: 'review.tagGroup.format',
    values: [
      'format.flashcard',
      'format.video_lecture',
      'format.native_speaker_clips',
      'format.live_action_drama',
      'format.whiteboard_explanation',
      'format.downloadable_pdf',
      'format.subtitles_dual',
    ],
  },
  {
    labelKey: 'review.tagGroup.fit',
    values: [
      'fit.needs_structure',
      'fit.casual_learner',
      'fit.kpop_fan',
      'fit.career_focused',
      'fit.shy_speaker',
    ],
  },
  {
    labelKey: 'review.tagGroup.nice',
    values: [
      'ux.offline_available',
      'ux.gamification',
      'ux.short_videos',
      'ux.multilingual_interface',
      'social.live_class_option',
      'social.community_forum',
    ],
  },
] as const;

const LIMIT_TAGS = [
  'limit.weak_in_speaking',
  'limit.weak_in_writing',
  'limit.weak_in_advanced',
  'limit.weak_in_grammar',
  'limit.weak_in_reading',
  'limit.no_human_feedback',
  'limit.voice_recognition_unreliable',
  'limit.requires_supplementary',
  'limit.no_certification',
];

const CHIP_OFF = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]';
const CHIP_ON  = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent';
const CHIP_LIMIT_ON = 'text-[12px] px-2.5 py-1 rounded-full border transition-all cursor-pointer font-medium bg-[#f59e0b] text-white border-transparent';

type ReviewFieldKey = 'nickname' | 'rating' | 'content';

// 입력 검증 기준 (GNB PRD REQ-E / E-2)
const NICKNAME_MIN = 2;
const NICKNAME_MAX = 20;
const CONTENT_MIN = 20;
const CONTENT_MAX = 2000;

export default function ReviewWrite() {
  const { id } = useParams<{ id: string }>();
  const { t, tag, lang } = useT();
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
        toast.info(t('review.limitStrength'));
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
        toast.info(t('review.limitLimit'));
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

    // 입력 검증 (REQ-E / E-2). 서버 판정이 필요한 빈도 제한은 E-1 에서 다룬다.
    const nick = nickname.trim();
    const body = content.trim();

    const errors: Partial<Record<ReviewFieldKey, string>> = {};
    if (!nick) errors.nickname = t('review.err.nickname');
    else if (nick.length < NICKNAME_MIN || nick.length > NICKNAME_MAX) errors.nickname = t('review.err.nicknameLen');
    if (rating < 1) errors.rating = t('review.err.rating');
    if (!body) errors.content = t('review.err.content');
    else if (body.length < CONTENT_MIN) errors.content = t('review.err.contentMin');
    else if (body.length > CONTENT_MAX) errors.content = t('review.err.contentMax');

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const order: ReviewFieldKey[] = ['nickname', 'rating', 'content'];
      const firstInvalid = order.find((key) => errors[key]);
      if (firstInvalid) setScrollToField(firstInvalid);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    // 중복 제출 차단 (E-2) — 같은 앱에 같은 본문이 이미 있으면 거부한다.
    // 실패해도 제출을 막지는 않는다 (조회가 안 되는 상황에서 작성을 잃게 하지 않는다).
    try {
      const dup = await hasDuplicateReview(id!, body);
      if (dup) {
        setSubmitting(false);
        setFieldErrors({ content: t('review.err.duplicate') });
        setScrollToField('content');
        return;
      }
    } catch { /* 조회 실패는 무시하고 진행 */ }

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
      // 서버가 코드값을 돌려준다 (빈도 제한·중복·검증). 코드마다 다른 문구를 띄워야
      // 사용자가 무엇을 고쳐야 할지 안다 (REQ-E / E-1).
      const code = err instanceof Error ? err.message : 'UNKNOWN';
      setFieldErrors({ content: t(reviewSubmitErrorKey(code) as StringKey) });
      setScrollToField('content');
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
            {t('review.done')}
          </h2>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2]">
            {t('review.redirecting')}
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
              {t('review.back').replace('{name}', app.name)}
            </Link>

            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] leading-[56px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px] mb-4">
              {t('review.pageTitle')}
            </h1>

            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2]">
              {t('review.pageLead')}
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
                  {t('review.step1')}
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
                      {t('survey.r.detected')}
                    </div>
                    <h3 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                      {t('survey.r.typeLine')
                        .replace('{t}', learnerType)
                        .replace('{name}', lang === 'ko' ? typeInfo.nameKo : typeInfo.name)}
                    </h3>
                  </div>
                </div>

                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-6">
                  {/* 이전 문구는 유형과 무관한 일반 서술이었다 — 배지의 역할만 설명하도록 교체 */}
                  {t('review.badgeNote')}
                </p>

                <div ref={nicknameBlockRef}>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.nickname')} <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
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
                    placeholder={t('review.nicknamePh')}
                    maxLength={NICKNAME_MAX}
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
                  {t('review.step2')}
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.level')}
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as typeof level)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    <option value="beginner">{t('review.level.beginner')}</option>
                    <option value="elementary">{t('review.level.elementary')}</option>
                    <option value="intermediate">{t('review.level.intermediate')}</option>
                    <option value="advanced">{t('review.level.advanced')}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.usage')}
                  </label>
                  <select
                    value={usagePeriod}
                    onChange={(e) => setUsagePeriod(e.target.value as UsagePeriod)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    {(Object.keys(usagePeriodLabels) as UsagePeriod[]).map((key) => (
                      <option key={key} value={key}>{t(`review.usage.${key}` as StringKey)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.purpose')}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {(['entertainment', 'business', 'academic', 'topik'] as const).map((value) => ({
                      value,
                      label: t(`review.purpose.${value}` as StringKey),
                    })).map((option) => (
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
                  {t('review.step3')}
                </h2>
              </div>

              <div className="space-y-6">
                <div ref={ratingBlockRef} className="mb-6">
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3 text-center">
                    {t('review.rating')} <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
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
                      {t('review.strengths.q')}{' '}
                      <span className="font-normal text-[#64748b] dark:text-[#bec7d2]">
                        {t('review.pickHint')
                          .replace('{max}', '3')
                          .replace(
                            '{sel}',
                            chosenStrengths.length > 0
                              ? t('review.pickHint.sel').replace('{n}', String(chosenStrengths.length))
                              : '',
                          )}
                      </span>
                    </p>
                  </div>
                  {STRENGTH_GROUPS.map((group, idx) => {
                    const chosenInGroup = group.values.filter(v => chosenStrengths.includes(v)).length;
                    return (
                      <div key={group.labelKey} className="border border-[#e2e8f0] dark:border-[#232a36] rounded-[12px] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleGroup(idx)}
                          className="w-full flex items-center justify-between px-4 py-3 text-left bg-[#f8fafc] dark:bg-[#1e293b] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36] transition-colors"
                        >
                          <span className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3]">
                            {t(group.labelKey)}
                            {chosenInGroup > 0 && (
                              <span className="ml-2 bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {chosenInGroup}
                              </span>
                            )}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[#64748b] dark:text-[#8a94a6] transition-transform ${openGroups.has(idx) ? 'rotate-180' : ''}`} />
                        </button>
                        {openGroups.has(idx) && (
                          <div className="px-4 py-3 flex flex-wrap gap-1.5">
                            {group.values.map(value => (
                              <button
                                key={value}
                                type="button"
                                onClick={() => toggleStrength(value)}
                                className={chosenStrengths.includes(value) ? CHIP_ON : CHIP_OFF}
                              >
                                {tag(value)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Limit tags */}
                <div>
                  <p className="font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.limits.q')}{' '}
                    <span className="font-normal text-[#64748b] dark:text-[#bec7d2]">
                      {t('review.pickHint')
                        .replace('{max}', '2')
                        .replace(
                          '{sel}',
                          chosenLimits.length > 0
                            ? t('review.pickHint.sel').replace('{n}', String(chosenLimits.length))
                            : '',
                        )}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIMIT_TAGS.map(value => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleLimit(value)}
                        className={chosenLimits.includes(value) ? CHIP_LIMIT_ON : CHIP_OFF}
                      >
                        {tag(value)}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={contentBlockRef}>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    {t('review.content')} <span className="text-[#0ea5e9] dark:text-[#8ecdff]">*</span>
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
                    placeholder={t('review.contentPh')}
                    rows={6}
                    aria-invalid={Boolean(fieldErrors.content)}
                    aria-describedby={fieldErrors.content ? 'review-content-error' : undefined}
                    className={`w-full bg-[#ffffff] dark:bg-[#151c27] border rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff] resize-none ${
                      fieldErrors.content
                        ? 'border-[#ef4444] dark:border-[#f87171] ring-1 ring-[#ef4444]/40'
                        : 'border-[#e2e8f0] dark:border-[#232a36]'
                    }`}
                  />
                  <div className="mt-2 flex items-start justify-between gap-3">
                    {fieldErrors.content ? (
                      <p id="review-content-error" className="text-[14px] text-[#ef4444] dark:text-[#f87171] font-['Inter:Regular',sans-serif]">
                        {fieldErrors.content}
                      </p>
                    ) : <span />}
                    {/* 글자 수 — 하한(20자) 미달이면 눈에 보이게 표시한다 */}
                    <span
                      className={`shrink-0 text-[13px] ${
                        content.trim().length > CONTENT_MAX || (content.length > 0 && content.trim().length < CONTENT_MIN)
                          ? 'text-[#ea580c] dark:text-[#fb923c]'
                          : 'text-[#94a3b8]'
                      }`}
                    >
                      {t('review.counter')
                        .replace('{n}', String(content.trim().length))
                        .replace('{max}', String(CONTENT_MAX))}
                    </span>
                  </div>
                </div>

                {/*
                  사진 첨부 영역을 제거했다 (REQ-D / D9). 테두리와 아이콘만 있는
                  껍데기였고 파일 선택 핸들러도 업로드 로직도 없었다 — 눌러도 아무
                  일이 없어 고장난 화면으로 보였다. 후기는 텍스트만 받는다.
                  `reviews.image_urls` 컬럼은 남겨 둔다 (지우는 이득이 없다).
                */}
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
                {submitting ? t('review.submitting') : t('review.submit')}
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
