import { LearnerType } from './learnerTypes';

const USER_REVIEWS_STORAGE_KEY = 'narsha-user-reviews';

type StoredReview = Omit<Review, 'createdAt'> & { createdAt: string };

function loadUserReviewsFromStorage(): Review[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_REVIEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReview[];
    return parsed.map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
    }));
  } catch {
    return [];
  }
}

function persistUserReviews(reviews: Review[]) {
  if (typeof localStorage === 'undefined') return;
  const serializable: StoredReview[] = reviews.map((r) => ({
    ...r,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt),
  }));
  localStorage.setItem(USER_REVIEWS_STORAGE_KEY, JSON.stringify(serializable));
}

/** Mock data + reviews saved from the Write Review form (localStorage). */
export function getAllReviews(): Review[] {
  const user = loadUserReviewsFromStorage();
  return [...user, ...mockReviews].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function mapFormGoalToReviewGoal(
  form: string
): Review['goal'] {
  switch (form) {
    case 'topik':
      return 'topik';
    case 'business':
      return 'business';
    case 'entertainment':
      return 'culture';
    case 'academic':
      return 'daily';
    case 'culture':
      return 'culture';
    case 'daily':
    default:
      return 'daily';
  }
}

export function mapFormUsageToReviewUsage(
  form: string
): Review['usagePeriod'] {
  const m: Record<string, Review['usagePeriod']> = {
    '<6m': '<1m',
    '<1y': '3-6m',
    '1-3y': '6m+',
    '3-5y': '6m+',
    '5y+': '6m+',
  };
  return m[form] ?? '1-3m';
}

export function saveUserReview(
  input: Omit<Review, 'id' | 'createdAt' | 'helpfulCount'>
): Review {
  const review: Review = {
    ...input,
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date(),
    helpfulCount: 0,
  };
  const existing = loadUserReviewsFromStorage();
  persistUserReviews([review, ...existing]);
  return review;
}

export interface Review {
  id: string;
  appId: string;
  nickname: string;
  learnerType: LearnerType;
  level: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  goal: 'topik' | 'daily' | 'business' | 'culture';
  usagePeriod: '<1m' | '1-3m' | '3-6m' | '6m+';
  rating: number;
  content: string;
  contentKo: string;
  imageUrls?: string[];
  createdAt: Date;
  helpfulCount: number;
}

export const mockReviews: Review[] = [
  {
    id: 'rev1',
    appId: 'duolingo',
    nickname: 'Min-jun Kim',
    learnerType: '나',
    level: 'beginner',
    goal: 'daily',
    usagePeriod: '1-3m',
    rating: 4,
    content: 'Excellent for foundation, lacking in complex syntax.',
    contentKo: '기초를 다지기에는 우수하나, 복잡한 문법 설명이 부족합니다.',
    createdAt: new Date('2023-10-12'),
    helpfulCount: 142
  },
  {
    id: 'rev2',
    appId: 'duolingo',
    nickname: 'Sarah Jenkins',
    learnerType: '마',
    level: 'elementary',
    goal: 'culture',
    usagePeriod: '3-6m',
    rating: 5,
    content: 'Great platform, though wish there were more collaborative breakout rooms for Type 마 learners.',
    contentKo: '마 유형 학습자를 위한 협업 토론 공간이 더 있었으면 좋겠지만, 훌륭한 플랫폼입니다.',
    createdAt: new Date('2024-01-03'),
    helpfulCount: 89
  },
  {
    id: 'rev3',
    appId: 'ttmik',
    nickname: 'Gin-su Paro',
    learnerType: '다',
    level: 'intermediate',
    goal: 'topik',
    usagePeriod: '6m+',
    rating: 4,
    content: 'As an academic student, I find the gamification keeps me consistent.',
    contentKo: '학문적인 학생으로서, 게임화 요소가 일관성을 유지하는 데 도움이 됩니다.',
    createdAt: new Date('2023-12-15'),
    helpfulCount: 234
  },
  {
    id: 'rev4',
    appId: 'anki',
    nickname: 'Hiroshi Sato',
    learnerType: '나',
    level: 'advanced',
    goal: 'business',
    usagePeriod: '6m+',
    rating: 5,
    content: 'The methodology is exactly what Type 라 learners need for high fluency.',
    contentKo: '라 유형 학습자가 높은 유창성을 위해 필요한 정확한 방법론입니다.',
    createdAt: new Date('2023-11-28'),
    helpfulCount: 178
  },
  {
    id: 'rev5',
    appId: 'lingodeer',
    nickname: 'Elena Rodriguez',
    learnerType: '가',
    level: 'beginner',
    goal: 'culture',
    usagePeriod: '1-3m',
    rating: 4,
    content: 'Curriculum engagement is currently lacking highest rated "Type 나 (Visual Learners)" due to the visual design of material, which is highly integrated with resource.',
    contentKo: '시각 자료의 디자인이 리소스와 높은 통합성을 보여, "나 유형(시각 학습자)"에게 가장 높은 평가를 받지만 커리큘럼 참여도는 부족합니다.',
    createdAt: new Date('2024-02-20'),
    helpfulCount: 67
  },
  {
    id: 'rev6',
    appId: 'duolingo',
    nickname: 'Ji-hoon Park',
    learnerType: '라',
    level: 'intermediate',
    goal: 'topik',
    usagePeriod: '3-6m',
    rating: 3,
    content: 'Good structured approach but could use more audio-focused exercises for Type 라 learners.',
    contentKo: '구조화된 접근 방식은 좋지만 라 유형 학습자를 위한 청각 중심 연습이 더 필요합니다.',
    createdAt: new Date('2024-03-10'),
    helpfulCount: 56
  }
];

// Calculate average rating by learner type for an app
export function getAverageRatingByType(appId: string, learnerType: LearnerType): number {
  const reviews = getAllReviews().filter(r => r.appId === appId && r.learnerType === learnerType);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

// Get overall average rating for an app
export function getOverallRating(appId: string): number {
  const reviews = getAllReviews().filter(r => r.appId === appId);
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return sum / reviews.length;
}

// Get review count
export function getReviewCount(appId: string): number {
  return getAllReviews().filter(r => r.appId === appId).length;
}