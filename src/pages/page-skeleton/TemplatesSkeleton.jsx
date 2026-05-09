import './skeleton.css'

const TemplatesSkeleton = () => {
  return (
    <div className="templates-page ps-page">
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'minmax(180px, 240px) 1fr' }}>
        <aside className="templates-sidebar ps-stack">
          <div className="ps-block ps-block--line" style={{ height: 28, width: 110 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
          <div className="ps-block ps-block--line" style={{ height: 40 }} />
        </aside>

        <section className="templates-main ps-stack">
          <div className="templates-header ps-row" style={{ justifyContent: 'space-between' }}>
            <div className="ps-stack" style={{ gap: 8 }}>
              <div className="ps-block ps-block--line" style={{ height: 30, width: 240 }} />
              <div className="ps-block ps-block--line" style={{ height: 16, width: 380 }} />
            </div>
            <div className="ps-block ps-block--line" style={{ height: 42, width: 320 }} />
          </div>
          <div className="template-grid-main ps-grid ps-grid--3">
            <div className="ps-block" style={{ height: 192 }} />
            <div className="ps-block" style={{ height: 192 }} />
            <div className="ps-block" style={{ height: 192 }} />
            <div className="ps-block" style={{ height: 192 }} />
            <div className="ps-block" style={{ height: 192 }} />
            <div className="ps-block" style={{ height: 192 }} />
          </div>
        </section>
      </div>
    </div>
  )
}

export default TemplatesSkeleton
