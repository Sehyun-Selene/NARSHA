import { useState } from 'react';
import DeskShell from './_DeskShell';
import { useLang } from '../../lib/useLang';
import DeskEditor, { type EditorUpdate } from '../../../features/desk/editor/DeskEditor';
import type { DeskDoc } from '../../../features/desk/types';

/**
 * 에디터 페이지. React.lazy 로 코드 분할된다 (방문자 번들 제외, PRD §9).
 * T5: 제목 + 본문 에디터. T8 에서 상단 바(임시저장 카운터·발행)·자동저장이 붙는다.
 */
export default function DeskWrite() {
  const [lang] = useLang();
  const [title, setTitle] = useState('');
  // T8 에서 서버 저장에 사용. 지금은 편집 상태만 보관.
  const [, setDoc] = useState<DeskDoc | null>(null);

  const onUpdate = (u: EditorUpdate) => setDoc(u.json);

  return (
    <DeskShell width="narrow">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={lang === 'ko' ? '제목' : 'Title'}
        aria-label={lang === 'ko' ? '제목' : 'Title'}
        className="w-full bg-transparent border-none outline-none font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[28px] text-[#1e293b] dark:text-[#dce3f3] tracking-[-0.03em] placeholder:text-[#cbd5e1] dark:placeholder:text-[#334155] mb-2"
      />
      <div className="border-b border-[#e2e8f0] dark:border-[#232a36] mb-4" />
      <DeskEditor onUpdate={onUpdate} />
    </DeskShell>
  );
}
