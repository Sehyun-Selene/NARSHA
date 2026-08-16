# DB 복구 런북

NARSHA 데이터베이스를 백업에서 되살리는 전체 절차.
**이 파일 하나만 읽고 끝까지 진행할 수 있게** 쓴 문서다. 급할 때 다른 문서를 찾아다니지 않아도 된다.

> 에이전트에게 맡길 때: "RESTORE.md 읽고 복구 진행해줘" 라고 하면 된다.
> 다만 **암호(`BACKUP_PASSPHRASE`) 입력과 프로젝트 삭제는 사람이 직접 한다.**

마지막 검증: 2026-08-16 (전 과정 실제 시연 완료)

---

## 0. 먼저 판단할 것 — 어떤 상황인가

| 상황 | 가야 할 절차 |
|---|---|
| 백업이 멀쩡한지 확인만 하고 싶다 (정기 점검) | §1 → §2 → §3 → **§4-A (새 프로젝트에 복원)** → §6 |
| 데이터가 일부만 날아갔다 (표 하나, 행 몇 개) | §1 → §2 → §3 → **§4-C (부분 복구)** → §6 |
| 프로젝트가 통째로 날아갔다 / 되돌릴 수 없게 망가졌다 | §1 → §2 → §3 → **§4-B (운영 프로젝트 복구)** → §5 → §6 |

⚠️ **§4-B 는 되돌릴 수 없다.** 시작 전에 §4-B 의 경고를 반드시 읽을 것.

---

## 1. 준비물

| 항목 | 어디에 있나 |
|---|---|
| 암호화된 백업 파일 | GitHub Actions 아티팩트 (아래) |
| `BACKUP_PASSPHRASE` | 비밀번호 관리자. **이 값이 없으면 백업을 영원히 못 연다** |
| `gpg` | Git for Windows 에 포함 — `C:\Program Files\Git\usr\bin\gpg.exe` |
| `tar` | Windows 10 이상 기본 제공 |
| Supabase 대시보드 접근 | `narsha.koreanedu@gmail.com` 계정 |

`psql` 은 이 PC에 설치돼 있지 않다. 없어도 §4 의 SQL Editor 경로로 복구할 수 있다 (덤프가 작다).

### 백업 파일 받기

1. https://github.com/Sehyun-Selene/NARSHA/actions
2. 좌측 **DB Backup** → 초록 체크가 있는 최근 실행 클릭
3. 페이지 하단 **Artifacts** → `db-backup-<날짜>` 클릭 → zip 다운로드
4. zip 을 푼다. 안에 `backup_<날짜>.tar.gz.gpg` 하나가 있다

아티팩트 보관 기간은 **90일**이다. 그보다 오래된 시점으로 되돌려야 하면 백업이 없다.

**작업 폴더는 저장소 밖에 둘 것.** 복호화하면 평문 SQL 이 생기고, 실수로 커밋되면 회원 이메일이 저장소에 박힌다.

---

## 2. 복호화 · 압축 해제

암호를 명령줄에 직접 적으면 셸 히스토리에 남는다. **프롬프트로 받는다.**

### PowerShell (이 PC의 기본)

```powershell
cd "$env:USERPROFILE\Downloads\db-backup-<날짜>"
$gpg = "C:\Program Files\Git\usr\bin\gpg.exe"
$sec = Read-Host "passphrase" -AsSecureString
$PW = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
& $gpg --batch --yes --passphrase $PW -o backup.tar.gz -d backup_<날짜>.tar.gz.gpg
$PW = $null
"exit=$LASTEXITCODE"
```

### Git Bash

폴더에서 우클릭 → `추가 옵션 표시` → `Git Bash Here`

```bash
read -rsp "passphrase: " PW; echo
gpg --batch --yes --passphrase "$PW" -o backup.tar.gz -d backup_<날짜>.tar.gz.gpg
unset PW
echo "exit=$?"
```

