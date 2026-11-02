// One-click page colours, like Canva's background row; the picker beside them has the rest.
const PAGE_COLOR_SWATCHES = [
  '#FFFFFF',
  '#F8FAFC',
  '#F1F5F9',
  '#FEF3C7',
  '#DCFCE7',
  '#DBEAFE',
  '#FCE7F3',
  '#1E293B',
  '#000000',
]

function pageSolidHex(background) {
  if (background == null || background === '') return '#FFFFFF'
  if (typeof background === 'string') return background.toUpperCase()
  return background?.type === 'gradient' ? null : String(background?.color || '').toUpperCase()
}

/** Quick page colours shown above the full fill picker, in the inspector and the Pages drawer. */
export default function PageColorSwatches({ background, onPick }) {
  const current = pageSolidHex(background)
  return (
    <div className="canva-page-swatches" role="group" aria-label="Page colour">
      {PAGE_COLOR_SWATCHES.map((color) => (
        <button
          type="button"
          key={color}
          className={`canva-page-swatch ${current === color ? 'is-active' : ''}`}
          style={{ backgroundColor: color }}
          title={color}
          aria-label={`Page colour ${color}`}
          aria-pressed={current === color}
          onClick={() => onPick(color)}
        />
      ))}
    </div>
  )
}
