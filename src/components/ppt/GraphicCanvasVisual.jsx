import useGraphicSvg, { resolveGraphicThemeColor } from '../../hooks/useGraphicSvg'

/** Hit-test painted strokes/fills only so empty SVG boxes don't steal clicks. */
function svgWithPaintHits(markup) {
  if (typeof markup !== 'string' || !markup.includes('<svg')) return markup
  return markup.replace(/<svg\b([^>]*)>/i, (_, attrs = '') => {
    let next = attrs
    if (!/pointer-events=/i.test(next)) next += ' pointer-events="visiblePainted"'
    if (!/style=/i.test(next)) next += ' style="width:100%;height:100%;display:block"'
    return `<svg${next}>`
  })
}

/**
 * Render a catalog SVG graphic on the PPT canvas / insert panel.
 *
 * - fixed: always show the real SVG via <img>
 * - recolorable: only tint when the SVG uses currentColor (inline);
 *   otherwise show the original multi-color artwork (never CSS mask silhouettes)
 */
export default function GraphicCanvasVisual({ content = {}, palette = {}, style = {} }) {
  const rawSrc = content.src || content.url || content.previewUrl
  const inlineMarkup = typeof content.svg === 'string' && content.svg.includes('<svg') ? content.svg : null
  const colorMode = content.colorMode || 'fixed'
  const wantRecolor = colorMode === 'recolorable'
  const { imgSrc, inlineSvg } = useGraphicSvg(rawSrc, { preferInline: wantRecolor })
  const themeColor = resolveGraphicThemeColor(content, palette)

  const boxStyle = {
    ...style,
    width: style.width || '100%',
    height: style.height || '100%',
    background: 'transparent',
  }

  if (inlineMarkup) {
    return (
      <div
        style={{
          ...boxStyle,
          color: themeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
        role="img"
        aria-label={content.alt || 'Graphic'}
        dangerouslySetInnerHTML={{
          __html: svgWithPaintHits(inlineMarkup),
        }}
      />
    )
  }

  if (!rawSrc) {
    return <div style={boxStyle} aria-hidden />
  }

  if (wantRecolor && inlineSvg) {
    return (
      <div
        style={{
          ...boxStyle,
          color: themeColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label={content.alt || 'Graphic'}
        dangerouslySetInnerHTML={{ __html: svgWithPaintHits(inlineSvg) }}
      />
    )
  }

  if (!imgSrc) {
    return <div style={boxStyle} aria-hidden />
  }

  return (
    <img
      src={imgSrc}
      alt={content.alt || ''}
      draggable={false}
      style={{
        ...boxStyle,
        objectFit: content.fit || 'contain',
        display: 'block',
      }}
    />
  )
}
