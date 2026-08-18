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

/**
 * 10문항 고정. 방향별 문항 수를 대칭으로 둔다 — 시각2 · 청각2 · 탐색3 · 구조3.
 *
 * 한 방향을 1문항으로 재면 그 문항의 응답 노이즈가 축의 절반을 지배한다.
 * (이전 구성은 청각 1 · 탐색 1 · 구조 6 이라 사실상 두 문항이 유형을 결정했다.)
 *
 * 방식 축 문항은 탐색·구조를 번갈아 배치했다. 같은 방향이 연달아 나오면
 * 응답자가 같은 칸을 계속 누르는 경향(straight-lining)이 커진다.
 *
 * ⚠️ 문항을 고칠 때는 `direction` 을 정확히 달 것. 채점은 이 값만 보고 한다
 *    (`calculateLearnerType`). 인덱스를 세지 않으므로 순서는 자유롭다.
 */
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
    textEn: 'I enjoy discussing topics out loud to understand them better.',
    textKo: '나는 주제를 소리 내어 토론하면 더 잘 이해할 수 있다.',
    axis: 'sensory',
    direction: 'auditory'
  },
  {
    id: 5,
    textEn: 'I like to experiment and try different approaches before finding what works.',
    textKo: '나는 무엇이 효과가 있는지 찾기 전에 실험하고 다양한 방법을 시도하는 것을 좋아한다.',
    axis: 'style',
    direction: 'exploratory'
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
    textEn: 'I like to jump around and explore topics that interest me.',
    textKo: '나는 이리저리 옮겨 다니며 흥미로운 주제를 탐구하는 것을 좋아한다.',
    axis: 'style',
    direction: 'exploratory'
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
    textEn: 'I learn better through trial and error.',
    textKo: '나는 시행착오를 통해 더 잘 배운다.',
    axis: 'style',
    direction: 'exploratory'
  },
  {
    id: 10,
    textEn: 'I like having quizzes and tests to check my progress.',
    textKo: '나는 내 진행 상황을 확인하기 위해 퀴즈와 시험을 보는 것을 좋아한다.',
    axis: 'style',
    direction: 'structured'
  }
];


// ── 학습 유형 판정 ───────────────────────────────────────────────────────────
/**
 * 채점 방식 — 중앙값 보정 + 방향별 평균.
 *
 * 5점 척도의 중앙(3)을 0으로 보고 편차를 쓴다.
 *   4·5 → 그 방향에 찬성한다는 신호 (+1, +2)
 *   3    → 판단 보류. 어느 쪽에도 점수를 주지 않는다 (0)
 *   1·2 → 그 방향에 반대한다는 신호 (−1, −2) = 반대 방향의 근거
 *
 * 즉 "구조적으로 배우고 싶다"에 1을 준 응답은 탐색형의 근거로 쓰인다.
 * 이 보정이 없으면(원점수를 그냥 합하면) 부호가 생기지 않아 문항이 많은 쪽이
 * 항상 이긴다. 실제로 이전 구현이 `-Q4 + (Q5..Q10)` 이라 최솟값이 `-5 + 6 = 1`,
 * **어떤 응답을 넣어도 항상 구조형**이었고 탐색형은 나올 수 없었다.
 *
 * 문항 인덱스를 하드코딩하지 않고 `surveyQuestions` 의 `direction` 을 읽는다.
 * 문항을 교체·재배치해도 이 함수는 고치지 않아도 된다. 방향별 문항 수가
 * 달라지면 평균이 알아서 맞춰 준다.
 *
 * ⚠️ 문항 수 균형이 바꾸는 것은 판정 방향이 아니라 **정밀도**다.
 *    한 방향을 1문항으로 재면 그 문항의 응답 노이즈가 축의 절반을 지배한다.
 *    방향별 문항 수를 대칭으로 두는 편이 좋다 (예: 시각2·청각2·탐색3·구조3).
 */
const MIDPOINT = 3;

/**
 * 감각축 불감대. 시각·청각 편차 차이가 이보다 작거나 같으면 '근소한 차이' 구간이다.
 *
 * ⚠️ 이 값은 **방향별 문항 수에 딸려 있다.** 시각2·청각2 구성에서 두 평균의 차이는
 *    0.5 단위로만 나온다. 그래서 이 값을 0.5 로 두면 근소 구간이 '차이 0.5' 한 칸이
 *    되고, 그 칸을 아래 규칙으로 다시 가른다. 문항 수를 바꾸면 다시 맞춰야 한다.
 */
const SENSORY_BAND = 0.5;

type Direction = SurveyQuestion['direction'];

/** 방향별 평균 편차. 해당 방향 문항이 없으면 0 (판단 근거 없음). */
function meanDeviation(responses: number[], direction: Direction): number {
  let sum = 0;
  let count = 0;
  surveyQuestions.forEach((q, i) => {
    if (q.direction !== direction) return;
    const answer = responses[i];
    // 미응답은 '보류'로 취급한다 — 0 을 더하면 평균이 왜곡되므로 아예 세지 않는다
    if (typeof answer !== 'number' || answer < 1) return;
    sum += answer - MIDPOINT;
    count += 1;
  });
  return count === 0 ? 0 : sum / count;
}

export function calculateLearnerType(responses: number[]): LearnerType {
  const visual = meanDeviation(responses, 'visual');
  const auditory = meanDeviation(responses, 'auditory');
  const exploratory = meanDeviation(responses, 'exploratory');
  const structured = meanDeviation(responses, 'structured');

  // 감각 축 —
  //   차이가 뚜렷하면 그대로 높은 쪽.
  //   차이가 근소하면(0.5 한 칸) 이긴 쪽이 실제로 **동의**를 받았는지 본다.
  //   '시각형'이라 부르려면 시각 문항에 동의(편차 > 0)했어야 한다. 둘 다 싫어했는데
  //   덜 싫어한 쪽을 유형으로 붙이면 응답과 어긋나므로, 그때는 복합형으로 둔다.
  const sensoryDiff = visual - auditory;
  let sensory: Sensory;
  if (sensoryDiff === 0) {
    sensory = 'mixed';
  } else if (Math.abs(sensoryDiff) <= SENSORY_BAND) {
    const winner = sensoryDiff > 0 ? visual : auditory;
    sensory = winner > 0 ? (sensoryDiff > 0 ? 'visual' : 'auditory') : 'mixed';
  } else {
    sensory = sensoryDiff > 0 ? 'visual' : 'auditory';
  }

  // 방식축에는 중간 유형이 없다. 동점은 탐색형으로 둔다 — 구조적 학습을 원한다는
  // 진술에 동의하지 않았는데 구조형으로 분류되면 응답과 어긋난다.
  const styleDiff = structured - exploratory;
  const style: Style =
    styleDiff > 0 ? 'structured'
    : styleDiff < 0 ? 'exploratory'
    // 정확히 동점 — 방식축에는 중간 유형이 없다. 구조형 문항에 동의했는지로 가른다.
    // 모든 문항에 1을 준 응답(구조형 진술을 전부 부정)은 탐색형이 된다.
    : structured > 0 ? 'structured' : 'exploratory';

  if (sensory === 'visual' && style === 'exploratory') return '가';
  if (sensory === 'visual' && style === 'structured') return '나';
  if (sensory === 'auditory' && style === 'exploratory') return '다';
  if (sensory === 'auditory' && style === 'structured') return '라';
  if (sensory === 'mixed' && style === 'exploratory') return '마';
  return '바';
}
