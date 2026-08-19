# CLAUDE.md — NARSHA MVP 작업 지침

이 파일은 Claude Code가 세션마다 자동으로 읽는다. 코드를 만지기 전에 §2(스택)와 §8(하지 말 것)은 반드시 확인할 것.

---

## 1. 제품 개요

**NARSHA(나르샤)** — 흩어져 있는 한국어 학습 서비스(앱·웹사이트·강의)를 한곳에 모아 **검색·비교·후기**를 제공하는 디스커버리 플랫폼. 초기 정의: "왓챠피디아의 한국어 학습 버전 — 학습 유형이 태깅된 후기 검색 엔진."

- **콘텐츠를 직접 제작하지 않는다.** (`faq.q.teach.a`) 큐레이션·검색·후기가 제품의 전부다.
- 사용자
  - 해외 비원어민 한국어 학습자 (K-pop/드라마 유입 10~20대, 업무 목적 성인)
  - 초대코드 기반 저자 — 「나의 한국어 책상」(desk)에 글을 쓰는 소수
  - 운영자 — 앱 등록·후기 검토·초대 발급
- 핵심 메커니즘
  - 10문항 **학습 유형 검사** → 6유형(가~바). 감각 선호(시각/청각/복합) × 접근 방식(탐색형/구조형)
  - 후기에 작성자의 학습 유형이 자동 태깅됨
  - 다축 필터 (레벨·목적·강점 + 가격/플랫폼/수업 언어/피드백 등 ~13축)
  - 서브 제품 **「나의 한국어 책상」** — Tiptap 기반 글쓰기·발행 공간 (`/desk`)
- 배포: Vercel, `https://narsha.vercel.app`
- **저장소는 public 으로 시작했고 private 로 전환한다.** 2026-08 이전 커밋은 공개 상태로 push 된 이력이 있으므로, 커밋하는 모든 것이 공개될 수 있다고 가정하고 작업할 것 (§8-4, §8-10).

---

## 2. 스택과 구조

### ⚠️ Next.js 아니다

초기 PRD(`src/imports/pasted_text/product-requirements.md`)에 "Next.js"라고 적혀 있지만 **실제 구현은 Vite SPA**다. 그 문서는 폐기된 기술 선택을 담고 있다.

| 항목 | 실제 |
|---|---|
| 빌드 | Vite 6 + `@vitejs/plugin-react` |
| 프레임워크 | React 18 |
| 라우팅 | **react-router 7** — `createBrowserRouter`, 패키지명은 `react-router` (`react-router-dom` 아님) |
| 스타일 | Tailwind **v4** (`@tailwindcss/vite`, 설정 파일 없음) |
| UI | shadcn/ui 벤더링 + Radix, 일부 MUI 혼재 |
| 에디터 | Tiptap 2 + DOMPurify |
| 백엔드 | Supabase (Postgres / Auth / Storage / Edge Functions) |
| 배포 | Vercel + SPA rewrite (`vercel.json`) |

SSR·서버 컴포넌트 **없음**. `src/app/components/ui/**` 에 붙어 있는 `'use client'` 는 shadcn 원본에서 딸려온 잔재이며 아무 의미 없다.

### 디렉터리

| 경로 | 내용 |
|---|---|
| `src/app/` | 공개 사이트 — `pages/`, `components/`, `data/`, `i18n/`, `lib/`, `context/`, `routes.tsx` |
| `src/features/desk/` | Desk 기능 슬라이스 — `api/`, `auth/`, `editor/`, `render/`, `legal/`, `components/`, `types.ts` |
| `src/lib/supabase.ts` | 유일한 Supabase 클라이언트 + 모든 DB Row 타입 |
| `src/styles/` | `index.css` → `fonts.css` / `tailwind.css` / `theme.css` |
| `src/imports/` | **Figma 원본 export. 라우팅에 연결돼 있지 않다.** 화면을 고치려고 여기를 수정하지 말 것 |
| `supabase/` | `01_schema.sql`, `02_seed_apps.sql`, `migrations/`, `functions/` (Deno) |
| `docs/` | PRD·핸드오프·법무 자료. **gitignore 됨 — 로컬 전용** (§8-10) |

