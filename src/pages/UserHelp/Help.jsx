import { useState } from 'react'
import {
  MdSearch,
  MdPlayCircleOutline,
  MdSmartToy,
  MdRecordVoiceOver,
  MdDashboardCustomize,
  MdAccountCircle,
  MdBolt,
  MdKeyboardArrowRight,
  MdChatBubbleOutline,
  MdMail,
  MdBook,
  MdVideoLibrary,
  MdAutoAwesome,
  MdChecklist,
  MdTune,
  MdGroups,
  MdExpandMore,
  MdMenu,
  MdClose,
} from 'react-icons/md'
import './Help.css'

const sidebarItems = [
  { id: 'start', icon: <MdBolt />, label: 'Getting Started', color: '#6366f1', bg: '#eef2ff' },
  { id: 'videos', icon: <MdVideoLibrary />, label: 'Creating Videos', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'avatars', icon: <MdSmartToy />, label: 'AI Avatars', color: '#06b6d4', bg: '#ecfeff' },
  { id: 'voice', icon: <MdRecordVoiceOver />, label: 'Voice & Audio', color: '#10b981', bg: '#ecfdf5' },
  { id: 'templates', icon: <MdDashboardCustomize />, label: 'Templates', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'account', icon: <MdAccountCircle />, label: 'Account & Billing', color: '#f43f5e', bg: '#fff1f2' },
]

const quickLinks = [
  { icon: <MdVideoLibrary />, label: 'Video Tutorials', desc: 'Watch step-by-step guides', color: '#6366f1', bg: '#e0e7ff' },
  { icon: <MdChatBubbleOutline />, label: 'Live Chat', desc: 'Get instant help', color: '#10b981', bg: '#d1fae5' },
  { icon: <MdMail />, label: 'Email Us', desc: 'Response within 24h', color: '#f43f5e', bg: '#ffe4e6' },
]

const articles = {
  start: [
    { title: 'Quick Start: Your First Video', readTime: '3 min', tag: 'Beginner' },
    { title: 'Understanding the Dashboard', readTime: '4 min', tag: 'Beginner' },
    { title: 'Projects vs Workspaces', readTime: '5 min', tag: 'Intermediate' },
    { title: 'Keyboard Shortcuts', readTime: '2 min', tag: 'Tips' },
  ],
  videos: [
    { title: 'Creating a New Project', readTime: '4 min', tag: 'Beginner' },
    { title: 'Working with Scenes', readTime: '6 min', tag: 'Intermediate' },
    { title: 'Adding Transitions', readTime: '3 min', tag: 'Beginner' },
    { title: 'Export Settings', readTime: '5 min', tag: 'Advanced' },
  ],
  avatars: [
    { title: 'Choosing an AI Avatar', readTime: '4 min', tag: 'Beginner' },
    { title: 'Custom Avatar Creation', readTime: '8 min', tag: 'Advanced' },
    { title: 'Avatar Gestures', readTime: '3 min', tag: 'Tips' },
    { title: 'Supported Languages', readTime: '2 min', tag: 'Reference' },
  ],
  voice: [
    { title: 'Voice Cloning Guide', readTime: '6 min', tag: 'Intermediate' },
    { title: 'Adding Background Music', readTime: '3 min', tag: 'Beginner' },
    { title: 'Audio Mixing', readTime: '5 min', tag: 'Intermediate' },
    { title: 'Supported Formats', readTime: '2 min', tag: 'Reference' },
  ],
  templates: [
    { title: 'Using Templates', readTime: '3 min', tag: 'Beginner' },
    { title: 'Customizing Colors & Fonts', readTime: '4 min', tag: 'Intermediate' },
    { title: 'Saving Custom Templates', readTime: '3 min', tag: 'Tips' },
    { title: 'Template Categories', readTime: '2 min', tag: 'Reference' },
  ],
  account: [
    { title: 'Managing Subscription', readTime: '3 min', tag: 'Beginner' },
    { title: 'Understanding Credits', readTime: '4 min', tag: 'Intermediate' },
    { title: 'Inviting Team Members', readTime: '3 min', tag: 'Beginner' },
    { title: 'Billing & Invoices', readTime: '2 min', tag: 'Reference' },
  ],
}

const faqs = [
  { q: 'How many videos can I create?', a: 'Starter: 5/month, Pro: 30/month, Business: Unlimited. Check Credits page for your current usage.' },
  { q: 'Can I use my own voice?', a: 'Yes! Upload a 30+ second audio sample in the Voices section to clone your voice.' },
  { q: 'How do I share videos?', a: 'Click Share in the video viewer to generate a public or private link. No account needed to view.' },
  { q: 'What formats can I export?', a: 'MP4 (H.264) in 720p, 1080p, or 4K. WebM and direct social uploads coming soon.' },
]

