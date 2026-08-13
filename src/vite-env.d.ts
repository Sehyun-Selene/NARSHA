/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  // 경로를 숨기는 용도일 뿐 보안 수단이 아니다 — 빌드 결과물에 인라인된다.
  readonly VITE_ADMIN_PATH: string | undefined;
  // VITE_ADMIN_PASSWORD 는 제거됐다 (REQ-H). 운영자 판정은 Supabase Auth 세션 +
  // profiles.role 로 하며, 비밀번호를 클라이언트 번들에 넣지 않는다.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
