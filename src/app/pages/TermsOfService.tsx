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
    <p className="text-[14px] text-[#64748b] dark:text-[#8a94a6]">시행일: <strong>2026-XX-XX</strong></p>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제1조 (목적)</h2>
      <p>본 약관은 나르샤(이하 "서비스")의 이용 조건 및 절차, 이용자와 서비스의 권리·의무·책임 사항을 규정함을 목적으로 합니다.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제2조 (용어의 정의)</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>"서비스"란 한국어 학습 자원을 큐레이션하여 제공하는 나르샤 플랫폼을 말합니다.</li>
        <li>"이용자"란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
        <li>"리뷰"란 이용자가 서비스 내에 게시한 한국어 학습 자원에 대한 평가 콘텐츠를 말합니다.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제3조 (약관의 게시와 개정)</h2>
      <p>서비스는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 화면에 게시합니다. 약관 변경 시 변경 사항을 최소 7일 전에 공지합니다.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제4조 (이용 자격)</h2>
      <p>회원가입 없이도 서비스를 이용할 수 있습니다. 다만 만 14세 미만은 보호자 동의 후 이용을 권장합니다.</p>
    </section>

    {/* 일반회원 계정 신설 (GNB PRD REQ-C) */}
    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제4조의2 (회원 계정)</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>회원가입은 선택입니다. 가입하지 않아도 서비스 탐색과 닉네임 후기 작성은 그대로 이용할 수 있습니다.</li>
        <li>계정을 만들면 후기 전문 열람, 「내 후기」에서의 수정·삭제, 학습 유형 검사 결과의 기기 간 동기화를 이용할 수 있습니다.</li>
        <li>계정은 이메일·비밀번호 또는 Google 계정으로 만들 수 있습니다. 가입 시 이용약관과 개인정보처리방침에 동의해야 합니다.</li>
        <li>계정 정보(이메일·비밀번호)의 관리 책임은 이용자에게 있습니다. 계정을 타인과 공유하거나 양도할 수 없습니다.</li>
        <li>같은 서비스에 대해 회원은 후기를 1건만 작성할 수 있습니다. 추가로 남기고 싶은 내용은 기존 후기를 수정해 주세요.</li>
        <li>탈퇴는 문의 연락처로 요청할 수 있습니다. 탈퇴 시 계정과 계정에 저장된 정보는 삭제되며, 이미 발행한 후기의 처리는 개인정보처리방침 제3조를 따릅니다.</li>
        <li>「나의 한국어 책상」의 글쓰기는 초대받은 저자만 이용할 수 있고, 일반 회원 계정으로는 이용할 수 없습니다. 글 읽기는 누구나 가능합니다.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제5조 (이용자의 의무)</h2>
      <p className="mb-2">이용자는 다음 행위를 해서는 안 됩니다.</p>
      <ol className="list-decimal pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>타인의 명예를 훼손하거나 모욕하는 행위</li>
        <li>허위 정보를 리뷰로 게시하는 행위</li>
        <li>동일 서비스에 의도적으로 반복하여 리뷰를 작성하는 행위</li>
        <li>자동화 도구를 사용하여 서비스에 부하를 주는 행위</li>
        <li>광고성 콘텐츠를 무단으로 게시하는 행위</li>
        <li>기타 법령 또는 미풍양속에 위반되는 행위</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제6조 (서비스의 의무와 책임 한계)</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>서비스는 한국어 학습 자원을 큐레이션하여 제공하지만, 외부 학습 서비스의 품질·가격·운영 방침에 대한 책임을 지지 않습니다.</li>
        <li>외부 서비스 이용 시 발생하는 분쟁은 해당 서비스와 이용자 간 처리됨을 원칙으로 합니다.</li>
        <li>서비스는 이용자가 게시한 리뷰의 내용에 대해 검토하나, 모든 리뷰의 사실 여부를 보증하지 않습니다.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제7조 (저작권)</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>이용자가 게시한 리뷰의 저작권은 이용자에게 귀속됩니다.</li>
        <li>다만 서비스는 리뷰를 큐레이션·집계·통계 목적으로 활용할 권리를 가집니다.</li>
        <li>서비스에 표시된 외부 서비스 정보(로고, 설명 등)는 해당 서비스 운영자의 재산임을 명시합니다.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">제8조 (콘텐츠 삭제)</h2>
      <p className="mb-2">서비스는 다음 경우 이용자의 콘텐츠를 사전 통지 없이 삭제할 수 있습니다.</p>
      <ol className="list-decimal pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>본 약관 제5조 위반</li>
        <li>명백한 허위·악의적 콘텐츠로 판단되는 경우</li>
        <li>법령 위반</li>
      </ol>
      {/* 신고 처리 방식을 밝힌다 — 자동 숨김이 아니라는 점이 중요하다 (REQ-E / E-3, 결정 D10) */}
      <p className="mt-3 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        이용자는 후기를 신고할 수 있습니다. 신고가 접수되어도 후기는 그대로 노출되며, 운영자가 원문을
        확인한 뒤에만 숨김 처리합니다. 신고 자체로 콘텐츠가 삭제되거나 내려가지는 않습니다.
        숨김 처리된 후기는 삭제되지 않고 보관되며, 판단이 잘못된 경우 복구할 수 있습니다.
      </p>
      <p className="mt-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        서비스는 어뷰징을 막기 위해 후기 작성과 신고에 빈도 제한을 둡니다. 익명 작성은 동일 접속
        환경에서 시간당 3건, 같은 서비스에는 24시간에 1건으로 제한됩니다.
      </p>
    </section>

    <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] border-t border-[#e2e8f0] dark:border-[#232a36] pt-4">
      부칙: 본 약관은 <strong>2026-XX-XX</strong>부터 시행합니다.
    </p>
  </div>
);

