# 「나의 한국어 책상」 배포 체크리스트 (사용자 수동 작업)

프론트엔드(T1~T10)는 브랜치 `feat/korean-desk` 에 모두 구현·커밋되어 있다.
아래는 **Claude 가 대신 할 수 없는** Supabase·배포 작업이다. 순서대로 진행하면 된다.

> 진행 상태 표기: ✅ 완료 / ⬜ 남음

---

## 0. 스키마 GRANT — ✅ 완료

마이그레이션에 테이블 GRANT 가 누락돼 있어 §7.5 블록을 추가하고, 라이브 DB 에 실행 완료했다.
(재적용해도 안전. 새 환경에 스키마를 다시 올릴 때는 `20260728000000_desk_schema.sql` 전체를 실행하면 GRANT 까지 포함된다.)

---

## 1. Supabase CLI 설치 — ⬜

```bash
npm i -g supabase
supabase login
supabase link --project-ref <프로젝트 ref>   # 대시보드 Settings → General 의 Reference ID
```

## 2. Edge Function 배포 — ⬜

```bash
supabase functions deploy redeem-invite --no-verify-jwt
supabase functions deploy admin-invites
```

- `redeem-invite` 는 공개 엔드포인트라 `--no-verify-jwt` (게이트웨이 apikey 로만 접근, 내부에서 코드·rate limit 검증)
- `admin-invites` 는 운영자 JWT 를 함수 내부에서 검증하므로 `--no-verify-jwt` 를 붙이지 않는다

## 3. Secrets 설정 — ⬜

```bash
supabase secrets set INVITE_CODE_PEPPER="$(openssl rand -hex 32)"
supabase secrets set ALLOWED_ORIGINS="https://narsha-mvp-ver2.vercel.app,http://localhost:5173"
supabase secrets set SITE_URL="https://narsha-mvp-ver2.vercel.app"
```

> ⚠️ **`INVITE_CODE_PEPPER` 는 한 번 정하면 절대 바꾸지 않는다.** 바꾸면 이미 발급된 초대코드가 전부 무효가 된다.
> `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` 는 런타임이 자동 주입하므로 등록하지 않는다.

## 4. 운영자 계정 생성 (최초 1회) — ⬜

1. 대시보드 → Authentication → Users → **Add user** (이메일/비밀번호)
2. SQL Editor 에서 (`<user id>` 는 방금 만든 계정의 id):

```sql
insert into public.profiles (id, handle, display_name, role)
values ('<생성된 user id>', 'narsha-team', 'NARSHA Team', 'admin');
```

→ 이후 `{ADMIN_PATH}/desk` 에서 이 계정으로 로그인하면 초대코드 발급·글 관리가 열린다.

## 5. Auth 설정 — ⬜

- Authentication → Providers → **Email** 활성화 (Confirm email 켠 채 둬도 됨 — 리딤은 `email_confirm:true` 로 우회, 비번 재설정 메일은 계속 동작)
- Authentication → URL Configuration → Redirect URLs 에 추가:
  - `https://narsha-mvp-ver2.vercel.app/desk/**`
  - `http://localhost:5173/desk/**`
- Authentication → Sessions → 세션 유지 기간을 **60일** 로 (저자 재로그인 마찰 최소화)

## 6. 환경변수 (선택) — ⬜

- `VITE_SUPABASE_FUNCTIONS_URL` 은 **설정하지 않아도 된다.** 미설정 시 클라이언트가
  `VITE_SUPABASE_URL + "/functions/v1"` 로 자동 파생한다. 함수 URL 이 다른 경우에만 `.env.local`·Vercel 에 추가한다.

---

## 7. 배포 후 검증 (DESK_IMPLEMENTATION §6)

**인증**
- ⬜ 초대코드 없이 `/desk/join` → 가입 불가
- ⬜ 같은 코드 2회 → `CODE_ALREADY_USED` / 만료 → `CODE_EXPIRED` / 회수 → `CODE_INVALID`
- ⬜ 로그아웃 상태 `/desk/write` → 로그인 리다이렉트
- ⬜ 콘솔에서 `supabase.from('invite_codes').select()` → 0건/권한오류
- ⬜ 저자 A 토큰으로 저자 B 글 UPDATE → 실패
- ⬜ 저자가 자기 `role` 을 admin 으로 UPDATE → 값 안 바뀜(트리거)

**에디터·미디어**
- ⬜ 작성 → 새로고침 → localStorage 복구 배너
- ⬜ 사진 업로드 후 `profiles.storage_used` 증가, 삭제 시 감소
- ⬜ 80MB 초과 시 업로드 차단
- ⬜ 구분선 8·인용구 6 이 편집/발행 화면에서 동일
- ⬜ `<script>` 포함 콘텐츠 발행 → 렌더 시 제거

**공개**
- ⬜ 로그아웃 상태 `/desk`, `/desk/@handle`, 글 상세 열람
- ⬜ draft 글 URL 직접 접근 안 보임 / 운영자 숨김 즉시 반영
- ⬜ 파트너 배지 3곳 표시 / 방문자 세션에서 에디터 청크 미로드(Network)

---

## 8. 이번 구현에 반영된 확정 변경 (참고)

- 계정 스토리지 쿼터 **80MB** (PRD 500MB → HANDOFF §5 정정)
- 영상 **직접 업로드 제외**, 외부 링크 임베드만 (YouTube·Vimeo·Instagram·TikTok)
- `/desk/_preview` 는 **dev 전용** 라우트 (프로덕션 빌드 제외) — 로그인 없이 에디터 확인용

## 9. 남은 비개발 항목

- ⬜ **이용약관·개인정보처리방침에 「나의 한국어 책상」 조항 반영** — PRD 부록 B 초안 → **법무(변호사) 검토 필수**. 특히 국고보조사업 협약서의 산출물 권리 귀속 조항 우선 확인. 가입 동의 문안·저작권 체크박스는 이미 구현돼 있으나, `/terms`·`/privacy` 본문 개정은 검토 후 반영
- ⬜ 저자용 PDF 가이드 (기능 확정 후 실제 스크린샷으로 제작)
- ⬜ 참여 인원 확정 시 초대코드 일괄 발급 (`{ADMIN_PATH}/desk`)
- ⬜ `feat/korean-desk` → `main` 병합 (배포·검증 완료 후)
