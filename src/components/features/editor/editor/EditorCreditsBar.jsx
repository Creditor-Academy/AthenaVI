import { MdAccountBalanceWallet } from 'react-icons/md'
import useEditorCredits from '../../../../hooks/useEditorCredits.js'

const NUMBER_LOCALE = 'en-US'

function formatCreditsExact(value) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '0'
  return num.toLocaleString(NUMBER_LOCALE)
}

function EditorCreditsBar({ workspaceId, refreshKey = 0 }) {
  const { editorPoolCredits, loading, error, isTeamWorkspace } = useEditorCredits(
    workspaceId,
    refreshKey
  )

  if (!workspaceId) return null

  const remaining = loading ? null : editorPoolCredits
  const isLow = remaining != null && remaining < 100
  const tooltip =
    error ||
    (loading
      ? 'Loading credits…'
      : `${formatCreditsExact(remaining)} credits remaining${isTeamWorkspace ? ' (workspace pool)' : ''}`)

  return (
    <div
      className={`editor-credits-pill ${isLow ? 'editor-credits-pill--low' : ''}`}
      title={tooltip}
      aria-label={tooltip}
    >
      <MdAccountBalanceWallet size={15} aria-hidden />
      <span className="editor-credits-pill__value">
        {loading ? '…' : formatCreditsExact(remaining)}
      </span>
      <span className="editor-credits-pill__label">Credits</span>
    </div>
  )
}

export default EditorCreditsBar
