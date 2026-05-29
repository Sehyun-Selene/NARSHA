/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_ADMIN_PATH: string | undefined;
  readonly VITE_ADMIN_PASSWORD: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
