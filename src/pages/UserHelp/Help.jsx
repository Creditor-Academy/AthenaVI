import { useState, useEffect, useMemo } from 'react'
import {
  MdSearch,
  MdSmartToy,
  MdAccountBalanceWallet,
  MdBolt,
  MdMail,
  MdCloudUpload,
  MdClose,
  MdConfirmationNumber,
  MdSend,
  MdArrowBack,
  MdAdd,
  MdEdit,
  MdGroups,
  MdLightbulbOutline,
  MdPersonOutline,
  MdDescription,
  MdSupport,
} from 'react-icons/md'
import {
  helpCategories,
  helpArticles,
} from './helpContent.js'
import { useTheme, getContrastColor } from '../../contexts/ThemeContext.jsx'
import './Help.css'

/** Turn `**bold**` segments into <strong> — help copy is stored as lightweight markdown. */
function renderInlineMarkdown(text) {
  if (!text || !text.includes('**')) return text
  const parts = []
  const regex = /\*\*(.+?)\*\*/g
  let lastIndex = 0
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    parts.push(<strong key={`b-${match.index}`}>{match[1]}</strong>)
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  return parts.length ? parts : text
}

const topicIcons = {
  start: MdBolt,
  workspace: MdGroups,
  editor: MdEdit,
  assets: MdCloudUpload,
  presenters: MdSmartToy,
  billing: MdAccountBalanceWallet,
}

const helpTopics = helpCategories.filter((cat) => cat.id !== 'contact')

const POPULAR_ARTICLE_TITLES = [
  'Create your first video project',
  'Navigate the dashboard',
  'Team Videos / My Videos (exports tab)',
  'Export a final MP4',
  'Storage quota and footprint',
  'Personal vs workspace credits',
]

function buildPopularArticles() {
  const articles = []
  for (const [categoryId, list] of Object.entries(helpArticles)) {
    for (const article of list) {
      if (POPULAR_ARTICLE_TITLES.includes(article.title)) {
        articles.push({ ...article, categoryId })
      }
    }
  }
  return POPULAR_ARTICLE_TITLES
    .map((title) => articles.find((a) => a.title === title))
    .filter(Boolean)
}

const popularArticles = buildPopularArticles()