라우트 전체는 `src/app/routes.tsx` 참조. 알아둘 점:
- 운영자 라우트 경로가 **환경변수로 계산된다** — `import.meta.env.VITE_ADMIN_PATH || 'admin'`
- `desk/_preview` 는 `import.meta.env.DEV` 일 때만 등록되는 개발 전용 라우트
- 코드 분할은 Tiptap 에디터 하나뿐 (`lazy(() => import('./pages/desk/DeskWrite'))`) — 방문자 번들에서 빼기 위한 의도

### 명령어

```bash
npm run dev
```

```bash
npm run build
```

`package.json` 스크립트는 이 둘뿐이다. **test / lint / typecheck / format 스크립트는 존재하지 않는다.** ESLint·Prettier·테스트 러너도 설치돼 있지 않다.

### 환경변수

클라이언트 (`.env.local`, gitignore): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PATH`, `VITE_SUPABASE_FUNCTIONS_URL`(선택)

`VITE_ADMIN_PASSWORD` 는 제거됐다 (GNB PRD REQ-H). 운영자 판정은 Supabase Auth 세션 + `profiles.role` 이다.

Edge Function (Supabase 대시보드): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`, `ALLOWED_ORIGINS`, `INVITE_CODE_PEPPER`

---

## 3. 이원 구조 — 인증이 두 개다

가장 오해하기 쉬운 지점. 두 체계는 **의도적으로 분리**돼 있다 (`src/features/desk/auth/AuthProvider.tsx:12`).

**A. 공개 사이트 — 로그인 없음**
사용자 식별이 전부 localStorage. 학습 유형 결과, 후기 작성자, 제안 중복 방지, 말풍선 노출 여부 모두. 다른 브라우저/기기는 별개 사용자로 취급되고, 브라우저 데이터를 지우면 사라진다 — 이 한계는 인지된 상태이며 정식 로그인은 데이터 운영 부담이 커질 때 별건으로 도입한다.

**B. Desk — 실제 Supabase Auth**
- 가입은 **초대코드 전용** — `validateInvite` → `redeemInvite` 2단계, `supabase/functions/redeem-invite/`
- 라우트 가드 `RequireAuthor` — 세션 없으면 `/desk/login?next=…`, `profile.is_active === false` 면 "작성 중지" 화면
- 관리자 판정은 `profile.role === 'admin'`, **서버에서 JWT로 재검증**됨 (`supabase/functions/admin-invites/index.ts`)
- Context/hook 은 provider 파일과 분리돼 있다 (`useDeskAuth.ts`) — Fast Refresh 때문. 합치지 말 것

**C. 운영자 대시보드 — Supabase Auth + 역할 판정** (B 와 동일 체계)
`/{VITE_ADMIN_PATH}` 와 `/{VITE_ADMIN_PATH}/desk` 둘 다 같은 방식이다 — `useDeskAuth()` 로 세션을 확인하고, `profile.role === 'admin'` 이 아니면 진입을 막는다. 역할은 서버(`profiles`)에 있고 RLS 정책 함수 `public.is_admin()` 이 같은 기준을 쓴다.

`VITE_ADMIN_PATH` 는 경로를 가리는 용도로만 남아 있다 — 보안 수단이 아니다 (§8-3).

익명 사용자 데이터는 Desk 계정으로 이관되지 않는다.

---

## 4. i18n — 반복 지시 1순위

로케일은 **`'ko' | 'en'` 둘뿐**. `src/lib/supabase.ts` 의 `DeskLang`(`ko|en|id|tl`)은 **글의 언어**이지 UI 로케일이 아니다.

