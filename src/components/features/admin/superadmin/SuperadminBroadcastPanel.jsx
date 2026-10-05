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
      {/* Page Header */}
      <div className="sa-panel-header">
        <div className="sa-panel-header-title-group">
          <h2 className="sa-panel-title">Email Broadcast & Templates</h2>
          <p className="sa-panel-desc">
            Design rich CRM email templates (HTML, Visual Design & Plain Text), dispatch platform broadcasts, and track delivery history with resend options.
          </p>
        </div>
      </div>

      {/* Main Tab Bar */}
      <div className="sa-tab-bar" style={{ flexShrink: 0 }}>
        {MAIN_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`sa-tab${activeTab === id ? ' sa-tab--active' : ''}`}
            onClick={() => setActiveTab(id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content Container */}
      <div className="sa-table-card" style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'compose' && (
          <ComposeTab
            initialData={composeSeedData}
            onSent={() => setHistoryRefreshKey((k) => k + 1)}
            onOpenTemplatesTab={() => setActiveTab('templates')}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab onUseInCompose={handleUseTemplateInCompose} />
        )}

        {activeTab === 'history' && (
          <HistoryTab
            refreshKey={historyRefreshKey}
            onReuseInCompose={handleReuseBroadcastInCompose}
          />
        )}
      </div>
    </div>
  )
}
