import React from 'react'
import { 
  MdArrowBack, 
  MdPlayCircleFilled, 
  MdMonitor, 
  MdPhoneIphone, 
  MdLayers, 
  MdAccessTime,
  MdCheckCircle,
  MdContentCopy,
  MdBookmarkBorder
} from 'react-icons/md'
import './TemplateDetails.css'

const slideData = [
  {
    id: 1,
    title: 'Intro & Hook',
    description: 'A punchy opening to grab attention. Features a large title overlay and an avatar positioned to the left for immediate engagement.',
    tags: ['Avatar', 'Text Overlay', 'Motion'],
    thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 2,
    title: 'Value Proposition',
    description: 'A clean 3-point list layout to explain the core benefits. The avatar shrinks and moves to the bottom corner to prioritize the content.',
    tags: ['Bullet Points', 'Corner Avatar'],
    thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 3,
    title: 'Deep Dive / Demo',
    description: 'Full-screen media placeholder for screen recordings or high-res images. Includes space for detailed captions at the bottom.',
    tags: ['Full Screen Media', 'Captions'],
    thumb: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 4,
    title: 'Q&A or FAQ',
    description: 'An interactive-looking slide for handling common queries. Uses alternating background shades to separate questions.',
    tags: ['Interactivity', 'Text-Heavy'],
    thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 5,
    title: 'Conclusion & CTA',
    description: 'The final wrap-up. Prominent display for website URLs and social handles with a clear "Thank You" message.',
    tags: ['CTA', 'Social Media', 'Closing'],
    thumb: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=400'
  }
]

function TemplateDetails({ template, onBack, onUse }) {
  // If no template is passed, use a default one for demonstration
  const activeTemplate = template || {
    name: 'Corporate Onboarding Pro',
    category: 'Business',
    tag: 'BUSINESS',
    duration: '2:15',
    scenes: 8,
    ratio: '16:9',
    description: 'A premium, high-fidelity template designed for onboarding and corporate communications. This layout maximizes clarity and professional branding.',
    thumb: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=1200'
  }

  return (
    <div className="template-details-page">
      <nav className="details-top-nav">
        <button className="btn-back-library" onClick={onBack}>
          <MdArrowBack /> Back to Library
        </button>
        <div className="details-main-actions">
          <button className="icon-btn" title="Save to Favorites"><MdBookmarkBorder /></button>
          <button className="btn-use-now" onClick={onUse}>Use This Template</button>
        </div>
      </nav>

      <section className="template-feature-head">
        <div className="feature-preview-container">
          <img src={activeTemplate.thumb} alt="Feature" className="feature-img" />
          <div className="feature-play-overlay">
            <MdPlayCircleFilled size={72} />
          </div>
        </div>

        <div className="feature-info-pane">
          <span className="feature-badge">{activeTemplate.tag}</span>
          <h1>{activeTemplate.name}</h1>
          <p className="feature-description">{activeTemplate.description}</p>
          
          <div className="quick-stats-grid">
            <div className="q-stat-card">
              <div className="q-stat-label">Duration</div>
              <div className="q-stat-val"><MdAccessTime /> {activeTemplate.duration}</div>
            </div>
            <div className="q-stat-card">
              <div className="q-stat-label">Slides</div>
              <div className="q-stat-val"><MdLayers /> {activeTemplate.scenes} Scenes</div>
            </div>
            <div className="q-stat-card">
              <div className="q-stat-label">Aspect Ratio</div>
              <div className="q-stat-val">
                {activeTemplate.ratio === '16:9' ? <MdMonitor /> : <MdPhoneIphone />}
                {activeTemplate.ratio}
              </div>
            </div>
          </div>

          <div className="feature-perks">
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> Licensed for Commercial Use</div>
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> Fully Customizable Colors</div>
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> AI Avatar Pre-integrated</div>
          </div>
        </div>
      </section>

      <section className="template-slides-breakdown">
        <div className="section-head">
          <h2>Scene Breakdown</h2>
          <p>This template consists of {activeTemplate.scenes} unique scenes designed for professional content flow.</p>
        </div>

        <div className="slides-list">
          {slideData.map((slide, index) => (
            <div key={slide.id} className="slide-item-entry">
              <div className="slide-thumb-box">
                <img src={slide.thumb} alt={`Slide ${index + 1}`} className="slide-thumb" />
              </div>
              <div className="slide-content-entry">
                <span className="slide-num">Slide {index + 1}</span>
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
                <div className="tag-cloud">
                  {slide.tags.map(tag => (
                    <span key={tag} className="slide-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cta-block-bottom">
          <div className="cta-content">
            <h2>Ready to start?</h2>
            <p>Customize this template with your own avatar and voice in seconds.</p>
          </div>
          <button className="btn-use-large" onClick={onUse}>Create Video with this Template</button>
        </div>
      </section>
    </div>
  )
}

export default TemplateDetails
