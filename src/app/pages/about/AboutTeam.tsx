// TODO: 콘텐츠 확정 후 About.tsx에서 활성화
//
// 팀·창업 스토리 섹션. 이번 릴리스에서는 렌더링하지 않는다 (PRD R4.7).
// 레이아웃만 예약해 둔다 — 좌측 인물/이미지, 우측 서사의 2컬럼.
// 활성화할 때 카피는 i18n 사전의 `about.team.*` 네임스페이스에 추가할 것.

import { Eyebrow, Reveal, Section, HEAD_CLASS, BODY_CLASS } from './_shared';

export default function AboutTeam() {
  return (
    <Section id="team" alt>
      <Reveal>
        <Eyebrow label="06 · TEAM" />
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-10 md:gap-14 items-start">
          <div className="aspect-[4/5] rounded-[16px] bg-[#e2e8f0] dark:bg-[#232a36]" />
          <div>
            <h2 className={HEAD_CLASS}>{/* about.team.head */}</h2>
            <p className={`${BODY_CLASS} mt-5`}>{/* about.team.body */}</p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
