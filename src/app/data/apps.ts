export interface App {
  id: string;
  name: string;
  nameKo: string;
  sensory: ('visual' | 'auditory' | 'mixed')[];
  style: 'exploratory' | 'structured';
  levels: ('beginner' | 'elementary' | 'intermediate' | 'advanced')[];
  purposes: ('entertainment' | 'business' | 'academic' | 'topik')[];
  url: string;
  /** Short blurb for list cards and search. */
  description: string;
  descriptionKo: string;
  /** Rich explanation for the app detail page (paragraphs separated by blank lines). */
  detailDescription: string;
  detailDescriptionKo: string;
  image: string;
}

const LEVEL_ORDER = ['beginner', 'elementary', 'intermediate', 'advanced'] as const;

const LEVEL_DISPLAY_LABEL: Record<(typeof LEVEL_ORDER)[number], string> = {
  beginner: 'Beginner',
  elementary: 'Elementary',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

/** Card + detail header — derived only from `app.levels` so both screens stay in sync. */
export function getAppLevelDisplayTags(app: App): string[] {
  const normalized = LEVEL_ORDER.filter((level) => app.levels.includes(level));
  if (normalized.length === LEVEL_ORDER.length) {
    return ['All levels'];
  }
  return normalized.map((l) => LEVEL_DISPLAY_LABEL[l]);
}

export const apps: App[] = [
  {
    id: 'duolingo',
    name: 'Duolingo',
    nameKo: '듀오링고',
    sensory: ['visual'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://www.duolingo.com/course/ko/en/Learn-Korean',
    description: 'Bite-sized gamified lessons for Korean on web and mobile.',
    descriptionKo: '웹·모바일에서 한국어를 짧은 게임형 레슨으로 배울 수 있는 앱입니다.',
    detailDescription:
      'Duolingo is a free language-learning platform (app and website) that teaches Korean alongside many other languages. You follow a path of short lessons—usually a few minutes each—that mix reading, listening, typing, and sometimes speaking, with points, levels, and streaks to keep you coming back.\n\n' +
      'The Korean course introduces Hangul, vocabulary, and common sentence patterns step by step. It works well if you are starting from zero and want a low-pressure daily habit. The exercises repeat and recycle material, which helps recognition and basic production.\n\n' +
      'It is not a full university-style grammar curriculum and may not go as deep as dedicated exam-prep or business-Korean programs. Many learners pair Duolingo with a textbook, tutor, or listening practice for faster progress toward intermediate level or tests like TOPIK.',
    detailDescriptionKo:
      '듀오링고는 한국어를 포함해 여러 언어를 무료로 배울 수 있는 앱·웹 서비스입니다. 몇 분짜리 짧은 레슨을 이어 가며 읽기·듣기·쓰기·말하기를 섞어 연습하고, 점수·레벨·연속 학습일로 동기를 주는 방식입니다.\n\n' +
      '한국어 코스는 한글, 어휘, 자주 쓰는 문장 패턴을 단계적으로 소개합니다. 부담 없이 매일 조금씩 하는 습관을 만들기에 잘 맞고, 반복 노출로 인지와 기초 표현에 도움이 됩니다.\n\n' +
      '대학 수준 문법 커리큘럼이나 시험·비즈니스 한국어에 특화된 깊이까지는 기대하기 어려울 수 있어, 교재·튜터·듣기 자료 등과 병행하는 경우가 많습니다.',
    image: 'duolingo'
  },
  {
    id: 'ttmik',
    name: 'TTMIK',
    nameKo: 'TTMIK',
    sensory: ['auditory'],
    style: 'exploratory',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['entertainment', 'business'],
    url: 'https://talktomeinkorean.com',
    description: 'Audio-first Korean lessons from a long-running education brand.',
    descriptionKo: '오랜 역사의 브랜드가 제공하는 듣기 중심 한국어 레슨입니다.',
    detailDescription:
      'Talk To Me In Korean (TTMIK) is one of the best-known independent Korean-learning brands. It offers structured lesson series—often audio or video with hosts explaining grammar and culture—plus downloadable notes, workbooks, and a large library of content from absolute beginner upward.\n\n' +
      'You typically learn by listening to natural dialogues and explanations, then practicing patterns. The tone is conversational and focused on Korean as it is really spoken, which helps listening comprehension and everyday speaking more than rote textbook drills alone.\n\n' +
      'Some material is free; full access may require purchases or subscriptions. TTMIK works especially well if you learn well by ear and want clear, friendly guidance without enrolling in a formal school.',
    detailDescriptionKo:
      'TTMIK(Talk To Me In Korean)는 널리 알려진 독립 한국어 교육 브랜드입니다. 초급부터 단계별로 이어지는 오디오·영상 레슨과 문법·문화 설명, PDF 노트·교재 등이 있어 체계적으로 따라가기 쉽습니다.\n\n' +
      '실제 대화와 설명을 듣고 패턴을 연습하는 방식이라, 교과서 암기 위주보다 일상 청해·말하기에 강점이 있습니다.\n\n' +
      '일부는 무료이고 심화·전체 이용은 유료인 경우가 많습니다. 귀로 배우는 편이고 학교 과정 없이도 친절한 가이드를 원할 때 잘 맞습니다.',
    image: 'ttmik'
  },
  {
    id: 'anki',
    name: 'Anki',
    nameKo: 'Anki',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate', 'advanced'],
    purposes: ['academic', 'topik'],
    url: 'https://apps.ankiweb.net',
    description: 'Flashcard app that schedules reviews using spaced repetition.',
    descriptionKo: '간격 반복으로 복습 시점을 잡아 주는 플래시카드 앱입니다.',
    detailDescription:
      'Anki is not a Korean course—it is flashcard software for computers and phones that uses a spaced repetition algorithm. You create decks (or download shared ones) with words, sentences, or grammar prompts; the app shows each card again at intervals calculated to improve long-term memory.\n\n' +
      'For Korean, learners often use Anki for vocabulary, Hanja-related terms, example sentences, or TOPIK word lists. You control exactly what you study, which is powerful but also means you need to choose or build good content yourself.\n\n' +
      'There is a learning curve to using the app effectively, and the default interface is utilitarian. If you want guided video lessons out of the box, combine Anki with a structured course; if you want efficient memorization with discipline, Anki is a standard tool in the language-learning community.',
    detailDescriptionKo:
      'Anki는 한국어 강의가 아니라, 컴퓨터·스마트폰에서 쓰는 플래시카드 프로그램입니다. 단어·문장·문법 카드를 만들거나 공유 덱을 받아 쓰며, 간격 반복 알고리즘이 “언제 다시 볼지”를 정해 줍니다.\n\n' +
      '한국어 학습에서는 어휘, 예문, TOPIK 단어 등을 직접 구성해 암기할 때 많이 씁니다. 내용을 스스로 고르거나 만들어야 해서 자유도는 높지만 준비가 필요합니다.\n\n' +
      '사용법 익히는 데 시간이 걸리고 화면은 기능 위주입니다. 영상 레슨 같은 가이드는 다른 자료와 함께 쓰고, 효율적인 암기·복습을 원하면 커뮤니티에서 널리 쓰이는 도구입니다.',
    image: 'anki'
  },
  {
    id: 'lingodeer',
    name: 'LingoDeer',
    nameKo: '링고디어',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['academic'],
    url: 'https://www.lingodeer.com/en/',
    description: 'Structured app courses with clear grammar for Korean and other Asian languages.',
    descriptionKo: '한국어 등 아시아 언어용으로 문법 설명이 잘 정리된 구조형 앱 코스입니다.',
    detailDescription:
      'LingoDeer is a mobile and web app offering structured courses for Korean, Japanese, Chinese, and other languages. Lessons are organized into units that introduce grammar points with explanations, then drill them with interactive exercises—closer to a digital textbook than a pure game.\n\n' +
      'The Korean track is designed with Asian scripts and grammar in mind (particles, honorifics, word order), which many learners find clearer than generic “one size fits all” apps. Audio and writing practice are usually included.\n\n' +
      'It suits beginners and lower-intermediate learners who want explicit rules and a visible path. Advanced specialization or open-ended conversation may still require tutors, media immersion, or exam-specific materials later.',
    detailDescriptionKo:
      '링고디어는 한국어·일본어·중국어 등을 위한 구조형 앱·웹 코스입니다. 단원마다 문법을 설명한 뒤 인터랙티브 문제로 익히는 형태로, 순수 게임형 앱보다 디지털 교재에 가깝습니다.\n\n' +
      '한국어 트랙은 조사·높임법·어순 등 아시아 언어 특성을 반영해 두어, 범용 앱보다 규칙을 이해하기 쉬운 편입니다. 듣기·쓰기 연습도 함께 제공되는 경우가 많습니다.\n\n' +
      '초·중급 초반까지 문법과 학습 경로를 분명히 잡고 싶을 때 적합하고, 고급 전문 분야나 자유 대화는 이후 튜터·미디어·시험 대비 자료를 더하는 경우가 많습니다.',
    image: 'lingodeer'
  },
  {
    id: 'teuida',
    name: 'Teuida',
    nameKo: 'Teuida',
    sensory: ['visual', 'auditory'],
    style: 'exploratory',
    levels: ['elementary', 'intermediate'],
    purposes: ['business', 'entertainment'],
    url: 'https://www.teuida.net/en',
    description: 'First-person video scenarios to practice listening and speaking aloud.',
    descriptionKo: '1인칭 영상 시나리오로 듣기·말하기를 연습하는 앱입니다.',
    detailDescription:
      'Teuida is a language app built around immersive, first-person video scenes. You watch short clips filmed from your point of view—as if you are in a café, shop, or conversation—and respond by speaking Korean when prompted, with feedback on pronunciation.\n\n' +
      'The idea is to reduce “stage fright” by simulating real interactions instead of only tapping multiple-choice answers. It strongly targets listening comprehension and spoken confidence in common situations.\n\n' +
      'It complements apps that teach grammar and vocabulary in isolation. If you need deep reading practice or exam essay skills, you will likely add other resources; for oral practice that feels closer to real life, Teuida is a distinctive option.',
    detailDescriptionKo:
      'Teuida는 1인칭 영상으로 몰입해 연습하는 언어 앱입니다. 카페·가게 등 상황을 마치 내 시점에서 보는 짧은 클립으로 보여 주고, 지시에 따라 한국어로 말하며 발음 피드백을 받는 식입니다.\n\n' +
      '객관식만 풀 때보다 실제 대화에 가깝게 청해·말하기 자신감을 기르는 데 초점을 둡니다.\n\n' +
      '문법·어휘를 따로 가르치는 앱과 함께 쓰기 좋고, 독해·시험 논술까지는 다른 자료가 필요할 수 있습니다. 구어 연습을 생활 맥락에 가깝게 하고 싶을 때 특징적인 선택지입니다.',
    image: 'teuida'
  },
  {
    id: 'king-sejong',
    name: 'King Sejong Institute',
    nameKo: '세종학당',
    sensory: ['visual'],
    style: 'structured',
    levels: ['beginner', 'elementary', 'intermediate'],
    purposes: ['academic', 'topik'],
    url: 'https://www.ksif.or.kr/index.do?lang=eng',
    description: 'Official Korean language and culture programs run under government oversight.',
    descriptionKo: '정부 산하 기관이 운영하는 공식 한국어·한국문화 교육 프로그램입니다.',
    detailDescription:
      'The King Sejong Institute (세종학당) is a network of Korean language and culture education centers supported by the Republic of Korea. Besides physical institutes in many countries, it provides online courses, textbooks, and cultural content aligned with standardized Korean-as-a-foreign-language frameworks.\n\n' +
      'Learners can expect clearly defined levels, structured progression, and materials that reflect official pedagogy—useful if you want credibility, visa-related study, or a classroom-like path without guessing which random website is trustworthy.\n\n' +
      'Offerings vary by location and online program; some services are free or low-cost. Pair Sejong materials with extra speaking practice or media if you want to accelerate conversational fluency beyond the core curriculum.',
    detailDescriptionKo:
      '세종학당은 대한민국이 지원하는 한국어·한국문화 교육 기관 네트워크입니다. 국내외 센터뿐 아니라 온라인 과정, 교재, 문화 콘텐츠를 제공하며 외국어로서의 한국어 교육 기준과 맞추어 짜인 경우가 많습니다.\n\n' +
      '단계·진도가 분명하고 공신력 있는 체계를 원할 때 유리합니다. 지역·온라인 과정마다 제공 내용과 비용(무료·저가 등)은 다를 수 있습니다.\n\n' +
      '말하기·실전 청해를 더 늘리려면 튜터나 미디어 등을 병행하는 것이 좋습니다.',
    image: 'sejong'
  },
  {
    id: 'memrise',
    name: 'Memrise',
    nameKo: 'Memrise',
    sensory: ['visual', 'auditory'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://www.memrise.com/courses/english/korean/',
    description: 'Vocabulary courses with short native-speaker videos and memory hooks.',
    descriptionKo: '원어민 짧은 영상과 암기 팁이 있는 어휘 중심 코스입니다.',
    detailDescription:
      'Memrise is a language-learning app (and website) that emphasizes vocabulary through short video clips of native speakers in real environments, plus mnemonic “mems” and spaced repetition to help words stick.\n\n' +
      'Korean learners hear natural speed, intonation, and casual phrasing alongside written forms—helpful if textbook audio feels too slow or sterile. Community and official courses cover different goals, from travel phrases to broader word lists.\n\n' +
      'Memrise shines on lexical recognition and listening snippets; comprehensive grammar sequencing may be lighter than in a dedicated course app. Combining it with structured grammar study or conversation practice usually gives a more balanced path.',
    detailDescriptionKo:
      'Memrise는 짧은 원어민 영상과 연상 이미지(밈), 간격 반복으로 어휘를 익히는 앱·웹 서비스입니다.\n\n' +
      '한국어는 실제 환경에서의 말투·억양을 들을 수 있어 교과서 녹음만으로는 부족했던 청해 감각에 도움이 됩니다. 여행 표현부터 넓은 단어장까지 코스가 다양합니다.\n\n' +
      '어휘·짧은 청취에 강하고 문법을 깊게 쌓는 구성은 상대적으로 얕을 수 있어, 문법 교재나 말하기 연습과 함께 쓰면 균형이 잘 맞습니다.',
    image: 'memrise'
  },
  {
    id: 'drops',
    name: 'Drops',
    nameKo: 'Drops',
    sensory: ['visual'],
    style: 'exploratory',
    levels: ['beginner', 'elementary'],
    purposes: ['entertainment'],
    url: 'https://languagedrops.com/en/',
    description: 'Five-minute, illustration-led vocabulary sessions with minimal reading.',
    descriptionKo: '5분 안에 그림·아이콘으로 어휘만 빠르게 다지는 앱입니다.',
    detailDescription:
      'Drops is a vocabulary-focused app built around illustrated words and quick interactions—sessions are intentionally short (often about five minutes) so you can study during a commute or break. The design minimizes long reading; you match, swipe, and recall words in a game-like flow.\n\n' +
      'Korean is taught with Hangul and visuals for topics like food, travel, and daily objects. It is strong for building a broad passive vocabulary without spending long blocks of time.\n\n' +
      'It does not replace full grammar instruction or extended listening. Think of Drops as a daily supplement: easy to maintain, good for recognition, best paired with another tool or class for sentence building and conversation.',
    detailDescriptionKo:
      'Drops는 그림·아이콘과 짧은 조작으로 어휘를 쌓는 앱입니다. 세션을 의도적으로 짧게(대략 5분) 잡아 출퇴근·틈새 학습에 맞춥니다. 긴 글 읽기보다 매칭·스와이프 등 게임형 흐름입니다.\n\n' +
      '한국어는 한글과 함께 음식·여행·일상 단어 등 주제별로 노출됩니다. 시간을 많이 내지 않고도 넓은 인지 어휘를 쌓기에 좋습니다.\n\n' +
      '문법·장문 듣기를 대체하긴 어렵고, 문장 만들기·회화는 다른 교재·앱·수업과 병행하는 보조 도구로 쓰는 것이 적합합니다.',
    image: 'drops'
  }
];