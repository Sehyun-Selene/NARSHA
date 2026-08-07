import { Link } from 'react-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useT } from '../i18n';
import { rich } from '../i18n/rich';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { Eyebrow, Reveal, Section, HEAD_CLASS, BODY_CLASS, CARD_CLASS } from './about/_shared';

const CONTACT_URL =
  'https://mail.google.com/mail/?view=cm&to=narsha.koreanedu@gmail.com&subject=NARSHA%20Contact';

const PROBLEM_CARDS = [
  { num: '01', titleKey: 'about.problem.c1.title', bodyKey: 'about.problem.c1.body' },
  { num: '02', titleKey: 'about.problem.c2.title', bodyKey: 'about.problem.c2.body' },
  { num: '03', titleKey: 'about.problem.c3.title', bodyKey: 'about.problem.c3.body' },
] as const;

// 설문 수치는 사전이 아니라 여기 상수로 둔다 — 갱신 지점을 한 곳으로 모으기 위함.
const RESEARCH_METRICS = [
  { value: '90',  labelKey: 'about.research.m1' },
  { value: '30+', labelKey: 'about.research.m2' },
  { value: '87%', labelKey: 'about.research.m3' },
  { value: '68%', labelKey: 'about.research.m4' },
  { value: '82%', labelKey: 'about.research.m5' },
] as const;

const VISION_STATS = [
  { valueKey: 'about.vision.s1.value', labelKey: 'about.vision.s1', source: 'Statista' },
  { valueKey: 'about.vision.s2.value', labelKey: 'about.vision.s2', source: '' },
  { valueKey: 'about.vision.s3.value', labelKey: 'about.vision.s3', source: 'Statista' },
] as const;

// 영문 부제는 번역 대상이 아니다 — 원칙의 고정 명칭으로 쓴다.
const VALUES = [
  { roman: 'i.',   subtitle: 'LEARNER FIRST',  titleKey: 'about.values.v1.title', bodyKey: 'about.values.v1.body' },
  { roman: 'ii.',  subtitle: 'OPEN CURATION',  titleKey: 'about.values.v2.title', bodyKey: 'about.values.v2.body' },
  { roman: 'iii.', subtitle: 'EVIDENCE-BASED', titleKey: 'about.values.v3.title', bodyKey: 'about.values.v3.body' },
  { roman: 'iv.',  subtitle: 'HUMAN × AI',     titleKey: 'about.values.v4.title', bodyKey: 'about.values.v4.body' },
] as const;