function Help({ embedded = false, onOpenBilling }) {
  const { theme, customPrimary } = useTheme()

  const heroTextColor = useMemo(() => {
    if (theme === 'custom') return getContrastColor(customPrimary)
    if (typeof window === 'undefined') return '#ffffff'
    const fromCss = getComputedStyle(document.documentElement)
      .getPropertyValue('--primary-contrast')
      .trim()
    return fromCss || '#ffffff'
  }, [theme, customPrimary])

  const [searchQuery, setSearchQuery] = useState('')
  const [activeTopic, setActiveTopic] = useState(null)
  const [activeArticle, setActiveArticle] = useState(null)
  const [showContact, setShowContact] = useState(false)

  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('athena_support_tickets')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (embedded) return undefined
    const previousMode = document.documentElement.getAttribute('data-mode')
    const previousClassName = document.documentElement.className
    document.documentElement.setAttribute('data-mode', 'light')
    document.documentElement.className = previousClassName.replace(/\bmode-[^\s]+\b/, 'mode-light')
    return () => {
      if (previousMode) document.documentElement.setAttribute('data-mode', previousMode)
      else document.documentElement.removeAttribute('data-mode')
      document.documentElement.className = previousClassName
    }
  }, [embedded])

  useEffect(() => {
    localStorage.setItem('athena_support_tickets', JSON.stringify(tickets))
  }, [tickets])

  const [activeTicket, setActiveTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('Technical')
  const [priority, setPriority] = useState('Medium')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const allArticles = Object.entries(helpArticles).flatMap(([catId, list]) =>
    list.map((article) => ({ ...article, categoryId: catId }))
  )

  const searchResults = searchQuery.trim()
    ? allArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.body.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  const topicCategory = helpTopics.find((t) => t.id === activeTopic)
  const topicArticles = activeTopic ? helpArticles[activeTopic] || [] : []

  const openArticle = (article) => {
    setActiveArticle(article)
    setShowContact(false)
    setSearchQuery('')
  }

  const openTopic = (topicId) => {
    setActiveTopic(topicId)
    setActiveArticle(null)
    setShowContact(false)
    setSearchQuery('')
  }

  const resetToHub = () => {
    setActiveTopic(null)
    setActiveArticle(null)
    setShowContact(false)
    setActiveTicket(null)
    setSearchQuery('')
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
        status: 'Draft',
        created: new Date().toISOString(),
        messages: [{ sender: 'user', text: description, time: new Date().toISOString() }],
      }
      setTickets([newTicket, ...tickets])
      setIsSubmitting(false)
      setShowCreateModal(false)
      setSubject('')
      setDescription('')
      setCategory('Technical')
      setPriority('Medium')
      setShowContact(true)
      setActiveTicket(newTicket)
    }, 600)
  }

  const handleReplyMessage = (e) => {
    e.preventDefault()
    if (!replyMessage.trim() || !activeTicket) return
    const newMessage = { sender: 'user', text: replyMessage, time: new Date().toISOString() }
    const updatedTicket = {
      ...activeTicket,
      messages: [...activeTicket.messages, newMessage],
      status: 'Draft',
    }
    setTickets((prev) => prev.map((t) => (t.id === activeTicket.id ? updatedTicket : t)))
    setActiveTicket(updatedTicket)
    setReplyMessage('')
  }

  const renderArticleBody = (body) =>
    body.split('\n').map((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return <br key={idx} />
      if (trimmed.startsWith('•')) {
        return (
          <p key={idx} className="help-article-bullet">
            {renderInlineMarkdown(trimmed.replace(/^•\s*/, ''))}
          </p>
        )
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <p key={idx} className="help-article-numbered">
            {renderInlineMarkdown(trimmed)}
          </p>
        )
      }
      return (
        <p key={idx} className="help-article-paragraph">
          {renderInlineMarkdown(trimmed)}
        </p>
      )
    })

  const renderArticleList = (articles, emptyMessage) => (
    <div className="help-article-list">
      {articles.length === 0 ? (
        <p className="help-empty-text">{emptyMessage}</p>
      ) : (
        articles.map((article, idx) => (
          <button
            key={`${article.title}-${idx}`}
            type="button"
            className="help-article-row"
            onClick={() => openArticle(article)}
          >
            <span className="help-article-row-title">{article.title}</span>
            <span className="help-article-row-meta">{article.readTime}</span>
          </button>
        ))
      )}
    </div>
  )

  const renderContactPanel = () => {
    if (activeTicket) {
      return (
        <div className="help-contact-panel">
          <button type="button" className="help-back-link" onClick={() => setActiveTicket(null)}>
            <MdArrowBack /> Back to support notes
          </button>
          <div className="help-ticket-header">
            <span className="help-ticket-id">#{activeTicket.id}</span>
            <span className="help-ticket-status">{activeTicket.status}</span>
            <h2>{activeTicket.subject}</h2>
            <p className="help-ticket-note">
              Saved locally in this browser. Email{' '}
              <a href="mailto:support@athenavi.com">support@athenavi.com</a> with the same details for a live response.
            </p>
          </div>
          <div className="help-ticket-thread">
            {activeTicket.messages.map((msg, midx) => (
              <div key={midx} className={`help-chat-bubble help-chat-bubble--${msg.sender}`}>
                <p>{msg.text}</p>
              </div>
            ))}
          </div>
          <form className="help-ticket-reply" onSubmit={handleReplyMessage}>
            <input
              type="text"
              placeholder="Add a note…"
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
            <button type="submit" aria-label="Save note">
              <MdSend />
            </button>
          </form>
        </div>
      )
    }

    return (
      <div className="help-contact-panel">
        <button type="button" className="help-back-link" onClick={resetToHub}>
          <MdArrowBack /> Back to help topics
        </button>
        <div className="help-contact-head">
          <div>
            <h2>Contact support</h2>
            <p>
              Draft a request here, then email{' '}
              <a href="mailto:support@athenavi.com">support@athenavi.com</a> with the same details.
            </p>
          </div>
          <button type="button" className="help-btn-primary" onClick={() => setShowCreateModal(true)}>
            <MdAdd /> New note
          </button>
        </div>
        {tickets.length === 0 ? (
          <div className="help-contact-empty">
            <MdConfirmationNumber size={40} />
            <h3>No support notes yet</h3>
            <p>Create a draft to track what you send to the team.</p>
          </div>
        ) : (
          <div className="help-ticket-list">
            {tickets.map((t) => (
              <button
                key={t.id}
                type="button"
                className="help-ticket-card"
                onClick={() => setActiveTicket(t)}
              >
                <span className="help-ticket-id">#{t.id}</span>
                <strong>{t.subject}</strong>
                <p>{t.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderMainContent = () => {
    if (activeArticle) {
      return (
        <div className="help-main-panel">
          <button
            type="button"
            className="help-back-link"
            onClick={() => {
              setActiveArticle(null)
              if (!activeTopic) setShowContact(false)
            }}
          >
            <MdArrowBack /> Back
          </button>
          <article className="help-article-view">
            <h1>{activeArticle.title}</h1>
            <div className="help-article-meta">
              <span className="help-tag">{activeArticle.tag}</span>
              <span>{activeArticle.readTime} read</span>
            </div>
            <div className="help-article-body">{renderArticleBody(activeArticle.body)}</div>
          </article>
        </div>
      )
    }

    if (showContact) {
      return <div className="help-main-panel">{renderContactPanel()}</div>
    }

    if (searchQuery.trim()) {
      return (
        <div className="help-main-panel">
          <h2 className="help-section-title">Search results</h2>
          <p className="help-section-subtitle">
            {searchResults.length} guide{searchResults.length === 1 ? '' : 's'} matching &ldquo;{searchQuery}&rdquo;
          </p>
          {renderArticleList(searchResults, 'No guides match your search. Try different keywords.')}
        </div>
      )
    }

    if (activeTopic) {
      return (
        <div className="help-main-panel">
          <button type="button" className="help-back-link" onClick={() => setActiveTopic(null)}>
            <MdArrowBack /> All help topics
          </button>
          <h2 className="help-section-title">{topicCategory?.label}</h2>
          <p className="help-section-subtitle">{topicCategory?.subtitle}</p>
          {renderArticleList(topicArticles, 'No articles in this topic yet.')}
        </div>
      )
    }

    return (
      <div className="help-main-panel">
        <h2 className="help-section-title">Help Topics</h2>
        <div className="help-topics-grid">
          {helpTopics.map((topic) => {
            const Icon = topicIcons[topic.id] || MdBolt
            return (
              <button
                key={topic.id}
                type="button"
                className="help-topic-card"
                onClick={() => openTopic(topic.id)}
              >
                <span className="help-topic-icon">
                  <Icon size={22} />
                </span>
                <span className="help-topic-text">
                  <strong>{topic.label}</strong>
                  <span>{topic.subtitle}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className={`help-center${embedded ? ' help-center--embedded' : ''}`}>
      <section className="help-hero" style={{ color: heroTextColor }}>
        <div className="help-hero-decor" aria-hidden>
          <MdLightbulbOutline className="help-hero-decor-icon help-hero-decor-icon--1" />
          <MdPersonOutline className="help-hero-decor-icon help-hero-decor-icon--2" />
          <MdDescription className="help-hero-decor-icon help-hero-decor-icon--3" />
          <MdSupport className="help-hero-decor-icon help-hero-decor-icon--4" />
        </div>
        <div className="help-hero-inner">
          <h1>How can we help?</h1>
          <div className="help-hero-search">
            <MdSearch className="help-hero-search-icon" />
            <input
              type="search"
              placeholder="Search the knowledge base"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setActiveArticle(null)
                setShowContact(false)
                setActiveTopic(null)
              }}
            />
          </div>
        </div>
      </section>

      <div className="help-body">
        <div className="help-body-main">{renderMainContent()}</div>

        <aside className="help-sidebar">
          <div className="help-sidebar-card">
            <h3>Popular Articles</h3>
            <ul className="help-popular-list">
              {popularArticles.map((article) => (
                <li key={article.title}>
                  <button type="button" onClick={() => openArticle(article)}>
                    {article.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="help-sidebar-card help-sidebar-card--cta">
            <h3>Need Support?</h3>
            <p>Can&apos;t find the answer you&apos;re looking for? Don&apos;t worry — we&apos;re here to help.</p>
            <button
              type="button"
              className="help-btn-primary help-btn-primary--block"
              onClick={() => {
                setShowContact(true)
                setActiveArticle(null)
                setActiveTopic(null)
                setSearchQuery('')
              }}
            >
              Contact Support
            </button>
            <button
              type="button"
              className="help-link-btn"
              onClick={() => window.location.href = 'mailto:support@athenavi.com?subject=AthenaVI%20Support%20Request'}
            >
              <MdMail size={16} /> Email support@athenavi.com
            </button>
            {onOpenBilling && (
              <button type="button" className="help-link-btn" onClick={onOpenBilling}>
                <MdAccountBalanceWallet size={16} /> Billing &amp; storage
              </button>
            )}
          </div>
        </aside>
      </div>

      {showCreateModal && (
        <div className="help-modal-backdrop" onClick={() => setShowCreateModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="help-modal-close" onClick={() => setShowCreateModal(false)}>
              <MdClose />
            </button>
            <h2>Draft support note</h2>
            <p className="help-modal-subtitle">
              Saved in this browser only. Copy the details into an email to support@athenavi.com.
            </p>
            <form onSubmit={handleCreateTicket} className="help-modal-form">
              <label>
                Subject
                <input
                  type="text"
                  placeholder="Brief summary"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </label>
              <div className="help-modal-row">
                <label>
                  Category
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="Technical">Technical</option>
                    <option value="Billing">Billing</option>
                    <option value="Storage">Storage</option>
                    <option value="General">General</option>
                  </select>
                </label>
                <label>
                  Priority
                  <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
              </div>
              <label>
                Details
                <textarea
                  placeholder="Workspace, project, steps to reproduce…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </label>
              <button type="submit" className="help-btn-primary help-btn-primary--block" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Help