const EN = () => (
  <div className="space-y-8 font-['Inter:Regular',sans-serif] text-[15px] leading-[1.8] text-[#1e293b] dark:text-[#dce3f3]">
    <p className="text-[14px] text-[#64748b] dark:text-[#8a94a6]">Effective date: <strong>2026-XX-XX</strong></p>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 1 — Purpose</h2>
      <p>These Terms of Service govern the conditions, procedures, and rights and responsibilities of users and the NARSHA service ("the Service").</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 2 — Definitions</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>"Service" refers to the NARSHA platform, which curates and provides Korean learning resources.</li>
        <li>"User" refers to anyone who uses the Service under these Terms.</li>
        <li>"Review" refers to evaluative content posted by a user regarding a Korean learning resource on the Service.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 3 — Publication and Amendment of Terms</h2>
      <p>The Service shall post these Terms where users can easily access them. Changes to the Terms will be announced at least 7 days before taking effect.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 4 — Eligibility</h2>
      <p>You may use the Service without registering. Users under 14 years of age are encouraged to obtain parental consent before use.</p>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 4-2 — Member Accounts</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Registration is optional. Without an account you can still browse services and post reviews under a nickname.</li>
        <li>With an account you can read full reviews, edit and delete your own reviews in “My reviews”, and carry your learner type across devices.</li>
        <li>Accounts can be created with an email and password, or with a Google account. You must agree to these Terms and the Privacy Policy to register.</li>
        <li>You are responsible for keeping your credentials secure. Accounts may not be shared or transferred.</li>
        <li>Members may post one review per service. To add more, edit your existing review.</li>
        <li>To close your account, contact us at the address below. Your account and the information stored with it will be deleted; published reviews are handled as described in Article 3 of the Privacy Policy.</li>
        <li>Writing in Korean Desks of the World is limited to invited authors and is not available with a member account. Anyone may read the posts.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 5 — User Obligations</h2>
      <p className="mb-2">Users must not engage in any of the following:</p>
      <ol className="list-decimal pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Defaming or insulting others</li>
        <li>Posting false information as a review</li>
        <li>Intentionally submitting multiple reviews for the same service</li>
        <li>Using automated tools to overload the Service</li>
        <li>Posting unsolicited advertising content</li>
        <li>Any other act that violates applicable law or public morality</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 6 — Service Obligations and Limitations of Liability</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>The Service curates Korean learning resources but is not responsible for the quality, pricing, or operational policies of external services.</li>
        <li>Disputes arising from the use of external services are to be resolved between the user and the respective external service provider.</li>
        <li>The Service reviews user-submitted content but does not guarantee the accuracy of all reviews.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 7 — Intellectual Property</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Copyright in user-submitted reviews belongs to the respective user.</li>
        <li>The Service retains the right to use reviews for curation, aggregation, and statistical purposes.</li>
        <li>External service information (logos, descriptions, etc.) displayed on the Service remains the property of the respective service operators.</li>
      </ol>
    </section>

    <section>
      <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] mb-3">Article 8 — Content Removal</h2>
      <p className="mb-2">The Service may remove user content without prior notice in the following cases:</p>
      <ol className="list-decimal pl-5 space-y-1 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        <li>Violation of Article 5 of these Terms</li>
        <li>Content judged to be clearly false or malicious</li>
        <li>Violation of applicable law</li>
      </ol>
      <p className="mt-3 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        Users may report a review. A report does not hide or remove anything on its own — the review stays
        visible until a member of our team has read it and decided. Hidden reviews are retained rather than
        deleted, so a wrong decision can be reversed.
      </p>
      <p className="mt-2 text-[14px] text-[#64748b] dark:text-[#bec7d2]">
        To prevent abuse, review submissions and reports are rate-limited. Anonymous submissions are limited
        to 3 per hour from the same connection, and one per service per 24 hours.
      </p>
    </section>

    <p className="text-[13px] text-[#64748b] dark:text-[#8a94a6] border-t border-[#e2e8f0] dark:border-[#232a36] pt-4">
      These Terms are effective from <strong>2026-XX-XX</strong>.
    </p>
  </div>
);

export default function TermsOfService() {
  useDocumentTitle('title.terms');
  const [lang, setLang] = useLang();

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className="max-w-[800px] mx-auto px-6 py-16">
          <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.75rem,3vw,2.25rem)] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em]">
              {lang === 'ko' ? '이용약관' : 'Terms of Service'}
            </h1>
            <LangToggle lang={lang} setLang={setLang} />
          </div>

          {lang === 'ko' ? <KO /> : <EN />}
        </div>
      </main>
      <Footer />
    </div>
  );
}
