export function formatAc(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `${new Intl.NumberFormat().format(n)} AC`
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatShortDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const TX_TYPE_LABELS = {
  platform_grant: 'Platform grant',
  platform_revoke: 'Platform revoke',
  usage: 'Usage',
  allocation: 'Allocation',
  deallocation: 'Deallocation',
  refund: 'Refund',
}

export function txTypeLabel(type) {
  return TX_TYPE_LABELS[type] || type || 'Unknown'
}

export function txAmountClass(amount) {
  const n = Number(amount)
  if (n > 0) return 'sa-amount--positive'
  if (n < 0) return 'sa-amount--negative'
  return ''
}

export function toIsoDateInput(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toISOString().slice(0, 10)
}

export function defaultReportRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 30)
  return { from: toIsoDateInput(from), to: toIsoDateInput(to) }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUuid(value) {
  return UUID_RE.test(String(value || '').trim())
}

export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n < 0) return '—'
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1)
  const val = n / Math.pow(1024, i)
  return `${i === 0 ? val : val.toFixed(2)} ${units[i]}`
}

export const STORAGE_TX_TYPE_LABELS = {
  initial: 'Initial quota',
  platform_grant: 'Platform grant',
  platform_revoke: 'Platform revoke',
  purchase: 'Purchase',
}

export function storageTxTypeLabel(type) {
  return STORAGE_TX_TYPE_LABELS[type] || type || 'Unknown'
}

export function storageStatusLabel(status) {
  const s = String(status || '').toLowerCase()
  if (s === 'pending') return 'Pending'
  if (s === 'approved') return 'Approved'
  if (s === 'rejected') return 'Rejected'
  return status || 'Unknown'
}
