import { useState } from 'react'
import { Send, LayoutTemplate, Inbox } from 'lucide-react'
import ComposeTab from './broadcast/tabs/ComposeTab'
import TemplatesTab from './broadcast/tabs/TemplatesTab'
import HistoryTab from './broadcast/tabs/HistoryTab'
import '../../../../pages/AdminPortal/styles/SuperadminBase.css'
import '../../../../pages/AdminPortal/styles/SuperadminBroadcast.css'

const MAIN_TABS = [
  { id: 'compose', label: 'Compose Broadcast', icon: Send },
  { id: 'templates', label: 'Email Templates', icon: LayoutTemplate },
  { id: 'history', label: 'Broadcast History', icon: Inbox },
]

export default function SuperadminBroadcastPanel() {
  const [activeTab, setActiveTab] = useState('compose')
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0)
  const [composeSeedData, setComposeSeedData] = useState(null)

  const handleUseTemplateInCompose = (template) => {
    setComposeSeedData({
      subject: template.subject || '',
      html: template.htmlBody || '',
      text: template.textBody || '',
    })
    setActiveTab('compose')
  }

  const handleReuseBroadcastInCompose = (broadcast) => {
    setComposeSeedData({
      subject: broadcast.subject || '',
      html: broadcast.htmlBody || broadcast.html || '',
      text: broadcast.textBody || broadcast.text || '',
    })
    setActiveTab('compose')
  }

  return (
    <div className="sa-broadcast-panel sa-panel">
      {/* ── Page Header ── */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">Email Broadcast & Templates</h2>
          <p className="sa-panel-desc">
            Design rich CRM email templates (HTML, Visual Design & Plain Text), dispatch platform broadcasts, and track delivery history with resend options.
          </p>
        </div>
      </div>

      {/* ── Main Data Card with Navigation Tabs & Panel Content ── */}
      <div className="sa-table-card" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation Tabs Toolbar */}
        <div className="sa-table-toolbar" style={{ borderBottom: '1px solid color-mix(in srgb, var(--border-color) 35%, transparent)' }}>
          <div className="sa-filter-tabs" role="tablist" aria-label="Broadcast Navigation Tabs">
            {MAIN_TABS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`sa-filter-tab${active ? ' active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {activeTab === 'compose' && (
            <ComposeTab
              initialData={composeSeedData}
              onSent={() => {
                setHistoryRefreshKey((k) => k + 1)
              }}
              onOpenTemplatesTab={() => setActiveTab('templates')}
            />
          )}

          {activeTab === 'templates' && (
            <TemplatesTab
              onUseInCompose={handleUseTemplateInCompose}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              refreshKey={historyRefreshKey}
              onReuseInCompose={handleReuseBroadcastInCompose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
