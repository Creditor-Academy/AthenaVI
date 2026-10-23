import { useMemo, useState } from 'react'
import { FiLink, FiPlay } from 'react-icons/fi'
import { SiYoutube, SiVimeo, SiLoom } from 'react-icons/si'
import InsertPanelShell from './InsertPanelShell'
import { BRAND_ICON_META, RailBrandIcon } from './insertBrandIcons'
import {
  detectEmbedProvider,
  isValidHttpUrl,
  PPT_EMBED_PROVIDERS,
} from '../../../../constants/pptInsertCatalog'

const PREVIEW_ICONS = {
  youtube: SiYoutube,
  vimeo: SiVimeo,
  loom: SiLoom,
  graphy: FiPlay,
  'any-link': FiLink,
}

function EmbedPreviewArt({ providerId }) {
  const meta = BRAND_ICON_META[providerId] || BRAND_ICON_META['any-link']
  const PreviewIcon = PREVIEW_ICONS[providerId] || FiLink
  const isVideo = providerId !== 'any-link'
  const wash =
    {
      youtube: '#FFF5F5',
      vimeo: '#F0F9FF',
      loom: '#F5F3FF',
      graphy: '#F5F3FF',
      'any-link': '#F8FAFC',
    }[providerId] || '#F8FAFC'

  return (
    <div
      className="ppt-embed-preview-frame"
      style={{ borderColor: '#E2E8F0', background: '#fff' }}
    >
      {isVideo ? (
        <div className="ppt-embed-art">
          <div className="ppt-embed-art-stage" style={{ background: wash }}>
            <span className="ppt-embed-art-play" style={{ background: '#fff', color: meta.color }}>
              <PreviewIcon size={26} />
            </span>
            <div className="ppt-embed-art-bars">
              <span style={{ background: '#FBCFE8' }} />
              <span style={{ background: '#A5F3FC' }} />
              <span style={{ background: '#BBF7D0' }} />
            </div>
          </div>
          <div className="ppt-embed-art-rail">
            <span style={{ background: '#FBCFE8' }} />
            <span style={{ background: '#A5F3FC' }} />
            <span style={{ background: '#BBF7D0' }} />
            <span style={{ background: '#BFDBFE' }} />
            <span style={{ background: '#DDD6FE' }} />
          </div>
        </div>
      ) : (
        <div className="ppt-embed-art ppt-embed-art--link">
          <span className="ppt-embed-art-play" style={{ background: wash, color: meta.color }}>
            <FiLink size={22} />
          </span>
          <div className="ppt-embed-art-link-lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  )
}

export default function EmbedPanel({ onInsert, disabled }) {
  const [providerId, setProviderId] = useState('youtube')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const provider = useMemo(
    () => PPT_EMBED_PROVIDERS.find((p) => p.id === providerId) || PPT_EMBED_PROVIDERS[0],
    [providerId]
  )

  const rail = useMemo(
    () => [
      {
        label: '',
        items: PPT_EMBED_PROVIDERS.map((p) => ({
          id: p.id,
          label: p.label,
          icon: <RailBrandIcon id={p.id} />,
        })),
      },
    ],
    []
  )

  const handleAdd = () => {
    const trimmed = url.trim()
    if (!isValidHttpUrl(trimmed)) {
      setError('Enter a valid http(s) URL')
      return
    }
    const resolved =
      providerId === 'any-link' ? detectEmbedProvider(trimmed) || 'any-link' : providerId
    const matched = PPT_EMBED_PROVIDERS.find((p) => p.id === resolved)
    if (matched?.match && !matched.match.test(trimmed) && providerId !== 'any-link') {
      setError(`That does not look like a ${matched.label} link`)
      return
    }
    setError('')
    onInsert({
      type: 'embed',
      content: {
        provider: resolved,
        url: trimmed,
        title: matched?.label || 'Link',
      },
    })
    setUrl('')
  }

  return (
    <InsertPanelShell
      title="Embed"
      rail={rail}
      activeRailId={providerId}
      onSelectRail={(id) => {
        setProviderId(id)
        setError('')
        setUrl('')
      }}
      wide
      className="ppt-insert-panel--embed"
    >
      <div className="ppt-embed-body">
        <div className="ppt-insert-main-head">
          <h3 className="ppt-insert-main-title">{provider.label}</h3>
          <p className="ppt-insert-main-sub">{provider.description}</p>
        </div>

        <div className="ppt-embed-preview" aria-hidden>
          <EmbedPreviewArt providerId={providerId} />
        </div>

        <div className="ppt-embed-form">
          <input
            className="ppt-insert-search ppt-embed-input"
            type="url"
            placeholder={provider.placeholder}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd()
            }}
            disabled={disabled}
          />
          <button
            type="button"
            className="ppt-embed-add"
            disabled={disabled || !url.trim()}
            onClick={handleAdd}
          >
            Add
          </button>
        </div>
        {error && <div className="ppt-insert-error">{error}</div>}
      </div>
    </InsertPanelShell>
  )
}
