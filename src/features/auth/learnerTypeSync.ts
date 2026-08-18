import { supabase } from '../../lib/supabase';

/**
 * 학습유형 검사 결과의 계정 저장 (GNB PRD REQ-G).
 *
 * 비로그인은 지금까지처럼 localStorage 만 쓴다. 로그인 상태면 `members` 에도
 * 저장해서 기기를 바꿔도 유형이 따라온다. localStorage 는 캐시로 계속 쓴다 —
 * 초기 렌더에서 서버 응답을 기다리면 유형 배지가 늦게 뜬다.
 *
 * 로그아웃해도 로컬 값은 지우지 않는다. 검사 결과는 개인 식별정보가 아니고,
 * 지우면 로그아웃한 사용자가 검사를 다시 해야 한다.
 */

export const LEARNER_TYPE_KEY = 'narsha-learner-type';
const LEARNER_TYPE_AT_KEY = 'narsha-learner-type-at';
/**
 * 이 기기의 검사 결과를 이미 계정에 올린 사용자 id.
 *
 * ⚠️ 없으면 계정 간에 결과가 새어 나간다. 한 기기에서 A 계정으로 로그인해 유형이
 * 올라간 뒤 B 계정으로 로그인하면, B 는 계정 값이 비어 있으니 localStorage 에 남은
 * **A 의 결과**가 B 계정에 저장됐다. 실제로 재현된 문제다.
 *
 * 그래서 로컬 값에 임자를 표시한다. 임자가 있는 값은 다른 계정으로 올리지 않는다.
 * 검사를 새로 하면 임자가 지워져서 그다음 로그인한 계정이 가져갈 수 있다.
 */
const LEARNER_TYPE_OWNER_KEY = 'narsha-learner-type-owner';

/** 결정 결과 — 화면이 토스트를 띄울지 판단하는 데 쓴다. */
export type LearnerTypeSyncResult =
  | { action: 'none' }
  | { action: 'pulled'; type: string }   // 계정 값이 더 최신 → 로컬을 덮었다
  | { action: 'pushed'; type: string };  // 로컬 값이 더 최신 → 계정에 올렸다

function readLocal(): { type: string | null; at: number; owner: string | null } {
  try {
    return {
      type: localStorage.getItem(LEARNER_TYPE_KEY),
      at: Number(localStorage.getItem(LEARNER_TYPE_AT_KEY) ?? 0),
      owner: localStorage.getItem(LEARNER_TYPE_OWNER_KEY),
    };
  } catch {
    return { type: null, at: 0, owner: null };
  }
}

/** 로컬 값의 임자를 기록한다. `null` 이면 지운다 (검사를 새로 한 경우). */
function setOwner(userId: string | null): void {
  try {
    if (userId) localStorage.setItem(LEARNER_TYPE_OWNER_KEY, userId);
    else localStorage.removeItem(LEARNER_TYPE_OWNER_KEY);
  } catch {
    // 저장 실패는 치명적이지 않다 — 다만 이 경우 누출 방지가 동작하지 않는다
  }
}

/** 검사 완료 시 호출. 로컬에 시각까지 남겨 두어야 계정 값과 최신 비교가 된다. */
export function saveLocalLearnerType(type: string, owner: string | null = null): void {
  try {
    localStorage.setItem(LEARNER_TYPE_KEY, type);
    localStorage.setItem(LEARNER_TYPE_AT_KEY, new Date().toISOString());
  } catch {
    // 사파리 프라이빗 모드 등 — 저장 실패는 치명적이지 않다
  }
  // 검사를 새로 했으면 임자가 없는 상태로 되돌린다
  setOwner(owner);
}

/**
 * 로그인 직후 로컬 값과 계정 값을 맞춘다.
 *
 * 둘이 다르면 **더 최근에 검사한 쪽**을 채택한다. 사용자가 마지막으로 한 검사가
 * 현재 의도이기 때문이다. 계정 쪽에 시각이 없으면(구 데이터) 로컬을 우선한다.
 */
export async function syncLearnerType(userId: string): Promise<LearnerTypeSyncResult> {
  const local = readLocal();

  const { data, error } = await supabase
    .from('members')
    .select('learner_type, learner_type_updated_at')
    .eq('id', userId)
    .maybeSingle();

  // members 행이 없으면 desk 저자다 — 계정 저장 대상이 아니다
  if (error || !data) return { action: 'none' };

  const remoteType = (data.learner_type as string | null) ?? null;
  const remoteAt = data.learner_type_updated_at
    ? new Date(data.learner_type_updated_at as string).getTime()
    : 0;

  // 로컬 값을 이 계정으로 올려도 되는지. 임자가 없거나(익명 검사) 나 자신일 때만이다.
  const mayPush = !local.owner || local.owner === userId;

  // 계정에만 있음 → 내려받는다
  if (remoteType && !local.type) {
    saveLocalLearnerType(remoteType, userId);
    return { action: 'pulled', type: remoteType };
  }

  // 로컬에만 있음 → 임자가 없을 때만 올린다
  if (local.type && !remoteType) {
    if (!mayPush) return { action: 'none' };
    await pushLearnerType(userId, local.type, local.at);
    setOwner(userId);
    return { action: 'pushed', type: local.type };
  }

  if (!local.type || !remoteType) return { action: 'none' };
  if (local.type === remoteType) {
    // 같은 값이면 이 계정의 것으로 봐도 된다
    setOwner(userId);
    return { action: 'none' };
  }

  // 둘 다 있고 다르다 → 최신 승. 단 남의 로컬 값으로는 계정을 덮지 않는다
  if (remoteAt > local.at || !mayPush) {
    saveLocalLearnerType(remoteType, userId);
    return { action: 'pulled', type: remoteType };
  }

  await pushLearnerType(userId, local.type, local.at);
  setOwner(userId);
  return { action: 'pushed', type: local.type };
}

async function pushLearnerType(userId: string, type: string, at: number): Promise<void> {
  const { error } = await supabase
    .from('members')
    .update({
      learner_type: type,
      learner_type_updated_at: new Date(at || Date.now()).toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
}

/** 검사 완료 시점에 로그인 상태면 계정에도 바로 반영한다. */
export async function recordLearnerType(type: string, userId?: string | null): Promise<void> {
  saveLocalLearnerType(type, userId ?? null);
  if (!userId) return;
  try {
    await pushLearnerType(userId, type, Date.now());
  } catch {
    // 계정 저장 실패는 검사 결과를 잃는 문제가 아니다 — 로컬에 이미 있다.
    // 다음 로그인 때 syncLearnerType 이 다시 올린다.
  }
}
