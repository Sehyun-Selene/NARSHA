import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useT } from '../../app/i18n';
import { useMemberAuth } from './useMemberAuth';
import AuthModalShell from './AuthModalShell';

/**
 * 로그인된 계정 정보 + 로그아웃.
 *
 * 모바일 드로어 하단의 프로필 아이콘에서 열린다 — 로그아웃을 메뉴 목록에 두면 탐색
 * 항목과 섞여 실수로 눌리기 쉽다. 계정 확인과 로그아웃을 한 화면에 모은다.
 *
 * 껍데기는 로그인·가입 모달과 공유한다 (`AuthModalShell`).
 */
export default function MemberAccountModal({
  open,
  onClose,
  onSignedOut,
}: {
  open: boolean;
  onClose: () => void;
  /** 로그아웃이 끝난 뒤에만 불린다 — 취소로 닫을 때는 불리지 않는다 */
  onSignedOut?: () => void;
}) {
  const { t } = useT();
  const { session, member, signOut } = useMemberAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleSignOut = async () => {
    setBusy(true);
    try {
      await signOut();
      onClose();
      onSignedOut?.();
      // 로그아웃 후 보던 화면에 그대로 남으면, 로그인해야 보이는 화면이었을 때
      // 빈 페이지나 로그인 안내만 남는다. 홈으로 보낸다 (데스크톱 헤더와 같은 처리).
      navigate('/');
    } finally {
      setBusy(false);
    }
  };

  // desk 저자로 로그인한 경우에는 members 행이 없어 표시명이 비어 있다 (결정 D6).
  // 그때는 이메일만 보여 준다.
  const displayName = member?.display_name ?? '';
  const email = session?.user.email ?? '';

  return (
    <AuthModalShell title={t('member.accountTitle')} onClose={onClose}>
      <div className="px-5 pb-5 pt-3 overflow-y-auto">
        <div className="rounded-[12px] border border-[#e2e8f0] dark:border-[#232a36] bg-[#f8fafc] dark:bg-[#0c141f] px-4 py-3.5">
          {displayName && (
            <>
              <p className="text-[11px] font-bold tracking-[0.04em] text-[#94a3b8]">{t('member.displayName')}</p>
              <p className="mt-0.5 font-['Manrope:Bold',sans-serif] font-bold text-[15px] text-[#1e293b] dark:text-[#dce3f3] break-all">
                {displayName}
              </p>
            </>
          )}
          <p className={`text-[11px] font-bold tracking-[0.04em] text-[#94a3b8] ${displayName ? 'mt-3' : ''}`}>
            {t('member.email')}
          </p>
          <p className="mt-0.5 text-[14px] text-[#1e293b] dark:text-[#dce3f3] break-all">{email}</p>
        </div>

        <button
          type="button"
          onClick={() => void handleSignOut()}
          disabled={busy}
          className="mt-4 w-full h-11 rounded-[10px] bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-extrabold text-[14px] disabled:opacity-50"
        >
          {t('member.logout')}
        </button>
      </div>
    </AuthModalShell>
  );
}