function Help() {
  const [activeTab, setActiveTab] = useState('start')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)

  const activeArticles = articles[activeTab] || []
  const activeCategory = sidebarItems.find(item => item.id === activeTab)

  const filteredArticles = searchQuery
    ? Object.values(articles).flat().filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : activeArticles

  return (
    <div className="help-page">
      {/* Header */}
      <header className="help-header">
        <div className="header-content">
          <div className="header-left">
            <MdAutoAwesome className="logo-icon" />
            <span className="logo-text">Help Center</span>
          </div>
          <div className="header-search">
            <MdSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <MdClose /> : <MdMenu />}
          </button>
        </div>
      </header>

      <div className="help-layout">
        {/* Sidebar */}
        <aside className={`help-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="sidebar-section">
            <h3 className="sidebar-title">Categories</h3>
            <nav className="sidebar-nav">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSearchQuery('')
                    setMobileMenuOpen(false)
                  }}
                  style={{ '--accent-color': item.color, '--accent-bg': item.bg }}
                >
                  <span className="link-icon" style={{ background: item.bg, color: item.color }}>{item.icon}</span>
                  <span className="link-label">{item.label}</span>
                  <MdKeyboardArrowRight className="link-arrow" />
                </button>
              ))}
            </nav>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Need Help?</h3>
            <div className="quick-links">
              {quickLinks.map((link, idx) => (
                <button key={idx} className="quick-link" style={{ '--accent-color': link.color }}>
                  <span className="quick-link-icon" style={{ background: link.bg, color: link.color }}>{link.icon}</span>
                  <div className="quick-link-info">
                    <span className="quick-link-label">{link.label}</span>
                    <span className="quick-link-desc">{link.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="help-main">
          {searchQuery ? (
            <div className="content-section">
              <h1 className="page-title">Search Results</h1>
              <p className="page-subtitle">Found {filteredArticles.length} articles matching "{searchQuery}"</p>
              <div className="articles-list">
                {filteredArticles.map((article, idx) => (
                  <div key={idx} className="article-card">
                    <div className="article-content">
                      <h3 className="article-title">{article.title}</h3>
                      <div className="article-meta">
                        <span className="tag">{article.tag}</span>
                        <span className="read-time">{article.readTime} read</span>
                      </div>
                    </div>
                    <MdKeyboardArrowRight className="article-arrow" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Hero Section */}
              <div className="content-hero">
                <div className="hero-icon-large" style={{ background: activeCategory?.bg, color: activeCategory?.color }}>
                  {activeCategory?.icon}
                </div>
                <h1 className="page-title">{activeCategory?.label}</h1>
                <p className="page-subtitle">
                  {activeTab === 'start' && 'Everything you need to get started with AthenaVI'}
                  {activeTab === 'videos' && 'Learn to create, edit, and publish professional AI videos'}
                  {activeTab === 'avatars' && 'Browse, customize, and use AI presenters in your videos'}
                  {activeTab === 'voice' && 'Clone voices, manage voiceovers, and configure audio settings'}
                  {activeTab === 'templates' && 'Discover, use, and customize video templates'}
                  {activeTab === 'account' && 'Manage your subscription, credits, and team members'}
                </p>
              </div>

              {/* Articles Grid */}
              <div className="content-section">
                <div className="section-header">
                  <h2 className="section-title">Articles</h2>
                  <span className="article-count">{activeArticles.length} articles</span>
                </div>
                <div className="articles-list">
                  {activeArticles.map((article, idx) => (
                    <div key={idx} className="article-card">
                      <div className="article-content">
                        <h3 className="article-title">{article.title}</h3>
                        <div className="article-meta">
                          <span className="tag">{article.tag}</span>
                          <span className="read-time">{article.readTime} read</span>
                        </div>
                      </div>
                      <MdKeyboardArrowRight className="article-arrow" />
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="content-section">
                <h2 className="section-title">Frequently Asked Questions</h2>
                <div className="faq-list">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className={`faq-item ${expandedFaq === idx ? 'expanded' : ''}`}>
                      <button 
                        className="faq-question"
                        onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      >
                        <span>{faq.q}</span>
                        <MdExpandMore className="faq-chevron" />
                      </button>
                      {expandedFaq === idx && (
                        <div className="faq-answer">{faq.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Help
