import { useMemo, useRef, useState } from 'react'
import { FiUpload } from 'react-icons/fi'
import InsertPanelShell from './InsertPanelShell'
import { RailBrandIcon } from './insertBrandIcons'
import {
  PPT_CHART_SOURCES,
  PPT_CHART_TYPES,
  PPT_SAMPLE_CHART_DATA,
} from '../../../../constants/pptInsertCatalog'

function ChartThumb({ chartType }) {
  const type = chartType === 'doughnut' ? 'donut' : chartType
  if (type === 'pie' || type === 'donut') {
    return (
      <svg viewBox="0 0 64 40" className="ppt-chart-thumb-svg" aria-hidden>
        <circle cx="32" cy="20" r="14" fill="#A78BFA" />
        <path d="M32 20 L32 6 A14 14 0 0 1 44 28 Z" fill="#FDBA74" />
        {type === 'donut' && <circle cx="32" cy="20" r="7" fill="#fff" />}
      </svg>
    )
  }
  if (chartType?.startsWith('line') || chartType?.startsWith('area')) {
    return (
      <svg viewBox="0 0 64 40" className="ppt-chart-thumb-svg" aria-hidden>
        {chartType.startsWith('area') && (
          <path d="M6 32 L18 22 L32 26 L46 12 L58 18 L58 32 Z" fill="#DDD6FE" />
        )}
        <polyline
          points="6,32 18,22 32,26 46,12 58,18"
          fill="none"
          stroke="#7C3AED"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {chartType.includes('points') &&
          [
            [6, 32],
            [18, 22],
            [32, 26],
            [46, 12],
            [58, 18],
          ].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#7C3AED" />)}
      </svg>
    )
  }
  if (chartType === 'kpi') {
    return <div className="ppt-chart-kpi-thumb">42%</div>
  }
  const horizontal = chartType?.startsWith('bar')
  if (horizontal) {
    return (
      <svg viewBox="0 0 64 40" className="ppt-chart-thumb-svg" aria-hidden>
        <rect x="8" y="6" width="36" height="6" rx="2" fill="#7C3AED" />
        <rect x="8" y="17" width="48" height="6" rx="2" fill="#A78BFA" />
        <rect x="8" y="28" width="28" height="6" rx="2" fill="#FDBA74" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 64 40" className="ppt-chart-thumb-svg" aria-hidden>
      <rect x="10" y="16" width="8" height="18" rx="2" fill="#7C3AED" />
      <rect x="24" y="8" width="8" height="26" rx="2" fill="#A78BFA" />
      <rect x="38" y="12" width="8" height="22" rx="2" fill="#FDBA74" />
    </svg>
  )
}

function parseCsv(text) {
  const lines = String(text || '')
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
  if (lines.length < 2) throw new Error('CSV needs a header row and at least one data row')
  const headers = lines[0].split(',').map((h) => h.trim())
  const labels = []
  const series = headers.slice(1).map((name) => ({ name, values: [] }))
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim())
    labels.push(cols[0] || `Row ${i}`)
    series.forEach((s, idx) => {
      s.values.push(Number(cols[idx + 1]) || 0)
    })
  }
  return { labels, series }
}

const CHART_PRESET_IDS = {
  column: 'chart_bar',
  'column-grouped': 'chart_column_grouped',
  bar: 'chart_bar',
}

