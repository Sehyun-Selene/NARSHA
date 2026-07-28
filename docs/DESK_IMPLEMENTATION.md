# 「나의 한국어 책상」 구현 지시서 (Claude Code용)

이 문서는 `Sehyun-Selene/NARSHA-MVP-ver2` 레포에서 Claude Code로 작업을 이어가기 위한 착수 문서다.
`PRD_나의한국어책상.md`가 무엇을 만드는지를 정의한다면, 이 문서는 **어떤 순서로 어떤 파일을 만드는지**를 정의한다.

> **Claude Code 사용법**
> 1. 레포를 로컬에 클론하고 `npm i`
> 2. 이 파일과 `PRD_나의한국어책상.md`를 레포 루트의 `docs/` 에 복사
> 3. `supabase/` 아래 3개 파일을 레포의 같은 경로에 복사
> 4. 레포 루트에서 `claude` 실행 후 아래 프롬프트로 시작
>
> ```
> docs/DESK_IMPLEMENTATION.md 와 docs/PRD_나의한국어책상.md 를 읽고,
> 지시서의 T1부터 순서대로 구현해줘. 각 단계가 끝날 때마다 빌드가 통과하는지 확인하고 커밋해줘.
> ```

---

## 0. 현재 레포 사실관계 (확인 완료)

| 항목 | 내용 |
|---|---|
| 빌드 | Vite 6 + React 18 + TypeScript |
| 스타일 | Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui + Radix |
| 라우팅 | `react-router` 7, `src/app/routes.tsx` 의 `createBrowserRouter` |
| 진입점 | `src/main.tsx` → `src/app/App.tsx` (`RouterProvider` + `FloatingSuggestButton` + `sonner` Toaster) |
| 백엔드 | Supabase (`src/lib/supabase.ts`, 익명 키 클라이언트 1개) |
| 기존 테이블 | `apps`, `reviews`, `review_replies`, `suggested_services` |
| 기존 인증 | **없음.** 리뷰 작성자는 localStorage 익명 ID |
| 운영자 페이지 | `VITE_ADMIN_PATH` 비밀 경로 + `VITE_ADMIN_PASSWORD` 게이트 |
| 배포 | Vercel (`vercel.json`), `narsha-mvp-ver2.vercel.app` |

**기존 기능은 건드리지 않는다.** 앱 리뷰·학습유형검사의 localStorage 익명 방식은 그대로 둔다. 「나의 한국어 책상」만 Supabase Auth를 쓴다.

---

## 1. 사전 작업 — Supabase (코드 작성 전에 먼저)

### 1-1. 스키마 적용

`supabase/migrations/20260728000000_desk_schema.sql` 전체를 Supabase 대시보드 → **SQL Editor** 에 붙여넣고 Run.
(또는 Supabase CLI 연결 시 `supabase db push`)

적용 후 확인:
- Table Editor 에 `profiles`, `desk_posts`, `desk_post_revisions`, `desk_media`, `invite_codes` 생성됨
- Storage 에 `desk-media` 버킷 생성됨 (public, 50MB)
- 모든 테이블에 RLS 가 **Enabled** 로 표시됨

### 1-2. 운영자 계정 만들기 (최초 1회)

초대코드 발급은 계정 생성 권한과 직결되므로, 클라이언트 번들에 들어가는 `VITE_ADMIN_PASSWORD` 로는 보호할 수 없다. 실제 Supabase Auth 계정을 쓴다.

1. Authentication → Users → **Add user** 로 팀 계정 생성 (이메일/비밀번호)
2. SQL Editor 에서:
   ```sql
   insert into public.profiles (id, handle, display_name, role)
   values ('<위에서 생성된 user id>', 'narsha-team', 'NARSHA Team', 'admin');
   ```

### 1-3. Edge Function 배포

