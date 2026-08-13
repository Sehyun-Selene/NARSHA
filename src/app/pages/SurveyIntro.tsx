import { Link } from 'react-router';
import { ChevronRight, Clock, ListChecks, MessageSquareQuote } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { surveyQuestions } from '../data/learnerTypes';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useT } from '../i18n';
import { rich } from '../i18n/rich';

const questionCount = surveyQuestions.length;

// 본문 강조는 그라디언트가 아니라 본문색 굵게 — 카드 안 짧은 문장이라 색을 더하면 산만해진다.
const STRONG_BODY = 'text-[#1e293b] dark:text-[#dce3f3] font-medium';

export default function SurveyIntro() {
  useDocumentTitle('title.survey');
  const { t } = useT();
  return (
    <div className="min-h-dvh bg-[#ffffff] dark:bg-[#0c141f] flex flex-col relative">
      <Header />

      <main className="flex-1 flex flex-col pt-16 relative min-h-0">
        <div className="flex-1 flex flex-col justify-center min-h-0 w-full max-w-[720px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="font-['Manrope:Bold',sans-serif] font-bold text-[10px] sm:text-[11px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
            {t('survey.eyebrow')}
          </div>
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.25rem,3.2vw,1.625rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-2">
            {t('survey.intro.title')}
          </h1>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[13px] sm:text-[14px] leading-snug text-[#64748b] dark:text-[#bec7d2] mb-4 sm:mb-5">
            {rich(t('survey.intro.lead'), { strong: STRONG_BODY })}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <MessageSquareQuote className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  {t('survey.intro.why.title')}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  {t('survey.intro.why.body')}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  {t('survey.intro.expect.title')}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  {t('survey.intro.expect.body').replace('{n}', String(questionCount))}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  {t('survey.intro.time.title')}
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  {rich(t('survey.intro.time.body'), { strong: STRONG_BODY })}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/survey/questions"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
            >
              {t('survey.intro.start')}
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors py-1"
            >
              {t('survey.intro.back')}
            </Link>
          </div>
        </div>
      </main>

      <Footer compact />
    </div>
  );
}
