import React, { useState, useCallback } from 'react'
import { 
  MdArrowBack, 
  MdPlayCircleFilled, 
  MdMonitor, 
  MdPhoneIphone, 
  MdLayers, 
  MdAccessTime,
  MdCheckCircle,
  MdBookmarkBorder,
  MdClose,
  MdChevronLeft,
  MdChevronRight,
  MdGridView,
  MdVisibility
} from 'react-icons/md'
import TemplateScenePreview from '../../components/features/editor/editor/TemplateScenePreview'
import './TemplateDetails.css'

const fallbackSlideData = [
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

/* ------------------------------------------------------------------ */
/*  Scene Viewer Modal                                                 */
/* ------------------------------------------------------------------ */
function SceneViewerModal({ scenes, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex || 0)
  const scene = scenes[currentIndex]

  const goNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, scenes.length - 1))
  }, [scenes.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0))
  }, [])

  return (
    <div className="scene-viewer-overlay" onClick={onClose}>
      <div className="scene-viewer-modal" onClick={e => e.stopPropagation()}>
        <div className="scene-viewer-header">
          <div className="scene-viewer-title">
            <MdGridView size={20} />
            <span>Scene {currentIndex + 1} of {scenes.length}</span>
            {scene?.title && <span className="scene-viewer-scene-name">— {scene.title}</span>}
          </div>
          <button className="scene-viewer-close" onClick={onClose}>
            <MdClose size={22} />
          </button>
        </div>

        <div className="scene-viewer-body">
          <button
            className="scene-viewer-nav scene-viewer-nav--prev"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <MdChevronLeft size={32} />
          </button>

          <div className="scene-viewer-canvas-area">
            <div className="scene-viewer-canvas">
              {scene?.scene ? (
                <TemplateScenePreview template={scene.scene} />
              ) : scene?.thumb ? (
                <img src={scene.thumb} alt={scene.title || `Scene ${currentIndex + 1}`} className="scene-viewer-img" />
              ) : (
                <div className="scene-viewer-placeholder">
                  <MdLayers size={48} />
                  <span>No preview available</span>
                </div>
              )}
            </div>
            {scene?.description && (
              <p className="scene-viewer-description">{scene.description}</p>
            )}
            {scene?.tags?.length > 0 && (
              <div className="scene-viewer-tags">
                {scene.tags.map(tag => (
                  <span key={tag} className="slide-tag">{tag}</span>
                ))}
              </div>
            )}
          </div>

          <button
            className="scene-viewer-nav scene-viewer-nav--next"
            onClick={goNext}
            disabled={currentIndex === scenes.length - 1}
          >
            <MdChevronRight size={32} />
          </button>
        </div>

        {/* Thumbnail strip */}
        <div className="scene-viewer-strip">
          {scenes.map((s, idx) => (
            <button
              key={s.id || idx}
              className={`scene-strip-thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            >
              {s.scene ? (
                <div className="strip-thumb-canvas">
                  <TemplateScenePreview template={s.scene} compact />
                </div>
              ) : s.thumb ? (
                <img src={s.thumb} alt={`Scene ${idx + 1}`} />
              ) : (
                <div className="strip-thumb-empty">
                  <span>{idx + 1}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main TemplateDetails Component                                     */
/* ------------------------------------------------------------------ */
function TemplateDetails({ template, onBack, onUse }) {
  const [showSceneViewer, setShowSceneViewer] = useState(false)
  const [sceneViewerIndex, setSceneViewerIndex] = useState(0)

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

  const slideData = activeTemplate.sceneList?.length
    ? activeTemplate.sceneList
    : fallbackSlideData

  const handleUseTemplate = useCallback(() => {
    if (onUse) {
      onUse()
    }
  }, [onUse])

  const openSceneViewer = useCallback((index = 0) => {
    setSceneViewerIndex(index)
    setShowSceneViewer(true)
  }, [])

  return (
    <div className="template-details-page">
      <nav className="details-top-nav">
        <button className="btn-back-library" onClick={onBack}>
          <MdArrowBack /> Back to Library
        </button>
        <div className="details-main-actions">
          <button className="icon-btn" title="Save to Favorites"><MdBookmarkBorder /></button>
          <button className="btn-use-now" onClick={handleUseTemplate}>
            <MdPlayCircleFilled size={18} />
            Use This Template
          </button>
        </div>
      </nav>

      <section className="template-feature-head">
        <div className="feature-preview-container">
          {activeTemplate.coverScene || activeTemplate.selectedScene ? (
            <div className="feature-preview-canvas">
              <TemplateScenePreview template={activeTemplate.selectedScene || activeTemplate.coverScene} />
            </div>
          ) : activeTemplate.thumb ? (
            <img src={activeTemplate.thumb} alt="Feature" className="feature-img" />
          ) : (
            <div className="feature-preview-canvas feature-preview-canvas--empty">
              <MdLayers size={56} />
              <span>No preview</span>
            </div>
          )}
          <div className="feature-play-overlay">
            <MdPlayCircleFilled size={72} />
          </div>
        </div>

        <div className="feature-info-pane">
          {activeTemplate.tag && (
            <span className="feature-badge">{activeTemplate.tag}</span>
          )}
          <h1>{activeTemplate.name}</h1>
          <p className="feature-description">{activeTemplate.description}</p>
          
          <div className="quick-stats-grid">
            <div className="q-stat-card">
              <div className="q-stat-label">Duration</div>
              <div className="q-stat-val"><MdAccessTime /> {activeTemplate.duration || '—'}</div>
            </div>
            <div className="q-stat-card">
              <div className="q-stat-label">Slides</div>
              <div className="q-stat-val"><MdLayers /> {activeTemplate.scenes || slideData.length} Scenes</div>
            </div>
            <div className="q-stat-card">
              <div className="q-stat-label">Aspect Ratio</div>
              <div className="q-stat-val">
                {activeTemplate.ratio === '16:9' ? <MdMonitor /> : <MdPhoneIphone />}
                {activeTemplate.ratio || '16:9'}
              </div>
            </div>
          </div>

          <div className="feature-perks">
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> Licensed for Commercial Use</div>
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> Fully Customizable Colors</div>
            <div className="perk-item"><MdCheckCircle className="green" size={18}/> AI Avatar Pre-integrated</div>
          </div>

          <button className="btn-view-scenes" onClick={() => openSceneViewer(0)}>
            <MdVisibility size={18} />
            View All Scenes ({activeTemplate.scenes || slideData.length})
          </button>
        </div>
      </section>

      <section className="template-slides-breakdown">
        <div className="section-head">
          <h2>Scene Breakdown</h2>
          <p>This template consists of {activeTemplate.scenes || slideData.length} unique scenes designed for professional content flow.</p>
        </div>

        <div className="slides-list">
          {slideData.map((slide, index) => (
            <div
              key={slide.id || index}
              className="slide-item-entry"
              onClick={() => openSceneViewer(index)}
            >
              <div className="slide-thumb-box">
                {slide.scene ? (
                  <div className="slide-thumb-canvas">
                    <TemplateScenePreview template={slide.scene} compact />
                  </div>
                ) : slide.thumb ? (
                  <img src={slide.thumb} alt={`Slide ${index + 1}`} className="slide-thumb" />
                ) : (
                  <div className="slide-thumb-canvas slide-thumb-canvas--empty">
                    <MdLayers size={32} />
                  </div>
                )}
                <div className="slide-thumb-hover">
                  <MdVisibility size={24} />
                  <span>Preview</span>
                </div>
              </div>
              <div className="slide-content-entry">
                <span className="slide-num">Scene {index + 1}</span>
                <h3>{slide.title}</h3>
                <p>{slide.description}</p>
                {slide.tags?.length > 0 && (
                  <div className="tag-cloud">
                    {slide.tags.map(tag => (
                      <span key={tag} className="slide-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="cta-block-bottom">
          <div className="cta-content">
            <h2>Ready to start?</h2>
            <p>Customize this template with your own avatar and voice in seconds.</p>
          </div>
          <button className="btn-use-large" onClick={handleUseTemplate}>
            <MdPlayCircleFilled size={22} />
            Create Video with this Template
          </button>
        </div>
      </section>

      {showSceneViewer && (
        <SceneViewerModal
          scenes={slideData}
          initialIndex={sceneViewerIndex}
          onClose={() => setShowSceneViewer(false)}
        />
      )}
    </div>
  )
}

export default TemplateDetails
