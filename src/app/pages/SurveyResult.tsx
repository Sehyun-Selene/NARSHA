import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { learnerTypes, LearnerType } from '../data/learnerTypes';

export default function SurveyResult() {
  const navigate = useNavigate();
  const [learnerType, setLearnerType] = useState<LearnerType | null>(null);
  const [returnAppId, setReturnAppId] = useState<string | null>(null);

  useEffect(() => {
    const savedType = localStorage.getItem('narsha-learner-type') as LearnerType;
    if (!savedType) {
      navigate('/survey');
      return;
    }
    setLearnerType(savedType);
    
    // Check if there's a return app ID
    const appId = localStorage.getItem('narsha-return-app-id');
    setReturnAppId(appId);
  }, [navigate]);

  if (!learnerType) {
    return null;
  }

  const typeInfo = learnerTypes[learnerType];

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="max-w-[800px] mx-auto px-6 py-32">
          {/* Success Message */}
          <div className="text-center mb-16">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center mx-auto mb-6 shadow-[0px_0px_40px_0px_rgba(142,205,255,0.4)]">
              <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] text-[#00344f]">
                {learnerType}
              </span>
            </div>

            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] leading-[56px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px] mb-4">
              Your Learner Type
            </h1>
            
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[20px] leading-[28px] text-[#64748b] dark:text-[#bec7d2]">
              Assessment Complete
            </p>
          </div>

          {/* Type Card */}
          <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[24px] p-12 mb-12 border border-[#e2e8f0] dark:border-[#232a36]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] text-[#00344f]">
                  {learnerType}
                </span>
              </div>
              
              <div>
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff] mb-1">
                  Detected Learner Type
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] leading-[32px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.7px]">
                  Type {learnerType}: {typeInfo.name}
                </h2>
              </div>
            </div>

            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#1e293b] dark:text-[#dce3f3] mb-6">
              {typeInfo.description}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-[#ffffff] dark:bg-[#0c141f] rounded-[12px] p-6 border border-[#e2e8f0] dark:border-[#232a36]">
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-2">
                  Learning Pattern
                </div>
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                  {typeInfo.sensory === 'visual' ? 'Visual' : typeInfo.sensory === 'auditory' ? 'Auditory' : 'Mixed (Visual + Auditory)'}
                </div>
              </div>

              <div className="bg-[#ffffff] dark:bg-[#0c141f] rounded-[12px] p-6 border border-[#e2e8f0] dark:border-[#232a36]">
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-2">
                  Learning Style
                </div>
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                  {typeInfo.style === 'exploratory' ? 'Exploratory' : 'Structured'}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-[#e0f2fe] dark:bg-[#0f3a4a] rounded-[16px] p-8 mb-12 border border-[#0ea5e9] dark:border-[#1b99dc]">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0ea5e9] dark:bg-[#1b99dc] flex items-center justify-center flex-shrink-0">
                <span className="text-[#ffffff] text-[20px]">💡</span>
              </div>
              
              <div>
                <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#0c4a6e] dark:text-[#8ecdff] mb-3">
                  Strategic Insight
                </h3>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] leading-[24px] text-[#0c4a6e] dark:text-[#bec7d2]">
                  Curriculum engagement is currently peaking highest among "{typeInfo.name}" due to the recent launch of highly integrated resources. Recommended: Boost auditory feedback for Type 라.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center">
            {returnAppId ? (
              <button
                onClick={() => {
                  localStorage.removeItem('narsha-return-app-id');
                  navigate(`/apps/${returnAppId}/review/new`);
                }}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] px-12 py-4 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
              >
                Write Your Review
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] px-12 py-4 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
              >
                Explore Resources
                <ChevronRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}