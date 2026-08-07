import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLang } from '../lib/useLang';
import { useDocumentTitle } from '../lib/useDocumentTitle';

function LangToggle({ lang, setLang }: { lang: 'en' | 'ko'; setLang: (l: 'en' | 'ko') => void }) {
  return (
    <div className="flex gap-1 bg-[#f1f5f9] dark:bg-[#232a36] rounded-full p-0.5">
      {(['en', 'ko'] as const).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className={`text-[12px] font-bold px-3 py-1 rounded-full transition-all ${lang === l ? 'bg-white dark:bg-[#151c27] text-[#1e293b] dark:text-[#dce3f3] shadow-sm' : 'text-[#64748b] dark:text-[#8a94a6]'}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

const KO = () => (
  <div className="space-y-8 font-['Inter:Regular',sans-serif] text-[15px] leading-[1.8] text-[#1e293b] dark:text-[#dce3f3]">
    <div>
      <p className="text-[14px] text-[#64748b] dark:text-[#8a94a6] mb-1">시행일: <strong>2026-XX-XX</strong></p>
      <p>나르샤(이하 "서비스")는 개인정보 보호법 등 관계 법령에 따라 이용자의 개인정보를 보호하고 권리를 보장하기 위해 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>
    </div>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">1. 수집하는 개인정보 항목</h2>
      <p className="mb-2">서비스는 다음의 개인정보 항목을 수집합니다.</p>
      <p className="font-bold mb-1">가. 필수 항목 (자동 수집)</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2] mb-3">
        <li>학습 유형 검사 결과 (브라우저 localStorage에 저장)</li>
        <li>익명 사용자 ID (브라우저별 자동 생성, localStorage 저장)</li>
        <li>리뷰 작성 내용 (학습 유형 뱃지, 별점, 텍스트, 선택 태그)</li>
      </ul>
      <p className="font-bold mb-1">나. 선택 항목 (사용자가 직접 입력)</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>서비스 제안 시 이메일 주소 (답변 받기를 원하는 경우)</li>
        <li>리뷰 작성 시 닉네임</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">2. 개인정보의 처리 목적</h2>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>한국어 학습 자원 추천 및 큐레이션</li>
        <li>학습자 리뷰 통계 분석 및 자료 보강</li>
        <li>서비스 제안에 대한 회신 (이메일 입력 시)</li>
        <li>서비스 개선을 위한 통계 분석</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">3. 개인정보의 보유 및 이용 기간</h2>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>localStorage 데이터: 사용자가 브라우저 데이터를 삭제할 때까지</li>
        <li>Supabase 저장 데이터 (리뷰, 서비스 제안): 서비스 종료 시까지</li>
        <li>이메일 회신 후 별도 보관하지 않음</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">4. 개인정보의 제3자 제공</h2>
      <p>서비스는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 다음 경우는 예외로 합니다.</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2] mt-2">
        <li>법령에 의해 요구되는 경우</li>
        <li>이용자가 사전에 동의한 경우</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">5. 개인정보 처리의 위탁</h2>
      <p>서비스는 원활한 운영을 위해 다음 업체에 데이터 저장을 위탁합니다.</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2] mt-2">
        <li>Supabase (데이터베이스 호스팅)</li>
        <li>Vercel (웹 호스팅)</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">6. 정보주체의 권리</h2>
      <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2] mt-2">
        <li>개인정보 열람·정정·삭제 요구</li>
        <li>처리 정지 요구</li>
        <li>동의 철회</li>
      </ul>
      <p className="mt-2">행사 방법: 아래 연락처로 문의</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">7. 쿠키 및 localStorage 사용</h2>
      <p>서비스는 사용자 식별 및 편의 제공을 위해 브라우저 localStorage를 사용합니다. 사용자는 브라우저 설정에서 이를 거부할 수 있으며, 거부 시 일부 기능 이용에 제한이 있을 수 있습니다.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">8. 개인정보 보호 책임자</h2>
      <p>이름: 김세현 / 유정민</p>
      <p>이메일: <a href="mailto:narsha.koreanedu@gmail.com?subject=NARSHA%20Privacy" className="text-[#0ea5e9] dark:text-[#8ecdff] hover:underline">narsha.koreanedu@gmail.com</a></p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">9. 개인정보 처리방침의 변경</h2>
      <p>본 방침의 내용이 변경되는 경우 서비스 공지를 통해 안내합니다.</p>
    </section>

    <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] border-t border-[#e2e8f0] dark:border-[#232a36] pt-4">
      부칙: 본 방침은 <strong>2026-XX-XX</strong>부터 시행합니다.
    </p>
  </div>
);

const EN = () => (
  <div className="space-y-8 font-['Inter:Regular',sans-serif] text-[15px] leading-[1.8] text-[#1e293b] dark:text-[#dce3f3]">
    <div>
      <p className="text-[14px] text-[#64748b] dark:text-[#8a94a6] mb-1">Effective date: <strong>2026-XX-XX</strong></p>
      <p>NARSHA ("the Service") establishes and discloses this Privacy Policy to protect users' personal information and ensure their rights in accordance with the Personal Information Protection Act (PIPA) and other applicable laws of the Republic of Korea.</p>
    </div>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">1. Personal Information We Collect</h2>
      <p className="font-bold mb-1">A. Required (collected automatically)</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2] mb-3">
        <li>Learner type assessment results (stored in browser localStorage)</li>
        <li>Anonymous user ID (auto-generated per browser, stored in localStorage)</li>
        <li>Review content (learner type badge, star rating, text, selected tags)</li>
      </ul>
      <p className="font-bold mb-1">B. Optional (entered directly by users)</p>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Email address when suggesting a service (only if user wishes a reply)</li>
        <li>Nickname when writing a review</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">2. Purpose of Processing</h2>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Recommending and curating Korean learning resources</li>
        <li>Statistical analysis of learner reviews and content enrichment</li>
        <li>Responding to service suggestions (when email is provided)</li>
        <li>Statistical analysis for service improvement</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">3. Retention Period</h2>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>localStorage data: until the user clears browser data</li>
        <li>Supabase data (reviews, suggestions): until the service is terminated</li>
        <li>Email addresses: not retained after the reply is sent</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">4. Third-Party Sharing</h2>
      <p>We do not share personal information with third parties, except when required by law or with the user's prior consent.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">5. Data Processing Entrusted to Third Parties</h2>
      <ul className="list-disc pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Supabase (database hosting)</li>
        <li>Vercel (web hosting)</li>
      </ul>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">6. User Rights</h2>
      <p>Users may exercise the following rights at any time: access, correction, deletion, suspension of processing, and withdrawal of consent. To exercise these rights, please contact us at the address below.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">7. Use of localStorage</h2>
      <p>The Service uses browser localStorage for user identification and convenience. Users may disable this in browser settings, which may limit certain features.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">8. Privacy Officer</h2>
      <p>Name: Sehyun Kim / Jeongmin Yu</p>
      <p>Email: <a href="mailto:narsha.koreanedu@gmail.com?subject=NARSHA%20Privacy" className="text-[#0ea5e9] dark:text-[#8ecdff] hover:underline">narsha.koreanedu@gmail.com</a></p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">9. Changes to This Policy</h2>
      <p>We will notify users of any changes to this policy through a service announcement.</p>
    </section>

    <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] border-t border-[#e2e8f0] dark:border-[#232a36] pt-4">
      This policy is effective from <strong>2026-XX-XX</strong>.
    </p>
  </div>
);

export default function PrivacyPolicy() {
  useDocumentTitle('title.privacy');
  const [lang, setLang] = useLang();

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-16">
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw,2.25rem)] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em]">
              {lang === 'ko' ? '개인정보 처리방침' : 'Privacy Policy'}
            </h1>
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          {lang === 'ko' ? <KO /> : <EN />}

          <p className="mt-12 text-[12px] text-[#94a3b8] dark:text-[#3f4850] leading-relaxed border-t border-[#e2e8f0] dark:border-[#232a36] pt-6">
            {lang === 'ko'
              ? '본 방침은 일반적인 가이드이며, 정확한 법적 효력을 위해서는 전문 변호사의 검토가 필요할 수 있습니다.'
              : 'This policy serves as a general guide. For precise legal effect, professional legal review is recommended.'}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