**결과 판정**

| 출력 | 뜻 |
|---|---|
| `exit=0` + `gpg: AES256.CFB encrypted data` | 성공 |
| `decryption failed: Bad session key` | 암호가 틀림 |
| `'gpg' 용어가 ... 인식되지 않습니다` | PATH 문제 — 위처럼 전체 경로로 호출 |

### 압축 풀기

```powershell
tar -xzf backup.tar.gz
dir
```

`schema.sql`(스키마·정책·함수·트리거)과 `data.sql`(데이터)이 나오면 정상.

---

## 3. 내용 점검 (복원 전)

빈 덤프를 복원해 멀쩡한 DB를 덮는 사고를 막는 단계다.

### 크기 확인

```powershell
dir schema.sql, data.sql
```

둘 다 수십 KB 이상이어야 한다. 몇 백 바이트면 덤프가 실패한 것이다 — 그 백업은 쓰지 말고 이전 아티팩트를 받는다.

### 담긴 객체 확인 (Git Bash)

```bash
grep -c "CREATE TABLE" schema.sql              # 테이블 수
grep -ci "create or replace function" schema.sql
grep -ci "create or replace trigger" schema.sql
grep -c "CREATE POLICY" schema.sql             # RLS 정책
```

2026-08 기준 정상값: 테이블 13+, 함수 13, 트리거 9, 정책 25+.
표가 늘어났으면 이 값도 늘어난다 — **줄어들었으면** 의심할 것.

### 한글 확인

```bash
grep -o "Memrise.\{0,80\}" data.sql | head -1
```

`'바 Mixed Structured'` 처럼 한글이 멀쩡히 보여야 한다. `'諛?Mixed'` 로 보이면 파일을 잘못 읽고 있는 것이다.

---

## 4. 복원

`schema.sql` **먼저**, `data.sql` **나중**. 순서를 바꾸면 테이블이 없어 실패한다.

### 4-A. 새 프로젝트에 복원 — 점검·시연용 (안전)

운영 데이터를 건드리지 않는다. 정기 점검은 항상 이 경로로 한다.

1. Supabase 대시보드 → **New project** → 이름 `narsha-restore-test` → 생성 (2분쯤)
2. **그 새 프로젝트**의 SQL Editor 를 연다 (⚠️ 운영 프로젝트 아님, 반드시 확인)
3. `schema.sql` 내용을 붙여넣고 **Run**
4. `data.sql` 내용을 붙여넣고 **Run**
5. §5 검증
6. 검증 끝나면 그 프로젝트 삭제 (Settings → General → Delete project)

**파일을 클립보드로 옮기기 — ⚠️ 인코딩 주의**

```powershell
Get-Content schema.sql -Raw -Encoding UTF8 | Set-Clipboard
```

`-Encoding UTF8` 을 빼면 Windows PowerShell 5.1 이 시스템 코드페이지(949)로 읽어 한글이 깨지고, 깨진 바이트가 SQL 따옴표를 망가뜨려 이런 에러로 실패한다:

```
ERROR: 42601: syntax error at or near "{"
```

이 에러가 나면 SQL 이 잘못된 게 아니라 **복사가 잘못된 것**이다. 위 명령으로 다시 복사한다.
메모장(`notepad data.sql`)으로 열어 Ctrl+A → Ctrl+C 해도 된다.

`psql` 이 설치돼 있다면 붙여넣기 없이:

```bash
psql "<SUPABASE_DB_URL>" -f schema.sql
psql "<SUPABASE_DB_URL>" -f data.sql
```

`SUPABASE_DB_URL` 은 대시보드 상단 **Connect** → **Session pooler** 의 URI.
(직접 연결 주소 `db.*.supabase.co` 는 IPv6 전용이라 환경에 따라 붙지 않는다.)

---

### 4-B. 운영 프로젝트 복구 — 실제 사고 (되돌릴 수 없음)

