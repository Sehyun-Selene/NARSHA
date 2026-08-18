import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLang } from '../lib/useLang';
import { useDocumentTitle } from '../lib/useDocumentTitle';

const TYPES = [
  { code: '가', sensory: 'Visual',   style: 'Exploratory', sensoryKo: '시각', styleKo: '탐색형' },
  { code: '나', sensory: 'Visual',   style: 'Structured',  sensoryKo: '시각', styleKo: '구조형' },
  { code: '다', sensory: 'Auditory', style: 'Exploratory', sensoryKo: '청각', styleKo: '탐색형' },
  { code: '라', sensory: 'Auditory', style: 'Structured',  sensoryKo: '청각', styleKo: '구조형' },
  { code: '마', sensory: 'Mixed',    style: 'Exploratory', sensoryKo: '혼합', styleKo: '탐색형' },
  { code: '바', sensory: 'Mixed',    style: 'Structured',  sensoryKo: '혼합', styleKo: '구조형' },
];

const CATEGORIES = {
  en: [
    'Learning Mechanism — How does the learner learn?',
    'Content Format — In what form is content delivered?',
    'Instructor / Operator Traits — Who teaches?',
    'Strength Areas — What abilities does it build?',
    'Learner Type Fit — What kind of learner is it best for?',
    'Accessibility & UX — How easy is it to use?',
    'Social Features — How does it connect learners?',
    'Limitations — What are the known weaknesses? (reference only)',
    'Learning Pace — How often and how long per session?',
    'Content Authority — What expertise backs it?',
    'Pricing — What is the cost structure?',
  ],
  ko: [
    '학습 매커니즘 — 어떻게 학습하는가',
    '콘텐츠 형식 — 어떤 형태로 제공되는가',
    '강사·운영자 특성 — 누가 가르치는가',
    '강점 영역 — 어떤 능력을 키울 수 있는가',
    '학습자 유형 적합도 — 어떤 학습자에게 잘 맞는가',
    '접근성·UX — 어떻게 쓰기 편한가',
    '사회적 요소 — 다른 학습자와 어떻게 연결되는가',
    '한계점 — 어떤 약점이 있는가 (참고용)',
    '학습 페이스 — 얼마나 자주, 얼마나 길게 학습하는가',
    '콘텐츠 신뢰성 — 어떤 권위에 기반하는가',
    '가격 — 비용 구조',
  ],
};

