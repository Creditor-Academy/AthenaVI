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
