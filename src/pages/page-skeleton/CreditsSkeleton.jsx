import './skeleton.css'

const CreditsSkeleton = () => {
  return (
    <div className="settings-page settings-shell ps-page">
      <div className="settings-page-header ps-row" style={{ justifyContent: 'flex-start' }}>
        <div className="ps-block ps-block--line" style={{ height: 32, width: 190 }} />
      </div>

      <div className="settings-tab-switch ps-chip-row">
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
        <div className="ps-block ps-block--line" style={{ height: 34, width: 110 }} />
      </div>

      <div className="settings-main ps-stack">
        <div className="ps-block" style={{ height: 220 }} />
        <div className="ps-block" style={{ height: 220 }} />
      </div>
    </div>
  )
}

export default CreditsSkeleton
