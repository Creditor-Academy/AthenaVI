import { coercePlainText } from '../../../utils/pptTextContent'
import { getSlideImage } from '../../../utils/presentationHelpers'

/**
 * What a slide with no elements shows: its title, subtitle / body, description (a list or a
 * paragraph) and its image. The editor and the export page both draw this, so exports match
 * the editor; `data-export-fallback` marks the parts the export page measures for PPTX.
 */
export default function SlideMockFallback({ slide, themeVisual }) {
  const title = coercePlainText(slide?.title || slide?.content?.title)
  const body = coercePlainText(
    slide?.subtitle ||
      slide?.content?.subtitle ||
      slide?.content?.body ||
      (typeof slide?.content === 'string' ? slide.content : '')
  )
  const description = slide?.description
  const items = Array.isArray(description) ? description.map(coercePlainText).filter(Boolean) : []
  const paragraph = Array.isArray(description) ? '' : coercePlainText(description)
  const image = getSlideImage(slide).url

  return (
    <div className="aig-slide-mock" data-export-fallback="slide">
      <h1 className="aig-slide-mock-title" style={{ color: themeVisual?.title }} data-export-fallback="title">
        {title}
      </h1>
      {body ? (
        <p className="aig-slide-mock-body" data-export-fallback="body">
          {body}
        </p>
      ) : null}
      {items.length ? (
        <div className="aig-slide-mock-text" style={{ color: themeVisual?.body }}>
          <ul style={{ paddingLeft: '32px', margin: 0 }}>
            {items.map((line, i) => (
              <li key={i} style={{ marginBottom: '12px' }} data-export-fallback="item">
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : paragraph ? (
        <div className="aig-slide-mock-text" style={{ color: themeVisual?.body }}>
          <p style={{ margin: 0 }} data-export-fallback="paragraph">
            {paragraph}
          </p>
        </div>
      ) : null}
      {image ? (
        <div className="aig-slide-mock-visual" data-export-fallback="visual">
          <img className="aig-slide-mock-image" src={image} alt="" data-export-fallback="image" />
        </div>
      ) : null}
    </div>
  )
}
