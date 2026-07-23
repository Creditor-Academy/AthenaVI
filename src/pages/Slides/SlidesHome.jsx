import { useAuth } from '../../contexts/AuthContext'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { SLIDES_TOOL_CARDS } from '../../constants/slidesNav'
import aiPptIcon from '../../assets/slides_icons/ai_ppt_icon.png'
import pptBuilderIcon from '../../assets/slides_icons/ppt_builder_icon.png'
import aiImageIcon from '../../assets/slides_icons/ai_image_icon.png'
import imageEditorIcon from '../../assets/slides_icons/image_editor_icon.png'
import temp1 from '../../assets/Template_Image/gen_temp1.png'
import temp2 from '../../assets/Template_Image/gen_temp2.png'
import temp3 from '../../assets/Template_Image/gen_temp3.png'
import temp4 from '../../assets/Template_Image/gen_temp4.png'
import './SlidesHome.css'

const iconMap = {
  'ppt-ai': aiPptIcon,
  'ppt-builder': pptBuilderIcon,
  'image-ai': aiImageIcon,
  'image-editor': imageEditorIcon,
}

const TEMPLATES = [
  { id: 1, title: 'Corporate Pitch Deck', category: 'Business', image: temp1 },
  { id: 2, title: 'Marketing Campaign', category: 'Marketing', image: temp2 },
  { id: 3, title: 'Social Media Strategy', category: 'Social', image: temp3 },
  { id: 4, title: 'Personal Portfolio', category: 'Personal', image: temp4 },
]

function Sparkle({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0L13.8 8.2L22 10L13.8 11.8L12 20L10.2 11.8L2 10L10.2 8.2L12 0Z" />
    </svg>
  )
}

function SlidesHome({ onNavigate, onCreate }) {
  const { user } = useAuth()
  const firstName = user?.name
    ? user.name.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'Creator'

  return (
    <div className="slides-home-fun">
      <div className="slides-home-grid" aria-hidden="true"></div>
      <Sparkle className="slides-home-fun__spark slides-home-fun__spark--1" />
      <Sparkle className="slides-home-fun__spark slides-home-fun__spark--2" />
      <Sparkle className="slides-home-fun__spark slides-home-fun__spark--3" />
      <Sparkle className="slides-home-fun__spark slides-home-fun__spark--4" />

      <header className="slides-home-hero slides-home-hero--amazing">
        <div className="slides-home-topbar">
          <h2 className="slides-home-greeting">Welcome back, {firstName}</h2>
        </div>
        
        <h1 className="slides-home-hero__title">
          <span className="slides-home-hero__line">
            Level Up Your <span className="slides-home-hero__gradient-text">Design</span>
          </span>
          <span className="slides-home-hero__line">
            <span className="slides-home-hero__inline-pill" aria-hidden="true">
              <ArrowRight size={24} strokeWidth={2.5} />
            </span>
            With AI Magic
          </span>
        </h1>
        
        <p className="slides-home-hero__subtitle">
          Transform your ideas into stunning presentations and visuals in seconds.
        </p>
      </header>

      <section className="slides-home-bento" aria-label="Creation tools">
        {SLIDES_TOOL_CARDS.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`slides-tool-card slides-tool-card--${card.accent}`}
            onClick={() => onNavigate?.(card.id)}
            aria-label={`Open ${card.title}`}
          >
            <div className="slides-tool-card__glass"></div>
            <img 
              src={iconMap[card.id] || aiPptIcon} 
              alt="" 
              className="slides-tool-card__image" 
              aria-hidden="true" 
            />
            <span className="slides-tool-card__copy">
              <strong>{card.title}</strong>
              <span>{card.subtitle}</span>
            </span>
          </button>
        ))}
      </section>

      <div className="slides-home-templates-wrapper">
        <svg className="slides-wave slides-wave--top" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,0L0,0Z"></path>
        </svg>

        <section className="slides-home-templates" aria-labelledby="templates-heading">
          <div className="slides-home-templates__header">
            <h2 id="templates-heading" className="slides-home-templates__title">Trending Templates</h2>
            <button className="slides-home-templates__view-all">View all</button>
          </div>
          
          <div className="slides-home-templates__grid">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="slides-template-card"
                onClick={() => onNavigate?.('ppt-builder')}
                aria-label={`Use ${template.title} template`}
              >
                <div className="slides-template-card__image-container">
                  <img src={template.image} alt={template.title} className="slides-template-card__image" />
                  <div className="slides-template-card__overlay">
                    <span>Use Template</span>
                  </div>
                </div>
                <div className="slides-template-card__info">
                  <h3>{template.title}</h3>
                  <span>{template.category}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <svg className="slides-wave slides-wave--bottom" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
          <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,0L0,0Z"></path>
        </svg>
      </div>
    </div>
  )
}

export default SlidesHome