```bash
supabase functions deploy redeem-invite --no-verify-jwt
supabase functions deploy admin-invites

supabase secrets set INVITE_CODE_PEPPER="$(openssl rand -hex 32)"
supabase secrets set ALLOWED_ORIGINS="https://narsha-mvp-ver2.vercel.app,http://localhost:5173"
supabase secrets set SITE_URL="https://narsha-mvp-ver2.vercel.app"
```

`SUPABASE_URL` 과 `SUPABASE_SERVICE_ROLE_KEY` 는 Edge Function 런타임이 자동 주입하므로 따로 등록하지 않는다.

> **INVITE_CODE_PEPPER 는 한 번 정하면 바꾸지 않는다.** 바꾸면 기존에 발급된 코드가 전부 무효가 된다.

### 1-4. Auth 설정

- Authentication → Providers → **Email** 활성화, "Confirm email" 은 켜둔 채로 두어도 된다
  (초대 리딤은 `email_confirm: true` 로 생성하므로 우회된다. 비밀번호 재설정 메일은 계속 동작한다)
- Authentication → URL Configuration → Redirect URLs 에 `https://narsha-mvp-ver2.vercel.app/desk/**`, `http://localhost:5173/desk/**` 추가
- Authentication → Sessions → JWT expiry 유지, **Refresh token reuse interval** 기본값, 세션 유지 기간을 60일로 늘린다

### 1-5. 환경변수 추가

`.env.example` 과 Vercel Environment Variables 양쪽에 추가한다. **값은 절대 커밋하지 않는다.**

```dotenv
# 기존
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_ADMIN_PATH=
VITE_ADMIN_PASSWORD=

# 「나의 한국어 책상」 추가분
# Edge Function 엔드포인트 베이스 (예: https://xxxx.supabase.co/functions/v1)
VITE_SUPABASE_FUNCTIONS_URL=
```

---

## 2. 의존성 설치

```bash
npm i @tiptap/react @tiptap/pm @tiptap/starter-kit \
      @tiptap/extension-image @tiptap/extension-link \
      @tiptap/extension-underline @tiptap/extension-text-align \
      @tiptap/extension-text-style @tiptap/extension-color \
      @tiptap/extension-highlight @tiptap/extension-placeholder \
      @tiptap/extension-character-count \
      dompurify
npm i -D @types/dompurify
```

Phase 2 진입 시 추가:
```bash
npm i @tiptap/extension-table @tiptap/extension-table-row \
      @tiptap/extension-table-cell @tiptap/extension-table-header \
      @tiptap/extension-font-family @tiptap/extension-subscript \
      @tiptap/extension-superscript @tiptap/extension-youtube \
      leaflet react-leaflet
npm i -D @types/leaflet
```

이미 설치되어 있어 **재설치하지 말 것**: `react-day-picker`, `date-fns`, `lucide-react`, `sonner`, `@supabase/supabase-js`, `react-router`.

---

## 3. 파일 구조 (신규)

```
src/
├─ app/
│  ├─ routes.tsx                       ← 수정: /desk 라우트 추가
│  └─ pages/
│     └─ desk/
│        ├─ DeskFeed.tsx               T4
│        ├─ DeskProfile.tsx            T4
│        ├─ DeskPost.tsx               T4
│        ├─ DeskLogin.tsx              T3
│        ├─ DeskJoin.tsx               T3
│        ├─ DeskWrite.tsx              T5·T7
│        ├─ DeskManage.tsx             T8
│        └─ DeskSettings.tsx           T8
├─ features/desk/
│  ├─ auth/
│  │  ├─ AuthProvider.tsx              T2  세션 컨텍스트
│  │  ├─ useDeskAuth.ts                T2
│  │  ├─ RequireAuthor.tsx             T2  라우트 가드
│  │  └─ LoginDialog.tsx               T3  §3.2 확정 문안 포함
│  ├─ api/
│  │  ├─ posts.ts                      T4  조회·저장·발행
│  │  ├─ profiles.ts                   T4
│  │  ├─ media.ts                      T6  업로드·리사이즈·쿼터
│  │  └─ invites.ts                    T9  admin-invites 호출
│  ├─ editor/
│  │  ├─ DeskEditor.tsx                T5  Tiptap 인스턴스
│  │  ├─ Toolbar.tsx                   T5
│  │  ├─ QuickInsertMenu.tsx           T7  좌측 + 버튼
│  │  ├─ extensions/
│  │  │  ├─ DeskDivider.ts             T7  구분선 8종
│  │  │  ├─ DeskBlockquote.ts          T7  인용구 6종
│  │  │  └─ DeskImage.ts               T6  캡션·정렬
│  │  └─ editor.css                    T5  .desk-editor / .desk-prose 스코프
│  ├─ render/
│  │  └─ DeskContent.tsx               T4  발행본 렌더 (DOMPurify)
│  └─ types.ts                         T2
├─ i18n/
│  ├─ ko.json                          T10
│  ├─ en.json                          T10
│  └─ useT.ts                          T10
└─ lib/
   └─ supabase.ts                      ← 수정: Database 타입에 desk 테이블 추가
```

