import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apps } from '../data/apps';
import { getOverallRating, getReviewCount } from '../data/reviews';

const appLogos: Record<string, { bg: string, initial: string, color: string }> = {
  duolingo: { bg: 'bg-gradient-to-br from-[#58cc02] to-[#89e219]', initial: 'D', color: 'text-white' },
  ttmik: { bg: 'bg-gradient-to-br from-[#ff6b6b] to-[#ff8787]', initial: 'T', color: 'text-white' },
  anki: { bg: 'bg-gradient-to-br from-[#0093d0] to-[#00b4e6]', initial: 'A', color: 'text-white' },
  lingodeer: { bg: 'bg-gradient-to-br from-[#ff6f3d] to-[#ff8f61]', initial: 'L', color: 'text-white' },
  teuida: { bg: 'bg-gradient-to-br from-[#4a90e2] to-[#6ba5e7]', initial: 'T', color: 'text-white' },
  sejong: { bg: 'bg-gradient-to-br from-[#1e3a8a] to-[#3b5998]', initial: 'K', color: 'text-white' },
  memrise: { bg: 'bg-gradient-to-br from-[#ffd950] to-[#ffe57a]', initial: 'M', color: 'text-gray-800' },
  drops: { bg: 'bg-gradient-to-br from-[#7c4dff] to-[#9d6dff]', initial: 'D', color: 'text-white' }
};

