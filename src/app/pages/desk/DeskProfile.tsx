import { useParams } from 'react-router';
import DeskShell, { DeskStub } from './_DeskShell';

export default function DeskProfile() {
  const { handleParam } = useParams();
  return (
    <DeskShell>
      <DeskStub
        title={`${handleParam ?? ''} 의 한국어 책상`}
        note="개인 책상 — T4 에서 구현됩니다."
      />
    </DeskShell>
  );
}