---

## 4. 작업 순서

각 단계 끝에서 `npm run build` 가 통과해야 하고, 커밋을 남긴다.

### T1 — 라우팅 스켈레톤
`src/app/routes.tsx` 에 `/desk` 하위 라우트를 추가한다. `Root` 레이아웃을 그대로 상속한다.

```
/desk                    DeskFeed
/desk/login              DeskLogin
/desk/join               DeskJoin
/desk/write              DeskWrite         (RequireAuthor)
/desk/write/:postId      DeskWrite         (RequireAuthor)
/desk/manage             DeskManage        (RequireAuthor)
/desk/settings           DeskSettings      (RequireAuthor)
/desk/:handleParam       DeskProfile       (handleParam 은 '@handle' 형태)
/desk/:handleParam/:slug DeskPost
```

- `@handle` 은 react-router 파라미터로 `@` 를 포함해 받고, 컴포넌트에서 `slice(1)` 한다. `@` 로 시작하지 않으면 404 로 보낸다
- `DeskWrite` 는 반드시 `React.lazy` + `Suspense` 로 감싼다 (에디터 번들이 방문자에게 로드되면 안 된다)
- 헤더 GNB 에 탭 추가: 한국어 `나의 한국어 책상` / 영어 `Korean Desks of the World`
- 이 단계에서 각 페이지는 제목만 있는 빈 컴포넌트로 둔다

### T2 — 인증 기반
- `AuthProvider`: `supabase.auth.onAuthStateChange` 구독, `{ session, user, profile, loading }` 제공. `App.tsx` 에서 `RouterProvider` 를 감싼다
- 로그인 시 `profiles` 에서 본인 행을 한 번 읽어 컨텍스트에 담는다
- `RequireAuthor`: `loading` 중 스켈레톤, 미로그인 시 `/desk/login?next=...` 리다이렉트, `profile.is_active === false` 면 안내 화면
- `types.ts`: `Profile`, `DeskPost`, `DeskFeedItem`, `PostStatus` 등 타입 정의. `src/lib/supabase.ts` 의 `Database` 타입에도 새 테이블을 추가

### T3 — 로그인 · 가입
- `LoginDialog`: 상단에 **PRD §3.2 확정 문안**(한/영)을 그대로 넣는다. `{N}` 은 하드코딩하지 말고 활성 저자 수를 조회해 렌더하되, 조회 실패나 0이면 숫자를 생략한 문장으로 폴백
- 폼 아래 캡션: `읽기에는 로그인이 필요하지 않습니다 · No login needed to read`
- 하단 `초대코드로 시작하기 / Start with an invite code` → `/desk/join`
- 비밀번호 재설정: `supabase.auth.resetPasswordForEmail`
- `DeskJoin`: 4단계 위저드
  1. 코드 입력 (`?code=` 쿼리로 들어오면 자동 채움) → `redeem-invite` `action: 'validate'`
  2. 이메일 / 비밀번호 (8자 이상)
  3. 표시 이름 · handle · 국가 · 도시 · 한 줄 소개
     - handle 은 `profiles` 를 직접 조회해 실시간 중복 확인 (공개 읽기 가능)
     - 형식 위반·예약어·중복 시 대안 3개 제안
  4. 동의 3종 (PRD 부록 B.3 문안 그대로, 전부 필수)
