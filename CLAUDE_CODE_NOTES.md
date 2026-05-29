## 익명 사용자 식별 (MVP)
NARSHA는 로그인 시스템 없이 운영. 사용자 식별은 모두 localStorage 기반:
- 학습 유형 검사 결과: localStorage에 저장
- 리뷰 작성자 정보: localStorage에 익명 ID 생성 후 저장 (재방문 시 동일 ID)
- 서비스 제안 중복 방지: localStorage 타임스탬프
- 말풍선 첫 방문 표시: localStorage 플래그

운영자 페이지 접근 (MVP):
- 비밀 URL + 비밀번호 게이트 이중 잠금 방식
- VITE_ADMIN_PATH 환경변수: 길고 랜덤한 경로 (예: n-internal-mgmt-9f3k2x7m)
- VITE_ADMIN_PASSWORD 환경변수: 비밀번호 (예: narsha-admin-1234)
- 정확한 비밀 경로 접속 → 비밀번호 입력 → 세션 동안 localStorage로 유지
- 환경변수는 .env.local에 저장 (git ignore)
- 추후 Supabase Auth로 정식 로그인 시스템 도입 예정

한계 (사용자 인지):
- 다른 브라우저/기기에서는 별도 사용자로 인식됨
- 브라우저 데이터 삭제 시 정보 사라짐

로그인 시스템은 데이터 운영 부담이 커질 때 별도 작업으로 도입.
