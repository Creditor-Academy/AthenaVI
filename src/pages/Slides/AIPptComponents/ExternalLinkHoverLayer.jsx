import { useMemo, useState } from 'react'
import { FiLink } from 'react-icons/fi'
import { detectEmbedProvider } from '../../../constants/pptInsertCatalog'
import { BRAND_ICON_META, RailBrandIcon } from './insert/insertBrandIcons'

const GENERIC_LINK_TITLES = new Set([
  'link',
  'embed',
  'any link',
  'youtube',
  'vimeo',
  'loom',
  'graphy',
  'notion',
  'monday',
  'typeform',
  'hubspot',
])

function resolveHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, '')
  } catch {
    return ''
  }
}

export function resolveExternalLinkLabel(content = {}) {
  const url = String(content?.url || '').trim()
  const title = String(content?.title || '').trim()
  if (title && !GENERIC_LINK_TITLES.has(title.toLowerCase())) return title
  const host = resolveHostname(url)
  if (host) return host
  return title || url || 'Open link'
}

function LinkPillIcon({ provider, url }) {
  const meta = BRAND_ICON_META[provider]
  if (meta && provider !== 'any-link') {
    return <RailBrandIcon id={provider} size={14} />
  }

  const host = resolveHostname(url)
  if (host) {
    return (
      <img
        className="ppt-external-link-pill-favicon"
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
        alt=""
        loading="lazy"
        decoding="async"
      />
    )
  }

  return <FiLink size={14} aria-hidden />
}

export default function ExternalLinkHoverLayer({ content, children, className = '', style }) {
  const [hovered, setHovered] = useState(false)
  const url = String(content?.url || '').trim()
  const provider = useMemo(
    () => content?.provider || detectEmbedProvider(url) || 'any-link',
    [content?.provider, url]
  )
  const label = useMemo(() => resolveExternalLinkLabel(content), [content])

  if (!url) return children

  return (
    <div
      className={`ppt-external-link-wrap ${className}`.trim()}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {hovered && (
        <a
          className="ppt-external-link-pill"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          title={label}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <span className="ppt-external-link-pill-icon">
            <LinkPillIcon provider={provider} url={url} />
          </span>
          <span className="ppt-external-link-pill-label">{label}</span>
        </a>
      )}
    </div>
  )
}
