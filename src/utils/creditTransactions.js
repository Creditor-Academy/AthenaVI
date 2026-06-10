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
