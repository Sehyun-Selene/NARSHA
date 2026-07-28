# 인수인계 — 「나의 한국어 책상」 개발 환경

| | |
|---|---|
| 작성일 | 2026-07-29 |
| 레포 | `Sehyun-Selene/NARSHA-MVP-ver2` |
| 배포 | Vercel · `narsha-mvp-ver2.vercel.app` |
| DB | Supabase (무료 플랜) |
| 1차 오픈 목표 | **2026-08-10 (월)** |

이 문서는 다른 컴퓨터에서 작업을 이어받기 위한 것이다. 함께 볼 문서는 `docs/PRD_나의한국어책상.md`(무엇을 만드는가)와 `docs/DESK_IMPLEMENTATION.md`(어떤 순서로 만드는가) 두 개다.

---

## 1. 지금까지 완료된 것

- [x] PRD 작성 완료 (`docs/PRD_나의한국어책상.md`)
- [x] Claude Code용 구현 지시서 작성 완료 (`docs/DESK_IMPLEMENTATION.md`)
- [x] Supabase 마이그레이션 SQL 작성 및 **적용 완료**
      → `profiles` `desk_posts` `desk_post_revisions` `desk_media` `invite_codes` `invite_redeem_attempts` 생성됨
      → Storage `desk-media` 버킷 생성됨
      → 전 테이블 RLS 적용됨
- [x] Edge Function 코드 작성 완료 (`supabase/functions/`) — **아직 배포 전**
- [x] 기존 테이블의 RLS 취약점 2건 정리 (§4 참조)
- [x] 로컬 개발 환경 구축 및 `npm run dev` 동작 확인

## 2. 아직 안 한 것

- [ ] **Edge Function 배포** (`redeem-invite`, `admin-invites`) — Supabase CLI 필요, T3 단계에서 진행
- [ ] **Supabase 운영자 계정 생성** — 지시서 §1-2 절차
- [ ] **프론트엔드 구현 전체** (T1~T10)
- [ ] 이용약관·개인정보처리방침 개정 (PRD 부록 B 초안 → 법무 검토 필요)
- [ ] 저자용 PDF 가이드 (기능 구현 완료 후 제작)

---

## 3. 새 컴퓨터 세팅 절차

### 3-1. 설치

