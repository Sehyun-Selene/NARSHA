import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { surveyQuestions, calculateLearnerType } from '../data/learnerTypes';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useT } from '../i18n';
import { useMemberAuth } from '../../features/auth/useMemberAuth';
import { recordLearnerType } from '../../features/auth/learnerTypeSync';

export default function Survey() {
  useDocumentTitle('title.survey');
  const { t, lang } = useT();
  const navigate = useNavigate();
  // 로그인 상태면 검사 결과를 계정에도 저장한다 (REQ-G)
  const { session } = useMemberAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(() => Array(surveyQuestions.length).fill(0));

  const progress = ((currentQuestion + 1) / surveyQuestions.length) * 100;
  const question = surveyQuestions[currentQuestion];

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
  };

  const handleNext = () => {
    if (currentQuestion < surveyQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // 유형은 localStorage 에 저장하고, 로그인 상태면 계정에도 올린다 (REQ-G).
      // 계정 저장 실패는 결과를 잃는 문제가 아니므로 결과 화면 이동을 막지 않는다.
      const learnerType = calculateLearnerType(responses);
      void recordLearnerType(learnerType, session?.user.id ?? null);
      localStorage.setItem('narsha-survey-responses', JSON.stringify(responses));
      localStorage.setItem('narsha-survey-date', new Date().toISOString());

      // Navigate to result page
      navigate('/survey/result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion === 0) {
      navigate('/survey');
      return;
    }
    setCurrentQuestion(currentQuestion - 1);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col relative">
      <Header />

      <main className="flex-1 pt-16 relative">
        <div className="max-w-[720px] mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-8">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[clamp(1.375rem,3.5vw,1.75rem)] leading-tight text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-6 sm:mb-7">
            {t('survey.q.title')}
          </h1>

          {/* Progress Section */}
          <div className="mb-5">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[11px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
                  {t('survey.q.phase')}
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[17px] sm:text-[18px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.4px]">
                  {t('survey.q.counter')
                    .replace('{i}', String(currentQuestion + 1).padStart(2, '0'))
                    .replace('{n}', String(surveyQuestions.length))}
                </h2>
              </div>

              <div className="font-['Inter:Regular',sans-serif] font-normal text-[12px] sm:text-[13px] text-[#64748b] dark:text-[#bec7d2]">
                {t('survey.q.percent').replace('{p}', String(Math.round(progress)))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-[4px] bg-[#e2e8f0] dark:bg-[#2e3541] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Block */}
          <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[10px] p-4 sm:p-5 mb-5 border-l-4 border-[#0ea5e9] dark:border-[#8ecdff] relative">
            {/* Quote Icon */}
            <div className="absolute -top-1 left-1 w-8 h-6 opacity-15 scale-90">
              <svg viewBox="0 0 42.5 30" fill="none" className="w-full h-full">
                <path d="M0 30L0 15Q0 0 15 0L15 5Q5 5 5 15L10 15L10 30L0 30ZM20 30L20 15Q20 0 35 0L35 5Q25 5 25 15L30 15L30 30L20 30Z" fill="#8ECDFF" />
              </svg>
            </div>
            
            <blockquote className="font-['Manrope:SemiBold',sans-serif] font-semibold text-[clamp(1rem,2.8vw,1.25rem)] leading-snug text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.02em] pl-1">
              {/* 문항 데이터에 textKo 가 이미 있다 — 표시 시점에 언어로 고른다 */}
              {lang === 'ko' ? question.textKo : question.textEn}
            </blockquote>
          </div>

          {/* Rating Scale */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 px-0 sm:px-1">
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[10px] sm:text-[11px] tracking-wide uppercase text-[#64748b] dark:text-[#bec7d2]">
                {t('survey.q.disagree')}
              </div>
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[10px] sm:text-[11px] tracking-wide uppercase text-[#64748b] dark:text-[#bec7d2]">
                {t('survey.q.agree')}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleResponse(value)}
                  className={`relative rounded-[6px] py-3 sm:py-3.5 transition-all ${
                    responses[currentQuestion] === value
                      ? 'bg-[#e0f2fe] dark:bg-[#2e3541] border-2 border-[#0ea5e9] dark:border-[#8ecdff] shadow-[0px_0px_0px_2px_#8ecdff]'
                      : 'bg-[#f8fafc] dark:bg-[#19202c] border border-[#e2e8f0] dark:border-[#3f4850] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff]'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full mx-auto flex items-center justify-center ${
                    responses[currentQuestion] === value
                      ? 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] shadow-[0px_0px_12px_0px_rgba(142,205,255,0.25)]'
                      : 'border-2 border-[#cbd5e1] dark:border-[#3f4850]'
                  }`}>
                    <span className={`font-['Manrope:Bold',sans-serif] font-bold text-[14px] sm:text-[15px] ${
                      responses[currentQuestion] === value
                        ? 'text-[#00344f]'
                        : 'text-[#64748b] dark:text-[#bec7d2]'
                    }`}>
                      {value}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-4 sm:px-6 py-2.5 rounded-[4px] font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#0ea5e9] dark:text-[#8ecdff] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {currentQuestion === 0 ? t('survey.q.backIntro') : t('survey.q.prev')}
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={responses[currentQuestion] === 0}
              className="flex items-center gap-1.5 px-6 sm:px-8 py-2.5 rounded-[4px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] text-[#00344f] tracking-[-0.4px] shadow-[0px_8px_12px_-3px_rgba(0,0,0,0.08)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === surveyQuestions.length - 1 ? t('survey.q.done') : t('survey.q.next')}
              <ChevronRight className="w-[13.333px] h-[13.333px]" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}