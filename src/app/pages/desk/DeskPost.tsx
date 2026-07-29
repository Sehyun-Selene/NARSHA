import { useParams } from 'react-router';
import DeskShell, { DeskStub } from './_DeskShell';

export default function DeskPost() {
  const { handleParam, slug } = useParams();
  return (
    <DeskShell width="narrow">
      <DeskStub
        title={slug ?? '글 상세'}
        note={`${handleParam ?? ''} · 글 상세 — T4 에서 구현됩니다.`}
      />
    </DeskShell>
  );
}