export default function About() {
  useDocumentTitle('title.about');
  const { t, tLines } = useT();

  // 헤더의 학습 유형 검사 진입과 같은 동작 (PRD R4.8).
  const clearReturnApp = () => localStorage.removeItem('narsha-return-app-id');

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />

      <main className="flex-1 pt-16">

        {/* ── 0 · Hero ────────────────────────────────────────────────────── */}
        <Section>
          <Reveal className="max-w-[760px] mx-auto text-center">
            <div className="flex justify-center">
              <Eyebrow label={t('about.hero.eyebrow')} />
            </div>
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(2rem,4vw+0.5rem,3.25rem)] leading-[1.2] tracking-[-0.035em] text-[#1e293b] dark:text-[#dce3f3]">
              {t('about.hero.head')}
            </h1>
            <p className={`${BODY_CLASS} mt-6`}>{t('about.hero.lead')}</p>
          </Reveal>
        </Section>

        {/* ── 1 · Mission ─────────────────────────────────────────────────── */}
        <Section id="mission" alt>
          <Reveal>
            <Eyebrow label={t('about.mission.eyebrow')} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start">
              <h2 className={HEAD_CLASS}>{rich(t('about.mission.head'))}</h2>
              <div>
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[19px] leading-[1.6] text-[#1e293b] dark:text-[#dce3f3]">
                  {t('about.mission.lead')}
                </p>
                <div className="mt-5 space-y-4 max-w-[720px]">
                  {tLines('about.mission.body').map((line, i) => (
                    <p key={i} className={BODY_CLASS}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </Section>

        {/* ── 2 · Problem — Coral 전용 구역 (R4.2) ─────────────────────────── */}
        <Section id="problem">
          <Reveal>
            <Eyebrow label={t('about.problem.eyebrow')} tone="problem" />
            <h2 className={HEAD_CLASS}>
              {tLines('about.problem.head').map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h2>
            <p className={`${BODY_CLASS} mt-5 max-w-[720px]`}>{t('about.problem.lead')}</p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROBLEM_CARDS.map((card, i) => (
              <Reveal key={card.num} delay={i * 90}>
                <article className={`${CARD_CLASS} h-full`}>
                  <div className="h-[3px] bg-[var(--accent-problem)]" aria-hidden="true" />
                  <div className="p-7">
                    <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] tracking-[0.1em] text-[var(--accent-problem)]">
                      {card.num}
                    </p>
                    <h3 className="mt-3 font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
                      {t(card.titleKey)}
                    </h3>
                    <p className="mt-3 font-['Inter:Regular',sans-serif] text-[15px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]">
                      {t(card.bodyKey)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 3 · Market Research ─────────────────────────────────────────── */}
        <Section id="research" alt>
          <Reveal>
            <Eyebrow label={t('about.research.eyebrow')} />
            <h2 className={HEAD_CLASS}>{t('about.research.head')}</h2>
            <p className={`${BODY_CLASS} mt-4`}>{t('about.research.lead')}</p>
          </Reveal>

          <Reveal className="mt-12">
            <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[#e2e8f0] dark:bg-[#232a36] rounded-[16px] overflow-hidden">
              {RESEARCH_METRICS.map(metric => (
                <div key={metric.labelKey} className="bg-[#ffffff] dark:bg-[#0c141f] px-5 py-7 text-center">
                  <dt className="sr-only">{t(metric.labelKey)}</dt>
                  <dd>
                    <span className="block font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[34px] leading-none bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]">
                      {metric.value}
                    </span>
                    <span className="mt-2 block font-['Inter:Regular',sans-serif] text-[13px] text-[#64748b] dark:text-[#bec7d2]">
                      {t(metric.labelKey)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal className="mt-8">
            <div className="border-l-4 border-[#0ea5e9] dark:border-[#8ecdff] bg-[#e0f2fe] dark:bg-[#0f3a4a] rounded-r-[12px] px-6 py-5">
              <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-[1.7] text-[#1e293b] dark:text-[#dce3f3]">
                <strong className="font-['Manrope:Bold',sans-serif] font-bold">
                  {t('about.research.keyLabel')}
                </strong>
                {' — '}
                {t('about.research.keyBody')}
              </p>
            </div>
          </Reveal>
        </Section>

        {/* ── 4 · Vision ──────────────────────────────────────────────────── */}
        <Section id="vision">
          <Reveal>
            <Eyebrow label={t('about.vision.eyebrow')} />
            <h2 className={HEAD_CLASS}>
              {tLines('about.vision.head').map((line, i) => (
                <span key={i} className="block">{rich(line)}</span>
              ))}
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 md:gap-12 items-stretch">
            <Reveal>
              <div className="h-full rounded-[16px] bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] px-8 py-10 flex flex-col justify-center">
                <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(2.5rem,5vw,3.75rem)] leading-none text-[#00344f]">
                  {t('about.vision.big')}
                </span>
                <span className="mt-4 font-['Inter:Medium',sans-serif] font-medium text-[15px] leading-[1.6] text-[#00344f]/80">
                  {t('about.vision.bigLabel')}
                </span>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="space-y-5 max-w-[720px]">
                {tLines('about.vision.body').map((line, i) => (
                  <p key={i} className={BODY_CLASS}>{line}</p>
                ))}
              </div>
            </Reveal>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {VISION_STATS.map((stat, i) => (
              <Reveal key={stat.labelKey} delay={i * 90}>
                <div className={`${CARD_CLASS} h-full p-6`}>
                  <span className="block font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] leading-none text-[#0ea5e9] dark:text-[#8ecdff]">
                    {t(stat.valueKey)}
                  </span>
                  <span className="mt-3 block font-['Inter:Regular',sans-serif] text-[14px] leading-[1.6] text-[#64748b] dark:text-[#bec7d2]">
                    {t(stat.labelKey)}
                  </span>
                  {stat.source && (
                    <span className="mt-2 block text-[11px] text-[#94a3b8] dark:text-[#3f4850]">
                      {stat.source}
                    </span>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 5 · Values — Amber 전용 구역 (R4.6) ──────────────────────────── */}
        <Section id="values" alt>
          <Reveal>
            <Eyebrow label={t('about.values.eyebrow')} tone="values" />
            <h2 className={HEAD_CLASS}>{t('about.values.head')}</h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <Reveal key={value.subtitle} delay={i * 80}>
                <article className={`${CARD_CLASS} h-full`}>
                  <div className="h-[3px] bg-[var(--accent-values)]" aria-hidden="true" />
                  <div className="p-7">
                    <p className="font-['Manrope:Bold',sans-serif] font-bold text-[15px] text-[var(--accent-values)]">
                      {value.roman}
                    </p>
                    <h3 className="mt-3 font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
                      {t(value.titleKey)}
                    </h3>
                    <p className="mt-1 font-['Manrope:Bold',sans-serif] font-bold text-[11px] tracking-[0.15em] uppercase text-[var(--accent-values)]">
                      {value.subtitle}
                    </p>
                    <p className="mt-4 font-['Inter:Regular',sans-serif] text-[15px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]">
                      {t(value.bodyKey)}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── 7 · CTA ─────────────────────────────────────────────────────── */}
        <Section>
          <Reveal className="text-center max-w-[640px] mx-auto">
            <h2 className={HEAD_CLASS}>{t('about.cta.tagline')}</h2>
            <div className="mt-8 flex gap-3 flex-wrap justify-center">
              <Link
                to="/survey"
                onClick={clearReturnApp}
                className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] px-8 py-3 rounded-[8px] hover:opacity-90 transition-opacity"
              >
                {t('about.cta.primary')}
              </Link>
              <a
                href={CONTACT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-[#1e293b] dark:border-[#8ecdff] text-[#1e293b] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[15px] px-8 py-3 rounded-[8px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
              >
                {t('about.cta.secondary')}
              </a>
            </div>
            <Link
              to="/faq"
              className="mt-6 inline-block text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] hover:underline"
            >
              {t('about.cta.faq')}
            </Link>
          </Reveal>
        </Section>

      </main>

      <Footer />
    </div>
  );
}
