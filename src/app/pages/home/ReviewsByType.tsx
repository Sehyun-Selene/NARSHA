import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllReviews, sortReviews, isReviewSort,
  fetchMyHelpful, toggleHelpful, migrateLocalHelpful,
  type Review, type ReviewSort,
} from '../../data/reviews';
import ReviewSortSelect from '../../components/ReviewSortSelect';
import ReviewReportMenu from '../../components/ReviewReportMenu';
import { useMemberAuth } from '../../../features/auth/useMemberAuth';
import MemberAuthModal from '../../../features/auth/MemberAuthModal';
import { fetchApps, appName, type App } from '../../data/apps';
import { learnerTypes, type LearnerType } from '../../data/learnerTypes';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';

/**
 * Discover 의 '학습유형별로 보기' (GNB PRD REQ-A / A-3).
 *
 * 기존 `/reviews` 페이지의 본문을 그대로 옮긴 것이다. 옮기면서 정리한 것:
 *   · 헤더/푸터/자체 히어로를 떼고 Home 안에 들어가는 조각으로 만들었다
 *   · 하드코딩 영문을 사전으로 이관했다 (한국어 모드에서 깨지고 있었다)
 *   · 유형 라벨을 자체 정의하지 않고 `data/learnerTypes` 단일 소스를 쓴다
 *
 * 필터 계승 (D11) — Home 의 검색어·필터 결과를 `appIds` 로 받아 그 앱들의 후기만
 * 보여준다. `null` 이면 필터가 없는 상태로 전건을 보여준다.
 */

const TYPE_ORDER: LearnerType[] = ['가', '나', '다', '라', '마', '바'];

