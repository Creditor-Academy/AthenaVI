export function SectionHead({ icon, title, hint }) {
  const Icon = icon
  return (
    <div className="customize-card-head">
      <div className="customize-icon" aria-hidden>
        {Icon ? <Icon size={18} /> : null}
      </div>
      <div>
        <h3 className="customize-title">{title}</h3>
        {hint ? <p className="customize-hint">{hint}</p> : null}
      </div>
    </div>
  )
}
