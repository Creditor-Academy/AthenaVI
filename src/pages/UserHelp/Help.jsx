import { useState } from 'react'
import {
  MdSearch,
  MdArrowBack,
  MdPlayCircleOutline,
  MdSmartToy,
  MdRecordVoiceOver,
  MdDashboardCustomize,
  MdAccountCircle,
  MdBolt,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdMail,
  MdChatBubbleOutline,
  MdOpenInNew,
  MdBook,
  MdVideoLibrary,
  MdAutoAwesome,
  MdChecklist,
  MdTune,
  MdGroups,
} from 'react-icons/md'
import './Help.css'

const categories = [
  {
    icon: <MdBolt />,
    name: 'Getting Started',
    desc: 'Set up your account, explore the dashboard, and create your first video.',
    count: 12,
    accent: '#3b82f6',
    iconBg: '#eff6ff',
  },
  {
    icon: <MdVideoLibrary />,
    name: 'Creating Videos',
    desc: 'Learn how to create, edit, and publish professional AI videos.',
    count: 18,
    accent: '#8b5cf6',
    iconBg: '#f5f3ff',
  },
  {
    icon: <MdSmartToy />,
    name: 'AI Avatars',
    desc: 'Browse, customize, and use AI presenters in your videos.',
    count: 9,
    accent: '#0891b2',
    iconBg: '#ecfeff',
  },
  {
    icon: <MdRecordVoiceOver />,
    name: 'Voice & Audio',
    desc: 'Clone voices, manage voiceovers, and configure audio settings.',
    count: 7,
    accent: '#16a34a',
    iconBg: '#f0fdf4',
  },
  {
    icon: <MdDashboardCustomize />,
    name: 'Templates',
    desc: 'Discover, use, and customize video templates for every use case.',
    count: 11,
    accent: '#ea580c',
    iconBg: '#fff7ed',
  },
  {
    icon: <MdAccountCircle />,
    name: 'Account & Billing',
    desc: 'Manage your subscription, credits, team members, and settings.',
    count: 14,
    accent: '#dc2626',
    iconBg: '#fef2f2',
  },
]

const popularArticles = [
  { icon: <MdAutoAwesome />, title: 'How to create your first AI video', tag: 'new', meta: 'Getting Started · 3 min read' },
  { icon: <MdSmartToy />, title: 'Choosing and customizing an AI avatar', tag: null, meta: 'AI Avatars · 5 min read' },
  { icon: <MdRecordVoiceOver />, title: 'Cloning your voice for voiceovers', tag: null, meta: 'Voice & Audio · 4 min read' },
  { icon: <MdTune />, title: 'Working with scenes in the Editor', tag: null, meta: 'Creating Videos · 6 min read' },
  { icon: <MdChecklist />, title: 'Publishing and sharing your video', tag: null, meta: 'Creating Videos · 3 min read' },
  { icon: <MdGroups />, title: 'Inviting teammates to your workspace', tag: 'popular', meta: 'Account · 2 min read' },
]

const gettingStartedArticles = [
  { icon: <MdBolt />, title: 'Quick-start guide: From zero to your first video', tag: 'new', meta: '5 min read' },
  { icon: <MdDashboardCustomize />, title: 'Navigating the dashboard', tag: null, meta: '3 min read' },
  { icon: <MdVideoLibrary />, title: 'Understanding projects vs. workspaces', tag: null, meta: '4 min read' },
  { icon: <MdBook />, title: 'Glossary of AthenaVI terms', tag: null, meta: '2 min read' },
]

