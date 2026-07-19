import type { LearnerType } from '../data/learnerTypes';

const logoSrc: Record<LearnerType, string> = {
  가: '/logos/ga.png',
  나: '/logos/na.png',
  다: '/logos/da.png',
  라: '/logos/ra.png',
  마: '/logos/ma.png',
  바: '/logos/ba.png'
};

export function LearnerTypeLogo({ type, size = 96 }: { type: LearnerType; size?: number }) {
  return (
    <img
      src={logoSrc[type]}
      alt={`Type ${type} learner type logo`}
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}
