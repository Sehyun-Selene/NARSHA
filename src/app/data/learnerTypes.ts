export type LearnerType = '가' | '나' | '다' | '라' | '마' | '바';
export type Sensory = 'visual' | 'auditory' | 'mixed';
export type Style = 'exploratory' | 'structured';

export interface LearnerTypeInfo {
  type: LearnerType;
  sensory: Sensory;
  style: Style;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  color: string;
}

export const learnerTypes: Record<LearnerType, LearnerTypeInfo> = {
  가: {
    type: '가',
    sensory: 'visual',
    style: 'exploratory',
    name: 'Visual Exploratory Learner',
    nameKo: '시각 탐색형 학습자',
    description: 'Absorbs language naturally through visual context',
    descriptionKo: '시각적 맥락을 통해 자연스럽게 언어를 흡수합니다',
    color: '#8ECDFF'
  },
  나: {
    type: '나',
    sensory: 'visual',
    style: 'structured',
    name: 'Visual Structured Learner',
    nameKo: '시각 구조형 학습자',
    description: 'Builds knowledge systematically through visual materials',
    descriptionKo: '시각 자료를 통해 체계적으로 지식을 쌓습니다',
    color: '#1B99DC'
  },
  다: {
    type: '다',
    sensory: 'auditory',
    style: 'exploratory',
    name: 'Auditory Exploratory Learner',
    nameKo: '청각 탐색형 학습자',
    description: 'Absorbs language naturally through listening',
    descriptionKo: '듣기를 통해 자연스럽게 언어를 흡수합니다',
    color: '#00A8E8'
  },
  라: {
    type: '라',
    sensory: 'auditory',
    style: 'structured',
    name: 'Auditory Structured Learner',
    nameKo: '청각 구조형 학습자',
    description: 'Masters language through structured audio lessons',
    descriptionKo: '구조화된 오디오 레슨을 통해 언어를 마스터합니다',
    color: '#007EA7'
  },
  마: {
    type: '마',
    sensory: 'mixed',
    style: 'exploratory',
    name: 'Mixed Exploratory Learner',
    nameKo: '혼합 탐색형 학습자',
    description: 'Thrives with immersive multimedia experiences',
    descriptionKo: '몰입형 멀티미디어 경험으로 학습이 향상됩니다',
    color: '#003459'
  },
  바: {
    type: '바',
    sensory: 'mixed',
    style: 'structured',
    name: 'Mixed Structured Learner',
    nameKo: '혼합 구조형 학습자',
    description: 'Excels with comprehensive structured curriculum',
    descriptionKo: '포괄적인 구조화된 커리큘럼으로 뛰어난 성과를 냅니다',
    color: '#00171F'
  }
};

// Survey questions
export interface SurveyQuestion {
  id: number;
  textEn: string;
  textKo: string;
  axis: 'sensory' | 'style';
  direction: 'visual' | 'auditory' | 'exploratory' | 'structured';
}

export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 1,
    textEn: 'I like to see pictures, diagrams, or charts when learning.',
    textKo: '나는 배울 때 그림, 도표, 차트를 보는 것을 좋아한다.',
    axis: 'sensory',
    direction: 'visual'
  },
  {
    id: 2,
    textEn: 'I find it helpful to highlight or underline text when studying.',
    textKo: '나는 공부할 때 텍스트에 하이라이트나 밑줄을 긋는 것이 도움이 된다.',
    axis: 'sensory',
    direction: 'visual'
  },
  {
    id: 3,
    textEn: 'I learn better when I listen to lectures or audio.',
    textKo: '나는 강의나 오디오를 들을 때 더 잘 배운다.',
    axis: 'sensory',
    direction: 'auditory'
  },
  {
    id: 4,
    textEn: 'I like to experiment and try different approaches before finding what works.',
    textKo: '나는 무엇이 효과가 있는지 찾기 전에 실험하고 다양한 방법을 시도하는 것을 좋아한다.',
    axis: 'style',
    direction: 'exploratory'
  },
  {
    id: 5,
    textEn: 'I like having a detailed plan before starting to learn something new.',
    textKo: '나는 새로운 것을 배우기 전에 상세한 계획을 세우는 것을 좋아한다.',
    axis: 'style',
    direction: 'structured'
  },
  {
    id: 6,
    textEn: 'I need clear guidelines and rules when learning.',
    textKo: '나는 배울 때 명확한 가이드라인과 규칙이 필요하다.',
    axis: 'style',
    direction: 'structured'
  },
  {
    id: 7,
    textEn: 'I like to have my learning progress tracked and measured.',
    textKo: '나는 학습 진행 상황이 추적되고 측정되는 것을 좋아한다.',
    axis: 'style',
    direction: 'structured'
  },
  {
    id: 8,
    textEn: 'I prefer studying grammar rules and structures explicitly.',
    textKo: '나는 문법 규칙과 구조를 명시적으로 공부하는 것을 선호한다.',
    axis: 'style',
    direction: 'structured'
  },
  {
    id: 9,
    textEn: 'I want to understand the "why" behind every rule.',
    textKo: '나는 모든 규칙 뒤에 있는 "왜"를 이해하고 싶다.',
    axis: 'style',
    direction: 'structured'
  },
  {
    id: 10,
    textEn: 'I like having quizzes and tests to check my progress.',
    textKo: '나는 내 진행 상황을 확인하기 위해 퀴즈와 시험을 보는 것을 좋아한다.',
    axis: 'style',
    direction: 'structured'
  }
];

