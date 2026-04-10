import { Link } from 'react-router';
import { ChevronRight, Clock, ListChecks, MessageSquareQuote } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { surveyQuestions } from '../data/learnerTypes';
import imgBackground from 'figma:asset/417b513e5d0e5132d22aeba5b28ed14494c3d0a1.png';

const questionCount = surveyQuestions.length;

export default function SurveyIntro() {
  return (
    <div className="min-h-dvh bg-[#ffffff] dark:bg-[#0c141f] flex flex-col relative">
      <Header />

      <div className="fixed bottom-0 right-0 w-[min(420px,70vw)] h-[min(420px,50vh)] blur-[24px] opacity-10 pointer-events-none">
        <img src={imgBackground} alt="" className="w-full h-full object-cover rounded-full" />
      </div>

      <main className="flex-1 flex flex-col pt-16 relative min-h-0">
        <div className="flex-1 flex flex-col justify-center min-h-0 w-full max-w-[720px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="font-['Manrope:Bold',sans-serif] font-bold text-[10px] sm:text-[11px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
            Learning type assessment
          </div>
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.25rem,3.2vw,1.625rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-2">
            Before you start
          </h1>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[13px] sm:text-[14px] leading-snug text-[#64748b] dark:text-[#bec7d2] mb-4 sm:mb-5">
            NARSHA tags reviews by <span className="text-[#1e293b] dark:text-[#dce3f3] font-medium">learner type</span> so readers can find voices
            that match how they study. This quick check sets your type before you write or browse reviews.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-5">
            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <MessageSquareQuote className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  Why we ask
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  Six profiles; we label your reviews so similar learners can compare notes.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  What to expect
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  {questionCount} short items, five-point agree scale—no wrong answers.
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 p-3 rounded-[10px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <Clock className="w-4 h-4 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-0.5">
                  Time
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] leading-snug text-[#64748b] dark:text-[#bec7d2]">
                  Most finish in <span className="text-[#1e293b] dark:text-[#dce3f3] font-medium">under two minutes</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              to="/survey/questions"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] px-6 py-2.5 sm:px-8 sm:py-3 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
            >
              START
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center font-['Manrope:Bold',sans-serif] font-bold text-[13px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors py-1"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer compact />
    </div>
  );
}
