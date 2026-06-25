import './skeleton.css'

const SettingsSkeleton = () => {
  return (
    <div className="settings-page settings-shell ps-page">
      <div className="ps-block" style={{ height: 40, width: 220 }} />
      <div className="ps-block" style={{ height: 44 }} />

      <div className="settings-main ps-stack">
        <div className="ps-block" style={{ height: 180 }} />
        <div className="ps-block" style={{ height: 240 }} />
      </div>
    </div>
  )
}

export default SettingsSkeleton
