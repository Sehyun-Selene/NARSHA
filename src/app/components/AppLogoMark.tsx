import type { App } from '../data/apps';

const appLogoFallback: Record<string, { bg: string; initial: string; color: string }> = {
  duolingo: { bg: 'bg-gradient-to-br from-[#58cc02] to-[#89e219]', initial: 'D', color: 'text-white' },
  ttmik: { bg: 'bg-gradient-to-br from-[#ff6b6b] to-[#ff8787]', initial: 'T', color: 'text-white' },
  anki: { bg: 'bg-gradient-to-br from-[#0093d0] to-[#00b4e6]', initial: 'A', color: 'text-white' },
  lingodeer: { bg: 'bg-gradient-to-br from-[#ff6f3d] to-[#ff8f61]', initial: 'L', color: 'text-white' },
  teuida: { bg: 'bg-gradient-to-br from-[#4a90e2] to-[#6ba5e7]', initial: 'T', color: 'text-white' },
  sejong: { bg: 'bg-gradient-to-br from-[#1e3a8a] to-[#3b5998]', initial: 'K', color: 'text-white' },
  memrise: { bg: 'bg-gradient-to-br from-[#ffd950] to-[#ffe57a]', initial: 'M', color: 'text-gray-800' },
  drops: { bg: 'bg-gradient-to-br from-[#7c4dff] to-[#9d6dff]', initial: 'D', color: 'text-white' },
};

type AppLogoMarkProps = {
  app: App;
  variant: 'grid' | 'hero';
};

export function AppLogoMark({ app, variant }: AppLogoMarkProps) {
  const alt = `${app.name} logo`;
  const fb = appLogoFallback[app.image];

  if (app.logoSrc) {
    if (variant === 'grid') {
      return (
        <div className="flex size-[5.25rem] sm:size-24 items-center justify-center rounded-2xl bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#232a36] p-2 shadow-sm">
          <img
            src={app.logoSrc}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
            decoding="async"
          />
        </div>
      );
    }
    return (
      <div className="flex size-full min-h-0 min-w-0 items-center justify-center rounded-xl bg-white dark:bg-[#0f172a] border border-[#e2e8f0] dark:border-[#232a36] p-1">
        <img
          src={app.logoSrc}
          alt={alt}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div
        className={`flex size-16 sm:size-[4.75rem] items-center justify-center rounded-full ${fb?.bg ?? 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]'}`}
      >
        <span
          className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[22px] sm:text-[26px] ${fb?.color ?? 'text-white'}`}
        >
          {fb?.initial ?? app.name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex size-full items-center justify-center rounded-full ${fb?.bg ?? 'bg-gradient-to-br from-[#8ecdff] to-[#1b99dc]'}`}
    >
      <span
        className={`font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[18px] sm:text-[20px] ${fb?.color ?? 'text-white'}`}
      >
        {fb?.initial ?? app.name.charAt(0)}
      </span>
    </div>
  );
}
