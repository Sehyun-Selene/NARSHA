import { supabase } from '../../lib/supabase';

/**
 * 오류 제보 (사용자 요청으로 신설).
 *
 * 서비스 제안(`data/suggestions.ts`)과 표를 나눈 이유 — 성격이 다르다. 제안은
 * 큐레이션 후보이고 오류는 고쳐야 할 결함이다. 한 표에 섞으면 운영자가 매번
 * 걸러내야 한다.
 *
 * 발생 화면 URL 과 브라우저 정보를 자동으로 붙인다. "안 돼요" 한 줄만으로는
 * 재현할 수 없어 제보가 쓸모없어진다.
 */

export interface BugReportInput {
  description: string;
  reporterEmail?: string;
}

export const BUG_DESCRIPTION_MIN = 10;
export const BUG_DESCRIPTION_MAX = 1000;

const DUPE_KEY = 'narsha-last-bug-report';
const DUPE_WINDOW_MS = 5 * 60 * 1000;

/** 같은 내용을 5분 안에 다시 보내는 것을 막는다 (제안 기능과 같은 방식). */
export function checkRecentDuplicate(description: string): boolean {
  try {
    const raw = localStorage.getItem(DUPE_KEY);
    if (!raw) return false;
    const { text, ts } = JSON.parse(raw) as { text: string; ts: number };
    return text === description.trim() && Date.now() - ts < DUPE_WINDOW_MS;
  } catch {
    return false;
  }
}

export async function saveBugReport(input: BugReportInput): Promise<void> {
  const description = input.description.trim();

  const { error } = await supabase.from('bug_reports').insert({
    description,
    reporter_email: input.reporterEmail?.trim() || null,
    // 어느 화면에서 났는지 — 제보의 대부분이 이 한 줄로 재현된다
    page_url: typeof window !== 'undefined' ? window.location.href : null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
  });

  if (error) throw error;

  try {
    localStorage.setItem(DUPE_KEY, JSON.stringify({ text: description, ts: Date.now() }));
  } catch {
    // 사파리 프라이빗 모드 등 — 중복 방지가 안 될 뿐 제보는 이미 저장됐다
  }
}