### 문자열 추가 규칙

- 새 UI 문자열은 `src/app/i18n/strings.ts` 의 `DICT` 에 추가한다. **하드코딩 금지.**
- `Entry = { ko: string; en: string }` 이고 `DICT` 가 `satisfies Record<string, Entry | Entry[]>` 로 닫혀 있다 → **한쪽 언어만 넣으면 타입 에러가 난다.** 이 안전장치를 우회하지 말 것.
- 여러 줄 카피는 `\n` 이 아니라 **`Entry[]`**. 언어마다 줄 수가 다를 수 있고(`home.hero.title` 은 KO 3줄 / EN 4줄), `{ ko: '', en: '…' }` 같은 빈 슬롯이 정상이다.
- `tLines()` 는 **의도적으로 EN 폴백을 하지 않는다** (`i18n/index.ts:39-41`) — 폴백하면 한국어 헤딩 끝에 영어 줄이 붙는다.
- **문자열에 HTML 금지.** 강조는 `**…**`(액센트 볼드) / `~~…~~`(취소선) 토큰을 쓰고 `i18n/rich.tsx` 가 렌더한다.

### 조회 API (`src/app/i18n/index.ts`)

| 용도 | 호출 |
|---|---|
| 컴포넌트 | `const { t, tLines, tag, tagLong, lang, setLang } = useT()` |
| 컴포넌트 밖 (toast, 이벤트 핸들러) | `tNow(key)` |
| 직접 언어 분기가 필요할 때 | `const [lang] = useLang()` |

없는 키는 키 문자열을 그대로 반환하고 DEV 콘솔에 `[i18n] missing key: …` 를 한 번 경고한다.

### 태그

- **태그 값(value)은 DB 값이자 필터 쿼리 키다. 번역·변경 절대 금지.** 라벨만 번역한다.
- `TAG_CHIP`(짧은 칩) / `TAG_LONG`(서술형, 상세·운영자 화면) — `src/app/i18n/tags.ts`
- KO 칩 라벨은 **6자 이내** 규칙 (예외 1건이 주석으로 표시돼 있음)

### 언어 상태

`src/app/lib/useLang.ts` — localStorage `narsha-lang`, 결정 순서는 저장값 → 브라우저 언어(`ko*` 면 ko) → `en`. 전역 동기화는 `narsha-lang-change` 커스텀 이벤트 + `storage` 이벤트(다른 탭). `syncHtmlLang()` 이 `<html lang>` 을 맞추고, `styles/index.css` 의 `html[lang='ko']` 자간 규칙이 여기에 의존한다.

### DB 텍스트

fetch 시점이 아니라 **렌더 시점**에 언어를 고른다 — `data/apps.ts` 의 `appName(app, lang)` / `appDescription(app, lang)`. fetch 시점에 고르면 언어 전환마다 재조회가 필요해진다.

### 현실 (중요)

i18n 은 **부분 적용 상태**다. `DICT` 를 쓰는 파일은 10개뿐 — `Header`, `Footer`, `FloatingSuggestButton`, `SuggestServiceModal`, `useDocumentTitle`, 그리고 페이지 `Home` / `About` / `Faq` / `AppDetail` / `NotFound`.

미적용: `AdminDashboard`, `Methodology`, `PrivacyPolicy`, `TermsOfService`, `ReviewWrite`, `Reviews`, `Survey`, `SurveyIntro`, `SurveyResult`. `lang === 'ko' ? … : …` 인라인 삼항이 아직 80여 곳 남아 있다.

→ **새 코드는 항상 `DICT` 를 쓴다.** 인라인 삼항은 기존 코드의 잔재이지 따라야 할 패턴이 아니다.

