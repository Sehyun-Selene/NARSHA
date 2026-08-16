import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { introCopy, DESK_TITLE, READ_NO_LOGIN } from '../../../features/desk/components/introCopy';
import PartnerBadge from '../../../features/desk/components/PartnerBadge';
import {
  getFeed,
  type FeedFilters,
  type FeedSort,
} from '../../../features/desk/api/posts';
import {
  listActiveAuthors,
  countActiveAuthors,
} from '../../../features/desk/api/profiles';
import type { DeskFeedItem, Profile } from '../../../features/desk/types';
import { COUNTRY_LABEL } from '../../../features/desk/types';

const T = {
  ko: {
    all: '전체',
    authors: '전체 저자',
    latest: '최신순',
    popular: '인기순',
    readMore: '더 보기',
    empty: '아직 발행된 글이 없습니다.',
    loginLink: '책상 주인이신가요?',
    myDesk: '내 책상 관리',
    views: '조회',
  },
  en: {
    all: 'All',
    authors: 'All authors',
    latest: 'Latest',
    popular: 'Popular',
    readMore: 'Load more',
    empty: 'No posts published yet.',
    loginLink: 'Are you a desk owner?',
    myDesk: 'My desk',
    views: 'views',
  },
} as const;

function AuthorAvatar({ profile, size = 36 }: { profile: Pick<Profile, 'handle' | 'display_name' | 'avatar_url'>; size?: number }) {
  const initial = profile.display_name?.charAt(0) ?? '?';
  return profile.avatar_url ? (
    <img
      src={profile.avatar_url}
      alt={profile.display_name}
      width={size}
      height={size}
      loading="lazy"
      className="rounded-full object-cover border border-[#e2e8f0] dark:border-[#232a36]"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="rounded-full flex items-center justify-center bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff] font-bold"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}

function excerpt(item: DeskFeedItem): string {
  if (item.summary) return item.summary;
  return '';
}

export default function DeskFeed() {
  const [lang] = useLang();
  const t = T[lang];

  const [authorCount, setAuthorCount] = useState<number | null>(null);
  const [authors, setAuthors] = useState<Profile[]>([]);

  const [country, setCountry] = useState<'ID' | 'PH' | null>(null);
  const [authorHandle, setAuthorHandle] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [sort, setSort] = useState<FeedSort>('latest');

  const [items, setItems] = useState<DeskFeedItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const filters: FeedFilters = useMemo(
    () => ({ country, handle: authorHandle, tag, sort }),
    [country, authorHandle, tag, sort],
  );

  // 헤더 정보 (저자 수 · 아바타)
  useEffect(() => {
    let active = true;
    Promise.all([countActiveAuthors(), listActiveAuthors()])
      .then(([n, list]) => {
        if (!active) return;
        setAuthorCount(n);
        setAuthors(list);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // 필터 변경 → 첫 페이지 로드
  useEffect(() => {
    let active = true;
    setLoading(true);
    getFeed(filters, null)
      .then((page) => {
        if (!active) return;
        setItems(page.items);
        setCursor(page.nextCursor);
      })
      .catch((e) => {
        console.error(e);
        toast.error(lang === 'ko' ? '피드를 불러오지 못했습니다.' : 'Failed to load the feed.');
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [filters, lang]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await getFeed(filters, cursor);
      setItems((prev) => [...prev, ...page.items]);
      setCursor(page.nextCursor);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, filters, loadingMore]);

  // 로드된 글에서 태그 후보 수집 (경량 필터)
  const tagOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => i.tags?.forEach((tg) => set.add(tg)));
    return Array.from(set).slice(0, 20);
  }, [items]);

  return (
    <DeskShell>
      {/* 헤더 블록 — §3.2 확정 문안 + 저자 아바타 */}
      <header className="mb-10">
        <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] tracking-[0.08em] uppercase text-[#8ecdff] mb-2">
          {DESK_TITLE[lang]}
        </p>
        <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-[1.8] text-[#1e293b] dark:text-[#dce3f3] max-w-[760px]">
          {introCopy(authorCount, lang)}
        </p>

        {authors.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap mt-5">
            {authors.map((a) => (
              <Link
                key={a.id}
                to={`/desk/@${a.handle}`}
                className="flex items-center gap-2 group"
                title={a.display_name}
              >
                <AuthorAvatar profile={a} />
                <span className="flex items-center gap-1.5">
                  <span className="font-['Inter:Medium',sans-serif] text-[13px] text-[#64748b] dark:text-[#bec7d2] group-hover:text-[#1b99dc]">
                    {lang === 'en' && a.display_name_en ? a.display_name_en : a.display_name}
                  </span>
                  <PartnerBadge participantType={a.participant_type} lang={lang} />
                </span>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Link
            to="/desk/login"
            className="font-['Inter:Medium',sans-serif] text-[13px] text-[#8ecdff] hover:underline"
          >
            {t.loginLink}
          </Link>
          <span className="mx-2 text-[#cbd5e1] dark:text-[#334155]">·</span>
          <span className="font-['Inter:Regular',sans-serif] text-[13px] text-[#94a3b8]">
            {READ_NO_LOGIN[lang]}
          </span>
        </div>
      </header>

      {/* 필터 바 */}
      <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-[#e2e8f0] dark:border-[#232a36]">
        <FilterChip active={country === null} onClick={() => setCountry(null)}>{t.all}</FilterChip>
        {(['ID', 'PH'] as const).map((c) => (
          <FilterChip key={c} active={country === c} onClick={() => setCountry(country === c ? null : c)}>
            {COUNTRY_LABEL[c][lang]}
          </FilterChip>
        ))}

        {/*
          저자별로 모아 보기. 저자가 한 명뿐이면 고를 것이 없어 '저자' 칩만 덩그러니
          남는다 — 그때는 줄 자체를 감춘다. 저자가 확정돼 여러 명이 되면 자동으로
          나타난다.
        */}
        {authors.length >= 2 && (
          <>
            <span className="mx-1 w-px h-5 bg-[#e2e8f0] dark:bg-[#232a36]" />

            <FilterChip active={authorHandle === null} onClick={() => setAuthorHandle(null)}>
              {t.authors}
            </FilterChip>
            {authors.map((a) => (
              <FilterChip
                key={a.id}
                active={authorHandle === a.handle}
                onClick={() => setAuthorHandle(authorHandle === a.handle ? null : a.handle)}
              >
                {lang === 'en' && a.display_name_en ? a.display_name_en : a.display_name}
              </FilterChip>
            ))}
          </>
        )}

        <span className="ml-auto flex gap-1">
          {(['latest', 'popular'] as const).map((s) => (
            <FilterChip key={s} active={sort === s} onClick={() => setSort(s)}>
              {t[s]}
            </FilterChip>
          ))}
        </span>
      </div>

      {/* 태그 필터 (로드된 글에서 수집) */}
      {tagOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tag && (
            <FilterChip active onClick={() => setTag(null)}>
              #{tag} ✕
            </FilterChip>
          )}
          {!tag &&
            tagOptions.map((tg) => (
              <FilterChip key={tg} active={false} onClick={() => setTag(tg)}>
                #{tg}
              </FilterChip>
            ))}
        </div>
      )}

      {/* 카드 그리드 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[16px] h-[280px] bg-[#f1f5f9] dark:bg-[#151c27] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-24 text-center font-['Inter:Regular',sans-serif] text-[15px] text-[#94a3b8]">
          {t.empty}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/desk/@${item.handle}/${item.slug}`}
                className="group rounded-[16px] overflow-hidden border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] hover:shadow-[0px_10px_24px_-8px_rgba(0,0,0,0.12)] transition-shadow flex flex-col"
              >
                <div className="aspect-[16/9] bg-[#f1f5f9] dark:bg-[#0c141f] overflow-hidden">
                  {item.cover_url ? (
                    <img src={item.cover_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#cbd5e1] dark:text-[#334155] text-[13px]">
                      {DESK_TITLE[lang]}
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] leading-snug text-[#1e293b] dark:text-[#dce3f3] line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                  {excerpt(item) && (
                    <p className="font-['Inter:Regular',sans-serif] text-[13px] leading-[1.6] text-[#64748b] dark:text-[#bec7d2] line-clamp-2 mb-3">
                      {excerpt(item)}
                    </p>
                  )}
                  <div className="mt-auto flex items-center gap-2 text-[12px] text-[#94a3b8]">
                    <span className="flex items-center gap-1.5">
                      <AuthorAvatar profile={{ handle: item.handle, display_name: item.display_name, avatar_url: item.avatar_url }} size={20} />
                      {lang === 'en' && item.display_name_en ? item.display_name_en : item.display_name}
                    </span>
                    {item.country && <span>· {COUNTRY_LABEL[item.country]?.[lang] ?? item.country}</span>}
                    <span className="ml-auto">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US') : ''}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {cursor && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-6 py-2.5 rounded-full border border-[#e2e8f0] dark:border-[#232a36] font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b] transition-colors disabled:opacity-50"
              >
                {t.readMore}
              </button>
            </div>
          )}
        </>
      )}
    </DeskShell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-[13px] font-['Inter:Medium',sans-serif] transition-colors whitespace-nowrap",
        active
          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white'
          : 'bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#bec7d2] hover:bg-[#e2e8f0] dark:hover:bg-[#334155]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
