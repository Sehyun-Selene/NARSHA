import { supabase } from '../../lib/supabase';
import { ALERT_THRESHOLDS } from '../lib/alertThresholds';

export interface BoostSuggestion {
  appId: string;
  appName: string;
  suggestedTag: string;
  supporterCount: number;
  totalReviews: number;
  supporterPct: number;
  currentTags: string[];
}

export interface AccuracyCheck {
  appId: string;
  appName: string;
  currentTag: string;
  supporterCount: number;
  totalReviews: number;
  supporterPct: number;
}

export async function getBoostSuggestions(): Promise<BoostSuggestion[]> {
  const { data, error } = await supabase
    .from('tag_boost_suggestions')
    .select('*');
  if (error) throw error;
  return (data ?? []).map(r => ({
    appId: r.app_id,
    appName: r.app_name,
    suggestedTag: r.suggested_tag,
    supporterCount: r.supporter_count,
    totalReviews: r.total_reviews,
    supporterPct: Number(r.supporter_pct),
    currentTags: r.current_tags ?? [],
  }));
}

export async function getAccuracyChecks(): Promise<AccuracyCheck[]> {
  const { data, error } = await supabase
    .from('tag_accuracy_checks')
    .select('*');
  if (error) throw error;
  return (data ?? []).map(r => ({
    appId: r.app_id,
    appName: r.app_name,
    currentTag: r.current_tag,
    supporterCount: r.supporter_count,
    totalReviews: r.total_reviews,
    supporterPct: Number(r.supporter_pct),
  }));
}

export async function dismissAlert(params: {
  alertType: 'boost_suggestion' | 'accuracy_check';
  appId: string;
  tag: string;
  actionTaken: 'added' | 'ignored' | 'removed' | 'kept';
}): Promise<void> {
  const cooldown = params.actionTaken === 'ignored'
    ? ALERT_THRESHOLDS.boostSuggestion.cooldownDays
    : null;
  const expiresAt = cooldown
    ? new Date(Date.now() + cooldown * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { error } = await supabase.from('dismissed_alerts').insert({
    alert_type: params.alertType,
    app_id: params.appId,
    tag: params.tag,
    action_taken: params.actionTaken,
    expires_at: expiresAt,
  });
  if (error) throw error;
}

// Operator adds a missing tag to app.differentiators (manual action only)
export async function addTagToApp(appId: string, tag: string, currentTags: string[]): Promise<void> {
  const { error } = await supabase
    .from('apps')
    .update({ differentiators: [...currentTags, tag] })
    .eq('id', appId);
  if (error) throw error;
}

// Operator removes a tag from app.differentiators (manual action only)
export async function removeTagFromApp(appId: string, tag: string, currentTags: string[]): Promise<void> {
  const { error } = await supabase
    .from('apps')
    .update({ differentiators: currentTags.filter(t => t !== tag) })
    .eq('id', appId);
  if (error) throw error;
}
