// digits: [min, max] for the subscriber number (after the dial code)
export const COUNTRIES = [
  { code: 'US', name: 'United States', dial: '1', flag: '🇺🇸', digits: [10, 10] },
  { code: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦', digits: [10, 10] },
  { code: 'GB', name: 'United Kingdom', dial: '44', flag: '🇬🇧', digits: [10, 10] },
  { code: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺', digits: [9, 9] },
  { code: 'IN', name: 'India', dial: '91', flag: '🇮🇳', digits: [10, 10] },
  { code: 'DE', name: 'Germany', dial: '49', flag: '🇩🇪', digits: [10, 11] },
  { code: 'FR', name: 'France', dial: '33', flag: '🇫🇷', digits: [9, 9] },
  { code: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵', digits: [10, 10] },
  { code: 'CN', name: 'China', dial: '86', flag: '🇨🇳', digits: [11, 11] },
  { code: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷', digits: [10, 11] },
  { code: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽', digits: [10, 10] },
  { code: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦', digits: [9, 9] },
  { code: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬', digits: [10, 10] },
  { code: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰', digits: [10, 10] },
  { code: 'BD', name: 'Bangladesh', dial: '880', flag: '🇧🇩', digits: [10, 10] },
  { code: 'ID', name: 'Indonesia', dial: '62', flag: '🇮🇩', digits: [9, 12] },
  { code: 'RU', name: 'Russia', dial: '7', flag: '🇷🇺', digits: [10, 10] },
  { code: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷', digits: [9, 10] },
  { code: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹', digits: [9, 10] },
  { code: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸', digits: [9, 9] },
  { code: 'TR', name: 'Turkey', dial: '90', flag: '🇹🇷', digits: [10, 10] },
  { code: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦', digits: [9, 9] },
  { code: 'AE', name: 'UAE', dial: '971', flag: '🇦🇪', digits: [9, 9] },
  { code: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬', digits: [10, 10] },
  { code: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷', digits: [10, 10] },
  { code: 'CO', name: 'Colombia', dial: '57', flag: '🇨🇴', digits: [10, 10] },
  { code: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭', digits: [10, 10] },
  { code: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾', digits: [9, 10] },
  { code: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬', digits: [8, 8] },
  { code: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿', digits: [8, 9] },
  { code: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱', digits: [9, 9] },
  { code: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪', digits: [7, 9] },
  { code: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴', digits: [8, 8] },
  { code: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭', digits: [9, 9] },
  { code: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱', digits: [9, 9] },
  { code: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹', digits: [9, 9] },
  { code: 'GR', name: 'Greece', dial: '30', flag: '🇬🇷', digits: [10, 10] },
  { code: 'IL', name: 'Israel', dial: '972', flag: '🇮🇱', digits: [9, 9] },
  { code: 'TH', name: 'Thailand', dial: '66', flag: '🇹🇭', digits: [9, 9] },
  { code: 'VN', name: 'Vietnam', dial: '84', flag: '🇻🇳', digits: [9, 10] },
  { code: 'UA', name: 'Ukraine', dial: '380', flag: '🇺🇦', digits: [9, 9] },
]

export const DEFAULT_COUNTRY = COUNTRIES[0] // US

/** Parse a stored value like "+11234567890" into { country, number }. */
export function parseStoredPhone(stored) {
  if (!stored) return { country: DEFAULT_COUNTRY, number: '' }
  const digits = stored.replace(/^\+/, '')
  // Longest dial code first so "+1…" never shadows "+12…"-style codes.
  const sorted = [...COUNTRIES].sort((a, b) => b.dial.length - a.dial.length)
  for (const c of sorted) {
    if (digits.startsWith(c.dial)) {
      return { country: c, number: digits.slice(c.dial.length) }
    }
  }
  return { country: DEFAULT_COUNTRY, number: digits }
}

export function digitRangeLabel([min, max]) {
  return min === max ? `${min}` : `${min}–${max}`
}

export function formatRelativeTime(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff) || diff < 0) return ''
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function initials(name, email) {
  const text = String(name || '').trim()
  if (text) {
    const parts = text.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return text.charAt(0).toUpperCase()
  }
  return String(email || 'U').charAt(0).toUpperCase() || 'U'
}
