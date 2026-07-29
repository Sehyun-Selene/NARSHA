import DeskShell, { DeskStub } from './_DeskShell';

/**
 * 에디터 페이지. React.lazy 로 코드 분할되어 방문자 번들에 포함되지 않는다 (PRD §9 성능).
 * T5~T8 에서 Tiptap 에디터·자동저장·발행으로 채워진다.
 */
export default function DeskWrite() {
  return (
    <DeskShell>
      <DeskStub title="글쓰기 · Write" note="T5~T8 에서 구현됩니다." />
    </DeskShell>
  );
}