> ⚠️ **읽고 시작할 것**
> - 이 절차는 현재 데이터를 백업 시점으로 되돌린다. **백업 이후에 쌓인 데이터는 사라진다.**
> - 백업은 주 1회(화요일 03시 KST)다. 최악의 경우 **최대 7일치**를 잃는다.
> - 시작 전에 **지금 상태를 먼저 백업**한다 — 잘못 판단했을 때 돌아올 곳이 필요하다.
>   GitHub Actions → DB Backup → **Run workflow** 로 현재 시점 백업을 만든 뒤 시작한다.
>   (DB가 아예 접속 불가라면 이 단계는 건너뛴다.)

**권장 — 새 프로젝트로 갈아타기**

기존 프로젝트를 되살리는 것보다 안전하다. 남아 있는 손상 데이터와 섞이지 않는다.

1. §4-A 대로 **새 프로젝트**를 만들고 복원한다 (이름은 `narsha-restore-test` 말고 실제 이름으로)
2. 복원된 프로젝트에서 **Project Settings → API** 의 `Project URL` 과 `anon key` 를 복사
3. Vercel → 프로젝트 → Settings → Environment Variables 에서 교체
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (새 프로젝트의 service_role key)
4. Supabase → Authentication → **URL Configuration** 에 Redirect URLs 재등록
   - `https://narsha.vercel.app/**`
   - `http://localhost:5173/**`
5. Authentication → Providers → **Google** 재설정 (client ID / secret)
6. Edge Functions 재배포 + 시크릿 재설정
   ```bash
   supabase functions deploy redeem-invite --no-verify-jwt
   supabase functions deploy admin-invites
   ```
   시크릿: `INVITE_CODE_PEPPER`, `ALLOWED_ORIGINS`, `SITE_URL`
   ⚠️ `INVITE_CODE_PEPPER` 는 **기존과 같은 값**이어야 한다. 바뀌면 아직 안 쓴 초대코드가 전부 무효가 된다.
7. Vercel 재배포 (Deployments → 최신 → Redeploy)
8. §5 검증

**대안 — 기존 프로젝트를 비우고 덮어쓰기**

새 프로젝트를 만들 수 없는 사정이 있을 때만.

```sql
-- ⚠️ public 스키마를 통째로 지운다. 되돌릴 수 없다.
drop schema public cascade;
create schema public;
grant usage on schema public to anon, authenticated, service_role;
```

그 다음 `schema.sql` → `data.sql` 순으로 실행한다.
`auth` 스키마(계정)는 이 방법으로 정리되지 않는다. 계정까지 되돌려야 하면 새 프로젝트 쪽이 맞다.

---

### 4-C. 부분 복구 — 표 하나 / 행 몇 개만

전체를 덮지 않는다. 필요한 부분만 골라 넣는다.

1. §4-A 로 **새 프로젝트에 백업을 복원**한다 (읽기용 사본)
2. 그 사본에서 필요한 데이터를 조회해 `INSERT` 문으로 뽑는다
3. 운영 프로젝트에 그 `INSERT` 만 실행한다
4. 사본 프로젝트 삭제

`data.sql` 을 직접 열어 해당 표의 `INSERT INTO "public"."<표>"` 구문만 잘라 써도 된다.
`data.sql` 은 표마다 INSERT 한 문장이라 잘라내기 쉽다.

---

## 5. 검증

복원한 프로젝트의 SQL Editor 에서:

```sql
select 'apps' t, count(*) from public.apps
union all select 'reviews',        count(*) from public.reviews
union all select 'review_replies', count(*) from public.review_replies
union all select 'profiles',       count(*) from public.profiles
union all select 'desk_posts',     count(*) from public.desk_posts
union all select 'members',        count(*) from public.members
union all select 'auth.users',     count(*) from auth.users
order by 1;
```

