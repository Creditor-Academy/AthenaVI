import { MdAccountBalanceWallet } from 'react-icons/md'
import useEditorCredits from '../../../../hooks/useEditorCredits.js'

const NUMBER_LOCALE = 'en-US'

function formatCredits(value) {
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

function formatCreditsFull(value) {
  return Number(value ?? 0).toLocaleString(NUMBER_LOCALE)
}

function EditorCreditsBar({ workspaceId, refreshKey = 0 }) {
  const {
    personalCredits,
    isTeamWorkspace,
    editorPoolCredits,
    totalCredits,
    loading,
    error,
  } = useEditorCredits(workspaceId, refreshKey)

  if (!workspaceId) return null

  const remaining = loading ? null : editorPoolCredits
  const total = loading ? null : totalCredits
  const isLow = remaining != null && remaining < 100
  const poolLabel = isTeamWorkspace ? 'Workspace' : 'Personal'

  const tooltip =
    error ||
    (loading
      ? 'Loading credits…'
      : isTeamWorkspace
        ? `${poolLabel}: ${formatCreditsFull(remaining)} remaining of ${formatCreditsFull(total)} total. Personal balance: ${formatCreditsFull(personalCredits)}.`
        : `${formatCreditsFull(remaining)} personal credits available.`)

  return (
    <div
      className={`editor-credits-bar ${isLow ? 'editor-credits-bar--low' : ''}`}
      title={tooltip}
      aria-label={tooltip}
    >
      <div className="editor-credits-bar-icon" aria-hidden>
        <MdAccountBalanceWallet size={16} />
      </div>

      <div className="editor-credits-bar-pool">
        <span className="editor-credits-bar-pool-label">{poolLabel}</span>
        {isTeamWorkspace && !loading && (
          <span className="editor-credits-bar-pool-meta">
            +{formatCredits(personalCredits)} personal
          </span>
        )}
      </div>

      <div className="editor-credits-bar-stat editor-credits-bar-stat--remaining">
        <span className="editor-credits-bar-stat-label">Remaining</span>
        <span
          className="editor-credits-bar-stat-value editor-credits-bar-stat-value--primary"
          title={loading ? undefined : formatCreditsFull(remaining)}
        >
          {loading ? '—' : formatCreditsFull(remaining)}
        </span>
      </div>

      <div className="editor-credits-bar-divider" aria-hidden />

      <div className="editor-credits-bar-stat editor-credits-bar-stat--total">
        <span className="editor-credits-bar-stat-label">Total</span>
        <span
          className="editor-credits-bar-stat-value"
          title={loading ? undefined : formatCreditsFull(total)}
        >
          {loading ? '—' : formatCredits(total)}
        </span>
      </div>
    </div>
  )
}

export default EditorCreditsBar
