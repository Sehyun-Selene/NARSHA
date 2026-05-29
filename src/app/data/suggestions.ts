import { supabase } from '../../lib/supabase';

export interface SuggestionInput {
  serviceName: string;
  serviceUrl?: string;
  recommendedStrengths: string[];
  customReason?: string;
  reporterEmail?: string;
}

const DUPE_KEY = 'narsha-last-suggestion';

export function checkRecentDuplicate(serviceName: string): boolean {
  try {
    const raw = localStorage.getItem(DUPE_KEY);
    if (!raw) return false;
    const { name, ts } = JSON.parse(raw) as { name: string; ts: number };
    return (
      name.toLowerCase() === serviceName.trim().toLowerCase() &&
      Date.now() - ts < 5 * 60 * 1000
    );
  } catch {
    return false;
  }
}

export async function saveSuggestion(input: SuggestionInput): Promise<void> {
  const { error } = await supabase.from('suggested_services').insert({
    service_name: input.serviceName.trim(),
    service_url: input.serviceUrl?.trim() || null,
    recommended_strengths: input.recommendedStrengths,
    custom_reason: input.customReason?.trim() || null,
    reporter_email: input.reporterEmail?.trim() || null,
  });
  if (error) throw error;
  localStorage.setItem(
    DUPE_KEY,
    JSON.stringify({ name: input.serviceName.trim(), ts: Date.now() })
  );
}