const TYPE_COLORS: Record<LearnerType, { bg: string; text: string }> = {
  '가': { bg: 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]', text: 'text-[#00344f]' },
  '나': { bg: 'bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]', text: 'text-[#1e3a8a]' },
  '다': { bg: 'bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]', text: 'text-[#4c1d95]' },
  '라': { bg: 'bg-gradient-to-br from-[#f472b6] to-[#ec4899]', text: 'text-[#831843]' },
  '마': { bg: 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]', text: 'text-[#78350f]' },
  '바': { bg: 'bg-gradient-to-br from-[#34d399] to-[#10b981]', text: 'text-[#064e3b]' },
};

type ReviewWithAppName = Review & { appLabel: string };

export default function ReviewsByType({
  appIds,
  filteredAppCount,
  onClearFilters,
  sort,
  onSortChange,
}: {
  appIds: string[] | null;
  filteredAppCount: number;
  onClearFilters: () => void;
  sort: ReviewSort;
  onSortChange: (next: ReviewSort) => void;
}) {
  const { t, lang } = useT();
  const [allReviews, setAllReviews] = useState<ReviewWithAppName[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<LearnerType | null>(null);
  // 카운트는 서버(reviews.helpful_count)에서 오고, '내가 눌렀는지'만 따로 조회한다.
  // 투표자키를 서버가 IP 로 만들기 때문에 클라이언트가 알 수 없다.
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [counts, setCounts] = useState<Record<string, number>>({});

  // 열람 게이팅 (REQ-C / C-1 (b)). 목록 자체는 막지 않는다 — 이 화면은 "어떤 유형이
  // 어떤 앱을 쓰는지" 훑는 용도다. 전문을 읽으려면 앱 상세로 가고, 거기서 3건 제한을
  // 만난다. 여기서는 본문을 2줄로 잘라 그 흐름을 만든다.
  const { session } = useMemberAuth();
  const gated = !session;
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [reviews, apps] = await Promise.all([getAllReviews(), fetchApps()]);
        if (!active) return;
        const appMap = new Map<string, App>(apps.map(a => [a.id, a]));
        setAllReviews(
          reviews
            .map(r => {
              const app = appMap.get(r.appId);
              return { ...r, appLabel: app ? appName(app, lang) : r.appId };
            })
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
    // 언어가 바뀌면 앱 표시명을 다시 고른다
  }, [lang]);

  // 목록이 준비되면 서버 카운트를 채우고, 이 IP 가 누른 항목을 조회한다.
  // 구 방식(브라우저 전용) 기록이 남아 있으면 1회 이관한다 (D14).
  useEffect(() => {
    if (allReviews.length === 0) return;
    let active = true;
    setCounts(Object.fromEntries(allReviews.map(r => [r.id, r.helpfulCount ?? 0])));
    (async () => {
      await migrateLocalHelpful();
      try {
        const mine = await fetchMyHelpful(allReviews.map(r => r.id));
        if (active) setMarked(new Set(mine));
      } catch {
        // 서버 함수가 아직 설정되지 않았거나 실패한 경우 — 카운트는 그대로 보여준다
      }
    })();
    return () => { active = false; };
  }, [allReviews]);

  const onHelpfulClick = async (reviewId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const r = await toggleHelpful(reviewId);
      setCounts(prev => ({ ...prev, [reviewId]: r.count }));
      setMarked(prev => {
        const next = new Set(prev);
        if (r.marked) next.add(reviewId); else next.delete(reviewId);
        return next;
      });
    } catch {
      toast.error(t('rbt.helpfulFailed'));
    }
  };

  // Home 의 검색어·필터를 계승한다 (D11)
  const inScope = appIds === null ? allReviews : allReviews.filter(r => appIds.includes(r.appId));
  const shown = sortReviews(
    filterType ? inScope.filter(r => r.learnerType === filterType) : inScope,
    sort,
    // 토글 직후 순서가 튀지 않도록 화면이 들고 있는 최신 카운트로 정렬한다
    (r) => counts[r.id] ?? r.helpfulCount,
  );

  // 7개가 한 줄에 들어가야 하므로 폭을 균등하게(그리드가 담당) 하고 내용은 2줄로 쌓는다
  const chipClass = (on: boolean) =>
    `h-[52px] px-2 rounded-[12px] font-['Manrope:Medium',sans-serif] font-medium leading-tight transition-all flex flex-col items-center justify-center gap-0.5 ${
      on
        ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
        : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
    }`;

  return (
    <div>
      {/* 필터 계승 안내 — 조건이 걸려 있을 때만 (D11) */}
      {appIds !== null && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[12px] border border-[#8ecdff] bg-[#e0f2fe] dark:bg-[#0f3a4a] px-4 py-2.5">
          <span className="text-[13px] text-[#0369a1] dark:text-[#8ecdff]">
            {t('rbt.filterNotice').replace('{n}', String(filteredAppCount))}
          </span>
          <button
            onClick={onClearFilters}
            className="text-[13px] font-bold text-[#1b99dc] hover:underline"
          >
            {t('rbt.clearFilters')}
          </button>
        </div>
      )}

      {/* 정렬 (REQ-F / F-2) */}
      <div className="mb-4 flex justify-end">
        <ReviewSortSelect value={sort} onChange={onSortChange} />
      </div>

      {/*
        유형 필터 칩.
        라벨 길이가 제각각이라 flex-wrap 에서는 마·바만 아랫줄로 내려갔다.
        폭이 같은 2줄 칩 + 7열 그리드로 바꿔 데스크톱에서 한 줄에 들어오게 한다.
        2줄째에 감각·방식(시각 탐색형 등)을 붙여 유형 코드만 보고 헷갈리지 않게 한다.
      */}
      <div className="mb-8 max-w-[1000px] mx-auto grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        <button onClick={() => setFilterType(null)} className={chipClass(filterType === null)}>
          <span className="font-bold text-[13px]">{t('rbt.allTypes')}</span>
          <span className="text-[11px] opacity-70">({inScope.length})</span>
        </button>
        {TYPE_ORDER.map(type => {
          const count = inScope.filter(r => r.learnerType === type).length;
          const colors = TYPE_COLORS[type];
          const info = learnerTypes[type];
          const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
          return (
            <button key={type} onClick={() => setFilterType(type)} className={chipClass(filterType === type)}>
              <span className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                  <span className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[12px] ${colors.text}`}>
                    {type}
                  </span>
                </span>
                <span className="font-bold text-[13px]">{t('rbt.type').replace('{t}', type)}</span>
                <span className="text-[11px] opacity-70">({count})</span>
              </span>
              <span className="text-[11px] opacity-80 whitespace-nowrap">
                {lang === 'ko'
                  ? info.nameKo.replace(' 학습자', '')
                  : `${cap(info.sensory)} ${cap(info.style)}`}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-8 h-8 border-4 border-[#0ea5e9] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : shown.length === 0 ? (
        <div className="text-center py-16 flex flex-col items-center gap-3">
          <p className="text-[16px] text-[#64748b] dark:text-[#bec7d2]">
            {appIds !== null ? t('rbt.emptyFiltered') : t('rbt.empty')}
          </p>
          {appIds !== null && (
            <button onClick={onClearFilters} className="text-[14px] font-bold text-[#1b99dc] hover:underline">
              {t('rbt.clearFilters')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {shown.map(review => {
            const info = learnerTypes[review.learnerType as LearnerType];
            const typeLabel = info ? (lang === 'ko' ? info.nameKo : info.name) : review.learnerType;
            return (
              <Link
                key={review.id}
                to={`/apps/${review.appId}`}
                className="block bg-[#ffffff] dark:bg-[#151c27] rounded-[16px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:hover:border-[#8ecdff] transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                        {review.appLabel}
                      </h3>
                      <span className="bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[11px] px-2 py-1 rounded">
                        {t('rbt.type').replace('{t}', review.learnerType)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                        {typeLabel}
                      </span>
                      <span className="text-[#cbd5e1] dark:text-[#3f4850]">•</span>
                      <span className="text-[14px] text-[#94a3b8]">
                        {new Date(review.createdAt).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </span>
                      <span className="text-[#cbd5e1] dark:text-[#3f4850]">•</span>
                      <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#64748b] dark:text-[#94a3b8]">
                        {review.nickname}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />
                    <span className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#8ecdff]">
                      {review.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* 비로그인은 2줄 + 페이드아웃, 로그인은 현행 3줄 (REQ-C / C-1 (b)) */}
                  <div className="relative">
                    <p className={`text-[14px] leading-[22px] text-[#64748b] dark:text-[#bec7d2] ${gated ? 'line-clamp-2' : 'line-clamp-3'}`}>
                      {review.content}
                    </p>
                    {gated && (
                      <div
                        className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white dark:from-[#151c27] to-transparent"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Inter:Medium',sans-serif] font-medium text-[12px] px-3 py-1 rounded-full">
                        {t('rbt.level').replace('{v}', t(`review.level.${review.level}` as StringKey))}
                      </span>
                      <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Inter:Medium',sans-serif] font-medium text-[12px] px-3 py-1 rounded-full">
                        {t(`review.usage.${review.usagePeriod}` as StringKey)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={e => { void onHelpfulClick(review.id, e); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[13px] transition-all whitespace-nowrap ${
                          marked.has(review.id)
                            ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
                            : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{t('rbt.helpful')}</span>
                        <span className="opacity-60">({counts[review.id] ?? review.helpfulCount ?? 0})</span>
                      </button>
                      {/* 신고 진입점 (REQ-E / E-3). 카드가 Link 라서 컴포넌트가 클릭을 끊는다 */}
                      <ReviewReportMenu reviewId={review.id} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* 목록 하단 안내 1회 (REQ-C / C-1 (b)). 비로그인 · 실제로 잘린 게 있을 때만 */}
          {gated && shown.length > 0 && (
            <div className="rounded-[16px] border border-dashed border-[#8ecdff] dark:border-[#1b5a7a] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-[14px] text-[#1e293b] dark:text-[#dce3f3]">{t('gate.typeBanner')}</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[13px] px-4 py-2 rounded-[10px]"
                >
                  {t('member.login')}
                </button>
                <button type="button" onClick={() => setAuthMode('signup')} className="text-[12px] text-[#1b99dc] hover:underline">
                  {t('gate.noAccount')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <MemberAuthModal
        open={authMode !== null}
        mode={authMode ?? 'login'}
        onClose={() => setAuthMode(null)}
      />
    </div>
  );
}