export default function Methodology() {
  useDocumentTitle('title.methodology');
  // 언어 전환은 헤더 한 곳에서만 제공한다 — 페이지 안에 토글을 또 두면
  // 같은 상태를 가리키는 UI 가 둘이 되어 혼란을 준다 (About 과 동일한 정리).
  const [lang] = useLang();
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-16">


          {/* ── Section 1: Learning Type Assessment ── */}
          <section className="mb-20">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw,2.25rem)] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-4">
              {isEn ? 'Learner Type Assessment' : '학습 유형 검사'}
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2] mb-10">
              {isEn
                ? "NARSHA's Learner Type Assessment is a simplified tool adapted from academic research for the Korean-learning context. It identifies six learner types along two axes: sensory preference and learning style approach."
                : '나르샤의 학습 유형 검사는 학술 연구에 기반해 한국어 학습 맥락에 맞춰 단순화한 도구입니다. 학습자의 감각 선호와 학습 접근 방식 두 축으로 6가지 유형을 도출합니다.'}
            </p>

            {/* Axes */}
            <div className="grid sm:grid-cols-2 gap-5 mb-10">
              <div className="bg-[#f0f9ff] dark:bg-[#0c1f2e] border-l-4 border-[#0ea5e9] rounded-r-[12px] p-5">
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#0ea5e9] dark:text-[#8ecdff] mb-2">
                  {isEn ? 'Sensory Axis' : '감각 축 (Sensory)'}
                </p>
                <ul className="space-y-1.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] leading-snug">
                  <li><strong>Visual {isEn ? '' : '(시각)'}</strong> — {isEn ? 'Learns best through text, charts, and video' : '글, 차트, 영상으로 학습할 때 효율적'}</li>
                  <li><strong>Auditory {isEn ? '' : '(청각)'}</strong> — {isEn ? 'Learns best through conversation, lectures, and audio' : '대화, 강의, 음원으로 학습할 때 효율적'}</li>
                  <li><strong>Mixed {isEn ? '' : '(혼합)'}</strong> — {isEn ? 'Combines visual and auditory resources' : '시각/청각 자원을 함께 활용'}</li>
                </ul>
              </div>
              <div className="bg-[#fdf4ff] dark:bg-[#1a0f2e] border-l-4 border-[#a855f7] rounded-r-[12px] p-5">
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#a855f7] mb-2">
                  {isEn ? 'Style Axis' : '스타일 축 (Style)'}
                </p>
                <ul className="space-y-1.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] leading-snug">
                  <li><strong>Exploratory {isEn ? '' : '(탐색형)'}</strong> — {isEn ? 'Learns by freely exploring' : '자유롭게 탐색하며 학습'}</li>
                  <li><strong>Structured {isEn ? '' : '(구조형)'}</strong> — {isEn ? 'Prefers step-by-step curricula' : '단계적 커리큘럼을 선호'}</li>
                </ul>
              </div>
            </div>

            {/* 6 types 2×3 grid */}
            <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
              {isEn ? '6 Learner Types' : '6가지 학습 유형'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
              {TYPES.map(t => (
                <div key={t.code} className="bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[12px] p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center shrink-0">
                    <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] text-[#00344f]">{t.code}</span>
                  </div>
                  <div>
                    <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3]">
                      {isEn ? `${t.sensory} · ${t.style}` : `${t.sensoryKo} · ${t.styleKo}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/*
              채점 방식 설명.
              히어로에서 '학습유형은 어떻게 구분하나요' 로 들어오는 페이지인데
              정작 '어떻게' 가 없었다. 문항 구성과 점수 환산을 밝힌다.
              ⚠️ 이 서술은 data/learnerTypes.ts 의 실제 구성·채점과 일치해야 한다.
            */}
            <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
              {isEn ? 'How the Test Is Scored' : '어떻게 판정하나요'}
            </h2>

            <div className="bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[12px] p-6 mb-10">
              <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.75] text-[#1e293b] dark:text-[#dce3f3] mb-5">
                {isEn
                  ? 'The test has 10 statements. Each is answered on a 5-point scale, and the items are split evenly across the four directions so that no single question decides your type.'
                  : '검사는 10개 문항으로 이루어집니다. 각 문항에 5점 척도로 답하고, 문항은 네 방향에 고르게 나뉘어 있어 한 문항이 유형을 결정하지 않습니다.'}
              </p>

              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#64748b] dark:text-[#8a94a6] mb-2">
                {isEn ? 'Item composition' : '문항 구성'}
              </p>
              <ul className="space-y-1.5 font-['Inter:Regular',sans-serif] text-[14px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2] mb-5">
                <li>{isEn ? 'Visual — 2 items' : '시각 — 2문항'}</li>
                <li>{isEn ? 'Auditory — 2 items' : '청각 — 2문항'}</li>
                <li>{isEn ? 'Exploratory — 3 items' : '탐색 — 3문항'}</li>
                <li>{isEn ? 'Structured — 3 items' : '구조 — 3문항'}</li>
              </ul>

              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#64748b] dark:text-[#8a94a6] mb-2">
                {isEn ? 'Turning answers into scores' : '응답을 점수로'}
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2] mb-3">
                {isEn
                  ? 'The middle of the scale counts as zero. Agreeing is evidence for that direction; disagreeing is evidence for the opposite one. Strength matters — a 5 counts twice as much as a 4.'
                  : '척도의 중앙은 0점입니다. 동의하면 그 방향의 근거가 되고, 동의하지 않으면 반대 방향의 근거가 됩니다. 강도도 반영되어 5는 4의 두 배로 계산됩니다.'}
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { a: '1', v: '−2' },
                  { a: '2', v: '−1' },
                  { a: '3', v: '0' },
                  { a: '4', v: '+1' },
                  { a: '5', v: '+2' },
                ].map(x => (
                  <span key={x.a} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] px-3 py-1.5 text-[13px]">
                    <span className="font-bold text-[#1e293b] dark:text-[#dce3f3]">{x.a}</span>
                    <span className="text-[#94a3b8]">→</span>
                    <span className="font-mono text-[#0ea5e9] dark:text-[#8ecdff]">{x.v}</span>
                  </span>
                ))}
              </div>

              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#64748b] dark:text-[#8a94a6] mb-2">
                {isEn ? 'Deciding each axis' : '축을 정하는 방법'}
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2]">
                {isEn
                  ? 'Each direction is averaged, then the two sides of an axis are compared. On the sensory axis, when the two sides are close, we only name a side if you actually agreed with its statements — merely disliking one less does not make it your preference, so that case becomes Mixed. The style axis has no middle type: the higher side wins, and a tie is read as Exploratory.'
                  : '방향마다 평균을 낸 뒤 축의 두 편을 비교합니다. 감각 축에서 두 편의 차이가 근소할 때는, 해당 방향의 문항에 실제로 동의했을 때만 그 유형으로 봅니다 — 한쪽을 덜 싫어한 것만으로는 선호라고 할 수 없어, 그 경우는 혼합형이 됩니다. 스타일 축에는 중간 유형이 없어 더 높은 쪽을 택하고, 완전히 같으면 탐색형으로 봅니다.'}
              </p>
            </div>

            {/* Citations */}
            <div className="bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[12px] p-6">
              <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#64748b] dark:text-[#8a94a6] mb-4">
                {isEn ? 'Academic References' : '참고 문헌'}
              </p>
              <div className="space-y-4 font-['Inter:Regular',sans-serif] text-[13px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2]">
                <p>
                  Cohen, A. D., Oxford, R. L., &amp; Chi, J. C. (2002). <em>Learning Style Survey: Assessing Your Own Learning Styles.</em> In <em>Maximizing Study Abroad.</em> CARLA (Center for Advanced Research on Language Acquisition), University of Minnesota.
                </p>
                <p>
                  Oxford, R. L. (1995). Style Analysis Survey (SAS). In J. Reid (Ed.), <em>Learning styles in the ESL/EFL classroom</em> (pp. 208–215). Boston: Heinle &amp; Heinle / Thomson International.
                </p>
                <p>
                  Ehrman, M. E., &amp; Leaver, B. L. (2001). <em>E&amp;L Questionnaire.</em>
                </p>
                <p className="text-[12px] text-[#94a3b8] dark:text-[#3f4850] mt-2">
                  {isEn
                    ? 'The original assessments cover 11 dimensions and 12 aspects. NARSHA simplifies to two axes (sensory + style) most relevant to the Korean-learning context.'
                    : '원본 검사는 11개 차원·12개 측면을 다루지만, 나르샤는 한국어 학습 맥락에서 가장 유의미한 두 축(감각 + 스타일)으로 단순화했습니다.'}
                </p>
              </div>
            </div>
          </section>

          <hr className="border-[#e2e8f0] dark:border-[#232a36] mb-20" />

          {/* ── Section 2: Tag System ── */}
          <section className="mb-12">
            <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw,2.25rem)] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-4">
              {isEn ? 'Service Tag System' : '서비스 차별점 태그'}
            </h2>
            <p className="font-['Inter:Regular',sans-serif] text-[16px] leading-[1.75] text-[#64748b] dark:text-[#bec7d2] mb-8">
              {isEn
                ? 'NARSHA classifies Korean learning services across 11 categories and approximately 60 tags. Each service is assigned up to 5 core differentiator tags.'
                : '나르샤는 한국어 학습 서비스를 11개 카테고리, 약 60개 태그로 분류합니다. 각 서비스에 최대 5개의 핵심 차별점 태그가 부여됩니다.'}
            </p>

            <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
              {isEn ? '11 Tag Categories' : '11개 카테고리'}
            </h3>
            <ol className="space-y-2 mb-10">
              {CATEGORIES[lang].map((cat, i) => (
                <li key={i} className="flex gap-3 font-['Inter:Regular',sans-serif] text-[15px] leading-snug text-[#1e293b] dark:text-[#dce3f3]">
                  <span className="shrink-0 w-6 h-6 bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white dark:text-[#8ecdff] rounded-full flex items-center justify-center text-[11px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{cat}</span>
                </li>
              ))}
            </ol>

            {/* Two-source explanation */}
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="bg-[#f0f9ff] dark:bg-[#0c1f2e] border-l-4 border-[#0ea5e9] rounded-r-[12px] p-5">
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#0ea5e9] dark:text-[#8ecdff] mb-2">
                  {isEn ? '🏷️ Curated by NARSHA' : '🏷️ 운영자 큐레이션'}
                </p>
                <p className="text-[14px] leading-[1.7] text-[#1e293b] dark:text-[#dce3f3]">
                  {isEn
                    ? 'Official tags reviewed and assigned by the NARSHA team based on direct evaluation of each service.'
                    : '나르샤 팀이 직접 검토한 공식 태그. 각 서비스를 직접 평가해 부여합니다.'}
                </p>
              </div>
              <div className="bg-[#f8fafc] dark:bg-[#151c27] border-l-4 border-[#64748b] dark:border-[#8a94a6] rounded-r-[12px] p-5">
                <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] uppercase tracking-[0.08em] text-[#64748b] dark:text-[#8a94a6] mb-2">
                  {isEn ? '👥 Learner Reviews' : '👥 학습자 평가'}
                </p>
                <p className="text-[14px] leading-[1.7] text-[#1e293b] dark:text-[#dce3f3]">
                  {isEn
                    ? 'Strengths and limitations selected by actual users when writing reviews. Updated continuously as more reviews come in.'
                    : '실제 사용자가 리뷰 작성 시 선택한 강점·약점. 리뷰가 쌓이면서 지속적으로 보강됩니다.'}
                </p>
              </div>
            </div>

            <p className="font-['Inter:Regular',sans-serif] text-[14px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2]">
              {isEn
                ? 'Initial tags for 33 services were assigned based on a survey of 90 Korean learners from 30 countries, combined with publicly available service information.'
                : '초기 33개 서비스의 태그는 30개국 90명의 한국어 학습자 설문조사와 공개된 서비스 정보를 바탕으로 부여되었습니다.'}
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
