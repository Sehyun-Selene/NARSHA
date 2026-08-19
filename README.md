# NARSHA(나르샤) MVP

흩어져 있는 한국어 학습 서비스(앱·웹사이트·강의)를 한곳에 모아 **검색·비교·후기**를 제공하는 디스커버리 플랫폼. 서브 제품으로 글쓰기 공간 「나의 한국어 책상」(`/desk`)이 있다.

배포: https://narsha.vercel.app

작업 규칙·아키텍처 설명은 [CLAUDE.md](CLAUDE.md) 에 있다. **코드를 고치기 전에 그 문서를 먼저 읽는다.**

---

## 다른 컴퓨터에서 시작하기

### 1. 클론과 설치

```bash
git clone <이 저장소 URL> && cd NARSHA-MVP-ver2 && npm i
```

Node 18 이상. 패키지 매니저는 npm(`package-lock.json` 기준).

### 2. 환경변수

`.env.example` 을 `.env.local` 로 복사하고 값을 채운다.

```bash
cp .env.example .env.local
```

| 변수 | 어디서 얻나 | 필수 |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase 대시보드 → Project Settings → API | ✅ |
| `VITE_SUPABASE_ANON_KEY` | 같은 화면. 공개돼도 되는 키다 (RLS 로 통제) | ✅ |
| `VITE_ADMIN_PATH` | 운영자 대시보드 경로 조각. 기존 배포와 같은 값을 써야 한다 | 권장 |
| `VITE_SUPABASE_FUNCTIONS_URL` | 비우면 URL 에서 자동 파생 | — |

`.env.local` 은 gitignore 된다. **`VITE_` 값은 클라이언트 번들에 인라인되므로 서버 전용 시크릿을 넣지 않는다** (CLAUDE.md §8-3).

### 3. 실행

```bash
npm run dev
```

http://localhost:5173 — Supabase 는 원격 프로젝트에 그대로 붙으므로 로컬 DB를 띄울 필요가 없다.

```bash
npm run build
```

`package.json` 스크립트는 이 둘뿐이다. **test / lint / typecheck 스크립트는 없고 `tsconfig.json` 도 없다** → 타입 에러가 있어도 빌드는 통과한다. 검증은 수동 QA 로 한다 (CLAUDE.md §9).

---

## 저장소에 없는 것

클론한 환경에는 아래가 **의도적으로** 없다. 없어도 개발·빌드·배포에 지장은 없다.

| 없는 것 | 이유 | 대신 |
|---|---|---|
| `.env.local` | 시크릿 | 위 2단계 |
| `docs/`, `FEEDBACK_FEATURES_SPEC.md`, `STATIC_PAGES_AND_TOOLTIP_SPEC.md`, `TAG_DUAL_DISPLAY_AMENDMENT.md` | 내부 기획·법무 문서 (CLAUDE.md §8-10) | 필요한 규칙은 CLAUDE.md §8 에 옮겨 적혀 있다 |
| `src/imports/pasted_text/` | 폐기된 초기 PRD. 스택이 "Next.js" 로 적혀 있어 오해를 부른다 | 실제 스택은 CLAUDE.md §2 |
| `node_modules/`, `dist/` | 산출물 | `npm i` / `npm run build` |

---

## 서버 쪽 설정 (새 Supabase 프로젝트로 옮길 때만)

기존 프로젝트에 붙어 개발할 때는 건드릴 것이 없다. 새 프로젝트를 만들 때만 필요하다.

1. **스키마·시드** — `supabase/01_schema.sql` → `supabase/02_seed_apps.sql` → `supabase/migrations/` 를 파일명 순서대로 SQL Editor 에서 실행
2. **Edge Functions** — `supabase/functions/` (Deno). 대시보드 환경변수: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SITE_URL`, `ALLOWED_ORIGINS`, `INVITE_CODE_PEPPER`
   - ⚠️ `INVITE_CODE_PEPPER` 를 바꾸면 발급해 둔 미사용 초대코드가 전부 무효가 된다
3. **Auth** — Google provider, `Confirm email` 켬, Redirect URLs 에 `https://<도메인>/**` 과 `http://localhost:5173/**`, 커스텀 SMTP + 발송 한도
4. **Vercel** — 위 `VITE_*` 값을 Environment Variables 에 넣는다. SPA rewrite 는 `vercel.json` 에 있다
5. **백업** — `.github/workflows/db-backup.yml` 이 이미 설치돼 있다. GitHub Secrets 에 DB 접속 정보와 암호화 비밀번호가 필요하다

DB 복구 절차는 [RESTORE.md](RESTORE.md), 매월 점검 항목은 [MONTHLY_CHECK.md](MONTHLY_CHECK.md).

---

## 구조 요약

Vite 6 + React 18 + react-router 7 + Tailwind v4 + Supabase. **Next.js 가 아니다.**

| 경로 | 내용 |
|---|---|
| `src/app/` | 공개 사이트 — `pages/`, `components/`, `data/`, `i18n/`, `lib/`, `routes.tsx` |
| `src/features/desk/` | 「나의 한국어 책상」 기능 슬라이스 |
| `src/features/auth/` | 일반회원 인증 |
| `src/lib/supabase.ts` | 유일한 Supabase 클라이언트 + DB Row 타입 |
| `supabase/` | 스키마·시드·마이그레이션·Edge Functions |
| `api/` | 후기 제출·신고·도움됨 (서버 함수) |

자세한 규칙은 CLAUDE.md.