Desk 는 별도 관례를 쓴다 — 모듈 로컬 `Record<key, {ko, en}>` 테이블 (`auth/deskErrors.ts`, `legal/consentText.ts`, `components/introCopy.ts`, `types.ts`의 `COUNTRY_LABEL`). **기존 Desk 파일을 수정할 때는 그 관례를 유지**하고, `DICT` 로 옮기지 말 것.

---

## 5. 데이터·상태

- **상태 라이브러리 없음.** react-query 도 없다. `useState` + `useEffect` + `Promise.all`, 페이지가 자기 데이터를 소유한다. 최신 코드는 `let active = true` 취소 플래그를 쓴다.
- **네트워크 호출을 컴포넌트에 두지 않는다.** 공개 사이트는 `src/app/data/*`, Desk 는 `src/features/desk/api/*`.
- **에러는 삼키지 않는다.** 데이터 레이어에서 `if (error) throw error;`, 페이지에서 에러 상태 렌더 또는 `toast.error`.
- Edge Function 은 `supabase.functions.invoke` 가 아니라 **raw `fetch`** 로 호출한다 (`desk/api/invites.ts`). 응답은 `{ ok: true, … } | { ok: false, error: string }` 판별 유니온이고 `error` 는 코드값 — `deskErrorMessage(code, lang)` 이 문구로 바꾼다.
- 피드 페이지네이션은 커서 기반: `latest` 는 `published_at` keyset, `popular` 는 정수 offset (`desk/api/posts.ts`).

### 타입 3계층

| 계층 | 위치 | 규칙 |
|---|---|---|
| DB Row | `src/lib/supabase.ts` | snake_case, `*Row` 접미사 (`AppRow`, `DeskPostRow`) |
| 도메인 별칭 | `src/features/desk/types.ts` | Row 재노출·파생 |
| 뷰 모델 | 데이터 모듈에 콜로케이트 | `App` in `data/apps.ts`, `Review` in `data/reviews.ts` |

Row → 뷰 모델 변환은 `rowToApp` / `rowToReview` 처럼 `rowToX` 로 명명한다. 중앙 `types/` 디렉터리는 만들지 않는다.

### localStorage 키

**`narsha-` 프리픽스가 규칙이다.**

| 키 | 용도 | 위치 |
|---|---|---|
| `narsha-lang` | UI 언어 | `app/lib/useLang.ts` |
| `narsha-theme` | 라이트/다크 | `app/context/ThemeContext.tsx` |
| `narsha-learner-type` | 학습 유형 결과 (가~바) | `pages/Survey.tsx` |
| `narsha-survey-responses` / `narsha-survey-date` | 설문 응답·완료 일시 | `pages/Survey.tsx` |
| `narsha-return-app-id` | 후기 작성 후 돌아갈 앱 | `pages/ReviewWrite.tsx` |
| `narsha-last-suggestion` | 서비스 제안 5분 중복 방지 | `data/suggestions.ts` |
| `narsha-suggest-bubble-shown` | 플로팅 버튼 말풍선 첫 방문 | `components/FloatingSuggestButton.tsx` |
| `review-helpful` | 후기 도움됨 기록 (JSON) | ⚠️ 프리픽스 없는 **기존 예외** |
| desk 임시 저장 (글별) | 에디터 드래프트 | `pages/desk/DeskWrite.tsx` |

읽기·쓰기는 `try/catch` 로 감싼다 (사파리 프라이빗 모드 등).

---

## 6. 스타일

- **Tailwind v4, 설정 파일 없음.** 토큰은 `src/styles/theme.css`, 소스 스캔 범위는 `src/styles/tailwind.css` 의 `@source`. `tailwind.config.*` 를 만들지 말 것.
- 다크 모드는 클래스 기반 — `@custom-variant dark (&:is(.dark *))`, 클래스는 `ThemeContext` 가 토글. **색을 쓸 때는 반드시 라이트/다크 쌍으로 작성한다.**
- 현실: 앱 코드는 대부분 하드코딩 hex 임의값이다. 새 색을 만들지 말고 아래를 재사용할 것.