const learnerTypeColors: Record<string, { bg: string, text: string }> = {
  '가': { bg: 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]', text: 'text-[#00344f]' },
  '나': { bg: 'bg-gradient-to-br from-[#60a5fa] to-[#3b82f6]', text: 'text-[#1e3a8a]' },
  '다': { bg: 'bg-gradient-to-br from-[#a78bfa] to-[#8b5cf6]', text: 'text-[#4c1d95]' },
  '라': { bg: 'bg-gradient-to-br from-[#f472b6] to-[#ec4899]', text: 'text-[#831843]' },
  '마': { bg: 'bg-gradient-to-br from-[#fbbf24] to-[#f59e0b]', text: 'text-[#78350f]' },
  '바': { bg: 'bg-gradient-to-br from-[#34d399] to-[#10b981]', text: 'text-[#064e3b]' }
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string | null>(null);
  const [purposeFilter, setPurposeFilter] = useState<string | null>(null);
  const [learnerTypeFilter, setLearnerTypeFilter] = useState<string | null>(null);
  const [showLevelMenu, setShowLevelMenu] = useState(false);
  const [showPurposeMenu, setShowPurposeMenu] = useState(false);
  const [showLearnerTypeMenu, setShowLearnerTypeMenu] = useState(false);

  const levelMenuRef = useRef<HTMLDivElement>(null);
  const purposeMenuRef = useRef<HTMLDivElement>(null);
  const learnerTypeMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (levelMenuRef.current && !levelMenuRef.current.contains(event.target as Node)) {
        setShowLevelMenu(false);
      }
      if (purposeMenuRef.current && !purposeMenuRef.current.contains(event.target as Node)) {
        setShowPurposeMenu(false);
      }
      if (learnerTypeMenuRef.current && !learnerTypeMenuRef.current.contains(event.target as Node)) {
        setShowLearnerTypeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredApps = apps.filter(app => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const appKeywordQuery = ['app', 'apps', 'application', 'mobile app'].includes(normalizedQuery);

    const matchesSearch = app.name.toLowerCase().includes(normalizedQuery) ||
      app.description.toLowerCase().includes(normalizedQuery) ||
      app.purposes.some(p => p.toLowerCase().includes(normalizedQuery)) ||
      app.nameKo.toLowerCase().includes(normalizedQuery) ||
      // Treat "app" keywords as platform-type search.
      (appKeywordQuery && Boolean(app.url));
    
    const matchesLevel = !levelFilter || app.levels?.includes(levelFilter as any);
    const matchesPurpose = !purposeFilter || app.purposes?.includes(purposeFilter as any);
    
    // Learning Type filter based on sensory + style combination
    let matchesLearnerType = true;
    if (learnerTypeFilter) {
      const typeMap: Record<string, { sensory: string[], style: string }> = {
        '가': { sensory: ['visual'], style: 'exploratory' },
        '나': { sensory: ['visual'], style: 'structured' },
        '다': { sensory: ['auditory'], style: 'exploratory' },
        '라': { sensory: ['auditory'], style: 'structured' },
        '마': { sensory: ['visual', 'auditory', 'mixed'], style: 'exploratory' },
        '바': { sensory: ['visual', 'auditory', 'mixed'], style: 'structured' }
      };
      
      const selectedType = typeMap[learnerTypeFilter];
      if (selectedType) {
        const hasSensoryMatch = app.sensory.some(s => selectedType.sensory.includes(s));
        const hasStyleMatch = app.style === selectedType.style;
        matchesLearnerType = hasSensoryMatch && hasStyleMatch;
      }
    }
    
    return matchesSearch && matchesLevel && matchesPurpose && matchesLearnerType;
  });

  const clearAllFilters = () => {
    setLevelFilter(null);
    setPurposeFilter(null);
    setLearnerTypeFilter(null);
  };

  const activeFilterCount = [levelFilter, purposeFilter, learnerTypeFilter].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      
      {/* Background decoration */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] blur-[32px] opacity-10 pointer-events-none">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]" />
      </div>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <div className="max-w-[1280px] mx-auto px-6 min-h-[calc(100vh-4rem)] pt-14 pb-10 flex flex-col items-center justify-center gap-10">
          <div className="flex flex-col items-center gap-6 w-full">
            <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[72px] leading-[1.18] tracking-[-3.6px] text-center bg-clip-text text-transparent bg-gradient-to-br from-[#8ecdff] to-[#1b99dc] pb-[0.1em] overflow-visible">
              Find your path to fluency.
            </h1>
            
            <p className="font-['Inter:Regular',sans-serif] font-normal text-[18px] leading-[28px] text-[#64748b] dark:text-[#bec7d2] text-center max-w-[672px]">
              Discover, compare, and master Korean with our architecturally curated<br />
              database of the world's best language resources.
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-[768px] relative">
            <div className="bg-[#f1f5f9] dark:bg-[#070e19] rounded-[12px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden">
              <div className="flex items-center pl-16 pr-6 py-6">
                <input
                  type="text"
                  placeholder="Search resources (e.g., 'Grammar', 'TOPIK', 'Apps')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent font-['Inter:Regular',sans-serif] font-normal text-[16px] text-[#1e293b] dark:text-[#dce3f3] placeholder:text-[#94a3b8] dark:placeholder:text-[#3f4850] outline-none"
                />
              </div>
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <Search className="w-[18px] h-[18px] text-[#0ea5e9] dark:text-[#8ecdff]" />
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-4 relative">
            <div className="relative">
              <button
                className={`px-6 py-3 rounded-full flex items-center gap-2 font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                  levelFilter 
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
                onClick={() => {
                  setShowLevelMenu(!showLevelMenu);
                  setShowPurposeMenu(false);
                  setShowLearnerTypeMenu(false);
                }}
              >
                <SlidersHorizontal className="w-[10.5px] h-[10.5px]" />
                Level {levelFilter && `(${levelFilter})`}
              </button>

              {/* Level Menu Dropdown */}
              {showLevelMenu && (
                <div className="absolute top-full mt-2 left-0 bg-[#ffffff] dark:bg-[#151c27] rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] z-50 min-w-[200px]" ref={levelMenuRef}>
                  <div className="p-3">
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        levelFilter === 'beginner' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setLevelFilter('beginner');
                        setShowLevelMenu(false);
                      }}
                    >
                      Beginner
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        levelFilter === 'elementary' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setLevelFilter('elementary');
                        setShowLevelMenu(false);
                      }}
                    >
                      Elementary
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        levelFilter === 'intermediate' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setLevelFilter('intermediate');
                        setShowLevelMenu(false);
                      }}
                    >
                      Intermediate
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        levelFilter === 'advanced' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setLevelFilter('advanced');
                        setShowLevelMenu(false);
                      }}
                    >
                      Advanced
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`px-6 py-3 rounded-full flex items-center gap-2 font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                  purposeFilter 
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
                onClick={() => {
                  setShowPurposeMenu(!showPurposeMenu);
                  setShowLevelMenu(false);
                  setShowLearnerTypeMenu(false);
                }}
              >
                <SlidersHorizontal className="w-[10.5px] h-[10.5px]" />
                Purpose {purposeFilter && `(${purposeFilter})`}
              </button>

              {/* Purpose Menu Dropdown */}
              {showPurposeMenu && (
                <div className="absolute top-full mt-2 left-0 bg-[#ffffff] dark:bg-[#151c27] rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] z-50 min-w-[200px]" ref={purposeMenuRef}>
                  <div className="p-3">
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        purposeFilter === 'entertainment' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setPurposeFilter('entertainment');
                        setShowPurposeMenu(false);
                      }}
                    >
                      Entertainment
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        purposeFilter === 'business' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setPurposeFilter('business');
                        setShowPurposeMenu(false);
                      }}
                    >
                      Business Proficiency
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        purposeFilter === 'academic' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setPurposeFilter('academic');
                        setShowPurposeMenu(false);
                      }}
                    >
                      Academic Research
                    </button>
                    <button
                      className={`w-full text-left px-4 py-2 rounded-[8px] transition-colors font-['Manrope:Medium',sans-serif] font-medium text-[14px] ${
                        purposeFilter === 'topik' 
                          ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]' 
                          : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                      }`}
                      onClick={() => {
                        setPurposeFilter('topik');
                        setShowPurposeMenu(false);
                      }}
                    >
                      TOPIK Preparation
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                className={`px-6 py-3 rounded-full flex items-center gap-2 font-['Manrope:Medium',sans-serif] font-medium text-[14px] transition-colors ${
                  learnerTypeFilter 
                    ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                    : 'bg-[#e2e8f0] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#cbd5e1] dark:hover:bg-[#2e3541]'
                }`}
                onClick={() => {
                  setShowLearnerTypeMenu(!showLearnerTypeMenu);
                  setShowLevelMenu(false);
                  setShowPurposeMenu(false);
                }}
              >
                <SlidersHorizontal className="w-[10.5px] h-[10.5px]" />
                Learning Type {learnerTypeFilter && `(${learnerTypeFilter})`}
              </button>

              {/* Learning Type Menu Dropdown */}
              {showLearnerTypeMenu && (
                <div className="absolute top-full mt-2 left-0 bg-[#ffffff] dark:bg-[#151c27] rounded-[12px] shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] z-50 min-w-[280px]" ref={learnerTypeMenuRef}>
                  <div className="p-3">
                    {['가', '나', '다', '라', '마', '바'].map((type) => {
                      const colors = learnerTypeColors[type];
                      const labels: Record<string, string> = {
                        '가': 'Visual Exploratory',
                        '나': 'Visual Structured',
                        '다': 'Auditory Exploratory',
                        '라': 'Auditory Structured',
                        '마': 'Mixed Exploratory',
                        '바': 'Mixed Structured'
                      };
                      return (
                        <button
                          key={type}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[8px] mb-1 transition-colors ${
                            learnerTypeFilter === type
                              ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff]'
                              : 'text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#232a36]'
                          }`}
                          onClick={() => {
                            setLearnerTypeFilter(type);
                            setShowLearnerTypeMenu(false);
                          }}
                        >
                          <div className={`w-7 h-7 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <span className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[14px] ${colors.text}`}>
                              {type}
                            </span>
                          </div>
                          <span className="font-['Manrope:Medium',sans-serif] font-medium text-[14px]">
                            {labels[type]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                className="bg-[#0ea5e9] dark:bg-[#1b5a7a] px-6 py-3 rounded-full flex items-center gap-2 font-['Manrope:Medium',sans-serif] font-medium text-[14px] text-[#ffffff] dark:text-[#8ecdff] hover:opacity-90 transition-opacity"
                onClick={clearAllFilters}
              >
                Clear All ({activeFilterCount})
              </button>
            )}
          </div>
        </div>

        {/* App Grid */}
        <div className="max-w-[1280px] mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredApps.map(app => {
              const rating = getOverallRating(app.id);
              const reviewCount = getReviewCount(app.id);
              
              return (
                <Link
                  key={app.id}
                  to={`/apps/${app.id}`}
                  className="group relative bg-[#ffffff] dark:bg-[#151c27] rounded-[16px] overflow-hidden shadow-[0px_4px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-[#e2e8f0] dark:border-[#232a36] hover:shadow-[0px_8px_32px_rgba(0,0,0,0.12)] dark:hover:border-[#8ecdff] transition-all"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-[#0ea5e9] dark:bg-[#1b5a7a] text-[#ffffff] dark:text-[#8ecdff] font-['Manrope:Bold',sans-serif] font-bold text-[10px] tracking-[1px] uppercase px-3 py-1 rounded-full">
                      {app.category}
                    </span>
                  </div>

                  {/* App Image */}
                  <div className="aspect-square bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] dark:from-[#1e293b] dark:to-[#0f172a] flex items-center justify-center p-8">
                    <div className={`w-10 h-10 rounded-full ${appLogos[app.image]?.bg} flex items-center justify-center`}>
                      <span className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] ${appLogos[app.image]?.color}`}>
                        {appLogos[app.image]?.initial}
                      </span>
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-['Manrope:Bold',sans-serif] font-bold text-[20px] leading-[24px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.5px]">
                        {app.name}
                      </h3>
                      {rating > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-[#fbbf24] dark:text-[#fbbf24]">★</span>
                          <span className="font-['Manrope:Bold',sans-serif] font-bold text-[16px] text-[#1e293b] dark:text-[#8ecdff]">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="font-['Inter:Regular',sans-serif] font-normal text-[14px] leading-[20px] text-[#64748b] dark:text-[#bec7d2] mb-4 line-clamp-2">
                      {app.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-[#e0f2fe] dark:bg-[#0f3a4a] text-[#0ea5e9] dark:text-[#8ecdff] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">
                        {app.sensory.includes('mixed') || app.sensory.length > 1 
                          ? 'Mixed' 
                          : app.sensory[0].charAt(0).toUpperCase() + app.sensory[0].slice(1)}
                      </span>
                      <span className="bg-[#ddd6fe] dark:bg-[#2e1f4a] text-[#8b5cf6] dark:text-[#c4b5fd] font-['Manrope:Medium',sans-serif] font-medium text-[11px] px-2 py-1 rounded">
                        {app.style === 'exploratory' ? 'Exploratory' : 'Structured'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}