- 제출 → `redeem-invite` `action: 'redeem'` → 성공 시 `signInWithPassword` → `/desk/write`
- 에러 코드 매핑: `CODE_INVALID` / `CODE_EXPIRED` / `CODE_ALREADY_USED` / `HANDLE_TAKEN` / `EMAIL_ALREADY_REGISTERED` / `RATE_LIMITED` 각각 한·영 메시지

### T4 — 공개 화면 (읽기)
- `DeskFeed`: `desk_feed` 뷰에서 조회. 헤더 블록(확정 문안 + 저자 아바타 + 파트너 배지) → 필터 바(국가·저자·태그·정렬) → 카드 그리드. 커서 기반 페이지네이션
- `DeskProfile`: `profiles` 를 handle 로 조회 + 해당 저자 발행 글 목록. 파트너면 배지 + `channel_url` 노출
- `DeskPost`: 글 상세. 마운트 시 `increment_desk_post_view` RPC 호출(세션당 1회, sessionStorage 로 중복 방지)
- `DeskContent`: `content_html` 을 **DOMPurify 로 정화한 뒤** `dangerouslySetInnerHTML`. 허용 태그·속성 화이트리스트를 명시하고 `data-variant` 속성을 허용 목록에 포함시킬 것
- 모든 화면은 기존 shadcn 컴포넌트만 조합해 만든다 (PRD §4.2)

### T5 — 에디터 기본
- `DeskEditor`: Tiptap `useEditor`. StarterKit + Underline + Link + Image + TextAlign + TextStyle + Color + Highlight + Placeholder + CharacterCount
- 제목은 에디터 밖 별도 `input` 으로 둔다 (Tiptap 문서에 넣지 않는다)
- `Toolbar`: PRD §6.2 레이아웃. 서식 그룹 — 양식(본문/H2/H3/인용구), B I U S, 색·형광펜, 정렬, 목록, 링크
- 툴바 버튼은 전부 `aria-label` 한·영 병기 + 툴팁 (별도 도움말 문서를 만들지 않기로 했으므로 툴팁이 유일한 화면 내 안내다)
- `editor.css`: `.desk-editor`(편집 화면) / `.desk-prose`(발행본 렌더) 두 스코프. **Tailwind 전역 리셋과 격리**되도록 이 안에서 h2/h3/ul/ol/blockquote/hr/table 스타일을 직접 정의한다
- 모바일: 툴바를 가로 스크롤 컨테이너로

### T6 — 미디어
- `media.ts`
  - 이미지: canvas 리사이즈(장변 1600px) → WebP 0.82 → 업로드. 원본 10MB 초과 거부
  - 영상: 50MB / 60초 이하 mp4·mov 만. `HTMLVideoElement.duration` 으로 사전 검사
  - 경로: `desk/{user.id}/{images|videos|files}/{crypto.randomUUID()}.{ext}`
  - 업로드 성공 후 `desk_media` 에 행 삽입 (트리거가 `profiles.storage_used` 를 자동 갱신)
  - 업로드 전 `storage_used + bytes > 500MB` 면 차단하고 외부 링크 사용을 안내
- 다중 선택 / 드래그&드롭 / 붙여넣기 업로드
- `DeskImage` 확장: `caption`, `align` 속성
- 외부 영상 링크: URL 붙여넣기 감지 → YouTube·Vimeo·Instagram·TikTok 이면 임베드 노드로 변환. **façade 패턴** — 썸네일만 먼저 그리고 클릭 시 iframe 로드

