import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useDeskAuth } from './useDeskAuth';
import DeskShell from '../../../app/pages/desk/_DeskShell';

/**
 * 저자 전용 라우트 가드.
 *  - loading 중: 스켈레톤
 *  - 미로그인: /desk/login?next=<현재경로> 로 리다이렉트
 *  - is_active === false: 작성 정지 안내 화면 (기존 발행 글은 유지)
 */
export default function RequireAuthor({ children }: { children: ReactNode }) {
  const { loading, session, profile } = useDeskAuth();
  const location = useLocation();

  if (loading) {
    return (
      <DeskShell>
        <div className="py-24 flex justify-center" aria-busy="true" aria-label="불러오는 중">
          <div className="h-8 w-8 rounded-full border-2 border-[#8ecdff] border-t-transparent animate-spin" />
        </div>
      </DeskShell>
    );
  }

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/desk/login?next=${next}`} replace />;
  }

  // 세션은 있는데 profiles 행이 없는 계정 = 일반회원이다 (REQ-C / C-3).
  // auth.users 를 desk 저자와 공유하므로, 로그인만으로 통과시키면 일반회원이
  // 글쓰기 화면까지 들어온다. 저자 여부는 profiles 행 존재로 판별한다.
  if (!profile) {
    return (
      <DeskShell width="narrow">
        <div className="py-20 text-center">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
            초대받은 저자만 글을 쓸 수 있어요 · Invited authors only
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2]">
            「나의 한국어 책상」은 초대코드로 참여하는 공간입니다. 글은 누구나 읽을 수 있어요.
            <br />
            Korean Desks of the World is invite-only for writing. Anyone can read the posts.
          </p>
        </div>
      </DeskShell>
    );
  }

  if (profile.is_active === false) {
    return (
      <DeskShell width="narrow">
        <div className="py-20 text-center">
          <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[24px] text-[#1e293b] dark:text-[#dce3f3] mb-3">
            작성이 정지된 계정입니다 · Writing is paused
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[15px] leading-[1.7] text-[#64748b] dark:text-[#bec7d2]">
            이미 발행한 글은 그대로 유지됩니다. 문의는 나르샤 팀에 연락해 주세요.
            <br />
            Your published posts remain visible. Please contact the NARSHA team for help.
          </p>
        </div>
      </DeskShell>
    );
  }

  return <>{children}</>;
}
