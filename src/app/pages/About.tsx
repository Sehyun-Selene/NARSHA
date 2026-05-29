import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SuggestServiceModal from '../components/SuggestServiceModal';
import { useLang } from '../lib/useLang';

const content = {
  en: {
    hero: 'Wings for Your Korean Learning Journey.',
    missionHeading: 'One Map for Scattered Resources',
    missionBody: [
      'We help Korean learners stop wandering.',
      'The Korean learning market already has enough content. What\'s missing is a way for learners to find their path through it.',
      'NARSHA is the single platform that connects a fragmented Korean learning market.',
    ],
    visionHeading: 'The First Stop for Every Korean Learner',
    visionBody: [
      'A platform that 40 million Korean learners worldwide turn to first.',
      'The name that comes to mind when someone thinks, "I want to learn Korean." A space where scattered learning resources, reviews, curricula, and feedback are connected into one ecosystem.',
      'Our goal is to become the foundational infrastructure of the Korean language education market.',
    ],
    valuesHeading: 'Our Principles',
    values: [
      {
        title: 'Learner First',
        body: 'Every decision is measured by whether it genuinely helps learners. The growth of the learner — not platform convenience or revenue — comes first.',
      },
      {
        title: 'Open Curation',
        body: "We don't monopolize content. We transparently connect external resources and help learners make their own choices.",
      },
      {
        title: 'Evidence-Based',
        body: 'We build with real learner voices and data, not intuition. A survey of 90 learners from 30 countries was our first step.',
      },
      {
        title: 'Human × AI',
        body: 'Technology provides efficiency, but the essence of learning lies in human connection. Expert curation and AI assistance work together.',
      },
    ],
    ctaSuggest: 'Suggest a Service',
    ctaContact:  'Contact Us',
  },
  ko: {
    hero: '한국어 학습에 날개를 달다.',
    missionHeading: '흩어진 자원을 하나의 지도로',
    missionBody: [
      '우리는 한국어 학습자가 더 이상 헤매지 않도록 돕습니다.',
      '한국어 학습 시장은 이미 충분한 콘텐츠를 가지고 있습니다. 부족한 것은 콘텐츠가 아니라, 학습자가 그 속에서 길을 찾을 방법입니다.',
      '나르샤는 파편화된 한국어 학습 시장을 연결하는 단 하나의 플랫폼이 되겠습니다.',
    ],
    visionHeading: '한국어 학습을 시작하는 모든 사람의 첫 번째 목적지',
    visionBody: [
      '전 세계 4,000만 한국어 학습자가 가장 먼저 찾는 플랫폼.',
      '학습자들이 "한국어를 배우고 싶다"고 생각했을 때 가장 먼저 떠오르는 이름. 흩어져 있던 학습 자원·후기·커리큘럼·피드백이 하나의 생태계로 연결된 공간.',
      '우리는 한국어 교육 시장의 기본 인프라가 되는 것을 목표합니다.',
    ],
    valuesHeading: '우리의 원칙',
    values: [
      {
        title: '학습자 중심 (Learner First)',
        body: '모든 결정은 학습자에게 실제로 도움이 되는가를 기준으로 합니다. 플랫폼의 편의나 수익이 아닌, 학습자의 성장이 최우선입니다.',
      },
      {
        title: '열린 큐레이션 (Open Curation)',
        body: '콘텐츠를 독점하지 않습니다. 외부 자원을 투명하게 연결하고, 학습자가 직접 선택할 수 있도록 돕습니다.',
      },
      {
        title: '데이터로 증명 (Evidence-Based)',
        body: '직감이 아닌 실제 학습자의 목소리와 데이터로 제품을 만듭니다. 30개국 90명의 학습자 설문조사가 첫걸음입니다.',
      },
      {
        title: '사람과 기술의 균형 (Human × AI)',
        body: '기술은 효율을 제공하지만, 학습의 본질은 사람과 사람의 연결에 있습니다. 전문가의 큐레이션과 AI의 보조가 함께 작동합니다.',
      },
    ],
    ctaSuggest: '서비스 제안하기',
    ctaContact:  '문의하기',
  },
};

function LangToggle({ lang, setLang }: { lang: 'en' | 'ko'; setLang: (l: 'en' | 'ko') => void }) {
  return (
    <div className="flex gap-1 bg-[#f1f5f9] dark:bg-[#232a36] rounded-full p-0.5">
      {(['en', 'ko'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`text-[12px] font-bold px-3 py-1 rounded-full transition-all ${lang === l ? 'bg-white dark:bg-[#151c27] text-[#1e293b] dark:text-[#dce3f3] shadow-sm' : 'text-[#64748b] dark:text-[#8a94a6]'}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function About() {
  const [lang, setLang] = useLang();
  const [showModal, setShowModal] = useState(false);
  const c = content[lang];

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-16">

          {/* Lang toggle */}
          <div className="flex justify-end mb-10">
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          {/* Hero */}
          <div className="mb-16 text-center">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(2rem,4vw,3rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em]">
              {c.hero}
            </h1>
          </div>

          {/* Mission */}
          <section className="mb-16">
            <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-6">
              {c.missionHeading}
            </h2>
            <div className="space-y-4">
              {c.missionBody.map((p, i) => (
                <p key={i} className="font-['Inter:Regular',sans-serif] text-[17px] leading-[1.75] text-[#1e293b] dark:text-[#dce3f3]">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <hr className="border-[#e2e8f0] dark:border-[#232a36] mb-16" />

          {/* Vision */}
          <section className="mb-16">
            <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-6">
              {c.visionHeading}
            </h2>
            <div className="space-y-4">
              {c.visionBody.map((p, i) => (
                <p key={i} className="font-['Inter:Regular',sans-serif] text-[17px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]">
                  {p}
                </p>
              ))}
            </div>
          </section>

          <hr className="border-[#e2e8f0] dark:border-[#232a36] mb-16" />

          {/* Values 2×2 grid */}
          <section className="mb-16">
            <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-8">
              {c.valuesHeading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {c.values.map(v => (
                <div key={v.title} className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-6 border border-[#e2e8f0] dark:border-[#232a36]">
                  <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-3">{v.title}</h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]">{v.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] px-8 py-3 rounded-[8px] hover:opacity-90 transition-opacity"
            >
              {c.ctaSuggest}
            </button>
            <a
              href="https://mail.google.com/mail/?view=cm&to=narsha.koreanedu@gmail.com&subject=NARSHA%20Contact"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-[#1e293b] dark:border-[#8ecdff] text-[#1e293b] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[15px] px-8 py-3 rounded-[8px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
            >
              {c.ctaContact}
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <SuggestServiceModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