### T7 — 인용구 · 구분선 · Quick Insert
- `DeskDivider`: `HorizontalRule` 을 확장해 `variant` 속성 추가. 8종 — `line-short` `line-long` `bar-thick` `wave-v` `diamond` `dots` `slash` `vertical`
- `DeskBlockquote`: `Blockquote` 확장 + `variant`. 6종 — `quote-marks` `vertical-line` `speech-bubble` `line-quote` `postit` `frame`
- **둘 다 이미지 에셋 없이 CSS 로만 구현한다.** 렌더 시 `data-variant` 로 출력되고, `DeskContent` 의 DOMPurify 화이트리스트에 이 속성이 포함되어야 한다
- `QuickInsertMenu`: Tiptap `FloatingMenu`, **빈 문단일 때만** 좌측 여백에 `+` 표시. 항목 4개 — 사진 / 스티커(Phase 2, 비활성) / 구분선 ▸ / 인용구 ▸
- 서브메뉴는 실제 모양 미리보기를 보여준다 (텍스트 목록이 아니라 렌더된 형태)

### T8 — 저장 · 발행 · 관리
- 자동 임시저장
  - 입력 후 **3초 debounce → localStorage** (`desk-draft-{postId|new}`)
  - **60초마다 또는 유의미한 변경 시 서버 upsert** (`desk_posts` status=draft + `desk_post_revisions` 삽입)
  - 상단 바 `임시저장 N` 카운터, 클릭 시 리비전 목록 → 복원
  - 편집 이탈 시 `beforeunload` 경고
- 발행 모달: 대표 이미지 / 태그 5개 / 요약 / 공개 범위 / **저작권 확인 체크박스(필수)**
- slug: 제목 슬러그화 + 6자 해시. 한글 제목이면 로마자 변환 대신 `post-{해시}` 로 폴백
- 발행 시 `content_html`(DOMPurify 정화 후) 과 `content_text` 를 함께 저장
- `DeskManage`: 임시저장/발행 탭, 조회수, 비공개 전환, 삭제, 스토리지 사용량 게이지
- `DeskSettings`: 프로필 편집, handle 변경(1회), 비밀번호 변경, 계정 비활성화(글 처리 방식 선택)

### T9 — 운영자
기존 `AdminDashboard` 에 「나의 한국어 책상」 탭을 추가한다. **비밀번호 게이트만으로는 부족하므로, 이 탭 안에서는 Supabase Auth 관리자 로그인을 별도로 요구한다.**

- 초대코드: 발급(라벨·참여유형·만료일) / 목록(라벨·상태·사용자) / 회수
- 발급 결과 화면에 코드·가입 링크·전달 문안(한/영)을 복사 버튼과 함께 표시. **한 번만 보인다는 경고 문구 필수**
- 글 관리: 전체 발행 글 목록, 강제 숨김 + 사유 입력
- 계정 관리: 활성/비활성 전환

### T10 — 다국어 · 마무리
- `i18n/ko.json`, `en.json`, `useT.ts` (컨텍스트 + localStorage). i18next 는 도입하지 않는다
- 헤더에 `KO / EN` 토글
- 본문은 번역하지 않는다. `lang` 은 필터용 태그일 뿐
- 접근성: 키보드 내비게이션, `⌘/Ctrl+B/I/U`, `⌘/Ctrl+S`(임시저장), `⌘/Ctrl+K`(링크), 색상 대비 AA
- `/privacy`, `/terms` 에 PRD 부록 B 조항 반영 (법무 검토 완료 후 최종본으로 교체)

---

## 5. 구현 시 지켜야 할 것

