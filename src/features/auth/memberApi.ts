import { supabase } from '../../lib/supabase';

/**
 * 일반회원 인증·내 후기 API (GNB PRD REQ-C).
 *
 * desk 의 `features/desk/api/*` 와 같은 규칙을 따른다 — 네트워크 호출은 컴포넌트에
 * 두지 않고, 실패는 삼키지 않고 코드값을 던진다. 화면이 `memberAuthMessage()` 로
 * 문구를 얻는다.
 */

export type MemberAuthError =
  | 'EMAIL_INVALID'
  | 'PASSWORD_TOO_SHORT'
  | 'DISPLAY_NAME_REQUIRED'
  | 'DISPLAY_NAME_TAKEN'
  | 'EMAIL_ALREADY_REGISTERED'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_NOT_CONFIRMED'
  | 'CONSENT_REQUIRED'
  | 'SIGNUP_FAILED'
  | 'SIGNIN_FAILED'
  | 'OAUTH_FAILED'
  | 'UNKNOWN';

const PASSWORD_MIN = 8;
const DISPLAY_NAME_MAX = 40;

/** 유일 제약 위반 (Postgres) */
const UNIQUE_VIOLATION = '23505';

/**
 * 표시명을 쓸 수 있는지 확인한다.
 *
 * `members` 는 자기 행만 읽히므로(members_select_own) 클라이언트가 직접 셀 수 없다.
 * 서버 함수가 불린 하나만 돌려준다 — 남의 이름은 못 읽는다.
 * 조회에 실패하면 `true` 로 둔다. 최종 판정은 DB 의 유일 인덱스가 하므로 통과시켜도
 * 중복이 만들어지지 않고, 네트워크 오류로 가입을 막는 편이 더 나쁘다.
 */
export async function isDisplayNameAvailable(name: string): Promise<boolean> {
  const candidate = name.trim();
  if (!candidate) return false;
  const { data, error } = await supabase.rpc('display_name_available', { candidate });
  if (error) return true;
  return data !== false;
}

/**
 * 회원 가입 — 이메일·비밀번호. 표시명은 `members` 행에 저장한다.
 *
 * 반환값 `needsEmailConfirm` — Supabase 의 "Confirm email" 설정에 따라 달라진다.
 * 확인이 필요하면 세션이 없는 상태로 끝나므로 그때만 안내를 띄워야 한다.
 * 설정을 끈 뒤에도 "메일을 확인하세요" 가 뜨면 오지 않는 메일을 기다리게 된다.
 */
export async function memberSignUp(input: {
  email: string;
  password: string;
  displayName: string;
  agreed: boolean;
}): Promise<{ needsEmailConfirm: boolean }> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();

  if (!email.includes('@')) throw new Error('EMAIL_INVALID' satisfies MemberAuthError);
  if (input.password.length < PASSWORD_MIN) throw new Error('PASSWORD_TOO_SHORT' satisfies MemberAuthError);
  if (!displayName) throw new Error('DISPLAY_NAME_REQUIRED' satisfies MemberAuthError);
  // 약관·개인정보 동의 없이 계정을 만들면 근거가 남지 않는다
  if (!input.agreed) throw new Error('CONSENT_REQUIRED' satisfies MemberAuthError);
  // 계정을 만들기 전에 막는다. 확인 메일 흐름에서는 members 행이 첫 로그인 때
  // 생기므로, 여기서 걸러 두지 않으면 한참 뒤에야 중복을 알게 된다.
  if (!(await isDisplayNameAvailable(displayName))) {
    throw new Error('DISPLAY_NAME_TAKEN' satisfies MemberAuthError);
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    // 표시명을 user_metadata 에도 남긴다 — 이메일 확인 대기 중이면 members 행을
    // 아직 만들 수 없고, 확인 후 첫 로그인 때 Provider 가 이 값으로 행을 만든다.
    options: { data: { full_name: displayName.slice(0, DISPLAY_NAME_MAX) } },
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('already') || msg.includes('registered')) {
      throw new Error('EMAIL_ALREADY_REGISTERED' satisfies MemberAuthError);
    }
    throw new Error('SIGNUP_FAILED' satisfies MemberAuthError);
  }

  // 이메일 확인이 켜져 있으면 세션이 없다. 그 경우 members 행은 첫 로그인 때 만든다.
  const userId = data.user?.id;
  if (!userId || !data.session) return { needsEmailConfirm: true };

  const { error: memberError } = await supabase
    .from('members')
    .insert({ id: userId, display_name: displayName.slice(0, DISPLAY_NAME_MAX) });

  // 행 생성이 실패해도 계정은 살아 있다. Provider 가 다음 로드에서 다시 만든다.
  if (memberError) {
    console.error('member row insert failed', memberError.message);
    // 사전 확인 사이에 남이 먼저 차지한 경우 — 사용자에게 알려야 한다
    if (memberError.code === UNIQUE_VIOLATION) {
      throw new Error('DISPLAY_NAME_TAKEN' satisfies MemberAuthError);
    }
  }

  return { needsEmailConfirm: false };
}

export async function memberSignIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (!error) return;

  const msg = error.message.toLowerCase();
  if (msg.includes('confirm')) throw new Error('EMAIL_NOT_CONFIRMED' satisfies MemberAuthError);
  if (msg.includes('invalid')) throw new Error('INVALID_CREDENTIALS' satisfies MemberAuthError);
  throw new Error('SIGNIN_FAILED' satisfies MemberAuthError);
}

/**
 * Google 로그인. client secret 은 Supabase 대시보드에만 있고 코드에는 없다.
 * `redirectTo` 로 원래 보던 화면으로 돌아온다 — 로그인 때문에 흐름이 끊기면
 * 게이팅이 가입 유도가 아니라 이탈 유도가 된다.
 */
export async function memberSignInWithGoogle(redirectPath?: string): Promise<void> {
  const target = redirectPath ?? window.location.pathname + window.location.search;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${target}` },
  });
  if (error) throw new Error('OAUTH_FAILED' satisfies MemberAuthError);
}

/** 비밀번호 재설정 메일. desk 쪽과 동일한 수단을 쓴다. */
export async function memberResetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    // 홈으로 보내면 새 비밀번호를 정할 화면이 없다 (실제로 흐름이 끊겨 있었다)
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw new Error('UNKNOWN' satisfies MemberAuthError);
}

/** 표시명 변경. */
export async function updateMemberName(userId: string, displayName: string): Promise<void> {
  const name = displayName.trim();
  if (!name) throw new Error('DISPLAY_NAME_REQUIRED' satisfies MemberAuthError);
  const { error } = await supabase
    .from('members')
    .update({ display_name: name.slice(0, DISPLAY_NAME_MAX) })
    .eq('id', userId);
  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      throw new Error('DISPLAY_NAME_TAKEN' satisfies MemberAuthError);
    }
    throw error;
  }
}
