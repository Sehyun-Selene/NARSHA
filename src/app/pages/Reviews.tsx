import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Star, ThumbsUp } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { mockReviews } from '../data/reviews';
import { apps } from '../data/apps';

const learnerTypeLabels: Record<string, string> = {
  '가': 'Visual Exploratory',
  '나': 'Visual Structured',
  '다': 'Auditory Exploratory',
  '라': 'Auditory Structured',
  '마': 'Mixed Exploratory',
  '바': 'Mixed Structured'
};

const learnerTypeColors: Record<string, { bg: string, text: string }> = {
  '가': { bg: 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]', text: 'text-[#00344f]' },
  '나': { bg: 'bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]', text: 'text-[#1e3a8a]' },
  '다': { bg: 'bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]', text: 'text-[#4c1d95]' },
  '라': { bg: 'bg-gradient-to-br from-[#f472b6] to-[#ec4899]', text: 'text-[#831843]' },
  '마': { bg: 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]', text: 'text-[#78350f]' },
  '바': { bg: 'bg-gradient-to-br from-[#34d399] to-[#10b981]', text: 'text-[#064e3b]' }
};

export default function Reviews() {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, { count: number, userMarked: boolean }>>({});

  // Load helpful data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('review-helpful');
    if (saved) {
      setHelpfulReviews(JSON.parse(saved));
    }
  }, []);

  // Save helpful data to localStorage
  const saveHelpfulData = (data: Record<string, { count: number, userMarked: boolean }>) => {
    localStorage.setItem('review-helpful', JSON.stringify(data));
    setHelpfulReviews(data);
  };

  // Toggle helpful status
  const toggleHelpful = (reviewId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const current = helpfulReviews[reviewId] || { count: 0, userMarked: false };
    const newData = {
      ...helpfulReviews,
      [reviewId]: {
        count: current.userMarked ? current.count - 1 : current.count + 1,
        userMarked: !current.userMarked
      }
    };
    saveHelpfulData(newData);
  };

  // Get all reviews with app info
  const allReviews = mockReviews.map(review => {
    const app = apps.find(a => a.id === review.appId);
    return {
      ...review,
      appName: app?.name || 'Unknown App'
    };
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filter reviews by learning type
  const filteredReviews = filterType 
    ? allReviews.filter(review => review.learnerType === filterType)
    : allReviews;

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] blur-[32px] opacity-10 pointer-events-none">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]" />
      </div>

      <main className="flex-1 pt-20">
        <div className="max-w-[1280px] mx-auto px-6 pt-32 pb-24">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[56px] leading-[56px] tracking-[-2.8px] text-center bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] mb-4">
              All Reviews
            </h1>
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2] text-center">
              Explore reviews from learners across all apps and learning types
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8 max-w-[800px] mx-auto space-y-3">
            {/* First Row */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => setFilterType(null)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[13px] transition-all whitespace-nowrap ${
                  filterType === null
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
              >
                <span>All Types</span>
                <span className="opacity-60">({allReviews.length})</span>
              </button>
              {['가', '나', '다'].map(type => {
                const count = allReviews.filter(r => r.learnerType === type).length;
                const colors = learnerTypeColors[type];
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[13px] transition-all whitespace-nowrap ${
                      filterType === type
                        ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
                        : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] ${colors.text}`}>
                        {type}
                      </span>
                    </div>
                    <span>Type {type}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
            
            {/* Second Row */}
            <div className="flex gap-3 justify-center flex-wrap">
              {['라', '마', '바'].map(type => {
                const count = allReviews.filter(r => r.learnerType === type).length;
                const colors = learnerTypeColors[type];
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[13px] transition-all whitespace-nowrap ${
                      filterType === type
                        ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
                        : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] ${colors.text}`}>
                        {type}
                      </span>
                    </div>
                    <span>Type {type}</span>
                    <span className="opacity-60">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#64748b] dark:text-[#bec7d2]">
                  No reviews found for this filter.
                </p>
              </div>
            ) : (
              filteredReviews.map(review => (
                <Link
                  key={review.id}
                  to={`/apps/${review.appId}`}
                  className="block bg-[#ffffff] dark:bg-[#151c27] rounded-[16px] p-6 shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:hover:border-[#8ecdff] transition-all"
                >
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] text-[#1e293b] dark:text-[#dce3f3]">
                          {review.appName}
                        </h3>
                        <span className="bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[11px] px-2 py-1 rounded">
                          Type {review.learnerType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                          {learnerTypeLabels[review.learnerType]}
                        </span>
                        <span className="text-[#cbd5e1] dark:text-[#3f4850]">•</span>
                        <span className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#94a3b8] dark:text-[#94a3b8]">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-[#fbbf24] text-[#fbbf24]" />
                      <span className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#8ecdff]">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-3">
                    <div>
                      <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[22px] text-[#64748b] dark:text-[#bec7d2] line-clamp-3">
                        {review.content}
                      </p>
                    </div>

                    {/* Review Tags and Helpful Button */}
                    <div className="flex items-center justify-between gap-4 pt-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Inter:Medium',sans-serif] font-medium text-[12px] px-3 py-1 rounded-full">
                          Level: {review.level.charAt(0).toUpperCase() + review.level.slice(1)}
                        </span>
                        <span className="bg-[#f1f5f9] dark:bg-[#1e293b] text-[#64748b] dark:text-[#94a3b8] font-['Inter:Medium',sans-serif] font-medium text-[12px] px-3 py-1 rounded-full">
                          {review.usagePeriod}
                        </span>
                      </div>

                      {/* Helpful Button */}
                      <button
                        onClick={(e) => toggleHelpful(review.id, e)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[13px] transition-all whitespace-nowrap ${
                          helpfulReviews[review.id]?.userMarked
                            ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] shadow-lg'
                            : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Helpful</span>
                        <span className="opacity-60">({helpfulReviews[review.id]?.count || 0})</span>
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}