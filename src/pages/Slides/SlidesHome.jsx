import { useMemo } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  MdAdd,
  MdAutoAwesome,
  MdArrowForward,
  MdLayers,
  MdImage,
  MdSlideshow,
} from 'react-icons/md'
import { Presentation, Image as ImageIcon } from 'lucide-react'
import '../Home/Home.css'
import './SlidesHome.css'

const FEATURE_CARDS = [
  {
    id: 'ppt-generator',
    title: 'PPT Generator',
    description: 'Generate presentation decks from a short brief.',
    badge: 'Decks',
    Icon: Presentation,
  },
  {
    id: 'image-generator',
    title: 'Image Generator',
    description: 'Create visuals and brand assets for your slides.',
    badge: 'Images',
    Icon: ImageIcon,
  },
]

function SlidesHome({ onNavigate, onCreate }) {
  const { user } = useAuth()
  const firstName = user?.name
    ? user.name.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'User'

  const stats = useMemo(
    () => [
      {
        id: 'decks',
        label: 'PPT Decks',
        value: '0',
        subtitle: 'Start your first presentation',
        trend: 'Ready to create',
        trendVariant: 'neutral',
        cta: 'Open PPT Generator',
        navigateTo: 'ppt-generator',
        icon: <MdSlideshow />,
      },
      {
        id: 'images',
        label: 'Generated Images',
        value: '—',
        subtitle: 'AI visuals for your slides',
        trend: 'Coming soon',
        trendVariant: 'neutral',
        cta: 'Open Image Generator',
        navigateTo: 'image-generator',
        icon: <MdImage />,
      },
    ],
    []
  )

  return (
    <div className="home-container slides-home">
      <div className="welcome-banner hero-redesign slides-home-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Welcome to Slides, {firstName}</h1>
            <p>Generate presentations and images for your decks in one workspace.</p>
            <div className="hero-chips">
              <span className="hero-chip">
                <MdLayers size={16} /> PPT Generator
              </span>
              <span className="hero-chip">
                <MdAutoAwesome size={16} /> Image Generator
              </span>
            </div>
          </div>
          <div className="hero-action">
            <button
              type="button"
              className="btn-create-hero"
              onClick={() => onCreate?.() || onNavigate?.('ppt-generator')}
            >
              <MdAdd className="btn-create-hero-icon" /> New presentation
            </button>
          </div>
        </div>
        <div className="hero-decoration hero-circle-1" />
        <div className="hero-decoration hero-circle-2" />
        <div className="hero-decoration hero-circle-3" />
      </div>

      <div className="home-billing-stats" role="list">
        {stats.map((stat) => (
          <button
            key={stat.id}
            type="button"
            className="home-billing-stat-card home-billing-stat-card--action"
            onClick={() => onNavigate?.(stat.navigateTo)}
            role="listitem"
            aria-label={`${stat.label}: ${stat.value}. ${stat.cta}`}
          >
            <span className="home-billing-stat-bubble home-billing-stat-bubble--1" aria-hidden />
            <span className="home-billing-stat-bubble home-billing-stat-bubble--2" aria-hidden />
            <span className="home-billing-stat-bubble home-billing-stat-bubble--3" aria-hidden />
            <div className="home-billing-stat-inner">
              <div className="home-billing-stat-top">
                <span className="home-billing-stat-label">{stat.label}</span>
                <span className="home-billing-stat-icon" aria-hidden>
                  {stat.icon}
                </span>
              </div>
              <div className="home-billing-stat-value">{stat.value}</div>
              <span className={`home-billing-stat-trend ${stat.trendVariant}`}>{stat.trend}</span>
              <div className="home-billing-stat-subtitle">{stat.subtitle}</div>
              <span className="home-billing-stat-cta">
                {stat.cta}
                <MdArrowForward size={16} aria-hidden />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="section-header slides-home-section-header">
        <h2>Tools</h2>
      </div>

      <div className="slides-feature-grid">
        {FEATURE_CARDS.map((card) => {
          const Icon = card.Icon
          return (
            <button
              key={card.id}
              type="button"
              className="slides-feature-card"
              onClick={() => onNavigate?.(card.id)}
              aria-label={`Open ${card.title}`}
            >
              <span className="slides-feature-card__icon" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </span>
              <span className="slides-feature-card__badge">{card.badge}</span>
              <strong className="slides-feature-card__title">{card.title}</strong>
              <p className="slides-feature-card__desc">{card.description}</p>
              <span className="slides-feature-card__cta">
                Open
                <MdArrowForward size={16} aria-hidden />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SlidesHome
