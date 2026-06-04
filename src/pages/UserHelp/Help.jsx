import { useState, useEffect } from 'react'
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
  MdConfirmationNumber,
  MdSend,
  MdArrowBack,
  MdAdd,
} from 'react-icons/md'
import './Help.css'

const sidebarItems = [
  { id: 'start', icon: <MdBolt />, label: 'Getting Started', color: '#6366f1', bg: '#eef2ff' },
  { id: 'videos', icon: <MdVideoLibrary />, label: 'Creating Videos', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'avatars', icon: <MdSmartToy />, label: 'AI Avatars', color: '#06b6d4', bg: '#ecfeff' },
  { id: 'voice', icon: <MdRecordVoiceOver />, label: 'Voice & Audio', color: '#10b981', bg: '#ecfdf5' },
  { id: 'templates', icon: <MdDashboardCustomize />, label: 'Templates', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'account', icon: <MdAccountCircle />, label: 'Account & Billing', color: '#f43f5e', bg: '#fff1f2' },
  { id: 'tickets', icon: <MdConfirmationNumber />, label: 'My Tickets', color: '#10b981', bg: '#ecfdf5' },
]

const quickLinks = [
  { icon: <MdVideoLibrary />, label: 'Video Tutorials', desc: 'Watch step-by-step guides', color: '#6366f1', bg: '#e0e7ff' },
  { icon: <MdConfirmationNumber />, label: 'Create Ticket', desc: 'Submit a request', color: '#10b981', bg: '#d1fae5' },
  { icon: <MdMail />, label: 'Email Us', desc: 'Response within 24h', color: '#f43f5e', bg: '#ffe4e6' },
]

const initialTickets = [
  {
    id: 'ATH-4821',
    subject: 'Billing discrepancy with premium subscription',
    category: 'Billing',
    description: 'I was charged twice for the premium plan this month. Please refund the duplicate charge.',
    status: 'In Progress',
    priority: 'High',
    created: '2026-05-18T09:12:00.000Z',
    messages: [
      { sender: 'user', text: 'I was charged twice for the premium plan this month. Please refund the duplicate charge.', time: '2026-05-18T09:12:00.000Z' },
      { sender: 'agent', text: 'Hi! Thank you for reaching out. We have flagged this duplicate charge for our billing department. You should see a refund reflected in 2-3 business days. We apologize for the inconvenience!', time: '2026-05-18T10:05:00.000Z' }
    ]
  },
  {
    id: 'ATH-1029',
    subject: 'AI avatar rendering lag on 4K exports',
    category: 'Technical',
    description: 'When rendering standard 4K videos, the avatar lip sync lags behind the audio tract by about 2 seconds.',
    status: 'Resolved',
    priority: 'Medium',
    created: '2026-05-15T14:30:00.000Z',
    messages: [
      { sender: 'user', text: 'When rendering standard 4K videos, the avatar lip sync lags behind the audio tract by about 2 seconds.', time: '2026-05-15T14:30:00.000Z' },
      { sender: 'agent', text: 'Hello! This issue has been resolved in our latest update (v7.2.1). Please clear your browser cache and try rendering the scene again. Let us know if you continue to experience latency!', time: '2026-05-16T08:15:00.000Z' }
    ]
  }
]

