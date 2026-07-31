import type { Lang } from '../../../app/lib/useLang';

// 서버(redeem-invite / Supabase Auth) 에러 코드 → 한·영 메시지.
const MESSAGES: Record<string, { ko: string; en: string }> = {
  CODE_REQUIRED:  { ko: '초대코드를 입력해 주세요.', en: 'Please enter your invite code.' },
  CODE_INVALID:   { ko: '유효하지 않은 초대코드입니다. 코드를 다시 확인해 주세요.', en: 'This invite code is not valid. Please check it again.' },
  CODE_EXPIRED:   { ko: '만료된 초대코드입니다. 나르샤 팀에 재발급을 요청해 주세요.', en: 'This invite code has expired. Please ask the NARSHA team to reissue it.' },
  CODE_ALREADY_USED: { ko: '이미 사용된 초대코드입니다.', en: 'This invite code has already been used.' },
  RATE_LIMITED:   { ko: '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.', en: 'Too many attempts. Please try again in a little while.' },
  EMAIL_INVALID:  { ko: '올바른 이메일 주소를 입력해 주세요.', en: 'Please enter a valid email address.' },
  EMAIL_ALREADY_REGISTERED: { ko: '이미 가입된 이메일입니다. 로그인해 주세요.', en: 'This email is already registered. Please log in instead.' },
  PASSWORD_TOO_SHORT: { ko: '비밀번호는 8자 이상이어야 합니다.', en: 'Password must be at least 8 characters.' },
  DISPLAY_NAME_REQUIRED: { ko: '표시 이름을 입력해 주세요.', en: 'Please enter a display name.' },
  HANDLE_FORMAT:  { ko: '주소는 소문자 영문·숫자·하이픈 3~20자, 처음과 끝은 영문/숫자여야 합니다.', en: 'Handle must be 3–20 chars: lowercase letters, numbers, hyphens; start and end alphanumeric.' },
  HANDLE_RESERVED: { ko: '사용할 수 없는 주소입니다. 다른 주소를 골라 주세요.', en: 'This handle is reserved. Please choose another.' },
  HANDLE_TAKEN:   { ko: '이미 사용 중인 주소입니다.', en: 'This handle is already taken.' },
  SIGNUP_FAILED:  { ko: '가입에 실패했습니다. 잠시 후 다시 시도해 주세요.', en: 'Sign-up failed. Please try again shortly.' },
  PROFILE_CREATE_FAILED: { ko: '프로필 생성에 실패했습니다. 나르샤 팀에 문의해 주세요.', en: 'Failed to create profile. Please contact the NARSHA team.' },
  CONSENT_REQUIRED: { ko: '약관 동의 정보가 전달되지 않았습니다. 다시 시도해 주세요.', en: 'Consent information was not received. Please try again.' },
  CONSENT_RECORD_FAILED: { ko: '동의 기록에 실패했습니다. 잠시 후 다시 시도해 주세요.', en: 'Failed to record consent. Please try again shortly.' },
  SERVER_MISCONFIGURED: { ko: '서버 설정 오류입니다. 나르샤 팀에 문의해 주세요.', en: 'Server misconfiguration. Please contact the NARSHA team.' },
  INVALID_LOGIN:  { ko: '이메일 또는 비밀번호가 올바르지 않습니다.', en: 'Incorrect email or password.' },
  NETWORK:        { ko: '네트워크 오류입니다. 연결을 확인하고 다시 시도해 주세요.', en: 'Network error. Please check your connection and try again.' },
};

export function deskErrorMessage(code: string, lang: Lang): string {
  return MESSAGES[code]?.[lang] ?? MESSAGES.SIGNUP_FAILED[lang];
}
