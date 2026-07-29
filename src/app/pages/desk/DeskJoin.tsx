import DeskShell, { DeskStub } from './_DeskShell';

export default function DeskJoin() {
  return (
    <DeskShell width="narrow">
      <DeskStub
        title="초대코드로 시작하기 · Start with an invite code"
        note="T3 에서 구현됩니다."
      />
    </DeskShell>
  );
}