const tutorialVideos = [
  {
    id: 'vid1',
    title: 'Quick Start: Your First AI Video',
    duration: '2:15',
    desc: 'Learn the basic workflow to create and export your first professional AI presenter video in minutes.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-holding-a-smartphone-with-a-blank-screen-on-a-blue-background-41481-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'vid2',
    title: 'Advanced AI Avatar Customization',
    duration: '4:40',
    desc: 'Deep dive into standard facial gestures, customizing layout backgrounds, and cloning custom voices.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-working-at-her-desk-in-front-of-a-computer-43034-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  },
  {
    id: 'vid3',
    title: 'Collaborating in Shared Workspaces',
    duration: '3:10',
    desc: 'Configure team member access, publish corporate brand templates, and manage credit sharing settings.',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-group-of-friends-working-at-a-desk-with-a-laptop-42996-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
  }
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

  useEffect(() => {
    const previousMode = document.documentElement.getAttribute('data-mode')
    const previousClassName = document.documentElement.className

    document.documentElement.setAttribute('data-mode', 'light')
    document.documentElement.className = previousClassName.replace(/\bmode-[^\s]+\b/, 'mode-light')

    return () => {
      if (previousMode) {
        document.documentElement.setAttribute('data-mode', previousMode)
      } else {
        document.documentElement.removeAttribute('data-mode')
      }
      document.documentElement.className = previousClassName
    }
  }, [])

  // Ticketing states
  const [tickets, setTickets] = useState(() => {
    const saved = localStorage.getItem('athena_support_tickets')
    return saved ? JSON.parse(saved) : initialTickets
  })

  useEffect(() => {
    localStorage.setItem('athena_support_tickets', JSON.stringify(tickets))
  }, [tickets])

  const [activeTicket, setActiveTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showVideosModal, setShowVideosModal] = useState(false)
  const [activeVideo, setActiveVideo] = useState(null)

  // Create ticket states
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Technical')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeArticles = articles[activeTab] || []
  const activeCategory = sidebarItems.find(item => item.id === activeTab)

  const filteredArticles = searchQuery
    ? Object.values(articles).flat().filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : activeArticles

  // Handlers
  const handleQuickLinkClick = (label) => {
    if (label === 'Create Ticket') {
      setShowCreateModal(true)
    } else if (label === 'Video Tutorials') {
      setShowVideosModal(true)
    } else if (label === 'Email Us') {
      window.open('mailto:support@athenavi.com?subject=AthenaVI%20Support%20Request', '_blank')
    }
  }

  const handleCreateTicket = (e) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) return

    setIsSubmitting(true)

    setTimeout(() => {
      const newTicket = {
        id: `ATH-${Math.floor(1000 + Math.random() * 9000)}`,
        subject,
        category,
        priority,
        description,
        status: 'Open',
        created: new Date().toISOString(),
        messages: [
          { sender: 'user', text: description, time: new Date().toISOString() }
        ]
      }

      setTickets([newTicket, ...tickets])
      setIsSubmitting(false)
      setShowCreateModal(false)

      // Reset form
      setSubject('')
      setDescription('')
      setCategory('Technical')
      setPriority('Medium')

      // Switch to tickets tab and select the new ticket
      setActiveTab('tickets')
      setActiveTicket(newTicket)
    }, 1200)
  }

  const handleReplyMessage = (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !activeTicket) return

    const newMessage = {
      sender: 'user',
      text: replyMessage,
      time: new Date().toISOString()
    }

    const updatedMessages = [...activeTicket.messages, newMessage]
    const updatedTicket = { ...activeTicket, messages: updatedMessages, status: 'In Progress' }

    const updatedTickets = tickets.map(t => t.id === activeTicket.id ? updatedTicket : t)
    setTickets(updatedTickets)
    setActiveTicket(updatedTicket)
    setReplyMessage('')

    // Simulated agent reply after 1.5 seconds
    setTimeout(() => {
      const agentMessage = {
        sender: 'agent',
        text: `Thanks for the details! Our specialized support staff has been notified of your update on ticket ${activeTicket.id}. An expert is reviewing this now and will get back to you shortly.`,
        time: new Date().toISOString()
      }

      const finalMessages = [...updatedMessages, agentMessage]
      const finalTicket = { ...updatedTicket, messages: finalMessages }

      setTickets(tickets => tickets.map(t => t.id === activeTicket.id ? finalTicket : t))
      if (activeTicket.id === finalTicket.id) {
        setActiveTicket(finalTicket)
      }
    }, 1500)
  }

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
                    setActiveTicket(null)
                    setSearchQuery('')
                    setMobileMenuOpen(false)
                  }}
                  style={{ '--accent-color': item.color, '--accent-bg': item.bg }}
                >
                  <span className="link-icon" style={{ color: item.color }}>{item.icon}</span>
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
                <button
                  key={idx}
                  className="quick-link"
                  style={{ '--accent-color': link.color }}
                  onClick={() => handleQuickLinkClick(link.label)}
                >
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
          <div className="help-main-content">
            {activeTab === 'tickets' ? (
              <div className="tickets-section">
                {activeTicket ? (
                  // Detailed Ticket Thread View
                  <div className="ticket-detail">
                    <button className="back-btn" onClick={() => setActiveTicket(null)}>
                      <MdArrowBack /> Back to Tickets
                    </button>

                    <div className="ticket-detail-header">
                      <div className="ticket-detail-header-top">
                        <div className="ticket-id-badge">#{activeTicket.id}</div>
                        <div className="ticket-detail-badges">
                          <span className={`status-badge status-${activeTicket.status.toLowerCase().replace(' ', '-')}`}>
                            {activeTicket.status}
                          </span>
                          <span className={`priority-badge priority-${activeTicket.priority.toLowerCase()}`}>
                            {activeTicket.priority} Priority
                          </span>
                        </div>
                      </div>
                      <h2 className="ticket-detail-subject">{activeTicket.subject}</h2>
                      <span className="ticket-detail-date">
                        Created on {new Date(activeTicket.created).toLocaleDateString()} at {new Date(activeTicket.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="ticket-thread">
                      {activeTicket.messages.map((msg, midx) => (
                        <div key={midx} className={`chat-message ${msg.sender === 'user' ? 'msg-user' : 'msg-agent'}`}>
                          <div className="chat-avatar">
                            {msg.sender === 'user' ? 'U' : 'A'}
                          </div>
                          <div className="chat-content">
                            <div className="chat-bubble">
                              <p>{msg.text}</p>
                            </div>
                            <span className="chat-time">
                              {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form className="ticket-reply-form" onSubmit={handleReplyMessage}>
                      <input
                        type="text"
                        placeholder="Type your reply message here..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="ticket-reply-input"
                        required
                      />
                      <button type="submit" className="ticket-send-btn">
                        <MdSend />
                      </button>
                    </form>
                  </div>
                ) : (
                  // Tickets Dashboard List View
                  <div className="tickets-dashboard">
                    <div className="tickets-dashboard-header">
                      <div>
                        <h1 className="page-title">Support Tickets</h1>
                        <p className="page-subtitle">Track and manage your active customer support requests.</p>
                      </div>
                      <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
                        <MdAdd /> New Ticket
                      </button>
                    </div>

                    {tickets.length === 0 ? (
                      <div className="empty-tickets">
                        <MdConfirmationNumber className="empty-icon" />
                        <h3>No tickets yet</h3>
                        <p>If you have any questions or visual technical requests, submit a ticket.</p>
                        <button className="create-ticket-btn" onClick={() => setShowCreateModal(true)}>
                          <MdAdd /> Create Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="tickets-list">
                        {tickets.map((t, idx) => (
                          <div key={idx} className="ticket-row-card" onClick={() => setActiveTicket(t)}>
                            <div className="ticket-row-main">
                              <div className="ticket-row-title-block">
                                <span className="ticket-row-id">#{t.id}</span>
                                <h3 className="ticket-row-subject">{t.subject}</h3>
                              </div>
                              <p className="ticket-row-desc">{t.description}</p>
                            </div>

                            <div className="ticket-row-status-block">
                              <span className={`status-badge status-${t.status.toLowerCase().replace(' ', '-')}`}>
                                {t.status}
                              </span>
                              <span className={`priority-badge priority-${t.priority.toLowerCase()}`}>
                                {t.priority}
                              </span>
                              <span className="ticket-row-date">
                                {new Date(t.created).toLocaleDateString()}
                              </span>
                            </div>
                            <MdKeyboardArrowRight className="ticket-row-arrow" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : searchQuery ? (
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
          </div>
        </main>
      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              <MdClose />
            </button>
            <h2 className="modal-title">Create Support Ticket</h2>
            <p className="modal-subtitle">Submit a support request to our expert team.</p>

            <form onSubmit={handleCreateTicket} className="modal-form">
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. AI presenter lipsync lag"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="General">General</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Please describe your issue in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Ticket...' : 'Submit Support Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Video Tutorials Modal */}
      {showVideosModal && (
        <div className="modal-backdrop" onClick={() => { setShowVideosModal(false); setActiveVideo(null); }}>
          <div className="modal-container video-modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => { setShowVideosModal(false); setActiveVideo(null); }}>
              <MdClose />
            </button>

            {activeVideo ? (
              <div className="video-player-view">
                <button className="back-btn" onClick={() => setActiveVideo(null)}>
                  <MdArrowBack /> Back to Tutorials
                </button>
                <h2 className="video-player-title">{activeVideo.title}</h2>
                <div className="video-viewport">
                  <video
                    key={activeVideo.id}
                    src={activeVideo.url}
                    controls
                    autoPlay
                    className="embedded-video"
                    poster={activeVideo.thumbnail}
                  />
                </div>
                <p className="video-player-desc">{activeVideo.desc}</p>

                {/* More Videos Recommendation Section */}
                <div className="more-videos-section">
                  <h3 className="more-videos-title">More Video Tutorials</h3>
                  <div className="more-videos-grid">
                    {tutorialVideos
                      .filter(video => video.id !== activeVideo.id)
                      .map((video, vidx) => (
                        <div key={vidx} className="more-video-card" onClick={() => setActiveVideo(video)}>
                          <div className="more-video-thumbnail-wrapper">
                            <img src={video.thumbnail} alt={video.title} className="more-video-thumbnail" />
                            <span className="more-video-duration">{video.duration}</span>
                          </div>
                          <div className="more-video-info">
                            <h4 className="more-video-card-title">{video.title}</h4>
                            <p className="more-video-card-desc">{video.desc}</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="modal-title">Video Tutorials</h2>
                <p className="modal-subtitle">Watch step-by-step guides to master AthenaVI.</p>

                <div className="tutorials-grid">
                  {tutorialVideos.map((video, vidx) => (
                    <div key={vidx} className="tutorial-video-card" onClick={() => setActiveVideo(video)}>
                      <div className="tutorial-thumbnail-wrapper">
                        <img src={video.thumbnail} alt={video.title} className="tutorial-thumbnail" />
                        <div className="tutorial-play-overlay">
                          <MdPlayCircleOutline className="tutorial-play-icon" />
                        </div>
                        <span className="tutorial-duration">{video.duration}</span>
                      </div>
                      <div className="tutorial-card-body">
                        <h3 className="tutorial-card-title">{video.title}</h3>
                        <p className="tutorial-card-desc">{video.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Help
