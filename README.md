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

## private 전환 (저장소 비공개)

기획·법무 문서와 DB 스키마를 공개하지 않으려면 저장소를 private 으로 둬야 한다.
파일을 삭제해도 과거 커밋에 남으므로 삭제로는 해결되지 않는다 (CLAUDE.md §8-10).

**Vercel 의 Git 연동 자동 배포는 private 저장소에서 동작하지 않는다.** 통제 테스트로
확정한 내용이다 — 다른 변수를 고정하고 visibility 만 바꿨을 때 public 은 40초 내
배포, private 은 4분간 시작조차 안 됨(`not a member of the team` 메일).

그래서 `.github/workflows/deploy.yml` 이 Vercel CLI 로 직접 배포한다. 토큰 인증이라
visibility 와 무관하다. **순서를 지켜야 배포가 끊기는 구간이 생기지 않는다.**

1. **Vercel 토큰 발급** — Account Settings → Tokens. Scope 는 이 프로젝트가 있는 팀
2. **ID 두 개 확인** — Vercel 프로젝트 → Settings → General 에서 Project ID / Team ID
3. **GitHub Secrets 등록** — 저장소 Settings → Secrets and variables → Actions
   `VERCEL_TOKEN` · `VERCEL_ORG_ID`(Team ID) · `VERCEL_PROJECT_ID`
4. **Actions 배포를 먼저 검증** — Actions 탭 → `Deploy to Vercel` → Run workflow.
   이 시점에는 Git 연동도 살아 있어 같은 커밋이 두 번 배포될 수 있다(무해)
5. **Vercel 쪽 자동 배포 끄기** — `vercel.json` 에 추가
   ```json
   "git": { "deploymentEnabled": false }
   ```
6. **저장소를 private 으로** — GitHub Settings → General → Danger Zone
7. **확인** — 아무 커밋이나 푸시해서 Actions 배포가 도는지, 프로덕션이 갱신되는지

되돌리려면 6 → 5 를 역순으로. 워크플로는 그대로 둬도 무해하다.

### private 전환 후 유의점

| 항목 | 영향 |
|---|---|
| GitHub Actions 분 | public 은 무제한, **private 은 월 2,000분.** 배포 ~2분 + 주간 백업 ~1분 → 여유 있음 |
| Vercel 배포 | Git 연동 대신 Actions 경로. Vercel 대시보드에는 그대로 기록됨 |
| 이미 클론·포크된 사본 | private 으로 바꿔도 회수되지 않는다. 히스토리 노출을 완전히 끊으려면 새 private 저장소에 스쿼시 커밋으로 이관하고 기존 저장소를 삭제해야 한다 |

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
