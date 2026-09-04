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
    if (detail.presentationName && isPresentationCreditFeature(detail.feature)) {
      return `Presentation — "${detail.presentationName}"`;
    }
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

export function getCreditTransactionTimestamp(transaction) {
  const raw =
    transaction?.createdAt ??
    transaction?.created_at ??
    transaction?.timestamp ??
    null;
  const ms = new Date(raw || 0).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export function sumUsageCredits(transactions = []) {
  return transactions
    .filter((tx) => String(tx.type || '').toLowerCase() === 'usage')
    .reduce((sum, tx) => sum + Math.abs(Number(tx.amount || 0)), 0);
}

/** Sum usage credits within a rolling window (default: last 30 days). */
export function sumRecentUsageCredits(transactions = [], { withinDays = 30 } = {}) {
  const cutoff = Date.now() - withinDays * 24 * 60 * 60 * 1000;
  return transactions
    .filter((tx) => {
      if (String(tx.type || '').toLowerCase() !== 'usage') return false;
      const created = getCreditTransactionTimestamp(tx);
      return created != null && created >= cutoff;
    })
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
    const created = getCreditTransactionTimestamp(tx) ?? 0;
    if (!Number.isFinite(created) || created < cutoff) continue;
    const amount = Math.abs(Number(tx.amount || 0));
    if (amount > 0) return amount;
  }
  return null;
}

const PPT_FEATURE_BREAKDOWN_LABELS = Object.freeze({
  ppt_outline: 'Outline',
  ppt_slide_content: 'slide',
  ppt_image_path_a: 'image',
  ppt_image_path_b: 'diagram',
  ppt_export: 'export',
  ppt_image_cache_hit: 'cached image',
});

export function isPresentationCreditFeature(feature) {
  const key = String(feature || '').toLowerCase();
  return key.startsWith('ppt_');
}

function getPresentationGroupKey(transaction) {
  const tx = transaction || {};
  if (String(tx.type || '').toLowerCase() !== 'usage') return null;

  const detail = tx.usageDetail || {};
  const metadata = tx.metadata || {};
  const feature = detail.feature || metadata.feature;
  if (!isPresentationCreditFeature(feature)) return null;

  return (
    detail.deckId ||
    metadata.deckId ||
    detail.projectId ||
    metadata.projectId ||
    null
  );
}

function resolvePresentationNameFromTx(tx) {
  const detail = tx?.usageDetail || {};
  const metadata = tx?.metadata || {};
  return (
    detail.presentationName ||
    metadata.presentationName ||
    detail.projectName ||
    metadata.projectName ||
    null
  );
}

function buildPresentationBreakdown(featureCounts) {
  const parts = [];
  if (featureCounts.ppt_outline) parts.push('Outline');

  const slides = featureCounts.ppt_slide_content || 0;
  if (slides) parts.push(`${slides} slide${slides === 1 ? '' : 's'}`);

  const images = featureCounts.ppt_image_path_a || 0;
  if (images) parts.push(`${images} image${images === 1 ? '' : 's'}`);

  const diagrams = featureCounts.ppt_image_path_b || 0;
  if (diagrams) parts.push(`${diagrams} diagram${diagrams === 1 ? '' : 's'}`);

  const exports = featureCounts.ppt_export || 0;
  if (exports) parts.push(`${exports} export${exports === 1 ? '' : 's'}`);

  const cached = featureCounts.ppt_image_cache_hit || 0;
  if (cached) parts.push(`${cached} cached`);

  // Any unexpected ppt_* keys
  Object.entries(featureCounts).forEach(([feature, count]) => {
    if (PPT_FEATURE_BREAKDOWN_LABELS[feature] || !count) return;
    parts.push(`${count}× ${feature.replace(/^ppt_/, '').replace(/_/g, ' ')}`);
  });

  return parts.join(' · ') || null;
}

function buildGroupedPresentationTransaction(transactions) {
  const txs = Array.isArray(transactions) ? transactions.filter(Boolean) : [];
  if (!txs.length) return null;
  if (txs.length === 1) return txs[0];

  const sorted = [...txs].sort(
    (a, b) => (getCreditTransactionTimestamp(b) || 0) - (getCreditTransactionTimestamp(a) || 0)
  );
  const latest = sorted[0];
  const amount = txs.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const featureCounts = {};
  let presentationName = null;
  let deckId = null;
  let projectId = null;

  for (const tx of txs) {
    const detail = tx.usageDetail || {};
    const metadata = tx.metadata || {};
    const feature = String(detail.feature || metadata.feature || '').toLowerCase();
    if (feature) featureCounts[feature] = (featureCounts[feature] || 0) + 1;

    presentationName = presentationName || resolvePresentationNameFromTx(tx);
    deckId = deckId || detail.deckId || metadata.deckId || null;
    projectId = projectId || detail.projectId || metadata.projectId || null;
  }

  const title = presentationName
    ? `Presentation — "${presentationName}"`
    : 'Presentation generation';
  const where = buildPresentationBreakdown(featureCounts);

  return {
    ...latest,
    id: `ppt-group:${deckId || projectId || latest.id}`,
    amount,
    createdAt: latest.createdAt ?? latest.created_at ?? latest.timestamp,
    type: 'usage',
    usageDetail: {
      feature: 'ppt_generation',
      kind: 'ppt_generation',
      label: title,
      displayName: title,
      presentationName,
      deckId,
      projectId,
      grouped: true,
      groupCount: txs.length,
      featureCounts,
      where,
      credits: Math.abs(amount),
    },
    metadata: {
      ...(latest.metadata || {}),
      feature: 'ppt_generation',
      deckId,
      projectId,
      grouped: true,
      groupCount: txs.length,
    },
  };
}

/**
 * Collapse per-slide / per-image PPT ledger rows into one row per presentation (deck).
 * Non-PPT transactions stay in place; group rows appear at the first member's position.
 */
export function collapsePresentationCreditTransactions(transactions = []) {
  const list = Array.isArray(transactions) ? transactions : [];
  if (!list.length) return [];

  const groups = new Map();
  const order = [];

  for (const tx of list) {
    const key = getPresentationGroupKey(tx);
    if (!key) {
      order.push({ kind: 'single', tx });
      continue;
    }
    if (!groups.has(key)) {
      groups.set(key, []);
      order.push({ kind: 'group', key });
    }
    groups.get(key).push(tx);
  }

  return order
    .map((entry) => {
      if (entry.kind === 'single') return entry.tx;
      return buildGroupedPresentationTransaction(groups.get(entry.key));
    })
    .filter(Boolean);
}
