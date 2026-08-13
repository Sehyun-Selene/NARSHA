import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { ChevronDown } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuggestServiceModal from '../components/SuggestServiceModal';
import { useT } from '../i18n';
import type { StringKey } from '../i18n';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { Eyebrow, Reveal, HEAD_CLASS, BODY_CLASS } from './about/_shared';

const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&to=narsha.koreanedu@gmail.com&subject=NARSHA%20Contact';

type Category = 'service' | 'survey' | 'listing' | 'review';

const CATEGORIES: { value: 'all' | Category; labelKey: StringKey }[] = [
  { value: 'all',     labelKey: 'faq.cat.all' },
  { value: 'service', labelKey: 'faq.cat.service' },
  { value: 'survey',  labelKey: 'faq.cat.survey' },
  { value: 'listing', labelKey: 'faq.cat.listing' },
  { value: 'review',  labelKey: 'faq.cat.review' },
];

/**
 * 문항은 코드 배열로 관리한다 — 추가·삭제·순서 변경이 사전 수정 없이 끝난다.
 * 답변에 링크가 필요하면 문자열에 HTML 을 넣지 말고 `link` 로 분리한다 (R4.24).
 */
type FaqItem = {
  id: string;
  category: Category;
  q: StringKey;
  a: StringKey;
  link?: { to: string; labelKey: StringKey };
  /** 서비스 제안 모달을 여는 항목 (라우트가 아니라 모달이라 별도로 둔다). */
  opensSuggest?: boolean;
};

const ITEMS: FaqItem[] = [
  { id: 'faq-what',       category: 'service', q: 'faq.q.what.q',      a: 'faq.q.what.a' },
  { id: 'faq-pricing',    category: 'service', q: 'faq.q.pricing.q',   a: 'faq.q.pricing.a' },
  { id: 'faq-teach',      category: 'service', q: 'faq.q.teach.q',     a: 'faq.q.teach.a' },
  { id: 'faq-test-what',  category: 'survey',  q: 'faq.q.testWhat.q',  a: 'faq.q.testWhat.a',
    link: { to: '/survey', labelKey: 'faq.link.survey' } },
  { id: 'faq-test-use',   category: 'survey',  q: 'faq.q.testUse.q',   a: 'faq.q.testUse.a',
    link: { to: '/survey', labelKey: 'faq.link.survey' } },
  { id: 'faq-criteria',   category: 'listing', q: 'faq.q.criteria.q',  a: 'faq.q.criteria.a' },
  { id: 'faq-list-mine',  category: 'listing', q: 'faq.q.listMine.q',  a: 'faq.q.listMine.a',
    opensSuggest: true },
  { id: 'faq-who-review', category: 'review',  q: 'faq.q.whoReview.q', a: 'faq.q.whoReview.a',
    // 후기는 Discover 안의 '학습유형별로 보기' 로 이동했다 (REQ-A)
    link: { to: '/?view=type', labelKey: 'faq.link.reviews' } },
];

function isCategory(value: string | null): value is 'all' | Category {
  return CATEGORIES.some(c => c.value === value);
}

