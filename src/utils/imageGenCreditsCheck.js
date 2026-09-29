import creditsService from '../services/creditsService.js';
import imageGenService from '../services/imageGenService.js';
import { isTeamWorkspaceType } from './creditTransactions.js';

export async function checkImageGenCredits(workspaceId, { modelId, mode = 'image' } = {}) {
  if (!workspaceId) {
    return { ok: false, missingWorkspace: true, needed: 1, pool: 0, personal: 0, isTeam: false };
  }

  const bal = await creditsService.getWorkspaceBalance(workspaceId);
  const isTeam = isTeamWorkspaceType(bal.workspaceType);
  const pool = Number(isTeam ? bal.workspaceCredits : bal.personalCredits) || 0;
  const personal = Number(bal.personalCredits) || 0;

  let needed = 1;
  try {
    const est = await imageGenService.estimate(workspaceId, {
      modelId,
      mode,
      tweak: false,
    });
    const ac = Number(est?.athenaCredits);
    if (Number.isFinite(ac) && ac > 0) needed = ac;
  } catch {
    /* keep fallback */
  }

  return {
    ok: pool >= needed,
    needed,
    pool,
    personal,
    isTeam,
    missingWorkspace: false,
  };
}
