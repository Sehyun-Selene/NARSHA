import { Link } from 'react-router';
import { ChevronRight, Clock, ListChecks, MessageSquareQuote } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { surveyQuestions } from '../data/learnerTypes';
import imgBackground from 'figma:asset/417b513e5d0e5132d22aeba5b28ed14494c3d0a1.png';

const questionCount = surveyQuestions.length;

export default function SurveyIntro() {
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col relative">
      <Header />

      <div className="fixed bottom-0 right-0 w-[min(420px,70vw)] h-[min(420px,50vh)] blur-[24px] opacity-10 pointer-events-none">
        <img src={imgBackground} alt="" className="w-full h-full object-cover rounded-full" />
      </div>

      <main className="flex-1 pt-16 relative">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-8 sm:py-12 pb-12">
          <div className="font-['Manrope:Bold',sans-serif] font-bold text-[11px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-2">
            Learning type assessment
          </div>
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.5rem,4vw,2rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-4">
            Before you start
          </h1>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] sm:text-[17px] leading-[28px] text-[#64748b] dark:text-[#bec7d2] mb-8">
            NARSHA classifies reviews by <span className="text-[#1e293b] dark:text-[#dce3f3] font-medium">learner type</span> so readers can find
            perspectives that fit how they study. This short check identifies your type before you write or browse reviews.
          </p>

          <div className="space-y-4 mb-10">
            <div className="flex gap-4 p-4 sm:p-5 rounded-[12px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <MessageSquareQuote className="w-5 h-5 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div>
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[15px] text-[#1e293b] dark:text-[#dce3f3] mb-1">
                  Why we ask
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] sm:text-[15px] leading-[24px] text-[#64748b] dark:text-[#bec7d2]">
                  Your answers place you in one of six learning-type profiles. We use that label to organize reviews so similar learners can compare
                  experiences more easily.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 sm:p-5 rounded-[12px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <ListChecks className="w-5 h-5 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div>
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[15px] text-[#1e293b] dark:text-[#dce3f3] mb-1">
                  What to expect
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] sm:text-[15px] leading-[24px] text-[#64748b] dark:text-[#bec7d2]">
                  {questionCount} brief statements. For each one, rate how much you agree on a simple five-point scale. There are no right or wrong
                  answers—choose what feels most like you.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-4 sm:p-5 rounded-[12px] bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36]">
              <div className="shrink-0 w-10 h-10 rounded-full bg-[#e0f2fe] dark:bg-[#0f3a4a] flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#0ea5e9] dark:text-[#8ecdff]" aria-hidden />
              </div>
              <div>
                <h2 className="font-['Manrope:Bold',sans-serif] font-bold text-[15px] text-[#1e293b] dark:text-[#dce3f3] mb-1">
                  Time
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] sm:text-[15px] leading-[24px] text-[#64748b] dark:text-[#bec7d2]">
                  Most people finish in <span className="text-[#1e293b] dark:text-[#dce3f3] font-medium">under two minutes</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Link
              to="/survey/questions"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] px-8 py-3.5 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
            >
              START
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors px-2 py-2"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