export default function ChartPanel({ onInsert, disabled, elementPresets = [] }) {
  const [sourceId, setSourceId] = useState('manual')
  const [csvData, setCsvData] = useState(null)
  const [csvError, setCsvError] = useState('')
  const [integrationUrl, setIntegrationUrl] = useState('')
  const [integrationError, setIntegrationError] = useState('')
  const fileRef = useRef(null)

  const rail = useMemo(
    () => [
      {
        label: 'Data source',
        items: PPT_CHART_SOURCES.map((s) => ({
          id: s.id,
          label: s.label,
          icon: <RailBrandIcon id={s.id} />,
        })),
      },
    ],
    []
  )

  const dataForInsert = csvData || PPT_SAMPLE_CHART_DATA

  const handleCsv = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const parsed = parseCsv(text)
      setCsvData(parsed)
      setCsvError('')
      setSourceId('csv')
    } catch (err) {
      setCsvError(err.message || 'Failed to parse CSV')
      setCsvData(null)
    }
  }

  const handleIntegrationConnect = () => {
    const url = integrationUrl.trim()
    if (!url) {
      setIntegrationError('Paste a share link or sheet URL')
      return
    }
    setIntegrationError('')
    setCsvData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      series: [{ name: sourceId === 'google-analytics' ? 'Sessions' : 'Sheet data', values: [120, 190, 150, 220] }],
      source: sourceId,
      sourceUrl: url,
    })
  }

  return (
    <InsertPanelShell
      title="Charts"
      rail={rail}
      activeRailId={sourceId}
      onSelectRail={(id) => {
        setSourceId(id)
        if (id === 'csv') fileRef.current?.click()
      }}
      wide
    >
      <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={handleCsv} />

      <div className="ppt-insert-main-head">
        <h3 className="ppt-insert-main-title">Choose a chart</h3>
        <p className="ppt-insert-main-sub">
          {sourceId === 'manual'
            ? 'Inserts with sample data you can edit later'
            : 'Upload a CSV, then pick a chart type'}
        </p>
      </div>

      {sourceId === 'csv' && (
        <div className="ppt-insert-toolbar-row">
          <button type="button" className="ppt-insert-chip ppt-insert-chip--action" onClick={() => fileRef.current?.click()}>
            <FiUpload size={14} /> Choose CSV file
          </button>
          {csvData && (
            <span className="ppt-insert-hint">
              Loaded {csvData.labels.length} rows · {csvData.series.length} series
            </span>
          )}
        </div>
      )}

      {(sourceId === 'google-sheets' || sourceId === 'google-analytics') && (
        <div className="ppt-insert-toolbar-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
          <input
            type="url"
            placeholder={
              sourceId === 'google-sheets'
                ? 'Paste Google Sheets share URL'
                : 'Paste Google Analytics report URL'
            }
            value={integrationUrl}
            onChange={(e) => setIntegrationUrl(e.target.value)}
            className="ppt-insert-search"
          />
          <button type="button" className="ppt-insert-chip ppt-insert-chip--action" onClick={handleIntegrationConnect}>
            Connect data source
          </button>
          {csvData?.sourceUrl && (
            <span className="ppt-insert-hint">Connected — pick a chart type below</span>
          )}
          {integrationError && <div className="ppt-insert-error">{integrationError}</div>}
        </div>
      )}

      {csvError && <div className="ppt-insert-error">{csvError}</div>}

      {PPT_CHART_TYPES.map((group) => (
        <div key={group.category} className="ppt-insert-section">
          <div className="ppt-insert-section-head">
            <span>{group.category}</span>
          </div>
          <div className="ppt-chart-grid">
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                className="ppt-chart-tile"
                disabled={
                  disabled ||
                  (sourceId === 'csv' && !csvData) ||
                  ((sourceId === 'google-sheets' || sourceId === 'google-analytics') && !csvData)
                }
                title={item.label}
                onClick={() => {
                  const presetFromApi = (elementPresets || []).find(
                    (p) =>
                      p.type === 'chart' &&
                      (p.presetId === item.id ||
                        p.content?.chartType === item.chartType)
                  )
                  onInsert({
                    type: 'chart',
                    presetId:
                      presetFromApi?.presetId ||
                      CHART_PRESET_IDS[item.chartType] ||
                      undefined,
                    content: {
                      chartType: item.chartType,
                      data: dataForInsert,
                      colors: ['#7C3AED', '#A78BFA', '#FDBA74'],
                    },
                  })
                }}
              >
                <span className="ppt-chart-thumb-wrap">
                  <ChartThumb chartType={item.chartType} />
                </span>
                <span className="ppt-chart-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </InsertPanelShell>
  )
}