const faqs = [
  {
    q: 'How many videos can I create with my current plan?',
    a: 'Your video creation limit depends on your subscription plan. You can check your current usage and limits on the Credits page. Starter plans include 5 videos/month, Pro includes 30, and Business plans are unlimited.',
  },
  {
    q: 'Can I use my own voice in the videos?',
    a: 'Yes! AthenaVI supports voice cloning. Go to the Voices section, upload a short audio sample (at least 30 seconds), and your cloned voice will be available across all your videos. Voice quality improves with longer, cleaner audio samples.',
  },
  {
    q: 'How do I share a video with someone who doesn\'t have an account?',
    a: 'After publishing, click the Share button in the video viewer. You can generate a public/private shareable link that works without an AthenaVI account. You can also set an expiry date or password on the shared link.',
  },
  {
    q: 'What video formats can I export?',
    a: 'You can export videos in MP4 (H.264) at 720p, 1080p, or 4K resolution. Coming soon: WebM and direct social media uploads. The export format can be changed in Settings → Export.',
  },
  {
    q: 'Can I translate my video into another language?',
    a: 'Yes. Open your video from the Library and click Translate. AthenaVI supports 70+ languages and automatically re-dubs the voiceover while keeping the original visuals intact.',
  },
  {
    q: 'How do I add my team members?',
    a: 'Go to Team Workspace from the sidebar, then click Invite Members. Enter their email address and choose a role (Editor, Viewer, or Admin). They\'ll receive an invitation email to join your workspace.',
  },
]

