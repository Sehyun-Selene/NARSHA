import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { Star, Upload, Check } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apps } from '../data/apps';
import { learnerTypes, LearnerType } from '../data/learnerTypes';

export default function ReviewWrite() {
  const { id } = useParams();
  const navigate = useNavigate();
  const app = apps.find(a => a.id === id);
  
  const [learnerType, setLearnerType] = useState<LearnerType | null>(null);
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState<'beginner' | 'elementary' | 'intermediate' | 'advanced'>('beginner');
  const [goal, setGoal] = useState<'topik' | 'daily' | 'business' | 'culture'>('daily');
  const [usagePeriod, setUsagePeriod] = useState<'<6m' | '<1y' | '1-3y' | '3-5y' | '5y+'>('<6m');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const savedType = localStorage.getItem('narsha-learner-type') as LearnerType;
    if (!savedType) {
      // Save the app ID so we can return after survey
      localStorage.setItem('narsha-return-app-id', id || '');
      navigate('/survey');
      return;
    }
    setLearnerType(savedType);
  }, [navigate, id]);

  if (!app || !learnerType) {
    return null;
  }

  const typeInfo = learnerTypes[learnerType];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit to a backend
    // For now, we'll just show success and redirect
    setSubmitted(true);
    
    setTimeout(() => {
      navigate(`/apps/${app.id}`);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center mx-auto mb-6 shadow-[0px_0px_40px_0px_rgba(142,205,255,0.4)]">
            <Check className="w-12 h-12 text-[#00344f]" />
          </div>
          <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[36px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
            Review Submitted!
          </h2>
          <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2]">
            Redirecting to app page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="max-w-[800px] mx-auto px-6 py-16">
          <div className="mb-12">
            <Link 
              to={`/apps/${app.id}`}
              className="inline-flex items-center gap-2 font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] mb-4 transition-colors"
            >
              ← Back to {app.name}
            </Link>
            
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] leading-[56px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px] mb-4">
              Share Your Journey
            </h1>
            
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2]">
              Help others navigate their Korean learning path with an editorial perspective.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Step 1: Identity Verification */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">1</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  Identity Verification
                </h2>
              </div>

              <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-8 border border-[#e2e8f0] dark:border-[#232a36]">
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
                    <h3 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                      Type {learnerType}: {typeInfo.name}
                    </h3>
                  </div>
                </div>
                
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-6">
                  Your learning patterns suggest a high affinity for cinematic content and wisdom-based curriculum. This badge will appear next to your review.
                </p>

                {/* Nickname Input */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Learning Context */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">2</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  Learning Context
                </h2>
              </div>

              <div className="space-y-6">
                {/* Learning Level */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Learning Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    <option value="beginner">Beginner (TOPIK I)</option>
                    <option value="elementary">Elementary (TOPIK II)</option>
                    <option value="intermediate">Intermediate (TOPIK III-IV)</option>
                    <option value="advanced">Advanced (TOPIK V-VI)</option>
                  </select>
                </div>

                {/* Usage Period */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Usage Period
                  </label>
                  <select
                    value={usagePeriod}
                    onChange={(e) => setUsagePeriod(e.target.value as any)}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff]"
                  >
                    <option value="<6m">{'<'}6m (Trial)</option>
                    <option value="<1y">{'<'}1y</option>
                    <option value="1-3y">1-3 years</option>
                    <option value="3-5y">3-5 years</option>
                    <option value="5y+">5+ years</option>
                  </select>
                </div>

                {/* Learning Purpose */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Learning Purpose
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: 'entertainment', label: 'Entertainment' },
                      { value: 'business', label: 'Business Proficiency' },
                      { value: 'academic', label: 'Academic Research' },
                      { value: 'topik', label: 'TOPIK Preparation' }
                    ].map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setGoal(option.value as any)}
                        className={`px-6 py-3 rounded-[8px] font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                          goal === option.value
                            ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                            : 'bg-[#f8fafc] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff]'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: The Critique */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center">
                  <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#00344f]">3</span>
                </div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3]">
                  The Critique
                </h2>
              </div>

              <div className="space-y-6">
                {/* Rating */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3 text-center">
                    Overall Rating
                  </label>
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-12 h-12 ${star <= rating ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]' : 'text-[#cbd5e1] dark:text-[#3f4850]'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Content */}
                <div>
                  <label className="block font-['Manrope:Bold',sans-serif] font-bold text-[14px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
                    Your Review
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe the curriculum's depth, cultural nuances, and pedagogical effectiveness..."
                    rows={6}
                    className="w-full bg-[#ffffff] dark:bg-[#151c27] border border-[#e2e8f0] dark:border-[#232a36] rounded-[8px] px-4 py-3 font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] dark:focus:ring-[#8ecdff] resize-none"
                    required
                  />
                </div>

                {/* Upload Photo */}
                <div className="border-2 border-dashed border-[#cbd5e1] dark:border-[#3f4850] rounded-[12px] p-12 text-center hover:border-[#0ea5e9] dark:hover:border-[#8ecdff] transition-colors cursor-pointer">
                  <Upload className="w-12 h-12 text-[#94a3b8] dark:text-[#64748b] mx-auto mb-4" />
                  <div className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-2">
                    Upload Photo
                  </div>
                  <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                    Showcase your progress or curriculum notes
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={!rating || !content || !nickname}
                className="w-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] px-8 py-5 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Review
              </button>
              
              <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-[#64748b] dark:text-[#bec7d2] text-center mt-4">
                By submitting, you agree to our Editorial Guidelines and content moderation policies.
              </p>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}