행 수가 백업 시점의 원본과 맞아야 한다.
(백업보다 나중에 만든 표는 그 백업에 없다 — 없다고 나오는 게 정상일 수 있다.)

**한글이 안 깨졌는지**

```sql
select id, name, learning_type from public.apps where id = 'memrise';
```

`learning_type` 에 한글이 멀쩡히 보여야 한다.

**RLS 가 살아 있는지** — 이게 빠지면 데이터가 전부 공개된다

```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
order by tablename;
```

`rowsecurity` 가 전부 `true` 여야 한다.

```sql
select count(*) from pg_policies where schemaname = 'public';
```

정책 수가 백업 시점과 맞아야 한다 (2026-08 기준 25+).

**운영 프로젝트를 복구한 경우 — 사이트에서 직접 확인**

1. https://narsha.vercel.app 접속 → 서비스 목록이 뜨는지
2. 앱 상세 진입 → 후기가 보이는지
3. 로그인 → `/my/reviews` 진입
4. `/desk` 글 목록이 뜨는지

---

## 6. 뒤처리 — 반드시 할 것

평문 덤프에는 **`auth.users` 가 통째로 들어 있다. 회원 이메일이 평문이다.**
그래서 아티팩트를 gpg 로 암호화한다. 풀어놓은 파일을 남기면 그 보호가 무의미해진다.

```powershell
Remove-Item schema.sql, data.sql, backup.tar.gz
dir
```

`.gpg` 파일만 남긴다.

- 테스트로 만든 Supabase 프로젝트를 삭제했는지 확인 (무료 플랜 프로젝트 수 제한이 있다)
- 이 폴더를 저장소 안에 두지 않았는지 확인

---

## 7. 문제 대응표

| 증상 | 원인 | 조치 |
|---|---|---|
| `decryption failed: Bad session key` | 암호 오류 | 비밀번호 관리자에서 `BACKUP_PASSPHRASE` 재확인. 값이 없으면 그 백업은 복구 불가 |
| `'gpg' 용어가 인식되지 않습니다` | PATH 에 없음 | `& "C:\Program Files\Git\usr\bin\gpg.exe" ...` 전체 경로 호출 |
| `syntax error at or near "{"` | 클립보드 인코딩 | `Get-Content ... -Raw -Encoding UTF8 \| Set-Clipboard` 로 다시 복사 |
| `relation "public.xxx" does not exist` | 순서 오류 | `schema.sql` 을 먼저 실행 |
| `permission denied for table ...` | GRANT 누락 | `schema.sql` 이 끝까지 실행됐는지 확인. 중간에 끊겼으면 다시 실행 |
| 복원했는데 사이트가 빈 화면 | 환경변수 미교체 | §4-B 3~7단계 확인 (Vercel 환경변수·Redirect URL·재배포) |
| 로그인이 안 됨 | Redirect URL 누락 | Supabase → Authentication → URL Configuration 에 두 줄 등록 (한 줄에 하나씩) |
| 초대코드가 전부 무효 | `INVITE_CODE_PEPPER` 변경됨 | 기존 값으로 되돌린다. 잃어버렸으면 코드를 재발급하는 수밖에 없다 |
| 아티팩트가 없음 | 90일 경과 | 그 시점 백업은 없다. 가장 오래된 남은 아티팩트를 쓴다 |

---

## 8. 백업 자체에 대해

- 워크플로: `.github/workflows/db-backup.yml`
- 주기: 매주 **화요일 03:00 KST** (cron `0 18 * * 1` UTC)
- 수동 실행: Actions → DB Backup → **Run workflow**
- 보관: 아티팩트 90일
- 암호화: AES256 (gpg 대칭키)
- 필요한 GitHub Secrets: `SUPABASE_DB_URL`, `BACKUP_PASSPHRASE`

**백업은 복구를 해봐야 백업이다.** 스키마를 크게 바꾼 뒤에는 §4-A 로 한 번 복원해 보는 것을 권한다.
