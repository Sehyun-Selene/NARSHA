import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useT } from '../../app/i18n';

/**
 * 일반회원 모달의 공통 껍데기.
 *
 * 로그인·가입(`MemberAuthModal`)과 계정(`MemberAccountModal`)이 같은 껍데기를 쓴다 —
 * 모바일에서 아래에서 올라오는 시트, sm 이상에서 가운데 카드, 제목 + 닫기 버튼.
 * 두 모달이 나란히 열리므로 껍데기를 복사해 두면 디자인이 갈라진다.
 *
 * ⚠️ 반드시 body 로 portal 한다.
 * 헤더에 `backdrop-blur` 가 걸려 있는데, backdrop-filter 가 있는 요소는 position:fixed
 * 자손의 기준 박스가 된다. 헤더 안에서 그냥 렌더하면 모달이 높이 64px 짜리 헤더 박스에
 * 갇혀 위쪽이 잘린다.
 */
export default function AuthModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useT();

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-[400px] bg-[#ffffff] dark:bg-[#151c27] sm:rounded-[20px] rounded-t-[20px] shadow-2xl flex flex-col max-h-[92dvh]">
        <div className="flex items-start justify-between px-5 pt-5 pb-1">
          <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] text-[#1e293b] dark:text-[#dce3f3]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('my.cancel')}
            className="p-1 text-[#94a3b8] hover:text-[#64748b]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
