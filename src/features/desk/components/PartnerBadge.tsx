import { Badge } from '../../../app/components/ui/badge';
import type { Lang } from '../../../app/lib/useLang';
import { isPartner } from '../types';
import type { DeskParticipantType } from '../types';

/**
 * 크리에이터 파트너 배지. 권한 차이는 없고 표시만 다르다 (PRD §5.3).
 * 피드 아바타·프로필 헤더·글 상세 3곳에서 사용.
 */
export default function PartnerBadge({
  participantType,
  lang,
  className,
}: {
  participantType: DeskParticipantType;
  lang: Lang;
  className?: string;
}) {
  if (!isPartner({ participant_type: participantType })) return null;
  return (
    <Badge variant="secondary" className={className}>
      {lang === 'ko' ? '파트너' : 'Partner'}
    </Badge>
  );
}
