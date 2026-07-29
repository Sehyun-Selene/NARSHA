import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import { supabase } from '../../../lib/supabase';
import { validateInvite, redeemInvite } from '../../../features/desk/api/invites';
import {
  validateHandleClient,
  isHandleAvailable,
  slugifyHandle,
  suggestHandles,
} from '../../../features/desk/auth/handle';
import { deskErrorMessage } from '../../../features/desk/auth/deskErrors';
import { DESK_TITLE } from '../../../features/desk/components/introCopy';
import type { DeskParticipantType } from '../../../features/desk/types';

const inputClass =
  "w-full rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#0c141f] px-4 py-3 text-[15px] text-[#1e293b] dark:text-[#dce3f3] outline-none focus:border-[#8ecdff] transition-colors";
const labelClass = "block text-[13px] font-medium text-[#64748b] dark:text-[#bec7d2] mb-1.5";

const T = {
  ko: {
    title: '초대코드로 시작하기',
    step: (n: number) => `${n} / 4 단계`,
    codeLabel: '초대코드',
    codePlaceholder: 'NARSHA-XXXX-XXXX',
    codeHint: '나르샤 팀이 개별 연락으로 전달한 코드를 입력해 주세요.',
    next: '다음',
    back: '이전',
    checking: '확인 중…',
    accountTitle: '계정 정보',
    email: '이메일',
    password: '비밀번호 (8자 이상)',
    profileTitle: '프로필',
    displayName: '표시 이름',
    displayNameEn: '표시 이름 (영문, 선택)',
    handle: '책상 주소 (handle)',
    handleHint: '개인 책상 주소가 됩니다: /desk/@',
    country: '국가',
    city: '도시 (선택)',
    bio: '한 줄 소개 (선택)',
    channel: '채널 링크 (선택)',
    handleAvail: '사용 가능한 주소입니다',
    handleTaken: '이미 사용 중입니다. 이런 주소는 어때요?',
    consentTitle: '약관 동의',
    submit: '가입 완료',
    submitting: '가입 중…',
    idn: '인도네시아',
    phl: '필리핀',
  },
  en: {
    title: 'Start with an invite code',
    step: (n: number) => `Step ${n} of 4`,
    codeLabel: 'Invite code',
    codePlaceholder: 'NARSHA-XXXX-XXXX',
    codeHint: 'Enter the code the NARSHA team sent you personally.',
    next: 'Next',
    back: 'Back',
    checking: 'Checking…',
    accountTitle: 'Account',
    email: 'Email',
    password: 'Password (8+ characters)',
    profileTitle: 'Profile',
    displayName: 'Display name',
    displayNameEn: 'Display name (English, optional)',
    handle: 'Desk address (handle)',
    handleHint: 'Your desk address will be: /desk/@',
    country: 'Country',
    city: 'City (optional)',
    bio: 'One-line bio (optional)',
    channel: 'Channel link (optional)',
    handleAvail: 'This address is available',
    handleTaken: 'Already taken. How about one of these?',
    consentTitle: 'Agreements',
    submit: 'Complete sign-up',
    submitting: 'Signing up…',
    idn: 'Indonesia',
    phl: 'Philippines',
  },
} as const;

const CONSENTS = {
  ko: [
    { key: 'terms', node: true },
    { key: 'copyright', text: '내가 쓴 글의 저작권은 나에게 있으며, 나르샤 팀이 이 사업의 홍보·백서·영상 제작을 위해 내 글을 사용하는 것에 동의합니다.' },
    { key: 'media', text: '내가 올리는 사진과 영상은 직접 촬영했거나 사용 허락을 받은 것이며, 다른 사람이 나오는 경우 그 사람의 동의를 받았습니다.' },
  ],
  en: [
    { key: 'terms', node: true },
    { key: 'copyright', text: "I keep the copyright to what I write. I allow the NARSHA team to use my posts for this project's promotion, white paper, and video production." },
    { key: 'media', text: 'The photos and videos I upload are my own or properly licensed. If other people appear in them, I have their permission.' },
  ],
} as const;

type HandleStatus = 'idle' | 'checking' | 'ok' | 'format' | 'reserved' | 'taken';

