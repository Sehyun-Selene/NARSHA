# 월간 점검 요청서

에이전트에게 **"MONTHLY_CHECK.md 읽고 실행해줘"** 라고 하면 이 문서대로 진행한다.

Supabase 무료 플랜에는 사용량 알림 기능이 없다. 한도를 넘기면 예고 없이 기능이 멈추므로
사람이 주기적으로 확인해야 한다. 이 문서는 그중 **에이전트가 대신 할 수 있는 부분**을 모아둔 것이다.

주기: 매달 1회. 마지막 실행 결과는 §7 에 기록한다.

---

## 에이전트가 할 일

아래 1~6 을 순서대로 수행하고, 마지막에 §6 형식으로 보고한다.
각 항목은 독립적이다 — 하나가 실패해도 나머지를 계속 진행하고, 실패한 항목을 보고에 남긴다.

### 1. 사이트가 살아 있는지

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://narsha.vercel.app/
```

`200` 이 아니면 즉시 보고하고 원인 조사(§4 참고).

### 2. 서버 함수 3종

프로덕션 API 가 살아 있는지 확인한다. **데이터를 만들지 않는 호출만 쓴다.**

```bash
curl -s -X POST https://narsha.vercel.app/api/review-helpful -H "Content-Type: application/json" -d '{"action":"mine","reviewIds":[]}'
curl -s -X POST https://narsha.vercel.app/api/review-report  -H "Content-Type: application/json" -d '{}'
curl -s -X POST https://narsha.vercel.app/api/review-submit  -H "Content-Type: application/json" -d '{}'
```

기대 응답
- review-helpful → `{"ok":true,"marked":[]}`
- review-report → `{"ok":false,"error":"REVIEW_ID_REQUIRED"}`
- review-submit → `{"ok":false,"error":"APP_ID_REQUIRED"}`

`SERVER_NOT_CONFIGURED` 가 나오면 Vercel 환경변수가 빠진 것이다
(`REVIEW_IP_SALT`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_SUPABASE_URL`).

### 3. DB 응답과 권한

`.env.local` 의 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 를 읽어서 확인한다.

- 공개 조회가 되는지 — `apps`, `reviews` 가 `200` 인지
- 비공개 표가 여전히 막혀 있는지 — 아래는 **전부 `42501` 이어야 정상**이다.
  막혀 있지 않으면 즉시 보고할 것 (개인정보·조작 위험)

```
review_reports · reviews_rate_limit · members · bug_reports
tag_boost_suggestions · tag_accuracy_checks · app_tag_support · app_curated_tags · app_review_totals
```

- 익명 직접 쓰기가 막혀 있는지 — `reviews` 에 POST 시 `42501` 이어야 한다

### 4. 백업 워크플로

```bash
curl -s "https://api.github.com/repos/Sehyun-Selene/NARSHA/actions/workflows"
curl -s "https://api.github.com/repos/Sehyun-Selene/NARSHA/actions/runs?per_page=5"
```

확인할 것
- `DB Backup` 워크플로가 `state: active` 인지
- **최근 5주 안에 성공한 실행이 있는지.** 없으면 원인을 찾고, 필요하면 수동 실행을 안내한다
- 아티팩트가 남아 있는지 (`/actions/artifacts`). 보관 기간은 90일이다

⚠️ GitHub 는 **60일간 저장소 활동이 없으면 스케줄 워크플로를 자동으로 정지**시킨다.
정지됐으면 사용자에게 알리고 Actions 탭에서 다시 활성화하도록 안내할 것.

### 5. 데이터 위생

- 시연용 잔재가 남아 있지 않은지: `reviews` 에 `nickname like 'demo-%'` 가 0건인지
- 테스트 흔적: `description like 'ZZ-TEST%'` 같은 제보가 남아 있지 않은지
  (`bug_reports` 는 운영자만 조회 가능하므로, 확인이 필요하면 사용자에게 SQL 을 준다)
- 숨김 처리된 후기 수를 보고한다 (`is_hidden = true` 는 익명 조회에서 빠지므로,
  전체 수와 공개 수의 차이로 추정하거나 사용자에게 SQL 을 준다)

### 6. 보고 형식

이렇게 표로 보고한다. 통과한 것도 빠짐없이 적는다.

| 항목 | 상태 | 비고 |
|---|---|---|
| 사이트 | ✅ 200 | |
| review-helpful | ✅ | |
| review-report | ✅ | |
| review-submit | ✅ | |
| 공개 조회 (apps/reviews) | ✅ | 앱 33건 · 후기 N건 |
| 비공개 표 차단 | ✅ 9/9 | |
| 익명 직접 쓰기 차단 | ✅ | |
| 백업 워크플로 | ✅ active | 최근 성공 YYYY-MM-DD |
| 백업 아티팩트 | ✅ N개 | 최신 YYYY-MM-DD |
| 데이터 위생 | ✅ | demo 0건 |

문제가 있으면 **그 항목만** 원인과 조치안을 덧붙인다. 통과 항목에 설명을 늘리지 말 것.

---

## 사용자가 직접 해야 하는 일

에이전트는 Supabase 대시보드에 접근할 수 없다. 아래는 사람이 눈으로 본다.

### Supabase 사용량 (무료 플랜 한도)

```
https://supabase.com/dashboard/project/jjvwovsmmfbxmiziurqd/settings/billing
```

또는 좌측 하단 **Project Settings → Usage**

| 항목 | 무료 한도 | 넘으면 |
|---|---|---|
| Database 용량 | 500 MB | 쓰기가 막힌다 |
| Storage | 1 GB | 이미지·파일 업로드 실패 (desk 저자 작업이 멈춘다) |
| 대역폭 | 5 GB / 월 | 조회가 느려지거나 막힌다 |
| 월간 활성 사용자(MAU) | 50,000 | 로그인 제한 |

**절반(50%)을 넘긴 항목이 있으면 알려줄 것.** 그 시점부터 Pro 전환을 검토해야 한다.
Storage 가 먼저 찰 가능성이 높다 — desk 저자당 80MB 상한이라 저자가 늘면 빠르게 오른다.

### 확인해서 알려주면 에이전트가 이어서 하는 것

- 사용량 수치 → 증가 추세와 남은 여유 기간을 계산해 보고
- 백업 워크플로가 정지됐다면 → 재활성화 절차 안내
- 한도 임박 항목이 있다면 → 정리 대상(오래된 미디어·revision 등) 정리안 제시

---

## 기록

실행할 때마다 이 표에 한 줄 추가한다. (에이전트가 직접 추가할 것)

| 실행일 | 결과 | 특이사항 |
|---|---|---|
| 2026-08-18 | 최초 작성 | 항목 확정, 실행 전 |
