import type { ReactNode } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
// 글꼴 4종 자체 호스팅 (PRD §6.6, 한글 서브셋 + Latin) — 발행본·에디터 모두
// 이 셸 아래에서 렌더되므로 여기서 한 번만 로드한다.
// Pretendard: @fontsource 배포판은 latin 서브셋만 포함해 한글이 깨져서
// 원저작자(orioncactus) 공식 패키지의 한글 서브셋(2,350자)판을 대신 쓴다.
import 'pretendard/dist/web/static/pretendard-subset.css';
import '@fontsource/nanum-gothic/korean-400.css';
import '@fontsource/nanum-gothic/korean-700.css';
import '@fontsource/nanum-gothic/latin-400.css';
import '@fontsource/nanum-gothic/latin-700.css';
import '@fontsource/nanum-myeongjo/korean-400.css';
import '@fontsource/nanum-myeongjo/korean-700.css';
import '@fontsource/nanum-myeongjo/latin-400.css';
import '@fontsource/nanum-myeongjo/latin-700.css';
import '@fontsource/nanum-brush-script/korean-400.css';
import '@fontsource/nanum-brush-script/latin-400.css';

/**
 * 「나의 한국어 책상」 공통 페이지 셸.
 * 기존 사이트 레이아웃(Header · pt-16 main · Footer)을 그대로 상속한다 (PRD §4.2).
 * 전용 헤더나 풀블리드 히어로를 만들지 않는다.
 */
export default function DeskShell({
  children,
  width = 'wide',
}: {
  children: ReactNode;
  width?: 'wide' | 'narrow';
}) {
  const inner = width === 'narrow' ? 'max-w-[800px]' : 'max-w-[1120px]';
  return (
    <div className="min-h-screen bg-[#ffffff] dark:bg-[#0c141f] flex flex-col">
      <Header />
      <main className="flex-1 pt-16">
        <div className={`${inner} mx-auto px-6 py-12`}>{children}</div>
      </main>
      <Footer />
    </div>
  );
}

/** 스텁 단계용 임시 플레이스홀더. T4~T8 에서 실제 화면으로 교체된다. */
export function DeskStub({ title, note }: { title: string; note?: string }) {
  return (
    <div className="py-16 text-center">
      <h1 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.04em] mb-3">
        {title}
      </h1>
      {note && (
        <p className="font-['Inter:Regular',sans-serif] text-[15px] text-[#64748b] dark:text-[#bec7d2]">
          {note}
        </p>
      )}
    </div>
  );
}