| 역할 | 라이트 | 다크 |
|---|---|---|
| 배경 | `#ffffff` | `#0c141f` |
| 본문 텍스트 | `#1e293b` | `#dce3f3` |
| 보조 텍스트 | `#64748b` | `#8a94a6` |
| 테두리 | `#e2e8f0` | `#232a36` |
| 액센트(sky) | `#0ea5e9` | `#8ecdff` |
| 주요 버튼 그라데이션 | `from-[#8ecdff] to-[#1b99dc]` | 동일 |

- About 페이지 액센트는 CSS 변수 기반이고 **사용 범위가 규칙으로 묶여 있다** (`theme.css` 주석): coral(`--accent-problem`)은 Problem 구역, amber(`--accent-values`)는 Values 구역 밖으로 나가지 않는다. **CTA·링크·포커스 링은 언제나 sky.** 두 색 합쳐 화면 색면적 5% 이내.
- 브레이크포인트는 모바일 우선, 실질적으로 `sm` 과 `lg` 만 쓴다. **내비게이션 분기는 `md` 가 아니라 `lg`** (`hidden lg:flex` / `lg:hidden`). 표준 패딩 램프는 `px-4 sm:px-8`.
- 폭은 컨테이너 클래스가 아니라 픽셀 임의값: 헤더 `max-w-[1440px]`, 홈 `max-w-[1280px]`, desk `max-w-[1120px]`/`max-w-[800px]`, 법적 문서 `max-w-[800px]`, About 본문 `max-w-[720px]`.
- `cn()` 은 **`src/app/components/ui/utils.ts`** 에 있다 (`lib/utils.ts` 아님).
- Figma 가 남긴 `font-['Manrope:ExtraBold',sans-serif]` 류 클래스는 실제 폰트 패밀리가 아니다. `styles/index.css` 의 속성 선택자(`[class*="font-['Manrope"]`)가 이를 실제 폰트로 되살린다 — **이 매핑을 지우면 500곳 넘는 선언이 시스템 폰트로 조용히 폴백한다.**
- `styles/index.css` 의 일부 규칙은 `@layer` 밖에 **의도적으로** 있다. Tailwind v4 에서 unlayered CSS 가 `@layer utilities` 를 이기기 때문.

---

## 7. 네이밍·파일·커밋

- 페이지/컴포넌트: **PascalCase `.tsx`, 파일당 1개, `export default function Name()`**
- 라우트 폴더 안의 공용 비(非)라우트 모듈은 `_` 프리픽스 — `pages/desk/_DeskShell.tsx`, `pages/about/_shared.tsx`
- 훅: `use*.ts` camelCase, `app/lib/` 또는 기능 폴더 옆
- 데이터/API 모듈: camelCase 복수 명사(`apps.ts`, `reviews.ts`, `posts.ts`), **named export 만**
- 상수: `SCREAMING_SNAKE`, 쓰는 컴포넌트 바로 위 모듈 레벨
- **배럴은 `src/app/i18n/index.ts` 하나뿐이다. 새로 만들지 말 것.** `@` → `src` 별칭이 vite 설정에 있지만 앱 코드는 상대 경로를 쓴다 — 기존 방식 유지
- `src/app/components/ui/**` 는 벤더링된 shadcn 이다. kebab-case 파일명, `'use client'`, 다른 관례 — **앱 규칙 적용 대상이 아니고 임의 리팩터링 대상도 아니다**
- 주석은 **한국어**, 블록 독 스타일. 근거가 되는 스펙 조항을 인용하는 관례가 있다 — `(PRD R5.2)`, `(R3.1)`, `(PRD §9)`, `(법무 검토 §7.3)`. 이 관례를 유지할 것
- 폐기 예정은 `@deprecated` + 제거 시점 메모

### 커밋·브랜치

```
type(scope): 한국어 요약
```

