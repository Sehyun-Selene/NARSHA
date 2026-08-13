import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router';
import { Star, ExternalLink, ChevronRight, BarChart3, ThumbsUp, MessageSquare, BookMarked, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AppLogoMark } from '../components/AppLogoMark';
import { fetchAppById, getAppLevelDisplayTags, enrichAppWithStaticContent, type App } from '../data/apps';
import {
  getReviewsForApp,
  getAverageRatingByType,
  getRepliesForReview,
  addReviewReply,
  sortReviews,
  isReviewSort,
  type Review,
  type ReviewReply,
  type ReviewSort,
} from '../data/reviews';
import ReviewSortSelect from '../components/ReviewSortSelect';
import { learnerTypes, type LearnerType } from '../data/learnerTypes';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { tagLabel, tagLongLabel, useT } from '../i18n';
import { useLang } from '../lib/useLang';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';

const LEARNER_TYPES: LearnerType[] = ['가', '나', '다', '라', '마', '바'];

const MEDALS = ['🥇', '🥈', '🥉'];

export default function AppDetail() {
  const { id } = useParams<{ id: string }>();
  // 페이지 전체 i18n 은 Phase 2 — 여기서는 레벨 배지 라벨만 언어에 맞춘다.
  const [lang] = useLang();
  const { t } = useT();
  const [app, setApp] = useState<App | null>(null);
  const [appReviews, setAppReviews] = useState<Review[]>([]);
  const [typeRatings, setTypeRatings] = useState<Record<LearnerType, number>>({
    가: 0, 나: 0, 다: 0, 라: 0, 마: 0, 바: 0,
  });
  const [repliesMap, setRepliesMap] = useState<Record<string, ReviewReply[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | LearnerType>('all');

  // 후기 정렬 (REQ-F / F-2). 정렬 상태를 URL 에 남겨 링크로 공유된다.
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get('sort');
  const reviewSort: ReviewSort = isReviewSort(sortParam) ? sortParam : 'recent';
  const setReviewSort = (next: ReviewSort) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'recent') params.delete('sort');
    else params.set('sort', next);
    setSearchParams(params, { replace: true });
  };
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, { count: number; userMarked: boolean }>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // 서비스 고유명사는 번역하지 않는다 (PRD §5.5) — 앱 이름을 그대로 타이틀에 쓴다.
  useDocumentTitle(undefined, app?.name);
  const [filterByType, setFilterByType] = useState(false);
  const [userLearnerType, setUserLearnerType] = useState<string | null>(null);

  useEffect(() => {
    setUserLearnerType(localStorage.getItem('narsha-learner-type'));
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const load = async () => {
      const [fetchedApp, reviews] = await Promise.all([
        fetchAppById(id),
        getReviewsForApp(id),
      ]);

      setApp(fetchedApp ? enrichAppWithStaticContent(fetchedApp) : null);
      setAppReviews(reviews);

      const ratingValues = await Promise.all(
        LEARNER_TYPES.map((t) => getAverageRatingByType(id, t))
      );
      const ratings = Object.fromEntries(
        LEARNER_TYPES.map((t, i) => [t, ratingValues[i]])
      ) as Record<LearnerType, number>;
      setTypeRatings(ratings);

      const replyEntries = await Promise.all(
        reviews.map(async (r) => {
          const rep = await getRepliesForReview(r.id);
          return [r.id, rep] as [string, ReviewReply[]];
        })
      );
      setRepliesMap(Object.fromEntries(replyEntries));
    };

    load().catch(console.error).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem('review-helpful');
    if (saved) setHelpfulReviews(JSON.parse(saved));
  }, []);

  const saveHelpfulData = (data: Record<string, { count: number; userMarked: boolean }>) => {
    localStorage.setItem('review-helpful', JSON.stringify(data));
    setHelpfulReviews(data);
  };

  const toggleHelpful = (reviewId: string) => {
    const current = helpfulReviews[reviewId] ?? { count: 0, userMarked: false };
    saveHelpfulData({
      ...helpfulReviews,
      [reviewId]: {
        count: current.userMarked ? current.count - 1 : current.count + 1,
        userMarked: !current.userMarked,
      },
    });
  };

  const submitReply = async (reviewId: string) => {
    const text = replyText.trim();
    if (!text) return;
    const reply = await addReviewReply(reviewId, text);
    setRepliesMap((prev) => ({
      ...prev,
      [reviewId]: [...(prev[reviewId] ?? []), reply],
    }));
    setReplyText('');
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-[#64748b] dark:text-[#bec7d2]">App not found</p>
        </main>
        <Footer />
      </div>
    );
  }

  const levelTags = getAppLevelDisplayTags(app);
  const overallRating =
    appReviews.length > 0
      ? appReviews.reduce((sum, r) => sum + r.rating, 0) / appReviews.length
      : 0;

  const filteredReviews = sortReviews(
    selectedFilter === 'all'
      ? appReviews
      : appReviews.filter((r) => r.learnerType === selectedFilter),
    reviewSort,
  );

  // Reviews for learner-eval section (optionally filtered to user's type)
  const reviewsForEval = filterByType && userLearnerType
    ? appReviews.filter(r => r.learnerType === userLearnerType)
    : appReviews;
  const reviewsWithStrengths = reviewsForEval.filter(r => (r.chosenStrengths ?? []).length > 0);
  const reviewsWithLimits   = reviewsForEval.filter(r => (r.chosenLimits   ?? []).length > 0);

  const strengthCounts: Record<string, number> = {};
  for (const r of reviewsForEval) {
    for (const tag of r.chosenStrengths ?? []) {
      strengthCounts[tag] = (strengthCounts[tag] ?? 0) + 1;
    }
  }
  const topStrengths = Object.entries(strengthCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const limitCounts: Record<string, number> = {};
  for (const r of reviewsForEval) {
    for (const tag of r.chosenLimits ?? []) {
      limitCounts[tag] = (limitCounts[tag] ?? 0) + 1;
    }
  }
  const topLimits = Object.entries(limitCounts).sort((a, b) => b[1] - a[1]).slice(0, 2);

  const curatorTags = new Set(app?.differentiators ?? []);

  const radarData = LEARNER_TYPES.map((t) => ({
    type: `Type ${t}\n${learnerTypes[t].name}`,
    rating: typeRatings[t],
    id: `type-${t}`,
  }));

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* App Header */}
          <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-2xl p-4 sm:p-5 mb-8 sm:mb-10 border border-[#e2e8f0] dark:border-[#232a36]">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-[4.5rem] sm:h-[4.5rem] rounded-2xl bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] flex items-center justify-center shrink-0 p-1.5">
                <div className="h-10 w-10 sm:h-11 sm:w-11 min-h-0 min-w-0">
                  <AppLogoMark app={app} variant="hero" />
                </div>
              </div>

              <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    {levelTags.map((level) => (
                      <span
                        key={level}
                        className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[10px] sm:text-[11px] tracking-[1px] uppercase px-2.5 py-0.5 rounded-full"
                      >
                        {tagLabel(level, lang)}
                      </span>
                    ))}
                  </div>

                  <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.375rem,2.5vw,1.75rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em] mb-2">
                    {app.name}: Korean
                  </h1>

                  {app.detailPoints && app.detailPoints.length > 0 ? (
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1 mb-3 max-w-[42rem] marker:text-[#94a3b8]">
                      {app.detailPoints.map((point: string, i: number) => (
                        <li
                          key={i}
                          className="font-['Inter:Regular',sans-serif] font-normal text-[13px] sm:text-[14px] leading-snug text-[#64748b] dark:text-[#bec7d2] pl-0.5"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[13px] sm:text-[14px] leading-snug text-[#64748b] dark:text-[#bec7d2] mb-3 max-w-[42rem]">
                      {app.description}
                    </p>
                  )}

                  {app.url && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-transparent border-2 border-[#1e293b] dark:border-[#8ecdff] text-[#1e293b] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[13px] sm:text-[14px] px-4 py-2 rounded-lg hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
                    >
                      Official Website
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  )}
                </div>

                <div className="shrink-0 sm:w-[7.25rem] rounded-xl p-3 sm:p-3.5 text-center bg-[#ffffff] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] sm:ml-2">
                  <div className="text-[9px] sm:text-[10px] font-['Manrope:Bold',sans-serif] font-bold tracking-[1px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-1">
                    Overall
                  </div>
                  <div className="text-[2rem] sm:text-[2.25rem] font-['Manrope:ExtraBold',sans-serif] font-extrabold leading-none text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
                    {overallRating > 0 ? overallRating.toFixed(1) : '-'}
                  </div>
                  <div className="flex gap-0.5 justify-center mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                          star <= Math.round(overallRating)
                            ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]'
                            : 'text-[#cbd5e1] dark:text-[#3f4850]'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-[11px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#94a3b8] leading-tight">
                    {appReviews.length} review{appReviews.length === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learner Type Ratings */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] leading-[40px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.8px] mb-2">
                  Rating by Learner Type
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] leading-[24px] text-[#64748b] dark:text-[#bec7d2]">
                  How different archetypes perceive this resource.
                </p>
              </div>

              <button
                onClick={() => setShowAnalysisModal(true)}
                className="inline-flex items-center gap-2 bg-[#ffffff] dark:bg-[#151c27] border-2 border-[#0ea5e9] dark:border-[#8ecdff] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[16px] px-6 py-3 rounded-[8px] hover:bg-[#e0f2fe] dark:hover:bg-[#1e293b] transition-colors shadow-[0px_4px_12px_-2px_rgba(0,0,0,0.1)]"
              >
                <BarChart3 className="w-5 h-5" />
                View Analysis Chart
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {LEARNER_TYPES.map((type) => {
                const typeInfo = learnerTypes[type];
                const rating = typeRatings[type];

                return (
                  <div
                    key={type}
                    className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-6 text-center border border-[#e2e8f0] dark:border-[#232a36] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff] transition-colors cursor-pointer"
                    onClick={() => setSelectedFilter(type)}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] flex items-center justify-center mx-auto mb-3">
                      <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#ffffff] dark:text-[#8ecdff]">
                        {type}
                      </span>
                    </div>
                    <div className="text-[11px] font-['Manrope:Bold',sans-serif] font-bold tracking-[1.1px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-2">
                      {typeInfo.sensory} {typeInfo.style}
                    </div>
                    <div className="text-[32px] font-['Manrope:ExtraBold',sans-serif] font-extrabold leading-none text-[#1e293b] dark:text-[#dce3f3] mb-1">
                      {rating > 0 ? rating.toFixed(1) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Area A: Curated by NARSHA ──────────────────────────────────── */}
          {app.differentiators.length > 0 && (
            <div className="mb-6">
              <div className="bg-[#f0f9ff] dark:bg-[#0c1f2e] border-l-4 border-[#0ea5e9] dark:border-[#1b99dc] rounded-r-[16px] p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BookMarked className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" />
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#0ea5e9] dark:text-[#8ecdff]">
                    Curated by NARSHA
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {app.differentiators.map(tag => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0c4a6e] dark:text-[#8ecdff] text-[12px] font-medium px-2.5 py-1 rounded-full"
                    >
                      ✓ {tagLongLabel(tag, lang)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Area B: Learner Reviews ─────────────────────────────────────── */}
          <div className="mb-10">
            <div className="bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[16px] p-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#64748b] dark:text-[#8a94a6]" />
                  <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#64748b] dark:text-[#8a94a6]">
                    {t('myType.learnerReviews')}
                  </span>
                </div>
                {userLearnerType && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filterByType}
                      onChange={e => setFilterByType(e.target.checked)}
                      className="w-3.5 h-3.5 accent-[#0ea5e9]"
                    />
                    <span className="text-[12px] text-[#64748b] dark:text-[#8a94a6]">
                      {t('myType.evalOnly').replace('{t}', userLearnerType)}
                    </span>
                  </label>
                )}
              </div>

              {/* Content */}
              {reviewsForEval.length < 3 ? (
                <p className="text-[14px] text-[#94a3b8] dark:text-[#3f4850] py-4 text-center">
                  아직 충분한 학습자 평가가 없어요.{' '}
                  <Link to={`/apps/${app.id}/review/new`} className="text-[#0ea5e9] dark:text-[#8ecdff] hover:underline">
                    첫 리뷰를 남겨주세요!
                  </Link>
                </p>
              ) : (
                <>
                  {/* Strengths */}
                  {topStrengths.length > 0 && (
                    <div className="space-y-2.5 mb-4">
                      {topStrengths.map(([tag, count], idx) => (
                        <div key={tag} className="flex items-center gap-3">
                          <span className="text-[18px] w-6 shrink-0">{MEDALS[idx]}</span>
                          <span className="flex-1 font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3]">
                            {tagLongLabel(tag, lang)}
                          </span>
                          {curatorTags.has(tag) ? (
                            <span className="text-[11px] text-[#0ea5e9] dark:text-[#8ecdff] font-medium">✓ 운영자 동의</span>
                          ) : (
                            <span className="text-[11px] text-[#f59e0b] font-medium">★ 새 발견</span>
                          )}
                          <span className="text-[12px] text-[#64748b] dark:text-[#8a94a6] min-w-[3.5rem] text-right">
                            {count}명
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Limits */}
                  {topLimits.length > 0 && (
                    <div className="border-t border-[#e2e8f0] dark:border-[#232a36] pt-3 mt-3 space-y-2">
                      {topLimits.map(([tag, count]) => (
                        <div key={tag} className="flex items-center gap-3">
                          <span className="text-[16px] w-6 shrink-0">⚠️</span>
                          <span className="flex-1 text-[14px] text-[#64748b] dark:text-[#8a94a6]">
                            {tagLongLabel(tag, lang)}
                          </span>
                          <span className="text-[12px] text-[#94a3b8] dark:text-[#3f4850] min-w-[3.5rem] text-right">
                            {count}명
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <p className="text-[11px] text-[#94a3b8] dark:text-[#3f4850] mt-3 pt-3 border-t border-[#e2e8f0] dark:border-[#232a36]">
                    {filterByType && userLearnerType
                      ? t('myType.evalBasisType')
                          .replace('{t}', userLearnerType)
                          .replace('{n}', String(reviewsWithStrengths.length))
                      : t('myType.evalBasisAll').replace('{n}', String(reviewsWithStrengths.length))}
                    {reviewsWithLimits.length > 0 &&
                      t('myType.evalLimits').replace('{n}', String(reviewsWithLimits.length))}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] leading-[40px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.8px]">
                Filter Reviews
              </h2>
              <Link
                to={`/apps/${app.id}/review/new`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] px-8 py-3 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
              >
                Write Review
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/*
              내 학습유형 후기만 보기 (REQ-F / F-3).
              검사를 마친 사용자에게만 토글을 노출하고, 미검사자에게는 검사로 가는
              링크를 대신 둔다. 유형 칩과 따로 상태를 두지 않고 selectedFilter 를
              그대로 조작한다 — 필터가 두 개가 되면 서로 어긋난다.
            */}
            <div className="mb-4">
              {userLearnerType ? (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFilter(prev =>
                      prev === userLearnerType ? 'all' : (userLearnerType as LearnerType),
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-bold transition-colors ${
                    selectedFilter === userLearnerType
                      ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff]'
                      : 'border border-[#8ecdff] text-[#0ea5e9] dark:text-[#8ecdff] hover:bg-[#e0f2fe] dark:hover:bg-[#0f3a4a]'
                  }`}
                >
                  {selectedFilter === userLearnerType
                    ? t('myType.showAll')
                    : t('myType.only').replace('{t}', userLearnerType)}
                </button>
              ) : (
                <Link
                  to="/survey"
                  onClick={() => { try { localStorage.setItem('narsha-return-app-id', app.id); } catch { /* ignore */ } }}
                  className="text-[13px] text-[#0ea5e9] dark:text-[#8ecdff] underline underline-offset-2 hover:opacity-80"
                >
                  {t('myType.takeTest')}
                </Link>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
              >
                All Types
              </button>
              {LEARNER_TYPES.map((type) => {
                const typeInfo = learnerTypes[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                      selectedFilter === type
                        ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                        : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                    }`}
                  >
                    Type {type}:{' '}
                    {typeInfo.sensory.charAt(0).toUpperCase() + typeInfo.sensory.slice(1)}{' '}
                    {typeInfo.style.charAt(0).toUpperCase() + typeInfo.style.slice(1)}
                  </button>
                );
              })}

              {/* 정렬 (REQ-F / F-2) — 칩 줄 오른쪽 끝 */}
              <div className="ml-auto">
                <ReviewSortSelect value={reviewSort} onChange={setReviewSort} />
              </div>
            </div>

            <div className="space-y-6">
              {filteredReviews.map((review) => {
                const typeInfo = learnerTypes[review.learnerType];
                const helpfulData = helpfulReviews[review.id] ?? { count: 0, userMarked: false };
                const replies = repliesMap[review.id] ?? [];

                return (
                  <div
                    key={review.id}
                    className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-8 border border-[#e2e8f0] dark:border-[#232a36]"
                  >
                    <div className="flex items-start gap-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center flex-shrink-0">
                        <span className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#00344f]">
                          {review.nickname.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-1">
                              {review.nickname}
                            </div>
                            <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                              {typeInfo.name} •{' '}
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= review.rating
                                    ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]'
                                    : 'text-[#cbd5e1] dark:text-[#3f4850]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
                          {review.content}
                        </p>

                        {replies.length > 0 && (
                          <div className="mb-4 space-y-3">
                            <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
                              Replies ({replies.length})
                            </div>
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="rounded-[12px] bg-[#e8eef4] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] px-4 py-3"
                              >
                                <p className="font-['Inter:Regular',sans-serif] font-normal text-[15px] leading-[22px] text-[#1e293b] dark:text-[#dce3f3]">
                                  {reply.body}
                                </p>
                                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-[#94a3b8] dark:text-[#64748b] mt-2">
                                  {new Date(reply.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-[14px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#bec7d2]">
                          <button
                            onClick={() => toggleHelpful(review.id)}
                            className={`flex items-center gap-1 transition-colors ${
                              helpfulData.userMarked
                                ? 'text-[#0ea5e9] dark:text-[#8ecdff]'
                                : 'hover:text-[#0ea5e9] dark:hover:text-[#8ecdff]'
                            }`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                            <span>Helpful ({helpfulData.count})</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-1 hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>Reply</span>
                          </button>
                        </div>

                        {replyingTo === review.id && (
                          <div className="mt-4">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full p-2 border border-[#e2e8f0] dark:border-[#232a36] rounded-[4px] mb-2 bg-white dark:bg-[#0c141f] text-[#1e293b] dark:text-[#dce3f3]"
                              placeholder="Write your reply here..."
                            />
                            <button
                              onClick={() => submitReply(review.id)}
                              className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-10 py-2.5 rounded-[8px] hover:opacity-90 transition-opacity"
                            >
                              Submit Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredReviews.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2]">
                    No reviews yet for this learner type. Be the first to share your experience!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showAnalysisModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm p-6"
          onClick={() => setShowAnalysisModal(false)}
        >
          <div
            className="bg-[#ffffff] dark:bg-[#151c27] rounded-[24px] max-w-[800px] w-full max-h-[90vh] border border-[#e2e8f0] dark:border-[#232a36] shadow-[0px_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff]">
                  Analytical Core
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-[#64748b] dark:text-[#bec7d2] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] leading-[32px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px]">
                6 Learner Types Review
              </h2>
            </div>

            <div className="overflow-y-auto px-8 pb-8 flex-1">
              <div className="mb-6 rounded-[12px] p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#c0c7d2" strokeWidth={2} gridType="polygon" />
                    <PolarAngleAxis
                      dataKey="type"
                      tick={{
                        fill: '#1e293b',
                        fontSize: 11,
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 'bold',
                      }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} tick={false} />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="#0ea5e9"
                      fill="#8ecdff"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {LEARNER_TYPES.map((type) => {
                  const typeInfo = learnerTypes[type];
                  const rating = typeRatings[type];
                  const reviewCount = appReviews.filter((r) => r.learnerType === type).length;

                  return (
                    <div
                      key={type}
                      className="bg-[#f8fafc] dark:bg-[#0c141f] rounded-[12px] p-3 border border-[#e2e8f0] dark:border-[#232a36]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] flex items-center justify-center">
                          <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] text-[#ffffff] dark:text-[#8ecdff]">
                            {type}
                          </span>
                        </div>
                        <div className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">
                          {rating > 0 ? rating.toFixed(1) : '-'}
                        </div>
                      </div>
                      <div className="text-[11px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#bec7d2] mb-1">
                        {typeInfo.name}
                      </div>
                      <div className="text-[10px] font-['Inter:Regular',sans-serif] font-normal text-[#94a3b8] dark:text-[#8b96a3]">
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-10 py-2.5 rounded-[8px] hover:opacity-90 transition-opacity"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