export default function DeskJoin() {
  const [lang] = useLang();
  const t = T[lang];
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);

  // step 1
  const [code, setCode] = useState('');
  const [, setParticipantType] = useState<DeskParticipantType>('co_creator');
  const [isPartner, setIsPartner] = useState(false);

  // step 2
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // step 3
  const [displayName, setDisplayName] = useState('');
  const [displayNameEn, setDisplayNameEn] = useState('');
  const [handle, setHandle] = useState('');
  const [handleTouched, setHandleTouched] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>('idle');
  const [country, setCountry] = useState<'ID' | 'PH' | ''>('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [channelUrl, setChannelUrl] = useState('');

  // step 4
  const [consents, setConsents] = useState<Record<string, boolean>>({ terms: false, copyright: false, media: false });

  // ?code= 자동 채움
  useEffect(() => {
    const c = params.get('code');
    if (c) setCode(c.trim().toUpperCase());
  }, [params]);

  // handle 기본 제안 (표시 이름 입력 시, 아직 안 건드렸으면)
  useEffect(() => {
    if (!handleTouched) {
      const base = slugifyHandle(displayNameEn || displayName);
      if (base) setHandle(base);
    }
  }, [displayName, displayNameEn, handleTouched]);

  // handle 실시간 검증
  useEffect(() => {
    if (!handle) {
      setHandleStatus('idle');
      return;
    }
    const fmt = validateHandleClient(handle);
    if (fmt === 'HANDLE_FORMAT') { setHandleStatus('format'); return; }
    if (fmt === 'HANDLE_RESERVED') { setHandleStatus('reserved'); return; }
    setHandleStatus('checking');
    let active = true;
    const id = setTimeout(async () => {
      const avail = await isHandleAvailable(handle);
      if (active) setHandleStatus(avail ? 'ok' : 'taken');
    }, 400);
    return () => {
      active = false;
      clearTimeout(id);
    };
  }, [handle]);

  const suggestions = useMemo(
    () => (handleStatus === 'taken' ? suggestHandles(displayNameEn || displayName || handle) : []),
    [handleStatus, displayName, displayNameEn, handle],
  );

  const submitCode = async () => {
    if (busy || !code.trim()) return;
    setBusy(true);
    const res = await validateInvite(code.trim());
    setBusy(false);
    if (!res.ok) {
      toast.error(deskErrorMessage(res.error, lang));
      return;
    }
    setParticipantType(res.participantType);
    setIsPartner(res.participantType === 'creator_partner');
    setStep(2);
  };

  const step2Valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length >= 8;
  const step3Valid = displayName.trim() && handleStatus === 'ok' && country;
  const allConsented = consents.terms && consents.copyright && consents.media;

  const submitJoin = async () => {
    if (busy || !allConsented) return;
    setBusy(true);
    const res = await redeemInvite({
      code: code.trim(),
      email: email.trim(),
      password,
      display_name: displayName.trim(),
      display_name_en: displayNameEn.trim() || undefined,
      handle: handle.trim(),
      country: country || undefined,
      city: city.trim() || undefined,
      bio: bio.trim() || undefined,
      channel_url: isPartner ? channelUrl.trim() || undefined : undefined,
    });
    if (!res.ok) {
      setBusy(false);
      toast.error(deskErrorMessage(res.error, lang));
      // 코드/핸들 문제면 해당 단계로 되돌린다
      if (res.error === 'HANDLE_TAKEN') { setStep(3); setHandleStatus('taken'); }
      if (res.error.startsWith('CODE_')) setStep(1);
      return;
    }
    // 성공 → 로그인
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      toast.success(lang === 'ko' ? '가입 완료! 로그인해 주세요.' : 'Sign-up complete! Please log in.');
      navigate('/desk/login', { replace: true });
      return;
    }
    toast.success(lang === 'ko' ? '환영합니다! 첫 글을 써보세요.' : 'Welcome! Write your first post.');
    navigate('/desk/write', { replace: true });
  };

  return (
    <DeskShell width="narrow">
      <div className="max-w-[460px] mx-auto py-8">
        <p className="font-['Manrope:Bold',sans-serif] font-bold text-[13px] tracking-[0.08em] uppercase text-[#8ecdff] mb-1">
          {DESK_TITLE[lang]}
        </p>
        <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em] mb-1">
          {t.title}
        </h1>
        <p className="text-[13px] text-[#94a3b8] mb-6">{t.step(step)}</p>

        <div className="rounded-[16px] border border-[#e2e8f0] dark:border-[#232a36] bg-white dark:bg-[#151c27] p-6">
          {/* STEP 1 — 코드 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>{t.codeLabel}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder={t.codePlaceholder}
                  className={`${inputClass} font-mono tracking-wider`}
                  autoFocus
                />
                <p className="text-[12px] text-[#94a3b8] mt-2">{t.codeHint}</p>
              </div>
              <PrimaryButton onClick={submitCode} disabled={busy || !code.trim()}>
                {busy ? t.checking : t.next}
              </PrimaryButton>
            </div>
          )}

          {/* STEP 2 — 계정 */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t.accountTitle}</h2>
              <div>
                <label className={labelClass}>{t.email}</label>
                <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.password}</label>
                <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              <StepNav onBack={() => setStep(1)} onNext={() => setStep(3)} nextDisabled={!step2Valid} t={t} />
            </div>
          )}

          {/* STEP 3 — 프로필 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t.profileTitle}</h2>
              <div>
                <label className={labelClass}>{t.displayName}</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.displayNameEn}</label>
                <input value={displayNameEn} onChange={(e) => setDisplayNameEn(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.handle}</label>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] text-[#94a3b8]">/desk/@</span>
                  <input
                    value={handle}
                    onChange={(e) => { setHandleTouched(true); setHandle(e.target.value.toLowerCase()); }}
                    className={`${inputClass} flex-1`}
                  />
                </div>
                <div className="mt-1.5 text-[12px] min-h-[18px]">
                  {handleStatus === 'checking' && <span className="text-[#94a3b8]">{t.checking}</span>}
                  {handleStatus === 'ok' && <span className="text-[#16a34a]">✓ {t.handleAvail}</span>}
                  {handleStatus === 'format' && <span className="text-[#dc2626]">{deskErrorMessage('HANDLE_FORMAT', lang)}</span>}
                  {handleStatus === 'reserved' && <span className="text-[#dc2626]">{deskErrorMessage('HANDLE_RESERVED', lang)}</span>}
                  {handleStatus === 'taken' && (
                    <div className="text-[#dc2626]">
                      {t.handleTaken}
                      <div className="flex gap-2 mt-1.5">
                        {suggestions.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => { setHandleTouched(true); setHandle(s); }}
                            className="px-2.5 py-1 rounded-full bg-[#f1f5f9] dark:bg-[#232a36] text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#e2e8f0] dark:hover:bg-[#2e3541]"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.country}</label>
                <div className="flex gap-2">
                  {(['ID', 'PH'] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCountry(c)}
                      className={[
                        'px-4 py-2 rounded-full text-[14px] transition-colors',
                        country === c ? 'bg-[#0ea5e9] dark:bg-[#1b5a7a] text-white' : 'bg-[#f1f5f9] dark:bg-[#232a36] text-[#64748b] dark:text-[#bec7d2]',
                      ].join(' ')}
                    >
                      {c === 'ID' ? t.idn : t.phl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.city}</label>
                <input value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.bio}</label>
                <input value={bio} onChange={(e) => setBio(e.target.value)} className={inputClass} />
              </div>
              {isPartner && (
                <div>
                  <label className={labelClass}>{t.channel}</label>
                  <input value={channelUrl} onChange={(e) => setChannelUrl(e.target.value)} placeholder="https://" className={inputClass} />
                </div>
              )}
              <StepNav onBack={() => setStep(2)} onNext={() => setStep(4)} nextDisabled={!step3Valid} t={t} />
            </div>
          )}

          {/* STEP 4 — 동의 */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-bold text-[16px] text-[#1e293b] dark:text-[#dce3f3]">{t.consentTitle}</h2>
              <div className="space-y-3">
                {CONSENTS[lang].map((c) => (
                  <label key={c.key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consents[c.key]}
                      onChange={(e) => setConsents((p) => ({ ...p, [c.key]: e.target.checked }))}
                      className="mt-1 w-4 h-4 accent-[#0ea5e9] shrink-0"
                    />
                    <span className="text-[13px] leading-[1.6] text-[#1e293b] dark:text-[#dce3f3]">
                      {'node' in c ? (
                        lang === 'ko' ? (
                          <>
                            <Link to="/terms" target="_blank" className="text-[#8ecdff] underline">이용약관</Link> 및{' '}
                            <Link to="/privacy" target="_blank" className="text-[#8ecdff] underline">개인정보처리방침</Link>에 동의합니다.
                          </>
                        ) : (
                          <>
                            I agree to the <Link to="/terms" target="_blank" className="text-[#8ecdff] underline">Terms of Service</Link> and{' '}
                            <Link to="/privacy" target="_blank" className="text-[#8ecdff] underline">Privacy Policy</Link>.
                          </>
                        )
                      ) : (
                        c.text
                      )}
                    </span>
                  </label>
                ))}
              </div>
              <StepNav
                onBack={() => setStep(3)}
                onNext={submitJoin}
                nextLabel={busy ? t.submitting : t.submit}
                nextDisabled={busy || !allConsented}
                t={t}
              />
            </div>
          )}
        </div>

        <p className="text-center text-[13px] text-[#94a3b8] mt-4">
          <Link to="/desk/login" className="text-[#8ecdff] hover:underline">
            {lang === 'ko' ? '이미 계정이 있으신가요? 로그인' : 'Already have an account? Log in'}
          </Link>
        </p>
      </div>
    </DeskShell>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] py-3 rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-60"
    >
      {children}
    </button>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
  nextLabel,
  t,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  t: (typeof T)['ko'] | (typeof T)['en'];
}) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onBack}
        className="px-5 py-3 rounded-[10px] border border-[#e2e8f0] dark:border-[#232a36] text-[14px] text-[#64748b] dark:text-[#bec7d2] hover:bg-[#f8fafc] dark:hover:bg-[#1e293b]"
      >
        {t.back}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[15px] py-3 rounded-[10px] hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {nextLabel ?? t.next}
      </button>
    </div>
  );
}
