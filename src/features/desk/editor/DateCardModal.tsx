import { useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Lang } from '../../../app/lib/useLang';
import { formatDateCardText, type DeskDateCardAttrs } from './extensions/DeskDateCard';

function toIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DAY_CLASSNAMES = {
  months: 'flex flex-col',
  month: 'flex flex-col gap-3',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-[13px] font-bold text-[#1e293b] dark:text-[#dce3f3]',
  nav: 'flex items-center gap-1',
  nav_button: 'flex items-center justify-center w-7 h-7 rounded-md text-[#64748b] dark:text-[#bec7d2] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]',
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-collapse',
  head_row: 'flex',
  head_cell: 'w-9 text-[11px] font-normal text-[#94a3b8]',
  row: 'flex w-full mt-1',
  cell: 'w-9 h-9 text-center text-[13px] p-0 relative [&:has([aria-selected])]:bg-[#e0f2fe] dark:[&:has([aria-selected])]:bg-[#1b5a7a]/40',
  day: 'w-9 h-9 rounded-md text-[#1e293b] dark:text-[#dce3f3] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]',
  day_selected: '!bg-[#1b99dc] !text-white hover:!bg-[#1b99dc]',
  day_today: 'font-bold text-[#1b99dc]',
  day_outside: 'text-[#cbd5e1] dark:text-[#334155]',
  day_range_middle: '!bg-[#e0f2fe] dark:!bg-[#1b5a7a]/40 !text-[#0369a1] dark:!text-[#8ecdff] !rounded-none',
  day_range_start: '!rounded-r-none',
  day_range_end: '!rounded-l-none',
};

/** 일정(날짜) 카드 삽입 모달 (PRD §6.6) — 단일 날짜 또는 기간 선택 + 라벨. */
export default function DateCardModal({
  lang,
  onInsert,
  onClose,
}: {
  lang: Lang;
  onInsert: (attrs: DeskDateCardAttrs) => void;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'single' | 'range'>('single');
  const today = new Date();
  const [single, setSingle] = useState<Date>(today);
  const [range, setRange] = useState<DateRange | undefined>({ from: today, to: today });
  const [label, setLabel] = useState('');

  const t = lang === 'ko'
    ? { title: '일정 카드', single: '날짜', range: '기간', label: '내용(선택)', labelPh: '오늘의 한국어 공부', cancel: '취소', insert: '삽입' }
    : { title: 'Date card', single: 'Date', range: 'Range', label: 'Label (optional)', labelPh: 'Today’s Korean study', cancel: 'Cancel', insert: 'Insert' };

  const attrs: DeskDateCardAttrs | null = mode === 'single'
    ? { date: toIso(single), endDate: null, label: label.trim() || null }
    : range?.from
      ? { date: toIso(range.from), endDate: range.to ? toIso(range.to) : null, label: label.trim() || null }
      : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative w-full max-w-[340px] rounded-[16px] bg-white dark:bg-[#151c27] p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} aria-label={t.cancel} className="absolute top-4 right-4 text-[#94a3b8] hover:text-[#1e293b] dark:hover:text-[#dce3f3]"><X className="w-5 h-5" /></button>
        <h2 className="font-['Manrope:ExtraBold',sans-serif] font-extrabold text-[16px] text-[#1e293b] dark:text-[#dce3f3] mb-3">{t.title}</h2>

        <div className="flex gap-1 mb-3">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`flex-1 h-8 rounded-md text-[13px] ${mode === 'single' ? 'bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff]' : 'text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]'}`}
          >
            {t.single}
          </button>
          <button
            type="button"
            onClick={() => setMode('range')}
            className={`flex-1 h-8 rounded-md text-[13px] ${mode === 'range' ? 'bg-[#e0f2fe] dark:bg-[#1b5a7a] text-[#0369a1] dark:text-[#8ecdff]' : 'text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]'}`}
          >
            {t.range}
          </button>
        </div>

        <div className="flex justify-center mb-3">
          {mode === 'single' ? (
            <DayPicker
              mode="single"
              required
              selected={single}
              onSelect={(d) => d && setSingle(d)}
              classNames={DAY_CLASSNAMES}
              components={{
                IconLeft: (p) => <ChevronLeft className="w-4 h-4" {...p} />,
                IconRight: (p) => <ChevronRight className="w-4 h-4" {...p} />,
              }}
            />
          ) : (
            <DayPicker
              mode="range"
              selected={range}
              onSelect={setRange}
              classNames={DAY_CLASSNAMES}
              components={{
                IconLeft: (p) => <ChevronLeft className="w-4 h-4" {...p} />,
                IconRight: (p) => <ChevronRight className="w-4 h-4" {...p} />,
              }}
            />
          )}
        </div>

        <label className="block mb-1 text-[12px] text-[#64748b] dark:text-[#94a3b8]">{t.label}</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t.labelPh}
          className="w-full h-9 rounded-md border border-[#e2e8f0] dark:border-[#232a36] bg-transparent px-3 text-[13px] text-[#1e293b] dark:text-[#dce3f3] mb-4"
        />

        {attrs && (
          <p className="mb-4 text-[13px] text-[#1e293b] dark:text-[#dce3f3]">📅 {formatDateCardText(attrs)}</p>
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-9 px-4 rounded-full text-[13px] text-[#64748b] dark:text-[#94a3b8] hover:bg-[#f1f5f9] dark:hover:bg-[#1e293b]">{t.cancel}</button>
          <button
            type="button"
            disabled={!attrs}
            onClick={() => attrs && onInsert(attrs)}
            className="h-9 px-5 rounded-full bg-gradient-to-r from-[#8ecdff] to-[#1b99dc] text-[#00344f] font-bold text-[13px] disabled:opacity-50"
          >
            {t.insert}
          </button>
        </div>
      </div>
    </div>
  );
}
