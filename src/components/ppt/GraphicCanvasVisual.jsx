import useGraphicSvg, { resolveGraphicThemeColor } from '../../hooks/useGraphicSvg'

/**
 * Render a catalog SVG graphic on the PPT canvas / insert panel.
 *
 * - fixed: always show the real SVG via <img>
 * - recolorable: only tint when the SVG uses currentColor (inline);
 *   otherwise show the original multi-color artwork (never CSS mask silhouettes)
 */
export default function GraphicCanvasVisual({ content = {}, palette = {}, style = {} }) {
  const rawSrc = content.src || content.url || content.previewUrl
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
        dangerouslySetInnerHTML={{ __html: inlineSvg }}
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
