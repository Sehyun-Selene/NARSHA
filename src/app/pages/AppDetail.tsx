import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Star, ExternalLink, ChevronRight, BarChart3, ThumbsUp, MessageSquare } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apps } from '../data/apps';
import {
  getAllReviews,
  getOverallRating,
  getAverageRatingByType,
  getRepliesForReview,
  addReviewReply,
} from '../data/reviews';
import { learnerTypes, LearnerType } from '../data/learnerTypes';
import imgDuolingo from "figma:asset/8ed1b2b30b72e2da116be745151d3aaa6c487b40.png";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  ResponsiveContainer 
} from 'recharts';

export default function AppDetail() {
  const { id } = useParams();
  const app = apps.find(a => a.id === id);
  const [selectedFilter, setSelectedFilter] = useState<'all' | LearnerType>('all');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [helpfulReviews, setHelpfulReviews] = useState<Record<string, { count: number, userMarked: boolean }>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [, setRepliesVersion] = useState(0);

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
  const toggleHelpful = (reviewId: string) => {
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

  const submitReply = (reviewId: string) => {
    const text = replyText.trim();
    if (!text) return;
    addReviewReply(reviewId, text);
    setReplyText('');
    setReplyingTo(null);
    setRepliesVersion((v) => v + 1);
  };

  if (!app) {
    return <div>App not found</div>;
  }

  const overallRating = getOverallRating(app.id);
  const appReviews = getAllReviews().filter(r => r.appId === app.id);
  const filteredReviews = selectedFilter === 'all' 
    ? appReviews 
    : appReviews.filter(r => r.learnerType === selectedFilter);

  // Calculate type ratings
  const typeRatings: Record<LearnerType, number> = {
    가: getAverageRatingByType(app.id, '가'),
    나: getAverageRatingByType(app.id, '나'),
    다: getAverageRatingByType(app.id, '다'),
    라: getAverageRatingByType(app.id, '라'),
    마: getAverageRatingByType(app.id, '마'),
    바: getAverageRatingByType(app.id, '바')
  };

  // Prepare radar chart data
  const radarData = [
    { type: 'Type 가\nVisual Exploratory', rating: typeRatings.가, id: 'type-a' },
    { type: 'Type 나\nVisual Structured', rating: typeRatings.나, id: 'type-b' },
    { type: 'Type 다\nAuditory Exploratory', rating: typeRatings.다, id: 'type-c' },
    { type: 'Type 라\nAuditory Structured', rating: typeRatings.라, id: 'type-d' },
    { type: 'Type 마\nMixed Exploratory', rating: typeRatings.마, id: 'type-e' },
    { type: 'Type 바\nMixed Structured', rating: typeRatings.바, id: 'type-f' }
  ];

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="max-w-[1280px] mx-auto px-6 py-16">
          {/* App Header */}
          <div className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[24px] p-12 mb-12 border border-[#e2e8f0] dark:border-[#232a36]">
            <div className="flex gap-12">
              {/* App Icon */}
              <div className="w-32 h-32 rounded-[24px] bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center flex-shrink-0">
                <img src={imgDuolingo} alt={app.name} className="w-20 h-20 object-contain" />
              </div>

              {/* App Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-3 py-1 rounded-full">
                        {app.levels[0]}
                      </span>
                      <span className="bg-[#f59e0b] dark:bg-[#78350f] text-[#ffffff] dark:text-[#fbbf24] font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase px-3 py-1 rounded-full">
                        {app.category}
                      </span>
                    </div>
                    
                    <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[48px] leading-[56px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px] mb-3">
                      {app.name}: Korean
                    </h1>
                    
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2] max-w-[600px] mb-6">
                      {app.description}
                    </p>

                    <div className="flex gap-4">
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] dark:text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] px-8 py-3 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
                      >
                        Get App
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      
                      <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-transparent border-2 border-[#1e293b] dark:border-[#8ecdff] text-[#1e293b] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[16px] px-8 py-3 rounded-[8px] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b] transition-colors"
                      >
                        Official Website
                      </a>
                    </div>
                  </div>

                  {/* Overall Rating */}
                  <div className="bg-[#ffffff] dark:bg-[#0c141f] rounded-[16px] p-6 text-center border border-[#e2e8f0] dark:border-[#232a36]">
                    <div className="text-[12px] font-['Manrope:Bold',sans-serif] font-bold tracking-[1.2px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-2">
                      Overall Rating
                    </div>
                    <div className="text-[64px] font-['Manrope:ExtraBold',sans-serif] font-extrabold leading-none text-[#0ea5e9] dark:text-[#8ecdff] mb-2">
                      {overallRating > 0 ? overallRating.toFixed(1) : '-'}
                    </div>
                    <div className="flex gap-1 justify-center mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= Math.round(overallRating) ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]' : 'text-[#cbd5e1] dark:text-[#3f4850]'}`}
                        />
                      ))}
                    </div>
                    <div className="text-[14px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#bec7d2]">
                      Based on {appReviews.length} expert and peer evaluations
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Learner Type Ratings */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] leading-[40px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.8px] mb-2">
                  Rating by Learner Type
                </h2>
                <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] leading-[24px] text-[#64748b] dark:text-[#bec7d2]">
                  How different archetypes perceive this resource.
                </p>
              </div>

              <button
                onClick={() => setShowAnalysisModal(true)}
                className="inline-flex items-center gap-2 bg-[#ffffff] dark:bg-[#151c27] border-2 border-[#0ea5e9] dark:border-[#8ecdff] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[16px] px-6 py-3 rounded-[8px] hover:bg-[#e0f2fe] dark:hover:bg-[#1e293b] transition-colors shadow-[0px_4px_12px_-2px_rgba(0,0,0,0.1)]"
              >
                <BarChart3 className="w-5 h-5" />
                View Analysis Chart
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(['가', '나', '다', '라', '마', '바'] as LearnerType[]).map(type => {
                const typeInfo = learnerTypes[type];
                const rating = typeRatings[type];
                
                return (
                  <div
                    key={type}
                    className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-6 text-center border border-[#e2e8f0] dark:border-[#232a36] hover:border-[#0ea5e9] dark:hover:border-[#8ecdff] transition-colors cursor-pointer"
                    onClick={() => setSelectedFilter(type)}
                  >
                    <div className="w-12 h-12 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] flex items-center justify-center mx-auto mb-3">
                      <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[20px] text-[#ffffff] dark:text-[#8ecdff]">
                        {type}
                      </span>
                    </div>
                    <div className="text-[11px] font-['Manrope:Bold',sans-serif] font-bold tracking-[1.1px] uppercase text-[#64748b] dark:text-[#bec7d2] mb-2">
                      {typeInfo.sensory} {typeInfo.style}
                    </div>
                    <div className="text-[32px] font-['Manrope:ExtraBold',sans-serif] font-extrabold leading-none text-[#1e293b] dark:text-[#dce3f3] mb-1">
                      {rating > 0 ? rating.toFixed(1) : '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[32px] leading-[40px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.8px] mb-2">
                  Filter Reviews
                </h2>
              </div>

              <Link
                to={`/apps/${app.id}/review/new`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] dark:text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] px-8 py-3 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
              >
                Write Review
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                  selectedFilter === 'all'
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
              >
                All Types
              </button>
              {(['가', '나', '다', '라', '마', '바'] as LearnerType[]).map(type => {
                const typeInfo = learnerTypes[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-4 py-2 rounded-full font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                      selectedFilter === type
                        ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                        : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#bec7d2] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                    }`}
                  >
                    Type {type}: {typeInfo.sensory.charAt(0).toUpperCase() + typeInfo.sensory.slice(1)} {typeInfo.style.charAt(0).toUpperCase() + typeInfo.style.slice(1)}
                  </button>
                );
              })}
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {filteredReviews.map(review => {
                const typeInfo = learnerTypes[review.learnerType];
                const helpfulData = helpfulReviews[review.id] || { count: 0, userMarked: false };
                const replies = getRepliesForReview(review.id);

                return (
                  <div
                    key={review.id}
                    className="bg-[#f8fafc] dark:bg-[#151c27] rounded-[16px] p-8 border border-[#e2e8f0] dark:border-[#232a36]"
                  >
                    <div className="flex items-start gap-6">
                      {/* User Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] flex items-center justify-center flex-shrink-0">
                        <span className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#00344f]">
                          {review.nickname.charAt(0)}
                        </span>
                      </div>

                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-['Manrope:Bold',sans-serif] font-bold text-[18px] text-[#1e293b] dark:text-[#dce3f3] mb-1">
                              {review.nickname}
                            </div>
                            <div className="font-['Inter:Regular',sans-serif] font-normal text-[14px] text-[#64748b] dark:text-[#bec7d2]">
                              {typeInfo.name} •{' '}
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star
                                key={star}
                                className={`w-5 h-5 ${star <= review.rating ? 'fill-[#0ea5e9] text-[#0ea5e9] dark:fill-[#8ecdff] dark:text-[#8ecdff]' : 'text-[#cbd5e1] dark:text-[#3f4850]'}`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Content */}
                        <p className="font-['Inter:Regular',sans-serif] font-normal text-[16px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-4">
                          {review.content}
                        </p>

                        {replies.length > 0 ? (
                          <div className="mb-4 space-y-3">
                            <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] uppercase tracking-wide text-[#64748b] dark:text-[#94a3b8]">
                              Replies ({replies.length})
                            </div>
                            {replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="rounded-[12px] bg-[#e8eef4] dark:bg-[#0c141f] border border-[#e2e8f0] dark:border-[#232a36] px-4 py-3"
                              >
                                <p className="font-['Inter:Regular',sans-serif] font-normal text-[15px] leading-[22px] text-[#1e293b] dark:text-[#dce3f3]">
                                  {reply.body}
                                </p>
                                <p className="font-['Inter:Regular',sans-serif] font-normal text-[12px] text-[#94a3b8] dark:text-[#64748b] mt-2">
                                  {new Date(reply.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        {/* Meta */}
                        <div className="flex items-center gap-6 text-[14px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#bec7d2]">
                          <button
                            onClick={() => toggleHelpful(review.id)}
                            className={`flex items-center gap-1 ${helpfulData.userMarked ? 'text-[#0ea5e9] dark:text-[#8ecdff]' : 'text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors'}`}
                          >
                            <ThumbsUp className="w-5 h-5" />
                            <span>Helpful ({helpfulData.count})</span>
                          </button>
                          <button
                            onClick={() => setReplyingTo(review.id)}
                            className="flex items-center gap-1 text-[#64748b] dark:text-[#bec7d2] hover:text-[#0ea5e9] dark:hover:text-[#8ecdff] transition-colors"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>Reply</span>
                          </button>
                        </div>

                        {/* Reply Form */}
                        {replyingTo === review.id && (
                          <div className="mt-4">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              className="w-full p-2 border border-[#e2e8f0] dark:border-[#232a36] rounded-[4px] mb-2"
                              placeholder="Write your reply here..."
                            />
                            <button
                              onClick={() => submitReply(review.id)}
                              className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-10 py-2.5 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
                            >
                              Submit Reply
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredReviews.length === 0 && (
                <div className="text-center py-16">
                  <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] text-[#64748b] dark:text-[#bec7d2]">
                    No reviews yet for this learner type. Be the first to share your experience!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Analysis Modal */}
      {showAnalysisModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/60 backdrop-blur-sm p-6"
          onClick={() => setShowAnalysisModal(false)}
        >
          <div 
            className="bg-[#ffffff] dark:bg-[#151c27] rounded-[24px] max-w-[800px] w-full max-h-[90vh] border border-[#e2e8f0] dark:border-[#232a36] shadow-[0px_20px_60px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-8 pb-6 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="font-['Manrope:Bold',sans-serif] font-bold text-[12px] tracking-[1.2px] uppercase text-[#0ea5e9] dark:text-[#8ecdff]">
                  Analytical Core
                </div>
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="text-[#64748b] dark:text-[#bec7d2] hover:text-[#1e293b] dark:hover:text-[#dce3f3] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] leading-[32px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-1.2px]">
                6 Learner Types Review
              </h2>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto px-8 pb-8 flex-1">
              {/* Radar Chart */}
              <div className="mb-6 bg-gradient-radial from-[#c0c7d2]/10 to-transparent rounded-[12px] p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData} key="radar-chart-main">
                    <PolarGrid 
                      stroke="#c0c7d2" 
                      strokeWidth={2}
                      gridType="polygon"
                    />
                    <PolarAngleAxis 
                      dataKey="type" 
                      tick={{ 
                        fill: 'var(--text-color, #1e293b)', 
                        fontSize: 11,
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 'bold'
                      }}
                      style={{
                        '--text-color': 'light-dark(#1e293b, #dce3f3)'
                      } as React.CSSProperties}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 5]} 
                      tick={false}
                    />
                    <Radar
                      name="Rating"
                      dataKey="rating"
                      stroke="#0ea5e9"
                      fill="#8ecdff"
                      fillOpacity={0.3}
                      strokeWidth={3}
                      isAnimationActive={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Type Details Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {(['가', '나', '다', '라', '마', '바'] as LearnerType[]).map(type => {
                  const typeInfo = learnerTypes[type];
                  const rating = typeRatings[type];
                  const reviewCount = appReviews.filter(r => r.learnerType === type).length;
                  
                  return (
                    <div
                      key={type}
                      className="bg-[#f8fafc] dark:bg-[#0c141f] rounded-[12px] p-3 border border-[#e2e8f0] dark:border-[#232a36]"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-9 h-9 rounded-full bg-[#0ea5e9] dark:bg-[#1b5a7a] flex items-center justify-center">
                          <span className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] text-[#ffffff] dark:text-[#8ecdff]">
                            {type}
                          </span>
                        </div>
                        <div>
                          <div className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">
                            {rating > 0 ? rating.toFixed(1) : '-'}
                          </div>
                        </div>
                      </div>
                      <div className="text-[11px] font-['Inter:Regular',sans-serif] font-normal text-[#64748b] dark:text-[#bec7d2] mb-1">
                        {typeInfo.name}
                      </div>
                      <div className="text-[10px] font-['Inter:Regular',sans-serif] font-normal text-[#94a3b8] dark:text-[#8b96a3]">
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Close Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setShowAnalysisModal(false)}
                  className="bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] px-10 py-2.5 rounded-[8px] hover:opacity-90 transition-opacity shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1)]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}