**하지 말 것**
- 시크릿(service role key, 관리자 비밀번호, pepper)을 코드·클라이언트 번들에 넣지 않는다. 전부 환경변수 / Supabase secrets
- 새 디자인 토큰·색상 체계를 만들지 않는다. 기존 shadcn 컴포넌트와 Tailwind 설정을 그대로 쓴다 (PRD §4.2)
- `/desk/help` 페이지나 PDF 다운로드 링크를 만들지 않는다 (PRD §12에서 제외 확정)
- 기존 리뷰·설문 기능의 localStorage 익명 방식을 Auth 로 바꾸지 않는다
- `content_html` 을 정화 없이 렌더하지 않는다
- Phase 1 에서 커스텀 노드(지도·일정·파일·각주·문자표)를 만들지 않는다. 일정이 무너진다

**반드시 할 것**
- 각 단계마다 `npm run build` 통과 확인 후 커밋
- RLS 를 실제로 검증한다 — 로그아웃 상태에서 `desk_posts` INSERT 시도, 다른 저자 글 UPDATE 시도가 모두 막히는지
- 모바일 실기기(또는 DevTools 모바일 뷰)에서 글쓰기·사진 업로드가 동작하는지 확인. 저자 다수가 모바일 사용자다
- 느린 네트워크(DevTools Slow 3G)에서 자동 임시저장이 정상 동작하는지 확인

**우선순위** — 8/10 오픈까지 시간이 부족하면 이 순서로 버린다:
`T9 운영자 UI` → `T10 영문 UI` → `T7 인용구/구분선 일부 variant` → `T6 영상 직접 업로드`
**절대 버리면 안 되는 것**: T1~T5, T8(자동저장·발행). 초대코드 발급은 UI 없이 Supabase SQL Editor 에서 직접 INSERT 해도 오픈은 가능하다.

---

## 6. 완료 검증 체크리스트

**인증**
- [ ] 초대코드 없이 `/desk/join` 진입 → 가입 불가
- [ ] 같은 코드 2회 사용 → `CODE_ALREADY_USED`
- [ ] 만료된 코드 → `CODE_EXPIRED`
- [ ] 회수된 코드 → `CODE_INVALID`
- [ ] 로그아웃 상태에서 `/desk/write` 접근 → 로그인으로 리다이렉트
- [ ] 브라우저 콘솔에서 `supabase.from('invite_codes').select()` → 0건 또는 권한 오류
- [ ] 저자 A 의 토큰으로 저자 B 의 글 UPDATE 시도 → 실패
- [ ] 저자가 자기 프로필의 `role` 을 `admin` 으로 UPDATE 시도 → 값이 바뀌지 않음

**에디터**
- [ ] 글 작성 → 새로고침 → localStorage 복구 배너로 내용 복원
- [ ] 임시저장 후 다른 기기 로그인 → 서버 리비전에서 복원
- [ ] 사진 업로드 후 `profiles.storage_used` 증가, 삭제 시 감소
- [ ] 500MB 초과 시 업로드 차단
- [ ] 구분선 8종·인용구 6종이 편집 화면과 발행 화면에서 **동일하게** 보임
- [ ] `<script>` 를 포함한 콘텐츠를 넣어 발행 → 렌더 시 제거됨

**공개 화면**
- [ ] 로그아웃 상태에서 `/desk`, `/desk/@handle`, 글 상세 정상 열람
- [ ] `draft` 글은 URL 직접 접근해도 안 보임
- [ ] 운영자 숨김 처리한 글이 즉시 사라짐
- [ ] 파트너 배지가 3곳(피드 아바타·프로필 헤더·글 상세)에 표시됨
- [ ] `/desk` LCP < 2.5s (Slow 3G)
- [ ] 방문자 세션에서 에디터 청크가 로드되지 않음 (Network 탭 확인)

---

## 7. 함께 갱신할 문서

- `CLAUDE_CODE_NOTES.md` — "로그인 시스템 없음" 서술을 갱신한다. 리뷰·설문은 익명 localStorage 유지, 「나의 한국어 책상」은 Supabase Auth + 초대코드라는 **이원 구조**임을 명시
- `.env.example` — `VITE_SUPABASE_FUNCTIONS_URL` 추가
- `README.md` — Supabase 마이그레이션·Edge Function 배포 절차 링크
