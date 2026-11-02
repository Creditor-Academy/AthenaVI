/**
 * Profile "Recent activity": one dated feed built from the personal credit
 * history and the workspace list (there is no general activity log API).
 * Each item says what happened (`action`) and to what (`detail`), plus a
 * signed credit `amount` when credits moved.
 */
import {
  collapsePresentationCreditTransactions,
  formatCreditTransactionSubtitle,
  formatCreditTransactionTitle,
  formatCreditTransactionType,
  isTeamWorkspaceType,
  resolveTransferWorkspaceName,
} from '../../utils/creditTransactions.js'

const fmt = (n) => Math.abs(Number(n) || 0).toLocaleString('en-US')
const plural = (n) => (Math.abs(Number(n) || 0) === 1 ? 'credit' : 'credits')
const creditsText = (n) => `${fmt(n)} ${plural(n)}`

function titleCase(role) {
  const s = String(role || '').toLowerCase()
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

function timestamp(value) {
  const t = new Date(value || 0).getTime()
  return Number.isFinite(t) ? t : 0
}

/** One credit transaction → activity item. */
export function creditActivityItem(tx, workspaceNameById = {}) {
  const type = String(tx?.type || '').toLowerCase()
  const amount = Math.abs(Number(tx?.amount) || 0)
  const options = { workspaceNameById }
  const base = { id: `tx-${tx?.id}`, at: tx?.createdAt || null, kind: type || 'credit' }

  switch (type) {
    case 'allocation': {
      const ws = resolveTransferWorkspaceName(tx, workspaceNameById)
      return {
        ...base,
        action: 'Credits allocated',
        detail: ws ? `${creditsText(amount)} to ${ws}` : `${creditsText(amount)} to a workspace`,
        amount: -amount,
      }
    }
    case 'deallocation': {
      const ws = resolveTransferWorkspaceName(tx, workspaceNameById)
      return {
        ...base,
        action: 'Credits returned',
        detail: ws
          ? `${creditsText(amount)} back from ${ws}`
          : `${creditsText(amount)} back to your personal balance`,
        amount,
      }
    }
    case 'usage': {
      const title = formatCreditTransactionTitle(tx, options)
      const where = formatCreditTransactionSubtitle(tx, options)
      const generic = !title || title === formatCreditTransactionType(type)
      return {
        ...base,
        action: 'Credits used',
        detail: generic ? `${creditsText(amount)} spent` : title,
        meta: where || null,
        amount: -amount,
      }
    }
    case 'platform_grant':
    case 'purchase':
    case 'refund': {
      const action = { platform_grant: 'Credits granted', purchase: 'Credits purchased', refund: 'Credits refunded' }[type]
      const reason = tx?.usageDetail?.reason
      return {
        ...base,
        action,
        detail: reason ? `${creditsText(amount)} · ${reason}` : `${creditsText(amount)} added to your balance`,
        amount,
      }
    }
    case 'platform_revoke': {
      const reason = tx?.usageDetail?.reason
      return {
        ...base,
        action: 'Credits removed',
        detail: reason ? `${creditsText(amount)} · ${reason}` : `${creditsText(amount)} removed from your balance`,
        amount: -amount,
      }
    }
    default: {
      const signed = Number(tx?.amount) || 0
      return {
        ...base,
        action: type === 'admin_adjustment' ? 'Balance adjusted' : formatCreditTransactionType(tx?.type),
        detail: `${signed >= 0 ? '+' : '−'}${creditsText(signed)}`,
        amount: signed,
      }
    }
  }
}

/** Team workspaces → "Workspace created" (you own it) / "Joined workspace". */
export function workspaceActivityItems(workspaces = []) {
  const items = []
  for (const ws of Array.isArray(workspaces) ? workspaces : []) {
    // The private workspace is made automatically at sign-up — not an action.
    if (!ws || !isTeamWorkspaceType(ws.type)) continue
    const name = ws.name || 'Untitled workspace'
    const role = String(ws.role || ws.members?.[0]?.role || '').toUpperCase()
    if (role === 'OWNER') {
      items.push({
        id: `ws-created-${ws.id}`,
        kind: 'workspace_created',
        action: 'Workspace created',
        detail: name,
        amount: null,
        at: ws.createdAt || null,
      })
    } else {
      items.push({
        id: `ws-joined-${ws.id}`,
        kind: 'workspace_joined',
        action: 'Joined workspace',
        detail: role ? `${name} as ${titleCase(role)}` : name,
        amount: null,
        at: ws.members?.[0]?.joinedAt || ws.createdAt || null,
      })
    }
  }
  return items
}

/** Newest-first merged feed. */
export function buildProfileActivity({ transactions = [], workspaces = [], limit = 8 } = {}) {
  const workspaceNameById = {}
  for (const ws of Array.isArray(workspaces) ? workspaces : []) {
    if (ws?.id && ws?.name) workspaceNameById[String(ws.id)] = ws.name
  }
  const credit = collapsePresentationCreditTransactions(transactions).map((tx) =>
    creditActivityItem(tx, workspaceNameById)
  )
  return [...credit, ...workspaceActivityItems(workspaces)]
    .filter((item) => item.at)
    .sort((a, b) => timestamp(b.at) - timestamp(a.at))
    .slice(0, limit)
}
