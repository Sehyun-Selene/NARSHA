import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { surveyQuestions, calculateLearnerType } from '../data/learnerTypes';
import imgBackground from "figma:asset/417b513e5d0e5132d22aeba5b28ed14494c3d0a1.png";

export default function Survey() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(Array(10).fill(0));

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
      // Calculate learner type and save to localStorage
      const learnerType = calculateLearnerType(responses);
      localStorage.setItem('narsha-learner-type', learnerType);
      localStorage.setItem('narsha-survey-responses', JSON.stringify(responses));
      localStorage.setItem('narsha-survey-date', new Date().toISOString());
      
      // Navigate to result page
      navigate('/survey/result');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col relative">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] blur-[32px] opacity-10 pointer-events-none">
        <img src={imgBackground} alt="" className="w-full h-full object-cover rounded-full" />
      </div>

      <main className="flex-1 pt-20 relative">
        <div className="max-w-[1000px] mx-auto px-6 py-32">
          {/* Progress Section */}
          <div className="mb-16">
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[14px] tracking-[1.4px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-2">
                  Assessment Phase
                </div>
                <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] leading-[32px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.6px]">
                  Question {String(currentQuestion + 1).padStart(2, '0')} of {surveyQuestions.length}
                </h1>
              </div>
              
              <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                {Math.round(progress)}% Complete
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-[6px] bg-[#e2e8f0] dark:bg-[#2e3541] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Block */}
          <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[12px] p-12 mb-16 border-l-4 border-[#0ea5e9] dark:border-[#8ecdff] relative">
            {/* Quote Icon */}
            <div className="absolute -top-2 left-2 w-11 h-8 opacity-20">
              <svg viewBox="0 0 42.5 30" fill="none">
                <path d="M0 30L0 15Q0 0 15 0L15 5Q5 5 5 15L10 15L10 30L0 30ZM20 30L20 15Q20 0 35 0L35 5Q25 5 25 15L30 15L30 30L20 30Z" fill="#8ECDFF" />
              </svg>
            </div>
            
            <blockquote className="font-['Manrope:SemiBold',sans-serif] font-semibold text-[36px] leading-[40px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.9px]">
              {question.textEn}
            </blockquote>
          </div>

          {/* Rating Scale */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-10 px-4">
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] tracking-[1.4px] uppercase text-[#64748b] dark:text-[#bec7d2]">
                Strongly Disagree
              </div>
              <div className="font-['Inter:Medium',sans-serif] font-medium text-[14px] tracking-[1.4px] uppercase text-[#64748b] dark:text-[#bec7d2]">
                Strongly Agree
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  onClick={() => handleResponse(value)}
                  className={`relative rounded-[8px] py-8 transition-all ${
                    responses[currentQuestion] === value
                      ? 'bg-[#e0f2fe] dark:bg-[#2e3541] border-2 border-[#0ea5e9] dark:border-[#8ecdff] shadow-[0px_0px_0px_2px_#8ecdff]'
                      : 'bg-[#f8fafc] dark:bg-[#19202c] border border-[#e2e8f0] dark:border-[#3f4850] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${
                    responses[currentQuestion] === value
                      ? 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] shadow-[0px_0px_20px_0px_rgba(142,205,255,0.3)]'
                      : 'border-2 border-[#cbd5e1] dark:border-[#3f4850]'
                  }`}>
                    <span className={`font-['Manrope:Bold',sans-serif] font-bold text-[18px] ${
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
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-10 py-4 rounded-[4px] font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#0ea5e9] dark:text-[#8ecdff] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-[13.333px] h-[13.333px]" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={responses[currentQuestion] === 0}
              className="flex items-center gap-2 px-12 py-4 rounded-[4px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] text-[#00344f] tracking-[-0.4px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestion === surveyQuestions.length - 1 ? 'Complete' : 'Continue'}
              <ChevronRight className="w-[13.333px] h-[13.333px]" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}