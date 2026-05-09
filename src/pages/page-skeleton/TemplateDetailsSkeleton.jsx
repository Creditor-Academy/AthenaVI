import './skeleton.css'

const TemplateDetailsSkeleton = () => {
  return (
    <div className="template-details-page ps-page">
      <div className="details-top-nav ps-row">
        <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ps-block ps-block--line" style={{ height: 40, width: 48 }} />
          <div className="ps-block ps-block--line" style={{ height: 40, width: 140 }} />
        </div>
      </div>

      <div className="template-feature-head" style={{ display: 'grid', gap: 16, gridTemplateColumns: '2fr 1.2fr' }}>
        <div className="ps-block" style={{ height: 300 }} />
        <div className="ps-stack">
          <div className="ps-block ps-block--line" style={{ height: 30, width: '80%' }} />
          <div className="ps-block ps-block--line" style={{ height: 16, width: '100%' }} />
          <div className="ps-block ps-block--line" style={{ height: 16, width: '92%' }} />
          <div className="ps-chip-row">
            <div className="ps-block" style={{ height: 84, width: 110 }} />
            <div className="ps-block" style={{ height: 84, width: 110 }} />
            <div className="ps-block" style={{ height: 84, width: 110 }} />
          </div>
        </div>
      </div>

      <div className="template-slides-breakdown ps-stack">
        <div className="ps-block ps-block--line" style={{ height: 28, width: 210 }} />
        <div className="ps-block" style={{ height: 86 }} />
        <div className="ps-block" style={{ height: 86 }} />
        <div className="ps-block" style={{ height: 86 }} />
        <div className="ps-block" style={{ height: 86 }} />
        <div className="ps-block" style={{ height: 86 }} />
      </div>

      <div className="cta-block-bottom ps-block" style={{ height: 110 }} />
    </div>
  )
}

export default TemplateDetailsSkeleton
