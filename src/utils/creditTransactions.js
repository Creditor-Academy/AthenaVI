const TYPE_LABELS = {
  usage: 'Usage',
  platform_grant: 'Platform grant',
  platform_revoke: 'Platform revoke',
  allocation: 'Allocated to workspace',
  deallocation: 'Returned to personal',
  refund: 'Refund',
  purchase: 'Purchase',
  admin_adjustment: 'Admin adjustment',
};

export function formatCreditTransactionType(type) {
  const key = String(type || '').toLowerCase();
  return TYPE_LABELS[key] || type || 'Transaction';
}

function isLikelyRawId(str) {
  if (!str || typeof str !== 'string') return false;
  return /^[a-zA-Z0-9_-]{12,}$/.test(str) && !str.includes(' ');
}

function isGenericTransferLabel(label) {
  const s = String(label || '').toLowerCase().trim();
  return [
    'allocated to workspace',
    'returned to personal',
    'returned from workspace',
    'allocated',
    'returned',
    'allocation',
    'deallocation',
  ].includes(s);
}

/** Resolve workspace name for allocation / deallocation rows. */
export function resolveTransferWorkspaceName(transaction, workspaceNameById = null) {
  const tx = transaction || {};
  const detail = tx.usageDetail || {};
  const metadata = tx.metadata || {};

  const directCandidates = [
    detail.workspaceName,
    metadata.workspaceName,
    metadata.workspace_name,
    tx.workspaceName,
    tx.workspace?.name,
    metadata.workspace?.name,
  ];

  for (const candidate of directCandidates) {
    if (candidate && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }

  const workspaceId =
    tx.workspaceId ??
    metadata.workspaceId ??
    metadata.workspace_id ??
    detail.workspaceId;

  if (workspaceId && workspaceNameById && typeof workspaceNameById === 'object') {
    const resolved = workspaceNameById[String(workspaceId)];
    if (resolved) return resolved;
  }

  return null;
}

/** Primary line for credit history rows — prefers usageDetail.displayName. */
export function formatCreditTransactionTitle(transaction, options = {}) {
  const tx = transaction || {};
  const detail = tx.usageDetail || {};
  const type = String(tx.type || '').toLowerCase();

  if (type === 'allocation' || type === 'deallocation') {
    const workspaceName = resolveTransferWorkspaceName(tx, options.workspaceNameById);
    if (workspaceName) {
      return type === 'allocation'
        ? `Allocated to ${workspaceName}`
        : `Returned from ${workspaceName}`;
    }
    if (detail.label && !isGenericTransferLabel(detail.label)) {
      return detail.label;
    }
    return type === 'allocation' ? 'Allocated to workspace' : 'Returned to personal';
  }

  if (detail.displayName) return detail.displayName;
  if (detail.label) return detail.label;

  if (type === 'usage') {
    if (detail.consumptionType) return detail.consumptionType;
    if (detail.feature === 'voice_clone' && detail.voiceName) {
      return `Voice clone — ${detail.voiceName}`;
    }
    if (detail.feature === 'avatar_create' && detail.avatarName) {
      return `Avatar creation — ${detail.avatarName}`;
    }
    if (detail.projectName && detail.sceneName) {
      return `Scene "${detail.sceneName}" in "${detail.projectName}"`;
    }
    if (detail.videoName) return `Video export — "${detail.videoName}"`;
    if (detail.projectName) return detail.projectName;
  }

  if (type === 'platform_grant' || type === 'platform_revoke') {
    if (detail.reason) return detail.reason;
    if (tx.reference && !isLikelyRawId(tx.reference)) return tx.reference;
    return formatCreditTransactionType(type);
  }

  if (tx.reference && !isLikelyRawId(tx.reference)) return tx.reference;

  return formatCreditTransactionType(type);
}

/** Optional subtitle — usageDetail.where, grant reason, etc. */
export function formatCreditTransactionSubtitle(transaction, options = {}) {
  const { stripWorkspace = true, workspaceNameById = null } = options;
  const tx = transaction || {};
  const detail = tx.usageDetail || {};
  const type = String(tx.type || '').toLowerCase();

  if (type === 'allocation' || type === 'deallocation') {
    const workspaceName = resolveTransferWorkspaceName(tx, workspaceNameById);
    if (workspaceName) {
      return type === 'allocation' ? 'From your personal balance' : 'Back to your personal balance';
    }
  }

  if (detail.where) {
    const segments = String(detail.where).split(' · ').map((s) => s.trim()).filter(Boolean);
    const filtered = stripWorkspace
      ? segments.filter((s) => !/^workspace:/i.test(s))
      : segments;
    if (filtered.length) return filtered.join(' · ');
  }

  if (detail.reason && detail.label && detail.reason !== detail.label) return detail.reason;

  if ((type === 'platform_grant' || type === 'platform_revoke') && detail.label) {
    return detail.label;
  }

  return null;
}

export function formatCreditTransactionDuration(transaction) {
  const secs = Number((transaction?.usageDetail || {}).durationSeconds);
  if (!Number.isFinite(secs) || secs <= 0) return null;
  const rounded = Math.round(secs);
  if (rounded < 60) return `${rounded}s`;
  return `${Math.floor(rounded / 60)}m ${rounded % 60}s`;
}

export function formatCreditAmount(amount) {
  const value = Number(amount || 0);
  if (value > 0) return `+${value.toLocaleString()}`;
  return value.toLocaleString();
}

export function sumUsageCredits(transactions = []) {
  return transactions
    .filter((tx) => String(tx.type || '').toLowerCase() === 'usage')
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
}

export function isTeamWorkspaceType(workspaceType) {
  const value = String(workspaceType || '').toUpperCase();
  return value === 'TEAM' || value === 'WORKSPACE';
}

export function isPrivateWorkspaceType(workspaceType) {
  const value = String(workspaceType || '').toUpperCase();
  return value === 'PRIVATE' || value === 'PERSONAL';
}

/** Pull a positive credit charge from heterogeneous API payloads. */
export function extractCreditsUsed(payload) {
  if (!payload || typeof payload !== 'object') return null;

  const candidates = [
    payload.creditsUsed,
    payload.credits_used,
    payload.chargedCredits,
    payload.charged_credits,
    payload.creditAmount,
    payload.credit_amount,
    payload.credits?.used,
    payload.credits?.charged,
    payload.creditTransaction?.amount,
    payload.credit_transaction?.amount,
    payload.transaction?.amount,
    payload.usage?.credits,
  ];

  for (const candidate of candidates) {
    const value = Math.abs(Number(candidate));
    if (Number.isFinite(value) && value > 0) return value;
  }

  return null;
}

/** Normalize estimate endpoint payloads. */
export function parseCreditEstimate(data) {
  if (!data || typeof data !== 'object') return null;
  const value = Number(
    data.estimatedCredits
      ?? data.estimated_credits
      ?? data.credits
      ?? data.cost
      ?? data.amount
  );
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Fallback when estimate API is unavailable — matches platform avatar_create charge. */
export const AVATAR_CREATE_MIN_CREDITS = 14000;

export function resolveAvatarCreateCreditCost(estimatePayload) {
  return parseCreditEstimate(estimatePayload) ?? AVATAR_CREATE_MIN_CREDITS;
}

/** Absolute credit count for balances, costs, and minimums (no +/- prefix). */
export function formatCreditsPlain(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  return Math.abs(value).toLocaleString();
}

export function hasEnoughCreditsForAvatar(personalBalance, requiredCredits) {
  const balance = Number(personalBalance);
  const required = Number(requiredCredits);
  if (!Number.isFinite(balance) || !Number.isFinite(required)) return true;
  return balance >= required;
}

export function findRecentUsageCredits(transactions = [], { withinMs = 180000 } = {}) {
  const cutoff = Date.now() - withinMs;
  for (const tx of transactions) {
    if (String(tx.type || '').toLowerCase() !== 'usage') continue;
    const created = new Date(tx.createdAt || tx.created_at || 0).getTime();
    if (!Number.isFinite(created) || created < cutoff) continue;
    const amount = Math.abs(Number(tx.amount || 0));
    if (amount > 0) return amount;
  }
  return null;
}