- type: `feat` / `fix` / `docs` / `chore` (Conventional Commits)
- scope: 소문자 한 단어 — `home`, `i18n`, `about`, `faq`, `apps`, `desk`, `editor`, `header`, `survey`, `db`, `meta`
- 제목은 마침표 없이, 근거는 `—` 뒤에 덧붙임
  예) `feat(desk): 가입·발행 동의를 실제로 DB에 기록 (법무 검토 §7.3)`
- 한 줄 제목만. 이모지·`Co-Authored-By` 트레일러 없음
- 브랜치: `feat/<kebab-topic>`, PRD 하나당 장수 브랜치 하나 → `main` 병합

---

## 8. 하지 말 것 (하드 룰)

1. **법적 문서의 시행일을 임의로 채우지 말 것.** `/privacy`, `/terms` 의 `2026-XX-XX` 플레이스홀더는 사용자가 확정하기 전까지 그대로 둔다.

2. **운영자 큐레이션 필드(`apps.차별점`)를 후기 집계로 자동 변경하지 말 것.** 임계값은 운영자 대시보드에 **검토 알림만** 띄우고(`data/adminAlerts.ts`, `lib/alertThresholds.ts`), 실제 반영은 운영자 클릭으로만 일어난다. 이유: 후기 조작 악용, 임계값 부정확성, 운영자 권한 보전. 앱 상세의 강점 표시는 두 구역(운영자 큐레이션 / 학습자 평가)으로 분리돼 있고, 학습자 평가 구역은 후기 3개 이상일 때만 노출한다.

3. **`VITE_ADMIN_PATH` 는 클라이언트 번들에 인라인된다.** 경로를 가리는 것은 인증이 아니라 은폐다. 실제 권한 판정은 Supabase Auth 세션 + `profiles.role`(화면) 과 RLS·Edge Function(서버) 에서 한다. 화면 통제만 믿고 권한이 필요한 동작을 추가하지 말 것. **서버 전용 값에 `VITE_` 프리픽스를 붙이지 말 것** — 붙이면 번들에 들어간다. (`VITE_ADMIN_PASSWORD` 가 이 이유로 제거됐다.)

4. **PII·시크릿을 예시·시드·테스트에 실제 값으로 넣지 말 것.** DB 덤프에는 회원 이메일이 들어 있다(백업 워크플로가 gpg 로 암호화하는 이유). 저장소를 private 로 돌려도 이 규칙은 유지한다 — 백업 아티팩트·이슈·PR 로 흘러나갈 경로가 남는다. 더미는 명백히 가상인 값으로 — `홍길동`, `010-0000-0000`, `you@example.com`. API 키·비밀번호는 코드에 하드코딩하지 말고 환경변수 전제로 작성.

5. **UI 문자열 하드코딩 금지.** 새 문자열은 `DICT`(공개 사이트) 또는 해당 Desk 모듈의 로컬 테이블 경유.

6. **Desk 본문 HTML 은 반드시 `features/desk/render/sanitize.ts` 를 거친다.** 허용 태그·속성 화이트리스트, 링크에 `rel="noopener noreferrer nofollow"` 강제, 이미지 `loading=lazy` 가 여기서 붙는다. **`dangerouslySetInnerHTML` 을 새로 추가하지 말 것** — 현재 사용처는 `DeskContent.tsx` 한 곳뿐이다.

7. **동의 문구를 바꾸면 `CONSENT_VERSION` 을 올린다** (`features/desk/legal/consentText.ts`). 동의 스냅샷이 DB에 기록되므로 버전이 어긋나면 법무 근거가 깨진다.

8. **`src/imports/` 를 수정해 화면을 고치려 하지 말 것.** Figma export 원본이고 라우팅에 연결돼 있지 않다.