const videoTutorials = [
  { title: 'Creating your first video in 5 minutes', duration: '5:12', thumb: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400' },
  { title: 'Using AI Avatars effectively', duration: '7:45', thumb: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=400' },
  { title: 'Voice cloning walkthrough', duration: '4:30', thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=400' },
  { title: 'Publishing & sharing your video', duration: '3:55', thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400' },
]

const categoryArticles = {
  'Getting Started': [
    { icon: <MdBolt />, title: 'Quick-start guide: From zero to your first video', tag: 'new', meta: '5 min read' },
    { icon: <MdDashboardCustomize />, title: 'Navigating the dashboard', tag: null, meta: '3 min read' },
    { icon: <MdVideoLibrary />, title: 'Understanding projects vs. workspaces', tag: null, meta: '4 min read' },
    { icon: <MdBook />, title: 'Glossary of AthenaVI terms', tag: null, meta: '2 min read' },
    { icon: <MdAutoAwesome />, title: 'How to create your first AI video', tag: null, meta: '3 min read' },
    { icon: <MdAccountCircle />, title: 'Setting up your profile and preferences', tag: null, meta: '2 min read' },
  ],
  'Creating Videos': [
    { icon: <MdVideoLibrary />, title: 'How to create a new video project', tag: 'new', meta: '4 min read' },
    { icon: <MdTune />, title: 'Working with scenes in the Editor', tag: null, meta: '6 min read' },
    { icon: <MdChecklist />, title: 'Publishing and sharing your video', tag: null, meta: '3 min read' },
    { icon: <MdAutoAwesome />, title: 'Adding text, media and transitions', tag: null, meta: '5 min read' },
    { icon: <MdVideoLibrary />, title: 'Changing video aspect ratio and resolution', tag: null, meta: '2 min read' },
    { icon: <MdBook />, title: 'Exporting your finished video', tag: null, meta: '3 min read' },
  ],
  'AI Avatars': [
    { icon: <MdSmartToy />, title: 'Choosing and customizing an AI avatar', tag: null, meta: '5 min read' },
    { icon: <MdSmartToy />, title: 'Creating a custom avatar from your photo', tag: 'new', meta: '6 min read' },
    { icon: <MdSmartToy />, title: 'Avatar expressions and gestures', tag: null, meta: '4 min read' },
    { icon: <MdBook />, title: 'Supported avatar languages', tag: null, meta: '2 min read' },
  ],
  'Voice & Audio': [
    { icon: <MdRecordVoiceOver />, title: 'Cloning your voice for voiceovers', tag: null, meta: '4 min read' },
    { icon: <MdRecordVoiceOver />, title: 'Adding background music to your video', tag: null, meta: '3 min read' },
    { icon: <MdTune />, title: 'Adjusting audio levels and mixing', tag: null, meta: '4 min read' },
    { icon: <MdBook />, title: 'Supported audio file formats', tag: null, meta: '2 min read' },
  ],
  'Templates': [
    { icon: <MdDashboardCustomize />, title: 'Using a template to create a video', tag: null, meta: '3 min read' },
    { icon: <MdDashboardCustomize />, title: 'Customizing template colors and fonts', tag: null, meta: '4 min read' },
    { icon: <MdDashboardCustomize />, title: 'Saving your own video as a template', tag: 'new', meta: '3 min read' },
    { icon: <MdBook />, title: 'Template categories explained', tag: null, meta: '2 min read' },
  ],
  'Account & Billing': [
    { icon: <MdAccountCircle />, title: 'Managing your subscription plan', tag: null, meta: '3 min read' },
    { icon: <MdAccountCircle />, title: 'Understanding credits and how they work', tag: null, meta: '4 min read' },
    { icon: <MdGroups />, title: 'Inviting teammates to your workspace', tag: null, meta: '2 min read' },
    { icon: <MdAccountCircle />, title: 'Updating billing information', tag: null, meta: '2 min read' },
    { icon: <MdBook />, title: 'Cancelling or pausing your subscription', tag: null, meta: '3 min read' },
  ],
}

function Help() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const filtered = (list) =>
    search.trim()
      ? list.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            (a.meta && a.meta.toLowerCase().includes(search.toLowerCase()))
        )
      : list

  const filteredFaqs = search.trim()
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(search.toLowerCase()) ||
          f.a.toLowerCase().includes(search.toLowerCase())
      )
    : faqs

  const hasAnyResult =
    filtered(popularArticles).length > 0 ||
    filtered(gettingStartedArticles).length > 0 ||
    filteredFaqs.length > 0

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat)
    setSearch('')
    setOpenFaq(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCategoryBack = () => {
    setSelectedCategory(null)
  }

  return (
    <div className="help-page">
      {/* Hero Header */}
      <section className="help-hero">
        <div className="help-hero-content fade-in-up">
          <h1>How can we help?</h1>
          <p>Search our knowledge base, explore video tutorials, or contact our support team directly.</p>
          <div className="help-search-container">
            <div className="help-search-box">
              <MdSearch className="search-icon" />
              <input
                className="help-search-input"
                type="text"
                placeholder="Search for articles, guides or tutorials..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="help-container">
        {/* Stats Bar */}
        <div className="help-stats-bar fade-in-up delay-1">
          <div className="help-stat-chip"><MdBook /> 71 Articles</div>
          <div className="help-stat-chip"><MdVideoLibrary /> 12 Video Tutorials</div>
          <div className="help-stat-chip"><MdAutoAwesome /> Updated Weekly</div>
          <div className="help-stat-chip"><MdChatBubbleOutline /> Live Chat Support</div>
        </div>

        {/* Main Content Areas */}
        {!selectedCategory && !search && (
          <section style={{ marginTop: '80px' }} className="fade-in-up delay-2">
            <div className="help-section-header">
              <h2 className="help-section-title">Browse by Category</h2>
            </div>
            <div className="help-category-grid">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="help-category-card"
                  style={{ '--accent': cat.accent, '--icon-bg': cat.iconBg }}
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div className="help-category-icon-wrapper">{cat.icon}</div>
                  <h3 className="help-category-name">{cat.name}</h3>
                  <p className="help-category-desc">{cat.desc}</p>
                  <div className="help-category-footer">
                    <span>{cat.count} Articles</span>
                    <MdKeyboardArrowRight />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {search && !hasAnyResult && (
          <div className="help-no-results fade-in-up" style={{ textAlign: 'center', padding: '100px 0' }}>
            <MdSearch style={{ fontSize: 64, color: '#cbd5e1', marginBottom: 20 }} />
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>No results found</h2>
            <p style={{ color: '#64748b' }}>We couldn't find any articles matching "{search}". Try searching with different keywords.</p>
          </div>
        )}

        {/* Search Results / Popular Articles */}
        {(search || !selectedCategory) && (hasAnyResult || !search) && (
          <section style={{ marginTop: selectedCategory ? '0' : '40px' }} className="fade-in-up delay-3">
            <div className="help-articles-row">
              {filtered(popularArticles).length > 0 && (
                <div>
                  <h2 className="help-section-title" style={{ marginBottom: '24px' }}>
                    {search ? 'Matching Articles' : 'Popular Articles'}
                  </h2>
                  {filtered(popularArticles).map((a) => (
                    <div key={a.title} className="help-article-card">
                      <div className="help-article-icon">{a.icon}</div>
                      <div className="help-article-info">
                        <span className="help-article-title">{a.title}</span>
                        <span className="help-article-meta">{a.meta}</span>
                      </div>
                      {a.tag && (
                        <span className={`help-badge ${a.tag}`}>{a.tag}</span>
                      )}
                      <MdKeyboardArrowRight style={{ color: '#cbd5e1' }} />
                    </div>
                  ))}
                </div>
              )}

              {filtered(gettingStartedArticles).length > 0 && (
                <div>
                  <h2 className="help-section-title" style={{ marginBottom: '24px' }}>
                    {search ? 'Getting Started Guides' : 'Getting Started'}
                  </h2>
                  {filtered(gettingStartedArticles).map((a) => (
                    <div key={a.title} className="help-article-card">
                      <div className="help-article-icon">{a.icon}</div>
                      <div className="help-article-info">
                        <span className="help-article-title">{a.title}</span>
                        <span className="help-article-meta">{a.meta}</span>
                      </div>
                      {a.tag && <span className="help-badge new">New</span>}
                      <MdKeyboardArrowRight style={{ color: '#cbd5e1' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        {!selectedCategory && filteredFaqs.length > 0 && (
          <section className="fade-in-up delay-3">
            <h2 className="help-section-title" style={{ marginBottom: '32px' }}>Frequently Asked Questions</h2>
            <div className="help-faq-container">
              {filteredFaqs.map((faq, i) => (
                <div key={i} className={`help-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="help-faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    {faq.q}
                    <MdKeyboardArrowDown className="chevron" />
                  </button>
                  <div className="help-faq-answer-wrapper">
                    <div className="help-faq-answer">{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Video Tutorials */}
        {!selectedCategory && !search && (
          <section className="fade-in-up delay-3">
            <h2 className="help-section-title" style={{ marginBottom: '32px' }}>Video Tutorials</h2>
            <div className="help-video-grid">
              {videoTutorials.map((v) => (
                <div key={v.title} className="help-video-card">
                  <div className="help-video-thumb">
                    <img src={v.thumb} alt={v.title} />
                    <div className="help-video-overlay">
                      <div className="help-play-btn"><MdPlayCircleOutline /></div>
                    </div>
                  </div>
                  <div className="help-video-info">
                    <strong>{v.title}</strong>
                    <span>{v.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Category Detail View */}
        {selectedCategory && (
          <div className="fade-in-up">
            <button className="help-back-btn" onClick={handleCategoryBack}>
              <MdArrowBack /> Back to Help Center
            </button>
            <div
              className="help-cat-detail-header"
              style={{
                '--accent': selectedCategory.accent,
                '--icon-bg': selectedCategory.iconBg,
              }}
            >
              <div className="help-cat-header-icon">{selectedCategory.icon}</div>
              <div className="help-cat-header-info">
                <h2>{selectedCategory.name}</h2>
                <p>{selectedCategory.desc}</p>
              </div>
            </div>
            <div className="help-articles-list">
              {(categoryArticles[selectedCategory.name] || []).map((a) => (
                <div key={a.title} className="help-article-card" style={{ marginBottom: '16px' }}>
                  <div className="help-article-icon">{a.icon}</div>
                  <div className="help-article-info">
                    <span className="help-article-title">{a.title}</span>
                    <span className="help-article-meta">{a.meta}</span>
                  </div>
                  {a.tag && <span className={`help-badge ${a.tag}`}>{a.tag}</span>}
                  <MdKeyboardArrowRight style={{ color: '#cbd5e1' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support Options */}
        <section className="help-support-grid fade-in-up delay-3" style={{ marginTop: '80px' }}>
          <div className="help-support-card blue">
            <div className="help-support-icon"><MdChatBubbleOutline /></div>
            <h3>Live Chat Support</h3>
            <p>Connect with our expert team for real-time assistance. We typically respond in under 2 minutes.</p>
            <button className="help-support-btn">Start Chat</button>
          </div>
          <div className="help-support-card indigo">
            <div className="help-support-icon"><MdMail /></div>
            <h3>Email Support</h3>
            <p>Need specialized help? Send us an email and our team will get back to you within 24 hours.</p>
            <button className="help-support-btn">Send Email</button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Help
