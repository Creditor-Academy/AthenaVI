const NUMBER_LOCALE = 'en-US'

/** Full credit count, e.g. 12,450. */
export function formatCredits(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString(NUMBER_LOCALE)
}

/** Compact from 10k up (12.45K, 1.2M) so big balances fit small slots. */
export function formatCreditsCompact(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  if (Math.abs(num) >= 10_000) {
    return new Intl.NumberFormat(NUMBER_LOCALE, {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(num)
  }
  return num.toLocaleString(NUMBER_LOCALE)
}