1. **Node.js** — [nodejs.org](https://nodejs.org) 에서 **LTS** 버튼으로 다운로드, 기본값으로 설치
2. **Git** — [git-scm.com/download/win](https://git-scm.com/download/win), 기본값으로 설치
3. 설치 후 **터미널을 완전히 닫고 새로 열 것.** 안 그러면 `npm`을 못 찾는다
4. 확인: `node -v`, `npm -v`, `git -v`

### 3-2. PowerShell 스크립트 실행 허용 (Windows)

`npm : 이 시스템에서 스크립트를 실행할 수 없으므로...` 오류가 나면:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

`Y` 입력. 관리자 권한 불필요. (명령 프롬프트 `cmd`를 쓰면 이 설정 없이도 된다.)

### 3-3. 레포 받기

```powershell
mkdir C:\dev
cd C:\dev
git clone https://github.com/Sehyun-Selene/NARSHA-MVP-ver2.git
cd NARSHA-MVP-ver2
npm i
npm i react@18.3.1 react-dom@18.3.1
npm i -D @types/react@18 @types/react-dom@18
```

> **react 를 따로 설치하는 이유**: 이 레포의 `package.json`은 Figma 내보내기라 `react`/`react-dom`이 `peerDependencies`에 `optional: true`로만 걸려 있다. `npm i`만으로는 설치되지 않아 실행 시 화면이 비어 보인다.

경로는 `C:\dev`를 쓴다. 한글·공백·OneDrive 동기화가 없어서 도구가 가장 덜 꼬인다.

### 3-4. 환경변수

`.env.local`은 `.gitignore`에 있어 레포에 없다. 새로 만들어야 한다.

```powershell
notepad .env.local
```

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables** 에서 4개 값을 복사해 아래 형식으로 작성한다.

```dotenv
VITE_SUPABASE_URL=https://<프로젝트ID>.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_<...>
VITE_ADMIN_PATH=<Vercel에 설정된 값>
VITE_ADMIN_PASSWORD=<Vercel에 설정된 값>
```

주의사항:

- **URL 뒤에 `/rest/v1/` 같은 경로를 붙이지 말 것.** 프로젝트 주소만 넣는다. 클라이언트가 경로를 알아서 붙인다
- `=` 양옆에 공백 금지, 값에 따옴표 금지
- Supabase 키 위치: 대시보드 → Settings → **API Keys** 의 `Publishable key`. Project URL 은 Settings → **Data API**
- `sb_secret_...` 로 시작하는 Secret key 는 **절대 이 파일이나 코드에 넣지 않는다.** 서버(Edge Function)에서만 쓰이고 자동 주입된다
- 저장 후 `type .env.local` 로 내용이 실제로 들어갔는지 확인할 것. 메모장이 빈 파일로 저장하거나 `.env.local.txt`로 저장하는 사고가 잦다

### 3-5. 동작 확인

```powershell
npm run dev
```

터미널에 뜨는 `http://localhost:5173` 을 브라우저에서 연다. **이 터미널 창은 닫지 말 것** — 서버가 꺼진다.

화면이 하얗게 비면 `F12` → Console 탭의 빨간 오류를 본다. `supabaseUrl is required` 가 뜨면 `.env.local` 문제이며, 파일을 고친 뒤 **서버를 껐다 켜야** 한다(Vite는 시작할 때만 환경변수를 읽는다).

### 3-6. Claude Code

```powershell
npm i -g @anthropic-ai/claude-code
cd C:\dev\NARSHA-MVP-ver2
claude
```

---

## 4. Supabase 현재 상태

### 4-1. 적용 완료

`supabase/migrations/20260728000000_desk_schema.sql` 이 이미 실행되어 있다. **다시 실행할 필요 없다.** (재실행해도 안전하도록 작성되어 있긴 하다.)

### 4-2. 기존 테이블 RLS 정리 (2026-07-28 조치)

기존 테이블 5개는 모두 RLS가 켜져 있었고 DELETE 정책이 전무해 데이터 삭제 위험은 없었다. 다만 아래 두 정책이 과도하게 열려 있어 제거했다.

| 테이블 | 제거한 정책 | 제거 사유 |
|---|---|---|
| `suggested_services` | `anon can view suggestions` (SELECT, 조건 없음) | 이 테이블의 `reporter_email` 컬럼이 누구에게나 조회 가능했다. 개인정보 노출 |
| `apps` | `anon can update app differentiators (mvp admin)` (UPDATE, 조건 없음) | 누구나 앱 소개 정보를 수정할 수 있었다 |

**부작용**: 어드민 페이지에서 ① 서비스 제안 목록 조회, ② 앱 정보 수정 이 동작하지 않는다. 그동안은 Supabase Table Editor에서 직접 처리하고, **T9 단계에서 관리자 인증을 붙이면서 "관리자만 허용" 정책으로 새로 만든다.**

원래 정의 (참고용 — 그대로 복원하지 말고 관리자 한정으로 다시 쓸 것):

```sql
-- 원본. 조건이 전부 true = 무제한 허용이었음
create policy "anon can view suggestions" on public.suggested_services
  for select using (true);

create policy "anon can update app differentiators (mvp admin)" on public.apps
  for update using (true) with check (true);
```

`dismissed_alerts` 의 `ALL` 정책은 의도적으로 남겨두었다. 어드민 화면의 알림 확인 여부만 저장하는 내부 상태라 유출·훼손 가치가 없고, 막으면 운영만 불편해진다.

### 4-3. 알려진 보안 부채 (T9에서 해결)

현재 어드민 페이지는 `VITE_ADMIN_PATH` + `VITE_ADMIN_PASSWORD` 로 보호되어 있다. **`VITE_` 접두어가 붙은 값은 빌드 시 클라이언트 번들에 문자열 그대로 박히므로, 배포된 사이트의 JS 파일을 열면 누구나 읽을 수 있다.** 실제 방어선이 아니다.

- 지금은 문제가 크지 않다 — RLS가 켜져 있고 DELETE 정책이 없어 데이터를 지울 수 없다
- 그러나 **초대코드 발급은 곧 계정 생성 권한**이므로 이 방식으로 보호할 수 없다
- 그래서 `admin-invites` Edge Function 은 **Supabase Auth 로 로그인한 `profiles.role = 'admin'` 계정의 JWT** 를 요구하도록 작성되어 있다. 이 검증은 서버에서 일어나 소스를 봐도 우회할 수 없다
- T9 에서 어드민 페이지 전체를 이 방식으로 옮긴다

---

## 5. 이번 세션에서 확정·변경된 사항

PRD 본문에 아직 반영되지 않은 변경이 있다. **Claude Code 첫 프롬프트에 반드시 포함할 것.**

| 항목 | 변경 |
|---|---|
| 계정당 스토리지 쿼터 | 500MB → **80MB** |
| 영상 직접 업로드 | Phase 1 **제외**. 외부 링크 임베드만 지원 |

**근거**: Supabase 무료 플랜의 파일 저장 용량은 **프로젝트 전체 1GB**다. 10인 × 80MB = 800MB로 한도 안에 들어온다. 사진을 WebP 1600px로 압축하면 장당 약 200KB → 1인당 약 400장으로, 4개월 기록에 충분하다. 직접 업로드 영상은 1편에 30~50MB라 이 계산을 즉시 깨뜨린다.

**함께 알아둘 무료 플랜 제약**

- DB 500MB / 파일 1GB / 월 활성 사용자 50,000명 (Auth는 무료 포함, 저자 10명은 문제없음)
- **1주일간 접속이 없으면 프로젝트가 자동 일시정지된다.** 사업 기간에는 트래픽이 있어 괜찮으나, 사업 종료 후 자율 운영 단계에서는 걸림돌이 된다. 종료 시점에 Pro 플랜($25/월) 전환 여부를 판단할 것

이 밖에 PRD에서 확정된 주요 결정은 다음과 같다.

- 탭 명칭: 한국어 `나의 한국어 책상` / 영어 `Korean Desks of the World`
- 로그인 진입점은 숨기지 않고 상시 노출. 가입은 초대코드로만. 모달 상단에 코너 성격을 설명하는 확정 문안 사용 (PRD §3.2)
- 초대코드는 **1인 1코드, 1회용**. 나르샤 팀이 운영자 화면에서 생성해 개별 연락으로 전달
- handle(개인 책상 URL 식별자)은 저자가 직접 지정, 가입 후 1회만 변경 가능
- 크리에이터 파트너에게 `파트너 / Partner` 배지 표시. 권한 차이는 없음
- 기존 사이트 디자인을 그대로 사용. 신규 디자인 토큰·시안을 만들지 않음
- `/desk/help` 도움말 페이지와 사이트 내 PDF 다운로드 링크는 **만들지 않음**. 가이드는 개별 전달 PDF 1종뿐이며, 기능 구현이 끝난 뒤 실제 화면 스크린샷으로 제작한다

---

## 6. 다음에 할 일

### 6-1. Claude Code 시작 프롬프트

```
docs/DESK_IMPLEMENTATION.md 와 docs/PRD_나의한국어책상.md 를 읽고,
지시서의 T1부터 순서대로 구현해줘.

단, PRD에서 두 가지가 변경됐으니 반영해줘:
1. 계정당 스토리지 쿼터 500MB → 80MB (Supabase 무료 플랜 총 1GB 기준)
2. 영상 직접 업로드는 Phase 1에서 제외. 외부 링크 임베드만 지원

각 단계가 끝날 때마다 npm run build 가 통과하는지 확인하고 커밋해줘.
```

### 6-2. T3 진입 전에 해야 할 Supabase 작업

지시서 §1-2, §1-3 절차. Supabase CLI 설치가 필요하다.

```bash
supabase functions deploy redeem-invite --no-verify-jwt
supabase functions deploy admin-invites
supabase secrets set INVITE_CODE_PEPPER="<openssl rand -hex 32 로 생성한 값>"
supabase secrets set ALLOWED_ORIGINS="https://narsha-mvp-ver2.vercel.app,http://localhost:5173"
supabase secrets set SITE_URL="https://narsha-mvp-ver2.vercel.app"
```

> `INVITE_CODE_PEPPER` 는 **한 번 정하면 바꾸지 않는다.** 바꾸면 이미 발급된 초대코드가 전부 무효가 된다.

운영자 계정 생성:
1. Supabase → Authentication → Users → Add user
2. SQL Editor 에서
   ```sql
   insert into public.profiles (id, handle, display_name, role)
   values ('<생성된 user id>', 'narsha-team', 'NARSHA Team', 'admin');
   ```

### 6-3. 일정이 밀릴 때 버리는 순서

`T9 운영자 UI` → `T10 영문 UI` → `T7 인용구·구분선 일부` → `T6 이미지 편의 기능`

**절대 버리면 안 되는 것**: T1~T5, T8(자동저장·발행).
초대코드는 UI 없이 SQL Editor에서 직접 넣어도 오픈은 가능하다.

---

## 7. 남은 확정 사항

1. **참여 인원 수** — PRD §3.2 소개 문안의 `{N}` 및 초대코드 발급 수량. 하드코딩하지 말고 활성 저자 수를 조회해 렌더할 것
2. **이용약관·개인정보처리방침 개정** — PRD 부록 B에 조문 초안이 있다. 시행 전 **변호사 등 전문가 검토 필요**. 특히 국고보조사업 협약서·공모 지침에 산출물 권리 귀속 조항이 있는지를 가장 먼저 확인해야 한다 (부록 B.4에 상담용 질문 8개 정리)
3. **저자용 PDF 가이드 영문 검수 담당자**
4. **나르샤 팀 문의 창구** — 가이드에 기재할 연락 수단

---

## 8. 자주 막히는 지점 모음

| 증상 | 원인·해결 |
|---|---|
| `npm`을 내부 또는 외부 명령으로 인식하지 못함 | Node.js 미설치, 또는 설치 후 터미널을 새로 열지 않음 |
| `이 시스템에서 스크립트를 실행할 수 없으므로...` | PowerShell 실행 정책. §3-2 참조 |
| `cd Documents` 실패 | OneDrive로 이동된 폴더. `C:\dev` 를 쓸 것 |
| 경로만 입력했더니 "실행할 수 있는 파일이 아님" | 폴더 이동은 `cd` 를 앞에 붙여야 한다 |
| `npm i` 가 한참 멈춘 듯 보임 | 정상. 2~5분 걸린다. 10분 넘으면 `Ctrl+C` → `npm cache clean --force` → `npm i --verbose` |
| 화면이 하얗고 콘솔에 `supabaseUrl is required` | `.env.local` 이 비었거나 이름이 `.env.local.txt`. `dir .env*` 로 확인 |
| `.env.local` 을 고쳤는데 그대로임 | Vite는 시작할 때만 환경변수를 읽는다. 서버 재시작 필요 |
| 사이트는 뜨는데 데이터가 안 나옴 | `VITE_SUPABASE_URL` 뒤에 `/rest/v1/` 이 붙어 있는지 확인 |
| `localhost:5173` 연결 거부 | 개발 서버가 꺼져 있음. 서버 터미널을 닫지 말 것. 포트가 5174로 바뀌기도 한다 |
| SQL Editor의 `Potential issue detected` 경고 | `drop`·`create` 가 포함되면 항상 뜬다. 내용을 확인했다면 Run |

---

## 9. 참고

- 이 프로젝트의 Cowork 대화는 **로컬 세션**이라 기기 간에 따라오지 않는다. 옮길 필요도 없다 — 필요한 맥락은 `docs/` 세 문서에 모두 들어 있다
- 시크릿(Supabase Secret key, `INVITE_CODE_PEPPER`, 관리자 비밀번호)은 **어떤 문서에도, 코드에도 적지 않는다.** Vercel Environment Variables 와 Supabase Secrets 에만 둔다