// Calculate learner type from survey responses
/**
 * 두 축이 같은 척도 위에 있도록, 방향마다 **문항 수로 나눈 평균**을 쓴다.
 *
 * 왜 합산이 아니라 평균인가 — 문항 수가 방향마다 다르다.
 *   감각 축: 시각 2문항(Q1·Q2) vs 청각 1문항(Q3)
 *   방식 축: 탐색 1문항(Q4) vs 구조 6문항(Q5~Q10)
 * 합산하면 문항이 많은 쪽이 항상 이긴다. 실제로 이전 구현은
 * `-Q4 + (Q5..Q10)` 이라 최솟값이 `-5 + 6 = 1` 이었고, **어떤 응답을 넣어도
 * 항상 구조형**이 나왔다. 탐색형(가·다·마)이 수학적으로 나올 수 없었다.
 */
/**
 * 판정 파라미터.
 *
 * `*_BAND` 는 **불감대**다. 두 방향의 평균 차이가 이보다 작으면 "어느 쪽이라고
 * 하기 어려운 응답"으로 보고, 그때만 척도 중앙값(3)과 비교해 가른다.
 *   · 감각 축에는 '복합(mixed)' 이라는 답이 있으므로 불감대가 곧 복합형이다.
 *   · 방식 축에는 중간 유형이 없어서, 불감대에 들어오면 구조형 문항에 대한
 *     응답이 중앙값보다 위인지로 정한다.
 *
 * 중앙값(자기 평균이 아니라)을 기준으로 삼는 이유 — 모든 문항에 1을 준 응답자는
 * "계획을 세우는 편이 아니다"라고 답한 것이므로 탐색형이 되어야 한다. 자기 평균을
 * 쓰면 그런 응답이 전부 동점이 되어 한쪽으로 몰린다.
 *
 * 값은 응답 분포 시뮬레이션으로 정했다. 문항이 감각 3개·방식 7개로 적고 방향별
 * 개수도 불균형(시각2:청각1, 구조6:탐색1)이라 어떤 값을 써도 완전한 균등은
 * 불가능하다. 이 조합에서 여섯 유형이 13.7~20.4% 범위에 들어온다(균등은 16.7%).
 */
const MIDPOINT = 3;        // 5점 척도의 중앙
const SENSORY_BAND = 0.6;  // 시각평균 − 청각 차이가 이보다 작으면 복합형 후보
const STYLE_BAND = 0.4;    // 구조평균 − 탐색 차이가 이보다 작으면 판단 보류 구간

export function calculateLearnerType(responses: number[]): LearnerType {
  const avg = (values: number[]) => values.reduce((s, v) => s + v, 0) / values.length;

  // 감각 축 — 시각 Q1·Q2 / 청각 Q3
  const visualAvg = avg([responses[0], responses[1]]);
  const auditoryAvg = responses[2];

  // 방식 축 — 탐색 Q4 / 구조 Q5~Q10
  const exploratoryAvg = responses[3];
  const structuredAvg = avg([responses[4], responses[5], responses[6], responses[7], responses[8], responses[9]]);

  const sensoryDiff = visualAvg - auditoryAvg;
  let sensory: Sensory;
  if (Math.abs(sensoryDiff) < SENSORY_BAND) {
    // 둘 다 중앙값 위이거나 둘 다 아래면 선호가 갈리지 않은 것 → 복합형.
    // 한쪽만 중앙값을 넘었다면 그쪽을 택한다.
    sensory =
      (visualAvg >= MIDPOINT) === (auditoryAvg >= MIDPOINT)
        ? 'mixed'
        : sensoryDiff > 0 ? 'visual' : 'auditory';
  } else {
    sensory = sensoryDiff > 0 ? 'visual' : 'auditory';
  }

  const styleDiff = structuredAvg - exploratoryAvg;
  const style: Style =
    Math.abs(styleDiff) < STYLE_BAND
      ? (structuredAvg > MIDPOINT ? 'structured' : 'exploratory')
      : (styleDiff > 0 ? 'structured' : 'exploratory');

  // Map to learner type
  if (sensory === 'visual' && style === 'exploratory') return '가';
  if (sensory === 'visual' && style === 'structured') return '나';
  if (sensory === 'auditory' && style === 'exploratory') return '다';
  if (sensory === 'auditory' && style === 'structured') return '라';
  if (sensory === 'mixed' && style === 'exploratory') return '마';
  if (sensory === 'mixed' && style === 'structured') return '바';
  
  return '가'; // Default fallback
}