9. **타입 에러가 빌드를 막지 않는다.** `tsconfig.json` 이 없어서 `vite build` 는 esbuild transpile-only 로 돈다. 타입 에러가 있어도 빌드는 통과한다 — 에디터 진단만 믿지 말고 §9 절차로 실제 실행 확인할 것.

10. **내부 기획·법무 문서는 커밋하지 않는다.** 사양·비용·로드맵·법무 검토는 저장소에 두지 않는다(저장소가 public 으로 시작한 이력이 있고, private 전환 후에도 방침은 유지). `.gitignore` 에 등록돼 있고, 아래 문서들은 **로컬 전용**이라 clone 한 환경에는 존재하지 않는다. 공유는 별도 경로로 한다.

    | 문서 | 내용 | 상태 |
    |---|---|---|
    | `FEEDBACK_FEATURES_SPEC.md` | 서비스 제안 + 후기 태그 | 대부분 구현됨 |
    | `STATIC_PAGES_AND_TOOLTIP_SPEC.md` | about/methodology/privacy/terms + 말풍선 | 구현됨 |
    | `TAG_DUAL_DISPLAY_AMENDMENT.md` | 위 문서의 B5·B6를 **대체**하는 개정 | §8-2의 근거 |
    | `docs/NARSHA_PRD_GNB-Hero-ReviewGating.md` | GNB 3개 축소 / 후기 게이팅 | **미구현, 예정** |
    | `docs/PRD_NARSHA_About_i18n.md` | About·FAQ·i18n | 현재 브랜치에서 구현됨 |
    | `docs/PRD_나의한국어책상.md` | Desk 전체 사양 | 구현됨 |
    | `docs/DESK_IMPLEMENTATION.md` / `HANDOFF.md` / `DESK_DEPLOY_CHECKLIST.md` | Desk 구현·인수인계·배포 | — |
    | `docs/LEGAL_REVIEW_PACKAGE.md` | 약관·개인정보처리방침 법무 검토 | §8-7의 근거 |
    | `docs/db-backup.yml` | 백업 워크플로 원본 | **설치 완료** — `.github/workflows/db-backup.yml` 로 커밋돼 있다 |
    | `src/imports/pasted_text/product-requirements.md` | 2026-03 초기 PRD. **스택이 "Next.js"로 적혀 있어 오해를 부른다** | 폐기됨 |

    → 새 기획 문서도 `docs/` 안에 두면 자동으로 제외된다. 에이전트는 이 파일들이 없을 수 있다고 가정하고, 필요한 규칙은 이 문서 §8 에서 읽을 것.

    ⚠️ **이미 push 된 히스토리에는 남아 있다.** `docs/` 5개 문서와 초기 PRD 는 2026-07~08 커밋(`8b32875`, `349aa3e`, `ed9d733`)으로 `origin/main` 에 올라가 있다. 추적 해제는 앞으로만 막을 뿐 과거 커밋에서는 그대로 읽힌다. 대응은 **저장소 private 전환**으로 한다 — 히스토리 재작성·force push 는 하지 않는다.

---

## 9. 변경 후 확인 절차

자동 검증은 이것 하나뿐이다.

```bash
npm run build
```

테스트·린트·타입체크 스크립트는 없다. 따라서 **수동 QA 가 실질적인 검증**이다. `npm run dev` (포트 5173) 후:

1. **KO / EN 양쪽** 확인 — 헤더 언어 토글. 줄바꿈이 언어별로 다르게 깨지지 않는지
2. **라이트 / 다크 양쪽** 확인
3. **모바일(≤`sm`) / 데스크톱(≥`lg`) 양쪽** 확인 — 특히 내비게이션은 `lg` 에서 갈린다
4. **콘솔에 `[i18n] missing key` 경고가 없는지**
5. **라우트 직접 진입** — 새로고침·URL 직접 입력이 404 나지 않는지 (SPA rewrite)
6. Desk 를 건드렸다면 **비로그인 / 로그인 / `is_active=false`** 세 상태