export default function Faq() {
  useDocumentTitle('title.faq');
  const { t } = useT();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSuggest, setShowSuggest] = useState(false);

  const param = searchParams.get('c');
  const category = isCategory(param) ? param : 'all';

  // 닫힌 제목 목록만 보이면 빈 화면처럼 느껴진다 — 첫 항목은 펼쳐 둔다 (R4.20).
  // 복수 개방을 허용한다. 여러 답변을 비교해 읽는 경우가 흔하다 (R4.19).
  const [openIds, setOpenIds] = useState<string[]>([ITEMS[0].id]);

  // 해시로 들어오면 해당 항목을 펼치고 스크롤한다 (R4.22).
  // 항목이 현재 탭에서 걸러지는 경우에는 전체 탭으로 되돌린다.
  useEffect(() => {
    const id = location.hash.replace('#', '');
    const target = ITEMS.find(item => item.id === id);
    if (!target) return;

    setOpenIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    if (category !== 'all' && target.category !== category) {
      setSearchParams({}, { replace: true });
    }
    // ScrollToTop 이 라우트 진입 시 최상단으로 보내므로 다음 프레임에 맞춘다.
    const timer = setTimeout(() => {
      // 부드러운 스크롤은 탭이 프레임을 그리지 않는 동안 진행되지 않아
      // 깊은 링크로 들어왔을 때 제자리에 머문다. 즉시 이동으로 둔다.
      document.getElementById(id)?.scrollIntoView({ block: 'start' });
    }, 80);
    return () => clearTimeout(timer);
    // category / setSearchParams 를 의존성에 넣으면 탭을 바꿀 때마다 다시 스크롤한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.hash]);

  const visible = category === 'all' ? ITEMS : ITEMS.filter(item => item.category === category);

  const toggle = (id: string) =>
    setOpenIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const selectCategory = (value: 'all' | Category) =>
    setSearchParams(value === 'all' ? {} : { c: value });

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-20 sm:py-24">

          {/* Hero */}
          <Reveal>
            <Eyebrow label={t('faq.hero.eyebrow')} />
            <h1 className={HEAD_CLASS}>{t('faq.hero.head')}</h1>
            <p className={`${BODY_CLASS} mt-4`}>{t('faq.hero.lead')}</p>
          </Reveal>

          {/* 카테고리 탭 — URL 쿼리에 반영해 링크로 공유할 수 있게 한다 (R4.21) */}
          <div className="mt-10 flex flex-wrap gap-2" role="group" aria-label={t('faq.hero.head')}>
            {CATEGORIES.map(cat => {
              const active = cat.value === category;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => selectCategory(cat.value)}
                  aria-pressed={active}
                  className={`text-[13px] px-3.5 py-1.5 rounded-full border transition-all font-['Manrope:Medium',sans-serif] font-medium ${
                    active
                      ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] border-transparent'
                      : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#8a94a6] border-[#e2e8f0] dark:border-[#2e3541] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]'
                  }`}
                >
                  {t(cat.labelKey)}
                </button>
              );
            })}
          </div>

          {/* 아코디언 — <details> 대신 버튼 + aria 조합 (R4.18) */}
          <div className="mt-8 divide-y divide-[#e2e8f0] dark:divide-[#232a36] border-t border-b border-[#e2e8f0] dark:border-[#232a36]">
            {visible.map(item => {
              const open = openIds.includes(item.id);
              return (
                <div key={item.id} id={item.id} className="scroll-mt-24">
                  <h2>
                    <button
                      type="button"
                      id={`${item.id}-button`}
                      aria-expanded={open}
                      aria-controls={`${item.id}-panel`}
                      onClick={() => toggle(item.id)}
                      className="w-full flex items-start justify-between gap-4 text-left py-5 group"
                    >
                      <span className="font-['Manrope:Bold',sans-serif] font-bold text-[17px] leading-[1.5] text-[#1e293b] dark:text-[#dce3f3] group-hover:text-[#0ea5e9] dark:group-hover:text-[#8ecdff] transition-colors">
                        {t(item.q)}
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`w-5 h-5 shrink-0 mt-0.5 text-[#94a3b8] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </h2>

                  <div
                    id={`${item.id}-panel`}
                    role="region"
                    aria-labelledby={`${item.id}-button`}
                    hidden={!open}
                    className="pb-6 pr-9"
                  >
                    <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.8] text-[#64748b] dark:text-[#bec7d2]">
                      {t(item.a)}
                    </p>
                    {item.link && (
                      <Link
                        to={item.link.to}
                        className="mt-3 inline-block text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] hover:underline"
                      >
                        {t(item.link.labelKey)}
                      </Link>
                    )}
                    {item.opensSuggest && (
                      <button
                        type="button"
                        onClick={() => setShowSuggest(true)}
                        className="mt-3 inline-block text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] hover:underline"
                      >
                        {t('faq.link.suggest')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 CTA */}
          <Reveal className="mt-14 text-center">
            <p className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
              {t('faq.cta.head')}
            </p>
            <a
              href={CONTACT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block border-2 border-[#1e293b] dark:border-[#8ecdff] text-[#1e293b] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[15px] px-8 py-3 rounded-[8px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
            >
              {t('faq.cta.contact')}
            </a>
          </Reveal>

        </div>
      </main>

      <Footer />
      <SuggestServiceModal open={showSuggest} onClose={() => setShowSuggest(false)} />
    </div>
  );
}
