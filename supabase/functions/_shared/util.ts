// 공용 유틸 — redeem-invite / admin-invites 에서 함께 사용
//
// ⚠️ 시크릿은 전부 환경변수로만 읽는다. 어떤 값도 코드에 하드코딩하지 않는다.
//    SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 는 Edge Function 런타임이 자동 주입한다.
//    INVITE_CODE_PEPPER 는 아래 명령으로 직접 등록해야 한다.
//
//      supabase secrets set INVITE_CODE_PEPPER="$(openssl rand -hex 32)"

export const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow =
    origin && (ALLOWED_ORIGINS.length === 0 || ALLOWED_ORIGINS.includes(origin))
      ? origin
      : (ALLOWED_ORIGINS[0] ?? '*');

  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

export function json(
  body: unknown,
  status: number,
  origin: string | null,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

/** SHA-256(code + pepper) → hex */
export async function hashCode(code: string): Promise<string> {
  const pepper = Deno.env.get('INVITE_CODE_PEPPER');
  if (!pepper) throw new Error('INVITE_CODE_PEPPER is not configured');

  const data = new TextEncoder().encode(`${code.trim().toUpperCase()}::${pepper}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** IP 는 원문 저장하지 않고 해시로만 기록한다 */
export async function hashIp(req: Request): Promise<string> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('cf-connecting-ip') ??
    'unknown';
  const pepper = Deno.env.get('INVITE_CODE_PEPPER') ?? '';
  const data = new TextEncoder().encode(`${ip}::${pepper}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 혼동하기 쉬운 문자(I, O, 0, 1) 를 뺀 알파벳 */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** NARSHA-XXXX-XXXX */
export function generateCode(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  return `NARSHA-${chars.slice(0, 4).join('')}-${chars.slice(4, 8).join('')}`;
}

export const RESERVED_HANDLES = new Set([
  'admin', 'administrator', 'api', 'app', 'apps', 'about', 'auth', 'desk',
  'help', 'join', 'login', 'logout', 'manage', 'me', 'new', 'narsha', 'null',
  'privacy', 'reviews', 'root', 'settings', 'signup', 'support', 'survey',
  'system', 'terms', 'undefined', 'user', 'users', 'write', 'www',
]);

export function validateHandle(handle: string): string | null {
  if (!/^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/.test(handle)) {
    return 'HANDLE_FORMAT';
  }
  if (RESERVED_HANDLES.has(handle)) return 'HANDLE_RESERVED';
  return null;
}
